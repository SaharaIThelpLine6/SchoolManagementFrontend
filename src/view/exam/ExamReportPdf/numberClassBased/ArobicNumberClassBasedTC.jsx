const ArobicNumberClassBasedTC = () => {
  const data = [
    {
      sl: 1,
      roll: '100004',
      name: 'محمد منوار حسين',
      father: 'عبد علي',
      fee: '',
      sign: '',
    },
    {
      sl: 2,
      roll: '100005',
      name: 'محمد سليم أحمد',
      father: 'جمال أحمد',
      fee: '',
      sign: '',
    },
    {
      sl: 3,
      roll: '100006',
      name: 'محمد سراج',
      father: 'فاضل الحق',
      fee: '',
      sign: '',
    },
    {
      sl: 4,
      roll: '100003',
      name: 'جاهرول محمود',
      father: 'محمد كلام الله',
      fee: '',
      sign: '',
    },
    {
      sl: 5,
      roll: '100008',
      name: 'محمد هارون',
      father: 'محمد إسماعيل',
      fee: '',
      sign: '',
    },
    {
      sl: 6,
      roll: '100012',
      name: 'مُسَمَّت سانية آزاد',
      father: 'محمد رفيق الدين',
      fee: '',
      sign: '',
    },
    {
      sl: 7,
      roll: '100014',
      name: 'سانجيدا آزاد سومي',
      father: 'هارون',
      fee: '',
      sign: '',
    },
    {
      sl: 8,
      roll: '100016',
      name: 'فارجانا آزاد',
      father: 'محمد شاكر',
      fee: '',
      sign: '',
    },
    {
      sl: 9,
      roll: '100018',
      name: 'تانيا آزاد',
      father: 'محمد طارق',
      fee: '',
      sign: '',
    },
    {
      sl: 10,
      roll: '100020',
      name: 'ميم آزاد سميّة',
      father: 'محمد هاشم',
      fee: '',
      sign: '',
    },
  ];
  // Arobic 4 number pdf

  return (
    <div
      dir="rtl"
      className="bg-white text-gray-800 font-['Noto Sans Arabic'] p-6 print:p-4 max-w-4xl mx-auto border border-gray-200 shadow-sm rounded-lg"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-black-2 w-full py-1 text-start px-2">
            <span className="font-bold text-md">كتاب</span>:
          </div>
          <div className="border border-black-2 w-full py-1 text-start px-2">
            <span className="font-bold text-md">كتاب</span>:
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <p className="text-md text-gray-600 font-bold">
            اسم الامتحان:_______________
          </p>
          <p className="text-md text-gray-600 font-bold">
            التاريخ:_______________
          </p>
        </div>
      </div>

      {/* Table - Only 4 columns */}
      <div className="overflow-hidden grid grid-cols-2 gap-3">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white border-2 text-center font-semibold">
              <th className="border border-gray-300 px-3 py-2 w-12 text-gray-700">
                الرقم
              </th>
              <th className="border border-gray-300 px-3 py-2 w-20 text-gray-700">
                رقم الهوية
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700">
                اسم الطالب
              </th>
              <th className="border border-gray-300 px-3 py-2 w-16 text-gray-700">
                الرسوم
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-start">
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 text-center">
                  {row.sl}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800 text-center">
                  {row.roll}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-start pr-4 text-gray-800">
                  {row.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-center">
                  {row.fee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-white border-2 text-center font-semibold">
              <th className="border border-gray-300 px-3 py-2 w-12 text-gray-700">
                الرقم
              </th>
              <th className="border border-gray-300 px-3 py-2 w-20 text-gray-700">
                رقم الهوية
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700">
                اسم الطالب
              </th>
              <th className="border border-gray-300 px-3 py-2 w-16 text-gray-700">
                الرسوم
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-start">
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 text-center">
                  {row.sl}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800 text-center">
                  {row.roll}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-start pr-4 text-gray-800">
                  {row.name}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-center">
                  {row.fee}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2 font-medium">التوقيع</p>
          <div className="border-t border-gray-400 w-40 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">مدير المدرسة</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        <p>حفظ السجلات الرقمية - 2025</p>
      </div>
    </div>
  );
};



export default ArobicNumberClassBasedTC
