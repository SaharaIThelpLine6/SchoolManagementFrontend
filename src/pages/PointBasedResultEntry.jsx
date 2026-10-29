import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import {
  useGetExamNamesQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

import useTranslate from '../utils/Translate';

import EditButton from '../components/Button/EditButton';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import {
  useGetExamListQuery,
} from '../features/result/resultSilce';
import { ViewPermission } from '../Routes/ViewPermission';

const PAGE_SIZE = 10;

const PointBasedResultEntry = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const navigate = useNavigate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;

  const [currentPage, setCurrentPage] = useState(1);

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  
  const session_id = watch('SessionID');
  const exam_id = watch('ExamID');
  const subclass_id = watch('SubClassID');

  const {
    data: examListData,
    isLoading,
    error,
  } = useGetExamListQuery(
    { session_id, exam_id, subclass_id },
    {
      skip: session_id === null && exam_id === null && subclass_id === null,
    }
  );

  const totalPages = Math.ceil((examListData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examListData?.slice(start, start + PAGE_SIZE) || [];
  }, [examListData, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Data Create Exam Fee Setting 
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'Session, SubClass এবং Exam নির্বাচন করুন।',
      });
      return;
    }

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      Fee: Number(data.Fee),
      SLID: data.SLID,
    };

    try {
      let response;
      if (data.ID) {
        response = await updateExamFeeSetting({
          id: data.ID,
          body: payload,
        }).unwrap();
      } else {
        response = await postExamFeeSetting(payload).unwrap();
      }

      Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: response?.message || 'Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।',
      }).then(() => {
        refetch();
        methods.reset();
      });
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        'অজানা একটি ত্রুটি ঘটেছে।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: errMsg,
      });
      console.error('Exam Fee Setting Error:', error);
    }
  };

  // Table Data Columns 
  const columns = [
    {
      title: translate('ID'),
      field: 'ID',
      hozAlign: 'center',
    },
    {
      title: translate('Session'),
      field: 'SessionID',
      hozAlign: 'center',
      render: (row) => row.Session?.SessionName,
    },
    {
      title: translate('Exam'),
      field: 'ExamID',
      hozAlign: 'center',
      render: (row) => row.Exam?.ExamName,
    },
    {
      title: translate('SubClass'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => row.SubClass?.SubClass,
    },
    {
      title: translate('Exam Type'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => row.ExamType == 1 ? "দরসিয়াত" : row.ExamType == 2 ? "হিফজ কন্ডিশন ভিত্তিক" : row.ExamType == 3 ? "গড়ে যা আসবে তাই" : "পয়েন্ট ভিত্তিক",
    },
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.result_entry}
            permissionType="edit"
            empty={true}
          >
            <EditButton
              onClick={() =>
                navigate(
                  `/dashboard/result/${row?.ID}?session_id=${row?.SessionID}&exam_id=${row?.ExamID}&subclass_id=${row?.SubClassID}`
                )
              }
            />
          </ViewPermission>
          <button
            className="p-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-md flex items-center gap-1 transition-colors shadow-sm"
            title="Print"
            onClick={() =>
              navigate(
                `/dashboard/result/mark-sheet/${row?.ID}?session_id=${row?.SessionID}&exam_id=${row?.ExamID}&subclass_id=${row?.SubClassID}`
              )
            }
          >
            <SvgIcon name={'TbPrinter'} size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* ---------- মডার্ন হেডার ---------- */}
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <h3 className="text-[19px] font-bold leading-tight text-white">
                {translate('Result Entry')}
              </h3>
              <p className="text-[12.5px] text-white/80">
                শিক্ষাবর্ষ, পরীক্ষা ও জামাত অনুযায়ী ফলাফল এন্ট্রি করুন
              </p>
            </div>
          </div>
        </div>

        {/* ---------- মেইন কন্টেন্ট ---------- */}
        <div className="p-5 md:p-6">
          
          {/* ফিল্টার সেকশন */}
          <FormProvider {...methods}>
            <form className="w-full mb-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...methods.register('ID')} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <DefaultSelect
                  label={translate('Session') + ' :'}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <DefaultSelect
                  label={translate('Exam Name') + ' :'}
                  options={examNameData ?? []}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                />
                <DefaultSelect
                  label={translate('Class/Jamaat') + ' :'}
                  options={subClassListData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                />
              </div>
            </form>
          </FormProvider>

          {/* টেবিল সেকশন */}
          <div className="mt-2">
            {isLoading ? (
              <div className="py-10"><Loading /></div>
            ) : error ? (
              <div className="text-red-500 text-center py-8 bg-red-50 rounded-xl border border-red-100">
                <p className="font-medium">{translate('Failed to load exam fee settings. Please try again.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <SortableTable
                  columns={columns}
                  data={paginatedData}
                  isFilterColumn={false}
                />
              </div>
            )}
          </div>

          {/* পেজিনেশন */}
          <div className="mt-6 border-t border-gray-100 pt-4">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PointBasedResultEntry;