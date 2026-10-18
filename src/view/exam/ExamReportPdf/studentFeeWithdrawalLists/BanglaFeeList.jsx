import { useMemo } from 'react';
import { Buffer } from 'buffer';
import {
  resolveColumns,
  columnPercents,
  formatCell,
  columnTotal,
  toBn,
  langCode,
  listKey,
  listName,
  defaultFeeListSettings,
} from '../../../../Data/feeListColumns';

// =============================================================================
// পরীক্ষার ফি তালিকা
//
// পুরোনো BanglaOneColumn / BanglaTwoColumn এর বদলে এই একটা পেজই দুইটা
// তালিকা সামলায় (ফি বিহীন ও ফি গৃহীত)। কোন ঘর যাবে আর কী নামে যাবে —
// সবটাই সেটিংস থেকে আসে, এখানে কিছু হার্ডকোড করা নেই।
//
// ⭐ প্রতি পাতায় শিরোনাম ও স্বাক্ষর
//
//    আগে শিরোনামটা টেবিলের উপরে আর স্বাক্ষরটা নিচে আলাদা div এ ছিল, তাই
//    শিরোনাম শুধু প্রথম পাতায় আর স্বাক্ষর শুধু শেষ পাতায় পড়ত।
//
//    ব্রাউজার ছাপার সময় শুধু thead আর tfoot কেই প্রতি পাতায় নিজে থেকে
//    বসায়। তাই এখন পুরো কাগজটাই একটা টেবিল:
//
//      thead → প্রতিষ্ঠানের শিরোনাম, সারসংক্ষেপ, ঘরের নামের সারি
//      tbody → শিক্ষার্থীদের সারি আর নিচের "সর্বমোট"
//      tfoot → স্বাক্ষরের তিনটা জায়গা
//
//    শিরোনাম ও স্বাক্ষরের ঘরগুলোয় কোনো বর্ডার নেই (.fee-plain), তাই
//    দেখতে আগের মতোই — শুধু প্রতি পাতায় থাকে।
//
//    "সর্বমোট" সারিটা ইচ্ছে করেই tbody তে — ওটা একবারই আসার কথা, প্রতি
//    পাতায় নয়।
//
// ⭐ ডান-বাঁয়ে ২px ফাঁকা — টেবিলের বর্ডার যেন কাগজের কিনারায় লেগে না থাকে।
//
// ⭐ বর্ডার আলাদা (separate), প্রতিটা ঘরের ভেতরে — collapse এ বাইরের
//    বর্ডারটা বাক্সের অর্ধেক বাইরে বসত বলে ডান পাশের ঘর কেটে যেত।
// =============================================================================

/**
 * ছবির উৎস — প্রবেশপত্রের কার্ডে (AdmitCardGenerate) যেভাবে, হুবহু সেভাবেই।
 *
 * লোগো SQL Server এ varbinary, তাই ছবির পথ নয় — বাইটের তালিকা আসে:
 * { type: 'Buffer', data: [137, 80, 78, 71, …] }। ওটাকেই base64 ডাটা URL
 * বানিয়ে <img src> এ বসানো হয়। পথ (string) এলে যেমন আছে তেমনই যায়।
 */
const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

