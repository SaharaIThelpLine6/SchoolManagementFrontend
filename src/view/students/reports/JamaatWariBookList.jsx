import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";

const JamaatWariBookList = ({reportData, SubClassID}) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  console.log(reportData);

 const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);



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
          <div className="text-black border-b-4 border-r-4 border-black border-solid px-4 py-1 inline-block mt-2 sm:mt-3 tracking-widest bg-white text-base font-bold sm:text-lg">
            মারহালা/ক্লাসওয়ারী কিতাবের নাম
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white my-3">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
         শ্রেণি/জামাত : {bnBijoy2Unicode(subClasData?.SubClass)}
        </div>
        <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
      </div>

      <div className="bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্রমিক নং</th>
              <th className="border border-black p-2 bg-white">
                কিতাবের বাংলা নাম
              </th>
              <th className="border border-black p-2 bg-white">
                কিতাবের আরবি নাম
              </th>
              <th className="border border-black p-2 bg-white">الصف</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {index + 1}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.SubjectName)}
                </td>
                <td
                  className="border border-black p-2 text-center bg-white"
                  dir="rtl"
                >
                  {bnBijoy2Unicode(row.ArabicSubject)}
                </td>
                <td
                  className="border border-black p-2 text-center bg-white"
                  dir="rtl"
                >
                  {row.SubSerial}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JamaatWariBookList;
