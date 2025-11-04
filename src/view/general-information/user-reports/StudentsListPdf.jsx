import React from "react";
import { formatDateToBangla } from "../../../helper/languageFormat";
import PdfHeader from "./PdfHeader";

const StudentsListPdf = ({ data, title }) => {
  return (
    <div className="p-6 text-black">
      {/* Header */}
      <PdfHeader />

      {/* Title */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="w-48 border-t border-black mb-1" />
        <div className="w-48 border-t border-black mb-4" />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-black text-center">
          <thead>
            <tr className="!bg-white">
              <th className="border border-black px-2 py-1 w-1/12">ক্রমিক</th>
              <th className="border border-black px-2 py-1 w-1/12">আইডি নং</th>
              <th className="border border-black px-2 py-1">ইউজার নাম</th>
              <th className="border border-black px-2 py-1">পিতার নাম</th>
              <th className="border border-black px-2 py-1">মাতার নাম</th>
              <th className="border border-black px-2 py-1">মোবাইল</th>
              <th className="border border-black px-2 py-1">এন্ট্রি তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student, index) => (
              <tr key={index} className="!bg-white">
                <td className="border border-black px-2 py-1">{index + 1}</td>
                <td className="border border-black px-2 py-1">
                  {student.UserCode}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.UserName}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.FatherName}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.MotherName}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.Mobile1}
                </td>
                <td className="border border-black px-2 py-1">
                  {formatDateToBangla(student.CreateAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsListPdf;
