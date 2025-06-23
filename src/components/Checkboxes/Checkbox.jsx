import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const Checkbox = ({ label, options, registerKey }) => {
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
    <div className="mb-4">
      <label className="block mb-2 font-medium text-black font-SolaimanLipi">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-2 text-gray-800 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValue === option.id}
              onChange={() => handleChange(option.id)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm font-SolaimanLipi">
              {translate(option.name)}
            </span>
          </label>
        ))}
      </div>

      {/* Hidden input to register the single value */}
      <input type="hidden" {...register(registerKey)} />
    </div>
  );
};

export default Checkbox;
