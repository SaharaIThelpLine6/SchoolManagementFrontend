import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import { FiEdit } from "react-icons/fi";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Button from "../components/Button/Button";
import {
  useGetStudentsVacationTypeListQuery,
  useDeleteStudentsVacationTypeMutation,
} from "../features/student/studentQuerySlice";

const PAGE_SIZE = 10;

const TypeOfVacation = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const [
    deleteVacationType,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteStudentsVacationTypeMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate("Type of holiday create"), "ADD_TYPEOFVACATION");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Type of holiday update"), "EDIT_TYPEOFVACATION", id);
    },
    [translate]
  );

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the vacation type.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteVacationType(id).unwrap();
            Swal.fire(
              "Deleted!",
              "The vacation type has been removed.",
              "success"
            );
          } catch (error) {
            Swal.fire("Error!", "Failed to delete the vacation type.", "error");
          }
        }
      });
    },
    [deleteVacationType]
  );

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columnsVacationType = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.ID)}
            disabled={isDeleteLoading}
          >
            <MdDelete className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
            disabled={isDeleteLoading}
          >
            <FiEdit className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Vacation Type"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate("Type of vacation list")}
          </h3>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {translate("Create Vacation Type")}
          </Button>
        </div>

        <SortableTable columns={columnsVacationType} data={paginatedData} />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <MdKeyboardArrowLeft className="text-lg" />
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
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypeOfVacation;
