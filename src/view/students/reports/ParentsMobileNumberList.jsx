import { Buffer } from 'buffer';
import { useEffect, useMemo, useState } from 'react';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import { formatDate } from '../../../helper/formatTime';

const ParentsMobileNumberList = ({ reportData, SubClassID, SessionID }) => {
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
      const base64String = buffer.toString('base64');
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
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4 sm:gap-8 bg-white">
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
                <div className="inline-block border-b-2 border-black px-4 py-1 mt-2">
                  <span className="text-base sm:text-lg font-bold tracking-wider">
                    অভিভাবকের মোবাইল
                  </span>
                </div>
              </div>
              <div className="hidden sm:block w-20 h-20 bg-white" />
            </div>

            {/* তথ্য সারি */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-8 bg-white">
              <div className="text-base sm:text-lg font-semibold">
                শ্রেণী/জামাত : {subClasData?.SubClass || ''}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-base sm:text-lg font-bold">
                  শিক্ষাবর্ষ : {sessionData?.SessionName || ''}
                </div>
                <div className="text-sm sm:text-base font-medium">
                  প্রিন্ট {toBengaliNumber(formatDate(new Date()))}
                </div>
              </div>
            </div>

            {/* টেবিল */}
            <div className="w-full flex-grow">
              <table className="w-full border-collapse border border-black bg-white">
                <thead>
                  <tr className="bg-white text-sm text-black">
                    <th className="border border-black p-1 text-center bg-white w-[5%]">ক্র:</th>
                    <th className="border border-black p-1 text-center bg-white w-[12%]">দাখেলা</th>
                    <th className="border border-black p-1 text-center bg-white w-[18%]">শিক্ষার্থীর নাম</th>
                    <th className="border border-black p-1 text-center bg-white w-[15%]">পিতার নাম</th>
                    <th className="border border-black p-1 text-center bg-white w-[12%]">মোবাইল ১</th>
                    <th className="border border-black p-1 text-center bg-white w-[10%]">সম্পর্ক</th>
                    <th className="border border-black p-1 text-center bg-white w-[12%]">মোবাইল ২</th>
                    <th className="border border-black p-1 text-center bg-white w-[10%]">সম্পর্ক</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((row, index) => {
                    const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                    return (
                      <tr key={index} className="bg-white">
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(serial)}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(row.StudentCode)}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {row.StudentName}
                        </td>
                        <td className="border border-black p-1 text-left pl-2 bg-white">
                          {row.FatherName}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(row.Mobile1)}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {row.Relationship1}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {toBengaliNumber(row.Mobile2)}
                        </td>
                        <td className="border border-black p-1 text-center bg-white">
                          {row.Relationship2}
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

export default ParentsMobileNumberList;



















// import { Buffer } from 'buffer';
// import { useEffect, useState } from 'react';
// import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
// import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
// import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
// import bnBijoy2Unicode from '../../../utils/conveter';

// const ParentsMobileNumberList = ({ reportData, SubClassID, SessionID }) => {
//   console.log(reportData, 'reportData');
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   const { data: subClassListData } = useGetSubClassListQuery();
//   const subClasData = subClassListData?.find(
//     (i) => i.SubClassID === Number(SubClassID)
//   );
//   const { data: sessionSData } = useGetSessionsQuery();

//   const sessionData = sessionSData?.find(
//     (i) => i.SessionID === Number(SessionID)
//   );

//   useEffect(() => {
//     if (instutionInfo?.Logo?.data) {
//       const buffer = Buffer.from(instutionInfo.Logo.data);
//       const base64String = buffer.toString('base64');
//       const imageSrc = `data:image/png;base64,${base64String}`;
//       setLogo(imageSrc);
//     }
//   }, [instutionInfo]);

//   return (
//     <div className="font-bangla  p-4 bg-white text-xs">
//       <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-8 bg-white">
//         {/* Logo - Centered on mobile, left-aligned on desktop */}
//         <div className="flex justify-center sm:justify-start w-full sm:w-auto">
//           <img
//             src={logo}
//             alt="Institution Logo"
//             className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
//           />
//         </div>

//         {/* Institution Info - Centered */}
//         <div className="text-center flex-1 space-y-2">
//           <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
//             {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
//           </h1>
//           <p className="text-base sm:text-lg font-semibold text-gray-700">
//             {bnBijoy2Unicode(instutionInfo?.Address)}
//           </p>

//           {/* Parent Mobile Header */}
//           <div className="inline-block border-b-2 border-black px-4 py-1">
//             <span className="text-base sm:text-lg font-bold tracking-wider">
//               অভিভাবকের মোবাইল
//             </span>
//           </div>
//         </div>

//         {/* Spacer - Maintains balance on desktop */}
//         <div className="hidden sm:block w-20 h-20" />
//       </div>

//       {/* Secondary Header - Class and Academic Year */}
//       <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-8 bg-white">
//         <div className="text-base sm:text-lg font-semibold text-gray-900">
//           শ্রেণী/জামাত : {bnBijoy2Unicode(subClasData?.SubClass)}
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="text-base sm:text-lg font-bold text-gray-900">
//             শিক্ষাবর্ষ : {bnBijoy2Unicode(sessionData?.SessionName)}
//           </div>
//           <div className="text-sm sm:text-base font-medium text-black">
//             প্রিন্ট তারিখ:
//             <span>
//               {new Date().toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: '2-digit',
//                 day: '2-digit',
//               })}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="overflow-x-auto bg-white">
//         <table className="w-full border-collapse border border-black bg-white">
//           <thead>
//             <tr className="bg-white text-sm text-black">
//               <th className="border border-black p-2 bg-white">ক্র:</th>
//               <th className="border border-black p-2 bg-white">দাখেলা</th>
//               <th className="border border-black p-2 bg-white">
//                 শিক্ষার্থীর নাম
//               </th>
//               <th className="border border-black p-2 bg-white">পিতার নাম</th>
//               <th className="border border-black p-2 bg-white">মোবাইল ১</th>
//               <th className="border border-black p-2 bg-white">সম্পর্ক</th>
//               <th className="border border-black p-2 bg-white">মোবাইল ২</th>
//               <th className="border border-black p-2 bg-white">সম্পর্ক</th>
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
//                   {bnBijoy2Unicode(row.StudentName)}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {bnBijoy2Unicode(row.FatherName)}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.Mobile1}
//                 </td>
//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.Relationship1}
//                 </td>

//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.Mobile2}
//                 </td>

//                 <td className="border border-black p-2 text-center bg-white">
//                   {row.Relationship2}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ParentsMobileNumberList;
