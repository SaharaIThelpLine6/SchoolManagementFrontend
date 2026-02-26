import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useGetInstitutionInfoQuery } from "../../features/settings/settingsQuerySlice";
import { useGetStudentsVacationListQuery } from "../../features/student/studentQuerySlice";
import {
  enToBnNumber,
  formatDateToBangla,
  formatTimeToBangla,
  getVacationDaysCount,
} from "../../helper/languageFormat";
import bnBijoy2Unicode from "../../utils/conveter";
import { formatNumberToBangla, getVacationDuration } from "../../utils/dayMinutesFormat";
import SvgIcon from "../icons/SvgIcon";

const Print = ({ id }) => {
  const currentPage = 1;

  const {
    data: getStudentsVacationList,
    error: studentsVacationListError,
    isLoading: isStudentsVacationListLoading,
  } = useGetStudentsVacationListQuery({ page: currentPage, limit: 10 });

  const { studentRelation, status } = useSelector((state) => state.settings);

  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();

  console.log(institutionInfo);

  // Combine all loading states
  useEffect(() => {
    if (institutionInfoLoading || isStudentsVacationListLoading) {
      Swal.fire({
        title: 'লোড হচ্ছে...',
        text: 'অনুগ্রহ করে অপেক্ষা করুন',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [institutionInfoLoading, isStudentsVacationListLoading]);

  // Show error if any
  useEffect(() => {
    if (institutionInfoError || studentsVacationListError) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি!',
        text: 'তথ্য লোড করতে ব্যর্থ হয়েছে!',
      });
    }
  }, [institutionInfoError, studentsVacationListError]);

  const [logo, setLogo] = useState(null);
  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);
  // Optional chaining to avoid errors if data is undefined
  const matchedData = getStudentsVacationList?.data?.find(
    (item) => item.ID === id
  );

  const relation = studentRelation.find(
    (r) => r.RelationID === matchedData?.GuardianID
  );

  const vacationDays = getVacationDaysCount(
    matchedData?.VacationDateFrom,
    matchedData?.VacationDateTo
  );

  const banglaVacationDays = enToBnNumber(vacationDays);

  const studentInfo = [
    {
      label: 'শিক্ষার্থীর নাম',
      value: bnBijoy2Unicode(matchedData?.User.UserName) || ' ',
    },
    { label: 'গেইট পাস নং', value: enToBnNumber(matchedData?.ID || '') },
    {
      label: 'পিতার নাম',
      value: bnBijoy2Unicode(matchedData?.User?.FatherName),
      bold: true,
    },
    { label: 'রোল', value: enToBnNumber(matchedData?.User?.UserCode || '') },
  ];

  const studentDataInfo = [
    {
      label: 'শিক্ষার্থীর নাম',
      value: bnBijoy2Unicode(matchedData?.User.UserName) || ' ',
    },
    { label: 'গেইট পাস নং', value: enToBnNumber(matchedData?.ID || '') },
    {
      label: 'পিতার নাম',
      value: bnBijoy2Unicode(matchedData?.User?.FatherName),
      bold: true,
    },
    { label: 'তারিখ', value: formatDateToBangla(matchedData?.CreateAt) || ' ' },
    {
      label: 'শ্রেণি/জামাত',
      value: bnBijoy2Unicode(matchedData?.AcademicClass?.ClassName),
      bold: true,
    },
    { label: 'রোল', value: enToBnNumber(matchedData?.User?.UserCode || '') },
    {
      label: 'ছুটির ধরন',
      value: bnBijoy2Unicode(matchedData?.VacationType?.VacationList),
    },
    { label: 'ছুটির সংখ্যা', value: banglaVacationDays || '0' },
  ];


  // 🔹 হিসাব বের করা
  const { days, minutes } = getVacationDuration(
    matchedData?.VacationDateFrom,
    matchedData?.VacationDateTo,
    matchedData?.VacationTimeFrom,
    matchedData?.VacationTimeTo
  );

  return (
    <div className="max-w-3xl bg-white mx-auto border p-4 text-sm font-SolaimanLipi">
      <div className="border border-black p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <img
            src={logo ? logo : 'https://i.ibb.co/pnQ5nxp/bd-logo.png'}
            alt="Logo"
            className="w-16 h-16 mb-2 rounded-full"
          />
          <div className="text-center mb-2 flex-1">
            <h1 className="text-xl font-bold">
              {bnBijoy2Unicode(institutionInfo?.InstitutionName)}
            </h1>
            <p>{bnBijoy2Unicode(institutionInfo?.Address)}</p>
            <p>{enToBnNumber(institutionInfo?.ContactNumber)}</p>
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
                className={bold ? 'font-extrabold text-black text-base' : ''}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Time Info */}
        <div className="border border-black my-2 text-center text-[12px]">
          {/* Header Row */}
          <div className="grid grid-cols-4 font-bold border-b border-black">
            <div className="border-r border-black p-1"> </div>
            <div className="border-r border-black p-1">প্রস্থান</div>
            <div className="border-r border-black p-1">আগমন</div>
            <div className="p-1">অবস্থান</div>
          </div>

          {/* Date Row */}
          <div className="grid grid-cols-4 border-b border-black">
            <div className="border-r border-black p-1 font-bold">তারিখ</div>
            <div className="border-r border-black p-1">
              {formatDateToBangla(matchedData?.VacationDateFrom) || ''}
            </div>
            <div className="border-r border-black p-1">
              {formatDateToBangla(matchedData?.VacationDateTo) || ''}
            </div>
            <div className="p-1">{formatNumberToBangla(days)} দিন</div>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-4">
            <div className="border-r border-black p-1 font-bold">সময়</div>
            <div className="border-r border-black p-1">
              {formatTimeToBangla(matchedData?.VacationTimeFrom) || ''}
            </div>
            <div className="border-r border-black p-1">
              {formatTimeToBangla(matchedData?.VacationTimeTo) || ''}
            </div>
            <div className="p-1">{formatNumberToBangla(minutes)} মিনিট</div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-2 mb-4">
          <div className="flex flex-row mt-2">
            {' '}
            <p className="font-bold">মন্তব্য : &nbsp;</p>{' '}
            {bnBijoy2Unicode(matchedData?.Comment)}
          </div>
          <div className="border-b border-black h-6"></div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p>অভিভাবক : &nbsp;{relation?.RelationName}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-xl border-b-2 border-black inline-block">
              অনুমতি দেওয়া হলো
            </p>
            <p className="mt-1">
              তারিখ : &nbsp;{formatDateToBangla(matchedData?.CreateAt) || ' '}
            </p>
          </div>
        </div>
      </div>

      {/* Cut Line & Office Copy */}
      <div className="flex items-center my-4">
        <SvgIcon name="FaScissors" size={16} className="mr-2" />

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
                className={bold ? 'font-extrabold text-black text-base' : ''}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 text-center my-2">
          <p>প্রস্থান: {formatDateToBangla(matchedData?.VacationDateFrom)}</p>
          <p>আগমন: {formatDateToBangla(matchedData?.VacationDateTo)}</p>
          <p>{banglaVacationDays} দিন</p>
        </div>
        <p className="mt-4">অভিভাবকের স্বাক্ষর: ___________________</p>
      </div>
    </div>
  );
};

export default Print;
