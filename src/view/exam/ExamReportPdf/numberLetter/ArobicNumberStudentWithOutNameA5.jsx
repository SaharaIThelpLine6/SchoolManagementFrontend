const ArobicNumberStudentWithOutNameA5 = () => {
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
  // Arobic 3 number pdf

  return (
    <div
      dir="rtl"
      className="bg-white text-gray-800 font-['Noto Sans Arabic'] p-4 print:p-2 max-w-[148mm] mx-auto border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="text-center mb-3">
        <div className="border border-black-2 w-full py-1 text-start px-2">
          <span className="font-bold text-sm">كتاب</span>:
        </div>
        <p className="text-sm text-start py-2 text-gray-600 font-bold">
          اسم الامتحان:_______________
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="border border-black-2 w-full py-1 text-start px-2">
            <span className="font-bold text-sm">كتاب</span>:
          </div>
          <p className="text-sm text-start text-gray-600 font-bold">
            التاريخ:_______________
          </p>
        </div>
      </div>

      {/* Table - Only 3 columns */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-white border-2 text-center font-semibold">
              <th className="border border-gray-300 px-1 py-1 w-8 text-gray-700">
                الرقم
              </th>
              <th className="border border-gray-300 px-1 py-1 w-16 text-gray-700">
                رقم الهوية
              </th>

              <th className="border border-gray-300 px-1 py-1 w-12 text-gray-700">
                الرسوم
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
          <p className="text-xs text-gray-600 mb-1 font-medium">التوقيع</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">مدير المدرسة</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">التوقيع</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">مدير المدرسة</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1 font-medium">التوقيع</p>
          <div className="border-t border-gray-400 w-32 mx-auto"></div>
          <p className="text-xs text-gray-500 mt-1">مدير المدرسة</p>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 mt-4 pt-2 border-t border-gray-200">
        <p>حفظ السجلات الرقمية - 2025</p>
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

export default ArobicNumberStudentWithOutNameA5;
