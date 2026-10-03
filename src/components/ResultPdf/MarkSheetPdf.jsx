import React from 'react';
import { Buffer } from 'buffer';
import QRCode from "react-qr-code";

// ==========================================
// Print CSS (A4 Portrait, 1 student = 1 page)
// ==========================================
const PRINT_CSS = `
@page {
  size: A4 portrait;
  margin: 6mm;
}

@media print {
  html, body {
    height: auto !important;
    overflow: visible !important;
    background: #fff !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* shob kichu hide, shudhu marksheet area dekhabe */
  body * {
    visibility: hidden !important;
  }
  #marksheet-print-area,
  #marksheet-print-area * {
    visibility: visible !important;
  }
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
    width: 198mm !important;
    height: 280mm !important;
    max-width: none !important;
    margin: 0 auto !important;
    overflow: hidden !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .marksheet-page.not-last {
    break-after: page !important;
    page-break-after: always !important;
  }

  /* Body-r shob section chhoto hobe na, shudhu comment box baki jaiga nibe */
  .marksheet-body > * {
    flex-shrink: 0 !important;
  }
  .marksheet-body > .marksheet-comments {
    flex: 1 1 auto !important;
    flex-shrink: 1 !important;
    min-height: 50px !important;
  }

  /* Marks table: border gray, clip hobe na */
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

  /* ✅ Table header color (th-te direct, tr-e na) */
  .marksheet-page .marks-table-wrap thead th {
    background-color: #0f766e !important;
    background-image: none !important;
    color: #ffffff !important;
    border-color: #0f766e !important;
  }

  /* ✅ Zebra row color (td-te direct) */
  .marksheet-page .marks-table-wrap tbody tr.row-alt td {
    background-color: #f0fdfa !important;
  }
  .marksheet-page .marks-table-wrap tbody tr.row-plain td {
    background-color: #ffffff !important;
  }
}
`;

// ==========================================
// Helpers
// ==========================================

// English digit -> Bangla digit
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBn = (value) => {
  if (value === undefined || value === null) return value;
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
};

const pick = (...vals) => {
  const found = vals.find((v) => v !== undefined && v !== null && v !== '' && v !== 'null');
  return found === undefined ? '-' : found;
};

// Buffer -> base64 data URL
const bufferToDataUrl = (buf) => {
  if (buf && buf.type === 'Buffer' && Array.isArray(buf.data) && buf.data.length > 0) {
    return `data:image/png;base64,${Buffer.from(buf.data).toString('base64')}`;
  }
  return null;
};

// Print-safe cell colors (inline, jate print-e drop na hoy)
const EXACT = { WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };
const TH_STYLE = { backgroundColor: '#0f766e', color: '#ffffff', ...EXACT };

// ==========================================
// Small components
// ==========================================
const SectionTitle = ({ icon, children }) => (
  <div className="flex items-center gap-2 text-[13px] print:text-[11px] font-bold text-emerald-800 mt-6 mb-3 print:mt-2 print:mb-1.5">
    <span className="text-emerald-600">{icon}</span>
    <span>{children}</span>
    <div className="flex-1 h-[2px] bg-gradient-to-r from-emerald-200 to-transparent" />
  </div>
);

const InfoRow = ({ label, value, labelW = 'w-[100px]' }) => (
  <div className="flex border-b border-slate-200 py-2 print:py-1 text-[12px] print:text-[10.5px]">
    <span className={`${labelW} print:w-[85px] shrink-0 text-slate-500 font-medium`}>{label}</span>
    <span className="font-semibold text-slate-800">{toBn(value)}</span>
  </div>
);

