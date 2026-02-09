import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePutStudentReportStatusUpdateMutation } from '../features/talimat/talimatQuerySlice';

const options = [
  { value: 0, label: 'অপেক্ষমান' },
  { value: 3, label: 'প্রক্রিয়াধীন' },
];

const StatusSelect = ({ value, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const [updateStatus, { isLoading }] =
    usePutStudentReportStatusUpdateMutation();

  const selected = options.find((o) => o.value === value);

  // 🔥 button click → dropdown position calculate
  const handleToggle = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });

    setOpen((prev) => !prev);
  };

  // ✅ outside click close (button + dropdown safe)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ status change handler
  const handleStatusChange = async (newStatus) => {
    try {
      const payload = {
        id,
        SeeUnSee: newStatus,
      };

      await updateStatus(payload).unwrap();
      onChange?.(newStatus);
      setOpen(false);
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={isLoading}
        onClick={handleToggle}
        className="w-48 border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-white hover:border-gray-400 disabled:opacity-50"
      >
        <span>{selected?.label || 'সিলেক্ট করুন'}</span>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown (PORTAL) */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] bg-white border rounded-md shadow-lg"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
          >
            {options.map((item) => (
              <button
                key={item.value}
                onClick={() => handleStatusChange(item.value)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-yellow-100
                  ${value === item.value ? 'bg-yellow-200' : ''}
                `}
              >
                <span>{item.label}</span>
                {value === item.value && (
                  <span className="text-green-600 font-bold">✔</span>
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default StatusSelect;
