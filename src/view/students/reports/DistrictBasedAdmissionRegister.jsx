import { Buffer } from "buffer";
import { useEffect, useMemo, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const DistrictBasedAdmissionRegister = ({ reportData }) => {
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

  return (
    <div className="font-bangla bg-white text-xs p-2 sm:p-4">
      {/* PDF Table & Layout Fix Style */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm; /* ফিক্সড মার্জিন, যাতে ব্রাউজার নিজের মত মার্জিন না বসায় */
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
              height: 277mm; /* A4 পেজ থেকে মার্জিন বাদ দিয়ে ফিক্সড হাইট */
              position: relative;
              box-sizing: border-box;
              margin-bottom: 10mm;
            }
            .print-page-container:last-child {
              page-break-after: auto;
              break-after: auto;
              margin-bottom: 0;
            }
            .print-border-wrapper {
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            table {
              page-break-inside: auto;
              border-collapse: collapse !important;
              table-layout: fixed; /* টেবিল যেন বাইরে চলে না যায় */
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

      {chunks.map((chunk, pageIndex) => {
        return (
          <div key={pageIndex} className="print-page-container mb-4">
            <div className="print-border-wrapper p-3 sm:p-4 bg-white min-h-[277mm]">
              
              {/* Header Area: ৩ কলাম (বামে লোগো, মাঝে টাইটেল, ডানে তারিখ) */}
              <div className="flex justify-between items-start mb-4">
                {/* Left: Logo */}
                <div className="w-[20%] flex justify-start items-start">
                  {logo && (
                    <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                  )}
                </div>

                {/* Center: Title Section */}
                <div className="w-[60%] text-center flex flex-col items-center justify-start">
                  <h1 className="text-xl sm:text-[22px] font-extrabold text-black leading-tight">
                    {instutionInfo?.InstitutionName}
                  </h1>
                  <p className="text-sm sm:text-[15px] font-semibold text-black mt-1">
                    {instutionInfo?.Address}
                  </p>
                  {/* Round Box Title */}
                  <div className="border-[1.5px] border-black rounded-full px-6 sm:px-8 py-[4px] mt-2 inline-block bg-white">
                    <span className="text-[14px] sm:text-[16px] font-bold text-black tracking-wide">
                      জেলা ভিত্তিক ভর্তি রেজিস্টার :{" "}
                      {toBengaliNumber(reportData?.[0]?.SessionName || "2025-26 Bs")}
                    </span>
                  </div>
                </div>

                {/* Right: Print Date */}
                <div className="w-[20%] flex flex-col justify-end items-end h-[85px] sm:h-[95px]">
                  <span className="text-[12px] sm:text-[13px] font-bold text-black pb-1">
                    প্রিন্ট {toBengaliNumber(formatDate(new Date()))}
                  </span>
                </div>
              </div>

              {/* Table Content */}
              <div className="w-full flex-grow">
                <table className="w-full border-collapse border border-black text-black">
                  <thead>
                    <tr className="bg-white">
                      <th className="border border-black p-1 text-center align-middle font-bold w-[4%]">ক্র:</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[7%]">আইডি নং</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[12%]">শিক্ষার্থীর নাম</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[11%]">পিতার নাম</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[11%]">মাতার নাম</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[8%]">জন্ম তারিখ</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[9%]">শ্রেণি/জামাত</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[10%]">মোবাইল</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[7%]">গ্রাম</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[7%]">ডাক</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[7%]">থানা</th>
                      <th className="border border-black p-1 text-center align-middle font-bold w-[7%]">জেলা</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.map((student, index) => {
                      const serial = pageIndex * ROWS_PER_PAGE + index + 1;
                      return (
                        <tr
                          key={index}
                          className="bg-white print:break-inside-avoid break-inside-avoid"
                        >
                          <td className="border border-black p-1 text-center font-bold">
                            {toBengaliNumber(serial)}
                          </td>
                          <td className="border border-black p-1 text-center whitespace-nowrap">
                            {toBengaliNumber(student.StudentCode)}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.StudentName}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.FatherName}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.MotherName}
                          </td>
                          <td className="border border-black p-1 text-center whitespace-nowrap">
                            {toBengaliNumber(formatToDDMMYYYY(student.DateOfBirth))}
                          </td>
                          <td className="border border-black p-1 text-center font-medium">
                            {student.ClassName}
                          </td>
                          <td className="border border-black p-1 text-center tracking-wide">
                            {toBengaliNumber(student.Mobile1)}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.permanentVill}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.permanentPost}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.PoliceStationName}
                          </td>
                          <td className="border border-black p-1 text-left pl-2 font-medium">
                            {student.PermanentDistrictName}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Text (পৃষ্ঠা নম্বর) */}
              <div className="mt-auto pt-3 text-center w-full text-black text-[14px] font-bold">
                পৃষ্ঠা : {toBengaliNumber(pageIndex + 1)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DistrictBasedAdmissionRegister;
