import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Buffer } from "buffer";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetExamNameQuery,
  useGetGetStudentListQuery,
} from "../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../features/class/classQuerySlice";
import { useGetSessionQuery } from "../../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../../utils/dateFormat";

/* ---- fixed column widths (px) ---- */
const SL_W = 40;      // ক্রমিক
const ID_W = 80;      // আইডি

/* ═══════════════════════════════════════════════════════════════════════════
   কাগজের মাপ — ল্যান্ডস্কেপ (ExamRoutine এর সাথে এক নিয়মেই)

   হিসাবটা (৮মিমি মার্জিন ধরে):

     এ-ফোর ল্যান্ডস্কেপ   ২৯৭মিমি → ছাপার চওড়া ≈ ১০৬২px
     লিগ্যাল ল্যান্ডস্কেপ  ৩৫৬মিমি → ছাপার চওড়া ≈ ১২৮৫px

   ক্রমিক (৪০) + আইডি (৮০) + নাম (১৭০) = ২৯০px বাঁধা, বাকিটা কিতাবের ঘরে।
   বাংলা কিতাবের নাম দুই-তিন লাইনে ভেঙে পড়তে ঘরপ্রতি অন্তত ~৯০px লাগে:

     ১–৮ কিতাব    → এ-ফোর   (৭৭২px ÷ ৮ = ৯৬px)
     ৯–১১ কিতাব   → লিগ্যাল  (৯৯৫px ÷ ১১ = ৯০px)
     ১২–১৪ কিতাব  → লিগ্যাল, নামের ঘর ১৪০px এ নেমে যায়

   ⭐ রুটিন বিহীনে শর্ত না পেলে ১৪টা ফাঁকা ঘর বসে, তাই ঐ অবস্থায় নিজে
   থেকেই লিগ্যাল হয়ে যায়।
   ═══════════════════════════════════════════════════════════════════════════ */
const A4_ROW_LIMIT = 16;
const A4_COLUMN_LIMIT = 8;

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
   প্রতিষ্ঠানের লোগো — ExamReportList এর হুবহু একই খোঁজা

   ⭐ toImageSrc টাই আসল: লোগো SQL Server এ varbinary, তাই রুট থেকে বাইট
   হয়ে আসে — { type: 'Buffer', data: [...] }। সরাসরি <img src> এ বসালে
   কিছুই দেখা যায় না, আগে base64 এ বদলাতে হয়।
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
 * পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র — রুটিন বিহীন।
 *
 * ⭐ এই কাগজটা সিট প্ল্যানের উপর নির্ভর করে না, রুটিনের উপরেও না।
 *
 * আগে এখানে একটা গেট ছিল — সিট প্ল্যান না থাকলে কম্পোনেন্টটা `null`
 * ফেরত দিত, মানে পুরো পাতাটাই উধাও। ফলে যে মাদরাসায় শ্রেণিবিন্যাস এখনো
 * করা হয়নি, সেখানে এই কাগজটা একদম সাদা আসত — অথচ শিক্ষার্থীর তালিকা,
 * প্রতিষ্ঠানের নাম, শ্রেণি সবই হাতে ছিল। কোয়েরিটাসহ তুলে দেওয়া হয়েছে।
 *
 * ⭐ কিতাবের নাম — রুটিন না থাকলে এখন আর ঘরগুলো ফাঁকা যায় না।
 *
 * রুটিন বানানোর আগে পরীক্ষার শর্তে কিতাবগুলো বাছাই করা হয়, রুটিন ওই
 * বাছাই ধরেই তৈরি হয়। তাই রুটিন না থাকলেও এই পরীক্ষায় কোন কোন কিতাব
 * আছে সেটা শর্ত দেখেই জানা যায় — ব্যাকএন্ড ওটা `conditionSubjects` এ
 * পাঠায়, রুটিনের সারির হুবহু একই চেহারায় (`subject` নেস্ট করা)। তাই
 * আলাদা কোনো নিয়ম লিখতে হয়নি, একই কলাম রেন্ডারার দুইটাতেই চলে।
 *
 * শর্তও না থাকলে আগের আচরণ — ১৪টা ফাঁকা ঘর, শিক্ষক হাতে লিখে নেন।
 *
 * ⭐ পাতা ভাঙার নিয়ম — তালিকা লম্বা হলে কাগজ একাধিক পাতায় যায়, তখন:
 *
 *   মাথার অংশ (প্রতিষ্ঠান, শ্রেণি, তারিখ/বার/সময়, কলামের নাম)
 *     → প্রতি পাতায়। সেজন্যই প্রতিষ্ঠানের অংশটা টেবিলের বাইরে না রেখে
 *       thead এর ভেতরে একটা colSpan সারিতে বসানো — thead ব্রাউজার
 *       নিজেই প্রতি পাতায় পুনরাবৃত্তি করে। বাইরে থাকলে শুধু প্রথম
 *       পাতাতেই থাকত।
 *
 *   শেষের চারটা সারি (উপস্থিত, অনুপস্থিত, দুই স্বাক্ষর)
 *     → শুধু শেষ পাতায়। এগুলো আগে tfoot এ ছিল, আর tfoot ও প্রতি পাতায়
 *       ছাপে — তাই প্রতি পাতার নিচে স্বাক্ষরের ঘর বসে যাচ্ছিল। এখন
 *       tbody এর শেষে, তাই তালিকার ঠিক পরে একবারই আসে।
 *
 * `requireSeatPlan` প্রপটা রাখা হয়েছে শুধু পুরোনো কল ভাঙবে না বলে —
 * এখন এটা কিছুই করে না।
 */
