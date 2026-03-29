import React from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { enToBnNumber } from "../../../helper/languageFormat";
import useTranslate from "../../../utils/Translate";

const OnlineStudentFeeReportPdf = ({ reportData = [] }) => {
  const translate = useTranslate()

  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();

  // ✅ Total Amount calculation
  const totalAmount = reportData?.reduce((total, item) => {
    const invoiceTotal = item?.InvoiceDetails?.reduce((sum, inv) => {
      return sum + (Number(inv.Amount) || 0);
    }, 0);

    return total + invoiceTotal;
  }, 0);

  return (
    <div className="bg-white text-gray-800 font-SolaimanLipi p-6 max-w-5xl mx-auto border shadow rounded-lg">

      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">{institutionInfo?.InstitutionName || "-"}</h1>
        <p>{institutionInfo?.Address || "-"}</p>
        <p>{enToBnNumber(institutionInfo?.ContactNumber) || "-"}</p>

        <h2 className="mt-3 text-lg font-semibold">
          অনলাইন ফি সংগ্রহ রিপোর্ট
        </h2>

        {/* <p className="text-sm">
          শিক্ষাবর্ষ: ২০২৬-২৭
        </p> */}
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="border px-2 py-1">SL</th>
            <th className="border px-2 py-1">নাম</th>
            <th className="border px-2 py-1">মোবাইল</th>
            <th className="border px-2 py-1">ক্লাস</th>
            <th className="border px-2 py-1">মাস</th>
            <th className="border px-2 py-1">ফি টাইপ</th>
            <th className="border px-2 py-1">পরিমাণ</th>
            <th className="border px-2 py-1">{translate("Invoice Type")}</th>
            <th className="border px-2 py-1">স্ট্যাটাস</th>
            <th className="border px-2 py-1">তারিখ</th>
          </tr>
        </thead>

        <tbody>
          {reportData?.map((item, index) => {
            const user = item.UserDetails;
            const className =
              item?.UserFeeOrder?.Admission?.Class?.ClassName;

            return (
              <React.Fragment key={item.GOPID}>
                {item.InvoiceDetails?.map((inv, i) => (
                  <tr key={inv.GOPIDID} className="text-center">
                    {i === 0 && (
                      <>
                        <td className="border px-2 py-1" rowSpan={item.InvoiceDetails.length}>
                          {index + 1}
                        </td>
                        <td className="border px-2 py-1 text-left" rowSpan={item.InvoiceDetails.length}>
                          {user?.UserName}
                        </td>
                        <td className="border px-2 py-1" rowSpan={item.InvoiceDetails.length}>
                          {user?.Mobile1}
                        </td>
                        <td className="border px-2 py-1" rowSpan={item.InvoiceDetails.length}>
                          {className}
                        </td>
                      </>
                    )}

                    <td className="border px-2 py-1">{inv.MonthName}</td>
                    <td className="border px-2 py-1">{inv.FeeType}</td>
                    <td className="border px-2 py-1">{inv.Amount}</td>

                    {i === 0 && (
                      <>

                        <td className="border px-2 py-1" rowSpan={item.InvoiceDetails.length}>
                          {item?.InvoiceDetails?.[0]?.["InvoiceType"]?.trim() || "-"}
                        </td>
                        <td className="border px-2 py-1 font-bold" rowSpan={item.InvoiceDetails.length}>
                          {item.PaymentStatus}
                        </td>
                        <td className="border px-2 py-1" rowSpan={item.InvoiceDetails.length}>
                          {new Date(item.CreatedAt).toLocaleDateString()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* ✅ Total Amount Section */}
      <div className="mt-4 text-right font-semibold">
        মোট পরিমাণ: {totalAmount} টাকা
      </div>

      {/* Footer */}
      <div className="mt-10 flex justify-between">
        <div className="text-center">
          <div className="border-t w-40 mx-auto"></div>
          <p className="text-xs mt-1">প্রস্তুতকারক</p>
        </div>

        <div className="text-center">
          <div className="border-t w-40 mx-auto"></div>
          <p className="text-xs mt-1">প্রধান শিক্ষক</p>
        </div>
      </div>

      {/* <div className="text-center text-xs mt-6 text-gray-400">
        ডিজিটাল সিস্টেম রিপোর্ট
      </div> */}
    </div>
  );
};

export default OnlineStudentFeeReportPdf;