import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';

const SingleCheckbox = ({
  label,
  registerKey,
  dcn = 'mb-4',
  disabled = false,
  checked = false,
}) => {
  const { register, setValue } = useFormContext();
  const translate = useTranslate();

  // ✅ Set default checked properly
  useEffect(() => {
    setValue(registerKey, checked);
  }, [registerKey, setValue, checked]);

  return (
    <div className={dcn}>
      <label
        className={`flex items-center space-x-2 text-gray-800 ${
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          {...register(registerKey)}
          disabled={disabled}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="text-sm font-SolaimanLipi font-medium">
          {translate(label)}
        </span>
      </label>
    </div>
  );
};

export default SingleCheckbox;
