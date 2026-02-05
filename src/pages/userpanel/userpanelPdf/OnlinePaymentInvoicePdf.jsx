import { useRef } from 'react';

const OnlinePaymentInvoicePdf = ({ invoice }) => {
  const invoiceRef = useRef();

  const normalizedInvoice = invoice.InvoiceDetails.reduce((acc, item) => {
    const monthKey = `${item.MonthName} ${item.SessionName}`;
    if (!acc[monthKey]) acc[monthKey] = {};
    if (!acc[monthKey][item.FeeType]) acc[monthKey][item.FeeType] = 0;
    acc[monthKey][item.FeeType] += item.Amount;
    return acc;
  }, {});

  return (
    <div
      className="w-full bg-white border p-5 px-10 relative"
      ref={invoiceRef}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">ইনভয়েস</h2>
        <p className="text-xs text-gray-500 mt-1">#{invoice.TransactionID}</p>
      </div>

      {/* Status */}
      <div className="flex justify-between text-sm mb-2">
        <span>স্ট্যাটাস</span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
          {invoice.PaymentStatus}
        </span>
      </div>

      <hr className="border-dashed border-t my-2" />

      {/* User Details */}
      <div className="mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span>শিক্ষার্থী</span>
          <span className="font-medium">{invoice.UserDetails?.UserName}</span>
        </div>
        <div className="flex justify-between">
          <span>মোবাইল</span>
          <span className="font-medium">{invoice.UserDetails?.Mobile1}</span>
        </div>
        <div className="flex justify-between">
          <span>তারিখ</span>
          <span>
            {new Date(invoice.CreatedAt).toLocaleDateString('bn-BD')} <br />
            <span className="text-xs text-gray-400">
              {new Date(invoice.CreatedAt).toLocaleTimeString('bn-BD')}
            </span>
          </span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="text-sm text-gray-700 mb-4">
        <span className="text-gray-500 block mb-2">ফি বিবরণ</span>
        <div className="space-y-3">
          {Object.entries(normalizedInvoice).map(([month, fees], idx) => (
            <div key={idx} className="border rounded-lg p-3 bg-gray-50">
              <div className="text-right font-semibold mb-2">{month}</div>
              <ul className="space-y-1">
                {Object.entries(fees).map(([feeType, amount], i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{feeType}</span>
                    <span>৳{amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center pt-4 border-t text-lg font-semibold mb-4">
        <span>মোট পরিমাণ</span>
        <span className="text-emerald-600">৳{invoice.TotalAmount}</span>
      </div>
    </div>
  );
};

export default OnlinePaymentInvoicePdf;
