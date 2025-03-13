import { useEffect } from "react";

import TableOne from "../components/Tables/TableOne"
import AddStudentForm from "../components/Forms/AddStudentForm";
import CardDataStats from "../components/CardDataStats";
import studentSvg from '../assets/student.svg';
import teacherSvg from '../assets/teacher.svg';
import staffSvg from '../assets/staff.svg';
import ChartThree from "../components/Charts/ChartThree";
import { useDispatch, useSelector } from "react-redux";
import { fetchGuardianData, fetchStudentData, fetchTeacherData, fetchUserList } from "../features/userInfo/userInfoSlice";
import { fetchAdmissionStudentData } from "../features/student/studentSlice";

const Home = ({ pageTitle }) => {
    const dispatch = useDispatch();
    const { totalPages, students, studentsStatus, totalStudents, totalTeachers, totalGuardian } = useSelector((state) => state.userInfo)
    const { studentList, status } = useSelector((state) => state.student);

    useEffect(() => {

        dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchStudentData({ itemPerPage: null, currentPage: null }))
        dispatch(fetchTeacherData({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchGuardianData({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchAdmissionStudentData())

    }, [dispatch])
    // if(status === 'succeeded'){
    //     const countBySession = studentList.reduce((acc, student) => {
    //         acc[student.SessionName] = (acc[student.SessionID] || 0) + 1;
    //         return acc;
    //     }, {});
    //     // console.log(studentList);
    //     // console.log(countBySession);
    // }

    const countBySession = studentList.reduce((acc, student) => {
        acc[student.SessionName] = (acc[student.SessionName] || 0) + 1;
        return acc;
    }, {});
    
    return (
        <div className="px-[24px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
                <CardDataStats title="Total User" total={totalPages} >
                    <img src={staffSvg} alt="student icon" />
                </CardDataStats>
                <CardDataStats title="Total Student" total={totalStudents} >
                    <img src={studentSvg} alt="student icon" />
                </CardDataStats>

                <CardDataStats title="Total Teacher" total={totalTeachers} >
                    <img src={teacherSvg} alt="student icon" />
                </CardDataStats>
                {/* <CardDataStats title="Total Guardian" total={totalGuardian} >
                    <img src={staffSvg} alt="student icon" />
                </CardDataStats> */}
            </div>
            <div className="flex gap-4 mt-4">
                <ChartThree data={students} />
                {/* <ChartThree data={students} /> */}
                {/* <ChartThree /> */}
                <div className="w-full">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden ">
                            <table className="min-w-full divide-y divide-gray-200 table-fixed">
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
                                        <tr key={sessionId} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
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
    )
}
export default Home