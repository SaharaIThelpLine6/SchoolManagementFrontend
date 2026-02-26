// import LogoAvaterMale from '/avaterMale.jpg';

import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatNumberToBangla } from "../../../utils/dayMinutesFormat";

const StudentDataReportPdf = ({ data }) => {

    const { data: institutionInfo } = useGetInstitutionInfoQuery()
  // Preprocess data to remove spaces from property names
  const processedData = data?.map((student) => ({
    id: student.ID,
    name: student.Name,
    fatherName: student['Fathar Name'],
    motherName: student['Mother Name'],
    dateOfBirth: student['Date Of Birth'],
    nid: student['NID/Birth Registration'],
    gender: student.Gender,
    village: student.Village,
    postOffice: student['Post Office'],
    policeStation: student['Police Station'],
    district: student.District,
    logo: student.logo,
    Class: student.Class,
    Session: student.Session,
  }));


  return (
    <div className="p-6 bg-white text-black font-[SolaimanLipi] text-[14px]">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-[22px] font-bold">
          {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
        </h1>
        <p className="text-[16px]">
          {bnBijoy2Unicode(institutionInfo?.PoliceStation)},{' '}
          {bnBijoy2Unicode(institutionInfo?.District)}
        </p>
      </div>

      {/* Year Box */}
      <div className="flex justify-center items-center mb-3">
        <div className="border border-black px-8 py-1 text-[16px] font-bold">
          ভর্তি রেজিস্টারঃ{' '}
          {formatNumberToBangla(processedData[0]?.Session?.split(' ')[0])}
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-bold">শ্রেণি/জামাতঃ {processedData[0]?.Class}</p>
        <p className="text-[14px]">
          প্রিন্ট: {new Date().toLocaleDateString('bn-BD')}
        </p>
      </div>

      {/* Table */}
      <table className="w-full border border-black border-collapse text-[13px]">
        <thead>
          <tr className="text-center bg-gray-100">
            <th className="border border-black px-1 py-1 w-8">ক্রম</th>
            <th className="border border-black px-1 py-1 w-16">আইডি নং</th>
            <th className="border border-black px-1 py-1 w-40">
              নাম/পিতার নাম
            </th>
            <th className="border border-black px-1 py-1 w-24">জন্ম তারিখ</th>
            <th className="border border-black px-1 py-1 w-32">
              NID/জন্ম নিবন্ধন
            </th>
            <th className="border border-black px-1 py-1">ঠিকানা</th>
            <th className="border border-black px-1 py-1 w-16">ছবি</th>
          </tr>
        </thead>
        <tbody>
          {processedData?.map((s, i) => (
            <tr key={i} className="align-top">
              <td className="border border-black px-1 py-1 text-center">
                {i + 1}
              </td>
              <td className="border border-black px-1 py-1 text-center">
                {s.id}
              </td>
              <td className="border border-black px-1 py-1">
                {s.name} -
                <br />
                <span className="text-gray-700">{s.fatherName}</span>
              </td>
              <td className="border border-black px-1 py-1 text-center">
                {s.dateOfBirth}
              </td>
              <td className="border border-black px-1 py-1 text-center">
                {s.nid || '০'}
              </td>
              <td className="border border-black px-1 py-1">
                {s.village}, {s.postOffice}, {s.policeStation}, {s.district}
              </td>
              <td className="border border-black px-1 py-1 text-center">
                {s.logo && s.logo !== '-' ? (
                  <img
                    src={s.logo}
                    alt="Logo"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-300 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 border-2 border-gray-300 shadow-md flex items-center justify-center text-gray-500 font-semibold">
                    N/A
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDataReportPdf;
