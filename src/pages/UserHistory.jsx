import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useLocation, useSearchParams } from "react-router-dom";

/* =========================================================
   UserHistory — শিক্ষার্থীর সম্পূর্ণ হিস্ট্রি (ডেমো ডাটা)
   - শিক্ষাবর্ষ ড্রপডাউন দিয়ে পুরো পেজ ফিল্টার
   - উপস্থিতি / অনুপস্থিতি সেকশন + চার্ট
   - প্রতিটি সেকশনে লাইন ↔ বার চার্ট অপশন (white background)
========================================================= */

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

const bn = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(v).replace(/\d/g, (x) => d[x]);
};

const taka = (n) => `৳${bn(Number(n || 0).toLocaleString("en-US"))}`;

const sum = (rows, key) => rows.reduce((t, r) => t + (Number(r[key]) || 0), 0);

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

/* ফি জেনারেটর: [গৃহীত, গৃহীত, ...] ১২ মাস */
const mkFee = (session, assigned, received) =>
  received.map((r, i) => ({
    id: `${session}-f${i + 1}`,
    session,
    month: MONTHS[i],
    assigned,
    received: r,
  }));

/* উপস্থিতি জেনারেটর: [কর্মদিবস, উপস্থিত, অনুপস্থিত, ছুটি] */
const mkAtt = (session, rows) =>
  rows.map((d, i) => ({
    id: `${session}-a${i + 1}`,
    session,
    month: MONTHS[i],
    working: d[0],
    present: d[1],
    absent: d[2],
    leave: d[3],
  }));

/* ---------------------------------------------------------
   Demo data — একজন শিক্ষার্থীর
--------------------------------------------------------- */

