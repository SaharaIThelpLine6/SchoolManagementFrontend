import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const Textarea = ({
  label,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  rows = 4,
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  return (
    <div className="w-full">
      <label
        htmlFor={registerKey}
        className="mb-1 block text-black font-SolaimanLipi"
      >
        {translate(label)}
      </label>

      <textarea
        placeholder={translate(placeholder)}
        rows={rows}
        className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 py-1 text-black outline-none text-[14px] transition
                    focus:border-custom-focus active:border-custom-focus
                    disabled:cursor-not-allowed disabled:bg-slate-200
                    ${
                      errors[registerKey]
                        ? "placeholder:text-red-400 border-red-400"
                        : ""
                    }`}
        {...register(registerKey, {
          required: require ? require : false,
        })}
        disabled={disable}
      />

      {errors[registerKey] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[registerKey].message}
        </p>
      )}
    </div>
  );
};

export default Textarea;