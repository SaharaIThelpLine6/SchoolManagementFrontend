import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const SearchSelect = ({
  label,
  options = [],
  registerKey,
  require,
  valueField,
  nameField,
  disabled,
  unicode = false,
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedValue = watch(registerKey);

  const getSelectedLabel = () => {
    const selected = options.find((o) => o[valueField] === selectedValue);
    if (!selected) return "";
    return unicode ? bnBijoy2Unicode(selected[nameField]) : selected[nameField];
  };

  const filteredOptions = options.filter((option) =>
    unicode
      ? bnBijoy2Unicode(option[nameField])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : option[nameField].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    setValue(registerKey, value);
    const selected = options.find((o) => o[valueField] === value);
    setSearchTerm(
      selected
        ? unicode
          ? bnBijoy2Unicode(selected[nameField])
          : selected[nameField]
        : ""
    );
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => {
        const next = !prev;
        if (!next) setSearchTerm("");
        return next;
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="mb-1 block text-black font-SolaimanLipi">{label}</label>

      <div
        className={`relative border rounded bg-[#EDEDED] border-stroke cursor-pointer font-SolaimanLipi ${
          disabled ? "cursor-not-allowed opacity-60" : ""
        }`}
        onClick={handleToggle}
      >
        <input
          type="text"
          placeholder={translate("Select")}
          value={isOpen ? searchTerm : getSelectedLabel()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          disabled={disabled}
          className="w-full px-4 py-1 bg-transparent outline-none"
        />

        <span
          className={`absolute top-1/2 right-4 transform -translate-y-1/2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white shadow-md border mt-1 rounded text-sm font-SolaimanLipi">
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <li
                key={option[valueField]}
                onClick={() => handleSelect(option[valueField])}
                className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${
                  selectedValue === option[valueField] ? "bg-blue-200" : ""
                }`}
              >
                {unicode
                  ? bnBijoy2Unicode(option[nameField])
                  : option[nameField]}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">
              {translate("No options")}
            </li>
          )}
        </ul>
      )}

      <input
        type="hidden"
        {...register(registerKey, { required: require })}
        value={selectedValue || ""}
      />

      {errors[registerKey] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[registerKey].message}
        </p>
      )}
    </div>
  );
};

export default SearchSelect;
