// ---------------------------------------------------------------------------
// Admit Card (প্রবেশপত্র) — shared config
// ExamAdmitCard.jsx (editor) এবং AdmitCardGenerate.jsx (print) দুই জায়গাতেই ব্যবহার হয়
// ---------------------------------------------------------------------------

// প্রিভিউ কার্ডের বেস সাইজ (px)। প্রিন্টে এই সাইজটাকেই scale করা হয়।
export const CARD_W = 520;
export const CARD_H = 410;
export const CARD_RATIO = CARD_W / CARD_H;

// ---------------------------------------------------------------------------
// লেআউট জোন — সব টেমপ্লেটে এক, ১ নং ডিজাইনের মাপ অনুযায়ী।
// শুধু রঙ, ফ্রেম, ব্যাজ, ছবি আলাদা — হেডার, পরীক্ষার নাম, ফিল্ড, স্বাক্ষর
// সব একই জায়গায় বসে, তাই ৮টা ফিল্ড দিলেও কোনো টেমপ্লেটে ঠাসাঠাসি হবে না।
// ---------------------------------------------------------------------------
const ZONES = {
  headerHeight: 115,
  examTop: 90,
  examHeight: 20,
  bodyTop: 165,
  signatureHeight: 62,
  bodyBottom: 35,
};

// হেডারের ডান পাশে শিক্ষার্থীর ছবির মাপ — সব টেমপ্লেটে এক
const PHOTO = { photoW: 58, photoH: 74 };

// QR এর মাপ — স্বাক্ষরের জোনের সাথে মিলিয়ে
const QR_SIZE = 56;

export const ADMIT_TEMPLATES = [
  {
    id: '1',
    title: 'Blue-Green',
    variant: 'image',
    image: '/admitcard/admit-1.png',
    thumb: '/admitcard/admit-1.png',
    nameColor: 'black',
    addressColor: 'black',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#0d2c4b',
    labelColor: '#0d2c4b',
    accent: '#0d2c4b',
    examNameColor: '#0d2c4b',
    photoBorder: '#0d2c4b',
    signLineColor: '#0d2c4b',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#0d2c4b',
    ribbonCover: { top: 122, height: 32, width: 89 },
    ribbonCoverByLang: {
      en: { top: 127, height: 28, width: 84, fontSize: 10 },   // ADMIT CARD চওড়া
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },    // بطاقة الدخول ছোট
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },    // বাংলা মূল PNG দেখাবে
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: QR_SIZE,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 110,
    bodyTop: 185,
  },

  {
    id: '2',
    title: 'সাদা',
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
    qrSize: QR_SIZE,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    id: '3',
    title: 'মেরুন ফ্রেম',
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
    qrSize: QR_SIZE,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 110,
    bodyTop: 185,
  },

  {
    id: '4',
    title: 'নীল রেখা',
    variant: 'painted',
    cardBg: '#ffffff',
    frameStyle: 'edgebars',
    frameColor: '#1e3a8a',
    headerFill: 'none',
    headerDivider: 0,
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
    qrSize: QR_SIZE,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  // -------------------------------------------------------------------------
  // ইমেজ-ভিত্তিক টেমপ্লেট — PNG গুলো `/public/admitcard/` ফোল্ডারে।
  // ব্যাজ ছবির ভেতরেই, তাই ribbonStyle: 'none'।
  // -------------------------------------------------------------------------

  {
    id: '5',
    title: 'মেরুন জ্যামিতিক',
    variant: 'image',
    image: '/admitcard/admit-3.png',
    thumb: '/admitcard/admit-3.png',
    nameColor: '#7b1f2b',
    addressColor: '#7b1f2b',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#241014',
    labelColor: '#7b1f2b',
    accent: '#7b1f2b',
    examNameColor: '#7b1f2b',
    photoBorder: '#7b1f2b',
    signLineColor: '#7b1f2b',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#0d2c4b',
    ribbonCover: { top: 128, height: 26, width: 78 },
    ribbonCoverByLang: {
      en: { top: 127, height: 28, width: 84, fontSize: 10 },   // ADMIT CARD চওড়া
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },    // بطاقة الدخول ছোট
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },    // বাংলা মূল PNG দেখাবে
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: QR_SIZE,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 109,
    bodyTop: 185,
  },

  {
    id: '6',
    title: 'সবুজ-সোনালী কোনা',
    variant: 'image',
    image: '/admitcard/admit-4.png',
    thumb: '/admitcard/admit-4.png',
    nameColor: '#0f5132',
    addressColor: '#0f5132',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#14261c',
    labelColor: '#0f5132',
    accent: '#0f5132',
    examNameColor: '#0f5132',
    photoBorder: '#0f5132',
    signLineColor: '#0f5132',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#0d2c4b',
    ribbonCover: { top: 126, height: 32, width: 85 },
    ribbonCoverByLang: {
      en: { top: 126, height: 31, width: 74, fontSize: 10 },   // ADMIT CARD চওড়া
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },    // بطاقة الدخول ছোট
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },    // বাংলা মূল PNG দেখাবে
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: QR_SIZE,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 110,
    bodyTop: 185,
  },

  {
    id: '7',
    title: 'নীল তারা',
    variant: 'image',
    image: '/admitcard/admit-5.png',
    thumb: '/admitcard/admit-5.png',
    nameColor: '#1e3a8a',
    addressColor: '#1e3a8a',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#0f172a',
    labelColor: '#1e3a8a',
    accent: '#1e3a8a',
    examNameColor: '#1e3a8a',
    photoBorder: '#1e3a8a',
    signLineColor: '#1e3a8a',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#0d2c4b',
    ribbonCover: { top: 126, height: 32, width: 92 },
    ribbonCoverByLang: {
      en: { top: 126, height: 31, width: 84, fontSize: 10 },   // ADMIT CARD চওড়া
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },    // بطاقة الدخول ছোট
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },    // বাংলা মূল PNG দেখাবে
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: QR_SIZE,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 110,
    bodyTop: 185,
  },

  {
    id: '8',
    title: 'তিল সবুজ ঢাল',
    variant: 'image',
    image: '/admitcard/admit-6.png',
    thumb: '/admitcard/admit-6.png',
    nameColor: '#115e59',
    addressColor: '#115e59',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#0f172a',
    labelColor: '#115e59',
    accent: '#115e59',
    examNameColor: '#115e59',
    photoBorder: '#115e59',
    signLineColor: '#115e59',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#0d2c4b',
    ribbonCover: { top: 125, height: 32, width: 89 },
    ribbonCoverByLang: {
      en: { top: 126, height: 31, width: 84, fontSize: 10 },   // ADMIT CARD চওড়া
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },    // بطاقة الدخول ছোট
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },    // বাংলা মূল PNG দেখাবে
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: QR_SIZE,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    bodyBottom: 42,
    signPadX: 40,
    logoInset: 40,
    photoInset: 40,
    logoTop: '66%',
    photoTop: '70%',
    headerHeight: 135,
    examTop: 110,
    bodyTop: 185,
  },
];

