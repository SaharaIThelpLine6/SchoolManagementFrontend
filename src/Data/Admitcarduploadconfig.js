// ---------------------------------------------------------------------------
// নিজের ডিজাইন আপলোড — config
//
// প্রবেশপত্র (A5) ও রুটিনসহ প্রবেশপত্র (A4) — দুইটার জন্যই ব্যবহারকারী
// নিজের বানানো ডিজাইন (PNG/JPG) আপলোড করতে পারে। সেই ছবিটা তখন
// `variant: 'image'` টেমপ্লেট হিসেবে চলে, ঠিক বিল্ট-ইন ইমেজ টেমপ্লেটগুলোর মতোই।
//
// admitCardConfig.js আর admitCardRoutineconfig.js এ হাত দেওয়া হয়নি —
// নতুন সবকিছু এই ফাইলেই, তাই পুরোনো ডিজাইনগুলো আগের মতোই অটুট।
// ---------------------------------------------------------------------------

import {
  CARD_H,
  CARD_W,
  toLangDigit,
} from './admitCardConfig';
import {
  ROUTINE_CARD_H,
  ROUTINE_CARD_W,
  ROUTINE_CARD_TEMPLATES,
} from './admitCardRoutineconfig';

// ---------------------------------------------------------------------------
// মাপের নিয়ম — একটাই নির্দিষ্ট মাপ, কোনো ছাড় নেই
//
// ⚠️ ব্যাকএন্ডের ADMIT_TEMPLATE_SPECS এর সাথে হুবহু মিল থাকতে হবে।
//
// কেন নির্দিষ্ট মাপ: কার্ডের ভিতরের প্রতিটা ঘর (হেডার, পরীক্ষার নাম,
// ব্যাজ, তথ্য, স্বাক্ষর) কোডে পিক্সেল ধরে বসানো। মাপ এদিক-ওদিক হলে
// ডিজাইনের নকশা আর ওই ঘরগুলো আর মেলে না — লেখা নকশার উপর চেপে বসে।
// তাই একটাই মাপ নেওয়া হয়, আর সেটা কার্ডের ঠিক ৩ গুণ:
//
//   A5 (প্রবেশপত্র)  ৫২০ × ৪১০ × ৩ = ১৫৬০ × ১২৩০
//   A4 (রুটিনসহ)     ৫২০ × ৭৪০ × ৩ = ১৫৬০ × ২২২০
//
// ৩ গুণ মাপেই ছাপা ঝরঝরে হয়, আর অনুপাত নিখুঁত মেলে বলে ছবিটা কোথাও
// টেনে বসাতে হয় না।
// ---------------------------------------------------------------------------

export const ADMIT_UPLOAD_SPEC = {
  mode: 'A5',
  cardW: CARD_W,
  cardH: CARD_H,
  // একটাই মাপ — এর এক পিক্সেল এদিক-ওদিক হলেও নেওয়া হয় না
  width: CARD_W * 3,    // ১৫৬০
  height: CARD_H * 3,   // ১২৩০
  maxBytes: 2 * 1024 * 1024,
  types: ['image/png', 'image/jpeg'],
};

export const ROUTINE_UPLOAD_SPEC = {
  mode: 'A4',
  cardW: ROUTINE_CARD_W,
  cardH: ROUTINE_CARD_H,
  width: ROUTINE_CARD_W * 3,   // ১৫৬০
  height: ROUTINE_CARD_H * 3,  // ২২২০
  maxBytes: 3 * 1024 * 1024,
  types: ['image/png', 'image/jpeg'],
};

export const getUploadSpec = (mode) =>
  String(mode) === 'A4' ? ROUTINE_UPLOAD_SPEC : ADMIT_UPLOAD_SPEC;

/** '2 MB' ধরনের লেখা */
export const formatBytes = (bytes, lang) => {
  const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
  return `${toLangDigit(mb, lang)} MB`;
};

/** '১৫৬০ × ১২৩০' ধরনের লেখা */
export const formatSize = (w, h, lang) =>
  `${toLangDigit(w, lang)} × ${toLangDigit(h, lang)}`;

// ---------------------------------------------------------------------------
// ছবিটা নিয়মে পড়ে কি না
//
// ফেরত দেয় { ok, code, w, h } — ok না হলে code দিয়ে বার্তা বানানো হয়।
// অনুপাতের কোনো ছাড় নেই, সতর্কবার্তাও নেই: মাপ হয় হুবহু মেলে, নয় বাতিল।
// ---------------------------------------------------------------------------
export const checkUploadFile = (file, size, mode) => {
  const spec = getUploadSpec(mode);

  if (!file) return { ok: false, code: 'noFile' };

  if (!spec.types.includes(file.type)) {
    return { ok: false, code: 'type' };
  }

  if (file.size > spec.maxBytes) {
    return { ok: false, code: 'bytes' };
  }

  const w = Number(size?.w) || 0;
  const h = Number(size?.h) || 0;
  if (!w || !h) return { ok: false, code: 'unreadable' };

  if (w !== spec.width || h !== spec.height) {
    return { ok: false, code: 'exact', w, h };
  }

  return { ok: true, w, h };
};

// ---------------------------------------------------------------------------
// ডিজাইনের মাপজোক — কোডে বাঁধা, আপলোডের পর্দায় বদলানোর কিছু নেই
//
// আগে আপলোডের সময় ঘর ও রঙ হাতে বদলানো যেত। প্রতিটা প্রতিষ্ঠান আলাদা
// মাপ বসিয়ে ফেলত, আর তখন কার কার্ড কেমন বসবে তার কোনো নিশ্চয়তা থাকত না।
// এখন মাপটাই যেহেতু একটাই (১৫৬০ × ১২৩০ / ১৫৬০ × ২২২০), ঘরগুলোও এক —
// নিচের মানগুলোই সব আপলোড করা ডিজাইনে বসে, সবার জন্য একই।
//
// বদলাতে হলে এখানেই বদলান; এক জায়গা বদলালে সব ডিজাইনেই বদলাবে।
// (মানগুলো কার্ড px এ, অর্থাৎ ৫২০ চওড়ার হিসাবে — ছবির ৩ গুণ মাপের নয়।)
// ---------------------------------------------------------------------------
export const UPLOAD_DESIGN = {
  // ---- ঘর
  headerHeight: 135,      // নাম ও ঠিকানার ঘর এখানে শেষ
  examTop: 106,           // পরীক্ষার নামের স্ট্রিপ
  bodyTop: 185,           // শিক্ষার্থীর তথ্য শুরু
  bodyBottom: 35,         // একদম নিচের ফাঁক
  signatureHeight: 62,    // স্বাক্ষর ও QR এর সারি

  // ---- চারটি ঘরের সমন্বয় — এগুলোই শুধু প্রতিটি ডিজাইনে আলাদা হতে পারে।
  // নিচের মানগুলো কেবল শুরুর অবস্থান; ব্যবহারকারী আপলোডের পর্দা থেকে
  // প্রতিটা ডিজাইনের জন্য আলাদা করে ঠিক করে নেন, আর সেটাই রেকর্ডে জমে।
  // মাইনাস = উপরে ওঠে, প্লাস = নিচে নামে।
  headerOffsetY: 0,       // লোগো, নাম, ঠিকানা, ছবি ও পরীক্ষার নাম
  ribbonOffsetY: 0,       // "প্রবেশপত্র" ব্যাজ
  bodyOffsetY: 0,         // শিক্ষার্থীর তথ্যের ঘর
  signOffsetY: 0,         // স্বাক্ষর, QR ও আসনের পট্টি

  // ---- "প্রবেশপত্র" লেখাটি
  // 'outline' → অ্যাপ নিজেই গোল বর্ডারে লিখে দেয়। সব ভাষাতেই আসে, আর
  //             ডিজাইনে লেখাটা না থাকলেও কার্ড কখনো খালি যায় না।
  // 'none'    → অ্যাপ কিছুই লিখবে না (ডিজাইনের ভিতরেই লেখা থাকলে এটা)।
  // পুরো সিস্টেমে একটাই নিয়ম চলে, তাই এখানে বদলালেই সবার কার্ডে বদলাবে।
  ribbonStyle: 'outline',
  ribbonColor: '#111827',

  // ---- রঙ
  nameColor: '#111827',
  addressColor: '#4b5563',
  valueColor: '#111827',
  labelColor: '#4b5563',
  accent: '#111827',
  photoBorder: '#9ca3af',
  signLineColor: '#111827',
  nameSize: 22,
  addressSize: 13,
  examNameSize: 13,
  examNameColor: '#374151',
};

