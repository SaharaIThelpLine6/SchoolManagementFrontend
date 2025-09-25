import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../../../utils/Translate";
import { showModal } from "../../../utils/ModalControlar";

import Button from "../../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import {
  useGetStudentBySearchQuery,
  usePostChnageStudentGroupMutation,
} from "../../../features/student/studentQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";
import SortableTable from "../../../components/Tables/SortableTable";
import { useGetDesignationQuery } from "../../../features/teachers/teachersSlice";
import DatePickerOne from "../../../components/Forms/DatePicker/DatePickerOne";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";

const PAGE_SIZE = 10;

const Statement = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];

  const SessionID = watch("SessionID");
  const ClassID = watch("ClassID");
  const genderId = watch("gender");
  const {
    data: designation = [],
    isLoading: isdLoading,
    isError: isdError,
  } = useGetDesignationQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const [postChnageStudentGroup, { isLoading, isSuccess, isError }] =
    usePostChnageStudentGroupMutation();

  const selectedClass = classListData?.find((item) => item.ClassID == ClassID); // Use == to avoid type mismatch

  console.log("Selected class:", selectedClass);

  const { data: searchStudentInfo = [], refetch } = useGetStudentBySearchQuery(
    { search: null, ClassID, SessionID, GenderID: genderId },
    {
      skip: !ClassID || !SessionID || !genderId,
      refetchOnFocus: false,
    }
  );

  console.log(selectedRows);

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

      const response = await postChnageStudentGroup({
        id: data.SubClassID,
        body: { admissionIds: selectedRows },
      }).unwrap();

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
      title: translate("SLID"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Date"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Sub Ledger"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("পাটিকোলার্স"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("ডেবিট"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("ক্রেডিট"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("UFODID"),
      field: "Designation",
      hozAlign: "center",
    },
  ];

  const handleSubsidiary = () => {
    showModal("Sub Sidiary Ledger", "SUB_SIDIARY");
  };

  return (
    <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-6xl mx-auto">
      <FormProvider {...methods}>
        {/* Header Section */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            ছাত্র বেতন বিবরণী
          </h2>
        </div>

        {/* Student Information Card */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg mb-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg font-semibold text-gray-800">
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-xs">
              <span className="text-gray-600">কোড:</span>
              <span className="text-pink-600 font-bold text-xl">১০১৪</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-xs">
              <span className="text-gray-600">নাম:</span>
              <span className="text-green-700 font-bold text-xl">গড়ুর</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-xs">
              <span className="text-gray-600">পিতা:</span>
              <span className="text-gray-700 font-bold text-xl">
                মোঃ গাজী সালাউদ্দিন
              </span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 text-lg text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg">
              <input
                type="radio"
                name="filter"
                className="h-5 w-5 text-blue-600"
                defaultChecked
              />
              <span>সব দেখুন</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg">
              <input
                type="radio"
                name="filter"
                className="h-5 w-5 text-blue-600"
              />
              <span>তারিখ অনুযায়ী</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
              <DatePickerOne
                dateCalender={
                  <span className="text-red-500 font-medium">From</span>
                }
                placeholder={"শুরুর তারিখ"}
                registerKey={"startDate"}
                require={"তারিখ নির্বাচন করুন"}
              />
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
              <DatePickerOne
                dateCalender={
                  <span className="text-red-500 font-medium">To</span>
                }
                placeholder={"শেষ তারিখ"}
                registerKey={"endDate"}
                require={"তারিখ নির্বাচন করুন"}
              />
            </div>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm text-lg font-medium transition-colors duration-200 w-full md:w-auto">
            ডাটা দেখুন
          </button>
        </div>

        {/* Fee Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-lg font-medium mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-1">মোট ফি</div>
            <div className="text-red-600 font-bold text-2xl">৭৫০০ টাকা</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-1">কর্তন</div>
            <div className="text-red-600 font-bold text-2xl">১১০০ টাকা</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-1">জমা</div>
            <div className="text-green-600 font-bold text-2xl">৬৩০০ টাকা</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-1">পাওনা</div>
            <div className="text-white bg-green-600 px-3 py-1 rounded-full font-bold text-xl inline-block">
              -৪০০ টাকা
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg shadow-sm text-lg font-medium transition-colors duration-200 w-full h-full">
              রিপোর্ট দেখুন
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-5 border border-gray-200 rounded-lg overflow-hidden">
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="text-gray-600">
            মোট রেকর্ড: <span className="font-bold">125</span>
          </div>
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </FormProvider>
    </div>
  );
};

export default Statement;
