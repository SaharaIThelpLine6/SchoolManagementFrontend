import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import DefaultModal from '../components/DefaultModal';
import DefaultSideDrawer from '../components/DefaultSideDrawer';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { fetchResultFieldData } from '../features/studentResultPublicView/studentResultPublicViewSlice';
import { useGetUserDetailsQuery } from '../features/userPanel/userInfo/userInfoQuerySlice';
import { useVerifyUserPanelTokenMutation } from '../features/userPanel/userLoginVerify/userloginVerifyQuerySlice';
import { showModal, showSideBarModal } from '../utils/ModalControlar';
// import { subscribeUser } from "../pushNotifications";
import logo from '/saharaItlogo.png';

export default function UserPanel({ children }) {
  const token = localStorage.getItem('user_panel_token');
  console.log(token);

  const [verifyToken] = useVerifyUserPanelTokenMutation();
  const { schoolid } = useParams();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

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
  if (loading) return <div>Loading...</div>;

  if (!isValid) return <Navigate to={`/${schoolid}/login`} replace />;

  return (
    <div className="font-SolaimanLipi">
      {/* লোগোকে background image হিসেবে right top এ দেখানোর জন্য নতুন div যোগ করুন */}
      <div
        className="fixed right-0 top-0 w-50 h-80 opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '10px 10px', // 10px from right, 10px from top
          backgroundSize: 'contain',
        }}
      />

      <header className="px-2 text-black shadow-[0_0px_10px_rgba(0,0,0,0.25)] relative z-10">
        <div className="container mx-auto">
          <div className=" py-4">
            <div className="flex items-center justify-between gap-[10px]">
              <div className="flex gap-[10px] items-center notice_header_area">
                <img
                  className="w-[40px]"
                  src={bufferConveter(schoolData?.Logo?.data)}
                  alt=""
                />
                <div className="text-[12px]">{schoolData?.InstitutionName}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="icon text-white-600 py-1 px-1 rounded-[4px] relative">
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
                </div>
                <div className="icon text-red-600 py-1 px-1">
                  <a href={`/${schoolid}/dashboard/profile-details`}>
                    <img
                      src={
                        userDetails?.User?.UserImage.length > 0
                          ? bufferConveter(
                              userDetails?.User?.UserImage[0].Image
                            )
                          : 'logo.png'
                      }
                      className="w-10 h-10 max-w-10 object-cover border-2 border-green-600 rounded-full"
                      alt="profile"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
      {/* <button onClick={subscribeUser}>
      Enable Notifications
    </button> */}
      <div className="mobile_footer_menu shadow-[0_0_10px_rgba(0,0,0,0.25)] bg-white py-2 fixed w-full bottom-0 z-10">
        <div className="grid grid-cols-3">
          <a href={`/${schoolid}/dashboard`} className="text-center">
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-home mx-auto"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
                <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
                <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
              </svg>
            </div>
            <p>হোম</p>
          </a>
          <a
            href={`/${schoolid}/dashboard/student-payment-history`}
            className="text-center"
          >
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-dollar mx-auto"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M13 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v5" />
                <path d="M11 4h2" />
                <path d="M12 17v.01" />
                <path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" />
                <path d="M19 21v1m0 -8v1" />
              </svg>
            </div>
            <p>পেমেন্ট</p>
          </a>
          <a
            onClick={handleProfileModal}
            className="text-center cursor-pointer"
          >
            <div className="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-user-square mx-auto"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                <path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1" />
                <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
              </svg>
            </div>
            <p>প্রোফাইল</p>
          </a>
        </div>
      </div>
      <DefaultModal />
      <DefaultSideDrawer />
    </div>
  );
}

