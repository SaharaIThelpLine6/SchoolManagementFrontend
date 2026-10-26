import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';

import DefaultSelect from '../components/Forms/DefaultSelect';

import { setPageName } from '../features/auth/authSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/student/studentQuerySlice';
// নতুন hook — examQuerySlice এ যোগ করতে হবে (রুট: /api/exam/exam_routine_report)
import { useGetExamRoutineReportQuery } from '../features/exam/examQuerySlice';

import {
  DEFAULT_RR_LANG,
  RR_LANGS,
  buildTimeNote,
  getCellText,
  getClassText,
  getDateText,
  getDayText,
  getExamText,
  getInstituteAddress,
  getInstituteName,
  getRRDir,
  getRRText,
  getRoomText,
  getSessionText,
  getShiftText,
  getSubClassText,
  toLangDigit,
} from '../Data/Examroutinereportconfig';

const API_URL = import.meta.env.VITE_SERVER_URL;

/**
 * লোগো/ওয়াটারমার্কের ঠিকানা।
 * ফাইলটা থাকে  public/uploads/<recordName>/  এ, কিন্তু টেবিলে জমা হয় শুধু
 * /uploads/<recordName>/<file> অংশটুকু — '/public' অংশটা বাদ থাকে।
 * প্রবেশপত্রের পাতাটাও ঠিক এভাবেই ঠিকানা বানায়।
 */
const buildAssetUrl = (value) => {
  const raw = value == null ? '' : String(value).trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = String(API_URL || '').replace(/\/+$/, '');
  return `${base}/public/${raw.replace(/^\/+/, '')}`;
};

// ---------------------------------------------------------------------------
// ছাপার নিয়ম।
//
// রুটিন চওড়ায় লম্বা — সাত-আট দিনের পরীক্ষায় দুই বেলা মানেই ষোলটা কলাম।
// তাই কাগজটা আড়াআড়ি (landscape), আর টেবিলটা কাগজের প্রস্থ অনুযায়ী বসে।
//
// পর্দার সাজসজ্জার অংশগুলোয় hidden_in_print ক্লাসটা আছে (অ্যাপের চলতি
// নিয়মেই), তাই ছাপার সময় শুধু কাগজটাই যায়।
// ---------------------------------------------------------------------------
const PRINT_CSS = `
  @media print {
    @page { size: A4 landscape; margin: 8mm; }

    .routine-paper {
      border: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
    }
    .routine-scroll { overflow: visible !important; }
    .routine-table { page-break-inside: auto; }
    .routine-table tr { page-break-inside: avoid; page-break-after: auto; }
    .routine-table thead { display: table-header-group; }
  }

  .routine-table { border-collapse: collapse; width: 100%; }
  .routine-table th,
  .routine-table td {
    border: 1px solid #334155;
    padding: 3px 4px;
    text-align: center;
    vertical-align: middle;
    line-height: 1.25;
  }
  .routine-table thead th { background: #f8fafc; font-weight: 700; }
  .routine-table td.routine-rowhead {
    font-weight: 700;
    white-space: nowrap;
    background: #f8fafc;
  }
`;

/** প্রিন্টারের আইকন — inline SVG, তাই আলাদা আইকন প্যাকেজ লাগে না */
const PrintIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);

/** ছোট স্পিনার */
const Spinner = ({ size = 24, stroke = 3, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={stroke} opacity="0.2" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
  </svg>
);

/** চেকবক্সের পিল — সাজসজ্জার টগলগুলো সব একই চেহারার */
const TogglePill = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
    <input
      type="checkbox"
      className="h-[15px] w-[15px] accent-blue-600"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="text-[13px] font-medium text-gray-700">{label}</span>
  </label>
);

