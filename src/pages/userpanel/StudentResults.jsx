// StudentResults.js - এর সংশোধিত ভার্সন
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import AreaChart from '../../components/Charts/AreaChart';
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

  const [viewData, setViewData] = useState(null);

  // API data
  const { data = {}, isLoading } = useGeStudentResultsQuery();

  // Fix: Ensure tableData is always an array
  const tableData = useMemo(() => {
    if (!data) return [];

    if (Array.isArray(data?.results)) {
      return data.results;
    } else if (data?.results && typeof data.results === 'object') {
      return [data.results];
    }
    return [];
  }, [data]);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // total pages
  const totalPages = Math.ceil(tableData.length / PAGE_SIZE);

  // paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tableData.slice(start, start + PAGE_SIZE);
  }, [tableData, currentPage]);

  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, schoolid]);

  const handlePrintOpenModal = (row) => {
    setViewData(row);
  };

  // Table columns
  const columns = [
    {
      title: translate('Exam Name'),
      field: 'ExamName',
      render: (row) => <p>{row?.Exam?.ExamName}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Class/Jamaat'),
      field: 'SubClass',
      render: (row) => <p>{row?.Class?.SubClass}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Session'),
      field: 'Session',
      render: (row) => <p>{row?.Session?.SessionName}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Total'),
      field: 'Total',
      render: (row) => <p>{row?.Total}</p>,
      hozAlign: 'center',
    },
    {
      title: translate('Division'),
      field: 'Division',
      render: (row) => <p>{row?.Division}</p>,
      hozAlign: 'center',
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white rounded-xl shadow-lg print:hidden p-3">
      {/* Fix: Pass tableData directly as an array */}
      <div className="py-3">
        <AreaChart tableData={tableData} />
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        {/* Title */}
        <h2 className="text-xl font-semibold text-center">
          {translate('Student Results History')}
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
    </div>
  );
};

export default StudentResults;
