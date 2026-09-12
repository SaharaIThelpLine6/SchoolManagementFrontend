import { Buffer } from "buffer";
import { useState, useMemo, useEffect } from "react";
import Button from "../../../../components/Button/Button";
import SvgIcon from "../../../../components/icons/SvgIcon";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import {
  useGetReportTemplatesQuery,
  useAddReportTemplateMutation,
  useUpdateReportTemplateMutation,
  useDeleteReportTemplateMutation,
} from "../../../../features/reports/reportQuerySlice";
import useReportFilters from "../../../../hooks/ReportPageHooks/useReportFilters";
import ReportFilterFields from "./ReportFilterFields";
import { ADMISSION_TYPE_OPTIONS } from "./reportFilterConstants";

/* ---------------------------------------------------------
   Static definitions
--------------------------------------------------------- */

const SUB_HEADER_DEFS = [
  { key: "classJamat", label: "শ্রেণী/জামাত" },
  { key: "totalStudents", label: "সর্বমোট শিক্ষার্থী" },
  { key: "studentType", label: "শিক্ষার্থীর ধরন" },
  { key: "printDate", label: "প্রিন্ট তারিখ" },
];

// key -> আসল /student_report_list রেসপন্সের ফিল্ডের সাথে মিলিয়ে দেওয়া।
// NOTE: "financialStatus" এর জন্য এখনো ব্যাকএন্ডে কোনো source ওয়্যার করা
// হয়নি (StudentFinancialStatus টেবিল লাগবে) — আপাতত ফাঁকা দেখাবে।
// "idNo" ও StudentCode দিয়েই দেখানো হচ্ছে, চাইলে আলাদা ফিল্ড বসিও।
const COLUMN_DEFS = [
  { key: "StudentCode", label: "দাখেলা", width: "7%" },
  { key: "idNo", label: "আইডি নং", width: "8%" },
  { key: "StudentName", label: "শিক্ষার্থীর নাম", width: "13%" },
  { key: "FatherName", label: "পিতার নাম", width: "12%" },
  { key: "MotherName", label: "মাতার নাম", width: "12%" },
  { key: "DateOfBirth", label: "জন্ম তারিখ", width: "10%" },
  { key: "BloodGroup", label: "রক্তের গ্রুপ", width: "5%" },
  { key: "Mobile1", label: "মোবাইল ১", width: "11%" },
  { key: "Mobile2", label: "মোবাইল ২", width: "8%" },
  { key: "Relationship1", label: "সম্পর্ক ১", width: "7%" },
  { key: "Relationship2", label: "সম্পর্ক ২", width: "7%" },
  { key: "NIDNO", label: "এনআইডি / জন্ম নিবন্ধন", width: "10%" },
  { key: "address", label: "ঠিকানা", width: "15%" },
  { key: "financialStatus", label: "আর্থিক অবস্থা", width: "8%" },
  { key: "permanentVill", label: "গ্রাম", width: "8%" },
  { key: "permanentPost", label: "ডাক", width: "7%" },
  { key: "PoliceStationName", label: "থানা", width: "7%" },
  { key: "PermanentDistrictName", label: "জেলা", width: "7%" },
  { key: "photo", label: "ছবি", width: "5%" },
];

const DEFAULT_COLUMNS_ON = [
  "StudentCode", "StudentName", "FatherName", "MotherName", "DateOfBirth",
  "BloodGroup", "Mobile1", "permanentVill", "permanentPost", "PoliceStationName", "PermanentDistrictName",
];

// ✅ Custom Columns-এর জন্য রিজার্ভড key, যাতে template এর Columns object-এ
// existing boolean flags-এর সাথে সংঘর্ষ না হয়।
const CUSTOM_COLUMNS_KEY = "__customColumns";

// ✅ প্রতি orientation-এর সর্বোচ্চ মোট কলাম (heading + custom combined)
// Portrait: ১১টি optional heading + ১টি custom = ১২টি পর্যন্ত
// Landscape: ১৩টি optional heading + ১টি custom = ১৪টি পর্যন্ত
const MAX_TOTAL_COLUMNS = {
  portrait: 11,
  landscape: 13,
};

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

const bnDate = (iso) => {
  if (!iso) return "";
  const datePart = iso.split("T")[0];
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return "";
  return bn(`${d}/${m}/${y}`);
};

const todayBn = () => {
  const t = new Date();
  const dd = String(t.getDate()).padStart(2, "0");
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  return bn(`${dd}/${mm}/${t.getFullYear()}`);
};

const addressLine = (row) =>
  [row.permanentVill, row.PoliceStationName, row.PermanentDistrictName].filter(Boolean).join(", ");

function defaultBuilderState() {
  const columns = {};
  COLUMN_DEFS.forEach((c) => (columns[c.key] = DEFAULT_COLUMNS_ON.includes(c.key)));
  const subHeaders = { printDate: true, classJamat: false, totalStudents: false, studentType: false };
  return {
    title: "ভর্তি রেজিস্টার",
    sessionBesideTitle: true,
    subHeaders,
    columns,
    // ✅ প্রতি orientation-এর জন্য আলাদা কাস্টম কলাম লিস্ট
    customColumns: { portrait: [], landscape: [] },
    orientation: "portrait",
  };
}

/* ---------------------------------------------------------
   Small UI bits
--------------------------------------------------------- */

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-3">
      <span className="text-[#8B2635]">
        <SvgIcon name={icon} size={16} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={`flex items-center gap-2 text-sm py-1 ${disabled ? "text-slate-400 cursor-not-allowed opacity-60" : "text-slate-700 cursor-pointer"}`}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
          checked ? "bg-[#1B3A57] border-[#1B3A57]" : "bg-white border-slate-300"
        }`}
      >
        {checked && (
          <span className="text-white">
            <SvgIcon name="FiCheck" size={11} />
          </span>
        )}
      </span>
      <span>{label}</span>
    </label>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-[#8B2635] text-[#8B2635]" : "border-transparent text-slate-500 hover:text-slate-700"
      }`}
    >
      <SvgIcon name={icon} size={14} />
      {children}
    </button>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

