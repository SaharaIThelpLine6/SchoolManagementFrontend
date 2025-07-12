// Routes.jsx
import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { permissionsDataList } from "../Data/permissions";

// Public Pages
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import PublicLayout from "../layout/PublicLayout";
import ResultRequest from "../pages/public/ResultRequest";
import AdmissionRegistration from "../pages/AdmissionRegistration";
import Result from "../pages/public/Result";
import OnlineAdmission from "../pages/public/OnlineAdmission";
import StudentAdmissionForm from "../pages/public/studentAddmitionForm";
import FromP from "../pages/FormP";
import Query from "../pages/Query";

// Layout
import DefaultLayout from "../layout/DefaultLayout";

// Private Pages
import Home from "../pages/Home";
import User from "../pages/User";
import UserReports from "../pages/UserReports";
import SMS from "../pages/SMS";
import Setting from "../pages/Setting";
import MonthListTable from "../pages/MonthListTable";
import AddStudent from "../pages/AddStudent";
import GroupDistribution from "../pages/GroupDistribution";
import { RequirePermission } from "./RequirePermission";
import Class from "../pages/Class";
import Book from "../pages/Book";
import DataExport from "../pages/DataExport";
import EnglisArobihName from "../pages/EnglisArobihName";
import Section from "../pages/Section";
import Session from "../pages/Session";
import StudentsReport from "../pages/StudentsReport";
import TypeOfVacation from "../pages/TypeOfVacation";
import CertificateAttesation from "../pages/CertificateAttesation";
import OnlineAdmissionTable from "../pages/OnlineAdmissionTable";
import AddTeacher from "../pages/AddTeacher";
import PayRole from "../pages/PayRole";
import PayRoleName from "../pages/PayRoleName";
import Report from "../pages/Report";
import AddDesignation from "../pages/Designations";
import Exam from "../pages/Exam";
import PointVCondition from "../pages/PointVCondition";
import ExamFeeDetermine from "../pages/ExamFeeDetermine";
import AverageVCondition from "../pages/AverageVCondition";
import StudentsList from "../pages/StudentsList";
import ExamAdmitCard from "../pages/ExamAdmitCard";
import ExamRouting from "../pages/ExamRouting";
import ExamReport from "../pages/ExamReport";
import PointBasedResultEntry from "../pages/PointBasedResultEntry";
import PointVReport from "../pages/PointVReport";
import CharacterReport from "../pages/CharacterReport";
import StudentVacationListTable from "../components/Tables/StudentVacationListTable";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "general-info",
            children: [
              {
                path: "users-info",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_entry}
                  >
                    <User pageTitle="User Information" />
                  </RequirePermission>
                ),
              },
              {
                path: "user-reports",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_report}
                  >
                    <UserReports pageTitle="User Reports" />
                  </RequirePermission>
                ),
              },
              {
                path: "sms",
                element: (
                  <RequirePermission permissionId={permissionsDataList.sms}>
                    <SMS />
                  </RequirePermission>
                ),
              },
              {
                path: "institution-info",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.institute_info}
                  >
                    <Setting />
                  </RequirePermission>
                ),
              },
              {
                path: "month-name-list",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.month_name}
                  >
                    <MonthListTable />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "students",
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_admission}
                  >
                    <AddStudent pageTitle="Add Student" />
                  </RequirePermission>
                ),
              },
              {
                path: "group-distribution",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_group_setting}
                  >
                    <GroupDistribution pageTitle="Students Group Set" />
                  </RequirePermission>
                ),
              },
              {
                path: "Class",
                element: (
                  <RequirePermission permissionId={permissionsDataList.class}>
                    <Class pageTitle="Class" />
                  </RequirePermission>
                ),
              },
              {
                path: "book-list",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.kitab_entry}
                  >
                    <Book pageTitle="Book" />
                  </RequirePermission>
                ),
              },
              {
                path: "data-export",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_report}
                  >
                    <DataExport pageTitle="Data Export" />
                  </RequirePermission>
                ),
              },
              {
                path: "english-arobi-name",
                element: (
                  <RequirePermission
                    permissionId={
                      permissionsDataList.english_name_entry ||
                      permissionsDataList.arabic_name_entry
                    }
                  >
                    <EnglisArobihName pageTitle="English Arobi Name" />
                  </RequirePermission>
                ),
              },
              {
                path: "section",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.sub_class}
                  >
                    <Section pageTitle="Section" />
                  </RequirePermission>
                ),
              },
              {
                path: "sessions",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.academic_year}
                  >
                    <Session pageTitle="Session" />
                  </RequirePermission>
                ),
              },
              {
                path: "report",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_report}
                  >
                    <StudentsReport pageTitle="Students Report" />
                  </RequirePermission>
                ),
              },
              {
                path: "certificate-of-attestation",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.certificate}
                  >
                    <CertificateAttesation pageTitle="Certificate of Attestation" />
                  </RequirePermission>
                ),
              },
              {
                path: "online-admission",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_entry}
                  >
                    <OnlineAdmissionTable pageTitle="Online Admission List" />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "teacherinfo",
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_info}
                  >
                    <AddTeacher pageTitle="Employee" />
                  </RequirePermission>
                ),
              },
              {
                path: "payRole",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_payroll}
                  >
                    <PayRole pageTitle="Pay Role" />
                  </RequirePermission>
                ),
              },
              {
                path: "pRName",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_payroll_name}
                  >
                    <PayRoleName pageTitle="Pay Role Name" />
                  </RequirePermission>
                ),
              },
              {
                path: "report",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_report}
                  >
                    <Report pageTitle="Reports" />
                  </RequirePermission>
                ),
              },
              {
                path: "designation",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_designation}
                  >
                    <AddDesignation pageTitle="Designation List" />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "exam",
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_name}
                  >
                    <Exam pageTitle="Exam" />
                  </RequirePermission>
                ),
              },
              {
                path: "fee-determine",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_fee_setting}
                  >
                    <ExamFeeDetermine pageTitle="Exam Fee Determine" />
                  </RequirePermission>
                ),
              },
              {
                path: "point-v-condition",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_condition}
                  >
                    <PointVCondition pageTitle="Exam Fee Determine" />
                  </RequirePermission>
                ),
              },
              {
                path: "average-v-condition",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_condition}
                  >
                    <AverageVCondition pageTitle="Exam Fee Determine" />
                  </RequirePermission>
                ),
              },
              {
                path: "list-of-candidates",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_list_generation}
                  >
                    <StudentsList pageTitle="List of Candidates" />
                  </RequirePermission>
                ),
              },
              {
                path: "admit-card",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.admit_card}
                  >
                    <ExamAdmitCard pageTitle="Students List" />
                  </RequirePermission>
                ),
              },
              {
                path: "routing",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.routine_with_signature}
                  >
                    <ExamRouting pageTitle="Exam Routing" />
                  </RequirePermission>
                ),
              },
              //   {
              //     path: "query-manage",
              //     element: <QueryManage pageTitle="Query Manage" />,
              //   },
              {
                path: "report",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_report}
                  >
                    <ExamReport pageTitle="Exam Report" />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "darul-ikama",
            children: [
              {
                index: true,
                element: (
                    <RequirePermission
                      permissionId={permissionsDataList.certificate}
                    >
                  <CharacterReport pageTitle="Character Report" />
                    </RequirePermission>
                ),
              },
              {
                path: "vacation",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.gate_pass_leave}
                  >
                    <StudentVacationListTable pageTitle="Type of Vacation" />
                  </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "result",
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_entry}
                  >
                    <PointBasedResultEntry pageTitle="Result" />
                  </RequirePermission>
                ),
              },
              {
                path: "report",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_report}
                  >
                    <PointVReport pageTitle="Madrasah Board Information" />
                  </RequirePermission>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/:schoolid",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <ResultRequest pageTitle="Result Page" />,
      },
      {
        path: "admission-registration",
        element: <AdmissionRegistration />,
      },
      {
        path: "students/:seassonid/:examid/:classid/:userid",
        element: <Result />,
      },
      {
        path: "online_admission",
        element: <OnlineAdmission />,
      },
      {
        path: "online_admission/:usercode",
        element: <StudentAdmissionForm />,
      },
    ],
  },
  {
    path: "/formp",
    element: <FromP />,
  },
  {
    path: "/query",
    element: <Query />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
