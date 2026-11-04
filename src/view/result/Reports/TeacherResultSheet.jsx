import { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   HELPERS & CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const makeNum = (v) => {
  if (v === undefined || v === null) return "";
  return bnBijoy2Unicode(String(v));
};

const pickText = (...values) => {
  const found = values.find((v) => typeof v === "string" && v.trim() !== "");
  return found ? found.trim() : "";
};

const bufferToDataUrl = (file) =>
  file?.data
    ? `data:image/png;base64,${Buffer.from(file.data).toString("base64")}`
    : null;

// সাদা-কালো থিম
const C = {
  border: "#000",
  text: "#000",
  soft: "#f5f5f5",
};

const bg = (color) => ({
  backgroundColor: color,
  boxShadow: `inset 0 0 0 1000px ${color}`,
});

const PAGE_W = 1080;
const PAGE_H = 750;
const ROW_H = 30;
const PASS_MARK = 33;

/* ── প্রিন্ট পেজিনেশনের আনুমানিক উচ্চতা (design px) ── */
const PAGE_PAD_V = 40;        // padding 20 + 20
const HEADER_BLOCK_H = 200;   // হেডার ব্লক (fixed — যাতে পেজিনেশন হিসাব নিখুঁত হয়)
const TITLE_BLOCK_H = 40;     // "বিষয় পরিবেশিত ফলাফল" টাইটেল (fixed)
const FIRST_HEADER_H = HEADER_BLOCK_H + TITLE_BLOCK_H;
const THEAD_H = 35;
const SIGNATURE_H = 140;
const PAGE_FOOTER_RESERVE = 20;
const SAFETY = 10;

/* ── প্রিন্ট: A4 landscape, margin 5mm ──
   ডিজাইন-পেজকে প্রিন্টেবল এরিয়ায় ফিট করে স্কেল করা হয়।
   আউটার বক্সে margin: 0 auto → Chrome Scale (১০০% / Custom ৯৫) যাই হোক মাঝখানে বসে। */
const PRINT_MARGIN_MM = 5;
const PX_PER_MM = 96 / 25.4;
const PRINT_AREA_W_MM = 297 - PRINT_MARGIN_MM * 2;
const PRINT_SCALE = ((PRINT_AREA_W_MM * PX_PER_MM) / PAGE_W) * 0.99;
const PRINT_OUT_W = Math.floor(PAGE_W * PRINT_SCALE);
const PRINT_OUT_H = Math.floor(PAGE_H * PRINT_SCALE);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SubjectWiseResultSheet({ reportData }) {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);
  const [principal, setPrincipal] = useState(null);

  // লোগো এবং সিগনেচার লোড
  useEffect(() => {
    setLogo(bufferToDataUrl(institutionInfo?.Logo));
    setPrincipal(bufferToDataUrl(institutionInfo?.SignaturePrincipal));
  }, [institutionInfo]);

  /* ── Extract Data ── */
  const columns = reportData?.columns || [];
  const students = reportData?.students || [];
  const conditionAverage = reportData?.conditionAverage || {};
  const headerStats = reportData?.headerStats || {
    totalStudents: 0,
    totalExaminees: 0,
    totalAbsent: 0,
  };
  const dynamicDivisions = reportData?.dynamicDivisions || [];
  const divisionSummary = reportData?.divisionSummary || [];

  // min মার্ক অনুযায়ী descending (একবারই সাজানো হবে)
  const sortedDivisions = useMemo(
    () => [...dynamicDivisions].sort((a, b) => b.minNumber - a.minNumber),
    [dynamicDivisions]
  );

  const institutionName = pickText(institutionInfo?.InstitutionName) || "জামেয়া রশীদিয়া";
  const institutionAddress = pickText(institutionInfo?.Address) || "লাকসাম, কুমিল্লা, বাংলাদেশ";
  const examName = pickText(conditionAverage?.Exam?.ExamName) || "১ম সাময়িক পরীক্ষা";
  const sessionName = pickText(conditionAverage?.Session?.SessionName) || "২০২৬-২০২৭ইং";
  const className = pickText(conditionAverage?.SubClass?.SubClass) || "নাহবেমীর (৩য় শ্রেণি)-২";

  const { totalStudents, totalExaminees, totalAbsent } = headerStats;

  /* ── প্রিন্ট পেজিনেশন: সারি বেশি হলে একাধিক পেজ ── */
  const pages = useMemo(() => {
    const n = columns.length;
    if (!n) return [[]];

    const avail = (isFirst, withSig) =>
      PAGE_H -
      PAGE_PAD_V -
      (isFirst ? FIRST_HEADER_H : 0) -
      THEAD_H -
      (withSig ? SIGNATURE_H : 0) -
      PAGE_FOOTER_RESERVE -
      SAFETY;
    const capNoSig = (isFirst) => Math.max(1, Math.floor(avail(isFirst, false) / ROW_H));
    const capWithSig = (isFirst) => Math.max(1, Math.floor(avail(isFirst, true) / ROW_H));

    const chunks = [];
    let i = 0;
    while (i < n) {
      const isFirst = chunks.length === 0;
      const remaining = n - i;
      if (remaining <= capWithSig(isFirst)) {
        chunks.push(columns.slice(i));
        break;
      }
      const take = Math.min(capNoSig(isFirst), remaining - 1);
      chunks.push(columns.slice(i, i + take));
      i += take;
    }
    return chunks;
  }, [columns]);

  /* ── Styles ── */
  const th = {
    border: `1px solid ${C.border}`,
    padding: "4px 8px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "12px",
    fontWeight: 600,
    color: C.text,
    whiteSpace: "nowrap", // ⭐ হেডার ভাঙবে না
    ...bg(C.soft),
  };

  const td = {
    border: `1px solid ${C.border}`,
    padding: "0 8px",
    textAlign: "center",
    verticalAlign: "middle",
    height: `${ROW_H}px`,
    lineHeight: `${ROW_H - 2}px`,
    fontSize: "12px",
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  // ডিভিশন কলাম: কনটেন্ট অনুযায়ী সংকুচিত, কিন্তু সর্বনিম্ন ৭০px
  const divTh = { ...th, width: "1%", minWidth: "70px" };

  const textCell = {
    ...td,
    textAlign: "start",
    paddingInlineStart: "10px",
  };

  /* ── Header Block ── */
  const statBox = (label, value, isLast) => (
    <div
      style={{
        padding: "4px 8px",
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        whiteSpace: "nowrap",
        borderBottom: isLast ? "none" : `1px solid ${C.border}`,
      }}
    >
      <span>{label} = </span>
      <span style={{ fontWeight: 700 }}>{makeNum(value)}</span>
    </div>
  );

  const renderHeaderBlock = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: `${HEADER_BLOCK_H}px`,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "10px",
        }}
      >
        <div style={{ width: "120px", display: "flex", justifyContent: "center" }}>
          {logo ? (
            <img src={logo} alt="Logo" style={{ maxHeight: "70px", objectFit: "contain" }} />
          ) : (
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "1px solid #ccc",
              }}
            />
          )}
        </div>

        <div style={{ textAlign: "center", flex: 1 }}>
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 800,
              margin: 0,
              color: C.text,
              fontFamily: "serif",
            }}
          >
            {institutionName}
          </h1>
          <p style={{ fontSize: "13px", margin: "2px 0", color: C.text }}>
            {institutionAddress}
          </p>
          <h2 style={{ fontSize: "14px", margin: "5px 0", fontWeight: 700, color: C.text }}>
            {examName} — {sessionName}
          </h2>
          <div
            style={{
              display: "inline-block",
              border: `1.5px solid ${C.border}`,
              borderRadius: "15px",
              padding: "2px 20px",
              fontWeight: 700,
              fontSize: "14px",
              marginTop: "4px",
              backgroundColor: "#fff",
            }}
          >
            গড় পরিবেশিত ফলাফল
          </div>
        </div>

        <div style={{ width: "200px", textAlign: "right" }}>
          <div style={{ fontSize: "13px", border: `1px solid ${C.border}` }}>
            {statBox("মোট শিক্ষার্থী", totalStudents)}
            {statBox("মোট পরীক্ষার্থী", totalExaminees)}
            {statBox("মোট অনুপস্থিত", totalAbsent, true)}
          </div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "5px" }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "25%" }}>শ্রেণির নাম</th>
            <th style={{ ...th, width: "25%" }}>শিক্ষকের নাম</th>
            {dynamicDivisions.map((d) => (
              <th key={d.id} style={th}>{d.name}</th>
            ))}
            <th style={th}>মোট</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{className}</td>
            <td style={td}></td>
            {dynamicDivisions.map((d) => {
              const match = divisionSummary.find((s) => String(s.name) === String(d.name));
              return <td key={d.id} style={td}>{makeNum(match ? match.count : 0)}</td>;
            })}
            <td style={td}>{makeNum(totalStudents)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  /* ── Subject Row ── */
  const renderSubjectRow = (column, index) => {
    const marks = students.map((s) => Number(s.marks?.[column.id]) || 0);

    const counts = {};
    dynamicDivisions.forEach((d) => { counts[d.id] = 0; });

    marks.forEach((mark) => {
      if (mark < PASS_MARK) return; // ফেইল কলামটি ডিভিশন লিস্টেরই অংশ হলে নিচে হ্যান্ডেল করুন
      const target =
        sortedDivisions.find((d) => mark >= d.minNumber) ||
        sortedDivisions[sortedDivisions.length - 1];
      if (target) counts[target.id]++;
    });

    return (
      <tr key={column.id} style={{ height: `${ROW_H}px` }}>
        <td style={td}>{makeNum(index + 1)}</td>
        <td style={{ ...textCell, fontWeight: 500 }}>{column.name}</td>
        <td style={{ ...textCell, fontSize: "11px" }}>{column.teacherName || ""}</td>
        {dynamicDivisions.map((d) => (
          <td key={d.id} style={td}>{makeNum(counts[d.id] || 0)}</td>
        ))}
        <td style={{ ...td, fontWeight: 600 }}>{makeNum(marks.length)}</td>
      </tr>
    );
  };

  /* ── Signature ── */
  const renderSignature = () => (
    <div
      className="signature-section"
      style={{
        marginTop: "auto",
        paddingTop: "40px",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div style={{ textAlign: "center", width: "200px" }}>
        {principal && (
          <div className="flex justify-center items-center">
            <img
              src={principal}
              alt="signature"
              style={{ height: "40px", marginBottom: "5px" }}
            />
          </div>
        )}
        <div style={{ borderTop: "1px dashed #000", width: "160px", margin: "0 auto" }} />
        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700 }}>মুহতামিম সাহেব</p>
        <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
          তারিখ: {makeNum(new Date().toLocaleDateString("bn-BD"))}
        </p>
      </div>
    </div>
  );

  /* ── Page (rows = এই পেজের সারি, offset = আগের পেজগুলোর সারি সংখ্যা) ── */
  const renderPage = (rows, offset, isFirst, isLast) => (
    <>
      {isFirst && renderHeaderBlock()}

      {isFirst && (
        <div
          style={{
            height: `${TITLE_BLOCK_H}px`,
            lineHeight: `${TITLE_BLOCK_H}px`,
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          বিষয় পরিবেশিত ফলাফল
        </div>
      )}

      {/* ⭐ tableLayout: auto — কলাম টেক্সট অনুযায়ী প্রসারিত হবে */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", flexShrink: 0 }}>
        <thead>
          <tr style={{ height: `${THEAD_H}px` }}>
            <th style={{ ...th, width: "1%" }}>ক্রমিক</th>
            <th style={th}>বিষয়</th>
            <th style={{ ...th, width: "200px" }}>শিক্ষকের নাম</th>
            {dynamicDivisions.map((d) => (
              <th key={d.id} style={divTh}>{d.name}</th>
            ))}
            <th style={divTh}>মোট</th>
          </tr>
        </thead>
        <tbody>{rows.map((c, i) => renderSubjectRow(c, offset + i))}</tbody>
      </table>

      {isLast && renderSignature()}
    </>
  );

  const pageBox = {
    position: "relative",
    width: `${PAGE_W}px`,
    minHeight: `${PAGE_H}px`,
    boxSizing: "border-box",
    background: "#fff",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    padding: "20px 25px",
  };

  // প্রিন্ট পেজ: নির্দিষ্ট উচ্চতা + স্কেল
  const printPageBox = {
    ...pageBox,
    margin: 0,
    height: `${PAGE_H}px`,
    minHeight: `${PAGE_H}px`,
    overflow: "hidden",
    transform: `scale(${PRINT_SCALE})`,
    transformOrigin: "top left",
  };

  return (
    <div className="flex items-start w-full">
      <div className="flex-1 min-w-0 w-full">
        <div
          className="result-sheet-wrapper w-full overflow-x-hidden"
          style={{ height: "700px", overflowY: "auto" }}
        >
          <div className="no-print p-4">
            <ScaledPreview designWidth={PAGE_W}>
              <div
                style={{
                  ...pageBox,
                  boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                  marginBottom: "24px",
                }}
              >
                {renderPage(columns, 0, true, true)}
              </div>
            </ScaledPreview>
          </div>
        </div>
      </div>

      {/* ── প্রিন্ট পোর্টাল: পেজ মাঝখানে (margin: 0 auto), Chrome Scale যাই হোক ── */}
      {createPortal(
        <div className="print-portal">
          {pages.map((rows, pageIndex) => {
            const offset = pages.slice(0, pageIndex).reduce((s, c) => s + c.length, 0);
            const isLast = pageIndex === pages.length - 1;
            return (
              <div
                key={pageIndex}
                className="print-page-outer"
                style={{
                  width: `${PRINT_OUT_W}px`,
                  height: `${PRINT_OUT_H}px`,
                  overflow: "hidden",
                  margin: "0 auto",
                  padding: 0,
                  pageBreakAfter: isLast ? "auto" : "always",
                  breakAfter: isLast ? "auto" : "page",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}
              >
                <div style={printPageBox}>
                  {renderPage(rows, offset, pageIndex === 0, isLast)}
                </div>
              </div>
            );
          })}
        </div>,
        document.body
      )}

      <style>{`
        .print-portal { display: none; }
        @media print {
          @page { size: A4 landscape; margin: ${PRINT_MARGIN_MM}mm; }
          html, body {
            margin: 0 !important; padding: 0 !important;
            width: auto !important;
            height: auto !important; overflow: visible !important;
            background: #fff !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body > *:not(.print-portal) { display: none !important; }
          .print-portal { display: block !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
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