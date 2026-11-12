import { useMemo, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";
import ScaledPreview from "../../../components/ScaledPreview";

/* ═══════════════════════════════════════════════════════════
   LANGUAGE
   languageId (Redux: state.auth.resultLanguageId)
   1 = বাংলা, 2 = العربية, 3 = English
   ═══════════════════════════════════════════════════════════ */
const DEFAULT_LANGUAGE = "bn";
const LANGUAGE_ID_MAP = { 1: "bn", 2: "ar", 3: "en" };

const TRANSLATIONS = {
  bn: {
    title: "শিক্ষক ভিত্তিক ফলাফল",
    sl: "ক্রমিক",
    className: "শ্রেণি",
    subject: "বিষয়",
    fullMarks: "পূর্ণমান",
    passMarks: "পাসমার্ক",
    examinees: "পরীক্ষার্থী",
    fail: "ফেল",
    passRate: "পাসের হার",
    grandTotal: "সর্বমোট",
    subjectsCount: "টি বিষয়",
    principalTitle: "মুহতামিম সাহেব",
    date: "তারিখ",
    noData: "কোনো ডেটা পাওয়া যায়নি।",
    divisionFallback: "বিভাগ",
  },
  en: {
    title: "Teacher-wise Result",
    sl: "SL",
    className: "Class",
    subject: "Subject",
    fullMarks: "Full Marks",
    passMarks: "Pass Marks",
    examinees: "Examinees",
    fail: "Fail",
    passRate: "Pass Rate",
    grandTotal: "Grand Total",
    subjectsCount: " subjects",
    principalTitle: "Principal",
    date: "Date",
    noData: "No data found.",
    divisionFallback: "Division",
  },
  ar: {
    title: "النتيجة حسب المعلم",
    sl: "م",
    className: "الصف",
    subject: "المادة",
    fullMarks: "الدرجة الكاملة",
    passMarks: "درجة النجاح",
    examinees: "الممتحنون",
    fail: "الراسبون",
    passRate: "نسبة النجاح",
    grandTotal: "المجموع الكلي",
    subjectsCount: " مواد",
    principalTitle: "المدير",
    date: "التاريخ",
    noData: "لم يتم العثور على بيانات.",
    divisionFallback: "القسم",
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
   HELPERS & CONSTANTS
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

const bufferToDataUrl = (file) =>
  file?.data
    ? `data:image/png;base64,${Buffer.from(file.data).toString("base64")}`
    : null;

// ফেল/স্থগিত ধরনের ডিভিশন — এগুলো আলাদা "ফেল" কলামে দেখানো হয়
const FAIL_NAME_RE = /স্থগিত|ছগিত|রাসিব|fail|^F$/i;
const isFailDivision = (d) =>
  FAIL_NAME_RE.test(String(d?.name ?? "").trim()) ||
  FAIL_NAME_RE.test(String(d?.nameEn ?? "").trim());

// সাদা-কালো থিম
const C = {
  border: "#000",
  text: "#000",
  soft: "#f5f5f5",
  teacherBg: "#e8e8e8",
};

const bg = (color) => ({
  backgroundColor: color,
  boxShadow: `inset 0 0 0 1000px ${color}`,
});

const PAGE_W = 1080;
const PAGE_H = 750;
const ROW_H = 28;

/* ── প্রিন্ট পেজিনেশনের আনুমানিক উচ্চতা (design px) ── */
const PAGE_PAD_V = 40;        // padding 20 + 20
const HEADER_BLOCK_H = 150;   // হেডার ব্লক (fixed)
const THEAD_H = 40;
const SIGNATURE_H = 130;
const PAGE_FOOTER_RESERVE = 20;
const SAFETY = 10;

/* ── প্রিন্ট: A4 landscape, margin 5mm ── */
const PRINT_MARGIN_MM = 5;
const PX_PER_MM = 96 / 25.4;
const PRINT_AREA_W_MM = 297 - PRINT_MARGIN_MM * 2;
const PRINT_SCALE = ((PRINT_AREA_W_MM * PX_PER_MM) / PAGE_W) * 0.99;
const PRINT_OUT_W = Math.floor(PAGE_W * PRINT_SCALE);
const PRINT_OUT_H = Math.floor(PAGE_H * PRINT_SCALE);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function TeacherResultSheet({ reportData }) {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);
  const [principal, setPrincipal] = useState(null);

  // ✅ ভাষা Redux slice থেকে আসে (ResultReport এর Language dropdown এটা সেট করে)
  const languageId = useSelector((state) => state.auth.resultLanguageId);
  const lang = LANGUAGE_ID_MAP[Number(languageId)] || DEFAULT_LANGUAGE;

  const t = { ...TRANSLATIONS.bn, ...(TRANSLATIONS[lang] || {}) };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const num = useMemo(() => makeNum(lang), [lang]);

  useEffect(() => {
    setLogo(bufferToDataUrl(institutionInfo?.Logo));
    setPrincipal(bufferToDataUrl(institutionInfo?.SignaturePrincipal));
  }, [institutionInfo]);

  /* ── Extract Data ── */
  const teachers = Array.isArray(reportData?.teachers) ? reportData.teachers : [];
  const allDivisions = Array.isArray(reportData?.divisions) ? reportData.divisions : [];

  const institutionName =
    pickByLang(
      lang,
      institutionInfo?.InstitutionName,
      institutionInfo?.EngInstitutionName,
      institutionInfo?.AraInstitutionName
    ) || "";
  const institutionAddress =
    pickByLang(
      lang,
      institutionInfo?.Address,
      institutionInfo?.EngAddress,
      institutionInfo?.AraAddress
    ) || "";

  const examName = pickByLang(lang, reportData?.examName, reportData?.examNameEn, reportData?.examNameAr);
  const sessionNameRaw = pickByLang(
    lang,
    reportData?.sessionName,
    reportData?.sessionNameEn,
    reportData?.sessionNameAr
  );
  const sessionName = lang === "ar" ? num(sessionNameRaw) : sessionNameRaw;

  const divisionLabel = (d) =>
    pickByLang(lang, d?.name, d?.nameEn, d?.nameAr) || t.divisionFallback;

  const getToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return num(`${dd}/${mm}/${yyyy}`);
  };
  const dateText = getToday();

  /* ── ফেল ডিভিশনের id সেট ── */
  const failIds = useMemo(
    () => new Set(allDivisions.filter(isFailDivision).map((d) => Number(d.id))),
    [allDivisions]
  );

  /* ── প্রতিটি সারির হিসাব ──
     - ফেল: mark < passNumber
     - ডিভিশন: mark এর শতকরা বনাম ডিভিশন রুলের শতকরা (minTotal / totalMax) */
  const calcRow = (row) => {
    const marks = Array.isArray(row.marks) ? row.marks : [];
    const max = Number(row.maxNumber) || 0;
    const totalMax = Number(row.totalMax) || 0;
    const pass = Number(row.passNumber) || 0;

    const rules = (row.divisionRules || [])
      .filter((r) => !failIds.has(Number(r.id)))
      .map((r) => ({
        id: Number(r.id),
        pct: totalMax > 0 ? ((Number(r.minTotal) || 0) / totalMax) * 100 : 0,
      }))
      .sort((a, b) => b.pct - a.pct);

    const counts = {};
    let fail = 0;

    marks.forEach((m) => {
      if (pass > 0 && m < pass) {
        fail += 1;
        return;
      }
      if (!rules.length) return;
      const pct = max > 0 ? (m / max) * 100 : 0;
      const target = rules.find((r) => pct >= r.pct) || rules[rules.length - 1];
      counts[target.id] = (counts[target.id] || 0) + 1;
    });

    const examinees = marks.length;
    const passed = examinees - fail;
    const rate = examinees > 0 ? (passed / examinees) * 100 : 0;

    return { examinees, fail, counts, rate };
  };

  const teachersView = useMemo(
    () =>
      teachers.map((tch) => ({
        ...tch,
        rows: (tch.rows || []).map((r) => ({ ...r, calc: calcRow(r) })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teachers, failIds]
  );

  /* ── যে ডিভিশনগুলো কোনো সারির রুলে আছে (ফেল ডিভিশন বাদ) — কলাম হিসেবে ── */
  const divisionColumns = useMemo(() => {
    const used = new Set();
    teachers.forEach((tch) =>
      (tch.rows || []).forEach((r) =>
        (r.divisionRules || []).forEach((dr) => used.add(Number(dr.id)))
      )
    );
    return allDivisions.filter(
      (d) => used.has(Number(d.id)) && !failIds.has(Number(d.id))
    );
  }, [teachers, allDivisions, failIds]);

  /* ── সর্বমোট ── */
  const grandTotals = useMemo(() => {
    const acc = { examinees: 0, fail: 0, counts: {} };
    teachersView.forEach((tch) =>
      tch.rows.forEach((r) => {
        acc.examinees += r.calc.examinees;
        acc.fail += r.calc.fail;
        Object.entries(r.calc.counts).forEach(([id, c]) => {
          acc.counts[id] = (acc.counts[id] || 0) + c;
        });
      })
    );
    acc.rate = acc.examinees > 0 ? ((acc.examinees - acc.fail) / acc.examinees) * 100 : 0;
    return acc;
  }, [teachersView]);

  /* ── আইটেম লিস্ট: শিক্ষকের হেডার + সারি + সর্বমোট ── */
  const items = useMemo(() => {
    const list = [];
    teachersView.forEach((tch) => {
      list.push({ type: "teacher", teacher: tch });
      tch.rows.forEach((r, idx) => list.push({ type: "row", teacher: tch, row: r, idx }));
    });
    if (list.length) list.push({ type: "total" });
    return list;
  }, [teachersView]);

  /* ── পেজিনেশন ── */
  const pages = useMemo(() => {
    const n = items.length;
    if (!n) return [[]];

    const avail = (isFirst, withSig) =>
      PAGE_H -
      PAGE_PAD_V -
      (isFirst ? HEADER_BLOCK_H : 0) -
      THEAD_H -
      (withSig ? SIGNATURE_H : 0) -
      PAGE_FOOTER_RESERVE -
      SAFETY;

    const chunks = [];
    let i = 0;
    while (i < n) {
      const isFirst = chunks.length === 0;
      // নতুন পেজের শুরুতে সারি থাকলে শিক্ষকের নাম আবার দেখানো হয় (১টি সারির জায়গা লাগে)
      const cont = !isFirst && items[i].type === "row" ? 1 : 0;
      const capWith = Math.max(1, Math.floor(avail(isFirst, true) / ROW_H) - cont);
      const capNo = Math.max(1, Math.floor(avail(isFirst, false) / ROW_H) - cont);
      const remaining = n - i;

      if (remaining <= capWith) {
        chunks.push(items.slice(i));
        break;
      }

      let take = Math.min(capNo, remaining - 1);
      // পেজের শেষে শুধু শিক্ষকের হেডার পড়ে থাকলে সেটা পরের পেজে নিয়ে যাও
      if (take > 1 && items[i + take - 1].type === "teacher") take -= 1;

      chunks.push(items.slice(i, i + take));
      i += take;
    }
    return chunks;
  }, [items]);

  /* ── Styles ── */
  const th = {
    border: `1px solid ${C.border}`,
    padding: "4px 6px",
    textAlign: "center",
    verticalAlign: "middle",
    fontSize: "12px",
    fontWeight: 600,
    color: C.text,
    whiteSpace: "nowrap",
    ...bg(C.soft),
  };

  const td = {
    border: `1px solid ${C.border}`,
    padding: "0 6px",
    textAlign: "center",
    verticalAlign: "middle",
    height: `${ROW_H}px`,
    lineHeight: `${ROW_H - 2}px`,
    fontSize: "12px",
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
  };

  const textCell = {
    ...td,
    textAlign: "start",
    paddingInlineStart: "8px",
  };

  const colCount = 8 + divisionColumns.length; // sl, class, subject, full, pass, examinees + divisions + fail + rate

  /* ── Header Block ── */
  const renderHeaderBlock = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: `${HEADER_BLOCK_H}px`,
        boxSizing: "border-box",
        overflow: "hidden",
        flexShrink: 0,
        paddingBottom: "10px",
      }}
    >
      <div style={{ width: "120px", display: "flex", justifyContent: "center" }}>
        {logo ? (
          <img src={logo} alt="Logo" style={{ maxHeight: "80px", objectFit: "contain" }} />
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
            fontSize: "22px",
            fontWeight: 800,
            margin: 0,
            color: C.text,
            fontFamily: "serif",
          }}
        >
          {institutionName}
        </h1>
        <p style={{ fontSize: "13px", margin: "2px 0", color: C.text }}>{institutionAddress}</p>
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
          {t.title}
        </div>
      </div>

      <div style={{ width: "120px" }} />
    </div>
  );

  /* ── Table Head ── */
  const renderTableHead = () => (
    <thead>
      <tr style={{ height: `${THEAD_H}px` }}>
        <th style={{ ...th, width: "1%" }}>{t.sl}</th>
        <th style={th}>{t.className}</th>
        <th style={th}>{t.subject}</th>
        <th style={{ ...th, width: "1%" }}>{t.fullMarks}</th>
        <th style={{ ...th, width: "1%" }}>{t.passMarks}</th>
        <th style={{ ...th, width: "1%" }}>{t.examinees}</th>
        {divisionColumns.map((d) => (
          <th key={d.id} style={{ ...th, width: "1%", minWidth: "50px" }}>
            {divisionLabel(d)}
          </th>
        ))}
        <th style={{ ...th, width: "1%" }}>{t.fail}</th>
        <th style={{ ...th, width: "1%" }}>{t.passRate}</th>
      </tr>
    </thead>
  );

  /* ── Rows ── */
  const renderTeacherRow = (tch, key) => {
    const teacherName = pickByLang(lang, tch.teacherName, tch.teacherNameEn, tch.teacherNameAr);
    return (
      <tr key={key} style={{ height: `${ROW_H}px` }}>
        <td
          colSpan={colCount}
          style={{
            ...td,
            textAlign: "start",
            paddingInlineStart: "10px",
            fontWeight: 800,
            fontSize: "13px",
            ...bg(C.teacherBg),
          }}
        >
          {teacherName}
          <span style={{ fontWeight: 500, fontSize: "11px", marginInlineStart: "10px" }}>
            ({num(tch.rows.length)}{t.subjectsCount})
          </span>
        </td>
      </tr>
    );
  };

  const renderSubjectRow = (tch, row, idx, key) => {
    const subjectName = pickByLang(lang, row.subjectName, row.subjectNameEn, row.subjectNameAr);
    const className = pickByLang(lang, row.subClassName, row.subClassNameEn, row.subClassNameAr);
    const { examinees, fail, counts, rate } = row.calc;

    return (
      <tr key={key} style={{ height: `${ROW_H}px` }}>
        <td style={td}>{num(idx + 1)}</td>
        <td style={textCell}>{className}</td>
        <td style={{ ...textCell, fontWeight: 500 }}>{subjectName}</td>
        <td style={td}>{num(row.maxNumber)}</td>
        <td style={td}>{num(row.passNumber)}</td>
        <td style={{ ...td, fontWeight: 700 }}>{num(examinees)}</td>
        {divisionColumns.map((d) => (
          <td key={d.id} style={td}>{num(counts[Number(d.id)] || 0)}</td>
        ))}
        <td style={td}>{num(fail)}</td>
        <td style={{ ...td, fontWeight: 700 }}>{num(rate.toFixed(2))}%</td>
      </tr>
    );
  };

  const renderTotalRow = (key) => (
    <tr key={key} style={{ height: `${ROW_H}px` }}>
      <td
        colSpan={5}
        style={{ ...td, fontWeight: 800, ...bg(C.soft) }}
      >
        {t.grandTotal}
      </td>
      <td style={{ ...td, fontWeight: 800, ...bg(C.soft) }}>{num(grandTotals.examinees)}</td>
      {divisionColumns.map((d) => (
        <td key={d.id} style={{ ...td, fontWeight: 700, ...bg(C.soft) }}>
          {num(grandTotals.counts[Number(d.id)] || 0)}
        </td>
      ))}
      <td style={{ ...td, fontWeight: 700, ...bg(C.soft) }}>{num(grandTotals.fail)}</td>
      <td style={{ ...td, fontWeight: 800, ...bg(C.soft) }}>{num(grandTotals.rate.toFixed(2))}%</td>
    </tr>
  );

  /* ── Signature ── */
  const renderSignature = () => (
    <div
      className="signature-section"
      style={{
        marginTop: "auto",
        paddingTop: "30px",
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
        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700 }}>{t.principalTitle}</p>
        <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
          {t.date}: {dateText}
        </p>
      </div>
    </div>
  );

  /* ── Page ── */
  const renderPage = (pageItems, isFirst, isLast) => {
    const first = pageItems[0];
    // পেজ শুরুতে সারি থাকলে (শিক্ষকের হেডার ছাড়া) শিক্ষকের নাম আবার দেখাও
    const needsContinuation = !isFirst && first && first.type === "row";

    return (
      <>
        {isFirst && renderHeaderBlock()}

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "auto",
            flexShrink: 0,
          }}
        >
          {renderTableHead()}
          <tbody>
            {needsContinuation && renderTeacherRow(first.teacher, "cont")}
            {pageItems.map((it, i) => {
              if (it.type === "teacher") return renderTeacherRow(it.teacher, `t-${i}`);
              if (it.type === "total") return renderTotalRow(`total-${i}`);
              return renderSubjectRow(it.teacher, it.row, it.idx, `r-${i}`);
            })}
          </tbody>
        </table>

        {isLast && renderSignature()}
      </>
    );
  };

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

  const printPageBox = {
    ...pageBox,
    margin: 0,
    height: `${PAGE_H}px`,
    minHeight: `${PAGE_H}px`,
    overflow: "hidden",
    transform: `scale(${PRINT_SCALE})`,
    transformOrigin: "top left",
  };

  if (!items.length) {
    return (
      <div className="w-full p-6 text-center text-slate-500 text-sm">
        {t.noData}
      </div>
    );
  }

  return (
    <div className="flex items-start w-full">
      <div className="flex-1 min-w-0 w-full">
        <div
          className="result-sheet-wrapper w-full overflow-x-hidden"
          style={{ height: "700px", overflowY: "auto" }}
        >
          <div className="no-print p-4">
            <ScaledPreview designWidth={PAGE_W}>
              {pages.map((pageItems, pageIndex) => (
                <div
                  key={pageIndex}
                  dir={dir}
                  style={{
                    ...pageBox,
                    boxShadow: "0 1px 6px rgba(15,23,42,0.18)",
                    marginBottom: "24px",
                  }}
                >
                  {renderPage(pageItems, pageIndex === 0, pageIndex === pages.length - 1)}
                </div>
              ))}
            </ScaledPreview>
          </div>
        </div>
      </div>

      {/* ── প্রিন্ট পোর্টাল: পেজ মাঝখানে (margin: 0 auto), Chrome Scale যাই হোক ── */}
      {createPortal(
        <div className="print-portal">
          {pages.map((pageItems, pageIndex) => {
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
                <div dir={dir} style={printPageBox}>
                  {renderPage(pageItems, pageIndex === 0, isLast)}
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
