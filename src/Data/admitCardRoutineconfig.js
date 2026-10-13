// ---------------------------------------------------------------------------
// রুটিংসহ প্রবেশপত্র (Routine Card) — শুধু এই সুবিধার config
//
// admitCardConfig.js এ হাত দেওয়া হয়নি — প্রবেশপত্রের পুরোনো সব কিছু আগের
// মতোই আছে। এখানে শুধু নতুন জিনিসগুলো:
//   • রুটিং টেমপ্লেট (ROUTINE_TEMPLATES)
//   • রুটিনের টেবিলের কলাম (ROUTINE_COLUMNS)
//   • শিক্ষকের সাজানো আসন (mapAllocatedSeats)
//   • রুটিন কার্ডের প্রিন্ট লেআউট (ROUTINE_LAYOUTS)
//   • এই পর্দার নিজের লেখা (ROUTINE_UI)
//
// কার্ডের উপরের অংশটা হুবহু প্রবেশপত্রই — AdmitCardFace ই আঁকে। তাই
// "আগের সব ডাটা" এক ফোঁটাও বদলায় না; রুটিন ও আসন নিচে যোগ হয়।
// ---------------------------------------------------------------------------

import {
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_LANG,
  MM_TO_PX,
  formatAdmitDate,
  toLangDigit,
} from './admitCardConfig';

// ---------------------------------------------------------------------------
// কার্ডের মাপ
// উপরের ৪১০px প্রবেশপত্র, নিচের অংশটা রুটিন ও আসনের।
// ৫২০ × ৭৪০ ≈ A4 পোর্ট্রেট (০.৭০২৭ vs ০.৭০৭১) — তাই এক পৃষ্ঠায় সুন্দর বসে।
// ---------------------------------------------------------------------------
export const ROUTINE_CARD_W = CARD_W;              // ৫২০ — উপরের কার্ড scale ছাড়াই বসে
export const ROUTINE_CARD_H = 740;
export const ROUTINE_CARD_RATIO = ROUTINE_CARD_W / ROUTINE_CARD_H;

/** প্রবেশপত্রের নিজের মাপ — জোনের হিসাব এখান থেকেই শুরু */
export const ROUTINE_HEAD_H = CARD_H;              // ৪১০

/**
 * কার্ডের ভিতরে রুটিনের ঘর কোথায় বসবে।
 *
 * পুরো কার্ডটা একটাই বাক্স — প্রবেশপত্রের ফ্রেম, ব্যাকগ্রাউন্ড আর স্বাক্ষরের
 * সারি ৭৪০px জুড়েই থাকে (AdmitCardFace কে cardHeight দিয়ে বলা হয়)। তাই
 * রুটিন ফ্রেমের বাইরে ঝোলে না, ভিতরেই বসে।
 *
 *   ০ .......... হেডার, পরীক্ষার নাম, প্রবেশপত্র ব্যাজ
 *   bodyTop .... শিক্ষার্থীর তথ্য (ফিল্ড অনুযায়ী যতটুকু লাগে)
 *   bodyEnd .... এখান থেকে রুটিনের ঘর
 *   signTop .... স্বাক্ষর ও QR — কার্ডের নিজের সারি, আগের মতোই
 *   ৭৪০
 *
 * ফিল্ড কম হলে তথ্যের ঘর ছোট, রুটিন তত বেশি জায়গা পায়।
 */
export const getRoutineZones = ({
  template,
  fieldCount = 0,
  showSignRow = true,
} = {}) => {
  const t = template || {};
  const bodyTop = t.bodyTop ?? 165;

  // AdmitCardFace এ এক সারির সর্বোচ্চ উচ্চতা ২৬px, ফিল্ড দুই কলামে বসে
  const rows = Math.max(Math.ceil(fieldCount / 2), 1);
  const bodyEnd = Math.min(bodyTop + rows * 26 + 12, ROUTINE_CARD_H - 220);

  const signTop =
    ROUTINE_CARD_H -
    (t.bodyBottom ?? 28) -
    (showSignRow ? t.signatureHeight ?? 60 : 0);

  const top = bodyEnd + 8;
  const height = Math.max(signTop - 8 - top, 80);

  return { bodyTop, bodyEnd, top, height, signTop };
};

// ---------------------------------------------------------------------------
// A4 (রুটিনসহ) প্রবেশপত্রের টেমপ্লেট — সম্পূর্ণ আলাদা তালিকা
//
// এই তালিকার সাথে admitCardConfig.js এর ADMIT_TEMPLATES এর কোনো সম্পর্ক নেই।
// A5 মোডে ওই তালিকাটা চলে, A4 মোডে এইটা — দুইটা স্বাধীন।
//
// নতুন ডিজাইন যোগ করতে হলে ADMIT_TEMPLATES এ যেভাবে যোগ করেন ঠিক সেভাবেই
// নিচে একটা অবজেক্ট বসান। পার্থক্য শুধু একটাই — এখানে বাড়তি `table` ঘরে
// রুটিনের টেবিলের চেহারাটাও থাকে।
//
//   {
//     id: 'r6',
//     title: 'রুটিন — আমার ডিজাইন',
//     variant: 'image',                  // বা 'painted'
//     image: '/admitcard/routine-1.png', // variant: 'image' হলে
//     thumb: '/admitcard/routine-1.png',
//     nameColor, addressColor, valueColor, labelColor, accent, …
//     ...R_ZONES, ...R_PHOTO,            // হেডার, ফিল্ড ও স্বাক্ষরের জোন
//     table: { … },                      // রুটিনের টেবিলের রঙ
//   }
//
// `table` এর ঘরগুলো:
//   tableStyle  'grid' → প্রতিটা ঘরে বর্ডার, হেডারে রঙিন পট্টি
//               'lines' → শুধু আড়াআড়ি রেখা, ছিমছাম চেহারা
//   headBg/headColor  টেবিলের হেডার সারি
//   borderColor       টেবিলের বাইরের রেখা ও শিরোনামের নিচের দাগ
//   gridColor         ভিতরের হালকা রেখা
//   titleBg/titleColor  "পরীক্ষার রুটিন" শিরোনামের পট্টি ('none' = পট্টি নেই)
//   zebra             এক সারি পরপর হালকা রঙ
//   seatBg/seatColor  আসনের পট্টি
//
// রঙের ঘর (color picker) থেকে কোনো রঙ বাছলে সেটা এই `table` এর উপরে বসে —
// তখন সব টেমপ্লেটের টেবিলই এক রঙে চলে আসে। কার্ডের ফ্রেম, হেডার বা ব্যাজে
// হাত পড়ে না, সেগুলো টেমপ্লেটের নিজের রঙেই থাকে।
// ---------------------------------------------------------------------------