const DEMO_USER = {
  /* --- পরিচিতি --- */
  name: "মুহাম্মাদ আব্দুল্লাহ আল মামুন",
  role: "শিক্ষার্থী",
  code: "2026-0147",
  dakhila: "100149",
  photo: "",
  status: "সক্রিয়",
  father: "মোঃ আব্দুর রহমান",
  relation1: "পিতা",
  mother: "মোছাঃ রোকেয়া বেগম",
  relation2: "মাতা",
  nid: "১৯৯৪২৬৭৮৯০১২৩",
  birthRegNo: "১৯৯৪২৬৭৮৯০১২৩",
  email: "student@example.com",
  gender: "মহিলা",
  age: "25",
  mobile1: "01999999999",
  mobile2: "01711223344",
  bloodGroup: "B+",
  birthDate: "20/10/2012",

  /* --- ঠিকানা --- */
  division: "ঢাকা",
  district: "ঢাকা",
  thana: "আদাবর",
  postOffice: "দারুসসালাম",
  village: "গোলাপবাগ",

  tempDivision: "ঢাকা",
  tempDistrict: "গাজীপুর",
  tempThana: "সদর",
  tempPostOffice: "চান্দনা চৌরাস্তা",
  tempVillage: "ভবানীপুর",

  /* --- ভর্তি তথ্য --- */
  admissions: [
    { id: 1, class: "হিফজুল কুরআন (প্রথম)", group: "ক গ্রুপ", session: "2026", serial: 14, date: "05/01/2026" },
    { id: 2, class: "নাজেরা (দ্বিতীয়)", group: "ক গ্রুপ", session: "2025", serial: 21, date: "08/01/2025" },
    { id: 3, class: "নাজেরা (প্রথম)", group: "খ গ্রুপ", session: "2024", serial: 33, date: "11/01/2024" },
  ],

  /* --- ফলাফল --- */
  results: [
    { id: 1, exam: "বার্ষিক পরীক্ষা", session: "2026", total: 800, obtained: 736, gpa: "4.88", grade: "A+", position: 2 },
    { id: 2, exam: "অর্ধবার্ষিক পরীক্ষা", session: "2026", total: 800, obtained: 701, gpa: "4.63", grade: "A+", position: 4 },
    { id: 3, exam: "প্রথম সাময়িক", session: "2026", total: 500, obtained: 428, gpa: "4.25", grade: "A", position: 6 },
    { id: 4, exam: "বার্ষিক পরীক্ষা", session: "2025", total: 800, obtained: 712, gpa: "4.75", grade: "A+", position: 3 },
    { id: 5, exam: "অর্ধবার্ষিক পরীক্ষা", session: "2025", total: 800, obtained: 684, gpa: "4.50", grade: "A+", position: 5 },
    { id: 6, exam: "প্রথম সাময়িক", session: "2025", total: 500, obtained: 401, gpa: "4.00", grade: "A", position: 9 },
    { id: 7, exam: "বার্ষিক পরীক্ষা", session: "2024", total: 700, obtained: 588, gpa: "4.25", grade: "A", position: 7 },
    { id: 8, exam: "অর্ধবার্ষিক পরীক্ষা", session: "2024", total: 700, obtained: 546, gpa: "3.90", grade: "A", position: 11 },
  ],

  /* --- মন্তব্য / বার্ষিক প্রতিবেদন / আখলাকী রিপোর্ট --- */
  reports: [
    { id: 1, session: "2026", date: "12/10/2026", type: "আখলাকী", note: "আদব-আখলাক খুবই ভালো, ছোটদের সাথে সদাচরণ করে।" },
    { id: 2, session: "2026", date: "25/08/2026", type: "মন্তব্য", note: "হিফজের পারা পুনরাবৃত্তিতে নিয়মিত, তবে লেখায় মনোযোগ বাড়াতে হবে।" },
    { id: 3, session: "2026", date: "02/05/2026", type: "আখলাকী", note: "নামাজে নিয়মিত উপস্থিত থাকে, উস্তাদদের প্রতি শ্রদ্ধাশীল।" },
    { id: 4, session: "2025", date: "30/12/2025", type: "বার্ষিক প্রতিবেদন", note: "সারা বছর উপস্থিতি সন্তোষজনক। অভিভাবকের সাথে আলোচনা হয়েছে।" },
    { id: 5, session: "2025", date: "14/06/2025", type: "মন্তব্য", note: "পড়া তৈরিতে আগের চেয়ে অনেক উন্নতি করেছে।" },
    { id: 6, session: "2024", date: "28/12/2024", type: "বার্ষিক প্রতিবেদন", note: "নতুন পরিবেশে মানিয়ে নিয়েছে, ফলাফল আশানুরূপ।" },
  ],

  /* --- গেইট পাস ও ছুটি --- */
  leaves: [
    { id: 1, session: "2026", from: "14/09/2026", to: "18/09/2026", days: 5, type: "ছুটি", reason: "পারিবারিক অনুষ্ঠান — নানার বাড়ি গমন", status: "অনুমোদিত" },
    { id: 2, session: "2026", from: "02/07/2026", to: "02/07/2026", days: 1, type: "গেইট পাস", reason: "ডাক্তার দেখানোর জন্য বাইরে যাওয়া", status: "অনুমোদিত" },
    { id: 3, session: "2026", from: "11/03/2026", to: "20/03/2026", days: 10, type: "ছুটি", reason: "রমাদান উপলক্ষে বাড়িতে অবস্থান", status: "অনুমোদিত" },
    { id: 4, session: "2026", from: "05/02/2026", to: "06/02/2026", days: 2, type: "ছুটি", reason: "অসুস্থতা", status: "বাতিল" },
    { id: 5, session: "2025", from: "08/08/2025", to: "12/08/2025", days: 5, type: "ছুটি", reason: "বড় ভাইয়ের বিবাহ অনুষ্ঠান", status: "অনুমোদিত" },
    { id: 6, session: "2025", from: "19/04/2025", to: "19/04/2025", days: 1, type: "গেইট পাস", reason: "প্রয়োজনীয় কিতাব ক্রয়", status: "অনুমোদিত" },
    { id: 7, session: "2024", from: "03/10/2024", to: "06/10/2024", days: 4, type: "ছুটি", reason: "পারিবারিক প্রয়োজন", status: "অনুমোদিত" },
  ],

  /* --- মাসিক ফি --- */
  monthlyFees: [
    ...mkFee("2026", 1500, [1500, 1500, 1500, 1000, 1500, 1500, 1500, 0, 1500, 1500, 0, 0]),
    ...mkFee("2025", 1300, [1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1300, 1000, 1300]),
    ...mkFee("2024", 1200, [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200]),
  ],

  /* --- খাবার ফি --- */
  mealFees: [
    ...mkFee("2026", 3000, [3000, 3000, 2500, 3000, 3000, 3000, 3000, 1500, 3000, 3000, 0, 0]),
    ...mkFee("2025", 2600, [2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2600, 2000]),
    ...mkFee("2024", 2400, [2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400, 2400]),
  ],

  /* --- অন্যান্য ফি --- */
  otherFees: [
    { id: 1, head: "ভর্তি ফি", session: "2026", assigned: 5000, received: 5000, date: "05/01/2026" },
    { id: 2, head: "পরীক্ষার ফি (বার্ষিক)", session: "2026", assigned: 800, received: 800, date: "18/10/2026" },
    { id: 3, head: "কিতাব ও খাতা", session: "2026", assigned: 2200, received: 1200, date: "12/01/2026" },
    { id: 4, head: "বিদ্যুৎ ও সার্ভিস চার্জ", session: "2026", assigned: 1200, received: 0, date: "—" },
    { id: 5, head: "ভর্তি ফি", session: "2025", assigned: 4500, received: 4500, date: "08/01/2025" },
    { id: 6, head: "পরীক্ষার ফি (বার্ষিক)", session: "2025", assigned: 700, received: 700, date: "20/10/2025" },
    { id: 7, head: "কিতাব ও খাতা", session: "2025", assigned: 1900, received: 1900, date: "15/01/2025" },
    { id: 8, head: "ভর্তি ফি", session: "2024", assigned: 4000, received: 4000, date: "11/01/2024" },
    { id: 9, head: "কিতাব ও খাতা", session: "2024", assigned: 1700, received: 1500, date: "18/01/2024" },
  ],

  /* --- উপস্থিতি / অনুপস্থিতি --- */
  attendance: [
    ...mkAtt("2026", [
      [24, 23, 1, 0], [23, 21, 1, 1], [22, 18, 1, 3], [25, 24, 1, 0],
      [24, 22, 2, 0], [23, 21, 1, 1], [25, 25, 0, 0], [24, 22, 2, 0],
      [22, 17, 0, 5], [25, 24, 1, 0], [24, 23, 1, 0], [20, 19, 1, 0],
    ]),
    ...mkAtt("2025", [
      [25, 24, 1, 0], [23, 22, 1, 0], [24, 23, 1, 0], [24, 22, 1, 1],
      [25, 24, 1, 0], [23, 21, 2, 0], [24, 23, 1, 0], [25, 19, 1, 5],
      [23, 22, 1, 0], [24, 23, 1, 0], [25, 24, 1, 0], [21, 20, 1, 0],
    ]),
    ...mkAtt("2024", [
      [24, 22, 2, 0], [23, 21, 2, 0], [25, 23, 2, 0], [24, 22, 2, 0],
      [24, 23, 1, 0], [23, 21, 2, 0], [25, 24, 1, 0], [24, 22, 2, 0],
      [23, 21, 2, 0], [25, 20, 1, 4], [24, 23, 1, 0], [20, 18, 2, 0],
    ]),
  ],
};

/* ---------------------------------------------------------
   Icons (self-contained)
--------------------------------------------------------- */

const Icon = ({ name, className = "w-4 h-4" }) => {
  const paths = {
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15h6M9 11h6" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>,
    note: <><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    wallet: <><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" /><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M21 11h-4a2 2 0 1 0 0 4h4z" /></>,
    food: <><path d="M3 2v7a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2M6 2v10M6 12v10" /><path d="M18 2c-2 1-3 3-3 6s1 4 3 4v10" /></>,
    tag: <><path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    print: <><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    drop: <><path d="M12 2.7 6.3 9.4a8 8 0 1 0 11.4 0z" /></>,
    cake: <><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M2 21h20M12 11V7M8 11V8M16 11V8" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 6v12" /></>,
    bars: <><rect x="4" y="11" width="4" height="9" rx="1" /><rect x="10" y="6" width="4" height="14" rx="1" /><rect x="16" y="14" width="4" height="6" rx="1" /></>,
    line: <><path d="M3 17l5-6 4 3 5-7 4 4" /><circle cx="8" cy="11" r="1.2" /><circle cx="12" cy="14" r="1.2" /><circle cx="17" cy="7" r="1.2" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    close: <><path d="M18 6 6 18M6 6l12 12" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    filter: <><path d="M3 5h18l-7 8v6l-4 2v-8z" /></>,
    reset: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] || paths.user}
    </svg>
  );
};

