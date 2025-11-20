import { Buffer } from 'buffer';
import React, { useEffect, useState } from 'react';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';

const AllClassRoutingPDF = ({ data = [] }) => {
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
          setSignatureNajem(`data:image/png;base64,${buffer1.toString('base64')}`);
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
    return (
      <div className="w-[210mm] h-[297mm] flex items-center justify-center text-red-600 text-xl font-bold">
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

  return (
    <div className="w-[210mm] h-[297mm]  bg-white text-black p-6 text-[12px] font-SolaimanLipi mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {/* Logo */}
        <div className="w-20 h-20 flex items-center justify-center">
          {logo ? (
            <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
          ) : (
            <div className="w-14 h-14 bg-gray-200 border-2 border-dashed" />
          )}
        </div>

        {/* Title */}
        <div className="text-center flex-1 mx-4">
          <h1 className="text-xl font-bold mb-1">
            {safeConvert(institutionInfo?.InstitutionName)}
          </h1>

          <p className="text-base mb-1">
            {safeConvert(institutionInfo?.Address)}
          </p>

          <p className="text-base mb-2">
            {safeConvert(institutionInfo?.ContactNumber)},{' '}
            {safeConvert(institutionInfo?.AraContactNumber)}
          </p>

          <p className="text-xl font-semibold py-1 px-3 inline-block">
            {safeConvert(common.ExamName)},{' '}
            {safeConvert(common.SessionName)}
          </p>

          <br />

          <h2 className="text-xl font-bold border-2 border-black inline-block px-12 py-1 mt-3">
            পরীক্ষার রুটিন
          </h2>
        </div>

        {/* Right Empty */}
        <div className="w-20 h-20" />
      </div>

      {/* Main Table */}
      <table className="w-full border-collapse border border-black text-base text-center">
        <thead>
          <tr className="bg-white">
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
          {groupedData.map((group, groupIndex) => (
            <React.Fragment key={group.SubClassID || groupIndex}>
              {/* ===== CLASS HEADING ROW ===== */}
              <tr>
                <td
                  className="border border-black py-2 font-bold text-base text-center !bg-gray-400 text-white"
                  colSpan={7}
                >
                  জামাত / ক্লাস : {safeConvert(group.SubClass)}
                </td>
              </tr>

              {/* ===== CLASS WISE ROWS ===== */}
              {group.items.map((row, idx) => (
                <tr key={`${group.SubClassID}-${idx}`}>
                  <td className="border border-black py-1 text-center">
                    {idx + 1}
                  </td>

                  <td className="border border-black py-1 text-left pl-2">
                    {safeConvert(row.SubjectName)}
                  </td>

                  <td className="border border-black py-1 text-center">
                    {row.ExamDate || ''}
                  </td>

                  <td className="border border-black py-1 text-center">
                    {row.ExamDay || ''}
                  </td>

                  <td className="border border-black py-1 text-center">
                    {row.StartTime || ''}
                  </td>

                  <td className="border border-black py-1 text-center">
                    {row.EndTime || ''}
                  </td>

                  <td className="border border-black py-1 text-center">
                    {row.RoomNo || ''}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="mt-5 flex justify-between px-20 text-base">
        <div className="text-center">
          {signatureNajem && (
            <img
              src={signatureNajem}
              alt="Seal"
              className="w-16 h-16 mx-auto object-contain mb-2"
            />
          )}
          <div className="border-t-2 border-black w-40 mt-3"></div>
          <p className="mt-2">নাযেমে তালি: স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>

        <div className="text-center">
          {principal && (
            <img
              src={principal}
              alt="Seal"
              className="w-16 h-16 mx-auto object-contain mb-2"
            />
          )}
          <div className="border-t-2 border-black w-40 mt-3"></div>
          <p className="mt-2">প্রিন্সিপাল স্বাক্ষর</p>
          <p>তারিখ: ..................</p>
        </div>
      </div>
    </div>
  );
};

export default AllClassRoutingPDF;
// import { Buffer } from 'buffer';
// import { React, useEffect, useState } from 'react';
// import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
// import bnBijoy2Unicode from '../../../utils/conveter';

// const AllClassRoutingPDF = ({ data = [] }) => {
//   const { data: institutionInfo } = useGetInstitutionInfoQuery();

//   const [logo, setLogo] = useState(null);
//   const [signatureNajem, setSignatureNajem] = useState(null);
//   const [principal, setPrincipal] = useState(null);

//   useEffect(() => {
//     // ---------- Institution Logo ----------
//     const logoData = institutionInfo?.Logo?.data;
//     if (logoData) {
//       const buffer = Buffer.from(logoData);
//       setLogo(`data:image/png;base64,${buffer.toString('base64')}`);
//     }

//     // ---------- Signature Najem + Principal ----------
//     if (Array.isArray(data) && data.length > 0) {
//       const najemData = data[0]?.SignatureNajem?.data;
//       const principalData = data[0]?.SignaturePrincipal?.data;

//       if (najemData) {
//         const buffer1 = Buffer.from(najemData);
//         setSignatureNajem(
//           `data:image/png;base64,${buffer1.toString('base64')}`
//         );
//       }

//       if (principalData) {
//         const buffer2 = Buffer.from(principalData);
//         setPrincipal(`data:image/png;base64,${buffer2.toString('base64')}`);
//       }
//     }
//   }, [institutionInfo, data]);

//   // ---------- EMPTY STATE ----------
//   if (!Array.isArray(data) || data.length === 0) {
//     return (
//       <div className="w-[210mm] h-[297mm] flex items-center justify-center text-red-600 text-xl font-bold">
//         পরীক্ষার রুটিনের কোনো তথ্য পাওয়া যায়নি
//       </div>
//     );
//   }

//   // ---------- COMMON DATA ----------
//   const common = data[0];

//   return (
//     <div className="w-[210mm] bg-white text-black p-6 text-[12px] font-SolaimanLipi mx-auto">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         {/* Logo */}
//         <div className="w-20 h-20 flex items-center justify-center">
//           {logo ? (
//             <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
//           ) : (
//             <div className="w-14 h-14 bg-gray-200 border-2 border-dashed" />
//           )}
//         </div>

//         {/* Title */}
//         <div className="text-center flex-1 mx-4">
//           <h1 className="text-xl font-bold mb-1">
//             {bnBijoy2Unicode(institutionInfo?.InstitutionName || '')}
//           </h1>

//           <p className="text-base mb-1">
//             {bnBijoy2Unicode(institutionInfo?.Address || '')}
//           </p>

//           <p className="text-base mb-2">
//             {bnBijoy2Unicode(institutionInfo?.ContactNumber || '')},{' '}
//             {bnBijoy2Unicode(institutionInfo?.AraContactNumber || '')}
//           </p>

//           <p className="text-xl font-semibold py-1 px-3 inline-block">
//             {bnBijoy2Unicode(common.ExamName)},{' '}
//             {bnBijoy2Unicode(common.SessionName)}
//           </p>

//           <br />

//           <h2 className="text-xl font-bold border-2 border-black inline-block px-12 py-1 mt-3">
//             পরীক্ষার রুটিন
//           </h2>
//         </div>

//         {/* Right Empty */}
//         <div className="w-20 h-20" />
//       </div>

//       {/* Main Table */}
//       <table className="w-full border-collapse border border-black text-base text-center">
//         <thead>
//           <tr className="bg-white">
//             <th className="border border-black py-2 px-1">ক্রমিক</th>
//             <th className="border border-black py-2 px-1">বিষয়/ফিকর</th>
//             <th className="border border-black py-2 px-1">তারিখ</th>
//             <th className="border border-black py-2 px-1">বার</th>
//             <th className="border border-black py-2 px-1">সময় শুরু</th>
//             <th className="border border-black py-2 px-1">সময় শেষ</th>
//             <th className="border border-black py-2 px-1">কক্ষ নং</th>
//           </tr>
//         </thead>
//         <tbody>
//           {Object.values(
//             data?.reduce((groups, item) => {
//               const key = item.SubClassID;

//               if (!groups[key]) {
//                 groups[key] = {
//                   SubClassID: key,
//                   SubClass: item.SubClass,
//                   items: [],
//                 };
//               }

//               groups[key].items.push(item);
//               return groups;
//             }, {})
//           ).map((group, groupIndex) => (
//             <React.Fragment key={groupIndex}>
//               {/* ===== CLASS HEADING ROW ===== */}
//               <tr>
//                 <td
//                   className="border border-black py-2 font-bold text-base text-center bg-gray-400 text-white"
//                   colSpan={7}
//                 >
//                   জামাত / ক্লাস : {bnBijoy2Unicode(group.SubClass)}
//                 </td>
//               </tr>

//               {/* ===== CLASS WISE ROWS ===== */}
//               {group.items.map((row, idx) => (
//                 <tr key={idx}>
//                   <td className="border border-black py-1 text-center">
//                     {idx + 1}
//                   </td>

//                   <td className="border border-black py-1 text-left pl-2">
//                     {bnBijoy2Unicode(row.SubjectName)}
//                   </td>

//                   <td className="border border-black py-1 text-center">
//                     {row.ExamDate}
//                   </td>

//                   <td className="border border-black py-1 text-center">
//                     {row.ExamDay}
//                   </td>

//                   <td className="border border-black py-1 text-center">
//                     {row.StartTime}
//                   </td>

//                   <td className="border border-black py-1 text-center">
//                     {row.EndTime}
//                   </td>

//                   <td className="border border-black py-1 text-center">
//                     {row.RoomNo}
//                   </td>
//                 </tr>
//               ))}
//             </React.Fragment>
//           ))}
//         </tbody>
//       </table>
//       {/* Signature Section */}
//       <div className="mt-5 flex justify-between px-20 text-base">
//         <div className="text-center">
//           {signatureNajem && (
//             <img
//               src={signatureNajem}
//               alt="Seal"
//               className="w-16 h-16 mx-auto object-contain mb-2"
//             />
//           )}
//           <div className="border-t-2 border-black w-40 mt-3"></div>
//           <p className=" mt-2">নাযেমে তালি: স্বাক্ষর</p>
//           <p className="">তারিখ: ..................</p>
//         </div>

//         <div className="text-center">
//           {principal && (
//             <img
//               src={principal}
//               alt="Seal"
//               className="w-16 h-16 mx-auto object-contain mb-2"
//             />
//           )}
//           <div className="border-t-2 border-black w-40 mt-3"></div>
//           <p className=" mt-2">প্রিন্সিপাল স্বাক্ষর</p>
//           <p className="">তারিখ: ..................</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AllClassRoutingPDF;
