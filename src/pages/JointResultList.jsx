import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useDeleteJointResultSetupMutation, useGetExamListQuery } from '../features/result/resultSilce';

const resultTypes = ['সব ধরন', 'Joint Exam Result', 'Percentage-Based Result'];
const statuses = ['সব অবস্থা', 'প্রকাশিত', 'অপ্রকাশিত', 'খসড়া'];
const selectClass =
  'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-800 outline-none focus-visible:border-[#007af7] focus-visible:ring-2 focus-visible:ring-[#007af7]/20';

export default function JointResultList({ pageTitle }) {
  const dispatch = useDispatch();
  const [resultType, setResultType] = useState(resultTypes[0]);
  const [status, setStatus] = useState(statuses[0]);
  const [sessionId, setSessionId] = useState('');
  const [subClassId, setSubClassId] = useState('');
  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: subClasses = [] } = useGetSubClassListQuery();
  const [deleteJointResultSetup, { isLoading: isDeleting }] = useDeleteJointResultSetupMutation();
  const { currentData: examRows = [], isFetching, isError } = useGetExamListQuery({
    session_id: sessionId,
    subclass_id: subClassId,
  });

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const listRows = examRows
    .filter((row) => row.IsJointResult)
    .map((row) => ({
      id: row.ID,
      examId: String(row.ExamID),
      name: row.JointResultType === 'percentage' ? 'Percentage-Based Result' : 'Joint Exam Result',
      sessionId: String(row.SessionID ?? ''),
      session: row.Session?.SessionName || '',
      subClassId: String(row.SubClassID ?? ''),
      subClass: row.SubClass?.SubClass || '',
      exams: `${row.Exam?.ExamName || ''} ← ${(row.JointSourceExamIDs || []).map((sourceExamId) =>
        examRows.find((exam) => String(exam.ExamID) === String(sourceExamId))?.Exam?.ExamName || sourceExamId
      ).join(' + ')}`,
      status: Number(row.Published) ? 'প্রকাশিত' : 'অপ্রকাশিত',
    }));

  const handleDelete = async (row) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'যৌথ ফলাফলের সেটআপ মুছবেন?',
      text: `${row.exams} সেটআপটি মুছে যাবে।`,
      showCancelButton: true,
      confirmButtonText: 'মুছে ফেলুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmation.isConfirmed) return;

    try {
      await deleteJointResultSetup({
        SessionID: row.sessionId,
        SubClassID: row.subClassId,
        ExamID: row.examId,
      }).unwrap();
      await Swal.fire({
        icon: 'success',
        title: 'মুছে ফেলা হয়েছে',
        text: 'যৌথ ফলাফলের সেটআপ মুছে ফেলা হয়েছে।',
        confirmButtonText: 'ঠিক আছে',
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'মুছে ফেলা যায়নি',
        text: error?.data?.error || error?.message || 'আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  const visibleRows = listRows.filter((row) => {
    const matchesType = resultType === resultTypes[0] || row.name === resultType;
    const matchesStatus = status === statuses[0] || row.status === status;
    const matchesSession = !sessionId || row.sessionId === sessionId;
    const matchesSubClass = !subClassId || row.subClassId === subClassId;
    return matchesType && matchesStatus && matchesSession && matchesSubClass;
  });

  return (
    <main className="mx-auto w-full space-y-5 p-4 font-SolaimanLipi sm:p-6">
      <header className="flex flex-col justify-between gap-4 rounded-lg bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-5 text-white shadow-sm sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="M7 3.75h7l4.25 4.5v12A1.75 1.75 0 0 1 16.5 22h-9A1.75 1.75 0 0 1 5.75 20.25v-14A2.5 2.5 0 0 1 8.25 3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 4v5h4.75M9 13h6m-6 3.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">যৌথ ফলাফল প্রকাশনা</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/90">
              সেশন, শ্রেণি ও ফলাফলের ধরন অনুযায়ী যৌথ ফলাফল খুঁজুন।
            </p>
          </div>
        </div>
        <Link
          to="/dashboard/result/joint-result-publish/entry"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#007af7] px-4 py-2 text-base font-semibold text-white hover:bg-[#0066cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007af7] focus-visible:ring-offset-2"
        >
          নতুন ফলাফল এন্ট্রি
        </Link>
      </header>

      {/* <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950" role="status">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 shrink-0">
          <path d="M12 8v4m0 4h.01M10.3 3.9 1.8 18.5A1.7 1.7 0 0 0 3.3 21h17.4a1.7 1.7 0 0 0 1.5-2.5L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm leading-6">
          তালিকার সারিগুলো UI প্রিভিউ। যৌথ ফলাফলের জন্য সংরক্ষণ ও প্রকাশনা API যুক্ত হলে এখানে প্রকৃত রেকর্ড দেখা যাবে।
        </p>
      </div> */}

      <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">ফলাফল খুঁজুন</h2>
          <p className="mt-1 text-sm text-slate-600">তালিকা ছোট করতে এক বা একাধিক ফিল্টার নির্বাচন করুন।</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">শিক্ষাবর্ষ</span>
            <select className={selectClass} value={sessionId} onChange={(event) => setSessionId(event.target.value)}>
              <option value="">সব শিক্ষাবর্ষ</option>
              {sessions.map((session) => <option key={session.SessionID} value={String(session.SessionID)}>{session.SessionName}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">শ্রেণি / জামাত</span>
            <select className={selectClass} value={subClassId} onChange={(event) => setSubClassId(event.target.value)}>
              <option value="">সব শ্রেণি</option>
              {subClasses.map((subClass) => <option key={subClass.SubClassID} value={String(subClass.SubClassID)}>{subClass.SubClass}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">ফলাফলের ধরন</span>
            <select value={resultType} onChange={(event) => setResultType(event.target.value)} className={selectClass}>
              {resultTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-800">প্রকাশনার অবস্থা</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={selectClass}>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">যৌথ ফলাফলের তালিকা</h2>
            <p className="mt-1 text-sm text-slate-600">প্রিভিউ সারি: {visibleRows.length}</p>
          </div>
          <span className="w-fit rounded border border-slate-300 px-2 py-1 text-sm font-semibold text-slate-600">সংরক্ষিত সেটআপ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">ক্রমিক</th>
                <th scope="col" className="px-4 py-3 font-semibold">ফলাফলের ধরন</th>
                <th scope="col" className="px-4 py-3 font-semibold">শিক্ষাবর্ষ</th>
                <th scope="col" className="px-4 py-3 font-semibold">শ্রেণি</th>
                <th scope="col" className="px-4 py-3 font-semibold">পরীক্ষা</th>
                <th scope="col" className="px-4 py-3 font-semibold">অবস্থা</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">তালিকা লোড হচ্ছে…</td></tr>
              ) : isError ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-red-700">তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।</td></tr>
              ) : visibleRows.map((row, index) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-4 text-sm text-slate-600">{String(index + 1).padStart(2, '0')}</td>
                  <th scope="row" className="px-4 py-4 text-base font-semibold text-slate-900">{row.name}</th>
                  <td className="px-4 py-4 text-sm text-slate-700">{row.session}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{row.subClass}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{row.exams}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded border border-slate-300 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/dashboard/result/joint-result-publish/entry?edit=true&session_id=${encodeURIComponent(row.sessionId)}&subclass_id=${encodeURIComponent(row.subClassId)}&exam_id=${encodeURIComponent(row.examId)}`}
                        className="rounded px-2 py-1 text-sm font-semibold text-[#007af7] hover:bg-[#ddeffe]"
                      >
                        সম্পাদনা
                      </Link>
                      <button
                        type="button"
                        disabled
                        title="প্রকাশনা API যুক্ত হলে চালু হবে"
                        className="rounded px-2 py-1 text-sm font-semibold text-slate-400"
                      >
                        প্রকাশ করুন
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(row)}
                        className="rounded px-2 py-1 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? 'মুছছে…' : 'মুছুন'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <p className="text-base font-semibold text-slate-800">এই ফিল্টারে কোনো সারি নেই</p>
                    <p className="mt-1 text-sm text-slate-500">অন্য ফলাফলের ধরন বা অবস্থা নির্বাচন করে দেখুন।</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
          তালিকায় প্রতিটি target exam-এর পাশে joint result-এ অন্তর্ভুক্ত source exam-গুলো দেখানো হয়েছে।
        </div> */}
      </section>
    </main>
  );
}

JointResultList.propTypes = {
  pageTitle: PropTypes.string,
};
