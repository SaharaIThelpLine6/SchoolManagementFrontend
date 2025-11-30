import React from "react";
import bnBijoy2Unicode from "../../utils/conveter";

const AvgNumberResult = ({ studentResult }) => {
  return (
    <div className="bg-white px-[5px]">
      <div className="flex flex-col items-center">
        <div className="w-full flex justify-between my-5 px-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">
                {bnBijoy2Unicode(studentResult?.StudentIDLabel)}:
              </p>
              <p>{studentResult?.UserCode}</p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">
                {bnBijoy2Unicode(studentResult?.ClassNameLabel)}:
              </p>
              <p className="text-[16px]">
                {bnBijoy2Unicode(studentResult?.SubClass)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">প্রাপ্তি বিভাগ:</p>
              <p className="text-[16px]">
                {bnBijoy2Unicode(studentResult?.Division)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">নাম:</p>
              <p className="text-[16px]">
                {bnBijoy2Unicode(studentResult?.UserName)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">পিতার নাম:</p>
              <p className="text-[16px]">
                {bnBijoy2Unicode(studentResult?.FatherName)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <p className="font-semibold text-[16px]">জন্ম তারিখ:</p>
              <p className="text-[16px]">
                {studentResult?.DateOfBirth
                  ? bnBijoy2Unicode(studentResult.DateOfBirth.split("T")[0])
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
            >
              ক্রমিক নং
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
            >
              বিষয়
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
            >
              পূর্ণমান
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
            >
              পাশ নম্বর
            </th>
            <th
              className="text-semibold text-[16px] border border-black h-12 "
              bgcolor="#ffffff"
            >
              প্রাপ্ত নম্বর
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: studentResult.SubSonkha }).map((_, index) => (
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
                {bnBijoy2Unicode(studentResult[`Subject${index + 1}`])}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(String(studentResult[`MaxNumber${index + 1}`]))}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4"
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(
                  String(studentResult[`PassNumber${index + 1}`])
                )}
              </td>
              <td
                className="text-[16px] border border-black h-[36px] pl-4 "
                bgcolor="#ffffff"
              >
                {bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}
              </td>
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
              <p>{bnBijoy2Unicode(String(studentResult?.Average))}</p>
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
