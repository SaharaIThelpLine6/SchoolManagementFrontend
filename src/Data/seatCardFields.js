// =============================================================================
// সিট কার্ডের ঘরগুলো
//
// ফি তালিকার feeListColumns এর হুবহু একই ধাঁচে — সেটিংস ব্রাউজারে
// (localStorage) সেভ থাকে, ভাষা ধরে আলাদা, আর ঘরের তালিকাটা এখানেই
// এক জায়গায় বাঁধা। নতুন ঘর লাগলে শুধু নিচের তালিকায় একটা লাইন —
// মডাল আর কাগজ, দুই জায়গাতেই চলে আসবে।
//
// প্রতিটি ঘরের যা যা আছে:
//   key      → সারির কোন মানটা
//   label    → সেটিংসে আর কাগজে যে নামে বসবে
//   section  → কার্ডের কোন ভাগে
//                'header'  উপরের মাঝখানে — প্রতিষ্ঠান, ঠিকানা, পরীক্ষা
//                'box'     মাঝের বড় ঘর — কলাম, বেঞ্চ, আসন নং
//                'detail'  নিচের বাঁ দিকের লাইন — নাম, আইডি, জামাত, হল
//   pad      → বড় ঘরে এক অঙ্কের সংখ্যা দুই ঘরে বসবে কি না (৩ → ০৩)
//
// ঘরটা কোন ভাগে বসবে সেটা এখানেই বাঁধা, ব্যবহারকারী শুধু দেখাবেন কি না
// আর ক্রমটা ঠিক করেন। এতে সেটিংসটা সহজ থাকে, কার্ডের চেহারাও এলোমেলো
// হয় না।
//
// src/Data/seatCardFields.js
// =============================================================================

export const SEAT_CARD_FIELDS = [
  // ---- কাগজের মাথা
  { key: 'InstitutionName', label: 'প্রতিষ্ঠানের নাম',  section: 'header', defaultOn: true },
  { key: 'Address',         label: 'ঠিকানা',            section: 'header', defaultOn: true },
  { key: 'ExamName',        label: 'পরীক্ষা ও শিক্ষাবর্ষ', section: 'header', defaultOn: true },

  // ---- বড় ঘর
  { key: 'ColumnNo',        label: 'কলাম',              section: 'box',    defaultOn: false },
  { key: 'BenchNo',         label: 'বেঞ্চ নং',          section: 'box',    defaultOn: true, pad: true },
  { key: 'SeatNum',         label: 'আসন নং',            section: 'box',    defaultOn: true, pad: true },

  // ---- নিচের তথ্য
  { key: 'UserName',        label: 'শিক্ষার্থীর নাম',   section: 'detail', defaultOn: true },
  { key: 'UserCode',        label: 'আইডি',              section: 'detail', defaultOn: true },
  { key: 'SubClass',        label: 'জামাত',             section: 'detail', defaultOn: true },
  { key: 'HallName',        label: 'হল',                section: 'detail', defaultOn: true },
];

export const SECTIONS = [
  { key: 'header', label: 'কাগজের মাথা' },
  { key: 'box',    label: 'বড় ঘর' },
  { key: 'detail', label: 'নিচের তথ্য' },
];

/** প্রতি পাতায় কয়টা কার্ড — ৮ (২×৪) বা ৬ (২×৩), অন্য কিছু এলে ৮ */
export const cardsPerPageCount = (value) => (Number(value) === 6 ? 6 : 8);

/** কার্ডের দাগ — কাটা না টানা */
export const borderStyleValue = (value) => (value === 'solid' ? 'solid' : 'dashed');

/** ভাষার আইডি → 'bn' বা 'ar' (১ = বাংলা, ২ = আরবি) */
export const langCode = (languageId) => (Number(languageId) === 2 ? 'ar' : 'bn');

export const fieldByKey = (key) => SEAT_CARD_FIELDS.find((f) => f.key === key) || null;

export const fieldsOfSection = (section) =>
  SEAT_CARD_FIELDS.filter((f) => f.section === section);

