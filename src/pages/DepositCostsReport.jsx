import { FormProvider, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import useTranslate from "../utils/Translate";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import {
  useGetClassListQuery,
  useGetSubClassListQuery,
} from "../features/class/classQuerySlice";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import Checkbox from "../components/Checkboxes/Checkbox";
import { userStatus } from "../Data/userReportsData";
import DefaultInput from "../components/Forms/DefaultInput";
import {
  fetchSingleUser,
  setEditMode,
} from "../features/userInfo/userInfoSlice";
import {
  fetchSettingsData,
  fetchDidata,
  fetchThanadata,
} from "../features/settings/settingsSlice";
import AdmissionRegisterPrint from "../view/students/reports/AdmissionRegisterPrint";
import OldNewRegisterList from "../view/students/reports/OldNewRegisterList";
import JamaatBasedNewOldTotalStudent from "../view/students/reports/JamaatBasedNewOldTotalStudent";
import StudentsListTwoColumns from "../view/students/reports/StudentsListTwoColumns";
import ParentsMobileNumberList from "../view/students/reports/ParentsMobileNumberList";
import JamaatWariBookList from "../view/students/reports/JamaatWariBookList";
import BanglaAttendence from "../view/students/reports/BanglaAttendence";
import BanglaAttendenceSubjectWari from "../view/students/reports/BanglaAttendenceSubjectWari";
import AdmissionRegisterSerial from "../view/students/reports/AdmissionRegisterSerial";
import AllStudentsStatistics from "../view/students/reports/AllStudentsStatistics";
import IdAdmissionRegister from "../view/students/reports/IdAdmissionRegister";
import AdmissionResigterAllStudentsSerial from "../view/students/reports/AdmissionResigterAllStudentsSerial";
import ImageWithAdmissionRegisterNewOld from "../view/students/reports/ImageWithAdmissionRegisterNewOld";
import ParentsMobileNumberTwoColumn from "../view/students/reports/ParentsMobileNumberTwoColumn";
import FinancialStatusBasedStatistics from "../view/students/reports/FinancialStatusBasedStatistics";
import FinancialStatusBasedAdmissionRegister from "../view/students/reports/FinancialStatusBasedAdmissionRegister";
import BirthRegistrationBasedList from "../view/students/reports/BirthRegistrationBasedList";
import ParentsInfo from "../view/students/reports/ParentsInfo";
import AdmissionFormWithID from "../view/students/reports/AdmissionFormWithID";
import AddressBasedAdmissionRegister from "../view/students/reports/AddressBasedAdmissionRegister";
import AttendanceBookWithPhoto from "../view/students/reports/AttendanceBookWithPhoto";
import { useGetDepositCostReportQuery, useGetStudentReportQuery } from "../features/userReports/userReportsSlice";
import AdmissionFormPdf from "../view/general-information/user-reports/AdmissionFormPdf";
import { useGetFundNamesQuery } from "../features/feeCollection/feeCollectionSlice";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DepositeCostLedgerWisePrint from "../view/students/reports/DepositeCostLedgerWisePrint";
import DepositeCostSubLedgerWisePrint from "../view/students/reports/DepositeCostSubLedgerWisePrint";
import DepositeCostStatementVoucharWisePrint from "../view/students/reports/DepositeCostStatementVoucharWisePrint";

const DepositCostsReport = ({ pageTitle }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { register, handleSubmit, watch, setValue, getValues, reset } = methods;

  const [selectedReportComponent, setSelectedReportComponent] = useState(null);
  const reportRef = useRef(null);
  const selectedReportID = watch("reportType");
  const FundID = watch("FundID");
  const SessionID = watch("SessionID");
  const SubClassID = watch("SubClassID");
  const gender = watch("gender");
  const NewOldId = watch("NewOldId");
  const ResidentialStatusId = watch("ResidentialStatusId");
  const BookLine = watch("BookLine");
  const StartDate = watch("StartDate");
  const EndDate = watch("EndDate");
  const report_base = watch("report_base");
  const Chart_of_account = watch("CAID");
  const start_vouture = watch("start_vouture");
  const end_vouture = watch("end_vouture");

  const [queryParams, setQueryParams] = useState(null);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: fundNamesData } = useGetFundNamesQuery();

  const defaultData = useSelector((state) => state.userInfo.defaultFormValue);
  const editMode = useSelector((state) => state.userInfo.editMode);
  const dispatch = useDispatch();
  const { divition, district, thana, status, error } = useSelector(
    (state) => state.settings
  );

  // Helper function to convert Date objects to ISO strings
  // const serializeDate = (date) => {
  //   if (!date) return undefined;
  //   if (date instanceof Date) {
  //     return date.toISOString();
  //   }
  //   return date;
  // };

  const serializeDate = (date) => {
    if (!date) return undefined;
    return date instanceof Date ? date.toISOString() : date;
  };

  // Query params effect - only set params if FundID is selected
  useEffect(() => {
    const numericSelectedID = Number(selectedReportID);
    const reportId = [
      2, 4, 5, 8, 9, 12, 14, 15, 16, 17, 18, 19, 21, 22, 24, 25, 26,
      7, 10, 11, 20, 23,
    ];
    const params = {
      report_id: reportId.includes(numericSelectedID) ? 1 : numericSelectedID,
      FundID: FundID ?? 0,
      SessionID,
      SubClassID,
      gender,
      NewOldId,
      ResidentialStatusId,
      // Convert Date objects to ISO strings for serialization
      StartDate: serializeDate(StartDate),
      EndDate: serializeDate(EndDate),
      report_base,
      start_vouture,
      end_vouture,
      CAID: Chart_of_account

    };

    console.log(params);
    

    // Clean up undefined or empty values
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    );
    console.log(cleanedParams);
    // Only set params if FundID is present and report_id is valid
    if (cleanedParams.FundID && cleanedParams.FundID !== 0 && cleanedParams.report_id) {
      setQueryParams(cleanedParams);
    } else {
      setQueryParams(null); // Clear params if FundID is not selected
    }
  }, [
    selectedReportID,
    FundID,
    SessionID,
    SubClassID,
    gender,
    NewOldId,
    ResidentialStatusId,
    StartDate,
    EndDate,
    report_base,
    start_vouture,
    end_vouture,
    Chart_of_account

  ]);

  // Query only if queryParams are ready and valid
  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useGetDepositCostReportQuery(queryParams, {
    skip: !queryParams || Object.keys(queryParams).length === 0,
    refetchOnMountOrArgChange: true,
  });

  // Debug log
  useEffect(() => {
    if (isError) {
      console.error("Error fetching report data");
    }
    if (reportData) {
      console.log("Report data:", reportData);
    }
  }, [reportData, isError]);

  useEffect(() => {
    if (editMode === 2) {
      const formUserid = getValues("UserID");
      const actualUserId = defaultData.UserID;
      if (formUserid !== actualUserId) {
        dispatch(setEditMode(1));
        dispatch(fetchSingleUser(formUserid));
      }
    }
  }, [editMode, getValues, defaultData, dispatch]);

  if (status === "failed") {
    console.error("Settings status failed:", error);
    return <div>{translate("Failed to load settings data")}</div>;
  }

  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];
  
  const newAndOldData = [
    { id: "1", value: "নতুন" },
    { id: "2", value: "পুরাতন" },
    { id: "3", value: "উভয়" },
  ];
  
  const classAndSubClassData = [
    { id: "1", name: "ক্লাস" },
    { id: "2", name: "সাব ক্লাস" },
  ];
  
  const admissionData = [
    { id: "1", name: "ভর্তির আগে" },
    { id: "2", name: "ভর্তির পরে" },
  ];
  
  const bookOfSubjectData = [
    { id: "3", name: "3 বিষয়ের খাতা" },
    { id: "5", name: "5 বিষয়ের খাতা" },
    { id: "6", name: "6 বিষয়ের খাতা" },
    { id: "7", name: "7 বিষয়ের খাতা" },
    { id: "8", name: "8 বিষয়ের খাতা" },
    { id: "9", name: "9 বিষয়ের খাতা" },
    { id: "10", name: "10 বিষয়ের খাতা" },
  ];

  const reportBase = [
    { id: "1", name: "Voucher" },
    { id: "2", name: "Date" }
  ];

  const studentReportData = [
    { id: "1", value: "১. জমা-খরচ স্টেটমেন্ট লেজার ভিত্তিক" },
    { id: "2", value: "২. জমা-খরচ স্টেটমেন্ট সাব লেজার ভিত্তিক" },
    { id: "3", value: "৩. জমা-খরচ স্টেটমেন্ট ভাউচার ভিত্তিক" },
    { id: "4", value: "৪. লেজার ভিত্তিক সংক্ষিপ্ত রির্পোট" },
  ];
  const CAID = [
    { id: "1", value: "জমা" },
    { id: "2", value: "খরচ" }
  ];

  const reportFieldMap = {
    SessionID: ["5", "8", "9", "10", "11", "12", "13", "14", "16", "17", "18", "19", "20", "21", "22", "23", "24", "26"],
    ClassID: [ "5", "6", "7", "8", "9", "10", "11", "14", "18", "19", "21", "22", "23", "24", "26"],
    gender: ["8", "12", "23", "26", "16"],
    id: ["12", "17", "16", "18", "21"],
    RDID: ["5", "8", "9", "12", "23", "26"],
    IsActive: [ "5", "7", "8", "12", "15", "17", "18", "19", "20", "21", "22", "23"],
    bookOfSubject: ["9", "11"],
    classAndSubClassData: ["13"],
    IsActiveAdmissionForm: ["14", "24"],
    IdAdmissionRegister: ["16"],
    IdAdmissionForm: ["24"],
    addresss: ["25"],
    dateFilter: ["1", "2"],
    reportBase: ["3"],
    CAID: ["3", "4"]
  };

  const ComingSoon = () => {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">
            Coming Soon
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            We're working hard to bring you something amazing. Stay tuned...
          </p>
        </div>
      </div>
    );
  };

  const onSubmit = (data) => {
    console.log(data);

    const reportComponents = {
      1: <DepositeCostLedgerWisePrint reportData={reportData} query={queryParams}   />,
      2: (
        <DepositeCostSubLedgerWisePrint
          reportData={reportData} query={queryParams} 
        />
      ),
      3: <DepositeCostStatementVoucharWisePrint reportData={reportData} query={queryParams} />,
      4: <StudentsListTwoColumns reportData={reportData} />,
      5: (
        <ParentsMobileNumberList
          reportData={reportData}
          SubClassID={SubClassID}
          SessionID={SessionID}
        />
      ),
      6: <JamaatWariBookList reportData={reportData} SubClassID={SubClassID} />,
      7: <ComingSoon />,
      8: (
        <BanglaAttendence
          reportData={reportData}
          SubClassID={SubClassID}
          SessionID={SessionID}
        />
      ),
      9: (
        <BanglaAttendenceSubjectWari
          reportData={reportData}
          SubClassID={SubClassID}
          BookLine={BookLine}
        />
      ),
      10: <ComingSoon />,
      11: <ComingSoon />,
      12: (
        <AdmissionRegisterSerial
          reportData={reportData}
          SessionID={SessionID}
        />
      ),
      13: <ComingSoon />,
      14: <AdmissionFormPdf SubClassID={SubClassID} SessionID={SessionID} />,
      15: <AdmissionFormPdf />,
      16: <IdAdmissionRegister reportData={reportData} />,
      17: (
        <AdmissionResigterAllStudentsSerial
          reportData={reportData}
          SessionID={SessionID}
        />
      ),
      18: <ImageWithAdmissionRegisterNewOld reportData={reportData} />,
      19: <ParentsMobileNumberTwoColumn reportData={reportData} />,
      20: <ComingSoon />,
      21: <FinancialStatusBasedAdmissionRegister reportData={reportData} />,
      22: <BirthRegistrationBasedList reportData={reportData} />,
      23: <ComingSoon />,
      24: <AdmissionFormPdf SubClassID={SubClassID} SessionID={SessionID} />,
      25: <AddressBasedAdmissionRegister reportData={reportData} />,
      26: <AttendanceBookWithPhoto reportData={reportData} />,
    };

    const component = reportComponents[selectedReportID] || null;
    setSelectedReportComponent(component);

    // Trigger print only if data is available and component is set
    if (component && reportData && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      console.warn("Cannot print: Data not ready or component not set.");
    }
    // reset();
  };

  return (
    <>
      <div className="bg-white p-6 md:p-4 rounded-xl shadow-lg font-SolaimanLipi hidden_in_print">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate("Deposit and Spend Report")}
          </h3>
        </div>
        <FormProvider {...methods}>
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
              <DefaultSelect
                label={translate("Report Type") + " :"}
                options={studentReportData ?? []}
                valueField="id"
                nameField="value"
                registerKey="reportType"
                require="Report Type is required"
              />
              
              <DefaultSelect
                label="Fund"
                options={fundNamesData ?? []}
                valueField="FundID"
                nameField="FundName"
                registerKey="FundID"
                unicode={true}
                require={"Fund is required!"}
              />



              {reportFieldMap.reportBase.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("report base")}
                  options={reportBase ?? []}
                  valueField="id"
                  nameField="name"
                  registerKey="report_base"
                  require={"Report Base is require is Require"}

                />
                
              )}

                {
                  report_base == 2 ? (
                    <div className="flex gap-4">
                      <DatePickerOne
                        registerKey={"StartDate"}
                        placeholder={"Start Date"}
                        dateCalender={"Start Date"}
                        require={"Start Date is required"}
                        disable={false}
                      />
                      <DatePickerOne
                        registerKey={"EndDate"}
                        placeholder={"End Date"}
                        dateCalender={"End Date"}
                        require={"End Date is required"}
                        disable={false}
                      />
                    </div>
                  ) : null
                }

              {reportFieldMap?.CAID.includes(selectedReportID) && report_base && report_base == 1 && (
                <DefaultSelect
                  label={translate("Chart Of Account")}
                  options={CAID ?? []}
                  valueField="id"
                  nameField="value"
                  registerKey="CAID"
                  require={"Chart Of Account is Require"}
                />
              )}
              {report_base == 1 && (
                <div className="flex col-span-2 gap-4">
                  <DefaultInput
                    label={translate("Start Vouture")}
                    registerKey="start_vouture"
                    require={"Start Vouture Number is Require"}
                  />
                  <DefaultInput
                    label={translate("End Vouture")}
                    registerKey="end_vouture"
                    require={"End Vouture Number is Require"}
                  />
                </div>
              )}
              
              {reportFieldMap.classAndSubClassData.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("Class And Subclass") + " :"}
                  options={classAndSubClassData ?? []}
                  valueField="id"
                  nameField="name"
                  registerKey="id"
                />
              )}
              
              {reportFieldMap.bookOfSubject.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("Book of subjects") + " :"}
                  options={bookOfSubjectData ?? []}
                  valueField="id"
                  nameField="name"
                  registerKey="BookLine"
                />
              )}
              
              {reportFieldMap.ClassID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("SubClass") + " :"}
                  options={subClassListData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode={true}
                />
              )}
              
              {reportFieldMap.gender.includes(selectedReportID) && (
                <DefaultSelect
                  label={<p className="text-gray-700 font-medium">{translate("Gender")}:</p>}
                  options={genderOptions}
                  valueField="id"
                  nameField="value"
                  registerKey="gender"
                />
              )}
              
              {reportFieldMap.id.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("New/Old") + " :"}
                  options={newAndOldData ?? []}
                  valueField="id"
                  nameField="value"
                  registerKey="NewOldId"
                />
              )}
              
              {reportFieldMap.RDID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("Residential") + " :"}
                  options={residentialData ?? []}
                  valueField="RDID"
                  nameField="ResidentialName"
                  registerKey="ResidentialStatusId"
                />
              )}
              
              {reportFieldMap.IdAdmissionRegister.includes(selectedReportID) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DefaultInput
                    label={translate("Id one") + " :"}
                    registerKey="IdOne"
                  />
                  <DefaultInput
                    label={translate("Id two") + " :"}
                    registerKey="IdTwo"
                  />
                </div>
              )}
              
              {reportFieldMap.IdAdmissionForm.includes(selectedReportID) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DefaultInput
                    label={translate("Id one") + " :"}
                    registerKey="IdOne"
                  />
                </div>
              )}
              
              {reportFieldMap.IsActive.includes(selectedReportID) && (
                <Checkbox
                  label={translate("User Status") + ":"}
                  options={userStatus}
                  registerKey="is_active"
                />
              )}

              {reportFieldMap.SessionID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate("Session") + " :"}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
              )}
              
              {reportFieldMap.IsActiveAdmissionForm.includes(selectedReportID) && (
                <Checkbox
                  label={translate("Admission Status") + ":"}
                  options={admissionData}
                  registerKey="IsActive"
                />
              )}

              {reportFieldMap.dateFilter.includes(selectedReportID) && (
                <div className="flex gap-4">
                  <DatePickerOne
                    registerKey={"StartDate"}
                    placeholder={"Start Date"}
                    dateCalender={"Start Date"}
                    require={"Start Date is required"}
                    disable={false}
                  />
                  <DatePickerOne
                    registerKey={"EndDate"}
                    placeholder={"End Date"}
                    dateCalender={"End Date"}
                    require={"End Date is required"}
                    disable={false}
                  />
                </div>
              )}

           

              <div className="pt-7 w-full">
                <Button type="submit" className="w-full md:w-auto">
                  {translate("Preview")}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      {selectedReportComponent && (
        <div ref={reportRef} className="mt-4">
          {selectedReportComponent}
        </div>
      )}
    </>
  );
};

export default DepositCostsReport;