import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const DipositeCostAllPaymentSystemDetails = ({ reportData, query }) => {
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
              সাধারণ ফান্ড এর রশিদ বই ভিত্তিক রিপোর্ট
            </div>
            <p className="text-end">রিপোর্ট প্রিন্ট তারিখ: 07/10/2025</p>
          </div>
        </div>
      </div>
      <div className="bg-white pt-8">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>


            <tr className="bg-white text-sm text-black">
              <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
              <th className="border border-black bg-white p-2 text-[20px]">রশিদ বই নং</th>
              <th className="border border-black bg-white p-2 text-[20px]">পাতা নং হতে</th>
              <th className="border border-black bg-white p-2 text-[20px]">পাতা নং পর্যন্ত</th>
              <th className="border border-black bg-white p-2 text-[20px]">টাকা</th>
            </tr>
          </thead>

          <tbody>
            {reportData.map((item, index) => (
              <tr key={item.FundID} className="text-black text-sm">
                <td className="border border-black p-2 text-[18px]">{index + 1}</td>
                <td className="border border-black p-2 text-[18px]">{item.BookNo}</td>
                <td className="border border-black p-2 text-[18px]">{item.MinVoucher}</td>
                <td className="border border-black p-2 text-[18px]">{item.MaxVoucher}</td>
                <td className="border border-black p-2 text-[18px]">{item.Amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DipositeCostAllPaymentSystemDetails;