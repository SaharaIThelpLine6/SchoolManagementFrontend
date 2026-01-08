import { useState } from 'react';
import { useGetHomeWorksUserPanelQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';

/* 🔹 Skeleton UI */
const SkeletonAccordion = () => (
  <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

/* 🔹 Homework Accordion Item */
const HomeworkAccordionItem = ({ homework, index, isOpen, onToggle }) => {
  // বাংলা দিনের নাম বের করা
  const createDate = new Date(homework.CreateAt);
  const dayName = createDate.toLocaleDateString('bn-BD', {
    weekday: 'long',
  });
  const formattedDate = createDate.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mb-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden">
      <button
        className="w-full p-4 text-left focus:outline-none"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {/* Number Badge */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-900">
                {homework.Subject?.SubjectName || 'বিষয়'}
              </h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{formattedDate}</span>
                <span className="text-blue-600 font-semibold">({dayName})</span>
              </span>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {homework.Session?.SessionName || 'সেশন'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                {homework.SubClass?.SubClass || 'শ্রেণী'}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                👨‍🏫 {homework.Teacher?.User?.UserName?.split(' ')[0] || 'শিক্ষক'}
              </span>
            </div>
          </div>

          {/* Arrow Icon */}
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-100 pt-4">
            {/* Teacher Info Card */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {homework.Teacher?.User?.UserName || 'শিক্ষকের নাম'}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {homework.Teacher?.User?.Mobile1 && (
                      <a
                        href={`tel:${homework.Teacher.User.Mobile1}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {homework.Teacher.User.Mobile1}
                      </a>
                    )}
                    {homework.Teacher?.User?.Email && (
                      <a
                        href={`mailto:${homework.Teacher.User.Email}`}
                        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        ইমেইল
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Class Work */}
            {homework.ClassWork && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900">ক্লাসের কাজ</h4>
                </div>
                <div className="pl-10">
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-gray-800 leading-relaxed">
                      {homework.ClassWork}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Home Work */}
            {homework.HomeWork && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-900">বাড়ির কাজ</h4>
                </div>
                <div className="pl-10">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-gray-800 leading-relaxed">
                      {homework.HomeWork}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const HomeWorkUserPanel = () => {
  const { data: homeWorksData, isLoading } = useGetHomeWorksUserPanelQuery();
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const homeworks = homeWorksData || [];

  /* 🔹 Skeleton UI */
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg w-48 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-32 mx-auto" />
        </div>
        <div className="space-y-3">
          <SkeletonAccordion />
          <SkeletonAccordion />
          <SkeletonAccordion />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          হোমওয়ার্ক তালিকা
        </h1>
        <p className="text-gray-600">
          মোট{' '}
          <span className="font-bold text-blue-600">{homeworks.length}টি</span>{' '}
          হোমওয়ার্ক
        </p>
      </div>

      {/* No Homework Message */}
      {homeworks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            কোনো হোমওয়ার্ক নেই
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            এখন পর্যন্ত কোনো হোমওয়ার্ক দেওয়া হয়নি। পরবর্তীতে আবার চেক করুন।
          </p>
        </div>
      ) : (
        /* Homework List */
        <div className="space-y-3">
          {homeworks.map((homework, index) => (
            <HomeworkAccordionItem
              key={homework.HWID || index}
              homework={homework}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      {homeworks.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              একটি এ্যাকর্ডিয়ন খোলা থাকলে অন্যটি ক্লিক করলে আগেরটি বন্ধ হবে
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeWorkUserPanel;