/* ---------------------------------------------------------
   Chart (নিজস্ব SVG — কোনো লাইব্রেরি লাগে না, সাদা ব্যাকগ্রাউন্ড)
--------------------------------------------------------- */

const CHART_COLORS = ["#6D3BEF", "#22B8F0", "#10B981", "#F59E0B", "#F43F5E"];

/* চার্ট বক্স — ApexCharts (ড্যাশবোর্ডের "নতুন মাদ্রাসা" চার্টের মতো)
   লাইন (area) ↔ বার — দুইটার অপশন */
function ChartBox({ categories = [], series = [], defaultType = "bar", height = 260, note }) {
  const [type, setType] = useState(defaultType);
  const [zoomKey, setZoomKey] = useState(0);
  const isArea = type === "line";

  const list = (series || []).filter((s) => s && Array.isArray(s.data));
  const colors = list.map((s, i) => s.color || CHART_COLORS[i % CHART_COLORS.length]);

  const OPTS = [
    { key: "line", label: "লাইন চার্ট", icon: "line" },
    { key: "bar", label: "বার চার্ট", icon: "bars" },
  ];

  const options = {
    chart: {
      type: isArea ? "area" : "bar",
      toolbar: { show: false },
      /* 🖱️ মাউসের চাকা ঘুরিয়ে জুম ইন / আউট (ড্যাশবোর্ডের চার্টের মতো),
         ড্র্যাগ করে নির্দিষ্ট অংশ সিলেক্ট করেও জুম করা যাবে */
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
        allowMouseWheelZoom: true,
      },
      fontFamily: "inherit",
      animations: { enabled: true, easing: "easeinout", speed: 400 },
      parentHeightOffset: 0,
    },
    colors,
    fill: isArea
      ? {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0, stops: [0, 90, 100] },
        }
      : { type: "solid", opacity: 1 },
    dataLabels: { enabled: false },
    stroke: isArea ? { curve: "smooth", width: 2.5 } : { show: true, width: 0, colors: ["transparent"] },
    markers: { size: 0, strokeWidth: 2, hover: { size: 5 } },
    plotOptions: {
      bar: {
        borderRadius: 4,
        borderRadiusApplication: "end",
        columnWidth: list.length > 1 ? "70%" : "45%",
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: "#6b7280", fontSize: "12px" },
        rotate: -35,
        rotateAlways: false,
        hideOverlappingLabels: true,
        trim: true,
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7280", fontSize: "12px" },
        formatter: (v) => bn(Math.round(Number(v) || 0)),
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 3,
      yaxis: { lines: { show: true } },
      padding: { left: 6, right: 6, top: 0, bottom: 0 },
    },
    tooltip: {
      theme: "light",
      shared: list.length > 1,
      intersect: false,
      y: { formatter: (v) => bn(Number(v) || 0) },
    },
    legend: {
      show: list.length > 1,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      labels: { colors: "#6b7280" },
      markers: { radius: 12 },
      itemMargin: { horizontal: 8, vertical: 2 },
    },
    noData: {
      text: "চার্টের জন্য কোনো তথ্য নেই",
      style: { color: "#94a3b8", fontSize: "13px" },
    },
  };

  const apexSeries = list.map((s) => ({ name: s.name, data: s.data.map((v) => Number(v) || 0) }));

  return (
    <div className="px-4 pt-3 pb-2 bg-white border-b border-slate-100">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <span className="text-[12px] font-bold text-slate-500">{note}</span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {OPTS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setType(o.key)}
              className={`h-[28px] px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                type === o.key
                  ? "bg-white text-[#6D3BEF] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon name={o.icon} className="w-[13px] h-[13px]" />
              {o.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setZoomKey((k) => k + 1)}
            title="জুম রিসেট করুন"
            className="h-[28px] px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 text-slate-500 transition hover:bg-white hover:text-[#6D3BEF]"
          >
            <Icon name="reset" className="w-[13px] h-[13px]" />
            রিসেট
          </button>
        </div>
      </div>

      <div className="w-full" style={{ minHeight: height }}>
        <ReactApexChart
          key={`${type}-${zoomKey}`}
          options={options}
          series={apexSeries}
          type={isArea ? "area" : "bar"}
          height={height}
          width="100%"
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   UI bits
--------------------------------------------------------- */

const ACCENTS = {
  violet: { bar: "bg-[#6D3BEF]", soft: "bg-violet-50 text-violet-700 border-violet-100", icon: "bg-violet-50 text-[#6D3BEF]" },
  cyan: { bar: "bg-[#22B8F0]", soft: "bg-sky-50 text-sky-700 border-sky-100", icon: "bg-sky-50 text-[#0EA5E9]" },
  emerald: { bar: "bg-emerald-500", soft: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "bg-emerald-50 text-emerald-600" },
  amber: { bar: "bg-amber-500", soft: "bg-amber-50 text-amber-700 border-amber-100", icon: "bg-amber-50 text-amber-600" },
  rose: { bar: "bg-rose-500", soft: "bg-rose-50 text-rose-700 border-rose-100", icon: "bg-rose-50 text-rose-600" },
};

function Card({ title, icon = "file", accent = "violet", badge, chart, children, className = "" }) {
  const ac = ACCENTS[accent] || ACCENTS.violet;
  const [showChart, setShowChart] = useState(false);
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <header className="px-4 py-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex items-center gap-2.5 flex-wrap">
        <span className={`w-1 h-6 rounded-full shrink-0 ${ac.bar}`} />
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ac.icon}`}>
          <Icon name={icon} className="w-[17px] h-[17px]" />
        </span>
        <h2 className="text-[15px] font-bold text-slate-800 leading-snug">{title}</h2>

        <div className="ml-auto flex items-center gap-2">
          {chart && (
            <button
              type="button"
              onClick={() => setShowChart((v) => !v)}
              className={`h-[28px] flex items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold transition ${
                showChart
                  ? "bg-[#6D3BEF] text-white border-[#6D3BEF]"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#6D3BEF]/40 hover:text-[#6D3BEF]"
              }`}
            >
              <Icon name="chart" className="w-[13px] h-[13px]" />
              {showChart ? "চার্ট বন্ধ" : "চার্ট দেখুন"}
            </button>
          )}
          {badge !== undefined && badge !== null && (
            <span className={`shrink-0 h-[28px] flex items-center rounded-full border px-3 text-xs font-bold whitespace-nowrap ${ac.soft}`}>
              {badge}
            </span>
          )}
        </div>
      </header>
      {chart && showChart && chart}
      {children}
    </section>
  );
}

function Table({ columns, rows, empty = "কোনো তথ্য পাওয়া যায়নি", footer, maxHeight = "max-h-[340px]", minWidth = "min-w-[520px]" }) {
  return (
    <div className={`overflow-auto ${maxHeight}`}>
      <table className={`w-full ${minWidth} text-sm`}>
        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold text-slate-500 tracking-wide shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-2.5 whitespace-nowrap ${c.align === "right" ? "text-right" : "text-left"} ${c.thClass || ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-slate-400 italic py-10 text-sm">{empty}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-3 ${c.align === "right" ? "text-right" : "text-left"} ${c.tdClass || "text-slate-700"}`}>
                    {c.render ? c.render(row, i) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
        {footer && rows.length > 0 && (
          <tfoot className="sticky bottom-0 bg-slate-50 border-t border-slate-200">
            {footer}
          </tfoot>
        )}
      </table>
    </div>
  );
}

/* 👇 InfoRow — লেখা কাটা যাবে না, লাইন ব্রেক হয়ে পুরোটা শো করবে */
function InfoRow({ icon, label, value, valueClass = "text-slate-800" }) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-slate-100 last:border-0 min-w-0">
      {icon && <span className="mt-0.5 text-slate-400 shrink-0"><Icon name={icon} className="w-4 h-4" /></span>}
      <span className="mt-0.5 text-[12px] font-medium text-slate-500 w-[65px] shrink-0">{label}</span>
      <span className={`flex-1 min-w-0 text-[13px] font-bold bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-sm break-words whitespace-normal leading-snug ${valueClass}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function StatCard({ label, value, hint, accent = "violet", icon = "wallet" }) {
  const ac = ACCENTS[accent] || ACCENTS.violet;
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center gap-3">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${ac.icon}`}>
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-slate-500 leading-tight">{label}</p>
        <p className="text-lg font-bold text-slate-800 leading-tight mt-0.5">{value}</p>
        {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent = "violet" }) {
  const ac = ACCENTS[accent] || ACCENTS.violet;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500 leading-tight">{label}</p>
      <p className={`text-[16px] font-extrabold leading-tight mt-0.5 ${ac.bar.replace("bg-", "text-")}`}>{value}</p>
    </div>
  );
}

function HeaderChip({ label, value }) {
  return (
    <div className="h-[36px] flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 whitespace-nowrap">
      <span className="text-[12px] font-medium text-slate-500">{label}</span>
      <span className="text-[13px] font-bold text-slate-800">{value}</span>
    </div>
  );
}

function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    cyan: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FeeTable({ rows, showSession }) {
  const totalAssigned = sum(rows, "assigned");
  const totalReceived = sum(rows, "received");
  const totalDue = Math.max(totalAssigned - totalReceived, 0);

  const columns = [
    { key: "month", label: "মাসের নাম", tdClass: "font-medium text-slate-800 whitespace-nowrap" },
    ...(showSession
      ? [{ key: "session", label: "শিক্ষাবর্ষ", tdClass: "text-slate-500 whitespace-nowrap", render: (r) => bn(r.session) }]
      : []),
    { key: "assigned", label: "নির্ধারিত", align: "right", render: (r) => bn(r.assigned) },
    { key: "received", label: "গৃহীত", align: "right", render: (r) => bn(r.received) },
    {
      key: "due",
      label: "বকেয়া",
      align: "right",
      render: (r) => {
        const due = Math.max((Number(r.assigned) || 0) - (Number(r.received) || 0), 0);
        return due > 0
          ? <span className="font-bold text-rose-600">{bn(due)}</span>
          : <span className="font-bold text-emerald-600">০</span>;
      },
    },
  ];

  return (
    <Table
      minWidth="min-w-[420px]"
      maxHeight="max-h-[360px]"
      columns={columns}
      rows={rows}
      empty="এই শিক্ষাবর্ষে কোনো ফি নির্ধারণ করা হয়নি"
      footer={
        <tr className="text-[13px] font-bold text-slate-700">
          <td className="px-3 py-2.5" colSpan={showSession ? 2 : 1}>সর্বমোট</td>
          <td className="px-3 py-2.5 text-right">{bn(totalAssigned)}</td>
          <td className="px-3 py-2.5 text-right text-emerald-600">{bn(totalReceived)}</td>
          <td className="px-3 py-2.5 text-right text-rose-600">{bn(totalDue)}</td>
        </tr>
      }
    />
  );
}

/* মাস অনুযায়ী ফি একত্র করা (সব শিক্ষাবর্ষ সিলেক্ট থাকলে চার্টে) */
const groupByMonth = (rows) => {
  const map = new Map();
  MONTHS.forEach((m) => map.set(m, { month: m, assigned: 0, received: 0 }));
  rows.forEach((r) => {
    const o = map.get(r.month);
    if (o) {
      o.assigned += Number(r.assigned) || 0;
      o.received += Number(r.received) || 0;
    }
  });
  return Array.from(map.values());
};

/* ---------------------------------------------------------
   Main page
--------------------------------------------------------- */