// ==========================================
// Single Student Mark Sheet  (1 page)
// ==========================================
const SingleMarkSheet = ({
  student,
  institution,
  imageSrc,
  signatureNajemSrc,
  signaturePrincipalSrc,
  session,
  classInfo,
  examSubjects,
  divisions = [],
  examConfig = {},
  isLast = false,
  ExamID,
  SubClassID,
}) => {
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

  // ===== Density (subject beshi hole compact) =====
  const ultraDense = totalSubjects > 20;
  const veryDense = totalSubjects > 15;
  const dense = totalSubjects > 10;

  const rowPad = ultraDense
    ? 'print:py-[1px]'
    : veryDense
      ? 'print:py-0.5'
      : dense
        ? 'print:py-1'
        : 'print:py-1.5';

  // const rowText = ultraDense
  //   ? 'print:text-[9px]'
  //   : veryDense
  //     ? 'print:text-[10px]'
  //     : 'print:text-[11px]';

  const rowText = ultraDense
    ? 'print:text-[10px]'
    : veryDense
      ? 'print:text-[11px]'
      : dense
        ? 'print:text-[12px]'
        : 'print:text-[13px]';

  // ===== Division rows =====
  const divisionRows = [];
  for (let i = 1; i <= 14; i++) {
    const dId = examConfig?.[`DivisionID${i}`];
    const dNum = examConfig?.[`DivisionNumber${i}`];

    if (dId === null || dId === undefined) continue;
    if (Number(dNum) === 0) continue;

    const found = divisions.find((d) => d.ID === dId);
    if (!found) continue;

    divisionRows.push({
      name: found.DivisionNames,
      number: dNum ?? 0,
    });
  }

  const studentName = pick(student?.UserName, student?.StudentName, student?.Name);
  const fatherName = pick(student?.FatherName, student?.FathersName, student?.Father);
  const birthDate = pick(student?.DateOfBirth, student?.DOB, student?.BirthDate);
  const rollNumber = pick(student?.AdmissionSerial);
  const registration = pick(student?.UserCode);

  const divisionName = pick(student?.DivisionNames);
  const averageMark =
    totalSubjects > 0 && student?.Total !== undefined && student?.Total !== null
      ? (Number(student.Total) / totalSubjects).toFixed(2)
      : '-';

  return (
    <div
      className={`marksheet-page ${isLast ? '' : 'not-last'
        } relative mx-auto w-full max-w-[900px] overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 font-['Noto_Sans_Bengali',sans-serif] text-slate-800 mb-10 print:mb-0 print:flex print:flex-col`}
    >
      {/* Header */}
      <div className="relative flex flex-col md:flex-row print:flex-row items-center justify-between bg-gradient-to-r from-teal-800 to-emerald-600 px-8 py-6 print:px-5 print:py-3 text-white print:shrink-0">
        <div className="flex items-center gap-4 print:gap-3 mb-4 md:mb-0 print:mb-0">
          <div className="h-[70px] w-[70px] print:h-[56px] print:w-[56px] overflow-hidden rounded-full border-[3px] border-emerald-300 bg-white shadow-md shrink-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={institution?.InstitutionName || 'Institution Logo'}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <span className="text-[10px] font-medium text-slate-400">No Logo</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl print:text-[18px] font-bold leading-tight text-white drop-shadow-sm">
              {toBn(institution?.InstitutionName || '-')}
            </h1>
            <p className="text-[11px] md:text-xs print:text-[10px] text-emerald-100 mt-1 print:mt-0.5">
              {toBn(institution?.Address || '-')}
            </p>
          </div>
        </div>
        <div className="text-center md:text-right print:text-right">
          <span className="inline-block rounded-full border border-emerald-300/50 bg-emerald-700/50 px-4 py-1.5 print:px-3 print:py-1 text-xs print:text-[10px] font-semibold text-white shadow-sm">
            {toBn(session?.SessionName || '-')}
          </span>
        </div>
      </div>

      <div className="h-1 shrink-0 bg-gradient-to-r from-[#e5484d] via-[#facc15] via-[#22c55e] via-[#0ea5e9] to-[#a855f7]" />

      {/* Title bar */}
      <div className="flex flex-col sm:flex-row print:flex-row items-center justify-between bg-emerald-50 border-b border-emerald-100 px-8 py-3.5 print:px-5 print:py-2 print:shrink-0">
        <h2 className="text-sm md:text-[15px] print:text-[12px] font-bold text-emerald-800 flex items-center gap-2">
          <span>📋</span> পরীক্ষার্থীর বিস্তারিত ফলাফল
        </h2>
        <span className="mt-2 sm:mt-0 print:mt-0 rounded-full bg-emerald-600 px-4 py-1 print:px-3 print:py-0.5 text-xs print:text-[10px] font-semibold text-white shadow-sm">
          {toBn(classInfo?.ClassName || '-')}
        </span>
      </div>

      {/* Body */}
      <div className="marksheet-body px-6 md:px-8 pb-8 print:px-5 print:pb-2 print:flex-1 print:flex print:flex-col print:min-h-0">
        {/* Top grid: Student info + Division */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 mt-2 print:mt-0 print:shrink-0">
          {/* Left: Student Info */}
          <div>
            <SectionTitle icon="👤">পরীক্ষার্থীর তথ্য</SectionTitle>
            <div className="bg-slate-50/50 rounded-lg p-3 print:p-2 border border-slate-100">
              <InfoRow label="নাম" value={studentName} />
              <InfoRow label="পিতার নাম" value={fatherName} />
              <InfoRow label="জন্ম তারিখ" value={birthDate} />
              <InfoRow label="আইডি ভর্তি নং" value={rollNumber} />
              <InfoRow label="রেজিস্ট্রেশন" value={registration} />
            </div>
          </div>

          {/* Right: Division Breakdown */}
          <div>
            <SectionTitle icon="📝">নম্বর বিভাজন</SectionTitle>
            <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 print:px-2 print:py-1.5 text-center">
                <p className="text-[13px] print:text-[10.5px] font-bold text-slate-700">
                  মোট বিভাগ - {toBn(divisionRows.length)} টি | মোট বিষয় {toBn(totalSubjects)} টি
                </p>
              </div>

              <div className="p-3 print:p-1.5">
                {divisionRows.length === 0 ? (
                  <div className="text-center text-slate-400 text-[12px] print:text-[10px] py-3 print:py-1">
                    কোনো বিভাগ পাওয়া যায়নি
                  </div>
                ) : (
                  divisionRows.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1.5 print:py-0.5 px-2 text-[13px] print:text-[10.5px] font-medium text-slate-600 border-b border-dashed border-slate-100 last:border-0"
                    >
                      <div className="w-[120px] truncate">{item.name}</div>
                      <div className="flex items-center gap-2 print:gap-1 text-slate-700">
                        <span>{toBn(totalSubjects)}</span>
                        <span className="text-slate-400">×</span>
                        <span>{toBn(item.number)}</span>
                        <span className="text-slate-400">=</span>
                        <span className="font-bold text-emerald-700 w-10 print:w-8 text-right">
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

        {/* Marks Table */}
        <div className="mt-8 print:mt-1 print:shrink-0">
          <SectionTitle icon="📊">বিষয়ভিত্তিক ফলাফল</SectionTitle>
          <div className="marks-table-wrap w-full overflow-x-auto print:overflow-visible rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full min-w-[700px] print:min-w-0 border-collapse bg-white text-slate-700">
              <thead>
                <tr className="text-center">
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold">ক্রমিক</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-4 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold text-left">বিষয়</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold">পূর্ণমান</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold">পাশমার্ক</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold whitespace-nowrap">সর্বোচ্চ প্রাপ্ত</th>
                  <th style={TH_STYLE} className="border-b border-teal-700 px-3 py-3 print:px-2 print:py-1.5 text-[13px] print:text-[10.5px] font-bold">প্রাপ্ত নম্বর</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item, index) => {
                  const isAlt = index % 2 !== 0;
                  const cellStyle = {
                    backgroundColor: isAlt ? '#f0fdfa' : '#ffffff',
                    ...EXACT,
                  };
                  return (
                    <tr
                      key={item.id}
                      className={`${isAlt ? 'row-alt' : 'row-plain'} text-center`}
                    >
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[13px] ${rowText}`}>{toBn(index + 1)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-4 py-2.5 print:px-2 ${rowPad} text-left text-[13px] ${rowText} font-medium text-slate-800`}>{item.subject}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[13px] ${rowText}`}>{toBn(item.fullMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[13px] ${rowText}`}>{toBn(item.passMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[13px] ${rowText}`}>{toBn(item.highestMark)}</td>
                      <td style={cellStyle} className={`border-b border-slate-100 px-3 py-2.5 print:px-2 ${rowPad} text-[13px] ${rowText} font-bold text-emerald-700`}>{toBn(item.obtainedMark)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 print:mt-1 print:shrink-0">
          <SectionTitle icon="🏆">সারসংক্ষেপ</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2 mt-3 print:mt-1">
            <div className="flex flex-col items-center justify-center gap-1.5 print:gap-0.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 print:p-2 shadow-sm">
              <p className="text-[12px] print:text-[10px] font-semibold text-emerald-600">প্রাপ্ত বিভাগ</p>
              <p className="text-xl print:text-[14px] font-bold text-emerald-800">{toBn(divisionName)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 print:gap-0.5 rounded-xl border border-blue-200 bg-blue-50 p-4 print:p-2 shadow-sm">
              <p className="text-[12px] print:text-[10px] font-semibold text-blue-600">মেধা স্থান</p>
              <p className="text-xl print:text-[14px] font-bold text-blue-800">{toBn(student?.Positions ?? '-')}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 print:gap-0.5 rounded-xl border border-purple-200 bg-purple-50 p-4 print:p-2 shadow-sm">
              <p className="text-[12px] print:text-[10px] font-semibold text-purple-600">গড়</p>
              <p className="text-xl print:text-[14px] font-bold text-purple-800">{toBn(averageMark)}</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 print:gap-0.5 rounded-xl border border-amber-200 bg-amber-50 p-4 print:p-2 shadow-sm">
              <p className="text-[12px] print:text-[10px] font-semibold text-amber-600">মোট নম্বর</p>
              <p className="text-xl print:text-[14px] font-bold text-amber-800">{toBn(student?.Total ?? '-')}</p>
            </div>
          </div>
        </div>

        {/* Comments & Signature (baki jaiga automatic nibe) */}
        <div className="marksheet-comments mt-8 pt-6 print:mt-2 print:pt-2 border-t border-slate-200 print:flex print:flex-col">
          <div className="flex flex-col md:flex-row print:flex-row gap-6 print:gap-3 print:flex-1 print:min-h-0">
            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[50px] flex flex-col justify-between">
              <p className="text-slate-700 font-semibold text-sm print:text-[11px]">
                শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :
              </p>
              <div className="border-b border-dashed border-slate-300 w-1/2 mt-8 print:mt-3"></div>
            </div>

            <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 print:p-3 min-h-[120px] print:min-h-[50px] flex flex-col justify-between">
              <p className="text-slate-700 font-semibold text-sm print:text-[11px]">
                অভিভাবকের মন্তব্য ও স্বাক্ষর :
              </p>
              <div className="border-b border-dashed border-slate-300 w-1/2 mt-8 print:mt-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-5 items-start gap-6 bg-slate-50 border-t border-slate-200 px-8 py-6 print:gap-4 print:px-5 print:py-2 print:mt-auto print:shrink-0">

        {/* QR Code - Small */}
        <div className="col-span-1 flex w-full flex-col items-center mt-2">
          <div className="mt-3 print:mt-1">
            {/* <img
              src="https://pngimg.com/uploads/qr_code/qr_code_PNG29.png"
              alt="QR Code"
              className="h-16 w-16 object-contain print:h-10 print:w-10"
            /> */}
            <QRCode
              size={75}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`https://qmmsoft.com/${institution?.InstitutionCode}/students/${session?.SessionID}/${ExamID}/${SubClassID}/${student?.UserCode}`}
              viewBox={`0 0 256 256`}
            />
          </div>

          <div className="mt-3 text-center print:mt-1">
            <p className="text-sm text-slate-800 print:text-[9px]">
              যাচাই করুন
            </p>
          </div>
        </div>


        {/* মুহতামিম - Large */}
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-10">
            {signatureNajemSrc ? (
              <img
                src={signatureNajemSrc}
                alt="Signature Najem"
                className="max-h-16 max-w-full object-contain print:max-h-10"
              />
            ) : null}
          </div>

          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-1"></div>

          <div className="mt-3 space-y-1 text-center print:mt-1 print:space-y-0">
            <p className="text-base font-bold text-slate-800 print:text-[11px]">
              মুহতামিম
            </p>

            <p className="text-xs text-slate-500 print:text-[9px]">
              তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}
            </p>
          </div>
        </div>


        {/* নায়েবে তালিমাত - Large */}
        <div className="col-span-2 flex w-full flex-col items-center">
          <div className="h-16 w-full flex items-end justify-center print:h-10">
            {signaturePrincipalSrc ? (
              <img
                src={signaturePrincipalSrc}
                alt="Signature Principal"
                className="max-h-16 max-w-full object-contain print:max-h-10"
              />
            ) : null}
          </div>

          <div className="mt-2 w-full border-t-2 border-dashed border-slate-400 print:mt-1"></div>

          <div className="mt-3 space-y-1 text-center print:mt-1 print:space-y-0">
            <p className="text-base font-bold text-slate-800 print:text-[11px]">
              নায়েবে তালিমাত
            </p>

            <p className="text-xs text-slate-500 print:text-[9px]">
              তারিখ : {toBn(new Date().toLocaleDateString('bn-BD'))}
            </p>
          </div>
        </div>

      </div>

      {/* Bottom line */}
      <div className="mx-8 print:mx-5 flex flex-col md:flex-row print:flex-row justify-between items-center border-t border-slate-200 py-3 print:py-1.5 text-[10px] print:text-[8px] text-slate-400 gap-2 print:shrink-0">
        {/* <span>বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ — ২০১৪ সালের কেন্দ্রীয় পরীক্ষার ফলাফল</span> */}
        <span className="text-[11px] font-medium text-slate-500">
          Software Developed by{' '}
          <span className="font-bold tracking-wide text-emerald-600">
            SAHARAIT
          </span>
        </span>
      </div>
    </div>
  );
};

// ==========================================
// Main Component
// ==========================================
const MarkSheetPdf = ({ data }) => {

  console.log(data, "data")
  const institution = data?.institution;

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
      <div className="flex items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
        কোনো শিক্ষার্থীর ডেটা পাওয়া যায়নি
      </div>
    );
  }

  // Test-er jonno 3 jon. Production-e: const visibleStudents = students;
  const visibleStudents = students;
  // const visibleStudents = students.slice(0, 3);

  return (
    <>
      <style>{PRINT_CSS}</style>
      <div
        id="marksheet-print-area"
        className="w-full bg-slate-100 py-6 min-h-screen print:bg-white print:py-0 print:min-h-0"
      >
        {visibleStudents.map((student, idx) => (
          <SingleMarkSheet
            key={student?.ID ?? student?.UserID ?? idx}
            student={student}
            institution={institution}
            imageSrc={imageSrc}
            signatureNajemSrc={signatureNajemSrc}
            signaturePrincipalSrc={signaturePrincipalSrc}
            session={session}
            classInfo={classInfo}
            SubClassID={classGroupInfo?.SubClassID}
            ExamID={data?.examid}
            examSubjects={examSubjects}
            divisions={divisions}
            examConfig={examConfig}
            isLast={idx === visibleStudents.length - 1}
          />
        ))}
      </div>
    </>
  );
};

export default MarkSheetPdf;
// import React from 'react';
// import { Buffer } from 'buffer';

// // ==========================================
// // Component 1: MarkSheetPdf (বেফাকুল মাদানিসিল)
// // ==========================================

// const SectionTitle = ({ icon, children }) => (
//   <div className="flex items-center gap-2 text-[13px] font-bold text-emerald-800 mt-6 mb-3">
//     <span className="text-emerald-600">{icon}</span>
//     <span>{children}</span>
//     <div className="flex-1 h-[2px] bg-gradient-to-r from-emerald-200 to-transparent" />
//   </div>
// );

// const InfoRow = ({ label, value, labelW = 'w-[100px]' }) => (
//   <div className="flex border-b border-slate-200 py-2 text-[12px]">
//     <span className={`${labelW} shrink-0 text-slate-500 font-medium`}>{label}</span>
//     <span className="font-semibold text-slate-800">{value}</span>
//   </div>
// );

// const pick = (...vals) => {
//   const found = vals.find(
//     (v) => v !== undefined && v !== null && v !== '' && v !== 'null'
//   );
//   return found === undefined ? '-' : found;
// };

// // ✅ Buffer → base64 data URL helper
// const bufferToDataUrl = (buf) => {
//   if (
//     buf &&
//     buf.type === 'Buffer' &&
//     Array.isArray(buf.data) &&
//     buf.data.length > 0
//   ) {
//     return `data:image/png;base64,${Buffer.from(buf.data).toString('base64')}`;
//   }
//   return null;
// };

// // ==========================================
// // Single Student Mark Sheet
// // ==========================================
// const SingleMarkSheet = ({
//   student,
//   institution,
//   imageSrc,
//   signatureNajemSrc,
//   signaturePrincipalSrc,
//   session,
//   classInfo,
//   examSubjects,
//   conditionAverage,
//   divisions = [],
//   examConfig = {},
// }) => {
//   const studentSubjects = Array.isArray(student?.subjects) ? student.subjects : [];

//   const getObtainedMark = (subjectId) => {
//     const found = studentSubjects.find(
//       (m) =>
//         m?.SubjectID === subjectId ||
//         m?.SubjectId === subjectId ||
//         m?.subjectId === subjectId
//     );
//     if (found) return pick(found?.Marks, found?.ObtainedMark, found?.Mark, 0);
//     return '-';
//   };

//   const getHighestMark = (subjectId, fallback) => {
//     const found = studentSubjects.find(
//       (m) =>
//         m?.SubjectID === subjectId ||
//         m?.SubjectId === subjectId ||
//         m?.subjectId === subjectId
//     );
//     if (found) return pick(found?.HighestMark, fallback);
//     return pick(fallback);
//   };

//   const subjects = examSubjects.map((s, i) => ({
//     id: s?.ID ?? i + 1,
//     subject: pick(s?.SubjectName, s?.ArabicSubject, s?.EngSubjectName),
//     fullMark: pick(s?.MaxNumber),
//     passMark: pick(s?.PassNumber),
//     highestMark: getHighestMark(s?.SubjectID, s?.HighestMark),
//     obtainedMark: getObtainedMark(s?.SubjectID),
//   }));

//   const totalSubjects = examSubjects.length;
//   const perSubjectFull = examSubjects[0]?.MaxNumber ?? 100;
//   const grandTotal = totalSubjects * (Number(perSubjectFull) || 0);

//   // ===== Division rows =====
//   const divisionRows = [];
//   for (let i = 1; i <= 14; i++) {
//     const dId = examConfig?.[`DivisionID${i}`];
//     const dNum = examConfig?.[`DivisionNumber${i}`];

//     // DivisionID null/undefined হলে skip
//     if (dId === null || dId === undefined) continue;

//     // ✅ DivisionNumber 0 হলে skip (divisionName থাকলেও)
//     if (Number(dNum) === 0) continue;

//     const found = divisions.find((d) => d.ID === dId);
//     if (!found) continue;

//     divisionRows.push({
//       name: found.DivisionNames,
//       number: dNum ?? 0,
//     });
//   }

//   const studentName = pick(student?.UserName, student?.StudentName, student?.Name);
//   const fatherName = pick(student?.FatherName, student?.FathersName, student?.Father);
//   const birthDate = pick(student?.DateOfBirth, student?.DOB, student?.BirthDate);
//   const rollNumber = pick(student?.AdmissionSerial);
//   const registration = pick(
//     student?.UserCode
//   );

//   const divisionName = pick(student?.DivisionNames);
//   const graceMark = pick(student?.GraceMark, student?.Grace, '—');
//   const averageMark = (student.Total / totalSubjects).toFixed(2);

//   return (
//     <div className="relative mx-auto w-full max-w-[900px] overflow-hidden bg-white shadow-xl rounded-xl border border-slate-200 font-['Noto_Sans_Bengali',sans-serif] text-slate-800 mb-10">

//       {/* Header */}
//       <div className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-teal-800 to-emerald-600 px-8 py-6 text-white">
//         <div className="flex items-center gap-4 mb-4 md:mb-0">
//           <div className="h-[70px] w-[70px] overflow-hidden rounded-full border-[3px] border-emerald-300 bg-white shadow-md shrink-0">
//             {imageSrc ? (
//               <img
//                 src={imageSrc}
//                 alt={institution?.InstitutionName || 'Institution Logo'}
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center bg-slate-100">
//                 <span className="text-[10px] font-medium text-slate-400">No Logo</span>
//               </div>
//             )}
//           </div>
//           <div>
//             <h1 className="text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-sm">
//               {institution?.InstitutionName || '-'}
//             </h1>
//             <p className="text-[11px] md:text-xs text-emerald-100 mt-1">
//               {institution?.Address || '-'}
//             </p>
//           </div>
//         </div>
//         <div className="text-center md:text-right">
//           <span className="inline-block rounded-full border border-emerald-300/50 bg-emerald-700/50 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
//             {session?.SessionName || '-'}
//           </span>
//         </div>
//       </div>

//       <div className="h-1 bg-gradient-to-r from-[#e5484d] via-[#facc15] via-[#22c55e] via-[#0ea5e9] to-[#a855f7]" />

//       {/* Title bar */}
//       <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border-b border-emerald-100 px-8 py-3.5">
//         <h2 className="text-sm md:text-[15px] font-bold text-emerald-800 flex items-center gap-2">
//           <span>📋</span> পরীক্ষার্থীর বিস্তারিত ফলাফল
//         </h2>
//         <span className="mt-2 sm:mt-0 rounded-full bg-emerald-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
//           {classInfo?.ClassName || '-'}
//         </span>
//       </div>

//       <div className="px-6 md:px-8 pb-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
//           {/* Left: Student Info */}
//           <div>
//             <SectionTitle icon="👤">পরীক্ষার্থীর তথ্য</SectionTitle>
//             <div className="bg-slate-50/50 rounded-lg p-3 border border-slate-100">
//               <InfoRow label="নাম" value={studentName} />
//               <InfoRow label="পিতার নাম" value={fatherName} />
//               <InfoRow label="জন্ম তারিখ" value={birthDate} />
//               <InfoRow label="আইডি ভর্তি নং" value={rollNumber} />
//               <InfoRow label="রেজিস্ট্রেশন" value={registration} />
//             </div>
//           </div>

//           {/* Right: Division Breakdown Box */}
//           <div>
//             <SectionTitle icon="📝">নম্বর বিভাজন</SectionTitle>
//             <div className="w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
//               <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 text-center">
//                 <p className="text-[13px] font-bold text-slate-700">
//                   মোট বিভাগ - {divisionRows.length} টি | মোট বিষয় {totalSubjects} টি
//                 </p>
//               </div>

//               <div className="p-3">
//                 {divisionRows.length === 0 ? (
//                   <div className="text-center text-slate-400 text-[12px] py-3">
//                     কোনো বিভাগ পাওয়া যায়নি
//                   </div>
//                 ) : (
//                   divisionRows.map((item, index) => (
//                     <div
//                       key={index}
//                       className="flex justify-between items-center py-1.5 px-2 text-[13px] font-medium text-slate-600 border-b border-dashed border-slate-100 last:border-0"
//                     >
//                       <div className="w-[120px] truncate">{item.name}</div>
//                       <div className="flex items-center gap-2 text-slate-700">
//                         <span>{totalSubjects}</span>
//                         <span className="text-slate-400">×</span>
//                         <span>{item.number}</span>
//                         <span className="text-slate-400">=</span>
//                         <span className="font-bold text-emerald-700 w-10 text-right">
//                           {totalSubjects * (Number(item.number) || 0)}
//                         </span>
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Marks Table */}
//         <div className="mt-8">
//           <SectionTitle icon="📊">বিষয়ভিত্তিক ফলাফল</SectionTitle>
//           <div className="w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
//             <table className="w-full min-w-[700px] border-collapse bg-white text-slate-700">
//               <thead>
//                 <tr className="bg-slate-100 text-center text-slate-700">
//                   <th className="border-b border-slate-200 px-3 py-3 text-[13px] font-bold">ক্রমিক</th>
//                   <th className="border-b border-slate-200 px-4 py-3 text-[13px] font-bold text-left">বিষয়</th>
//                   <th className="border-b border-slate-200 px-3 py-3 text-[13px] font-bold">পূর্ণমান</th>
//                   <th className="border-b border-slate-200 px-3 py-3 text-[13px] font-bold">পাশম্বর</th>
//                   <th className="border-b border-slate-200 px-3 py-3 text-[13px] font-bold whitespace-nowrap">সর্বোচ্চ প্রাপ্ত</th>
//                   <th className="border-b border-slate-200 px-3 py-3 text-[13px] font-bold">প্রাপ্ত নম্বর</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {subjects.map((item, index) => (
//                   <tr key={item.id} className="text-center hover:bg-slate-50 transition-colors">
//                     <td className="border-b border-slate-100 px-3 py-2.5 text-[13px]">{index + 1}</td>
//                     <td className="border-b border-slate-100 px-4 py-2.5 text-left text-[13px] font-medium text-slate-800">{item.subject}</td>
//                     <td className="border-b border-slate-100 px-3 py-2.5 text-[13px]">{item.fullMark}</td>
//                     <td className="border-b border-slate-100 px-3 py-2.5 text-[13px]">{item.passMark}</td>
//                     <td className="border-b border-slate-100 px-3 py-2.5 text-[13px]">{item.highestMark}</td>
//                     <td className="border-b border-slate-100 px-3 py-2.5 text-[13px] font-bold text-emerald-700">{item.obtainedMark}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="mt-6">
//           <SectionTitle icon="🏆">সারসংক্ষেপ</SectionTitle>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
//             <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
//               <p className="text-[12px] font-semibold text-emerald-600">প্রাপ্ত বিভাগ</p>
//               <p className="text-xl font-bold text-emerald-800">{divisionName}</p>
//             </div>
//             <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
//               <p className="text-[12px] font-semibold text-blue-600">মেধা স্থান</p>
//               <p className="text-xl font-bold text-blue-800">{student?.Positions}</p>
//             </div>
//             <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm">
//               <p className="text-[12px] font-semibold text-purple-600">গড়</p>
//               <p className="text-xl font-bold text-purple-800">{averageMark}</p>
//             </div>
//             <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
//               <p className="text-[12px] font-semibold text-amber-600">মোট নম্বর</p>
//               <p className="text-xl font-bold text-amber-800">{student?.Total}</p>
//             </div>
//           </div>
//         </div>

