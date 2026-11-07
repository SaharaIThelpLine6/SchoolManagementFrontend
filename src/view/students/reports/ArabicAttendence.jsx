import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import ReportSortControl from "./student-report-list/ReportSortControl";

// ✅ আরবি সংখ্যায় রূপান্তর — টেক্সটের ভেতরের ইংরেজি ডিজিটও বদলে যাবে
// (যেমন SessionAraName = "1448 هـ" → "١٤٤٨ هـ")
const toArabicNumber = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num.toString().replace(/\d/g, (x) => arabicDigits[x]);
};

// ✅ আরবি মাসের নাম
const ARABIC_MONTHS = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

// ✅ বার — index 0 = শনিবার (السبت), 6 = শুক্রবার (الجمعة)
const WEEKDAYS_AR = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];
const FRIDAY_INDEX = 6;

// ✅ লোডিং ও খালি অবস্থার আরবি বার্তা
const LOADING_MSG_AR = "جاري تحميل البيانات ...";
const EMPTY_MSG_AR = "لم يتم العثور على أي بيانات";
const EMPTY_HINT_AR = "يرجى اختيار العام الدراسي والفئة ثم المحاولة مرة أخرى";

// ✅ কলামের প্রস্থ — table-fixed এ min-w কাজ করে না, তাই ফিক্সড px
const COL_W = {
  serial: 24,    // م
  admission: 30, // رقم القيد — Student_Admission.AdmissionSerial
  code: 36,      // الرقم الأكاديمي
  name: 120,     // أسماء الطالبة
  day: 14,       // তারিখের ঘর
  total: 24,     // المجموع
};

// ✅ পৃষ্ঠার দিক (Portrait / Landscape) — BanglaAttendence এর সাথে একই key,
//    তাই ভাষা বদলালেও একই সেটিং থাকবে
const ORIENTATION_KEY = "studentReport_attendanceOrientation";
const ROWS_KEY = "studentReport_attendanceRows";
const ROW_HEIGHT_KEY = "studentReport_attendanceRowHeight";

const readNumber = (key, fallback, min) => {
  if (typeof window === "undefined") return fallback;
  try {
    const n = Number(localStorage.getItem(key));
    return Number.isFinite(n) && n >= min ? n : fallback;
  } catch {
    return fallback;
  }
};

const readOrientation = () => {
  if (typeof window === "undefined") return "portrait";
  try {
    return localStorage.getItem(ORIENTATION_KEY) === "landscape" ? "landscape" : "portrait";
  } catch {
    return "portrait";
  }
};

