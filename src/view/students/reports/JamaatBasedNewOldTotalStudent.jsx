import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const JamaatBasedNewOldTotalStudent = () => {
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

  const tableData = [
    {
      sl: "০১",
      roll: "১০০০১",
      studentName: "রহিম উদ্দিন",
      fatherName: "মোঃ আবুল কালাম",
      motherName: "রোকেয়া বেগম",
      dob: "০১/০১/২০১০",
      bloodGroup: "বি+",
      mobile: "০১৭১২৩৪৫৬৭৮",
      village: "বড়ইতলী",
      postOffice: "রাঙ্গাবালী",
      thana: "গলাচিপা",
      district: "পটুয়াখালী",
    },
    {
      sl: "০২",
      roll: "১০০০২",
      studentName: "সাব্বির হোসেন",
      fatherName: "জাকির হোসেন",
      motherName: "নাসরিন আক্তার",
      dob: "১৫/০৩/২০১১",
      bloodGroup: "এ+",
      mobile: "০১৯১২৩৪৫৬৭৮",
      village: "পূর্ব টাকেশ্বর",
      postOffice: "কালিগঞ্জ",
      thana: "সাতক্ষীরা সদর",
      district: "সাতক্ষীরা",
    },
  ];

  const totalNew = tableData.reduce((sum, item) => sum + item.new, 0);
  const totalOld = tableData.reduce((sum, item) => sum + item.old, 0);
  const total = totalNew + totalOld;

  return (
    <div className="relative z-10 sm:px-20 sm:py-16 px-8 py-5  bg-white w-full">
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
          <p className="text-base font-semibold bg-white">
            {instutionInfo?.ContactNumber}
          </p>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="grid grid-cols-5 items-center mb-4 bg-white px-4 py-2">
        {/* Empty spacer column */}
        <div className="col-span-1"></div>

        {/* Main title */}
        <div className="col-span-3 text-center">
          <div className="inline-block border-b-4 border-black px-4 py-1">
            <span className="text-black font-bold text-base sm:text-lg md:text-xl tracking-wider">
              শিক্ষাবর্ষ : ২০২৫-২৬
            </span>
          </div>
        </div>

        {/* Print date */}
        <div className="col-span-1 flex justify-end">
          <span className="text-black font-medium text-xs sm:text-sm md:text-base">
            প্রিন্ট: {new Date().toLocaleDateString("bn-BD")}
          </span>
        </div>
      </div>

      <div className="bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 w-[100px] bg-white">
                ক্রমিক নং
              </th>
              <th className="border border-black p-2 w-[250px] bg-white">
                শ্রেণীর/জামাত
              </th>
              <th className="border border-black p-2 w-[200px] bg-white">
                নতুন শিক্ষার্থী
              </th>
              <th className="border border-black p-2 w-[200px] bg-white">
                পুরাতন শিক্ষার্থী
              </th>
              <th className="border border-black p-2 w-[200px] bg-white">
                মোট শিক্ষার্থী
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center w-[100px] bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center w-[250px] bg-white">
                  {row.roll}
                </td>
                <td className="border border-black p-2 text-center w-[200px] bg-white">
                  {row.studentName}
                </td>
                <td className="border border-black p-2 text-center w-[200px] bg-white">
                  {row.fatherName}
                </td>
                <td className="border border-black p-2 text-center w-[200px] bg-white">
                  {row.motherName}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-white font-bold">
              <td className="border border-black p-2 text-center" colSpan={2}>
                মোট শিক্ষার্থী
              </td>
              <td className="border border-black p-2 text-center">10</td>
              <td className="border border-black p-2 text-center">5</td>
              <td className="border border-black p-2 text-center">15</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JamaatBasedNewOldTotalStudent;
