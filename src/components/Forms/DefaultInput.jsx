import React, { useCallback, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";
import { showModal } from "../../utils/ModalControlar";

const DefaultInput = ({
  label,
  type = "text",
  placeholder,
  registerKey,
  codeSetting = false,
  labelColor = "text-black",
  require = false,
  disable = false,
  unicode = false,
  labelPosition = "top", // 'top' or 'left'
  validate, // ✅ নতুন প্রপস
  defaultValue = "", // ✅ নতুন প্রপস
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const handleOpenModal = useCallback(() => {
    showModal("User Code Setting", "CODE_SETTING");
  }, []);

  // ✅ Watch field value
  const currentValue = useWatch({ name: registerKey, control });

  // ✅ প্রথমবারে defaultValue সেট করে দেবে
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      setValue(registerKey, defaultValue, { shouldValidate: true });
    }
  }, [defaultValue, registerKey, setValue]);

  // ✅ Unicode কনভার্সন
  useEffect(() => {
    if (unicode && currentValue) {
      const converted = bnBijoy2Unicode(currentValue);
      if (converted && converted !== currentValue) {
        setValue(registerKey, converted, { shouldValidate: true });
      }
    }
  }, [currentValue, unicode, registerKey, setValue]);

  return (
    <div
      className={`w-full ${
        labelPosition === "left" ? "flex items-center gap-4" : ""
      }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${
            labelPosition === "left"
              ? "w-1/4 min-w-[100px] mb-0 text-end"
              : "mb-1 block"
          }`}
        >
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={labelColor}>{translate(label)}</span>
              {require && <span className="text-red-500">*</span>}
              <span>:</span>
            </div>

            {codeSetting && (
              <span
                className="text-blue-600 underline text-sm font-medium cursor-pointer"
                onClick={handleOpenModal}
              >
                Code Setting
              </span>
            )}
          </div>
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
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
            required: require,
            ...(type === "number" && {
              validate: (value) =>
                isNaN(Number(value)) ? "Please enter a valid number" : true,
            }),
            ...(type === "phone" && {
              pattern: {
                value: /^\d{11}$/,
                message: "Phone number must be exactly 11 digits",
              },
            }),
            ...(validate && { validate }), // ✅ কাস্টম ভ্যালিডেশন এখানে
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
