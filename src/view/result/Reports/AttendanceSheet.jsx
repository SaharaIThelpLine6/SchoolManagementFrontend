import { useMemo, useState, useEffect, useLayoutEffect, useRef, useId, useCallback } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { createPortal } from "react-dom";
import { Buffer } from "buffer";
import { useGetExamRoutineSubjectListQuery, useGetTeacherSubjectInfoQuery } from "../../../features/result/resultSilce";

/* ═══════════════════════════════════════════════════════════
   LANGUAGE (bn / en / ar)
   ═══════════════════════════════════════════════════════════ */
export const LANGUAGE_OPTIONS = [
    { key: "bn", label: "বাংলা" },
    { key: "en", label: "English" },
    { key: "ar", label: "العربية" },
];
export const DEFAULT_LANGUAGE = "bn";

const SHEET_FONT = "'SolaimanLipi', 'Noto Sans Bengali', 'Kalpurush', sans-serif";

const TRANSLATIONS = {
    bn: {
        settings: "সেটিং",
        settingsSub: "হাজিরা খাতার কলাম ও প্রিন্ট অপশন",
        footer: "© Result Report Generator",
        preview: "হাজিরা খাতা প্রিভিউ",
        people: "জন",
        daysUnit: "দিন",
        pageUnit: "পৃষ্ঠা",
        printLanguage: "প্রিন্টের ভাষা",
        printLanguageNote: "শুধু প্রিভিউ ও প্রিন্টের ভাষা বদলাবে।",
        columnSelect: "কলাম নির্বাচন",
        selectedCount: (c, n) => `${c}/${n} টি নির্বাচিত`,
        all: "সব",
        none: "কিছুই না",
        printSetting: "প্রিন্ট সেটিং",
        pageDirection: "পেজ দিক",
        paperSize: "কাগজের সাইজ",
        monthDays: "মাসের দিন সংখ্যা",
        colorLabel: "রঙ",
        colorOpt: "রঙিন",
        bwOpt: "সাদা কালো",
        printNote: "Portrait-এ ৩১ দিনের কলাম সরু হবে, বেশি দিন হলে Landscape ব্যবহার করুন। প্রিন্ট ডায়ালগে Paper size একই (A4/Legal) এবং Margins \"Default\" রাখুন।",
        scaleLabel: "স্কেল (%)",
        scalePlaceholder: "৯৫",
        scaleNote: "৫০ থেকে ১০০ এর মধ্যে দিন। শিট পেজের ঠিক মাঝখানে বসবে এবং Landscape/Portrait দুটোতেই পেজ ভাঙবে না। প্রিন্ট ডায়ালগে Scale \"Default/100\" রাখুন।",
        rowsTitle: "খালি রো সেটিং",
        rowsLabel: "খালি রো সংখ্যা",
        rowsPlaceholder: "ফাঁকা = পুরো পেজ অটো",
        rowsReset: "অটো",
        rowsNote: "ফাঁকা রাখলে পেজ খালি রো দিয়ে ভরবে। সংখ্যা (যেমন ১ বা ৫) দিলে শিক্ষার্থীদের পরে ঠিক ততটি খালি রো প্রিভিউ ও প্রিন্টে আসবে। ০ দিলে কোনো খালি রো থাকবে না।",
        fontTitle: "ফন্ট সাইজ",
        fontSmaller: "ছোট",
        fontBigger: "বড়",
        fontResetTip: "১০০% এ ফিরুন",
        fontNote: "শিটের সব লেখা একসাথে ছোট-বড় হবে।",
        infoTitle: "শিটের তথ্য",
        subjectLabel: "কিতাবের নাম",
        subjectSelected: (c, n) => `${c}/${n} টি কিতাব নির্বাচিত`,
        subjectEmpty: "কোনো কিতাব পাওয়া যায়নি",
        teacherLoading: "শিক্ষক লোড হচ্ছে...",
        teacherAuto: "শিক্ষক",
        monthLabel: "মাস",
        yearLabel: "সন / বছর",
        monthPlaceholder: "— মাস —",
        yearPlaceholder: "— বছর —",
        hourLabel: "ঘন্টা",
        hourPlaceholder: "যেমন: ১ম ঘন্টা",
        infoNote: "যতগুলো কিতাব চেক করবেন, প্রতিটি কিতাবের জন্য সব শিক্ষার্থীর আলাদা হাজিরা খাতা (কিতাব ও শিক্ষকের নামসহ) প্রিভিউ ও প্রিন্টে আসবে। আনচেক করলে ওই কিতাবের পেজ বাদ যাবে। মাস প্রিন্টের ভাষায় দেখাবে।",
        orderTitle: "শিক্ষার্থীর ক্রম",
        orderSub: "শিক্ষার্থীদের সাজানোর ধরন নির্বাচন করুন",
        idSerial: "আইডি সিরিয়ালে",
        byDivision: "বিভাগ অনুসারে",
        byNumber: "নাম্বার অনুসারে",
        divisionTitle: "বিভাগ ফিল্টার",
        divisionSub: "আনচেক করা বিভাগের শিক্ষার্থী বাদ যাবে",
        divisionSelected: (c, n) => `${c}/${n} টি বিভাগ নির্বাচিত`,
        divisionEmpty: "কোনো বিভাগ পাওয়া যায়নি",
        divisionNote: "ডিফল্টে সব বিভাগ চেক করা থাকে। যে বিভাগ আনচেক করবেন তার শিক্ষার্থী প্রিভিউ ও প্রিন্টে আসবে না।",
        title: "দৈনন্দিন শিক্ষার্থীর হাজিরা খাতা",
        classLabel: "শ্রেণী",
        bookName: "কিতাবের নাম :",
        month: "মাস :",
        hijriYear: "হিজরী/সন :",
        teacherName: "শিক্ষক/শিক্ষিকার নাম :",
        hour: "ঘন্টা :",
        sl: "ক্রমিক",
        id: "আইডি নং",
        name: "শিক্ষার্থীর নাম",
        present: "উপ :",
        absent: "অনু :",
        noStudent: "কোনো শিক্ষার্থী পাওয়া যায়নি",
    },
    en: {
        title: "Daily Student Attendance Register",
        classLabel: "Class",
        bookName: "Book Name :",
        month: "Month :",
        hijriYear: "Hijri/Year :",
        teacherName: "Teacher's Name :",
        hour: "Period :",
        sl: "SL",
        id: "ID No.",
        name: "Student Name",
        present: "Pres.",
        absent: "Abs.",
        noStudent: "No students found",
    },
    ar: {
        title: "سجل الحضور اليومي للطلاب",
        classLabel: "الصف",
        bookName: "اسم الكتاب :",
        month: "الشهر :",
        hijriYear: "الهجري/السنة :",
        teacherName: "اسم المعلم/المعلمة :",
        hour: "الحصة :",
        sl: "م",
        id: "رقم الهوية",
        name: "اسم الطالب",
        present: "حضور",
        absent: "غياب",
        noStudent: "لا يوجد طلاب",
    },
};

const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

const makeNum = (lang) => (v) => {
    if (v === undefined || v === null) return "";
    const s = String(v);
    if (lang === "bn") return bnBijoy2Unicode(s);
    if (lang === "ar") return s.replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
    return s;
};

/* ═══════════════════════════════════════════════════════════
   MONTH NAMES (৩ ভাষায়)
   ═══════════════════════════════════════════════════════════ */
const MONTH_NAMES = {
    bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
};

const YEAR_FROM = 1990;
const YEAR_TO = 2050;
const YEAR_LIST = Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => String(YEAR_FROM + i));

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const pickText = (...values) => {
    const found = values.find((v) => typeof v === "string" && v.trim() !== "");
    return found ? found.trim() : "";
};

const pickByLang = (lang, bnVal, enVal, arVal) => {
    if (lang === "ar") return pickText(arVal, bnVal, enVal);
    if (lang === "en") return pickText(enVal, bnVal, arVal);
    return pickText(bnVal, enVal, arVal);
};

const getFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

const isFilled = (v) => v !== undefined && v !== null && v !== "";

const getInstitutionName = (info, lang) =>
    info ? pickByLang(lang, info.InstitutionName, info.EngInstitutionName, info.AraInstitutionName) : "";

const getInstitutionAddress = (info, lang) =>
    info ? pickByLang(lang, info.Address, info.EngAddress, info.AraAddress) : "";

const getStudentName = (user, lang) => {
    if (!user) return "";
    return pickByLang(
        lang,
        user.UserName,
        user.studentEnglishName?.EnglishName,
        user.studentArabicName?.ArabicName
    );
};

const getSessionName = (session, lang) =>
    session ? pickByLang(lang, session.SessionName, session.SessionEngName, session.SessionAraName) : "";

const getClassName = (subClass, lang) =>
    subClass ? pickByLang(lang, subClass.SubClass, subClass.SubClassEng, subClass.SubClassAra) : "";

const getDivisionNameBn = (division) =>
    division ? pickByLang("bn", division.DivisionNames, division.DivisionEnglishs, division.DivisionArabics) : "";

const getStudentDivisionId = (s) => {
    const id = Number(getFirstValue(s?.DivisionID, s?.Division?.ID));
    return Number.isNaN(id) ? null : id;
};

const isKerat = (subject) => {
    const v = subject?.KeratAction;
    return v === true || v === 1 || v === "1" || v === "true";
};

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

const EXAMPLE_LOGO = "https://images.seeklogo.com/logo-png/42/1/madrasha-logo-png_seeklogo-424804.png";

/* ═══════════════════════════════════════════════════════════
   OPTIONS
   ═══════════════════════════════════════════════════════════ */
export const ATTENDANCE_COLUMNS = [
    { key: "sl", label: "ক্রমিক" },
    { key: "id", label: "আইডি নং" },
    { key: "name", label: "শিক্ষার্থীর নাম" },
    { key: "days", label: "তারিখ (দিন)" },
    { key: "present", label: "উপস্থিত" },
    { key: "absent", label: "অনুপস্থিত" },
];

export const DEFAULT_VISIBLE_COLUMNS = Object.fromEntries(ATTENDANCE_COLUMNS.map((c) => [c.key, true]));

export const COLOR_OPTIONS = [
    { key: "color", label: "রঙিন" },
    { key: "bw", label: "সাদা কালো" },
];
export const DEFAULT_COLOR_MODE = "color";

export const ORIENTATION_OPTIONS = [
    { key: "landscape", label: "Landscape" },
    { key: "portrait", label: "Portrait" },
];
export const DEFAULT_ORIENTATION = "landscape";

export const PAPER_OPTIONS = [
    { key: "A4", label: "A4" },
    { key: "Legal", label: "Legal" },
];
export const DEFAULT_PAPER = "A4";
const PAPER_MM = {
    A4: { w: 210, h: 297, css: "A4" },
    Legal: { w: 215.9, h: 355.6, css: "legal" },
};

export const DAYS_OPTIONS = [
    { key: "28", label: "২৮" },
    { key: "29", label: "২৯" },
    { key: "30", label: "৩০" },
    { key: "31", label: "৩১" },
];
export const DEFAULT_DAYS = "31";

/* ✅ শিক্ষার্থীর ক্রম (StudentResultSheet এর মতো) */
export const ORDER_OPTIONS = [
    { key: "idSerial", label: "আইডি সিরিয়ালে" },
    { key: "byDivision", label: "বিভাগ অনুসারে" },
    { key: "byNumber", label: "নাম্বার অনুসারে" },
];
// আগের আচরণ (নাম্বার অনুযায়ী সাজানো) ডিফল্ট রাখা হলো
export const DEFAULT_ORDER = "byNumber";

const MAX_CUSTOM_ROWS = 500;
const DEFAULT_SCALE = 95;
const MIN_SCALE = 50;
const MAX_SCALE = 100;
const DEFAULT_FONT = 100;
const MIN_FONT = 50;
const MAX_FONT = 150;
const FONT_STEP = 5;

/* ═══════════════════════════════════════════════════════════
   PAGE LAYOUT CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const PX_PER_MM = 96 / 25.4;
const PAGE_MARGIN_MM = 5;
const SAFETY_MM = 4;
const THEAD_PX = 48;
const ROW_MIN_PX = 30;
const TITLE_FALLBACK_PX = 225;

/* ═══════════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════════ */
const THEMES = {
    color: {
        primary: "#0f766e",
        primaryDark: "#134e4a",
        headBg: "#ccfbf1",
        headStrongBg: "#99f6e4",
        zebra: "#f0fdfa",
        border: "#334155",
        text: "#0f172a",
        muted: "#64748b",
        infoBorder: "#334155",
        dotted: "#334155",
    },
    bw: {
        primary: "#000",
        primaryDark: "#000",
        headBg: "#ffffff",
        headStrongBg: "#f3f4f6",
        zebra: "#ffffff",
        border: "#000",
        text: "#000",
        muted: "#404040",
        infoBorder: "#000",
        dotted: "#000",
    },
};

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════ */
const LS_VISIBLE = "attendanceSheetVisibleColumns";
const LS_COLOR = "attendanceSheetColorMode";
const LS_ORIENTATION = "attendanceSheetOrientation";
const LS_DAYS = "attendanceSheetDays";
const LS_PAPER = "attendanceSheetPaper";
const LS_LANG = "attendanceSheetLanguage";
const LS_ROWS = "attendanceSheetCustomRows";
const LS_SCALE = "attendanceSheetScale";
const LS_FONT = "attendanceSheetFontPct";
const LS_MONTH = "attendanceSheetMonth";
const LS_YEAR = "attendanceSheetYear";
const LS_HOUR = "attendanceSheetHour";
const LS_ORDER = "attendanceSheetOrder";
const LS_DIV_EXCLUDED = "attendanceSheetExcludedDivisions";

const loadObj = (key, fallback) => {
    try {
        const saved = JSON.parse(localStorage.getItem(key));
        if (saved && typeof saved === "object") return { ...fallback, ...saved };
    } catch (e) { }
    return { ...fallback };
};

const loadStr = (key, options, fallback) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved && options.some((o) => o.key === saved)) return saved;
    } catch (e) { }
    return fallback;
};

const loadText = (key) => {
    try { return localStorage.getItem(key) || ""; } catch (e) { }
    return "";
};