export default function ReportBuilder({
  portraitRowsPerPage = 20,
  landscapeRowsPerPage = 21,
}) {
  const [tab, setTab] = useState("design");
  const [builder, setBuilder] = useState(defaultBuilderState());
  const [templateName, setTemplateName] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // API Logo State
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

  /* ---------------- Templates (DB-backed) ---------------- */
  const {
    data: templates = [],
    isLoading: templatesLoading,
  } = useGetReportTemplatesQuery("admission_register");
  const [addReportTemplate] = useAddReportTemplateMutation();
  const [updateReportTemplate] = useUpdateReportTemplateMutation();
  const [deleteReportTemplate] = useDeleteReportTemplateMutation();

  /* ---------------- ফিল্টার + লাইভ ডাটা (শেয়ার্ড হুক, useReportFilters) ---------------- */
  const {
    filters,
    setFilters,
    resetFilters,
    sessions,
    subClasses,
    districts,
    thanas,
    residentialData,
    filteredData,
    dataLoading,
  } = useReportFilters();

  const isLandscape = builder.orientation === "landscape";

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  // ✅ Props থেকে rowsPerPage নেওয়া হচ্ছে
  const rowsPerPage = isLandscape ? landscapeRowsPerPage : portraitRowsPerPage;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const chunks = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < filteredData.length; i += rowsPerPage) {
      chunked.push(filteredData.slice(i, i + rowsPerPage));
    }
    return chunked;
  }, [filteredData, rowsPerPage]);

  // ✅ শুধু চেকবক্স-ভিত্তিক কলামগুলো (কাস্টম কলাম ছাড়া)
  const activeColumns = COLUMN_DEFS.filter((c) => builder.columns[c.key]);

  // ✅ বর্তমান orientation-এর কাস্টম কলামগুলো
  const currentCustomColumns = isLandscape
    ? builder.customColumns?.landscape || []
    : builder.customColumns?.portrait || [];

  // ✅ রেন্ডার করার জন্য সব কলাম একসাথে
  const allRenderColumns = [...activeColumns, ...currentCustomColumns];

  // ✅ প্রতি orientation-এর সর্বোচ্চ মোট কলাম (heading + custom combined)
  const maxTotalColumns = isLandscape
    ? MAX_TOTAL_COLUMNS.landscape
    : MAX_TOTAL_COLUMNS.portrait;

  // ✅ বর্তমান মোট কলাম সংখ্যা (heading + custom)
  const totalColumns = activeColumns.length + currentCustomColumns.length;

  // ✅ স্লট শেষ কিনা
  const slotsFull = totalColumns >= maxTotalColumns;

  const toggleColumn = (key, val) => {
    setBuilder((b) => {
      if (val) {
        // ✅ heading + custom combined limit চেক
        const currentActiveCount = COLUMN_DEFS.filter((c) => b.columns[c.key]).length;
        const currentCustomCount = (b.customColumns?.[b.orientation] || []).length;
        const currentMax = b.orientation === "landscape"
          ? MAX_TOTAL_COLUMNS.landscape
          : MAX_TOTAL_COLUMNS.portrait;

        if (currentActiveCount + currentCustomCount >= currentMax) {
          return b;
        }
      }
      return { ...b, columns: { ...b.columns, [key]: val } };
    });
  };

  const toggleSubHeader = (key, val) => setBuilder((b) => ({ ...b, subHeaders: { ...b.subHeaders, [key]: val } }));

  /* ---------------- ✅ কাস্টম কলাম হ্যান্ডলার ---------------- */

  const handleAddCustomColumn = () => {
    const orientation = builder.orientation;
    const currentCustomCount = (builder.customColumns?.[orientation] || []).length;
    const currentActiveCount = COLUMN_DEFS.filter((c) => builder.columns[c.key]).length;
    const currentMax = orientation === "landscape"
      ? MAX_TOTAL_COLUMNS.landscape
      : MAX_TOTAL_COLUMNS.portrait;

    // ✅ combined limit চেক — জায়গা না থাকলে কিছুই যোগ হবে না
    if (currentActiveCount + currentCustomCount >= currentMax) {
      return;
    }

    const newCol = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      key: "", // "" = খালি/হাতে লিখার কলাম
      label: "নতুন কলাম",
      width: "10%",
    };
    setBuilder((b) => ({
      ...b,
      customColumns: {
        ...b.customColumns,
        [orientation]: [...(b.customColumns?.[orientation] || []), newCol],
      },
    }));
  };

  const handleUpdateCustomColumn = (id, field, value) => {
    const orientation = builder.orientation;
    setBuilder((b) => ({
      ...b,
      customColumns: {
        ...b.customColumns,
        [orientation]: (b.customColumns?.[orientation] || []).map((col) =>
          col.id === id ? { ...col, [field]: value } : col
        ),
      },
    }));
  };

  const handleDeleteCustomColumn = (id) => {
    const orientation = builder.orientation;
    setBuilder((b) => ({
      ...b,
      customColumns: {
        ...b.customColumns,
        [orientation]: (b.customColumns?.[orientation] || []).filter(
          (col) => col.id !== id
        ),
      },
    }));
  };

  /* ---------------- Template save/load/delete (DB) ---------------- */

  const handleSaveTemplate = async () => {
    const name = templateName.trim() || builder.title || "নামহীন টেমপ্লেট";
    setSavingTemplate(true);
    try {
      // ✅ Custom Columns-কে Columns JSON-এর ভেতরে রিজার্ভড key হিসেবে সংরক্ষণ করা
      // হচ্ছে — এতে DB স্কিমা পরিবর্তনের দরকার নেই।
      const payload = {
        TemplateName: name,
        ReportType: "admission_register",
        Title: builder.title,
        SessionBesideTitle: builder.sessionBesideTitle,
        SubHeaders: builder.subHeaders,
        Columns: {
          ...builder.columns,
          [CUSTOM_COLUMNS_KEY]: builder.customColumns || { portrait: [], landscape: [] },
        },
        Orientation: builder.orientation,
      };

      if (activeTemplateId) {
        await updateReportTemplate({ TemplateID: activeTemplateId, ...payload }).unwrap();
      } else {
        const created = await addReportTemplate(payload).unwrap();
        setActiveTemplateId(created.TemplateID);
      }
      setTemplateName(name);
    } catch (error) {
      console.error(error);
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleNewTemplate = () => {
    setBuilder(defaultBuilderState());
    setTemplateName("");
    setActiveTemplateId(null);
  };

  const handleLoadTemplate = (t) => {
    // ✅ Load করা Columns-এর ভেতর থেকে __customColumns আলাদা করে নেওয়া হলো
    const loadedColumnsRaw = t.Columns || {};
    const { [CUSTOM_COLUMNS_KEY]: loadedCustom, ...loadedFlags } = loadedColumnsRaw;

    // যদি loadedFlags-এ কোনো boolean কলাম না থাকে, তাহলে default ব্যবহার
    const flagsToUse =
      Object.keys(loadedFlags).length > 0
        ? loadedFlags
        : defaultBuilderState().columns;

    setBuilder({
      title: t.Title || "",
      sessionBesideTitle: !!t.SessionBesideTitle,
      subHeaders: t.SubHeaders || defaultBuilderState().subHeaders,
      columns: flagsToUse,
      customColumns:
        loadedCustom && typeof loadedCustom === "object"
          ? {
              portrait: Array.isArray(loadedCustom.portrait) ? loadedCustom.portrait : [],
              landscape: Array.isArray(loadedCustom.landscape) ? loadedCustom.landscape : [],
            }
          : { portrait: [], landscape: [] },
      orientation: t.Orientation || "portrait",
    });
    setTemplateName(t.TemplateName);
    setActiveTemplateId(t.TemplateID);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteReportTemplate(templateId).unwrap();
      if (activeTemplateId === templateId) handleNewTemplate();
    } catch (error) {
      console.error(error);
    }
  };

  const subHeaderLine = () => {
    const currentSubClassLabel =
      subClasses.find((s) => String(s.SubClassID) === String(filters.SubClassID))?.SubClass || "সকল জামাত";
    const currentAdmissionTypeLabel =
      ADMISSION_TYPE_OPTIONS.find((o) => o.value === filters.admissionType)?.label || "সকল";

    const parts = [];
    if (builder.subHeaders.classJamat) parts.push(`শ্রেণী/জামাত: ${currentSubClassLabel}`);
    if (builder.subHeaders.totalStudents) parts.push(`সর্বমোট শিক্ষার্থী: ${bn(filteredData.length)}`);
    if (builder.subHeaders.studentType) parts.push(`শিক্ষার্থীর ধরন: ${currentAdmissionTypeLabel}`);
    if (builder.subHeaders.printDate) parts.push(`প্রিন্ট তারিখ: ${todayBn()}`);
    return parts;
  };

  const currentSessionLabel =
    sessions.find((s) => String(s.SessionID) === String(filters.SessionID))?.SessionName || "সকল";

  const renderCellValue = (row, columnKey) => {
    // ✅ কাস্টম কলামের key "" হলে খালি ফেরত দিবে (হাতে লিখার জন্য)
    if (!columnKey) return "";
    switch (columnKey) {
      case "photo":
        return null; // নিচে আলাদাভাবে রেন্ডার হয়
      case "address":
        return addressLine(row);
      case "financialStatus":
        return ""; // TODO: StudentFinancialStatus টেবিল ওয়্যার করলে এখানে বসবে
      case "idNo":
        return row.StudentCode ? bn(row.StudentCode) : "";
      case "DateOfBirth":
        return bnDate(row.DateOfBirth);
      case "StudentCode":
      case "Mobile1":
      case "Mobile2":
      case "NIDNO":
        return row[columnKey] ? bn(row[columnKey]) : "";
      default:
        return row[columnKey] || "";
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 ${builder.orientation};
            /* ✅ Landscape-এ মার্জিন আরও কমানো হলো যাতে বেশি জায়গা পাওয়া যায় */
            margin: ${builder.orientation === 'landscape' ? '3mm' : '10mm'};
          }
          html, body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            background: #fff !important;
          }
          .print-page-container {
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
            height: ${builder.orientation === 'landscape' ? '200mm' : '277mm'};
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            /* ✅ Landscape-এ প্যাডিং আরও কমানো হলো */
            padding: ${builder.orientation === 'landscape' ? '8px !important' : '16px !important'};
            position: relative;
            box-sizing: border-box;
            box-shadow: none !important;
            margin: 0 0 ${builder.orientation === 'landscape' ? '3mm' : '10mm'} 0 !important;
            display: block !important;
          }
          .print-page-container:last-child {
            page-break-after: auto;
            break-after: auto;
            margin-bottom: 0 !important;
          }
          .print-border-wrapper {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          table {
            page-break-inside: auto;
            border-collapse: collapse !important;
            /* ✅ Landscape-এ table-layout auto করা হলো যাতে বেশি কলাম auto-fit হয় */
            table-layout: ${builder.orientation === 'landscape' ? 'auto' : 'fixed'};
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
            word-wrap: break-word;
            overflow-wrap: break-word;
            /* ✅ Landscape-এ সেল প্যাডিং কমানো হলো যাতে বেশি কলাম ফিট হয় */
            padding: ${builder.orientation === 'landscape' ? '2px 3px !important' : '4px 4px !important'};
          }
        }
      `}</style>

      <div
        className="w-full min-h-screen bg-slate-100 flex flex-col lg:flex-row print:block print:min-h-0 print:bg-white"
        style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
      >

        {/* -------------------- LEFT: BUILDER -------------------- */}
        <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 print:hidden">
          <div className="px-4 pt-4 pb-2 border-b border-slate-200">
            <h1 className="text-base font-bold text-slate-800">রিপোর্ট টেমপ্লেট বিল্ডার</h1>
            <p className="text-xs text-slate-500 mt-0.5">ভর্তি রেজিস্টার — লাইভ ডাটা</p>
          </div>

          <div className="flex border-b border-slate-200">
            <TabButton active={tab === "design"} onClick={() => setTab("design")} icon="FiSettings">ডিজাইন ও টেমপ্লেট</TabButton>
            <TabButton active={tab === "filter"} onClick={() => setTab("filter")} icon="FiFilter">ফিল্টার</TabButton>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {tab === "design" && (
              <div className="space-y-6">

                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <SectionTitle icon="FiLayout">টেমপ্লেট নির্বাচন ও সেভ</SectionTitle>
                  <div className="mb-3">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">টেমপ্লেটের নাম</label>
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="যেমন: ভর্তি রেজিস্টার - পোর্ট্রেট"
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30"
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
                      {savingTemplate ? "সেভ হচ্ছে..." : activeTemplateId ? "আপডেট করে সেভ" : "টেমপ্লেট সেভ করুন"}
                    </Button>
                    <button
                      onClick={handleNewTemplate}
                      title="নতুন টেমপ্লেট"
                      className="px-3 py-2 text-white bg-slate-500 hover:bg-slate-600 rounded-md flex items-center gap-1.5 text-sm font-medium transition-colors"
                    >
                      <SvgIcon name="FiPlus" size={16} />
                      নতুন
                    </button>
                  </div>
                  {templatesLoading && (
                    <p className="text-xs text-slate-400">টেমপ্লেট লোড হচ্ছে...</p>
                  )}
                  {!templatesLoading && templates.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-500 mb-1">সেভ করা টেমপ্লেটসমূহ:</p>
                      {templates.map((t) => (
                        <div
                          key={t.TemplateID}
                          className={`flex items-center justify-between border rounded px-3 py-2 text-sm ${
                            activeTemplateId === t.TemplateID ? "border-[#1B3A57] bg-[#1B3A57]/5" : "border-slate-200 bg-white"
                          }`}
                        >
                          <button onClick={() => handleLoadTemplate(t)} className="text-left flex-1 truncate text-slate-700">
                            {t.TemplateName}
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(t.TemplateID)}
                            title="Delete"
                            className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded-md ml-2 flex items-center gap-1 text-xs transition-colors"
                          >
                            <SvgIcon name="FiTrash2" size={14} />
                            ডিলিট
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-slate-200" />

                <div>
                  <SectionTitle icon="FiFileText">শিরোনাম (Title)</SectionTitle>
                  <input
                    value={builder.title}
                    onChange={(e) => setBuilder((b) => ({ ...b, title: e.target.value }))}
                    placeholder="যেমন: ভর্তি রেজিস্টার"
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
                  />
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                    <Checkbox
                      checked={builder.sessionBesideTitle}
                      onChange={(v) => setBuilder((b) => ({ ...b, sessionBesideTitle: v }))}
                      label="শিক্ষাবর্ষ শিরোনামের পাশে দেখান"
                    />
                  </label>
                </div>

                <div>
                  <SectionTitle icon="FiSettings">সাব-হেডার (শিরোনামের নিচে)</SectionTitle>
                  <div className="grid grid-cols-1 gap-0.5">
                    {SUB_HEADER_DEFS.map((s) => (
                      <Checkbox
                        key={s.key}
                        checked={builder.subHeaders[s.key]}
                        onChange={(v) => toggleSubHeader(s.key, v)}
                        label={s.label}
                      />
                    ))}
                  </div>
                </div>

                {/* ✅ হেডিং + কাস্টম কলামের combined লিমিট */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <SectionTitle icon="FiSettings">ডাটা কলাম নির্বাচন</SectionTitle>
                    <span
                      className={`text-[10px] font-semibold ${
                        slotsFull ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      মোট: {bn(totalColumns)} / {bn(maxTotalColumns)}
                    </span>
                  </div>

                  {/* ✅ Progress bar — কতগুলো স্লট বাকি */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        slotsFull ? "bg-red-500" : "bg-[#1B3A57]"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (totalColumns / maxTotalColumns) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <Checkbox checked disabled label="ক্র: (সবসময় থাকবে)" onChange={() => {}} />
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                    {COLUMN_DEFS.map((c) => {
                      const isChecked = builder.columns[c.key];
                      // ✅ combined limit: header + custom মিলিয়ে max হলে disable
                      const isDisabled = !isChecked && slotsFull;
                      return (
                        <Checkbox
                          key={c.key}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(v) => toggleColumn(c.key, v)}
                          label={c.label}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* ✅ কাস্টম কলাম ম্যানেজার — প্রতি orientation-এর জন্য আলাদা */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <SectionTitle icon="FiSettings">
                      কাস্টম কলাম ({isLandscape ? "Landscape" : "Portrait"})
                    </SectionTitle>
                    <span className="text-[10px] text-slate-400">
                      মোট: {bn(currentCustomColumns.length)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">
                    এই কাস্টম কলামগুলো শুধু{" "}
                    <b>{isLandscape ? "Landscape" : "Portrait"}</b>{" "}
                    মোডে দেখাবে। ডাটা সোর্স খালি রাখলে হাতে লিখার জন্য খালি কলাম থাকবে।
                  </p>

                  {currentCustomColumns.length === 0 && (
                    <p className="text-[11px] text-slate-400 mb-2 italic">
                      এখনো কোনো কাস্টম কলাম যোগ করা হয়নি।
                    </p>
                  )}

                  <div className="space-y-2">
                    {currentCustomColumns.map((col, idx) => (
                      <div
                        key={col.id}
                        className="border border-slate-200 rounded p-2 bg-white space-y-2"
                      >
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 font-semibold w-5">
                            #{idx + 1}
                          </span>
                          <input
                            value={col.label}
                            onChange={(e) =>
                              handleUpdateCustomColumn(col.id, "label", e.target.value)
                            }
                            placeholder="হেডারের নাম"
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1B3A57]"
                          />
                          <button
                            onClick={() => handleDeleteCustomColumn(col.id)}
                            title="Delete"
                            className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                          >
                            <SvgIcon name="FiTrash2" size={12} />Delete
                          </button>
                        </div>
                        <div className="flex gap-1.5">
                          <select
                            value={col.key}
                            onChange={(e) =>
                              handleUpdateCustomColumn(col.id, "key", e.target.value)
                            }
                            className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1B3A57]"
                          >
                            <option value="">খালি (হাতে লিখবেন)</option>
                            {COLUMN_DEFS.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          {/* <input
                            value={col.width}
                            onChange={(e) =>
                              handleUpdateCustomColumn(col.id, "width", e.target.value)
                            }
                            placeholder="10%"
                            className="w-16 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1B3A57]"
                          /> */}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleAddCustomColumn}
                    disabled={slotsFull}
                    className={`mt-3 w-full py-2 border-2 border-dashed rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      slotsFull
                        ? "border-slate-200 text-slate-300 cursor-not-allowed"
                        : "border-slate-300 hover:border-[#1B3A57] text-slate-600 hover:text-[#1B3A57]"
                    }`}
                  >
                    <SvgIcon name="FiPlus" size={14} />
                    {slotsFull
                      ? `স্লট পূর্ণ (${bn(maxTotalColumns)})`
                      : "নতুন কাস্টম কলাম যোগ করুন"}
                  </button>
                </div>

                <div>
                  <SectionTitle icon="FiFileText">পৃষ্ঠার দিক</SectionTitle>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBuilder((b) => ({ ...b, orientation: "portrait" }))}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${
                        !isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"
                      }`}
                    >
                      <SvgIcon name="FiFileText" size={18} />
                      Portrait
                    </button>
                    <button
                      onClick={() => setBuilder((b) => ({ ...b, orientation: "landscape" }))}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${
                        isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"
                      }`}
                    >
                      <span className="rotate-90 inline-block">
                        <SvgIcon name="FiFileText" size={18} />
                      </span>
                      Landscape
                    </button>
                  </div>
                </div>
              </div>
            )}

            {tab === "filter" && (
              <ReportFilterFields
                filters={filters}
                setFilters={setFilters}
                sessions={sessions}
                subClasses={subClasses}
                districts={districts}
                thanas={thanas}
                residentialData={residentialData}
                resultCount={filteredData.length}
                loading={dataLoading}
                onPrint={() => window.print()}
                onReset={() => { resetFilters(); setCurrentPage(1); }}
                note="টেমপ্লেট তৈরি হয়ে গেলে এখান থেকে ফিল্টার করে দেখুন প্রিভিউতে কোন ডাটা আসবে।"
              />
            )}
          </div>
        </div>

        {/* -------------------- RIGHT: LIVE PREVIEW -------------------- */}
        <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center print:p-0 print:overflow-visible print:block">

          <div className="flex items-center gap-4 mb-4 bg-white px-4 py-2 rounded shadow-sm print:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"
            >
              <SvgIcon name="FiChevronLeft" size={20} />
            </button>
            <span className="text-sm font-semibold text-slate-700">
              পেজ {bn(currentPage)} / {bn(totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"
            >
              <SvgIcon name="FiChevronRight" size={20} />
            </button>
          </div>

          <div id="print-section" className="w-full flex flex-col items-center print:block">
            {dataLoading ? (
              <div className="text-center text-slate-400 p-10 font-bold">ডাটা লোড হচ্ছে...</div>
            ) : chunks.length === 0 ? (
              <div
                className="print-page-container bg-white shadow-md relative w-full"
                style={{
                  maxWidth: isLandscape ? "1400px" : "750px",
                  padding: isLandscape ? "20px 10px" : "28px 32px",
                }}
              >
                <div className="text-center text-slate-400 p-10 font-bold">ফিল্টারে কোনো শিক্ষার্থী পাওয়া যায়নি</div>
              </div>
            ) : (
              chunks.map((chunk, pageIndex) => {
                const isVisibleOnScreen = pageIndex + 1 === currentPage;

                return (
                  <div
                    key={pageIndex}
                    className={`print-page-container bg-white shadow-md relative mx-auto ${isVisibleOnScreen ? "block" : "hidden print:block"}`}
                    style={{
                      width: isLandscape ? "1400px" : "750px",
                      maxWidth: "100%",
                      minHeight: isLandscape ? "800px" : "1000px",
                      padding: isLandscape ? "20px 10px" : "28px 32px",
                      boxSizing: "border-box",
                      marginBottom: "1rem"
                    }}
                  >
                    <div className="print-border-wrapper h-full flex flex-col">

                      <div className="w-full relative mb-4 flex flex-col items-center justify-center">

                        <div className="absolute left-0 top-0 flex justify-start items-start">
                          {logo ? (
                            <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20"></div>
                          )}
                        </div>

                        <h1 className="text-[18px] sm:text-[22px] font-extrabold text-black leading-tight text-center">
                          {instutionInfo?.InstitutionName}
                        </h1>
                        <p className="text-[14px] sm:text-[15px] font-medium text-black mt-1 text-center">
                          {instutionInfo?.Address}
                        </p>

                        <div className="mt-3 mb-1">
                          <div className="border-[1.5px] border-black rounded-full px-6 py-[4px] inline-block bg-white">
                            <span className="text-[14px] sm:text-[16px] font-bold text-black tracking-wide">
                              {builder.title || "শিরোনাম"}
                            </span>
                          </div>
                        </div>

                        {builder.sessionBesideTitle && (
                          <div className="absolute right-0 bottom-2">
                            <span className="text-[14px] font-bold text-black">
                              শিক্ষাবর্ষ : {currentSessionLabel}
                            </span>
                          </div>
                        )}
                      </div>

                      {subHeaderLine().length > 0 && (
                        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-1 text-[13px] font-bold text-black mb-3 border-y border-black py-1.5 w-full">
                          {subHeaderLine().map((line, i) => (
                            <span key={i}>{line}</span>
                          ))}
                        </div>
                      )}

                      <div className="w-full flex-grow overflow-x-auto">
                        <table
                          className="w-full border-collapse border border-black text-black"
                          style={{
                            fontSize: "11px",
                            tableLayout: isLandscape ? "auto" : "fixed",
                          }}
                        >
                          <thead>
                            <tr className="bg-white">
                              <th
                                className="border border-black text-center font-bold"
                                style={{
                                  width: isLandscape ? "auto" : "4%",
                                  padding: isLandscape ? "2px 3px" : "4px 4px",
                                }}
                              >
                                ক্র:
                              </th>
                              {allRenderColumns.map((c) => (
                                <th
                                  key={c.key || c.id}
                                  className="border border-black text-center font-bold"
                                  style={{
                                    width: isLandscape ? "auto" : c.width,
                                    padding: isLandscape ? "2px 3px" : "4px 4px",
                                  }}
                                >
                                  {c.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {chunk.map((row, idx) => (
                              <tr key={row.ID ?? idx} className="bg-white break-inside-avoid print:break-inside-avoid">
                                <td
                                  className="border border-black text-center font-bold"
                                  style={{
                                    padding: isLandscape ? "2px 3px" : "4px 4px",
                                  }}
                                >
                                  {bn(pageIndex * rowsPerPage + idx + 1)}
                                </td>
                                {allRenderColumns.map((c) => {
                                  if (c.key === "photo") {
                                    return (
                                      <td
                                        key={c.key || c.id}
                                        className="border border-black text-center"
                                        style={{
                                          padding: isLandscape ? "2px 3px" : "4px 4px",
                                        }}
                                      >
                                        <div
                                          className="mx-auto bg-slate-100 border border-black"
                                          style={{
                                            width: isLandscape ? "20px" : "24px",
                                            height: isLandscape ? "24px" : "28px",
                                          }}
                                        />
                                      </td>
                                    );
                                  }
                                  return (
                                    <td
                                      key={c.key || c.id}
                                      className="border border-black text-left font-medium"
                                      style={{
                                        padding: isLandscape ? "2px 4px" : "4px 6px",
                                      }}
                                    >
                                      {renderCellValue(row, c.key)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
                        পৃষ্ঠা : {bn(pageIndex + 1)} / {bn(totalPages)}
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}


























// import { Buffer } from "buffer";
// import { useState, useMemo, useEffect } from "react";
// import Button from "../../../../components/Button/Button";
// import SvgIcon from "../../../../components/icons/SvgIcon";
// import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
// import {
//   useGetReportTemplatesQuery,
//   useAddReportTemplateMutation,
//   useUpdateReportTemplateMutation,
//   useDeleteReportTemplateMutation,
// } from "../../../../features/reports/reportQuerySlice";
// import useReportFilters from "../../../../hooks/ReportPageHooks/useReportFilters";
// import ReportFilterFields from "./ReportFilterFields";
// import { ADMISSION_TYPE_OPTIONS } from "./reportFilterConstants";

// /* ---------------------------------------------------------
//    Static definitions
// --------------------------------------------------------- */

// const SUB_HEADER_DEFS = [
//   { key: "classJamat", label: "শ্রেণী/জামাত" },
//   { key: "totalStudents", label: "সর্বমোট শিক্ষার্থী" },
//   { key: "studentType", label: "শিক্ষার্থীর ধরন" },
//   { key: "printDate", label: "প্রিন্ট তারিখ" },
// ];

// // key -> আসল /student_report_list রেসপন্সের ফিল্ডের সাথে মিলিয়ে দেওয়া।
// // NOTE: "financialStatus" এর জন্য এখনো ব্যাকএন্ডে কোনো source ওয়্যার করা
// // হয়নি (StudentFinancialStatus টেবিল লাগবে) — আপাতত ফাঁকা দেখাবে।
// // "idNo" ও StudentCode দিয়েই দেখানো হচ্ছে, চাইলে আলাদা ফিল্ড বসিও।
// const COLUMN_DEFS = [
//   { key: "StudentCode", label: "দাখেলা", width: "7%" },
//   { key: "idNo", label: "আইডি নং", width: "8%" },
//   { key: "StudentName", label: "শিক্ষার্থীর নাম", width: "13%" },
//   { key: "FatherName", label: "পিতার নাম", width: "12%" },
//   { key: "MotherName", label: "মাতার নাম", width: "12%" },
//   { key: "DateOfBirth", label: "জন্ম তারিখ", width: "10%" },
//   { key: "BloodGroup", label: "রক্তের গ্রুপ", width: "5%" },
//   { key: "Mobile1", label: "মোবাইল ১", width: "11%" },
//   { key: "Mobile2", label: "মোবাইল ২", width: "8%" },
//   { key: "Relationship1", label: "সম্পর্ক ১", width: "7%" },
//   { key: "Relationship2", label: "সম্পর্ক ২", width: "7%" },
//   { key: "NIDNO", label: "এনআইডি / জন্ম নিবন্ধন", width: "10%" },
//   { key: "address", label: "ঠিকানা", width: "15%" },
//   { key: "financialStatus", label: "আর্থিক অবস্থা", width: "8%" },
//   { key: "permanentVill", label: "গ্রাম", width: "8%" },
//   { key: "permanentPost", label: "ডাক", width: "7%" },
//   { key: "PoliceStationName", label: "থানা", width: "7%" },
//   { key: "PermanentDistrictName", label: "জেলা", width: "7%" },
//   { key: "photo", label: "ছবি", width: "5%" },
// ];

// const DEFAULT_COLUMNS_ON = [
//   "StudentCode", "StudentName", "FatherName", "MotherName", "DateOfBirth",
//   "BloodGroup", "Mobile1", "permanentVill", "permanentPost", "PoliceStationName", "PermanentDistrictName",
// ];

// const bn = (num) => {
//   if (num === "" || num === null || num === undefined) return "";
//   const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
//   return num.toString().replace(/\d/g, (x) => d[x]);
// };

// const bnDate = (iso) => {
//   if (!iso) return "";
//   const datePart = iso.split("T")[0];
//   const [y, m, d] = datePart.split("-");
//   if (!y || !m || !d) return "";
//   return bn(`${d}/${m}/${y}`);
// };

// const todayBn = () => {
//   const t = new Date();
//   const dd = String(t.getDate()).padStart(2, "0");
//   const mm = String(t.getMonth() + 1).padStart(2, "0");
//   return bn(`${dd}/${mm}/${t.getFullYear()}`);
// };

// const addressLine = (row) =>
//   [row.permanentVill, row.PoliceStationName, row.PermanentDistrictName].filter(Boolean).join(", ");

// function defaultBuilderState() {
//   const columns = {};
//   COLUMN_DEFS.forEach((c) => (columns[c.key] = DEFAULT_COLUMNS_ON.includes(c.key)));
//   const subHeaders = { printDate: true, classJamat: false, totalStudents: false, studentType: false };
//   return {
//     title: "ভর্তি রেজিস্টার",
//     sessionBesideTitle: true,
//     subHeaders,
//     columns,
//     orientation: "portrait",
//   };
// }

// /* ---------------------------------------------------------
//    Small UI bits
// --------------------------------------------------------- */

// function SectionTitle({ icon, children }) {
//   return (
//     <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm mb-3">
//       <span className="text-[#8B2635]">
//         <SvgIcon name={icon} size={16} />
//       </span>
//       <span>{children}</span>
//     </div>
//   );
// }

// function Checkbox({ checked, onChange, label, disabled }) {
//   return (
//     <label className={`flex items-center gap-2 text-sm py-1 ${disabled ? "text-slate-400 cursor-not-allowed opacity-60" : "text-slate-700 cursor-pointer"}`}>
//       <span
//         onClick={() => !disabled && onChange(!checked)}
//         className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
//           checked ? "bg-[#1B3A57] border-[#1B3A57]" : "bg-white border-slate-300"
//         }`}
//       >
//         {checked && (
//           <span className="text-white">
//             <SvgIcon name="FiCheck" size={11} />
//           </span>
//         )}
//       </span>
//       <span>{label}</span>
//     </label>
//   );
// }

// function TabButton({ active, onClick, icon, children }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium border-b-2 transition-colors ${
//         active ? "border-[#8B2635] text-[#8B2635]" : "border-transparent text-slate-500 hover:text-slate-700"
//       }`}
//     >
//       <SvgIcon name={icon} size={14} />
//       {children}
//     </button>
//   );
// }

// /* ---------------------------------------------------------
//    Main component
// --------------------------------------------------------- */

// export default function ReportBuilder({
//   portraitRowsPerPage = 20,
//   landscapeRowsPerPage = 21,
// }) {
//   const [tab, setTab] = useState("design");
//   const [builder, setBuilder] = useState(defaultBuilderState());
//   const [templateName, setTemplateName] = useState("");
//   const [activeTemplateId, setActiveTemplateId] = useState(null);
//   const [savingTemplate, setSavingTemplate] = useState(false);

//   // API Logo State
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);

//   /* ---------------- Templates (DB-backed) ---------------- */
//   const {
//     data: templates = [],
//     isLoading: templatesLoading,
//   } = useGetReportTemplatesQuery("admission_register");
//   const [addReportTemplate] = useAddReportTemplateMutation();
//   const [updateReportTemplate] = useUpdateReportTemplateMutation();
//   const [deleteReportTemplate] = useDeleteReportTemplateMutation();

//   /* ---------------- ফিল্টার + লাইভ ডাটা (শেয়ার্ড হুক, useReportFilters) ---------------- */
//   const {
//     filters,
//     setFilters,
//     resetFilters,
//     sessions,
//     subClasses,
//     districts,
//     thanas,
//     residentialData,
//     filteredData,
//     dataLoading,
//   } = useReportFilters();

//   const isLandscape = builder.orientation === "landscape";

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   // ✅ Props থেকে rowsPerPage নেওয়া হচ্ছে
//   const rowsPerPage = isLandscape ? landscapeRowsPerPage : portraitRowsPerPage;

//   const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [totalPages, currentPage]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [filters]);

//   const chunks = useMemo(() => {
//     if (!filteredData || filteredData.length === 0) return [];
//     const chunked = [];
//     for (let i = 0; i < filteredData.length; i += rowsPerPage) {
//       chunked.push(filteredData.slice(i, i + rowsPerPage));
//     }
//     return chunked;
//   }, [filteredData, rowsPerPage]);

//   const activeColumns = COLUMN_DEFS.filter((c) => builder.columns[c.key]);
//   // ✅ Landscape-এ বেশি কলাম allow করা হলো যাতে বেশি ডাটা/হেডার বসানো যায়
//   // Portrait: ১১টি optional কলাম (মোট ১২টি + ক্র:), Landscape: ১৫টি optional কলাম (মোট ১৬টি + ক্র:)
//   const maxOptionalColumns = isLandscape ? 13 : 11;

//   const toggleColumn = (key, val) => {
//     setBuilder((b) => {
//       if (val) {
//         const currentActiveCount = Object.values(b.columns).filter(Boolean).length;
//         if (currentActiveCount >= maxOptionalColumns) {
//           return b;
//         }
//       }
//       return { ...b, columns: { ...b.columns, [key]: val } };
//     });
//   };

//   const toggleSubHeader = (key, val) => setBuilder((b) => ({ ...b, subHeaders: { ...b.subHeaders, [key]: val } }));

//   /* ---------------- Template save/load/delete (DB) ---------------- */

//   const handleSaveTemplate = async () => {
//     const name = templateName.trim() || builder.title || "নামহীন টেমপ্লেট";
//     setSavingTemplate(true);
//     try {
//       const payload = {
//         TemplateName: name,
//         ReportType: "admission_register",
//         Title: builder.title,
//         SessionBesideTitle: builder.sessionBesideTitle,
//         SubHeaders: builder.subHeaders,
//         Columns: builder.columns,
//         Orientation: builder.orientation,
//       };

//       if (activeTemplateId) {
//         await updateReportTemplate({ TemplateID: activeTemplateId, ...payload }).unwrap();
//       } else {
//         const created = await addReportTemplate(payload).unwrap();
//         setActiveTemplateId(created.TemplateID);
//       }
//       setTemplateName(name);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setSavingTemplate(false);
//     }
//   };

//   const handleNewTemplate = () => {
//     setBuilder(defaultBuilderState());
//     setTemplateName("");
//     setActiveTemplateId(null);
//   };

//   const handleLoadTemplate = (t) => {
//     setBuilder({
//       title: t.Title || "",
//       sessionBesideTitle: !!t.SessionBesideTitle,
//       subHeaders: t.SubHeaders || defaultBuilderState().subHeaders,
//       columns: t.Columns || defaultBuilderState().columns,
//       orientation: t.Orientation || "portrait",
//     });
//     setTemplateName(t.TemplateName);
//     setActiveTemplateId(t.TemplateID);
//   };

//   const handleDeleteTemplate = async (templateId) => {
//     try {
//       await deleteReportTemplate(templateId).unwrap();
//       if (activeTemplateId === templateId) handleNewTemplate();
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const subHeaderLine = () => {
//     const currentSubClassLabel =
//       subClasses.find((s) => String(s.SubClassID) === String(filters.SubClassID))?.SubClass || "সকল জামাত";
//     const currentAdmissionTypeLabel =
//       ADMISSION_TYPE_OPTIONS.find((o) => o.value === filters.admissionType)?.label || "সকল";

//     const parts = [];
//     if (builder.subHeaders.classJamat) parts.push(`শ্রেণী/জামাত: ${currentSubClassLabel}`);
//     if (builder.subHeaders.totalStudents) parts.push(`সর্বমোট শিক্ষার্থী: ${bn(filteredData.length)}`);
//     if (builder.subHeaders.studentType) parts.push(`শিক্ষার্থীর ধরন: ${currentAdmissionTypeLabel}`);
//     if (builder.subHeaders.printDate) parts.push(`প্রিন্ট তারিখ: ${todayBn()}`);
//     return parts;
//   };

//   const currentSessionLabel =
//     sessions.find((s) => String(s.SessionID) === String(filters.SessionID))?.SessionName || "সকল";

//   const renderCellValue = (row, columnKey) => {
//     switch (columnKey) {
//       case "photo":
//         return null; // নিচে আলাদাভাবে রেন্ডার হয়
//       case "address":
//         return addressLine(row);
//       case "financialStatus":
//         return ""; // TODO: StudentFinancialStatus টেবিল ওয়্যার করলে এখানে বসবে
//       case "idNo":
//         return row.StudentCode ? bn(row.StudentCode) : "";
//       case "DateOfBirth":
//         return bnDate(row.DateOfBirth);
//       case "StudentCode":
//       case "Mobile1":
//       case "Mobile2":
//       case "NIDNO":
//         return row[columnKey] ? bn(row[columnKey]) : "";
//       default:
//         return row[columnKey] || "";
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @media print {
//           @page {
//             size: A4 ${builder.orientation};
//             /* ✅ Landscape-এ মার্জিন আরও কমানো হলো যাতে বেশি জায়গা পাওয়া যায় */
//             margin: ${builder.orientation === 'landscape' ? '3mm' : '10mm'};
//           }
//           html, body {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//             background: #fff !important;
//           }
//           .print-page-container {
//             page-break-after: always;
//             page-break-inside: avoid;
//             break-after: page;
//             height: ${builder.orientation === 'landscape' ? '200mm' : '277mm'};
//             width: 100% !important;
//             max-width: 100% !important;
//             min-height: 0 !important;
//             /* ✅ Landscape-এ প্যাডিং আরও কমানো হলো */
//             padding: ${builder.orientation === 'landscape' ? '8px !important' : '16px !important'};
//             position: relative;
//             box-sizing: border-box;
//             box-shadow: none !important;
//             margin: 0 0 ${builder.orientation === 'landscape' ? '3mm' : '10mm'} 0 !important;
//             display: block !important;
//           }
//           .print-page-container:last-child {
//             page-break-after: auto;
//             break-after: auto;
//             margin-bottom: 0 !important;
//           }
//           .print-border-wrapper {
//             height: 100%;
//             display: flex;
//             flex-direction: column;
//           }
//           table {
//             page-break-inside: auto;
//             border-collapse: collapse !important;
//             /* ✅ Landscape-এ table-layout auto করা হলো যাতে বেশি কলাম auto-fit হয় */
//             table-layout: ${builder.orientation === 'landscape' ? 'auto' : 'fixed'};
//             width: 100%;
//             /* ✅ Landscape-এ ফন্ট ছোট করা হলো যাতে বেশি কলাম ফিট হয় */
//             font-size: ${builder.orientation === 'landscape' ? '11px' : '11px'};
//           }
//           tr {
//             page-break-inside: avoid;
//             page-break-after: auto;
//           }
//           thead {
//             display: table-header-group;
//           }
//           th, td {
//             border: 1px solid black !important;
//             word-wrap: break-word;
//             overflow-wrap: break-word;
//             /* ✅ Landscape-এ সেল প্যাডিং কমানো হলো যাতে বেশি কলাম ফিট হয় */
//             padding: ${builder.orientation === 'landscape' ? '2px 3px !important' : '4px 4px !important'};
//           }
//         }
//       `}</style>

//       <div
//         className="w-full min-h-screen bg-slate-100 flex flex-col lg:flex-row print:block print:min-h-0 print:bg-white"
//         style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
//       >

//         {/* -------------------- LEFT: BUILDER -------------------- */}
//         <div className="w-full lg:w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 print:hidden">
//           <div className="px-4 pt-4 pb-2 border-b border-slate-200">
//             <h1 className="text-base font-bold text-slate-800">রিপোর্ট টেমপ্লেট বিল্ডার</h1>
//             <p className="text-xs text-slate-500 mt-0.5">ভর্তি রেজিস্টার — লাইভ ডাটা</p>
//           </div>

//           <div className="flex border-b border-slate-200">
//             <TabButton active={tab === "design"} onClick={() => setTab("design")} icon="FiSettings">ডিজাইন ও টেমপ্লেট</TabButton>
//             <TabButton active={tab === "filter"} onClick={() => setTab("filter")} icon="FiFilter">ফিল্টার</TabButton>
//           </div>

//           <div className="flex-1 overflow-y-auto px-4 py-4">
//             {tab === "design" && (
//               <div className="space-y-6">

//                 <div className="bg-slate-50 p-3 rounded border border-slate-200">
//                   <SectionTitle icon="FiLayout">টেমপ্লেট নির্বাচন ও সেভ</SectionTitle>
//                   <div className="mb-3">
//                     <label className="text-xs font-medium text-slate-600 mb-1 block">টেমপ্লেটের নাম</label>
//                     <input
//                       value={templateName}
//                       onChange={(e) => setTemplateName(e.target.value)}
//                       placeholder="যেমন: ভর্তি রেজিস্টার - পোর্ট্রেট"
//                       className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30"
//                     />
//                   </div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <Button onClick={handleSaveTemplate} disabled={savingTemplate}>
//                       {savingTemplate ? "সেভ হচ্ছে..." : activeTemplateId ? "আপডেট করে সেভ" : "টেমপ্লেট সেভ করুন"}
//                     </Button>
//                     <button
//                       onClick={handleNewTemplate}
//                       title="নতুন টেমপ্লেট"
//                       className="px-3 py-2 text-white bg-slate-500 hover:bg-slate-600 rounded-md flex items-center gap-1.5 text-sm font-medium transition-colors"
//                     >
//                       <SvgIcon name="FiPlus" size={16} />
//                       নতুন
//                     </button>
//                   </div>
//                   {templatesLoading && (
//                     <p className="text-xs text-slate-400">টেমপ্লেট লোড হচ্ছে...</p>
//                   )}
//                   {!templatesLoading && templates.length > 0 && (
//                     <div className="space-y-1.5">
//                       <p className="text-xs font-medium text-slate-500 mb-1">সেভ করা টেমপ্লেটসমূহ:</p>
//                       {templates.map((t) => (
//                         <div
//                           key={t.TemplateID}
//                           className={`flex items-center justify-between border rounded px-3 py-2 text-sm ${
//                             activeTemplateId === t.TemplateID ? "border-[#1B3A57] bg-[#1B3A57]/5" : "border-slate-200 bg-white"
//                           }`}
//                         >
//                           <button onClick={() => handleLoadTemplate(t)} className="text-left flex-1 truncate text-slate-700">
//                             {t.TemplateName}
//                           </button>
//                           <button
//                             onClick={() => handleDeleteTemplate(t.TemplateID)}
//                             title="Delete"
//                             className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded-md ml-2 flex items-center gap-1 text-xs transition-colors"
//                           >
//                             <SvgIcon name="FiTrash2" size={14} />
//                             ডিলিট
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 <hr className="border-slate-200" />

//                 <div>
//                   <SectionTitle icon="FiFileText">শিরোনাম (Title)</SectionTitle>
//                   <input
//                     value={builder.title}
//                     onChange={(e) => setBuilder((b) => ({ ...b, title: e.target.value }))}
//                     placeholder="যেমন: ভর্তি রেজিস্টার"
//                     className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]"
//                   />
//                   <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
//                     <Checkbox
//                       checked={builder.sessionBesideTitle}
//                       onChange={(v) => setBuilder((b) => ({ ...b, sessionBesideTitle: v }))}
//                       label="শিক্ষাবর্ষ শিরোনামের পাশে দেখান"
//                     />
//                   </label>
//                 </div>

//                 <div>
//                   <SectionTitle icon="FiSettings">সাব-হেডার (শিরোনামের নিচে)</SectionTitle>
//                   <div className="grid grid-cols-1 gap-0.5">
//                     {SUB_HEADER_DEFS.map((s) => (
//                       <Checkbox
//                         key={s.key}
//                         checked={builder.subHeaders[s.key]}
//                         onChange={(v) => toggleSubHeader(s.key, v)}
//                         label={s.label}
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div>
//                   <div className="flex justify-between items-end mb-2">
//                     <SectionTitle icon="FiSettings">ডাটা কলাম নির্বাচন</SectionTitle>
//                     <span className="text-[10px] text-slate-400">সর্বোচ্চ {maxOptionalColumns + 1} কলাম</span>
//                   </div>
//                   <Checkbox checked disabled label="ক্র: (সবসময় থাকবে)" onChange={() => {}} />
//                   <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
//                     {COLUMN_DEFS.map((c) => {
//                       const isChecked = builder.columns[c.key];
//                       const isDisabled = !isChecked && activeColumns.length >= maxOptionalColumns;
//                       return (
//                         <Checkbox
//                           key={c.key}
//                           checked={isChecked}
//                           disabled={isDisabled}
//                           onChange={(v) => toggleColumn(c.key, v)}
//                           label={c.label}
//                         />
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <SectionTitle icon="FiFileText">পৃষ্ঠার দিক</SectionTitle>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setBuilder((b) => ({ ...b, orientation: "portrait" }))}
//                       className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${
//                         !isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"
//                       }`}
//                     >
//                       <SvgIcon name="FiFileText" size={18} />
//                       Portrait
//                     </button>
//                     <button
//                       onClick={() => setBuilder((b) => ({ ...b, orientation: "landscape" }))}
//                       className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${
//                         isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"
//                       }`}
//                     >
//                       <span className="rotate-90 inline-block">
//                         <SvgIcon name="FiFileText" size={18} />
//                       </span>
//                       Landscape
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {tab === "filter" && (
//               <ReportFilterFields
//                 filters={filters}
//                 setFilters={setFilters}
//                 sessions={sessions}
//                 subClasses={subClasses}
//                 districts={districts}
//                 thanas={thanas}
//                 residentialData={residentialData}
//                 resultCount={filteredData.length}
//                 loading={dataLoading}
//                 onPrint={() => window.print()}
//                 onReset={() => { resetFilters(); setCurrentPage(1); }}
//                 note="টেমপ্লেট তৈরি হয়ে গেলে এখান থেকে ফিল্টার করে দেখুন প্রিভিউতে কোন ডাটা আসবে।"
//               />
//             )}
//           </div>
//         </div>

//         {/* -------------------- RIGHT: LIVE PREVIEW -------------------- */}
//         <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center print:p-0 print:overflow-visible print:block">

//           <div className="flex items-center gap-4 mb-4 bg-white px-4 py-2 rounded shadow-sm print:hidden">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"
//             >
//               <SvgIcon name="FiChevronLeft" size={20} />
//             </button>
//             <span className="text-sm font-semibold text-slate-700">
//               পেজ {bn(currentPage)} / {bn(totalPages)}
//             </span>
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"
//             >
//               <SvgIcon name="FiChevronRight" size={20} />
//             </button>
//           </div>

//           <div id="print-section" className="w-full flex flex-col items-center print:block">
//             {dataLoading ? (
//               <div className="text-center text-slate-400 p-10 font-bold">ডাটা লোড হচ্ছে...</div>
//             ) : chunks.length === 0 ? (
//               <div
//                 className="print-page-container bg-white shadow-md relative w-full"
//                 style={{
//                   /* ✅ Landscape-এ প্রস্থ আরও বাড়ানো হলো (1080px → 1400px) এবং প্যাডিং কমানো হলো */
//                   maxWidth: isLandscape ? "1400px" : "750px",
//                   padding: isLandscape ? "20px 10px" : "28px 32px",
//                 }}
//               >
//                 <div className="text-center text-slate-400 p-10 font-bold">ফিল্টারে কোনো শিক্ষার্থী পাওয়া যায়নি</div>
//               </div>
//             ) : (
//               chunks.map((chunk, pageIndex) => {
//                 const isVisibleOnScreen = pageIndex + 1 === currentPage;

//                 return (
//                   <div
//                     key={pageIndex}
//                     className={`print-page-container bg-white shadow-md relative mx-auto ${isVisibleOnScreen ? "block" : "hidden print:block"}`}
//                     style={{
//                       /* ✅ Landscape-এ width আরও বাড়ানো হলো (1080px → 1400px) এবং প্যাডিং কমানো হলো */
//                       width: isLandscape ? "1400px" : "750px",
//                       maxWidth: "100%",
//                       minHeight: isLandscape ? "800px" : "1000px",
//                       padding: isLandscape ? "20px 10px" : "28px 32px",
//                       boxSizing: "border-box",
//                       marginBottom: "1rem"
//                     }}
//                   >
//                     <div className="print-border-wrapper h-full flex flex-col">

//                       <div className="w-full relative mb-4 flex flex-col items-center justify-center">

//                         <div className="absolute left-0 top-0 flex justify-start items-start">
//                           {logo ? (
//                             <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
//                           ) : (
//                             <div className="w-16 h-16 sm:w-20 sm:h-20"></div>
//                           )}
//                         </div>

//                         <h1 className="text-[18px] sm:text-[22px] font-extrabold text-black leading-tight text-center">
//                           {instutionInfo?.InstitutionName}
//                         </h1>
//                         <p className="text-[14px] sm:text-[15px] font-medium text-black mt-1 text-center">
//                           {instutionInfo?.Address}
//                         </p>

//                         <div className="mt-3 mb-1">
//                           <div className="border-[1.5px] border-black rounded-full px-6 py-[4px] inline-block bg-white">
//                             <span className="text-[14px] sm:text-[16px] font-bold text-black tracking-wide">
//                               {builder.title || "শিরোনাম"}
//                             </span>
//                           </div>
//                         </div>

//                         {builder.sessionBesideTitle && (
//                           <div className="absolute right-0 bottom-2">
//                             <span className="text-[14px] font-bold text-black">
//                               শিক্ষাবর্ষ : {currentSessionLabel}
//                             </span>
//                           </div>
//                         )}
//                       </div>

//                       {subHeaderLine().length > 0 && (
//                         <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-1 text-[13px] font-bold text-black mb-3 border-y border-black py-1.5 w-full">
//                           {subHeaderLine().map((line, i) => (
//                             <span key={i}>{line}</span>
//                           ))}
//                         </div>
//                       )}

//                       <div className="w-full flex-grow overflow-x-auto">
//                         <table
//                           className="w-full border-collapse border border-black text-black"
//                           style={{
//                             /* ✅ Landscape-এ font-size ছোট (9px), portrait-এ আগের মতো (11px) */
//                             fontSize: isLandscape ? "11px" : "11px",
//                             /* ✅ Landscape-এ table-layout auto, portrait-এ fixed */
//                             tableLayout: isLandscape ? "auto" : "fixed",
//                           }}
//                         >
//                           <thead>
//                             <tr className="bg-white">
//                               <th
//                                 className="border border-black text-center font-bold"
//                                 style={{
//                                   width: isLandscape ? "auto" : "4%",
//                                   padding: isLandscape ? "2px 3px" : "4px 4px",
//                                 }}
//                               >
//                                 ক্র:
//                               </th>
//                               {activeColumns.map((c) => (
//                                 <th
//                                   key={c.key}
//                                   className="border border-black text-center font-bold"
//                                   style={{
//                                     /* ✅ Landscape-এ width auto, portrait-এ নির্দিষ্ট width */
//                                     width: isLandscape ? "auto" : c.width,
//                                     padding: isLandscape ? "2px 3px" : "4px 4px",
//                                   }}
//                                 >
//                                   {c.label}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {chunk.map((row, idx) => (
//                               <tr key={row.ID ?? idx} className="bg-white break-inside-avoid print:break-inside-avoid">
//                                 <td
//                                   className="border border-black text-center font-bold"
//                                   style={{
//                                     padding: isLandscape ? "2px 3px" : "4px 4px",
//                                   }}
//                                 >
//                                   {bn(pageIndex * rowsPerPage + idx + 1)}
//                                 </td>
//                                 {activeColumns.map((c) => {
//                                   if (c.key === "photo") {
//                                     return (
//                                       <td
//                                         key={c.key}
//                                         className="border border-black text-center"
//                                         style={{
//                                           padding: isLandscape ? "2px 3px" : "4px 4px",
//                                         }}
//                                       >
//                                         <div
//                                           className="mx-auto bg-slate-100 border border-black"
//                                           style={{
//                                             width: isLandscape ? "20px" : "24px",
//                                             height: isLandscape ? "24px" : "28px",
//                                           }}
//                                         />
//                                       </td>
//                                     );
//                                   }
//                                   return (
//                                     <td
//                                       key={c.key}
//                                       className="border border-black text-left font-medium"
//                                       style={{
//                                         padding: isLandscape ? "2px 4px" : "4px 6px",
//                                       }}
//                                     >
//                                       {renderCellValue(row, c.key)}
//                                     </td>
//                                   );
//                                 })}
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
//                         পৃষ্ঠা : {bn(pageIndex + 1)} / {bn(totalPages)}
//                       </div>

//                     </div>
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
