import React from "react";

const StudentsWithoutAdmissionPdf = () => {
  const data = [
    {
      id: 1,
      name: "মাহমুদুল হাসান",
      father: "মোঃ আব্দুল খালেক",
      mother: "মোছাঃ রুবিনা খাতুন",
      mobile: "01711111111",
      entryDate: "2024-01-10",
    },
    {
      id: 2,
      name: "রাশেদুল ইসলাম",
      father: "মোঃ আমিনুল ইসলাম",
      mother: "মোছাঃ হাসিনা বেগম",
      mobile: "01722222222",
      entryDate: "2024-01-12",
    },
    {
      id: 3,
      name: "আব্দুল্লাহ আল মামুন",
      father: "মোঃ শামসুল হক",
      mother: "মোছাঃ খাদিজা বেগম",
      mobile: "01733333333",
      entryDate: "2024-01-15",
    },
    {
      id: 4,
      name: "নাসির উদ্দিন",
      father: "মোঃ আলী আকবর",
      mother: "মোছাঃ জাহানারা",
      mobile: "01744444444",
      entryDate: "2024-01-17",
    },
    {
      id: 5,
      name: "জাকারিয়া হোসেন",
      father: "মোঃ সাইফুল ইসলাম",
      mother: "মোছাঃ রোকেয়া বেগম",
      mobile: "01755555555",
      entryDate: "2024-01-18",
    },
    {
      id: 6,
      name: "সাইফুল ইসলাম",
      father: "মোঃ আব্দুল জলিল",
      mother: "মোছাঃ সালমা বেগম",
      mobile: "01766666666",
      entryDate: "2024-01-20",
    },
    {
      id: 7,
      name: "তানভীর আহমেদ",
      father: "মোঃ ফজলুল করিম",
      mother: "মোছাঃ শারমিন আক্তার",
      mobile: "01777777777",
      entryDate: "2024-01-21",
    },
    {
      id: 8,
      name: "রিয়াদ মাহমুদ",
      father: "মোঃ নজরুল ইসলাম",
      mother: "মোছাঃ নাজমা আক্তার",
      mobile: "01788888888",
      entryDate: "2024-01-22",
    },
    {
      id: 9,
      name: "হাসিবুর রহমান",
      father: "মোঃ ফারুক হোসেন",
      mother: "মোছাঃ সামছুন্নাহার",
      mobile: "01799999999",
      entryDate: "2024-01-23",
    },
    {
      id: 10,
      name: "নাজমুল হাসান",
      father: "মোঃ শহিদুল ইসলাম",
      mother: "মোছাঃ তাসলিমা আক্তার",
      mobile: "01811111111",
      entryDate: "2024-01-24",
    },
    {
      id: 11,
      name: "সাদমান সাকিব",
      father: "মোঃ হাফিজুর রহমান",
      mother: "মোছাঃ মাহফুজা বেগম",
      mobile: "01822222222",
      entryDate: "2024-01-25",
    },
    {
      id: 12,
      name: "তানজিমুল হক",
      father: "মোঃ শহীদুল্লাহ",
      mother: "মোছাঃ রাবেয়া খাতুন",
      mobile: "01833333333",
      entryDate: "2024-01-26",
    },
    {
      id: 13,
      name: "নাঈম হাসান",
      father: "মোঃ কামরুল ইসলাম",
      mother: "মোছাঃ শাহানাজ পারভিন",
      mobile: "01844444444",
      entryDate: "2024-01-27",
    },
    {
      id: 14,
      name: "আবির হোসেন",
      father: "মোঃ আব্দুর রহমান",
      mother: "মোছাঃ নাসরিন আক্তার",
      mobile: "01855555555",
      entryDate: "2024-01-28",
    },
    {
      id: 15,
      name: "সিয়াম আহমেদ",
      father: "মোঃ আজিজুল হক",
      mother: "মোছাঃ আফসানা আক্তার",
      mobile: "01866666666",
      entryDate: "2024-01-29",
    },
    {
      id: 16,
      name: "শিহাব উদ্দিন",
      father: "মোঃ ওবায়দুল কাদের",
      mother: "মোছাঃ হোসনে আরা",
      mobile: "01877777777",
      entryDate: "2024-01-30",
    },
    {
      id: 17,
      name: "রাফি খান",
      father: "মোঃ শহীদুল ইসলাম",
      mother: "মোছাঃ আম্বিয়া খাতুন",
      mobile: "01888888888",
      entryDate: "2024-02-01",
    },
    {
      id: 18,
      name: "তামীম হাসান",
      father: "মোঃ মজিবুর রহমান",
      mother: "মোছাঃ নারগিস আক্তার",
      mobile: "01899999999",
      entryDate: "2024-02-03",
    },
    {
      id: 19,
      name: "মাসুম রানা",
      father: "মোঃ সাদেক হোসেন",
      mother: "মোছাঃ আনোয়ারা বেগম",
      mobile: "01911111111",
      entryDate: "2024-02-04",
    },
    {
      id: 20,
      name: "জুবায়ের হোসেন",
      father: "মোঃ আব্দুল মান্নান",
      mother: "মোছাঃ বিলকিস বেগম",
      mobile: "01922222222",
      entryDate: "2024-02-05",
    },
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
        <div className="w-20 h-20"></div>
      </div>

      {/* Title */}
      <h2 className="text-center text-lg font-semibold underline mb-4">
        সকল ইউজারের পরিসংখ্যান
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-black text-center">
          <thead>
            <tr className="!bg-white">
              <th className="border border-black px-2 py-1 w-1/12">ক্রমিক</th>
              <th className="border border-black px-2 py-1">উজার নাম</th>
              <th className="border border-black px-2 py-1">পিতার নাম</th>
              <th className="border border-black px-2 py-1">মাতার নাম</th>
              <th className="border border-black px-2 py-1">মোবাইল</th>
              <th className="border border-black px-2 py-1">এন্ট্রি তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((student) => (
              <tr key={student.id} className="!bg-white">
                <td className="border border-black px-2 py-1">{student.id}</td>
                <td className="border border-black px-2 py-1">
                  {student.name}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.father}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.mother}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.mobile}
                </td>
                <td className="border border-black px-2 py-1">
                  {student.entryDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsWithoutAdmissionPdf;
