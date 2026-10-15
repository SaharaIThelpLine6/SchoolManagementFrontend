import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

/* ---------- Chevron — select এর ডান দিকের ছোট তীর ---------- */
const ChevronDown = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/* ============================================================
   মূল DefaultSelect কম্পোনেন্ট
   ============================================================ */

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
  readOnly = false,
  unicode = false,
  labelPosition = "top",
  onChange,
  defaultValue = "Select",
  hidePlaceholder = false,
  initialValue,
  icon,
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

  const handleChange = (e) => {
    const selectedValue =
      type === "number" ? parseInt(e.target.value) : e.target.value;

    setValue(registerKey, selectedValue);

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

  const hasError = errors[registerKey];

  // initialValue দেওয়া থাকলে সেটাই ডিফল্টে সিলেক্ট হয়ে থাকবে।
  // options.length ডিপেন্ডেন্সিতে আছে কারণ অপশনগুলো দেরিতে (API থেকে)
  // এলে তবেই সঠিক মানটা বসানো সম্ভব — তখন আবার effect চলবে।
  useEffect(() => {
    if (initialValue === undefined || initialValue === null || initialValue === "") {
      return;
    }
    const hasMatch = (options || []).some(
      (opt) => String(opt[valueField]) === String(initialValue)
    );
    if (hasMatch) {
      setValue(registerKey, initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, registerKey, options?.length, valueField]);

  return (
    <div
      className={` font-SolaimanLipi w-full ${
        labelPosition === "left" ? "flex items-center gap-4" : ""
      }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`font-bold text-sm ${
            labelPosition === "left" ? "text-black" : "mb-1 block text-black"
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
          {icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-30 text-gray-400">
              {icon}
            </div>
          )}

          <select
            name={registerKey}
            {...register(registerKey, {
              required: require,
              valueAsNumber: type === "number",
            })}
            onClick={readOnly ? (event) => event.preventDefault() : toggleDropdown}
            onChange={readOnly ? (event) => event.preventDefault() : handleChange}
            onMouseDown={readOnly ? (event) => event.preventDefault() : undefined}
            onKeyDown={readOnly ? (event) => event.preventDefault() : undefined}
            defaultValue={initialValue ?? ""}
            disabled={disabled}
            aria-readonly={readOnly}
            className={`relative z-20 w-full appearance-none font-default rounded-lg border text-sm h-11 ${
              icon ? "pl-10" : "pl-3"
            } pr-10 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
              ${
                hasError
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
              }
              disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
            `}
          >
            {/* hidePlaceholder=true হলে "নির্বাচন করুন" option টা দেখাবে না */}
            {!hidePlaceholder && (
              <option value="" className="text-body">
                {translate(defaultValue)}
              </option>
            )}
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

          <span className="pointer-events-none absolute top-1/2 right-4 z-30 -translate-y-1/2 text-gray-500">
            <ChevronDown open={isOpen} />
          </span>
        </div>

        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultSelect;





















// import React, { useState, useEffect } from "react";
// import { useFormContext } from "react-hook-form";
// import useTranslate from "../../utils/Translate";
// import bnBijoy2Unicode from "../../utils/conveter";

// const DefaultSelect = ({
//   label,
//   type,
//   options,
//   registerKey,
//   require,
//   valueField,
//   nameField,
//   labelColor = "text-black",
//   disabled,
//   readOnly = false,
//   unicode = false,
//   labelPosition = "top",
//   onChange,
//   defaultValue = "Select",
// }) => {
//   const {
//     register,
//     formState: { errors },
//     setValue,
//   } = useFormContext();

//   const translate = useTranslate();
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleDropdown = () => {
//     if (!disabled) {
//       setIsOpen(!isOpen);
//     }
//   };

//   const handleChange = (e) => {
//     const selectedValue =
//       type === "number" ? parseInt(e.target.value) : e.target.value;

//     setValue(registerKey, selectedValue);

//     if (onChange) {
//       const selectedOption = options.find(
//         (opt) => String(opt[valueField]) === String(e.target.value)
//       );
//       onChange(selectedOption);
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const dropdown = document.getElementById(`${registerKey}-dropdown`);
//       if (dropdown && !dropdown.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [registerKey]);

//   const hasError = errors[registerKey];

//   return (
//     <div
//       className={` font-SolaimanLipi w-full ${labelPosition === "left" ? "flex items-center gap-4" : ""
//         }`}
//     >
//       {label && (
//         <label
//           htmlFor={registerKey}
//           className={`font-bold text-sm ${labelPosition === "left"
//             ? "text-black"
//             : "mb-1 block text-black"
//             }`}
//         >
//           <div className="flex items-center gap-1">
//             <span className={labelColor}>{translate(label)}</span>
//             {require && <span className="text-red-500">*</span>}
//             <span>:</span>
//           </div>
//         </label>
//       )}

//       <div className={labelPosition === "left" ? "flex-1" : ""}>
//         <div
//           id={`${registerKey}-dropdown`}
//           className="relative z-20 bg-transparent"
//         >
//           <select
//             name={registerKey}
//             {...register(registerKey, {
//               required: require,
//               valueAsNumber: type === "number",
//             })}
//             onClick={readOnly ? (event) => event.preventDefault() : toggleDropdown}
//             onChange={readOnly ? (event) => event.preventDefault() : handleChange}
//             onMouseDown={readOnly ? (event) => event.preventDefault() : undefined}
//             onKeyDown={readOnly ? (event) => event.preventDefault() : undefined}
//             defaultValue=""
//             disabled={disabled}
//             aria-readonly={readOnly}
//             className={`relative z-20 w-full appearance-none font-default rounded-lg border text-sm h-11 px-3 pr-10 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
//               ${hasError
//                 ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
//                 : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
//               }
//               disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
//             `}
//           >
//             <option value="" className="text-body">
//               {translate(defaultValue)}
//             </option>
//             {options &&
//               options.map((option) => (
//                 <option
//                   key={option[valueField]}
//                   value={option[valueField]}
//                   className="text-body"
//                 >
//                   {unicode
//                     ? bnBijoy2Unicode(option[nameField])
//                     : option[nameField]}
//                 </option>
//               ))}
//           </select>

//           <span
//             className={`absolute pointer-events-none transform transition-transform duration-300 top-1/2 right-4 z-30 -translate-y-1/2 ${isOpen ? "rotate-180" : "rotate-0"
//               }`}
//           >
//             {/* Chevron icon */}
//           </span>
//         </div>

//         {hasError && (
//           <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
//             {errors[registerKey].message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DefaultSelect;
