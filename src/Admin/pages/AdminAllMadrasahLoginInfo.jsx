// src/Admin/pages/AdminUserLoginHistory.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import useTranslate from "../../utils/Translate";
import {
  useGetLoginOverviewQuery,
  useGetLoginDetailsQuery,
} from "../../features/Admin/adminDashboardSlice";

// ======================================================================
// Constants
// ======================================================================
const LOGIN_TYPES = {
  1: { key: "desktop", name: "Desktop App", color: "#3b82f6" },
  2: { key: "website", name: "Website Dashboard", color: "#10b981" },
  3: { key: "teacherApp", name: "Teacher App", color: "#f59e0b" },
};
const TYPE_ENTRIES = Object.entries(LOGIN_TYPES).map(([id, v]) => ({
  id: Number(id),
  ...v,
}));

const GROUP_OPTIONS = [
  { value: "time", label: "Time (Hour)" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

const BN_MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const PRESETS = [
  "Custom", "Today", "Yesterday", "Last 7 days",
  "Last 30 days", "Last 90 days", "This month", "This year",
];

const PAGE_LIMIT = 10;

// ======================================================================
// Helpers
// ======================================================================
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatHour = (hour) => {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
};

// short = chart axis er jonno chhoto label
const formatLabel = (groupBy, label, short = false) => {
  if (!label) return "";
  if (groupBy === "time") return formatHour(parseInt(label.slice(0, 2), 10));
  if (groupBy === "month") {
    const [y, m] = label.split("-");
    const name = BN_MONTHS[parseInt(m, 10) - 1] || m;
    return short ? `${name.slice(0, 3)} ${y.slice(2)}` : `${name} ${y}`;
  }
  // day / week => YYYY-MM-DD
  if (short) {
    const [, m, d] = label.split("-");
    return `${d}/${m}`;
  }
  return label;
};

// DB datetime UTC hishebe ashe, tai UTC te format korle DB er original somoy dekhabe
const formatDateTime = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const useDebounce = (value, delay = 500) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const baseChart = { toolbar: { show: false }, fontFamily: "inherit" };
const axisLabelStyle = { style: { colors: "#6b7280", fontSize: "12px" } };

// ======================================================================
// Small UI pieces
// ======================================================================
const EmptyBox = ({ text, height = "h-64" }) => (
  <div className={`flex items-center justify-center ${height} text-gray-400 text-sm`}>
    {text}
  </div>
);

const TypeBadge = ({ type, name }) => {
  const t = LOGIN_TYPES[type];
  const color = t?.color || "#6b7280";
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {name || t?.name || `Type ${type}`}
    </span>
  );
};

const SummaryCards = ({ items, loading }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
    {items.map((c) => (
      <div
        key={c.label}
        className={`${c.bg} rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5`}
      >
        <p className="text-white/80 text-xs font-medium mb-2">{c.label}</p>
        <h3 className="text-3xl font-bold text-white">
          {loading ? "..." : Number(c.value || 0).toLocaleString("en-US")}
        </h3>
      </div>
    ))}
  </div>
);

const Pagination = ({ pagination, onChange, translate }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm text-gray-600">
        {translate("Total")} {total}
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          {translate("Previous")}
        </button>
        <span className="text-sm text-gray-700">
          {translate("Page")} {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          {translate("Next")}
        </button>
      </div>
    </div>
  );
};

// ======================================================================
// Date range picker (dashboard er style)
// ======================================================================
const DateRangePicker = ({ startDate, endDate, onApply, translate }) => {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState("Custom");
  const [tempStart, setTempStart] = useState("");
  const [tempEnd, setTempEnd] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePreset = (p) => {
    setPreset(p);
    const today = new Date();
    let s;
    let e = today;
    switch (p) {
      case "Today":
        s = today;
        break;
      case "Yesterday":
        s = new Date(today);
        s.setDate(today.getDate() - 1);
        e = new Date(s);
        break;
      case "Last 7 days":
        s = new Date(today);
        s.setDate(today.getDate() - 6);
        break;
      case "Last 30 days":
        s = new Date(today);
        s.setDate(today.getDate() - 29);
        break;
      case "Last 90 days":
        s = new Date(today);
        s.setDate(today.getDate() - 89);
        break;
      case "This month":
        s = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "This year":
        s = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    setTempStart(fmtDate(s));
    setTempEnd(fmtDate(e));
  };

  const apply = () => {
    let s = tempStart;
    let e = tempEnd;
    if (s && !e) e = s;
    if (e && !s) s = e;
    if (s && e && s > e) [s, e] = [e, s];
    onApply(s, e);
    setOpen(false);
  };

  const label =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : translate("Last 1 Month");

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setTempStart(startDate);
          setTempEnd(endDate);
          setOpen(!open);
        }}
        className="flex items-center justify-between min-w-[220px] bg-white border border-gray-300 hover:border-gray-400 text-gray-700 py-2 px-3 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="text-gray-500 font-normal mr-2">{translate("Date")}</span>
        {label}
        <svg className="w-4 h-4 ml-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 shadow-2xl rounded-lg z-50 flex flex-col sm:flex-row w-[280px] sm:w-[360px] overflow-hidden">
          <div className="w-full sm:w-[140px] bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 flex flex-col py-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => handlePreset(p)}
                className={`text-left px-4 py-2 text-sm transition-colors ${preset === p
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {translate(p)}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between bg-white">
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="block text-xs text-blue-600 font-semibold mb-1">
                  {translate("Start date")}
                </label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => {
                    setTempStart(e.target.value);
                    setPreset("Custom");
                  }}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-medium mb-1">
                  {translate("End date")}
                </label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => {
                    setTempEnd(e.target.value);
                    setPreset("Custom");
                  }}
                  className="w-full border border-gray-300 rounded-md p-1.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  setTempStart("");
                  setTempEnd("");
                  setPreset("Custom");
                }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                {translate("Reset")}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                {translate("Cancel")}
              </button>
              <button
                onClick={apply}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
              >
                {translate("Apply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ======================================================================
// Charts (ApexCharts)
// ======================================================================

// 1) Trend chart: stacked bar (LoginType wise) ba area (Total vs Unique)
const TrendChart = ({ chart, groupBy, translate }) => {
  const [mode, setMode] = useState("type"); // type | total

  const labels = chart?.labels || [];
  const categories = labels.map((l) => formatLabel(groupBy, l, true));
  const hasData = (chart?.totalLogins || []).some((v) => Number(v) > 0);

  const series =
    mode === "type"
      ? TYPE_ENTRIES.map((t) => ({
        name: translate(t.name),
        data: (chart?.[t.key] || []).map((v) => Number(v) || 0),
      }))
      : [
        {
          name: translate("Total Logins"),
          data: (chart?.totalLogins || []).map((v) => Number(v) || 0),
        },
        {
          name: translate("Unique Users"),
          data: (chart?.uniqueUsers || []).map((v) => Number(v) || 0),
        },
      ];

  const options = {
    chart: {
      ...baseChart,
      type: mode === "type" ? "bar" : "area",
      stacked: mode === "type",
    },
    colors:
      mode === "type" ? TYPE_ENTRIES.map((t) => t.color) : ["#6366f1", "#ec4899"],
    plotOptions: { bar: { columnWidth: "60%", borderRadius: 3 } },
    dataLabels: { enabled: false },
    stroke:
      mode === "type"
        ? { show: false }
        : { curve: "smooth", width: 2 },
    fill:
      mode === "type"
        ? { opacity: 1 }
        : {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.05, stops: [0, 90, 100] },
        },
    xaxis: {
      categories,
      tickAmount: categories.length > 15 ? 15 : undefined,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        ...axisLabelStyle,
        rotate: -45,
        hideOverlappingLabels: true,
      },
    },
    yaxis: {
      labels: { ...axisLabelStyle, formatter: (v) => Math.round(v) },
      min: 0,
    },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 3, yaxis: { lines: { show: true } } },
    legend: { position: "top", fontSize: "12px", labels: { colors: "#6b7280" } },
    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
      x: {
        formatter: (val, opts) =>
          formatLabel(groupBy, labels[opts?.dataPointIndex ?? 0] ?? val),
      },
    },
  };

  return (
    <div>
      <div className="flex justify-end mb-2">
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden text-xs">
          {[
            { v: "type", l: "By Login Type" },
            { v: "total", l: "Total vs Unique" },
          ].map((b) => (
            <button
              key={b.v}
              onClick={() => setMode(b.v)}
              className={`px-3 py-1.5 font-medium ${mode === b.v
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
            >
              {translate(b.l)}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        {hasData ? (
          <ReactApexChart
            key={`${mode}-${groupBy}`}
            options={options}
            series={series}
            type={mode === "type" ? "bar" : "area"}
            height="100%"
            width="100%"
          />
        ) : (
          <EmptyBox text={translate("No Data Found")} height="h-full" />
        )}
      </div>
    </div>
  );
};

// 2) LoginType donut
const LoginTypeDonut = ({ data, translate }) => {
  const items = data || [];
  const series = items.map((i) => Number(i.totalLogins) || 0);
  const total = series.reduce((a, b) => a + b, 0);

  if (!total) return <EmptyBox text={translate("No Data Found")} height="h-64" />;

  const options = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: items.map((i) => translate(i.name)),
    colors: items.map((i) => LOGIN_TYPES[i.loginType]?.color || "#9ca3af"),
    legend: { position: "bottom", fontSize: "12px", labels: { colors: "#6b7280" } },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { show: true, fontSize: "12px" },
            value: { show: true, fontSize: "16px", fontWeight: "bold" },
            total: { show: true, label: translate("Total"), fontSize: "14px", color: "#373d3f" },
          },
        },
      },
    },
    tooltip: { theme: "light" },
  };

  return (
    <div className="h-64">
      <ReactApexChart options={options} series={series} type="donut" height="100%" width="100%" />
    </div>
  );
};

