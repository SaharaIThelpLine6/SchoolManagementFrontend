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

  // Convert Bangla digits to English for storage and validation
  const convertToEnglishDigits = (value) => {
    if (!value) return '';

    return value
      .split('')
      .map((char) => banglaToEnglishMap[char] || char)
      .join('');
  };

  // Convert English digits to Bangla for display
  const convertToBanglaDisplay = (value) => {
    if (!value) return '';

    return value
      .split('')
      .map((char) => englishToBanglaMap[char] || char)
      .join('');
  };

  // ⭐ প্রথমবার defaultValue বসানো (shouldValidate false)
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

    // শুধুমাত্র English (0-9) এবং Bangla (০-৯) ডিজিট allow করবে
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

    // Store as English digits and trim
    const englishDigits = convertToEnglishDigits(val).trim();
    setValue(registerKey, englishDigits, { shouldValidate: true });
  };

  // Display value in Bangla digits
  const displayValue = currentValue ? convertToBanglaDisplay(currentValue) : '';

  // Helper function to generate consistent prefix error message with Bangla digits
  const getPrefixErrorMessage = () => {
    const banglaPrefixes = allowedPrefixes.map((prefix) =>
      convertToBanglaDisplay(prefix)
    );
    return `নম্বর অবশ্যই (${banglaPrefixes.join(', ')}) দিয়ে শুরু হতে হবে`;
  };

  // ⭐ Prefix validation (English digits এ check করবে) - UPDATED
  const validatePrefix = useCallback(
    (value) => {
      if (!value || value.toString().trim() === '') return true;

      // Convert to English digits for validation and trim
      const englishDigits = convertToEnglishDigits(value.toString()).trim();

      // যদি length কম থাকে, তাহলে prefix check করব না
      // length validation ওটা handle করবে
      if (englishDigits.length < 3) {
        return true; // Let length validation handle this
      }

      // Extract first 3 digits
      const prefix = englishDigits.substring(0, 3);

      // Check against allowed prefixes
      const isValid = allowedPrefixes.includes(prefix);

      if (!isValid) {
        return getPrefixErrorMessage();
      }

      return true;
    },
    [allowedPrefixes]
  );
  // Custom validation for length (English digits এ check করবে)
  const validateLength = useCallback(
    (value) => {
      console.log('validateLength called with:', value);

      if (!value) {
        console.log('Empty value, require:', require);
        return require ? 'ফোন নম্বর প্রয়োজন' : true;
      }

      const englishDigits = convertToEnglishDigits(value.toString()).trim();
      console.log(
        'English digits:',
        englishDigits,
        'Length:',
        englishDigits.length
      );
      console.log('minLength:', minLength, 'maxLength:', maxLength);

      if (englishDigits.length < minLength) {
        const banglaMinLength = convertToBanglaDisplay(minLength.toString());
        console.log(`Too short: ${englishDigits.length} < ${minLength}`);
        return `ফোন নম্বর অবশ্যই ${banglaMinLength} ডিজিটের হতে হবে`;
      }

      if (englishDigits.length > maxLength) {
        const banglaMaxLength = convertToBanglaDisplay(maxLength.toString());
        console.log(`Too long: ${englishDigits.length} > ${maxLength}`);
        return `ফোন নম্বর ${banglaMaxLength} ডিজিটের বেশি হতে পারবে না`;
      }

      console.log('Length validation passed');
      return true;
    },
    [minLength, maxLength, require]
  );

  // ⭐ Error কখন দেখাবে
  const shouldShowError =
    showError || isSubmitted || touchedFields[registerKey] || isTouched;

  // Prevent non-digit keys
  const handleKeyPress = (e) => {
    const allowedKeys = /[0-9০১২৩৪৫৬৭৮৯]/;
    if (!allowedKeys.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle paste event
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

  // Helper function to validate digits only
  const validateDigitsOnly = (value) => {
    if (!value) return true;
    const englishDigits = convertToEnglishDigits(value.toString()).trim();
    // শুধু ডিজিট আছে কিনা check করি
    return /^\d+$/.test(englishDigits)
      ? true
      : 'শুধুমাত্র সংখ্যাই লিখতে পারবেন';
  };

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
          value={displayValue}
          onInput={handleInput}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
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

        {shouldShowError && errors[registerKey] && (
          <p className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </p>
        )}

        {/* Debug information (remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && currentValue && (
          <div className="text-xs text-gray-500 mt-1">
            Debug: Stored as "{currentValue}", Prefix: "
            {currentValue.toString().substring(0, 3)}"
          </div>
        )} */}
      </div>
    </div>
  );
};

export default PhoneNumberInput;
