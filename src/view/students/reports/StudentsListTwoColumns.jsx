import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";

const StudentsListTwoColumns = ({ reportData }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  // ইংরেজি সংখ্যাকে বাংলায় রূপান্তরের ফাংশন
  const toBengaliNumber = (num) => {
    if (!num) return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (x) => bengaliDigits[x]);
  };

  const ROWS_PER_COLUMN = 22; // প্রতি কলামে ২২টি রো
  const ROWS_PER_PAGE = ROWS_PER_COLUMN * 2; // প্রতি পৃষ্ঠায় ৪৪ জন

  // পৃষ্ঠা ভিত্তিক ডেটা চাঙ্ক করা
  const pages = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const pageArray = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      const pageData = reportData.slice(i, i + ROWS_PER_PAGE);
      // বাম কলাম ও ডান কলামে ভাগ
      const leftColumn = pageData.slice(0, ROWS_PER_COLUMN);
      const rightColumn = pageData.slice(ROWS_PER_COLUMN, ROWS_PER_PAGE);
      pageArray.push({ leftColumn, rightColumn });
    }
    return pageArray;
  }, [reportData]);

  return (
    <div className="font-bangla bg-white text-xs p-2 sm:p-4">
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
            }
            .print-page-container {
              page-break-after: always;
              page-break-inside: avoid;
              break-after: page;
              height: 277mm;
              position: relative;
              box-sizing: border-box;
              margin-bottom: 10mm;
            }
            .print-page-container:last-child {
              page-break-after: auto;
              break-after: auto;
              margin-bottom: 0;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse !important;
              table-layout: fixed;
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
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
          }
        `}
      </style>

      {pages.map((page, pageIndex) => (
        <div key={pageIndex} className="print-page-container">
          <div className="p-3 sm:p-4 bg-white min-h-[277mm] flex flex-col">
            {/* হেডার */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0 bg-white">
              <div className="flex justify-center sm:justify-start w-full sm:w-auto">
                {logo && (
                  <img src={logo} alt="Logo" className="w-20 h-20 bg-white object-contain" />
                )}
              </div>
              <div className="text-center flex-1 bg-white">
                <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
                  {instutionInfo?.InstitutionName}
                </h1>
                <p className="text-base font-semibold bg-white">
                  {instutionInfo?.Address}
                </p>
                <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 bg-white text-base font-bold sm:text-lg">
                  শিক্ষার্থীদের সংক্ষিপ্ত তালিকা
                </div>
              </div>
              <div className="hidden sm:block w-20 h-20 bg-white" />
            </div>

            {/* টাইটেল ও প্রিন্ট তারিখ */}
            <div className="grid grid-cols-7 items-center mb-4 px-4 py-2 bg-white">
              <div className="col-span-1"></div>
              <div className="col-span-5 text-center">
                <div className="inline-block border-b-4 border-black px-6 py-2">
                  <span className="text-black font-bold text-base sm:text-lg md:text-xl tracking-wider">
                    শিক্ষাবর্ষ : {toBengaliNumber(reportData?.[0]?.SessionName || "২০২৫-২৬")}
                  </span>
                </div>
              </div>
              <div className="col-span-1 flex justify-end">
                <span className="text-black font-medium text-xs sm:text-sm md:text-base">
                  প্রিন্ট {toBengaliNumber(formatDate(new Date()))}
                </span>
              </div>
            </div>

            {/* দুই কলাম টেবিল */}
            <div className="grid grid-cols-2 gap-2 w-full flex-grow">
              {/* বাম কলাম */}
              <div className="bg-white">
                <table className="w-full border-collapse border border-black bg-white">
                  <thead>
                    <tr className="bg-white text-sm text-black">
                      <th className="border border-black p-1 text-center bg-white w-[10%]">ক্র:</th>
                      <th className="border border-black p-1 text-center bg-white w-[20%]">দাখেলা</th>
                      <th className="border border-black p-1 text-center bg-white w-[40%]">শিক্ষার্থীর নাম</th>
                      <th className="border border-black p-1 text-center bg-white w-[30%]">পিতার নাম</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.leftColumn?.map((s, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(idx + 1 + pageIndex * ROWS_PER_PAGE)}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(s.StudentCode)}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {s.StudentName}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {s.FatherName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ডান কলাম */}
              <div className="bg-white">
                <table className="w-full border-collapse border border-black bg-white">
                  <thead>
                    <tr className="bg-white text-sm text-black">
                      <th className="border border-black p-1 text-center bg-white w-[10%]">ক্র:</th>
                      <th className="border border-black p-1 text-center bg-white w-[20%]">দাখেলা</th>
                      <th className="border border-black p-1 text-center bg-white w-[40%]">শিক্ষার্থীর নাম</th>
                      <th className="border border-black p-1 text-center bg-white w-[30%]">পিতার নাম</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.rightColumn?.map((s, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(idx + 1 + pageIndex * ROWS_PER_PAGE + ROWS_PER_COLUMN)}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(s.StudentCode)}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {s.StudentName}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {s.FatherName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ফুটার */}
            <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
              পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentsListTwoColumns;


















// import React from "react";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import bnBijoy2Unicode from "../../../utils/conveter";

// const StudentsListTwoColumns = ({ reportData }) => {
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   // দুইভাগে ভাগ করা হচ্ছে
//   const mid = Math.ceil(reportData?.length / 2);
//   const firstHalf = reportData?.slice(0, mid);
//   const secondHalf = reportData?.slice(mid);

//   return (
//     <div className="bg-white p-8 text-black text-sm">
//       {/* Header */}
//       <div className="text-center space-y-2">
//         <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
//           {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
//         </h1>
//         <p className="text-base font-semibold text-gray-700">
//           {bnBijoy2Unicode(instutionInfo?.Address)}
//         </p>
//       </div>

//       {/* Title and Print Date */}
//       <div className="grid grid-cols-7 items-center mb-6 px-4 py-3 gap-4">
//         <div className="col-span-1"></div>
//         <div className="col-span-5 text-center">
//           <div className="inline-block border-b-4 border-black px-6 py-2">
//             <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wider">
//               শিক্ষার্থীদের সংক্ষিপ্ত তালিকা, শিক্ষাবর্ষ-২০২৫-২৬,
//               শ্রেণী/জামাত-হিফজ(ক)
//             </h2>
//           </div>
//         </div>
//         <div className="col-span-1 flex justify-end">
//           <p className="text-sm sm:text-base font-medium text-gray-600">
//             প্রিন্ট তারিখ: {new Date().toLocaleDateString("bn-BD")}
//           </p>
//         </div>
//       </div>

//       {/* Table Section */}
//       <div className="overflow-x-auto">
//         <div className="w-full bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
//           {/* First Half Table */}
//           <table className="min-w-full border border-black border-collapse bg-white">
//             <thead className="bg-white">
//               <tr className="text-center text-sm">
//                 <th className="border border-black px-2 py-1">ক্র:</th>
//                 <th className="border border-black px-2 py-1">দাখেলা</th>
//                 <th className="border border-black px-2 py-1">শিক্ষার্থীর নাম</th>
//                 <th className="border border-black px-2 py-1">পিতার নাম</th>
//               </tr>
//             </thead>
//             <tbody>
//               {firstHalf?.map((s, idx) => (
//                 <tr key={idx} className="text-center bg-white">
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {idx + 1}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {s.StudentCode}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {bnBijoy2Unicode(s.StudentName)}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {bnBijoy2Unicode(s.FatherName)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Second Half Table */}
//           <table className="min-w-full border border-black border-collapse bg-white">
//             <thead className="bg-white">
//               <tr className="text-center text-sm">
//                 <th className="border border-black px-2 py-1">ক্র:</th>
//                 <th className="border border-black px-2 py-1">দাখেলা</th>
//                 <th className="border border-black px-2 py-1">শিক্ষার্থীর নাম</th>
//                 <th className="border border-black px-2 py-1">পিতার নাম</th>
//               </tr>
//             </thead>
//             <tbody>
//               {secondHalf?.map((s, idx) => (
//                 <tr key={idx} className="text-center bg-white">
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {mid + idx + 1}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {s.StudentCode}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {bnBijoy2Unicode(s.StudentName)}
//                   </td>
//                   <td className="border border-black px-2 py-1 bg-white">
//                     {bnBijoy2Unicode(s.FatherName)}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentsListTwoColumns;
