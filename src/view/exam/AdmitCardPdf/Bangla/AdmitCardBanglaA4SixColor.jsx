import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import admitCardBg from "/admitCardBg.png";

const AdmitCardBanglaA4SixColor = ({ data }) => {
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

  // Card template adjusted for 6 cards per A4 page
  const renderCard = (student, index) => (
    <div
      key={index}
      className="border-2 border-black p-2 flex flex-col justify-between relative overflow-hidden"
      style={{
        width: "40%", // Adjusted width for 3 cards per row
        height: "50%", // Adjusted height for 2 rows
        margin: "0.5%", // Small margin
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Background Image */}
      <img
        src={admitCardBg}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-1"
      />

      {/* Content */}
      <div className="relative z-10 p-2">
        {/* Header Section */}
        <div>
          {/* Top Row */}
          <div className="flex justify-between items-start mb-1">
            {/* Left Logo */}
            <div className="w-12 h-12">
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
              <h2 className="text-sm font-bold text-[#c0c000]">
                {institutionInfo?.InstitutionName || "টেস্ট মাদরাসা"}
              </h2>
              <p className="text-[8px] text-white">
                {institutionInfo?.Address ||
                  "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
              </p>
              <p className="text-[8px] mb-0.5 text-white">
                {bnBijoy2Unicode(student?.ExamName)}
              </p>

              <div className="flex justify-center items-center mt-1">
                <div className="bg-gradient-to-r from-lime-400 via-green-800 to-lime-400 px-1 py-0.5 rounded-full">
                  <h3 className="text-white text-xs font-bold">
                    প্রবেশপত্র
                  </h3>
                </div>
              </div>
            </div>

            {/* Right Empty Space */}
            <div className="w-12 h-12" />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-y-0.5 gap-x-1 w-full mt-1 text-[8px]">
            {/* Row 1 */}
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">শ্রেণি/জামাত</span>
              <span className="mx-0.5">:</span>
              <span>{bnBijoy2Unicode(student?.SubClass)}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">দাখেলা</span>
              <span className="mx-0.5">:</span>
              <span>{student?.UserCode}</span>
            </div>

            {/* Row 2 */}
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">
                পরীক্ষার্থীর নাম
              </span>
              <span className="mx-0.5">:</span>
              <span>{bnBijoy2Unicode(student?.UserName)}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">জন্ম তারিখ</span>
              <span className="mx-0.5">:</span>
              <span>{student?.DateOfBirth}</span>
            </div>

            {/* Row 3 */}
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">পিতার নাম</span>
              <span className="mx-0.5">:</span>
              <span>{bnBijoy2Unicode(student?.FatherName)}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">ভর্তি নং</span>
              <span className="mx-0.5">:</span>
              <span>{student?.AdmissionSerial}</span>
            </div>

            {/* Row 4 */}
            <div className="flex items-baseline">
              <span className="w-16 text-right font-normal">মাতার নাম</span>
              <span className="mx-0.5">:</span>
              <span>{bnBijoy2Unicode(student?.MotherName)}</span>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-1 px-1">
          {/* Left Signature */}
          <div className="text-center">
            {signatures[index]?.najem && (
              <img
                src={signatures[index].najem}
                alt="Signature"
                className="w-10 h-5 object-contain mx-auto"
              />
            )}
            <div className="border-t border-black w-16 mx-auto mt-0.5" />
            <p className="mt-0.5 text-[8px]">নায়েম</p>
            <p className="text-[8px] mt-0.5">
              তারিখ : {new Date().toLocaleDateString("bn-BD")}
            </p>
          </div>

          {/* Right Signature */}
          <div className="text-center">
            {signatures[index]?.principal && (
              <img
                src={signatures[index].principal}
                alt="Signature"
                className="w-10 h-5 object-contain mx-auto"
              />
            )}
            <div className="border-t border-black w-16 mx-auto mt-0.5" />
            <p className="mt-0.5 text-[8px]">মুহতামিম</p>
            <p className="text-[8px] mt-0.5">
              তারিখ : {new Date().toLocaleDateString("bn-BD")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="bg-white text-black flex justify-center items-center mx-auto relative"
      style={{
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        boxSizing: "border-box",
        // width: "260mm",
        // minHeight: "260mm",
        position: "relative",
        // padding: "5mm",
      }}
    >
      {students.map((student, index) => renderCard(student, index))}
    </div>
  );
};

export default AdmitCardBanglaA4SixColor;