const WithoutExamRoutine = ({
  reportData,
  queryParams,
  instituteLogo = "",
  requireSeatPlan = false,
}) => {
  const hasReportStudentList = Array.isArray(reportData?.studentList);
  const { data: studentData } = useGetGetStudentListQuery(
    !hasReportStudentList &&
      queryParams?.SessionID &&
      queryParams?.ExamID &&
      queryParams?.SubClassID
      ? {
          SessionID: queryParams.SessionID,
          ExamID: queryParams.ExamID,
          SubClassID: queryParams.SubClassID,
        }
      : skipToken
  );
  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const assignments = reportData?.studentList ?? [
    ...(studentData?.Exam_StudentLoadView ?? []),
    ...(studentData?.Exam_StudentUnloadView ?? []),
  ];

  /* ---- কিতাবের কলামগুলো
     PdfID ১  → রুটিন থেকে (তারিখ, বার, সময়, কিতাব — সবই আসে)
     PdfID ২  → রুটিন বিহীন। শর্তের কিতাবগুলো বসে, তারিখ/বার/সময় ফাঁকা।
                শর্তও না থাকলে ১৪টা ফাঁকা ঘর, আগের মতোই। */
  const routineColumns = useMemo(() => {
    if (Number(queryParams?.PdfID) === 1) return reportData?.routine ?? [];

    const conditionSubjects = reportData?.conditionSubjects ?? [];
    if (conditionSubjects.length) return conditionSubjects;

    return Array.from({ length: 14 });
  }, [queryParams?.PdfID, reportData?.routine, reportData?.conditionSubjects]);

  const colCount = routineColumns.length || 1;

  /* মাথার colSpan সারিটা পুরো টেবিল জুড়ে — তিনটা বাঁধা ঘর + কিতাবের ঘরগুলো */
  const totalCols = 3 + routineColumns.length;

  /* কিতাব বেশি হলে নামের ঘরটা একটু ছোট, নইলে কিতাবের ঘর পড়াই যায় না */
  const nameWidth = colCount > 11 ? 140 : 170;
  const fixedW = SL_W + ID_W + nameWidth;
  const colWidth = `calc((100% - ${fixedW}px) / ${colCount})`;

  /* ---- কাগজের মাপ */
  const autoPaper =
    colCount > A4_COLUMN_LIMIT || assignments.length > A4_ROW_LIMIT ? "legal" : "a4";

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

  /* ═══════════════════════════════════════════════════════════════════════
     পাতা ভাগ — ব্রাউজারের ভরসায় নয়, নিজেরাই

     আগে পুরো মাথাটা (প্রতিষ্ঠান, মারহালা, তারিখ/বার/সময়, কলামের নাম)
     thead এর ভেতরে বসানো ছিল, এই ভেবে যে ব্রাউজার ওটা প্রতি পাতায়
     পুনরাবৃত্তি করবে। করে না — ক্রোম পুনরাবৃত্ত thead পাতার ২৫% এর বেশি
     লম্বা হলে ওটা আর বসায়ই না (নইলে টেবিলটা কখনো এগোত না)। A4
     ল্যান্ডস্কেপে ২৫% মানে ~১৮৩px, আর আমাদের মাথা তার দ্বিগুণেরও বেশি।
     ফল: দ্বিতীয় পাতা শুরু হত সরাসরি সারি দিয়ে — না মারহালা, না
     তারিখ/বার/সময়, না কলামের নাম।

     তাই এখন সারিগুলো আগে কাগজের আসল চওড়ায় মেপে নিয়ে পাতায় পাতায় ভাগ
     করা হয়, আর প্রতি পাতা নিজের পূর্ণ মাথা নিয়ে আলাদা টেবিল হয়ে বসে।
     ═══════════════════════════════════════════════════════════════════════ */

  /* শেষের চারটা সারিও পাতায় জায়গা নেয়, তাই ওগুলোও আইটেম — শেষ পাতায়
     জায়গা না থাকলে নিজেরাই পরের পাতায় চলে যায়, অর্ধেক কাটা পড়ে না */
  const itemCount = assignments.length + FOOTER_ROWS.length;
  const allItems = useMemo(
    () => Array.from({ length: itemCount }, (_, i) => i),
    [itemCount]
  );

  const measureRef = useRef(null);
  const [plan, setPlan] = useState(null);
  const pages = plan && plan.length ? plan : [allItems];

  /* মাপা নতুন করে দরকার কখন — এগুলোর কোনোটা বদলালে */
  const measureStamp = [
    itemCount,
    colCount,
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

      /* দুইটা মাথা আলাদা করে মাপি — প্রথম পাতারটা প্রতিষ্ঠানসহ,
         পরের পাতাগুলোরটা ছাড়া */
      const headFirst = box.querySelector('[data-m="first"] thead');
      const headRest = box.querySelector('[data-m="rest"] thead');
      const trs = Array.from(box.querySelectorAll('[data-m="first"] tbody tr'));
      if (!headFirst || !headRest || !trs.length) return;

      const availFirst = paper.printH - headFirst.offsetHeight - SAFETY;
      const availRest = paper.printH - headRest.offsetHeight - SAFETY;
      if (availFirst <= 0 || availRest <= 0) return;

      const next = packPages(
        trs.map((tr) => tr.offsetHeight || 1),
        (pageIndex) => (pageIndex === 0 ? availFirst : availRest)
      );

      // একই ফল হলে আবার রেন্ডার করিয়ে লাভ নেই
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
    // assignments বদলালেও আবার মাপা দরকার — লম্বা নাম সারি লম্বা করে দেয়
  }, [measureStamp, assignments]);

  /* ─── পাতার টুকরোগুলো ───────────────────────────────────────────────
     মাথাটা দুই জায়গায় লাগে — একবার মাপার টেবিলে, একবার আসল পাতায় —
     তাই আলাদা করে রাখা। */

  const renderHead = (withInstitution) => (
    <thead>
      {/* ---- প্রতিষ্ঠানের মাথা ও শ্রেণি।

           ⭐ প্রতিষ্ঠানের অংশটা (লোগো, নাম, ঠিকানা, শিরোনাম) শুধু প্রথম
           পাতায়। ল্যান্ডস্কেপে ওটা ~১৫০px খায়, প্রতি পাতায় বসালে এক
           পাতায় মাত্র ৮ সারি ধরত। মারহালা/শ্রেণীর লাইনটা অবশ্য প্রতি
           পাতাতেই থাকে — নিচের তারিখ/বার/সময় আর কলামের নামের মতোই। */}
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
              <h1 className="text-[28px]">{institutionInfo?.InstitutionName}</h1>
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
            <p className="font-semibold text-[18px] relative">
              মারহালা/শ্রেণীঃ ...................................................
              <span className="absolute left-[150px] bottom-[10px]">
                {subClassData?.SubClass}
              </span>
            </p>
          </div>
        </td>
      </tr>

      {/* তারিখ */}
      <tr>
        <td colSpan={3} className="text-left border border-black p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">তারিখ</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routineColumns.map((item, i) => (
          <td key={i} className="border border-black p-1 bg-white align-middle">
            <div className="text-[14px] text-black font-bold leading-tight break-words">
              {item?.ExamDate &&
                bnBijoy2Unicode(formatToDDMMYYYY(item.ExamDate))}
            </div>
          </td>
        ))}
      </tr>

      {/* বার */}
      <tr>
        <td colSpan={3} className="text-left border border-black p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">বার</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routineColumns.map((item, i) => (
          <td key={i} className="border border-black p-1 bg-white align-middle">
            <div className="text-[14px] font-bold text-[#334155] leading-tight break-words">
              {item?.ExamDay}
            </div>
          </td>
        ))}
      </tr>

      {/* সময় */}
      <tr>
        <td colSpan={3} className="text-left border-0 p-1 bg-white">
          <div className="flex gap-6 items-center">
            <span className="block w-10 text-[16px] font-bold">সময়</span>
            <span>{"------>>"}</span>
          </div>
        </td>
        {routineColumns.map((item, i) => (
          <td
            key={i}
            className="border border-black p-1 bg-white font-Poppins align-middle"
          >
            <div className="text-[12px] text-gray-700 leading-tight break-words">
              {item?.StartTime && item?.EndTime
                ? `${item.StartTime} – ${item.EndTime}`
                : ""}
            </div>
          </td>
        ))}
      </tr>

      {/* কলামের নাম */}
      <tr>
        <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle bg-white">
          ক্রমিক
        </th>
        <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle bg-white">
          আইডি
        </th>
        <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle text-center bg-white">
          পরীক্ষার্থীর নাম
        </th>
        {routineColumns.map((item, i) => (
          <th
            key={i}
            className="border border-[#2d5080] text-[13px] font-bold p-1 align-middle text-center bg-white leading-tight break-words hyphens-auto"
          >
            {item?.subject?.SubjectName ?? item?.SubjectName}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderBody = (items) => (
    <tbody>
      {items
        .filter((idx) => idx < assignments.length)
        .map((idx) => {
          const student = assignments[idx];
          const index = idx;
          return (
        <tr
          key={student.UserID ?? student.User?.UserID ?? student.UserCode ?? index}
          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
        >
          <td className="border border-black text-[15px] font-semibold p-1 align-middle">
            {bnBijoy2Unicode(String(index + 1))}
          </td>
          <td className="border border-black text-[15px] p-1 text-gray-800 align-middle">
            {bnBijoy2Unicode(
              String(student.User?.UserCode ?? student.UserCode ?? "")
            )}
          </td>
          <td className="border border-black text-[15px] font-medium p-2 text-left align-middle leading-tight break-words">
            {student.User?.UserName ?? student.UserName}
          </td>
          {routineColumns.map((_, i) => (
            <td key={i} className="border border-black h-10 bg-white"></td>
          ))}
        </tr>
          );
        })}

      {/* ---- শেষের চারটা সারি।

           tfoot এ নয়, tbody এর শেষেই — tfoot প্রতি পাতায় ছাপে, তাতে
           প্রতি পাতার নিচে স্বাক্ষরের ঘর বসে যেত। এখন এগুলোও পাতা
           ভাগের আইটেম, তাই তালিকার ঠিক পরে একবারই আসে — আর শেষ পাতায়
           জায়গা না থাকলে নিজেরাই পরের পাতায় চলে যায়, অর্ধেক কাটা
           পড়ে না। */}
      {FOOTER_ROWS.map((label, fi) => {
        if (!items.includes(assignments.length + fi)) return null;
        return (
        <tr key={label}>
          <td
            colSpan={3}
            className="border border-black text-[15px] font-bold p-2 text-left align-middle bg-white"
          >
            {label}
          </td>
          {routineColumns.map((_, i) => (
            <td key={i} className="border border-black h-12 bg-white"></td>
          ))}
        </tr>
        );
      })}
    </tbody>
  );

  const renderTable = (items, withInstitution = true) => (
    <table className="sig-sheet w-full table-fixed border border-black border-collapse text-center">
      <colgroup>
        <col style={{ width: `${SL_W}px` }} />
        <col style={{ width: `${ID_W}px` }} />
        <col style={{ width: `${nameWidth}px` }} />
        {routineColumns.map((_, i) => (
          <col key={i} style={{ width: colWidth }} />
        ))}
      </colgroup>

      {renderHead(withInstitution)}
      {renderBody(items)}
    </table>
  );

  return (
    <>
      {/* কাগজের মাপ — শুধু পর্দায়, প্রিন্টে যায় না */}
      <div className="print:hidden flex items-center justify-end gap-2 px-6 pt-4">
        <span className="text-[14px] text-gray-600">
          কাগজের মাপঃ
          <span className="text-gray-400 text-[13px] ml-1">
            (কিতাব {colCount}টি)
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
             নিজের মাথা (প্রতিষ্ঠান, মারহালা, তারিখ/বার/সময়, কলামের নাম)
             নিয়েই ছাপা হয়। */
          .sig-page { break-after: page; page-break-after: always; }

          /* ⚠️ :last-of-type নয় — সবশেষ ভাই-ভাইটা মাপার div, তাই ওটা
             কোনো .sig-page কেই ধরত না, আর শেষ পাতার পরেও একটা খালি পাতা
             বেরোত। তাই শেষ পাতাটা নিজেই একটা ক্লাস নিয়ে আসে। */
          .sig-page.sig-last { break-after: auto; page-break-after: auto; }

          /* মাপার টেবিলটা কাগজে দরকার নেই */
          .sig-measure { display: none !important; }
        }
      `}</style>

      {/* ── পাতাগুলো — প্রতিটা নিজের মাথা নিয়ে ───────────────── */}
      {pages.map((items, i) => (
        <div
          key={i}
          className={`sig-page mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi] ${
            i === 0 ? "" : "mt-6 print:mt-0"
          } ${i === pages.length - 1 ? "sig-last" : ""}`}
        >
          {renderTable(items, i === 0)}
        </div>
      ))}

      {/* ── মাপার টেবিল ────────────────────────────────────────────
           পর্দায়ও নেই, কাগজেও নেই — শুধু মাপার জন্য। কাগজের আসল চওড়ায়
           বসানো, তাই কিতাবের নাম ও পরীক্ষার্থীর নাম যেভাবে ভেঙে ছাপা হবে
           ঠিক সেভাবেই এখানে ভাঙে, আর সারির উচ্চতাও আসলটাই পাওয়া যায়। */}
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
        <div data-m="rest">{renderTable([], false)}</div>

        {/* প্রথম পাতার মাথা + সব সারি */}
        <div data-m="first">{renderTable(allItems, true)}</div>
      </div>
    </>
  );
};

export default WithoutExamRoutine;
