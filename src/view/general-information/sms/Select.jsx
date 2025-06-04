import React, { useState, useEffect } from "react";

const Select = ({
  label,
  options = [],
  valueField = "value",
  nameField = "label",
  type = "text",
  onChange,
  required,
}) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (e) => {
    const value = type === "number" ? +e.target.value : e.target.value;
    setSelectedValue(value);
    onChange?.(value);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={selectedValue}
        onChange={handleChange}
        required={required}
        className="w-full border px-3 py-2 rounded-md"
      >
        <option value="">{`Select ${label}`}</option>
        {options.map((opt) => (
          <option key={opt[valueField]} value={opt[valueField]}>
            {opt[nameField]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