// জোনগুলো A5 কার্ডের মতোই, শুধু কার্ডটা লম্বা (৭৪০px) — নিচের খালি
// জায়গাটাতেই রুটিন বসে। getRoutineZones() এই মাপগুলোই পড়ে।
const R_ZONES = {
  headerHeight: 115,
  examTop: 90,
  examHeight: 20,
  examNameSize: 13,
  bodyTop: 165,
  signatureHeight: 62,
  bodyBottom: 35,
  logoOffsetY: 0,
  photoOffsetY: 0,
};

const R_PHOTO = { photoW: 58, photoH: 74 };
const R_QR_SIZE = 56;

export const ROUTINE_CARD_TEMPLATES = [
  {
    id: 'r1',
    title: 'রুটিন — সাদা',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'hairline',
    frameColor: '#1f2937',
    headerFill: 'none',
    headerDivider: 2,
    ribbonStyle: 'outline',
    ribbonColor: '#111827',
    nameColor: '#111827',
    addressColor: '#4b5563',
    nameSize: 23,
    addressSize: 13,
    valueColor: '#111827',
    labelColor: '#4b5563',
    accent: '#111827',
    examNameColor: '#374151',
    photoBorder: '#9ca3af',
    signLineColor: '#111827',
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: R_QR_SIZE,
    qrPad: 'transparent',
    ...R_ZONES,
    ...R_PHOTO,
    table: {
      tableStyle: 'grid',
      headBg: '#f3f4f6',
      headColor: '#111827',
      borderColor: '#9ca3af',
      gridColor: '#d1d5db',
      titleColor: '#111827',
      titleBg: 'none',
      zebra: '#fafafa',
      seatBg: '#f9fafb',
      seatColor: '#111827',
    },
  },

  {
    id: 'r2',
    title: 'রুটিন — মেরুন',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'double',
    frameColor: '#7b1f2b',
    headerFill: 'none',
    headerDivider: 1,
    ribbonStyle: 'solid',
    ribbonBg: '#7b1f2b',
    ribbonColor: '#ffffff',
    nameColor: '#7b1f2b',
    addressColor: '#6b5257',
    nameSize: 23,
    addressSize: 13,
    valueColor: '#241014',
    labelColor: '#7b1f2b',
    accent: '#7b1f2b',
    examNameColor: '#6b5257',
    photoBorder: '#7b1f2b',
    signLineColor: '#7b1f2b',
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: R_QR_SIZE,
    qrPad: 'transparent',
    ...R_ZONES,
    ...R_PHOTO,
    table: {
      tableStyle: 'grid',
      headBg: '#7b1f2b',
      headColor: '#ffffff',
      borderColor: '#7b1f2b',
      gridColor: '#e3c9cd',
      titleColor: '#7b1f2b',
      titleBg: '#fdf2f3',
      zebra: '#fdf7f8',
      seatBg: '#fdf2f3',
      seatColor: '#7b1f2b',
    },
  },

  {
    id: 'r3',
    title: 'রুটিন — নীল',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'hairline',
    frameColor: '#1e3a8a',
    headerFill: 'none',
    headerDivider: 2,
    ribbonStyle: 'outline',
    ribbonColor: '#1e3a8a',
    nameColor: '#1e3a8a',
    addressColor: '#475569',
    nameSize: 23,
    addressSize: 13,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#1e3a8a',
    examNameColor: '#1e3a8a',
    photoBorder: '#1e3a8a',
    signLineColor: '#1e3a8a',
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: R_QR_SIZE,
    qrPad: 'transparent',
    ...R_ZONES,
    ...R_PHOTO,
    table: {
      tableStyle: 'grid',
      headBg: '#1e3a8a',
      headColor: '#ffffff',
      borderColor: '#1e3a8a',
      gridColor: '#c7d2fe',
      titleColor: '#1e3a8a',
      titleBg: '#eff6ff',
      zebra: '#f5f8ff',
      seatBg: '#eff6ff',
      seatColor: '#1e3a8a',
    },
  },

  {
    id: 'r4',
    title: 'রুটিন — সবুজ',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'edgebars',
    frameColor: '#0f5132',
    headerFill: 'none',
    headerDivider: 0,
    ribbonStyle: 'outline',
    ribbonColor: '#0f5132',
    nameColor: '#0f5132',
    addressColor: '#4b5563',
    nameSize: 23,
    addressSize: 13,
    valueColor: '#14261c',
    labelColor: '#0f5132',
    accent: '#0f5132',
    examNameColor: '#0f5132',
    photoBorder: '#0f5132',
    signLineColor: '#0f5132',
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: R_QR_SIZE,
    qrPad: 'transparent',
    ...R_ZONES,
    ...R_PHOTO,
    table: {
      tableStyle: 'grid',
      headBg: '#0f5132',
      headColor: '#ffffff',
      borderColor: '#0f5132',
      gridColor: '#bbf7d0',
      titleColor: '#0f5132',
      titleBg: '#f0fdf4',
      zebra: '#f6fdf8',
      seatBg: '#f0fdf4',
      seatColor: '#0f5132',
    },
  },

  {
    // খোপ কাটা ছক না — শুধু আড়াআড়ি রেখা। হালকা, ছিমছাম চেহারা।
    id: 'r5',
    title: 'রুটিন — সরল রেখা',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'hairline',
    frameColor: '#111827',
    headerFill: 'none',
    headerDivider: 1,
    ribbonStyle: 'outline',
    ribbonColor: '#111827',
    nameColor: '#111827',
    addressColor: '#4b5563',
    nameSize: 23,
    addressSize: 13,
    valueColor: '#111827',
    labelColor: '#4b5563',
    accent: '#111827',
    examNameColor: '#374151',
    photoBorder: '#9ca3af',
    signLineColor: '#111827',
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: R_QR_SIZE,
    qrPad: 'transparent',
    ...R_ZONES,
    ...R_PHOTO,
    table: {
      tableStyle: 'lines',
      headBg: 'transparent',
      headColor: '#111827',
      borderColor: '#111827',
      gridColor: '#d1d5db',
      titleColor: '#111827',
      titleBg: 'none',
      zebra: '#ffffff',
      seatBg: '#ffffff',
      seatColor: '#111827',
    },
  },
];

/** পুরোনো নাম — অন্য ফাইলে import থাকলে ভাঙবে না */
export const ROUTINE_TEMPLATES = ROUTINE_CARD_TEMPLATES;

export const getRoutineTemplate = (id) =>
  ROUTINE_CARD_TEMPLATES.find((t) => String(t.id) === String(id)) ||
  ROUTINE_CARD_TEMPLATES[0];

/**
 * আইডিটা চেনা A4 টেমপ্লেট কি না।
 * রুটিন চালু/বন্ধ এখন আর এটা দিয়ে ঠিক হয় না — সেটা ঠিক করে A5/A4 মোড
 * (admitCardConfig.js এর isRoutineMode)। এটা কেবল আইডি যাচাইয়ের জন্য।
 */
export const isRoutineOn = (id) =>
  Boolean(id) && ROUTINE_CARD_TEMPLATES.some((t) => String(t.id) === String(id));

// ---------------------------------------------------------------------------
// রুটিনের রঙ
//
// ব্যবহারকারী একটা রঙ বাছলে সেটা থেকেই টেবিলের পুরো স্কিনটা বানিয়ে নেওয়া হয় —
// হেডারের পট্টি ওই রঙ, ভিতরের রেখা তার হালকা আভা, জেব্রা সারি আরও হালকা।
// একটাই রঙ, তাই যে টেমপ্লেটই বাছুন টেবিলের চেহারা একই থাকে।
//
// রঙ না বাছলে (null) টেমপ্লেটের নিজের `table` টাই অটুট থাকে।
// ---------------------------------------------------------------------------

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** '#7b1f2b' বা '7b1f2b' বা '#abc' → { r, g, b }; বুঝতে না পারলে null */
export const parseHex = (value) => {
  const m = String(value ?? '').trim().match(HEX);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

const toHex = ({ r, g, b }) =>
  '#' +
  [r, g, b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0'))
    .join('');

/** রঙটাকে সাদার দিকে টানে — amount ০ মানে অপরিবর্তিত, ১ মানে পুরো সাদা */
export const tintWhite = (value, amount) => {
  const c = parseHex(value);
  if (!c) return value;
  const k = Math.max(0, Math.min(1, amount));
  return toHex({
    r: c.r + (255 - c.r) * k,
    g: c.g + (255 - c.g) * k,
    b: c.b + (255 - c.b) * k,
  });
};

/** রঙটার উপরে সাদা না কালো লেখা পড়া যাবে — আপেক্ষিক উজ্জ্বলতা দিয়ে */
export const readableOn = (value) => {
  const c = parseHex(value);
  if (!c) return '#ffffff';
  const lum = (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
  return lum > 0.62 ? '#111827' : '#ffffff';
};

/** রঙের ঘরে যে কয়টা তৈরি রঙ দেখাবে */
export const ROUTINE_COLOR_PRESETS = [
  '#111827',
  '#7b1f2b',
  '#1e3a8a',
  '#0f5132',
  '#115e59',
  '#92400e',
  '#5b21b6',
  '#b91c1c',
];

/**
 * টেবিলের হেডার ছাপার উপযোগী করা।
 *
 * আগে হেডারের পট্টি ছিল গাঢ় রঙ আর লেখা সাদা। পর্দায় সুন্দর, কিন্তু ছাপার
 * সময় ব্রাউজারের "Background graphics" বন্ধ থাকলে (ক্রোমে ওটা ডিফল্টে
 * বন্ধই থাকে) পট্টিটা ছাপা হতো না — তখন সাদা কাগজে সাদা লেখা, মানে
 * হেডারের কলামের নামগুলো একদম উধাও।
 *
 * তাই উল্টে দেওয়া হলো: পট্টি হালকা আভা, লেখা গাঢ় রঙে। ব্যাকগ্রাউন্ড
 * ছাপা হোক বা না হোক — লেখা দুই ক্ষেত্রেই পড়া যায়।
 */
export const makeHeadPrintSafe = (table) => {
  const base = table || {};
  const bg = parseHex(base.headBg);
  if (!bg) return base;                 // 'transparent' ('lines' স্টাইল) — কিছু করার নেই

  const lum = (c) => (0.299 * c.r + 0.587 * c.g + 0.114 * c.b) / 255;
  const fg = parseHex(base.headColor);
  if (fg && lum(fg) < 0.7) return base; // লেখা আগে থেকেই গাঢ় — হাত দেওয়ার দরকার নেই

  return {
    ...base,
    headBg: tintWhite(base.headBg, 0.88),
    headColor: base.headBg,
  };
};

/**
 * টেমপ্লেটের টেবিল-স্কিন + বাছা রঙ → চূড়ান্ত স্কিন।
 * রঙ না দিলে টেমপ্লেটের নিজেরটাই ফেরত যায় (হেডারটা ছাপার উপযোগী করে)।
 */
export const buildRoutineTable = (table, color) => {
  const base = table || ROUTINE_CARD_TEMPLATES[0].table;
  if (!parseHex(color)) return makeHeadPrintSafe(base);

  const lines = base.tableStyle === 'lines';

  return {
    ...base,
    // গাঢ় পট্টি + সাদা লেখা নয় — হালকা আভা + গাঢ় লেখা, যাতে ছাপায়
    // ব্যাকগ্রাউন্ড বাদ পড়লেও কলামের নাম পড়া যায়
    headBg: lines ? 'transparent' : tintWhite(color, 0.88),
    headColor: color,
    borderColor: color,
    gridColor: tintWhite(color, 0.7),
    titleColor: color,
    titleBg: base.titleBg === 'none' ? 'none' : tintWhite(color, 0.93),
    zebra: lines ? '#ffffff' : tintWhite(color, 0.95),
    seatBg: lines ? '#ffffff' : tintWhite(color, 0.93),
    seatColor: color,
  };
};

/** টেমপ্লেট + রঙ → কার্ডের ডিজাইন আর টেবিলের স্কিন, দুইটা আলাদা করে */
export const resolveRoutineTemplate = (id, color) => {
  const tpl = getRoutineTemplate(id);
  return { card: tpl, table: buildRoutineTable(tpl.table, color) };
};

// ---------------------------------------------------------------------------
// রুটিনের টেবিলের কলাম
// width = 0 হলে বাকি জায়গা ওই কলামই নেয় (বিষয়ের নাম লম্বা হয়)
// ---------------------------------------------------------------------------
export const ROUTINE_COLUMNS = [
  {
    id: 'serial',
    label: 'ক্রম',
    name: 'SL',
    nameAr: 'م',
    width: 40,
    align: 'center',
  },
  { id: 'date', label: 'তারিখ', name: 'Date', nameAr: 'التاريخ', width: 96 },
  { id: 'day', label: 'বার', name: 'Day', nameAr: 'اليوم', width: 76 },
  { id: 'subject', label: 'বিষয়', name: 'Subject', nameAr: 'المادة', width: 0 },
  {
    id: 'time',
    label: 'সময়',
    name: 'Time',
    nameAr: 'الوقت',
    width: 112,
    align: 'center',
  },
  {
    // কক্ষে সাধারণত ছোট নম্বর বসে, তাই চওড়া কম — তাতে বিষয়ের নামের
    // কলামটা একটু বেশি জায়গা পায়
    id: 'room',
    label: 'কক্ষ',
    name: 'Room',
    nameAr: 'القاعة',
    width: 48,
    align: 'center',
  },
];

export const DEFAULT_ROUTINE_COLUMNS = ['serial', 'date', 'day', 'subject', 'time', 'room'];

/** এক কার্ডে সর্বোচ্চ কতটা পরীক্ষার সারি — Exam_RoutineLand ও ১৪ ঘর রাখে */
export const MAX_ROUTINE_ROWS = 14;

export const getRoutineColumn = (id) =>
  ROUTINE_COLUMNS.find((c) => c.id === id) || null;

export const getRoutineColumnLabel = (id, lang) => {
  const col = getRoutineColumn(id);
  if (!col) return '';
  if (lang === 'en') return col.name;
  if (lang === 'ar') return col.nameAr;
  return col.label;
};

/** নির্বাচিত কলামগুলো ROUTINE_COLUMNS এর ক্রমেই সাজিয়ে দেয় */
export const orderRoutineColumns = (ids = []) =>
  ROUTINE_COLUMNS.filter((c) => ids.includes(c.id));

// ---------------------------------------------------------------------------
// বার ও সময়
// DB তে বার সাধারণত বাংলায় থাকে — ইংরেজি/আরবি কার্ডের জন্য অভিধান
// ---------------------------------------------------------------------------

const normalizeKey = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '');

const DAY_TRANSLATIONS = {
  শনিবার: { en: 'Saturday', ar: 'السبت' },
  রবিবার: { en: 'Sunday', ar: 'الأحد' },
  সোমবার: { en: 'Monday', ar: 'الإثنين' },
  মঙ্গলবার: { en: 'Tuesday', ar: 'الثلاثاء' },
  বুধবার: { en: 'Wednesday', ar: 'الأربعاء' },
  বৃহস্পতিবার: { en: 'Thursday', ar: 'الخميس' },
  শুক্রবার: { en: 'Friday', ar: 'الجمعة' },
  saturday: { en: 'Saturday', ar: 'السبت' },
  sunday: { en: 'Sunday', ar: 'الأحد' },
  monday: { en: 'Monday', ar: 'الإثنين' },
  tuesday: { en: 'Tuesday', ar: 'الثلاثاء' },
  wednesday: { en: 'Wednesday', ar: 'الأربعاء' },
  thursday: { en: 'Thursday', ar: 'الخميس' },
  friday: { en: 'Friday', ar: 'الجمعة' },
  sat: { en: 'Saturday', ar: 'السبت' },
  sun: { en: 'Sunday', ar: 'الأحد' },
  mon: { en: 'Monday', ar: 'الإثنين' },
  tue: { en: 'Tuesday', ar: 'الثلاثاء' },
  wed: { en: 'Wednesday', ar: 'الأربعاء' },
  thu: { en: 'Thursday', ar: 'الخميس' },
  fri: { en: 'Friday', ar: 'الجمعة' },
};

const DAY_LOOKUP = new Map(
  Object.entries(DAY_TRANSLATIONS).map(([k, v]) => [normalizeKey(k), v])
);

export const translateRoutineDay = (value, lang) => {
  if (!value && value !== 0) return '';
  if (lang === 'bn' || !lang) return String(value);
  const hit = DAY_LOOKUP.get(normalizeKey(value));
  return hit?.[lang] ?? String(value);
};

/** "১০:০০ - ০১:০০" — AM/PM লেখা থাকলে সেটা অটুট থাকে, শুধু অঙ্ক বদলায় */
export const formatRoutineTime = (start, end, lang) => {
  const a = start === null || start === undefined ? '' : String(start).trim();
  const b = end === null || end === undefined ? '' : String(end).trim();
  if (!a && !b) return '';
  if (a && b) return `${toLangDigit(a, lang)} - ${toLangDigit(b, lang)}`;
  return toLangDigit(a || b, lang);
};

/** বাংলা কার্ডে BnExamDate থাকলে সেটাই, নইলে তারিখ ফরম্যাট করা হয় */
export const formatRoutineDate = (row = {}, lang) => {
  if ((lang === 'bn' || !lang) && row.bnDate && String(row.bnDate).trim()) {
    return String(row.bnDate).trim();
  }
  return formatAdmitDate(row.date, lang);
};

// ---------------------------------------------------------------------------
// রুটিনের সারি
//
// সার্ভার দুই শেপেই পাঠাতে পারে:
//   • routine      → Exam_Routine এর সারি (প্রতি বিষয়ে একটা)
//   • routineLand  → Exam_RoutineLand এর চওড়া সারি (Date1..14 / Sub1..14)
// Exam_Routine থাকলে সেটাই জেতে; না থাকলে চওড়া সারিটা ভেঙে নেওয়া হয়।
// ---------------------------------------------------------------------------

const firstFilled = (obj = {}, keys = []) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== null && v !== undefined && String(v).trim() !== '') return v;
  }
  return '';
};

