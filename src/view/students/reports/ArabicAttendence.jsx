import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";

// ✅ আরবি সংখ্যায় রূপান্তর
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

// ✅ Demo students — পরে backend থেকে আসবে
const DEMO_STUDENTS = [
  { id: 1, StudentCode: 5278, ArabicName: "محمد أحمد الله" },
  { id: 2, StudentCode: 5974, ArabicName: "محمد يونس" },
  { id: 3, StudentCode: 80792, ArabicName: "محمد قاسم" },
  { id: 4, StudentCode: 5475, ArabicName: "راشد الإسلام" },
  { id: 5, StudentCode: 114712, ArabicName: "خير الإسلام" },
  { id: 6, StudentCode: 1187442, ArabicName: "محمد ريحان حسن بابل" },
  { id: 7, StudentCode: 128716, ArabicName: "محمد سهيل بالا" },
  { id: 8, StudentCode: 1197164, ArabicName: "محمد سالك الرحمن" },
  { id: 9, StudentCode: 114799, ArabicName: "محفوظ الرحمن" },
  { id: 10, StudentCode: 76444201, ArabicName: "محمد الرحيم" },
  { id: 11, StudentCode: 76444202, ArabicName: "عبد الرحمن" },
  { id: 12, StudentCode: 76444212, ArabicName: "محمد نورو حسين" },
  { id: 13, StudentCode: 76444237, ArabicName: "عبيد الرحمن" },
  { id: 14, StudentCode: 76444253, ArabicName: "محمد حسين أحمد" },
];

