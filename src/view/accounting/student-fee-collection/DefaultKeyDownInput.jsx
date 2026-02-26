import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import bnBijoy2Unicode from '../../../utils/conveter';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const DefaultKeyDownInput = React.forwardRef(
  (
    {
      label,
      type = 'text',
      placeholder,
      registerKey,
      codeSetting = false,
      labelColor = 'text-black',
      require = false,
      disable = false,
      readOnly = false,
      unicode = false,
      labelPosition = 'top',
      validate,
      defaultValue = '',
      showError = false,
      onKeyDown,
      onChange,
      // ✅ নতুন props যোগ করা হলো
      min,
      max,
      minLength,
      maxLength,
      pattern,
      patternMessage,
      customError,
    },
    ref
  ) => {
    const {
      control,
      setValue,
      formState: { errors, isSubmitted, touchedFields },
    } = useFormContext();

    const translate = useTranslate();
    const [isTouched, setIsTouched] = useState(false);

    const handleOpenModal = useCallback(() => {
      showModal('User Code Setting', 'CODE_SETTING');
    }, []);

    const currentValue = useWatch({ name: registerKey, control });

    // 🔤 Unicode কনভার্সন
    useEffect(() => {
      if (unicode && currentValue) {
        const converted = bnBijoy2Unicode(currentValue);
        if (converted && converted !== currentValue) {
          setValue(registerKey, converted, { shouldValidate: true });
        }
      }
    }, [currentValue, unicode, registerKey, setValue]);

    const shouldShowError =
      showError || isSubmitted || touchedFields[registerKey] || isTouched;

    // ✅ Validation rules তৈরি করা
    const getValidationRules = () => {
      const rules = {
        required: require ? 'এই ফিল্ডটি প্রয়োজনীয়' : false,
      };

      // Number validation
      if (type === 'number' || type === 'phone') {
        rules.validate = (value) => {
          if (isNaN(Number(value))) return 'দয়া করে একটি বৈধ সংখ্যা লিখুন';

          const numValue = Number(value);

          // Min validation
          if (min !== undefined && numValue < min) {
            return `মান ${min} এর কম হতে পারবে না`;
          }

          // Max validation
          if (max !== undefined && numValue > max) {
            return `মান ${max} এর বেশি হতে পারবে না`;
          }

          return true;
        };
      }

      // Phone validation
      if (type === 'phone') {
        rules.pattern = {
          value: /^\d{11}$/,
          message: 'ফোন নম্বর অবশ্যই ১১ ডিজিটের হতে হবে',
        };
      }

      // Text length validation
      if (minLength !== undefined) {
        rules.minLength = {
          value: minLength,
          message: `অক্ষর ${minLength} টির কম হতে পারবে না`,
        };
      }

      if (maxLength !== undefined) {
        rules.maxLength = {
          value: maxLength,
          message: `অক্ষর ${maxLength} টির বেশি হতে পারবে না`,
        };
      }

      // Pattern validation
      if (pattern) {
        rules.pattern = {
          value: pattern,
          message: patternMessage || 'ফরম্যাট সঠিক নয়',
        };
      }

      // Custom validation
      if (validate) {
        rules.validate = validate;
      }

      return rules;
    };

    // ✅ Input attributes তৈরি করা
    const getInputAttributes = () => {
      const attrs = {
        type: type === 'number' || type === 'phone' ? 'number' : 'text',
        placeholder: translate(placeholder),
        disabled: disable,
        readOnly: readOnly,
        onBlur: () => setIsTouched(true),
        onKeyDown: onKeyDown,
      };

      // Number input attributes
      if (type === 'number' || type === 'phone') {
        if (min !== undefined) attrs.min = min;
        if (max !== undefined) attrs.max = max;
      }

      // Text input attributes
      if (type === 'text') {
        if (minLength !== undefined) attrs.minLength = minLength;
        if (maxLength !== undefined) attrs.maxLength = maxLength;
        if (pattern) attrs.pattern = pattern;
      }

      return attrs;
    };

    // ✅ Error message পাওয়া
    const getErrorMessage = () => {
      if (customError) return customError;
      if (errors[registerKey]) return errors[registerKey].message;
      return null;
    };

    const inputAttributes = getInputAttributes();
    const errorMessage = getErrorMessage();

    return (
      <div
        className={`w-full ${
          labelPosition === 'left' ? 'flex items-center gap-4' : ''
        }`}
      >
        {/* 🏷️ Label */}
        {label && (
          <label
            htmlFor={registerKey}
            className={`text-black font-SolaimanLipi ${
              labelPosition === 'left' ? 'w-2/5 mb-0 text-end' : 'mb-1 block'
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                labelPosition === 'left' ? 'justify-end' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className={labelColor}>{translate(label)}</span>
                {require && <span className="text-red-500">*</span>}
                <span>:</span>
              </div>

              {codeSetting && (
                <span
                  className="text-blue-600 underline text-sm font-medium cursor-pointer"
                  onClick={handleOpenModal}
                >
                  Code Setting
                </span>
              )}
            </div>
          </label>
        )}

        {/* 🔢 Input Field */}
        <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
          <Controller
            name={registerKey}
            control={control}
            defaultValue={defaultValue}
            rules={getValidationRules()}
            render={({ field }) => (
              <input
                {...field}
                {...inputAttributes}
                ref={ref}
                className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
                  focus:border-custom-focus active:border-custom-focus
                  disabled:cursor-not-allowed disabled:bg-slate-200
                  read-only:bg-slate-100
                  ${
                    shouldShowError && (errors[registerKey] || customError)
                      ? 'placeholder:text-red-400 border-red-400 bg-red-50'
                      : ''
                  }`}
                onChange={(e) => {
                  let value = e.target.value;

                  // Number type conversion
                  if (type === 'number' || type === 'phone') {
                    value = value === '' ? '' : Number(value) || 0;

                    // Max value restriction
                    if (max !== undefined && value > max) {
                      value = max;
                    }

                    // Min value restriction
                    if (min !== undefined && value < min) {
                      value = min;
                    }
                  }

                  field.onChange(value);
                  setValue(registerKey, value, { shouldValidate: true });

                  if (onChange) onChange(e);
                }}
              />
            )}
          />
          {shouldShowError && errorMessage && (
            <p className="text-red-500 text-sm mt-1">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    );
  }
);

export default DefaultKeyDownInput;
// import React, { useCallback, useEffect, useState } from 'react';
// import { Controller, useFormContext, useWatch } from 'react-hook-form';
// import bnBijoy2Unicode from '../../../utils/conveter';
// import { showModal } from '../../../utils/ModalControlar';
// import useTranslate from '../../../utils/Translate';

// const DefaultKeyDownInput = React.forwardRef(
//   (
//     {
//       label,
//       type = 'text',
//       placeholder,
//       registerKey,
//       codeSetting = false,
//       labelColor = 'text-black',
//       require = false,
//       disable = false,
//       readOnly = false, // ✅ নতুন prop যোগ করা হলো
//       unicode = false,
//       labelPosition = 'top',
//       validate,
//       defaultValue = '',
//       showError = false,
//       onKeyDown,
//       onChange,
//     },
//     ref
//   ) => {
//     const {
//       control,
//       setValue,
//       formState: { errors, isSubmitted, touchedFields },
//     } = useFormContext();

//     const translate = useTranslate();
//     const [isTouched, setIsTouched] = useState(false);

//     const handleOpenModal = useCallback(() => {
//       showModal('User Code Setting', 'CODE_SETTING');
//     }, []);

//     const currentValue = useWatch({ name: registerKey, control });

//     // 🔤 Unicode কনভার্সন
//     useEffect(() => {
//       if (unicode && currentValue) {
//         const converted = bnBijoy2Unicode(currentValue);
//         if (converted && converted !== currentValue) {
//           setValue(registerKey, converted, { shouldValidate: true });
//         }
//       }
//     }, [currentValue, unicode, registerKey, setValue]);

//     const shouldShowError =
//       showError || isSubmitted || touchedFields[registerKey] || isTouched;

//     return (
//       <div
//         className={`w-full ${
//           labelPosition === 'left' ? 'flex items-center gap-4' : ''
//         }`}
//       >
//         {/* 🏷️ Label */}
//         {label && (
//           <label
//             htmlFor={registerKey}
//             className={`text-black font-SolaimanLipi ${
//               labelPosition === 'left' ? 'w-2/5 mb-0 text-end' : 'mb-1 block'
//             }`}
//           >
//             <div
//               className={`flex items-center gap-2 ${
//                 labelPosition === 'left' ? 'justify-end' : 'justify-between'
//               }`}
//             >
//               <div className="flex items-center gap-1">
//                 <span className={labelColor}>{translate(label)}</span>
//                 {require && <span className="text-red-500">*</span>}
//                 <span>:</span>
//               </div>

//               {codeSetting && (
//                 <span
//                   className="text-blue-600 underline text-sm font-medium cursor-pointer"
//                   onClick={handleOpenModal}
//                 >
//                   Code Setting
//                 </span>
//               )}
//             </div>
//           </label>
//         )}

//         {/* 🔢 Input Field */}
//         <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
//           <Controller
//             name={registerKey}
//             control={control}
//             defaultValue={defaultValue}
//             rules={{
//               required: require ? 'এই ফিল্ডটি প্রয়োজনীয়' : false,
//               ...(type === 'number' && {
//                 validate: (value) =>
//                   isNaN(Number(value))
//                     ? 'দয়া করে একটি বৈধ সংখ্যা লিখুন'
//                     : true,
//               }),
//               ...(type === 'phone' && {
//                 pattern: {
//                   value: /^\d{11}$/,
//                   message: 'ফোন নম্বর অবশ্যই ১১ ডিজিটের হতে হবে',
//                 },
//               }),
//               ...(validate && { validate }),
//             }}
//             render={({ field }) => (
//               <input
//                 {...field}
//                 ref={ref}
//                 type={type === 'number' || type === 'phone' ? 'number' : 'text'}
//                 placeholder={translate(placeholder)}
//                 className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
//                   focus:border-custom-focus active:border-custom-focus
//                   disabled:cursor-not-allowed disabled:bg-slate-200
//                   read-only:bg-slate-100
//                   ${
//                     shouldShowError && errors[registerKey]
//                       ? 'placeholder:text-red-400 border-red-400'
//                       : ''
//                   }`}
//                 disabled={disable}
//                 readOnly={readOnly} // ✅ readOnly যোগ করা হলো
//                 onBlur={() => setIsTouched(true)}
//                 onKeyDown={onKeyDown}
//                 onChange={(e) => {
//                   const value =
//                     type === 'number'
//                       ? Number(e.target.value) || 0
//                       : e.target.value;

//                   field.onChange(value);
//                   setValue(registerKey, value, { shouldValidate: true });

//                   if (onChange) onChange(e);
//                 }}
//               />
//             )}
//           />
//           {shouldShowError && errors[registerKey] && (
//             <p className="text-red-500 text-sm mt-1">
//               {errors[registerKey].message}
//             </p>
//           )}
//         </div>
//       </div>
//     );
//   }
// );

// export default DefaultKeyDownInput;
