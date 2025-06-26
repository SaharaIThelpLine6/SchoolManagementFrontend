import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const ParentsMobileNumberTwoColumn = () => {
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

  const students = [
    {
      sl: "১",
      roll: "১০০০১",
      name: "সাকিব আল হাসান",
      father: "হাসান",
      mobile: "017xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "২",
      roll: "১০০০২",
      name: "শেখ হাসিনা",
      father: "হাসান",
      mobile: "018xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৩",
      roll: "১০০০৩",
      name: "শেখ কামাল",
      father: "হাসান",
      mobile: "019xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৪",
      roll: "১০০০৫",
      name: "নাসির ভাই",
      father: "হাসান",
      mobile: "017xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৫",
      roll: "১০০০৬",
      name: "তানভীর",
      father: "হাসান",
      mobile: "013xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৬",
      roll: "১০০০৮",
      name: "খালেদুল্লাহ লব্ধরক্ষ",
      father: "হাসান",
      mobile: "017xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৭",
      roll: "১০১০১",
      name: "ইমন",
      father: "হাসান",
      mobile: "017xxxxxxxx",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৮",
      roll: "১০১০২",
      name: "গিয়াস",
      father: "মোঃ গাজী সালা উদ্দিন",
      mobile: "017xxxxxxxx",
      dob: "১১/০১/২০০৪",
    },
    {
      sl: "৯",
      roll: "১০১০৩",
      name: "ইমন",
      father: "মোঃ গাজী সালা উদ্দিন",
      mobile: "017xxxxxxxx",
      dob: "১২/০১/২০০৪",
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
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      {/* Section Title */}
      <div className="w-full border-b-4 border-black  border-double text-center mt-2 sm:mb-3 pb-2 mx-5">
        <span className="text-black tracking-widest border-b border-black text-base font-bold sm:text-lg">
          অভিভাবকের মোবাইল
        </span>
      </div>

      <div className="flex justify-start items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত : কিতাব খানা
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          {[0, 1].map((colIndex) => (
            <table
              key={colIndex}
              className="min-w-full border border-black border-collapse bg-white"
            >
              <thead className="bg-white">
                <tr className="text-center text-sm">
                  <th className="border border-black px-2 py-1">ক্র:</th>
                  <th className="border border-black px-2 py-1">দাখেলা</th>
                  <th className="border border-black px-2 py-1">
                    শিক্ষার্থীর নাম
                  </th>
                  <th className="border border-black px-2 py-1">
                    পিতার নাম ও মোবাইল
                  </th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((_, i) => i % 2 === colIndex)
                  .map((s, idx) => (
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
                        {s.mobile}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentsMobileNumberTwoColumn;
