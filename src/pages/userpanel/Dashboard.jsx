import { Buffer } from 'buffer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import {
  useGeAllReportsQuery,
  useGetUserDetailsQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
const isDashboardAllowed =
  import.meta.env.VITE_USERPANEL_DASHBOARD_PERMISSION === 'true';
const Dashboard = () => {
  console.log(isDashboardAllowed, 'isDashboardAllowed');
  const { schoolid } = useParams();
  const dispatch = useDispatch();

  useGetUserDetailsQuery();
  useGeAllReportsQuery();

  const { schoolData } = useSelector((state) => state.studentResultPublicView);

  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, schoolid]);

  const bufferConveter = (bufferData) => {
    if (!bufferData) return '/logo.png';
    const buffer = Buffer.from(bufferData);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  };
  /* ===== COMMON CLASSES (IMAGE LIKE) ===== */
  const cardClass =
    'bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center py-2';

  const titleClass = 'text-sm font-semibold text-blue-700 mt-1';

  return (
    <main className="min-h-screen pt-4 pb-24 relative z-10">
      <div className="container mx-auto px-3">
        {/* ===== MENU GRID ===== */}
        {/* only for main */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {isDashboardAllowed ? (
            <>
              <Link
                to={`/${schoolid}/dashboard/student-results`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto text-indigo-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                  </svg>
                </div>
                <h4 className={titleClass}>ফলাফল ও মার্কশীট</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/home-work`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-align-box-left-stretch text-pink-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                    <path d="M9 17h-2" />
                    <path d="M13 12h-6" />
                    <path d="M11 7h-4" />
                  </svg>
                </div>
                <h4 className={titleClass}>হোমওয়ার্ক / বাড়ির কাজ</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/user_reports`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto text-purple-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                  </svg>
                </div>
                <h4 className={titleClass}>চারিত্রিক রিপোর্ট</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/exam-routine`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-address-book text-yellow-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M20 6v12a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2z" />
                    <path d="M10 16h6" />
                    <path d="M13 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M4 8h3" />
                    <path d="M4 12h3" />
                    <path d="M4 16h3" />
                  </svg>
                </div>
                <h4 className={titleClass}>পরীক্ষার রুটিন</h4>
              </Link>
              <Link to={`/${schoolid}/dashboard/reports`} className={cardClass}>
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM19 14.9 14.9 19H9.1L5 14.9V9.1L9.1 5h5.8L19 9.1v5.8z"></path>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M11 7h2v7h-2z"></path>
                  </svg>
                </div>
                <h4 className={titleClass}>অভিযোগ ও পরামর্শ </h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/video-tutorial`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1.2em"
                    width="1.2em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 5.75C3 4.78 3.78 4 4.75 4h14.5C20.22 4 21 4.78 21 5.75v12.5c0 .97-.78 1.75-1.75 1.75H4.75C3.78 20 3 19.22 3 18.25V5.75z" />
                    <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff" />
                  </svg>
                </div>

                <h4 className={titleClass}>ক্লাস ভিডিও</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/institution-contact`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-phone text-sky-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                  </svg>
                </div>
                <h4 className={titleClass}>যোগাযোগ</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/class-routine`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-600"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />

                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />

                    <line x1="3" y1="10" x2="21" y2="10" />

                    <rect x="7" y="13" width="3" height="3" rx="0.5" />
                    <rect x="12" y="13" width="3" height="3" rx="0.5" />
                    <rect x="17" y="13" width="3" height="3" rx="0.5" />
                  </svg>
                </div>
                <h4 className={titleClass}>ক্লাস রুটিন</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/monthly-fee`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16.5 15.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                    <path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5"></path>
                    <path d="M8 11h6"></path>
                  </svg>
                </div>
                <h4 className={titleClass}>মাসিক ফি</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/notice`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M880 112c-3.8 0-7.7.7-11.6 2.3L292 345.9H128c-8.8 0-16 7.4-16 16.6v299c0 9.2 7.2 16.6 16 16.6h101.6c-3.7 11.6-5.6 23.9-5.6 36.4 0 65.9 53.8 119.5 120 119.5 55.4 0 102.1-37.6 115.9-88.4l408.6 164.2c3.9 1.5 7.8 2.3 11.6 2.3 16.9 0 32-14.2 32-33.2V145.2C912 126.2 897 112 880 112zM344 762.3c-26.5 0-48-21.4-48-47.8 0-11.2 3.9-21.9 11-30.4l84.9 34.1c-2 24.6-22.7 44.1-47.9 44.1z"></path></svg>
                </div>

                <h4 className={titleClass}>নোটিশ</h4>
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/${schoolid}/dashboard/student-results`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto text-indigo-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                  </svg>
                </div>
                <h4 className={titleClass}>ফলাফল ও মার্কশীট</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/home-work`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-align-box-left-stretch text-pink-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                    <path d="M9 17h-2" />
                    <path d="M13 12h-6" />
                    <path d="M11 7h-4" />
                  </svg>
                </div>
                <h4 className={titleClass}>হোমওয়ার্ক / ডায়েরী</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/user_reports`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto text-purple-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                    <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                  </svg>
                </div>
                <h4 className={titleClass}>চারিত্রিক রিপোর্ট</h4>
              </Link>
              <Link to="#" className={cardClass}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-calendar-week text-blue-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M4 11h16" />
                    <path d="M7 14h.013" />
                    <path d="M10.01 14h.005" />
                    <path d="M13.01 14h.005" />
                    <path d="M16.015 14h.005" />
                    <path d="M13.015 17h.005" />
                    <path d="M7.01 17h.005" />
                    <path d="M10.01 17h.005" />
                  </svg>
                </div>
                <h4 className={titleClass}>উপস্থিতি</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/exam-routine`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-address-book text-yellow-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M20 6v12a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2z" />
                    <path d="M10 16h6" />
                    <path d="M13 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                    <path d="M4 8h3" />
                    <path d="M4 12h3" />
                    <path d="M4 16h3" />
                  </svg>
                </div>
                <h4 className={titleClass}>পরীক্ষার রুটিন</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/class-routine`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-violet-600"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />

                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />

                    <line x1="3" y1="10" x2="21" y2="10" />

                    <rect x="7" y="13" width="3" height="3" rx="0.5" />
                    <rect x="12" y="13" width="3" height="3" rx="0.5" />
                    <rect x="17" y="13" width="3" height="3" rx="0.5" />
                  </svg>
                </div>
                <h4 className={titleClass}>ক্লাস রুটিন</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/institution-contact`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={26}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-phone text-sky-600"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                  </svg>
                </div>
                <h4 className={titleClass}>যোগাযোগ</h4>
              </Link>

              <Link
                to={`/${schoolid}/dashboard/online-admission`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-600"
                  >
                    <path d="M373.253 420.837h199.885c53.836 0 97.485 43.649 97.485 97.485v3.277c0 53.836-43.649 97.485-97.485 97.485h-235.93c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48h235.93c76.458 0 138.445-61.987 138.445-138.445v-3.277c0-76.458-61.987-138.445-138.445-138.445H373.253c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z" />
                    <path d="M383.508 327.771l-56.771 56.771c-7.998 7.998-7.998 20.965 0 28.963s20.965 7.998 28.963 0l56.771-56.771c7.998-7.998 7.998-20.965 0-28.963s-20.965-7.998-28.963 0z" />
                    <path d="M411.082 442.929l-56.771-56.771c-7.998-7.998-20.965-7.998-28.963 0s-7.998 20.965 0 28.963l56.771 56.771c7.998 7.998 20.965 7.998 28.963 0s7.998-20.965 0-28.963zM844.624 744.6c-97.118 59.062-208.301 91.552-324.507 93.318-116.348 1.775-228.612-27.381-327.557-83.572-9.835-5.586-22.337-2.14-27.922 7.695s-2.14 22.337 7.695 27.922c105.253 59.773 224.708 90.798 348.407 88.91 123.55-1.877 241.858-36.449 345.167-99.276 9.664-5.877 12.734-18.476 6.857-28.14s-18.476-12.734-28.14-6.857z" />
                    <path d="M203.064 775.993l58.081-304.159c2.122-11.11-5.165-21.836-16.275-23.958s-21.836 5.165-23.958 16.275L162.831 768.31c-2.122 11.11 5.165 21.836 16.275 23.958s21.836-5.165 23.958-16.275zm563.293-310.701l69.458 301.404c2.54 11.022 13.534 17.898 24.556 15.358s17.898-13.534 15.358-24.556l-69.458-301.404c-2.54-11.022-13.534-17.898-24.556-15.358s-17.898 13.534-15.358 24.556z" />
                    <path d="M491.911 187.885c10.569-4.522 30.524-4.785 41.192-.547L967.339 359.51l-186.378 80.555c-10.383 4.487-15.161 16.542-10.674 26.924s16.542 15.161 26.924 10.674l203.561-87.982c32.262-13.948 31.734-48.4-.938-61.349L548.211 149.266c-20.713-8.228-51.897-7.818-72.405.956L23.984 343.304c-32.394 13.828-31.871 48.323.923 61.176l208.613 81.717c10.532 4.125 22.413-1.068 26.539-11.6s-1.068-22.413-11.6-26.539L57.827 373.385l434.082-185.501z" />
                    <path d="M983.919 363.184v296.233c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V363.184c0-11.311-9.169-20.48-20.48-20.48s-20.48 9.169-20.48 20.48z" />
                  </svg>
                </div>
                <h4 className={titleClass}>অনলাইন ভর্তি</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/monthly-fee`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M16.5 15.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                    <path d="M7 7a2 2 0 1 1 4 0v9a3 3 0 0 0 6 0v-.5"></path>
                    <path d="M8 11h6"></path>
                  </svg>
                </div>
                <h4 className={titleClass}>মাসিক ফি</h4>
              </Link>
              <Link to={`/${schoolid}/dashboard/reports`} className={cardClass}>
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fill="none" d="M0 0h24v24H0V0z"></path>
                    <path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM19 14.9 14.9 19H9.1L5 14.9V9.1L9.1 5h5.8L19 9.1v5.8z"></path>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M11 7h2v7h-2z"></path>
                  </svg>
                </div>
                <h4 className={titleClass}>অভিযোগ ও পরামর্শ </h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/video-tutorial`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 24 24"
                    height="1.2em"
                    width="1.2em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M3 5.75C3 4.78 3.78 4 4.75 4h14.5C20.22 4 21 4.78 21 5.75v12.5c0 .97-.78 1.75-1.75 1.75H4.75C3.78 20 3 19.22 3 18.25V5.75z" />
                    <path d="M10 8.5v7l6-3.5-6-3.5z" fill="#fff" />
                  </svg>
                </div>

                <h4 className={titleClass}>ক্লাস ভিডিও</h4>
              </Link>
              <Link
                to={`/${schoolid}/dashboard/notice`}
                className={cardClass}
              >
                <div className="w-10 h-10 rounded-full bg-[#c0dbfd] flex items-center justify-center mb-2">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M880 112c-3.8 0-7.7.7-11.6 2.3L292 345.9H128c-8.8 0-16 7.4-16 16.6v299c0 9.2 7.2 16.6 16 16.6h101.6c-3.7 11.6-5.6 23.9-5.6 36.4 0 65.9 53.8 119.5 120 119.5 55.4 0 102.1-37.6 115.9-88.4l408.6 164.2c3.9 1.5 7.8 2.3 11.6 2.3 16.9 0 32-14.2 32-33.2V145.2C912 126.2 897 112 880 112zM344 762.3c-26.5 0-48-21.4-48-47.8 0-11.2 3.9-21.9 11-30.4l84.9 34.1c-2 24.6-22.7 44.1-47.9 44.1z"></path></svg>
                </div>

                <h4 className={titleClass}>নোটিশ</h4>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
