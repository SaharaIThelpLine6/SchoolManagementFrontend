import React from "react";
import bnBijoy2Unicode from "../../utils/conveter";

const AvgNumberResult = ({ studentResult }) => {
  const jointColumns = studentResult?.jointSourceExams ?? [];
  
  return (
    <div className="bg-white px-[5px]">
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-between my-5 px-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">
                শিক্ষার্থী আইডি:
              </p>
              <p>{studentResult?.User?.UserCode}</p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">
                শ্রেণি:
              </p>
              <p className="text-[16px]">
                {studentResult?.Class?.SubClass}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">প্রাপ্তি বিভাগ:</p>
              <p className="text-[16px]">
                {studentResult?.Division?.DivisionNames}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">নাম:</p>
              <p className="text-[16px]">
                {studentResult?.User?.UserName}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">পিতার নাম:</p>
              <p className="text-[16px]">
                {studentResult?.User?.FatherName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">জন্ম তারিখ:</p>
              <p className="text-[16px]">
                {studentResult?.User?.DateOfBirth
                  ? bnBijoy2Unicode(studentResult.User.DateOfBirth.split("T")[0])
                  : ""}{" "}
                ইং{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <table
        width="100%"
        border={0}
        cellSpacing={0}
        cellPadding={0}
        className="border-collapse border border-rose-600"
      >
        <thead>
          <tr>
            <th
              className="text-semibold text-[16px] border border-black h- "
              bgcolor="#ffffff"
             rowSpan={jointColumns.length > 0 ? 2 : 1}>
              ক্রমিক নং
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
             rowSpan={jointColumns.length > 0 ? 2 : 1}>
              বিষয়
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
             rowSpan={jointColumns.length > 0 ? 2 : 1}>
              পূর্ণমান
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
             rowSpan={jointColumns.length > 0 ? 2 : 1}>
              পাশ নম্বর
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
             colSpan={1 + jointColumns.length}>
              প্রাপ্ত নম্বর
            </th>
          </tr>
          {jointColumns.length > 0 && (
            <tr>
              <th className="text-semibold text-[14px] border border-black h-12 px-2" bgcolor="#ffffff">{bnBijoy2Unicode(studentResult?.Exam?.ExamName ?? "")}</th>
              {jointColumns.map((exam) => (
                <th key={exam.ExamID} className="text-semibold text-[14px] border border-black h-12 px-2" bgcolor="#ffffff">{bnBijoy2Unicode(exam.ExamName ?? "")}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {Array.from({ length: studentResult?.averageCondition?.SubSonkha }).map((_, index) => (
            <tr>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(String(index + 1))}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {studentResult?.averageCondition?.subjects[index]?.SubjectName}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(String(studentResult?.averageCondition[`MaxNumber${index + 1}`]))}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(
                  String(studentResult?.averageCondition[`PassNumber${index + 1}`])
                )}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4 "
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}
              </td>
              {jointColumns.map((exam) => (
                <td key={exam.ExamID} className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">
                  {bnBijoy2Unicode(String(exam.MarksByUserID?.[String(studentResult?.UserID)]?.[studentResult?.averageCondition?.[`SubjectID${index + 1}`]] ?? ""))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-[25px]">
        <div className="w-full">
          <div className="flex justify-between items-center border border-black p-4 font-bold">
            <div className="flex items-center space-x-2 ">
              <p className="text-[16px]">মেধা স্থান:</p>
              <p>{bnBijoy2Unicode(String(studentResult?.Positions))}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-[16px]">গড়:</p>
              <p>{bnBijoy2Unicode(String((studentResult?.Total / studentResult?.averageCondition?.AverageSubsonkha).toFixed(2)))}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-[16px]">মোট নম্বর:</p>
              <p>{bnBijoy2Unicode(String(studentResult?.Total))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvgNumberResult;
