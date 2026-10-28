// =============================================================================
// নম্বর পত্র ও স্বাক্ষরপত্র — কাগজের সেটিংস
//
// ⭐ দুইটা রিপোর্ট এক হলো
//
//    আগে "৩. নম্বর পত্র" আর "৫. স্বাক্ষরপত্র ও নম্বরসীট" আলাদা দুইটা
//    রিপোর্ট ছিল, অথচ কাগজ দুইটা প্রায় একই — একই শিক্ষার্থীর তালিকা, একই
//    ক্রম, শুধু স্বাক্ষরপত্রে বাড়তি কয়েকটা ফাঁকা ঘর (স্বাক্ষর, মাসিক
//    নম্বর, মোট নম্বর)। তাই দুইটাকে এক করে এখন ঘরগুলোই বাছাই করা যায়:
//    স্বাক্ষরের ঘর চালু করলেই ওটা স্বাক্ষরপত্র হয়ে যায়।
//
//    এতে কোনো কাগজ হারায়নি — আগের দুইটার যা যা ঘর ছিল সবই নিচের তালিকায়
//    আছে, শুধু এখন একটাই কাগজ আর একটাই সেটিংস।
//
// ফি তালিকার feeListColumns.js এর হুবহু একই ধাঁচে লেখা — সেটিংস ব্রাউজারে
// (localStorage) সেভ থাকে, ভাষা ধরে আলাদা।
//
// src/Data/numberSheetColumns.js
// =============================================================================

import { Buffer } from 'buffer';

const API_URL = import.meta.env.VITE_SERVER_URL;

/**
 * লোগো → <img src>।
 *
 * ⭐ এক জায়গাতেই রাখা, কারণ দুই জায়গায় লাগে — কাগজ (NumberSheetPaper)
 * আর সেটিংসের জলছাপের নমুনা (NumberSheetSettingsModal)। আলাদা করে
 * লিখলে একটায় সারানো হত, অন্যটায় ভাঙা ছবিই থেকে যেত।
 *
 * তিন রকম মান আসতে পারে:
 *   Buffer  → SQL Server এ লোগো varbinary, তাই বাইটের তালিকা হয়ে আসে
 *             ({ type: 'Buffer', data: [...] }) — base64 ডাটা URL বানানো হয়
 *   পুরো URL → data:, blob:, http(s): — যেমন আছে তেমনই যায়
 *   ফাইলের নাম → সামনে সার্ভারের ঠিকানা বসে। নইলে ব্রাউজার চলতি পাতার
 *             ঠিকানা ধরে খুঁজত (/dashboard/exam/logo.png) আর ভাঙা ছবি দেখাত।
 */
export const toLogoSrc = (value) => {
  if (!value) return '';

  if (typeof value === 'object' && Array.isArray(value?.data)) {
    return `data:image/png;base64,${Buffer.from(value.data).toString('base64')}`;
  }

  if (typeof value !== 'string') return '';

  const path = value.trim();
  if (!path) return '';

  // পুরো ঠিকানা — যেমন আছে তেমনই
  if (/^(https?:|data:|blob:)/i.test(path)) return path;

  const base = String(API_URL || '').replace(/\/+$/, '');

  /* ⭐ সার্ভারের গোড়া থেকে লেখা পথ (/uploads/logo.png) — সামনে শুধু
     সার্ভারের ঠিকানা, আর কিছু নয়। আগে এখানেও /public/ জুড়ে দেওয়া হত,
     তাতে /public/uploads/logo.png হয়ে ছবিটা হারিয়ে যেত। */
  if (path.startsWith('/')) return `${base}${path}`;

  // আগে থেকেই public/ দিয়ে শুরু হলে আরেকবার জোড়া লাগে না
  if (/^public\//i.test(path)) return `${base}/${path}`;

  return `${base}/public/${path}`;
};

/* ───────────────────────────────────────────────────────────────────────────
   কাগজ ও দিক

   মাপগুলো mm এ — ছাপার হিসাব কোডে বাঁধা, তাই যে কম্পিউটার থেকেই ছাপা হোক
   কাগজে একই জিনিস বসে।
   ─────────────────────────────────────────────────────────────────────────── */
export const PAPERS = [
  { id: 'a4', label: 'A4', w: 210, h: 297, pad: 10 },
  { id: 'a5', label: 'A5', w: 148, h: 210, pad: 7 },
];

export const paperById = (id) => PAPERS.find((p) => p.id === String(id)) || PAPERS[0];

/* দিকের নাম ইংরেজিতেই — প্রিন্ট ডায়ালগে ক্রোম এই নামেই দেখায়
   (Portrait / Landscape), তাই দুই জায়গায় এক নাম থাকলে মেলাতে সুবিধা */
export const ORIENTATIONS = [
  { id: 'portrait', label: 'Portrait' },
  { id: 'landscape', label: 'Landscape' },
];

export const orientationValue = (v) => (String(v) === 'landscape' ? 'landscape' : 'portrait');

/**
 * কাগজের আসল মাপ — দিক ধরে।
 *
 * আড়াআড়ি মানে চওড়া আর উচ্চতা জায়গা বদল করে, @page size এও তাই যায়।
 */
export const paperSize = (settings) => {
  const p = paperById(settings?.paper);
  const landscape = orientationValue(settings?.orientation) === 'landscape';

  return {
    id: p.id,
    label: p.label,
    pad: p.pad,
    width: landscape ? p.h : p.w,
    height: landscape ? p.w : p.h,
    orientation: landscape ? 'landscape' : 'portrait',
  };
};

/** কাগজে কয় কলাম — ১ বা ২, অন্য কিছু এলে ১ */
export const columnCount = (value) => (Number(value) === 2 ? 2 : 1);

/* ───────────────────────────────────────────────────────────────────────────
   ঘরগুলো

   key      → সারির কোন মানটা
   label    → কাগজে আর সেটিংসে যে নামে বসবে
   width    → ঘরের চওড়া, কাগজের অনুপাতে (mm নয় — কলাম সরু-চওড়া হলেও মানে)
   blank    → হাতে লেখার জন্য ফাঁকা ঘর (নম্বর, স্বাক্ষর)
   align    → লেখা কোন দিকে
   ─────────────────────────────────────────────────────────────────────────── */
export const NUMBER_SHEET_FIELDS = [
  { key: 'SL',              label: 'ক্রম',              width: 8,  align: 'center', defaultOn: true },
  { key: 'AdmissionSerial', label: 'ভর্তি নং',          width: 14, align: 'center', defaultOn: true },
  { key: 'UserCode',        label: 'আইডি নং',           width: 16, align: 'center', defaultOn: true },
  { key: 'UserName',        label: 'পরীক্ষার্থীর নাম',  width: 36, align: 'left',   defaultOn: true },

  /* ⭐ পিতা ও মাতার নাম ডেটাবেজ থেকেই আসে, হাতে লিখতে হয় না।
     তাই এ দুইটা blank নয় — ঘরে নামটাই ছাপা হয়ে যায়। */
  { key: 'FatherName',      label: 'পিতার নাম',         width: 30, align: 'left',   defaultOn: false },
  { key: 'MotherName',      label: 'মাতার নাম',         width: 30, align: 'left',   defaultOn: false },

  // ---- হাতে লেখার ফাঁকা ঘর। স্বাক্ষরপত্রের ঘরগুলো এখানেই।
  { key: 'Signature',       label: 'স্বাক্ষর',          width: 24, align: 'center', defaultOn: false, blank: true },
  { key: 'Mark',            label: 'প্রাপ্ত নম্বর',     width: 14, align: 'center', defaultOn: true,  blank: true },
  { key: 'MonthlyMark',     label: 'মাসিক নম্বর',       width: 14, align: 'center', defaultOn: false, blank: true },
  { key: 'TotalMark',       label: 'মোট নম্বর',         width: 14, align: 'center', defaultOn: false, blank: true },

  /* ⭐ নিজের মতো একটা ফাঁকা ঘর।
     কোনো নির্দিষ্ট তথ্যের ঘর নয় — কাগজের হেডারে নাম বদলে যা খুশি
     লেখা যায় (মন্তব্য, উপস্থিতি, টাকা…), আর কাগজে ঘরটা ফাঁকাই যায়। */
  { key: 'Blank',           label: 'ফাঁকা ঘর',          width: 20, align: 'center', defaultOn: false, blank: true },
];

export const fieldByKey = (key) => NUMBER_SHEET_FIELDS.find((f) => f.key === key) || null;

/* ───────────────────────────────────────────────────────────────────────────
   সর্বোচ্চ কয়টা ঘর

   দুই কলামে প্রতিটা ছক কাগজের অর্ধেক চওড়া পায়। সেখানে আটটা ঘর বসালে
   একেকটা এত সরু হয় যে নামের প্রতিটা অক্ষর আলাদা লাইনে নেমে যায় — তাই
   দুই কলামে সীমাটা কমে। ফি তালিকায় ঠিক এই নিয়মেই আছে।
   ─────────────────────────────────────────────────────────────────────────── */
export const MAX_FIELDS = 8;
export const MAX_FIELDS_TWO_UP = 4;

export const maxFieldsFor = (columns) =>
  columnCount(columns) === 2 ? MAX_FIELDS_TWO_UP : MAX_FIELDS;

/* ───────────────────────────────────────────────────────────────────────────
   ঘরের চওড়া

   মানটা অনুপাত, mm নয় — ছকের মোট চওড়ার ভাগ। তাই কাগজ বা কলাম বদলালেও
   ঘরগুলোর অনুপাত একই থাকে।
   ─────────────────────────────────────────────────────────────────────────── */
export const WIDTH_MIN = 5;
export const WIDTH_MAX = 120;

export const clampWidth = (value) => {
  /* ⭐ null, undefined আর ফাঁকা লেখা মানে "স্বয়ংক্রিয়" — ঘরের নিজের মাপ।

     শুধু Number(value) দিয়ে দেখলে Number(null) আর Number('') দুইটাই ০ হয়,
     আর ০ তো একটা সংখ্যাই — তাই সীমায় এনে WIDTH_MIN বসে যেত। মানে ঘরটা
     "স্বয়ংক্রিয়" তে ফিরত না, সবচেয়ে সরু হয়ে বসে থাকত। */
  if (value === null || value === undefined || String(value).trim() === '') return null;

  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(Math.max(Math.round(n), WIDTH_MIN), WIDTH_MAX);
};

/** জলছাপের ঘনত্ব — শতাংশে */
export const WATERMARK_MIN = 2;
export const WATERMARK_MAX = 30;
export const WATERMARK_DEFAULT = 6;

export const clampWatermark = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return WATERMARK_DEFAULT;
  return Math.min(Math.max(Math.round(n), WATERMARK_MIN), WATERMARK_MAX);
};

