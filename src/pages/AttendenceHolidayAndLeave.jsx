import React, { useState, useEffect } from 'react';
import { useGetAttendanceListsQuery } from '../features/attendance/attendanceSlice';

// ==========================================
// 1. MOCK DATA GENERATION (SQL টেবিলের স্ট্রাকচার অনুযায়ী)
// ==========================================

// Time_DatePoint Mock Data (Month & Date Info)
const mockDatePoints = Array.from({ length: 31 }, (_, i) => ({
  id: 5000 + i,
  atDate: new Date(2026, 6, i + 1).toISOString().split('T')[0], // 2026-07-01 format
  monthID: 7,
  sessionID: 1
}));

// Time_Attendence Mock Data (Daily logs)
// একজন ইউজারের জন্য এক মাসের অ্যাটেনডেন্স লগ জেনারেট করা
const generateAttendenceLogs = (userId) => {
  return Array.from({ length: 31 }, (_, i) => {
    const rand = Math.random();
    let status = 'P'; // Default Present
    if (rand < 0.15) status = 'A'; // Absent
    else if (rand < 0.25) status = 'L'; // Leave
    else if (rand < 0.30) status = 'H'; // Holiday

    return {
      id: 9000 + i,
      datePointID: 5000 + i,
      userID: userId,
      switchID: 1,
      scheduledTime: '09:00:00',
      startLate: status === 'P' ? (Math.random() > 0.7 ? '00:15:00' : '00:00:00') : null,
      time: status === 'P' ? '09:30:00' : null,
      lateTime: status === 'P' && Math.random() > 0.7 ? '00:15:00' : null,
      deviceID: 'DEV-001',
      status: status // অতিরিক্ত প্রপার্টি
    };
  });
};

// Time_MonthRtpDetails Mock Data (Main Table Data)
const generateMockUsers = () => {
  const names = [
    "কুমার বিশ্বাস অশোক", "জুবায়ের ইসলাম ভূঁইয়া", "তৈয়েব গাজী", "ফাতেমা আক্তার রাহিন",
    "রোজিনা আক্তার", "রাহাত শেখ", "মোঃ জাকির হোসেন", "বিল্লাল খান"
  ];

  return names.map((name, index) => {
    const userId = 101000 + index;
    const attendenceLogs = generateAttendenceLogs(userId);

    // Time_MonthRtpDetails এর D1 - D31 ফিল্ড তৈরির জন্য স্ট্যাটাস ম্যাপ করা
    const days = attendenceLogs.map(log => log.status);

    return {
      sl: index + 1,
      userID: userId,
      name: name, // UI তে দেখানোর জন্য
      years: 2026,
      monthID: 7,
      // এখানে D1 থেকে D31 পর্যন্ত ডেটা ম্যাপ করা হলো (JSON বা Array তে রাখা)
      days: days,
      // UI তে Late/Details দেখানোর জন্য অতিরিক্ত ডেটা
      logs: attendenceLogs
    };
  });
};

// ==========================================
// 2. SVG ICON COMPONENTS (Pure SVG, No Library Needed)
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

