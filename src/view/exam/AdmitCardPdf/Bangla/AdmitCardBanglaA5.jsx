import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { bindActionCreators } from "@reduxjs/toolkit";

const AdmitCardBanglaA5 = ({ data }) => {
  const {
    data: institutionInfo,
    isLoading: institutionInfoLoading,
    error: institutionInfoError,
  } = useGetInstitutionInfoQuery();

  const [logo, setLogo] = useState(null);
  const [signatureNajem, setSignatureNajem] = useState(null);
  const [signaturePrincipal, setSignaturePrincipal] = useState(null);

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      setLogo(`data:image/png;base64,${base64String}`);
    }

    if (data?.SignatureNajem) {
      const signatureNajemBuffer = Buffer.from(data.SignatureNajem);
      const signatureNajemBase64String =
        signatureNajemBuffer.toString("base64");
      setSignatureNajem(`data:image/png;base64,${signatureNajemBase64String}`);
    }

    if (data?.SignaturePrincipal) {
      const signaturePrincipalBuffer = Buffer.from(data.SignaturePrincipal);
      const signaturePrincipalBase64String =
        signaturePrincipalBuffer.toString("base64");
      setSignaturePrincipal(
        `data:image/png;base64,${signaturePrincipalBase64String}`
      );
    }
  }, [institutionInfo, data]);

  if (institutionInfoLoading) return <div className="text-2xl">Loading...</div>;
  if (institutionInfoError)
    return <div className="text-2xl">Error loading institution data</div>;

  return (
    <div
      className="bg-white text-black mx-auto"
      style={{
        width: "210mm",
        padding: "4mm",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
      }}
    >
      {/* Outer Border Box */}
      <div className="w-full border-2 border-black p-3 flex flex-col justify-between">
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
              <h2 className="text-2xl font-bold mb-2">
                {bnBijoy2Unicode(institutionInfo?.InstitutionName) || "টেস্ট মাদরাসা ১১১"}
              </h2>
              <p className="text-xl">
                {bnBijoy2Unicode(institutionInfo?.Address) ||
                  "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
              </p>
              <p className="text-xl mb-4">{bnBijoy2Unicode(data?.ExamName)}</p>
              <div className="border border-black px-4 py-2 inline-block rounded-3xl">
                <h3 className="text-2xl font-bold">প্রবেশপত্র</h3>
              </div>
            </div>

            {/* Right Empty Space (Same size as logo for balance) */}
            <div className="w-32 h-32" />
          </div>

          {/* Info Grid */}
          <div className="flex justify-around mt-8 text-lg leading-9">
            {/* Left Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[110px] font-normal text-start">
                  শ্রেণি / জামাত{" "}
                </div>
                :<div>{bnBijoy2Unicode(data?.SubClass)}</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[110px] font-normal text-strat">
                  পরীক্ষার্থীর নাম{" "}
                </div>
                :<div>{bnBijoy2Unicode(data?.UserName)}</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[110px] font-normal text-start">
                  পিতার নাম{" "}
                </div>
                :<div>{bnBijoy2Unicode(data?.FatherName)}</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[110px] font-normal text-start">
                  মাতার নাম{" "}
                </div>
                :<div>{bnBijoy2Unicode(data?.MotherName)}</div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  দাখেলা{" "}
                </div>
                :<div>{data?.UserCode}</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  জন্ম তারিখ{" "}
                </div>
                :<div>{data?.DateOfBirth}</div>
              </div>
              <div className="flex gap-3">
                <div className="min-w-[160px] font-normal text-end">
                  ভর্তি নং
                </div>
                :<div>{data?.AdmissionSerial}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-8 px-6">
          {/* Left Signature */}
          <div className="text-center">
            <img
              src={signatureNajem}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            />
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-lg">নায়েম</p>
            <p className="text-lg mt-2">
              তারিখ : {new Date().toLocaleDateString("bn-BD")} ইং.
            </p>
          </div>

          {/* Right Signature */}
          <div className="text-center">
            <img
              src={signaturePrincipal}
              alt="Signature"
              className="w-32 h-16 object-contain mx-auto"
            />
            <div className="border-t-2 border-black w-48 mx-auto mt-3" />
            <p className="mt-2 text-lg">মুহতামিম</p>
            <p className="text-lg mt-2">
              তারিখ : {new Date().toLocaleDateString("bn-BD")} ইং.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmitCardBanglaA5;
