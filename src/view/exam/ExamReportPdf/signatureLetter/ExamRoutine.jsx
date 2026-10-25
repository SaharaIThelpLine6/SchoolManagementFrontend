import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../../utils/dateFormat";
import { useGetExamHallListQuery } from "../../../../features/examhall/examHallQuerySlice";
import { useGetHallwiseSeatPlanQuery } from "../../../../features/exam/examSitPlanQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionQuery } from "../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../features/class/classQuerySlice";

/* ═══════════════════════════════════════════════════════════════════════════
   কাগজের মাপ — ল্যান্ডস্কেপ

   এই কাগজে কিতাবের ঘরগুলো পাশাপাশি বসে, তাই চওড়াটাই আসল। সেজন্য দুইটা
   মাপই আড়াআড়ি (landscape)।

   পর্দায় কন্টেইনারের মাপ আর প্রিন্টের `@page` — দুইটাই এই এক জায়গা থেকেই
   আসে, তাই পর্দায় যেটা দেখা যায় কাগজেও ঠিক সেটাই ছাপে।

   ⚠️ স্বয়ংক্রিয় বাছাইটা কলাম ধরে, রো ধরে নয় — ল্যান্ডস্কেপে দুই কাগজের
   উচ্চতা প্রায় সমান (২১০ বনাম ২১৬মিমি), পার্থক্যটা চওড়ায়।

   হিসাবটা (৮মিমি মার্জিন ধরে):

     এ-ফোর ল্যান্ডস্কেপ   ২৯৭মিমি → ছাপার চওড়া ≈ ১০৬২px
     লিগ্যাল ল্যান্ডস্কেপ  ৩৫৬মিমি → ছাপার চওড়া ≈ ১২৮৫px

   ক্রমিক (৪০) + আইডি (৮০) + নাম (১৭০) = ২৯০px বাঁধা। বাকিটা কিতাবের ঘরে
   ভাগ হয়। বাংলা কিতাবের নাম দুই-তিন লাইনে ভেঙে পড়তে ঘরপ্রতি অন্তত ~৯০px
   লাগে, তাই:

     ১–৮ কিতাব    → এ-ফোর   (৭৭২px ÷ ৮ = ৯৬px, আরামে)
     ৯–১১ কিতাব   → লিগ্যাল  (৯৯৫px ÷ ১১ = ৯০px)
     ১২–১৪ কিতাব  → লিগ্যাল, তবে নামের ঘরটা ১৪০px এ নামাতে হবে
   ═══════════════════════════════════════════════════════════════════════════ */
const A4_ROW_LIMIT = 16;      // এ-ফোর ল্যান্ডস্কেপে মোটামুটি যতটা রো ধরে
const A4_COLUMN_LIMIT = 8;    // এর বেশি কিতাব হলে ঘর চিপে যায়

/** মিলিমিটার → পিক্সেল, ৯৬dpi তে */
const px = (mm) => Math.round((mm / 25.4) * 96);

const MARGIN_MM = 8;   // @page এর মার্জিন, দুই পাশে

const PAPERS = {
  a4: {
    key: "a4",
    label: "এ-ফোর",
    css: "A4 landscape",
    width: "297mm",
    minHeight: "210mm",
    // ছাপার আসল জায়গা — মার্জিন বাদে
    printW: px(297 - MARGIN_MM * 2),   // ১০৬২
    printH: px(210 - MARGIN_MM * 2),   // ৭৩৩
  },
  legal: {
    key: "legal",
    label: "লিগ্যাল",
    css: "legal landscape",
    width: "356mm",
    minHeight: "216mm",
    printW: px(356 - MARGIN_MM * 2),   // ১২৮৫
    printH: px(216 - MARGIN_MM * 2),   // ৭৫৬
  },
};

/** গোল করার ভুল শুষে নেওয়ার ছাড় */
const SAFETY = 14;

