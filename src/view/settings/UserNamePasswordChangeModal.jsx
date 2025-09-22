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

const UserNamePasswordChangeModal = ({ changeType = "username", id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;

  const { handleSubmit, reset, watch } = methods;
  const [updateName] = useUpdateLoginUserNameChangeMutation();
  const [updatePassword] = useUpdateLoginUserPasswordChangeMutation();

  const onSubmit = async (data) => {
    try {
      if (changeType === "username") {
        // === ইউজারনেম আপডেট ===
        await updateName({
          id,
          data: { loginName: data.newUserName, school_id: user?.schoolId },
        }).unwrap();

        reset();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Username successfully changed!",
        });
      } else if (changeType === "password") {
        // === পাসওয়ার্ড আপডেট ===
        if (permissionType === 6) {
          await updatePassword({
            id,
            data: {
              password: data.newPassword,
              oldPassword: data.currentPassword,
              school_id: user?.schoolId,
            },
          }).unwrap();
        } else {
          await updatePassword({
            id,
            data: {
              password: data.newPassword,
              school_id: user?.schoolId,
            },
          }).unwrap();
        }

        reset();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password successfully changed!",
        });
      }
    } catch (error) {
      console.error("Update failed:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "An error occurred. Please try again.",
      });
    }
  };

  // Determine if we're changing username or password
  const isUsernameChange = changeType === "username";

  return (
    <FormProvider {...methods}>
      <div className="bg-white p-6 rounded-lg">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="shadow-lg rounded-xl p-5 flex flex-col gap-6 font-SolaimanLipi max-w-md mx-auto"
        >
          {isUsernameChange ? (
            <>
              <DefaultInput
                type="text"
                label="New user name"
                placeholder="Enter new user name"
                registerKey="newUserName"
                require="User name is required"
              />

              <DefaultInput
                type="text"
                label="Confirm new user name"
                placeholder="Confirm new user name"
                registerKey="confirmNewUserName"
                require="Please confirm your new user name"
                validate={(value) =>
                  value === watch("newUserName") || "User name do not match"
                }
              />
            </>
          ) : (
            <>
              {permissionType === 6 && (
                <DefaultInput
                  type="password"
                  label="Current Password"
                  placeholder="Enter current password"
                  registerKey="currentPassword"
                  require="Current password is required"
                />
              )}

              <DefaultInput
                type="password"
                label="New Password"
                placeholder="Enter new password"
                registerKey="newPassword"
                require="New password is required"
              />

              <DefaultInput
                type="password"
                label="Confirm new password"
                placeholder="Confirm new password"
                registerKey="confirmNewPassword"
                require="Please confirm your new password"
                validate={(value) =>
                  value === watch("newPassword") ||
                  "New password and confirm password do not match!"
                }
              />
            </>
          )}

          <div className="flex justify-center pt-3">
            <Button type="submit">
              {isUsernameChange ? "Change User Name" : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default UserNamePasswordChangeModal;
