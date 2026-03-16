import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../utils/conveter';

function CharacterReport({ report }) {
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
  return (
    <div className="w-full bg-white mx-auto font-SolaimanLipi print_canvas px-2">
      <div className="header relative text-center border-b-2 border-black pb-4 mb-6">
        <h2 className="text-[28px] text-black font-bold">
          {institutionInfo?.InstitutionName}
        </h2>
        <p className="text-[18px] font-semibold">
          {institutionInfo?.Address}
        </p>
        <p className="text-[18px] font-semibold">
          {institutionInfo?.AraContactNumber}
        </p>
        <div className="logo absolute top-0 left-0 h-[76px] w-[60px] ">
          <img src={logo} alt="Logo" className="w-full h-auto" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-center text-[20px] font-bold border-2 border-black inline-block p-3">
          শিক্ষার্থীর ব্যক্তিগত চারিত্রিক রিপোর্ট
        </p>
      </div>
      <div className="student_info flex w-full justify-between mt-8 mb-5 border-b-2 border-black pb-2">
        <h3 className="font-bold text-[18px]">কোড: {report[0]?.StudentCode}</h3>
        <h3 className="font-bold text-[18px]">
          নাম: {bnBijoy2Unicode(report[0]?.StudentName)}
        </h3>
        <h3 className="font-bold text-[18px]">
          বাবার নাম: {bnBijoy2Unicode(report[0]?.FatherName)}
        </h3>
      </div>
      <table className="table-auto w-full border border-gray-300 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-2">ক্র: নং</th>
            <th className="border border-gray-300 px-2 py-2">রিপোর্ট ধরন</th>
            <th className="border border-gray-300 px-2 py-2">রিপোর্ট প্রকার</th>
            <th className="border border-gray-300 px-2 py-2">তারিখ</th>
            <th className="border border-gray-300 px-2 py-2">মন্তব্য</th>
          </tr>
        </thead>
        <tbody>
          {report &&
            report.map((item, index) => (
              <tr
                key={index}
                className="bg-white border-b hover:bg-gray-50 text-black"
              >
                <td className="border border-gray-300 px-2 py-2">
                  {index + 1}
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  {bnBijoy2Unicode(item.ReportType)}
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  {bnBijoy2Unicode(item.ReportCet)}
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  {item.CreateDate}
                </td>
                <td
                  className="border border-gray-300 px-2 py-2 max-w-[300px]"
                  title={item.Remark} // হোভার এ পুরো টেক্সট দেখাবে
                >
                  {item.Remark}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default CharacterReport;
