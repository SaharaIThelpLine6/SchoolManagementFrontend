// src/Admin/pages/ListOfExpelledStudents.jsx
import { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import SvgIcon from "../components/icons/SvgIcon";
import { useGetInstitutionInfoQuery } from "../features/settings/settingsQuerySlice";
import {
  useGetStudentReportFiltersQuery,
  useGetStudentReportsQuery,
} from "../features/student/studentReportSlice";
import useTranslate from "../utils/Translate";

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

const bnDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return bn(`${dd}/${mm}/${d.getFullYear()}`);
};

const todayBn = () => {
  const t = new Date();
  const dd = String(t.getDate()).padStart(2, "0");
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  return bn(`${dd}/${mm}/${t.getFullYear()}`);
};

/* ---------------------------------------------------------
   Component
--------------------------------------------------------- */
const ListOfExpelledStudents = () => {
  const translate = useTranslate();

  /* ---------------- Filters state ---------------- */
  const [filters, setFilters] = useState({
    SessionID: "",
    SubClassID: "",
    GenderID: "",
    NewOldId: "",
    ResidentialStatusId: "",
    ReportCetID: "",
  });

  /* ---------------- Logo ---------------- */
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  /* ---------------- API ---------------- */
  const { data: filterData, isLoading: filterLoading } =
    useGetStudentReportFiltersQuery();

  const sessions = filterData?.data?.sessions || [];
  const subclasses = filterData?.data?.subclasses || [];
  const genders = filterData?.data?.genders || [];
  const residentials = filterData?.data?.residentials || [];
  const reportCets = filterData?.data?.reportCets || [];

  // 🟢 residential list থেকে "উভয়" এর RDID বের করা (robust matching)
  const bothResidentialId = useMemo(() => {
    if (!residentials || residentials.length === 0) return null;

    // 🔍 Debug — Console-এ দেখুন কী কী নাম আসছে
    console.log(
      "📋 Residentials:",
      residentials.map((r) => ({
        RDID: r.RDID,
        Name: r.ResidentialName,
      }))
    );

    // সব space + zero-width character বাদ দিয়ে normalize
    const normalize = (s) =>
      String(s || "")
        .trim()
        .replace(/\s+/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "");

    const found = residentials.find((r) => {
      const name = normalize(r.ResidentialName);
      return (
        name.includes("উভয়") ||
        name.includes("উভয") ||
        name.includes("উভ")
      );
    });

    console.log("✅ Found উভয়:", found);
    return found?.RDID ?? null;
  }, [residentials]);

  // 🟢 "উভয়" সিলেক্ট থাকলে ResidentialStatusId / GenderID বাদ দিয়ে বাকি filter পাঠানো
  const apiFilters = useMemo(() => {
    const isBothSelected =
      bothResidentialId !== null &&
      String(filters.ResidentialStatusId) === String(bothResidentialId);

    // 🟢 Gender "উভয়" = ID 3 → filter বাদ
    const isBothGender = String(filters.GenderID) === "3";

    console.log("🎯 isBothSelected:", isBothSelected, {
      selected: filters.ResidentialStatusId,
      bothId: bothResidentialId,
    });
    console.log("🎯 isBothGender:", isBothGender, {
      selectedGender: filters.GenderID,
    });

    return {
      ...filters,
      ResidentialStatusId: isBothSelected ? "" : filters.ResidentialStatusId,
      GenderID: isBothGender ? "" : filters.GenderID,
    };
  }, [filters, bothResidentialId]);

  const { data: reportData, isLoading: reportLoading } =
    useGetStudentReportsQuery(apiFilters);

  const rows = reportData?.data || [];

  /* ---------------- Pagination (A4) ---------------- */
  const rowsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const chunks = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      chunked.push(rows.slice(i, i + rowsPerPage));
    }
    return chunked;
  }, [rows, rowsPerPage]);

  /* ---------------- Header labels ---------------- */
  const headerSessionName = useMemo(() => {
    if (filters.SessionID) {
      return sessions.find(
        (s) => String(s.SessionID) === String(filters.SessionID)
      )?.SessionName || "";
    }
    // 🟢 filter খালি হলে "সকল" দেখান
    return "সকল";
  }, [filters.SessionID, sessions]);

  const headerSubClassName = useMemo(() => {
    if (filters.SubClassID) {
      return subclasses.find(
        (s) => String(s.SubClassID) === String(filters.SubClassID)
      )?.SubClass || "";
    }
    // 🟢 filter খালি হলে "সকল" দেখান
    return "সকল";
  }, [filters.SubClassID, subclasses]);

  /* ---------------- Handlers ---------------- */
  const handleChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleReset = () =>
    setFilters({
      SessionID: "",
      SubClassID: "",
      GenderID: "",
      NewOldId: "",
      ResidentialStatusId: "",
      ReportCetID: "",
    });

  const isLoading = filterLoading || reportLoading;

  /* ---------------------------------------------------------
     Render
  --------------------------------------------------------- */
  return (
    <>
      {/* 🟢 Print CSS */}
      <style>{`
      @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* 🟢 Screen-only elements hide */
      .print\:hidden,
      button {
        display: none !important;
      }

      /* 🟢 Parent screen layout override */
      .min-h-screen {
        min-height: 0 !important;
      }
      .bg-slate-100 {
        background: #fff !important;
      }

      /* 🟢 Page container — inline style override করবে */
      .print-page-container {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;      /* inline minHeight: 1000px override */
        height: auto !important;
        padding: 50px !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
        background: #fff !important;
        border-radius: 0 !important;
        overflow: visible !important;

        /* 🟢 Container-এর ভেতরে auto break */
        page-break-inside: auto !important;
        break-inside: auto !important;
        page-break-after: auto !important;
        break-after: auto !important;
      }

      /* 🟢 প্রতিটি পরবর্তী container-এর আগে page break */
      .print-page-container ~ .print-page-container {
        page-break-before: always !important;
        break-before: page !important;
      }

      /* 🟢 প্রথম container-এর আগে extra break হবে না */
      .print-page-container:first-child {
        page-break-before: auto !important;
        break-before: auto !important;
      }

      /* 🟢 Inner flex wrapper override — flex behavior বন্ধ */
      .print-page-container > div {
        display: block !important;
        height: auto !important;
        min-height: 0 !important;
      }

      /* 🟢 Header + sub-class line টেবিলের সাথে লেগে থাকবে */
      .print-page-container > div > div:first-child,
      .print-page-container > div > div:nth-child(2) {
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* 🟢 Footer টেবিলের সাথে লেগে থাকবে */
      .print-page-container > div > div:last-child {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }

      /* 🟢 Table */
      table {
        page-break-inside: auto !important;
        break-inside: auto !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        width: 100% !important;
        font-size: 11px !important;
      }

      /* 🟢 Table header প্রতিটি page-এ repeat */
      thead {
        display: table-header-group !important;
      }

      /* 🟢 Row-এর মাঝখানে ভাঙবে না */
      tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: auto !important;
      }

      /* 🟢 Cell borders ও padding */
      th, td {
        border: 1px solid black !important;
        padding: 4px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
    }
      `}</style>

      <div
        className="w-full min-h-screen bg-slate-100 flex flex-col print:block print:min-h-0 print:bg-white"
        style={{
          fontFamily:
            "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif",
        }}
      >
        {/* ==================== FILTER PANEL (print:hidden) ==================== */}
        <div className="bg-white border-b border-slate-200 px-4 py-4 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                {translate("List Of Expelled Students")}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {translate("বহিষ্কৃত শিক্ষার্থীদের তালিকা")} — {translate("কারন ও তারিখসহ")}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: "#1E4D2B" }}
            >
              <SvgIcon name="FiPrinter" size={18} />
              প্রিন্ট করুন
            </button>
          </div>

          {/* Filter grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* শিক্ষাবর্ষ */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                শিক্ষাবর্ষ
              </label>
              <select
                value={filters.SessionID}
                onChange={(e) => handleChange("SessionID", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>
                {sessions.map((s) => (
                  <option key={s.SessionID} value={s.SessionID}>
                    {s.SessionName}
                  </option>
                ))}
              </select>
            </div>

            {/* সাব-ক্লাস */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                সাব-ক্লাস
              </label>
              <select
                value={filters.SubClassID}
                onChange={(e) => handleChange("SubClassID", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>
                {subclasses.map((s) => (
                  <option key={s.SubClassID} value={s.SubClassID}>
                    {s.SubClass}
                  </option>
                ))}
              </select>
            </div>

            {/* জেন্ডার */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                জেন্ডার
              </label>
              <select
                value={filters.GenderID}
                onChange={(e) => handleChange("GenderID", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>

                {/* 🟢 উভয় ছাড়া বাকি সব */}
                {genders
                  .filter((g) => !String(g.GenderName || "").includes("উভ"))
                  .map((g) => (
                    <option key={g.ID} value={g.ID}>
                      {g.GenderName}
                    </option>
                  ))}

                {/* 🟢 উভয় সবার শেষে */}
                {genders
                  .filter((g) => String(g.GenderName || "").includes("উভ"))
                  .map((g) => (
                    <option key={g.ID} value={g.ID}>
                      {g.GenderName}
                    </option>
                  ))}
              </select>
            </div>

            {/* নতুন-পুরাতন */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                নতুন / পুরাতন
              </label>
              <select
                value={filters.NewOldId}
                onChange={(e) => handleChange("NewOldId", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>
                <option value="1">নতুন</option>
                <option value="2">পুরাতন</option>
              </select>
            </div>

            {/* আবাসন */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                আবাসন
              </label>
              <select
                value={filters.ResidentialStatusId}
                onChange={(e) => handleChange("ResidentialStatusId", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>

                {/* 🟢 উভয় ছাড়া বাকি সব */}
                {residentials
                  .filter((r) => !String(r.ResidentialName || "").includes("উভ"))
                  .map((r) => (
                    <option key={r.RDID} value={r.RDID}>
                      {r.ResidentialName}
                    </option>
                  ))}

                {/* 🟢 উভয় সবার শেষে */}
                {residentials
                  .filter((r) => String(r.ResidentialName || "").includes("উভ"))
                  .map((r) => (
                    <option key={r.RDID} value={r.RDID}>
                      {r.ResidentialName}
                    </option>
                  ))}
              </select>
            </div>

            {/* কারন */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                কারন
              </label>
              <select
                value={filters.ReportCetID}
                onChange={(e) => handleChange("ReportCetID", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
              >
                <option value="">-- সব --</option>
                {reportCets.map((r) => (
                  <option key={r.ReportCetID} value={r.ReportCetID}>
                    {r.ReportCetName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-[#8B2635] hover:underline font-semibold"
            >
              ✕ ফিল্টার রিসেট করুন
            </button>
            <span className="text-xs text-slate-500">
              মোট রেকর্ড : <b className="text-slate-700">{bn(rows.length)}</b>
            </span>
          </div>
        </div>

        {/* ==================== PREVIEW / PRINT ==================== */}
        <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center print:p-0 print:overflow-visible print:block">
          {/* On-screen pagination */}
          {chunks.length > 1 && (
            <div className="flex items-center gap-4 mb-4 bg-white px-4 py-2 rounded shadow-sm print:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-slate-600 disabled:opacity-40 hover:text-[#1B3A57]"
              >
                <SvgIcon name="FiChevronLeft" size={20} />
              </button>
              <span className="text-sm font-semibold text-slate-700">
                পৃষ্ঠা {bn(currentPage)} / {bn(totalPages)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="text-slate-600 disabled:opacity-40 hover:text-[#1B3A57]"
              >
                <SvgIcon name="FiChevronRight" size={20} />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-slate-400 p-10 font-bold">
              ডাটা লোড হচ্ছে...
            </div>
          ) : chunks.length === 0 ? (
            /* 🟢 Filter-এ কোনো ডেটা না থাকলে — শুধু empty state (header/table কিছুই আসবে না) */
            <div className="w-full max-w-2xl mx-auto mt-12 bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 text-center print:shadow-none print:border-0 print:mt-0">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B3A57] to-[#2a5a85] flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <circle cx="10" cy="10" r="7" />
                    <path d="M21 21l-6 -6" />
                    <path d="M8 8l4 4" />
                    <path d="M12 8l-4 4" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
                কোনো ডেটা পাওয়া যায়নি
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
                আপনার নির্বাচিত ফিল্টার অনুযায়ী কোনো রেকর্ড খুঁজে পাওয়া যায়নি। অনুগ্রহ করে
                ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
              </p>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white shadow-md transition-all hover:scale-105"
                style={{ backgroundColor: "#8B2635" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
                  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
                </svg>
                ফিল্টার রিসেট করুন
              </button>
            </div>
          ) : (
            chunks.map((chunk, pageIndex) => {
              const isVisibleOnScreen = pageIndex + 1 === currentPage;
              return (
                <div
                  key={pageIndex}
                  className={`print-page-container bg-white shadow-md relative mx-auto ${
                    isVisibleOnScreen ? "block" : "hidden print:block"
                  }`}
                  style={{
                    width: "750px",
                    maxWidth: "100%",
                    padding: "28px 32px",
                    boxSizing: "border-box",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="h-full flex flex-col">
                    {/* ---------- HEADER ---------- */}
                    <div className="w-full relative mb-4 flex flex-col items-center justify-center">
                      <div className="absolute left-0 top-0">
                        {logo ? (
                          <img
                            src={logo}
                            alt="Logo"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20"></div>
                        )}
                      </div>

                      <h1 className="text-[18px] sm:text-[22px] font-extrabold text-black leading-tight text-center">
                        {instutionInfo?.InstitutionName}
                      </h1>
                      <p className="text-[13px] sm:text-[14px] font-medium text-black mt-1 text-center">
                        {instutionInfo?.Address}
                      </p>

                      <div className="mt-3 mb-1">
                        <div className="border-[1.5px] border-black rounded-full px-6 py-[4px] inline-block bg-white">
                          <span className="text-[14px] sm:text-[16px] font-bold text-black tracking-wide">
                            বহিষ্কৃত শিক্ষার্থীদের তালিকা
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ---------- SUB-CLASS / SESSION LINE ---------- */}
                    <div className="flex justify-between items-center mb-3 text-[14px] font-bold text-black border-y border-black py-1.5">
                      <div>সাব-ক্লাস : {headerSubClassName || "সকল"}</div>
                      <div>শিক্ষাবর্ষ : {headerSessionName || "সকল"}</div>
                    </div>

                    {/* ---------- TABLE ---------- */}
                    <div className="w-full flex-grow overflow-x-auto">
                      <table
                        className="w-full border-collapse border border-black text-black"
                        style={{ fontSize: "11px", tableLayout: "fixed" }}
                      >
                        <thead>
                          <tr className="bg-white">
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "6%", padding: "4px" }}
                            >
                              ক্রমিক
                            </th>
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "8%", padding: "4px" }}
                            >
                              আইডি
                            </th>
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "20%", padding: "4px" }}
                            >
                              শিক্ষার্থীর নাম
                            </th>
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "12%", padding: "4px" }}
                            >
                              কারন
                            </th>
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "34%", padding: "4px" }}
                            >
                              মন্তব্য/রিপোর্ট
                            </th>
                            <th
                              className="border border-black text-center font-bold"
                              style={{ width: "20%", padding: "4px" }}
                            >
                              তারিখ
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {chunk.map((row, idx) => {
                            const sl = pageIndex * rowsPerPage + idx + 1;
                            return (
                              <tr key={row.SRID ?? idx}>
                                <td
                                  className="border border-black text-center font-bold"
                                  style={{ padding: "4px" }}
                                >
                                  {bn(sl)}
                                </td>
                                <td
                                  className="border border-black text-center"
                                  style={{ padding: "4px" }}
                                >
                                  {row.UserCode ? bn(row.UserCode) : ""}
                                </td>
                                <td
                                  className="border border-black text-left font-medium"
                                  style={{ padding: "4px 6px" }}
                                >
                                  {row.UserName || ""}
                                </td>
                                <td
                                  className="border border-black text-center"
                                  style={{ padding: "4px" }}
                                >
                                  {row.ReportCetName || ""}
                                </td>
                                <td
                                  className="border border-black text-left"
                                  style={{ padding: "4px 6px" }}
                                >
                                  {row.Remark && Number(row.Remark) !== 0
                                    ? row.Remark
                                    : ""}
                                </td>
                                <td
                                  className="border border-black text-center"
                                  style={{ padding: "4px" }}
                                >
                                  {bnDate(row.CreateDate)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* ---------- FOOTER ---------- */}
                    <div className="mt-auto pt-3 flex justify-center items-center text-black text-[12px]">
                      <span className="font-bold text-[14px]">
                        পৃষ্ঠা : {bn(pageIndex + 1)} / {bn(totalPages)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ListOfExpelledStudents;
