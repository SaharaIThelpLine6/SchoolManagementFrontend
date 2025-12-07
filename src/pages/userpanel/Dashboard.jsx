import { useEffect } from "react";
import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";
// import { useGetUserDetailsQuery } from "../../features/userPanel/userInfo/userInfoQuerySlice";

const Dashboard = () => {
  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery();

  useEffect(() => {
    console.log(userDetails);
  }, [userDetails])


  return (
    <div className="font-SolaimanLipi">
      <header className="bg-[#007af7] px-2 py-4 text-white">
        <div className="container mx-auto">
          <div className="text-center">
            <h1 className=" text-[18px] lg:text-[28px]">অম্বরপুর জামিয়া ইসলামিয়া মদিনাতুল উলুম মাদ্রাসা</h1>
            <h4 className="text-[16px] lg:text-[18px]">ফতুল্লা নরায়নগণ্জ</h4>
            <p className="text-[16px] lg:text-[18px]"> অভিভাবক র্পোটাল </p>
          </div>

          <div className="bg-[#e5e7eb52] px-3 py-3 rounded-[6px] mt-4">
             <p className="mb-1">শিক্ষাথী: </p>
             <p className="">শ্রেণী: </p>
          </div>

        </div>
      </header>

      
    </div>
  );
};
export default Dashboard;
