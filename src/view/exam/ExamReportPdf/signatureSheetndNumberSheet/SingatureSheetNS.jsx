const SingatureSheetNS = () => {
  const data = [
    { sl: 1, roll: '100004', name: 'মোঃ মনোয়ার হোসেন' },
    { sl: 2, roll: '100005', name: 'মোঃ সেলিম আহমেদ' },
    { sl: 3, roll: '100006', name: 'মোঃ শিরাজ' },
    { sl: 4, roll: '100003', name: 'জহিরুল মাহমুদ' },
    { sl: 5, roll: '100008', name: 'মোঃ হারুন' },
    { sl: 6, roll: '100012', name: 'মোছাঃ সানিয়া আজাদ' },
    { sl: 7, roll: '100014', name: 'সানজিদা আজাদ সুমি' },
    { sl: 8, roll: '100016', name: 'ফারজানা আজাদ' },
    { sl: 9, roll: '100018', name: 'তানিয়া আজাদ' },
    { sl: 10, roll: '100020', name: 'মিম আজাদ সুমাইয়া' },
  ];

  return (
    <div className="bg-white font-[kalpurush] text-black p-6 max-w-6xl mx-auto print:p-4">
      {/* Top dash */}
      <div className="text-center mb-2">-</div>

      {/* Title */}
      <div className="text-center font-semibold mb-4">
        স্বাক্ষরপত্র ও নম্বরপত্র ;
      </div>

      {/* Exam name + Kitab */}
      <div className="flex justify-between items-center mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span>পরীক্ষার নাম :</span>
          <div className="border-b border-dotted border-black w-64"></div>
        </div>
        <div className="border border-black px-3 py-1 min-w-[160px] text-center">
          কিতাব :
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-black px-2 py-1 w-12">ক্র.নং</th>
            <th className="border border-black px-2 py-1 w-20"></th>
            <th className="border border-black px-2 py-1">শিক্ষার্থীর নাম</th>
            <th className="border border-black px-2 py-1 w-32">স্বাক্ষর</th>
            <th className="border border-black px-2 py-1 w-24">
              প্রাপ্ত নম্বর
            </th>
            <th className="border border-black px-2 py-1 w-24">মাসিক নম্বর</th>
            <th className="border border-black px-2 py-1 w-24">মোট নম্বর</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.sl} className="h-8">
              <td className="border border-black text-center">{row.sl}</td>
              <td className="border border-black text-center">{row.roll}</td>
              <td className="border border-black px-2">{row.name}</td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
              <td className="border border-black"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SingatureSheetNS;
