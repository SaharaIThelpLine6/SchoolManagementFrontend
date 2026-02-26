import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";

const AdmitCardBanglaA4Four = ({ data }) => {
  // data is now an array of 1 to 4 students
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

  // Card template
  const renderCard = (student, index) => (
    <div
      key={index}
      className="border-2 border-black p-4 flex flex-col justify-between"
      style={{
        width: "48%",
        height: "50%",
        margin: "1%",
        boxSizing: "border-box",
      }}
    >
      {/* Header Section */}
      <div>
        {/* Top Row */}
        <div className="flex justify-between items-start mb-2">
          {/* Left Logo */}
          <div className="w-16 h-16">
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
            <h2 className="text-lg font-bold mb-1">
              {bnBijoy2Unicode(institutionInfo?.InstitutionName) || "টেস্ট মাদরাসা"}
            </h2>
            <p className="text-xs">
              {bnBijoy2Unicode(institutionInfo?.Address) ||
                "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
            </p>
            <p className="text-xs mb-1">{bnBijoy2Unicode(student?.ExamName)}</p>
            <div className="border border-black px-2 py-0.5 inline-block rounded-3xl">
              <h3 className="text-sm font-bold">প্রবেশপত্র</h3>
            </div>
          </div>

          {/* Right Empty Space */}
          <div className="w-16 h-16" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-1 gap-x-2 w-full mt-2 text-xs">
          {/* Row 1 */}
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">শ্রেণি/জামাত</span>
            <span className="mx-1">:</span>
            <span>{bnBijoy2Unicode(student?.SubClass)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">দাখেলা</span>
            <span className="mx-1">:</span>
            <span>{student?.UserCode}</span>
          </div>

          {/* Row 2 */}
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">
              পরীক্ষার্থীর নাম
            </span>
            <span className="mx-1">:</span>
            <span>{bnBijoy2Unicode(student?.UserName)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">জন্ম তারিখ</span>
            <span className="mx-1">:</span>
            <span>{student?.DateOfBirth}</span>
          </div>

          {/* Row 3 */}
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">পিতার নাম</span>
            <span className="mx-1">:</span>
            <span>{bnBijoy2Unicode(student?.FatherName)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">ভর্তি নং</span>
            <span className="mx-1">:</span>
            <span>{student?.AdmissionSerial}</span>
          </div>

          {/* Row 4 */}
          <div className="flex items-baseline">
            <span className="w-24 text-right font-normal">মাতার নাম</span>
            <span className="mx-1">:</span>
            <span>{bnBijoy2Unicode(student?.MotherName)}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-end mt-2 px-2">
        {/* Left Signature */}
        <div className="text-center">
          {signatures[index]?.najem && (
            <img
              src={signatures[index].najem}
              alt="Signature"
              className="w-12 h-6 object-contain mx-auto"
            />
          )}
          <div className="border-t border-black w-20 mx-auto mt-0.5" />
          <p className="mt-0.5 text-xs">নায়েম</p>
          <p className="text-xs mt-0.5">
            তারিখ : {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>

        {/* Right Signature */}
        <div className="text-center">
          {signatures[index]?.principal && (
            <img
              src={signatures[index].principal}
              alt="Signature"
              className="w-12 h-6 object-contain mx-auto"
            />
          )}
          <div className="border-t border-black w-20 mx-auto mt-0.5" />
          <p className="mt-0.5 text-xs">মুহতামিম</p>
          <p className="text-xs mt-0.5">
            তারিখ : {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="bg-white text-black mx-auto"
      style={{
        // width: "210mm",
        // minHeight: "297mm",
        padding: "4mm",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-start",
        boxSizing: "border-box",
      }}
    >
      {students.map((student, index) => renderCard(student, index))}
    </div>
  );
};

export default AdmitCardBanglaA4Four;