/** শেষে কয়টা ফাঁকা সারি — হাতে নাম লেখার জন্য */
export const BLANK_ROWS_MAX = 20;

export const clampBlankRows = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), BLANK_ROWS_MAX);
};

/* ───────────────────────────────────────────────────────────────────────────
   সাজানোর ক্রম

   ⭐ ভর্তি সিরিয়াল না আইডি — ফি তালিকার বারটা যে দুইটা মান দেয়, এখানেও
   ঠিক সেই দুইটাই। তাই দুই রিপোর্টে একই নিয়ম, ব্যবহারকারীকে নতুন করে
   কিছু শিখতে হয় না।
   ─────────────────────────────────────────────────────────────────────────── */
export const SORT_KEYS = [
  { key: 'AdmissionSerial', label: 'ভর্তি নং' },
  { key: 'UserCode',        label: 'আইডি নং' },
];

export const sortKeyValue = (v) => (String(v) === 'UserCode' ? 'UserCode' : 'AdmissionSerial');
export const sortOrderValue = (v) => (String(v) === 'desc' ? 'desc' : 'asc');

/** লেখার আকার — pt এ, px নয় (px পর্দার DPI অনুযায়ী বদলায়, pt বদলায় না) */
export const FONT_MIN = 6;
export const FONT_MAX = 13;
export const FONT_DEFAULT = 9;