export const getTemplate = (id) =>
  ADMIT_TEMPLATES.find((t) => String(t.id) === String(id)) || ADMIT_TEMPLATES[0];

// ---------------------------------------------------------------------------
// ভাষা
// ---------------------------------------------------------------------------

export const ADMIT_LANGS = [
  { id: 'bn', label: 'বাংলা' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'আরবী' },
];

export const DEFAULT_ADMIT_LANG = 'bn';

const isLang = (lang) => ADMIT_LANGS.some((l) => l.id === lang);
const safeLang = (lang) => (isLang(lang) ? lang : DEFAULT_ADMIT_LANG);

/** কার্ডের স্থির লেখা */
export const ADMIT_TEXTS = {
  bn: {
    ribbon: 'প্রবেশপত্র',
    dateLabel: 'তারিখ',
    najem: 'নায়েম',
    principal: 'মুহতামিম',
  },
  en: {
    ribbon: 'ADMIT CARD',
    dateLabel: 'Date',
    najem: 'Nazim',
    principal: 'Principal',
  },
  ar: {
    ribbon: 'بطاقة الدخول',
    dateLabel: 'التاريخ',
    najem: 'الناظم',
    principal: 'المهتمم',
  },
};

export const getAdmitText = (key, lang) =>
  ADMIT_TEXTS[safeLang(lang)]?.[key] ?? ADMIT_TEXTS.bn[key];

