import { Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useVerifyUserPanelTokenMutation } from "../features/userPanel/userLoginVerify/userloginVerifyQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserDetailsQuery } from "../features/userPanel/userInfo/userInfoQuerySlice";
import { fetchResultFieldData } from "../features/studentResultPublicView/studentResultPublicViewSlice";

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
  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery();
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);

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
          <a href="#" className="text-center">
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
          <a href={`/${schoolid}/dashboard`} className="text-center">
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-user-square mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 10a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M6 21v-1a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v1" /><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /></svg>
            </div>
            <p>প্রোফাইল</p>
          </a>
        </div>
      </div>
  </div>;
}