const ArabicAttendence = ({
  reportData,
  SubClassID,
  SessionID,
  rowsPerPage = { portrait: 35, landscape: 30 },
}) => {
  const [logo, setLogo] = useState(null);

  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  const { data: sessionSData } = useGetSessionsQuery();
  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  const students =
    reportData && reportData.length > 0 ? reportData : DEMO_STUDENTS;

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

  const ROWS_PER_PAGE = rowsPerPage?.portrait || 35;

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
      className="font-arabic bg-white text-xs p-4 sm:p-6"
      style={{
        fontFamily:
          "'Noto Naskh Arabic','Amiri','Scheherazade New','Traditional Arabic',serif",
      }}
    >
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm 8mm;
            }
            html, body {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              background: white;
            }
            .print-page-container {
              page-break-after: always;
              page-break-inside: avoid;
              break-after: page;
              height: 285mm;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            }
            .print-page-container:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse !important;
              table-layout: fixed;
              width: 100%;
              font-size: 11px;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            th, td {
              border: 1px solid black !important;
              padding: 0 !important;
            }
            .vertical-text {
              writing-mode: vertical-rl;
              text-orientation: mixed;
              transform: rotate(180deg);
              height: 55px;
              padding: 2px !important;
              font-size: 11px;
              font-weight: bold;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

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
        </div>
      )}

      {chunks.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === chunks.length - 1;
        const emptyRowsOnThisPage = isLastPage ? manualEmptyRows : 0;

        return (
          <div
            key={pageIndex}
            className="print-page-container"
            style={{
              width: "100%",
              maxWidth: "210mm",
              margin: "0 auto",
            }}
          >
            <div className="bg-white flex flex-col h-full p-2">
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
                  <div className="text-[13px] font-bold">
                    عام : {sessionData?.SessionName || "١٤٤٨ هـ"}
                  </div>
                </div>

                {/* 🌟 মাঝে — প্রতিষ্ঠানের নাম (৩ লাইন) */}
                <div className="border-l border-black p-2 flex flex-col items-center justify-center text-center leading-tight">
                  <div className="text-[14px] font-extrabold">
                    {instutionInfo?.InstitutionName || "الجامعة الإسلامية"}
                  </div>
                  <div className="text-[12px] font-semibold mt-0.5">
                    {instutionInfo?.Address || "ناماهو، فنكوري، شيتاغونغ"}
                  </div>
                </div>

                {/* 🌟 বাঁয়ে — الفئة */}
                <div className="p-2 flex flex-col items-center justify-center gap-1">
                  <div className="text-[13px] font-bold">الفئة</div>
                  <div className="border border-black px-3 py-0.5 text-[12px] font-bold min-w-[50px] text-center">
                    {subClasData?.SubClass || "أول/ي"}
                  </div>
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
              <div className="w-full flex-grow">
                <table className="w-full border-collapse table-fixed text-[11px]">
                  <thead>
                    <tr>
                      <th className="border border-black bg-white text-center w-7 h-6 font-bold">
                        م
                      </th>
                      <th className="border border-black bg-white text-center w-12 h-6 font-bold vertical-text">
                        الرقم الأكاديمي
                      </th>
                      <th className="border border-black bg-white text-right px-2 min-w-[130px] h-6 font-bold">
                        أسماء الطالبة
                      </th>
                      {days.map((day) => {
                        const friday = isFriday(day);
                        return (
                          <th
                            key={day}
                            className="border border-black text-center bg-white w-[16px] h-6 text-[10px] font-bold"
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
                      <th className="border border-black bg-white text-center w-9 h-6 font-bold vertical-text">
                        المجموع
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((student, index) => {
                      const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                      return (
                        <tr key={student.id ?? index} className="h-[22px]">
                          <td className="border border-black text-center bg-white w-7 align-middle font-bold">
                            {toArabicNumber(serial)}
                          </td>
                          <td className="border border-black text-center bg-white w-12 align-middle font-semibold">
                            {toArabicNumber(student.StudentCode)}
                          </td>
                          <td className="border border-black bg-white min-w-[130px] px-2 align-middle text-right">
                            {student.ArabicName || student.StudentName}
                          </td>
                          {days.map((day) => {
                            const friday = isFriday(day);
                            return (
                              <td
                                key={day}
                                className={`border border-black text-center w-[16px] align-middle ${
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
                          <td className="border border-black bg-white w-9 align-middle"></td>
                        </tr>
                      );
                    })}

                    {/* ✅ ইউজারের যোগ করা খালি রো */}
                    {emptyRowsOnThisPage > 0 &&
                      Array.from({ length: emptyRowsOnThisPage }).map((_, i) => (
                        <tr key={`manual-empty-${i}`} className="h-[22px]">
                          <td className="border border-black text-center bg-white w-7"></td>
                          <td className="border border-black text-center bg-white w-12"></td>
                          <td className="border border-black bg-white min-w-[130px]"></td>
                          {days.map((day) => {
                            const friday = isFriday(day);
                            return (
                              <td
                                key={day}
                                className={`border border-black text-center w-[16px] align-middle ${
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
                          <td className="border border-black bg-white w-9"></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* ============ ফুটার ============ */}
              <div className="text-center w-full text-black text-[13px] font-bold mt-2">
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





























// import React, { useEffect, useMemo, useState } from "react";
// import { Buffer } from "buffer";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
// import { useGetSessionsQuery } from "../../../features/session/sessionSlice";

// // ✅ আরবি সংখ্যায় রূপান্তর
// const toArabicNumber = (num) => {
//   if (num === "" || num === null || num === undefined) return "";
//   const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
//   return num.toString().replace(/\d/g, (x) => arabicDigits[x]);
// };

// // ✅ আরবি মাসের নাম
// const ARABIC_MONTHS = [
//   "محرم",
//   "صفر",
//   "ربيع الأول",
//   "ربيع الثاني",
//   "جمادى الأولى",
//   "جمادى الآخرة",
//   "رجب",
//   "شعبان",
//   "رمضان",
//   "شوال",
//   "ذو القعدة",
//   "ذو الحجة",
// ];

// // ✅ বার — index 0 = শনিবার (السبت), 6 = শুক্রবার (الجمعة)
// const WEEKDAYS_AR = [
//   "السبت",
//   "الأحد",
//   "الاثنين",
//   "الثلاثاء",
//   "الأربعاء",
//   "الخميس",
//   "الجمعة",
// ];
// const FRIDAY_INDEX = 6;

// // ✅ Demo students — পরে backend থেকে আসবে
// const DEMO_STUDENTS = [
//   { id: 1, StudentCode: 100018, ArabicName: "محمد أحمد" },
//   { id: 2, StudentCode: 100019, ArabicName: "عبد الله" },
//   { id: 3, StudentCode: 100020, ArabicName: "يوسف إسلام" },
//   { id: 4, StudentCode: 100021, ArabicName: "إبراهيم خان" },
//   { id: 5, StudentCode: 100022, ArabicName: "عمر فاروق" },
//   { id: 6, StudentCode: 100023, ArabicName: "علي حسين" },
//   { id: 7, StudentCode: 100024, ArabicName: "حسن محمود" },
//   { id: 8, StudentCode: 100025, ArabicName: "خالد رحمن" },
//   { id: 9, StudentCode: 100026, ArabicName: "بلال حسين" },
//   { id: 10, StudentCode: 100027, ArabicName: "أنيس الرحمن" },
// ];

// const ArabicAttendence = ({
//   reportData,
//   SubClassID,
//   SessionID,
//   rowsPerPage = { portrait: 35, landscape: 30 },
// }) => {
//   const [logo, setLogo] = useState(null);

//   const { data: instutionInfo } = useGetInstitutionInfoQuery();
//   const { data: subClassListData } = useGetSubClassListQuery();
//   const subClasData = subClassListData?.find(
//     (i) => i.SubClassID === Number(SubClassID)
//   );
//   const { data: sessionSData } = useGetSessionsQuery();
//   const sessionData = sessionSData?.find(
//     (i) => i.SessionID === Number(SessionID)
//   );

//   const students =
//     reportData && reportData.length > 0 ? reportData : DEMO_STUDENTS;

//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);

//   // ✅ আরবি মাস ও শুরুর বার — ইউজারের নির্বাচন
//   const [selectedMonthIdx, setSelectedMonthIdx] = useState("");
//   const [startWeekday, setStartWeekday] = useState("");

//   // ✅ ১ থেকে ৩১ দিন ফিক্সড
//   const days = Array.from({ length: 31 }, (_, i) => i + 1);

//   // ✅ শুক্রবার (الجمعة) কিনা নির্ধারণ
//   const isFriday = (dayNum) => {
//     if (startWeekday === "") return false;
//     return (Number(startWeekday) + (dayNum - 1)) % 7 === FRIDAY_INDEX;
//   };

//   const [manualEmptyRows, setManualEmptyRows] = useState(0);

//   useEffect(() => {
//     setManualEmptyRows(0);
//   }, [reportData, SubClassID, SessionID]);

//   const ROWS_PER_PAGE = rowsPerPage?.portrait || 35;

//   const chunks = useMemo(() => {
//     if (!students || students.length === 0) return [];
//     const chunked = [];
//     for (let i = 0; i < students.length; i += ROWS_PER_PAGE) {
//       chunked.push(students.slice(i, i + ROWS_PER_PAGE));
//     }
//     return chunked;
//   }, [students, ROWS_PER_PAGE]);

//   const remainingSpace = Math.max(
//     0,
//     ROWS_PER_PAGE - (chunks[chunks.length - 1]?.length || 0)
//   );

//   return (
//     <div
//       dir="rtl"
//       className="font-arabic bg-white text-xs p-4 sm:p-6"
//       style={{
//         fontFamily:
//           "'Noto Naskh Arabic','Amiri','Scheherazade New','Traditional Arabic',serif",
//       }}
//     >
//       <style>
//         {`
//           @media print {
//             @page {
//               size: A4 portrait;
//               margin: 5mm 8mm;
//             }
//             html, body {
//               margin: 0;
//               padding: 0;
//               box-sizing: border-box;
//               background: white;
//             }
//             .print-page-container {
//               page-break-after: always;
//               page-break-inside: avoid;
//               break-after: page;
//               height: 285mm;
//               position: relative;
//               box-sizing: border-box;
//               display: flex;
//               flex-direction: column;
//             }
//             .print-page-container:last-child {
//               page-break-after: auto;
//               break-after: auto;
//             }
//             table {
//               page-break-inside: auto;
//               border-collapse: collapse !important;
//               table-layout: fixed;
//               width: 100%;
//               font-size: 10px;
//             }
//             tr {
//               page-break-inside: avoid;
//               page-break-after: auto;
//             }
//             thead {
//               display: table-header-group;
//             }
//             th, td {
//               border: 1px solid black !important;
//               padding: 0 !important;
//             }
//             .vertical-text {
//               writing-mode: vertical-rl;
//               text-orientation: mixed;
//               transform: rotate(0deg);
//               height: 50px;
//               padding: 2px !important;
//               font-size: 11px;
//               font-weight: bold;
//             }
//             .no-print { display: none !important; }
//           }
//         `}
//       </style>

//       {/* ✅ কন্ট্রোল প্যানেল — স্ক্রিনে (LTR রাখা হলো যাতে বোঝা সহজ হয়) */}
//       <div
//         dir="ltr"
//         className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-end gap-3"
//       >
//         <div>
//           <label className="text-xs font-medium text-slate-600 block mb-1">
//             আরবি মাস
//           </label>
//           <select
//             value={selectedMonthIdx}
//             onChange={(e) => setSelectedMonthIdx(e.target.value)}
//             className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
//           >
//             <option value="">-- নির্বাচন করুন --</option>
//             {ARABIC_MONTHS.map((m, i) => (
//               <option key={i} value={i}>
//                 {m}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="text-xs font-medium text-slate-600 block mb-1">
//             ১ তারিখের বার
//           </label>
//           <select
//             value={startWeekday}
//             onChange={(e) => setStartWeekday(e.target.value)}
//             className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
//           >
//             <option value="">-- নির্বাচন করুন --</option>
//             {WEEKDAYS_AR.map((w, i) => (
//               <option key={i} value={i}>
//                 {w}
//               </option>
//             ))}
//           </select>
//         </div>

//         {selectedMonthIdx !== "" && startWeekday !== "" && (
//           <div className="text-xs text-slate-700 bg-red-50 border border-red-200 rounded px-3 py-1.5">
//             <span className="font-semibold text-red-700">
//               শুক্রবার (الجمعة):{" "}
//             </span>
//             {days.filter(isFriday).map((d) => toArabicNumber(d)).join(", ") ||
//               "নেই"}{" "}
//             তারিখ
//           </div>
//         )}
//       </div>

//       {/* ✅ শেষ পেজে খালি ঘর নিয়ন্ত্রণ প্যানেল */}
//       {chunks.length > 0 && (
//         <div
//           dir="ltr"
//           className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center gap-3"
//         >
//           <span className="text-sm font-semibold text-slate-700">
//             শেষ পেজে খালি ঘর:
//           </span>
//           <span className="text-sm font-bold text-[#1B3A57]">
//             {toArabicNumber(manualEmptyRows)} টি
//           </span>

//           <button
//             onClick={() => setManualEmptyRows((n) => n + 1)}
//             disabled={manualEmptyRows >= remainingSpace}
//             className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
//               manualEmptyRows >= remainingSpace
//                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-[#1B3A57] text-white hover:bg-[#1B3A57]/90"
//             }`}
//           >
//             + একটি খালি ঘর
//           </button>

//           <button
//             onClick={() => setManualEmptyRows((n) => Math.max(0, n - 1))}
//             disabled={manualEmptyRows <= 0}
//             className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
//               manualEmptyRows <= 0
//                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-slate-200 text-slate-700 hover:bg-slate-300"
//             }`}
//           >
//             − একটি বাদ
//           </button>

//           <button
//             onClick={() => setManualEmptyRows(remainingSpace)}
//             disabled={manualEmptyRows >= remainingSpace}
//             className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
//               manualEmptyRows >= remainingSpace
//                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-slate-200 text-slate-700 hover:bg-slate-300"
//             }`}
//           >
//             বাকি সব ভরাও
//           </button>

//           <button
//             onClick={() => setManualEmptyRows(0)}
//             disabled={manualEmptyRows <= 0}
//             className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
//               manualEmptyRows <= 0
//                 ? "bg-slate-200 text-slate-400 cursor-not-allowed"
//                 : "bg-red-500 text-white hover:bg-red-600"
//             }`}
//           >
//             সব খালি ঘর মুছুন
//           </button>

//           <span className="text-xs text-slate-500 ml-auto">
//             পেজে জায়গা আছে: {toArabicNumber(remainingSpace)} টি ঘর
//           </span>
//         </div>
//       )}

//       {chunks.map((chunk, pageIndex) => {
//         const isLastPage = pageIndex === chunks.length - 1;
//         const emptyRowsOnThisPage = isLastPage ? manualEmptyRows : 0;

//         return (
//           <div
//             key={pageIndex}
//             className="print-page-container"
//             style={{
//               width: "100%",
//               maxWidth: "210mm",
//               margin: "0 auto",
//             }}
//           >
//             <div className="bg-white flex flex-col h-full p-2">
//               {/* ============ হেডার ============ */}
//               <div className="flex items-stretch border border-black mb-2">
//                 {/* 🌟 ডানে (RTL: প্রথম child) — الشهر / عام */}
//                 <div className="w-40 border-l border-black p-2 flex flex-col justify-center gap-1">
//                   <div className="text-[14px] font-bold">
//                     الشهر :{" "}
//                     {selectedMonthIdx !== ""
//                       ? ARABIC_MONTHS[Number(selectedMonthIdx)]
//                       : "______"}
//                   </div>
//                   <div className="text-[14px] font-bold">
//                     عام : {sessionData?.SessionName || "______"}
//                   </div>
//                 </div>

//                 {/* 🌟 মাঝে — دفتر حضور الطلاب */}
//                 <div className="flex-1 flex items-center justify-center py-3">
//                   <div className="border-2 border-black rounded-md px-8 py-1">
//                     <span className="text-[18px] font-extrabold tracking-wide">
//                       دفتر حضور الطلاب
//                     </span>
//                   </div>
//                 </div>

//                 {/* 🌟 বাঁয়ে (RTL: শেষ child) — লোগো */}
//                 <div className="w-40 border-r border-black flex items-center justify-center p-1">
//                   {logo ? (
//                     <img
//                       src={logo}
//                       alt="Logo"
//                       className="w-16 h-16 object-contain"
//                     />
//                   ) : (
//                     <div className="w-16 h-16" />
//                   )}
//                 </div>
//               </div>

//               {/* ============ ২য় সারি ============ */}
//               <div className="flex items-stretch border border-black mb-2">
//                 <div className="flex-1 border-l border-black p-2 text-[14px] font-bold">
//                   اسم الكتاب : {subClasData?.SubClass || "______"}
//                 </div>
//                 <div className="flex-1 border-l border-black p-2 text-[14px] font-bold">
//                   اسم الاستاذ : ______
//                 </div>
//               </div>

//               {/* ============ টেবিল ============ */}
//               <div className="w-full flex-grow">
//                 <table className="w-full border-collapse table-fixed text-[11px]">
//                   <thead>
//                     <tr>
//                       <th className="border border-black bg-white text-center w-8 h-6 font-bold">
//                         م
//                       </th>
//                       <th className="border border-black bg-white text-right px-2 min-w-[150px] h-6 font-bold">
//                         أسماء الطلبة
//                       </th>
//                       {days.map((day) => {
//                         const friday = isFriday(day);
//                         return (
//                           <th
//                             key={day}
//                             className="border border-black text-center bg-white w-[17px] vertical-text"
//                           >
//                             <span className={friday ? "text-red-600 font-extrabold" : ""}>
//                               {toArabicNumber(day)}
//                             </span>
//                           </th>
//                         );
//                       })}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {chunk.map((student, index) => {
//                       const serial = pageIndex * ROWS_PER_PAGE + index + 1;
//                       return (
//                         <tr key={student.id ?? index} className="h-[22px]">
//                           <td className="border border-black text-center bg-white w-8 align-middle">
//                             {toArabicNumber(serial)}
//                           </td>
//                           <td className="border border-black bg-white min-w-[150px] px-2 align-middle text-right">
//                             {student.ArabicName || student.StudentName}
//                           </td>
//                           {days.map((day) => {
//                             const friday = isFriday(day);
//                             return (
//                               <td
//                                 key={day}
//                                 className={`border border-black text-center w-[17px] align-middle ${
//                                   friday ? "bg-red-50" : "bg-white"
//                                 }`}
//                               >
//                                 {friday && (
//                                   <span
//                                     style={{
//                                       display: "inline-flex",
//                                       alignItems: "center",
//                                       justifyContent: "center",
//                                       width: "12px",
//                                       height: "12px",
//                                       borderRadius: "50%",
//                                       border: "1px solid #dc2626",
//                                       color: "#dc2626",
//                                       fontSize: "8px",
//                                       fontWeight: "bold",
//                                       lineHeight: "1",
//                                     }}
//                                   >
//                                     ✕
//                                   </span>
//                                 )}
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       );
//                     })}

//                     {/* ✅ ইউজারের যোগ করা খালি রো — শুক্রবারে ✕ বসবে */}
//                     {emptyRowsOnThisPage > 0 &&
//                       Array.from({ length: emptyRowsOnThisPage }).map((_, i) => (
//                         <tr key={`manual-empty-${i}`} className="h-[22px]">
//                           <td className="border border-black text-center bg-white w-8"></td>
//                           <td className="border border-black bg-white min-w-[150px]"></td>
//                           {days.map((day) => {
//                             const friday = isFriday(day);
//                             return (
//                               <td
//                                 key={day}
//                                 className={`border border-black text-center w-[17px] align-middle ${
//                                   friday ? "bg-red-50" : "bg-white"
//                                 }`}
//                               >
//                                 {friday && (
//                                   <span
//                                     style={{
//                                       display: "inline-flex",
//                                       alignItems: "center",
//                                       justifyContent: "center",
//                                       width: "12px",
//                                       height: "12px",
//                                       borderRadius: "50%",
//                                       border: "1px solid #dc2626",
//                                       color: "#dc2626",
//                                       fontSize: "8px",
//                                       fontWeight: "bold",
//                                       lineHeight: "1",
//                                     }}
//                                   >
//                                     ✕
//                                   </span>
//                                 )}
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* ============ ফুটার ============ */}
//               <div className="text-center w-full text-black text-[13px] font-bold mt-2">
//                 صفحة : {toArabicNumber(pageIndex + 1)}
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ArabicAttendence;
