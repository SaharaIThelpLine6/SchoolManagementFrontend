import { useEffect } from "react";
import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";

const CARDS_PER_PAGE = 8;

const BSeatNoWhite = ({ queryParams }) => {
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
    <div className="bg-gray-100 print:bg-white">
      <style>{`
        @page {
          size: A4;
          margin: 8mm;
        }
        @media print {
          .seat-page {
            break-after: page;
          }
          .seat-page:last-child {
            break-after: auto;
          }
        }
      `}</style>

      {pages.map((pageSeats, pageIndex) => (
        <div
          key={pageIndex}
          className="seat-page grid grid-cols-2 grid-rows-4 gap-2 w-[210mm] min-h-[297mm] mx-auto p-2 bg-white print:mx-0"
        >
          {pageSeats.map((assignment) => (
            <div
              key={assignment.AssignmentID}
              className="border-2 border-black p-3 text-center flex flex-col justify-center"
            >
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
              <h1 className="text-[26px] border border-black rounded-[8px] mb-2">
                আইডি নং : {assignment.User?.UserCode}
              </h1>
              <div className="flex items-center border border-black rounded-[8px]">
                <h2 className="w-1/2 text-[20px] text-center">ক্লাস নং</h2>
                <h2 className="w-1/2 text-[20px] text-center border-l border-black">
                  {assignment.SeatNum}
                </h2>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BSeatNoWhite;