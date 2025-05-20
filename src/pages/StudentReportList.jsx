import React, { useEffect } from "react";
import { setPageName } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import DefaultInput from "../components/Forms/DefaultInput";
import {
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
  const translate = useTranslate();
  useEffect(() => {
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    dispatch(setPageName(pageTitle));
  }, []);

  const onSubmit = async (data) => {
    const studentCode = methods.getValues("filterStudentCode");
    const toastId = toast.loading("Fetching data...");
    if (studentCode) {
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

  if (reportsResponse && reportsResponse.length > 0) {
  }

  const handlePrint = () => {
    navigate("/student/students-report/list/print", {
      state: { reportData: reportsResponse },
    });
  };

  return (
    <div className="">
      <div className="flex justify-end px-6 pt-6">
        {/* <Link to={"/student/students-report/list/print"} > */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            {translate ? translate("Print Report") : "Print Report"}
          </button>
        {/* </Link> */}
      </div>
      <div className="pt-2 pb-8 px-6">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="mx-auto">
            <div className="relative max-w-[400px]">
              <DefaultInput
                registerKey={"filterStudentCode"}
                require={""}
                type={"text"}
                label={
                  <span className="text-red-500">
                    {translate("User Code")}*:{" "}
                  </span>
                }
                disable={false}
              />
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
            </div>
          </form>
        </FormProvider>
      </div>
      <div className="relative overflow-x-auto px-6">
        <table className="w-full text-sm text-left text-gray-500 shadow-md sm:rounded-lg">
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
    </div>
  );
};

export default StudentReportList;
