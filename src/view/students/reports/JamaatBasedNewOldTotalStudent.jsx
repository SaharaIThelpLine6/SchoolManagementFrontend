import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";

const JamaatBasedNewOldTotalStudent = ({ reportData }) => {
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

  // মোট হিসাব
  const totalNew = reportData?.reduce((sum, item) => sum + (item.new || 0), 0) || 0;
  const totalOld = reportData?.reduce((sum, item) => sum + (item.old || 0), 0) || 0;
  const total = totalNew + totalOld;

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

      <div className="print-page-container">
        <div className="p-3 sm:p-4 bg-white min-h-[277mm] flex flex-col">
          {/* হেডার: লোগো, প্রতিষ্ঠান, টাইটেল */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-0 bg-white">
            {/* বামে লোগো */}
            <div className="flex justify-center sm:justify-start w-full sm:w-auto">
              {logo && (
                <img src={logo} alt="Logo" className="w-20 h-20 bg-white object-contain" />
              )}
            </div>

            {/* মাঝে টাইটেল */}
            <div className="text-center flex-1 bg-white">
              <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
                {instutionInfo?.InstitutionName}
              </h1>
              <p className="text-base font-semibold bg-white">
                {instutionInfo?.Address}
              </p>
              {instutionInfo?.ContactNumber && (
                <p className="text-sm font-medium bg-white">
                  {instutionInfo?.ContactNumber}
                </p>
              )}
            </div>

            {/* ডানে খালি (প্রতিসাম্যের জন্য) */}
            <div className="hidden sm:block w-20 h-20 bg-white" />
          </div>

          {/* টাইটেল বক্স ও প্রিন্ট তারিখ */}
          <div className="grid grid-cols-5 items-center mb-4 bg-white px-4 py-2">
            <div className="col-span-1"></div>
            <div className="col-span-3 text-center">
              <div className="inline-block border-b-4 border-black px-4 py-1">
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

          {/* টেবিল */}
          <div className="w-full flex-grow">
            <table className="w-full border-collapse border border-black bg-white">
              <thead>
                <tr className="bg-white text-sm text-black">
                  <th className="border border-black p-2 text-center bg-white w-[15%]">ক্রমিক নং</th>
                  <th className="border border-black p-2 text-center bg-white w-[30%]">শ্রেণীর/জামাত</th>
                  <th className="border border-black p-2 text-center bg-white w-[18%]">নতুন শিক্ষার্থী</th>
                  <th className="border border-black p-2 text-center bg-white w-[18%]">পুরাতন শিক্ষার্থী</th>
                  <th className="border border-black p-2 text-center bg-white w-[19%]">মোট শিক্ষার্থী</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.map((row, index) => (
                  <tr key={index} className="bg-white">
                    <td className="border border-black p-2 text-center bg-white">
                      {toBengaliNumber(index + 1)}
                    </td>
                    <td className="border border-black p-2 text-center bg-white">
                      {row.ClassName}
                    </td>
                    <td className="border border-black p-2 text-center bg-white">
                      {toBengaliNumber(row.new)}
                    </td>
                    <td className="border border-black p-2 text-center bg-white">
                      {toBengaliNumber(row.old)}
                    </td>
                    <td className="border border-black p-2 text-center bg-white">
                      {toBengaliNumber(row.Total)}
                    </td>
                  </tr>
                ))}
                {/* মোট সারি */}
                <tr className="bg-white font-bold">
                  <td className="border border-black p-2 text-center bg-white" colSpan={2}>
                    মোট শিক্ষার্থী
                  </td>
                  <td className="border border-black p-2 text-center bg-white">
                    {toBengaliNumber(totalNew)}
                  </td>
                  <td className="border border-black p-2 text-center bg-white">
                    {toBengaliNumber(totalOld)}
                  </td>
                  <td className="border border-black p-2 text-center bg-white">
                    {toBengaliNumber(total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ফুটার: পৃষ্ঠা নম্বর */}
          <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
            পৃষ্ঠা : ১
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamaatBasedNewOldTotalStudent;

























// import React, { useEffect, useState } from "react";
// import bnBijoy2Unicode from "../../../utils/conveter";
// import { Buffer } from "buffer";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";

// const JamaatBasedNewOldTotalStudent = ({ reportData }) => {
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);


//   // উপরের দিকে যুক্ত করুন
//   const totalNew = reportData?.reduce((sum, item) => sum + item.new, 0) || 0;
//   const totalOld = reportData?.reduce((sum, item) => sum + item.old, 0) || 0;
//   const total = totalNew + totalOld;

//   return (
//           <div className="font-bangla  p-4 bg-white text-xs">

//       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
//         {/* Logo */}
//         <div className="flex justify-center sm:justify-start w-full sm:w-auto">
//           <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
//         </div>

//         {/* Title Section */}
//         <div className="text-center flex-1 bg-white">
//           <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
//             {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
//           </h1>
//           <p className="text-base font-semibold bg-white">
//             {bnBijoy2Unicode(instutionInfo?.Address)}
//           </p>
//           <p className="text-base font-semibold bg-white">
//             {instutionInfo?.ContactNumber}
//           </p>
//         </div>

//         {/* Optional right-aligned blank space */}
//         <div className="hidden sm:block w-20 h-20 bg-white" />
//       </div>

//       <div className="grid grid-cols-5 items-center mb-4 bg-white px-4 py-2">
//         {/* Empty spacer column */}
//         <div className="col-span-1"></div>

//         {/* Main title */}
//         <div className="col-span-3 text-center">
//           <div className="inline-block border-b-4 border-black px-4 py-1">
//             <span className="text-black font-bold text-base sm:text-lg md:text-xl tracking-wider">
//               শিক্ষাবর্ষ : ২০২৫-২৬
//             </span>
//           </div>
//         </div>

//         {/* Print date */}
//         <div className="col-span-1 flex justify-end">
//           <span className="text-black font-medium text-xs sm:text-sm md:text-base">
//             প্রিন্ট: {new Date().toLocaleDateString("bn-BD")}
//           </span>
//         </div>
//       </div>

//       <div className="bg-white">
//         <table className="w-full border-collapse border border-black bg-white">
//           <thead>
//             <tr className="bg-white text-sm text-black">
//               <th className="border border-black p-2 w-[100px] bg-white">
//                 ক্রমিক নং
//               </th>
//               <th className="border border-black p-2 w-[250px] bg-white">
//                 শ্রেণীর/জামাত
//               </th>
//               <th className="border border-black p-2 w-[200px] bg-white">
//                 নতুন শিক্ষার্থী
//               </th>
//               <th className="border border-black p-2 w-[200px] bg-white">
//                 পুরাতন শিক্ষার্থী
//               </th>
//               <th className="border border-black p-2 w-[200px] bg-white">
//                 মোট শিক্ষার্থী
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((row, index) => (
//               <tr key={index} className="bg-white">
//                 <td className="border border-black p-2 text-center w-[100px] bg-white">
//                   {index + 1}
//                 </td>
//                 <td className="border border-black p-2 text-center w-[250px] bg-white">
//                   {row.ClassName}
//                 </td>
//                 <td className="border border-black p-2 text-center w-[200px] bg-white">
//                   {row.new}
//                 </td>
//                 <td className="border border-black p-2 text-center w-[200px] bg-white">
//                   {row.old}
//                 </td>
//                 <td className="border border-black p-2 text-center w-[200px] bg-white">
//                   {row.Total}
//                 </td>
//               </tr>
//             ))}
//             {/* Total Row */}
//             <tr className="bg-white font-bold">
//               <td className="border border-black p-2 text-center" colSpan={2}>
//                 মোট শিক্ষার্থী
//               </td>
//               <td className="border border-black p-2 text-center">
//                 {totalNew}
//               </td>
//               <td className="border border-black p-2 text-center">
//                 {totalOld}
//               </td>
//               <td className="border border-black p-2 text-center">{total}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default JamaatBasedNewOldTotalStudent;
