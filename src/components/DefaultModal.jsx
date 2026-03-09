import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../features/modal/modalSlice';
import StudentIdCardGenerate from '../pages/StudentIdCardGenerate';
import ClassVideoCreateUpdate from '../pages/userpanel/ClassVideoCreateUpdate';
import StudentSingleConplaint from '../pages/userpanel/Modal/StudentSingleConplaint';
import StudentSingleReport from '../pages/userpanel/Modal/StudentSingleReport';
import PaymentModalUserPanel from '../pages/userpanel/PaymentModalUserPanel';
import useTranslate from '../utils/Translate';
import SessionCreateUpdateModal from '../view/Session/SessionCreateUpdateModal';
import SessionChangeModal from '../view/UserPanel/SessionChangeModal';
import BalanceTransferModal from '../view/accounting/BalanceTransferModal';
import BankInfoSettings from '../view/accounting/BankInfoSettings';
import ChangeStudentClass from '../view/accounting/ChangeStudentClass';
import FundForm from '../view/accounting/FundForm';
import GeneralForm from '../view/accounting/GeneralForm';
import MonthlyAttendance from '../view/accounting/MonthlyAttendance';
import ReportSettings from '../view/accounting/ReportSettings';
import StudentFeeGroup from '../view/accounting/StudentFeeGroup';
import SubGeneralForm from '../view/accounting/SubGeneralForm';
import TodaysBalance from '../view/accounting/TodaysBalance';
import Statement from '../view/accounting/dues-list/Statement';
import AccExamFeeCollector from '../view/accounting/student-exam-fee/AccExamFeeCollector';
import CommentBoxModal from '../view/accounting/student-fee-collection/CommentBoxModal';
import DueOthersStudentFeeAcceptForm from '../view/accounting/student-fee-collection/DueOthersStudentFeeAcceptForm';
import FeeSMSTamplateModal from '../view/accounting/student-fee-collection/FeeSMSTamplateModal';
import MonthStudentFeeForm from '../view/accounting/student-fee-collection/MonthStudentFeeForm';
import OthersStudentFeeAcceptForm from '../view/accounting/student-fee-collection/OthersStudentFeeAcceptForm';
import StudentAdmissionFeeAcceptForm from '../view/accounting/student-fee-collection/StudentAdmissionFeeAcceptForm';
import StudentMonthDueFeeAceptForm from '../view/accounting/student-fee-collection/StudentMonthDueFeeAceptForm';
import StudentMonthFeeAceptForm from '../view/accounting/student-fee-collection/StudentMonthFeeAceptForm';
import ClassCreateUpdateModal from '../view/class/ClassCreateUpdateModal';
import CharecterReportCategoryModal from '../view/darulikama/CharecterReportCategoryModal';
import CharecterReportTypeModal from '../view/darulikama/CharecterReportTypeModal';
import ExamReportSetting from '../view/exam/ExamReportSetting';
import Subsidiary from '../view/exam/Subsidiary';
import PaymentGetway from '../view/general-information/sms/PaymentGetway';
import SMSBuy from '../view/general-information/sms/SMSBuy';
import SMSTemplate from '../view/general-information/sms/SMSTemplate';
import SuccessAndError from '../view/general-information/sms/SuccessAndError';
import SubclassCreateUpdatemodal from '../view/section/SubclassCreateUpdatemodal';
import AddLoginUsersModal from '../view/settings/AddLoginUsersModal';
import UserNamePasswordChangeModal from '../view/settings/UserNamePasswordChangeModal';
import AdmissionSerialModal from '../view/students/admission/AdmissionSerialModal';
import AddEditBook from '../view/students/book/AddEditBook';
import ClassRoutineCreateUpdate from '../view/students/class-routine/ClassRoutineCreateUpdate';
import DataExportModel from '../view/students/pdf/DataExportModel';
import MaddrasahReportEditCreate from '../view/talimat/MaddrasahReportEditCreate';
import StudentReportView from '../view/talimat/StudentReportView';
import ClickOutside from './ClickOutside';
import AddStudentVacationForm from './Forms/AddStudentVacationForm';
import AddTeacherForm from './Forms/AddTeacherForm';
import AdmissionForm from './Forms/AdmissionForm';
import DesignationForm from './Forms/DesignationForm';
import EditStudentReport from './Forms/EditStudentReport';
import EditStudentVacationForm from './Forms/EditStudentVacationForm';
import EditTeacherForm from './Forms/EditTeacherForm';
import ExamRuleCreateUpdateForm from './Forms/ExamRuleCreateUpdateForm';
import ExamRuleView from './Forms/ExamRuleView';
import FeeCollectionForm from './Forms/FeeCollectionForm';
import HomeWorkCreateUpdateForm from './Forms/HomeWorkCreateUpdateForm';
import HomeWorkView from './Forms/HomeWorkView';
import HomeWorkViewTeacher from './Forms/HomeWorkViewTeacher';
import MonthNamesForm from './Forms/MonthNamesForm';
import TypeOfVacationForm from './Forms/TypeOfVacationForm';
import CodeSetting from './Modals/CodeSetting';
import CreateEditPaymentInfoModal from './Modals/CreateEditPaymentInfoModal';
import PaymentModal from './Modals/PaymentModal';
import PaymentSSLInfoView from './Modals/PaymentSSLInfoVierw';
import SelectedPerStudentFeeModal from './Modals/SelectedPerStudentFeeModal';
import StudentFilterModal from './Modals/StudentFilterModal';
import UserFilterModal from './Modals/UserFilterModal';
import UserSearch from './UserSearch';
import ReportHeaderModal from '../view/general-information/ReportHeaderModal';
import TimeSlotsCreateUpdate from '../view/students/class-routine/TimeSlotsCreateUpdate';
import AdmissionMessageModal from '../view/students/admission/AdmissionMessageModal';
import UserNoticeCreateForm from './Forms/UserNoticeCreateForm';
import UserNoticeUpdateForm from './Forms/UserNoticeUpdateForm';
import NoticeView from './Forms/NoticeView';

