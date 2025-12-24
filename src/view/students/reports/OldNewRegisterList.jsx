import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const OldNewRegisterList = ({ reportData, NewOldId, SubClassID }) => {
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  const { data: subClassListData } = useGetSubClassListQuery();
 const subClasData = subClassListData?.find(
  (i) => i.SubClassID === Number(SubClassID)
);



  return (
    <div className="bg-white p-8 text-black text-sm">
      <div className="text-center flex-1 bg-white">
        <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
          {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
        </h1>
        <p className="text-base font-semibold bg-white">
          {bnBijoy2Unicode(instutionInfo?.Address)}
        </p>
        <div className="text-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg border-b-2 border-r-2 border-black">
          শিক্ষার্থীদের সংক্ষিপ্ত তালিকা
        </div>
      </div>
      {/* Header Section */}
      <div className="grid grid-cols-3 gap-4 mb-4 sm:mb-0 p-4 bg-white">
        <div className="flex gap-2 bg-white">
          <span>শ্রেণী/জামাত:</span>
          <span className="font-bold underline">
            {bnBijoy2Unicode(subClasData?.SubClass)}
          </span>
        </div>
        <div className="flex gap-2 justify-center bg-white">
          <span>সর্বমোট শিক্ষার্থী:</span>
          <span className="font-bold underline">{reportData?.length}</span>
        </div>
        <div className="flex gap-2 justify-end bg-white">
          <span>শিক্ষার্থীর ধরন:</span>
          <span className="font-bold underline">
            {{
              1: 'নতুন',
              2: 'পুরাতন',
              3: 'উভয়',
            }[Number(NewOldId)] || ''}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border border-black border-collapse bg-white">
          <thead className="bg-white">
            <tr className="text-center text-sm">
              <th className="border border-black px-2 py-1">ক্রমিক</th>
              <th className="border border-black px-2 py-1">দাখেলা</th>
              <th className="border border-black px-2 py-1">নাম</th>
              <th className="border border-black px-2 py-1">পিতার নাম</th>
              <th className="border border-black px-2 py-1">জন্ম তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.map((s, idx) => (
              <tr key={idx} className="text-center bg-white">
                <td className="border border-black px-2 py-1 bg-white">
                  {idx + 1}
                </td>
                <td className="border border-black px-2 py-1 bg-white">
                  {s.StudentCode}
                </td>
                <td className="border border-black px-2 py-1 bg-white">
                  {bnBijoy2Unicode(s.StudentName)}
                </td>
                <td className="border border-black px-2 py-1 bg-white">
                  {bnBijoy2Unicode(s.FatherName)}
                </td>
                <td className="border border-black px-2 py-1 bg-white">
                  {bnBijoy2Unicode(formatToDDMMYYYY(s.DateOfBirth))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OldNewRegisterList;
