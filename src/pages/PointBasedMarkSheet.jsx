import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import Button from "../components/Button/Button";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import MarkSheetPdf from "../view/result/MarkSheetPdf";
import {
  useGetUserResultQuery,
  useGetUserSingleResultQuery,
} from "../features/result/resultSilce";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import bnBijoy2Unicode from "../utils/conveter";
import Swal from "sweetalert2";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SvgIcon from "../components/icons/SvgIcon";

const PAGE_SIZE = 10;

const PointBasedMarkSheet = ({ pageTitle }) => {
  const [searchParams] = useSearchParams();
  const translate = useTranslate();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [printID, setPrintID] = useState(null);
  const [printAll, setPrintAll] = useState(false);

  const methods = useForm({
    defaultValues: {
      SessionID: searchParams.get("session_id") || "",
      ExamID: searchParams.get("exam_id") || "",
      SubClassID: searchParams.get("subclass_id") || "",
    },
  });
  const { watch } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: examData } = useGetExamNamesQuery();

  const session_id = watch("SessionID");
  const exam_id = watch("ExamID");
  const subclass_id = watch("SubClassID");

  // Fetch main user result data for the list & filtering
  const {
    data: userResultData,
    isLoading,
    error,
  } = useGetUserResultQuery(
    { session_id, exam_id, subclass_id },
    {
      skip: !session_id || !exam_id || !subclass_id,
    }
  );

  // Safe fallback for examList array
  const examList = Array.isArray(userResultData?.examList)
    ? userResultData.examList
    : [];

  // Find selected exam data for single print
  const sdata = examList.find((item) => item.ID === printID);

  // Single student detailed result query — skip if no printID
  const { data: singleStudentResultData } = useGetUserSingleResultQuery(
    {
      session_id: sdata?.SessionID,
      exam_id: sdata?.ExamID,
      class_id: sdata?.SubClassID,
      user_id: sdata?.UserID,
    },
    { skip: !printID }
  );

  // All students detailed result query for printAll — skip if not printing all
  const { data: studentResultsData } = useGetUserSingleResultQuery(
    {
      session_id,
      exam_id,
      class_id: subclass_id,
    },
    { skip: !printAll }
  );


  useEffect(() => {
    if (isLoading) return;

    if (error || !userResultData || userResultData.examList?.length === 0) {
      Swal.fire({
        title: "Data Not Found",
        text: "The requested result data could not be found.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/result");
      });
    }
  }, [userResultData, isLoading, error, navigate]);

  // Reset current page when filters or examList changes
  useEffect(() => {
    setCurrentPage(1);
  }, [examList.length, session_id, exam_id, subclass_id]);

  const totalPages = Math.max(1, Math.ceil(examList.length / PAGE_SIZE));

  const paginatedData = examList.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Single print handler
  const handlePrint = (row) => () => {
    setPrintID(row?.ID);
    setPrintAll(false);
  };

  // Print all handler
  const handlePrintAll = () => {
    if (examList.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No data to print",
        text: "No exam data found. Please select filters to load data before printing.",
        confirmButtonText: "OK",
      });
    } else {
      setPrintAll(true);
      setPrintID(null);
    }
  };

  // Trigger print for single student when data loaded
  useEffect(() => {
    if (printID && singleStudentResultData?.[0]) {
      const timer = setTimeout(() => {
        window.print();
        setPrintID(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printID, singleStudentResultData]);

  // Trigger print for all students when data loaded
  useEffect(() => {
    if (
      printAll &&
      Array.isArray(studentResultsData) &&
      studentResultsData.length > 0
    ) {
      const timer = setTimeout(() => {
        window.print();
        setPrintAll(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printAll, studentResultsData]);

  const columns = [
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
    },
    {
      title: translate("Session"),
      field: "SessionID",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Session?.SessionName),
    },
    {
      title: translate("User Name"),
      field: "UserName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.User?.UserName),
    },
    {
      title: translate("Exam"),
      field: "ExamID",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Exam?.ExamName),
    },
    {
      title: translate("SubClass"),
      field: "SubClassID",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Class?.SubClass),
    },
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-md flex items-center gap-1"
            title="Print"
            onClick={handlePrint(row)}
          >
            <SvgIcon name={"MdLocalPrintshop"} size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 font-SolaimanLipi print:hidden">
        <FormProvider {...methods}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-start justify-center gap-4">
              <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
                {translate(pageTitle)}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full gap-4">
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

                <div className="flex justify-center items-center">
                  <Button className="sm:mt-6 w-full" onClick={handlePrintAll}>
                    {translate("All Print")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FormProvider>

        <div className="mt-5">
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="text-red-500 text-center py-4">
              {translate("Failed to load data. Please try again.")}
            </div>
          ) : (
            <SortableTable
              columns={columns}
              data={paginatedData}
              isFilterColumn={false}
            />
          )}
        </div>

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Print Preview Section */}
      <div className="portrait-page">
        <div className="w-full relative bg-white">
          <div className="pt-4 pb-1 px-8 bg-white">
            <div className="print_canvas">
              {printID && singleStudentResultData?.[0] && (
                <MarkSheetPdf studentResult={singleStudentResultData[0]} />
              )}

              {printAll &&
                Array.isArray(studentResultsData) &&
                studentResultsData.length > 0 &&
                studentResultsData.map((student, index) => (
                  <div
                    key={student.UserID || index}
                    className={
                      index !== studentResultsData.length - 1
                        ? "break-after-page"
                        : ""
                    }
                  >
                    <MarkSheetPdf studentResult={student} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PointBasedMarkSheet;
