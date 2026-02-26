import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import useTranslate from "../../utils/Translate";
import {
  useUpdateLoginUserNameChangeMutation,
  useUpdateLoginUserPasswordChangeMutation,
} from "../../features/userType/userTypeSlice";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useGetIncomeExpenseTodaysBalanceByCaidQuery, useGetIncomeExpenseTodaysBalanceQuery } from "../../features/feeCollection/feeCollectionSlice";
import { useState } from "react";

const TodaysBalance = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;
  const [CAID, SetCAID] = useState(null)
  const { data: todaysBalanceList } = useGetIncomeExpenseTodaysBalanceQuery();

  const { data: todaysAmountBySubledger, refetch: refetchGLData } =
    useGetIncomeExpenseTodaysBalanceByCaidQuery(
      { caid: CAID },
      {
        skip: !CAID,
      }
    );
  const { handleSubmit, reset, watch } = methods;



  return (
    <div className="bg-white flex flex-col md:flex-row gap-6 p-4 rounded-2xl shadow-md w-full">
      {/* First Table */}
      {todaysBalanceList && todaysBalanceList.length > 0 ? (
        <div className="overflow-x-auto w-full md:w-1/2">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Account Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todaysBalanceList.map((todaysBalance) => (
                <tr
                  key={todaysBalance.GLID}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-800">{todaysBalance.GlName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {todaysBalance.Amount}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        SetCAID(todaysBalance.GLID);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Second Table */}
      {todaysAmountBySubledger && todaysAmountBySubledger.length > 0 ? (
        <div className="overflow-x-auto w-full md:w-1/2">
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Subledger</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {todaysAmountBySubledger.map((todaysAmount, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-3 text-sm text-gray-800">{todaysAmount.SlName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                    {todaysAmount.Amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>

  );
};

export default TodaysBalance;
