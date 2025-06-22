import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import useTranslate from "../utils/Translate";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery } from "../features/class/classQuerySlice";

const StudentsReport = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { watch, handleSubmit } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();

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

  const studentReportData = []
  const residentialData = []

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className=" bg-white p-6 md:p-4 rounded-xl shadow-lg font-SolaimanLipi">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Students Report")}
        </h3>
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            {/* Left Column */}
            <DefaultSelect
              label={translate("Students Report") + " :"}
              options={studentReportData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Session") + " :"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Class") + " :"}
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            <DefaultSelect
              label={
                <p className="text-gray-700 font-medium">
                  {translate("Gender")}:
                </p>
              }
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
            <DefaultSelect
              label={translate("New/Old") + " :"}
              options={newAndOldData ?? []}
              valueField="id"
              nameField="value"
              registerKey="id"
            />{" "}
            <DefaultSelect
              label={translate("Residential") + " :"}
              options={residentialData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            {/* Right Column */}
            {/* <DefaultInput
                label={
                  <p className="text-gray-700 font-medium">সাব ক্লাস আইডি :</p>
                }
                type="number"
                placeholder="সাব ক্লাস আইডি লিখুন"
                registerKey="subClassId"
              /> */}
            {/* Button */}
            <div className="pt-7 w-full">
              <Button type="submit" className="w-full md:w-auto">
                {translate("Preview")}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default StudentsReport;
