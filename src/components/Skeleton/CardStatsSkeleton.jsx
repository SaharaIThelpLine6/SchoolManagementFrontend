import React from "react";

const CardStatsSkeleton = () => {
  return (
    <div className="flex items-center gap-4 rounded-md bg-white p-4 shadow-sm transition hover:shadow-md animate-pulse">
      {/* Icon Circle Skeleton */}
      <div className="flex h-14 md:h-16 w-14 md:w-16 items-center justify-center rounded-full bg-gray-200" />

      {/* Text Skeleton */}
      <div className="flex flex-col space-y-2">
        <div className="h-5 w-20 bg-gray-300 rounded"></div>
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default CardStatsSkeleton;
