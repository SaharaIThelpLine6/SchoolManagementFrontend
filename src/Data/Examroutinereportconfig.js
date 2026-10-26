// =============================================================================
// পরীক্ষার রুটিন (গ্রিড) — পাতার লেখা ও ছোট সহায়কগুলো
//
// admitCardConfig.js এর ধাঁচেই — ভাষা তিনটা (bn / en / ar), আর নাম বাছা,
// অঙ্ক বদলানো, তারিখ সাজানোর কাজগুলো এক জায়গাতেই। পাতার ফাইলটা তাই শুধু
// দেখানোর কাজ করে, লেখা খুঁজতে হয় না।
// =============================================================================

export const RR_LANGS = [
  { id: 'bn', label: 'বাংলা' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
];

export const DEFAULT_RR_LANG = 'bn';

export const getRRDir = (lang) => (lang === 'ar' ? 'rtl' : 'ltr');

// ---------------------------------------------------------------------------
// বেলা — চারটা, সবসময় এই ক্রমে।
//
// ভাগটা হয় সার্ভারে, Exam_Routine.StartTime দেখে:
//   সকাল  ঘন্টা ০–১১   (১২:০০ রাত  — ১১:৫৯ সকাল)
//   দুপুর ঘন্টা ১২–১৫  (১২:০০ দুপুর — ৩:৫৯ বিকাল)
//   বিকাল ঘন্টা ১৬–১৮  (৪:০০ বিকাল  — ৬:৫৯ সন্ধ্যা)
//   রাত   ঘন্টা ১৯–২৩  (৭:০০ রাত    — ১১:৫৯ রাত)
//
// এখানে শুধু নামগুলো — ভাগের নিয়মটা এক জায়গাতেই (সার্ভারে) থাকে, যাতে
// দুই জায়গায় দুই হিসাব হয়ে না যায়।
// ---------------------------------------------------------------------------
export const SHIFT_ORDER = ['morning', 'noon', 'evening', 'night'];

const SHIFT_LABEL = {
  morning: { bn: 'সকাল', en: 'Morning', ar: 'صباحًا' },
  noon: { bn: 'দুপুর', en: 'Noon', ar: 'ظهرًا' },
  evening: { bn: 'বিকাল', en: 'Afternoon', ar: 'عصرًا' },
  night: { bn: 'রাত', en: 'Night', ar: 'ليلًا' },
};

export const getShiftText = (shift, lang = 'bn') =>
  SHIFT_LABEL[shift]?.[lang] ?? SHIFT_LABEL[shift]?.bn ?? '';

// ---------------------------------------------------------------------------
// অঙ্ক — ১৫, 15, ١٥
// ---------------------------------------------------------------------------
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const toLangDigit = (value, lang = 'bn') => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (lang === 'en') return text.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  const table = lang === 'ar' ? AR_DIGITS : BN_DIGITS;
  return text.replace(/[0-9]/g, (d) => table[Number(d)]);
};

// ---------------------------------------------------------------------------
// বার — সার্ভার ExamDay এর লেখাটাই পাঠায় (বা তারিখ থেকে গুনে বাংলা নাম)।
// ইংরেজি/আরবি মোডে বাংলা নামটা চিনে অনুবাদ করা হয়; না চিনলে যা এসেছে
// তাই বসে — মাদরাসার নিজের হাতে লেখা বারকে আমরা কখনো মুছে দিই না।
// ---------------------------------------------------------------------------
const WEEKDAY = {
  রবিবার: { en: 'Sunday', ar: 'الأحد' },
  সোমবার: { en: 'Monday', ar: 'الإثنين' },
  মঙ্গলবার: { en: 'Tuesday', ar: 'الثلاثاء' },
  বুধবার: { en: 'Wednesday', ar: 'الأربعاء' },
  বৃহস্পতিবার: { en: 'Thursday', ar: 'الخميس' },
  শুক্রবার: { en: 'Friday', ar: 'الجمعة' },
  শনিবার: { en: 'Saturday', ar: 'السبت' },
};

export const getDayText = (col, lang = 'bn') => {
  const raw = col?.Day;
  if (!raw) return '';
  const text = String(raw).trim();
  if (lang === 'bn') return text;
  return WEEKDAY[text]?.[lang] ?? text;
};

/**
 * কলামের তারিখ।
 *
 * বাংলা মোডে মাদরাসার নিজের লেখা BnExamDate থাকলে সেটাই — কাগজে ওটাই
 * চলে আসছে বছরের পর বছর। না থাকলে ১৫/১০/২০২৬ ধাঁচে বানানো হয়।
 */
export const getDateText = (col, lang = 'bn') => {
  if (!col) return '';
  if (lang === 'bn' && col.BnExamDate && String(col.BnExamDate).trim()) {
    return String(col.BnExamDate).trim();
  }
  return toLangDigit(col.DateText ?? '', lang);
};

