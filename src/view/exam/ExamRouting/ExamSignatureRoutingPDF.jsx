import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

const ExamSignatureRoutingPDF = ({ data = [] }) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  console.log(data, 'data');

  const [logo, setLogo] = useState(null);
  const [signatureNajem, setSignatureNajem] = useState(null);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    // ---------- Institution Logo ----------
    const logoData = institutionInfo?.Logo?.data;
    if (logoData) {
      const buffer = Buffer.from(logoData);
      setLogo(`data:image/png;base64,${buffer.toString('base64')}`);
    }

    // ---------- Signature Najem + Principal ----------
    if (Array.isArray(data) && data.length > 0) {
      const najemData = data[0]?.SignatureNajem?.data;
      const principalData = data[0]?.SignaturePrincipal?.data;

      if (najemData) {
        const buffer1 = Buffer.from(najemData);
        setSignatureNajem(
          `data:image/png;base64,${buffer1.toString('base64')}`
        );
      }

      if (principalData) {
        const buffer2 = Buffer.from(principalData);
        setPrincipal(`data:image/png;base64,${buffer2.toString('base64')}`);
      }
    }
  }, [institutionInfo, data]);

  // ---------- EMPTY STATE ----------
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="w-[210mm] h-[297mm] flex items-center justify-center text-red-600 text-xl font-bold">
        পরীক্ষার রুটিনের কোনো তথ্য পাওয়া যায়নি
      </div>
    );
  }

  // ---------- COMMON DATA ----------
  const common = data[0];


  return (
    <div className=" bg-white text-black p-6 text-[12px] font-SolaimanLipi">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="w-20 h-20 flex items-center justify-center transform translate-x-30">
          {logo ? (
            <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
          ) : (
            <div className="w-14 h-14 bg-gray-200 border-2 border-dashed" />
          )}
        </div>

        {/* Title & Info */}
        <div className="text-center flex-1 mx-4">
          <h1 className="text-xl font-bold mb-1">
            {bnBijoy2Unicode(institutionInfo?.InstitutionName || '')}
          </h1>
          <p className="text-sm mb-1">
            {bnBijoy2Unicode(institutionInfo?.Address || '')}
          </p>
          <p className="text-sm mb-2">
            {bnBijoy2Unicode(institutionInfo?.ContactNumber || '')},{' '}
            {bnBijoy2Unicode(institutionInfo?.AraContactNumber || '')}
          </p>

          <p className="text-base font-semibold py-1 px-3 rounded inline-block">
            {bnBijoy2Unicode(common.ExamName)},{' '}
            {bnBijoy2Unicode(common.SessionName)}
          </p>
          <br />
          <h2 className="text-base font-bold border-2 border-black inline-block px-12 py-1 mt-3 rounded-md">
            পরীক্ষার্থী দস্তখত/স্বাক্ষরপত্র
          </h2>
        </div>

        {/* Right side empty (for symmetry) */}
        <div className="w-16 h-16" />
      </div>
      <div className="flex justify-start items-center mb-3">
        <p className="text-base text-gray-600 font-medium">
          মারহালা/শ্রেণী: মক্তব-প্রথম শ্রেণি
        </p>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            {/* Date Row */}
            <tr className="bg-gradient-to-r bg-white border-black-1 border-2 text-center font-semibold">
              <th
                colSpan={3}
                className="border border-gray-300 px-3 py-2 w-12 text-gray-700"
              >
                {`তারিখ ------>`}
              </th>
              {[
                data[0]?.Date1,
                data[0]?.Date2,
                data[0]?.Date3,
                data[0]?.Date4,
                data[0]?.Date5,
                data[0]?.Date6,
                data[0]?.Date7,
                data[0]?.Date8,
                data[0]?.Date9,
                data[0]?.Date10,
                data[0]?.Date11,
                data[0]?.Date12,
                data[0]?.Date13,
                data[0]?.Date14,
              ]
                .filter((date) => date && date.trim() !== '')
                .map((date, index) => (
                  <th
                    key={`date-${index}`}
                    className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap"
                  >
                    {bnBijoy2Unicode(date + ' AvM÷')}
                  </th>
                ))}
            </tr>

            {/* Day Row */}
            <tr className="bg-gradient-to-r bg-white border-black-1 border-2 text-center font-semibold">
              <th
                colSpan={3}
                className="border border-gray-300 px-3 py-2 w-12 text-gray-700"
              >
                {`বার ------>`}
              </th>
              {[
                data[0]?.Day1,
                data[0]?.Day2,
                data[0]?.Day3,
                data[0]?.Day4,
                data[0]?.Day5,
                data[0]?.Day6,
                data[0]?.Day7,
                data[0]?.Day8,
                data[0]?.Day9,
                data[0]?.Day10,
                data[0]?.Day11,
                data[0]?.Day12,
                data[0]?.Day13,
                data[0]?.Day14,
              ]
                .filter((day) => day && day.trim() !== '')
                .map((day, index) => (
                  <th
                    key={`day-${index}`}
                    className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap"
                  >
                    {day}
                  </th>
                ))}
            </tr>

            {/* Time Row */}
            <tr className="bg-gradient-to-r bg-white border-black-1 border-2 text-center font-semibold">
              <th
                colSpan={3}
                className="border border-gray-300 px-3 py-2 w-12 text-gray-700"
              >
                {`সময় ------>`}
              </th>
              {[
                data[0]?.Time1,
                data[0]?.Time2,
                data[0]?.Time3,
                data[0]?.Time4,
                data[0]?.Time5,
                data[0]?.Time6,
                data[0]?.Time7,
                data[0]?.Time8,
                data[0]?.Time9,
                data[0]?.Time10,
                data[0]?.Time11,
                data[0]?.Time12,
                data[0]?.Time13,
                data[0]?.Time14,
              ]
                .filter((time) => time && time.trim() !== '')
                .map((time, index) => (
                  <th
                    key={`time-${index}`}
                    className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap"
                  >
                    {time}
                  </th>
                ))}
            </tr>

            {/* Subject Header Row */}
            <tr className="bg-gradient-to-r bg-white border-black-1 border-2 text-center font-semibold">
              <th className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap">
                ক্রম
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap">
                আইডি
              </th>
              <th className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap">
                পরীক্ষার্থীর নাম
              </th>
              {[
                data[0]?.Subj1,
                data[0]?.Subj2,
                data[0]?.Subj3,
                data[0]?.Subj4,
                data[0]?.Subj5,
                data[0]?.Subj6,
                data[0]?.Subj7,
                data[0]?.Subj8,
                data[0]?.Subj9,
                data[0]?.Subj10,
                data[0]?.Subj11,
                data[0]?.Subj12,
                data[0]?.Subj13,
                data[0]?.Subj14,
              ]
                .filter((subject) => subject && subject.trim() !== '')
                .map((subject, index) => (
                  <th
                    key={`subject-${index}`}
                    className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-nowrap"
                  >
                    {subject}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="text-start">
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 whitespace-nowrap">
                  {row.AdmissionSerial || i + 1}
                </td>
                <td className="border border-gray-300 px-3 py-2 font-medium text-gray-800 whitespace-nowrap">
                  {row.UserCode}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-start pr-4 text-gray-800 whitespace-nowrap">
                  {row.UserName}
                </td>

                {/* Dynamic subject columns - you'll need to replace these with actual mark data */}
                {[
                  row.Subj1,
                  row.Subj2,
                  row.Subj3,
                  row.Subj4,
                  row.Subj5,
                  row.Subj6,
                  row.Subj7,
                  row.Subj8,
                  row.Subj9,
                  row.Subj10,
                  row.Subj11,
                  row.Subj12,
                  row.Subj13,
                  row.Subj14,
                ]
                  .filter((subject) => subject && subject.trim() !== '')
                  .map((_, index) => (
                    <td
                      key={`mark-${index}`}
                      className="border border-gray-300 px-3 py-2 text-gray-500 whitespace-nowrap"
                    >
                      {/* Replace this with actual marks data */}
                      {row.sign || ''}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExamSignatureRoutingPDF;
