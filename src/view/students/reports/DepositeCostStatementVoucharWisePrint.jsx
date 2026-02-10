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



      {reportData && reportData.length > 0 && reportData.map((CaidDetails) => (
        <div className="bg-white pt-8" key={CaidDetails.CAID}>
          <table className="w-full border-collapse border border-black bg-white">
            <thead>
              <tr>
                <th className="text-center w-[70%] p-2 text-[18px] font-bold bg-[#e2e2e2] text-white" colSpan={7}>{CaidDetails.CAID == 1 ? "জমা" : "খরচ"}</th>
              </tr>
              <tr className="bg-white text-sm text-black">
                <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
                <th className="border border-black  bg-white p-2 text-[20px]">তারিখ</th>
                <th className="border border-black  bg-white p-2 text-[20px]">ভাউচার</th>
                <th className="border border-black  bg-white p-2 text-[20px]">সাব লেজার</th>
                <th className="border border-black  bg-white p-2 text-[20px]">বিবরণ</th>
                <th className="border border-black  bg-white p-2 text-[20px]">পরিমাণ</th>
              </tr>
            </thead>


            <tbody>

              {CaidDetails?.Details && CaidDetails?.Details.length > 0 && CaidDetails.Details.map((glDetails) => (
                <React.Fragment key={glDetails.GLID}>
                  <tr>
                    <td className="text-center font-bold text-[18px] p-2"  colSpan={7}>
                      {glDetails.GlName}
                    </td>

                  </tr>
                  {glDetails?.subledgerDetails && glDetails.subledgerDetails.length > 0 && glDetails.subledgerDetails.map((val, index) => (
                    <tr key={index}>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{index + 1}</td>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{val.TransactionDateEng}</td>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{val.VoucherNo}</td>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{val.SlName}</td>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{val.Particulars}</td>
                      <td className="bg-[#fff] border border-black text-center p-2 text-[18px]">{val.payerAmount}</td>
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