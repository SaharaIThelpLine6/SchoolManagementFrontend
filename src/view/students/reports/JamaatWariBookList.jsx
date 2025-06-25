import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

const JamaatWariBookList = () => {
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

  const bookData = [
    {
      sl: "০১",
      banglaName: "আরবি ভাষার প্রথম পাঠ",
      arabicName: "الكتاب الأول في اللغة العربية",
      id: "3001",
    },
    {
      sl: "০২",
      banglaName: "কুরআন শিক্ষা",
      arabicName: "تعليم القرآن",
      id: "3002",
    },
    {
      sl: "০৩",
      banglaName: "হাদিস শিক্ষা",
      arabicName: "تعليم الحديث",
      id: "3003",
    },
    {
      sl: "০৪",
      banglaName: "ফিকহ শিক্ষা",
      arabicName: "تعليم الفقه",
      id: "3004",
    },
    {
      sl: "০৫",
      banglaName: "তাজবিদ শিক্ষা",
      arabicName: "تعليم التجويد",
      id: "3005",
    },
    {
      sl: "০৬",
      banglaName: "ইসলামিক ইতিহাস",
      arabicName: "التاريخ الإسلامي",
      id: "3006",
    },
    {
      sl: "০৭",
      banglaName: "আকাইদ শিক্ষা",
      arabicName: "تعليم العقائد",
      id: "3007",
    },
    {
      sl: "০৮",
      banglaName: "নাহু সরফ",
      arabicName: "النحو والصرف",
      id: "3008",
    },
    {
      sl: "০৯",
      banglaName: "তাফসীর শিক্ষা",
      arabicName: "تعليم التفسير",
      id: "3009",
    },
    {
      sl: "১০",
      banglaName: "ইসলামী আদব-কায়দা",
      arabicName: "الآداب الإسلامية",
      id: "3163",
    },
  ];

  return (
    <div className="relative z-10 sm:px-20 sm:py-16 px-8 py-5 bg-white">
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
          <div className="text-black border-b-4 border-r-4 border-black border-solid px-4 py-1 inline-block mt-2 sm:mt-3 tracking-widest bg-white text-base font-bold sm:text-lg">
            মারহালা / ক্লাস ওয়ারী কিতাবের নাম
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শিক্ষাবর্ষ : 2025-26 Bs
        </div>
        <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্রমিক নং</th>
              <th className="border border-black p-2 bg-white">
                কিতাবের বাংলা নাম
              </th>
              <th className="border border-black p-2 bg-white">
                কিতাবের আরবি নাম
              </th>
              <th className="border border-black p-2 bg-white">الصف</th>
            </tr>
          </thead>
          <tbody>
            {bookData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.banglaName}
                </td>
                <td
                  className="border border-black p-2 text-center bg-white"
                  dir="rtl"
                >
                  {row.arabicName}
                </td>
                <td
                  className="border border-black p-2 text-center bg-white"
                  dir="rtl"
                >
                  {row.id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JamaatWariBookList;