/** পুরোনো নাম — অন্য ফাইলে import থাকলে ভাঙবে না */
export const DEFAULT_UPLOAD_DESIGN = UPLOAD_DESIGN;

// ---------------------------------------------------------------------------
// চারটি ঘরের উপর-নিচ
//
// ডিজাইনের ছবি প্রতিটা প্রতিষ্ঠানে আলাদা — কারো ব্যানার মোটা, কারো পাতলা।
// তাই ঘরের মাপ এক রেখেই পুরো ঘরটাকে একটু উপরে বা নিচে সরানোর সুযোগ রাখা
// হয়েছে। সরানো হয় translateY দিয়ে, মানে ঘরের উচ্চতা বা ভিতরের সাজ
// কিছুই বদলায় না — পুরো ঘরটা যেমন আছে তেমনই উঠে বা নেমে যায়।
//
// হিসাব কার্ডের পিক্সেলে (৫২০ × ৪১০ / ৫২০ × ৭৪০)। আপলোডের ছবি তার ৩ গুণ,
// তাই এখানকার ১ = ছবির ৩ পিক্সেল।
// ---------------------------------------------------------------------------
export const OFFSET_LIMIT = 40;

/** পর্দায় যে ক্রমে দেখানো হয় — ছবির উপর থেকে নিচ */
export const OFFSET_KEYS = [
  'headerOffsetY',
  'ribbonOffsetY',
  'bodyOffsetY',
  'signOffsetY',
];

/** সব শূন্য — অর্থাৎ কোডে বাঁধা জায়গাতেই সব বসবে */
export const ZERO_OFFSETS = OFFSET_KEYS.reduce(
  (acc, key) => ({ ...acc, [key]: 0 }),
  {}
);

/**
 * যেকোনো উৎস (সার্ভারের রেকর্ড, পর্দার ইনপুট) থেকে চারটে নিরাপদ সংখ্যা।
 * সীমার বাইরে গেলে সীমাতেই আটকে যায়, তাই কোনো ডিজাইনেই লেখা কার্ডের
 * বাইরে চলে যেতে পারে না।
 */
export const sanitizeOffsets = (raw = {}) => {
  const src = raw && typeof raw === 'object' ? raw : {};
  const out = {};
  OFFSET_KEYS.forEach((key) => {
    const n = Number(src[key]);
    const base = Number.isFinite(n) ? Math.round(n) : UPLOAD_DESIGN[key] ?? 0;
    out[key] = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, base));
  });
  return out;
};

/** সার্ভার কখনো design টা JSON স্ট্রিং হিসেবেও পাঠাতে পারে — দুইটাই সামলাই */
const asDesign = (rec = {}) => {
  const raw = rec?.design ?? rec?.offsets ?? {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return raw && typeof raw === 'object' ? raw : {};
};

/** রেকর্ডে জমা মাপজোক থেকে শুধু চারটে সমন্বয় — বাকি সব অগ্রাহ্য */
export const readOffsets = (rec = {}) => sanitizeOffsets(asDesign(rec));

// ---------------------------------------------------------------------------
// ছাপা কাগজের উপর ছাপা (overlay)
//
// অনেক প্রতিষ্ঠান প্রবেশপত্রের নকশাটা আগেই ছাপিয়ে রাখে — প্রেস থেকে বান্ডিল
// করে আসে। তখন প্রিন্টারে ওই ছাপা কাগজটাই দেওয়া হয়, আর অ্যাপের কাজ শুধু
// ফাঁকা ঘরগুলো ভরা।
//
// এই মোডে ছাপার সময় বাদ যায় — ব্যাকগ্রাউন্ডের ছবি, ওয়াটারমার্ক, হেডারের
// ঘর (লোগো, নাম, ঠিকানা, ছবির বাক্স) আর "প্রবেশপত্র" ব্যাজ। কারণ এগুলো
// কাগজে আগে থেকেই ছাপা আছে; আবার ছাপলে দুইটা লেখা একটার উপর আরেকটা পড়ত।
//
// যা ছাপে — পরীক্ষার নাম, শিক্ষার্থীর তথ্য (লেবেল ও মান), আসনের পট্টি,
// স্বাক্ষরের নাম, তারিখ আর QR। অর্থাৎ কেবল ভিতরের লেখাগুলো।
//
// ⚠️ পর্দায় কিছুই লুকানো হয় না — ডিজাইনটা দেখা যায় বলেই ঘরগুলো ঠিক
// জায়গায় বসানো যায়। লুকানো হয় কেবল @media print এ।
// ---------------------------------------------------------------------------

export const OVERLAY_KEY = 'overlayPrint';

/** ছাপার সময় যে অংশগুলো বাদ যাবে তাদের ক্লাস — CSS নিয়মটা buildPrintCss এ */
export const OVERLAY_HIDE_CLASS = 'admit-paper-only';

export const readOverlay = (rec = {}) => Boolean(asDesign(rec)[OVERLAY_KEY]);

/**
 * রেকর্ডে যা জমা হবে — চারটে উপর-নিচ আর overlay এর হ্যাঁ/না, একসাথে।
 * সার্ভারে এই অবজেক্টটাই `design` হিসেবে যায়।
 */
export const sanitizeDesign = (raw = {}) => ({
  ...sanitizeOffsets(raw),
  [OVERLAY_KEY]: Boolean(raw?.[OVERLAY_KEY]),
});

/** চারটের একটাও শূন্য নয় কিনা — "আগের মতো" বোতাম সক্রিয় রাখতে */
export const hasOffsets = (offsets = {}) =>
  OFFSET_KEYS.some((key) => Number(offsets?.[key] || 0) !== 0);

// ---------------------------------------------------------------------------
// ছবির ঠিকানা
// WebsiteSettings এ জমা থাকে '/uploads/<record>/<file>' — '/public' বাদ।
// পুরো ঠিকানাটা এখানেই বানানো হয়, DocumentSettings পেজের মতো করেই।
// ---------------------------------------------------------------------------
export const buildAssetUrl = (value, apiUrl) => {
  const raw = value == null ? '' : String(value).trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
    return raw;
  }
  const base = String(apiUrl || '').replace(/\/+$/, '');
  return `${base}/public/${raw.replace(/^\/+/, '')}`;
};

// ---------------------------------------------------------------------------
// আপলোড করা ডিজাইন → টেমপ্লেট অবজেক্ট
//
// বিল্ট-ইন টেমপ্লেটগুলোর সাথে আইডি যেন কখনো না মেলে, তাই 'u_' উপসর্গ।
// ---------------------------------------------------------------------------
export const UPLOADED_PREFIX = 'u_';

export const isUploadedTemplateId = (id) =>
  String(id || '').startsWith(UPLOADED_PREFIX);

const PHOTO = { photoW: 58, photoH: 74 };

/**
 * একটা রেকর্ড (সার্ভার থেকে আসা) → কার্ড আঁকার মতো টেমপ্লেট।
 * `image` ফাঁকা দিলে (preview এর বেলায়) সরাসরি objectURL ও দেওয়া যায়।
 */
export const buildUploadedTemplate = (
  rec = {},
  { apiUrl, image, offsets: overrideOffsets, overlay: overrideOverlay } = {}
) => {
  // ঘর, রঙ, মাপ — সবই কোডের UPLOAD_DESIGN থেকে, সবার জন্য একই। রেকর্ড
  // থেকে শুধু চারটে উপর-নিচের সমন্বয় পড়া হয়, কারণ ওটুকুই প্রতিটা
  // ডিজাইনে আলাদা হয়। পুরোনো আপলোডে এগুলো না থাকলে শূন্য, মানে আগের
  // মতোই বসবে — কিছু ভাঙবে না।
  const d = UPLOAD_DESIGN;
  const off = overrideOffsets ? sanitizeOffsets(overrideOffsets) : readOffsets(rec);
  const src = image || buildAssetUrl(rec.file, apiUrl);
  const mode = String(rec.mode || 'A5') === 'A4' ? 'A4' : 'A5';

  // ছাপা কাগজের উপর ছাপা — কার্ড আঁকার কোড এই পতাকাটাই দেখে
  const overlay =
    overrideOverlay === undefined ? readOverlay(rec) : Boolean(overrideOverlay);

  const tpl = {
    id: `${UPLOADED_PREFIX}${rec.id}`,
    uploadId: rec.id,
    uploaded: true,
    mode,
    overlay,
    title: rec.title || 'নিজের ডিজাইন',
    variant: 'image',
    image: src,
    thumb: src,

    // জোন — UPLOAD_DESIGN এর মানগুলোই, এগুলোই কার্ডে লেখা কোথায় বসবে ঠিক করে
    headerHeight: d.headerHeight,
    examTop: d.examTop,
    examHeight: 20,
    bodyTop: d.bodyTop,
    bodyBottom: d.bodyBottom,
    signatureHeight: d.signatureHeight,
    headerOffsetY: off.headerOffsetY,
    ribbonOffsetY: off.ribbonOffsetY,
    bodyOffsetY: off.bodyOffsetY,
    signOffsetY: off.signOffsetY,
    logoOffsetY: -15,
    photoOffsetY: -15,
    ...PHOTO,

    // রঙ
    nameColor: d.nameColor,
    addressColor: d.addressColor,
    nameSize: d.nameSize,
    addressSize: d.addressSize,
    valueColor: d.valueColor,
    labelColor: d.labelColor,
    accent: d.accent,
    examNameColor: d.examNameColor,
    examNameSize: d.examNameSize,
    photoBorder: d.photoBorder,
    signLineColor: d.signLineColor,

    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: 56,
    qrPad: '#ffffff',
  };

  // ---- "প্রবেশপত্র" ব্যাজ — UPLOAD_DESIGN এ যা ঠিক করা আছে
  if (d.ribbonStyle === 'outline') {
    tpl.ribbonStyle = 'outline';
    tpl.ribbonColor = d.ribbonColor;
  } else {
    tpl.ribbonStyle = 'none';
  }

  // ---- A4 হলে রুটিনের টেবিলের চেহারাও লাগে।
  // ব্যবহারকারী রঙ বাছলে সেটা এর উপরেই বসে (buildRoutineTable), তাই
  // ভিত্তি হিসেবে প্রথম রুটিন টেমপ্লেটের সাদামাটা স্কিনটাই যথেষ্ট।
  if (mode === 'A4') {
    tpl.table = { ...ROUTINE_CARD_TEMPLATES[0].table };

    // আপলোড করা A4 ছবিটা পুরো পৃষ্ঠার মাপে (১৫৬০ × ২২২০) — অর্ধেক নয়।
    // এই চিহ্নটা না দিলে AdmitCardFace বিল্ট-ইন টেমপ্লেটের নিয়মে ছবিটা
    // উপরের ৪১০px এ কেটে বসাত আর নিচে নিজের ফ্রেম এঁকে দিত, তাতে উপরে
    // A5 এর নকশা আর নিচে খালি সাদা দেখা যেত।
    tpl.imageFull = true;
  }

  return tpl;
};

/** সার্ভারের তালিকা থেকে এক মোডের টেমপ্লেটগুলো */
export const buildUploadedTemplates = (list, mode, apiUrl) =>
  (Array.isArray(list) ? list : [])
    .filter((r) => String(r?.mode || 'A5') === String(mode))
    .map((r) => buildUploadedTemplate(r, { apiUrl }));

