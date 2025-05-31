import React from "react";

const UserSummaryReportsPdf = () => {
  const data = [
    { id: 1, type: "শিক্ষার্থী", count: 119 },
    { id: 2, type: "শিক্ষক/স্টাফ", count: 55 },
    { id: 3, type: "অতিথি", count: 1 },
    { id: 4, type: "তেমো সদস্য", count: 2 },
    { id: 5, type: "লাইব্রেরি সদস্য", count: 1 },
    { id: 6, type: "সফটওয়্যার ইউজার", count: 39 },
    { id: 7, type: "কমিটি", count: 1 },
  ];

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="p-6 bg-white text-black print:text-sm print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex items-center justify-between  pb-2 print:flex-row print:items-start">
        {/* Logo on the left */}
        <div className="w-20 h-20">
          <img
            src="https://thumbs.dreamstime.com/b/education-badge-logo-design-university-high-school-emblem-education-badge-logo-design-university-high-school-emblem-151924849.jpg"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Text on the right */}
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold">জামেয়া রশীদিয়া ফেনী (তেমো)</h1>
          <p className="text-sm">
            হাউজ-১/৭, রোড-১, ব্লক- জে, বাড্ডারআ জা/৭, ঢাকা
          </p>
          <p className="text-sm">০১৮৮৫৫৯৫৫৫২</p>
        </div>
          <div className="w-20 h-20">
        </div>
      </div>

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
            {data.map(({ id, type, count }) => (
              <tr key={id} className="!bg-white">
                <td className="border border-black px-2 py-1">{id}</td>
                <td className="border border-black px-2 py-1">{type}</td>
                <td className="border border-black px-2 py-1">{count}</td>
              </tr>
            ))}
            <tr className="!bg-white">
              <td
                colSpan="2"
                className="border border-black px-2 py-1 font-bold text-right"
              >
                মোট =
              </td>
              <td className="border border-black px-2 py-1 font-bold">
                {total}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSummaryReportsPdf;
