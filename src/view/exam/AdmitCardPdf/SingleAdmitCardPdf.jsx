

import React, { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { Buffer } from "buffer";

const SingleAdmitCardPdf = () => {
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
  if (institutionInfoError) return <div className="text-2xl">Error loading institution data</div>;

  return (
    <div
      className="bg-white text-black mx-auto"
      style={{
        width: "210mm",
        height: "297mm",
        padding: "10mm",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
      }}
    >
      {/* Outer Border Box */}
      <div className="w-full border-2 border-black p-6 flex flex-col justify-between">
        {/* Header Section */}
        <div>
          {/* Top Row */}
          <div className="flex justify-between items-start mb-6">
            {/* Left Logo */}
            <div className="w-32 h-32">
              {logo && (
                <img
                  src={logo}
                  alt="Institution Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Center Title */}
            <div className="text-center flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {institutionInfo?.InstitutionName || "টেস্ট মাদরাসা ১১১"}
              </h2>
              <p className="text-xl">
                {institutionInfo?.Address || "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
              </p>
              <p className="text-xl mb-4">১ম সাময়িক পরীক্ষা, ২০২৫-২৬ ইং</p>
              <div className="border-2 border-black px-6 py-2 inline-block rounded">
                <h3 className="text-2xl font-bold">প্রবেশপত্র</h3>
              </div>
            </div>

            {/* Right Empty Space (Same size as logo for balance) */}
            <div className="w-32 h-32" />
          </div>

          {/* Info Grid */}
          <div className="flex justify-around mt-8 text-xl leading-9">
            {/* Left Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">শ্রেণি / জামাত </div>:
                <div>হিফজ (ক)</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">পরীক্ষার্থীর নাম </div>:
                <div>নাহিদ ভাই</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">পিতার নাম </div>:
                <div>---</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">মাতার নাম </div>:
                <div>---</div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">দাখিলা </div>:
                <div>১০০০০৫</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">জন্ম তারিখ </div>:
                <div>---</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">ভর্তি নাম্বার / সিরিয়াল </div>:
                <div>১০০০০৫</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-8 px-6">
          {/* Left Signature */}
          <div className="text-center">
            <img
              src={logo}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            />
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-xl">নায়েম</p>
         <p className="text-xl mt-2">তারিখ : {new Date().toLocaleDateString('bn-BD')} ইং.</p>
          </div>

          {/* Right Signature */}
          <div className="text-center">
            <img
              src={logo}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            />
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-xl">মুহতামিম</p>
          <p className="text-xl mt-2">তারিখ : {new Date().toLocaleDateString('bn-BD')} ইং.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAdmitCardPdf;