//         {/* Comments & Signature */}
//         <div className="mt-8 pt-6 border-t border-slate-200">
//           <div className="flex flex-col md:flex-row gap-6">
//             <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 min-h-[120px] flex flex-col justify-between">
//               <p className="text-slate-700 font-semibold text-sm">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
//               <div className="border-b border-dashed border-slate-300 w-1/2 mt-8"></div>
//             </div>
//             <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-5 min-h-[120px] flex flex-col justify-between">
//               <p className="text-slate-700 font-semibold text-sm">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
//               <div className="border-b border-dashed border-slate-300 w-1/2 mt-8"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Footer Signatures with images */}
//       <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 border-t border-slate-200 px-8 py-6 gap-8">
//         {/* মুহতামিম → SignatureNajem */}
//         <div className="flex flex-col items-center flex-1 w-full max-w-[200px]">
//           <div className="h-16 w-full flex items-end justify-center">
//             {signatureNajemSrc ? (
//               <img
//                 src={signatureNajemSrc}
//                 alt="Signature Najem"
//                 className="max-h-16 max-w-full object-contain"
//               />
//             ) : null}
//           </div>
//           <div className="border-t-2 border-dashed border-slate-400 w-full mt-2"></div>
//           <div className="text-center mt-3 space-y-1">
//             <p className="font-bold text-slate-800 text-base">মুহতামিম</p>
//             <p className="text-xs text-slate-500">তারিখ : ০২/১০/২০২৪</p>
//           </div>
//         </div>

