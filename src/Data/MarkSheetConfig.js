// ---------------------------------------------------------------------------
// Mark Sheet (মার্কশিট) — shared language config
//
// Built the same way as admitCardConfig.js: every fixed word printed on a
// mark sheet lives here in Bangla, English and Arabic, and the templates
// only ask for a key. Adding a language means adding one block below —
// no template file has to change.
//
// Used by MarkSheetPdf.jsx (all templates) and MarkSheet.jsx (the page).
// ---------------------------------------------------------------------------

export const MARK_SHEET_LANGS = [
  { id: 'bn', label: 'বাংলা' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'আরবী' },
];

export const DEFAULT_MARK_SHEET_LANG = 'bn';

const isLang = (lang) => MARK_SHEET_LANGS.some((l) => l.id === lang);
const safeLang = (lang) => (isLang(lang) ? lang : DEFAULT_MARK_SHEET_LANG);

// The filter sends a number, everything below works on a code.
//   1 = Bangla   2 = Arabic   3 = English
export const LANG_ID_TO_CODE = { 1: 'bn', 2: 'en', 3: 'ar' };

export const toLangCode = (value) => {
  if (isLang(value)) return value;
  return LANG_ID_TO_CODE[Number(value)] ?? DEFAULT_MARK_SHEET_LANG;
};

// ---------------------------------------------------------------------------
// Every fixed word printed on a sheet
// ---------------------------------------------------------------------------

