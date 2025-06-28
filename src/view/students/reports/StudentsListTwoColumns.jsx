import React from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

const StudentsListTwoColumns = ({ reportData }) => {
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  // দুইভাগে ভাগ করা হচ্ছে
  const mid = Math.ceil(reportData?.length / 2);
  const firstHalf = reportData?.slice(0, mid);
  const secondHalf = reportData?.slice(mid);

  return (
    <div className="bg-white p-8 text-black text-sm">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
          {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
        </h1>
        <p className="text-base font-semibold text-gray-700">
          {bnBijoy2Unicode(instutionInfo?.Address)}
        </p>
      </div>

      {/* Title and Print Date */}
      <div className="grid grid-cols-7 items-center mb-6 px-4 py-3 gap-4">
        <div className="col-span-1"></div>
        <div className="col-span-5 text-center">
          <div className="inline-block border-b-4 border-black px-6 py-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wider">
              শিক্ষার্থীদের সংক্ষিপ্ত তালিকা, শিক্ষাবর্ষ-২০২৫-২৬,
              শ্রেণী/জামাত-হিফজ(ক)
            </h2>
          </div>
        </div>
        <div className="col-span-1 flex justify-end">
          <p className="text-sm sm:text-base font-medium text-gray-600">
            প্রিন্ট তারিখ: {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* First Half Table */}
          <table className="min-w-full border border-black border-collapse bg-white">
            <thead className="bg-white">
              <tr className="text-center text-sm">
                <th className="border border-black px-2 py-1">ক্র:</th>
                <th className="border border-black px-2 py-1">দাখেলা</th>
                <th className="border border-black px-2 py-1">শিক্ষার্থীর নাম</th>
                <th className="border border-black px-2 py-1">পিতার নাম</th>
              </tr>
            </thead>
            <tbody>
              {firstHalf?.map((s, idx) => (
                <tr key={idx} className="text-center bg-white">
                  <td className="border border-black px-2 py-1 bg-white">
                    {idx + 1}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {s.StudentCode}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {bnBijoy2Unicode(s.StudentName)}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {bnBijoy2Unicode(s.FatherName)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Second Half Table */}
          <table className="min-w-full border border-black border-collapse bg-white">
            <thead className="bg-white">
              <tr className="text-center text-sm">
                <th className="border border-black px-2 py-1">ক্র:</th>
                <th className="border border-black px-2 py-1">দাখেলা</th>
                <th className="border border-black px-2 py-1">শিক্ষার্থীর নাম</th>
                <th className="border border-black px-2 py-1">পিতার নাম</th>
              </tr>
            </thead>
            <tbody>
              {secondHalf?.map((s, idx) => (
                <tr key={idx} className="text-center bg-white">
                  <td className="border border-black px-2 py-1 bg-white">
                    {mid + idx + 1}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {s.StudentCode}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {bnBijoy2Unicode(s.StudentName)}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white">
                    {bnBijoy2Unicode(s.FatherName)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsListTwoColumns;
