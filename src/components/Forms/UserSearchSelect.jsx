import React, { useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";
import { useGetUsersWithTypeQuery } from "../../features/settings/settingsQuerySlice";

const UserSearchSelect = ({
  label,
  registerKey,
  require,
  valueField = "UserID",
  nameField = "UserName",
  selectedUserType,
  unicode = false,
  disabled,
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
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);

  const dropdownRef = useRef(null);

  const selectedValue = watch(registerKey);

  // ✅ Server-side search
  const { data: apiData = {}, isLoading } = useGetUsersWithTypeQuery(
    { id: selectedUserType, page, limit: 50, search: searchTerm },
    { skip: !selectedUserType }
  );

  const options = apiData.data || [];

  // ✅ Sync selected option when form value changes (edit mode support)
  useEffect(() => {
    if (selectedValue && options.length) {
      const found = options.find(
        (o) => String(o[valueField]) === String(selectedValue)
      );
      if (found) {
        setSelectedOption(found);
      }
    }
  }, [selectedValue, options, valueField]);

  const getSelectedLabel = () => {
    if (!selectedOption) return "";
    return unicode
      ? bnBijoy2Unicode(selectedOption[nameField])
      : selectedOption[nameField];
  };

  const handleSelect = (value) => {
    const selected = options.find(
      (o) => String(o[valueField]) === String(value)
    );

    setValue(registerKey, value);
    setSelectedOption(selected);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  // ✅ Close dropdown only (do NOT reset searchTerm)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <label className="mb-1 block text-black font-SolaimanLipi">
        {label} :
      </label>

      <div
        className={`relative border rounded bg-[#EDEDED] border-stroke cursor-pointer font-SolaimanLipi ${disabled ? "cursor-not-allowed opacity-60" : ""
          }`}
        onClick={handleToggle}
      >
        <input
          type="text"
          placeholder={translate("Select")}
          value={isOpen ? searchTerm : getSelectedLabel()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
            setIsOpen(true);
          }}
          disabled={disabled}
          className="w-full px-4 py-1 bg-transparent outline-none"
        />

        <span
          className={`absolute top-1/2 right-4 transform -translate-y-1/2 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
            }`}
        >
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full max-h-48 overflow-y-auto bg-white shadow-md border mt-1 rounded text-sm font-SolaimanLipi">
          {isLoading ? (
            <li className="px-4 py-2 text-gray-500">
              {translate("Loading...")}
            </li>
          ) : options.length ? (
            options.map((option) => (
              <li
                key={option[valueField]}
                onClick={() => handleSelect(option[valueField])}
                className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${String(selectedValue) ===
                  String(option[valueField])
                  ? "bg-blue-200"
                  : ""
                  }`}
              >
                {unicode
                  ? bnBijoy2Unicode(option[nameField])
                  : option[nameField]}

                {option.UserCode && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({option.UserCode})
                  </span>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">
              {translate("No options")}
            </li>
          )}
        </ul>
      )}

      {/* Hidden input for react-hook-form */}
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

export default UserSearchSelect;