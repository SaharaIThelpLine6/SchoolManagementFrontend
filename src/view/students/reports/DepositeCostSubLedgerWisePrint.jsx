import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const DepositeCostSubLedgerWisePrint = ({ reportData, query }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    console.log(query);

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


  const totalIncome = reportData["1"]?.reduce((sum, row) => sum + Number(row.Amount || 0), 0) || 0;
  const totalExpense = reportData["2"]?.reduce((sum, row) => sum + Number(row.Amount || 0), 0) || 0;
  const surplus = totalIncome - totalExpense;

  return (
    <div className="font-bangla  p-4 bg-white text-xs">

      <div className="bg-white">
        {/* Title Section */}
        <div className="text-center w-full bg-white">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
            জমা-খরচ লেজার ভিত্তিক
          </div>
          <div className="flex items-center mt-2 justify-between w-full">
            <p>04/10/2025 n‡Z 04/10/2025 ch©šÍ</p>
            <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
              {query?.FundID == 1 ? "সাধারণ ফান্ড" : "গোরাবা ফান্ড"}
            </div>
            <p className="text-end">রিপোর্ট প্রিন্ট তারিখ: 07/10/2025</p>
          </div>
        </div>

        {/* Optional right-aligned blank space */}
      </div>



      {Object.keys(reportData).map((key) => (
        <div className="bg-white pt-8">
          <table className="w-full border-collapse border border-black bg-white">
            <thead>
              <tr className="bg-white text-sm text-black">
                <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
                <th className="border border-black bg-white p-2 text-[20px]">জেনারেল লেজার</th>
                <th className="border border-black bg-white p-2 text-[20px]">পরিমান</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="w-[15%] p-2"></td>
                <td className="text-center w-[70%] p-2 text-[18px] font-bold">{reportData[key][0]["ChartOfAcName"]}</td>
                <td className="w-[15%] p-2"></td>

              </tr>
              {reportData[key]?.map((row, index) => (
                <tr key={index} className="bg-white">
                  <td className="border border-black text-center bg-white w-[15%] p-2 text-[18px]">
                    {index + 1}
                  </td>
                  <td className="border border-black text-center bg-white w-[70%] p-2 text-[18px]">
                    {row.SlName}
                  </td>
                  <td className="border border-black text-center bg-white w-[15%] p-2 text-[18px]">
                    {row.Amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <table className="w-[300px] border-collapse border border-black bg-white mt-4 ms-auto">
        <tbody>
          <tr>
            <td className="text-[18px] p-2 border-r border-t border-black">সর্বমোট জমা =</td>
            <td className="text-[18px] p-2 border-r border-t border-black">{totalIncome}</td>
          </tr>
          <tr>
            <td className="text-[18px] p-2 border-r border-t border-black">সর্বমোট খরচ =</td>
            <td className="text-[18px] p-2 border-r border-t border-black">{totalExpense}</td>
          </tr>
          <tr>
            <td className="text-[18px] p-2 border-r border-t border-black">উদ্বৃত্ত =</td>
            <td className="text-[18px] p-2 border-r border-t border-black">{surplus}</td>
          </tr>
        </tbody>
      </table>



    </div>
  );
};

export default DepositeCostSubLedgerWisePrint;