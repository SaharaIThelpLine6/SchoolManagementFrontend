const StatisticsOfAllExaminees = () => {
  const data = [
    { sl: 1, className: "প্রথম শ্রেণী", total: "5" },
    { sl: 2, className: "দ্বিতীয় শ্রেণী", total: "5" },
    { sl: 3, className: "চতুর্থ", total: "3" },
  ];

  const totalExaminees = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-10 font-[kalpurush] text-[16px] text-black">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-[26px] font-bold">জামিয়া ইসলামিয়া মাদরাসা</h1>
        <p className="text-[18px] mt-1">মাদারবাড়ি, ঢাকা</p>

        <p className="text-[20px] font-semibold mt-3">
          wkjvbei : ২০২৫ , ২য় সাময়িক পরীক্ষা
        </p>

        {/* horizontal line */}
        <div className="border-t-[2px] border-black mt-2 w-[80%] mx-auto"></div>
      </div>

      {/* Table */}
      <table className="w-[85%] mx-auto text-[18px] mt-10 border-collapse">
        <thead>
          <tr className="text-center font-semibold">
            <th className="border border-black px-4 py-2 w-28">ক্রমিক নং</th>
            <th className="border border-black px-4 py-2">শ্রেণী/জামাত</th>
            <th className="border border-black px-4 py-2 w-32">মোট পরীক্ষার্থী</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr key={row.sl} className="text-center">
              <td className="border border-black px-4 py-2">{row.sl}</td>
              <td className="border border-black px-4 py-2 text-left">
                {row.className}
              </td>
              <td className="border border-black px-4 py-2">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Total */}
      <div className="w-[85%] mx-auto mt-6 text-right text-[18px] font-semibold">
        সর্বমোট পরীক্ষার্থী : {totalExaminees}
      </div>
    </div>
  );
};

export default StatisticsOfAllExaminees;






