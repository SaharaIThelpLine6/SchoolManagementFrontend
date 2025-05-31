import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const Checkbox = ({ label, options, registerKey }) => {
  const { register } = useFormContext();
  const translate = useTranslate();

  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-gray-700 font-SolaimanLipi">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-2 text-gray-800"
          >
            <input
              type="checkbox"
              value={option.id}
              {...register(`${registerKey}`)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm font-SolaimanLipi">
              {translate(option.name)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Checkbox;
