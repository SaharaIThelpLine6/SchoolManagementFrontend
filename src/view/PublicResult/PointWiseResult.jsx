import React from "react";
import bnBijoy2Unicode from "../../utils/conveter";

const formatNumber = (value) =>
  value == null ? "" : bnBijoy2Unicode(String(value));

const getDivisionName = (subject, value) => {
  if (value == null || value === "") return "";

  const mark = Number(value);
  if (!Number.isFinite(mark)) return "";

  for (let index = 1; index <= 7; index++) {
    const threshold = subject[`DivisionNumber${index}`];
    if (
      threshold != null &&
      threshold !== "" &&
      Number.isFinite(Number(threshold)) &&
      mark >= Number(threshold)
    ) {
      return subject[`Division${index}`]?.DivisionNames ?? "";
    }
  }

  return "";
};

const PointWiseResult = ({ studentResult }) => {
  const examSubjects = [...(studentResult?.examSubjectPassNumber ?? [])]
    .filter(
      (subject) =>
        Number.isInteger(Number(subject.SubjectSL)) &&
        Number(subject.SubjectSL) > 0
    )
    .sort((a, b) => Number(a.SubjectSL) - Number(b.SubjectSL));

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
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              ক্রমিক নং
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              বিষয়
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              পূর্ণমান
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              পাশ নম্বর
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              প্রাপ্ত নম্বর
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              গ্রেড
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12"
              bgcolor="#ffffff"
            >
              জিপিএ
            </th>
          </tr>
        </thead>
        <tbody>
          {examSubjects.map((subject) => {
            const slot = Number(subject.SubjectSL);
            const mark = studentResult?.[`SubVal${slot}`];

            return (
              <tr key={subject.ID ?? slot}>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {formatNumber(slot)}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {subject.Subject?.SubjectName}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {formatNumber(subject.MaxNumber)}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {formatNumber(subject.PassNumber)}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {formatNumber(mark)}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4 font-bold"
                  bgcolor="#ffffff"
                >
                  {getDivisionName(subject, mark)}
                </td>
                <td
                  className="text-[16px] border border-black h-[36px] pl-4"
                  bgcolor="#ffffff"
                >
                  {formatNumber(studentResult?.[`GPA${slot}`])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-center mt-[25px]">
        <div className="w-full">
          <div className="flex justify-between items-center border border-black p-4 font-bold">
            <div className="flex items-center space-x-2 ">
              <p className="text-[16px]">প্রাপ্ত গ্রেড:</p>
              <p>{studentResult?.Division?.DivisionNames}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-[16px]">মেধা স্থান:</p>
              <p>{formatNumber(studentResult?.Positions)}</p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="text-[16px]">মোট নম্বর:</p>
              <p>{formatNumber(studentResult?.Total)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointWiseResult;
