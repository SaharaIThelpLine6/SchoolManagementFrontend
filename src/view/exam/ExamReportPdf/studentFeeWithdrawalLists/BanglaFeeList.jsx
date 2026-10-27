import { useMemo, useState, useRef, useLayoutEffect } from 'react';
import { Buffer } from 'buffer';
import {
  resolveColumns,
  columnPercents,
  formatCell,
  columnTotal,
  toBn,
  langCode,
  listKey,
  listName,
  defaultFeeListSettings,
  paperColumnCount,
  visibleSummaryCards,
} from '../../../../Data/feeListColumns';

// =============================================================================
// পরীক্ষার ফি তালিকা
//
// পুরোনো BanglaOneColumn / BanglaTwoColumn এর বদলে এই একটা পেজই দুইটা
// তালিকা সামলায় (ফি বিহীন ও ফি গৃহীত)। কোন ঘর যাবে আর কী নামে যাবে —
// সবটাই সেটিংস থেকে আসে, এখানে কিছু হার্ডকোড করা নেই।
//
// ⭐ প্রতি পাতায় শিরোনাম ও স্বাক্ষর — পাতা ভাগ এখন নিজেরাই করি
//
//    আগে পুরো কাগজটা একটাই টেবিল ছিল, আর ভরসা ছিল ব্রাউজারের উপর:
//    thead প্রতি পাতার মাথায় বসবে। কিন্তু ক্রোম পুনরাবৃত্ত thead
//    পাতার ২৫% এর বেশি লম্বা হলে আর বসায় না, আর আমাদের মাথা তার চেয়ে
//    অনেক বড়। তাই এখন মাথা, সারসংক্ষেপ ও স্বাক্ষর টেবিলের বাইরে, আর
//    প্রতি পাতা নিজের সবকিছু নিয়ে আলাদা।
//
//    তাই এখন ব্রাউজারের ভরসায় নেই। সারিগুলো নিজেরাই পাতায় পাতায় ভাগ
//    করি, আর প্রতি পাতা নিজের মাথা ও স্বাক্ষর নিয়ে আলাদা টেবিল হয়ে
//    বসে — নম্বর পত্রের কাগজগুলো ঠিক যে নিয়মে চলে।
//
//    "সর্বমোট" সারিটা শুধু শেষ পাতায়, আর যোগফল পুরো তালিকার — এক
//    পাতার নয়।
//
// ⭐ ডান-বাঁয়ে ২px ফাঁকা — টেবিলের বর্ডার যেন কাগজের কিনারায় লেগে না থাকে।
//
// ⭐ বর্ডার আলাদা (separate), প্রতিটা ঘরের ভেতরে — collapse এ বাইরের
//    বর্ডারটা বাক্সের অর্ধেক বাইরে বসত বলে ডান পাশের ঘর কেটে যেত।
// =============================================================================

/**
 * ছবির উৎস — প্রবেশপত্রের কার্ডে (AdmitCardGenerate) যেভাবে, হুবহু সেভাবেই।
 *
 * লোগো SQL Server এ varbinary, তাই ছবির পথ নয় — বাইটের তালিকা আসে:
 * { type: 'Buffer', data: [137, 80, 78, 71, …] }। ওটাকেই base64 ডাটা URL
 * বানিয়ে <img src> এ বসানো হয়। পথ (string) এলে যেমন আছে তেমনই যায়।
 */
const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

/* ───────────────────────────────────────────────────────────────────────────
   এক পাতায় কয়টা সারি — আন্দাজ নয়, আসল মাপ

   আগে ধরে নেওয়া উচ্চতা দিয়ে হিসাব হত। তাতে দুই দিকেই ভুল হত: হেডার
   ছোট করলে বা বাদ দিলেও নিচে অনেক জায়গা ফাঁকা পড়ে থাকত, আর ফাঁকা ঘর
   থাকলে দরকারের চেয়ে অনেক কম সারি বসত।

   এখন একবার কাগজের আসল চওড়ায় (A4 খাড়া, মার্জিন বাদে ৭১৮px) গোটা
   টেবিলটা আড়ালে বসিয়ে মাথা, স্বাক্ষর আর প্রতিটা সারির আসল উচ্চতা মেপে
   নিই। তারপর যত জায়গা আছে ততগুলো সারি ভরে পাতা শেষ — পরের সারি থেকে
   নতুন পাতা, নিজের মাথা ও স্বাক্ষর নিয়ে।

   তাই সেটিংসে হেডার, সারসংক্ষেপ, ফন্ট বা ঘর বদলালে সারির সংখ্যা
   আপনাআপনি বদলায়, কোথাও কোনো সংখ্যা লেখা নেই।
   ─────────────────────────────────────────────────────────────────────────── */
const PRINT_W = 718;    // ২১০mm − ২০mm মার্জিন, ৯৬dpi তে
const PRINT_H = 1046;   // ২৯৭mm − ২০mm মার্জিন
const SAFETY = 12;      // গোল করার ভুল শুষে নেওয়ার জন্য একটু ছাড়

/* উচ্চতার তালিকা নিয়ে পাতায় ভাগ করে দেয়।
   ফেরত আসে প্রতি পাতার আইটেম-নম্বরের তালিকা। */
const packPages = (heights, avail) => {
  const pages = [];
  let cur = [];
  let used = 0;

  heights.forEach((h, i) => {
    // চলতি পাতায় আর জায়গা নেই → নতুন পাতা
    if (cur.length && used + h > avail) {
      pages.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(i);
    used += h;
  });

  if (cur.length) pages.push(cur);
  return pages;
};

/**
 * স্বাক্ষরের ঘরের ডিফল্ট নাম।
 *
 * সেটিংসে নাম বসানো না থাকলে এগুলোই যায়। ডান পাশেরটা একটু আলাদা —
 * সেটিংস ফাঁকা থাকলে আগে Institution_Information এর PrincipalName দেখা
 * হয়, তারপর এই ডিফল্ট। তাই প্রতিষ্ঠানের আসল মুহতামিমের নাম সেভ করা
 * থাকলে সেটাই বসে, আগের মতোই।
 */
const SIGNATURE_DEFAULTS = {
  left: 'হিসাব রক্ষক',
  middle: 'পরীক্ষা নিয়ন্ত্রক',
  right: 'মুহতামিম',
};

const BanglaFeeList = ({
  reportData,
  queryParams,
  settings,

  // ⭐ কাগজের মাথার লোগো — প্রতিষ্ঠানের লোগো, এখানে এটাই বসবে
  instituteLogo,

  // জলছাপের লোগো — এখানে ব্যবহার হয় না, পাতার পেছনে আলাদা করে বসে
  // (ExamReportList এর .watermark-print)। আগে ভুল করে এই লোগোটাই
  // মাথায় বসানো হত, সেজন্যই কাগজের উপরে জলছাপের ছবিটা দেখা যেত।
  documentLogo,
  logoIsActive,

  listType = 1,
  language = 1,
}) => {
  const cfg = settings || defaultFeeListSettings(language);
  const isArabic = langCode(language) === 'ar';

  const columns = useMemo(() => resolveColumns(cfg, language), [cfg, language]);
  const percents = useMemo(() => columnPercents(columns), [columns]);

  // রুট থেকে { data, summary } আসে; পুরোনো কোডের সাথে মিল রাখতে
  // সরাসরি অ্যারে এলেও চলে
  const rows = useMemo(() => {
    if (Array.isArray(reportData)) return reportData;
    return reportData?.data ?? [];
  }, [reportData]);

  const summary = reportData?.summary;
  const first = rows[0] || {};

  /* প্রতিষ্ঠানের লোগো
   *
   * ⭐ নামটা InstitutionLogo — রুটের loadReportHeader() এ
   *    `InstitutionLogo: inst.Logo` বসানো আছে, আর ...header প্রতিটা সারিতে
   *    ছড়িয়ে দেয়। আগে এখানে শুধু Logo / InstituteLogo খোঁজা হত, তাই নাম
   *    না মেলায় লোগোটা কখনো বসত না — অথচ নাম-ঠিকানা ঠিকই আসত, কারণ
   *    ওগুলোর নাম মিলত।
   *
   * সারিতে না পেলে প্রপ থেকে — প্রবেশপত্রের কার্ডেও এই ক্রমেই। */
  const logo = toImageSrc(
    first.InstitutionLogo ||
    first.Logo ||
    first.logo ||
    first.InstituteLogo ||
    instituteLogo
  );

  // লোগো কোথায় বসবে — মাথার মাঝখানে, নাকি বাঁ পাশে (প্রবেশপত্রের মতো)
  // const logoOnSide = cfg.logoPosition === 'left';
  const logoOnSide = true;
  const showLogo = cfg.showLogo !== false && Boolean(logo);

  /* স্বাক্ষরের তিনটা নাম — সেটিংস থেকে।
     ফাঁকা রাখলে ডিফল্টটাই যায়, তাই সেটিংসে হাত না দিলে কাগজ আগের মতোই। */
  const signs = cfg.signatures || {};
  const signLeft = String(signs.left ?? '').trim() || SIGNATURE_DEFAULTS.left;
  const signMiddle = String(signs.middle ?? '').trim() || SIGNATURE_DEFAULTS.middle;
  const signRight =
    String(signs.right ?? '').trim() || first.PrincipalName || SIGNATURE_DEFAULTS.right;

  // সর্বমোট সারিটাও পাতায় জায়গা নেয়, তাই সেও একটা আইটেম
  const showTotalRow =
    Boolean(cfg.showTotalRow) && columns.some((c) => c.type === 'money');

  const itemCount = rows.length + (showTotalRow ? 1 : 0);
  const allItems = useMemo(
    () => Array.from({ length: itemCount }, (_, i) => i),
    [itemCount]
  );

  /* মাপজোকের ফল। আসা পর্যন্ত সব এক পাতায় ধরা হয় — useLayoutEffect
     আঁকার আগেই চলে, তাই চোখে পড়ার মতো কিছু ঘটে না। */
  const measureRef = useRef(null);
  const [plan, setPlan] = useState(null);

  /* কাগজে এক না দুই কলাম — সেটিংস থেকে।
     দুই কলামে এক পাতায় দুইটা তালিকা, বাঁ দিকটা ভরে তারপর ডান দিক। */
  const twoUp = paperColumnCount(cfg.paperColumns) === 2;

  /* plan এ থাকে কলামের তালিকা (প্রতিটা এক কলামে যতগুলো সারি ধরে)।
     এক কলামের কাগজে এক কলাম = এক পাতা; দুই কলামে দুইটা মিলে এক পাতা। */
  const pages = useMemo(() => {
    const cols = plan && plan.length ? plan : [allItems];
    if (!twoUp) return cols.map((c) => [c]);

    const out = [];
    for (let i = 0; i < cols.length; i += 2) out.push(cols.slice(i, i + 2));
    return out;
  }, [plan, allItems, twoUp]);

  const kind = listKey(listType);
  const title = listName(listType);

  const accent =
    kind === 'paid'
      ? { bar: 'from-emerald-600 to-teal-500', head: 'bg-emerald-100' }
      : kind === 'all'
        ? { bar: 'from-violet-600 to-fuchsia-500', head: 'bg-violet-100' }
        : { bar: 'from-indigo-600 to-blue-500', head: 'bg-indigo-100' };

  // শিরোনামে ভাষা অনুযায়ী নাম
  const institution = isArabic
    ? first.AraInstitutionName || first.InstitutionName
    : first.InstitutionName;
  const address = isArabic ? first.AraAddress || first.Address : first.Address;
  const sessionName = isArabic ? first.SessionAraName || first.SessionName : first.SessionName;
  const examLabel = isArabic ? first.ExamAraName || first.ExamName : first.ExamName;
  const classLabel = isArabic ? first.SubClassAra || first.SubClass : first.SubClass;

  /* ─── কাগজের মাপে পাতা ভাগ ───────────────────────────────────────────
     আড়ালের টেবিলটা থেকে মাথা, স্বাক্ষর আর প্রতিটা সারির আসল উচ্চতা নিয়ে
     হিসাব করি। সেটিংস, ঘরের তালিকা, ফন্ট বা সারির সংখ্যা বদলালে আবার। */
  const measureStamp = [
    itemCount,
    columns.map((c) => c.key).join(','),
    cfg.fontSize,
    cfg.showHeader,
    cfg.showSummary,
    // সবগুলো ঘর বন্ধ করলে সারসংক্ষেপটাই উঠে যায়, তখন উচ্চতা বদলায় —
    // তাই গুনতিটাও হিসাবে রাখি, নইলে পাতা ভাগটা পুরোনো মাপেই থেকে যেত
    visibleSummaryCards(cfg).length,
    cfg.showLogo,
    showTotalRow,
    Boolean(summary),
    language,
    twoUp,
    // লম্বা নাম দুই লাইনে ভাঙলে স্বাক্ষরের উচ্চতা বদলায়
    signLeft,
    signMiddle,
    signRight,
  ].join('|');

  useLayoutEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;

      const colHead = box.querySelector('thead');
      const trs = Array.from(box.querySelectorAll('tbody tr'));
      if (!colHead || !trs.length) return;

      // টেবিলের বাইরের অংশগুলো — যতটা জায়গা নেয়, ততটা সারির জন্য কম
      const outside = ['head', 'summary', 'sign'].reduce((sum, name) => {
        const el = box.querySelector(`[data-m="${name}"]`);
        return sum + (el ? el.offsetHeight : 0);
      }, 0);

      const avail = PRINT_H - outside - colHead.offsetHeight - SAFETY;
      if (avail <= 0) return;

      const heights = trs.map((tr) => tr.offsetHeight || 1);
      const next = packPages(heights, avail);

      // একই ফল হলে আবার রেন্ডার করিয়ে লাভ নেই
      setPlan((prev) =>
        prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    };

    measure();

    /* ফন্ট দেরিতে এলে মাপ বদলায় — এসে গেলে আরেকবার মেপে নিই।
       লোগোর ছবিটাও মাথার উচ্চতা বদলাতে পারে, তাই ওটাও ধরা। */
    let alive = true;
    const again = () => { if (alive) measure(); };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(again).catch(() => {});
    }
    const imgs = measureRef.current
      ? Array.from(measureRef.current.querySelectorAll('img'))
      : [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', again, { once: true });
    });

    return () => {
      alive = false;
      imgs.forEach((img) => img.removeEventListener('load', again));
    };
    // rows বদলালেও আবার মাপা দরকার — লম্বা নাম সারি লম্বা করে দেয়
  }, [measureStamp, rows]);

  /* ─── পাতার টুকরোগুলো ────────────────────────────────────────────────
     মাথা ও স্বাক্ষর দুই জায়গায় লাগে — একবার মাপার টেবিলে, একবার আসল
     পাতায় — তাই আলাদা করে রাখা। */

  /* ─── পাতার টুকরোগুলো ────────────────────────────────────────────────

     মাথা, সারসংক্ষেপ আর স্বাক্ষর আগে টেবিলের thead/tfoot এর ভেতরে ছিল —
     ব্রাউজার যেন প্রতি পাতায় বসায়। এখন পাতা নিজেরাই আলাদা, তাই ওগুলো
     টেবিলের বাইরে সাধারণ ঘর হয়ে বসে। এতে দুই কলামের সাজটাও সোজা হয়ে
     গেল: মাথা ও স্বাক্ষর পুরো চওড়ায় একবার, আর মাঝখানে পাশাপাশি দুইটা
     টেবিল। */

  const renderPaperHead = (pageIndex, pageCount) => {
    if (!cfg.showHeader) return null;

    return (
      <div className="pb-3">

        {/* লোগো ও নামের সারি।

            বাঁ পাশে বসালে ডান দিকেও সমান একটা ফাঁকা ঘর
            রাখা হয় — নইলে নামটা লোগোর চাপে ডানে সরে
            যেত, মাঝখানে পড়ত না। */}
        <div className={logoOnSide ? 'flex items-center gap-4' : 'text-center'}>
          {showLogo && (
            <img
              src={logo}
              alt=""
              className={
                logoOnSide
                  ? 'h-16 w-16 shrink-0 object-contain'
                  : 'h-16 mx-auto mb-2 object-contain'
              }
            />
          )}

          <div className={logoOnSide ? 'flex-1 min-w-0 text-center' : ''}>
            <h1 className="text-xl font-bold text-slate-900">
              {institution || queryParams?.InstitutionName || ''}
            </h1>
            {(address || queryParams?.Address) && (
              <p className="text-sm font-normal text-slate-600 mt-0.5">
                {address || queryParams?.Address}
              </p>
            )}
            {first.ContactNumber && (
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                মোবাইল: {toBn(first.ContactNumber)}
              </p>
            )}
          </div>

          {logoOnSide && showLogo && (
            <span className="h-16 w-16 shrink-0" aria-hidden="true" />
          )}
        </div>

        <div className="text-center">
          <div className="inline-block mt-3 px-5 py-1 rounded-full border border-slate-800 text-slate-900 font-bold text-[15px]">
            {title}
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-2 text-[13px] font-normal text-slate-700">
            {sessionName && <span>শিক্ষাবর্ষ: <b>{sessionName}</b></span>}
            {examLabel && <span>পরীক্ষা: <b>{examLabel}</b></span>}
            {classLabel && <span>শ্রেণি: <b>{classLabel}</b></span>}
            <span>মোট শিক্ষার্থী: <b>{toBn(rows.length)}</b></span>
            {pageCount > 1 && (
              <span>
                পৃষ্ঠা: <b>{toBn(pageIndex + 1)} / {toBn(pageCount)}</b>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * উপরের সারসংক্ষেপ।
   *
   * ⭐ কোন ঘরগুলো বসবে সেটা সেটিংস থেকে আসে (সেটিংস → কাগজের সেটিংস →
   * সারসংক্ষেপের ঘর)। আগে চারটাই বাঁধা ছিল, তাই "ফি গৃহীত" তালিকায়
   * "ফি দেয়নি: ০" আর "ফি বিহীন" তালিকায় "মোট জমা: ০" — অর্থহীন শূন্য
   * ঘরগুলোও কাগজে বসে থাকত।
   *
   * ঘরের সংখ্যা যা-ই হোক পুরো চওড়াটা সমান ভাগে ভাগ হয়, তাই দুইটা ঘর
   * বাছলে সেই দুইটাই চওড়া হয়ে বসে — পাশে ফাঁকা জায়গা পড়ে থাকে না।
   * grid-cols-N নামটা লিখিনি ইচ্ছে করেই: Tailwind যে ক্লাসগুলো কোডে
   * লেখা দেখে না সেগুলো তৈরি করে না, তাই grid-cols-3 হয়তো কাজই করত না।
   */
  const renderSummary = () => {
    if (!cfg.showSummary || !summary) return null;

    const cards = visibleSummaryCards(cfg);
    if (cards.length === 0) return null;

    return (
      <div
        className="grid gap-2 pb-3"
        style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
      >
        {cards.map((c) => (
          <div key={c.key} className={`rounded-lg border px-3 py-2 text-center ${c.tone}`}>
            <div className="text-lg font-bold leading-tight">{toBn(summary[c.key])}</div>
            <div className="text-[11px] font-normal opacity-80">{c.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSign = () => (
    <div className="flex justify-between text-[13px] text-slate-700 pt-10 pb-1">
      <div className="text-center">
        <div className="border-t border-slate-800 pt-1 px-8">{signLeft}</div>
      </div>
      <div className="text-center">
        <div className="border-t border-slate-800 pt-1 px-8">{signMiddle}</div>
      </div>
      <div className="text-center">
        <div className="border-t border-slate-800 pt-1 px-8">{signRight}</div>
      </div>
    </div>
  );


  const renderBody = (items) => (
    <tbody>
      {items
        .filter((idx) => idx < rows.length)
        .map((idx) => {
          const row = rows[idx];

          return (
            <tr
              key={row.ID ?? row.UserID ?? idx}
              className={`${idx % 2 ? 'bg-slate-50/60' : 'bg-white'} ${
                row.IsInactive ? 'text-rose-600' : 'text-slate-800'
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-2 ${col.blank ? 'py-4' : 'py-1.5'}`}
                  // নাম, পিতার নাম ইত্যাদি বাঁ দিকে — কলামের
                  // তালিকাতেই ঠিক করা আছে, এখানে শুধু বসানো হয়
                  style={{ textAlign: col.align || 'left' }}
                >
                  {/* ক্রমিক নং পুরো তালিকা জুড়ে চলে, প্রতি পাতায় ১ থেকে নয় */}
                  {formatCell(col, row, idx)}
                </td>
              ))}
            </tr>
          );
        })}

      {/* সর্বমোট — যে পাতায় জায়গা হয়েছে সেখানে, যোগফল পুরো তালিকার */}
      {showTotalRow && items.includes(rows.length) && (
        <tr className="font-bold bg-amber-50">
          {columns.map((col, idx) => {
            const total = columnTotal(col, rows);

            if (idx === 0) {
              return (
                <td key={col.key} className="px-2 py-2 text-center text-slate-900">
                  সর্বমোট
                </td>
              );
            }

            return (
              <td
                key={col.key}
                className="px-2 py-2 text-slate-900"
                style={{ textAlign: col.align || 'left' }}
              >
                {total === null ? '' : toBn(total)}
              </td>
            );
          })}
        </tr>
      )}
    </tbody>
  );

  const renderTable = (items) => (
    <table className="fee-list-table" style={{ fontSize: `${cfg.fontSize || 13}px` }}>
      <colgroup>
        {columns.map((col, i) => (
          <col key={col.key} style={{ width: `${percents[i]}%` }} />
        ))}
      </colgroup>

      {/* ঘরের নামের সারি — প্রতিটা তালিকার নিজের, তাই দুই কলামে
          দুই পাশেই নাম থাকে */}
      <thead>
        <tr className={`fee-col-head ${accent.head}`}>
          {columns.map((col) => (
            <th key={col.key} className="px-2 py-2 font-bold text-slate-900 text-center">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>

      {renderBody(items)}
    </table>
  );

  /* এক পাতার মাঝের অংশ — এক কলাম হলে একটা টেবিল, দুই কলাম হলে
     পাশাপাশি দুইটা। ডান দিক ফাঁকা থাকলেও জায়গাটা ধরে রাখি, নইলে
     শেষ পাতায় বাঁ দিকের তালিকাটা হঠাৎ পুরো চওড়া হয়ে যেত। */
  const renderColumns = (pageCols) => (
    <div className={`fee-cols ${twoUp ? 'is-two' : ''}`}>
      {pageCols.map((items, ci) => (
        <div className="fee-col" key={ci}>
          <div className="fee-list-wrap">{renderTable(items)}</div>
        </div>
      ))}

      {twoUp && pageCols.length === 1 && <div className="fee-col" aria-hidden="true" />}
    </div>
  );

  if (!rows.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
        <p className="text-slate-500 font-medium">এই শর্তে কোনো শিক্ষার্থী পাওয়া যায়নি</p>
        <p className="text-slate-400 text-sm mt-1">শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ---- টেবিলের গড়ন ----------------------------------------------- */
        .fee-list-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0;
        }
        .fee-list-table th,
        .fee-list-table td {
          border-right: 1px solid #94a3b8;
          border-bottom: 1px solid #94a3b8;
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        .fee-list-table th:first-child,
        .fee-list-table td:first-child {
          border-left: 1px solid #94a3b8;
        }
        /* ঘরের নামের সারিটায় উপরের বর্ডার — প্রতি পাতাতেই বসবে */
        .fee-list-table tr.fee-col-head th {
          border-top: 1px solid #94a3b8;
          vertical-align: middle;
        }
        /* ---- এক না দুই কলাম ----------------------------------------------
           দুই কলামে দুইটা তালিকা পাশাপাশি, মাঝে একটু ফাঁক। min-width: 0
           না দিলে ভেতরের টেবিলটা ঘরটাকে ঠেলে চওড়া করে ফেলে। */
        .fee-cols { display: flex; gap: 10px; align-items: flex-start; }
        .fee-col { flex: 1 1 0; min-width: 0; }

        @media print {
          @page { size: A4 portrait; margin: 10mm; }

          /* পর্দার ব্যানার আর মাপার টেবিল কাগজে দরকার নেই */
          .fee-banner { display: none !important; }
          .fee-measure { display: none !important; }

          /* ⭐ এক পাতা = একটা সম্পূর্ণ টেবিল।
             প্রতিটার শেষে জোর করে পাতা ভাঙি, শেষটা বাদে।
             এতে প্রতি পাতা নিজের মাথা, ঘরের নাম আর স্বাক্ষর
             নিয়েই ছাপা হয় — ব্রাউজারের পুনরাবৃত্তির উপর আর
             ভরসা করতে হয় না। */
          .fee-page {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;

            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .fee-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* ⭐ ডান-বাঁয়ে ২px — বর্ডার কাগজের কিনারায় লেগে থাকে না */
          .fee-page .fee-list-body {
            padding: 0 2px !important;
            overflow: visible !important;
          }

          /* দুই কলামের ফাঁকটা কাগজে একটু বেশি — দুইটা তালিকার বর্ডার
             গায়ে গায়ে লেগে থাকলে কোনটা কোন তালিকা বোঝা যায় না */
          .fee-cols.is-two { gap: 14px; }

          .fee-list-wrap {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .fee-list-table th,
          .fee-list-table td {
            border-color: #000 !important;
            white-space: normal !important;
          }

          /* রঙগুলো প্রতি পাতাতেই ছাপা হোক */
          .fee-list-table thead th,
          .fee-list-table tr.fee-col-head th {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* সারি যেন মাঝখান থেকে কাটা না পড়ে */
          .fee-list-table tbody tr { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      {/* ── রঙিন ব্যানার (পর্দায় মাত্র, একবারই) ───────── */}
      <div className={`fee-banner mt-4 max-w-[900px] mx-auto rounded-t-xl bg-gradient-to-r ${accent.bar} px-5 py-4 flex items-center gap-4 print:hidden`}>
        <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        <div className="min-w-0">
          <h2 className="text-white font-bold text-base leading-tight">{title}</h2>
          <p className="text-white/80 text-xs mt-0.5">
            {classLabel ? `${classLabel} — ` : ''}
            {examLabel || ''}{sessionName ? ` (${sessionName})` : ''}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            মোট: {toBn(rows.length)}
          </span>
          {pages.length > 1 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              পাতা: {toBn(pages.length)}
            </span>
          )}
          {summary && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              বকেয়া: {toBn(summary.due)}
            </span>
          )}
        </div>
      </div>

      {/* ── পাতাগুলো — প্রতিটা নিজের মাথা ও স্বাক্ষর নিয়ে ───── */}
      {pages.map((pageCols, pageIndex) => (
        <div
          key={pageIndex}
          // পর্দায়: প্রথম পাতা ব্যানারের সাথে লাগানো, পরের পাতাগুলো
          // আলাদা কার্ড হয়ে একটু ফাঁক রেখে বসে
          className={`fee-page max-w-[900px] mx-auto bg-white border border-slate-200 shadow-sm ${
            pageIndex === 0 ? 'border-t-0' : 'mt-5 rounded-xl print:mt-0'
          }`}
        >
          <div className="fee-list-body px-5 py-4">
            {renderPaperHead(pageIndex, pages.length)}
            {renderSummary()}
            {renderColumns(pageCols)}
            {renderSign()}
          </div>
        </div>
      ))}

      {/* ── মাপার টেবিল ────────────────────────────────────────────────
           পর্দায়ও নেই, কাগজেও নেই — শুধু মাপার জন্য। কাগজের আসল চওড়ায়
           বসানো, তাই লেখা যেভাবে ভেঙে ছাপা হবে ঠিক সেভাবেই এখানে ভাঙে,
           আর সারির উচ্চতাও আসলটাই পাওয়া যায়।

           মাথায় "পৃষ্ঠা ১/২" লাইনটা থাকে বলে pageCount এখানে ২ — একের
           বেশি পাতা হলে মাথা যতটুকু লম্বা হয়, সেটাও ধরা থাকে। */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="fee-measure"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: `${PRINT_W}px`,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div style={{ padding: '0 2px' }}>
          {/* টেবিলের বাইরের অংশগুলো আলাদা করে চিহ্নিত — উচ্চতা আলাদা
              আলাদা মাপা হয় বলে হেডার বা সারসংক্ষেপ বন্ধ করলেই নিচে
              ততটুকু বেশি সারি বসে */}
          <div data-m="head">{renderPaperHead(0, 2)}</div>
          <div data-m="summary">{renderSummary()}</div>

          {/* দুই কলাম হলে টেবিলটা অর্ধেক চওড়ার ঘরে বসে, তাই সারির
              উচ্চতাও সেই সরু চওড়ারই মাপা হয় */}
          {renderColumns([allItems])}

          <div data-m="sign">{renderSign()}</div>
        </div>
      </div>
    </>
  );
};

export default BanglaFeeList;
