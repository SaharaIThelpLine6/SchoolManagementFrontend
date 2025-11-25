import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import {
  useDeleteExamFeeSettingMutation,
  useGetExamFeeSettingQuery,
  useGetExamNamesQuery,
  useGetExamRoutineQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

import useTranslate from '../utils/Translate';
import bnBijoy2Unicode from '../utils/conveter';

import { permissionsDataList } from '../Data/permissions';
import { ViewPermission } from '../Routes/ViewPermission';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import ExamRoutingCheckbox from '../components/Checkboxes/ExamRoutingCheckbox';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import AllClassRoutingPDF from '../view/exam/ExamRouting/AllClassRoutingPDF';
import ExamSignatureRoutingPDF from '../view/exam/ExamRouting/ExamSignatureRoutingPDF';
import SingleClassRoutingPDF from '../view/exam/ExamRouting/SingleClassRoutingPDF';
import StudentFeeGroup from '../view/exam/StudentFeeGroup';

const PAGE_SIZE = 10;

const ExamRouting = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  // Create an array to track visibility for each select (12 columns)
  const [visibility, setVisibility] = useState(Array(12).fill(true));

  const toggleVisibility = (index) => {
    const newVisibility = [...visibility];
    newVisibility[index] = !newVisibility[index];
    setVisibility(newVisibility);
  };
  const [printView, setPrintView] = useState(false);
  const [SessionID = '', ExamID = '', SubClassID = '', PrintID = ''] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
    'PrintID',
  ]);

  const { data, isLoading, isError, error } = useGetExamRoutineQuery({
    sessionID: SessionID,
    examID: ExamID,
    subclassID: SubClassID,
    printID: PrintID,
  });

  // console.log(data, 'data');

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();
  const [deleteExamFeeSetting] = useDeleteExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  console.log(examFeeSettingData, 'examFeeSettdwsingData');

  // console.log(examFeeSettingData, 'examFeeSettingData');

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Update Handle
  const handleEdit = (row) => {
    methods.reset({
      ID: row.ID,
      SessionID: row.SessionID,
      ExamID: row.ExamID,
      SubClassID: row.SubClassID,
      Fee: row.Fee,
      SLID: row.SLID,
    });
  };

  // Delete Exam Feee Setting data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteExamFeeSetting(id).unwrap();

        Swal.fire({
          icon: 'success',
          title: 'সফলভাবে মুছে ফেলা হয়েছে',
          text: response?.message || 'ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
        });

        refetch(); // Reload table
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি ঘটেছে!',
          text:
            error?.data?.message ||
            error?.data?.error ||
            'ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।',
        });
        console.error('Delete error:', error);
      }
    }
  };
  /** ------------------------
   *  SMART PRINT HANDLER (PERFECT)
   * ------------------------ */
  const handlePrintView = () => {
    // ---- Validation ----
    if (!SessionID || !ExamID || !SubClassID) {
      Swal.fire(
        'Warning!',
        'Session, Exam, SubClass নির্বাচন করুন।',
        'warning'
      );
      return;
    }

    if (!PrintID) {
      Swal.fire('Warning!', 'Report টাইপ নির্বাচন করুন।', 'warning');
      return;
    }

    // ---- Loading popup ----
    Swal.fire({
      title: 'লোড হচ্ছে...',
      text: 'ডাটা লোড হওয়া পর্যন্ত অপেক্ষা করুন',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ---- Wait until API finished ----
    const waitForData = setInterval(() => {
      if (!isLoading) {
        clearInterval(waitForData);
        console.log(isError, data?.data, '!data?.data');

        if (!data?.data || data?.data?.length === 0) {
          Swal.fire(
            'Error!',
            'রুটিন পাওয়া যায়নি অথবা সার্ভারে সমস্যা হয়েছে',
            'error'
          );
          return;
        }

        Swal.close(); // remove loading

        // ---- Ready to Print ----
        setPrintView(true);

        setTimeout(() => {
          window.print();
        }, 500); // ensure component rendered fully
      }
    }, 100); // check every 100ms
  };

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
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.routine_with_signature}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEdit(row)} />
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.routine_with_signature}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDelete(row.ID)} />
          </ViewPermission>
        </div>
      ),
    },
    {
      title: translate('ID'),
      hozAlign: 'center',
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate('Session'),
      hozAlign: 'center',
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate('Exam Name'),
      hozAlign: 'center',
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate('Class/Jamaat'),
      hozAlign: 'center',
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate('Fee Name'),
      field: 'SLID',
      hozAlign: 'center',
    },
    {
      title: translate('Fee'),
      field: 'Fee',
      hozAlign: 'center',
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }
  const dateOptions = [
    { id: 1, name: 'Copy To All Box' }, // You can add more options if needed
  ];

  const printData = [
    {
      PrintID: 1,
      PrintName: 'প্রতি ক্লাস প্রতি পৃষ্ঠায় আলাদা বাংলা A5।',
    },
    {
      PrintID: 2,
      PrintName: 'প্রতি ক্লাস প্রতি পৃষ্ঠায় আলাদা বাংলা A4।',
    },
    {
      PrintID: 3,
      PrintName: 'সকল ক্লাস একত্রে বাংলা A5।',
    },
    {
      PrintID: 4,
      PrintName: 'সকল ক্লাস একত্রে বাংলা A4।',
    },
    {
      PrintID: 5,
      PrintName: 'স্বাক্ষর/দস্তখত পত্র',
    },
  ];

  return (
    <div className="">
      <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg print:hidden">
        {/* Header */}
        <div className="filter_header border-b border-[#e9edf4] pb-4 md:pb-5">
          <h3 className="text-lg md:text-xl font-bold">
            {translate('Exam Routing')}
          </h3>
        </div>

        <FormProvider {...methods}>
          <form
            className="w-full space-y-4 md:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input type="hidden" {...methods.register('ID')} />

            {/* Top Section - 4 responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 my-3">
              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Exam Name')}
                options={examNameData ?? []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Class/Jamaat')}
                options={subClassListData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode={true}
              />

              <div className="grid grid-cols-2 gap-3">
                <DefaultInput
                  registerKey="Fee"
                  label={`${translate('Hall No')}`}
                  className="w-full"
                />
                <DefaultInput
                  registerKey="Fee"
                  label={`${translate('Hall Name')}`}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Checkbox */}
            <div className="flex items-start w-full mb-4">
              <ExamRoutingCheckbox
                label="পরীক্ষার তারিখ"
                options={dateOptions}
                registerKey="copyToAll"
                labelPosition="left"
              />
            </div>

            {/* Grid Sections */}
            <div className="space-y-4">
              <div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <DefaultInput key={`time-${i}`} registerKey="Fee" />
                  ))}
                </div>
              </div>
              {/* First 12-column grid */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('বার')}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <DefaultInput key={`time-${i}`} registerKey="Fee" />
                  ))}
                </div>
              </div>

              {/* Second 12-column grid */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('সময়')}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <DefaultInput key={`duration-${i}`} registerKey="Fee" />
                  ))}
                </div>
              </div>

              {/* Select with Toggle */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('বিষয়')}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div
                      key={`select-${index}`}
                      className="flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="checkbox"
                          checked={!visibility[index]}
                          onChange={() => toggleVisibility(index)}
                          className="cursor-pointer h-4 w-4"
                        />
                        <label
                          className="text-xs cursor-pointer"
                          onClick={() => toggleVisibility(index)}
                        >
                          {visibility[index] ? 'Hide' : 'Show'}
                        </label>
                      </div>
                      {visibility[index] && (
                        <DefaultSelect
                          options={examNameData ?? []}
                          valueField="ExamID"
                          nameField="ExamName"
                          registerKey={`ExamID_${index}`}
                          unicode={true}
                          className="w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <ViewPermission
                permissionId={permissionsDataList.routine_with_signature}
                permissionType="insert"
                empty={true}
              >
                <Button type="submit" className="w-full sm:w-auto">
                  {translate('Save')}
                </Button>
              </ViewPermission>
              <Button
                type="button"
                onClick={() =>
                  methods.reset({
                    SLID: '',
                    SessionID: '',
                    ExamID: '',
                    SubClassID: '',
                    Fee: '',
                  })
                }
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              >
                {translate('Reset')}
              </Button>
              <div className="w-64">
                <DefaultSelect
                  label={translate('Report/Type')}
                  labelPosition="left"
                  options={printData ?? []}
                  valueField="PrintID"
                  nameField="PrintName"
                  registerKey="PrintID"
                />
              </div>
              <Button
                type="button"
                onClick={handlePrintView}
                className="w-full sm:w-auto"
              >
                {translate('Print')}
              </Button>
            </div>
          </form>
        </FormProvider>

        {/* Table Section */}
        <div className="mt-5 overflow-x-auto">
          {isExamFeeSettingLoading ? (
            <Loading />
          ) : isExamFeeSettingError ? (
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

        {/* Pagination */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <div className="hidden print:block">
        {printView && (
          <>
            {Number(PrintID) === 1 && (
              <SingleClassRoutingPDF data={data?.data} pageSize="A5" />
            )}
            {Number(PrintID) === 2 && (
              <SingleClassRoutingPDF data={data?.data} pageSize="A4" />
            )}
            {Number(PrintID) === 3 && <AllClassRoutingPDF data={data?.data} />}
            {Number(PrintID) === 4 && <AllClassRoutingPDF data={data?.data} />}
            {Number(PrintID) === 5 && (
              <ExamSignatureRoutingPDF data={data?.data} />
            )}
          </>
        )}
      </div>
      ;
    </div>
  );
};

export default ExamRouting;
