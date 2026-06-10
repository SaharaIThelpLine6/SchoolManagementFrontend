import { useEffect } from "react";
import { useGetAllExamRoutineQuery } from "../../../../features/exam/examQuerySlice";
import bnBijoy2Unicode from "../../../../utils/conveter";

const ExamRoutine = ({ reportData, queryParams }) => {
  // const {data: examRouteenData} = useGetAllExamRoutineQuery({ sessionID: queryParams?.session_id, examID: queryParams?.exam_id}, {
  //   skip:  !queryParams?.session_id || !queryParams?.exam_id
  // })
  useEffect(() => {
    console.log("=============dfgdf====================");

    console.log(queryParams);
    console.log(reportData);
    // console.log(examRouteenData);

    // report_id, residential_id, session_id, report_id, ERIsActive
  }, [queryParams, reportData])
  return (
    <div className=" mx-auto p-6 bg-white text-black text-[14px] font-[SolaimanLipi]">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="border border-black inline-block px-8 py-1 font-semibold text-[18px]">
          পরীক্ষার্থী দপ্তর/শিক্ষণপত্র
        </h2>
      </div>

      {/* Class info */}
      <div className="mb-2">
        <p className="font-semibold">
          মারহালা/শ্রেণীঃ ...................................................
        </p>
      </div>


      {reportData?.routine?.length > 0 && reportData?.studentList?.length > 0 && (
        <table className="w-full border border-black border-collapse text-center">
          <colgroup>
            <col className="w-[5%]" /> 
            <col className="w-[9%]" />
            <col className="w-[18%]" /> 
            {reportData.routine.map((_, i) => (
              <col key={i} />          
            ))}
          </colgroup>

          <thead>
      
            <tr>
              <th rowSpan={4} className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle">ক্রমিক</th>
              <th rowSpan={4} className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle">আইডি</th>
              <th rowSpan={4} className="border border-[#2d5080] text-[16px] font-bold p-1 align-middle text-left px-2">পরীক্ষার্থীর নাম</th>
              {/* {reportData.routine.map((item, i) => (
                <th key={i} className="border border-[#2d5080] text-white text-[16px] font-bold p-1">
                  {bnBijoy2Unicode(String(i + 1))}
                </th>
              ))} */}
            </tr>

       
            

            <tr className="bg-white">
              {reportData.routine.map((item, i) => (
                <td key={i} className="border border-black p-1 bg-white">
                  <div className="text-[16px] text-gray-900 font-bold">তারিখ: {item.ExamDate}</div>
                </td>
              ))}
            </tr>

         
            <tr className="bg-white">
              {reportData.routine.map((item, i) => (
                <td key={i} className="border border-black p-1 bg-white">
                  <div className="text-[16px] font-bold text-[#334155]">{item.ExamDay}</div>
                  <div className="text-[16px] text-gray-700">{item.StartTime} – {item.EndTime}</div>
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              {reportData.routine.map((item, i) => (
                <td key={i} className="border border-black text-[16px] font-semibold text-[#1e3a5f] p-2 bg-white">
                  {item.subject.SubjectName}
                </td>
              ))}
            </tr>
          </thead>

          <tbody>
            {reportData.studentList.map((student, index) => (
              <tr key={student.ID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-black text-[16px] font-semibold p-1">
                  {bnBijoy2Unicode(String(index + 1))}
                </td>
                <td className="border border-black text-[16px] p-1 text-gray-800">
                  {bnBijoy2Unicode(String(student.User?.UserCode))}
                </td>
                <td className="border border-black text-[16px] font-medium p-2 text-left">
                  {student.User?.UserName}
                </td>
                {reportData.routine.map((_, i) => (
                  <td key={i} className="border border-black h-8 bg-white"></td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-green-50">
              <td colSpan={3} className="border border-black text-right px-2 py-3 text-[18px] font-bold text-green-700">উপস্থিত</td>
              {reportData.routine.map((_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
            </tr>
            <tr className="bg-red-50">
              <td colSpan={3} className="border border-black text-right px-2 py-3 text-[18px] font-bold text-red-700">অনুপস্থিত</td>
              {reportData.routine.map((_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
            </tr>
            <tr>
              <td colSpan={3} className="border border-black text-right px-2 py-3 text-[18px] font-bold text-[#1e3a5f] bg-gray-50">নেগারান দারার স্বাক্ষর</td>
              {reportData.routine.map((_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
            </tr>
            <tr>
              <td colSpan={3} className="border border-black text-right px-2 py-3 text-[18px] font-bold text-[#1e3a5f] bg-gray-50">পরীক্ষকের স্বাক্ষর</td>
              {reportData.routine.map((_, i) => (
                <td key={i} className="border border-black"></td>
              ))}
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default ExamRoutine;
