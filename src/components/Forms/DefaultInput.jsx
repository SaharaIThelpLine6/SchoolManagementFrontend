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
  labelColor = 'text-black',
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

  return (
    <div
      className={`w-full ${
        labelPosition === 'left' ? 'flex items-center gap-4' : ''
      }`}
    >
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

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <input
          type={type === 'number' || type === 'phone' ? 'number' : type}
          placeholder={translate(placeholder)}
          className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
                      focus:border-custom-focus active:border-custom-focus
                      disabled:cursor-not-allowed disabled:bg-slate-200
                      ${
                        shouldShowError && errors[registerKey]
                          ? 'placeholder:text-red-400 border-red-400'
                          : ''
                      } ${isRtl ? 'direction-rtl' : ''}`}
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
          onBlur={() => setIsTouched(true)} // ইউজার যখন ফিল্ড থেকে বের হয় তখন touched সেট হয়
        />

        {shouldShowError && errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultInput;