const ExamRoutineReport = ({ pageTitle = 'Exam Routine' }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { watch, register, setValue } = methods;

  const [lang, setLang] = useState(DEFAULT_RR_LANG);

  // সাজসজ্জা — ডিফল্টে কাগজের মতোই
  const [hideEmptyRows, setHideEmptyRows] = useState(false);
  // খালি বেলার ঘরও ডিফল্টে থাকে, কারণ ছাপা কাগজে ঘরটা '-' নিয়েই বসে
  const [hideEmptyShift, setHideEmptyShift] = useState(false);
  const [showClassCol, setShowClassCol] = useState(false);
  const [showRoom, setShowRoom] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  const ui = (key) => getRRText(key, lang);
  const uiDir = getRRDir(lang);

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const ClassID = watch('ClassID');
  const SubClassID = watch('SubClassID');

  const { data: sessionData } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassData } = useGetSubClassListQuery();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // শিক্ষাবর্ষ ও পরীক্ষা — এই দুইটা ছাড়া রুটিন খোঁজার মানে নেই।
  // জামাত ও শ্রেণি ঐচ্ছিক; না দিলে পুরো মাদরাসার রুটিন এক পাতায়।
  const filterReady = Boolean(SessionID && ExamID);

  // ⚠️ `= {}` ডিফল্ট দেওয়া যাবে না — ফিল্টার দেওয়ার আগে কুয়েরিটা skipToken এ
  // থাকে, তাই data আসে undefined। ডিফল্ট দিলে প্রতি রেন্ডারে নতুন অবজেক্ট
  // তৈরি হতো আর নিচের useMemo গুলো অকারণে বারবার চলত।
  const { data, isFetching } = useGetExamRoutineReportQuery(
    filterReady
      ? {
          SessionID,
          ExamID,
          ...(ClassID ? { ClassID } : {}),
          ...(SubClassID ? { SubClassID } : {}),
        }
      : skipToken
  );

  const header = data?.header;
  const columns = useMemo(() => data?.columns ?? [], [data]);
  const allRows = useMemo(() => data?.rows ?? [], [data]);

  /* পুরো রুটিনে যে বেলাগুলো আসলেই আছে — সকাল / দুপুর / বিকাল / রাত এর
     মধ্যে কেবল সেগুলোই। সার্ভার StartTime দেখে ভাগ করে পাঠায়, তাই শুধু
     সকাল ও বিকালে পরীক্ষা হলে দুইটা কলামই বসে, চলতি কাগজের মতো। */
  const shifts = useMemo(() => data?.shifts ?? ['morning'], [data]);

  // ---------------------------------------------------------------- ছাঁকনি
  // জামাতের তালিকা সার্ভারের উত্তর থেকেই আসে — ছাঁকনি যাই হোক, পুরো
  // তালিকাটাই ফেরত পাঠানো হয়, তাই আলাদা কোনো কুয়েরি লাগে না।
  const classOptions = useMemo(() => data?.classes ?? [], [data]);

  /* শ্রেণির তালিকা — চলতি useGetSubClassListQuery থেকেই, কারণ ওটা পাতা
     খোলার সাথে সাথেই চলে আসে। জামাত বাছা থাকলে সেই জামাতেরগুলোই দেখায়
     (Academic_ClassGroup.ClassID ধরে)। তালিকাটা না এলে সার্ভারের উত্তরের
     subClasses টাই ব্যবহার হয়, তাই ঘরটা কখনো ফাঁকা থাকে না। */
  const subClassOptions = useMemo(() => {
    const base =
      (Array.isArray(subClassData) && subClassData.length
        ? subClassData
        : data?.subClasses) ?? [];

    if (!ClassID) return base;
    return base.filter((g) => String(g.ClassID ?? '') === String(ClassID));
  }, [subClassData, data, ClassID]);

  // জামাত বদলালে আগের শ্রেণিটা নতুন জামাতে না-ও থাকতে পারে — তখন ঘরটা
  // খালি করে দিই, নইলে কোনো সারিই আসত না আর কারণটা চোখে পড়ত না
  useEffect(() => {
    if (!SubClassID) return;
    const ok = subClassOptions.some(
      (g) => String(g.SubClassID) === String(SubClassID)
    );
    if (!ok) setValue('SubClassID', '');
  }, [subClassOptions, SubClassID, setValue]);

  // ------------------------------------------------------------ গ্রিডের সারি
  const rows = useMemo(
    () => (hideEmptyRows ? allRows.filter((r) => r.hasAny) : allRows),
    [allRows, hideEmptyRows]
  );

  /* প্রতি তারিখে কয়টা ঘর।
     ডিফল্টে সব তারিখের নিচে একই বেলাগুলো বসে, তাই কাগজের মাথাটা সমান
     থাকে। "খালি বেলার ঘর লুকাও" চালু করলে যেদিন যে বেলায় কোনো পরীক্ষাই
     নেই সেই ঘরটা বাদ যায়, তাই কাগজ অকারণে চওড়া হয় না। */
  const shiftsOf = (col) =>
    hideEmptyShift
      ? shifts.filter((s) => (col.shiftsUsed || []).includes(s))
      : shifts;

  const timeNote = useMemo(() => buildTimeNote(data?.times, lang), [data, lang]);
  const notices = useMemo(() => data?.messages ?? [], [data]);

  const watermark = buildAssetUrl(header?.InstitutionLogo);
  const instName = getInstituteName(header, lang);
  const instAddress = getInstituteAddress(header, lang);

  const titleLine = header
    ? ui('routineOf')(getExamText(header, lang), getSessionText(header, lang)).trim()
    : ui('routineTitle');

  const handlePrint = () => window.print();

  const hasRoutine = filterReady && columns.length > 0 && rows.length > 0;

  // বি:দ্র: এর লাইনগুলো — সময়ের লাইন, তারপর রুটিনে লেখা নোটিশগুলো
  const noteLines = [timeNote, ...notices].filter(Boolean);

  return (
    <FormProvider {...methods}>
      <style>{PRINT_CSS}</style>

      {/* ====================================================== নিয়ন্ত্রণ পট্টি */}
      <div
        className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print max-w-full overflow-x-hidden"
        dir={uiDir}
      >
        <div className="rounded-[10px] border border-gray-200 bg-gray-50/70 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 items-end gap-3">
            <DefaultSelect
              label={`${ui('session')} :`}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode
            />
            <DefaultSelect
              label={`${ui('examName')} :`}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode
            />

            {/* ---- জামাত (Academic_Class) — "সকল" বলে একটা ঘর লাগে, তাই
                    DefaultSelect নয়, সাধারণ select ---- */}
            <div className="min-w-0">
              <label className="mb-1 block text-[14px] font-medium text-gray-700">
                {ui('mainClass')} :
              </label>
              <select
                className="w-full rounded-[8px] border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-700"
                {...register('ClassID')}
              >
                <option value="">{ui('allClass')}</option>
                {classOptions.map((c) => (
                  <option key={c.ClassID} value={c.ClassID}>
                    {getClassText(c, lang) || c.ClassID}
                  </option>
                ))}
              </select>
            </div>

            {/* ---- শ্রেণি (Academic_ClassGroup) — উপরের জামাত ধরে ছাঁকা ---- */}
            <div className="min-w-0">
              <label className="mb-1 block text-[14px] font-medium text-gray-700">
                {ui('subClass')} :
              </label>
              <select
                className="w-full rounded-[8px] border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-700"
                {...register('SubClassID')}
              >
                <option value="">{ui('allSubClass')}</option>
                {subClassOptions.map((g) => (
                  <option key={g.SubClassID} value={g.SubClassID}>
                    {getSubClassText(g, lang) || g.SubClassID}
                  </option>
                ))}
              </select>
            </div>

            {/* ---- ভাষা ---- */}
            <div className="min-w-0">
              <label className="mb-1 block text-[14px] font-medium text-gray-700">
                {ui('language')} :
              </label>
              <select
                className="w-full rounded-[8px] border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-700"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                dir="ltr"
              >
                {RR_LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              disabled={!hasRoutine}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <PrintIcon />
              {ui('print')}
            </button>
          </div>

          {/* ---- সাজসজ্জার টগল ---- */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <TogglePill
              label={ui('hideEmptyRow')}
              checked={hideEmptyRows}
              onChange={setHideEmptyRows}
            />
            <TogglePill
              label={ui('hideEmptyShift')}
              checked={hideEmptyShift}
              onChange={setHideEmptyShift}
            />
            <TogglePill
              label={ui('showClassCol')}
              checked={showClassCol}
              onChange={setShowClassCol}
            />
            <TogglePill label={ui('showRoom')} checked={showRoom} onChange={setShowRoom} />
            {watermark ? (
              <TogglePill
                label={ui('watermark')}
                checked={showWatermark}
                onChange={setShowWatermark}
              />
            ) : null}

            {hasRoutine ? (
              <span className="ms-auto text-[13px] text-gray-500">
                {ui('rowCount')(toLangDigit(rows.length, lang))} ·{' '}
                {ui('dayCount')(toLangDigit(columns.length, lang))}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================================== কাগজ */}
      <div className="mt-6">
        {!filterReady ? (
          <p className="hidden_in_print rounded-[10px] border border-gray-200 bg-white px-4 py-12 text-center text-[15px] text-gray-600">
            {ui('filterFirst')}
          </p>
        ) : isFetching ? (
          <div className="hidden_in_print flex flex-col items-center justify-center rounded-[10px] border border-gray-200 bg-white px-4 py-16">
            <Spinner size={52} stroke={4} className="text-blue-600" />
            <p className="mt-3 text-[16px] font-semibold text-gray-700">{ui('loading')}</p>
          </div>
        ) : !hasRoutine ? (
          <p className="hidden_in_print rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-12 text-center text-[15px] text-amber-700">
            {ui('noRoutine')}
          </p>
        ) : (
          <div className="routine-scroll max-w-full overflow-x-auto overscroll-x-contain">
            <div
              className="routine-paper relative mx-auto min-w-[900px] bg-white p-5 shadow-lg"
              dir={uiDir}
            >
              {/* ---- ওয়াটারমার্ক ---- */}
              {showWatermark && watermark ? (
                <img
                  src={watermark}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                  style={{ width: '46%', opacity: 0.07 }}
                />
              ) : null}

              {/* ---- কাগজের মাথা ---- */}
              <div className="relative mb-3 flex items-start gap-3">
                <div className="w-[70px] shrink-0">
                  {watermark ? (
                    <img src={watermark} alt="" className="h-[62px] w-[62px] object-contain" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 text-center">
                  <h1 className="text-[22px] font-bold leading-tight text-gray-900">
                    {instName}
                  </h1>
                  {instAddress ? (
                    <p className="text-[13px] text-gray-700">{instAddress}</p>
                  ) : null}
                  <p className="mt-0.5 text-[15px] font-semibold text-gray-800">
                    {titleLine}
                  </p>
                </div>

                {/* ডান পাশে সমান জায়গা — নইলে মাঝের লেখাটা বাঁ দিকে হেলে যেত */}
                <div className="w-[70px] shrink-0" />
              </div>

              {/* ---- গ্রিড ---- */}
              <table className="routine-table relative text-[12px]">
                <thead>
                  {/* সারি ১ — তারিখ ও বার */}
                  <tr>
                    {showClassCol ? (
                      <th rowSpan={2} style={{ minWidth: 86 }}>
                        {ui('mainClass')}
                      </th>
                    ) : null}
                    <th rowSpan={2} style={{ minWidth: 92 }}>
                      {ui('date')}
                    </th>

                    {columns.map((col) => (
                      <th key={col.key} colSpan={shiftsOf(col).length} style={{ minWidth: 86 }}>
                        <span className="block">{getDateText(col, lang)}</span>
                        {getDayText(col, lang) ? (
                          <span className="block font-normal">{getDayText(col, lang)}</span>
                        ) : null}
                      </th>
                    ))}
                  </tr>

                  {/* সারি ২ — বেলা (সকাল / দুপুর / বিকাল / রাত) */}
                  <tr>
                    {columns.map((col) =>
                      shiftsOf(col).map((shift) => (
                        <th key={`${col.key}-${shift}`} className="font-normal">
                          {getShiftText(shift, lang)}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.SubClassID}>
                      {showClassCol ? (
                        <td className="routine-rowhead">
                          {getClassText(row, lang) || '-'}
                        </td>
                      ) : null}

                      <td className="routine-rowhead">
                        {getSubClassText(row, lang) || row.SubClassID}
                      </td>

                      {columns.map((col) =>
                        shiftsOf(col).map((shift) => {
                          const list = row.cells?.[`${col.key}__${shift}`] || [];
                          const names = getCellText(list, lang);

                          return (
                            <td key={`${row.SubClassID}-${col.key}-${shift}`}>
                              {names.length ? (
                                list.map((item, i) => {
                                  const room = showRoom ? getRoomText(item, lang) : '';
                                  return (
                                    <span key={`${item.SubID ?? i}-${i}`} className="block">
                                      {names[i]}
                                      {room ? (
                                        <span className="block text-[10px] text-gray-500">
                                          {room}
                                        </span>
                                      ) : null}
                                    </span>
                                  );
                                })
                              ) : (
                                // ঘর ফাঁকা হলে ড্যাশ — কাগজে যেভাবে চলে আসছে
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ---- কাগজের পা ---- */}
              <div className="relative mt-3 flex items-end justify-between gap-6 text-[12px]">
                <div className="min-w-0 text-gray-800">
                  {noteLines.map((line, i) => (
                    <p key={`${i}-${line.slice(0, 12)}`}>
                      {i === 0 ? <span className="font-semibold">{ui('note')} </span> : null}
                      {toLangDigit(i + 1, lang)}। {line}
                    </p>
                  ))}
                </div>

                <p className="shrink-0 font-semibold text-gray-900">
                  {header?.PrincipalName
                    ? `${header.PrincipalName} — ${ui('principal')}`
                    : ui('principal')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default ExamRoutineReport;
