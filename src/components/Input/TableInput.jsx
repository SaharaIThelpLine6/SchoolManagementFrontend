import React, { useRef, useState, useEffect } from "react";
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
  saveStatus = "idle",
  onKeyDown = undefined,
  ...rest   // ← এটা যোগ হয়েছে: data-row, data-col সহ যেকোনো extra prop ধরবে
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();
  const firstMouseClick = useRef(false);
  const [hasChanged, setHasChanged] = useState(false);
  const currentValue = useWatch({ name: registerKey, control });

  useEffect(() => {
    if (unicode && currentValue && typeof currentValue === "string") {
      const converted = bnBijoy2Unicode(currentValue);
      if (converted !== currentValue) {
        setValue(registerKey, converted);
      }
    }

    if (currentValue !== undefined) {
      const isChanged =
        type === "number"
          ? Number(currentValue) !== Number(defaultValue)
          : currentValue !== defaultValue;
      setHasChanged(isChanged);
    }
  }, [currentValue, defaultValue, registerKey, setValue, type, unicode]);

  const handleChange = (e) => {
    const isNumericInput = type === "number" || type === "phone";
    const value = isNumericInput
      ? e.target.value.replace(type === "number" ? /[^0-9.]/g : /[^0-9]/g, "")
      : e.target.value;

    if (isNumericInput) {
      e.target.value = value;
      setValue(registerKey, value, { shouldValidate: true, shouldDirty: true });
    }

    const isChanged =
      type === "number"
        ? Number(value) !== Number(defaultValue)
        : value !== defaultValue;
    setHasChanged(isChanged);
  };

  const handleKeyDown = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented || (type !== "number" && type !== "phone")) {
      return;
    }

    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ];
    const isDecimalPoint = type === "number" && event.key === ".";

    if (
      !/^[0-9]$/.test(event.key) &&
      !allowedKeys.includes(event.key) &&
      !isDecimalPoint &&
      !(event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();
    }
  };

  const selectInputValue = (event) => {
    event.currentTarget.select();
  };

  const handleMouseDown = (event) => {
    firstMouseClick.current = document.activeElement !== event.currentTarget;
  };

  const keepInputValueSelected = (event) => {
    if (firstMouseClick.current) {
      event.preventDefault();
      event.currentTarget.select();
    }
    firstMouseClick.current = false;
  };

  return (
    <div
      className={`w-full bg-transparent ${labelPosition === "left" ? "flex items-center gap-4" : ""
        }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${labelPosition === "left"
            ? "w-1/4 min-w-[100px] mb-0 text-end"
            : "mb-1 block"
            }`}
        >
          {translate(label)}
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
        <input
          type={type === "number" || type === "phone" ? "text" : type}
          inputMode={type === "number" || type === "phone" ? "numeric" : undefined}
          placeholder={translate(placeholder)}
          className={`w-full rounded px-2 h-[38px] outline-none text-[14px] transition
            ${saveStatus === "failed"
              ? "bg-red-100 border-red-300"
              : hasChanged
                ? "bg-green-100 border-green-300"
                : "bg-white border-gray-300"}
            ${errors[registerKey] ? "border-red-400 placeholder:text-red-400" : "border"}
            ${saveStatus === "failed"
              ? "focus:ring-red-200 focus:border-red-500"
              : "focus:ring-2 focus:ring-green-200 focus:border-green-500"}
            disabled:cursor-not-allowed disabled:bg-slate-200`}
          {...register(registerKey, {
            required: require && "This field is required",
            ...(type === "number" && {
              min: { value: min, message: `Minimum value is ${min}` },
              max: { value: max, message: `Maximum value is ${max}` },
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
          onKeyDown={handleKeyDown}
          {...rest}  // ← data-row, data-col এখানে input-এ বসবে
          onFocus={selectInputValue}
          onMouseDown={handleMouseDown}
          onMouseUp={keepInputValueSelected}
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
// import React, { useState, useEffect } from "react";
// import { useFormContext, useWatch } from "react-hook-form";
// import useTranslate from "../../utils/Translate";
// import bnBijoy2Unicode from "../../utils/conveter";

// const TableInput = ({
//   label,
//   type = "text",
//   placeholder,
//   registerKey,
//   require = false,
//   disable = false,
//   unicode = false,
//   labelPosition = "top",
//   defaultValue,
//   min,
//   max,
//   onKeyDown = undefined
// }) => {
//   const {
//     register,
//     setValue,
//     control,
//     formState: { errors },
//   } = useFormContext();
//   const translate = useTranslate();
//   const [hasChanged, setHasChanged] = useState(false);
//   const currentValue = useWatch({ name: registerKey, control });

//   // Handle Unicode conversion and change detection
//   useEffect(() => {
//     if (unicode && currentValue && typeof currentValue === "string") {
//       const converted = bnBijoy2Unicode(currentValue);
//       if (converted !== currentValue) {
//         setValue(registerKey, converted);
//       }
//     }

//     // Detect if value has changed from default
//     if (currentValue !== undefined) {
//       const isChanged = type === "number"
//         ? Number(currentValue) !== Number(defaultValue)
//         : currentValue !== defaultValue;
//       setHasChanged(isChanged);
//     }
//   }, [currentValue, defaultValue, registerKey, setValue, type, unicode]);

//   const handleChange = (e) => {
//     const value = e.target.value;
//     const isChanged = type === "number"
//       ? Number(value) !== Number(defaultValue)
//       : value !== defaultValue;
//     setHasChanged(isChanged);
//   };

//   return (
//     <div
//       className={`w-full bg-transparent ${
//         labelPosition === "left" ? "flex items-center gap-4" : ""
//       }`}
//     >
//       {label && (
//         <label
//           htmlFor={registerKey}
//           className={`text-black font-SolaimanLipi ${
//             labelPosition === "left"
//               ? "w-1/4 min-w-[100px] mb-0 text-end"
//               : "mb-1 block"
//           }`}
//         >
//           {translate(label)}
//         </label>
//       )}

//       <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
//         <input
//           type={type === "number" || type === "phone" ? "number" : type}
//           placeholder={translate(placeholder)}
//           className={`w-full rounded px-2 h-[38px] outline-none text-[14px] transition
//                     ${
//                       hasChanged
//                         ? "bg-green-100 border-green-300"
//                         : "bg-white border-gray-300"
//                     }
//                     ${
//                       errors[registerKey]
//                         ? "border-red-400 placeholder:text-red-400"
//                         : "border"
//                     }
//                     focus:ring-2 focus:ring-green-200 focus:border-green-500
//                     disabled:cursor-not-allowed disabled:bg-slate-200`}
//           {...register(registerKey, {
//             required: require && "This field is required",
//             ...(type === "number" && {
//               min: {
//                 value: min,
//                 message: `Minimum value is ${min}`,
//               },
//               max: {
//                 value: max,
//                 message: `Maximum value is ${max}`,
//               },
//               validate: (value) =>
//                 isNaN(Number(value)) ? "Please enter a valid number" : true,
//             }),
//             ...(type === "phone" && {
//               pattern: {
//                 value: /^\d{11}$/,
//                 message: "Phone number must be exactly 11 digits",
//               },
//             }),
//           })}
//           defaultValue={defaultValue}
//           disabled={disable}
//           min={min}
//           max={max}
//           onChange={handleChange}
//           onKeyDown={onKeyDown}
//         />

//         {errors[registerKey] && (
//           <p className="text-red-500 text-sm mt-1">
//             {errors[registerKey].message}
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TableInput;