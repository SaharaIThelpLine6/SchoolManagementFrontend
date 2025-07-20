import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { FiDelete, FiEdit } from "react-icons/fi";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import { showModal } from "../utils/ModalControlar";
import { setPageName } from "../features/auth/authSlice";
import {
  useDeleteDesignationMutation,
  useGetDesignationQuery,
} from "../features/teachers/teachersSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";

const PAGE_SIZE = 10;

const DoubleStudentD = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const location = useLocation();

  // Redux state and queries
  const { residential, error: settingsError } = useSelector(
    (state) => state.settings
  );
  const {
    data: designation = [],
    isLoading,
    isError,
  } = useGetDesignationQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: examData } = useGetExamNamesQuery();
  const [deleteDesignation] = useDeleteDesignationMutation();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

  // Static data
  const reportData = [
    { ReportID: 1, ReportName: "A4 মার্কশীট" },
    { ReportID: 2, ReportName: "A5 মার্কশীট" },
  ];

  const optionalData = [
    { OptionalID: 1, optional: "With Optional" },
    { OptionalID: 2, optional: "Without Optional" },
  ];

  // Effects
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (isError) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load designation data",
      });
    }
  }, [isError]);

  // Memoized values
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);

  // Handlers
  const handleOpenModal = useCallback(() => {
    showModal(translate("Create Designation"), "ADD_DESIGNATION");
  }, [translate]);

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

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Table columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="delete"
            onClick={() => handleEditOpenModal(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    { title: "SL", field: "SL", hozAlign: "center" },
    {
      title: translate("Student Name"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Class"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Sequential"),
      field: "Designation",
      hozAlign: "center",
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
      <div className="space-y-6">
        <FormProvider {...methods}>
          <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
              {translate(pageTitle)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">
              <DefaultSelect
                options={reportData}
                require="Report is required"
                nameField="ReportName"
                valueField="ReportID"
                registerKey="ReportID"
                label={`${translate("Report")} :`}
              />
              <DefaultSelect
                options={sessionData || []}
                require="Session is required"
                nameField="SessionName"
                valueField="SessionID"
                registerKey="SessionID"
                type="number"
                label={`${translate("Session")} :`}
              />
              <DefaultSelect
                options={examData || []}
                require="Exam is required"
                nameField="ExamName"
                valueField="ExamID"
                registerKey="ExamID"
                label={`${translate("Exam")} :`}
                unicode={true}
              />
            </div>
          </div>
        </FormProvider>

        <SortableTable columns={columns} data={paginatedData} />

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400 transition-colors"
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
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50 hover:bg-gray-400 transition-colors"
          >
            Next
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoubleStudentD;
