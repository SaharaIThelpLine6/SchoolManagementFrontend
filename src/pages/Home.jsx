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

const Home = ({ pageTitle }) => {
    const dispatch = useDispatch();
    const { totalPages, students, studentsStatus, totalStudents, totalTeachers, totalGuardian } = useSelector((state) => state.userInfo)
    
    useEffect(() => {

        dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchUserList({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchStudentData({ itemPerPage: null, currentPage: null }))
        dispatch(fetchTeacherData({ itemPerPage: 1, currentPage: 1 }))
        dispatch(fetchGuardianData({ itemPerPage: 1, currentPage: 1 }))

    }, [dispatch])
    // if(studentsStatus === 'succeeded'){
    //     console.log(students);
    // }
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
                <div className="w-full"></div>
            </div>

            {/* <AddStudentForm />
            <TableOne /> */}
        </div>
    )
}
export default Home