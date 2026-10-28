import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  cellValue,
  clampBlankRows,
  clampFont,
  clampWatermark,
  columnCount,
  defaultNumberSheetSettings,
  fieldPercents,
  paperSize,
  resolveFields,
  rowHeightMm,
  signText,
  sortRows,
  titleText,
  toBn,
  toLogoSrc,
} from '../../../../Data/numberSheetColumns';

// =============================================================================
// নম্বর পত্র ও স্বাক্ষরপত্র — একটাই কাগজ
//
// ⭐ আগে চারটা আলাদা ফাইল ছিল
//
//    BanglaNumberWithTwoColumn   → নামসহ, A4, দুই কলাম
//    BanglaWithOutNameColumn     → নাম ছাড়া, A4, দুই কলাম
//    ExamReportFive              → ভর্তি সিরিয়াল, A5, দুই কলাম
//    SingatureSheetNS            → স্বাক্ষরপত্র, A4, এক কলাম
//
//    চারটাই আসলে একই জিনিস — একই শিক্ষার্থীর তালিকা, শুধু কাগজের মাপ,
//    কলামের সংখ্যা আর কোন ঘরগুলো বসবে তাতে তফাত। তাই চারটার বদলে এখন
//    একটাই কাগজ, আর ওই তিনটা তফাত সেটিংস থেকে আসে।
//
//    কোনো ঘর হারায়নি: আগের চারটার সব ঘরই সেটিংসে আছে। স্বাক্ষর, মাসিক
//    নম্বর আর মোট নম্বরের ঘর চালু করলেই কাগজটা স্বাক্ষরপত্র হয়ে যায়।
//
// ⭐ পাতা ভাগ — মাপজোক করে, আন্দাজে নয়
//
//    আগের ফাইলগুলোয় ROWS_PER_COLUMN = ২৬ বাঁধা ছিল। A5 লম্বালম্বির জন্য
//    ওটা ঠিক ছিল, কিন্তু কাগজ বা লেখার আকার বদলালেই হয় পাতার নিচে বড়
//    ফাঁকা পড়ে থাকত, নয়তো সারি উপচে কেটে যেত।
//
//    এখন আড়ালের একটা নমুনা থেকে মাথা, ছকের মাথা আর একটা সারির আসল উচ্চতা
//    মেপে নিয়ে হিসাব হয় — কাগজ, দিক, কলাম, লেখার আকার যাই হোক, পাতায়
//    যতগুলো ধরে ঠিক ততগুলোই বসে।
//
// src/view/exam/ExamReportPdf/numberLetter/NumberSheetPaper.jsx
// =============================================================================

// মাপজোকে একটু ছাড় — সীমানার একদম গায়ে গিয়ে ঠেকলে ব্রাউজারভেদে
// শেষ সারিটা পরের পাতায় চলে যেতে পারে
const SAFETY = 6;      // px
const COL_GAP = 5;     // mm — দুই কলামের মাঝের ফাঁক
const MM = 96 / 25.4;  // ১mm কত px (৯৬dpi)

const RULE = '#1f2937';
const HEAD_BG = '#f1f5f9';

/** নাম মেলানোর জন্য — ফাঁকা জায়গা আর ছোট-বড় হাতের তফাত ধরি না */
const sameName = (a, b) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

/**
 * বাছাই করা কিতাবের শিক্ষকের নাম।
 *
 * কিতাবটা চেনা যায় শুধু নাম ধরে, কারণ কাগজ আইডি পায় না। তাই তিন
 * ভাষার নামেই মিলিয়ে দেখা হয় — বাংলা, আরবি আর ইংরেজি। নাম না মিললে
 * ফাঁকা, তখন ঘরটা হাতে লেখার দাগ হয়েই থাকে।
 */
const findSubjectTeacher = (subjects, kitabName) => {
  if (!Array.isArray(subjects) || !String(kitabName ?? '').trim()) return '';

  const hit = subjects.find(
    (sub) =>
      sameName(sub?.SubjectName, kitabName) ||
      sameName(sub?.SubjectNameAra, kitabName) ||
      sameName(sub?.SubjectNameEng, kitabName)
  );

  return String(hit?.TeacherName ?? '').trim();
};

