import { useEffect, useMemo, useState } from "react";
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
import { useGetTeacherSubjectsByFilterQuery } from "../features/teachers/teachersSlice";
import { updateResultCell } from "../helper/socket";

const PAGE_SIZE = 10;

const ResultEntryAndUpdate = ({ pageTitle }) => {
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

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);
  const [cellSaveStatus, setCellSaveStatus] = useState({});

  const [updateAndPostResult] = useUpdateAndPostResultMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const session_id = watch("SessionID");
  const exam_id = watch("ExamID");
  const subclass_id = watch("SubClassID");
  const selectedSubject = watch("subjectSelect");

  // =========================
  // TEACHER SUBJECTS
  // =========================
  const { data: teacherSubjects = [] } = useGetTeacherSubjectsByFilterQuery(
    {
      SessionID: session_id,
      ExamID: exam_id,
      SubClassID: subclass_id,
    },
    { skip: !session_id || !exam_id || !subclass_id }
  );

  console.log("teacherSubjects:", teacherSubjects);

  // =========================
  // TEACHER SUBJECT NAMES
  // =========================
  const teacherSubjectNames = useMemo(() => {
    const rawTeachers = Array.isArray(teacherSubjects?.data)
      ? teacherSubjects.data
      : Array.isArray(teacherSubjects)
        ? teacherSubjects
        : [];

    return rawTeachers.map((t) => t.SubjectName).filter(Boolean);
  }, [teacherSubjects]);

  console.log("teacherSubjectNames:", teacherSubjectNames);

  // =========================
  // FILTERED STUDENT SUBJECTS (dropdown options)
  // =========================
  const filteredStudentSubjects = useMemo(() => {
    if (!Array.isArray(students) || students.length === 0) return [];

    const allSubjects = students[0]?.allSubjects;
    if (!Array.isArray(allSubjects)) return [];

    // Teacher এর কোনো subject না থাকলে সব দেখাও
    if (teacherSubjectNames.length === 0) return allSubjects;

    return allSubjects.filter((sub) =>
      teacherSubjectNames.includes(sub.SubjectName)
    );
  }, [students, teacherSubjectNames]);

  // =========================
  // ALLOWED SUBJECT NAMES (Dropdown এ যা আছে, টেবিলে শুধু তা-ই দেখাবে)
  // =========================
  const allowedSubjectNames = useMemo(() => {
    return filteredStudentSubjects.map((s) => s.SubjectName);
  }, [filteredStudentSubjects]);

  console.log("filteredStudentSubjects:", filteredStudentSubjects);

  // =========================
  // AUTO-SELECT if only one subject
  // =========================
  useEffect(() => {
    if (filteredStudentSubjects.length === 1 && !selectedSubject) {
      setValue("subjectSelect", filteredStudentSubjects[0].SubjectName);
    }
  }, [filteredStudentSubjects, selectedSubject, setValue]);

  // =========================
  // EFFECTIVE SUBJECT for table filter
  // =========================
  const effectiveSubject =
    selectedSubject ||
    (teacherSubjectNames.length === 1 ? teacherSubjectNames[0] : null);

  console.log("effectiveSubject:", effectiveSubject);

  // =========================
  // GET USER RESULT
  // =========================
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

    if (error || !userResultData || userResultData.length === 0) {
      Swal.fire({
        title: "Data Not Found",
        text: "The requested result data could not be found.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dashboard/result");
      });
    }
  }, [userResultData, isLoading, error, navigate]);

  // =========================
  // FORMAT STUDENTS
  // =========================
  useEffect(() => {
    if (userResultData && userResultData.length > 0) {
      const formattedStudents = userResultData.map((student) => {
        const allSubjects = [];

        student.Subjects?.forEach((subject, index) => {
          const subValKey = `SubVal${index + 1}`;
          const subVal = student[subValKey];

          if (subVal !== null && subVal !== undefined) {
            allSubjects.push({
              SubjectName: subject.SubjectName,
              SubjectID: subject.SubjectID,
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
          Division: student?.Division?.DivisionNames,
        };
      });

      console.log("Formatted students:", formattedStudents);
      setStudents(formattedStudents);
    }
  }, [userResultData]);

  // =========================
  // ID RANGE FILTER
  // =========================
  const startID = watch("StartID");
  const endID = watch("EndID");

  const filteredByID = students.filter((student) => {
    const code = Number(student.UserCode);

    if (!startID && !endID) return true;
    if (startID && !endID) return code >= Number(startID);
    if (!startID && endID) return code <= Number(endID);
    return code >= Number(startID) && code <= Number(endID);
  });

  const totalPages = Math.ceil(filteredByID.length / PAGE_SIZE) || 1;

  const paginatedData = filteredByID.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [startID, endID]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleResultCellBlur = async (student, subject, event) => {
    const cellKey = `students.${student.ID}.${subject.SubValKey}`;
    const rawValue = event.target.value;
    const payload = {
      UserID: student.UserID,
      SessionID: Number(session_id),
      ExamID: Number(exam_id),
      SubClassID: Number(subclass_id),
      SubjectID: subject.SubjectID,
      SubValKey: subject.SubValKey,
      Value: rawValue === "" ? null : Number(rawValue),
    };
    setCellSaveStatus((previous) => ({ ...previous, [cellKey]: "saving" }));
    try {
      await updateResultCell(payload);
      setCellSaveStatus((previous) => ({ ...previous, [cellKey]: "saved" }));
    } catch (error) {
      console.error("Result cell update error:", error.message);
      setCellSaveStatus((previous) => ({ ...previous, [cellKey]: "failed" }));
    }
  };

  

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }
    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID)
    };

    try {
      const response = await updateAndPostResult(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text:
          response?.message || "Exam Results সফলভাবে সংরক্ষিত হয়েছে।",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.message || "অজানা একটি ত্রুটি ঘটেছে।",
      });
    }
  };

  // =========================
  // KEYBOARD NAVIGATION
  // =========================
  const handleKeyboardNavigation = (e) => {
    const isEnter = e.key === "Enter";
    const isTab = e.key === "Tab";

    if (!isEnter && !isTab) return;

    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);

    const totalRows = paginatedData.length;

    // ===== CHANGE 1: allowedSubjectNames ব্যবহার করা হয়েছে =====
    const visibleSubjectCount =
      paginatedData[0]?.allSubjects?.filter((subject) => {
        if (effectiveSubject) return subject.SubjectName === effectiveSubject;
        return allowedSubjectNames.includes(subject.SubjectName);
      }).length ?? 0;

    if (isEnter) {
      e.preventDefault();
      const nextRow = row + 1;

      if (nextRow < totalRows) {
        const nextInput = document.querySelector(
          `input[data-row="${nextRow}"][data-col="${col}"]`
        );
        nextInput?.focus();
      }
    }

    if (isTab) {
      e.preventDefault();

      if (e.shiftKey) {
        const prevCol = col - 1;
        if (prevCol >= 0) {
          const prevInput = document.querySelector(
            `input[data-row="${row}"][data-col="${prevCol}"]`
          );
          prevInput?.focus();
        } else if (row > 0) {
          const prevInput = document.querySelector(
            `input[data-row="${row - 1}"][data-col="${visibleSubjectCount - 1
            }"]`
          );
          prevInput?.focus();
        }
      } else {
        const nextCol = col + 1;
        if (nextCol < visibleSubjectCount) {
          const nextInput = document.querySelector(
            `input[data-row="${row}"][data-col="${nextCol}"]`
          );
          nextInput?.focus();
        } else if (row + 1 < totalRows) {
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

  // =========================
  // FILTERED SUBJECTS for header
  // =========================
  // ===== CHANGE 2: allowedSubjectNames ব্যবহার করা হয়েছে =====
  const filteredSubjects = (paginatedData[0]?.Subjects || []).filter(
    (subject) => {
      if (effectiveSubject) return subject === effectiveSubject;
      return allowedSubjectNames.includes(subject);
    }
  );

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

            {filteredStudentSubjects.length > 0 && (
              <DefaultSelect
                label={translate("Subjects")}
                options={filteredStudentSubjects}
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

                    {/* Dynamic subject headers */}
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
                    // ===== CHANGE 3: allowedSubjectNames ব্যবহার করা হয়েছে =====
                    const visibleSubjects = student.allSubjects.filter(
                      (subject) => {
                        if (effectiveSubject) return subject.SubjectName === effectiveSubject;
                        return allowedSubjectNames.includes(subject.SubjectName);
                      }
                    );

                    return (
                      <tr key={`student-${student.ID}`} className="bg-transparent">
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student?.UserCode}
                        </td>
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student.UserName}
                        </td>

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
                              data-row={rowIndex}
                              data-col={colIndex}
                              onKeyDown={handleKeyboardNavigation}
                              onBlur={(event) =>
                                handleResultCellBlur(student, subject, event)
                              }
                              saveStatus={
                                cellSaveStatus[
                                  `students.${student.ID}.${subject.SubValKey}`
                                ]
                              }
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
              loading={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {translate("Refresh Results")}
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

export default ResultEntryAndUpdate;


