import { useEffect } from "react";
import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
import SeatCardWatermark from "../../../../../pages/userpanel/SeatCard/SeatCardWatermark";

const CARDS_PER_PAGE = 8;

const BSeatNoColor = ({ queryParams, documentLogo, logoIsActive }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
    subClassId: queryParams?.SubClassID,
  });

  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const allSeats = examSeatPlanData
    ? Object.values(examSeatPlanData).flat()
    : [];

  const pages = [];
  for (let i = 0; i < allSeats.length; i += CARDS_PER_PAGE) {
    pages.push(allSeats.slice(i, i + CARDS_PER_PAGE));
  }

  return (
    <div className="bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          /* গুরুত্বপূর্ণ: প্রিন্টের সময় "Margins: None" সিলেক্ট থাকতে হবে,
             নাহলে Chrome এর নিজস্ব ~10mm মার্জিন শেষে একটা ফাঁকা পেজ তৈরি করে।
             height 290mm রাখা হয়েছে যাতে padding 5mm বাদ দিয়ে content area
             আগের কাজ-করা 280mm এর সমান থাকে */
          .seat-page {
            width: 210mm !important;
            height: 290mm !important;
            padding: 5mm !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .seat-page.is-last-page {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .seat-card {
            border: 1px solid #d1d5db !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageSeats, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        return (
          <div
            key={pageIndex}
            className={`seat-page ${isLastPage ? 'is-last-page' : ''} grid grid-cols-2 grid-rows-4 gap-3 w-[210mm] h-[290mm] mx-auto p-2 bg-white`}
          >
            {pageSeats.map((assignment) => (
              <div key={assignment.AssignmentID} className="seat-card relative w-full h-full border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col">

                <SeatCardWatermark documentLogo={documentLogo} logoIsActive={logoIsActive} />

                <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col justify-center items-center text-white px-2">
                   <h1 className="text-[20px] font-bold leading-tight">{institutionInfo?.InstitutionName}</h1>
                   <p className="text-xs">{examNameData?.ExamName} - {sessionData?.SessionName}</p>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-center space-y-2">
                  <div className="border-t border-dashed border-gray-400"></div>

                  <p className="text-center text-md font-semibold text-gray-800">
                    {subClassData?.SubClass}
                  </p>

                  <div className="border-2 border-blue-500 rounded-lg h-8 flex items-center justify-between px-3 bg-blue-50">
                    <span className="text-[15px] font-bold text-gray-700">পরীক্ষার্থী :</span>
                    <span className="text-[16px] font-bold text-blue-800">{assignment.User?.UserName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border-2 border-indigo-500 rounded-lg h-8 flex items-center justify-between px-2 bg-indigo-50">
                      <span className="text-sm font-bold text-gray-700">রোল নং :</span>
                      <span className="text-[16px] font-bold text-indigo-800">{assignment.SeatNum}</span>
                    </div>

                    <div className="border-2 border-indigo-500 rounded-lg h-8 flex items-center justify-between px-2 bg-indigo-50">
                      <span className="text-sm font-bold text-gray-700">আইডি :</span>
                      <span className="text-[16px] font-bold text-indigo-800">{assignment.User?.UserCode}</span>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default BSeatNoColor;
