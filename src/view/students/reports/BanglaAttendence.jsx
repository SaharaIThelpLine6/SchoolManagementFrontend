import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";

// ✅ আরবি মাসের তালিকা (দিনসংখ্যা সহ)
const ARABIC_MONTHS = [
  { name: "মুহাররম" },
  { name: "সফর" },
  { name: "রবিউল আউয়াল" },
  { name: "রবিউস সানি" },
  { name: "জমাদিউল আউয়াল" },
  { name: "জমাদিউস সানি" },
  { name: "রজব" },
  { name: "শাবান" },
  { name: "রমজান" },
  { name: "শাওয়াল" },
  { name: "জিলকদ" },
  { name: "জিলহজ" },
];

// ✅ ইংরেজি মাসের তালিকা — আরবি মাসের বিকল্প হিসেবে।
// হিজরি ও ইংরেজি মাস প্রতি বছর সরে যায় (ফিক্সড ম্যাপিং নেই),
// তাই ইউজার যেকোনো একটি নির্বাচন করবে।
const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ✅ বার — index 0 = শনিবার, 6 = শুক্রবার
const WEEKDAYS = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"];
const FRIDAY_INDEX = 6;

// ✅ কলামের প্রস্থ — table-fixed এ min-w কাজ করে না, তাই ফিক্সড px
const COL_W = {
  serial: 24,   // ক্র.নং
  admission: 30, // ভর্তি নং
  code: 42,     // আইডি নং
  name: 110,    // শিক্ষার্থীর নাম — সবচেয়ে বড়
  day: 14,      // তারিখের ঘর
  total: 15,    // উপ / অনু
};