/**
 * উচ্চতার তালিকা নিয়ে পাতায় ভাগ করে — ফেরত আসে প্রতি পাতার আইটেম-নম্বর।
 *
 * ⚠️ জায়গাটা প্রতি পাতায় এক নয়, তাই `availFor(pageIndex)` ফাংশন।
 *
 * প্রথম পাতায় প্রতিষ্ঠানের মাথাটাও (লোগো, নাম, ঠিকানা, শিরোনাম) বসে —
 * ল্যান্ডস্কেপে ওটা ~১৫০px খেয়ে ফেলে। পরের পাতাগুলোয় ওটা থাকে না, শুধু
 * মারহালা, তারিখ/বার/সময় আর কলামের নাম — তাই ওখানে সারি অনেক বেশি ধরে।
 * এক হিসাব সব পাতায় চাপালে হয় প্রথম পাতা উপচাতো, নয় বাকি পাতাগুলোয়
 * অর্ধেক জায়গা ফাঁকা পড়ে থাকত।
 *
 * একটা সারি একাই পাতার চেয়ে বড় হলে (বাস্তবে হয় না) সেটা একলাই বসে,
 * নইলে লুপটা কখনো এগোত না।
 */
const packPages = (heights, availFor) => {
  const pages = [];
  let cur = [];
  let used = 0;

  heights.forEach((h, i) => {
    if (cur.length && used + h > availFor(pages.length)) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   প্রতিষ্ঠানের লোগো

   ExamReportList এ যেভাবে খোঁজা হয়, হুবহু সেভাবেই — কারণ লোগোটা
   ইনস্টলেশন ভেদে আলাদা জায়গায় আর আলাদা নামে থাকে।

   ⭐ সবচেয়ে জরুরি অংশটা toImageSrc: লোগো SQL Server এ varbinary, তাই
   রুট থেকে বাইট হয়ে আসে — { type: 'Buffer', data: [...] }। সরাসরি
   <img src={...}> এ বসালে কিছুই দেখা যায় না, আগে base64 এ বদলাতে হয়।

   খোঁজার ক্রম:
     ১) প্রপে আসা instituteLogo — ExamReportList এর নিজের খোঁজার ফল
     ২) রুটের উত্তর (reportData.header.InstitutionLogo বা সারির ভেতরে)
     ৩) settings API এর institutionInfo
   ═══════════════════════════════════════════════════════════════════════════ */

const toImageSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString("base64");
    return `data:image/png;base64,${base64String}`;
  }
  return "";
};

const INSTITUTE_LOGO_KEYS = [
  "InstitutionLogo", "institutionLogo",
  "Logo", "logo",
  "InstituteLogo", "instituteLogo",
  "SchoolLogo", "schoolLogo",
  "HeaderLogo", "headerLogo",
];

const LOGO_CONTAINERS = [
  "institutionInfo", "institution", "instituteInfo",
  "data", "settings", "settingsData", "info", "result", "header",
];

const findInstituteLogo = (source, depth = 0) => {
  if (!source || typeof source !== "object" || depth > 3) return "";

  for (const key of INSTITUTE_LOGO_KEYS) {
    const src = toImageSrc(source[key]);
    if (src) return src;
  }

  for (const box of LOGO_CONTAINERS) {
    const inner = source[box];
    if (inner && typeof inner === "object") {
      const found = findInstituteLogo(Array.isArray(inner) ? inner[0] : inner, depth + 1);
      if (found) return found;
    }
  }

  return "";
};

/** শেষের চারটা সারি — উপস্থিতি আর স্বাক্ষর */
const FOOTER_ROWS = [
  "উপস্থিত",
  "অনুপস্থিত",
  "প্রধান নেগরানের স্বাক্ষর",
  "পরীক্ষকের স্বাক্ষর",
];

