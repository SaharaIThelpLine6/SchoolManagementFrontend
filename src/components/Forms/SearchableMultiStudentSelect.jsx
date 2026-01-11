import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const SearchableMultiStudentSelect = ({
  label,
  registerKey,
  options = [],
  valueField = 'UserID',
  nameField = 'UserName',
  require = false,
  unicode = false,
  disabled = false,
}) => {
  const { setValue } = useFormContext();
  const translate = useTranslate();

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  // 🔍 search filter
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt[nameField]?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, nameField]);

  // ➕ add student
  const handleSelect = (student) => {
    const exists = selected.find((s) => s[valueField] === student[valueField]);
    if (exists) return;

    const updated = [...selected, student];
    setSelected(updated);
    setValue(
      registerKey,
      updated.map((s) => s[valueField])
    );
  };

  // ❌ remove student
  const handleRemove = (id) => {
    const updated = selected.filter((s) => s[valueField] !== id);
    setSelected(updated);
    setValue(
      registerKey,
      updated.map((s) => s[valueField])
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

      {/* Search input */}
      <input
        type="text"
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="w-full h-[38px] px-3 mb-2 border border-stroke rounded outline-none"
      />

      {/* Options list */}
      <div className="border border-stroke rounded max-h-40 overflow-y-auto bg-white">
        {filteredOptions.length === 0 && (
          <p className="p-2 text-gray-400 text-sm">No student found</p>
        )}

        {filteredOptions.map((student) => (
          <div
            key={student[valueField]}
            onClick={() => handleSelect(student)}
            className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
          >
            <span>
              {unicode
                ? bnBijoy2Unicode(student[nameField])
                : student[nameField]}
            </span>
            <span className="text-green-600 text-sm">+</span>
          </div>
        ))}
      </div>

      {/* Selected students */}
      {selected.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 font-semibold text-sm">
            Selected Students ({selected.length})
          </p>

          <div className="flex flex-wrap gap-2">
            {selected.map((student) => (
              <div
                key={student[valueField]}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>
                  {unicode
                    ? bnBijoy2Unicode(student[nameField])
                    : student[nameField]}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(student[valueField])}
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

export default SearchableMultiStudentSelect;
