import { useDispatch, useSelector } from "react-redux";
import ClickOutside from "./ClickOutside";
import { closeModal } from "../features/modal/modalSlice";
import AdmissionForm from "./Forms/AdmissionForm";
import FeeCollectionForm from "./Forms/FeeCollectionForm";
import PaymentModal from "./Modals/PaymentModal";
import AddTeacherForm from "./Forms/AddTeacherForm";
import EditTeacherForm from "./Forms/EditTeacherForm";
import TypeOfVacationForm from "./Forms/TypeOfVacationForm";
import EditStudentVacationForm from "./Forms/EditStudentVacationForm";
import AddStudentVacationForm from "./Forms/AddStudentVacationForm";
import StudentFilterModal from "./Modals/StudentFilterModal";
import MonthNamesForm from "./Forms/MonthNamesForm";
import DesignationForm from "./Forms/DesignationForm";
import EditStudentReport from "./Forms/EditStudentReport";
import SMSTemplate from "../view/general-information/sms/SMSTemplate";
import SMSBuy from "../view/general-information/sms/SMSBuy";
import PaymentGetway from "../view/general-information/sms/PaymentGetway";
import SuccessAndError from "../view/general-information/sms/SuccessAndError";
import AddEditBook from "../view/students/book/AddEditBook";
import useTranslate from "../utils/Translate";
import Subsidiary from "../view/exam/Subsidiary";
import ExamReportSetting from "../view/exam/ExamReportSetting";
import Statement from "../view/accounting/dues-list/Statement";
import BalanceTransferModal from "../view/accounting/BalanceTransferModal";
import UserSearch from "./UserSearch";
import AddLoginUsersModal from "../view/settings/AddLoginUsersModal";
import UserNamePasswordChangeModal from "../view/settings/UserNamePasswordChangeModal";
import UserFilterModal from "./Modals/UserFilterModal";
import SelectedPerStudentFeeModal from "./Modals/SelectedPerStudentFeeModal";

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
            ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
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
                {modalType === "ADD_STUDENT" && <AdmissionForm userId={id} />}
                {modalType === "FEE_COLLECTION" && (
                  <FeeCollectionForm userId={id} />
                )}
                {modalType === "PAYMENT" && <PaymentModal />}
                {modalType === "ADD_TEACHER" && <AddTeacherForm userId={id} />}
                {modalType === "EDIT_TEACHER" && (
                  <EditTeacherForm userId={id} />
                )}
                {modalType === "ADD_DESIGNATION" && <DesignationForm />}
                {modalType === "EDIT_DESIGNATION" && (
                  <DesignationForm userId={id} />
                )}
                {modalType === "ADD_TYPEOFVACATION" && <TypeOfVacationForm />}
                {modalType === "EDIT_TYPEOFVACATION" && (
                  <TypeOfVacationForm userId={id} />
                )}
                {modalType === "EDIT_STUDENTREPORT" && (
                  <EditStudentReport id={id} />
                )}
                {modalType === "ADD_STUDENTVACATION" && (
                  <AddStudentVacationForm />
                )}
                {modalType === "ADD_MONTHNAMES" && <MonthNamesForm />}
                {modalType === "EDIT_MONTHNAMES" && (
                  <MonthNamesForm id={id} isEdit={true} />
                )}
                {modalType === "EDIT_STUDENTVACATION" && (
                  <EditStudentVacationForm userId={id} />
                )}
                {modalType === "STUDENT_FILTER" && <StudentFilterModal />}
                {modalType === "USER_FILTER" && <UserFilterModal />}
                {modalType === "SELECTED_PERSTUDENT_FEE_FILTER" && <SelectedPerStudentFeeModal />}
                {modalType === "SMS_TEMPLATES" && <SMSTemplate />}
                {modalType === "SMS_BUY" && <SMSBuy />}
                {modalType === "PAYMENT_GETWAY" && <PaymentGetway />}
                {modalType === "SUCCESSANDERROR" && <SuccessAndError />}
                {modalType === "ADD_BOOK" && <AddEditBook />}
                {modalType === "UPDATE_BOOK" && <AddEditBook id={id} />}
                {modalType === "SUB_SIDIARY" && <Subsidiary />}
                {modalType === "EXAM_REPORT_SETTING" && <ExamReportSetting />}
                {modalType === "ACCOUNTING_DUES_LIST_STATEMENT" && (
                  <Statement />
                )}
                {modalType === "BALANCE_TRANSFER" && <BalanceTransferModal />}
                {modalType === "BALANCE_TRANSFER_UPDATE" && (
                  <BalanceTransferModal />
                )}
                {modalType === "USER_SEARCH" && <UserSearch />}
                {modalType === "POWER_DISTRIBUTION" && <AddLoginUsersModal />}
                {modalType === "USER_NAME_CHANGE" && (
                  <UserNamePasswordChangeModal id={id} changeType="username"/>
                )}
                {modalType === "PASSWORD_CHANGE" && (
                  <UserNamePasswordChangeModal id={id} changeType="password"/>
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
