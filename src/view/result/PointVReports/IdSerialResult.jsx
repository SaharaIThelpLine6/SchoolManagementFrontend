import { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { formatToDDMMYYYY } from '../../../utils/dateFormat';

const IdSerialResult = ({ data }) => {
  if (!data || data.length === 0) return null;
  const [principalSign, setPrincipalSign] = useState(null);
  const [najemSign, setNajemSign] = useState(null);

  const institute = data[0];
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();

  useEffect(() => {
    if (institutionInfo?.SignaturePrincipal?.data) {
      const bytes = new Uint8Array(institutionInfo.SignaturePrincipal.data);
      const base64 = btoa(
        bytes.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      setPrincipalSign(`data:image/png;base64,${base64}`);
    }

    if (institutionInfo?.SignatureNajem?.data) {
      const bytes = new Uint8Array(institutionInfo.SignatureNajem.data);
      const base64 = btoa(
        bytes.reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      setNajemSign(`data:image/png;base64,${base64}`);
    }
  }, [institutionInfo]);

  // 🔹 Subject List generate
  const subjects = Array.from({ length: 14 }, (_, i) => {
    const key = `Subject${i + 1}`;
    return institute[key];
  }).filter(Boolean);

  // 🔹 Helper functions
  const getSubVal = (student, i) => student[`SubVal${i + 1}`];
  const getGrade = (student, i) => student[`GPA${i + 1}`];

  return (
    <div
      className="print-page bg-white text-black print:p-0 print:bg-white print:text-black my-2"
      style={{
        margin: '0 auto',
        padding: '5mm', // 🔥 6mm → 5mm (safe)
        boxSizing: 'border-box',
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        fontSize: '11px',
        lineHeight: '1.3', // 🔥 1.35 → 1.3
      }}
    >
      {/* ================= Top Section ================= */}
      <div className="flex justify-between items-start mb-4 print:mb-2">
        {/* Left summary - Super Compact */}
        <div className="w-[155px] border border-black text-[9px] print:w-[145px] print:text-sm flex flex-col">
          <div className="text-center bg-gray-600 text-white font-medium p-[2px] print:p-[1px] flex-shrink-0">
            মোট = {institute.TotalStudent}
          </div>
          <div className="flex-1">
            {[
              ['A+', 5],
              ['A', 4],
              ['A-', 3.5],
              ['B', 3],
              ['C', 2],
              ['D', 1],
              ['F', 0],
              ['Abs', institute.DAbsance],
            ].map(([g, v], i) => (
              <div key={i} className="flex border-t h-[16px] items-center">
                <div className="w-1/2 border-r p-[2px] print:p-[1px] h-full flex items-center justify-center">
                  {g}
                </div>
                <div className="w-1/2 p-[2px] print:p-[1px] h-full flex items-center justify-center">
                  = {v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center title - Smaller */}
        <div className="text-center max-w-md mx-3 flex flex-col justify-center h-[148px]">
          <h1 className="text-xl font-bold ">{institute.InstitutionName}</h1>
          <p className="text-sm">{institute.Address}</p>
          <p className="text-sm mt-[1px]">
            {institute.ExamName} - {institute.SessionName}
          </p>
          <div className="border text-xl rounded-md font-bold border-black inline-block px-2 py-[1px] mt-[2px] p-2 mx-auto">
            ফলাফল (নম্বরপত্র)
          </div>
          <p className="mt-[1px] text-sm">
            শ্রেণি/জামাত : {institute.ClassName}
          </p>
        </div>

        {/* Right grading table - Compact */}
        <div className="w-[175px] text-[10px] print:w-[165px] print:text-sm flex flex-col">
          <div className="text-center bg-gray-600 text-white font-bold py-[2px] px-1 print:py-[1px] print:px-[2px] leading-none flex-shrink-0">
            গ্রেডিং পদ্ধতি
          </div>
          <div className="flex-1">
            <table className="w-full border-collapse print:text-[9px] h-full">
              <tbody>
                {[
                  [80, 'A+', 5],
                  [70, 'A', 4],
                  [60, 'A-', 3.5],
                  [50, 'B', 3],
                  [40, 'C', 2],
                  [33, 'D', 1],
                  [1, 'F', 0],
                ].map((row, i) => (
                  <tr key={i} className="leading-none h-[16px]">
                    {row.map((c, j) => (
                      <td
                        key={j}
                        className="border border-black py-[2px] px-1 text-center print:py-[1px] print:px-[2px] align-middle"
                      >
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= Main Result Table - Compact ================= */}
      <table className="w-full border border-black border-collapse text-sm mb-6 print:mb-4">
        <thead>
          <tr>
            <th className="border p-1 print:p-[3px] w-10">ক্রমিক</th>
            <th className="border p-1 print:p-[3px] w-20">
              {institute.StudentIDLabel}
            </th>
            <th className="border p-1 print:p-[3px] w-32">শিক্ষার্থীর নাম</th>

            {subjects.map((sub, i) => (
              <th key={i} className="border w-6 print:w-5">
                <div className="flex justify-center items-center h-20 print:h-16">
                  <span className="[writing-mode:vertical-rl] rotate-180">
                    {sub}
                  </span>
                </div>
              </th>
            ))}

            <th className="border p-1 print:p-[3px] w-12">মোট</th>
            <th className="border p-1 print:p-[3px] w-12">জিপিএ</th>
            <th className="border p-1 print:p-[3px] w-12">গ্রেড</th>
            <th className="border p-1 print:p-[3px] w-12">স্থান</th>
          </tr>
        </thead>

        <tbody>
          {data.map((student, idx) => (
            <tr
              key={student.ID}
              className="hover:bg-gray-50 print:hover:bg-transparent"
            >
              <td className="border p-1 print:p-[3px] text-center">
                {idx + 1}
              </td>
              <td className="border p-1 print:p-[3px]">{student.UserCode}</td>
              <td className="border p-1 print:p-[3px] truncate max-w-[120px]">
                {student.UserName}
              </td>

              {subjects.map((_, i) => (
                <td
                  key={i}
                  className="border p-1 print:p-[3px] text-center font-medium"
                >
                  {getSubVal(student, i) ?? ''}
                </td>
              ))}

              <td className="border p-1 print:p-[3px] text-center font-bold">
                {student.Total ?? ''}
              </td>
              <td className="border p-1 print:p-[3px] text-center font-bold">
                {(student.GPA ?? 0).toFixed(2)}
              </td>

              <td className="border p-1 print:p-[3px] text-center font-bold">
                {student.Division ?? 'Abs'}
              </td>
              <td className="border p-1 print:p-[3px] text-center font-bold">
                {student.Positions || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Footer - Compact ================= */}
      <div className="flex justify-between">
        {/* Principal */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto">
            {principalSign && (
              <img
                src={principalSign}
                alt="Principal Signature"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="border-b border-black w-32 mt-2"></div>

          <p className="text-sm ">{institutionInfo?.PrincipalName}</p>
          <p className="text-sm print:text-[11px]">
            তারিখ : {bnBijoy2Unicode(formatToDDMMYYYY(new Date()))}
          </p>
        </div>

        {/* Najem */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto">
            {najemSign && (
              <img
                src={najemSign}
                alt="Najem Signature"
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="border-b border-black w-32 mt-2"></div>

          <p className="text-sm ">{institutionInfo?.NajemName}</p>
          <p className="text-sm ">
            তারিখ : {bnBijoy2Unicode(formatToDDMMYYYY(new Date()))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdSerialResult;
