const BanglaOneColumn = () => {
  const data = [
    {
      sl: 1,
      roll: '100004',
      name: 'মোঃ মনোয়ার হোসেন',
      father: 'আবেদ আলী',
      fee: '',
      sign: '',
    },
    {
      sl: 2,
      roll: '100005',
      name: 'মোঃ সেলিম আহমেদ',
      father: 'জামাল আহমেদ',
      fee: '',
      sign: '',
    },
    {
      sl: 3,
      roll: '100006',
      name: 'মোঃ শিরাজ',
      father: 'ফজলুল হক',
      fee: '',
      sign: '',
    },
    {
      sl: 4,
      roll: '100003',
      name: 'জহিরুল মাহমুদ',
      father: 'মোঃ কালামুল্লাহ',
      fee: '',
      sign: '',
    },
    {
      sl: 5,
      roll: '100008',
      name: 'মোঃ হারুন',
      father: 'মোঃ ইসমাইল',
      fee: '',
      sign: '',
    },
    {
      sl: 6,
      roll: '100012',
      name: 'মোছাঃ সানিয়া আজাদ',
      father: 'মোঃ রফিক উদ্দিন',
      fee: '',
      sign: '',
    },
    {
      sl: 7,
      roll: '100014',
      name: 'সানজিদা আজাদ সুমি',
      father: 'হারুন',
      fee: '',
      sign: '',
    },
    {
      sl: 8,
      roll: '100016',
      name: 'ফারজানা আজাদ',
      father: 'মোঃ শাকের',
      fee: '',
      sign: '',
    },
    {
      sl: 9,
      roll: '100018',
      name: 'তানিয়া আজাদ',
      father: 'মোঃ তারিক',
      fee: '',
      sign: '',
    },
    {
      sl: 10,
      roll: '100020',
      name: 'মিম আজাদ সুমাইয়া',
      father: 'মোঃ হাসিম',
      fee: '',
      sign: '',
    },
  ];

  return (
    <div className="bg-white text-gray-800 font-SolaimanLipi p-6 print:p-4 max-w-4xl mx-auto border border-gray-200 shadow-sm rounded-lg">
      {/* Header */}
      <div className="text-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          জামিয়া ইসলামিয়া মাদ্রাসা
        </h1>
        <p className="text-gray-600 mb-1">বাড্ডাবাড়ি, ঢাকা</p>
        <p className="text-gray-600 mb-3">০১৮২৫২৫২৫৫২</p>

        <div className="bg-white py-3 px-4 mx-auto max-w-2xl">
          <h2 className="text-lg font-semibold  mb-1">
            শিক্ষার্থীর ফি উত্তোলন তালিকা, শিক্ষাবর্ষ- (২০২৫)
          </h2>
          <p className=" text-sm mb-1">
            সাব ক্লাস বাংলা-(দ্বিতীয় শ্রেণী)
          </p>
          <p className=" text-sm font-medium">
            পরীক্ষার নাম - ১ম সামারিক পরীক্ষা
          </p>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <p className="text-sm text-gray-600 font-medium">
            নির্ধারিত ফি এর পরিমাণ
          </p>
          <p className="text-sm text-gray-500">প্রিন্ট তারিখঃ ১</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gradient-to-r bg-white border-black-1 border-2 text-center font-semibold">
              <th className="border border-gray-300 px-3 py-2 w-12 text-gray-700">
                ক্রম
              </th>
              <th className="border border-gray-300 px-3 py-2 w-20 text-gray-700">
                আইডি নং
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700">
                পরীক্ষার্থীর নাম
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700">
                পিতার নাম
              </th>
              <th className="border border-gray-300 px-3 py-2 w-16 text-gray-700">
                ফি
              </th>
              <th className="border border-gray-300 px-3 py-2 w-32 text-gray-700">
                স্বাক্ষর
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-start">
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700">
                  {row.sl}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800">
                  {row.roll}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-start pr-4 text-gray-800">
                  {row.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-start pr-4 text-gray-700">
                  {row.father}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600">
                  {row.fee}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-500">
                  {row.sign}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2 font-medium">স্বাক্ষর</p>
          <div className="border-t border-gray-400 w-40 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">প্রধান শিক্ষক</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        <p>ডিজিটাল রেকর্ড সংরক্ষণ - ২০২৫</p>
      </div>
    </div>
  );
};

export default BanglaOneColumn;
