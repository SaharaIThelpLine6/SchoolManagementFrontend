import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const SingleCheckbox = ({ label, registerKey, dcn="mb-4" }) => {
  const { register } = useFormContext();
  const translate = useTranslate();

  return (
    <div className={dcn}>
      <label className="flex items-center space-x-2 cursor-pointer text-gray-800">
        <input
          type="checkbox"
          {...register(registerKey)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="text-sm font-SolaimanLipi font-medium">
          {translate(label)}
        </span>
      </label>
    </div>
  );
};

export default SingleCheckbox;
