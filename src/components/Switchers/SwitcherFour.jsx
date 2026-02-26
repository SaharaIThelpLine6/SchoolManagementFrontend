import { useFormContext } from 'react-hook-form';

const SwitcherFour = ({
  name,
  label,
  defaultValue = false,
  disabled = false,
  activeColor = '#007af7', // ✅ Add custom active color prop
}) => {

  console.log(defaultValue, 'defaultValue');
  const { register, setValue, watch } = useFormContext();
  const enabled = watch(name, defaultValue);

  const toggle = () => {
    if (!disabled) setValue(name, !enabled);
  };

  return (
    <div className="flex items-center gap-3">
      {label && <label className="font-SolaimanLipi text-black">{label}</label>}

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          {...register(name)}
          checked={enabled}
          onChange={toggle}
          disabled={disabled}
          className="sr-only"
        />

        {/* Track */}
        <div
          className="h-8 w-14 rounded-full transition"
          style={{
            backgroundColor: enabled ? activeColor : '#d1d5db', // Tailwind gray-300 fallback
          }}
        />

        {/* Thumb */}
        <div
          className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-300`}
          style={{
            transform: enabled ? 'translateX(24px)' : 'translateX(0)',
          }}
        />
      </label>
    </div>
  );
};

export default SwitcherFour;
