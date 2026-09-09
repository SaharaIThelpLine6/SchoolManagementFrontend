import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { formatDate } from "../../../helper/formatTime";

const BanglaAttendenceSubjectWari = ({ reportData, SubClassID, BookLine }) => {
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

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const [attendance, setAttendance] = useState({});
  const toggleAttendance = (studentId, day) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${day}`]: !prev[`${studentId}-${day}`],
    }));
  };

  // প্রতি পেজে ২২ জন
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
              font-size: 8px;
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
                  <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 bg-white object-contain" />
                )}
              </div>
              <div className="text-center flex-1 bg-white">
                <h1 className="text-lg sm:text-xl font-extrabold bg-white">
                  {instutionInfo?.InstitutionName}
                </h1>
                <p className="text-xs sm:text-sm font-semibold bg-white">
                  {instutionInfo?.Address}
                </p>
                <div className="text-black border-2 border-black px-3 py-1 inline-block mt-1 sm:mt-2 rounded-xl tracking-widest bg-white text-sm font-medium">
                  দৈনিক শিক্ষার্থীর হাজিরা খাতা (বিষয়ওয়ারী)
                </div>
              </div>
              <div className="hidden sm:block w-16 h-16 sm:w-20 sm:h-20 bg-white" />
            </div>

            {/* তথ্য সারি */}
            <div className="grid grid-cols-2 my-2 bg-white">
              <div className="font-normal text-xs sm:text-sm py-1 px-2 text-start">
                শ্রেণী/জামাত: {subClasData?.SubClass || ''}
              </div>
              <div className="grid grid-cols-2 px-2">
                <div className="font-normal text-xs sm:text-sm py-1 text-start">
                  মাস:{" "}
                </div>
                <div className="font-normal text-xs sm:text-sm py-1 text-start">
                  বছর:{" "}
                </div>
              </div>
            </div>

            {/* টেবিল */}
            <div className="w-full flex-grow overflow-x-auto">
              <table className="w-full border-collapse table-fixed text-xs">
                <thead>
                  <tr>
                    <th className="border border-black bg-white text-center w-8 h-5 sm:w-10 sm:h-6">
                      ক্র.নং
                    </th>
                    <th className="border border-black bg-white text-center w-10 h-5 sm:w-16 sm:h-6">
                      দাখেলা
                    </th>
                    <th className="border border-black bg-white min-w-[120px] sm:min-w-[150px] h-5 sm:h-6" colSpan={2}>
                      ছাত্র/ছাত্রীর নাম
                    </th>
                    {days.map((day) => (
                      <th key={day} className="border border-black text-center bg-white w-5 h-5 sm:w-6 sm:h-6">
                        {toBengaliNumber(day)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((student, index) => {
                    const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                    return (
                      <tr key={index}>
                        <td className="border border-black text-center bg-white w-8 h-5 sm:w-10 sm:h-6 p-0 align-middle">
                          {toBengaliNumber(serial)}
                        </td>
                        <td className="border border-black text-center bg-white w-10 h-5 sm:w-14 sm:h-6 p-0 align-middle">
                          {toBengaliNumber(student.StudentCode)}
                        </td>
                        <td className="border border-black bg-white min-w-[120px] sm:min-w-[150px] h-5 sm:h-6 px-1 py-0.5">
                          {student.StudentName}
                        </td>
                        <td className="border border-black bg-white w-5 h-5 sm:w-6 sm:h-6 text-center p-0">
                          {Array.from({ length: BookLine ? BookLine : 3 }).map((_, i) => (
                            <div key={i} className="border-b border-black h-2 text-sm sm:h-6">
                              {toBengaliNumber(i + 1)}
                            </div>
                          ))}
                        </td>
                        {days.map((day) => (
                          <td
                            key={day}
                            className={`border border-black text-center cursor-pointer w-5 h-5 sm:w-6 sm:h-6 p-0 align-middle ${
                              attendance[`${student.id}-${day}`] ? "bg-green-200" : "bg-white"
                            }`}
                            onClick={() => toggleAttendance(student.id, day)}
                          >
                            {Array.from({ length: BookLine ? BookLine : 3 }).map((_, i) => (
                              <div
                                key={i}
                                className="border-b border-black h-2 sm:h-6 w-5 sm:w-6"
                              >
                                {attendance[`${student.id}-${day}-${i}`] ? "✓" : ""}
                              </div>
                            ))}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ফুটার */}
            <div className="flex flex-wrap justify-between mt-4 pt-3 text-xs">
              <div className="border-t border-black w-50 text-center">
                <span className="font-normal">মোট কার্য দিবস: </span>
              </div>
              <div className="border-t border-black w-50 text-center">
                <span className="font-normal">শিক্ষক/শিক্ষিকার স্বাক্ষর: </span>
              </div>
              <div className="text-center w-full text-black text-[14px] font-bold mt-3">
                পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BanglaAttendenceSubjectWari;








// import React, { useEffect, useState } from "react";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import bnBijoy2Unicode from "../../../utils/conveter";
// import { Buffer } from "buffer";
// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";

// const BanglaAttendenceSubjectWari = ({ reportData, SubClassID, BookLine }) => {
//   const [logo, setLogo] = useState(null);


//  const { data: subClassListData } = useGetSubClassListQuery();
//   const subClasData = subClassListData?.find(
//     (i) => i.SubClassID === Number(SubClassID)
//   );

//   const { data: instutionInfo } = useGetInstitutionInfoQuery();
//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString("base64");
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);

  

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);

//   const [attendance, setAttendance] = useState({});

//   const toggleAttendance = (studentId, day) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [`${studentId}-${day}`]: !prev[`${studentId}-${day}`],
//     }));
//   };

//   return (
//        <div className="font-bangla  p-4 bg-white text-xs">

//       <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-0 gap-4 sm:gap-0 bg-white">
//         <div className="flex justify-center sm:justify-start w-full sm:w-auto">
//           <img
//             src={logo}
//             alt="Logo"
//             className="w-16 h-16 sm:w-20 sm:h-20 bg-white"
//           />
//         </div>

//         <div className="text-center flex-1 bg-white">
//           <h1 className="text-lg sm:text-xl font-extrabold bg-white">
//             {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
//           </h1>
//           <p className="text-xs sm:text-sm font-semibold bg-white">
//             {bnBijoy2Unicode(instutionInfo?.Address)}
//           </p>
//           <div className="text-black border-2 border-black px-3 py-1 inline-block mt-1 sm:mt-2 rounded-xl tracking-widest bg-white text-sm font-medium">
//             দৈনিক শিক্ষার্থীর হাজিরা খাতা
//           </div>
//         </div>

//         <div className="hidden sm:block w-16 h-16 sm:w-20 sm:h-20 bg-white" />
//       </div>

//       <div className="grid grid-cols-2 my-2">
//         <div className="font-normal text-xs sm:text-sm py-1 px-2 text-start">
//           শ্রেণী/জামাত: {bnBijoy2Unicode(subClasData?.SubClass)}
//         </div>
//         <div className="grid grid-cols-2 px-2">
//           <div className="font-normal text-xs sm:text-sm py-1 text-start">
//             মাস:{" "}
//           </div>
//           <div className="font-normal text-xs sm:text-sm py-1 text-start">
//             বছর:{" "}
//           </div>
//         </div>
//       </div>

//       <div>
//         <table className="w-full border-collapse table-fixed text-xs">
//           <thead>
//             <tr>
//               <th className="border border-black bg-white text-center w-8 h-5 sm:w-10 sm:h-6">
//                 ক্র.নং
//               </th>
//               <th className="border border-black bg-white text-center w-10 h-5 sm:w-16 sm:h-6">
//                 দাখেলা
//               </th>
//               <th
//                 className="border border-black bg-white min-w-[120px] sm:min-w-[150px] h-5 sm:h-6"
//                 colSpan={2}
//               >
//                 ছাত্র/ছাত্রীর নাম
//               </th>
//               {days.map((day) => (
//                 <th
//                   key={day}
//                   className="border border-black text-center bg-white w-5 h-5 sm:w-6 sm:h-6"
//                 >
//                   {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((student, index) => (
//               <tr key={index}>
//                 <td className="border border-black text-center bg-white w-8 h-5 sm:w-10 sm:h-6 p-0 align-middle">
//                   {index + 1}
//                 </td>
//                 <td className="border border-black text-center bg-white w-10 h-5 sm:w-14 sm:h-6 p-0 align-middle">
//                   {student.StudentCode}
//                 </td>
//                 <td className="border border-black bg-white min-w-[120px] sm:min-w-[150px] h-5 sm:h-6 px-1 py-0.5">
//                   {bnBijoy2Unicode(student.StudentName)}
//                 </td>
//                 <td className="border border-black bg-white w-5 h-5 sm:w-6 sm:h-6 text-center p-0">
//                   {Array.from({ length: BookLine ? BookLine : 3}).map((_, i) => (
//                     <div key={i} className="border-b border-black h-2 text-sm sm:h-6">
//                       {i + 1}
//                     </div>
//                   ))}
//                 </td>
//                 {days.map((day) => (
//                   <td
//                     key={day}
//                     className={`border border-black text-center cursor-pointer w-5 h-5 sm:w-6 sm:h-6 p-0 align-middle ${
//                       attendance[`${student.id}-${day}`]
//                         ? "bg-green-200"
//                         : "bg-white"
//                     }`}
//                     onClick={() => toggleAttendance(student.id, day)}
//                   >
//                     {Array.from({ length: BookLine ? BookLine : 3 }).map((_, i) => (
//                       <div
//                         key={i}
//                         className="border-b border-black h-2 sm:h-6 w-5 sm:w-6"
//                       >
//                         {attendance[`${student.id}-${day}`] === i + 1
//                           ? "✓"
//                           : ""}
//                       </div>
//                     ))}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default BanglaAttendenceSubjectWari;
