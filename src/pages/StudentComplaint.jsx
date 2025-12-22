import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import {
  useGetStudentParentsReportListQuery,
  usePutStudentReportStatusUpdateMutation,
} from '../features/talimat/talimatQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const StudentComplaint = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // ✅ Filter States
  const [filters, setFilters] = useState({
    userName: '',
    mobile1: '',
    fatherName: '',
    seeUnSee: '',
  });

  const [sortConfig, setSortConfig] = useState({
    sortBy: 'SCID',
    sortOrder: 'DESC',
  });

  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Query Parameters
  const queryParams = {
    page: currentPage,
    limit: PAGE_SIZE,
    ...filters,
    ...sortConfig,
  };

  // ✅ Fetch complaints from API with pagination and filters
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetStudentParentsReportListQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  console.log('API Response:', apiResponse);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [updateStatus] = usePutStudentReportStatusUpdateMutation();

  // ✅ Safe data extract from API response
  const complaints = apiResponse?.data || [];
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return complaints.slice(start, start + PAGE_SIZE);
  }, [complaints, currentPage]);
  // ✅ Handle Filter Changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // ✅ Handle Sort
  const handleSort = (field) => {
    setSortConfig((prev) => ({
      sortBy: field,
      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC',
    }));
    setCurrentPage(1); // Reset to first page when sort changes
  };

  // ✅ Clear Filters
  const handleClearFilters = () => {
    setFilters({
      userName: '',
      mobile1: '',
      fatherName: '',
      seeUnSee: '',
    });
    setSortConfig({
      sortBy: 'SCID',
      sortOrder: 'DESC',
    });
    setCurrentPage(1);
  };

  // ✅ Open "View Complaint" modal
  const handleOpenModal = useCallback(
    async (id) => {
      try {
        const payload = {
          id,
          SeeUnSee: 1,
        };

        await updateStatus(payload).unwrap();

        // Refetch data to update the status
        refetch();

        showModal(
          translate('View Student Complaint'),
          'STUDENT_COMPLAINT_VIEW',
          id
        );
      } catch (error) {
        console.error('Failed to update complaint status', error);
      }
    },
    [translate, updateStatus, refetch]
  );

  const rowTextClass = (row) =>
    row.SeeUnSee === false ? 'font-bold text-gray-900' : 'font-normal';

  // ✅ Table columns definition
  const columnsComplaint = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-[#4284f1]  rounded-md"
            onClick={() => handleOpenModal(row.SCID)}
          >
            <SvgIcon name={'FaEye'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate('ID'),
      field: 'SCID',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('SCID'),
      render: (row) => <p className={rowTextClass(row)}>{row.SCID}</p>,
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('CreatedBy.UserName'),
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.UserName || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Father Name'),
      field: 'FatherName',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('CreatedBy.FatherName'),
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.FatherName || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Mobile'),
      field: 'Mobile1',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('CreatedBy.Mobile1'),
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.Mobile1 || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Complaint Details'),
      field: 'ComplaintDetails',
      hozAlign: 'center',
      render: (row) => (
        <p className={`${rowTextClass(row)} max-w-[250px] truncate mx-auto`}>
          {row.ComplaintDetails}
        </p>
      ),
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('CreateAt'),
      render: (row) => (
        <p className={rowTextClass(row)}>
          {new Date(row.CreateAt).toLocaleString()}
        </p>
      ),
    },
    {
      title: translate('Status'),
      field: 'SeeUnSee',
      hozAlign: 'center',
      sortable: true,
      onClick: () => handleSort('SeeUnSee'),
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.SeeUnSee
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {row.SeeUnSee ? translate('Seen') : translate('Unseen')}
        </span>
      ),
    },
  ];

  // ✅ Loading / Error / Empty states
  if (isLoading) return <Loading />;

  // if (error)
  //   return (
  //     <p className="text-red-500 text-center">
  //       {translate('Failed to load student complaints')}
  //     </p>
  //   );

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9edf4] py-5 sm:px-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Student Complaints')}
          </h3>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            {translate('Clear Filters')}
          </button>
        </div>

        {/* Filter Section */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {translate('User Name')}
            </label>
            <input
              type="text"
              name="userName"
              value={filters.userName}
              onChange={handleFilterChange}
              placeholder={translate('Search by name...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {translate('Mobile')}
            </label>
            <input
              type="text"
              name="mobile1"
              value={filters.mobile1}
              onChange={handleFilterChange}
              placeholder={translate('Search by mobile...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {translate('Status')}
            </label>
            <select
              name="seeUnSee"
              value={filters.seeUnSee}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{translate('All')}</option>
              <option value="0">{translate('Unseen')}</option>
              <option value="1">{translate('Seen')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <SortableTable
          columns={columnsComplaint}
          data={paginatedData}
          isFilterColumn={false}
        />

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default StudentComplaint;