// ---------------------------------------------------------------------------
// এই পর্দার নিজের লেখা — তিন ভাষায়
// ---------------------------------------------------------------------------
export const UPLOAD_UI = {
  bn: {
    uploadTitle: 'নিজের ডিজাইন আপলোড',
    uploadNew: 'নতুন ডিজাইন আপলোড',
    pickFile: 'ছবি বাছুন',
    changeFile: 'ছবি বদলান',
    designName: 'ডিজাইনের নাম',
    sizeRule: 'ছবির মাপ',
    sizeRuleText: (exact, bytes) =>
      `ছবির মাপ ঠিক ${exact} পিক্সেল হতে হবে — এর কম বা বেশি নেওয়া হবে না। সর্বোচ্চ ${bytes}, PNG বা JPG।`,
    yourSize: 'আপনার ছবির মাপ',
    preview: 'প্রিভিউ — ছাপাতেও হুবহু এমনই আসবে',

    // ---- চারটি ঘর উপর-নিচ করা
    adjust: 'ঘরগুলো উপর-নিচ করুন',
    adjustNote:
      'আপনার ডিজাইনের সাথে না মিললে ঘরগুলো এখান থেকেই সরিয়ে নিন — উপরের প্রিভিউতে সাথে সাথে দেখা যাবে। বাম দিকে টানলে উপরে ওঠে, ডানে টানলে নিচে নামে।',
    zHeader: 'নাম, ঠিকানা, লোগো, ছবি ও পরীক্ষার নাম',
    zRibbon: '"প্রবেশপত্র" লেখাটি',
    zBody: 'শিক্ষার্থীর তথ্য',
    zSign: 'স্বাক্ষর, QR ও আসন',
    up: 'উপরে',
    down: 'নিচে',
    resetAll: 'আগের জায়গায়',
    offsetHint: (n) =>
      n === 0
        ? 'নিজের জায়গায়'
        : `${n < 0 ? 'উপরে' : 'নিচে'} ${toLangDigit(Math.abs(n), 'bn')} px (ছবিতে ${toLangDigit(Math.abs(n) * 3, 'bn')} px)`,
    // ---- ছাপা কাগজের উপর ছাপা
    overlayTitle: 'ছাপা কাগজের উপর ছাপা',
    overlayLabel: 'নকশা ছাপা হবে না — শুধু লেখাগুলো বসবে',
    overlayNote:
      'প্রেস থেকে ছাপানো প্রবেশপত্রের কাগজ প্রিন্টারে দিলে এটা চালু করুন। তখন নকশা, লোগো, প্রতিষ্ঠানের নাম-ঠিকানা, শিক্ষার্থীর ছবির ঘর আর "প্রবেশপত্র" লেখাটি ছাপা হবে না — কাগজে ওগুলো আগে থেকেই আছে। শুধু পরীক্ষার নাম, শিক্ষার্থীর তথ্য, আসন, স্বাক্ষরের নাম, তারিখ ও QR ছাপবে। পরীক্ষার নামটি "প্রবেশপত্র" এর জায়গায় নেমে আসবে।',
    overlayOn: 'চালু',
    previewModeDesign: 'ডিজাইনসহ',
    previewModePrint: 'যা ছাপা হবে',
    previewPrintNote: 'ছাপার সময় কেবল এই লেখাগুলোই কাগজে পড়বে।',
    editTitle: 'ডিজাইনের ঘর ঠিক করুন',
    save: 'সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে...',
    saveOk: 'ঘরগুলো সংরক্ষণ করা হয়েছে',
    adjustBtn: 'ঘর ঠিক করুন',
    previewNote: 'নাম, ঠিকানা, পরীক্ষার নাম, প্রবেশপত্র, তথ্য ও স্বাক্ষর — সবই অ্যাপ নিজের ঘরে বসায়।',
    upload: 'আপলোড করুন',
    uploading: 'আপলোড হচ্ছে...',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    deleteAsk: 'ডিজাইনটি মুছে ফেলবেন?',
    deleteNote: 'এই ডিজাইনে বানানো প্রবেশপত্র আর ছাপা যাবে না।',
    uploaded: 'আপলোড করা',
    uploadOk: 'ডিজাইন সংরক্ষণ করা হয়েছে',
    errNoFile: 'আগে ছবিটি বাছুন',
    errType: 'শুধু PNG বা JPG ছবি দেওয়া যাবে',
    errBytes: (b) => `ছবির আকার ${b} এর বেশি হওয়া যাবে না`,
    errUnreadable: 'ছবিটি পড়া যায়নি',
    errExact: (exact, got) =>
      `মাপ মিলছে না — আপনার ছবি ${got} পিক্সেল, লাগবে ঠিক ${exact} পিক্সেল`,
    errUpload: 'আপলোড করা যায়নি',
  },
  en: {
    uploadTitle: 'Upload your own design',
    uploadNew: 'Upload new design',
    pickFile: 'Choose image',
    changeFile: 'Change image',
    designName: 'Design name',
    sizeRule: 'Image size',
    sizeRuleText: (exact, bytes) =>
      `The image must be exactly ${exact} px — nothing larger or smaller. Max ${bytes}, PNG or JPG.`,
    yourSize: 'Your image',
    preview: 'Preview — this is exactly how it prints',

    // ---- moving the four zones
    adjust: 'Move the zones up or down',
    adjustNote:
      "If a zone doesn't sit right on your design, move it here — the preview above updates as you drag. Left raises it, right lowers it.",
    zHeader: 'Name, address, logo, photo and exam name',
    zRibbon: 'The "Admit Card" badge',
    zBody: 'Student details',
    zSign: 'Signatures, QR and seat',
    up: 'Up',
    down: 'Down',
    resetAll: 'Reset',
    offsetHint: (n) =>
      n === 0
        ? 'Default position'
        : `${Math.abs(n)} px ${n < 0 ? 'up' : 'down'} (${Math.abs(n) * 3} px on the image)`,
    // ---- printing onto pre-printed paper
    overlayTitle: 'Print onto pre-printed paper',
    overlayLabel: 'Do not print the design — place only the text',
    overlayNote:
      'Turn this on when you feed press-printed admit card paper into the printer. The design, logo, institution name and address, the photo box and the "Admit Card" badge are then not printed — the paper already carries them. Only the exam name, student details, seat, signature names, date and QR print. The exam name moves down into the badge\'s place.',
    overlayOn: 'On',
    previewModeDesign: 'With design',
    previewModePrint: 'What will print',
    previewPrintNote: 'Only this text lands on the paper when printing.',
    editTitle: 'Adjust the design zones',
    save: 'Save',
    saving: 'Saving...',
    saveOk: 'Zones saved',
    adjustBtn: 'Adjust zones',
    previewNote: 'Name, address, exam name, badge, fields and signatures are all placed by the app.',
    upload: 'Upload',
    uploading: 'Uploading...',
    cancel: 'Cancel',
    delete: 'Delete',
    deleteAsk: 'Delete this design?',
    deleteNote: 'Admit cards made with it can no longer be printed.',
    uploaded: 'Uploaded',
    uploadOk: 'Design saved',
    errNoFile: 'Choose an image first',
    errType: 'Only PNG or JPG images are allowed',
    errBytes: (b) => `Image must not be larger than ${b}`,
    errUnreadable: 'Could not read the image',
    errExact: (exact, got) =>
      `Wrong size — your image is ${got} px, it must be exactly ${exact} px`,
    errUpload: 'Upload failed',
  },
  ar: {
    uploadTitle: 'رفع تصميمك الخاص',
    uploadNew: 'رفع تصميم جديد',
    pickFile: 'اختر صورة',
    changeFile: 'تغيير الصورة',
    designName: 'اسم التصميم',
    sizeRule: 'مقاس الصورة',
    sizeRuleText: (exact, bytes) =>
      `يجب أن يكون المقاس ${exact} بكسل تماماً — لا أكبر ولا أصغر. الحد الأقصى ${bytes}، PNG أو JPG.`,
    yourSize: 'مقاس صورتك',
    preview: 'معاينة — هكذا تماماً ستُطبع',

    // ---- تحريك المناطق الأربع
    adjust: 'حرّك المناطق لأعلى أو لأسفل',
    adjustNote:
      'إذا لم تستقر منطقة على تصميمك، حرّكها من هنا — المعاينة أعلاه تتغيّر فوراً. اليسار يرفعها واليمين ينزلها.',
    zHeader: 'الاسم والعنوان والشعار والصورة واسم الامتحان',
    zRibbon: 'عبارة «بطاقة الدخول»',
    zBody: 'بيانات الطالب',
    zSign: 'التواقيع ورمز QR والمقعد',
    up: 'أعلى',
    down: 'أسفل',
    resetAll: 'إعادة',
    offsetHint: (n) =>
      n === 0
        ? 'الموضع الأصلي'
        : `${toLangDigit(Math.abs(n), 'ar')} بكسل ${n < 0 ? 'أعلى' : 'أسفل'} (${toLangDigit(Math.abs(n) * 3, 'ar')} بكسل في الصورة)`,
    // ---- الطباعة على ورق مطبوع مسبقاً
    overlayTitle: 'الطباعة على ورق مطبوع مسبقاً',
    overlayLabel: 'لا تطبع التصميم — ضع النصوص فقط',
    overlayNote:
      'فعّل هذا عند استخدام ورق بطاقات الدخول المطبوع من المطبعة. عندها لا يُطبع التصميم ولا الشعار ولا اسم المؤسسة وعنوانها ولا إطار الصورة ولا عبارة «بطاقة الدخول» — فهي موجودة على الورق أصلاً. يُطبع فقط اسم الامتحان وبيانات الطالب والمقعد وأسماء التواقيع والتاريخ ورمز QR. وينزل اسم الامتحان إلى موضع العبارة.',
    overlayOn: 'مُفعّل',
    previewModeDesign: 'مع التصميم',
    previewModePrint: 'ما سيُطبع',
    previewPrintNote: 'هذه النصوص وحدها هي ما يقع على الورق عند الطباعة.',
    editTitle: 'ضبط مناطق التصميم',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    saveOk: 'تم حفظ المناطق',
    adjustBtn: 'ضبط المناطق',
    previewNote: 'الاسم والعنوان واسم الامتحان والعبارة والبيانات والتواقيع يضعها التطبيق.',
    upload: 'رفع',
    uploading: 'جارٍ الرفع...',
    cancel: 'إلغاء',
    delete: 'حذف',
    deleteAsk: 'حذف هذا التصميم؟',
    deleteNote: 'لن يمكن طباعة البطاقات المصممة به.',
    uploaded: 'مرفوع',
    uploadOk: 'تم حفظ التصميم',
    errNoFile: 'اختر صورة أولاً',
    errType: 'يُسمح بصور PNG أو JPG فقط',
    errBytes: (b) => `يجب ألا يتجاوز حجم الصورة ${b}`,
    errUnreadable: 'تعذّرت قراءة الصورة',
    errExact: (exact, got) =>
      `المقاس غير مطابق — صورتك ${got} بكسل والمطلوب ${exact} بكسل تماماً`,
    errUpload: 'فشل الرفع',
  },
};

export const getUploadUIText = (key, lang) =>
  UPLOAD_UI[lang]?.[key] ?? UPLOAD_UI.bn[key];

/** যাচাইয়ের ফল → পর্দায় দেখানোর বার্তা */
export const uploadErrorText = (code, mode, lang, size = null) => {
  const spec = getUploadSpec(mode);
  const t = (k) => getUploadUIText(k, lang);
  const exact = formatSize(spec.width, spec.height, lang);

  switch (code) {
    case 'noFile':
      return t('errNoFile');
    case 'type':
      return t('errType');
    case 'bytes':
      return t('errBytes')(formatBytes(spec.maxBytes, lang));
    case 'unreadable':
      return t('errUnreadable');
    case 'exact':
      return t('errExact')(
        exact,
        size ? formatSize(size.w, size.h, lang) : '—'
      );
    default:
      return t('errUpload');
  }
};

/** চারটে ঘরের পর্দার নাম — OFFSET_KEYS এর ক্রমেই */
export const OFFSET_LABELS = {
  headerOffsetY: 'zHeader',
  ribbonOffsetY: 'zRibbon',
  bodyOffsetY: 'zBody',
  signOffsetY: 'zSign',
};

export const getOffsetLabel = (key, lang) =>
  getUploadUIText(OFFSET_LABELS[key] || 'zHeader', lang);




































// // ---------------------------------------------------------------------------
// // নিজের ডিজাইন আপলোড — config
// //
// // প্রবেশপত্র (A5) ও রুটিনসহ প্রবেশপত্র (A4) — দুইটার জন্যই ব্যবহারকারী
// // নিজের বানানো ডিজাইন (PNG/JPG) আপলোড করতে পারে। সেই ছবিটা তখন
// // `variant: 'image'` টেমপ্লেট হিসেবে চলে, ঠিক বিল্ট-ইন ইমেজ টেমপ্লেটগুলোর মতোই।
// //
// // admitCardConfig.js আর admitCardRoutineconfig.js এ হাত দেওয়া হয়নি —
// // নতুন সবকিছু এই ফাইলেই, তাই পুরোনো ডিজাইনগুলো আগের মতোই অটুট।
// // ---------------------------------------------------------------------------

// import {
//   CARD_H,
//   CARD_W,
//   toLangDigit,
// } from './admitCardConfig';
// import {
//   ROUTINE_CARD_H,
//   ROUTINE_CARD_W,
//   ROUTINE_CARD_TEMPLATES,
// } from './admitCardRoutineconfig';

// // ---------------------------------------------------------------------------
// // মাপের নিয়ম — একটাই নির্দিষ্ট মাপ, কোনো ছাড় নেই
// //
// // ⚠️ ব্যাকএন্ডের ADMIT_TEMPLATE_SPECS এর সাথে হুবহু মিল থাকতে হবে।
// //
// // কেন নির্দিষ্ট মাপ: কার্ডের ভিতরের প্রতিটা ঘর (হেডার, পরীক্ষার নাম,
// // ব্যাজ, তথ্য, স্বাক্ষর) কোডে পিক্সেল ধরে বসানো। মাপ এদিক-ওদিক হলে
// // ডিজাইনের নকশা আর ওই ঘরগুলো আর মেলে না — লেখা নকশার উপর চেপে বসে।
// // তাই একটাই মাপ নেওয়া হয়, আর সেটা কার্ডের ঠিক ৩ গুণ:
// //
// //   A5 (প্রবেশপত্র)  ৫২০ × ৪১০ × ৩ = ১৫৬০ × ১২৩০
// //   A4 (রুটিনসহ)     ৫২০ × ৭৪০ × ৩ = ১৫৬০ × ২২২০
// //
// // ৩ গুণ মাপেই ছাপা ঝরঝরে হয়, আর অনুপাত নিখুঁত মেলে বলে ছবিটা কোথাও
// // টেনে বসাতে হয় না।
// // ---------------------------------------------------------------------------

// export const ADMIT_UPLOAD_SPEC = {
//   mode: 'A5',
//   cardW: CARD_W,
//   cardH: CARD_H,
//   // একটাই মাপ — এর এক পিক্সেল এদিক-ওদিক হলেও নেওয়া হয় না
//   width: CARD_W * 3,    // ১৫৬০
//   height: CARD_H * 3,   // ১২৩০
//   maxBytes: 2 * 1024 * 1024,
//   types: ['image/png', 'image/jpeg'],
// };

// export const ROUTINE_UPLOAD_SPEC = {
//   mode: 'A4',
//   cardW: ROUTINE_CARD_W,
//   cardH: ROUTINE_CARD_H,
//   width: ROUTINE_CARD_W * 3,   // ১৫৬০
//   height: ROUTINE_CARD_H * 3,  // ২২২০
//   maxBytes: 3 * 1024 * 1024,
//   types: ['image/png', 'image/jpeg'],
// };

// export const getUploadSpec = (mode) =>
//   String(mode) === 'A4' ? ROUTINE_UPLOAD_SPEC : ADMIT_UPLOAD_SPEC;

// /** '2 MB' ধরনের লেখা */
// export const formatBytes = (bytes, lang) => {
//   const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
//   return `${toLangDigit(mb, lang)} MB`;
// };

// /** '১৫৬০ × ১২৩০' ধরনের লেখা */
// export const formatSize = (w, h, lang) =>
//   `${toLangDigit(w, lang)} × ${toLangDigit(h, lang)}`;

// // ---------------------------------------------------------------------------
// // ছবিটা নিয়মে পড়ে কি না
// //
// // ফেরত দেয় { ok, code, w, h } — ok না হলে code দিয়ে বার্তা বানানো হয়।
// // অনুপাতের কোনো ছাড় নেই, সতর্কবার্তাও নেই: মাপ হয় হুবহু মেলে, নয় বাতিল।
// // ---------------------------------------------------------------------------
// export const checkUploadFile = (file, size, mode) => {
//   const spec = getUploadSpec(mode);

//   if (!file) return { ok: false, code: 'noFile' };

//   if (!spec.types.includes(file.type)) {
//     return { ok: false, code: 'type' };
//   }

//   if (file.size > spec.maxBytes) {
//     return { ok: false, code: 'bytes' };
//   }

//   const w = Number(size?.w) || 0;
//   const h = Number(size?.h) || 0;
//   if (!w || !h) return { ok: false, code: 'unreadable' };

//   if (w !== spec.width || h !== spec.height) {
//     return { ok: false, code: 'exact', w, h };
//   }

//   return { ok: true, w, h };
// };