/** বিষয়ের নাম — ভাষা অনুযায়ী, না পেলে মূল নাম */
export const getRoutineSubject = (row = {}, lang) => {
  if (lang === 'en') {
    return (
      firstFilled(row, ['SubjectNameEng', 'subjectEng']) ||
      firstFilled(row, ['SubjectName', 'subject'])
    );
  }
  if (lang === 'ar') {
    return (
      firstFilled(row, ['SubjectNameAra', 'subjectAra']) ||
      firstFilled(row, ['SubjectName', 'subject'])
    );
  }
  return firstFilled(row, ['SubjectName', 'subject']);
};

const landRows = (land = {}) => {
  const total = Number(land.TotalColumn) || MAX_ROUTINE_ROWS;
  const count = Math.min(Math.max(total, 0), MAX_ROUTINE_ROWS);
  const out = [];

  for (let i = 1; i <= count; i += 1) {
    const date = land[`Date${i}`];
    const day = land[`Day${i}`];
    const subId = land[`Sub${i}`];
    const start = land[`Time${i}`] ?? land.StartTime;
    const end = land[`EndTime${i}`] ?? land.EndTime;

    const empty =
      (date === null || date === undefined || String(date).trim() === '') &&
      (subId === null || subId === undefined || String(subId).trim() === '');

    if (empty) continue;

    out.push({
      serial: out.length + 1,
      date: date ?? '',
      bnDate: '',
      day: day ?? '',
      startTime: start ?? '',
      endTime: end ?? '',
      room: '',
      SubID: subId ?? null,
      // নাম সার্ভার বসিয়ে দেয় (Sub{i}Name), নইলে ফাঁকা
      SubjectName: land[`Sub${i}Name`] ?? '',
      SubjectNameEng: land[`Sub${i}NameEng`] ?? '',
      SubjectNameAra: land[`Sub${i}NameAra`] ?? '',
    });
  }

  return out;
};

/** API রেসপন্সকে কার্ডে বসানোর মতো সারিতে আনে */
export const normalizeRoutineRows = (payload = {}) => {
  if (Array.isArray(payload)) {
    return payload
      .slice(0, MAX_ROUTINE_ROWS)
      .map((r, i) => ({ ...r, serial: r.serial ?? i + 1 }));
  }

  const direct = Array.isArray(payload?.routine) ? payload.routine : [];
  if (direct.length) {
    return direct
      .slice(0, MAX_ROUTINE_ROWS)
      .map((r, i) => ({
        serial: r.serial ?? i + 1,
        date: r.date ?? r.ExamDate ?? '',
        bnDate: r.bnDate ?? r.BnExamDate ?? '',
        day: r.day ?? r.ExamDay ?? '',
        startTime: r.startTime ?? r.StartTime ?? '',
        endTime: r.endTime ?? r.EndTime ?? '',
        room: r.room ?? r.RoomName ?? r.RoomNo ?? '',
        SubID: r.SubID ?? null,
        SubjectName: r.SubjectName ?? '',
        SubjectNameEng: r.SubjectNameEng ?? '',
        SubjectNameAra: r.SubjectNameAra ?? '',
      }));
  }

  const land = payload?.routineLand;
  if (land && typeof land === 'object') return landRows(land);

  return [];
};

/** একটা সারির একটা কলামের লেখা */
export const getRoutineCell = (row = {}, columnId, lang) => {
  switch (columnId) {
    case 'serial':
      return toLangDigit(row.serial, lang);
    case 'date':
      return formatRoutineDate(row, lang);
    case 'day':
      return translateRoutineDay(row.day, lang);
    case 'subject':
      return getRoutineSubject(row, lang);
    case 'time':
      return formatRoutineTime(row.startTime, row.endTime, lang);
    case 'room':
      return toLangDigit(row.room, lang);
    default:
      return '';
  }
};

// ---------------------------------------------------------------------------
// হল — কলাম ও সারি
//
// Exam_HallColumns  → এক হলের কলামগুলো (ColumnIndex, Label)
// Exam_Hall_Rows    → প্রতি কলামের সারি (RowIndex, RowLabel, Seats)
//
// ⚠️ এই ছকটা এখন কেবল দেখানোর জন্য — "এই হলে কয়টা কলাম, মোট কত আসন"।
// কে কোন আসনে তা আর এখান থেকে বের করা হয় না, সেটা সিট প্ল্যানের কাজ।
// ---------------------------------------------------------------------------

const toIndex = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const buildHallGrid = (payload = {}) => {
  const columns = Array.isArray(payload?.hallColumns) ? payload.hallColumns : [];
  const rows = Array.isArray(payload?.hallRows) ? payload.hallRows : [];

  const rowsByColumn = new Map();
  rows.forEach((r) => {
    const key = String(r.ColumnID ?? r.columnId ?? '');
    if (!rowsByColumn.has(key)) rowsByColumn.set(key, []);
    rowsByColumn.get(key).push({
      rowId: r.RowID ?? r.rowId ?? null,
      index: toIndex(r.RowIndex ?? r.rowIndex, 0),
      label: r.RowLabel ?? r.rowLabel ?? '',
      seats: Math.max(Number(r.Seats ?? r.seats) || 0, 0),
    });
  });

  const out = columns
    .map((c, i) => {
      const key = String(c.ColumnID ?? c.columnId ?? '');
      const colRows = (rowsByColumn.get(key) || [])
        .slice()
        .sort((a, b) => a.index - b.index);

      return {
        columnId: c.ColumnID ?? c.columnId ?? null,
        index: toIndex(c.ColumnIndex ?? c.columnIndex, i + 1),
        label: c.Label ?? c.label ?? '',
        rows: colRows,
        seats: colRows.reduce((sum, r) => sum + r.seats, 0),
      };
    })
    .sort((a, b) => a.index - b.index);

  return {
    hallId: payload?.hall?.HallID ?? payload?.hall?.hallId ?? null,
    hallName: payload?.hall?.HallName ?? payload?.hall?.hallName ?? '',
    columns: out,
    totalSeats: out.reduce((sum, c) => sum + c.seats, 0),
  };
};

/**
 * ⚠️ এই ফাংশনটা কার্ডে আর ব্যবহার হয় না।
 *
 * আগে হলের ছক ধরে ক্রমানুসারে আসন বসানো হতো, কিন্তু শিক্ষক সিট প্ল্যানে যা
 * সাজান তার সাথে ওটা মিলত না — সবাই কলাম ১, সারি ১, আসন ১ থেকে শুরু হতো।
 * এখন আসনের একমাত্র উৎস Exam_SitAllocation (নিচের mapAllocatedSeats)।
 * বরাদ্দ না থাকলে আর অনুমান করা হয় না; কার্ডে সরাসরি "সিট প্ল্যান তৈরি করা
 * হয়নি" লেখা বসে — ভুল আসন ছাপার চেয়ে কিছু না ছাপাই ভালো।
 *
 * অন্য কোনো পর্দায় import থাকতে পারে, তাই ফাংশনটা মুছে ফেলা হয়নি।
 */
