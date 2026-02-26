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
  const totals = Object.entries(reportData).reduce(
    (acc, [fundId, fund]) => {
      const id = Number(fundId);
      if (id === 1) acc.deposit += fund.grandTotal;
      else if (id === 2) acc.expense += fund.grandTotal;

      return acc;
    },
    { deposit: 0, expense: 0 }
  );

  const surplus = totals.deposit - totals.expense;
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

        {Object.values(reportData).map((fund, fundIndex) => (
          <table
            key={fundIndex}
            className="w-full border-collapse border border-black bg-white mb-8"
          >
            <thead>
              <tr>
                <th
                  colSpan={7}
                  className="border border-black bg-[#d5d5d5] text-white p-2 text-[20px]"
                >
                  {fund.title}
                </th>
              </tr>
              <tr className="bg-white text-black">
                <th className="border border-black p-2 text-[20px]">ক্র:</th>
                <th className="border border-black p-2 text-[20px]">তারিখ</th>
                <th className="border border-black p-2 text-[20px]">ভাউচার</th>
                <th className="border border-black p-2 text-[20px]">বই</th>
                <th className="border border-black p-2 text-[20px]">সাব লেজার</th>
                <th className="border border-black p-2 text-[20px]">বিবরন</th>
                <th className="border border-black p-2 text-[20px]">পরিমান</th>
              </tr>
            </thead>

            <tbody>
              {fund.paymentMediums.map((medium, i) => (
                <React.Fragment key={i}>
   
                  {medium.ledgers.map((ledger, j) => (
                    <React.Fragment key={j}>
                      <tr>
                        <td
                          colSpan={6}
                          className="px-2 bg-white text-[18px] pt-2 pb-1"
                        >
                          জেনারেল লেজার : {ledger.name}
                        </td>
                      </tr>
                      {ledger.transactions.map((t, k) => (
                        <tr key={k}>
                          <td className="text-[16px] py-2 px-1 border border-black text-center">
                            {t.serial}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black">
                            {t.date}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black">
                            {t.voucher}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black">
                            {t.book}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black">
                            {t.subLedger}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black">
                            {t.description}
                          </td>
                          <td className="text-[16px] py-2 px-1 border border-black text-end">
                            {t.amount}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}

                  <tr>
                    <td
                      colSpan={6}
                      className="text-[16px] py-2 px-2 border-b border-b-transparent text-end bg-white font-bold"
                    >
                      মোট: {medium.subtotal}
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* Grand total per fund */}
              <tr>
                <td
                  colSpan={6}
                  className="text-[16px] py-2 px-2 border border-transparent text-end bg-white font-bold"
                >
                  মোট: {fund.grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        ))}

        <div className="border border-1 border-black p-2 w-[250px] ms-auto mt-6">
          <table className="w-full">
            <tbody>
              <tr>
                <th className="text-[16px] font-bold py-2 bg-white border border-transparent text-end">
                  সর্বমোট জমা =
                </th>
                <td className="text-[16px] text-end border border-transparent bg-white">
                  {totals.deposit}
                </td>
              </tr>
              <tr>
                <th className="text-[16px] font-bold py-2 bg-white border border-transparent text-end">
                  সর্বমোট খরচ =
                </th>
                <td className="text-[16px] text-end border border-transparent bg-white">
                  {totals.expense}
                </td>
              </tr>
              <tr>
                <th className="border-t-2 border-black text-[16px] font-bold py-2 bg-white text-end">
                  উদ্বৃত্ত =
                </th>
                <td className="border-t-2 border-black text-[16px] text-end bg-white">
                  {surplus}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DipositeCostBookWiseVouture;