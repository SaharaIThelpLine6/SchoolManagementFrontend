// ---------------------------------------------------------------------------
// সিট কার্ডের ডিজাইন টেমপ্লেট
//
// ⭐ ভাগটা ইচ্ছে করেই দুইভাগে:
//
//     seatCardFields.js   → কার্ডে কোন কোন তথ্য বসবে (নাম, আইডি, জামাত…)
//     seatCardTemplates.js → সেই তথ্যগুলো দেখতে কেমন হবে (এই ফাইল)
//
// তাই টেমপ্লেট বদলালে কোনো তথ্য হারায় না — আপনার বাছাই করা সব ঘরই থাকে,
// শুধু চেহারাটা বদলায়। ডেমো ডিজাইনগুলোয় কম ঘর দেখা গেলেও সেটা ডিজাইনের
// দোষ নয়; ওখানে কম ঘর বাছা ছিল। এখানে প্রতিটা টেমপ্লেটই যত ঘর দেওয়া হয়
// সবগুলো বসাতে পারে।
//
// টেমপ্লেট নিজে কোনো CSS লেখে না — শুধু কিছু মান (token) দেয়। কার্ডের
// কম্পোনেন্ট সেগুলো CSS ভেরিয়েবল হিসেবে বসায় (নিচের cssVars দেখুন)।
// নতুন ডিজাইন যোগ করতে হলে নিচের তালিকায় একটা অবজেক্ট বসালেই হয়, কোনো
// কম্পোনেন্টে হাত দিতে হয় না।
// ---------------------------------------------------------------------------

/* ───────────────────────────────────────────────────────────────────────────
   লেখার আকার

   কার্ডের সব লেখা একটা অনুপাতে ছোট-বড় হয় — ১০০ মানে এখনকার মাপ।
   প্রতিটা ঘরের আলাদা মাপ না দিয়ে একটাই গুণক, কারণ কার্ড ছোট; একটা ঘর
   বড় করলে বাকিগুলোর সাথে অনুপাত নষ্ট হয়ে চেহারাই বিগড়ে যায়।
   ─────────────────────────────────────────────────────────────────────────── */
export const FONT_SCALE_MIN = 70;
export const FONT_SCALE_MAX = 140;
export const FONT_SCALE_DEFAULT = 100;

export const clampFontScale = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return FONT_SCALE_DEFAULT;
  return Math.min(Math.max(Math.round(n), FONT_SCALE_MIN), FONT_SCALE_MAX);
};

/* ───────────────────────────────────────────────────────────────────────────
   জলছাপের ঘনত্ব

   শতাংশে রাখা (৩–৪০), কাগজে ভগ্নাংশে বসে। ফি তালিকায় ঠিক এই নিয়মেই আছে,
   তাই দুই জায়গায় একই রকম আচরণ।

   ৪০ এর বেশি দিলে লোগোটা লেখার উপর এসে পড়ে, আর ৩ এর নিচে কাগজে কিছুই
   বোঝা যায় না — তাই দুই দিকেই সীমা।
   ─────────────────────────────────────────────────────────────────────────── */
export const WATERMARK_MIN = 3;
export const WATERMARK_MAX = 40;
export const WATERMARK_DEFAULT = 8;

export const clampWatermarkOpacity = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return WATERMARK_DEFAULT;
  return Math.min(Math.max(Math.round(n), WATERMARK_MIN), WATERMARK_MAX);
};

/* ───────────────────────────────────────────────────────────────────────────
   টেমপ্লেটের ঘরগুলো কী বোঝায়

   frame      কার্ডের বাইরের রেখা — style ('solid' | 'dashed' | 'double' |
              'none'), color, radius (mm)
   density    'compact'  → সব উপর থেকে শুরু, বাড়তি জায়গা নিচে
              'spread'   → উপর-মাঝ-নিচে ছড়িয়ে বসে, ফাঁকা জায়গা থাকে না
   head       মাথার চেহারা — bg ('none' বা রঙ), color, divider (নিচে রেখা),
              logo ('none' | 'left' | 'right')
   title      শিরোনামের পট্টি — 'none' | 'pill' (গোল) | 'box' (চৌকো)
   boxes      বড় ঘরগুলো (কলাম/বেঞ্চ/আসন) — 'joined' (একসাথে বাঁধানো),
              'separate' (আলাদা আলাদা), 'right' (ডান পাশে খাড়া),
              'none' (বড় ঘর নেই, তথ্যের লাইনেই বসে)
   details    নিচের তথ্যের লাইন — align, fill ('none' | 'dots' | 'line')
   sign       নিচে স্বাক্ষরের দুইটা ঘর থাকবে কি না

   ⚠️ এই ফাইলে কোনো তথ্যের নাম (UserName, UserCode…) নেই, ইচ্ছে করেই।
   কোন ঘর বসবে সেটা সেটিংসের কাজ, টেমপ্লেটের নয়।
   ─────────────────────────────────────────────────────────────────────────── */

