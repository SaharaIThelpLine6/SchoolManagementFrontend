import React, { useEffect, useState, useCallback } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import bnBijoy2Unicode from "../../../utils/conveter";
import { showModal } from "../../../utils/ModalControlar";

const DefaultKeyDownInput = React.forwardRef(
  (
    {
      label,
      type = "text",
      placeholder,
      registerKey,
      codeSetting = false,
      labelColor = "text-black",
      require = false,
      disable = false,
      unicode = false,
      labelPosition = "top",
      validate,
      defaultValue = "",
      showError = false,
      onKeyDown,
    },
    ref
  ) => {
    const {
      control,
      setValue,
      formState: { errors, isSubmitted, touchedFields },
    } = useFormContext();
    const translate = useTranslate();
    const [isTouched, setIsTouched] = useState(false);

    const handleOpenModal = useCallback(() => {
      showModal("User Code Setting", "CODE_SETTING");
    }, []);

    const currentValue = useWatch({ name: registerKey, control });

    useEffect(() => {
      if (unicode && currentValue) {
        const converted = bnBijoy2Unicode(currentValue);
        if (converted && converted !== currentValue) {
          setValue(registerKey, converted, { shouldValidate: true });
        }
      }
    }, [currentValue, unicode, registerKey, setValue]);

    const shouldShowError =
      showError || isSubmitted || touchedFields[registerKey] || isTouched;

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
              labelPosition === "left" ? "w-2/5 mb-0 text-end" : "mb-1 block"
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                labelPosition === "left" ? "justify-end" : "justify-between"
              }`}
            >
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
          <Controller
            name={registerKey}
            control={control}
            defaultValue={defaultValue}
            rules={{
              required: require ? "এই ফিল্ডটি প্রয়োজনীয়" : false,
              ...(type === "number" && {
                validate: (value) =>
                  isNaN(Number(value))
                    ? "দয়া করে একটি বৈধ সংখ্যা লিখুন"
                    : true,
              }),
              ...(type === "phone" && {
                pattern: {
                  value: /^\d{11}$/,
                  message: "ফোন নম্বর অবশ্যই ১১ ডিজিটের হতে হবে",
                },
              }),
              ...(validate && { validate }),
            }}
            render={({ field }) => (
              <input
                {...field}
                ref={ref}
                type={type === "number" || type === "phone" ? "number" : "text"}
                placeholder={translate(placeholder)}
                className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
                  focus:border-custom-focus active:border-custom-focus
                  disabled:cursor-not-allowed disabled:bg-slate-200
                  ${
                    shouldShowError && errors[registerKey]
                      ? "placeholder:text-red-400 border-red-400"
                      : ""
                  }`}
                disabled={disable}
                onBlur={() => setIsTouched(true)}
                onKeyDown={onKeyDown}
                onChange={(e) => {
                  const value =
                    type === "number"
                      ? Number(e.target.value) || 0
                      : e.target.value;
                  field.onChange(value);
                  setValue(registerKey, value, { shouldValidate: true });
                }}
              />
            )}
          />
          {shouldShowError && errors[registerKey] && (
            <p className="text-red-500 text-sm mt-1">
              {errors[registerKey].message}
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default DefaultKeyDownInput;