const DefaultModal = () => {
  const { isOpen, title, modalType, id } = useSelector((state) => state.modal);
  const dispatch = useDispatch();
  const translate = useTranslate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
      <ClickOutside
        className="max-w-screen-lg w-full overflow-hidden"
        onClick={() => dispatch(closeModal())}
      >
        {/* Tailwind animation */}
        <div
          className={`w-full transform transition-all duration-300 ease-out
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}
        >
          <div className="bg-white rounded-lg shadow-lg relative w-full max-h-[90vh] overflow-y-auto">
            <div className="header pl-3 pr-2 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              {title && (
                <h2 className="text-[18px] font-bold">{translate(title)}</h2>
              )}
              <button
                onClick={() => dispatch(closeModal())}
                className="text-xl"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M18 6l-12 12" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            {modalType && (
              <div className="body p-3">
                {modalType === 'ADD_STUDENT' && <AdmissionForm userId={id} />}
                {modalType === 'FEE_COLLECTION' && (
                  <FeeCollectionForm userId={id} />
                )}
                {modalType === 'PAYMENT' && <PaymentModal />}
                {modalType === 'ADD_TEACHER' && <AddTeacherForm userId={id} />}
                {modalType === 'SESSION_CREATE_FORM' && (
                  <SessionCreateUpdateModal />
                )}
                {modalType === 'SESSION_EDIT_FORM' && (
                  <SessionCreateUpdateModal id={id} />
                )}
                {modalType === 'CLASS_CREATE_FORM' && (
                  <ClassCreateUpdateModal />
                )}
                {modalType === 'CLASS_EDIT_FORM' && (
                  <ClassCreateUpdateModal id={id} />
                )}
                {modalType === 'EDIT_TEACHER' && (
                  <EditTeacherForm userId={id} />
                )}
                {modalType === 'ADD_DESIGNATION' && <DesignationForm />}
                {modalType === 'EDIT_DESIGNATION' && (
                  <DesignationForm userId={id} />
                )}
                {modalType === 'CREATE_EXAM_RULE' && (
                  <ExamRuleCreateUpdateForm />
                )}
                {modalType === 'UPDATE_EXAM_RULE' && (
                  <ExamRuleCreateUpdateForm id={id} />
                )}
                {modalType === 'CREATE_HOME_WORK' && (
                  <HomeWorkCreateUpdateForm />
                )}
                {modalType === 'UPDATE_HOME_WORK' && (
                  <HomeWorkCreateUpdateForm id={id} />
                )}
                {modalType === 'VIEW_HOME_WORK' && <HomeWorkView id={id} />}
                {modalType === 'VIEW_NOTICE_USERPANEL' && <NoticeView id={id} />}
                {modalType === 'TEACHER_VIEW_HOME_WORK' && (
                  <HomeWorkViewTeacher id={id} />
                )}
                {modalType === 'VIEW_EXAM_RULE' && <ExamRuleView id={id} />}
                {modalType === 'ADD_TYPEOFVACATION' && <TypeOfVacationForm />}
                {modalType === 'ADD_CLASS_ROUTINE' && (
                  <ClassRoutineCreateUpdate />
                )}
                {modalType === 'ADD_CLASS_ROUTINE_TIME_SLOTS' && <TimeSlotsCreateUpdate />}
                {modalType === 'EDIT_CLASS_ROUTINE' && (
                  <ClassRoutineCreateUpdate id={id} />
                )}
                {modalType === 'ADD_FUND' && <FundForm />}
                {modalType === 'OPEN_FUND' && <FundForm />}
                {modalType === 'OPEN_GENERAL' && <GeneralForm />}
                {modalType === 'OPEN_BANK_INFO' && <BankInfoSettings />}
                {modalType === 'OPEN_ACC_REPORT_SETTINGS' && <ReportSettings />}
                {modalType === 'OPEN_SUB_GENERAL' && <SubGeneralForm />}
                {modalType === 'OPEN_ACC_REPORT_SETTINGS' && <ReportSettings />}
                {modalType === 'OPEN_SUB_GENERAL' && <SubGeneralForm />}
                {modalType === 'STUDENT_FEE_GROUP' && <StudentFeeGroup />}
                {modalType === 'SECTION_CREATE_FORM' && (
                  <SubclassCreateUpdatemodal />
                )}
                {modalType === 'SECTION_EDIT_FORM' && (
                  <SubclassCreateUpdatemodal id={id} />
                )}
                {modalType === 'UPDATE_STUDENT_FEE_COMMENT_BOX' && (
                  <CommentBoxModal />
                )}
                {modalType === 'STUDENT_FEE_SMS_TAMPLATE' && (
                  <FeeSMSTamplateModal />
                )}
                {modalType === 'EDIT_TYPEOFVACATION' && (
                  <TypeOfVacationForm userId={id} />
                )}
                {modalType === 'USER_NOTICE_CREATE' && (
                  <UserNoticeCreateForm />
                )}
                {modalType === 'USER_NOTICE_UPDATE' && (
                  <UserNoticeUpdateForm id={id} />
                )}
                {modalType === 'EDIT_CLASS_VIDEO' && (
                  <ClassVideoCreateUpdate videoId={id} />
                )}
                {modalType === 'CREATE_CLASS_VIDEO' && (
                  <ClassVideoCreateUpdate />
                )}
                {modalType === 'EDIT_STUDENTREPORT' && (
                  <EditStudentReport id={id} />
                )}
                {modalType === 'ADD_STUDENTVACATION' && (
                  <AddStudentVacationForm />
                )}
                {modalType === 'ADD_MONTHNAMES' && <MonthNamesForm />}
                {modalType === 'EDIT_MONTHNAMES' && (
                  <MonthNamesForm id={id} isEdit={true} />
                )}
                {modalType === 'EDIT_STUDENTVACATION' && (
                  <EditStudentVacationForm userId={id} />
                )}

                {modalType === 'STUDENT_FILTER' && <StudentFilterModal />}
                {modalType === 'ONLINE_ADMISSION_SERIAL' && (
                  <AdmissionSerialModal />
                )}
                {modalType === 'USER_FILTER' && <UserFilterModal />}
                {modalType === 'SELECTED_PERSTUDENT_FEE_FILTER' && (
                  <SelectedPerStudentFeeModal />
                )}
                {modalType === 'SMS_TEMPLATES' && <SMSTemplate />}
                {modalType === 'SMS_BUY' && <SMSBuy />}
                {modalType === 'PAYMENT_GETWAY' && <PaymentGetway />}
                {modalType === 'SUCCESSANDERROR' && <SuccessAndError />}
                {modalType === 'ADD_BOOK' && <AddEditBook />}
                {modalType === 'CREATE_PAYMENT_INFO' && (
                  <CreateEditPaymentInfoModal />
                )}
                {modalType === 'EDIT_PAYMENT_INFO' && (
                  <CreateEditPaymentInfoModal id={id} />
                )}
                {modalType === 'CODE_SETTING' && <CodeSetting />}
                {modalType === 'UPDATE_BOOK' && <AddEditBook id={id} />}
                {modalType === 'COMPLAINT_BOX_TERMS_AND_CONDITIONS_CREATE' && (
                  <MaddrasahReportEditCreate />
                )}
                {modalType === 'COMPLAINT_BOX_TERMS_AND_CONDITIONS_UPDATE' && (
                  <MaddrasahReportEditCreate id={id} />
                )}
                {modalType === 'STUDENT_COMPLAINT_VIEW' && (
                  <StudentReportView id={id} />
                )}
                {modalType === 'ONLINE_ADMISSION_MESSAGE_UPDATE' && (
                  <AdmissionMessageModal id={id} />
                )}
                {modalType === 'VIEW_PAYMENT_INFO' && (
                  <PaymentSSLInfoView id={id} />
                )}
                {modalType === 'SUB_SIDIARY' && <Subsidiary />}
                {modalType === 'EXAM_REPORT_SETTING' && <ExamReportSetting />}
                {modalType === 'ACCOUNTING_DUES_LIST_STATEMENT' && (
                  <Statement />
                )}
                {modalType === 'BALANCE_TRANSFER' && <BalanceTransferModal />}
                {modalType === 'STUDENT_ADMISSION_FEE_ACCEPT' && (
                  <StudentAdmissionFeeAcceptForm />
                )}
                {modalType === 'STUDENT_MONTH_FEE_ACCEPT_FORM' && (
                  <StudentMonthFeeAceptForm />
                )}
                {modalType === 'STUDENT_MONTH_DUE_FEE_ACCEPT_FORM' && (
                  <StudentMonthDueFeeAceptForm />
                )}
                {modalType === 'STUDENT_MONTH_FEE_ACCEPT' && (
                  <MonthStudentFeeForm />
                )}
                {modalType === 'STUDENT_MONTHLY_ATTENDANCE' && (
                  <MonthlyAttendance />
                )}
                {modalType === 'OTHERS_STUDENT_FEE_ACCEPT' && (
                  <OthersStudentFeeAcceptForm />
                )}
                {modalType === 'DUE_OTHERS_STUDENT_FEE_ACCEPT' && (
                  <DueOthersStudentFeeAcceptForm />
                )}
                {modalType === 'ACC_EXAM_FEE_COLLECTOR' && (
                  <AccExamFeeCollector />
                )}
                {modalType === 'BALANCE_TRANSFER_UPDATE' && (
                  <BalanceTransferModal />
                )}
                {modalType === 'USER_SEARCH' && <UserSearch />}
                {modalType === 'POWER_DISTRIBUTION' && (
                  <AddLoginUsersModal id={id} />
                )}
                {modalType === 'USER_NAME_CHANGE' && (
                  <UserNamePasswordChangeModal id={id} changeType="username" />
                )}
                {modalType === 'PASSWORD_CHANGE' && (
                  <UserNamePasswordChangeModal id={id} changeType="password" />
                )}
                {modalType === 'OPEN_TODAYS_BALANCE' && <TodaysBalance />}
                {modalType === 'OPEN_PAYMENT_USER_PANEL_MODAL' && (
                  <PaymentModalUserPanel />
                )}
                {modalType === 'CHANGE_STUDENT_CLASS' && (
                  <ChangeStudentClass userId={id} />
                )}
                {modalType === 'CHARACTER_REPORT_CATEGORY' && (
                  <CharecterReportCategoryModal />
                )}
                {modalType === 'CHARACTER_REPORT_TYPE' && (
                  <CharecterReportTypeModal />
                )}
                {modalType === 'DATA_EXPORT_FEILD' && (
                  <DataExportModel userData={id} />
                )}
                {modalType === 'STUDENT_ID_CARD' && (
                  <StudentIdCardGenerate fields={id} />
                )}
                {/* User Panel Models */}
                {modalType === 'SESSION_CHANGE_MODEL' && (
                  <SessionChangeModal id={id} />
                )}
                {modalType === 'MOBILE_PANEL_STUDENT_REPORT' && (
                  <StudentSingleReport id={id} />
                )}
                {modalType === 'STUDENT_COMPLAINT_REPORT' && (
                  <StudentSingleConplaint id={id} />
                )}
                {modalType === 'REPORT_HEADER_MODAL' && (
                  <ReportHeaderModal id={id} />
                )}
              </div>
            )}
          </div>
        </div>
      </ClickOutside>
    </div>
  );
};

export default DefaultModal;
