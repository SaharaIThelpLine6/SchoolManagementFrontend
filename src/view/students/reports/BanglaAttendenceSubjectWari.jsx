import React, { useEffect, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { formatDate } from "../../../helper/formatTime";

const BanglaAttendenceSubjectWari = ({ reportData, SubClassID, BookLine, rowsPerPage }) => {
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
    if (num === null || num === undefined || num === '') return '';
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (x) => bengaliDigits[x]);
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // অ্যাটেনডেন্স স্টেট (প্রতি সাব-রো এর জন্য আলাদা)
  const [attendance, setAttendance] = useState({});

  const toggleAttendance = (studentId, day, subRowIndex) => {
    setAttendance((prev) => ({
      ...prev,
      [`${studentId}-${day}-${subRowIndex}`]: !prev[`${studentId}-${day}-${subRowIndex}`],
    }));
  };

  // 🟢 প্রতি শিক্ষার্থীর কয়টি সাব-রো হবে (ফিল্টার থেকে ৩ থেকে ১০ পর্যন্ত সিলেক্ট করা যায়)
  const subjectCount = Number(BookLine) || 3;

  // 🟢 A4 পেজে মোটামুটি ৫০টা সাব-রো ফিট করে (হেডার/ফুটার বাদ দিয়ে) —
  // তাই subjectCount যত বেশি, পেজ-প্রতি ছাত্র সংখ্যা তত কমবে
  // rowsPerPage prop থেকে একটা উপরের cap ও মানা হয়, দুইটার মধ্যে যেটা ছোট সেটাই নেওয়া হবে
  const MAX_ROWS_PER_A4_PAGE = 50; 
  // 🟢 নতুন — BookLine অনুযায়ী প্রতি পেজে শিক্ষার্থীর সংখ্যা (নির্দিষ্ট টেবিল)
  const SUBJECT_TO_STUDENTS_MAP = {
    3: 10,
    4: 8,
    5: 6,
    6: 5,
    7: 4,
    8: 4,
    9: 3,
    10: 3,
  };
  const autoStudentsPerPage =
    SUBJECT_TO_STUDENTS_MAP[subjectCount] ||
    Math.max(1, Math.floor(MAX_ROWS_PER_A4_PAGE / subjectCount));
  const ROWS_PER_PAGE = rowsPerPage?.portrait
    ? Math.min(rowsPerPage.portrait, autoStudentsPerPage)
    : autoStudentsPerPage;

  const chunks = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    const chunked = [];
    for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
      chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
    }
    return chunked;
  }, [reportData, ROWS_PER_PAGE]);

  return (
    <div className="font-bangla bg-white text-xs p-2 sm:p-4">
      <style>
        {`
          .writing-vertical {
            writing-mode: vertical-rl;
            text-orientation: upright;
            letter-spacing: 3px;
            padding: 4px 0;
          }
          /* 🟢 আপডেট করা ক্লাস - ডাটা লম্বালম্বি এবং র্যাপিং (Wrapping) এর জন্য */
          .data-vertical {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: normal; /* nowrap এর বদলে normal করা হয়েছে যাতে ভেঙে পরের লাইনে যায় */
            word-break: break-word;
            margin: 0 auto;
            padding: 4px 0;
            max-height: 100%;        /* 🟢 ঘরের উচ্চতা ছাড়িয়ে যাবে না → ২ কলামে ভাঙবে */
            line-height: 1.2;      /* 🟢 ২ কলামের মাঝে ফাঁকা কম */
            text-align: center;
          }
          /* 🟢 আপডেট — হেডারের নিচের পুরো লাইন bold */
          thead tr th {
            border-bottom: 2px solid black !important;
          }
          /* 🟢 আপডেট — শিক্ষার্থী কলামের ডান পাশের লাইন (হেডার থেকে নিচ পর্যন্ত) bold */
          .header-right-bold {
            border-right: 2px solid black !important;
          }
          /* 🟢 নতুন — প্রতি শিক্ষার্থীর শেষ লাইনের নিচের বর্ডার (সব কলাম জুড়ে) bold */
          .student-bottom-bold {
            border-bottom: 2px solid black !important;
          }
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
            /* 🟢 প্রিন্টেও হেডারের নিচের পুরো লাইন bold থাকবে */
            thead tr th {
              border-bottom: 2px solid black !important;
            }
            /* 🟢 প্রিন্টেও শিক্ষার্থী কলামের ডান পাশের লাইন (হেডার থেকে নিচ পর্যন্ত) bold থাকবে */
            .header-right-bold {
              border-right: 2px solid black !important;
            }
            /* 🟢 প্রিন্টেও প্রতি শিক্ষার্থীর শেষ লাইনের নিচের বর্ডার bold থাকবে */
            .student-bottom-bold {
              border-bottom: 2px solid black !important;
            }
          }
        `}
      </style>

      {chunks.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === chunks.length - 1;
        return (
          <div key={pageIndex} className="print-page-container">
            <div className="p-3 sm:p-4 bg-white min-h-[277mm] flex flex-col">

              {/* 🟢 আপডেট করা হেডার সেকশন: লোগো বামে, টেক্সট মাঝে এবং আন্ডারলাইন */}
              <div className="w-full relative mb-2 flex flex-col items-center justify-center bg-white">
                <div className="absolute left-0 top-0 flex justify-start items-start">
                  {logo && (
                    <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 bg-white object-contain" />
                  )}
                </div>
                <div className="text-center flex-1 bg-white">
                  <h1 className="text-lg sm:text-[22px] font-extrabold text-black bg-white leading-tight">
                    {instutionInfo?.InstitutionName}
                  </h1>
                  <p className="text-xs sm:text-[15px] font-bold text-black bg-white mt-1">
                    {instutionInfo?.Address}
                  </p>
                  <h2 className="text-sm sm:text-[17px] font-extrabold border-b-[1.5px] border-black inline-block pb-0.5 mt-2 text-black">
                    দৈনন্দিন শিক্ষার্থীর হাজিরা খাতা
                  </h2>
                </div>
              </div>

              {/* 🟢 আপডেট করা তথ্য সারি: স্পেসিং, ফন্ট-বোল্ড এবং ডান পাশে 'বছর' */}
              <div className="flex justify-between items-center mb-2 mt-4 bg-white px-1">
                <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-left">
                  শ্রেণি/জামাত : {subClasData?.SubClass || ''}
                </div>
                <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-center">
                  মাস :
                </div>
                <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-center">
                  বছর :
                </div>
              </div>

              {/* টেবিল */}
              <div className="w-full flex-grow overflow-x-auto">
                <table className="w-full border-collapse table-fixed text-xs border-2 border-black">
                  <thead>
                    <tr>
                      {/* 🟢 আপডেট করা হেডারগুলো (ছবি অনুযায়ী বোল্ড এবং সাইজ ঠিক করা) */}
                      <th className="border border-black bg-white text-center font-bold text-black p-0 w-[5%] h-6 sm:h-8 text-[11px] sm:text-sm">
                        ক্র:
                      </th>
                      <th className="border border-black bg-white text-center font-bold text-black p-0 w-[5%] h-6 sm:h-8 text-[11px] sm:text-sm">
                        আইডি নং
                      </th>
                      {/* 🟢 শিক্ষার্থী কলামটি এখন colSpan=2 দিয়ে নাম এবং সিরিয়াল দুটি কলাম জুড়ে থাকবে */}
                      <th colSpan={2} className="header-right-bold border border-black bg-white text-center font-bold text-black p-0 w-[11%] h-6 sm:h-8 text-[11px] sm:text-sm">
                        শিক্ষার্থী
                      </th>
                      {days.map((day) => (
                        <th key={day} className="border border-black text-center bg-white font-bold text-black p-0 h-6 sm:h-8 text-[11px] sm:text-sm">
                          {toBengaliNumber(day)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((student, index) => {
                      const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                      return (
                        <React.Fragment key={student.id || index}>
                          {Array.from({ length: subjectCount }).map((_, subRowIndex) => {
                            // 🟢 প্রতি শিক্ষার্থীর শেষ সাব-রো কিনা
                            const isLastSubRow = subRowIndex === subjectCount - 1;
                            return (
                            <tr key={subRowIndex} className="border-b border-black">
                              {subRowIndex === 0 && (
                                <>
                                  {/* 🟢 আপডেট করা ডাটা সেলগুলো: সিরিয়াল নম্বর বোল্ড করা হয়েছে */}
                                  <td rowSpan={subjectCount} className="student-bottom-bold border border-black text-center bg-white p-0 align-middle font-bold text-sm sm:text-base text-black">
                                    {toBengaliNumber(serial)}
                                  </td>
                                  <td rowSpan={subjectCount} className="student-bottom-bold border border-black text-center bg-white p-0 align-middle text-black">
                                    <div className="data-vertical">{toBengaliNumber(student.StudentCode)}</div>
                                  </td>
                                  {/* 🟢 শিক্ষার্থীর নাম এখন একটি আলাদা Native Column (রো-এর উচ্চতা ভাঙবে না) */}
                                  <td rowSpan={subjectCount} style={{ width: '8%' }} className="student-bottom-bold border border-black text-center bg-white p-0 align-middle text-black">
                                    <div className="data-vertical leading-tight">{student.StudentName}</div>
                                  </td>
                                </>
                              )}
                              {/* 🟢 প্রতি সাব-রো এর সিরিয়াল নম্বর (১, ২, ৩ ... subjectCount) এখন নিজস্ব <td> তে থাকবে — ডান পাশের লাইন bold */}
                              <td style={subRowIndex === 0 ? { width: '3%' } : {}} className={`header-right-bold border border-black text-center bg-white p-0 align-middle font-bold text-[11px] sm:text-[13px] h-5 sm:h-6 text-black ${isLastSubRow ? 'student-bottom-bold' : ''}`}>
                                {toBengaliNumber(subRowIndex + 1)}
                              </td>
                              {days.map((day) => (
                                <td
                                  key={day}
                                  className={`border border-black text-center p-0 align-middle h-5 sm:h-6 bg-white ${isLastSubRow ? 'student-bottom-bold' : ''}`}
                                >
                                  {attendance[`${student.id}-${day}-${subRowIndex}`] ? "✓" : ""}
                                </td>
                              ))}
                            </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}

                    {/* 🟢 শুধু শেষ পেজে — মোট উপস্থিত/অনুপস্থিত এর জন্য দুইটা ফাঁকা রো (প্রিন্টের পর হাতে লেখার জন্য) */}
                    {isLastPage && (
                      <>
                        <tr className="border-b border-black">
                          <td colSpan={4} className="header-right-bold border border-black bg-white px-1 py-0.5 font-bold text-black text-left">
                            মোট উপস্থিত :
                          </td>
                          {days.map((day) => (
                            <td key={day} className="border border-black bg-white p-0"></td>
                          ))}
                        </tr>
                        <tr className="border-b border-black">
                          <td colSpan={4} className="header-right-bold border border-black bg-white px-1 py-0.5 font-bold text-black text-left">
                            মোট অনুপস্থিত :
                          </td>
                          {days.map((day) => (
                            <td key={day} className="border border-black bg-white p-0"></td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ফুটার */}
              <div className="flex flex-wrap justify-between mt-4 pt-3 text-xs font-bold text-black">
                <div className="border-t border-black w-48 text-center">
                  <span>মোট কার্য দিবস: </span>
                </div>
                <div className="border-t border-black w-48 text-center">
                  <span>শিক্ষক/শিক্ষিকার স্বাক্ষর: </span>
                </div>
                <div className="text-center w-full text-[14px] mt-3">
                  পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
                </div>
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BanglaAttendenceSubjectWari;



























// import React, { useEffect, useMemo, useState } from "react";
// import { Buffer } from "buffer";
// import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
// import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
// import { formatDate } from "../../../helper/formatTime";

// const BanglaAttendenceSubjectWari = ({ reportData, SubClassID, BookLine, rowsPerPage }) => {
//   const [logo, setLogo] = useState(null);
//   const { data: instutionInfo } = useGetInstitutionInfoQuery();
//   const { data: subClassListData } = useGetSubClassListQuery();
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

//   // ইংরেজি সংখ্যাকে বাংলায় রূপান্তরের ফাংশন
//   const toBengaliNumber = (num) => {
//     if (num === null || num === undefined || num === '') return '';
//     const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
//     return num.toString().replace(/\d/g, (x) => bengaliDigits[x]);
//   };

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);

//   // অ্যাটেনডেন্স স্টেট (প্রতি সাব-রো এর জন্য আলাদা)
//   const [attendance, setAttendance] = useState({});

//   const toggleAttendance = (studentId, day, subRowIndex) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [`${studentId}-${day}-${subRowIndex}`]: !prev[`${studentId}-${day}-${subRowIndex}`],
//     }));
//   };

//   // 🟢 প্রতি শিক্ষার্থীর কয়টি সাব-রো হবে (ফিল্টার থেকে ৩ থেকে ১০ পর্যন্ত সিলেক্ট করা যায়)
//   const subjectCount = Number(BookLine) || 3;

//   // 🟢 A4 পেজে মোটামুটি ৫০টা সাব-রো ফিট করে (হেডার/ফুটার বাদ দিয়ে) —
//   // তাই subjectCount যত বেশি, পেজ-প্রতি ছাত্র সংখ্যা তত কমবে
//   // rowsPerPage prop থেকে একটা উপরের cap ও মানা হয়, দুইটার মধ্যে যেটা ছোট সেটাই নেওয়া হবে
//   const MAX_ROWS_PER_A4_PAGE = 50; 
//   // 🟢 নতুন — BookLine অনুযায়ী প্রতি পেজে শিক্ষার্থীর সংখ্যা (নির্দিষ্ট টেবিল)
//   const SUBJECT_TO_STUDENTS_MAP = {
//     3: 10,
//     4: 8,
//     5: 6,
//     6: 5,
//     7: 4,
//     8: 4,
//     9: 3,
//     10: 3,
//   };
//   const autoStudentsPerPage =
//     SUBJECT_TO_STUDENTS_MAP[subjectCount] ||
//     Math.max(1, Math.floor(MAX_ROWS_PER_A4_PAGE / subjectCount));
//   const ROWS_PER_PAGE = rowsPerPage?.portrait
//     ? Math.min(rowsPerPage.portrait, autoStudentsPerPage)
//     : autoStudentsPerPage;

//   const chunks = useMemo(() => {
//     if (!reportData || reportData.length === 0) return [];
//     const chunked = [];
//     for (let i = 0; i < reportData.length; i += ROWS_PER_PAGE) {
//       chunked.push(reportData.slice(i, i + ROWS_PER_PAGE));
//     }
//     return chunked;
//   }, [reportData, ROWS_PER_PAGE]);

//   return (
//     <div className="font-bangla bg-white text-xs p-2 sm:p-4">
//       <style>
//         {`
//           .writing-vertical {
//             writing-mode: vertical-rl;
//             text-orientation: upright;
//             letter-spacing: 3px;
//             padding: 4px 0;
//           }
//           /* 🟢 আপডেট করা ক্লাস - ডাটা লম্বালম্বি এবং র্যাপিং (Wrapping) এর জন্য */
//           .data-vertical {
//             writing-mode: vertical-rl;
//             transform: rotate(180deg);
//             white-space: normal; /* nowrap এর বদলে normal করা হয়েছে যাতে ভেঙে পরের লাইনে যায় */
//             word-break: break-word;
//             margin: 0 auto;
//             padding: 4px 0;
//             max-height: 100%;        /* 🟢 ঘরের উচ্চতা ছাড়িয়ে যাবে না → ২ কলামে ভাঙবে */
//             line-height: 1.2;      /* 🟢 ২ কলামের মাঝে ফাঁকা কম */
//             text-align: center;
//           }
//           /* 🟢 আপডেট — হেডারের নিচের পুরো লাইন bold */
//           thead tr th {
//             border-bottom: 2px solid black !important;
//           }
//           /* 🟢 আপডেট — শিক্ষার্থী কলামের ডান পাশের লাইন (হেডার থেকে নিচ পর্যন্ত) bold */
//           .header-right-bold {
//             border-right: 2px solid black !important;
//           }
//           @media print {
//             @page {
//               size: A4 portrait;
//               margin: 10mm;
//             }
//             html, body {
//               margin: 0;
//               padding: 0;
//               box-sizing: border-box;
//             }
//             .print-page-container {
//               page-break-after: always;
//               page-break-inside: avoid;
//               break-after: page;
//               height: 277mm;
//               position: relative;
//               box-sizing: border-box;
//               margin-bottom: 10mm;
//             }
//             .print-page-container:last-child {
//               page-break-after: auto;
//               break-after: auto;
//               margin-bottom: 0;
//             }
//             table {
//               page-break-inside: auto;
//               border-collapse: collapse !important;
//               table-layout: fixed;
//               width: 100%;
//               font-size: 8px;
//             }
//             tr {
//               page-break-inside: avoid;
//               page-break-after: auto;
//             }
//             thead {
//               display: table-header-group;
//             }
//             th, td {
//               border: 1px solid black !important;
//               word-wrap: break-word;
//               overflow-wrap: break-word;
//             }
//             /* 🟢 প্রিন্টেও হেডারের নিচের পুরো লাইন bold থাকবে */
//             thead tr th {
//               border-bottom: 2px solid black !important;
//             }
//             /* 🟢 প্রিন্টেও শিক্ষার্থী কলামের ডান পাশের লাইন (হেডার থেকে নিচ পর্যন্ত) bold থাকবে */
//             .header-right-bold {
//               border-right: 2px solid black !important;
//             }
//           }
//         `}
//       </style>

//       {chunks.map((chunk, pageIndex) => {
//         const isLastPage = pageIndex === chunks.length - 1;
//         return (
//           <div key={pageIndex} className="print-page-container">
//             <div className="p-3 sm:p-4 bg-white min-h-[277mm] flex flex-col">

//               {/* 🟢 আপডেট করা হেডার সেকশন: লোগো বামে, টেক্সট মাঝে এবং আন্ডারলাইন */}
//               <div className="w-full relative mb-2 flex flex-col items-center justify-center bg-white">
//                 <div className="absolute left-0 top-0 flex justify-start items-start">
//                   {logo && (
//                     <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 bg-white object-contain" />
//                   )}
//                 </div>
//                 <div className="text-center flex-1 bg-white">
//                   <h1 className="text-lg sm:text-[22px] font-extrabold text-black bg-white leading-tight">
//                     {instutionInfo?.InstitutionName}
//                   </h1>
//                   <p className="text-xs sm:text-[15px] font-bold text-black bg-white mt-1">
//                     {instutionInfo?.Address}
//                   </p>
//                   <h2 className="text-sm sm:text-[17px] font-extrabold border-b-[1.5px] border-black inline-block pb-0.5 mt-2 text-black">
//                     দৈনন্দিন শিক্ষার্থীর হাজিরা খাতা
//                   </h2>
//                 </div>
//               </div>

//               {/* 🟢 আপডেট করা তথ্য সারি: স্পেসিং, ফন্ট-বোল্ড এবং ডান পাশে 'বছর' */}
//               <div className="flex justify-between items-center mb-2 mt-4 bg-white px-1">
//                 <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-left">
//                   শ্রেণি/জামাত : {subClasData?.SubClass || ''}
//                 </div>
//                 <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-center">
//                   মাস :
//                 </div>
//                 <div className="font-bold text-sm sm:text-[15px] text-black w-1/3 text-center">
//                   বছর :
//                 </div>
//               </div>

//               {/* টেবিল */}
//               <div className="w-full flex-grow overflow-x-auto">
//                 <table className="w-full border-collapse table-fixed text-xs border-2 border-black">
//                   <thead>
//                     <tr>
//                       {/* 🟢 আপডেট করা হেডারগুলো (ছবি অনুযায়ী বোল্ড এবং সাইজ ঠিক করা) */}
//                       <th className="border border-black bg-white text-center font-bold text-black p-0 w-[5%] h-6 sm:h-8 text-[11px] sm:text-sm">
//                         ক্র:
//                       </th>
//                       <th className="border border-black bg-white text-center font-bold text-black p-0 w-[5%] h-6 sm:h-8 text-[11px] sm:text-sm">
//                         আইডি নং
//                       </th>
//                       {/* 🟢 শিক্ষার্থী কলামটি এখন colSpan=2 দিয়ে নাম এবং সিরিয়াল দুটি কলাম জুড়ে থাকবে */}
//                       <th colSpan={2} className="header-right-bold border border-black bg-white text-center font-bold text-black p-0 w-[11%] h-6 sm:h-8 text-[11px] sm:text-sm">
//                         শিক্ষার্থী
//                       </th>
//                       {days.map((day) => (
//                         <th key={day} className="border border-black text-center bg-white font-bold text-black p-0 h-6 sm:h-8 text-[11px] sm:text-sm">
//                           {toBengaliNumber(day)}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {chunk.map((student, index) => {
//                       const serial = pageIndex * ROWS_PER_PAGE + index + 1;
//                       return (
//                         <React.Fragment key={student.id || index}>
//                           {Array.from({ length: subjectCount }).map((_, subRowIndex) => (
//                             <tr key={subRowIndex} className="border-b border-black">
//                               {subRowIndex === 0 && (
//                                 <>
//                                   {/* 🟢 আপডেট করা ডাটা সেলগুলো: সিরিয়াল নম্বর বোল্ড করা হয়েছে */}
//                                   <td rowSpan={subjectCount} className="border border-black text-center bg-white p-0 align-middle font-bold text-sm sm:text-base text-black">
//                                     {toBengaliNumber(serial)}
//                                   </td>
//                                   <td rowSpan={subjectCount} className="border border-black text-center bg-white p-0 align-middle text-black">
//                                     <div className="data-vertical">{toBengaliNumber(student.StudentCode)}</div>
//                                   </td>
//                                   {/* 🟢 শিক্ষার্থীর নাম এখন একটি আলাদা Native Column (রো-এর উচ্চতা ভাঙবে না) */}
//                                   <td rowSpan={subjectCount} style={{ width: '8%' }} className="border border-black text-center bg-white p-0 align-middle text-black">
//                                     <div className="data-vertical leading-tight">{student.StudentName}</div>
//                                   </td>
//                                 </>
//                               )}
//                               {/* 🟢 প্রতি সাব-রো এর সিরিয়াল নম্বর (১, ২, ৩ ... subjectCount) এখন নিজস্ব <td> তে থাকবে — ডান পাশের লাইন bold */}
//                               <td style={subRowIndex === 0 ? { width: '3%' } : {}} className="header-right-bold border border-black text-center bg-white p-0 align-middle font-bold text-[11px] sm:text-[13px] h-5 sm:h-6 text-black">
//                                 {toBengaliNumber(subRowIndex + 1)}
//                               </td>
//                               {days.map((day) => (
//                                 <td
//                                   key={day}
//                                   className="border border-black text-center p-0 align-middle h-5 sm:h-6 bg-white"
//                                 >
//                                   {attendance[`${student.id}-${day}-${subRowIndex}`] ? "✓" : ""}
//                                 </td>
//                               ))}
//                             </tr>
//                           ))}
//                         </React.Fragment>
//                       );
//                     })}

//                     {/* 🟢 শুধু শেষ পেজে — মোট উপস্থিত/অনুপস্থিত এর জন্য দুইটা ফাঁকা রো (প্রিন্টের পর হাতে লেখার জন্য) */}
//                     {isLastPage && (
//                       <>
//                         <tr className="border-b border-black">
//                           <td colSpan={4} className="header-right-bold border border-black bg-white px-1 py-0.5 font-bold text-black text-left">
//                             মোট উপস্থিত :
//                           </td>
//                           {days.map((day) => (
//                             <td key={day} className="border border-black bg-white p-0"></td>
//                           ))}
//                         </tr>
//                         <tr className="border-b border-black">
//                           <td colSpan={4} className="header-right-bold border border-black bg-white px-1 py-0.5 font-bold text-black text-left">
//                             মোট অনুপস্থিত :
//                           </td>
//                           {days.map((day) => (
//                             <td key={day} className="border border-black bg-white p-0"></td>
//                           ))}
//                         </tr>
//                       </>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* ফুটার */}
//               <div className="flex flex-wrap justify-between mt-4 pt-3 text-xs font-bold text-black">
//                 <div className="border-t border-black w-48 text-center">
//                   <span>মোট কার্য দিবস: </span>
//                 </div>
//                 <div className="border-t border-black w-48 text-center">
//                   <span>শিক্ষক/শিক্ষিকার স্বাক্ষর: </span>
//                 </div>
//                 <div className="text-center w-full text-[14px] mt-3">
//                   পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
//                 </div>
//               </div>

//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default BanglaAttendenceSubjectWari;
