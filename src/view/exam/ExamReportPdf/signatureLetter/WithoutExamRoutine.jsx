import { skipToken } from "@reduxjs/toolkit/query";
import {
  useGetExamNameQuery,
  useGetGetStudentListQuery,
} from "../../../../features/exam/examQuerySlice";
import { useGetHallwiseSeatPlanQuery } from "../../../../features/exam/examSitPlanQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../features/class/classQuerySlice";
import { useGetSessionQuery } from "../../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../../utils/dateFormat";

/* ---- fixed column widths (px) ---- */
const SL_W = 40;      // ক্রমিক
const ID_W = 80;      // আইডি
const NAME_W = 170;   // পরীক্ষার্থীর নাম
const FIXED_W = SL_W + ID_W + NAME_W;

const WithoutExamRoutine = ({ reportData, queryParams, requireSeatPlan = false }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery(
    requireSeatPlan &&
      queryParams?.SessionID &&
      queryParams?.ExamID &&
      queryParams?.SubClassID
      ? {
          sessionId: queryParams.SessionID,
          examId: queryParams.ExamID,
          subClassId: queryParams.SubClassID,
        }
      : skipToken
  );
  const hasReportStudentList = Array.isArray(reportData?.studentList);
  const { data: studentData } = useGetGetStudentListQuery(
    !hasReportStudentList &&
      queryParams?.SessionID &&
      queryParams?.ExamID &&
      queryParams?.SubClassID
      ? {
          SessionID: queryParams.SessionID,
          ExamID: queryParams.ExamID,
          SubClassID: queryParams.SubClassID,
        }
      : skipToken
  );
  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const assignments = reportData?.studentList ?? [
    ...(studentData?.Exam_StudentLoadView ?? []),
    ...(studentData?.Exam_StudentUnloadView ?? []),
  ];

  const routineColumns =
    Number(queryParams?.PdfID) === 1
      ? reportData?.routine ?? []
      : Array.from({ length: 14 });

  const colCount = routineColumns.length || 1;
  const colWidth = `calc((100% - ${FIXED_W}px) / ${colCount})`;

  const hasSeatPlan = Object.keys(examSeatPlanData ?? {}).length > 0;

  if (requireSeatPlan && !hasSeatPlan) return null;

  return (
    <div className="mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
      <div>
        <div className="text-center mb-4">
          <h1 className="text-[28px]">{institutionInfo?.InstitutionName}</h1>
          <p className="text-[20px]">{institutionInfo?.Address}</p>
          <p className="text-[20px] mb-4">
            {examNameData?.ExamName} - {sessionData?.SessionName}
          </p>
          <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px] rounded-[4px]">
            পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র
          </h2>
        </div>

        <div className="mb-2">
          <p className="font-semibold text-[18px] relative">
            মারহালা/শ্রেণীঃ ...................................................
            <span className="absolute left-[150px] bottom-[10px]">
              {subClassData?.SubClass}
            </span>
          </p>
        </div>

        <table className="w-full table-fixed border border-black border-collapse text-center">
          <colgroup>
            <col style={{ width: `${SL_W}px` }} />
            <col style={{ width: `${ID_W}px` }} />
            <col style={{ width: `${NAME_W}px` }} />
            {routineColumns.map((_, i) => (
              <col key={i} style={{ width: colWidth }} />
            ))}
          </colgroup>

          <thead>
            {/* তারিখ */}
            <tr>
              <td colSpan={3} className="text-left border border-black p-1 bg-white">
                <div className="flex gap-6 items-center">
                  <span className="block w-10 text-[16px] font-bold">তারিখ</span>
                  <span>{"------>>"}</span>
                </div>
              </td>
              {routineColumns.map((item, i) => (
                <td key={i} className="border border-black p-1 bg-white align-middle">
                  <div className="text-[14px] text-black font-bold leading-tight break-words">
                    {item &&
                      bnBijoy2Unicode(
                        formatToDDMMYYYY(item.ExamDate) || item.ExamDate
                      )}
                  </div>
                </td>
              ))}
            </tr>

            {/* বার */}
            <tr>
              <td colSpan={3} className="text-left border border-black p-1 bg-white">
                <div className="flex gap-6 items-center">
                  <span className="block w-10 text-[16px] font-bold">বার</span>
                  <span>{"------>>"}</span>
                </div>
              </td>
              {routineColumns.map((item, i) => (
                <td key={i} className="border border-black p-1 bg-white align-middle">
                  <div className="text-[14px] font-bold text-[#334155] leading-tight break-words">
                    {item?.ExamDay}
                  </div>
                </td>
              ))}
            </tr>

            {/* সময় */}
            <tr>
              <td colSpan={3} className="text-left border-0 p-1 bg-white">
                <div className="flex gap-6 items-center">
                  <span className="block w-10 text-[16px] font-bold">সময়</span>
                  <span>{"------>>"}</span>
                </div>
              </td>
              {routineColumns.map((item, i) => (
                <td
                  key={i}
                  className="border border-black p-1 bg-white font-Poppins align-middle"
                >
                  <div className="text-[12px] text-gray-700 leading-tight break-words">
                    {item && `${item.StartTime} – ${item.EndTime}`}
                  </div>
                </td>
              ))}
            </tr>

            {/* হেডার */}
            <tr>
              <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle bg-white">
                ক্রমিক
              </th>
              <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle bg-white">
                আইডি
              </th>
              <th className="border border-[#2d5080] text-[15px] font-bold p-1 align-middle text-center bg-white">
                পরীক্ষার্থীর নাম
              </th>
              {routineColumns.map((item, i) => (
                <th
                  key={i}
                  className="border border-[#2d5080] text-[12px] font-bold p-1 align-middle text-center bg-white leading-tight break-words hyphens-auto"
                >
                  {item?.subject?.SubjectName}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {assignments.map((student, index) => (
              <tr
                key={student.UserID ?? student.User?.UserID ?? student.UserCode ?? index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="border border-black text-[15px] font-semibold p-1 align-middle">
                  {bnBijoy2Unicode(String(index + 1))}
                </td>
                <td className="border border-black text-[15px] p-1 text-gray-800 align-middle">
                  {bnBijoy2Unicode(
                    String(student.User?.UserCode ?? student.UserCode ?? "")
                  )}
                </td>
                <td className="border border-black text-[15px] font-medium p-2 text-left align-middle leading-tight break-words">
                  {student.User?.UserName ?? student.UserName}
                </td>
                {routineColumns.map((_, i) => (
                  <td key={i} className="border border-black h-10 bg-white"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithoutExamRoutine;










































// import { skipToken } from "@reduxjs/toolkit/query";
// import {
//   useGetExamNameQuery,
//   useGetGetStudentListQuery,
// } from "../../../../features/exam/examQuerySlice";
// import { useGetHallwiseSeatPlanQuery } from "../../../../features/exam/examSitPlanQuerySlice";
// import { useGetSingleSubClassQuery } from "../../../../features/class/classQuerySlice";
// import { useGetSessionQuery } from "../../../../features/session/sessionSlice";
// import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
// import bnBijoy2Unicode from "../../../../utils/conveter";
// import { formatToDDMMYYYY } from "../../../../utils/dateFormat";

// const WithoutExamRoutine = ({ reportData, queryParams, requireSeatPlan = false }) => {
//   const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery(
//     requireSeatPlan &&
//       queryParams?.SessionID &&
//       queryParams?.ExamID &&
//       queryParams?.SubClassID
//       ? {
//           sessionId: queryParams.SessionID,
//           examId: queryParams.ExamID,
//           subClassId: queryParams.SubClassID,
//         }
//       : skipToken
//   );
//   const hasReportStudentList = Array.isArray(reportData?.studentList);
//   const { data: studentData } = useGetGetStudentListQuery(
//     !hasReportStudentList &&
//       queryParams?.SessionID &&
//       queryParams?.ExamID &&
//       queryParams?.SubClassID
//       ? {
//           SessionID: queryParams.SessionID,
//           ExamID: queryParams.ExamID,
//           SubClassID: queryParams.SubClassID,
//         }
//       : skipToken
//   );
//   const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
//   const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
//   const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
//   const { data: institutionInfo } = useGetInstitutionInfoQuery();
//   const assignments = reportData?.studentList ?? [
//     ...(studentData?.Exam_StudentLoadView ?? []),
//     ...(studentData?.Exam_StudentUnloadView ?? []),
//   ];
//   const routineColumns =
//     Number(queryParams?.PdfID) === 1
//       ? reportData?.routine ?? []
//       : Array.from({ length: 14 });
//   const hasSeatPlan = Object.keys(examSeatPlanData ?? {}).length > 0;

//   if (requireSeatPlan && !hasSeatPlan) return null;

//   return (
//     <div className="mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
//       <div>
//             <div className="text-center mb-4">
//               <h1 className="text-[28px]">{institutionInfo?.InstitutionName}</h1>
//               <p className="text-[20px]">{institutionInfo?.Address}</p>
//               <p className="text-[20px] mb-4">{examNameData?.ExamName} - {sessionData?.SessionName}</p>
//               <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px] rounded-[4px]">
//                 পরীক্ষার্থী দস্তখত / স্বাক্ষরপত্র
//               </h2>
//             </div>

//             <div className="mb-2">
//               <p className="font-semibold text-[18px] relative">
//                 মারহালা/শ্রেণীঃ ...................................................
//                 <span className="absolute left-[150px] bottom-[10px]">{subClassData?.SubClass}</span>
//               </p>
//             </div>

//             <table className="w-full border border-black border-collapse text-center pt-4">
//               <thead>
//                 <tr>
//                   <td colSpan={3} className="text-left border border-black p-1 bg-white">
//                     <div className="flex gap-6 items-center">
//                       <span className="block w-10 text-[16px] font-bold">তারিখ</span>
//                       <span>{"------>>"}</span>
//                     </div>
//                   </td>
//                   {routineColumns.map((item, i) => (
//                     <td key={i} className="border border-black p-1 bg-white">
//                       <div className="text-[16px] text-black font-bold">
//                         {item &&
//                           bnBijoy2Unicode(
//                             formatToDDMMYYYY(item.ExamDate) || item.ExamDate
//                           )}
//                       </div>
//                     </td>
//                   ))}
//                 </tr>
//                 <tr>
//                   <td colSpan={3} className="text-left border border-black p-1 bg-white">
//                     <div className="flex gap-6 items-center">
//                       <span className="block w-10 text-[16px] font-bold">বার</span>
//                       <span>{"------>>"}</span>
//                     </div>
//                   </td>
//                   {routineColumns.map((item, i) => (
//                     <td key={i} className="border border-black p-1 bg-white">
//                       <div className="text-[16px] font-bold text-[#334155]">
//                         {item?.ExamDay}
//                       </div>
//                     </td>
//                   ))}
//                 </tr>
//                 <tr>
//                   <td colSpan={3} className="text-left border border-0 p-1 bg-white">
//                     <div className="flex gap-6 items-center">
//                       <span className="block w-10 text-[16px] font-bold">সময়</span>
//                       <span>{"------>>"}</span>
//                     </div>
//                   </td>
//                   {routineColumns.map((item, i) => (
//                     <td key={i} className="border border-black p-1 bg-white font-Poppins">
//                       <div className="text-[16px] text-gray-700">
//                         {item && `${item.StartTime} – ${item.EndTime}`}
//                       </div>
//                     </td>
//                   ))}
//                 </tr>
//                 <tr>
//                   <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
//                     ক্রমিক
//                   </th>
//                   <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle bg-white">
//                     আইডি
//                   </th>
//                   <th className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-center bg-white">
//                     পরীক্ষার্থীর নাম
//                   </th>
//                   {routineColumns.map((item, i) => (
//                     <th
//                       key={i}
//                       className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-center bg-white"
//                     >
//                       {item?.subject?.SubjectName}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {assignments.map((student, index) => (
//                   <tr
//                     key={student.UserID ?? student.User?.UserID ?? student.UserCode ?? index}
//                     className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                   >
//                     <td className="border border-black text-[16px] font-semibold p-1">
//                       {bnBijoy2Unicode(String(index + 1))}
//                     </td>
//                     <td className="border border-black text-[16px] p-1 text-gray-800">
//                       {bnBijoy2Unicode(String(student.User?.UserCode ?? student.UserCode ?? ""))}
//                     </td>
//                     <td className="border border-black text-[16px] font-medium p-2 text-left">
//                       {student.User?.UserName ?? student.UserName}
//                     </td>
//                     {routineColumns.map((_, i) => (
//                       <td key={i} className="border border-black h-10 w-[90px] bg-white"></td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//       </div>
//     </div>
//   );
// };



// export default WithoutExamRoutine