const BanglaAttendence = ({ 
  reportData, 
  SubClassID, 
  SessionID,
  rowsPerPage = { portrait: 35, landscape: 30 }
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

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  // ইংরেজি সংখ্যাকে বাংলায় রূপান্তরের ফাংশন
  const toBengaliNumber = (num) => {
    if (!num) return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (x) => bengaliDigits[x]);
  };

  // ✅ আরবি মাস / ইংরেজি মাস (যেকোনো একটি) ও শুরুর বার — ইউজারের নির্বাচন
  const [arabicMonthIdx, setArabicMonthIdx] = useState("");
  const [englishMonthIdx, setEnglishMonthIdx] = useState("");
  const [startWeekday, setStartWeekday] = useState("");

  // ✅ নির্বাচিত মাস
  const selectedMonth = arabicMonthIdx !== "" ? ARABIC_MONTHS[Number(arabicMonthIdx)] : null;
  const selectedEnglishMonth =
    englishMonthIdx !== "" ? ENGLISH_MONTHS[Number(englishMonthIdx)] : "";
  const hasMonth = Boolean(selectedMonth || selectedEnglishMonth);

  // ✅ সবসময় ১ থেকে ৩১ দিন ফিক্সড
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // ✅ শুক্রবার কিনা নির্ধারণ
  const isFriday = (dayNum) => {
    if (startWeekday === "") return false;
    return (Number(startWeekday) + (dayNum - 1)) % 7 === FRIDAY_INDEX;
  };

  // ✅ ইউজার নিজে হাতে যত খালি রো চাইবে
  const [manualEmptyRows, setManualEmptyRows] = useState(0);

  // ✅ রিপোর্ট ডাটা বা ফিল্টার বদলালে খালি রো রিসেট হবে
  useEffect(() => {
    setManualEmptyRows(0);
  }, [reportData, SubClassID, SessionID]);

  const ROWS_PER_PAGE = rowsPerPage?.portrait || 35;

  const chunks = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
  }, [reportData, ROWS_PER_PAGE]);

  // ✅ শেষ পেজে ফাঁকা জায়গা কতটুকু
  const remainingSpace = Math.max(0, ROWS_PER_PAGE - (chunks[chunks.length - 1]?.length || 0));

  return (
    <div className="font-bangla bg-white text-xs p-4 sm:p-6">
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
              font-size: 10px; 
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
              padding: 0;
            }
            .vertical-text {
              writing-mode: vertical-rl;
              text-orientation: mixed;
              transform: rotate(180deg);
              height: 50px;
              padding: 2px !important;
              font-size: 10px;
              font-weight: bold;
            }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* ✅ মাস ও শুরুর বার নির্বাচন প্যানেল (স্ক্রিনে, প্রিন্টে নয়) */}
      <div className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">আরবি মাস</label>
          <select
            value={arabicMonthIdx}
            onChange={(e) => {
              setArabicMonthIdx(e.target.value);
              // 🔹 একটি বাছলে অন্যটি খালি হয়ে যাবে
              if (e.target.value !== "") setEnglishMonthIdx("");
            }}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="">-- নির্বাচন করুন --</option>
            {ARABIC_MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">ইংরেজি মাস</label>
          <select
            value={englishMonthIdx}
            onChange={(e) => {
              setEnglishMonthIdx(e.target.value);
              // 🔹 একটি বাছলে অন্যটি খালি হয়ে যাবে
              if (e.target.value !== "") setArabicMonthIdx("");
            }}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="">-- নির্বাচন করুন --</option>
            {ENGLISH_MONTHS.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">১ তারিখের বার</label>
          <select
            value={startWeekday}
            onChange={(e) => setStartWeekday(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
          >
            <option value="">-- নির্বাচন করুন --</option>
            {WEEKDAYS.map((w, i) => (
              <option key={i} value={i}>{w}</option>
            ))}
          </select>
        </div>

        {hasMonth && startWeekday !== "" && (
          <div className="text-xs text-slate-700 bg-red-50 border border-red-200 rounded px-3 py-1.5">
            <span className="font-semibold text-red-700">শুক্রবার (ছুটি): </span>
            {days.filter(isFriday).map((d) => toBengaliNumber(d)).join(", ") || "নেই"} তারিখ
          </div>
        )}
      </div>

      {/* ✅ শেষ পেজে খালি ঘর নিয়ন্ত্রণ প্যানেল */}
      {chunks.length > 0 && (
        <div className="no-print mb-3 p-3 bg-slate-50 border border-slate-200 rounded flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            শেষ পেজে খালি ঘর:
          </span>
          <span className="text-sm font-bold text-[#1B3A57]">
            {toBengaliNumber(manualEmptyRows)} টি
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
            পেজে জায়গা আছে: {toBengaliNumber(remainingSpace)} টি ঘর
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
              
              {/* হেডার */}
              <div className="flex items-center justify-between mb-1 bg-white">
                <div className="w-20 flex justify-start">
                  {logo && (
                    <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                  )}
                </div>
                <div className="text-center flex-1 bg-white">
                  <h1 className="text-lg sm:text-xl font-extrabold bg-white leading-tight">
                    {instutionInfo?.InstitutionName}
                  </h1>
                  <p className="text-xs font-semibold bg-white mt-0.5">
                    {instutionInfo?.Address}
                  </p>
                  <div className="text-black border-2 border-black px-6 py-0.5 inline-block mt-1 rounded-xl bg-white text-sm font-bold">
                    দৈনিক শিক্ষার্থীর হাজিরা খাতা
                  </div>
                </div>
                <div className="w-20" />
              </div>

              {/* তথ্য সারি */}
              <div className="flex w-full my-1 gap-1 bg-white text-[12px] font-bold">
                <div className="flex-1 border border-black py-0.5 px-2">
                  শ্রেণী/জামাত : {subClasData?.SubClass || ''}
                </div>
                <div className="flex-1 border border-black py-0.5 px-2">
                  শিক্ষাবর্ষ : {sessionData?.SessionName || ''}
                </div>
                <div className="flex-1 border border-black py-0.5 px-2">
                  সন :
                </div>
                <div className="flex-1 border border-black py-0.5 px-2">
                  হিজরী :
                </div>
                {/* 🔹 আরবি অথবা ইংরেজি — যেকোনো একটি */}
                <div className="flex-1 border border-black py-0.5 px-2">
                  মাস : {selectedMonth?.name || selectedEnglishMonth || ''}
                </div>
              </div>

              {/* টেবিল */}
              <div className="w-full flex-grow">
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
                    <col style={{ width: `${COL_W.total}px` }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="border border-black bg-white text-center h-5 text-[9px] leading-tight px-0">
                        ক্র.
                      </th>
                      {/* 🔹 Student_Admission.AdmissionSerial */}
                      <th className="border border-black bg-white text-center h-5 text-[9px] leading-tight px-0">
                        ভর্তি নং
                      </th>
                      <th className="border border-black bg-white text-center h-5 text-[9px] leading-tight px-0">
                        আইডি নং
                      </th>
                      <th className="border border-black bg-white text-left px-2 h-5">
                        শিক্ষার্থীর নাম
                      </th>
                      {days.map((day) => {
                        const friday = isFriday(day);
                        return (
                          <th
                            key={day}
                            className="border border-black text-center bg-white vertical-text relative"
                          >
                            <span className={friday ? "text-red-600 font-extrabold" : ""}>
                              {toBengaliNumber(day)}
                            </span>
                          </th>
                        );
                      })}
                      <th className="border border-black text-center bg-white vertical-text">
                        উপ :
                      </th>
                      <th className="border border-black text-center bg-white vertical-text">
                        অনু :
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((student, index) => {
                      const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                      return (
                        <tr key={student.AdmissionID ?? index} className="h-[22px]">
                          <td className="border border-black text-center bg-white align-middle">
                            {toBengaliNumber(serial)}
                          </td>
                          {/* 🔹 Student_Admission.AdmissionSerial */}
                          <td className="border border-black text-center bg-white align-middle">
                            {toBengaliNumber(student.AdmissionSerial)}
                          </td>
                          <td className="border border-black text-center bg-white align-middle">
                            {toBengaliNumber(student.StudentCode)}
                          </td>
                          <td className="border border-black bg-white px-2 align-middle text-left leading-tight">
                            {student.StudentName}
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
                          <td className="border border-black bg-white"></td>
                          <td className="border border-black bg-white"></td>
                        </tr>
                      );
                    })}

                    {/* ✅ ইউজারের যোগ করা খালি রো */}
                    {emptyRowsOnThisPage > 0 &&
                      Array.from({ length: emptyRowsOnThisPage }).map((_, i) => (
                        <tr key={`manual-empty-${i}`} className="h-[22px]">
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black text-center bg-white"></td>
                          <td className="border border-black bg-white"></td>
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
                          <td className="border border-black bg-white"></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* ফুটার */}
              <div className="flex justify-between items-end mt-6 pb-1 px-4 text-[12px] font-bold">
                <div className="border-t border-black w-56 text-center pt-1">
                  মোট কার্য দিবস : 
                </div>
                <div className="border-t border-black w-56 text-center pt-1">
                  শিক্ষক/শিক্ষিকার স্বাক্ষর : 
                </div>
              </div>
              <div className="text-center w-full text-black text-[13px] font-bold mt-2">
                পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BanglaAttendence;
