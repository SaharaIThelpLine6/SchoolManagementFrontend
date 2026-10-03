import { Buffer } from "buffer";
import { useState, useMemo, useEffect, useRef } from "react";
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

const CUSTOM_COLUMNS_KEY = "__customColumns";

const MAX_TOTAL_COLUMNS = {
  portrait: 11,
  landscape: 13,
};

const PAGE_PX = {
  portrait: { width: 794, height: 1118, padX: 32, padY: 28 },
  landscape: { width: 1123, height: 790, padX: 16, padY: 16 },
};

// ✅ পারফেক্ট ব্যালেন্সের জন্য সেফটি গ্যাপ ২৫px করা হয়েছে
const SAFETY_GAP = 25;

const SHRINK_STEP = 10;
const MAX_SHRINK = 400;

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

  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    const logoField = instutionInfo?.Logo;
    if (!logoField) return;
    try {
      let src = null;
      if (typeof logoField === "string") {
        src = logoField.startsWith("data:")
          ? logoField
          : `data:image/png;base64,${logoField}`;
      } else {
        const raw = logoField.data ?? logoField;
        if (Array.isArray(raw)) {
          src = `data:image/png;base64,${Buffer.from(raw).toString("base64")}`;
        } else if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
          src = `data:image/png;base64,${Buffer.from(raw.data).toString("base64")}`;
        } else if (typeof raw === "string") {
          src = raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
        }
      }
      if (src) setLogo(src);
    } catch (err) {
      console.error("Logo render error:", err);
    }
  }, [instutionInfo]);

  const buildPhotoSrc = (imgData) => {
    if (!imgData) return null;
    try {
      if (typeof imgData === "string") {
        return imgData.startsWith("data:")
          ? imgData
          : `data:image/png;base64,${imgData}`;
      }
      const raw = imgData.data ?? imgData;
      if (Array.isArray(raw)) {
        return `data:image/png;base64,${Buffer.from(raw).toString("base64")}`;
      }
      if (raw && typeof raw === "object" && Array.isArray(raw.data)) {
        return `data:image/png;base64,${Buffer.from(raw.data).toString("base64")}`;
      }
      if (typeof raw === "string") {
        return raw.startsWith("data:") ? raw : `data:image/png;base64,${raw}`;
      }
      return null;
    } catch (err) {
      console.error("Student photo render error:", err);
      return null;
    }
  };

  const {
    data: templates = [],
    isLoading: templatesLoading,
  } = useGetReportTemplatesQuery("admission_register");
  const [addReportTemplate] = useAddReportTemplateMutation();
  const [updateReportTemplate] = useUpdateReportTemplateMutation();
  const [deleteReportTemplate] = useDeleteReportTemplateMutation();

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
  const page = isLandscape ? PAGE_PX.landscape : PAGE_PX.portrait;
  const innerWidth = page.width - page.padX * 2;
  const [currentPage, setCurrentPage] = useState(1);
  const baseFallbackRows = isLandscape ? landscapeRowsPerPage : portraitRowsPerPage;
  const activeColumns = COLUMN_DEFS.filter((c) => builder.columns[c.key]);

  const currentCustomColumns = isLandscape
    ? builder.customColumns?.landscape || []
    : builder.customColumns?.portrait || [];

  const allRenderColumns = [...activeColumns, ...currentCustomColumns];
  const maxTotalColumns = isLandscape
    ? MAX_TOTAL_COLUMNS.landscape
    : MAX_TOTAL_COLUMNS.portrait;

  const totalColumns = activeColumns.length + currentCustomColumns.length;
  const slotsFull = totalColumns >= maxTotalColumns;
  const columnsKey = allRenderColumns.map((c) => `${c.key || c.id}:${c.width}`).join("|");

  const colWidths = useMemo(() => {
    const serial = 4;
    const parsed = allRenderColumns.map((c) => {
      const n = parseFloat(String(c.width ?? "10").replace("%", ""));
      return Number.isFinite(n) && n > 0 ? n : 10;
    });
    const sum = serial + parsed.reduce((a, b) => a + b, 0);
    return {
      serial: `${((serial / sum) * 100).toFixed(3)}%`,
      cols: parsed.map((p) => `${((p / sum) * 100).toFixed(3)}%`),
    };
  }, [columnsKey]);

  const cellPad = isLandscape ? "2px 3px" : "4px 4px";
  const textCellPad = isLandscape ? "2px 4px" : "4px 6px";

  const toggleColumn = (key, val) => {
    setBuilder((b) => {
      if (val) {
        const currentActiveCount = COLUMN_DEFS.filter((c) => b.columns[c.key]).length;
        const currentCustomCount = (b.customColumns?.[b.orientation] || []).length;
        const currentMax = b.orientation === "landscape"
          ? MAX_TOTAL_COLUMNS.landscape
          : MAX_TOTAL_COLUMNS.portrait;
        if (currentActiveCount + currentCustomCount >= currentMax) return b;
      }
      return { ...b, columns: { ...b.columns, [key]: val } };
    });
  };

  const toggleSubHeader = (key, val) => setBuilder((b) => ({ ...b, subHeaders: { ...b.subHeaders, [key]: val } }));

  const handleAddCustomColumn = () => {
    const orientation = builder.orientation;
    const currentCustomCount = (builder.customColumns?.[orientation] || []).length;
    const currentActiveCount = COLUMN_DEFS.filter((c) => builder.columns[c.key]).length;
    const currentMax = orientation === "landscape"
      ? MAX_TOTAL_COLUMNS.landscape
      : MAX_TOTAL_COLUMNS.portrait;

    if (currentActiveCount + currentCustomCount >= currentMax) return;

    const newCol = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      key: "",
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

  const handleSaveTemplate = async () => {
    const name = templateName.trim() || builder.title || "নামহীন টেমপ্লেট";
    setSavingTemplate(true);
    try {
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
    const loadedColumnsRaw = t.Columns || {};
    const { [CUSTOM_COLUMNS_KEY]: loadedCustom, ...loadedFlags } = loadedColumnsRaw;
    const flagsToUse = Object.keys(loadedFlags).length > 0 ? loadedFlags : defaultBuilderState().columns;

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
    if (!columnKey) return "";
    switch (columnKey) {
      case "photo":
        return null;
      case "address":
        return addressLine(row);
      case "financialStatus":
        return "";
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

  const renderHeaderBlock = () => (
    <div className="w-full relative mb-4 flex flex-col items-center justify-center shrink-0">
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
  );

  const renderSubHeaderBlock = () => {
    const lines = subHeaderLine();
    if (lines.length === 0) return null;
    return (
      <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-1 text-[13px] font-bold text-black mb-3 border-y border-black py-1.5 w-full shrink-0">
        {lines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </div>
    );
  };

  const renderTableHead = () => (
    <thead>
      <tr className="bg-white">
        <th className="border border-black text-center font-bold" style={{ width: colWidths.serial, padding: cellPad, wordWrap: "break-word", overflowWrap: "break-word" }}>ক্র:</th>
        {allRenderColumns.map((c, i) => (
          <th key={c.key || c.id} className="border border-black text-center font-bold" style={{ width: colWidths.cols[i], padding: cellPad, wordWrap: "break-word", overflowWrap: "break-word" }}>
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderRow = (row, serialNumber, rowKey, isMeasure) => (
    <tr
      key={rowKey}
      data-measure-row={isMeasure ? "1" : undefined}
      className="bg-white break-inside-avoid print:break-inside-avoid"
    >
      <td className="border border-black text-center font-bold" style={{ padding: cellPad, wordWrap: "break-word", overflowWrap: "break-word" }}>
        {bn(serialNumber)}
      </td>
      {allRenderColumns.map((c) => {
        if (c.key === "photo") {
          const photoSrc = buildPhotoSrc(row.Photo);
          const w = isLandscape ? 20 : 24;
          const h = isLandscape ? 24 : 28;
          return (
            <td key={c.key || c.id} className="border border-black text-center align-middle" style={{ padding: cellPad, wordWrap: "break-word", overflowWrap: "break-word" }}>
              {photoSrc ? (
                <img src={photoSrc} alt="" className="mx-auto object-cover border border-black" style={{ width: w, height: h }} />
              ) : (
                <div className="mx-auto bg-slate-100 border border-black" style={{ width: w, height: h }} />
              )}
            </td>
          );
        }
        return (
          <td key={c.key || c.id} className="border border-black text-left font-medium" style={{ padding: textCellPad, wordWrap: "break-word", overflowWrap: "break-word" }}>
            {renderCellValue(row, c.key)}
          </td>
        );
      })}
    </tr>
  );

  const renderFooter = (pageNo, total) => (
    <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold shrink-0">
      পৃষ্ঠা : {bn(pageNo)} / {bn(total)}
    </div>
  );

  const measureRef = useRef(null);
  const visiblePageTableRef = useRef(null);

  const [rowMetrics, setRowMetrics] = useState({ ready: false, rows: [] });
  const [pageSpace, setPageSpace] = useState({ table: 0, thead: 0 });
  const [shrink, setShrink] = useState(0);
  const [fallbackTrim, setFallbackTrim] = useState(0);

  const layoutSignature = useMemo(
    () =>
      JSON.stringify({
        columnsKey,
        orientation: builder.orientation,
        subHeaders: builder.subHeaders,
        title: builder.title,
        sessionBeside: builder.sessionBesideTitle,
        sessionLabel: currentSessionLabel,
        hasLogo: !!logo,
        inst: instutionInfo?.InstitutionName || "",
        addr: instutionInfo?.Address || "",
      }),
    [columnsKey, builder.orientation, builder.subHeaders, builder.title, builder.sessionBesideTitle, currentSessionLabel, logo, instutionInfo]
  );

  useEffect(() => {
    setShrink(0);
    setFallbackTrim(0);
  }, [layoutSignature, filteredData]);

  useEffect(() => {
    if (!filteredData || filteredData.length === 0) {
      setRowMetrics((prev) => (prev.ready || prev.rows.length ? { ready: false, rows: [] } : prev));
      return;
    }
    let cancelled = false;
    const doMeasure = () => {
      const root = measureRef.current;
      if (!root || cancelled) return;
      const trs = root.querySelectorAll("[data-measure-row]");
      if (trs.length !== filteredData.length) return;

      const rows = Array.from(trs).map((tr) => tr.getBoundingClientRect().height + 1);
      if (cancelled || rows.some((h) => !h)) return;

      setRowMetrics((prev) => {
        if (prev.ready && prev.rows.length === rows.length && prev.rows.every((h, i) => Math.abs(h - rows[i]) < 0.5)) {
          return prev;
        }
        return { ready: true, rows };
      });
    };

    const raf = requestAnimationFrame(() => requestAnimationFrame(doMeasure));
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!cancelled) doMeasure(); });
    }
    const t1 = setTimeout(doMeasure, 300);
    const t2 = setTimeout(doMeasure, 900);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [filteredData, layoutSignature]);

  useEffect(() => {
    const read = () => {
      const el = visiblePageTableRef.current;
      if (!el) return;
      const theadEl = el.querySelector("thead");
      const next = {
        table: el.clientHeight,
        thead: theadEl ? theadEl.offsetHeight : 0,
      };
      if (!next.table) return;
      setPageSpace((prev) => (prev.table === next.table && prev.thead === next.thead ? prev : next));
    };

    const raf = requestAnimationFrame(read);
    const t1 = setTimeout(read, 300);
    const t2 = setTimeout(read, 900);

    let ro;
    if (typeof ResizeObserver !== "undefined" && visiblePageTableRef.current) {
      ro = new ResizeObserver(read);
      ro.observe(visiblePageTableRef.current);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      if (ro) ro.disconnect();
    };
  }, [layoutSignature, filteredData, currentPage, dataLoading]);

  const autoReady = rowMetrics.ready && rowMetrics.rows.length === (filteredData?.length || 0) && pageSpace.table > 0;
  const availableForRows = Math.max(0, pageSpace.table - pageSpace.thead - SAFETY_GAP - shrink);
  const effectiveFallbackRows = Math.max(1, baseFallbackRows - fallbackTrim);

  const chunks = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    if (!autoReady || availableForRows < 20) {
      const out = [];
      for (let i = 0; i < filteredData.length; i += effectiveFallbackRows) {
        out.push(filteredData.slice(i, i + effectiveFallbackRows));
      }
      return out;
    }
    const pages = [];
    let current = [];
    let used = 0;
    filteredData.forEach((row, i) => {
      const h = rowMetrics.rows[i] || 0;
      if (current.length > 0 && used + h > availableForRows) {
        pages.push(current);
        current = [];
        used = 0;
      }
      current.push(row);
      used += h;
    });
    if (current.length > 0) pages.push(current);
    return pages;
  }, [filteredData, autoReady, availableForRows, rowMetrics, effectiveFallbackRows]);

  const totalPages = chunks.length || 1;
  const pageStartIndexes = useMemo(() => {
    const out = [];
    let acc = 0;
    chunks.forEach((c) => {
      out.push(acc);
      acc += c.length;
    });
    return out;
  }, [chunks]);

  // ✅ নিখুঁত Watchdog: এবার শুধুমাত্র টেবিলের নিজস্ব কন্টেইনারের সাথে আসল টেবিলের উচ্চতা মাপা হবে
  useEffect(() => {
    if (!chunks.length) return;
    const id = requestAnimationFrame(() => {
      const el = visiblePageTableRef.current;
      if (!el) return;
      
      const tableEl = el.querySelector("table");
      if (!tableEl) return;
      
      // যদি টেবিলের উচ্চতা তার flex-grow কন্টেইনারের চেয়ে বড় হয়ে যায়
      if (tableEl.offsetHeight > el.clientHeight + 2) {
        if (autoReady) {
          setShrink((s) => (s < MAX_SHRINK ? s + SHRINK_STEP : s));
        } else {
          setFallbackTrim((t) => (t < 40 ? t + 1 : t));
        }
      }
    });
    return () => cancelAnimationFrame(id);
  }, [chunks, currentPage, shrink, fallbackTrim, autoReady]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const previewAreaRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = previewAreaRef.current;
    if (!el) return;
    const calc = () => {
      const avail = el.clientWidth - 8;
      if (avail > 0) setScale(Math.min(1, avail / page.width));
    };
    calc();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(calc);
      ro.observe(el);
    }
    window.addEventListener("resize", calc);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", calc);
    };
  }, [page.width]);

  const rowsOnCurrentPage = chunks[currentPage - 1]?.length || 0;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 ${builder.orientation}; margin: 0; }
          html, body { margin: 0; padding: 0; box-sizing: border-box; background: #fff !important; }
          .measure-layer { display: none !important; }
          .print-scale-wrapper { width: ${page.width}px !important; height: ${page.height}px !important; margin: 0 !important; padding: 0 !important; display: block !important; overflow: hidden !important; }
          .print-page-container { transform: none !important; width: ${page.width}px !important; height: ${page.height}px !important; min-height: 0 !important; padding: ${page.padY}px ${page.padX}px !important; position: relative; box-sizing: border-box; box-shadow: none !important; margin: 0 !important; overflow: hidden !important; display: block !important; page-break-after: always; page-break-inside: avoid; break-after: page; break-inside: avoid; }
          .print-scale-wrapper:last-child .print-page-container { page-break-after: auto; break-after: auto; margin-bottom: 0 !important; }
          .print-border-wrapper { height: 100%; display: flex; flex-direction: column; }
          table { page-break-inside: auto; border-collapse: collapse !important; table-layout: fixed; width: 100%; font-size: 11px; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          th, td { border: 1px solid black !important; word-wrap: break-word; overflow-wrap: break-word; }
        }
      `}</style>

      <div className="w-full min-h-screen bg-slate-100 flex flex-col lg:flex-row print:block print:min-h-0 print:bg-white" style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}>
        
        {/* LEFT PANEL */}
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
                    <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="যেমন: ভর্তি রেজিস্টার - পোর্ট্রেট" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button onClick={handleSaveTemplate} disabled={savingTemplate}>{savingTemplate ? "সেভ হচ্ছে..." : activeTemplateId ? "আপডেট করে সেভ" : "টেমপ্লেট সেভ করুন"}</Button>
                    <button onClick={handleNewTemplate} title="নতুন টেমপ্লেট" className="px-3 py-2 text-white bg-slate-500 hover:bg-slate-600 rounded-md flex items-center gap-1.5 text-sm font-medium transition-colors"><SvgIcon name="FiPlus" size={16} />নতুন</button>
                  </div>
                  {templatesLoading && <p className="text-xs text-slate-400">টেমপ্লেট লোড হচ্ছে...</p>}
                  {!templatesLoading && templates.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-slate-500 mb-1">সেভ করা টেমপ্লেটসমূহ:</p>
                      {templates.map((t) => (
                        <div key={t.TemplateID} className={`flex items-center justify-between border rounded px-3 py-2 text-sm ${activeTemplateId === t.TemplateID ? "border-[#1B3A57] bg-[#1B3A57]/5" : "border-slate-200 bg-white"}`}>
                          <button onClick={() => handleLoadTemplate(t)} className="text-left flex-1 truncate text-slate-700">{t.TemplateName}</button>
                          <button onClick={() => handleDeleteTemplate(t.TemplateID)} title="Delete" className="px-2 py-1 text-white bg-red-500 hover:bg-red-600 rounded-md ml-2 flex items-center gap-1 text-xs transition-colors"><SvgIcon name="FiTrash2" size={14} />ডিলিট</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <hr className="border-slate-200" />
                <div>
                  <SectionTitle icon="FiFileText">শিরোনাম (Title)</SectionTitle>
                  <input value={builder.title} onChange={(e) => setBuilder((b) => ({ ...b, title: e.target.value }))} placeholder="যেমন: ভর্তি রেজিস্টার" className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]" />
                  <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 cursor-pointer">
                    <Checkbox checked={builder.sessionBesideTitle} onChange={(v) => setBuilder((b) => ({ ...b, sessionBesideTitle: v }))} label="শিক্ষাবর্ষ শিরোনামের পাশে দেখান" />
                  </label>
                </div>
                <div>
                  <SectionTitle icon="FiSettings">সাব-হেডার (শিরোনামের নিচে)</SectionTitle>
                  <div className="grid grid-cols-1 gap-0.5">
                    {SUB_HEADER_DEFS.map((s) => (
                      <Checkbox key={s.key} checked={builder.subHeaders[s.key]} onChange={(v) => toggleSubHeader(s.key, v)} label={s.label} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <SectionTitle icon="FiSettings">ডাটা কলাম নির্বাচন</SectionTitle>
                    <span className={`text-[10px] font-semibold ${slotsFull ? "text-red-500" : "text-slate-400"}`}>মোট: {bn(totalColumns)} / {bn(maxTotalColumns)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3 overflow-hidden">
                    <div className={`h-full transition-all ${slotsFull ? "bg-red-500" : "bg-[#1B3A57]"}`} style={{ width: `${Math.min(100, (totalColumns / maxTotalColumns) * 100)}%` }} />
                  </div>
                  <Checkbox checked disabled label="ক্র: (সবসময় থাকবে)" onChange={() => {}} />
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1">
                    {COLUMN_DEFS.map((c) => {
                      const isChecked = builder.columns[c.key];
                      const isDisabled = !isChecked && slotsFull;
                      return <Checkbox key={c.key} checked={isChecked} disabled={isDisabled} onChange={(v) => toggleColumn(c.key, v)} label={c.label} />;
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <SectionTitle icon="FiSettings">কাস্টম কলাম ({isLandscape ? "Landscape" : "Portrait"})</SectionTitle>
                    <span className="text-[10px] text-slate-400">মোট: {bn(currentCustomColumns.length)}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 leading-relaxed">এই কাস্টম কলামগুলো শুধু <b>{isLandscape ? "Landscape" : "Portrait"}</b> মোডে দেখাবে। ডাটা সোর্স খালি রাখলে হাতে লিখার জন্য খালি কলাম থাকবে।</p>
                  {currentCustomColumns.length === 0 && <p className="text-[11px] text-slate-400 mb-2 italic">এখনো কোনো কাস্টম কলাম যোগ করা হয়নি।</p>}
                  <div className="space-y-2">
                    {currentCustomColumns.map((col, idx) => (
                      <div key={col.id} className="border border-slate-200 rounded p-2 bg-white space-y-2">
                        <div className="flex gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 font-semibold w-5">#{idx + 1}</span>
                          <input value={col.label} onChange={(e) => handleUpdateCustomColumn(col.id, "label", e.target.value)} placeholder="হেডারের নাম" className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1B3A57]" />
                          <button onClick={() => handleDeleteCustomColumn(col.id)} title="Delete" className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"><SvgIcon name="FiTrash2" size={12} />Delete</button>
                        </div>
                        <div className="flex gap-1.5">
                          <select value={col.key} onChange={(e) => handleUpdateCustomColumn(col.id, "key", e.target.value)} className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#1B3A57]">
                            <option value="">খালি (হাতে লিখবেন)</option>
                            {COLUMN_DEFS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleAddCustomColumn} disabled={slotsFull} className={`mt-3 w-full py-2 border-2 border-dashed rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${slotsFull ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-300 hover:border-[#1B3A57] text-slate-600 hover:text-[#1B3A57]"}`}>
                    <SvgIcon name="FiPlus" size={14} />{slotsFull ? `স্লট পূর্ণ (${bn(maxTotalColumns)})` : "নতুন কাস্টম কলাম যোগ করুন"}
                  </button>
                </div>
                <div>
                  <SectionTitle icon="FiFileText">পৃষ্ঠার দিক</SectionTitle>
                  <div className="flex gap-2">
                    <button onClick={() => setBuilder((b) => ({ ...b, orientation: "portrait" }))} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${!isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"}`}>
                      <SvgIcon name="FiFileText" size={18} />Portrait
                    </button>
                    <button onClick={() => setBuilder((b) => ({ ...b, orientation: "landscape" }))} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded border text-xs ${isLandscape ? "border-[#1B3A57] bg-[#1B3A57]/5 text-[#1B3A57] font-semibold" : "border-slate-300 text-slate-500"}`}>
                      <span className="rotate-90 inline-block"><SvgIcon name="FiFileText" size={18} /></span>Landscape
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <SectionTitle icon="FiLayout">পেজে রো বসানো (অটো)</SectionTitle>
                  <p className="text-[11px] text-slate-600 leading-relaxed">প্রতি পেজে কয়টি রো বসবে তা লেখার আসল উচ্চতা মেপে নিজে থেকেই ঠিক হয়। নাম বা ঠিকানা দুই লাইনে গেলে সেই পেজে রো কম বসে, বাকিটা পরের পেজে যায়।</p>
                  <div className="mt-2 text-[11px] font-semibold text-slate-700">{dataLoading ? "ডাটা লোড হচ্ছে..." : filteredData.length === 0 ? "কোনো ডাটা নেই" : `মোট ${bn(filteredData.length)} জন · ${bn(totalPages)} পৃষ্ঠা · এই পৃষ্ঠায় ${bn(rowsOnCurrentPage)} জন`}</div>
                  <div className="mt-1 text-[10px] text-slate-400 leading-relaxed">{autoReady ? `মাপ: টেবিলের জায়গা ${pageSpace.table}px · হেডার ${pageSpace.thead}px · রো-এর জন্য ${Math.round(availableForRows)}px${shrink ? ` · সংশোধন −${shrink}px` : ""}` : "মাপজোক চলছে..."}</div>
                </div>
              </div>
            )}
            {tab === "filter" && (
              <ReportFilterFields filters={filters} setFilters={setFilters} sessions={sessions} subClasses={subClasses} districts={districts} thanas={thanas} residentialData={residentialData} resultCount={filteredData.length} loading={dataLoading} onPrint={() => window.print()} onReset={() => { resetFilters(); setCurrentPage(1); }} note="টেমপ্লেট তৈরি হয়ে গেলে এখান থেকে ফিল্টার করে দেখুন প্রিভিউতে কোন ডাটা আসবে।" />
            )}
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div ref={previewAreaRef} className="flex-1 overflow-auto p-4 md:p-6 flex flex-col items-center print:p-0 print:overflow-visible print:block">
          <div className="flex items-center gap-4 mb-4 bg-white px-4 py-2 rounded shadow-sm print:hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"><SvgIcon name="FiChevronLeft" size={20} /></button>
            <span className="text-sm font-semibold text-slate-700">পেজ {bn(currentPage)} / {bn(totalPages)}{rowsOnCurrentPage > 0 && <span className="text-slate-400 font-normal"> · এই পেজে {bn(rowsOnCurrentPage)} জন</span>}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-slate-600 disabled:opacity-50 hover:text-[#1B3A57]"><SvgIcon name="FiChevronRight" size={20} /></button>
          </div>

          <div ref={measureRef} className="measure-layer print:hidden" aria-hidden="true" style={{ position: "fixed", left: "-99999px", top: 0, width: `${innerWidth}px`, visibility: "hidden", pointerEvents: "none", zIndex: -1, background: "#fff" }}>
            <table className="border-collapse border border-black text-black" style={{ fontSize: "11px", tableLayout: "fixed", width: `${innerWidth}px` }}>
              {renderTableHead()}
              <tbody>{filteredData.map((row, idx) => renderRow(row, idx + 1, `m-${row.ID ?? idx}`, true))}</tbody>
            </table>
          </div>

          <div id="print-section" className="w-full flex flex-col items-center print:block">
            {dataLoading ? (
              <div className="text-center text-slate-400 p-10 font-bold">ডাটা লোড হচ্ছে...</div>
            ) : chunks.length === 0 ? (
              <div className="print-scale-wrapper" style={{ width: page.width * scale, height: page.height * scale, marginBottom: "1rem" }}>
                <div className="print-page-container bg-white shadow-md relative" style={{ width: `${page.width}px`, height: `${page.height}px`, padding: `${page.padY}px ${page.padX}px`, boxSizing: "border-box", transform: `scale(${scale})`, transformOrigin: "top left", overflow: "hidden" }}>
                  <div className="text-center text-slate-400 p-10 font-bold">ফিল্টারে কোনো শিক্ষার্থী পাওয়া যায়নি</div>
                </div>
              </div>
            ) : (
              chunks.map((chunk, pageIndex) => {
                const isVisibleOnScreen = pageIndex + 1 === currentPage;
                const startIndex = pageStartIndexes[pageIndex] || 0;
                return (
                  <div key={pageIndex} className={`print-scale-wrapper ${isVisibleOnScreen ? "block" : "hidden print:block"}`} style={{ width: page.width * scale, height: page.height * scale, marginBottom: "1rem" }}>
                    <div className="print-page-container bg-white shadow-md relative" style={{ width: `${page.width}px`, height: `${page.height}px`, padding: `${page.padY}px ${page.padX}px`, boxSizing: "border-box", transform: `scale(${scale})`, transformOrigin: "top left", overflow: "hidden" }}>
                      <div className="print-border-wrapper h-full flex flex-col">
                        {renderHeaderBlock()}
                        {renderSubHeaderBlock()}
                        
                        <div ref={isVisibleOnScreen ? visiblePageTableRef : null} className="w-full flex-grow" style={{ minHeight: 0 }}>
                          <table className="w-full border-collapse border border-black text-black" style={{ fontSize: "11px", tableLayout: "fixed" }}>
                            {renderTableHead()}
                            <tbody>{chunk.map((row, idx) => renderRow(row, startIndex + idx + 1, row.ID ?? `${pageIndex}-${idx}`, false))}</tbody>
                          </table>
                        </div>
                        
                        {renderFooter(pageIndex + 1, totalPages)}
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
