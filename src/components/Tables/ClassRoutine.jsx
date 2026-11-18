
import React, { useState } from "react";

import StudentClassListSkeleton from "../Skeleton/StudentClassListSkeleton";
import useTranslate from "../../utils/Translate";

const ClassRoutine = ({
  data,
  isLoading,
  isError,
  subClassData,
}) => {
  const translate = useTranslate();

  // Default view: Class Wise
  const [viewType, setViewType] = useState("class");

  if (isLoading) return <StudentClassListSkeleton />;

  if (isError) {
    return (
      <p className="text-center text-red-500 py-5">
        ডেটা আনতে সমস্যা হয়েছে!
      </p>
    );
  }

  const classWiseStudent = data ?? [];
  const subClassWiseStudent = subClassData ?? [];

  const isClassView = viewType === "class";

  const studentList = isClassView
    ? classWiseStudent
    : subClassWiseStudent;

  return (
    <div className="w-full font-default h-[450px] 2xl:h-[580px] mx-auto mt-6 p-4 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center gap-3 mb-4">

        {/* Left Title */}
        <h2 className="text-lg md:text-xl font-bold text-gray-800">
          {translate("Number of students by class")}
        </h2>

        {/* Right View Select */}
        <div className="flex items-center gap-2 text-xs text-gray-600 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer min-w-[100px] max-w-[160px]"
          >
            <option value="class">
              {translate("Class Wise")}
            </option>

            <option value="subclass">
              {translate("Subclass Wise")}
            </option>
          </select>

        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto pr-1">

        {studentList.length > 0 ? (
          <ul className="space-y-2">

            {studentList.map((item) => (
              <li
                key={
                  isClassView
                    ? item.classId
                    : item.subClassId
                }
                className="flex justify-between items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all"
              >

                {/* Class / Subclass Name */}
                <div className="min-w-0 flex-1">

                  <p className="text-gray-700 text-sm md:text-base font-semibold truncate">
                    {isClassView
                      ? item.className
                      : item.subClass}
                  </p>

                  {!isClassView && (
                    <p className="text-xs text-gray-400 mt-1">
                      {item.classId
                        ? `${translate("Class ID")}: ${item.classId}`
                        : ""}
                    </p>
                  )}

                </div>

                {/* Student Count */}
                <div className="flex-shrink-0 flex items-center justify-center min-w-9 h-9 px-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  {Number(item.totalStudent) || 0}
                </div>

              </li>
            ))}

          </ul>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">

            <svg
              className="w-12 h-12 mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <p className="text-sm">
              {translate("No student data found")}
            </p>

          </div>
        )}

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">

        <span className="text-sm text-gray-500">
          {translate("Total")}{" "}
          {isClassView
            ? translate("Class")
            : translate("Subclass")}
          ({studentList.length})
        </span>

      </div>

    </div>
  );
};

export default ClassRoutine;
