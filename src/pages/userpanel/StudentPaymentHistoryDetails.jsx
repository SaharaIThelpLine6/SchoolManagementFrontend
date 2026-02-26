import { useParams } from 'react-router-dom';
import SvgIcon from '../../components/icons/SvgIcon';
import { useGetStudentPaymentDetailsQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';

const StudentPaymentHistoryDetails = () => {
    const { id } = useParams();
    const { data, isLoading } = useGetStudentPaymentDetailsQuery(id);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-700 text-lg">কোন তথ্য পাওয়া যায়নি</p>
            </div>
        );
    }

    const studentInfo = data[0];
    const totalAmount = data.reduce((sum, item) => sum + item.Fee, 0);

    return (
      <div className="min-h-screen bg-gray-50 py-5 md:p-6">
        {/* Print Button */}
        {/* <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            <SvgIcon name="FaEye" /> প্রিন্ট করুন
          </button>
        </div> */}

        {/* Main Invoice Card */}
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <SvgIcon name="FaSchool" size={24} />
                  <h1 className="text-2xl font-bold">ফি পরিশোধের বিবরণ</h1>
                </div>
                {/* <p className="text-blue-100">প্রদর্শিত তথ্য সঠিক এবং নির্ভুল</p> */}
              </div>
              <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2">
                  <SvgIcon name="FaFileInvoice" size={20} />
                  <span className="text-lg font-semibold">
                    চালান নং: #{studentInfo.TransactionID}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <SvgIcon name="FaCalendar" />
                  <span>তারিখ: {studentInfo.CreateAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Info */}
          <div className="border-b border-gray-200 p-6">
            <div className="text-center">
              {/* <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {studentInfo.InstitutionName}
              </h2>
              <p className="text-gray-600 mb-1">{studentInfo.Address}</p>
              <p className="text-gray-600">
                যোগাযোগ: {studentInfo.ContactNumber}
              </p> */}
              <div className="flex flex-wrap justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <SvgIcon name="FaUser" className="text-blue-600" /> প্রধান
                  মুহতামিম: {studentInfo.PrincipalName}
                </span>
                <span className="flex items-center gap-1">
                  <SvgIcon name="FaMoneyBill" className="text-green-600" />
                  হিসাবরক্ষক: {studentInfo.AccountantName}
                </span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-blue-50">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <SvgIcon name="FaUser" />
                <span className="font-semibold">ছাত্রের নাম</span>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {studentInfo.StudentName}
              </p>
              <p className="text-sm text-gray-600">
                পিতার নাম: {studentInfo.FatherName || 'নেই'}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="text-blue-700 font-semibold mb-1">ছাত্র আইডি</div>
              <p className="text-lg font-bold text-gray-800">
                {studentInfo.UserCode}
              </p>
              <p className="text-sm text-gray-600">
                ভর্তি নং: {studentInfo.AdmissionID}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="text-blue-700 font-semibold mb-1">
                শ্রেণি ও সেশন
              </div>
              <p className="text-lg font-bold text-gray-800">
                {studentInfo.ClassName}
              </p>
              <p className="text-sm text-gray-600">
                সেশন: {studentInfo.SessionName}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
              <div className="text-blue-700 font-semibold mb-1">সাব-ক্লাস</div>
              <p className="text-lg font-bold text-gray-800">
                {studentInfo.SubClass}
              </p>
              <p className="text-sm text-gray-600">
                সিরিয়াল: {studentInfo.SubClassSerial}
              </p>
            </div>
          </div>

          {/* Payment Details Table */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <SvgIcon name="FaMoneyBill" className="text-green-600" /> ফি
                পরিশোধের বিবরণ
              </h3>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                মোট পরিশোধ: {totalAmount.toLocaleString()} টাকা
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ক্রমিক
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ফির ধরন
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ফির নাম
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      মাস
                    </th>
                    <th className="px6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      পরিশোধিত ফি
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      পূর্বের জমা
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      নিট পরিশোধ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item, index) => (
                    <tr
                      key={item.UFODID}
                      className={`hover:bg-gray-50 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            item.SFGNID === 1
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.SFGName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {item.SlName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.Particulars}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.MonthName || 'এককালিন'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-700">
                          {item.Fee.toLocaleString()} টাকা
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-700">
                          {item.PreviousDeposite.toLocaleString()} টাকা
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {item.NetPayable.toLocaleString()} টাকা
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  চালান সংক্ষেপ
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">মোট চালান</span>
                    <span className="font-bold">
                      {studentInfo.CurrentInvoice.toLocaleString()} টাকা
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ছাড়</span>
                    <span className="text-red-600">
                      {studentInfo.InvoiceDiscount.toLocaleString()} টাকা
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">পূর্বের বকেয়া</span>
                    <span className="text-orange-600">
                      {studentInfo.PreviousDue.toLocaleString()} টাকা
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-3">
                    <span className="text-gray-800 font-bold">
                      বর্তমান পরিশোধ
                    </span>
                    <span className="text-green-700 font-bold">
                      {studentInfo.CurrentPaid.toLocaleString()} টাকা
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-3">
                    <span className="text-gray-800 font-bold">
                      অবশিষ্ট বকেয়া
                    </span>
                    <span
                      className={`font-bold ${
                        studentInfo.Due > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {studentInfo.Due.toLocaleString()} টাকা
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4">
                  পরিশোধিত অর্থের বিবরণ
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">মোট প্রদত্ত অর্থ</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {totalAmount.toLocaleString()} টাকা
                    </span>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <div className="text-sm text-gray-600 mb-2">
                      অর্থের বর্ণনা
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {studentInfo.AmountInWord}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <SvgIcon name="FaUser" className="text-gray-400" />
                      <span>অ্যাকাউন্ট পরিচালক: {studentInfo.UserName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {studentInfo.Remark && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">মন্তব্য/নোট</h4>
                <p className="text-gray-700">{studentInfo.Remark}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-sm text-gray-500">
                  এই রসিদটি কম্পিউটার দ্বারা স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে
                </div>
                <div className="mt-4 md:mt-0 text-sm text-gray-600">
                  জেনারেটের তারিখ: {new Date().toLocaleDateString('bn-BD')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area,
            .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            .bg-gradient-to-r {
              background: #2563eb !important;
            }
          }
        `}</style>
      </div>
    );
};

export default StudentPaymentHistoryDetails;
