import { RouterProvider } from "react-router-dom";
import router from "./Routes/Routes";
import { cssTransition, ToastContainer } from "react-toastify";
import "./App.css";
import "animate.css/animate.min.css";
import { Suspense } from "react";
import Loading from "./components/Loading/Loading";
import SocketManager from "./components/socket/SocketManager";
import { useSelector } from "react-redux";

const bounce = cssTransition({
  enter: "animate__animated animate__bounceIn",
  exit: "animate__animated animate__bounceOut",
});

export default function App() {
  const { currectLanguage } = useSelector((state) => state.language);
  const fontClass = currectLanguage === "bn" ? "font-SolaimanLipi" : "font-Poppins";
  return (
    <>
      <SocketManager />
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
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
          className={`min-h-[50px] text-[14px] ${fontClass} text-white rounded-[4px] hidden_in_print`}
        />
      </Suspense>
    </>
  );
}

// import { useEffect, useState } from "react";
// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { cssTransition, ToastContainer } from "react-toastify";

// import "./App.css";
// import "animate.css/animate.min.css";

// // Layouts
// import DefaultLayout from "./layout/DefaultLayout";
// import PublicLayout from "./layout/PublicLayout";

// // Pages
// import Home from "./pages/Home";
// import AddStudent from "./pages/AddStudent";
// import BookList from "./pages/BookList";
// import GroupDistribution from "./pages/GroupDistribution";
// import Class from "./pages/Class";
// import Section from "./pages/Section";
// import Session from "./pages/Session";
// import CharacterReport from "./pages/CharacterReport";
// import TypeOfVacation from "./pages/TypeOfVacation";
// import StudentVacationListTable from "./components/Tables/StudentVacationListTable";
// import EnglisArobihName from "./pages/EnglisArobihName";
// import UserReports from "./pages/UserReports";
// import SMS from "./pages/SMS";
// import Setting from "./pages/Setting";
// import MonthListTable from "./pages/MonthListTable";
// import Quota from "./pages/Quota";
// import FormBuilder from "./pages/FormBuilder";
// import AddTeacher from "./pages/AddTeacher";
// import PayRole from "./pages/PayRole";
// import PayRoleName from "./pages/PayRoleName";
// import Report from "./pages/Report";
// import Designations from "./pages/Designations";
// import Exam from "./pages/Exam";
// import BoardExam from "./pages/BoardExam";
// import MadrasahBoardInfo from "./pages/MadrasahBoardInfo";

// import Library from "./pages/Library";
// import Others from "./pages/Others";
// import Notepad from "./pages/Notepad";
// import Calculator from "./pages/Calculator";
// import Help from "./pages/Help";
// import Login from "./pages/Login";
// import NotFound from "./pages/NotFound";
// import PaymentConfirm from "./pages/PaymentConfirm";
// import FormP from "./pages/FormP";
// import Query from "./pages/Query";
// import User from "./pages/User";
// import AdmissionRegistration from "./pages/AdmissionRegistration";
// import ResultRequest from "./pages/public/ResultRequest";
// import Result from "./pages/public/Result";
// import OnlineAdmission from "./pages/public/OnlineAdmission";
// import StudentAdmissionForm from "./pages/public/studentAddmitionForm";
// import Loading from "./components/Loading/Loading";
// import useTranslate from "./utils/Translate";
// import ComingSoon from "./components/ComingSoon";
// import DataExport from "./pages/DataExport";
// import Book from "./pages/Book";
// import CertificateAttesation from "./pages/CertificateAttesation";
// import OnlineAdmissionTable from "./pages/OnlineAdmissionTable";
// import { useGetAllUserPermissionsQuery } from "./features/permission/permissionSlice";
// import StudentsReport from "./pages/StudentsReport";
// import { permissionsDataList } from "./Data/permissions";
// import ExamFeeDetermine from "./pages/ExamFeeDetermine";
// import QueryManage from "./pages/QueryManage";
// import AverageVCondition from "./pages/AverageVCondition";
// import StudentsList from "./pages/StudentsList";
// import ExamAdmitCard from "./pages/ExamAdmitCard";
// import ExamRouting from "./pages/ExamRouting";
// import ExamReport from "./pages/ExamReport";
// import PointBasedResultEntry from "./pages/PointBasedResultEntry";
// import PointVReport from "./pages/PointVReport";
// import PointVCondition from "./pages/PointVCondition";

