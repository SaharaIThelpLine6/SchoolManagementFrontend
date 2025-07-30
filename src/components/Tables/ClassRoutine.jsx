import React from "react";

import { useGetStudentNumberByClassQuery } from "../../features/dashboard/dashboardQuerySlice";
import StudentClassListSkeleton from "../Skeleton/StudentClassListSkeleton";
import bnBijoy2Unicode from "../../utils/conveter";
import useTranslate from "../../utils/Translate";

const ClassRoutine = () => {
  const translate = useTranslate();

  const {
    data: studentclass,
    isLoading,
    isError,
  } = useGetStudentNumberByClassQuery();
  // যদি লোডিং হয়
  if (isLoading) return <StudentClassListSkeleton />;
  if (isError) return <p>ডেটা আনতে সমস্যা হয়েছে!</p>;
  return (
    <div className="w-full font-SolaimanLipi h-[450px] 2xl:h-[550px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {translate("Number of students by class")}
      </h2>
      <ul className="space-y-3 flex-1 overflow-y-auto">
        {studentclass?.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center py-2 border-b border-gray-200"
          >
            <span className="text-gray-700 text-base">
              {bnBijoy2Unicode(item.className)}
            </span>
            <span className="flex items-center justify-center w-8 h-8   font-semibold rounded-full text-sm">
              {item.student}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassRoutine;
