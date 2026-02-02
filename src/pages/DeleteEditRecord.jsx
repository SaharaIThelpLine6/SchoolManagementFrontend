import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { useGetEditDeleteRecordsQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import { formatDateToYMD } from '../utils/dateFormat';

const PAGE_SIZE = 10;

const DeleteEditRecord = () => {
  const location = useLocation();
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: {
      accountType: null,
      dataType: null,
      fromDate: '',
      toDate: '',
    },
  });
  const { watch } = methods;

  const [currentPage, setCurrentPage] = useState(1);

  const watchedValues = watch([
    'accountType',
    'dataType',
    'fromDate',
    'toDate',
  ]);
  const [accountTypeValue, dataTypeValue, fromDate, toDate] = watchedValues;
  const startDateString = formatDateToYMD(fromDate) || '';
  const endDateString = formatDateToYMD(toDate) || '';

  // Memoize query params to avoid unnecessary re-renders
  const queryParams = useMemo(
    () => ({
      monthFilter: accountTypeValue,
      dataType: dataTypeValue,
      startDate: startDateString,
      endDate: endDateString,
    }),
    [accountTypeValue, dataTypeValue, startDateString, endDateString]
  );
  // -------- API Call --------
  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetEditDeleteRecordsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const data = apiResponse?.editDeleteData ?? [];
  const totalCount = apiResponse?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // -------- Pagination --------
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  // -------- Loading & Error --------
  if (isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-500">
        {translate('Failed to load delete/edit record data')}
      </p>
    );

  // -------- Table Columns --------
  const columns = [
    {
      title: translate('শি:আইডি'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => row.ID,
    },
    {
      title: translate('রসিদ'),
      field: 'Vouchers',
      hozAlign: 'center',
      render: (row) => row.OrderNo ?? '-',
    },
    {
      title: translate('Date'),
      field: 'Date',
      hozAlign: 'center',
      render: (row) =>
        row.Date ? new Date(row.Date).toLocaleDateString() : '-',
    },
    {
      title: translate('Fee Name'),
      field: 'FeeName',
      hozAlign: 'center',
      render: (row) => row.FeeName ?? '-',
    },
    {
      title: translate('Fee Name'),
      field: 'MonthName',
      hozAlign: 'center',
      render: (row) => row?.MonthInfo?.MonthName ?? '-',
    },
    {
      title: translate('Prescribed Fee'),
      field: 'Fixedfee',
      hozAlign: 'center',
      render: (row) => row.Fixedfee ?? 0,
    },
    {
      title: translate('Deduction'),
      field: 'Discount',
      hozAlign: 'center',
      render: (row) => row.Discount ?? 0,
    },
    {
      title: translate('Pre-deposit'),
      field: 'Pre_Deposit',
      hozAlign: 'center',
      render: (row) => row.Pre_Deposit ?? 0,
    },
    {
      title: translate('Collection'),
      field: 'CurrentPaid',
      hozAlign: 'center',
      render: (row) => row.CurrentPaid ?? 0,
    },
    {
      title: translate('Due'),
      field: 'Due',
      hozAlign: 'center',
      render: (row) => row.Due ?? 0,
    },
    {
      title: translate('Recipient'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => row?.User?.UserName,
    },
    {
      title: translate('Delete / Edit Date Time'),
      field: 'DeleteDateTime',
      hozAlign: 'center',
      render: (row) =>
        row.DeleteDateTime
          ? new Date(row.DeleteDateTime).toLocaleString()
          : '-',
    },
    {
      title: translate('Type'),
      field: 'DataType',
      hozAlign: 'center',
      render: (row) => {
        if (row.DataType === 1 && Number(row.DiscriptionID) === 1)
          return translate('Edit');
        if (row.DataType === 1 && Number(row.DiscriptionID) === 2)
          return translate('Delete');
        return '-';
      },
    },
    {
      title: translate('Comment'),
      field: 'Comment',
      hozAlign: 'center',
      render: (row) => row.Comment ?? '-',
    },
  ];

  // -------- Filter Dropdowns --------
  const accountTypeOptions = [
    { id: 1, name: 'মাসিক বেতন' },
    // { id: 2, name: 'অ্যাকাউন্ট' },
    { id: 2, name: 'ভর্তি ফি' },
    { id: 3, name: 'অন্যান্য ফি' },
    { id: 4, name: 'পরীক্ষা ফি' },
  ];

  const dataTypeOptions = [
    { id: 1, name: 'এডিট' },
    { id: 2, name: 'ডিলিট' },
    { id: 3, name: 'উভয়' },
  ];

  return (
    <div>
      <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg md:text-xl font-bold">
            {translate('Delete Edit Record')}
          </h3>
        </div>

        {/* Filters */}
        <div className="mb-5">
          <FormProvider {...methods}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DefaultSelect
                options={accountTypeOptions}
                registerKey="accountType"
                nameField="name"
                valueField="id"
                label={translate('Account Type')}
              />
              <DefaultSelect
                options={dataTypeOptions}
                registerKey="dataType"
                nameField="name"
                valueField="id"
                label={translate('Data Type')}
              />
              <DatePickerOne
                dateCalender="From"
                placeholder="From Date"
                registerKey="fromDate"
              />
              <DatePickerOne
                dateCalender="To"
                placeholder="To Date"
                registerKey="toDate"
              />
            </div>
          </FormProvider>
        </div>

        {/* Table */}
        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />

        {/* Pagination */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default DeleteEditRecord;
