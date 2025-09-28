import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const Textarea = ({
  label,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  rows = 4,
  labelColor = "text-black",
  labelPosition = "top",
  showError = false,
  defaultValue = "", // নতুন prop
}) => {
  const {
    register,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const translate = useTranslate();
  const [isTouched, setIsTouched] = useState(false);

  // যখন defaultValue prop পরিবর্তন হবে তখন react-hook-form এর state update হবে
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      setValue(registerKey, defaultValue);
    }
  }, [defaultValue, registerKey, setValue]);

  const shouldShowError =
    showError || isSubmitted || touchedFields[registerKey] || isTouched;

  return (
    <div
      className={`w-full ${
        labelPosition === "left" ? "flex items-start gap-4" : ""
      }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`font-SolaimanLipi ${
            labelPosition === "left" ? "text-end mt-1" : "mb-1 block"
          }`}
        >
          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
              <span className={labelColor}>{translate(label)}</span>
              {require && <span className="text-red-500">*</span>}
              <span>:</span>
            </div>
          </div>
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
        <textarea
          placeholder={translate(placeholder)}
          rows={rows}
          className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 py-1 text-black outline-none text-[14px] transition
                      focus:border-custom-focus active:border-custom-focus
                      disabled:cursor-not-allowed disabled:bg-slate-200
                      ${
                        shouldShowError && errors[registerKey]
                          ? "placeholder:text-red-400 border-red-400"
                          : ""
                      }`}
          {...register(registerKey, {
            required: require ? "এই ফিল্ডটি প্রয়োজনীয়" : false,
          })}
          disabled={disable}
          onBlur={() => setIsTouched(true)}
        />

        {shouldShowError && errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Textarea;
