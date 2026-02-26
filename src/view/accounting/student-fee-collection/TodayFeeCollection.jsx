import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Button from '../../../components/Button/Button';
import EditButton from '../../../components/Button/EditButton';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../../components/Forms/DefaultInput';
import SvgIcon from '../../../components/icons/SvgIcon';
import Loading from '../../../components/Loading/Loading';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import RadioOption from '../../../components/Radio/RadioOption';
import SortableTable from '../../../components/Tables/SortableTable';
import { permissionsDataList } from '../../../Data/permissions';
import { setPageName } from '../../../features/auth/authSlice';
import {
  useGetStudentCompleteFeeFilterQuery,
  useGetStudentFeeUpdateGetDataByUFOIDQuery,
} from '../../../features/feeCollection/feeCollectionSlice';
import { setStudentFeeUpdateID } from '../../../features/student/studentSlice';
import { ViewPermission } from '../../../Routes/ViewPermission';
import useTranslate from '../../../utils/Translate';
import StudentFeeReportPdf from './StudentFeeReportPdf';

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
  const { handleSubmit, reset, register } = methods;

  // 🔹 Local states
  const [filters, setFilters] = useState({
    DateFrom: '',
    DateTo: '',
    UserCode: '',
    UFOID: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [printID, setPrintID] = useState(null);

  // 🔹 RTK Query
  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useGetStudentCompleteFeeFilterQuery(filters);
  // console.log(result, 'result');

  // 🔹 RTK Query (একটি নির্দিষ্ট PrintID-এর জন্য)
  const { data: singleResult } = useGetStudentFeeUpdateGetDataByUFOIDQuery(
    printID,
    {
      skip: !printID,
    }
  );
  // console.log(singleResult, 'singleResult');

  const tableData = result?.data || [];
  const todayCollection = result?.todayCollection || 0;
  const userCollection = result?.userCollection || 0;

  // 🔹 Set page title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // 🔹 Pagination
  const totalPages = Math.ceil(tableData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tableData.slice(start, start + PAGE_SIZE);
  }, [tableData, currentPage]);

  // 🔹 Filter submit
  const onFilterSubmit = useCallback((formData) => {
    const { DateFrom, DateTo, UserCode, classType } = formData;
    const newFilters = {};

    if (DateFrom) newFilters.DateFrom = DateFrom;
    if (DateTo) newFilters.DateTo = DateTo;
    if (classType === 'UserCode' && UserCode) newFilters.UserCode = UserCode;
    if (classType === 'UFOID' && UserCode) newFilters.UFOID = UserCode;

    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // 🔹 Reset Filter
  const handleResetFilter = useCallback(() => {
    reset({
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      classType: 'UserCode',
    });
    setFilters({
      DateFrom: '',
      DateTo: '',
      UserCode: '',
      UFOID: '',
    });
    setCurrentPage(1);
  }, [reset]);

  // 🔹 Radio Options
  const filterOptions = [
    { id: 'UserCode', label: 'Code' },
    { id: 'UFOID', label: 'Order' },
  ];

  // 🔹 Handle Edit (open update form)
  const handleEditOpenModal = (UFOID) => {
    dispatch(setStudentFeeUpdateID(UFOID));
  };

  const handlePrintOpenModal = (UFOID) => {
    // Reset first so that next click always triggers
    setPrintID(null);

    // Small delay to allow state reset
    setTimeout(() => {
      setPrintID(UFOID);
    }, 50);
  };

  useEffect(() => {
    if (printID !== null) {
      if (singleResult) {
        const timer = setTimeout(() => {
          window.print();
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [printID, singleResult]);

  // 🔹 Table columns
  const columns = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.collect_student_fee}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEditOpenModal(row.UFOID)} />
          </ViewPermission>

          <div className="">
            <button
              onClick={() => handlePrintOpenModal(row.UFOID)}
              className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-md shadow-md hover:shadow-lg transition duration-200"
              title="Print"
            >
              {' '}
              <SvgIcon name="MdLocalPrintshop" />{' '}
            </button>{' '}
          </div>
        </div>
      ),
    },
    {
      title: translate('Receipt No'),
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
    <div className="">
      <FormProvider {...methods}>
        <div className="font-lato bg-white md:p-4 rounded-xl shadow-lg my-5 print:hidden">
          <form onSubmit={handleSubmit(onFilterSubmit)}>
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 bg-gradient-to-br px-3 sm:px-4 from-blue-50 to-blue-100 shadow-lg rounded-xl
           py-4 sm:py-3 gap-4 sm:gap-5"
            >
              {/* 🔹 Filter Row 1: Date */}
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 lg:col-span-2 xl:col-span-1">
                <div className="flex-1">
                  <DatePickerOne
                    registerKey="DateFrom"
                    placeholder="তারিখ থেকে"
                  />
                </div>
                <div className="flex-1">
                  <DatePickerOne
                    registerKey="DateTo"
                    placeholder="তারিখ পর্যন্ত"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 rounded-lg shadow flex-shrink-0"
                >
                  Show
                </Button>
              </div>

              {/* 🔹 Filter Row 2: Radio + Input */}
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 lg:col-span-2 xl:col-span-2">
                <div className="flex flex-row gap-2 sm:gap-3 justify-center flex-wrap">
                  {filterOptions.map((option) => (
                    <RadioOption
                      key={option.id}
                      option={option}
                      register={register}
                      name="classType"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <DefaultInput
                    valueField="UserCode"
                    nameField="UserCode"
                    registerKey="UserCode"
                    placeholder="শিক্ষার্থীর আইডি লিখুন"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleResetFilter}
                  className="bg-red-500 hover:bg-red-600 transition h-10 w-full sm:w-auto text-white font-medium px-4 sm:px-6 rounded-lg shadow flex-shrink-0"
                >
                  Reset
                </Button>
              </div>

              {/* 🔹 Collection Cards - Right Side */}
              <div className="flex justify-center sm:justify-end items-center lg:col-span-2 xl:col-span-1">
                <div className="grid grid-cols-2 gap-3 sm:gap-2 w-full max-w-[300px]">
                  {/* 🔹 আজকের গ্রহণ */}
                  <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 rounded-md shadow-xs p-2 sm:p-3 border border-green-200">
                    <h4 className="text-xs font-medium text-green-700 text-center">
                      আজকের গ্রহণ
                    </h4>
                    <p className="text-base sm:text-lg font-bold text-green-900 mt-0.5">
                      {todayCollection.toLocaleString()}৳
                    </p>
                  </div>

                  {/* 🔹 ব্যবহারকারীর গ্রহণ */}
                  <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-md shadow-xs p-2 sm:p-3 border border-blue-200">
                    <h4 className="text-xs font-medium text-blue-700 text-center">
                      ব্যবহারকারীর গ্রহণ
                    </h4>
                    <p className="text-base sm:text-lg font-bold text-blue-900 mt-0.5">
                      {userCollection.toLocaleString()}৳
                    </p>
                  </div>
                </div>
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
      <div className="hidden print:block">
        <StudentFeeReportPdf result={singleResult} />
      </div>
    </div>
  );
};

export default TodayFeeCollection;
