
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import { hideModal } from "../../utils/ModalControlar";
import Button from "../Button/Button";
import { useUpdatePasswordMutation } from "../../features/userType/userTypeSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";

const UserPasswordChange = () => {
  const translate = useTranslate();

  const [postChangePassword, { isLoading }] = useUpdatePasswordMutation();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const methods = useForm({
    defaultValues: {
      oldPassword: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await postChangePassword({
        oldPassword: data.oldPassword,
        password: data.password,
      }).unwrap();

      Swal.fire({
        title: translate("Password updated successfully!"),
        icon: "success",
        confirmButtonColor: "#3B82F6",
      });

      methods.reset();
      hideModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title:
          error?.data?.error ||
          translate("Failed to update password"),
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="font-default p-6"
      >
        {/* Old Password */}
        <div className="mb-4 relative">
          <DefaultInput
            registerKey="oldPassword"
            require={translate("Old password is required")}
            type={showOldPassword ? "text" : "password"}
            placeholder={translate("Enter old password") + " ..."}
            label="Old Password"
          />

          <button
            type="button"
            onClick={() => setShowOldPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-blue-500 transition-all duration-200"
            aria-label={showOldPassword ? "Hide password" : "Show password"}
          >
            {showOldPassword ? (
              <FiEyeOff size={19} />
            ) : (
              <FiEye size={19} />
            )}
          </button>
        </div>

        {/* New Password */}
        <div className="mb-5 relative">
          <DefaultInput
            registerKey="password"
            require={translate("New password is required")}
            type={showNewPassword ? "text" : "password"}
            placeholder={translate("Enter new password") + " ..."}
            label="New Password"
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-blue-500 transition-all duration-200"
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword ? (
              <FiEyeOff size={19} />
            ) : (
              <FiEye size={19} />
            )}
          </button>
        </div>

        <Button
          loading={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          type="submit"
        >
          {translate("Update Password")}
        </Button>
      </form>
    </FormProvider>
  );
};

export default UserPasswordChange;
