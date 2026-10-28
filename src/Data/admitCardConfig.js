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
  examNameSize: 13,
  logoOffsetY: 0,
  photoOffsetY: 0,
};

// হেডারের ডান পাশে শিক্ষার্থীর ছবির মাপ — সব টেমপ্লেটে এক
const PHOTO = { photoW: 58, photoH: 74 };

// QR এর মাপ — স্বাক্ষরের জোনের সাথে মিলিয়ে
const QR_SIZE = 56;

// ---------------------------------------------------------------------------
// কার্ডের মাঝের লোগো ওয়াটারমার্ক।
// উৎস আলাদা — WebsiteSettings টেবিলের documentLogo (FieldKey)।
// হেডারের বাম পাশের প্রতিষ্ঠানের লোগোর সাথে এর কোনো সম্পর্ক নেই, দুইটা স্বাধীন।
// opacity বেশি দিলে ফিল্ডের লেখা পড়তে কষ্ট হয় — ০.১ এর নিচে রাখাই ভালো।
// টেমপ্লেটে watermarkSize / watermarkOpacity দিয়ে আলাদা করে বদলানো যায়।
// ---------------------------------------------------------------------------
export const WATERMARK_DEFAULTS = { size: 230, opacity: 0.07 };

// ---------------------------------------------------------------------------
// 👇 `layout` ঘরটা
//
// সাধারণ টেমপ্লেটে কার্ডের ভিতরটা AdmitCardFace ই আঁকে — হেডার, ব্যাজ, দুই
// কলামে "নাম : মান", স্বাক্ষর। কিন্তু কোনো কোনো ডিজাইনের গড়নটাই আলাদা
// (বর্ডার দেওয়া টেবিল, নির্দেশাবলীর ঘর ইত্যাদি) — ওগুলোর জন্য টেমপ্লেটে
// `layout: '<নাম>'` লেখা থাকে, আর তখন ঐ নামের নিজের কম্পোনেন্টটাই আঁকে।
//
//   layout: 'navy'  →  AdmitCardNavy.jsx
//
// `layout` না থাকলে আগের নিয়মই চলে, তাই পুরোনো সব ডিজাইন হুবহু অক্ষত।
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 👇 `hidden` ঘরটা
//
// কোনো ডিজাইন সাময়িকভাবে বন্ধ রাখতে ওটায় `hidden: true` বসান — তখন
// টেমপ্লেটের তালিকায় ওটা আর দেখা যায় না। ডিজাইনটা মুছে যায় না, তাই
// ফিরিয়ে আনতে কেবল লাইনটা সরালেই হলো।
//
// আগে থেকে কোনো প্রতিষ্ঠানের সেটিংয়ে ঐ ডিজাইনটাই সংরক্ষিত থাকলে কার্ড
// তবু আগের মতোই ছাপবে — কারণ getTemplate() নিচের পূর্ণ তালিকাটাই খোঁজে,
// ছাঁকা তালিকাটা নয়। শুধু নতুন করে বাছা যাবে না।
// ---------------------------------------------------------------------------
const ALL_ADMIT_TEMPLATES = [
  

  {
    id: '1',
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
    logoOffsetY: -15,
    photoOffsetY: -15,
    headerDividerGap: 2,
    examTop: 97,
    examHeight: 20,
  },
  {
    id: '2',
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
    examTop: 106,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    examTop: 98,
    examHeight: 20,
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    examTop: 106,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    examTop: 106,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    examTop: 106,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
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
    examTop: 106,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
  },

  {
    id: '9',
    title: 'রাজকীয় ফ্রেম',
    variant: 'image',
    image: '/admitcard/admit-7.jpeg',
    thumb: '/admitcard/admit-7.jpeg',
    nameColor: '#1f2937',
    addressColor: '#4b5563',
    nameSize: 22,
    addressSize: 13,
    valueColor: '#111827',
    labelColor: '#4b5563',
    accent: '#1e3a8a',
    examNameColor: '#374151',
    photoBorder: '#9ca3af',
    signLineColor: '#111827',
    ribbonStyle: 'none',
    ribbonCoverBg: '#ffffff',
    ribbonColor: '#1e3a8a',
    ribbonCoverByLang: {
      en: { top: 127, height: 28, width: 84, fontSize: 10 },
      ar: { top: 128, height: 26, width: 78, fontSize: 17 },
      bn: { top: 128, height: 26, width: 78, fontSize: 17 },
    },
    showPhoto: true,
    showSignature: true,
    showSignDate: true,
    showQR: true,
    qrSize: 56,
    qrPad: '#ffffff',
    ...ZONES,
    ...PHOTO,
    headerHeight: 135,
    examTop: 108,
    bodyTop: 185,
    logoOffsetY: -15,
    photoOffsetY: -15,
  },

  {
    // ------------------------------------------------------------------
    // নেভি ও সোনালী — নিজের লেআউটওয়ালা প্রথম ডিজাইন।
    //
    // `layout: 'navy'` থাকায় কার্ডের ভিতরটা AdmitCardFace আঁকে না,
    // AdmitCardNavy.jsx আঁকে — নেভি ব্যান্ড, সোনালী কোনা, বর্ডার দেওয়া
    // তথ্যের ঘর, নির্দেশাবলী ও স্বাক্ষরের সারি।
    //
    // তাই নিচের ফ্রেম/ব্যাজ-সংক্রান্ত ঘরগুলো (frameStyle, ribbonStyle,
    // headerDivider …) এখানে নেই — ওগুলো ঐ কম্পোনেন্ট পড়েই না। যে
    // ঘরগুলো আছে সেগুলো রঙ, মাপ ও টগলের, আর ...ZONES / ...PHOTO
    // রাখা হয়েছে যাতে অন্য কোড (যেমন getRoutineZones) মাপ খুঁজতে গিয়ে
    // হোঁচট না খায়।
    //
    // আইডি '১০' নয় — নিচে ওই আইডিতে একটা মন্তব্য করা টেমপ্লেট পড়ে আছে,
    // কেউ ওটা চালু করলে দুইটা এক আইডি হয়ে যেত।
    // ------------------------------------------------------------------
    id: '11',
    title: 'নেভি ও সোনালী',
    variant: 'painted',
    layout: 'navy',
    cardBg: '#ffffff',
    navy: '#15294d',
    gold: '#c9a227',
    gridColor: '#cbd5e1',
    labelBg: '#f1f5f9',
    nameColor: '#ffffff',
    addressColor: '#cbd5e1',
    nameSize: 17,
    addressSize: 9,
    valueColor: '#111827',
    labelColor: '#374151',
    accent: '#15294d',
    examNameColor: '#15294d',
    examNameSize: 12,
    photoBorder: '#94a3b8',
    signLineColor: '#15294d',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 40,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // বাংলা সোনালী — ক্রিম রঙের পট, দুইটা সোনালী রেখার ফ্রেম,
    // লোগো-নাম-ঠিকানা উপরে মাঝ বরাবর, নিচে সোনালী ব্যাজ।
    id: '12',
    title: 'বাংলা সোনালী',
    variant: 'painted',
    layout: 'classic',
    chrome: 'gold',
    cardBg: '#fffdf6',

    // ---- ঘরের জায়গা ও মাপ (শুধু এই ডিজাইনের) ----
    headerShiftY: 0,      // পুরো হেডার একসাথে — মাইনাস = উপরে
    logoTopPx: 25,
    logoLeftPx: 24,
    logoSizePx: 38,
    headTopPx: 25,        // নাম ও ঠিকানার ব্লক
    headLeftPx: 70,
    headRightPx: 70,
    titleTopPx: 65,       // "প্রবেশপত্র"
    titleSizePx: 13,
    titleOffsetX: 0,
    examTopPx: 80,        // পরীক্ষার নাম ও শিক্ষাবর্ষ
    examOffsetX: 0,
    bodyTopPx: 105,        // ছবি ও তথ্যের ঘর
    bodyLeftPx: 22,
    bodyRightPx: 22,
    photoWPx: 58,
    photoHPx: 70,
    photoGapPx: 12,       // ছবি ও তথ্যের ঘরের মাঝের ফাঁক
    rowHPx: 20,           // তথ্যের এক সারির উচ্চতা
    rulesLeftPx: 22,
    rulesRightPx: 22,
    rulesMaxHPx: 104,
    seatHPx: 20,          // আসনের পট্টি
    seatLeftPx: 22,
    seatRightPx: 22,
    footHPx: 76,          // QR ও স্বাক্ষরের সারি
    footLeftPx: 22,
    footRightPx: 22,
    qrOffsetY: 14,        // QR নিচে নামবে (+) / উপরে উঠবে (-)
    qrOffsetX: 0,         // QR ডানে (+) / বামে (-)

    primary: '#1f5c3a',
    gold: '#b08422',
    gridColor: '#e2d9bf',
    labelBg: '#faf4e4',
    ribbonColor: '#ffffff',
    nameColor: '#1f5c3a',
    addressColor: '#6b6250',
    nameSize: 17,
    addressSize: 9,
    valueColor: '#14261c',
    labelColor: '#5b5340',
    accent: '#1f5c3a',
    examNameColor: '#1f5c3a',
    examNameSize: 12,
    photoBorder: '#c7b891',
    signLineColor: '#1f5c3a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 38,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // সবুজ-সোনালী নকশা — মোটা সবুজ, মাঝে সোনালী, ভিতরে সরু সবুজ ফ্রেম,
    // চার কোনায় সোনালী বর্গ।
    id: '13',
    title: 'সবুজ-সোনালী নকশা',
    hidden: true,
    variant: 'painted',
    layout: 'classic',
    chrome: 'ornate',
    cardBg: '#ffffff',
    primary: '#0f5132',
    gold: '#c9a227',
    gridColor: '#cfe3d6',
    labelBg: '#f0fdf4',
    ribbonColor: '#ffffff',
    nameColor: '#0f5132',
    addressColor: '#5b6b60',
    nameSize: 17,
    addressSize: 9,
    valueColor: '#14261c',
    labelColor: '#4b5563',
    accent: '#0f5132',
    examNameColor: '#0f5132',
    examNameSize: 12,
    photoBorder: '#9bbcab',
    signLineColor: '#0f5132',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 38,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // মিহরাব — পুরো কার্ড গাঢ় সবুজে, উপরে সোনালী খিলানের রেখা,
    // আর তথ্য-আসন-স্বাক্ষর সব একটা সাদা গোল-কোনা ঘরের ভিতরে।
    id: '14',
    title: 'মিহরাব (গাঢ় সবুজ)',
    hidden: true,
    variant: 'painted',
    layout: 'classic',
    chrome: 'arch',
    cardBg: '#0d4a4a',
    primary: '#0d4a4a',
    gold: '#d4af37',
    gridColor: '#cbd5e1',
    labelBg: '#f1f5f9',
    ribbonColor: '#0d4a4a',
    nameColor: '#ffffff',
    addressColor: '#bcd7d7',
    nameSize: 17,
    addressSize: 9,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#0d4a4a',
    examNameColor: '#0d4a4a',
    examNameSize: 12,
    photoBorder: '#94a3b8',
    signLineColor: '#0d4a4a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 38,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // আধুনিক সবুজ — উপরে গোল-কোনা রঙিন ব্যান্ড, নিচে গোল-কোনা ঘর,
    // একদম নিচে পাতলা রঙিন পট্টি।
    id: '15',
    title: 'আধুনিক সবুজ',
    hidden: true,
    variant: 'painted',
    layout: 'modern',
    cardBg: '#ffffff',
    primary: '#0e7a5f',
    gold: '#ffffff',
    gridColor: '#d1e7dd',
    labelBg: '#f0fdf4',
    nameColor: '#ffffff',
    addressColor: '#d1fae5',
    nameSize: 17,
    addressSize: 9,
    valueColor: '#0f172a',
    labelColor: '#4b5563',
    accent: '#0e7a5f',
    examNameColor: '#0e7a5f',
    examNameSize: 12,
    photoBorder: '#a7d7c5',
    signLineColor: '#0e7a5f',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 38,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // সবুজ — নাম বড়। উপরে সবুজ ঢালের ব্যান্ড, নিচে সাদা ঘরে ছবি ও নাম,
    // তারপর চারটা ছোট বাক্স (প্রথমটা আসনের)।
    id: '16',
    title: 'সবুজ — নাম বড়',
    hidden: true,
    variant: 'painted',
    layout: 'profile',
    cardBg: '#f1f7f4',
    primary: '#0b6b4f',
    primaryDark: '#064e3b',
    gold: '#ffffff',
    gridColor: '#d1e7dd',
    labelBg: '#e8f6ef',
    nameColor: '#ffffff',
    addressColor: '#d1fae5',
    nameSize: 15,
    addressSize: 8,
    valueColor: '#0f172a',
    labelColor: '#5b6b63',
    accent: '#0b6b4f',
    examNameColor: '#0b6b4f',
    examNameSize: 11,
    photoBorder: '#a7d7c5',
    signLineColor: '#0b6b4f',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 38,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // রাজকীয় সবুজ-সোনালী — কারুকাজের ফ্রেম, চার কোনায় সোনালী পদক,
    // উপরে বিসমিল্লাহ, নিচে দুআ।
    //
    // নির্দেশাবলী বদলাতে চাইলে এখানে `rules: { bn: [...], en: [...],
    // ar: [...] }` বসান — না দিলে AdmitCardLayouts.jsx এর ভিত্তি
    // তালিকাটা বসে।
    id: '17',
    title: 'রাজকীয় সবুজ-সোনালী',
    hidden: true,
    variant: 'painted',
    layout: 'royal',
    cardBg: '#fffdf8',
    primary: '#0b5c3b',
    gold: '#c9a227',
    gridColor: '#d9cfae',
    labelBg: '#fdf8ea',
    nameColor: '#0b5c3b',
    addressColor: '#6b6250',
    nameSize: 15,
    addressSize: 7.5,
    valueColor: '#14261c',
    labelColor: '#5b5340',
    accent: '#0b5c3b',
    examNameColor: '#0b5c3b',
    examNameSize: 11,
    photoBorder: '#c7b891',
    signLineColor: '#0b5c3b',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 34,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // মিহরাব — গাঢ় সবুজ পটে সোনালী খিলান, ভিতরে সাদা ঘর।
    id: '18',
    title: 'মিহরাব খিলান',
    hidden: true,
    variant: 'painted',
    layout: 'mihrab',
    cardBg: '#0c4a4a',
    primary: '#0c4a4a',
    gold: '#d4af37',
    gridColor: '#cbd5e1',
    labelBg: '#eef6f6',
    nameColor: '#ffffff',
    addressColor: '#d4af37',
    nameSize: 14,
    addressSize: 7.5,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#0c4a4a',
    examNameColor: '#d4af37',
    examNameSize: 11,
    photoBorder: '#94a3b8',
    signLineColor: '#0c4a4a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 34,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // ------------------------------------------------------------------
    // নিজের ছবির উপর ছাপা — A5।
    //
    // `image` এর ছবিটাই পুরো কার্ডের পট; নকশা, কোনার রঙ ও "ADMIT CARD"
    // ব্যাজ ঐ ছবিতেই আঁকা, তাই কোড ওগুলো আর আঁকে না — কেবল ডাটা বসায়।
    //
    // ⚠️ ফোল্ডারের নামে ফাঁকা জায়গা থাকায় ঠিকানায় %20 দিতে হয়েছে।
    // ফোল্ডারটার নাম `custom-design` করে দিলে ঠিকানাটা পরিষ্কার হয়:
    //   image: '/admitcard/custom-design/admitcard-1.jpeg'
    //
    // ঘরগুলো কোথায় বসবে তা `bodyTopPx` দিয়ে একটু উপরে-নিচে করা যায়,
    // ছবির ব্যানার লম্বা-খাটো হলে কাজে লাগে।
    // ------------------------------------------------------------------
    id: '19',
    title: 'কাস্টম ডিজাইন ১',
    variant: 'painted',
    layout: 'bgimage',
    image: '/admitcard/custom_desigin/admitcard-1.jpeg',
    thumb: '/admitcard/custom_desigin/admitcard-1.jpeg',
    cardBg: '#ffffff',

    // ---- ঘরের জায়গা ও মাপ (শুধু এই ডিজাইনের) ----
    headerShiftY: 0,      // পুরো হেডার একসাথে — মাইনাস = উপরে
    logoTopPx: 25,
    logoLeftPx: 24,
    logoSizePx: 38,
    headTopPx: 25,        // নাম ও ঠিকানার ব্লক
    headLeftPx: 70,
    headRightPx: 70,
    titleTopPx: 65,       // "প্রবেশপত্র"
    titleSizePx: 13,
    titleOffsetX: 0,
    examTopPx: 80,        // পরীক্ষার নাম ও শিক্ষাবর্ষ
    examOffsetX: 0,
    bodyTopPx: 105,        // ছবি ও তথ্যের ঘর
    bodyLeftPx: 22,
    bodyRightPx: 22,
    photoWPx: 58,
    photoHPx: 70,
    photoGapPx: 12,       // ছবি ও তথ্যের ঘরের মাঝের ফাঁক
    rowHPx: 20,           // তথ্যের এক সারির উচ্চতা
    rulesLeftPx: 22,
    rulesRightPx: 22,
    rulesMaxHPx: 104,
    seatHPx: 20,          // আসনের পট্টি
    seatLeftPx: 22,
    seatRightPx: 22,
    footHPx: 76,          // QR ও স্বাক্ষরের সারি
    footLeftPx: 22,
    footRightPx: 22,
    qrOffsetY: 14,        // QR নিচে নামবে (+) / উপরে উঠবে (-)
    qrOffsetX: 0,         // QR ডানে (+) / বামে (-)

    primary: '#1e3a8a',
    gold: '#f59e0b',
    gridColor: '#c7d2fe',
    labelBg: '#eef2ff',
    seatBg: '#fde68a',
    seatBorder: '#d97706',
    seatColor: '#92400e',
    qrColor: '#111827',
    nameColor: '#1e3a8a',
    addressColor: '#475569',
    nameSize: 15,
    addressSize: 11.5,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#1e3a8a',
    examNameColor: '#1e3a8a',
    examNameSize: 10,
    photoBorder: '#94a3b8',
    signLineColor: '#1e3a8a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 34,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // ------------------------------------------------------------------
    // কাস্টম ডিজাইন ২।
    //
    // নিচের "ঘরের জায়গা ও মাপ" অংশের সংখ্যাগুলো কেবল এই আইডির
    // ডিজাইনেই খাটে — এখানে যা বদলাবেন অন্য কোনো ডিজাইনে তার প্রভাব
    // পড়বে না। মানগুলো এখন ডিফল্টেই বসানো, তাই যেটা সরাতে চান কেবল
    // সেই সংখ্যাটাই বদলান।
    //
    // সবচেয়ে কাজের দুইটা: `headerShiftY` (পুরো হেডার একসাথে উপর-নিচ)
    // আর `bodyTopPx` (ছবি ও তথ্যের ঘর)।
    // ------------------------------------------------------------------
    id: '20',
    title: 'কাস্টম ডিজাইন ২',
    variant: 'painted',
    layout: 'bgimage',
    image: '/admitcard/custom_desigin/admitcard-2.jpeg',
    thumb: '/admitcard/custom_desigin/admitcard-2.jpeg',
    cardBg: '#ffffff',

    // ---- ঘরের জায়গা ও মাপ (শুধু এই ডিজাইনের) ----
    headerShiftY: 0,      // পুরো হেডার একসাথে — মাইনাস = উপরে
    logoTopPx: 25,
    logoLeftPx: 24,
    logoSizePx: 38,
    headTopPx: 25,        // নাম ও ঠিকানার ব্লক
    headLeftPx: 70,
    headRightPx: 70,
    titleTopPx: 65,       // "প্রবেশপত্র"
    titleSizePx: 13,
    titleOffsetX: 0,
    examTopPx: 80,        // পরীক্ষার নাম ও শিক্ষাবর্ষ
    examOffsetX: 0,
    bodyTopPx: 105,        // ছবি ও তথ্যের ঘর
    bodyLeftPx: 22,
    bodyRightPx: 22,
    photoWPx: 58,
    photoHPx: 70,
    photoGapPx: 12,       // ছবি ও তথ্যের ঘরের মাঝের ফাঁক
    rowHPx: 20,           // তথ্যের এক সারির উচ্চতা
    rulesLeftPx: 22,
    rulesRightPx: 22,
    rulesMaxHPx: 104,
    seatHPx: 20,          // আসনের পট্টি
    seatLeftPx: 22,
    seatRightPx: 22,
    footHPx: 76,          // QR ও স্বাক্ষরের সারি
    footLeftPx: 22,
    footRightPx: 22,
    qrOffsetY: 14,        // QR নিচে নামবে (+) / উপরে উঠবে (-)
    qrOffsetX: 0,         // QR ডানে (+) / বামে (-)

    // ---- রঙ ও ফন্ট ----
    primary: '#1e3a8a',
    gold: '#f59e0b',
    gridColor: '#c7d2fe',
    labelBg: '#eef2ff',
    seatBg: '#fde68a',
    seatBorder: '#d97706',
    seatColor: '#92400e',
    qrColor: '#111827',
    nameColor: '#1e3a8a',
    addressColor: '#475569',
    nameSize: 15,
    addressSize: 10.5,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#1e3a8a',
    examNameColor: '#1e3a8a',
    examNameSize: 10,
    photoBorder: '#94a3b8',
    signLineColor: '#1e3a8a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 34,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  {
    // কাস্টম ডিজাইন ৩ — উপরেরটার মতোই, নিজের সংখ্যাগুলো নিজের।
    id: '21',
    title: 'কাস্টম ডিজাইন ৩',
    variant: 'painted',
    layout: 'bgimage',
    image: '/admitcard/custom_desigin/admitcard-3.jpeg',
    thumb: '/admitcard/custom_desigin/admitcard-3.jpeg',
    cardBg: '#ffffff',

    // ---- ঘরের জায়গা ও মাপ (শুধু এই ডিজাইনের) ----
    headerShiftY: 0,
    logoTopPx: 25,
    logoLeftPx: 24,
    logoSizePx: 38,
    headTopPx: 25,
    headLeftPx: 70,
    headRightPx: 70,
    titleTopPx: 65,
    titleSizePx: 13,
    titleOffsetX: 0,
    examTopPx: 80,
    examOffsetX: 0,
    bodyTopPx: 105,
    bodyLeftPx: 22,
    bodyRightPx: 22,
    photoWPx: 58,
    photoHPx: 70,
    photoGapPx: 12,
    rowHPx: 20,
    rulesLeftPx: 22,
    rulesRightPx: 22,
    rulesMaxHPx: 104,
    seatHPx: 20,
    seatLeftPx: 22,
    seatRightPx: 22,
    footHPx: 76,
    footLeftPx: 22,
    footRightPx: 22,
    qrOffsetY: 14,        // QR নিচে নামবে (+) / উপরে উঠবে (-)
    qrOffsetX: 0,         // QR ডানে (+) / বামে (-)

    // ---- রঙ ও ফন্ট ----
    primary: '#1e3a8a',
    gold: '#f59e0b',
    gridColor: '#c7d2fe',
    labelBg: '#eef2ff',
    seatBg: '#fde68a',
    seatBorder: '#d97706',
    seatColor: '#92400e',
    qrColor: '#111827',
    nameColor: '#1e3a8a',
    addressColor: '#475569',
    nameSize: 15,
    addressSize: 10.5,
    valueColor: '#0f172a',
    labelColor: '#475569',
    accent: '#1e3a8a',
    examNameColor: '#1e3a8a',
    examNameSize: 10,
    photoBorder: '#94a3b8',
    signLineColor: '#1e3a8a',
    showPhoto: true,
    showSignature: true,
    showSignDate: false,
    showQR: true,
    qrSize: 34,
    qrPad: 'transparent',
    ...ZONES,
    ...PHOTO,
  },

  // {
  //   id: '10',
  //   title: 'সবুজ ডাবল ফ্রেম',
  //   variant: 'painted',
  //   cardBg: '#ffffff',
  //   frameStyle: 'double',       // 'hairline' | 'double' | 'edgebars' | না দিলে ফ্রেম নেই
  //   frameColor: '#065f46',
  //   headerFill: 'none',         // 'none' | 'solid'
  //   headerBg: '#065f46',        // headerFill: 'solid' হলে দরকার
  //   headerDivider: 2,           // hেডারের নিচের রেখার পুরুত্ব (0 = নেই)
  //   ribbonStyle: 'solid',       // 'none' | 'outline' | 'solid'
  //   ribbonBg: '#065f46',
  //   ribbonColor: '#ffffff',
  //   nameColor: '#065f46',
  //   addressColor: '#4b5563',
  //   valueColor: '#111827',
  //   labelColor: '#065f46',
  //   accent: '#065f46',
  //   examNameColor: '#065f46',
  //   photoBorder: '#065f46',
  //   signLineColor: '#065f46',
  //   nameSize: 23,
  //   addressSize: 13,
  //   showPhoto: true,
  //   showSignature: true,
  //   showSignDate: true,
  //   showQR: true,
  //   qrSize: 56,
  //   qrPad: 'transparent',
  //   ...ZONES,
  //   ...PHOTO,
  //   examTop: 95,
  //   examHeight: 10,
  //   logoOffsetY: -15,
  //   photoOffsetY: -15,
  // },
];

/** তালিকায় যেগুলো দেখা যাবে — `hidden: true` দেওয়াগুলো বাদ */
export const ADMIT_TEMPLATES = ALL_ADMIT_TEMPLATES.filter((t) => !t.hidden);

/**
 * আইডি দিয়ে ডিজাইন খোঁজা — পূর্ণ তালিকা থেকেই, বন্ধ করা ডিজাইনসহ।
 * নইলে কারো সংরক্ষিত ডিজাইন বন্ধ করে দিলে তার কার্ড হঠাৎ অন্য নকশায়
 * ছাপতে শুরু করত।
 */
export const getTemplate = (id) =>
  ALL_ADMIT_TEMPLATES.find((t) => String(t.id) === String(id)) || ADMIT_TEMPLATES[0];

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
    pickFieldTitle: 'কোনো তথ্য যোগ করা হয়নি',
    pickFieldText:
      '"টেমপ্লেট ও ডাটা সেটিং" থেকে আগে কার্ডে কী কী তথ্য দেখাবে তা যোগ করুন।',
    cancel: 'বাতিল',
    templateSelect: 'টেমপ্লেট সিলেক্ট',
    routingSelect: 'টেমপ্লেট রুটিং সিলেক্ট',
    filterBtn: 'ফিল্টার',
    language: 'ভাষা',
    setup: 'টেমপ্লেট ও ডাটা সেটিং',
    applyFilter: 'ফিল্টার প্রয়োগ করুন',
    resetFilter: 'ফিল্টার মুছুন',
    save: 'সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে...',
    savedTitle: 'সংরক্ষিত',
    savedText: 'টেমপ্লেট ও ডাটা সেটিং সংরক্ষণ করা হয়েছে।',
    saveFailTitle: 'সংরক্ষণ হয়নি',
    saveFailText: 'আবার চেষ্টা করুন।',
    upcoming: 'আপকামিং',
    upcomingNote: 'এই সুবিধাটি শীঘ্রই যুক্ত হবে।',
    filterFirst: 'শিক্ষার্থী দেখতে উপরের ফিল্টার বোতামে চাপ দিন।',
    currentTemplate: 'বর্তমান টেমপ্লেট',
    livePreview: 'লাইভ প্রিভিউ',
    routingTemplate: 'রুটিংসহ টেমপ্লেট',
    fieldSettings: 'কার্ডে কোন তথ্য থাকবে',
    displaySettings: 'কী কী দেখাবে',
    fontSettings: 'ফন্ট ও কালার',
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
    watermark: 'ওয়াটারমার্ক',
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
    leftSignature: 'বাঁ পাশের স্বাক্ষর (নায়েম)',
    rightSignature: 'ডান পাশের স্বাক্ষর (মুহতামিম)',
    signNamePlaceholder: 'স্বাক্ষরের নাম',
    mode: 'কাগজ ও ধরণ',
    modePlain: 'A5 — শুধু প্রবেশপত্র',
    modeRoutine: 'A4 — রুটিনসহ',
    modePlainNote: 'শুধু প্রবেশপত্র',
    modeRoutineNote: 'রুটিনসহ',
    modePlainShort: 'A5',
    modeRoutineShort: 'A4',
    routineColor: 'রুটিনের রঙ',
    routineColorHint: 'এই রঙটা সব রুটিন টেমপ্লেটের টেবিলে একসাথে বসবে।',
    seatLine: 'কার্ডে আসন দেখাও',
  },
  en: {
    pageTitle: 'Admit Card',
    pickFieldTitle: 'No fields added',
    pickFieldText:
      'Open "Template & data setting" and add the fields the card should show.',
    cancel: 'Cancel',
    templateSelect: 'Select template',
    routingSelect: 'Template routing select',
    filterBtn: 'Filter',
    language: 'Language',
    setup: 'Template & data setting',
    applyFilter: 'Apply filter',
    resetFilter: 'Clear filter',
    save: 'Save',
    saving: 'Saving...',
    savedTitle: 'Saved',
    savedText: 'Template and data settings have been saved.',
    saveFailTitle: 'Not saved',
    saveFailText: 'Please try again.',
    upcoming: 'Upcoming',
    upcomingNote: 'This feature is coming soon.',
    filterFirst: 'Press the filter button above to load students.',
    currentTemplate: 'Current template',
    livePreview: 'Live preview',
    routingTemplate: 'Template with routing',
    fieldSettings: 'Fields on the card',
    fontSettings: 'Font & colour',
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
    watermark: 'Watermark',
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
    leftSignature: 'Left signature (Nazim)',
    rightSignature: 'Right signature (Principal)',
    signNamePlaceholder: 'Signature name',
    mode: 'Paper & type',
    modePlain: 'A5 — admit card only',
    modeRoutine: 'A4 — with routine',
    modePlainNote: 'Admit card only',
    modeRoutineNote: 'With routine',
    modePlainShort: 'A5',
    modeRoutineShort: 'A4',
    routineColor: 'Routine colour',
    routineColorHint: 'This colour is applied to every routine template at once.',
    seatLine: 'Show seat on card',
  },
  ar: {
    pageTitle: 'بطاقة الدخول',
    pickFieldTitle: 'لم تتم إضافة أي حقل',
    pickFieldText:
      'افتح "إعدادات القالب والبيانات" وأضف الحقول التي ستظهر على البطاقة.',
    cancel: 'إلغاء',
    templateSelect: 'اختيار القالب',
    routingSelect: 'اختيار توجيه القالب',
    filterBtn: 'تصفية',
    language: 'اللغة',
    setup: 'إعدادات القالب والبيانات',
    applyFilter: 'تطبيق التصفية',
    resetFilter: 'مسح التصفية',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    savedTitle: 'تم الحفظ',
    savedText: 'تم حفظ إعدادات القالب والبيانات.',
    saveFailTitle: 'لم يتم الحفظ',
    saveFailText: 'حاول مرة أخرى.',
    upcoming: 'قريباً',
    upcomingNote: 'هذه الميزة ستتوفر قريباً.',
    filterFirst: 'اضغط زر التصفية أعلاه لعرض الطلاب.',
    currentTemplate: 'القالب الحالي',
    livePreview: 'معاينة مباشرة',
    routingTemplate: 'قالب مع التوجيه',
    fieldSettings: 'الحقول على البطاقة',
    fontSettings: 'الخط واللون',
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
    watermark: 'العلامة المائية',
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
    leftSignature: 'التوقيع الأيسر (الناظم)',
    rightSignature: 'التوقيع الأيمن (المهتمم)',
    signNamePlaceholder: 'اسم التوقيع',
    mode: 'الورق والنوع',
    modePlain: 'A5 — بطاقة الدخول فقط',
    modeRoutine: 'A4 — مع الجدول',
    modePlainNote: 'بطاقة الدخول فقط',
    modeRoutineNote: 'مع الجدول',
    modePlainShort: 'A5',
    modeRoutineShort: 'A4',
    routineColor: 'لون الجدول',
    routineColorHint: 'يُطبَّق هذا اللون على جميع قوالب الجدول دفعة واحدة.',
    seatLine: 'إظهار المقعد على البطاقة',
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
    id: 'StudentCode',
    name: 'Student ID',
    nameAr: 'رقم الطالب',
    label: 'দাখেলা নং',
    demo: '100021',
  },
  {
    id: 'SessionName',
    name: 'Session',
    nameAr: 'العام الدراسي',
    label: 'সেশন',
    demo: '2026',
  },
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
    id: 'SubClass',
    name: 'Sub Class',
    nameAr: 'الشعبة',
    label: 'শ্রেণি/জামাত',
    demo: 'ক',
    demoEn: 'A',
    demoAr: 'أ',
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
    id: 'RollNo',
    name: 'Roll No',
    nameAr: 'رقم الجلوس',
    label: 'রোল নং',
    demo: '07',
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
    id: 'ExamStartDate',
    name: 'Exam Start Date',
    nameAr: 'بداية الامتحان',
    label: 'পরীক্ষা শুরু',
    demo: '2026-12-01',
    type: 'date',
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
    id: 'Mobile1',
    name: 'Mobile',
    nameAr: 'الجوال',
    label: 'মোবাইল',
    demo: '01876862386',
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
  // রোল নং — কার্ডে ফিল্ডটার আইডি RollNo (মান আসে AdmissionSerial থেকে),
  // কিন্তু লেবেলটা LabelName টেবিলের AdmissionIDLabel ঘরে বসানো থাকে।
  // আগে কেবল 'AdmissionSerial' লেখা ছিল, আর ওই নামে কোনো ফিল্ড নেই —
  // তাই প্রতিষ্ঠান নিজের নাম বসালেও কার্ডে "রোল নং" ই ছাপত।
  RollNo: 'AdmissionIDLabel',
  AdmissionSerial: 'AdmissionIDLabel',
  // শ্রেণি/জামাত — বাংলা ও ইংরেজিতে SubClassNameLabel,
  // আরবীতে নিচের ARA তালিকার SubClassNameAraLabel
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
// পূর্ণ তালিকা থেকেই — বন্ধ করা ডিজাইন কারো সেটিংয়ে সংরক্ষিত থাকলে
// তার ফিল্ডের তালিকাটাও যেন ফাঁকা না দেখায়
const ALL_TEMPLATE_IDS = ALL_ADMIT_TEMPLATES.map((t) => t.id);

