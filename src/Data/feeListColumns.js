// =============================================================================
// পরীক্ষার ফি তালিকার কলামগুলো
//
// প্রতিটি কলামের যা যা আছে:
//   key        → রুট থেকে যে নামে ডাটা আসে
//   label      → কাগজে ডিফল্ট যে নাম বসবে (ব্যবহারকারী বদলাতে পারবে)
//   lang       → কোন ভাষার তালিকায় কলামটা থাকে
//                  'bn'   শুধু বাংলা
//                  'ar'   শুধু আরবি
//                  'both' দুই ভাষাতেই
//   defaultOn  → সেটিংস না খুললে কোনগুলো দেখাবে (ভাষা অনুযায়ী, সীমার মধ্যে)
//   align      → ঘরের লেখা কোন দিকে
//                  নাম, পিতার নাম, ঠিকানা — বাঁ দিকে, কারণ লম্বা লেখা
//                  বাঁ থেকে পড়তে সুবিধা আর কলামের শুরুটা এক লাইনে থাকে
//                  আরবি নামগুলো ডান দিকে, কারণ আরবি ডান থেকে পড়া হয়
//                  সংখ্যা ও হাতে লেখার ঘর — মাঝে
//   weight     → কাগজে ঘরটা কতটুকু জায়গা নেবে, অন্যদের তুলনায়।
//                A4 এর চওড়ার মধ্যেই সব ঘর ভাগ হয়ে বসে, তাই কোনো লেখা
//                কাটা যায় না — লম্বা নাম থাকলে ঘরের ভেতরেই পরের লাইনে
//                নেমে যায়। সেটিংস থেকে এটা কমানো-বাড়ানো যায়।
//
// নতুন কলাম লাগলে শুধু এই তালিকায় একটা লাইন — মডাল, টেবিল আর প্রিন্ট,
// তিন জায়গাতেই চলে আসবে।
// =============================================================================

/**
 * এক তালিকায় সর্বোচ্চ কয়টা ঘর।
 *
 * চওড়া শতাংশে বসে বলে ঘর বাড়লেও কাগজের বাইরে কিছু যায় না, শুধু প্রতিটা
 * ঘর সরু হয়। আটটার বেশি হলে নামগুলো এত ভেঙে ভেঙে নামে যে পড়া কষ্ট হয়।
 */
export const MAX_COLUMNS = 8;

