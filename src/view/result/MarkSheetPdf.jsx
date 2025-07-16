import React, { useEffect, useState } from "react";
import { useGetSubClassListQuery } from "../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";
import Swal from "sweetalert2";
import { enToBnNumber } from "../../helper/languageFormat";

const MarkSheetPdf = ({ SubClassID, SessionID }) => {
  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  const { data: sessionSData } = useGetSessionsQuery();

  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);

  useEffect(() => {
    if (institutionInfoLoading) {
      Swal.fire({
        title: "লোড হচ্ছে...",
        text: "তথ্য আনয়ন করা হচ্ছে। দয়া করে অপেক্ষা করুন।",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close(); // Close the loading alert once loading finishes
    }

    if (institutionInfoError) {
      Swal.fire({
        icon: "error",
        title: "ভুল হয়েছে!",
        text: "প্রতিষ্ঠানের তথ্য লোড করতে ব্যর্থ হয়েছে।",
      });
    }
  }, [institutionInfoLoading, institutionInfoError]);
  return (
    <div
      className="w-full"
      style={{
        width: "210mm",
        height: "270mm", // Fixed height for one page
        margin: "0 auto",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        fontSize: "12px", // Reduced font size
        lineHeight: "1.4", // Tighter line height
        padding: "5mm", // Reduced padding
      }}
    >
      <div className="bg-white text-black p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 print:flex-row print:items-start">
          {/* Logo on the left */}
          <div className="w-20 h-20">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Text in the center */}
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold">
              {institutionInfo?.InstitutionName}
            </h1>
            <p className="text-sm">সরকারি মুজিব কলেজ রোড, সখিপুর, টাঙ্গাইল</p>
            <p className="text-sm">শিক্ষাবর্ষ : ২০২৫-২৬ ইং</p>
            <p className="text-sm">পরীক্ষা : ১ম সাময়িক পরিক্ষা</p>
          </div>

          {/* Empty placeholder for symmetry */}
          <div className="w-20 h-20"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="">
            <div className="flex items-center gap-4">
              <h3 className="w-20">পরীক্ষার্থীর নাম</h3>:<b>সাকিব আল হাসান</b>
            </div>
            <div className="flex items-center gap-4">
              <h3 className="w-20">শ্রেণী/জামাত</h3>:<p>হিফজ (ক)</p>
            </div>
            <div className="flex items-center gap-4">
              <h3 className="w-20">দাখেলা</h3>:<p>১০০০০১</p>
            </div>
            <div className="flex items-center gap-4">
              <h3 className="w-20">পিতার নাম</h3>:<p></p>
            </div>
            <div className="flex items-center gap-4">
              <h3 className="w-20">জন্ম তারিখ</h3>:<p>০১/০১/১৯৫৫</p>
            </div>
          </div>

          <div className="flex justify-center p-4">
            <table className="min-w-[300px] border-collapse shadow-md bg-white">
              <thead>
                <tr className="!bg-white">
                  <th className="p-2 text-left border border-black"></th>
                  <th className="p-2 text-left border border-black"></th>
                  <th className="p-2 text-left border border-black"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
                <tr className="!bg-white">
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                  <td className="p-2 border border-black"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="overflow-auto">
          <div className="flex justify-center">
            <table className="w-full border-collapse shadow-md bg-white">
              <thead>
                <tr className="!bg-white">
                  <th className="p-2 text-left border border-black">ক্র:</th>
                  <th className="p-2 text-left border border-black">বিষয়</th>
                  <th className="p-2 text-left border border-black">
                    পূর্ণমান
                  </th>
                  <th className="p-2 text-left border border-black">
                    পাশ নম্বর
                  </th>
                  <th className="p-2 text-left border border-black">
                    সর্বোচ্চ প্রাপ্ত নম্বর
                  </th>
                  <th className="p-2 text-left border border-black">
                    প্রাপ্ত নম্বর
                  </th>
                  <th className="p-2 text-left border border-black">গ্রেড</th>
                  <th className="p-2 text-left border border-black">জিপিএ</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="!bg-white">
                    {Array.from({ length: 8 }).map((_, colIndex) => (
                      <td key={colIndex} className="p-2 border border-black">
                        {/* Example content */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-around items-center border border-black p-4 my-5">
          <div className="flex items-center gap-2">
            <h3>
              <b>প্রাপ্ত নম্বর</b>
            </h3>
            :<p></p>
          </div>
          <div className="flex items-center gap-2">
            <h3>
              <b>মেধাস্থান</b>
            </h3>
            :<p></p>
          </div>
          <div className="flex items-center gap-2">
            <h3>
              <b>মোট নম্বর</b>
            </h3>
            :<p></p>
          </div>
        </div>
        <div className="flex justify-around items-center border border-black p-4 my-5">
          <div className="flex items-center gap-2">
            <h3>
              <b>কার্য দিবস</b>
            </h3>
            :<p></p>
          </div>
          <div className="flex items-center gap-2">
            <h3>
              <b>উপস্থিতি</b>
            </h3>
            :<p></p>
          </div>
          <div className="flex items-center gap-2">
            <h3>
              <b>অনুপস্থিতি</b>
            </h3>
            :<p></p>
          </div>
        </div>
        <div className="flex justify-between items-start gap-4 my-6">
          {/* শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য */}
          <div className="w-1/2 border border-black p-4 rounded-md min-h-[120px]">
            <h3 className="font-semibold mb-2">
              শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর:
            </h3>
            <div className="h-20 border-t border-dashed border-gray-400 mt-4"></div>
          </div>

          {/* অভিভাবকের মন্তব্য */}
          <div className="w-1/2 border border-black p-4 rounded-md min-h-[120px]">
            <h3 className="font-semibold mb-2">
              অভিভাবকের মন্তব্য ও স্বাক্ষর:
            </h3>
            <div className="h-20 border-t border-dashed border-gray-400 mt-4"></div>
          </div>
        </div>
        <div className="flex justify-between mt-20 px-5">
          {/* Signature 1 - Left */}
          <div className="flex flex-col items-center w-1/2">
            <img
              src="/singnature.png"
              alt="Signature 1"
              className="h-16 object-contain mb-2"
            />
            <div className="border-t border-dotted border-black w-32 my-1"></div>
            <p className="font-semibold text-sm">মুহতামিম</p>
            <p className="text-xs">তারিখ: ০৭/১৬/২০২৫</p>
          </div>

          {/* Signature 2 - Right */}
          <div className="flex flex-col items-center w-1/2">
              <img
                src="/singnature.png"
                alt="Signature 2"
                className="h-16 object-contain"
              />
            <div className="border-t border-dotted border-black w-32 my-1"></div>
            <p className="font-semibold text-sm">নاظেম</p>
            <p className="text-xs">তারিখ: ০৭/১৬/২০২৫</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkSheetPdf;
