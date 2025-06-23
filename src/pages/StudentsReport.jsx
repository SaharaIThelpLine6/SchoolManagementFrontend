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

  const studentReportData = [
    { id: "1", value: "ভর্তি রেজিস্টার" },
    { id: "2", value: "নতুন পুরাতন শিক্ষার্থীর তালিকা" },
    { id: "3", value: "জামাত ভিত্তিক নতুন পুরাতন মোট শিক্ষার্থী" },
    { id: "4", value: "শিক্ষার্থীর সংক্ষিপ্ত তালিকা দুই কলমে" },
    { id: "5", value: "অভিভাবকের মোবাইল নাম্বারের তালিকা" },
    { id: "6", value: "জামাত ওয়ারী কিতাব/বিষয়ের তালিকা" },
    { id: "7", value: "শিক্ষার্থীদের পরিচয় পত্র (আইডি কার্ড)" },
    { id: "8", value: "বাংলা হাজিরা খাতা 30 দিনের" },
    { id: "9", value: "বাংলা হাজিরা খাতা বিষয়ওয়ারী" },
    { id: "10", value: "আরবী হাজিরা খাতা 30 দিনের সর্ট অ্যাড্রেস" },
    { id: "11", value: "আরবী হাজিরা খাতা বিষয়ওয়ারী" },
    { id: "12", value: "ভর্তি রেজি: সকল শিক্ষার্থীর জামাত সিরিয়াল" },
    { id: "13", value: "সকল শিক্ষার্থীর পরিসংখ্যান" },
    { id: "14", value: "ভর্তি ফর্ম" },
    { id: "15", value: "নতুন ভর্তির ফর্ম" },
    { id: "16", value: "আইডি দিয়ে ভর্তি রেজিস্টার" },
    { id: "17", value: "ভর্তি রেজি: সকল শিক্ষার্থীর আইডি সিরিয়াল" },
    { id: "18", value: "ছবি সহ ভর্তি রেজিস্টার নতুন-পুরাতন" },
    { id: "19", value: "অভিভাবকের মোবাইল নাম্বার দুই কলমে" },
    { id: "20", value: "আর্থিক অবস্থা ভিত্তিক পরিসংখ্যান" },
    { id: "21", value: "আর্থিক অবস্থা ভিত্তিক ভর্তি রেজিস্টার" },
    { id: "22", value: "জন্ম নিবন্ধন ভিত্তিক তালিকা" },
    { id: "23", value: "অভিভাবকের তথ্য" },
    { id: "24", value: "আইডি দিয়ে ভর্তি ফর্ম" },
    { id: "25", value: "ঠিকানা ভিত্তিক ভর্তি রেজিস্টার" },
    { id: "26", value: "ছবিসহ হাজিরা খাতা" },
  ];

  const residentialData = [];

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
              valueField="id"
              nameField="value"
              registerKey="id"
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
