import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import { enToBnNumber } from '../../../helper/languageFormat';
import bnBijoy2Unicode from '../../../utils/conveter';

const StudentFeeReportPdf = ({ SubClassID, SessionID }) => {
  const { data: subClassListData } = useGetSubClassListQuery();
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();
  const [logo, setLogo] = useState(null);
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  const { data: sessionSData } = useGetSessionsQuery();

  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);

  const SubClassName = bnBijoy2Unicode(subClasData?.SubClass);
  const SessionName = bnBijoy2Unicode(sessionData?.SessionName);

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
        padding: '5mm',
      }}
    >
      <div className="bg-white text-black">
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
                <span className="font-bold w-24">নাম:</span>
                <span>মাশকুরা</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">পিতা:</span>
                <span>এসাদ</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">শ্রেণি/ক্লাস:</span>
                <span>তৃতীয়</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">ছাত্রের ধরণ:</span>
                <span>মুজিব</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="font-bold w-24">রশিদ নং:</span>
                <span>৭৮</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">তারিখ:</span>
                <span>২৫/১০/২০২৫</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">ডাক কোড:</span>
                <span>৫৬</span>
              </div>
              <div className="flex">
                <span className="font-bold w-24">আবাস:</span>
                <span>অনাবাসিক</span>
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
                <tr>
                  <td className="border border-gray-600 p-1 text-center">১</td>
                  <td className="border border-gray-600 p-1">খাবার</td>
                  <td className="border border-gray-600 p-1">
                    বছরভিত্তিক (২০২৫-২০২৬)
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ২,০০০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ২,০০০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ০.০০
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-600 p-1 text-center">২</td>
                  <td className="border border-gray-600 p-1">বেতন</td>
                  <td className="border border-gray-600 p-1">
                    বছরভিত্তিক (২০২৫-২০২৬)
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ২,০০০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ১,৯০০.০০
                  </td>
                  <td className="border border-gray-600 p-1 text-right">
                    ১০০.০০
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-2 border-t border-gray-800 text-xs">
            <div className="border-r border-gray-800 p-2">
              <p className="font-bold mb-1">কথায়:</p>
              <p className="text-xs">তিন হাজার নয় শত টাকা মাত্র।</p>
            </div>

            <div className="p-2 space-y-1">
              <div className="flex justify-between">
                <span>সর্বমোট:</span>
                <span className="font-bold">৪,০০০.০০</span>
              </div>
              <div className="flex justify-between">
                <span>(-) কর্তন:</span>
                <span>০.০০</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-400 pt-1">
                <span>প্রদেয়:</span>
                <span className="font-bold">৪,০০০.০০</span>
              </div>
              <div className="flex justify-between">
                <span>পরিশোধ:</span>
                <span className="font-bold">৩,৯০০.০০</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-400 pt-1">
                <span>বকেয়া:</span>
                <span className="font-bold text-red-600">১০০.০০</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔹 Footer Section - Fixed at bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-6 text-[10px] text-gray-700">
          <div className="flex justify-between items-start w-full">
            {/* 🔸 Left side - Developer info */}
            <div className="text-left">
              <p className="leading-tight">সফটওয়্যার ডেভেলপ বাই: সাহার</p>
              <p className="leading-tight">মোবাইল: ০১৮২৩০০০৫৫৫</p>
            </div>

            {/* 🔸 Right side - Signature line */}
            <div className="text-center">
              <div className="h-6 border-b border-gray-500 mb-1 w-32"></div>
              <p>অভিভাবকের স্বাক্ষর</p>
            </div>
          </div>
        </div>

        {/* Additional Signature Sections (Optional) */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-3 gap-4 text-xs text-center">
            <div>
              <div className="h-8 border-b border-gray-400 mb-1 mx-4"></div>
              <p>প্রধান শিক্ষকের স্বাক্ষর</p>
            </div>
            <div>
              <div className="h-8 border-b border-gray-400 mb-1 mx-4"></div>
              <p>ক্যাশিয়ারের স্বাক্ষর</p>
            </div>
            <div>
              <div className="h-8 border-b border-gray-400 mb-1 mx-4"></div>
              <p>অভিভাবকের স্বাক্ষর</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeReportPdf;