// ---------------------------------------------------------------------------
// নাম — ভাষা অনুযায়ী, না পেলে বাংলাটাই (ফাঁকা ঘরের চেয়ে ভালো)
// ---------------------------------------------------------------------------
const byLang = (obj, bnKey, araKey, engKey, lang) => {
  if (!obj) return '';
  const pick =
    lang === 'ar' ? obj[araKey] : lang === 'en' ? obj[engKey] : obj[bnKey];
  const fallback = obj[bnKey] ?? obj[engKey] ?? obj[araKey];
  const value = pick ?? fallback;
  return value === null || value === undefined ? '' : String(value);
};

export const getSubClassText = (row, lang = 'bn') =>
  byLang(row, 'SubClass', 'SubClassAra', 'SubClassEng', lang);

export const getClassText = (row, lang = 'bn') =>
  byLang(row, 'ClassName', 'ClassAra', 'ClassEng', lang);

export const getSubjectText = (item, lang = 'bn') =>
  byLang(item, 'SubjectName', 'SubjectNameAra', 'SubjectNameEng', lang);

export const getInstituteName = (header, lang = 'bn') =>
  byLang(header, 'InstitutionName', 'AraInstitutionName', 'EngInstitutionName', lang);

export const getInstituteAddress = (header, lang = 'bn') =>
  byLang(header, 'Address', 'AraAddress', 'Address', lang);

export const getExamText = (header, lang = 'bn') =>
  byLang(header, 'ExamName', 'ExamAraName', 'ExamEngName', lang);

export const getSessionText = (header, lang = 'bn') =>
  byLang(header, 'SessionName', 'SessionAraName', 'SessionEngName', lang);

/** একটা ঘরের সব কিতাব — একাধিক হলে একটার নিচে আরেকটা */
export const getCellText = (list, lang = 'bn') =>
  (list || []).map((x) => getSubjectText(x, lang)).filter(Boolean);

/** ঘরের কক্ষ — RoomName থাকলে নাম, নইলে নম্বর, কিছু না থাকলে ফাঁকা */
export const getRoomText = (item, lang = 'bn') => {
  const name = item?.RoomName;
  if (name && String(name).trim()) return String(name).trim();
  const no = item?.RoomNo;
  if (no === null || no === undefined || String(no).trim() === '') return '';
  return toLangDigit(String(no).trim(), lang);
};

/**
 * ঘরের সময় — "৯:৩০ AM – ১২:২০ PM"।
 *
 * যা জমা আছে হুবহু তাই দেখানো হয়, শুধু অঙ্কগুলো ভাষা অনুযায়ী বদলায়।
 * ইচ্ছে করেই নতুন করে সাজানো হয় না: রুটিনে কোনো সারির সময় ভুল ধাঁচে
 * (AM/PM উল্টে বা ২৪ ঘণ্টায়) জমা থাকলে কাগজেই সেটা চোখে পড়ুক, সাজিয়ে
 * দিলে ভুলটা ঢাকা পড়ে যেত।
 *
 * দুইটার একটা না থাকলে যেটা আছে সেটাই বসে; দুইটাই না থাকলে ঘর ফাঁকা।
 */
export const getTimeText = (item, lang = 'bn') => {
  const clean = (v) => {
    const t = v === null || v === undefined ? '' : String(v).trim();
    return t ? toLangDigit(t, lang) : '';
  };

  const from = clean(item?.StartTime);
  const to = clean(item?.EndTime);

  if (from && to) return `${from} – ${to}`;
  return from || to || '';
};

// ---------------------------------------------------------------------------
// সময়ের লাইন — "পরীক্ষার সময়সূচী:- সকাল ৯:০০ থেকে ১২:০০ পর্যন্ত এবং
// বিকাল ২:৩০ থেকে ৫:০০ পর্যন্ত।"
//
// চারটা বেলার যেগুলোতে আসলেই পরীক্ষা আছে কেবল সেগুলোই বসে, ক্রম মেনে।
// সময় একটাও না পেলে লাইনটাই বসে না — ভুল সময় ছাপার চেয়ে না ছাপা ভালো।
// ---------------------------------------------------------------------------
export const buildTimeNote = (times, lang = 'bn') => {
  const words =
    lang === 'en'
      ? { head: 'Exam time: ', and: ' and ', comma: ', ', stop: '.' }
      : lang === 'ar'
        ? { head: 'وقت الامتحان: ', and: ' و ', comma: '، ', stop: '.' }
        : { head: 'পরীক্ষার সময়সূচী:- ', and: ' এবং ', comma: ', ', stop: '।' };

  const part = (shift) => {
    const slot = times?.[shift];
    if (!slot || (!slot.start && !slot.end)) return '';

    const word = getShiftText(shift, lang);
    const from = toLangDigit(slot.start ?? '', lang);
    const to = toLangDigit(slot.end ?? '', lang);

    if (lang === 'en') return `${word} ${from}${to ? ` to ${to}` : ''}`;
    if (lang === 'ar') return `${word} ${from}${to ? ` إلى ${to}` : ''}`;
    return `${word} ${from}${to ? ` থেকে ${to} পর্যন্ত` : ''}`;
  };

  const bits = SHIFT_ORDER.map(part).filter(Boolean);
  if (!bits.length) return '';

  // শেষেরটার আগে "এবং", বাকিগুলোর মাঝে কমা
  const text =
    bits.length === 1
      ? bits[0]
      : `${bits.slice(0, -1).join(words.comma)}${words.and}${bits[bits.length - 1]}`;

  return `${words.head}${text}${words.stop}`;
};

