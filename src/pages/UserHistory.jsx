import { useMemo, useState } from "react";

/* =========================================================
   UserHistory — শিক্ষার্থীর সম্পূর্ণ হিস্ট্রি (ডেমো ডাটা)
   ---------------------------------------------------------
   ⚠️ এখন পুরোটা DEMO_USER অবজেক্ট থেকে রেন্ডার হচ্ছে।
   পরে শুধু DEMO_USER-এর জায়গায় API রেসপন্স বসালেই ডায়নামিক।
   যেমন:
     const { data } = useGetUserHistoryQuery({ AdmissionID });
     const user = data ?? EMPTY_USER;
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

/* ---------------------------------------------------------
   Demo data — একজন শিক্ষার্থীর
--------------------------------------------------------- */

const DEMO_USER = {
  /* --- পরিচিতি --- */
  name: "মুহাম্মাদ আব্দুল্লাহ আল মামুন",
  role: "শিক্ষার্থী",
  code: "2026-0147",
  photo: "",                       // ছবি থাকলে URL, না থাকলে initial দেখাবে
  status: "সক্রিয়",                // "সক্রিয়" | "ইনঅ্যাক্টিভ"
  father: "মোঃ আব্দুর রহমান",
  mother: "মোছাঃ রোকেয়া বেগম",
  nid: "১৯৯৪২৬৭৮৯০১২৩",
  mobile1: "01999999999",
  mobile2: "01711223344",
  bloodGroup: "B+",
  birthDate: "20/10/2012",
  village: "গোলাপবাগ",
  postOffice: "দারুসসালাম",
  thana: "আদাবর",
  district: "ঢাকা",

  /* --- ভর্তি তথ্য --- */
  admissions: [
    { id: 1, class: "হিফজুল কুরআন (প্রথম)", group: "ক গ্রুপ", session: "2026", serial: 14, date: "05/01/2026" },
    { id: 2, class: "নাজেরা (দ্বিতীয়)", group: "ক গ্রুপ", session: "2025", serial: 21, date: "08/01/2025" },
    { id: 3, class: "নাজেরা (প্রথম)", group: "খ গ্রুপ", session: "2024", serial: 33, date: "11/01/2024" },
  ],

  /* --- ফলাফল --- */
  results: [
    { id: 1, exam: "বার্ষিক পরীক্ষা", session: "2025", total: 800, obtained: 712, gpa: "4.75", grade: "A+", position: 3 },
    { id: 2, exam: "অর্ধবার্ষিক পরীক্ষা", session: "2025", total: 800, obtained: 684, gpa: "4.50", grade: "A+", position: 5 },
    { id: 3, exam: "প্রথম সাময়িক", session: "2025", total: 500, obtained: 401, gpa: "4.00", grade: "A", position: 9 },
    { id: 4, exam: "বার্ষিক পরীক্ষা", session: "2024", total: 700, obtained: 588, gpa: "4.25", grade: "A", position: 7 },
  ],

  /* --- মন্তব্য / বার্ষিক প্রতিবেদন / আখলাকী রিপোর্ট --- */
  reports: [
    { id: 1, date: "12/10/2026", type: "আখলাকী", note: "আদব-আখলাক খুবই ভালো, ছোটদের সাথে সদাচরণ করে।" },
    { id: 2, date: "25/08/2026", type: "মন্তব্য", note: "হিফজের পারা পুনরাবৃত্তিতে নিয়মিত, তবে লেখায় মনোযোগ বাড়াতে হবে।" },
    { id: 3, date: "30/12/2025", type: "বার্ষিক প্রতিবেদন", note: "সারা বছর উপস্থিতি সন্তোষজনক। অভিভাবকের সাথে আলোচনা হয়েছে।" },
  ],

  /* --- গেইট পাস ও ছুটি --- */
  leaves: [
    { id: 1, from: "14/09/2026", to: "18/09/2026", days: 5, type: "ছুটি", reason: "পারিবারিক অনুষ্ঠান — নানার বাড়ি গমন", status: "অনুমোদিত" },
    { id: 2, from: "02/07/2026", to: "02/07/2026", days: 1, type: "গেইট পাস", reason: "ডাক্তার দেখানোর জন্য বাইরে যাওয়া", status: "অনুমোদিত" },
    { id: 3, from: "11/03/2026", to: "20/03/2026", days: 10, type: "ছুটি", reason: "রমাদান উপলক্ষে বাড়িতে অবস্থান", status: "অনুমোদিত" },
    { id: 4, from: "05/02/2026", to: "06/02/2026", days: 2, type: "ছুটি", reason: "অসুস্থতা", status: "বাতিল" },
  ],

  /* --- মাসিক ফি --- */
  monthlyFees: [
    { id: 1, month: "জানুয়ারি", assigned: 1500, received: 1500 },
    { id: 2, month: "ফেব্রুয়ারি", assigned: 1500, received: 1500 },
    { id: 3, month: "মার্চ", assigned: 1500, received: 1500 },
    { id: 4, month: "এপ্রিল", assigned: 1500, received: 1000 },
    { id: 5, month: "মে", assigned: 1500, received: 1500 },
    { id: 6, month: "জুন", assigned: 1500, received: 1500 },
    { id: 7, month: "জুলাই", assigned: 1500, received: 1500 },
    { id: 8, month: "আগস্ট", assigned: 1500, received: 0 },
    { id: 9, month: "সেপ্টেম্বর", assigned: 1500, received: 1500 },
    { id: 10, month: "অক্টোবর", assigned: 1500, received: 1500 },
    { id: 11, month: "নভেম্বর", assigned: 1500, received: 0 },
    { id: 12, month: "ডিসেম্বর", assigned: 1500, received: 0 },
  ],

  /* --- খাবার ফি --- */
  mealFees: [
    { id: 1, month: "জানুয়ারি", assigned: 3000, received: 3000 },
    { id: 2, month: "ফেব্রুয়ারি", assigned: 3000, received: 3000 },
    { id: 3, month: "মার্চ", assigned: 3000, received: 2500 },
    { id: 4, month: "এপ্রিল", assigned: 3000, received: 3000 },
    { id: 5, month: "মে", assigned: 3000, received: 3000 },
    { id: 6, month: "জুন", assigned: 3000, received: 3000 },
    { id: 7, month: "জুলাই", assigned: 3000, received: 3000 },
    { id: 8, month: "আগস্ট", assigned: 3000, received: 1500 },
    { id: 9, month: "সেপ্টেম্বর", assigned: 3000, received: 3000 },
    { id: 10, month: "অক্টোবর", assigned: 3000, received: 3000 },
    { id: 11, month: "নভেম্বর", assigned: 3000, received: 0 },
    { id: 12, month: "ডিসেম্বর", assigned: 3000, received: 0 },
  ],

  /* --- অন্যান্য ফি (পুরোনো স্ক্রিনের "..." প্যানেল) --- */
  otherFees: [
    { id: 1, head: "ভর্তি ফি", session: "2026", assigned: 5000, received: 5000, date: "05/01/2026" },
    { id: 2, head: "পরীক্ষার ফি (বার্ষিক)", session: "2026", assigned: 800, received: 800, date: "18/10/2026" },
    { id: 3, head: "কিতাব ও খাতা", session: "2026", assigned: 2200, received: 1200, date: "12/01/2026" },
    { id: 4, head: "বিদ্যুৎ ও সার্ভিস চার্জ", session: "2026", assigned: 1200, received: 0, date: "—" },
  ],
};