/** ডিফল্ট সেটিংস — কখনো সেভ না করলে এটাই চলে */
export const defaultSeatCardSettings = () => ({
  // কোন ঘরগুলো দেখাবে — তালিকার নিজের ক্রমেই
  visible: SEAT_CARD_FIELDS.filter((f) => f.defaultOn).map((f) => f.key),
  cardsPerPage: 8,
  borderStyle: 'dashed',
  showWatermark: true,
});

// সেটিংস ভাষা অনুযায়ী আলাদা রাখা হয় — ফি তালিকা যে নিয়মে রাখে
const storageKey = (languageId) => `examSeatCard:settings:${langCode(languageId)}`;

/** সেভ করা সেটিংস পড়া — না থাকলে বা নষ্ট থাকলে ডিফল্ট */
export const loadSeatCardSettings = (languageId = 1) => {
  const fallback = defaultSeatCardSettings();

  try {
    const raw = localStorage.getItem(storageKey(languageId));
    if (!raw) return fallback;

    const saved = JSON.parse(raw);

    // মুছে ফেলা পুরোনো key ছেঁটে ফেলি — নইলে তালিকা থেকে তুলে দেওয়া
    // ঘর ("পাশ" এর মতো) সেভ করা সেটিংসে রয়ে যেত
    const visible = (Array.isArray(saved.visible) ? saved.visible : []).filter((k) =>
      fieldByKey(k)
    );

    return {
      ...fallback,
      ...saved,
      // সব ঘর বাদ পড়লে ডিফল্টে ফিরি, নইলে কার্ডটা একদম ফাঁকা যেত
      visible: visible.length ? visible : fallback.visible,
      cardsPerPage: cardsPerPageCount(saved.cardsPerPage),
      borderStyle: borderStyleValue(saved.borderStyle),
      showWatermark: saved.showWatermark !== false,
    };
  } catch {
    return fallback;
  }
};

/** সেটিংস সেভ — ব্রাউজারে, তাই প্রতি ব্যবহারকারীর নিজের মতো থাকে */
export const saveSeatCardSettings = (languageId, settings) => {
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
 * এক ভাগের যে ঘরগুলো দেখাবে, সেভ করা ক্রমেই।
 * ক্রমটা visible তালিকার — মডালে টেনে সরালে কাগজেও সেই ক্রমে বসে।
 */
export const visibleFieldsOfSection = (settings, section) => {
  const order = Array.isArray(settings?.visible) ? settings.visible : [];

  return order
    .map((k) => fieldByKey(k))
    .filter((f) => f && f.section === section);
};

/**
 * একটা ঘর চালু/বন্ধ করা।
 *
 * চালু করলে ঘরটা তালিকার নিজের জায়গায় বসে, শেষে নয় — আগে শেষে যোগ হত
 * বলে যে ক্রমে টিক দেওয়া হত সেই ক্রমেই কাগজে বসে যেত। ফি তালিকার
 * toggleColumn ঠিক এই নিয়মেই চলে।
 */
export const toggleField = (visible, key) => {
  const list = visible || [];
  if (list.includes(key)) return list.filter((k) => k !== key);

  const order = SEAT_CARD_FIELDS.map((f) => f.key);
  return [...list, key].sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

/**
 * টেনে এনে ক্রম বদলানো — fromKey কে toKey এর জায়গায় বসায়, বাকিরা সরে যায়।
 * এক ভাগের ঘর অন্য ভাগে গিয়ে পড়ে না।
 */
export const reorderFields = (visible, fromKey, toKey) => {
  const list = [...(visible || [])];

  if (fieldByKey(fromKey)?.section !== fieldByKey(toKey)?.section) return list;

  const from = list.indexOf(fromKey);
  const to = list.indexOf(toKey);
  if (from < 0 || to < 0 || from === to) return list;

  list.splice(from, 1);
  list.splice(to, 0, fromKey);
  return list;
};

// ---- ছাপার সময় মান সাজানো -------------------------------------------------

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/** ইংরেজি সংখ্যা → বাংলা সংখ্যা */
export const toBn = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

/** মান আছে কি না — 0 ও "0" যেন ফাঁকা হিসেবে না ধরা পড়ে */
export const hasValue = (v) =>
  v !== null && v !== undefined && String(v).trim() !== '';
