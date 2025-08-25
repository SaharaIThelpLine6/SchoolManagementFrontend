import { useState } from "react";
import DefaultInput from "../../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../../components/Button/Button";
import useTranslate from "../../utils/Translate";

const UserNamePasswordChangeModal = ({ changeType = "username" }) => {
  const methods = useForm();
  const translate = useTranslate();
  const [isChanged, setIsChanged] = useState(false);

  const { handleSubmit } = methods;

  const onSubmit = (data) => {
    console.log(data);
    // Here you would typically make an API call to update the username/password
    setIsChanged(true);
    setTimeout(() => setIsChanged(false), 3000); // Reset success message after 3 seconds
  };

  // Determine if we're changing username or password
  const isUsernameChange = changeType === "username";

  return (
    <FormProvider {...methods}>
      <div className="bg-white p-6 rounded-lg">
        {isChanged ? (
          <div className="text-center py-4 px-6 bg-green-100 text-green-700 rounded-md mb-4">
            {isUsernameChange ? "Username successfully changed!" : "Password successfully changed!"}
          </div>
        ) : (
          <div className="text-center py-4 px-6 bg-blue-100 text-blue-700 rounded-md mb-4">
            {isUsernameChange 
              ? "নিরাপত্তার জন্য আপনার একাউন্টে মজবুত ইউজার নাম ব্যবহার করুন।" 
              : "নিরাপত্তার জন্য আপনার একাউন্টে মজবুত পাসওয়ার্ড ব্যবহার করুন।"}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="shadow-lg rounded-xl p-5 flex flex-col gap-6 font-SolaimanLipi max-w-md mx-auto"
        >
          {isUsernameChange ? (
            <>
              <DefaultInput
                type="text"
                label="New User Name :"
                placeholder="Enter new user name"
                registerKey="newUserName"
                validation={{ required: "User name is required" }}
              />
              
              <DefaultInput
                type="text"
                label="Confirm new user name :"
                placeholder="Confirm new user name"
                registerKey="confirmNewUserName"
                validation={{
                  required: "Please confirm your user name",
                  validate: value => 
                    value === methods.watch("newUserName") || "User names do not match"
                }}
              />
            </>
          ) : (
            <>
              <DefaultInput
                type="password"
                label="Current Password :"
                placeholder="Enter current password"
                registerKey="currentPassword"
                validation={{ required: "Current password is required" }}
              />
              
              <DefaultInput
                type="password"
                label="New Password :"
                placeholder="Enter new password"
                registerKey="newPassword"
                validation={{ 
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                }}
              />
              
              <DefaultInput
                type="password"
                label="Confirm new password :"
                placeholder="Confirm new password"
                registerKey="confirmNewPassword"
                validation={{
                  required: "Please confirm your new password",
                  validate: value => 
                    value === methods.watch("newPassword") || "Passwords do not match"
                }}
              />
            </>
          )}

          <div className="flex justify-end pt-3">
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