export const ADMIT_ALLOWED_FIELDS = ADMIT_FIELDS.reduce((acc, f) => {
  acc[f.id] = ALL_TEMPLATE_IDS;
  return acc;
}, {});

export const isFieldAllowedForTemplate = (fieldId, templateId) =>
  ADMIT_ALLOWED_FIELDS[fieldId]?.includes(String(templateId));

export const MAX_FIELD_SELECT = 8;

// ---------------------------------------------------------------------------
// ডিফল্ট ফিল্ড — সেটিং একবারও সংরক্ষণ না করা থাকলে কার্ডে এই আটটাই বসে।
// সংখ্যাটা MAX_FIELD_SELECT এর সমান, তাই প্রথমবারেই ঘর পুরো ভরা থাকে।
// ক্রমটাই কার্ডে বসার ক্রম — দুই কলামে সারি ধরে ভরে:
//   পরীক্ষার্থীর নাম | দাখেলা নং
//   পিতার নাম        | রোল নং
//   মাতার নাম        | শাখা
//   জন্ম তারিখ       | হল নাম/নং
// সংরক্ষিত সেটিংয়ে ফিল্ড থাকলে সেটাই জেতে, এটা কেবল শুরুর অবস্থা।
// ---------------------------------------------------------------------------
export const DEFAULT_ADMIT_FIELDS = [
  'StudentName',
  'StudentCode',
  'FatherName',
  'RollNo',
  'MotherName',
  'SubClass',
  'DateOfBirth',
  'CenterName',
];

