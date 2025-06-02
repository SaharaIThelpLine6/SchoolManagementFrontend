import React from "react";

const StudentClassListSkeleton = () => {
  return (
    <div className="w-full  h-[450px] 2xl:h-[550px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col animate-pulse font-sans">
      <div className="h-6 bg-gray-300 rounded w-2/3 mx-auto mb-4"></div>

      <ul className="space-y-3 flex-1 ">
        {Array.from({ length: 6 }).map((_, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-200"
          >
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentClassListSkeleton;
