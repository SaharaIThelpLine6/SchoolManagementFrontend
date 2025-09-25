import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const DefaultSelect = ({
  label,
  type,
  options,
  registerKey,
  require,
  valueField,
  nameField,
  labelColor = "text-black",
  disabled,
  unicode = false,
  labelPosition = "top",
  onChange,
  defaultValue = "Select",
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle select change
  const handleChange = (e) => {
    const selectedValue =
      type === "number" ? parseInt(e.target.value) : e.target.value;

    // Update form value
    setValue(registerKey, selectedValue);

    // Call external onChange if provided
    if (onChange) {
      const selectedOption = options.find(
        (opt) => String(opt[valueField]) === String(e.target.value)
      );
      onChange(selectedOption);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById(`${registerKey}-dropdown`);
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [registerKey]);

  return (
    <div
      className={`w-full ${
        labelPosition === "left" ? "flex items-center gap-4" : ""
      }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`font-SolaimanLipi ${
            labelPosition === "left"
              ? "text-black"
              : "mb-1 block text-black"
          }`}
        >
          <div className="flex items-center gap-1">
            <span className={labelColor}>{translate(label)}</span>
            {require && <span className="text-red-500">*</span>}
            <span>:</span>
          </div>
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : ""}>
        <div
          id={`${registerKey}-dropdown`}
          className="relative z-20 bg-transparent"
        >
          <select
            name={registerKey}
            {...register(registerKey, {
              required: require,
              valueAsNumber: type === "number",
            })}
            onClick={toggleDropdown}
            onChange={handleChange} // Add onChange handler
            defaultValue=""
            className={`relative h-[38px] z-20 w-full appearance-none font-SolaimanLipi rounded border border-stroke bg-white py-1 px-4 outline-none transition
              focus:border-custom-focus active:border-custom-focus
              ${disabled ? "cursor-not-allowed disabled:bg-slate-200" : ""}`}
            disabled={disabled}
          >
            <option value="" className="text-body">
              {translate(defaultValue)}
            </option>
            {options &&
              options.map((option) => (
                <option
                  key={option[valueField]}
                  value={option[valueField]}
                  className="text-body"
                >
                  {unicode
                    ? bnBijoy2Unicode(option[nameField])
                    : option[nameField]}
                </option>
              ))}
          </select>

          <span
            className={`absolute pointer-events-none transform transition-transform duration-300 top-1/2 right-4 z-30 -translate-y-1/2 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            {/* Chevron icon */}
          </span>
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

export default DefaultSelect;
