// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Form, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import { useForm, FormProvider } from "react-hook-form";
import Login from "./pages/Login";
import Class from "./pages/Class";
import FormP from "./pages/FormP";
import BookList from "./pages/BookList";
import GroupDistribution from "./pages/GroupDistribution";
import Section from "./pages/Section";
import PayRole from "./pages/PayRole";
import PayRoleName from "./pages/PayRoleName";
import Report from "./pages/Report";
import Exam from "./pages/Exam";
import Query from "./pages/Query";
import Library from "./pages/Library";
import Setting from "./pages/Setting";
import Help from "./pages/Help";
import { cssTransition, ToastContainer } from "react-toastify";
import Notepad from "./pages/Notepad";
import Others from "./pages/Others";
import Calculator from "./pages/Calculator";
import PublicLayout from "./layout/PublicLayout";
import AdmissionRegistration from "./pages/AdmissionRegistration";
import ResultRequest from "./pages/public/ResultRequest";
import Result from "./pages/public/Result";
import NotFound from "./pages/NotFound";
import ClassResultForm from "./pages/public/ClassResultForm";
import ClassResult from "./pages/public/ClassResult";
import Loading from "./components/Loading/Loading";
import "animate.css/animate.min.css";

const bounce = cssTransition({
  enter: "animate__animated animate__bounceIn",
  exit: "animate__animated animate__bounceOut",
});
import StudentsResult from "./pages/StudentsResult";
import AverageResult from "./pages/AverageResult";
import SubjectPassNumber from "./pages/SubjectPassNumber";
import ResultConditions from "./pages/ResultConditions";
import BoardExam from "./pages/BoardExam";
import MadrasahBoardInfo from "./pages/MadrasahBoardInfo";
import User from "./pages/User";
import Quota from "./pages/Quota";
import AddTeacher from "./pages/AddTeacher";
import Session from "./pages/Session";
import FormBuilder from "./pages/FormBuilder";
import OnlineAdmission from "./pages/public/OnlineAdmission";
import StudentAdmissionForm from "./pages/public/studentAddmitionForm";
import PaymentConfirm from "./pages/PaymentConfirm";
import StudentFeeSetup from "./pages/StudentFeeSetup";
import StudentReport from "./pages/StudentReport";
import Designations from "./pages/Designations";
import useTranslate from "./utils/Translate";
import DefaultLayout from "./layout/DefaultLayout";
import TypeOfVacation from "./pages/TypeOfVacation";
import StudentVacationListTable from "./components/Tables/StudentVacationListTable";
import MonthListTable from "./pages/MonthListTable";
import UserReports from "./pages/UserReports";

