import React from "react";
import clsx from "clsx"; // Optional utility for conditional class names

const Button = ({
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
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

  // Combine base classes with custom className, ensuring custom styles take precedence
  const combinedClasses = clsx(baseClasses, className, {
    "from-green-400 via-green-500 to-green-600":
      !className.includes("bg-"),
  });

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
