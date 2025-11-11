import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import CopyButton from '../../../components/Button/CopyButton';
import DeleteButton from '../../../components/Button/DeleteButton';
import EditButton from '../../../components/Button/EditButton';
import SingleCheckbox from '../../../components/Checkboxes/SingleCheckbox';
import DefaultInput from '../../../components/Forms/DefaultInput';
import Loading from '../../../components/Loading/Loading';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import SortableTable from '../../../components/Tables/SortableTable';
import { setPageName } from '../../../features/auth/authSlice';
import {
  useDeleteAverageExamConditionSettingMutation,
  useGetAverageExamConditionAllQuery,
  usePostAverageExamConditionSettingMutation,
  useUpdateAverageExamConditionSettingMutation,
} from '../../../features/exam/examQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import useTranslate from '../../../utils/Translate';
import PointConditionFilteringForm from '../point-condition/PointConditionFilteringForm';
import FormColumn from './FormColumn';

const PAGE_SIZE = 10;

const AverageDetermination = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: null,
      ExamID: null,
      SubClassID: null,
      DivisionTopNumber: '',
      ...Object.fromEntries(
        Array.from({ length: 6 }).flatMap((_, i) => {
          const index = i + 1;
          return [
            [`DivisionNumber${index}`, ''],
            [`Division${index}`, ''],
            [`DivisionAra${index}`, ''],
            [`Color${index}`, false],
            [`TopNum${index}`, ''],
          ];
        })
      ),
    },
  });

  const { watch, handleSubmit, setValue, reset, getValues } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [averageDetermineFilter, setAverageDetermineFilter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [postAverageExamConditionSetting] =
    usePostAverageExamConditionSettingMutation();
  const [updateAverageExamConditionSetting] =
    useUpdateAverageExamConditionSettingMutation();
  const [deleteAverageExamConditionSetting] =
    useDeleteAverageExamConditionSettingMutation();

  const {
    data: averageExamConditionAllData = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAverageExamConditionAllQuery({
    SessionID: averageDetermineFilter?.SessionID || 'all',
    ExamID: averageDetermineFilter?.ExamID || 'all',
    SubClassID: averageDetermineFilter?.SubClassID || 'all',
  });

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

useEffect(() => {
  if (
    averageDetermineFilter?.SessionID &&
    averageDetermineFilter?.ExamID &&
    averageDetermineFilter?.SubClassID
  ) {
    // Get current form values
    const currentValues = getValues();

    // Reset form with only filter values, preserve other form data
    reset({
      ...currentValues, // Keep existing form data
      SessionID: averageDetermineFilter.SessionID,
      ExamID: averageDetermineFilter.ExamID,
      SubClassID: averageDetermineFilter.SubClassID,
    });
    setEditingId(null);
  }
}, [averageDetermineFilter, reset, getValues]);

  const examConditionData = useMemo(() => {
    if (!averageExamConditionAllData) return [];
    return Array.isArray(averageExamConditionAllData)
      ? averageExamConditionAllData
      : [averageExamConditionAllData];
  }, [averageExamConditionAllData]);

  const totalPages = Math.ceil(examConditionData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examConditionData.slice(start, start + PAGE_SIZE);
  }, [examConditionData, currentPage]);

  // ------------------ Handlers ------------------
  const handleEdit = (row) => {
    setEditingId(row.ID); // update mode
    setValue('DivisionTopNumber', row.DivisionTopNumber);

    Array.from({ length: 6 }).forEach((_, i) => {
      const index = i + 1;
      setValue(`DivisionNumber${index}`, row[`DivisionNumber${index}`]);
      setValue(`Division${index}`, row[`Division${index}`]);
      setValue(`DivisionAra${index}`, row[`DivisionAra${index}`]);
      setValue(`Color${index}`, row[`Color${index}`] || false);
      setValue(`TopNum${index}`, row.HifzCondition?.[`TopNum${index}`] || '');
    });
  };

  const handleCopyRowToForm = (row) => {
    setEditingId(null); // new mode


    setValue('DivisionTopNumber', row.DivisionTopNumber);

    Array.from({ length: 6 }).forEach((_, i) => {
      const index = i + 1;
      setValue(`DivisionNumber${index}`, row[`DivisionNumber${index}`]);
      setValue(`Division${index}`, row[`Division${index}`]);
      setValue(`DivisionAra${index}`, row[`DivisionAra${index}`]);
      setValue(`Color${index}`, row[`Color${index}`] || false);
      setValue(`TopNum${index}`, row.HifzCondition?.[`TopNum${index}`] || '');
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;

    Swal.fire({
      title: 'তুমি কি নিশ্চিত?',
      text: 'এই ডেটা মুছে ফেলা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলো!',
      cancelButtonText: 'বাতিল',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAverageExamConditionSetting(id).unwrap();
          Swal.fire({
            title: 'মুছে ফেলা হয়েছে!',
            text: 'ডেটাটি সফলভাবে মুছে ফেলা হয়েছে।',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire({
            title: 'ত্রুটি!',
            text: error?.data?.error || 'ডেটা মুছে ফেলা সম্ভব হয়নি।',
            icon: 'error',
          });
        }
      }
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        SessionID: averageDetermineFilter.SessionID,
        ExamID: averageDetermineFilter.ExamID,
        SubClassID: averageDetermineFilter.SubClassID,
      };

      let response;

      if (!editingId) {
        // New create
        response = await postAverageExamConditionSetting(payload).unwrap();
      } else {
        // Update
        response = await updateAverageExamConditionSetting(payload).unwrap();
      }

      Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: response?.message || 'গ্রুপ পরিবর্তন সফল হয়েছে।',
      }).then(() => {
        refetch();
        setSelectedRows([]);
        setEditingId(null);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি সৃজিত!',
        text: error?.data?.error || 'ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।',
      });
    }
  };

  // ------------------ Table Columns ------------------
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <CopyButton onClick={() => handleCopyRowToForm(row)} text="" />
          <EditButton onClick={() => handleEdit(row)} />
          <DeleteButton onClick={() => handleDelete(row.ID)} />
        </div>
      ),
    },
    { title: translate('SL'), field: 'ID', hozAlign: 'center' },
    {
      title: translate('Session'),
      field: 'SessionName',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.Session.SessionName),
    },
    {
      title: translate('Exam'),
      field: 'ExamID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.Exam.ExamName),
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClass',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.SubClass.SubClass),
    },
    ...Array.from({ length: 6 }).flatMap((_, i) => {
      const index = i + 1;
      return [
        {
          title: translate(`>=${index}`),
          field: `DivisionNumber${index}`,
          hozAlign: 'center',
        },
        {
          title: translate(`Division-${index}`),
          field: `Division${index}`,
          hozAlign: 'center',
        },
        {
          title: translate(`Division Arabic-${index}`),
          field: `DivisionAra${index}`,
          hozAlign: 'center',
        },
      ];
    }),
  ];

  // ------------------ Render ------------------
  return (
    <div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <PointConditionFilteringForm onFilter={setAverageDetermineFilter} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            {/* Score Threshold Inputs */}
            <div className="flex flex-col space-y-3">
              <DefaultInput
                registerKey="DivisionTopNumber"
                label={translate('Highest score')}
                type="number"
                labelPosition="left"
                require={'This is required!'}
              />
              {[...Array(6)].map((_, i) => (
                <DefaultInput
                  key={`score-threshold-${i + 1}`}
                  registerKey={`DivisionNumber${i + 1}`}
                  label={`${translate(i + 1 === 1 ? 'If >=' : 'Or If >=')}`}
                  type="number"
                  labelPosition="left"
                  require={'This is required!'}
                />
              ))}
            </div>

            {/* Bangla Columns */}
            <FormColumn
              title="Bangla"
              inputs={Array(6)
                .fill()
                .map((_, i) => ({
                  registerKey: `Division${i + 1}`,
                  label: 'তাহলে ডিভিশন',
                  type: 'text',
                }))}
            />

            {/* Arabic Columns */}
            <FormColumn
              title="Arabic"
              inputs={Array(6)
                .fill()
                .map((_, i) => ({
                  registerKey: `DivisionAra${i + 1}`,
                  type: 'text',
                }))}
            />

            {/* Top Score Checkboxes */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {translate('Highest recitation score')}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Array(6)
                  .fill()
                  .map((_, i) => (
                    <div key={i + 1} className="flex items-center gap-2">
                      <SingleCheckbox
                        label={translate('Silver Color')}
                        registerKey={`Color${i + 1}`}
                      />
                      <div className="flex-1">
                        <DefaultInput
                          registerKey={`TopNum${i + 1}`}
                          type="number"
                          placeholder={translate('Score value')}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="w-full flex gap-2 flex-wrap">
            <Button type="submit" className="w-full md:w-auto">
              {translate('Save')}
            </Button>
            {editingId && (
              <Button
                type="button"
                className="w-full md:w-auto !bg-[#ddd] !text-black"
                onClick={() => {
                  const { SessionID, ExamID, SubClassID } = getValues();
                  reset({ SessionID, ExamID, SubClassID });
                  setEditingId(null);
                }}
              >
                {translate('Reset')}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      {/* Table */}
      <div className="mt-5">
        {isLoading || isFetching ? (
          <Loading />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg">
            <div className="text-center py-8 text-red-500">
              {translate('Data Not Found')} {isError.message}
            </div>
          </div>
        ) : averageExamConditionAllData?.length > 0 ||
          paginatedData?.length > 0 ? (
          <>
            <SortableTable
              columns={columns}
              data={paginatedData || averageExamConditionAllData}
              isLoading={isLoading || isFetching}
              isFilterColumn={false}
            />
            {totalPages > 1 && (
              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-gray-500 text-xl">
              {averageDetermineFilter ||
              (averageDetermineFilter?.SessionID &&
                averageDetermineFilter?.ExamID &&
                averageDetermineFilter?.SubClassID)
                ? translate('No data available for the selected filters')
                : translate('Please select all filters to view data')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageDetermination;
