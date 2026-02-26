import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { formatDate } from "../../../helper/formatTime";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatToDDMMYYYY } from "../../../utils/dateFormat";

const ImageWithAdmissionRegisterNewOld = ({ reportData }) => {
  const [logo, setLogo] = useState(null);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  // Transform reportData into table rows
  const tableData =
    reportData?.map((student, index) => ({
      sl: index + 1,
      roll: student.StudentCode,
      studentName: `${bnBijoy2Unicode(student.StudentName)} / ${bnBijoy2Unicode(
        student.FatherName || ''
      )}`,
      fatherName: `${
        formatToDDMMYYYY(student.DateOfBirth)
          ? bnBijoy2Unicode(formatToDDMMYYYY(student.DateOfBirth)) + ' / '
          : ''
      }${student.Mobile1 || ''}`,
      motherName: `${student.NIDNO || ''} ${
        student.NIDNO && student.BloodGroup ? '/' : ''
      } ${student.BloodGroup || ''}`,
      dob: `${bnBijoy2Unicode(student.permanentVill || '')}, ${bnBijoy2Unicode(
        student.PermanentDistrictName || ''
      )}`,
      bloodGroup: student.ResidentialName
        ? bnBijoy2Unicode(student.ResidentialName)
        : '',
      image: student.Photo, // Assuming there might be a photo field
    })) || [];

  return (
    <div className="font-bangla  p-4 bg-white text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-0 gap-4 sm:gap-0 bg-white">
        {/* Logo */}
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          {logo && <img src={logo} alt="Logo" className="w-20 h-20 bg-white" />}
        </div>

        {/* Title Section */}
        <div className="text-center flex-1 bg-white">
          <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
            {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
          </h1>
          <p className="text-base font-semibold bg-white">
            {bnBijoy2Unicode(instutionInfo?.Address)}
          </p>
          <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
            ভর্তি রেজিস্টার :{" "}
            {reportData?.[0]?.SessionName
              ? bnBijoy2Unicode(reportData[0].SessionName)
              : ""}
          </div>
        </div>

        {/* Optional right-aligned blank space */}
        <div className="hidden sm:block w-20 h-20 bg-white" />
      </div>

      <div className="flex justify-between items-center mb-4 bg-white">
        <div className="flex gap-2 font-semibold text-base items-center bg-white">
          শ্রেণী/জামাত:{" "}
          {reportData?.[0]?.ClassName
            ? bnBijoy2Unicode(reportData[0].ClassName)
            : ""}
        </div>
        <div className="bg-white">প্রিন্ট {formatDate(new Date())}</div>
      </div>

      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse border border-black bg-white">
          <thead>
            <tr className="bg-white text-sm text-black">
              <th className="border border-black p-2 bg-white">ক্র:</th>
              <th className="border border-black p-2 bg-white">দাখেলা</th>
              <th className="border border-black p-2 bg-white">
                নাম/পিতার নাম
              </th>
              <th className="border border-black p-2 bg-white">
                জন্ম তারিখ/মোবাইল
              </th>
              <th className="border border-black p-2 bg-white">
                এনআইডি/জন্ম নিবন্ধন
              </th>
              <th className="border border-black p-2 bg-white">ঠিকানা</th>
              <th className="border border-black p-2 bg-white">ছবি</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index} className="bg-white">
                <td className="border border-black p-2 text-center bg-white">
                  {row.sl}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.roll}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.studentName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.fatherName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.motherName}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.dob}
                </td>
                <td className="border border-black p-2 text-center bg-white">
                  {row.image ? (
                    <img
                      src={row.image}
                      alt="Student"
                      className="w-10 h-10 object-cover"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImageWithAdmissionRegisterNewOld;
