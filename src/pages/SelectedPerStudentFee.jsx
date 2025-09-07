import { useDispatch, useSelector } from "react-redux";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useLocation } from "react-router-dom";
import { useGetStudentsVacationTypeListQuery } from "../features/student/studentQuerySlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading/Loading";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import FilterButton from "../components/Filter/FilterButton";
import bnBijoy2Unicode from "../utils/conveter";
import SelectedPerStudentFeeTable from "../view/accounting/SelectedPerStudentFeeTable";
import { useGetSubLedgerQuery } from "../features/feeCollection/feeCollectionSlice";
import { showModal } from "../utils/ModalControlar";
import SingleCheckbox from "../components/Checkboxes/SingleCheckbox";
import { setFilteredSelectedPerStudentFee } from "../features/student/studentSlice";
import { useGetMonthListBySessionAndClassQuery } from "../features/months/montListSlice";
import { skipToken } from "@reduxjs/toolkit/query";

const PAGE_SIZE = 10;

const SelectedPerStudentFee = () => {
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
  const { handleSubmit, watch, reset, setValue } = methods;
  const translate = useTranslate();
  const SLID = watch("SLID");
  const { data: subLedger } = useGetSubLedgerQuery(101);
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );
  const [currentPage, setCurrentPage] = useState(1);
  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const {
    data: monthListData,
    error,
    isLoading,
  } = useGetMonthListBySessionAndClassQuery(
    {
      sessionId: filteredSelectedPerStudentFee?.SessionID,
      classId: filteredSelectedPerStudentFee?.ClassID,
    },
    {
      skip:
        !filteredSelectedPerStudentFee?.SessionID ||
        !filteredSelectedPerStudentFee?.ClassID,
    }
  );

  console.log(monthListData, "monthListData");

  useEffect(() => {
    console.log(
      "filteredSelectedPerStudentFee:",
      filteredSelectedPerStudentFee
    );
    if (filteredSelectedPerStudentFee) {
      const defaultValues = {
        ID: filteredSelectedPerStudentFee.UserID ?? "",
        StudentCode: filteredSelectedPerStudentFee.StudentCode ?? "",
        StudentName: filteredSelectedPerStudentFee.StudentName ?? "",
        ClassName: filteredSelectedPerStudentFee.ClassName ?? "",
        SessionName: filteredSelectedPerStudentFee.SessionName ?? "",
        AmountTotal: filteredSelectedPerStudentFee.AmountTotal ?? "",
        LessTotal: filteredSelectedPerStudentFee.LessTotal ?? "",
        Total: filteredSelectedPerStudentFee.Total ?? "",
      };
      console.log("Setting default values for first form:", defaultValues);
      reset(defaultValues);
    } else {
      console.log("Resetting first form to empty values");
      reset({
        StudentCode: "",
        StudentName: "",
        ClassName: "",
        SessionName: "",
        AmountTotal: "",
        LessTotal: "",
        Total: "",
      });
    }
  }, [filteredSelectedPerStudentFee, reset]);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal("Selected Per Student Fee", "SELECTED_PERSTUDENT_FEE_FILTER");
  }, []);

  const onSubmit = (data) => {
    console.log("First form submitted with data:", data);
  };

  const handleReset = () => {
    reset();
    dispatch(setFilteredSelectedPerStudentFee(null));
  };

  useEffect(() => {
    // page change হলে filterData reset করা
    handleReset();
  }, [location.pathname]);

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  return (
    <div>
      <FormProvider {...methods}>
        <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg md:text-xl font-bold">
              {translate("Selected Per Student Fee")}
            </h3>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            <DefaultInput
              type="text"
              registerKey="StudentCode"
              label="Student Code"
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="StudentName"
              label="Name"
              unicode={true}
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="ClassName"
              label="Class"
              unicode={true}
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="SessionName"
              label="Session"
              unicode={true}
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="AmountTotal"
              label="Total Fee"
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="LessTotal"
              label="Deduction"
              disable={true}
            />
            <DefaultInput
              type="text"
              registerKey="Total"
              label="Total Deposits"
              disable={true}
            />
            <div className="col-span-2 flex gap-3">
              <Button type="submit">{translate("Save")}</Button>
              <FilterButton
                onClick={handleOpenModal}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 border-0 text-white px-5 py-2.5 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                {translate("Filter")}
              </FilterButton>
            </div>
          </form>

          <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
            <table className="min-w-full table-auto text-sm md:text-base">
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
                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    {translate("Comment")}
                  </th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">
                    {translate("Status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {item.monthName || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {item.prescribedFee || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {item.acceptedFees || "N/A"}
                      </td>
                      <td className="px-4 text-center whitespace-nowrap">
                        <DefaultInput registerKey={`comment_${index}`} />
                      </td>
                      <td className="px-4 py-2 text-center flex justify-center items-center whitespace-nowrap">
                        <SingleCheckbox
                          registerKey={`status_${index}`}
                          dcn="mb-0"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FormProvider>

      <SelectedPerStudentFeeTable resetForm={reset} />
    </div>
  );
};

export default SelectedPerStudentFee;
