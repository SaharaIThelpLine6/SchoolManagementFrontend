import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import bnBijoy2Unicode from '../../utils/conveter';
import { showModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const DefaultInput = ({
  label,
  type = 'text',
  placeholder,
  registerKey,
  codeSetting = false,
  labelColor = 'text-gray-700', // Updated default label color to match Image 2
  require = false,
  disable = false,
  readOnly = false,
  unicode = false,
  labelPosition = 'top',
  validate,
  defaultValue = '',
  showError = false,
  isRtl = false,
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();
  const translate = useTranslate();
  const [isTouched, setIsTouched] = useState(false);

  const handleOpenModal = useCallback(() => {
    showModal('User Code Setting', 'CODE_SETTING');
  }, []);

  // ✅ Watch field value
  const currentValue = useWatch({ name: registerKey, control });

  // ✅ প্রথমবারে defaultValue সেট করে দেবে
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      setValue(registerKey, defaultValue, { shouldValidate: false });
    }
  }, [defaultValue, registerKey, setValue]);

  // ✅ Unicode কনভার্সন
  useEffect(() => {
    if (unicode && currentValue) {
      const converted = bnBijoy2Unicode(currentValue);
      if (converted && converted !== currentValue) {
        setValue(registerKey, converted, { shouldValidate: true });
      }
    }
  }, [currentValue, unicode, registerKey, setValue]);

  // শুধুমাত্র যখন ফিল্ড touched হয়েছে অথবা form submit করা হয়েছে তখন error show করবে
  const shouldShowError =
    showError || isSubmitted || touchedFields[registerKey] || isTouched;

  const hasError = shouldShowError && errors[registerKey];

  return (
    <div
      className={`w-full ${labelPosition === 'left' ? 'flex items-center gap-4' : ''
        }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`font-bold text-sm ${labelPosition === 'left' ? 'w-2/5 mb-0 text-end' : 'mb-1.5 block'
            }`}
        >
          <div
            className={`flex items-center gap-2 ${labelPosition === 'left' ? 'justify-end' : 'justify-between'
              }`}
          >
            <div className="flex items-center gap-1">
              <span className={labelColor}>{translate(label)}</span>
              {require && <span className="text-red-500">*</span>}
              <span>:</span>
            </div>

            {codeSetting && (
              <span
                className="text-blue-600 hover:text-blue-700 underline text-xs font-semibold cursor-pointer transition-colors"
                onClick={handleOpenModal}
              >
                Code Setting
              </span>
            )}
          </div>
        </label>
      )}

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <input
          type={type === 'number' || type === 'phone' ? 'number' : type}
          placeholder={translate(placeholder)}
          // Updated className for smooth, modern focus effect matching Image 2
          className={`w-full font-default rounded-lg border text-sm h-11 px-3 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
            ${hasError
              ? 'border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400'
            }
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
            ${isRtl ? 'direction-rtl' : ''}
          `}
          {...register(registerKey, {
            required: require ? 'এই ফিল্ডটি প্রয়োজনীয়' : false,
            ...(type === 'number' && {
              validate: (value) =>
                isNaN(Number(value)) ? 'দয়া করে একটি বৈধ সংখ্যা লিখুন' : true,
            }),
            ...(type === 'phone' && {
              pattern: {
                value: /^\d{11}$/,
                message: 'ফোন নম্বর অবশ্যই ১১ ডিজিটের হতে হবে',
              },
            }),
            ...(validate && { validate }),
          })}
          disabled={disable}
          readOnly={readOnly}
          onBlur={() => setIsTouched(true)}
        />

        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultInput;