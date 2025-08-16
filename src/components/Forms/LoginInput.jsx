import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import SvgIcon from "../icons/SvgIcon";

const LoginInput = ({
  label,
  type,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  icon,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const validateNumber = (value) => {
    if (type === "number" && value && isNaN(Number(value))) {
      return translate("Please enter a valid number");
    }
    return true;
  };

  return (
    <div className="w-full">
      <label
        htmlFor={registerKey}
        className="mb-1 block text-black font-SolaimanLipi"
      >
        {translate(label)}
      </label>

      <div className="relative w-full">
        <input
          type={type === "number" || type === "phone" ? "number" : type}
          placeholder={translate(placeholder)}
          className={`w-full rounded border-[1.5px] border-stroke bg-white pl-10 pr-2 h-[38px] text-black outline-none text-[14px] transition
                      focus:border-custom-focus active:border-custom-focus
                      disabled:cursor-not-allowed disabled:bg-slate-200
                      ${
                        errors[registerKey]
                          ? "placeholder:text-red-400 border-red-400"
                          : ""
                      }`}
          {...register(registerKey, {
            required: require ? translate("This field is required") : false,
            ...(type === "number" && { validate: validateNumber }),
            ...(type === "phone" && {
              pattern: {
                value: /^\d{11}$/,
                message: translate("Phone number must be exactly 11 digits"),
              },
            }),
          })}
          disabled={disable}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <SvgIcon name={icon} size={20} />
          </div>
        )}
      </div>

      {errors[registerKey] && (
        <p className="text-red-500 text-sm mt-1">
          {translate(errors[registerKey].message)}
        </p>
      )}
    </div>
  );
};

export default LoginInput;
