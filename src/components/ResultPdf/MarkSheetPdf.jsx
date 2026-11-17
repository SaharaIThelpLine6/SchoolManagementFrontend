import React from 'react';
import QRCode from "react-qr-code";

import { useGetLabelNameListsQuery } from '../../features/result/resultSilce';
import { bufferToDataUrl } from '../../utils/bufferDataURL';
import {
  toLangCode,
  pickLang,
  getInstitutionAddress,
  getInstitutionName,
  getLangValue,
  getMarkSheetDir,
  getMarkSheetText,
  getPrintDate,
  toLangDigit,
} from '../../Data/MarkSheetConfig';

// ==========================================
// Print CSS — templateId অনুযায়ী accent color
// ==========================================

// ==========================================
// Type metrics per template
// Each design sets its own sizes with Tailwind classes. To resize the text
// without zooming the layout, those sizes are repeated here: at 100% the
// generated CSS matches the design exactly, and the sliders multiply it.
//   name/addr  institution name and address (screen px, print px)
//   cell/head  subject table body and header (screen px, print px)
//   pad        subject table vertical cell padding (screen px, print px)
// A null print value means the template leaves it to the density rules
// below, which shrink crowded tables so they still fit one page.
// ==========================================
// Every text size the templates use. The content-size setting turns each
// one into a rule, so a sheet keeps its design and still resizes as a whole.
const CONTENT_FONT_SIZES = [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 27, 28, 30, 34];

const TYPE_METRICS = {
  'template-1':  { cell: 17,   head: 17,   name: 29, addr: 15,  pad: [10, null] },
  'template-2':  { cell: 16,   head: 16,   name: 26, addr: 13,  pad: [10, null] },
  'template-3':  { cell: 16,   head: 16,   name: 28, addr: 13,  pad: [10, null] },
  'template-4':  { cell: 12,   head: 10,   name: 22, addr: 10,  pad: [8, null] },
  'template-5':  { cell: 11.5, head: 10,   name: 16, addr: 9.5, pad: [6, null] },
  'template-6':  { cell: 11,   head: 10,   name: 18, addr: 10,  pad: [4, 2] },
  'template-7':  { cell: 11,   head: 10,   name: 22, addr: 9.5, pad: [4, 2] },
  'template-8':  { cell: 15,   head: 15,   name: 28, addr: 16,  pad: [4, 2] },
  'template-9':  { cell: 14,   head: 14,   name: 30, addr: 16,  pad: [6, null] },
  'template-10': { cell: 13,   head: 12.5, name: 28, addr: 14,  pad: [4, 2] },
  'template-11': { cell: 14,   head: 14,   name: 32, addr: 15,  pad: [8, null] },
  'template-12': { cell: 13.5, head: 13,   name: 26, addr: 13,  pad: [8, null] },
};

/**
 * Print sizes for a crowded table. These are the same thresholds the
 * templates already used, kept here so resizing does not switch them off.
 */
const getDensity = (totalSubjects) => {
  if (totalSubjects > 20) return { cap: 12.5, pad: 0 };
  if (totalSubjects > 15) return { cap: 13.5, pad: 1 };
  if (totalSubjects > 10) return { cap: 15, pad: 2 };
  return { cap: Infinity, pad: 4 };
};

/**
 * Prefix every selector in a stylesheet so the rules apply inside one
 * element only. Used for the template miniatures, where a dozen sheets are
 * on screen together and each one needs its own type sizes.
 * The stylesheet handed in holds plain rules only — no at-rules — because
 * the caller keeps @page and the print block out of it.
 */
