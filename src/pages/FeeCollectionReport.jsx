import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import {
  colorStatus,
  feeCollectionReport,
  examVacationStatus,
  language,
} from "../Data/userReportsData";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { useGetFeeCollectionReportQuery, useGetUserReportQuery } from "../features/userReports/userReportsSlice";
import Swal from "sweetalert2";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery } from "../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import { useGetLoginUsersQuery, useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import ExamRoutingCheckbox from "../components/Checkboxes/ExamRoutingCheckbox";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DefaultInput from "../components/Forms/DefaultInput";
import StudentsListPdf from "../view/general-information/user-reports/StudentsListPdf";
import DailyFeeCollection from "../view/students/fee-collection-reports/DailyFeeCollection";
import DailyFeeCollectionSessonWise from "../view/students/fee-collection-reports/DailyFeeCollectionSessonWise";
import DailyFeeCollectionUserWise from "../view/students/fee-collection-reports/DailyFeeCollectionUserWise";

const FeeCollectionReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit, setValue } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return ["ReportID", "SessionID", "GenderID", "RDID", "Date"].includes(
          fieldName
        );
      case 2:
        return ["ReportID", "GenderID", "RDID", "Date"].includes(fieldName);
      case 3:
        setValue("DateStart", null)
        setValue("DateEnd", null)
        return ["ReportID", "SessionID", "GenderID", "RDID", "UserID"].includes(
          fieldName
        );
      case 4:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "GenderID",
          "RDID",
          "Date",
        ].includes(fieldName);
      case 5:
        return ["ReportID", "SessionID", "Date"].includes(fieldName);
      case 6:
        return ["ReportID", "SessionID", "UserNameID", "Date"].includes(
          fieldName
        );
      case 7:
        return ["ReportID", "SessionID", "GenderID", "RDID", "Date"].includes(
          fieldName
        );
      case 8:
        return ["ReportID", "GenderID", "RDID", "Date"].includes(fieldName);
      case 9:
        return ["ReportID", "SessionID"].includes(fieldName);
      case 10:
        return ["ReportID", "SessionID", "Date"].includes(fieldName);
      case 11:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "NewOldID",
          "GenderID",
          "RDID",
        ].includes(fieldName);
      case 12:
        return [
          "ReportID",
          "SessionID",
          "NewOldID",
          "GenderID",
          "RDID",
        ].includes(fieldName);
      case 13:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "NewOldID",
          "GenderID",
          "RDID",
        ].includes(fieldName);
      case 14:
        return [
          "ReportID",
          "SessionID",
          "NewOldID",
          "GenderID",
          "RDID",
        ].includes(fieldName);
      case 15:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "NewOldID",
          "GenderID",
          "SelectTwoID",
          "RDID",
        ].includes(fieldName);
      case 16:
        return [
          "ReportID",
          "SessionID",
          "NewOldID",
          "GenderID",
          "SelectTwoID",
          "RDID",
        ].includes(fieldName);
      case 17:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "NewOldID",
          "GenderID",
          "SelectTwoID",
          "RDID",
        ].includes(fieldName);
      case 18:
        return [
          "ReportID",
          "SessionID",
          "NewOldID",
          "GenderID",
          "SelectTwoID",
          "RDID",
        ].includes(fieldName);
      case 19:
        return ["ReportID", "SessionID", "ClassID"].includes(fieldName);
      case 20:
        return ["ReportID", "GenderID", "RDID", "Date"].includes(fieldName);
      case 21:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "StatusFeeID",
          "GenderID",
          "RDID",
          "Date",
        ].includes(fieldName);
      case 22:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "GenderID",
          "RDID",
          "Date",
        ].includes(fieldName);
      case 23:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "StatusFeeID",
          "GenderID",
          "RDID",
          "Date",
        ].includes(fieldName);
      case 24:
        return [
          "ReportID",
          "SessionID",
          "ClassID",
          "GenderID",
          "NewOldID",
          "RDID",
        ].includes(fieldName);

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { isFetching, isError, error, data: reportData } = useGetFeeCollectionReportQuery(queryParams, {
    skip: !queryParams,
  });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: userNameData } = useGetLoginUsersQuery();

  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (status === "idle") {
      dispatch(fetchSettingsData());
    }
  }, [status, dispatch, pageTitle]);

  useEffect(() => {
    if (isError && error) {
      setErrorMessage(
        error.status === 403
          ? translate("You do not have permission to view this report")
          : error.status === 400
            ? translate("Missing or invalid data provided")
            : translate("An error occurred while fetching the report")
      );
    } else {
      setErrorMessage(null);
    }
  }, [isError, error, translate]);

  useEffect(() => {
    if (errorMessage) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
      });
    }
  }, [errorMessage]);

  const onSubmit = (formData) => {
    console.log(formData);

    const params = {
      report_id: formData.ReportID,
      gender: formData.GenderID,
      session_id: formData.SessionID,
      class_id: formData.ClassID,
      exam_id: formData.ExamID,
      residential_id: formData.RDID,
      start_date: formData.DateStart ? new Date(formData.DateStart).toDateString() : null,
      end_date: formData.DateEnd ? new Date(formData.DateEnd).toDateString() : null,
      start_id: formData.StartId,
      end_id: formData.EndId,
      user_id: formData.UserID
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === "") && delete params[key]
    );
    console.log(params);


    setQueryParams(params);
  };

  const genderData = [
    { GenderID: 1, GenderName: "ছেলে" },
    { GenderID: 2, GenderName: "মেয়ে" },
    { GenderID: 3, GenderName: "উভয়" },
  ];
  const newOldData = [
    { newOldID: 1, newOldName: "নতুন" },
    { newOldID: 2, newOldName: "পুরাতন" },
    { newOldID: 3, newOldName: "উভয়" },
  ];
  // const userNameData = [
  //   { UserID: 1, UserName: "JohnDoe" },
  //   { UserID: 2, UserName: "JaneSmith" },
  //   { UserID: 3, UserName: "AlexJohnson" },
  //   { UserID: 4, UserName: "SarahWilliams" },
  //   { UserID: 5, UserName: "MichaelBrown" },
  //   { UserID: 6, UserName: "EmilyDavis" },
  //   { UserID: 7, UserName: "RobertWilson" },
  //   { UserID: 8, UserName: "JessicaTaylor" },
  //   { UserID: 9, UserName: "DavidMiller" },
  //   { UserID: 10, UserName: "OliviaAnderson" },
  // ];

  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3">
        <div className="print:hidden w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate("Fee Collection Report")}
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Report Select - Always shown */}
              <DefaultSelect
                label="Report"
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={feeCollectionReport.filter((r) =>
                  [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20, 21, 22, 23, 24,
                  ].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
                defaultSelect={false}
                unicode={true}
              />
              {/* Conditionally shown fields */}
              {shouldShowFields("SessionID") && (
                <DefaultSelect
                  label="Session"
                  nameField="SessionName"
                  registerKey="SessionID"
                  valueField="SessionID"
                  options={sessionData ?? []}
                  require="This Field is required"
                  defaultSelect={false}
                  unicode={true}
                />
              )}
              {shouldShowFields("ExamID") && (
                <DefaultSelect
                  label="Exam"
                  nameField="ExamName"
                  registerKey="ExamID"
                  valueField="ExamID"
                  options={examNameData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {shouldShowFields("ClassID") && (
                <DefaultSelect
                  label="Class"
                  nameField="ClassName"
                  registerKey="ClassID"
                  valueField="ClassID"
                  options={classListData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {shouldShowFields("UserNameID") && (
                <DefaultSelect
                  label="User Name"
                  nameField="UserName"
                  registerKey="UserID"
                  valueField="UserID"
                  options={userNameData ?? []}
                  required="This field is required"
                  defaultSelect={false}
                />
              )}
              {shouldShowFields("GenderID") && (
                <DefaultSelect
                  label="Gender"
                  nameField="GenderName"
                  registerKey="GenderID"
                  valueField="GenderID"
                  options={genderData ?? []}
                  required="This field is required"
                  defaultSelect={false}
                />
              )}
              {shouldShowFields("RDID") && (
                <DefaultSelect
                  label="Residential"
                  nameField="ResidentialName"
                  registerKey="RDID"
                  valueField="RDID"
                  options={residentialData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}{" "}
              {shouldShowFields("NewOldID") && (
                <DefaultSelect
                  label="New/Old"
                  nameField="newOldName"
                  registerKey="newOldID"
                  valueField="newOldID"
                  options={newOldData ?? []}
                  require={"This Field is required"}
                />
              )}
              {shouldShowFields("Langauge") && (
                <DefaultSelect
                  label="Langauge"
                  nameField="name"
                  registerKey="id"
                  valueField="id"
                  options={language ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {shouldShowFields("ExamVacationStatus") && (
                <div className="col-span-2">
                  <ExamRoutingCheckbox
                    label="Exam Routine"
                    options={examVacationStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? "This Field is required"
                        : false
                    }
                  />
                </div>
              )}
              {shouldShowFields("ColorStatus") && (
                <div className="">
                  <ExamRoutingCheckbox
                    label="Color Status"
                    options={colorStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? "This Field is required"
                        : false
                    }
                  />
                </div>
              )}{" "}
              {shouldShowFields("StatusFeeID") && (
                <DefaultSelect
                  label="Status Fee"
                  nameField="name"
                  registerKey="id"
                  valueField="id"
                  options={language ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}{" "}
              {shouldShowFields("Date") && (
                <div className="flex justify-between items-center gap-2">
                  <DatePickerOne
                    dateCalender="Start"
                    placeholder="Enter date"
                    registerKey="DateStart"
                    require="Date Required"
                  />{" "}
                  <DatePickerOne
                    dateCalender="End"
                    placeholder="Enter date"
                    registerKey="DateEnd"
                    require="Date Required"
                  />
                </div>
              )}{" "}
              {shouldShowFields("SelectTwoID") && (
                <div className="flex justify-between items-center gap-2">
                  <DefaultSelect
                    label="Status One"
                    nameField="name"
                    registerKey="id"
                    valueField="id"
                    options={language ?? []}
                    require={"This Field is required"}
                    unicode={true}
                  />
                  <DefaultSelect
                    label="Status Two"
                    nameField="name"
                    registerKey="id"
                    valueField="id"
                    options={language ?? []}
                    require={"This Field is required"}
                    unicode={true}
                  />
                </div>
              )}{" "}
              {shouldShowFields("UserID") && (
                <div className="flex justify-between items-center gap-2">
                  <DefaultInput
                    label="Start Book ID"
                    placeholder=""
                    registerKey="StartId"
                    require="Date Required"
                  />
                  <DefaultInput
                    label="End Book ID"
                    placeholder=""
                    registerKey="EndId"
                    require="Date Required"
                  />
                </div>
              )}
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" loading={isFetching}>
                  {translate("Preview")}
                </Button>
              </div>
            </form>
          </FormProvider>

          <div className="w-full text-sm text-black bg-white ">
            {isFetching && (
              <div className="p-2">{translate("Loading report...")}</div>
            )}


            {reportData && (selectedReportID === 1 || selectedReportID === 6) && (
              <div className="print-container">
                <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                  <div className="min-w-[800px]">
                    <DailyFeeCollection
                      reportData={reportData}
                      title={"শিক্ষার্থীদের তালিকা"}
                      query={queryParams}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2 print:hidden">
                  <Button onClick={() => window.print()}>
                    {translate("Print")}
                  </Button>
                </div>
                <div className="w-full relative max-w-full print_canvas">
                  <DailyFeeCollection
                    reportData={reportData}
                    title={"শিক্ষার্থীদের তালিকা"}
                    query={queryParams}
                  />
                </div>
              </div>
            )}

            {reportData && selectedReportID === 2 && (
              <div className="print-container">
                <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                  <div className="min-w-[800px]">
                    <DailyFeeCollectionSessonWise
                      reportData={reportData}
                      title={"রিপোর্ট ২ এর শিরোনাম"}
                      query={queryParams}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2 print:hidden">
                  <Button onClick={() => window.print()}>
                    {translate("Print")}
                  </Button>
                </div>
                <div className="w-full relative max-w-full print_canvas">
                  <DailyFeeCollectionSessonWise
                    reportData={reportData}
                    title={"রিপোর্ট ২ এর শিরোনাম"}
                    query={queryParams}
                  />
                </div>
              </div>
            )}
            {reportData && selectedReportID === 3 && (
              <div className="print-container">
                <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                  <div className="min-w-[800px]">
                    <DailyFeeCollection
                      reportData={reportData}
                      title={"রিপোর্ট ২ এর শিরোনাম"}
                      query={queryParams}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2 print:hidden">
                  <Button onClick={() => window.print()}>
                    {translate("Print")}
                  </Button>
                </div>
                <div className="w-full relative max-w-full print_canvas">
                  <DailyFeeCollection
                    reportData={reportData}
                    title={"রিপোর্ট ২ এর শিরোনাম"}
                    query={queryParams}
                  />
                </div>
              </div>
            )}
            {reportData && selectedReportID === 4 && (
              <div className="print-container">
                <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                  <div className="min-w-[800px]">
                    <DailyFeeCollection
                      reportData={reportData}
                      title={"রিপোর্ট ২ এর শিরোনাম"}
                      query={queryParams}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2 print:hidden">
                  <Button onClick={() => window.print()}>
                    {translate("Print")}
                  </Button>
                </div>
                <div className="w-full relative max-w-full print_canvas">
                  <DailyFeeCollection
                    reportData={reportData}
                    title={"রিপোর্ট ২ এর শিরোনাম"}
                    query={queryParams}
                  />
                </div>
              </div>
            )}
            {reportData && selectedReportID === 5 && (
              <div className="print-container">
                <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                  <div className="min-w-[800px]">
                    <DailyFeeCollectionUserWise
                      reportData={reportData}
                      title={`গ্রহিতা হিসেবে ফি গ্রহণ তালিকা`}
                      query={queryParams}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-2 print:hidden">
                  <Button onClick={() => window.print()}>
                    {translate("Print")}
                  </Button>
                </div>
                <div className="w-full relative max-w-full print_canvas">
                  <DailyFeeCollection
                    reportData={reportData}
                    title={"গ্রহিতা হিসেবে ফি গ্রহণ তালিকা"}
                    query={queryParams}
                  />
                </div>
              </div>
            )}


          </div>


        </div>
      </div>
    </div>
  );
};

export default FeeCollectionReport;