// 3) Top 10 horizontal stacked bar (madrasa / user), click korle onSelect
const TopBarChart = ({ items, labelFn, onSelect, translate }) => {
  const list = items || [];
  const hasData = list.some((i) => Number(i.totalLogins) > 0);

  if (!hasData) return <EmptyBox text={translate("No Data Found")} height="h-64" />;

  const series = TYPE_ENTRIES.map((t) => ({
    name: translate(t.name),
    data: list.map((i) => Number(i[t.key]) || 0),
  }));

  const options = {
    chart: {
      ...baseChart,
      type: "bar",
      stacked: true,
      events: {
        dataPointSelection: (e, ctx, config) => {
          const item = list[config.dataPointIndex];
          if (item && onSelect) onSelect(item);
        },
      },
    },
    colors: TYPE_ENTRIES.map((t) => t.color),
    plotOptions: { bar: { horizontal: true, borderRadius: 3, barHeight: "60%" } },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      categories: list.map(labelFn),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { ...axisLabelStyle, formatter: (v) => Math.round(v) },
    },
    yaxis: { labels: { ...axisLabelStyle, maxWidth: 170 } },
    grid: { borderColor: "#e5e7eb", strokeDashArray: 3, xaxis: { lines: { show: true } } },
    legend: { position: "top", fontSize: "12px", labels: { colors: "#6b7280" } },
    tooltip: { theme: "light", shared: true, intersect: false },
  };

  return (
    <div style={{ height: Math.max(260, list.length * 36 + 70) }}>
      <ReactApexChart options={options} series={series} type="bar" height="100%" width="100%" />
    </div>
  );
};

