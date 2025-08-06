import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import { setPageName } from "../features/auth/authSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import {
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../features/exam/examQuerySlice";

import useTranslate from "../utils/Translate";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import { useGetExamNamesQuery } from "../features/student/studentQuerySlice";
import TableInput from "../components/Input/TableInput";
import { useGetUserResultQuery } from "../features/result/resultSilce";
import bnBijoy2Unicode from "../utils/conveter";

const PAGE_SIZE = 10;

const PointBasedResultCreateUpdate = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit, setValue, watch } = methods;
  const { id } = useParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState([]);

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const session_id = watch("SessionID");
  const exam_id = watch("ExamID");
  const subclass_id = watch("SubClassID");

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

  console.log(session_id, exam_id, subclass_id, "Ids");
  console.log(userResultData, "userResultData");
  // console.log(
  //   userResultData?.examList?.map((student) => student.Subjects),
  //   "All Subjects"
  // );

  useEffect(() => {
    if (userResultData?.examList) {
      const formattedStudents = userResultData.examList.map((student) => ({
        ID: student.ID,
        UserID: student.UserID,
        UserName: student.User?.UserName,
        Subjects: student.Subjects.map((sub) => sub.SubjectName),
        SubVal1: student.SubVal1,
        SubVal2: student.SubVal2,
        SubVal3: student.SubVal3,
        SubVal4: student.SubVal4,
        SubVal5: student.SubVal5,
        SubVal6: student.SubVal6,
        SubVal7: student.SubVal7,
        SubVal8: student.SubVal8,
        SubVal9: student.SubVal9,
        SubVal10: student.SubVal10,
        SubVal11: student.SubVal11,
        SubVal12: student.SubVal12,
        SubVal13: student.SubVal13,
        SubVal14: student.SubVal14,
        Total: calculateTotal(student),
        GPA: calculateGPA(student),
      }));

      setStudents(formattedStudents);
    }
  }, [userResultData]);

  const calculateTotal = (student) => {
    let total = 0;
    for (let i = 1; i <= 14; i++) {
      total += student[`SubVal${i}`] || 0;
    }
    return total;
  };

  const calculateGPA = (student) => {
    const subjectCount = student.Subjects?.length || 1;
    const total = calculateTotal(student);
    return ((total / (subjectCount * 100)) * 4).toFixed(2); // Assuming max score is 100
  };

  const totalPages = Math.ceil(students?.length / PAGE_SIZE) || 1;

  const paginatedData =
    students?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) ||
    [];

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

    console.log(payload);

    // try {
    //   // const response = data.ID
    //   //   ? await updateExamFeeSetting({ id: data.ID, body: payload }).unwrap()
    //   //   : await postExamFeeSetting(payload).unwrap();
    //   console.log({ id: data.ID, body: payload });

    //   Swal.fire({
    //     icon: "success",
    //     title: "সফলভাবে সংরক্ষণ হয়েছে",
    //     text: response?.message || "Exam Results সফলভাবে সংরক্ষিত হয়েছে।",
    //   });
    // } catch (error) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "ত্রুটি ঘটেছে!",
    //     text: error?.data?.message || "অজানা একটি ত্রুটি ঘটেছে।",
    //   });
    // }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <FormProvider {...methods}>
      <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-lg">
        <div className="filter_header flex items-center justify-between pt-5">
          <h3 className="text-xl font-bold">
            {id ? "Result Update" : "Result Entry"}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...methods.register("ID")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          {paginatedData.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border whitespace-nowrap w-16">ID</th>
                    <th className="p-2 border whitespace-nowrap w-40">
                      শিক্ষার্থীর নাম
                    </th>
                    {/* Dynamically render subject headers */}
                    {paginatedData[0]?.Subjects?.map((subject, index) => (
                      <th
                        key={`header-${index}`}
                        className="p-2 border whitespace-nowrap w-20"
                      >
                        {subject}
                      </th>
                    ))}
                    <th className="p-2 border whitespace-nowrap w-20">মোট</th>
                    <th className="p-2 border whitespace-nowrap w-20">জিপিএ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((student) => {
                    // Calculate total marks for this student
                    const totalMarks = Array.from({
                      length: student.Subjects?.length || 0,
                    }).reduce(
                      (sum, _, i) => sum + (student[`SubVal${i + 1}`] || 0),
                      0
                    );

                    // Calculate GPA (assuming 100 is max per subject)
                    const gpa = (
                      (totalMarks / (student.Subjects?.length * 100)) *
                      4
                    ).toFixed(2);

                    return (
                      <tr
                        key={`student-${student.ID}`}
                        className="bg-transparent"
                      >
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {student.ID}
                        </td>
                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {bnBijoy2Unicode(student.UserName)}
                        </td>

                        {/* Dynamically render subject inputs */}
                        {student.Subjects?.map((subject, index) => (
                          <td
                            key={`subject-${student.ID}-${index}`}
                            className="border whitespace-nowrap bg-white"
                          >
                            <div className="w-16 mx-auto">
                              <TableInput
                                type="number"
                                min="0"
                                max="100"
                                defaultValue={
                                  student[`SubVal${index + 1}`] || 0
                                }
                                registerKey={`students[${student.ID}].SubVal${
                                  index + 1
                                }`}
                              />
                            </div>
                          </td>
                        ))}

                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {totalMarks}
                        </td>

                        <td className="p-2 border text-center whitespace-nowrap bg-white">
                          {gpa}
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

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="p-1 border rounded disabled:opacity-50"
              >
                <MdKeyboardArrowLeft size={24} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="p-1 border rounded disabled:opacity-50"
              >
                <MdKeyboardArrowRight size={24} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default PointBasedResultCreateUpdate;
