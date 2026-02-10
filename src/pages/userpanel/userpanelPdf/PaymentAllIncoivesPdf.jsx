import { Buffer } from 'buffer';
import { useGetInstitutionInfoUserPanelQuery } from '../../../features/userPanel/userInfo/userInfoQuerySlice';
import { enToBnNumber } from '../../../helper/languageFormat';
import bnBijoy2Unicode from '../../../utils/conveter';

const PaymentAllIncoivesPdf = ({ invoices }) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        কোনো ইনভয়েস পাওয়া যায়নি
      </div>
    );
  }
  const { data, isLoading } = useGetInstitutionInfoUserPanelQuery();
  const institutionInfo = data?.data[0];

  console.log(institutionInfo, 'institutionInfo');
  // Group invoices by user
  const userInvoices = invoices.reduce((groups, invoice) => {
    const userId = invoice.UserID;
    if (!groups[userId]) {
      groups[userId] = {
        userDetails: invoice.UserDetails,
        invoices: [],
      };
    }
    groups[userId].invoices.push(invoice);
    return groups;
  }, {});

  // Calculate total amount
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.TotalAmount || 0),
    0
  );

  return (
    <div className="space-y-2 p-4 bg-white">
      {Object.values(userInvoices).map((group, groupIndex) => {
        const { userDetails, invoices: userInvoicesList } = group;

        return (
          <div
            key={groupIndex}
            className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-blue-50 p-4 border-b"
          >
            {/* Header Section */}
            <div className="flex items-center justify-between pb-2 border-blue-300">
              {/* Logo */}
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={
                    institutionInfo?.Logo?.data
                      ? `data:image/png;base64,${Buffer.from(institutionInfo.Logo.data).toString('base64')}`
                      : ''
                  }
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Institution Info */}
              <div className="flex-1 text-center px-2">
                <h1 className="text-2xl font-bold mb-1 text-blue-800">
                  {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
                </h1>
                <p className="text-xl mb-1 text-gray-700">
                  {bnBijoy2Unicode(institutionInfo?.Address)}
                </p>
                <p className="text-xl text-green-600">
                  ফোন: {enToBnNumber(institutionInfo?.ContactNumber)}
                </p>
              </div>

              {/* Receipt Title */}
              <div className="w-12 h-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs  px-2 py-1 font-semibold"></div>
                </div>
              </div>
            </div>
            {/* User Details - Show only once at top */}
            <div className="bg-blue-50 p-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    শিক্ষার্থীর তথ্য
                  </h3>
                  <div className="text-gray-700 mt-1">
                    <p>
                      <span className="font-medium">নাম:</span>{' '}
                      {userDetails?.UserName || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">মোবাইল:</span>{' '}
                      {userDetails?.Mobile1 || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">ইউজার কোড:</span>{' '}
                      {userDetails?.UserCode || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">সারাংশ</h3>
                  <div className="text-gray-700 mt-1">
                    <p>
                      <span className="font-medium">মোট ইনভয়েস:</span>{' '}
                      {userInvoicesList.length}
                    </p>
                    {/* <p>
                      <span className="font-medium">ইনভয়েস তারিখ:</span>
                      {new Date(
                        userInvoicesList[0]?.CreatedAt
                      ).toLocaleDateString('bn-BD')}{' '}
                      -
                      {new Date(
                        userInvoicesList[userInvoicesList.length - 1]?.CreatedAt
                      ).toLocaleDateString('bn-BD')}
                    </p> */}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    টোটাল পরিমাণ (৳)
                  </h3>
                  <div className="text-gray-700 mt-1">
                    <p className="text-lg font-bold text-blue-600">
                      {userInvoicesList.reduce(
                        (sum, inv) => sum + (inv.TotalAmount || 0),
                        0
                      )}{' '}
                      ৳
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices for this user */}
            <div className="space-y-4 p-4">
              {userInvoicesList.map((invoice, invoiceIndex) => {
                const hasDetails =
                  invoice.InvoiceDetails && invoice.InvoiceDetails.length > 0;

                return (
                  <div
                    key={invoice.TransactionID}
                    className="border border-gray-200 rounded-md overflow-hidden"
                  >
                    {/* Invoice Header */}
                    <div className="bg-gray-100 p-3 border-b">
                      <div className="flex flex-wrap justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-700">
                            ট্রানজেকশন ID:
                          </span>
                          <span className="ml-2 text-gray-800">
                            {invoice.TransactionID}
                          </span>
                        </div>
                        <div className="flex space-x-4">
                          <div>
                            <span className="font-medium text-gray-700">
                              স্ট্যাটাস:
                            </span>
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs ${invoice.PaymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                              {invoice.PaymentStatus}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              তারিখ:
                            </span>
                            <span className="ml-2 text-gray-800">
                              {new Date(invoice.CreatedAt).toLocaleDateString(
                                'bn-BD'
                              )}
                            </span>
                          </div>
                          {/* <div>
                            <span className="font-medium text-gray-700">
                              মোট:
                            </span>
                            <span className="ml-2 font-bold text-gray-800">
                              {invoice.TotalAmount} ৳
                            </span>
                          </div> */}
                        </div>
                      </div>
                    </div>

                    {/* Invoice Details Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-50 text-gray-700 text-sm">
                          <tr>
                            <th className="border px-3 py-2">ক্রম</th>
                            <th className="border px-3 py-2">ফি টাইপ</th>
                            <th className="border px-3 py-2">মাস</th>
                            <th className="border px-3 py-2">সেশন</th>
                            <th className="border px-3 py-2">পরিমাণ (৳)</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                          {hasDetails ? (
                            invoice.InvoiceDetails.map((item, idx) => (
                              <tr
                                key={idx}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="border px-3 py-2 text-center">
                                  {idx + 1}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {item.FeeType}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {item.MonthName}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {item.SessionName}
                                </td>
                                <td className="border px-3 py-2 text-center">
                                  {item.Amount}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                className="border px-3 py-2 text-center text-gray-400"
                                colSpan={5}
                              >
                                কোনো ফি ডিটেইলস পাওয়া যায়নি
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 font-semibold">
                            <td
                              className="border px-3 py-2 text-right"
                              colSpan={4}
                            >
                              ইনভয়েস মোট:
                            </td>
                            <td className="border px-3 py-2 text-center">
                              {invoice.TotalAmount} ৳
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentAllIncoivesPdf;
