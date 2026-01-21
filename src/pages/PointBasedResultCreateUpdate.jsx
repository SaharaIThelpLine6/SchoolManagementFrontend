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

    if (error || !userResultData || userResultData.examList?.length === 0) {
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
    if (userResultData?.examList) {
      const formattedStudents = userResultData.examList.map((student) => {
        const allSubjects = [];

        student.Subjects?.forEach((subject, index) => {
          const subValKey = `SubVal${index + 1}`;
          const subVal = student[subValKey];

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
          Division: student.Division,
        };
      });

      setStudents(formattedStudents);
    }
  }, [userResultData]);





const startID = watch("StartID");
const endID = watch("EndID");

// Filter students by ID range
const filteredByID = students.filter((student) => {
  const code = Number(student.UserCode);

  if (!startID && !endID) return true;            // no filter
  if (startID && !endID) return code >= Number(startID);
  if (!startID && endID) return code <= Number(endID);

  return code >= Number(startID) && code <= Number(endID);
});

const totalPages = Math.ceil(filteredByID.length / PAGE_SIZE) || 1;

const paginatedData = filteredByID.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);







  // const totalPages = Math.ceil(students?.length / PAGE_SIZE) || 1;

  // const paginatedData =
  //   students?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ||
  //   [];

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

    const studentResults = students.map((student) => {
      const originalStudentData = userResultData?.examList?.find(
        (s) => s.ID === student.ID
      );

      const subjectsWithValues = student.Subjects.map((subjectName, index) => {
        const originalSubject = originalStudentData?.Subjects?.[index];

        return {
          SubjectID: originalSubject?.SubjectID || 0,
          // SubjectName: subjectName,
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
  const handleVerticalNavigation = (e) => {
    if (e.key !== "Enter" && e.key !== "Tab") return;

    e.preventDefault();

    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.col);

    // Find next row same column
    const nextInput = document.querySelector(
      `input[data-row="${row + 1}"][data-col="${col}"]`
    );

    if (nextInput) {
      nextInput.focus();
    }
  };

  if (isLoading) return <div><Loading/></div>;
  if (error) return <div>Error: {error.message}</div>;


  console.log(paginatedData);

  // filter subject funstion
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}>
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
                    <th className="p-2 border whitespace-nowrap w-16">{translate("ID")}</th>
                    <th className="p-2 border whitespace-nowrap w-40">
                      {translate("Student Name")}
                    </th>
                    {/* Dynamically render subject headers */}
                    {filteredSubjects?.map((subject, index) => {
                      return (
                        <th
                          key={`header-${index}`}
                          className="p-2 border whitespace-nowrap w-20"
                        >
                          {subject}
                        </th>
                      );
                    })}
                    <th className="p-2 border whitespace-nowrap w-20">{translate("Total")}</th>
                    <th className="p-2 border whitespace-nowrap w-20">{translate("GPA")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((student) => {
                    console.log(student, "student");
                    return (
                      <tr
                        key={`student-${student.ID}`}
                        className="bg-transparent"
                      >
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student?.UserCode}
                        </td>
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {bnBijoy2Unicode(student.UserName)}
                        </td>

                        {/* Dynamically render subject inputs */}
                        {student.allSubjects
                          .filter((subject) =>
                            selectedSubject
                              ? subject.SubjectName === selectedSubject
                              : true
                          )
                          .map((subject) => (
                            <td
                              key={`${student.ID}-subject-${subject.SubValKey}`}
                              className={`border`}
                            >
                              <TableInput
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={subject.Value}
                                onKeyDown={handleVerticalNavigation}
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
