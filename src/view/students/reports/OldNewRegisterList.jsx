import React from "react";

const OldNewRegisterList = () => {
  const students = [
    {
      sl: "১",
      roll: "১০০০১",
      name: "সাকিব আল হাসান",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "২",
      roll: "১০০০২",
      name: "শেখ হাসিনা",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৩",
      roll: "১০০০৩",
      name: "শেখ কামাল",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৪",
      roll: "১০০০৫",
      name: "নাসির ভাই",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৫",
      roll: "১০০০৬",
      name: "তানভীর",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৬",
      roll: "১০০০৮",
      name: "খালেদুল্লাহ লব্ধরক্ষ",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৭",
      roll: "১০১০১",
      name: "ইমন",
      father: "হাসান",
      dob: "০১/০১/২০০৫",
    },
    {
      sl: "৮",
      roll: "১০১০২",
      name: "গিয়াস",
      father: "মোঃ গাজী সালা উদ্দিন",
      dob: "১১/০১/২০০৪",
    },
    {
      sl: "৯",
      roll: "১০১০৩",
      name: "ইমন",
      father: "মোঃ গাজী সালা উদ্দিন",
      dob: "১২/০১/২০০৪",
    },
  ];

  return (
    <div className="bg-white p-8 text-black text-sm">
      {/* Header Section */}
      <div className="grid grid-cols-3 gap-4 mb-6 border border-black p-4">
        <div className="flex gap-2">
          <span>শ্রেণী/জামাত:</span>
          <span className="font-bold underline">হিফজ</span>
        </div>
        <div className="flex gap-2 justify-center">
          <span>সর্বমোট শিক্ষার্থী:</span>
          <span className="font-bold underline">{students.length}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <span>শিক্ষার্থীর ধরন:</span>
          <span className="font-bold underline">নতুন</span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-black border-collapse">
          <thead>
            <tr className="bg-gray-200 text-center text-sm">
              <th className="border border-black px-2 py-1">ক্রমিক</th>
              <th className="border border-black px-2 py-1">দাখেলা</th>
              <th className="border border-black px-2 py-1">নাম</th>
              <th className="border border-black px-2 py-1">পিতার নাম</th>
              <th className="border border-black px-2 py-1">জন্ম তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={idx} className="text-center">
                <td className="border border-black px-2 py-1">{s.sl}</td>
                <td className="border border-black px-2 py-1">{s.roll}</td>
                <td className="border border-black px-2 py-1">{s.name}</td>
                <td className="border border-black px-2 py-1">{s.father}</td>
                <td className="border border-black px-2 py-1">{s.dob}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OldNewRegisterList;
