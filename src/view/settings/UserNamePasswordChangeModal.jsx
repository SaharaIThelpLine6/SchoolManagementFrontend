import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import DefaultInput from "../../components/Forms/DefaultInput";
import useTranslate from "../../utils/Translate";
import {
  useUpdateLoginUserNameChangeMutation,
  useUpdateLoginUserPasswordChangeMutation,
} from "../../features/userType/userTypeSlice";

/* ---------------- Icons ---------------- */

const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const UserIcon = ({ size = 22 }) => (
  <svg {...svgBase} width={size} height={size}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const KeyIcon = ({ size = 22 }) => (
  <svg {...svgBase} width={size} height={size}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m10.7 12.3 9.3-9.3" />
    <path d="m16 7 3 3" />
    <path d="m14 9 2 2" />
  </svg>
);

const EyeIcon = () => (
  <svg {...svgBase} width="18" height="18">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...svgBase} width="18" height="18">
    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 19c-6.5 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a18.6 18.6 0 0 1-2.16 3.19" />
    <path d="m1 1 22 22" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...svgBase} width="14" height="14">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/* ---------------- Helpers ---------------- */

// পাসওয়ার্ডের শক্তি: 0 (খালি) থেকে 4
const getStrength = (value = "") => {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.max(score, 1);
};

const STRENGTH_META = [
  null,
  { label: "Weak", bar: "bg-rose-500", text: "text-rose-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-sky-500", text: "text-sky-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

/* ---------------- Password field with eye toggle ---------------- */

const PasswordField = ({ shown, onToggle, ...props }) => (
  <div className="relative">
    <DefaultInput {...props} type={shown ? "text" : "password"} className="w-full pr-12" />
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? "Hide password" : "Show password"}
      className="absolute right-2 top-[30px] flex h-[40px] w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
    >
      {shown ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </div>
);

/* ---------------- Main Component ---------------- */

const UserNamePasswordChangeModal = ({ changeType = "username", id }) => {
  const methods = useForm({ mode: "onTouched" });
  const translate = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;

  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  const [updateName] = useUpdateLoginUserNameChangeMutation();
  const [updatePassword] = useUpdateLoginUserPasswordChangeMutation();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isUsernameChange = changeType === "username";
  const newPasswordValue = watch("newPassword");
  const strength = getStrength(newPasswordValue);
  const strengthMeta = STRENGTH_META[strength];

  const onSubmit = async (data) => {
    try {
      if (isUsernameChange) {
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
      } else {
        const payload =
          permissionType === 6
            ? {
              password: data.newPassword,
              oldPassword: data.currentPassword,
              school_id: user?.schoolId,
            }
            : { password: data.newPassword, school_id: user?.schoolId };

        await updatePassword({ id, data: payload }).unwrap();

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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full overflow-hidden rounded-2xl bg-white font-SolaimanLipi shadow-xl ring-1 ring-black/5"
      >

        {/* Body */}
        <div className="px-5 py-5">
          <div className="flex flex-col gap-5 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-4">
            {isUsernameChange ? (
              <>
                <DefaultInput
                  type="text"
                  label="New user name"
                  placeholder={translate("Enter new user name")}
                  registerKey="newUserName"
                  require={translate("User name is required")}
                  className="w-full"
                />

                <DefaultInput
                  type="text"
                  label="Confirm new user name"
                  placeholder={translate("Confirm new user name")}
                  registerKey="confirmNewUserName"
                  require={translate("Please confirm your new user name")}
                  className="w-full"
                  validate={(value) =>
                    value === watch("newUserName") ||
                    translate("User name do not match")
                  }
                />
              </>
            ) : (
              <>
                {permissionType === 6 && (
                  <PasswordField
                    shown={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
                    label="Current Password"
                    placeholder={translate("Enter current password")}
                    registerKey="currentPassword"
                    require={translate("Current password is required")}
                  />
                )}

                <div>
                  <PasswordField
                    shown={showNew}
                    onToggle={() => setShowNew((v) => !v)}
                    label="New Password"
                    placeholder={translate("Enter new password")}
                    registerKey="newPassword"
                    require={translate("New password is required")}
                  />

                  {/* Strength meter */}
                  {newPasswordValue ? (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <span
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step <= strength ? strengthMeta.bar : "bg-gray-200"
                              }`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1 flex items-center gap-1 text-[11px] font-semibold ${strengthMeta.text}`}>
                        <ShieldIcon />
                        {translate("Password strength")}: {translate(strengthMeta.label)}
                      </p>
                    </div>
                  ) : null}
                </div>

                <PasswordField
                  shown={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  label="Confirm new password"
                  placeholder={translate("Confirm new password")}
                  registerKey="confirmNewPassword"
                  require={translate("Please confirm your new password")}
                  validate={(value) =>
                    value === watch("newPassword") ||
                    translate("New password and confirm password do not match!")
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
          <button
            type="button"
            onClick={() => reset()}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-[13px] font-bold text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {translate("Reset")}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-[13px] font-bold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 ${isSubmitting ? "cursor-not-allowed opacity-70" : ""
              }`}
          >
            {isSubmitting ? <Spinner /> : null}
            {isSubmitting
              ? translate("Saving...")
              : isUsernameChange
                ? translate("Save")
                : translate("Save")}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UserNamePasswordChangeModal;
