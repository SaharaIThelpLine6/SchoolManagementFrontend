import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { setPageName } from "../../features/auth/authSlice";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../../features/class/classQuerySlice";
import {
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../../features/exam/examQuerySlice";
import useTranslate from "../../utils/Translate";
import DefaultInput from "../../components/Forms/DefaultInput";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import Button from "../../components/Button/Button";
import Textarea from "../../components/Forms/Textarea";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";

const PAGE_SIZE = 10;

const BalanceTransferModal = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();


  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);



  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      Fee: Number(data.Fee),
      SLID: data.SLID,
    };

    try {
      let response;
      if (data.ID) {
        response = await updateExamFeeSetting({
          id: data.ID,
          body: payload,
        }).unwrap();
      } else {
        response = await postExamFeeSetting(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        refetch();
        methods.reset();
      });
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        "অজানা একটি ত্রুটি ঘটেছে।";
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: errMsg,
      });
      console.error("Exam Fee Setting Error:", error);
    }
  };



  return (
    <div className="font-SolaimanLipi bg-white p-6 pt-0 rounded shadow">
      <FormProvider {...methods}>
        <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...methods.register("ID")} />

          {/* From & To Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From */}
            <div className="p-4 rounded-md shadow-sm bg-gray-50">
              <h2 className="text-center font-medium mb-4">
                {translate("From")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DefaultSelect
                  label="Fund"
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="fromSessionID"
                  unicode={true}
                />
                <DefaultSelect
                  label="Type"
                  options={subClassListData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="fromSubClassID"
                  unicode={true}
                />
              </div>
            </div>

            {/* To */}
            <div className="p-4 rounded-md shadow-sm bg-gray-50">
              <h2 className="text-center font-medium mb-4">
                {translate("To")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DefaultSelect
                  label="Fund"
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="toSessionID"
                  unicode={true}
                />
                <DefaultSelect
                  label="Type"
                  options={subClassListData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="toSubClassID"
                  unicode={true}
                />
              </div>
            </div>
          </div>

          {/* Extra Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DefaultInput
              registerKey="readonlyTaka"
              label={translate("Taka")}
              disable
            />
            <DefaultInput registerKey="amount" label="Amount" />
            <DefaultInput registerKey="readonlyTotal" label="Total" disable />
          </div>

          {/* Account, Date, Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DefaultSelect
              label="Account"
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="accountID"
              unicode={true}
            />
            <DatePickerOne
              dateCalender="Date"
              placeholder={"date"}
              registerKey={"date"}
              require={"Date is required"}
            />
            <DefaultSelect
              label="Name"
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="nameID"
              unicode={true}
            />
          </div>

          {/* Comments Textarea */}
          <Textarea
            label="Comments"
            registerKey="comments"
            unicode={true}
            rows={4}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" className="w-full sm:w-auto">
              {translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
export default BalanceTransferModal
