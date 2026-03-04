import { useMemo, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import bnBijoy2Unicode from "../../utils/conveter";

const SearchableMultiDaySelect = ({
  label,
  registerKey,
  options = [],
  valueField = "DayID",
  nameField = "DayName",
  require = false,
  unicode = false,
  disabled = false,
  setSelected,
  selected
}) => {
  const { setValue, getValues } = useFormContext();
  const translate = useTranslate();

  const [search, setSearch] = useState("");

  // ✅ Load default value once (Edit mode safe)
  useEffect(() => {
    const existing = getValues(registerKey);

    if (existing && existing.length && options.length) {
      const matched = options.filter((opt) =>
        existing.includes(opt[valueField])
      );
      setSelected(matched);
    }
  }, [options]);

  // 🔍 Search filter
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt[nameField]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, nameField]);

  // ➕ Add
  const handleSelect = (item) => {
    if (disabled) return;

    const exists = selected.find(
      (s) => s[valueField] === item[valueField]
    );
    if (exists) return;

    const updated = [...selected, item];
    setSelected(updated);

    setValue(
      registerKey,
      updated.map((s) => s[valueField]),
      { shouldValidate: true }
    );
  };

  // ❌ Remove
  const handleRemove = (id) => {
    const updated = selected.filter(
      (s) => s[valueField] !== id
    );

    setSelected(updated);

    setValue(
      registerKey,
      updated.map((s) => s[valueField]),
      { shouldValidate: true }
    );
  };

  const isSelected = (id) =>
    selected.some((item) => item[valueField] === id);

  return (
    <div className="w-full font-SolaimanLipi">
      {label && (
        <label className="block mb-1 text-black">
          {translate(label)}
          {require && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        type="text"
        placeholder="Search day..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="w-full h-[38px] px-3 mb-2 border border-stroke rounded outline-none"
      />

      <div className="border border-stroke rounded max-h-40 overflow-y-auto bg-white">
        {filteredOptions.length === 0 && (
          <p className="p-2 text-gray-400 text-sm">No day found</p>
        )}

        {filteredOptions.map((item) => {
          const selectedItem = isSelected(item[valueField]);

          return (
            <div
              key={item[valueField]}
              onClick={() =>
                !selectedItem && handleSelect(item)
              }
              className={`px-3 py-2 flex justify-between items-center
                ${selectedItem
                  ? "bg-gray-100 cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-gray-100"
                }`}
            >
              <span>
                {unicode
                  ? bnBijoy2Unicode(item[nameField])
                  : item[nameField]}
              </span>

              {selectedItem ? (
                <span className="text-green-600 font-bold">✔</span>
              ) : (
                <span className="text-green-600 text-sm">+</span>
              )}
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 font-semibold text-sm">
            Selected Days ({selected.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {selected.map((item) => (
              <div
                key={item[valueField]}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>
                  {unicode
                    ? bnBijoy2Unicode(item[nameField])
                    : item[nameField]}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleRemove(item[valueField])
                  }
                  className="text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableMultiDaySelect;