import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import FilterSelectGroup from "../components/Forms/SelectGroup/FilterSelectGroup";
import { useLocation, useNavigate } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import {
  useGetTeacherInfoNotRegisteredQuery,
  useGetTeacherInfoQuery,
} from "../features/teachers/teachersSlice";
import Loading from "../components/Loading/Loading";
import SvgIcon from "../components/icons/SvgIcon";
import EditButton from "../components/Button/EditButton";
import DeleteButton from "../components/Button/DeleteButton";

const PAGE_SIZE = 10;

const AddTeacher = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translate = useTranslate();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const {
    data: teacherList = [],
    isLoading: teacherInfoLoading,
    isError: teacherInfoError,
  } = useGetTeacherInfoQuery();

  const {
    data: teacherInfoNR = [],
    isLoading: teacherInfoNRLoading,
    isError: teacherInfoNRError,
  } = useGetTeacherInfoNotRegisteredQuery();

  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = filter === 2 ? teacherInfoNRLoading : teacherInfoLoading;
  const isError = filter === 2 ? teacherInfoNRError : teacherInfoError;
  const allData = filter === 2 ? teacherInfoNR : teacherList;
  const totalPages = Math.ceil(allData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allData.slice(start, start + PAGE_SIZE);
  }, [allData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback((id) => {
    showModal(translate("Teacher Register"), "ADD_TEACHER", id);
  }, []);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Teacher Info Update"), "EDIT_TEACHER", id);
    },
    [translate]
  );

  const handleDelete = useCallback((id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the teacher info.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", "The teacher info has been removed.", "success");
      }
    });
  }, []);

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load teacher data</p>;

  const columnsAdmitedStudent = [
    { title: translate("User ID"), field: "UserID", hozAlign: "center" },
    {
      title: translate("Teacher Code"),
      field: "TeacherCode",
      hozAlign: "center",
      render: (row) => <p>{row.User?.UserCode}</p>,
    },
    { title: translate("Serial"), field: "Serial", hozAlign: "center" },
    {
      title: translate("Name"),
      field: "UserName",
      hozAlign: "center",
      render: (row) => <p>{row.User?.UserName}</p>,
    },
    {
      title: translate("Father Name"),
      field: "FatherName",
      hozAlign: "center",
      render: (row) => <p>{row.User?.FatherName}</p>,
    },
    {
      title: translate("Mobile1"),
      field: "Mobile1",
      hozAlign: "center",
      render: (row) => <p>{row.User?.Mobile1}</p>,
    },
    {
      title: translate("Date of join"),
      field: "CreateAt",
      hozAlign: "center",
      render: (row) => new Date(row.JoiningDate).toLocaleDateString("en-GB"),
    },
    {
      title: translate("Action"),
      field: "SessionSerial",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.UserID)} />
          <DeleteButton onClick={() => handleDelete(row.UserID)} />
        </div>
      ),
    },
  ];

  const columnsNotAdmitedStudent = [
    { title: translate("User ID"), field: "UserID", hozAlign: "center" },
    { title: translate("Teacher Code"), field: "UserCode", hozAlign: "center" },
    { title: translate("Name"), field: "UserName" },
    {
      title: translate("Gender"),
      field: "GenderID",
      hozAlign: "center",
      render: (row) => {
        const genderMap = { 1: "Male", 2: "Female", 3: "Other" };
        return genderMap[row.GenderID] || "N/A";
      },
    },
    {
      title: translate("Date of join"),
      field: "CreateAt",
      hozAlign: "center",
      render: (row) => new Date(row.CreateAt).toLocaleDateString("en-GB"),
    },
    {
      title: translate("Action"),
      field: "SessionSerial",
      hozAlign: "center",
      render: (row) => (
        <button
          onClick={() => handleOpenModal(row.UserID)}
          className="px-4 py-2 bg-rose-500 text-white rounded"
        >
          {translate("Register")}
        </button>
      ),
    },
  ];

  return (
    <div className="-translate-y-4 font-lato bg-white p-6 mt-5 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {filter === 2
              ? translate("Not Admitted Teacher List")
              : translate("Admitted Teacher List")}
          </h3>
          <div className="flex items-center space-x-5">
            <div className="filter relative">
              <FilterSelectGroup
                defaultSelect={filter}
                options={[
                  { id: 0, value: translate("Admitted Teacher List") },
                  { id: 2, value: translate("Not Admitted Teacher List") },
                ]}
                nameField="value"
                valueField="id"
              />
            </div>
          </div>
        </div>

        <SortableTable
          columns={
            filter === 2 ? columnsNotAdmitedStudent : columnsAdmitedStudent
          }
          data={paginatedData}
        />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <SvgIcon name={"MdKeyboardArrowLeft"} size={18} />
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            Next
            <SvgIcon name={"MdKeyboardArrowRight"} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTeacher;
