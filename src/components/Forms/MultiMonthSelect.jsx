import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const MultiMonthSelect = ({
  label,
  registerKey,
  options = [],
  valueField = 'monthId',
  nameField = 'monthName',
  require = false,
  unicode = false,
  disabled = false,
}) => {
  const { setValue } = useFormContext();
  const translate = useTranslate();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  /* =========================
     🔍 Search Filter
  ========================= */
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt[nameField]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, nameField]);

  /* =========================
     ➕ Select Month
     ❌ Paid OR Due থাকলে select হবে না
  ========================= */
  const handleSelect = (month) => {
    const hasDue = month.due > 0;
    const isPaid = month.isFullPaid;

    if (isPaid || hasDue) return;

    const exists = selected.find((s) => s[valueField] === month[valueField]);
    if (exists) return;

    const updated = [...selected, month];
    setSelected(updated);

    setValue(
      registerKey,
      updated.map((s) => s[valueField]),
      { shouldValidate: true }
    );
  };

  /* =========================
     ❌ Remove Month
  ========================= */
  const handleRemove = (id) => {
    const updated = selected.filter((s) => s[valueField] !== id);
    setSelected(updated);

    setValue(
      registerKey,
      updated.map((s) => s[valueField]),
      { shouldValidate: true }
    );
  };

  return (
    <div className="w-full font-SolaimanLipi">
      {/* Label */}
      {label && (
        <label className="block mb-1 text-black">
          {translate(label)}
          {require && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search month..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="w-full h-[38px] px-3 mb-2 border border-stroke rounded outline-none"
      />

      {/* Options */}
      <div className="border border-stroke rounded max-h-48 overflow-y-auto bg-white">
        {filteredOptions.length === 0 && (
          <p className="p-2 text-gray-400 text-sm">No month found</p>
        )}

        {filteredOptions.map((month) => {
          const hasDue = month.due > 0;
          const isPaid = month.isFullPaid;
          const isDisabled = isPaid || hasDue;

          // ✅ check if already selected
          const isSelected = selected.some(
            (s) => s[valueField] === month[valueField]
          );

          return (
            <div
              key={month[valueField]}
              onClick={() => !isDisabled && handleSelect(month)}
              className={`px-3 py-2 flex justify-between items-center
                ${isDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'cursor-pointer hover:bg-gray-100'
                }
              `}
            >
              <span>
                {unicode ? bnBijoy2Unicode(month[nameField]) : month[nameField]}

                {isPaid && (
                  <span className="ml-2 text-xs text-green-500">(Paid)</span>
                )}

                {!isPaid && hasDue && (
                  <span className="ml-2 text-xs text-orange-500">
                    (Due: {month.due})
                  </span>
                )}
              </span>

              {/* ✅ Tick mark or + */}
              {!isDisabled && (
                <span className="text-green-600 text-sm">
                  {isSelected ? '✔' : '+'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Months */}
      {selected.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 font-semibold text-sm">
            Selected Months ({selected.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {selected.map((month) => (
              <div
                key={month[valueField]}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>
                  {unicode
                    ? bnBijoy2Unicode(month[nameField])
                    : month[nameField]}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(month[valueField])}
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

export default MultiMonthSelect;