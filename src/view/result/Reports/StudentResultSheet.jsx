import { useMemo, useState, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode, { convertOnLanguageChange } from "../../../utils/conveter";
import { Buffer } from "buffer";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   LANGUAGE (bn / en / ar)  — শুধু প্রিন্ট/প্রিভিউ শিটের জন্য
   সাইডবার সবসময় বাংলা (TRANSLATIONS.bn)
   ═══════════════════════════════════════════════════════════ */
export const LANGUAGE_OPTIONS = [
    { key: "bn", label: "বাংলা" },
    { key: "en", label: "English" },
    { key: "ar", label: "العربية" },
];
export const DEFAULT_LANGUAGE = "bn";

const TRANSLATIONS = {
    bn: {
        settings: "সেটিং",
        settingsSub: "রিপোর্টের কলাম ও প্রিন্ট অপশন",
        footer: "© Result Report Generator",
        language: "ভাষা",
        printLanguage: "প্রিন্টের ভাষা",
        printLanguageNote: "শুধু প্রিভিউ ও প্রিন্টের ভাষা বদলাবে।",
        columnSelect: "কলাম নির্বাচন",
        selectedCount: (c, n) => `${c}/${n} টি নির্বাচিত`,
        all: "সব",
        none: "কিছুই না",
        result: "ফলাফল",
        resultSub: "ফলাফল প্রদর্শনের ধরন নির্বাচন করুন",
        printSetting: "প্রিন্ট সেটিং",
        pageSize: "A4 Landscape",
        color: "রঙ",
        bwNote: "সাদা কালো মোডে শুধু গ্রেড কলামের রঙ থাকবে।",
        colorOpt: "রঙিন",
        bwOpt: "সাদা কালো",
        idSerial: "আইডি সিরিয়ালে",
        byDivision: "বিভাগ অনুসারে",
        byNumber: "নাম্বার অনুসারে",
        short: "সংক্ষিপ্ত",
        headingTitle: "কলামের হেডিং",
        headingNote: "ফাঁকা রাখলে ডিফল্ট নাম ব্যবহার হবে। লিখলে সব ভাষায় এই নামই দেখাবে। শুধু হেডিং বদলাবে, মান একই থাকবে।",
        gpaLabelTitle: "গড়/জিপিএ কলাম",
        gpaOpt: "জিপিএ",
        avgOpt: "গড়",
        gpaTextLabel: "গড়/জিপিএ কলামের নাম (নিজে লিখুন)",
        gpaTextPlaceholder: "যেমন: গড় নম্বর",
        gradeTextLabel: "গ্রেড কলামের নাম (নিজে লিখুন)",
        gradeTextPlaceholder: "যেমন: গ্রেড / বিভাগ",
        resetHeading: "ডিফল্টে ফিরুন",
        sl: "ক্রমিক",
        admission: "ভর্তি",
        studentId: "আইডি",
        name: "শিক্ষার্থীর নাম",
        father: "পিতার নাম",
        mother: "মাতার নাম",
        address: "ঠিকানা",
        total: "মোট",
        gpa: "জিপিএ",
        grade: "গ্রেড",
        position: "স্থান",
        average: "গড়",
        totalExaminees: "মোট পরীক্ষার্থী",
        subjectsTitle: (n, top, prod) => `মোট বিষয় ${n}টি পূর্ণমান ${top} × ${n} = ${prod}`,
        resultTitle: "ফলাফল (নম্বরপত্র)",
        classLabel: "শ্রেণি/জামাত",
        page: (a, b) => `পৃষ্ঠা ${a} / ${b}`,
        date: "তারিখ",
        divisionFallback: "বিভাগ",
        subjectFallback: "বিষয়",
    },
    en: {
        totalExaminees: "Total Examinees",
        sl: "SL",
        admission: "Adm.",
        studentId: "ID",
        name: "Student Name",
        father: "Father's Name",
        mother: "Mother's Name",
        address: "Address",
        total: "Total",
        gpa: "GPA",
        grade: "Grade",
        position: "Pos.",
        average: "Avg.",
        subjectsTitle: (n, top, prod) => `Total ${n} subjects, full marks ${top} × ${n} = ${prod}`,
        resultTitle: "Result (Mark Sheet)",
        classLabel: "Class",
        page: (a, b) => `Page ${a} / ${b}`,
        date: "Date",
        divisionFallback: "Division",
        subjectFallback: "Subject",
    },
    ar: {
        totalExaminees: "إجمالي الممتحنين",
        sl: "م",
        admission: "القبول",
        studentId: "الهوية",
        name: "اسم الطالب",
        father: "اسم الأب",
        mother: "اسم الأم",
        address: "العنوان",
        total: "المجموع",
        gpa: "المعدل",
        grade: "التقدير",
        position: "الترتيب",
        average: "المتوسط",
        subjectsTitle: (n, top, prod) => `إجمالي المواد ${n}، الدرجة الكاملة ${top} × ${n} = ${prod}`,
        resultTitle: "النتيجة (كشف الدرجات)",
        classLabel: "الصف",
        page: (a, b) => `صفحة ${a} / ${b}`,
        date: "التاريخ",
        divisionFallback: "القسم",
        subjectFallback: "المادة",
    },
};

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

// ভাষা অনুযায়ী সংখ্যা ফরম্যাটার
const makeNum = (lang) => (v) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    if (lang === "bn") return bnBijoy2Unicode(s);
    if (lang === "ar") return s.replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
    return s;
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const getFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

// খালি স্ট্রিং/স্পেস বাদ দিয়ে প্রথম আসল টেক্সট
const pickText = (...values) => {
    const found = values.find((v) => typeof v === "string" && v.trim() !== "");
    return found ? found.trim() : "";
};

// ভাষা অনুযায়ী অগ্রাধিকার: নির্বাচিত ভাষা আগে, না থাকলে বাংলা, তারপর বাকিগুলো
const pickByLang = (lang, bnVal, enVal, arVal) => {
    if (lang === "ar") return pickText(arVal, bnVal, enVal);
    if (lang === "en") return pickText(enVal, bnVal, arVal);
    return pickText(bnVal, enVal, arVal);
};

// প্রতিষ্ঠানের নাম: ভাষা অনুযায়ী (খালি থাকলে অন্য ভাষায় fallback)
const getInstitutionName = (info, lang) => {
    if (!info) return "";
    return pickByLang(lang, info.InstitutionName, info.EngInstitutionName, info.AraInstitutionName);
};

// প্রতিষ্ঠানের ঠিকানা
const getInstitutionAddress = (info, lang) => {
    if (!info) return "";
    return pickByLang(lang, info.Address, info.EngAddress, info.AraAddress);
};

// বিভাগ/গ্রেডের নাম (DivisionNames / DivisionEnglishs / DivisionArabics)
const getDivisionName = (division, lang) => {
    if (!division) return "";
    return pickByLang(lang, division.DivisionNames, division.DivisionEnglishs, division.DivisionArabics);
};

// শিক্ষার্থীর নাম (UserName / studentEnglishName / studentArabicName)
const getStudentName = (user, lang) => {
    if (!user) return "";
    return pickByLang(lang, user.UserName, user.studentEnglishName, user.studentArabicName);
};

// সেশনের নাম (SessionName / SessionEngName / SessionAraName)
const getSessionName = (session, lang) => {
    if (!session) return "";
    return pickByLang(lang, session.SessionName, session.SessionEngName, session.SessionAraName);
};

// পরীক্ষার নাম (ExamName / ExamEngName / ExamAraName)
const getExamName = (exam, lang) => {
    if (!exam) return "";
    return pickByLang(lang, exam.ExamName, exam.ExamEngName, exam.ExamAraName);
};

// শ্রেণির নাম (SubClass / SubClassEng / SubClassAra)
const getClassName = (subClass, lang) => {
    if (!subClass) return "";
    return pickByLang(lang, subClass.SubClass, subClass.SubClassEng, subClass.SubClassAra);
};

// বিষয়ের নাম (SubjectName / EngSubjectName / ArabicSubject)
const getSubjectLabel = (subject, lang, fallbackPrefix) => {
    const bnName = getFirstValue(subject.SubjectName, subject.Subject?.SubjectName);
    const enName = getFirstValue(subject.EngSubjectName, subject.Subject?.EngSubjectName);
    const arName = getFirstValue(subject.ArabicSubject, subject.Subject?.ArabicSubject);

    const picked = pickByLang(lang, bnName, enName, arName);
    return picked || `${fallbackPrefix} ${subject.SubjectSL}`;
};

const getByPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const getExtraValue = (studentResult, option) => {
    for (const path of option.paths) {
        const v = getByPath(studentResult, path);
        if ((typeof v === "string" || typeof v === "number") && String(v).trim() !== "") {
            return String(v).trim();
        }
    }
    return "";
};

const isFilled = (v) => v !== undefined && v !== null && v !== "";

/* ═══════════════════════════════════════════════════════════
   PASS NUMBER (বিষয়ভিত্তিক পাস নাম্বার)
   ⚠️ আপনার backend এ পাস নাম্বারের ফিল্ডের নাম অন্য হলে
      শুধু নিচের PASS_FIELDS অ্যারেতে সেই নামটা যোগ করুন।
   ═══════════════════════════════════════════════════════════ */
const PASS_FIELDS = [
    "PassNumber", "SubjectPassNumber", "PassMark", "PassMarks",
    "PassNo", "Pass", "SubjectPass", "MinNumber",
];

// একটি বিষয়ের পাস নাম্বার; না পেলে null (তখন মার্ক করা হবে না)
const getPassMark = (subject) => {
    for (const f of PASS_FIELDS) {
        const v = getFirstValue(subject?.[f], subject?.Subject?.[f]);
        if (v !== undefined) {
            const n = Number(v);
            if (Number.isFinite(n)) return n;
        }
    }
    return null;
};

// নম্বর পাস নাম্বারের চেয়ে কম কি না
const isBelowPass = (val, passMark) => {
    if (passMark === null || !isFilled(val) || String(val).trim() === "") return false;
    const n = Number(val);
    if (!Number.isFinite(n)) return false;
    return n < passMark;
};

/* ═══════════════════════════════════════════════════════════
   KERAT ACTION — মোট নম্বরে যে বিষয় ধরা হবে না
   subjectPassNumbers[i].KeratAction === true হলে ওই বিষয়
   (SubVal{i+1}) মোট নম্বরের যোগফল থেকে বাদ যাবে।
   ═══════════════════════════════════════════════════════════ */
const isKerat = (subject) => {
    const v = subject?.KeratAction;
    return v === true || v === 1 || v === "1" || v === "true";
};

// KeratAction true বিষয় বাদ দিয়ে বাকি বিষয়ের যোগফল
const calcTotal = (studentResult, subjects) => {
    if (!Array.isArray(subjects) || subjects.length === 0) {
        const n = Number(studentResult?.Total);
        return Number.isFinite(n) ? n : 0;
    }
    let sum = 0;
    subjects.forEach((s, i) => {
        if (isKerat(s)) return;
        const n = Number(studentResult?.[`SubVal${i + 1}`]);
        if (Number.isFinite(n)) sum += n;
    });
    return sum;
};

/* ═══════════════════════════════════════════════════════════
   DIVISION SCALE (dynamic)
   ExamType == 4  → subjectPassNumbers (DivisionID/DivisionNumber)  [পয়েন্ট ভিত্তিক]
   others         → conditionAverage   (DivisionID/DivisionNumber)  [গড় ভিত্তিক]
   Name আসে divitionList থেকে (ভাষা অনুযায়ী)
   return: { rows: [{id, name, num}], top }
   ═══════════════════════════════════════════════════════════ */
const buildDivisionScale = (
    conditionAverage,
    subjectPassNumbers,
    divisionList,
    fallbackPrefix = "বিভাগ",
    lang = "bn"
) => {
    const examType = Number(conditionAverage?.ExamType);

    const nameMap = {};
    (divisionList || []).forEach((d) => {
        nameMap[Number(d.ID)] = getDivisionName(d, lang);
    });

    let source = {};
    let top = 100;

    if (examType === 4) {
        const subj = (subjectPassNumbers || []).find((s) =>
            [1, 2, 3, 4, 5, 6, 7].some((i) => isFilled(s?.[`DivisionID${i}`]))
        );
        source = subj || {};
        top = Number(getFirstValue(subj?.TopDivisionNumber, subj?.MaxNumber, 100));
    } else {
        source = conditionAverage || {};
        top = Number(getFirstValue(conditionAverage?.DivisionTopNumber, 100));
    }

    const rows = [];
    for (let i = 1; i <= 7; i++) {
        const id = source?.[`DivisionID${i}`];
        const num = source?.[`DivisionNumber${i}`];
        if (!isFilled(id) || !isFilled(num)) continue;
        rows.push({
            id: Number(id),
            name: nameMap[Number(id)] || `${fallbackPrefix} ${id}`,
            num: Number(num),
        });
    }

    return { rows, top };
};

/* ═══════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════ */
export const RESULT_COLUMNS = [
    { key: "sl", label: "ক্রমিক" },
    { key: "admission", label: "ভর্তি" },
    { key: "id", label: "আইডি" },
    { key: "name", label: "শিক্ষার্থীর নাম" },
    { key: "total", label: "মোট" },
    { key: "gpa", label: "গড়" },
    { key: "grade", label: "গ্রেড" },
    { key: "pos", label: "স্থান" },
];

export const DEFAULT_VISIBLE_COLUMNS = Object.fromEntries(
    RESULT_COLUMNS.map((c) => [c.key, true])
);

export const NAME_EXTRA_OPTIONS = [
    {
        key: "father", label: "পিতার নাম",
        paths: [
            "User.FatherName", "User.Father_Name", "User.Father",
            "User.Admission.0.FatherName", "User.UserDetail.FatherName",
            "User.UserDetails.FatherName", "User.Detail.FatherName", "FatherName",
        ],
    },
    {
        key: "mother", label: "মাতার নাম",
        paths: [
            "User.MotherName", "User.Mother_Name", "User.Mother",
            "User.Admission.0.MotherName", "User.UserDetail.MotherName",
            "User.UserDetails.MotherName", "User.Detail.MotherName", "MotherName",
        ],
    },
    {
        key: "address", label: "ঠিকানা",
        paths: [
            "User.Address", "User.PresentAddress", "User.PermanentAddress",
            "User.Admission.0.Address", "User.UserDetail.Address",
            "User.UserDetails.Address", "User.Detail.Address", "Address",
        ],
    },
];

export const DEFAULT_NAME_EXTRAS = Object.fromEntries(
    NAME_EXTRA_OPTIONS.map((o) => [o.key, false])
);

export const RESULT_OPTIONS = [
    { key: "idSerial", label: "আইডি সিরিয়ালে" },
    { key: "byDivision", label: "বিভাগ অনুসারে" },
    { key: "byNumber", label: "নাম্বার অনুসারে" },
    { key: "short", label: "সংক্ষিপ্ত" },
];

export const DEFAULT_RESULT_OPTIONS = {
    idSerial: true,
    byDivision: false,
    byNumber: false,
    short: false,
};

export const COLOR_OPTIONS = [
    { key: "color", label: "রঙিন" },
    { key: "bw", label: "সাদা কালো" },
];

export const DEFAULT_COLOR_MODE = "color";

// গড়/জিপিএ কলামের হেডিং — ডিফল্ট: গড়
export const GPA_LABEL_OPTIONS = [
    { key: "avg", label: "গড়" },
    { key: "gpa", label: "জিপিএ" },
];

export const DEFAULT_GPA_LABEL = "avg";

/* ═══════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════ */
const FAIL_NAME_RE = /স্থগিত|ছগিত|রাসিব|fail|^F$/i;

// দ্রষ্টব্য: ফেল/স্থগিত চেনার জন্য সবসময় মূল বাংলা DivisionNames ব্যবহার হয় (ভাষা বদলালেও রঙ ঠিক থাকে)
const isFailDivision = (studentResult) =>
    FAIL_NAME_RE.test(String(studentResult?.Division?.DivisionNames ?? ""));

// গড় দিয়ে fallback রঙ (যখন বিভাগ চেনা যায় না)
const colorTint = (studentResult, avg) => {
    if (isFailDivision(studentResult)) return { bg: "#fee2e2", fg: "#991b1b" };
    if (avg >= 80) return { bg: "#dcfce7", fg: "#166534" };
    if (avg >= 70) return { bg: "#cffafe", fg: "#155e75" };
    if (avg >= 60) return { bg: "#fef9c3", fg: "#854d0e" };
    if (avg >= 33) return { bg: "#ffedd5", fg: "#9a3412" };
    return { bg: "#fee2e2", fg: "#991b1b" };
};

// প্রতিটি গ্রেড/বিভাগের জন্য আলাদা আলাদা রঙ (বিভাগের ক্রম অনুযায়ী: ১ম = সেরা)
const GRADE_COLORS = [
    { bg: "#bbf7d0", fg: "#14532d" }, // সবুজ
    { bg: "#99f6e4", fg: "#134e4a" }, // টিল
    { bg: "#bae6fd", fg: "#075985" }, // আকাশি নীল
    { bg: "#fef08a", fg: "#854d0e" }, // হলুদ
    { bg: "#fed7aa", fg: "#9a3412" }, // কমলা
    { bg: "#e9d5ff", fg: "#6b21a8" }, // বেগুনি
    { bg: "#fbcfe8", fg: "#9d174d" }, // গোলাপি
];
const GRADE_FAIL_COLOR = { bg: "#fecaca", fg: "#991b1b" }; // ফেল/স্থগিত = লাল

// অকৃতকার্য বিষয়ের মার্ক (পাস নাম্বারের চেয়ে কম)
const FAIL_MARK = {
    color: { bg: "#fecaca", fg: "#b91c1c", textDecoration: "none" },
    bw: { bg: "#d4d4d4", fg: "#000", textDecoration: "underline" },
};

const DIVISION_PALETTE = [
    "#15803d", "#16a34a", "#0d9488", "#2563eb",
    "#d97706", "#ea580c", "#dc2626", "#6b7280",
];

const THEMES = {
    color: {
        C: {
            primary: "#0f766e", primaryDark: "#134e4a", primaryMid: "#99f6e4",
            primarySoft: "#ccfbf1", primaryFaint: "#f0fdfa", border: "#334155",
            borderSoft: "#cbd5e1", text: "#0f172a", muted: "#64748b", danger: "#b91c1c",
        },
        side: {
            headBg: "#0f766e", headFg: "#ffffff",
            bodyBg: "#ffffff", altBg: "#f0fdfa",
            border: "#334155", text: "#0f172a", divider: "#cbd5e1",
        },
        palette: DIVISION_PALETTE,
        medals: {
            1: { bg: "#facc15", fg: "#422006", border: "1.5px solid #a16207" }, // উজ্জ্বল সোনালি
            2: { bg: "#38bdf8", fg: "#ffffff", border: "1.5px solid #0369a1" }, // নীল
            3: { bg: "#ea580c", fg: "#ffffff", border: "1.5px solid #9a3412" }, // গাঢ় কমলা/ব্রোঞ্জ
        },
    },
    bw: {
        C: {
            primary: "#000", primaryDark: "#000", primaryMid: "#d4d4d4",
            primarySoft: "#e5e5e5", primaryFaint: "#f4f4f4", border: "#000",
            borderSoft: "#737373", text: "#000", muted: "#404040", danger: "#000",
        },
        side: {
            headBg: "#7f7f7f", headFg: "#ffffff",
            bodyBg: "#ffffff", altBg: "#ffffff",
            border: "#000", text: "#000", divider: "#737373",
        },
        palette: DIVISION_PALETTE,
        medals: {
            1: { bg: "#facc15", fg: "#422006", border: "1.5px solid #a16207" }, // উজ্জ্বল সোনালি
            2: { bg: "#38bdf8", fg: "#ffffff", border: "1.5px solid #0369a1" }, // নীল
            3: { bg: "#ea580c", fg: "#ffffff", border: "1.5px solid #9a3412" }, // গাঢ় কমলা/ব্রোঞ্জ
        },
    },
}

// শিট (প্রিভিউ + প্রিন্ট) এর সব লেখায় এই ফন্ট — প্রিন্ট portal document.body তে থাকায় আলাদা করে সেট করা
const SHEET_FONT = '"SolaimanLipiNormal", "SolaimanLipi", serif';

const bg = (color) => ({
    backgroundColor: color,
    boxShadow: `inset 0 0 0 1000px ${color}`,
});

/* ═══════════════════════════════════════════════════════════
   A4 LANDSCAPE
   ═══════════════════════════════════════════════════════════ */
const PAGE_W = 1080;
const PAGE_H = 750;
const THEAD_H = 100;
const HEADER_H = 190;
const HEADER_GAP = 8;
const FOOTER_RESERVE = 20;
const SAFETY = 8;
const SIGNATURE_H = 130;
const ROW_H_NORMAL = 24;
const ROW_H_EXTRA = 32;

const COL = { sl: 36, admission: 46, id: 52, total: 46, gpa: 52, grade: 96, pos: 38 };
const NAME_W_NORMAL = 190;
const NAME_W_EXTRA = 360;

const SHORT_HEADER_H = 150;
const SHORT_THEAD_H = 30;
const SHORT_ROW_H = 28;
const SHORT_COL_GAP = 14;
const SHORT_TABLE_W = (PAGE_W - SHORT_COL_GAP) / 2;
const SHORT_COL = { id: 54, avg: 58, division: 94 };
const SHORT_NAME_W = Math.floor(
    (SHORT_TABLE_W - SHORT_COL.id - SHORT_COL.avg - SHORT_COL.division) / 2
);

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════ */
const LS_VISIBLE = "resultSheetVisibleColumns";
const LS_COLOR = "resultSheetColorMode";
const LS_NAME_EXTRAS = "resultSheetNameExtras";
const LS_RESULT_OPTS = "resultSheetResultOptions";
const LS_LANG = "resultSheetLanguage";
const LS_GPA_LABEL = "resultSheetGpaLabel";
const LS_GPA_TEXT = "resultSheetGpaText";
const LS_GRADE_TEXT = "resultSheetGradeText";

const loadText = (key) => {
    try {
        return localStorage.getItem(key) || "";
    } catch (e) { }
    return "";
};

const loadObj = (key, fallback) => {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved && typeof saved === "object") return { ...fallback, ...saved };
    } catch (e) { }
    return { ...fallback };
};

// ফলাফল অপশন সবসময় ঠিক একটাই true থাকবে
const ORDERED_RESULT_KEYS = ["idSerial", "byDivision", "byNumber", "short"];
const normalizeResultOptions = (opts) => {
    const active = ORDERED_RESULT_KEYS.find((k) => opts?.[k]) || "idSerial";
    return Object.fromEntries(ORDERED_RESULT_KEYS.map((k) => [k, k === active]));
};

const loadStr = (key, options, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved && options.some((o) => o.key === saved)) return saved;
    } catch (e) { }
    return fallback;
};

/* ═══════════════════════════════════════════════════════════
   SIGNATURE
   ═══════════════════════════════════════════════════════════ */
function SignatureSection({ C, dateText, dateLabel, NajemName, PrincipalName, najem, principal }) {
    const signatureBox = {
        flex: 1, maxWidth: "280px", display: "flex",
        flexDirection: "column", alignItems: "center", textAlign: "center",
    };
    const sigImgWrap = {
        height: "52px", display: "flex", alignItems: "flex-end",
        justifyContent: "center", marginBottom: "0px",
    };
    const sigImg = {
        maxHeight: "52px", maxWidth: "150px", objectFit: "contain",
        mixBlendMode: "multiply", userSelect: "none", pointerEvents: "none",
    };
    const dashedLine = {
        width: "180px", borderTop: `1px dashed ${C.border}`,
        marginTop: "2px", marginBottom: "3px",
    };

    return (
        <div className="signature-section" style={{
            marginTop: "14px", paddingTop: "10px",
            borderTop: `2px solid ${C.primary}`,
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", gap: "24px",
            height: `${SIGNATURE_H}px`, boxSizing: "border-box", overflow: "hidden",
        }}>
            <div style={signatureBox}>
                <div style={sigImgWrap}><img src={principal} alt="signature" style={sigImg} /></div>
                <div style={dashedLine} />
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{PrincipalName}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: 600, color: C.text }}>{dateLabel} : {dateText}</p>
            </div>
            <div style={signatureBox}>
                <div style={sigImgWrap}><img src={najem} alt="signature" style={sigImg} /></div>
                <div style={dashedLine} />
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{NajemName}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", fontWeight: 600, color: C.text }}>{dateLabel} : {dateText}</p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   🧾 MAIN
   ═══════════════════════════════════════════════════════════ */
export default function StudentResultSheet({ reportData, query, labels }) {

    console.log(reportData, "reportData");

    const { data: institutionInfo } = useGetInstitutionInfoQuery();

    const [principal, setPrincipal] = useState(null);
    const [najem, setNajem] = useState(null);

    const [visibleColumns, setVisibleColumns] = useState(() => loadObj(LS_VISIBLE, DEFAULT_VISIBLE_COLUMNS));
    const [nameExtras, setNameExtras] = useState(() => loadObj(LS_NAME_EXTRAS, DEFAULT_NAME_EXTRAS));
    const [resultOptions, setResultOptions] = useState(() =>
        normalizeResultOptions(loadObj(LS_RESULT_OPTS, DEFAULT_RESULT_OPTIONS))
    );
    const [colorMode, setColorMode] = useState(() => loadStr(LS_COLOR, COLOR_OPTIONS, DEFAULT_COLOR_MODE));
    const [lang, setLang] = useState(() => loadStr(LS_LANG, LANGUAGE_OPTIONS, DEFAULT_LANGUAGE));
    const [gpaLabelMode, setGpaLabelMode] = useState(() =>
        loadStr(LS_GPA_LABEL, GPA_LABEL_OPTIONS, DEFAULT_GPA_LABEL)
    );
    const [gpaText, setGpaText] = useState(() => loadText(LS_GPA_TEXT));
    const [gradeText, setGradeText] = useState(() => loadText(LS_GRADE_TEXT));

    useEffect(() => { localStorage.setItem(LS_VISIBLE, JSON.stringify(visibleColumns)); }, [visibleColumns]);
    useEffect(() => { localStorage.setItem(LS_NAME_EXTRAS, JSON.stringify(nameExtras)); }, [nameExtras]);
    useEffect(() => { localStorage.setItem(LS_RESULT_OPTS, JSON.stringify(resultOptions)); }, [resultOptions]);
    useEffect(() => { localStorage.setItem(LS_COLOR, colorMode); }, [colorMode]);
    useEffect(() => { localStorage.setItem(LS_LANG, lang); }, [lang]);
    useEffect(() => { localStorage.setItem(LS_GPA_LABEL, gpaLabelMode); }, [gpaLabelMode]);
    useEffect(() => { localStorage.setItem(LS_GPA_TEXT, gpaText); }, [gpaText]);
    useEffect(() => { localStorage.setItem(LS_GRADE_TEXT, gradeText); }, [gradeText]);

    /* ── সাইডবার: সবসময় বাংলা ── */
    const tUI = TRANSLATIONS.bn;
    const numUI = useMemo(() => makeNum("bn"), []);

    /* ── প্রিন্ট/প্রিভিউ শিট: নির্বাচিত ভাষা ── */
    const t = { ...TRANSLATIONS.bn, ...(TRANSLATIONS[lang] || {}) };
    const dir = lang === "ar" ? "rtl" : "ltr";
    const num = useMemo(() => makeNum(lang), [lang]);

    /* ── প্রতিষ্ঠানের নাম ও ঠিকানা (ভাষা অনুযায়ী) ── */
    const institutionName = getInstitutionName(institutionInfo, lang);
    const institutionAddress = getInstitutionAddress(institutionInfo, lang);

    const activeResultOption = useMemo(() => {
        if (resultOptions.idSerial) return "idSerial";
        if (resultOptions.byDivision) return "byDivision";
        if (resultOptions.byNumber) return "byNumber";
        if (resultOptions.short) return "short";
        return "idSerial";
    }, [resultOptions]);

    /* ── বিভাগের ক্রম (শুধু id দিয়ে, নামের ভাষা অপ্রাসঙ্গিক) ── */
    const divisionOrder = useMemo(() => {
        const scale = buildDivisionScale(
            reportData?.conditionAverage,
            reportData?.subjectPassNumbers,
            reportData?.divitionList,
            "বিভাগ",
            "bn"
        );
        const map = {};
        scale.rows.forEach((d, i) => { map[d.id] = i; });
        return map;
    }, [reportData]);

    /* ── সর্ট ফ্রন্টএন্ডে ── */
    const transformedData = useMemo(() => {
        if (!reportData) return null;
        const base = {
            reportid: reportData.reportid,
            subjectPassNumbers: reportData.subjectPassNumbers,
            conditionAverage: reportData.conditionAverage,
            divitionList: reportData.divitionList,
        };
        const all = Array.isArray(reportData.studentResults) ? reportData.studentResults : [];
        const serialOf = (s) => Number(s?.User?.Admission?.[0]?.AdmissionSerial) || 0;
        // KeratAction true বিষয় বাদ দিয়ে মোট
        const totalOf = (s) => {
            const n = calcTotal(s, reportData.subjectPassNumbers);
            return Number.isNaN(n) ? -Infinity : n;
        };

        switch (activeResultOption) {
            case "byDivision": {
                const rank = (s) => divisionOrder[Number(s?.DivisionID)] ?? 999;
                const list = [...all].sort(
                    (a, b) =>
                        rank(a) - rank(b) ||
                        Number(a?.DivisionID) - Number(b?.DivisionID) ||
                        totalOf(b) - totalOf(a) ||
                        serialOf(a) - serialOf(b)
                );
                return { ...base, studentResults: list };
            }
            case "byNumber": {
                const list = [...all].sort(
                    (a, b) => totalOf(b) - totalOf(a) || serialOf(a) - serialOf(b)
                );
                return { ...base, studentResults: list };
            }
            case "short":
            case "idSerial":
            default:
                return { ...base, studentResults: all };
        }
    }, [reportData, activeResultOption, divisionOrder]);

    const conditionAverage = transformedData?.conditionAverage || {};
    const subjectPassNumbers = transformedData?.subjectPassNumbers || [];
    const divisionList = transformedData?.divitionList || [];

    const theme = THEMES[colorMode] || THEMES.color;
    const C = theme.C;
    const S = theme.side;
    const paletteColor = (i) => theme.palette[Math.min(i, theme.palette.length - 1)];

    // বাংলা হলে backend এর labels আগে, অন্য ভাষায় সরাসরি অনুবাদ (শুধু শিটের জন্য)
    const L = (backendKey, tKey) =>
        lang === "bn" ? (labels?.[backendKey] ?? t[tKey]) : t[tKey];

    // গড়/জিপিএ কলামের হেডিং: নির্বাচিত মোড অনুযায়ী (ডিফল্ট গড়)
    // নিজে লেখা টেক্সট থাকলে সেটাই অগ্রাধিকার পাবে
    const gpaHeading =
        gpaText.trim() ||
        (gpaLabelMode === "gpa"
            ? L("GPALabel", "gpa")
            : L("AverageLabel", "average"));
    const gradeHeading = gradeText.trim() || L("GradeLabel", "grade");

    const LABELS = {
        sl: L("SerialLabel", "sl"),
        studentId: L("StudentIDLabel", "studentId"),
        admission: L("AdmissionIDLabel", "admission"),
        name: L("StudentNameLabel", "name"),
        father: L("FatherNameLabel", "father"),
        mother: L("MotherNameLabel", "mother"),
        address: L("AddressLabel", "address"),
        total: L("TotalLabel", "total"),
        gpa: gpaHeading,
        grade: gradeHeading,
        position: L("PositionLabel", "position"),
        average: L("AverageLabel", "average"),
    };

    /* ── পরীক্ষা / সেশন / শ্রেণির নাম (ভাষা অনুযায়ী) ── */
    const examName = getExamName(conditionAverage?.Exam, lang);
    const sessionNameRaw = getSessionName(conditionAverage?.Session, lang);
    const sessionName = lang === "ar" ? num(sessionNameRaw) : sessionNameRaw;
    const className = getClassName(conditionAverage?.SubClass, lang);

    const show = { ...DEFAULT_VISIBLE_COLUMNS, ...(visibleColumns || {}) };
    const extrasState = { ...DEFAULT_NAME_EXTRAS, ...(nameExtras || {}) };
    const activeExtras = NAME_EXTRA_OPTIONS.filter((o) => extrasState[o.key]);
    const hasExtras = show.name && activeExtras.length > 0;

    const isShort = activeResultOption === "short";
    const showCol = show;

    const ROW_H = hasExtras ? ROW_H_EXTRA : ROW_H_NORMAL;
    const nameW = hasExtras ? NAME_W_EXTRA : NAME_W_NORMAL;

    const studentResultsDetails = Array.isArray(transformedData?.studentResults)
        ? transformedData.studentResults
        : [];

    const subjectCount = useMemo(() => {
        const n = Number(conditionAverage?.SubSonkha);
        if (n > 0) return n;
        return subjectPassNumbers.length;
    }, [conditionAverage, subjectPassNumbers]);

    /* ── পয়েন্ট ভিত্তিক (ExamType 4) নাকি গড় ভিত্তিক ── */
    const isPointBased = Number(conditionAverage?.ExamType) === 4;

    // গড় ভিত্তিক হলে ডান বক্সের "মোট বিষয়" = AverageSubsonkha, পয়েন্ট ভিত্তিক হলে আগের মতোই subjectCount
    const summarySubjectCount = useMemo(() => {
        if (isPointBased) return subjectCount;
        const n = Number(conditionAverage?.AverageSubsonkha);
        return n > 0 ? n : subjectCount;
    }, [isPointBased, conditionAverage, subjectCount]);

    /* ── প্রতিটি বিষয়ের পাস নাম্বার (সাবজেক্ট কলামের ক্রম অনুযায়ী) ── */
    const passMarks = useMemo(
        () => subjectPassNumbers.map((s) => getPassMark(s)),
        [subjectPassNumbers]
    );

    const divisionScale = useMemo(
        () => buildDivisionScale(conditionAverage, subjectPassNumbers, divisionList, t.divisionFallback, lang),
        [conditionAverage, subjectPassNumbers, divisionList, t.divisionFallback, lang]
    );

    /* ── গ্রেড/বিভাগ অনুযায়ী আলাদা রঙ: divisionId → রঙ ── */
    const gradeColorMap = useMemo(() => {
        const map = {};
        const used = new Set();
        let idx = 0;
        // প্রথমে বিভাগের ক্রম অনুযায়ী (ফেল/স্থগিত বাদে)
        const ordered = [...(divisionList || [])];
        const orderIds = divisionScale.rows.map((d) => d.id);
        ordered.sort((a, b) => {
            const ia = orderIds.indexOf(Number(a.ID));
            const ib = orderIds.indexOf(Number(b.ID));
            return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        });
        ordered.forEach((d) => {
            const id = Number(d.ID);
            if (used.has(id)) return;
            used.add(id);
            if (FAIL_NAME_RE.test(String(d.DivisionNames ?? ""))) {
                map[id] = GRADE_FAIL_COLOR;
            } else {
                map[id] = GRADE_COLORS[idx % GRADE_COLORS.length];
                idx += 1;
            }
        });
        return map;
    }, [divisionList, divisionScale]);

    const getGradeColor = (studentResult, avg) => {
        if (isFailDivision(studentResult)) return GRADE_FAIL_COLOR;
        const id = Number(getFirstValue(studentResult?.DivisionID, studentResult?.Division?.ID));
        if (!Number.isNaN(id) && gradeColorMap[id]) return gradeColorMap[id];
        if (!Number.isNaN(id)) return GRADE_COLORS[id % GRADE_COLORS.length];
        return colorTint(studentResult, avg);
    };

    const divisionStats = useMemo(() => {
        const allStudents =
            Array.isArray(reportData?.studentResults) && reportData.studentResults.length
                ? reportData.studentResults
                : studentResultsDetails;

        const counts = {};
        const extraNames = {};
        allStudents.forEach((s) => {
            const id = Number(getFirstValue(s?.DivisionID, s?.Division?.ID));
            if (Number.isNaN(id)) return;
            counts[id] = (counts[id] || 0) + 1;
            const nm = getDivisionName(s?.Division, lang);
            if (nm) extraNames[id] = nm;
        });

        const rows = divisionScale.rows.map((d) => ({
            id: d.id,
            label: d.name,
            count: counts[d.id] || 0,
        }));

        Object.keys(counts).forEach((k) => {
            const id = Number(k);
            if (!rows.some((r) => r.id === id)) {
                rows.push({ id, label: extraNames[id] ?? `${t.divisionFallback} ${id}`, count: counts[id] });
            }
        });

        return { rows, total: allStudents.length };
    }, [reportData, studentResultsDetails, divisionScale, t.divisionFallback, lang]);

    useEffect(() => {
        if (institutionInfo?.SignaturePrincipal?.data) {
            const buf = Buffer.from(institutionInfo.SignaturePrincipal.data);
            setPrincipal(`data:image/png;base64,${buf.toString("base64")}`);
        }
        if (institutionInfo?.SignatureNajem?.data) {
            const buf = Buffer.from(institutionInfo.SignatureNajem.data);
            setNajem(`data:image/png;base64,${buf.toString("base64")}`);
        }
    }, [institutionInfo]);

    const shortRowsPerCol = useMemo(
        () =>
            Math.max(1, Math.floor(
                (PAGE_H - SHORT_HEADER_H - HEADER_GAP - SHORT_THEAD_H - SIGNATURE_H - FOOTER_RESERVE - SAFETY) / SHORT_ROW_H
            )),
        []
    );

    const pages = useMemo(() => {
        const list = studentResultsDetails;
        if (!list.length) return [[]];

        const cap = isShort
            ? shortRowsPerCol * 2
            : Math.max(1, Math.floor(
                (PAGE_H - HEADER_H - HEADER_GAP - THEAD_H - SIGNATURE_H - FOOTER_RESERVE - SAFETY) / ROW_H
            ));

        const chunks = [];
        for (let i = 0; i < list.length; i += cap) {
            chunks.push(list.slice(i, i + cap));
        }
        return chunks;
    }, [studentResultsDetails, ROW_H, isShort, shortRowsPerCol]);

    const totalExaminees = divisionStats.total;

    const getToday = () => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return num(`${dd}/${mm}/${yyyy}`);
    };

    const styles = {
        td: {
            border: `1px solid ${C.border}`, padding: "0 3px", textAlign: "center",
            verticalAlign: "middle", height: `${ROW_H}px`, fontSize: "12px",
            lineHeight: `${ROW_H - 2}px`, overflow: "hidden",
            whiteSpace: "nowrap", color: C.text,
        },
        th: {
            border: `1px solid ${C.border}`, padding: "2px", textAlign: "center",
            verticalAlign: "middle", fontSize: "12px", fontWeight: 700,
            color: C.primaryDark, overflow: "hidden", ...bg(C.primarySoft),
        },
    };
    const thStrong = { ...styles.th, ...bg(C.primaryMid), color: C.primaryDark };

    const sideTitle = {
        ...bg(S.headBg), color: S.headFg, textAlign: "center",
        fontSize: "13px", fontWeight: 700, height: "26px", lineHeight: "26px",
        flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden",
    };
    const sideBox = {
        border: `1px solid ${S.border}`, alignSelf: "stretch",
        overflow: "hidden", ...bg(S.bodyBg),
        display: "flex", flexDirection: "column", minHeight: 0,
    };
    const sideBody = {
        flex: 1, display: "flex", flexDirection: "column", minHeight: 0,
        padding: "3px 0",
    };
    const sideRowBase = {
        flex: 1, display: "grid", alignItems: "center",
        fontSize: "13px", minHeight: 0, color: S.text,
    };
    const cellCenter = { display: "flex", alignItems: "center", justifyContent: "center" };

    const renderCenterTitle = () => (
        <div style={{ textAlign: "center", alignSelf: "center", minWidth: 0 }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, lineHeight: 1.25, color: C.primaryDark }}>
                {institutionName}
            </h1>
            <p style={{ fontSize: "13px", fontWeight: 600, margin: "3px 0 0", color: C.muted }}>
                {institutionAddress}
            </p>
            <h2 style={{ fontSize: "14px", margin: "6px 0 0", fontWeight: 600, color: C.text }}>
                {examName} — {sessionName}
            </h2>
            <div style={{
                display: "inline-block", ...bg(C.primaryMid), color: C.primaryDark,
                border: `1.5px solid ${C.primary}`, padding: "2px 22px",
                marginTop: "7px", fontWeight: 800, fontSize: "15px",
                lineHeight: "22px", borderRadius: "999px",
            }}>
                {t.resultTitle}
            </div>
            <p style={{ fontSize: "14px", margin: "6px 0 0", fontWeight: 600, color: C.text }}>
                {t.classLabel} : <span style={{ color: C.primary }}>{className}</span>
            </p>
        </div>
    );

    const renderHeaderBlock = () => (
        <div style={{
            display: "grid", gridTemplateColumns: "220px 1fr 290px", gridTemplateRows: "1fr",
            gap: "16px", padding: "10px 0", borderBottom: `3px solid ${C.primary}`,
            height: `${HEADER_H}px`, boxSizing: "border-box", overflow: "hidden",
            marginBottom: `${HEADER_GAP}px`,
        }}>
            <div style={sideBox}>
                <div style={sideTitle}>{t.totalExaminees} = {num(totalExaminees)}</div>
                <div style={sideBody}>
                    {divisionStats.rows.map((item, i) => (
                        <div key={item.id ?? i} style={{
                            ...sideRowBase, gridTemplateColumns: "1fr 22px 52px",
                            ...bg(i % 2 ? S.altBg : S.bodyBg),
                        }}>
                            <div style={{
                                paddingInlineStart: "8px", whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis",
                                color: paletteColor(i), fontWeight: 700,
                            }}>{item.label}</div>
                            <div style={cellCenter}>=</div>
                            <div style={{
                                ...cellCenter, justifyContent: "flex-start", paddingInlineStart: "6px",
                                fontWeight: 700,
                            }}>
                                {num(item.count)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {renderCenterTitle()}

            <div style={sideBox}>
                <div style={sideTitle}>
                    {t.subjectsTitle(
                        num(summarySubjectCount),
                        num(divisionScale.top),
                        num(divisionScale.top * summarySubjectCount)
                    )}
                </div>
                <div style={sideBody}>
                    {divisionScale.rows.map((item, i) => (
                        <div key={item.id ?? i} style={{
                            ...sideRowBase,
                            gridTemplateColumns: "1fr 14px 40px 20px 20px 16px 52px",
                            ...bg(i % 2 ? S.altBg : S.bodyBg),
                        }}>
                            <div style={{
                                paddingInlineStart: "8px", whiteSpace: "nowrap",
                                overflow: "hidden", textOverflow: "ellipsis",
                                color: paletteColor(i), fontWeight: 700,
                            }}>{item.name}</div>
                            <div style={cellCenter}>:</div>
                            <div style={{ ...cellCenter, justifyContent: "flex-end" }}>{num(item.num)}</div>
                            <div style={cellCenter}>×</div>
                            <div style={cellCenter}>{num(summarySubjectCount)}</div>
                            <div style={cellCenter}>=</div>
                            <div style={{ ...cellCenter, justifyContent: "flex-start", paddingInlineStart: "2px" }}>
                                {num(item.num * summarySubjectCount)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderShortHeaderBlock = () => (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px 0", borderBottom: `3px solid ${C.primary}`,
            height: `${SHORT_HEADER_H}px`, boxSizing: "border-box",
            overflow: "hidden", marginBottom: `${HEADER_GAP}px`,
        }}>
            {renderCenterTitle()}
        </div>
    );

    const renderColGroup = () => (
        <colgroup>
            {showCol.sl && <col style={{ width: `${COL.sl}px` }} />}
            {showCol.admission && <col style={{ width: `${COL.admission}px` }} />}
            {showCol.id && <col style={{ width: `${COL.id}px` }} />}
            {showCol.name && <col style={{ width: `${nameW}px` }} />}
            {subjectPassNumbers.map((_, i) => <col key={i} />)}
            {showCol.total && <col style={{ width: `${COL.total}px` }} />}
            {showCol.gpa && <col style={{ width: `${COL.gpa}px` }} />}
            {showCol.grade && <col style={{ width: `${COL.grade}px` }} />}
            {showCol.pos && <col style={{ width: `${COL.pos}px` }} />}
        </colgroup>
    );

    const nameHeaderLabel = [
        LABELS.name,
        ...activeExtras.map((o) => {
            if (o.key === "father") return LABELS.father;
            if (o.key === "mother") return LABELS.mother;
            if (o.key === "address") return LABELS.address;
            return o.label;
        }),
    ].join(" - ");

    const renderColumnHeaderRow = () => (
        <tr style={{ height: `${THEAD_H}px` }}>
            {showCol.sl && <th style={styles.th}>{LABELS.sl}</th>}
            {showCol.admission && <th style={styles.th}>{LABELS.admission}</th>}
            {showCol.id && <th style={styles.th}>{LABELS.studentId}</th>}
            {showCol.name && (
                <th style={{ ...styles.th, textAlign: "start", paddingInlineStart: "8px" }}>{nameHeaderLabel}</th>
            )}
            {subjectPassNumbers.map((subject, i) => (
                <th key={i} style={{ ...styles.th, padding: "4px 1px" }}>
                    <span style={{
                        display: "inline-block", writingMode: "vertical-rl", transform: "rotate(180deg)",
                        height: `${THEAD_H - 12}px`, fontSize: "12px", fontWeight: 700,
                        lineHeight: 1.2, textAlign: "center", overflow: "hidden",
                    }}>{getSubjectLabel(subject, lang, t.subjectFallback)}</span>
                </th>
            ))}
            {showCol.total && <th style={thStrong}>{LABELS.total}</th>}
            {showCol.gpa && <th style={thStrong}>{LABELS.gpa}</th>}
            {showCol.grade && <th style={thStrong}>{LABELS.grade}</th>}
            {showCol.pos && <th style={thStrong}>{LABELS.position}</th>}
        </tr>
    );

    const renderNameCell = (studentResult, rowBg) => {
        const studentName = getStudentName(studentResult?.User, lang);
        if (!hasExtras) {
            return (
                <td style={{
                    ...styles.td, ...bg(rowBg), textAlign: "start",
                    paddingInlineStart: "8px", fontWeight: 600, textOverflow: "ellipsis",
                }}>{studentName}</td>
            );
        }
        const extras = activeExtras.map((o) => getExtraValue(studentResult, o)).filter((v) => v !== "");
        return (
            <td style={{ ...styles.td, ...bg(rowBg), textAlign: "start", padding: "0 6px", whiteSpace: "normal" }}>
                <div style={{
                    display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2,
                    overflow: "hidden", fontSize: "11px", lineHeight: "14px",
                    maxHeight: "28px", wordBreak: "break-word",
                }}>
                    <span style={{ fontWeight: 700 }}>{studentName}</span>
                    {extras.map((v, i) => (<span key={i}>{" - "}{v}</span>))}
                </div>
            </td>
        );
    };

    const getSerial = (globalIndex) => globalIndex + 1;

    const renderAdmission = (serial) =>
        lang === "bn" ? convertOnLanguageChange(serial) : num(serial);

    const failMark = FAIL_MARK[colorMode] || FAIL_MARK.color;

    const renderRow = (studentResult, globalIndex) => {
        const zebra = globalIndex % 2 === 1;
        const rowBg = zebra ? C.primaryFaint : "#fff";
        // KeratAction true বিষয় বাদ দিয়ে মোট ও গড়
        const total = calcTotal(studentResult, subjectPassNumbers);
        const avg = total / Number(conditionAverage?.AverageSubsonkha || 1);
        const gc = getGradeColor(studentResult, avg);
        const gradeBg = gc.bg;
        const gradeFg = gc.fg;
        const position = Number(studentResult.Positions);
        const medal = theme.medals[position];

        return (
            <tr key={studentResult.ID ?? globalIndex} style={{ background: rowBg, height: `${ROW_H}px` }}>
                {showCol.sl && <td style={{ ...styles.td, ...bg(rowBg) }}>{num(getSerial(globalIndex))}</td>}
                {showCol.admission && (
                    <td style={{ ...styles.td, ...bg(rowBg) }}>
                        {renderAdmission(studentResult?.User?.Admission?.[0]?.AdmissionSerial)}
                    </td>
                )}
                {showCol.id && <td style={{ ...styles.td, ...bg(rowBg) }}>{num(studentResult?.User?.UserCode)}</td>}
                {showCol.name && renderNameCell(studentResult, rowBg)}

                {Array.from({ length: conditionAverage?.SubSonkha || 0 }).map((_, mi) => {
                    const val = studentResult[`SubVal${mi + 1}`];
                    const failed = isBelowPass(val, passMarks[mi] ?? null);
                    // পাস নাম্বার জানা না থাকলে আগের মতো শূন্য হলে লাল
                    const isZero = passMarks[mi] == null && isFilled(val) && Number(val) === 0;
                    const warn = failed || isZero;
                    return (
                        <td key={mi} style={{
                            ...styles.td,
                            ...bg(failed ? failMark.bg : rowBg),
                            color: failed ? failMark.fg : (isZero ? C.danger : C.text),
                            fontWeight: warn ? 700 : 400,
                            textDecoration: failed ? failMark.textDecoration : "none",
                        }}>{num(val)}</td>
                    );
                })}

                {showCol.total && (
                    <td style={{ ...styles.td, ...bg(C.primaryFaint), fontWeight: 700 }}>{num(total)}</td>
                )}
                {showCol.gpa && (
                    <td style={{ ...styles.td, ...bg(C.primaryFaint), fontWeight: 700 }}>{num(avg.toFixed(2))}</td>
                )}
                {showCol.grade && (
                    <td style={{ ...styles.td, ...bg(gradeBg), fontWeight: 700, fontSize: "12px", color: gradeFg }}>
                        {getDivisionName(studentResult.Division, lang)}
                    </td>
                )}
                {showCol.pos && (
                    <td style={{ ...styles.td, ...bg(rowBg) }}>
                        {medal ? (
                            <span style={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                boxSizing: "border-box", width: "20px", height: "20px",
                                borderRadius: "50%", border: medal.border,
                                ...bg(medal.bg), color: medal.fg,
                                fontWeight: 800, fontSize: "11px", lineHeight: 1,
                                verticalAlign: "middle",
                            }}>{num(studentResult.Positions)}</span>
                        ) : num(studentResult.Positions)}
                    </td>
                )}
            </tr>
        );
    };

    const shortTd = { ...styles.td, height: `${SHORT_ROW_H}px`, lineHeight: `${SHORT_ROW_H - 2}px`, fontSize: "12px" };
    const shortTh = { ...styles.th, height: `${SHORT_THEAD_H}px`, fontSize: "12px" };

    const renderShortRow = (studentResult, globalIndex) => {
        const zebra = globalIndex % 2 === 1;
        const rowBg = zebra ? C.primaryFaint : "#fff";
        // KeratAction true বিষয় বাদ দিয়ে গড়
        const total = calcTotal(studentResult, subjectPassNumbers);
        const avg = total / Number(conditionAverage?.AverageSubsonkha || 1);
        const gc = getGradeColor(studentResult, avg);
        const divBg = gc.bg;
        const divFg = gc.fg;
        const fatherOpt = NAME_EXTRA_OPTIONS.find((o) => o.key === "father");
        const fatherName = fatherOpt ? getExtraValue(studentResult, fatherOpt) : "";

        return (
            <tr key={studentResult.ID ?? globalIndex} style={{ background: rowBg, height: `${SHORT_ROW_H}px` }}>
                <td style={{ ...shortTd, ...bg(rowBg) }}>{num(studentResult?.User?.UserCode ?? "")}</td>
                <td style={{
                    ...shortTd, ...bg(rowBg), textAlign: "start",
                    paddingInlineStart: "6px", fontWeight: 600, textOverflow: "ellipsis",
                }}>{getStudentName(studentResult?.User, lang)}</td>
                <td style={{
                    ...shortTd, ...bg(rowBg), textAlign: "start",
                    paddingInlineStart: "6px", textOverflow: "ellipsis",
                }}>{fatherName}</td>
                <td style={{ ...shortTd, ...bg(C.primaryFaint), fontWeight: 700 }}>{num(avg.toFixed(2))}</td>
                <td style={{ ...shortTd, ...bg(divBg), color: divFg, fontWeight: 700, textOverflow: "ellipsis" }}>
                    {getDivisionName(studentResult.Division, lang)}
                </td>
            </tr>
        );
    };

    const renderShortTable = (rows, startIndex) => (
        <div style={{ width: `${SHORT_TABLE_W}px`, flexShrink: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                    <col style={{ width: `${SHORT_COL.id}px` }} />
                    <col style={{ width: `${SHORT_NAME_W}px` }} />
                    <col style={{ width: `${SHORT_NAME_W}px` }} />
                    <col style={{ width: `${SHORT_COL.avg}px` }} />
                    <col style={{ width: `${SHORT_COL.division}px` }} />
                </colgroup>
                <thead>
                    <tr style={{ height: `${SHORT_THEAD_H}px` }}>
                        <th style={shortTh}>{LABELS.studentId}</th>
                        <th style={{ ...shortTh, textAlign: "start", paddingInlineStart: "6px" }}>{LABELS.name}</th>
                        <th style={{ ...shortTh, textAlign: "start", paddingInlineStart: "6px" }}>{LABELS.father}</th>
                        <th style={thStrong}>{LABELS.gpa}</th>
                        <th style={thStrong}>{LABELS.grade}</th>
                    </tr>
                </thead>
                <tbody>{rows.map((s, i) => renderShortRow(s, startIndex + i))}</tbody>
            </table>
        </div>
    );

    const dateText = getToday();

    const renderPage = (pageIndex, students) => {
        const offset = pages.slice(0, pageIndex).reduce((sum, chunk) => sum + chunk.length, 0);

        const signature = (
            <SignatureSection
                C={C}
                dateText={dateText}
                dateLabel={t.date}
                PrincipalName={institutionInfo?.PrincipalName}
                principal={principal}
                najem={najem}
                NajemName={institutionInfo?.NajemName}
            />
        );

        const pageFooter = (
            <div style={{
                position: "absolute", left: 0, right: 0, bottom: "2px",
                textAlign: "center", fontSize: "10px", color: C.muted,
            }}>
                {t.page(num(pageIndex + 1), num(pages.length))}
            </div>
        );

        if (isShort) {
            const leftRows = students.slice(0, shortRowsPerCol);
            const rightRows = students.slice(shortRowsPerCol);
            return (
                <>
                    {renderShortHeaderBlock()}
                    <div style={{
                        display: "flex", flexDirection: "row",
                        alignItems: "flex-start", justifyContent: "space-between",
                        gap: `${SHORT_COL_GAP}px`,
                    }}>
                        {renderShortTable(leftRows, offset)}
                        {renderShortTable(rightRows, offset + leftRows.length)}
                    </div>
                    {signature}
                    {pageFooter}
                </>
            );
        }

        return (
            <>
                {renderHeaderBlock()}
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    {renderColGroup()}
                    <thead>{renderColumnHeaderRow()}</thead>
                    <tbody>{students.map((s, i) => renderRow(s, offset + i))}</tbody>
                </table>
                {signature}
                {pageFooter}
            </>
        );
    };

    const pageBox = {
        position: "relative", width: `${PAGE_W}px`, height: `${PAGE_H}px`,
        boxSizing: "border-box", overflow: "hidden", background: "#fff", margin: "0 auto",
        fontFamily: SHEET_FONT,
    };

    /* ── সাইডবারের কলাম লিস্ট: সবসময় বাংলা (backend labels থাকলে সেগুলো) ── */
    const dynamicColumns = useMemo(
        () => [
            { key: "sl", label: labels?.SerialLabel ?? tUI.sl },
            { key: "admission", label: labels?.AdmissionIDLabel ?? tUI.admission },
            { key: "id", label: labels?.StudentIDLabel ?? tUI.studentId },
            { key: "name", label: labels?.StudentNameLabel ?? tUI.name },
            { key: "total", label: labels?.TotalLabel ?? tUI.total },
            {
                key: "gpa",
                label: gpaText.trim() || (gpaLabelMode === "gpa"
                    ? (labels?.GPALabel ?? tUI.gpa)
                    : (labels?.AverageLabel ?? tUI.average)),
            },
            { key: "grade", label: gradeText.trim() || (labels?.GradeLabel ?? tUI.grade) },
            { key: "pos", label: labels?.PositionLabel ?? tUI.position },
        ],
        [labels, tUI, gpaLabelMode, gpaText, gradeText]
    );

    const toggleColumn = (key) => setVisibleColumns((p) => ({ ...p, [key]: !p[key] }));
    const selectResultOption = (key) =>
        setResultOptions(
            Object.fromEntries(ORDERED_RESULT_KEYS.map((k) => [k, k === key]))
        );
    const setAllColumns = (value) =>
        setVisibleColumns(Object.fromEntries(dynamicColumns.map((c) => [c.key, value])));

    /* ── সাইডবার প্যানেল: tUI + numUI (সবসময় বাংলা) ── */
    const renderSettingsPanels = () => (
        <>
            <LanguageSelector t={tUI} value={lang} onChange={setLang} />
            <ColumnSelector
                t={tUI}
                num={numUI}
                value={visibleColumns}
                onToggle={toggleColumn}
                onSetAll={setAllColumns}
                columns={dynamicColumns}
            />
            <HeadingSettings
                t={tUI}
                mode={gpaLabelMode}
                onModeChange={setGpaLabelMode}
                gpaText={gpaText}
                onGpaText={setGpaText}
                gradeText={gradeText}
                onGradeText={setGradeText}
            />
            <ResultOptionsSelector t={tUI} value={resultOptions} onSelect={selectResultOption} />
            <PrintSettings t={tUI} colorMode={colorMode} onColorChange={setColorMode} />
        </>
    );

    return (
        <div className="flex items-start w-full">
            <aside
                className="hidden lg:flex flex-col w-[300px] shrink-0 bg-white border-r border-slate-200 sticky top-0 print:hidden"
                style={{
                    height: "calc(100vh - 100px)",
                    overflow: "hidden",
                }}
            >
                <div className="p-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800">{tUI.settings}</h2>
                    </div>
                    <p className="text-xs text-slate-400">{tUI.settingsSub}</p>
                </div>

                {/* কনটেন্ট বেশি হলে শুধু এই ডিভের ভেতরেই স্ক্রল হবে */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {renderSettingsPanels()}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <p className="text-[10px] text-slate-400 text-center">{tUI.footer}</p>
                </div>
            </aside>

            <div className="flex-1 min-w-0 w-full">
                <div className="lg:hidden p-4 pb-0 print:hidden">
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                        {renderSettingsPanels()}
                    </div>
                </div>

                {/* প্রিভিউ: fixed height + scroll (প্রিন্টে এটা আর ব্যবহার হয় না) */}
                <div
                    className="result-sheet-wrapper w-full overflow-x-hidden"
                    style={{ height: "700px", overflowY: "auto" }}
                >
                    <div className="no-print p-4">
                        <ScaledPreview designWidth={PAGE_W}>
                            {pages.map((students, pageIndex) => (
                                <div key={pageIndex} dir={dir} style={{
                                    ...pageBox,
                                    boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                                    marginBottom: "24px",
                                }}>
                                    {renderPage(pageIndex, students)}
                                </div>
                            ))}
                        </ScaledPreview>
                    </div>
                </div>
            </div>

            {/* প্রিন্ট: document.body এ portal — scroll/overflow container এর বাইরে */}
            {createPortal(
                <div className="print-portal">
                    {pages.map((students, pageIndex) => (
                        <div key={pageIndex} dir={dir} style={{
                            ...pageBox,
                            margin: 0,
                            pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
                            breakAfter: pageIndex < pages.length - 1 ? "page" : "auto",
                        }}>
                            {renderPage(pageIndex, students)}
                        </div>
                    ))}
                </div>,
                document.body
            )}

            <style>{`
        .print-portal { display: none; }
        .print-portal, .print-portal * { font-family: ${SHEET_FONT}; }
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            height: auto !important; overflow: visible !important;
            background: #fff !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; }
          tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR SUB-COMPONENTS  (সবসময় বাংলা টেক্সট পায়)
   ═══════════════════════════════════════════════════════════ */

const SegmentedControl = ({ label, options, value, onChange }) => (
    <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">{label}</p>
        <div className="grid grid-flow-col auto-cols-fr gap-1 p-1 rounded-lg bg-slate-100">
            {options.map((opt) => {
                const active = value === opt.key;
                return (
                    <button key={opt.key} type="button" onClick={() => onChange(opt.key)}
                        className={`px-2 py-1.5 rounded-md text-xs font-semibold transition-all ${active
                            ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                            : "text-slate-500 hover:text-slate-700"
                            }`}>{opt.label}</button>
                );
            })}
        </div>
    </div>
);

const LanguageSelector = ({ t, value, onChange }) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
        <SegmentedControl label={t.printLanguage} options={LANGUAGE_OPTIONS} value={value} onChange={onChange} />
        <p className="text-[10px] text-slate-400 leading-snug">{t.printLanguageNote}</p>
    </div>
);

// কলামের হেডিং সেটিং: গড়/জিপিএ বাছাই + নিজে লেখা টেক্সট (গড়/জিপিএ ও গ্রেড)
const HeadingSettings = ({ t, mode, onModeChange, gpaText, onGpaText, gradeText, onGradeText }) => {
    const options = [
        { key: "avg", label: t.avgOpt },
        { key: "gpa", label: t.gpaOpt },
    ];
    const inputCls =
        "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 " +
        "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300";
    const hasCustom = gpaText.trim() !== "" || gradeText.trim() !== "";
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 leading-tight">{t.headingTitle}</p>
                {hasCustom && (
                    <button
                        type="button"
                        onClick={() => { onGpaText(""); onGradeText(""); }}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200"
                    >
                        {t.resetHeading}
                    </button>
                )}
            </div>

            <SegmentedControl label={t.gpaLabelTitle} options={options} value={mode} onChange={onModeChange} />

            <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">{t.gpaTextLabel}</p>
                <input
                    type="text"
                    value={gpaText}
                    onChange={(e) => onGpaText(e.target.value)}
                    placeholder={t.gpaTextPlaceholder}
                    maxLength={30}
                    className={inputCls}
                />
            </div>

            <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">{t.gradeTextLabel}</p>
                <input
                    type="text"
                    value={gradeText}
                    onChange={(e) => onGradeText(e.target.value)}
                    placeholder={t.gradeTextPlaceholder}
                    maxLength={30}
                    className={inputCls}
                />
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{t.headingNote}</p>
        </div>
    );
};

const PrintSettings = ({ t, colorMode, onColorChange }) => {
    const colorOptions = [
        { key: "color", label: t.colorOpt },
        { key: "bw", label: t.bwOpt },
    ];
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 leading-tight">{t.printSetting}</p>
                <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                    {t.pageSize}
                </span>
            </div>
            <SegmentedControl label={t.color} options={colorOptions} value={colorMode} onChange={onColorChange} />
            <p className="text-[10px] text-slate-400 leading-snug">{t.bwNote}</p>
        </div>
    );
};

/*
  desktop sidebar আর mobile panel — দুই জায়গাতেই radio এর name আলাদা রাখতে useId() ব্যবহার।
*/
const ResultOptionsSelector = ({ t, value, onSelect }) => {
    const groupName = useId();
    const list = [
        { key: "idSerial", label: t.idSerial },
        { key: "byDivision", label: t.byDivision },
        { key: "byNumber", label: t.byNumber },
        { key: "short", label: t.short },
    ];
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-bold text-slate-700 leading-tight">{t.result}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 mb-2">{t.resultSub}</p>
            <div role="radiogroup" className="grid grid-cols-1 gap-1.5">
                {list.map((opt) => {
                    const checked = !!value[opt.key];
                    return (
                        <label key={opt.key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}>
                            <input
                                type="radio"
                                name={`resultOption-${groupName}`}
                                value={opt.key}
                                checked={checked}
                                onChange={() => onSelect(opt.key)}
                                className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
                            />
                            <span>{opt.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

const ColumnSelector = ({ t, num, value, onToggle, onSetAll, columns = RESULT_COLUMNS }) => {
    const checkedCount = columns.filter((c) => value[c.key]).length;
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs font-bold text-slate-700 leading-tight">{t.columnSelect}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {t.selectedCount(num(checkedCount), num(columns.length))}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onSetAll(true)}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                        {t.all}
                    </button>
                    <button type="button" onClick={() => onSetAll(false)}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200">
                        {t.none}
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {columns.map((col) => {
                    const checked = !!value[col.key];
                    return (
                        <label key={col.key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}>
                            <input type="checkbox" checked={checked} onChange={() => onToggle(col.key)}
                                className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer" />
                            <span className="truncate">{col.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};