export const clampFont = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return FONT_DEFAULT;
  return Math.min(Math.max(Math.round(n * 10) / 10, FONT_MIN), FONT_MAX);
};

/* ───────────────────────────────────────────────────────────────────────────
   সারির উচ্চতা (mm)

   ০ মানে স্বয়ংক্রিয় — লেখার আকার যতটুকু জায়গা চায় ততটুকুই। হাতে লেখার
   জন্য সারি উঁচু দরকার হলে এখানে মাপটা বসানো যায়।

   ⭐ মাপটা বসে প্রতিটা ঘরেই, ভরা হোক বা ফাঁকা। আগে উচ্চতা আসত ভেতরের
   লেখা থেকে, তাই ফাঁকা সারিগুলো চ্যাপ্টা হয়ে যেত — ওতে কিছু লেখা যেত না।
   ─────────────────────────────────────────────────────────────────────────── */
export const ROW_HEIGHT_MAX = 15;

export const clampRowHeight = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.round(n * 10) / 10, ROW_HEIGHT_MAX);
};

/**
 * সারির আসল উচ্চতা (mm)।
 *
 * বসানো না থাকলে লেখার আকার থেকেই হিসাব — ১pt = ০.৩৫২৮mm, লাইনের
 * উচ্চতা ১.২৫ গুণ, সাথে উপর-নিচের প্যাডিং। তাই যে মাপেই ছাপুন, ভরা আর
 * ফাঁকা সারি সবসময় সমান উঁচু হয়।
 */
export const rowHeightMm = (settings) => {
  const set = clampRowHeight(settings?.rowHeight);
  if (set > 0) return set;

  const font = clampFont(settings?.fontSize);
  return Math.round((font * 1.25 * 0.3528 + 1.4) * 100) / 100;
};

/** ভাষার আইডি → 'bn' বা 'ar' (১ = বাংলা, ২ = আরবি) */
export const langCode = (languageId) => (Number(languageId) === 2 ? 'ar' : 'bn');

/** ডিফল্ট সেটিংস — কখনো সেভ না করলে এটাই চলে */
export const defaultNumberSheetSettings = () => ({
  // কোন ঘরগুলো দেখাবে — তালিকার নিজের ক্রমেই
  visible: NUMBER_SHEET_FIELDS.filter((f) => f.defaultOn).map((f) => f.key),

  // বদলানো নাম — { UserName: 'নাম' } এর মতো, না থাকলে ঘরের নিজের label
  labels: {},
  // বদলানো চওড়া — { UserName: 50 } এর মতো, না থাকলে ঘরের নিজের width
  widths: {},

  paper: 'a4',
  orientation: 'portrait',
  columns: 2,

  sortBy: 'AdmissionSerial',
  sortOrder: 'asc',

  fontSize: FONT_DEFAULT,

  // কাগজের মাথায় কী কী বসবে
  showHeader: true,
  showLogo: true,
  showExamBand: true,
  showMeta: true,        // শ্রেণি / কিতাব / মোট
  showExaminer: true,    // পরীক্ষকের নাম ও তারিখের লাইন
  showFooterSign: true,  // নিচে দুইটা স্বাক্ষরের দাগ

  // জলছাপ — পাতার মাঝখানে হালকা হয়ে প্রতিষ্ঠানের লোগো
  showWatermark: false,
  watermarkOpacity: WATERMARK_DEFAULT,

  /* ⭐ স্বাক্ষরের নাম — দুইটা, তিনটা নয়।
     কাগজের নিচে বাঁ আর ডান পাশে দুইটা দাগই বসে; ফাঁকা রাখলে নিচের
     ডিফল্ট লেখাটাই ছাপা হয়। */
  signLeft: '',
  signRight: '',

  /* ⭐ শেষে ফাঁকা সারি — ডিফল্টে একটাও নয়।

     আগে কলামটা ভরানোর জন্য বাকি সারিগুলো ফাঁকা বসানো হত, তাই তিনজন
     শিক্ষার্থীর কাগজেও পঁচিশটা খালি ঘর ছাপা হত। এখন যতজন ততটুকুই ছক,
     আর হাতে নাম তোলার জন্য ফাঁকা সারি লাগলে এখানে সংখ্যাটা বসালেই হয়। */
  blankRows: 0,

  // সারির উচ্চতা (mm) — ০ মানে লেখার আকার অনুযায়ী
  rowHeight: 0,

  // কাগজের শিরোনাম — ফাঁকা রাখলে TITLE_DEFAULT
  title: '',
});

