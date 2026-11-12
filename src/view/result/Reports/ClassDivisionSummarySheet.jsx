import { useMemo, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Buffer } from "buffer";
import Chart from "react-apexcharts";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   LANGUAGE
   languageId (Redux: state.auth.resultLanguageId)
   1 = বাংলা, 2 = العربية, 3 = English
   ═══════════════════════════════════════════════════════════ */
export const DEFAULT_LANGUAGE = "bn";
const LANGUAGE_ID_MAP = { 1: "bn", 2: "ar", 3: "en" };

const TRANSLATIONS = {
  bn: {
    sl: "ক্রমিক",
    className: "শ্রেণি",
    totalAdmission: "মোট ভর্তি",
    totalExaminees: "মোট পরীক্ষার্থী",
    passRate: "পাসের হার",
    grandTotal: "সর্বমোট",
    date: "তারিখ",
    page: (a, b) => `পৃষ্ঠা ${a} / ${b}`,
    total: "মোট",
    chartClassTitle: "শ্রেণিভিত্তিক মোট শিক্ষার্থী",
    chartClassSub: "প্রতি ক্লাসের মোট",
    chartDivisionTitle: "বিভাগভিত্তিক সারসংক্ষেপ",
    chartDivisionSub: "সব শ্রেণির সম্মিলিত সংখ্যা",
    chartStackedTitle: "বিভাগ অনুযায়ী শ্রেণির তুলনা",
    chartStackedSub: "স্ট্যাকড বার চার্ট",
    noData: "কোনো ডেটা পাওয়া যায়নি।",
  },
  en: {
    sl: "SL",
    className: "Class",
    totalAdmission: "Total Admission",
    totalExaminees: "Total Examinees",
    passRate: "Pass Rate",
    grandTotal: "Grand Total",
    date: "Date",
    page: (a, b) => `Page ${a} / ${b}`,
    total: "Total",
    chartClassTitle: "Total Students by Class",
    chartClassSub: "Total of each class",
    chartDivisionTitle: "Division-wise Summary",
    chartDivisionSub: "Combined count of all classes",
    chartStackedTitle: "Class Comparison by Division",
    chartStackedSub: "Stacked bar chart",
    noData: "No data found.",
  },
  ar: {
    sl: "م",
    className: "الصف",
    totalAdmission: "إجمالي القبول",
    totalExaminees: "إجمالي الممتحنين",
    passRate: "نسبة النجاح",
    grandTotal: "المجموع الكلي",
    date: "التاريخ",
    page: (a, b) => `صفحة ${a} / ${b}`,
    total: "المجموع",
    chartClassTitle: "إجمالي الطلاب حسب الصف",
    chartClassSub: "مجموع كل صف",
    chartDivisionTitle: "ملخص حسب التقدير",
    chartDivisionSub: "العدد الإجمالي لجميع الصفوف",
    chartStackedTitle: "مقارنة الصفوف حسب التقدير",
    chartStackedSub: "مخطط أعمدة مكدسة",
    noData: "لم يتم العثور على بيانات.",
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

const pickText = (...values) => {
  const found = values.find((v) => typeof v === "string" && v.trim() !== "");
  return found ? found.trim() : "";
};

const pickByLang = (lang, bnVal, enVal, arVal) => {
  if (lang === "ar") return pickText(arVal, bnVal, enVal);
  if (lang === "en") return pickText(enVal, bnVal, arVal);
  return pickText(bnVal, enVal, arVal);
};

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const toDataUrl = (field) => {
  if (!field?.data) return null;
  const buf = Buffer.from(field.data);
  return `data:image/png;base64,${buf.toString("base64")}`;
};

const formatRate = (rate) => {
  const n = Number(rate) || 0;
  return n > 0 ? n.toFixed(2) : "0.00";
};

/* ═══════════════════════════════════════════════════════════
   A4 LANDSCAPE LAYOUT
   ═══════════════════════════════════════════════════════════ */
const PAGE_W = 1080;
const PAGE_H = 750;
const PRINT_PAGE_H = 740;
const HEADER_H = 130;
const HEADER_GAP = 6;
const THEAD_H = 52;
const ROW_H = 28;
const SIGNATURE_H = 130;
const FOOTER_RESERVE = 20;
const SAFETY = 8;

/* ── প্রিন্ট: A4 landscape, margin 5mm ── */
const PRINT_MARGIN_MM = 5;
const PX_PER_MM = 96 / 25.4;
const PRINT_AREA_W_MM = 297 - PRINT_MARGIN_MM * 2;
const PRINT_SCALE = ((PRINT_AREA_W_MM * PX_PER_MM) / PAGE_W) * 0.99;
const PRINT_OUT_W = Math.floor(PAGE_W * PRINT_SCALE);
const PRINT_OUT_H = Math.floor(PRINT_PAGE_H * PRINT_SCALE);

const COL = {
  sl: 40,
  cls: 200,
  total: 80,
  admission: 64,
  rate: 70,
};

const BORDER = "1px solid #000";

const CHART_COLORS = [
  "#176b57", "#c49b48", "#478bb4", "#8b72b0",
  "#d16e5c", "#779b8b", "#b3beb7", "#e08a3c",
  "#2f8f9d", "#a05a8c", "#6b8e23", "#cd5c5c",
  "#4682b4", "#b8860b", "#708090", "#9c6b3f",
];

/* ── চার্ট পেজ (এক সারিতে ২টি চার্ট) ── */
const CHART_HEADER_H = 92;
const CHART_GAP = 16;
const CHART_CARD_W = Math.floor((PAGE_W - CHART_GAP) / 2);
const CHART_CARD_H = PAGE_H - CHART_HEADER_H - HEADER_GAP - FOOTER_RESERVE - SAFETY - 10;
const CHART_TITLE_H = 46;
const CHART_PAD = 12;
const CHART_INNER_W = CHART_CARD_W - CHART_PAD * 2 - 2;
const CHART_INNER_H = CHART_CARD_H - CHART_TITLE_H - CHART_PAD * 2 - 2;

const DONUT_LEGEND_H = 96;
const DONUT_AREA_H = CHART_INNER_H - DONUT_LEGEND_H;
const DONUT_SIZE = Math.min(DONUT_AREA_H, CHART_INNER_W) - 4;

/* ═══════════════════════════════════════════════════════════
   DISTRIBUTED COLUMNS (pure HTML/CSS — প্রিন্টে)
   ═══════════════════════════════════════════════════════════ */
function PrintDistributedColumns({ labels, totals, width, height, num }) {
  const AXIS_W = 36;
  const TOP_PAD = 26;
  const LABEL_H = 130;

  const n = Math.max(labels.length, 1);
  const max = Math.max(1, ...totals);
  const step = Math.max(1, Math.ceil(max / 5));
  const axisMax = step * Math.ceil(max / step);
  const ticks = [];
  for (let t = 0; t <= axisMax; t += step) ticks.push(t);

  const plotW = width - AXIS_W - 8;
  const plotH = height - TOP_PAD - LABEL_H;
  const slot = plotW / n;
  const barW = Math.min(slot * 0.6, 110);

  return (
    <div dir="ltr" style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
      {ticks.map((t) => {
        const y = TOP_PAD + plotH - (t / axisMax) * plotH;
        return (
          <div key={`t-${t}`}>
            <div style={{
              position: "absolute", left: `${AXIS_W}px`, top: `${y}px`,
              width: `${plotW}px`, height: "1px", background: t === 0 ? "#94a3b8" : "#e5e7eb",
            }} />
            <div style={{
              position: "absolute", left: 0, top: `${y - 8}px`, width: `${AXIS_W - 6}px`,
              textAlign: "right", fontSize: "12px", color: "#475569",
            }}>
              {num(t)}
            </div>
          </div>
        );
      })}

      {totals.map((v, i) => {
        const h = (Number(v) / axisMax) * plotH;
        const left = AXIS_W + i * slot + (slot - barW) / 2;
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return (
          <div key={`c-${i}`}>
            <div style={{
              position: "absolute", left: `${left}px`,
              top: `${TOP_PAD + plotH - h}px`,
              width: `${barW}px`, height: `${Math.max(h, 0)}px`,
              background: color, borderRadius: "4px 4px 0 0",
            }} />
            <div style={{
              position: "absolute", left: `${left}px`, width: `${barW}px`,
              top: `${TOP_PAD + plotH - h - 20}px`,
              textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#000",
            }}>
              {num(v)}
            </div>

            <div style={{
              position: "absolute", left: `${AXIS_W + i * slot}px`, width: `${slot}px`,
              top: `${TOP_PAD + plotH + 6}px`, height: `${LABEL_H - 8}px`,
              display: "flex", justifyContent: "center", alignItems: "flex-start",
              overflow: "hidden",
            }}>
              <span style={{
                writingMode: "vertical-rl",
                maxHeight: `${LABEL_H - 8}px`,
                fontSize: "11px", lineHeight: 1.2, color: "#000",
                textAlign: "left", overflow: "hidden",
              }}>
                {labels[i]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DONUT (pure SVG — প্রিন্টে সবসময় ঠিকমতো আঁকে)
   ═══════════════════════════════════════════════════════════ */
function PrintDonut({ values, colors, size, num, totalLabel }) {
  const total = values.reduce((a, b) => a + (Number(b) || 0), 0);
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 6;
  const inner = outer * 0.58;
  const r = (outer + inner) / 2;
  const sw = outer - inner;
  const C = 2 * Math.PI * r;

  let acc = 0;
  const slices = values.map((raw, i) => {
    const v = Number(raw) || 0;
    const frac = total ? v / total : 0;
    const len = frac * C;
    const start = acc;
    acc += len;
    const midAngle = ((start + len / 2) / C) * 2 * Math.PI - Math.PI / 2;
    return {
      i, v, frac, len, start,
      lx: cx + r * Math.cos(midAngle),
      ly: cy + r * Math.sin(midAngle),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {slices.map((s) =>
        s.len > 0 ? (
          <circle
            key={`s-${s.i}`}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={colors[s.i % colors.length]}
            strokeWidth={sw}
            strokeDasharray={`${s.frac >= 0.999 ? s.len : Math.max(s.len - 1.5, 0)} ${C}`}
            strokeDashoffset={-s.start}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ) : null
      )}

      {slices.map((s) =>
        s.len > 0 ? (
          <text
            key={`t-${s.i}`}
            x={s.lx} y={s.ly}
            textAnchor="middle" dominantBaseline="central"
            fontSize="13" fontWeight="700" fill="#fff"
            style={{ fontFamily: "inherit" }}
          >
            {num(s.v)}
          </text>
        ) : null
      )}

      <text
        x={cx} y={cy - 14}
        textAnchor="middle" dominantBaseline="central"
        fontSize="16" fill="#444" style={{ fontFamily: "inherit" }}
      >
        {totalLabel}
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle" dominantBaseline="central"
        fontSize="26" fontWeight="700" fill="#222" style={{ fontFamily: "inherit" }}
      >
        {num(total)}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function ClassDivisionSummarySheet({ reportData }) {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);
  const [najem, setNajem] = useState(null);
  const printRef = useRef(null);

  // ✅ ভাষা Redux slice থেকে আসে (ResultReport এর Language dropdown এটা সেট করে)
  const languageId = useSelector((state) => state.auth.resultLanguageId);
  const lang = LANGUAGE_ID_MAP[Number(languageId)] || DEFAULT_LANGUAGE;

  const t = { ...TRANSLATIONS.bn, ...(TRANSLATIONS[lang] || {}) };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const num = useMemo(() => makeNum(lang), [lang]);

  // Apex চার্টের সংখ্যা ফরম্যাটার
  const numFmt = (v) => {
    if (v === null || v === undefined || String(v).trim() === "") return v;
    const n = Number(v);
    return Number.isFinite(n) ? num(Math.round(n * 100) / 100) : v;
  };

  useEffect(() => {
    setLogo(toDataUrl(institutionInfo?.Logo ?? institutionInfo?.InstitutionLogo));
    setNajem(toDataUrl(institutionInfo?.SignatureNajem));
  }, [institutionInfo]);

  const institutionName = pickByLang(
    lang,
    institutionInfo?.InstitutionName,
    institutionInfo?.EngInstitutionName,
    institutionInfo?.AraInstitutionName
  );
  const institutionAddress = pickByLang(
    lang,
    institutionInfo?.Address,
    institutionInfo?.EngAddress,
    institutionInfo?.AraAddress
  );

  const rawDivisions = Array.isArray(reportData?.divisions) ? reportData.divisions : [];
  const rows = Array.isArray(reportData?.rows) ? reportData.rows : [];
  const totalsData = reportData?.totals || {};

  // ✅ ভাষা অনুযায়ী ডিভিশনের নাম (id/counts আগের মতোই)
  const divisions = useMemo(
    () =>
      rawDivisions.map((d) => ({
        ...d,
        label: pickByLang(lang, d.name, d.nameEn, d.nameAr),
      })),
    [rawDivisions, lang]
  );

  const classLabel = (r) =>
    pickByLang(lang, r.sessionWithClass, r.sessionWithClassEn, r.sessionWithClassAr);

  const examName = pickByLang(lang, reportData?.examName, reportData?.examNameEn, reportData?.examNameAr);
  const sessionNameRaw = pickByLang(
    lang,
    reportData?.sessionName,
    reportData?.sessionNameEn,
    reportData?.sessionNameAr
  );
  const sessionName = lang === "ar" ? num(sessionNameRaw) : sessionNameRaw;

  const getToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return num(`${dd}/${mm}/${yyyy}`);
  };
  const dateText = getToday();

  const rowTotal = (r) =>
    r.totalExaminees != null
      ? Number(r.totalExaminees) || 0
      : divisions.reduce((s, d) => s + (Number(r.counts?.[d.id]) || 0), 0);

  const colTotals = useMemo(() => {
    const map = {};
    divisions.forEach((d) => {
      map[d.id] = rows.reduce((s, r) => s + (Number(r.counts?.[d.id]) || 0), 0);
    });
    return map;
  }, [rows, divisions]);

  const grandTotal = useMemo(
    () => rows.reduce((s, r) => s + rowTotal(r), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, divisions]
  );

  const chartData = useMemo(() => {
    const labels = rows.map((r) => classLabel(r));
    const totals = rows.map((r) => rowTotal(r));
    const divisionTotals = divisions.map((d) => colTotals[d.id] || 0);
    const stacked = divisions.map((d) => ({
      name: d.label,
      data: rows.map((r) => Number(r.counts?.[d.id]) || 0),
    }));
    return { labels, totals, divisionTotals, stacked };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, divisions, colTotals, lang]);

  /* ── pagination (টেবিল পেজ) ── */
  const pages = useMemo(() => {
    const n = rows.length;
    if (!n) return [[]];

    const capNoSig = (isFirst) =>
      Math.max(1, Math.floor(
        (PAGE_H - (isFirst ? HEADER_H + HEADER_GAP : 0) - THEAD_H - FOOTER_RESERVE - SAFETY) / ROW_H
      ));
    const capWithSig = (isFirst) =>
      Math.max(1, Math.floor(
        (PAGE_H - (isFirst ? HEADER_H + HEADER_GAP : 0) - THEAD_H - SIGNATURE_H - FOOTER_RESERVE - SAFETY) / ROW_H
      ));

    const chunks = [];
    let i = 0;
    while (i < n) {
      const isFirst = chunks.length === 0;
      const remaining = n - i;
      if (remaining <= capWithSig(isFirst)) {
        chunks.push(rows.slice(i));
        break;
      }
      const take = Math.min(capNoSig(isFirst), remaining - 1);
      chunks.push(rows.slice(i, i + take));
      i += take;
    }
    return chunks;
  }, [rows]);

  const totalPages = pages.length + 1;

  /* ── styles ── */
  const th = {
    border: BORDER, padding: "2px 2px", textAlign: "center", verticalAlign: "middle",
    fontSize: "11px", fontWeight: 500, color: "#000", height: `${THEAD_H}px`,
    lineHeight: 1.2, overflow: "hidden", whiteSpace: "normal",
    wordBreak: "break-word", backgroundColor: "#fff",
  };
  const td = {
    border: BORDER, padding: "0 4px", textAlign: "center", verticalAlign: "middle",
    fontSize: "13px", height: `${ROW_H}px`, lineHeight: `${ROW_H - 2}px`,
    overflow: "hidden", whiteSpace: "nowrap", color: "#000", backgroundColor: "#fff",
  };

  const renderHeader = () => (
    <div style={{
      position: "relative", height: `${HEADER_H}px`, boxSizing: "border-box",
      marginBottom: `${HEADER_GAP}px`, textAlign: "center", overflow: "hidden",
    }}>
      {logo && (
        <img
          src={logo}
          alt="logo"
          style={{
            position: "absolute", insetInlineStart: "14px", top: "6px",
            height: "100px", width: "100px", objectFit: "contain",
          }}
        />
      )}
      <div style={{ paddingTop: "8px" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, lineHeight: 1.3, color: "#000" }}>
          {institutionName}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "#000" }}>
          {institutionAddress}
        </p>
        <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 600, color: "#000" }}>
          {examName} - {sessionName}
        </p>
      </div>
    </div>
  );

  const renderColGroup = () => (
    <colgroup>
      <col style={{ width: `${COL.sl}px` }} />
      <col style={{ width: `${COL.cls}px` }} />
      <col style={{ width: `${COL.admission}px` }} />
      <col style={{ width: `${COL.total}px` }} />
      {divisions.map((d) => <col key={d.id} />)}
      <col style={{ width: `${COL.rate}px` }} />
    </colgroup>
  );

  const renderTableHead = () => (
    <thead>
      <tr style={{ height: `${THEAD_H}px` }}>
        <th style={th}>{t.sl}</th>
        <th style={{ ...th, textAlign: "start", paddingInlineStart: "8px" }}>{t.className}</th>
        <th style={th}>{t.totalAdmission}</th>
        <th style={th}>{t.totalExaminees}</th>
        {divisions.map((d) => <th key={d.id} style={th}>{d.label}</th>)}
        <th style={th}>{t.passRate}</th>
      </tr>
    </thead>
  );

  const renderRow = (r, globalIndex) => {
    const admission = Number(r.admissionCount) || 0;
    const rate = formatRate(r.passRate);

    return (
      <tr key={r.id ?? globalIndex} style={{ height: `${ROW_H}px` }}>
        <td style={td}>{num(globalIndex + 1)}</td>
        <td style={{
          ...td, textAlign: "start", paddingInlineStart: "6px",
          fontWeight: 600, textOverflow: "ellipsis",
        }}>
          {classLabel(r)}
        </td>
        <td style={{ ...td, fontWeight: 700 }}>{num(admission)}</td>
        <td style={{ ...td, fontWeight: 700 }}>{num(rowTotal(r))}</td>
        {divisions.map((d) => (
          <td key={d.id} style={td}>{num(Number(r.counts?.[d.id]) || 0)}</td>
        ))}
        <td style={{ ...td, fontWeight: 700 }}>{num(rate)}%</td>
      </tr>
    );
  };

  const renderFooterRow = () => (
    <tfoot>
      <tr style={{ height: `${ROW_H}px`, backgroundColor: "#eef5f0" }}>
        <td style={{ ...td, fontWeight: 800 }} colSpan={2}>
          {t.grandTotal}
        </td>
        <td style={{ ...td, fontWeight: 800 }}>{num(totalsData.admissionCount || 0)}</td>
        <td style={{ ...td, fontWeight: 800 }}>{num(grandTotal)}</td>
        {divisions.map((d) => (
          <td key={d.id} style={{ ...td, fontWeight: 700 }}>
            {num(totalsData.divisionTotals?.[d.id] || colTotals[d.id] || 0)}
          </td>
        ))}
        <td style={{ ...td, fontWeight: 800 }}>{num(formatRate(totalsData.overallPassRate))}%</td>
      </tr>
    </tfoot>
  );

  const renderSignature = () => (
    <div className="signature-section" style={{
      height: `${SIGNATURE_H}px`, boxSizing: "border-box", overflow: "hidden",
      display: "flex", justifyContent: "flex-end", alignItems: "flex-end",
      paddingTop: "10px", paddingInlineEnd: "40px",
    }}>
      <div style={{ width: "260px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ height: "56px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          {najem && (
            <img src={najem} alt="signature" style={{
              maxHeight: "56px", maxWidth: "150px", objectFit: "contain",
              mixBlendMode: "multiply", userSelect: "none", pointerEvents: "none",
            }} />
          )}
        </div>
        <div style={{ width: "100%", borderTop: "1px dashed #000", margin: "2px 0 3px" }} />
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#000" }}>
          {institutionInfo?.NajemName}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 600, color: "#000" }}>
          {t.date} : {dateText}
        </p>
      </div>
    </div>
  );

  const renderPageFooter = (pageNumber) => (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: "2px",
      textAlign: "center", fontSize: "10px", color: "#404040",
    }}>
      {t.page(num(pageNumber), num(totalPages))}
    </div>
  );

  const renderPage = (pageIndex, pageRows, pageNumber) => {
    const isFirst = pageIndex === 0;
    const isLast = pageIndex === pages.length - 1;
    const offset = pages.slice(0, pageIndex).reduce((s, c) => s + c.length, 0);

    return (
      <>
        {isFirst && renderHeader()}
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          {renderColGroup()}
          {renderTableHead()}
          <tbody>{pageRows.map((r, i) => renderRow(r, offset + i))}</tbody>
          {isLast && renderFooterRow()}
        </table>
        {isLast && renderSignature()}
        {renderPageFooter(pageNumber)}
      </>
    );
  };

  const pageBox = {
    position: "relative", width: `${PAGE_W}px`, height: `${PAGE_H}px`,
    boxSizing: "border-box", overflow: "hidden", background: "#fff", margin: "0 auto",
  };

  const printPageBox = {
    ...pageBox,
    margin: 0,
    height: `${PRINT_PAGE_H}px`,
    transform: `scale(${PRINT_SCALE})`,
    transformOrigin: "top left",
  };

  /* প্রতিটি প্রিন্ট পেজ: স্কেল করা আউটার বক্স (margin: 0 auto → সেন্টার) */
  const renderPrintPage = (key, isLastPrintPage, content) => (
    <div
      key={key}
      className="print-page-outer"
      style={{
        width: `${PRINT_OUT_W}px`,
        height: `${PRINT_OUT_H}px`,
        overflow: "hidden",
        margin: "0 auto",
        padding: 0,
        pageBreakAfter: isLastPrintPage ? "auto" : "always",
        breakAfter: isLastPrintPage ? "auto" : "page",
        pageBreakInside: "avoid",
        breakInside: "avoid",
      }}
    >
      <div className="print-page" dir={dir} style={printPageBox}>
        {content}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     APEX CHART OPTIONS (স্ক্রিনের বড় চার্টগুলোর জন্য)
     ═══════════════════════════════════════════════════════════ */
  const commonChart = {
    toolbar: { show: false },
    fontFamily: "inherit",
    animations: { enabled: true, speed: 500 },
  };

  const totalBarOptions = {
    chart: { ...commonChart, type: "bar" },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, barHeight: "60%", distributed: true },
    },
    colors: CHART_COLORS,
    legend: { show: false },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.labels,
      labels: { style: { fontSize: "11px" }, formatter: numFmt },
    },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    grid: { borderColor: "#eef1ee" },
    tooltip: { theme: "light", y: { formatter: numFmt } },
  };

  const donutOptions = {
    chart: { ...commonChart, type: "donut" },
    labels: divisions.map((d) => d.label),
    colors: CHART_COLORS,
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: {
      enabled: true,
      style: { fontSize: "11px" },
      formatter: (val) => `${num(Number(val).toFixed(1))}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "58%",
          labels: {
            show: true,
            value: { formatter: numFmt },
            total: {
              show: true,
              label: t.total,
              formatter: (w) =>
                num(w.globals.seriesTotals.reduce((a, b) => a + b, 0)),
            },
          },
        },
      },
    },
    tooltip: { theme: "light", y: { formatter: numFmt } },
  };

  const stackedOptions = {
    chart: { ...commonChart, type: "bar", stacked: true },
    plotOptions: { bar: { horizontal: false, borderRadius: 2, columnWidth: "55%" } },
    colors: CHART_COLORS,
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartData.labels,
      labels: { rotate: -45, style: { fontSize: "10px" } },
    },
    yaxis: { labels: { style: { fontSize: "11px" }, formatter: numFmt } },
    legend: { position: "bottom", fontSize: "12px" },
    grid: { borderColor: "#eef1ee" },
    tooltip: { theme: "light", y: { formatter: numFmt } },
  };

  /* ── প্রিন্টের জন্য চার্ট পেজ ── */
  const chartCard = {
    width: `${CHART_CARD_W}px`, height: `${CHART_CARD_H}px`,
    boxSizing: "border-box", border: "1px solid #000", borderRadius: "8px",
    padding: `${CHART_PAD}px`, overflow: "hidden", background: "#fff",
    flexShrink: 0,
  };

  const renderChartHeader = () => (
    <div style={{
      height: `${CHART_HEADER_H}px`, boxSizing: "border-box",
      marginBottom: `${HEADER_GAP}px`, textAlign: "center", overflow: "hidden",
      borderBottom: "2px solid #000", paddingTop: "6px",
    }}>
      <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: 1.3, color: "#000" }}>
        {institutionName}
      </h1>
      <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#000" }}>
        {examName} - {sessionName}
      </p>
    </div>
  );

  const renderChartPage = (pageNumber) => (
    <>
      {renderChartHeader()}

      <div style={{
        display: "flex", flexDirection: "row", alignItems: "flex-start",
        justifyContent: "space-between", gap: `${CHART_GAP}px`, marginTop: "6px",
      }}>
        <div style={chartCard}>
          <div style={{ height: `${CHART_TITLE_H}px`, overflow: "hidden" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#155b49" }}>
              {t.chartClassTitle}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>{t.chartClassSub}</p>
          </div>

          <PrintDistributedColumns
            labels={chartData.labels}
            totals={chartData.totals}
            width={CHART_INNER_W}
            height={CHART_INNER_H}
            num={num}
          />
        </div>

        <div style={chartCard}>
          <div style={{ height: `${CHART_TITLE_H}px`, overflow: "hidden" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#155b49" }}>
              {t.chartDivisionTitle}
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>{t.chartDivisionSub}</p>
          </div>

          <div dir="ltr" style={{
            width: `${CHART_INNER_W}px`, height: `${DONUT_AREA_H}px`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <PrintDonut
              values={chartData.divisionTotals}
              colors={CHART_COLORS}
              size={DONUT_SIZE}
              num={num}
              totalLabel={t.total}
            />
          </div>

          <div style={{
            width: `${CHART_INNER_W}px`, height: `${DONUT_LEGEND_H}px`,
            display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
            gap: "6px 14px", overflow: "hidden", paddingTop: "6px", boxSizing: "border-box",
          }}>
            {divisions.map((d, i) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: "5px",
                fontSize: "12px", color: "#000",
              }}>
                <span style={{
                  width: "11px", height: "11px", borderRadius: "50%",
                  background: CHART_COLORS[i % CHART_COLORS.length],
                  display: "inline-block", flexShrink: 0,
                }} />
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderPageFooter(pageNumber)}
    </>
  );

  if (!rows.length) {
    return (
      <div className="w-full p-6 text-center text-slate-500 text-sm">
        {t.noData}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── CHARTS (স্ক্রিনে Full Width; প্রিন্টে লুকানো) ── */}
      <div className="no-print w-full mb-6" dir={dir}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
            <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">{t.chartClassTitle}</h3>
            <p className="m-0 mb-3 text-xs text-[#718078]">{t.chartClassSub}</p>
            <Chart
              key={`bar-${lang}`}
              options={totalBarOptions}
              series={[{ name: t.total, data: chartData.totals }]}
              type="bar"
              height={340}
            />
          </div>

          <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
            <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">{t.chartDivisionTitle}</h3>
            <p className="m-0 mb-3 text-xs text-[#718078]">{t.chartDivisionSub}</p>
            <Chart
              key={`donut-${lang}`}
              options={donutOptions}
              series={chartData.divisionTotals}
              type="donut"
              height={340}
            />
          </div>
        </div>

        <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
          <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">{t.chartStackedTitle}</h3>
          <p className="m-0 mb-3 text-xs text-[#718078]">{t.chartStackedSub}</p>
          <Chart
            key={`stacked-${lang}`}
            options={stackedOptions}
            series={chartData.stacked}
            type="bar"
            height={380}
          />
        </div>
      </div>

      {/* ── PRINTABLE SHEET ── */}
      <div className="result-sheet-wrapper w-full" ref={printRef}>
        {/* স্ক্রিন প্রিভিউ: শুধু টেবিল পেজ */}
        <div className="no-print">
          <ScaledPreview designWidth={PAGE_W}>
            {pages.map((pageRows, pageIndex) => (
              <div key={pageIndex} dir={dir} style={{
                ...pageBox,
                boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                marginBottom: "24px",
              }}>
                {renderPage(pageIndex, pageRows, pageIndex + 1)}
              </div>
            ))}
          </ScaledPreview>
        </div>

        {/* প্রিন্ট: চার্ট পেজ → টেবিল পেজ (সব পেজ মাঝখানে) */}
        <div className="print-only">
          {renderPrintPage("chart", false, renderChartPage(1))}

          {pages.map((pageRows, pageIndex) =>
            renderPrintPage(
              `t-${pageIndex}`,
              pageIndex === pages.length - 1,
              renderPage(pageIndex, pageRows, pageIndex + 2)
            )
          )}
        </div>
      </div>

      <style>{`
        .print-only {
          height: 0; overflow: hidden; position: absolute;
          left: -10000px; top: 0; width: ${PAGE_W}px; pointer-events: none;
        }
        @media print {
          @page { size: A4 landscape; margin: ${PRINT_MARGIN_MM}mm; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            width: auto !important;
            height: auto !important; min-height: 0 !important;
            overflow: visible !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }

          .result-sheet-wrapper {
            height: auto !important; min-height: 0 !important;
            margin: 0 !important; padding: 0 !important;
          }
          .print-only {
            position: static !important; left: auto !important;
            height: auto !important; overflow: visible !important;
            width: 100% !important; display: block !important;
            margin: 0 !important; padding: 0 !important;
          }
          .print-page-outer {
            box-sizing: border-box;
            display: block !important;
            margin: 0 auto !important;
          }

          tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}

