import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const DefaultRadio = ({
  label,
  options,
  registerKey,
  defaultValue = null,
  labelPosition = "top",
  className = "",
  radioClassName = "",
  labelClassName = "",
  optionLabelClassName = "",
}) => {
  const { setValue, watch, register } = useFormContext();
  const translate = useTranslate();
  const selectedValue = watch(registerKey);

  // ✅ সংশোধিত useEffect
  useEffect(() => {
    // শুধুমাত্র যখন selectedValue undefined/null এবং defaultValue আছে
    if (
      (selectedValue === undefined || selectedValue === null) &&
      defaultValue !== null
    ) {
      setValue(registerKey, defaultValue, { shouldValidate: true });
    }
  }, [defaultValue, registerKey, setValue, selectedValue]);

  const isChecked = (optionId) => {
    return selectedValue != null && Number(selectedValue) === Number(optionId);
  };

  const handleChange = (optionId) => {
    setValue(registerKey, optionId, { shouldValidate: true });
  };

  return (
    <div
      className={`${
        labelPosition === "left" ? "flex items-start gap-4" : "space-y-2"
      } ${className}`}
    >
      {label && (
        <label
          className={`font-medium text-black font-SolaimanLipi ${
            labelPosition === "left"
              ? "w-1/4 min-w-[100px] text-end pt-2"
              : "block"
          } ${labelClassName}`}
        >
          {translate(label)} :
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
        <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center group cursor-pointer"
              onClick={() => handleChange(option.id)}
            >
              <input
                type="radio"
                {...register(registerKey)} // ✅ সরাসরি register ব্যবহার করুন
                value={option.id} // ✅ value prop যোগ করুন
                checked={isChecked(option.id)}
                onChange={(e) => handleChange(Number(e.target.value))} // ✅ onChange handler যোগ করুন
                className={`h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0 ${radioClassName}`}
              />

              <span
                className={`ml-2 text-sm font-SolaimanLipi ${
                  isChecked(option.id) ? "text-black" : "text-gray-700"
                } ${optionLabelClassName}`}
              >
                {translate(option.name)}
              </span>
            </div>
          ))}
        </div>
        {/* ❌ Hidden input remove করুন - এটা conflict create করে */}
      </div>
    </div>
  );
};

export default DefaultRadio;
