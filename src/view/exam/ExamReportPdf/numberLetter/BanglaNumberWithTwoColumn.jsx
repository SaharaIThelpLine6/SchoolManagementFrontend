import { useEffect, useMemo, useRef, useState } from 'react';

import bnBijoy2Unicode from '../../../../utils/conveter';
import { useGetInstitutionInfoQuery } from '../../../../features/settings/settingsQuerySlice';
import { useGetSessionsQuery } from '../../../../features/session/sessionSlice';
import { useGetSubClasssQuery } from '../../../../features/class/classQuerySlice';
import { useGetExamListQuery } from '../../../../features/result/resultSilce';

// =============================================================================
// নম্বর পত্র — শিক্ষার্থীর নামসহ দুই কলাম
//
// ⭐ শ্রেণি/জামাত ও কিতাবের ঘর দুইটা আর ফাঁকা যায় না
//
//    আগে ঘর দুইটা হাতে লেখার জন্য খালি ছাপা হত। এখন ফিল্টারে বাছাই করা
//    শ্রেণি আর কিতাবের নামটাই বসে — subClassName / kitabName প্রপে আসে।
//    কিতাব না বাছলে ঘরটা আগের মতোই খালি থাকে, হাতে লেখার জন্য।
//
// ⭐ মাথার তথ্য এখন রুট থেকে (header প্রপ)
//
//    useGetExamListQuery টা queryParams?.session_id খুঁজত, কিন্তু ফর্ম
//    SessionID নামে পাঠায় — তাই ওটা কখনোই মিলত না, পরীক্ষার নামের ঘর
//    ফাঁকা যেত। এখন রুটের header টাই আসল উৎস, হুকগুলো শুধু পেছনের ভরসা।
//
// ⭐ reportData সব সময় অ্যারে — ExamReportList খুলে নিয়ে পাঠায়
// =============================================================================

const PAGE_HEIGHT = 790;
const HEADER_ROW_HEIGHT = 30;

const ACCENT = '#7c3aed';        // বেগুনি — ফিল্টারের কিতাবের বারের সাথে মিলিয়ে
const ACCENT_SOFT = '#f5f3ff';
const RULE = '#1f2937';

