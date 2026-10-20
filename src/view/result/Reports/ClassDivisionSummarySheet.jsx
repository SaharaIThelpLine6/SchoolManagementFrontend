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

/* ═══════════════════════════════════════════════════════════
   A4 LANDSCAPE LAYOUT
   ═══════════════════════════════════════════════════════════ */
const PAGE_W = 1080;
const PAGE_H = 750;
const HEADER_H = 130;
const HEADER_GAP = 6;
const THEAD_H = 28;
const ROW_H = 28;
const SIGNATURE_H = 130;
const FOOTER_RESERVE = 20;
const SAFETY = 8;

const COL = { sl: 40, cls: 200, teacher: 150, total: 56 };

const BORDER = "1px solid #000";

const CHART_COLORS = [
  "#176b57", "#c49b48", "#478bb4", "#8b72b0",
  "#d16e5c", "#779b8b", "#b3beb7", "#e08a3c",
];

/* ═══════════════════════════════════════════════════════════
   MAIN
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

  /* ── pagination ── */
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

  /* ── styles ── */
  const th = {
    border: BORDER, padding: "2px 4px", textAlign: "center", verticalAlign: "middle",
    fontSize: "13px", fontWeight: 500, color: "#000", height: `${THEAD_H}px`,
    overflow: "hidden", whiteSpace: "nowrap", backgroundColor: "#fff",
  };
  const td = {
    border: BORDER, padding: "0 6px", textAlign: "center", verticalAlign: "middle",
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
      <col style={{ width: `${COL.teacher}px` }} />
      {divisions.map((d) => <col key={d.id} />)}
      <col style={{ width: `${COL.total}px` }} />
    </colgroup>
  );

  const renderTableHead = () => (
    <thead>
      <tr style={{ height: `${THEAD_H}px` }}>
        <th style={th}>ক্রমিক</th>
        <th style={{ ...th, textAlign: "left", paddingLeft: "8px" }}>সাব ক্লাস বাংলা</th>
        <th style={th}>শিক্ষকের নাম</th>
        {divisions.map((d) => <th key={d.id} style={th}>{d.name}</th>)}
        <th style={th}>মোট</th>
      </tr>
    </thead>
  );

  const renderRow = (r, globalIndex) => (
    <tr key={r.id ?? globalIndex} style={{ height: `${ROW_H}px` }}>
      <td style={td}>{bn(globalIndex + 1)}</td>
      <td style={{ ...td, textAlign: "left", paddingLeft: "6px", fontWeight: 600, textOverflow: "ellipsis" }}>
        {r.sessionWithClass}
      </td>
      <td style={{ ...td, textOverflow: "ellipsis" }}>{r.teacherName}</td>
      {divisions.map((d) => (
        <td key={d.id} style={td}>{bn(Number(r.counts?.[d.id]) || 0)}</td>
      ))}
      <td style={{ ...td, fontWeight: 700 }}>{bn(rowTotal(r))}</td>
    </tr>
  );

  const renderFooterRow = () => (
    <tfoot>
      <tr style={{ height: `${ROW_H}px`, backgroundColor: "#eef5f0" }}>
        <td style={{ ...td, fontWeight: 800 }} colSpan={3}>
          সর্বমোট
        </td>
        {divisions.map((d) => (
          <td key={d.id} style={{ ...td, fontWeight: 700 }}>
            {bn(colTotals[d.id] || 0)}
          </td>
        ))}
        <td style={{ ...td, fontWeight: 800 }}>{bn(grandTotal)}</td>
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

  const renderPage = (pageIndex, pageRows) => {
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
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: "2px",
          textAlign: "center", fontSize: "10px", color: "#404040",
        }}>
          পৃষ্ঠা {bn(pageIndex + 1)} / {bn(pages.length)}
        </div>
      </>
    );
  };

  const pageBox = {
    position: "relative", width: `${PAGE_W}px`, height: `${PAGE_H}px`,
    boxSizing: "border-box", overflow: "hidden", background: "#fff", margin: "0 auto",
  };

  /* ── print handler ── */
  const handlePrint = () => {
    window.print();
  };

  if (!rows.length) {
    return (
      <div className="w-full p-6 text-center text-slate-500 text-sm">
        কোনো ডেটা পাওয়া যায়নি।
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     APEX CHART OPTIONS
     ═══════════════════════════════════════════════════════════ */
  const commonChart = {
    toolbar: { show: false },
    fontFamily: "inherit",
    animations: { enabled: true, speed: 500 },
  };

  const totalBarOptions = {
    chart: { ...commonChart, type: "bar" },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "60%" } },
    colors: ["#237a61"],
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

  return (
    <div className="w-full">
      {/* ── CHARTS (Full Width) ── */}
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
        <div className="no-print">
          <ScaledPreview designWidth={PAGE_W}>
            {pages.map((pageRows, pageIndex) => (
              <div key={pageIndex} style={{
                ...pageBox,
                boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                marginBottom: "24px",
              }}>
                {renderPage(pageIndex, pageRows)}
              </div>
            ))}
          </ScaledPreview>
        </div>

        <div className="print-only">
          {pages.map((pageRows, pageIndex) => (
            <div key={pageIndex} style={{
              ...pageBox,
              pageBreakAfter: pageIndex < pages.length - 1 ? "always" : "auto",
              breakAfter: pageIndex < pages.length - 1 ? "page" : "auto",
            }}>
              {renderPage(pageIndex, pageRows)}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .print-only { display: none; }
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          html, body { margin: 0 !important; padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          tr, td, th { page-break-inside: avoid !important; break-inside: avoid !important; }
          .signature-section { page-break-inside: avoid !important; break-inside: avoid !important; }
        }
      `}</style>
    </div>
  );
}