export const FEE_LIST_COLUMNS = [
  // ---- শনাক্তকরণ
  { key: 'SL',              label: 'ক্রমিক',          lang: 'both', defaultOn: true,  align: 'center', weight: 45,  virtual: true },
  { key: 'AdmissionSerial', label: 'ভর্তি নং',        lang: 'both', defaultOn: true, align: 'center', weight: 65 },
  { key: 'UserCode',        label: 'আইডি নং',         lang: 'both', defaultOn: true,  align: 'center', weight: 75 },

  // ---- নাম ও পরিচয় (বাংলা) — লেখা বাঁ দিকে
  { key: 'UserName',        label: 'শিক্ষার্থীর নাম', lang: 'bn',   defaultOn: true,  align: 'left',   weight: 220 },
  { key: 'FatherName',      label: 'পিতার নাম',       lang: 'bn',   defaultOn: true,  align: 'left',   weight: 200 },
  { key: 'MotherName',      label: 'মাতার নাম',       lang: 'bn',   defaultOn: false, align: 'left',   weight: 200 },

  // ---- নাম ও পরিচয় (আরবি) — আরবি ডান থেকে পড়া হয়
  { key: 'ArabicName',      label: 'আরবি নাম',        lang: 'ar',   defaultOn: true,  align: 'right',  weight: 220 },
  { key: 'ArabicFather',    label: 'আরবি পিতার নাম',  lang: 'ar',   defaultOn: true,  align: 'right',  weight: 200 },
  { key: 'ArabicShortAdd',  label: 'ঠিকানা',          lang: 'ar',   defaultOn: false, align: 'right',  weight: 180 },

  // ---- যোগাযোগ
  { key: 'Mobile1',         label: 'মোবাইল',          lang: 'both', defaultOn: false, align: 'center', weight: 110 },
  { key: 'DateOfBirth',     label: 'জন্ম তারিখ',      lang: 'both', defaultOn: false, align: 'center', weight: 95, type: 'date' },

  // ---- শ্রেণি ও পরীক্ষা (বাংলা)
  { key: 'SubClass',        label: 'শ্রেণি',          lang: 'bn',   defaultOn: false, align: 'left',   weight: 110 },
  { key: 'SessionName',     label: 'শিক্ষাবর্ষ',      lang: 'bn',   defaultOn: false, align: 'center', weight: 95 },
  { key: 'ExamName',        label: 'পরীক্ষা',         lang: 'bn',   defaultOn: false, align: 'left',   weight: 130 },

  // ---- শ্রেণি ও পরীক্ষা (আরবি)
  { key: 'SubClassAra',     label: 'শ্রেণি (আরবি)',     lang: 'ar', defaultOn: false, align: 'right',  weight: 110 },
  { key: 'SessionAraName',  label: 'শিক্ষাবর্ষ (আরবি)', lang: 'ar', defaultOn: false, align: 'center', weight: 95 },
  { key: 'ExamAraName',     label: 'পরীক্ষা (আরবি)',    lang: 'ar', defaultOn: false, align: 'right',  weight: 130 },

  // ---- টাকা
  { key: 'Fee',             label: 'নির্ধারিত ফি',    lang: 'both', defaultOn: true,  align: 'center', weight: 85, type: 'money' },
  { key: 'Less',            label: 'ছাড়',             lang: 'both', defaultOn: false, align: 'center', weight: 70, type: 'money' },
  { key: 'PayAmount',       label: 'জমা',             lang: 'both', defaultOn: false, align: 'center', weight: 75, type: 'money' },
  { key: 'DueAmount',       label: 'বকেয়া',           lang: 'both', defaultOn: false, align: 'center', weight: 75, type: 'money' },

  // ---- অবস্থা — "সকল তালিকা" দেখলে কে দিয়েছে আর কে দেয়নি বোঝার জন্য
  { key: 'FeeStatus',       label: 'অবস্থা',          lang: 'both', defaultOn: false, align: 'center', weight: 85, virtual: true },

  // ---- হাতে লেখার ঘর
  { key: 'Signature',       label: 'স্বাক্ষর',        lang: 'both', defaultOn: true,  align: 'center', weight: 120, virtual: true, blank: true },
  { key: 'Remark',          label: 'মন্তব্য',         lang: 'both', defaultOn: true, align: 'center', weight: 120, virtual: true, blank: true },
];

/** জায়গার সীমা — এর বাইরে গেলে কাগজে ঘরটা বেঢপ লাগে */
export const WIDTH_MIN = 40;
export const WIDTH_MAX = 320;

/** ভাষার আইডি → 'bn' বা 'ar' (১ = বাংলা, ২ = আরবি) */
export const langCode = (languageId) => (Number(languageId) === 2 ? 'ar' : 'bn');

/** এই ভাষায় যে কলামগুলো চলে — তালিকার নিজের ক্রম বজায় রেখে */
export const columnsForLanguage = (languageId) => {
  const code = langCode(languageId);
  return FEE_LIST_COLUMNS.filter((c) => c.lang === 'both' || c.lang === code);
};

/** ডিফল্ট সেটিংস — সেটিংস কখনো সেভ না করলে এটাই চলে */
export const defaultFeeListSettings = (languageId = 1) => ({
  // কোন কলাম দেখাবে — এই ভাষার ডিফল্টগুলো, তালিকার ক্রমেই, সীমার মধ্যে
  visible: columnsForLanguage(languageId)
    .filter((c) => c.defaultOn)
    .slice(0, MAX_COLUMNS)
    .map((c) => c.key),
  // বদলানো নাম — { UserName: 'নাম' } এর মতো, না থাকলে ডিফল্ট label
  labels: {},
  // বদলানো জায়গা — { Signature: 160 } এর মতো, না থাকলে কলামের নিজের weight
  widths: {},
  // কাগজের অন্যান্য সেটিংস
  showHeader: true,
  showSummary: true,
  showTotalRow: true,

  // ⭐ দুইটা আলাদা লোগো — একটাই ভেবে গুলিয়ে ফেলা সহজ, তাই নাম দুইটা:
  //
  //   showLogo      → প্রতিষ্ঠানের লোগো, কাগজের মাথায় নামের উপরে স্পষ্ট করে
  //   showWatermark → জলছাপ, পাতার মাঝখানে হালকা হয়ে পেছনে
  //
  // দুইটা আলাদা ছবি, আলাদা জায়গা, আর এখন আলাদা সুইচ।
  showLogo: true,
  showWatermark: true,

  // লোগোটা কোথায় — 'top' মাথার মাঝখানে, 'left' বাঁ পাশে (প্রবেশপত্রের মতো)
  logoPosition: 'top',

  fontSize: 13,
});

