import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchResultFieldData } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { useGeAllReportsQuery, useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
import { Buffer } from "buffer";
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

  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return "/logo.png";
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString("base64");
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };


  return (
    <main className="mian_area pt-4 pb-[100px]">
      <div className="container mx-auto px-2">
        <div className="menu grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-4 gap-5">
          <a href={`#`} className="py-4 px-4  text-center">
            {/* className="py-4 px-4 shadow-[0_0_10px_rgba(0,0,0,0.25)]
            rounded-[10px] text-center" */}
            <div className="text-white py-2 px-3 bg-teal-500 inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-calendar-week"
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
            <h4 className="font-bold text-[18px]">উপস্থিতি</h4>
          </a>
          <a
            href={`/${schoolid}/dashboard/student-results`}
            target="_parent"
            className="py-4 px-4  text-center"
          >
            <div className="text-white py-2 px-3 bg-[#3A0088] inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">ফলাফল ও মার্কশীট</h4>
          </a>

          <a
            href={`/${schoolid}/dashboard/student-payment-history`}
            className="py-4 px-4  text-center"
          >
            <div className="text-white py-2 px-3 bg-lime-500 inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-cash-register"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M21 15h-2.5c-.398 0 -.779 .158 -1.061 .439c-.281 .281 -.439 .663 -.439 1.061c0 .398 .158 .779 .439 1.061c.281 .281 .663 .439 1.061 .439h1c.398 0 .779 .158 1.061 .439c.281 .281 .439 .663 .439 1.061c0 .398 -.158 .779 -.439 1.061c-.281 .281 -.663 .439 -1.061 .439h-2.5" />
                <path d="M19 21v1m0 -8v1" />
                <path d="M13 21h-7c-.53 0 -1.039 -.211 -1.414 -.586c-.375 -.375 -.586 -.884 -.586 -1.414v-10c0 -.53 .211 -1.039 .586 -1.414c.375 -.375 .884 -.586 1.414 -.586h2m12 3.12v-1.12c0 -.53 -.211 -1.039 -.586 -1.414c-.375 -.375 -.884 -.586 -1.414 -.586h-2" />
                <path d="M16 10v-6c0 -.53 -.211 -1.039 -.586 -1.414c-.375 -.375 -.884 -.586 -1.414 -.586h-4c-.53 0 -1.039 .211 -1.414 .586c-.375 .375 -.586 .884 -.586 1.414v6m8 0h-8m8 0h1m-9 0h-1" />
                <path d="M8 14v.01" />
                <path d="M8 17v.01" />
                <path d="M12 13.99v.01" />
                <path d="M12 17v.01" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">ফি ও পেমেন্ট তথ্য</h4>
          </a>

          <a href={`#`} className="py-4 px-4  text-center">
            <div className="text-white py-2 px-3 bg-rose-600 inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-align-box-left-stretch"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" />
                <path d="M9 17h-2" />
                <path d="M13 12h-6" />
                <path d="M11 7h-4" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">হোমওয়ার্ক / বাড়ির কাজ</h4>
          </a>

          <a
            href={`/${schoolid}/dashboard/user_reports`}
            className="py-4 px-4  text-center"
          >
            <div className="text-white py-2 px-3 bg-[#8D448B] inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-clipboard-text text-center mx-auto"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
                <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">চারিত্রিক রির্পোট</h4>
          </a>

          <a
            href={`/${schoolid}/dashboard/exam-schedule`}
            className="py-4 px-4  text-center"
          >
            <div className="text-white py-2 px-3 bg-[#FFC75F] inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-address-book"
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
            <h4 className="font-bold text-[18px]">পরীক্ষার শিডিউল</h4>
          </a>

          <a href={`#`} className="py-4 px-4  text-center">
            <div className="text-white py-2 px-3 bg-[#364F6B] inline-block rounded-[10px]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={40}
                height={40}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-phone"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">যোগাযোগ</h4>
          </a>
          <a href={`#`} className="py-4 px-4  text-center">
            <div className="text-white py-2 px-3 bg-[#845EC2] inline-block rounded-[10px]">
              <svg
                width="40px"
                height="40px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 4L9 20M15 4L15 20M3 9H21M3 15H21M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.07989 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z"
                  stroke="#fff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">ক্লাশ রুটিন</h4>
          </a>
          <a href={`#`} className="py-4 px-4  text-center">
            <div className="text-white py-2 px-3 bg-[#FA6868] inline-block rounded-[10px]">
              <svg
                fill="#ffffff"
                width="40px"
                height="40px"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M373.253 420.837h199.885c53.836 0 97.485 43.649 97.485 97.485v3.277c0 53.836-43.649 97.485-97.485 97.485h-235.93c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48h235.93c76.458 0 138.445-61.987 138.445-138.445v-3.277c0-76.458-61.987-138.445-138.445-138.445H373.253c-11.311 0-20.48 9.169-20.48 20.48s9.169 20.48 20.48 20.48z" />
                <path d="M383.508 327.771l-56.771 56.771c-7.998 7.998-7.998 20.965 0 28.963s20.965 7.998 28.963 0l56.771-56.771c7.998-7.998 7.998-20.965 0-28.963s-20.965-7.998-28.963 0z" />
                <path d="M411.082 442.929l-56.771-56.771c-7.998-7.998-20.965-7.998-28.963 0s-7.998 20.965 0 28.963l56.771 56.771c7.998 7.998 20.965 7.998 28.963 0s7.998-20.965 0-28.963zM844.624 744.6c-97.118 59.062-208.301 91.552-324.507 93.318-116.348 1.775-228.612-27.381-327.557-83.572-9.835-5.586-22.337-2.14-27.922 7.695s-2.14 22.337 7.695 27.922c105.253 59.773 224.708 90.798 348.407 88.91 123.55-1.877 241.858-36.449 345.167-99.276 9.664-5.877 12.734-18.476 6.857-28.14s-18.476-12.734-28.14-6.857z" />
                <path d="M203.064 775.993l58.081-304.159c2.122-11.11-5.165-21.836-16.275-23.958s-21.836 5.165-23.958 16.275L162.831 768.31c-2.122 11.11 5.165 21.836 16.275 23.958s21.836-5.165 23.958-16.275zm563.293-310.701l69.458 301.404c2.54 11.022 13.534 17.898 24.556 15.358s17.898-13.534 15.358-24.556l-69.458-301.404c-2.54-11.022-13.534-17.898-24.556-15.358s-17.898 13.534-15.358 24.556z" />
                <path d="M491.911 187.885c10.569-4.522 30.524-4.785 41.192-.547L967.339 359.51l-186.378 80.555c-10.383 4.487-15.161 16.542-10.674 26.924s16.542 15.161 26.924 10.674l203.561-87.982c32.262-13.948 31.734-48.4-.938-61.349L548.211 149.266c-20.713-8.228-51.897-7.818-72.405.956L23.984 343.304c-32.394 13.828-31.871 48.323.923 61.176l208.613 81.717c10.532 4.125 22.413-1.068 26.539-11.6s-1.068-22.413-11.6-26.539L57.827 373.385l434.082-185.501z" />
                <path d="M983.919 363.184v296.233c0 11.311 9.169 20.48 20.48 20.48s20.48-9.169 20.48-20.48V363.184c0-11.311-9.169-20.48-20.48-20.48s-20.48 9.169-20.48 20.48z" />
              </svg>
            </div>
            <h4 className="font-bold text-[18px]">অনলাইন ভর্তি</h4>
          </a>
        </div>
      </div>
    </main>
  );
};
export default Dashboard;