export const assignHallSeats = (students = [], grid = {}) => {
  const seats = new Map();
  const columns = Array.isArray(grid?.columns) ? grid.columns : [];
  if (!students.length || !columns.length) return seats;

  let ci = 0;
  let ri = 0;
  let si = 1;

  for (const student of students) {
    // খালি কলাম/সারি এড়িয়ে পরের ভরাটা খোঁজা
    let guard = 0;
    while (guard < 10000) {
      guard += 1;
      const col = columns[ci];
      if (!col) break;
      const row = col.rows?.[ri];
      if (!row || row.seats <= 0) {
        ri += 1;
        si = 1;
        if (ri >= (col.rows?.length || 0)) {
          ci += 1;
          ri = 0;
        }
        continue;
      }
      if (si > row.seats) {
        ri += 1;
        si = 1;
        if (ri >= (col.rows?.length || 0)) {
          ci += 1;
          ri = 0;
        }
        continue;
      }
      break;
    }

    const col = columns[ci];
    const row = col?.rows?.[ri];
    if (!col || !row) break;

    const key = student?.AdmissionID ?? student?.UserID ?? student?.StudentCode;
    if (key !== null && key !== undefined) {
      seats.set(String(key), {
        hallName: grid.hallName || '',
        columnLabel: col.label || String(col.index),
        rowLabel: row.label || String(row.index),
        seatNo: si,
      });
    }
    si += 1;
  }

  return seats;
};

// ---------------------------------------------------------------------------
// 👇 শিক্ষকের সাজানো আসন — Exam_SitAllocation
//
// কার্ডে আসনের একমাত্র উৎস। সার্ভার `seatAllocations` এ প্রতি শিক্ষার্থীর
// হল, কলাম, সারি ও আসন নম্বর পাঠায় — এখানে শুধু কার্ডের সারির সাথে
// মেলানো হয়, কোনো হিসাব হয় না।
// ---------------------------------------------------------------------------

/**
 * UserCode মেলানোর জন্য স্বাভাবিক রূপ।
 * DB তে UserCode int, কার্ডের সারিতে স্ট্রিং ('00135') আসতে পারে —
 * দুইটাকে এক রূপে এনে তবেই মেলানো হয়, নইলে কোনো মিলই হতো না।
 */
const normalizeUserCode = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  if (!text) return '';
  const num = Number(text);
  return Number.isFinite(num) ? String(num) : text;
};

/**
 * বরাদ্দের তালিকা → কার্ডে বসানোর Map।
 * key = AdmissionID, নইলে UserID, নইলে StudentCode।
 * যার বরাদ্দ নেই তার জন্য Map এ কিছুই থাকে না — কার্ডে তখন বার্তা বসে।
 */
export const mapAllocatedSeats = (students = [], payload = {}) => {
  const seats = new Map();
  const list = Array.isArray(payload?.seatAllocations) ? payload.seatAllocations : [];
  if (!list.length || !students.length) return seats;

  const byCode = new Map();
  list.forEach((a) => {
    const code = normalizeUserCode(a?.UserCode ?? a?.userCode);
    if (!code || byCode.has(code)) return;   // একই জনের একাধিক সারি হলে প্রথমটা
    byCode.set(code, {
      hallName: a.hallName || '',
      columnLabel: a.columnLabel || (a.ColumnID != null ? String(a.ColumnID) : ''),
      rowLabel: a.rowLabel || (a.RowID != null ? String(a.RowID) : ''),
      seatNo: a.seatNo ?? a.SeatNum ?? null,
    });
  });

  students.forEach((s) => {
    const code = normalizeUserCode(s?.StudentCode ?? s?.UserCode);
    const hit = code ? byCode.get(code) : null;
    if (!hit) return;
    const key = s?.AdmissionID ?? s?.UserID ?? s?.StudentCode;
    if (key !== null && key !== undefined) seats.set(String(key), hit);
  });

  return seats;
};

/** কার্ডে এক লাইনে আসনের লেখা */
export const formatSeatLine = (seat, lang, texts = {}) => {
  if (!seat) return '';
  const parts = [];
  if (seat.hallName) parts.push(`${texts.hall || 'হল'}: ${seat.hallName}`);
  if (seat.columnLabel) {
    parts.push(`${texts.column || 'কলাম'}: ${toLangDigit(seat.columnLabel, lang)}`);
  }
  if (seat.rowLabel) {
    parts.push(`${texts.row || 'সারি'}: ${toLangDigit(seat.rowLabel, lang)}`);
  }
  if (seat.seatNo) {
    parts.push(`${texts.seat || 'আসন'}: ${toLangDigit(seat.seatNo, lang)}`);
  }
  return parts.join('   •   ');
};

// ---------------------------------------------------------------------------
// প্রিন্ট লেআউট — রুটিন কার্ড লম্বা, তাই প্রবেশপত্রের লেআউট এখানে চলে না
// ---------------------------------------------------------------------------

// A4 ও Letter — দুইটার ভিতরেই পড়ে এমন নিরাপদ মাপ।
// কারণ ও ব্যাখ্যা admitCardConfig.js এর PRINT_PAGES এ।
export const ROUTINE_PAGES = {
  'A4 portrait': { w: 210, h: 279.4 },
  'A4 landscape': { w: 279.4, h: 210 },
};

export const ROUTINE_LAYOUTS = {
  1: {
    cols: 1,
    rows: 1,
    page: 'A4 portrait',
    margin: 0,
    gap: 0,
    labels: {
      bn: 'A4 পোর্ট্রেটে ১টি',
      en: '1 per A4 portrait',
      ar: 'بطاقة واحدة في ورقة A4 طولية',
    },
  },
  2: {
    cols: 2,
    rows: 1,
    page: 'A4 landscape',
    margin: 0,
    gap: 6,
    labels: {
      bn: 'A4 ল্যান্ডস্কেপে ২টি',
      en: '2 per A4 landscape',
      ar: 'بطاقتان في ورقة A4 عرضية',
    },
  },
};

export const getRoutineLayoutLabel = (type, lang) => {
  const l = ROUTINE_LAYOUTS[type] || ROUTINE_LAYOUTS[1];
  return l.labels[lang] ?? l.labels.bn;
};

