import { Buffer } from 'buffer';
import React, { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

const AllClassRoutingPDF = ({ data = [], pageSize = 'A4' }) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const [logo, setLogo] = useState(null);
  const [signatureNajem, setSignatureNajem] = useState(null);
  const [principal, setPrincipal] = useState(null);

  useEffect(() => {
    try {
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
    } catch (error) {
      console.error('Error processing images:', error);
    }
  }, [institutionInfo, data]);

  // ---------- EMPTY STATE ----------
  if (!Array.isArray(data) || data.length === 0) {
    const emptyContainerClass =
      pageSize === 'A5' ? 'w-[148mm] h-[210mm]' : 'w-[210mm] h-[297mm]';

    return (
      <div
        className={`${emptyContainerClass} flex items-center justify-center text-red-600 text-sm font-bold`}
      >
        পরীক্ষার রুটিনের কোনো তথ্য পাওয়া যায়নি
      </div>
    );
  }

  // ---------- SAFELY ACCESS COMMON DATA ----------
  const common = data[0] || {};

  // ---------- GROUP DATA SAFELY ----------
  const groupedData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];

    return Object.values(
      data.reduce((groups, item) => {
        if (!item || typeof item !== 'object') return groups;

        const key = item.SubClassID;
        if (!key) return groups;

        if (!groups[key]) {
          groups[key] = {
            SubClassID: key,
            SubClass: item.SubClass || '',
            items: [],
          };
        }

        groups[key].items.push(item);
        return groups;
      }, {})
    );
  }, [data]);

  // ---------- SAFE STRING CONVERSION ----------
  const safeConvert = (text) => {
    if (!text) return '';
    try {
      return bnBijoy2Unicode(String(text));
    } catch (error) {
      console.error('Conversion error:', error);
      return String(text);
    }
  };

  // ---------- STYLES BASED ON PAGE SIZE ----------
  const containerClass =
    pageSize === 'A5'
      ? 'w-[148mm] h-[210mm] p-3 text-[10px]'
      : 'w-[210mm] h-[297mm] p-6 text-[12px]';

  const logoSize = pageSize === 'A5' ? 'w-16 h-16' : 'w-20 h-20';
  const logoImageClass = pageSize === 'A5' ? 'w-16 h-16' : 'w-20 h-20';
  const institutionNameSize = pageSize === 'A5' ? 'text-sm' : 'text-xl';
  const addressSize = pageSize === 'A5' ? 'text-xs' : 'text-base';
  const examInfoSize = pageSize === 'A5' ? 'text-sm' : 'text-xl';
  const routineTitleSize = pageSize === 'A5' ? 'text-sm' : 'text-xl';
  const tableTextSize = pageSize === 'A5' ? 'text-[10px]' : 'text-base';
  const tableHeaderPadding = pageSize === 'A5' ? 'py-1 px-1' : 'py-2 px-1';
  const tableRowPadding = pageSize === 'A5' ? 'py-0.5' : 'py-1';
  const tableSubjectPadding = pageSize === 'A5' ? 'pl-1' : 'pl-2';
  const classHeaderFont = pageSize === 'A5' ? 'text-[10px]' : 'text-base';
  const signaturePadding = pageSize === 'A5' ? 'px-10' : 'px-20';
  const signatureImageSize = pageSize === 'A5' ? 'w-12 h-12' : 'w-16 h-16';
  const signatureLineWidth = pageSize === 'A5' ? 'w-24' : 'w-40';
  const signatureFontSize = pageSize === 'A5' ? 'text-[10px]' : 'text-base';
  const marginBottom = pageSize === 'A5' ? 'mb-2' : 'mb-3';
  const signatureMarginTop = pageSize === 'A5' ? 'mt-3' : 'mt-5';
  const lineMarginTop = pageSize === 'A5' ? 'mt-1' : 'mt-3';

  return (
    <div
      className={`${containerClass} bg-white text-black font-SolaimanLipi mx-auto`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${marginBottom}`}>
        {/* Logo */}
        <div className={`${logoSize} flex items-center justify-center`}>
          {logo ? (
            <img
              src={logo}
              alt="Logo"
              className={`${logoImageClass} object-contain`}
            />
          ) : (
            <div
              className={`${
                pageSize === 'A5' ? 'w-14 h-14' : 'w-16 h-16'
              } bg-gray-200 border border-dashed`}
            />
          )}
        </div>

        {/* Title */}
        <div className="text-center flex-1 mx-4">
          <h1 className={`${institutionNameSize} font-bold mb-1`}>
            {safeConvert(institutionInfo?.InstitutionName)}
          </h1>

          <p className={`${addressSize} mb-1`}>
            {safeConvert(institutionInfo?.Address)}
          </p>

          <p className={`${addressSize} mb-2`}>
            {safeConvert(institutionInfo?.ContactNumber)},{' '}
            {safeConvert(institutionInfo?.AraContactNumber)}
          </p>

          <p
            className={`${examInfoSize} font-semibold py-0.5 px-2 inline-block`}
          >
            {safeConvert(common.ExamName)}, {safeConvert(common.SessionName)}
          </p>

          <br />

          <h2
            className={`${routineTitleSize} font-bold border border-black inline-block px-12 py-1 mt-2`}
          >
            পরীক্ষার রুটিন
          </h2>
        </div>

        {/* Right Empty */}
        <div className={logoSize} />
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black text-center">
        <thead>
          <tr className="bg-white">
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize}`}
            >
              ক্রমিক
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize} whitespace-nowrap`}
            >
              বিষয়/ফিকর
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize}`}
            >
              তারিখ
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize}`}
            >
              বার
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize} whitespace-nowrap`}
            >
              সময় শুরু
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize} whitespace-nowrap`}
            >
              সময় শেষ
            </th>
            <th
              className={`border border-black ${tableHeaderPadding} ${tableTextSize} whitespace-nowrap`}
            >
              কক্ষ নং
            </th>
          </tr>
        </thead>
        <tbody>
          {groupedData.map((group, groupIndex) => (
            <React.Fragment key={group.SubClassID || groupIndex}>
              {/* ===== CLASS HEADING ROW ===== */}
              <tr>
                <td
                  className={`border border-black ${tableRowPadding} font-bold ${classHeaderFont} text-center !bg-gray-400 text-white`}
                  colSpan={7}
                >
                  জামাত / ক্লাস : {safeConvert(group.SubClass)}
                </td>
              </tr>

              {/* ===== CLASS WISE ROWS ===== */}
              {group.items.map((row, idx) => (
                <tr key={`${group.SubClassID}-${idx}`}>
                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {idx + 1}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-left ${tableSubjectPadding} ${tableTextSize}`}
                  >
                    {safeConvert(row.SubjectName)}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {bnBijoy2Unicode(row.ExamDate) || ''}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {bnBijoy2Unicode(row.ExamDay) || ''}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {row.StartTime || ''}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {row.EndTime || ''}
                  </td>

                  <td
                    className={`border border-black ${tableRowPadding} text-center ${tableTextSize}`}
                  >
                    {row.RoomNo || ''}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Signature Section */}
      <div
        className={`${signatureMarginTop} flex justify-between ${signaturePadding} ${signatureFontSize}`}
      >
        <div className="text-center">
          {signatureNajem && (
            <img
              src={signatureNajem}
              alt="Seal"
              className={`${signatureImageSize} mx-auto object-contain mb-1`}
            />
          )}
          <div
            className={`border-t border-black ${signatureLineWidth} ${lineMarginTop}`}
          ></div>
          <p className="mt-1">নাযেমে তালি: স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>

        <div className="text-center">
          {principal && (
            <img
              src={principal}
              alt="Seal"
              className={`${signatureImageSize} mx-auto object-contain mb-1`}
            />
          )}
          <div
            className={`border-t border-black ${signatureLineWidth} ${lineMarginTop}`}
          ></div>
          <p className="mt-1">প্রিন্সিপাল স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>
      </div>
    </div>
  );
};

export default AllClassRoutingPDF;