// // ---------------------------------------------------------------------------
// // ডিজাইনের মাপজোক — কোডে বাঁধা, আপলোডের পর্দায় বদলানোর কিছু নেই
// //
// // আগে আপলোডের সময় ঘর ও রঙ হাতে বদলানো যেত। প্রতিটা প্রতিষ্ঠান আলাদা
// // মাপ বসিয়ে ফেলত, আর তখন কার কার্ড কেমন বসবে তার কোনো নিশ্চয়তা থাকত না।
// // এখন মাপটাই যেহেতু একটাই (১৫৬০ × ১২৩০ / ১৫৬০ × ২২২০), ঘরগুলোও এক —
// // নিচের মানগুলোই সব আপলোড করা ডিজাইনে বসে, সবার জন্য একই।
// //
// // বদলাতে হলে এখানেই বদলান; এক জায়গা বদলালে সব ডিজাইনেই বদলাবে।
// // (মানগুলো কার্ড px এ, অর্থাৎ ৫২০ চওড়ার হিসাবে — ছবির ৩ গুণ মাপের নয়।)
// // ---------------------------------------------------------------------------
// export const UPLOAD_DESIGN = {
//   // ---- ঘর
//   headerHeight: 135,      // নাম ও ঠিকানার ঘর এখানে শেষ
//   examTop: 106,           // পরীক্ষার নামের স্ট্রিপ
//   bodyTop: 185,           // শিক্ষার্থীর তথ্য শুরু
//   bodyBottom: 35,         // একদম নিচের ফাঁক
//   signatureHeight: 62,    // স্বাক্ষর ও QR এর সারি

//   // ---- চারটি ঘরের সমন্বয় — এগুলোই শুধু প্রতিটি ডিজাইনে আলাদা হতে পারে।
//   // নিচের মানগুলো কেবল শুরুর অবস্থান; ব্যবহারকারী আপলোডের পর্দা থেকে
//   // প্রতিটা ডিজাইনের জন্য আলাদা করে ঠিক করে নেন, আর সেটাই রেকর্ডে জমে।
//   // মাইনাস = উপরে ওঠে, প্লাস = নিচে নামে।
//   headerOffsetY: 0,       // লোগো, নাম, ঠিকানা, ছবি ও পরীক্ষার নাম
//   ribbonOffsetY: 0,       // "প্রবেশপত্র" ব্যাজ
//   bodyOffsetY: 0,         // শিক্ষার্থীর তথ্যের ঘর
//   signOffsetY: 0,         // স্বাক্ষর, QR ও আসনের পট্টি

//   // ---- "প্রবেশপত্র" লেখাটি
//   // 'outline' → অ্যাপ নিজেই গোল বর্ডারে লিখে দেয়। সব ভাষাতেই আসে, আর
//   //             ডিজাইনে লেখাটা না থাকলেও কার্ড কখনো খালি যায় না।
//   // 'none'    → অ্যাপ কিছুই লিখবে না (ডিজাইনের ভিতরেই লেখা থাকলে এটা)।
//   // পুরো সিস্টেমে একটাই নিয়ম চলে, তাই এখানে বদলালেই সবার কার্ডে বদলাবে।
//   ribbonStyle: 'outline',
//   ribbonColor: '#111827',

//   // ---- রঙ
//   nameColor: '#111827',
//   addressColor: '#4b5563',
//   valueColor: '#111827',
//   labelColor: '#4b5563',
//   accent: '#111827',
//   photoBorder: '#9ca3af',
//   signLineColor: '#111827',
//   nameSize: 22,
//   addressSize: 13,
//   examNameSize: 13,
//   examNameColor: '#374151',
// };

// /** পুরোনো নাম — অন্য ফাইলে import থাকলে ভাঙবে না */
// export const DEFAULT_UPLOAD_DESIGN = UPLOAD_DESIGN;

// // ---------------------------------------------------------------------------
// // চারটি ঘরের উপর-নিচ
// //
// // ডিজাইনের ছবি প্রতিটা প্রতিষ্ঠানে আলাদা — কারো ব্যানার মোটা, কারো পাতলা।
// // তাই ঘরের মাপ এক রেখেই পুরো ঘরটাকে একটু উপরে বা নিচে সরানোর সুযোগ রাখা
// // হয়েছে। সরানো হয় translateY দিয়ে, মানে ঘরের উচ্চতা বা ভিতরের সাজ
// // কিছুই বদলায় না — পুরো ঘরটা যেমন আছে তেমনই উঠে বা নেমে যায়।
// //
// // হিসাব কার্ডের পিক্সেলে (৫২০ × ৪১০ / ৫২০ × ৭৪০)। আপলোডের ছবি তার ৩ গুণ,
// // তাই এখানকার ১ = ছবির ৩ পিক্সেল।
// // ---------------------------------------------------------------------------
// export const OFFSET_LIMIT = 40;

// /** পর্দায় যে ক্রমে দেখানো হয় — ছবির উপর থেকে নিচ */
// export const OFFSET_KEYS = [
//   'headerOffsetY',
//   'ribbonOffsetY',
//   'bodyOffsetY',
//   'signOffsetY',
// ];

// /** সব শূন্য — অর্থাৎ কোডে বাঁধা জায়গাতেই সব বসবে */
// export const ZERO_OFFSETS = OFFSET_KEYS.reduce(
//   (acc, key) => ({ ...acc, [key]: 0 }),
//   {}
// );

// /**
//  * যেকোনো উৎস (সার্ভারের রেকর্ড, পর্দার ইনপুট) থেকে চারটে নিরাপদ সংখ্যা।
//  * সীমার বাইরে গেলে সীমাতেই আটকে যায়, তাই কোনো ডিজাইনেই লেখা কার্ডের
//  * বাইরে চলে যেতে পারে না।
//  */
// export const sanitizeOffsets = (raw = {}) => {
//   const src = raw && typeof raw === 'object' ? raw : {};
//   const out = {};
//   OFFSET_KEYS.forEach((key) => {
//     const n = Number(src[key]);
//     const base = Number.isFinite(n) ? Math.round(n) : UPLOAD_DESIGN[key] ?? 0;
//     out[key] = Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, base));
//   });
//   return out;
// };

// /** রেকর্ডে জমা মাপজোক থেকে শুধু চারটে সমন্বয় — বাকি সব অগ্রাহ্য */
// export const readOffsets = (rec = {}) =>
//   sanitizeOffsets(rec?.design || rec?.offsets || {});

// /** চারটের একটাও শূন্য নয় কিনা — "আগের মতো" বোতাম সক্রিয় রাখতে */
// export const hasOffsets = (offsets = {}) =>
//   OFFSET_KEYS.some((key) => Number(offsets?.[key] || 0) !== 0);

// // ---------------------------------------------------------------------------
// // ছবির ঠিকানা
// // WebsiteSettings এ জমা থাকে '/uploads/<record>/<file>' — '/public' বাদ।
// // পুরো ঠিকানাটা এখানেই বানানো হয়, DocumentSettings পেজের মতো করেই।
// // ---------------------------------------------------------------------------
// export const buildAssetUrl = (value, apiUrl) => {
//   const raw = value == null ? '' : String(value).trim();
//   if (!raw) return '';
//   if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:') || raw.startsWith('blob:')) {
//     return raw;
//   }
//   const base = String(apiUrl || '').replace(/\/+$/, '');
//   return `${base}/public/${raw.replace(/^\/+/, '')}`;
// };

// // ---------------------------------------------------------------------------
// // আপলোড করা ডিজাইন → টেমপ্লেট অবজেক্ট
// //
// // বিল্ট-ইন টেমপ্লেটগুলোর সাথে আইডি যেন কখনো না মেলে, তাই 'u_' উপসর্গ।
// // ---------------------------------------------------------------------------
// export const UPLOADED_PREFIX = 'u_';

// export const isUploadedTemplateId = (id) =>
//   String(id || '').startsWith(UPLOADED_PREFIX);

// const PHOTO = { photoW: 58, photoH: 74 };

// /**
//  * একটা রেকর্ড (সার্ভার থেকে আসা) → কার্ড আঁকার মতো টেমপ্লেট।
//  * `image` ফাঁকা দিলে (preview এর বেলায়) সরাসরি objectURL ও দেওয়া যায়।
//  */
// export const buildUploadedTemplate = (
//   rec = {},
//   { apiUrl, image, offsets: overrideOffsets } = {}
// ) => {
//   // ঘর, রঙ, মাপ — সবই কোডের UPLOAD_DESIGN থেকে, সবার জন্য একই। রেকর্ড
//   // থেকে শুধু চারটে উপর-নিচের সমন্বয় পড়া হয়, কারণ ওটুকুই প্রতিটা
//   // ডিজাইনে আলাদা হয়। পুরোনো আপলোডে এগুলো না থাকলে শূন্য, মানে আগের
//   // মতোই বসবে — কিছু ভাঙবে না।
//   const d = UPLOAD_DESIGN;
//   const off = overrideOffsets ? sanitizeOffsets(overrideOffsets) : readOffsets(rec);
//   const src = image || buildAssetUrl(rec.file, apiUrl);
//   const mode = String(rec.mode || 'A5') === 'A4' ? 'A4' : 'A5';

//   const tpl = {
//     id: `${UPLOADED_PREFIX}${rec.id}`,
//     uploadId: rec.id,
//     uploaded: true,
//     mode,
//     title: rec.title || 'নিজের ডিজাইন',
//     variant: 'image',
//     image: src,
//     thumb: src,

//     // জোন — UPLOAD_DESIGN এর মানগুলোই, এগুলোই কার্ডে লেখা কোথায় বসবে ঠিক করে
//     headerHeight: d.headerHeight,
//     examTop: d.examTop,
//     examHeight: 20,
//     bodyTop: d.bodyTop,
//     bodyBottom: d.bodyBottom,
//     signatureHeight: d.signatureHeight,
//     headerOffsetY: off.headerOffsetY,
//     ribbonOffsetY: off.ribbonOffsetY,
//     bodyOffsetY: off.bodyOffsetY,
//     signOffsetY: off.signOffsetY,
//     logoOffsetY: -15,
//     photoOffsetY: -15,
//     ...PHOTO,

//     // রঙ
//     nameColor: d.nameColor,
//     addressColor: d.addressColor,
//     nameSize: d.nameSize,
//     addressSize: d.addressSize,
//     valueColor: d.valueColor,
//     labelColor: d.labelColor,
//     accent: d.accent,
//     examNameColor: d.examNameColor,
//     examNameSize: d.examNameSize,
//     photoBorder: d.photoBorder,
//     signLineColor: d.signLineColor,

//     showPhoto: true,
//     showSignature: true,
//     showSignDate: true,
//     showQR: true,
//     qrSize: 56,
//     qrPad: '#ffffff',
//   };

//   // ---- "প্রবেশপত্র" ব্যাজ — UPLOAD_DESIGN এ যা ঠিক করা আছে
//   if (d.ribbonStyle === 'outline') {
//     tpl.ribbonStyle = 'outline';
//     tpl.ribbonColor = d.ribbonColor;
//   } else {
//     tpl.ribbonStyle = 'none';
//   }

//   // ---- A4 হলে রুটিনের টেবিলের চেহারাও লাগে।
//   // ব্যবহারকারী রঙ বাছলে সেটা এর উপরেই বসে (buildRoutineTable), তাই
//   // ভিত্তি হিসেবে প্রথম রুটিন টেমপ্লেটের সাদামাটা স্কিনটাই যথেষ্ট।
//   if (mode === 'A4') {
//     tpl.table = { ...ROUTINE_CARD_TEMPLATES[0].table };

//     // আপলোড করা A4 ছবিটা পুরো পৃষ্ঠার মাপে (১৫৬০ × ২২২০) — অর্ধেক নয়।
//     // এই চিহ্নটা না দিলে AdmitCardFace বিল্ট-ইন টেমপ্লেটের নিয়মে ছবিটা
//     // উপরের ৪১০px এ কেটে বসাত আর নিচে নিজের ফ্রেম এঁকে দিত, তাতে উপরে
//     // A5 এর নকশা আর নিচে খালি সাদা দেখা যেত।
//     tpl.imageFull = true;
//   }

//   return tpl;
// };

// /** সার্ভারের তালিকা থেকে এক মোডের টেমপ্লেটগুলো */
// export const buildUploadedTemplates = (list, mode, apiUrl) =>
//   (Array.isArray(list) ? list : [])
//     .filter((r) => String(r?.mode || 'A5') === String(mode))
//     .map((r) => buildUploadedTemplate(r, { apiUrl }));

// // ---------------------------------------------------------------------------
// // এই পর্দার নিজের লেখা — তিন ভাষায়
// // ---------------------------------------------------------------------------
// export const UPLOAD_UI = {
//   bn: {
//     uploadTitle: 'নিজের ডিজাইন আপলোড',
//     uploadNew: 'নতুন ডিজাইন আপলোড',
//     pickFile: 'ছবি বাছুন',
//     changeFile: 'ছবি বদলান',
//     designName: 'ডিজাইনের নাম',
//     sizeRule: 'ছবির মাপ',
//     sizeRuleText: (exact, bytes) =>
//       `ছবির মাপ ঠিক ${exact} পিক্সেল হতে হবে — এর কম বা বেশি নেওয়া হবে না। সর্বোচ্চ ${bytes}, PNG বা JPG।`,
//     yourSize: 'আপনার ছবির মাপ',
//     preview: 'প্রিভিউ — ছাপাতেও হুবহু এমনই আসবে',

//     // ---- চারটি ঘর উপর-নিচ করা
//     adjust: 'ঘরগুলো উপর-নিচ করুন',
//     adjustNote:
//       'আপনার ডিজাইনের সাথে না মিললে ঘরগুলো এখান থেকেই সরিয়ে নিন — উপরের প্রিভিউতে সাথে সাথে দেখা যাবে। বাম দিকে টানলে উপরে ওঠে, ডানে টানলে নিচে নামে।',
//     zHeader: 'নাম, ঠিকানা, লোগো, ছবি ও পরীক্ষার নাম',
//     zRibbon: '"প্রবেশপত্র" লেখাটি',
//     zBody: 'শিক্ষার্থীর তথ্য',
//     zSign: 'স্বাক্ষর, QR ও আসন',
//     up: 'উপরে',
//     down: 'নিচে',
//     resetAll: 'আগের জায়গায়',
//     offsetHint: (n) =>
//       n === 0
//         ? 'নিজের জায়গায়'
//         : `${n < 0 ? 'উপরে' : 'নিচে'} ${toLangDigit(Math.abs(n), 'bn')} px (ছবিতে ${toLangDigit(Math.abs(n) * 3, 'bn')} px)`,
//     editTitle: 'ডিজাইনের ঘর ঠিক করুন',
//     save: 'সংরক্ষণ করুন',
//     saving: 'সংরক্ষণ হচ্ছে...',
//     saveOk: 'ঘরগুলো সংরক্ষণ করা হয়েছে',
//     adjustBtn: 'ঘর ঠিক করুন',
//     previewNote: 'নাম, ঠিকানা, পরীক্ষার নাম, প্রবেশপত্র, তথ্য ও স্বাক্ষর — সবই অ্যাপ নিজের ঘরে বসায়।',
//     upload: 'আপলোড করুন',
//     uploading: 'আপলোড হচ্ছে...',
//     cancel: 'বাতিল',
//     delete: 'মুছুন',
//     deleteAsk: 'ডিজাইনটি মুছে ফেলবেন?',
//     deleteNote: 'এই ডিজাইনে বানানো প্রবেশপত্র আর ছাপা যাবে না।',
//     uploaded: 'আপলোড করা',
//     uploadOk: 'ডিজাইন সংরক্ষণ করা হয়েছে',
//     errNoFile: 'আগে ছবিটি বাছুন',
//     errType: 'শুধু PNG বা JPG ছবি দেওয়া যাবে',
//     errBytes: (b) => `ছবির আকার ${b} এর বেশি হওয়া যাবে না`,
//     errUnreadable: 'ছবিটি পড়া যায়নি',
//     errExact: (exact, got) =>
//       `মাপ মিলছে না — আপনার ছবি ${got} পিক্সেল, লাগবে ঠিক ${exact} পিক্সেল`,
//     errUpload: 'আপলোড করা যায়নি',
//   },
//   en: {
//     uploadTitle: 'Upload your own design',
//     uploadNew: 'Upload new design',
//     pickFile: 'Choose image',
//     changeFile: 'Change image',
//     designName: 'Design name',
//     sizeRule: 'Image size',
//     sizeRuleText: (exact, bytes) =>
//       `The image must be exactly ${exact} px — nothing larger or smaller. Max ${bytes}, PNG or JPG.`,
//     yourSize: 'Your image',
//     preview: 'Preview — this is exactly how it prints',

