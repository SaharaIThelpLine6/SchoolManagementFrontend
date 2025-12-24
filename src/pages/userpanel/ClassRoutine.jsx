import { useState } from 'react';

const ClassRoutine = () => {
  // Days of the week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Time slots
  const timeSlots = [
    'Fajr - 6:00 AM',
    '8:00 - 9:30 AM',
    '9:30 - 11:00 AM',
    '11:00 - 12:30 PM',
    'Zohr - 1:30 PM',
    '3:00 - 4:30 PM',
    'Asr - 4:30 PM',
    'Maghrib - 6:30 PM',
    'Isha - 8:00 PM'
  ];

  // Example class routine data
  const [routineData, setRoutineData] = useState({
    Sunday: {
      'Fajr - 6:00 AM': { subject: 'Quran Memorization', teacher: 'Shaykh Ahmed', class: 'Level 1' },
      '8:00 - 9:30 AM': { subject: 'Arabic Grammar', teacher: 'Ustadh Hassan', class: 'Level 2' },
      '9:30 - 11:00 AM': { subject: 'Fiqh', teacher: 'Dr. Abdullah', class: 'Level 3' },
      '11:00 - 12:30 PM': { subject: 'Hadith Studies', teacher: 'Ustadh Mahmoud', class: 'Level 4' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Tajweed', teacher: 'Ustadha Fatima', class: 'Level 1' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Islamic History', teacher: 'Dr. Yusuf', class: 'Level 3' },
      'Isha - 8:00 PM': { subject: 'Tafsir', teacher: 'Shaykh Ibrahim', class: 'Level 4' }
    },
    Monday: {
      'Fajr - 6:00 AM': { subject: 'Quran Recitation', teacher: 'Ustadha Aisha', class: 'Level 1' },
      '8:00 - 9:30 AM': { subject: 'Arabic Vocabulary', teacher: 'Ustadh Hassan', class: 'Level 2' },
      '9:30 - 11:00 AM': { subject: 'Seerah', teacher: 'Dr. Abdullah', class: 'Level 3' },
      '11:00 - 12:30 PM': { subject: 'Aqeedah', teacher: 'Shaykh Ahmed', class: 'Level 4' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Quran Memorization', teacher: 'Ustadha Fatima', class: 'Level 2' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Fiqh', teacher: 'Dr. Yusuf', class: 'Level 3' },
      'Isha - 8:00 PM': { subject: 'Hadith Studies', teacher: 'Shaykh Ibrahim', class: 'Level 4' }
    },
    Tuesday: {
      'Fajr - 6:00 AM': { subject: 'Tajweed', teacher: 'Shaykh Ahmed', class: 'Level 1' },
      '8:00 - 9:30 AM': { subject: 'Islamic Ethics', teacher: 'Ustadh Hassan', class: 'Level 2' },
      '9:30 - 11:00 AM': { subject: 'Quran Memorization', teacher: 'Dr. Abdullah', class: 'Level 3' },
      '11:00 - 12:30 PM': { subject: 'Fiqh', teacher: 'Shaykh Ahmed', class: 'Level 4' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Arabic Grammar', teacher: 'Ustadha Fatima', class: 'Level 1' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Tafsir', teacher: 'Dr. Yusuf', class: 'Level 3' },
      'Isha - 8:00 PM': { subject: 'Islamic History', teacher: 'Shaykh Ibrahim', class: 'Level 4' }
    },
    Wednesday: {
      'Fajr - 6:00 AM': { subject: 'Hadith Studies', teacher: 'Ustadha Aisha', class: 'Level 1' },
      '8:00 - 9:30 AM': { subject: 'Fiqh', teacher: 'Ustadh Hassan', class: 'Level 2' },
      '9:30 - 11:00 AM': { subject: 'Arabic Grammar', teacher: 'Dr. Abdullah', class: 'Level 3' },
      '11:00 - 12:30 PM': { subject: 'Seerah', teacher: 'Shaykh Ahmed', class: 'Level 4' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Quran Recitation', teacher: 'Ustadha Fatima', class: 'Level 2' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Aqeedah', teacher: 'Dr. Yusuf', class: 'Level 3' },
      'Isha - 8:00 PM': { subject: 'Quran Memorization', teacher: 'Shaykh Ibrahim', class: 'Level 4' }
    },
    Thursday: {
      'Fajr - 6:00 AM': { subject: 'Islamic History', teacher: 'Shaykh Ahmed', class: 'Level 1' },
      '8:00 - 9:30 AM': { subject: 'Tafsir', teacher: 'Ustadh Hassan', class: 'Level 2' },
      '9:30 - 11:00 AM': { subject: 'Islamic Ethics', teacher: 'Dr. Abdullah', class: 'Level 3' },
      '11:00 - 12:30 PM': { subject: 'Arabic Vocabulary', teacher: 'Shaykh Ahmed', class: 'Level 4' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Seerah', teacher: 'Ustadha Fatima', class: 'Level 1' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Hadith Studies', teacher: 'Dr. Yusuf', class: 'Level 3' },
      'Isha - 8:00 PM': { subject: 'Fiqh', teacher: 'Shaykh Ibrahim', class: 'Level 4' }
    },
    Friday: {
      'Fajr - 6:00 AM': { subject: 'Jumuah Preparation', teacher: 'All Teachers', class: 'All' },
      '8:00 - 9:30 AM': { subject: 'Jumuah Lecture', teacher: 'Guest Speaker', class: 'All' },
      '9:30 - 11:00 AM': { subject: 'Community Service', teacher: 'All Staff', class: 'All' },
      '11:00 - 12:30 PM': { subject: 'Jumuah Prayer', teacher: '', class: 'All' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Quran Circle', teacher: 'All Teachers', class: 'All' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Family Time', teacher: '', class: 'All' },
      'Isha - 8:00 PM': { subject: 'Weekly Review', teacher: 'All Teachers', class: 'All' }
    },
    Saturday: {
      'Fajr - 6:00 AM': { subject: 'Weekend Program', teacher: 'Ustadha Aisha', class: 'Level 1-2' },
      '8:00 - 9:30 AM': { subject: 'Weekend Program', teacher: 'Dr. Abdullah', class: 'Level 3-4' },
      '9:30 - 11:00 AM': { subject: 'Islamic Arts', teacher: 'Ustadh Hassan', class: 'All' },
      '11:00 - 12:30 PM': { subject: 'Youth Activities', teacher: 'All Staff', class: 'All' },
      'Zohr - 1:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      '3:00 - 4:30 PM': { subject: 'Sports/Recreation', teacher: 'Coach Malik', class: 'All' },
      'Asr - 4:30 PM': { subject: 'Prayer Break', teacher: '', class: 'All' },
      'Maghrib - 6:30 PM': { subject: 'Free Time', teacher: '', class: 'All' },
      'Isha - 8:00 PM': { subject: 'Weekly Planning', teacher: 'All Teachers', class: 'Staff' }
    }
  });

  // State for active day
  const [activeDay, setActiveDay] = useState('Monday');

  // State for view mode: 'table' or 'day'
  const [viewMode, setViewMode] = useState('table');

  // Madrasah information
  const madrasahInfo = {
    name: "Al-Huda Islamic Academy",
    address: "123 Knowledge Street, Madinah District",
    phone: "+1 (555) 123-4567",
    email: "info@alhudaacademy.edu",
    principal: "Shaykh Muhammad Al-Amin"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
            {madrasahInfo.name}
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-lg text-gray-700 mb-2">{madrasahInfo.address}</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-600">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {madrasahInfo.phone}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {madrasahInfo.email}
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Principal: {madrasahInfo.principal}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-800 mb-4 md:mb-0">Class Routine</h2>

            <div className="flex space-x-4">
              {/* View mode toggle */}
              <div className="bg-white rounded-lg shadow p-1 flex">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md transition ${viewMode === 'table' ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-2 rounded-md transition ${viewMode === 'day' ? 'bg-green-600 text-white' : 'text-gray-700'}`}
                >
                  Day View
                </button>
              </div>

              {/* Print button */}
              <button
                onClick={() => window.print()}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow flex items-center transition"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Day selector for day view */}
        {viewMode === 'day' && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Select Day:</h3>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-2 rounded-lg transition ${activeDay === day ? 'bg-green-700 text-white' : 'bg-white text-gray-700 hover:bg-green-100'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Routine Table - Weekly View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl shadow-2xl bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-green-700 to-green-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Time / Day
                  </th>
                  {days.map((day) => (
                    <th key={day} className="px-6 py-4 text-left text-sm font-semibold text-white">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSlots.map((time) => (
                  <tr key={time} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-green-50">
                      {time}
                    </td>
                    {days.map((day) => {
                      const classInfo = routineData[day][time];
                      return (
                        <td key={`${day}-${time}`} className="px-6 py-4">
                          {classInfo.subject === 'Prayer Break' || classInfo.subject === 'Free Time' ? (
                            <div className="text-center py-2 bg-amber-50 rounded-lg border border-amber-200">
                              <span className="text-amber-700 font-medium">{classInfo.subject}</span>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-lg border border-green-100 shadow-sm">
                              <div className="font-bold text-green-800">{classInfo.subject}</div>
                              <div className="text-sm text-gray-600 mt-1">Teacher: {classInfo.teacher}</div>
                              <div className="text-xs text-gray-500 mt-1">Class: {classInfo.class}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Day View */
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-green-900 px-8 py-6">
              <h3 className="text-2xl font-bold text-white">{activeDay} Schedule</h3>
              <p className="text-green-100">Full day schedule for {activeDay}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {timeSlots.map((time) => {
                  const classInfo = routineData[activeDay][time];
                  const isPrayerBreak = classInfo.subject.includes('Prayer') || classInfo.subject.includes('Break');
                  const isSpecial = classInfo.subject.includes('Jumuah') || classInfo.subject.includes('Weekend');

                  return (
                    <div
                      key={time}
                      className={`rounded-xl p-5 shadow-lg border ${isPrayerBreak ? 'bg-amber-50 border-amber-200' : isSpecial ? 'bg-purple-50 border-purple-200' : 'bg-white border-green-100'}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className={`font-bold ${isPrayerBreak ? 'text-amber-700' : isSpecial ? 'text-purple-700' : 'text-green-700'}`}>
                          {time}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {classInfo.class}
                        </span>
                      </div>

                      <h4 className={`text-lg font-bold mb-2 ${isPrayerBreak ? 'text-amber-800' : isSpecial ? 'text-purple-800' : 'text-gray-800'}`}>
                        {classInfo.subject}
                      </h4>

                      {classInfo.teacher && (
                        <div className="flex items-center text-gray-600 mb-1">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          <span>{classInfo.teacher}</span>
                        </div>
                      )}

                      {isPrayerBreak && (
                        <div className="flex items-center text-amber-600 mt-3">
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">Prayer time - break</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-10 mb-20 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Schedule Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-3"></div>
              <span className="text-gray-700">Regular Class</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded mr-3"></div>
              <span className="text-gray-700">Prayer Break / Free Time</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-50 border border-purple-200 rounded mr-3"></div>
              <span className="text-gray-700">Special Programs</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="mt-10 pt-6 border-t border-gray-200 text-center text-gray-600">
          <p>© {new Date().getFullYear()} {madrasahInfo.name}. All rights reserved.</p>
          <p className="text-sm mt-2">This schedule is subject to change. Please verify with administration for updates.</p>
        </div> */}
      </div>
    </div>
  );
};

export default ClassRoutine;
