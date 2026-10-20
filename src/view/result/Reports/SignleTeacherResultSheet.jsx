import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   HELPERS & CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

// ইংরেজি সংখ্যা → বাংলা সংখ্যা (দশমিক বিন্দু অপরিবর্তিত)
const toBn = (v) =>
  v === undefined || v === null
    ? ""
    : String(v).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

const fmtPercent = (p) => `${toBn((Number(p) || 0).toFixed(2))}%`;

// "১(৭.৬৯%)" ফরম্যাট
const fmtCell = (cell) =>
  `${toBn(cell?.count ?? 0)}(${fmtPercent(cell?.percent ?? 0)})`;

const pickText = (...values) => {
  const found = values.find((v) => typeof v === "string" && v.trim() !== "");
  return found ? found.trim() : "";
};

const bufferToDataUrl = (file) =>
  file?.data
    ? `data:image/png;base64,${Buffer.from(file.data).toString("base64")}`
    : null;

const C = { border: "#000", text: "#000" };

const PAGE_W = 1080;
const PAGE_H = 750;
const PAGE_PAD_X = 25;

// ফিক্সড কলাম প্রস্থ (px)
const COL_SERIAL = 50;
const COL_KITAB = 150;
const COL_SUBCLASS = 150;
const COL_TOTAL = 50;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SignleTeacherResultSheet({ reportData }) {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    setLogo(bufferToDataUrl(institutionInfo?.Logo));
    setPrincipal(bufferToDataUrl(institutionInfo?.SignaturePrincipal));
  }, [institutionInfo]);

  /* ── Extract Data ── */
  const divisions = reportData?.divisions || [];
  const rows = reportData?.rows || [];
  const totals = reportData?.totals || {
    counts: {},
    percents: {},
    grandTotal: 0,
  };
  const teacherName = pickText(reportData?.teacherName);

  const institutionName =
    pickText(institutionInfo?.InstitutionName) || "জামেয়া রশীদিয়া";
  const institutionAddress =
    pickText(institutionInfo?.Address) || "লক্ষ্মীপুর, লস্করহাট, ফেনী, বাংলাদেশ";
  const examName = pickText(reportData?.examName);
  const sessionName = pickText(reportData?.sessionName);

  const totalCols = divisions.length + 4;

  /* ── Styles ── */
  const cell = {
    border: `1px solid ${C.border}`,
    padding: "0 4px",
    textAlign: "center",
    verticalAlign: "middle",
    height: "30px",
    fontSize: "12px",
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    background: "#fff",
    boxSizing: "border-box",
  };

  const headCell = {
    ...cell,
    height: "40px",
    fontWeight: 500,
    whiteSpace: "normal", // ডিভিশনের নাম লম্বা হলে ভাঙবে
    lineHeight: 1.2,
    padding: "3px 4px",
  };

  const leftCell = {
    ...cell,
    textAlign: "start",
    paddingInlineStart: "8px",
    whiteSpace: "normal",
  };

  const summaryLabel = { ...cell, textAlign: "right", paddingInlineEnd: "10px" };

  /* ── Header ── */
  const renderHeader = () => (
    <div style={{ marginBottom: "6px" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100px",
        }}
      >
        {/* Logo (বামে) */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "100px" }}>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              style={{ maxHeight: "90px", maxWidth: "100px", objectFit: "contain" }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: "1px solid #ccc",
              }}
            />
          )}
        </div>

        {/* মাঝখানের টাইটেল */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              margin: 0,
              color: C.text,
              lineHeight: 1.2,
            }}
          >
            {institutionName}
          </h1>
          <p style={{ fontSize: "14px", margin: "2px 0", color: C.text }}>
            {institutionAddress}
          </p>
          <p style={{ fontSize: "16px", margin: "2px 0", color: C.text }}>
            {examName} - {sessionName}
          </p>
          <div
            style={{
              display: "inline-block",
              fontSize: "15px",
              fontWeight: 700,
              marginTop: "4px",
              padding: "0 40px 2px",
              borderBottom: `1.5px solid ${C.border}`,
            }}
          >
            শিক্ষক পরিপ্রেক্ষিতে ফলাফল
          </div>
        </div>
      </div>

      {/* শিক্ষকের নাম */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: 700,
          color: C.text,
          marginTop: "2px",
          marginBottom: "4px",
        }}
      >
        শিক্ষকের নাম : {teacherName}
      </div>
    </div>
  );

  /* ── Table ── */
  const renderTable = () => (
    <table
      style={{
        width: "100%",
        maxWidth: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed", // ⭐ টেবিল কখনো পেজের বাইরে যাবে না
        border: `2px solid ${C.border}`,
        boxSizing: "border-box",
      }}
    >
      {/* ⭐ ফিক্সড কলাম প্রস্থ; ডিভিশন কলামগুলো বাকি জায়গা সমানভাবে ভাগ করে নেবে */}
      <colgroup>
        <col style={{ width: `${COL_SERIAL}px` }} />
        <col style={{ width: `${COL_KITAB}px` }} />
        <col style={{ width: `${COL_SUBCLASS}px` }} />
        {divisions.map((d) => (
          <col key={d.id} />
        ))}
        <col style={{ width: `${COL_TOTAL}px` }} />
      </colgroup>

      <thead>
        <tr>
          <th style={headCell}>ক্রমিক</th>
          <th style={headCell}>কিতাব</th>
          <th style={headCell}>সাব ক্লাস</th>
          {divisions.map((d) => (
            <th key={d.id} style={headCell}>
              {d.name}
            </th>
          ))}
          <th style={headCell}>মোট</th>
        </tr>
      </thead>

      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td style={cell} colSpan={totalCols}>
              কোনো ডেটা পাওয়া যায়নি।
            </td>
          </tr>
        ) : (
          rows.map((r, idx) => (
            <tr key={`${r.subClassID}-${r.subjectID}-${idx}`}>
              <td style={cell}>{toBn(idx + 1)}</td>
              <td style={leftCell}>{r.subjectName}</td>
              <td style={leftCell}>{r.subClassName}</td>
              {divisions.map((d) => (
                <td key={d.id} style={cell}>
                  {fmtCell(r.cells?.[d.id])}
                </td>
              ))}
              <td style={cell}>{toBn(r.total ?? 0)}</td>
            </tr>
          ))
        )}

        {rows.length > 0 && (
          <>
            {/* ছোট ফাঁক (আলাদা সামারি ব্লক) */}
            <tr>
              <td
                colSpan={totalCols}
                style={{
                  height: "5px",
                  padding: 0,
                  borderLeft: "none",
                  borderRight: "none",
                  borderTop: `1px solid ${C.border}`,
                  borderBottom: `1px solid ${C.border}`,
                }}
              />
            </tr>

            {/* মোট */}
            <tr>
              <td colSpan={3} style={summaryLabel}>
                মোট
              </td>
              {divisions.map((d) => (
                <td key={d.id} style={{ ...cell, fontWeight: 600 }}>
                  {toBn(totals.counts?.[d.id] ?? 0)}
                </td>
              ))}
              <td style={{ ...cell, fontWeight: 600 }}>
                {toBn(totals.grandTotal ?? 0)}
              </td>
            </tr>

            {/* শতকরা হারে */}
            <tr>
              <td colSpan={3} style={summaryLabel}>
                শতকরা হারে
              </td>
              {divisions.map((d) => (
                <td key={d.id} style={{ ...cell, fontWeight: 600 }}>
                  {fmtPercent(totals.percents?.[d.id] ?? 0)}
                </td>
              ))}
              <td style={cell}></td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );

  /* ── Signature ── */
  const renderSignature = () => (
    <div
      style={{
        marginTop: "auto",
        paddingTop: "40px",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div style={{ textAlign: "center", width: "200px" }}>
        {principal && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={principal}
              alt="signature"
              style={{ height: "40px", marginBottom: "5px" }}
            />
          </div>
        )}
        <div
          style={{
            borderTop: "1px dashed #000",
            width: "160px",
            margin: "0 auto",
          }}
        />
        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700 }}>
          মুহতামিম সাহেব
        </p>
        <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
          তারিখ: {toBn(new Date().toLocaleDateString("bn-BD"))}
        </p>
      </div>
    </div>
  );

  const renderPage = () => (
    <>
      {renderHeader()}
      {renderTable()}
      {renderSignature()}
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
    padding: `20px ${PAGE_PAD_X}px`,
  };

  return (
    <div className="flex items-start w-full">
      <div className="flex-1 min-w-0 w-full">
        {/* স্ক্রিন প্রিভিউ */}
        <div
          className="result-sheet-wrapper no-print w-full overflow-x-hidden"
          style={{ height: "700px", overflowY: "auto" }}
        >
          <div className="p-4">
            <ScaledPreview designWidth={PAGE_W}>
              <div
                style={{
                  ...pageBox,
                  boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                  marginBottom: "24px",
                }}
              >
                {renderPage()}
              </div>
            </ScaledPreview>
          </div>
        </div>

        {/* প্রিন্টের জন্য আলাদা (scale ছাড়া) কপি */}
        <div className="print-only">
          <div style={{ ...pageBox, padding: "10px 10px" }}>{renderPage()}</div>
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
        }
      `}</style>
    </div>
  );
}