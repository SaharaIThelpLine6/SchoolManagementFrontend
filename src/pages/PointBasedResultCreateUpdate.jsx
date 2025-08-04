import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
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

const PAGE_SIZE = 10;

const PointBasedResultCreateUpdate = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit, setValue, watch } = methods;
  const { id } = useParams();


  const [currentPage, setCurrentPage] = useState(1);
  const [students, setStudents] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      ID: i + 1,
      StudentName: `Student ${i + 1}`,
      Bangla: Math.floor(Math.random() * 100),
      English: Math.floor(Math.random() * 100),
      Math: Math.floor(Math.random() * 100),
      Science: Math.floor(Math.random() * 100),
      Arabic: Math.floor(Math.random() * 100),
      Hadith: Math.floor(Math.random() * 100),
      Tafsir: Math.floor(Math.random() * 100),
      Aqaid: Math.floor(Math.random() * 100),
      Fiqh: Math.floor(Math.random() * 100),
      Tajweed: Math.floor(Math.random() * 100),
      IslamicStudies: Math.floor(Math.random() * 100),
      Total: 0,
      GPA: 0,
      MeritPosition: 0,
      MeritGroup: "",
      AdmissionNumber: `ADM${1000 + i}`,
      StudentID: `STU${2000 + i}`,
    }))
  );

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const totalPages = Math.ceil(students.length / PAGE_SIZE);

  const paginatedData = students.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Calculate totals and GPA whenever marks change
  useEffect(() => {
    const subscription = watch((value) => {
      const updatedStudents = students.map((student) => {
        const bangla = Number(value.students?.[student.ID]?.Bangla) || 0;
        const english = Number(value.students?.[student.ID]?.English) || 0;
        const math = Number(value.students?.[student.ID]?.Math) || 0;
        const science = Number(value.students?.[student.ID]?.Science) || 0;
        const arabic = Number(value.students?.[student.ID]?.Arabic) || 0;
        const hadith = Number(value.students?.[student.ID]?.Hadith) || 0;
        const tafsir = Number(value.students?.[student.ID]?.Tafsir) || 0;
        const aqaid = Number(value.students?.[student.ID]?.Aqaid) || 0;
        const fiqh = Number(value.students?.[student.ID]?.Fiqh) || 0;
        const tajweed = Number(value.students?.[student.ID]?.Tajweed) || 0;
        const islamicStudies =
          Number(value.students?.[student.ID]?.IslamicStudies) || 0;

        const total =
          bangla +
          english +
          math +
          science +
          arabic +
          hadith +
          tafsir +
          aqaid +
          fiqh +
          tajweed +
          islamicStudies;
        const gpa = (total / 11).toFixed(2);

        return {
          ...student,
          Total: total,
          GPA: gpa,
        };
      });

      // Calculate merit positions
      const rankedStudents = [...updatedStudents].sort(
        (a, b) => b.Total - a.Total
      );
      const withMerit = rankedStudents.map((student, index) => ({
        ...student,
        MeritPosition: index + 1,
        MeritGroup: getMeritGroup(index + 1, rankedStudents.length),
      }));

      setStudents(withMerit);
    });

    return () => subscription.unsubscribe();
  }, [watch, students]);

  const getMeritGroup = (position, totalStudents) => {
    const top10Percent = Math.ceil(totalStudents * 0.1);
    const top30Percent = Math.ceil(totalStudents * 0.3);

    if (position <= top10Percent) return "A+";
    if (position <= top30Percent) return "A";
    return "B";
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    students.forEach((student) => {
      setValue(`students[${student.ID}].Bangla`, student.Bangla);
      setValue(`students[${student.ID}].English`, student.English);
      setValue(`students[${student.ID}].Math`, student.Math);
      setValue(`students[${student.ID}].Science`, student.Science);
      setValue(`students[${student.ID}].Arabic`, student.Arabic);
      setValue(`students[${student.ID}].Hadith`, student.Hadith);
      setValue(`students[${student.ID}].Tafsir`, student.Tafsir);
      setValue(`students[${student.ID}].Aqaid`, student.Aqaid);
      setValue(`students[${student.ID}].Fiqh`, student.Fiqh);
      setValue(`students[${student.ID}].Tajweed`, student.Tajweed);
      setValue(
        `students[${student.ID}].IslamicStudies`,
        student.IslamicStudies
      );
    });
  }, []);

  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }

    const studentResults = students.map((student) => ({
      StudentID: student.ID,
      Bangla: data.students?.[student.ID]?.Bangla || 0,
      English: data.students?.[student.ID]?.English || 0,
      Math: data.students?.[student.ID]?.Math || 0,
      Science: data.students?.[student.ID]?.Science || 0,
      Arabic: data.students?.[student.ID]?.Arabic || 0,
      Hadith: data.students?.[student.ID]?.Hadith || 0,
      Tafsir: data.students?.[student.ID]?.Tafsir || 0,
      Aqaid: data.students?.[student.ID]?.Aqaid || 0,
      Fiqh: data.students?.[student.ID]?.Fiqh || 0,
      Tajweed: data.students?.[student.ID]?.Tajweed || 0,
      IslamicStudies: data.students?.[student.ID]?.IslamicStudies || 0,
      Total: student.Total,
      GPA: student.GPA,
      MeritPosition: student.MeritPosition,
      MeritGroup: student.MeritGroup,
      AdmissionNumber: student.AdmissionNumber,
      StudentID: student.StudentID,
    }));

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      StudentResults: studentResults,
    };

    try {
      const response = data.ID
        ? await updateExamFeeSetting({ id: data.ID, body: payload }).unwrap()
        : await postExamFeeSetting(payload).unwrap();

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

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border whitespace-nowrap w-16">রোল</th>
                  <th className="p-2 border whitespace-nowrap w-40">
                    শিক্ষার্থীর নাম
                  </th>
                  <th className="p-2 border whitespace-nowrap w-20">বাংলা</th>
                  <th className="p-2 border whitespace-nowrap w-20">ইংরেজি</th>
                  <th className="p-2 border whitespace-nowrap w-20">গণিত</th>
                  <th className="p-2 border whitespace-nowrap w-20">বিজ্ঞান</th>
                  <th className="p-2 border whitespace-nowrap w-20">আরবি</th>
                  <th className="p-2 border whitespace-nowrap w-20">হাদীস</th>
                  <th className="p-2 border whitespace-nowrap w-20">তাফসীর</th>
                  <th className="p-2 border whitespace-nowrap w-20">আকাইদ</th>
                  <th className="p-2 border whitespace-nowrap w-20">ফিকহ</th>
                  <th className="p-2 border whitespace-nowrap w-20">তাজবিদ</th>
                  <th className="p-2 border whitespace-nowrap w-20">
                    ইসলাম শিক্ষা
                  </th>
                  <th className="p-2 border whitespace-nowrap w-20">মোট</th>
                  <th className="p-2 border whitespace-nowrap w-20">জিপিএ</th>
                  <th className="p-2 border whitespace-nowrap w-20">
                    মেধা সংখ্যা
                  </th>
                  <th className="p-2 border whitespace-nowrap w-24">
                    মেধাবী গ্রুপ
                  </th>
                  <th className="p-2 border whitespace-nowrap w-24">
                    ভর্তি নম্বর
                  </th>
                  <th className="p-2 border whitespace-nowrap w-24">আইডি</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((student) => (
                  <tr key={student.ID} className="bg-transparent"> 
                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.ID}
                    </td>
                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.StudentName}
                    </td>

                    <td className="border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Bangla`}                       
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].English`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Math`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Science`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Arabic`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Hadith`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Tafsir`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Aqaid`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Fiqh`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].Tajweed`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border whitespace-nowrap bg-white">
                      <div className="w-16 mx-auto">
                        <TableInput
                          type="number"
                          registerKey={`students[${student.ID}].IslamicStudies`}
                        />
                      </div>
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.Total}
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.GPA}
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.MeritPosition}
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.MeritGroup}
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.AdmissionNumber}
                    </td>

                    <td className="p-2 border text-center whitespace-nowrap bg-white">
                      {student.StudentID}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
            <div className=""></div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default PointBasedResultCreateUpdate;
