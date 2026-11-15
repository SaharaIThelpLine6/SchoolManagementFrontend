import React from 'react';
import QRCode from "react-qr-code";

import { useGetLabelNameListsQuery } from '../../features/result/resultSilce';
import { bufferToDataUrl } from '../../utils/bufferDataURL';

// ==========================================
// Print CSS — templateId অনুযায়ী accent color
// ==========================================
const getPrintCss = (paperSize, orientation, templateId) => {
  const palette = {
    'template-2': { th: '#6d28d9', thBorder: '#5b21b6', alt: '#f5f3ff' },
    'template-3': { th: '#b45309', thBorder: '#92400e', alt: '#fffbeb' },
    'template-4': { th: '#000000', thBorder: '#000000', alt: '#fafafa' },
    'template-5': { th: '#0891b2', thBorder: '#0e7490', alt: '#ecfeff' },
    'template-6': { th: '#1c1917', thBorder: '#000000', alt: '#ede7d5', base: '#f5f0e3' },
    'template-7': { th: '#2563eb', thBorder: '#000000', alt: '#fef3c7', base: '#ffffff' },
  };
  const p = palette[templateId] || { th: '#0f766e', thBorder: '#0f766e', alt: '#f0fdfa' };

  return `
@page { size: ${paperSize} ${orientation}; margin: 5mm; }

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
    height: auto !important;
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
  .marksheet-body > * { flex-shrink: 0 !important; }
  .marksheet-body > .marksheet-comments {
    flex: 1 1 auto !important;
    flex-shrink: 1 !important;
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
    color: #ffffff !important;
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

// ==========================================
// শেয়ার্ড ডাটা ক্যালকুলেশন (৩টি টেমপ্লেটেই ব্যবহার)
// ==========================================
const computeMarkSheetData = ({ student, examSubjects, examConfig = {}, divisions = [] }) => {
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
    subject: pick(s?.SubjectName, s?.ArabicSubject, s?.EngSubjectName),
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
  const rowText = ultraDense ? 'print:text-[12.5px]' : veryDense ? 'print:text-[13.5px]' : dense ? 'print:text-[15px]' : 'print:text-[17px]';

  const divisionRows = [];
  if (Number(examConfig?.ExamType) === 4) {
    const source = examSubjects?.[0] || {};
    for (let i = 1; i <= 14; i++) {
      const dId = source?.[`DivisionID${i}`];
      const dNum = source?.[`DivisionNumber${i}`];
      if (dId === null || dId === undefined || dId === '') continue;
      const found = divisions.find((d) => Number(d.ID) === Number(dId));
      if (!found) continue;
      divisionRows.push({ name: found.DivisionNames, number: dNum ?? 0 });
    }
  } else {
    for (let i = 1; i <= 14; i++) {
      const dId = examConfig?.[`DivisionID${i}`];
      const dNum = examConfig?.[`DivisionNumber${i}`];
      if (dId === null || dId === undefined || dId === '') continue;
      const found = divisions.find((d) => Number(d.ID) === Number(dId));
      if (!found) continue;
      divisionRows.push({ name: found.DivisionNames, number: dNum ?? 0 });
    }
  }

  const studentName = pick(student?.UserName, student?.StudentName, student?.Name);
  const fatherName = pick(student?.FatherName, student?.FathersName, student?.Father);
  const motherName = pick(student?.MotherName, student?.MothersName, student?.Mother);
  const birthDate = pick(student?.DateOfBirth, student?.DOB, student?.BirthDate);
  const rollNumber = pick(student?.AdmissionSerial);
  const registration = pick(student?.UserCode);
  const divisionName = pick(student?.DivisionNames);
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
    <div className={`flex items-center gap-2 text-[17px] print:text-[15px] font-bold ${p.text} mt-6 mb-3 print:mt-1.5 print:mb-1`}>
      <span className={`section-icon ${p.icon}`}>{icon}</span>
      <span className="whitespace-nowrap">{children}</span>
      <div className={`flex-1 h-[2px] bg-gradient-to-r ${p.grad} to-transparent`} />
      {right}
    </div>
  );
};

const InfoRow = ({ label, value, labelW = 'w-[125px]' }) => (
  <div className="flex border-b border-slate-200 py-2 print:py-1 text-[16px] print:text-[14px]">
    <span className={`${labelW} print:w-[105px] shrink-0 text-black font-bold`}>{label}</span>
    <span className="font-bold text-black">{toBn(value)}</span>
  </div>
);

// ==========================================
// DEFAULT: Single Student Mark Sheet (আপনার বর্তমান ডিজাইন)
// ==========================================
const SingleMarkSheet = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 text-slate-800 mb-10 print:mb-0 print:flex print:flex-col`}>
      <div className="marksheet-header relative flex flex-col md:flex-row print:flex-row items-center justify-between bg-gradient-to-r from-teal-800 to-emerald-600 px-8 py-4 print:px-5 print:py-2 text-white print:shrink-0">
        <div className="flex items-center gap-4 print:gap-2.5 mb-3 md:mb-0 print:mb-0">
          <div className="h-[60px] w-[60px] print:h-[46px] print:w-[46px] overflow-hidden rounded-full border-[3px] border-emerald-300 print:border-0 bg-white shadow-md print:shadow-none shrink-0">
            {imageSrc ? (
              <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <span className="text-[12px] font-medium text-slate-400">No Logo</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-[27px] md:text-[29px] print:text-[21px] font-bold leading-tight text-white drop-shadow-sm">
              {toBn(institution?.InstitutionName || '-')}
            </h1>
            <p className="text-[14px] md:text-[15px] print:text-[13px] text-emerald-100 mt-0.5 print:mt-0">
              {toBn(institution?.Address || '-')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:gap-2 shrink-0">
          <span className="text-[15px] md:text-base print:text-[13px] text-emerald-100 whitespace-nowrap">{toBn(session?.SessionName || '-')}</span>
          <span className="text-emerald-300/60 print:text-[13px]">|</span>
          <span className="rounded-full border border-emerald-300/50 print:border-0 bg-emerald-700/50 px-3.5 py-1 print:px-2.5 print:py-0.5 text-[15px] print:text-[13px] font-semibold text-white shadow-sm print:shadow-none whitespace-nowrap">
            {toBn(ExamName || '-')}
          </span>
        </div>
      </div>

      <div className="marksheet-rainbow h-1 shrink-0 bg-gradient-to-r from-[#e5484d] via-[#facc15] via-[#22c55e] via-[#0ea5e9] to-[#a855f7]" />

      <div className="marksheet-body px-6 md:px-8 pb-8 pt-1 print:px-5 print:pb-2 print:pt-1 print:flex-1 print:flex print:flex-col print:min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 mt-0 print:mt-0 print:shrink-0">
          <div>
            <SectionTitle
              icon="👤"
              right={
                <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-0.5 print:px-2.5 print:py-0 text-[14px] print:text-[12.5px] font-semibold text-white shadow-sm whitespace-nowrap">
                  {toBn(classInfo?.ClassName || '-')}
                </span>
              }
            >
              পরীক্ষার্থীর তথ্য
            </SectionTitle>
            <div className="bg-slate-50/50 rounded-lg p-3 print:p-2 border border-slate-100">
              {studentInfoFields.name && <InfoRow label="নাম" value={studentName} />}
              {studentInfoFields.fatherName && <InfoRow label="পিতার নাম" value={fatherName} />}
              {studentInfoFields.motherName && <InfoRow label="মাতার নাম" value={motherName} />}
              {studentInfoFields.dob && <InfoRow label="জন্ম তারিখ" value={birthDate} />}
              {studentInfoFields.registration && <InfoRow label={labels?.StudentIDLabel ?? 'দাখেলা'} value={registration} />}
              {studentInfoFields.admission && <InfoRow label={labels?.AdmissionIDLabel ?? 'ভর্তি নং'} value={rollNumber} />}
            </div>
          </div>

          <div>
            <SectionTitle icon="📝">নম্বর বিভাজন</SectionTitle>
            <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 print:px-2 print:py-1 text-center">
                <p className="text-[16px] print:text-[14px] font-bold text-black">
                  মোট বিভাগ - {toBn(divisionRows.length)} টি | মোট বিষয় {toBn(totalSubjects)} টি
                </p>
              </div>
              <div className="p-2 print:p-1">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[15px] print:text-[14px] py-2 print:py-1">কোনো বিভাগ পাওয়া যায়নি</div>
                ) : (
                  divisionRows.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[16px] print:text-[14px] font-bold text-black border-b border-dashed border-slate-200 last:border-0">
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

        <div className="mt-8 print:mt-1 print:shrink-0">
          <SectionTitle icon="📊">বিষয়ভিত্তিক ফলাফল</SectionTitle>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr className="text-center">
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold">ক্রমিক</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-4 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold text-left">বিষয়</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold">পূর্ণমান</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold">পাশমার্ক</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold whitespace-nowrap">সর্বোচ্চ প্রাপ্ত</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1 text-[17px] print:text-[14.5px] font-bold">প্রাপ্ত নম্বর</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#f0fdfa' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ${rowText} font-bold`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[17px] ${rowText} font-bold text-black`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ${rowText} font-bold`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ${rowText} font-bold`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ${rowText} font-bold`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[17px] ${rowText} font-bold text-black`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 print:mt-1 print:shrink-0">
          <SectionTitle icon="🏆">সারসংক্ষেপ</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] print:text-[12.5px] font-bold text-emerald-600">প্রাপ্ত বিভাগ</p>
              <p className="text-[20px] print:text-[16px] font-bold text-emerald-800 leading-tight">{toBn(divisionName)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-blue-200 bg-blue-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] print:text-[12.5px] font-bold text-blue-600">মেধা স্থান</p>
              <p className="text-[20px] print:text-[16px] font-bold text-blue-800 leading-tight">{toBn(student?.Positions ?? '-')}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-purple-200 bg-purple-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] print:text-[12.5px] font-bold text-purple-600">গড়</p>
              <p className="text-[20px] print:text-[16px] font-bold text-purple-800 leading-tight">{toBn(averageMark)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 print:p-1 shadow-sm">
              <p className="text-[14px] print:text-[12.5px] font-bold text-amber-600">মোট নম্বর</p>
              <p className="text-[20px] print:text-[16px] font-bold text-amber-800 leading-tight">{toBn(student?.Total ?? '-')}</p>
            </div>
          </div>
        </div>

        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-8 pt-6 print:mt-1.5 print:pt-1.5 border-t border-slate-200 print:flex print:flex-col">
          <div className="flex flex-col md:flex-row print:flex-row gap-6 print:gap-3 print:flex-1 print:min-h-0">
            {showClassTeacherSign && (
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[85px] flex flex-col">
              <p className="text-black font-bold text-[17px] print:text-[14px]">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
              <div className="border-b border-dashed border-slate-400 w-2/3 mt-2 print:mt-1.5 text-[16px] print:text-[13.5px] text-black">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[85px] flex flex-col">
              <p className="text-black font-bold text-[17px] print:text-[14px]">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
              <div className="border-b border-dashed border-slate-400 w-2/3 mt-2 print:mt-1.5"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      <div className="grid grid-cols-5 items-start gap-6 bg-white border-t border-slate-200 px-8 py-6 print:gap-4 print:px-5 print:py-1.5 print:mt-auto print:shrink-0">
        <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
          <div className="mt-3 print:mt-0">
            <QRCode size={75} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox="0 0 256 256" />
          </div>
          <div className="mt-3 text-center print:mt-0.5">
            <p className="text-[17px] text-black font-bold print:text-[12.5px]">যাচাই করুন</p>
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[20px] font-bold text-black print:text-[14px]">{principalName || institution?.PrincipalName}</p>
            {showDate && <p className="text-[15px] text-black font-bold print:text-[12.5px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[20px] font-bold text-black print:text-[14px]">{najemName || institution?.NajemName}</p>
            {showDate && <p className="text-[15px] text-black font-bold print:text-[12.5px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
      </div>

      <div className="mx-8 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center border-t border-slate-200 py-1.5 print:py-0 gap-2 print:shrink-0">
        <span className="text-[11px] print:text-[8.5px] font-semibold text-black">
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
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const summaryItems = [
    { label: 'প্রাপ্ত বিভাগ', value: divisionName, from: 'from-violet-500', to: 'to-indigo-500', icon: '🏅' },
    { label: 'মেধা স্থান', value: student?.Positions ?? '-', from: 'from-indigo-500', to: 'to-blue-500', icon: '🎯' },
    { label: 'গড়', value: averageMark, from: 'from-fuchsia-500', to: 'to-pink-500', icon: '📈' },
    { label: 'মোট নম্বর', value: student?.Total ?? '-', from: 'from-purple-500', to: 'to-violet-500', icon: '⭐' },
  ];

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-gradient-to-br from-slate-50 to-violet-50/40 shadow-2xl rounded-3xl border-2 border-violet-200 text-slate-800 mb-10 print:mb-0 print:flex print:flex-col`}>
      {/* Header */}
      <div className="marksheet-header relative m-3 print:m-2 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-700 to-fuchsia-600 px-6 py-5 print:px-4 print:py-2 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, white 0, transparent 35%)' }} />
        <div className="relative flex flex-col md:flex-row print:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[58px] w-[58px] print:h-[44px] print:w-[44px] overflow-hidden rounded-2xl ring-2 ring-white/40 bg-white/10 backdrop-blur-sm shrink-0">
              {imageSrc ? (
                <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/20"><span className="text-[11px] text-white/70">No Logo</span></div>
              )}
            </div>
            <div>
              <h1 className="text-[24px] md:text-[26px] print:text-[19px] font-bold leading-tight text-white">
                {toBn(institution?.InstitutionName || '-')}
              </h1>
              <p className="text-[13px] print:text-[12px] text-violet-100 mt-0.5">{toBn(institution?.Address || '-')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-3 py-1 print:px-2.5 print:py-0.5 text-[13px] print:text-[12px] font-semibold text-white whitespace-nowrap">
              {toBn(session?.SessionName || '-')}
            </span>
            <span className="rounded-full bg-white text-violet-800 px-3 py-1 print:px-2.5 print:py-0.5 text-[13px] print:text-[12px] font-bold whitespace-nowrap">
              {toBn(ExamName || '-')}
            </span>
          </div>
        </div>
      </div>

      <div className="marksheet-rainbow h-1 shrink-0 mx-3 print:mx-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />

      <div className="marksheet-body px-4 md:px-6 pb-6 pt-1 print:px-5 print:pb-2 print:pt-1 print:flex-1 print:flex print:flex-col print:min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-3 mt-3 print:mt-1 print:shrink-0">
          {/* Student info */}
          <div>
            <SectionTitle
              icon="👤"
              accent="violet"
              right={
                <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-0.5 print:px-2.5 print:py-0 text-[13px] print:text-[12px] font-bold text-white shadow whitespace-nowrap">
                  {toBn(classInfo?.ClassName || '-')}
                </span>
              }
            >
              পরীক্ষার্থীর তথ্য
            </SectionTitle>
            <div className="rounded-xl bg-white border-l-4 border-violet-500 shadow-sm p-3 print:p-2 border-r border-t border-b border-violet-100">
              {studentInfoFields.name && <InfoRow label="নাম" value={studentName} />}
              {studentInfoFields.fatherName && <InfoRow label="পিতার নাম" value={fatherName} />}
              {studentInfoFields.motherName && <InfoRow label="মাতার নাম" value={motherName} />}
              {studentInfoFields.dob && <InfoRow label="জন্ম তারিখ" value={birthDate} />}
              {studentInfoFields.registration && <InfoRow label={labels?.StudentIDLabel ?? 'দাখেলা'} value={registration} />}
              {studentInfoFields.admission && <InfoRow label={labels?.AdmissionIDLabel ?? 'ভর্তি নং'} value={rollNumber} />}
            </div>
          </div>

          {/* Division */}
          <div>
            <SectionTitle icon="📝" accent="violet">নম্বর বিভাজন</SectionTitle>
            <div className="rounded-xl overflow-hidden border border-violet-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-1.5 print:py-1 text-center">
                <p className="text-[15px] print:text-[13px] font-bold text-white">
                  মোট বিভাগ - {toBn(divisionRows.length)} টি | মোট বিষয় {toBn(totalSubjects)} টি
                </p>
              </div>
              <div className="p-2 print:p-1">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[14px] py-2">কোনো বিভাগ পাওয়া যায়নি</div>
                ) : (
                  divisionRows.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[15px] print:text-[13px] font-bold text-slate-800 border-b border-dashed border-violet-100 last:border-0">
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
        <div className="mt-6 print:mt-1 print:shrink-0">
          <SectionTitle icon="📊" accent="violet">বিষয়ভিত্তিক ফলাফল</SectionTitle>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-xl border border-violet-200 shadow-sm">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr className="text-center">
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold">ক্রমিক</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-4 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold text-left">বিষয়</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold">পূর্ণমান</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold">পাশমার্ক</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold whitespace-nowrap">সর্বোচ্চ প্রাপ্ত</th>
                  <th style={TH_STYLE_MODERN} className="border-b border-violet-700 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold">প্রাপ্ত নম্বর</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#f5f3ff' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold text-violet-700`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[16px] ${rowText} font-bold text-black`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-violet-50 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold text-violet-700`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 print:mt-1 print:shrink-0">
          <SectionTitle icon="🏆" accent="violet">সারসংক্ষেপ</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
            {summaryItems.map((item, i) => (
              <div key={i} className={`rounded-xl bg-gradient-to-br ${item.from} ${item.to} p-2.5 print:p-1 shadow-md text-white flex flex-col items-center justify-center gap-0.5`}>
                <span className="text-[16px] print:text-[13px]">{item.icon}</span>
                <p className="text-[12.5px] print:text-[11.5px] font-semibold opacity-90">{item.label}</p>
                <p className="text-[19px] print:text-[15.5px] font-bold leading-tight">{toBn(item.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-5 pt-4 print:mt-1.5 print:pt-1.5 print:flex print:flex-col">
          <div className="flex flex-col md:flex-row print:flex-row gap-4 print:gap-3 print:flex-1 print:min-h-0">
            {showClassTeacherSign && (
            <div className="flex-1 rounded-xl border border-violet-200 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col shadow-sm">
              <p className="text-violet-800 font-bold text-[15px] print:text-[13.5px]">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
              <div className="border-b border-dashed border-violet-300 w-2/3 mt-2 print:mt-1.5 text-[15px] print:text-[13px] text-slate-700">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="flex-1 rounded-xl border border-violet-200 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col shadow-sm">
              <p className="text-violet-800 font-bold text-[15px] print:text-[13.5px]">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
              <div className="border-b border-dashed border-violet-300 w-2/3 mt-2 print:mt-1.5"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-5 items-start gap-6 bg-white/80 backdrop-blur border-t-2 border-violet-200 px-6 py-5 print:gap-4 print:px-5 print:py-1.5 print:mt-auto print:shrink-0">
        <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
          <div className="p-1.5 rounded-xl bg-white border border-violet-200 shadow-sm">
            <QRCode size={70} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox="0 0 256 256" />
          </div>
          <div className="mt-2 text-center">
            <p className="text-[13px] text-violet-700 font-bold print:text-[11.5px]">যাচাই করুন</p>
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-violet-300 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[18px] font-bold text-violet-900 print:text-[13.5px]">{principalName || institution?.PrincipalName}</p>
            {showDate && <p className="text-[13px] text-slate-600 font-semibold print:text-[12px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-8">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
          </div>
          <div className="mt-2 w-full border-t-2 border-violet-300 print:mt-0.5"></div>
          <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
            <p className="text-[18px] font-bold text-violet-900 print:text-[13.5px]">{najemName || institution?.NajemName}</p>
            {showDate && <p className="text-[13px] text-slate-600 font-semibold print:text-[12px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
      </div>

      <div className="mx-6 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center py-1.5 print:py-0 gap-2 print:shrink-0">
        <span className="text-[11px] print:text-[8.5px] font-semibold text-slate-500">
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
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad, rowText,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const summaryItems = [
    { label: 'প্রাপ্ত বিভাগ', value: divisionName },
    { label: 'মেধা স্থান', value: student?.Positions ?? '-' },
    { label: 'গড়', value: averageMark },
    { label: 'মোট নম্বর', value: student?.Total ?? '-' },
  ];

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-[#fffdf7] shadow-xl rounded-lg text-slate-800 mb-10 print:mb-0 print:flex print:flex-col`}>
      {/* Elegant double gold border overlay */}
      <div className="pointer-events-none absolute inset-1.5 rounded-md border-2 border-amber-600/70" />
      <div className="pointer-events-none absolute inset-3 rounded-sm border border-amber-400/60" />

      <div className="relative">
        {/* Elegant header */}
        <div className="marksheet-header relative bg-gradient-to-b from-amber-50 to-white px-8 py-5 print:px-6 print:py-2 border-b-2 border-amber-600">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-[62px] w-[62px] print:h-[46px] print:w-[46px] overflow-hidden rounded-full ring-2 ring-amber-400 ring-offset-2 ring-offset-white bg-white shrink-0">
              {imageSrc ? (
                <img src={imageSrc} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-amber-50"><span className="text-[11px] text-amber-400">No Logo</span></div>
              )}
            </div>
            <div>
              <h1 className="text-[26px] md:text-[28px] print:text-[20px] font-bold leading-tight text-amber-900 tracking-wide">
                {toBn(institution?.InstitutionName || '-')}
              </h1>
              <p className="text-[13px] print:text-[12px] text-amber-700 italic mt-0.5">{toBn(institution?.Address || '-')}</p>
            </div>
            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent print:w-24" />
            <div className="flex flex-wrap items-center justify-center gap-3 print:gap-2">
              <span className="text-[14px] print:text-[12.5px] text-amber-800 font-semibold whitespace-nowrap">
                সেশন: {toBn(session?.SessionName || '-')}
              </span>
              <span className="text-amber-400">❖</span>
              <span className="text-[14px] print:text-[12.5px] text-amber-800 font-semibold whitespace-nowrap">
                পরীক্ষা: {toBn(ExamName || '-')}
              </span>
              <span className="text-amber-400">❖</span>
              <span className="text-[14px] print:text-[12.5px] text-amber-800 font-semibold whitespace-nowrap">
                শ্রেণী: {toBn(classInfo?.ClassName || '-')}
              </span>
            </div>
          </div>
        </div>

        <div className="marksheet-rainbow h-[3px] mx-4 print:mx-3 bg-gradient-to-r from-amber-300 via-amber-600 to-amber-300" />

        <div className="marksheet-body px-6 pb-6 pt-2 print:px-5 print:pb-2 print:pt-1 print:flex-1 print:flex print:flex-col print:min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-3 mt-2 print:mt-1 print:shrink-0">
            {/* Student info */}
            <div>
              <SectionTitle icon="◆" accent="amber">পরীক্ষার্থীর তথ্য</SectionTitle>
              <div className="rounded-md bg-white border border-amber-300 p-3 print:p-2">
                {studentInfoFields.name && <InfoRow label="নাম" value={studentName} />}
                {studentInfoFields.fatherName && <InfoRow label="পিতার নাম" value={fatherName} />}
                {studentInfoFields.motherName && <InfoRow label="মাতার নাম" value={motherName} />}
                {studentInfoFields.dob && <InfoRow label="জন্ম তারিখ" value={birthDate} />}
                {studentInfoFields.registration && <InfoRow label={labels?.StudentIDLabel ?? 'দাখেলা'} value={registration} />}
                {studentInfoFields.admission && <InfoRow label={labels?.AdmissionIDLabel ?? 'ভর্তি নং'} value={rollNumber} />}
              </div>
            </div>

            {/* Division */}
            <div>
              <SectionTitle icon="◆" accent="amber">নম্বর বিভাজন</SectionTitle>
              <div className="rounded-md overflow-hidden border border-amber-300 bg-white">
                <div className="bg-gradient-to-r from-amber-100 to-amber-200 border-b border-amber-300 px-3 py-1.5 print:py-1 text-center">
                  <p className="text-[15px] print:text-[13px] font-bold text-amber-900">
                    মোট বিভাগ - {toBn(divisionRows.length)} টি | মোট বিষয় {toBn(totalSubjects)} টি
                  </p>
                </div>
                <div className="p-2 print:p-1">
                  {divisionRows.length === 0 ? (
                    <div className="text-center text-amber-400 text-[14px] py-2">কোনো বিভাগ পাওয়া যায়নি</div>
                  ) : (
                    divisionRows.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1 print:py-0.5 px-2 text-[15px] print:text-[13px] font-semibold text-amber-900 border-b border-dotted border-amber-300 last:border-0">
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
          <div className="mt-5 print:mt-1 print:shrink-0">
            <SectionTitle icon="◆" accent="amber">বিষয়ভিত্তিক ফলাফল</SectionTitle>
            <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-md border-2 border-amber-600 shadow-sm">
              <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
                <thead>
                  <tr className="text-center">
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide">ক্রমিক</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-4 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide text-left">বিষয়</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide">পূর্ণমান</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide">পাশমার্ক</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide whitespace-nowrap">সর্বোচ্চ প্রাপ্ত</th>
                    <th style={TH_STYLE_ELEGANT} className="border-b border-amber-800 px-3 py-3 print:px-2 print:py-1 text-[16px] print:text-[14px] font-bold tracking-wide">প্রাপ্ত নম্বর</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((item, index) => {
                    const isAlt = index % 2 !== 0;
                    const cellStyle = { backgroundColor: isAlt ? '#fffbeb' : '#ffffff', ...EXACT };
                    return (
                      <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-semibold text-amber-800`}>{toBn(index + 1)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[16px] ${rowText} font-semibold text-black`}>{toBn(item.subject)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-semibold`}>{toBn(item.fullMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-semibold`}>{toBn(item.passMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-semibold`}>{toBn(item.highestMark)}</td>
                        <td style={cellStyle} className={`border-b border-amber-100 px-3 py-2.5 print:px-2 ${rowPad} text-[16px] ${rowText} font-bold text-amber-800`}>{toBn(item.obtainedMark)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-5 print:mt-1 print:shrink-0">
            <SectionTitle icon="◆" accent="amber">সারসংক্ষেপ</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-3 print:gap-1.5 mt-2 print:mt-0.5">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-0.5 rounded-md border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-2.5 print:p-1 shadow-sm">
                  <p className="text-[13px] print:text-[12px] font-semibold text-amber-700">{item.label}</p>
                  <p className="text-[19px] print:text-[15.5px] font-bold text-amber-900 leading-tight">{toBn(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments mt-5 pt-4 print:mt-1.5 print:pt-1.5 print:flex print:flex-col">
            <div className="flex flex-col md:flex-row print:flex-row gap-4 print:gap-3 print:flex-1 print:min-h-0">
              {showClassTeacherSign && (
              <div className="flex-1 rounded-md border border-amber-300 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col">
                <p className="text-amber-900 font-bold text-[15px] print:text-[13.5px]">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
                <div className="border-b border-dotted border-amber-400 w-2/3 mt-2 print:mt-1.5 text-[15px] print:text-[13px] text-slate-700">{student?.Note ?? ''}</div>
              </div>
              )}
              {showGuardianSign && (
              <div className="flex-1 rounded-md border border-amber-300 bg-white p-4 print:p-3 min-h-[100px] print:min-h-[80px] flex flex-col">
                <p className="text-amber-900 font-bold text-[15px] print:text-[13.5px]">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
                <div className="border-b border-dotted border-amber-400 w-2/3 mt-2 print:mt-1.5"></div>
              </div>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="grid grid-cols-5 items-start gap-6 bg-gradient-to-t from-amber-50 to-white border-t-2 border-amber-600 px-6 py-5 print:gap-4 print:px-5 print:py-1.5 print:mt-auto print:shrink-0">
          <div className="col-span-1 flex w-full flex-col items-center mt-2 print:mt-0">
            <div className="p-1 rounded-md bg-white border border-amber-400">
              <QRCode size={68} style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
                viewBox="0 0 256 256" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-[12px] text-amber-800 font-bold print:text-[11px]">যাচাই করুন</p>
            </div>
          </div>
          <div className="col-span-2 flex w-full flex-col items-center">
            <div className="h-16 w-full flex items-end justify-center print:h-8">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-16 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="mt-2 w-full border-t-2 border-double border-amber-600 print:mt-0.5"></div>
            <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
              <p className="text-[18px] font-bold text-amber-900 print:text-[13.5px]">{principalName || institution?.PrincipalName}</p>
              {showDate && <p className="text-[13px] text-amber-700 font-semibold print:text-[12px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
            </div>
          </div>
          <div className="col-span-2 flex w-full flex-col items-center">
            <div className="h-16 w-full flex items-end justify-center print:h-8">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-16 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="mt-2 w-full border-t-2 border-double border-amber-600 print:mt-0.5"></div>
            <div className="mt-3 space-y-1 text-center print:mt-0.5 print:space-y-0">
              <p className="text-[18px] font-bold text-amber-900 print:text-[13.5px]">{najemName || institution?.NajemName}</p>
              {showDate && <p className="text-[13px] text-amber-700 font-semibold print:text-[12px]">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
            </div>
          </div>
        </div>

        <div className="mx-6 print:mx-0 print:px-5 flex flex-col md:flex-row print:flex-row justify-between items-center py-1.5 print:py-0 gap-2 print:shrink-0">
          <span className="text-[11px] print:text-[8.5px] font-semibold text-amber-700">
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
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, rowPad, studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark, divisionRows, totalSubjects,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = [
    studentInfoFields.name && { label: 'NAME', value: studentName },
    studentInfoFields.fatherName && { label: 'FATHER', value: fatherName },
    studentInfoFields.motherName && { label: 'MOTHER', value: motherName },
    studentInfoFields.dob && { label: 'DATE OF BIRTH', value: birthDate },
    studentInfoFields.registration && { label: labels?.StudentIDLabel ?? 'REGISTRATION', value: registration },
    studentInfoFields.admission && { label: labels?.AdmissionIDLabel ?? 'ADMISSION', value: rollNumber },
  ].filter(Boolean);

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-black border border-black mb-10 print:mb-0 print:flex print:flex-col`}>
      {/* ── Header: uppercase, thin */}
      <div className="marksheet-header flex flex-col md:flex-row print:flex-row items-start justify-between gap-4 px-8 py-5 print:px-5 print:py-2 border-b border-black">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 print:h-11 print:w-11 shrink-0 overflow-hidden border border-black flex items-center justify-center">
            {imageSrc
              ? <img src={imageSrc} className="h-full w-full object-contain p-0.5" alt="" />
              : <span className="text-[8px] tracking-widest">LOGO</span>}
          </div>
          <div>
            <h1 className="text-[22px] print:text-[17px] font-bold uppercase tracking-[0.08em] leading-none">
              {toBn(institution?.InstitutionName || '-')}
            </h1>
            <p className="text-[10px] print:text-[9.5px] text-zinc-500 uppercase tracking-[0.25em] mt-1.5">
              {toBn(institution?.Address || '-')}
            </p>
          </div>
        </div>
        <div className="text-left md:text-right print:text-right shrink-0">
          <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.25em] text-zinc-500">Session</div>
          <div className="text-[13px] print:text-[12px] font-bold uppercase tracking-wide leading-tight">{toBn(session?.SessionName || '-')}</div>
          <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.25em] text-zinc-500 mt-2">Examination</div>
          <div className="text-[13px] print:text-[12px] font-bold uppercase tracking-wide leading-tight">{toBn(ExamName || '-')}</div>
        </div>
      </div>

      {/* Thin bold divider strip */}
      <div className="marksheet-rainbow h-[3px] shrink-0 bg-black" />

      <div className="marksheet-body px-8 pb-4 pt-3 print:px-5 print:pb-1 print:pt-1.5 print:flex-1 print:flex print:flex-col print:min-h-0">
        {/* ── Info grid: 3 columns, uppercase labels */}
        <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-x-6 gap-y-2.5 print:gap-y-1.5 print:shrink-0">
          {infoItems.map((f, i) => (
            <div key={i} className="border-b border-zinc-300 pb-1 print:pb-0.5">
              <div className="text-[8.5px] print:text-[8px] uppercase tracking-[0.22em] text-zinc-500">{f.label}</div>
              <div className="text-[13.5px] print:text-[12px] font-semibold truncate">{toBn(f.value)}</div>
            </div>
          ))}
          <div className="border-b border-zinc-300 pb-1 print:pb-0.5">
            <div className="text-[8.5px] print:text-[8px] uppercase tracking-[0.22em] text-zinc-500">CLASS</div>
            <div className="text-[13.5px] print:text-[12px] font-semibold">{toBn(classInfo?.ClassName || '-')}</div>
          </div>
        </div>

        {/* ── Divisions: compact inline grid */}
        <div className="mt-4 print:mt-2 print:shrink-0">
          <div className="flex items-center gap-2 mb-1.5 print:mb-1">
            <span className="text-[9px] print:text-[8.5px] uppercase tracking-[0.25em] text-zinc-500">DIVISION BREAKDOWN</span>
            <div className="flex-1 h-px bg-zinc-300" />
            <span className="text-[10px] print:text-[9px] text-zinc-500">{toBn(divisionRows.length)} divisions · {toBn(totalSubjects)} subjects</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 print:grid-cols-4 gap-x-4 gap-y-1">
            {divisionRows.length === 0
              ? <div className="col-span-full text-zinc-400 italic text-[11px]">No divisions</div>
              : divisionRows.map((item, i) => (
                <div key={i} className="flex justify-between border-b border-dotted border-zinc-300 pb-0.5 text-[11.5px] print:text-[10.5px]">
                  <span className="truncate">{item.name}</span>
                  <span className="font-semibold tabular-nums ml-2">{toBn(item.number)}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── Table: pure black border, uppercase head */}
        <div className="mt-4 print:mt-2 print:shrink-0">
          <div className="flex items-center gap-2 mb-1.5 print:mb-1">
            <span className="text-[9px] print:text-[8.5px] uppercase tracking-[0.25em] text-zinc-500">SUBJECT-WISE RESULT</span>
            <div className="flex-1 h-px bg-zinc-300" />
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border border-black">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-black">
              <thead>
                <tr>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-left w-12">SL</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-left">SUBJECT</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-center">FULL</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-center">PASS</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-2 py-2 print:px-1.5 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-center whitespace-nowrap">HIGH</th>
                  <th style={TH_STYLE_MONO} className="border-b border-black px-3 py-2 print:px-2 print:py-1 text-[10px] print:text-[9.5px] font-bold uppercase tracking-[0.15em] text-center">OBTAINED</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => (
                  <tr key={item.id} className="text-[12px] print:text-[11px]">
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
        <div className="mt-4 print:mt-2 print:shrink-0 border-t border-black pt-3 print:pt-1.5 flex flex-wrap items-center gap-x-6 gap-y-2 print:gap-x-4 print:gap-y-1">
          {[
            ['DIVISION', divisionName],
            ['POSITION', student?.Positions ?? '-'],
            ['AVERAGE', averageMark],
            ['TOTAL', student?.Total ?? '-'],
          ].map(([label, val], i) => (
            <div key={i} className="flex items-baseline gap-2">
              <span className="text-[9px] print:text-[8.5px] uppercase tracking-[0.2em] text-zinc-500">{label}</span>
              <span className="text-[16px] print:text-[14px] font-bold tabular-nums">{toBn(val)}</span>
              {i < 3 && <span className="text-zinc-300 ml-3">|</span>}
            </div>
          ))}
        </div>

        {/* ── Comments: minimal underlines */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments mt-4 print:mt-2 print:flex print:flex-col">
          <div className="grid grid-cols-2 print:grid-cols-2 gap-8 print:gap-5">
            {showClassTeacherSign && (
            <div>
              <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.22em] text-zinc-500">CLASS TEACHER'S REMARK</div>
              <div className="h-10 print:h-7 border-b border-black flex items-end text-[12px] print:text-[11px] pb-0.5">{student?.Note ?? ''}</div>
              <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.22em] text-zinc-500 mt-3 print:mt-2">SIGNATURE</div>
              <div className="border-b border-zinc-400 w-3/4 mt-4 print:mt-3"></div>
            </div>
            )}
            {showGuardianSign && (
            <div>
              <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.22em] text-zinc-500">GUARDIAN'S REMARK</div>
              <div className="h-10 print:h-7 border-b border-black"></div>
              <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.22em] text-zinc-500 mt-3 print:mt-2">SIGNATURE</div>
              <div className="border-b border-zinc-400 w-3/4 mt-4 print:mt-3"></div>
            </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* ── Footer: 3 columns, minimal */}
      <div className="border-t border-black px-8 py-3 print:px-5 print:py-1 print:mt-auto print:shrink-0 grid grid-cols-3 items-end gap-4 print:gap-2">
        <div>
          <div className="text-[9px] print:text-[8.5px] uppercase tracking-[0.22em] text-zinc-500 mb-1">VERIFY ONLINE</div>
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
            <div className="text-[12px] print:text-[11px] font-bold uppercase tracking-wide">{principalName || institution?.PrincipalName}</div>
            <div className="text-[8.5px] print:text-[8px] text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Principal</div>
            {showDate && <div className="text-[10px] print:text-[9px] text-zinc-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>
        <div className="text-center">
          <div className="h-10 print:h-7 flex items-end justify-center">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-10 max-w-full object-contain print:max-h-7" />}
          </div>
          <div className="border-t border-black mt-1.5 pt-1.5">
            <div className="text-[12px] print:text-[11px] font-bold uppercase tracking-wide">{najemName || institution?.NajemName}</div>
            <div className="text-[8.5px] print:text-[8px] text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Vice Principal</div>
            {showDate && <div className="text-[10px] print:text-[9px] text-zinc-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-8 print:px-5 py-1.5 print:py-0 text-[9px] print:text-[8px] uppercase tracking-[0.2em] text-zinc-500">
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
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, rowPad, studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark, divisionRows,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = [
    studentInfoFields.name && { label: 'নাম', value: studentName },
    studentInfoFields.fatherName && { label: 'পিতা', value: fatherName },
    studentInfoFields.motherName && { label: 'মাতা', value: motherName },
    studentInfoFields.dob && { label: 'জন্ম তারিখ', value: birthDate },
    studentInfoFields.registration && { label: labels?.StudentIDLabel ?? 'দাখেলা', value: registration },
    studentInfoFields.admission && { label: labels?.AdmissionIDLabel ?? 'ভর্তি নং', value: rollNumber },
  ].filter(Boolean);

  const summaryItems = [
    { label: 'বিভাগ', value: divisionName, tone: 'from-cyan-500 to-teal-500' },
    { label: 'মেধা', value: student?.Positions ?? '-', tone: 'from-teal-500 to-emerald-500' },
    { label: 'গড়', value: averageMark, tone: 'from-sky-500 to-cyan-500' },
    { label: 'মোট', value: student?.Total ?? '-', tone: 'from-cyan-600 to-teal-600' },
  ];

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white rounded-2xl shadow-2xl border border-cyan-200 mb-10 print:mb-0 print:flex print:flex-col`}>
      {/* ── Main body: sidebar + content */}
      <div className="flex flex-col md:flex-row print:flex-row print:flex-1 print:min-h-0">
        {/* ═══ SIDEBAR (dark, 35%) ═══ */}
        <div className="marksheet-header md:w-[35%] print:w-[35%] shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950 text-white px-5 py-5 print:px-3.5 print:py-3 flex flex-col gap-3 print:gap-1.5 print:flex print:flex-col">
          {/* Logo + Institution */}
          <div className="text-center print:text-center">
            <div className="h-16 w-16 print:h-12 print:w-12 mx-auto overflow-hidden rounded-2xl ring-2 ring-cyan-400/40 bg-white">
              {imageSrc
                ? <img src={imageSrc} className="h-full w-full object-cover" alt="" />
                : <div className="h-full w-full bg-white/10 flex items-center justify-center text-[9px] text-white/50">LOGO</div>}
            </div>
            <h1 className="text-[16px] print:text-[13.5px] font-bold mt-2 print:mt-1 leading-tight text-white">
              {toBn(institution?.InstitutionName || '-')}
            </h1>
            <p className="text-[9.5px] print:text-[8.5px] text-cyan-300 mt-1 leading-snug">
              {toBn(institution?.Address || '-')}
            </p>
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Session/Exam/Class */}
          <div className="space-y-1.5 print:space-y-0.5">
            {[
              ['সেশন', session?.SessionName],
              ['পরীক্ষা', ExamName],
              ['শ্রেণী', classInfo?.ClassName],
            ].map(([label, val], i) => (
              <div key={i}>
                <div className="text-[8.5px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-400/80">{label}</div>
                <div className="text-[12px] print:text-[10.5px] font-semibold leading-tight">{toBn(val || '-')}</div>
              </div>
            ))}
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Student info */}
          <div>
            <div className="text-[8.5px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5 print:mb-1">পরীক্ষার্থীর তথ্য</div>
            <div className="space-y-1.5 print:space-y-0.5">
              {infoItems.map((f, i) => (
                <div key={i}>
                  <div className="text-[8px] print:text-[7.5px] text-cyan-400/60 uppercase">{f.label}</div>
                  <div className="text-[11.5px] print:text-[10.5px] font-semibold leading-tight truncate">{toBn(f.value)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-cyan-400/25" />

          {/* Division */}
          <div>
            <div className="text-[8.5px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-400/80 mb-1.5 print:mb-1">
              বিভাজন ({toBn(divisionRows.length)})
            </div>
            {divisionRows.length === 0
              ? <div className="text-[10px] text-white/40 italic">কোনো বিভাগ নেই</div>
              : <div className="space-y-0.5">
                  {divisionRows.map((item, i) => (
                    <div key={i} className="flex justify-between text-[10.5px] print:text-[9.5px] py-0.5 border-b border-white/10 last:border-0">
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
            <p className="text-[9px] print:text-[8px] text-cyan-300 mt-1 print:mt-0.5">যাচাই করুন</p>
          </div>
        </div>

        {/* ═══ MAIN CONTENT (65%) ═══ */}
        <div className="md:flex-1 print:flex-1 flex flex-col p-5 print:p-3 bg-white min-w-0">
          {/* Table */}
          <div className="mb-1 flex items-center gap-2 print:mb-0.5">
            <span className="text-[9px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-700 font-bold">বিষয়ভিত্তিক ফলাফল</span>
            <div className="flex-1 h-px bg-cyan-200" />
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-lg border border-cyan-200 print:shrink-0">
            <table className="w-full min-w-[500px] print:min-w-0 border-collapse bg-white text-slate-800">
              <thead>
                <tr>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2 py-2 print:px-1.5 print:py-1 text-[10px] print:text-[9.5px] font-bold text-center w-10">#</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2.5 py-2 print:px-2 print:py-1 text-[10px] print:text-[9.5px] font-bold text-left">বিষয়</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] print:text-[9.5px] font-bold text-center">পূর্ণ</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] print:text-[9.5px] font-bold text-center">পাশ</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-1.5 py-2 print:px-1 print:py-1 text-[10px] print:text-[9.5px] font-bold text-center">সর্বোচ্চ</th>
                  <th style={TH_STYLE_SIDEBAR} className="border-b border-cyan-700 px-2 py-2 print:px-1.5 print:py-1 text-[10px] print:text-[9.5px] font-bold text-center">প্রাপ্ত</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#ecfeff' : '#ffffff', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center text-[11.5px] print:text-[10.5px]`}>
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
          <div className="grid grid-cols-4 gap-2 print:gap-1 mt-3 print:mt-1.5 print:shrink-0">
            {summaryItems.map((item, i) => (
              <div key={i} className={`rounded-lg bg-gradient-to-br ${item.tone} px-2 py-2 print:px-1 print:py-1 text-white text-center shadow-md`}>
                <div className="text-[8.5px] print:text-[7.5px] uppercase tracking-wider font-semibold opacity-90">{item.label}</div>
                <div className="text-[15px] print:text-[13px] font-bold tabular-nums leading-tight mt-0.5">{toBn(item.value)}</div>
              </div>
            ))}
          </div>

          {/* Comments */}
          {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments flex-1 mt-3 print:mt-1.5 grid grid-cols-2 print:grid-cols-2 gap-3 print:gap-2 print:min-h-0">
            {showClassTeacherSign && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-3 print:p-2 flex flex-col min-h-[80px] print:min-h-[65px]">
              <p className="text-cyan-800 font-bold text-[11px] print:text-[10px] mb-1">শ্রেণী শিক্ষকের মন্তব্য</p>
              <div className="border-b border-dashed border-cyan-400 w-3/4 mt-1 text-[11px] print:text-[10px] text-slate-700 flex-1">{student?.Note ?? ''}</div>
            </div>
            )}
            {showGuardianSign && (
            <div className="rounded-lg border border-cyan-200 bg-cyan-50/30 p-3 print:p-2 flex flex-col min-h-[80px] print:min-h-[65px]">
              <p className="text-cyan-800 font-bold text-[11px] print:text-[10px] mb-1">অভিভাবকের মন্তব্য</p>
              <div className="border-b border-dashed border-cyan-400 w-3/4 mt-1 flex-1"></div>
            </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* ═══ FOOTER: 2 signatures, full width ═══ */}
      <div className="border-t border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 px-6 py-4 print:px-5 print:py-1.5 print:mt-auto print:shrink-0">
        <div className="grid grid-cols-2 gap-8 print:gap-6 max-w-xl mx-auto print:max-w-lg">
          <div className="flex flex-col items-center">
            <div className="h-12 print:h-8 flex items-end justify-center w-full">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-12 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="border-t-2 border-cyan-700 mt-1.5 print:mt-1 w-full"></div>
            <p className="text-[13px] print:text-[11.5px] font-bold text-slate-800 mt-1.5 print:mt-1 text-center">{principalName || institution?.PrincipalName}</p>
            <p className="text-[9px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-700">মুহতামিম</p>
            {showDate && <p className="text-[9px] print:text-[8px] text-slate-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 print:h-8 flex items-end justify-center w-full">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-12 max-w-full object-contain print:max-h-8" />}
            </div>
            <div className="border-t-2 border-cyan-700 mt-1.5 print:mt-1 w-full"></div>
            <p className="text-[13px] print:text-[11.5px] font-bold text-slate-800 mt-1.5 print:mt-1 text-center">{najemName || institution?.NajemName}</p>
            <p className="text-[9px] print:text-[8px] uppercase tracking-[0.2em] text-cyan-700">নায়েবে তালিমাত</p>
            {showDate && <p className="text-[9px] print:text-[8px] text-slate-500 mt-0.5 tabular-nums">{toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-center py-1 print:py-0.5 text-[9px] print:text-[8px] text-cyan-300/70 tracking-wider">
        Software developed by <span className="font-bold text-cyan-300">SAHARAIT</span>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 6: Vintage Gazette (newspaper style)
// ==========================================
const SingleMarkSheetGazette = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = [
    studentInfoFields.name && { label: 'NAME', value: studentName },
    studentInfoFields.fatherName && { label: 'FATHER', value: fatherName },
    studentInfoFields.motherName && { label: 'MOTHER', value: motherName },
    studentInfoFields.dob && { label: 'DATE OF BIRTH', value: birthDate },
    studentInfoFields.registration && { label: labels?.StudentIDLabel ?? 'REG.', value: registration },
    studentInfoFields.admission && { label: labels?.AdmissionIDLabel ?? 'ADM.', value: rollNumber },
  ].filter(Boolean);

  return (
    <div
      className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-[#f5f0e3] text-stone-900 mb-10 print:mb-0 print:flex print:flex-col shadow-xl`}
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* ── MASTHEAD */}
      <div className="marksheet-header px-6 pt-4 pb-2 border-t-[3px] border-double border-t-[6px] border-stone-900 border-b-[3px] border-double border-b-[6px]">
        <div className="text-center">
          <div className="text-[8.5px] print:text-[8px] tracking-[0.5em] uppercase text-stone-600">
            The Official Academic Record
          </div>
          <h1 className="text-[34px] print:text-[24px] font-black leading-none tracking-[0.02em] my-1">
            THE RESULT GAZETTE
          </h1>
          <div className="flex items-center justify-center gap-3 text-[10px] print:text-[9px] uppercase tracking-wider text-stone-700">
            <span>VOL. {toBn(session?.SessionName || '-')}</span>
            <span>·</span>
            <span>NO. {toBn(ExamName || '-')}</span>
            <span>·</span>
            <span>{showDate ? toBn(new Date().toLocaleDateString('bn-BD')) : ''}</span>
          </div>
        </div>
      </div>

      {/* ── Institution name as secondary header */}
      <div className="text-center px-6 py-2 border-b border-stone-400">
        <h2 className="text-[18px] print:text-[15px] font-bold italic">{toBn(institution?.InstitutionName || '-')}</h2>
        <p className="text-[10px] print:text-[9px] text-stone-600">{toBn(institution?.Address || '-')}</p>
      </div>

      {/* ── Body: 2-column */}
      <div className="marksheet-body px-5 py-3 print:px-4 print:py-1.5 print:flex-1 print:flex print:flex-col print:min-h-0">
        {/* Top: student + divisions in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-5 print:gap-4 mb-3 print:mb-2 print:shrink-0">
          <div>
            <div className="border-b-2 border-stone-900 pb-0.5 mb-1.5">
              <h3 className="text-[12px] print:text-[10.5px] font-black uppercase tracking-wider">Student Profile</h3>
            </div>
            <div className="space-y-1 text-[11.5px] print:text-[10.5px]">
              {infoItems.map((f, i) => (
                <div key={i} className="flex items-baseline border-b border-dotted border-stone-400 pb-0.5">
                  <span className="text-[8px] print:text-[7.5px] font-bold uppercase tracking-wider text-stone-500 w-20 shrink-0">{f.label}</span>
                  <span className="font-semibold truncate">{toBn(f.value)}</span>
                </div>
              ))}
              <div className="flex items-baseline border-b border-dotted border-stone-400 pb-0.5">
                <span className="text-[8px] print:text-[7.5px] font-bold uppercase tracking-wider text-stone-500 w-20 shrink-0">CLASS</span>
                <span className="font-semibold">{toBn(classInfo?.ClassName || '-')}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="border-b-2 border-stone-900 pb-0.5 mb-1.5">
              <h3 className="text-[12px] print:text-[10.5px] font-black uppercase tracking-wider">
                Division Breakdown
                <span className="font-normal italic text-[9px] ml-2">({toBn(divisionRows.length)} div · {toBn(totalSubjects)} sub)</span>
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] print:text-[10px]">
              {divisionRows.length === 0
                ? <div className="col-span-2 italic text-stone-500 text-[10px]">—</div>
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
        <div className="mb-3 print:mb-2 print:shrink-0">
          <div className="border-y-2 border-stone-900 py-0.5 mb-1.5 text-center">
            <h3 className="text-[14px] print:text-[12px] font-black uppercase tracking-[0.2em]">— Academic Record —</h3>
          </div>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border-2 border-stone-900">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse">
              <thead>
                <tr>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center w-10 border-r border-stone-700">#</th>
                  <th style={TH_STYLE_GAZETTE} className="px-3 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-left border-r border-stone-700">SUBJECT</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r border-stone-700">FULL</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r border-stone-700">PASS</th>
                  <th style={TH_STYLE_GAZETTE} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r border-stone-700">HIGH</th>
                  <th style={TH_STYLE_GAZETTE} className="px-3 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center">OBTAINED</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = { backgroundColor: isAlt ? '#ede7d5' : '#f5f0e3', ...EXACT };
                  return (
                    <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px] italic`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-3 ${rowPad} py-1 print:py-0.5 text-left text-[11.5px] print:text-[10.5px] font-semibold`}>{toBn(item.subject)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-r border-stone-300 px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-stone-300 px-3 ${rowPad} py-1 print:py-0.5 text-[12px] print:text-[11px] font-black`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary as "stock ticker" */}
        <div className="border-y-2 border-stone-900 py-2 print:py-1 mb-3 print:mb-2 print:shrink-0">
          <div className="flex flex-wrap items-center justify-around gap-x-3 gap-y-1 text-[11px] print:text-[10px]">
            <div className="flex items-baseline gap-2">
              <span className="text-[8.5px] uppercase tracking-wider text-stone-500 font-bold">DIVISION:</span>
              <span className="text-[15px] print:text-[13px] font-black italic">{toBn(divisionName)}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[8.5px] uppercase tracking-wider text-stone-500 font-bold">POSITION:</span>
              <span className="text-[15px] print:text-[13px] font-black italic">{toBn(student?.Positions ?? '-')}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[8.5px] uppercase tracking-wider text-stone-500 font-bold">AVERAGE:</span>
              <span className="text-[15px] print:text-[13px] font-black italic">{toBn(averageMark)}</span>
            </div>
            <span className="text-stone-400">|</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[8.5px] uppercase tracking-wider text-stone-500 font-bold">TOTAL:</span>
              <span className="text-[15px] print:text-[13px] font-black italic">{toBn(student?.Total ?? '-')}</span>
            </div>
          </div>
        </div>

        {/* Comments as "letters to the editor" */}
        {(showClassTeacherSign || showGuardianSign) && (
        <div className="marksheet-comments grid grid-cols-2 print:grid-cols-2 gap-4 print:gap-3 print:flex-1">
          {showClassTeacherSign && (
          <div>
            <h4 className="text-[10px] print:text-[9px] font-black uppercase tracking-wider italic text-stone-700 border-b border-stone-400 pb-0.5">From the Class Teacher</h4>
            <div className="border-b border-dotted border-stone-500 min-h-[42px] print:min-h-[36px] mt-2 text-[11px] print:text-[10px] italic pt-1">{student?.Note ?? ''}</div>
          </div>
          )}
          {showGuardianSign && (
          <div>
            <h4 className="text-[10px] print:text-[9px] font-black uppercase tracking-wider italic text-stone-700 border-b border-stone-400 pb-0.5">From the Guardian</h4>
            <div className="border-b border-dotted border-stone-500 min-h-[42px] print:min-h-[36px] mt-2"></div>
          </div>
          )}
        </div>
        )}
      </div>

      {/* ── Footer: publication info */}
      <div className="border-t-[3px] border-double border-stone-900 px-5 py-2 print:px-4 print:py-1 print:mt-auto print:shrink-0">
        <div className="grid grid-cols-5 items-end gap-3 print:gap-2">
          <div className="col-span-1">
            <QRCode size={48} style={{ height: 'auto', width: '100%' }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox="0 0 256 256" />
            <p className="text-[8px] print:text-[7.5px] text-center italic mt-0.5">Verify</p>
          </div>
          <div className="col-span-2 text-center">
            <div className="h-9 print:h-6 flex items-end justify-center">
              {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="" className="max-h-9 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-stone-900 mt-1 pt-1">
              <div className="text-[11.5px] print:text-[10.5px] font-bold italic">{principalName || institution?.PrincipalName}</div>
              <div className="text-[8px] print:text-[7.5px] uppercase tracking-wider text-stone-600">Principal</div>
              {showDate && <div className="text-[9px] print:text-[8px] italic mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
            </div>
          </div>
          <div className="col-span-2 text-center">
            <div className="h-9 print:h-6 flex items-end justify-center">
              {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-9 max-w-full object-contain print:max-h-6" />}
            </div>
            <div className="border-t border-stone-900 mt-1 pt-1">
              <div className="text-[11.5px] print:text-[10.5px] font-bold italic">{najemName || institution?.NajemName}</div>
              <div className="text-[8px] print:text-[7.5px] uppercase tracking-wider text-stone-600">Vice Principal</div>
              {showDate && <div className="text-[9px] print:text-[8px] italic mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-400 px-5 print:px-4 py-1 print:py-0.5 text-[8.5px] print:text-[7.5px] uppercase tracking-[0.25em] text-stone-600 text-center">
        Printed by SAHARAIT · The Result Gazette · All Rights Reserved
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
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows, rowPad,
    studentName, fatherName, motherName, birthDate, rollNumber,
    registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  const infoItems = [
    studentInfoFields.name && { label: 'NAME', value: studentName },
    studentInfoFields.fatherName && { label: 'FATHER', value: fatherName },
    studentInfoFields.motherName && { label: 'MOTHER', value: motherName },
    studentInfoFields.dob && { label: 'DOB', value: birthDate },
    studentInfoFields.registration && { label: labels?.StudentIDLabel ?? 'REG', value: registration },
    studentInfoFields.admission && { label: labels?.AdmissionIDLabel ?? 'ADM', value: rollNumber },
  ].filter(Boolean);

  const summaryItems = [
    { label: 'DIVISION', value: divisionName, bg: 'bg-red-600', border: 'border-red-800' },
    { label: 'POSITION', value: student?.Positions ?? '-', bg: 'bg-blue-600', border: 'border-blue-800' },
    { label: 'AVERAGE', value: averageMark, bg: 'bg-yellow-400', border: 'border-yellow-600', text: 'text-black' },
    { label: 'TOTAL', value: student?.Total ?? '-', bg: 'bg-black', border: 'border-black' },
  ];

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white mb-10 print:mb-0 print:flex print:flex-col shadow-2xl`}>
      {/* Inner border wrapper (survives print) */}
      <div className="border-[6px] border-black">

        {/* ── TOP RED BLOCK */}
        <div className="marksheet-header bg-red-600 text-white px-5 py-3 print:px-4 print:py-1.5 flex items-center justify-between gap-3 border-b-[6px] border-black print:shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 print:h-11 print:w-11 shrink-0 rounded-full bg-white border-[3px] border-black overflow-hidden flex items-center justify-center">
              {imageSrc
                ? <img src={imageSrc} className="h-full w-full object-cover" alt="" />
                : <span className="text-[8px] font-black text-red-600">LOGO</span>}
            </div>
            <div>
              <h1 className="text-[22px] print:text-[17px] font-black uppercase leading-none tracking-tight">
                {toBn(institution?.InstitutionName || '-')}
              </h1>
              <p className="text-[9.5px] print:text-[8.5px] mt-1 opacity-90 uppercase tracking-wider">
                {toBn(institution?.Address || '-')}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] print:text-[7.5px] uppercase font-black tracking-widest opacity-80">Session</div>
            <div className="text-[14px] print:text-[12px] font-black leading-none">{toBn(session?.SessionName || '-')}</div>
          </div>
        </div>

        {/* ── YELLOW BANNER (Exam + Class) */}
        <div className="marksheet-rainbow bg-yellow-400 text-black px-5 py-1.5 print:py-1 flex items-center justify-between border-b-[6px] border-black print:shrink-0">
          <span className="text-[12px] print:text-[10.5px] font-black uppercase tracking-wider">★ {toBn(ExamName || '-')}</span>
          <span className="text-[12px] print:text-[10.5px] font-black uppercase tracking-wider">CLASS: {toBn(classInfo?.ClassName || '-')}</span>
        </div>

        {/* ── BODY: split with red sidebar */}
        <div className="marksheet-body flex print:flex-1 print:min-h-0">
          {/* Vertical red sidebar */}
          <div className="w-[38px] print:w-[30px] shrink-0 bg-red-600 flex items-center justify-center border-r-[6px] border-black">
            <div className="rotate-[-90deg] whitespace-nowrap text-white font-black uppercase tracking-[0.4em] text-[13px] print:text-[11px]">
              RESULT
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 print:flex print:flex-col">
            {/* ── Info in BLACK block */}
            <div className="bg-black text-white px-4 py-2.5 print:px-3 print:py-1.5 grid grid-cols-2 md:grid-cols-3 print:grid-cols-3 gap-x-4 gap-y-1.5 print:gap-y-1 border-b-[6px] border-black print:shrink-0">
              {infoItems.map((f, i) => (
                <div key={i}>
                  <div className="text-[7.5px] print:text-[7px] uppercase tracking-[0.2em] font-black text-yellow-400">{f.label}</div>
                  <div className="text-[11.5px] print:text-[10.5px] font-bold truncate">{toBn(f.value)}</div>
                </div>
              ))}
            </div>

            {/* ── Divisions in blue strip */}
            <div className="bg-blue-600 text-white px-4 py-1.5 print:px-3 print:py-1 border-b-[6px] border-black print:shrink-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[9px] print:text-[8px] font-black uppercase tracking-widest">DIVISIONS:</span>
                {divisionRows.length === 0
                  ? <span className="text-[10px] italic opacity-70">—</span>
                  : divisionRows.map((item, i) => (
                    <span key={i} className="text-[10.5px] print:text-[9.5px] font-bold">
                      {item.name} <span className="bg-white text-blue-700 px-1.5 rounded-sm font-black">{toBn(item.number)}</span>
                    </span>
                  ))
                }
              </div>
            </div>

            {/* ── Table (white bg, thick borders) */}
            <div className="px-3 py-2 print:px-2 print:py-1 print:shrink-0">
              <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible border-[4px] border-black">
                <table className="w-full min-w-[700px] print:min-w-0 border-collapse">
                  <thead>
                    <tr>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center w-10 border-r-[3px] border-black">#</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-3 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-left border-r-[3px] border-black">SUBJECT</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r-[3px] border-black">FULL</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r-[3px] border-black">PASS</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-2 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center border-r-[3px] border-black">HIGH</th>
                      <th style={TH_STYLE_BAUHAUS} className="px-3 py-1.5 print:py-1 text-[10px] print:text-[9px] font-black uppercase tracking-wider text-center">OBTAINED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((item, index) => {
                      const isAlt = index % 2 !== 0;
                      const cellStyle = { backgroundColor: isAlt ? '#fef3c7' : '#ffffff', ...EXACT };
                      return (
                        <tr key={item.id} className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px] font-black`}>{toBn(index + 1)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-3 ${rowPad} py-1 print:py-0.5 text-left text-[11.5px] print:text-[10.5px] font-bold`}>{toBn(item.subject)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.fullMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.passMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-r-[3px] border-black px-2 ${rowPad} py-1 print:py-0.5 text-[11px] print:text-[10px]`}>{toBn(item.highestMark)}</td>
                          <td style={cellStyle} className={`border-b-[3px] border-black px-3 ${rowPad} py-1 print:py-0.5 text-[13px] print:text-[11px] font-black`}>{toBn(item.obtainedMark)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Summary: big circles in yellow block */}
            <div className="bg-yellow-400 border-y-[6px] border-black px-4 py-2.5 print:px-3 print:py-1.5 print:shrink-0">
              <div className="grid grid-cols-4 gap-3 print:gap-2">
                {summaryItems.map((item, i) => (
                  <div key={i} className="text-center">
                    <div className={`mx-auto w-14 h-14 print:w-11 print:h-11 rounded-full ${item.bg} border-[3px] border-black flex items-center justify-center ${item.text || 'text-white'}`}>
                      <span className="text-[15px] print:text-[12px] font-black leading-none">{toBn(item.value)}</span>
                    </div>
                    <div className="text-[8px] print:text-[7px] font-black uppercase tracking-widest mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Comments in blue blocks */}
            {(showClassTeacherSign || showGuardianSign) && (
            <div className="marksheet-comments grid grid-cols-2 gap-3 print:gap-2 p-3 print:p-2 bg-white print:flex-1">
              {showClassTeacherSign && (
              <div>
                <div className="bg-blue-600 text-white px-2 py-0.5 text-[9px] print:text-[8px] font-black uppercase tracking-widest">TEACHER</div>
                <div className="border-[3px] border-black min-h-[42px] print:min-h-[36px] p-1.5 text-[11px] print:text-[10px]">{student?.Note ?? ''}</div>
              </div>
              )}
              {showGuardianSign && (
              <div>
                <div className="bg-red-600 text-white px-2 py-0.5 text-[9px] print:text-[8px] font-black uppercase tracking-widest">GUARDIAN</div>
                <div className="border-[3px] border-black min-h-[42px] print:min-h-[36px] p-1.5"></div>
              </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* ── Bottom black bar with signatures + QR */}
        <div className="bg-black text-white px-4 py-2.5 print:px-3 print:py-1.5 border-t-[6px] border-black print:mt-auto print:shrink-0">
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
                <div className="text-[11px] print:text-[10px] font-black uppercase">{principalName || institution?.PrincipalName}</div>
                <div className="text-[7.5px] print:text-[7px] text-yellow-400 uppercase tracking-widest">Principal</div>
                {showDate && <div className="text-[8px] print:text-[7.5px] text-white/60 mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
              </div>
            </div>
            <div className="col-span-2 text-center">
              <div className="h-8 print:h-6 flex items-end justify-center">
                {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="" className="max-h-8 max-w-full object-contain print:max-h-6" style={{ filter: 'invert(1)' }} />}
              </div>
              <div className="border-t-2 border-yellow-400 mt-1 pt-1">
                <div className="text-[11px] print:text-[10px] font-black uppercase">{najemName || institution?.NajemName}</div>
                <div className="text-[7.5px] print:text-[7px] text-yellow-400 uppercase tracking-widest">Vice Principal</div>
                {showDate && <div className="text-[8px] print:text-[7.5px] text-white/60 mt-0.5">{toBn(new Date().toLocaleDateString('bn-BD'))}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom white strip */}
        <div className="bg-white px-4 py-1 print:px-3 print:py-0.5 text-center text-[8px] print:text-[7px] font-black uppercase tracking-[0.3em]">
          BAUHAUS · SAHARAIT · <span className="text-red-600">RESULT</span> <span className="text-blue-600">SHEET</span> <span className="text-yellow-500">2026</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ⭐ NEW TEMPLATE 8: Classic Traditional (legacy black-border design)
// ==========================================
const SingleMarkSheetClassic = ({
  student, institution, imageSrc, signatureNajemSrc, signaturePrincipalSrc,
  session, classInfo, examSubjects, divisions = [], examConfig = {},
  isLast = false, ExamID, SubClassID, ExamName,
  showDate = true, showSignature = true, principalName = '', najemName = '',
  paperSize = 'A4', orientation = 'portrait', studentInfoFields = {},
  showClassTeacherSign = true, showGuardianSign = true,
}) => {
  const {
    subjects, totalSubjects, divisionRows,
    studentName, fatherName, motherName, birthDate,
    rollNumber, registration, divisionName, averageMark,
  } = computeMarkSheetData({ student, examSubjects, examConfig, divisions });

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};
  const previewWidth = getPreviewWidth(paperSize, orientation);

  // Header line of the division box: "মোট বিষয় ৬ টি- পূর্ণমান ১০০ * ৬ = ৬০০"
  const fullPerSubject = Number(subjects?.[0]?.fullMark) || 0;
  const totalFullMark = fullPerSubject * totalSubjects;

  const infoRows = [
    studentInfoFields.name && ['পরীক্ষার্থীর নাম', studentName],
    ['মারহালা/শ্রেণী', classInfo?.ClassName || '-'],
    studentInfoFields.registration && [labels?.StudentIDLabel ?? 'আইডি', registration],
    studentInfoFields.admission && [labels?.AdmissionIDLabel ?? 'ভর্তি নং', rollNumber],
    studentInfoFields.fatherName && ['পিতার নাম', fatherName],
    studentInfoFields.motherName && ['মাতার নাম', motherName],
    studentInfoFields.dob && ['জন্ম তারিখ', birthDate && birthDate !== '-' ? `${birthDate} ইং` : '-'],
  ].filter(Boolean);

  return (
    <div className={`marksheet-page ${isLast ? '' : 'not-last'} ${previewWidth} relative mx-auto w-full overflow-hidden bg-white text-black border-2 border-black mb-10 print:mb-0 print:flex print:flex-col`}>
      {/* ── Header: centered institution block, logo on the left */}
      <div className="marksheet-header relative text-center px-4 pt-3 pb-1 print:px-3 print:pt-2 print:pb-0.5 print:shrink-0">
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Logo"
            className="absolute left-4 top-[52px] print:left-3 print:top-[42px] h-[62px] w-[62px] print:h-[50px] print:w-[50px] object-contain"
          />
        )}
        <h1 className="text-[28px] print:text-[22px] font-bold leading-tight">{toBn(institution?.InstitutionName || '-')}</h1>
        <p className="text-[16px] print:text-[14px] font-semibold leading-snug">{toBn(institution?.Address || '-')}</p>
        <p className="text-[16px] print:text-[14px] font-semibold leading-snug">শিক্ষাবর্ষ : {toBn(session?.SessionName || '-')}</p>
        <p className="text-[16px] print:text-[14px] font-bold leading-snug">পরীক্ষা : {toBn(ExamName || '-')}</p>
      </div>

      <div className="marksheet-body px-4 pb-2 print:px-3 print:pb-1 print:flex-1 print:flex print:flex-col print:min-h-0">
        {/* ── Student info (left) + division breakdown box (right) */}
        <div className="mt-1 flex items-start justify-between gap-4 print:gap-3 print:shrink-0">
          <div className="text-[15px] print:text-[13px] leading-[1.8] print:leading-[1.6]">
            {infoRows.map(([label, value], i) => (
              <div key={i} className="flex">
                <span className="w-[118px] print:w-[102px] font-bold shrink-0">{label}</span>
                <span className="font-bold">: {toBn(value)}</span>
              </div>
            ))}
          </div>

          <div className="w-[300px] print:w-[255px] shrink-0 border-[1.5px] border-black">
            <div className="border-b-[1.5px] border-black px-2 py-0.5 text-center text-[14px] print:text-[12px] font-bold whitespace-nowrap">
              মোট বিষয় {toBn(totalSubjects)} টি- পূর্ণমান {toBn(fullPerSubject)} * {toBn(totalSubjects)} = {toBn(totalFullMark)}
            </div>
            {divisionRows.length === 0 ? (
              <div className="px-2 py-1 text-center text-[13px]">কোনো বিভাগ পাওয়া যায়নি</div>
            ) : (
              divisionRows.map((item, index) => (
                <div key={index} className="flex border-b border-black last:border-b-0 text-[14px] print:text-[12px] font-bold">
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
        <div className="mt-2 print:mt-1.5 print:shrink-0 overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[640px] print:min-w-0 border-collapse border-[1.5px] border-black bg-white text-black text-center">
            <thead>
              <tr className="text-[15px] print:text-[13px] font-bold">
                <th className="border border-black px-2 py-1 print:py-0.5 w-16">ক্রমিক</th>
                <th className="border border-black px-3 py-1 print:py-0.5 text-left">বিষয়</th>
                <th className="border border-black px-2 py-1 print:py-0.5">পূর্ণমান</th>
                <th className="border border-black px-2 py-1 print:py-0.5">পাশ নম্বর</th>
                <th className="border border-black px-2 py-1 print:py-0.5">সর্বোচ্চ নম্বর</th>
                <th className="border border-black px-2 py-1 print:py-0.5">প্রাপ্ত নম্বর</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item, index) => (
                <tr key={item.id} className="text-[15px] print:text-[13px] font-bold">
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
        <div className="mt-3 print:mt-2 border-[1.5px] border-black flex flex-wrap text-[15px] print:text-[13px] font-bold print:shrink-0">
          <div className="flex-1 border-r border-black px-2 py-1 print:py-0.5 whitespace-nowrap">প্রাপ্ত বিভাগ : {toBn(divisionName)}</div>
          <div className="border-r border-black px-3 py-1 print:py-0.5 whitespace-nowrap">মেধা স্থান : {toBn(student?.Positions ?? '-')}</div>
          <div className="border-r border-black px-3 py-1 print:py-0.5 whitespace-nowrap">গড় : {toBn(averageMark)}</div>
          <div className="px-3 py-1 print:py-0.5 whitespace-nowrap">মোট নম্বর : {toBn(student?.Total ?? '-')}</div>
        </div>

        {/* ── Comment boxes */}
        {(showClassTeacherSign || showGuardianSign) && (
          <div className="marksheet-comments mt-3 print:mt-2 flex gap-3 print:gap-2 print:flex-1 print:min-h-0">
            {showClassTeacherSign && (
              <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
                <p className="text-[14px] print:text-[12.5px] font-bold">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
                <div className="text-[14px] print:text-[12.5px] mt-1">{student?.Note ?? ''}</div>
              </div>
            )}
            {showGuardianSign && (
              <div className="flex-1 border-[1.5px] border-black p-2 min-h-[95px] print:min-h-[70px]">
                <p className="text-[14px] print:text-[12.5px] font-bold">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Signatures: left and right, date underneath */}
      <div className="flex items-end justify-between px-10 print:px-8 pt-8 pb-3 print:pt-3 print:pb-2 print:mt-auto print:shrink-0">
        <div className="flex flex-col items-center">
          <div className="h-12 print:h-9 flex items-end justify-center">
            {showSignature && signaturePrincipalSrc && <img src={signaturePrincipalSrc} alt="Signature Principal" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />}
          </div>
          {showDate && <p className="text-[13px] print:text-[11.5px] font-bold mt-1 print:mt-0.5">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
        </div>
        <div className="flex flex-col items-center">
          <div className="h-12 print:h-9 flex items-end justify-center">
            {showSignature && signatureNajemSrc && <img src={signatureNajemSrc} alt="Signature Najem" className="max-h-12 max-w-[150px] object-contain print:max-h-9" />}
          </div>
          {showDate && <p className="text-[13px] print:text-[11.5px] font-bold mt-1 print:mt-0.5">তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}</p>}
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
}) => {
  const institution = data?.institution;
  const ExamName = data?.exam?.[0]?.ExamName;

  // Paper-size/orientation scale — preview and print both
  const paperZoom = getPaperZoom(paperSize, orientation);

  const imageSrc = bufferToDataUrl(institution?.Logo);
  const signatureNajemSrc = bufferToDataUrl(institution?.SignatureNajem);
  const signaturePrincipalSrc = bufferToDataUrl(institution?.SignaturePrincipal);

  const session = data?.session || {};
  const classInfo = data?.class || {};
  const classGroupInfo = data?.classGroup || {};
  const examSubjects = Array.isArray(data?.examSubjects) ? data.examSubjects : [];

  const examConfig = Array.isArray(data?.conditionAverage)
    ? data.conditionAverage[0] || {}
    : data?.conditionAverage || {};

  const divisions = Array.isArray(data?.divisions) ? data.divisions : [];
  const students = Array.isArray(data?.students) ? data.students : [];

  if (students.length === 0) {
    return (
      <div className="font-SolaimanLipi flex items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border border-slate-200 text-lg">
        কোনো শিক্ষার্থীর ডেটা পাওয়া যায়নি
      </div>
    );
  }

  const visibleStudents = students;

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
      ExamName,
      ExamID: data?.examid,
      SubClassID: classGroupInfo?.SubClassID,
    };

    if (templateId === 'template-2') return <SingleMarkSheetModern {...commonProps} />;
    if (templateId === 'template-3') return <SingleMarkSheetElegant {...commonProps} />;
    if (templateId === 'template-4') return <SingleMarkSheetMinimal {...commonProps} />;
    if (templateId === 'template-5') return <SingleMarkSheetSidebar {...commonProps} />;
    if (templateId === 'template-8') return <SingleMarkSheetClassic {...commonProps} />;
    return <SingleMarkSheet {...commonProps} />; // default = template-1
  };

  return (
    <>
      <style>{getPrintCss(paperSize, orientation, templateId)}</style>
      <div
        id="marksheet-print-area"
        className={`font-SolaimanLipi w-full bg-slate-100 py-6 min-h-screen flex flex-col items-center print:bg-white print:py-0 print:min-h-0 print:block ${
          colorMode === 'bw' ? 'marksheet-mode-bw' : ''
        }`}
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
