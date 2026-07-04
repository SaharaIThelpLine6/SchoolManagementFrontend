import React from 'react'
import { useGetStudentAttendanceQuery } from '../features/student/studentQuerySlice';

const UserAttendance = () => {
  const userId = 2267;
  const { data: attendanceData } = useGetStudentAttendanceQuery(userId);
  console.log(attendanceData, "attendanceData")
  return (
    <div>UserAttendance</div>
  )
}

export default UserAttendance