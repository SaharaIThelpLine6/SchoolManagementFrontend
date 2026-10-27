import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  valueField = "value",
  nameField = "label",
  label,
  placeholder = "Select options",
  searchPlaceholder = "Search options",
  emptyMessage = "No options found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const selectedValues = value.map(String);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const toggle = (optionValue) => {
    const selectedValue = String(optionValue);
    onChange?.(
      selectedValues.includes(selectedValue)
        ? selectedValues.filter((item) => item !== selectedValue)
        : [...selectedValues, selectedValue]
    );
  };

  const selectedOptions = options.filter((option) =>
    selectedValues.includes(String(option[valueField]))
  );
  const filteredOptions = options.filter((option) =>
    String(option[nameField] ?? "").toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  );

  return (
    <div ref={containerRef} className="relative mb-4">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      <div className={`flex min-h-12 flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${isOpen ? "border-blue-400 ring-2 ring-blue-100" : "border-blue-200 hover:border-blue-300"}`}>
        {selectedOptions.map((option) => (
          <span
            key={option[valueField]}
            className="inline-flex min-h-8 items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-sm text-slate-800"
          >
            {option[nameField]}
            <button
              type="button"
              onClick={() => toggle(option[valueField])}
              aria-label={`Remove ${option[nameField]}`}
              className="rounded p-0.5 text-slate-500 transition-colors hover:bg-blue-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </span>
        ))}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onClick={() => {
            setIsOpen((open) => !open);
            setSearch("");
          }}
          className="flex min-h-8 min-w-32 flex-1 items-center justify-between gap-2 rounded px-1 text-left text-sm text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <span>{placeholder}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 7.5 5 5 5-5" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-blue-100 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 text-slate-400 focus-within:text-blue-500">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.preventDefault();
                if (event.key === "Escape") {
                  setIsOpen(false);
                  setSearch("");
                }
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>
          <div role="listbox" aria-multiselectable="true" className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(String(option[valueField]));
              return (
                <button
                  key={option[valueField]}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(option[valueField])}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:bg-blue-50 ${isSelected ? "bg-blue-50 text-blue-800" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span aria-hidden="true" className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-400 bg-white"}`}>
                    {isSelected && (
                      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 8 3.2 3.2L13 4.5" />
                      </svg>
                    )}
                  </span>
                  {option[nameField]}
                </button>
              );
            })}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-500">{emptyMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

MultiSelect.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object),
  value: PropTypes.array,
  onChange: PropTypes.func,
  valueField: PropTypes.string,
  nameField: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  emptyMessage: PropTypes.string,
};
