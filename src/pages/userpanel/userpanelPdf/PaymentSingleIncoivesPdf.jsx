const PaymentSingleIncoivesPdf = ({ invoice }) => {
  if (!invoice) {
    return (
      <div className="text-center text-gray-500 mt-10">
        কোনো ইনভয়েস পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="w-full bg-white border rounded shadow p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-2 md:mb-0">ইনভয়েস</h2>
          <span className="text-sm text-gray-500">
            #{invoice.TransactionID}
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between mb-4">
          <span className="font-semibold text-sm">স্ট্যাটাস:</span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
            {invoice.PaymentStatus}
          </span>
        </div>

        <hr className="border-dashed border-t my-2" />

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex justify-center gap-3">
            <span>শিক্ষার্থী:</span>
            <span className="font-medium">{invoice.UserDetails?.UserName}</span>
          </div>
          <div className="flex justify-center gap-3">
            <span>মোবাইল:</span>
            <span className="font-medium">{invoice.UserDetails?.Mobile1}</span>
          </div>
          <div className="flex justify-center gap-3">
            <span>তারিখ:</span>
            <span>
              {new Date(invoice.CreatedAt).toLocaleDateString('bn-BD')} <br />
              <span className="text-xs text-gray-400">
                {new Date(invoice.CreatedAt).toLocaleTimeString('bn-BD')}
              </span>
            </span>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="border border-gray-300 px-3 py-2">ফি টাইপ</th>
                <th className="border border-gray-300 px-3 py-2">মাস</th>
                <th className="border border-gray-300 px-3 py-2">সেশন</th>
                <th className="border border-gray-300 px-3 py-2">পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.InvoiceDetails && invoice.InvoiceDetails.length > 0 ? (
                invoice.InvoiceDetails.map((item) => (
                  <tr key={item.GOPIDID} className="text-sm text-gray-700">
                    <td className="border border-gray-300 px-3 py-2">
                      {item.FeeType}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {item.MonthName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {item.SessionName}
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {item.Amount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border border-gray-300 px-3 py-2 text-center text-gray-400"
                    colSpan={4}
                  >
                    কোনো ফি পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mt-4 text-lg font-semibold">
          <span>মোট: ৳{invoice.TotalAmount}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSingleIncoivesPdf;
