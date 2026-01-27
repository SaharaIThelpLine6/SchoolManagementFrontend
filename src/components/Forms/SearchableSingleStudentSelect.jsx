import { useMemo, useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const SearchableSingleStudentSelect = ({
  label,
  registerKey,
  options = [],
  valueField = 'UserID',
  nameField = 'UserName',
  require = false,
  unicode = false,
  disabled = false,
  placeholder = "Search student...",
  showClearButton = true,
}) => {
  const { setValue, watch } = useFormContext();
  const translate = useTranslate();
  const dropdownRef = useRef(null);

  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Watch form value changes
  const formValue = watch(registerKey);

  // Initialize selected student from form value
  useEffect(() => {
    if (formValue && options.length > 0) {
      const found = options.find(opt => String(opt[valueField]) === String(formValue));
      if (found) {
        setSelectedStudent(found);
      }
    } else if (!formValue) {
      setSelectedStudent(null);
    }
  }, [formValue, options, valueField]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔍 Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    const searchTerm = search.toLowerCase();
    return options.filter((opt) =>
      opt[nameField]?.toLowerCase().includes(searchTerm) ||
      String(opt[valueField])?.toLowerCase().includes(searchTerm)
    );
  }, [search, options, nameField, valueField]);

  // ➕ Select student
  const handleSelect = (student) => {
    setSelectedStudent(student);
    setValue(registerKey, student[valueField]);
    setSearch(unicode ? bnBijoy2Unicode(student[nameField]) : student[nameField]);
    setIsOpen(false);
  };

  // ❌ Clear selection
  const handleClear = () => {
    setSelectedStudent(null);
    setValue(registerKey, '');
    setSearch('');
    setIsOpen(false);
  };

  // Handle input click
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      if (selectedStudent) {
        setSearch(unicode ? bnBijoy2Unicode(selectedStudent[nameField]) : selectedStudent[nameField]);
      }
    }
  };

  // Handle search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    // If input is cleared, clear selection
    if (!value.trim() && selectedStudent) {
      handleClear();
    }

    // Open dropdown when typing
    if (value.trim() && !isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <div className="w-full font-SolaimanLipi relative" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block mb-1 text-black">
          {translate(label)}
          {require && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Search input and selected display */}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          disabled={disabled}
          className="w-full h-[38px] px-3 pr-10 border border-stroke rounded outline-none focus:border-primary"
          readOnly={!!selectedStudent && !isOpen}
        />

        {/* Clear button */}
        {showClearButton && selectedStudent && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            ×
          </button>
        )}

        {/* Dropdown arrow */}
        {!selectedStudent && !disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            ▼
          </div>
        )}
      </div>

      {/* Options dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 border border-stroke rounded shadow-lg bg-white max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-gray-400 text-center">
              {search ? 'No student found' : 'Type to search...'}
            </div>
          ) : (
            <div>
              {/* Search result count */}
              <div className="px-3 py-2 text-xs text-gray-500 border-b">
                Found {filteredOptions.length} student{filteredOptions.length !== 1 ? 's' : ''}
              </div>

              {/* Options list */}
              {filteredOptions.map((student) => {
                const isSelected = selectedStudent &&
                  String(selectedStudent[valueField]) === String(student[valueField]);

                return (
                  <div
                    key={student[valueField]}
                    onClick={() => handleSelect(student)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                      isSelected ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <div>
                      <div className="font-medium">
                        {unicode
                          ? bnBijoy2Unicode(student[nameField])
                          : student[nameField]}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {student[valueField]}
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-green-600 text-lg">✓</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected student preview (read-only mode) */}
      {selectedStudent && !isOpen && (
        <div className="mt-2 p-3 bg-gray-50 rounded border">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-800">
                {unicode
                  ? bnBijoy2Unicode(selectedStudent[nameField])
                  : selectedStudent[nameField]}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                ID: {selectedStudent[valueField]}
              </p>
            </div>
            {!disabled && showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Change
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSingleStudentSelect;
