import React from "react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md text-center animate-fadeIn">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Coming Soon</h1>
        <p className="text-gray-600 text-lg mb-6">
          We’re working hard to bring you something amazing. Stay tuned...
        </p>
        <div className="flex justify-center">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
