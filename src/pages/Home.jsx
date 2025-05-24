import { useEffect } from "react";

import TableOne from "../components/Tables/TableOne";
import AddStudentForm from "../components/Forms/AddStudentForm";
import CardDataStats from "../components/CardDataStats";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { HiDocumentCurrencyDollar } from "react-icons/hi2";

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
