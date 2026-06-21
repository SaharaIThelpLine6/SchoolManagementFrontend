import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import DefaultInput from "../../components/Forms/DefaultInput";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import Button from "../../components/Button/Button";

import {
  useGetClassListQuery,
} from "../../features/class/classQuerySlice";

import {
  useGetStudentFeeLandFilterQuery,
  useGetStudentFeeLandSingleFilterQuery,
  useUpdateMonthlyAttendanceLeftMutation,
  useUpdateMonthlyAttendanceRightMutation,

} from "../../features/feeCollection/feeCollectionSlice";
import Swal from "sweetalert2";

import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import bnBijoy2Unicode from "../../utils/conveter";
import useTranslate from "../../utils/Translate";

const MonthlyAttendance = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { watch, setValue, getValues } = methods;

  const [loadingLeft, setLoadingLeft] = useState(false);
  const [loadingRight, setLoadingRight] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();

  // Mutations
  const [updateMonthlyAttendanceLeft] = useUpdateMonthlyAttendanceLeftMutation();
  const [updateMonthlyAttendanceRight] = useUpdateMonthlyAttendanceRightMutation();

  const [SessionID, ClassID, UserCode] = watch(["SessionID", "ClassID", "UserCode"]);

  const shouldSkip = !SessionID || !ClassID;
  const shouldSingleSkip = !SessionID || !ClassID || !UserCode;

  const { data: monthListData } = useGetStudentFeeLandFilterQuery(
    { SessionID, ClassID },
    { skip: shouldSkip }
  );

  const { data: monthListSingleData } = useGetStudentFeeLandSingleFilterQuery(
    { ClassID, SessionID, UserCode },
    { skip: shouldSingleSkip }
  );

  useEffect(() => {
    if (monthListSingleData?.data?.length > 0) {
      setValue("StudentName", monthListSingleData.data[0].UserName);
    }
  }, [monthListSingleData, setValue]);

  // ✅ LEFT TABLE DATA TRANSFORM
  const monthRows = useMemo(() => {
    const item = monthListData?.data?.[0];
    if (!item) return [];

    const months = [];

    for (let i = 1; i <= 12; i++) {
      months.push({
        monthName: item[`Month${i}`],
        totalDay: item[`MDay${i}`],
        totalClosed: item[`MOffDay${i}`],
        index: i - 1,
      });
    }

    return months;
  }, [monthListData]);

  const singleMonthRows = useMemo(() => {
    const item = monthListSingleData?.data?.[0];

    if (!item) return [];

    const months = [];

    for (let i = 1; i <= 12; i++) {
      months.push({
        fee: item[`Fee${i}`],
        less: item[`Less${i}`],
        amount: item[`M${i}`],
        offDay: item[`POffDay${i}`],
        index: i - 1,
      });
    }

    return months;
  }, [monthListSingleData]);

  // LEFT TABLE SAVE HANDLER
  const handleSaveLeft = async (e) => {
    e.preventDefault();

    try {
      setLoadingLeft(true);

      const formData = getValues();
      const monthFeeList = formData.monthFeeList || [];

      const payload = {
        SessionID,
        ClassID,
        monthlyData: monthFeeList.map((item, index) => ({
          index: index + 1,
          totalDay: item.totalDay || 0,
          totalClosed: item.totalClosed || 0,
        })),
      };

      const response = await updateMonthlyAttendanceLeft(payload).unwrap();

      // ✅ Success Alert
      Swal.fire({
        icon: "success",
        title: "সফল",
        text: "মাসিক বন্ধ সফলভাবে সংরক্ষিত হয়েছে",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("Left table saved successfully:", response);

    } catch (error) {

      // ❌ Error Alert
      Swal.fire({
        icon: "error",
        title: "ব্যর্থ",
        text:
          error?.data?.message ||
          "মাসিক বন্ধ সংরক্ষণ ব্যর্থ হয়েছে",
      });

      console.error("Left table save error:", error);

    } finally {
      setLoadingLeft(false);
    }
  };


  // RIGHT TABLE SAVE HANDLER
  const handleSaveRight = async (e) => {
    e.preventDefault();

    try {
      setLoadingRight(true);

      if (!UserCode) {

        Swal.fire({
          icon: "warning",
          title: "সতর্কতা",
          text: "অনুগ্রহ করে ছাত্র কোড নির্বাচন করুন",
        });

        setLoadingRight(false);
        return;
      }

      const formData = getValues();
      const singleMonthList = formData.singleMonthList || [];

      const payload = {
        SessionID,
        ClassID,
        UserCode,
        singleMonthData: singleMonthList.map((item, index) => ({
          index: index + 1,
          offDay: item.offDay || 0,
        })),
      };

      const response = await updateMonthlyAttendanceRight(payload).unwrap();

      // ✅ Success Alert
      Swal.fire({
        icon: "success",
        title: "সফল",
        text: "একক বন্ধ সফলভাবে সংরক্ষিত হয়েছে",
        timer: 2000,
        showConfirmButton: false,
      });

      console.log("Right table saved successfully:", response);

    } catch (error) {

      // ❌ Error Alert
      Swal.fire({
        icon: "error",
        title: "ব্যর্থ",
        text:
          error?.data?.message ||
          "একক বন্ধ সংরক্ষণ ব্যর্থ হয়েছে",
      });

      console.error("Right table save error:", error);

    } finally {
      setLoadingRight(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-7xl mx-auto mb-10 space-y-6">

        {/* SUCCESS/ERROR MESSAGE */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {errorMessage}
          </div>
        )}

        {/* FILTER */}
        <div className="bg-white rounded-2xl shadow-md border p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            <DefaultSelect
              options={sessionData ?? []}
              registerKey="SessionID"
              placeholder="বছর নির্বাচন করুন"
              nameField="SessionName"
              valueField={"SessionID"}
              label="Session"
              unicode
            />

            <DefaultSelect
              options={classListData ?? []}
              registerKey="ClassID"
              placeholder="শ্রেণি নির্বাচন করুন"
              nameField="ClassName"
              valueField={"ClassID"}
              label="Class/Jamaat"
              unicode
            />
            <DefaultInput
              registerKey="UserCode"
              type="text"
              placeholder={translate("Enter Student Code") + " ..."}
              label="Student Code"
            />

            <DefaultInput
              registerKey="StudentName"
              type="text"
              placeholder={translate("Enter Student Name") + " ..."}
              label="Student Name"
              disable
            />
          </div>
        </div>

        {/* MAIN */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT TABLE (DYNAMIC) */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-md border overflow-hidden">

            <div className="bg-emerald-600 px-5 py-4">
              <h2 className="text-white text-center font-semibold">
                মাসিক বন্ধ
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">

                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-4 py-3 text-center border-b">
                      {translate("Month Name")}
                    </th>
                    <th className="px-4 py-3 text-center border-b">
                      {translate("Total Day")}
                    </th>
                    <th className="px-4 py-3 text-center border-b">
                      মোট বন্ধ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {monthRows.length > 0 ? (
                    monthRows.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">

                        <td className="px-4 py-2 text-center font-medium">
                          {bnBijoy2Unicode(item.monthName)}
                        </td>

                        <td className="px-3 py-2">
                          <DefaultInput
                            registerKey={`monthFeeList.${index}.totalDay`}
                            type="text"
                            defaultValue={item.totalDay}
                          />
                        </td>

                        <td className="px-3 py-2">
                          <DefaultInput
                            registerKey={`monthFeeList.${index}.totalClosed`}
                            type="text"
                            defaultValue={item.totalClosed}
                          />
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-gray-500">
                        {translate("No data available")}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            <div className="p-4 flex justify-center bg-gray-50 border-t">
              <Button
                onClick={handleSaveLeft}
                disabled={loadingLeft}
                className={`${loadingLeft
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
                  } text-white px-8 rounded-xl transition`}
              >
                {loadingLeft ? "সংরক্ষণ করছে..." : "Save"}
              </Button>
            </div>
          </div>

          {/* RIGHT TABLE (UNCHANGED) */}
          <div className="bg-white rounded-2xl shadow-md border overflow-hidden">

            <div className="bg-sky-600 px-5 py-4">
              <h2 className="text-white text-center font-semibold">
                একক বন্ধ
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">

                <thead className="bg-sky-50">
                  <tr>
                    <th className="px-4 py-3 text-center border-b">
                      মোট বন্ধ
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {singleMonthRows.length > 0 ? (
                    singleMonthRows.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {/* Off Day */}
                        <td className="px-3 py-2">
                          <DefaultInput
                            registerKey={`singleMonthList.${index}.offDay`}
                            type="text"
                            defaultValue={item.offDay}
                          />
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-gray-500"
                      >
                        {translate("No data available")}
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

            <div className="p-4 flex justify-center bg-gray-50 border-t">
              <Button
                onClick={handleSaveRight}
                disabled={loadingRight || !UserCode}
                className={`${loadingRight || !UserCode
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700"
                  } text-white px-8 rounded-xl transition`}
              >
                {loadingRight ? "সংরক্ষণ করছে..." : "Save"}
              </Button>
            </div>

          </div>

        </div>
      </div>
    </FormProvider>
  );
};

export default MonthlyAttendance;