export const MARK_SHEET_TEXTS = {
  bn: {
    // Section headings
    studentInfo: 'পরীক্ষার্থীর তথ্য',
    markDistribution: 'নম্বর বিভাজন',
    subjectResult: 'বিষয়ভিত্তিক ফলাফল',
    summary: 'সারসংক্ষেপ',

    // Subject table headings
    serial: 'ক্রমিক',
    serialShort: 'ক্রম',
    subject: 'বিষয়',
    fullMark: 'পূর্ণমান',
    fullMarkShort: 'পূর্ণ',
    passMark: 'পাশমার্ক',
    passMarkAlt: 'পাশ নম্বর',
    passMarkShort: 'পাশ',
    highestMark: 'সর্বোচ্চ প্রাপ্ত',
    highestMarkAlt: 'সর্বোচ্চ নম্বর',
    highestMarkShort: 'সর্বোচ্চ',
    obtainedMark: 'প্রাপ্ত নম্বর',
    obtainedMarkShort: 'প্রাপ্ত',
    percentage: 'শতকরা',
    sum: 'যোগ',
    total: 'মোট',
    grandTotal: 'সর্বমোট',

    // Summary
    division: 'প্রাপ্ত বিভাগ',
    divisionShort: 'বিভাগ',
    meritPosition: 'মেধা স্থান',
    meritPositionShort: 'মেধা',
    average: 'গড়',
    totalMark: 'মোট নম্বর',
    totalSubjects: 'মোট বিষয়',
    totalDivisions: 'মোট বিভাগ',
    items: 'টি',
    divisionWord: 'বিভাগ',
    subjectWord: 'বিষয়',
    noDivision: 'কোনো বিভাগ পাওয়া যায়নি',
    noDivisionShort: 'কোনো বিভাগ নেই',
    noData: 'কোনো শিক্ষার্থীর ডেটা পাওয়া যায়নি',

    // Student fields
    name: 'নাম',
    studentName: 'পরীক্ষার্থীর নাম',
    fatherName: 'পিতার নাম',
    motherName: 'মাতার নাম',
    dob: 'জন্ম তারিখ',
    registration: 'দাখেলা',
    registrationShort: 'আইডি',
    admission: 'ভর্তি নং',
    totalStudents: 'মোট পরীক্ষার্থীর সংখ্যা',

    // Exam / class / session
    exam: 'পরীক্ষা',
    className: 'শ্রেণী',
    classNameAlt: 'মারহালা/শ্রেণী',
    session: 'সেশন',
    academicYear: 'শিক্ষাবর্ষ',
    volume: 'খণ্ড',
    date: 'তারিখ',
    ad: 'ইং',

    // Comments and signatures
    classTeacherCommentSign: 'শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর',
    guardianCommentSign: 'অভিভাবকের মন্তব্য ও স্বাক্ষর',
    classTeacherComment: 'শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য',
    classTeacherCommentShort: 'শ্রেণী শিক্ষকের মন্তব্য',
    guardianComment: 'অভিভাবকের মন্তব্য',
    fromClassTeacher: 'শ্রেণী শিক্ষক/শিক্ষিকার পক্ষ থেকে',
    fromGuardian: 'অভিভাবকের পক্ষ থেকে',
    classTeacher: 'শ্রেণী শিক্ষক',
    classTeacherSign: 'শ্রেণী শিক্ষকের স্বাক্ষর',
    najem: 'নায়েবে তালিমাত',
    principal: 'মুহতামিম',

    // Titles and footer
    verify: 'যাচাই করুন',
    markSheet: 'মার্কশিট',
    markSheetAlt: 'নম্বর পত্র',
    gazette: 'ফলাফল গেজেট',
    academicRecord: 'একাডেমিক রেকর্ড',
    institutionalRecord: 'প্রাতিষ্ঠানিক একাডেমিক রেকর্ড',
    printedBy: 'দ্বারা মুদ্রিত',
    allRightsReserved: 'সর্বস্বত্ব সংরক্ষিত',
  },

  en: {
    studentInfo: "Candidate's Information",
    markDistribution: 'Mark Distribution',
    subjectResult: 'Subject-wise Result',
    summary: 'Summary',

    serial: 'SL',
    serialShort: 'SL',
    subject: 'Subject',
    fullMark: 'Full Mark',
    fullMarkShort: 'Full',
    passMark: 'Pass Mark',
    passMarkAlt: 'Pass Mark',
    passMarkShort: 'Pass',
    highestMark: 'Highest',
    highestMarkAlt: 'Highest Mark',
    highestMarkShort: 'Highest',
    obtainedMark: 'Obtained',
    obtainedMarkShort: 'Obtained',
    percentage: 'Percentage',
    sum: 'Total',
    total: 'Total',
    grandTotal: 'Grand Total',

    division: 'Division',
    divisionShort: 'Division',
    meritPosition: 'Position',
    meritPositionShort: 'Merit',
    average: 'Average',
    totalMark: 'Total Marks',
    totalSubjects: 'Total Subjects',
    totalDivisions: 'Total Divisions',
    items: '',
    divisionWord: 'divisions',
    subjectWord: 'subjects',
    noDivision: 'No division found',
    noDivisionShort: 'No division',
    noData: 'No student data found',

    name: 'Name',
    studentName: "Candidate's Name",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    dob: 'Date of Birth',
    registration: 'Registration',
    registrationShort: 'ID',
    admission: 'Admission No',
    totalStudents: 'Total Examinees',

    exam: 'Examination',
    className: 'Class',
    classNameAlt: 'Marhala / Class',
    session: 'Session',
    academicYear: 'Academic Year',
    volume: 'Volume',
    date: 'Date',
    ad: 'AD',

    classTeacherCommentSign: "Class Teacher's Comment & Signature",
    guardianCommentSign: "Guardian's Comment & Signature",
    classTeacherComment: "Class Teacher's Comment",
    classTeacherCommentShort: "Class Teacher's Comment",
    guardianComment: "Guardian's Comment",
    fromClassTeacher: 'From the Class Teacher',
    fromGuardian: 'From the Guardian',
    classTeacher: 'Class Teacher',
    classTeacherSign: "Class Teacher's Signature",
    najem: 'Naib-e-Talimat',
    principal: 'Principal',

    verify: 'Verify',
    markSheet: 'Mark Sheet',
    markSheetAlt: 'Mark Sheet',
    gazette: 'Result Gazette',
    academicRecord: 'Academic Record',
    institutionalRecord: 'Institutional Academic Record',
    printedBy: 'Printed by',
    allRightsReserved: 'All rights reserved',
  },

  ar: {
    studentInfo: 'بيانات الممتحن',
    markDistribution: 'توزيع الدرجات',
    subjectResult: 'النتيجة حسب المواد',
    summary: 'الملخص',

    serial: 'الرقم',
    serialShort: 'الرقم',
    subject: 'المادة',
    fullMark: 'الدرجة الكاملة',
    fullMarkShort: 'الكاملة',
    passMark: 'درجة النجاح',
    passMarkAlt: 'درجة النجاح',
    passMarkShort: 'النجاح',
    highestMark: 'أعلى درجة',
    highestMarkAlt: 'أعلى درجة',
    highestMarkShort: 'الأعلى',
    obtainedMark: 'الدرجة المحصلة',
    obtainedMarkShort: 'المحصلة',
    percentage: 'النسبة المئوية',
    sum: 'المجموع',
    total: 'المجموع',
    grandTotal: 'المجموع الكلي',

    division: 'التقدير',
    divisionShort: 'التقدير',
    meritPosition: 'الترتيب',
    meritPositionShort: 'الترتيب',
    average: 'المعدل',
    totalMark: 'مجموع الدرجات',
    totalSubjects: 'مجموع المواد',
    totalDivisions: 'مجموع التقديرات',
    items: '',
    divisionWord: 'تقدير',
    subjectWord: 'مادة',
    noDivision: 'لا يوجد تقدير',
    noDivisionShort: 'لا يوجد تقدير',
    noData: 'لا توجد بيانات للطالب',

    name: 'الاسم',
    studentName: 'اسم الممتحن',
    fatherName: 'اسم الأب',
    motherName: 'اسم الأم',
    dob: 'تاريخ الميلاد',
    registration: 'رقم التسجيل',
    registrationShort: 'الرقم',
    admission: 'رقم القيد',
    totalStudents: 'عدد الممتحنين',

    exam: 'الامتحان',
    className: 'الصف',
    classNameAlt: 'المرحلة / الصف',
    session: 'العام الدراسي',
    academicYear: 'العام الدراسي',
    volume: 'المجلد',
    date: 'التاريخ',
    ad: 'م',

    classTeacherCommentSign: 'ملاحظة وتوقيع معلم الصف',
    guardianCommentSign: 'ملاحظة وتوقيع ولي الأمر',
    classTeacherComment: 'ملاحظة معلم الصف',
    classTeacherCommentShort: 'ملاحظة معلم الصف',
    guardianComment: 'ملاحظة ولي الأمر',
    fromClassTeacher: 'من معلم الصف',
    fromGuardian: 'من ولي الأمر',
    classTeacher: 'معلم الصف',
    classTeacherSign: 'توقيع معلم الصف',
    najem: 'نائب التعليمات',
    principal: 'المهتمم',

    verify: 'تحقق',
    markSheet: 'كشف الدرجات',
    markSheetAlt: 'كشف الدرجات',
    gazette: 'جريدة النتائج',
    academicRecord: 'السجل الأكاديمي',
    institutionalRecord: 'السجل الأكاديمي المؤسسي',
    printedBy: 'طبع بواسطة',
    allRightsReserved: 'جميع الحقوق محفوظة',
  },
};

