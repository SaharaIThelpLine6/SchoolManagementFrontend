// Routes.jsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { permissionsDataList } from '../Data/permissions';
import PublicLayout from '../layout/PublicLayout';
import AdmissionRegistration from '../pages/AdmissionRegistration';
import FromP from '../pages/FormP';
import NotFound from '../pages/NotFound';
import Query from '../pages/Query';
import OnlineAdmission from '../pages/public/OnlineAdmission';
import Result from '../pages/public/Result';
import ResultRequest from '../pages/public/ResultRequest';
import StudentAdmissionForm from '../pages/public/studentAddmitionForm';
import PrivateRoute from './PrivateRoute';

// Public Pages
const Login = lazy(() => import('../pages/Login'));

// Layout
import DefaultLayout from '../layout/DefaultLayout';

// Private Pages
import PaymentModal from '../components/Modals/PaymentModal';
import StudentVacationListTable from '../components/Tables/StudentVacationListTable';
import UserPanel from '../layout/UserPanel';
import AddLoginUsers from '../pages/AddLoginUsers';
import AddStudent from '../pages/AddStudent';
import AddTeacher from '../pages/AddTeacher';
import AllMadrasah from '../pages/AllMadrasah';
import BalanceTransfer from '../pages/BalanceTransfer';
import Book from '../pages/Book';
import BulkImage from '../pages/BulkImage';
import CellfinPaymentConfirm from '../pages/CellfinPaymentConfirm';
import CertificateAttesation from '../pages/CertificateAttesation';
import CharacterReport from '../pages/CharacterReport';
import Class from '../pages/Class';
import ClassVideo from '../pages/ClassVideo';
import ComplaintBoxTermsAndConditions from '../pages/ComplaintBoxTermsAndConditions';
import DataExport from '../pages/DataExport';
import DeleteEditRecord from '../pages/DeleteEditRecord';
import DepositCosts from '../pages/DepositCosts';
import DepositCostsReport from '../pages/DepositCostsReport';
import AddDesignation from '../pages/Designations';
import DoesList from '../pages/DoesList';
import DonationReport from '../pages/DonationReport';
import DonorFeeDetermination from '../pages/DonorFeeDetermination';
import EnglisArobihName from '../pages/EnglisArobihName';
import Exam from '../pages/Exam';
import ExamAdmitCard from '../pages/ExamAdmitCard';
import ExamCondition from '../pages/ExamCondition';
import ExamFeeDetermine from '../pages/ExamFeeDetermine';
import ExamReport from '../pages/ExamReport';
import ExamRouting from '../pages/ExamRouting';
import ExamRules from '../pages/ExamRules';
import FeeCollection from '../pages/FeeCollection';
import FeeCollectionReport from '../pages/FeeCollectionReport';
import FeeSetting from '../pages/FeeSetting';
import GroupDistribution from '../pages/GroupDistribution';
import HomWork from '../pages/HomWork';
import Home from '../pages/Home';
import InstitutionInfo from '../pages/InstitutionInfo';
import MonthListTable from '../pages/MonthListTable';
import MonthlyDues from '../pages/MonthlyDues';
import OnlineAdmissionTable from '../pages/OnlineAdmissionTable';
import PayRole from '../pages/PayRole';
import PayRoleName from '../pages/PayRoleName';
import PaymentConfirm from '../pages/PaymentConfirm';
import PaymentHistory from '../pages/PaymentHistory';
import PointBasedResultCreateUpdate from '../pages/PointBasedResultCreateUpdate';
import PointBasedResultEntry from '../pages/PointBasedResultEntry';
import QueryManage from '../pages/QueryManage';
import QueryThree from '../pages/QueryThree';
import QueryTwo from '../pages/QueryTwo';
import RFIDCard from '../pages/RFIDCard';
import Report from '../pages/Report';
import ResultReport from '../pages/ResultReport';
import SMS from '../pages/SMS';
import Section from '../pages/Section';
import Session from '../pages/Session';
import Settings from '../pages/Settings';
import StudentClassRoutine from '../pages/StudentClassRoutine';
import StudentComplaint from '../pages/StudentComplaint';
import StudentGroupCreate from '../pages/StudentGroupCreate';
import StudentsFeeCollection from '../pages/StudentsFeeCollection';
import StudentsReport from '../pages/StudentsReport';
import TalentCondition from '../pages/TalentCondition';
import User from '../pages/User';
import UserImage from '../pages/UserImage';
import UserReports from '../pages/UserReports';
import YoutubeTutorials from '../pages/YoutubeTutorials';
import ClassResult from '../pages/public/ClassResult';
import ClassResultForm from '../pages/public/ClassResultForm';
import MadrashaHomePage from '../pages/public/MadrashaHomePage';
import MaritListForm from '../pages/public/MaritListForm';
import MaritListResult from '../pages/public/MaritListResult';
import ClassRoutine from '../pages/userpanel/ClassRoutine';
import Dashboard from '../pages/userpanel/Dashboard';
import ExamRoutine from '../pages/userpanel/ExamRoutine';
import HomeWorkUserPanel from '../pages/userpanel/HomeWorkUserPanel';
import InstitutionInfoUserPanel from '../pages/userpanel/InstitutionInfoUserPanel';
import OnlineAdmissionStudent from '../pages/userpanel/OnlineAdmissionStudent';
import Reports from '../pages/userpanel/Reports';
import StudentPaymentHistory from '../pages/userpanel/StudentPaymentHistory';
import StudentPaymentHistoryDetails from '../pages/userpanel/StudentPaymentHistoryDetails';
import StudentReports from '../pages/userpanel/StudentReports';
import StudentResults from '../pages/userpanel/StudentResults';
import StudentResultsView from '../pages/userpanel/StudentResultsView';
import UserLogin from '../pages/userpanel/UserLogin';
import UserProfile from '../pages/userpanel/UserProfile';
import UserRegistration from '../pages/userpanel/UserRegistration';
import VideoTutorialLink from '../pages/userpanel/VideoTutorialLink';
import WebsiteSettings from '../pages/userpanel/WebsiteSettings';
import OwenGuide from './OwenGuide';
import { RequirePermission } from './RequirePermission';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
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
            path: 'general-info',
            children: [
              {
                path: 'users-info',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_entry}
                  >
                    <User pageTitle="User Information" />
                  </RequirePermission>
                ),
              },
              {
                path: 'user-reports',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_report}
                  >
                    <UserReports pageTitle="User Reports" />
                  </RequirePermission>
                ),
              },
              {
                path: 'all-madrasah',
                element: (
                  <OwenGuide>
                    <AllMadrasah pageTitle="All Madrasah" />
                  </OwenGuide>
                ),
              },
              {
                path: 'rfid-card',
                element: (
                  <OwenGuide>
                    <RFIDCard pageTitle="All Madrasah" />
                  </OwenGuide>
                ),
              },
              {
                path: 'sms',
                element: (
                  <RequirePermission permissionId={permissionsDataList.sms}>
                    <SMS />
                  </RequirePermission>
                ),
              },
              {
                path: 'institution-info',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.institute_info}
                  >
                    <InstitutionInfo />
                  </RequirePermission>
                ),
              },
              {
                path: 'month-name-list',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.month_name}
                  >
                    <MonthListTable />
                  </RequirePermission>
                ),
              },
              {
                path: 'user-image',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_photo}
                  >
                    <UserImage />
                  </RequirePermission>
                ),
              },
              {
                path: 'bulk-image',
                element: (
                  <OwenGuide>
                    <BulkImage />
                  </OwenGuide>
                ),
              },
            ],
          },
          {
            path: 'students',
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
                path: 'sessions',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.academic_year}
                  >
                    <Session pageTitle="Session" />
                  </RequirePermission>
                ),
              },
              {
                path: 'Class',
                element: (
                  <RequirePermission permissionId={permissionsDataList.class}>
                    <Class pageTitle="Class" />
                  </RequirePermission>
                ),
              },
              {
                path: 'section',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.sub_class}
                  >
                    <Section pageTitle="Section" />
                  </RequirePermission>
                ),
              },
              {
                path: 'english-arobi-name',
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
                path: 'book-list',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.kitab_entry}
                  >
                    <Book pageTitle="Book" />
                  </RequirePermission>
                ),
              },
              {
                path: 'group-distribution',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_group_setting}
                  >
                    <GroupDistribution pageTitle="Students Group Set" />
                  </RequirePermission>
                ),
              },
              {
                path: 'data-export',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_report}
                  >
                    <DataExport pageTitle="Data Export" />
                  </RequirePermission>
                ),
              },

              {
                path: 'certificate-of-attestation',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.certificate}
                  >
                    <CertificateAttesation pageTitle="Certificate of Attestation" />
                  </RequirePermission>
                ),
              },
              {
                path: 'report',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_report}
                  >
                    <StudentsReport pageTitle="Students Report" />
                  </RequirePermission>
                ),
              },

              {
                path: 'online-admission',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_admission}
                  >
                    <OnlineAdmissionTable pageTitle="Online Admission List" />
                  </RequirePermission>
                ),
              },
              {
                path: 'class-routine',
                element: (
                  <RequirePermission permissionId={permissionsDataList.class}>
                    <StudentClassRoutine pageTitle="Class Student List" />
                  </RequirePermission>
                ),
              },
              {
                path: 'class-video',
                element: (
                  // <RequirePermission permissionId={permissionsDataList.class}>
                  <ClassVideo pageTitle="Class Video" />
                  // </RequirePermission>
                ),
              },
              {
                path: 'home-work',
                element: (
                  // <RequirePermission permissionId={permissionsDataList.class}>
                  <HomWork pageTitle="Class Video" />
                  // </RequirePermission>
                ),
              },
              // {
              //   path: 'vacation/type-of-vacation',
              //   element: (
              //     // <RequirePermission permissionId={permissionsDataList.class}>
              //     <TypeOfVacation pageTitle="Class" />
              //     // </RequirePermission>
              //   ),
              // },
            ],
          },
          {
            path: 'teacherinfo',
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
                path: 'payRole',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_payroll}
                  >
                    <PayRole pageTitle="Pay Role" />
                  </RequirePermission>
                ),
              },
              {
                path: 'pRName',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_payroll_name}
                  >
                    <PayRoleName pageTitle="Pay Role Name" />
                  </RequirePermission>
                ),
              },
              {
                path: 'report',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.teacher_report}
                  >
                    <Report pageTitle="Reports" />
                  </RequirePermission>
                ),
              },
              {
                path: 'designation',
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
            path: 'exam',
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
                path: 'fee-determine',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_fee_setting}
                  >
                    <ExamFeeDetermine pageTitle="Exam Fee Determine" />
                  </RequirePermission>
                ),
              },
              {
                path: 'exam-condition',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_condition}
                  >
                    <ExamCondition />
                  </RequirePermission>
                ),
              },

              // {
              //   path: 'list-of-candidates',
              //   element: (
              //     <RequirePermission
              //       permissionId={permissionsDataList.exam_list_generation}
              //     >
              //       <StudentGroupCreate pageTitle="List of Candidates" />
              //     </RequirePermission>
              //   ),
              // },
              {
                path: 'exam-group-create',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.exam_list_generation}
                  >
                    <StudentGroupCreate pageTitle="Exam Group Select" />
                  </RequirePermission>
                ),
              },
              {
                path: 'talent-condition',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.merit_condition}
                  >
                    <TalentCondition pageTitle="Talent Condition" />
                  </RequirePermission>
                ),
              },
              {
                path: 'admit-card',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.admit_card}
                  >
                    <ExamAdmitCard pageTitle="Students List" />
                  </RequirePermission>
                ),
              },
              {
                path: 'routing',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.routine_with_signature}
                  >
                    <ExamRouting pageTitle="Exam Routing Create" />
                  </RequirePermission>
                ),
              },
              {
                path: 'query-manage',
                element: <QueryManage pageTitle="Query Manage" />,
              },
              {
                path: 'rules',
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.exam_report}
                  // >
                  <ExamRules pageTitle="Exam Rules" />
                  // </RequirePermission>
                ),
              },
              {
                path: 'report',
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
            path: 'result',
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_entry}
                  >
                    <PointBasedResultEntry pageTitle="Online F: Publish" />
                  </RequirePermission>
                ),
              },
              {
                path: 'report',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_report}
                  >
                    {/* result report */}
                    <ResultReport pageTitle="Average V: Report" />
                  </RequirePermission>
                ),
              },

              {
                path: ':id',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.result_report}
                  >
                    <PointBasedResultCreateUpdate pageTitle="Result" />
                  </RequirePermission>
                ),
              },

              // {
              //   path: 'mark-sheet/:id',
              //   element: (
              //     <RequirePermission
              //       permissionId={permissionsDataList.marksheet}
              //     >
              //       <PointBasedMarkSheet pageTitle="Point Based Mark Sheet" />
              //     </RequirePermission>
              //   ),
              // },
            ],
          },

          {
            path: 'board-info',
            // children: [
            //   {
            //     index: true,
            //     element: (
            //       // <RequirePermission
            //       //   permissionId={permissionsDataList.certificate}
            //       // >
            //       // </RequirePermission>
            //       <MadrasahBoardInfo pageTitle="Board Exam" />
            //     ),
            //   },
            //   {
            //     path: 'exam-name',
            //     element: (
            //       // <RequirePermission
            //       //   permissionId={permissionsDataList.gate_pass_leave}
            //       // >
            //       <BoardExamName pageTitle="Board Exam Name" />
            //       // </RequirePermission>
            //     ),
            //   },
            //   {
            //     path: 'name',
            //     element: (
            //       // <RequirePermission
            //       //   permissionId={permissionsDataList.gate_pass_leave}
            //       // >
            //       <BoardNames pageTitle="Board Name" />
            //       // </RequirePermission>
            //     ),
            //   },
            //   {
            //     path: 'center-name',
            //     element: (
            //       // <RequirePermission
            //       //   permissionId={permissionsDataList.gate_pass_leave}
            //       // >
            //       <BoardCenterName pageTitle="Board Name" />
            //       // </RequirePermission>
            //     ),
            //   },
            //   {
            //     path: 'maskas-registration-fee-determine',
            //     element: (
            //       // <RequirePermission
            //       //   permissionId={permissionsDataList.gate_pass_leave}
            //       // >
            //       <BoardCenterName pageTitle="Board Name" />
            //       // </RequirePermission>
            //     ),
            //   },
            // ],
          },

          {
            path: 'darul-ikama',
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.student_report}
                  >
                    <CharacterReport pageTitle="Character Report" />
                  </RequirePermission>
                ),
              },
              {
                path: 'vacation',
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
            path: 'talimat',
            children: [
              {
                index: true,
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.student_report}
                  // >
                  <ComplaintBoxTermsAndConditions pageTitle="Complaint Box Terms and Conditions" />
                  // </RequirePermission>
                ),
              },
              {
                path: 'student-complaint',
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.gate_pass_leave}
                  // >
                  <StudentComplaint pageTitle="Student Complaints" />
                  // </RequirePermission>
                ),
              },
            ],
          },
          {
            path: 'accounting',
            children: [
              {
                index: true,
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.income_expense}
                  >
                    <DepositCosts pageTitle="Deposit Costs" />
                  </RequirePermission>
                ),
              },
              {
                path: 'income-expense-report',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.income_expense_report}
                  >
                    <DepositCostsReport pageTitle="Deposit Costs Report" />
                  </RequirePermission>
                ),
              },
              {
                path: 'fee-setting',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.fee_setting}
                  >
                    <FeeSetting pageTitle="Fee Setting" />
                  </RequirePermission>
                ),
              },
              {
                path: 'student-fee-collection',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.collect_student_fee}
                  >
                    <StudentsFeeCollection pageTitle="Student Fee Collection" />
                  </RequirePermission>
                ),
              },
              {
                path: 'dues-list',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.due_list}
                  >
                    <DoesList pageTitle="Dues List" />
                  </RequirePermission>
                ),
              },
              {
                path: 'monthly-dues',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.monthly_due_list}
                  >
                    <MonthlyDues pageTitle="Month Dues List" />
                    //{' '}
                  </RequirePermission>
                ),
              },
              {
                path: 'fee-collection-report',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.transaction_report}
                  >
                    <FeeCollectionReport pageTitle="Fee Collection Report" />
                  </RequirePermission>
                ),
              },
              {
                path: 'balance-transfer',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.balance_transfer}
                  >
                    <BalanceTransfer pageTitle="Balance Transfer" />
                  </RequirePermission>
                ),
              },
              {
                path: 'delete-edit-record',
                element: (
                  <RequirePermission
                    permissionId={permissionsDataList.user_transaction}
                  >
                    <DeleteEditRecord pageTitle="Delete Edit Record" />
                  </RequirePermission>
                ),
              },
              // {
              //   path: 'student-admission',
              //   element: (
              //     <RequirePermission
              //       permissionId={permissionsDataList.due_list}
              //     >
              //       <StudentAdmission pageTitle="Student Fee Collection" />
              //     </RequirePermission>
              //   ),
              // },
            ],
          },
          {
            path: '/payment_confirm/:schoolid/:service/:size',
            element: <PaymentConfirm />,
          },
          {
            path: 'payment-history',
            children: [
              {
                index: true,
                element: <PaymentHistory pageTitle="Payment History" />,
              },
            ],
          },
          {
            path: 'checkout',
            element: <PaymentModal pageTitle="Payment Checkout" />,
          },
          {
            path: '/sucessUrl',
            element: <CellfinPaymentConfirm />,
          },
          {
            path: '/cancelUrl',
            element: <PaymentConfirm />,
          },
          {
            path: 'donation',
            children: [
              {
                index: true,
                element: (
                  <DonorFeeDetermination pageTitle="Donor Fee Determination" />
                ),
              },
              {
                path: 'fee-collection',
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}
                  // >
                  <FeeCollection pageTitle="Fee Collection Report" />
                  // </RequirePermission>
                ),
              },
              {
                path: 'report',
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
            path: 'settings',
            children: [
              {
                index: true,
                element: <Settings pageTitle="Settings" />,
              },

              {
                path: 'add-login-users',
                element: (
                  // <RequirePermission
                  //   permissionId={permissionsDataList.st}+
                  // >
                  <AddLoginUsers pageTitle="Add Login Users" />

                  // </RequirePermission>
                ),
              },
              {
                path: 'website-settings',
                element: <WebsiteSettings pageTitle="Add Login Users" />,
              },
            ],
          },
          {
            path: 'help',
            children: [
              {
                path: 'videos',
                element: <YoutubeTutorials pageTitle="Youtube Tutorials" />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/:schoolid',
    element: <PublicLayout />,
    children: [
      { index: true, element: <MadrashaHomePage pageTitle="Result Page" /> },
      {
        path: 'student_result',
        element: <ResultRequest pageTitle="Result Page" />,
      },
      { path: 'admission-registration', element: <AdmissionRegistration /> },
      {
        path: 'students/:seassonid/:examid/:classid/:userid',
        element: <Result />,
      },
      { path: 'online_admission', element: <OnlineAdmission /> },
      { path: 'online_admission/:usercode', element: <StudentAdmissionForm /> },
      { path: 'maritlist_request', element: <MaritListForm /> },
      { path: 'maritlist/:seassonid/:examid', element: <MaritListResult /> },
      { path: 'classes', element: <ClassResultForm /> },
      { path: 'classes/:seassonid/:examid/:classid', element: <ClassResult /> },
    ],
  },
  {
    path: '/:schoolid/rg',
    element: <UserRegistration />,
  },
  {
    path: '/:schoolid/login',
    element: <UserLogin />,
  },
  {
    path: '/:schoolid/dashboard',
    element: <UserPanel />,
    children: [
      {
        index: true,
        element: <Dashboard pageTitle="Dashboard" />,
      },
      {
        path: 'user_reports',
        element: <StudentReports pageTitle="Student Reports" />,
      },
      {
        path: 'student-payment-history',
        element: <StudentPaymentHistory pageTitle="Student Payment History" />,
      },
      {
        path: 'student-payment-history/:id',
        element: (
          <StudentPaymentHistoryDetails pageTitle="Student Payment History Details" />
        ),
      },
      {
        path: 'profile-details',
        element: <UserProfile pageTitle="Student Payment History Details" />,
      },
      {
        path: 'student-results',
        element: <StudentResults pageTitle="Student Results" />,
      },
      {
        path: 'student-results/:examId/:subClassId/:sessionId/:userId',
        element: <StudentResultsView pageTitle="Student Results View" />,
      },
      {
        path: 'exam-routine',
        element: <ExamRoutine pageTitle="Exam Routine" />,
      },
      {
        path: 'online-admission',
        element: <OnlineAdmissionStudent pageTitle="Online Admission" />,
      },
      {
        path: 'institution-contact',
        element: <InstitutionInfoUserPanel pageTitle="Institution Contact" />,
      },
      {
        path: 'reports',
        element: <Reports pageTitle="Teacher Contact" />,
      },
      {
        path: 'class-routine',
        element: <ClassRoutine pageTitle="Class Routine" />,
      },
      {
        path: 'video-tutorial',
        element: <VideoTutorialLink pageTitle="Video Tutorial" />,
      },
      {
        path: 'home-work',
        element: <HomeWorkUserPanel pageTitle="Home Work" />,
      },
    ],
  },
  {
    path: '/formp',
    element: <FromP />,
  },
  {
    path: '/query',
    element: <Query />,
  },
  {
    path: '/query-two',
    element: <QueryTwo />,
  },
  {
    path: '/query-three',
    element: <QueryThree />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
