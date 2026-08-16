import { useEffect } from "react";
import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
import SeatCardWatermark from "../../../../../pages/userpanel/SeatCard/SeatCardWatermark";

const CARDS_PER_PAGE = 8;

const ASeatNoWhite = ({ queryParams, documentLogo, logoIsActive }) => {
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
        /* margin: 0 — page-এর মার্জিন এখন @page না, .seat-page এর padding নিয়ন্ত্রণ করে।
           ফলে দুই জায়গায় দুইরকম হাইট হিসাব করে rounding mismatch হওয়ার সুযোগ নেই। */
        @page {
          size: A4 portrait;
          margin: 0;
        }
        @media print {
          /* গুরুত্বপূর্ণ: প্রিন্ট করার সময় ব্রাউজারের Print ডায়ালগে
             "Margins: None" সিলেক্ট থাকতে হবে। "Default" থাকলে Chrome আমাদের
             @page margin:0 উপেক্ষা করে নিজের ~10mm মার্জিন বসায়, যেটা শেষে
             একটা ফাঁকা এক্সট্রা পেজ তৈরি করে। height 290mm (297mm না) রাখা
             হয়েছে সামান্য বাফারের জন্য — কার্ডের ডিজাইন আগের কাজ-করা 280mm
             কনটেন্ট-এরিয়ার সমান রাখতেই, padding 5mm বাদ দিলে effective area 280mm। */
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
          /* CSS :last-of-type এর বদলে explicit class — sibling element (যেমন এই <style> ট্যাগ)
             থাকলেও ভুল হওয়ার সুযোগ নেই, কারণ এটা JS থেকে সরাসরি বসানো হচ্ছে */
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
                className="seat-card relative w-full h-full border-2 border-black bg-white p-3 flex flex-col justify-between"
              >
                <SeatCardWatermark documentLogo={documentLogo} logoIsActive={logoIsActive} />

                <div className="h-12 border-b-2 border-black flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold leading-tight">{institutionInfo?.InstitutionName}</span>
                  <span className="text-sm">{examNameData?.ExamName} - {sessionData?.SessionName}</span>
                </div>

                <div className="flex mt-2 flex-1">
                  <div className="flex-1 px-3 space-y-2 flex flex-col justify-center">
                    <div className="flex justify-end gap-2 text-sm font-bold">
                      <span>{assignment.User?.UserName}</span>
                      <span>: اسم الطالب</span>
                    </div>
                    <div className="flex justify-end gap-2 text-sm font-bold">
                      <span>{subClassData?.SubClass}</span>
                      <span>: الفصل</span>
                    </div>

                    <div className="mt-2 border-2 border-black rounded-xl h-10 flex items-center justify-center">
                      <span className="text-[16px] font-semibold">{assignment.User?.UserCode} : رقم الإلتحاق</span>
                    </div>
                  </div>

                  <div className="w-[120px] border-l-2 border-black text-sm flex flex-col justify-center font-bold">
                    <div className="grid grid-cols-2 border-b border-black">
                      <div className="border-r border-black p-1 text-center">{assignment.SeatNum}</div>
                      <div className="p-1 text-right">رقم الترتيب</div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-black">
                      <div className="border-r border-black p-1 text-center">-</div>
                      <div className="p-1 text-right">رقم المقعد</div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="border-r border-black p-1 text-center">-</div>
                      <div className="p-1 text-right">رقم الطاولة</div>
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

export default ASeatNoWhite;
