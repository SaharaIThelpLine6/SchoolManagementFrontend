import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import {
  examVacationStatus,
  resultReportOptional,
  resultReports,
  resultReportSizeStatus,
} from "../Data/userReportsData";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { useGetAverageVReportQuery, useGetUserReportQuery, usePostResultReportSettingsMutation } from "../features/userReports/userReportsSlice";
import Swal from "sweetalert2";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import ExamRoutingCheckbox from "../components/Checkboxes/ExamRoutingCheckbox";
import DefaultInput from "../components/Forms/DefaultInput";
import ReportByIDSerial from "../view/students/reports/result-reports/ReportByIDSerial";
import ShortFormatReport from "../view/students/reports/result-reports/ShortFormatReport";
import AdmissionFormWithResult from "../view/students/reports/result-reports/AdmissionFormWithResult";
import DailyAttendenceList from "../view/students/reports/result-reports/DailyAttendenceList";
import AdmissionDynamicFormWithResult from "../view/students/reports/result-reports/AdmissionDynamicFormWithResult";
import { useAddStudentMutation } from "../features/onlineAdmission/onlineAdmissionSlice";

const AverageVReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);
 const formRef = useRef();
  const { control, handleSubmit } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });
  const [selectedReportComponent, setSelectedReportComponent] = useState(null);

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "SubClassID",
          "Optional",
          "SizeStatus",
        ].includes(fieldName);
      case 2:
        return ["ReportID", "SessionID", "RDID", "ExamID", "SubClassID"].includes(
          fieldName
        );
      case 3:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "SubClassID",
          "Optional",
          "SizeStatus",
        ].includes(fieldName);
      case 4:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "SubClassID",
          "Optional",
        ].includes(fieldName);
      case 5:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 6:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 7:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "ClassID",
          "Optional",
          "UserCode",
        ].includes(fieldName);
      case 8:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data, isFetching, isError, error, data: reportData } = useGetAverageVReportQuery(queryParams, {
    skip: !queryParams
  });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subclassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();
  // const [
  //   updateResultReport,
  //   { isLoading: resultReportUpdating, isError: resultReportUpdatingError, isSuccess: resultReportUpdateSuccess, data: resultReportUpdatingResponse },
  // ] = usePostResultReportSettingsMutation();
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
      session_id: formData.SessionID,
      class_id: formData.ClassID,
      subclass_id: formData.SubClassID,
      exam_id: formData.ExamID,
      residential_id: formData.RDID,
      language_id: formData.id,
      is_active: formData.IsActive,
      usercode: formData.UserCode
    };
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === "") && delete params[key]
    );

    setQueryParams({ ...params });
  };


  useEffect(() => {
    console.log(data);
  }, [data])

  // if(isFetching){
  //   console.log("Fetching......");

  // }

  // const handelFromEdit = async () => {
  //   const content = formRef.current?.getEditorContent();
  //   await updateResultReport({
  //     "Description1": content
  //   }).unwrap()
  // };
  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3">
        <div className=" w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite print:hidden">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate(pageTitle)}
          </h1>
          

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Report Select - Always shown */}
              <DefaultSelect
                label={translate("Report") + ":"}
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={resultReports.filter((r) =>
                  [1, 2, 3, 4, 5, 6, 7, 8].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
              />

              {/* Conditionally shown fields */}
              {shouldShowFields("SessionID") && (
                <DefaultSelect
                  label={translate("Session") + " :"}
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
                  label={translate("Exam") + " :"}
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
                  label={translate("Class") + " :"}
                  nameField="ClassName"
                  registerKey="ClassID"
                  valueField="ClassID"
                  options={classListData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}

              {shouldShowFields("SubClassID") && (
                <DefaultSelect
                  label={translate("Sub Class") + " :"}
                  nameField="SubClass"
                  registerKey="SubClassID"
                  valueField="SubClassID"
                  options={subclassListData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {/*  */}

              {shouldShowFields("RDID") && (
                <DefaultSelect
                  label={translate("Residential") + " :"}
                  nameField="ResidentialName"
                  registerKey="RDID"
                  valueField="RDID"
                  options={residentialData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {shouldShowFields("ExamVacationStatus") && (
                <div className="col-span-2">
                  <ExamRoutingCheckbox
                    label={translate("Exam Routine") + " :"}
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
              {shouldShowFields("SizeStatus") && (
                <div className="">
                  <ExamRoutingCheckbox
                    label={translate("Size Status") + " :"}
                    options={resultReportSizeStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? "This Field is required"
                        : false
                    }
                  />
                </div>
              )}
              {shouldShowFields("UserCode") && (
                <div className="flex flex-col md:flex-row gap-4 ">
                  <DefaultInput
                    registerKey="UserCode"
                    label={`${translate("User Code")}: `}
                  />
                  
                </div>
              )}

              <div className="md:col-span-4 flex justify-end gap-2">
                <Button type="submit" loading={isFetching}>
                  {translate("Preview")}
                </Button>
                <Button onClick={() => window.print()} className="bg-yellow-600">
                  {translate("Print")}
                </Button>
              </div>
            </form>
          </FormProvider>



        </div>
        <div className="w-full text-sm text-black bg-white ">
          {isFetching && (
            <div className="p-2">{translate("Loading report...")}</div>
          )}


          {reportData && (selectedReportID === 1 || selectedReportID === 2) && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <ReportByIDSerial reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <ReportByIDSerial reportData={reportData} query={queryParams} />
              </div>
            </div>
          )}

          {reportData && selectedReportID === 4 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <ReportByIDSerial reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <ReportByIDSerial reportData={reportData} query={queryParams} />
              </div>
            </div>
          )}

          {reportData && selectedReportID === 5 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <ShortFormatReport reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <ShortFormatReport reportData={reportData} query={queryParams} />
              </div>
            </div>
          )}

          {reportData && selectedReportID === 6 && (
            <div className="">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="max-w-[750px] mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} ref={formRef} />
                </div>
              </div>
            
              <div className="w-full relative max-w-full print_canvas">
                <div className="min-w-[750px]  mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}

           {reportData && selectedReportID === 7 && (
            <div className="">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="max-w-[750px] mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <div className="min-w-[750px]  mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}

          {reportData && selectedReportID === 8 && (
            <div className="">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="mx-auto">
                  <DailyAttendenceList reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <div className="mx-auto">
                  <DailyAttendenceList reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}

          {reportData && selectedReportID === 10 && (
            <div className="">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="max-w-[750px] mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="w-full relative max-w-full print_canvas">
                <div className="min-w-[750px]  mx-auto">
                  <AdmissionFormWithResult reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}




        </div>
      </div>

    </div>
  );
};

export default AverageVReport;
