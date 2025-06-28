import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const FinancialStatusBasedStatistics = ({reportData}) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  console.log(reportData);


  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  const bookData = [
    { sl: "১", className: "নূরানী", solvent: "১০", orphan: "২", poor: "৩", helpless: "১", total: "১৬" },
    { sl: "২", className: "তাজবিদ", solvent: "৫", orphan: "১", poor: "২", helpless: "০", total: "৮" },
    { sl: "৩", className: "হিফজ", solvent: "৪", orphan: "২", poor: "৩", helpless: "১", total: "১০" },
    { sl: "৪", className: "দাওরায়ে হাদিস", solvent: "৬", orphan: "০", poor: "২", helpless: "১", total: "৯" },
  ];

  const total = {
    sl: "সর্বমোট",
    className: "",
    solvent: "২৫",
    orphan: "৫",
    poor: "১০",
    helpless: "৩",
    total: "৪৩",
  };

  return (
    <div className="relative z-10 sm:px-20 sm:py-16 px-8 py-5 bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
        </div>
        <div className="text-center flex-1 bg-white">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border-b-4 border-r-4 border-black px-4 py-1 inline-block mt-2 sm:mt-3 tracking-widest bg-white text-base font-bold sm:text-lg">
            শ্রেণী ভিত্তিক আর্থিক অবস্থা রিপোর্ট
          </div>
        </div>
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      {/* Info row */}
      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="font-semibold text-base bg-white">শিক্ষাবর্ষ: ২০২৫-২৬</div>
        <div className="bg-white">প্রিন্ট: {formatDate(new Date())}</div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-black bg-white text-sm">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-black p-2 bg-white">ক্রমিক নং</th>
              <th className="border border-black p-2 bg-white min-w-[200px]">
                শ্রেণী/জামাত
              </th>
              <th className="border border-black p-2 bg-white">সচ্ছল</th>
              <th className="border border-black p-2 bg-white">এতিম</th>
              <th className="border border-black p-2 bg-white">গরিব</th>
              <th className="border border-black p-2 bg-white">অসহায়</th>
              <th className="border border-black p-2 bg-white">মোট</th>
            </tr>
          </thead>
          <tbody>
            {bookData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.className}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.solvent}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.orphan}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.poor}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.helpless}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.total}
                </td>
              </tr>
            ))}
            <tr className="bg-white font-bold">
              <td colSpan="2" className="border border-black p-2 text-center bg-white">
                সর্বমোট
              </td>
              <td className="border border-black p-2 text-center bg-white">{total.solvent}</td>
              <td className="border border-black p-2 text-center bg-white">{total.orphan}</td>
              <td className="border border-black p-2 text-center bg-white">{total.poor}</td>
              <td className="border border-black p-2 text-center bg-white">{total.helpless}</td>
              <td className="border border-black p-2 text-center bg-white">{total.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialStatusBasedStatistics;
