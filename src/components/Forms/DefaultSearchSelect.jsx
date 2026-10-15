import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const DefaultSearchSelect = ({
  label,
  type,
  options,
  registerKey,
  require,
  valueField,
  nameField,
  labelColor = "text-black",
  disabled,
  readOnly = false,
  unicode = false,
  labelPosition = "top",
  onChange,
  defaultValue = "Select",
  searchable = false,
  searchPlaceholder = "Search...",
  noResultText = "No results found",
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // পজিশন স্টেট
  const [dropdownStyle, setDropdownStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom",
  });

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedValue = watch(registerKey);

  useEffect(() => {
    register(registerKey, { required: require });
  }, [register, registerKey, require]);

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options || [];
    const lowerSearch = searchTerm.toLowerCase();
    return (options || []).filter((option) => {
      const labelText = unicode
        ? bnBijoy2Unicode(option[nameField])
        : option[nameField];
      return String(labelText).toLowerCase().includes(lowerSearch);
    });
  }, [options, searchTerm, nameField, unicode, searchable]);

  // প্রাথমিক পজিশন ক্যালকুলেশন (রেন্ডারের আগে)
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // আনুমানিক উচ্চতা (পরে আসল উচ্চতা দিয়ে ঠিক করা হবে)
      const estimatedHeight = 250;

      let placement = "bottom";
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        placement = "top";
      }

      setDropdownStyle((prev) => ({
        ...prev,
        left: rect.left + window.scrollX,
        width: rect.width,
        placement: placement,
        triggerTop: rect.top + window.scrollY,
        triggerBottom: rect.bottom + window.scrollY,
      }));
    }
  };

  // 🌟 আসল উচ্চতা মাপার জন্য useLayoutEffect (গ্যাপ দূর করার মূল সমাধান)
  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current && triggerRef.current) {
      const dropdownHeight = dropdownRef.current.getBoundingClientRect().height;
      const rect = triggerRef.current.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;

      // যদি নিচে পর্যাপ্ত জায়গা না থাকে এবং উপরে জায়গা থাকে
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        // উপরে পজিশন: ট্রিগারের টপ থেকে ড্রপডাউনের উচ্চতা বিয়োগ
        setDropdownStyle((prev) => ({
          ...prev,
          placement: "top",
          top: rect.top + window.scrollY - dropdownHeight, // একদম নিখুঁত পজিশন
        }));
      } else {
        // নিচে পজিশন
        setDropdownStyle((prev) => ({
          ...prev,
          placement: "bottom",
          top: rect.bottom + window.scrollY,
        }));
      }
    }
  }, [isOpen, filteredOptions]); // filteredOptions পরিবর্তন হলে (সার্চ করলে) উচ্চতা আবার মাপবে

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleCloseOthers = (e) => {
      if (e.detail !== registerKey) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("closeOtherSelects", handleCloseOthers);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("closeOtherSelects", handleCloseOthers);
    };
  }, [registerKey]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const handleToggle = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (disabled || readOnly) return;

    if (!isOpen) {
      window.dispatchEvent(new CustomEvent("closeOtherSelects", { detail: registerKey }));
      updatePosition();
      setSearchTerm("");
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue, optionData) => {
    if (readOnly || disabled) return;
    const finalValue = type === "number" ? parseInt(optionValue) : optionValue;
    setValue(registerKey, finalValue, { shouldValidate: true });
    setIsOpen(false);
    setSearchTerm("");
    if (onChange) {
      onChange(optionData);
    }
  };

  const getSelectedLabel = () => {
    if (
      selectedValue === undefined ||
      selectedValue === null ||
      selectedValue === ""
    ) {
      return translate(defaultValue);
    }
    const selectedOption = options?.find(
      (opt) => String(opt[valueField]) === String(selectedValue)
    );
    if (selectedOption) {
      return unicode
        ? bnBijoy2Unicode(selectedOption[nameField])
        : selectedOption[nameField];
    }
    return translate(defaultValue);
  };

  const hasError = errors[registerKey];

  const dropdownMenu = isOpen
    ? createPortal(
      <div
        ref={dropdownRef}
        data-select-portal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: `${dropdownStyle.top}px`, // useLayoutEffect থেকে পাওয়া নিখুঁত পজিশন
          left: `${dropdownStyle.left}px`,
          width: `${dropdownStyle.width}px`,
          zIndex: 9999,
        }}
        className="bg-white border border-gray-200 rounded-lg shadow-2xl animate-fade-in"
      >
        {searchable && (
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-lg">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={translate(searchPlaceholder)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <ul className="py-1 max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = String(option[valueField]) === String(selectedValue);
              const labelText = unicode ? bnBijoy2Unicode(option[nameField]) : option[nameField];
              return (
                <li
                  key={option[valueField]}
                  onClick={() => handleSelect(option[valueField], option)}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-150 flex items-center justify-between
                      ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <span>{labelText}</span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </li>
              );
            })
          ) : (
            <li className="px-3 py-4 text-sm text-gray-400 text-center">
              {translate(searchable ? noResultText : "No options available")}
            </li>
          )}
        </ul>
      </div>,
      document.body
    )
    : null;

  return (
    <div className={`font-SolaimanLipi w-full ${labelPosition === "left" ? "flex items-center gap-4" : ""}`}>
      {label && (
        <label htmlFor={registerKey} className={`font-bold text-sm ${labelPosition === "left" ? "text-black" : "mb-1 block text-black"}`}>
          <div className="flex items-center gap-1">
            <span className={labelColor}>{translate(label)}</span>
            {require && <span className="text-red-500">*</span>}
            <span>:</span>
          </div>
        </label>
      )}

      <div className={labelPosition === "left" ? "flex-1" : ""}>
        <div
          ref={triggerRef}
          onClick={handleToggle}
          onMouseDown={(e) => e.stopPropagation()}
          className={`relative flex items-center justify-between w-full rounded-lg border text-sm h-11 px-3 transition-all duration-200 ease-in-out bg-white text-gray-900 cursor-pointer select-none
            ${hasError ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200" : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"}
            ${disabled ? "cursor-not-allowed bg-slate-100 text-gray-500" : ""}
            ${readOnly ? "cursor-default bg-gray-50" : ""}`}
        >
          <span className={`truncate ${!selectedValue ? "text-gray-400" : "text-gray-900"}`}>
            {getSelectedLabel()}
          </span>

          <span className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-transform duration-300 pointer-events-none ${isOpen ? "rotate-180" : "rotate-0"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        </div>

        {dropdownMenu}

        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

export default DefaultSearchSelect;