/* ───────────────────────────────────────────────────────────────────────────
   কাগজের শিরোনাম

   ⭐ উপরের পট্টিতে আগে পরীক্ষার নাম ও শিক্ষাবর্ষ বসত। কিন্তু ওটা তো
   নিচের সারিতেও বলা যায় — পট্টিটার আসল কাজ কাগজটা কী তা বলা
   ("নম্বর পত্র", "স্বাক্ষরপত্র", "মডেল টেস্টের নম্বর পত্র"…)।

   তাই এখন পট্টিতে ব্যবহারকারীর নিজের লেখা শিরোনাম বসে, আর পরীক্ষার
   নাম-বছর নেমে গেছে নিচের শ্রেণি/জামাতের সারিতে।
   ─────────────────────────────────────────────────────────────────────────── */
export const TITLE_DEFAULT = 'নম্বর পত্র';

/** পট্টিতে যা বসবে — ফাঁকা রাখলে ডিফল্ট শিরোনাম */
export const titleText = (settings) => {
  const v = settings?.title;
  return typeof v === 'string' && v.trim() ? v.trim() : TITLE_DEFAULT;
};

/** স্বাক্ষরের ঘরে যা বসবে — ফাঁকা রাখলে ডিফল্ট লেখা */
export const SIGN_DEFAULTS = {
  signLeft: 'প্রধান পরীক্ষকের স্বাক্ষর',
  signRight: 'হল পরিদর্শকের স্বাক্ষর',
};

export const signText = (settings, key) => {
  const v = settings?.[key];
  return typeof v === 'string' && v.trim() ? v.trim() : SIGN_DEFAULTS[key] || '';
};

// সেটিংস ভাষা অনুযায়ী আলাদা — ফি তালিকা যে নিয়মে রাখে
const storageKey = (languageId) => `examNumberSheet:settings:${langCode(languageId)}`;

/** সেভ করা মানটা সীমার মধ্যে আনা — localStorage আর ডেটাবেজ, দুই জায়গার জন্যই */
export const normalizeNumberSheetSettings = (saved) => {
  const fallback = defaultNumberSheetSettings();
  if (!saved || typeof saved !== 'object') return fallback;

  // মুছে ফেলা পুরোনো key ছেঁটে ফেলি, নইলে তালিকা থেকে তুলে দেওয়া ঘর
  // সেভ করা সেটিংসে রয়ে যেত
  const visible = (Array.isArray(saved.visible) ? saved.visible : []).filter((k) => fieldByKey(k));

  return {
    ...fallback,
    ...saved,
    // সব ঘর বাদ পড়লে ডিফল্টে ফিরি, নইলে ছকটা একদম ফাঁকা যেত
    visible: visible.length ? visible : fallback.visible,

    labels: saved.labels && typeof saved.labels === 'object' ? saved.labels : {},
    widths: saved.widths && typeof saved.widths === 'object' ? saved.widths : {},

    paper: paperById(saved.paper).id,
    orientation: orientationValue(saved.orientation),
    columns: columnCount(saved.columns),

    sortBy: sortKeyValue(saved.sortBy),
    sortOrder: sortOrderValue(saved.sortOrder),

    fontSize: clampFont(saved.fontSize),

    showHeader: saved.showHeader !== false,
    showLogo: saved.showLogo !== false,
    showExamBand: saved.showExamBand !== false,
    showMeta: saved.showMeta !== false,
    showExaminer: saved.showExaminer !== false,
    showFooterSign: saved.showFooterSign !== false,

    // জলছাপ ডিফল্টে বন্ধ, তাই এখানে === true দেখা হয়
    showWatermark: saved.showWatermark === true,
    watermarkOpacity: clampWatermark(saved.watermarkOpacity),

    signLeft: typeof saved.signLeft === 'string' ? saved.signLeft : '',
    signRight: typeof saved.signRight === 'string' ? saved.signRight : '',

    blankRows: clampBlankRows(saved.blankRows),
    rowHeight: clampRowHeight(saved.rowHeight),
    title: typeof saved.title === 'string' ? saved.title : '',
  };
};

