import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import Button from "../components/Button/Button";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import { useGetDesignationQuery } from "../features/teachers/teachersSlice";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import SortableTable from "../components/Tables/SortableTable";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

const OnlineResultPublic = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const { residential, error: settingsError } = useSelector(
    (state) => state.settings
  );
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: examData } = useGetExamNamesQuery();

  const {
    data: designation = [],
    isLoading,
    isError,
  } = useGetDesignationQuery();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

  // Memoized values
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Table columns
  const columns = [
    {
      title: translate("Session"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Exam Name"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Class/Jamaat"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Result Type"),
      field: "Designation",
      hozAlign: "center",
    },
    { title: "SL", field: "SL", hozAlign: "center" },
  ];
  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
        {/* Top Section - Title and Filters */}
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
            {translate(pageTitle)}
          </h2>

          <FormProvider {...methods}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">
              <DefaultSelect
                options={sessionData || []}
                require={"Session is required"}
                nameField={"SessionName"}
                valueField={"SessionID"}
                registerKey={"SessionID"}
                type={"number"}
                label={translate("Session") + " :"}
              />
              <DefaultSelect
                options={examData || []}
                require={"Exam is required"}
                nameField={"ExamName"}
                valueField={"ExamID"}
                registerKey={"ExamID"}
                label={translate("Exam") + " :"}
                unicode={true}
              />
              <DefaultSelect
                options={subClassData || []}
                require={"SubClass is required"}
                nameField={"SubClass"}
                valueField={"SubClassID"}
                registerKey={"SubClassID"}
                label={translate("Class/Jamaat") + " :"}
                unicode={true}
              />
            </div>
          </FormProvider>
        </div>
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
    </>
  );
};

export default OnlineResultPublic;
