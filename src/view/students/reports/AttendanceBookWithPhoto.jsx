import React, { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";

const AttendanceBookWithPhoto = ({ reportData }) => {
  const [logo, setLogo] = useState(null);
  const [attendance, setAttendance] = useState({});
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  // Generate days of the month
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      setLogo(`data:image/png;base64,${base64String}`);
    }
  }, [instutionInfo]);

  const toggleAttendance = (studentId, day) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${day}`]: !prev[`${studentId}-${day}`],
    }));
  };

  // Transform reportData to match the expected structure
  const students =
    reportData?.map((student) => ({
      id: student.StudentCode,
      name: bnBijoy2Unicode(student.StudentName),
    })) || [];

  return (
    <div className="font-bangla  p-4 bg-white text-xs">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0">
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          {logo && <img src={logo} alt="Logo" className="w-20 h-20" />}
        </div>

        <div className="text-center flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border-2 border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded-xl tracking-widest text-lg font-medium sm:text-lg">
            দৈনিক শিক্ষার্থীর হাজিরা খাতা
          </div>
        </div>

        <div className="hidden sm:block w-20 h-20" />
      </div>

      {/* Info Bar */}
      <div className="flex justify-between my-3 bg-gray-50">
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          শ্রেণী/জামাত:{" "}
          {reportData?.[0]?.ClassName
            ? bnBijoy2Unicode(reportData[0].ClassName)
            : "কিতাব খানা"}
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          শিক্ষাবর্ষ: {reportData?.[0]?.SessionName || "2025-26 Bs"}
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          সন: 
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          হিজরী: 
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          মাস: 
        </div>
      </div>

      {/* Attendance Table */}
      <div className="text-xs">
        <table className="w-full border-collapse">
          <thead>
            <tr className="h-6">
              <th className="border border-black bg-white text-center w-8 min-w-[32px]">
                ক্র.নং
              </th>
              <th className="border border-black bg-white text-center w-12 min-w-[48px]">
                দাখেলা
              </th>
              <th className="border border-black bg-white text-left px-1 min-w-[150px] truncate">
                ছাত্র/ছাত্রীর নাম
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-black bg-white text-center w-6 min-w-[24px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr key={student.id} className="h-6">
                <td className="border border-black bg-white text-center align-middle">
                  {index + 1}
                </td>
                <td className="border border-black bg-white text-center align-middle truncate">
                  {student.id}
                </td>
                <td className="border border-black bg-white text-left px-1 align-middle truncate">
                  {student.name}
                </td>
                {days.map((day) => (
                  <td
                    key={day}
                    className={`border border-black text-center cursor-pointer w-6 h-6 p-0 align-middle ${
                      attendance[`${student.id}-${day}`]
                        ? "bg-green-200"
                        : "bg-white"
                    }`}
                    onClick={() => toggleAttendance(student.id, day)}
                  >
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-b border-black h-3 w-6">
                        {attendance[`${student.id}-${day}`] === i + 1
                          ? "✓"
                          : ""}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-6 p-3">
        <div className="border-t border-black w-50 text-center">
          <span className="font-normal">মোট কার্য দিবস: </span>
        </div>
        <div className="border-t border-black w-50 text-center">
          <span className="font-normal">শিক্ষক/শিক্ষিকার স্বাক্ষর: </span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceBookWithPhoto;
