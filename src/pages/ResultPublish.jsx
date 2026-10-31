import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import { setPageName } from '../features/auth/authSlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useGetExamListQuery,
  useUpdateExamListStatusUpdateMutation,
} from '../features/result/resultSilce';

import useTranslate from '../utils/Translate';

import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { permissionsDataList } from '../Data/permissions';
import { ViewPermission } from '../Routes/ViewPermission';

const ResultPublish = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, register } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  // মোবাইলে ১ কলাম, কম্পিউটারে ২ কলাম সাপোর্ট করার জন্য
  const columnCount = 2;
  const PAGE_SIZE = columnCount === 2 ? 20 : 10;

  const [updateStatus] = useUpdateExamListStatusUpdateMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const session_id = watch('SessionID');
  const exam_id = watch('ExamID');
  const publishStatus = watch('PublishStatus');

  const {
    data: examListData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetExamListQuery(
    { session_id, exam_id },
    {
      skip: session_id === null && exam_id === null,
    }
  );

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ফিল্টার বদলালে প্রথম পেজে ফিরে আসবে
  useEffect(() => {
    setCurrentPage(1);
  }, [session_id, exam_id, publishStatus]);

  // ফিল্টার (search ও sort বাদ দেওয়া হয়েছে)
  const processedData = useMemo(() => {
    let rows = [...(examListData || [])];

    if (publishStatus === 'published') {
      rows = rows.filter((row) => row?.Published);
    } else if (publishStatus === 'unpublished') {
      rows = rows.filter((row) => !row?.Published);
    }

    return rows;
  }, [examListData, publishStatus]);

  const totalPages = Math.ceil((processedData.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedData.slice(start, start + PAGE_SIZE);
  }, [processedData, currentPage, PAGE_SIZE]);

  // ২ ভাগে ভাগ — বাম কলাম ও ডান কলাম
  const [leftRows, rightRows] = useMemo(() => {
    if (columnCount === 1) return [paginatedData, []];
    const half = Math.ceil(paginatedData.length / 2);
    return [paginatedData.slice(0, half), paginatedData.slice(half)];
  }, [paginatedData, columnCount]);

  const publishedCount = processedData.filter((row) => row?.Published).length;

  // কনফার্মেশন ছাড়াই সরাসরি অন/অফ — শুধু শেষে সাকসেস মেসেজ
  const handleStatusUpdate = async (id, currentPublished, className) => {
    if (updatingId) return; // একসাথে একাধিক ক্লিক আটকাবে

    const newPublished = !currentPublished;
    const name = className || 'এই';

    try {
      setUpdatingId(id);
      await updateStatus({ id, published: newPublished }).unwrap();

      Swal.fire({
        icon: 'success',
        title: newPublished
          ? 'ফলাফল প্রকাশিত হয়েছে'
          : 'ফলাফল প্রকাশ বন্ধ করা হয়েছে',
        html: newPublished
          ? `<div style="font-size:15px;line-height:1.9;color:#374151">
               <b style="color:#4F46E5">${name}</b> — এই ক্লাসের সকল ফলাফল প্রকাশ করা হয়েছে।<br/>
               এখন থেকে ওয়েবসাইটে ও অভিভাবক অ্যাপসে শিক্ষার্থীরা দেখতে পারবেন।
             </div>`
          : `<div style="font-size:15px;line-height:1.9;color:#374151">
               <b style="color:#DC2626">${name}</b> — এই ক্লাসের ফলাফল প্রকাশ বন্ধ করা হয়েছে।<br/>
               এখন থেকে ওয়েবসাইটে ও অভিভাবক অ্যাপসে শিক্ষার্থীরা আর দেখতে পারবেন না।
             </div>`,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: newPublished ? '#4F46E5' : '#DC2626',
        customClass: { popup: 'font-SolaimanLipi' },
      });

      refetch();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: 'আপডেট করা যায়নি। আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
        customClass: { popup: 'font-SolaimanLipi' },
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ---------- ছোট ছোট UI পার্টস ----------

  const selectClass =
    'w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

  const FieldLabel = ({ children, required }) => (
    <label className="mb-1.5 block text-[13px] font-bold text-gray-700">
      {children} {required && <span className="text-red-500">*</span>} :
    </label>
  );

  const renderTable = (rows, offset) => (
    /* ⭐ টেবিলের ব্যাকগ্রাউন্ড সাদা (bg-white) রাখা হয়েছে */
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-indigo-50 text-gray-700">
            <th className="w-20 px-3 py-3 text-center text-[13px] font-bold">
              ক্রমিক
            </th>
            <th className="px-3 py-3 text-center text-[13px] font-bold">
              সাব ক্লাস
            </th>
            <th className="w-44 px-3 py-3 text-center text-[13px] font-bold">
              স্ট্যাটাস
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-3 py-8 text-center text-gray-400">
                কোনো তথ্য পাওয়া যায়নি
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const isPublished = row?.Published;
              const subClassName = row?.SubClass?.SubClass;
              return (
                <tr
                  key={row?.ID}
                  className="border-t border-gray-100 transition hover:bg-indigo-50/40"
                >
                  <td className="px-3 py-3 text-center text-gray-500">
                    {(currentPage - 1) * PAGE_SIZE + offset + index + 1}
                  </td>
                  <td className="px-3 py-3 text-center font-medium text-gray-800">
                    {subClassName}
                  </td>

                  {/* স্ট্যাটাস কলাম */}
                  <td className="px-3 py-3 text-center">
                    <ViewPermission
                      permissionId={permissionsDataList.result_entry}
                      permissionType="edit"
                      empty={true}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {isPublished ? 'প্রকাশিত' : 'অপ্রকাশিত'}
                        </span>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={isPublished}
                          title={
                            isPublished
                              ? 'প্রকাশ বন্ধ করতে ক্লিক করুন'
                              : 'প্রকাশ করতে ক্লিক করুন'
                          }
                          onClick={() =>
                            handleStatusUpdate(row.ID, isPublished, subClassName)
                          }
                          disabled={updatingId === row.ID}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            isPublished ? 'bg-green-500' : 'bg-gray-300'
                          } ${
                            updatingId === row.ID
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              isPublished ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </ViewPermission>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="font-SolaimanLipi overflow-hidden rounded-xl bg-transparent">
      {/* ---------- হেডার ---------- */}
      <div className="flex flex-col gap-3 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h3 className="text-[19px] font-bold leading-tight text-white">
              ফলাফল প্রকাশ
            </h3>
            <p className="text-[12.5px] text-white/80">
              শিক্ষাবর্ষ ও পরীক্ষা অনুযায়ী জামাতের ফলাফল প্রকাশ করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-white/20 px-3 py-2 text-[13px] font-semibold text-white">
            প্রকাশিত: {publishedCount} / {processedData.length}
          </span>
        </div>
      </div>

      <div className="p-5 md:p-4">
        {/* ⭐ ফিল্টার সেকশনকে একটি সাদা ডিভ এর ভেতরে রাখা হয়েছে */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <FormProvider {...methods}>
            <form className="w-full">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <FieldLabel required>শিক্ষাবর্ষ</FieldLabel>
                  <select className={selectClass} {...register('SessionID')}>
                    <option value="">নির্বাচন করুন</option>
                    {(sessionData ?? []).map((item) => (
                      <option key={item.SessionID} value={item.SessionID}>
                        {item.SessionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel required>পরীক্ষার নাম</FieldLabel>
                  <select className={selectClass} {...register('ExamID')}>
                    <option value="">নির্বাচন করুন</option>
                    {(examNameData ?? []).map((item) => (
                      <option key={item.ExamID} value={item.ExamID}>
                        {item.ExamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>অবস্থা</FieldLabel>
                  <select className={selectClass} {...register('PublishStatus')}>
                    <option value="">সকল</option>
                    <option value="published">প্রকাশিত</option>
                    <option value="unpublished">অপ্রকাশিত</option>
                  </select>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>

        {/* ---------- টেবিল ---------- */}
        <div className="mt-5">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 py-4 text-center text-red-500">
              তালিকা লোড করা যায়নি। আবার চেষ্টা করুন।
            </div>
          ) : (
            /* ⭐ মোবাইলে ১ কলাম (সিঙ্গেল টেবিল) এবং কম্পিউটারে ২ কলাম */
            <div
              className={`grid gap-4 ${
                columnCount === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
              }`}
            >
              {renderTable(leftRows, 0)}
              {columnCount === 2 &&
                rightRows.length > 0 &&
                renderTable(rightRows, leftRows.length)}
            </div>
          )}
        </div>

        {/* ⭐ Pagination যুক্ত করা হয়েছে */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ResultPublish;