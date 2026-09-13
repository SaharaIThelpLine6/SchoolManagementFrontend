import {useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import useTranslate from "../../utils/Translate";
import Button from "../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetAcademicSubjectsQuery, useGetSubClassListQuery } from "../../features/class/classQuerySlice";
import Swal from "sweetalert2";
import { useGetTeachersInfoQuery, usePostSubjectToTeacherMutation } from "../../features/teachers/teachersSlice";

const TeacherAssignModal = ({ examDetails }) => {

  const translate = useTranslate();
  const methods = useForm();
  const { watch, setValue, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [postSubjectToTeacher, { isLoading: isPostLoading, isSuccess: isPostSuccess, isError: isPostError }] = usePostSubjectToTeacherMutation();
  const {
    data: teachers = [],
    isLoading: teachersLoading,
    isError: teachersError,
  } = useGetTeachersInfoQuery();
  const {
    data: subjectList = [],
    isLoading: subjectsLoading,
    isError: subjectsError,
  } = useGetAcademicSubjectsQuery();
  const [filterSubjectList, setFilterSSubjectList] = useState(subjectList);
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassList } = useGetSubClassListQuery();
  console.log(selectedRows);
  useEffect(() => {
    setValue("SessionID", examDetails?.SessionID);
    setValue("SubClassID", examDetails?.SubClassID);
    setValue("ExamID", examDetails?.ExamID);
  }, [examDetails]);

  useEffect(() => {
    Array.from({ length: examDetails?.SubSonkha || 0 }).map((_, index) => {
      const subjectId = examDetails[`SubjectID${index + 1}`];
      if (!subjectId) return;
      const filteredSubjects = subjectList.filter(subject => Number(subject.SubjectID) === Number(subjectId));
      setFilterSSubjectList(prev => {
        const newList = [...prev];
        newList[index] = filteredSubjects[0] || null;
        return newList.filter(Boolean); 
      })
      console.log(`SubjectID${index + 1}:`, filteredSubjects);
    });

  }, [subjectList, examDetails]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    console.log(data);

    try {
      if (!data.SubClassID || !data.SessionID || !data.SubjectID || !data.TeacherID) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      const response = await postSubjectToTeacher(data).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
      }).then(() => {
        refetch();
        setSelectedRows([]);
        methods.reset();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
      console.error("Error updating student group:", error);
    }
  };


  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">

            <DefaultSelect
              label="Session"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              disabled={true}
            />

            <DefaultSelect
              label="Sub Class"
              options={subClassList ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              disabled={true}
            />

            <DefaultSelect
              label={translate('Teacher')}
              registerKey="TeacherID"
              options={teachers || []}
              valueField="UserID"
              nameField="UserName"
              require={translate('Teacher is required')}
            />
            <DefaultSelect
              label={translate('Subject')}
              registerKey="SubjectID"
              options={(filterSubjectList || []).filter(Boolean)}
              valueField="SubjectID"
              nameField="SubjectName"
              require={translate('Subject is required')}
            />

            <div className="w-full">
              <Button type="submit" className="w-full md:w-auto">
                {translate("Save")}
              </Button>
            </div>
          </div>
          {/* Button */}
        </form>
      </FormProvider>

      {/* <div className="mt-5">
        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />
      </div> */}

    </div>
  );
};

export default TeacherAssignModal;
