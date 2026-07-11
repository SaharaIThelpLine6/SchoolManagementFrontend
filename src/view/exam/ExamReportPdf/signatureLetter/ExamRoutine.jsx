import { useEffect } from "react";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../../utils/dateFormat";
import { useGetExamHallListQuery } from "../../../../features/examhall/examHallQuerySlice";
import { useGetHallwiseSeatPlanQuery } from "../../../../features/exam/examSitPlanQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionQuery } from "../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../features/class/classQuerySlice";

const ExamRoutine = ({ reportData, queryParams }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
    subClassId: queryParams?.SubClassID,
  });
  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
    const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const {
    data: institutionInfo,
    isLoading,
    isError,
  } = useGetInstitutionInfoQuery();

  const { data: hallList } = useGetExamHallListQuery();

  useEffect(() => {
    console.log(queryParams, reportData, examSeatPlanData);
  }, [queryParams, reportData, examSeatPlanData]);

  const getHallName = (hallId) => {
    const hall = hallList?.find((h) => String(h.HallID) === String(hallId));
    return hall?.HallName ?? `হল ${hallId}`;
  };

  const hallEntries = examSeatPlanData ? Object.entries(examSeatPlanData) : [];

  return (
    <div className="mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
      {hallEntries.length > 0 &&
        hallEntries.map(([hallId, assignments], hallIndex) => (
          <div
            key={hallId}
            className={hallIndex > 0 ? "break-before-page" : ""}
          >
            <div className="text-center mb-4">
              <h1 className="text-[28px]">{institutionInfo?.InstitutionName}</h1>
              <p className="text-[20px]">{institutionInfo?.Address}</p>
              <p className="text-[20px] mb-4">{examNameData?.ExamName} - {sessionData?.SessionName}</p>
              <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px] rounded-[4px]">
                পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র
              </h2>
            </div>

            <div className="mb-2">
              <p className="font-semibold text-[18px]">হল/কক্ষঃ {bnBijoy2Unicode(getHallName(hallId))}</p>
              <p className="font-semibold text-[18px] relative">
                মারহালা/শ্রেণীঃ ...................................................
                <span className="absolute left-[150px] bottom-[10px]">{subClassData?.SubClass}</span>
              </p>
            </div>

            <table className="w-full border border-black border-collapse text-center pt-4">
              <thead>
                <tr>
                  <td colSpan={3} className="text-left border border-black p-1 bg-white">
                    <div className="flex gap-6 items-center">
                      <span className="block w-10 text-[16px] font-bold">তারিখ</span>
                      <span>{"------>>"}</span>
                    </div>
                  </td>
                  {reportData?.routine?.map((item, i) => (
                    <td key={i} className="border border-black p-1 bg-white">
                      <div className="text-[16px] text-black font-bold">
                        {bnBijoy2Unicode(formatToDDMMYYYY(item.ExamDate))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={3} className="text-left border border-black p-1 bg-white">
                    <div className="flex gap-6 items-center">
                      <span className="block w-10 text-[16px] font-bold">বার</span>
                      <span>{"------>>"}</span>
                    </div>
                  </td>
                  {reportData?.routine?.map((item, i) => (
                    <td key={i} className="border border-black p-1 bg-white">
                      <div className="text-[16px] font-bold text-[#334155]">{item.ExamDay}</div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={3} className="text-left border border-0 p-1 bg-white">
                    <div className="flex gap-6 items-center">
                      <span className="block w-10 text-[16px] font-bold">সময়</span>
                      <span>{"------>>"}</span>
                    </div>
                  </td>
                  {reportData?.routine?.map((item, i) => (
                    <td key={i} className="border border-black p-1 bg-white font-Poppins">
                      <div className="text-[16px] text-gray-700">
                        {item.StartTime} – {item.EndTime}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
                    ক্রমিক
                  </th>
                  <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
                    আইডি
                  </th>
                  <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-center bg-white">
                    পরীক্ষার্থীর নাম
                  </th>
                  {reportData?.routine?.map((item, i) => (
                    <th
                      key={i}
                      className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-center bg-white"
                    >
                      {item.subject.SubjectName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments?.map((assignment, index) => (
                  <tr
                    key={assignment.AssignmentID ?? index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-black text-[16px] font-semibold p-1 bg-white">
                      {bnBijoy2Unicode(String(index + 1))}
                    </td>
                    <td className="border border-black text-[16px] p-1 text-gray-800 bg-white">
                      {bnBijoy2Unicode(String(assignment.User?.UserCode))}
                    </td>
                    <td className="border border-black text-[16px] font-medium p-2 text-left bg-white">
                      {assignment.User?.UserName}
                    </td>
                    {reportData?.routine?.map((_, i) => (
                      <td key={i} className="border border-black h-10 bg-white"></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
};

export default ExamRoutine;