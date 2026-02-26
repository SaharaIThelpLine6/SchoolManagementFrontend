const StatisticsOfAllStudents = () => {
  const data = [
    { id: 1, className: 'প্লে', total: 13 },
    { id: 2, className: 'নার্সারি', total: 15 },
    { id: 3, className: 'প্রথম', total: 21 },
    { id: 4, className: 'দ্বিতীয়', total: 16 },
    { id: 5, className: 'তৃতীয়', total: 26 },
  ];

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-[900px] mx-auto bg-white p-8 text-black font-serif shadow-lg">
        {/* Header - ছবির মতো ডিজাইন */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-wide">
            মাদরাসা বাবুল উলুম
          </h1>
          <p className="text-lg mt-1 text-gray-700">
            মুহরি, সোনাগাজী, গাবুরিয়া, চট্টগ্রাম
          </p>

          {/* ছবির মতো লাইন ডিজাইন */}
          <div className="relative my-4">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-black"></div>
            <div className="relative mx-auto w-fit">
              <span className="text-xl font-semibold bg-white px-6">
                শিক্ষাবর্ষ : ২০২৫–২০২৬, প্রথম টেস্ট পরীক্ষা
              </span>
            </div>
          </div>
        </div>

        {/* ছবির মতো টেবিল ডিজাইন */}
        <div className="border-2 border-black">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-black">
                <th className="border-r border-white px-6 py-3 text-center text-lg font-bold">
                  ক্রমিক নং
                </th>
                <th className="border-r border-white px-6 py-3 text-center text-lg font-bold">
                  শ্রেণি/জামাত
                </th>
                <th className="px-6 py-3 text-center text-lg font-bold">
                  মোট পরীক্ষার্থী
                </th>
              </tr>
            </thead>

            <tbody>
              {data.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="border border-gray-300 px-6 py-4 text-center text-lg font-medium">
                    {item.id}
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-center text-lg">
                    {item.className}
                  </td>
                  <td className="border border-gray-300 px-6 py-4 text-center text-lg font-semibold">
                    {item.total}
                  </td>
                </tr>
              ))}

              {/* মোট সারি - ছবির মতো */}
              <tr className="bg-gray-200 font-bold">
                <td
                  className="border border-gray-400 px-6 py-4 text-center text-lg"
                  colSpan="2"
                >
                  মোট
                </td>
                <td className="border border-gray-400 px-6 py-4 text-center text-lg text-red-600">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ছবির মতো নিচের অংশ */}
        <div className="mt-10 text-center text-gray-700">
          {/* <div className="border-t-2 border-black pt-4">
            <p className="text-sm italic">প্রধান শিক্ষক</p>
            <p className="text-sm mt-2">তারিখ: .........................</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default StatisticsOfAllStudents;