/** এডিটরের নিজের লেখা — ভাষা বোতাম চাপলে পুরো স্ক্রিন বদলায় */
export const ADMIT_UI = {
  bn: {
    pageTitle: 'প্রবেশপত্র',
    chooseDesign: 'প্রবেশপত্রের ডিজাইন বেছে নিন।',
    changeDesign: 'ডিজাইন পরিবর্তন করুন',
    selectTemplate: 'টেমপ্লেট নির্বাচন করুন',
    instituteName: 'প্রতিষ্ঠানের নাম',
    address: 'ঠিকানা',
    labelHint: 'লেবেলের ঘরে লিখে নাম বদলাতে পারবেন।',
    selectUpTo: (n) => `সর্বাধিক ${n}টি তথ্য নির্বাচন করুন`,
    canAddMore: (n) => `আরও ${n}টি তথ্য যোগ করতে পারবেন`,
    maxSelected: 'সর্বোচ্চ সংখ্যক তথ্য নির্বাচন করা হয়েছে',
    qr: 'QR কোড',
    photo: 'ছবি',
    signName: 'স্বাক্ষরের নাম',
    sign: 'স্বাক্ষর',
    date: 'তারিখ',
    session: 'শিক্ষাবর্ষ',
    examName: 'পরীক্ষার নাম',
    classJamaat: 'শ্রেণী/জামাত',
    residential: 'অবস্থান',
    studentId: 'শিক্ষার্থীর আইডি',
    reportType: 'রিপোর্টের ধরণ',
    colorSelect: 'কালার নির্বাচন করুন',
    blackWhite: 'সাদা-কালা',
    colored: 'রঙিন',
    preview: 'প্রিভিউ',
    print: 'প্রিন্ট',
    loading: 'লোড হচ্ছে...',
    searchHint: 'ফিল্টার দিয়ে শিক্ষার্থী খুঁজুন',
    ready: (n) => `${n} জনের প্রবেশপত্র প্রস্তুত — নিচে দেখুন।`,
    pickStudentTitle: 'শিক্ষার্থী নির্বাচন করুন',
    pickStudentText: 'অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।',
    pickReportTitle: 'রিপোর্ট টাইপ নির্বাচন করুন',
    pickReportText: 'কয়টি কার্ড এক পৃষ্ঠায় ছাপা হবে তা বেছে নিন।',
  },
  en: {
    pageTitle: 'Admit Card',
    chooseDesign: 'Choose an admit card design.',
    changeDesign: 'Change design',
    selectTemplate: 'Select a template',
    instituteName: 'Institution name',
    address: 'Address',
    labelHint: 'Type in the label box to rename a field.',
    selectUpTo: (n) => `Select up to ${n} fields`,
    canAddMore: (n) => `You can add ${n} more`,
    maxSelected: 'Maximum fields selected',
    qr: 'QR code',
    photo: 'Photo',
    signName: 'Signature name',
    sign: 'Signature',
    date: 'Date',
    session: 'Session',
    examName: 'Exam name',
    classJamaat: 'Class/Jamaat',
    residential: 'Residential',
    studentId: 'Student ID',
    reportType: 'Report type',
    colorSelect: 'Select color',
    blackWhite: 'Black & white',
    colored: 'Colored',
    preview: 'Preview',
    print: 'Print',
    loading: 'Loading...',
    searchHint: 'Use the filters to find students',
    ready: (n) => `${n} admit cards ready — see below.`,
    pickStudentTitle: 'Select a student',
    pickStudentText: 'Select at least one student.',
    pickReportTitle: 'Select a report type',
    pickReportText: 'Choose how many cards print per page.',
  },
  ar: {
    pageTitle: 'بطاقة الدخول',
    chooseDesign: 'اختر تصميم بطاقة الدخول.',
    changeDesign: 'تغيير التصميم',
    selectTemplate: 'اختر القالب',
    instituteName: 'اسم المؤسسة',
    address: 'العنوان',
    labelHint: 'اكتب في خانة التسمية لتغيير الاسم.',
    selectUpTo: (n) => `اختر حتى ${n} حقول`,
    canAddMore: (n) => `يمكنك إضافة ${n} أخرى`,
    maxSelected: 'تم اختيار الحد الأقصى من الحقول',
    qr: 'رمز QR',
    photo: 'الصورة',
    signName: 'اسم التوقيع',
    sign: 'التوقيع',
    date: 'التاريخ',
    session: 'العام الدراسي',
    examName: 'اسم الامتحان',
    classJamaat: 'الصف / الجماعة',
    residential: 'الإقامة',
    studentId: 'رقم الطالب',
    reportType: 'نوع التقرير',
    colorSelect: 'اختر اللون',
    blackWhite: 'أبيض وأسود',
    colored: 'ملون',
    preview: 'معاينة',
    print: 'طباعة',
    loading: 'جارٍ التحميل...',
    searchHint: 'استخدم عوامل التصفية للبحث عن الطلاب',
    ready: (n) => `${n} بطاقات جاهزة — انظر أدناه.`,
    pickStudentTitle: 'اختر طالبًا',
    pickStudentText: 'اختر طالبًا واحدًا على الأقل.',
    pickReportTitle: 'اختر نوع التقرير',
    pickReportText: 'اختر عدد البطاقات في كل صفحة.',
  },
};

export const getUIText = (key, lang) =>
  ADMIT_UI[safeLang(lang)]?.[key] ?? ADMIT_UI.bn[key];