/** সেভ করা সেটিংস পড়া — না থাকলে বা নষ্ট থাকলে ডিফল্ট */
export const loadNumberSheetSettings = (languageId = 1) => {
  try {
    const raw = localStorage.getItem(storageKey(languageId));
    if (!raw) return defaultNumberSheetSettings();
    return normalizeNumberSheetSettings(JSON.parse(raw));
  } catch {
    return defaultNumberSheetSettings();
  }
};

/** সেটিংস সেভ — ব্রাউজারে, তাই প্রতি ব্যবহারকারীর নিজের মতো থাকে */
export const saveNumberSheetSettings = (languageId, settings) => {
  try {
    localStorage.setItem(storageKey(languageId), JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
};

/** ঘরটা দেখাবে কি না */
export const isVisible = (settings, key) =>
  Array.isArray(settings?.visible) && settings.visible.includes(key);

/**
 * যে ঘরগুলো বসবে, সেভ করা ক্রমেই — চওড়াসহ।
 *
 * চওড়াগুলো অনুপাত, তাই যোগফল ১০০ না হলেও চলে; নিচে শতাংশে বদলে নেওয়া হয়।
 */
export const visibleFields = (settings) => {
  const order = Array.isArray(settings?.visible) ? settings.visible : [];
  const list = order.map(fieldByKey).filter(Boolean);
  const picked = list.length ? list : NUMBER_SHEET_FIELDS.filter((f) => f.defaultOn);

  // এই সাজে যতটা ধরে ততটুকুই — দুই কলামে সীমাটা কম
  return picked.slice(0, maxFieldsFor(settings?.columns));
};

/**
 * যে ঘরগুলো বসবে — বদলানো নাম ও চওড়া মিলিয়ে।
 *
 * কাগজ আর সেটিংস, দুই জায়গাতেই এইটাই ব্যবহার হয়। তাই মডালে যা দেখা
 * যায় কাগজেও ঠিক তাই বসে — দুই জায়গায় দুই রকম হিসাব নেই।
 */
export const resolveFields = (settings) =>
  visibleFields(settings).map((f) => {
    const label = settings?.labels?.[f.key];
    const width = clampWidth(settings?.widths?.[f.key]);

    return {
      ...f,
      label: typeof label === 'string' && label.trim() ? label.trim() : f.label,
      width: width ?? f.width,
    };
  });

/** ঘরগুলোর চওড়া শতাংশে — ছকের মোট চওড়া সবসময় ১০০% */
export const fieldPercents = (fields) => {
  const total = fields.reduce((sum, f) => sum + (f.width || 10), 0) || 1;
  return fields.map((f) => `${((f.width || 10) / total) * 100}%`);
};

/**
 * একটা ঘর চালু/বন্ধ — চালু করলে তালিকার নিজের জায়গায় বসে, শেষে নয়।
 *
 * সীমায় পৌঁছে গেলে নতুন ঘর আর যোগ হয় না — তালিকাটা যেমন ছিল তেমনই
 * ফেরে। চুপচাপ পুরোনো একটা ঘর কেটে দিলে ব্যবহারকারী বুঝতেই পারত না
 * কোনটা হারাল।
 */
export const toggleField = (visible, key, limit = MAX_FIELDS) => {
  const list = Array.isArray(visible) ? visible : [];
  if (list.includes(key)) return list.filter((k) => k !== key);
  if (list.length >= limit) return list;

  const order = NUMBER_SHEET_FIELDS.map((f) => f.key);
  return [...list, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

/** ঘরের নাম বদলানো — ফাঁকা দিলে ঘরের নিজের নামেই ফিরে যায় */
export const renameField = (settings, key, text) => {
  const labels = { ...(settings?.labels || {}) };
  if (String(text ?? '').trim()) labels[key] = text;
  else delete labels[key];
  return { ...settings, labels };
};

/** ঘরের চওড়া বসানো, আর null দিলে স্বয়ংক্রিয়তে ফেরা */
export const setFieldWidth = (settings, key, value) => {
  const widths = { ...(settings?.widths || {}) };
  const w = clampWidth(value);
  if (w === null) delete widths[key];
  else widths[key] = w;
  return { ...settings, widths };
};

/** টেনে এনে ক্রম বদলানো — fromKey কে toKey এর জায়গায় বসায় */
export const reorderFields = (visible, fromKey, toKey) => {
  const list = [...(visible || [])];
  const from = list.indexOf(fromKey);
  const to = list.indexOf(toKey);
  if (from < 0 || to < 0 || from === to) return list;

  list.splice(from, 1);
  list.splice(to, 0, fromKey);
  return list;
};

// ---- সারি সাজানো ----------------------------------------------------------

/**
 * সারিগুলো সাজানো।
 *
 * ⭐ মানটা সংখ্যায় এনে তুলনা করা হয় — কলামটা কোথাও স্ট্রিং হয়ে থাকে
 * ('007'), তাই শুধু অক্ষর ধরে মেলালে '10' চলে আসত '9' এর আগে।
 *
 * মান না থাকলে সারিটা সবার শেষে যায়, আরোহী-অবরোহী যাই হোক — ফাঁকা ঘর
 * উপরে উঠে এলে তালিকাটা দেখতে ভাঙাচোরা লাগে।
 */
export const sortRows = (rows, sortBy, sortOrder) => {
  const key = sortKeyValue(sortBy);
  const dir = sortOrderValue(sortOrder) === 'desc' ? -1 : 1;

  const pick = (row) => {
    const direct = row?.[key];
    const nested = row?.User?.[key];
    return direct ?? nested ?? null;
  };

  const toNum = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  return [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
    const na = toNum(pick(a));
    const nb = toNum(pick(b));

    // মান নেই এমন সারি সবসময় শেষে — ক্রম উল্টালেও
    if (na === null && nb === null) return 0;
    if (na === null) return 1;
    if (nb === null) return -1;
    if (na !== nb) return (na - nb) * dir;

    return 0;
  });
};

// ---- ছাপার সময় মান সাজানো -------------------------------------------------

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * ইংরেজি সংখ্যা → বাংলা সংখ্যা।
 *
 * ⭐ শুধু নিজেরা বানানো সংখ্যায় বসে — ক্রমিক নং, মোট, পৃষ্ঠা নং।
 * ডেটাবেজের মান (আইডি নং, ভর্তি নং) যে ভাষায় সেভ করা আছে কাগজেও ঠিক
 * সেভাবেই যায়, বদলানো হয় না।
 */
export const toBn = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

/** মান আছে কি না — 0 ও "0" যেন ফাঁকা হিসেবে না ধরা পড়ে */
export const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/**
 * সারি থেকে একটা ঘরের মান।
 *
 * দুই জায়গায় খোঁজা হয় — সারির নিজের উপরে, আর row.User এর ভেতরে। রুট
 * কোন রিপোর্টে কোন চেহারায় পাঠায় তা এক রকম নয় (কোথাও সমান, কোথাও
 * User এর ভেতরে), তাই দুইটাই দেখা হয় — নইলে এক রিপোর্টে নাম আসত,
 * অন্যটায় ঘর ফাঁকা যেত।
 */
export const cellValue = (field, row) => {
  if (!field || field.blank) return '';
  const v = row?.[field.key] ?? row?.User?.[field.key];
  return hasValue(v) ? v : '';
};