import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import DefaultModal from '../components/DefaultModal';
import DefaultSideDrawer from '../components/DefaultSideDrawer';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { fetchResultFieldData } from '../features/studentResultPublicView/studentResultPublicViewSlice';
import { useGetUserDetailsQuery } from '../features/userPanel/userInfo/userInfoQuerySlice';
import { useVerifyUserPanelTokenMutation } from '../features/userPanel/userLoginVerify/userloginVerifyQuerySlice';
import { showModal, showSideBarModal } from '../utils/ModalControlar';
// import { subscribeUser } from "../pushNotifications";
import DropdownNotification from '../components/Header/DropdownNotification';
import Loading from '../components/Loading/Loading';
import {
  useNotificationListQuery,
  useSubscribeNotificationMutation,
} from '../features/userPanel/panelNotification/panelNotificationQuerySlice';
import avatar from '/avatar.png';
import logo from '/saharaItlogo.png';

const WEB_PUSH_PUBLIC_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY;
export default function UserPanel({ children }) {
  const token = localStorage.getItem('user_panel_token');
  console.log(token);

  const [verifyToken] = useVerifyUserPanelTokenMutation();
  const { schoolid } = useParams();

  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const currentPath = location.pathname.replace(`/${schoolid}/dashboard/`, '');
  const currentPathDashboard = location.pathname.replace(`/${schoolid}/`, '');
  console.log(currentPath, 'location');

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setLoading(false);
        setIsValid(false);
        return;
      }
      console.log('cjheck tokwen false');

      try {
        console.log('cjheck tokwen false');

        const res = await verifyToken({ token }).unwrap();
        console.log(
          'ashfdashfashfas ashfdiash fawfhasuif asfasihfas fasfh asifh as'
        );
        // console.log(res.id);
        if (res.schoolId == schoolid && res.id) {
          setIsValid(true);
        } else {
          localStorage.removeItem('user_panel_token');
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem('user_panel_token');
        setIsValid(false);
      }

      setLoading(false);
    }

    checkToken();
  }, []);

  const dispatch = useDispatch();

  const [sessionName, setSessionName] = useState(null);
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery(currentSession);
  const {
    data: notificationList,
    isLoading: isNotificationListLoading,
    isError: isNotificationListError,
  } = useNotificationListQuery(currentSession);

  const [
    subscribeUser,
    { isLoading, isError, isSuccess, data: newApplicationResponse },
  ] = useSubscribeNotificationMutation();

  useEffect(() => {
    console.log('user usee effect');

    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setTimeout(async () => {
          if (!('Notification' in window)) {
            console.log('This browser does not support notifications.');
            return;
          }

          if (!('serviceWorker' in navigator)) {
            console.log('Service workers are not supported by your browser.');
            return;
          }
          const permission = Notification.permission;
          if (permission === 'granted') {
            console.log('Notifications already enabled.');
            return;
          }

          if (permission === 'denied') {
            console.log('Notifications were previously denied.');
            return;
          }
          try {
            const register = await navigator.serviceWorker.register('/sw.js');

            const subscription = await register.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: WEB_PUSH_PUBLIC_KEY,
            });
            subscribeUser(subscription);

            console.log('Successfully subscribed for notifications!');
          } catch (error) {
            console.error('Failed to subscribe:', error);
          }
        }, 2000);
      }
    }
  }, []);

  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);
  const { data: sessionsData } = useGetSessionsQuery();

  useEffect(() => {
    if (!sessionsData) return;

    const activeSession =
      sessionsData.find((s) => s.SessionID == currentSession) ??
      sessionsData.find((s) => s.SessionStatus == 1);

    setSessionName(activeSession?.SessionName ?? 'N/A');
  }, [currentSession, sessionsData]);

  const handleTypeModal = useCallback(() => {
    showModal('Type', 'SESSION_CHANGE_MODEL');
  }, []);
  const handleProfileModal = useCallback(() => {
    showSideBarModal('', 'USER_PANEL_PROFILE_VIEW');
  }, []);
  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return '/logo.png';
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString('base64');
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };

  // sessionsData.find(s => s.SessionStatus === 1)
  // sessionsData
  if (loading) return <Loading />;

  if (!isValid) return <Navigate to={`/${schoolid}/login`} replace />;

  return (
    <div className="font-SolaimanLipi bg-[#c5e1fd]">
      {/* লোগোকে background image হিসেবে right top এ দেখানোর জন্য নতুন div যোগ করুন */}
      <div
        className="fixed top-0 w-100 h-100 opacity-20 pointer-events-none z-0"
        style={{
          left: '10%',
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top right',
          backgroundSize: 'contain',
        }}
      />

      <header className="px-2 text-black shadow-[0_0px_10px_rgba(0,0,0,0.25)] relative z-[9999] print:hidden">
        <div className="container mx-auto">
          <div className=" py-4">
            <div className="flex items-center justify-between gap-[10px]">
              <div className="flex gap-3 items-center notice_header_area">
                {/* Logo */}
                <img
                  className="w-13 h-13 rounded-full object-cover border-2 border-sky-300 shadow-sm"
                  src={bufferConveter(schoolData?.Logo?.data)}
                  alt={schoolData?.InstitutionName}
                />

                {/* School Name */}
                <div className="text-base font-semibold text-gray-800">
                  {schoolData?.InstitutionName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* <div className="icon text-white-600 py-1 px-1 rounded-[4px] relative">
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
                    className="icon icon-tabler icons-tabler-outline icon-tabler-bell"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                    <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
                  </svg>
                  <div className="unread_notification_count absolute text-red-600 bg-red-200 h-[22px] w-[22px] rounded-full flex items-center justify-center -top-[6px] -right-[6px] text-[12px] font-bold">
                    10
                  </div>
                </div> */}
                <DropdownNotification notificationList={notificationList} />
                <div className="icon text-red-600 py-1 px-1">
                  <Link to={`/${schoolid}/dashboard/profile-details`}>
                    <img
                      src={
                        userDetails?.Image
                          ? bufferConveter(userDetails?.Image)
                          : avatar
                      }
                      className="w-12 h-12 max-w-12 object-cover border-2 border-green-600 rounded-full"
                      alt="profile"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <button onClick={subscribeUser}>
      Enable Notifications
    </button> */}
      </header>
      <Outlet />

      {/* <div className="mobile_footer_menu shadow-[0_0_10px_rgba(0,0,0,0.25)] bg-white py-2 fixed w-full bottom-0 z-9999">
        <div className="grid grid-cols-3">
          <Link to={`/${schoolid}/dashboard`} className="text-center">
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="2em"
                width="2em"
                xmlns="http://www.w3.org/2000/svg"
                className={`icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-dollar mx-auto ${
                  currentPathDashboard === 'dashboard' ? 'text-blue-500' : ''
                } `}
              >
                <path d="M3 12C3 12.5523 3.44772 13 4 13H10C10.5523 13 11 12.5523 11 12V4C11 3.44772 10.5523 3 10 3H4C3.44772 3 3 3.44772 3 4V12ZM3 20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V16C11 15.4477 10.5523 15 10 15H4C3.44772 15 3 15.4477 3 16V20ZM13 20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11H14C13.4477 11 13 11.4477 13 12V20ZM14 3C13.4477 3 13 3.44772 13 4V8C13 8.55228 13.4477 9 14 9H20C20.5523 9 21 8.55228 21 8V4C21 3.44772 20.5523 3 20 3H14Z"></path>
              </svg>
            </div>
            <p
              className={`${
                currentPathDashboard === 'dashboard' ? 'text-blue-500' : ''
              }`}
            >
              হোম
            </p>
          </Link>
          <Link
            to={`/${schoolid}/dashboard/student-payment-history`}
            className="text-center"
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 576 512"
                height="2em"
                width="2em"
                xmlns="http://www.w3.org/2000/svg"
                className={`icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-dollar mx-auto ${
                  currentPath === 'student-payment-history'
                    ? 'text-blue-500'
                    : ''
                } `}
              >
                <path d="M124.7 201.8c.1-11.8 0-23.5 0-35.3v-35.3c0-1.3.4-2 1.4-2.7 11.5-8 24.1-12.1 38.2-11.1 12.5.9 22.7 7 28.1 21.7 3.3 8.9 4.1 18.2 4.1 27.7 0 8.7-.7 17.3-3.4 25.6-5.7 17.8-18.7 24.7-35.7 23.9-11.7-.5-21.9-5-31.4-11.7-.9-.8-1.4-1.6-1.3-2.8zm154.9 14.6c4.6 1.8 9.3 2 14.1 1.5 11.6-1.2 21.9-5.7 31.3-12.5.9-.6 1.3-1.3 1.3-2.5-.1-3.9 0-7.9 0-11.8 0-4-.1-8 0-12 0-1.4-.4-2-1.8-2.2-7-.9-13.9-2.2-20.9-2.9-7-.6-14-.3-20.8 1.9-6.7 2.2-11.7 6.2-13.7 13.1-1.6 5.4-1.6 10.8.1 16.2 1.6 5.5 5.2 9.2 10.4 11.2zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zm-207.5 23.9c.4 1.7.9 3.4 1.6 5.1 16.5 40.6 32.9 81.3 49.5 121.9 1.4 3.5 1.7 6.4.2 9.9-2.8 6.2-4.9 12.6-7.8 18.7-2.6 5.5-6.7 9.5-12.7 11.2-4.2 1.1-8.5 1.3-12.9.9-2.1-.2-4.2-.7-6.3-.8-2.8-.2-4.2 1.1-4.3 4-.1 2.8-.1 5.6 0 8.3.1 4.6 1.6 6.7 6.2 7.5 4.7.8 9.4 1.6 14.2 1.7 14.3.3 25.7-5.4 33.1-17.9 2.9-4.9 5.6-10.1 7.7-15.4 19.8-50.1 39.5-100.3 59.2-150.5.6-1.5 1.1-3 1.3-4.6.4-2.4-.7-3.6-3.1-3.7-5.6-.1-11.1 0-16.7 0-3.1 0-5.3 1.4-6.4 4.3-.4 1.1-.9 2.3-1.3 3.4l-29.1 83.7c-2.1 6.1-4.2 12.1-6.5 18.6-.4-.9-.6-1.4-.8-1.9-10.8-29.9-21.6-59.9-32.4-89.8-1.7-4.7-3.5-9.5-5.3-14.2-.9-2.5-2.7-4-5.4-4-6.4-.1-12.8-.2-19.2-.1-2.2 0-3.3 1.6-2.8 3.7zM242.4 206c1.7 11.7 7.6 20.8 18 26.6 9.9 5.5 20.7 6.2 31.7 4.6 12.7-1.9 23.9-7.3 33.8-15.5.4-.3.8-.6 1.4-1 .5 3.2.9 6.2 1.5 9.2.5 2.6 2.1 4.3 4.5 4.4 4.6.1 9.1.1 13.7 0 2.3-.1 3.8-1.6 4-3.9.1-.8.1-1.6.1-2.3v-88.8c0-3.6-.2-7.2-.7-10.8-1.6-10.8-6.2-19.7-15.9-25.4-5.6-3.3-11.8-5-18.2-5.9-3-.4-6-.7-9.1-1.1h-10c-.8.1-1.6.3-2.5.3-8.2.4-16.3 1.4-24.2 3.5-5.1 1.3-10 3.2-15 4.9-3 1-4.5 3.2-4.4 6.5.1 2.8-.1 5.6 0 8.3.1 4.1 1.8 5.2 5.7 4.1 6.5-1.7 13.1-3.5 19.7-4.8 10.3-1.9 20.7-2.7 31.1-1.2 5.4.8 10.5 2.4 14.1 7 3.1 4 4.2 8.8 4.4 13.7.3 6.9.2 13.9.3 20.8 0 .4-.1.7-.2 1.2-.4 0-.8 0-1.1-.1-8.8-2.1-17.7-3.6-26.8-4.1-9.5-.5-18.9.1-27.9 3.2-10.8 3.8-19.5 10.3-24.6 20.8-4.1 8.3-4.6 17-3.4 25.8zM98.7 106.9v175.3c0 .8 0 1.7.1 2.5.2 2.5 1.7 4.1 4.1 4.2 5.9.1 11.8.1 17.7 0 2.5 0 4-1.7 4.1-4.1.1-.8.1-1.7.1-2.5v-60.7c.9.7 1.4 1.2 1.9 1.6 15 12.5 32.2 16.6 51.1 12.9 17.1-3.4 28.9-13.9 36.7-29.2 5.8-11.6 8.3-24.1 8.7-37 .5-14.3-1-28.4-6.8-41.7-7.1-16.4-18.9-27.3-36.7-30.9-2.7-.6-5.5-.8-8.2-1.2h-7c-1.2.2-2.4.3-3.6.5-11.7 1.4-22.3 5.8-31.8 12.7-2 1.4-3.9 3-5.9 4.5-.1-.5-.3-.8-.4-1.2-.4-2.3-.7-4.6-1.1-6.9-.6-3.9-2.5-5.5-6.4-5.6h-9.7c-5.9-.1-6.9 1-6.9 6.8zM493.6 339c-2.7-.7-5.1 0-7.6 1-43.9 18.4-89.5 30.2-136.8 35.8-14.5 1.7-29.1 2.8-43.7 3.2-26.6.7-53.2-.8-79.6-4.3-17.8-2.4-35.5-5.7-53-9.9-37-8.9-72.7-21.7-106.7-38.8-8.8-4.4-17.4-9.3-26.1-14-3.8-2.1-6.2-1.5-8.2 2.1v1.7c1.2 1.6 2.2 3.4 3.7 4.8 36 32.2 76.6 56.5 122 72.9 21.9 7.9 44.4 13.7 67.3 17.5 14 2.3 28 3.8 42.2 4.5 3 .1 6 .2 9 .4.7 0 1.4.2 2.1.3h17.7c.7-.1 1.4-.3 2.1-.3 14.9-.4 29.8-1.8 44.6-4 21.4-3.2 42.4-8.1 62.9-14.7 29.6-9.6 57.7-22.4 83.4-40.1 2.8-1.9 5.7-3.8 8-6.2 4.3-4.4 2.3-10.4-3.3-11.9zm50.4-27.7c-.8-4.2-4-5.8-7.6-7-5.7-1.9-11.6-2.8-17.6-3.3-11-.9-22-.4-32.8 1.6-12 2.2-23.4 6.1-33.5 13.1-1.2.8-2.4 1.8-3.1 3-.6.9-.7 2.3-.5 3.4.3 1.3 1.7 1.6 3 1.5.6 0 1.2 0 1.8-.1l19.5-2.1c9.6-.9 19.2-1.5 28.8-.8 4.1.3 8.1 1.2 12 2.2 4.3 1.1 6.2 4.4 6.4 8.7.3 6.7-1.2 13.1-2.9 19.5-3.5 12.9-8.3 25.4-13.3 37.8-.3.8-.7 1.7-.8 2.5-.4 2.5 1 4 3.4 3.5 1.4-.3 3-1.1 4-2.1 3.7-3.6 7.5-7.2 10.6-11.2 10.7-13.8 17-29.6 20.7-46.6.7-3 1.2-6.1 1.7-9.1.2-4.7.2-9.6.2-14.5z"></path>
              </svg>
            </div>
            <p
              className={`${
                currentPath === 'student-payment-history' ? 'text-blue-500' : ''
              }`}
            >
              পেমেন্ট
            </p>
          </Link>
          <Link
            to={`/${schoolid}/dashboard/profile-details`}
            className="text-center cursor-pointer"
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="2em"
                width="2em"
                xmlns="http://www.w3.org/2000/svg"
                className={`icon icon-tabler icons-tabler-outline icon-tabler-user-square mx-auto ${
                  currentPath === 'profile-details' ? 'text-blue-500' : ''
                }`}
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9ZM14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
                  fill="currentColor"
                ></path>
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM3 12C3 14.0902 3.71255 16.014 4.90798 17.5417C6.55245 15.3889 9.14627 14 12.0645 14C14.9448 14 17.5092 15.3531 19.1565 17.4583C20.313 15.9443 21 14.0524 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12ZM12 21C9.84977 21 7.87565 20.2459 6.32767 18.9878C7.59352 17.1812 9.69106 16 12.0645 16C14.4084 16 16.4833 17.1521 17.7538 18.9209C16.1939 20.2191 14.1881 21 12 21Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <p
              className={`${
                currentPath === 'profile-details' ? 'text-blue-500' : ''
              }`}
            >
              প্রোফাইল
            </p>
          </Link>
        </div>
      </div> */}
      <div className="mobile_footer_menu shadow-[0_0_10px_rgba(0,0,0,0.25)] bg-white py-2 fixed w-full bottom-0 z-50 print:hidden">
        <div className="grid grid-cols-3 items-center">
          {/* হোম লিঙ্ক */}
          <Link to={`/${schoolid}/dashboard`} className="text-center">
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="2em"
                width="2em"
                xmlns="http://www.w3.org/2000/svg"
                className={`icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-dollar mx-auto ${currentPathDashboard === 'dashboard' ? 'text-blue-500' : ''
                  }`}
              >
                <path d="M3 12C3 12.5523 3.44772 13 4 13H10C10.5523 13 11 12.5523 11 12V4C11 3.44772 10.5523 3 10 3H4C3.44772 3 3 3.44772 3 4V12ZM3 20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V16C11 15.4477 10.5523 15 10 15H4C3.44772 15 3 15.4477 3 16V20ZM13 20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11H14C13.4477 11 13 11.4477 13 12V20ZM14 3C13.4477 3 13 3.44772 13 4V8C13 8.55228 13.4477 9 14 9H20C20.5523 9 21 8.55228 21 8V4C21 3.44772 20.5523 3 20 3H14Z"></path>
              </svg>
            </div>
            <p
              className={`text-xs mt-1 ${currentPathDashboard === 'dashboard' ? 'text-blue-500' : ''
                }`}
            >
              হোম
            </p>
          </Link>

          {/* Payment লিঙ্ক - বৃত্তাকার বাটন */}
          <div className="flex justify-center relative">
            <Link
              // to={`/${schoolid}/dashboard/student-payment-history`}
              to={`/${schoolid}/dashboard`}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 -mt-8 border-4 border-white mb-4 bg-gray"
            >
              <img
                src="https://media.istockphoto.com/id/828088276/de/vektor/qr-code-illustration.jpg?s=612x612&w=0&k=20&c=L7Jd-LaeDqSC29RfvZkh-UTgI5g0g6PCDFS-VxhO44I="
                alt="QR"
                className="w-full h-full object-cover rounded-full"
              />
              {/* <svg
                stroke="white"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 576 512"
                height="2.5em"
                width="2.5em"
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  currentPath === 'student-payment-history' ? 'scale-110' : ''
                } transition-transform duration-200`}
              >
                <path d="M124.7 201.8c.1-11.8 0-23.5 0-35.3v-35.3c0-1.3.4-2 1.4-2.7 11.5-8 24.1-12.1 38.2-11.1 12.5.9 22.7 7 28.1 21.7 3.3 8.9 4.1 18.2 4.1 27.7 0 8.7-.7 17.3-3.4 25.6-5.7 17.8-18.7 24.7-35.7 23.9-11.7-.5-21.9-5-31.4-11.7-.9-.8-1.4-1.6-1.3-2.8zm154.9 14.6c4.6 1.8 9.3 2 14.1 1.5 11.6-1.2 21.9-5.7 31.3-12.5.9-.6 1.3-1.3 1.3-2.5-.1-3.9 0-7.9 0-11.8 0-4-.1-8 0-12 0-1.4-.4-2-1.8-2.2-7-.9-13.9-2.2-20.9-2.9-7-.6-14-.3-20.8 1.9-6.7 2.2-11.7 6.2-13.7 13.1-1.6 5.4-1.6 10.8.1 16.2 1.6 5.5 5.2 9.2 10.4 11.2zM576 80v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48h480c26.5 0 48 21.5 48 48zm-207.5 23.9c.4 1.7.9 3.4 1.6 5.1 16.5 40.6 32.9 81.3 49.5 121.9 1.4 3.5 1.7 6.4.2 9.9-2.8 6.2-4.9 12.6-7.8 18.7-2.6 5.5-6.7 9.5-12.7 11.2-4.2 1.1-8.5 1.3-12.9.9-2.1-.2-4.2-.7-6.3-.8-2.8-.2-4.2 1.1-4.3 4-.1 2.8-.1 5.6 0 8.3.1 4.6 1.6 6.7 6.2 7.5 4.7.8 9.4 1.6 14.2 1.7 14.3.3 25.7-5.4 33.1-17.9 2.9-4.9 5.6-10.1 7.7-15.4 19.8-50.1 39.5-100.3 59.2-150.5.6-1.5 1.1-3 1.3-4.6.4-2.4-.7-3.6-3.1-3.7-5.6-.1-11.1 0-16.7 0-3.1 0-5.3 1.4-6.4 4.3-.4 1.1-.9 2.3-1.3 3.4l-29.1 83.7c-2.1 6.1-4.2 12.1-6.5 18.6-.4-.9-.6-1.4-.8-1.9-10.8-29.9-21.6-59.9-32.4-89.8-1.7-4.7-3.5-9.5-5.3-14.2-.9-2.5-2.7-4-5.4-4-6.4-.1-12.8-.2-19.2-.1-2.2 0-3.3 1.6-2.8 3.7zM242.4 206c1.7 11.7 7.6 20.8 18 26.6 9.9 5.5 20.7 6.2 31.7 4.6 12.7-1.9 23.9-7.3 33.8-15.5.4-.3.8-.6 1.4-1 .5 3.2.9 6.2 1.5 9.2.5 2.6 2.1 4.3 4.5 4.4 4.6.1 9.1.1 13.7 0 2.3-.1 3.8-1.6 4-3.9.1-.8.1-1.6.1-2.3v-88.8c0-3.6-.2-7.2-.7-10.8-1.6-10.8-6.2-19.7-15.9-25.4-5.6-3.3-11.8-5-18.2-5.9-3-.4-6-.7-9.1-1.1h-10c-.8.1-1.6.3-2.5.3-8.2.4-16.3 1.4-24.2 3.5-5.1 1.3-10 3.2-15 4.9-3 1-4.5 3.2-4.4 6.5.1 2.8-.1 5.6 0 8.3.1 4.1 1.8 5.2 5.7 4.1 6.5-1.7 13.1-3.5 19.7-4.8 10.3-1.9 20.7-2.7 31.1-1.2 5.4.8 10.5 2.4 14.1 7 3.1 4 4.2 8.8 4.4 13.7.3 6.9.2 13.9.3 20.8 0 .4-.1.7-.2 1.2-.4 0-.8 0-1.1-.1-8.8-2.1-17.7-3.6-26.8-4.1-9.5-.5-18.9.1-27.9 3.2-10.8 3.8-19.5 10.3-24.6 20.8-4.1 8.3-4.6 17-3.4 25.8zM98.7 106.9v175.3c0 .8 0 1.7.1 2.5.2 2.5 1.7 4.1 4.1 4.2 5.9.1 11.8.1 17.7 0 2.5 0 4-1.7 4.1-4.1.1-.8.1-1.7.1-2.5v-60.7c.9.7 1.4 1.2 1.9 1.6 15 12.5 32.2 16.6 51.1 12.9 17.1-3.4 28.9-13.9 36.7-29.2 5.8-11.6 8.3-24.1 8.7-37 .5-14.3-1-28.4-6.8-41.7-7.1-16.4-18.9-27.3-36.7-30.9-2.7-.6-5.5-.8-8.2-1.2h-7c-1.2.2-2.4.3-3.6.5-11.7 1.4-22.3 5.8-31.8 12.7-2 1.4-3.9 3-5.9 4.5-.1-.5-.3-.8-.4-1.2-.4-2.3-.7-4.6-1.1-6.9-.6-3.9-2.5-5.5-6.4-5.6h-9.7c-5.9-.1-6.9 1-6.9 6.8zM493.6 339c-2.7-.7-5.1 0-7.6 1-43.9 18.4-89.5 30.2-136.8 35.8-14.5 1.7-29.1 2.8-43.7 3.2-26.6.7-53.2-.8-79.6-4.3-17.8-2.4-35.5-5.7-53-9.9-37-8.9-72.7-21.7-106.7-38.8-8.8-4.4-17.4-9.3-26.1-14-3.8-2.1-6.2-1.5-8.2 2.1v1.7c1.2 1.6 2.2 3.4 3.7 4.8 36 32.2 76.6 56.5 122 72.9 21.9 7.9 44.4 13.7 67.3 17.5 14 2.3 28 3.8 42.2 4.5 3 .1 6 .2 9 .4.7 0 1.4.2 2.1.3h17.7c.7-.1 1.4-.3 2.1-.3 14.9-.4 29.8-1.8 44.6-4 21.4-3.2 42.4-8.1 62.9-14.7 29.6-9.6 57.7-22.4 83.4-40.1 2.8-1.9 5.7-3.8 8-6.2 4.3-4.4 2.3-10.4-3.3-11.9zm50.4-27.7c-.8-4.2-4-5.8-7.6-7-5.7-1.9-11.6-2.8-17.6-3.3-11-.9-22-.4-32.8 1.6-12 2.2-23.4 6.1-33.5 13.1-1.2.8-2.4 1.8-3.1 3-.6.9-.7 2.3-.5 3.4.3 1.3 1.7 1.6 3 1.5.6 0 1.2 0 1.8-.1l19.5-2.1c9.6-.9 19.2-1.5 28.8-.8 4.1.3 8.1 1.2 12 2.2 4.3 1.1 6.2 4.4 6.4 8.7.3 6.7-1.2 13.1-2.9 19.5-3.5 12.9-8.3 25.4-13.3 37.8-.3.8-.7 1.7-.8 2.5-.4 2.5 1 4 3.4 3.5 1.4-.3 3-1.1 4-2.1 3.7-3.6 7.5-7.2 10.6-11.2 10.7-13.8 17-29.6 20.7-46.6.7-3 1.2-6.1 1.7-9.1.2-4.7.2-9.6.2-14.5z"></path>
              </svg> */}
            </Link>
            <p
              className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${currentPath === 'student-payment-history'
                  ? 'text-blue-500 font-semibold'
                  : ''
                }`}
            >
              পেমেন্ট
            </p>
          </div>

          {/* প্রোফাইল লিঙ্ক */}
          <Link
            to={`/${schoolid}/dashboard/profile-details`}
            className="text-center cursor-pointer"
          >
            <div className="icon">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="2em"
                width="2em"
                xmlns="http://www.w3.org/2000/svg"
                className={`icon icon-tabler icons-tabler-outline icon-tabler-user-square mx-auto ${currentPath === 'profile-details' ? 'text-blue-500' : ''
                  }`}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9ZM14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM3 12C3 14.0902 3.71255 16.014 4.90798 17.5417C6.55245 15.3889 9.14627 14 12.0645 14C14.9448 14 17.5092 15.3531 19.1565 17.4583C20.313 15.9443 21 14.0524 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12ZM12 21C9.84977 21 7.87565 20.2459 6.32767 18.9878C7.59352 17.1812 9.69106 16 12.0645 16C14.4084 16 16.4833 17.1521 17.7538 18.9209C16.1939 20.2191 14.1881 21 12 21Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <p
              className={`text-xs mt-1 ${currentPath === 'profile-details' ? 'text-blue-500' : ''
                }`}
            >
              প্রোফাইল
            </p>
          </Link>
        </div>
      </div>
      <DefaultModal />
      <DefaultSideDrawer />
    </div>
  );
}