const loadNum = (key, fallback, min, max) => {
    try {
        const n = Number(localStorage.getItem(key));
        if (Number.isFinite(n) && n >= min && n <= max && localStorage.getItem(key) !== null) return n;
    } catch (e) { }
    return fallback;
};

const loadMonth = () => {
    const s = loadText(LS_MONTH);
    return /^(?:[0-9]|1[01])$/.test(s) ? s : "";
};

const loadYear = () => {
    const s = loadText(LS_YEAR);
    return YEAR_LIST.includes(s) ? s : "";
};

// ✅ শুধু আনচেক করা (বাদ দেওয়া) বিভাগের ID সেভ হয় — তাই ডিফল্টে সব চেক থাকে
const loadExcludedDivisions = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_DIV_EXCLUDED));
        if (Array.isArray(saved)) return saved.map(Number).filter((n) => Number.isFinite(n));
    } catch (e) { }
    return [];
};

const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};

/* ═══════════════════════════════════════════════════════════
   TEACHER LOADER (প্রতিটি checked কিতাবের শিক্ষক আলাদা লোড)
   ═══════════════════════════════════════════════════════════ */
function TeacherLoader({ subjectId, sessionId, examId, subClassId, onChange }) {
    const { currentData, isFetching } = useGetTeacherSubjectInfoQuery(
        { session_id: sessionId, exam_id: examId, subclass_id: subClassId, subject_id: Number(subjectId) },
        { skip: !sessionId || !examId || !subClassId || !subjectId }
    );

    useEffect(() => {
        const rows = Array.isArray(currentData?.data) ? currentData.data : [];
        const teacher = rows
            .map((r) => (r?.TeacherName || "").trim())
            .filter(Boolean)
            .filter((n, i, a) => a.indexOf(n) === i)
            .join("، ");
        const book = (rows[0]?.SubjectName || "").trim();
        onChange(subjectId, { teacher, book, loading: !!isFetching });
    }, [currentData, isFetching, subjectId, onChange]);

    return null;
}

/* ═══════════════════════════════════════════════════════════
   FILL-IN FIELD
   ═══════════════════════════════════════════════════════════ */
function FillField({ label, value, flex = 1, color, dottedColor, fs }) {
    return (
        <div style={{ flex, display: "flex", alignItems: "flex-end", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: fs(15), fontWeight: 600, whiteSpace: "nowrap", color }}>{label}</span>
            <span style={{
                flex: 1, minWidth: "20px", minHeight: fs(16),
                padding: "0 4px",
                borderBottom: `1.5px dotted ${dottedColor || color}`,
                fontSize: fs(15), fontWeight: 700, lineHeight: 1.25,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                color,
            }}>
                {value || ""}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   🧾 MAIN
   ═══════════════════════════════════════════════════════════ */
export default function AttendanceSheet({ reportData, query }) {

    // console.log(reportData, "reportData")

    const [visibleColumns, setVisibleColumns] = useState(() => loadObj(LS_VISIBLE, DEFAULT_VISIBLE_COLUMNS));
    const [colorMode, setColorMode] = useState(() => loadStr(LS_COLOR, COLOR_OPTIONS, DEFAULT_COLOR_MODE));
    const [orientation, setOrientation] = useState(() => loadStr(LS_ORIENTATION, ORIENTATION_OPTIONS, DEFAULT_ORIENTATION));
    const [daysCount, setDaysCount] = useState(() => loadStr(LS_DAYS, DAYS_OPTIONS, DEFAULT_DAYS));
    const [paper, setPaper] = useState(() => loadStr(LS_PAPER, PAPER_OPTIONS, DEFAULT_PAPER));
    const [lang, setLang] = useState(() => loadStr(LS_LANG, LANGUAGE_OPTIONS, DEFAULT_LANGUAGE));
    const [rowsInput, setRowsInput] = useState(() => loadText(LS_ROWS));
    const [scaleInput, setScaleInput] = useState(() => {
        const s = loadText(LS_SCALE);
        return s === "" ? String(DEFAULT_SCALE) : s;
    });
    const [fontPct, setFontPct] = useState(() => loadNum(LS_FONT, DEFAULT_FONT, MIN_FONT, MAX_FONT));
    const [month, setMonth] = useState(loadMonth);
    const [year, setYear] = useState(loadYear);
    const [hourInput, setHourInput] = useState(() => loadText(LS_HOUR));
    // ✅ null = ডিফল্ট (প্রথম কিতাব checked), array = ইউজারের নির্বাচন
    const [subjectSel, setSubjectSel] = useState(null);
    const [teacherMap, setTeacherMap] = useState({});
    const [orderMode, setOrderMode] = useState(() => loadStr(LS_ORDER, ORDER_OPTIONS, DEFAULT_ORDER));
    const [excludedDivs, setExcludedDivs] = useState(loadExcludedDivisions);

    const SessionID = reportData?.conditionAverage?.SessionID;
    const ExamID = reportData?.conditionAverage?.ExamID;
    const SubClassID = reportData?.conditionAverage?.SubClassID;

    const { data: examRoutineSubjectData } = useGetExamRoutineSubjectListQuery(
        { session_id: SessionID, exam_id: ExamID, subclass_id: SubClassID },
        { skip: !SessionID || !ExamID || !SubClassID }
    );

    const subjectList = useMemo(() => {
        const raw = Array.isArray(examRoutineSubjectData?.data) ? examRoutineSubjectData.data : [];
        const seen = new Set();
        const out = [];
        raw.forEach((s) => {
            if (!s || s.SubjectID === undefined || s.SubjectID === null) return;
            const id = String(s.SubjectID);
            if (seen.has(id)) return;
            seen.add(id);
            out.push({ value: id, label: s.SubjectName || id });
        });
        return out;
    }, [examRoutineSubjectData]);

    // ক্লাস/পরীক্ষা বদলালে (কিতাব তালিকা বদলালে) আবার ডিফল্টে ফিরবে
    const subjectKey = useMemo(() => subjectList.map((s) => s.value).join(","), [subjectList]);
    useEffect(() => { setSubjectSel(null); }, [subjectKey]);

    // ✅ কার্যকর নির্বাচিত কিতাব (ডিফল্ট: প্রথমটি)
    const selectedSubjectIds = useMemo(() => {
        if (subjectSel === null) return subjectList.length ? [subjectList[0].value] : [];
        return subjectList.filter((s) => subjectSel.includes(s.value)).map((s) => s.value);
    }, [subjectSel, subjectList]);

    const toggleSubject = useCallback((id) => {
        setSubjectSel((prev) => {
            const current = prev === null
                ? (subjectList.length ? [subjectList[0].value] : [])
                : prev;
            return current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
        });
    }, [subjectList]);

    const setAllSubjects = useCallback((checked) => {
        setSubjectSel(checked ? subjectList.map((s) => s.value) : []);
    }, [subjectList]);

    const handleTeacherChange = useCallback((id, val) => {
        setTeacherMap((prev) => {
            const p = prev[id];
            if (p && p.teacher === val.teacher && p.book === val.book && p.loading === val.loading) return prev;
            return { ...prev, [id]: val };
        });
    }, []);

    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const [institutionLogo, setInstitutionLogo] = useState(null);

    const conditionAverage = reportData?.conditionAverage || {};
    const subjectPassNumbers = reportData?.subjectPassNumbers || [];

    /* ═══ বিভাগ ফিল্টার ডেটা ═══ */
    const divisionOptions = useMemo(() => {
        const allStudents = Array.isArray(reportData?.studentResults) ? reportData.studentResults : [];
        const list = Array.isArray(reportData?.divitionList) ? reportData.divitionList : [];

        const nameMap = {};
        list.forEach((d) => { nameMap[Number(d.ID)] = getDivisionNameBn(d); });

        const counts = {};
        const extraNames = {};
        allStudents.forEach((s) => {
            const id = getStudentDivisionId(s);
            if (id === null) return;
            counts[id] = (counts[id] || 0) + 1;
            const nm = getDivisionNameBn(s?.Division);
            if (nm) extraNames[id] = nm;
        });

        // conditionAverage এর DivisionID1..7 অনুযায়ী ক্রম
        const scaleIds = [];
        for (let i = 1; i <= 7; i++) {
            const id = conditionAverage?.[`DivisionID${i}`];
            if (isFilled(id) && !scaleIds.includes(Number(id))) scaleIds.push(Number(id));
        }
        const ids = [...scaleIds];
        Object.keys(counts).forEach((k) => {
            const id = Number(k);
            if (!ids.includes(id)) ids.push(id);
        });

        return ids.map((id) => ({
            id,
            label: nameMap[id] || extraNames[id] || `বিভাগ ${id}`,
            count: counts[id] || 0,
        }));
    }, [reportData?.studentResults, reportData?.divitionList, conditionAverage]);

    const divisionOrderMap = useMemo(() => {
        const map = {};
        divisionOptions.forEach((d, i) => { map[d.id] = i; });
        return map;
    }, [divisionOptions]);

    const excludedSet = useMemo(() => new Set(excludedDivs), [excludedDivs]);

    const studentResultsDetails = useMemo(() => {
        const all = Array.isArray(reportData?.studentResults) ? reportData.studentResults : [];
        const serialOf = (s) => Number(s?.User?.Admission?.[0]?.AdmissionSerial) || 0;
        const totalOf = (s) => {
            const n = calcTotal(s, subjectPassNumbers);
            return Number.isNaN(n) ? -Infinity : n;
        };
        const rankOf = (s) => {
            const id = getStudentDivisionId(s);
            return id === null ? 999 : (divisionOrderMap[id] ?? 999);
        };

        // ✅ আনচেক করা বিভাগের শিক্ষার্থী বাদ
        const filtered = all.filter((s) => {
            const id = getStudentDivisionId(s);
            return id === null || !excludedSet.has(id);
        });

        const list = [...filtered];
        switch (orderMode) {
            case "byDivision":
                return list.sort(
                    (a, b) =>
                        rankOf(a) - rankOf(b) ||
                        (getStudentDivisionId(a) ?? 0) - (getStudentDivisionId(b) ?? 0) ||
                        totalOf(b) - totalOf(a) ||
                        serialOf(a) - serialOf(b)
                );
            case "byNumber":
                return list.sort((a, b) => totalOf(b) - totalOf(a) || serialOf(a) - serialOf(b));
            case "idSerial":
            default:
                return list.sort((a, b) => serialOf(a) - serialOf(b));
        }
    }, [reportData?.studentResults, subjectPassNumbers, orderMode, excludedSet, divisionOrderMap]);

    // ✅ প্রিন্টের জন্য আলাদা container (document.body এর সরাসরি child) — parent layout এর কোনো প্রভাব থাকবে না
    const [printRoot, setPrintRoot] = useState(null);
    useEffect(() => {
        const el = document.createElement("div");
        el.className = "print-portal";
        document.body.appendChild(el);
        setPrintRoot(el);
        return () => { document.body.removeChild(el); };
    }, []);

    const [titleH, setTitleH] = useState(TITLE_FALLBACK_PX);
    const titleRef = useRef(null);

    useEffect(() => { localStorage.setItem(LS_VISIBLE, JSON.stringify(visibleColumns)); }, [visibleColumns]);
    useEffect(() => { localStorage.setItem(LS_COLOR, colorMode); }, [colorMode]);
    useEffect(() => { localStorage.setItem(LS_ORIENTATION, orientation); }, [orientation]);
    useEffect(() => { localStorage.setItem(LS_DAYS, daysCount); }, [daysCount]);
    useEffect(() => { localStorage.setItem(LS_PAPER, paper); }, [paper]);
    useEffect(() => { localStorage.setItem(LS_LANG, lang); }, [lang]);
    useEffect(() => { localStorage.setItem(LS_ROWS, rowsInput); }, [rowsInput]);
    useEffect(() => { localStorage.setItem(LS_SCALE, scaleInput); }, [scaleInput]);
    useEffect(() => { localStorage.setItem(LS_FONT, String(fontPct)); }, [fontPct]);
    useEffect(() => { localStorage.setItem(LS_MONTH, month); }, [month]);
    useEffect(() => { localStorage.setItem(LS_YEAR, year); }, [year]);
    useEffect(() => { localStorage.setItem(LS_HOUR, hourInput); }, [hourInput]);
    useEffect(() => { localStorage.setItem(LS_ORDER, orderMode); }, [orderMode]);
    useEffect(() => { localStorage.setItem(LS_DIV_EXCLUDED, JSON.stringify(excludedDivs)); }, [excludedDivs]);

    useEffect(() => {
        const logoData = institutionInfo?.InstitutionLogo || institutionInfo?.Logo || institutionInfo?.InstitutionImage;
        if (logoData?.data) {
            const buf = Buffer.from(logoData.data);
            setInstitutionLogo(`data:image/png;base64,${buf.toString("base64")}`);
        } else if (typeof logoData === "string" && logoData.startsWith("data:image")) {
            setInstitutionLogo(logoData);
        } else if (typeof logoData === "string" && logoData.startsWith("http")) {
            setInstitutionLogo(logoData);
        } else {
            setInstitutionLogo(EXAMPLE_LOGO);
        }
    }, [institutionInfo]);

    const tUI = TRANSLATIONS.bn;
    const numUI = useMemo(() => makeNum("bn"), []);

    const t = { ...TRANSLATIONS.bn, ...(TRANSLATIONS[lang] || {}) };
    const dir = lang === "ar" ? "rtl" : "ltr";
    const num = useMemo(() => makeNum(lang), [lang]);

    const institutionName = getInstitutionName(institutionInfo, lang);
    const institutionAddress = getInstitutionAddress(institutionInfo, lang);
    const sessionNameRaw = getSessionName(conditionAverage?.Session, lang);
    const sessionName = lang === "ar" ? num(sessionNameRaw) : sessionNameRaw;
    const className = getClassName(conditionAverage?.SubClass, lang);

    const monthText = month !== "" ? (MONTH_NAMES[lang] || MONTH_NAMES.bn)[Number(month)] : "";
    const yearText = year !== "" ? num(year) : "";

    const C = THEMES[colorMode] || THEMES.color;
    const show = { ...DEFAULT_VISIBLE_COLUMNS, ...(visibleColumns || {}) };
    const days = Number(daysCount) || 31;
    const isLandscape = orientation === "landscape";

    const scalePct = useMemo(() => {
        const n = parseInt(scaleInput, 10);
        if (!Number.isFinite(n)) return DEFAULT_SCALE;
        return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
    }, [scaleInput]);
    const scale = scalePct / 100;

    const f = fontPct / 100;
    const fs = (px) => `${+(px * f).toFixed(2)}px`;
    const grow = Math.max(1, f);
    const theadPx = Math.round(THEAD_PX * grow);
    const rowMinPx = Math.round(ROW_MIN_PX * grow);
    const w = (px) => `${Math.round(px * grow)}px`;

    const visibleColCount =
        (show.sl ? 1 : 0) + (show.id ? 1 : 0) + (show.name ? 1 : 0) +
        (show.days ? days : 0) + (show.present ? 1 : 0) + (show.absent ? 1 : 0);

    const customRows = useMemo(() => {
        const s = String(rowsInput ?? "").trim();
        if (s === "") return null;
        const n = parseInt(s, 10);
        if (!Number.isFinite(n) || n <= 0) return null;
        return Math.min(n, MAX_CUSTOM_ROWS);
    }, [rowsInput]);

    const toggleColumn = (key) => setVisibleColumns((p) => ({ ...p, [key]: !p[key] }));
    const setAllColumns = (value) =>
        setVisibleColumns(Object.fromEntries(ATTENDANCE_COLUMNS.map((c) => [c.key, value])));
    const handleRowsChange = (v) => {
        const cleaned = String(v).replace(/[^\d]/g, "").slice(0, 3);
        setRowsInput(cleaned);
    };
    const handleScaleChange = (v) => {
        const cleaned = String(v).replace(/[^\d]/g, "").slice(0, 3);
        setScaleInput(cleaned);
    };
    const handleScaleBlur = () => {
        const n = parseInt(scaleInput, 10);
        if (!Number.isFinite(n)) return setScaleInput(String(DEFAULT_SCALE));
        setScaleInput(String(Math.min(MAX_SCALE, Math.max(MIN_SCALE, n))));
    };
    const changeFont = (delta) =>
        setFontPct((p) => Math.min(MAX_FONT, Math.max(MIN_FONT, p + delta)));

    const toggleDivision = (id) =>
        setExcludedDivs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const setAllDivisions = (checked) =>
        setExcludedDivs(checked ? [] : divisionOptions.map((d) => d.id));

    /* ═══ PAGE GEOMETRY ═══ */
    const paperDef = PAPER_MM[paper] || PAPER_MM[DEFAULT_PAPER];
    const pageWmm = isLandscape ? paperDef.h : paperDef.w;
    const pageHmm = isLandscape ? paperDef.w : paperDef.h;

    const sheetWidthMm = +(pageWmm - PAGE_MARGIN_MM * 2).toFixed(1);
    const sheetHeightMm = +(pageHmm - PAGE_MARGIN_MM * 2 - SAFETY_MM).toFixed(1);
    const pageHeightPx = sheetHeightMm * PX_PER_MM;

    const rowsAreaPx = pageHeightPx - titleH - theadPx - 4;
    const maxRowsFit = Math.max(1, Math.floor(rowsAreaPx / rowMinPx));

    /* ✅ পেজ ভাঙার লজিক (একটি কিতাবের জন্য) */
    const pages = useMemo(() => {
        const studentCount = studentResultsDetails.length;
        if (studentCount === 0 && customRows === null) return [[]];

        if (customRows !== null) {
            const items = [
                ...studentResultsDetails.map((student) => student),
                ...Array.from({ length: customRows }, () => null),
            ];
            return chunk(items, maxRowsFit).map((list, pageIndex) =>
                list.map((student, i) => ({
                    student,
                    index: pageIndex * maxRowsFit + i,
                }))
            );
        }

        const chunks = chunk(studentResultsDetails, maxRowsFit);
        const totalPages = chunks.length;

        return chunks.map((list, pageIndex) => {
            const rows = list.map((student, i) => ({
                student,
                index: pageIndex * maxRowsFit + i,
            }));

            if (pageIndex === totalPages - 1) {
                while (rows.length < maxRowsFit) {
                    rows.push({ student: null, index: pageIndex * maxRowsFit + rows.length });
                }
            }
            return rows;
        });
    }, [studentResultsDetails, maxRowsFit, customRows]);

    /* ✅ প্রতিটি checked কিতাবের জন্য আলাদা গ্রুপ (কিছুই checked না থাকলে ফাঁকা কিতাবের একটি গ্রুপ) */
    const sheetGroups = useMemo(() => {
        if (selectedSubjectIds.length === 0) {
            return [{ id: "none", bookName: "", teacherName: "" }];
        }
        return selectedSubjectIds.map((id) => {
            const info = teacherMap[id];
            const label = subjectList.find((s) => s.value === id)?.label || "";
            return {
                id,
                bookName: (info?.book || label || "").trim(),
                teacherName: info?.teacher || "",
            };
        });
    }, [selectedSubjectIds, teacherMap, subjectList]);

    // ✅ সব কিতাবের পেজ একসাথে (প্রিভিউ ও প্রিন্টে একই তালিকা)
    const flatPages = useMemo(
        () =>
            sheetGroups.flatMap((group, groupIdx) =>
                pages.map((rows, pageIndex) => ({ rows, pageIndex, group, groupIdx }))
            ),
        [sheetGroups, pages]
    );

    // ✅ শেষ পেজে সারি ফুল-হাইট (Stretch) করার লজিক
    const lastPageIdx = pages.length - 1;
    const lastPageRows = pages[lastPageIdx] || [];
    const isStretched = customRows === null && lastPageRows.filter(r => r.student !== null).length < maxRowsFit;

    const finalRowHeight = isStretched
        ? Math.floor(rowsAreaPx / Math.max(1, lastPageRows.length))
        : Math.floor(rowsAreaPx / maxRowsFit);

    const firstGroup = sheetGroups[0];
    useLayoutEffect(() => {
        const measure = () => {
            if (!titleRef.current) return;
            const h = Math.ceil(titleRef.current.offsetHeight) + 1;
            if (h > 1) setTitleH((prev) => (Math.abs(prev - h) > 1 ? h : prev));
        };
        measure();
        if (document.fonts?.ready) document.fonts.ready.then(measure);
    }, [institutionInfo, institutionLogo, sessionName, className, orientation, paper, lang, fontPct, firstGroup?.bookName, firstGroup?.teacherName, monthText, yearText, hourInput]);

    const cellBase = {
        border: `1px solid ${C.border}`,
        padding: "3px 2px",
        fontSize: fs(14),
        color: C.text,
        overflow: "hidden",
    };

    const thStyle = {
        ...cellBase,
        backgroundColor: C.headBg,
        color: C.primaryDark,
        fontWeight: 700,
        textAlign: "center",
        verticalAlign: "middle",
    };

    const thVertical = {
        display: "inline-block",
        writingMode: "vertical-rl",
        transform: "rotate(180deg)",
        whiteSpace: "nowrap",
        fontWeight: 700,
        fontSize: fs(14),
    };

    const renderColGroup = () => (
        <colgroup>
            {show.sl && <col style={{ width: w(36) }} />}
            {show.id && <col style={{ width: w(56) }} />}
            {show.name && <col style={{ width: w(isLandscape ? 190 : 150) }} />}
            {show.days && Array.from({ length: days }).map((_, i) => <col key={i} />)}
            {show.present && <col style={{ width: w(38) }} />}
            {show.absent && <col style={{ width: w(38) }} />}
        </colgroup>
    );

    const renderTitleBlock = (withRef, group) => (
        <div
            ref={withRef ? titleRef : null}
            style={{
                padding: "8px 8px 10px",
                borderBottom: `3px solid ${C.primary}`,
                background: "#fff",
            }}
        >
            <div style={{ position: "relative", textAlign: "center", minHeight: "92px" }}>
                <img
                    src={institutionLogo || EXAMPLE_LOGO}
                    alt="logo"
                    style={{
                        position: "absolute", insetInlineStart: "6px", top: "2px",
                        width: "88px", height: "88px", objectFit: "contain",
                        userSelect: "none", pointerEvents: "none",
                    }}
                />
                <h1 style={{ margin: 0, fontSize: fs(22), fontWeight: 800, lineHeight: 1.3, color: C.primaryDark }}>
                    {institutionName}
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: fs(15), fontWeight: 600, color: C.muted }}>
                    {institutionAddress}
                </p>
                <h2 style={{ margin: "4px 0 0", fontSize: fs(17), fontWeight: 600, lineHeight: 1.3, color: C.text }}>
                    {t.title} - {sessionName}
                </h2>
                <div style={{
                    display: "inline-block", marginTop: "6px",
                    minWidth: "320px", padding: "1px 24px",
                    backgroundColor: C.headBg, color: C.primaryDark,
                    border: `1.5px solid ${C.primary}`, borderRadius: "3px",
                    fontWeight: 800, fontSize: fs(16), lineHeight: fs(24),
                }}>
                    {t.classLabel} : {className}
                </div>
            </div>

            <div style={{
                marginTop: "10px", padding: "8px 10px",
                border: `1px solid ${C.infoBorder}`, borderRadius: "3px",
                display: "flex", flexDirection: "column", gap: "8px",
                textAlign: "start",
            }}>
                <div style={{ display: "flex", gap: "18px" }}>
                    <FillField label={t.bookName} value={group?.bookName} flex={2} color={C.text} dottedColor={C.dotted} fs={fs} />
                    <FillField label={t.month} value={monthText} flex={1.2} color={C.text} dottedColor={C.dotted} fs={fs} />
                    <FillField label={t.hijriYear} value={yearText} flex={1.2} color={C.text} dottedColor={C.dotted} fs={fs} />
                </div>
                <div style={{ display: "flex", gap: "18px" }}>
                    <FillField label={t.teacherName} value={group?.teacherName} flex={2.4} color={C.text} dottedColor={C.dotted} fs={fs} />
                    <FillField label={t.hour} value={hourInput.trim()} flex={1} color={C.text} dottedColor={C.dotted} fs={fs} />
                </div>
            </div>
        </div>
    );

    const renderPage = ({ rows, pageIndex, group, groupIdx }, isPrint = false) => (
        <div
            key={(isPrint ? "p" : "s") + group.id + "-" + pageIndex}
            dir={dir}
            className="sheet-card sheet-page"
            style={{
                width: `${sheetWidthMm}mm`,
                height: `${sheetHeightMm}mm`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                overflow: "hidden",
                background: "#fff",
                color: C.text,
                fontFamily: SHEET_FONT,
                boxShadow: "0 2px 10px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.05)",
            }}
        >
            <div
                className="sheet-scaled"
                style={{
                    width: `${sheetWidthMm}mm`,
                    height: `${sheetHeightMm}mm`,
                    flexShrink: 0,
                    overflow: "hidden",
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                    {renderColGroup()}
                    <thead style={{ display: "table-header-group" }}>
                        <tr>
                            <th colSpan={Math.max(visibleColCount, 1)} style={{ padding: 0, fontWeight: 400, backgroundColor: "#fff" }}>
                                {renderTitleBlock(!isPrint && groupIdx === 0 && pageIndex === 0, group)}
                            </th>
                        </tr>

                        {visibleColCount > 0 && (
                            <tr style={{ height: `${theadPx}px` }}>
                                {show.sl && <th style={thStyle}>{t.sl}</th>}
                                {show.id && <th style={thStyle}>{t.id}</th>}
                                {show.name && (
                                    <th style={{ ...thStyle, textAlign: "start", paddingInlineStart: "8px" }}>
                                        {t.name}
                                    </th>
                                )}
                                {show.days && Array.from({ length: days }).map((_, i) => (
                                    <th key={i} style={{ ...thStyle, padding: "4px 0", verticalAlign: "bottom" }}>
                                        <span style={{ ...thVertical, fontSize: fs(11) }}>{num(i + 1)}</span>
                                    </th>
                                ))}
                                {show.present && (
                                    <th style={{ ...thStyle, backgroundColor: C.headStrongBg }}>
                                        <span style={thVertical}>{t.present}</span>
                                    </th>
                                )}
                                {show.absent && (
                                    <th style={{ ...thStyle, backgroundColor: C.headStrongBg }}>
                                        <span style={thVertical}>{t.absent}</span>
                                    </th>
                                )}
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {rows.length === 0 && (
                            <tr style={{ height: `${finalRowHeight}px` }}>
                                <td
                                    colSpan={Math.max(visibleColCount, 1)}
                                    style={{ ...cellBase, textAlign: "center", color: C.muted, height: `${finalRowHeight}px` }}
                                >
                                    {t.noStudent}
                                </td>
                            </tr>
                        )}

                        {rows.map(({ student, index }, rowPos) => {
                            const rowBg = index % 2 === 1 ? C.zebra : "#fff";
                            const td = { ...cellBase, backgroundColor: rowBg, textAlign: "center", height: `${finalRowHeight}px` };

                            if (!student && customRows === null && studentResultsDetails.length === 0 && rowPos === 0) {
                                return (
                                    <tr key={`empty-${index}`} style={{ height: `${finalRowHeight}px` }}>
                                        <td colSpan={Math.max(visibleColCount, 1)} style={{ ...td, color: C.muted }}>
                                            {t.noStudent}
                                        </td>
                                    </tr>
                                );
                            }

                            return (
                                <tr
                                    key={student?.ID ?? `blank-${index}`}
                                    style={{ height: `${finalRowHeight}px`, breakInside: "avoid", pageBreakInside: "avoid" }}
                                >
                                    {show.sl && <td style={td}>{student ? num(index + 1) : ""}</td>}
                                    {show.id && <td style={td}>{student ? num(student?.User?.UserCode ?? "") : ""}</td>}
                                    {show.name && (
                                        <td style={{
                                            ...td, textAlign: "start", paddingInlineStart: "8px", fontWeight: 600,
                                            whiteSpace: "nowrap", textOverflow: "ellipsis",
                                        }}>
                                            {student ? getStudentName(student?.User, lang) : ""}
                                        </td>
                                    )}
                                    {show.days && Array.from({ length: days }).map((_, d) => (
                                        <td key={d} style={td} />
                                    ))}
                                    {show.present && <td style={{ ...td, backgroundColor: C.zebra }} />}
                                    {show.absent && <td style={{ ...td, backgroundColor: C.zebra }} />}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const settingsPanels = (
        <>
            <LanguageSelector t={tUI} value={lang} onChange={setLang} />
            <SheetInfoSettings
                t={tUI}
                lang={lang}
                subjectOptions={subjectList}
                selectedSubjectIds={selectedSubjectIds}
                onToggleSubject={toggleSubject}
                onSetAllSubjects={setAllSubjects}
                teacherMap={teacherMap}
                month={month} onMonthChange={setMonth}
                year={year} onYearChange={setYear}
                hour={hourInput} onHourChange={setHourInput}
                num={numUI}
            />
            <OrderSettings t={tUI} value={orderMode} onChange={setOrderMode} />
            <DivisionFilter
                t={tUI}
                num={numUI}
                options={divisionOptions}
                excluded={excludedSet}
                onToggle={toggleDivision}
                onSetAll={setAllDivisions}
            />
            <FontSizeBar
                t={tUI}
                num={numUI}
                value={fontPct}
                onSmaller={() => changeFont(-FONT_STEP)}
                onBigger={() => changeFont(FONT_STEP)}
                onReset={() => setFontPct(DEFAULT_FONT)}
                canSmaller={fontPct > MIN_FONT}
                canBigger={fontPct < MAX_FONT}
            />
            <ColumnSelector t={tUI} num={numUI} value={visibleColumns} onToggle={toggleColumn} onSetAll={setAllColumns} columns={ATTENDANCE_COLUMNS} />
            <RowsSettings t={tUI} value={rowsInput} onChange={handleRowsChange} onReset={() => setRowsInput("")} />
            <PrintSettings
                t={tUI}
                num={numUI}
                colorMode={colorMode} onColorChange={setColorMode}
                orientation={orientation} onOrientationChange={setOrientation}
                paper={paper} onPaperChange={setPaper}
                daysCount={daysCount} onDaysChange={setDaysCount}
                scaleInput={scaleInput} scalePct={scalePct}
                onScaleChange={handleScaleChange}
                onScaleBlur={handleScaleBlur}
                onScalePreset={(n) => setScaleInput(String(n))}
            />
        </>
    );

    return (
        <div className="rs-root flex w-full bg-slate-100 lg:h-[100dvh] lg:overflow-hidden">
            {/* ✅ প্রতিটি checked কিতাবের শিক্ষক লোডার */}
            {selectedSubjectIds.map((id) => (
                <TeacherLoader
                    key={id}
                    subjectId={id}
                    sessionId={SessionID}
                    examId={ExamID}
                    subClassId={SubClassID}
                    onChange={handleTeacherChange}
                />
            ))}

            <aside className="no-print hidden lg:flex flex-col w-[300px] shrink-0 h-full bg-white border-r border-slate-200 shadow-[2px_0_12px_rgba(15,23,42,0.04)] print:hidden">
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

                <div className="px-5 py-3 border-b border-slate-100 shrink-0">
                    <PreviewInfo t={tUI} num={numUI} count={studentResultsDetails.length} days={days} pages={flatPages.length} />
                </div>

                <div className="rs-scroll flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                    {settingsPanels}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <p className="text-[10px] text-slate-400 text-center">{tUI.footer}</p>
                </div>
            </aside>

            <main className="rs-main rs-scroll flex-1 min-w-0 lg:h-full lg:overflow-y-auto">
                <div className="no-print lg:hidden p-4 pb-0 print:hidden">
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                        <PreviewInfo t={tUI} num={numUI} count={studentResultsDetails.length} days={days} pages={flatPages.length} />
                        {settingsPanels}
                    </div>
                </div>

                <div className="result-sheet-wrapper w-full p-4 lg:p-6">
                    <div className="sheet-scroll overflow-x-auto pb-2">
                        <div
                            className="sheet-pages"
                            style={{
                                width: "fit-content", margin: "0 auto",
                                display: "flex", flexDirection: "column", gap: "16px",
                            }}
                        >
                            {flatPages.map((p) => renderPage(p))}
                        </div>
                    </div>
                </div>
            </main>

            {printRoot && createPortal(
                <div className="sheet-pages-print">
                    {flatPages.map((p) => renderPage(p, true))}
                </div>,
                printRoot
            )}

            <style>{`
        /* ✅ SolaimanLipi — ফন্ট ফাইল public/fonts/SolaimanLipi.ttf এ রাখুন (আগে থেকে লোড থাকলে দরকার নেই) */
        @font-face {
          font-family: 'SolaimanLipi';
          src: local('SolaimanLipi'), local('Solaiman Lipi'), url('/fonts/SolaimanLipi.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .sheet-page, .sheet-page * { font-family: ${SHEET_FONT} !important; }

        .print-portal { display: none; }
        .rs-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; scroll-behavior: smooth; }
        .rs-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .rs-scroll::-webkit-scrollbar-track { background: transparent; }
        .rs-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
        .rs-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; background-clip: padding-box; border: 2px solid transparent; }

        @media print {
          @page { size: ${paperDef.css} ${orientation}; margin: ${PAGE_MARGIN_MM}mm; }

          html, body {
            margin: 0 !important; padding: 0 !important;
            height: auto !important; min-height: 0 !important;
            overflow: visible !important;
            background: #fff !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

          /* ✅ পুরো অ্যাপ (sidebar, header, layout সব) প্রিন্টে লুকানো — শুধু print-portal থাকবে */
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; margin: 0 !important; padding: 0 !important; }

          .sheet-pages-print { display: block !important; margin: 0 !important; padding: 0 !important; }

          .print-portal .sheet-page {
            box-shadow: none !important;
            margin: 0 !important;
            height: ${sheetHeightMm}mm !important;
            max-height: ${sheetHeightMm}mm !important;
            overflow: hidden !important;
            break-after: auto !important;
            page-break-after: auto !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-portal .sheet-page + .sheet-page {
            break-before: page !important;
            page-break-before: always !important;
          }
          .print-portal .sheet-scaled {
            height: ${sheetHeightMm}mm !important;
            max-height: ${sheetHeightMm}mm !important;
          }

          thead { display: table-header-group !important; }
          tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const fieldCls =
    "w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 " +
    "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300";

const PreviewInfo = ({ t, num, count, days, pages }) => (
    <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <span className="text-sm font-bold text-slate-800 truncate">{t.preview}</span>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 shrink-0">
            {num(count)} {t.people}
        </span>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 shrink-0">
            {num(days)} {t.daysUnit}
        </span>
        {pages > 1 && (
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 shrink-0">
                {num(pages)} {t.pageUnit}
            </span>
        )}
    </div>
);

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

const SelectField = ({ label, value, onChange, options, placeholder }) => (
    <div>
        <p className="text-[11px] font-semibold text-slate-500 mb-1.5">{label}</p>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
            <option value="">{placeholder}</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    </div>
);

/* ✅ ক্রম অনুসারে (আইডি সিরিয়াল / বিভাগ / নাম্বার) */
const OrderSettings = ({ t, value, onChange }) => {
    const groupName = useId();
    const list = [
        // { key: "idSerial", label: t.idSerial },
        { key: "byDivision", label: t.byDivision },
        { key: "byNumber", label: t.byNumber },
    ];
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-bold text-slate-700 leading-tight">{t.orderTitle}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 mb-2">{t.orderSub}</p>
            <div role="radiogroup" className="grid grid-cols-1 gap-1.5">
                {list.map((opt) => {
                    const checked = value === opt.key;
                    return (
                        <label key={opt.key} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}>
                            <input type="radio" name={`attOrder-${groupName}`} value={opt.key}
                                checked={checked} onChange={() => onChange(opt.key)}
                                className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer" />
                            <span>{opt.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

/* ✅ বিভাগ ফিল্টার — ডিফল্টে সব চেক, আনচেক করলে ওই বিভাগের শিক্ষার্থী বাদ */
const DivisionFilter = ({ t, num, options, excluded, onToggle, onSetAll }) => {
    const checkedCount = options.filter((d) => !excluded.has(d.id)).length;
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 leading-tight">{t.divisionTitle}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {t.divisionSelected(num(checkedCount), num(options.length))}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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

            {options.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2 text-center">{t.divisionEmpty}</p>
            ) : (
                <div className="grid grid-cols-1 gap-1.5">
                    {options.map((d) => {
                        const checked = !excluded.has(d.id);
                        return (
                            <label key={d.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                                }`}>
                                <input type="checkbox" checked={checked} onChange={() => onToggle(d.id)}
                                    className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer" />
                                <span className={`flex-1 truncate ${checked ? "" : "line-through"}`}>{d.label}</span>
                                <span className={`shrink-0 min-w-[26px] text-center text-[10px] font-bold rounded-md px-1.5 py-0.5 ${checked
                                    ? "bg-white text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-400"
                                    }`}>
                                    {num(d.count)}
                                </span>
                            </label>
                        );
                    })}
                </div>
            )}

            <p className="text-[10px] text-slate-400 leading-snug mt-2">{t.divisionNote}</p>
        </div>
    );
};

const SheetInfoSettings = ({
    t, num, lang,
    subjectOptions, selectedSubjectIds, onToggleSubject, onSetAllSubjects, teacherMap,
    month, onMonthChange, year, onYearChange,
    hour, onHourChange,
}) => {
    const monthList = MONTH_NAMES[lang] || MONTH_NAMES.bn;
    const monthOptions = monthList.map((m, i) => ({ value: String(i), label: m }));
    const yearOptions = YEAR_LIST.map((y) => ({ value: y, label: num(y) }));
    const selectedSet = new Set(selectedSubjectIds);
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 leading-tight">{t.infoTitle}</p>

            {/* ✅ কিতাবের নাম — checkbox (ডিফল্টে প্রথমটি checked) */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-500">{t.subjectLabel}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {t.subjectSelected(num(selectedSubjectIds.length), num(subjectOptions.length))}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => onSetAllSubjects(true)}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                            {t.all}
                        </button>
                        <button type="button" onClick={() => onSetAllSubjects(false)}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200">
                            {t.none}
                        </button>
                    </div>
                </div>

                {subjectOptions.length === 0 ? (
                    <p className="text-[11px] text-slate-400 py-2 text-center">{t.subjectEmpty}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-0.5 rs-scroll">
                        {subjectOptions.map((s) => {
                            const checked = selectedSet.has(s.value);
                            const info = teacherMap?.[s.value];
                            return (
                                <label key={s.value} className={`flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}>
                                    <span className="flex items-center gap-2">
                                        <input type="checkbox" checked={checked} onChange={() => onToggleSubject(s.value)}
                                            className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer" />
                                        <span className="flex-1 truncate">{s.label}</span>
                                    </span>
                                    {checked && (
                                        <span className="text-[10px] text-emerald-700 font-normal pl-[22px] truncate">
                                            {t.teacherAuto}: {info?.loading ? t.teacherLoading : (info?.teacher || "—")}
                                        </span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <SelectField label={t.monthLabel} value={month} onChange={onMonthChange} options={monthOptions} placeholder={t.monthPlaceholder} />
                <SelectField label={t.yearLabel} value={year} onChange={onYearChange} options={yearOptions} placeholder={t.yearPlaceholder} />
            </div>

            <div>
                <p className="text-[11px] font-semibold text-slate-500 mb-1.5">{t.hourLabel}</p>
                <input
                    type="text"
                    value={hour}
                    maxLength={40}
                    onChange={(e) => onHourChange(e.target.value)}
                    placeholder={t.hourPlaceholder}
                    className={fieldCls}
                />
            </div>

            <p className="text-[10px] text-slate-400 leading-snug">{t.infoNote}</p>
        </div>
    );
};

const FontSizeBar = ({ t, num, value, onSmaller, onBigger, onReset, canSmaller, canBigger }) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
        <p className="text-xs font-bold text-slate-700 leading-tight">{t.fontTitle}</p>
        <div className="flex items-stretch gap-1.5">
            <button
                type="button"
                onClick={onSmaller}
                disabled={!canSmaller}
                title={t.fontSmaller}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                A<span className="text-[10px]">−</span>
            </button>
            <button
                type="button"
                onClick={onReset}
                title={t.fontResetTip}
                className="min-w-[64px] px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
                {num(value)}%
            </button>
            <button
                type="button"
                onClick={onBigger}
                disabled={!canBigger}
                title={t.fontBigger}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                A<span className="text-[10px]">+</span>
            </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">{t.fontNote}</p>
    </div>
);

const RowsSettings = ({ t, value, onChange, onReset }) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700 leading-tight">{t.rowsTitle}</p>
                {String(value).trim() !== "" && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200"
                    >
                        {t.rowsReset}
                    </button>
                )}
            </div>
            <div>
                <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={t.rowsPlaceholder}
                    className={fieldCls}
                />
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">{t.rowsNote}</p>
        </div>
    );
};

const PrintSettings = ({
    t, num,
    colorMode, onColorChange,
    orientation, onOrientationChange,
    paper, onPaperChange,
    daysCount, onDaysChange,
    scaleInput, scalePct, onScaleChange, onScaleBlur, onScalePreset,
}) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 leading-tight">{t.printSetting}</p>
            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
                {paper} · {orientation === "landscape" ? "Landscape" : "Portrait"} · {num(scalePct)}%
            </span>
        </div>
        <SegmentedControl label={t.pageDirection} options={ORIENTATION_OPTIONS} value={orientation} onChange={onOrientationChange} />
        <SegmentedControl label={t.paperSize} options={PAPER_OPTIONS} value={paper} onChange={onPaperChange} />
        <SegmentedControl label={t.monthDays} options={DAYS_OPTIONS} value={daysCount} onChange={onDaysChange} />

        <SegmentedControl
            label={t.colorLabel}
            options={[
                { key: "color", label: t.colorOpt },
                { key: "bw", label: t.bwOpt },
            ]}
            value={colorMode}
            onChange={onColorChange}
        />

        <p className="text-[10px] text-slate-400 leading-snug">{t.printNote}</p>
    </div>
);

const ColumnSelector = ({ t, num, value, onToggle, onSetAll, columns = ATTENDANCE_COLUMNS }) => {
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