const NumberSheetPaper = ({
  reportData,
  header,
  settings,
  subClassName = '',
  kitabName = '',

  /* ⭐ পরীক্ষকের নাম — বাছাই করা কিতাবের শিক্ষক।

     রুট এখন প্রতিটা কিতাবের সাথে TeacherName পাঠায় (Academic_Subject এ
     যে শিক্ষক বরাদ্দ)। সেটা এখানে এলে ঘরটা ভরা ছাপা হয়, না এলে আগের
     মতোই ফাঁকা দাগ — হাতে লেখার জন্য। */
  examinerName = '',

  instituteLogo = '',

  /* ⭐ জলছাপের ছবি — কাগজের মাঝখানে হালকা হয়ে বসে।

     না দিলে প্রতিষ্ঠানের লোগোটাই জলছাপ হয়ে বসে। আলাদা ছবি (Document
     Settings এ বসানো জলছাপের লোগো) চাইলে এখানে সেটা পাঠালেই হয়:
     watermarkLogo={documentLogo} */
  watermarkLogo = '',

  /* ⭐ শিরোনাম বদলানোর হাত।

     দিলে কাগজের পট্টিটাই লেখার ঘর হয়ে যায় — পর্দায় ওখানে চাপ দিয়েই নাম
     লেখা যায়। না দিলে পট্টিটা আগের মতোই শুধু লেখা, বদলানো যায় না। */
  onTitleChange = null,
}) => {
  const cfg = settings || defaultNumberSheetSettings();

  const page = paperSize(cfg);
  const cols = columnCount(cfg.columns);
  const font = clampFont(cfg.fontSize);

  /* ⭐ সারির উচ্চতা — ভরা আর ফাঁকা, দুই রকম সারিই সমান উঁচু।

     আগে উচ্চতাটা আসত ভেতরের লেখা থেকে। তাই যে সারিতে কিছু লেখা নেই
     সেটা শুধু প্যাডিং সমান হয়ে চ্যাপ্টা হয়ে যেত — হাতে কিছু লেখার
     জায়গাই থাকত না। এখন মাপটা প্রতিটা ঘরে বসানো, তাই ফাঁকা সারিও
     ভরা সারির মতোই দেখায়। */
  const rowH = rowHeightMm(cfg);

  // নাম ও চওড়া মিলিয়ে — সেটিংসে যা দেখা যায় কাগজেও ঠিক তাই
  const fields = useMemo(() => resolveFields(cfg), [cfg]);
  const widths = useMemo(() => fieldPercents(fields), [fields]);

  /* ---- সারিগুলো, সেটিংসের ক্রমে সাজিয়ে */
  const rows = useMemo(() => {
    const list = Array.isArray(reportData) ? reportData : reportData?.data ?? [];
    return sortRows(list, cfg.sortBy, cfg.sortOrder);
  }, [reportData, cfg.sortBy, cfg.sortOrder]);

  const first = rows[0] || {};

  /* ⭐ ছাপার সারি = শিক্ষার্থীরা + শেষে চাওয়া ফাঁকা সারিগুলো।

     আগে কলামটা ভরানোর জন্য বাকি জায়গাটুকু ফাঁকা সারি দিয়ে ভরা হত, তাই
     তিনজনের কাগজেও পঁচিশটা খালি ঘর ছাপা হত। এখন যতজন ততটুকুই ছক — আর
     হাতে নাম তোলার জন্য ফাঁকা সারি লাগলে সেটিংসে সংখ্যাটা বসালেই হয়। */
  const printRows = useMemo(() => {
    const blanks = clampBlankRows(cfg.blankRows);
    return blanks > 0 ? [...rows, ...Array.from({ length: blanks }, () => null)] : rows;
  }, [rows, cfg.blankRows]);

  /* ---- কাগজের মাথার তথ্য — header প্রপ আগে, না পেলে প্রথম সারি।
         কোনোটাই না থাকলে ঘরটা ফাঁকা যায়, ডেমো লেখা নয়। */
  const info = useMemo(() => {
    const contactRaw = header?.ContactNumber || first.ContactNumber || '';

    return {
      institutionName: header?.InstitutionName || first.InstitutionName || '',
      address: header?.Address || first.Address || '',
      // ফোন নম্বর একাধিক হলে '#' দিয়ে আলাদা থাকে — প্রথমটাই যথেষ্ট
      contact: String(contactRaw).split('#')[0].trim(),
      examName: header?.ExamName || first.ExamName || '',
      sessionName: header?.SessionName || first.SessionName || '',
      sessionAraName: header?.SessionAraName || first.SessionAraName || '',
      subClassName:
        subClassName || header?.SubClass || first.SubClassName || first.SubClass || '',
      kitabName,

      /* ⭐ পরীক্ষকের নাম — বাছাই করা কিতাবের শিক্ষক।
       *
       * প্রপে নাম এলে সেটাই। না এলে রুটের পাঠানো কিতাবের তালিকা থেকে
       * নিজেই খুঁজে নেওয়া হয় — কাগজ তো কিতাবের নামটা জানেই, আর তালিকার
       * প্রতিটা সারিতে এখন TeacherName বসানো থাকে।
       *
       * এভাবে পাতার কোডে (ExamReportList) কিছু যোগ না করেই ঘরটা ভরে। */
      examinerName:
        String(examinerName ?? '').trim() ||
        findSubjectTeacher(header?.Subjects, kitabName),

      /* ⭐ প্রতিষ্ঠানের লোগো — কাগজের মাথায়, বাঁ পাশে।
       *
       * নামটা InstitutionLogo। রুটের loadReportHeader() এ
       * `InstitutionLogo: inst.Logo` বসানো আছে, তাই header এ ওই নামেই
       * আসে। আগে এখানে শুধু header?.Logo খোঁজা হত — নাম না মেলায়
       * লোগোটা কখনো পাওয়াই যেত না।
       *
       * প্রপে আসা ছবিটাও toLogoSrc দিয়ে বের করা হয়। ওটা কোথাও
       * base64 ডাটা URL, কোথাও শুধু ফাইলের নাম — শেষেরটা সরাসরি
       * <img src> এ বসালে ব্রাউজার চলতি পাতার ঠিকানা ধরে খুঁজত আর
       * ভাঙা ছবি দেখাত। toLogoSrc সামনে সার্ভারের ঠিকানা বসিয়ে দেয়।
       *
       * সারিতেও লোগোটা থাকতে পারে (...header প্রতিটা সারিতে ছড়ায়),
       * তাই সেটাও শেষ ভরসা হিসেবে দেখা হয়। */
      logo:
        toLogoSrc(header?.InstitutionLogo) ||
        toLogoSrc(header?.Logo) ||
        toLogoSrc(instituteLogo) ||
        toLogoSrc(first.InstitutionLogo) ||
        toLogoSrc(first.Logo),

      /* জলছাপের ছবি — আলাদা করে দিলে সেটাই, নইলে উপরের লোগোটাই */
      stamp: toLogoSrc(watermarkLogo),

      printDate: new Date().toLocaleDateString('bn-BD').replace(/\//g, '-'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header, first, subClassName, kitabName, examinerName, instituteLogo, watermarkLogo]);

  /* ─── জলছাপ ───────────────────────────────────────────────────────────

     ⭐ ফিকে ভাবটা CSS এর opacity দিয়ে নয়, ছবির ভেতরেই বসানো।

     কারণটা ছাপা। opacity < ১ দেওয়া জিনিস ক্রোম পর্দায় আলাদা একটা
     স্তরে এঁকে রাখে; ছাপার সময় পাতাগুলো নতুন করে আঁকা হয় আর
     overflow: hidden দেওয়া কাগজের ভেতরে ওই স্তরটা বাদ পড়ে যায়। ফলে
     পর্দায় জলছাপ দেখা যেত, কাগজে যেত না — যতই !important দিয়ে
     "দেখাও" বলা হোক, আঁকার ধাপেই হারিয়ে যেত।

     তাই লোগোটা একবার canvas এ globalAlpha দিয়ে এঁকে নতুন একটা ছবি
     বানিয়ে নেওয়া হয়। সেই ছবিটা আর ফিকে "করা" হয় না — সে নিজেই ফিকে।
     বসে সাধারণ <img> হয়ে, হুবহু মাথার লোগোটার মতো, আর মাথার লোগো তো
     ছাপায় ঠিকই আসছে।

     ছবিটা অন্য সার্ভারের হলে ব্রাউজার canvas কে "কলুষিত" ধরে আর
     toDataURL আটকে দেয় — তখন আগের নিয়মেই opacity দিয়ে বসে, মানে
     আগের চেয়ে খারাপ কিছু হয় না। এখানে লোগোটা ডেটাবেজ থেকে
     base64 ছবি হয়ে আসে, তাই ওই সমস্যা হওয়ার কথা নয়। */
  const stampSrc = info.stamp || info.logo;
  const wmAlpha = clampWatermark(cfg.watermarkOpacity) / 100;
  const showStamp = cfg.showWatermark === true && !!stampSrc;

  const [fadedStamp, setFadedStamp] = useState('');

  useEffect(() => {
    if (!showStamp || typeof document === 'undefined') {
      setFadedStamp('');
      return undefined;
    }

    let dead = false;
    const img = new Image();

    img.onload = () => {
      if (dead) return;

      try {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        if (!w || !h) {
          setFadedStamp('');
          return;
        }

        // ১) আসল ছবিটা একটা কাজের canvas এ
        const work = document.createElement('canvas');
        work.width = w;
        work.height = h;
        const wctx = work.getContext('2d');
        wctx.drawImage(img, 0, 0);

        /* ২) ⭐ চারপাশের স্বচ্ছ ফাঁকা অংশটা মেপে বাদ দিই।
         *
         * লোগোর PNG গুলোয় ছবির চারপাশে অনেকটা ফাঁকা (alpha = 0)
         * জায়গা থাকে, আর সেটা ছবিভেদে সমান নয় — উপরে বেশি, নিচে কম।
         * ফলে ঘরের ঠিক মাঝখানে বসালেও আসল আঁকাটা একদিকে হেলে যেত,
         * আর আকারেও ছোট দেখাত।
         *
         * এখানে যেসব বিন্দুতে সত্যিই কিছু আঁকা আছে (alpha > ৮) শুধু
         * তাদের সীমানাটুকু নেওয়া হয়। তাই আঁকাটাই ঘরের মাঝখানে বসে,
         * আর পুরো জায়গাটা কাজে লাগে। */
        let x0 = 0;
        let y0 = 0;
        let x1 = w;
        let y1 = h;

        try {
          const d = wctx.getImageData(0, 0, w, h).data;
          let minX = w;
          let minY = h;
          let maxX = -1;
          let maxY = -1;

          for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
              if (d[(y * w + x) * 4 + 3] > 8) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (maxX >= minX && maxY >= minY) {
            x0 = minX;
            y0 = minY;
            x1 = maxX + 1;
            y1 = maxY + 1;
          }
        } catch {
          // ছবিটা অন্য সার্ভারের — কিনারা মাপা গেল না, পুরোটাই যাবে
        }

        const cw = x1 - x0;
        const ch = y1 - y0;

        // ৩) কাটা অংশটা ফিকে করে নতুন ছবি
        const out = document.createElement('canvas');
        out.width = cw;
        out.height = ch;

        const octx = out.getContext('2d');
        octx.globalAlpha = wmAlpha;
        octx.drawImage(work, x0, y0, cw, ch, 0, 0, cw, ch);

        setFadedStamp(out.toDataURL('image/png'));
      } catch {
        // canvas কলুষিত — নিচের opacity ওয়ালা পথে চলে যাবে
        setFadedStamp('');
      }
    };

    img.onerror = () => {
      if (!dead) setFadedStamp('');
    };

    img.src = stampSrc;

    return () => {
      dead = true;
    };
  }, [showStamp, stampSrc, wmAlpha]);

  /* জলছাপের জায়গা — শতাংশে নয়, কাগজের মাপ থেকে mm এ।
     transform নেই, flex নেই, তাই ছাপার সময় পাতা ভাগ করার হিসাবে
     ছবিটার জায়গা বদলায় না আর overflow: hidden এর কাঁচিতেও পড়ে না। */
  const wmSize = Math.round(Math.min(page.width, page.height) * 0.55);
  const wmLeft = Math.round(((page.width - wmSize) / 2) * 10) / 10;
  const wmTop = Math.round(((page.height - wmSize) / 2) * 10) / 10;

  /* ─── মাপজোক ───────────────────────────────────────────────────────────
     আড়ালের নমুনা থেকে মাথা, ছকের মাথা আর একটা সারির আসল উচ্চতা নিয়ে
     প্রতি কলামে কয়টা সারি ধরবে সেটা হিসাব করি। */
  const measureRef = useRef(null);
  const [rowsPerColumn, setRowsPerColumn] = useState(null);

  // কী কী বদলালে আবার মাপা দরকার
  const stamp = [
    page.id, page.orientation, cols, font, rowH,
    fields.map((f) => f.key).join(','),
    cfg.showHeader, cfg.showLogo, cfg.showExamBand, cfg.showMeta,
    cfg.showExaminer, cfg.showFooterSign,
    info.institutionName, info.address, info.examName, info.subClassName,
    titleText(cfg), info.examinerName,
    printRows.length,
  ].join('|');

  useLayoutEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;

      const headH = box.querySelector('[data-m="head"]')?.offsetHeight ?? 0;
      const footH = box.querySelector('[data-m="foot"]')?.offsetHeight ?? 0;
      const tableHead = box.querySelector('thead')?.offsetHeight ?? 0;
      const sampleRow = box.querySelector('tbody tr')?.offsetHeight ?? 0;

      if (!sampleRow) return;

      const contentH = (page.height - page.pad * 2) * MM;
      const avail = contentH - headH - footH - tableHead - SAFETY;

      const fit = Math.max(1, Math.floor(avail / sampleRow));
      setRowsPerColumn((prev) => (prev === fit ? prev : fit));
    };

    measure();

    // ফন্ট ও লোগো দেরিতে এলে উচ্চতা বদলায়, তাই তখন আবার মাপি
    let alive = true;
    const again = () => alive && measure();

    document.fonts?.ready?.then(again).catch(() => {});

    const imgs = Array.from(measureRef.current?.querySelectorAll('img') ?? []);
    imgs.forEach((img) => img.addEventListener('load', again));

    return () => {
      alive = false;
      imgs.forEach((img) => img.removeEventListener('load', again));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  /* ---- পাতা ভাগ। মাপ আসার আগপর্যন্ত সব এক পাতায় ধরি — useLayoutEffect
         আঁকার আগেই চলে, তাই চোখে পড়ার মতো কিছু ঘটে না। */
  const pages = useMemo(() => {
    if (!printRows.length) return [];

    const per = (rowsPerColumn || printRows.length) * cols;

    const out = [];
    for (let i = 0; i < printRows.length; i += per) {
      out.push(printRows.slice(i, i + per));
    }
    return out;
  }, [printRows, rowsPerColumn, cols]);

  const perColumn = rowsPerColumn || printRows.length;

  /* ─── কাগজের টুকরোগুলো ─────────────────────────────────────────────── */

  const renderHead = () => (
    <div className="ns-head">
      {cfg.showHeader !== false && (
        <div className="ns-inst-row">
          {cfg.showLogo !== false && info.logo && (
            <img className="ns-logo" src={info.logo} alt="" />
          )}

          <div className="ns-inst-txt">
            {info.institutionName && <div className="ns-inst">{info.institutionName}</div>}
            {info.address && <div className="ns-addr">{info.address}</div>}
            {info.contact && <div className="ns-contact">মোবাইল: {info.contact}</div>}
          </div>
        </div>
      )}

      {/* ⭐ পট্টিতে এখন ব্যবহারকারীর নিজের লেখা শিরোনাম।
          পরীক্ষার নাম ও শিক্ষাবর্ষ নেমে গেছে নিচের সারিতে। */}
      {cfg.showExamBand !== false && (
        <div className="ns-band-row">
          {onTitleChange ? (
            <>
              {/* পর্দায় — চাপ দিয়ে লেখার ঘর।
                  value এ titleText নয়, cfg.title — নইলে ফাঁকা করতে গেলেই
                  ডিফল্ট নামটা ফিরে এসে বসত, কিছু মোছাই যেত না। */}
              <input
                type="text"
                className="ns-band ns-band-edit"
                value={cfg.title ?? ''}
                placeholder={titleText(cfg)}
                onChange={(e) => onTitleChange(e.target.value)}
                title="চাপ দিয়ে কাগজের শিরোনাম লিখুন"
                style={{ width: `${Math.max(14, titleText(cfg).length + 4)}ch` }}
              />

              {/* কাগজে — সাধারণ লেখা, ঘর নয় */}
              <span className="ns-band ns-band-print">{titleText(cfg)}</span>
            </>
          ) : (
            <span className="ns-band">{titleText(cfg)}</span>
          )}
        </div>
      )}

      {cfg.showMeta !== false && (
        <div className="ns-meta">
          {(info.examName || info.sessionName || info.sessionAraName) && (
            <div className="ns-meta-cell">
              <span className="ns-meta-lbl">শ্রেণি/জামাত: </span>
              {info.examName}
            </div>
          )}
          {(info.examName || info.sessionName || info.sessionAraName) && (
            <div className="ns-meta-cell">
              <span className="ns-meta-lbl">শিক্ষাবর্ষ: </span>
              {info.sessionAraName}
              {info.sessionAraName && info.sessionName ? ' / ' : ''}
              {info.sessionName}
            </div>
          )}
          <div className="ns-meta-cell">
            <span className="ns-meta-lbl">কিতাব: </span>
            {info.kitabName}
          </div>
          <div className="ns-meta-cell ns-meta-total">
            <span className="ns-meta-lbl">মোট: </span>
            {toBn(rows.length)}
          </div>
        </div>
      )}

      {cfg.showExaminer !== false && (
        <div className="ns-examiner">
          <span>
            পরীক্ষকের নাম:{' '}
            <span className="ns-dotted ns-dotted-wide">{info.examinerName}</span>
          </span>
          <span>
            তারিখ: <span className="ns-dotted">{info.printDate}</span>
          </span>
        </div>
      )}
    </div>
  );

  /** এক কলামের ছক */
  const renderColumn = (colRows, startSerial) => (
    <table className="ns-table">
      <colgroup>
        {fields.map((f, i) => (
          <col key={f.key} style={{ width: widths[i] }} />
        ))}
      </colgroup>

      <thead>
        <tr>
          {fields.map((f) => (
            <th key={f.key} style={{ textAlign: f.align }}>
              {f.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {colRows.map((row, i) => (
          <tr key={i}>
            {fields.map((f) => {
              // ক্রমিক নং পুরো তালিকা জুড়ে চলে, প্রতি কলামে ১ থেকে নয়
              /* ফাঁকা ঘরে একটা অদৃশ্য ফাঁকা অক্ষর (nbsp) বসে।

                 উচ্চতাটা CSS থেকেই আসে, তবু এটা রাখা — কোনো ব্রাউজার
                 একদম খালি <td> কে শূন্য উচ্চতার ধরে নিলেও সারিটা তখন
                 আর ভেঙে পড়বে না। */
              if (f.key === 'SL') {
                return (
                  <td key={f.key} style={{ textAlign: f.align }}>
                    {row ? toBn(startSerial + i) : '\u00A0'}
                  </td>
                );
              }

              return (
                <td
                  key={f.key}
                  className={f.align === 'left' ? 'ns-txt' : ''}
                  style={{ textAlign: f.align }}
                >
                  {(row ? cellValue(f, row) : '') || '\u00A0'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFoot = (pageIndex, pageCount) => (
    <div className="ns-foot">
      {cfg.showFooterSign !== false && (
        <div className="ns-signs">
          <div className="ns-sign">{signText(cfg, 'signLeft')}</div>
          <div className="ns-sign">{signText(cfg, 'signRight')}</div>
        </div>
      )}

      {pageCount > 1 && (
        <div className="ns-pageno">
          পৃষ্ঠা {toBn(pageIndex + 1)} / {toBn(pageCount)}
        </div>
      )}
    </div>
  );

  if (!rows.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
        <p className="text-slate-500 font-medium">এই শর্তে কোনো পরীক্ষার্থী পাওয়া যায়নি</p>
        <p className="text-slate-400 text-sm mt-1">
          শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন
        </p>
      </div>
    );
  }

  // এক কলামের চওড়া — মাপার নমুনাটাও ঠিক এই চওড়ায় বসে, তাই লেখা যেভাবে
  // ভেঙে ছাপা হবে নমুনাতেও সেভাবেই ভাঙে
  const colWidthMm = (page.width - page.pad * 2 - (cols - 1) * COL_GAP) / cols;

  return (
    <div className="ns-wrap bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page { size: ${page.id.toUpperCase()} ${page.orientation}; margin: 0; }

        .ns-page {
          box-sizing: border-box;
          width: ${page.width}mm;
          height: ${page.height}mm;
          padding: ${page.pad}mm;
          background: #ffffff;
          color: #0f172a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ---- জলছাপ ----

           ⭐ এখানে opacity নেই — একটুও নেই, আর এটাই আসল কথা।

           পর্দায় জলছাপ দেখা যেত, ছাপায় যেত না। কারণটা opacity।
           opacity < ১ দেওয়া জিনিস ক্রোম পর্দায় আলাদা একটা স্তরে
           (composited layer) এঁকে রাখে। ছাপার সময় ক্রোম পাতাগুলো নতুন
           করে আঁকে, আর paginated + overflow: hidden কাগজের ভেতরে ওই
           আলাদা স্তরটা বাদ পড়ে যায়। তাই যতই !important দিয়ে
           "দেখাও" বলা হোক, আঁকার ধাপেই জিনিসটা হারিয়ে যেত।

           সমাধান: ফিকে ভাবটা CSS এ নয়, ছবির ভেতরেই বসানো। লোগোটা
           একবার canvas এ globalAlpha দিয়ে এঁকে নতুন একটা ছবি বানানো
           হয় (নিচের useEffect), আর সেই ছবিটা বসে সাধারণ <img> হয়ে —
           হুবহু মাথার লোগোটার মতো। মাথার লোগো তো ছাপায় ঠিকই আসছে,
           তাই এটাও আসবে।

           মাপটাও শতাংশে নয়, mm এ — আর transform বা flex কিছুই নেই।
           কাগজের মাপ থেকে সরাসরি হিসাব করে top/left/width/height বসে,
           তাই ছাপার সময় পাতা ভাগ করার হিসাবে ছবিটার জায়গা বদলায় না
           আর overflow: hidden এর কাঁচিতেও পড়ে না। */
        .ns-page { position: relative; }
        .ns-watermark {
          position: absolute;
          left: ${wmLeft}mm;
          top: ${wmTop}mm;
          width: ${wmSize}mm;
          height: ${wmSize}mm;
          object-fit: contain;
          pointer-events: none;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        /* স্তর শুধু DOM এর ক্রমে — জলছাপ পাতার প্রথম সন্তান, বাকি সব
           তার পরে। z-index কোথাও নেই। */
        .ns-page > *:not(.ns-watermark) { position: relative; }

        /* ---- কাগজের মাথা ---- */
        .ns-inst-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: ${font > 10 ? 16 : 13}mm;
          border-bottom: 0.4mm solid ${RULE};
          padding-bottom: 1.5mm;
        }
        /* লোগো absolute — তাতে লোগো থাকুক বা না থাকুক নামটা সবসময়
           পাতার ঠিক মাঝখানেই বসে */
        .ns-logo {
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          height: ${font > 10 ? 14 : 11}mm; width: auto; max-width: 26mm;
          object-fit: contain;
        }
        .ns-inst-txt { text-align: center; max-width: 100%; }
        .ns-inst { font-size: ${font + 6}pt; font-weight: 700; line-height: 1.2; }
        .ns-addr { font-size: ${font}pt; line-height: 1.3; }
        .ns-contact { font-size: ${font - 1}pt; color: #475569; line-height: 1.3; }

        .ns-band-row { text-align: center; margin-top: 2mm; }

        /* ⭐ লেখার ঘরটা পর্দায়, আর ছাপার সময় সাধারণ লেখাটা — দুইটার
           মাপ-চেহারা এক, তাই পর্দায় যা দেখবেন কাগজেও তাই বসবে।

           দুইটা ক্লাস লেখা (.ns-band.ns-band-print) ইচ্ছে করেই। আগে শুধু
           .ns-band-print ছিল, আর নিচের .ns-band ও একই ওজনের নিয়ম — পরে
           লেখা বলে ওটাই জিতে যেত আর display: inline-block বসিয়ে দিত।
           ফলে পর্দায় পট্টিটা দুইবার দেখা যেত: একটা লেখার ঘর, একটা
           ছাপার লেখা। */
        .ns-band.ns-band-print { display: none; }
        .ns-band-edit {
          background: transparent;
          text-align: center;
          outline: none;
          cursor: text;
          /* ঘরটা যে লেখা যায় সেটা বোঝানোর জন্য হালকা ইঙ্গিত */
          border-style: dashed;
        }
        .ns-band-edit:hover { background: #f8fafc; }
        .ns-band-edit:focus {
          border-style: solid;
          box-shadow: 0 0 0 0.6mm #ddd6fe;
        }
        .ns-band-edit::placeholder { color: inherit; opacity: 0.55; }

        .ns-band {
          display: inline-block;
          border: 0.3mm solid ${RULE};
          border-radius: 99mm;
          padding: 0.8mm 5mm;
          font-size: ${font + 1}pt;
          font-weight: 700;
          line-height: 1.25;
        }

        .ns-meta {
          display: flex;
          border: 0.3mm solid ${RULE};
          margin-top: 2mm;
          font-size: ${font}pt;
          font-weight: 700;
          overflow: hidden;
        }
        .ns-meta-cell {
          flex: 1.3; min-width: 0;
          padding: 1mm 2mm;
          border-right: 0.3mm solid ${RULE};
          background: ${HEAD_BG};
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ns-meta-cell:last-child { border-right: 0; }
        .ns-meta-total { flex: 0.6; text-align: center; }
        .ns-meta-lbl { color: #475569; font-weight: 600; }

        .ns-examiner {
          display: flex; justify-content: space-between;
          font-size: ${font}pt; font-weight: 600;
          margin-top: 1.6mm;
        }
        .ns-dotted {
          display: inline-block; min-width: 24mm;
          border-bottom: 0.25mm dotted ${RULE};
          text-align: center;
          /* নাম বসলে ঘরটা ততটুকু চওড়া হয়, ফাঁকা থাকলে দাগটাই থাকে */
          padding: 0 1mm;
        }
        .ns-dotted-wide { min-width: 34mm; }

        /* ---- ছক ---- */
        .ns-cols {
          display: flex;
          gap: ${COL_GAP}mm;
          margin-top: 2mm;
          align-items: flex-start;
        }
        .ns-col { flex: 1 1 0; min-width: 0; }

        .ns-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: ${font}pt;
        }
        .ns-table th, .ns-table td {
          border: 0.25mm solid ${RULE};
          padding: 0 1mm;
          line-height: 1.25;
          /* সব সারি সমান উচ্চতার — ভরা হোক বা ফাঁকা।
             নইলে মাপা উচ্চতা আর আসলটা মেলে না, আর ফাঁকা সারিতে
             হাতে লেখার জায়গাও থাকে না। */
          height: ${rowH}mm;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ns-table th {
          background: ${HEAD_BG};
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
          font-weight: 700;
        }
        .ns-table .ns-txt { padding-left: 1.5mm; }

        /* ⭐ জলছাপ ছকের পেছনে — ছকটা যেন তাকে ঢেকে না ফেলে।

           এটাই ছিল আসল সমস্যা। ছকের ঘরগুলো সাদা হয়ে বসায় জলছাপের যে
           অংশটা ছকের উপর পড়ত সেটা চাপা পড়ে যেত, আর দেখা যেত শুধু
           ছকের নিচের ফাঁকা টুকরোটুকু। আগের পাতাগুলোয় ছক পুরো পাতা
           ভরে থাকত, তাই পুরো জলছাপটাই ঢাকা পড়ত — মনে হত ছাপাই হয়নি।

           ছকের মাথার ধূসর রঙটা (.ns-table th) ইচ্ছে করেই রাখা — ওটা
           ছকের নিজের সাজ, আর মাথার সারি তো একটাই। */
        .ns-head,
        .ns-cols,
        .ns-col,
        .ns-table,
        .ns-table tbody,
        .ns-table tr,
        .ns-table td,
        .ns-foot { background: transparent; }

        /* ---- নিচের অংশ: পাতার তলায় আটকে থাকে ---- */
        .ns-foot { margin-top: auto; padding-top: 2mm; }
        .ns-signs { display: flex; justify-content: space-between; gap: 8mm; }
        .ns-sign {
          width: 40mm; text-align: center;
          border-top: 0.35mm solid ${RULE};
          padding-top: 0.8mm;
          font-size: ${font - 1}pt; font-weight: 700;
        }
        .ns-pageno {
          text-align: center; margin-top: 1.5mm;
          font-size: ${font - 2}pt; color: #64748b;
        }

        /* ---- মাপার নমুনা: পর্দায়ও নেই, কাগজেও নেই ---- */
        .ns-measure {
          position: fixed; top: -10000px; left: 0;
          visibility: hidden; pointer-events: none; z-index: -1;
        }

        @media screen {
          .ns-page { margin: 6mm auto; box-shadow: 0 1mm 4mm rgba(0,0,0,0.18); }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .ns-wrap { background: transparent !important; }
          .ns-measure { display: none !important; }

          /* ছাপার সময় লেখার ঘরটা নয়, সাধারণ লেখাটাই যায় */
          .ns-band.ns-band-edit { display: none !important; }
          .ns-band.ns-band-print { display: inline-block !important; }
          .ns-page {
            margin: 0 !important; box-shadow: none !important;
            break-after: page; page-break-after: always;
          }
          /* ⭐ শেষ পাতার পর বাড়তি খালি পাতা যেন না আসে।

             আগে এখানে .ns-page:last-of-type লেখা ছিল, আর ওটা কিছুই
             মেলাত না। কারণ :last-of-type দেখে এলিমেন্টের ধরন (div),
             ক্লাস নয় — আর শেষ div টা তো মাপার নমুনাটা (.ns-measure),
             কাগজের পাতা নয়। ফলে শেষ পাতাটাও "এর পরে নতুন পাতা" নিয়ম
             পেত, আর ছাপার সময় একটা খালি পাতা বেরিয়ে আসত।

             এখন শেষ পাতাটাকে নিজের একটা ক্লাস দেওয়া হয়, তাই আর ভুল
             হওয়ার সুযোগ নেই। */
          .ns-page.ns-last { break-after: auto; page-break-after: auto; }

          /* ⭐ কাগজের পাতা ছাড়া বাকি সব কিছু ছাপার সময় বাদ।

             মাপার নমুনাটা তো উপরে বাদ দেওয়াই আছে, কিন্তু ভবিষ্যতে এই
             ঘরটায় আর কিছু বসলে সেটাও যেন চুপচাপ একটা খালি পাতা বানিয়ে
             না ফেলে। */
          .ns-wrap > *:not(.ns-page) { display: none !important; }

          /* ⭐ জলছাপ ছাপাতেই হবে।

             উপরের ":not(.ns-page)" নিয়ম বা বাইরের কোনো print স্টাইল
             (অ্যাপের নিজের .watermark-print ঘেঁষা নিয়মগুলো) যেন ভুলে
             এটাকে লুকিয়ে না ফেলে — তাই এখানে সোজা করে বলে দেওয়া।

             আর opacity: 1 — কোনো বাইরের নিয়ম যদি জলছাপে ফিকে ভাব
             বসায়ও, ছাপার সময় সেটা খুলে দেওয়া হয়। ফিকে ভাবটা এখন
             ছবির ভেতরেই আছে, CSS এর দরকার নেই। */
          .ns-page > .ns-watermark {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          /* ছাপার সময় বাইরের কোনো স্টাইল যেন ছকটা সাদা করে জলছাপ
             ঢেকে না ফেলে — ছকের মাথাটুকু ছাড়া সব স্বচ্ছ */
          .ns-page .ns-head,
          .ns-page .ns-cols,
          .ns-page .ns-col,
          .ns-page .ns-table,
          .ns-page .ns-table tbody,
          .ns-page .ns-table tr,
          .ns-page .ns-table td,
          .ns-page .ns-foot { background: transparent !important; }

          .ns-page, .ns-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageRows, pageIndex) => (
        <div
          key={pageIndex}
          className={`ns-page ${pageIndex === pages.length - 1 ? 'ns-last' : ''}`}
        >
          {/* জলছাপ — প্রতিষ্ঠানের লোগো, পাতার মাঝখানে হালকা হয়ে লেখার পেছনে।

              ⭐ ছবিটা আগে থেকেই ফিকে করা (canvas এ আঁকা), তাই এখানে
              opacity নেই। সাধারণ একটা <img> — ঠিক মাথার লোগোটার মতো।
              মাথার লোগো ছাপায় আসে, তাই এটাও আসে।

              canvas কাজ না করলে (ভিন্ন সার্ভারের ছবি হলে ব্রাউজার
              canvas "কলুষিত" ধরে) আগের নিয়মেই opacity দিয়ে বসে —
              তখন অন্তত পর্দায় দেখা যায়, আগের চেয়ে খারাপ হয় না। */}
          {showStamp && (
            <img
              className="ns-watermark"
              src={fadedStamp || stampSrc}
              alt=""
              aria-hidden="true"
              style={fadedStamp ? undefined : { opacity: wmAlpha }}
            />
          )}

          {renderHead()}

          <div className="ns-cols">
            {Array.from({ length: cols }).map((_, c) => {
              const slice = pageRows.slice(c * perColumn, (c + 1) * perColumn);

              return (
                <div key={c} className="ns-col">
                  {renderColumn(slice, pageIndex * perColumn * cols + c * perColumn + 1)}
                </div>
              );
            })}
          </div>

          {renderFoot(pageIndex, pages.length)}
        </div>
      ))}

      {/* ── মাপার নমুনা ─────────────────────────────────────────────────
           কাগজের আসল চওড়ায় বসানো, তাই মাথা আর সারির উচ্চতা আসলটাই পাওয়া
           যায়। সারি একটাই — এই ছকে সব সারি সমান উচ্চতার (লেখা ভাঙে না),
           তাই একটা মাপলেই সবগুলোর মাপ জানা হয়ে যায়। */}
      <div
        ref={measureRef}
        className="ns-measure"
        style={{ width: `${page.width - page.pad * 2}mm` }}
      >
        <div data-m="head">{renderHead()}</div>

        <div style={{ width: `${colWidthMm}mm` }}>
          {renderColumn([first], 1)}
        </div>

        <div data-m="foot">{renderFoot(0, 2)}</div>
      </div>
    </div>
  );
};

export default NumberSheetPaper;