// ======================================================================
// Main Page
// ======================================================================
const AdminUserLoginHistory = () => {
  const translate = useTranslate();

  // ---------- Filters ----------
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    loginType: "",
    groupBy: "day",
  });
  const [searchInput, setSearchInput] = useState(""); // overview: madrasa search
  const [userIdInput, setUserIdInput] = useState(""); // details: user filter
  const search = useDebounce(searchInput.trim());
  const userId = useDebounce(userIdInput.trim());

  const [overviewPage, setOverviewPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);

  // selected = { institutionCode, instituteName } (view icon click korle)
  const [selected, setSelected] = useState(null);

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setOverviewPage(1);
    setDetailPage(1);
  };

  const commonParams = useMemo(() => {
    const p = { groupBy: filters.groupBy };
    if (filters.startDate && filters.endDate) {
      p.startDate = filters.startDate;
      p.endDate = filters.endDate;
    }
    if (filters.loginType) p.loginType = filters.loginType;
    return p;
  }, [filters]);

  // ---------- Queries ----------
  const overviewQuery = useGetLoginOverviewQuery(
    {
      ...commonParams,
      ...(search ? { search } : {}),
      page: overviewPage,
      limit: PAGE_LIMIT,
    },
    { skip: !!selected }
  );

  const detailsQuery = useGetLoginDetailsQuery(
    {
      institutionCode: selected?.institutionCode,
      ...commonParams,
      ...(userId ? { userId } : {}),
      page: detailPage,
      limit: PAGE_LIMIT,
    },
    { skip: !selected }
  );

  const active = selected ? detailsQuery : overviewQuery;
  const data = active.data;
  const isFetching = active.isFetching;
  const isFirstLoad = active.isLoading;

  const groupBy = data?.groupBy || filters.groupBy;
  const hasFilters =
    filters.startDate ||
    filters.loginType ||
    filters.groupBy !== "day" ||
    searchInput ||
    userIdInput;

  // ---------- Handlers ----------
  const openDetails = (row) => {
    setSelected({
      institutionCode: row.institutionCode,
      instituteName: row.instituteName,
    });
    setDetailPage(1);
    setUserIdInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToOverview = () => {
    setSelected(null);
    setUserIdInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetAll = () => {
    setFilters({ startDate: "", endDate: "", loginType: "", groupBy: "day" });
    setSearchInput("");
    setUserIdInput("");
    setOverviewPage(1);
    setDetailPage(1);
  };

  // ---------- Summary cards ----------
  const s = data?.summary || {};
  const summaryItems = selected
    ? [
      { label: translate("Total Logins"), value: s.totalLogins, bg: "bg-blue-600" },
      { label: translate("Unique Users"), value: s.uniqueUsers, bg: "bg-emerald-500" },
      { label: translate("Desktop App"), value: s.desktop, bg: "bg-indigo-500" },
      { label: translate("Website Dashboard"), value: s.website, bg: "bg-teal-500" },
      { label: translate("Teacher App"), value: s.teacherApp, bg: "bg-amber-500" },
    ]
    : [
      { label: translate("Total Logins"), value: s.totalLogins, bg: "bg-blue-600" },
      { label: translate("Unique Users"), value: s.uniqueUsers, bg: "bg-emerald-500" },
      { label: translate("Total Madrasah"), value: s.totalInstitutions, bg: "bg-purple-500" },
      { label: translate("Desktop App"), value: s.desktop, bg: "bg-indigo-500" },
      { label: translate("Website Dashboard"), value: s.website, bg: "bg-teal-500" },
      { label: translate("Teacher App"), value: s.teacherApp, bg: "bg-amber-500" },
    ];

  // ---------- Titles ----------
  const trendTitleMap = {
    time: "Logins by Hour of Day",
    day: "Daily Login Trend",
    week: "Weekly Login Trend",
    month: "Monthly Login Trend",
  };
  const rangeLabel = data?.range ? `(${data.range.from} ${translate("to")} ${data.range.to})` : "";
  const instituteName = data?.institution?.instituteName || selected?.instituteName;

  // ---------- Table pieces ----------
  const pagination = data?.table?.pagination;
  const list = data?.table?.list || [];
  const serialBase = ((pagination?.page || 1) - 1) * PAGE_LIMIT;

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap";
  const tdClass = "px-4 py-3 text-sm text-gray-700 whitespace-nowrap";

  return (
    <div className="font-default bg-gray-50 min-h-screen pb-10">
      {/* ================= Filter bar ================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6 sticky top-0 z-30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {selected && (
              <button
                onClick={backToOverview}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                {translate("Back")}
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 truncate">
                {selected
                  ? `${instituteName || translate("Madrasah")} (${selected.institutionCode})`
                  : translate("Madrasah Login Information")}
              </h2>
              <p className="text-xs text-gray-500">
                {selected
                  ? translate("Login details of this madrasah")
                  : translate("All madrasah login summary")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onApply={(s, e) => updateFilters({ startDate: s, endDate: e })}
              translate={translate}
            />

            <select
              value={filters.groupBy}
              onChange={(e) => updateFilters({ groupBy: e.target.value })}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-blue-500 py-2 px-3 cursor-pointer"
            >
              {GROUP_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {translate(g.label)}
                </option>
              ))}
            </select>

            <select
              value={filters.loginType}
              onChange={(e) => updateFilters({ loginType: e.target.value })}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-2 focus:ring-blue-500 py-2 px-3 cursor-pointer"
            >
              <option value="">{translate("All Login Types")}</option>
              {TYPE_ENTRIES.map((t) => (
                <option key={t.id} value={t.id}>
                  {translate(t.name)}
                </option>
              ))}
            </select>

            {!selected ? (
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setOverviewPage(1);
                }}
                placeholder={translate("Search by Madrasah Name or Code...")}
                className="border border-gray-300 rounded-md py-2 px-3 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type="text"
                value={userIdInput}
                onChange={(e) => {
                  setUserIdInput(e.target.value);
                  setDetailPage(1);
                }}
                placeholder={translate("Filter by User ID...")}
                className="border border-gray-300 rounded-md py-2 px-3 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {hasFilters && (
              <button
                onClick={resetAll}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {translate("Reset Filter")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= Error ================= */}
      {active.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-start justify-between gap-4">
          <div className="text-sm min-w-0">
            <p className="font-medium">
              {active.error?.data?.error || translate("Failed to load data")}
            </p>
            {active.error?.data?.detail && (
              <p className="mt-1 text-xs text-red-600 break-words">
                {active.error.data.detail}
              </p>
            )}
          </div>
          <button
            onClick={() => active.refetch()}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 flex-shrink-0"
          >
            {translate("Retry")}
          </button>
        </div>
      )}

      <div className={`transition-opacity ${isFetching && !isFirstLoad ? "opacity-60" : "opacity-100"}`}>
        {/* ================= Summary cards ================= */}
        <SummaryCards items={summaryItems} loading={isFirstLoad} />

        {/* ================= Charts ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {translate(trendTitleMap[groupBy] || "Login Trend")}
            </h2>
            <p className="text-xs text-gray-500 mb-3">{rangeLabel}</p>
            {isFirstLoad ? (
              <EmptyBox text={translate("Loading...")} height="h-72" />
            ) : (
              <TrendChart chart={data?.chart} groupBy={groupBy} translate={translate} />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {translate("Login Type Share")}
            </h2>
            <p className="text-xs text-gray-500 mb-3">{rangeLabel}</p>
            {isFirstLoad ? (
              <EmptyBox text={translate("Loading...")} />
            ) : (
              <LoginTypeDonut data={data?.chart?.byLoginType} translate={translate} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {selected ? translate("Top 10 Users") : translate("Top 10 Madrasah")}
            </h2>
            <span className="text-xs text-gray-500">
              {selected
                ? translate("Click a bar to filter by user")
                : translate("Click a bar to view details")}
            </span>
          </div>
          {isFirstLoad ? (
            <EmptyBox text={translate("Loading...")} />
          ) : selected ? (
            <TopBarChart
              items={data?.chart?.topUsers}
              labelFn={(u) => String(u.userId)}
              onSelect={(u) => {
                setUserIdInput(String(u.userId));
                setDetailPage(1);
              }}
              translate={translate}
            />
          ) : (
            <TopBarChart
              items={data?.chart?.topInstitutions}
              labelFn={(i) => i.instituteName || String(i.institutionCode)}
              onSelect={openDetails}
              translate={translate}
            />
          )}
        </div>

        {/* ================= Table ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {selected
                ? groupBy === "time"
                  ? translate("Login List")
                  : translate("Login Summary")
                : translate("Madrasah List")}
            </h2>
            {selected && userId && (
              <span className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {translate("User")}: {userId}
                <button
                  onClick={() => setUserIdInput("")}
                  className="hover:text-blue-900 font-bold"
                  title={translate("Clear")}
                >
                  ×
                </button>
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            {/* ---------- Overview table ---------- */}
            {!selected && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>#</th>
                    <th className={thClass}>{translate("Code")}</th>
                    <th className={thClass}>{translate("Madrasah")}</th>
                    <th className={thClass}>{translate("Total Logins")}</th>
                    <th className={thClass}>{translate("Unique Users")}</th>
                    <th className={thClass}>{translate("Desktop App")}</th>
                    <th className={thClass}>{translate("Website Dashboard")}</th>
                    <th className={thClass}>{translate("Teacher App")}</th>
                    <th className={thClass}>{translate("Last Login")}</th>
                    <th className={`${thClass} text-center`}>{translate("Action")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFirstLoad ? (
                    <tr>
                      <td colSpan={10} className="text-center text-gray-500 py-10 text-sm">
                        {translate("Loading...")}
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center text-gray-500 py-10 text-sm">
                        {translate("No Data Found")}
                      </td>
                    </tr>
                  ) : (
                    list.map((row, idx) => (
                      <tr key={row.institutionCode} className="hover:bg-gray-50">
                        <td className={tdClass}>{serialBase + idx + 1}</td>
                        <td className={tdClass}>{row.institutionCode}</td>
                        <td className={`${tdClass} font-medium text-gray-800`}>
                          {row.instituteName || "—"}
                        </td>
                        <td className={tdClass}>
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {row.totalLogins}
                          </span>
                        </td>
                        <td className={tdClass}>{row.uniqueUsers}</td>
                        <td className={tdClass}>{row.desktop}</td>
                        <td className={tdClass}>{row.website}</td>
                        <td className={tdClass}>{row.teacherApp}</td>
                        <td className={tdClass}>{formatDateTime(row.lastLogin)}</td>
                        <td className={`${tdClass} text-center`}>
                          <button
                            onClick={() => openDetails(row)}
                            title={translate("View Details")}
                            className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* ---------- Details table: raw list (time) ---------- */}
            {selected && groupBy === "time" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>#</th>
                    <th className={thClass}>{translate("User ID")}</th>
                    <th className={thClass}>{translate("Login Type")}</th>
                    <th className={thClass}>{translate("Login Time")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFirstLoad ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-10 text-sm">
                        {translate("Loading...")}
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 py-10 text-sm">
                        {translate("No Data Found")}
                      </td>
                    </tr>
                  ) : (
                    list.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-gray-50">
                        <td className={tdClass}>{serialBase + idx + 1}</td>
                        <td className={`${tdClass} font-medium text-gray-800`}>{row.userId}</td>
                        <td className={tdClass}>
                          <TypeBadge type={row.loginType} name={row.loginTypeName} />
                        </td>
                        <td className={tdClass}>{row.loginTime || formatDateTime(row.loginDateTime)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* ---------- Details table: grouped (day/week/month) ---------- */}
            {selected && groupBy !== "time" && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>#</th>
                    <th className={thClass}>
                      {groupBy === "week"
                        ? translate("Week Start (Monday)")
                        : groupBy === "month"
                          ? translate("Month")
                          : translate("Date")}
                    </th>
                    <th className={thClass}>{translate("Total Logins")}</th>
                    <th className={thClass}>{translate("Unique Users")}</th>
                    <th className={thClass}>{translate("Desktop App")}</th>
                    <th className={thClass}>{translate("Website Dashboard")}</th>
                    <th className={thClass}>{translate("Teacher App")}</th>
                    <th className={thClass}>{translate("First Login")}</th>
                    <th className={thClass}>{translate("Last Login")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isFirstLoad ? (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-500 py-10 text-sm">
                        {translate("Loading...")}
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-gray-500 py-10 text-sm">
                        {translate("No Data Found")}
                      </td>
                    </tr>
                  ) : (
                    list.map((row, idx) => (
                      <tr key={row.period} className="hover:bg-gray-50">
                        <td className={tdClass}>{serialBase + idx + 1}</td>
                        <td className={`${tdClass} font-medium text-gray-800`}>
                          {formatLabel(groupBy, row.period)}
                        </td>
                        <td className={tdClass}>
                          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {row.totalLogins}
                          </span>
                        </td>
                        <td className={tdClass}>{row.uniqueUsers}</td>
                        <td className={tdClass}>{row.desktop}</td>
                        <td className={tdClass}>{row.website}</td>
                        <td className={tdClass}>{row.teacherApp}</td>
                        <td className={tdClass}>{formatDateTime(row.firstLogin)}</td>
                        <td className={tdClass}>{formatDateTime(row.lastLogin)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <Pagination
            pagination={pagination}
            onChange={(p) => (selected ? setDetailPage(p) : setOverviewPage(p))}
            translate={translate}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminUserLoginHistory;