import { useMemo, useState, useEffect } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const bn = (v) => bnBijoy2Unicode(String(v));

const bg = (color) => ({
    backgroundColor: color,
    boxShadow: `inset 0 0 0 1000px ${color}`,
});

const EXAMPLE_LOGO =
    "https://images.seeklogo.com/logo-png/42/1/madrasha-logo-png_seeklogo-424804.png";

/* ═══════════════════════════════════════════════════════════
   OPTIONS & CONSTANTS
   ═══════════════════════════════════════════════════════════ */
export const ATTENDANCE_COLUMNS = [
    { key: "sl", label: "ক্রমিক" },
    { key: "id", label: "আইডি নং" },
    { key: "name", label: "শিক্ষার্থীর নাম" },
    { key: "sub", label: "বিষয় নং" },
    { key: "days", label: "তারিখ (দিন)" },
    { key: "present", label: "উপস্থিত" },
    { key: "absent", label: "অনুপস্থিত" },
];

export const DEFAULT_VISIBLE_COLUMNS = Object.fromEntries(
    ATTENDANCE_COLUMNS.map((c) => [c.key, true])
);

export const COLOR_OPTIONS = [
    { key: "color", label: "রঙিন" },
    { key: "bw", label: "সাদা কালো" },
];
export const DEFAULT_COLOR_MODE = "color";

export const ORIENTATION_OPTIONS = [
    { key: "portrait", label: "Portrait" },
    { key: "landscape", label: "Landscape" },
];
export const DEFAULT_ORIENTATION = "portrait";

export const PAGE_SIZE_OPTIONS = [
    { key: "A4", label: "A4" },
    { key: "legal", label: "Legal" },
];
export const DEFAULT_PAGE_SIZE = "A4";

export const DAYS_OPTIONS = [
    { key: "28", label: "২৮" },
    { key: "29", label: "২৯" },
    { key: "30", label: "৩০" },
    { key: "31", label: "৩১" },
];
export const DEFAULT_DAYS = "31";

export const KITAB_OPTIONS = [
    { key: "3", label: "৩ বিষয়ের খাতা" },
    { key: "4", label: "৪ বিষয়ের খাতা" },
    { key: "5", label: "৫ বিষয়ের খাতা" },
    { key: "6", label: "৬ বিষয়ের খাতা" },
    { key: "7", label: "৭ বিষয়ের খাতা" },
    { key: "8", label: "৮ বিষয়ের খাতা" },
    { key: "9", label: "৯ বিষয়ের খাতা" },
    { key: "10", label: "১০ বিষয়ের খাতা" },
    { key: "11", label: "১১ বিষয়ের খাতা" },
];
export const DEFAULT_KITAB = "7";

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
    },
    bw: {
        primary: "#000",
        primaryDark: "#000",
        headBg: "#e5e5e5",
        headStrongBg: "#d4d4d4",
        zebra: "#fff",
        border: "#000",
        text: "#000",
        muted: "#404040",
    },
};

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE HOOKS
   ═══════════════════════════════════════════════════════════ */
const LS_VISIBLE = "attendanceSheetVisibleColumns";
const LS_COLOR = "attendanceSheetColorMode";
const LS_ORIENTATION = "attendanceSheetOrientation";
const LS_PAGE_SIZE = "attendanceSheetPageSize";
const LS_DAYS = "attendanceSheetDays";
const LS_KITAB = "attendanceSheetKitab";

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

/* ═══════════════════════════════════════════════════════════
   FILL-IN FIELD
   ═══════════════════════════════════════════════════════════ */
function FillField({ label, flex = 1, color, value }) {
    return (
        <div style={{ flex, display: "flex", alignItems: "flex-end", gap: "4px", minWidth: 0 }}>
            <span style={{ fontSize: "15px", fontWeight: 600, whiteSpace: "nowrap", color }}>{label}</span>
            <span style={{
                flex: 1, minWidth: "20px", height: "22px",
                borderBottom: `1.5px dotted ${color}`,
                fontSize: "14px", fontWeight: 600, textAlign: "center",
                lineHeight: "20px",
            }}>
                {value || ""}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   VERTICAL TEXT (merged cell-এর ঠিক মাঝখানে বসানোর জন্য)
   ═══════════════════════════════════════════════════════════ */
function VText({ children, fontSize = 13, fontWeight = 700, wrap = false }) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            minHeight: "100%",
        }}>
            <div style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                whiteSpace: wrap ? "normal" : "nowrap",
                wordBreak: wrap ? "break-word" : "normal",
                textAlign: "center",
                fontSize: `${fontSize}px`,
                fontWeight,
                lineHeight: 1.25,
                maxHeight: "100%",
            }}>
                {children}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   🧾 MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SubjectAttendanceSheet({ reportData, query }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const [institutionLogo, setInstitutionLogo] = useState(null);

    const conditionAverage = reportData?.conditionAverage || {};
    const studentResultsDetails = Array.isArray(reportData?.studentResults)
        ? reportData.studentResults
        : [];

    /* ✅ State Management */
    const [visibleColumns, setVisibleColumns] = useState(() => loadObj(LS_VISIBLE, DEFAULT_VISIBLE_COLUMNS));
    const [colorMode, setColorMode] = useState(() => loadStr(LS_COLOR, COLOR_OPTIONS, DEFAULT_COLOR_MODE));
    const [orientation, setOrientation] = useState(() => loadStr(LS_ORIENTATION, ORIENTATION_OPTIONS, DEFAULT_ORIENTATION));
    const [pageSize, setPageSize] = useState(() => loadStr(LS_PAGE_SIZE, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE));
    const [daysCount, setDaysCount] = useState(() => loadStr(LS_DAYS, DAYS_OPTIONS, DEFAULT_DAYS));
    const [kitabType, setKitabType] = useState(() => loadStr(LS_KITAB, KITAB_OPTIONS, DEFAULT_KITAB));

    /* ✅ LocalStorage Save */
    useEffect(() => { localStorage.setItem(LS_VISIBLE, JSON.stringify(visibleColumns)); }, [visibleColumns]);
    useEffect(() => { localStorage.setItem(LS_COLOR, colorMode); }, [colorMode]);
    useEffect(() => { localStorage.setItem(LS_ORIENTATION, orientation); }, [orientation]);
    useEffect(() => { localStorage.setItem(LS_PAGE_SIZE, pageSize); }, [pageSize]);
    useEffect(() => { localStorage.setItem(LS_DAYS, daysCount); }, [daysCount]);
    useEffect(() => { localStorage.setItem(LS_KITAB, kitabType); }, [kitabType]);

    /* ✅ Dynamic Logo Fetching */
    useEffect(() => {
        const logoData = institutionInfo?.InstitutionLogo || institutionInfo?.Logo || institutionInfo?.InstitutionImage;
        if (logoData?.data) {
            const buf = Buffer.from(logoData.data);
            setInstitutionLogo(`data:image/png;base64,${buf.toString("base64")}`);
        } else if (typeof logoData === "string" && (logoData.startsWith("data:image") || logoData.startsWith("http"))) {
            setInstitutionLogo(logoData);
        } else {
            setInstitutionLogo(EXAMPLE_LOGO);
        }
    }, [institutionInfo]);

    const C = THEMES[colorMode] || THEMES.color;
    const show = { ...DEFAULT_VISIBLE_COLUMNS, ...(visibleColumns || {}) };
    const days = Number(daysCount) || 31;
    const isLandscape = orientation === "landscape";

    /* ✅ বিষয়ের সংখ্যা (প্রতি শিক্ষার্থীর সারি) */
    const subjectCount = Math.max(Number(kitabType) || 1, 1);

    const visibleColCount =
        (show.sl ? 1 : 0) +
        (show.id ? 1 : 0) +
        (show.name ? 1 : 0) +
        (show.sub ? 1 : 0) +
        (show.days ? days : 0) +
        (show.present ? 1 : 0) +
        (show.absent ? 1 : 0);

    /* Sidebar handlers */
    const toggleColumn = (key) => setVisibleColumns((p) => ({ ...p, [key]: !p[key] }));
    const setAllColumns = (value) =>
        setVisibleColumns(Object.fromEntries(ATTENDANCE_COLUMNS.map((c) => [c.key, value])));

    /* Styles */
    const cellBase = {
        border: `1px solid ${C.border}`,
        padding: "1px",
        fontSize: "13px",
        color: C.text,
        overflow: "hidden",
    };
    const thStyle = {
        ...cellBase,
        ...bg(C.headBg),
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
        fontSize: "13px",
    };

    /* Name column: কম বিষয় হলে সারি কম, তাই নামের জায়গা একটু চওড়া */
    const nameColWidth = subjectCount <= 4 ? 64 : 42;
    const rowHeight = subjectCount <= 5 ? 28 : 24;

    const sheetWidth = isLandscape ? (pageSize === "legal" ? "345mm" : "287mm") : "200mm";

    const renderColGroup = () => (
        <colgroup>
            {show.sl && <col style={{ width: "30px" }} />}
            {show.id && <col style={{ width: "40px" }} />}
            {show.name && <col style={{ width: `${nameColWidth}px` }} />}
            {show.sub && <col style={{ width: "22px" }} />}
            {show.days && Array.from({ length: days }).map((_, i) => <col key={i} />)}
            {show.present && <col style={{ width: "28px" }} />}
            {show.absent && <col style={{ width: "28px" }} />}
        </colgroup>
    );

    const renderSheet = () => (
        <div className="sheet-card" style={{
            width: sheetWidth, maxWidth: "none", margin: "0 auto",
            background: "#fff", color: C.text,
        }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                {renderColGroup()}
                <thead style={{ display: "table-header-group" }}>
                    {/* Title & Header Block */}
                    <tr>
                        <th colSpan={Math.max(visibleColCount, 1)} style={{ padding: 0, fontWeight: 400 }}>
                            <div style={{ padding: "6px 6px 8px" }}>

                                {/* Logo + Title */}
                                <div style={{ position: "relative", textAlign: "center", minHeight: "84px" }}>
                                    <img
                                        src={institutionLogo || EXAMPLE_LOGO}
                                        alt="logo"
                                        style={{
                                            position: "absolute", left: "6px", top: "0px",
                                            width: "80px", height: "80px", objectFit: "contain",
                                            userSelect: "none", pointerEvents: "none",
                                        }}
                                    />
                                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: 1.3, color: C.primaryDark }}>
                                        {institutionInfo?.InstitutionName || "আদর্শ ইনসান একাডেমি"}
                                    </h1>
                                    <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 600, color: C.muted }}>
                                        {institutionInfo?.Address || "ঠিকানা"}
                                    </p>
                                    <h2 style={{
                                        display: "inline-block", margin: "6px 0 0", padding: "0 24px 2px",
                                        fontSize: "17px", fontWeight: 600, lineHeight: 1.3, color: C.text,
                                        borderBottom: `1.5px solid ${C.text}`,
                                    }}>
                                        দৈনন্দিন শিক্ষার্থীর হাজিরা খাতা
                                    </h2>
                                </div>

                                {/* শ্রেণি + মাস + বছর */}
                                <div style={{
                                    marginTop: "8px", display: "flex", alignItems: "flex-end",
                                    gap: "18px", textAlign: "left",
                                }}>
                                    <div style={{ flex: 2, display: "flex", alignItems: "flex-end", gap: "4px", minWidth: 0 }}>
                                        <span style={{ fontSize: "15px", fontWeight: 700, whiteSpace: "nowrap", color: C.text }}>
                                            শ্রেণি/জামাত :
                                        </span>
                                        <span style={{ fontSize: "15px", fontWeight: 700, color: C.primaryDark }}>
                                            {conditionAverage?.SubClass?.SubClass || ""}
                                        </span>
                                    </div>
                                    <FillField label="মাস :" flex={1} color={C.text} />
                                    <FillField label="বছর :" flex={1} color={C.text} />
                                </div>
                            </div>
                        </th>
                    </tr>

                    {/* Column Header */}
                    {visibleColCount > 0 && (
                        <tr>
                            {show.sl && <th style={{ ...thStyle, fontSize: "11px" }}>ক্রঃ</th>}
                            {show.id && <th style={{ ...thStyle, fontSize: "11px" }}>আইডি</th>}
                            {show.name && <th style={{ ...thStyle, fontSize: "11px", wordBreak: "break-word" }}>শিক্ষার্থী</th>}
                            {show.sub && <th style={thStyle} />}
                            {show.days && Array.from({ length: days }).map((_, i) => (
                                <th key={i} style={{ ...thStyle, padding: "4px 0" }}>
                                    <span style={{ fontSize: "11px", fontWeight: "bold" }}>{bn(i + 1)}</span>
                                </th>
                            ))}
                            {show.present && (
                                <th style={{ ...thStyle, ...bg(C.headStrongBg) }}>
                                    <span style={thVertical}>উপ :</span>
                                </th>
                            )}
                            {show.absent && (
                                <th style={{ ...thStyle, ...bg(C.headStrongBg) }}>
                                    <span style={thVertical}>অনু :</span>
                                </th>
                            )}
                        </tr>
                    )}
                </thead>

                {/* ✅ প্রতি শিক্ষার্থীর জন্য আলাদা tbody → প্রিন্টে মাঝখানে পেজ ভাঙবে না */}
                {studentResultsDetails.map((studentResult, studentIndex) => {
                    const rowBg = studentIndex % 2 === 1 ? C.zebra : "#fff";
                    const td = {
                        ...cellBase,
                        ...bg(rowBg),
                        textAlign: "center",
                        verticalAlign: "middle",
                        height: `${rowHeight}px`,
                    };
                    /* merged cell: padding 0, যাতে ভেতরের wrapper পুরো cell নেয় */
                    const mergedTd = { ...td, padding: 0, height: "auto" };

                    return (
                        <tbody
                            key={studentResult.ID ?? studentIndex}
                            style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                        >
                            {Array.from({ length: subjectCount }).map((_, subIndex) => (
                                <tr key={subIndex} style={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
                                    {subIndex === 0 && (
                                        <>
                                            {/* ক্রমিক: অনুভূমিক, cell-এর ঠিক মাঝখানে */}
                                            {show.sl && (
                                                <td rowSpan={subjectCount} style={{ ...mergedTd, fontWeight: "bold" }}>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "100%",
                                                        height: "100%",
                                                        fontSize: "14px",
                                                        fontWeight: 700,
                                                    }}>
                                                        {bn(studentIndex + 1)}
                                                    </div>
                                                </td>
                                            )}
                                            {/* আইডি: vertical, মাঝখানে */}
                                            {show.id && (
                                                <td rowSpan={subjectCount} style={mergedTd}>
                                                    <VText fontSize={14} fontWeight={700}>
                                                        {bn(studentResult?.User?.UserCode ?? "")}
                                                    </VText>
                                                </td>
                                            )}
                                            {/* নাম: vertical, মাঝখানে */}
                                            {show.name && (
                                                <td rowSpan={subjectCount} style={mergedTd}>
                                                    <VText fontSize={13} fontWeight={600} wrap>
                                                        {studentResult?.User?.UserName}
                                                    </VText>
                                                </td>
                                            )}
                                        </>
                                    )}

                                    {/* ✅ বিষয় নং (১, ২, ৩ ...) */}
                                    {show.sub && (
                                        <td style={{ ...td, fontSize: "11px", fontWeight: 600 }}>
                                            {bn(subIndex + 1)}
                                        </td>
                                    )}

                                    {show.days && Array.from({ length: days }).map((_, d) => (
                                        <td key={d} style={td} />
                                    ))}
                                    {show.present && <td style={td} />}
                                    {show.absent && <td style={td} />}
                                </tr>
                            ))}
                        </tbody>
                    );
                })}

                {studentResultsDetails.length === 0 && (
                    <tbody>
                        <tr>
                            <td colSpan={Math.max(visibleColCount, 1)} style={{
                                ...cellBase, textAlign: "center", padding: "16px", color: C.muted,
                            }}>
                                কোনো শিক্ষার্থী পাওয়া যায়নি
                            </td>
                        </tr>
                    </tbody>
                )}
            </table>
        </div>
    );

    /* ═══ RENDER ═══ */
    return (
        <div className="rs-root flex w-full bg-slate-100 lg:h-[100dvh] lg:overflow-hidden">
            {/* ═══════════ SIDEBAR ═══════════ */}
            <aside className="hidden lg:flex flex-col w-[300px] shrink-0 h-full bg-white border-r border-slate-200 shadow-[2px_0_12px_rgba(15,23,42,0.04)] print:hidden">
                <div className="p-5 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-slate-800">সেটিং</h2>
                    </div>
                    <p className="text-xs text-slate-400">হাজিরা খাতার কলাম ও প্রিন্ট অপশন</p>
                </div>

                <div className="px-5 py-3 border-b border-slate-100 shrink-0">
                    <PreviewInfo count={studentResultsDetails.length} days={days} subjects={subjectCount} />
                </div>

                <div className="rs-scroll flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                    <KitabSelect value={kitabType} onChange={setKitabType} />

                    <ColumnSelector value={visibleColumns} onToggle={toggleColumn} onSetAll={setAllColumns} columns={ATTENDANCE_COLUMNS} />
                    <PrintSettings
                        colorMode={colorMode} onColorChange={setColorMode}
                        orientation={orientation} onOrientationChange={setOrientation}
                        pageSize={pageSize} onPageSizeChange={setPageSize}
                        daysCount={daysCount} onDaysChange={setDaysCount}
                    />
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                    <p className="text-[10px] text-slate-400 text-center">© Result Report Generator</p>
                </div>
            </aside>

            {/* ═══════════ REPORT BODY ═══════════ */}
            <main className="rs-main rs-scroll flex-1 min-w-0 lg:h-full lg:overflow-y-auto">
                <div className="lg:hidden p-4 pb-0 print:hidden">
                    <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                        <PreviewInfo count={studentResultsDetails.length} days={days} subjects={subjectCount} />
                        <KitabSelect value={kitabType} onChange={setKitabType} />
                        <ColumnSelector value={visibleColumns} onToggle={toggleColumn} onSetAll={setAllColumns} columns={ATTENDANCE_COLUMNS} />
                        <PrintSettings
                            colorMode={colorMode} onColorChange={setColorMode}
                            orientation={orientation} onOrientationChange={setOrientation}
                            pageSize={pageSize} onPageSizeChange={setPageSize}
                            daysCount={daysCount} onDaysChange={setDaysCount}
                        />
                    </div>
                </div>

                <div className="result-sheet-wrapper w-full p-4 lg:p-6">
                    <div className="sheet-scroll overflow-x-auto pb-2">
                        <div className="sheet-paper" style={{
                            width: "fit-content", margin: "0 auto",
                            boxShadow: "0 2px 10px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.05)",
                            background: "#fff",
                        }}>
                            {renderSheet()}
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══ CSS & PRINT SETTINGS ═══ */}
            <style>{`
                .rs-scroll { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; scroll-behavior: smooth; }
                .rs-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .rs-scroll::-webkit-scrollbar-track { background: transparent; }
                .rs-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
                .rs-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; background-clip: padding-box; border: 2px solid transparent; }

                @media print {
                    @page {
                        size: ${pageSize === "legal" ? "legal" : "A4"} ${orientation};
                        margin: 5mm;
                    }

                    html, body { margin: 0 !important; padding: 0 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    .rs-root { display: block !important; height: auto !important; overflow: visible !important; background: #fff !important; }
                    .rs-main { height: auto !important; overflow: visible !important; }
                    .result-sheet-wrapper { padding: 0 !important; }
                    .sheet-scroll { overflow: visible !important; padding: 0 !important; }
                    .sheet-paper { box-shadow: none !important; width: 100% !important; margin: 0 !important; }
                    .sheet-card { width: 100% !important; margin: 0 !important; }

                    thead { display: table-header-group !important; }
                    tbody, tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SIDEBAR SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const KitabSelect = ({ value, onChange }) => (
    <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">বিষয়ের খাতা</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer"
        >
            {KITAB_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                    {opt.label}
                </option>
            ))}
        </select>
    </div>
);

const PreviewInfo = ({ count, days, subjects }) => (
    <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <span className="text-sm font-bold text-slate-800 truncate">হাজিরা খাতা প্রিভিউ</span>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5 shrink-0">
            {bn(count)} জন
        </span>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 shrink-0">
            {bn(days)} দিন
        </span>
        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5 shrink-0">
            {bn(subjects)} বিষয়
        </span>
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

const PrintSettings = ({
    colorMode, onColorChange,
    orientation, onOrientationChange,
    pageSize, onPageSizeChange,
    daysCount, onDaysChange,
}) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
        <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 leading-tight">প্রিন্ট সেটিং</p>
        </div>

        <SegmentedControl label="১. পেজ দিক (Orientation)" options={ORIENTATION_OPTIONS} value={orientation} onChange={onOrientationChange} />
        <SegmentedControl label="২. পেজ সাইজ (Page Size)" options={PAGE_SIZE_OPTIONS} value={pageSize} onChange={onPageSizeChange} />
        {/* <SegmentedControl label="৩. রঙ" options={COLOR_OPTIONS} value={colorMode} onChange={onColorChange} /> */}
        <SegmentedControl label="মাসের দিন সংখ্যা" options={DAYS_OPTIONS} value={daysCount} onChange={onDaysChange} />

        <p className="text-[10px] text-slate-400 leading-snug">
            Portrait-এ ৩১ দিনের কলাম সরু হবে, বেশি দিন হলে Landscape ব্যবহার করুন।
        </p>
    </div>
);

const ColumnSelector = ({ value, onToggle, onSetAll, columns = ATTENDANCE_COLUMNS }) => {
    const checkedCount = columns.filter((c) => value[c.key]).length;
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-xs font-bold text-slate-700 leading-tight">কলাম নির্বাচন</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {checkedCount}/{columns.length} টি নির্বাচিত
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onSetAll(true)}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                        সব
                    </button>
                    <button type="button" onClick={() => onSetAll(false)}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200">
                        কিছুই না
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