//         {/* নায়েবে তালিমাত → SignaturePrincipal */}
//         <div className="flex flex-col items-center flex-1 w-full max-w-[200px]">
//           <div className="h-16 w-full flex items-end justify-center">
//             {signaturePrincipalSrc ? (
//               <img
//                 src={signaturePrincipalSrc}
//                 alt="Signature Principal"
//                 className="max-h-16 max-w-full object-contain"
//               />
//             ) : null}
//           </div>
//           <div className="border-t-2 border-dashed border-slate-400 w-full mt-2"></div>
//           <div className="text-center mt-3 space-y-1">
//             <p className="font-bold text-slate-800 text-base">নায়েবে তালিমাত</p>
//             <p className="text-xs text-slate-500">তারিখ : ০২/১০/২০২৪</p>
//           </div>
//         </div>
//       </div>

//       <div className="mx-8 flex flex-col md:flex-row justify-between items-center border-t border-slate-200 py-3 text-[10px] text-slate-400 gap-2">
//         <span>বেফাকুল মাদারিসিল আরাবিয়া বাংলাদেশ — ২০১৪ সালের কেন্দ্রীয় পরীক্ষার ফলাফল</span>
//         <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Powered by QICF Result UI</span>
//       </div>
//     </div>
//   );
// };

// // ==========================================
// // Main Component
// // ==========================================
// const MarkSheetPdf = ({ data }) => {
//   const imageBuffer = data?.institution?.Logo;
//   const institution = data?.institution;

