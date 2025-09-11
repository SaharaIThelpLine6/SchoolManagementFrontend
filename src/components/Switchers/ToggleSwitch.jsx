import React from "react";

const ToggleSwitch = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center cursor-pointer gap-3">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div
          className="w-12 h-6 bg-gray-300 rounded-full
                     peer peer-checked:bg-green-500
                     transition-colors duration-300"
        ></div>
        <div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full border border-gray-300
                     transition-all duration-300 peer-checked:translate-x-6"
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
