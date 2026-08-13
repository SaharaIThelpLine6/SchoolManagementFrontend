import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  useGetManualAttendanceListQuery,
  useUpdateAttendanceMutation,
} from '../features/attendance/attendanceSlice';
import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
import DefaultSelect from "../components/Forms/DefaultSelect";
import useTranslate from "../utils/Translate";
import { FormProvider, useForm } from "react-hook-form";
import { liveYears } from '../utils/years';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetAttendanceMonthListsQuery } from '../features/attendance/attendanceSlice';
import { useNavigate } from 'react-router-dom';

// ==========================================
// 1. STATUS CODE MAPPING
// ==========================================
// Time_MonthRtpDetails টেবিলের D1..D31 কলামে থাকা numeric code অনুযায়ী মিনিং:
// 0 = Cancel, 1 = Present, 2 = Leave, 3 = Holiday, 4 = Weekend Off
const STATUS_CODE_MAP = {
  0: 'C',
  1: 'P',
  2: 'L',
  3: 'H',
  4: 'W',
};

// UI status letter থেকে ডাটাবেজ কোড এ ফিরিয়ে নেওয়ার জন্য (আপডেট করার সময় দরকার)
const STATUS_TEXT_TO_CODE = {
  C: 0,
  P: 1,
  L: 2,
  H: 3,
  W: 4,
};

// dropdown মেনুর অপশন লিস্ট (label + code + রঙ)
const STATUS_OPTIONS = [
  { code: 'P', label: 'অপস্থিত', dot: 'bg-green-500' },
  { code: 'C', label: 'অনুপস্থিত', dot: 'bg-red-500' },
  { code: 'L', label: 'ব্যক্তিগত ছুটি', dot: 'bg-orange-400' },
  { code: 'H', label: 'প্রাতিষ্ঠানিক ছুটি', dot: 'bg-blue-500' },
  { code: 'W', label: 'সাপ্তাহিক ছুটি', dot: 'bg-purple-400' },
];

// dropdown মেনুর আনুমানিক সাইজ - flip up/down এবং left/right clamp করার জন্য দরকার
const DROPDOWN_WIDTH = 150;
const DROPDOWN_HEIGHT = 250;
const GAP = 6;

// একটি row (API থেকে আসা raw object) কে D1..D31 keys থেকে days array এ কনভার্ট করা
const extractDaysFromRow = (row) => {
  return Array.from({ length: 31 }, (_, i) => {
    const rawValue = row[`D${i + 1}`];
    if (rawValue === undefined || rawValue === null) return null;
    return STATUS_CODE_MAP[rawValue] ?? null;
  });
};

// API response এর data array কে UI তে ব্যবহারযোগ্য shape এ ট্রান্সফর্ম করা
const transformAttendanceData = (apiData = []) => {
  return apiData.map((row, index) => ({
    sl: row.SL ?? index + 1,
    userID: row.UserID,
    userCode: row.UserCode,
    name: row.UserName,
    fatherName: row.FatherName,
    motherName: row.MotherName,
    mobile: row.Mobile1,
    years: row.Years,
    monthID: row.MonthID,
    days: extractDaysFromRow(row),
  }));
};

