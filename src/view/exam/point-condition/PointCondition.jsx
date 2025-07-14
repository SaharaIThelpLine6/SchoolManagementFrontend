import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import useTranslate from "../../../utils/Translate";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Button from "../../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import {
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";

import SortableTable from "../../../components/Tables/SortableTable";
import { useGetDesignationQuery } from "../../../features/teachers/teachersSlice";
import { FiEdit } from "react-icons/fi";
import StudentFeeGroup from "../../../view/exam/StudentFeeGroup";
import { examPointConditionStatus } from "../../../Data/userReportsData";
import ExamRoutingCheckbox from "../../../components/Checkboxes/ExamRoutingCheckbox";
import {
  useGetExamNamesQuery,
  usePostExamPointConditionMutation,
} from "../../../features/exam/examQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";

const PAGE_SIZE = 10;

const PointCondition = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false); // State to toggle components

  const {
    data: designation = [],
    isLoading: isdLoading,
    isError: isdError,
  } = useGetDesignationQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subjectsListData } = useGetAcademicSubjectsQuery();
  const [postExamPointCondition] = usePostExamPointConditionMutation();

  // console.log(sessionData, "sessionData");
  // console.log(subClassListData, "subClassListData");
  // console.log(examNameData, "examNameData");
  // console.log(subjectsListData, "subjectsListData");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

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

  const onSubmit = async (data) => {
    const payload = {
      SessionID: data.SessionID,
      ExamID: data.ExamID,
      SubClassID: data.SubClassID,
      BookID: data.SubjectID,
      MeariAction: data.MeariAction,
      PassNumber: data.PassNumber,
      MaxNumber: data.MaxNumber,
      DivisionNumber1: data.DivisionNumber0,
      DivisionNumber2: data.DivisionNumber1,
      DivisionNumber3: data.DivisionNumber2,
      DivisionNumber4: data.DivisionNumber3,
      DivisionNumber5: data.DivisionNumber4,
      DivisionNumber6: data.DivisionNumber5,
      DivisionNumber7: data.DivisionNumber6,
      Division1: data.Division0,
      Color1: data.Color0 ? 1 : null,
      Division2: data.Division1,
      Color2: data.Color1 ? 2 : null,
      Division3: data.Division2,
      Color3: data.Color2 ? 3 : null,
      Division4: data.Division3,
      Color4: data.Color3 ? 4 : null,
      Division5: data.Division4,
      Color5: data.Color4 ? 5 : null,
      Division6: data.Division5,
      Color6: data.Color5 ? 6 : null,
      Division7: data.Division6,
      Color7: data.Color6 ? 7 : null,
    };

    try {
      await postExamPointCondition(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: "সংরক্ষণ সফল হয়েছে!",
        text: "তথ্যটি সফলভাবে সংরক্ষণ করা হয়েছে।",
      });
      //     refetch();
      methods.reset();
    } catch (error) {
      const errMsg =
        error?.data?.error ||
        "তথ্য সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";

      Swal.fire({
        icon: "error",
        title: "ব্যর্থ হয়েছে!",
        text: errMsg,
      });
    }
  };

  // const onSubmit = async (data) => {
  //   console.log(data);
  //   // await postExamPointCondition(data).unwrap();
  //   // try {
  //   //   if (!data.SubClassID || selectedRows.length === 0) {
  //   //     Swal.fire({
  //   //       icon: "warning",
  //   //       title: "ফর্ম অসম্পূর্ণ",
  //   //       text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
  //   //     });
  //   //     return;
  //   //   }

  //   //   // const response = await postChnageStudentGroup({
  //   //   //   id: data.SubClassID,
  //   //   //   body: { admissionIds: selectedRows },
  //   //   // }).unwrap();

  //   //   Swal.fire({
  //   //     icon: "success",
  //   //     title: "সফলভাবে সংরক্ষণ হয়েছে",
  //   //     text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
  //   //   }).then(() => {
  //   //     refetch();
  //   //     setSelectedRows([]);
  //   //     methods.reset();
  //   //   });
  //   // } catch (error) {
  //   //   Swal.fire({
  //   //     icon: "error",
  //   //     title: "ত্রুটি ঘটেছে!",
  //   //     text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
  //   //   });
  //   //   console.error("Error updating student group:", error);
  //   // }
  // };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    { title: "SL", field: "SL", hozAlign: "center" },
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
      title: translate("Fee Name"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Fee"),
      field: "Designation",
      hozAlign: "center",
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  return (
    <div className="bg-white">
      {/* <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate(title)}
        </h3>
      </div> */}

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 my-5 gap-5">
            <DefaultSelect
              label={translate("Session") + " :"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode={true}
            />
            <DefaultSelect
              label={
                <p className="text-gray-700 font-medium">
                  {translate("Class/Jamaat")}:
                </p>
              }
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
            />

            <DefaultSelect
              label={
                <p className="text-gray-700 font-medium">
                  {translate("Subject")}:
                </p>
              }
              options={subjectsListData ?? []}
              valueField="SubjectID"
              nameField="SubjectName"
              registerKey="SubjectID"
              unicode={true}
            />
            <div className="sm:col-span-2">
              <ExamRoutingCheckbox
                label={translate("Point Condition Status") + " :"}
                options={examPointConditionStatus}
                registerKey="MeariAction"
                require={"This Field is required"}
              />
            </div>
            <DefaultInput
              registerKey={`PassNumber`}
              label={translate("পাস নাম্বার") + " :"}
              type="text"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6">
            {/* Left Column: Score Thresholds */}
            <div className="flex flex-col space-y-3">
              <DefaultInput
                registerKey="MaxNumber"
                label={translate("Highest score")}
                type="text"
                labelPosition="left"
              />
              {[...Array(7)].map((_, index) => (
                <DefaultInput
                  key={`score-threshold-${index}`}
                  registerKey={`DivisionNumber${index}`}
                  label={`${translate(index === 0 ? "If >=" : "Or If >=")}`}
                  type="text"
                  labelPosition="left"
                />
              ))}
            </div>

            {/* Middle Column: Division Outputs */}
            <div className="col-span-2 flex flex-col justify-end space-y-4">
              {[...Array(7)].map((_, index) => (
                <div
                  key={`division-row-${index}`}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <DefaultInput
                      key={`division-${index}`}
                      registerKey={`Division${index}`}
                      label={translate("তাহলে ডিভিশন")}
                      type="text"
                      labelPosition="left"
                    />
                  </div>
                  <div className="flex items-center">
                    <SingleCheckbox
                      label="Silver Color"
                      registerKey={`Color${index}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <Button type="submit" className="w-full md:w-auto">
              {translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className="mt-5">
        <SortableTable columns={columns} data={paginatedData} />
      </div>

      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointCondition;
