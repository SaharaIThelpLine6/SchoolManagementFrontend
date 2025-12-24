import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const FinancialStatusBasedAdmissionRegister = ({ reportData }) => {
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

  return (
    <div className="font-bangla max-w-5xl mx-auto p-4 bg-white text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          {logo && <img src={logo} alt="Logo" className="w-20 h-20" />}
        </div>

        {/* Title Section */}
        <div className="text-center flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest text-base font-bold sm:text-lg">
            ভর্তি রেজিস্টার :{' '}
            {reportData?.[0]?.SessionName
              ? bnBijoy2Unicode(reportData[0].SessionName)
              : ''}
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 font-semibold text-base items-center">
          শ্রেণী/জামাত:{' '}
          {reportData?.[0]?.ClassName
            ? bnBijoy2Unicode(reportData[0].ClassName)
            : ''}
        </div>
        <div>প্রিন্ট {formatDate(new Date())}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2">ক্র:</th>
              <th className="border border-black p-2">দাখেলা</th>
              <th className="border border-black p-2">শিক্ষার্থীর নাম</th>
              <th className="border border-black p-2">পিতার নাম</th>
              <th className="border border-black p-2">মাতার নাম</th>
              <th className="border border-black p-2">জন্ম তারিখ</th>
              <th className="border border-black p-2">রক্তের গ্রুপ</th>
              <th className="border border-black p-2">আর্থিক অবস্থা</th>
              <th className="border border-black p-2">মোবাইল</th>
              <th className="border border-black p-2">জেলা</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-black p-2 text-center">
                  {row.StudentCode}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(row.StudentName)}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(row.FatherName)}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(row.MotherName)}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(formatToDDMMYYYY(row.DateOfBirth))}
                </td>
                <td className="border border-black p-2 text-center">
                  {row.BloodGroup || ''}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(row.ResidentialName)}
                </td>
                <td className="border border-black p-2 text-center">
                  {row.Mobile1 || ''}
                </td>
                <td className="border border-black p-2 text-center">
                  {bnBijoy2Unicode(row.PermanentDistrictName)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialStatusBasedAdmissionRegister;
