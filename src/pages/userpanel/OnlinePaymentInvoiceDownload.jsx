import { useSearchParams } from 'react-router-dom';
import { useGetInvoiceByTranQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import OnlinePaymentInvoicePdf from './userpanelPdf/OnlinePaymentInvoicePdf';
import { useSelector } from 'react-redux';

const SkeletonLine = ({ width = 'w-full' }) => (
  <div className={`h-3 bg-gray-200 rounded ${width} animate-pulse`} />
);

const OnlinePaymentInvoiceDownload = () => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get('tran_id');

  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  console.log(schoolData, "schoolData")
  const { data, isLoading, isError } = useGetInvoiceByTranQuery(tranId);


  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto m-5 bg-white rounded-2xl border p-6 space-y-5">
        <SkeletonLine width="w-24 mx-auto" />
        <SkeletonLine width="w-40 mx-auto" />
        <SkeletonLine />
        <SkeletonLine />
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </div>
        <SkeletonLine />
        <SkeletonLine />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="max-w-sm mx-auto m-5 text-center text-red-500">
        ইনভয়েস লোড করা যায়নি
      </div>
    );
  }

  // ✅ Move this above normalizedInvoice
  const invoice = data.data;
  console.log(invoice, 'data');

  const normalizedInvoice = invoice.InvoiceDetails.reduce((acc, item) => {
    const monthKey = `${item.MonthName} ${item.SessionName}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }

    if (!acc[monthKey][item.FeeType]) {
      acc[monthKey][item.FeeType] = 0;
    }

    acc[monthKey][item.FeeType] += item.Amount;

    return acc;
  }, {});

  const handlePdf = () => {
    const originalTitle = document.title;
    document.title = `মাসিক-ফি-${schoolData?.InstitutionName}`;

    window.print();

    document.title = originalTitle; // আগের title ফিরিয়ে দাও
  };

  return (
    <>
      <div className="h-full mb-20 max-w-sm mx-auto m-5 bg-white border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] print:hidden">
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-semibold">ইনভয়েস</h2>
            <p className="text-2xl font-bold text-gray-500 mt-1">#{invoice.UFOID}</p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">স্ট্যাটাস</span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs">
              {invoice.PaymentStatus}
            </span>
          </div>

          <div className="border-t border-dashed" />

          {/* User Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">শিক্ষার্থী</span>
              <span className="font-medium">
                {invoice.UserDetails?.UserName}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">মোবাইল</span>
              <span className="font-medium">
                {invoice.UserDetails?.Mobile1}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">তারিখ</span>
              <span className="text-right text-sm">
                {new Date(invoice.CreatedAt).toLocaleDateString('bn-BD')} <br />
                <span className="text-xs text-gray-400">
                  {new Date(invoice.CreatedAt).toLocaleTimeString('bn-BD')}
                </span>
              </span>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="text-sm text-gray-700">
            <span className="text-gray-500 block mb-2">ফি বিবরণ</span>

            <div className="space-y-4">
              {Object.entries(normalizedInvoice).map(([month, fees], idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                  {/* Month Header */}
                  <div className="text-right font-semibold text-gray-800 mb-2">
                    {month}
                  </div>

                  {/* Fee list */}
                  <ul className="space-y-1">
                    {Object.entries(fees).map(([feeType, amount], i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{feeType}</span>
                        <span className="font-medium">৳{amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t text-lg font-semibold">
            <span>মোট পরিমাণ</span>
            <span className="text-emerald-600">৳{invoice.TotalAmount}</span>
          </div>

          {/* Download */}
          <button
            onClick={handlePdf}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
          >
            Download PDF Invoice
          </button>
        </div>
      </div>
      <div className="hidden print:block">
        <OnlinePaymentInvoicePdf invoice={invoice} />
      </div>
    </>
  );
};

export default OnlinePaymentInvoiceDownload;
