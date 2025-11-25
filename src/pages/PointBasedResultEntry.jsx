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

import bnBijoy2Unicode from '../utils/conveter';
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
  useUpdateExamListStatusUpdateMutation,
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
  const [updateStatus] = useUpdateExamListStatusUpdateMutation();

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

  // console.log(session_id, exam_id, subclass_id, "Ids");
  // console.log(examListData, "examListData");

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

  const handleStatusUpdate = async (id, currentPublished) => {
    const newPublished = !currentPublished;
    const confirmResult = await Swal.fire({
      title: `Are you sure you want to mark as ${
        newPublished ? 'Published' : 'Unpublished'
      }?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await updateStatus({ id, published: newPublished }).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Status has been ${newPublished ? 'published' : 'unpublished'}.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Update failed. Please try again.',
      });
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
      render: (row) => bnBijoy2Unicode(row.Session?.SessionName),
    },
    {
      title: translate('Exam'),
      field: 'ExamID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.Exam?.ExamName),
    },
    {
      title: translate('SubClass'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.Class?.SubClass),
    },
    {
      title: translate('Status'),
      field: 'Published',
      hozAlign: 'center',
      render: (row) => {
        const isPublished = row?.Published;
        return (
          <ViewPermission
            permissionId={permissionsDataList.result_entry}
            permissionType="edit"
            empty={true}
          >
            <button
              className={`px-3 py-1 rounded text-sm font-medium ${
                isPublished
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
              onClick={() => handleStatusUpdate(row.ID, isPublished)}
              disabled={isLoading}
            >
              {isLoading
                ? 'Updating...'
                : isPublished
                ? 'প্রকাশিত'
                : 'অপ্রকাশিত'}
            </button>
          </ViewPermission>
        );
      },
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
                  `/result/${row?.ID}?session_id=${row?.SessionID}&exam_id=${row?.ExamID}&subclass_id=${row?.SubClassID}`
                )
              }
            />
          </ViewPermission>
          <button
            className="p-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-md flex items-center gap-1"
            title="Print"
            onClick={() =>
              navigate(
                `/result/mark-sheet/${row?.ID}?session_id=${row?.SessionID}&exam_id=${row?.ExamID}&subclass_id=${row?.SubClassID}`
              )
            }
          >
            <SvgIcon name={'MdLocalPrintshop'} size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between pt-5">
        <h3 className="text-base sm:text-[20px] font-bold">
          {translate('Point Result Entry')}
        </h3>{' '}
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...methods.register('ID')} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <DefaultSelect
              label={translate('Session') + ':'}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode={true}
            />
            <DefaultSelect
              label={translate('Exam Name') + ':'}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode={true}
            />
            <DefaultSelect
              label={translate('Class/Jamaat') + ':'}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
            />
          </div>
        </form>
      </FormProvider>

      <div className="mt-5">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-red-500 text-center py-4">
            {translate('Failed to load exam fee settings. Please try again.')}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default PointBasedResultEntry;
