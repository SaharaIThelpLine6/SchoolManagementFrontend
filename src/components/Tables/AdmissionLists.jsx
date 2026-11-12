import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';

import DefaultSelect from '../Forms/DefaultSelect';
import { useGetClassListQuery, useGetSubClasssQuery } from '../../features/class/classQuerySlice';
import {
  useGetExamFilterExamsQuery,
  useGetExamFilterSubclassesQuery,
  useGetExamSessionQuery,
} from '../../features/exam/examQuerySlice';
import { useGetResultReportDataQuery } from '../../features/result/resultSilce';
import {
  useCreateStudentPromotionMutation,
  useDeleteStudentPromotionMutation,
  useGetStudentPromotionsQuery,
} from '../../features/student/studentQuerySlice';

/* ═══════════════ CONSTANTS & HELPERS ═══════════════ */
const STATUS_PROMOTED = 1; // পরবর্তী শ্রেণিতে প্রমোশন
const STATUS_RETAINED = 2; // একই শ্রেণিতে থাকবে

const STATUS_META = {
  [STATUS_PROMOTED]: {
    label: 'প্রমোটেড',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [STATUS_RETAINED]: {
    label: 'পুনরায় একই শ্রেণি',
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
};

const FAIL_RE = /স্থগিত|ছগিত|রাসিব|fail|^F$/i;

const isEmpty = (v) => v === undefined || v === null || v === '';
const toArray = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : []);
const isFailResult = (r) => FAIL_RE.test(String(r?.Division?.DivisionNames ?? ''));
const defaultStatusOf = (s) => (s.isFail ? STATUS_RETAINED : STATUS_PROMOTED);

const FILTER_TABS = [
  { key: 'all', label: 'সকল' },
  { key: 'pass', label: 'উত্তীর্ণ' },
  { key: 'fail', label: 'অকৃতকার্য' },
  { key: 'pending', label: 'প্রমোশন বাকি' },
];

/* ═══════════════ SMALL UI ═══════════════ */
const Chip = ({ className = '', children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`}>
    {children}
  </span>
);

const StatCard = ({ label, value, tone }) => {
  const tones = {
    slate: 'from-slate-50 to-white text-slate-700 border-slate-200',
    emerald: 'from-emerald-50 to-white text-emerald-700 border-emerald-100',
    rose: 'from-rose-50 to-white text-rose-700 border-rose-100',
    indigo: 'from-indigo-50 to-white text-indigo-700 border-indigo-100',
    amber: 'from-amber-50 to-white text-amber-700 border-amber-100',
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br px-3 py-2.5 ${tones[tone]}`}>
      <p className="text-[11px] font-medium opacity-80">{label}</p>
      <p className="text-xl font-extrabold leading-tight">{value}</p>
    </div>
  );
};

const Medal = ({ p }) => {
  if (!p) return null;
  const colors = {
    1: 'bg-yellow-300 text-yellow-900 border-yellow-600',
    2: 'bg-sky-400 text-white border-sky-700',
    3: 'bg-orange-500 text-white border-orange-800',
  };
  return (
    <span
      className={`inline-flex h-6 min-w-[24px] items-center justify-center rounded-full border px-1 text-[11px] font-extrabold ${colors[p] || 'bg-slate-100 text-slate-600 border-slate-300'
        }`}
      title={`স্থান: ${p}`}
    >
      {p}
    </span>
  );
};

const EmptyBox = ({ title, sub }) => (
  <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
      <svg className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-700">{title}</p>
    {sub && <p className="mt-1 max-w-xs text-xs text-slate-400">{sub}</p>}
  </div>
);

