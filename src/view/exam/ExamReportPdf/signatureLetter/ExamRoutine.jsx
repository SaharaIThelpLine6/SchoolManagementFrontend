import { useMemo, useState } from "react";
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

const PAPERS = {
  a4: {
    key: "a4",
    label: "এ-ফোর",
    css: "A4 landscape",
    width: "297mm",
    minHeight: "210mm",
  },
  legal: {
    key: "legal",
    label: "লিগ্যাল",
    css: "legal landscape",
    width: "356mm",
    minHeight: "216mm",
  },
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
          .sig-sheet thead { display: table-header-group; }
          .sig-sheet tr    { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="sig-page mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
        {hallEntries.length > 0 &&
          hallEntries.map(([hallId, assignments], hallIndex) => (
            <div key={hallId} className={hallIndex > 0 ? "break-before-page" : ""}>
              <table className="sig-sheet w-full table-fixed border border-black border-collapse text-center">
                <colgroup>
                  <col style={{ width: "40px" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: `${nameWidth}px` }} />
                  {routine.map((_, i) => (
                    <col key={i} />
                  ))}
                </colgroup>

                <thead>
                  {/* ---- প্রতিষ্ঠান, হল ও শ্রেণি — thead এ, তাই প্রতি পাতায় */}
                  <tr>
                    <td colSpan={totalCols} className="border-0 p-0">
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

                <tbody>
                  {assignments?.map((assignment, index) => (
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
                  ))}

                  {/* ---- শেষের চারটা সারি।

                       tfoot এ নয়, tbody এর শেষে — কারণ tfoot ও thead এর
                       মতোই প্রতি পাতায় ছাপে, তাতে প্রতি পাতার নিচে
                       স্বাক্ষরের ঘর বসে যেত। এখানে থাকায় এই হলের
                       তালিকার ঠিক পরে একবারই আসে। */}
                  {FOOTER_ROWS.map((label) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </>
  );
};

export default ExamRoutine;
