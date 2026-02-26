import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import useTranslate from '../../utils/Translate';

const DefaultSwitch = ({
  label,
  registerKey,
  defaultValue = false,
  require = false,
  labelColor = 'text-black',
  labelPosition = 'top', // 'top' or 'left'
  showError = false,
  isRtl = false,
  disabled = false,
}) => {
  const {
    register,
    setValue,
    control,
    formState: { errors, touchedFields, isSubmitted },
  } = useFormContext();

  const translate = useTranslate();
  const [isTouched, setIsTouched] = useState(false);

  // Watch current value
  const currentValue = useWatch({ name: registerKey, control });

  // Set default value on mount
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      setValue(registerKey, defaultValue, { shouldValidate: false });
    }
  }, [defaultValue, registerKey, setValue]);

  // Show error only if touched or form submitted
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
            labelPosition === 'left' ? 'w-2/5 mb-0 text-end' : 'mb-1 block'
          }`}
        >
          <span className={`flex items-center gap-1 ${labelColor}`}>
            {translate(label)}
            {require && <span className="text-red-500">*</span>}:
          </span>
        </label>
      )}

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            {...register(registerKey, {
              required: require ? 'এই ফিল্ডটি প্রয়োজনীয়' : false,
            })}
            checked={!!currentValue}
            onChange={(e) =>
              setValue(registerKey, e.target.checked, { shouldValidate: true })
            }
            disabled={disabled}
            onBlur={() => setIsTouched(true)}
            className={`sr-only`}
          />
          {/* Track */}
          <div
            className={`w-11 h-6 bg-gray-200 rounded-full peer
                        peer-focus:ring-2 peer-focus:ring-green-300
                        ${currentValue ? 'bg-green-600' : ''}
                        transition-all`}
          />
          {/* Thumb */}
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow
                        transform transition-transform
                        ${currentValue ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </label>

        {shouldShowError && errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultSwitch;
