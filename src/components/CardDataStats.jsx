import React from "react";

const CardDataStats = ({ title, total, children, bgColor }) => {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: bgColor }} // Dynamic background color
      >
        {children}
      </div>
      <div className="flex flex-col">
        <h4 className="text-xl font-semibold text-gray-800">{total}</h4>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
    </div>
  );
};

export default CardDataStats;
