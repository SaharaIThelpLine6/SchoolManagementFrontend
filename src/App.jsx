// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect, useState } from 'react';
import './App.css'
import { BrowserRouter, Form, Route, Routes } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import Home from './pages/Home';
import Student from './pages/Student';
import AddStudent from './pages/AddStudent';
import UpdateStudent from './pages/UpdateStudent';
import { useForm, FormProvider } from "react-hook-form"
import Login from './pages/Login';
import Users from './pages/Users';
import Class from './pages/Class';
import FormP from './pages/FormP';
import BookList from './pages/BookList';
import GroupDistribution from './pages/GroupDistribution';
import Section from './pages/Section';
import TeacherInfo from './pages/TeacherInfo';
import PayRole from './pages/PayRole';
import PayRoleName from './pages/PayRoleName';
import Report from './pages/Report';
import Exam from './pages/Exam';
import Query from './pages/Query';
import Library from './pages/Library';
import Setting from './pages/Setting';
import Help from './pages/Help';

import { ToastContainer } from 'react-toastify';
import Notepad from './pages/Notepad';
import Others from './pages/Others';
import Calculator from './pages/Calculator';
import PublicLayout from './layout/PublicLayout';
// import ClassResult from './pages/ClassResult';
import AdmissionRegistration from './pages/AdmissionRegistration';
import ResultRequest from './pages/public/ResultRequest';
import Result from './pages/public/Result';
import NotFound from './pages/NotFound';
import Marksheet from './components/Document/Marksheet';
import MarksheetClassWise from './components/Document/MarksheetClassWise';
import ClassResultForm from './pages/public/ClassResultForm';
import ClassResult from './pages/public/ClassResult';
import StudentsResult from './pages/StudentsResult';
import AverageResult from './pages/AverageResult';
import PassMarksSubject from './pages/SubjectPassNumber';
import SubjectPassNumber from './pages/SubjectPassNumber';
import ResultConditions from './pages/ResultConditions';
import Loading from './pages/Loading';
import BoardExam from './pages/BoardExam';
import MadrasahBoardInfo from './pages/MadrasahBoardInfo';

function App() {
  const [loading, setLoading] = useState(true);
  const methods = useForm()
  // const { pathname } = useLocation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <p>Loading...</p>
  ) : (
    <FormProvider {...methods}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home pageTitle={"Home"} />} />
            <Route path="student">
              <Route index element={<AddStudent pageTitle={"Add Student"} />} />
              <Route path="booklist" element={<BookList pageTitle={"Book List"} />} />
              <Route path="groupdistribution" element={<GroupDistribution pageTitle={"Students Group Set"} />} />
              <Route path="class" element={<Class />} pageTitle={"Class"} />
              <Route path="section" element={<Section />} pageTitle={"Section"} />
            </Route>
            <Route path="users">
              <Route index element={<Users pageTitle={"Staff"} />} />
              <Route path="teacherInfo" element={<TeacherInfo pageTitle={"Teacher Info"} />} />
              <Route path="payRole" element={<PayRole pageTitle={"Pay Role"} />} />
              <Route path="pRName" element={<PayRoleName pageTitle={"Pay Role Name"} />} />
              <Route path="report" element={<Report pageTitle={"Reports"} />} />
            </Route>
            <Route path="/formp" element={<FormP />} />  {/*Form form just practice. Not displaying*/}
            <Route path="/query" element={<Query />} />
            <Route path="exam">
              <Route index element={<Exam pageTitle={"Exam"} />} />
            </Route>
            <Route path="board_exam">
              <Route index element={<BoardExam pageTitle={"Board Exam"} />} />
              <Route path="madrasahboardinfo" element={<MadrasahBoardInfo pageTitle={"Madrasah Board Information"} />} />
            </Route>
            <Route path='result'>
              <Route index element={<StudentsResult pageTitle={"Result"} />} />
              <Route path="averageresult" element={<AverageResult pageTitle={"Average Result Entry"} />} />
              <Route path="passmarkssubject" element={<SubjectPassNumber />} />
              <Route path="resultconditions" element={<ResultConditions />} />
            </Route>
            <Route path="/library" element={<Library pageTitle={"Library"} />} />
            <Route path="others">
              <Route index element={<Others pageTitle={"Others"} />} />
              <Route path="notepad" element={<Notepad pageTitle={"Notepad"} />} />
              <Route path="calculator" element={<Calculator pageTitle={"Calculator"} />} />
            </Route>
            <Route path="/setting" element={<Setting pageTitle={"Setting"} />} />
            <Route path="/help" element={<Help pageTitle={"Help"} />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path=":schoolid" element={<PublicLayout />}>
            <Route index element={<ResultRequest pageTitle={"Result Page"} />} />
            <Route path="classes" element={<ClassResultForm />} />
            <Route path="AdmissionRegistration" element={<AdmissionRegistration />} />
            <Route path="students/:seassonid/:examid/:classid/:userid" element={<Result/>} />
            <Route path="classes/:seassonid/:examid/:classid" element={<ClassResult/>} />
          </Route>
          
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        // className="flex text-[14px] font-SolaimanLipi bg-[#323232] text-[rgba(255,255,255,.7)] justify-between items-center py-2 px-2 rounded-[4px] font-normal"
      />
    </FormProvider>
  );
}

export default App
