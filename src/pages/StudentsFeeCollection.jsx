import { useDispatch, useSelector } from "react-redux";
import useTranslate from "../utils/Translate";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import FilterButton from "../components/Filter/FilterButton";
import SelectedPerStudentFeeTable from "../view/accounting/SelectedPerStudentFeeTable";
import MonthDetermineFeeTable from "../view/accounting/MonthDetermineFeeTable";
import { showModal } from "../utils/ModalControlar";
import { setFilteredSelectedPerStudentFee } from "../features/student/studentSlice";
import SvgIcon from "../components/icons/SvgIcon";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Textarea from "../components/Forms/Textarea";
import DefaultRadio from "../components/Radio/DefaultRadio";
import { useGetExamFeeSettingQuery } from "../features/exam/examQuerySlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
const PAGE_SIZE = 10;

const StudentsFeeCollection = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      StudentCode: "",
      StudentName: "",
      ClassName: "",
      SessionName: "",
      AmountTotal: "",
      LessTotal: "",
      Total: "",
    },
  });
  const { handleSubmit, reset } = methods;
  const translate = useTranslate();
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  console.log(filteredSelectedPerStudentFee, "filteredSelectedPerStudentFee");
  const { data: sessionData } = useGetSessionsQuery();

  useEffect(() => {
    if (filteredSelectedPerStudentFee) {
      const defaultValues = {
        ID: filteredSelectedPerStudentFee.UserID ?? "",
        StudentCode: filteredSelectedPerStudentFee.StudentCode ?? "",
        // StudentName: filteredSelectedPerStudentFee.StudentName ?? "",
        // ClassName: filteredSelectedPerStudentFee.ClassName ?? "",
        // SessionName: filteredSelectedPerStudentFee.SessionName ?? "",
        // AmountTotal: filteredSelectedPerStudentFee.AmountTotal ?? "",
        // LessTotal: filteredSelectedPerStudentFee.LessTotal ?? "",
        // Total: filteredSelectedPerStudentFee.Total ?? "",
      };
      reset(defaultValues);
    } else {
      reset({
        StudentCode: "",
        // StudentName: "",
        // ClassName: "",
        // SessionName: "",
        // AmountTotal: "",
        // LessTotal: "",
        // Total: "",
      });
    }
  }, [filteredSelectedPerStudentFee, reset]);

  const handleOpenModal = useCallback(() => {
    showModal("Selected Per Student Fee", "SELECTED_PERSTUDENT_FEE_FILTER");
  }, []);

  const handleStudentFeeOpenModal = useCallback(() => {
    showModal("Student Admission Fee Accept", "STUDENT_FEE_ACCEPT");
  }, []);
  const handleStudentMonthFeeOpenModal = useCallback(() => {
    showModal("Student Month Fee Accept", "STUDENT_MONTH_FEE_ACCEPT");
  }, []);

  const onSubmit = (data) => {
    console.log("First form submitted with data:", data);
  };

  const handleReset = () => {
    reset();
    dispatch(setFilteredSelectedPerStudentFee(null));
  };

  useEffect(() => {
    handleReset(); // page change হলে filterData reset করা
  }, [location.pathname]);

  // Reset Button
  const handleResetButton = () => {
    handleReset();
  };
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery();

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);

  const SearchTypes = [];

  const feeStatus = [
    { id: 1, name: "ID" },
    { id: 2, name: "Card" },
  ];
  return (
    <div className="">
      <FormProvider {...methods}>
        <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {translate("Student Fee Collection")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Photo and Student Code */}
            <div className="p-1 col-span-1 flex flex-col items-center gap-4">
              <div className="w-28 h-28 md:w-40 md:h-36 border-2 border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-500 rounded-lg">
                Photo
              </div>
              <div className="w-full relative">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {translate("Student Code")}:
                </label>
                <div className="flex gap-2">
                  <input
                    {...methods.register("StudentCode", { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    onInput={() => setUserTyping(true)}
                  />
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                    title="Filter"
                  >
                    <SvgIcon name={"TbFilterPlus"} size={20} />
                  </button>
                </div>
              </div>
              {/* Radio */}
              <div className="flex justify-center items-center md:col-span-1">
                <DefaultRadio options={feeStatus} registerKey="IsActive" />
              </div>
            </div>
            <div className="space-y-4">
              {/* 🔹 Search Type */}
              <div>
                <DefaultSelect
                  label="Session"
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                  labelPosition="left"
                />
              </div>

              {/* 🔹 Student Info Card */}
              <div className="bg-white space-y-4">
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                    {translate("নাম")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <span className="ml-1 text-green-600 font-bold flex-1 truncate">
                    {filteredSelectedPerStudentFee?.StudentName}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                    {translate("পিতার নাম")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <span className="ml-1 flex-1 truncate">
                    {filteredSelectedPerStudentFee?.FatherName}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                    {translate("মোবাইল")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <span className="ml-1 flex-1 truncate">
                    {filteredSelectedPerStudentFee?.Mobile1}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                    {translate("শ্রেণি/জামাত")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <span className="ml-1 flex-1 truncate">
                    {filteredSelectedPerStudentFee?.ClassName}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                    {translate("শিক্ষার্থীর অবস্থা")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  {filteredSelectedPerStudentFee?.AdmissionStatus != null &&
                    (filteredSelectedPerStudentFee.AdmissionStatus === 1 ? (
                      <span className="ml-1 text-green-600 font-bold flex-1 truncate">
                        পেইড
                      </span>
                    ) : (
                      <span className="ml-1 text-red-600 font-bold flex-1 truncate">
                        পেন্ডিং
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="w-full flex gap-3">
              <div className="bg-white space-y-4">
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                    {translate("মোট")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <input
                    type="text"
                    className="ml-1 w-20 p-1 border border-gray-300 rounded"
                    placeholder="০০"
                    disabled
                  />
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                    {translate("কর্তন")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <input
                    type="text"
                    className="ml-1 w-20 p-1 border border-gray-300 rounded"
                    placeholder="০০"
                    disabled
                  />
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                    {translate("জমা")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <input
                    type="text"
                    className="ml-1 w-20 p-1 border border-gray-300 rounded"
                    placeholder="০০"
                    disabled
                  />
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                    {translate("বকেয়া")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <input
                    type="text"
                    className="ml-1 w-20 p-1 border border-gray-300 rounded"
                    placeholder="০০"
                    disabled
                  />
                </div>
                <div className="flex items-center text-sm">
                  <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                    {translate("রসিদ")}
                  </span>
                  <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                  <input
                    type="text"
                    className="ml-1 w-20 p-1 border border-gray-300 rounded"
                    placeholder="::"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-3 my-4">
            <Textarea
              label="মন্তব্য"
              placeholder="Enter your comments ..."
              registerKey="address"
              // require={true}
              rows={2}
            />{" "}
            <Textarea
              label="কথায়"
              placeholder="Enter your comments ..."
              registerKey="address"
              // require={true}
              rows={2}
            />
            <div className="col-span-2 flex justify-between gap-2">
              <DefaultSelect
                label="Entry Date"
                options={SearchTypes ?? []}
                valueField="ID"
                nameField="Name"
                registerKey="searchType1"
              />
              <DefaultSelect
                label="Account Type"
                options={SearchTypes ?? []}
                valueField="ID"
                nameField="Name"
                registerKey="searchType1"
              />

              <DefaultSelect
                label="Account"
                options={SearchTypes ?? []}
                valueField="ID"
                nameField="Name"
                registerKey="searchType1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 my-5">
            {/* Admission + Fees */}
            <div className="md:col-span-3 flex flex-wrap justify-center sm:justify-start">
              {/* Title */}
              <div className="flex justify-center sm:justify-start items-center">
                <h1 className="text-base font-semibold text-gray-700">
                  পূর্বের বকেয়া
                </h1>
              </div>
              {/* Fee Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2">
                {/* Admission */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button
                    onClick={handleStudentFeeOpenModal}
                    className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-blue-600 text-white"
                    disabled={
                      filteredSelectedPerStudentFee?.AdmissionStatus === 1
                        ? true
                        : false
                    }
                  >
                    ভর্তি
                  </Button>
                  <input
                    type="text"
                    className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                {/* Month Fee */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button
                    onClick={handleStudentMonthFeeOpenModal}
                    className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-green-600 text-white"
                  >
                    মাসিক
                  </Button>
                  <input
                    type="text"
                    className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    placeholder="0"
                  />
                </div>

                {/* Exam */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-purple-600 text-white">
                    পরীক্ষা
                  </Button>
                  <input
                    type="text"
                    className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>

                {/* Others */}
                <div className="flex flex-col items-center gap-2 w-full">
                  <Button className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-yellow-500 text-white">
                    অন্যান্য
                  </Button>
                  <input
                    type="text"
                    className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Student Code */}
            <div className="md:col-span-2">
              {/* Title */}
              <div className="flex justify-center sm:justify-start items-center">
                <h1 className="text-base font-semibold text-gray-700">
                  অন্যান্য
                </h1>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-blue-600 text-white">
                  বকেয়া তালিকা
                </Button>

                <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-green-600 text-white">
                  সকল রিপোর্ট
                </Button>

                <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-purple-600 text-white">
                  স্টেসমেন্ট
                </Button>

                <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-yellow-500 text-white">
                  বাড়ানো কমানো
                </Button>

                <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-pink-500 text-white">
                  খাবার ফির দিন ও ছুটি
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-3">
              <div className=" overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
                <table className="min-w-[800px] sm:text-sm table-auto text-sm md:text-base">
                  <thead className="bg-[#e9ebee] text-black">
                    <tr>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Sequential")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Fee Name")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Details")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Prescribed Fee")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Deduction")}
                      </th>

                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Pre-deposit")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Deposit")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Due")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 text-center whitespace-nowrap">
                            {1 + index}
                          </td>
                          <td className="text-center whitespace-nowrap">
                            ভর্তি ফি
                          </td>
                          <td className="px-4 text-center whitespace-nowrap">
                            মে (2025-2026)
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center">
                          {translate("No data available")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <div className=" overflow-x-auto rounded-md border w-full">
                <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
                  <thead className="bg-[#e9ebee] text-black">
                    <tr>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Month Name")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Prescribed Fee")}
                      </th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">
                        {translate("Accepted Fees")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 text-center whitespace-nowrap">
                            মে (2025-2026)
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                          <td className="text-center whitespace-nowrap">
                            <DefaultInput
                              registerKey={`monthFeeList.${index}.comment`}
                              type="text"
                              disable
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-2 text-center">
                          {translate("No data available")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
      {/* <div className="space-y-6">
        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border">
          <SelectedPerStudentFeeTable resetForm={handleResetButton} />
        </div>

        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border">
          <MonthDetermineFeeTable />
        </div>
      </div> */}
    </div>
  );
};

export default StudentsFeeCollection;
