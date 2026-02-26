import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const TableInput = ({
  label,
  type = "text",
  placeholder,
  registerKey,
  require = false,
  disable = false,
  unicode = false,
  labelPosition = "top",
  defaultValue,
  min,
  max,
  onKeyDown = undefined
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();
  const [hasChanged, setHasChanged] = useState(false);
  const currentValue = useWatch({ name: registerKey, control });

  // Handle Unicode conversion and change detection
  useEffect(() => {
    if (unicode && currentValue && typeof currentValue === "string") {
      const converted = bnBijoy2Unicode(currentValue);
      if (converted !== currentValue) {
        setValue(registerKey, converted);
      }
    }

    // Detect if value has changed from default
    if (currentValue !== undefined) {
      const isChanged = type === "number"
        ? Number(currentValue) !== Number(defaultValue)
        : currentValue !== defaultValue;
      setHasChanged(isChanged);
    }
  }, [currentValue, defaultValue, registerKey, setValue, type, unicode]);

  const handleChange = (e) => {
    const value = e.target.value;
    const isChanged = type === "number"
      ? Number(value) !== Number(defaultValue)
      : value !== defaultValue;
    setHasChanged(isChanged);
  };

  return (
    <div
      className={`w-full bg-transparent ${
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
          {translate(label)}
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
        <input
          type={type === "number" || type === "phone" ? "number" : type}
          placeholder={translate(placeholder)}
          className={`w-full rounded px-2 h-[38px] outline-none text-[14px] transition
                    ${
                      hasChanged
                        ? "bg-green-100 border-green-300"
                        : "bg-white border-gray-300"
                    }
                    ${
                      errors[registerKey]
                        ? "border-red-400 placeholder:text-red-400"
                        : "border"
                    }
                    focus:ring-2 focus:ring-green-200 focus:border-green-500
                    disabled:cursor-not-allowed disabled:bg-slate-200`}
          {...register(registerKey, {
            required: require && "This field is required",
            ...(type === "number" && {
              min: {
                value: min,
                message: `Minimum value is ${min}`,
              },
              max: {
                value: max,
                message: `Maximum value is ${max}`,
              },
              validate: (value) =>
                isNaN(Number(value)) ? "Please enter a valid number" : true,
            }),
            ...(type === "phone" && {
              pattern: {
                value: /^\d{11}$/,
                message: "Phone number must be exactly 11 digits",
              },
            }),
          })}
          defaultValue={defaultValue}
          disabled={disable}
          min={min}
          max={max}
          onChange={handleChange}
          onKeyDown={onKeyDown}
        />

        {errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default TableInput;