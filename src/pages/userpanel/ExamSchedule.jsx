import { useGetStudentRoutinesQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const ExamSchedule = () => {
  const { data, isLoading, isError, error } = useGetStudentRoutinesQuery();

  // console.log(data, 'data');

  // লোডিং স্টেট
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">পরীক্ষার রুটিন লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // এরর স্টেট
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-red-700 mb-2">ডেটা লোড করতে সমস্যা</h3>
          <p className="text-red-600 mb-4">
            {error?.data?.message || "দুঃখিত, রুটিন লোড করতে সমস্যা হচ্ছে"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  // ডেটা না থাকলে
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">কোন ডেটা পাওয়া যায়নি</h3>
          <p className="text-gray-600">পরীক্ষার রুটিন এখনো প্রস্তুত হয়নি</p>
        </div>
      </div>
    );
  }

  // Optional chaining ব্যবহার করে ডেটা এক্সেস
  const { student, routine } = data || {};
  const exam = routine?.[0];

  // তারিখগুলি থেকে null বা undefined ফিল্টার করার ফাংশন
  const getValidDates = () => {
    if (!exam) return [];

    const dates = [];
    for(let i = 1; i <= 14; i++) {
      const dateKey = `Date${i}`;
      const dayKey = `Day${i}`;
      const timeKey = `Time${i}`;
      const subjKey = `Subj${i}`;

      if(exam[dateKey] && exam[subjKey]) {
        dates.push({
          date: exam[dateKey],
          day: exam[dayKey],
          time: exam[timeKey],
          subject: exam[subjKey]
        });
      }
    }
    return dates;
  };

  const validDates = getValidDates();

  // তারিখ ফরম্যাট করার ফাংশন
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      {/* হেডার */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-5 text-white mb-6 shadow-lg">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold mb-2">পরীক্ষার রুটিন</h1>
          <div className="text-sm opacity-90 bg-white/20 inline-block px-3 py-1 rounded-full">
            {student?.AcademicSession?.SessionName || '২০২৫-২৬ ইং'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-lg">
              <span className="text-lg">👨‍🎓</span>
            </div>
            <div>
              <p className="font-semibold">
                {student?.User?.UserName || 'ইমন ৩'}
              </p>
              <p className="text-xs opacity-80">
                পিতাঃ {student?.User?.FatherName || 'হাসান'} | মাতাঃ{' '}
                {student?.User?.MotherName || 'জরিনা'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-xs opacity-80">শ্রেণি</p>
              <p className="font-semibold">
                {student?.Class?.ClassName || 'শরহেজামী'}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-xs opacity-80">শাখা</p>
              <p className="font-semibold">{exam?.SubClass || 'শরহেজমী'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* রুটিন টাইম */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">পরীক্ষার সময়সূচী</h2>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            সিরিয়ালঃ {exam?.Serial || '৭'}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">সময়</p>
              <p className="font-semibold text-gray-800">
                {exam?.StartTime?.trim() || 'সকাল'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
              <span className="text-xl">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">বিষয়</p>
              <p className="font-semibold text-gray-800">
                {exam?.Subj1 || 'ইংরেজী ১ম'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* রুটিন টেবিল */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4">
          <h2 className="text-lg font-bold text-white text-center">
            বিস্তারিত রুটিন
          </h2>
        </div>

        {validDates.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {validDates.map((item, index) => (
              <div
                key={index}
                className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center min-w-12">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white font-bold">
                      {index + 1}
                    </div>
                    {/* <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {item.time}
                    </div> */}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-lg mb-1 sm:mb-0">
                        {item.subject}
                      </h3>
                      <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
                        {item.day} ({item.time}{' '}
                        {item.time.includes('সকাল') ? 'AM' : 'PM'})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-medium">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-gray-500">কোন পরীক্ষার রুটিন পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* গুরুত্বপূর্ণ নির্দেশাবলী */}
      {/* <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-lg">
            <span className="text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold">গুরুত্বপূর্ণ নির্দেশাবলী</h3>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>সময়ের ৩০ মিনিট পূর্বে পরীক্ষা কেন্দ্রে উপস্থিত থাকুন</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>প্রয়োজনীয় সামগ্রী (কলম, রুলার, প্রবেশপত্র) সঙ্গে আনুন</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1">•</span>
            <span>মোবাইল ফোন পরীক্ষা কক্ষে নিয়ে প্রবেশ করা নিষেধ</span>
          </li>
        </ul>
      </div> */}

      {/* ফুটার */}
      <div className="mt-6 text-center text-gray-500 text-sm mb-20">
        <p>
          © {new Date().getFullYear()}-{new Date().getFullYear() + 1} ইং | সকল
          অধিকার সংরক্ষিত
        </p>
      </div>
    </div>
  );
};

export default ExamSchedule;