const ArabicAttendence = ({
  reportData,
  SubClassID,
  SessionID,
  isLoading = false,
  rowsPerPage = { portrait: 35, landscape: 30 },
  // ↕️ সাজানো — গ্লোবাল ফিল্টার থেকে আসে
  sortBy,
  sortDir,
  onSortChange,
}) => {
  const [logo, setLogo] = useState(null);

  // ✅ পৃষ্ঠার দিক
  const [orientation, setOrientation] = useState(readOrientation);
  useEffect(() => {
    try {
      localStorage.setItem(ORIENTATION_KEY, orientation);
    } catch {
      /* ignore */
    }
  }, [orientation]);

  // ✅ প্রতি পেজে কয়টি রো + প্রতিটি রো কত উঁচু
  const settingsRows = rowsPerPage?.portrait || 35;
  const [rowsPerPageInput, setRowsPerPageInput] = useState(() =>
    readNumber(ROWS_KEY, settingsRows, 1)
  );
  const [rowHeight, setRowHeight] = useState(() => readNumber(ROW_HEIGHT_KEY, 22, 10));

  useEffect(() => {
    try {
      localStorage.setItem(ROWS_KEY, String(rowsPerPageInput));
      localStorage.setItem(ROW_HEIGHT_KEY, String(rowHeight));
    } catch {
      /* ignore */
    }
  }, [rowsPerPageInput, rowHeight]);

  const isLandscape = orientation === "landscape";

  // 🔴 প্রিভিউ আর প্রিন্ট — দুইটাই হুবহু একই বক্স।
  //    @page margin: 0 দিয়ে পুরো A4 শিটটাই নেওয়া হচ্ছে, আর পেজের ভেতরের
  //    মার্জিন কন্টেইনারের padding দিয়ে। ফলে ব্রাউজারের "printable area"
  //    হিসাব করার দরকার নেই — যা স্ক্রিনে দেখছো ঠিক তাই ছাপবে।
  //    (96dpi: 210mm = 794px, 297mm = 1123px; ১-২px স্ল্যাক রাখা হয়েছে
  //     যাতে রাউন্ডিং এর কারণে পরের শিটে না গড়ায়।)
  const PAGE = isLandscape
    ? { w: 1123, h: 790, padX: 24, padY: 18, size: "A4 landscape" }
    : { w: 794, h: 1118, padX: 24, padY: 18, size: "A4 portrait" };

  const { data: instutionInfo, isLoading: institutionLoading } =
    useGetInstitutionInfoQuery();
  const { data: subClassListData, isLoading: subClassLoading } =
    useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  const { data: sessionSData, isLoading: sessionLoading } = useGetSessionsQuery();
  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  // ✅ parent এর reportData লোডিং + নিজের query গুলোর লোডিং একসাথে
  const showLoading =
    isLoading || institutionLoading || subClassLoading || sessionLoading;

  // ✅ Institution_Information এর আরবি ফিল্ড — না থাকলে বাংলা/ইংরেজিতে ফallback
  const araInstitutionName =
    instutionInfo?.AraInstitutionName || instutionInfo?.InstitutionName || "";
  const araAddress = instutionInfo?.AraAddress || instutionInfo?.Address || "";

  // ✅ Academic_Session এর SessionAraName — ইংরেজি ডিজিট থাকলে আরবিতে রূপান্তর
  const araSessionName =
    toArabicNumber(sessionData?.SessionAraName) ||
    toArabicNumber(sessionData?.SessionName) ||
    "______";

  // 🔹 DEMO ডাটা সরানো হয়েছে — শুধু backend এর reportData ব্যবহার হবে
  const students = useMemo(
    () => (Array.isArray(reportData) ? reportData : []),
    [reportData]
  );

  // ✅ Academic_Class.ArabicClass — স্টুডেন্ট ডাটার সাথেই আসে।
  // না পেলে subClassList থেকে ফallback (রুট ভেদে nested বা flat হতে পারে)।
  const araClassName =
    students[0]?.ArabicClass ||
    subClasData?.Class?.ArabicClass ||
    subClasData?.ArabicClass ||
    "";

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  // ✅ আরবি মাস ও শুরুর বার — ইউজারের নির্বাচন
  const [selectedMonthIdx, setSelectedMonthIdx] = useState("");
  const [startWeekday, setStartWeekday] = useState("");

  // ✅ ১ থেকে ৩০ দিন (নতুন ডিজাইন অনুযায়ী)
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  // ✅ শুক্রবার (الجمعة) কিনা নির্ধারণ
  const isFriday = (dayNum) => {
    if (startWeekday === "") return false;
    return (Number(startWeekday) + (dayNum - 1)) % 7 === FRIDAY_INDEX;
  };

  const [manualEmptyRows, setManualEmptyRows] = useState(0);

  useEffect(() => {
    setManualEmptyRows(0);
  }, [reportData, SubClassID, SessionID]);

  const ROWS_PER_PAGE = Math.max(1, Number(rowsPerPageInput) || 1);

  const chunks = useMemo(() => {
    if (!students || students.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < students.length; i += ROWS_PER_PAGE) {
      chunked.push(students.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
  }, [students, ROWS_PER_PAGE]);

  const remainingSpace = Math.max(
    0,
    ROWS_PER_PAGE - (chunks[chunks.length - 1]?.length || 0)
  );

  return (
    <div
      dir="rtl"
      className="ar-att font-arabic bg-white text-xs p-4 sm:p-6"
      style={{
        fontFamily:
          "'Noto Naskh Arabic','Amiri','Scheherazade New','Traditional Arabic',serif",
      }}
    >
      <style>
        {`
          @keyframes arabic-attendence-spin {
            to { transform: rotate(360deg); }
          }
          .arabic-attendence-spinner {
            animation: arabic-attendence-spin 0.8s linear infinite;
          }

          /* ✅ লম্বালম্বি লেখা — <th> এ transform দিলে border-collapse এর
             উপরের লাইনটা প্রিন্টে মুছে যায়, তাই ভেতরের <span> এ */
          .ar-att .vertical-text {
            display: inline-block;
            writing-mode: vertical-rl;
            text-orientation: mixed;
            transform: rotate(180deg);
            height: 55px;
            padding: 2px 0;
            font-size: 11px;
            font-weight: bold;
            line-height: 1;
          }

          /* 🔴 প্রিভিউ = প্রিন্ট — একই বক্স, একই padding, একই overflow */
          .ar-att .print-page-container {
            width: ${PAGE.w}px;
            height: ${PAGE.h}px;
            max-width: 100%;
            padding: ${PAGE.padY}px ${PAGE.padX}px;
            margin: 0 auto 18px auto;
            background: #fff;
            overflow: hidden;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            box-shadow: 0 0 6px rgba(0,0,0,0.15);
          }

          @media print {
            @page {
              size: ${PAGE.size};
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box;
              background: white;
            }
            .ar-att {
              padding: 0 !important;
              margin: 0 !important;
            }
            .ar-att .print-page-container {
              width: ${PAGE.w}px !important;
              height: ${PAGE.h}px !important;
              max-width: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              overflow: hidden !important;
              page-break-after: always;
              page-break-inside: avoid;
              break-after: page;
            }
            .ar-att .print-page-container:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse !important;
              table-layout: fixed;
              width: 100%;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            /* 🔹 শুধু বর্ডারের রঙ নিশ্চিত করা — ফন্ট সাইজ বা padding এখানে
               দিলে প্রিভিউর সাথে প্রিন্ট আর মিলত না */
            th, td {
              border: 1px solid black !important;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* ✅ লোডিং পপআপ — ডাটা আসতে দেরি হলে এটা দেখা যাবে (প্রিন্টে যাবে না) */}
      {showLoading && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="status"
          aria-live="polite"
        >
          <div className="bg-white rounded-lg shadow-xl px-8 py-6 flex flex-col items-center gap-3 min-w-[240px]">
            <span
              className="arabic-attendence-spinner inline-block w-9 h-9 rounded-full border-4 border-slate-200"
              style={{ borderTopColor: "#1B3A57" }}
            />
            <span className="text-[15px] font-bold text-[#1B3A57]">
              {LOADING_MSG_AR}
            </span>
            <span className="text-xs text-slate-500">
              অনুগ্রহ করে অপেক্ষা করুন...
            </span>
          </div>
        </div>
      )}

      {/* ✅ কন্ট্রোল প্যানেল */}
      <div
        dir="ltr"
        className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-end gap-3"
      >
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            আরবি মাস
          </label>
          <select
            value={selectedMonthIdx}
            onChange={(e) => setSelectedMonthIdx(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="">-- নির্বাচন করুন --</option>
            {ARABIC_MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            ১ তারিখের বার
          </label>
          <select
            value={startWeekday}
            onChange={(e) => setStartWeekday(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="">-- নির্বাচন করুন --</option>
            {WEEKDAYS_AR.map((w, i) => (
              <option key={i} value={i}>
                {w}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ পৃষ্ঠার দিক — Portrait / Landscape */}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">পৃষ্ঠার দিক</label>
          <select
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="portrait">Portrait (লম্বালম্বি)</option>
            <option value="landscape">Landscape (আড়াআড়ি)</option>
          </select>
        </div>

        {/* ✅ প্রতি পেজে কয়টি রো */}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">প্রতি পেজে রো</label>
          <input
            type="number"
            min={1}
            max={80}
            value={rowsPerPageInput}
            onChange={(e) => setRowsPerPageInput(e.target.value === "" ? "" : Number(e.target.value))}
            onBlur={(e) => {
              const n = Number(e.target.value);
              setRowsPerPageInput(Number.isFinite(n) && n >= 1 ? Math.min(80, n) : 1);
            }}
            className="w-28 border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          />
        </div>

        {/* ✅ রো-এর উচ্চতা */}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">
            রো-এর উচ্চতা ({toArabicNumber(rowHeight)}px)
          </label>
          <input
            type="range"
            min={12}
            max={34}
            value={rowHeight}
            onChange={(e) => setRowHeight(Number(e.target.value))}
            className="w-36 accent-[#1B3A57] align-middle"
          />
        </div>

        {/* ↕️ সাজানো */}
        <ReportSortControl sortBy={sortBy} sortDir={sortDir} onChange={onSortChange} />

        {selectedMonthIdx !== "" && startWeekday !== "" && (
          <div className="text-xs text-slate-700 bg-red-50 border border-red-200 rounded px-3 py-1.5">
            <span className="font-semibold text-red-700">
              শুক্রবার (الجمعة):{" "}
            </span>
            {days.filter(isFriday).map((d) => toArabicNumber(d)).join(", ") ||
              "নেই"}{" "}
            তারিখ
          </div>
        )}
      </div>

      {/* ✅ শেষ পেজে খালি ঘর নিয়ন্ত্রণ প্যানেল */}
      {chunks.length > 0 && (
        <div
          dir="ltr"
          className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center gap-3"
        >
          <span className="text-sm font-semibold text-slate-700">
            শেষ পেজে খালি ঘর:
          </span>
          <span className="text-sm font-bold text-[#1B3A57]">
            {toArabicNumber(manualEmptyRows)} টি
          </span>

          <button
            onClick={() => setManualEmptyRows((n) => n + 1)}
            disabled={manualEmptyRows >= remainingSpace}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
              manualEmptyRows >= remainingSpace
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-[#1B3A57] text-white hover:bg-[#1B3A57]/90"
            }`}
          >
            + একটি খালি ঘর
          </button>

          <button
            onClick={() => setManualEmptyRows((n) => Math.max(0, n - 1))}
            disabled={manualEmptyRows <= 0}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
              manualEmptyRows <= 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            − একটি বাদ
          </button>

          <button
            onClick={() => setManualEmptyRows(remainingSpace)}
            disabled={manualEmptyRows >= remainingSpace}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
              manualEmptyRows >= remainingSpace
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            বাকি সব ভরাও
          </button>

          <button
            onClick={() => setManualEmptyRows(0)}
            disabled={manualEmptyRows <= 0}
            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
              manualEmptyRows <= 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            সব খালি ঘর মুছুন
          </button>

          <span className="text-xs text-slate-500 ml-auto">
            পেজে জায়গা আছে: {toArabicNumber(remainingSpace)} টি ঘর
          </span>
          <span className="w-full text-[11px] text-slate-400">
            প্রিভিউতে নিচের অংশ কেটে গেলে — রো-এর উচ্চতা কমাও, অথবা পৃষ্ঠার দিক Landscape করো।
          </span>
        </div>
      )}

      {/* ✅ কোনো ডাটা না পেলে — আরবিতে বার্তা */}
      {!showLoading && chunks.length === 0 && (
        <div className="border border-dashed border-slate-300 rounded py-16 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-[17px] font-bold text-slate-700">
            {EMPTY_MSG_AR}
          </span>
          <span className="text-[13px] text-slate-500">{EMPTY_HINT_AR}</span>
        </div>
      )}

      {chunks.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === chunks.length - 1;
        const emptyRowsOnThisPage = isLastPage ? manualEmptyRows : 0;

        return (
          <div key={pageIndex} className="print-page-container">
            <div className="bg-white flex flex-col h-full">
              {/* ============ হেডার রো ১ — ৩ কলাম ============ */}
              <div
                className="grid border border-black mb-1"
                style={{ gridTemplateColumns: "1.4fr 2.4fr 1fr" }}
              >
                {/* 🌟 ডানে — الشهر / عام */}
                <div className="border-l border-black p-2 flex flex-col justify-center gap-1">
                  <div className="text-[13px] font-bold">
                    الشهر :{" "}
                    {selectedMonthIdx !== ""
                      ? ARABIC_MONTHS[Number(selectedMonthIdx)]
                      : "______"}
                  </div>
                  {/* 🔹 Academic_Session.SessionAraName — আরবি সংখ্যায় */}
                  <div className="text-[13px] font-bold">عام : {araSessionName}</div>
                </div>

                {/* 🌟 মাঝে — প্রতিষ্ঠানের আরবি নাম (উপরে) ও আরবি ঠিকানা (নিচে) */}
                <div className="border-l border-black p-2 flex flex-col items-center justify-center text-center leading-tight">
                  <div className="text-[14px] font-extrabold">
                    {araInstitutionName || "______"}
                  </div>
                  <div className="text-[12px] font-semibold mt-0.5">
                    {araAddress || "______"}
                  </div>
                </div>

                {/* 🌟 বাঁয়ে — الفئة */}
                <div className="p-2 flex flex-col items-center justify-center gap-1">
                  <div className="text-[13px] font-bold">{araClassName || "______"}</div>
                </div>
              </div>

              {/* ============ হেডার রো ২ — টাইটেল ============ */}
              <div className="border border-black mb-1 py-1.5 flex items-center justify-center">
                <div className="border-2 border-black px-6 py-[2px]">
                  <span className="text-[15px] font-extrabold tracking-wide">
                    دفتر حضور الطلاب
                  </span>
                </div>
              </div>

              {/* ============ হেডার রো ৩ — اسم الكتاب / اسم الاستاذ ============ */}
              <div
                className="grid border border-black mb-2"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <div className="border-l border-black p-1.5 text-[13px] font-bold">
                  اسم الكتاب : ______
                </div>
                <div className="p-1.5 text-[13px] font-bold">
                  اسم الاستاذ : ______
                </div>
              </div>

              {/* ============ টেবিল ============ */}
              <div className="w-full flex-grow min-h-0 overflow-hidden">
                <table className="w-full border-collapse table-fixed text-[11px]">
                  {/* ✅ কলামের প্রস্থ একজায়গায় — নাম বড়, বাকিগুলো সরু */}
                  <colgroup>
                    <col style={{ width: `${COL_W.serial}px` }} />
                    <col style={{ width: `${COL_W.admission}px` }} />
                    <col style={{ width: `${COL_W.code}px` }} />
                    <col style={{ width: `${COL_W.name}px` }} />
                    {days.map((day) => (
                      <col key={day} style={{ width: `${COL_W.day}px` }} />
                    ))}
                    <col style={{ width: `${COL_W.total}px` }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="border border-black bg-white text-center h-6 font-bold">
                        م
                      </th>
                      {/* 🔹 নতুন — Student_Admission.AdmissionSerial */}
                      <th className="border border-black bg-white text-center font-bold p-0 align-bottom">
                        <span className="vertical-text">رقم القيد</span>
                      </th>
                      <th className="border border-black bg-white text-center font-bold p-0 align-bottom">
                        <span className="vertical-text">الرقم الأكاديمي</span>
                      </th>
                      <th className="border border-black bg-white text-right px-2 h-6 font-bold name-cell">
                        أسماء الطالبة
                      </th>
                      {days.map((day) => {
                        const friday = isFriday(day);
                        return (
                          <th
                            key={day}
                            className="border border-black text-center bg-white h-6 text-[10px] font-bold"
                          >
                            <span
                              className={
                                friday ? "text-red-600 font-extrabold" : ""
                              }
                            >
                              {toArabicNumber(day)}
                            </span>
                          </th>
                        );
                      })}
                      <th className="border border-black bg-white text-center font-bold p-0 align-bottom">
                        <span className="vertical-text">المجموع</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((student, index) => {
                      const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                      return (
                        <tr
                          key={student.AdmissionID ?? student.id ?? index}
                          style={{ height: `${rowHeight}px` }}
                        >
                          <td className="border border-black text-center bg-white align-middle font-bold">
                            {toArabicNumber(serial)}
                          </td>
                          {/* 🔹 Student_Admission.AdmissionSerial */}
                          <td className="border border-black text-center bg-white align-middle font-semibold">
                            {toArabicNumber(student.AdmissionSerial)}
                          </td>
                          <td className="border border-black text-center bg-white align-middle font-semibold">
                            {toArabicNumber(student.StudentCode)}
                          </td>
                          {/* 🔹 Student_ArabicName.ArabicName — না থাকলে বাংলা নাম */}
                          <td className="border border-black bg-white px-2 align-middle text-right leading-tight name-cell">
                            {student.ArabicName || student.StudentName || ""}
                          </td>
                          {days.map((day) => {
                            const friday = isFriday(day);
                            return (
                              <td
                                key={day}
                                className={`border border-black text-center align-middle ${
                                  friday ? "bg-red-50" : "bg-white"
                                }`}
                              >
                                {friday && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "11px",
                                      height: "11px",
                                      borderRadius: "50%",
                                      border: "1px solid #dc2626",
                                      color: "#dc2626",
                                      fontSize: "7px",
                                      fontWeight: "bold",
                                      lineHeight: "1",
                                    }}
                                  >
                                    ✕
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-black bg-white align-middle"></td>
                        </tr>
                      );
                    })}

                    {/* ✅ ইউজারের যোগ করা খালি রো */}
                    {emptyRowsOnThisPage > 0 &&
                      Array.from({ length: emptyRowsOnThisPage }).map((_, i) => (
                        <tr key={`manual-empty-${i}`} style={{ height: `${rowHeight}px` }}>
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black bg-white name-cell"></td>
                          {days.map((day) => {
                            const friday = isFriday(day);
                            return (
                              <td
                                key={day}
                                className={`border border-black text-center align-middle ${
                                  friday ? "bg-red-50" : "bg-white"
                                }`}
                              >
                                {friday && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: "11px",
                                      height: "11px",
                                      borderRadius: "50%",
                                      border: "1px solid #dc2626",
                                      color: "#dc2626",
                                      fontSize: "7px",
                                      fontWeight: "bold",
                                      lineHeight: "1",
                                    }}
                                  >
                                    ✕
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="border border-black bg-white"></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* ============ ফুটার ============ */}
              <div className="text-center w-full text-black text-[13px] font-bold mt-1 shrink-0">
                صفحة : {toArabicNumber(pageIndex + 1)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArabicAttendence;
