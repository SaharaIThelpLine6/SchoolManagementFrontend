import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import { donationReports, feeStatus } from "../Data/userReportsData";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { useGetUserReportQuery } from "../features/userReports/userReportsSlice";
import Swal from "sweetalert2";
import {
  useGetDistrictsQuery,
  useGetDivisionsQuery,
  useGetPoliceStationsQuery,
  useGetResidentialQuery,
} from "../features/settings/settingsQuerySlice";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultRadio from "../components/Radio/DefaultRadio";

const DonationReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit, watch } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });
  const [DivisionID, DistrictID] = watch(["DivisionID", "DistrictID"]);

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return ["Date"].includes(fieldName);
      case 2:
        return ["AdmissionFeeStatus", "Date"].includes(fieldName);
      case 3:
        return ["AdmissionFeeStatus", "Input", "Date"].includes(fieldName);
      case 4:
        return ["AdmissionFeeStatus", "InputTwo"].includes(fieldName);
      case 5:
        return ["AdmissionFeeStatus"].includes(fieldName);
      case 6:
        return [].includes(fieldName);
      case 7:
        return ["AdmissionFeeStatus", "FeeStatus"].includes(fieldName);
      case 8:
        return ["AdmissionFeeStatus", "FeeStatus"].includes(fieldName);
      case 9:
        return ["AdmissionFeeStatus", "Address"].includes(fieldName);

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { isFetching, isError, error } = useGetUserReportQuery(queryParams, {
    skip: !queryParams,
  });

  const { data: residentialData } = useGetResidentialQuery();
  const { data: divisionData } = useGetDivisionsQuery();
  const { data: districtData } = useGetDistrictsQuery(DivisionID, {
    skip: !DivisionID,
  });
  const { data: thanaData } = useGetPoliceStationsQuery(DistrictID, {
    skip: !DistrictID,
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
    const params = {};

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
            {translate("Donation Report")}
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
                options={donationReports.filter((r) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
                defaultSelect={false}
                unicode={true}
              />
              {shouldShowFields("Input") && (
                <DefaultInput
                  label={"Default"}
                  placeholder="Enter date"
                  registerKey="VacationDateTo"
                />
              )}{" "}
              {shouldShowFields("AdmissionFeeStatus") && (
                <DefaultSelect
                  label="Admission Fee Status"
                  nameField="ResidentialName"
                  registerKey="RDID"
                  valueField="RDID"
                  options={residentialData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}
              {shouldShowFields("Address") && (
                <>
                  <DefaultSelect
                    label="Division"
                    nameField="DivisionName"
                    registerKey="DivisionID"
                    valueField="DivisionID"
                    options={divisionData ?? []}
                    require={"This Field is required"}
                    unicode={true}
                  />
                  <DefaultSelect
                    label="District"
                    nameField="DistrictName"
                    registerKey="DistrictID"
                    valueField="DistrictID"
                    options={districtData ?? []}
                    require={"This Field is required"}
                    unicode={true}
                  />
                  <DefaultSelect
                    label="Police Station"
                    nameField="PoliceStationName"
                    registerKey="PoliceStationID"
                    valueField="PoliceStationID"
                    options={thanaData ?? []}
                    require={"This Field is required"}
                    unicode={true}
                  />
                </>
              )}{" "}
              {shouldShowFields("FeeStatus") && (
                <div className="">
                  <DefaultRadio
                    label="Fee Status"
                    options={feeStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? "This Field is required"
                        : false
                    }
                  />
                </div>
              )}
              {shouldShowFields("InputTwo") && (
                <div className="flex flex-row justify-between gap-3">
                  <DefaultInput
                    label={"From"}
                    placeholder="Enter date"
                    registerKey="VacationDateTo"
                  />
                  <DefaultInput
                    label={"To"}
                    placeholder="Enter date"
                    registerKey="VacationDateTo"
                  />
                </div>
              )}
              {shouldShowFields("Date") && (
                <div className="flex flex-row justify-between gap-3">
                  <DatePickerOne
                    dateCalender="Form"
                    placeholder="Enter date"
                    registerKey="VacationDateFrom"
                    require="Date Required"
                  />
                  <DatePickerOne
                    dateCalender="to"
                    placeholder="Enter date"
                    registerKey="VacationDateTo"
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
        </div>
      </div>
    </div>
  );
};

export default DonationReport;
