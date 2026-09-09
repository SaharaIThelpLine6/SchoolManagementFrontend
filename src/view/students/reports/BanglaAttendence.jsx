import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { formatDate } from "../../../helper/formatTime";

const BanglaAttendence = ({ reportData, SubClassID, SessionID }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
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

  // প্রতি পেজে ২২ জন শিক্ষার্থী
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
              font-size: 8px; /* ছোট ফন্ট যাতে ৩১ দিন ফিট হয় */
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
                <p className="text-sm font-semibold bg-white">
                  {instutionInfo?.Address}
                </p>
                <div className="text-black border-2 border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded-xl tracking-widest bg-white text-sm font-medium sm:text-base">
                  দৈনিক শিক্ষার্থীর হাজিরা খাতা
                </div>
              </div>
              <div className="hidden sm:block w-16 h-16 sm:w-20 sm:h-20 bg-white" />
            </div>

            {/* তথ্য সারি */}
            <div className="flex justify-between my-3 bg-white">
              <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
                শ্রেণী/জামাত: {subClasData?.SubClass || ''}
              </div>
              <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
                শিক্ষাবর্ষ: {sessionData?.SessionName || ''}
              </div>
              <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
                সন:
              </div>
              <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
                হিজরী:
              </div>
              <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
                মাস:
              </div>
            </div>

            {/* টেবিল */}
            <div className="w-full flex-grow overflow-x-auto">
              <table className="w-full border-collapse table-fixed text-xs">
                <thead>
                  <tr>
                    <th className="border border-black bg-white text-center w-10 h-6">ক্র.নং</th>
                    <th className="border border-black bg-white text-center w-16 h-6">দাখেলা</th>
                    <th className="border border-black bg-white min-w-[130px] h-6">ছাত্র/ছাত্রীর নাম</th>
                    {days.map((day) => (
                      <th key={day} className="border border-black text-center bg-white w-4 h-6">
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
                        <td className="border border-black text-center bg-white w-10 h-6 p-0 align-middle">
                          {toBengaliNumber(serial)}
                        </td>
                        <td className="border border-black text-center bg-white w-16 h-6 p-0 align-middle">
                          {toBengaliNumber(student.StudentCode)}
                        </td>
                        <td className="border border-black bg-white min-w-[130px] h-6 px-1 py-0.5">
                          {student.StudentName}
                        </td>
                        {days.map((day) => (
                          <td
                            key={day}
                            className={`border border-black text-center cursor-pointer w-4 h-6 p-0 align-middle ${
                              attendance[`${student.id}-${day}`] ? "bg-green-200" : "bg-white"
                            }`}
                            onClick={() => toggleAttendance(student.id, day)}
                          >
                            {attendance[`${student.id}-${day}`] ? "✓" : ""}
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

export default BanglaAttendence;






















// import React, { useEffect, useState } from "react";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { Buffer } from "buffer";
// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
// import { useGetSessionsQuery } from "../../../features/session/sessionSlice";

// const BanglaAttendence = ({ reportData, SubClassID, SessionID }) => {
//   const [logo, setLogo] = useState(null);


//   const { data: subClassListData } = useGetSubClassListQuery();
//   const subClasData = subClassListData?.find(
//     (i) => i.SubClassID === Number(SubClassID)
//   );
//   const { data: sessionSData } = useGetSessionsQuery();

//   const sessionData = sessionSData?.find(
//     (i) => i.SessionID === Number(SessionID)
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
//          <div className="font-bangla  p-4 bg-white text-xs">

//       {/* Added text-xs */}
//       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
//         {/* Logo */}
//         <div className="flex justify-center sm:justify-start w-full sm:w-auto">
//           <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />
//         </div>

//         {/* Title Section */}
//         <div className="text-center flex-1 bg-white">
//           <h1 className="text-lg sm:text-xl font-extrabold bg-white">
//             {/* Reduced from text-xl sm:text-2xl */}
//             {instutionInfo?.InstitutionName}
//           </h1>
//           <p className="text-sm font-semibold bg-white">
//             {/* Reduced from text-base */}
//             {instutionInfo?.Address}
//           </p>
//           <div className="text-black border-2 border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded-xl tracking-widest bg-white text-sm font-medium sm:text-base">
//             {/* Reduced from text-lg sm:text-lg */}
//             দৈনিক শিক্ষার্থীর হাজিরা খাতা
//           </div>
//         </div>

//         {/* Optional right-aligned blank space */}
//         <div className="hidden sm:block w-20 h-20 bg-white" />
//       </div>
//       <div className="flex justify-between my-3 bg-gray-50">
//         <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
//           {/* Reduced from text-sm */}
//           শ্রেণী/জামাত: {subClasData?.SubClass}
//         </div>
//         <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
//           শিক্ষাবর্ষ: {sessionData?.SessionName}
//         </div>
//         <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
//           সন: 
//         </div>
//         <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
//           হিজরী:
//         </div>
//         <div className="flex-1 basis-0 min-w-0 font-bold text-xs border border-black py-1 px-2 text-center">
//           মাস:
//         </div>
//       </div>
//       <div>
//         <table className="w-full border-collapse table-fixed text-xs">
//           {" "}
//           {/* Added text-xs */}
//           <thead>
//             <tr>
//               <th className="border border-black bg-white text-center w-10 h-6">
//                 {" "}
//                 {/* Removed text-sm */}
//                 ক্র.নং
//               </th>
//               <th className="border border-black bg-white text-center w-20 h-6">
//                 দাখেলা
//               </th>
//               <th className="border border-black bg-white min-w-[150px] h-6">
//                 ছাত্র/ছাত্রীর নাম
//               </th>
//               {days.map((day) => (
//                 <th
//                   key={day}
//                   className="border border-black text-center bg-white w-6 h-6"
//                 >
//                   {day}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((student, index) => (
//               <tr key={index}>
//                 <td className="border border-black text-center bg-white w-10 h-6 p-0 align-middle">
//                   {index + 1}
//                 </td>
//                 <td className="border border-black text-center bg-white w-10 h-6 p-0 align-middle">
//                   {student.StudentCode}
//                 </td>
//                 <td className="border border-black bg-white min-w-[150px] h-6 px-1 py-0.5">
//                   {student.StudentName}
//                 </td>
//                 {days.map((day) => (
//                   <td
//                     key={day}
//                     className={`border border-black text-center cursor-pointer w-6 h-6 p-0 align-middle ${
//                       attendance[`${student.id}-${day}`]
//                         ? "bg-green-200"
//                         : "bg-white"
//                     }`}
//                     onClick={() => toggleAttendance(student.id, day)}
//                   >
//                     {attendance[`${student.id}-${day}`] ? "✓" : ""}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <div className="flex flex-wrap justify-between mt-6 p-3 text-xs">
//         {" "}
//         {/* Added text-xs */}
//         <div className="border-t border-black w-50 text-center">
//           <span className="font-normal">মোট কার্য দিবস: </span>
//         </div>
//         <div className="border-t border-black w-50 text-center">
//           <span className="font-normal">শিক্ষক/শিক্ষিকার স্বাক্ষর: </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BanglaAttendence;