export default function UserHistory() {
  const user = DEMO_USER;

  /* ---- ইউজার কোড (কুইক অ্যাকশন / URL থেকে) ---- */
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const userCode = searchParams.get("code") || location.state?.userCode || "";
  const userID = location.state?.userID ?? null;

  useEffect(() => {
    if (!userCode) return;
    // TODO: এখানে backend call — userCode / userID দিয়ে ইউজারের ডাটা আনো
    // যেমন: trigger({ code: userCode }) বা useGetUserHistoryQuery(userCode)
  }, [userCode, userID]);

  const TABS = [
    { key: "all", label: "সব তথ্য" },
    { key: "academic", label: "একাডেমিক" },
    { key: "attendance", label: "উপস্থিতি" },
    { key: "fee", label: "ফি ও আদায়" },
    { key: "leave", label: "ছুটি ও মন্তব্য" },
  ];
  const [tab, setTab] = useState("all");
  const show = (group) => tab === "all" || tab === group;

  /* ---- শিক্ষাবর্ষ ফিল্টার ---- */
  const [session, setSession] = useState("all");
  const isAll = session === "all";

  const SESSIONS = useMemo(() => {
    const s = new Set();
    [
      user.admissions, user.results, user.reports, user.leaves,
      user.monthlyFees, user.mealFees, user.otherFees, user.attendance,
    ].forEach((arr) => arr.forEach((r) => r.session && s.add(String(r.session))));
    return Array.from(s).sort((a, b) => Number(b) - Number(a));
  }, [user]);

  const F = useMemo(
    () => (arr) => (isAll ? arr : arr.filter((r) => String(r.session) === session)),
    [isAll, session]
  );

  const admissions = F(user.admissions);
  const results = F(user.results);
  const reports = F(user.reports);
  const leaves = F(user.leaves);
  const monthlyFees = F(user.monthlyFees);
  const mealFees = F(user.mealFees);
  const otherFees = F(user.otherFees);
  const attendance = F(user.attendance);

  /* ---- সারসংক্ষেপ হিসাব ---- */
  const totals = useMemo(() => {
    const groups = [monthlyFees, mealFees, otherFees];
    const assigned = groups.reduce((t, g) => t + sum(g, "assigned"), 0);
    const received = groups.reduce((t, g) => t + sum(g, "received"), 0);
    const due = Math.max(assigned - received, 0);
    const leaveDays = leaves
      .filter((l) => l.status !== "বাতিল")
      .reduce((t, l) => t + (Number(l.days) || 0), 0);
    return { assigned, received, due, leaveDays };
  }, [monthlyFees, mealFees, otherFees, leaves]);

  /* ---- উপস্থিতির হিসাব ---- */
  const att = useMemo(() => {
    const working = sum(attendance, "working");
    const present = sum(attendance, "present");
    const absent = sum(attendance, "absent");
    const rate = working ? Math.round((present / working) * 100) : 0;
    return { working, present, absent, rate };
  }, [attendance]);

  /* ---- চার্ট ডাটা ---- */
  const monthlyChart = useMemo(() => groupByMonth(monthlyFees), [monthlyFees]);
  const mealChart = useMemo(() => groupByMonth(mealFees), [mealFees]);
  const attChart = useMemo(() => {
    const map = new Map();
    MONTHS.forEach((m) => map.set(m, { month: m, present: 0, absent: 0 }));
    attendance.forEach((r) => {
      const o = map.get(r.month);
      if (o) {
        o.present += Number(r.present) || 0;
        o.absent += Number(r.absent) || 0;
      }
    });
    return Array.from(map.values());
  }, [attendance]);

  const reportChart = useMemo(() => {
    const map = new Map();
    reports.forEach((r) => map.set(r.type, (map.get(r.type) || 0) + 1));
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  }, [reports]);

  const initial = (user.name || "?").trim().charAt(0);
  const isActive = user.status === "সক্রিয়";
  const activeSessionLabel = isAll ? "সব শিক্ষাবর্ষ" : bn(session);

  return (
    <div
      className="w-full overflow-x-hidden p-4 sm:p-6 bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
    >
      <div className="w-full mx-auto max-w-[1500px]">
        

        {/* ============================================================
            ইউজার ইনফরমেশন
        ============================================================ */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">

          <div className="px-6 py-6 flex flex-col lg:flex-row lg:items-start gap-8">
            <div className="flex flex-col items-center text-center shrink-0 lg:w-64">

              <div className="w-52 h-52 rounded-3xl border border-slate-200 shadow-md overflow-hidden bg-gradient-to-br from-[#6D3BEF] to-[#22B8F0] flex items-center justify-center">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl font-bold text-white">{initial}</span>
                )}
              </div>

              <h2 className="mt-4 text-[18px] font-extrabold text-[#6D3BEF] bg-violet-50 px-4 py-1.5 rounded-xl border border-violet-100 shadow-sm leading-snug">
                {user.name}
              </h2>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap justify-center">
                <Pill tone="violet">{user.role}</Pill>
                <Pill tone={isActive ? "emerald" : "rose"}>{user.status}</Pill>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-[36px] flex items-center gap-1.5 rounded-full border border-[#6D3BEF]/30 bg-violet-50 px-3.5 text-[13px] font-bold text-[#6D3BEF] transition hover:bg-violet-100 active:scale-95"
                >
                  <Icon name="print" className="w-[15px] h-[15px]" />
                  প্রিন্ট
                </button>
              </div>
              {/* বাটনগুলো */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <HeaderChip label="আইডি" value={bn(user.code)} />
                <HeaderChip label="শিক্ষাবর্ষ" value={activeSessionLabel} />
              </div>
            </div>

            {/* ব্যক্তিগত তথ্য ও ঠিকানা - ৩ কলামে */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 lg:mt-4">

              {/* কলাম ১ */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 space-y-1">
                <InfoRow icon="file" label="দাখেলা" value={bn(userCode || user.dakhila)} />
                <InfoRow icon="user" label="পিতা" value={user.father} />
                <InfoRow icon="user" label="সম্পর্ক ১" value={user.relation1} />
                <InfoRow icon="user" label="মাতা" value={user.mother} />
                <InfoRow icon="user" label="সম্পর্ক ২" value={user.relation2} />
                <InfoRow icon="phone" label="মোবাইল-১" value={bn(user.mobile1)} />
                <InfoRow icon="phone" label="মোবাইল-২" value={bn(user.mobile2)} />
              </div>

              {/* কলাম ২ */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 space-y-1">
                <InfoRow icon="file" label="NID" value={bn(user.nid)} />
                <InfoRow icon="file" label="জন্ম নিবন্ধন" value={bn(user.birthRegNo)} />
                <InfoRow icon="mail" label="ইমেইল" value={user.email} />
                <InfoRow icon="user" label="জেন্ডার" value={user.gender} />
                <InfoRow icon="user" label="বয়স" value={bn(user.age)} />
                <InfoRow icon="drop" label="রক্তের গ্রুপ" value={user.bloodGroup} valueClass="text-rose-600" />
                <InfoRow icon="cake" label="জন্ম তারিখ" value={bn(user.birthDate)} />
              </div>

              {/* কলাম ৩ (স্থায়ী এবং অস্থায়ী ঠিকানা) */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 space-y-4">

                {/* স্থায়ী ঠিকানা */}
                <div>
                  <div className="pb-1 border-b border-slate-200 flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6D3BEF]"></div>
                    <span className="text-[12px] font-bold text-[#6D3BEF]">স্থায়ী ঠিকানা</span>
                  </div>
                  <div className="space-y-1">
                    <InfoRow icon="pin" label="গ্রাম" value={user.village} />
                    <InfoRow icon="pin" label="ডাকঘর" value={user.postOffice} />
                    <InfoRow icon="pin" label="থানা" value={user.thana} />
                    <InfoRow icon="pin" label="জেলা" value={user.district} />
                  </div>
                </div>

                {/* অস্থায়ী ঠিকানা */}
                <div>
                  <div className="pb-1 border-b border-slate-200 flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6D3BEF]"></div>
                    <span className="text-[12px] font-bold text-[#6D3BEF]">অস্থায়ী ঠিকানা</span>
                  </div>
                  <div className="space-y-1">
                    <InfoRow icon="pin" label="গ্রাম" value={user.tempVillage} />
                    <InfoRow icon="pin" label="ডাকঘর" value={user.tempPostOffice} />
                    <InfoRow icon="pin" label="থানা" value={user.tempThana} />
                    <InfoRow icon="pin" label="জেলা" value={user.tempDistrict} />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ============================================================
            শিক্ষাবর্ষ ফিল্টার + সারসংক্ষেপ কার্ড
        ============================================================ */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[280px_1fr_1fr] gap-4 mb-4">

          {/* শিক্ষাবর্ষ ড্রপডাউন */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
            <label className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 mb-2">
              <Icon name="filter" className="w-[14px] h-[14px] text-[#6D3BEF]" />
              শিক্ষাবর্ষ নির্বাচন
            </label>
            <div className="relative">
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full h-[42px] appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-[14px] font-bold text-slate-800 outline-none transition focus:border-[#6D3BEF] focus:bg-white focus:ring-2 focus:ring-[#6D3BEF]/15"
              >
                <option value="all">সব শিক্ষাবর্ষ</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>{bn(s)} শিক্ষাবর্ষ</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {isAll
                ? "সব শিক্ষাবর্ষের সম্পূর্ণ তথ্য দেখানো হচ্ছে"
                : `শুধুমাত্র ${bn(session)} শিক্ষাবর্ষের তথ্য দেখানো হচ্ছে`}
            </p>
          </div>

          <StatCard label="মোট গৃহীত ফি" value={taka(totals.received)} accent="emerald" icon="wallet"
            hint={isAll ? "সব শিক্ষাবর্ষ মিলিয়ে" : `${bn(session)} শিক্ষাবর্ষ`} />
          <StatCard label="মোট বকেয়া" value={taka(totals.due)} accent="rose" icon="tag"
            hint={totals.due > 0 ? "আদায় বাকি আছে" : "সব পরিশোধিত"} />
        </section>

        {/* ============================================================
            ট্যাব
        ============================================================ */}
        <nav className="flex items-center gap-2 flex-wrap mb-4">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`h-[36px] px-4 rounded-xl text-sm font-bold border transition ${
                tab === t.key
                  ? "bg-gradient-to-r from-[#6D3BEF] to-[#22B8F0] text-white border-transparent shadow-sm shadow-[#6D3BEF]/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#6D3BEF]/40 hover:text-[#6D3BEF]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ============================================================
            মূল কন্টেন্ট (ফুল উইডথ)
        ============================================================ */}
        <div className="w-full space-y-4">
          <main className="w-full space-y-4">

            {/* ভর্তি তথ্য */}
            {show("academic") && (
              <Card
                title="ভর্তি তথ্য"
                icon="file"
                accent="violet"
                badge={`${bn(admissions.length)} টি`}
                chart={
                  <ChartBox
                    note="শিক্ষাবর্ষ অনুযায়ী ভর্তি সিরিয়াল"
                    defaultType="bar"
                    height={230}
                    categories={admissions.map((a) => bn(a.session))}
                    series={[{ name: "ভর্তি সিরিয়াল", data: admissions.map((a) => a.serial), color: "#6D3BEF" }]}
                  />
                }
              >
                <Table
                  minWidth="min-w-[560px]"
                  columns={[
                    { key: "sl", label: "ক্র:", thClass: "w-12", tdClass: "text-slate-400", render: (_r, i) => bn(i + 1) },
                    { key: "class", label: "ক্লাস / জামাত", tdClass: "font-semibold text-slate-800 whitespace-nowrap" },
                    { key: "group", label: "ক্লাস গ্রুপ", tdClass: "whitespace-nowrap" },
                    { key: "session", label: "শিক্ষাবর্ষ", render: (r) => bn(r.session) },
                    { key: "serial", label: "ভর্তি সিরিয়াল", render: (r) => bn(r.serial) },
                    { key: "date", label: "ভর্তির তারিখ", render: (r) => bn(r.date) },
                  ]}
                  rows={admissions}
                  empty="ভর্তির কোনো তথ্য নেই"
                />
              </Card>
            )}

            {/* ফলাফল */}
            {show("academic") && (
              <Card
                title="ফলাফল"
                icon="award"
                accent="cyan"
                badge={`${bn(results.length)} টি পরীক্ষা`}
                chart={
                  <ChartBox
                    note="পরীক্ষা অনুযায়ী প্রাপ্ত নম্বর ও পূর্ণমান"
                    defaultType="line"
                    height={260}
                    categories={results.map((r) => `${r.exam} (${bn(r.session)})`)}
                    series={[
                      { name: "প্রাপ্ত নম্বর", data: results.map((r) => r.obtained), color: "#22B8F0" },
                      { name: "পূর্ণমান", data: results.map((r) => r.total), color: "#CBD5E1" },
                    ]}
                  />
                }
              >
                <Table
                  minWidth="min-w-[640px]"
                  columns={[
                    { key: "sl", label: "ক্র:", thClass: "w-12", tdClass: "text-slate-400", render: (_r, i) => bn(i + 1) },
                    { key: "exam", label: "পরীক্ষার নাম", tdClass: "font-semibold text-slate-800 whitespace-nowrap" },
                    { key: "session", label: "শিক্ষাবর্ষ", render: (r) => bn(r.session) },
                    { key: "total", label: "পূর্ণমান", align: "right", render: (r) => bn(r.total) },
                    { key: "obtained", label: "প্রাপ্ত নম্বর", align: "right", tdClass: "font-bold text-slate-800 text-right", render: (r) => bn(r.obtained) },
                    { key: "gpa", label: "জিপিএ", align: "right", tdClass: "font-bold text-emerald-600 text-right", render: (r) => bn(r.gpa) },
                    {
                      key: "grade", label: "গ্রেড",
                      render: (r) => <Pill tone={r.grade === "A+" ? "emerald" : "cyan"}>{r.grade}</Pill>,
                    },
                    {
                      key: "position", label: "মেধা স্থান", align: "right",
                      render: (r) => <span className="font-bold text-[#6D3BEF]">{bn(r.position)}</span>,
                    },
                  ]}
                  rows={results}
                  empty="কোনো ফলাফল প্রকাশ হয়নি"
                />
              </Card>
            )}

            {/* উপস্থিতি ও অনুপস্থিতি */}
            {show("attendance") && (
              <Card
                title="উপস্থিতি ও অনুপস্থিতি"
                icon="check"
                accent="emerald"
                badge={`উপস্থিতির হার ${bn(att.rate)}%`}
                chart={
                  <ChartBox
                    note="মাস অনুযায়ী উপস্থিত / অনুপস্থিত"
                    defaultType="bar"
                    height={270}
                    categories={attChart.map((r) => r.month)}
                    series={[
                      { name: "উপস্থিত", data: attChart.map((r) => r.present), color: "#10B981" },
                      { name: "অনুপস্থিত", data: attChart.map((r) => r.absent), color: "#F43F5E" },
                    ]}
                  />
                }
              >
                <div className="px-4 pt-4 grid grid-cols-2 lg:grid-cols-3 gap-3">
                  <MiniStat label="মোট কর্মদিবস" value={bn(att.working)} accent="cyan" />
                  <MiniStat label="মোট উপস্থিত" value={bn(att.present)} accent="emerald" />
                  <MiniStat label="মোট অনুপস্থিত" value={bn(att.absent)} accent="rose" />
                </div>

                <div className="px-4 pt-3 pb-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>সার্বিক উপস্থিতির হার</span>
                    <span className="text-emerald-600">{bn(att.rate)}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#22B8F0] transition-all"
                      style={{ width: `${att.rate}%` }} />
                  </div>
                </div>

                <div className="mt-3">
                  <Table
                    minWidth="min-w-[620px]"
                    maxHeight="max-h-[360px]"
                    columns={[
                      { key: "month", label: "মাসের নাম", tdClass: "font-medium text-slate-800 whitespace-nowrap" },
                      ...(isAll
                        ? [{ key: "session", label: "শিক্ষাবর্ষ", tdClass: "text-slate-500", render: (r) => bn(r.session) }]
                        : []),
                      { key: "working", label: "কর্মদিবস", align: "right", render: (r) => bn(r.working) },
                      { key: "present", label: "উপস্থিত", align: "right", tdClass: "text-right font-bold text-emerald-600", render: (r) => bn(r.present) },
                      { key: "absent", label: "অনুপস্থিত", align: "right", tdClass: "text-right font-bold text-rose-600", render: (r) => bn(r.absent) },
                      {
                        key: "rate", label: "উপস্থিতির হার", align: "right",
                        render: (r) => {
                          const p = r.working ? Math.round((r.present / r.working) * 100) : 0;
                          return (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full rounded-full ${p >= 90 ? "bg-emerald-500" : p >= 75 ? "bg-amber-500" : "bg-rose-500"}`}
                                  style={{ width: `${p}%` }} />
                              </div>
                              <span className={`font-bold ${p >= 90 ? "text-emerald-600" : p >= 75 ? "text-amber-600" : "text-rose-600"}`}>
                                {bn(p)}%
                              </span>
                            </div>
                          );
                        },
                      },
                    ]}
                    rows={attendance}
                    empty="উপস্থিতির কোনো রেকর্ড নেই"
                    footer={
                      <tr className="text-[13px] font-bold text-slate-700">
                        <td className="px-3 py-2.5" colSpan={isAll ? 2 : 1}>সর্বমোট</td>
                        <td className="px-3 py-2.5 text-right">{bn(att.working)}</td>
                        <td className="px-3 py-2.5 text-right text-emerald-600">{bn(att.present)}</td>
                        <td className="px-3 py-2.5 text-right text-rose-600">{bn(att.absent)}</td>
                        <td className="px-3 py-2.5 text-right text-[#6D3BEF]">{bn(att.rate)}%</td>
                      </tr>
                    }
                  />
                </div>
              </Card>
            )}

            {/* মন্তব্য + ছুটি — পাশাপাশি */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">

              {show("leave") && (
                <Card
                  title="মন্তব্য / বার্ষিক প্রতিবেদন / আখলাকী রিপোর্ট"
                  icon="note"
                  accent="amber"
                  badge={`${bn(reports.length)} টি`}
                  chart={
                    <ChartBox
                      note="ধরন অনুযায়ী রিপোর্ট সংখ্যা"
                      defaultType="bar"
                      height={230}
                      categories={reportChart.map((r) => r.type)}
                      series={[{ name: "রিপোর্ট", data: reportChart.map((r) => r.count), color: "#F59E0B" }]}
                    />
                  }
                >
                  <Table
                    minWidth="min-w-[460px]"
                    columns={[
                      { key: "date", label: "তারিখ", tdClass: "whitespace-nowrap text-slate-600", render: (r) => bn(r.date) },
                      { key: "type", label: "ধরন", render: (r) => <Pill tone="amber">{r.type}</Pill> },
                      { key: "note", label: "বর্ণনা", tdClass: "text-slate-700 min-w-[220px]" },
                    ]}
                    rows={reports}
                    empty="কোনো মন্তব্য লেখা হয়নি"
                  />
                </Card>
              )}

              {show("leave") && (
                <Card
                  title="গেইট পাস ও ছুটি"
                  icon="calendar"
                  accent="violet"
                  badge={`মোট ${bn(totals.leaveDays)} দিন`}
                  chart={
                    <ChartBox
                      note="তারিখ অনুযায়ী ছুটির দিন"
                      defaultType="bar"
                      height={240}
                      categories={leaves.map((l) => bn(l.from))}
                      series={[{ name: "দিন", data: leaves.map((l) => l.days), color: "#6D3BEF" }]}
                    />
                  }
                >
                  <Table
                    minWidth="min-w-[560px]"
                    columns={[
                      { key: "from", label: "তারিখ হতে", tdClass: "whitespace-nowrap text-slate-600", render: (r) => bn(r.from) },
                      { key: "to", label: "তারিখ পর্যন্ত", tdClass: "whitespace-nowrap text-slate-600", render: (r) => bn(r.to) },
                      { key: "days", label: "দিন", align: "right", tdClass: "text-right font-bold text-slate-800", render: (r) => bn(r.days) },
                      { key: "type", label: "ধরন", render: (r) => <Pill tone={r.type === "ছুটি" ? "violet" : "cyan"}>{r.type}</Pill> },
                      { key: "reason", label: "বিবরণ", tdClass: "text-slate-700 min-w-[200px]" },
                      {
                        key: "status", label: "অবস্থা",
                        render: (r) => <Pill tone={r.status === "অনুমোদিত" ? "emerald" : "rose"}>{r.status}</Pill>,
                      },
                    ]}
                    rows={leaves}
                    empty="কোনো ছুটির রেকর্ড নেই"
                  />
                </Card>
              )}
            </div>

            {/* মাসিক ফি ও খাবার ফি — পাশাপাশি */}
            {show("fee") && (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">
                <Card
                  title="মাসিক ফি"
                  icon="wallet"
                  accent="violet"
                  badge={`বকেয়া ${taka(Math.max(sum(monthlyFees, "assigned") - sum(monthlyFees, "received"), 0))}`}
                  chart={
                    <ChartBox
                      note="মাস অনুযায়ী নির্ধারিত ও গৃহীত"
                      defaultType="line"
                      height={250}
                      categories={monthlyChart.map((r) => r.month)}
                      series={[
                        { name: "নির্ধারিত", data: monthlyChart.map((r) => r.assigned), color: "#CBD5E1" },
                        { name: "গৃহীত", data: monthlyChart.map((r) => r.received), color: "#6D3BEF" },
                      ]}
                    />
                  }
                >
                  <FeeTable rows={monthlyFees} showSession={isAll} />
                </Card>

                <Card
                  title="খাবার ফি"
                  icon="food"
                  accent="cyan"
                  badge={`বকেয়া ${taka(Math.max(sum(mealFees, "assigned") - sum(mealFees, "received"), 0))}`}
                  chart={
                    <ChartBox
                      note="মাস অনুযায়ী নির্ধারিত ও গৃহীত"
                      defaultType="line"
                      height={250}
                      categories={mealChart.map((r) => r.month)}
                      series={[
                        { name: "নির্ধারিত", data: mealChart.map((r) => r.assigned), color: "#CBD5E1" },
                        { name: "গৃহীত", data: mealChart.map((r) => r.received), color: "#22B8F0" },
                      ]}
                    />
                  }
                >
                  <FeeTable rows={mealFees} showSession={isAll} />
                </Card>
              </div>
            )}

            {/* অন্যান্য ফি */}
            {show("fee") && (
              <Card
                title="ভর্তি ফি ও অন্যান্য আদায়"
                icon="tag"
                accent="emerald"
                badge={`${bn(otherFees.length)} টি খাত`}
                chart={
                  <ChartBox
                    note="খাত অনুযায়ী নির্ধারিত ও গৃহীত"
                    defaultType="bar"
                    height={250}
                    categories={otherFees.map((r) => (isAll ? `${r.head} (${bn(r.session)})` : r.head))}
                    series={[
                      { name: "নির্ধারিত", data: otherFees.map((r) => r.assigned), color: "#CBD5E1" },
                      { name: "গৃহীত", data: otherFees.map((r) => r.received), color: "#10B981" },
                    ]}
                  />
                }
              >
                <Table
                  minWidth="min-w-[620px]"
                  columns={[
                    { key: "sl", label: "ক্র:", thClass: "w-12", tdClass: "text-slate-400", render: (_r, i) => bn(i + 1) },
                    { key: "head", label: "খাতের নাম", tdClass: "font-semibold text-slate-800 whitespace-nowrap" },
                    { key: "session", label: "শিক্ষাবর্ষ", render: (r) => bn(r.session) },
                    { key: "assigned", label: "নির্ধারিত", align: "right", render: (r) => bn(r.assigned) },
                    { key: "received", label: "গৃহীত", align: "right", tdClass: "text-right text-emerald-600 font-bold", render: (r) => bn(r.received) },
                    {
                      key: "due", label: "বকেয়া", align: "right",
                      render: (r) => {
                        const due = Math.max((Number(r.assigned) || 0) - (Number(r.received) || 0), 0);
                        return due > 0
                          ? <span className="font-bold text-rose-600">{bn(due)}</span>
                          : <span className="font-bold text-emerald-600">০</span>;
                      },
                    },
                    { key: "date", label: "আদায়ের তারিখ", tdClass: "whitespace-nowrap text-slate-600", render: (r) => bn(r.date) },
                  ]}
                  rows={otherFees}
                  footer={
                    <tr className="text-[13px] font-bold text-slate-700">
                      <td className="px-3 py-2.5" colSpan={3}>সর্বমোট</td>
                      <td className="px-3 py-2.5 text-right">{bn(sum(otherFees, "assigned"))}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-600">{bn(sum(otherFees, "received"))}</td>
                      <td className="px-3 py-2.5 text-right text-rose-600">
                        {bn(Math.max(sum(otherFees, "assigned") - sum(otherFees, "received"), 0))}
                      </td>
                      <td className="px-3 py-2.5" />
                    </tr>
                  }
                  empty="অন্য কোনো ফি নির্ধারণ করা হয়নি"
                />
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