const AttendenceHolidayAndLeave = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);


  const { data: attendanceDataList = [] } = useGetAttendanceListsQuery();
  console.log(attendanceDataList, "attendanceDataList")

  // কম্পোনেন্ট লোড হলে মক ডেটা লোড করা (API কলের সিমুলেশন)
  useEffect(() => {
    const data = generateMockUsers();
    setAttendanceData(data);
  }, []);

  // ড্রপডাউন টগল করার ফাংশন
  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  // স্ট্যাটাস পরিবর্তনের ফাংশন (ড্রপডাউন থেকে সিলেক্ট করলে)
  const handleStatusChange = (userId, dayIndex, newStatus) => {
    const updatedData = attendanceData.map(row => {
      if (row.userID === userId) {
        const newDays = [...row.days];
        newDays[dayIndex] = newStatus;
        return { ...row, days: newDays };
      }
      return row;
    });
    setAttendanceData(updatedData);
    setActiveDropdown(null);
  };

  // স্ট্যাটাস অনুযায়ী রেন্ডারিং এবং কালার কোড
  const renderStatus = (status, userId, dayIndex) => {
    const isDropdownOpen = activeDropdown === `${userId}-${dayIndex}`;

    let cellClass = "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full text-xs font-medium cursor-pointer transition-colors duration-200";
    let statusText = "";
    let statusColor = "";

    switch (status) {
      case 'P': statusText = 'P'; statusColor = 'bg-green-500 text-white hover:bg-green-600'; break; // Present
      case 'A': statusText = 'A'; statusColor = 'bg-red-500 text-white hover:bg-red-600'; break; // Absent
      case 'L': statusText = 'L'; statusColor = 'bg-orange-400 text-white hover:bg-orange-500'; break; // Leave
      case 'H': statusText = 'H'; statusColor = 'bg-blue-500 text-white hover:bg-blue-600'; break; // Holiday
      default: statusText = '-'; statusColor = 'bg-gray-200 text-gray-400';
    }

    return (
      <td key={dayIndex} className="relative p-1 border border-gray-200 text-center">
        <div
          className={`${cellClass} ${statusColor}`}
          onClick={() => toggleDropdown(`${userId}-${dayIndex}`)}
        >
          {statusText}
        </div>

        {/* ড্রপডাউন মেনু (স্ট্যাটাস পরিবর্তনের জন্য) */}
        {isDropdownOpen && (
          <div className="absolute z-20 top-10 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-md border border-gray-200 py-1 w-28 min-w-max">
            <button onClick={() => handleStatusChange(userId, dayIndex, 'P')} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span> Present
            </button>
            <button onClick={() => handleStatusChange(userId, dayIndex, 'L')} className="w-full text-left px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400"></span> Leave
            </button>
            <button onClick={() => handleStatusChange(userId, dayIndex, 'H')} className="w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-blue-50 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Holiday
            </button>
            <button onClick={() => handleStatusChange(userId, dayIndex, 'A')} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> Absent
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={() => setActiveDropdown(null)} className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50/30 p-6 font-sans">

      {/* --- Header & Filters Section --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span className="text-lg font-bold text-gray-700">Attendance Overview</span>
          </div>

          {/* SQL Time_DatePoint অনুযায়ী ফিল্টার */}
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500">Year:</span>
            <select className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500">Month (ID):</span>
            <select className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer">
              <option value="7">July (07)</option>
              <option value="6">June (06)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-500">Session:</span>
            <select className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer">
              <option>1 (Morning)</option>
              <option>2 (Evening)</option>
            </select>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors">
          <FilterIcon />
          Apply Filters
        </button>
      </div>

      {/* --- Main Table Container (Time_MonthRtpDetails) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[60px]">SL</th>
                <th className="sticky left-[60px] bg-gray-50 z-10 px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 min-w-[180px]">
                  <div className="flex items-center gap-2"><UserIcon /> UserID / Name</div>
                </th>

                {/* Time_MonthRtpDetails অনুযায়ী D1 to D31 কলাম তৈরি */}
                {Array.from({ length: 31 }, (_, i) => (
                  <th key={i} className="px-1 py-3 text-center text-xs font-semibold text-gray-500 border-r border-gray-100 w-10 md:w-12">
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {attendanceData.map((row, index) => (
                <tr key={row.userID} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/30 transition-colors`}>

                  {/* Sticky Row Data */}
                  <td className="sticky left-0 bg-inherit z-10 px-4 py-2 text-sm text-gray-600 border-r border-gray-200 font-medium">
                    {row.sl}
                  </td>
                  <td className="sticky left-[60px] bg-inherit z-10 px-4 py-2 text-sm text-gray-800 border-r border-gray-200 font-medium">
                    {row.userID} - {row.name}
                  </td>

                  {/* D1 to D31 Data */}
                  {row.days.map((status, dayIndex) => renderStatus(status, row.userID, dayIndex))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-500">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Present</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Leave</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Holiday</div>
      </div>

    </div>
  );
}

export default AttendenceHolidayAndLeave;