import { Navigate, Outlet, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useVerifyUserPanelTokenMutation } from "../features/userPanel/userLoginVerify/userloginVerifyQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserDetailsQuery } from "../features/userPanel/userInfo/userInfoQuerySlice";
import { fetchResultFieldData } from "../features/studentResultPublicView/studentResultPublicViewSlice";
import DefaultModal from "../components/DefaultModal";
import { showModal, showSideBarModal } from "../utils/ModalControlar";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import DefaultSideDrawer from "../components/DefaultSideDrawer";

export default function UserPanel({ children }) {
  const token = localStorage.getItem("user_panel_token");
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
      console.log("cjheck tokwen false");


      try {
        console.log("cjheck tokwen false");

        const res = await verifyToken({ token }).unwrap();
        console.log(
          "ashfdashfashfas ashfdiash fawfhasuif asfasihfas fasfh asifh as"
        );
        // console.log(res.id);
        if (res.schoolId == schoolid && res.id) {
          setIsValid(true);
        } else {
          localStorage.removeItem("user_panel_token");
        }
      } catch (error) {
        console.log(error);
        localStorage.removeItem("user_panel_token");
        setIsValid(false);
      }

      setLoading(false);
    }

    checkToken();
  }, []);

  const dispatch = useDispatch()

  const [sessionName, setSessionName] = useState(null)
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  const currentSession = useSelector((state) => state.sessionChange.currentSession);

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

    const activeSession = sessionsData.find((s) => s.SessionID == currentSession) ??
      sessionsData.find((s) => s.SessionStatus == 1);

    setSessionName(activeSession?.SessionName ?? "N/A");
  }, [currentSession, sessionsData]);


  const handleTypeModal = useCallback(() => {
    showModal('Type', 'SESSION_CHANGE_MODEL');
  }, []);
  const handleProfileModal = useCallback(() => {
    showSideBarModal('', 'USER_PANEL_PROFILE_VIEW');
  }, []);


  // sessionsData.find(s => s.SessionStatus === 1)
  // sessionsData
  if (loading) return <div>Loading...</div>;

  if (!isValid) return <Navigate to={`/${schoolid}/login`} replace />;

  return <div className="font-SolaimanLipi">
    <header className="bg-[#007af7] px-2 py-4 text-white">
      <div className="container mx-auto">
        <div className="text-center">
          <h1 className=" text-[18px] lg:text-[28px]">{schoolData?.InstitutionName}</h1>
          <h4 className="text-[16px] lg:text-[18px]">{schoolData?.Address}</h4>
          <p className="text-[16px] lg:text-[18px]"> অভিভাবক র্পোটাল </p>
        </div>

        <div className="bg-[#e5e7eb52] px-3 py-3 rounded-[6px] mt-4">
          <p className="mb-1">শিক্ষাথী: {userDetails?.User.UserName}</p>
          <p className="">শ্রেণী: {userDetails?.Class.ClassName}</p>
          <p className="">
            সেশন: {sessionName || "N/A"}  <button type="button" onClick={handleTypeModal}><svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-pencil-star"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17.5 10.5l1 -1a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4h4l2 -2" /><path d="M13.5 6.5l4 4" /><path d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" /></svg></button>
          </p>

        </div>

      </div>
    </header>
    <Outlet />
    <div className="mobile_footer_menu shadow-[0_0_10px_rgba(0,0,0,0.25)] bg-[#007af7] text-white py-2 fixed w-full bottom-0">
      <div className="grid grid-cols-4">
        <a href={`/${schoolid}/dashboard`} className="text-center">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-home mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 12l-2 0l9 -9l9 9l-2 0" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" /></svg>
          </div>
          <p>হোম</p>
        </a>
        <a href={`/${schoolid}/dashboard/student-payment-history`} className="text-center">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-device-mobile-dollar mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M13 21h-5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v5" /><path d="M11 4h2" /><path d="M12 17v.01" /><path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" /><path d="M19 21v1m0 -8v1" /></svg>
          </div>
          <p>পেমেন্ট</p>
        </a>
        <a href={`/${schoolid}/dashboard/user_reports`} className="text-center">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
          </div>
          <p>রির্পোট</p>
        </a>
        <a onClick={handleProfileModal} className="text-center">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user-square mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1" /><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /></svg>
          </div>
          <p>প্রোফাইল</p>
        </a>
      </div>
    </div>
    <DefaultModal />
    <DefaultSideDrawer />
  </div>;
}
