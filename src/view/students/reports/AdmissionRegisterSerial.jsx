import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { formatDate } from "../../../helper/formatTime";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const AdmissionRegisterSerial = ({ reportData, SessionID }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const { data: sessionSData } = useGetSessionsQuery();
  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  const toBengaliNumber = (num) => {
    if (!num) return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (x) => bengaliDigits[x]);
  };

  // প্রতি পেজে ১৫টি ডাটা
  const ROWS_PER_PAGE = 15;
  const chunks = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
  }, [reportData]);

  return (
    <div className="font-bangla bg-white text-[12px] sm:text-[13px]">
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            html, body {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
            .print-page-container {
              page-break-after: always;
              page-break-inside: avoid;
              break-after: page;
              min-height: 277mm;
              position: relative;
              box-sizing: border-box;
            }
            .print-page-container:last-child {
              page-break-after: auto;
              break-after: auto;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse !important;
              table-layout: auto; /* Changed to auto to prevent forced word breaking */
              width: 100%;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            th, td {
              border: 1px solid black !important;
              vertical-align: middle !important;
              padding: 4px 6px !important;
            }
          }
        `}
      </style>

      {chunks.map((chunk, pageIndex) => (
        <div key={pageIndex} className="print-page-container p-4 sm:p-6 bg-white flex flex-col min-h-screen sm:min-h-[277mm] relative">
          
          {/* হেডার সেকশন */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-24 flex justify-start">
              {logo && (
                <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
              )}
            </div>
            
            <div className="text-center flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-1">
                {instutionInfo?.InstitutionName || "জামিয়া ইসলামিয়া দারুল মাদরাসা"}
              </h1>
              <p className="text-base sm:text-lg font-medium text-black">
                {instutionInfo?.Address || "যাত্রাবাড়ী, ঢাকা"}
              </p>
              
              <div className="inline-block mt-3 border-[1.5px] border-black rounded-lg px-6 py-1.5 bg-white text-black font-bold text-base sm:text-lg tracking-wide">
                ভর্তি রেজিস্টার : {sessionData?.SessionName || '২০২৬'}
              </div>
            </div>
            
            <div className="w-24 hidden sm:block"></div>
          </div>

          {/* প্রিন্ট তারিখ */}
          <div className="flex justify-end items-center mb-2 relative z-10">
            <div className="text-[13px] sm:text-[14px] font-semibold text-black">
              প্রিন্ট তারিখ: {toBengaliNumber(formatDate(new Date()))}
            </div>
          </div>

          {/* টেবিল সেকশন (জলছাপ সহ) */}
          <div className="w-full flex-grow relative">
            
            {/* Watermark (জলছাপ) */}
            {logo && (
              <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0 opacity-10">
                <img src={logo} alt="Watermark" className="w-[350px] sm:w-[450px] h-auto object-contain" />
              </div>
            )}

            <table className="w-full border-collapse border border-black text-black relative z-10 bg-transparent">
              <thead>
                <tr className="bg-transparent">
                  <th className="border border-black p-1 text-center font-bold w-[4%]">ক্র:</th>
                  <th className="border border-black p-1 text-center font-bold w-[7%]">দাখেলা</th>
                  <th className="border border-black p-1 text-center font-bold w-[13%]">শিক্ষার্থীর নাম</th>
                  <th className="border border-black p-1 text-center font-bold w-[12%]">পিতার নাম</th>
                  <th className="border border-black p-1 text-center font-bold w-[12%]">মাতার নাম</th>
                  <th className="border border-black p-1 text-center font-bold w-[9%]">জন্ম তারিখ</th>
                  <th className="border border-black p-1 text-center font-bold w-[7%]">রক্তের গ্রুপ</th>
                  <th className="border border-black p-1 text-center font-bold w-[11%]">মোবাইল</th>
                  <th className="border border-black p-1 text-center font-bold w-[8%]">গ্রাম</th>
                  <th className="border border-black p-1 text-center font-bold w-[6%]">ডাক</th>
                  <th className="border border-black p-1 text-center font-bold w-[6%]">থানা</th>
                  <th className="border border-black p-1 text-center font-bold w-[5%]">জেলা</th>
                </tr>
              </thead>
              <tbody>
                {chunk.map((row, index) => {
                  const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                  return (
                    <tr key={index} className="bg-transparent">
                      <td className="border border-black p-1 text-center align-middle font-medium">
                        {toBengaliNumber(serial)}
                      </td>
                      {/* whitespace-nowrap দেওয়া হয়েছে যেন নাম্বার না ভাঙে */}
                      <td className="border border-black p-1 text-center align-middle font-medium whitespace-nowrap">
                        {toBengaliNumber(row.StudentCode)}
                      </td>
                      <td className="border border-black p-1 text-left pl-2 align-middle leading-tight">
                        {row.StudentName}
                      </td>
                      <td className="border border-black p-1 text-left pl-2 align-middle leading-tight">
                        {row.FatherName}
                      </td>
                      <td className="border border-black p-1 text-left pl-2 align-middle leading-tight">
                        {row.MotherName}
                      </td>
                      <td className="border border-black p-1 text-center align-middle leading-tight whitespace-nowrap">
                        {toBengaliNumber(formatToDDMMYYYY(row.DateOfBirth))}
                      </td>
                      <td className="border border-black p-1 text-center align-middle whitespace-nowrap">
                        {row.BloodGroup}
                      </td>
                      <td className="border border-black p-1 text-center align-middle leading-tight whitespace-nowrap">
                        {toBengaliNumber(row.Mobile1)}
                      </td>
                      <td className="border border-black p-1 text-left pl-1 sm:pl-2 align-middle leading-tight">
                        {row.permanentVill}
                      </td>
                      <td className="border border-black p-1 text-left pl-1 sm:pl-2 align-middle leading-tight">
                        {row.permanentPost}
                      </td>
                      <td className="border border-black p-1 text-left pl-1 sm:pl-2 align-middle leading-tight">
                        {row.PoliceStationName}
                      </td>
                      <td className="border border-black p-1 text-left pl-1 sm:pl-2 align-middle leading-tight">
                        {row.PermanentDistrictName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ফুটার */}
          <div className="mt-auto pt-4 pb-2 text-center w-full text-black text-[14px] font-bold relative z-10">
            পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default AdmissionRegisterSerial;






















// import React, { useEffect, useState } from "react";
// import { formatDate } from "../../../helper/formatTime";
// import { Buffer } from "buffer";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
// import { formatToDDMMYYYY } from "../../../utils/dateFormat";

// const AdmissionRegisterSerial = ({reportData, SessionID}) => {
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();


//     const { data: sessionSData } = useGetSessionsQuery();

//     const sessionData = sessionSData?.find(
//       (i) => i.SessionID === Number(SessionID)
//     );

//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);



//   return (
//     <div className="font-bangla  p-4 bg-white text-xs">
//       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
//         {/* Logo */}
//         <div className="flex justify-center sm:justify-start w-full sm:w-auto">
//           <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
//         </div>

//         {/* Title Section */}
//         <div className="text-center flex-1 bg-white">
//           <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
//             {instutionInfo?.InstitutionName}
//           </h1>
//           <p className="text-base font-semibold bg-white">
//             {instutionInfo?.Address}
//           </p>
//           <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
//             ভর্তি রেজিস্টার : {sessionData?.SessionName}
//           </div>
//         </div>

//         {/* Optional right-aligned blank space */}
//         <div className="hidden sm:block w-20 h-20 bg-white" />
//       </div>

//       <div className="flex justify-end items-center mb-4 bg-white">
//         <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
//       </div>

//       <div className="bg-white px-4">
//         <table className="w-full border-collapse border text-xs border-black bg-white">
//           <thead>
//             <tr className="bg-white text-sm text-black">
//               <th className="border border-black p-2 bg-white">ক্র:</th>
//               <th className="border border-black p-2 bg-white">দাখেলা</th>
//               <th className="border border-black p-2 bg-white">
//                 শিক্ষার্থীর নাম
//               </th>
//               <th className="border border-black p-2 bg-white">পিতার নাম</th>
//               <th className="border border-black p-2 bg-white">মাতার নাম</th>
//               <th className="border border-black p-2 bg-white">জন্ম তারিখ</th>
//               <th className="border border-black p-2 bg-white">শ্রেণী/জামাত</th>
//               <th className="border border-black p-2 bg-white">মোবাইল</th>
//               <th className="border border-black p-2 bg-white">গ্রাম</th>
//               <th className="border border-black p-2 bg-white">ডাক </th>
//               <th className="border border-black p-2 bg-white">থানা</th>
//               <th className="border border-black p-2 bg-white">জেলা</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((row, index) => (
//               <tr key={index} className="bg-white">
//                 <td className="border border-black p-2 text-center bg-white">
//                   {index + 1}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.StudentCode}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.StudentName}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.FatherName}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.MotherName}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {formatToDDMMYYYY(row.DateOfBirth)}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.BloodGroup}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.Mobile1}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.permanentVill}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.permanentPost}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.PoliceStationName}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.PermanentDistrictName}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdmissionRegisterSerial
