import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetStudentFeeUpdateGetDataByUFOIDQuery } from '../../../features/feeCollection/feeCollectionSlice';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import { enToBnNumber } from '../../../helper/languageFormat';
import bnBijoy2Unicode from '../../../utils/conveter';
import toBengaliWords from '../../../utils/numberToBanglaWords';

const StudentFeeReportPdf = ({ result }) => {
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);


  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);

  // হিসাব নির্ণয়
  const payable = (
    Number(result?.CurrentInvoice || 0) - Number(result?.deduction || 0)
  ).toFixed(2);
  const due = (
    Number(result?.CurrentInvoice || 0) - Number(result?.CurrentPaid || 0)
  ).toFixed(2);
  const totalPaid =
    Number(result?.CurrentPaid || 0) + Number(result?.PreDuePaid || 0);

  return (
    <div
      className="relative w-full bg-white"
      style={{
        width: '210mm',
        minHeight: '270mm',
        margin: '0 auto',
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        fontSize: '12px',
        lineHeight: '1.4',
        // padding: '5mm',
      }}
    >
      <div className="bg-white text-black font-SolaimanLipi">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-gray-300">
          {/* Logo */}
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Institution Info */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold mb-1">
              {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
            </h1>
            <p className="text-xs mb-1">
              {bnBijoy2Unicode(institutionInfo?.Address)}
            </p>
            <p className="text-xs">
              ফোন: {enToBnNumber(institutionInfo?.ContactNumber)}
            </p>
          </div>

          {/* Receipt Title */}
          <div className="w-16 h-16 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs bg-gray-100 px-2 py-1 rounded border">
                রশিদ
              </div>
            </div>
          </div>
        </div>

        {/* Main Receipt Content */}
        <div className="mt-4 border border-gray-800 rounded-sm">
          {/* Receipt Header */}
          <div className="text-center bg-gray-100 py-2 border-b border-gray-800">
            <h2 className="font-bold text-sm">ফি গ্রহণ রশিদ</h2>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4 p-3 text-xs border-b border-gray-300">
            <div className="space-y-1">
              <div className="flex">
                <span className="font-bold w-20">নাম</span>
                <span className="px-3">:</span>
                <span>{result?.StudentName}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">পিতা</span>
                <span className="px-3">:</span>
                <span>{result?.FatherName}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">শ্রেণি/ক্লাস</span>
                <span className="px-3">:</span>
                <span>{result?.ClassName}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="font-bold w-20">রশিদ নং</span>
                <span className="px-3">:</span>
                <span>{result?.UFOID}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">তারিখ</span>
                <span className="px-3">:</span>
                <span>{result?.CreateAt}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-20">দাখেলা</span>
                <span className="px-3">:</span>
                <span>{result?.UserCode}</span>
              </div>
            </div>
          </div>

          {/* Fee Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-600 p-1 w-8">ক্রম</th>
                  <th className="border border-gray-600 p-1">ফি নাম</th>
                  <th className="border border-gray-600 p-1">বিবরণ</th>
                  <th className="border border-gray-600 p-1 w-20">নির্ধারিত</th>
                  <th className="border border-gray-600 p-1 w-20">কর্তন</th>
                  <th className="border border-gray-600 p-1 w-20">পরিশোধ</th>
                  <th className="border border-gray-600 p-1 w-20">বকেয়া</th>
                </tr>
              </thead>
              <tbody>
                {result?.fees?.map((item, index) => (
                  <tr key={item.UFODID || index}>
                    <td className="border border-gray-600 p-1 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-600 p-1">
                      {bnBijoy2Unicode(item.SlName)}
                    </td>
                    <td className="border border-gray-600 p-1">
                      {item.Particulars}
                    </td>
                    <td className="border border-gray-600 p-1 text-right">
                      {Number(item.Fee).toLocaleString('bn-BD', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-600 p-1 text-right">
                      {Number(item.Less).toLocaleString('bn-BD', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-600 p-1 text-right">
                      {Number(item.PayAmount).toLocaleString('bn-BD', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="border border-gray-600 p-1 text-right">
                      {Number(item.NetPayable).toLocaleString('bn-BD', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-2 border-t border-gray-800 text-xs">
            <div className="border-r border-gray-800 p-2 flex flex-col justify-center items-start gap-3">
              <div className="">
                <p className="font-bold mb-1">মন্তব্য:</p>
                <p className="text-xs">{bnBijoy2Unicode(result?.Remark)}</p>
              </div>
              <div className="">
                <p className="font-bold mb-1">কথায়:</p>
                <p className="text-xs">
                  {toBengaliWords(Number(result?.CurrentPaid || 0))}
                </p>
              </div>
            </div>

            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>সর্বমোট:</span>
                <span className="font-bold">{result?.CurrentInvoice}</span>
              </div>
              <div className="flex justify-between">
                <span>(-) কর্তন:</span>
                <span className="font-bold">{result?.deduction}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-400 pt-1">
                <span>পূর্বের পাওনা:</span>
                <span className="font-bold">{result?.PreviousDue}</span>
              </div>
              <div className="flex justify-between">
                <span>বর্তমান জমা:</span>
                <span className="font-bold">{result?.CurrentPaid}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-400 pt-1">
                <span>বকেয়া:</span>
                <span className="font-bold">{result?.Due}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Footer Section - Fixed at bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-6 text-[10px] text-gray-700">
          <div className="flex justify-between items-start w-full">
            {/* 🔸 Left side - Developer info */}
            <div className="text-left mt-3">
              <p className="leading-tight">
                Software Develop by: saharait ০১৮২৩০০০৫৫৫
              </p>
            </div>

            {/* 🔸 Right side - Signature line */}
            <div className="text-center">
              <div className="h-6 border-b border-gray-500 mb-1 w-32"></div>
              <p>গ্রহিতার স্বাক্ষর</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeReportPdf;
