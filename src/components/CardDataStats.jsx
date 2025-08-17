import React, { cloneElement } from "react";

const CardDataStats = ({
  title,
  total,
  children,
  bgColor,
  iconColor,
  titleColor,
  isLoading = false, // <-- added loading prop
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-4 rounded-md bg-white p-4 shadow-sm transition hover:shadow-md animate-pulse">
        {/* Icon Skeleton */}
        <div className="flex h-14 md:h-16 w-14 md:w-16 items-center justify-center rounded-full bg-gray-200" />
        {/* Text Skeleton */}
        <div className="flex flex-col space-y-2">
          <div className="h-5 w-20 bg-gray-300 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const textClass = titleColor ? titleColor : "text-gray-500";
  const iconTextClass = iconColor ? iconColor : "text-gray-500";

  const styledIcon = children
    ? cloneElement(children, {
        className: `${children.props.className || ""} ${iconTextClass}`,
      })
    : null;

  return (
    <div className="flex items-center gap-4 rounded-md bg-white p-4 shadow-sm transition hover:shadow-md">
      <div
        className={`flex h-14 md:h-16 w-14 md:w-16 items-center justify-center rounded-full ${bgColor}`}
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
