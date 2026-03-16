import { useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import { hideModal } from "../../utils/ModalControlar";
import Button from "../Button/Button";
import DefaultSelect from "./DefaultSelect";
import Textarea from "./Textarea";

import { useGetUserTypesQuery } from "../../features/userType/userTypeSlice";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import {
  useGetUserNoticeQuery,
  useUpdateUserNoticeMutation
} from "../../features/settings/settingsQuerySlice";

import UserSearchSelect from "./UserSearchSelect";

const UserNoticeUpdateForm = ({ id }) => {

  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit, reset, control } = methods;

  const [mode] = useState("single");

  const selectedUserType = useWatch({
    control,
    name: "UserTypeID",
  });

  const { data: userType = [] } = useGetUserTypesQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  // ✅ GET SINGLE NOTICE
  const { data: noticeResponse } = useGetUserNoticeQuery(id, {
    skip: !id,
  });

  const noticeData = noticeResponse?.data;

  const [
    updateUserNotice,
    { isLoading: isUpdateLoading }
  ] = useUpdateUserNoticeMutation();

  // ✅ FORM DATA SET WHEN API LOAD
  useEffect(() => {
    if (noticeData) {
      reset({
        UserTypeID: noticeData?.UserTypeID,
        SessionID: noticeData?.SessionID,
        UserID: noticeData?.UserID,
        NoticeMessage: noticeData?.NoticeMessage,
      });
    }
  }, [noticeData, reset]);

  // Default Session
  useEffect(() => {
    if (!noticeData) {
      reset({
        SessionID: activeSession?.SessionID || "",
      });
    }
  }, [activeSession, noticeData, reset]);

  const onSubmit = async (data) => {
    try {

      const payload = {
        id,
        ...data,
        mode: data.ClassID ? "class" : mode,
      };

      const response = await updateUserNotice(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: translate("Submitted Successfully"),
        text: response?.message || "",
      });

      hideModal();

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: translate("Submission Failed"),
        text: error?.data?.error || "Something went wrong",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-lato p-6 space-y-4"
      >

        {/* USER TYPE */}

        <DefaultSelect
          label={translate("User Type")}
          options={userType}
          valueField="ID"
          nameField="TypeName"
          registerKey="UserTypeID"
          require={"User type required!"}
          placeholder={translate("Select User Type")}
        />

        {/* SESSION + USER */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <DefaultSelect
            label={"Session"}
            options={sessionData}
            valueField="SessionID"
            nameField="SessionName"
            registerKey="SessionID"
          />

          <UserSearchSelect
            label="Select User"
            registerKey="UserID"
            require={true}
            selectedUserType={selectedUserType}
            valueField="UserID"
            nameField="UserName"
            unicode={false}
          />

        </div>

        {/* MESSAGE */}

        <Textarea
          label="এসএমএস মেসেজ"
          registerKey="NoticeMessage"
          placeholder="এসএমএস মেসেজ লিখুন..."
          rows={4}
          require={true}
        />

        {/* SUBMIT */}

        <Button
          type="submit"
          disabled={isUpdateLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {translate("Update")}
        </Button>

      </form>
    </FormProvider>
  );
};

export default UserNoticeUpdateForm;