import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { formatDate } from "../../../helper/formatTime";

const JamaatWariBookList = ({ reportData, SubClassID }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );

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

  // প্রতি পেজে ২২টি রো
  const ROWS_PER_PAGE = 22;
  const chunks = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
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

      {chunks.map((chunk, pageIndex) => (
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
                <div className="text-black border-b-4 border-r-4 border-black border-solid px-4 py-1 inline-block mt-2 sm:mt-3 tracking-widest bg-white text-base font-bold sm:text-lg">
                  মারহালা/ক্লাসওয়ারী কিতাবের নাম
                </div>
              </div>
              <div className="hidden sm:block w-20 h-20 bg-white" />
            </div>

            {/* তথ্য সারি */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-4 bg-white">
              <div className="text-base sm:text-lg font-semibold">
                শ্রেণি/জামাত : {subClasData?.SubClass || ''}
              </div>
              <div className="text-sm sm:text-base font-medium">
                প্রিন্ট {toBengaliNumber(formatDate(new Date()))}
              </div>
            </div>

            {/* টেবিল */}
            <div className="w-full flex-grow">
              <table className="w-full border-collapse border border-black bg-white">
                <thead>
                  <tr className="bg-white text-sm text-black">
                    <th className="border border-black p-2 bg-white w-[10%]">ক্রমিক নং</th>
                    <th className="border border-black p-2 bg-white w-[35%]">কিতাবের বাংলা নাম</th>
                    <th className="border border-black p-2 bg-white w-[35%]">কিতাবের আরবি নাম</th>
                    <th className="border border-black p-2 bg-white w-[20%]">الصف</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((row, index) => {
                    const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                    return (
                      <tr key={index} className="bg-white">
                        <td className="border border-black p-2 text-center bg-white">
                          {toBengaliNumber(serial)}
                        </td>
                        <td className="border border-black p-2 text-center bg-white">
                          {row.SubjectName}
                        </td>
                        <td className="border border-black p-2 text-center bg-white" dir="rtl">
                          {row.ArabicSubject}
                        </td>
                        <td className="border border-black p-2 text-center bg-white" dir="rtl">
                          {row.SubSerial}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

export default JamaatWariBookList;

















// import React, { useEffect, useState } from "react";
// import { formatDate } from "../../../helper/formatTime";
// import { Buffer } from "buffer";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";

// const JamaatWariBookList = ({reportData, SubClassID}) => {
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   console.log(reportData);

//  const { data: subClassListData } = useGetSubClassListQuery();
//   const subClasData = subClassListData?.find(
//     (i) => i.SubClassID === Number(SubClassID)
//   );
//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);



//   return (
//            <div className="font-bangla  p-4 bg-white text-xs">

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
//           <div className="text-black border-b-4 border-r-4 border-black border-solid px-4 py-1 inline-block mt-2 sm:mt-3 tracking-widest bg-white text-base font-bold sm:text-lg">
//             মারহালা/ক্লাসওয়ারী কিতাবের নাম
//           </div>
//         </div>

//         {/* Optional right-aligned blank space */}
//         <div className="hidden sm:block w-20 h-20 bg-white" />
//       </div>

//       <div className="flex justify-between items-center mb-4 bg-white my-3">
//         <div className="flex gap-2 font-semibold text-base items-center bg-white">
//          শ্রেণি/জামাত : {subClasData?.SubClass}
//         </div>
//         <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
//       </div>

//       <div className="bg-white">
//         <table className="w-full border-collapse border border-black bg-white">
//           <thead>
//             <tr className="bg-white text-sm text-black">
//               <th className="border border-black p-2 bg-white">ক্রমিক নং</th>
//               <th className="border border-black p-2 bg-white">
//                 কিতাবের বাংলা নাম
//               </th>
//               <th className="border border-black p-2 bg-white">
//                 কিতাবের আরবি নাম
//               </th>
//               <th className="border border-black p-2 bg-white">الصف</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((row, index) => (
//               <tr key={index} className="bg-white">
//                 <td className="border border-black p-2 text-center bg-white">
//                   {index + 1}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.SubjectName}
//                 </td>
//                 <td
//                   className="border border-black p-2 text-center bg-white"
//                   dir="rtl"
//                 >
//                   {row.ArabicSubject}
//                 </td>
//                 <td
//                   className="border border-black p-2 text-center bg-white"
//                   dir="rtl"
//                 >
//                   {row.SubSerial}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default JamaatWariBookList;
