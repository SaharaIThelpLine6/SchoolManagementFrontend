import React from "react";

const BarChartSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto mt-6 bg-white p-4 md:p-6 rounded-md shadow animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 mx-auto"></div>

      {/* Simulated Bar Chart Grid */}
      <div className="h-[250px] flex items-end justify-between space-x-2 px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-full flex flex-col justify-end items-center"
          >
            <div
              className="w-6 bg-gray-300 rounded"
              style={{ height: `${40 + i * 10}px` }}
            ></div>
          </div>
        ))}
      </div>

      {/* X-axis labels (placeholder) */}
      <div className="flex justify-between mt-4 px-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-6 h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export default BarChartSkeleton;
