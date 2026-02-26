import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";

const AdmitCardBanglaA4Two = ({ data }) => {
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

  if (institutionInfoLoading) return <div className="text-3xl">Loading...</div>;
  if (institutionInfoError)
    return <div className="text-3xl">Error loading institution data</div>;

  const renderCard = (student, index) => (
    <div
      key={index}
      className="border border-black p-6 flex flex-col justify-between"
      style={{
        width: "98%",
        height: "140mm",
        marginBottom: "10mm",
        boxSizing: "border-box",
        pageBreakInside: "avoid",
      }}
    >
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-24 h-24">
            {logo && (
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="text-center flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {bnBijoy2Unicode(institutionInfo?.InstitutionName) || "টেস্ট মাদরাসা"}
            </h2>
            <p className="text-base mb-2">
              {bnBijoy2Unicode(institutionInfo?.Address) || "সরকারি মুজিব কলেজ রোড, সখিপুর, টাংগাইল"}
             
            </p>
            <p className="text-base mb-3">{bnBijoy2Unicode(student?.ExamName)}</p>
            <div className="border border-black px-4 py-2 inline-block rounded-3xl">
              <h3 className="text-2xl font-bold">প্রবেশপত্র</h3>
            </div>
          </div>
          <div className="w-24 h-24" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 w-full mt-4 text-base">
          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">শ্রেণি/জামাত</span>
            <span className="mx-3">:</span>
            <span>{bnBijoy2Unicode(student?.SubClass)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">দাখেলা</span>
            <span className="mx-3">:</span>
            <span>{student?.UserCode}</span>
          </div>

          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">
              পরীক্ষার্থীর নাম
            </span>
            <span className="mx-3">:</span>
            <span>{bnBijoy2Unicode(student?.UserName)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">জন্ম তারিখ</span>
            <span className="mx-3">:</span>
            <span>{student?.DateOfBirth}</span>
          </div>

          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">পিতার নাম</span>
            <span className="mx-3">:</span>
            <span>{bnBijoy2Unicode(student?.FatherName)}</span>
          </div>
          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">ভর্তি নং</span>
            <span className="mx-3">:</span>
            <span>{student?.AdmissionSerial}</span>
          </div>

          <div className="flex items-baseline">
            <span className="w-32 text-right font-medium">মাতার নাম</span>
            <span className="mx-3">:</span>
            <span>{bnBijoy2Unicode(student?.MotherName)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-8 px-6">
        <div className="text-center">
          {signatures[index]?.najem && (
            <img
              src={signatures[index].najem}
              alt="Signature"
              className="w-24 h-10 object-contain mx-auto"
            />
          )}
          <div className="border-t-2 border-black w-28 mx-auto mt-2" />
          <p className="text-base mt-2">নায়েম</p>
          <p className="text-base mt-1">
            তারিখ : {new Date().toLocaleDateString("bn-BD")}
          </p>
        </div>

        <div className="text-center">
          {signatures[index]?.principal && (
            <img
              src={signatures[index].principal}
              alt="Signature"
              className="w-24 h-10 object-contain mx-auto"
            />
          )}
          <div className="border-t-2 border-black w-28 mx-auto mt-2" />
          <p className="text-base mt-2">মুহতামিম</p>
          <p className="text-base mt-1">
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
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        fontSize: "1.1rem",
      }}
    >
      {students.map((student, index) => renderCard(student, index))}
    </div>
  );
};

export default AdmitCardBanglaA4Two;
