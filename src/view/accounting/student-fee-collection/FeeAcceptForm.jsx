import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";
import { useGetStudentFeeAdmissionsQuery } from "../../../features/feeCollection/feeCollectionSlice";

const PAGE_SIZE = 10;

const FeeAcceptForm = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  console.log(filteredSelectedPerStudentFee, "filteredSelectedPerStudentFee");

  console.log(
    filteredSelectedPerStudentFee?.SessionID,
    filteredSelectedPerStudentFee?.ClassID,
    "filteredSelectedPerStudentFee"
  );

  // getStudentFeeAdmissions query expects { fundId, classId }
  const { data: studentFeeAdmissionData } = useGetStudentFeeAdmissionsQuery(
    {
      fundId: filteredSelectedPerStudentFee?.SessionID, // note: backend expects fundId
      classId: filteredSelectedPerStudentFee?.ClassID,
    },
    {
      skip:
        !filteredSelectedPerStudentFee?.SessionID ||
        !filteredSelectedPerStudentFee?.ClassID,
    }
  );

  console.log(studentFeeAdmissionData, "studentFeeAdmissionData");

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

  const onSubmit = () => {};
  return (
    <div className="font-SolaimanLipi bg-white p-4 md:px-6 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
            <DefaultInput
              type="text"
              registerKey={`total`}
              label="Student Code"
            />
            <DefaultInput
              type="text"
              registerKey="deduction"
              label="Month ID"
            />
            <DefaultInput type="text" registerKey="type" label="Receipt" />
            <DefaultInput
              type="text"
              registerKey="grandTotal"
              label="Month Name"
            />
          </div>
          <div className="flex flex-col md:flex-row-reverse gap-4 my-5">
            {/* Deduction Inputs */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 items-center">
                <DefaultInput
                  type="text"
                  registerKey="deduction1"
                  label="Prescribed Fee"
                />
                <DefaultInput
                  type="text"
                  registerKey="deduction2"
                  label="East cut"
                />
                <DefaultInput
                  type="text"
                  registerKey="deduction3"
                  label="Pre-deposit"
                />
                <DefaultInput
                  type="text"
                  registerKey="deduction4"
                  label="Deduction"
                />
                <DefaultInput
                  type="text"
                  registerKey="deduction5"
                  label="Current deposit"
                />
              </div>
            </div>
            {/* Save / Cancel Buttons */}
            <div className="flex justify-start md:justify-center items-center gap-2 mt-5">
              <Button
                type="button"
                className="px-6 py-2 rounded-lg font-SolaimanLipi bg-gray-400 text-white hover:bg-gray-500 transition"
              >
                Close
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 rounded-lg font-SolaimanLipi bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Add
              </Button>
            </div>
          </div>
        </form>
        <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
          <table className="min-w-[800px] sm:text-sm table-auto text-sm md:text-base">
            <thead className="bg-[#e9ebee] text-black">
              <tr>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate("Action")}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate("ID")}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate("Fee Name")}
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
                      <DeleteButton />
                    </td>
                    <td className="text-center whitespace-nowrap">
                      {1003 + index}
                    </td>
                    <td className="text-center whitespace-nowrap">ভর্তি ফি</td>
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
      </FormProvider>
    </div>
  );
};

export default FeeAcceptForm;