//     // ---- moving the four zones
//     adjust: 'Move the zones up or down',
//     adjustNote:
//       "If a zone doesn't sit right on your design, move it here — the preview above updates as you drag. Left raises it, right lowers it.",
//     zHeader: 'Name, address, logo, photo and exam name',
//     zRibbon: 'The "Admit Card" badge',
//     zBody: 'Student details',
//     zSign: 'Signatures, QR and seat',
//     up: 'Up',
//     down: 'Down',
//     resetAll: 'Reset',
//     offsetHint: (n) =>
//       n === 0
//         ? 'Default position'
//         : `${Math.abs(n)} px ${n < 0 ? 'up' : 'down'} (${Math.abs(n) * 3} px on the image)`,
//     editTitle: 'Adjust the design zones',
//     save: 'Save',
//     saving: 'Saving...',
//     saveOk: 'Zones saved',
//     adjustBtn: 'Adjust zones',
//     previewNote: 'Name, address, exam name, badge, fields and signatures are all placed by the app.',
//     upload: 'Upload',
//     uploading: 'Uploading...',
//     cancel: 'Cancel',
//     delete: 'Delete',
//     deleteAsk: 'Delete this design?',
//     deleteNote: 'Admit cards made with it can no longer be printed.',
//     uploaded: 'Uploaded',
//     uploadOk: 'Design saved',
//     errNoFile: 'Choose an image first',
//     errType: 'Only PNG or JPG images are allowed',
//     errBytes: (b) => `Image must not be larger than ${b}`,
//     errUnreadable: 'Could not read the image',
//     errExact: (exact, got) =>
//       `Wrong size — your image is ${got} px, it must be exactly ${exact} px`,
//     errUpload: 'Upload failed',
//   },
//   ar: {
//     uploadTitle: 'رفع تصميمك الخاص',
//     uploadNew: 'رفع تصميم جديد',
//     pickFile: 'اختر صورة',
//     changeFile: 'تغيير الصورة',
//     designName: 'اسم التصميم',
//     sizeRule: 'مقاس الصورة',
//     sizeRuleText: (exact, bytes) =>
//       `يجب أن يكون المقاس ${exact} بكسل تماماً — لا أكبر ولا أصغر. الحد الأقصى ${bytes}، PNG أو JPG.`,
//     yourSize: 'مقاس صورتك',
//     preview: 'معاينة — هكذا تماماً ستُطبع',

//     // ---- تحريك المناطق الأربع
//     adjust: 'حرّك المناطق لأعلى أو لأسفل',
//     adjustNote:
//       'إذا لم تستقر منطقة على تصميمك، حرّكها من هنا — المعاينة أعلاه تتغيّر فوراً. اليسار يرفعها واليمين ينزلها.',
//     zHeader: 'الاسم والعنوان والشعار والصورة واسم الامتحان',
//     zRibbon: 'عبارة «بطاقة الدخول»',
//     zBody: 'بيانات الطالب',
//     zSign: 'التواقيع ورمز QR والمقعد',
//     up: 'أعلى',
//     down: 'أسفل',
//     resetAll: 'إعادة',
//     offsetHint: (n) =>
//       n === 0
//         ? 'الموضع الأصلي'
//         : `${toLangDigit(Math.abs(n), 'ar')} بكسل ${n < 0 ? 'أعلى' : 'أسفل'} (${toLangDigit(Math.abs(n) * 3, 'ar')} بكسل في الصورة)`,
//     editTitle: 'ضبط مناطق التصميم',
//     save: 'حفظ',
//     saving: 'جارٍ الحفظ...',
//     saveOk: 'تم حفظ المناطق',
//     adjustBtn: 'ضبط المناطق',
//     previewNote: 'الاسم والعنوان واسم الامتحان والعبارة والبيانات والتواقيع يضعها التطبيق.',
//     upload: 'رفع',
//     uploading: 'جارٍ الرفع...',
//     cancel: 'إلغاء',
//     delete: 'حذف',
//     deleteAsk: 'حذف هذا التصميم؟',
//     deleteNote: 'لن يمكن طباعة البطاقات المصممة به.',
//     uploaded: 'مرفوع',
//     uploadOk: 'تم حفظ التصميم',
//     errNoFile: 'اختر صورة أولاً',
//     errType: 'يُسمح بصور PNG أو JPG فقط',
//     errBytes: (b) => `يجب ألا يتجاوز حجم الصورة ${b}`,
//     errUnreadable: 'تعذّرت قراءة الصورة',
//     errExact: (exact, got) =>
//       `المقاس غير مطابق — صورتك ${got} بكسل والمطلوب ${exact} بكسل تماماً`,
//     errUpload: 'فشل الرفع',
//   },
// };

// export const getUploadUIText = (key, lang) =>
//   UPLOAD_UI[lang]?.[key] ?? UPLOAD_UI.bn[key];

// /** যাচাইয়ের ফল → পর্দায় দেখানোর বার্তা */
// export const uploadErrorText = (code, mode, lang, size = null) => {
//   const spec = getUploadSpec(mode);
//   const t = (k) => getUploadUIText(k, lang);
//   const exact = formatSize(spec.width, spec.height, lang);

//   switch (code) {
//     case 'noFile':
//       return t('errNoFile');
//     case 'type':
//       return t('errType');
//     case 'bytes':
//       return t('errBytes')(formatBytes(spec.maxBytes, lang));
//     case 'unreadable':
//       return t('errUnreadable');
//     case 'exact':
//       return t('errExact')(
//         exact,
//         size ? formatSize(size.w, size.h, lang) : '—'
//       );
//     default:
//       return t('errUpload');
//   }
// };

// /** চারটে ঘরের পর্দার নাম — OFFSET_KEYS এর ক্রমেই */
// export const OFFSET_LABELS = {
//   headerOffsetY: 'zHeader',
//   ribbonOffsetY: 'zRibbon',
//   bodyOffsetY: 'zBody',
//   signOffsetY: 'zSign',
// };

// export const getOffsetLabel = (key, lang) =>
//   getUploadUIText(OFFSET_LABELS[key] || 'zHeader', lang);
