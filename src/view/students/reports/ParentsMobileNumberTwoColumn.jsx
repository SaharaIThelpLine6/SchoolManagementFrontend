import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const ParentsMobileNumberTwoColumn = ({ reportData }) => {
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

  // Transform reportData into the required format
  const students = reportData?.map((student, index) => ({
    sl: index + 1,
    roll: student.StudentCode,
    name: bnBijoy2Unicode(student.StudentName),
    mobile: `${bnBijoy2Unicode(student.FatherName || '')} - ${student.Mobile1 || ''}`
  })) || [];

  return (
    <div className="font-bangla max-w-5xl mx-auto p-4 bg-white text-xs">

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
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      {/* Section Title */}
      <div className="w-full border-b-4 border-black border-double text-center mt-2 sm:mb-3 pb-2 mx-5">
        <span className="text-black tracking-widest border-b border-black text-base font-bold sm:text-lg">
          অভিভাবকের মোবাইল
        </span>
      </div>

      <div className="flex justify-start items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত: {reportData?.[0]?.ClassName ? bnBijoy2Unicode(reportData[0].ClassName) : ''}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1].map((colIndex) => (
            <table
              key={colIndex}
              className="min-w-full border border-black border-collapse bg-white"
            >
              <thead className="bg-white">
                <tr className="text-center text-sm">
                  <th className="border border-black px-2 py-1">ক্র:</th>
                  <th className="border border-black px-2 py-1">দাখেলা</th>
                  <th className="border border-black px-2 py-1">
                    শিক্ষার্থীর নাম
                  </th>
                  <th className="border border-black px-2 py-1">
                    পিতার নাম ও মোবাইল
                  </th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((_, i) => i % 2 === colIndex)
                  .map((student, idx) => (
                    <tr key={idx} className="text-center bg-white">
                      <td className="border border-black px-2 py-1 bg-white">
                        {student.sl}
                      </td>
                      <td className="border border-black px-2 py-1 bg-white">
                        {student.roll}
                      </td>
                      <td className="border border-black px-2 py-1 bg-white">
                        {student.name}
                      </td>
                      <td className="border border-black px-2 py-1 bg-white">
                        {student.mobile}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentsMobileNumberTwoColumn;