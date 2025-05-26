import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../features/auth/authSlice";
import SortableTable from "../../components/Tables/SortableTable";
import Swal from "sweetalert2";
import { FiEdit } from "react-icons/fi";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { PiPrinterFill } from "react-icons/pi";
import useTranslate from "../../utils/Translate";
import { showModal } from "../../utils/ModalControlar";
import LoadingComponent from "../../components/Loading/Loading";
import { useGetStudentsVacationListQuery } from "../../features/student/studentQuerySlice";
import Button from "../Button/Button";

const StudentVacationListTable = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: getStudentsVacationList,
    error: studentsVacationListError,
    isLoading: isStudentsVacationListLoading,
  } = useGetStudentsVacationListQuery({ page: currentPage, limit: 10 });

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: translate("Are you sure?"),
        text: translate(
          "This action will permanently delete the student vacation."
        ),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: translate("Yes, delete it!"),
        cancelButtonText: translate("Cancel"),
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            icon: "success",
            title: translate("Deleted!"),
            text: translate("The record has been removed."),
            confirmButtonColor: "#3085d6",
            confirmButtonText: translate("OK"),
          });
          // TODO: Implement actual delete API call here
        }
      });
    },
    [translate]
  );

  const handleOpenModal = useCallback(() => {
    showModal(translate("Create Student Vacation Info"), "ADD_STUDENTVACATION");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate("Update Student Vacation Info"),
        "EDIT_STUDENTVACATION",
        id
      );
    },
    [translate]
  );

  if (isStudentsVacationListLoading) return <LoadingComponent />;

  if (studentsVacationListError) {
    Swal.fire({
      icon: "error",
      title: translate("Failed to load student vacation list"),
      text: translate("Please try again later."),
      confirmButtonColor: "#d33",
      confirmButtonText: translate("OK"),
    });
    return null;
  }

  const {
    data = [],
    totalPages = 1,
    currentPage: serverPage = 1,
  } = getStudentsVacationList || {};

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const columns = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title={translate("Delete")}
            onClick={() => handleDelete(row.ID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title={translate("Edit")}
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md"
            title={translate("Print")}
          >
            <PiPrinterFill className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("ইউজার কোড"), // User Code in Bengali
      field: "UserCode",
      hozAlign: "center",
      render: (row) => <p>{row.User?.UserCode}</p>,
    },
    {
      title: translate("User Name"),
      field: "UserName",
      hozAlign: "center",
      render: (row) => <p>{row.User?.UserName}</p>,
    },
    {
      title: translate("Class Name"),
      field: "ClassName",
      hozAlign: "center",
      render: (row) => <p>{row.AcademicClass?.ClassName}</p>,
    },
    {
      title: translate("Vacation Type"),
      field: "VacationType.VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationType?.VacationList}</p>,
    },
    {
      title: translate("From Date"),
      field: "VacationDateFrom",
      hozAlign: "center",
      formatter: (cell) =>
        new Date(cell.getValue()).toLocaleDateString("bn-BD"),
    },
    {
      title: translate("To Date"),
      field: "VacationDateTo",
      hozAlign: "center",
      formatter: (cell) =>
        new Date(cell.getValue()).toLocaleDateString("bn-BD"),
    },
    {
      title: translate("Comment"),
      field: "Comment",
      hozAlign: "center",
      render: (row) => (
        <div className="w-[200px] whitespace-pre-wrap">
          <p>{row.Comment}</p>
        </div>
      ),
    },
    {
      title: translate("UserHolidayNo"),
      field: "UserHolidayNo",
      hozAlign: "center",
    },
  ];

  return (
    // <div className="-translate-y-4 font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="w-full flex flex-col gap-5 mb-3">
            <div className="flex justify-start gap-5 sm:gap-0 items-center">
              {/* Left Buttons */}
              <div className="flex flex-wrap justify-start gap-3 order-2 md:order-1">
                <Button className="bg-[#007af7] text-white hover:bg-blue-600">
                  {translate("Single")}
                </Button>
                <Button className="bg-[#007af7] text-white hover:bg-blue-600">
                  {translate("Class Based")}
                </Button>
              </div>
            </div>
            <div className="flex justify-between w-full gap-5 sm:gap-0 items-center">
              {/* Left Buttons */}
              <h3 className="font-SolaimanLipi text-[20px] font-bold">
                {translate("List of holidays")}
              </h3>
              <Button
                onClick={handleOpenModal}
                className="bg-[#007af7] text-white hover:bg-blue-600"
              >
                {translate("Create Vacation")}
              </Button>
            </div>
          </div>
        </div>

        <SortableTable columns={columns} data={data} />

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <MdKeyboardArrowLeft className="text-lg" />
            {translate("Prev")}
          </button>

          <span className="text-sm font-medium text-gray-700">
            {translate("Page")} {currentPage} {translate("of")} {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            {translate("Next")}
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVacationListTable;
