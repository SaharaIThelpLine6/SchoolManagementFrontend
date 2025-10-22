import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Loading from '../../../components/Loading/Loading';
import SortableTable from '../../../components/Tables/SortableTable';
import { setPageName } from '../../../features/auth/authSlice';
import useTranslate from '../../../utils/Translate';

import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import EditButton from '../../../components/Button/EditButton';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../../components/Forms/DefaultInput';
import SvgIcon from '../../../components/icons/SvgIcon';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import RadioOption from '../../../components/Radio/RadioOption';
import { useGetStudentCompleteFeeFilterQuery } from '../../../features/feeCollection/feeCollectionSlice';
import { setStudentFeeUpdateID } from '../../../features/student/studentSlice';

const PAGE_SIZE = 10;

const TodayFeeCollection = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 React Hook Form
  const methods = useForm({
    defaultValues: {
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      classType: 'UserCode',
    },
  });
  const { watch, handleSubmit, register, setValue, reset } = methods;

  const [filters, setFilters] = useState({
    DateFrom: '',
    DateTo: '',
    UserCode: '',
    UFOID: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ufoid, setUfoid] = useState(null);

  // 🔹 RTK Query
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentCompleteFeeFilterQuery(filters);
  const UFOID = Number(ufoid);

  // 🔹 Set page title / student fee data when fetched
  useEffect(() => {
    if (ufoid) {
      dispatch(setStudentFeeUpdateID(ufoid));
    }
  }, [dispatch, ufoid]);

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
      const { DateFrom, DateTo, UserCode, classType } = formData;
      const newFilters = {};

      // Date filter
      if (DateFrom) newFilters.DateFrom = DateFrom;
      if (DateTo) newFilters.DateTo = DateTo;

      // Radio + Input filter
      if (classType === 'UserCode' && UserCode) newFilters.UserCode = UserCode;
      if (classType === 'UFOID' && UserCode) newFilters.UFOID = UserCode;

      setFilters(newFilters);
      setCurrentPage(1); // reset page on filter
    },
    [setFilters]
  );

  // 🔹 Reset Filter
  const handleResetFilter = useCallback(() => {
    // Reset form fields
    reset({
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      classType: 'UserCode',
    });
    // Reset filters state to trigger refetch
    setFilters({
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      UFOID: '',
    });
    // Reset pagination
    setCurrentPage(1);
  }, [reset, setFilters]);

  // 🔹 Radio Options
  const colorOptions = [
    { id: 'UserCode', label: 'Code' },
    { id: 'UFOID', label: 'Order' },
  ];
  const handleEditOpenModal = (UFOID) => {
    setUfoid(UFOID);
  };

  // 🔹 Table columns
  const columns = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          {' '}
          <EditButton onClick={() => handleEditOpenModal(row.UFOID)} />
          <button
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-md shadow-md hover:shadow-lg transition duration-200"
            title="Print"
          >
            {' '}
            <SvgIcon name="MdLocalPrintshop" />{' '}
          </button>{' '}
        </div>
      ),
    },
    {
      title: 'UFOID',
      field: 'UFOID',
      hozAlign: 'center',
      render: (row) => row.UFOID,
    },

    {
      title: translate('User ID'),
      field: 'UserCode',
      hozAlign: 'center',
      render: (row) => row.UserCode,
    },
    {
      title: translate('Name'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => row.UserName,
    },
    {
      title: translate('Father Name'),
      field: 'FatherName',
      hozAlign: 'center',
      render: (row) => row.FatherName,
    },
    {
      title: translate('Class'),
      field: 'ClassName',
      hozAlign: 'center',
      render: (row) => row.ClassName,
    },
    {
      title: translate('Deposit'),
      field: 'Total',
      hozAlign: 'center',
      render: (row) => row.Total,
    },
    {
      title: translate('CurrentPaid'),
      field: 'CurrentPaid',
      hozAlign: 'center',
      render: (row) => row.CurrentPaid,
    },
    {
      title: translate('Due'),
      field: 'Due',
      hozAlign: 'center',
      render: (row) => row.Due,
    },
    {
      title: translate('Date'),
      field: 'CreateAt',
      hozAlign: 'center',
      render: (row) => row.CreateAt,
    },
    {
      title: translate('Phone Number'),
      field: 'Mobile1',
      hozAlign: 'center',
      render: (row) => row.Mobile1,
    },
  ];

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load student fee data</p>;

  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white md:p-4 rounded-xl shadow-lg my-5">
        <form onSubmit={handleSubmit(onFilterSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 bg-gradient-to-br px-2 from-blue-50 to-blue-100 shadow-lg rounded-xl py-5 gap-5">
            {/* 🔹 Filter Row 1: Date */}
            <div className="flex justify-center items-center flex-row gap-4">
              <DatePickerOne registerKey="DateFrom" placeholder="তারিখ থেকে" />
              <DatePickerOne registerKey="DateTo" placeholder="তারিখ পর্যন্ত" />
              <Button
                type="submit"
                className="h-10 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 rounded-lg shadow"
              >
                Show
              </Button>
            </div>

            {/* 🔹 Filter Row 2: Radio + Input */}
            <div className="flex justify-center items-center flex-row gap-4">
              <div className="flex flex-row gap-3 col-span-2">
                {colorOptions.map((option) => (
                  <RadioOption
                    key={option.id}
                    option={option}
                    register={register}
                    name="classType"
                  />
                ))}
              </div>
              <DefaultInput
                valueField="UserCode"
                nameField="UserCode"
                registerKey="UserCode"
                placeholder="শিক্ষার্থীর আইডি লিখুন"
              />

              <Button
                type="button"
                onClick={handleResetFilter}
                className=" bg-red-500 hover:bg-red-600 transition h-10 w-full md:w-auto text-white font-medium px-6 rounded-lg shadow"
              >
                Reset
              </Button>
            </div>
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

export default TodayFeeCollection;
