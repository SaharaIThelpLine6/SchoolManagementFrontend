import { FormProvider, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import useTranslate from "../utils/Translate";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery } from "../features/class/classQuerySlice";
import SearchSelect from "../components/Forms/SearchSelect";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import Checkbox from "../components/Checkboxes/Checkbox";
import { userStatus } from "../Data/userReportsData";
import DefaultInput from "../components/Forms/DefaultInput";
import {
  fetchSingleUser,
  setEditMode,
} from "../features/userInfo/userInfoSlice";
import {
  fetchSettingsData,
  fetchDidata,
  fetchThanadata,
} from "../features/settings/settingsSlice";

const StudentsReport = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { register, handleSubmit, watch, setValue, getValues, reset } = methods;

  const selectedReportID = watch("district");

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: residentialData } = useGetResidentialQuery();

  const defaultData = useSelector((state) => state.userInfo.defaultFormValue);
  const editMode = useSelector((state) => state.userInfo.editMode);
  const dispatch = useDispatch();
  const { divition, district, thana, status, error } = useSelector(
    (state) => state.settings
  );
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [DivisionID, DistrictID, permanentPoliceStationID] = watch([
    "DivisionID",
    "DistrictID",
    "permanentPoliceStationID",
  ]);

  useEffect(() => {
    if (editMode === 0) {
      setValue("DistrictID", "");
      setValue("permanentPoliceStationID", "");
      if (DivisionID) {
        dispatch(fetchDidata(DivisionID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID?.toString();
      if (DivisionID === Number(numberStrP?.slice(0, 1))) {
        console.log("Both Are Same");
      } else {
        console.log("Both Are Not Same");
        setValue("DistrictID", "");
        setValue("permanentPoliceStationID", "");
        if (DivisionID) {
          dispatch(fetchDidata(DivisionID));
        }
      }
    }
  }, [DivisionID, setValue, dispatch, editMode, defaultData]);

  useEffect(() => {
    if (editMode === 0) {
      setValue("permanentPoliceStationID", "");
      if (DistrictID) {
        dispatch(fetchThanadata(DistrictID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID?.toString();
      if (DistrictID === Number(numberStrP?.slice(0, 3))) {
        console.log("Both Are Same");
      } else {
        setValue("permanentPoliceStationID", "");
        if (DistrictID) {
          dispatch(fetchThanadata(DistrictID));
        }
      }
    }
  }, [DistrictID, setValue, dispatch, editMode, defaultData]);

  useEffect(() => {
    dispatch(fetchSettingsData());
    if (editMode === 0) {
      reset({
        DivisionID: "",
        DistrictID: "",
        permanentPoliceStationID: "",
      });
    }
  }, [dispatch, reset, editMode]);

  useEffect(() => {
    if (defaultData && editMode === 1) {
      reset(defaultData);
      const numberStrP = defaultData.permanentPoliceStationID?.toString();

      const defaultFormData = {
        ...defaultData,
        DivisionID: Number(numberStrP?.slice(0, 1)),
        DistrictID: Number(numberStrP?.slice(0, 3)),
      };

      const promises = [
        dispatch(fetchDidata(defaultFormData.DivisionID)),
        dispatch(fetchThanadata(defaultFormData.DistrictID)),
      ];

      Promise.all(promises)
        .then(() => {
          reset(defaultFormData);
          dispatch(setEditMode(2));
        })
        .catch((err) => {
          console.error("Error in dispatching actions:", err);
        });
    }
  }, [defaultData, reset, dispatch, editMode]);

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
    { id: "1", name: "3 বিষয়ের খাতা" },
    { id: "2", name: "4 বিষয়ের খাতা" },
    { id: "3", name: "5 বিষয়ের খাতা" },
    { id: "4", name: "6 বিষয়ের খাতা" },
    { id: "5", name: "7 বিষয়ের খাতা" },
    { id: "6", name: "8 বিষয়ের খাতা" },
    { id: "7", name: "9 বিষয়ের খাতা" },
    { id: "8", name: "10 বিষয়ের খাতা" },
  ];

  const studentReportData = [
    { id: "1", value: "১. ভর্তি রেজিস্টার" },
    { id: "2", value: "২. নতুন পুরাতন শিক্ষার্থীর তালিকা" },
    { id: "3", value: "৩. জামাত ভিত্তিক নতুন পুরাতন মোট শিক্ষার্থী" },
    { id: "4", value: "৪. শিক্ষার্থীর সংক্ষিপ্ত তালিকা দুই কলমে" },
    { id: "5", value: "৫. অভিভাবকের মোবাইল নাম্বারের তালিকা" },
    { id: "6", value: "৬. জামাত ওয়ারী কিতাব/বিষয়ের তালিকা" },
    { id: "7", value: "৭. শিক্ষার্থীদের পরিচয় পত্র (আইডি কার্ড)" },
    { id: "8", value: "৮. বাংলা হাজিরা খাতা 30 দিনের" },
    { id: "9", value: "৯. বাংলা হাজিরা খাতা বিষয়ওয়ারী" },
    { id: "10", value: "১০. আরবী হাজিরা খাতা 30 দিনের সর্ট অ্যাড্রেস" },
    { id: "11", value: "১১. আরবী হাজিরা খাতা বিষয়ওয়ারী" },
    { id: "12", value: "১২. ভর্তি রেজি: সকল শিক্ষার্থীর জামাত সিরিয়াল" },
    { id: "13", value: "১৩. সকল শিক্ষার্থীর পরিসংখ্যান" },
    { id: "14", value: "১৪. ভর্তি ফর্ম" },
    { id: "15", value: "১৫. নতুন ভর্তির ফর্ম" },
    { id: "16", value: "১৬. আইডি দিয়ে ভর্তি রেজিস্টার" },
    { id: "17", value: "১৭. ভর্তি রেজি: সকল শিক্ষার্থীর আইডি সিরিয়াল" },
    { id: "18", value: "১৮. ছবি সহ ভর্তি রেজিস্টার নতুন-পুরাতন" },
    { id: "19", value: "১৯. অভিভাবকের মোবাইল নাম্বার দুই কলমে" },
    { id: "20", value: "২০. আর্থিক অবস্থা ভিত্তিক পরিসংখ্যান" },
    { id: "21", value: "২১. আর্থিক অবস্থা ভিত্তিক ভর্তি রেজিস্টার" },
    { id: "22", value: "২২. জন্ম নিবন্ধন ভিত্তিক তালিকা" },
    { id: "23", value: "২৩. অভিভাবকের তথ্য" },
    { id: "24", value: "২৪. আইডি দিয়ে ভর্তি ফর্ম" },
    { id: "25", value: "২৫. ঠিকানা ভিত্তিক ভর্তি রেজিস্টার" },
    { id: "26", value: "২৬. ছবিসহ হাজিরা খাতা" },
  ];

  const reportFieldMap = {
    SessionID: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "26",
    ],
    ClassID: [
      "1",
      "2",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "14",
      "18",
      "19",
      "21",
      "22",
      "23",
      "24",
      "26",
    ],
    gender: ["1", "5", "4", "8", "12", "23", "26", "16"],
    id: ["1", "2", "4", "12", "17", "16", "18", "21"], // New/Old
    RDID: ["1", "5", "8", "9", "12", "23", "26"],
    IsActive: [
      "1",
      "2",
      "3",
      "4",
      "5",
      "7",
      "8",
      "12",
      "15",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ],
    bookOfSubject: ["9", "11"],
    classAndSubClassData: ["13"],
    IsActiveAdmissionForm: ["14", "24"],
    IdAdmissionRegister: ["16"],
    IdAdmissionForm: ["24"],
    addresss: ["25"],
  };

  const onSubmit = (data) => {
    console.log("Form submitted with data:", data);
  };

  return (
    <div className="bg-white p-6 md:p-4 rounded-xl shadow-lg font-SolaimanLipi">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Students Report")}
        </h3>
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            {/* Always visible report selector */}
            <SearchSelect
              label={translate("Students Report") + " :"}
              registerKey="district"
              options={studentReportData ?? []}
              valueField="id"
              nameField="value"
              require="Students Report is required"
            />

            {/* Conditionally visible filters */}
            {reportFieldMap.SessionID.includes(selectedReportID) && (
              <DefaultSelect
                label={translate("Session") + " :"}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
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
                registerKey="id"
              />
            )}
            {reportFieldMap.ClassID.includes(selectedReportID) && (
              <DefaultSelect
                label={translate("Class") + " :"}
                options={classListData ?? []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="ClassID"
              />
            )}
            {reportFieldMap.gender.includes(selectedReportID) && (
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
            )}
            {reportFieldMap.id.includes(selectedReportID) && (
              <DefaultSelect
                label={translate("New/Old") + " :"}
                options={newAndOldData ?? []}
                valueField="id"
                nameField="value"
                registerKey="id"
              />
            )}
            {reportFieldMap.RDID.includes(selectedReportID) && (
              <DefaultSelect
                label={translate("Residential") + " :"}
                options={residentialData ?? []}
                valueField="RDID"
                nameField="ResidentialName"
                registerKey="RDID"
              />
            )}
            {reportFieldMap.addresss.includes(selectedReportID) && (
              <>
                <DefaultSelect
                  label={translate("Division") + " :"}
                  type="number"
                  options={Array.isArray(divition) ? divition : []}
                  registerKey="DivisionID"
                  valueField="DivisionID"
                  nameField="DivisionName"
                />
                <DefaultSelect
                  label={translate("District") + " :"}
                  type="number"
                  options={
                    Array.isArray(district[DivisionID])
                      ? district[DivisionID]
                      : []
                  }
                  registerKey="DistrictID"
                  valueField="DistrictID"
                  nameField="DistrictName"
                />
                <DefaultSelect
                  label={translate("Thana") + " :"}
                  type="number"
                  options={
                    Array.isArray(thana[DistrictID]) ? thana[DistrictID] : []
                  }
                  registerKey="permanentPoliceStationID"
                  valueField="PoliceStationID"
                  nameField="PoliceStationName"
                />
              </>
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
                registerKey="IsActive"
              />
            )}
            {reportFieldMap.IsActiveAdmissionForm.includes(selectedReportID) && (
              <Checkbox
                label={translate("Admission Status") + ":"}
                options={admissionData}
                registerKey="IsActive"
              />
            )}

            {/* Submit Button */}
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