const BanglaNumberWithTwoColumn = ({
  reportData,
  queryParams,
  header,
  subClassName = '',
  kitabName = '',
}) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassList } = useGetSubClasssQuery();
  const { data: examListData } = useGetExamListQuery({
    session_id: queryParams?.SessionID ?? queryParams?.session_id,
    exam_id: queryParams?.ExamID ?? queryParams?.exam_id,
    subClass_id: queryParams?.SubClassID ?? queryParams?.subClass_id,
  });

  const rows = useMemo(() => (Array.isArray(reportData) ? reportData : reportData?.data ?? []), [reportData]);

  const measureRef = useRef(null);
  const [pages, setPages] = useState([]);

  // ---- মাথার তথ্য: রুট আগে, তারপর হুক, তারপর ফিল্টারের তালিকা
  const institutionName = header?.InstitutionName || institutionInfo?.InstitutionName || '';
  const institutionAddress = header?.Address || institutionInfo?.Address || '';
  const contactNumber = header?.ContactNumber || institutionInfo?.ContactNumber || '';

  const examName =
    header?.ExamName ||
    examListData?.[0]?.Exam?.ExamName ||
    '';

  const sessionName =
    header?.SessionName ||
    sessionData?.find((i) => String(i.SessionID) === String(queryParams?.SessionID))?.SessionName ||
    '';

  const className =
    subClassName ||
    header?.SubClass ||
    subClassList?.find((i) => String(i.SubClassID) === String(queryParams?.SubClassID))?.SubClass ||
    '';

  useEffect(() => {
    if (!rows.length || !measureRef.current) {
      setPages([]);
      return;
    }

    const trs = Array.from(measureRef.current.querySelectorAll('tr[data-idx]'));
    const colHeight = PAGE_HEIGHT - HEADER_ROW_HEIGHT;

    const newPages = [];
    let pageRows = [];
    let colUsed = 0;
    let colCount = 0;

    trs.forEach((tr, i) => {
      const rh = tr.getBoundingClientRect().height;

      if (colUsed + rh > colHeight) {
        colCount += 1;
        if (colCount >= 2) {
          newPages.push(pageRows);
          pageRows = [];
          colCount = 0;
        }
        colUsed = 0;
      }

      pageRows.push(rows[i]);
      colUsed += rh;
    });

    if (pageRows.length) newPages.push(pageRows);
    setPages(newPages);
  }, [rows]);

  /** ঘরের নামের সারি — দুই পাশে একই */
  const ColHeader = () => (
    <div
      className="number-col-head"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 76px 1fr 48px',
        background: ACCENT_SOFT,
        borderTop: `1px solid ${RULE}`,
        borderBottom: `2px solid ${ACCENT}`,
        fontWeight: 700,
        fontSize: '15px',
        color: '#312e81',
      }}
    >
      <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}`, borderLeft: `1px solid ${RULE}` }}>ক্র:</span>
      <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}` }}>আইডি নং</span>
      <span style={{ padding: '5px 6px', borderRight: `1px solid ${RULE}` }}>পরীক্ষার্থীর নাম</span>
      <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}` }}>নম্বর</span>
    </div>
  );

  /** কাগজের মাথা — প্রতিটা পাতায় */
  const PageHeader = () => (
    <div className="text-center mb-3 pb-3" style={{ borderBottom: `2px solid ${ACCENT}` }}>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{institutionName}</h1>
      {institutionAddress && (
        <p className="text-black text-[15px] leading-snug">{institutionAddress}</p>
      )}
      {contactNumber && (
        <p className="text-[12px] text-gray-500 mt-0.5">
          মোবাইল: {contactNumber}
        </p>
      )}

      {examName && (
        <div className="mt-2">
          <span
            className="inline-block rounded-full px-5 py-1 text-[15px] font-bold text-white"
            style={{
              background: ACCENT,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {examName}
            {sessionName ? ` — ${sessionName}` : ''}
          </span>
        </div>
      )}

      {/* ⭐ শ্রেণি/জামাত ও কিতাব — ফিল্টারে যা বাছা হয়েছে */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div
          className="w-full py-1 text-start px-2 rounded"
          style={{ border: `1px solid ${RULE}`, background: ACCENT_SOFT, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <span className="font-bold text-[14px]">শ্রেণি/জামাত</span>
          <span className="text-[14px]">: {className}</span>
        </div>
        <div
          className="w-full py-1 text-start px-2 rounded"
          style={{ border: `1px solid ${RULE}`, background: ACCENT_SOFT, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <span className="font-bold text-[14px]">কিতাব</span>
          <span className="text-[14px]">: {kitabName}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10px; }
          body { margin: 0; }
          .number-sheet-print {
            border: none !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
            border-radius: 0 !important;
            page-break-after: always;
          }
          .number-sheet-print:last-child { page-break-after: auto; }
          #measure-container { display: none !important; }
          .number-col-head {
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }
        }
        .flow-row { break-inside: avoid; }
      `}</style>

      {/* ── রঙিন ব্যানার (পর্দায় মাত্র) ───────────────── */}
      {rows.length > 0 && (
        <div className="print:hidden mt-4 max-w-4xl mx-auto rounded-t-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">
              নম্বর পত্র — শিক্ষার্থীর নামসহ
            </h2>
            <p className="text-white/80 text-xs mt-0.5">
              {className ? `${className} — ` : ''}{examName}
              {kitabName ? ` · ${kitabName}` : ''}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              মোট: {bnBijoy2Unicode(String(rows.length))}
            </span>
            {!kitabName && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1.5 text-xs font-semibold text-amber-950">
                কিতাব বাছা হয়নি
              </span>
            )}
          </div>
        </div>
      )}

      {/* মাপার জন্য লুকানো টেবিল — কয় সারিতে এক কলাম ভরে সেটা বের করে */}
      <div
        id="measure-container"
        ref={measureRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }} className="border border-black">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} data-idx={i}>
                <td>{bnBijoy2Unicode(String(i + 1))}</td>
                <td>{bnBijoy2Unicode(String(row?.User?.UserCode ?? ''))}</td>
                <td>{row?.User?.UserName}</td>
                <td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
          <p className="text-slate-500 font-medium">এই শর্তে কোনো পরীক্ষার্থী পাওয়া যায়নি</p>
          <p className="text-slate-400 text-sm mt-1">শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন</p>
        </div>
      ) : (
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            className="number-sheet-print bg-white text-gray-800 font-[kalpurush] p-5 max-w-4xl mx-auto border border-gray-200 shadow-sm rounded-b-xl mb-6"
          >
            <PageHeader />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <ColHeader />
              <ColHeader />
            </div>

            <div
              style={{
                columns: 2,
                columnGap: '14px',
                columnFill: 'auto',
                height: `${PAGE_HEIGHT}px`,
                overflow: 'hidden',
              }}
            >
              {pageData.map((row, i) => (
                <div
                  key={i}
                  className="flow-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 76px 1fr 48px',
                    borderBottom: `1px solid ${RULE}`,
                    fontSize: '13px',
                    color: '#1f2937',
                  }}
                >
                  <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}`, borderLeft: `1px solid ${RULE}` }}>
                    {bnBijoy2Unicode(String(i + 1))}
                  </span>
                  <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}` }}>
                    {bnBijoy2Unicode(String(row?.User?.UserCode ?? ''))}
                  </span>
                  <span style={{ padding: '5px 6px', borderRight: `1px solid ${RULE}` }}>
                    {row?.User?.UserName}
                  </span>
                  <span style={{ padding: '5px 6px', textAlign: 'center', borderRight: `1px solid ${RULE}`, fontSize: '16px' }} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default BanglaNumberWithTwoColumn;