// ==========================================
// 2. SVG ICON COMPONENTS
// ==========================================

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const AttendenceHolidayAndLeaveEntry = () => {
  const translate = useTranslate();
  const method = useForm();
  const [attendanceData, setAttendanceData] = useState([]);
  const { data: userType = [] } = useGetUserTypesQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const navigate = useNavigate();

  // dropdown পোর্টাল দিয়ে body তে render হয়
  const [dropdown, setDropdown] = useState(null);
  const dropdownMenuRef = useRef(null);
  const [savingKey, setSavingKey] = useState(null);

  const { watch } = method;
  const [Year, ClassID, SessionID, UserTypeID, MonthID] = watch(["Year", "ClassID", "SessionID", "UserTypeID", "MonthID"]);

  const noFiltersSelected = !Year || !ClassID || !SessionID || !UserTypeID || !MonthID;

  // ==========================================
  // MAIN GRID QUERY (useGetAttendanceListsQuery)
  // D1-D31 পূর্ণ মাসের ডেটা - backend এ এখন এই একই call এ:
  // Student_Admission থেকে students বের করা -> missing RTP rows create করা ->
  // merge করে ফেরত দেওয়া হয়। তাই আলাদা priming call আর দরকার নেই।
  // ==========================================
  const {
    data: attendanceListData,
    isLoading,
    isFetching,
    error,
  } = useGetManualAttendanceListQuery(
    {
      Years: Year,
      ClassID,
      SessionID,
      UserTypeID,
      MonthID,
    },
    {
      skip: noFiltersSelected,
      refetchOnMountOrArgChange: true,
    }
  );

  const { data: attendanceMonthList = [] } = useGetAttendanceMonthListsQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();

  // API response এলেই সেটাকে UI shape এ ট্রান্সফর্ম করে state এ বসানো
  useEffect(() => {
    if (attendanceListData?.data) {
      setAttendanceData(transformAttendanceData(attendanceListData.data));
    } else {
      setAttendanceData([]);
    }
  }, [attendanceListData]);

  // ===================== Outside click / scroll / resize এ dropdown বন্ধ =====================
  useEffect(() => {
    if (!dropdown) return;

    const handleOutsideClick = (e) => {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target)) {
        setDropdown(null);
      }
    };
    const handleScrollOrResize = () => setDropdown(null);

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [dropdown]);

  // সেলে ক্লিক করলে তার exact অবস্থান হিসাব করে dropdown এর জন্য top/left ঠিক করা হয়
  const toggleDropdown = (userId, dayIndex, event) => {
    const key = `${userId}-${dayIndex}`;

    if (dropdown?.key === key) {
      setDropdown(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < DROPDOWN_HEIGHT + GAP;

    let left = rect.left + rect.width / 2 - DROPDOWN_WIDTH / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - DROPDOWN_WIDTH - 8));

    const top = openUp ? rect.top - DROPDOWN_HEIGHT - GAP : rect.bottom + GAP;

    setDropdown({ key, userId, dayIndex, top, left });
  };

  // স্ট্যাটাস পরিবর্তনের ফাংশন - RTP row backend এ merged endpoint দিয়ে আগেই নিশ্চিত
  // করা হয়েছে (create হয়ে গেছে), তাই এখানে সরাসরি updateAttendance (SL, D, value)
  // কল করলেই যথেষ্ট।
  // Optimistic UI update: আগে UI তে বদলে দেখানো হয়, fail হলে rollback।
  const handleStatusChange = async (userId, dayIndex, newStatus) => {
    const targetRow = attendanceData.find((r) => r.userID === userId);
    if (!targetRow) return;

    const previousDays = targetRow.days;
    const key = `${userId}-${dayIndex}`;

    // ১. Optimistic UI update
    const updatedData = attendanceData.map((row) => {
      if (row.userID === userId) {
        const newDays = [...row.days];
        newDays[dayIndex] = newStatus;
        return { ...row, days: newDays };
      }
      return row;
    });
    setAttendanceData(updatedData);
    setDropdown(null);
    setSavingKey(key);

    // ২. Backend আপডেট কল
    try {
      const result = await updateAttendance({
        SL: targetRow.sl,
        D: dayIndex + 1,
        value: STATUS_TEXT_TO_CODE[newStatus],
        MonthID,
        Years: Year
      }).unwrap();

      console.log("Attendance Update Success:", result);
    } catch (err) {
      console.error("Attendance Update Error:", err);

      // ৩. ব্যর্থ হলে UI আগের অবস্থায় ফিরিয়ে নেওয়া (rollback)
      setAttendanceData((prev) =>
        prev.map((row) =>
          row.userID === userId ? { ...row, days: previousDays } : row
        )
      );
    } finally {
      setSavingKey(null);
    }
  };

  // স্ট্যাটাস অনুযায়ী রেন্ডারিং এবং কালার কোড
  const renderStatus = (status, userId, dayIndex) => {
    let cellClass = "w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-[10px] md:text-xs font-medium cursor-pointer transition-colors duration-200";
    let statusText = "";
    let statusColor = "";
    const isSaving = savingKey === `${userId}-${dayIndex}`;

    switch (status) {
      case 'P': statusText = 'P'; statusColor = 'bg-green-500 text-white hover:bg-green-600'; break;
      case 'L': statusText = 'L'; statusColor = 'bg-orange-400 text-white hover:bg-orange-500'; break;
      case 'H': statusText = 'H'; statusColor = 'bg-blue-500 text-white hover:bg-blue-600'; break;
      case 'W': statusText = 'W'; statusColor = 'bg-purple-400 text-white hover:bg-purple-500'; break;
      case 'C': statusText = 'C'; statusColor = 'bg-red-500 text-white hover:bg-red-600'; break;
      default: statusText = '-'; statusColor = 'bg-gray-200 text-gray-400';
    }

    return (
      <td key={dayIndex} className="p-0.5 border border-gray-200 text-center">
        <div
          className={`${cellClass} ${statusColor} mx-auto ${isSaving ? 'opacity-50 cursor-wait' : ''}`}
          onClick={(e) => !isSaving && toggleDropdown(userId, dayIndex, e)}
        >
          {statusText}
        </div>
      </td>
    );
  };

  const showLoading = isLoading || isFetching;
  const handleAttendanceNewEntry = () => {
    navigate("/user-attendence/shift-attendance-entry");
  };

  return (
    <FormProvider {...method}>
      <div className="min-h-screen bg-blue-50/30 p-6 font-sans">

        {/* --- Header & Filters Section (Sticky/Fixed on scroll) --- */}
        <div className="sticky top-0 z-30 bg-blue-50/95 backdrop-blur-sm pb-2 -mx-6 px-6 pt-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span className="text-lg font-bold text-gray-700">Attendance</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <DefaultSelect
                  label="সাল"
                  options={liveYears}
                  valueField="ID"
                  nameField="YearName"
                  registerKey="Year"
                  placeholder="সাল নির্বাচন করুন"
                />
                <DefaultSelect
                  label={translate("Month")}
                  options={attendanceMonthList ?? []}
                  valueField="MonthID"
                  nameField="MonthName"
                  registerKey="MonthID"
                  placeholder={translate("Select Month Name")}
                />
                <DefaultSelect
                  label="ইউজার ধরণ"
                  options={userType ?? []}
                  valueField="ID"
                  nameField="TypeName"
                  registerKey="UserTypeID"
                  placeholder={translate("Select User Type")}
                />
                <DefaultSelect
                  label={translate("Session")}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                  placeholder={translate("Select Session")}
                />
                <DefaultSelect
                  label={translate("Class")}
                  options={classData ?? []}
                  valueField="ClassID"
                  nameField="ClassName"
                  registerKey="ClassID"
                  placeholder={translate("Select User Type")}
                />
              </div>
            </div>
            <button
              onClick={handleAttendanceNewEntry}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
            >
              <FilterIcon />
              Attendance
            </button>
          </div>
        </div>

        {/* --- Main Table Container (Time_MonthRtpDetails) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

          {noFiltersSelected ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              তথ্য দেখতে সাল, মাস, ইউজার ধরণ, সেশন ও ক্লাস নির্বাচন করুন
            </div>
          ) : showLoading ? (
            <div className="p-10 text-center text-gray-400 text-sm">লোড হচ্ছে...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-400 text-sm">ডেটা লোড করতে সমস্যা হয়েছে</div>
          ) : attendanceData.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">কোনো তথ্য পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                  <tr>
                    <th className="sticky left-0 bg-gray-50 z-20 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[60px]">SL</th>
                    <th className="sticky left-[60px] bg-gray-50 z-20 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[220px]">
                      <div className="flex items-center gap-2"><UserIcon /> UserID / Name</div>
                    </th>

                    {Array.from({ length: 31 }, (_, i) => (
                      <th key={i} className="px-1 py-3 text-center text-xs font-semibold text-gray-500 border-r border-gray-100 w-8 md:w-9">
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {attendanceData.map((row, index) => (
                    <tr key={row.userID} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/30 transition-colors`}>

                      <td className="sticky left-0 bg-inherit z-10 px-4 py-1.5 text-sm text-gray-600 border-r border-gray-200 font-medium">
                        {row.sl}
                      </td>
                      <td className="sticky left-[60px] bg-inherit z-10 px-4 py-1.5 text-sm text-gray-800 border-r border-gray-200 font-medium">
                        {row.userCode} - {row.name}
                      </td>

                      {row.days.map((status, dayIndex) => renderStatus(status, row.userID, dayIndex))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span>অপস্থিত</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span>অনুপস্থিত</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span>ব্যক্তিগত ছুটি</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span>প্রাতিষ্ঠানিক ছুটি </div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-400"></span>সাপ্তাহিক ছুটি</div>
        </div>

      </div>

      {/* ===================== Dropdown Menu (Portal) ===================== */}
      {dropdown && createPortal(
        <div
          ref={dropdownMenuRef}
          style={{ position: 'fixed', top: dropdown.top, left: dropdown.left, width: DROPDOWN_WIDTH }}
          className="z-50 bg-white shadow-xl rounded-md border border-gray-200 py-1"
        >
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleStatusChange(dropdown.userId, dropdown.dayIndex, opt.code)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className={`w-3 h-3 rounded-full ${opt.dot}`}></span> {opt.label}
            </button>
          ))}
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => setDropdown(null)}
            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
          >
            Close
          </button>
        </div>,
        document.body
      )}
    </FormProvider>
  );
}

export default AttendenceHolidayAndLeaveEntry;
