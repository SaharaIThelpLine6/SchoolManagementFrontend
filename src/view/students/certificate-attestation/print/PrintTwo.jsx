import { useEffect, useState } from 'react';
import {
  useGetExamNamesQuery,
  useGetStudentsTransferCertificateQuery
} from '../../../../features/student/studentQuerySlice';
import { formatDate } from '../../../../helper/formatTime';
import bnBijoy2Unicode from '../../../../utils/conveter';

const PrintTwo = ({ id, studentData }) => {
  const [cfidCode, setCfidCode] = useState('');

  const { data: stcData = [], isLoading: isStcLoading } =
    useGetStudentsTransferCertificateQuery();
  const { data: examNamesData = [], isLoading: isExamNamesLoading } =
    useGetExamNamesQuery();

  const cfidData = stcData?.find((i) => i.CFID === id);
  const examData = examNamesData?.find((i) => i.ExamID === cfidData?.ExamID);

  useEffect(() => {
    if (cfidData?.User?.UserCode) {
      setCfidCode(cfidData.User.UserCode);
    }
  }, [cfidData]);

  return (
    <div className="w-full h-auto mx-auto px-12 py-10 font-[kalpurush] text-[16px] leading-[32px] text-black border border-black">
      {/* Top Section: Serial & Date */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <span>ক্রমিক:</span>
          <div className="border border-black w-12 text-center">১</div>
        </div>
        <div>{formatDate(new Date())}</div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <span className="border border-black px-6 py-1 text-[18px] font-bold">
          প্রত্যয়নপত্র
        </span>
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
          {studentData?.ClassName || '------'}
        </span>
        জামাতে অধ্যায়ন করেছে।
        <span className=" border-b border-black w-20 mx-2 text-center">
          {examData?.ExamName ? bnBijoy2Unicode(examData.ExamName) : '------'}
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
  );
};

export default PrintTwo;
