import React, { useEffect, useState } from 'react'
import { useGetStudentAttendanceTodayQuery } from '../features/student/studentQuerySlice';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetClassListQuery, useGetSubClassListQuery } from '../features/class/classQuerySlice';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../components/Forms/DefaultInput';

const UserAttendance = () => {
  const methods = useForm();
  const { setValue, watch } = methods;

  const [SessionID, ClassID, AttendenceDate, UserCode] = watch(['SessionID', 'ClassID', "AttendenceDate", "UserCode"]);
  const { data: sessionData = [], isLoading: sessionLoading } = useGetSessionsQuery();
  const { data: classData = [], isLoading: classLoading } = useGetClassListQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const [activeTab, setActiveTab] = useState('present'); // 'present' or 'absent'

  const formattedDate = AttendenceDate
    ? new Date(AttendenceDate).toISOString().split("T")[0]
    : undefined;

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  const { data: attendanceData, isLoading: attendanceLoading, } = useGetStudentAttendanceTodayQuery({
    sessionId: SessionID,
    classId: ClassID,
    date: formattedDate,
  });


  const total = attendanceData?.summary.totalStudent || 0;
  const present = attendanceData?.summary.totalPresent || 0;
  const absent = attendanceData?.summary.totalAbsent || 0;
  const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;

  // Get current tab data
  const currentData = activeTab === 'present'
    ? attendanceData?.presentStudents || []
    : attendanceData?.absentStudents || [];

  // UserCode filter
  const filteredData = UserCode
    ? currentData.filter((item) =>
      String(item.UserCode).toLowerCase().includes(String(UserCode).toLowerCase())
    )
    : currentData;

  const formatTime = (time) => {
    if (!time) return "-";

    const [hour, minute, second] = time.split(":");

    const d = new Date();
    d.setHours(+hour, +minute, +second);

    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const maskPhone = (phone) => {
    if (!phone) return "";
    if (phone.length <= 8) return phone;

    return `${phone.slice(0, 5)}...${phone.slice(-3)}`;
  };


  const isLoading =
    sessionLoading ||
    classLoading ||
    attendanceLoading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
            আজকের উপস্থিতি
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 mb-3">

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <DefaultSelect
              label="Session"
              registerKey="SessionID"
              options={sessionData}
              valueField="SessionID"
              nameField="SessionName"
            />
            <DatePickerOne
              dateCalender="তারিখ"
              registerKey="AttendenceDate"
              require={'তারিখ নির্বাচন করতে হবে'}
            />
            <DefaultSelect
              label="Class"
              registerKey="ClassID"
              options={classData}
              valueField="ClassID"
              nameField="ClassName"
            />
          </div>
        </div>


        {/* Main content: stacks on mobile, row on md+ */}
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">

          {/* Ring + total */}
          <div className="flex items-center gap-4 md:flex-shrink-0">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeDasharray={`${presentPercent}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm md:text-base font-bold text-gray-700">
                  {presentPercent}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-500">মোট শিক্ষার্থী</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{total}</p>
            </div>
          </div>

          {/* Present / Absent stats */}
          <div className="grid grid-cols-2 gap-3 flex-1 w-full">
            <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">উপস্থিত</p>
                <p className="text-base sm:text-lg font-bold text-green-700">{present}</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-red-600 font-medium">অনুপস্থিত</p>
                <p className="text-base sm:text-lg font-bold text-red-700">{absent}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom progress bar */}
        <div className="mt-4 sm:mt-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>উপস্থিতির হার</span>
            <span>{presentPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${presentPercent}%` }}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-6">
          {/* Tab Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setActiveTab('present')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'present'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              উপস্থিত ({present})
            </button>
            <button
              onClick={() => setActiveTab('absent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'absent'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              অনুপস্থিত ({absent})
            </button>
            <div>
              <DefaultInput
                label=""
                registerKey="UserCode"
                placeholder={("সার্চ ইউজার কোড...")}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ইউজার কোড
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    নাম
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    মোবাইল
                  </th>
                  {activeTab === 'present' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        প্রবেশের সময়
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        প্রস্থানের সময়
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((student, index) => (
                    <tr key={student.UserID} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.UserCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {student.UserName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{maskPhone(student.Mobile1)}</span>

                          {student.Mobile1 && (
                            <a
                              href={`tel:${student.Mobile1}`}
                              title="কল করুন"
                              className="text-green-600 hover:text-green-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.56 3.57.56a1 1 0 011 1V21a1 1 0 01-1 1C10.3 22 2 13.7 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.24.19 2.45.56 3.57a1 1 0 01-.24 1.02l-2.2 2.2z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      {activeTab === 'present' && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatTime(student.EntryTime)}

                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatTime(student.ExitTime)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === 'present' ? 6 : 4}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No {activeTab} students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Show count */}
          <div className="mt-3 text-sm text-gray-500">
            Showing {currentData.length} {activeTab} student{currentData.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default UserAttendance