// ---------------------------------------------------------------------------
// প্রিন্ট লেআউট
// ---------------------------------------------------------------------------

// CSS স্পেক অনুযায়ী 1mm = 96/25.4 px
export const MM_TO_PX = 96 / 25.4;

// ---------------------------------------------------------------------------
// কাগজের মাপ — A4 আর Letter দুইটারই ভিতরে পড়ে এমন "নিরাপদ" মাপ।
//
// কার কম্পিউটারে প্রিন্টারের ডিফল্ট কাগজ A4 আর কার Letter — সেটা আমরা
// ঠিক করতে পারি না, ব্রাউজারের প্রিন্ট ডায়ালগে কাগজ বদলালে আমাদের
// `@page size` ও উপেক্ষিত হয়। তাই মাপ নেওয়া হয় দুইটার ছোট দিকটা ধরে:
//
//   A4      ২১০ × ২৯৭      Letter  ২১৫.৯ × ২৭৯.৪
//   portrait  → প্রস্থ ২১০ (A4), উচ্চতা ২৭৯.৪ (Letter)
//   landscape → প্রস্থ ২৭৯.৪ (Letter), উচ্চতা ২১০ (A4)
//
// ফলে কাগজ যেটাই হোক, কার্ড কখনো কেটে যায় না — A4 তে নিচে একটু বেশি
// সাদা জায়গা থাকে, এইটুকুই পার্থক্য। কার্ডের মাপ দুই কাগজেই হুবহু এক।
// ---------------------------------------------------------------------------
export const PRINT_PAGES = {
  'A5 landscape': { w: 210, h: 148 },
  // A5 খাড়া — এক পাতায় দুইটা কার্ড বসাতে। প্রিন্টারে A5 কাগজ না থাকলেও
  // ১৪৮×২১০ মাপটা A4 আর Letter দুইটার ভিতরেই পড়ে, তাই ছাপা ১০০% ই থাকে।
  'A5 portrait': { w: 148, h: 210 },
  'A4 portrait': { w: 210, h: 279.4 },
  'A4 landscape': { w: 279.4, h: 210 },
};

export const PRINT_LAYOUTS = {
  1: {
    cols: 1,
    rows: 1,
    page: 'A5 landscape',
    margin: 0,
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
    margin: 0,
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
    margin: 0,
    gap: 5,
    labels: {
      bn: 'A4 ল্যান্ডস্কেপে ৪টি',
      en: '4 per A4 landscape',
      ar: 'أربع بطاقات في ورقة A4 عرضية',
    },
  },
  // নতুন — A5 কাগজে দুইটা কার্ড, একটার নিচে আরেকটা
  4: {
    cols: 1,
    rows: 2,
    page: 'A5 portrait',
    margin: 0,
    gap: 4,
    labels: {
      bn: 'A5 কাগজে ২টি',
      en: '2 per A5 sheet',
      ar: 'بطاقتان في ورقة A5',
    },
  },
};

// ---------------------------------------------------------------------------
// প্রবেশপত্রের দুইটা মোড
//
//   A5  → শুধু প্রবেশপত্র, রুটিন ছাড়া। ডিজাইন আসে ADMIT_TEMPLATES থেকে।
//   A4  → রুটিনসহ প্রবেশপত্র। ডিজাইন আসে admitCardRoutineconfig.js এর
//         নিজের আলাদা তালিকা থেকে — এই ফাইলের সাথে তার সম্পর্ক নেই।
//
// কোন মোড বাছা হলো তার উপরেই নির্ভর করে "টেমপ্লেট সিলেক্ট" এ কোন তালিকা
// দেখাবে আর "রিপোর্টের ধরণ" এ কোন কাগজগুলো থাকবে।
// ---------------------------------------------------------------------------
export const ADMIT_MODES = {
  PLAIN: 'A5',
  ROUTINE: 'A4',
};

export const DEFAULT_ADMIT_MODE = ADMIT_MODES.PLAIN;

export const isRoutineMode = (mode) => String(mode) === ADMIT_MODES.ROUTINE;

/**
 * A5 মোডে "রিপোর্টের ধরণ" এ যে কাগজগুলো থাকবে, এই ক্রমেই।
 * A4 মোডের তালিকা আলাদা ফাইলে (ROUTINE_LAYOUTS) — ওখানে A4 ১টি ও A4 ২টি।
 */
export const PLAIN_LAYOUT_ORDER = ['1', '4', '2', '3'];

export const getLayoutLabel = (type, lang) => {
  const l = PRINT_LAYOUTS[type] || PRINT_LAYOUTS[1];
  return l.labels[safeLang(lang)] ?? l.labels.bn;
};

/**
 * কাগজের প্রিন্টেবল এরিয়ার ভিতরে ratio ঠিক রেখে কার্ডের মাপ বের করে।
 * width আর height — দুইটাই constraint, তাই যেটা ছোট সেটাই নেওয়া হয়।
 */
// export const getPrintLayout = (type) => {
//   const base = PRINT_LAYOUTS[type] || PRINT_LAYOUTS[1];
//   const paper = PRINT_PAGES[base.page] || PRINT_PAGES['A4 portrait'];

//   const contentW = paper.w - base.margin * 2;
//   const contentH = paper.h - base.margin * 2;

//   const slotW = (contentW - base.gap * (base.cols - 1)) / base.cols;
//   const slotH = (contentH - base.gap * (base.rows - 1)) / base.rows;

//   const cellW = Math.min(slotW, slotH * CARD_RATIO);
//   const cellH = cellW / CARD_RATIO;

//   return {
//     ...base,
//     perPage: base.cols * base.rows,
//     paperW: paper.w,
//     paperH: paper.h,
//     contentW,
//     contentH,
//     cellW,
//     cellH,
//     scale: (cellW * MM_TO_PX) / CARD_W,
//   };
// };


/**
 * কাগজের প্রিন্টেবল এরিয়ার ভিতরে কার্ডের মাপ বের করে।
 *
 * stretch:
 *   true  → ঘরটাই কার্ডের মাপ। কার্ড পুরো পাতা জুড়ে বসে; অনুপাত সামান্য
 *           বদলাতে পারে (A4-এর অনুপাত ১.৪১৪, কার্ডের ১.২৬৮ — ১৮% চওড়া),
 *           কিন্তু চারপাশে আর খালি জায়গা থাকে না।
 *   false → পুরোনো আচরণ — কার্ডের নিজের অনুপাত রক্ষা, পাশে ফাঁকা থাক।
 */
export const getPrintLayout = (type, { stretch = true } = {}) => {
  const base = PRINT_LAYOUTS[type] || PRINT_LAYOUTS[1];
  const paper = PRINT_PAGES[base.page] || PRINT_PAGES['A4 portrait'];

  const contentW = paper.w - base.margin * 2;
  const contentH = paper.h - base.margin * 2;

  const slotW = (contentW - base.gap * (base.cols - 1)) / base.cols;
  const slotH = (contentH - base.gap * (base.rows - 1)) / base.rows;

  const cellW = stretch ? slotW : Math.min(slotW, slotH * CARD_RATIO);
  const cellH = stretch ? slotH : cellW / CARD_RATIO;

  return {
    ...base,
    perPage: base.cols * base.rows,
    paperW: paper.w,
    paperH: paper.h,
    contentW,
    contentH,
    cellW,
    cellH,
    // transform: scale(sx, sy) — স্ট্রেচ মোডে দুইটা আলাদা হতে পারে
    scaleX: (cellW * MM_TO_PX) / CARD_W,
    scaleY: (cellH * MM_TO_PX) / CARD_H,
    scale: (cellW * MM_TO_PX) / CARD_W, // পুরোনো কোডের ব্যাকওয়ার্ড কম্প্যাট
    stretch,
  };
};


// ---------------------------------------------------------------------------
// ছাপার CSS
//
// একই নিয়ম সাধারণ প্রবেশপত্র আর রুটিনসহ প্রবেশপত্র — দুই জায়গাতেই লাগে,
// তাই এক জায়গায় লেখা। দুই পাতার ছাপা যেন অক্ষরে অক্ষরে এক হয়।
//
// কোন কম্পিউটারে কেন আলাদা দেখাত, আর এখানে তার কী সমাধান:
//
// ১) ব্রাউজারের মার্জিন সেটিং (Default / None / Custom)
//    `@page { margin: ... }` দিলে ব্যবহারকারী ডায়ালগ থেকে সেটা বদলে
//    দিতে পারে — তখন কার্ড সরে যায় বা কেটে যায়। তাই `@page margin: 0`,
//    আর আমাদের মার্জিনটা পাতার নিজের padding হিসেবে ভিতরে বসানো।
//    Default আর None — দুইটাতেই এখন একদম একই ছাপা পড়ে। পাশাপাশি
//    মার্জিন শূন্য হলে ক্রোম নিজের হেডার/ফুটার (তারিখ, URL) ছাপেও না।
//
// ২) পর্দার মাপ
//    আউটপুটটা অ্যাপের ভিতরে বসে — তার উপরে সাইডবার, `max-width`,
//    `overflow-x: auto` এসব থাকে। পর্দা ছোট হলে ওই ঘরটাও ছোট, আর
//    ছাপার সময় কার্ডের ডান দিক কেটে যেত। তাই ছাপার সময় কার্ডের উপরের
//    সব ঘরের মাপ-বাঁধন খুলে দেওয়া হয় (`:has()` দিয়ে), আর বাকি সব
//    লুকানো হয়। পর্দা ৩২০px হোক বা ২৫৬০px — ছাপা একই।
//
// ৩) "Background graphics" চেকবক্স
//    বন্ধ থাকলে হেডারের রঙিন পট্টি, টেবিলের জেব্রা, ব্যাজ — সব সাদা
//    হয়ে যেত। `print-color-adjust: exact` এখন প্রতিটা ঘরে দেওয়া।
//
// ৪) কাগজ A4 না Letter — উপরে PRINT_PAGES এ সমাধান।
//
// যা CSS দিয়ে ঠিক করা যায় না: ডায়ালগের "Scale" যদি কেউ হাতে বদলায়,
// বা "Custom margins" টানে। সেগুলো ব্যবহারকারীর ইচ্ছাকৃত পরিবর্তন।
// ---------------------------------------------------------------------------

/** mm ভ্যালু ছোট করে লিখি, নাহলে CSS এ 149.80769230769232mm এর মতো আসে */
export const mmValue = (v) => `${Math.round(v * 1000) / 1000}mm`;

export const buildPrintCss = ({ layout, cardW, cardH, grayscale = false, prefix }) => {
  const mm = mmValue;
  const PAGE = `${prefix}-page`;
  const CELL = `${prefix}-cell`;
  const SCALE = `${prefix}-scale`;

  return `
    /* রঙ — ব্রাউজারের "Background graphics" বন্ধ থাকলেও যেন ছাপে */
    .admit-print-root,
    .admit-print-root * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      color-adjust: exact;
    }

    .${PAGE} {
      box-sizing: border-box;
      width: ${mm(layout.paperW)};
      padding: ${mm(layout.margin)};
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(${layout.cols}, ${mm(layout.cellW)});
      grid-template-rows: repeat(${layout.rows}, ${mm(layout.cellH)});
      gap: ${mm(layout.gap)};
      justify-content: center;
      align-content: start;
    }
    .${CELL} {
      width: ${mm(layout.cellW)};
      height: ${mm(layout.cellH)};
      overflow: hidden;
      position: relative;
      ${grayscale ? 'filter: grayscale(1);' : ''}
    }
    /* .${SCALE} { */
    /*   width: ${cardW}px; */
    /*   height: ${cardH}px; */
    /*   transform: scale(${layout.scale}); */
    /*   transform-origin: top left; */
    /* } */

    .${SCALE} {
      width: ${cardW}px;
      height: ${cardH}px;
      /* stretch মোডে x ও y আলাদা — নাহলে শুধু scale(layout.scale) হতো */
      transform: scale(${layout.scaleX ?? layout.scale}, ${layout.scaleY ?? layout.scale});
      transform-origin: top left;
    }

    /* স্ক্রিনে পাতাগুলোর মাঝে ফাঁক ও সীমানা — ছাপায় এর কিছুই যায় না */
    @media screen {
      .${PAGE} + .${PAGE} { margin-top: 10mm; }
    }

    @media print {
      @page {
        /* নাম ('A4 portrait') না দিয়ে সরাসরি মাপ — কারণ ব্রাউজারে কাগজ
           A4 না হয়ে Letter হলে ক্রোম পুরো পাতাটাকে ছোট করে বসিয়ে দেয়
           (A4 এর ২৯৭ কে ২৭৯.৪ এ আনতে ৯৪%) — তখন এক কম্পিউটারে কার্ড
           ৬% ছোট ছাপা হতো। মাপটা দুই কাগজেরই ভিতরে পড়ে এমন দিলে
           ক্রোমকে আর কিছু ছোট করতে হয় না — দুই কাগজেই ঠিক ১০০%। */
        size: ${mm(layout.paperW)} ${mm(layout.paperH)};
        /* মার্জিন পাতার padding এ — ডায়ালগের Default/None দুইটাতেই এক ছাপা */
        margin: 0;
      }

      /* ছাপা কাগজের উপর ছাপা — কাগজে নকশাটা আগে থেকেই ছাপা, তাই এই
         অংশগুলো আমরা আর ছাপি না। পর্দায় ঠিকই দেখা যায়, নইলে ঘরগুলো
         কোথায় বসছে মিলিয়ে নেওয়া যেত না। ক্লাসটা বসে কেবল সেই
         ডিজাইনে যার overlay চালু (Admitcarduploadconfig.js) — তাই
         বাকি সব কার্ড অবিকল আগের মতোই ছাপে। */
      .admit-paper-only { display: none !important; }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: auto !important;
        height: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        background: #fff !important;
        overflow: visible !important;
      }

      /* কার্ডের উপরের প্রতিটা ঘর — অ্যাপের খোলস, সাইডবারের র‍্যাপার,
         max-width, overflow, transform — সব নিরপেক্ষ করে দিই।
         নইলে পর্দার মাপ অনুযায়ী ছাপা বদলে যেত। */
      body *:has(.admit-print-root) {
        display: block !important;
        position: static !important;
        overflow: visible !important;
        width: auto !important;
        min-width: 0 !important;
        max-width: none !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        transform: none !important;
        float: none !important;
        columns: auto !important;
      }

      /* কার্ড আর তার উপরের ঘরগুলো ছাড়া বাকি সব লুকানো — অ্যাপের
         হেডার, সাইডবার, টোস্ট কিছুই যেন কাগজে না আসে */
      body *:not(:has(.admit-print-root)):not(.admit-print-root):not(.admit-print-root *) {
        display: none !important;
      }

      .admit-print-root {
        display: block !important;
        width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      .${PAGE} {
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        page-break-inside: avoid;
        margin: 0 auto !important;
      }
      .${PAGE}:last-child {
        break-after: auto;
        page-break-after: auto;
      }
      .${CELL} {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .${SCALE} img { max-width: none !important; }
    }
  `;
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
    FatherName: row.FatherName || user.FatherName || '',
    MotherName: row.MotherName || user.MotherName || '',
    AdmissionID: row.AdmissionID ?? row.ID ?? user.UserID,
    RollNo: row.RollNo ?? row.AdmissionSerial ?? '',
    AdmissionSerial: row.AdmissionSerial ?? '',
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