export const SEAT_TEMPLATES = [
  {
    id: 'plain',
    title: 'সাদামাটা',
    note: 'সরল, বাঁধানো ঘর — কার্ডজুড়ে ছড়িয়ে বসে',
    frame: { style: 'solid', color: '#000000', radius: 0 },
    // ⭐ 'compact' ছিল, তাই সব লেখা উপরে জমে নিচে বড় ফাঁকা পড়ে থাকত।
    // এটাই ডিফল্ট টেমপ্লেট, তাই এখানেই 'spread' করা হলো — কিছু না
    // বেছেও কার্ডটা আর ফাঁকা ফাঁকা লাগে না।
    density: 'spread',
    head: { bg: 'none', color: '#000000', divider: false, logo: 'none' },
    title_: 'none',
    boxes: 'joined',
    details: { align: 'left', fill: 'none' },
    sign: false,
  },

  {
    // ডেমো ১ — Khan International School এর ধাঁচ
    id: 'classic',
    title: 'ক্লাসিক',
    note: 'ডান পাশে লোগো, শিরোনামে গোল পট্টি, ডানে আসনের ঘর',
    frame: { style: 'solid', color: '#000000', radius: 0 },
    density: 'spread',
    head: { bg: 'none', color: '#000000', divider: true, logo: 'right' },
    title_: 'pill',
    boxes: 'right',
    details: { align: 'left', fill: 'line' },
    sign: false,
  },

  {
    // ডেমো ২ — কওমী মাদরাসার প্রবেশপত্রের ধাঁচ
    id: 'form',
    title: 'ফরম',
    note: 'সব মাঝখানে, ফাঁকা ঘরে বিন্দুর রেখা, নিচে দুইটা স্বাক্ষর',
    frame: { style: 'solid', color: '#000000', radius: 0 },
    density: 'spread',
    head: { bg: 'none', color: '#000000', divider: false, logo: 'none' },
    title_: 'box',
    boxes: 'none',
    details: { align: 'left', fill: 'dots' },
    sign: true,
  },

  {
    // ডেমো ৩ — তায়কিয়াতুল উম্মাহ এর ধাঁচ
    id: 'simple',
    title: 'সরল',
    note: 'সব মাঝখানে, আইডির ঘরটা বাঁধানো',
    frame: { style: 'solid', color: '#000000', radius: 0 },
    density: 'spread',
    head: { bg: 'none', color: '#000000', divider: false, logo: 'none' },
    title_: 'none',
    boxes: 'separate',
    details: { align: 'center', fill: 'none' },
    sign: false,
  },

  {
    id: 'dashed',
    title: 'কাটা রেখা',
    note: 'কেটে নেওয়ার জন্য — চারপাশে ছেঁড়া রেখা',
    frame: { style: 'dashed', color: '#000000', radius: 0 },
    density: 'compact',
    head: { bg: 'none', color: '#000000', divider: true, logo: 'none' },
    title_: 'none',
    boxes: 'joined',
    details: { align: 'left', fill: 'none' },
    sign: false,
  },

  {
    id: 'double',
    title: 'দুই রেখা',
    note: 'চারপাশে দুইটা রেখা, শিরোনামে চৌকো পট্টি',
    frame: { style: 'double', color: '#000000', radius: 0 },
    density: 'spread',
    head: { bg: 'none', color: '#000000', divider: false, logo: 'left' },
    title_: 'box',
    boxes: 'joined',
    details: { align: 'left', fill: 'none' },
    sign: false,
  },

  {
    id: 'color',
    title: 'রঙিন',
    note: 'মাথায় রঙিন পট্টি, কোনা গোল',
    frame: { style: 'solid', color: '#c7d2fe', radius: 2 },
    density: 'spread',
    head: { bg: '#4f46e5', color: '#ffffff', divider: false, logo: 'left' },
    title_: 'none',
    boxes: 'separate',
    details: { align: 'left', fill: 'none' },
    sign: false,
  },

  {
    id: 'green',
    title: 'সবুজ',
    note: 'সবুজ রেখা ও পট্টি',
    frame: { style: 'solid', color: '#0f5132', radius: 1 },
    density: 'spread',
    head: { bg: '#0f5132', color: '#ffffff', divider: false, logo: 'left' },
    title_: 'pill',
    boxes: 'joined',
    details: { align: 'left', fill: 'none' },
    sign: false,
  },
];

export const DEFAULT_SEAT_TEMPLATE = 'plain';

/** আইডি ধরে টেমপ্লেট — না পেলে ডিফল্টটা, তাই কখনো undefined যায় না */
export const getSeatTemplate = (id) =>
  SEAT_TEMPLATES.find((t) => t.id === String(id)) ||
  SEAT_TEMPLATES.find((t) => t.id === DEFAULT_SEAT_TEMPLATE);

