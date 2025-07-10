import { useEffect, useState } from "react";
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
import { useGetUserReportQuery } from "../features/userReports/userReportsSlice";
import Swal from "sweetalert2";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery } from "../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import ExamRoutingCheckbox from "../components/Checkboxes/ExamRoutingCheckbox";
import DefaultInput from "../components/Forms/DefaultInput";

const PointVReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "ClassID",
          "Optional",
          "SizeStatus",
        ].includes(fieldName);
      case 2:
        return ["ReportID", "SessionID", "RDID", "ExamID", "ClassID"].includes(
          fieldName
        );
      case 3:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "ClassID",
          "Optional",
          "SizeStatus",
        ].includes(fieldName);
      case 4:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "ClassID",
          "Optional",
        ].includes(fieldName);
      case 5:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "ClassID",
          "DefaultInput",
        ].includes(fieldName);
      case 6:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "ClassID",
          "DefaultInput",
        ].includes(fieldName);
      case 7:
        return [
          "ReportID",
          "SessionID",
          "RDID",
          "ExamID",
          "ClassID",
          "Optional",
        ].includes(fieldName);

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { isFetching, isError, error } = useGetUserReportQuery(queryParams, {
    skip: !queryParams,
  });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();

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
    const params = {
      report_id: formData.ReportID,
      session_id: formData.SessionID,
      class_id: formData.ClassID,
      exam_id: formData.ExamID,
      residential_id: formData.RDID,
      language_id: formData.id,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === "") && delete params[key]
    );

    setQueryParams(params);
  };

  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3">
        <div className="print:hidden w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate("Result Report")}
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
                  [1, 2, 3, 4, 5, 6, 7].includes(r.ReportID)
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
              {shouldShowFields("Optional") && (
                <DefaultSelect
                  label={translate("Optional") + " :"}
                  nameField="name"
                  registerKey="OptionalID"
                  valueField="id"
                  options={resultReportOptional ?? []}
                  require={"This Field is required"}
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
              {shouldShowFields("DefaultInput") && (
                <div className="flex flex-col md:flex-row gap-4 ">
                  <DefaultInput
                    registerKey="Fee"
                    // label={`${translate("Fee")}: `}
                  />
                  <DefaultInput
                    registerKey="Fee"
                    // label={`${translate("Fee")}: `}
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
        </div>
      </div>
    </div>
  );
};

export default PointVReport;
