import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import DefaultSearchSelect from '../components/Forms/DefaultSearchSelect';
import useTranslate from '../utils/Translate';
import { FormProvider, useForm } from 'react-hook-form';
import {
  useGetExamFilterExamsQuery,
  useGetExamFilterSubclassesQuery,
  useGetExamSessionQuery,
} from '../features/exam/examQuerySlice';
import { useGetSmsPublishedResultQuery } from '../features/result/resultSilce';
import DefaultSelect from '../components/Forms/DefaultSelect';
import {
  useGetCheckBalanceQuery,
  useSendPublishedResultMutation,
} from '../features/sms/smsSlice';

const SMS_COST_PER_MESSAGE = 1;

const bn = (n) => Number(n).toLocaleString('bn-BD');

/* ---------- আইকন ---------- */
const Icon = ({ children, className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);
const HelpIcon = (p) => (<Icon {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>);
const WalletIcon = (p) => (<Icon {...p}><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" /><path d="M4 6v12a2 2 0 0 0 2 2h14v-4" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></Icon>);
const TagIcon = (p) => (<Icon {...p}><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" /><line x1="7" y1="7" x2="7.01" y2="7" /></Icon>);
const UsersIcon = (p) => (<Icon {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon>);
const CalcIcon = (p) => (<Icon {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" /><line x1="16" y1="10" x2="16.01" y2="10" /><line x1="8" y1="14" x2="8.01" y2="14" /><line x1="12" y1="14" x2="12.01" y2="14" /><line x1="16" y1="14" x2="16.01" y2="14" /></Icon>);
const SendIcon = (p) => (<Icon {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon>);
const SearchIcon = (p) => (<Icon {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>);
const CloseIcon = (p) => (<Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>);
const CheckIcon = (p) => (<Icon {...p}><polyline points="20 6 9 17 4 12" /></Icon>);
const AlertIcon = (p) => (<Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>);

/* ---------- ছোট কম্পোনেন্ট ---------- */
const StatCard = ({ icon, label, value, tone = 'slate', hint }) => {
  const tones = {
    slate: 'bg-white border-slate-200 text-slate-800',
    teal: 'bg-white border-slate-200 text-[#2c68d8]',
    sky: 'bg-white border-slate-200 text-[#2c68d8]',
    strong: 'bg-gradient-to-br from-[#4284f1] to-[#2a5fd0] border-[#4284f1] text-white',
    danger: 'bg-rose-50 border-rose-200 text-rose-700',
  };
  const iconTone = tone === 'strong' ? 'bg-white/15 text-white' : tone === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-[#eaf2ff] text-[#2c68d8]';
  const labelTone = tone === 'strong' ? 'text-blue-100' : 'text-slate-500';
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 ${tones[tone]}`}>
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconTone}`}>{icon}</span>
      <div className="min-w-0">
        <p className={`text-xs ${labelTone}`}>{label}</p>
        <p key={value} className="stat-pop text-xl font-bold leading-tight tabular-nums">{value}</p>
        {hint && <p className={`text-[11px] ${labelTone}`}>{hint}</p>}
      </div>
    </div>
  );
};

const Checkbox = ({ checked, indeterminate, onChange, label }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label}
      className="h-[18px] w-[18px] cursor-pointer rounded-md accent-[#4284f1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-2" />
  );
};

const HelpModal = ({ onClose, cost }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sampleSms = `জামিয়া মাদানিয়া বারিধারা
বার্ষিক পরীক্ষা
নাম : মাহমুদ হাসান মাসুম
আইডি: 1001206
মোট : 664
গড় : 94
বিভাগ : মুমতায
মেধা : 3`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="SMS কীভাবে যাবে">
      <div className="modal-fade absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-rise relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-slate-800">কীভাবে SMS যাবে?</h2>
          <button onClick={onClose} aria-label="বন্ধ করুন"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1]">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="m-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="whitespace-pre-line rounded-xl bg-white px-4 py-3 font-medium leading-relaxed text-slate-800 ring-1 ring-slate-200" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif" }}>
            {sampleSms}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- ✅ কনফার্ম মোডাল (মাদ্রাসার কোড ইনপুট) ---------- */
const ConfirmSendModal = ({ targets, cost, balance, isSending, onClose, onConfirm }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const count = targets.length;
  const totalCost = count * cost;
  const insufficient = balance - totalCost < 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !isSending && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isSending]);

  const submit = () => {
    if (isSending) return;
    const trimmed = code.trim();
    if (!trimmed) {
      setError('মাদ্রাসার কোড দিন।');
      inputRef.current?.focus();
      return;
    }
    if (insufficient) return;
    setError('');
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="SMS পাঠানোর নিশ্চিতকরণ">
      <div className="modal-fade absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isSending && onClose()} />
      <div className="modal-rise relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">SMS পাঠানোর নিশ্চিতকরণ</h2>
          <button onClick={onClose} disabled={isSending} aria-label="বন্ধ করুন"
            className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] disabled:opacity-50">
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-base font-semibold leading-relaxed text-slate-800">
            আপনি এসএমএস পাঠাতে নিশ্চিত হলে নিচে মাদ্রাসার কোডটি প্রদান করে সেন্ড ক্লিক করুন
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[#f3f7ff] px-4 py-2.5 text-sm text-slate-600">
            <span>প্রাপক: <b className="text-[#2c68d8]">{bn(count)} জন</b></span>
            <span>খরচ: <b className="text-[#2c68d8]">{bn(totalCost)} পয়েন্ট</b></span>
          </div>

          <label htmlFor="madrasah-code" className="mt-4 block text-sm font-medium text-slate-600">
            মাদ্রাসার কোড
          </label>
          <input
            id="madrasah-code"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => { setCode(e.target.value); if (error) setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={isSending}
            placeholder="মাদ্রাসার কোড লিখুন"
            className={`mt-1.5 w-full rounded-xl border px-4 py-3 text-slate-800 outline-none transition focus:ring-2 focus:ring-[#4284f1] disabled:bg-slate-50 ${error ? 'border-rose-400' : 'border-slate-300'}`}
          />
          {error && <p className="mt-1.5 text-sm text-rose-600" role="alert">{error}</p>}

          {insufficient && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
              <AlertIcon className="h-4 w-4 shrink-0" />
              ব্যালেন্স পর্যাপ্ত নয়।
            </p>
          )}

          <div className="mt-5 flex items-center justify-end gap-3">
            <button onClick={onClose} disabled={isSending}
              className="rounded-xl px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50">
              বাতিল
            </button>
            <button onClick={submit} disabled={isSending || insufficient}
              className="flex items-center gap-2 rounded-xl bg-[#4284f1] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#4284f1]/30 transition hover:bg-[#2c68d8] active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
              {isSending ? (
                <><span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />পাঠানো হচ্ছে…</>
              ) : (
                <><SendIcon className="h-4 w-4" />Send</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- মূল কম্পোনেন্ট ---------- */
const PublicationOfResultsViaSMS = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const translate = useTranslate();

  // ✅ Selection state
  const [selectedMap, setSelectedMap] = useState({});

  // ✅ Confirm modal state: { targets: [...student objects], isBulk: boolean } | null
  const [confirm, setConfirm] = useState(null);

  const methods = useForm({
    defaultValues: {
      SessionID: '',
      ExamID: '',
      SubClassID: '',
    },
  });
  const { watch, setValue } = methods;

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const SubClassID = watch('SubClassID');

  // ✅ debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // ✅ Session query
  const { data: sessionData } = useGetExamSessionQuery();

  const sessionOptions = useMemo(() => {
    if (Array.isArray(sessionData)) return sessionData;
    if (Array.isArray(sessionData?.data)) return sessionData.data;
    if (Array.isArray(sessionData?.result)) return sessionData.result;
    return [];
  }, [sessionData]);

  // ✅ Exam query
  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID },
    { skip: !SessionID }
  );

  const examOptions = useMemo(() => {
    if (Array.isArray(examNameData)) return examNameData;
    if (Array.isArray(examNameData?.data)) return examNameData.data;
    return [];
  }, [examNameData]);

  // ✅ SubClass query
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID, ExamID },
    { skip: !SessionID || !ExamID }
  );

  const subclassOptions = useMemo(() => {
    if (Array.isArray(subclassListData)) return subclassListData;
    if (Array.isArray(subclassListData?.data)) return subclassListData.data;
    return [];
  }, [subclassListData]);

  // ✅ নির্বাচিত পরীক্ষার নাম (SMS-এ ব্যবহারের জন্য)
  const selectedExamName = useMemo(() => {
    const found = examOptions.find(
      (e) => String(e?.ExamID) === String(ExamID)
    );
    return found?.ExamName ?? '';
  }, [examOptions, ExamID]);

  // ======================================================
  // ✅ SMS Published Result query
  // ======================================================
  const {
    data: smsResultData,
    isLoading: smsLoading,
    isFetching: smsFetching,
    isError: smsError,
    refetch: refetchSms,
  } = useGetSmsPublishedResultQuery(
    {
      sessionid: SessionID,
      examid: ExamID,
      classid: SubClassID,
      query: debouncedQuery || undefined,
    },
    { skip: !SessionID || !ExamID || !SubClassID }
  );

  // ======================================================
  // ✅ SMS Balance (dynamic)
  // ======================================================
  const { data: checkBalanceData, refetch: refetchBalance } =
    useGetCheckBalanceQuery();

  const smsBalance = useMemo(() => {
    const mask = Number(checkBalanceData?.mask ?? 0);
    const nonmask = Number(checkBalanceData?.nonmask ?? 0);
    const voice = Number(checkBalanceData?.voice ?? 0);

    const masked = Number.isFinite(mask) ? mask : 0;
    const nonMasked = Number.isFinite(nonmask) ? nonmask : 0;
    const voiceVal = Number.isFinite(voice) ? voice : 0;

    return Math.max(masked, nonMasked, voiceVal);
  }, [checkBalanceData]);

  // ✅ Send mutation
  const [sendPublishedResult, { isLoading: isSending }] =
    useSendPublishedResultMutation();

  // ✅ API students
  const apiStudents = useMemo(() => {
    if (!SubClassID) return [];
    const list = smsResultData?.students;
    return Array.isArray(list) ? list : [];
  }, [smsResultData, SubClassID]);

  // ✅ নতুন ডাটা এলে সব default selected
  useEffect(() => {
    if (!apiStudents.length) {
      setSelectedMap({});
      return;
    }
    const next = {};
    apiStudents.forEach((s, i) => {
      const key = `${s?.কোড ?? ''}-${s?.মোবাইল ?? ''}-${i}`;
      next[key] = true;
    });
    setSelectedMap(next);
  }, [apiStudents]);

  // ✅ students list
  const students = useMemo(
    () =>
      apiStudents.map((s, i) => {
        const key = `${s?.কোড ?? ''}-${s?.মোবাইল ?? ''}-${i}`;
        return {
          key,
          code: s?.কোড ?? '',
          name: s?.নাম ?? '',
          gpa: s?.গড় ?? '',
          total: s?.মোট ?? '',
          merit: s?.মেধা ?? '',
          dept: s?.বিভাগ ?? '',
          mobile: s?.মোবাইল ?? '',
          isSelected: !!selectedMap[key],
        };
      }),
    [apiStudents, selectedMap]
  );

  const selectedStudents = useMemo(
    () => students.filter((s) => s.isSelected),
    [students]
  );

  const selectedCount = selectedStudents.length;
  const totalCost = selectedCount * SMS_COST_PER_MESSAGE;
  const remaining = smsBalance - totalCost;
  const insufficient = remaining < 0;
  const allSelected = students.length > 0 && selectedCount === students.length;
  const noneSelected = selectedCount === 0;

  // ✅ Client-side filter
  const visible = useMemo(() => {
    const q = query.trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.includes(q) ||
        String(s.code).includes(q) ||
        String(s.mobile).includes(q)
    );
  }, [students, query]);

  const toggle = (key) =>
    setSelectedMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleAll = () => {
    const next = {};
    students.forEach((s) => {
      next[s.key] = !allSelected;
    });
    setSelectedMap(next);
  };

  // ======================================================
  // ✅ মোডাল খোলা — উপরের Send SMS (সব টিক দেওয়া)
  // ======================================================
  const openBulkConfirm = () => {
    if (noneSelected || insufficient || isSending) return;
    setConfirm({ targets: selectedStudents, isBulk: true });
  };

  // ✅ মোডাল খোলা — row-এর Action Send (শুধু ওই একজন)
  const openSingleConfirm = (student) => {
    if (isSending) return;
    setConfirm({ targets: [student], isBulk: false });
  };

  // ======================================================
  // ✅ handleSend — মোডালে কোড দিয়ে কনফার্ম করলে API call
  // ======================================================
  const handleConfirmSend = async (madrasahCode) => {
    if (!confirm || isSending) return;

    const { targets, isBulk } = confirm;
    const count = targets.length;
    const cost = count * SMS_COST_PER_MESSAGE;

    const smsTargets = targets.map((s) => ({
      কোড: s.code,
      নাম: s.name,
      গড়: s.gpa,
      মোট: s.total,
      মেধা: s.merit,
      বিভাগ: s.dept,
      মোবাইল: s.mobile,
    }));

    try {
      const response = await sendPublishedResult({
        students: smsTargets,
        examName: selectedExamName,
        madrasahCode, // ✅ মাদ্রাসার কোড
      }).unwrap();

      setConfirm(null);

      setToast({
        count: response?.successCount ?? count,
        cost,
        fail: response?.failCount ?? 0,
      });
      setTimeout(() => setToast(null), 5000);

      if (isBulk) {
        // ✅ বাল্ক সেন্ডের পর: শুধু SubClassID reset (SessionID, ExamID অক্ষত)
        setValue('SubClassID', '');
        setSelectedMap({});
        setQuery('');
      }
      // একজনকে পাঠালে টেবিল যেমন আছে তেমনই থাকবে

      // ✅ ব্যালেন্স refetch
      refetchBalance?.();
    } catch (err) {
      console.error('❌ SMS send failed:', err);
      setConfirm(null);
      setToast({
        error: true,
        message:
          err?.data?.error ||
          err?.error ||
          'SMS পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col rounded-3xl" style={{ fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif", background: 'radial-gradient(900px 520px at 8% -8%, rgba(66,132,241,.45), transparent 60%), radial-gradient(760px 480px at 100% 0%, rgba(129,170,255,.40), transparent 58%), radial-gradient(700px 500px at 50% 110%, rgba(66,132,241,.25), transparent 60%), linear-gradient(180deg, #e8f0ff 0%, #f4f8ff 100%)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
        @keyframes statPop { from { opacity: .3; transform: translateY(4px) } to { opacity: 1; transform: none } }
        @keyframes modalFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(24px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, 16px) } to { opacity: 1; transform: translate(-50%, 0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
        .stat-pop { animation: statPop .25s ease-out }
        .modal-fade { animation: modalFade .2s ease-out }
        .modal-rise { animation: modalRise .28s cubic-bezier(.2,.8,.2,1) }
        .toast-in { animation: toastIn .3s cubic-bezier(.2,.8,.2,1) }
        .spinner { animation: spin .8s linear infinite }
        @media (prefers-reduced-motion: reduce) { .stat-pop, .modal-fade, .modal-rise, .toast-in, .spinner { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important } }
      `}</style>
      <FormProvider {...methods}>

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-[#4284f1]/25">
          <header className="flex flex-none items-center justify-between gap-3 bg-gradient-to-r from-[#1b49b3] via-[#2c68d8] to-[#4284f1] px-5 py-5 sm:px-8">
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">এসএমএস এর মাধ্যমে ফলাফল প্রকাশ</h1>
              <p className="mt-0.5 text-sm text-blue-100">টিক দেওয়া শিক্ষার্থীদের নাম্বারে ফলাফল পাঠানো হবে</p>
            </div>
            <button onClick={() => setHelpOpen(true)} aria-label="কীভাবে SMS যাবে দেখুন"
              className="flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <HelpIcon className="h-5 w-5" />
              <span className="hidden sm:inline">মোবাইলে মেসেজ কেমন দেখাবে</span>
            </button>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <section className="shrink-0 border-b border-slate-100 bg-gradient-to-b from-[#f3f7ff] to-white px-5 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 items-end gap-4">
                <DefaultSelect
                  label={translate('Session')}
                  nameField="SessionName"
                  registerKey="SessionID"
                  valueField="SessionID"
                  options={sessionOptions}
                  require="This Field is required"
                  defaultSelect={false}
                  unicode={true}
                />
                <DefaultSelect
                  label={translate('Exam')}
                  nameField="ExamName"
                  registerKey="ExamID"
                  valueField="ExamID"
                  options={examOptions}
                  require="This Field is required"
                  unicode={true}
                />
                <DefaultSelect
                  label={translate('Sub Class')}
                  nameField="SubClass"
                  registerKey="SubClassID"
                  valueField="SubClassID"
                  options={subclassOptions}
                  require="This Field is required"
                  unicode={true}
                />

              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
                <StatCard icon={<WalletIcon />} label="মোট ব্যালেন্স" value={bn(smsBalance)} tone="teal" hint="SMS" />
                <StatCard icon={<TagIcon />} label="প্রতি SMS-এ কর্তন" value={bn(SMS_COST_PER_MESSAGE)} />
                <StatCard icon={<UsersIcon />} label="নির্বাচিত নাম্বার" value={`${bn(selectedCount)}/${bn(students.length)}`} tone="sky" />
                <StatCard icon={<CalcIcon />} label={`${bn(SMS_COST_PER_MESSAGE)} × ${bn(selectedCount)} = মোট খরচ`} value={bn(totalCost)} tone="strong" />
                <StatCard icon={insufficient ? <AlertIcon /> : <WalletIcon />} label="খরচের পর ব্যালেন্স" value={bn(remaining)} tone={insufficient ? 'danger' : 'slate'} />
                <div className="flex justify-center items-center">
                  <button onClick={openBulkConfirm} disabled={noneSelected || insufficient || isSending}
                    className="flex items-center gap-2 rounded-xl bg-[#4284f1] px-6 py-2.5 font-semibold text-white shadow-md shadow-[#4284f1]/30 transition hover:bg-[#2c68d8] active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                    <SendIcon className="h-4 w-4" />Send SMS
                  </button>
                </div>
              </div>

              {insufficient && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
                  <AlertIcon className="h-4 w-4 shrink-0" />
                  ব্যালেন্স পর্যাপ্ত নয়। কয়েকজনের টিক তুলে দিন অথবা ব্যালেন্স রিচার্জ করুন।
                </p>
              )}

              {smsError && (
                <p className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700" role="alert">
                  <AlertIcon className="h-4 w-4 shrink-0" />
                  ফলাফল লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
                  <button onClick={() => refetchSms()} className="ml-2 underline font-semibold">Retry</button>
                </p>
              )}
            </section>

            <div className="flex min-h-[260px] flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 shadow-[0_1px_0_#e2e8f0]">
                    <tr className="border-b border-slate-200">
                      <th className="w-14 px-5 py-3 text-center">
                        <Checkbox checked={allSelected} indeterminate={!allSelected && !noneSelected} onChange={toggleAll} label="সবাইকে নির্বাচন করুন" />
                      </th>
                      <th className="px-4 py-3 font-semibold">কোড</th>
                      <th className="px-4 py-3 font-semibold">নাম</th>
                      <th className="px-4 py-3 text-center font-semibold">গড়</th>
                      <th className="px-4 py-3 text-center font-semibold">মোট</th>
                      <th className="px-4 py-3 text-center font-semibold">মেধা</th>
                      <th className="px-4 py-3 font-semibold">বিভাগ</th>
                      <th className="px-4 py-3 font-semibold">মোবাইল</th>
                      <th className="px-4 py-3 font-semibold">SMS</th>
                      <th className="px-4 py-3 text-center font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smsLoading && (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">ফলাফল লোড হচ্ছে…</td></tr>
                    )}

                    {!smsLoading && visible.map((s) => (
                      <tr key={s.key} onClick={() => toggle(s.key)}
                        className={`cursor-pointer border-b border-slate-100 transition-colors duration-200 ${s.isSelected ? 'hover:bg-[#eaf2ff]/70' : 'bg-slate-50/80 hover:bg-slate-100'}`}>
                        <td className="px-5 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={s.isSelected} onChange={() => toggle(s.key)} label={`${s.name} কে SMS পাঠান`} />
                        </td>
                        <td className={`px-4 py-3 tabular-nums transition-opacity ${s.isSelected ? 'text-slate-700' : 'text-slate-400'}`}>{s.code}</td>
                        <td className={`px-4 py-3 font-medium transition-all ${s.isSelected ? 'text-slate-900' : 'text-slate-400 line-through decoration-slate-300'}`}>{s.name}</td>
                        <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{bn(s.gpa)}</td>
                        <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{bn(s.total)}</td>
                        <td className={`px-4 py-3 text-center tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{bn(s.merit)}</td>
                        <td className={`px-4 py-3 ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.dept}</td>
                        <td className={`px-4 py-3 tabular-nums ${s.isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{s.mobile}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${s.isSelected
                              ? 'bg-[#eaf2ff] text-[#2c68d8]'
                              : 'bg-red-100 text-red-600'
                              }`}
                          >
                            {s.isSelected ? (
                              <>
                                <CheckIcon className="h-3 w-3" />
                                যাবে
                              </>
                            ) : (
                              'যাবে না'
                            )}
                          </span>
                        </td>
                        {/* ✅ Action: শুধু এই শিক্ষার্থীকে SMS */}
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openSingleConfirm(s)}
                            disabled={isSending || SMS_COST_PER_MESSAGE > smsBalance}
                            aria-label={`${s.name} কে SMS পাঠান`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4284f1] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2c68d8] active:scale-[.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4284f1] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <SendIcon className="h-3.5 w-3.5" />
                            Send
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!smsLoading && visible.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                        {!SessionID || !ExamID || !SubClassID
                          ? 'শিক্ষাবর্ষ, পরীক্ষা ও জামাত/ক্লাস নির্বাচন করুন।'
                          : query
                            ? `"${query}" নামে কোনো শিক্ষার্থী পাওয়া যায়নি।`
                            : 'কোনো শিক্ষার্থী পাওয়া যায়নি।'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>

      {/* ✅ Success Toast */}
      {toast && !toast.error && (
        <div className="toast-in fixed bottom-10 left-1/2 z-[60] flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-2xl" role="status">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500"><CheckIcon className="h-4 w-4" /></span>
          <span>
            {bn(toast.count)} জনকে SMS পাঠানো হয়েছে, {bn(toast.cost)} পয়েন্ট কেটে নেওয়া হয়েছে
            {toast.fail > 0 && <span className="ml-1 text-amber-300">({bn(toast.fail)} ব্যর্থ)</span>}
          </span>
        </div>
      )}

      {/* ✅ Error Toast */}
      {toast && toast.error && (
        <div className="toast-in fixed bottom-10 left-1/2 z-[60] flex items-center gap-3 rounded-2xl bg-rose-600 px-5 py-3 text-sm text-white shadow-2xl" role="alert">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20"><AlertIcon className="h-4 w-4" /></span>
          <span>{toast.message}</span>
        </div>
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} cost={SMS_COST_PER_MESSAGE} />}

      {/* ✅ মাদ্রাসার কোডসহ কনফার্ম মোডাল */}
      {confirm && (
        <ConfirmSendModal
          targets={confirm.targets}
          cost={SMS_COST_PER_MESSAGE}
          balance={smsBalance}
          isSending={isSending}
          onClose={() => setConfirm(null)}
          onConfirm={handleConfirmSend}
        />
      )}
    </div>
  );
};

export default PublicationOfResultsViaSMS;