export const getMarkSheetText = (key, lang) => {
  const useLang = safeLang(toLangCode(lang));
  return MARK_SHEET_TEXTS[useLang]?.[key] ?? MARK_SHEET_TEXTS.bn[key] ?? '';
};

/** Arabic reads right to left */
export const getMarkSheetDir = (lang) =>
  safeLang(toLangCode(lang)) === 'ar' ? 'rtl' : 'ltr';

// ---------------------------------------------------------------------------
// Values that come from the database in more than one language
// ---------------------------------------------------------------------------

const pickFirst = (obj = {}, keys = []) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

/** Institution name and address, by language, falling back to Bangla */
export const INSTITUTION_LANG_KEYS = {
  // Institution_Information holds EngInstitutionName / AraInstitutionName and
  // EngAddress / AraAddress. The other spellings are kept behind them so an
  // older installation that named the columns differently still works.
  name: {
    bn: ['InstitutionName'],
    en: ['EngInstitutionName', 'InstitutionNameEng', 'InstitutionEngName', 'InstitutionName'],
    ar: ['AraInstitutionName', 'InstitutionNameAra', 'InstitutionAraName', 'InstitutionName'],
  },
  address: {
    bn: ['Address'],
    en: ['EngAddress', 'AddressEng', 'Address'],
    ar: ['AraAddress', 'AddressAra', 'Address'],
  },
  contact: {
    bn: ['ContactNumber'],
    en: ['ContactNumber'],
    ar: ['AraContactNumber', 'ContactNumber'],
  },
};

export const getInstitutionName = (info, lang) =>
  pickFirst(info, INSTITUTION_LANG_KEYS.name[safeLang(toLangCode(lang))]) ||
  pickFirst(info, INSTITUTION_LANG_KEYS.name.bn);

export const getInstitutionAddress = (info, lang) =>
  pickFirst(info, INSTITUTION_LANG_KEYS.address[safeLang(toLangCode(lang))]) ||
  pickFirst(info, INSTITUTION_LANG_KEYS.address.bn);

