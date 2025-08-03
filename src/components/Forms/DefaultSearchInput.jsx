import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FiSearch, FiX } from "react-icons/fi";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const DefaultSearchInput = ({
  label,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  unicode = false,
  labelPosition = "top", // 'top' or 'left'
}) => {
  const {
    register,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const currentValue = useWatch({ name: registerKey, control });

  useEffect(() => {
    if (unicode && currentValue && typeof currentValue === "string") {
      const converted = bnBijoy2Unicode(currentValue);
      if (converted !== currentValue) {
        setValue(registerKey, converted);
      }
    }
  }, []); // Only run on mount

  const handleClear = () => {
    setValue(registerKey, "");
  };

  return (
    <div className={`w-full ${labelPosition === "left" ? "flex items-center gap-4" : ""}`}>
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${
            labelPosition === "left"
              ? "w-1/4 min-w-[100px] mb-0 text-end"
              : "mb-1 block"
          }`}
        >
          {translate(label)}
        </label>
      )}

      <div className={`${labelPosition === "left" ? "flex-1" : "w-full"}`}>
        <div className="relative w-full">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder={translate(placeholder)}
            className={`w-full pl-8 pr-8 rounded border-[1.5px] border-stroke bg-white h-[38px] text-black text-[14px] outline-none transition
              focus:border-custom-focus active:border-custom-focus
              disabled:cursor-not-allowed disabled:bg-slate-200
              ${
                errors[registerKey]
                  ? "placeholder:text-red-400 border-red-400"
                  : ""
              }`}
            {...register(registerKey, {
              required: require,
            })}
            disabled={disable}
          />
          {currentValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              <FiX />
            </button>
          )}
        </div>

        {errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultSearchInput;