const BanglaFeeList = ({
  reportData,
  queryParams,
  settings,

  // ⭐ কাগজের মাথার লোগো — প্রতিষ্ঠানের লোগো, এখানে এটাই বসবে
  instituteLogo,

  // জলছাপের লোগো — এখানে ব্যবহার হয় না, পাতার পেছনে আলাদা করে বসে
  // (ExamReportList এর .watermark-print)। আগে ভুল করে এই লোগোটাই
  // মাথায় বসানো হত, সেজন্যই কাগজের উপরে জলছাপের ছবিটা দেখা যেত।
  documentLogo,
  logoIsActive,

  listType = 1,
  language = 1,
}) => {
  const cfg = settings || defaultFeeListSettings(language);
  const isArabic = langCode(language) === 'ar';

  const columns = useMemo(() => resolveColumns(cfg, language), [cfg, language]);
  const percents = useMemo(() => columnPercents(columns), [columns]);
  const span = Math.max(columns.length, 1);

  // রুট থেকে { data, summary } আসে; পুরোনো কোডের সাথে মিল রাখতে
  // সরাসরি অ্যারে এলেও চলে
  const rows = useMemo(() => {
    if (Array.isArray(reportData)) return reportData;
    return reportData?.data ?? [];
  }, [reportData]);

  const summary = reportData?.summary;
  const first = rows[0] || {};

  /* প্রতিষ্ঠানের লোগো
   *
   * ⭐ নামটা InstitutionLogo — রুটের loadReportHeader() এ
   *    `InstitutionLogo: inst.Logo` বসানো আছে, আর ...header প্রতিটা সারিতে
   *    ছড়িয়ে দেয়। আগে এখানে শুধু Logo / InstituteLogo খোঁজা হত, তাই নাম
   *    না মেলায় লোগোটা কখনো বসত না — অথচ নাম-ঠিকানা ঠিকই আসত, কারণ
   *    ওগুলোর নাম মিলত।
   *
   * সারিতে না পেলে প্রপ থেকে — প্রবেশপত্রের কার্ডেও এই ক্রমেই। */
  const logo = toImageSrc(
    first.InstitutionLogo ||
    first.Logo ||
    first.logo ||
    first.InstituteLogo ||
    instituteLogo
  );

  // লোগো কোথায় বসবে — মাথার মাঝখানে, নাকি বাঁ পাশে (প্রবেশপত্রের মতো)
  // const logoOnSide = cfg.logoPosition === 'left';
  const logoOnSide = true;
  const showLogo = cfg.showLogo !== false && Boolean(logo);

  const kind = listKey(listType);
  const title = listName(listType);

  const accent =
    kind === 'paid'
      ? { bar: 'from-emerald-600 to-teal-500', head: 'bg-emerald-100' }
      : kind === 'all'
        ? { bar: 'from-violet-600 to-fuchsia-500', head: 'bg-violet-100' }
        : { bar: 'from-indigo-600 to-blue-500', head: 'bg-indigo-100' };

  // শিরোনামে ভাষা অনুযায়ী নাম
  const institution = isArabic
    ? first.AraInstitutionName || first.InstitutionName
    : first.InstitutionName;
  const address = isArabic ? first.AraAddress || first.Address : first.Address;
  const sessionName = isArabic ? first.SessionAraName || first.SessionName : first.SessionName;
  const examLabel = isArabic ? first.ExamAraName || first.ExamName : first.ExamName;
  const classLabel = isArabic ? first.SubClassAra || first.SubClass : first.SubClass;

  if (!rows.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
        <p className="text-slate-500 font-medium">এই শর্তে কোনো শিক্ষার্থী পাওয়া যায়নি</p>
        <p className="text-slate-400 text-sm mt-1">শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ---- টেবিলের গড়ন ----------------------------------------------- */
        .fee-list-table {
          width: 100%;
          max-width: 100%;
          table-layout: fixed;
          border-collapse: separate;
          border-spacing: 0;
        }
        .fee-list-table th,
        .fee-list-table td {
          border-right: 1px solid #94a3b8;
          border-bottom: 1px solid #94a3b8;
          overflow-wrap: anywhere;
          word-break: break-word;
          vertical-align: top;
        }
        .fee-list-table th:first-child,
        .fee-list-table td:first-child {
          border-left: 1px solid #94a3b8;
        }
        /* ঘরের নামের সারিটায় উপরের বর্ডার — প্রতি পাতাতেই বসবে */
        .fee-list-table tr.fee-col-head th {
          border-top: 1px solid #94a3b8;
          vertical-align: middle;
        }
        /* শিরোনাম, সারসংক্ষেপ ও স্বাক্ষরের ঘরে কোনো বর্ডার নেই */
        .fee-list-table .fee-plain {
          border: 0 !important;
          padding: 0 !important;
        }

        @media print {
          @page { size: A4 portrait; margin: 10mm; }

          /* পর্দার কার্ডের ছায়া ও বর্ডার কাগজে দরকার নেই */
          .fee-list-print {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* ⭐ ডান-বাঁয়ে ২px — বর্ডার কাগজের কিনারায় লেগে থাকে না */
          .fee-list-print .fee-list-body {
            padding: 0 2px !important;
          }

          .fee-list-wrap {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .fee-list-table th,
          .fee-list-table td {
            border-color: #000 !important;
            white-space: normal !important;
          }
          .fee-list-table tr.fee-col-head th {
            -webkit-print-color-adjust: exact; print-color-adjust: exact;
          }

          /* ⭐ শিরোনাম প্রতি পাতার উপরে, স্বাক্ষর প্রতি পাতার নিচে */
          .fee-list-table thead { display: table-header-group; }
          .fee-list-table tfoot { display: table-footer-group; }

          .fee-list-table tr { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      <div className="fee-list-print mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden print:mt-0">

        {/* ── রঙিন ব্যানার (পর্দায় মাত্র) ───────────────── */}
        <div className={`bg-gradient-to-r ${accent.bar} px-5 py-4 flex items-center gap-4 print:hidden`}>
          <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-bold text-base leading-tight">{title}</h2>
            <p className="text-white/80 text-xs mt-0.5">
              {classLabel ? `${classLabel} — ` : ''}
              {examLabel || ''}{sessionName ? ` (${sessionName})` : ''}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-white/70" />
              মোট: {toBn(rows.length)}
            </span>
            {summary && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                বকেয়া: {toBn(summary.due)}
              </span>
            )}
          </div>
        </div>

        {/* ── কাগজ — পুরোটাই একটা টেবিল ─────────────────── */}
        <div className="fee-list-body px-5 py-4">
          <div className="fee-list-wrap">
            <table
              className="fee-list-table"
              style={{ fontSize: `${cfg.fontSize || 13}px` }}
            >
              <colgroup>
                {columns.map((col, i) => (
                  <col key={col.key} style={{ width: `${percents[i]}%` }} />
                ))}
              </colgroup>

              {/* ───── প্রতি পাতার উপরের অংশ ───── */}
              <thead>
                {cfg.showHeader && (
                  <tr>
                    <th colSpan={span} className="fee-plain">
                      <div className="pb-3">

                        {/* লোগো ও নামের সারি।

                            বাঁ পাশে বসালে ডান দিকেও সমান একটা ফাঁকা ঘর
                            রাখা হয় — নইলে নামটা লোগোর চাপে ডানে সরে
                            যেত, মাঝখানে পড়ত না। প্রবেশপত্রের কার্ডেও
                            দুই পাশে সমান জায়গা ছাড়া হয় এই কারণেই। */}
                        <div className={logoOnSide ? 'flex items-center gap-4' : 'text-center'}>
                          {showLogo && (
                            <img
                              src={logo}
                              alt=""
                              className={
                                logoOnSide
                                  ? 'h-16 w-16 shrink-0 object-contain'
                                  : 'h-16 mx-auto mb-2 object-contain'
                              }
                            />
                          )}

                          <div className={logoOnSide ? 'flex-1 min-w-0 text-center' : ''}>
                            <h1 className="text-xl font-bold text-slate-900">
                              {institution || queryParams?.InstitutionName || ''}
                            </h1>
                            {(address || queryParams?.Address) && (
                              <p className="text-sm font-normal text-slate-600 mt-0.5">
                                {address || queryParams?.Address}
                              </p>
                            )}
                            {first.ContactNumber && (
                              <p className="text-xs font-normal text-slate-500 mt-0.5">
                                মোবাইল: {toBn(first.ContactNumber)}
                              </p>
                            )}
                          </div>

                          {logoOnSide && showLogo && (
                            <span className="h-16 w-16 shrink-0" aria-hidden="true" />
                          )}
                        </div>

                        <div className="text-center">
                        <div className="inline-block mt-3 px-5 py-1 rounded-full border border-slate-800 text-slate-900 font-bold text-[15px]">
                          {title}
                        </div>

                        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-2 text-[13px] font-normal text-slate-700">
                          {sessionName && <span>শিক্ষাবর্ষ: <b>{sessionName}</b></span>}
                          {examLabel && <span>পরীক্ষা: <b>{examLabel}</b></span>}
                          {classLabel && <span>শ্রেণি: <b>{classLabel}</b></span>}
                          <span>মোট শিক্ষার্থী: <b>{toBn(rows.length)}</b></span>
                        </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                )}

                {cfg.showSummary && summary && (
                  <tr>
                    <th colSpan={span} className="fee-plain">
                      <div className="grid grid-cols-4 gap-2 pb-3">
                        {[
                          { label: 'মোট শিক্ষার্থী', value: summary.totalStudent, tone: 'border-slate-200 bg-slate-50 text-slate-700' },
                          { label: 'ফি দিয়েছে',     value: summary.paidCount,    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
                          { label: 'ফি দেয়নি',      value: summary.unpaidCount,  tone: 'border-rose-200 bg-rose-50 text-rose-700' },
                          { label: 'মোট জমা',       value: summary.collected,    tone: 'border-sky-200 bg-sky-50 text-sky-700' },
                        ].map((s) => (
                          <div key={s.label} className={`rounded-lg border px-3 py-2 text-center ${s.tone}`}>
                            <div className="text-lg font-bold leading-tight">{toBn(s.value)}</div>
                            <div className="text-[11px] font-normal opacity-80">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </th>
                  </tr>
                )}

                {/* ঘরের নামের সারি */}
                <tr className={`fee-col-head ${accent.head}`}>
                  {columns.map((col) => (
                    <th key={col.key} className="px-2 py-2 font-bold text-slate-900 text-center">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* ───── প্রতি পাতার নিচের অংশ ───── */}
              <tfoot>
                <tr>
                  <td colSpan={span} className="fee-plain">
                    <div className="flex justify-between text-[13px] text-slate-700 pt-10 pb-4">
                      <div className="text-center">
                        <div className="border-t border-slate-800 pt-1 px-8">হিসাব রক্ষক</div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-slate-800 pt-1 px-8">পরীক্ষা নিয়ন্ত্রক</div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-slate-800 pt-1 px-8">
                          {first.PrincipalName || 'মুহতামিম'}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>

              {/* ───── শিক্ষার্থীদের সারি ───── */}
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.ID ?? row.UserID ?? i}
                    className={`${i % 2 ? 'bg-slate-50/60' : 'bg-white'} ${
                      row.IsInactive ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-2 ${col.blank ? 'py-4' : 'py-1.5'}`}
                        // নাম, পিতার নাম ইত্যাদি বাঁ দিকে — কলামের তালিকাতেই
                        // ঠিক করা আছে, এখানে শুধু বসানো হয়
                        style={{ textAlign: col.align || 'left' }}
                      >
                        {formatCell(col, row, i)}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* নিচের মোট সারি — একবারই, তাই tbody তে */}
                {cfg.showTotalRow && columns.some((c) => c.type === 'money') && (
                  <tr className="font-bold bg-amber-50">
                    {columns.map((col, idx) => {
                      const total = columnTotal(col, rows);

                      // প্রথম ঘরে "সর্বমোট" লেখাটা, টাকার ঘরে যোগফল, বাকি ফাঁকা
                      if (idx === 0) {
                        return (
                          <td key={col.key} className="px-2 py-2 text-center text-slate-900">
                            সর্বমোট
                          </td>
                        );
                      }

                      return (
                        <td
                          key={col.key}
                          className="px-2 py-2 text-slate-900"
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {total === null ? '' : toBn(total)}
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BanglaFeeList;