/* ═══════════════ MAIN ═══════════════ */
const AdmissionLists = () => {
  const methods = useForm({
    defaultValues: {
      SessionID: '', ExamID: '', SubClassID: '',
      NextSessionID: '', NextClassID: '', NextSubClassID: '',
    },
  });
  const { control, setValue } = methods;

  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });
  const subClassID = useWatch({ control, name: 'SubClassID' });
  const nextSessionID = useWatch({ control, name: 'NextSessionID' });
  const nextClassID = useWatch({ control, name: 'NextClassID' });
  const nextSubClassID = useWatch({ control, name: 'NextSubClassID' });

  /* ---------- local state ---------- */
  const [entries, setEntries] = useState({}); // { [userId]: { status, remarks } }
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [rightTab, setRightTab] = useState('new'); // new | saved

  /* ---------- filter dropdown data (ResultReport এর মতোই) ---------- */
  const { data: sessionData } = useGetExamSessionQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subClassAllData } = useGetSubClasssQuery();

  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID: sessionID },
    { skip: !sessionID }
  );
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID: sessionID, ExamID: examID },
    { skip: !sessionID || !examID }
  );

  const sessionList = toArray(sessionData);
  const classList = toArray(classListData);
  const allSubClassList = toArray(subClassAllData);

  const nextSubClassOptions = useMemo(
    () => allSubClassList.filter((sc) => String(sc.ClassID) === String(nextClassID)),
    [allSubClassList, nextClassID]
  );

  /* ---------- cascading reset ---------- */
  useEffect(() => {
    setValue('ExamID', '');
    setValue('SubClassID', '');
    setEntries({});
  }, [sessionID, setValue]);

  useEffect(() => {
    setValue('SubClassID', '');
    setEntries({});
  }, [examID, setValue]);

  useEffect(() => {
    setEntries({});
  }, [subClassID]);

  useEffect(() => {
    setValue('NextSubClassID', '');
  }, [nextClassID, setValue]);

  /* ---------- Result report data (Report 1) ---------- */
  const queryParams = useMemo(() => {
    if (isEmpty(sessionID) || isEmpty(examID) || isEmpty(subClassID)) return null;
    return { report_data: 1, session_id: sessionID, exam_id: examID, subclass_id: subClassID };
  }, [sessionID, examID, subClassID]);

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const reportError = error
    ? error?.data?.message || 'ডেটা লোড করতে সমস্যা হয়েছে।'
    : reportData?.success === false
      ? reportData?.message || 'ডেটা পাওয়া যায়নি।'
      : null;

  /* ---------- Already saved promotions ---------- */
  const { data: savedData } = useGetStudentPromotionsQuery(
    { SessionID: sessionID, ExamID: examID, SubClassID: subClassID },
    { skip: !queryParams }
  );
  const savedList = toArray(savedData);
  const savedMap = useMemo(() => {
    const m = {};
    savedList.forEach((p) => { m[Number(p.UserID)] = p; });
    return m;
  }, [savedList]);

  const [createPromotion, { isLoading: isSaving }] = useCreateStudentPromotionMutation();
  const [deletePromotion] = useDeleteStudentPromotionMutation();

  /* ---------- view model ---------- */
  const students = useMemo(() => {
    const list = Array.isArray(reportData?.studentResults) ? reportData.studentResults : [];
    return list
      .map((r) => {
        const useCustom = Number(r?.DColor) === 1 && typeof r?.DColorType === 'string' && r.DColorType.trim() !== '';
        return {
          userId: Number(r.UserID),
          name: r?.User?.UserName || '',
          father: r?.User?.FatherName || '',
          code: r?.User?.UserCode ?? '',
          serial: Number(r?.User?.Admission?.[0]?.AdmissionSerial) || 0,
          total: r?.Total ?? '',
          position: Number(r?.Positions) || 0,
          division: r?.Division?.DivisionNames || '',
          failSubjects: Number(r?.TotalFailCount) || 0,
          isFail: isFailResult(r),
          customColor: useCustom ? r.DColorType.trim() : null,
        };
      })
      .sort((a, b) => a.serial - b.serial);
  }, [reportData]);

  const studentMap = useMemo(() => {
    const m = {};
    students.forEach((s) => { m[s.userId] = s; });
    return m;
  }, [students]);

  const cond = reportData?.conditionAverage;
  const currentClassId =
    Number(cond?.SubClass?.ClassID) ||
    Number(reportData?.studentResults?.[0]?.User?.Admission?.[0]?.ClassID) ||
    null;
  const currentSubClassId = Number(subClassID) || null;

  /* ---------- name lookups ---------- */
  const sessionNameOf = (id) => sessionList.find((s) => String(s.SessionID) === String(id))?.SessionName || id || '-';
  const classNameOf = (id) => classList.find((c) => String(c.ClassID) === String(id))?.ClassName || id || '-';
  const subClassNameOf = (id) => allSubClassList.find((s) => String(s.SubClassID) === String(id))?.SubClass || id || '-';

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    const total = students.length;
    const fail = students.filter((s) => s.isFail).length;
    const saved = students.filter((s) => savedMap[s.userId]).length;
    return { total, fail, pass: total - fail, saved, selected: Object.keys(entries).length };
  }, [students, savedMap, entries]);

  /* ---------- visible (filtered) list ---------- */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !(`${s.name} ${s.code} ${s.father}`.toLowerCase().includes(q))) return false;
      if (filterTab === 'pass') return !s.isFail;
      if (filterTab === 'fail') return s.isFail;
      if (filterTab === 'pending') return !savedMap[s.userId];
      return true;
    });
  }, [students, search, filterTab, savedMap]);

  const selectable = visible.filter((s) => !savedMap[s.userId]);
  const allVisibleChecked = selectable.length > 0 && selectable.every((s) => entries[s.userId]);

  /* ---------- entry actions ---------- */
  const toggleStudent = (s) => {
    if (savedMap[s.userId]) return;
    setEntries((prev) => {
      const next = { ...prev };
      if (next[s.userId]) delete next[s.userId];
      else next[s.userId] = { status: defaultStatusOf(s), remarks: '' };
      return next;
    });
  };

  const addMany = (list) => {
    setEntries((prev) => {
      const next = { ...prev };
      list.forEach((s) => {
        if (!savedMap[s.userId] && !next[s.userId]) {
          next[s.userId] = { status: defaultStatusOf(s), remarks: '' };
        }
      });
      return next;
    });
  };

  const toggleAllVisible = () => {
    if (allVisibleChecked) {
      setEntries((prev) => {
        const next = { ...prev };
        selectable.forEach((s) => delete next[s.userId]);
        return next;
      });
    } else addMany(selectable);
  };

  const removeEntry = (id) =>
    setEntries((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const patchEntry = (id, patch) =>
    setEntries((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const applyBulkStatus = (status) =>
    setEntries((prev) => {
      const next = {};
      Object.keys(prev).forEach((id) => { next[id] = { ...prev[id], status }; });
      return next;
    });

  const resetToAuto = () =>
    setEntries((prev) => {
      const next = {};
      Object.keys(prev).forEach((id) => {
        const s = studentMap[id];
        next[id] = { ...prev[id], status: s ? defaultStatusOf(s) : prev[id].status };
      });
      return next;
    });

  const entryList = Object.keys(entries)
    .map((id) => ({ s: studentMap[id], e: entries[id], id: Number(id) }))
    .filter((x) => x.s)
    .sort((a, b) => a.s.serial - b.s.serial);

  const promotedCount = entryList.filter((x) => x.e.status === STATUS_PROMOTED).length;
  const retainedCount = entryList.length - promotedCount;

  /* ---------- submit ---------- */
  const handleSubmit = async () => {
    if (!entryList.length) return toast.error('কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন');
    if (isEmpty(nextSessionID)) return toast.error('পরবর্তী সেশন নির্বাচন করুন');
    if (!currentClassId) return toast.error('বর্তমান শ্রেণির তথ্য পাওয়া যায়নি');
    if (promotedCount > 0 && (isEmpty(nextClassID) || isEmpty(nextSubClassID))) {
      return toast.error('প্রমোটেড শিক্ষার্থীদের জন্য পরবর্তী শ্রেণি ও সাব-ক্লাস নির্বাচন করুন');
    }

    const ok = window.confirm(
      `মোট ${entryList.length} জনের প্রমোশন সংরক্ষণ করবেন?\nপ্রমোটেড: ${promotedCount}, একই শ্রেণিতে: ${retainedCount}`
    );
    if (!ok) return;

    const promotions = entryList.map(({ e, id }) => {
      const promoted = e.status === STATUS_PROMOTED;
      return {
        SessionID: Number(sessionID),
        ExamID: Number(examID),
        ClassID: currentClassId,
        SubClassID: currentSubClassId,
        UserID: id,
        NextSessionID: Number(nextSessionID),
        NextClassID: promoted ? Number(nextClassID) : currentClassId,
        NextSubClassID: promoted ? Number(nextSubClassID) : currentSubClassId,
        PromotionStatus: e.status,
        Remarks: e.remarks?.trim() || null,
      };
    });

    try {
      const res = await createPromotion(promotions).unwrap();
      toast.success(
        `${res?.total ?? promotions.length} জনের প্রমোশন সংরক্ষিত হয়েছে` +
        (res?.skipped?.length ? ` (${res.skipped.length} জন আগেই ছিল)` : '')
      );
      setEntries({});
      setRightTab('saved');
    } catch (err) {
      toast.error(err?.data?.error || 'প্রমোশন সংরক্ষণ করা যায়নি');
    }
  };

  const handleDeleteSaved = async (p) => {
    if (!window.confirm('এই প্রমোশন এন্ট্রি মুছে ফেলতে চান?')) return;
    try {
      await deletePromotion(p.ID).unwrap();
      toast.success('প্রমোশন এন্ট্রি মুছে ফেলা হয়েছে');
    } catch (err) {
      toast.error(err?.data?.error || 'মুছে ফেলা যায়নি');
    }
  };

  const showData = !!queryParams && !reportError && students.length > 0;

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <FormProvider {...methods}>
      <div className="min-h-[100dvh] bg-slate-50 font-SolaimanLipi">
        {/* ───────── HEADER + FILTERS ───────── */}
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 lg:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-lg shadow-indigo-500/20">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-extrabold leading-tight text-slate-800">শিক্ষার্থী প্রমোশন</h1>
                  <p className="text-xs text-slate-400">ফলাফল দেখে পরবর্তী সেশন ও শ্রেণিতে প্রমোশন এন্ট্রি</p>
                </div>
              </div>

              {showData && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Chip className="border-slate-200 bg-slate-50 text-slate-600">
                    {sessionNameOf(sessionID)} • {cond?.Exam?.ExamName || ''} • {cond?.SubClass?.SubClass || ''}
                  </Chip>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
              <DefaultSelect
                label="সেশন"
                nameField="SessionName"
                registerKey="SessionID"
                valueField="SessionID"
                options={sessionData ?? []}
                require={false}
                defaultSelect={false}
                unicode={true}
              />
              <DefaultSelect
                label="পরীক্ষা"
                nameField="ExamName"
                registerKey="ExamID"
                valueField="ExamID"
                options={examNameData ?? []}
                require={false}
                unicode={true}
              />
              <DefaultSelect
                label="সাব-ক্লাস"
                nameField="SubClass"
                registerKey="SubClassID"
                valueField="SubClassID"
                options={subclassListData ?? []}
                require={false}
                unicode={true}
              />
            </div>
          </div>
        </header>

        {/* ───────── BODY ───────── */}
        <main className="mx-auto max-w-[1600px] p-3 sm:p-4 lg:p-6">
          {isFetching && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent" />
            </div>
          )}

          {!queryParams && !isLoading && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <EmptyBox title="কোনো ডেটা লোড হয়নি" sub="সেশন, পরীক্ষা ও সাব-ক্লাস নির্বাচন করলে শিক্ষার্থীদের ফলাফল এখানে আসবে" />
            </div>
          )}

          {queryParams && reportError && !isFetching && (
            <div className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
              <div className="h-1 bg-gradient-to-r from-rose-400 to-amber-400" />
              <div className="p-6 text-center">
                <p className="text-base font-semibold text-slate-800">ডেটা লোড করা যায়নি</p>
                <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{reportError}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 rounded-lg bg-rose-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-600 active:scale-95"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            </div>
          )}

          {queryParams && !reportError && !isFetching && students.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <EmptyBox title="কোনো শিক্ষার্থী পাওয়া যায়নি" sub="এই ফিল্টারে কোনো ফলাফল নেই" />
            </div>
          )}

          {showData && (
            <>
              {/* stats */}
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <StatCard label="মোট শিক্ষার্থী" value={stats.total} tone="slate" />
                <StatCard label="উত্তীর্ণ" value={stats.pass} tone="emerald" />
                <StatCard label="অকৃতকার্য" value={stats.fail} tone="rose" />
                <StatCard label="প্রমোশন সংরক্ষিত" value={stats.saved} tone="indigo" />
                <StatCard label="নির্বাচিত" value={stats.selected} tone="amber" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                {/* ═════════ LEFT: STUDENT LIST ═════════ */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-7">
                  <div className="space-y-3 border-b border-slate-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-bold text-slate-800">শিক্ষার্থী তালিকা</h2>
                        <p className="text-[11px] text-slate-400">টিক দিলে ডান পাশে প্রমোশন এন্ট্রিতে যোগ হবে</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => addMany(students.filter((s) => !s.isFail))}
                          className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          + সব উত্তীর্ণ
                        </button>
                        <button
                          type="button"
                          onClick={() => addMany(students.filter((s) => s.isFail))}
                          className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          + সব অকৃতকার্য
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative flex-1">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="নাম, আইডি বা পিতার নাম দিয়ে খুঁজুন..."
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                      <div className="grid grid-flow-col auto-cols-fr gap-1 rounded-lg bg-slate-100 p-1">
                        {FILTER_TABS.map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => setFilterTab(t.key)}
                            className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${filterTab === t.key
                              ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                              : 'text-slate-500 hover:text-slate-700'
                              }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* select all row */}
                  <label className="flex cursor-pointer items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2 text-[12px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={allVisibleChecked}
                      onChange={toggleAllVisible}
                      disabled={selectable.length === 0}
                      className="h-4 w-4 cursor-pointer accent-emerald-600"
                    />
                    <span>সব নির্বাচন ({selectable.length})</span>
                    <span className="ml-auto text-[11px] font-medium text-slate-400">দেখানো হচ্ছে {visible.length} জন</span>
                  </label>

                  <div className="max-h-[640px] overflow-y-auto">
                    {visible.length === 0 ? (
                      <EmptyBox title="কিছু পাওয়া যায়নি" sub="সার্চ বা ফিল্টার পরিবর্তন করুন" />
                    ) : (
                      visible.map((s) => {
                        const saved = savedMap[s.userId];
                        const checked = !!entries[s.userId];
                        const gradeStyle = s.customColor
                          ? { backgroundColor: s.customColor, color: '#fff', borderColor: s.customColor }
                          : undefined;
                        return (
                          <label
                            key={s.userId}
                            className={`flex items-center gap-3 border-b border-slate-100 px-4 py-2.5 transition ${saved
                              ? 'cursor-not-allowed bg-slate-50/80'
                              : checked
                                ? 'cursor-pointer bg-emerald-50/70'
                                : 'cursor-pointer hover:bg-slate-50'
                              }`}
                          >
                            <input
                              type="checkbox"
                              disabled={!!saved}
                              checked={checked}
                              onChange={() => toggleStudent(s)}
                              className="h-4 w-4 shrink-0 cursor-pointer accent-emerald-600 disabled:cursor-not-allowed"
                            />
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-[12px] font-bold text-slate-600">
                              {s.serial || '-'}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[14px] font-semibold text-slate-800">{s.name}</p>
                              <p className="truncate text-[11px] text-slate-400">
                                আইডি: {s.code || '-'}
                                {s.father ? ` • পিতা: ${s.father}` : ''}
                              </p>
                            </div>

                            <div className="hidden text-right sm:block">
                              <p className="text-[10px] text-slate-400">মোট</p>
                              <p className="text-[13px] font-bold text-slate-700">{s.total}</p>
                            </div>

                            <div className="flex w-[96px] shrink-0 flex-col items-end gap-1">
                              <Chip
                                className={s.customColor ? '' : s.isFail ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}
                              >
                                <span style={gradeStyle} className={s.customColor ? 'rounded px-1' : ''}>
                                  {s.division || '-'}
                                </span>
                              </Chip>
                              {s.failSubjects > 0 && (
                                <span className="text-[10px] font-semibold text-rose-500">ফেল বিষয়: {s.failSubjects}</span>
                              )}
                            </div>

                            <div className="w-6 shrink-0 text-center">
                              <Medal p={s.position} />
                            </div>

                            {saved && (
                              <Chip className={STATUS_META[saved.PromotionStatus]?.cls || 'border-slate-200 bg-slate-100 text-slate-600'}>
                                ✓ সংরক্ষিত
                              </Chip>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* ═════════ RIGHT: PROMOTION ENTRY ═════════ */}
                <aside className="space-y-4 xl:sticky xl:top-4 xl:col-span-5 xl:self-start">
                  {/* target */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-emerald-50 px-4 py-3">
                      <h3 className="text-sm font-bold text-slate-800">প্রমোশনের গন্তব্য</h3>
                      <p className="text-[11px] text-slate-500">
                        বর্তমান: {classNameOf(currentClassId)} / {cond?.SubClass?.SubClass || '-'} • {sessionNameOf(sessionID)}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
                      <DefaultSelect
                        label="পরবর্তী সেশন"
                        nameField="SessionName"
                        registerKey="NextSessionID"
                        valueField="SessionID"
                        options={sessionData ?? []}
                        require={false}
                        defaultSelect={false}
                        unicode={true}
                      />
                      <DefaultSelect
                        label="পরবর্তী শ্রেণি"
                        nameField="ClassName"
                        registerKey="NextClassID"
                        valueField="ClassID"
                        options={classListData ?? []}
                        require={false}
                        unicode={true}
                      />
                      <DefaultSelect
                        label="পরবর্তী সাব-ক্লাস"
                        nameField="SubClass"
                        registerKey="NextSubClassID"
                        valueField="SubClassID"
                        options={nextSubClassOptions}
                        require={false}
                        unicode={true}
                      />
                    </div>
                    <p className="px-4 pb-3 text-[11px] leading-snug text-slate-400">
                      “পুনরায় একই শ্রেণি” স্ট্যাটাসের শিক্ষার্থীরা পরবর্তী সেশনে বর্তমান শ্রেণি ও সাব-ক্লাসেই থাকবে।
                    </p>
                  </div>

                  {/* entries / saved */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-1 border-b border-slate-100 p-2">
                      {[
                        { key: 'new', label: `নতুন এন্ট্রি (${entryList.length})` },
                        { key: 'saved', label: `সংরক্ষিত (${savedList.length})` },
                      ].map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setRightTab(t.key)}
                          className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${rightTab === t.key
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {rightTab === 'new' ? (
                      <>
                        {entryList.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                            <span className="mr-auto text-[11px] font-semibold text-slate-500">
                              প্রমোটেড {promotedCount} • একই শ্রেণি {retainedCount}
                            </span>
                            <button type="button" onClick={() => applyBulkStatus(STATUS_PROMOTED)}
                              className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">সবাই প্রমোটেড</button>
                            <button type="button" onClick={() => applyBulkStatus(STATUS_RETAINED)}
                              className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">সবাই একই শ্রেণি</button>
                            <button type="button" onClick={resetToAuto}
                              className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-200">ফলাফল অনুযায়ী</button>
                            <button type="button" onClick={() => setEntries({})}
                              className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-100">খালি করুন</button>
                          </div>
                        )}

                        <div className="max-h-[420px] overflow-y-auto">
                          {entryList.length === 0 ? (
                            <EmptyBox title="কোনো এন্ট্রি নেই" sub="বাম পাশ থেকে শিক্ষার্থী টিক দিন" />
                          ) : (
                            entryList.map(({ s, e, id }) => (
                              <div key={id} className="border-b border-slate-100 px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold text-slate-800">{s.name}</p>
                                    <p className="text-[10px] text-slate-400">
                                      আইডি: {s.code} • {s.division}{s.isFail ? ' (অকৃতকার্য)' : ''}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-0.5 rounded-lg bg-slate-100 p-0.5">
                                    {[STATUS_PROMOTED, STATUS_RETAINED].map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => patchEntry(id, { status: st })}
                                        className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${e.status === st
                                          ? st === STATUS_PROMOTED
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-amber-500 text-white'
                                          : 'text-slate-500 hover:text-slate-700'
                                          }`}
                                      >
                                        {st === STATUS_PROMOTED ? 'প্রমোট' : 'একই শ্রেণি'}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeEntry(id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                    title="সরান"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <input
                                  value={e.remarks}
                                  onChange={(ev) => patchEntry(id, { remarks: ev.target.value })}
                                  placeholder="মন্তব্য (ঐচ্ছিক)"
                                  maxLength={200}
                                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] placeholder-slate-300 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                />
                              </div>
                            ))
                          )}
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/60 p-3">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving || entryList.length === 0}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSaving ? (
                              <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                সংরক্ষণ হচ্ছে...
                              </>
                            ) : (
                              <>প্রমোশন সংরক্ষণ করুন ({entryList.length})</>
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="max-h-[520px] overflow-y-auto">
                        {savedList.length === 0 ? (
                          <EmptyBox title="কোনো সংরক্ষিত প্রমোশন নেই" />
                        ) : (
                          savedList.map((p) => {
                            const st = studentMap[Number(p.UserID)];
                            const meta = STATUS_META[p.PromotionStatus];
                            return (
                              <div key={p.ID} className="flex items-start gap-2 border-b border-slate-100 px-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="truncate text-[13px] font-semibold text-slate-800">
                                      {st?.name || `ইউজার #${p.UserID}`}
                                    </p>
                                    {meta && (
                                      <Chip className={meta.cls}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                                        {meta.label}
                                      </Chip>
                                    )}
                                  </div>
                                  <p className="mt-0.5 text-[11px] text-slate-500">
                                    → {sessionNameOf(p.NextSessionID)} • {classNameOf(p.NextClassID)} / {subClassNameOf(p.NextSubClassID)}
                                  </p>
                                  {p.Remarks && <p className="mt-0.5 text-[11px] italic text-slate-400">“{p.Remarks}”</p>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSaved(p)}
                                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                  title="মুছুন"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </FormProvider>
  );
};

export default AdmissionLists;