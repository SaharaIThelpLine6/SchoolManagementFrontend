import { useEffect } from "react";

import TableOne from "../components/Tables/TableOne";
import AddStudentForm from "../components/Forms/AddStudentForm";
import CardDataStats from "../components/CardDataStats";
import { FaGraduationCap } from "react-icons/fa";
import { FaChalkboardTeacher } from "react-icons/fa";
import { FaUserShield } from "react-icons/fa";

import teacherSvg from "../assets/teacher.svg";
import staffSvg from "../assets/staff.svg";
import ChartThree from "../components/Charts/ChartThree";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGuardianData,
  fetchStudentData,
  fetchTeacherData,
  fetchUserList,
} from "../features/userInfo/userInfoSlice";
import { fetchAdmissionStudentData } from "../features/student/studentSlice";

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
          title="মোট ব্যবহারকারী" // Total User
          total={totalPages}
          bgColor="#E3F2FD" // Light blue
        >
          <FaGraduationCap className="w-8 h-8" />
        </CardDataStats>

        <CardDataStats
          title="মোট শিক্ষার্থী" // Total Student
          total={totalStudents}
          bgColor="#FCE4EC" // Light pink
        >
          <FaChalkboardTeacher className="w-8 h-8" />
        </CardDataStats>

        <CardDataStats
          title="মোট শিক্ষক" // Total Teacher
          total={totalTeachers}
          bgColor="#E8F5E9" // Light green
        >
          <FaChalkboardTeacher className="w-8 h-8" />
        </CardDataStats>

        <CardDataStats
          title="মোট অভিভাবক" // Total Guardian
          total={totalGuardian}
          bgColor="#FFF3E0" // Light orange
        >
          <FaUserShield className="w-8 h-8" />
        </CardDataStats>
      </div>
      <div className="flex gap-4 mt-4 pb-4 flex-col md:flex-row">
        <ChartThree data={students} />
        {/* <ChartThree data={students} /> */}
        {/* <ChartThree /> */}
        <div className="w-full">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              <table className="min-w-full divide-y divide-gray-200 table-fixed border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase "
                    >
                      Session
                    </th>
                    <th
                      scope="col"
                      className="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase"
                    >
                      Student
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(countBySession).map(([sessionId, count]) => (
                    <tr key={sessionId} className="hover:bg-gray-100">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap border border-gray-200">
                        {sessionId}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* <AddStudentForm />
            <TableOne /> */}
    </div>
  );
};
export default Home;
