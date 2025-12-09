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
    { title: translate('User ID'), field: 'UserCode', hozAlign: 'center' },
    { title: translate('Name'), field: 'UserName', hozAlign: 'center' },
    {
      title: translate('Father Name'),
      field: 'FatherName',
      hozAlign: 'center',
    },
    { title: translate('Class'), field: 'ClassName', hozAlign: 'center' },
    { title: translate('Deposit'), field: 'Total', hozAlign: 'center' },
    {
      title: translate('CurrentPaid'),
      field: 'CurrentPaid',
      hozAlign: 'center',
    },
    { title: translate('Due'), field: 'Due', hozAlign: 'center' },
    { title: translate('Date'), field: 'CreateAt', hozAlign: 'center' },
    { title: translate('Phone Number'), field: 'Mobile1', hozAlign: 'center' },
  ];

  return (
    <div className="font-SolaimanLipi bg-white md:p-4 rounded-xl shadow-lg my-5 print:hidden">
      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4 border-b pb-2">
        {translate('Student Payment History')}
      </h2>

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
  );
};

export default StudentPaymentHistory;
