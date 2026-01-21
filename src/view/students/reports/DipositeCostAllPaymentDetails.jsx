import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const DipositeCostAllPaymentDetails = ({ reportData, query }) => {
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

  // const totals = Object.entries(reportData).reduce(
  //   (acc, [fundId, fund]) => {
  //     const id = Number(fundId);
  //     if (id === 1) acc.deposit += fund.grandTotal;
  //     else if (id === 2) acc.expense += fund.grandTotal;

  //     return acc;
  //   },
  //   { deposit: 0, expense: 0 }
  // );

  // const surplus = totals.deposit - totals.expense;
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

          <h2></h2>
        </div>
      </div>


      <div className="bg-white pt-8">

        {reportData && reportData.map((chartOfAc, fundIndex) => (
          <table
            key={`chart_of_ac${chartOfAc.CAID}`}
            className="w-full border-collapse border border-black bg-white mb-8"
          >
            <thead>
              <tr>
                <th
                  colSpan={6}
                  className="border border-black bg-[#d5d5d5] text-white p-2 text-[20px]"
                >
                  {chartOfAc.ChartOfAcName}
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
              {chartOfAc.users.map((userInfo, UserIndex) => (
                <React.Fragment key={`user_${userInfo.UserID}`}>
                  <tr>
                    <td colSpan={6} className="text-center text-[20px] py-3">
                      <span className="border-b-4 border-double border-black pb-1">
                        পেমেন্ট মাধ্যম : {userInfo.UserName}
                      </span>
                    </td>
                  </tr>
                  {
                    userInfo.gls.map((ledger) => 
                      (<React.Fragment key={`gl_${ledger.GLID}`}>
                        <tr>
                          <td colSpan={6} className="text-center text-[20px] py-3">
                            <span className="border-b-4 border-double border-black pb-1">
                              পেমেন্ট মাধ্যম : {ledger.GlName}
                            </span>
                          </td>
                        </tr>
                        {ledger.transactions.map((t, k) => (
                          <tr key={k}>
                            <td className="border border-black text-center text-[16px] py-4">{k + 1}</td>
                            <td className="border border-black text-[16px] py-4 px-2">{t.TransactionDateEng}</td>
                            <td className="border border-black text-[16px] py-4 px-2">{t.VoucherNo}</td>
                            <td className="border border-black text-[16px] py-4 px-2">{t.SlName}</td>
                            <td className="border border-black text-[16px] py-4 px-2 w-[200px] leading-[24px]">{t.Particulars}</td>
                            <td className="border border-black text-end text-[16px] py-4 px-2">{t.PamantAmount}</td>
                          </tr>
                        ))}
                      </React.Fragment>)
                    )
                  }
                </React.Fragment>
              ))}
              {/* Grand Total */}
              <tr>
                <td colSpan={6} className="text-end font-bold py-2">
                  মোট: 
                </td>
              </tr>
            </tbody>

          </table>
        ))}

        {/* <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black  bg-[#d5d5d5] text-white p-2 text-[20px]" colSpan={6}>জমা</th>
            </tr>


            <tr className="bg-white text-sm text-black">
              <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
              <th className="border border-black bg-white p-2 text-[20px]">তারিখ</th>
              <th className="border border-black bg-white p-2 text-[20px]">ভাউচার</th>
              <th className="border border-black bg-white p-2 text-[20px]">সাব লেজার</th>
              <th className="border border-black bg-white p-2 text-[20px]">বিবরন</th>
              <th className="border border-black bg-white p-2 text-[20px]">পরিমান</th>
            </tr>

          </thead>

          <tbody>
            <tr>
              <td colSpan={6} className="text-center text-[20px] py-3 border-b border-transparent"> <span className="border-b-4 border-double border-[#000] pb-1">পেমেন্ট মাধ্যম : মঈনুল ইসলাম</span> </td>
            </tr>
            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : শিক্ষার্থীর মাধ্যম</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : মাহফিল</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border-b border-b-transparent text-end bg-white font-bold"> মোট: 4000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-center text-[20px] py-3 border-b border-transparent"> <span className="border-b-4 border-double border-[#000] pb-1"> পেমেন্ট মাধ্যম : ডাচ-বাংলা ব্যাংক </span> </td>
            </tr>

            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : মাহফিল</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">100</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border-b border-b-transparent text-end bg-white font-bold"> মোট: 100</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border border-transparent text-end bg-white font-bold"> মোট: 4100</td>
            </tr>

          </tbody>

        </table>


        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black  bg-[#d5d5d5] text-white p-2 text-[20px]" colSpan={6}>খরচ</th>
            </tr>


            <tr className="bg-white text-sm text-black">
              <th className="border border-black  bg-white p-2 text-[20px]">ক্র:</th>
              <th className="border border-black bg-white p-2 text-[20px]">তারিখ</th>
              <th className="border border-black bg-white p-2 text-[20px]">ভাউচার</th>
              <th className="border border-black bg-white p-2 text-[20px]">সাব লেজার</th>
              <th className="border border-black bg-white p-2 text-[20px]">বিবরন</th>
              <th className="border border-black bg-white p-2 text-[20px]">পরিমান</th>
            </tr>

          </thead>

          <tbody>
            <tr>
              <td colSpan={6} className="text-center text-[20px] py-3 border-b border-transparent"> <span className="border-b-4 border-double border-[#000] pb-1">পেমেন্ট মাধ্যম : মঈনুল ইসলাম</span> </td>
            </tr>
            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : শিক্ষার্থীর মাধ্যম</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : মাহফিল</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border-b border-b-transparent text-end bg-white font-bold"> মোট: 2000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-center text-[20px] py-3 border-b border-transparent"> <span className="border-b-4 border-double border-[#000] pb-1"> পেমেন্ট মাধ্যম : ডাচ-বাংলা ব্যাংক </span> </td>
            </tr>

            <tr>
              <td colSpan={6} className="px-2 bg-white text-[18px] pt-2 pb-1">জেনারেল লেজার : মাহফিল</td>
            </tr>
            <tr>
              <td className="text-[16px] py-2 px-1 border border-black text-center">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">12/10/2025</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">1</td>
              <td className="text-[16px] py-2 px-1 border border-black">100 Taka; </td>
              <td className="text-[16px] py-2 px-1 border border-black">1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border-b border-b-transparent text-end bg-white font-bold"> মোট: 1000</td>
            </tr>
            <tr>
              <td colSpan={6} className="text-[16px] py-2 px-2 border border-transparent text-end bg-white font-bold"> মোট: 3000</td>
            </tr>

          </tbody>
        </table> */}
      </div>

      <div className="border border-1 border-black p-2 w-[250px] ms-auto mt-6">
        <table className="w-full">
          <tbody>
            <tr>
              <th className="text-[16px] font-bold py-2 bg-white border border-transparent text-end">
                সর্বমোট জমা =
              </th>
              <td className="text-[16px] text-end border border-transparent bg-white">
                {/* {totals.deposit} */}
              </td>
            </tr>
            <tr>
              <th className="text-[16px] font-bold py-2 bg-white border border-transparent text-end">
                সর্বমোট খরচ =
              </th>
              <td className="text-[16px] text-end border border-transparent bg-white">
                {/* {totals.expense} */}
              </td>
            </tr>
            <tr>
              <th className="border-t-2 border-black text-[16px] font-bold py-2 bg-white text-end">
                উদ্বৃত্ত =
              </th>
              <td className="border-t-2 border-black text-[16px] text-end bg-white">
                {/* {surplus} */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>





    </div>
  );
};

export default DipositeCostAllPaymentDetails;