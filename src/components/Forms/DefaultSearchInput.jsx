import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";
import SvgIcon from "../icons/SvgIcon";

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
          {translate(label)} :
        </label>
      )}

      <div className={`${labelPosition === "left" ? "flex-1" : "w-full"}`}>
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
              className="text-sm"
            >
              <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></path>
            </svg>
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
              <SvgIcon name={"FiX"} size={14} />
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
