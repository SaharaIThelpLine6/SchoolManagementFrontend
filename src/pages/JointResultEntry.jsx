import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetExamListQuery, useSetJointResultExamMutation } from '../features/result/resultSilce';

const resultTypes = [
  {
    id: 'average',
    number: '01',
    title: 'Joint Exam Result',
    subtitle: 'নির্বাচিত পরীক্ষাগুলোর গড় ফলাফল',
    description: 'সেশন, শ্রেণি ও পরীক্ষা নির্বাচন করে নির্বাচিত পরীক্ষাগুলোর নম্বরের গড় নির্ণয় করুন।',
  },
  {
    id: 'percentage',
    number: '02',
    title: 'Percentage-Based Result',
    subtitle: 'নির্ধারিত শতাংশে চূড়ান্ত ফলাফল',
    description: 'প্রতিটি পরীক্ষার ওজন নির্ধারণ করে চূড়ান্ত ফল তৈরি করুন।',
  },
];

const selectClass =
  'h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-800 outline-none focus-visible:border-[#007af7] focus-visible:ring-2 focus-visible:ring-[#007af7]/20 disabled:cursor-not-allowed disabled:bg-slate-100';

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ddeffe] text-sm font-bold text-[#007af7]">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>}
      </div>
    </div>
  );
}
SectionHeading.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

export default function JointResultEntry({ pageTitle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editTargetExamId = searchParams.get('edit') === 'true' ? searchParams.get('exam_id') || '' : '';
  const { register, watch, reset } = useForm({
    defaultValues: {
      SessionID: searchParams.get('session_id') || '',
      SubClassID: searchParams.get('subclass_id') || '',
    },
  });
  const sessionId = watch('SessionID');
  const subClassId = watch('SubClassID');
  const scopeKey = sessionId && subClassId ? `${sessionId}:${subClassId}` : '';
  const hydrationKey = scopeKey ? `${scopeKey}:${editTargetExamId}` : '';
  const [resultType, setResultType] = useState('average');
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [jointExamId, setJointExamId] = useState('');
  const [weights, setWeights] = useState({});
  const [showReview, setShowReview] = useState(false);
  const [hydratedScope, setHydratedScope] = useState('');
  const [setJointResultExam, { isLoading: isSaving }] = useSetJointResultExamMutation();

  const { data: sessions = [], isLoading: isSessionsLoading } = useGetSessionsQuery();
  const { data: subClasses = [], isLoading: isSubClassesLoading } = useGetSubClassListQuery();
  const {
    currentData: examRows = [],
    isFetching: isExamListFetching,
    isError: hasExamListError,
  } = useGetExamListQuery(
    { session_id: sessionId, subclass_id: subClassId },
    { skip: !sessionId || !subClassId }
  );
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    setSelectedExamIds([]);
    setJointExamId('');
    setResultType('average');
    setWeights({});
    setShowReview(false);
    setHydratedScope('');
  }, [sessionId, subClassId]);

  const availableExams = useMemo(() => {
    const uniqueExams = new Map();
    examRows.forEach((row) => {
      if (row?.ExamID == null || uniqueExams.has(String(row.ExamID))) return;
      uniqueExams.set(String(row.ExamID), {
        id: String(row.ExamID),
        name: row.Exam?.ExamName || `পরীক্ষা ${row.ExamID}`,
        examType: Number(row.ExamType),
        isJointResult: Boolean(row.IsJointResult),
        sourceExamIds: (row.JointSourceExamIDs || []).map(String),
        jointResultType: row.JointResultType,
        jointExamWeights: row.JointExamWeights || {},
      });
    });
    return [...uniqueExams.values()];
  }, [examRows]);

  useEffect(() => {
    if (!hydrationKey) {
      setHydratedScope('');
      return;
    }
    if (isExamListFetching || hydratedScope === hydrationKey) return;

    const savedSetup = availableExams.find((exam) =>
      exam.isJointResult && (!editTargetExamId || exam.id === editTargetExamId)
    );
    setJointExamId(savedSetup?.id || '');
    const savedSourceIds = savedSetup?.sourceExamIds || [];
    setSelectedExamIds(savedSourceIds);
    if (savedSetup?.jointResultType) {
      setResultType(['average', 'percentage'].includes(savedSetup.jointResultType)
        ? savedSetup.jointResultType
        : 'average');
    }
    setWeights(savedSetup?.jointExamWeights || {});
    setHydratedScope(hydrationKey);
  }, [availableExams, editTargetExamId, hydratedScope, hydrationKey, isExamListFetching]);

  const selectedExams = availableExams.filter((exam) => selectedExamIds.includes(exam.id));
  useEffect(() => {
    if (jointExamId && !selectedExamIds.includes(jointExamId)) {
      setJointExamId('');
    }
  }, [jointExamId, selectedExamIds]);
  const totalWeight = selectedExams.reduce(
    (total, exam) => total + (Number(weights[exam.id]) || 0),
    0
  );
  const isWeightValid = resultType !== 'percentage' || Math.abs(totalWeight - 100) < 0.001;
  const pointwiseExamIds = availableExams.filter((exam) => exam.examType === 4).map((exam) => exam.id);
  const hasPointwiseExamSelected = selectedExams.some((exam) => exam.examType === 4);
  const hasAllPointwiseExamsSelected = pointwiseExamIds.every((id) => selectedExamIds.includes(id));
  const isExamSelectionValid = !hasPointwiseExamSelected || hasAllPointwiseExamsSelected;
  const canReview = selectedExams.length > 0 && isWeightValid;

  const toggleExam = (examId) => {
    setSelectedExamIds((current) =>
      current.includes(examId)
        ? current.filter((id) => id !== examId)
        : [...current, examId]
    );
    setShowReview(false);
  };

  const handleSave = async () => {
    try {
      await setJointResultExam({
        SessionID: sessionId,
        SubClassID: subClassId,
        ExamID: jointExamId,
        SourceExamIDs: selectedExamIds,
        ResultType: resultType,
        Weights: weights,
        ...(editTargetExamId ? { EditExamID: editTargetExamId } : {}),
      }).unwrap();

      await Swal.fire({
        icon: 'success',
        title: editTargetExamId ? 'সফলভাবে সম্পাদিত হয়েছে' : 'সফল হয়েছে',
        text: editTargetExamId
          ? 'যৌথ ফলাফলের সেটআপ হালনাগাদ করা হয়েছে।'
          : 'যৌথ ফলাফলের সেটআপ সংরক্ষণ করা হয়েছে।',
        confirmButtonText: 'ঠিক আছে',
      });
      if (editTargetExamId) {
        navigate('/dashboard/result/joint-result-publish');
        return;
      }
      reset({ SessionID: '', SubClassID: '' });
      setSelectedExamIds([]);
      setJointExamId('');
      setResultType('average');
      setWeights({});
      setShowReview(false);
    } catch (error) {
      const isDuplicate = error?.status === 409;
      await Swal.fire({
        icon: 'error',
        title: isDuplicate ? 'আগেই তৈরি করা হয়েছে' : 'সংরক্ষণ করা যায়নি',
        text: isDuplicate
          ? 'এই target পরীক্ষার জন্য এই শিক্ষাবর্ষ ও শ্রেণিতে যৌথ ফলাফলের সেটআপ আগে থেকেই তৈরি আছে।'
          : error?.data?.error || error?.message || 'আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  return (
    <main className="mx-auto w-full space-y-5 p-4 font-SolaimanLipi pb-[120px]">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          {/* <p className="text-sm font-semibold text-[#007af7]">ফলাফল ব্যবস্থাপনা</p> */}
          <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
            গুচ্ছ পদ্ধতিতে রেজাল্ট প্রকাশ
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            একাধিক পরীক্ষার ফলাফল একত্র করে মার্কশিট তৈরি ও প্রকাশের ধরন নির্ধারণ করুন।
          </p>
          {editTargetExamId && (
            <p className="mt-2 text-sm font-semibold text-[#007af7]">সংরক্ষিত যৌথ ফলাফলের সেটআপ সম্পাদনা</p>
          )}
        </div>
        <Link
          to="/dashboard/result/joint-result-publish"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007af7]"
        >
          প্রকাশনার তালিকা দেখুন
        </Link>
      </header>

      {editTargetExamId && hydratedScope === hydrationKey && !availableExams.some(
        (exam) => exam.id === editTargetExamId && exam.isJointResult
      ) && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          সম্পাদনার জন্য যৌথ ফলাফলের সেটআপটি পাওয়া যায়নি। তালিকা থেকে আবার নির্বাচন করুন।
        </p>
      )}

      {/* <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950" role="status">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
          <path d="M12 8v4m0 4h.01M10.3 3.9 1.8 18.5A1.7 1.7 0 0 0 3.3 21h17.4a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm leading-6">
          এই ফিচারের সংরক্ষণ ও প্রকাশনা API এখনো যুক্ত হয়নি। সেটআপ ও ফলাফল-পদ্ধতির প্রিভিউ এখানে দেখা যাবে; এখনো কোনো ফলাফল সংরক্ষণ বা প্রকাশ হবে না।
        </p>
      </div> */}

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <SectionHeading
          number="01"
          title="ফলাফলের ধরন বেছে নিন"
          description="একটি পদ্ধতি নির্বাচন করুন। পরের ধাপে সেই পদ্ধতি অনুযায়ী পরীক্ষার ফলাফল সাজানো হবে।"
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {resultTypes.map((type) => {
            const isSelected = resultType === type.id;
            return (
              <label
                key={type.id}
                className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors focus-within:ring-2 focus-within:ring-[#007af7] ${
                  isSelected
                    ? 'border-[#007af7] bg-[#ddeffe]'
                    : 'border-slate-200 bg-white hover:border-[#007af7]'
                }`}
              >
                <input
                  type="radio"
                  name="resultType"
                  value={type.id}
                  checked={isSelected}
                  onChange={() => {
                    setResultType(type.id);
                    setShowReview(false);
                  }}
                  className="mt-2 h-4 w-4 accent-[#007af7] focus-visible:outline-none"
                />
                <span className="min-w-0">
                  <span className="mt-1 block text-base font-bold text-slate-900">{type.subtitle}</span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{type.description}</span>
                </span>
              </label>
            );
          })}
        </div>
        {hasPointwiseExamSelected && !resultType && (
          <p className="mt-3 text-sm text-slate-600">Pointwise exam বাছাই হয়েছে। যৌথ ফলের জন্য উপরের দুইটি mode-এর একটি বেছে নিন।</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <SectionHeading
          number="02"
          title="সেশন ও শ্রেণি নির্বাচন"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">শিক্ষাবর্ষ <span className="text-red-600">*</span></span>
            <select {...register('SessionID')} className={selectClass} disabled={isSessionsLoading}>
              <option value="">{isSessionsLoading ? 'লোড হচ্ছে…' : 'শিক্ষাবর্ষ নির্বাচন করুন'}</option>
              {sessions.map((session) => (
                <option key={session.SessionID} value={session.SessionID}>{session.SessionName}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">শ্রেণি / জামাত <span className="text-red-600">*</span></span>
            <select {...register('SubClassID')} className={selectClass} disabled={isSubClassesLoading}>
              <option value="">{isSubClassesLoading ? 'লোড হচ্ছে…' : 'শ্রেণি নির্বাচন করুন'}</option>
              {subClasses.map((subClass) => (
                <option key={subClass.SubClassID} value={subClass.SubClassID}>{subClass.SubClass}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {resultType === 'average'
            ? 'নির্বাচিত পরীক্ষাগুলোর নম্বর যোগ করে নির্বাচিত পরীক্ষার সংখ্যা দিয়ে ভাগ করা হবে।'
            : 'নির্বাচিত পরীক্ষাগুলোর ওজনের যোগফল ১০০% হতে হবে।'}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">পরীক্ষা নির্বাচন <span className="text-red-600">*</span></h3>
            <p className="mt-1 text-sm text-slate-600">
              নির্বাচিত পরীক্ষা: {selectedExams.length}
            </p>
          </div>
          {selectedExams.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedExamIds([])}
                className="rounded px-2 py-1 text-sm font-semibold text-[#007af7] hover:bg-[#ddeffe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007af7]"
              >
                নির্বাচন মুছুন
              </button>
            )}
          </div>
          <div className="rounded-md border border-slate-200">
            {!sessionId || !subClassId ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">পরীক্ষার তালিকা দেখতে আগে শিক্ষাবর্ষ ও শ্রেণি নির্বাচন করুন।</p>
            ) : isExamListFetching ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">পরীক্ষার তালিকা লোড হচ্ছে…</p>
            ) : hasExamListError ? (
              <p className="px-4 py-6 text-center text-sm text-red-700" role="alert">পরীক্ষার তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।</p>
            ) : availableExams.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">এই সেশন ও শ্রেণির জন্য কোনো পরীক্ষার ফলাফল সেটআপ পাওয়া যায়নি।</p>
            ) : (
              <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                {availableExams.map((exam) => (
                  <label key={exam.id} className="flex min-h-14 cursor-pointer items-center gap-3 bg-white px-4 py-3 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={selectedExamIds.includes(exam.id)}
                      onChange={() => toggleExam(exam.id)}
                      aria-label={`${exam.name} নির্বাচন করুন`}
                      className="h-4 w-4 rounded border-slate-300 accent-[#007af7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007af7]"
                    />
                    <span className="text-base font-medium text-slate-800">{exam.name}</span>
                    {exam.examType === 4 && <span className="ml-auto rounded bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">Pointwise</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
          {hasPointwiseExamSelected && !hasAllPointwiseExamsSelected && (
            <p className="mt-3 text-sm text-red-700" role="alert">Pointwise result-এর জন্য ExamType 4-এর সব পরীক্ষাই নির্বাচন করতে হবে।</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <SectionHeading
          number="03"
          title="যে পরীক্ষার রিপোর্টে যৌথ ফলাফল দেখাবেন"
        description="উপরে source হিসেবে বেছে নেওয়া পরীক্ষাগুলোর মধ্য থেকে একটি target exam নির্বাচন করুন।"
        />
        {!sessionId || !subClassId ? (
          <p className="rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">আগে শিক্ষাবর্ষ ও শ্রেণি নির্বাচন করুন।</p>
        ) : selectedExams.length === 0 ? (
          <p className="rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">আগে যৌথ ফলাফলে অন্তর্ভুক্ত করার পরীক্ষাগুলো নির্বাচন করুন।</p>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {selectedExams.map((exam) => (
              <label key={exam.id} className="flex min-h-14 cursor-pointer items-center gap-3 bg-white px-4 py-3 hover:bg-slate-50">
                <input type="radio" name="jointResultExam" value={exam.id} checked={jointExamId === exam.id} onChange={() => setJointExamId(exam.id)} className="h-4 w-4 accent-[#007af7]" />
                <span className="text-base font-medium text-slate-800">{exam.name}</span>
                {exam.isJointResult && <span className="ml-auto rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">বর্তমান যৌথ ফল</span>}
              </label>
            ))}
          </div>
        )}
      </section>

      {resultType === 'percentage' && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <SectionHeading
            number="04"
            title="পরীক্ষাভিত্তিক শতাংশ নির্ধারণ"
            description="প্রতিটি নির্বাচিত পরীক্ষার ওজন নির্ধারণ করুন। সব শতাংশের যোগফল ১০০% হতে হবে।"
          />
          {selectedExams.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-4 py-5 text-sm text-slate-600">শতাংশ নির্ধারণের আগে অন্তত একটি পরীক্ষা নির্বাচন করুন।</p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full min-w-[34rem] text-left">
                <thead className="bg-slate-50 text-sm text-slate-700">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">পরীক্ষা</th>
                    <th scope="col" className="w-52 px-4 py-3 font-semibold">ওজন</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExams.map((exam) => (
                    <tr key={exam.id} className="border-t border-slate-200">
                      <th scope="row" className="px-4 py-3 text-base font-medium text-slate-800">{exam.name}</th>
                      <td className="px-4 py-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            inputMode="decimal"
                            value={weights[exam.id] ?? ''}
                            onChange={(event) => {
                              setWeights((current) => ({ ...current, [exam.id]: event.target.value }));
                              setShowReview(false);
                            }}
                            aria-label={`${exam.name} এর শতাংশ`}
                            className={`${selectClass} max-w-36`}
                            placeholder="যেমন ৩০"
                          />
                          <span className="text-base text-slate-600">%</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200 bg-slate-50">
                  <tr>
                    <th scope="row" className="px-4 py-3 text-sm font-bold text-slate-800">মোট</th>
                    <td className={`px-4 py-3 text-base font-bold ${isWeightValid ? 'text-[#007af7]' : 'text-red-700'}`}>
                      {totalWeight}% <span className="text-sm font-medium">/ ১০০%</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {!isWeightValid && selectedExams.length > 0 && (
            <p className="mt-2 text-sm text-red-700" role="alert">প্রকাশনার প্রিভিউ দেখতে শতাংশের যোগফল ঠিক ১০০% করুন।</p>
          )}

        </section>
      )}

      {/* <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <SectionHeading
          number={resultType === 'percentage' ? '04' : '03'}
          title="ফলাফল তৈরির নিয়ম"
          description="আপনার নির্বাচন অনুযায়ী ফলাফলের হিসাব কীভাবে হবে তা যাচাই করুন।"
        />
        <div className="flex flex-col gap-4 rounded-md bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-bold text-slate-900">
              {resultTypes.find((type) => type.id === resultType)?.title}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {resultType === 'average' && 'নির্বাচিত পরীক্ষাগুলোর প্রাপ্ত নম্বরের যোগফল ÷ নির্বাচিত পরীক্ষার সংখ্যা।'}
              {resultType === 'percentage' && 'প্রতিটি পরীক্ষার প্রাপ্ত ফল × নির্ধারিত শতাংশ; সব পরীক্ষার ওজন মিলিয়ে চূড়ান্ত ফল।'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReview((current) => !current)}
            disabled={!canReview}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md bg-[#007af7] px-5 py-2 text-base font-semibold text-white hover:bg-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007af7] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {showReview ? 'প্রিভিউ বন্ধ করুন' : 'সেটআপ প্রিভিউ দেখুন'}
          </button>
        </div>
        {showReview && (
          <div className="mt-4 rounded-md border border-[#b3dcff] bg-[#eef7ff] p-4" role="status">
            <h3 className="text-base font-bold text-[#0f2a4a]">সেটআপ যাচাই হয়েছে</h3>
            <p className="mt-1 text-sm leading-6 text-[#0f2a4a]">
              {selectedExams.map((exam) => exam.name).join(' + ')}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#0f2a4a]">
              {resultType === 'percentage'
                ? `মোট ওজন ${totalWeight}% · নির্বাচিত পরীক্ষাগুলোর ওজন অনুযায়ী চূড়ান্ত ফল তৈরি হবে।`
                : `${selectedExams.length}টি পরীক্ষার গড় নির্ণয় হবে।`}
            </p>
          </div>
        )}
      </section> */}

      <footer className="flex flex-col items-start justify-end gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center">
        {/* <p className="max-w-2xl text-sm leading-6 text-slate-500">
          সংরক্ষণ ও প্রকাশনা চালু হলে এই সেটআপ তালিকায় যোগ হবে; বর্তমানে এটি শুধু UI প্রিভিউ।
        </p> */}
        <button
          type="button"
          disabled={!sessionId || !subClassId || !jointExamId || !resultType || selectedExamIds.length === 0 || !isWeightValid || !isExamSelectionValid || isSaving || Boolean(editTargetExamId && !availableExams.some((exam) => exam.id === editTargetExamId && exam.isJointResult))}
          onClick={handleSave}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#007af7] px-5 py-2 text-base font-semibold text-white hover:bg-[#0066cc] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
        >
          {isSaving ? 'সংরক্ষণ হচ্ছে…' : editTargetExamId ? 'পরিবর্তন সংরক্ষণ করুন' : 'যৌথ ফলাফলের পরীক্ষা সংরক্ষণ করুন'}
        </button>
      </footer>
    </main>
  );
}

JointResultEntry.propTypes = {
  pageTitle: PropTypes.string,
};