const scopeSelectors = (css, prefix) =>
  css.replace(/(^|\n)([^@\n{}][^{}]*?)\s*\{/g, (whole, lead, selector) => {
    const scoped = selector
      .split(',')
      .map((one) => `${prefix} ${one.trim()}`)
      .join(',\n');
    return `${lead}${scoped} {`;
  });

const getPrintCss = (paperSize, orientation, templateId, sizes = {}) => {
  const pageHeight = getPageHeightMm(paperSize, orientation);

  // ---- Size settings -------------------------------------------------
  // Each one is a percentage. At 100 nothing is emitted at all, so an
  // untouched sheet renders exactly as its template designed it.
  const {
    headerScale = 100, contentFontScale = 100, rowGapScale = 100,
    totalSubjects = 0, scopeId = null,
  } = sizes;
  const m = TYPE_METRICS[templateId] || TYPE_METRICS['template-1'];
  const density = getDensity(totalSubjects);

  const px = (value) => `${Math.round(value * 100) / 100}px`;
  const headerPct = (Number(headerScale) || 100) / 100;
  const fontPct = (Number(contentFontScale) || 100) / 100;
  const gapPct = (Number(rowGapScale) || 100) / 100;

  // Institution name and address — real font sizes, not a zoom, so the
  // header block keeps its own spacing while the text grows or shrinks.
  // One size for both media, for the same reason as the body text above.
  const headerCss = `
.marksheet-page .marksheet-inst-name { font-size: ${px(m.name * headerPct)} !important; }
.marksheet-page .marksheet-inst-address { font-size: ${px(m.addr * headerPct)} !important; }
`;

  // Text size for the whole sheet: the student information, the division
  // breakdown, the result table, the summary cards, the remarks and the
  // footer. Every size a design uses is rescaled by the same factor, so the
  // proportions between the sections stay exactly as drawn, and nothing is
  // zoomed — these are real font sizes with the layout left alone.
  //
  // The rule carries no media query on purpose. Each template also ships a
  // smaller print:text-[..] for most lines, and the shrink is not the same
  // from one section to the next, so printing used to come out with the
  // information boxes smaller than the result table. Declaring one size for
  // both media keeps the printed sheet identical to the preview.
  //
  // The institution name and address are left out: they have their own
  // setting, applied further down.
  const scope = (marker) =>
    `.marksheet-page .${marker}:not(.marksheet-inst-name):not(.marksheet-inst-address)`;
  const contentFontCss = `
${CONTENT_FONT_SIZES.map((n) => `${scope(`ms-fs-${String(n).replace('.', '_')}`)} { font-size: ${px(n * fontPct)} !important; }`).join('\n')}
`;

  // The result table is the only part that grows with the number of
  // subjects, so it keeps the automatic shrink the templates had — now on
  // screen as well, so the preview still matches the print.
  // The class is repeated to outrank the rule above, which carries two
  // :not() clauses and would otherwise win on specificity.
  const tableSel = '.marksheet-page .marks-table-wrap.marks-table-wrap.marks-table-wrap';
  const tableFontCss = `
${tableSel} tbody td { font-size: ${px(Math.min(m.cell, density.cap) * fontPct)} !important; }
${tableSel} thead th { font-size: ${px(m.head * fontPct)} !important; }
`;

  // Row spacing — how much air each row has above and below its text.
  const padPrint = m.pad[1] === null ? density.pad : m.pad[1];
  const rowGapCss = gapPct === 1 ? '' : `
.marksheet-page .marks-table-wrap tbody td,
.marksheet-page .marks-table-wrap thead th {
  padding-top: ${px(m.pad[0] * gapPct)} !important;
  padding-bottom: ${px(m.pad[0] * gapPct)} !important;
}
@media print {
  .marksheet-page .marks-table-wrap tbody td,
  .marksheet-page .marks-table-wrap thead th {
    padding-top: ${px(padPrint * gapPct)} !important;
    padding-bottom: ${px(padPrint * gapPct)} !important;
  }
}
`;
  const palette = {
    'template-2': { th: '#6d28d9', thBorder: '#5b21b6', alt: '#f5f3ff' },
    'template-3': { th: '#b45309', thBorder: '#92400e', alt: '#fffbeb' },
    'template-4': { th: '#000000', thBorder: '#000000', alt: '#fafafa' },
    'template-5': { th: '#0891b2', thBorder: '#0e7490', alt: '#ecfeff' },
    'template-6': { th: '#1c1917', thBorder: '#000000', alt: '#ede7d5', base: '#f5f0e3' },
    'template-7': { th: '#2563eb', thBorder: '#000000', alt: '#fef3c7', base: '#ffffff' },
    'template-8': { th: '#ffffff', thBorder: '#000000', alt: '#ffffff' },
    'template-9': { th: '#2E8B8B', thBorder: '#000000', alt: '#f0fdfa' },
    'template-10': { th: '#1e3a8a', thBorder: '#1e3a8a', alt: '#eff6ff' },
    'template-11': { th: '#1d4ed8', thBorder: '#1e293b', alt: '#eff6ff' },
    'template-12': { th: '#0f5132', thBorder: '#c9a227', alt: '#ecfdf5' },
  };
  const p = palette[templateId] || { th: '#0f766e', thBorder: '#0f766e', alt: '#f0fdfa' };

  // Header text colour follows its own background.
  //
  // The print rule below used to say color:#ffffff whatever the header was.
  // That is right for the dark headers, but template 8's header is white —
  // so its heading row printed white on white and came out completely
  // blank. Reading the background's luminance keeps every template right,
  // including any pale header added later.
  const readableOn = (hex) => {
    const raw = String(hex || '').replace('#', '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#ffffff';

    const channel = (i) => {
      const v = parseInt(full.slice(i, i + 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminance =
      0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);

    return luminance > 0.4 ? '#000000' : '#ffffff';
  };
  const thText = readableOn(p.th);

  // Rules that describe the sheet. With a scopeId they are prefixed so
  // they reach only that one preview, leaving the real sheet alone.
  const sheetCss = `

/* ---------------------------------------------------------------
   One page, one size.
   Every sheet is a column of fixed height: header, then the body,
   then the footer. The body grows to fill the page, so the footer
   always sits on the last line and the remark boxes stretch up
   from it instead of leaving a gap.
   --------------------------------------------------------------- */
.marksheet-page {
  display: flex;
  flex-direction: column;
  min-height: ${pageHeight}mm;
}
.marksheet-page .marksheet-frame {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}
.marksheet-page .marksheet-body {
  flex: 1 1 auto;
  min-height: 0;
}
.marksheet-page .marksheet-body > * {
  flex-shrink: 0;
}
.marksheet-page .marksheet-comments {
  flex: 1 1 auto;
  min-height: 70px;
}
/* The boxes inside the remark row fill the height they are given. */
.marksheet-page .marksheet-comments > * {
  height: 100%;
}

${headerCss}${contentFontCss}${tableFontCss}${rowGapCss}

.marksheet-mode-bw,
.marksheet-mode-bw * {
  color: #000 !important;
  background-color: #ffffff !important;
  background-image: none !important;
  border-color: #000000 !important;
  box-shadow: none !important;
  text-shadow: none !important;
}
.marksheet-mode-bw .marksheet-page .marks-table-wrap thead th,
.marksheet-mode-bw .marksheet-page .marks-table-wrap tbody tr.row-alt td,
.marksheet-mode-bw .marksheet-page .marks-table-wrap tbody tr.row-plain td {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #000000 !important;
  border-color: #000000 !important;
}
.marksheet-mode-bw .marksheet-page .marks-table-wrap {
  border: 1.5px solid #000000 !important;
  border-radius: 0 !important;
}
.marksheet-mode-bw .marksheet-page .marks-table-wrap table {
  border-collapse: collapse !important;
}
.marksheet-mode-bw .marksheet-page .marks-table-wrap th,
.marksheet-mode-bw .marksheet-page .marks-table-wrap td {
  border: 1px solid #000000 !important;
}
.marksheet-mode-bw .marksheet-page .marks-table-wrap tbody tr:last-child td {
  border-bottom: 1px solid #000000 !important;
}
.marksheet-mode-bw .marksheet-page {
  border: 2px solid #000000 !important;
  border-radius: 0 !important;
}
.marksheet-mode-bw .marksheet-header,
.marksheet-mode-bw .marksheet-header * {
  border: 0 !important;
}
.marksheet-mode-bw .section-icon,
.marksheet-mode-bw img {
  filter: grayscale(100%) !important;
  -webkit-filter: grayscale(100%) !important;
}
.marksheet-mode-bw .marksheet-rainbow {
  display: none !important;
}
`;

  if (scopeId) return scopeSelectors(sheetCss, `#${scopeId}`);

  return `
@page { size: ${paperSize} ${orientation}; margin: ${PAGE_MARGIN_MM}mm; }
${sheetCss}
@media print {
  html, body {
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  body * { visibility: hidden !important; }
  #marksheet-print-area,
  #marksheet-print-area * { visibility: visible !important; }
  #marksheet-print-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .marksheet-page {
    width: 100% !important;
    min-height: ${pageHeight}mm !important;
    max-width: none !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    border: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .marksheet-mode-bw .marksheet-page {
    border: 2px solid #000000 !important;
  }
  .marksheet-page.not-last {
    break-after: page !important;
    page-break-after: always !important;
  }
  .marksheet-body > .marksheet-comments {
    min-height: 85px !important;
  }
  .marksheet-page .marks-table-wrap {
    border: 1px solid #e2e8f0 !important;
    overflow: visible !important;
    height: auto !important;
    flex: none !important;
  }
  .marksheet-page .marks-table-wrap table {
    border: 0 !important;
    border-collapse: collapse !important;
  }
  .marksheet-page .marks-table-wrap th,
  .marksheet-page .marks-table-wrap td {
    border-color: #e2e8f0 !important;
  }
  .marksheet-page .marks-table-wrap tbody tr:last-child td {
    border-bottom: 0 !important;
  }
  .marksheet-page .marks-table-wrap tr {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .marksheet-page .marks-table-wrap thead th {
    background-color: ${p.th} !important;
    background-image: none !important;
    color: ${thText} !important;
    border-color: ${p.thBorder} !important;
  }
  .marksheet-page .marks-table-wrap tbody tr.row-alt td {
    background-color: ${p.alt} !important;
  }
  .marksheet-page .marks-table-wrap tbody tr.row-plain td {
    background-color: #ffffff !important;
  }
}
`;
};

// ==========================================
// Helpers
// ==========================================
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBn = (value) => {
  if (value === undefined || value === null) return value;
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

const pick = (...vals) => {
  const found = vals.find((v) => v !== undefined && v !== null && v !== '' && v !== 'null');
  return found === undefined ? '-' : found;
};

const EXACT = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };
const TH_STYLE = { backgroundColor: '#0f766e', color: '#ffffff', ...EXACT };
const TH_STYLE_MODERN = { backgroundColor: '#6d28d9', color: '#ffffff', ...EXACT };
const TH_STYLE_ELEGANT = { backgroundColor: '#b45309', color: '#ffffff', ...EXACT };
const TH_STYLE_MONO = { backgroundColor: '#000000', color: '#ffffff', ...EXACT };
const TH_STYLE_SIDEBAR = { backgroundColor: '#0891b2', color: '#ffffff', ...EXACT };
const TH_STYLE_GAZETTE = { backgroundColor: '#1c1917', color: '#f5f0e3', ...EXACT };
const TH_STYLE_BAUHAUS = { backgroundColor: '#2563eb', color: '#ffffff', ...EXACT };
const TH_STYLE_TRADITIONAL = { backgroundColor: '#2E8B8B', color: '#ffffff', ...EXACT };
const TH_STYLE_TRANSCRIPT = { backgroundColor: '#1e3a8a', color: '#ffffff', ...EXACT };
const TH_STYLE_ORNATE = { backgroundColor: '#1d4ed8', color: '#ffffff', ...EXACT };
const TH_STYLE_ROYAL = { backgroundColor: '#0f5132', color: '#ffffff', ...EXACT };

// ==========================================
// শেয়ার্ড ডাটা ক্যালকুলেশন (৩টি টেমপ্লেটেই ব্যবহার)
// ==========================================
const computeMarkSheetData = ({ student, examSubjects, examConfig = {}, divisions = [], lang }) => {
  const studentSubjects = Array.isArray(student?.subjects) ? student.subjects : [];

  const findSubject = (subjectId) =>
    studentSubjects.find(
      (m) => m?.SubjectID === subjectId || m?.SubjectId === subjectId || m?.subjectId === subjectId
    );

  const getObtainedMark = (subjectId) => {
    const found = findSubject(subjectId);
    if (found) return pick(found?.Marks, found?.ObtainedMark, found?.Mark, 0);
    return '-';
  };
  const getHighestMark = (subjectId, fallback) => {
    const found = findSubject(subjectId);
    if (found) return pick(found?.HighestMark, fallback);
    return pick(fallback);
  };

  const subjects = examSubjects.map((s, i) => ({
    id: s?.ID ?? i + 1,
    subject: pick(getLangValue(s, 'SubjectName', lang), s?.SubjectName),
    fullMark: pick(s?.MaxNumber),
    passMark: pick(s?.PassNumber),
    highestMark: getHighestMark(s?.SubjectID, s?.HighestMark),
    obtainedMark: getObtainedMark(s?.SubjectID),
  }));

  const totalSubjects = examSubjects.length;

  const ultraDense = totalSubjects > 20;
  const veryDense = totalSubjects > 15;
  const dense = totalSubjects > 10;
  const rowPad = ultraDense ? 'print:py-0' : veryDense ? 'print:py-[1px]' : dense ? 'print:py-0.5' : 'print:py-1';
  const rowText = ultraDense ? 'print:text-[12.5px] ms-pfs-12_5' : veryDense ? 'print:text-[13.5px] ms-pfs-13_5' : dense ? 'print:text-[15px] ms-pfs-15' : 'print:text-[17px] ms-pfs-17';

  const divisionRows = [];
  if (Number(examConfig?.ExamType) === 4) {
    const source = examSubjects?.[0] || {};
    for (let i = 1; i <= 14; i++) {
      const dId = source?.[`DivisionID${i}`];
      const dNum = source?.[`DivisionNumber${i}`];
      if (dId === null || dId === undefined || dId === '') continue;
      const found = divisions.find((d) => Number(d.ID) === Number(dId));
      if (!found) continue;
      divisionRows.push({ name: getLangValue(found, 'DivisionNames', lang), number: dNum ?? 0 });
    }
  } else {
    for (let i = 1; i <= 14; i++) {
      const dId = examConfig?.[`DivisionID${i}`];
      const dNum = examConfig?.[`DivisionNumber${i}`];
      if (dId === null || dId === undefined || dId === '') continue;
      const found = divisions.find((d) => Number(d.ID) === Number(dId));
      if (!found) continue;
      divisionRows.push({ name: getLangValue(found, 'DivisionNames', lang), number: dNum ?? 0 });
    }
  }

  const studentName = pick(student?.UserName, student?.StudentName, student?.Name);
  const fatherName = pick(student?.FatherName, student?.FathersName, student?.Father);
  const motherName = pick(student?.MotherName, student?.MothersName, student?.Mother);
  const birthDate = pick(student?.DateOfBirth, student?.DOB, student?.BirthDate);
  const rollNumber = pick(student?.AdmissionSerial);
  const registration = pick(student?.UserCode);
  const divisionName = pick(getLangValue(student, 'DivisionNames', lang));
  const averageMark =
    examConfig?.AverageSubsonkha > 0 && student?.Total !== undefined && student?.Total !== null
      ? (Number(student.Total) / examConfig.AverageSubsonkha).toFixed(2)
      : '-';

  return { subjects, totalSubjects, divisionRows, rowPad, rowText, studentName, fatherName, motherName, birthDate, rollNumber, registration, divisionName, averageMark };
};

// The sheet is designed at A4 portrait width (794px). For the other
// paper/orientation combos the whole sheet is zoomed down (see
// getPaperZoom), so the LAYOUT width here is paper width / zoom —
// after the zoom the page renders at the real paper width while the
// content keeps (or gets more of) its designed room, so nothing
// overflows and nothing spills to a second printed page.
const getPreviewWidth = (paperSize, orientation) => {
  if (paperSize === 'A5' && orientation === 'portrait') return 'max-w-[794px]';   // ×0.70 → ~559px
  if (paperSize === 'A4' && orientation === 'landscape') return 'max-w-[1604px]'; // ×0.70 → ~1123px
  if (paperSize === 'A5' && orientation === 'landscape') return 'max-w-[1588px]'; // ×0.50 → ~794px
  return 'max-w-[794px]';                                                         // A4 portrait ×1
};

// Automatic scale per paper/orientation, applied in preview AND print.
// A5 portrait keeps the design's 794px layout but renders at A5 width;
// landscape pages are much shorter, so they get a stronger zoom to fit
// the page height. printScale/fontScale still multiply on top of this.

const getPaperZoom = (paperSize, orientation) => {
  if (paperSize === 'A5' && orientation === 'portrait') return 0.7;
  if (paperSize === 'A4' && orientation === 'landscape') return 0.7;
  if (paperSize === 'A5' && orientation === 'landscape') return 0.5;
  return 1;
};

// Height of one sheet, in millimetres.
//
// It is measured against the PRINTABLE area, not the paper: @page keeps a
// 5mm margin on each side, so an A4 sheet only offers 297 - 10 = 287mm.
// One more millimetre is given back so that rounding inside the browser can
// never tip a full page onto a second sheet.
//
// The result is divided by the paper zoom because the pages render inside a
// zoomed wrapper — at 0.7 zoom a 284mm box comes out as the 199mm wanted.
//
// Every sheet is locked to this height, so a student with three subjects
// produces exactly the same page as one with fourteen, and the preview is
// the same shape as the print.
const PAGE_MARGIN_MM = 5;   // matches the @page rule below
const PAGE_SAFETY_MM = 1;   // rounding headroom

const getPageHeightMm = (paperSize, orientation) => {
  const paper = paperSize === 'A5' ? [148, 210] : [210, 297];
  const height = orientation === 'landscape' ? paper[0] : paper[1];
  const printable = height - PAGE_MARGIN_MM * 2 - PAGE_SAFETY_MM;
  return Math.round((printable / getPaperZoom(paperSize, orientation)) * 100) / 100;
};

// ==========================================
// Shared field list
// Report 1 (the default template) is the single source of truth for which
// student fields exist. Every template builds its information block from
// this helper, so no template can ever print a field report 1 does not
// have, and a field switched off in the settings disappears everywhere.
// ==========================================
const buildInfoItems = ({
  studentInfoFields = {}, labels = {},
  studentName, fatherName, motherName, birthDate, registration, rollNumber,
  totalStudents, lang,
}) => {
  const ms = (key) => getMarkSheetText(key, lang);

  return [
    studentInfoFields.name && { key: 'name', label: ms('name'), enLabel: 'NAME', value: studentName },
    studentInfoFields.fatherName && { key: 'fatherName', label: ms('fatherName'), enLabel: 'FATHER', value: fatherName },
    studentInfoFields.motherName && { key: 'motherName', label: ms('motherName'), enLabel: 'MOTHER', value: motherName },
    studentInfoFields.dob && { key: 'dob', label: ms('dob'), enLabel: 'DATE OF BIRTH', value: birthDate },
    studentInfoFields.registration && { key: 'registration', label: labels?.StudentIDLabel ?? ms('registration'), enLabel: labels?.StudentIDLabel ?? 'REGISTRATION', value: registration },
    studentInfoFields.admission && { key: 'admission', label: labels?.AdmissionIDLabel ?? ms('admission'), enLabel: labels?.AdmissionIDLabel ?? 'ADMISSION', value: rollNumber },
  // Always shown, under the switchable rows above.
  // { key: 'totalStudents', label: 'মোট পরীক্ষার্থীর সংখ্যা', enLabel: 'TOTAL EXAMINEES', value: totalStudents ?? '-' },
    studentInfoFields.totalStudents !== false && {
      key: 'totalStudents',
      label: ms('totalStudents'),
      enLabel: 'TOTAL EXAMINEES',
      value: totalStudents ?? '-',
    },
  ].filter(Boolean);
};

/**
 * Column totals for the subject table.
 * Only real marks are added up — a missing mark counts as zero instead of
 * being replaced by a sample value.
 */
const sumSubjectMarks = (subjects = []) =>
  subjects.reduce(
    (acc, item) => ({
      fullMark: acc.fullMark + (Number(item.fullMark) || 0),
      passMark: acc.passMark + (Number(item.passMark) || 0),
      highestMark: acc.highestMark + (Number(item.highestMark) || 0),
      obtainedMark: acc.obtainedMark + (Number(item.obtainedMark) || 0),
    }),
    { fullMark: 0, passMark: 0, highestMark: 0, obtainedMark: 0 }
  );

/** Percentage of a single subject — blank when the marks are not numeric. */
const subjectPercent = (obtained, full) => {
  const o = Number(obtained);
  const f = Number(full);
  if (!Number.isFinite(o) || !Number.isFinite(f) || f <= 0) return '-';
  return `${Math.round((o / f) * 100)}%`;
};

/** The four summary values report 1 shows, reused by every template. */
const buildSummaryItems = ({ divisionName, student, averageMark, lang }) => {
  const ms = (key) => getMarkSheetText(key, lang);

  return [
    { key: 'division', label: ms('division'), enLabel: 'DIVISION', value: divisionName },
    { key: 'position', label: ms('meritPosition'), enLabel: 'POSITION', value: student?.Positions ?? '-' },
    { key: 'average', label: ms('average'), enLabel: 'AVERAGE', value: averageMark },
    { key: 'total', label: ms('totalMark'), enLabel: 'TOTAL', value: student?.Total ?? '-' },
  ];
};

// Decorative backgrounds, drawn as inline SVG so nothing has to be uploaded.
const PATTERN_GEOMETRIC =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44' viewBox='0 0 44 44'%3E%3Cg fill='none' stroke='%23b08d2e' stroke-width='1'%3E%3Cpath d='M22 3 L26.5 14 L38 14 L28.8 21.2 L32.3 32.5 L22 25.8 L11.7 32.5 L15.2 21.2 L6 14 L17.5 14 Z'/%3E%3C/g%3E%3C/svg%3E\")";

const PATTERN_MEDALLION =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='%23b08d2e' stroke-width='1.2'%3E%3Ccircle cx='110' cy='110' r='96'/%3E%3Ccircle cx='110' cy='110' r='72'/%3E%3Ccircle cx='110' cy='110' r='48'/%3E%3Ccircle cx='110' cy='110' r='24'/%3E%3Cpath d='M110 14 L110 206 M14 110 L206 110 M42 42 L178 178 M178 42 L42 178'/%3E%3C/g%3E%3C/svg%3E\")";

const PATTERN_LATTICE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Cg fill='none' stroke='%231d4ed8' stroke-width='1'%3E%3Cpath d='M15 0 L30 15 L15 30 L0 15 Z'/%3E%3Ccircle cx='15' cy='15' r='4'/%3E%3C/g%3E%3C/svg%3E\")";

/** Corner ornament used by the framed templates. */
const CornerOrnament = ({ position, color = '#C9A227' }) => {
  const edges = {
    tl: 'top-1.5 left-1.5 border-t-[3px] border-l-[3px] rounded-tl',
    tr: 'top-1.5 right-1.5 border-t-[3px] border-r-[3px] rounded-tr',
    bl: 'bottom-1.5 left-1.5 border-b-[3px] border-l-[3px] rounded-bl',
    br: 'bottom-1.5 right-1.5 border-b-[3px] border-r-[3px] rounded-br',
  };
  return (
    <div
      className={`pointer-events-none absolute h-7 w-7 print:h-5 print:w-5 ${edges[position]}`}
      style={{ borderColor: color }}
    />
  );
};

// ==========================================
// Small components
// ==========================================
const SectionTitle = ({ icon, children, right, accent = 'emerald' }) => {
  const palette = {
    emerald: { text: 'text-emerald-800', icon: 'text-emerald-600', grad: 'from-emerald-200' },
    violet: { text: 'text-violet-800', icon: 'text-violet-600', grad: 'from-violet-200' },
    amber: { text: 'text-amber-800', icon: 'text-amber-600', grad: 'from-amber-200' },
  };
  const p = palette[accent] || palette.emerald;
  return (
    <div className={`flex items-center gap-2 text-[17px] ms-fs-17 print:text-[15px] ms-pfs-15 font-bold ${p.text} mt-6 mb-3 print:mt-1.5 print:mb-1`}>
      <span className={`section-icon ${p.icon}`}>{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
      <div className={`flex-1 h-[2px] bg-gradient-to-r ${p.grad} to-transparent`} />
      {right}
    </div>
  );
};

const InfoRow = ({ label, value, labelW = 'w-[125px]', lang }) => (
  <div className="flex border-b border-slate-200 py-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14">
    <span className={`${labelW} print:w-[105px] shrink-0 text-black font-bold`}>{label}</span>
    <span className="font-bold text-black">{toLangDigit(value, lang)}</span>
  </div>
);

// ==========================================
// DEFAULT: Single Student Mark Sheet (আপনার বর্তমান ডিজাইন)
// ==========================================
const SingleMarkSheet = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 text-slate-800 mb-10 print:mb-0 flex flex-col`}>
      <div className="marksheet-header relative flex flex-col md:flex-row print:flex-row items-center justify-between bg-gradient-to-r from-teal-800 to-emerald-600 px-8 py-4 print:px-5 print:py-2 text-white shrink-0">
        <div className="flex items-center gap-4 print:gap-2.5 mb-3 md:mb-0 print:mb-0">
          <div className="h-[60px] w-[60px] print:h-[46px] print:w-[46px] overflow-hidden rounded-full border-[3px] border-emerald-300 print:border-0 bg-white shadow-md print:shadow-none shrink-0">
            {imageSrc ? (
              <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <span className="text-[12px] ms-fs-12 font-medium text-slate-400">No Logo</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="marksheet-inst-name text-[27px] ms-fs-27 md:text-[29px] print:text-[21px] ms-pfs-21 font-bold leading-tight text-white drop-shadow-sm">
              {toBn(instName || '-')}
            </h1>
            <p className="marksheet-inst-address text-[14px] ms-fs-14 md:text-[15px] print:text-[13px] ms-pfs-13 text-emerald-100 mt-0.5 print:mt-0">
              {toBn(instAddress || '-')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:gap-2 shrink-0">
          <span className="text-[15px] ms-fs-15 md:text-base print:text-[13px] ms-pfs-13 text-emerald-100 whitespace-nowrap">{toBn(session?.SessionName || '-')}</span>
          <span className="text-emerald-300/60 print:text-[13px] ms-pfs-13">|</span>
          <span className="rounded-full border border-emerald-300/50 print:border-0 bg-emerald-700/50 px-3.5 py-1 print:px-2.5 print:py-0.5 text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-semibold text-white shadow-sm print:shadow-none whitespace-nowrap">
            {toBn(ExamName || '-')}
          </span>
        </div>
      </div>

      <div className="marksheet-rainbow h-1 shrink-0 bg-gradient-to-r from-[#e5484d] via-[#facc15] via-[#22c55e] via-[#0ea5e9] to-[#a855f7]" />

      <div className="marksheet-body px-6 md:px-8 pb-8 pt-1 print:px-5 print:pb-2 print:pt-1 flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 mt-0 print:mt-0 shrink-0">
          <div>
            <SectionTitle
              icon="👤"
              right={
                <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-0.5 print:px-2.5 print:py-0 text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-semibold text-white shadow-sm whitespace-nowrap">
                  {toBn(classInfo?.ClassName || '-')}
                </span>
              }
            >
              {ms('studentInfo')}
            </SectionTitle>
            <div className="bg-slate-50/50 rounded-lg p-3 print:p-2 border border-slate-100">
              {infoItems.map((f) => (
                <InfoRow key={f.key} label={f.label} value={f.value} lang={lang} />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon="📝">{ms('markDistribution')}</SectionTitle>
            <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 print:px-2 print:py-1 text-center">
                <p className="text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold text-black">
                  {ms('totalDivisions')} - {toBn(divisionRows.length)} {ms('items')} | {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')}
                </p>
              </div>
              <div className="p-2 print:p-1">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[15px] ms-fs-15 print:text-[14px] ms-pfs-14 py-2 print:py-1">{ms('noDivision')}</div>
                ) : (
                  divisionRows.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold text-black border-b border-dashed border-slate-200 last:border-0">
                      <div className="w-[150px] print:w-[125px] truncate">{item.name}</div>
                      <div className="flex items-center gap-1.5 print:gap-1 text-black">
                        <span>{toBn(totalSubjects)}</span>
                        <span className="text-black">×</span>
                        <span>{toBn(item.number)}</span>
                        <span className="text-black">=</span>
                        <span className="font-bold text-black w-12 print:w-11 text-right">
                          {toBn(totalSubjects * (Number(item.number) || 0))}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 print:mt-1 shrink-0">
          <SectionTitle icon="📊">{ms('subjectResult')}</SectionTitle>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr className="text-center">
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold">{ms('serial')}</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-4 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold text-left">{ms('subject')}</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold">{ms('fullMark')}</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold">{ms('passMark')}</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold whitespace-nowrap">{ms('highestMark')}</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] ms-fs-17 print:text-[14.5px] ms-pfs-14_5 font-bold">{ms('obtainedMark')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#f0fdfa' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ms-fs-17 ${rowText} font-bold`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[17px] ms-fs-17 ${rowText} font-bold text-black`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ms-fs-17 ${rowText} font-bold`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ms-fs-17 ${rowText} font-bold`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ms-fs-17 ${rowText} font-bold`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ms-fs-17 ${rowText} font-bold text-black`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 print:mt-1 shrink-0">
          <SectionTitle icon="🏆">{ms('summary')}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold text-emerald-600">{ms('division')}</p>
              <p className="text-[20px] ms-fs-20 print:text-[16px] ms-pfs-16 font-bold text-emerald-800 leading-tight">{toBn(divisionName)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold text-blue-600">{ms('meritPosition')}</p>
              <p className="text-[20px] ms-fs-20 print:text-[16px] ms-pfs-16 font-bold text-blue-800 leading-tight">{toBn(student?.Positions ?? '-')}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-purple-200 bg-purple-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold text-purple-600">{ms('average')}</p>
              <p className="text-[20px] ms-fs-20 print:text-[16px] ms-pfs-16 font-bold text-purple-800 leading-tight">{toBn(averageMark)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold text-amber-600">{ms('totalMark')}</p>
              <p className="text-[20px] ms-fs-20 print:text-[16px] ms-pfs-16 font-bold text-amber-800 leading-tight">{toBn(student?.Total ?? '-')}</p>
            </div>
          </div>
        </div>

        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-8 pt-6 print:mt-1.5 print:pt-1.5 border-t border-slate-200 flex flex-col">
          <div className="flex flex-col md:flex-row print:flex-row gap-6 print:gap-3 flex-1 min-h-0">
            {showClassTeacherSign && (
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[85px] flex flex-col">
              <p className="text-black font-bold text-[17px] ms-fs-17 print:text-[14px] ms-pfs-14">{ms('classTeacherCommentSign')} :</p>
              <div className="border-b border-dashed border-slate-400 w-2/3 mt-2 print:mt-1.5 text-[16px] ms-fs-16 print:text-[13.5px] ms-pfs-13_5 text-black">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[85px] flex flex-col">
              <p className="text-black font-bold text-[17px] ms-fs-17 print:text-[14px] ms-pfs-14">{ms('guardianCommentSign')} :</p>
              <div className="border-b border-dashed border-slate-400 w-2/3 mt-2 print:mt-1.5"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      <div className="grid grid-cols-5 items-start gap-6 bg-white border-t border-slate-200 px-8 py-6 print:gap-4 print:px-5 print:py-1.5 mt-auto shrink-0">
        <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
          <div className="mt-3 print:mt-0">
            <QRCode size={75} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox="0 0 256 256" />
          </div>
          <div className="mt-3 text-center print:mt-0.5">
            <p className="text-[17px] ms-fs-17 text-black font-bold print:text-[12.5px] ms-pfs-12_5">{ms('verify')}</p>
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[20px] ms-fs-20 font-bold text-black print:text-[14px] ms-pfs-14">{principalName || institution?.PrincipalName || ms('principal')}</p>
            {showDate && <p className="text-[15px] ms-fs-15 text-black font-bold print:text-[12.5px] ms-pfs-12_5">{ms('date')} : {printDate}</p>}
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[20px] ms-fs-20 font-bold text-black print:text-[14px] ms-pfs-14">{najemName || institution?.NajemName || ms('najem')}</p>
            {showDate && <p className="text-[15px] ms-fs-15 text-black font-bold print:text-[12.5px] ms-pfs-12_5">{ms('date')} : {printDate}</p>}
          </div>
        </div>
      </div>

      <div className="mx-8 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center border-t border-slate-200 py-1.5 print:py-0 gap-2 shrink-0">
        <span className="text-[11px] ms-fs-11 print:text-[8.5px] ms-pfs-8_5 font-semibold text-black">
          Software Developed by <span className="font-bold tracking-wide text-black">SAHARAIT</span>
        </span>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 2: Modern Gradient
// ==========================================
const SingleMarkSheetModern = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  const summaryItems = [
    { label: ms('division'), value: divisionName, from: 'from-violet-500', to: 'to-indigo-500', icon: '🏅' },
    { label: ms('meritPosition'), value: student?.Positions ?? '-', from: 'from-indigo-500', to: 'to-blue-500', icon: '🎯' },
    { label: ms('average'), value: averageMark, from: 'from-fuchsia-500', to: 'to-pink-500', icon: '📈' },
    { label: ms('totalMark'), value: student?.Total ?? '-', from: 'from-purple-500', to: 'to-violet-500', icon: '⭐' },
  ];

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-gradient-to-br from-slate-50 to-violet-50/40 shadow-2xl rounded-3xl border-2 border-violet-200 text-slate-800 mb-10 print:mb-0 flex flex-col`}>
      {/* Header */}
      <div className="marksheet-header relative m-3 print:m-2 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-700 to-fuchsia-600 px-6 py-5 print:px-4 print:py-2 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 35%)' }} />
        <div className="relative flex flex-col md:flex-row print:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[58px] w-[58px] print:h-[44px] print:w-[44px] overflow-hidden rounded-2xl ring-2 ring-white/40 bg-white/10 backdrop-blur-sm shrink-0">
              {imageSrc ? (
                <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20"><span className="text-[11px] ms-fs-11 text-white/70">No Logo</span></div>
              )}
            </div>
            <div>
              <h1 className="marksheet-inst-name text-[24px] ms-fs-24 md:text-[26px] print:text-[19px] ms-pfs-19 font-bold leading-tight text-white">
                {toBn(instName || '-')}
              </h1>
              <p className="marksheet-inst-address text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 text-violet-100 mt-0.5">{toBn(instAddress || '-')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-3 py-1 print:px-2.5 print:py-0.5 text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-semibold text-white whitespace-nowrap">
              {toBn(session?.SessionName || '-')}
            </span>
            <span className="rounded-full bg-white text-violet-800 px-3 py-1 print:px-2.5 print:py-0.5 text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-bold whitespace-nowrap">
              {toBn(ExamName || '-')}
            </span>
          </div>
        </div>
      </div>

      <div className="marksheet-rainbow h-1 shrink-0 mx-3 print:mx-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

      <div className="marksheet-body px-4 md:px-6 pb-6 pt-1 print:px-5 print:pb-2 print:pt-1 flex-1 flex flex-col min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-3 mt-3 print:mt-1 shrink-0">
          {/* Student info */}
          <div>
            <SectionTitle
              icon="👤"
              accent="violet"
              right={
                <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 print:px-2.5 print:py-0 text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-bold text-white shadow whitespace-nowrap">
                  {toBn(classInfo?.ClassName || '-')}
                </span>
              }
            >
              {ms('studentInfo')}
            </SectionTitle>
            <div className="rounded-xl bg-white border-l-4 border-violet-500 shadow-sm p-3 print:p-2 border-r border-t border-b border-violet-100">
              {infoItems.map((f) => (
                <InfoRow key={f.key} label={f.label} value={f.value} lang={lang} />
              ))}
            </div>
          </div>

          {/* Division */}
          <div>
            <SectionTitle icon="📝" accent="violet">{ms('markDistribution')}</SectionTitle>
            <div className="rounded-xl overflow-hidden border border-violet-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1.5 print:py-1 text-center">
                <p className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold text-white">
                  {ms('totalDivisions')} - {toBn(divisionRows.length)} {ms('items')} | {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')}
                </p>
              </div>
              <div className="p-2 print:p-1">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[14px] ms-fs-14 py-2">{ms('noDivision')}</div>
                ) : (
                  divisionRows.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold text-slate-800 border-b border-dashed border-violet-100 last:border-0">
                      <div className="w-[150px] print:w-[125px] truncate">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-slate-800">
                        <span>{toBn(totalSubjects)}</span><span>×</span><span>{toBn(item.number)}</span><span>=</span>
                        <span className="font-bold w-12 print:w-11 text-right text-violet-700">{toBn(totalSubjects * (Number(item.number) || 0))}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 print:mt-1 shrink-0">
          <SectionTitle icon="📊" accent="violet">{ms('subjectResult')}</SectionTitle>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-xl border border-violet-200 shadow-sm">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr className="text-center">
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold">{ms('serial')}</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-4 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold text-left">{ms('subject')}</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold">{ms('fullMark')}</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold">{ms('passMark')}</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold whitespace-nowrap">{ms('highestMark')}</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold">{ms('obtainedMark')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#f5f3ff' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold text-violet-700`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[16px] ms-fs-16 ${rowText} font-bold text-black`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold text-violet-700`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 print:mt-1 shrink-0">
          <SectionTitle icon="🏆" accent="violet">{ms('summary')}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
            {summaryItems.map((item, i) => (
              <div key={i} className={`rounded-xl bg-gradient-to-br ${item.from} ${item.to} p-2.5 print:p-1 shadow-md text-white flex flex-col items-center justify-center gap-0.5`}>
                <span className="text-[16px] ms-fs-16 print:text-[13px] ms-pfs-13">{item.icon}</span>
                <p className="text-[12.5px] ms-fs-12_5 print:text-[11.5px] ms-pfs-11_5 font-semibold opacity-90">{item.label}</p>
                <p className="text-[19px] ms-fs-19 print:text-[15.5px] ms-pfs-15_5 font-bold leading-tight">{toBn(item.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-5 pt-4 print:mt-1.5 print:pt-1.5 flex flex-col">
          <div className="flex flex-col md:flex-row print:flex-row gap-4 print:gap-3 flex-1 min-h-0">
            {showClassTeacherSign && (
            <div className="flex-1 rounded-xl border border-violet-200 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col shadow-sm">
              <p className="text-violet-800 font-bold text-[15px] ms-fs-15 print:text-[13.5px] ms-pfs-13_5">{ms('classTeacherCommentSign')} :</p>
              <div className="border-b border-dashed border-violet-300 w-2/3 mt-2 print:mt-1.5 text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 text-slate-700">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="flex-1 rounded-xl border border-violet-200 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col shadow-sm">
              <p className="text-violet-800 font-bold text-[15px] ms-fs-15 print:text-[13.5px] ms-pfs-13_5">{ms('guardianCommentSign')} :</p>
              <div className="border-b border-dashed border-violet-300 w-2/3 mt-2 print:mt-1.5"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-5 items-start gap-6 bg-white/80 backdrop-blur border-t-2 border-violet-200 px-6 py-5 print:gap-4 print:px-5 print:py-1.5 mt-auto shrink-0">
        <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
          <div className="p-1.5 rounded-xl bg-white border border-violet-200 shadow-sm">
            <QRCode size={70} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox="0 0 256 256" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-[13px] ms-fs-13 text-violet-700 font-bold print:text-[11.5px] ms-pfs-11_5">{ms('verify')}</p>
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-violet-300 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[18px] ms-fs-18 font-bold text-violet-900 print:text-[13.5px] ms-pfs-13_5">{principalName || institution?.PrincipalName || ms('principal')}</p>
            {showDate && <p className="text-[13px] ms-fs-13 text-slate-600 font-semibold print:text-[12px] ms-pfs-12">{ms('date')} : {printDate}</p>}
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-violet-300 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[18px] ms-fs-18 font-bold text-violet-900 print:text-[13.5px] ms-pfs-13_5">{najemName || institution?.NajemName || ms('najem')}</p>
            {showDate && <p className="text-[13px] ms-fs-13 text-slate-600 font-semibold print:text-[12px] ms-pfs-12">{ms('date')} : {printDate}</p>}
          </div>
        </div>
      </div>

      <div className="mx-6 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center py-1.5 print:py-0 gap-2 shrink-0">
        <span className="text-[11px] ms-fs-11 print:text-[8.5px] ms-pfs-8_5 font-semibold text-slate-500">
          Software Developed by <span className="font-bold tracking-wide text-violet-700">SAHARAIT</span>
        </span>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 3: Elegant Classic
// ==========================================
const SingleMarkSheetElegant = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  const summaryItems = [
    { label: ms('division'), value: divisionName },
    { label: ms('meritPosition'), value: student?.Positions ?? '-' },
    { label: ms('average'), value: averageMark },
    { label: ms('totalMark'), value: student?.Total ?? '-' },
  ];

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-[#fffdf7] shadow-xl rounded-lg text-slate-800 mb-10 print:mb-0 flex flex-col`}>
      {/* Elegant double gold border overlay */}
      <div className="pointer-events-none absolute inset-1.5 rounded-md border-2 border-amber-600/70" />
      <div className="pointer-events-none absolute inset-3 rounded-sm border border-amber-400/60" />

      <div className="marksheet-frame relative flex flex-1 flex-col min-h-0">
        {/* Elegant header */}
        <div className="marksheet-header relative bg-gradient-to-b from-amber-50 to-white px-8 py-5 print:px-6 print:py-2 border-b-2 border-amber-600">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-[62px] w-[62px] print:h-[46px] print:w-[46px] overflow-hidden rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-white bg-white shrink-0">
              {imageSrc ? (
                <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-amber-50"><span className="text-[11px] ms-fs-11 text-amber-400">No Logo</span></div>
              )}
            </div>
            <div>
              <h1 className="marksheet-inst-name text-[26px] ms-fs-26 md:text-[28px] print:text-[20px] ms-pfs-20 font-bold leading-tight text-amber-900 tracking-wide">
                {toBn(instName || '-')}
              </h1>
              <p className="marksheet-inst-address text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 text-amber-700 italic mt-0.5">{toBn(instAddress || '-')}</p>
            </div>
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent print:w-24" />
            <div className="flex flex-wrap items-center justify-center gap-3 print:gap-2">
              <span className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 text-amber-800 font-semibold whitespace-nowrap">
                {ms('session')}: {toBn(sessionName || '-')}
              </span>
              <span className="text-amber-400">❖</span>
              <span className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 text-amber-800 font-semibold whitespace-nowrap">
                {ms('exam')}: {toBn(ExamName || '-')}
              </span>
              <span className="text-amber-400">❖</span>
              <span className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 text-amber-800 font-semibold whitespace-nowrap">
                {ms('className')}: {toBn(classInfo?.ClassName || '-')}
              </span>
            </div>
          </div>
        </div>

        <div className="marksheet-rainbow h-[3px] mx-4 print:mx-3 bg-gradient-to-r from-amber-300 via-amber-600 to-amber-300" />

        <div className="marksheet-body px-6 pb-6 pt-2 print:px-5 print:pb-2 print:pt-1 flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-3 mt-2 print:mt-1 shrink-0">
            {/* Student info */}
            <div>
              <SectionTitle icon="◆" accent="amber">{ms('studentInfo')}</SectionTitle>
              <div className="rounded-md bg-white border border-amber-300 p-3 print:p-2">
              {infoItems.map((f) => (
                <InfoRow key={f.key} label={f.label} value={f.value} lang={lang} />
              ))}
              </div>
            </div>

            {/* Division */}
            <div>
              <SectionTitle icon="◆" accent="amber">{ms('markDistribution')}</SectionTitle>
              <div className="rounded-md overflow-hidden border border-amber-300 bg-white">
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 border-b border-amber-300 px-3 py-1.5 print:py-1 text-center">
                  <p className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold text-amber-900">
                    {ms('totalDivisions')} - {toBn(divisionRows.length)} {ms('items')} | {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')}
                  </p>
                </div>
                <div className="p-2 print:p-1">
                  {divisionRows.length === 0 ? (
                    <div className="text-center text-amber-400 text-[14px] ms-fs-14 py-2">{ms('noDivision')}</div>
                  ) : (
                    divisionRows.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-semibold text-amber-900 border-b border-dotted border-amber-300 last:border-0">
                        <div className="w-[150px] print:w-[125px] truncate">{item.name}</div>
                        <div className="flex items-center gap-1.5">
                          <span>{toBn(totalSubjects)}</span><span className="text-amber-500">×</span>
                          <span>{toBn(item.number)}</span><span className="text-amber-500">=</span>
                          <span className="font-bold w-12 print:w-11 text-right text-amber-800">{toBn(totalSubjects * (Number(item.number) || 0))}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-5 print:mt-1 shrink-0">
            <SectionTitle icon="◆" accent="amber">{ms('subjectResult')}</SectionTitle>
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-md border-2 border-amber-600 shadow-sm">
              <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide">{ms('serial')}</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-4 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide text-left">{ms('subject')}</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide">{ms('fullMark')}</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide">{ms('passMark')}</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide whitespace-nowrap">{ms('highestMark')}</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tracking-wide">{ms('obtainedMark')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#fffbeb' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-semibold text-amber-800`}>{toBn(index + 1)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[16px] ms-fs-16 ${rowText} font-semibold text-black`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-semibold`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-semibold`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-semibold`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ms-fs-16 ${rowText} font-bold text-amber-800`}>{toBn(item.obtainedMark)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-5 print:mt-1 shrink-0">
            <SectionTitle icon="◆" accent="amber">{ms('summary')}</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-0.5 rounded-md border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-2.5 print:p-1 shadow-sm">
                  <p className="text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-semibold text-amber-700">{item.label}</p>
                  <p className="text-[19px] ms-fs-19 print:text-[15.5px] ms-pfs-15_5 font-bold text-amber-900 leading-tight">{toBn(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments mt-5 pt-4 print:mt-1.5 print:pt-1.5 flex flex-col">
            <div className="flex flex-col md:flex-row print:flex-row gap-4 print:gap-3 flex-1 min-h-0">
              {showClassTeacherSign && (
              <div className="flex-1 rounded-md border border-amber-300 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col">
                <p className="text-amber-900 font-bold text-[15px] ms-fs-15 print:text-[13.5px] ms-pfs-13_5">{ms('classTeacherCommentSign')} :</p>
                <div className="border-b border-dotted border-amber-400 w-2/3 mt-2 print:mt-1.5 text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 text-slate-700">{student?.Note ?? ''}</div>
              </div>
              )}
              {showGuardianSign && (
              <div className="flex-1 rounded-md border border-amber-300 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col">
                <p className="text-amber-900 font-bold text-[15px] ms-fs-15 print:text-[13.5px] ms-pfs-13_5">{ms('guardianCommentSign')} :</p>
                <div className="border-b border-dotted border-amber-400 w-2/3 mt-2 print:mt-1.5"></div>
              </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-5 items-start gap-6 bg-gradient-to-t from-amber-50 to-white border-t-2 border-amber-600 px-6 py-5 print:gap-4 print:px-5 print:py-1.5 mt-auto shrink-0">
          <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
            <div className="p-1 rounded-md bg-white border border-amber-400">
              <QRCode size={68} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-[12px] ms-fs-12 text-amber-800 font-bold print:text-[11px] ms-pfs-11">{ms('verify')}</p>
            </div>
          </div>
          <div className="col-span-2 flex w-full flex-col items-center">
            <div className="h-16 w-full flex items-end justify-center print:h-8">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="mt-2 w-full border-t-2 border-double border-amber-600 print:mt-0.5"></div>
            <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
              <p className="text-[18px] ms-fs-18 font-bold text-amber-900 print:text-[13.5px] ms-pfs-13_5">{principalName || institution?.PrincipalName || ms('principal')}</p>
              {showDate && <p className="text-[13px] ms-fs-13 text-amber-700 font-semibold print:text-[12px] ms-pfs-12">{ms('date')} : {printDate}</p>}
            </div>
          </div>
          <div className="col-span-2 flex w-full flex-col items-center">
            <div className="h-16 w-full flex items-end justify-center print:h-8">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="mt-2 w-full border-t-2 border-double border-amber-600 print:mt-0.5"></div>
            <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
              <p className="text-[18px] ms-fs-18 font-bold text-amber-900 print:text-[13.5px] ms-pfs-13_5">{najemName || institution?.NajemName || ms('najem')}</p>
              {showDate && <p className="text-[13px] ms-fs-13 text-amber-700 font-semibold print:text-[12px] ms-pfs-12">{ms('date')} : {printDate}</p>}
            </div>
          </div>
        </div>

        <div className="mx-6 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center py-1.5 print:py-0 gap-2 shrink-0">
          <span className="text-[11px] ms-fs-11 print:text-[8.5px] ms-pfs-8_5 font-semibold text-amber-700">
            Software Developed by <span className="font-bold tracking-wide text-amber-900">SAHARAIT</span>
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 4: Minimalist Mono (editorial / Swiss style)
// ==========================================
const SingleMarkSheetMinimal = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, rowPad, studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark, divisionRows, totalSubjects,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-black border border-black mb-10 print:mb-0 flex flex-col`}>
      {/* ── Header: uppercase, thin */}
      <div className="marksheet-header flex flex-col md:flex-row print:flex-row items-start justify-between gap-4 px-8 py-5 print:px-5 print:py-2 border-b border-black">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 print:h-11 print:w-11 shrink-0 overflow-hidden border border-black flex items-center justify-center">
            {imageSrc
              ? <img src={imageSrc} className="h-full w-full object-contain p-0.5" alt="" />
              : <span className="text-[8px] ms-fs-8 tracking-widest">LOGO</span>}
          </div>
          <div>
            <h1 className="marksheet-inst-name text-[22px] ms-fs-22 print:text-[17px] ms-pfs-17 font-bold uppercase tracking-[0.08em] leading-none">
              {toBn(instName || '-')}
            </h1>
            <p className="marksheet-inst-address text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 text-zinc-500 uppercase tracking-[0.25em] mt-1.5">
              {toBn(instAddress || '-')}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right print:text-right shrink-0">
          <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.25em] text-zinc-500">Session</div>
          <div className="text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-bold uppercase tracking-wide leading-tight">{toBn(session?.SessionName || '-')}</div>
          <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.25em] text-zinc-500 mt-2">Examination</div>
          <div className="text-[13px] ms-fs-13 print:text-[12px] ms-pfs-12 font-bold uppercase tracking-wide leading-tight">{toBn(ExamName || '-')}</div>
        </div>
      </div>

      {/* Thin bold divider strip */}
      <div className="marksheet-rainbow h-[3px] shrink-0 bg-black" />

      <div className="marksheet-body px-8 pb-4 pt-3 print:px-5 print:pb-1 print:pt-1.5 flex-1 flex flex-col min-h-0">
        {/* ── Info grid: 3 columns, uppercase labels */}
        <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-2.5 print:gap-y-1.5 shrink-0">
          {infoItems.map((f, i) => (
            <div key={i} className="border-b border-zinc-300 pb-1 print:pb-0.5">
              <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 uppercase tracking-[0.22em] text-zinc-500">{f.label}</div>
              <div className="text-[13.5px] ms-fs-13_5 print:text-[12px] ms-pfs-12 font-semibold truncate">{toBn(f.value)}</div>
            </div>
          ))}
          <div className="border-b border-zinc-300 pb-1 print:pb-0.5">
            <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 uppercase tracking-[0.22em] text-zinc-500">{ms('className')}</div>
            <div className="text-[13.5px] ms-fs-13_5 print:text-[12px] ms-pfs-12 font-semibold">{toBn(classInfo?.ClassName || '-')}</div>
          </div>
        </div>

        {/* ── Divisions: compact inline grid */}
        <div className="mt-4 print:mt-2 shrink-0">
          <div className="flex items-center gap-2 mb-1.5 print:mb-1">
            <span className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.25em] text-zinc-500">{ms('markDistribution')}</span>
            <div className="flex-1 h-px bg-zinc-300" />
            <span className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-zinc-500">{toBn(divisionRows.length)} divisions · {toBn(totalSubjects)} subjects</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-4 gap-x-4 gap-y-1">
            {divisionRows.length === 0
              ? <div className="col-span-full text-zinc-400 italic text-[11px] ms-fs-11">No divisions</div>
              : divisionRows.map((item, i) => (
                <div key={i} className="flex justify-between border-b border-dotted border-zinc-300 pb-0.5 text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5">
                  <span className="truncate">{item.name}</span>
                  <span className="font-semibold tabular-nums ml-2">{toBn(item.number)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── Table: pure black border, uppercase head */}
        <div className="mt-4 print:mt-2 shrink-0">
          <div className="flex items-center gap-2 mb-1.5 print:mb-1">
            <span className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.25em] text-zinc-500">{ms('subjectResult')}</span>
            <div className="flex-1 h-px bg-zinc-300" />
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border border-black">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-left w-12">SL</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-left">{ms('subject')}</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-center">{ms('fullMarkShort')}</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-center">{ms('passMarkShort')}</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-center whitespace-nowrap">{ms('highestMarkShort')}</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold uppercase tracking-[0.15em] text-center">{ms('obtainedMarkShort')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => (
                  <tr key={item.id} className="text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11">
                    <td className={`border-b border-zinc-200 px-3 py-2 print:px-2 ${rowPad} tabular-nums text-zinc-500`}>{toBn(index + 1)}</td>
                    <td className={`border-b border-zinc-200 px-3 py-2 print:px-2 ${rowPad} font-medium`}>{toBn(item.subject)}</td>
                    <td className={`border-b border-zinc-200 px-2 py-2 print:px-1.5 ${rowPad} text-center tabular-nums`}>{toBn(item.fullMark)}</td>
                    <td className={`border-b border-zinc-200 px-2 py-2 print:px-1.5 ${rowPad} text-center tabular-nums`}>{toBn(item.passMark)}</td>
                    <td className={`border-b border-zinc-200 px-2 py-2 print:px-1.5 ${rowPad} text-center tabular-nums`}>{toBn(item.highestMark)}</td>
                    <td className={`border-b border-zinc-200 px-3 py-2 print:px-2 ${rowPad} text-center tabular-nums font-bold`}>{toBn(item.obtainedMark)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Summary: inline horizontal with dividers */}
        <div className="mt-4 print:mt-2 shrink-0 border-t border-black pt-3 print:pt-1.5 flex flex-wrap items-center gap-x-6 gap-y-2 print:gap-x-4 print:gap-y-1">
          {[
            ['DIVISION', divisionName],
            ['POSITION', student?.Positions ?? '-'],
            ['AVERAGE', averageMark],
            ['TOTAL', student?.Total ?? '-'],
          ].map(([label, val], i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.2em] text-zinc-500">{label}</span>
              <span className="text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold tabular-nums">{toBn(val)}</span>
              {i < 3 && <span className="text-zinc-300 ml-3">|</span>}
            </div>
          ))}
        </div>

        {/* ── Comments: minimal underlines */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-4 print:mt-2 flex flex-col">
          <div className="grid grid-cols-2 print:grid-cols-2 gap-8 print:gap-5">
            {showClassTeacherSign && (
            <div>
              <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.22em] text-zinc-500">{ms('classTeacherComment')}</div>
              <div className="h-10 print:h-7 border-b border-black flex items-end text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 pb-0.5">{student?.Note ?? ''}</div>
              <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.22em] text-zinc-500 mt-3 print:mt-2">{ms('classTeacherSign')}</div>
              <div className="border-b border-zinc-400 w-3/4 mt-4 print:mt-3"></div>
            </div>
            )}
            {showGuardianSign && (
            <div>
              <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.22em] text-zinc-500">{ms('guardianComment')}</div>
              <div className="h-10 print:h-7 border-b border-black"></div>
              <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.22em] text-zinc-500 mt-3 print:mt-2">{ms('classTeacherSign')}</div>
              <div className="border-b border-zinc-400 w-3/4 mt-4 print:mt-3"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ── Footer: 3 columns, minimal */}
      <div className="border-t border-black px-8 py-3 print:px-5 print:py-1 mt-auto shrink-0 grid grid-cols-3 items-end gap-4 print:gap-2">
        <div>
          <div className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 uppercase tracking-[0.22em] text-zinc-500 mb-1">{ms('verify')}</div>
          {/* Fixed small frame — without it the QR stretched to the whole grid column */}
          <div className="w-[54px] print:w-[44px]">
          <QRCode size={54} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
            viewBox="0 0 256 256" />
          </div>
        </div>
        <div className="text-center">
          <div className="h-10 print:h-7 flex items-end justify-center">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-10 max-w-full object-contain print:max-h-7" />}
          </div>
          <div className="border-t border-black mt-1.5 pt-1.5">
            <div className="text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 font-bold uppercase tracking-wide">{principalName || institution?.PrincipalName || ms('principal')}</div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-zinc-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>
        <div className="text-center">
          <div className="h-10 print:h-7 flex items-end justify-center">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-10 max-w-full object-contain print:max-h-7" />}
          </div>
          <div className="border-t border-black mt-1.5 pt-1.5">
            <div className="text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 font-bold uppercase tracking-wide">{najemName || institution?.NajemName || ms('najem')}</div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-zinc-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-8 print:px-5 py-1.5 print:py-0 text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 uppercase tracking-[0.2em] text-zinc-500">
        Software developed by <span className="font-bold text-black">SAHARAIT</span>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 5: Bold Sidebar (split layout)
// ==========================================
const SingleMarkSheetSidebar = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, rowPad, studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark, divisionRows,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  const summaryItems = [
    { label: ms('divisionShort'), value: divisionName, tone: 'from-cyan-500 to-teal-500' },
    { label: ms('meritPositionShort'), value: student?.Positions ?? '-', tone: 'from-teal-500 to-emerald-500' },
    { label: ms('average'), value: averageMark, tone: 'from-sky-500 to-cyan-500' },
    { label: ms('total'), value: student?.Total ?? '-', tone: 'from-cyan-600 to-teal-600' },
  ];

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white rounded-2xl shadow-2xl border border-cyan-200 mb-10 print:mb-0 flex flex-col`}>
      {/* ── Main body: sidebar + content */}
      <div className="flex flex-col md:flex-row print:flex-row flex-1 min-h-0">
        {/* ═══ SIDEBAR (dark, 35%) ═══ */}
        <div className="marksheet-header md:w-[35%] print:w-[35%] shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950 text-white px-5 py-5 print:px-3.5 print:py-3 flex flex-col gap-3 print:gap-1.5 flex flex-col">
          {/* Logo + Institution */}
          <div className="text-center print:text-center">
            <div className="h-16 w-16 print:h-12 print:w-12 mx-auto overflow-hidden rounded-2xl ring-2 ring-cyan-400/40 bg-white">
              {imageSrc
                ? <img src={imageSrc} className="h-full w-full object-cover" alt="" />
                : <div className="h-full w-full bg-white/10 flex items-center justify-center text-[9px] ms-fs-9 text-white/50">LOGO</div>}
            </div>
            <h1 className="marksheet-inst-name text-[16px] ms-fs-16 print:text-[13.5px] ms-pfs-13_5 font-bold mt-2 print:mt-1 leading-tight text-white">
              {toBn(instName || '-')}
            </h1>
            <p className="marksheet-inst-address text-[9.5px] ms-fs-9_5 print:text-[8.5px] ms-pfs-8_5 text-cyan-300 mt-1 leading-snug">
              {toBn(instAddress || '-')}
            </p>
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Session/Exam/Class */}
          <div className="space-y-1.5 print:space-y-0.5">
            {[
              [ms('session'), sessionName],
              [ms('exam'), ExamName],
              [ms('className'), classInfo?.ClassName],
            ].map(([label, val], i) => (
              <div key={i}>
                <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 uppercase tracking-[0.2em] text-cyan-400/80">{label}</div>
                <div className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-semibold leading-tight">{toBn(val || '-')}</div>
              </div>
            ))}
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Student info */}
          <div>
            <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5 print:mb-1">{ms('studentInfo')}</div>
            <div className="space-y-1.5 print:space-y-0.5">
              {infoItems.map((f, i) => (
                <div key={i}>
                  <div className="text-[8px] ms-fs-8 print:text-[7.5px] ms-pfs-7_5 text-cyan-400/60 uppercase">{f.label}</div>
                  <div className="text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-semibold leading-tight truncate">{toBn(f.value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Division */}
          <div>
            <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5 print:mb-1">
              {ms('markDistribution')} ({toBn(divisionRows.length)})
            </div>
            {divisionRows.length === 0
              ? <div className="text-[10px] ms-fs-10 text-white/40 italic">{ms('noDivisionShort')}</div>
              : <div className="space-y-0.5">
                  {divisionRows.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10.5px] ms-fs-10_5 print:text-[9.5px] ms-pfs-9_5 py-0.5 border-b border-white/10 last:border-0">
                      <span className="truncate text-white/90">{item.name}</span>
                      <span className="font-bold tabular-nums text-cyan-300 ml-1.5">{toBn(item.number)}</span>
                    </div>
                  ))}
                </div>}
          </div>

          <div className="flex-1" />

          {/* QR */}
          <div className="flex flex-col items-center mt-2 print:mt-1">
            <div className="p-1 bg-white rounded-lg">
              <QRCode size={64} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <p className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 text-cyan-300 mt-1 print:mt-0.5">{ms('verify')}</p>
          </div>
        </div>

        {/* ═══ MAIN CONTENT (65%) ═══ */}
        <div className="marksheet-content md:flex-1 flex-1 flex flex-col p-5 print:p-3 bg-white min-w-0">
          {/* Table */}
          <div className="mb-1 flex items-center gap-2 print:mb-0.5">
            <span className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 uppercase tracking-[0.2em] text-cyan-700 font-bold">{ms('subjectResult')}</span>
            <div className="flex-1 h-px bg-cyan-200" />
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-lg border border-cyan-200 shrink-0">
            <table className="w-full min-w-[500px] print:min-w-0 border-collapse bg-white text-slate-800">
              <thead>
                <tr>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2 py-2 print:px-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-center w-10">#</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2.5 py-2 print:px-2 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-left">{ms('subject')}</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-center">{ms('fullMarkShort')}</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-center">{ms('passMarkShort')}</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-center">{ms('highestMarkShort')}</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2 py-2 print:px-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9.5px] ms-pfs-9_5 font-bold text-center">{ms('obtainedMarkShort')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#ecfeff' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5`}>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-2 py-1.5 print:px-1.5 ${rowPad} tabular-nums text-cyan-600 font-semibold`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-2.5 py-1.5 print:px-2 ${rowPad} text-left font-medium text-slate-800`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-1.5 py-1.5 print:px-1 ${rowPad} tabular-nums`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-1.5 py-1.5 print:px-1 ${rowPad} tabular-nums`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-1.5 py-1.5 print:px-1 ${rowPad} tabular-nums`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-cyan-100 px-2 py-1.5 print:px-1.5 ${rowPad} tabular-nums font-bold text-cyan-700`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary 4 cards */}
          <div className="grid grid-cols-4 gap-2 print:gap-1 mt-3 print:mt-1.5 shrink-0">
            {summaryItems.map((item, i) => (
              <div key={i} className={`rounded-lg bg-gradient-to-br ${item.tone} px-2 py-2 print:px-1 print:py-1 text-white text-center shadow-md`}>
                <div className="text-[8.5px] ms-fs-8_5 print:text-[7.5px] ms-pfs-7_5 uppercase tracking-wider font-semibold opacity-90">{item.label}</div>
                <div className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold tabular-nums leading-tight mt-0.5">{toBn(item.value)}</div>
              </div>
            ))}
          </div>

          {/* Comments */}
          {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments flex-1 mt-3 print:mt-1.5 grid grid-cols-2 print:grid-cols-2 gap-3 print:gap-2 min-h-0">
            {showClassTeacherSign && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-3 print:p-2 flex flex-col min-h-[80px] print:min-h-[65px]">
              <p className="text-cyan-800 font-bold text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 mb-1">{ms('classTeacherCommentShort')}</p>
              <div className="border-b border-dashed border-cyan-400 w-3/4 mt-1 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 text-slate-700 flex-1">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-3 print:p-2 flex flex-col min-h-[80px] print:min-h-[65px]">
              <p className="text-cyan-800 font-bold text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 mb-1">{ms('guardianComment')}</p>
              <div className="border-b border-dashed border-cyan-400 w-3/4 mt-1 flex-1"></div>
            </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* ═══ FOOTER: 2 signatures, full width ═══ */}
      <div className="border-t border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4 print:px-5 print:py-1.5 mt-auto shrink-0">
        <div className="grid grid-cols-2 gap-8 print:gap-6 max-w-xl mx-auto print:max-w-lg">
          <div className="flex flex-col items-center">
            <div className="h-12 print:h-8 flex items-end justify-center w-full">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-12 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="border-t-2 border-cyan-700 mt-1.5 print:mt-1 w-full"></div>
            <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-slate-800 mt-1.5 print:mt-1 text-center">{principalName || institution?.PrincipalName || ms('principal')}</p>
            {showDate && <p className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 text-slate-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 print:h-8 flex items-end justify-center w-full">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-12 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="border-t-2 border-cyan-700 mt-1.5 print:mt-1 w-full"></div>
            <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-slate-800 mt-1.5 print:mt-1 text-center">{najemName || institution?.NajemName || ms('najem')}</p>
            {showDate && <p className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 text-slate-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-center py-1 print:py-0.5 text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 text-cyan-300/70 tracking-wider">
        Software developed by <span className="font-bold text-cyan-300">SAHARAIT</span>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 6: Vintage Gazette (newspaper style) — বাংলা
// ==========================================
const SingleMarkSheetGazette = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  return (
    <div
      dir={dir}
      className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-[#f5f0e3] text-stone-900 mb-10 print:mb-0 flex flex-col shadow-xl`}
      style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif Bengali", "SolaimanLipi", serif' }}
    >
      {/* ── MASTHEAD */}
      <div className="marksheet-header px-6 pt-4 pb-2 border-t-[3px] border-double border-t-[6px] border-stone-900 border-b-[3px] border-double border-b-[6px]">
        <div className="text-center">
          <div className="text-[8.5px] ms-fs-8_5 print:text-[8px] ms-pfs-8 tracking-wider text-stone-600">
            {ms('institutionalRecord')}
          </div>
          <h1 className="text-[34px] ms-fs-34 print:text-[24px] ms-pfs-24 font-black leading-none tracking-wide my-1">
            {ms('gazette')}
          </h1>
          <div className="flex items-center justify-center gap-3 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 tracking-wide text-stone-700">
            <span>{ms('volume')}: {toBn(sessionName || '-')}</span>
            <span>·</span>
            <span>{ms('exam')}: {toBn(ExamName || '-')}</span>
            <span>·</span>
            <span>{showDate ? toBn(new Date().toLocaleDateString('bn-BD')) : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Institution name as secondary header */}
      <div className="text-center px-6 py-2 border-b border-stone-400">
        <h2 className="marksheet-inst-name text-[18px] ms-fs-18 print:text-[15px] ms-pfs-15 font-bold italic">
          {toBn(instName || '-')}
        </h2>
        <p className="marksheet-inst-address text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-stone-600">
          {toBn(instAddress || '-')}
        </p>
      </div>

      {/* ── Body: 2-column */}
      <div className="marksheet-body px-5 py-3 print:px-4 print:py-1.5 flex-1 flex flex-col min-h-0">
        {/* Top: student + divisions in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-4 mb-3 print:mb-2 shrink-0">
          <div>
            <div className="border-b-2 border-stone-900 pb-0.5 mb-1.5">
              <h3 className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-black tracking-wide">
                {ms('studentInfo')}
              </h3>
            </div>
            <div className="space-y-1 text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5">
              {infoItems.map((f, i) => (
                <div key={i} className="flex items-baseline border-b border-dotted border-stone-400 pb-0.5">
                  <span className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 font-bold tracking-wide text-stone-500 w-24 shrink-0">
                    {f.label}
                  </span>
                  <span className="font-semibold truncate">{toBn(f.value)}</span>
                </div>
              ))}
              <div className="flex items-baseline border-b border-dotted border-stone-400 pb-0.5">
                <span className="text-[9px] ms-fs-9 print:text-[8.5px] ms-pfs-8_5 font-bold tracking-wide text-stone-500 w-24 shrink-0">
                  {ms('className')}
                </span>
                <span className="font-semibold">{toBn(classInfo?.ClassName || '-')}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="border-b-2 border-stone-900 pb-0.5 mb-1.5">
              <h3 className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-black tracking-wide">
                {ms('markDistribution')}
                <span className="font-normal italic text-[9px] ms-fs-9 ml-2">
                  ({toBn(divisionRows.length)} {ms('divisionWord')} · {toBn(totalSubjects)} {ms('subjectWord')})
                </span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10">
              {divisionRows.length === 0
                ? <div className="col-span-2 italic text-stone-500 text-[10px] ms-fs-10">—</div>
                : divisionRows.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-dotted border-stone-400 pb-0.5">
                    <span className="truncate">{item.name}</span>
                    <span className="font-bold">{toBn(item.number)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Table as "main story" */}
        <div className="mb-3 print:mb-2 shrink-0">
          <div className="border-y-2 border-stone-900 py-0.5 mb-1.5 text-center">
            <h3 className="text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-black tracking-wider">
              — {ms('academicRecord')} —
            </h3>
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border-2 border-stone-900">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse">
              <thead>
                <tr>
                  <th style={TH_STYLE_GAZETTE} className="px-1.5 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-center w-10 border-r border-stone-700">{ms('serialShort')}</th>
                  <th style={TH_STYLE_GAZETTE} className="px-3 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-left border-r border-stone-700">{ms('subject')}</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-center border-r border-stone-700">{ms('fullMark')}</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-center border-r border-stone-700">{ms('passMark')}</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-center border-r border-stone-700 whitespace-nowrap">{ms('highestMark')}</th>
                  <th style={TH_STYLE_GAZETTE} className="px-3 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide text-center whitespace-nowrap">{ms('obtainedMark')}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#ede7d5' : '#f5f0e3', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-1.5 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 italic`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-3 ${rowPad} py-1 print:py-0.5 text-left text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-semibold`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-stone-300 px-3 ${rowPad} py-1 print:py-0.5 text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 font-black`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary as "stock ticker" */}
        <div className="border-y-2 border-stone-900 py-2 print:py-1 mb-3 print:mb-2 shrink-0">
          <div className="flex flex-wrap items-center justify-around gap-x-3 gap-y-1 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10">
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] ms-fs-9 tracking-wide text-stone-500 font-bold">{ms('division')}:</span>
              <span className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-black italic">{toBn(divisionName)}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] ms-fs-9 tracking-wide text-stone-500 font-bold">{ms('meritPosition')}:</span>
              <span className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-black italic">{toBn(student?.Positions ?? '-')}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] ms-fs-9 tracking-wide text-stone-500 font-bold">{ms('average')}:</span>
              <span className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-black italic">{toBn(averageMark)}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[9px] ms-fs-9 tracking-wide text-stone-500 font-bold">{ms('totalMark')}:</span>
              <span className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-black italic">{toBn(student?.Total ?? '-')}</span>
            </div>
          </div>
        </div>

        {/* Comments as "letters to the editor" */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments grid grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 flex-1">
          {showClassTeacherSign && (
          <div>
            <h4 className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide italic text-stone-700 border-b border-stone-400 pb-0.5">
              {ms('fromClassTeacher')}
            </h4>
            <div className="border-b border-dotted border-stone-500 min-h-[42px] print:min-h-[36px] mt-2 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 italic pt-1">
              {student?.Note ?? ''}
            </div>
          </div>
          )}
          {showGuardianSign && (
          <div>
            <h4 className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black tracking-wide italic text-stone-700 border-b border-stone-400 pb-0.5">
              {ms('fromGuardian')}
            </h4>
            <div className="border-b border-dotted border-stone-500 min-h-[42px] print:min-h-[36px] mt-2"></div>
          </div>
          )}
        </div>
        )}
      </div>

      {/* ── Footer: publication info */}
      <div className="border-t-[3px] border-double border-stone-900 px-5 py-2 print:px-4 print:py-1 mt-auto shrink-0">
        <div className="grid grid-cols-5 items-end gap-3 print:gap-2">
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-[50px] print:w-[32px]">
              <QRCode size={40} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <p className="text-[8px] ms-fs-8 print:text-[7.5px] ms-pfs-7_5 text-center italic mt-0.5">{ms('verify')}</p>
          </div>
          <div className="col-span-2 text-center">
            <div className="h-9 print:h-6 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-9 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-stone-900 mt-1 pt-1">
              <div className="text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-bold italic">{principalName || institution?.PrincipalName || ms('principal')}</div>
              {showDate && <div className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 italic mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
            </div>
          </div>
          <div className="col-span-2 text-center">
            <div className="h-9 print:h-6 flex items-end justify-center">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-9 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-stone-900 mt-1 pt-1">
              <div className="text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-bold italic">{najemName || institution?.NajemName || ms('najem')}</div>
              {showDate && <div className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 italic mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-400 px-5 print:px-4 py-1 print:py-0.5 text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 tracking-wide text-stone-600 text-center">
        SAHARAIT {ms('printedBy')} · {ms('gazette')} · {ms('allRightsReserved')}
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 7: Bauhaus Bold (poster style)
// ==========================================
const SingleMarkSheetBauhaus = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });

  const summaryItems = [
    { label: 'DIVISION', value: divisionName, bg: 'bg-red-600', border: 'border-red-800' },
    { label: 'POSITION', value: student?.Positions ?? '-', bg: 'bg-blue-600', border: 'border-blue-800' },
    { label: 'AVERAGE', value: averageMark, bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-black' },
    { label: 'TOTAL', value: student?.Total ?? '-', bg: 'bg-black', border: 'border-black' },
  ];

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white mb-10 print:mb-0 flex flex-col shadow-2xl`}>
      {/* Inner border wrapper (survives print) */}
      <div className="marksheet-frame border-[6px] border-black flex flex-1 flex-col min-h-0">

        {/* ── TOP RED BLOCK */}
        <div className="marksheet-header bg-red-600 text-white px-5 py-3 print:px-4 print:py-1.5 flex items-center justify-between gap-3 border-b-[6px] border-black shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 print:h-11 print:w-11 shrink-0 rounded-full bg-white border-[3px] border-black overflow-hidden flex items-center justify-center">
              {imageSrc
                ? <img src={imageSrc} className="h-full w-full object-cover" alt="" />
                : <span className="text-[8px] ms-fs-8 font-black text-red-600">LOGO</span>}
            </div>
            <div>
              <h1 className="marksheet-inst-name text-[22px] ms-fs-22 print:text-[17px] ms-pfs-17 font-black uppercase leading-none tracking-tight">
                {toBn(instName || '-')}
              </h1>
              <p className="marksheet-inst-address text-[9.5px] ms-fs-9_5 print:text-[8.5px] ms-pfs-8_5 mt-1 opacity-90 uppercase tracking-wider">
                {toBn(instAddress || '-')}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] ms-fs-8 print:text-[7.5px] ms-pfs-7_5 uppercase font-black tracking-widest opacity-80">Session</div>
            <div className="text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-black leading-none">{toBn(session?.SessionName || '-')}</div>
          </div>
        </div>

        {/* ── YELLOW BANNER (Exam + Class) */}
        <div className="marksheet-rainbow bg-yellow-400 text-black px-5 py-1.5 print:py-1 flex items-center justify-between border-b-[6px] border-black shrink-0">
          <span className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-black uppercase tracking-wider">★ {toBn(ExamName || '-')}</span>
          <span className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-black uppercase tracking-wider">{ms('className')}: {toBn(classInfo?.ClassName || '-')}</span>
        </div>

        {/* ── BODY: split with red sidebar */}
        <div className="marksheet-body flex flex-1 min-h-0">
          {/* Vertical red sidebar */}
          <div className="w-[38px] print:w-[30px] shrink-0 bg-red-600 flex items-center justify-center border-r-[6px] border-black">
            <div className="rotate-[-90deg] whitespace-nowrap text-white font-black uppercase tracking-[0.4em] text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11">
              RESULT
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* ── Info in BLACK block */}
            <div className="bg-black text-white px-4 py-2.5 print:px-3 print:py-1.5 grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-x-4 gap-y-1.5 print:gap-y-1 border-b-[6px] border-black shrink-0">
              {infoItems.map((f, i) => (
                <div key={i}>
                  <div className="text-[7.5px] ms-fs-7_5 print:text-[7px] ms-pfs-7 uppercase tracking-[0.2em] font-black text-yellow-400">{f.label}</div>
                  <div className="text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-bold truncate">{toBn(f.value)}</div>
                </div>
              ))}
            </div>

            {/* ── Divisions in blue strip */}
            <div className="bg-blue-600 text-white px-4 py-1.5 print:px-3 print:py-1 border-b-[6px] border-black shrink-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 font-black uppercase tracking-widest">{ms('markDistribution')}:</span>
                {divisionRows.length === 0
                  ? <span className="text-[10px] ms-fs-10 italic opacity-70">—</span>
                  : divisionRows.map((item, i) => (
                    <span key={i} className="text-[10.5px] ms-fs-10_5 print:text-[9.5px] ms-pfs-9_5 font-bold">
                      {item.name} <span className="bg-white text-blue-700 px-1.5 rounded-sm font-black">{toBn(item.number)}</span>
                    </span>
                  ))
                }
              </div>
            </div>

            {/* ── Table (white bg, thick borders) */}
            <div className="px-3 py-2 print:px-2 print:py-1 shrink-0">
              <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border-[4px] border-black">
                <table className="w-full min-w-[700px] print:min-w-0 border-collapse">
                  <thead>
                    <tr>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-center w-10 border-r-[3px] border-black">#</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-3 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-left border-r-[3px] border-black">{ms('subject')}</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-center border-r-[3px] border-black">{ms('fullMarkShort')}</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-center border-r-[3px] border-black">{ms('passMarkShort')}</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-center border-r-[3px] border-black">{ms('highestMarkShort')}</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-3 py-1.5 print:py-1 text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 font-black uppercase tracking-wider text-center">{ms('obtainedMarkShort')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((item, index) => {
                      const isAlt = index % 2 !== 0;
                      const cellStyle = { backgroundColor: isAlt ? '#fef3c7' : '#ffffff', ...EXACT };
                      return (
                        <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 font-black`}>{toBn(index + 1)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-3 ${rowPad} py-1 print:py-0.5 text-left text-[11.5px] ms-fs-11_5 print:text-[10.5px] ms-pfs-10_5 font-bold`}>{toBn(item.subject)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.fullMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.passMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10`}>{toBn(item.highestMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-black px-3 ${rowPad} py-1 print:py-0.5 text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-black`}>{toBn(item.obtainedMark)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Summary: big circles in yellow block */}
            <div className="bg-yellow-400 border-y-[6px] border-black px-4 py-2.5 print:px-3 print:py-1.5 shrink-0">
              <div className="grid grid-cols-4 gap-3 print:gap-2">
                {summaryItems.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className={`mx-auto w-14 h-14 print:w-11 print:h-11 rounded-full ${item.bg} border-[3px] border-black flex items-center justify-center ${item.text || 'text-white'}`}>
                      <span className="text-[15px] ms-fs-15 print:text-[12px] ms-pfs-12 font-black leading-none">{toBn(item.value)}</span>
                    </div>
                    <div className="text-[8px] ms-fs-8 print:text-[7px] ms-pfs-7 font-black uppercase tracking-widest mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Comments in blue blocks */}
            {(showClassTeacherSign || showGuardianSign) && (
            <div className="marksheet-comments grid grid-cols-2 gap-3 print:gap-2 p-3 print:p-2 bg-white flex-1">
              {showClassTeacherSign && (
              <div>
                <div className="bg-blue-600 text-white px-2 py-0.5 text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 font-black uppercase tracking-widest">{ms('classTeacher')}</div>
                <div className="border-[3px] border-black min-h-[42px] print:min-h-[36px] p-1.5 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10">{student?.Note ?? ''}</div>
              </div>
              )}
              {showGuardianSign && (
              <div>
                <div className="bg-red-600 text-white px-2 py-0.5 text-[9px] ms-fs-9 print:text-[8px] ms-pfs-8 font-black uppercase tracking-widest">{ms('fromGuardian')}</div>
                <div className="border-[3px] border-black min-h-[42px] print:min-h-[36px] p-1.5"></div>
              </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* ── Bottom black bar with signatures + QR */}
        <div className="bg-black text-white px-4 py-2.5 print:px-3 print:py-1.5 border-t-[6px] border-black mt-auto shrink-0">
          <div className="grid grid-cols-5 items-center gap-3 print:gap-2">
            <div className="col-span-1 flex flex-col items-center">
              <div className="bg-white p-0.5 border-2 border-yellow-400">
                <QRCode size={44} style={{ height: 'auto', width: '100%' }}
                  value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                  viewBox="0 0 256 256" />
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="h-8 print:h-6 flex items-end justify-center">
                {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-8 max-w-full object-contain print:max-h-6" style={{ filter: 'invert(1)' }} />}
              </div>
              <div className="border-t-2 border-yellow-400 mt-1 pt-1">
                <div className="text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 font-black uppercase">{principalName || institution?.PrincipalName || ms('principal')}</div>
                {showDate && <div className="text-[8px] ms-fs-8 print:text-[7.5px] ms-pfs-7_5 text-white/60 mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="h-8 print:h-6 flex items-end justify-center">
                {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-8 max-w-full object-contain print:max-h-6" style={{ filter: 'invert(1)' }} />}
              </div>
              <div className="border-t-2 border-yellow-400 mt-1 pt-1">
                <div className="text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 font-black uppercase">{najemName || institution?.NajemName || ms('najem')}</div>
                {showDate && <div className="text-[8px] ms-fs-8 print:text-[7.5px] ms-pfs-7_5 text-white/60 mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom white strip */}
        <div className="bg-white px-4 py-1 print:px-3 print:py-0.5 text-center text-[8px] ms-fs-8 print:text-[7px] ms-pfs-7 font-black uppercase tracking-[0.3em]">
          BAUHAUS · SAHARAIT · <span className="text-red-600">RESULT</span> <span className="text-blue-600">SHEET</span> <span className="text-yellow-500">2026</span>
        </div>
      </div>
    </div>
  );
};

// // ==========================================
// // ⭐ NEW TEMPLATE 8: Classic Traditional (legacy black-border design)
// // ==========================================
// const SingleMarkSheetClassic = ({
//   student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
//   session, classInfo, examSubjects, divisions = [], examConfig = {},
//   isLast = false, ExamID, SubClassID, ExamName,
//   showDate = true, showSignature = true, principalName = '', najemName = '',
//   paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
//   showClassTeacherSign = true, showGuardianSign = true,
//   totalStudents = 0,
// }) => {
//   const {
//     subjects, totalSubjects, divisionRows,
//     studentName, fatherName, motherName, birthDate,
//     rollNumber, registration, divisionName, averageMark,
//   } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

//   const { data } = useGetLabelNameListsQuery();
//   const labels = data?.[0] || {};
//   const previewWidth = getPreviewWidth(paperSize, orientation);

//   // Header line of the division box: "মোট বিষয় ৬ টি- পূর্ণমান ১০০ * ৬ = ৬০০"
//   const fullPerSubject = Number(subjects?.[0]?.fullMark) || 0;
//   const totalFullMark = fullPerSubject * totalSubjects;

//   const infoRows = [
//     studentInfoFields.name && ['পরীক্ষার্থীর নাম', studentName],
//     ['মারহালা/শ্রেণী', classInfo?.ClassName || '-'],
//     studentInfoFields.registration && [labels?.StudentIDLabel ?? 'আইডি', registration],
//     studentInfoFields.admission && [labels?.AdmissionIDLabel ?? 'ভর্তি নং', rollNumber],
//     studentInfoFields.fatherName && ['পিতার নাম', fatherName],
//     studentInfoFields.motherName && ['মাতার নাম', motherName],
//     studentInfoFields.dob && ['জন্ম তারিখ', birthDate && birthDate !== '-' ? `${birthDate} ইং` : '-'],
//     ['মোট পরীক্ষার্থীর সংখ্যা', totalStudents ?? '-'],
//   ].filter(Boolean);

//   return (
//     <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-black border-2 border-black mb-10 print:mb-0 flex flex-col`}>
//       {/* ── Header: centered institution block, logo on the left */}
//       <div className="marksheet-header relative text-center px-4 pt-3 pb-1 print:px-3 print:pt-2 print:pb-0.5 shrink-0">
//         {imageSrc && (
//           <img
//             src={imageSrc}
//             alt="Logo"
//             className="absolute left-4 top-[52px] print:left-3 print:top-[42px] h-[62px] w-[62px] print:h-[50px] print:w-[50px] object-contain"
//           />
//         )}
//         <h1 className="marksheet-inst-name text-[28px] ms-fs-28 print:text-[22px] ms-pfs-22 font-bold leading-tight">{toBn(instName || '-')}</h1>
//         <p className="marksheet-inst-address text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-semibold leading-snug">{toBn(instAddress || '-')}</p>
//         <p className="text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-semibold leading-snug">{ms('academicYear')} : {toBn(sessionName || '-')}</p>
//         <p className="text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold leading-snug">{ms('exam')} : {toBn(ExamName || '-')}</p>
//       </div>

//       <div className="marksheet-body px-4 pb-2 print:px-3 print:pb-1 flex-1 flex flex-col min-h-0">
//         {/* ── Student info (left) + division breakdown box (right) */}
//         <div className="mt-1 flex items-start justify-between gap-4 print:gap-3 shrink-0">
//           <div className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 leading-[1.8] print:leading-[1.6]">
//             {infoRows.map(([label, value], i) => (
//               <div key={i} className="flex">
//                 <span className="w-[118px] print:w-[102px] font-bold shrink-0">{label}</span>
//                 <span className="font-bold">: {toBn(value)}</span>
//               </div>
//             ))}
//           </div>

//           <div className="w-[300px] print:w-[255px] shrink-0 border-[1.5px] border-black">
//             <div className="border-b-[1.5px] border-black px-2 py-0.5 text-center text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold whitespace-nowrap">
//               {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')} - {ms('fullMark')} {toBn(fullPerSubject)} * {toBn(totalSubjects)} = {toBn(totalFullMark)}
//             </div>
//             {divisionRows.length === 0 ? (
//               <div className="px-2 py-1 text-center text-[13px] ms-fs-13">{ms('noDivision')}</div>
//             ) : (
//               divisionRows.map((item, index) => (
//                 <div key={index} className="flex border-b border-black last:border-b-0 text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold">
//                   <span className="flex-1 border-r border-black px-2 py-0.5 truncate">{item.name}</span>
//                   <span className="w-[132px] print:w-[114px] px-2 py-0.5 text-right whitespace-nowrap">
//                     {toBn(item.number)} X {toBn(totalSubjects)} = {toBn((Number(item.number) || 0) * totalSubjects)}
//                   </span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* ── Subject-wise result table (plain black borders) */}
//         <div className="marks-table-wrap mt-2 print:mt-1.5 shrink-0 overflow-x-auto print:overflow-visible">
//           <table className="w-full min-w-[640px] print:min-w-0 border-collapse border-[1.5px] border-black bg-white text-black text-center">
//             <thead>
//               <tr className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold">
//                 <th className="border border-black px-2 py-1 print:py-0.5 w-16">{ms('serial')}</th>
//                 <th className="border border-black px-3 py-1 print:py-0.5 text-left">{ms('subject')}</th>
//                 <th className="border border-black px-2 py-1 print:py-0.5">{ms('fullMark')}</th>
//                 <th className="border border-black px-2 py-1 print:py-0.5">{ms('passMarkAlt')}</th>
//                 <th className="border border-black px-2 py-1 print:py-0.5">{ms('highestMarkAlt')}</th>
//                 <th className="border border-black px-2 py-1 print:py-0.5">{ms('obtainedMark')}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {subjects.map((item, index) => (
//                 <tr key={item.id} className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold">
//                   <td className="border border-black px-2 py-1 print:py-0.5">{toBn(index + 1)}</td>
//                   <td className="border border-black px-3 py-1 print:py-0.5 text-left">{toBn(item.subject)}</td>
//                   <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.fullMark)}</td>
//                   <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.passMark)}</td>
//                   <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.highestMark)}</td>
//                   <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.obtainedMark)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* ── Summary strip */}
//         <div className="mt-3 print:mt-2 border-[1.5px] border-black flex flex-wrap text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold shrink-0">
//           <div className="flex-1 border-r border-black px-2 py-1 print:py-0.5 break-words">{ms('division')} : {toBn(divisionName)}</div>
//           <div className="border-r border-black px-3 py-1 print:py-0.5 break-words">{ms('meritPosition')} : {toBn(student?.Positions ?? '-')}</div>
//           <div className="border-r border-black px-3 py-1 print:py-0.5 break-words">{ms('average')} : {toBn(averageMark)}</div>
//           <div className="px-3 py-1 print:py-0.5 break-words">{ms('totalMark')} : {toBn(student?.Total ?? '-')}</div>
//         </div>

//         {/* ── Comment boxes */}
//         {(showClassTeacherSign || showGuardianSign) && (
//           <div className="marksheet-comments mt-3 print:mt-2 flex gap-3 print:gap-2 flex-1 min-h-0">
//             {showClassTeacherSign && (
//               <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
//                 <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold">{ms('classTeacherCommentSign')} :</p>
//                 <div className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 mt-1">{student?.Note ?? ''}</div>
//               </div>
//             )}
//             {showGuardianSign && (
//               <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
//                 <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold">{ms('guardianCommentSign')} :</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Signatures: left and right, date underneath */}
//       <div className="flex items-end justify-between px-10 print:px-8 pt-8 pb-3 print:pt-3 print:pb-2 mt-auto shrink-0">
//         <div className="flex flex-col items-center">
//           <div className="h-12 print:h-9 flex items-end justify-center">
//             {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />}
//           </div>
//           {showDate && <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold mt-1 print:mt-0.5">{ms('date')} : {printDate}</p>}
//         </div>
//         <div className="flex flex-col items-center">
//           <div className="h-12 print:h-9 flex items-end justify-center">
//             {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />}
//           </div>
//           {showDate && <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold mt-1 print:mt-0.5">{ms('date')} : {printDate}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// ==========================================
// ⭐ NEW TEMPLATE 8: Classic Traditional (legacy black-border design)
// ==========================================
const SingleMarkSheetClassic = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
  // Printing onto a sheet a press has already printed
  pressPrint = false, pressHidePreview = true,
  pressExamOffset = 0, pressBodyOffset = 0, pressSignOffset = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows,
    studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const fullPerSubject = Number(subjects?.[0]?.fullMark) || 0;
  const totalFullMark = fullPerSubject * totalSubjects;

  // ---- Printing onto paper a press has already printed
  //
  // The institution block and the page border are already on the paper, so
  // the app must not print over them.
  //
  // Hiding is done with opacity, not display and not visibility:
  //   display:none would collapse the space and pull everything below it up
  //   visibility is already taken — the print stylesheet uses
  //     body * { visibility: hidden !important }
  //     #marksheet-print-area * { visibility: visible !important }
  //   to print this area alone, and that !important would win.
  // opacity:0 keeps the block's exact height and no other rule touches it.
  //
  // It applies inside @media print only, so the institution block stays on
  // screen while the three offsets are being lined up.
  // pressHidePreview also takes the institution block off the screen, so the
  // preview shows what the paper will actually look like and the three
  // blocks can be lined up against the blank space the press leaves.
  const hideOnScreen = pressPrint && pressHidePreview;
  const pressHide = pressPrint ? (hideOnScreen ? ' opacity-0' : ' print:opacity-0') : '';

  // Built whole rather than appended, because two border-colour utilities on
  // one element are resolved by their order in the stylesheet, not in the
  // class attribute — appending one would not reliably win.
  const pageBorder = hideOnScreen
    ? 'border-2 border-dashed border-slate-300 print:border-0'
    : pressPrint
      ? 'border-2 border-black print:border-0'
      : 'border-2 border-black';

  // Moves a block up or down without changing the space it takes
  const shiftY = (value) => {
    const px = Number(value) || 0;
    return px ? { transform: `translateY(${px}px)` } : undefined;
  };

  const infoRows = [
    studentInfoFields.name && [ms('studentName'), studentName],
    [ms('classNameAlt'), classInfo?.ClassName || '-'],
    studentInfoFields.registration && [labels?.StudentIDLabel ?? ms('registrationShort'), registration],
    studentInfoFields.admission && [labels?.AdmissionIDLabel ?? ms('admission'), rollNumber],
    studentInfoFields.fatherName && [ms('fatherName'), fatherName],
    studentInfoFields.motherName && [ms('motherName'), motherName],
    studentInfoFields.dob && [ms('dob'), birthDate && birthDate !== '-' ? `${birthDate} ${ms('ad')}` : '-'],
    // ⭐ totalStudents now respects the toggle
    studentInfoFields.totalStudents !== false && [ms('totalStudents'), totalStudents ?? '-'],
  ].filter(Boolean);

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-black ${pageBorder} mb-10 print:mb-0 flex flex-col`}>
      {/* ── Header: centered institution block, logo on the left */}
      <div className="marksheet-header relative text-center px-4 pt-3 pb-1 print:px-3 print:pt-2 print:pb-0.5 shrink-0">
        {/* Already on the press-printed paper, so not printed again */}
        <div className={`marksheet-press-head${pressHide}`}>
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Logo"
              className="absolute left-4 top-[52px] print:left-3 print:top-[42px] h-[62px] w-[62px] print:h-[50px] print:w-[50px] object-contain"
            />
          )}
          <h1 className="marksheet-inst-name text-[28px] ms-fs-28 print:text-[22px] ms-pfs-22 font-bold leading-tight">{toBn(instName || '-')}</h1>
          <p className="marksheet-inst-address text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-semibold leading-snug">{toBn(instAddress || '-')}</p>
          <p className="text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-semibold leading-snug">{ms('academicYear')} : {toBn(sessionName || '-')}</p>
        </div>

        {/* Block 1 of 3 — the exam line */}
        <p
          className="marksheet-press-exam text-[16px] ms-fs-16 print:text-[14px] ms-pfs-14 font-bold leading-snug"
          style={shiftY(pressExamOffset)}
        >
          {ms('exam')} : {toBn(ExamName || '-')}
        </p>
      </div>

      {/* Block 2 of 3 — the data block */}
      <div
        className="marksheet-body px-4 pb-2 print:px-3 print:pb-1 flex-1 flex flex-col min-h-0"
        style={shiftY(pressBodyOffset)}
      >
        {/* ── Student info (left) + division breakdown box (right) */}
        <div className="mt-1 flex items-start justify-between gap-4 print:gap-3 shrink-0">
          <div className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 leading-[1.8] print:leading-[1.6]">
            {infoRows.map(([label, value], i) => (
              <div key={i} className="flex">
                <span className="w-[118px] print:w-[102px] font-bold shrink-0">{label}</span>
                <span className="font-bold">: {toBn(value)}</span>
              </div>
            ))}
          </div>

          <div className="w-[300px] print:w-[255px] shrink-0 border-[1.5px] border-black">
            <div className="border-b-[1.5px] border-black px-2 py-0.5 text-center text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold leading-tight break-words">
              {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')} - {ms('fullMark')} {toBn(fullPerSubject)} * {toBn(totalSubjects)} = {toBn(totalFullMark)}
            </div>
            {divisionRows.length === 0 ? (
              <div className="px-2 py-1 text-center text-[13px] ms-fs-13">{ms('noDivision')}</div>
            ) : (
              divisionRows.map((item, index) => (
                <div key={index} className="flex border-b border-black last:border-b-0 text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold">
                  <span className="flex-1 border-r border-black px-2 py-0.5 truncate">{item.name}</span>
                  <span className="w-[132px] print:w-[114px] px-2 py-0.5 text-right whitespace-nowrap">
                    {toBn(item.number)} X {toBn(totalSubjects)} = {toBn((Number(item.number) || 0) * totalSubjects)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Subject-wise result table (plain black borders) */}
        <div className="marks-table-wrap mt-2 print:mt-1.5 shrink-0 overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[640px] print:min-w-0 border-collapse border-[1.5px] border-black bg-white text-black text-center">
            <thead>
              <tr className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold">
                <th className="border border-black px-2 py-1 print:py-0.5 w-16">{ms('serial')}</th>
                <th className="border border-black px-3 py-1 print:py-0.5 text-left">{ms('subject')}</th>
                <th className="border border-black px-2 py-1 print:py-0.5">{ms('fullMark')}</th>
                <th className="border border-black px-2 py-1 print:py-0.5">{ms('passMarkAlt')}</th>
                <th className="border border-black px-2 py-1 print:py-0.5">{ms('highestMarkAlt')}</th>
                <th className="border border-black px-2 py-1 print:py-0.5">{ms('obtainedMark')}</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item, index) => (
                <tr key={item.id} className="text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold">
                  <td className="border border-black px-2 py-1 print:py-0.5">{toBn(index + 1)}</td>
                  <td className="border border-black px-3 py-1 print:py-0.5 text-left">{toBn(item.subject)}</td>
                  <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.fullMark)}</td>
                  <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.passMark)}</td>
                  <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.highestMark)}</td>
                  <td className="border border-black px-2 py-1 print:py-0.5">{toBn(item.obtainedMark)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Summary strip */}
        <div className="mt-3 print:mt-2 border-[1.5px] border-black flex flex-wrap text-[15px] ms-fs-15 print:text-[13px] ms-pfs-13 font-bold shrink-0">
          <div className="flex-1 border-r border-black px-2 py-1 print:py-0.5 break-words">{ms('division')} : {toBn(divisionName)}</div>
          <div className="border-r border-black px-3 py-1 print:py-0.5 break-words">{ms('meritPosition')} : {toBn(student?.Positions ?? '-')}</div>
          <div className="border-r border-black px-3 py-1 print:py-0.5 break-words">{ms('average')} : {toBn(averageMark)}</div>
          <div className="px-3 py-1 print:py-0.5 break-words">{ms('totalMark')} : {toBn(student?.Total ?? '-')}</div>
        </div>

        {/* ── Comment boxes: respect showClassTeacherSign / showGuardianSign */}
        {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments mt-3 print:mt-2 flex gap-3 print:gap-2 flex-1 min-h-0">
            {showClassTeacherSign && (
              <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
                <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold">{ms('classTeacherCommentSign')} :</p>
                <div className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 mt-1">{student?.Note ?? ''}</div>
              </div>
            )}
            {showGuardianSign && (
              <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
                <p className="text-[14px] ms-fs-14 print:text-[12.5px] ms-pfs-12_5 font-bold">{ms('guardianCommentSign')} :</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Block 3 of 3 — the signature row */}
      <div
        className="marksheet-press-sign flex items-end justify-between px-10 print:px-8 pt-8 pb-3 print:pt-3 print:pb-2 mt-auto shrink-0"
        style={shiftY(pressSignOffset)}
      >
        {/* Principal / মুহতামিম */}
        <div className="flex flex-col items-center w-[180px] print:w-[150px]">
          <div className="h-12 print:h-9 flex items-end justify-center w-full">
            {showSignature && signaturePrincipalSrc && (
              <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />
            )}
          </div>
          <div className="w-full border-t-2 border-dashed border-black mt-1"></div>
          <p className="text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold mt-1 text-center leading-tight">
            {principalName || institution?.PrincipalName || ''}
          </p>
          {showDate && (
            <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold mt-0.5">
              {ms('date')} : {printDate}
            </p>
          )}
        </div>

        {/* Vice Principal / নায়েবে তালিমাত */}
        <div className="flex flex-col items-center w-[180px] print:w-[150px]">
          <div className="h-12 print:h-9 flex items-end justify-center w-full">
            {showSignature && signatureNajemSrc && (
              <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />
            )}
          </div>
          <div className="w-full border-t-2 border-dashed border-black mt-1"></div>
          <p className="text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold mt-1 text-center leading-tight">
            {najemName || institution?.NajemName || ''}
          </p>
          {showDate && (
            <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold mt-0.5">
              {ms('date')} : {printDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 9: Traditional School
// Cream sheet inside a gold double frame, with corner ornaments, a ribbon
// badge and dotted-line information rows. Every value is read from the
// report data — the sheet never prints a sample institution, district or
// any field that report 1 does not provide.
// ==========================================
const DottedValue = ({ label, value, width = 'w-32', lang }) => (
  <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
    <span>{label}</span>
    <span className={`${width} print:w-24 inline-block border-b border-dotted border-[#1E3A8A] text-center`}>
      {toLangDigit(value ?? '', lang)}
    </span>
  </span>
);

const SingleMarkSheetTraditional = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });
  const totals = sumSubjectMarks(subjects);

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-[#FFFDF4] text-[#1E3A8A] shadow-xl mb-10 print:mb-0 print:shadow-none flex flex-col border-[7px] border-double border-[#C9A227] p-1.5 print:p-1`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: PATTERN_GEOMETRIC }}
      />
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      <div className="relative z-10 border border-[#C9A227] px-6 py-4 print:px-4 print:py-2 flex flex-col flex-1 min-h-0">

        {/* Header — institution, logos and the exam ribbon */}
        <div className="marksheet-header text-center shrink-0">
          <h1 className="marksheet-inst-name text-[28px] ms-fs-28 md:text-[30px] print:text-[21px] ms-pfs-21 font-bold leading-tight">
            {toBn(instName || '-')}
          </h1>
          <p className="marksheet-inst-address text-[16px] ms-fs-16 print:text-[13px] ms-pfs-13 font-bold text-[#0f766e] mt-0.5">
            {toBn(instAddress || '-')}
          </p>

          <div className="mt-3 print:mt-1.5 flex items-center justify-between gap-3">
            <div className="h-[66px] w-[66px] print:h-[48px] print:w-[48px] shrink-0 overflow-hidden rounded-full border-2 border-[#1E3A8A] bg-white flex items-center justify-center">
              {imageSrc
                ? <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
                : <span className="text-[9px] ms-fs-9 text-slate-400">No Logo</span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="relative inline-block">
                <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rotate-45 bg-[#c2410c]" />
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 rotate-45 bg-[#c2410c]" />
                <div
                  className="relative z-10 rounded-sm border-y-2 border-[#fde047] px-8 print:px-5 py-1.5 print:py-0.5 text-[19px] ms-fs-19 print:text-[14px] ms-pfs-14 font-bold text-white shadow-md"
                  style={{ backgroundImage: 'linear-gradient(to right,#ea580c,#f59e0b,#ea580c)', ...EXACT }}
                >
                  {toBn(ExamName || '-')}
                </div>
              </div>
              <div className="text-[21px] ms-fs-21 print:text-[15px] ms-pfs-15 font-bold mt-1 print:mt-0.5">{ms('markSheetAlt')}</div>
            </div>

            {/* নম্বর পত্র midel e thakar jonno */}
            <div className="h-[66px] w-[66px] print:h-[48px] print:w-[48px] shrink-0 overflow-hidden rounded-full flex items-center justify-center">
            </div>
          </div>
        </div>

        <div className="marksheet-body flex flex-col flex-1 min-h-0">

          {/* Institution / session line */}
          <div className="mt-3 print:mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[15px] ms-fs-15 print:text-[12px] ms-pfs-12 font-bold shrink-0">
            <DottedValue label={`${ms('className')} -`} value={classInfo?.ClassName || '-'} lang={lang} />
            <DottedValue label={`${ms('session')} -`} value={sessionName || '-'} lang={lang} />
            {showDate && <DottedValue label={`${ms('date')} -`} value={printDate} lang={lang} />}
          </div>

          {/* Student information — same fields as report 1 */}
          <div className="mt-2.5 print:mt-1.5 space-y-2 print:space-y-1 text-[15px] ms-fs-15 print:text-[12.5px] ms-pfs-12_5 font-bold shrink-0">
            {infoItems.map((f) => (
              <div key={f.key}>
                <DottedValue label={`${f.label} -`} value={f.value} width="w-[330px]" lang={lang} />
              </div>
            ))}
          </div>

          {/* Subject table */}
          <div className="mt-3 print:mt-1.5 shrink-0">
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border border-black">
              <table className="w-full min-w-[640px] print:min-w-0 border-collapse bg-white text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-bold text-[#1E3A8A]">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1 w-[8%]">{ms('serial')}</th>
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1 text-left">{ms('subject')}</th>
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1">{ms('fullMark')}</th>
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1">{ms('passMark')}</th>
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1 whitespace-nowrap">{ms('highestMark')}</th>
                    <th style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1">{ms('obtainedMark')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#f0fdfa' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText}`}>{toBn(index + 1)}</td>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText} text-left`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText}`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText}`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText}`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border border-black px-2 py-1.5 ${rowPad} ${rowText}`}>{toBn(item.obtainedMark)}</td>
                      </tr>
                    );
                  })}
                  <tr className="text-center">
                    <td style={TH_STYLE_TRADITIONAL} className="border border-black px-2 py-1.5 print:py-1" colSpan={2}>{ms('sum')}</td>
                    <td style={{ backgroundColor: '#f0fdfa', ...EXACT }} className="border border-black px-2 py-1.5 print:py-1">{toBn(totals.fullMark)}</td>
                    <td style={{ backgroundColor: '#f0fdfa', ...EXACT }} className="border border-black px-2 py-1.5 print:py-1">{toBn(totals.passMark)}</td>
                    <td style={{ backgroundColor: '#f0fdfa', ...EXACT }} className="border border-black px-2 py-1.5 print:py-1">{toBn(totals.highestMark)}</td>
                    <td style={{ backgroundColor: '#f0fdfa', ...EXACT }} className="border border-black px-2 py-1.5 print:py-1">{toBn(totals.obtainedMark)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Division breakdown + summary line */}
          <div className="mt-2.5 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 shrink-0">
            <div className="border border-[#C9A227] bg-white/70 p-2 print:p-1.5">
              <p className="text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold border-b border-dotted border-[#1E3A8A] pb-0.5 mb-1">
                {ms('markDistribution')} — {ms('totalDivisions')} {toBn(divisionRows.length)} {ms('items')} | {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')}
              </p>
              {divisionRows.length === 0 ? (
                <p className="text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 text-slate-400">{ms('noDivision')}</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-3">
                  {divisionRows.map((item, i) => (
                    <div key={i} className="flex justify-between text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 border-b border-dotted border-[#C9A227] py-0.5">
                      <span className="truncate">{item.name}</span>
                      <span className="ml-2">{toBn(totalSubjects * (Number(item.number) || 0))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-[#C9A227] bg-white/70 p-2 print:p-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold">
              <DottedValue label={`${ms('division')} -`} value={divisionName} width="w-20" lang={lang} />
              <DottedValue label={`${ms('meritPosition')} -`} value={student?.Positions ?? '-'} width="w-20" lang={lang} />
              <DottedValue label={`${ms('average')} -`} value={averageMark} width="w-20" lang={lang} />
              <DottedValue label={`${ms('totalMark')} -`} value={student?.Total ?? '-'} width="w-20" lang={lang} />
            </div>
          </div>

          {/* Remarks */}
          {(showClassTeacherSign || showGuardianSign) && (
            <div className="marksheet-comments mt-2.5 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 flex-1 min-h-0">
              {showClassTeacherSign && (
                <div className="border border-[#C9A227] bg-white/70 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('classTeacherComment')} :</p>
                  <div className="mt-1.5 border-b border-dotted border-[#1E3A8A] text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11">{student?.Note ?? ''}</div>
                </div>
              )}
              {showGuardianSign && (
                <div className="border border-[#C9A227] bg-white/70 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('guardianComment')} :</p>
                  <div className="mt-1.5 border-b border-dotted border-[#1E3A8A]" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Signatures + verification */}
        <div
          className={`mt-auto pt-4 print:pt-2 shrink-0 grid items-end gap-4 print:gap-2 ${
            showClassTeacherSign ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          {/* ── QR — always visible */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-0.5 border border-[#C9A227] w-[62px] print:w-[46px]">
              <QRCode
                size={62}
                style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256"
              />
            </div>
            <p className="text-[11px] ms-fs-11 print:text-[9px] ms-pfs-9 font-bold mt-1 print:mt-0.5">
              {ms('verify')}
            </p>
          </div>

          {/* ── Class Teacher — only when enabled */}
          {/* {showClassTeacherSign && (
            <div className="text-center">
              <div className="h-10 print:h-6" />
              <div className="border-t border-dotted border-[#1E3A8A] pt-1 text-[13.5px] ms-fs-13_5 print:text-[11px] ms-pfs-11 font-bold">
                {ms('classTeacherSign')}
              </div>
              <div className="text-[11px] ms-fs-11 print:text-[9.5px] ms-pfs-9_5 font-semibold text-stone-600">
                {ms('classTeacher')}
              </div>
              {showDate && (
                <div className="text-[11px] ms-fs-11 print:text-[9.5px] ms-pfs-9_5 font-semibold text-stone-600 mt-0.5">
                  {ms('date')} : {printDate}
                </div>
              )}
            </div>
          )} */}

          {/* ── Vice Principal — name & designation always, image optional */}
          <div className="text-center">
            <div className="h-10 print:h-6 flex items-end justify-center">
              {showSignature && signatureNajemSrc && (
                <img
                  src={signatureNajemSrc}
                  alt="Vice Principal signature"
                  className="max-h-10 max-w-full object-contain print:max-h-6"
                />
              )}
            </div>
            <div className="border-t border-dotted border-[#1E3A8A] pt-1 text-[13.5px] ms-fs-13_5 print:text-[11px] ms-pfs-11 font-bold">
              {toBn(najemName || institution?.NajemName || ms('najem'))}
            </div>
            {showDate && (
              <div className="text-[11px] ms-fs-11 print:text-[9.5px] ms-pfs-9_5 font-semibold text-stone-600 mt-0.5">
                {ms('date')} : {printDate}
              </div>
            )}
          </div>

          {/* ── Principal — name & designation always, image optional */}
          <div className="text-center">
            <div className="h-10 print:h-6 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && (
                <img
                  src={signaturePrincipalSrc}
                  alt="Principal signature"
                  className="max-h-10 max-w-full object-contain print:max-h-6"
                />
              )}
            </div>
            <div className="border-t border-dotted border-[#1E3A8A] pt-1 text-[13.5px] ms-fs-13_5 print:text-[11px] ms-pfs-11 font-bold">
              {toBn(principalName || institution?.PrincipalName || ms('principal'))}
            </div>
            {showDate && (
              <div className="text-[11px] ms-fs-11 print:text-[9.5px] ms-pfs-9_5 font-semibold text-stone-600 mt-0.5">
                {ms('date')} : {printDate}
              </div>
            )}
          </div>
        </div>

        <div className="mt-1 text-[10px] ms-fs-10 print:text-[8px] ms-pfs-8 font-semibold text-[#8a6d1f] shrink-0">
          Software Developed by <span className="font-bold tracking-wide">SAHARAIT</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 10: Academic Transcript
// Blue bordered transcript with a boxed information panel, a ruled result
// table and a signature strip. Columns and fields match report 1 exactly,
// so nothing on the sheet depends on data the report does not return.
// ==========================================
const SingleMarkSheetTranscript = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });
  const summaryItems = buildSummaryItems({ divisionName, student, averageMark, lang });
  const totals = sumSubjectMarks(subjects);

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-slate-900 shadow-xl mb-10 print:mb-0 print:shadow-none flex flex-col border-[3px] border-[#1d4ed8] p-1.5 print:p-1`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: PATTERN_LATTICE }}
      />

      <div className="relative z-10 border border-[#93c5fd] px-5 py-4 print:px-3.5 print:py-2 flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="marksheet-header flex items-center gap-4 print:gap-3 border-b-2 border-[#1d4ed8] pb-3 print:pb-1.5 shrink-0">
          <div className="h-[62px] w-[62px] print:h-[46px] print:w-[46px] shrink-0 overflow-hidden rounded-full border-2 border-[#1d4ed8] bg-white flex items-center justify-center">
            {imageSrc
              ? <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              : <span className="text-[9px] ms-fs-9 text-slate-400">No Logo</span>}
          </div>
          <div className="flex-1 text-center min-w-0">
            <h1 className="marksheet-inst-name text-[26px] ms-fs-26 md:text-[28px] print:text-[20px] ms-pfs-20 font-bold leading-tight text-[#1e3a8a]">
              {toBn(instName || '-')}
            </h1>
            <p className="marksheet-inst-address text-[14px] ms-fs-14 print:text-[12px] ms-pfs-12 font-semibold text-slate-600 mt-0.5">
              {toBn(instAddress || '-')}
            </p>
            <span
              className="mt-1.5 print:mt-1 inline-block rounded px-3 py-0.5 print:px-2.5 print:py-0 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-white"
              style={{ backgroundColor: '#1d4ed8', ...EXACT }}
            >
              {toBn(ExamName || '-')} — {ms('markSheet')}
            </span>
          </div>
          <div className="h-[62px] w-[62px] print:h-[46px] print:w-[46px] shrink-0" />
        </div>

        <div className="marksheet-body flex flex-col flex-1 min-h-0">

          {/* Student information + division breakdown */}
          <div className="mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 shrink-0">
            <div className="border border-slate-400">
              <div
                className="px-2 py-1 print:py-0.5 text-center text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-white"
                style={{ backgroundColor: '#1e3a8a', ...EXACT }}
              >
                {ms('studentInfo')}
              </div>
              <table className="w-full border-collapse text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5">
                <tbody>
                  {infoItems.map((f) => (
                    <tr key={f.key}>
                      <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-semibold text-slate-600 w-[42%]">{f.label}</td>
                      <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-bold">{toBn(f.value)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-semibold text-slate-600">{ms('className')}</td>
                    <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-bold">{toBn(classInfo?.ClassName || '-')}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-semibold text-slate-600">{ms('session')}</td>
                    <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-bold">{toBn(session?.SessionName || '-')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border border-slate-400">
              <div
                className="px-2 py-1 print:py-0.5 text-center text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-white"
                style={{ backgroundColor: '#1e3a8a', ...EXACT }}
              >
                {ms('markDistribution')} ({toBn(divisionRows.length)} {ms('items')} | {ms('subject')} {toBn(totalSubjects)} {ms('items')})
              </div>
              {divisionRows.length === 0 ? (
                <div className="px-2 py-2 text-center text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 text-slate-400">{ms('noDivision')}</div>
              ) : (
                <table className="w-full border-collapse text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11">
                  <tbody>
                    {divisionRows.map((item, i) => (
                      <tr key={i}>
                        <td className="border border-slate-300 px-2 py-0.5 font-semibold truncate">{item.name}</td>
                        <td className="border border-slate-300 px-2 py-0.5 text-center tabular-nums">{toBn(totalSubjects)} × {toBn(item.number)}</td>
                        <td className="border border-slate-300 px-2 py-0.5 text-right font-bold tabular-nums">
                          {toBn(totalSubjects * (Number(item.number) || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Result table */}
          <div className="mt-3 print:mt-1.5 shrink-0">
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border border-slate-500">
              <table className="w-full min-w-[640px] print:min-w-0 border-collapse bg-white">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold w-[8%]">{ms('serial')}</th>
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold text-left">{ms('subject')}</th>
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold">{ms('fullMark')}</th>
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold">{ms('passMark')}</th>
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold whitespace-nowrap">{ms('highestMark')}</th>
                    <th style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold">{ms('obtainedMark')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#eff6ff' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5`}>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} tabular-nums text-slate-500`}>{toBn(index + 1)}</td>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} text-left font-semibold`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} tabular-nums`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} tabular-nums`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} tabular-nums`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border border-slate-300 px-2 py-1.5 ${rowPad} tabular-nums font-bold text-[#1d4ed8]`}>{toBn(item.obtainedMark)}</td>
                      </tr>
                    );
                  })}
                  <tr className="text-center text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold">
                    <td style={TH_STYLE_TRANSCRIPT} className="border border-[#1e3a8a] px-2 py-1.5 print:py-1" colSpan={2}>{ms('grandTotal')}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-300 px-2 py-1.5 print:py-1 tabular-nums">{toBn(totals.fullMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-300 px-2 py-1.5 print:py-1 tabular-nums">{toBn(totals.passMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-300 px-2 py-1.5 print:py-1 tabular-nums">{toBn(totals.highestMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-300 px-2 py-1.5 print:py-1 tabular-nums">{toBn(totals.obtainedMark)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary + remarks */}
          <div className="mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-5 print:grid-cols-5 gap-4 print:gap-3 flex-1 min-h-0">
            <div className="md:col-span-2 print:col-span-2 border border-slate-400 self-start">
              <table className="w-full border-collapse text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5">
                <tbody>
                  {summaryItems.map((item) => (
                    <tr key={item.key}>
                      <td className="border border-slate-300 px-2 py-1 print:py-0.5 font-semibold text-slate-600">{item.label}</td>
                      <td className="border border-slate-300 px-2 py-1 print:py-0.5 text-right font-bold tabular-nums text-[#1d4ed8]">{toBn(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(showClassTeacherSign || showGuardianSign) && (
              <div className="marksheet-comments md:col-span-3 print:col-span-3 border border-slate-400 p-2.5 print:p-1.5 flex flex-col gap-2 print:gap-1">
                {showClassTeacherSign && (
                  <div>
                    <p className="text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold text-slate-600">{ms('classTeacherComment')} :</p>
                    <div className="mt-1 border-b border-dashed border-slate-400 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 min-h-[22px] print:min-h-[16px]">{student?.Note ?? ''}</div>
                  </div>
                )}
                {showGuardianSign && (
                  <div>
                    <p className="text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold text-slate-600">{ms('guardianComment')} :</p>
                    <div className="mt-1 border-b border-dashed border-slate-400 min-h-[22px] print:min-h-[16px]" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Signature strip */}
        <div className="mt-auto pt-3 print:pt-1.5 shrink-0 border-t-2 border-[#1d4ed8] grid grid-cols-4 items-end gap-4 print:gap-2">
          <div className="flex flex-col items-center">
            <div className="w-[58px] print:w-[44px] border border-slate-300 p-0.5 bg-white">
              <QRCode size={58} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <p className="text-[10.5px] ms-fs-10_5 print:text-[9px] ms-pfs-9 font-bold text-slate-600 mt-1 print:mt-0.5">{ms('verify')}</p>
          </div>

          <div className="text-center">
            <div className="h-10 print:h-6 flex items-end justify-center">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-10 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-slate-500 pt-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold">
              {toBn(najemName || institution?.NajemName || ms('najem'))}
            </div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-slate-500 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>

          <div className="text-center">
            <div className="h-10 print:h-6 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-10 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-slate-500 pt-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 font-bold">
              {toBn(principalName || institution?.PrincipalName || ms('principal'))}
            </div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-slate-500 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>

        <div className="mt-1 text-[10px] ms-fs-10 print:text-[8px] ms-pfs-8 font-semibold text-slate-500 shrink-0">
          Software Developed by <span className="font-bold tracking-wide text-[#1d4ed8]">SAHARAIT</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 11: Ornate Certificate
// Wide ornamental blue frame, a spaced-out MARKSHEET title and a boxed
// student panel above a ruled table. The percentage column is calculated
// from the obtained and full marks that report 1 already provides.
// ==========================================
const SingleMarkSheetOrnate = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });
  const summaryItems = buildSummaryItems({ divisionName, student, averageMark, lang });
  const totals = sumSubjectMarks(subjects);

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-slate-900 shadow-xl mb-10 print:mb-0 print:shadow-none flex flex-col`}>
      {/* Ornamental frame */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: PATTERN_LATTICE, opacity: 0.5, ...EXACT }}
      />
      <div className="absolute inset-0 bg-white" style={{ margin: '26px', ...EXACT }} />

      <div className="relative z-10 m-[26px] print:m-[18px] border-2 border-[#1d4ed8] px-6 py-5 print:px-4 print:py-2.5 flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="marksheet-header flex items-center gap-4 print:gap-3 shrink-0">
          <div className="h-[72px] w-[72px] print:h-[50px] print:w-[50px] shrink-0 overflow-hidden rounded-full border-2 border-[#1d4ed8] bg-white flex items-center justify-center">
            {imageSrc
              ? <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              : <span className="text-[9px] ms-fs-9 text-slate-400">No Logo</span>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="marksheet-inst-name text-[30px] ms-fs-30 md:text-[32px] print:text-[22px] ms-pfs-22 font-bold leading-tight text-[#1d4ed8] tracking-wide">
              {toBn(instName || '-')}
            </h1>
            <p className="marksheet-inst-address text-[15px] ms-fs-15 print:text-[12.5px] ms-pfs-12_5 font-semibold text-[#2563eb] mt-0.5">
              {toBn(instAddress || '-')}
            </p>
          </div>
        </div>

        <div className="text-center mt-4 print:mt-2 shrink-0">
          <h2 className="text-[26px] ms-fs-26 print:text-[19px] ms-pfs-19 font-bold tracking-[0.35em] underline underline-offset-[6px] decoration-2">
            MARKSHEET
          </h2>
          <p className="text-[18px] ms-fs-18 print:text-[14px] ms-pfs-14 font-semibold text-[#2563eb] mt-2 print:mt-1">
            {toBn(ExamName || '-')} — {toBn(session?.SessionName || '-')}
          </p>
        </div>

        <div className="marksheet-body flex flex-col flex-1 min-h-0">

          {/* Student panel */}
          <div className="mt-4 print:mt-2 border-2 border-slate-800 px-4 py-3 print:px-3 print:py-1.5 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-2 print:gap-y-1">
              {infoItems.map((f) => (
                <div key={f.key} className="text-[16px] ms-fs-16 print:text-[12.5px] ms-pfs-12_5 font-semibold">
                  {f.label} – <span className="font-bold">{toBn(f.value)}</span>
                </div>
              ))}
              <div className="text-[16px] ms-fs-16 print:text-[12.5px] ms-pfs-12_5 font-semibold">
                {ms('className')} – <span className="font-bold">{toBn(classInfo?.ClassName || '-')}</span>
              </div>
            </div>
          </div>

          {/* Result table */}
          <div className="mt-4 print:mt-2 shrink-0">
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border-2 border-slate-800">
              <table className="w-full min-w-[640px] print:min-w-0 border-collapse bg-white">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold text-left">{ms('subject')}</th>
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('fullMark')}</th>
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('passMark')}</th>
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold whitespace-nowrap">{ms('highestMark')}</th>
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('obtainedMark')}</th>
                    <th style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('percentage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#eff6ff' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5`}>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} text-left font-semibold`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} tabular-nums`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} tabular-nums`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} tabular-nums`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} tabular-nums font-bold text-[#1d4ed8]`}>{toBn(item.obtainedMark)}</td>
                        <td style={cellStyle} className={`border border-slate-800 px-3 py-2 ${rowPad} tabular-nums`}>{toBn(subjectPercent(item.obtainedMark, item.fullMark))}</td>
                      </tr>
                    );
                  })}
                  <tr className="text-center text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold">
                    <td style={TH_STYLE_ORNATE} className="border border-slate-800 px-3 py-2 print:py-1 text-left">{ms('total')}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-800 px-3 py-2 print:py-1 tabular-nums">{toBn(totals.fullMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-800 px-3 py-2 print:py-1 tabular-nums">{toBn(totals.passMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-800 px-3 py-2 print:py-1 tabular-nums">{toBn(totals.highestMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-800 px-3 py-2 print:py-1 tabular-nums">{toBn(totals.obtainedMark)}</td>
                    <td style={{ backgroundColor: '#dbeafe', ...EXACT }} className="border border-slate-800 px-3 py-2 print:py-1 tabular-nums">
                      {toBn(subjectPercent(totals.obtainedMark, totals.fullMark))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary + division breakdown */}
          <div className="mt-4 print:mt-2 grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-2 shrink-0">
            {summaryItems.map((item) => (
              <div key={item.key} className="border-2 border-[#1d4ed8] text-center px-2 py-2 print:py-1">
                <p className="text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-semibold text-[#2563eb]">{item.label}</p>
                <p className="text-[19px] ms-fs-19 print:text-[14px] ms-pfs-14 font-bold leading-tight">{toBn(item.value)}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 print:mt-1.5 border border-slate-400 px-3 py-1.5 print:py-1 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 shrink-0">
            <span className="font-bold text-[#1d4ed8]">{ms('markDistribution')} :</span>{' '}
            {divisionRows.length === 0
              ? <span className="text-slate-400">{ms('noDivision')}</span>
              : divisionRows.map((item, i) => (
                <span key={i} className="mr-3 whitespace-nowrap">
                  {item.name} – {toBn(totalSubjects)} × {toBn(item.number)} = <span className="font-bold">{toBn(totalSubjects * (Number(item.number) || 0))}</span>
                </span>
              ))}
          </div>

          {/* Remarks */}
          {(showClassTeacherSign || showGuardianSign) && (
            <div className="marksheet-comments mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 flex-1 min-h-0">
              {showClassTeacherSign && (
                <div className="border border-slate-400 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-bold text-[#1d4ed8]">{ms('classTeacherComment')} :</p>
                  <div className="mt-1.5 border-b border-dashed border-slate-400 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11">{student?.Note ?? ''}</div>
                </div>
              )}
              {showGuardianSign && (
                <div className="border border-slate-400 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-bold text-[#1d4ed8]">{ms('guardianComment')} :</p>
                  <div className="mt-1.5 border-b border-dashed border-slate-400" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="mt-auto pt-4 print:pt-2 shrink-0 grid grid-cols-3 items-end gap-6 print:gap-3">
          <div className="flex flex-col items-center">
            <div className="w-[60px] print:w-[46px] border border-[#1d4ed8] p-0.5 bg-white">
              <QRCode size={60} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <p className="text-[10.5px] ms-fs-10_5 print:text-[9px] ms-pfs-9 font-bold text-[#2563eb] mt-1 print:mt-0.5">{ms('verify')}</p>
          </div>

          <div className="text-center">
            <div className="h-11 print:h-7 flex items-end justify-center">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-11 max-w-full object-contain print:max-h-7" />}
            </div>
            <div className="border-t-2 border-slate-800 pt-1 text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold">
              {toBn(najemName || institution?.NajemName || ms('najem'))}
            </div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-slate-500 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>

          <div className="text-center">
            <div className="h-11 print:h-7 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-11 max-w-full object-contain print:max-h-7" />}
            </div>
            <div className="border-t-2 border-slate-800 pt-1 text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold">
              {toBn(principalName || institution?.PrincipalName || ms('principal'))}
            </div>
            {showDate && <div className="text-[10px] ms-fs-10 print:text-[9px] ms-pfs-9 text-slate-500 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>

        <div className="mt-1 text-center text-[10px] ms-fs-10 print:text-[8px] ms-pfs-8 font-semibold text-slate-500 shrink-0">
          Software Developed by <span className="font-bold tracking-wide text-[#1d4ed8]">SAHARAIT</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TEMPLATE 12: Royal Emerald
// Ornamental green sheet with a patterned frame, a medallion watermark and
// rounded information cards. It renders exactly the fields report 1
// renders — information rows, division breakdown, subject table, summary,
// remarks, QR and the two signatures.
// ==========================================
const SingleMarkSheetRoyal = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName, lang = 'bn',
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
  totalStudents = 0,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions, lang });

  // Every fixed word, digit and date on this sheet goes through the language.
  // toBn keeps its name so no call site had to change; inside a template it
  // now means "digits in the chosen language".
  const ms = (key) => getMarkSheetText(key, lang);
  const dir = getMarkSheetDir(lang);
  const toBn = (value) => toLangDigit(value, lang);
  const printDate = getPrintDate(new Date(), lang);
  const instName = getInstitutionName(institution, lang);
  const instAddress = getInstitutionAddress(institution, lang);
  const sessionName = getLangValue(session, 'SessionName', lang);

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = buildInfoItems({
    lang,
    studentInfoFields, labels, studentName, fatherName, motherName,
    birthDate, registration, rollNumber, totalStudents,
  });
  const summaryItems = buildSummaryItems({ divisionName, student, averageMark, lang });

  return (
    <div dir={dir} className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden shadow-2xl mb-10 print:mb-0 print:shadow-none flex flex-col border-[3px] border-[#0b3d26] p-1.5 print:p-1`}
      style={{ backgroundColor: '#0f5132', ...EXACT }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ backgroundImage: PATTERN_GEOMETRIC }}
      />

      <div
        className="relative z-10 border-2 border-[#c9a227] px-5 py-4 print:px-3.5 print:py-2 flex flex-col flex-1 min-h-0"
        style={{ backgroundColor: '#f3faf6', ...EXACT }}
      >
        {/* Medallion watermark */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] bg-center bg-no-repeat"
          style={{ backgroundImage: PATTERN_MEDALLION }}
        />

        {/* Header band */}
        <div
          className="marksheet-header relative z-10 rounded-xl px-4 py-2.5 print:px-3 print:py-1.5 text-white shrink-0 border border-[#c9a227]"
          style={{ backgroundImage: 'linear-gradient(to right,#0b3d26,#14694a,#0b3d26)', ...EXACT }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-[52px] w-[52px] print:h-[40px] print:w-[40px] shrink-0 overflow-hidden rounded-full border-2 border-[#c9a227] bg-white flex items-center justify-center">
              {imageSrc
                ? <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
                : <span className="text-[8px] ms-fs-8 text-slate-400">No Logo</span>}
            </div>
            <div className="flex-1 text-center min-w-0">
              <h1 className="marksheet-inst-name text-[24px] ms-fs-24 md:text-[26px] print:text-[19px] ms-pfs-19 font-bold leading-tight">
                {toBn(instName || '-')}
              </h1>
              <p className="marksheet-inst-address text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 text-emerald-100 mt-0.5">
                {toBn(instAddress || '-')}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span
                className="rounded-full border border-[#c9a227] px-3 py-0.5 print:px-2 print:py-0 text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-bold whitespace-nowrap"
                style={{ backgroundColor: '#0b3d26', ...EXACT }}
              >
                {toBn(session?.SessionName || '-')}
              </span>
              <span
                className="rounded-full px-3 py-0.5 print:px-2 print:py-0 text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-bold text-[#0b3d26] whitespace-nowrap"
                style={{ backgroundColor: '#c9a227', ...EXACT }}
              >
                {toBn(ExamName || '-')}
              </span>
            </div>
          </div>
        </div>

        <div className="marksheet-body relative z-10 flex flex-col flex-1 min-h-0">

          {/* Information + division breakdown */}
          <div className="mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 shrink-0">
            <div className="rounded-xl border border-[#c9a227] bg-white/85 overflow-hidden">
              <div
                className="flex items-center justify-between px-3 py-1 print:py-0.5 text-white text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold"
                style={{ backgroundColor: '#0f5132', ...EXACT }}
              >
                <span>{ms('studentInfo')}</span>
                <span
                  className="rounded-full px-2 py-0 text-[11px] ms-fs-11 print:text-[10px] ms-pfs-10 text-[#0b3d26]"
                  style={{ backgroundColor: '#c9a227', ...EXACT }}
                >
                  {toBn(classInfo?.ClassName || '-')}
                </span>
              </div>
              <div className="p-2 print:p-1.5 space-y-1 print:space-y-0.5">
                {infoItems.map((f) => (
                  <div key={f.key} className="flex items-baseline border-b border-dotted border-emerald-200 pb-0.5 text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5">
                    <span className="w-[105px] print:w-[88px] shrink-0 font-semibold text-emerald-800">{f.label}</span>
                    <span className="font-bold text-slate-900 truncate">{toBn(f.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#c9a227] bg-white/85 overflow-hidden">
              <div
                className="px-3 py-1 print:py-0.5 text-center text-white text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold"
                style={{ backgroundColor: '#0f5132', ...EXACT }}
              >
                {ms('markDistribution')}
              </div>
              <div className="px-2 py-1 print:py-0.5 text-center text-[12px] ms-fs-12 print:text-[10.5px] ms-pfs-10_5 font-bold text-emerald-800 border-b border-emerald-100">
                {ms('totalDivisions')} - {toBn(divisionRows.length)} {ms('items')} | {ms('totalSubjects')} {toBn(totalSubjects)} {ms('items')}
              </div>
              <div className="p-2 print:p-1.5">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[12px] ms-fs-12 print:text-[11px] ms-pfs-11 py-1">{ms('noDivision')}</div>
                ) : (
                  divisionRows.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-0.5 text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-bold text-slate-800 border-b border-dotted border-emerald-200 last:border-0">
                      <span className="w-[120px] print:w-[100px] truncate">{item.name}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <span>{toBn(totalSubjects)}</span><span>×</span><span>{toBn(item.number)}</span><span>=</span>
                        <span className="w-12 print:w-10 text-right text-emerald-800">{toBn(totalSubjects * (Number(item.number) || 0))}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Result table */}
          <div className="mt-3 print:mt-1.5 shrink-0">
            <div className="flex items-center gap-2 mb-1 print:mb-0.5">
              <span className="text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold text-emerald-900">{ms('subjectResult')}</span>
              <div className="flex-1 h-[2px]" style={{ backgroundImage: 'linear-gradient(to right,#c9a227,transparent)', ...EXACT }} />
            </div>
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-xl border border-[#c9a227]">
              <table className="w-full min-w-[640px] print:min-w-0 border-collapse bg-white/90 text-slate-900">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_ROYAL} className="px-2 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold w-[8%]">{ms('serial')}</th>
                    <th style={TH_STYLE_ROYAL} className="px-3 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold text-left">{ms('subject')}</th>
                    <th style={TH_STYLE_ROYAL} className="px-2 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('fullMark')}</th>
                    <th style={TH_STYLE_ROYAL} className="px-2 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('passMark')}</th>
                    <th style={TH_STYLE_ROYAL} className="px-2 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold whitespace-nowrap">{ms('highestMark')}</th>
                    <th style={TH_STYLE_ROYAL} className="px-2 py-2 print:py-1 text-[13px] ms-fs-13 print:text-[11.5px] ms-pfs-11_5 font-bold">{ms('obtainedMark')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#ecfdf5' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-2 py-2 ${rowPad} text-[13.5px] ms-fs-13_5 ${rowText} font-bold text-emerald-700 tabular-nums`}>{toBn(index + 1)}</td>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-3 py-2 ${rowPad} text-left text-[13.5px] ms-fs-13_5 ${rowText} font-bold`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-2 py-2 ${rowPad} text-[13.5px] ms-fs-13_5 ${rowText} font-bold tabular-nums`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-2 py-2 ${rowPad} text-[13.5px] ms-fs-13_5 ${rowText} font-bold tabular-nums`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-2 py-2 ${rowPad} text-[13.5px] ms-fs-13_5 ${rowText} font-bold tabular-nums`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border-b border-emerald-100 px-2 py-2 ${rowPad} text-[13.5px] ms-fs-13_5 ${rowText} font-bold tabular-nums text-emerald-800`}>{toBn(item.obtainedMark)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary cards */}
          <div className="mt-3 print:mt-1.5 shrink-0">
            <div className="flex items-center gap-2 mb-1 print:mb-0.5">
              <span className="text-[13.5px] ms-fs-13_5 print:text-[11.5px] ms-pfs-11_5 font-bold text-emerald-900">{ms('summary')}</span>
              <div className="flex-1 h-[2px]" style={{ backgroundImage: 'linear-gradient(to right,#c9a227,transparent)', ...EXACT }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5">
              {summaryItems.map((item) => (
                <div
                  key={item.key}
                  className="rounded-xl border border-[#c9a227] px-2 py-2 print:py-1 text-center text-white"
                  style={{ backgroundImage: 'linear-gradient(to bottom right,#14694a,#0b3d26)', ...EXACT }}
                >
                  <p className="text-[11.5px] ms-fs-11_5 print:text-[10px] ms-pfs-10 font-semibold text-emerald-100">{item.label}</p>
                  <p className="text-[19px] ms-fs-19 print:text-[14px] ms-pfs-14 font-bold leading-tight">{toBn(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          {(showClassTeacherSign || showGuardianSign) && (
            <div className="marksheet-comments mt-3 print:mt-1.5 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 flex-1 min-h-0">
              {showClassTeacherSign && (
                <div className="rounded-xl border border-[#c9a227] bg-white/85 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-bold text-emerald-900">{ms('classTeacherCommentSign')} :</p>
                  <div className="mt-1.5 border-b border-dashed border-emerald-400 text-[12.5px] ms-fs-12_5 print:text-[11px] ms-pfs-11 text-slate-700">{student?.Note ?? ''}</div>
                </div>
              )}
              {showGuardianSign && (
                <div className="rounded-xl border border-[#c9a227] bg-white/85 p-2.5 print:p-1.5 min-h-[70px] print:min-h-[55px]">
                  <p className="text-[13px] ms-fs-13 print:text-[11px] ms-pfs-11 font-bold text-emerald-900">{ms('guardianCommentSign')} :</p>
                  <div className="mt-1.5 border-b border-dashed border-emerald-400" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — verification and signatures */}
        <div className="relative z-10 mt-auto pt-3 print:pt-1.5 shrink-0 grid grid-cols-5 items-end gap-4 print:gap-2 border-t border-[#c9a227]">
          <div className="col-span-1 flex flex-col items-center">
            <div className="w-[62px] print:w-[46px] rounded-lg border border-[#c9a227] bg-white p-0.5">
              <QRCode size={62} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <p className="text-[10.5px] ms-fs-10_5 print:text-[9px] ms-pfs-9 font-bold text-emerald-800 mt-1 print:mt-0.5">{ms('verify')}</p>
          </div>

          <div className="col-span-2 text-center">
            <div className="h-11 print:h-7 flex items-end justify-center">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-11 max-w-full object-contain print:max-h-7" />}
            </div>
            <div className="border-t-2 border-dashed border-[#c9a227] pt-1 print:pt-0.5">
              <p className="text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold text-emerald-900">{toBn(najemName || institution?.NajemName || ms('najem'))}</p>
              {showDate && <p className="text-[10.5px] ms-fs-10_5 print:text-[9px] ms-pfs-9 text-emerald-700 tabular-nums">{ms('date')} : {printDate}</p>}
            </div>
          </div>

          <div className="col-span-2 text-center">
            <div className="h-11 print:h-7 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-11 max-w-full object-contain print:max-h-7" />}
            </div>
            <div className="border-t-2 border-dashed border-[#c9a227] pt-1 print:pt-0.5">
              <p className="text-[14px] ms-fs-14 print:text-[11.5px] ms-pfs-11_5 font-bold text-emerald-900">{toBn(principalName || institution?.PrincipalName || ms('principal'))}</p>
              {showDate && <p className="text-[10.5px] ms-fs-10_5 print:text-[9px] ms-pfs-9 text-emerald-700 tabular-nums">{ms('date')} : {printDate}</p>}
            </div>
          </div>
        </div>

        <div
          className="relative z-10 mt-2 print:mt-1 rounded-lg text-center py-1 print:py-0.5 text-[10px] ms-fs-10 print:text-[8px] ms-pfs-8 font-semibold text-[#0b3d26] shrink-0"
          style={{ backgroundColor: '#c9a227', ...EXACT }}
        >
          Software Developed by <span className="font-bold tracking-wide">SAHARAIT</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Main Component — templateId অনুযায়ী ডিজাইন সিলেক্ট
// ==========================================
const MarkSheetPdf = ({
  data, templateId = 'template-1',
  showDate, showSignature, principalName, najemName,
  paperSize = 'A4', orientation = 'portrait',
  studentInfoFields = {}, colorMode = 'color',
  showClassTeacherSign = true, showGuardianSign = true,
  headerScale = 100, contentFontScale = 100, rowGapScale = 100,
  language = 1,
  // Press-printed mark sheet (report 2) — only template 8 uses these
  pressPrint = false, pressHidePreview = true,
  pressExamOffset = 0, pressBodyOffset = 0, pressSignOffset = 0,
  scopeId = null,
}) => {
  const institution = data?.institution;

  // Language the sheet is printed in.
  // The API always sends all three, so the choice is made here.
  // LANG_ID_TO_CODE in MarkSheetConfig is the only place that says which
  // id means which language — the labels below and the database columns
  // picked here both read it, so the two can never disagree.
  const lang = toLangCode(language);

  // Picks the translated text, falling back to Bangla when it is missing.
  const byLanguage = (bangla, arabic, english) =>
    pickLang(bangla, arabic, english, lang);

  const examRow = data?.exam?.[0];
  const ExamName = byLanguage(examRow?.ExamName, examRow?.ExamAraName, examRow?.ExamEngName);

  // Paper-size/orientation scale — preview and print both
  const paperZoom = getPaperZoom(paperSize, orientation);

  const imageSrc = bufferToDataUrl(institution?.Logo);
  const signatureNajemSrc = bufferToDataUrl(institution?.SignatureNajem);
  const signaturePrincipalSrc = bufferToDataUrl(institution?.SignaturePrincipal);

  const session = data?.session || {};
  const classRow = data?.class || {};
  const classInfo = {
    ...classRow,
    ClassName: byLanguage(classRow?.ClassName, classRow?.ArabicClass, classRow?.EnglishClass),
  };

  const classGroupRow = data?.classGroup || {};
  const classGroupInfo = {
    ...classGroupRow,
    SubClass: byLanguage(classGroupRow?.SubClass, classGroupRow?.SubClassAra, classGroupRow?.SubClassEng),
  };
  const examSubjects = Array.isArray(data?.examSubjects) ? data.examSubjects : [];

  const examConfig = Array.isArray(data?.conditionAverage)
    ? data.conditionAverage[0] || {}
    : data?.conditionAverage || {};

  const divisions = Array.isArray(data?.divisions) ? data.divisions : [];
  const students = Array.isArray(data?.students) ? data.students : [];

  if (students.length === 0) {
    return (
      <div className="font-SolaimanLipi flex items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 text-lg">
        {getMarkSheetText('noData', lang)}
      </div>
    );
  }

  // Names in the chosen language, resolved once for every template.
  const visibleStudents = students.map((student) => ({
    ...student,
    UserName: byLanguage(student?.UserName, student?.StudentNameAra, student?.StudentNameEng),
    FatherName: byLanguage(student?.FatherName, student?.FatherNameAra, student?.FatherNameEng),
    MotherName: byLanguage(student?.MotherName, student?.MotherNameAra, student?.MotherNameEng),
  }));

  // Examinees sitting this exam.
  //   totalExaminees  counted by the API across the whole exam, before
  //                   any UserCode filter — this is the figure wanted
  //   TotalStudent    the figure stored with the exam, if the API is old
  //   students.length last resort only; it counts what this page shows,
  //                   so a search for one ID would report 1
  const totalStudents =
    Number(data?.totalExaminees) ||
    Number(examConfig?.TotalStudent) ||
    students.length;

  // ⭐ templateId অনুযায়ী কম্পোনেন্ট বেছে নাও
  const renderSheet = (student, idx) => {
    const commonProps = {
      key: student?.ID ?? student?.UserID ?? idx,
      student,
      institution,
      imageSrc,
      signatureNajemSrc,
      signaturePrincipalSrc,
      session,
      classInfo,
      examSubjects,
      divisions,
      examConfig,
      isLast: idx === visibleStudents.length - 1,
      showDate,
      showSignature,
      principalName,
      najemName,
      paperSize,
      orientation,
      studentInfoFields,
      showClassTeacherSign,
      showGuardianSign,
      totalStudents,
      ExamName,
      lang,
      pressPrint,
      pressHidePreview,
      pressExamOffset,
      pressBodyOffset,
      pressSignOffset,
      ExamID: data?.examid,
      SubClassID: classGroupInfo?.SubClassID,
    };

    if (templateId === 'template-2') return <SingleMarkSheetModern {...commonProps} />;
    if (templateId === 'template-3') return <SingleMarkSheetElegant {...commonProps} />;
    if (templateId === 'template-4') return <SingleMarkSheetMinimal {...commonProps} />;
    if (templateId === 'template-5') return <SingleMarkSheetSidebar {...commonProps} />;
    if (templateId === 'template-6') return <SingleMarkSheetGazette {...commonProps} />;
    if (templateId === 'template-7') return <SingleMarkSheetBauhaus {...commonProps} />;
    if (templateId === 'template-8') return <SingleMarkSheetClassic {...commonProps} />;
    if (templateId === 'template-9') return <SingleMarkSheetTraditional {...commonProps} />;
    if (templateId === 'template-10') return <SingleMarkSheetTranscript {...commonProps} />;
    if (templateId === 'template-11') return <SingleMarkSheetOrnate {...commonProps} />;
    if (templateId === 'template-12') return <SingleMarkSheetRoyal {...commonProps} />;
    return <SingleMarkSheet {...commonProps} />; // default = template-1
  };

  return (
    <>
      <style>{getPrintCss(paperSize, orientation, templateId, {
        headerScale,
        contentFontScale,
        rowGapScale,
        totalSubjects: examSubjects.length,
        scopeId,
      })}</style>
      <div
        id={scopeId || 'marksheet-print-area'}
        className={`font-SolaimanLipi w-full ${
          scopeId
            ? ''
            : 'bg-slate-100 py-6 min-h-screen flex flex-col items-center print:bg-white print:py-0 min-h-0 print:block'
        } ${colorMode === 'bw' ? 'marksheet-mode-bw' : ''}`}
      >
        {/* Paper zoom wrapper — pages render at the real paper width */}
        <div className="w-full" style={{ zoom: paperZoom }}>
          {visibleStudents.map((student, idx) => renderSheet(student, idx))}
        </div>
      </div>
    </>
  );
};

export default MarkSheetPdf;