function App() {
  const [loading, setLoading] = useState(true);
  // const { isLoading } = useSelector((state) => state.loading)
  const translate = useTranslate();

  const methods = useForm();
  // const { pathname } = useLocation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <FormProvider {...methods}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home pageTitle={"Home"} />} />

            <Route path="students">
              <Route index element={<AddStudent pageTitle={"Add Student"} />} />
              <Route
                path="booklist"
                element={<BookList pageTitle={"Book List"} />}
              />
              <Route
                path="groupdistribution"
                element={<GroupDistribution pageTitle={"Students Group Set"} />}
              />
              <Route path="class" element={<Class pageTitle={"Class"} />} />
              <Route
                path="section"
                element={<Section pageTitle={"Section"} />}
              />
              <Route
                path="sessions"
                element={<Session pageTitle={"Session"} />}
              />
              <Route
                path="report"
                element={<StudentReport pageTitle={"Student Report"} />}
              />
              <Route
                path="vacation"
                element={
                  <StudentVacationListTable pageTitle={"Students Vacation"} />
                }
              />
              <Route
                path="vacation/type-of-vacation"
                element={<TypeOfVacation pageTitle={"Type of Vacation"} />}
              />
            </Route>

            <Route path="usersinfo" element={<User />} />
            <Route path="general-info">
              <Route
                index
                path="user-reports"
                element={<UserReports pageTitle={"User Reports"} />}
              />
            </Route>
            <Route
              path="payment_confirm/:schoolid/:service/:size"
              element={<PaymentConfirm />}
            />
            <Route path="renew" element={<Quota type="renew" />} />
            <Route path="accounts" element={<StudentFeeSetup type="renew" />} />
            <Route path="quota" element={<Quota type="quota" />} />
            <Route path="formbuilder" element={<FormBuilder />} />

            <Route path="teacherinfo">
              <Route index element={<AddTeacher pageTitle={"Employee"} />} />
              <Route
                path="payRole"
                element={<PayRole pageTitle={"Pay Role"} />}
              />
              <Route
                path="pRName"
                element={<PayRoleName pageTitle={"Pay Role Name"} />}
              />
              <Route path="report" element={<Report pageTitle={"Reports"} />} />
              <Route
                path="designation"
                element={<Designations pageTitle={"Designation List"} />}
              />
            </Route>

            <Route
              path="/month-name-list"
              element={
                <MonthListTable pageTitle={translate("Months list table")} />
              }
            />
            <Route path="/formp" element={<FormP />} />
            <Route path="/query" element={<Query />} />
            <Route path="exam">
              <Route index element={<Exam pageTitle={"Exam"} />} />
            </Route>
            <Route path="board_exam">
              <Route index element={<BoardExam pageTitle={"Board Exam"} />} />
              <Route
                path="madrasahboardinfo"
                element={
                  <MadrasahBoardInfo pageTitle={"Madrasah Board Information"} />
                }
              />
            </Route>
            <Route path="result">
              <Route index element={<StudentsResult pageTitle={"Result"} />} />
              <Route
                path="averageresult"
                element={<AverageResult pageTitle={"Average Result Entry"} />}
              />
              <Route path="passmarkssubject" element={<SubjectPassNumber />} />
              <Route path="resultconditions" element={<ResultConditions />} />
            </Route>
            <Route
              path="/library"
              element={<Library pageTitle={"Library"} />}
            />
            <Route path="others">
              <Route index element={<Others pageTitle={"Others"} />} />
              <Route
                path="notepad"
                element={<Notepad pageTitle={"Notepad"} />}
              />
              <Route
                path="calculator"
                element={<Calculator pageTitle={"Calculator"} />}
              />
            </Route>
            <Route path="settings">
              <Route index element={<Setting pageTitle={"Setting"} />} />
              <Route
                path="month-name-list"
                element={<MonthListTable pageTitle={"Month Name List"} />}
              />
              <Route
                path="calculator"
                element={<Calculator pageTitle={"Calculator"} />}
              />
            </Route>

            <Route path="/help" element={<Help pageTitle={"Help"} />} />
          </Route>
          {/* <Route path='/quota/:payfor' element={<Quota/>}>
          
          </Route> */}
          <Route path="/login" element={<Login />} />
          <Route path=":schoolid" element={<PublicLayout />}>
            <Route
              index
              element={<ResultRequest pageTitle={"Result Page"} />}
            />
            <Route path="classes" element={<ClassResultForm />} />
            <Route
              path="AdmissionRegistration"
              element={<AdmissionRegistration />}
            />
            <Route
              path="students/:seassonid/:examid/:classid/:userid"
              element={<Result />}
            />
            <Route
              path="classes/:seassonid/:examid/:classid"
              element={<ClassResult />}
            />
            <Route path="online_admission" element={<OnlineAdmission />} />
            <Route
              path="online_admission/:usercode"
              element={<StudentAdmissionForm />}
            />
            {/* <Route path="online_admission_download" element={<StudentAdmissionForm />} /> */}
            {/* <Route path='renew' element={<Quota type="renew"/>}/>  */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      {/* bg-[#323232] */}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={bounce}
        closeButton={false}
        className=" min-h-[50px] max-h-fit overflow-hidden text-[14px] font-SolaimanLipi  text-[#ffffff]  rounded-[4px] font-normal hidden_in_print"
        // style={{
        //   boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
        // }

        // }
      />
    </FormProvider>
  );
}

export default App;