/** আরবীতে লেখা ডান থেকে বামে */
export const getAdmitDir = (lang) => (safeLang(lang) === 'ar' ? 'rtl' : 'ltr');

// ---------------------------------------------------------------------------
// প্রতিষ্ঠানের নাম ও ঠিকানা — ভাষা অনুযায়ী
// settings API যে নামেই পাঠাক, নিচের তালিকার প্রথম অ-ফাঁকা মানটা নেওয়া হয়
// ---------------------------------------------------------------------------

export const INSTITUTE_LANG_KEYS = {
  name: {
    bn: ['InstitutionName'],
    en: ['InstitutionNameEng', 'InstitutionEngName', 'EngInstitutionName', 'InstitutionName'],
    ar: ['InstitutionNameAra', 'AraInstitutionName', 'InstitutionAraName', 'InstitutionName'],
  },
  address: {
    bn: ['Address'],
    en: ['AddressEng', 'EngAddress', 'Address'],
    ar: ['AraAddress', 'AddressAra', 'Address'],
  },
};

const pickFirst = (obj = {}, keys = []) => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== null && v !== undefined && String(v).trim() !== '') return v;
  }
  return '';
};

export const getInstituteName = (info, lang) =>
  pickFirst(info, INSTITUTE_LANG_KEYS.name[safeLang(lang)]) ||
  pickFirst(info, INSTITUTE_LANG_KEYS.name.bn);

export const getInstituteAddress = (info, lang) =>
  pickFirst(info, INSTITUTE_LANG_KEYS.address[safeLang(lang)]) ||
  pickFirst(info, INSTITUTE_LANG_KEYS.address.bn);

// ---------------------------------------------------------------------------
// ফিল্ড
// label = বাংলা, name = English, nameAr = আরবী
// demo / demoEn / demoAr = প্রিভিউর ডামি মান
// সংখ্যার ডেমো ASCII তে রাখা — তাহলে ভাষা অনুযায়ী অঙ্ক রূপান্তর হয়
// type: 'date' হলে মানটা তারিখ হিসেবে ফরম্যাট হয়
// ---------------------------------------------------------------------------

export const ADMIT_FIELDS = [
  {
    id: 'StudentName',
    name: 'Student Name',
    nameAr: 'اسم الطالب',
    label: 'পরীক্ষার্থীর নাম',
    demo: 'মো: আব্দুস সালাম',
    demoEn: 'Md. Abdus Salam',
    demoAr: 'محمد عبد السلام',
  },
  {
    id: 'StudentCode',
    name: 'Student ID',
    nameAr: 'رقم الطالب',
    label: 'দাখেলা নং',
    demo: '100021',
  },
  {
    id: 'SubClass',
    name: 'Sub Class',
    nameAr: 'الشعبة',
    label: 'শাখা',
    demo: 'ক',
    demoEn: 'A',
    demoAr: 'أ',
  },
  {
    id: 'RollNo',
    name: 'Roll No',
    nameAr: 'رقم الجلوس',
    label: 'রোল নং',
    demo: '07',
  },
  {
    id: 'ExamStartDate',
    name: 'Exam Start Date',
    nameAr: 'بداية الامتحان',
    label: 'পরীক্ষা শুরু',
    demo: '2026-12-01',
    type: 'date',
  },
  {
    id: 'FatherName',
    name: 'Father Name',
    nameAr: 'اسم الأب',
    label: 'পিতার নাম',
    demo: 'মো: কিবরিয়া',
    demoEn: 'Md. Kibria',
    demoAr: 'محمد كبريا',
  },
  {
    id: 'MotherName',
    name: 'Mother Name',
    nameAr: 'اسم الأم',
    label: 'মাতার নাম',
    demo: 'মোসা: আমেনা বেগম',
    demoEn: 'Mst. Amena Begum',
    demoAr: 'مسماة آمنة بيغم',
  },
  {
    id: 'Mobile1',
    name: 'Mobile',
    nameAr: 'الجوال',
    label: 'মোবাইল',
    demo: '01876862386',
  },
  {
    id: 'DateOfBirth',
    name: 'Date Of Birth',
    nameAr: 'تاريخ الميلاد',
    label: 'জন্ম তারিখ',
    demo: '2011-10-12',
    type: 'date',
  },
  {
    id: 'CenterName',
    name: 'Hall Name/No',
    nameAr: 'اسم/رقم القاعة',
    label: 'হল নাম/নং',
    demo: 'হল নং-১',
    demoEn: 'Hall No-1',
    demoAr: 'قاعة رقم ١',
  },
  {
    id: 'SessionName',
    name: 'Session',
    nameAr: 'العام الدراسي',
    label: 'সেশন',
    demo: '2026',
  },
  {
    id: 'ExamName',
    name: 'Exam Name',
    nameAr: 'الامتحان',
    label: 'টিউটোরিয়াল পরীক্ষা',
    demo: 'টিউটোরিয়াল পরীক্ষা',
    demoEn: 'Tutorial Exam',
    demoAr: 'الاختبار التجريبي',
  },
];

const buildFieldMap = (key) =>
  ADMIT_FIELDS.reduce((acc, f) => {
    acc[f.id] = f[key];
    return acc;
  }, {});

/** ফিল্ডের নাম ভাষা অনুযায়ী — ভিত্তি লেবেল */
export const ADMIT_FIELD_TEXTS = {
  bn: buildFieldMap('label'),
  en: buildFieldMap('name'),
  ar: buildFieldMap('nameAr'),
};

/** পুরোনো নাম — অন্য ফাইলে ব্যবহার থাকলে ভাঙবে না */
export const ADMIT_FIELD_LABELS = ADMIT_FIELD_TEXTS.bn;
export const ADMIT_FIELD_NAMES = ADMIT_FIELD_TEXTS.en;

/** ডেমো মান ভাষা অনুযায়ী — demoEn/demoAr না থাকলে বাংলা demo */
export const ADMIT_FIELD_DEMOS = {
  bn: buildFieldMap('demo'),
  en: ADMIT_FIELDS.reduce((acc, f) => {
    acc[f.id] = f.demoEn ?? f.demo;
    return acc;
  }, {}),
  ar: ADMIT_FIELDS.reduce((acc, f) => {
    acc[f.id] = f.demoAr ?? f.demo;
    return acc;
  }, {}),
};

/** পুরোনো নাম — বাংলা ডেমো */
export const ADMIT_FIELD_DEMO = ADMIT_FIELD_DEMOS.bn;

/** প্রিভিউর ডামি মান, ভাষা অনুযায়ী */
export const getFieldDemo = (fieldId, lang) =>
  ADMIT_FIELD_DEMOS[safeLang(lang)]?.[fieldId] ?? ADMIT_FIELD_DEMOS.bn[fieldId];

/** ফিল্ডের নাম (চেকবক্স তালিকার বাম কলাম) */
export const getFieldName = (fieldId, lang) =>
  ADMIT_FIELD_TEXTS[safeLang(lang)]?.[fieldId] ?? ADMIT_FIELD_TEXTS.bn[fieldId];

/** কোন কোন ফিল্ড তারিখ */
export const ADMIT_DATE_FIELDS = new Set(
  ADMIT_FIELDS.filter((f) => f.type === 'date').map((f) => f.id)
);

/**
 * কোন ফিল্ডের মান কোন ভাষায় কোন কলাম থেকে আসবে।
 * এখানে না থাকলে বা মান ফাঁকা হলে মূল (বাংলা) কলামই ব্যবহার হয়।
 */
export const ADMIT_FIELD_LANG_KEYS = {
  StudentName: { en: 'StudentNameEng', ar: 'StudentNameAra' },
  FatherName: { en: 'FatherNameEng', ar: 'FatherNameAra' },
  MotherName: { en: 'MotherNameEng', ar: 'MotherNameAra' },
  ClassName: { en: 'ClassNameEng', ar: 'ClassNameAra' },
  SubClass: { en: 'SubClassEng', ar: 'SubClassAra' },
  SessionName: { en: 'SessionEngName', ar: 'SessionAraName' },
  ExamName: { en: 'ExamEngName', ar: 'ExamAraName' },
  ResidentialName: { en: 'ResidentialNameEng', ar: 'ResidentialNameAra' },
};

// DB তে ভাষা-কলাম নেই এমন ফিক্সড মানের অভিধান (বাংলা/ইংরেজি কী → en/ar)
// normalize: lowercase, space/hyphen/underscore/dot মুছে ফেলি
const normalizeKey = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s\-_.]+/g, '');

const VALUE_TRANSLATIONS = {
  // ----- বাংলা ইনপুট -----
  আবাসিক: { en: 'Residential', ar: 'داخلي' },
  অনাবাসিক: { en: 'Non-Residential', ar: 'خارجي' },
  'ডে-কেয়ার': { en: 'Day Care', ar: 'الرعاية النهارية' },
  'ডে কেয়ার': { en: 'Day Care', ar: 'الرعاية النهارية' },
  ডেকেয়ার: { en: 'Day Care', ar: 'الرعاية النهارية' },
  'নাইট কেয়ার': { en: 'Night Care', ar: 'الرعاية الليلية' },
  'নাইট-কেয়ার': { en: 'Night Care', ar: 'الرعاية الليلية' },
  নাইটকেয়ার: { en: 'Night Care', ar: 'الرعاية الليلية' },
  উভয়: { en: 'Both', ar: 'كلاهما' },
  'প্রধান কেন্দ্র': { en: 'Main Center', ar: 'المركز الرئيسي' },

  // ----- ইংরেজি ইনপুট (DB তে ইংরেজি স্টোর থাকলে) -----
  residential: { en: 'Residential', ar: 'داخلي' },
  nonresidential: { en: 'Non-Residential', ar: 'خارجي' },
  daycare: { en: 'Day Care', ar: 'الرعاية النهارية' },
  nightcare: { en: 'Night Care', ar: 'الرعاية الليلية' },
  both: { en: 'Both', ar: 'كلاهما' },
  maincenter: { en: 'Main Center', ar: 'المركز الرئيسي' },
};

// normalize করা key দিয়ে lookup টেবিল — একবারই বানাই
const VALUE_LOOKUP = new Map(
  Object.entries(VALUE_TRANSLATIONS).map(([k, v]) => [normalizeKey(k), v])
);
// অনুবাদ শুধু এই ফিল্ডগুলোর মানেই চলে — বাকিগুলো DB তে যা আছে তাই
const TRANSLATABLE_VALUE_FIELDS = new Set(['ResidentialName']);

const translateValue = (raw, lang) => {
  if (raw === null || raw === undefined || String(raw).trim() === '') return raw;
  const hit = VALUE_LOOKUP.get(normalizeKey(raw));
  if (!hit) return raw;
  return hit[lang] ?? raw;
};

/** শিক্ষার্থীর একটা ফিল্ডের মান — ভাষা অনুযায়ী, না থাকলে বাংলাটা */
export const getFieldValue = (student = {}, fieldId, lang) => {
  const useLang = safeLang(lang);

  // ১) DB-র ভাষা-নির্দিষ্ট কলাম থাকলে সেটাই
  const key = ADMIT_FIELD_LANG_KEYS[fieldId]?.[useLang];
  if (key) {
    const alt = student[key];
    if (alt !== null && alt !== undefined && String(alt).trim() !== '') return alt;
  }

  // ২) না থাকলে DB এর মান — শুধু চেনা এনাম ফিল্ড হলে অনুবাদ টেবিল থেকে
  const raw = student[fieldId];
  if (useLang !== 'bn' && raw && TRANSLATABLE_VALUE_FIELDS.has(fieldId)) {
    return translateValue(raw, useLang);
  }
  return raw;
};

/**
 * LabelName টেবিলের কোন কলাম কোন ফিল্ডের লেবেল ঠিক করে।
 * এখানে না থাকা ফিল্ডগুলো ভাষার ভিত্তি নামই ব্যবহার করে।
 */
export const ADMIT_FIELD_LABEL_KEYS = {
  StudentCode: 'StudentIDLabel',
  ClassName: 'ClassNameLabel',
  AdmissionSerial: 'AdmissionIDLabel',
  SubClass: 'SubClassNameLabel',
};

/** আরবী কার্ডে শ্রেণি ও শাখার লেবেল আলাদা কলাম থেকে আসে */
export const ADMIT_FIELD_LABEL_KEYS_ARA = {
  ClassName: 'ClassNameAraLabel',
  SubClass: 'SubClassNameAraLabel',
};

/**
 * API এর `labels` অবজেক্ট (LabelName টেবিলের রো) নিয়ে ফিল্ড-প্রতি লেবেল বানায়।
 * ভিত্তি হলো ভাষার নাম; LabelName এ মান থাকলে সেটাই জেতে।
 * English এ LabelName টেবিলে কলাম নেই, তাই ইংরেজি নামই লেবেল।
 */
export const resolveFieldLabels = (labelRow, { lang } = {}) => {
  const useLang = safeLang(lang);
  const out = { ...(ADMIT_FIELD_TEXTS[useLang] || ADMIT_FIELD_TEXTS.bn) };

  if (!labelRow || useLang === 'en') return out;

  // আরবীতে শাখার লেবেল Ara কলাম থেকে, বাকিগুলো একই কলাম থেকে
  const keyMap =
    useLang === 'ar'
      ? { ...ADMIT_FIELD_LABEL_KEYS, ...ADMIT_FIELD_LABEL_KEYS_ARA }
      : ADMIT_FIELD_LABEL_KEYS;

  Object.entries(keyMap).forEach(([fieldId, column]) => {
    const value = labelRow[column];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      out[fieldId] = String(value).trim();
    }
  });

  return out;
};

// সব টেমপ্লেটে সব ফিল্ড অ্যালাও; কোনো টেমপ্লেটে সীমা দরকার হলে এখানে বদলান
const ALL_TEMPLATE_IDS = ADMIT_TEMPLATES.map((t) => t.id);

export const ADMIT_ALLOWED_FIELDS = ADMIT_FIELDS.reduce((acc, f) => {
  acc[f.id] = ALL_TEMPLATE_IDS;
  return acc;
}, {});

export const isFieldAllowedForTemplate = (fieldId, templateId) =>
  ADMIT_ALLOWED_FIELDS[fieldId]?.includes(String(templateId));

export const MAX_FIELD_SELECT = 8;

// ---------------------------------------------------------------------------
// প্রিন্ট লেআউট
// ---------------------------------------------------------------------------

// CSS স্পেক অনুযায়ী 1mm = 96/25.4 px
export const MM_TO_PX = 96 / 25.4;

export const PRINT_PAGES = {
  'A5 landscape': { w: 210, h: 148 },
  'A4 portrait': { w: 210, h: 297 },
  'A4 landscape': { w: 297, h: 210 },
};

export const PRINT_LAYOUTS = {
  1: {
    cols: 1,
    rows: 1,
    page: 'A5 landscape',
    margin: 6,
    gap: 4,
    labels: {
      bn: 'A5 কাগজে ১টি',
      en: '1 per A5 sheet',
      ar: 'بطاقة واحدة في ورقة A5',
    },
  },
  2: {
    cols: 1,
    rows: 2,
    page: 'A4 portrait',
    margin: 8,
    gap: 5,
    labels: {
      bn: 'A4 কাগজে ২টি',
      en: '2 per A4 sheet',
      ar: 'بطاقتان في ورقة A4',
    },
  },
  3: {
    cols: 2,
    rows: 2,
    page: 'A4 landscape',
    margin: 8,
    gap: 5,
    labels: {
      bn: 'A4 ল্যান্ডস্কেপে ৪টি',
      en: '4 per A4 landscape',
      ar: 'أربع بطاقات في ورقة A4 عرضية',
    },
  },
};

export const getLayoutLabel = (type, lang) => {
  const l = PRINT_LAYOUTS[type] || PRINT_LAYOUTS[1];
  return l.labels[safeLang(lang)] ?? l.labels.bn;
};

/**
 * কাগজের প্রিন্টেবল এরিয়ার ভিতরে ratio ঠিক রেখে কার্ডের মাপ বের করে।
 * width আর height — দুইটাই constraint, তাই যেটা ছোট সেটাই নেওয়া হয়।
 */
export const getPrintLayout = (type) => {
  const base = PRINT_LAYOUTS[type] || PRINT_LAYOUTS[1];
  const paper = PRINT_PAGES[base.page] || PRINT_PAGES['A4 portrait'];

  const contentW = paper.w - base.margin * 2;
  const contentH = paper.h - base.margin * 2;

  const slotW = (contentW - base.gap * (base.cols - 1)) / base.cols;
  const slotH = (contentH - base.gap * (base.rows - 1)) / base.rows;

  const cellW = Math.min(slotW, slotH * CARD_RATIO);
  const cellH = cellW / CARD_RATIO;

  return {
    ...base,
    perPage: base.cols * base.rows,
    paperW: paper.w,
    paperH: paper.h,
    contentW,
    contentH,
    cellW,
    cellH,
    scale: (cellW * MM_TO_PX) / CARD_W,
  };
};

// ---------------------------------------------------------------------------
// সংখ্যা ও তারিখ
// ---------------------------------------------------------------------------

const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** ASCII বা বাংলা — যেকোনো অঙ্ককে দেওয়া সেটে বদলায় */
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

export const toBanglaDigit = (value) => convertDigits(value, banglaDigits);
export const toArabicDigit = (value) => convertDigits(value, arabicDigits);

/**
 * ভাষা অনুযায়ী অঙ্ক।
 * বাংলা → ০১২, আরবী → ٠١٢, ইংরেজি → 012
 * ইনপুট যে সেটেই থাকুক (ASCII/বাংলা/আরবী), ঠিকভাবে রূপান্তর হয়।
 */
export const toLangDigit = (value, lang) => {
  if (value === null || value === undefined) return '';
  const useLang = safeLang(lang);
  if (useLang === 'en') return convertDigits(value, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
  if (useLang === 'ar') return convertDigits(value, arabicDigits);
  return convertDigits(value, banglaDigits);
};

/**
 * তারিখকে দিন/মাস/বছর অংশে ভাঙে।
 * new Date() দিয়ে string parse করা হয় না, কারণ "2011-10-12" কে ব্রাউজার UTC ধরে —
 * টাইমজোন ভেদে একদিন পিছিয়ে যেতে পারত।
 */
export const parseDateParts = (value) => {
  if (!value && value !== 0) return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return { d: value.getDate(), m: value.getMonth() + 1, y: value.getFullYear() };
  }

  const text = String(value).trim();
  if (!text) return null;

  // 2011-10-12 / 2026-10-30 00:00:00 / 2026-10-30T00:00:00.000Z
  const ymd = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) return { y: Number(ymd[1]), m: Number(ymd[2]), d: Number(ymd[3]) };

  // 12/10/2011 বা 12-10-2011
  const dmy = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) return { d: Number(dmy[1]), m: Number(dmy[2]), y: Number(dmy[3]) };

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;

  return { d: parsed.getDate(), m: parsed.getMonth() + 1, y: parsed.getFullYear() };
};

/** তারিখ → ১২/১০/২০১১ (prefix ছাড়া)। ধরতে না পারলে মূল মানই ফেরত দেয়। */
export const formatAdmitDate = (value, lang) => {
  const parts = parseDateParts(value);
  if (!parts) return toLangDigit(value, lang);

  const dd = String(parts.d).padStart(2, '0');
  const mm = String(parts.m).padStart(2, '0');
  return toLangDigit(`${dd}/${mm}/${parts.y}`, lang);
};

/** কার্ডে একটা ফিল্ডের মান কীভাবে দেখাবে */
export const formatAdmitValue = (fieldId, value, lang) =>
  ADMIT_DATE_FIELDS.has(fieldId)
    ? formatAdmitDate(value, lang)
    : toLangDigit(value, lang);

/** স্বাক্ষরের নিচে বসে — প্রিন্টের দিনের তারিখ, শুধু সংখ্যা (লেবেল কার্ডেই বসে) */
export const getPrintDate = (date = new Date(), lang) => formatAdmitDate(date, lang);

// ---------------------------------------------------------------------------
// ডাটা
// ---------------------------------------------------------------------------

/**
 * API রেসপন্সকে কার্ডে ব্যবহারযোগ্য শেপে আনে।
 * রাউট এখন মডেল থেকে ফ্ল্যাট করেই পাঠায়, তাই এটা মূলত নিরাপত্তা জাল —
 * nested শেপ এলেও কার্ড ভাঙে না।
 */
export const normalizeAdmitRow = (row = {}) => {
  const user = row.User || row.user || {};
  const cls = row.Class || row.class || {};
  const sub = row.SubClassObj || row.subClass || {};
  const session = row.AcademicSession || row.Session || {};
  const exam = row.Exam || {};
  const residential = row.userResidential || row.Residential || {};

  return {
    ...row,
    StudentName: row.StudentName || row.UserName || user.UserName || '',
    StudentCode: row.StudentCode || row.UserCode || user.UserCode || '',
    AdmissionID: row.AdmissionID ?? row.ID ?? user.UserID,
    RollNo: row.RollNo ?? row.AdmissionSerial ?? '',
    AdmissionSerial: row.AdmissionSerial ?? '',
    FatherName: row.FatherName || user.FatherName || '',
    MotherName: row.MotherName || user.MotherName || '',
    ClassName: row.ClassName || cls.ClassName || '',
    SubClass: typeof row.SubClass === 'string' ? row.SubClass : sub.SubClass || '',
    SessionName: row.SessionName || session.SessionName || '',
    ExamName: row.ExamName || exam.ExamName || '',
    ResidentialName: row.ResidentialName || residential.ResidentialName || '',
    Mobile1: row.Mobile1 || user.Mobile1 || '',
    DateOfBirth: row.DateOfBirth || user.DateOfBirth || '',
    ExamStartDate: row.ExamStartDate || exam.StartDate || '',
    CenterName: row.CenterName || row.Center || '',
    UserImage: row.UserImage || user.UserImage || null,
    // QR এর URL বানাতে লাগে
    SessionID: row.SessionID,
    ExamID: row.ExamID,
    SubClassID: row.SubClassID,
  };
};

/** QR এ যে ঠিকানা এনকোড হবে */
export const buildAdmitQrValue = (student = {}, institutionCode) => {
  if (student.QRValue || student.qrValue) return student.QRValue || student.qrValue;

  const code = institutionCode || student.InstitutionCode;
  const { SessionID, ExamID, SubClassID, StudentCode } = student;

  if (code && SessionID && ExamID && SubClassID && StudentCode) {
    return `https://qmmsoft.com/${code}/students/${SessionID}/${ExamID}/${SubClassID}/${StudentCode}`;
  }

  return [student.StudentCode, student.RollNo, student.StudentName, student.ExamName]
    .filter(Boolean)
    .join('|');
};
