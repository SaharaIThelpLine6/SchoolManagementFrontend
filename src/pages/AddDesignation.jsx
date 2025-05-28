import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import {
  useDeleteDesignationMutation,
  useGetDesignationQuery,
} from "../features/teachers/teachersSlice";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import useTranslate from "../utils/Translate";
import { FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";
import { showModal } from "../utils/ModalControlar"; // Make sure this path is correct
import Button from "../components/Button/Button";

const PAGE_SIZE = 10;
const AddDesignation = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const {
    data: designation = [],
    isLoading,
    isError,
  } = useGetDesignationQuery();
  const [deleteDesignation] = useDeleteDesignationMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);

  // Define all callbacks here, unconditionally
  const handleOpenModal = useCallback(() => {
    showModal(translate("Create Designation"), "ADD_DESIGNATION");
  }, []);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Update Designation"), "EDIT_DESIGNATION", id);
    },
    [translate]
  );

  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the designation.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDesignation(id).unwrap();

            Swal.fire(
              "Deleted!",
              "The designation has been removed.",
              "success"
            );
          } catch (error) {
            Swal.fire("Error!", "Failed to delete designation.", "error");
          }
        }
      });
    },
    [deleteDesignation]
  );

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load designation data</p>;

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const columns = [
    { title: "SL", field: "SL", hozAlign: "center" },
    {
      title: translate("Designation"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.DNID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 font-lato bg-white md:p-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-[#e9edf4] py-5 pt-0">
        <h3 className="text-xl font-bold">{pageTitle || "Designation List"}</h3>
        <Button
          onClick={() => handleOpenModal()}
        >
          {translate("Create Designation")}
        </Button>
      </div>

      <SortableTable columns={columns} data={paginatedData} />

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
  );
};

export default AddDesignation;
