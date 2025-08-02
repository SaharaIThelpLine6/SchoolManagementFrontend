import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import admitCardBg from "/admitCardBg.png";

const AdmitCardBanglaA4TwoColor = ({ data }) => {
  const [students] = useState(data);
  const {
    data: institutionInfo,
    isLoading: institutionInfoLoading,
    error: institutionInfoError,
  } = useGetInstitutionInfoQuery();

  const [logo, setLogo] = useState(null);
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      setLogo(`data:image/png;base64,${base64String}`);
    }

    const newSignatures = students.map((student) => {
      const sigNajem = student?.SignatureNajem?.data
        ? `data:image/png;base64,${Buffer.from(
            student.SignatureNajem.data
          ).toString("base64")}`
        : null;
      const sigPrincipal = student?.SignaturePrincipal?.data
        ? `data:image/png;base64,${Buffer.from(
            student.SignaturePrincipal.data
          ).toString("base64")}`
        : null;
      return { najem: sigNajem, principal: sigPrincipal };
    });

    setSignatures(newSignatures);
  }, [institutionInfo, students]);

  if (institutionInfoLoading) return <div className="text-2xl">Loading...</div>;
  if (institutionInfoError)
    return <div className="text-2xl">Error loading institution data</div>;

  // Card template for A4 portrait with larger fonts
  const renderCard = (student, index) => (
    <div
      key={index}
      className="border-2 border-black p-4 relative overflow-hidden mb-4"
      style={{
        width: "100%",
        height: "auto",
        minHeight: "120mm",
        boxSizing: "border-box",
        position: "relative",
        pageBreakAfter: "auto",
        pageBreakInside: "avoid"
      }}
    >
      {/* Background Image */}
      <img
        src={admitCardBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-1"
      />

      {/* Content */}
      <div className="relative z-10 p-5 h-full flex flex-col justify-between">
        {/* Header Section */}
        <div>
          {/* Top Row */}
          <div className="flex justify-between items-start mb-4"> {/* Increased margin-bottom */}
            {/* Left Logo */}
            <div className="w-20 h-20"> {/* Increased logo size */}
              {logo && (
                <img
                  src={logo}
                  alt="Institution Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Center Title */}
            <div className="text-center flex-1 mt-8">
              <h2 className="text-xl font-bold text-[#c0c000]"> {/* Increased from text-lg */}
                {bnBijoy2Unicode(institutionInfo?.InstitutionName) || "টেস্ট মাদরাসা"}
              </h2>
              <p className="text-sm text-white"> {/* Increased from text-xs */}
                {bnBijoy2Unicode(institutionInfo?.Address) ||
                  "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
              </p>
              <p className="text-sm mb-2 text-white"> {/* Increased from text-xs */}
                {bnBijoy2Unicode(student?.ExamName)}
              </p>

              <div className="flex justify-center items-center mt-4"> {/* Increased margin-top */}
                <div className="bg-gradient-to-r from-lime-400 via-green-800 to-lime-400 px-6 py-2 rounded-full"> {/* Increased padding */}
                  <h3 className="text-white text-base font-bold"> {/* Increased from text-sm */}
                    প্রবেশপত্র
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Empty Space */}
            <div className="w-20 h-20" /> {/* Increased to match logo */}
          </div>

          {/* Info Grid - Larger fonts */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 w-full mt-6 text-sm"> {/* Increased from text-[11px] */}
            {/* Row 1 */}
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">শ্রেণি/জামাত</span> {/* Increased width */}
              <span className="mx-2">:</span> {/* Increased margin */}
              <span className="font-medium">{bnBijoy2Unicode(student?.SubClass)}</span> {/* Added font-medium */}
            </div>
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">দাখেলা</span>
              <span className="mx-2">:</span>
              <span className="font-medium">{student?.UserCode}</span>
            </div>

            {/* Row 2 */}
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">
                পরীক্ষার্থীর নাম
              </span>
              <span className="mx-2">:</span>
              <span className="font-medium">{bnBijoy2Unicode(student?.UserName)}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">জন্ম তারিখ</span>
              <span className="mx-2">:</span>
              <span className="font-medium">{student?.DateOfBirth}</span>
            </div>

            {/* Row 3 */}
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">পিতার নাম</span>
              <span className="mx-2">:</span>
              <span className="font-medium">{bnBijoy2Unicode(student?.FatherName)}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">ভর্তি নং</span>
              <span className="mx-2">:</span>
              <span className="font-medium">{student?.AdmissionSerial}</span>
            </div>

            {/* Row 4 */}
            <div className="flex items-baseline">
              <span className="w-28 text-right font-normal">মাতার নাম</span>
              <span className="mx-2">:</span>
              <span className="font-medium">{bnBijoy2Unicode(student?.MotherName)}</span>
            </div>
          </div>
        </div>

        {/* Footer Section - Larger signatures */}
        <div className="flex justify-between items-end mt-3 px-4"> {/* Increased margins */}
          {/* Left Signature */}
          <div className="text-center">
            {signatures[index]?.najem && (
              <img
                src={signatures[index].najem}
                alt="Signature"
                className="w-20 h-10 object-contain mx-auto"
              />
            )}
            <div className="border-t-2 border-black w-32 mx-auto mt-2" /> {/* Increased width and margin */}
            <p className="mt-2 text-sm">নায়েম</p> {/* Increased from text-xs */}
            <p className="text-sm mt-2"> {/* Increased from text-xs */}
              তারিখ : {new Date().toLocaleDateString("bn-BD")}
            </p>
          </div>

          {/* Right Signature */}
          <div className="text-center">
            {signatures[index]?.principal && (
              <img
                src={signatures[index].principal}
                alt="Signature"
                className="w-20 h-10 object-contain mx-auto" 
              />
            )}
            <div className="border-t-2 border-black w-32 mx-auto mt-2" />
            <p className="mt-2 text-sm">মুহতামিম</p>
            <p className="text-sm mt-2">
              তারিখ : {new Date().toLocaleDateString("bn-BD")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="bg-white text-black mx-auto relative"
      style={{
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        display: "flex",
        flexDirection: "column",
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm", 
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {students.map((student, index) => renderCard(student, index))}
    </div>
  );
};

export default AdmitCardBanglaA4TwoColor;