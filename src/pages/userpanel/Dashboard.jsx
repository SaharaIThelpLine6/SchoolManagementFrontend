import { useEffect } from "react";
import { useGeAllReportsQuery, useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchResultFieldData } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const Dashboard = () => {
  const { schoolid } = useParams()
  const dispatch = useDispatch()
  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery();
  const {
    data: userReports,
    isLoading: isuserReportsLoading,
    isError: isuserReportsError,
  } = useGeAllReportsQuery();
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch]);
  useEffect(() => {
    console.log(userReports);
  }, [userReports])



  return (
    <main className="mian_area pt-4 pb-[100px]">
      <div className="container mx-auto px-2">
        <div className="shadow-[0_0_10px_rgba(0,0,0,0.25)] py-5 px-4 rounded-[10px] ">
          <div className="flex items-center justify-between">
            <div className="flex gap-[20px] items-center notice_header_area">
              <div className="icon bg-red-200 text-red-600 py-1 px-1 rounded-[4px]">
                <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-bell"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
              </div>
              <div className="text-[20px]">
                সর্বশেষ রির্পোট
              </div>
            </div>
            <div>
              <a href={`/${schoolid}/dashboard/user_reports`} className="text-sky-600 text-[14px]">সব দেখুন</a>
            </div>
          </div>

          {
            userReports && userReports.length > 0 ? (<div className="notice_area mt-4 py-4 px-3 bg-yellow-50 relative rounded-[10px] after:content-[''] after:w-[5px] after:h-full after:absolute after:top-0 after:left-0 after:bg-white after:bg-yellow-300">
              <div className="flex justify-between">
                <h2 className="text-[16px]">{userReports?.[0]['ReportCet']['ReportCetName']}</h2>
                <p className="py-1 px-2 rounded-full bg-yellow-500 text-white text-[13px]">{userReports?.[0]['CreateDate']}</p>
              </div>
              <p className="mt-4">
                {
                  userReports?.[0]['Remark']
                }
              </p>
            </div>) : null
          }

        </div>

        <div className="menu grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-10 gap-5">
          <a href={`/${schoolid}?usercode=${userDetails?.User.UserCode}`} target="_blank" className="py-4 px-4 shadow-[0_0_10px_rgba(0,0,0,0.25)] rounded-[10px] text-center">
            <div className="text-white py-2 px-3 bg-emerald-600 inline-block rounded-[10px]">
              <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
            </div>
            <h4 className="font-bold text-[18px]">রেজাল্ট</h4>
          </a>
          <a href={`/${schoolid}/dashboard/user_reports`} className="py-4 px-4 shadow-[0_0_10px_rgba(0,0,0,0.25)] rounded-[10px] text-center">
            <div className="text-white py-2 px-3 bg-sky-600 inline-block rounded-[10px]">
              <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 12h6" /><path d="M9 16h6" /></svg>
            </div>
            <h4 className="font-bold text-[18px]">রির্পোট</h4>
          </a>
        </div>
      </div>


    </main>
  );
};
export default Dashboard;
