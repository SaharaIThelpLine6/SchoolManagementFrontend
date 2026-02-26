import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { examPointConditionStatus } from "../../../Data/userReportsData";
import Button from "../../../components/Button/Button";
import CopyButton from "../../../components/Button/CopyButton"; // Add this import
import DeleteButton from "../../../components/Button/DeleteButton";
import EditButton from "../../../components/Button/EditButton";
import ExamRoutingCheckbox from "../../../components/Checkboxes/ExamRoutingCheckbox";
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";
import DefaultInput from "../../../components/Forms/DefaultInput";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";
import SortableTable from "../../../components/Tables/SortableTable";
import { setPageName } from "../../../features/auth/authSlice";
import { useGetAcademicSubjectsQuery } from "../../../features/class/classQuerySlice";
import {
  useGetPointWiseExamConditionQuery,
  usePostExamPointConditionMutation,
  useUpdatePointWiseExamConditionMutation,
} from "../../../features/exam/examQuerySlice";
import useTranslate from "../../../utils/Translate";
import bnBijoy2Unicode from "../../../utils/conveter";
import StudentFeeGroup from "../../../view/exam/StudentFeeGroup";
import PointConditionFilteringForm from "./PointConditionFilteringForm";

const PAGE_SIZE = 10;

const PointCondition = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: null,
      ExamID: null,
      SubClassID: null,
      SubjectID: '',
      PassNumber: '',
      MeariAction: false,
      MaxNumber: '',
      ...Array.from({ length: 7 }).reduce(
        (acc, _, index) => ({
          ...acc,
          [`DivisionNumber${index}`]: '',
          [`Division${index}`]: '',
          [`Color${index}`]: false,
        }),
        {}
      ),
    },
  });

  const { watch, handleSubmit, reset, setValue, getValues } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [pointConditionFilter, setPointConditionFilter] = useState(null);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { data: subjectsListData } = useGetAcademicSubjectsQuery();

  const [postExamPointCondition] = usePostExamPointConditionMutation();
  const [updateExamPointCondition] = useUpdatePointWiseExamConditionMutation();

  const {
    data: examConditionResponse,
    isLoading: isExamConditionLoading,
    error: examConditionError,
    isFetching,
    refetch,
  } = useGetPointWiseExamConditionQuery(
    pointConditionFilter?.SessionID &&
      pointConditionFilter?.ExamID &&
      pointConditionFilter?.SubClassID
      ? {
          SessionID: pointConditionFilter?.SessionID,
          ExamID: pointConditionFilter?.ExamID,
          SubClassID: pointConditionFilter?.SubClassID,
        }
      : skipToken
  );
  const filteredSubjects =
    pointConditionFilter && pointConditionFilter.SubClassID
      ? (subjectsListData || []).filter(
          (subject) =>
            subject.SubClassID === Number(pointConditionFilter.SubClassID)
        )
      : subjectsListData || [];

  const examConditionData = useMemo(() => {
    if (!examConditionResponse) return [];
    return Array.isArray(examConditionResponse)
      ? examConditionResponse
      : [examConditionResponse];
  }, [examConditionResponse]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Reset form when filters change
  useEffect(() => {
    if (
      pointConditionFilter?.SessionID &&
      pointConditionFilter?.ExamID &&
      pointConditionFilter?.SubClassID
    ) {
      reset({
        SessionID: pointConditionFilter.SessionID,
        ExamID: pointConditionFilter.ExamID,
        SubClassID: pointConditionFilter.SubClassID,
        SubjectID: '',
        PassNumber: '',
        MeariAction: false,
        MaxNumber: '',
        ...Array.from({ length: 7 }).reduce(
          (acc, _, index) => ({
            ...acc,
            [`DivisionNumber${index}`]: '',
            [`Division${index}`]: '',
            [`Color${index}`]: false,
          }),
          {}
        ),
      });
      setEditingId(null);
    }
  }, [pointConditionFilter, reset]);

  const totalPages = Math.ceil(examConditionData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examConditionData.slice(start, start + PAGE_SIZE);
  }, [examConditionData, currentPage]);

  const handleEdit = (row) => {
    setEditingId(row.ID);
    setValue('SubjectID', row.BookID);
    setValue('PassNumber', row.PassNumber);
    setValue('MeariAction', row.MeariAction);
    setValue('MaxNumber', row.MaxNumber);

    for (let i = 0; i < 7; i++) {
      setValue(`DivisionNumber${i}`, row[`DivisionNumber${i + 1}`]);
      setValue(`Division${i}`, row[`Division${i + 1}`]);
      setValue(`Color${i}`, row[`Color${i + 1}`] !== null);
    }
  };

  // Add Copy functionality
  const handleCopyRowToForm = (row) => {
    console.log(row, 'row');
    setEditingId(null); // Set to null for new entry mode

    setValue('SubjectID', row.BookID);
    setValue('PassNumber', row.PassNumber);
    setValue('MeariAction', row.MeariAction);
    setValue('MaxNumber', row.MaxNumber);

    for (let i = 0; i < 7; i++) {
      setValue(`DivisionNumber${i}`, row[`DivisionNumber${i + 1}`]);
      setValue(`Division${i}`, row[`Division${i + 1}`]);
      setValue(`Color${i}`, row[`Color${i + 1}`] !== null);
    }
  };

  const handleCancelEdit = () => {
    const { SessionID, ExamID, SubClassID } = getValues();
    reset({
      SessionID,
      ExamID,
      SubClassID,
      SubjectID: '',
      PassNumber: '',
      MeariAction: false,
      MaxNumber: '',
      ...Array.from({ length: 7 }).reduce(
        (acc, _, index) => ({
          ...acc,
          [`DivisionNumber${index}`]: '',
          [`Division${index}`]: '',
          [`Color${index}`]: false,
        }),
        {}
      ),
    });
    setEditingId(null);
  };

  const onSubmit = async (data) => {
    const payload = {
      SessionID: pointConditionFilter.SessionID,
      ExamID: pointConditionFilter.ExamID,
      SubClassID: pointConditionFilter.SubClassID,
      BookID: data.SubjectID,
      MeariAction: data.MeariAction,
      PassNumber: data.PassNumber,
      MaxNumber: data.MaxNumber,
      DivisionNumber1: data.DivisionNumber0,
      DivisionNumber2: data.DivisionNumber1,
      DivisionNumber3: data.DivisionNumber2,
      DivisionNumber4: data.DivisionNumber3,
      DivisionNumber5: data.DivisionNumber4,
      DivisionNumber6: data.DivisionNumber5,
      DivisionNumber7: data.DivisionNumber6,
      Division1: data.Division0,
      Color1: data.Color0 ? 1 : null,
      Division2: data.Division1,
      Color2: data.Color1 ? 1 : null,
      Division3: data.Division2,
      Color3: data.Color2 ? 1 : null,
      Division4: data.Division3,
      Color4: data.Color3 ? 1 : null,
      Division5: data.Division4,
      Color5: data.Color4 ? 1 : null,
      Division6: data.Division5,
      Color6: data.Color5 ? 1 : null,
      Division7: data.Division6,
      Color7: data.Color6 ? 1 : null,
    };

    try {
      if (editingId) {
        await updateExamPointCondition({ ...payload, ID: editingId }).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'আপডেট সফল হয়েছে!',
          text: 'তথ্যটি সফলভাবে আপডেট করা হয়েছে।',
        });
      } else {
        await postExamPointCondition(payload).unwrap();
        Swal.fire({
          icon: 'success',
          title: 'সংরক্ষণ সফল হয়েছে!',
          text: 'তথ্যটি সফলভাবে সংরক্ষণ করা হয়েছে।',
        });
      }

      await refetch();
      handleCancelEdit();
    } catch (error) {
      const errMsg =
        error?.data?.error ||
        (editingId
          ? 'তথ্য আপডেটে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'তথ্য সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ হয়েছে!',
        text: errMsg,
      });
    }
  };

  const handleDelete = async (id) => {
    // Your delete implementation here
  };

  // Update columns to include CopyButton
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
    { title: 'SL', field: 'ID', hozAlign: 'center' },
    {
      title: translate('Session'),
      field: 'SessionID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row?.Session?.SessionName) || '',
    },
    {
      title: translate('Exam Name'),
      field: 'ExamID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row?.Exam?.ExamName) || '',
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row?.SubClass?.ClassName) || '',
    },
    {
      title: translate('Subject'),
      field: 'SubjectID',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row?.Subject?.SubjectName) || '',
    },
    {
      title: translate('Pass Number'),
      field: 'PassNumber',
      hozAlign: 'center',
    },
    { title: translate('Max Number'), field: 'MaxNumber', hozAlign: 'center' },
    {
      title: translate('Meari Action'),
      field: 'MeariAction',
      hozAlign: 'center',
      render: (row) => (row.MeariAction ? '✔️' : '❌'),
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  return (
    <div className="bg-white">
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <PointConditionFilteringForm onFilter={setPointConditionFilter} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-5">
            <DefaultSelect
              label={translate('Subject')}
              options={filteredSubjects ?? []}
              valueField="SubjectID"
              nameField="SubjectName"
              registerKey="SubjectID"
              require={'This is required!'}
              disabled={editingId ? true : false}
            />{' '}
            <DefaultInput
              registerKey="PassNumber"
              label={translate('Pass Number')}
              type="number"
              require={'This is required!'}
            />
            <div className="sm:col-span-2">
              <ExamRoutingCheckbox
                label={translate('Point Condition Status')}
                options={examPointConditionStatus}
                registerKey="MeariAction"
                value={watch('MeariAction')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            <div className="flex flex-col space-y-3">
              <DefaultInput
                registerKey="MaxNumber"
                label={translate('Highest score')}
                type="number"
                labelPosition="left"
                require={'This is required!'}
              />
              {[...Array(7)].map((_, index) => (
                <DefaultInput
                  key={`score-threshold-${index}`}
                  registerKey={`DivisionNumber${index}`}
                  label={`${translate(index === 0 ? 'If >=' : 'Or If >=')}`}
                  type="number"
                  labelPosition="left"
                  require={'This is required!'}
                />
              ))}
            </div>

            <div className="col-span-2 flex flex-col justify-end space-y-4">
              {[...Array(7)].map((_, index) => (
                <div
                  key={`division-row-${index}`}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={`Division${index}`}
                      label={translate('Then Division')}
                      type="text"
                      labelPosition="left"
                      require={'This is required!'}
                    />
                  </div>
                  <div className="flex items-center">
                    <SingleCheckbox
                      label={translate('Silver Color')}
                      registerKey={`Color${index}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex gap-4">
            <Button type="submit" className="w-full md:w-auto">
              {editingId ? translate('Update') : translate('Save')}
            </Button>
            <Button
              type="button"
              className="w-full md:w-auto !bg-[#22c55e] text-white"
              onClick={handleCancelEdit}
            >
              {translate('Reset')}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Table section with loading/error states */}
      <div className="mt-5">
        {isExamConditionLoading || isFetching ? (
          <div className="text-center py-8">Loading table data...</div>
        ) : examConditionError ? (
          <div className="text-center py-8 text-red-500">
            Error loading table data: {examConditionError.message}
          </div>
        ) : examConditionData.length > 0 ? (
          <>
            <SortableTable columns={columns} data={paginatedData} />

            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-8">
            {pointConditionFilter
              ? translate('No data available for the selected filters')
              : translate('Please select filters to view exam conditions')}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointCondition;
