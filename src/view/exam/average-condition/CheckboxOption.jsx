import { useFormContext } from "react-hook-form";

 const CheckboxOption = ({ label, registerKey }) => {
  const { register } = useFormContext();
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(registerKey)}
        className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default CheckboxOption