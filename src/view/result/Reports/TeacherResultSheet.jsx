import { useEffect, useId, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import useTranslate from "../../../utils/Translate";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   HELPERS & CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const toBn = (v) =>
  v === undefined || v === null ? "" : String(v).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

const fmt2 = (n) => toBn((Number(n) || 0).toFixed(2));
const fmtPercent = (p) => `${fmt2(p)}%`;
const round2 = (n) => Math.round(n * 100) / 100;

const pickText = (...values) => {
  const found = values.find((v) => typeof v === "string" && v.trim() !== "");
  return found ? found.trim() : "";
};

const bufferToDataUrl = (file) =>
  file?.data ? `data:image/png;base64,${Buffer.from(file.data).toString("base64")}` : null;

const C = { border: "#000", text: "#000" };

const PAGE_W = 1080;
const PAGE_H = 750;
const PAGE_PAD_X = 25;

const COL_SERIAL = 50;
const COL_KITAB = 170;
const COL_SUBCLASS = 150;
const COL_TOTAL = 50;
const COL_EXTRA = 70;

const EMPTY_ARR = [];

/* ═══════════════════════════════════════════════════════════
   🧮 CALCULATION (পুরোটা frontend এ)
   ═══════════════════════════════════════════════════════════ */
const emptyCounts = (divisions) => {
  const o = {};
  divisions.forEach((d) => (o[d.id] = 0));
  return o;
};

// একটি কিতাবের হিসাব
const computeRow = (row, divisions) => {
  const maxNumber = Number(row.maxNumber) || 0;
  const passNumber = Number(row.passNumber) || 0;
  const totalMax = Number(row.totalMax) || 0;

  // মোট-এর min নম্বরকে এই কিতাবের পূর্ণমানের অনুপাতে scale
  const rules = (row.divisionRules || [])
    .map((r) => {
      const minTotal = Number(r.minTotal) || 0;
      return {
        id: Number(r.id),
        minTotal,
        min: totalMax > 0 ? (minTotal / totalMax) * maxNumber : 0,
      };
    })
    .sort((a, b) => b.minTotal - a.minTotal);

  const failId = rules.length ? rules[rules.length - 1].id : null;

  const counts = emptyCounts(divisions);
  let sum = 0;
  let n = 0;

  for (const raw of row.marks || []) {
    const mark = Number(raw) || 0;
    let divId;
    if (mark < passNumber) divId = failId;
    else {
      const hit = rules.find((r) => mark >= r.min);
      divId = hit ? hit.id : failId;
    }
    sum += mark;
    n += 1;
    if (divId == null) continue;
    counts[divId] = (counts[divId] || 0) + 1;
  }

  const cells = {};
  divisions.forEach((d) => {
    const c = counts[d.id] || 0;
    cells[d.id] = { count: c, percent: n ? round2((c / n) * 100) : 0 };
  });

  const average = n ? sum / n : 0; // গড় নম্বর
  const point = maxNumber > 0 ? (average / maxNumber) * 100 : 0; // পয়েন্ট = গড়ের শতকরা

  return { counts, cells, total: n, sum, maxSum: n * maxNumber, average, point };
};

// কয়েকটি রো-এর যোগফল
const sumRows = (computedRows, divisions) => {
  const counts = emptyCounts(divisions);
  let total = 0,
    sum = 0,
    maxSum = 0;
  computedRows.forEach((r) => {
    divisions.forEach((d) => (counts[d.id] += r.counts[d.id] || 0));
    total += r.total;
    sum += r.sum;
    maxSum += r.maxSum;
  });
  const percents = {};
  divisions.forEach((d) => {
    percents[d.id] = total ? round2((counts[d.id] / total) * 100) : 0;
  });
  return {
    counts,
    percents,
    total,
    average: total ? sum / total : 0,
    point: maxSum > 0 ? (sum / maxSum) * 100 : 0,
  };
};

/* ═══════════════════════════════════════════════════════════
   LOCAL STORAGE
   ═══════════════════════════════════════════════════════════ */
const MODE_OPTIONS = [
  { key: "all", label: "শিক্ষক ভিত্তিক ফলাফল" },
  { key: "single", label: "একক শিক্ষক ভিত্তিক ফলাফল" },
];

const LS_MODE = "teacherResultSheetMode";
const LS_OPTS = "teacherResultSheetOptions";
const DEFAULT_OPTS = {
  showPercent: false, // ঘরে "সংখ্যা(%)"
  showAverage: true, // গড় নম্বর কলাম (শুধু একক শিক্ষক)
  showPoint: true, // পয়েন্ট কলাম (শুধু একক শিক্ষক)
  showTeacherTotal: false, // প্রতি শিক্ষকের নিচে মোট (শিক্ষক ভিত্তিক)
};

const loadOpts = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_OPTS));
    if (saved && typeof saved === "object") return { ...DEFAULT_OPTS, ...saved };
  } catch (e) { }
  return { ...DEFAULT_OPTS };
};

const loadMode = () => {
  try {
    const saved = localStorage.getItem(LS_MODE);
    if (saved && MODE_OPTIONS.some((o) => o.key === saved)) return saved;
  } catch (e) { }
  return "all";
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   props: reportData (reportid 5)
   ═══════════════════════════════════════════════════════════ */
export default function TeacherResultSheet({ reportData }) {
  const translate = useTranslate();
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const selectedTeacherID = useWatch({ name: "TeacherID" });

  const [logo, setLogo] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [opts, setOpts] = useState(loadOpts);
  const [mode, setMode] = useState(loadMode);

  useEffect(() => {
    localStorage.setItem(LS_OPTS, JSON.stringify(opts));
  }, [opts]);

  useEffect(() => {
    localStorage.setItem(LS_MODE, mode);
  }, [mode]);

  useEffect(() => {
    setLogo(bufferToDataUrl(institutionInfo?.Logo));
    setPrincipal(bufferToDataUrl(institutionInfo?.SignaturePrincipal));
  }, [institutionInfo]);

  const isSingle = mode === "single";

  /* ── Data ── */
  const divisions = reportData?.divisions || EMPTY_ARR;
  const allTeachers = reportData?.teachers || EMPTY_ARR;

  const institutionName = pickText(institutionInfo?.InstitutionName) || "জামেয়া রশীদিয়া";
  const institutionAddress =
    pickText(institutionInfo?.Address) || "লক্ষ্মীপুর, লস্করহাট, ফেনী, বাংলাদেশ";
  const examName = pickText(reportData?.examName);
  const sessionName = pickText(reportData?.sessionName);

  const showAverage = isSingle && opts.showAverage;
  const showPoint = isSingle && opts.showPoint;
  const extraCols = (showAverage ? 1 : 0) + (showPoint ? 1 : 0);
  const totalCols = divisions.length + 4 + extraCols;

  // একক শিক্ষক হলে শুধু নির্বাচিত শিক্ষক
  const visibleTeachers = useMemo(() => {
    if (!isSingle) return allTeachers;
    if (selectedTeacherID === undefined || selectedTeacherID === null || selectedTeacherID === "")
      return EMPTY_ARR;
    return allTeachers.filter((t) => String(t.teacherID) === String(selectedTeacherID));
  }, [allTeachers, isSingle, selectedTeacherID]);

  /* ── সব হিসাব এখানে ── */
  const computed = useMemo(() => {
    let serial = 0;
    const list = visibleTeachers.map((t) => {
      const rows = (t.rows || []).map((r) => {
        serial += 1;
        return { ...r, serial, calc: computeRow(r, divisions) };
      });
      return {
        teacherID: t.teacherID,
        teacherName: t.teacherName,
        rows,
        totals: sumRows(
          rows.map((r) => r.calc),
          divisions
        ),
      };
    });
    const grand = sumRows(
      list.flatMap((t) => t.rows.map((r) => r.calc)),
      divisions
    );
    return { teachers: list, grand };
  }, [visibleTeachers, divisions]);

  const hasRows = computed.teachers.some((t) => t.rows.length > 0);
  const singleTeacherName = computed.teachers[0]?.teacherName || "";
  const noTeacherSelected =
    isSingle &&
    (selectedTeacherID === undefined || selectedTeacherID === null || selectedTeacherID === "");

  const fmtCell = (c) =>
    opts.showPercent
      ? `${toBn(c?.count ?? 0)}(${fmtPercent(c?.percent ?? 0)})`
      : toBn(c?.count ?? 0);

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
    whiteSpace: "normal",
    lineHeight: 1.2,
    padding: "3px 4px",
  };
  const leftCell = { ...cell, textAlign: "start", paddingInlineStart: "8px", whiteSpace: "normal" };
  const summaryLabel = { ...cell, textAlign: "right", paddingInlineEnd: "10px" };
  const bold = { ...cell, fontWeight: 600 };
  const teacherRowCell = {
    padding: "5px 6px",
    textAlign: "start",
    fontSize: "13px",
    fontWeight: 500,
    color: C.text,
    background: "#fff",
    borderTop: `1px solid ${C.border}`,
    borderBottom: `1px solid ${C.border}`,
    borderLeft: "none",
    borderRight: "none",
  };
  const rowNoBreak = { breakInside: "avoid", pageBreakInside: "avoid" };

  /* ── Header ── */
  const renderHeader = () => (
    <div style={{ marginBottom: "8px" }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "100px",
        }}
      >
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
          <p style={{ fontSize: "14px", margin: "2px 0", color: C.text }}>{institutionAddress}</p>
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
            {isSingle ? "একক শিক্ষক ভিত্তিক ফলাফল" : "শিক্ষক ভিত্তিক ফলাফল"}
          </div>
        </div>
      </div>

      {isSingle && singleTeacherName && (
        <div
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: C.text,
            marginTop: "2px",
            marginBottom: "4px",
          }}
        >
          শিক্ষকের নাম : {singleTeacherName}
        </div>
      )}
    </div>
  );

  /* ── Summary rows (মোট + শতকরা) ── */
  const renderSummary = (totals, label = "মোট", withSpacer = true) => (
    <>
      {withSpacer && (
        <tr style={rowNoBreak}>
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
      )}
      <tr style={rowNoBreak}>
        <td colSpan={3} style={summaryLabel}>
          {label}
        </td>
        {divisions.map((d) => (
          <td key={d.id} style={bold}>
            {toBn(totals.counts?.[d.id] ?? 0)}
          </td>
        ))}
        {showAverage && <td style={bold}>{fmt2(totals.average)}</td>}
        {showPoint && <td style={bold}>{fmt2(totals.point)}</td>}
        <td style={bold}>{toBn(totals.total ?? 0)}</td>
      </tr>
      <tr style={rowNoBreak}>
        <td colSpan={3} style={summaryLabel}>
          শতকরা হারে
        </td>
        {divisions.map((d) => (
          <td key={d.id} style={bold}>
            {fmtPercent(totals.percents?.[d.id] ?? 0)}
          </td>
        ))}
        {showAverage && <td style={cell}></td>}
        {showPoint && <td style={cell}></td>}
        <td style={cell}></td>
      </tr>
    </>
  );

  /* ── Table ── */
  const renderTable = () => (
    <table
      style={{
        width: "100%",
        maxWidth: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        border: `2px solid ${C.border}`,
        boxSizing: "border-box",
      }}
    >
      <colgroup>
        <col style={{ width: `${COL_SERIAL}px` }} />
        <col style={{ width: `${COL_KITAB}px` }} />
        <col style={{ width: `${COL_SUBCLASS}px` }} />
        {divisions.map((d) => (
          <col key={d.id} />
        ))}
        {showAverage && <col style={{ width: `${COL_EXTRA}px` }} />}
        {showPoint && <col style={{ width: `${COL_EXTRA}px` }} />}
        <col style={{ width: `${COL_TOTAL}px` }} />
      </colgroup>

      <thead style={{ display: "table-header-group" }}>
        <tr>
          <th style={headCell}>ক্রমিক</th>
          <th style={headCell}>কিতাব</th>
          <th style={headCell}>সাব ক্লাস</th>
          {divisions.map((d) => (
            <th key={d.id} style={headCell}>
              {d.name}
            </th>
          ))}
          {showAverage && <th style={headCell}>গড় নম্বর</th>}
          {showPoint && <th style={headCell}>পয়েন্ট</th>}
          <th style={headCell}>মোট</th>
        </tr>
      </thead>

      <tbody>
        {!hasRows ? (
          <tr>
            <td style={cell} colSpan={totalCols}>
              {noTeacherSelected
                ? "সাইডবার থেকে শিক্ষক নির্বাচন করুন।"
                : "কোনো ডেটা পাওয়া যায়নি।"}
            </td>
          </tr>
        ) : (
          computed.teachers.map((t) => (
            <TeacherGroup key={t.teacherID}>
              {!isSingle && (
                <tr style={rowNoBreak}>
                  <td colSpan={totalCols} style={teacherRowCell}>
                    শিক্ষকের নাম : {t.teacherName}
                  </td>
                </tr>
              )}

              {t.rows.map((r) => (
                <tr key={`${t.teacherID}-${r.subClassID}-${r.subjectID}`} style={rowNoBreak}>
                  <td style={cell}>{toBn(r.serial)}</td>
                  <td style={leftCell}>{r.subjectName}</td>
                  <td style={leftCell}>{r.subClassName}</td>
                  {divisions.map((d) => (
                    <td key={d.id} style={cell}>
                      {fmtCell(r.calc.cells[d.id])}
                    </td>
                  ))}
                  {showAverage && <td style={cell}>{fmt2(r.calc.average)}</td>}
                  {showPoint && <td style={cell}>{fmt2(r.calc.point)}</td>}
                  <td style={cell}>{toBn(r.calc.total)}</td>
                </tr>
              ))}

              {!isSingle && opts.showTeacherTotal && renderSummary(t.totals, "শিক্ষকের মোট", false)}
            </TeacherGroup>
          ))
        )}

        {hasRows && renderSummary(computed.grand, "মোট", true)}
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
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      <div style={{ textAlign: "center", width: "200px" }}>
        {principal && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src={principal} alt="signature" style={{ height: "40px", marginBottom: "5px" }} />
          </div>
        )}
        <div style={{ borderTop: "1px dashed #000", width: "160px", margin: "0 auto" }} />
        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700 }}>মুহতামিম সাহেব</p>
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

  /* ── Sidebar ── */
  const toggle = (key) => setOpts((p) => ({ ...p, [key]: !p[key] }));

  const renderSettingsPanels = () => (
    <>
      <ModeSelector value={mode} onChange={setMode} />

      {isSingle && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
          <p className="text-xs font-bold text-slate-700 leading-tight mb-2">শিক্ষক নির্বাচন</p>
          <DefaultSelect
            label={translate("Teacher")}
            nameField="teacherName"
            registerKey="TeacherID"
            valueField="teacherID"
            options={allTeachers}
            require="This Field is required"
            unicode={true}
          />
        </div>
      )}

      <OptionGroup title="ফলাফল প্রদর্শন" sub="প্রতিটি ঘরে কী দেখাবে">
        <CheckItem
          label="সংখ্যার সাথে শতকরা হার"
          checked={opts.showPercent}
          onChange={() => toggle("showPercent")}
        />
      </OptionGroup>

      {isSingle ? (
        <OptionGroup title="গড় ও পয়েন্ট" sub="কিতাবভিত্তিক অতিরিক্ত কলাম">
          <CheckItem
            label="গড় নম্বর"
            checked={opts.showAverage}
            onChange={() => toggle("showAverage")}
          />
          <CheckItem label="পয়েন্ট" checked={opts.showPoint} onChange={() => toggle("showPoint")} />
          <p className="text-[10px] text-slate-400 leading-snug">
            গড় নম্বর = পরীক্ষার্থীদের নম্বরের গড়। পয়েন্ট = গড় নম্বর ÷ পূর্ণমান × ১০০।
          </p>
        </OptionGroup>
      ) : (
        <OptionGroup title="শিক্ষকভিত্তিক মোট" sub="প্রতি শিক্ষকের নিচে মোট ও শতকরা">
          <CheckItem
            label="শিক্ষকের মোট দেখান"
            checked={opts.showTeacherTotal}
            onChange={() => toggle("showTeacherTotal")}
          />
        </OptionGroup>
      )}

      {/* <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 leading-tight">প্রিন্ট সেটিং</p>
          <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md px-1.5 py-0.5">
            A4 Landscape
          </span>
        </div>
      </div> */}
    </>
  );

  return (
    <div className="flex items-start w-full">
      <aside
        className="hidden lg:flex flex-col w-[300px] shrink-0 bg-white border-r border-slate-200 sticky top-0 print:hidden"
        style={{ height: "calc(100vh - 100px)", overflow: "hidden" }}
      >
        <div className="p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">সেটিং</h2>
          </div>
          <p className="text-xs text-slate-400">রিপোর্টের অপশন ও প্রিন্ট সেটিং</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">{renderSettingsPanels()}</div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <p className="text-[10px] text-slate-400 text-center">© Result Report Generator</p>
        </div>
      </aside>

      <div className="flex-1 min-w-0 w-full">
        <div className="lg:hidden p-4 pb-0 print:hidden">
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">{renderSettingsPanels()}</div>
        </div>

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
          thead { display: table-header-group; }
          tr { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

/* ═══════════ small helpers ═══════════ */
function TeacherGroup({ children }) {
  return <>{children}</>;
}

// desktop sidebar আর mobile panel — দুই জায়গায় radio name আলাদা রাখতে useId
const ModeSelector = ({ value, onChange }) => {
  const groupName = useId();
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-xs font-bold text-slate-700 leading-tight">ফলাফল</p>
      <p className="text-[10px] text-slate-400 leading-tight mt-0.5 mb-2">
        ফলাফল প্রদর্শনের ধরন নির্বাচন করুন
      </p>
      <div role="radiogroup" className="grid grid-cols-1 gap-1.5">
        {MODE_OPTIONS.map((opt) => {
          const checked = value === opt.key;
          return (
            <label
              key={opt.key}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              <input
                type="radio"
                name={`teacherMode-${groupName}`}
                value={opt.key}
                checked={checked}
                onChange={() => onChange(opt.key)}
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

const OptionGroup = ({ title, sub, children }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-1.5">
    <div>
      <p className="text-xs font-bold text-slate-700 leading-tight">{title}</p>
      {sub && <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub}</p>}
    </div>
    {children}
  </div>
);

const CheckItem = ({ label, checked, onChange }) => (
  <label
    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer select-none text-xs transition-colors ${checked
      ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-medium"
      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 accent-emerald-600 cursor-pointer"
    />
    <span>{label}</span>
  </label>
);