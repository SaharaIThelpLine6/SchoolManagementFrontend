import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultPagination from '../../components/Pagination/DefaultPagination';
import SortableTable from '../../components/Tables/SortableTable';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import { useGetStudentPaymentsQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import useTranslate from '../../utils/Translate';

const PAGE_SIZE = 10;

const StudentPaymentHistory = () => {
  const translate = useTranslate();
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  // modal data
  const [viewData, setViewData] = useState(null);
  console.log(viewData, 'viewData');

  // API data
  const { data = [], isLoading } = useGetStudentPaymentsQuery();

  console.log(data, "data")

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // total pages
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  // paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);
  const handlePrintOpenModal = (row) => {
    setViewData(row);
  };

  // Table columns
  const columns = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <Link
            to={`/${schoolid}/dashboard/student-payment-history/${row.UFOID}`}
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md shadow-md"
            title="View Details"
          >
            <SvgIcon name="FaEye" />
          </Link>
        </div>
      ),
    },
    { title: translate('Receipt No'), field: 'UFOID', hozAlign: 'center' },

    { title: translate('Class'), field: 'ClassName', hozAlign: 'center' },
    // { title: translate('Deposit'), field: 'Total', hozAlign: 'center' },
    {
      title: translate('CurrentPaid'),
      field: 'CurrentPaid',
      hozAlign: 'center',
    },
    // { title: translate('Due'), field: 'Due', hozAlign: 'center' },
    { title: translate('Date'), field: 'CreateAt', hozAlign: 'center' },
    {
      title: translate('Payment Type'), field: 'SlName', hozAlign: 'center',
      render: (row) => (
        <span>{row.SlName === "অনলাইন পেমেন্ট" ? row.SlName : "অফলাইন পেমেন্ট"}</span>
      )
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg my-5 print:hidden">
      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4 border-b pb-2">
        {translate('Student Payment History')}
      </h2>

      {paginatedData.length > 0 ? (
        <>
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />

          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 mb-3 opacity-60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5V19a2 2 0 002 2h3m10-4v2a2 2 0 01-2 2h-3m-6-6L3 6m0 0l9 6m-9-6l9-6m0 0l9 6m-9-6v12"
            />
          </svg>

          <h3 className="text-lg font-medium">No Data Found</h3>
          <p className="text-sm text-gray-400">
            Try adjusting your filter or search
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentHistory;
