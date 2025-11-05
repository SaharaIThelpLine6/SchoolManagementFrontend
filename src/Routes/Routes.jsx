// Routes.jsx
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { permissionsDataList } from "../Data/permissions";
import PublicLayout from "../layout/PublicLayout";
import AdmissionRegistration from "../pages/AdmissionRegistration";
import FromP from "../pages/FormP";
import NotFound from "../pages/NotFound";
import Query from "../pages/Query";
import OnlineAdmission from "../pages/public/OnlineAdmission";
import Result from "../pages/public/Result";
import ResultRequest from "../pages/public/ResultRequest";
import StudentAdmissionForm from "../pages/public/studentAddmitionForm";
import PrivateRoute from "./PrivateRoute";

// Public Pages
const Login = lazy(() => import("../pages/Login"));

// Layout
import DefaultLayout from "../layout/DefaultLayout";

// Private Pages
import StudentVacationListTable from "../components/Tables/StudentVacationListTable";
import AddLoginUsers from "../pages/AddLoginUsers";
import AddStudent from "../pages/AddStudent";
import AddTeacher from "../pages/AddTeacher";
import AllMadrasah from "../pages/AllMadrasah";
import AverageVCondition from "../pages/AverageVCondition";
import BalanceTransfer from "../pages/BalanceTransfer";
import BoardCenterName from "../pages/BoardCenterName";
import BoardExamName from "../pages/BoardExamName";
import BoardNames from "../pages/BoardNames";
import Book from "../pages/Book";
import BulkImage from "../pages/BulkImage";
import CellfinPaymentConfirm from "../pages/CellfinPaymentConfirm";
import CertificateAttesation from "../pages/CertificateAttesation";
import CharacterReport from "../pages/CharacterReport";
import Class from "../pages/Class";
import DataExport from "../pages/DataExport";
import DeleteEditRecord from "../pages/DeleteEditRecord";
import DepositCosts from "../pages/DepositCosts";
import DepositCostsReport from "../pages/DepositCostsReport";
import AddDesignation from "../pages/Designations";
import DoesList from "../pages/DoesList";
import DonationReport from "../pages/DonationReport";
import DonorFeeDetermination from "../pages/DonorFeeDetermination";
import EnglisArobihName from "../pages/EnglisArobihName";
import Exam from "../pages/Exam";
import ExamAdmitCard from "../pages/ExamAdmitCard";
import ExamCondition from "../pages/ExamCondition";
import ExamFeeDetermine from "../pages/ExamFeeDetermine";
import ExamReport from "../pages/ExamReport";
import ExamRouting from "../pages/ExamRouting";
import FeeCollection from "../pages/FeeCollection";
import FeeCollectionReport from "../pages/FeeCollectionReport";
import FeeSetting from "../pages/FeeSetting";
import GroupDistribution from "../pages/GroupDistribution";
import Home from "../pages/Home";
import MadrasahBoardInfo from "../pages/MadrasahBoardInfo";
import MonthListTable from "../pages/MonthListTable";
import MonthlyDues from "../pages/MonthlyDues";
import OnlineAdmissionTable from "../pages/OnlineAdmissionTable";
import PayRole from "../pages/PayRole";
import PayRoleName from "../pages/PayRoleName";
import PaymentConfirm from "../pages/PaymentConfirm";
import PaymentHistory from "../pages/PaymentHistory";
import PointBasedMarkSheet from "../pages/PointBasedMarkSheet";
import PointBasedResultCreateUpdate from "../pages/PointBasedResultCreateUpdate";
import PointBasedResultEntry from "../pages/PointBasedResultEntry";
import PointVReport from "../pages/PointVReport";
import RFIDCard from "../pages/RFIDCard";
import Report from "../pages/Report";
import SMS from "../pages/SMS";
import Section from "../pages/Section";
import Session from "../pages/Session";
import Setting from "../pages/Setting";
import Settings from "../pages/Settings";
import StudentFeeCollection from "../pages/StudentFeeCollection";
import StudentsFeeCollection from "../pages/StudentsFeeCollection";
import StudentsList from "../pages/StudentsList";
import StudentsReport from "../pages/StudentsReport";
import TalentCondition from "../pages/TalentCondition";
import TypeOfVacation from "../pages/TypeOfVacation";
import User from "../pages/User";
import UserImage from "../pages/UserImage";
import UserReports from "../pages/UserReports";
import ClassResult from "../pages/public/ClassResult";
import ClassResultForm from "../pages/public/ClassResultForm";
import MaritListForm from "../pages/public/MaritListForm";
import MaritListResult from "../pages/public/MaritListResult";
import OwenGuide from "./OwenGuide";
import { RequirePermission } from "./RequirePermission";

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
                path: "all-madrasah",
                element: (
                  <OwenGuide>
                    <AllMadrasah pageTitle="All Madrasah" />
                  </OwenGuide>
                ),
              },
              {
                path: "rfid-card",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.user_report}
                  // >
                  <RFIDCard pageTitle="All Madrasah" />
                  // </RequirePermission>
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
              {
                path: "user-image",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.month_name}
                  // >
                  <UserImage />
                  // </RequirePermission>
                ),
              },
              {
                path: "bulk-image",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.month_name}
                  // >
                  <BulkImage />
                  // </RequirePermission>
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
                path: "vacation/type-of-vacation",
                element: (
                  // <RequirePermission permissionId={permissionsDataList.class}>
                  <TypeOfVacation pageTitle="Class" />
                  // </RequirePermission>
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
                path: "exam-condition",
                element: (<RequirePermission permissionId={permissionsDataList.exam_condition}><ExamCondition /></RequirePermission>),
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
                path: "talent-condition",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.admit_card}
                  // >
                  <TalentCondition pageTitle="Talent Condition" />
                  // {/* </RequirePermission> */}
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
                path: ":id",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_report}
                  >
                    <PointBasedResultCreateUpdate pageTitle="Result" />
                  </RequirePermission>
                ),
              },

              {
                path: "report",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_report}
                  >
                    <PointVReport pageTitle="Point V: Report" />
                  </RequirePermission>
                ),
              },
              {
                path: "mark-sheet/:id",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.marksheet}
                  >
                    <PointBasedMarkSheet pageTitle="Point Based Mark Sheet" />
                  </RequirePermission>
                ),
              },
            ],
          },

          {
            path: "board-info",
            children: [
              {
                index: true,
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.certificate}
                  // >
                  // </RequirePermission>
                  <MadrasahBoardInfo pageTitle="Board Exam" />
                ),
              },
              {
                path: "exam-name",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.gate_pass_leave}
                  // >
                  <BoardExamName pageTitle="Board Exam Name" />
                  // </RequirePermission>
                ),
              },
              {
                path: "name",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.gate_pass_leave}
                  // >
                  <BoardNames pageTitle="Board Name" />
                  // </RequirePermission>
                ),
              },
              {
                path: "center-name",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.gate_pass_leave}
                  // >
                  <BoardCenterName pageTitle="Board Name" />
                  // </RequirePermission>
                ),
              },
              {
                path: "maskas-registration-fee-determine",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.gate_pass_leave}
                  // >
                  <BoardCenterName pageTitle="Board Name" />
                  // </RequirePermission>
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
            path: "accounting",
            children: [
              {
                index: true,
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.fee_setting}
                  // >
                  <DepositCosts pageTitle="Deposit Costs" />
                  // </RequirePermission>
                ),
              },
              {
                path: "income-expense-report",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.fee_setting}
                  // >
                  <DepositCostsReport pageTitle="Deposit Costs Report" />
                  // </RequirePermission>
                ),
              },
              {
                path: "fee-setting",
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.fee_setting}
                  >
                    <FeeSetting pageTitle="Fee Setting" />
                  </RequirePermission>
                ),
              },
              {
                path: "student-fee-collection",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <StudentsFeeCollection pageTitle="Student Fee Collection" />
                  // </RequirePermission>
                ),
              },
              {
                path: "student-fee-collection",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <StudentFeeCollection pageTitle="Student Fee Collection" />
                  // </RequirePermission>
                ),
              },
              {
                path: "dues-list",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <DoesList pageTitle="Dues List" />
                  // </RequirePermission>
                ),
              },
              {
                path: "monthly-dues",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <MonthlyDues pageTitle="Month Dues List" />
                  // </RequirePermission>
                ),
              },
              {
                path: "fee-collection-report",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <FeeCollectionReport pageTitle="Fee Collection Report" />
                  // </RequirePermission>
                ),
              },
              {
                path: "balance-transfer",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <BalanceTransfer pageTitle="Balance Transfer" />
                  // </RequirePermission>
                ),
              },
              {
                path: "delete-edit-record",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <DeleteEditRecord pageTitle="Delete Edit Record" />
                  // </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "/payment_confirm/:schoolid/:service/:size",
            element: <PaymentConfirm />,
          },
          {
            path: "payment-history",
            children: [
              {
                index: true,
                element: <PaymentHistory pageTitle="Payment History" />,
              },
            ],
          },
          {
            path: "/sucessUrl",
            element: <CellfinPaymentConfirm />,
          },
          {
            path: "/cancelUrl",
            element: <PaymentConfirm />,
          },
          {
            path: "donation",
            children: [
              {
                index: true,
                element: (
                  <DonorFeeDetermination pageTitle="Donor Fee Determination" />
                ),
              },
              {
                path: "fee-collection",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <FeeCollection pageTitle="Fee Collection Report" />
                  // </RequirePermission>
                ),
              },
              {
                path: "report",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <DonationReport pageTitle="Donation Report" />
                  // </RequirePermission>
                ),
              },
            ],
          },
          {
            path: "settings",
            children: [
              {
                index: true,
                element: <Settings pageTitle="Settings" />,
              },

              {
                path: "add-login-users",
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <AddLoginUsers pageTitle="Add Login Users" />

                  // </RequirePermission>
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
      {
        path: "maritlist_request",
        element: <MaritListForm />,
      },
      {
        path: "maritlist/:seassonid/:examid",
        element: <MaritListResult />,
      },
      {
        path: "classes",
        element: <ClassResultForm />,
      },
      {
        path: "classes/:seassonid/:examid/:classid",
        element: <ClassResult />,
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
