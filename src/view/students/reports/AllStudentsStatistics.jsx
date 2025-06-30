import React, { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../utils/conveter";

const AllStudentsStatistics = ({reportData}) => {
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
      id: "১",
      class: "১০০",
      male: { new: 1, old: 0, total: 1, remaining: 0, totalRemaining: 1 },
      female: { new: 0, old: 0, total: 0, remaining: 0, totalRemaining: 0 },
    },
    {
      id: "২",
      class: "বিজ্ঞান",
      male: { new: 7, old: 1, total: 8, remaining: 1, totalRemaining: 9 },
      female: { new: 1, old: 1, total: 2, remaining: 0, totalRemaining: 2 },
    },
    {
      id: "৩",
      class: "কিতাব খানা",
      male: { new: 1, old: 1, total: 2, remaining: 1, totalRemaining: 3 },
      female: { new: 0, old: 0, total: 0, remaining: 0, totalRemaining: 0 },
    },
    {
      id: "৪",
      class: "প্রথম শ্রেণী",
      male: { new: 4, old: 4, total: 8, remaining: 4, totalRemaining: 12 },
      female: { new: 0, old: 0, total: 0, remaining: 0, totalRemaining: 0 },
    },
    {
      id: "৫",
      class: "২য় শ্রেণী",
      male: { new: 1, old: 1, total: 2, remaining: 1, totalRemaining: 3 },
      female: { new: 0, old: 0, total: 0, remaining: 0, totalRemaining: 0 },
    },
    {
      id: "৬",
      class: "উল্লেখ",
      male: { new: "", old: "", total: "", remaining: "", totalRemaining: "" },
      female: {
        new: "",
        old: "",
        total: "",
        remaining: "",
        totalRemaining: "",
      },
    },
    {
      id: "৭",
      class: "উল্লেখ",
      male: { new: "", old: "", total: "", remaining: "", totalRemaining: "" },
      female: {
        new: "",
        old: "",
        total: "",
        remaining: "",
        totalRemaining: "",
      },
    },
    {
      id: "৮",
      class: "উল্লেখ",
      male: { new: "", old: "", total: "", remaining: "", totalRemaining: "" },
      female: {
        new: "",
        old: "",
        total: "",
        remaining: "",
        totalRemaining: "",
      },
    },
    {
      id: "৯",
      class: "উল্লেখ",
      male: { new: "", old: "", total: "", remaining: "", totalRemaining: "" },
      female: {
        new: "",
        old: "",
        total: "",
        remaining: "",
        totalRemaining: "",
      },
    },
    {
      id: "১০",
      class: "১০",
      male: { new: "", old: "", total: "", remaining: "", totalRemaining: "" },
      female: {
        new: "",
        old: "",
        total: "",
        remaining: "",
        totalRemaining: "",
      },
    },
    {
      id: "সর্বমোট:",
      class: "",
      male: { new: 14, old: 1, total: 15, remaining: 13, totalRemaining: 16 },
      female: { new: 1, old: 0, total: 1, remaining: 0, totalRemaining: 1 },
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
           
              <div className="text-black px-4 py-1 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
                শিক্ষাবর্ষ : 2025-26 Bs
              </div>
            </div>
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-end items-center mb-4 bg-white">
     
        <div className="bg-white">2025-26 Bs</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-center text-sm font-bangla">
          <thead className="bg-white">
            <tr>
              <th rowSpan="2" className="border px-3 py-2">
                ক্রমিক
              </th>
              <th rowSpan="2" className="border px-3 py-2">
                সারস্বত/শ্রেণী
              </th>
              <th colSpan="5" className="border px-3 py-2">
                ছাত্র
              </th>
              <th colSpan="5" className="border px-3 py-2">
                ছাত্রী
              </th>
            </tr>
            <tr>
              <th className="border px-3 py-2 bg-white">নতুন</th>
              <th className="border px-3 py-2 bg-white">পুরাতন</th>
              <th className="border px-3 py-2 bg-white">মোট</th>
              <th className="border px-3 py-2 bg-white">অবশিষ্ট</th>
              <th className="border px-3 py-2 bg-white">অবশিষ্ট মোট</th>
              <th className="border px-3 py-2 bg-white">নতুন</th>
              <th className="border px-3 py-2 bg-white">পুরাতন</th>
              <th className="border px-3 py-2">মোট</th>
              <th className="border px-3 py-2 bg-white">অবশিষ্ট</th>
              <th className="border px-3 py-2 bg-white">অবশিষ্ট মোট</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                  row.id === "সর্বমোট:" ? "font-bold bg-gray-200" : ""
                }`}
              >
                <td className="border px-3 py-2 bg-white">{row.id}</td>
                <td className="border px-3 py-2 bg-white text-left">{row.class}</td>

                {/* Male data */}
                <td className="border px-3 py-2 bg-white">{row.male.new}</td>
                <td className="border px-3 py-2 bg-white">{row.male.old}</td>
                <td className="border px-3 py-2 bg-white">{row.male.total}</td>
                <td className="border px-3 py-2 bg-white">{row.male.remaining}</td>
                <td className="border px-3 py-2 bg-white">
                  {row.male.totalRemaining || row.male.totalRemaining}
                </td>

                {/* Female data */}
                <td className="border px-3 py-2 bg-white">{row.female.new}</td>
                <td className="border px-3 py-2 bg-white">{row.female.old}</td>
                <td className="border px-3 py-2 bg-white">{row.female.total}</td>
                <td className="border px-3 py-2 bg-white">{row.female.remaining}</td>
                <td className="border px-3 py-2 bg-white">
                  {row.female.totalRemaining}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStudentsStatistics;
