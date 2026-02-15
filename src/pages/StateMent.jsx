import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import Button from '../components/Button/Button';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { useDeleteAcademicSubjectMutation } from '../features/class/classQuerySlice';
import { useGetUserTransactionFilterQuery } from '../features/feeCollection/feeCollectionSlice';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const StateMent = ({ pageTitle }) => {
  const location = useLocation();
  const { userid } = useParams();

  console.log(userid, 'userid');
  const dispatch = useDispatch();
  const method = useForm();
  const { handleSubmit, watch } = method;
  const [currentPage, setCurrentPage] = useState(1);
  const translate = useTranslate();
  const [filters, setFilters] = useState({});

  // 🔥 Backend Pagination Query
  const {
    data: userTransactionFilterData,
    isLoading,
    isError,
  } = useGetUserTransactionFilterQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    userId: userid || null,
    ...filters,
  });
  console.log(userTransactionFilterData, 'userTransactionFilterData');

  const [deleteSubject, { isLoading: isDeleting }] =
    useDeleteAcademicSubjectMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Provide default empty array if data is undefined

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate('Add Book'), 'ADD_BOOK');
  }, [translate]);

  const handleEditSubject = useCallback(
    (id) => {
      showModal(translate('Update Book'), 'UPDATE_BOOK', id);
    },
    [translate]
  );
  // 🔥 When filter submit
  const onSubmit = (data) => {
    setCurrentPage(1); // reset page
    setFilters({
      DateFrom: data.DateFrom,
      DateTo: data.DateTo,
    });
  };
  const columnsDistribution = [
    {
      title: translate('Voucher'),
      field: 'UFOID',
      hozAlign: 'left',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{data?.UFOID}</p>
        </div>
      ),
    },
    {
      title: translate('Date'),
      field: 'CreateAt',
      hozAlign: 'center',
      width: 180,
      sorter: 'date',
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB');
      },
    },

    {
      title: translate('SubLedger'),
      field: 'SlName',
      hozAlign: 'right',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data.SlName) || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Details'),
      field: 'Particulars',
      hozAlign: 'left',
      width: 200,
      sorter: 'string',
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data.Particulars) || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Debit'),
      field: 'Dr',
      hozAlign: 'center',
      width: 150,
      sorter: 'number',
      formatter: (cell) => {
        // You can map SubClassID to actual group names if needed
        return `Group ${cell.getValue()}`;
      },
    },
    {
      title: translate('Credit'),
      field: 'Cr',
      hozAlign: 'center',
      width: 100,
      sorter: 'number',
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <div>{translate('Error loading data')}</div>;

  const tableData = userTransactionFilterData?.data || [];
  const singleData = userTransactionFilterData?.data[0] || {};
  console.log(singleData, 'singleData');
  const totalPages = userTransactionFilterData?.totalPages || 1;
  return (
    <FormProvider {...method}>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header flex items-center justify-between sm:px-5 pt-0 mb-6">
            <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
              {translate('Fee Statement Report')}
            </h3>
            {/* <ViewPermission
              permissionId={permissionsDataList.kitab_entry}
              permissionType="insert"
            >
              <Button onClick={() => handleOpenModal()}>
                {translate('Add Book')}
              </Button>
            </ViewPermission> */}
          </div>
          <div className="bg-white mb-5 p-4 sm:p-6 rounded-2xl shadow-sm border">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide">
                  Code
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-800">
                  {singleData?.UserCode || '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide">
                  Name
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-800">
                  {singleData?.UserName || '-'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 tracking-wide">
                  Father Name
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-semibold text-gray-800">
                  {singleData?.FatherName || '-'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-xs sm:text-sm font-medium text-blue-600 tracking-wide">
                  Fee
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-bold text-blue-700">
                  528 ৳
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4">
                <h3 className="text-xs sm:text-sm font-medium text-yellow-600 tracking-wide">
                  Deduction
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-bold text-yellow-700">
                  528 ৳
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-xs sm:text-sm font-medium text-green-600 tracking-wide">
                  Deposit
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-bold text-green-700">
                  528 ৳
                </p>
              </div>

              <div className="bg-red-50 rounded-xl p-4">
                <h3 className="text-xs sm:text-sm font-medium text-red-600 tracking-wide">
                  Owed
                </h3>
                <p className="mt-1 text-lg sm:text-xl font-bold text-red-700">
                  528 ৳
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 Filter Row 1: Date */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3  py-4 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg rounded-xl px-5">
              <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 lg:col-span-2 xl:col-span-1">
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
                  className="h-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 rounded-lg shadow flex-shrink-0"
                >
                  Show
                </Button>
              </div>
              <div>
                <Button
                  type="button"
                  className="h-10 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 sm:px-6 rounded-lg shadow flex-shrink-0"
                >
                  View Report
                </Button>
              </div>
            </div>
          </form>

          {tableData.length > 0 ? (
            <>
              <SortableTable
                columns={columnsDistribution}
                data={tableData}
                isFilterColumn={false}
              />

              {/* Pagination Controls */}

              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-8">
              {translate('No data available')}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default StateMent;