/* ---------------------------------------------------------
   Icons (self-contained, কোনো external dependency নেই)
--------------------------------------------------------- */

const Icon = ({ name, className = "w-4 h-4" }) => {
  const paths = {
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 15h6M9 11h6" /></>,
    award: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></>,
    note: <><path d="M4 4h16v12H8l-4 4z" /><path d="M8 9h8M8 12h5" /></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    wallet: <><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2" /><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" /><path d="M21 11h-4a2 2 0 1 0 0 4h4z" /></>,
    food: <><path d="M3 2v7a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2M6 2v10M6 12v10" /><path d="M18 2c-2 1-3 3-3 6s1 4 3 4v10" /></>,
    tag: <><path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0l-7-7A2 2 0 0 1 2.6 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    print: <><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    drop: <><path d="M12 2.7 6.3 9.4a8 8 0 1 0 11.4 0z" /></>,
    cake: <><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M2 21h20M12 11V7M8 11V8M16 11V8" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name] || paths.user}
    </svg>
  );
};

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

function Card({ title, icon = "file", accent = "violet", badge, children, className = "" }) {
  const ac = ACCENTS[accent] || ACCENTS.violet;
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <header className="px-4 py-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white flex items-center gap-2.5">
        <span className={`w-1 h-6 rounded-full shrink-0 ${ac.bar}`} />
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ac.icon}`}>
          <Icon name={icon} className="w-[17px] h-[17px]" />
        </span>
        <h2 className="text-[15px] font-bold text-slate-800 leading-snug">{title}</h2>
        {badge !== undefined && badge !== null && (
          <span className={`ml-auto shrink-0 h-[28px] flex items-center rounded-full border px-3 text-xs font-bold whitespace-nowrap ${ac.soft}`}>
            {badge}
          </span>
        )}
      </header>
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

function InfoRow({ icon, label, value, valueClass = "text-slate-800" }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-100 last:border-0">
      {icon && <span className="mt-0.5 text-slate-400 shrink-0"><Icon name={icon} className="w-4 h-4" /></span>}
      <span className="text-[13px] font-medium text-slate-500 w-[92px] shrink-0">{label}</span>
      <span className={`text-sm font-semibold break-words ${valueClass}`}>{value || "—"}</span>
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

function HeaderChip({ label, value }) {
  return (
    <div className="h-[38px] flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 backdrop-blur px-4 whitespace-nowrap">
      <span className="text-xs font-medium text-white/80">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
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

/* ফি টেবিল — মাসিক ফি ও খাবার ফি দুটোতেই ব্যবহার হচ্ছে */
function FeeTable({ rows }) {
  const totalAssigned = sum(rows, "assigned");
  const totalReceived = sum(rows, "received");
  const totalDue = Math.max(totalAssigned - totalReceived, 0);

  return (
    <Table
      minWidth="min-w-[380px]"
      maxHeight="max-h-[360px]"
      columns={[
        { key: "month", label: "মাসের নাম", tdClass: "font-medium text-slate-800 whitespace-nowrap" },
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
      ]}
      rows={rows}
      footer={
        <tr className="text-[13px] font-bold text-slate-700">
          <td className="px-3 py-2.5">সর্বমোট</td>
          <td className="px-3 py-2.5 text-right">{bn(totalAssigned)}</td>
          <td className="px-3 py-2.5 text-right text-emerald-600">{bn(totalReceived)}</td>
          <td className="px-3 py-2.5 text-right text-rose-600">{bn(totalDue)}</td>
        </tr>
      }
    />
  );
}

/* ---------------------------------------------------------
   Main page
--------------------------------------------------------- */

export default function UserHistory() {
  // পরে এখানে API ডাটা বসাবেন
  const user = DEMO_USER;

  const TABS = [
    { key: "all", label: "সব তথ্য" },
    { key: "academic", label: "একাডেমিক" },
    { key: "fee", label: "ফি ও আদায়" },
    { key: "leave", label: "ছুটি ও মন্তব্য" },
  ];
  const [tab, setTab] = useState("all");
  const show = (group) => tab === "all" || tab === group;

  /* ---- সারসংক্ষেপ হিসাব ---- */
  const totals = useMemo(() => {
    const groups = [user.monthlyFees, user.mealFees, user.otherFees];
    const assigned = groups.reduce((t, g) => t + sum(g, "assigned"), 0);
    const received = groups.reduce((t, g) => t + sum(g, "received"), 0);
    const due = Math.max(assigned - received, 0);
    const leaveDays = user.leaves
      .filter((l) => l.status !== "বাতিল")
      .reduce((t, l) => t + (Number(l.days) || 0), 0);
    const best = user.results.reduce(
      (b, r) => (Number(r.gpa) > Number(b?.gpa ?? -1) ? r : b),
      null
    );
    return { assigned, received, due, leaveDays, best };
  }, [user]);

  const initial = (user.name || "?").trim().charAt(0);
  const isActive = user.status === "সক্রিয়";

  return (
    <div
      className="w-full overflow-x-hidden p-4 sm:p-6 bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
    >
      <div className="w-full mx-auto max-w-[1500px]">

        {/* ============================================================
            হেডার ব্যানার
        ============================================================ */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B2EE5] via-[#6D3BEF] to-[#22B8F0] px-5 py-4 mb-4 shadow-sm">
          <span className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute right-28 -bottom-20 w-40 h-40 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-11 h-11 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0">
                <Icon name="user" className="w-6 h-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">শিক্ষার্থীর সম্পূর্ণ হিস্ট্রি</h1>
                <p className="text-[12px] sm:text-[13px] text-white/80 leading-snug">
                  ভর্তি, ফলাফল, ফি আদায়, ছুটি ও মন্তব্য — সব এক পেজে
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <HeaderChip label="আইডি" value={bn(user.code)} />
              <HeaderChip label="শিক্ষাবর্ষ" value={bn(user.admissions[0]?.session)} />
              <button
                type="button"
                onClick={() => window.print()}
                className="h-[38px] flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 backdrop-blur px-4 text-sm font-bold text-white transition hover:bg-white/25 active:scale-95"
              >
                <Icon name="print" className="w-4 h-4" />
                প্রিন্ট
              </button>
            </div>
          </div>
        </header>

        {/* ============================================================
            সারসংক্ষেপ কার্ড
        ============================================================ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
          <StatCard label="মোট নির্ধারিত ফি" value={taka(totals.assigned)} accent="violet" icon="wallet" />
          <StatCard label="মোট গৃহীত ফি" value={taka(totals.received)} accent="emerald" icon="wallet" />
          <StatCard label="মোট বকেয়া" value={taka(totals.due)} accent="rose" icon="tag"
            hint={totals.due > 0 ? "আদায় বাকি আছে" : "সব পরিশোধিত"} />
          <StatCard label="সর্বোচ্চ জিপিএ" value={bn(totals.best?.gpa || "—")} accent="cyan" icon="award"
            hint={totals.best ? `${totals.best.exam} — ${bn(totals.best.session)}` : ""} />
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
            মূল গ্রিড
        ============================================================ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">

          {/* ---------- বাম কলাম: প্রোফাইল ---------- */}
          <aside className="xl:col-span-4 2xl:col-span-3 space-y-4 xl:sticky xl:top-6">
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* কভার */}
              <div className="h-20 bg-gradient-to-r from-[#6D3BEF] to-[#22B8F0]" />

              <div className="px-4 pb-4 -mt-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#6D3BEF] to-[#22B8F0] flex items-center justify-center">
                    {user.photo ? (
                      <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{initial}</span>
                    )}
                  </div>

                  <h2 className="mt-3 text-[16px] font-bold text-slate-800 leading-snug">{user.name}</h2>

                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap justify-center">
                    <Pill tone="violet">{user.role}</Pill>
                    <Pill tone={isActive ? "emerald" : "rose"}>{user.status}</Pill>
                  </div>

                  <p className="mt-2 text-[13px] font-mono text-slate-500">আইডি: {bn(user.code)}</p>
                </div>

                {/* ব্যক্তিগত তথ্য */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-1">
                  <InfoRow icon="user" label="পিতা" value={user.father} />
                  <InfoRow icon="user" label="মাতা" value={user.mother} />
                  <InfoRow icon="file" label="NID" value={bn(user.nid)} />
                  <InfoRow icon="phone" label="মোবাইল-১" value={bn(user.mobile1)} />
                  <InfoRow icon="phone" label="মোবাইল-২" value={bn(user.mobile2)} />
                  <InfoRow icon="drop" label="রক্তের গ্রুপ" value={user.bloodGroup} valueClass="text-rose-600" />
                  <InfoRow icon="cake" label="জন্ম তারিখ" value={bn(user.birthDate)} />
                </div>

                {/* ঠিকানা */}
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-1">
                  <InfoRow icon="pin" label="গ্রাম" value={user.village} />
                  <InfoRow icon="pin" label="ডাকঘর" value={user.postOffice} />
                  <InfoRow icon="pin" label="থানা" value={user.thana} />
                  <InfoRow icon="pin" label="জেলা" value={user.district} />
                </div>
              </div>
            </section>
          </aside>

          {/* ---------- ডান কলাম: সব সেকশন ---------- */}
          <main className="xl:col-span-8 2xl:col-span-9 space-y-4">

            {/* ভর্তি তথ্য */}
            {show("academic") && (
              <Card title="ভর্তি তথ্য" icon="file" accent="violet" badge={`${bn(user.admissions.length)} টি`}>
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
                  rows={user.admissions}
                  empty="ভর্তির কোনো তথ্য নেই"
                />
              </Card>
            )}

            {/* ফলাফল */}
            {show("academic") && (
              <Card title="ফলাফল" icon="award" accent="cyan" badge={`${bn(user.results.length)} টি পরীক্ষা`}>
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
                  rows={user.results}
                  empty="কোনো ফলাফল প্রকাশ হয়নি"
                />
              </Card>
            )}

            {/* মন্তব্য + ছুটি — পাশাপাশি */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 items-start">

              {show("leave") && (
                <Card title="মন্তব্য / বার্ষিক প্রতিবেদন / আখলাকী রিপোর্ট" icon="note" accent="amber" badge={`${bn(user.reports.length)} টি`}>
                  <Table
                    minWidth="min-w-[460px]"
                    columns={[
                      { key: "date", label: "তারিখ", tdClass: "whitespace-nowrap text-slate-600", render: (r) => bn(r.date) },
                      { key: "type", label: "ধরন", render: (r) => <Pill tone="amber">{r.type}</Pill> },
                      { key: "note", label: "বর্ণনা", tdClass: "text-slate-700 min-w-[220px]" },
                    ]}
                    rows={user.reports}
                    empty="কোনো মন্তব্য লেখা হয়নি"
                  />
                </Card>
              )}

              {show("leave") && (
                <Card title="গেইট পাস ও ছুটি" icon="calendar" accent="violet" badge={`মোট ${bn(totals.leaveDays)} দিন`}>
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
                    rows={user.leaves}
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
                  badge={`বকেয়া ${taka(Math.max(sum(user.monthlyFees, "assigned") - sum(user.monthlyFees, "received"), 0))}`}
                >
                  <FeeTable rows={user.monthlyFees} />
                </Card>

                <Card
                  title="খাবার ফি"
                  icon="food"
                  accent="cyan"
                  badge={`বকেয়া ${taka(Math.max(sum(user.mealFees, "assigned") - sum(user.mealFees, "received"), 0))}`}
                >
                  <FeeTable rows={user.mealFees} />
                </Card>
              </div>
            )}

            {/* অন্যান্য ফি */}
            {show("fee") && (
              <Card title="ভর্তি ফি ও অন্যান্য আদায়" icon="tag" accent="emerald" badge={`${bn(user.otherFees.length)} টি খাত`}>
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
                  rows={user.otherFees}
                  footer={
                    <tr className="text-[13px] font-bold text-slate-700">
                      <td className="px-3 py-2.5" colSpan={3}>সর্বমোট</td>
                      <td className="px-3 py-2.5 text-right">{bn(sum(user.otherFees, "assigned"))}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-600">{bn(sum(user.otherFees, "received"))}</td>
                      <td className="px-3 py-2.5 text-right text-rose-600">
                        {bn(Math.max(sum(user.otherFees, "assigned") - sum(user.otherFees, "received"), 0))}
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

        <footer className="mt-6 text-center text-[12px] text-slate-400">
          © {bn(2026)} Developed by <span className="font-bold text-[#6D3BEF]">SAHARA IT</span>. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
