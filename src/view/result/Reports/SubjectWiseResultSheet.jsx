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
    totalStudents: "মোট শিক্ষার্থী",
    totalExaminees: "মোট পরীক্ষার্থী",
    totalAbsent: "মোট অনুপস্থিত",
    avgResultTitle: "গড় পরিবেশিত ফলাফল",
    subjectResultTitle: "বিষয় পরিবেশিত ফলাফল",
    className: "শ্রেণির নাম",
    teacherName: "শিক্ষকের নাম",
    total: "মোট",
    sl: "ক্রমিক",
    subject: "বিষয়",
    principalTitle: "মুহতামিম সাহেব",
    date: "তারিখ",
    divisionFallback: "বিভাগ",
  },
  en: {
    totalStudents: "Total Students",
    totalExaminees: "Total Examinees",
    totalAbsent: "Total Absent",
    avgResultTitle: "Average Result",
    subjectResultTitle: "Subject-wise Result",
    className: "Class Name",
    teacherName: "Teacher's Name",
    total: "Total",
    sl: "SL",
    subject: "Subject",
    principalTitle: "Principal",
    date: "Date",
    divisionFallback: "Division",
  },
  ar: {
    totalStudents: "إجمالي الطلاب",
    totalExaminees: "إجمالي الممتحنين",
    totalAbsent: "إجمالي الغائبين",
    avgResultTitle: "نتيجة المتوسط",
    subjectResultTitle: "النتيجة حسب المادة",
    className: "اسم الصف",
    teacherName: "اسم المعلم",
    total: "المجموع",
    sl: "م",
    subject: "المادة",
    principalTitle: "المدير",
    date: "التاريخ",
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

  // ✅ ভাষা Redux slice থেকে আসে (ResultReport এর Language dropdown এটা সেট করে)
  const languageId = useSelector((state) => state.auth.resultLanguageId);
  const lang = LANGUAGE_ID_MAP[Number(languageId)] || DEFAULT_LANGUAGE;

  const t = { ...TRANSLATIONS.bn, ...(TRANSLATIONS[lang] || {}) };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const makeNumber = useMemo(() => makeNum(lang), [lang]);
  const num = makeNumber;

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

  // ✅ ভাষা অনুযায়ী নাম (রেসপন্সের top-level field → না থাকলে conditionAverage → বাংলা fallback)
  const divisionLabel = (d) => pickByLang(lang, d?.name, d?.nameEn, d?.nameAr);

  const institutionName =
    pickByLang(
      lang,
      institutionInfo?.InstitutionName,
      institutionInfo?.EngInstitutionName,
      institutionInfo?.AraInstitutionName
    ) || "জামেয়া রশীদিয়া";

  const institutionAddress =
    pickByLang(
      lang,
      institutionInfo?.Address,
      institutionInfo?.EngAddress,
      institutionInfo?.AraAddress
    ) || "লাকসাম, কুমিল্লা, বাংলাদেশ";

  const examName =
    pickByLang(
      lang,
      reportData?.examName ?? conditionAverage?.Exam?.ExamName,
      reportData?.examNameEn ?? conditionAverage?.Exam?.ExamEngName,
      reportData?.examNameAr ?? conditionAverage?.Exam?.ExamAraName
    ) || "১ম সাময়িক পরীক্ষা";

  const sessionNameRaw =
    pickByLang(
      lang,
      reportData?.sessionName ?? conditionAverage?.Session?.SessionName,
      reportData?.sessionNameEn ?? conditionAverage?.Session?.SessionEngName,
      reportData?.sessionNameAr ?? conditionAverage?.Session?.SessionAraName
    ) || "২০২৬-২০২৭ইং";
  const sessionName = lang === "ar" ? num(sessionNameRaw) : sessionNameRaw;

  const className =
    pickByLang(
      lang,
      reportData?.subClassName ?? conditionAverage?.SubClass?.SubClass,
      reportData?.subClassNameEn ?? conditionAverage?.SubClass?.SubClassEng,
      reportData?.subClassNameAr ?? conditionAverage?.SubClass?.SubClassAra
    ) || "নাহবেমীর (৩য় শ্রেণি)-২";

  const { totalStudents, totalExaminees, totalAbsent } = headerStats;

  const getToday = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return num(`${dd}/${mm}/${yyyy}`);
  };
  const dateText = getToday();

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
      <span style={{ fontWeight: 700 }}>{num(value)}</span>
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
            {t.avgResultTitle}
          </div>
        </div>

        <div style={{ width: "200px", textAlign: "end" }}>
          <div style={{ fontSize: "13px", border: `1px solid ${C.border}` }}>
            {statBox(t.totalStudents, totalStudents)}
            {statBox(t.totalExaminees, totalExaminees)}
            {statBox(t.totalAbsent, totalAbsent, true)}
          </div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "5px" }}>
        <thead>
          <tr>
            <th style={{ ...th, width: "25%" }}>{t.className}</th>
            <th style={{ ...th, width: "25%" }}>{t.teacherName}</th>
            {dynamicDivisions.map((d) => (
              <th key={d.id} style={th}>{divisionLabel(d)}</th>
            ))}
            <th style={th}>{t.total}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>{className}</td>
            <td style={td}></td>
            {dynamicDivisions.map((d) => {
              // divisionSummary এর name সবসময় বাংলা নাম — তাই d.name (বাংলা) দিয়েই মেলানো হচ্ছে
              const match = divisionSummary.find((s) => String(s.name) === String(d.name));
              return <td key={d.id} style={td}>{num(match ? match.count : 0)}</td>;
            })}
            <td style={td}>{num(totalStudents)}</td>
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

    // ✅ বিষয়ের নাম ভাষা অনুযায়ী
    const subjectName = pickByLang(lang, column.name, column.nameEn, column.nameAr);

    return (
      <tr key={column.id} style={{ height: `${ROW_H}px` }}>
        <td style={td}>{num(index + 1)}</td>
        <td style={{ ...textCell, fontWeight: 500 }}>{subjectName}</td>
        <td style={{ ...textCell, fontSize: "11px" }}>{column.teacherName || ""}</td>
        {dynamicDivisions.map((d) => (
          <td key={d.id} style={td}>{num(counts[d.id] || 0)}</td>
        ))}
        <td style={{ ...td, fontWeight: 600 }}>{num(marks.length)}</td>
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
        <p style={{ margin: "4px 0 0", fontSize: "12px", fontWeight: 700 }}>{t.principalTitle}</p>
        <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
          {t.date}: {dateText}
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
          {t.subjectResultTitle}
        </div>
      )}

      {/* ⭐ tableLayout: auto — কলাম টেক্সট অনুযায়ী প্রসারিত হবে */}
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "auto", flexShrink: 0 }}>
        <thead>
          <tr style={{ height: `${THEAD_H}px` }}>
            <th style={{ ...th, width: "1%" }}>{t.sl}</th>
            <th style={th}>{t.subject}</th>
            <th style={{ ...th, width: "200px" }}>{t.teacherName}</th>
            {dynamicDivisions.map((d) => (
              <th key={d.id} style={divTh}>{divisionLabel(d)}</th>
            ))}
            <th style={divTh}>{t.total}</th>
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
                dir={dir}
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
                <div dir={dir} style={printPageBox}>
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