/** বাইরের রেখার CSS মান — 'none' হলে রেখা বসে না */
export const frameCss = (frame) => {
  const f = frame || {};
  if (f.style === 'none') return 'none';
  const width = f.style === 'double' ? '1mm' : '0.4mm';
  return `${width} ${f.style || 'solid'} ${f.color || '#000000'}`;
};

/**
 * টেমপ্লেট + লেখার আকার → CSS ভেরিয়েবল।
 *
 * কার্ডের কম্পোনেন্ট এগুলো style={} এ বসিয়ে দেয়, আর CSS এ শুধু
 * var(--sc-…) লেখা থাকে। ফলে টেমপ্লেট বদলালে কম্পোনেন্টে কোনো শর্ত
 * লিখতে হয় না — মানগুলোই বদলে যায়।
 *
 * মাপগুলো pt এ, px এ নয় — px পর্দার DPI অনুযায়ী বদলায়, pt বদলায় না।
 * তাই যে কম্পিউটার থেকেই ছাপা হোক কাগজে একই মাপ বসে।
 */
export const cssVars = (template, fontScale = FONT_SCALE_DEFAULT) => {
  const t = getSeatTemplate(template?.id ?? template);
  const k = clampFontScale(fontScale) / 100;

  // ভিত্তি মাপগুলো (pt) — এখান থেকেই সব হিসাব
  const pt = (n) => `${Math.round(n * k * 10) / 10}pt`;

  return {
    '--sc-frame': frameCss(t.frame),
    '--sc-radius': `${t.frame?.radius ?? 0}mm`,

    '--sc-head-bg': t.head?.bg === 'none' ? 'transparent' : t.head.bg,
    '--sc-head-color': t.head?.color || '#000000',
    '--sc-head-divider':
      t.head?.divider ? `0.4mm solid ${t.frame?.color || '#000000'}` : 'none',

    // লেখার মাপ — এগুলো একই গুণকে ছোট-বড় হয়
    '--sc-name': pt(12),     // প্রতিষ্ঠানের নাম
    '--sc-sub': pt(8),       // ঠিকানা, পরীক্ষা
    '--sc-title': pt(10),    // শিরোনামের পট্টি
    '--sc-detail': pt(9),    // নিচের তথ্যের লাইন
    '--sc-sign': pt(7.5),    // স্বাক্ষরের লেখা

    /* ⭐ বড় ঘরের মাপ বাঁধা — স্লাইডারে ছোট-বড় হয় না।
     *
     * আগে হত, তাতে ১২৫% এ গিয়ে "বেঞ্চ নং" এর মান ঘরে আঁটত না, কেটে
     * "…" হয়ে যেত — ঘরটার চওড়া তো বাড়ে না, কার্ডের তিন ভাগের এক ভাগই
     * থাকে। আসন নম্বরটাই কার্ডের সবচেয়ে জরুরি জিনিস, ওটা কেটে যাওয়া
     * চলে না। তাই এই তিনটা মাপ সব জায়গায় এক, বাকি সব লেখা স্লাইডারে
     * ছোট-বড় হয়। */
    '--sc-box-lbl': '7.5pt',  // বড় ঘরের নাম
    '--sc-box-val': '17pt',   // বড় ঘরের মান, সংখ্যা হলে
    '--sc-box-txt': '10pt',   // মানটা লেখা হলে ("কলাম ৩") — আরো ছোট

    // ছড়িয়ে বসবে নাকি উপর থেকে — "অনেক ফাঁকা" লাগার মূল কারণ এটাই
    '--sc-justify': t.density === 'spread' ? 'space-between' : 'flex-start',
  };
};

/** টেমপ্লেটে নিচে স্বাক্ষরের ঘর আছে কি না */
export const hasSignRow = (template) => Boolean(getSeatTemplate(template)?.sign);

/** বড় ঘরগুলো কোন সাজে বসবে */
export const boxLayout = (template) => getSeatTemplate(template)?.boxes || 'joined';

/** নিচের তথ্যের লাইনে ফাঁকা জায়গা কীভাবে ভরবে */
export const detailFill = (template) =>
  getSeatTemplate(template)?.details?.fill || 'none';

/** মাথায় লোগো কোথায় — 'none' | 'left' | 'right' */
export const headLogoSide = (template) =>
  getSeatTemplate(template)?.head?.logo || 'none';

/** শিরোনামের পট্টি — 'none' | 'pill' | 'box' */
export const titleStyle = (template) => getSeatTemplate(template)?.title_ || 'none';

/** নিচের তথ্যের লাইন কোন দিকে — 'left' | 'center' */
export const detailAlign = (template) =>
  getSeatTemplate(template)?.details?.align || 'left';
