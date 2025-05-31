import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useWatch } from "react-hook-form";
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

const UserReports = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { userType, status } = useSelector((state) => state.settings);
  const { control, handleSubmit, formState: { errors } } = useFormContext();
  const selectedReportID = useWatch({ control, name: "ReportID" });

  const showUserType = selectedReportID === 1;
  const showVacationInputs = selectedReportID === 1;

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data: reportData, isFetching, isError, error } = useGetUserReportQuery(queryParams, {
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

  // Log reportData when it changes
  useEffect(() => {
    if (reportData) {
      console.log("reportData:", reportData);
    }
  }, [reportData]);

  const onSubmit = async (formData) => {
    const params = {
      report_id: formData.ReportID,
      user_type: formData.UserTypeID,
      gender: formData.GenderID,
      is_active: formData.IsActive,
      start_id: formData.StartID,
      end_id: formData.EndID,
    };

    // // Remove empty/null values
    // Object.keys(params).forEach(
    //   (key) => (params[key] === undefined || params[key] === "") && delete params[key]
    // );

    console.log("Query params:", params);
    setQueryParams(params);
  };

  return (
    <div className="p-4 pt-0 font-SolaimanLipi">
      <div className="flex gap-3 flex-col">
        {/* Form Section */}
        <div className="w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate("User Based Report")}
          </h1>

          {errorMessage && (
            <div className="text-red-500 mb-4">{errorMessage}</div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <DefaultSelect
              label={translate("Report") + ":"}
              nameField="ReportName"
              registerKey="ReportID"
              valueField="ReportID"
              options={reports.filter(r => [1, 2, 4].includes(r.ReportID))}
              type="number"
              require="This Field is required"
              disabled={false}
              defaultSelect={false}
              unicode={true}
            />

            {showUserType && (
              <DefaultSelect
                label={translate("User Types") + ":"}
                nameField="TypeName"
                registerKey="UserTypeID"
                valueField="ID"
                options={userType}
                type="number"
                require="This Field is required"
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
            )}

            <DefaultSelect
              label={translate("Gender") + ":"}
              nameField="ReportName"
              registerKey="GenderID"
              valueField="GenderID"
              options={genders}
              type="number"
              require={selectedReportID === 1 || selectedReportID === 2 ? "This Field is required" : false}
              disabled={false}
              defaultSelect={false}
              unicode={true}
            />

            <Checkbox
              label={translate("User Status") + ":"}
              options={userStatus}
              registerKey="IsActive"
              require={selectedReportID === 1 || selectedReportID === 2 ? "This Field is required" : false}
            />

            {showVacationInputs && (
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DefaultInput
                  registerKey="StartID"
                  require={translate("Start User ID is required")}
                  type="text"
                  placeholder={translate("Enter start user id") + " ..."}
                  label={translate("Start User ID") + ":"}
                />
                <DefaultInput
                  registerKey="EndID"
                  require={translate("End User ID is required")}
                  type="text"
                  placeholder={translate("Enter end user id") + " ..."}
                  label={translate("End User ID") + ":"}
                />
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" loading={isFetching}>
                {translate("Preview")}
              </Button>
            </div>
          </form>
        </div>

        <div className="w-full text-sm text-black">
          {isFetching && <div>{translate("Loading report...")}</div>}
          {reportData && <AdmissionFormPdf data={reportData} />}
        </div>
      </div>
    </div>
  );
};

export default UserReports;

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useFormContext, useWatch } from "react-hook-form";
// import { setPageName } from "../features/auth/authSlice";
// import useTranslate from "../utils/Translate";
// import DefaultSelect from "../components/Forms/DefaultSelect";
// import Checkbox from "../components/Checkboxes/Checkbox";
// import Button from "../components/Button/Button";
// import DefaultInput from "../components/Forms/DefaultInput";
// import AdmissionFormPdf from "../view/general-information/user-reports/AdmissionFormPdf";
// import { genders, reports, userStatus } from "../Data/userReportsData";
// import { fetchSettingsData } from "../features/settings/settingsSlice";

// const UserReports = ({ pageTitle }) => {
//   const translate = useTranslate();
//   const dispatch = useDispatch();
//   const { userType, status } = useSelector((state) => state.settings);

//   const {
//     control,
//     handleSubmit,
//     formState: { errors },
//   } = useFormContext();

//   const selectedReportID = useWatch({
//     control,
//     name: "ReportID",
//   });

//   const showUserType = selectedReportID === 1;
//   const showVacationInputs = selectedReportID === 1 || selectedReportID === 3;

//   useEffect(() => {
//     dispatch(setPageName(pageTitle));
//     if (status === "idle") {
//       dispatch(fetchSettingsData());
//     }
//   }, [status]);

//   const onSubmit = async (data) => {
//     console.log(data);
//   };

//   return (
//     <div className="p-4 pt-0 font-SolaimanLipi">
//       <div className="flex gap-3 flex-col">
//         <div className="w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
//           <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
//             {translate("User Based Report")}
//           </h1>

//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             {/* Report Dropdown */}
//             <div>
//               <DefaultSelect
//                 label={translate("Report") + ":"}
//                 nameField="ReportName"
//                 registerKey="ReportID"
//                 valueField="ReportID"
//                 options={reports}
//                 type="number"
//                 require="This Field is required"
//                 disabled={false}
//                 defaultSelect={false}
//                 unicode={true}
//               />
//             </div>

//             {/* Conditionally show User Types if ReportID === 1 */}
//             {showUserType && (
//               <div>
//                 <DefaultSelect
//                   label={translate("User Types") + ":"}
//                   nameField="TypeName"
//                   registerKey="ID"
//                   valueField="ID"
//                   options={userType}
//                   type="number"
//                   require="This Field is required"
//                   disabled={false}
//                   defaultSelect={false}
//                   unicode={true}
//                 />
//               </div>
//             )}

//             {/* Gender Dropdown */}
//             <div>
//               <DefaultSelect
//                 label={translate("Gender") + ":"}
//                 nameField="ReportName"
//                 registerKey="GenderID"
//                 valueField="GenderID"
//                 options={genders}
//                 type="number"
//                 require="This Field is required"
//                 disabled={false}
//                 defaultSelect={false}
//                 unicode={true}
//               />
//             </div>

//             {/* Profession/Status Checkbox */}
//             <div>
//               <Checkbox
//                 label={translate("User Status") + ":"}
//                 options={userStatus}
//                 registerKey="profession"
//               />
//             </div>

//             {/* Conditionally show Vacation ID Inputs only for ReportID 1 or 3 */}
//             {showVacationInputs && (
//               <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <DefaultInput
//                   registerKey="StartVacation"
//                   require={translate("Vacation is required")}
//                   type="text"
//                   placeholder={translate("Enter start user id") + " ..."}
//                   label={translate("Start User ID") + ":"}
//                 />
//                 <DefaultInput
//                   registerKey="EndVacation"
//                   require={translate("Vacation is required")}
//                   type="text"
//                   placeholder={translate("Enter end user id") + " ..."}
//                   label={translate("End User ID") + ":"}
//                 />
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="md:col-span-2 flex justify-end">
//               <Button type="submit">{translate("Preview")}</Button>
//             </div>
//           </form>
//         </div>

//         <div className="w-full text-sm text-black">
//           <AdmissionFormPdf />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserReports;