//   // ✅ সব buffer → data URL
//   const imageSrc = bufferToDataUrl(imageBuffer);
//   const signatureNajemSrc = bufferToDataUrl(institution?.SignatureNajem);
//   const signaturePrincipalSrc = bufferToDataUrl(institution?.SignaturePrincipal);

//   const session = data?.session || {};
//   const classInfo = data?.class || {};
//   const examSubjects = Array.isArray(data?.examSubjects) ? data.examSubjects : [];

//   const examConfig = Array.isArray(data?.conditionAverage)
//     ? data.conditionAverage[0] || {}
//     : data?.conditionAverage || {};

//   const divisions = Array.isArray(data?.divisions) ? data.divisions : [];

//   const students = Array.isArray(data?.students) ? data.students : [];

//   if (students.length === 0) {
//     return (
//       <div className="flex items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
//         কোনো শিক্ষার্থীর ডেটা পাওয়া যায়নি
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-slate-100 py-6 min-h-screen">
//       {/* {students.map((student) => ( */}
//       {students.slice(0, 2).map((student) => (
//         <SingleMarkSheet
//           key={student?.ID ?? student?.UserID ?? Math.random()}
//           student={student}
//           institution={institution}
//           imageSrc={imageSrc}
//           signatureNajemSrc={signatureNajemSrc}
//           signaturePrincipalSrc={signaturePrincipalSrc}
//           session={session}
//           classInfo={classInfo}
//           examSubjects={examSubjects}
//           conditionAverage={examConfig}
//           divisions={divisions}
//           examConfig={examConfig}
//         />
//       ))}
//     </div>
//   );
// };

// export default MarkSheetPdf;
