import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const ExamRoutingCheckbox = ({ label, options, registerKey, labelPosition = "top" }) => {
  const { setValue, watch, register } = useFormContext();
  const translate = useTranslate();

  const selectedValue = watch(registerKey);

  const handleChange = (optionId) => {
    if (selectedValue === optionId) {
      setValue(registerKey, null);
    } else {
      setValue(registerKey, optionId);
    }
  };

  return (
    <div
      className={` ${
        labelPosition === "left" ? "flex items-center gap-4" : "mb-4"
      }`}
    >
      {label && (
        <label
          className={`font-medium text-black font-SolaimanLipi ${
            labelPosition === "left"
              ? "w-1/4 min-w-[100px] text-end pt-2"
              : "block mb-2"
          }`}
        >
          {translate(label)}
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1 w-full" : "w-full"}>
        <div className="flex flex-row gap-3 w-full">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center justify-center gap-3 text-gray-800 cursor-pointer w-full"
            >
              <input
                type="checkbox"
                checked={selectedValue === option.id}
                onChange={() => handleChange(option.id)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-1 flex-shrink-0"
              />
              <span className="text-sm font-SolaimanLipi flex-1 min-w-0 break-words">
                {translate(option.name)}
              </span>
            </label>
          ))}
        </div>

        {/* Hidden input to register the single value */}
        <input type="hidden" {...register(registerKey)} />
      </div>
    </div>
  );
};

export default ExamRoutingCheckbox;