import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

/**
 * 🟦 pageSize: "A4" | "A5"
 * A4 = 210mm × 297mm
 * A5 = 148mm × 210mm
 */
const SingleClassRoutingPDF = ({ data = [], pageSize = 'A4' }) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const [logo, setLogo] = useState(null);
  const [signatureNajem, setSignatureNajem] = useState(null);
  const [principal, setPrincipal] = useState(null);

  // ---------- Convert Buffer Images ----------
  useEffect(() => {
    const logoData = institutionInfo?.Logo?.data;
    if (logoData) {
      const buffer = Buffer.from(logoData);
      setLogo(`data:image/png;base64,${buffer.toString('base64')}`);
    }

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

  const common = data[0];

  // ---------- PAGE SIZE CONTROL ----------
  const pageStyle =
    pageSize === 'A5'
      ? 'w-[148mm] h-[210mm] p-3 text-[10px]'
      : 'w-[210mm] h-[297mm] p-6 text-[12px]';

  const titleSize = pageSize === 'A5' ? 'text-lg' : 'text-xl';
  const tableHeaderSize = pageSize === 'A5' ? 'text-sm' : 'text-base';
  const rowFont = pageSize === 'A5' ? 'text-sm' : 'text-base';

  return (
    <div
      className={`mx-auto bg-white text-black font-SolaimanLipi ${pageStyle}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-16 h-16 flex items-center justify-center">
          {logo ? (
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-14 h-14 bg-gray-200 border-2 border-dashed" />
          )}
        </div>

        <div className="text-center flex-1 mx-2">
          <h1 className={`${titleSize} font-bold mb-1`}>
            {bnBijoy2Unicode(institutionInfo?.InstitutionName || '')}
          </h1>
          <p className="mb-1">
            {bnBijoy2Unicode(institutionInfo?.Address || '')}
          </p>
          <p className="mb-2">
            {bnBijoy2Unicode(institutionInfo?.ContactNumber || '')},{' '}
            {bnBijoy2Unicode(institutionInfo?.AraContactNumber || '')}
          </p>

          <p className={`${titleSize} font-semibold`}>
            {bnBijoy2Unicode(common.ExamName)},{' '}
            {bnBijoy2Unicode(common.SessionName)}
          </p>

          <h2
            className={`border-2 border-black inline-block px-10 py-1 mt-2 ${titleSize} font-bold`}
          >
            পরীক্ষার রুটিন
          </h2>
        </div>

        <div className="w-16 h-16" />
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black text-center">
        <thead>
          <tr className={`bg-gray-100 ${tableHeaderSize}`}>
            <th className="border border-black py-2 px-1">ক্রমিক</th>
            <th className="border border-black py-2 px-1">বিষয়/ফিকর</th>
            <th className="border border-black py-2 px-1">তারিখ</th>
            <th className="border border-black py-2 px-1">বার</th>
            <th className="border border-black py-2 px-1">সময় শুরু</th>
            <th className="border border-black py-2 px-1">সময় শেষ</th>
            <th className="border border-black py-2 px-1">কক্ষ নং</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              className="border border-black py-2 font-bold !bg-gray-400 text-white"
              colSpan={7}
            >
              জামাত / ক্লাস : {bnBijoy2Unicode(common.SubClass)}
            </td>
          </tr>

          {data.map((row, idx) => (
            <tr key={idx} className={`${rowFont}`}>
              <td className="border border-black py-1">{idx + 1}</td>

              <td className="border border-black py-1 text-left pl-2">
                {bnBijoy2Unicode(row.SubjectName)}
              </td>

              <td className="border border-black py-1">
                {bnBijoy2Unicode(row.ExamDate)}
              </td>
              <td className="border border-black py-1">{bnBijoy2Unicode(row.ExamDay)}</td>
              <td className="border border-black py-1">{row.StartTime}</td>
              <td className="border border-black py-1">{row.EndTime}</td>
              <td className="border border-black py-1">{row.RoomNo}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="mt-5 flex justify-between px-10">
        <div className="text-center">
          {signatureNajem && (
            <img
              src={signatureNajem}
              alt="Seal"
              className="w-14 h-14 mx-auto object-contain mb-1"
            />
          )}
          <div className="border-t-2 border-black w-32 mt-2"></div>
          <p className="mt-1">নাযেমে তালি: স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>

        <div className="text-center">
          {principal && (
            <img
              src={principal}
              alt="Seal"
              className="w-14 h-14 mx-auto object-contain mb-1"
            />
          )}
          <div className="border-t-2 border-black w-32 mt-2"></div>
          <p className="mt-1">প্রিন্সিপাল স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>
      </div>
    </div>
  );
};

export default SingleClassRoutingPDF;
