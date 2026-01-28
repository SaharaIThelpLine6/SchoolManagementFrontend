import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const DipositeCostBookWiseVouture = ({ reportData, query }) => {
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
          <div className="flex items-center mt-2 justify-between w-full">
            <p>04/10/2025 n‡Z 04/10/2025 ch©šÍ</p>
            <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
              জমা-খরচ স্টেটমেন্ট ভাউচার ভিত্তিক
            </div>
            <p className="text-end">রিপোর্ট প্রিন্ট তারিখ: 07/10/2025</p>
          </div>
        </div>
      </div>

      <div className="bg-white pt-8">
        <table className="w-full border-collapse border border-black bg-white mb-8">
          <thead>
            <tr>
              <th
                colSpan={6}
                className="border border-black bg-[#d5d5d5] text-white p-2 text-[20px]"
              >
                {query.CAID == 1 ? "জমা" : "খরচ"}
              </th>
            </tr>
            <tr className="bg-white text-black">
              <th className="border border-black p-2 text-[20px]">ক্র:</th>
              <th className="border border-black p-2 text-[20px]">তারিখ</th>
              <th className="border border-black p-2 text-[20px]">ভাউচার</th>
              <th className="border border-black p-2 text-[20px]">সাব লেজার</th>
              <th className="border border-black p-2 text-[20px]">বিবরন</th>
              <th className="border border-black p-2 text-[20px]">পরিমান</th>
            </tr>
          </thead>

          <tbody>
            {reportData?.map((group, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td colSpan={6} className="py-2 px-1 border border-black text-[20px] bg-white">
                     জেনারেল লেজার: {group.GlName}
                  </td>
                </tr>
                {group.detailsInfo.map((detail, i) => (
                  <tr key={i}>
                    <td className="text-[16px] py-2 px-1 border border-black text-center bg-white">{i + 1}</td>
                    <td className="text-[16px] py-2 px-1 border border-black bg-white">{detail.TransactionDateEng}</td>
                    <td className="text-[16px] py-2 px-1 border border-black bg-white">{detail.VoucherNo}</td>
                    <td className="text-[16px] py-2 px-1 border border-black bg-white">{detail.SlName}</td>
                    <td className="text-[16px] py-2 px-1 border border-black bg-white">{detail.Particulars}</td>
                    <td className="text-[16px] py-2 px-1 border border-black bg-white">{detail.Amount}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}


          </tbody>
        </table>

        
      </div>
    </div>
  );
};

export default DipositeCostBookWiseVouture;