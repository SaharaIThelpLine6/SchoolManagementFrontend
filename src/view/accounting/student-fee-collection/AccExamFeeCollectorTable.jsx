import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Loading from '../../../components/Loading/Loading';
import SortableTable from '../../../components/Tables/SortableTable';
import { setPageName } from '../../../features/auth/authSlice';
import useTranslate from '../../../utils/Translate';

import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import { useGetExamSeparateFeeFilterQuery } from '../../../features/feeCollection/feeCollectionSlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetExamNamesQuery } from '../../../features/student/studentQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

const PAGE_SIZE = 10;

const AccExamFeeCollectorTable = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 React Hook Form
  const methods = useForm({
    defaultValues: {
      FilterID: '',
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      SessionID: '',
      ExamID: '',
      SubClassID: '',
      type: '',
    },
  });

  const { watch, handleSubmit, reset } = methods;
  const [FilterID, DateFrom, DateTo, UserCode, SessionID, ExamID, SubClassID] =
    watch([
      'FilterID',
      'DateFrom',
      'DateTo',
      'UserCode',
      'SessionID',
      'ExamID',
      'SubClassID',
    ]);

  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 RTK Query
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetExamSeparateFeeFilterQuery(filters);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: examNames = [], isLoading: examIsLoading } =
    useGetExamNamesQuery();

  // 🔹 Set page title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // 🔹 Pagination
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  // 🔹 Filter submit
  const onFilterSubmit = useCallback(
    (formData) => {
      const {
        FilterID,
        DateFrom,
        DateTo,
        UserCode,
        SessionID,
        ExamID,
        SubClassID,
      } = formData;
      const newFilters = {};

      if (Number(FilterID) === 1 && UserCode) {
        newFilters.type = 'code';
        newFilters.UserCode = UserCode;
      }
      if (Number(FilterID) === 2 && SessionID) {
        newFilters.type = 'session';
        newFilters.SessionID = SessionID;
      }
      if (Number(FilterID) === 3 && SessionID && ExamID) {
        newFilters.type = 'exam';
        newFilters.SessionID = SessionID;
        newFilters.ExamID = ExamID;
      }
      if (Number(FilterID) === 4 && SessionID && ExamID && SubClassID) {
        newFilters.type = 'class';
        newFilters.SessionID = SessionID;
        newFilters.ExamID = ExamID;
        newFilters.SubClassID = SubClassID;
      }
      if (Number(FilterID) === 5 && DateFrom && DateTo) {
        newFilters.type = 'date';
        newFilters.DateFrom = DateFrom;
        newFilters.DateTo = DateTo;
      }

      setFilters(newFilters);
      setCurrentPage(1);
    },
    [setFilters]
  );

  // 🔹 Reset Filter
  const handleResetFilter = useCallback(() => {
    reset({
      FilterID: '',
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      SessionID: '',
      ExamID: '',
      SubClassID: '',
      type: '',
    });
    setFilters({});
    setCurrentPage(1);
  }, [reset]);

  // 🔹 Table Columns
  const columns = [
    {
      title: translate('Sequential'),
      field: 'AdmissionSerial',
      hozAlign: 'center',
    },

    { title: translate('Session'), field: 'SessionName', hozAlign: 'center' },
    {
      title: translate('Exam Name'),
      field: 'ExamName',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.ExamName),
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClass',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.SubClass),
    },
    {
      title: translate('User Code'),
      field: 'UserCode',
      hozAlign: 'center',
    },
    {
      title: translate('Name'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => bnBijoy2Unicode(row.UserName),
    },
    { title: translate('Prescribed Fee'), field: 'Fee', hozAlign: 'center' },
    { title: translate('Deduction'), field: 'Less', hozAlign: 'center' },
    { title: translate('Received'), field: 'PayAmount', hozAlign: 'center' },
    { title: translate('Due'), field: 'Due', hozAlign: 'center' },
  ];

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load exam fee data</p>;

  const filterData = [
    { FilterID: 1, name: translate('User ID') },
    { FilterID: 2, name: translate('Session') },
    { FilterID: 3, name: translate('Exam') },
    { FilterID: 4, name: translate('Class') },
    { FilterID: 5, name: translate('Date') },
  ];

  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white md:p-4 rounded-xl shadow-lg my-5">
        <form onSubmit={handleSubmit(onFilterSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br px-2 from-blue-50 to-blue-100 shadow-lg rounded-xl py-5 gap-5">
            <DefaultSelect
              label={translate('Filter')}
              labelPosition="left"
              options={filterData}
              valueField="FilterID"
              nameField="name"
              registerKey="FilterID"
            />

            {/* 🔹 Filter by Date */}
            {Number(FilterID) === 5 && (
              <div className="flex justify-center items-center flex-col sm:flex-row gap-4">
                <DatePickerOne
                  registerKey="DateFrom"
                  placeholder="তারিখ থেকে"
                />
                <DatePickerOne
                  registerKey="DateTo"
                  placeholder="তারিখ পর্যন্ত"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
                >
                  Show
                </Button>
              </div>
            )}

            {/* 🔹 Filter by Exam */}
            {Number(FilterID) === 3 && (
              <div className="flex justify-center items-center flex-row gap-4">
                <DefaultSelect
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <DefaultSelect
                  options={examNames}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                  unicode
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
                >
                  Show
                </Button>
              </div>
            )}

            {/* 🔹 Filter by Class */}
            {Number(FilterID) === 4 && (
              <div className="flex justify-center items-center flex-row gap-4">
                <DefaultSelect
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <DefaultSelect
                  options={examNames}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                  unicode
                />
                <DefaultSelect
                  options={subClassData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
                >
                  Show
                </Button>
              </div>
            )}

            {/* 🔹 Filter by UserCode */}
            {Number(FilterID) === 1 && (
              <div className="flex items-center gap-4">
                <DefaultInput
                  registerKey="UserCode"
                  placeholder="শিক্ষার্থীর আইডি লিখুন"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
                >
                  Show
                </Button>
              </div>
            )}

            {/* 🔹 Filter by Session */}
            {Number(FilterID) === 2 && (
              <div className="flex items-center gap-4">
                <DefaultSelect
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
                >
                  Show
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* 🔹 Table */}
        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />

        {/* 🔹 Pagination */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </FormProvider>
  );
};

export default AccExamFeeCollectorTable;
