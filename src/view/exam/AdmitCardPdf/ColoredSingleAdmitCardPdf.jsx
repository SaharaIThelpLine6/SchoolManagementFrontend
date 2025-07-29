import React, { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";

const ColoredSingleAdmitCardPdf = () => {
  const {
    data: institutionInfo,
    isLoading: institutionInfoLoading,
    error: institutionInfoError,
  } = useGetInstitutionInfoQuery();

  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      setLogo(`data:image/png;base64,${base64String}`);
    }
  }, [institutionInfo]);

  if (institutionInfoLoading) return <div className="text-2xl">Loading...</div>;
  if (institutionInfoError)
    return <div className="text-2xl">Error loading institution data</div>;

  return (
    <div
      className="relative text-black mx-auto overflow-hidden"
      style={{
        width: "210mm",
        padding: "10mm",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
      }}
    >
      {/* Background Image */}
      <img
        src="/admitCardBg.png"
        alt="Background"
        className="absolute inset-0 w-full object-cover z-0"
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full p-6 flex flex-col justify-between h-full bg-transparent">
        {/* Header Section */}
        <div>
          {/* Top Row */}
          <div className="flex justify-between items-center text-center">
            {/* Left Logo */}
            <div className="w-20 h-20">
              {logo && (
                <img
                  src={logo}
                  alt="Institution Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Center Title */}
            <div className="flex-1 text-white mt-5 text-center ml-30">
              <h2 className="text-xl font-bold mb-2 text-[#c0c000]">
                {institutionInfo?.InstitutionName || "টেস্ট মাদরাসা ১১১"}
              </h2>
              <p className="text-base">
                {institutionInfo?.Address ||
                  "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
              </p>
              <p className="text-base mb-4">১ম সাময়িক পরীক্ষা, ২০২৫-২৬ ইং</p>
            </div>

            {/* Right Spacer */}
            <div className="w-32 h-32" />
          </div>
          <div className="flex justify-center items-center ml-20">
            <div className="bg-gradient-to-r from-lime-400 via-green-800 to-lime-400 px-6 py-2 rounded-full">
              <h3 className="text-white text-2xl font-bold">প্রবেশপত্র</h3>
            </div>
          </div>

          {/* Info Grid */}
          <div className="flex justify-between text-base leading-9">
            {/* Left Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  শ্রেণি / জামাত
                </div>
                :<div>হিফজ (ক)</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  পরীক্ষার্থীর নাম
                </div>
                :<div>নাহিদ ভাই</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  পিতার নাম
                </div>
                :<div>---</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  মাতার নাম
                </div>
                :<div>---</div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">দাখিলা</div>
                :<div>১০০০০৫</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  জন্ম তারিখ
                </div>
                :<div>---</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  ভর্তি নাম্বার / সিরিয়াল
                </div>
                :<div>১০০০০৫</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end px-6">
          {/* Left Signature */}
          <div className="text-center mt-16">
            {/* <img
              src={logo}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            /> */}
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-base">নায়েম</p>
            <p className="text-xl mt-2">
              তারিখ : {new Date().toLocaleDateString("bn-BD")} ইং.
            </p>
          </div>

          {/* Right Signature */}
          <div className="text-center mt-16">
            {/* <img
              src={logo}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            /> */}
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-base">মুহতামিম</p>
            <p className="text-xl mt-2">
              তারিখ : {new Date().toLocaleDateString("bn-BD")} ইং.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ColoredSingleAdmitCardPdf