// view/students/reports/student-report-list/ReportThemeRoot.jsx
//
// রিপোর্ট রেন্ডার এরিয়ার "থিম" র‍্যাপার।
// ⚙️ সেটিং থেকে আসা ফন্ট সাইজ ও জলছাপ এখানে CSS ভ্যারিয়েবল আকারে বসে যায় —
// ফলে BanglaAttendence / ArabicAttendence / SubjectWari / AdmissionFormPdf /
// ReportBuilder — প্রতিটা রিপোর্ট আলাদা করে না বদলেও একই সেটিং মেনে চলে।

import { useMemo } from "react";
import { mergeReportSettings } from "./reportSettingsConstants";

const THEME_CSS = `
  /* ================= ফন্ট সাইজ (⚙️ সেটিং থেকে) ================= */
  .rpt-root .print-page-container,
  .rpt-root .af-form { font-size: var(--rpt-body); }

  .rpt-root .print-page-container h1,
  .rpt-root .af-form h1 { font-size: var(--rpt-inst) !important; line-height: 1.25 !important; }

  .rpt-root .print-page-container h2,
  .rpt-root .af-form h2 { font-size: var(--rpt-title) !important; }

  .rpt-root .print-page-container p,
  .rpt-root .af-form p { font-size: var(--rpt-body) !important; }

  /* টেবিলের হেডার ও ডাটা — measure-layer সহ, নাহলে ReportBuilder এর
     অটো-পেজিনেশন ভুল মাপে পেজ ভাঙবে */
  .rpt-root .print-page-container table th,
  .rpt-root .measure-layer table th { font-size: var(--rpt-thead) !important; }

  .rpt-root .print-page-container table td,
  .rpt-root .measure-layer table td { font-size: var(--rpt-tbody) !important; }

  /* ================= জলছাপ (Watermark) ================= */
  .rpt-root .print-page-container,
  .rpt-root .af-form { position: relative; }

  .rpt-root .print-page-container::before,
  .rpt-root .af-form::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--rpt-wm-image);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: var(--rpt-wm-size) auto;
    opacity: var(--rpt-wm-opacity);
    pointer-events: none;
    z-index: 40;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @media print {
    .rpt-root .print-page-container::before,
    .rpt-root .af-form::before {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

export default function ReportThemeRoot({ settings, watermarkSrc, children }) {
  const s = mergeReportSettings(settings);
  const watermarkOn = Boolean(s.WatermarkEnabled && watermarkSrc);

  const style = useMemo(
    () => ({
      "--rpt-inst": `${s.InstitutionFontSize}px`,
      "--rpt-title": `${s.TitleFontSize}px`,
      "--rpt-body": `${s.BodyFontSize}px`,
      "--rpt-thead": `${s.TableHeadFontSize}px`,
      "--rpt-tbody": `${s.TableBodyFontSize}px`,
      "--rpt-wm-image": watermarkOn ? `url("${watermarkSrc}")` : "none",
      "--rpt-wm-opacity": watermarkOn ? s.WatermarkOpacity / 100 : 0,
      "--rpt-wm-size": `${s.WatermarkSize}%`,
    }),
    [
      s.InstitutionFontSize,
      s.TitleFontSize,
      s.BodyFontSize,
      s.TableHeadFontSize,
      s.TableBodyFontSize,
      s.WatermarkOpacity,
      s.WatermarkSize,
      watermarkOn,
      watermarkSrc,
    ]
  );

  return (
    <div className="rpt-root" style={style}>
      <style>{THEME_CSS}</style>
      {children}
    </div>
  );
}
