import { useEffect, useRef, useState } from 'react';
import { usePutStudentReportStatusUpdateMutation } from '../features/talimat/talimatQuerySlice';

const options = [
  { value: 0, label: 'অপেক্ষমান' },
  { value: 3, label: 'প্রক্রিয়াধীন' },
];

const StatusSelect = ({ value, onChange, id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [updateStatus, { isLoading }] =
    usePutStudentReportStatusUpdateMutation();

  const selected = options.find((o) => o.value === value);

  // ✅ outside click handler (NO async here)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
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

      onChange(newStatus); // parent state update
      setOpen(false);
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  return (
    <div ref={ref} className="relative w-48">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => setOpen(!open)}
        className="w-full border rounded-md px-3 py-2 text-sm flex justify-between items-center bg-white hover:border-gray-400 disabled:opacity-50"
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

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
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
        </div>
      )}
    </div>
  );
};

export default StatusSelect;
