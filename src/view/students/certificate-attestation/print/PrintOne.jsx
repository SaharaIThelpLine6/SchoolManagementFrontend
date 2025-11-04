import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import {
  useGetExamNamesQuery,
  useGetStudentsTransferCertificateQuery
} from "../../../../features/student/studentQuerySlice";
import { formatDate } from "../../../../helper/formatTime";
import bnBijoy2Unicode from "../../../../utils/conveter";
import RightLeft from "/printview/rightLeft.png";
import TopBottom from "/printview/topBottom.png";

const PrintOne = ({ id, title, studentData }) => {
  const [cfidCode, setCfidCode] = useState('');
  const [logo, setLogo] = useState(null);

  const { data: stcData = [], isLoading: isStcLoading } =
    useGetStudentsTransferCertificateQuery();
  const { data: examNamesData = [], isLoading: isExamNamesLoading } =
    useGetExamNamesQuery();

  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  const cfidData = stcData?.find((i) => i.CFID === id);
  const examData = examNamesData?.find((i) => i.ExamID === cfidData?.ExamID);
  console.log(examData, 'examData');
  console.log(examNamesData, 'examNamesData');
  console.log(cfidData?.ExamID, 'cfidData?.ExamID');

  useEffect(() => {
    if (instutionInfo?.Logo?.data) {
      const buffer = Buffer.from(instutionInfo.Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [instutionInfo]);

  useEffect(() => {
    if (cfidData?.User?.UserCode) {
      setCfidCode(cfidData.User.UserCode);
    }
  }, [cfidData]);

  return (
    <div className="h-auto mx-auto relative bg-white text-black font-sanskrit overflow-hidden shadow-md print:border-none">
      {/* Top Border */}
      <img
        src={TopBottom}
        alt="Top Border"
        className="absolute top-0 left-0 w-full h-[32px] object-cover"
      />

      {/* Bottom Border */}
      <img
        src={TopBottom}
        alt="Bottom Border"
        className="absolute bottom-0 left-0 w-full h-[32px] object-cover rotate-180"
      />

      {/* Left Border */}
      <img
        src={RightLeft}
        alt="Left Border"
        className="absolute top-0 left-0 h-full w-[32px] object-cover"
      />

      {/* Right Border */}
      <img
        src={RightLeft}
        alt="Right Border"
        className="absolute top-0 right-0 h-full w-[32px] object-cover rotate-180"
      />

      {/* Main Content */}
      <div className="relative z-10 px-20 py-16">
        <div className="flex items-center justify-between mb-6">
          {/* Logo */}
          <img src={logo} alt="Logo" className="w-20 h-20" />

          {/* Title Section */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-extrabold">
              {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
            </h1>
            <p className="text-sm">{bnBijoy2Unicode(instutionInfo?.Address)}</p>
            <p className="text-sm mb-2">{instutionInfo?.ContactNumber}</p>
            <div className="text-white bg-black px-6 py-1 inline-block text-lg rounded font-bold tracking-widest">
              {title}
            </div>
          </div>

          {/* Empty space for symmetry or optional right-aligned logo/QR/etc */}
          <div className="w-20 h-20" />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2 items-center">
            <span>ক্রমিক:</span>
            <div className="border border-black w-12 text-center">১</div>
          </div>
          <div>{formatDate(new Date())}</div>
        </div>

        {/* Body Content */}
        <div className="space-y-4">
          <p>
            এই মর্মে প্রত্যয়ন করা যাইতেছে যে,
            <span className="inline-block border-b border-black w-64 ml-2">
              {cfidData?.User?.UserName || '------'}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-y-2 gap-x-10">
            <p>
              পিতা:
              <span className="inline-block border-b border-black w-60 ml-2">
                {cfidData?.User?.FatherName || '------'}
              </span>
            </p>
            <p>
              মাতা:
              <span className="inline-block border-b border-black w-60 ml-2">
                {cfidData?.User?.MotherName || '------'}
              </span>
            </p>
            <p>
              গ্রাম:
              <span className="inline-block border-b border-black w-60 ml-2">
                {studentData?.permanentVill || '------'}
              </span>
            </p>
            <p>
              ডাক:
              <span className="inline-block border-b border-black w-60 ml-2">
                {studentData?.permanentPost || '------'}
              </span>
            </p>
            <p>
              থানা:
              <span className="inline-block border-b border-black w-60 ml-2">
                {studentData?.PoliceStationName || '------'}
              </span>
            </p>
            <p>
              জেলা:
              <span className="inline-block border-b border-black w-60 ml-2">
                {studentData?.PermanentDistrictName || '------'}
              </span>
            </p>
          </div>

          <p>
            ভর্তির রেজিস্ট্রি অনুযায়ী তাহার :
            <span className="inline-block border-b border-black w-28 mx-2 text-center">
              {cfidCode || '------'}
            </span>
            এবং জন্ম তারিখ:
            <span className="inline-block border-b border-black w-40 ml-2 text-center">
              {studentData?.DateOfBirth || '------'}
            </span>
            সে অত্র বিদ্যালয়ে
            <span className="inline-block border-b border-black w-28 mx-2 text-center">
              {studentData?.SessionName || '------'}
            </span>
            ইং শিক্ষাবর্ষে
            <span className="inline-block border-b border-black w-28 mx-2 text-center">
              {bnBijoy2Unicode(studentData?.ClassName) || '------'}
            </span>
            জামাতে অধ্যায়ন করেছে।
            <span className=" border-b border-black w-20 mx-2 text-center">
              {examData?.ExamName
                ? bnBijoy2Unicode(examData.ExamName)
                : '------'}
            </span>
            তাহার মোট নম্বর
            <span className="inline-block border-b border-black w-20 mx-2 text-center">
              {cfidData?.TotalMark || '------'}
            </span>
            এবং
            <span className="inline-block border-b border-black w-12 mx-2 text-center">
              {cfidData?.DivisionName || '------'}
            </span>
            বিভাগ পেয়ে উত্তীর্ণ হইয়াছে।
          </p>

          <p className="mt-4 text-justify">
            অত্র প্রতিষ্ঠানে অধ্যয়নরত অবস্থায় তাহার আচার-আচরণ ছিল সন্তোষজনক।
            আমাদের জানা মতে সে কোন রাষ্ট্রদ্রোহী কার্যকলাপে জড়িত না। আমরা তাহার
            উজ্জল ভবিষ্যৎ ও সর্বাঙ্গীন মঙ্গল কামনা করি।
          </p>
        </div>

        <div className="border-t border-black my-1"></div>
        <div className="border-t border-black mb-10"></div>
        {/* Bottom Line */}

        {/* Footer Signature */}
        <div className="flex justify-between text-center">
          <div className="w-1/3">
            <div className="border-t border-black w-40 mx-auto"></div>
            প্রধান
          </div>
          <div className="w-1/3">
            <div className="border-t border-black w-40 mx-auto"></div>
            সীল
          </div>
          <div className="w-1/3">
            <div className="border-t border-black w-40 mx-auto"></div>
            স্বাক্ষর
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintOne;