export const getInstitutionContact = (info, lang) =>
  pickFirst(info, INSTITUTION_LANG_KEYS.contact[safeLang(toLangCode(lang))]) ||
  pickFirst(info, INSTITUTION_LANG_KEYS.contact.bn);

/**
 * Which column holds a value in which language.
 * Missing here, or blank in the row, means the Bangla column is used.
 */
export const MARK_SHEET_LANG_KEYS = {
  StudentName: { en: 'StudentNameEng', ar: 'StudentNameAra' },
  FatherName: { en: 'FatherNameEng', ar: 'FatherNameAra' },
  MotherName: { en: 'MotherNameEng', ar: 'MotherNameAra' },
  ClassName: { en: 'EnglishClass', ar: 'ArabicClass' },
  SubClass: { en: 'SubClassEng', ar: 'SubClassAra' },
  SessionName: { en: 'SessionEngName', ar: 'SessionAraName' },
  ExamName: { en: 'ExamEngName', ar: 'ExamAraName' },
  SubjectName: { en: 'EngSubjectName', ar: 'ArabicSubject' },
  DivisionNames: { en: 'DivisionEnglishs', ar: 'DivisionArabics' },
};

/** One field of a row, in the chosen language, Bangla when it is missing */
export const getLangValue = (row = {}, fieldId, lang) => {
  const useLang = safeLang(toLangCode(lang));
  const key = MARK_SHEET_LANG_KEYS[fieldId]?.[useLang];

  if (key) {
    const alt = row?.[key];
    if (alt !== null && alt !== undefined && String(alt).trim() !== '') return alt;
  }

  return row?.[fieldId];
};

/** Same idea, but when the three values are already in hand */
export const pickLang = (bangla, arabic, english, lang) => {
  const useLang = safeLang(toLangCode(lang));
  const chosen = useLang === 'ar' ? arabic : useLang === 'en' ? english : bangla;
  const text = chosen === null || chosen === undefined ? '' : String(chosen).trim();

  return text !== '' ? chosen : bangla;
};

// ---------------------------------------------------------------------------
// Digits and dates
// ---------------------------------------------------------------------------

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Rewrites any digit — Latin, Bangla or Arabic — into the given set */
const convertDigits = (value, digits) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .split('')
    .map((ch) => {
      if (/[0-9]/.test(ch)) return digits[Number(ch)];

      const bn = banglaDigits.indexOf(ch);
      if (bn > -1) return digits[bn];

      const ar = arabicDigits.indexOf(ch);
      if (ar > -1) return digits[ar];

      return ch;
    })
    .join('');
};

/** Bangla → ০১২, Arabic → ٠١٢, English → 012 */
export const toLangDigit = (value, lang) => {
  if (value === null || value === undefined) return '';

  const useLang = safeLang(toLangCode(lang));
  if (useLang === 'en') return convertDigits(value, latinDigits);
  if (useLang === 'ar') return convertDigits(value, arabicDigits);

  return convertDigits(value, banglaDigits);
};

/**
 * Splits a date into day, month and year.
 * A string is not handed to new Date(), because "2011-10-12" is read as UTC
 * and could slip back a day depending on the time zone.
 */
export const parseDateParts = (value) => {
  if (!value && value !== 0) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return { d: value.getDate(), m: value.getMonth() + 1, y: value.getFullYear() };
  }

  const text = String(value).trim();
  if (!text) return null;

  const ymd = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) return { y: Number(ymd[1]), m: Number(ymd[2]), d: Number(ymd[3]) };

  const dmy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) return { d: Number(dmy[1]), m: Number(dmy[2]), y: Number(dmy[3]) };

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  return { d: parsed.getDate(), m: parsed.getMonth() + 1, y: parsed.getFullYear() };
};

/** Date → ১২/১০/২০১১. An unreadable value is returned as it came. */
export const formatMarkSheetDate = (value, lang) => {
  const parts = parseDateParts(value);
  if (!parts) return toLangDigit(value, lang);

  const dd = String(parts.d).padStart(2, '0');
  const mm = String(parts.m).padStart(2, '0');

  return toLangDigit(`${dd}/${mm}/${parts.y}`, lang);
};

/** The date printed beside a signature */
export const getPrintDate = (date = new Date(), lang) =>
  formatMarkSheetDate(date, lang);
