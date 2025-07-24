const RadioOption = ({ option, register, name, labelClassName }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name={name}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      {...register(name)}
      value={option.id}
    />
    <span className={`text-sm text-gray-700 ${labelClassName}`}>
      {option.label}
    </span>
  </label>
);

export default RadioOption;
