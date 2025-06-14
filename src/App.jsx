import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useForm } from "react-hook-form";
import { cssTransition, ToastContainer } from "react-toastify";

import "./App.css";
import "animate.css/animate.min.css";

// Layouts
import DefaultLayout from "./layout/DefaultLayout";
import PublicLayout from "./layout/PublicLayout";

// Pages
import Home from "./pages/Home";
import AddStudent from "./pages/AddStudent";
import BookList from "./pages/BookList";
import GroupDistribution from "./pages/GroupDistribution";
import Class from "./pages/Class";
import Section from "./pages/Section";
import Session from "./pages/Session";
import StudentReport from "./pages/StudentReport";
import TypeOfVacation from "./pages/TypeOfVacation";
import StudentVacationListTable from "./components/Tables/StudentVacationListTable";
import EnglisArobihName from "./pages/EnglisArobihName";
import UserReports from "./pages/UserReports";
import SMS from "./pages/SMS";
import Setting from "./pages/Setting";
import MonthListTable from "./pages/MonthListTable";
import Quota from "./pages/Quota";
import StudentFeeSetup from "./pages/StudentFeeSetup";
import FormBuilder from "./pages/FormBuilder";
import AddTeacher from "./pages/AddTeacher";
import PayRole from "./pages/PayRole";
import PayRoleName from "./pages/PayRoleName";
import Report from "./pages/Report";
import Designations from "./pages/Designations";
import Exam from "./pages/Exam";
import BoardExam from "./pages/BoardExam";
import MadrasahBoardInfo from "./pages/MadrasahBoardInfo";
import StudentsResult from "./pages/StudentsResult";
import AverageResult from "./pages/AverageResult";
import SubjectPassNumber from "./pages/SubjectPassNumber";
import ResultConditions from "./pages/ResultConditions";
import Library from "./pages/Library";
import Others from "./pages/Others";
import Notepad from "./pages/Notepad";
import Calculator from "./pages/Calculator";
import Help from "./pages/Help";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PaymentConfirm from "./pages/PaymentConfirm";
import FormP from "./pages/FormP";
import Query from "./pages/Query";
import User from "./pages/User";
import AdmissionRegistration from "./pages/AdmissionRegistration";
import ResultRequest from "./pages/public/ResultRequest";
import Result from "./pages/public/Result";
import OnlineAdmission from "./pages/public/OnlineAdmission";
import StudentAdmissionForm from "./pages/public/studentAddmitionForm";
import Loading from "./components/Loading/Loading";
import useTranslate from "./utils/Translate";
import ComingSoon from "./components/ComingSoon";
import DataExport from "./pages/DataExport";

const bounce = cssTransition({
  enter: "animate__animated animate__bounceIn",
  exit: "animate__animated animate__bounceOut",
});

function App() {
  const [loading, setLoading] = useState(true);
  const translate = useTranslate();
  const methods = useForm();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route path="/" element={<Home pageTitle="Home" />} />
            <Route path="general-info">
              <Route
                path="users-info"
                element={<User />}
                pageTitle="User Information"
              />
              <Route
                path="user-reports"
                element={<UserReports pageTitle="User Reports" />}
              />
              <Route path="sms" element={<SMS pageTitle="SMS List" />} />
              <Route
                path="institution-info"
                element={<Setting pageTitle="Setting" />}
              />
              <Route
                path="month-name-list"
                element={<MonthListTable pageTitle="Month Name List" />}
              />
            </Route>
            <Route path="students">
              <Route index element={<AddStudent pageTitle="Add Student" />} />
              <Route
                path="booklist"
                element={<BookList pageTitle="Book List" />}
              />
              <Route
                path="groupdistribution"
                element={<GroupDistribution pageTitle="Students Group Set" />}
              />
              <Route path="class" element={<Class pageTitle="Class" />} />
              <Route
                path="class-group"
                element={<ComingSoon pageTitle="Class Group" />}
              />
              <Route
                path="book-list"
                element={<ComingSoon pageTitle="Book List" />}
              />
              <Route
                path="group-setting"
                element={<ComingSoon pageTitle="Book List" />}
              />
              <Route
                path="id-card"
                element={<ComingSoon pageTitle="Book List" />}
              />
              <Route
                path="id-print"
                element={<ComingSoon pageTitle="Book List" />}
              />
              <Route
                path="data-export"
                element={<DataExport pageTitle="Data Export" />}
              />
              <Route
                path="group-distribution"
                element={<ComingSoon pageTitle="Book List" />}
              />
              <Route
                path="english-arobi-name"
                element={<EnglisArobihName pageTitle="English Arobi Name" />}
              />
              <Route path="section" element={<Section pageTitle="Section" />} />
              <Route
                path="sessions"
                element={<Session pageTitle="Session" />}
              />
              <Route
                path="report"
                element={<StudentReport pageTitle="Student Report" />}
              />
              <Route
                path="vacation"
                element={
                  <StudentVacationListTable pageTitle="Students Vacation" />
                }
              />
              <Route
                path="vacation/type-of-vacation"
                element={<TypeOfVacation pageTitle="Type of Vacation" />}
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
              <Route index element={<AddTeacher pageTitle="Employee" />} />
              <Route
                path="payRole"
                element={<PayRole pageTitle="Pay Role" />}
              />
              <Route
                path="pRName"
                element={<PayRoleName pageTitle="Pay Role Name" />}
              />
              <Route path="report" element={<Report pageTitle="Reports" />} />
              <Route
                path="designation"
                element={<Designations pageTitle="Designation List" />}
              />
            </Route>

            <Route path="exam" element={<Exam pageTitle="Exam" />} />

            <Route path="board_exam">
              <Route index element={<BoardExam pageTitle="Board Exam" />} />
              <Route
                path="madrasahboardinfo"
                element={
                  <MadrasahBoardInfo pageTitle="Madrasah Board Information" />
                }
              />
            </Route>

            <Route path="result">
              <Route index element={<StudentsResult pageTitle="Result" />} />
              <Route
                path="averageresult"
                element={<AverageResult pageTitle="Average Result Entry" />}
              />
              <Route path="passmarkssubject" element={<SubjectPassNumber />} />
              <Route path="resultconditions" element={<ResultConditions />} />
            </Route>

            <Route path="library" element={<Library pageTitle="Library" />} />

            <Route path="others">
              <Route index element={<Others pageTitle="Others" />} />
              <Route path="notepad" element={<Notepad pageTitle="Notepad" />} />
              <Route
                path="calculator"
                element={<Calculator pageTitle="Calculator" />}
              />
            </Route>

            <Route
              path="settings/calculator"
              element={<Calculator pageTitle="Calculator" />}
            />
            <Route path="help" element={<Help pageTitle="Help" />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path=":schoolid" element={<PublicLayout />}>
            <Route index element={<ResultRequest pageTitle="Result Page" />} />
            <Route
              path="AdmissionRegistration"
              element={<AdmissionRegistration />}
            />
            <Route
              path="students/:seassonid/:examid/:classid/:userid"
              element={<Result />}
            />
            <Route path="online_admission" element={<OnlineAdmission />} />
            <Route
              path="online_admission/:usercode"
              element={<StudentAdmissionForm />}
            />
          </Route>

          <Route path="/formp" element={<FormP />} />
          <Route path="/query" element={<Query />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

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
        className="min-h-[50px] text-[14px] font-SolaimanLipi text-white rounded-[4px] hidden_in_print"
      />
    </>
  );
}

export default App;
