import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Checkbox from "../components/Checkboxes/Checkbox";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import AdmissionFormPdf from "../view/general-information/user-reports/AdmissionFormPdf";
import { genders, reports, userStatus } from "../Data/userReportsData";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { useGetUserReportQuery } from "../features/userReports/userReportsSlice";
import StudentsListPdf from "../view/general-information/user-reports/StudentsListPdf";
import UserSummaryReportsPdf from "../view/general-information/user-reports/UserSummaryReportsPdf";
import Swal from "sweetalert2";

const UserReports = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { userType, status } = useSelector((state) => state.settings);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });

  const showUserType = selectedReportID === 1;
  const showVacationInputs = (selectedReportID === 1) || (selectedReportID === 3);

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [admission, setAdmission] = useState(null);

  const {
    data: reportData,
    isFetching,
    isError,
    error,
  } = useGetUserReportQuery(queryParams, {
    skip: !queryParams,
  });

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
      user_type: formData.UserTypeID,
      gender: formData.GenderID,
      is_active: formData.IsActive,
      start_id: formData.StartID,
      end_id: formData.EndID,
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === "") && delete params[key]
    );

    // if (selectedReportID === 3) {
    //   setAdmission(10);
    //   setQueryParams(null);
    // } else {
    //   setAdmission(null);
    //   setQueryParams(params);
    // }
    setAdmission(null);
    setQueryParams(params);
  };

  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3">
        {/* Form */}
        <div className="print:hidden w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate("User Based Report")}
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <DefaultSelect
                label="Report"
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={reports.filter((r) =>
                  [1, 2, 3, 4].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
                defaultSelect={false}
                unicode={true}
              />

              {showUserType && (
                <DefaultSelect
                  label="User Types"
                  nameField="TypeName"
                  registerKey="UserTypeID"
                  valueField="ID"
                  options={userType}
                  type="number"
                  require="This Field is required"
                  defaultSelect={false}
                  unicode={true}
                />
              )}

              <DefaultSelect
                label="Gender"
                nameField="ReportName"
                registerKey="GenderID"
                valueField="GenderID"
                options={genders}
                type="number"
                require={
                  selectedReportID === 1 || selectedReportID === 2
                    ? "This Field is required"
                    : false
                }
                defaultSelect={false}
                unicode={true}
              />

              <Checkbox
                label={translate("User Status") + ":"}
                options={userStatus}
                registerKey="IsActive"
                require={
                  selectedReportID === 1 || selectedReportID === 2
                    ? "This Field is required"
                    : false
                }
              />

              {showVacationInputs && (
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DefaultInput
                    registerKey="StartID"
                    type="text"
                    placeholder={translate("Enter start user id") + " ..."}
                    label="Start User ID"
                  />
                  <DefaultInput
                    registerKey="EndID"
                    type="text"
                    placeholder={translate("Enter end user id") + " ..."}
                    label="End User ID"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" loading={isFetching}>
                  {translate("Preview")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>

        <div className="w-full text-sm text-black bg-white ">
          {isFetching && (
            <div className="p-2">{translate("Loading report...")}</div>
          )}

          {/* Students List Report */}
          {reportData && selectedReportID === 1 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <StudentsListPdf
                    data={reportData}
                    title={"শিক্ষার্থীদের তালিকা"}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="hidden print:block">
                <StudentsListPdf
                  data={reportData}
                  title={"শিক্ষার্থীদের তালিকা"}
                />
              </div>
            </div>
          )}

          {/* Non-Admitted Students List */}
          {reportData && selectedReportID === 4 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <StudentsListPdf
                    data={reportData}
                    title={"ভর্তি বিহীন শিক্ষার্থীদের তালিকা"}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="hidden print:block">
                <StudentsListPdf
                  data={reportData}
                  title={"ভর্তি বিহীন শিক্ষার্থীদের তালিকা"}
                />
              </div>
            </div>
          )}

          {/* User Summary Report */}
          {reportData && selectedReportID === 2 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <UserSummaryReportsPdf data={reportData} />
                </div>
              </div>
              <div className="flex justify-end mt-2 print:hidden">
                <Button onClick={() => window.print()}>
                  {translate("Print")}
                </Button>
              </div>
              <div className="hidden print:block">
                <UserSummaryReportsPdf data={reportData} />
              </div>
            </div>
          )}

          {/* Admission Form Report */}
          {reportData && selectedReportID === 3 && (
            <div className="print-container">
              <div className="w-full relative max-w-full overflow-x-auto print:hidden">
                <div className="min-w-[800px]">
                  <AdmissionFormPdf />
                </div>
              </div>
              <div className="flex justify-end mt-4 print:hidden">
                <Button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {translate("Print")}
                </Button>
              </div>
              {
                reportData.map((admissionFormData, index) => (
                  <div className="hidden print:block">
                    <AdmissionFormPdf />
                  </div>
                ))
              }

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReports;
