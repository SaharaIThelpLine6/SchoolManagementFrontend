import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const DepositeCostStatementVoucharWisePrint = ({ reportData, query }) => {
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
            জমা-খরচ স্টেটমেন্ট ভাউচার ভিত্তিক
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
              <tr>
                <th className="bg-[#e2e2e2]"></th>
                <th className="text-center w-[70%] p-2 text-[18px] font-bold bg-[#e2e2e2] text-white">{reportData[key] == 1 ? "Diposit" : "cost"}</th>
                <th className="bg-[#e2e2e2]"></th>
              </tr>
              <tr className="bg-white text-sm text-black">
                <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
                <th className="border border-black bg-white p-2 text-[20px]">জেনারেল লেজার</th>
                <th className="border border-black bg-white p-2 text-[20px]">পরিমান</th>
              </tr>
            </thead>


            <tbody>
              {Object.keys(reportData[key]).map((glKey) => (
                <React.Fragment key={glKey}>
                  {/* GLID header row */}
                  <tr>
                    <td></td>
                    <td className="text-center font-bold text-[18px] p-2">
                      {reportData[key][glKey][0]["GlName"]}
                    </td>
                    <td></td>

                  </tr>
                  {reportData[key][glKey].map((val, ind) => (
                    <tr key={ind}>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">
                        {ind + 1}
                      </td>
                      <td className="bg-[#fff] border border-black text-left p-2 text-[18px]">
                        {val.SlName}
                      </td>
                      <td className="bg-[#fff] border border-black text-right p-2 text-[18px]">
                        {val.Amount ?? 0}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ))}



    </div>
  );
};

export default DepositeCostStatementVoucharWisePrint;