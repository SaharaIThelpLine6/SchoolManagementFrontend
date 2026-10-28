import { useMemo, useState, useEffect, useRef } from "react";
import { Buffer } from "buffer";
import Chart from "react-apexcharts";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */
const bn = (v) => bnBijoy2Unicode(String(v ?? ""));

const getTodayBangla = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return bnBijoy2Unicode(`${dd}/${mm}/${yyyy}`);
};

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
const THEAD_H = 28;
const ROW_H = 28;
const SIGNATURE_H = 130;
const FOOTER_RESERVE = 20;
const SAFETY = 8;

// ✅ মোট পরীক্ষার্থী (total) এর width 60 থেকে বাড়িয়ে 90 করা হলো
const COL = {
  sl: 40,
  cls: 240,
  total: 90,
  admission: 72,
  rate: 80,
};

const BORDER = "1px solid #000";

const CHART_COLORS = [
  "#176b57", "#c49b48", "#478bb4", "#8b72b0",
  "#d16e5c", "#779b8b", "#b3beb7", "#e08a3c",
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

/* ── ডোনাট: pure SVG + আলাদা HTML legend ── */
const DONUT_LEGEND_H = 64;
const DONUT_AREA_H = CHART_INNER_H - DONUT_LEGEND_H;
const DONUT_SIZE = Math.min(DONUT_AREA_H, CHART_INNER_W) - 4;

/* ═══════════════════════════════════════════════════════════
   ROW CHART (pure HTML/CSS — স্ক্রিন প্রিভিউ)
   ═══════════════════════════════════════════════════════════ */
const PRINT_LABEL_W = 190;
const PRINT_AXIS_H = 26;
const PRINT_VALUE_PAD = 34;
const PRINT_MAX_ROW_H = 80;

function PrintBarChart({ labels, totals, width, height }) {
  const n = labels.length;
  const max = Math.max(1, ...totals);
  const step = Math.max(1, Math.ceil(max / 5));
  const axisMax = step * Math.ceil(max / step);

  const ticks = [];
  for (let t = 0; t <= axisMax; t += step) ticks.push(t);

  const plotAreaH = height - PRINT_AXIS_H;
  const rowH = Math.min(PRINT_MAX_ROW_H, plotAreaH / Math.max(n, 1));
  const barH = Math.max(10, Math.round(rowH * 0.6));
  const rowsH = rowH * n;

  const plotW = width - PRINT_LABEL_W - PRINT_VALUE_PAD - 6;

  return (
    <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
      {labels.map((label, i) => (
        <div
          key={`l-${i}`}
          style={{
            position: "absolute", left: 0, top: `${i * rowH}px`,
            width: `${PRINT_LABEL_W - 10}px`, height: `${rowH}px`,
            display: "flex", alignItems: "center", justifyContent: "flex-end",
            textAlign: "right", fontSize: "12px", lineHeight: 1.25,
            color: "#000", wordBreak: "break-word", overflow: "hidden",
          }}
        >
          {label}
        </div>
      ))}

      {ticks.map((t) => {
        const x = PRINT_LABEL_W + (t / axisMax) * plotW;
        return (
          <div key={`t-${t}`}>
            <div style={{
              position: "absolute", left: `${x}px`, top: 0,
              width: "1px", height: `${rowsH}px`, background: "#e5e7eb",
            }} />
            <div style={{
              position: "absolute", left: `${x - 20}px`, top: `${rowsH + 4}px`,
              width: "40px", textAlign: "center", fontSize: "11px", color: "#475569",
            }}>
              {bn(t)}
            </div>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: `${PRINT_LABEL_W}px`, top: `${rowsH}px`,
        width: `${plotW}px`, height: "1px", background: "#cbd5e1",
      }} />

      {totals.map((v, i) => {
        const w = (Number(v) / axisMax) * plotW;
        return (
          <div key={`b-${i}`}>
            <div style={{
              position: "absolute",
              left: `${PRINT_LABEL_W}px`,
              top: `${i * rowH + (rowH - barH) / 2}px`,
              width: `${Math.max(w, 0)}px`, height: `${barH}px`,
              background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: "0 3px 3px 0",
            }} />
            <div style={{
              position: "absolute",
              left: `${PRINT_LABEL_W + Math.max(w, 0) + 6}px`,
              top: `${i * rowH}px`, height: `${rowH}px`,
              display: "flex", alignItems: "center",
              fontSize: "12px", fontWeight: 700, color: "#000",
            }}>
              {bn(v)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DISTRIBUTED COLUMNS (pure HTML/CSS — প্রিন্টে)
   ═══════════════════════════════════════════════════════════ */
function PrintDistributedColumns({ labels, totals, width, height }) {
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
    <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
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
              {bn(t)}
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
              {bn(v)}
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
function PrintDonut({ values, colors, size }) {
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
            {bn(s.v)}
          </text>
        ) : null
      )}

      <text
        x={cx} y={cy - 14}
        textAnchor="middle" dominantBaseline="central"
        fontSize="16" fill="#444" style={{ fontFamily: "inherit" }}
      >
        মোট
      </text>
      <text
        x={cx} y={cy + 14}
        textAnchor="middle" dominantBaseline="central"
        fontSize="26" fontWeight="700" fill="#222" style={{ fontFamily: "inherit" }}
      >
        {bn(total)}
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

  useEffect(() => {
    setLogo(toDataUrl(institutionInfo?.Logo ?? institutionInfo?.InstitutionLogo));
    setNajem(toDataUrl(institutionInfo?.SignatureNajem));
  }, [institutionInfo]);

  const divisions = Array.isArray(reportData?.divisions) ? reportData.divisions : [];
  const rows = Array.isArray(reportData?.rows) ? reportData.rows : [];
  const totalsData = reportData?.totals || {};

  const examName = reportData?.examName ?? "";
  const sessionName = reportData?.sessionName ?? "";
  const dateBangla = getTodayBangla();

  /* ── per-row & per-column totals ── */
  const rowTotal = (r) =>
    divisions.reduce((s, d) => s + (Number(r.counts?.[d.id]) || 0), 0);

  const colTotals = useMemo(() => {
    const map = {};
    divisions.forEach((d) => {
      map[d.id] = rows.reduce((s, r) => s + (Number(r.counts?.[d.id]) || 0), 0);
    });
    return map;
  }, [rows, divisions]);

  const grandTotal = useMemo(
    () => rows.reduce((s, r) => s + rowTotal(r), 0),
    [rows, divisions]
  );

  /* ── chart data (dynamic) ── */
  const chartData = useMemo(() => {
    const labels = rows.map((r) => r.sessionWithClass);
    const totals = rows.map((r) => rowTotal(r));
    const divisionTotals = divisions.map((d) => colTotals[d.id] || 0);
    const stacked = divisions.map((d) => ({
      name: d.name,
      data: rows.map((r) => Number(r.counts?.[d.id]) || 0),
    }));
    return { labels, totals, divisionTotals, stacked };
  }, [rows, divisions, colTotals]);

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

  // টেবিল পেজ + ১টি চার্ট পেজ (প্রিন্টের জন্য)
  const totalPages = pages.length + 1;

  /* ── styles ── */
  const th = {
    border: BORDER, padding: "2px 3px", textAlign: "center", verticalAlign: "middle",
    fontSize: "12px", fontWeight: 500, color: "#000", height: `${THEAD_H}px`,
    overflow: "hidden", whiteSpace: "nowrap", backgroundColor: "#fff",
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
            position: "absolute", left: "14px", top: "6px",
            height: "100px", width: "100px", objectFit: "contain",
          }}
        />
      )}
      <div style={{ paddingTop: "8px" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, lineHeight: 1.3, color: "#000" }}>
          {institutionInfo?.InstitutionName}
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "#000" }}>
          {institutionInfo?.Address}
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
        <th style={th}>ক্রমিক</th>
        <th style={{ ...th, textAlign: "left", paddingLeft: "8px" }}>সাব ক্লাস বাংলা</th>
        <th style={th}>মোট ভর্তি</th>
        <th style={th}>মোট পরীক্ষার্থী</th>
        {divisions.map((d) => <th key={d.id} style={th}>{d.name}</th>)}
        <th style={th}>পাসের হার</th>
      </tr>
    </thead>
  );

  const renderRow = (r, globalIndex) => {
    const admission = Number(r.admissionCount) || 0;
    const rate = formatRate(r.passRate);

    return (
      <tr key={r.id ?? globalIndex} style={{ height: `${ROW_H}px` }}>
        <td style={td}>{bn(globalIndex + 1)}</td>
        <td style={{ ...td, textAlign: "left", paddingLeft: "6px", fontWeight: 600, textOverflow: "ellipsis" }}>
          {r.sessionWithClass}
        </td>
        <td style={{ ...td, fontWeight: 700 }}>{bn(admission)}</td>
        <td style={{ ...td, fontWeight: 700 }}>{bn(rowTotal(r))}</td>
        {divisions.map((d) => (
          <td key={d.id} style={td}>{bn(Number(r.counts?.[d.id]) || 0)}</td>
        ))}
        <td style={{ ...td, fontWeight: 700 }}>{bn(rate)}%</td>
      </tr>
    );
  };

  const renderFooterRow = () => (
    <tfoot>
      <tr style={{ height: `${ROW_H}px`, backgroundColor: "#eef5f0" }}>
        <td style={{ ...td, fontWeight: 800 }} colSpan={2}>
          সর্বমোট
        </td>
        <td style={{ ...td, fontWeight: 800 }}>{bn(totalsData.admissionCount || 0)}</td>
        <td style={{ ...td, fontWeight: 800 }}>{bn(grandTotal)}</td>
        {divisions.map((d) => (
          <td key={d.id} style={{ ...td, fontWeight: 700 }}>
            {bn(totalsData.divisionTotals?.[d.id] || colTotals[d.id] || 0)}
          </td>
        ))}
        <td style={{ ...td, fontWeight: 800 }}>{bn(formatRate(totalsData.overallPassRate))}%</td>
      </tr>
    </tfoot>
  );

  const renderSignature = () => (
    <div className="signature-section" style={{
      height: `${SIGNATURE_H}px`, boxSizing: "border-box", overflow: "hidden",
      display: "flex", justifyContent: "flex-end", alignItems: "flex-end",
      paddingTop: "10px", paddingRight: "40px",
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
          তারিখ : {dateBangla}
        </p>
      </div>
    </div>
  );

  const renderPageFooter = (pageNumber) => (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: "2px",
      textAlign: "center", fontSize: "10px", color: "#404040",
    }}>
      পৃষ্ঠা {bn(pageNumber)} / {bn(totalPages)}
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
  };

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
      labels: { style: { fontSize: "11px" } },
    },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    grid: { borderColor: "#eef1ee" },
    tooltip: { theme: "light" },
  };

  const donutOptions = {
    chart: { ...commonChart, type: "donut" },
    labels: divisions.map((d) => d.name),
    colors: CHART_COLORS,
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: true, style: { fontSize: "11px" } },
    plotOptions: {
      pie: { donut: { size: "58%", labels: { show: true, total: { show: true, label: "মোট" } } } },
    },
    tooltip: { theme: "light" },
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
    yaxis: { labels: { style: { fontSize: "11px" } } },
    legend: { position: "bottom", fontSize: "12px" },
    grid: { borderColor: "#eef1ee" },
    tooltip: { theme: "light" },
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
        {institutionInfo?.InstitutionName}
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
              শ্রেণিভিত্তিক মোট শিক্ষার্থী
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>প্রতি ক্লাসের মোট</p>
          </div>

          <PrintDistributedColumns
            labels={chartData.labels}
            totals={chartData.totals}
            width={CHART_INNER_W}
            height={CHART_INNER_H}
          />
        </div>

        <div style={chartCard}>
          <div style={{ height: `${CHART_TITLE_H}px`, overflow: "hidden" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#155b49" }}>
              বিভাগভিত্তিক সারসংক্ষেপ
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>সব শ্রেণির সম্মিলিত সংখ্যা</p>
          </div>

          <div style={{
            width: `${CHART_INNER_W}px`, height: `${DONUT_AREA_H}px`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}>
            <PrintDonut
              values={chartData.divisionTotals}
              colors={CHART_COLORS}
              size={DONUT_SIZE}
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
                <span>{d.name}</span>
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
        কোনো ডেটা পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── CHARTS (স্ক্রিনে Full Width; প্রিন্টে লুকানো) ── */}
      <div className="no-print w-full mb-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
            <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">শ্রেণিভিত্তিক মোট শিক্ষার্থী</h3>
            <p className="m-0 mb-3 text-xs text-[#718078]">প্রতি ক্লাসের মোট</p>
            <Chart options={totalBarOptions} series={[{ name: "মোট", data: chartData.totals }]} type="bar" height={340} />
          </div>

          <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
            <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">বিভাগভিত্তিক সারসংক্ষেপ</h3>
            <p className="m-0 mb-3 text-xs text-[#718078]">সব শ্রেণির সম্মিলিত সংখ্যা</p>
            <Chart options={donutOptions} series={chartData.divisionTotals} type="donut" height={340} />
          </div>
        </div>

        <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
          <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">বিভাগ অনুযায়ী শ্রেণির তুলনা</h3>
          <p className="m-0 mb-3 text-xs text-[#718078]">স্ট্যাকড বার চার্ট</p>
          <Chart options={stackedOptions} series={chartData.stacked} type="bar" height={380} />
        </div>
      </div>

      {/* ── PRINTABLE SHEET ── */}
      <div className="result-sheet-wrapper w-full" ref={printRef}>
        {/* স্ক্রিন প্রিভিউ: শুধু টেবিল পেজ */}
        <div className="no-print">
          <ScaledPreview designWidth={PAGE_W}>
            {pages.map((pageRows, pageIndex) => (
              <div key={pageIndex} style={{
                ...pageBox,
                boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                marginBottom: "24px",
              }}>
                {renderPage(pageIndex, pageRows, pageIndex + 1)}
              </div>
            ))}
          </ScaledPreview>
        </div>

        {/* প্রিন্ট: চার্ট পেজ (বামে column চার্ট, ডানে ডোনাট) → টেবিল পেজ */}
        <div className="print-only">
          <div className="print-page" style={printPageBox}>
            {renderChartPage(1)}
          </div>

          {pages.map((pageRows, pageIndex) => (
            <div key={pageIndex} className="print-page" style={printPageBox}>
              {renderPage(pageIndex, pageRows, pageIndex + 2)}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .print-only {
          height: 0; overflow: hidden; position: absolute;
          left: -10000px; top: 0; width: ${PAGE_W}px; pointer-events: none;
        }
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          html, body {
            margin: 0 !important; padding: 0 !important;
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
            width: auto !important; display: block !important;
            margin: 0 !important; padding: 0 !important;
          }

          .print-page {
            break-after: page; page-break-after: always;
            break-inside: avoid; page-break-inside: avoid;
          }
          .print-page:last-child {
            break-after: auto !important; page-break-after: auto !important;
          }

          tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}
// import { useMemo, useState, useEffect, useRef } from "react";
// import { Buffer } from "buffer";
// import Chart from "react-apexcharts";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import bnBijoy2Unicode from "../../../utils/conveter";
// import ScaledPreview from "../../../components/ScaledPreview";

// /* ═══════════════════════════════════════════════════════════
//    HELPERS
//    ═══════════════════════════════════════════════════════════ */
// const bn = (v) => bnBijoy2Unicode(String(v ?? ""));

// const getTodayBangla = () => {
//   const d = new Date();
//   const dd = String(d.getDate()).padStart(2, "0");
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const yyyy = d.getFullYear();
//   return bnBijoy2Unicode(`${dd}/${mm}/${yyyy}`);
// };

// const toDataUrl = (field) => {
//   if (!field?.data) return null;
//   const buf = Buffer.from(field.data);
//   return `data:image/png;base64,${buf.toString("base64")}`;
// };

// /* ═══════════════════════════════════════════════════════════
//    A4 LANDSCAPE LAYOUT
//    ═══════════════════════════════════════════════════════════ */
// const PAGE_W = 1080;
// const PAGE_H = 750;
// const PRINT_PAGE_H = 740;
// const HEADER_H = 130;
// const HEADER_GAP = 6;
// const THEAD_H = 28;
// const ROW_H = 28;
// const SIGNATURE_H = 130;
// const FOOTER_RESERVE = 20;
// const SAFETY = 8;

// const COL = { sl: 40, cls: 200, teacher: 150, total: 56 };

// const BORDER = "1px solid #000";

// const CHART_COLORS = [
//   "#176b57", "#c49b48", "#478bb4", "#8b72b0",
//   "#d16e5c", "#779b8b", "#b3beb7", "#e08a3c",
// ];

// /* ── চার্ট পেজ (এক সারিতে ২টি চার্ট) ── */
// const CHART_HEADER_H = 92;
// const CHART_GAP = 16;
// const CHART_CARD_W = Math.floor((PAGE_W - CHART_GAP) / 2);
// const CHART_CARD_H = PAGE_H - CHART_HEADER_H - HEADER_GAP - FOOTER_RESERVE - SAFETY - 10;
// const CHART_TITLE_H = 46;
// const CHART_PAD = 12;
// const CHART_INNER_W = CHART_CARD_W - CHART_PAD * 2 - 2;
// const CHART_INNER_H = CHART_CARD_H - CHART_TITLE_H - CHART_PAD * 2 - 2;

// /* ── ডোনাট: pure SVG + আলাদা HTML legend ── */
// const DONUT_LEGEND_H = 64;
// const DONUT_AREA_H = CHART_INNER_H - DONUT_LEGEND_H;
// const DONUT_SIZE = Math.min(DONUT_AREA_H, CHART_INNER_W) - 4;

// /* ═══════════════════════════════════════════════════════════
//    ROW CHART (pure HTML/CSS — স্ক্রিন প্রিভিউ)
//    ═══════════════════════════════════════════════════════════ */
// const PRINT_LABEL_W = 190;
// const PRINT_AXIS_H = 26;
// const PRINT_VALUE_PAD = 34;
// const PRINT_MAX_ROW_H = 80;

// function PrintBarChart({ labels, totals, width, height }) {
//   const n = labels.length;
//   const max = Math.max(1, ...totals);
//   const step = Math.max(1, Math.ceil(max / 5));
//   const axisMax = step * Math.ceil(max / step);

//   const ticks = [];
//   for (let t = 0; t <= axisMax; t += step) ticks.push(t);

//   const plotAreaH = height - PRINT_AXIS_H;
//   const rowH = Math.min(PRINT_MAX_ROW_H, plotAreaH / Math.max(n, 1));
//   const barH = Math.max(10, Math.round(rowH * 0.6));
//   const rowsH = rowH * n;

//   const plotW = width - PRINT_LABEL_W - PRINT_VALUE_PAD - 6;

//   return (
//     <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
//       {labels.map((label, i) => (
//         <div
//           key={`l-${i}`}
//           style={{
//             position: "absolute", left: 0, top: `${i * rowH}px`,
//             width: `${PRINT_LABEL_W - 10}px`, height: `${rowH}px`,
//             display: "flex", alignItems: "center", justifyContent: "flex-end",
//             textAlign: "right", fontSize: "12px", lineHeight: 1.25,
//             color: "#000", wordBreak: "break-word", overflow: "hidden",
//           }}
//         >
//           {label}
//         </div>
//       ))}

//       {ticks.map((t) => {
//         const x = PRINT_LABEL_W + (t / axisMax) * plotW;
//         return (
//           <div key={`t-${t}`}>
//             <div style={{
//               position: "absolute", left: `${x}px`, top: 0,
//               width: "1px", height: `${rowsH}px`, background: "#e5e7eb",
//             }} />
//             <div style={{
//               position: "absolute", left: `${x - 20}px`, top: `${rowsH + 4}px`,
//               width: "40px", textAlign: "center", fontSize: "11px", color: "#475569",
//             }}>
//               {bn(t)}
//             </div>
//           </div>
//         );
//       })}

//       <div style={{
//         position: "absolute", left: `${PRINT_LABEL_W}px`, top: `${rowsH}px`,
//         width: `${plotW}px`, height: "1px", background: "#cbd5e1",
//       }} />

//       {totals.map((v, i) => {
//         const w = (Number(v) / axisMax) * plotW;
//         return (
//           <div key={`b-${i}`}>
//             <div style={{
//               position: "absolute",
//               left: `${PRINT_LABEL_W}px`,
//               top: `${i * rowH + (rowH - barH) / 2}px`,
//               width: `${Math.max(w, 0)}px`, height: `${barH}px`,
//               background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: "0 3px 3px 0",
//             }} />
//             <div style={{
//               position: "absolute",
//               left: `${PRINT_LABEL_W + Math.max(w, 0) + 6}px`,
//               top: `${i * rowH}px`, height: `${rowH}px`,
//               display: "flex", alignItems: "center",
//               fontSize: "12px", fontWeight: 700, color: "#000",
//             }}>
//               {bn(v)}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    DISTRIBUTED COLUMNS (pure HTML/CSS — প্রিন্টে)
//    ক্লাসের নাম খাড়া (vertical) করে লেখা, তাই কখনো মিশে/কেটে যাবে না
//    ═══════════════════════════════════════════════════════════ */
// function PrintDistributedColumns({ labels, totals, width, height }) {
//   const AXIS_W = 36;
//   const TOP_PAD = 26;
//   const LABEL_H = 130;

//   const n = Math.max(labels.length, 1);
//   const max = Math.max(1, ...totals);
//   const step = Math.max(1, Math.ceil(max / 5));
//   const axisMax = step * Math.ceil(max / step);
//   const ticks = [];
//   for (let t = 0; t <= axisMax; t += step) ticks.push(t);

//   const plotW = width - AXIS_W - 8;
//   const plotH = height - TOP_PAD - LABEL_H;
//   const slot = plotW / n;
//   const barW = Math.min(slot * 0.6, 110);

//   return (
//     <div style={{ position: "relative", width: `${width}px`, height: `${height}px`, overflow: "hidden" }}>
//       {ticks.map((t) => {
//         const y = TOP_PAD + plotH - (t / axisMax) * plotH;
//         return (
//           <div key={`t-${t}`}>
//             <div style={{
//               position: "absolute", left: `${AXIS_W}px`, top: `${y}px`,
//               width: `${plotW}px`, height: "1px", background: t === 0 ? "#94a3b8" : "#e5e7eb",
//             }} />
//             <div style={{
//               position: "absolute", left: 0, top: `${y - 8}px`, width: `${AXIS_W - 6}px`,
//               textAlign: "right", fontSize: "12px", color: "#475569",
//             }}>
//               {bn(t)}
//             </div>
//           </div>
//         );
//       })}

//       {totals.map((v, i) => {
//         const h = (Number(v) / axisMax) * plotH;
//         const left = AXIS_W + i * slot + (slot - barW) / 2;
//         const color = CHART_COLORS[i % CHART_COLORS.length];
//         return (
//           <div key={`c-${i}`}>
//             <div style={{
//               position: "absolute", left: `${left}px`,
//               top: `${TOP_PAD + plotH - h}px`,
//               width: `${barW}px`, height: `${Math.max(h, 0)}px`,
//               background: color, borderRadius: "4px 4px 0 0",
//             }} />
//             <div style={{
//               position: "absolute", left: `${left}px`, width: `${barW}px`,
//               top: `${TOP_PAD + plotH - h - 20}px`,
//               textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#000",
//             }}>
//               {bn(v)}
//             </div>

//             {/* খাড়া ক্লাসের নাম */}
//             <div style={{
//               position: "absolute", left: `${AXIS_W + i * slot}px`, width: `${slot}px`,
//               top: `${TOP_PAD + plotH + 6}px`, height: `${LABEL_H - 8}px`,
//               display: "flex", justifyContent: "center", alignItems: "flex-start",
//               overflow: "hidden",
//             }}>
//               <span style={{
//                 writingMode: "vertical-rl",
//                 maxHeight: `${LABEL_H - 8}px`,
//                 fontSize: "11px", lineHeight: 1.2, color: "#000",
//                 textAlign: "left", overflow: "hidden",
//               }}>
//                 {labels[i]}
//               </span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    DONUT (pure SVG — প্রিন্টে সবসময় ঠিকমতো আঁকে)
//    ═══════════════════════════════════════════════════════════ */
// function PrintDonut({ values, colors, size }) {
//   const total = values.reduce((a, b) => a + (Number(b) || 0), 0);
//   const cx = size / 2;
//   const cy = size / 2;
//   const outer = size / 2 - 6;
//   const inner = outer * 0.58;
//   const r = (outer + inner) / 2;
//   const sw = outer - inner;
//   const C = 2 * Math.PI * r;

//   let acc = 0;
//   const slices = values.map((raw, i) => {
//     const v = Number(raw) || 0;
//     const frac = total ? v / total : 0;
//     const len = frac * C;
//     const start = acc;
//     acc += len;
//     const midAngle = ((start + len / 2) / C) * 2 * Math.PI - Math.PI / 2;
//     return {
//       i, v, frac, len, start,
//       lx: cx + r * Math.cos(midAngle),
//       ly: cy + r * Math.sin(midAngle),
//     };
//   });

//   return (
//     <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
//       {slices.map((s) =>
//         s.len > 0 ? (
//           <circle
//             key={`s-${s.i}`}
//             cx={cx} cy={cy} r={r}
//             fill="none"
//             stroke={colors[s.i % colors.length]}
//             strokeWidth={sw}
//             strokeDasharray={`${s.frac >= 0.999 ? s.len : Math.max(s.len - 1.5, 0)} ${C}`}
//             strokeDashoffset={-s.start}
//             transform={`rotate(-90 ${cx} ${cy})`}
//           />
//         ) : null
//       )}

//       {slices.map((s) =>
//         s.len > 0 ? (
//           <text
//             key={`t-${s.i}`}
//             x={s.lx} y={s.ly}
//             textAnchor="middle" dominantBaseline="central"
//             fontSize="13" fontWeight="700" fill="#fff"
//             style={{ fontFamily: "inherit" }}
//           >
//             {bn(s.v)}
//           </text>
//         ) : null
//       )}

//       <text
//         x={cx} y={cy - 14}
//         textAnchor="middle" dominantBaseline="central"
//         fontSize="16" fill="#444" style={{ fontFamily: "inherit" }}
//       >
//         মোট
//       </text>
//       <text
//         x={cx} y={cy + 14}
//         textAnchor="middle" dominantBaseline="central"
//         fontSize="26" fontWeight="700" fill="#222" style={{ fontFamily: "inherit" }}
//       >
//         {bn(total)}
//       </text>
//     </svg>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    MAIN
//    ═══════════════════════════════════════════════════════════ */
// export default function ClassDivisionSummarySheet({ reportData }) {

//   console.log(reportData, "reportData");

//   const { data: institutionInfo } = useGetInstitutionInfoQuery();
//   const [logo, setLogo] = useState(null);
//   const [najem, setNajem] = useState(null);
//   const printRef = useRef(null);

//   useEffect(() => {
//     setLogo(toDataUrl(institutionInfo?.Logo ?? institutionInfo?.InstitutionLogo));
//     setNajem(toDataUrl(institutionInfo?.SignatureNajem));
//   }, [institutionInfo]);

//   const divisions = Array.isArray(reportData?.divisions) ? reportData.divisions : [];
//   const rows = Array.isArray(reportData?.rows) ? reportData.rows : [];

//   const examName = reportData?.examName ?? "";
//   const sessionName = reportData?.sessionName ?? "";
//   const dateBangla = getTodayBangla();

//   /* ── per-row & per-column totals ── */
//   const rowTotal = (r) =>
//     divisions.reduce((s, d) => s + (Number(r.counts?.[d.id]) || 0), 0);

//   const colTotals = useMemo(() => {
//     const map = {};
//     divisions.forEach((d) => {
//       map[d.id] = rows.reduce((s, r) => s + (Number(r.counts?.[d.id]) || 0), 0);
//     });
//     return map;
//   }, [rows, divisions]);

//   const grandTotal = useMemo(
//     () => rows.reduce((s, r) => s + rowTotal(r), 0),
//     [rows, divisions]
//   );

//   /* ── chart data (dynamic) ── */
//   const chartData = useMemo(() => {
//     const labels = rows.map((r) => r.sessionWithClass);
//     const totals = rows.map((r) => rowTotal(r));
//     const divisionTotals = divisions.map((d) => colTotals[d.id] || 0);
//     const stacked = divisions.map((d) => ({
//       name: d.name,
//       data: rows.map((r) => Number(r.counts?.[d.id]) || 0),
//     }));
//     return { labels, totals, divisionTotals, stacked };
//   }, [rows, divisions, colTotals]);

//   /* ── pagination (টেবিল পেজ) ── */
//   const pages = useMemo(() => {
//     const n = rows.length;
//     if (!n) return [[]];

//     const capNoSig = (isFirst) =>
//       Math.max(1, Math.floor(
//         (PAGE_H - (isFirst ? HEADER_H + HEADER_GAP : 0) - THEAD_H - FOOTER_RESERVE - SAFETY) / ROW_H
//       ));
//     const capWithSig = (isFirst) =>
//       Math.max(1, Math.floor(
//         (PAGE_H - (isFirst ? HEADER_H + HEADER_GAP : 0) - THEAD_H - SIGNATURE_H - FOOTER_RESERVE - SAFETY) / ROW_H
//       ));

//     const chunks = [];
//     let i = 0;
//     while (i < n) {
//       const isFirst = chunks.length === 0;
//       const remaining = n - i;
//       if (remaining <= capWithSig(isFirst)) {
//         chunks.push(rows.slice(i));
//         break;
//       }
//       const take = Math.min(capNoSig(isFirst), remaining - 1);
//       chunks.push(rows.slice(i, i + take));
//       i += take;
//     }
//     return chunks;
//   }, [rows]);

//   // টেবিল পেজ + ১টি চার্ট পেজ
//   const totalPages = pages.length + 1;

//   /* ── styles ── */
//   const th = {
//     border: BORDER, padding: "2px 4px", textAlign: "center", verticalAlign: "middle",
//     fontSize: "13px", fontWeight: 500, color: "#000", height: `${THEAD_H}px`,
//     overflow: "hidden", whiteSpace: "nowrap", backgroundColor: "#fff",
//   };
//   const td = {
//     border: BORDER, padding: "0 6px", textAlign: "center", verticalAlign: "middle",
//     fontSize: "13px", height: `${ROW_H}px`, lineHeight: `${ROW_H - 2}px`,
//     overflow: "hidden", whiteSpace: "nowrap", color: "#000", backgroundColor: "#fff",
//   };

//   const renderHeader = () => (
//     <div style={{
//       position: "relative", height: `${HEADER_H}px`, boxSizing: "border-box",
//       marginBottom: `${HEADER_GAP}px`, textAlign: "center", overflow: "hidden",
//     }}>
//       {logo && (
//         <img
//           src={logo}
//           alt="logo"
//           style={{
//             position: "absolute", left: "14px", top: "6px",
//             height: "100px", width: "100px", objectFit: "contain",
//           }}
//         />
//       )}
//       <div style={{ paddingTop: "8px" }}>
//         <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 800, lineHeight: 1.3, color: "#000" }}>
//           {institutionInfo?.InstitutionName}
//         </h1>
//         <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "#000" }}>
//           {institutionInfo?.Address}
//         </p>
//         <p style={{ margin: "6px 0 0", fontSize: "18px", fontWeight: 600, color: "#000" }}>
//           {examName} - {sessionName}
//         </p>
//       </div>
//     </div>
//   );

//   const renderColGroup = () => (
//     <colgroup>
//       <col style={{ width: `${COL.sl}px` }} />
//       <col style={{ width: `${COL.cls}px` }} />
//       <col style={{ width: `${COL.teacher}px` }} />
//       {divisions.map((d) => <col key={d.id} />)}
//       <col style={{ width: `${COL.total}px` }} />
//     </colgroup>
//   );

//   const renderTableHead = () => (
//     <thead>
//       <tr style={{ height: `${THEAD_H}px` }}>
//         <th style={th}>ক্রমিক</th>
//         <th style={{ ...th, textAlign: "left", paddingLeft: "8px" }}>সাব ক্লাস বাংলা</th>
//         <th style={th}>শিক্ষকের নাম</th>
//         {divisions.map((d) => <th key={d.id} style={th}>{d.name}</th>)}
//         <th style={th}>মোট</th>
//       </tr>
//     </thead>
//   );

//   const renderRow = (r, globalIndex) => (
//     <tr key={r.id ?? globalIndex} style={{ height: `${ROW_H}px` }}>
//       <td style={td}>{bn(globalIndex + 1)}</td>
//       <td style={{ ...td, textAlign: "left", paddingLeft: "6px", fontWeight: 600, textOverflow: "ellipsis" }}>
//         {r.sessionWithClass}
//       </td>
//       <td style={{ ...td, textOverflow: "ellipsis" }}>{r.teacherName}</td>
//       {divisions.map((d) => (
//         <td key={d.id} style={td}>{bn(Number(r.counts?.[d.id]) || 0)}</td>
//       ))}
//       <td style={{ ...td, fontWeight: 700 }}>{bn(rowTotal(r))}</td>
//     </tr>
//   );

//   const renderFooterRow = () => (
//     <tfoot>
//       <tr style={{ height: `${ROW_H}px`, backgroundColor: "#eef5f0" }}>
//         <td style={{ ...td, fontWeight: 800 }} colSpan={3}>
//           সর্বমোট
//         </td>
//         {divisions.map((d) => (
//           <td key={d.id} style={{ ...td, fontWeight: 700 }}>
//             {bn(colTotals[d.id] || 0)}
//           </td>
//         ))}
//         <td style={{ ...td, fontWeight: 800 }}>{bn(grandTotal)}</td>
//       </tr>
//     </tfoot>
//   );

//   const renderSignature = () => (
//     <div className="signature-section" style={{
//       height: `${SIGNATURE_H}px`, boxSizing: "border-box", overflow: "hidden",
//       display: "flex", justifyContent: "flex-end", alignItems: "flex-end",
//       paddingTop: "10px", paddingRight: "40px",
//     }}>
//       <div style={{ width: "260px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
//         <div style={{ height: "56px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
//           {najem && (
//             <img src={najem} alt="signature" style={{
//               maxHeight: "56px", maxWidth: "150px", objectFit: "contain",
//               mixBlendMode: "multiply", userSelect: "none", pointerEvents: "none",
//             }} />
//           )}
//         </div>
//         <div style={{ width: "100%", borderTop: "1px dashed #000", margin: "2px 0 3px" }} />
//         <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#000" }}>
//           {institutionInfo?.NajemName}
//         </p>
//         <p style={{ margin: "4px 0 0", fontSize: "14px", fontWeight: 600, color: "#000" }}>
//           তারিখ : {dateBangla}
//         </p>
//       </div>
//     </div>
//   );

//   const renderPageFooter = (pageNumber) => (
//     <div style={{
//       position: "absolute", left: 0, right: 0, bottom: "2px",
//       textAlign: "center", fontSize: "10px", color: "#404040",
//     }}>
//       পৃষ্ঠা {bn(pageNumber)} / {bn(totalPages)}
//     </div>
//   );

//   const renderPage = (pageIndex, pageRows, pageNumber) => {
//     const isFirst = pageIndex === 0;
//     const isLast = pageIndex === pages.length - 1;
//     const offset = pages.slice(0, pageIndex).reduce((s, c) => s + c.length, 0);

//     return (
//       <>
//         {isFirst && renderHeader()}
//         <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
//           {renderColGroup()}
//           {renderTableHead()}
//           <tbody>{pageRows.map((r, i) => renderRow(r, offset + i))}</tbody>
//           {isLast && renderFooterRow()}
//         </table>
//         {isLast && renderSignature()}
//         {renderPageFooter(pageNumber)}
//       </>
//     );
//   };

//   const pageBox = {
//     position: "relative", width: `${PAGE_W}px`, height: `${PAGE_H}px`,
//     boxSizing: "border-box", overflow: "hidden", background: "#fff", margin: "0 auto",
//   };

//   const printPageBox = {
//     ...pageBox,
//     margin: 0,
//     height: `${PRINT_PAGE_H}px`,
//   };

//   /* ═══════════════════════════════════════════════════════════
//      APEX CHART OPTIONS (শুধু স্ক্রিনের বড় চার্টগুলোর জন্য)
//      ═══════════════════════════════════════════════════════════ */
//   const commonChart = {
//     toolbar: { show: false },
//     fontFamily: "inherit",
//     animations: { enabled: true, speed: 500 },
//   };

//   // প্রতিটি বারের আলাদা রং (distributed)
//   const totalBarOptions = {
//     chart: { ...commonChart, type: "bar" },
//     plotOptions: {
//       bar: { horizontal: true, borderRadius: 4, barHeight: "60%", distributed: true },
//     },
//     colors: CHART_COLORS,
//     legend: { show: false },
//     dataLabels: { enabled: false },
//     xaxis: {
//       categories: chartData.labels,
//       labels: { style: { fontSize: "11px" } },
//     },
//     yaxis: { labels: { style: { fontSize: "11px" } } },
//     grid: { borderColor: "#eef1ee" },
//     tooltip: { theme: "light" },
//   };

//   const donutOptions = {
//     chart: { ...commonChart, type: "donut" },
//     labels: divisions.map((d) => d.name),
//     colors: CHART_COLORS,
//     legend: { position: "bottom", fontSize: "12px" },
//     dataLabels: { enabled: true, style: { fontSize: "11px" } },
//     plotOptions: {
//       pie: { donut: { size: "58%", labels: { show: true, total: { show: true, label: "মোট" } } } },
//     },
//     tooltip: { theme: "light" },
//   };

//   const stackedOptions = {
//     chart: { ...commonChart, type: "bar", stacked: true },
//     plotOptions: { bar: { horizontal: false, borderRadius: 2, columnWidth: "55%" } },
//     colors: CHART_COLORS,
//     dataLabels: { enabled: false },
//     xaxis: {
//       categories: chartData.labels,
//       labels: { rotate: -45, style: { fontSize: "10px" } },
//     },
//     yaxis: { labels: { style: { fontSize: "11px" } } },
//     legend: { position: "bottom", fontSize: "12px" },
//     grid: { borderColor: "#eef1ee" },
//     tooltip: { theme: "light" },
//   };

//   /* ── চার্ট পেজ ── */
//   const chartCard = {
//     width: `${CHART_CARD_W}px`, height: `${CHART_CARD_H}px`,
//     boxSizing: "border-box", border: "1px solid #000", borderRadius: "8px",
//     padding: `${CHART_PAD}px`, overflow: "hidden", background: "#fff",
//     flexShrink: 0,
//   };

//   const renderChartHeader = () => (
//     <div style={{
//       height: `${CHART_HEADER_H}px`, boxSizing: "border-box",
//       marginBottom: `${HEADER_GAP}px`, textAlign: "center", overflow: "hidden",
//       borderBottom: "2px solid #000", paddingTop: "6px",
//     }}>
//       <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, lineHeight: 1.3, color: "#000" }}>
//         {institutionInfo?.InstitutionName}
//       </h1>
//       <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 600, color: "#000" }}>
//         {examName} - {sessionName}
//       </p>
//     </div>
//   );

//   /*
//     variant = "row"    → বামে row (horizontal) চার্ট   (স্ক্রিন প্রিভিউ)
//     variant = "column" → বামে column (distributed) চার্ট (প্রিন্ট)
//   */
//   const renderChartPage = (pageNumber, variant = "row") => (
//     <>
//       {renderChartHeader()}

//       <div style={{
//         display: "flex", flexDirection: "row", alignItems: "flex-start",
//         justifyContent: "space-between", gap: `${CHART_GAP}px`, marginTop: "6px",
//       }}>
//         {/* বাম চার্ট */}
//         <div style={chartCard}>
//           <div style={{ height: `${CHART_TITLE_H}px`, overflow: "hidden" }}>
//             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#155b49" }}>
//               শ্রেণিভিত্তিক মোট শিক্ষার্থী
//             </h3>
//             <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>প্রতি ক্লাসের মোট</p>
//           </div>

//           {variant === "column" ? (
//             <PrintDistributedColumns
//               labels={chartData.labels}
//               totals={chartData.totals}
//               width={CHART_INNER_W}
//               height={CHART_INNER_H}
//             />
//           ) : (
//             <PrintBarChart
//               labels={chartData.labels}
//               totals={chartData.totals}
//               width={CHART_INNER_W}
//               height={CHART_INNER_H}
//             />
//           )}
//         </div>

//         {/* ডান চার্ট (SVG ডোনাট + নিচে আলাদা legend) */}
//         <div style={chartCard}>
//           <div style={{ height: `${CHART_TITLE_H}px`, overflow: "hidden" }}>
//             <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#155b49" }}>
//               বিভাগভিত্তিক সারসংক্ষেপ
//             </h3>
//             <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#475569" }}>সব শ্রেণির সম্মিলিত সংখ্যা</p>
//           </div>

//           <div style={{
//             width: `${CHART_INNER_W}px`, height: `${DONUT_AREA_H}px`,
//             display: "flex", alignItems: "center", justifyContent: "center",
//             overflow: "hidden",
//           }}>
//             <PrintDonut
//               values={chartData.divisionTotals}
//               colors={CHART_COLORS}
//               size={DONUT_SIZE}
//             />
//           </div>

//           <div style={{
//             width: `${CHART_INNER_W}px`, height: `${DONUT_LEGEND_H}px`,
//             display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
//             gap: "6px 14px", overflow: "hidden", paddingTop: "6px", boxSizing: "border-box",
//           }}>
//             {divisions.map((d, i) => (
//               <div key={d.id} style={{
//                 display: "flex", alignItems: "center", gap: "5px",
//                 fontSize: "12px", color: "#000",
//               }}>
//                 <span style={{
//                   width: "11px", height: "11px", borderRadius: "50%",
//                   background: CHART_COLORS[i % CHART_COLORS.length],
//                   display: "inline-block", flexShrink: 0,
//                 }} />
//                 <span>{d.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {renderPageFooter(pageNumber)}
//     </>
//   );

//   if (!rows.length) {
//     return (
//       <div className="w-full p-6 text-center text-slate-500 text-sm">
//         কোনো ডেটা পাওয়া যায়নি।
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       {/* ── CHARTS (স্ক্রিনে Full Width; প্রিন্টে লুকানো) ── */}
//       <div className="no-print w-full mb-6">
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
//           <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
//             <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">শ্রেণিভিত্তিক মোট শিক্ষার্থী</h3>
//             <p className="m-0 mb-3 text-xs text-[#718078]">প্রতি ক্লাসের মোট</p>
//             <Chart options={totalBarOptions} series={[{ name: "মোট", data: chartData.totals }]} type="bar" height={340} />
//           </div>

//           <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
//             <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">বিভাগভিত্তিক সারসংক্ষেপ</h3>
//             <p className="m-0 mb-3 text-xs text-[#718078]">সব শ্রেণির সম্মিলিত সংখ্যা</p>
//             <Chart options={donutOptions} series={chartData.divisionTotals} type="donut" height={340} />
//           </div>
//         </div>

//         <div className="bg-white border border-[#e1e9e3] rounded-2xl p-5 shadow-sm w-full min-w-0">
//           <h3 className="m-0 mb-1 text-base font-bold text-[#155b49]">বিভাগ অনুযায়ী শ্রেণির তুলনা</h3>
//           <p className="m-0 mb-3 text-xs text-[#718078]">স্ট্যাকড বার চার্ট</p>
//           <Chart options={stackedOptions} series={chartData.stacked} type="bar" height={380} />
//         </div>
//       </div>

//       {/* ── PRINTABLE SHEET ── */}
//       <div className="result-sheet-wrapper w-full" ref={printRef}>
//         {/* স্ক্রিন প্রিভিউ: শুধু টেবিল পেজ */}
//         <div className="no-print">
//           <ScaledPreview designWidth={PAGE_W}>
//             {pages.map((pageRows, pageIndex) => (
//               <div key={pageIndex} style={{
//                 ...pageBox,
//                 boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
//                 marginBottom: "24px",
//               }}>
//                 {renderPage(pageIndex, pageRows, pageIndex + 1)}
//               </div>
//             ))}
//           </ScaledPreview>
//         </div>

//         {/* প্রিন্ট: চার্ট পেজ (বামে column চার্ট, ডানে ডোনাট) → টেবিল পেজ */}
//         <div className="print-only">
//           <div className="print-page" style={printPageBox}>
//             {renderChartPage(1, "column")}
//           </div>

//           {pages.map((pageRows, pageIndex) => (
//             <div key={pageIndex} className="print-page" style={printPageBox}>
//               {renderPage(pageIndex, pageRows, pageIndex + 2)}
//             </div>
//           ))}
//         </div>
//       </div>

//       <style>{`
//         .print-only {
//           height: 0; overflow: hidden; position: absolute;
//           left: -10000px; top: 0; width: ${PAGE_W}px; pointer-events: none;
//         }
//         @media print {
//           @page { size: A4 landscape; margin: 5mm; }
//           html, body {
//             margin: 0 !important; padding: 0 !important;
//             height: auto !important; min-height: 0 !important;
//             overflow: visible !important;
//           }
//           * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
//           .no-print { display: none !important; }

//           .result-sheet-wrapper {
//             height: auto !important; min-height: 0 !important;
//             margin: 0 !important; padding: 0 !important;
//           }
//           .print-only {
//             position: static !important; left: auto !important;
//             height: auto !important; overflow: visible !important;
//             width: auto !important; display: block !important;
//             margin: 0 !important; padding: 0 !important;
//           }

//           .print-page {
//             break-after: page; page-break-after: always;
//             break-inside: avoid; page-break-inside: avoid;
//           }
//           .print-page:last-child {
//             break-after: auto !important; page-break-after: auto !important;
//           }

//           tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
//           .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
//         }
//       `}</style>
//     </div>
//   );
// }