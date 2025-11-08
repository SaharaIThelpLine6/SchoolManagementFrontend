

import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import { enToBnNumber } from '../../../helper/languageFormat';
import bnBijoy2Unicode from '../../../utils/conveter';
import toBengaliWords from '../../../utils/numberToBanglaWords';

const StudentFeeReportPdf = ({ result }) => {
  console.log(result, 'result');
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
    // Color Code
    // <div
    //   className="relative w-full bg-white"
    //   style={{
    //     width: '210mm',
    //     minHeight: '270mm',
    //     margin: '0 auto',
    //     fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
    //     fontSize: '12px',
    //     lineHeight: '1.4',
    //     // padding: '5mm',
    //   }}
    // >
    //   <div className="bg-white text-black font-SolaimanLipi">
    //     {/* Header Section */}
    //     <div
    //       className="flex items-center justify-between pb-3 border-b-2 border-blue-300"
    //       style={{ borderColor: '#3b82f6' }}
    //     >
    //       {/* Logo */}
    //       <div className="w-16 h-16 flex items-center justify-center">
    //         <img
    //           src={logo}
    //           alt="Logo"
    //           className="w-full h-full object-contain"
    //         />
    //       </div>

    //       {/* Institution Info */}
    //       <div className="flex-1 text-center">
    //         <h1 className="text-lg font-bold mb-1 text-blue-800">
    //           {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
    //         </h1>
    //         <p className="text-xs mb-1 text-gray-700">
    //           {bnBijoy2Unicode(institutionInfo?.Address)}
    //         </p>
    //         <p className="text-xs text-green-600">
    //           ফোন: {enToBnNumber(institutionInfo?.ContactNumber)}
    //         </p>
    //       </div>

    //       {/* Receipt Title */}
    //       <div className="w-16 h-16 flex items-center justify-center">
    //         <div className="text-center">
    //           <div className="text-xs bg-blue-100 px-2 py-1 rounded border border-blue-300 text-blue-700 font-semibold">
    //             রশিদ
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Main Receipt Content */}
    //     <div
    //       className="mt-4 border-2 border-indigo-300 rounded-lg shadow-md"
    //       style={{ borderColor: '#4f46e5' }}
    //     >
    //       {/* Receipt Header */}
    //       <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 py-3 border-b-2 border-indigo-200 text-indigo-800 font-bold">
    //         <h2 className="text-sm">ফি গ্রহণ রশিদ</h2>
    //       </div>

    //       {/* Student Information */}
    //       <div className="grid grid-cols-2 gap-4 p-3 text-xs border-b border-green-200 bg-green-50/50">
    //         <div className="space-y-1">
    //           <div className="flex">
    //             <span className="font-bold w-20 text-purple-700">নাম</span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800">{result?.StudentName}</span>
    //           </div>
    //           <div className="flex">
    //             <span className="font-bold w-20 text-purple-700">পিতা</span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800">{result?.FatherName}</span>
    //           </div>
    //           <div className="flex">
    //             <span className="font-bold w-20 text-purple-700">
    //               শ্রেণি/ক্লাস
    //             </span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800">{result?.ClassName}</span>
    //           </div>
    //         </div>
    //         <div className="space-y-1">
    //           <div className="flex">
    //             <span className="font-bold w-20 text-orange-600">রশিদ নং</span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800 font-semibold">
    //               {result?.UFOID}
    //             </span>
    //           </div>
    //           <div className="flex">
    //             <span className="font-bold w-20 text-orange-600">তারিখ</span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800">{result?.CreateAt}</span>
    //           </div>
    //           <div className="flex">
    //             <span className="font-bold w-20 text-orange-600">দাখেলা</span>
    //             <span className="px-3 text-gray-500">:</span>
    //             <span className="text-gray-800">{result?.UserCode}</span>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Fee Details Table */}
    //       <div className="overflow-x-auto">
    //         <table className="w-full border-collapse text-xs">
    //           <thead>
    //             <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
    //               <th className="border-2 border-indigo-300 p-1 w-8 text-indigo-800 font-bold">
    //                 ক্রম
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 text-indigo-800 font-bold">
    //                 ফি নাম
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 text-indigo-800 font-bold">
    //                 বিবরণ
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 w-20 text-indigo-800 font-bold">
    //                 নির্ধারিত
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 w-20 text-indigo-800 font-bold">
    //                 কর্তন
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 w-20 text-indigo-800 font-bold">
    //                 পরিশোধ
    //               </th>
    //               <th className="border-2 border-indigo-300 p-1 w-20 text-indigo-800 font-bold">
    //                 বকেয়া
    //               </th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {result?.fees?.map((item, index) => (
    //               <tr
    //                 key={item.UFODID || index}
    //                 className={
    //                   index % 2 === 0 ? 'bg-blue-50/30' : 'bg-purple-50/20'
    //                 }
    //               >
    //                 <td className="border border-indigo-300 p-1 text-center text-gray-700 font-medium">
    //                   {index + 1}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-gray-800">
    //                   {bnBijoy2Unicode(item.SlName)}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-gray-700">
    //                   {item.Particulars}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-right text-green-600 font-semibold">
    //                   {Number(item.Fee).toLocaleString('bn-BD', {
    //                     minimumFractionDigits: 2,
    //                   })}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-right text-orange-600">
    //                   {Number(item.Less).toLocaleString('bn-BD', {
    //                     minimumFractionDigits: 2,
    //                   })}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-right text-blue-600 font-semibold">
    //                   {Number(item.PayAmount).toLocaleString('bn-BD', {
    //                     minimumFractionDigits: 2,
    //                   })}
    //                 </td>
    //                 <td className="border border-indigo-300 p-1 text-right text-red-600">
    //                   {Number(item.NetPayable).toLocaleString('bn-BD', {
    //                     minimumFractionDigits: 2,
    //                   })}
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>

    //       {/* Summary Section */}
    //       <div className="grid grid-cols-2 border-t-2 border-green-300 bg-gradient-to-b from-green-50 to-white">
    //         <div className="border-r-2 border-green-300 p-2 flex flex-col justify-center items-start gap-3">
    //           <div className="">
    //             <p className="font-bold mb-1 text-gray-800">মন্তব্য:</p>
    //             <p className="text-xs text-gray-700 bg-yellow-50 p-1 rounded-sm border border-yellow-200">
    //               {bnBijoy2Unicode(result?.Remark)}
    //             </p>
    //           </div>
    //           <div className="">
    //             <p className="font-bold mb-1 text-gray-800">কথায়:</p>
    //             <p className="text-xs text-indigo-700 bg-indigo-50 p-1 rounded-sm border border-indigo-200">
    //               {toBengaliWords(Number(result?.CurrentPaid || 0))}
    //             </p>
    //           </div>
    //         </div>

    //         <div className="p-2 space-y-1 text-sm">
    //           <div className="flex justify-between bg-blue-50 p-1 rounded-sm border border-blue-200">
    //             <span className="text-gray-700">সর্বমোট:</span>
    //             <span className="font-bold text-green-700">
    //               {result?.CurrentInvoice}
    //             </span>
    //           </div>
    //           <div className="flex justify-between bg-orange-50 p-1 rounded-sm border border-orange-200">
    //             <span className="text-gray-700">(-) কর্তন:</span>
    //             <span className="font-bold text-orange-600">
    //               {result?.deduction}
    //             </span>
    //           </div>
    //           <div className="flex justify-between border-t border-dashed border-green-400 pt-1 bg-green-50 p-1 rounded-sm">
    //             <span className="text-gray-700">পূর্বের পাওনা:</span>
    //             <span className="font-bold text-red-600">
    //               {result?.PreviousDue}
    //             </span>
    //           </div>
    //           <div className="flex justify-between bg-blue-50 p-1 rounded-sm border border-blue-200">
    //             <span className="text-gray-700">বর্তমান জমা:</span>
    //             <span className="font-bold text-blue-600">
    //               {result?.CurrentPaid}
    //             </span>
    //           </div>
    //           <div className="flex justify-between border-t border-dashed border-red-400 pt-1 bg-red-50 p-1 rounded-sm">
    //             <span className="text-gray-700">বকেয়া:</span>
    //             <span className="font-bold text-red-600">{result?.Due}</span>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* 🔹 Footer Section - Fixed at bottom */}
    //     <div className="absolute bottom-4 left-0 right-0 px-6 text-[10px] text-gray-700">
    //       <div className="flex justify-between items-end w-full bg-gradient-to-r from-gray-50 to-blue-50 p-2 rounded-lg">
    //         {/* 🔸 Left side - Developer info */}
    //         <div className="text-left">
    //           <p className="leading-tight mt-6 text-gray-600">
    //             Software Develop by: saharait ০১৮২৩০০০৫৫৫
    //           </p>
    //         </div>

    //         {/* 🔸 Right side - Signature line */}
    //         <div className="text-center">
    //           <div
    //             className="h-6 border-b border-green-500 mb-1 w-32"
    //             style={{ borderColor: '#16a34a' }}
    //           ></div>
    //           <p className="text-green-700 font-semibold">গ্রহিতার স্বাক্ষর</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>



    // old code
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
          <div className="flex justify-between items-end w-full">
            {/* 🔸 Left side - Developer info */}
            <div className="text-left">
              <p className="leading-tight mt-6">
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


    // kajer sapano
    // <div
    //     className="relative w-full bg-white"
    //     style={{
    //       width: '210mm',
    //       minHeight: '270mm',
    //       margin: '0 auto',
    //       fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
    //       fontSize: '12px',
    //       lineHeight: '1.4',
    //     }}
    //   >
    //     <div className="bg-white text-black font-SolaimanLipi">
    //       {/* Header Section */}
    //       <div className="flex items-center justify-between pb-3 border-b-2 border-black">
    //         {/* Logo */}
    //         <div className="w-16 h-16 flex items-center justify-center border border-gray-400 rounded">
    //           <img
    //             src={logo}
    //             alt="Logo"
    //             className="w-full h-full object-contain"
    //           />
    //         </div>

    //         {/* Institution Info */}
    //         <div className="flex-1 text-center">
    //           <h1 className="text-lg font-bold mb-1">
    //             {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
    //           </h1>
    //           <p className="text-xs mb-1">
    //             {bnBijoy2Unicode(institutionInfo?.Address)}
    //           </p>
    //           <p className="text-xs">
    //             ফোন: {enToBnNumber(institutionInfo?.ContactNumber)}
    //           </p>
    //         </div>

    //         {/* Receipt Title */}
    //         <div className="w-16 h-16 flex items-center justify-center">
    //           <div className="text-center">
    //             <div className="text-xs border-2 border-black px-3 py-2 rounded font-bold">
    //               রশিদ
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Main Receipt Content */}
    //       <div className="mt-4 border-2 border-black rounded">
    //         {/* Receipt Header */}
    //         <div className="text-center border-b-2 border-black py-2 bg-gray-100">
    //           <h2 className="font-bold text-sm">ফি গ্রহণ রশিদ</h2>
    //         </div>

    //         {/* Student Information */}
    //         <div className="grid grid-cols-2 gap-4 p-3 text-xs border-b border-gray-400">
    //           <div className="space-y-2">
    //             <div className="flex">
    //               <span className="font-bold w-20">নাম</span>
    //               <span className="px-2">:</span>
    //               <span className="font-semibold">{result?.StudentName}</span>
    //             </div>
    //             <div className="flex">
    //               <span className="font-bold w-20">পিতা</span>
    //               <span className="px-2">:</span>
    //               <span>{result?.FatherName}</span>
    //             </div>
    //             <div className="flex">
    //               <span className="font-bold w-20">শ্রেণি/ক্লাস</span>
    //               <span className="px-2">:</span>
    //               <span className="font-semibold">{result?.ClassName}</span>
    //             </div>
    //           </div>
    //           <div className="space-y-2">
    //             <div className="flex">
    //               <span className="font-bold w-20">রশিদ নং</span>
    //               <span className="px-2">:</span>
    //               <span className="font-mono font-bold">{result?.UFOID}</span>
    //             </div>
    //             <div className="flex">
    //               <span className="font-bold w-20">তারিখ</span>
    //               <span className="px-2">:</span>
    //               <span>{result?.CreateAt}</span>
    //             </div>
    //             <div className="flex">
    //               <span className="font-bold w-20">দাখেলা</span>
    //               <span className="px-2">:</span>
    //               <span className="font-mono">{result?.UserCode}</span>
    //             </div>
    //           </div>
    //         </div>

    //         {/* Fee Details Table */}
    //         <div className="overflow-x-auto">
    //           <table className="w-full border-collapse text-xs">
    //             <thead>
    //               <tr className="bg-gray-200">
    //                 <th className="border border-black p-1 w-8 text-center font-bold">
    //                   ক্রম
    //                 </th>
    //                 <th className="border border-black p-1 text-center font-bold">
    //                   ফি নাম
    //                 </th>
    //                 <th className="border border-black p-1 text-center font-bold">
    //                   বিবরণ
    //                 </th>
    //                 <th className="border border-black p-1 w-20 text-center font-bold">
    //                   নির্ধারিত
    //                 </th>
    //                 <th className="border border-black p-1 w-20 text-center font-bold">
    //                   কর্তন
    //                 </th>
    //                 <th className="border border-black p-1 w-20 text-center font-bold">
    //                   পরিশোধ
    //                 </th>
    //                 <th className="border border-black p-1 w-20 text-center font-bold">
    //                   বকেয়া
    //                 </th>
    //               </tr>
    //             </thead>
    //             <tbody>
    //               {result?.fees?.map((item, index) => {
    //                 const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
    //                 return (
    //                   <tr key={item.UFODID || index} className={rowBg}>
    //                     <td className="border border-black p-1 text-center font-semibold">
    //                       {index + 1}
    //                     </td>
    //                     <td className="border border-black p-1">
    //                       {bnBijoy2Unicode(item.SlName)}
    //                     </td>
    //                     <td className="border border-black p-1">
    //                       {item.Particulars}
    //                     </td>
    //                     <td className="border border-black p-1 text-right font-semibold">
    //                       {Number(item.Fee).toLocaleString('bn-BD', {
    //                         minimumFractionDigits: 2,
    //                       })}
    //                     </td>
    //                     <td className="border border-black p-1 text-right font-semibold">
    //                       {Number(item.Less).toLocaleString('bn-BD', {
    //                         minimumFractionDigits: 2,
    //                       })}
    //                     </td>
    //                     <td className="border border-black p-1 text-right font-semibold">
    //                       {Number(item.PayAmount).toLocaleString('bn-BD', {
    //                         minimumFractionDigits: 2,
    //                       })}
    //                     </td>
    //                     <td className="border border-black p-1 text-right font-semibold">
    //                       {Number(item.NetPayable).toLocaleString('bn-BD', {
    //                         minimumFractionDigits: 2,
    //                       })}
    //                     </td>
    //                   </tr>
    //                 );
    //               })}
    //             </tbody>
    //           </table>
    //         </div>

    //         {/* Summary Section */}
    //         <div className="grid grid-cols-2 border-t border-black text-xs">
    //           <div className="border-r border-black p-3 flex flex-col justify-center items-start gap-4">
    //             <div className="w-full">
    //               <p className="font-bold mb-1">মন্তব্য:</p>
    //               <div className="border border-gray-400 p-2 min-h-12 rounded">
    //                 <p>{bnBijoy2Unicode(result?.Remark)}</p>
    //               </div>
    //             </div>
    //             <div className="w-full">
    //               <p className="font-bold mb-1">কথায়:</p>
    //               <div className="border border-gray-400 p-2 rounded bg-gray-50">
    //                 <p className="font-semibold">
    //                   {toBengaliWords(Number(result?.CurrentPaid || 0))}
    //                 </p>
    //               </div>
    //             </div>
    //           </div>

    //           <div className="p-3 space-y-2">
    //             <div className="flex justify-between items-center border-b border-gray-300 pb-1">
    //               <span className="font-semibold">সর্বমোট:</span>
    //               <span className="font-bold text-lg">
    //                 {result?.CurrentInvoice}
    //               </span>
    //             </div>
    //             <div className="flex justify-between items-center border-b border-gray-300 pb-1">
    //               <span className="font-semibold">(-) কর্তন:</span>
    //               <span className="font-bold text-lg">{result?.deduction}</span>
    //             </div>
    //             <div className="flex justify-between items-center border-b border-dashed border-gray-400 pb-1 pt-2">
    //               <span className="font-semibold">পূর্বের পাওনা:</span>
    //               <span className="font-bold">{result?.PreviousDue}</span>
    //             </div>
    //             <div className="flex justify-between items-center border-b border-gray-300 pb-1">
    //               <span className="font-semibold">বর্তমান জমা:</span>
    //               <span className="font-bold text-lg">{result?.CurrentPaid}</span>
    //             </div>
    //             <div className="flex justify-between items-center border-t border-dashed border-gray-400 pt-2">
    //               <span className="font-semibold">বকেয়া:</span>
    //               <span className="font-bold text-lg">{result?.Due}</span>
    //             </div>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Footer Section - Fixed at bottom */}
    //       <div className="absolute bottom-4 left-0 right-0 px-6 text-[10px]">
    //         <div className="flex justify-between items-end w-full">
    //           {/* Left side - Developer info */}
    //           <div className="text-left">
    //             <p className="leading-tight mt-6 border border-gray-400 p-2 rounded bg-gray-100">
    //               <span className="font-semibold">Software Develop by: </span>
    //               <span className="font-bold">saharait ০১৮২৩০০০৫৫৫</span>
    //             </p>
    //           </div>

    //           {/* Right side - Signature line */}
    //           <div className="text-center">
    //             <div className="h-6 border-b border-black mb-1 w-32 mx-auto"></div>
    //             <p className="font-semibold">গ্রহিতার স্বাক্ষর</p>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
  );
};

export default StudentFeeReportPdf;



