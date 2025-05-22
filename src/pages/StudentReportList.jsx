import React, { useEffect, useRef, useState } from "react";
import { setPageName } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import DefaultInput from "../components/Forms/DefaultInput";
import {
  useGetStudentBySearchQuery,
  useGetStudentReportCetsQuery,
  useGetStudentReportsMutation,
  useGetStudentReportTypeQuery,
  usePostStudentCharacterReportMutation,
} from "../features/student/studentQuerySlice";
import { fetchSingleStudentDataByStudentCode } from "../features/student/studentSlice";
import { toast } from "react-toastify";
import SortableTable from "../components/Tables/SortableTable";
import convertBijoyToBengali from "../utils/uniconveter";
import bnBijoy2Unicode from "../utils/conveter";
import useTranslate from "../utils/Translate";
import { Link, useNavigate } from "react-router-dom";
import CharacterReport from "../components/Document/characterReport";

const StudentReportList = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { academicSession } = useSelector((state) => state.settings);
  const methods = useForm();
  const { data: studentReportCet, error: studentReportCetError } =
    useGetStudentReportCetsQuery();
  const { data: studentReportType, error: studentReportTypeError } =
    useGetStudentReportTypeQuery();
  const [
    studentReports,
    { isLoading, isError, isSuccess, data: reportsResponse },
  ] = useGetStudentReportsMutation();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(true);

  // translate function
  const translate = useTranslate();
  const printRef = useRef();
  useEffect(() => {
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    dispatch(setPageName(pageTitle));
  }, []);

  const studentCodeOrName = methods.watch("filterStudentCode");

  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: studentInfoLoading,
  } = useGetStudentBySearchQuery(studentCodeOrName, {
    skip: !studentCodeOrName || !userTyping,
    refetchOnFocus: false,
  });

  const onSubmit = async (data) => {
    setShowSuggestions(false);
    const studentCode = methods.getValues("filterStudentCode");
    if (studentCode) {
      const toastId = toast.loading("Fetching data...");
      try {
        const response = await studentReports(studentCode).unwrap();

        toast.update(toastId, {
          render: "Submitted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
      } catch (err) {
        toast.update(toastId, {
          render: err?.data?.message || "Submission failed!",
          type: "error",
          isLoading: false,
          autoClose: 3000,
          closeOnClick: true,
        });
        console.error("Error submitting data:", err);
      }
    }
  };

  useEffect(() => {
    if (
      studentCodeOrName &&
      searchStudentInfo?.length > 0 &&
      !searchStudentError
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchStudentInfo, searchStudentError]);

  if (reportsResponse && reportsResponse.length > 0) {
  }
  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    methods.setValue("filterStudentCode", item.StudentCode);
    setShowSuggestions(false);
  };
  const handlePrint = () => {
    // window.print();
    navigate("/student/students-report/list/print", {
      state: { reportData: reportsResponse },
    });
  };

  return (
    <div>
      <div className="py-8 px-6 hidden_in_print">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="mx-auto flex justify-between items-center w-full"
          >
            <div className="relative max-w-[400px] w-full">
              <div className="w-full">
                <label
                  htmlFor={"filterStudentCode"}
                  className="mb-1 block text-black font-SolaimanLipi"
                >
                  <span className="text-red-500">
                    {translate("User Code")} * :
                  </span>
                </label>
                <input
                  type="text"
                  {...methods.register("filterStudentCode", { required: " " })}
                  className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200"
                  onInput={() => setUserTyping(true)}
                  autoComplete="false"
                />
              </div>
              <button
                type="submit"
                className="absolute bottom-[8px] right-[4px] text-[#999]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M9 12h12l-3 -3" />
                  <path d="M18 15l3 -3" />
                </svg>
              </button>
              {showSuggestions && (
                <div className="search_suggetion h-[200px] overflow-y-auto absolute bottom-[0px] translate-y-full left-0 w-full bg-white shadow-lg z-30">
                  {searchStudentInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)} -{" "}
                      {bnBijoy2Unicode(item.SubClass)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="print inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi"
              onClick={handlePrint}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-printer"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" />
                <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
                <path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" />
              </svg>
              <span className="pt-1">প্রিন্ট</span>
            </button>
          </form>
        </FormProvider>
      </div>
      <div className="relative overflow-x-auto px-6 hidden_in_print">
        <table className="w-full text-sm text-left text-gray-500 shadow-md sm:rounded-lg hidden_in_print">
          <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
            <tr>
              <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                {translate("No.")}
              </th>
              <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                {translate("User Code")}
              </th>
              <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                {translate("Student Name")}
              </th>
              <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                {translate("Varient")}
              </th>
              <th className={`px-3 py-3 text-nowrap text-[16px] `}>
                {translate("Type")}
              </th>
              <th className={`px-3 py-3 text-nowrap text-[16px]`}>
                {translate("Date")}
              </th>
              <th className={`px-3 py-3 text-nowrap  text-[16px]  w-[300px]`}>
                {translate("Remark")}
              </th>
            </tr>
          </thead>
          <tbody>
            {reportsResponse &&
              reportsResponse.map((item, index) => (
                <tr
                  key={index}
                  className="bg-white border-b hover:bg-gray-50 text-black"
                >
                  <td className="px-3 py-4 text-nowrap">{index + 1}</td>
                  <td className="px-3 py-4 text-nowrap">{item.StudentCode}</td>
                  <td className="px-3 py-4 text-nowrap">
                    {bnBijoy2Unicode(item.StudentName)}
                  </td>
                  <td className="px-3 py-4 text-nowrap">
                    {bnBijoy2Unicode(item.ReportCet)}
                  </td>
                  <td className="px-3 py-4 text-nowrap">
                    {bnBijoy2Unicode(item.ReportType)}
                  </td>
                  <td className="px-3 py-4 text-nowrap">{item.CreateDate}</td>
                  <td
                    className="px-3 py-4 text-nowrap w-[300px]"
                    style={{ whiteSpace: "normal" }}
                  >
                    {bnBijoy2Unicode(item.Remark)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div ref={printRef}>
        {reportsResponse && <CharacterReport report={reportsResponse} />}
      </div>
    </div>
  );
};

export default StudentReportList;