export const getRoutineLayout = (type, { stretch = true } = {}) => {
  const base = ROUTINE_LAYOUTS[type] || ROUTINE_LAYOUTS[1];
  const paper = ROUTINE_PAGES[base.page] || ROUTINE_PAGES['A4 portrait'];

  const contentW = paper.w - base.margin * 2;
  const contentH = paper.h - base.margin * 2;

  const slotW = (contentW - base.gap * (base.cols - 1)) / base.cols;
  const slotH = (contentH - base.gap * (base.rows - 1)) / base.rows;

  const cellW = stretch ? slotW : Math.min(slotW, slotH * ROUTINE_CARD_RATIO);
  const cellH = stretch ? slotH : cellW / ROUTINE_CARD_RATIO;

  return {
    ...base,
    perPage: base.cols * base.rows,
    paperW: paper.w,
    paperH: paper.h,
    contentW,
    contentH,
    cellW,
    cellH,
    scaleX: (cellW * MM_TO_PX) / ROUTINE_CARD_W,
    scaleY: (cellH * MM_TO_PX) / ROUTINE_CARD_H,
    scale: (cellW * MM_TO_PX) / ROUTINE_CARD_W,
    stretch,
  };
};

// ---------------------------------------------------------------------------
// এই সুবিধার নিজের লেখা — তিন ভাষায়
// (প্রবেশপত্রের ADMIT_UI এ হাত দেওয়া হয়নি, তাই নতুন লেখা এখানে)
// ---------------------------------------------------------------------------

export const ROUTINE_UI = {
  bn: {
    routineTitle: 'পরীক্ষার রুটিন',
    routineOff: 'রুটিং বন্ধ',
    routineOffNote: 'শুধু সাধারণ প্রবেশপত্র ছাপা হবে।',
    pickRoutineTemplate: 'রুটিং টেমপ্লেট নির্বাচন করুন',
    routineColumns: 'রুটিনে কোন কলাম থাকবে',
    routineRows: 'রুটিনের সারি',
    hallSetup: 'হল, কলাম ও সারি',
    hallSelect: 'হল নির্বাচন',
    seatLine: 'কার্ডে আসন দেখাও',
    seatMap: 'আসন ছক দেখাও',
    seatMapTitle: 'আসন বিন্যাস',
    hall: 'হল',
    column: 'কলাম',
    row: 'সারি',
    seat: 'আসন',
    seats: 'আসন সংখ্যা',
    totalSeats: 'মোট আসন',
    noRoutine: 'এই পরীক্ষার কোনো রুটিন পাওয়া যায়নি।',
    noRoutineHint: 'রুটিন এন্ট্রি থেকে আগে পরীক্ষার তারিখ ও বিষয় যোগ করুন।',
    noHall: 'এই হলের কলাম ও সারি পাওয়া যায়নি।',
    routineReady: 'রুটিন পাওয়া গেছে',
    routineReportType: 'রুটিন কাগজের ধরণ',
    pickRoutineColTitle: 'কোনো কলাম নির্বাচন করা হয়নি',
    pickRoutineColText: 'রুটিনে অন্তত একটি কলাম রাখুন।',
    routinePreview: 'রুটিনসহ প্রিভিউ',
    routineActive: 'চালু',
    // 👇 সিট প্ল্যান — আসন একমাত্র এখান থেকেই আসে
    noSeatPlan: 'সিট প্ল্যান তৈরি করা হয়নি',
    seatPlanReady: 'সিট প্ল্যান পাওয়া গেছে',
    seatPlanRows: 'জনের আসন',
  },
  en: {
    routineTitle: 'Exam Routine',
    routineOff: 'Routing off',
    routineOffNote: 'Only the plain admit card will print.',
    pickRoutineTemplate: 'Select a routing template',
    routineColumns: 'Columns on the routine',
    routineRows: 'Routine rows',
    hallSetup: 'Hall, columns & rows',
    hallSelect: 'Select hall',
    seatLine: 'Show seat on card',
    seatMap: 'Show seating map',
    seatMapTitle: 'Seating plan',
    hall: 'Hall',
    column: 'Column',
    row: 'Row',
    seat: 'Seat',
    seats: 'Seats',
    totalSeats: 'Total seats',
    noRoutine: 'No routine found for this exam.',
    noRoutineHint: 'Add exam dates and subjects from routine entry first.',
    noHall: 'No columns or rows found for this hall.',
    routineReady: 'Routine found',
    routineReportType: 'Routine paper type',
    pickRoutineColTitle: 'No column selected',
    pickRoutineColText: 'Keep at least one column on the routine.',
    routinePreview: 'Preview with routine',
    routineActive: 'On',
    noSeatPlan: 'Seat plan not created yet',
    seatPlanReady: 'Seat plan found',
    seatPlanRows: 'students seated',
  },
  ar: {
    routineTitle: 'جدول الامتحان',
    routineOff: 'التوجيه مغلق',
    routineOffNote: 'ستُطبع بطاقة الدخول العادية فقط.',
    pickRoutineTemplate: 'اختر قالب التوجيه',
    routineColumns: 'أعمدة الجدول',
    routineRows: 'صفوف الجدول',
    hallSetup: 'القاعة والأعمدة والصفوف',
    hallSelect: 'اختر القاعة',
    seatLine: 'إظهار المقعد على البطاقة',
    seatMap: 'إظهار مخطط المقاعد',
    seatMapTitle: 'مخطط الجلوس',
    hall: 'القاعة',
    column: 'العمود',
    row: 'الصف',
    seat: 'المقعد',
    seats: 'المقاعد',
    totalSeats: 'مجموع المقاعد',
    noRoutine: 'لا يوجد جدول لهذا الامتحان.',
    noRoutineHint: 'أضف تواريخ ومواد الامتحان من إدخال الجدول أولاً.',
    noHall: 'لا توجد أعمدة أو صفوف لهذه القاعة.',
    routineReady: 'تم العثور على الجدول',
    routineReportType: 'نوع ورق الجدول',
    pickRoutineColTitle: 'لم يتم اختيار أي عمود',
    pickRoutineColText: 'اختر عموداً واحداً على الأقل للجدول.',
    routinePreview: 'معاينة مع الجدول',
    routineActive: 'مُفعّل',
    noSeatPlan: 'لم يتم إنشاء مخطط الجلوس',
    seatPlanReady: 'تم العثور على مخطط الجلوس',
    seatPlanRows: 'طالباً لهم مقاعد',
  },
};

export const getRoutineUIText = (key, lang) =>
  ROUTINE_UI[lang]?.[key] ?? ROUTINE_UI[DEFAULT_ADMIT_LANG][key] ?? ROUTINE_UI.bn[key];

