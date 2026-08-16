import { useEffect } from "react";
import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
import SeatCardWatermark from "../../../../../pages/userpanel/SeatCard/SeatCardWatermark";

const CARDS_PER_PAGE = 8;

const BSeatNoWhite = ({ queryParams, documentLogo, logoIsActive }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
    subClassId: queryParams?.SubClassID,
  });

  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    console.log(examSeatPlanData);
  }, [examSeatPlanData]);

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
            height: 280mm !important;
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
            border: 2px solid #000 !important;
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
            className={`seat-page ${isLastPage ? 'is-last-page' : ''} grid grid-cols-2 grid-rows-4 gap-2 w-[210mm] h-[290mm] mx-auto p-2 bg-white`}
          >
            {pageSeats.map((assignment) => (
              <div
                key={assignment.AssignmentID}
                className="seat-card relative border-2 border-black p-3 text-center flex flex-col justify-center bg-white"
              >
                <SeatCardWatermark documentLogo={documentLogo} logoIsActive={logoIsActive} />

                <h1 className="text-[28px] font-bold leading-tight">
                  {institutionInfo?.InstitutionName}
                </h1>
                <p className="text-[18px]">{institutionInfo?.Address}</p>
                <p className="text-[18px]">
                  {examNameData?.ExamName} - {sessionData?.SessionName}
                </p>
                <h2 className="text-[26px] mb-1">{subClassData?.SubClass}</h2>
                <h2 className="text-[22px] mb-1">
                  পরীক্ষার্থী : {assignment.User?.UserName}
                </h2>
                <h1 className="text-[26px] border border-black rounded-[8px] mb-2 px-2 py-1 leading-none">
                  আইডি নং : {assignment.User?.UserCode}
                </h1>
                <div className="flex items-center border border-black rounded-[6px] px-2 py-1 leading-none">
                  <h2 className="w-1/2 text-[16px] text-center">ক্লাস নং</h2>
                  <h2 className="w-1/2 text-[16px] text-center border-l border-black">
                    {assignment.SeatNum}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default BSeatNoWhite;
