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
import { useGetLoginUsersQuery, useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import Checkbox from "../components/Checkboxes/Checkbox";
import { userStatus } from "../Data/userReportsData";
import DefaultInput from "../components/Forms/DefaultInput";
import {
  fetchSingleUser,
  setEditMode,
} from "../features/userInfo/userInfoSlice";
import ImageWithAdmissionRegisterNewOld from "../view/students/reports/ImageWithAdmissionRegisterNewOld";
import ParentsMobileNumberTwoColumn from "../view/students/reports/ParentsMobileNumberTwoColumn";
import FinancialStatusBasedAdmissionRegister from "../view/students/reports/FinancialStatusBasedAdmissionRegister";
import BirthRegistrationBasedList from "../view/students/reports/BirthRegistrationBasedList";
import AddressBasedAdmissionRegister from "../view/students/reports/AddressBasedAdmissionRegister";
import AttendanceBookWithPhoto from "../view/students/reports/AttendanceBookWithPhoto";
import { useGetDepositCostReportQuery, useGetStudentReportQuery } from "../features/userReports/userReportsSlice";
import AdmissionFormPdf from "../view/general-information/user-reports/AdmissionFormPdf";
import { useGetFundNamesQuery, useGetGeneralLedgersByFundAndCaidsQuery, useGetSubGeneralLedgersByFundIdAndGlIdQuery } from "../features/feeCollection/feeCollectionSlice";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DepositeCostLedgerWisePrint from "../view/students/reports/DepositeCostLedgerWisePrint";
import DepositeCostSubLedgerWisePrint from "../view/students/reports/DepositeCostSubLedgerWisePrint";
import DepositeCostStatementVoucharWisePrint from "../view/students/reports/DepositeCostStatementVoucharWisePrint";
import DepositeCostStatementLedgerWiseShortPrint from "../view/students/reports/DepositeCostStatementLedgerWiseShortPrint";
import SubLedgeWisePrint from "../view/students/reports/SubLedgeWisePrint";
import FundWiseDepositCostPrint from "../view/students/reports/FundWiseDepositCostPrint";
import LedgerWiseConbineFundPrint from "../view/students/reports/LedgerWiseConbineFundPrint";
import DipositeCostAllPaymentSystemDetails from "../view/students/reports/DipositeCostAllPaymentSystemDetails";
import DipositeCostGeneralLedegerReport from "../view/students/reports/DipositeCostGeneralLedegerReport";
import DipositeCostAllPaymentDetails from "../view/students/reports/DipositeCostAllPaymentDetails";
import DipositeCostBookWiseVouture from "../view/students/reports/DipositeCostBookWiseVouture";
import DepositCostSubLedgerReport from "../view/students/reports/DepositCostSubLedgerReport";
import DipositeCostPaymentSystemWise from "../view/students/reports/DipositeCostPaymentSystemWise";
import DipositeCostUserWiseSeparate from "../view/students/reports/DipositeCostUserWiseSeparate";

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
  const GLID = watch("GLID");
  const SLID = watch("SLID");
  const UserID = watch("UserID");

  const [queryParams, setQueryParams] = useState(null);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: fundNamesData } = useGetFundNamesQuery();
  const {data: generalLedgersData} =  useGetGeneralLedgersByFundAndCaidsQuery(
      { fundId: FundID, caId: Chart_of_account },
      {
        skip: !FundID || !Chart_of_account,
      }
  )
  const {data: subLedgersData} =  useGetSubGeneralLedgersByFundIdAndGlIdQuery(
      { fundId: FundID, glid: GLID },
      {
        skip: !FundID || !GLID,
      }
  )

  const {data: loginUsers} = useGetLoginUsersQuery()

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
      2, 15, 19, 21, 22, 24, 25, 26,  20, 23,
    ];
    const params = {
      report_id: reportId.includes(numericSelectedID) ? 1 : numericSelectedID,
      FundID: FundID ?? 0,
      SessionID,
      SubClassID,
      gender,
      NewOldId,
      ResidentialStatusId,
      start_date: serializeDate(StartDate),
      end_date: serializeDate(EndDate),
      report_base,
      start_vouture,
      end_vouture,
      CAID: Chart_of_account,
      GLID,
      SLID,
      UserID
    };

 
    
    console.log(params);
    

    // Clean up undefined or empty values
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== ""
      )
    );
       console.log("clean prams");
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
    Chart_of_account,
    GLID,
    SLID,
    UserID
  ]);



  useEffect(()=>{
    setValue("report_base", '')
  }, [selectedReportID])

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
    { id: "1", value: "১. জমা-খরচ ষ্টেটমেন্ট লেজার ভিত্তিক" },
    { id: "2", value: "২. জমা-খরচ ষ্টেটমেন্ট সাব লেজার ভিত্তিক" },
    { id: "3", value: "৩. জমা-খরচ ষ্টেটমেন্ট ভাউচার ভিত্তিক" },
    { id: "4", value: "৪. লেজার ভিত্তিক সংক্ষিপ্ত রিপোর্ট" },
    { id: "5", value: "৫. সাব লেজার ভিত্তিক রিপোর্ট" },
    { id: "6", value: "৬. সাব লেজার ভিত্তিক পৃথক রিপোর্ট" },
    { id: "7", value: "৭. জেনারেল লেজার ভিত্তিক রিপোর্ট" },
    { id: "8", value: "৮. লেজার ভিত্তিক সম্মিলিত ফান্ড ষ্টেটমেন্ট" },
    { id: "9", value: "৯. ফান্ড ভিত্তিক জমা-খরচ" },
    { id: "10", value: "১০. রশিদ বই ভিত্তিক সংক্ষিপ্ত রিপোর্ট" },
    { id: "12", value: "১২. জেনারেল লেজার ভিত্তিক পৃথক রিপোর্ট" },
    { id: "13", value: "১৩. জমা-খরচ সকল পেমেন্ট সিষ্টেম বিস্তারিত" },
    { id: "14", value: "১৪.জমা-খরচ পেমেন্ট সিষ্টেম ভিত্তিক সংক্ষিপ্ত" },
    { id: "16", value: "১৬. জমা-খরচ বই সহ ভাউচার ভিত্তিক" },
    { id: "17", value: "১৭. সাব লেজার ভিত্তিক রিপোর্ট" },
    { id: "18", value: "১৮. জমা-খরচ ইউজার ভিত্তিক আলাদা" },
  ];

  const CAID = [
    { id: "1", value: "জমা" },
    { id: "2", value: "খরচ" }
  ];

  const reportFieldMap = {
    SessionID: [ "11", "19", "20", "21", "22", "23", "24", "26"],
    ClassID: [ "11", "19", "21", "22", "23", "24", "26"],
    gender: ["23", "26"],
    id: [ "21"],
    RDID: ["23", "26"],
    IsActive: ["15", "19", "20", "21", "22", "23"],
    bookOfSubject: [ "11"],
    classAndSubClassData: [],
    IsActiveAdmissionForm: [ "24"],
    IdAdmissionRegister: [],
    IdAdmissionForm: ["24"],
    addresss: ["25"],
    dateFilter: ["1", "2", "4", "5","7", "8", "9", "12", "14", "17"],
    reportBase: ["3", "13", "16", "18"],
    CAID: ["4", "5", "6", "7", "12", "17"],
    GLID: ["6", "7", "12", "17"],
    SLID: ["17"],
    LoginUaser: ["18"]
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
      4: <DepositeCostStatementLedgerWiseShortPrint reportData={reportData} query={queryParams} />,
      5: <DepositeCostStatementLedgerWiseShortPrint reportData={reportData} query={queryParams} />,
      6: <SubLedgeWisePrint reportData={reportData} query={queryParams}/>,
      7: <SubLedgeWisePrint reportData={reportData} query={queryParams}/>,
      8: (<LedgerWiseConbineFundPrint reportData={reportData} query={queryParams}/>),
      9: (<FundWiseDepositCostPrint reportData={reportData} query={queryParams}/>),
      10: (<DipositeCostAllPaymentSystemDetails reportData={reportData} query={queryParams}/>),
      11: <ComingSoon />,
      12: (<DipositeCostGeneralLedegerReport reportData={reportData} query={queryParams}/>),
      13: (<DipositeCostAllPaymentDetails reportData={reportData} query={queryParams}/>),
      14: <DipositeCostPaymentSystemWise reportData={reportData} query={queryParams} />,
      15: <AdmissionFormPdf />,
      16: <DipositeCostBookWiseVouture reportData={reportData} query={queryParams} />,
      17: (<DepositCostSubLedgerReport reportData={reportData} query={queryParams}/>),
      18: <DipositeCostUserWiseSeparate reportData={reportData} query={queryParams} />,
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

            {(reportFieldMap?.CAID?.includes(selectedReportID) || (report_base && report_base == 1 && selectedReportID != 16)) && (
                <DefaultSelect
                  label={translate("Chart Of Account")}
                  options={CAID ?? []}
                  valueField="id"
                  nameField="value"
                  registerKey="CAID"
                  require={"Chart Of Account is Require"}
                />
            )}
            {(reportFieldMap?.GLID?.includes(selectedReportID)) && (
                <DefaultSelect
                  label={translate("General Ledger")}
                  options={generalLedgersData ?? []}
                  valueField="GLID"
                  nameField="GlName"
                  registerKey="GLID"
                  require={"General Ledger is Require"}
                />
            )}
            {(reportFieldMap?.SLID?.includes(selectedReportID)) && (
                <DefaultSelect
                  label={translate("Sub Ledger")}
                  options={subLedgersData ?? []}
                  valueField="SLID"
                  nameField="SlName"
                  registerKey="SLID"
                  require={"General Ledger is Require"}
                />
            )}
            {(reportFieldMap?.LoginUaser?.includes(selectedReportID)) && (
                <DefaultSelect
                  label={translate("User")}
                  options={loginUsers ?? []}
                  valueField="UserID"
                  nameField="UserName"
                  registerKey="UserID"
                  require={"User ID is Require"}
                  unicode={true}
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