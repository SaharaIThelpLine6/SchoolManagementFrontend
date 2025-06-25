import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const ParentsMobileNumberList = () => {
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

  const tableData = [
    {
      sl: "০১",
      roll: "১০০০১",
      studentName: "রহিম উদ্দিন",
      fatherName: "মোঃ আবুল কালাম",
      motherName: "রোকেয়া বেগম",
      mobile1: "০১৭৫০৯১০১৮",
      mobile2: "০১৭৫৬৮৯৪২৩১",
      mobile1Relation: "বাবা",
      mobile2Relation: "বোন",
    },
    {
      sl: "০২",
      roll: "১০০০২",
      studentName: "সাব্বির হোসেন",
      fatherName: "জাকির হোসেন",
      motherName: "নাসরিন আক্তার",
      mobile1: "০১৯১২৩৪৫৬৭৮",
      mobile2: "০১৮১২৩৪৫৬৭৮",
      mobile1Relation: "বাবা",
      mobile2Relation: "ভাই",
    },
    {
      sl: "০৩",
      roll: "১০০০৩",
      studentName: "আনিকা তাবাসসুম",
      fatherName: "মোঃ রফিকুল ইসলাম",
      motherName: "আফসানা বেগম",
      mobile1: "০১৭৯৮৭৬৫৪৩২",
      mobile2: "০১৯৮৭৬৫৪৩২১",
      mobile1Relation: "বাবা",
      mobile2Relation: "মা",
    },
    {
      sl: "০৪",
      roll: "১০০০৪",
      studentName: "আরাফাত রহমান",
      fatherName: "মোঃ জাহিদ হাসান",
      motherName: "শারমিন আক্তার",
      mobile1: "০১৮১২৩৪৫৬৭৯",
      mobile2: "০১৭৯৮৭৬৫৪৩১",
      mobile1Relation: "বাবা",
      mobile2Relation: "চাচা",
    },
    {
      sl: "০৫",
      roll: "১০০০৫",
      studentName: "ফারহানা ইয়াসমিন",
      fatherName: "মোঃ সেলিম রেজা",
      motherName: "নাসিমা আক্তার",
      mobile1: "০১৯১১২২৩৩৪৪",
      mobile2: "০১৭২২৩৩৪৪৫৫",
      mobile1Relation: "বাবা",
      mobile2Relation: "ফুফু",
    },
    {
      sl: "০৬",
      roll: "১০০০৬",
      studentName: "ইমরান হোসেন",
      fatherName: "মোঃ শফিকুল ইসলাম",
      motherName: "শাহিনা বেগম",
      mobile1: "০১৮৭৬৫৪৩২১০",
      mobile2: "০১৭৬৫৪৩২১০৯",
      mobile1Relation: "বাবা",
      mobile2Relation: "দাদা",
    },
    {
      sl: "০৭",
      roll: "১০০০৭",
      studentName: "তাসনিমা আক্তার",
      fatherName: "মোঃ কামরুল হাসান",
      motherName: "নাজমা আক্তার",
      mobile1: "০১৯৮৮৭৭৬৬৫৫",
      mobile2: "০১৭৭৬৬৫৫৪৪৩",
      mobile1Relation: "বাবা",
      mobile2Relation: "খালা",
    },
    {
      sl: "০৮",
      roll: "১০০০৮",
      studentName: "রায়ান আহমেদ",
      fatherName: "মোঃ সাকিব আলম",
      motherName: "সুমাইয়া আক্তার",
      mobile1: "০১৮৯৯৮৮৭৭৬৬",
      mobile2: "০১৭৮৮৭৭৬৬৫৫",
      mobile1Relation: "বাবা",
      mobile2Relation: "মামা",
    },
    {
      sl: "০৯",
      roll: "১০০০৯",
      studentName: "জারিন তাসলিম",
      fatherName: "মোঃ আলমগীর হোসেন",
      motherName: "ফারজানা আক্তার",
      mobile1: "০১৯২২৩৩৪৪৫৫",
      mobile2: "০১৭৩৩৪৪৫৫৬৬",
      mobile1Relation: "বাবা",
      mobile2Relation: "চাচী",
    },
    {
      sl: "১০",
      roll: "১০০১০",
      studentName: "আদনান কবির",
      fatherName: "মোঃ রাশেদুল ইসলাম",
      motherName: "সাবিনা ইয়াসমিন",
      mobile1: "০১৮৭৭৬৬৫৫৪৪",
      mobile2: "০১৭৬৬৫৫৪৪৩৩",
      mobile1Relation: "বাবা",
      mobile2Relation: "ভাই",
    },
  ];

  return (
    <div className="relative z-10 sm:px-20 sm:py-16 px-8 py-5  bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
        </div>

        {/* Title Section */}
        <div className="text-center flex-1 bg-white">
          <div className="text-center flex-1 bg-white">
            <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
              {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
            </h1>
            <p className="text-base font-semibold bg-white">
              {bnBijoy2Unicode(instutionInfo?.Address)}
            </p>

            {/* এখানে flex-col wrapper */}
            <div className="flex flex-col items-center gap-2 ">
              <div className="text-black px-4 py-1 boder border-b border-black rounded tracking-widest bg-white text-base font-bold sm:text-lg">
                অভিভাবকের মোবাইল
              </div>
              <div className="text-black px-4 py-1 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
                শিক্ষাবর্ষ : 2025-26 Bs
              </div>
            </div>
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত : কিতাব খানা
        </div>
        <div className="bg-white">2025-26 Bs</div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্র:</th>
              <th className="border border-black p-2 bg-white">দাখেলা</th>
              <th className="border border-black p-2 bg-white">
                শিক্ষার্থীর নাম
              </th>
              <th className="border border-black p-2 bg-white">পিতার নাম</th>
              <th className="border border-black p-2 bg-white">মোবাইল ১</th>
              <th className="border border-black p-2 bg-white">সম্পর্ক</th>
              <th className="border border-black p-2 bg-white">মোবাইল ২</th>
              <th className="border border-black p-2 bg-white">সম্পর্ক</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.roll}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.studentName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.fatherName}
                </td>
                <td className="border border-black p-2 text-center bg-white" colSpan={2}>
                  {row.mobile1} {"--->"} {row.mobile1Relation}
                </td>
              
                <td className="border border-black p-2 text-center bg-white" colSpan={2}>
                  {row.mobile2}  {"--->"} {row.mobile2Relation}
                </td>
              
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentsMobileNumberList;