/**
 * তালিকার ধরন → ছোট নাম।
 *   1 = ফি বিহীন, 2 = ফি গৃহীত, 3 = সকল
 */
export const listKey = (listType) => {
  const n = Number(listType);
  if (n === 2) return 'paid';
  if (n === 3) return 'all';
  return 'unpaid';
};

export const listName = (listType) => {
  const k = listKey(listType);
  if (k === 'paid') return 'পরীক্ষার ফি গৃহীত তালিকা';
  if (k === 'all') return 'পরীক্ষার ফি তালিকা (সকল)';
  return 'পরীক্ষার ফি বিহীন তালিকা';
};

// সেটিংস ভাষা ও তালিকার ধরন অনুযায়ী আলাদা রাখা হয় — এক তালিকার সাজানো
// অন্যটায় গিয়ে গুলিয়ে যাওয়ার দরকার নেই
const storageKey = (listType, languageId) =>
  `examFeeList:settings:${listKey(listType)}:${langCode(languageId)}`;

/** সেভ করা সেটিংস পড়া — না থাকলে বা নষ্ট থাকলে ডিফল্ট */
export const loadFeeListSettings = (listType, languageId = 1) => {
  const fallback = defaultFeeListSettings(languageId);

  try {
    const raw = localStorage.getItem(storageKey(listType, languageId));
    if (!raw) return fallback;

    const saved = JSON.parse(raw);

    // এই ভাষায় নেই এমন key (বা মুছে ফেলা পুরোনো key) ছেঁটে ফেলি —
    // নইলে বাংলা তালিকায় আরবি কলাম ফিরে আসত
    const allowed = new Set(columnsForLanguage(languageId).map((c) => c.key));

    const visible = Array.isArray(saved.visible)
      ? saved.visible.filter((k) => allowed.has(k)).slice(0, MAX_COLUMNS)
      : fallback.visible;

    return {
      ...fallback,
      ...saved,
      // সব কলাম বাদ পড়ে গেলে ডিফল্টে ফিরি, নইলে টেবিলটা ফাঁকা দেখাত
      visible: visible.length ? visible : fallback.visible,
      labels: saved.labels && typeof saved.labels === 'object' ? saved.labels : {},
      widths: saved.widths && typeof saved.widths === 'object' ? saved.widths : {},
    };
  } catch {
    return fallback;
  }
};

/** সেটিংস সেভ — ব্রাউজারে, তাই প্রতি ব্যবহারকারীর নিজের মতো থাকে */
export const saveFeeListSettings = (listType, languageId, settings) => {
  try {
    localStorage.setItem(storageKey(listType, languageId), JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
};

/**
 * একটা কলাম চালু/বন্ধ করা।
 *
 * চালু করলে কলামটা তালিকার নিজের জায়গায় বসে, শেষে নয় — আগে শেষে যোগ হত
 * বলে যে ক্রমে চাপ দেওয়া হত সেই ক্রমেই কাগজে বসে যেত।
 *
 * সীমায় পৌঁছে গেলে আর যোগ হয় না — তালিকাটা অপরিবর্তিত ফেরত যায়, যাতে
 * কাগজে ঘরগুলো এত সরু হয়ে না যায় যে নাম পড়াই কষ্ট হয়।
 */
export const toggleColumn = (visible, key, languageId) => {
  const list = visible || [];
  if (list.includes(key)) return list.filter((k) => k !== key);
  if (list.length >= MAX_COLUMNS) return list;

  const order = columnsForLanguage(languageId).map((c) => c.key);
  const next = [...list, key];

  return next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

/**
 * টেনে এনে ক্রম বদলানো — fromKey কে toKey এর জায়গায় বসায়, বাকিরা
 * সরে যায়। হেডার ধরে টানার জন্য।
 */
export const reorderColumns = (visible, fromKey, toKey) => {
  const list = [...(visible || [])];
  const from = list.indexOf(fromKey);
  const to = list.indexOf(toKey);

  if (from < 0 || to < 0 || from === to) return list;

  list.splice(from, 1);
  list.splice(to, 0, fromKey);
  return list;
};

/** জায়গার মান সীমার ভেতরে আনা */
export const clampWidth = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.round(n), WIDTH_MIN), WIDTH_MAX);
};

/** সেটিংস থেকে ছাপার জন্য কলামের সাজানো তালিকা */
export const resolveColumns = (settings, languageId = 1) => {
  const s = settings || defaultFeeListSettings(languageId);
  const allowed = columnsForLanguage(languageId);
  const byKey = new Map(allowed.map((c) => [c.key, c]));

  const dress = (col) => ({
    ...col,
    label: s.labels?.[col.key]?.trim() || col.label,
    // সেটিংসে জায়গা বসানো থাকলে সেটাই, নইলে কলামের নিজেরটা
    weight: s.widths?.[col.key] ?? col.weight ?? 100,
  });

  const picked = (s.visible || [])
    .slice(0, MAX_COLUMNS)
    .map((key) => {
      const col = byKey.get(key);
      if (!col) return null;    // এই ভাষার নয় — কাগজে যাবে না
      return dress(col);
    })
    .filter(Boolean);

  // সব বাদ পড়লে অন্তত ডিফল্টগুলো, নইলে ফাঁকা টেবিল ছাপা হত
  if (picked.length) return picked;

  return allowed.filter((c) => c.defaultOn).slice(0, MAX_COLUMNS).map(dress);
};

/**
 * প্রতিটা ঘর কাগজের কত শতাংশ জায়গা নেবে।
 *
 * শতাংশে হিসাব করা হয় বলে সব ঘর মিলে ঠিক কাগজের চওড়াটুকুই নেয় —
 * ডান পাশের ঘর কখনো কেটে যায় না। লম্বা নাম ঘরের ভেতরেই পরের লাইনে নামে।
 */
export const columnPercents = (columns) => {
  const total = (columns || []).reduce((sum, c) => sum + (Number(c.weight) || 100), 0);
  if (!total) return (columns || []).map(() => 100 / Math.max(columns.length, 1));

  return (columns || []).map((c) => ((Number(c.weight) || 100) / total) * 100);
};

// ---- ছাপার সময় মান সাজানো -------------------------------------------------

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** ইংরেজি সংখ্যা → বাংলা সংখ্যা */
export const toBn = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

export const formatCell = (col, row, index) => {
  if (col.key === 'SL') return toBn(index + 1);

  // অবস্থার ঘরটা রুটের IsPaid ফ্ল্যাগ থেকে — কোনো কলামে এই লেখা নেই
  if (col.key === 'FeeStatus') return row?.IsPaid ? 'দিয়েছে' : 'দেয়নি';

  if (col.blank) return '';

  const raw = row?.[col.key];
  if (raw === null || raw === undefined || raw === '') return '';

  if (col.type === 'money') return toBn(Number(raw) || 0);

  if (col.type === 'date') {
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return toBn(raw);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return toBn(`${dd}/${mm}/${d.getFullYear()}`);
  }

  return typeof raw === 'number' ? toBn(raw) : String(raw);
};

/** টাকার কলামগুলোর যোগফল — নিচের মোট সারির জন্য */
export const columnTotal = (col, rows) => {
  if (col.type !== 'money') return null;
  return (rows || []).reduce((sum, r) => sum + (Number(r?.[col.key]) || 0), 0);
};

/* ═══════════════════════════════════════════════════════════════════════════
   সাজানো — ভর্তি নং / আইডি নং, ছোট → বড় বা বড় → ছোট

   সার্ভারেও ঠিক এই নিয়মেই সাজানো হয় (examReportRoute এর buildSorter)। এখানে
   আবার রাখার কারণ — তালিকা বা ক্রম বদলালে নতুন করে সার্ভারে যেতে হয় না, আর
   কোনো কারণে প্যারাম সার্ভারে না পৌঁছালেও কাগজে ক্রম ঠিকই থাকে।

   নিয়ম:
     • সংখ্যা হলে সংখ্যা হিসেবেই তুলনা — তাই ৯ কখনো ১০ এর পরে যায় না
     • খালি ঘর সব সময় শেষে, ক্রম উল্টালেও
     • মান এক হলে AdmissionID ধরে — যাতে একই তালিকা বারবার একই রকম আসে
   ═══════════════════════════════════════════════════════════════════════════ */

export const SORTABLE_FIELDS = ['AdmissionSerial', 'UserCode'];

export const SORT_FIELD_LABELS = {
  AdmissionSerial: 'ভর্তি নং',
  UserCode: 'আইডি নং',
};

const isEmptyCell = (v) => v === null || v === undefined || String(v).trim() === '';

const numericValue = (v) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const buildFeeRowSorter = (field, order) => {
  const key = SORTABLE_FIELDS.includes(String(field)) ? String(field) : 'AdmissionSerial';
  const dir = String(order).toLowerCase() === 'desc' ? -1 : 1;

  return (a, b) => {
    const av = a?.[key];
    const bv = b?.[key];

    // খালি ঘর সব সময় শেষে
    const aEmpty = isEmptyCell(av);
    const bEmpty = isEmptyCell(bv);
    if (aEmpty && bEmpty) return 0;
    if (aEmpty) return 1;
    if (bEmpty) return -1;

    const an = numericValue(av);
    const bn = numericValue(bv);

    if (an !== null && bn !== null) {
      if (an !== bn) return (an - bn) * dir;
    } else {
      const cmp = String(av).localeCompare(String(bv), 'bn');
      if (cmp !== 0) return cmp * dir;
    }

    // সমান হলে ভর্তি আইডি ধরে — ক্রম যেন প্রতিবার এক থাকে
    const at = Number(a?.AdmissionID) || 0;
    const bt = Number(b?.AdmissionID) || 0;
    return at - bt;
  };
};

export const sortFeeRows = (rows, field, order) =>
  Array.isArray(rows) ? [...rows].sort(buildFeeRowSorter(field, order)) : [];

/* ═══════════════════════════════════════════════════════════════════════════
   কোন তালিকাটা দেখানো হবে

   সার্ভার এখন তিনটাই পাঠায় — paidData, unpaidData, allData। পুরোনো সার্ভার
   (বা অন্য রিপোর্ট) শুধু data পাঠায়, তাই সেটাও ধরা হয়েছে, আর তখন IsPaid
   ফ্ল্যাগ দেখে নিজেরাই ভাগ করে নেওয়া হয়।
   ═══════════════════════════════════════════════════════════════════════════ */

export const pickFeeRows = (reportData, listType) => {
  if (!reportData) return [];

  const kind = listKey(listType);           // 'paid' | 'unpaid' | 'all'
  const base = Array.isArray(reportData)
    ? reportData
    : Array.isArray(reportData.data)
      ? reportData.data
      : [];

  const paid = Array.isArray(reportData.paidData) ? reportData.paidData : null;
  const unpaid = Array.isArray(reportData.unpaidData) ? reportData.unpaidData : null;

  if (paid || unpaid) {
    const p = paid || [];
    const u = unpaid || [];
    if (kind === 'paid') return p;
    if (kind === 'unpaid') return u;
    return [...u, ...p];
  }

  // পুরোনো সার্ভার — এক তালিকাই এসেছে, IsPaid ধরে ভাগ করি
  if (kind === 'all') return base;
  const wantPaid = kind === 'paid';
  const split = base.filter((r) => Boolean(r?.IsPaid) === wantPaid);

  // IsPaid ফ্ল্যাগই না থাকলে যা এসেছে তাই দেখাই — ফাঁকা পাতা দেওয়ার চেয়ে ভালো
  return split.length || base.some((r) => 'IsPaid' in (r || {})) ? split : base;
};

/** যে তালিকাটা দেখানো হচ্ছে তার হিসাব — উপরের পিল আর সর্বমোট ঘরের জন্য */
export const feeRowsSummary = (rows, reportData) => {
  const list = Array.isArray(rows) ? rows : [];
  const paidCount = list.filter((r) => r?.IsPaid).length;

  return {
    totalStudent: reportData?.summary?.totalStudent ?? list.length,
    shownCount: list.length,
    paidCount: reportData?.summary?.paidCount ?? paidCount,
    unpaidCount: reportData?.summary?.unpaidCount ?? (list.length - paidCount),
    collected: list.reduce((sum, r) => sum + (Number(r?.PayAmount) || 0), 0),
    due: list.reduce((sum, r) => sum + (Number(r?.DueAmount) || 0), 0),
  };
};