import React, { cloneElement } from "react";

const CardDataStats = ({
  title,
  total,
  children,
  bgColor,
  iconColor,
  titleColor,
}) => {
  // Ensure titleColor is a valid Tailwind text class by prepending "text-"
  const textClass = titleColor ? titleColor : "text-gray-500";

  // Ensure iconColor is a valid Tailwind text class by prepending "text-"
  const iconTextClass = iconColor ? iconColor : "text-gray-500";

  // Apply the iconColor class to the children (icon)
  const styledIcon = children
    ? cloneElement(children, {
        className: `${children.props.className || ""} ${iconTextClass}`,
      })
    : null;

  return (
    <div className="flex items-center gap-4 rounded-md bg-white p-4 shadow-sm transition hover:shadow-md">
      <div
        className="flex h-14 md:h-16 w-14 md:w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: bgColor }} // Dynamic background color
      >
        {styledIcon}
      </div>
      <div className="flex flex-col">
        <h4 className="text-xl font-semibold text-gray-800">{total}</h4>
        <span className={`text-sm ${textClass}`}>{title}</span>
      </div>
    </div>
  );
};

export default CardDataStats;
