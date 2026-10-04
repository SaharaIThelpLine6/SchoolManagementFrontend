import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import Button from '../../components/Button/Button';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import Loading from '../../components/Loading/Loading';

import { setPageName } from '../../features/auth/authSlice';
import {
  useGetExamDivisionNameQuery,
  useUpdateExamDivisionNoteMutation,
} from '../../features/result/resultSilce';

import useTranslate from '../../utils/Translate';

const EXAM_TYPE_OPTIONS = [
  { name: 'দরসিয়াত', value: 1 },
  { name: 'হিফজ কন্ডিশন ভিত্তিক', value: 2 },
  { name: 'গড়ে যা আসবে তাই', value: 3 },
  { name: 'পয়েন্ট ভিত্তিক', value: 4 },
];

const MAX_NOTE_LENGTH = 500;

// =====================================================
// TOAST
// =====================================================
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

const showToast = (icon, title) => Toast.fire({ icon, title });

// =====================================================
// NOTE FIELD (shared by table & mobile card)
// =====================================================
const NoteField = ({ value, isChanged, onChange, onReset }) => (
  <div className="relative">
    <textarea
      value={value}
      rows={2}
      maxLength={MAX_NOTE_LENGTH}
      onChange={(e) => onChange(e.target.value)}
      placeholder="এখানে মন্তব্য লিখুন..."
      className={`w-full resize-y rounded-xl border px-3 py-2 pb-7 text-sm leading-relaxed text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 ${isChanged
        ? 'border-amber-400 bg-amber-50/40 focus:border-amber-500 focus:ring-4 focus:ring-amber-100'
        : 'border-blue-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
        }`}
    />

    <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center justify-between">
      <span className="text-[11px] font-medium tracking-wide text-gray-400">
        {value.length}/{MAX_NOTE_LENGTH}
      </span>

      {isChanged && (
        <button
          type="button"
          onClick={onReset}
          className="pointer-events-auto inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-200"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          আগের অবস্থায় ফিরুন
        </button>
      )}
    </div>
  </div>
);

