import { useEffect } from "react";
import CardDataStats from "../components/CardDataStats";
import {
  fetchGuardianData,
  fetchStudentData,
  fetchTeacherData,
  fetchUserList,
} from "../features/userInfo/userInfoSlice";
import { fetchAdmissionStudentData } from "../features/student/studentSlice";
import PieChart from "../components/Charts/PieChart";
import CalendarOne from "../components/Calendar/CalendarOne";
import ColumnsChart from "../components/Charts/ColumnsChart";
import AttendanceChart from "../components/Charts/AttendanceChart";
import ClassRoutine from "../components/Tables/ClassRoutine";
import {
  useGetStudentBySessionQuery,
  useGetTotalDueQuery,
  useGetTotalTeacherQuery,
  useGetTotalDonerQuery,
  useGetTotalStudentQuery,
} from "../features/dashboard/dashboardQuerySlice";
import useTranslate from "../utils/Translate";
import DeveloperCredit from "../components/DeveloperCredit";
import SvgIcon from "../components/icons/SvgIcon";
import { useDispatch, useSelector } from "react-redux";
const Home = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const { studentList, status } = useSelector((state) => state.student);
  const { data: studentCount } = useGetTotalStudentQuery();
  const { data: teacherCount } = useGetTotalTeacherQuery();
  const { data: donerCount } = useGetTotalDonerQuery();
  const { data: totalDueCount } = useGetTotalDueQuery();

  useEffect(() => {
    dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }));
    dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }));
    dispatch(fetchStudentData({ itemPerPage: null, currentPage: null }));
    dispatch(fetchTeacherData({ itemPerPage: 1, currentPage: 1 }));
    dispatch(fetchGuardianData({ itemPerPage: 1, currentPage: 1 }));
    dispatch(fetchAdmissionStudentData());
  }, [dispatch]);
  const countBySession =
    Array.isArray(studentList) && studentList.length > 0
      ? studentList.reduce((acc, student) => {
          acc[student.SessionName] = (acc[student.SessionName] || 0) + 1;
          return acc;
        }, {})
      : {};

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardDataStats
          title={translate("Total students")} // Total Student
          total={studentCount ? studentCount?.totalUsers : 0}
          bgColor="bg-[#ECF7FB]" // Light pink
          iconColor="text-[#06AEEF]"
          titleColor="text-[#06AEEF]"
          isLoading={!studentCount}
        >
          <SvgIcon name={"FaGraduationCap"} size={20}  />
        </CardDataStats>

        <CardDataStats
          title={translate("Total teachers")} // Total Teacher
          total={teacherCount?.totalUsers ?? 0}
          bgColor="bg-[#F9CEE1]" // Light green
          titleColor="text-[#EB058C]"
          iconColor="text-[#EB058C]" // Pass the color value without "text-" prefix
          isLoading={!teacherCount}
        >
          <SvgIcon name={"FaChalkboardTeacher"} size={20} />
        </CardDataStats>

        <CardDataStats
          title={translate("Total Donor Member")} // Total Guardian
          total={donerCount?.totalUsers ?? 0}
          bgColor="bg-[#C3DCC2]" 
          titleColor="text-[#0C9444]"
          iconColor="text-[#0C9444]" // Pass the color value without "text-" prefix
          isLoading={!donerCount}
        >
          <SvgIcon name={"FaSackDollar"} size={20} />
        </CardDataStats>
        <CardDataStats
          title={translate("Total owed")} // Total User
          total={totalDueCount?.totalDue ?? 0}
          bgColor="bg-[#FFE4C6]" // Light orange
          titleColor="text-[#F7951E]"
          iconColor="text-[#F7951E]"
          isLoading={!totalDueCount}
        >
          <SvgIcon
            name={"HiDocumentCurrencyDollar"}
            size={32}
          />
        </CardDataStats>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 col-span-1">
          <PieChart />
        </div>
        <div className="md:col-span-1 col-span-1">
          <CalendarOne />
        </div>
        <div className="md:col-span-1 col-span-1">
          <ClassRoutine />
        </div>
      </div>

      {/* <AddStudentForm />
            <TableOne /> */}
      <div className="grid grid-cols-1 gap-6">
        {/* ColumnsChart spans 2/3 on medium+ screens, full width on small screens */}
        <div className="">
          <ColumnsChart />
        </div>

        {/* AttendanceChart takes 1/3 on medium+ screens, full width on small screens */}
        {/* <div className="md:col-span-1 col-span-1">
          <AttendanceChart />
        </div> */}
      </div>
    </div>
  );
};
export default Home;