// ---------------------------------------------------------------------------
// প্রিভিউর ডামি ডাটা
// ফিল্টার দেওয়ার আগেও সেটিং পপআপে রুটিন কার্ডটা কেমন দেখাবে তা দেখানো যায়।
// আসল রুটিন এলে এগুলো আর ব্যবহার হয় না।
//
// ⚠️ আসনের কোনো ডামি নেই — ডামি আসন দেখালে প্রিভিউ দেখে মনে হতো সিট
// প্ল্যান আছে। প্ল্যান না থাকলে প্রিভিউতেও বার্তাটাই বসে।
// ---------------------------------------------------------------------------

const DEMO_SUBJECTS = {
  bn: ['কুরআন মাজীদ', 'হাদীস শরীফ', 'ফিকহ', 'আরবি সাহিত্য', 'বাংলা', 'গণিত'],
  en: ['Quran Majeed', 'Hadith Shareef', 'Fiqh', 'Arabic Literature', 'Bangla', 'Mathematics'],
  ar: ['القرآن المجيد', 'الحديث الشريف', 'الفقه', 'الأدب العربي', 'البنغالية', 'الرياضيات'],
};

const DEMO_DAYS = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার'];
const DEMO_DATES = [
  '2026-12-01',
  '2026-12-02',
  '2026-12-03',
  '2026-12-04',
  '2026-12-05',
  '2026-12-06',
];

export const getRoutineDemoRows = (lang) => {
  const names = DEMO_SUBJECTS[lang] || DEMO_SUBJECTS.bn;
  return names.map((name, i) => ({
    serial: i + 1,
    date: DEMO_DATES[i],
    bnDate: '',
    day: DEMO_DAYS[i],
    startTime: '09:00',
    endTime: '12:00',
    room: String(i + 1),
    SubID: i + 1,
    SubjectName: DEMO_SUBJECTS.bn[i],
    SubjectNameEng: DEMO_SUBJECTS.en[i],
    SubjectNameAra: DEMO_SUBJECTS.ar[i],
  }));
};

// ---------------------------------------------------------------------------
// নিচের অংশের উচ্চতার হিসাব
//
// কার্ডের উচ্চতা স্থির (A4 এর মাপে), তাই রুটিনের সারি বেশি হলে সব কিছু
// আপনি আপনিই ছোট হতে হবে — নইলে নিচের দিকটা কেটে যেত। ক্রমটা এই:
//   ১) শিরোনাম ও আসনের লাইনের জায়গা আগে সরিয়ে রাখি
//   ২) আসন ছক দেখাতে হলে তার জন্যও জায়গা রেখে সারির উচ্চতা বের করি
//   ৩) টেবিল যা নিল, বাকিটা ছকের — ৩৬px এর কমে ছকটা আঁকাই হয় না,
//      কারণ ওই মাপে ওটা পড়াই যায় না (অর্ধেক কাটা ছকের চেয়ে না থাকাই ভালো)
//
// কম্পোনেন্ট নিজে কোনো হিসাব করে না, এই ফাংশনটাই সব মাপ দেয় — তাই
// মাপগুলো আলাদা করে পরীক্ষা করা যায়।
// ---------------------------------------------------------------------------

const ROUTINE_GAP = 6;        // ব্লকগুলোর মাঝের ফাঁক
const ROUTINE_TITLE_H = 20;   // শিরোনামের পট্টি
const ROUTINE_SEAT_H = 18;    // আসনের লাইন
const ROUTINE_MAP_WANT = 100; // আসন ছকের চাওয়া উচ্চতা
const ROUTINE_MAP_MIN = 36;   // এর কম হলে ছকটা পড়াই যায় না

/**
 * রুটিনের ঘরের ভিতরের মাপ।
 *
 * ঘরটার উচ্চতা (regionH) আসে getRoutineZones থেকে — ফিল্ড কয়টা আর
 * টেমপ্লেটের জোন কেমন, তার উপর নির্ভর করে। সেই জায়গার ভিতরেই সব বসাতে হয়:
 *   ১) শিরোনাম ও আসনের লাইনের জায়গা আগে সরিয়ে রাখি
 *   ২) আসন ছক দেখাতে হলে তার জন্যও জায়গা রেখে সারির উচ্চতা বের করি
 *   ৩) টেবিল যা নিল, বাকিটা ছকের — ৩৬px এর কমে ছকটা আঁকাই হয় না,
 *      কারণ অর্ধেক কাটা ছকের চেয়ে না থাকাই ভালো
 */
export const getRoutineBodyMetrics = ({
  regionH = 300,
  rowCount = 0,
  hasSeatLine = false,
  wantMap = false,
} = {}) => {
  const G = ROUTINE_GAP;
  const titleH = ROUTINE_TITLE_H;
  const seatLineH = hasSeatLine ? ROUTINE_SEAT_H : 0;

  // শিরোনাম, আসনের লাইন ও ফাঁকগুলো আগে সরিয়ে রাখি — বাকিটা টেবিল ও ছকের
  const fixed =
    titleH + G + (hasSeatLine ? G + ROUTINE_SEAT_H : 0) + (wantMap ? G : 0);
  const space = Math.max(regionH - fixed, 44);

  const lines = rowCount + 1;                       // হেডার সারি সহ
  // -4 → নিচের tableH এ বর্ডারের জন্য যে ৪px যোগ হবে, সেটা আগেই বাদ দিই
  const tableWant = Math.max(space - (wantMap ? ROUTINE_MAP_WANT : 0) - 4, 44);

  const rowH = rowCount
    ? Math.max(13, Math.min(28, Math.floor(tableWant / lines)))
    : 0;

  // রুটিন একদম না থাকলে টেবিলের বদলে বার্তার ঘর বসে, সেটা পুরো জায়গাটাই নেয়।
  // +4 → টেবিলের নিজের বর্ডারের জন্য ছাড়
  const tableH = rowCount ? rowH * lines + 4 : space;

  const mapRoom = space - tableH;
  const mapH =
    wantMap && mapRoom >= ROUTINE_MAP_MIN
      ? Math.min(ROUTINE_MAP_WANT + 20, mapRoom)
      : 0;

  return {
    gap: G,
    regionH,
    titleH,
    seatLineH,
    rowH,
    tableH,
    cellFont: rowH ? Math.max(9, Math.min(12, rowH - 7)) : 11,
    emptyH: rowCount ? 0 : space,
    mapH,
    // সব মিলে কত লাগল — ঘরের উচ্চতার বাইরে যাওয়া চলবে না
    usedH:
      titleH +
      G +
      tableH +
      (seatLineH ? G + seatLineH : 0) +
      (mapH ? G + mapH : 0),
  };
};
