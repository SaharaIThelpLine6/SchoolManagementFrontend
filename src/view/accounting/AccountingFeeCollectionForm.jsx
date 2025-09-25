import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, FormProvider } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import { insertData } from "../../utils/create/api";
import { useNavigate } from "react-router-dom";
import { fetchSingleUser } from "../../features/userInfo/userInfoSlice";

import { fetchClassData } from "../../features/class/classSlice";
import useTranslate from "../../utils/Translate";
import { setReqLoading } from "../../features/requestHandeler/requestHandelerSlice";
import { hideModal } from "../../utils/ModalControlar";
import { fetchUserOnlyStudentData } from "../../features/student/studentSlice";
import DefaultInput from "../../components/Forms/DefaultInput";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";

const AccountingFeeCollectionForm = ({ userId }) => {
  const {
    academicSession,
    residential,
    studentFinancialStatus,
    status,
    error,
  } = useSelector((state) => state.settings);
  const { classList, subClassList } = useSelector((state) => state.class);
  const { defaultFormValue, singleUserstatus } = useSelector(
    (state) => state.userInfo
  );
  const { reqLoading } = useSelector((state) => state.requestHandeler);
  const translate = useTranslate();
  const navigate = useNavigate();
  const methods = useForm();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = methods;
  const dispatch = useDispatch();
  useEffect(() => {
    // console.log(defaultFormValue?.UserID === userId);
    if (defaultFormValue?.UserID != userId) {
      dispatch(fetchSingleUser(userId));
    }
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    if (!classList.length) {
      dispatch(fetchClassData());
    }
  }, [dispatch]);
  const onSubmit = async (data) => {
    if (reqLoading) {
      console.log("Request already in progress. Please wait...");
      toast.dark(translate("Request already in progress. Please wait..."), {
        type: "warn",
        className:
          " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
        style: {
          boxShadow:
            "0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)",
        },
      });
      return false;
    }
    dispatch(setReqLoading(true));
    const id = toast.dark("তথ্য যুক্ত করা হচ্ছে...", {
      type: "success",
      isLoading: true,
      className:
        " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
      style: {
        boxShadow:
          "0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)",
      },
    });
    try {
      const submitRes = await insertData(data, "/api/students/insert_student");
      if (submitRes.success) {
        reset();
        toast.update(id, {
          render: translate("Information Added Successfully"),
          type: "success",
          isLoading: false,
          autoClose: true,
        });
        dispatch(setReqLoading(false));
        hideModal();
        dispatch(fetchUserOnlyStudentData());
      } else {
        toast.update(id, {
          render: submitRes.error,
          type: "error",
          isLoading: false,
          autoClose: true,
        });
        dispatch(setReqLoading(false));
      }
    } catch (err) {
      console.error(err.message);
      dispatch(setReqLoading(false));
    }
  };

  const selectedClassID = watch("ClassID");
  const filteredSubClassList = subClassList.filter(
    (sub) => sub.ClassID === selectedClassID
  );

  useEffect(() => {
    console.log(defaultFormValue, singleUserstatus);
    console.log(defaultFormValue?.UserID == userId);

    if (
      singleUserstatus === "succeeded" &&
      defaultFormValue?.UserID == userId
    ) {
      reset(defaultFormValue);
    }
  }, [singleUserstatus, defaultFormValue, userId, reset]);

  const AdmissionType = [
    {
      id: 1,
      name: "New",
    },
    {
      id: 2,
      name: "Old",
    },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi">
        <div className="text-[14px]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <DefaultInput
              registerKey={"UserName"}
              placeholder={"Student Name"}
              require={"Student Name is require"}
              type={"text"}
              label={"Student Name"}
              disable={true}
            />
            <DefaultInput
              registerKey={"FatherName"}
              placeholder={"Father Name"}
              require={"Father Name is require"}
              type={"text"}
              label={"Father Name"}
              disable={true}
            />
            <DefaultInput
              registerKey={"Mobile1"}
              placeholder={"Mobile"}
              require={"Mobile is require"}
              type={"text"}
              label={"Mobile"}
              disable={true}
            />
            <DatePickerOne
              registerKey={"CreateAt"}
              placeholder={"Entry Date"}
              dateCalender={"Entry Date"}
              require={"Entry Date is require"}
              disable={true}
            />

            <DefaultSelect
              options={academicSession}
              require={"Session is require"}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
              type={"number"}
              label="Session"
            />

            <DefaultSelect
              options={classList}
              require={"Class is require"}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              label="Admission Class"
            />

            <DefaultSelect
              options={filteredSubClassList}
              require="Sub Class is required"
              nameField="SubClass"
              valueField="SubClassID"
              registerKey="SubClassID"
              type="number"
              label="Admission Section"
            />

            <DefaultInput
              registerKey={"AdmissionSerial"}
              placeholder={"Admission Serial/ Roll"}
              type={"number"}
              require={"Admission Serial is require"}
              label="Admission Serial"
            />

            <DefaultSelect
              options={studentFinancialStatus}
              require={"Sub Class is require"}
              nameField={"FinancialName"}
              valueField={"SFTID"}
              registerKey={"SFTID"}
              type={"number"}
              label="Financial Condition"
            />
            <DefaultSelect
              options={residential}
              require={"Sub Class is require"}
              nameField={"ResidentialName"}
              valueField={"RDID"}
              registerKey={"ResidentialStatusId"}
              type={"number"}
              label="Living Condition"
            />
            <DefaultSelect
              options={AdmissionType}
              require={"AdmissionType is require"}
              nameField={"name"}
              valueField={"id"}
              registerKey={"NewOldId"}
              type={"number"}
              label="Admission Type"
            />
          </div>
          <div className="text-end pt-6 pb-3">
            <button
              type="submit"
              className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush"
            >
              {translate("Save")}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AccountingFeeCollectionForm;
