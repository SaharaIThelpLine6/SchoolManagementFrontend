const BanglaNumberStudentNameWithA5 = () => {
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
    <div className="bg-white text-gray-800 font-[kalpurush] p-4 print:p-2 max-w-[148mm] mx-auto border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="border border-black-2 w-full py-1 text-start px-2">
          <span className="font-bold text-sm">কিতাব</span>:
        </div>
        <p className="text-sm text-start py-2 text-gray-600 font-bold">
          পরীক্ষার নাম:_______________
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="border border-black-2 w-full py-1 text-start px-2">
            <span className="font-bold text-sm">কিতাব</span>:
          </div>
          <p className="text-sm text-start text-gray-600 font-bold">
            তারিখঃ_______________
          </p>
        </div>
      </div>

      {/* Table - শুধুমাত্র ৪টি কলাম */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-white border-2 text-center font-semibold">
              <th className="border border-gray-300 px-1 py-1 w-8 text-gray-700">
                ক্রম
              </th>
              <th className="border border-gray-300 px-1 py-1 w-16 text-gray-700">
                আইডি নং
              </th>
              <th className="border border-gray-300 px-1 py-1 text-gray-700">
                পরীক্ষার্থীর নাম
              </th>
              <th className="border border-gray-300 px-1 py-1 w-12 text-gray-700">
                ফি
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-start">
                <td className="border border-gray-300 px-1 py-1 font-medium text-gray-700 text-center">
                  {row.sl}
                </td>
                <td className="border border-gray-300 px-1 py-1 font-medium text-gray-800 text-center">
                  {row.roll}
                </td>
                <td className="border border-gray-300 px-1 py-1 text-start pr-2 text-gray-800">
                  {row.name}
                </td>
                <td className="border border-gray-300 px-1 py-1 text-gray-600 text-center">
                  {row.fee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 grid grid-cols-3 gap-1">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">স্বাক্ষর</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">প্রধান শিক্ষক</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">স্বাক্ষর</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">প্রধান শিক্ষক</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">স্বাক্ষর</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">প্রধান শিক্ষক</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200">
        <p>ডিজিটাল রেকর্ড সংরক্ষণ - ২০২৫</p>
      </div>

      {/* A5 Size Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: A5;
            margin: 10mm;
          }
          body {
            width: 148mm;
            height: 210mm;
          }
        }
      `}</style>
    </div>
  );
};

export default BanglaNumberStudentNameWithA5;
