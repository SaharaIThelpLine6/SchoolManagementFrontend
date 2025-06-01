import React from "react";
import PdfHeader from "./PdfHeader";

const UserSummaryReportsPdf = ({ data }) => {
  // Calculate total user count
  const total = data.reduce((sum, item) => sum + item.userCount, 0);

  return (
    <div className="p-6 bg-white text-black print:text-sm print:p-0 print:bg-white">
      {/* Header */}
      <PdfHeader />

      {/* Title */}
      <h2 className="text-center text-lg font-semibold underline mb-4">
        সকল ইউজারের পরিসংখ্যান
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border border-black text-center bg-white">
          <thead>
            <tr>
              <th className="border border-black px-2 py-1 w-1/6">ক্রমিক</th>
              <th className="border border-black px-2 py-1">ইউজারের ধরন</th>
              <th className="border border-black px-2 py-1 w-1/6">
                ইউজারের সংখ্যা
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.UserTypeID} className="!bg-white">
                <td className="border border-black px-2 py-1">{index + 1}</td>
                <td className="border border-black px-2 py-1">
                  {item.TypeName}
                </td>
                <td className="border border-black px-2 py-1">
                  {item.userCount}
                </td>
              </tr>
            ))}
            <tr className="!bg-white font-bold">
              <td
                colSpan="2"
                className="border border-black px-2 py-1 text-right"
              >
                মোট =
              </td>
              <td className="border border-black px-2 py-1">{total}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSummaryReportsPdf;
