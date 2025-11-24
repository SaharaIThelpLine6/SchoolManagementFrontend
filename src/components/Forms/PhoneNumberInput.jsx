import { useCallback, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useTranslate from '../../utils/Translate';

const PhoneNumberInput = ({
  label,
  registerKey,
  placeholder = 'ফোন নম্বর লিখুন',
  require = false,
  minLength = 11,
  maxLength = 11,
  allowedPrefixes = ['013', '014', '015', '016', '017', '018', '019'],
  labelPosition = 'top',
  labelColor = 'text-black',
  showError = false,
  disable = false,
  readOnly = false,
  defaultValue = '', // ⭐ নতুন যোগ করা হলো
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const translate = useTranslate();
  const [isTouched, setIsTouched] = useState(false);

  // ⭐ Watch input value
  const currentValue = useWatch({ name: registerKey, control });

  // ⭐ প্রথমবার defaultValue বসানো (shouldValidate false)
  useEffect(() => {
    if (
      defaultValue !== undefined &&
      defaultValue !== null &&
      defaultValue !== ''
    ) {
      setValue(registerKey, defaultValue, { shouldValidate: false });
    }
  }, [defaultValue, registerKey, setValue]);

  // ⭐ Max length control + numeric only
  const handleInput = (e) => {
    let val = e.target.value;

    val = val.replace(/\D/g, ''); // only digits

    if (val.length > maxLength) {
      val = val.slice(0, maxLength);
    }

    setValue(registerKey, val, { shouldValidate: true });
  };

  // ⭐ Prefix validation
  const validatePrefix = useCallback(
    (value) => {
      if (!value) return true;

      const prefix = value.toString().substring(0, 3);

      return allowedPrefixes.includes(prefix)
        ? true
        : `নম্বর অবশ্যই (${allowedPrefixes.join(', ')}) দিয়ে শুরু হতে হবে`;
    },
    [allowedPrefixes]
  );

  // ⭐ Error কখন দেখাবে
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
          className={`font-SolaimanLipi ${
            labelPosition === 'left' ? 'w-2/5 text-end' : 'mb-1 block'
          }`}
        >
          <div
            className={`flex items-center gap-1 ${
              labelPosition === 'left' ? 'justify-end' : ''
            }`}
          >
            <span className={labelColor}>{translate(label)}</span>
            {require && <span className="text-red-500">*</span>}
            <span>:</span>
          </div>
        </label>
      )}

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <input
          type="text"
          placeholder={translate(placeholder)}
          value={currentValue || ''}
          onInput={handleInput}
          className={`w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition
            focus:border-custom-focus active:border-custom-focus
            disabled:cursor-not-allowed disabled:bg-slate-200
            ${
              shouldShowError && errors[registerKey]
                ? 'border-red-400 placeholder:text-red-400'
                : ''
            }`}
          {...register(registerKey, {
            required: require ? 'ফোন নম্বর প্রয়োজন' : false,
            minLength: {
              value: minLength,
              message: `ফোন নম্বর অবশ্যই ${minLength} ডিজিটের হতে হবে`,
            },
            maxLength: {
              value: maxLength,
              message: `ফোন নম্বর ${maxLength} ডিজিটের বেশি হতে পারবে না`,
            },
            validate: validatePrefix,
            pattern: {
              value: /^[0-9]+$/,
              message: 'শুধুমাত্র সংখ্যাই লিখতে পারবেন',
            },
          })}
          disabled={disable}
          readOnly={readOnly}
          onBlur={() => setIsTouched(true)}
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

export default PhoneNumberInput;
