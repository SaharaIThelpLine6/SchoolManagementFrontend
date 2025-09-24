import { useDispatch, useSelector } from "react-redux";
import useTranslate from "../utils/Translate";
import { useLocation } from "react-router-dom";
import { useCallback, useEffect } from "react";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import FilterButton from "../components/Filter/FilterButton";
import SelectedPerStudentFeeTable from "../view/accounting/SelectedPerStudentFeeTable";
import MonthDetermineFeeTable from "../view/accounting/MonthDetermineFeeTable";
import { showModal } from "../utils/ModalControlar";
import { setFilteredSelectedPerStudentFee } from "../features/student/studentSlice";

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

  useEffect(() => {
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
      reset(defaultValues);
    } else {
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
    handleReset(); // page change হলে filterData reset করা
  }, [location.pathname]);

  // Reset Button
  const handleResetButton = () => {
    handleReset();
  };

  return (
    <div className="p-2 md:p-4">
      <FormProvider {...methods}>
        <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {translate("Selected Per Student Fee")}
            </h3>
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

          {/* Student Info Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                className="
                px-6 py-2
                bg-gray-400
                text-black
                font-medium
                rounded-md
                hover:bg-gray-500
                transition-colors
                duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-gray-500
              "
                onClick={handleResetButton}
              >
                {translate("Reset")}
              </Button>
              <Button type="submit" className="px-8">
                {translate("Save")}
              </Button>{" "}
            </div>
          </form>
          {/* Tables */}
        </div>
      </FormProvider>
      <div className="space-y-6">
        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border">
          <SelectedPerStudentFeeTable resetForm={handleResetButton} />
        </div>

        <div className="bg-gray-50 p-3 md:p-4 rounded-xl border">
          <MonthDetermineFeeTable />
        </div>
      </div>
    </div>
  );
};

export default StudentsFeeCollection;