// ---------------------------------------------------------------------------
// পাতার লেখা
// ---------------------------------------------------------------------------
const RR_UI = {
  bn: {
    session: 'শিক্ষাবর্ষ',
    examName: 'পরীক্ষার নাম',
    mainClass: 'জামাত',
    subClass: 'শ্রেণি/শাখা',
    allClass: 'সকল জামাত',
    allSubClass: 'সকল শ্রেণি',
    language: 'ভাষা',
    print: 'প্রিন্ট',
    date: 'তারিখ',
    time: 'সময়',
    classCol: 'শ্রেণি',
    routineOf: (exam, session) => `${exam} ${session} ইং এর রুটিন`,
    routineTitle: 'পরীক্ষার রুটিন',
    note: 'বি:দ্র:',
    principal: 'মুহতামিম/প্রধান শিক্ষক',
    loading: 'অপেক্ষা করুন…',
    filterFirst: 'শিক্ষাবর্ষ ও পরীক্ষা বাছাই করুন।',
    noRoutine: 'এই পরীক্ষার কোনো রুটিন এখনো তৈরি করা হয়নি।',
    hideEmptyRow: 'খালি শ্রেণি লুকাও',
    hideEmptyShift: 'খালি বেলার ঘর লুকাও',
    showClassCol: 'জামাতের কলাম',
    showRoom: 'কক্ষ নং',
    showTime: 'সময়',
    watermark: 'ওয়াটারমার্ক',
    rowCount: (n) => `${n} টি শ্রেণি`,
    dayCount: (n) => `${n} দিন`,
  },
  en: {
    session: 'Session',
    examName: 'Exam',
    mainClass: 'Class',
    subClass: 'Sub class',
    allClass: 'All classes',
    allSubClass: 'All sub classes',
    language: 'Language',
    print: 'Print',
    date: 'Date',
    time: 'Time',
    classCol: 'Class',
    routineOf: (exam, session) => `Routine of ${exam} ${session}`,
    routineTitle: 'Exam Routine',
    note: 'N.B.',
    principal: 'Principal',
    loading: 'Please wait…',
    filterFirst: 'Select a session and an exam.',
    noRoutine: 'No routine has been created for this exam yet.',
    hideEmptyRow: 'Hide empty classes',
    hideEmptyShift: 'Hide empty time slots',
    showClassCol: 'Class column',
    showRoom: 'Room no',
    showTime: 'Time',
    watermark: 'Watermark',
    rowCount: (n) => `${n} classes`,
    dayCount: (n) => `${n} days`,
  },
  ar: {
    session: 'العام الدراسي',
    examName: 'الامتحان',
    mainClass: 'الجماعة',
    subClass: 'الصف',
    allClass: 'كل الجماعات',
    allSubClass: 'كل الصفوف',
    language: 'اللغة',
    print: 'طباعة',
    date: 'التاريخ',
    time: 'الوقت',
    classCol: 'الصف',
    routineOf: (exam, session) => `جدول ${exam} ${session}`,
    routineTitle: 'جدول الامتحان',
    note: 'ملاحظة:',
    principal: 'المدير',
    loading: 'يرجى الانتظار…',
    filterFirst: 'اختر العام الدراسي والامتحان.',
    noRoutine: 'لم يتم إنشاء جدول لهذا الامتحان بعد.',
    hideEmptyRow: 'إخفاء الصفوف الفارغة',
    hideEmptyShift: 'إخفاء الأوقات الفارغة',
    showClassCol: 'عمود الجماعة',
    showRoom: 'رقم القاعة',
    showTime: 'الوقت',
    watermark: 'العلامة المائية',
    rowCount: (n) => `${n} صفوف`,
    dayCount: (n) => `${n} أيام`,
  },
};

export const getRRText = (key, lang = 'bn') => RR_UI[lang]?.[key] ?? RR_UI.bn[key];
