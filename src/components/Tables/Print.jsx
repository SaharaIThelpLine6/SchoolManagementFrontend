import React from "react";
import { FaScissors } from "react-icons/fa6";
import { useGetStudentsVacationListQuery } from "../../features/student/studentQuerySlice";

const Print = ({ id }) => {
  const currentPage = 1;

  const {
    data: getStudentsVacationList,
    error: studentsVacationListError,
    isLoading: isStudentsVacationListLoading,
  } = useGetStudentsVacationListQuery({ page: currentPage, limit: 10 });

  if (isStudentsVacationListLoading) return <p>Loading...</p>;
  if (studentsVacationListError) return <p>Error loading data</p>;

  // Optional chaining to avoid errors if data is undefined
  const matchedData = getStudentsVacationList?.data?.find(
    (item) => item.ID === id
  );

console.log(matchedData);

  const studentInfo = [
    { label: "শিক্ষার্থীর নাম", value: matchedData?.User.UserName || " " },
    { label: "গেইট পাস নং", value: "১" },
    { label: "পিতার নাম", value: "মোঃ গাজ্জা সালা উদ্দিন", bold: true },
    { label: "রোল", value: "১০০৪" },
  ];

  const studentDataInfo = [
    { label: "শিক্ষার্থীর নাম", value: matchedData?.User.UserName || " " },
    { label: "গেইট পাস নং", value: "১" },
    { label: "পিতার নাম", value: "মোঃ গাজ্জা সালা উদ্দিন", bold: true },
    { label: "তারিখ", value: "২৫/০৫/২০২৫" },
    { label: "শ্রেণি/জামাত", value: "হিফজ", bold: true },
    { label: "রোল", value: "১০০৪" },
    { label: "ছুটির ধরন", value: "লম্বা" },
    { label: "ছুটির সংখ্যা", value: "১" },
  ];
  return (
    <div className="max-w-3xl bg-white mx-auto border p-4 text-sm font-[bangla]">
      <div className="border border-black p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <img
            src="https://i.ibb.co/pnQ5nxp/bd-logo.png"
            alt="Logo"
            className="w-16 h-16 mb-2 rounded-full"
          />
          <div className="text-center mb-2 flex-1">
            <h1 className="text-xl font-bold">টেস্ট মাদ্রাসা ১১০০০</h1>
            <p>সরকারি মুজিব কলেজ রোড, শমসিপুর, টাংগাইল</p>
            <p>০১৯১x-৯৫৮৬৮৬</p>
            <h2 className="text-lg font-bold border-y border-black inline-block px-4 my-2">
              গেইট পাস
            </h2>
            <p className="text-right font-bold">শিক্ষার্থীর কপি</p>
          </div>
        </div>

        {/* Student Info with Fixed Widths */}
        <div className="grid grid-cols-2 gap-2 border-y border-black py-2 text-sm">
          {studentDataInfo.map(({ label, value, bold }, index) => (
            <div key={index} className="flex items-start">
              <span className="w-[110px]">{label}</span>
              <span className="mr-1">:</span>
              <span
                className={bold ? "font-extrabold text-black text-base" : ""}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Time Info */}
        <div className="border border-black my-2">
          <div className="grid grid-cols-4 text-center font-bold border-b border-black">
            <div className="border-r border-black p-1">তারিখ</div>
            <div className="border-r border-black p-1">প্রস্থান</div>
            <div className="border-r border-black p-1">আগমন</div>
            <div className="p-1">অবকাশ</div>
          </div>
          <div className="grid grid-cols-4 text-center">
            <div className="border-r border-black p-1">২৫/০৫/২০২৫</div>
            <div className="border-r border-black p-1">10:51:24 AM</div>
            <div className="border-r border-black p-1">10:51:24 AM</div>
            <div className="p-1">০ মিনিট</div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-2 mb-4">
          <p className="font-bold">উদ্দেশ্য : &nbsp;</p>
          <div className="border-b border-black h-6"></div>
          <p className="font-bold mt-2">মন্তব্য : &nbsp;</p>
          <div className="border-b border-black h-6"></div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p>অভিভাবক : &nbsp;নিজ</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl border-b-2 border-black inline-block">
              অনুমতি দেওয়া হলো
            </p>
            <p className="mt-1">তারিখ : &nbsp;২৫/০৫/২০২৫</p>
          </div>
        </div>
      </div>

      {/* Cut Line & Office Copy */}
      <div className="flex items-center my-4">
        <FaScissors className="mr-2" />
        <div className="flex-grow border-t border-dashed border-black"></div>
      </div>

      <div className="border border-black p-4">
        <p className="text-center font-bold mb-2">অফিস কপি</p>
        <div className="grid grid-cols-2 gap-2 border-y border-black py-2 text-sm">
          {studentInfo.map(({ label, value, bold }, index) => (
            <div key={index} className="flex items-start">
              <span className="w-[110px]">{label}</span>
              <span className="mr-1">:</span>
              <span
                className={bold ? "font-extrabold text-black text-base" : ""}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 text-center my-2">
          <p>প্রস্থান: ২৫/০৫/২০২৫</p>
          <p>আগমন: ২৫/০৫/২০২৫</p>
          <p>০ দিন</p>
        </div>
        <p className="mt-4">অভিভাবকের স্বাক্ষর: ___________________</p>
      </div>
    </div>
  );
};

export default Print;
