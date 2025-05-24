import { useEffect } from "react";

import TableOne from "../components/Tables/TableOne";
import AddStudentForm from "../components/Forms/AddStudentForm";
import CardDataStats from "../components/CardDataStats";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { HiDocumentCurrencyDollar } from "react-icons/hi2";

import { useDispatch, useSelector } from "react-redux";
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

const Home = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const {
    totalPages,
    students,
    studentsStatus,
    totalStudents,
    totalTeachers,
    totalGuardian,
  } = useSelector((state) => state.userInfo);
  const { studentList, status } = useSelector((state) => state.student);

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
    <div className="px-[24px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardDataStats
          title="মোট শিক্ষার্থী" // Total Student
          total={totalStudents}
          bgColor="#ECF7FB" // Light pink
          iconColor="text-[#06AEEF]"
          titleColor="text-[#06AEEF]"
        >
          <FaGraduationCap className="w-8 h-8" />
        </CardDataStats>

        <CardDataStats
          title="মোট শিক্ষক" // Total Teacher
          total={totalTeachers}
          bgColor="#F9CEE1" // Light green
          titleColor="text-[#EB058C]"
          iconColor="text-[#EB058C]" // Pass the color value without "text-" prefix
        >
          <FaChalkboardTeacher className="w-8 h-8" />
        </CardDataStats>

        <CardDataStats
          title="মোট দাতা সদস্য" // Total Guardian
          total={totalGuardian}
          bgColor="#C3DCC2" // Light green
          titleColor="text-[#0C9444]"
          iconColor="text-[#0C9444]" // Pass the color value without "text-" prefix
        >
          <FaSackDollar className="w-8 h-8" />
        </CardDataStats>
        <CardDataStats
          title="মোট পাওনা" // Total User
          total={totalPages}
          bgColor="#FFE4C6" // Light orange
          titleColor="text-[#F7951E]"
          iconColor="text-[#F7951E]"
        >
          <HiDocumentCurrencyDollar className="w-8 h-8" />
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ColumnsChart spans 2/3 on medium+ screens, full width on small screens */}
        <div className="md:col-span-2 col-span-1">
          <ColumnsChart />
        </div>

        {/* AttendanceChart takes 1/3 on medium+ screens, full width on small screens */}
        <div className="md:col-span-1 col-span-1">
          <AttendanceChart />
        </div>
      </div>
    </div>
  );
};
export default Home;
