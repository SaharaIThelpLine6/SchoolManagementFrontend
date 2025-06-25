import React from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";

const StudentsListTwoColumns = () => {
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  const students = [
    {
      sl: "১",
      roll: "১০০০১",
      name: "সাকিব আল হাসান",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "২",
      roll: "১০০০২",
      name: "শেখ হাসিনা",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৩",
      roll: "১০০০৩",
      name: "শেখ কামাল",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৪",
      roll: "১০০০৫",
      name: "নাসির ভাই",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৫",
      roll: "১০০০৬",
      name: "তানভীর",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৬",
      roll: "১০০০৮",
      name: "খালেদুল্লাহ লব্ধরক্ষ",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৭",
      roll: "১০১০১",
      name: "ইমন",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৮",
      roll: "১০১০২",
      name: "গিয়াস",
      father: "মোঃ গাজী সালা উদ্দিন",
      dob: "১১/০১/২০০৪",
    },
    {
      sl: "৯",
      roll: "১০১০৩",
      name: "ইমন",
      father: "মোঃ গাজী সালা উদ্দিন",
      dob: "১২/০১/২০০৪",
    },
  ];

  return (
    <>
      <div className="bg-white p-8 text-black text-sm">
        <div className="text-center flex-1 bg-white">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black px-4 py-1 inline-block rounded tracking-widest bg-white text-base font-bold sm:text-lg border-b-[3px] border-black border-double">
            শিক্ষার্থীদের সংক্ষিপ্ত তালিকা, শিক্ষাবর্ষ-(2025-26 Bs),
            শ্রেণী/জামাত-(হিফজ(ক))
          </div>
        </div>
        {/* Header Section */}
        <div className="flex justify-end items-center pt-3 sm:pt-0 mb-4 bg-white">
          <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
            <table className="min-w-full border border-black border-collapse bg-white">
              <thead className="bg-white">
                <tr className="text-center text-sm">
                  <th className="border border-black px-2 py-1">ক্র:</th>
                  <th className="border border-black px-2 py-1">দাখেলা</th>
                  <th className="border border-black px-2 py-1">
                    শিক্ষার্থীর নাম
                  </th>
                  <th className="border border-black px-2 py-1">পিতার নাম</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="text-center bg-white">
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.sl}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.roll}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.name}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.father}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="min-w-full border border-black border-collapse bg-white">
              <thead className="bg-white">
                <tr className="text-center text-sm">
                  <th className="border border-black px-2 py-1">ক্র:</th>
                  <th className="border border-black px-2 py-1">দাখেলা</th>
                  <th className="border border-black px-2 py-1">
                    শিক্ষার্থীর নাম
                  </th>
                  <th className="border border-black px-2 py-1">পিতার নাম</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={idx} className="text-center bg-white">
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.sl}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.roll}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.name}
                    </td>
                    <td className="border border-black px-2 py-1 bg-white">
                      {s.father}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentsListTwoColumns;
