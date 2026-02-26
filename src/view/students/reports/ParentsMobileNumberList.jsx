import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

const ParentsMobileNumberList = ({ reportData, SubClassID, SessionID }) => {
  console.log(reportData, 'reportData');
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  const { data: subClassListData } = useGetSubClassListQuery();
  const subClasData = subClassListData?.find(
    (i) => i.SubClassID === Number(SubClassID)
  );
  const { data: sessionSData } = useGetSessionsQuery();

  const sessionData = sessionSData?.find(
    (i) => i.SessionID === Number(SessionID)
  );

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  return (
    <div className="font-bangla  p-4 bg-white text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 sm:gap-8 bg-white">
        {/* Logo - Centered on mobile, left-aligned on desktop */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <img
            src={logo}
            alt="Institution Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>

        {/* Institution Info - Centered */}
        <div className="text-center flex-1 space-y-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base sm:text-lg font-semibold text-gray-700">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>

          {/* Parent Mobile Header */}
          <div className="inline-block border-b-2 border-black px-4 py-1">
            <span className="text-base sm:text-lg font-bold tracking-wider">
              অভিভাবকের মোবাইল
            </span>
          </div>
        </div>

        {/* Spacer - Maintains balance on desktop */}
        <div className="hidden sm:block w-20 h-20" />
      </div>

      {/* Secondary Header - Class and Academic Year */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-8 bg-white">
        <div className="text-base sm:text-lg font-semibold text-gray-900">
          শ্রেণী/জামাত : {bnBijoy2Unicode(subClasData?.SubClass)}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-base sm:text-lg font-bold text-gray-900">
            শিক্ষাবর্ষ : {bnBijoy2Unicode(sessionData?.SessionName)}
          </div>
          <div className="text-sm sm:text-base font-medium text-black">
            প্রিন্ট তারিখ:
            <span>
              {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্র:</th>
              <th className="border border-black p-2 bg-white">দাখেলা</th>
              <th className="border border-black p-2 bg-white">
                শিক্ষার্থীর নাম
              </th>
              <th className="border border-black p-2 bg-white">পিতার নাম</th>
              <th className="border border-black p-2 bg-white">মোবাইল ১</th>
              <th className="border border-black p-2 bg-white">সম্পর্ক</th>
              <th className="border border-black p-2 bg-white">মোবাইল ২</th>
              <th className="border border-black p-2 bg-white">সম্পর্ক</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {index + 1}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.StudentCode}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.StudentName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {bnBijoy2Unicode(row.FatherName)}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.Mobile1}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.Relationship1}
                </td>

                <td className="border border-black p-2 text-center bg-white">
                  {row.Mobile2}
                </td>

                <td className="border border-black p-2 text-center bg-white">
                  {row.Relationship2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParentsMobileNumberList;
