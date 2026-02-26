import React from "react";

const PieChartSkeleton = () => {
  return (
    <div className="w-full  h-[440px] 2xl:h-[550px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto mb-6"></div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-[250px] h-[250px] bg-gray-200 rounded-full"></div>
      </div>

      <div className="mt-4 space-y-2 mx-auto">
        <div className="h-4 bg-gray-300 rounded w-40"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-4 bg-gray-300 rounded w-36"></div>
      </div>
    </div>
  );
};

export default PieChartSkeleton;
