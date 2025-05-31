import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFormContext } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Checkbox from "../components/Checkboxes/Checkbox";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import UserSummaryReportsPdf from "../view/general-information/user-reports/UserSummaryReportsPdf";
import StudentsWithoutAdmissionPdf from "../view/general-information/user-reports/StudentsWithoutAdmissionPdf";
import AdmissionFormPdf from "../view/general-information/user-reports/AdmissionFormPdf";

const UserReports = ({ pageTitle }) => {
  const translate = useTranslate();
  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = useFormContext();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageName(pageTitle));
  }, [dispatch]);

  const onSubmit = async (data) => {
    console.log(data);
  };
  const reports = [
    {
      ReportID: 1,
      ReportName: "আইডি সিরিয়াল ইউজার ডাটা তালিকা",
    },
    {
      ReportID: 2,
      ReportName: "ইউজার পরিসংখ্যান",
    },
    {
      ReportID: 3,
      ReportName: "শিক্ষার্থীর ভর্তির ফরম",
    },
    {
      ReportID: 4,
      ReportName: "ভর্তি বিহীন শিক্ষার্থীর তালিকা",
    },
  ];
  const genders = [
    {
      GenderID: 1,
      ReportName: "পুরুষ",
    },
    {
      GenderID: 2,
      ReportName: "মহিলা",
    },
    {
      GenderID: 3,
      ReportName: "উভয়",
    },
  ];
  const professions = [
    { id: 1, name: "Active" },
    { id: 2, name: "InActive" },
    { id: 3, name: "Both" },
  ];
  const userTypes = [
    { id: 1, name: "শিক্ষার্থী" },
    { id: 2, name: "শিক্ষক/টাফ" },
    { id: 3, name: "অভিভাবক" },
    { id: 4, name: "দাতা সদস্য" },
    { id: 5, name: "লাইব্রেরী সদস্য" },
    { id: 6, name: "সফটওয়্যার ইউজার" },
    { id: 7, name: "কফিল" },
  ];

  return (
    <div className="p-4 pt-0 font-SolaimanLipi">
      {/* <SortableCompo /> */}
      <div className="flex gap-3 flex-col">
        <div className="w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate("User Based Report")}
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Report Dropdown */}
            <div>
              <DefaultSelect
                label={translate("Report") + ":"}
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={reports}
                type="number"
                require="This Field is required"
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
            </div>

            {/* User Types Dropdown */}
            <div>
              <DefaultSelect
                label={translate("User Types") + ":"}
                nameField="name"
                registerKey="id"
                valueField="id"
                options={userTypes}
                type="number"
                require="This Field is required"
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
            </div>

            {/* Gender Dropdown */}
            <div>
              <DefaultSelect
                label={translate("Gender") + ":"}
                nameField="ReportName"
                registerKey="GenderID"
                valueField="GenderID"
                options={genders}
                type="number"
                require="This Field is required"
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
            </div>

            {/* Profession/Status Checkbox */}
            <div>
              <Checkbox
                label={translate("User Status") + ":"}
                options={professions}
                registerKey="profession"
              />
            </div>

            {/* Vacation Year Inputs */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DefaultInput
                registerKey="StartVacation"
                require={translate("Vacation is required")}
                type="text"
                placeholder={translate("Enter start user id") + " ..."}
                label={translate("Start User ID") + ":"}
              />
              <DefaultInput
                registerKey="EndVacation"
                require={translate("Vacation is required")}
                type="text"
                placeholder={translate("Enter end user id") + " ..."}
                label={translate("End User ID") + ":"}
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">{translate("Preview")}</Button>
            </div>
          </form>
        </div>

        <div className="w-full border rounded-lg h-[calc(100vh-64px)] lg:h-full overflow-y-auto bg-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] text-sm text-black">
          {/* <StudentsWithoutAdmissionPdf /> */}
          {/* <UserSummaryReportsPdf /> */}
          <AdmissionFormPdf />
        </div>
      </div>
    </div>
  );
};

export default UserReports;
