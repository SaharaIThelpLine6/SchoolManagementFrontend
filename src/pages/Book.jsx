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
import { FiTrash2 } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Button from "../components/Button/Button";
import {
  useDeleteAcademicSubjectMutation,
  useGetAcademicSubjectsQuery,
} from "../features/class/classQuerySlice";

const PAGE_SIZE = 10;

const Book = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: academicSubjectData = [],
    isError,
    isLoading,
  } = useGetAcademicSubjectsQuery();
  const [deleteSubject, { isLoading: isDeleting }] =
    useDeleteAcademicSubjectMutation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Provide default empty array if data is undefined
  const currentData = academicSubjectData || [];
  const totalPages = Math.ceil(currentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate("Add Book"), "ADD_BOOK");
  }, [translate]);

  const handleEditSubject = useCallback(
    (id) => {
      showModal(translate("Update Book"), "UPDATE_BOOK", id);
    },
    [translate]
  );

  const handleDeleteSubject = useCallback(
    (id) => {
      Swal.fire({
        title: translate("Are you sure?"),
        text: translate("You won't be able to revert this!"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: translate("Yes, delete it!"),
        cancelButtonText: translate("Cancel"),
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSubject(id).unwrap();

            Swal.fire({
              title: translate("Deleted!"),
              text: translate("The subject has been deleted."),
              icon: "success",
            });
          } catch (error) {
            console.error("Delete failed:", error);
            Swal.fire({
              title: translate("Error"),
              text:
                error.data?.message || translate("Failed to delete subject"),
              icon: "error",
            });
          }
        }
      });
    },
    [translate, deleteSubject]
  );

  const columnsDistribution = [
    {
      title: translate("Action"),
      hozAlign: "center",
      width: 120,
      headerSort: false,
      render: (data) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditSubject(data.SubjectID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDeleteSubject(data.SubjectID)}
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Subject ID"),
      field: "SubjectID",
      hozAlign: "center",
      width: 120,
      sorter: "number",
    },
    {
      title: translate("Subject Name"),
      field: "SubjectName",
      hozAlign: "left",
      width: 200,
      sorter: "string",
    },
    {
      title: translate("English Name"),
      field: "EngSubjectName",
      hozAlign: "left",
      width: 200,
      sorter: "string",
    },
    {
      title: translate("Arabic Name"),
      field: "ArabicSubject",
      hozAlign: "right",
      width: 200,
    },
    {
      title: translate("Class Group"),
      field: "SubClassID",
      hozAlign: "center",
      width: 150,
      sorter: "number",
      formatter: (cell) => {
        // You can map SubClassID to actual group names if needed
        return `Group ${cell.getValue()}`;
      },
    },
    {
      title: translate("Serial"),
      field: "SubSerial",
      hozAlign: "center",
      width: 100,
      sorter: "number",
    },
    {
      title: translate("Created At"),
      field: "CreateAt",
      hozAlign: "center",
      width: 180,
      sorter: "date",
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString("en-GB");
      },
    },
    {
      title: translate("Updated At"),
      field: "UpdateAt",
      hozAlign: "center",
      width: 180,
      sorter: "date",
      render: (row) => {
        const date = row.UpdateAt ? new Date(row.UpdateAt) : null;
        return date && !isNaN(date) ? date.toLocaleDateString("en-GB") : "N/A";
      },
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <div>{translate("Error loading data")}</div>;

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate("Book List")}
          </h3>
          <Button onClick={() => handleOpenModal()}>
            {translate("Add Book")}
          </Button>
        </div>

        {currentData.length > 0 ? (
          <>
            <SortableTable
              columns={columnsDistribution}
              data={paginatedData}
              isFilterColumn={false}
            />

            {/* Pagination Controls */}
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
          </>
        ) : (
          <div className="text-center py-8">
            {translate("No data available")}
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
