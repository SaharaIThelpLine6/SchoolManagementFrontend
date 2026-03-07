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
import { useGetSessionsQuery, useGetSubclassesQuery } from "../../features/session/sessionSlice";
import { useCreateUserNoticeMutation, useGetUserNoticeQuery, useGetUserNoticesQuery, useGetUsersWithTypeQuery, useUpdateUserNoticeMutation } from "../../features/settings/settingsQuerySlice";
import SearchSelect from "./SearchSelect";
import UserSearchSelect from "./UserSearchSelect";

const UserNoticeUpdateForm = ({ id }) => {
  console.log(id, "id")
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit, reset, control, setValue } = methods;

  const [mode, setMode] = useState("single"); // single | multiple

  const selectedUserType = useWatch({
    control,
    name: "UserTypeID",
  });

  const { data: userType = [] } = useGetUserTypesQuery();
  const { data: responseData = {} } = useGetSubclassesQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  // const { data: noticeData } = useGetUserNoticeQuery(
  //   id,
  //   { skip: !id }
  // )
  // console.log(noticeData, "noticeData")
  const [
    updateUserNotice,
    { isLoading: isUpdateLoading }
  ] = useUpdateUserNoticeMutation();
  useEffect(() => {
    reset({});
  }, [mode, reset]);

  // Default Session
  useEffect(() => {
    reset({
      SessionID: activeSession?.SessionID || "",
    });
  }, [mode, activeSession, reset]);

  const onSubmit = async (data) => {
    try {
      console.log("Final Submit Data:", data);

      const payload = {
        ...data,
        mode: data.ClassID ? "class" : mode, // যদি ClassID থাকে → class mode
      };

      // 🔥 আগে API call হবে
      const response = await updateUserNotice(payload).unwrap();

      // ✅ API success হলে alert দেখাবে
      Swal.fire({
        icon: "success",
        title: translate("Submitted Successfully"),
        text: response?.message || "",
      });

      hideModal();

    } catch (error) {
      console.error("Submit Error:", error);

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


        {/* ========================= */}
        {/* USER TYPE (COMMON) */}
        {/* ========================= */}

        <DefaultSelect
          label={translate("User Type")}
          options={userType}
          valueField="ID"
          nameField="TypeName"
          registerKey="UserTypeID"
          require={"User type required!"}
          placeholder={translate("Select User Type")}
        />

        {/* ========================= */}
        {/* SINGLE MODE */}
        {/* ========================= */}

        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DefaultSelect
              label={"Session"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <UserSearchSelect
              label="Select User"
              registerKey="UserID"              // the field name in the form
              require={true}                     // required validation
              selectedUserType={1}               // UserTypeID to fetch users
              valueField="UserID"                // value to store in form
              nameField="UserName"               // text to show
              unicode={false}                                  // use true if you want Bangla Bijoy conversion
            />
          </div>

          <Textarea
            label="এসএমএস মেসেজ"
            registerKey="NoticeMessage"
            placeholder="এসএমএস মেসেজ লিখুন..."
            rows={4}
            require={true}

          />
        </>


        {/* ========================= */}
        {/* SUBMIT BUTTON */}
        {/* ========================= */}

        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {translate("Submit")}
        </Button>
      </form>
    </FormProvider>
  );
};

export default UserNoticeUpdateForm;