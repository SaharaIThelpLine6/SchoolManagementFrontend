import React, { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";

const BanglaAttendence = () => {
  const [logo, setLogo] = useState(null);

  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);
  const students = [
    { id: "30001", name: "সাফিক আলী" },
    { id: "30002", name: "রহিম হোসেন" },
    { id: "30003", name: "করিম হোসেন" },
    { id: "30004", name: "নজিফুল ইসলাম" },
    { id: "30005", name: "জাহিদুল" },
    { id: "30006", name: "শফিকুল" },
    { id: "30007", name: "ইমরান" },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [attendance, setAttendance] = useState({});

  const toggleAttendance = (studentId, day) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${day}`]: !prev[`${studentId}-${day}`],
    }));
  };

  return (
    <div className="font-bangla max-w-5xl mx-auto p-4  bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
        </div>

        {/* Title Section */}
        <div className="text-center flex-1 bg-white">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border-2 border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded-xl tracking-widest bg-white text-lg font-medium sm:text-lg">
            দৈনিক শিক্ষার্থীর হাজিরা খাতা
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>
      <div className="flex justify-between my-3 bg-gray-50">
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          শ্রেণী/জামাত: কিতাব খানা
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          শিক্ষাবর্ষ: 2025-26 Bs
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          সন: ১৪৪৫
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          হিজরী: ১৪৪৬
        </div>
        <div className="flex-1 basis-0 min-w-0 font-bold text-sm border border-black py-1 px-2 text-center">
          মাস:জানুয়ারী
        </div>
      </div>

      <div className="">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th className="border border-black bg-white text-center text-sm w-10 h-6">
                ক্র.নং
              </th>
              <th className="border border-black bg-white text-center text-sm w-14 h-6">
                দাখেলা
              </th>
              <th className="border border-black bg-white text-sm min-w-[150px] h-6">
                ছাত্র/ছাত্রীর নাম
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="border border-black text-center bg-white text-sm w-6 h-6"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student.id}>
                <td className="border border-black text-center bg-white text-sm w-10 h-6 p-0 align-middle">
                  {index + 1}
                </td>
                <td className="border border-black text-center bg-white text-sm w-10 h-6 p-0 align-middle">
                  {student.id}
                </td>
                <td className="border border-black bg-white text-sm min-w-[150px] h-6 px-1 py-0.5">
                  {student.name}
                </td>
                {days.map((day) => (
                  <td
                    key={day}
                    className={`border border-black text-center cursor-pointer text-sm w-6 h-6 p-0 align-middle ${
                      attendance[`${student.id}-${day}`]
                        ? "bg-green-200"
                        : "bg-white"
                    }`}
                    onClick={() => toggleAttendance(student.id, day)}
                  >
                    {attendance[`${student.id}-${day}`] ? "✓" : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between mt-6 p-3 ">
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

export default BanglaAttendence;