// =====================================================
// MAIN PAGE
// =====================================================
const DivisionMarkSheetNoteModal = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({ defaultValues: { ExamType: '' } });
  const { watch } = methods;

  const ExamType = watch('ExamType');
  const examTypeNum = Number(ExamType);
  const hasExamType =
    ExamType !== '' &&
    ExamType != null &&
    Number.isFinite(examTypeNum) &&
    examTypeNum > 0;

  // { [DivisionID]: "note text" }
  const [notes, setNotes] = useState({});

  // ---------------- QUERIES ----------------
  const {
    currentData: divisionData,
    isFetching: isDivisionFetching,
    isError: isDivisionError,
    refetch,
  } = useGetExamDivisionNameQuery(
    { ExamType: examTypeNum },
    { skip: !hasExamType }
  );

  const [updateNote, { isLoading: isSaving }] =
    useUpdateExamDivisionNoteMutation();

  const divisions = useMemo(
    () => (hasExamType && Array.isArray(divisionData) ? divisionData : []),
    [divisionData, hasExamType]
  );

  // Server er Note gulo ke map banai (changed kina bujhar jonno)
  const originalNotes = useMemo(() => {
    const map = {};
    divisions.forEach((d) => {
      map[d.ID] = d.Note ?? '';
    });
    return map;
  }, [divisions]);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Data ashle / ExamType bodlale textarea gulo server value diye bhorbe
  useEffect(() => {
    setNotes(originalNotes);
  }, [originalNotes]);

  // ---------------- DERIVED ----------------
  const changedIds = useMemo(
    () =>
      divisions
        .filter((d) => (notes[d.ID] ?? '') !== (originalNotes[d.ID] ?? ''))
        .map((d) => d.ID),
    [divisions, notes, originalNotes]
  );

  const changedCount = changedIds.length;

  const selectedExamTypeName = useMemo(
    () =>
      EXAM_TYPE_OPTIONS.find((o) => Number(o.value) === examTypeNum)?.name ?? '',
    [examTypeNum]
  );

  // ---------------- HANDLERS ----------------
  const handleNoteChange = (id, value) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const handleResetRow = (id) => {
    setNotes((prev) => ({ ...prev, [id]: originalNotes[id] ?? '' }));
  };

  const handleResetAll = () => setNotes(originalNotes);

  const handleSaveAll = async () => {
    if (!hasExamType) {
      showToast('warning', translate('Please select all required fields'));
      return;
    }

    if (changedCount === 0) {
      showToast('info', translate('No changes to save'));
      return;
    }

    // Shudhu jegulo bodleche segulo pathabo
    const results = await Promise.allSettled(
      changedIds.map((id) =>
        updateNote({
          ExamType: examTypeNum,
          DivisionID: Number(id),
          Note: (notes[id] ?? '').trim(),
        }).unwrap()
      )
    );

    const failed = results.filter((r) => r.status === 'rejected');

    if (failed.length === 0) {
      showToast('success', translate('Marksheet note updated successfully'));
    } else if (failed.length === results.length) {
      const err = failed[0].reason;
      showToast(
        'error',
        err?.data?.message ||
        err?.data?.error ||
        translate('Failed to save marksheet note')
      );
    } else {
      showToast(
        'warning',
        `${results.length - failed.length} টি সেভ হয়েছে, ${failed.length} টি ব্যর্থ হয়েছে`
      );
    }

    // Server theke notun data niye ashbo, tahole "changed" state reset hobe
    refetch();
  };

  // ---------------- RENDER ----------------
  return (
    <div className="font-default min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/60 to-blue-100/40 px-3 py-4 sm:px-4 sm:py-6">
      {/* Custom scrollbar */}
      <style>{`
        .nice-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .nice-scroll::-webkit-scrollbar-track { background: #eff6ff; border-radius: 9999px; }
        .nice-scroll::-webkit-scrollbar-thumb { background: #93c5fd; border-radius: 9999px; }
        .nice-scroll::-webkit-scrollbar-thumb:hover { background: #60a5fa; }
      `}</style>

      <div className="mx-auto w-full max-w-6xl space-y-4">


        {/* ================= FILTER ================= */}
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
          <FormProvider {...methods}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
              <div className="w-full md:max-w-sm">
                <DefaultSelect
                  options={EXAM_TYPE_OPTIONS}
                  registerKey="ExamType"
                  placeholder=" পরিক্ষার ধরন নির্বাচন "
                  nameField="name"
                  valueField="value"
                  label={translate('Exam Type')}
                  require={translate('Exam Type is required')}
                  unicode={true}
                />
              </div>

              {hasExamType && selectedExamTypeName && (
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 md:mb-0.5">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-blue-800 sm:text-sm">
                    নির্বাচিত: {selectedExamTypeName}
                  </span>
                </div>
              )}
            </div>
          </FormProvider>
        </div>

        {/* ================= STATES ================= */}
        {!hasExamType && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-white/70 px-4 py-16 text-center backdrop-blur">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-3xl shadow-lg shadow-blue-500/25">
              📝
            </div>
            <p className="text-sm font-semibold text-blue-900 sm:text-base">
              উপরে পরীক্ষার ধরন নির্বাচন করুন
            </p>
            <p className="mt-1 max-w-sm text-xs text-blue-500 sm:text-sm">
              ডিভিশনভিত্তিক মন্তব্য দেখতে ও সম্পাদনা করতে পরীক্ষার ধরন নির্বাচন
              করুন
            </p>
          </div>
        )}

        {hasExamType && isDivisionFetching && (
          <div className="rounded-2xl border border-blue-100 bg-white py-14 shadow-sm">
            <Loading />
          </div>
        )}

        {hasExamType && !isDivisionFetching && isDivisionError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-12 text-center">
            <div className="mb-2 text-3xl">⚠️</div>
            <p className="text-sm font-semibold text-red-600">
              {translate('Error loading data')}
            </p>
          </div>
        )}

        {hasExamType &&
          !isDivisionFetching &&
          !isDivisionError &&
          divisions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-blue-100 bg-white px-4 py-14 text-center">
              <div className="mb-2 text-3xl">📭</div>
              <p className="text-sm font-semibold text-blue-900">
                {translate('No data available')}
              </p>
            </div>
          )}

        {/* ================= DATA CARD ================= */}
        {hasExamType && !isDivisionFetching && divisions.length > 0 && (
          <div className="flex flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-500/5">
            {/* ---------- TOOLBAR ---------- */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-500/20 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-4 py-3">
              <div className="flex items-center gap-2 text-white">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
                <span className="text-xs font-bold sm:text-sm">
                  মোট ডিভিশন: {divisions.length}
                </span>
              </div>

              {changedCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 sm:text-xs">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  {changedCount} টি পরিবর্তন সেভ হয়নি
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur sm:text-xs">
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  সব সেভ করা আছে
                </span>
              )}
            </div>

            {/* ---------- DESKTOP TABLE ---------- */}
            <div className="nice-scroll hidden max-h-[55vh] flex-1 overflow-x-auto overflow-y-auto md:block">
              <table className="w-full min-w-[680px] border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-50/95 backdrop-blur">
                    <th className="w-20 border-b border-blue-100 px-3 py-3 text-center text-sm font-bold text-blue-900">
                      ক্রমিক
                    </th>
                    <th className="w-56 border-b border-blue-100 px-3 py-3 text-center text-sm font-bold text-blue-900">
                      ডিভিশন
                    </th>
                    <th className="border-b border-blue-100 px-3 py-3 text-center text-sm font-bold text-blue-900">
                      শিক্ষকের মন্তব্য নিচে টাইপ করুন
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {divisions.map((item, index) => {
                    const value = notes[item.ID] ?? '';
                    const isChanged =
                      value !== (originalNotes[item.ID] ?? '');

                    return (
                      <tr
                        key={item.ID}
                        className={`border-b border-blue-50 transition-colors duration-200 ${isChanged
                          ? 'bg-amber-50/60'
                          : index % 2 === 0
                            ? 'bg-white'
                            : 'bg-blue-50/25'
                          } hover:bg-blue-50/70`}
                      >
                        {/* ক্রমিক */}
                        <td className="px-3 py-3 text-center align-middle">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-sm font-bold text-white shadow-sm shadow-blue-500/25">
                            {index + 1}
                          </span>
                        </td>

                        {/* ডিভিশন */}
                        <td className="px-3 py-3 text-center align-middle">
                          <span className="text-sm font-semibold text-blue-900">
                            {item.DivisionNames || '-'}
                          </span>
                        </td>

                        {/* মন্তব্য */}
                        <td className="px-3 py-2 align-middle">
                          <NoteField
                            value={value}
                            isChanged={isChanged}
                            onChange={(val) => handleNoteChange(item.ID, val)}
                            onReset={() => handleResetRow(item.ID)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ---------- MOBILE CARDS ---------- */}
            <div className="nice-scroll max-h-[55vh] flex-1 divide-y divide-blue-50 overflow-y-auto md:hidden">
              {divisions.map((item, index) => {
                const value = notes[item.ID] ?? '';
                const isChanged = value !== (originalNotes[item.ID] ?? '');

                return (
                  <div
                    key={item.ID}
                    className={`p-3.5 transition-colors duration-200 ${isChanged ? 'bg-amber-50/50' : 'bg-white'
                      }`}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-xs font-bold text-white shadow-sm">
                          {index + 1}
                        </span>
                        <span className="truncate text-sm font-bold text-blue-900">
                          {item.DivisionNames || '-'}
                        </span>
                      </div>

                      {isChanged && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          পরিবর্তিত
                        </span>
                      )}
                    </div>

                    <NoteField
                      value={value}
                      isChanged={isChanged}
                      onChange={(val) => handleNoteChange(item.ID, val)}
                      onReset={() => handleResetRow(item.ID)}
                    />
                  </div>
                );
              })}
            </div>

            {/* ---------- FOOTER (STICKY) ---------- */}
            <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t border-blue-100 bg-white/95 px-4 py-3.5 shadow-[0_-4px_20px_-8px_rgba(59,130,246,0.25)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <span className="text-center text-xs font-medium text-blue-700 sm:text-left">
                {changedCount > 0
                  ? `${changedCount} টি ডিভিশনের মন্তব্য পরিবর্তিত হয়েছে`
                  : 'সব মন্তব্য হালনাগাদ অবস্থায় আছে'}
              </span>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={isSaving || changedCount === 0}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                >
                  {translate('Reset')}
                </button>

                <Button
                  type="button"
                  onClick={handleSaveAll}
                  className="w-full sm:w-auto"
                  disabled={isSaving || changedCount === 0}
                >
                  {isSaving ? translate('Saving...') : translate('Update')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DivisionMarkSheetNoteModal;