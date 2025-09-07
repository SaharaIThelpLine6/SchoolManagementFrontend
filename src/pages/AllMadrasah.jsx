import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import Button from "../components/Button/Button";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";

const PAGE_SIZE = 10;

const AllMadrasah = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // Sample data based on the provided image
  const madrasahData = [
    {
      ID: 1140,
      Code: 1271,
      DatabaseName: "1271_TajkiatulUm...",
      InstitutionName: "vnr@singer...",
      CreateAt: "12/24/2022",
      LastLogin: "9/6/2025 8:04 PM",
      Balance: 174,
      Status: "Active",
      Online: "Offline",
      Online2: 0,
    },
    {
      ID: 1150,
      Code: 1269,
      DatabaseName: "1269_AshrafunNi...",
      InstitutionName: "vnr@singer.fa...",
      CreateAt: "12/30/2022",
      LastLogin: "9/7/2025 8:32 AM",
      Balance: 138,
      Status: "Active",
      Online: "Online",
      Online2: 1,
    },
    {
      ID: 1151,
      Code: 1276,
      DatabaseName: "1276_12AwilaRon...",
      InstitutionName: "vnr-vnr@singer...",
      CreateAt: "12/30/2022",
      LastLogin: "6/29/2025 6:51 PM",
      Balance: 172,
      Status: "Active",
      Online: "Offline",
      Online2: 0,
    },
    {
      ID: 1152,
      Code: 1278,
      DatabaseName: "1278_AlHeraMadrasah",
      InstitutionName: "alhera@edu.org",
      CreateAt: "1/15/2023",
      LastLogin: "9/7/2025 9:15 AM",
      Balance: 210,
      Status: "Active",
      Online: "Online",
      Online2: 1,
    },
    {
      ID: 1153,
      Code: 1280,
      DatabaseName: "1280_NoorulIslam",
      InstitutionName: "noorul@islam.edu",
      CreateAt: "2/3/2023",
      LastLogin: "9/6/2025 3:45 PM",
      Balance: 95,
      Status: "Inactive",
      Online: "Offline",
      Online2: 0,
    },
    {
      ID: 1154,
      Code: 1282,
      DatabaseName: "1282_DarulUloom",
      InstitutionName: "darul@ulum.edu",
      CreateAt: "2/18/2023",
      LastLogin: "9/5/2025 11:20 AM",
      Balance: 156,
      Status: "Active",
      Online: "Offline",
      Online2: 0,
    },
    {
      ID: 1155,
      Code: 1284,
      DatabaseName: "1284_MadrasatulBanat",
      InstitutionName: "banat@edu.org",
      CreateAt: "3/5/2023",
      LastLogin: "9/7/2025 10:05 AM",
      Balance: 187,
      Status: "Active",
      Online: "Online",
      Online2: 1,
    },
    {
      ID: 1156,
      Code: 1286,
      DatabaseName: "1286_JamiaRahmania",
      InstitutionName: "jamia@rahmania.edu",
      CreateAt: "3/22/2023",
      LastLogin: "9/4/2025 4:30 PM",
      Balance: 122,
      Status: "Pending",
      Online: "Offline",
      Online2: 0,
    },
    {
      ID: 1157,
      Code: 1288,
      DatabaseName: "1288_MiftahulUloom",
      InstitutionName: "miftahul@uloom.edu",
      CreateAt: "4/10/2023",
      LastLogin: "9/7/2025 8:50 AM",
      Balance: 203,
      Status: "Active",
      Online: "Online",
      Online2: 1,
    },
    {
      ID: 1158,
      Code: 1290,
      DatabaseName: "1290_AlMadinatulIlm",
      InstitutionName: "almadinatul@ilm.edu",
      CreateAt: "4/28/2023",
      LastLogin: "9/3/2025 2:15 PM",
      Balance: 178,
      Status: "Active",
      Online: "Offline",
      Online2: 0,
    },
  ];

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // Track active filter

  // Filter data based on search term and active filter
  const filteredData = useMemo(() => {
    let result = madrasahData;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.DatabaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.InstitutionName.toLowerCase().includes(
            searchTerm.toLowerCase()
          ) ||
          item.Code.toString().includes(searchTerm) ||
          item.ID.toString().includes(searchTerm)
      );
    }

    // Apply active filter
    if (activeFilter !== "all") {
      switch (activeFilter) {
        case "active":
          result = result.filter((item) => item.Status === "Active");
          break;
        case "inactive":
          result = result.filter((item) => item.Status === "Inactive");
          break;
        case "online":
          result = result.filter((item) => item.Online === "Online");
          break;
        case "offline":
          result = result.filter((item) => item.Online === "Offline");
          break;
        default:
          break;
      }
    }

    return result;
  }, [madrasahData, searchTerm, activeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = madrasahData.length;
    const active = madrasahData.filter(
      (item) => item.Status === "Active"
    ).length;
    const inactive = madrasahData.filter(
      (item) => item.Status === "Inactive"
    ).length;
    const online = madrasahData.filter(
      (item) => item.Online === "Online"
    ).length;
    const offline = madrasahData.filter(
      (item) => item.Online === "Offline"
    ).length;

    return { totalUsers, active, inactive, online, offline };
  }, [madrasahData]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate("Add new madrasah"), "ADD_MADRASAH");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Edit madrasah"), "EDIT_MADRASAH", id);
    },
    [translate]
  );

  const handleDelete = useCallback(async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the madrasah.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Simulate API call
          setIsLoading(true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          Swal.fire("Deleted!", "The madrasah has been removed.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the madrasah.", "error");
        } finally {
          setIsLoading(false);
        }
      }
    });
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle filter button clicks
  const handleFilterClick = useCallback(
    (filterType) => {
      setActiveFilter(activeFilter === filterType ? "all" : filterType);
      setCurrentPage(1); // Reset to first page when filtering
    },
    [activeFilter]
  );

  const columnsMadrasah = [
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
      width: 80,
      render: (row) => <p className="text-sm">{row.ID}</p>,
    },
    {
      title: translate("Code"),
      field: "Code",
      hozAlign: "center",
      width: 90,
      render: (row) => <p className="text-sm">{row.Code}</p>,
    },
    {
      title: translate("Database Name"),
      field: "DatabaseName",
      hozAlign: "left",
      render: (row) => (
        <p className="text-sm truncate max-w-xs">{row.DatabaseName}</p>
      ),
    },
    {
      title: translate("Institution Name"),
      field: "InstitutionName",
      hozAlign: "left",
      render: (row) => (
        <p className="text-sm truncate max-w-xs">{row.InstitutionName}</p>
      ),
    },
    {
      title: translate("Created At"),
      field: "CreateAt",
      hozAlign: "center",
      width: 120,
      render: (row) => <p className="text-sm">{row.CreateAt}</p>,
    },
    {
      title: translate("Last Login"),
      field: "LastLogin",
      hozAlign: "center",
      width: 150,
      render: (row) => <p className="text-sm">{row.LastLogin}</p>,
    },
    {
      title: translate("Balance"),
      field: "Balance",
      hozAlign: "center",
      width: 100,
      render: (row) => <p className="text-sm font-medium">${row.Balance}</p>,
    },
    {
      title: translate("Status"),
      field: "Status",
      hozAlign: "center",
      width: 110,
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.Status === "Active"
              ? "bg-green-100 text-green-800"
              : row.Status === "Inactive"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.Status}
        </span>
      ),
    },
    {
      title: translate("Online"),
      field: "Online",
      hozAlign: "center",
      width: 100,
      render: (row) => (
        <div className="flex items-center justify-center">
          <span
            className={`inline-block w-3 h-3 rounded-full mr-2 ${
              row.Online === "Online" ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
          <span className="text-sm">{row.Online}</span>
        </div>
      ),
    },
    {
      title: translate("Actions"),
      field: "actions",
      hozAlign: "center",
      width: 120,
      headerSort: false,
      render: (row) => (
        <div className="flex justify-center space-x-2">
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

  return (
    <div className="font-lato bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col">
        <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 mb-6 gap-4">
          <h3 className="font-SolaimanLipi text-2xl font-bold text-gray-800">
            {translate("All Madrasah List")}
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              onClick={() => handleOpenModal()}
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
              {translate("Add Madrasah")}
            </Button>
          </div>
        </div>

        {/* Search and Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="">
            <div className="relative">
              <input
                type="text"
                placeholder={translate("Search madrasah...")}
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

          {/* Stats Buttons with filter functionality */}
          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === "all"
                ? "bg-blue-100 border-blue-300"
                : "bg-blue-50 border-blue-100 hover:bg-blue-100"
            }`}
            onClick={() => handleFilterClick("all")}
          >
            <div className="text-2xl font-bold text-blue-700">
              {stats.totalUsers}
            </div>
            <div className="text-xs font-medium text-blue-600">
              {translate("Total Users")}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === "active"
                ? "bg-green-100 border-green-300"
                : "bg-green-50 border-green-100 hover:bg-green-100"
            }`}
            onClick={() => handleFilterClick("active")}
          >
            <div className="text-2xl font-bold text-green-700">
              {stats.active}
            </div>
            <div className="text-xs font-medium text-green-600">
              {translate("Active")}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === "inactive"
                ? "bg-red-100 border-red-300"
                : "bg-red-50 border-red-100 hover:bg-red-100"
            }`}
            onClick={() => handleFilterClick("inactive")}
          >
            <div className="text-2xl font-bold text-red-700">
              {stats.inactive}
            </div>
            <div className="text-xs font-medium text-red-600">
              {translate("Inactive")}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === "online"
                ? "bg-purple-100 border-purple-300"
                : "bg-purple-50 border-purple-100 hover:bg-purple-100"
            }`}
            onClick={() => handleFilterClick("online")}
          >
            <div className="text-2xl font-bold text-purple-700">
              {stats.online}
            </div>
            <div className="text-xs font-medium text-purple-600">
              {translate("Online")}
            </div>
          </div>

          <div
            className={`p-3 rounded-lg text-center border cursor-pointer transition-colors ${
              activeFilter === "offline"
                ? "bg-gray-100 border-gray-300"
                : "bg-gray-50 border-gray-100 hover:bg-gray-100"
            }`}
            onClick={() => handleFilterClick("offline")}
          >
            <div className="text-2xl font-bold text-gray-700">
              {stats.offline}
            </div>
            <div className="text-xs font-medium text-gray-600">
              {translate("Offline")}
            </div>
          </div>
        </div>

        {/* Active filter indicator */}
        {activeFilter !== "all" && (
          <div className="mb-4 flex items-center">
            <span className="text-sm text-gray-600 mr-2">Active filter:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md capitalize">
              {activeFilter}
            </span>
            <button
              onClick={() => setActiveFilter("all")}
              className="ml-2 text-blue-600 text-sm hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <SortableTable
            columns={columnsMadrasah}
            data={paginatedData}
            className="min-w-full"
            isFilterColumn={false}
          />
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing {paginatedData.length} of {filteredData.length} madrasahs
            {activeFilter !== "all" && ` (filtered by ${activeFilter})`}
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
