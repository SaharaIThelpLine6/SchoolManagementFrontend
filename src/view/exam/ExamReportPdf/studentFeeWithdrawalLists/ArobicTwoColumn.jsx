const ArobicTwoColumn = () => {
  const data = [
    {
      sl: 1,
      roll: '100004',
      name: 'محمد منوير حسين',
      fee: '',
    },
    {
      sl: 2,
      roll: '100005',
      name: 'محمد سليم أحمد',
      fee: '',
    },
    {
      sl: 3,
      roll: '100006',
      name: 'محمد شيراج',
      fee: '',
    },
    {
      sl: 4,
      roll: '100003',
      name: 'زاهيرول محمود',
      fee: '',
    },
    {
      sl: 5,
      roll: '100008',
      name: 'محمد هارون',
      fee: '',
    },
    {
      sl: 6,
      roll: '100012',
      name: 'سانية آزاد',
      fee: '',
    },
    {
      sl: 7,
      roll: '100014',
      name: 'سنجدہ آزاد سمی',
      fee: '',
    },
    {
      sl: 8,
      roll: '100016',
      name: 'فرجانہ آزاد',
      fee: '',
    },
    {
      sl: 9,
      roll: '100018',
      name: 'تانیہ آزاد',
      fee: '',
    },
    {
      sl: 10,
      roll: '100020',
      name: 'میم آزاد سمیعہ',
      fee: '',
    },
  ];

  // Split data into two columns
  const half = Math.ceil(data.length / 2);
  const firstColumn = data.slice(0, half);
  const secondColumn = data.slice(half);

  return (
    <div
      dir="rtl"
      className="bg-white text-gray-800 font-[Amiri] p-4 print:p-2 mx-auto border border-gray-200 shadow-sm"
      style={{
        width: '210mm', // A4 width for two columns
        minHeight: '297mm',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header */}
      <div className="text-center mb-4 border-b border-gray-200 pb-3">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          الجامعة الإسلامية
        </h1>
        <p className="text-xs text-gray-600 mb-1">باداباري، دكا</p>
        <p className="text-xs text-gray-600 mb-2">٠١٨٢٥٢٥٢٥٥٢</p>

        <div className="bg-white py-2 px-3 mx-auto">
          <h2 className="text-sm font-semibold mb-1 leading-tight">
            قائمة جمع رسوم الطلاب، السنة الدراسية- (٢٠٢٥)
          </h2>
          <p className="text-xs mb-1">القسم الفرعي البنغالي-(الصف الثاني)</p>
          <p className="text-xs font-medium">
            اسم الامتحان - الامتحان النصفي الأول
          </p>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-600 font-medium">
            المبلغ المحدد للرسوم
          </p>
          <p className="text-xs text-gray-500">تاريخ الطباعة: ١</p>
        </div>
      </div>

      {/* Two Column Table Layout */}
      <div className="overflow-hidden grid grid-cols-2 gap-4">
        {/* First Column */}
        <div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-center font-semibold">
                <th className="border border-gray-300 px-1 py-1 w-8">
                  الترتيب
                </th>
                <th className="border border-gray-300 px-1 py-1 w-12">
                  رقم الهوية
                </th>
                <th className="border border-gray-300 px-1 py-1">اسم الطالب</th>
                <th className="border border-gray-300 px-1 py-1 w-10">
                  الرسوم
                </th>
              </tr>
            </thead>
            <tbody>
              {firstColumn.map((row, i) => (
                <tr
                  key={i}
                  className={`text-end ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-center">
                    {row.sl}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-center">
                    {row.roll}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-end pr-1 text-xs">
                    {row.name}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">
                    {row.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Second Column */}
        <div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-center font-semibold">
                <th className="border border-gray-300 px-1 py-1 w-8">
                  الترتيب
                </th>
                <th className="border border-gray-300 px-1 py-1 w-12">
                  رقم الهوية
                </th>
                <th className="border border-gray-300 px-1 py-1">اسم الطالب</th>
                <th className="border border-gray-300 px-1 py-1 w-10">
                  الرسوم
                </th>
              </tr>
            </thead>
            <tbody>
              {secondColumn.map((row, i) => (
                <tr
                  key={i + half}
                  className={`text-end ${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-center">
                    {row.sl}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 font-medium text-center">
                    {row.roll}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-end pr-1 text-xs">
                    {row.name}
                  </td>
                  <td className="border border-gray-300 px-1 py-0.5 text-center">
                    {row.fee}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">التوقيع</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">المعلم الرئيسي</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-6 pt-3 border-t border-gray-200">
        <p>حفظ السجلات الرقمية - ٢٠٢٥</p>
      </div>
    </div>
  );
};

export default ArobicTwoColumn;
