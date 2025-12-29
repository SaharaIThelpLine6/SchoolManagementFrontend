import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AreaChart from '../../components/Charts/AreaChart';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultPagination from '../../components/Pagination/DefaultPagination';
import SortableTable from '../../components/Tables/SortableTable';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import { useGeStudentResultsQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const PAGE_SIZE = 10;

const StudentResults = () => {
  const translate = useTranslate();
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewData, setViewData] = useState(null);

  // API data
  const { data = {}, isLoading } = useGeStudentResultsQuery();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  // Fetch data on mount
  useEffect(() => {
    if (schoolid) dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, schoolid]);

  const handlePrintOpenModal = (row) => {
    setViewData(row);
  };

  const handleView = (data) => {
    if (!data?.ExamID || !data?.SubClassID || !data?.SessionID) return;

    navigate(
      `/${schoolid}/dashboard/student-results/${data?.ExamID}/${data?.SubClassID}/${data?.SessionID}/${data?.UserID}`
    );
  };

  // Table columns
  const columns = [
    {
      title: translate('Action'),
      field: 'Action',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="text-blue-600 hover:text-blue-800"
            title="View"
          >
            <SvgIcon name={'FaEye'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate('Exam Name'),
      field: 'ExamName',
      render: (row) => <p>{row.ExamName || '-'}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClass',
      render: (row) => <p>{row.SubClass || '-'}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Session'),
      field: 'SessionName',
      render: (row) => <p>{row.SessionName || '-'}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Total'),
      field: 'Total',
      render: (row) => <p>{row.Total ?? '-'}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Division'),
      field: 'Division',
      render: (row) => <p>{row.Division || '-'}</p>,
      hozAlign: 'center',
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white rounded-xl shadow-lg print:hidden p-3 mb-5">
      {/* Chart */}
      <div className="py-3">
        <AreaChart tableData={data} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg p-3">
        <h2 className="text-xl font-semibold text-center mb-3">
          শিক্ষার্থীর ফলাফল লিষ্ট
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : paginatedData.length > 0 ? (
          <>
            <SortableTable
              columns={columns}
              data={paginatedData}
              isFilterColumn={false}
            />

            <div className="mt-4">
              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
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
    </div>
  );
};

export default StudentResults;
