import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const AdmissionRegisterPrint = ({ reportData }) => {
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

  // Get the first item's session and class info to display in header
  const firstItem = reportData?.[0];
  const sessionName = firstItem?.SessionName || "2025-26 Bs";
  const className = firstItem?.ClassName || "কিতাব খানা";
  const subClassName = firstItem?.SubClass || "";

  return (
    <div className="font-bangla  p-4 bg-white text-xs">
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
            ভর্তি রেজিস্টার : {bnBijoy2Unicode(sessionName)}
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত : {bnBijoy2Unicode(className)}
          {subClassName && ` (${bnBijoy2Unicode(subClassName)})`}
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
              <th className="border border-black p-2 bg-white">মোবাইল</th>
              <th className="border border-black p-2 bg-white">গ্রাম</th>
              <th className="border border-black p-2 bg-white">ডাক</th>
              <th className="border border-black p-2 bg-white">থানা</th>
              <th className="border border-black p-2 bg-white">জেলা</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {index + 1}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.StudentCode}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.StudentName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.FatherName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.MotherName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(formatToDDMMYYYY(row.DateOfBirth))}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.BloodGroup}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.Mobile1}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.permanentVill)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.permanentPost)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.PoliceStationName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
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

export default AdmissionRegisterPrint;
