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
  defaultValue = '',
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

  // Bangla to English digit mapping
  const banglaToEnglishMap = {
    '০': '0',
    '১': '1',
    '২': '2',
    '৩': '3',
    '৪': '4',
    '৫': '5',
    '৬': '6',
    '৭': '7',
    '৮': '8',
    '৯': '9',
  };

  // English to Bangla digit mapping (for display)
  const englishToBanglaMap = {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  };

  const convertToEnglishDigits = (value) => {
    if (!value) return '';
    return value
      .split('')
      .map((char) => banglaToEnglishMap[char] || char)
      .join('');
  };

  const convertToBanglaDisplay = (value) => {
    if (!value) return '';
    return value
      .split('')
      .map((char) => englishToBanglaMap[char] || char)
      .join('');
  };

  // ⭐ প্রথমবার defaultValue বসানো
  useEffect(() => {
    if (
      defaultValue !== undefined &&
      defaultValue !== null &&
      defaultValue !== ''
    ) {
      const convertedValue = convertToEnglishDigits(defaultValue.toString());
      setValue(registerKey, convertedValue, { shouldValidate: false });
    }
  }, [defaultValue, registerKey, setValue]);

  // ⭐ Max length control + only Bangla and English digits
  const handleInput = (e) => {
    let val = e.target.value;
    const allowedChars = /[0-9০১২৩৪৫৬৭৮৯]/g;
    const matches = val.match(allowedChars);

    if (!matches) {
      setValue(registerKey, '', { shouldValidate: true });
      return;
    }

    val = matches.join('');
    if (val.length > maxLength) {
      val = val.slice(0, maxLength);
    }

    const englishDigits = convertToEnglishDigits(val).trim();
    setValue(registerKey, englishDigits, { shouldValidate: true });
  };

  const displayValue = currentValue ? convertToBanglaDisplay(currentValue) : '';

  const getPrefixErrorMessage = () => {
    const banglaPrefixes = allowedPrefixes.map((prefix) =>
      convertToBanglaDisplay(prefix)
    );
    return `নম্বর অবশ্যই (${banglaPrefixes.join(', ')}) দিয়ে শুরু হতে হবে`;
  };

  const validatePrefix = useCallback(
    (value) => {
      if (!value || value.toString().trim() === '') return true;
      const englishDigits = convertToEnglishDigits(value.toString()).trim();
      if (englishDigits.length < 3) return true;
      const prefix = englishDigits.substring(0, 3);
      const isValid = allowedPrefixes.includes(prefix);
      if (!isValid) return getPrefixErrorMessage();
      return true;
    },
    [allowedPrefixes]
  );

  const validateLength = useCallback(
    (value) => {
      if (!value) {
        return require ? 'ফোন নম্বর প্রয়োজন' : true;
      }
      const englishDigits = convertToEnglishDigits(value.toString()).trim();
      if (englishDigits.length < minLength) {
        const banglaMinLength = convertToBanglaDisplay(minLength.toString());
        return `ফোন নম্বর অবশ্যই ${banglaMinLength} ডিজিটের হতে হবে`;
      }
      if (englishDigits.length > maxLength) {
        const banglaMaxLength = convertToBanglaDisplay(maxLength.toString());
        return `ফোন নম্বর ${banglaMaxLength} ডিজিটের বেশি হতে পারবে না`;
      }
      return true;
    },
    [minLength, maxLength, require]
  );

  const shouldShowError =
    showError || isSubmitted || touchedFields[registerKey] || isTouched;
  const hasError = shouldShowError && errors[registerKey];

  const handleKeyPress = (e) => {
    const allowedKeys = /[0-9০১২৩৪৫৬৭৮৯]/;
    if (!allowedKeys.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const allowedChars = /[0-9০১২৩৪৫৬৭৮৯]/g;
    const matches = pastedText.match(allowedChars);
    if (matches) {
      const digits = matches.join('');
      const englishDigits = convertToEnglishDigits(digits).trim();
      const limitedDigits = englishDigits.slice(0, maxLength);
      setValue(registerKey, limitedDigits, { shouldValidate: true });
    }
  };

  const validateDigitsOnly = (value) => {
    if (!value) return true;
    const englishDigits = convertToEnglishDigits(value.toString()).trim();
    return /^\d+$/.test(englishDigits)
      ? true
      : 'শুধুমাত্র সংখ্যাই লিখতে পারবেন';
  };

  return (
    <div
      className={`w-full font-SolaimanLipi ${labelPosition === 'left' ? 'flex items-center gap-4' : ''
        }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`${labelPosition === 'left' ? 'w-2/5 text-end' : 'mb-1 block'
            }`}
        >
          <div
            className={`flex text-sm font-bold items-center gap-1 ${labelPosition === 'left' ? 'justify-end' : ''
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
          value={displayValue}
          onInput={handleInput}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          className={`w-full font-default rounded-lg border text-sm h-11 px-3 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
            ${hasError
              ? 'border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400'
            }
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
          `}
          {...register(registerKey, {
            required: require ? 'ফোন নম্বর প্রয়োজন' : false,
            validate: {
              lengthCheck: validateLength,
              prefixCheck: validatePrefix,
              digitsOnly: validateDigitsOnly,
            },
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

export default PhoneNumberInput;