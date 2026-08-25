import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { setPageName } from "../features/auth/authSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import { useGetExamNamesQuery } from "../features/student/studentQuerySlice";
import TableInput from "../components/Input/TableInput";
import {
  useGetUserResultQuery,
  useUpdateAndPostResultMutation,
} from "../features/result/resultSilce";
import bnBijoy2Unicode from "../utils/conveter";
import Loading from "../components/Loading/Loading";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import DefaultInput from "../components/Forms/DefaultInput";

const PAGE_SIZE = 10;

const PointBasedResultCreateUpdate = ({ pageTitle }) => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: {
      SessionID: searchParams.get("session_id") || "",
      ExamID: searchParams.get("exam_id") || "",
      SubClassID: searchParams.get("subclass_id") || "",
    },
  });
  const { handleSubmit, setValue, watch } = methods;
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);

  const [updateAndPostResult] = useUpdateAndPostResultMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const session_id = watch("SessionID");
  const exam_id = watch("ExamID");
  const subclass_id = watch("SubClassID");
  const selectedSubject = watch("subjectSelect");
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

  useEffect(() => {
    if (isLoading) return;

    // Check if userResultData is empty array or undefined
    if (error || !userResultData || userResultData.length === 0) {
      Swal.fire({
        title: 'Data Not Found',
        text: 'The requested result data could not be found.',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate("/result");
      });
    }
  }, [userResultData, isLoading, error, navigate]);

  useEffect(() => {
    if (userResultData && userResultData.length > 0) {
      const formattedStudents = userResultData.map((student) => {
        const allSubjects = [];

        student.Subjects?.forEach((subject, index) => {
          const subValKey = `SubVal${index + 1}`;
          const subVal = student[subValKey];

          // Only include subjects with non-zero values (or all subjects)
          // Change condition based on your needs
          if (subVal !== null && subVal !== undefined) {
            allSubjects.push({
              SubjectName: subject.SubjectName,
              SubValKey: subValKey,
              Value: subVal,
            });
          }
        });

        return {
          ID: student.ID,
          UserID: student.UserID,
          UserName: student.User?.UserName,
          UserCode: student.User?.UserCode,
          Subjects: allSubjects.map((s) => s.SubjectName),
          allSubjects,
          Total: student.Total,
          Division: student?.Division?.DivisionNames, // or whatever field holds the division
        };
      });

      console.log("Formatted students:", formattedStudents);
      setStudents(formattedStudents);
    }
  }, [userResultData]);





  const startID = watch("StartID");
  const endID = watch("EndID");

  // Filter students by ID range
  // Filter students by ID range
  console.log(students);

  const filteredByID = students.filter((student) => {
    const code = Number(student.UserCode);

    if (!startID && !endID) return true;
    if (startID && !endID) return code >= Number(startID);
    if (!startID && endID) return code <= Number(endID);
    return code >= Number(startID) && code <= Number(endID);
  });

  const totalPages = Math.ceil(filteredByID.length / PAGE_SIZE) || 1;

  // const paginatedData = students;


  const paginatedData = filteredByID.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  // filteredByID.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // const totalPages = Math.ceil(students?.length / PAGE_SIZE) || 1;

  // const paginatedData =
  //   students?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ||
  //   [];
  useEffect(() => {
    setCurrentPage(1);
  }, [startID, endID]);
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }

    const studentResults = students
      .filter((student) => {
        console.log(student);

        if (startID && startID > student.UserCode) {
          return false;
        }

        if (endID && endID < student.UserCode) {
          return false;
        }

        return true;
      })
      .map((student) => {
        const originalStudentData = userResultData?.examList?.find(
          (s) => s.ID === student.ID
        );

        const subjectsWithValues = student.Subjects.map((subjectName, index) => {
          const originalSubject = originalStudentData?.Subjects?.[index];

          return {
            SubjectID: originalSubject?.SubjectID || 0,
            [`SubVal${index + 1}`]:
              data.students?.[student.ID]?.[`SubVal${index + 1}`] ||
              student[`SubVal${index + 1}`] ||
              0,
          };
        });

        return {
          UserID: student.UserID,
          Subjects: subjectsWithValues,
        };
      });

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      StudentResults: studentResults,
    };

    try {
      const response = await updateAndPostResult(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Results সফলভাবে সংরক্ষিত হয়েছে।",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.message || "অজানা একটি ত্রুটি ঘটেছে।",
      });
    }
  };

  const handleKeyboardNavigation = (e) => {
    const isEnter = e.key === "Enter";
    const isTab = e.key === "Tab";

    if (!isEnter && !isTab) return;

    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);

    // Get all visible input cells to compute max col/row counts
    const totalRows = paginatedData.length;

    // Determine visible subject count for the current view
    const visibleSubjectCount = paginatedData[0]?.allSubjects?.filter(
      (subject) =>
        selectedSubject ? subject.SubjectName === selectedSubject : true
    ).length ?? 0;

    if (isEnter) {
      // Move DOWN — same col, next row
      e.preventDefault();

      const nextRow = row + 1;

      if (nextRow < totalRows) {
        const nextInput = document.querySelector(
          `input[data-row="${nextRow}"][data-col="${col}"]`
        );
        nextInput?.focus();
      }
      // If last row, do nothing (or you could wrap to top — your call)
    }

    if (isTab) {
      e.preventDefault();

      if (e.shiftKey) {
        // Shift+Tab → move LEFT (previous subject), or go to last col of previous row
        const prevCol = col - 1;
        if (prevCol >= 0) {
          const prevInput = document.querySelector(
            `input[data-row="${row}"][data-col="${prevCol}"]`
          );
          prevInput?.focus();
        } else if (row > 0) {
          // wrap to last col of previous row
          const prevInput = document.querySelector(
            `input[data-row="${row - 1}"][data-col="${visibleSubjectCount - 1}"]`
          );
          prevInput?.focus();
        }
      } else {
        // Tab → move RIGHT (next subject), or go to first col of next row
        const nextCol = col + 1;
        if (nextCol < visibleSubjectCount) {
          const nextInput = document.querySelector(
            `input[data-row="${row}"][data-col="${nextCol}"]`
          );
          nextInput?.focus();
        } else if (row + 1 < totalRows) {
          // wrap to first col of next row
          const nextInput = document.querySelector(
            `input[data-row="${row + 1}"][data-col="0"]`
          );
          nextInput?.focus();
        }
      }
    }
  };

  if (isLoading) return <div><Loading /></div>;
  if (error) return <div>Error: {error.message}</div>;

  // Filter subject function
  const filteredSubjects = selectedSubject
    ? paginatedData[0]?.Subjects?.filter(
      (subject) => subject === selectedSubject
    )
    : paginatedData[0]?.Subjects;

  return (
    <FormProvider {...methods}>
      <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-lg">
        <div className="filter_header flex items-center justify-between pt-5">
          <h3 className="text-xl font-bold">
            {id ? "Result Update" : "Result Entry"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          onKeyDown={(e) => {
            // Prevent form submit on Enter everywhere except textarea
            if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" {...methods.register("ID")} />

          <div className="flex gap-4">
            <DefaultInput label={"Start ID"} registerKey="StartID" />
            <DefaultInput label={"End ID"} registerKey="EndID" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DefaultSelect
              label={translate("Session")}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode={true}
              require={true}
            />
            <DefaultSelect
              label={translate("Exam Name")}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode={true}
              require={true}
            />
            <DefaultSelect
              label={translate("Class/Jamaat")}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
              require={true}
            />
            {students.length > 0 && students[0].allSubjects && (
              <DefaultSelect
                label={translate("Subjects")}
                options={students[0].allSubjects ?? []}
                valueField="SubjectName"
                nameField="SubjectName"
                registerKey="subjectSelect"
              />

            )}
          </div>

          {paginatedData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border whitespace-nowrap w-16">
                      {translate("ID")}
                    </th>
                    <th className="p-2 border whitespace-nowrap w-40">
                      {translate("Student Name")}
                    </th>
                    {/* Dynamically render subject headers */}
                    {filteredSubjects?.map((subject, index) => (
                      <th
                        key={`header-${index}`}
                        className="p-2 border whitespace-nowrap w-20"
                      >
                        {subject}
                      </th>
                    ))}
                    <th className="p-2 border whitespace-nowrap w-20">
                      {translate("Total")}
                    </th>
                    <th className="p-2 border whitespace-nowrap w-20">
                      {translate("GPA")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((student, rowIndex) => {
                    // Compute the visible subjects for this row (same filter as header)
                    const visibleSubjects = student.allSubjects.filter(
                      (subject) =>
                        selectedSubject
                          ? subject.SubjectName === selectedSubject
                          : true
                    );

                    return (
                      <tr
                        key={`student-${student.ID}`}
                        className="bg-transparent"
                      >
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student?.UserCode}
                        </td>
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student.UserName}
                        </td>
                        {/* Dynamically render subject inputs with row/col data attrs */}
                        {visibleSubjects.map((subject, colIndex) => (
                          <td
                            key={`${student.ID}-subject-${subject.SubValKey}`}
                            className="border"
                          >
                            <TableInput
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={subject.Value}
                              // ↓ Pass row & col so the keyboard handler can find neighbours
                              data-row={rowIndex}
                              data-col={colIndex}
                              onKeyDown={handleKeyboardNavigation}
                              registerKey={`students.${student.ID}.${subject.SubValKey}`}
                            />
                          </td>
                        ))}

                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student.Total}
                        </td>
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student.Division}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {translate("Save Results")}
            </Button>

            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </form>
      </div>
    </FormProvider>
  );
};
export default PointBasedResultCreateUpdate;

