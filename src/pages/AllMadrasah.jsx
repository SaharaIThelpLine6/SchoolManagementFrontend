import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../components/Button/Button";
import EditButton from "../components/Button/EditButton";
import Loading from "../components/Loading/Loading";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SortableTable from "../components/Tables/SortableTable";
import { setPageName } from "../features/auth/authSlice";
import {
  useGetAllMadrasahQuery,
  useGetMadrasahStatsQuery,
  useToggleMadrasahActionMutation,
} from "../features/userType/userTypeSlice";
import useTranslate from "../utils/Translate";

const AllMadrasah = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // Get query parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const initialFilter = searchParams.get("filter") || "all";

  // State for pagination, search, and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Fetch data with query parameters
  const {
    data: allMadrasah,
    isLoading: isFetchingMadrasah,
    isError: isErrorMadrasah,
  } = useGetAllMadrasahQuery(
    {
      page: currentPage,
      limit: 50,
      search: searchTerm || undefined,
      filter: activeFilter !== "all" ? activeFilter : undefined,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Fetch stats
  const {
    data: statsData,
    isLoading: isFetchingStats,
    isError: isErrorStats,
  } = useGetMadrasahStatsQuery();

  // Toggle action mutation
  const [toggleMadrasahAction, { isLoading: isToggling }] =
    useToggleMadrasahActionMutation();

  // Set page title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Handle loading state from API
  useEffect(() => {
    setIsLoading(isFetchingMadrasah || isFetchingStats || isToggling);
  }, [isFetchingMadrasah, isFetchingStats, isToggling]);

  // Use stats from API
  const stats = statsData || {
    data: {
      totalUsers: 0,
      active: 0,
      inactive: 0,
      online: 0,
      offline: 0,
    }
  };

  useEffect(() => {
    if (allMadrasah) {
      setUsers(allMadrasah);
    }
  }, [allMadrasah]);

  // Extract paginated data and metadata
  const paginatedData = users?.data || [];
  const totalPages = users?.pagination?.totalPages || 1;
  const totalRecords = users?.pagination?.totalRecords || 0;

  // Sorting handler
  const handleSort = (key, sorterType) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return paginatedData;

    return [...paginatedData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Convert based on data type
      if (sortConfig.key === 'ID' || sortConfig.key === 'Balance') {
        // Number sorting
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortConfig.key === 'EntryDate' || sortConfig.key === 'LastLogin') {
        // Date sorting
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
        // Handle invalid dates
        if (isNaN(aValue)) aValue = 0;
        if (isNaN(bValue)) bValue = 0;
      } else {
        // String sorting
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [paginatedData, sortConfig]);

  const handleOpenModal = useCallback(() => {
    // showModal(translate("Add new madrasah"), "ADD_MADRASAH");
  }, [translate]);

  const handleEditOpenModal = useCallback(() => {
    // showModal(translate("Edit madrasah"), "EDIT_MADRASAH", id);
  }, []);

  const handleDelete = useCallback(async (id) => {
    // Delete logic here
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleFilterClick = useCallback(
    (filterType) => {
      setActiveFilter(activeFilter === filterType ? "all" : filterType);
      setCurrentPage(1);
    },
    [activeFilter]
  );

  const handleClearFilter = () => {
    setActiveFilter("all");
    setSearchTerm("");
  };

  const handleToggleAction = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to change this Madrasah status?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, change it!",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        try {
          await toggleMadrasahAction(id).unwrap();
          Swal.fire({
            title: "Success!",
            text: "Madrasah status updated.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          Swal.fire("Error!", "Failed to toggle status.", "error");
        }
      }
    },
    [toggleMadrasahAction]
  );

  // Custom header formatter with sort indicators
  const headerFormatter = (title, field, isSortable = true) => {
    if (!isSortable) return title;

    const isSorted = sortConfig.key === field;
    const isAsc = sortConfig.direction === 'asc';

    return (
      <div
        className="flex items-center justify-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => handleSort(field, 'string')}
      >
        <span>{title}</span>
        <div className="flex flex-col">
          <span
            className={`text-[8px] ${isSorted && isAsc ? 'text-blue-600' : 'text-gray-400'}`}
          >
            ▲
          </span>
          <span
            className={`text-[8px] ${isSorted && !isAsc ? 'text-blue-600' : 'text-gray-400'}`}
          >
            ▼
          </span>
        </div>
      </div>
    );
  };

  const columnsMadrasah = [
    {
      title: headerFormatter(translate('ID'), 'ID'),
      field: 'ID',
      hozAlign: 'center',
      width: 80,
      render: (row) => <p className="text-sm">{row.ID}</p>,
    },
    {
      title: headerFormatter(translate('Code'), 'UserCode'),
      field: 'UserCode',
      hozAlign: 'center',
      width: 90,
      render: (row) => <p className="text-sm">{row.UserCode}</p>,
    },
    {
      title: headerFormatter(translate('Database Name'), 'DatabaseName'),
      field: 'DatabaseName',
      hozAlign: 'left',
      render: (row) => (
        <p className="text-sm truncate max-w-xs">{row.DatabaseName}</p>
      ),
    },
    {
      title: headerFormatter(translate('Institution Name'), 'InstituteName'),
      field: 'InstituteName',
      hozAlign: 'left',
      render: (row) => (
        <p className="text-sm truncate max-w-xs">{row.InstituteName}</p>
      ),
    },
    {
      title: headerFormatter(translate('Created At'), 'EntryDate'),
      field: 'EntryDate',
      hozAlign: 'center',
      width: 120,
      render: (row) => (
        <p className="text-sm">
          {new Date(row.EntryDate).toLocaleDateString()}
        </p>
      ),
    },
    {
      title: headerFormatter(translate('Last Login'), 'LastLogin'),
      field: 'LastLogin',
      hozAlign: 'center',
      width: 150,
      render: (row) => (
        <p className="text-sm">
          {row.LastLogin ? new Date(row.LastLogin).toLocaleString() : 'N/A'}
        </p>
      ),
    },
    {
      title: headerFormatter(translate('Balance'), 'Balance'),
      field: 'Balance',
      hozAlign: 'center',
      width: 100,
      render: (row) => <p className="text-sm font-medium">৳{row.Balance}</p>,
    },
    {
      title: translate('Status'),
      field: 'Action',
      hozAlign: 'center',
      width: 110,
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.Action === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.Action}
        </span>
      ),
    },
    {
      title: translate('Online'),
      field: 'LoginStatus',
      hozAlign: 'center',
      width: 100,
      render: (row) => (
        <div className="flex items-center justify-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              row.LoginStatus === 1 ? 'bg-green-500' : 'bg-gray-400'
            }`}
          ></span>
          <span>{row.LoginStatus === 1 ? 'Online' : 'Offline'}</span>
        </div>
      ),
    },
    {
      title: translate('Action'),
      field: 'actions',
      hozAlign: 'center',
      width: 150,
      headerSort: false,
      render: (row) => (
        <div className="flex justify-center space-x-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={row.Action === 'Active'}
              onChange={() => handleToggleAction(row.UserCode)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
          <EditButton
            onClick={() => handleEditOpenModal(row.ID)}
            className="w-8 h-8 flex items-center justify-center"
          />
          <button
            onClick={() => handleDelete(row.ID)}
            className="bg-red-100 text-red-600 w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-200 transition-colors"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;
  if (isErrorMadrasah || isErrorStats) {
    return <div className="text-red-600 text-center">Error fetching data</div>;
  }

  return (
    <div className="font-lato bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col">
        <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 mb-6 gap-4">
          <h3 className="font-SolaimanLipi text-2xl font-bold text-gray-800">
            {translate('All Madrasah List')}
          </h3>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={handleOpenModal}
              className="flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              {translate('Add Madrasah')}
            </Button>
          </div>
        </div>

        {/* Search and Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="">
            <div className="relative">
              <input
                type="text"
                placeholder={translate('Search madrasah...')}
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Buttons */}
          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-100 border-blue-300'
                : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
            }`}
            onClick={() => handleFilterClick('all')}
          >
            <div className="flex flex-row justify-center items-center gap-3">
              <div className="text-xs font-medium text-blue-600">
                {translate('Total Users')}
              </div>
              <div className="text-base font-bold text-blue-700">
                {stats?.data?.totalUsers}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === 'active'
                ? 'bg-green-100 border-green-300'
                : 'bg-green-50 border-green-100 hover:bg-green-100'
            }`}
            onClick={() => handleFilterClick('active')}
          >
            <div className="flex flex-row justify-center items-center gap-3">
              <div className="text-xs font-medium text-green-600">
                {translate('Active')}
              </div>
              <div className="text-base font-bold text-green-700">
                {stats?.data?.active}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === 'inactive'
                ? 'bg-red-100 border-red-300'
                : 'bg-red-50 border-red-100 hover:bg-red-100'
            }`}
            onClick={() => handleFilterClick('inactive')}
          >
            <div className="flex flex-row justify-center items-center gap-3">
              <div className="text-xs font-medium text-red-600">
                {translate('Inactive')}
              </div>
              <div className="text-base font-bold text-red-700">
                {stats?.data?.inactive}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === 'online'
                ? 'bg-purple-100 border-purple-300'
                : 'bg-purple-50 border-purple-100 hover:bg-purple-100'
            }`}
            onClick={() => handleFilterClick('online')}
          >
            <div className="flex flex-row justify-center items-center gap-3">
              <div className="text-xs font-medium text-purple-600">
                {translate('Online')}
              </div>
              <div className="text-base font-bold text-purple-700">
                {stats?.data?.online}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === 'offline'
                ? 'bg-gray-100 border-gray-300'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => handleFilterClick('offline')}
          >
            <div className="flex flex-row justify-center items-center gap-3">
              <div className="text-xs font-medium text-gray-600">
                {translate('Offline')}
              </div>
              <div className="text-base font-bold text-gray-700">
                {stats?.data?.offline}
              </div>
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {activeFilter !== 'all' && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Active filter:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md capitalize">
              {activeFilter}
            </span>
            <button
              onClick={handleClearFilter}
              className="ml-2 text-blue-600 text-sm hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <SortableTable
            columns={columnsMadrasah}
            data={sortedData}
            className="min-w-full"
            isFilterColumn={false}
          />
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing {sortedData.length} of {totalRecords} madrasahs
            {activeFilter !== 'all' && ` (filtered by ${activeFilter})`}
          </p>
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
};

export default AllMadrasah;
