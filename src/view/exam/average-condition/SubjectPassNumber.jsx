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
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";

import SortableTable from "../../../components/Tables/SortableTable";
import { useGetDesignationQuery } from "../../../features/teachers/teachersSlice";
import { FiEdit } from "react-icons/fi";
import StudentFeeGroup from "../../../view/exam/StudentFeeGroup";

const PAGE_SIZE = 10;

const SubjectPassNumber = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false); // State to toggle components

  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];

  const {
    data: designation = [],
    isLoading: isdLoading,
    isError: isdError,
  } = useGetDesignationQuery();
  const { data: classListData } = useGetClassListQuery();

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
    try {
      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      // const response = await postChnageStudentGroup({
      //   id: data.SubClassID,
      //   body: { admissionIds: selectedRows },
      // }).unwrap();

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
    <div>
      {/* <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate(title)}
        </h3>
      </div> */}

      <FormProvider {...methods}>
        <form
          className="w-full space-y-10 bg-white p-6 rounded-xl shadow-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Exam & Class Selects */}
            <div className="space-y-2">
              <DefaultSelect
                label={`${translate("Exam Name")}:`}
                options={classListData ?? []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="examName"
              />

              <DefaultSelect
                label={`${translate("Exam Type")}:`}
                options={classListData ?? []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="examType"
              />

              <DefaultSelect
                label={`${translate("Exam Term")}:`}
                options={classListData ?? []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="examTerm"
              />

              <DefaultSelect
                label={`${translate("Class/Jamaat")}:`}
                options={genderOptions}
                valueField="id"
                nameField="value"
                registerKey="classGroup"
              />
            </div>

            {/* Right Column - Score Settings */}
            <div className="space-y-2">
              <DefaultInput
                registerKey="arabicScore"
                label={translate("Subject Arabic")}
                type="number"
              />

              {/* Score Type Radio Group */}
              <div className="flex flex-col py-1 gap-4">
                <label className="text-sm font-semibold text-start text-gray-700 w-32 shrink-0 pt-1.5">
                  {translate("Score Type")}
                </label>
                <fieldset className="flex-1">
                  <div className="flex flex-wrap gap-4">
                    {[
                      {
                        id: "averageScore",
                        value: "average",
                        label: "গড় মার্ক",
                      },
                      {
                        id: "minimumScore",
                        value: "minimum",
                        label: "সর্বনিম্ন মার্ক",
                      },
                      {
                        id: "higherScore",
                        value: "higher",
                        label: "সর্বোচ্চ মার্ক",
                      },
                    ].map((option) => (
                      <label
                        key={option.id}
                        htmlFor={option.id}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <input
                          type="radio"
                          id={option.id}
                          value={option.value}
                          {...methods.register("scoreType")}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        {translate(option.label)}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Checkbox Group - কেরাত কন্ডিশন */}
              <div className="flex flex-col py-1 gap-4">
                <label className="text-sm font-semibold text-start text-gray-700 w-32 shrink-0">
                  {translate("কেরাত কন্ডিশন টাইপ")}
                </label>
                <fieldset className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      id="keratCondition"
                      type="checkbox"
                      value="kerat"
                      {...methods.register("keratCondition")}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                    />
                    <label htmlFor="keratCondition">
                      {translate("কেরাত কন্ডিশন")}
                    </label>
                  </div>
                </fieldset>
              </div>
              <DefaultInput
                registerKey="highestScore"
                label={translate("Highest Score")}
                type="number"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-start">
            <Button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
            >
              {translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-3">
        <h2 className="text-xl font-semibold text-green-500 mb-3 font-SolaimanLipi">
          মোট বিষয় ৫ টি
        </h2>

        <p className="text-gray-600 mb-4 font-SolaimanLipi">
          উল্লেখিত সংখ্যা ব্যতীত অন্য কোনো সংখ্যা দ্বারা যদি মোট নাম্বার ভাগ
          দেওয়ার প্রয়োজন হয়, তাহলে নিচের বক্সে তা লিখে সেইভ বাটনে ক্লিক করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="সংখ্যা লিখুন"
          />

          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors whitespace-nowrap">
            সেইভ করুন
          </button>
        </div>
      </div>
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

export default SubjectPassNumber;
