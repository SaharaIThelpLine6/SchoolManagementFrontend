import { useEffect, useMemo, useState } from 'react';
import { useGetClassRoutineDaysForUserPanelQuery, useGetGrClassRoutineForUserPanelQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const ClassRoutine = () => {
  const translate = useTranslate();
  /* ============================
     Fetch Days From Backend
  ============================ */
  const { data: dayData = [] } = useGetClassRoutineDaysForUserPanelQuery();
  console.log(dayData, "dayData")


  const {
    data: apiData,
    isLoading,
    isError,
  } = useGetGrClassRoutineForUserPanelQuery();


  const [routineData, setRoutineData] = useState({});
  const [viewMode, setViewMode] = useState('day');
  const [activeDay, setActiveDay] = useState('');

  /* ============================
     Sort Days by DayID
  ============================ */
  const days = useMemo(() => {
    return [...dayData].sort((a, b) => a.DayID - b.DayID);
  }, [dayData]);

  /* ============================
     Set Default Active Day
  ============================ */
  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      setActiveDay(days[0].DayName);
    }
  }, [days, activeDay]);

  /* ============================
     Convert API Data
  ============================ */
  useEffect(() => {
    if (!apiData?.data) return;

    const structuredData = {};

    apiData.data.forEach((item) => {
      const dayName = item.Day?.DayName;

      const timeSlot = `${item.TimeSlot?.StartTime || ''} - ${item.TimeSlot?.EndTime || ''
        }`;

      if (!structuredData[dayName]) structuredData[dayName] = {};

      structuredData[dayName][timeSlot] = {
        subject: item.Subject?.SubjectName || 'N/A',
        teacher: item.Teacher?.UserName || '',
        class: item.Classes?.SubClass || '',
        isBreak: item.IsBreak,
        isSpecial: item.IsSpecial,
        Comment: item.Comment,
      };
    });

    setRoutineData(structuredData);
  }, [apiData]);

  /* ============================
     Get All Unique Time Slots
  ============================ */
  const allTimeSlots = Array.from(
    new Set(Object.values(routineData).flatMap((d) => Object.keys(d)))
  ).sort();


  if (isLoading) return <p className="p-4 text-center">লোড হচ্ছে...</p>;
  if (isError)
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white border border-red-200 rounded-xl shadow-md p-6 text-center max-w-md w-full">
          <div className="text-red-500 text-3xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800">
            ক্লাস রুটিন পাওয়া যায়নি
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            এই সেশনের ক্লাস রুটিন বর্তমানে উপলব্ধ নেই।
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-4 md:p-8 mb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* <h2 className="text-3xl md:text-4xl font-bold text-amber-800">
            Class Routine
          </h2> */}

          {/* <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="bg-white rounded-lg shadow p-1 flex">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'table'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700'
                }`}
              >
                Weekly View
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-md ${
                  viewMode === 'day'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700'
                }`}
              >
                Day View
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow"
            >
              🖨 Print
            </button>
          </div> */}
        </div>
        {/* Day Selector (Dynamic) */}
        {viewMode === 'day' && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day.DayID}
                  onClick={() => setActiveDay(day.DayName)}
                  className={`px-4 py-2 rounded-lg ${activeDay === day.DayName
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-green-100'
                    }`}
                >
                  {day.DayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================
           WEEKLY TABLE VIEW
        ============================ */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white">
            <table className="min-w-[900px] w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-green-700 to-green-900">
                  <th className="px-6 py-4 text-white">Time / Day</th>
                  {days.map((day) => (
                    <th key={day.DayID} className="px-6 py-4 text-white">
                      {day.DayName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {allTimeSlots.map((time) => (
                  <tr key={time}>
                    <td className="px-4 py-3 bg-green-50 font-medium">
                      {time}
                    </td>

                    {days.map((day) => {
                      const classInfo = routineData[day.DayName]?.[time];

                      if (!classInfo)
                        return (
                          <td
                            key={`${day.DayID}-${time}`}
                            className="px-4 py-3 text-center text-gray-400"
                          >
                            -
                          </td>
                        );

                      return (
                        <td key={`${day.DayID}-${time}`} className="px-4 py-3">
                          <div className="p-2 rounded-lg border bg-white">
                            <div className="font-bold text-green-800">
                              {classInfo.subject}
                            </div>

                            {classInfo.teacher && (
                              <div className="text-sm text-gray-600">
                                👤 {classInfo.teacher}
                              </div>
                            )}

                            {classInfo.class && (
                              <div className="text-xs text-gray-500">
                                {classInfo.class}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ============================
             DAY VIEW (Dynamic)
          ============================ */
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-2xl font-bold mb-6">{activeDay} {translate("Schedule")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTimeSlots.map((time) => {
                const classInfo = routineData[activeDay]?.[time];
                if (!classInfo) return null;

                return (
                  <div
                    key={time}
                    className="group font-SolaimanLipi relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 p-5 active:shadow-inner"
                  >
                    {/* Accent Left Border - subtle gradient */}
                    <div className="absolute left-0 top-2 h-10 w-1 bg-gradient-to-b from-green-500 to-emerald-700 rounded-r-full"></div>

                    {/* Time Badge & Header - stacked for mobile clarity */}
                    <div className="flex items-center justify-start gap-3 mb-2 pl-2">
                      <span className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                        {translate('Time')} :
                      </span>
                      <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-green-50 text-green-700 border border-green-200 shadow-sm">
                        {time}
                      </span>
                    </div>

                    {/* Subject - larger touch target */}
                    <div className="flex items-center justify-start gap-3 mb-2 pl-2">
                      <p className="text-sm text-gray-600 py-1.5 font-medium">
                        {translate('Subject')} :
                      </p>
                      <h3 className="text-lg font-bold text-gray-800 group-active:text-green-700 transition-colors duration-200 leading-tight">
                        {classInfo.subject}
                      </h3>
                    </div>

                    {/* Teacher - with better spacing for thumb */}
                    {classInfo.teacher && (
                      <div className="flex items-center justify-start gap-3 mb-2 pl-2">
                        <p className="text-sm text-gray-600 py-1.5 font-medium ">
                          {translate('Teacher')} :
                        </p>
                        <div className="flex items-center gap-3 text-gray-700 font-medium">
                          <span className="text-sm truncate pr-2">
                            {classInfo.teacher}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Comment - larger touch target */}
                    <div className="flex items-center justify-start gap-3 mb-2 pl-2">
                      <p className="text-sm text-gray-600 py-1.5 font-medium">
                        {translate('Comment')} :
                      </p>
                      <p className="text-sm text-gray-600 py-1.5 font-medium">
                        {classInfo.Comment}
                      </p>
                    </div>
                    {/* Hover & touch feedback glow */}
                    <div className="absolute inset-0 rounded-2xl ring-0 group-active:ring-2 group-active:ring-green-200 group-active:ring-opacity-70 transition-all duration-150 pointer-events-none"></div>

                    {/* subtle bottom shadow for depth on mobile */}
                    <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRoutine;