// const bounce = cssTransition({
//   enter: "animate__animated animate__bounceIn",
//   exit: "animate__animated animate__bounceOut",
// });

// function App() {
//   const [loading, setLoading] = useState(true);
//   const translate = useTranslate();
//   const methods = useForm();

//   const {
//     data: permissions,
//     isLoading,
//     isError,
//   } = useGetAllUserPermissionsQuery();
//   // Optional helper to confirm all is loaded and valid
//   const isPermissionsReady =
//     !isLoading && !isError && Array.isArray(permissions);

//   const hasPermission = (id) => {
//     if (!isPermissionsReady) return false;

//     return permissions.some(
//       (p) =>
//         p.PermissionListID === id &&
//         (p.PermissionView ||
//           p.PermissionInsert ||
//           p.PermissionEdit ||
//           p.PermissionDelete)
//     );
//   };

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 1500);
//   }, []);

//   return loading ? (
//     <Loading />
//   ) : (
//     <>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<DefaultLayout />}>
//             <Route path="/" element={<Home pageTitle="Home" />} />
//             <Route path="general-info">
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.user_code_setting) && (
//                   <Route
//                     path="users-info"
//                     element={<User pageTitle="User Information" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.user_report) && (
//                   <Route
//                     path="user-reports"
//                     element={<UserReports pageTitle="User Reports" />}
//                   />
//                 )}
//               {hasPermission(permissionsDataList.sms) && (
//                 <Route path="sms" element={<SMS pageTitle="SMS List" />} />
//               )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.institute_info) && (
//                   <Route
//                     path="institution-info"
//                     element={<Setting pageTitle="Setting" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.month_name) && (
//                   <Route
//                     path="month-name-list"
//                     element={<MonthListTable pageTitle="Month Name List" />}
//                   />
//                 )}
//             </Route>

//             <Route path="students">
//               <Route index element={<AddStudent pageTitle="Add Student" />} />
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.student_group_setting) && (
//                   <Route
//                     path="group-distribution"
//                     element={
//                       <GroupDistribution pageTitle="Students Group Set" />
//                     }
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.class) && (
//                   <Route path="class" element={<Class pageTitle="Class" />} />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.kitab_entry) && (
//                   <Route path="book-list" element={<Book pageTitle="Book" />} />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.student_report) && (
//                   <Route
//                     path="data-export"
//                     element={<DataExport pageTitle="Data Export" />}
//                   />
//                 )}

//               {isPermissionsReady &&
//                 hasPermission(
//                   permissionsDataList.english_name_entry ||
//                     permissionsDataList.arabic_name_entry
//                 ) && (
//                   <Route
//                     path="english-arobi-name"
//                     element={
//                       <EnglisArobihName pageTitle="English Arobi Name" />
//                     }
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.sub_class) && (
//                   <Route
//                     path="section"
//                     element={<Section pageTitle="Section" />}
//                   />
//                 )}

//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.academic_year) && (
//                   <Route
//                     path="sessions"
//                     element={<Session pageTitle="Session" />}
//                   />
//                 )}

//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.student_report) && (
//                   <Route
//                     path="report"
//                     element={<StudentsReport pageTitle="Students Report" />}
//                   />
//                 )}

//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.gate_pass_leave) && (
//                   <Route
//                     path="vacation/type-of-vacation"
//                     element={<TypeOfVacation pageTitle="Type of Vacation" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.certificate) && (
//                   <Route
//                     path="certificate-of-attestation"
//                     element={
//                       <CertificateAttesation pageTitle="Certificate of Attestation" />
//                     }
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.user_entry) && (
//                   <Route
//                     path="online-admission"
//                     element={
//                       <OnlineAdmissionTable pageTitle="Online Admission List" />
//                     }
//                   />
//                 )}
//             </Route>

//             <Route path="darul-ikama">
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.student_report) && (
//                   <Route
//                     index
//                     element={<CharacterReport pageTitle="Character Report" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.gate_pass_leave) && (
//                   <Route
//                     path="vacation"
//                     element={
//                       <StudentVacationListTable pageTitle="Students Vacation" />
//                     }
//                   />
//                 )}
//             </Route>
//             <Route
//               path="payment_confirm/:schoolid/:service/:size"
//               element={<PaymentConfirm />}
//             />
//             {/* <Route path="renew" element={<Quota type="renew" />} />
//             <Route path="quota" element={<Quota type="quota" />} />
//             <Route path="formbuilder" element={<FormBuilder />} /> */}

//             <Route path="teacherinfo">
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.teacher_info) && (
//                   <Route index element={<AddTeacher pageTitle="Employee" />} />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.teacher_payroll) && (
//                   <Route
//                     path="payRole"
//                     element={<PayRole pageTitle="Pay Role" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.teacher_payroll_name) && (
//                   <Route
//                     path="pRName"
//                     element={<PayRoleName pageTitle="Pay Role Name" />}
//                   />
//                 )}
//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.teacher_report) && (
//                   <Route
//                     path="report"
//                     element={<Report pageTitle="Reports" />}
//                   />
//                 )}

//               {isPermissionsReady &&
//                 hasPermission(permissionsDataList.teacher_designation) && (
//                   <Route
//                     path="designation"
//                     element={<Designations pageTitle="Designation List" />}
//                   />
//                 )}
//             </Route>

//             <Route path="exam">
//               <Route index element={<Exam pageTitle="Exam" />} />
//               <Route
//                 path="fee-determine"
//                 element={<ExamFeeDetermine pageTitle="Exam Fee Determine" />}
//               />
//               <Route
//                 path="point-v-condition"
//                 element={<PointVCondition pageTitle="Exam Fee Determine" />}
//               />
//               <Route
//                 path="average-v-condition"
//                 element={<AverageVCondition pageTitle="Exam Fee Determine" />}
//               />
//               <Route
//                 path="students-list"
//                 element={<StudentsList pageTitle="Students List" />}
//               />
//               <Route
//                 path="admit-card"
//                 element={<ExamAdmitCard pageTitle="Students List" />}
//               />
//               <Route
//                 path="routing"
//                 element={<ExamRouting pageTitle="Exam Routing" />}
//               />
//               <Route
//                 path="report"
//                 element={<ExamReport pageTitle="Exam Report" />}
//               />
//               <Route
//                 path="query-manage"
//                 element={<QueryManage pageTitle="Query Manage" />}
//               />
//             </Route>
//             <Route path="board_exam">
//               <Route index element={<BoardExam pageTitle="Board Exam" />} />
//               <Route
//                 path="madrasahboardinfo"
//                 element={
//                   <MadrasahBoardInfo pageTitle="Madrasah Board Information" />
//                 }
//               />
//             </Route>

//             <Route path="result">
//               <Route
//                 index
//                 element={<PointBasedResultEntry pageTitle="Result" />}
//               />
//               <Route
//                 path="report"
//                 element={
//                   <PointVReport pageTitle="Madrasah Board Information" />
//                 }
//               />
//             </Route>

//             <Route path="library" element={<Library pageTitle="Library" />} />

//             <Route path="others">
//               <Route index element={<Others pageTitle="Others" />} />
//               <Route path="notepad" element={<Notepad pageTitle="Notepad" />} />
//               <Route
//                 path="calculator"
//                 element={<Calculator pageTitle="Calculator" />}
//               />
//             </Route>

//             <Route
//               path="settings/calculator"
//               element={<Calculator pageTitle="Calculator" />}
//             />
//             <Route path="help" element={<Help pageTitle="Help" />} />
//           </Route>

//           <Route path="/login" element={<Login />} />

//           <Route path=":schoolid" element={<PublicLayout />}>
//             <Route index element={<ResultRequest pageTitle="Result Page" />} />
//             <Route
//               path="AdmissionRegistration"
//               element={<AdmissionRegistration />}
//             />
//             <Route
//               path="students/:seassonid/:examid/:classid/:userid"
//               element={<Result />}
//             />
//             <Route path="online_admission" element={<OnlineAdmission />} />
//             <Route
//               path="online_admission/:usercode"
//               element={<StudentAdmissionForm />}
//             />
//           </Route>

//           <Route path="/formp" element={<FormP />} />
//           <Route path="/query" element={<Query />} />

//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>

//       <ToastContainer
//         position="bottom-center"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         transition={bounce}
//         closeButton={false}
//         className="min-h-[50px] text-[14px] font-SolaimanLipi text-white rounded-[4px] hidden_in_print"
//       />
//     </>
//   );
// }

// export default App;
