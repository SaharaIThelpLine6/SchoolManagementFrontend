import { useState } from 'react';

const ThreeDotDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Dropdown Visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left">
      {/* 3 Dot Button */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 bg-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
        >
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                Edit
              </button>
            </li>
            <li>
              <button className="block w-full px-4 py-2 text-left hover:bg-gray-100">
                Duplicate
              </button>
            </li>
            <li>
              <button className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100">
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThreeDotDropdown;