/**
 * পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র — রুটিন সহ, হল ধরে ধরে।
 *
 * ⭐ পাতা ভাঙার নিয়ম — এক হলের তালিকা লম্বা হয়ে একাধিক পাতায় গেলে:
 *
 *   মাথার অংশ (প্রতিষ্ঠান, হল, শ্রেণি, তারিখ/বার/সময়, কলামের নাম)
 *     → প্রতি পাতায়। সেজন্যই প্রতিষ্ঠানের অংশটা টেবিলের বাইরে না রেখে
 *       thead এর ভেতরে একটা colSpan সারিতে বসানো — thead ব্রাউজার
 *       নিজেই প্রতি পাতায় পুনরাবৃত্তি করে। বাইরে থাকলে শুধু প্রথম
 *       পাতাতেই থাকত।
 *
 *   শেষের চারটা সারি (উপস্থিত, অনুপস্থিত, দুই স্বাক্ষর)
 *     → প্রতি হলের শেষ পাতায়। এগুলো আগে tfoot এ ছিল, আর tfoot ও প্রতি
 *       পাতায় ছাপে — তাই প্রতি পাতার নিচে স্বাক্ষরের ঘর বসে যাচ্ছিল।
 *       এখন tbody এর শেষে, তাই তালিকার ঠিক পরে একবারই আসে।
 */
const ExamRoutine = ({ reportData, queryParams, instituteLogo = "" }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
    subClassId: queryParams?.SubClassID,
  });
  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const { data: hallList } = useGetExamHallListQuery();

  const getHallName = (hallId) => {
    const hall = hallList?.find((h) => String(h.HallID) === String(hallId));
    return hall?.HallName ?? `হল ${hallId}`;
  };

  const hallEntries = examSeatPlanData ? Object.entries(examSeatPlanData) : [];

  const routine = reportData?.routine ?? [];

  /* মাথার colSpan সারিটা পুরো টেবিল জুড়ে — তিনটা বাঁধা ঘর + কিতাবের ঘরগুলো */
  const totalCols = 3 + routine.length;

  /* ---- কাগজের মাপ।
     হল ধরে ধরে আলাদা পাতা হয়, কিন্তু `@page` একটাই — তাই গোনাটা হয়
     সবচেয়ে বড় হলটা ধরে, নইলে ছোট হল আঁটলেও বড়টা উপচে পড়ত। */
  const maxRows = useMemo(
    () =>
      hallEntries.reduce(
        (max, [, assignments]) => Math.max(max, assignments?.length ?? 0),
        0
      ),
    [hallEntries]
  );

  const autoPaper =
    routine.length > A4_COLUMN_LIMIT || maxRows > A4_ROW_LIMIT ? "legal" : "a4";

  const [paperChoice, setPaperChoice] = useState(null);
  const paper = PAPERS[paperChoice ?? autoPaper] ?? PAPERS.a4;

  /* ---- লোগো। প্রপেরটা আগে, না পেলে রুটের উত্তরে, শেষে settings এ */
  const logoSrc = useMemo(
    () =>
      instituteLogo ||
      findInstituteLogo(reportData) ||
      findInstituteLogo(institutionInfo),
    [instituteLogo, reportData, institutionInfo]
  );

  /* কিতাব বেশি হলে নামের ঘরটা একটু ছোট করে দিই, নইলে কিতাবের ঘরগুলো
     এত সরু হয়ে যায় যে নাম পড়াই যায় না */
  const nameWidth = routine.length > 11 ? 140 : 170;

  /* ═══════════════════════════════════════════════════════════════════════
     পাতা ভাগ — ব্রাউজারের ভরসায় নয়, নিজেরাই

     আগে পুরো মাথাটা (প্রতিষ্ঠান, হল, মারহালা, তারিখ/বার/সময়, কলামের নাম)
     thead এর ভেতরে বসানো ছিল, এই ভেবে যে ব্রাউজার ওটা প্রতি পাতায়
     পুনরাবৃত্তি করবে। করে না — ক্রোম পুনরাবৃত্ত thead পাতার ২৫% এর বেশি
     লম্বা হলে ওটা আর বসায়ই না। A4 ল্যান্ডস্কেপে ২৫% মানে ~১৮৩px, আর
     আমাদের মাথা তার দ্বিগুণেরও বেশি। ফল: এক হলের তালিকা লম্বা হলে
     দ্বিতীয় পাতা শুরু হত সরাসরি সারি দিয়ে।

     এখন প্রতি হলের সারিগুলো কাগজের আসল চওড়ায় মেপে নিয়ে পাতায় ভাগ করা
     হয়, আর প্রতি পাতা নিজের পূর্ণ মাথা নিয়ে আলাদা টেবিল হয়ে বসে।
     ═══════════════════════════════════════════════════════════════════════ */

  const measureRef = useRef(null);
  // { hallId: [[আইটেম…], [আইটেম…]] }
  const [plan, setPlan] = useState(null);

  /* প্রতি হলের আইটেম — শিক্ষার্থীর সারি + শেষের চারটা সারি।
     শেষের সারিগুলোও আইটেম বলে শেষ পাতায় জায়গা না থাকলে নিজেরাই পরের
     পাতায় চলে যায়, অর্ধেক কাটা পড়ে না। */
  const hallItems = useMemo(() => {
    const out = {};
    hallEntries.forEach(([hallId, assignments]) => {
      const n = (assignments?.length ?? 0) + FOOTER_ROWS.length;
      out[hallId] = Array.from({ length: n }, (_, i) => i);
    });
    return out;
  }, [hallEntries]);

  const measureStamp = [
    hallEntries.map(([id, a]) => `${id}:${a?.length ?? 0}`).join(","),
    routine.length,
    paper.key,
    nameWidth,
    Boolean(logoSrc),
    institutionInfo?.InstitutionName,
    subClassData?.SubClass,
  ].join("|");

  useLayoutEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;

      const next = {};
      let gotAny = false;

      /* পরের পাতার মাথা — প্রতিষ্ঠান ছাড়া। সব হলে এর উচ্চতা একই,
         তাই একবার মাপলেই চলে */
      const headRest = box.querySelector('[data-m="rest"] thead');
      if (!headRest) return;

      const availRest = paper.printH - headRest.offsetHeight - SAFETY;
      if (availRest <= 0) return;

      /* ⚠️ খোঁজাটা অবশ্যই [data-m="halls"] এর ভেতরে।

         আগে সরাসরি [data-hall="..."] খোঁজা হত। কিন্তু উপরের "rest"
         টেবিলটাও একই hallId নিয়ে বসে (মাথার উচ্চতা বাস্তবসম্মত রাখতে),
         আর সে DOM এ আগে — তাই প্রথম হলের বেলায় querySelector ঐ ফাঁকা
         টেবিলটাই ধরত, tbody ফাঁকা দেখে ঐ হলটা বাদ পড়ে যেত। ফল: প্রথম
         হলের কোনো plan বসত না, পুরো তালিকা একটাই পাতা হয়ে ব্রাউজারের
         ভাগে পড়ত — আর দ্বিতীয় পাতায় মাথা উধাও। */
      hallEntries.forEach(([hallId]) => {
        const table = box.querySelector(
          `[data-m="halls"] [data-hall="${hallId}"]`
        );
        if (!table) return;

        const headFirst = table.querySelector("thead");
        const trs = Array.from(table.querySelectorAll("tbody tr"));
        if (!headFirst || !trs.length) return;

        const availFirst = paper.printH - headFirst.offsetHeight - SAFETY;
        if (availFirst <= 0) return;

        next[hallId] = packPages(
          trs.map((tr) => tr.offsetHeight || 1),
          (pageIndex) => (pageIndex === 0 ? availFirst : availRest)
        );
        gotAny = true;
      });

      if (!gotAny) return;

      setPlan((prev) =>
        prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    };

    measure();

    /* ফন্ট বা লোগোর ছবি দেরিতে এলে মাপ বদলায় — এসে গেলে আরেকবার */
    let alive = true;
    const again = () => { if (alive) measure(); };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(again).catch(() => {});
    }
    const imgs = measureRef.current
      ? Array.from(measureRef.current.querySelectorAll("img"))
      : [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", again, { once: true });
    });

    return () => {
      alive = false;
      imgs.forEach((img) => img.removeEventListener("load", again));
    };
  }, [measureStamp, hallEntries, paper.printH]);

  /* সব হলের পাতা এক তালিকায় — প্রতিটায় কোন হল, কোন আইটেমগুলো */
  const sheets = useMemo(() => {
    const out = [];
    hallEntries.forEach(([hallId, assignments]) => {
      const items = hallItems[hallId] ?? [];
      const split = plan?.[hallId]?.length ? plan[hallId] : [items];
      split.forEach((pageItems, i) => {
        out.push({
          hallId,
          assignments: assignments ?? [],
          items: pageItems,
          // প্রতি হলের প্রথম পাতাতেই প্রতিষ্ঠানের মাথা বসে
          firstOfHall: i === 0,
        });
      });
    });
    return out;
  }, [hallEntries, hallItems, plan]);

  /* ─── পাতার টুকরোগুলো ───────────────────────────────────────────────
     মাথাটা দুই জায়গায় লাগে — একবার মাপার টেবিলে, একবার আসল পাতায় —
     তাই আলাদা করে রাখা। */

  const renderHead = (hallId, withInstitution) => (
    <thead>
      {/* ---- প্রতিষ্ঠান, হল ও শ্রেণি।

           ⭐ প্রতিষ্ঠানের অংশটা (লোগো, নাম, ঠিকানা, শিরোনাম) শুধু প্রতি
           হলের প্রথম পাতায়। ল্যান্ডস্কেপে ওটা ~১৫০px খায়, প্রতি পাতায়
           বসালে এক পাতায় মাত্র ৮ সারি ধরত। হল ও মারহালার লাইন দুইটা
           অবশ্য প্রতি পাতাতেই থাকে — নিচের তারিখ/বার/সময় আর কলামের
           নামের মতোই। */}
      <tr>
        <td colSpan={totalCols} className="border-0 p-0">
          {withInstitution && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {logoSrc && (
              <img
                src={logoSrc}
                alt=""
                className="h-[70px] w-[70px] object-contain shrink-0"
                style={{
                  WebkitPrintColorAdjust: "exact",
                  printColorAdjust: "exact",
                }}
              />
            )}
            <div className="text-center">
              <h1 className="text-[28px]">
                {institutionInfo?.InstitutionName}
              </h1>
              <p className="text-[20px]">{institutionInfo?.Address}</p>
              <p className="text-[20px] mb-4">
                {examNameData?.ExamName} - {sessionData?.SessionName}
              </p>
              <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px] rounded-[4px]">
                পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র
              </h2>
            </div>
          </div>
          )}

          <div className="mb-2 text-left">
            <p className="font-semibold text-[18px]">
              হল/কক্ষঃ {bnBijoy2Unicode(getHallName(hallId))}
            </p>
            <p className="font-semibold text-[18px] relative">
              মারহালা/শ্রেণীঃ ...................................................
              <span className="absolute left-[150px] bottom-[10px]">
                {subClassData?.SubClass}
              </span>
            </p>
          </div>
        </td>
      </tr>

      <tr>
        <td colSpan={3} className="text-left border border-black p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">তারিখ</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routine.map((item, i) => (
          <td key={i} className="border border-black p-1 bg-white">
            <div className="text-[15px] text-black font-bold leading-tight break-words">
              {item?.ExamDate &&
                bnBijoy2Unicode(formatToDDMMYYYY(item.ExamDate))}
            </div>
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={3} className="text-left border border-black p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">বার</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routine.map((item, i) => (
          <td key={i} className="border border-black p-1 bg-white">
            <div className="text-[15px] font-bold text-[#334155] leading-tight break-words">
              {item?.ExamDay}
            </div>
          </td>
        ))}
      </tr>
      <tr>
        <td colSpan={3} className="text-left border border-0 p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">সময়</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routine.map((item, i) => (
          <td
            key={i}
            className="border border-black p-1 bg-white font-Poppins"
          >
            <div className="text-[13px] text-gray-700 leading-tight break-words">
              {item?.StartTime && item?.EndTime
                ? `${item.StartTime} – ${item.EndTime}`
                : ""}
            </div>
          </td>
        ))}
      </tr>
      <tr>
        <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
          ক্রমিক
        </th>
        <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
          আইডি
        </th>
        <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-center bg-white">
          পরীক্ষার্থীর নাম
        </th>
        {routine.map((item, i) => (
          <th
            key={i}
            className="border border-[#2d5080] text-[14px] font-bold p-1 align-middle text-center bg-white leading-tight break-words"
          >
            {item?.subject?.SubjectName ?? item?.SubjectName}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = (assignments, items) => (
    <tbody>
      {items
        .filter((idx) => idx < assignments.length)
        .map((idx) => {
          const assignment = assignments[idx];
          const index = idx;
          return (
        <tr
          key={assignment.AssignmentID ?? index}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <td className="border border-black text-[16px] font-semibold p-1 bg-white">
            {bnBijoy2Unicode(String(index + 1))}
          </td>
          <td className="border border-black text-[16px] p-1 text-gray-800 bg-white">
            {bnBijoy2Unicode(String(assignment.User?.UserCode ?? ""))}
          </td>
          <td className="border border-black text-[16px] font-medium p-2 text-left bg-white leading-tight break-words">
            {assignment.User?.UserName}
          </td>
          {routine.map((_, i) => (
            <td key={i} className="border border-black h-10 bg-white"></td>
          ))}
        </tr>
          );
        })}

      {/* ---- শেষের চারটা সারি।

           tfoot এ নয়, tbody এর শেষে — কারণ tfoot ও thead এর
           মতোই প্রতি পাতায় ছাপে, তাতে প্রতি পাতার নিচে
           স্বাক্ষরের ঘর বসে যেত। এখানে থাকায় এই হলের
           তালিকার ঠিক পরে একবারই আসে। */}
      {FOOTER_ROWS.map((label, fi) => {
        if (!items.includes(assignments.length + fi)) return null;
        return (
        <tr key={label}>
          <td
            colSpan={3}
            className="border border-black text-[16px] font-bold p-2 text-left align-middle bg-white"
          >
            {label}
          </td>
          {routine.map((_, i) => (
            <td key={i} className="border border-black h-12 bg-white"></td>
          ))}
        </tr>
        );
      })}
    </tbody>
  );

  const renderTable = (hallId, assignments, items, withInstitution = true) => (
    <table
      data-hall={hallId}
      className="sig-sheet w-full table-fixed border border-black border-collapse text-center"
    >
      <colgroup>
        <col style={{ width: "40px" }} />
        <col style={{ width: "80px" }} />
        <col style={{ width: `${nameWidth}px` }} />
        {routine.map((_, i) => (
          <col key={i} />
        ))}
      </colgroup>

      {renderHead(hallId, withInstitution)}
      {renderBody(assignments, items)}
    </table>
  );

  return (
    <>
      {/* কাগজের মাপ — শুধু পর্দায়, প্রিন্টে যায় না */}
      <div className="print:hidden flex items-center justify-end gap-2 px-6 pt-4">
        <span className="text-[14px] text-gray-600">
          কাগজের মাপঃ
          <span className="text-gray-400 text-[13px] ml-1">
            (কিতাব {routine.length}টি)
          </span>
        </span>
        {Object.values(PAPERS).map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPaperChoice(p.key)}
            className={`px-3 py-1 text-[14px] rounded border transition ${
              paper.key === p.key
                ? "bg-[#2d5080] text-white border-[#2d5080]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#2d5080]"
            }`}
          >
            {p.label}
          </button>
        ))}
        {paperChoice && paperChoice !== autoPaper && (
          <button
            type="button"
            onClick={() => setPaperChoice(null)}
            className="px-2 py-1 text-[13px] text-gray-500 underline"
          >
            স্বয়ংক্রিয়
          </button>
        )}
      </div>

      {/* পর্দায় যে মাপ, প্রিন্টেও সেই মাপ।

          thead টা প্রতি পাতায় ফিরে আসে — table-header-group ওটাই বলে।
          একটা সারিও যেন মাঝখান দিয়ে কাটা না পড়ে, সেজন্য tr গুলোতে
          break-inside: avoid। */}
      <style>{`
        @page { size: ${paper.css}; margin: 8mm; }

        /* পর্দায় কাগজের মাপটা দেখানো হয়, যাতে আগেই বোঝা যায় কতটা ধরবে */
        @media screen {
          .sig-page {
            width: ${paper.width};
            min-height: ${paper.minHeight};
          }
        }

        /* প্রিন্টে মাপটা কাগজই ঠিক করে — এখানে width/min-height বসিয়ে রাখলে
           ছাপার জায়গার (মার্জিন বাদে) চেয়ে বড় হয়ে একটা খালি পাতা তৈরি হয় */
        @media print {
          .sig-page {
            width: auto;
            min-height: 0;
            padding: 0;
          }
          .sig-sheet tr    { break-inside: avoid; page-break-inside: avoid; }

          /* ⭐ এক পাতা = একটা সম্পূর্ণ টেবিল।
             প্রতিটার শেষে জোর করে পাতা ভাঙি, শেষটা বাদে — তাই প্রতি পাতা
             নিজের মাথা (প্রতিষ্ঠান, হল, মারহালা, তারিখ/বার/সময়, কলামের
             নাম) নিয়েই ছাপা হয়। হল বদলালেও নতুন পাতা, আগের মতোই। */
          .sig-page { break-after: page; page-break-after: always; }

          /* ⚠️ :last-of-type নয় — সবশেষ ভাই-ভাইটা মাপার div, তাই ওটা
             কোনো .sig-page কেই ধরত না, আর শেষ পাতার পরেও একটা খালি পাতা
             বেরোত। তাই শেষ পাতাটা নিজেই একটা ক্লাস নিয়ে আসে। */
          .sig-page.sig-last { break-after: auto; page-break-after: auto; }

          /* মাপার টেবিলগুলো কাগজে দরকার নেই */
          .sig-measure { display: none !important; }
        }
      `}</style>

      {/* ── পাতাগুলো — হল ধরে ধরে, প্রতিটা নিজের মাথা নিয়ে ───── */}
      {sheets.map((sheet, i) => (
        <div
          key={`${sheet.hallId}-${i}`}
          className={`sig-page mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi] ${
            i === 0 ? "" : "mt-6 print:mt-0"
          } ${i === sheets.length - 1 ? "sig-last" : ""}`}
        >
          {renderTable(sheet.hallId, sheet.assignments, sheet.items, sheet.firstOfHall)}
        </div>
      ))}

      {/* ── মাপার টেবিল ────────────────────────────────────────────
           পর্দায়ও নেই, কাগজেও নেই — শুধু মাপার জন্য। প্রতি হলের পুরো
           তালিকা কাগজের আসল চওড়ায় বসানো, তাই কিতাব ও পরীক্ষার্থীর নাম
           যেভাবে ভেঙে ছাপা হবে ঠিক সেভাবেই এখানে ভাঙে। */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="sig-measure bg-white text-black text-[14px] font-[SolaimanLipi]"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: `${paper.printW}px`,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {/* পরের পাতার মাথা — প্রতিষ্ঠান ছাড়া, শুধু উচ্চতা মাপার জন্য */}
        <div data-m="rest">
          {renderTable(hallEntries[0]?.[0] ?? "", [], [], false)}
        </div>

        {/* প্রতি হলের প্রথম পাতার মাথা + ঐ হলের সব সারি */}
        <div data-m="halls">
          {hallEntries.map(([hallId, assignments]) => (
            <div key={hallId}>
              {renderTable(hallId, assignments ?? [], hallItems[hallId] ?? [], true)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExamRoutine;
