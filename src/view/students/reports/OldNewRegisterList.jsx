import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const OldNewRegisterList = ({ reportData, NewOldId, SubClassID }) => {
  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );

  const [logo, setLogo] = useState(null);

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

  // রিপোর্ট ডেটাকে ২২টি করে ভাগ করুন
  const chunks = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
  }, [reportData]);

  // নতুন/পুরাতন লেবেল
  const studentTypeLabel = {
    1: 'নতুন',
    2: 'পুরাতন',
    3: 'উভয়',
  }[Number(NewOldId)] || '';

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
        <div key={pageIndex} className="print-page-container mb-4">
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
                <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 bg-white text-base font-bold sm:text-lg">
                  শিক্ষার্থীদের সংক্ষিপ্ত তালিকা
                </div>
              </div>

              {/* ডানে খালি */}
              <div className="hidden sm:block w-20 h-20 bg-white" />
            </div>

            {/* তথ্য সারি: শ্রেণি, মোট, ধরন, প্রিন্ট তারিখ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-white text-sm font-semibold">
              <div className="bg-white">
                শ্রেণী/জামাত: <span className="underline font-bold">{subClasData?.SubClass || ''}</span>
              </div>
              <div className="bg-white text-center">
                সর্বমোট শিক্ষার্থী: <span className="underline font-bold">{toBengaliNumber(reportData?.length)}</span>
              </div>
              <div className="bg-white text-center">
                শিক্ষার্থীর ধরন: <span className="underline font-bold">{studentTypeLabel}</span>
              </div>
              <div className="bg-white text-right">
                প্রিন্ট <span>{toBengaliNumber(formatDate(new Date()))}</span>
              </div>
            </div>

            {/* টেবিল */}
            <div className="w-full flex-grow">
              <table className="w-full border-collapse border border-black bg-white">
                <thead>
                  <tr className="bg-white text-sm text-black">
                    <th className="border border-black p-2 text-center bg-white w-[10%]">ক্রমিক</th>
                    <th className="border border-black p-2 text-center bg-white w-[20%]">দাখেলা</th>
                    <th className="border border-black p-2 text-center bg-white w-[30%]">নাম</th>
                    <th className="border border-black p-2 text-center bg-white w-[25%]">পিতার নাম</th>
                    <th className="border border-black p-2 text-center bg-white w-[15%]">জন্ম তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((s, idx) => {
                    const serial = pageIndex * ROWS_PER_PAGE + idx + 1;
                    return (
                      <tr key={idx} className="bg-white">
                        <td className="border border-black p-2 text-center bg-white">
                          {toBengaliNumber(serial)}
                        </td>
                        <td className="border border-black p-2 text-center bg-white">
                          {toBengaliNumber(s.StudentCode)}
                        </td>
                        <td className="border border-black p-2 text-center bg-white">
                          {s.StudentName}
                        </td>
                        <td className="border border-black p-2 text-center bg-white">
                          {s.FatherName}
                        </td>
                        <td className="border border-black p-2 text-center bg-white">
                          {toBengaliNumber(formatToDDMMYYYY(s.DateOfBirth))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ফুটার: পৃষ্ঠা নম্বর */}
            <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
              পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OldNewRegisterList;




























// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { formatToDDMMYYYY } from "../../../utils/dateFormat";

// const OldNewRegisterList = ({ reportData, NewOldId, SubClassID }) => {
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();

//   const { data: subClassListData } = useGetSubClassListQuery();
//  const subClasData = subClassListData?.find(
//   (i) => i.SubClassID === Number(SubClassID)
// );



//   return (
//     <div className="bg-white p-8 text-black text-sm">
//       <div className="text-center flex-1 bg-white">
//         <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
//           {instutionInfo?.InstitutionName}
//         </h1>
//         <p className="text-base font-semibold bg-white">
//           {instutionInfo?.Address}
//         </p>
//         <div className="text-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg border-b-2 border-r-2 border-black">
//           শিক্ষার্থীদের সংক্ষিপ্ত তালিকা
//         </div>
//       </div>
//       {/* Header Section */}
//       <div className="grid grid-cols-3 gap-4 mb-4 sm:mb-0 p-4 bg-white">
//         <div className="flex gap-2 bg-white">
//           <span>শ্রেণী/জামাত:</span>
//           <span className="font-bold underline">
//             {subClasData?.SubClass}
//           </span>
//         </div>
//         <div className="flex gap-2 justify-center bg-white">
//           <span>সর্বমোট শিক্ষার্থী:</span>
//           <span className="font-bold underline">{reportData?.length}</span>
//         </div>
//         <div className="flex gap-2 justify-end bg-white">
//           <span>শিক্ষার্থীর ধরন:</span>
//           <span className="font-bold underline">
//             {{
//               1: 'নতুন',
//               2: 'পুরাতন',
//               3: 'উভয়',
//             }[Number(NewOldId)] || ''}
//           </span>
//         </div>
//       </div>

//       {/* Table Section */}
//       <div className="overflow-x-auto bg-white">
//         <table className="min-w-full border border-black border-collapse bg-white">
//           <thead className="bg-white">
//             <tr className="text-center text-sm">
//               <th className="border border-black px-2 py-1">ক্রমিক</th>
//               <th className="border border-black px-2 py-1">দাখেলা</th>
//               <th className="border border-black px-2 py-1">নাম</th>
//               <th className="border border-black px-2 py-1">পিতার নাম</th>
//               <th className="border border-black px-2 py-1">জন্ম তারিখ</th>
//             </tr>
//           </thead>
//           <tbody>
//             {reportData?.map((s, idx) => (
//               <tr key={idx} className="text-center bg-white">
//                 <td className="border border-black px-2 py-1 bg-white">
//                   {idx + 1}
//                 </td>
//                 <td className="border border-black px-2 py-1 bg-white">
//                   {s.StudentCode}
//                 </td>
//                 <td className="border border-black px-2 py-1 bg-white">
//                   {s.StudentName}
//                 </td>
//                 <td className="border border-black px-2 py-1 bg-white">
//                   {s.FatherName}
//                 </td>
//                 <td className="border border-black px-2 py-1 bg-white">
//                   {formatToDDMMYYYY(s.DateOfBirth)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OldNewRegisterList;
