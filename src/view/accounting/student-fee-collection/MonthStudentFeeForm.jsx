import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { setPageName } from "../../../features/auth/authSlice";
import { useGetExamFeeSettingQuery } from "../../../features/exam/examQuerySlice";
import useTranslate from "../../../utils/Translate";
import bnBijoy2Unicode from "../../../utils/conveter";
import SortableTable from "../../../components/Tables/SortableTable";
import Loading from "../../../components/Loading/Loading";
import DeleteButton from "../../../components/Button/DeleteButton";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";
import DefaultInput from "../../../components/Forms/DefaultInput";
import Button from "../../../components/Button/Button";
import MonthDetermineFeeTable from "../MonthDetermineFeeTable";

const PAGE_SIZE = 10;

const MonthStudentFeeForm = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit } = methods;

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

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);


  const onSubmit = () => { };
  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        {/* Student Info Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="col-span-2 flex flex-col gap-2 mb-6">
              <DefaultInput
                type="text"
                registerKey="StudentCode"
                label="Student Code"
                labelPosition="left"
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="StudentName"
                label="Name"
                labelPosition="left"
                unicode={true}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="ClassName"
                label="Class"
                labelPosition="left"
                unicode={true}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="SessionName"
                label="Session"
                labelPosition="left"
                unicode={true}
                disable={true}
              /><DefaultInput
                type="text"
                registerKey="SessionName"
                label="Comment"
                labelPosition="left"
                unicode={true}
              />
              <DefaultInput
                type="text"
                registerKey="AmountTotal"
                label="Total Fee"
                labelPosition="left"
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="LessTotal"
                label="Deduction"
                labelPosition="left"
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="Total"
                label="Total Deposits"
                labelPosition="left"
                disable={true}
              />
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
                // onClick={handleResetButton}
                >
                  {translate("Reset")}
                </Button>
                <Button type="submit" className="px-8">
                  {translate("Save")}
                </Button>{" "}
              </div>
            </div>
            <div className="col-span-3 bg-gray-50 p-3 md:p-4 rounded-xl border">
              <MonthDetermineFeeTable />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default MonthStudentFeeForm;
