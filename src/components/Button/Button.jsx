import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
  loading = false, // NEW: loading prop
  ...rest
}) => {
  const baseClasses = `
    font-medium
    rounded-lg
    text-sm
    px-4 py-2
    text-center
    transition
    duration-300
    ease-in-out
    disabled:opacity-60
    disabled:cursor-not-allowed
    focus:outline-none
    focus:ring-4
    focus:ring-green-300
    bg-blue-500
    hover:bg-blue-600
    text-white
  `;

  const combinedClasses = clsx(baseClasses, className, {
    "from-green-400 via-green-500 to-green-600 font-SolaimanLipi": !className.includes("bg-"),
  });

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      disabled={disabled || loading} // prevent click during loading
      {...rest}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-white"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
