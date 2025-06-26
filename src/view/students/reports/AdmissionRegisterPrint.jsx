import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const AdmissionRegisterPrint = () => {
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

  return (
    <div className="relative z-10 sm:px-20 sm:py-16 px-8 py-5  bg-white">
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
          <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
            ভর্তি রেজিস্টার : 2025-26 Bs
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত : কিতাব খানা
        </div>
        <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
      </div>

      <div className="bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্র:</th>
              <th className="border border-black p-2 bg-white">দাখেলা</th>
              <th className="border border-black p-2 bg-white">
                শিক্ষার্থীর নাম
              </th>
              <th className="border border-black p-2 bg-white">পিতার নাম</th>
              <th className="border border-black p-2 bg-white">মাতার নাম</th>
              <th className="border border-black p-2 bg-white">জন্ম তারিখ</th>
              <th className="border border-black p-2 bg-white">রক্তের গ্রুপ</th>
              <th className="border border-black p-2 bg-white">
                মোবাইল
              </th>
              <th className="border border-black p-2 bg-white">গ্রাম</th>
              <th className="border border-black p-2 bg-white">ডাক </th>
              <th className="border border-black p-2 bg-white">থানা</th>
              <th className="border border-black p-2 bg-white">জেলা</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.roll}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.studentName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.fatherName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.motherName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.dob}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.bloodGroup}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.mobile}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.village}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.postOffice}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.thana}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.district}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdmissionRegisterPrint;
