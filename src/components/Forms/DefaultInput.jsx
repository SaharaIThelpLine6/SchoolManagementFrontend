import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const DefaultInput = ({
  label,
  type,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  labelPosition = "top", // 'top' or 'left'
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const validateNumber = (value) => {
    return type === "number" && isNaN(Number(value))
      ? "Please enter a valid number"
      : true;
  };

  return (
    <div className={`w-full ${labelPosition === 'left' ? 'flex items-center gap-4' : ''}`}>
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${
            labelPosition === 'left' 
              ? 'w-1/4 min-w-[100px] mb-0 text-end' 
              : 'mb-1 block'
          }`}
        >
          {translate(label)}
        </label>
      )}

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <input
          type={type === "number" || type === "phone" ? "number" : type}
          placeholder={translate(placeholder)}
          className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
                      focus:border-custom-focus active:border-custom-focus
                      disabled:cursor-not-allowed disabled:bg-slate-200
                      ${
                        errors[registerKey]
                          ? "placeholder:text-red-400 border-red-400"
                          : ""
                      }`}
          {...register(registerKey, {
            required: require ? require : false,
            ...(type === "number" && { validate: validateNumber }),
            ...(type === "phone" && {
              pattern: {
                value: /^\d{11}$/,
                message: "Phone number must be exactly 11 digits",
              },
            }),
          })}
          disabled={disable}
        />

        {errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultInput;
