import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useForm } from "react-hook-form";
import useTranslate from "../../utils/Translate";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { useNavigate } from "react-router-dom";
import DefaultGreen from "../Button/DefaultGreen";
import {
  useGetDesignationQuery,
  useGetTeacherInfoNotRegisteredQuery,
  useGetTeacherInfoQuery,
  usePostTeacherInfoRegisteredMutation,
} from "../../features/teachers/teachersSlice";
import { hideModal } from "../../utils/ModalControlar";

const AddTeacherForm = ({ userId }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const translate = useTranslate();
  const navigate = useNavigate();

  const {
    data: teacherDesignation,
    isLoading: teacherDesignationfoLoading,
    isError: teacherDesignationError,
  } = useGetDesignationQuery();
  console.log(teacherDesignation);

  const {
    data: teacherInfoNR,
    isLoading: teacherInfoNRLoading,
    isError: teacherInfoNRError,
  } = useGetTeacherInfoNotRegisteredQuery();
  console.log(teacherInfoNR);

  const {
    data: teacherList,
    isLoading: teacherInfoLoading,
    isError: teacherInfoError,
  } = useGetTeacherInfoQuery();
  console.log(teacherList);

  const teacher = teacherInfoNR?.find((t) => t.UserID === userId);
  console.log(teacher);

  const [postTeacherInfoRegistered, { data, isLoading, isError }] =
    usePostTeacherInfoRegisteredMutation();

  const dispatch = useDispatch();
  const {
    gender,
    divition,
    district,
    thana,
    studentRelation,
    userType,
    status,
    error,
  } = useSelector((state) => state.settings);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useFormContext();

  const onSubmit = async (data) => {
    try {
      const maxSerial = teacherList.reduce((max, teacher) => {
        return teacher.Serial > max ? teacher.Serial : max;
      }, 0);

      const finalData = {
        ...data,
        UserID: userId,
        Serial: maxSerial + 1,
      };
      console.log(finalData);
      const response = await postTeacherInfoRegistered(finalData).unwrap();
      console.log(response);
      reset();
      // navigate("/teachers");
      hideModal();
    } catch (error) {
      console.log(error);
    }
  };
  const saveButton = "Save";
  const newButton = "New";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato">
      <div className="px-[24px] text-[14px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
          {/*Form Start*/}
        </div>

        <div className="flex justify-between items-start w-full gap-5">
          <div className="w-[150px] text-center flex flex-col items-center gap-3">
            <h2 className="text-base font-semibold mb-2">
              {translate("Enter image")}
            </h2>
            <div className="w-[150px] h-[150px] overflow-hidden rounded-lg shadow-lg">
              <img
                src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                alt="Cultural diversity in education"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="">
              {translate("User ID")} : {teacher?.UserID}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            <div className="">
              <h2>{translate("Serial Title")} :</h2>
              <div className="flex gap-5 justify-center items-center">
                <p className="w-14 h-6 border border-gray-300 text-center">4</p>

                <DefaultSelect
                  options={teacherDesignation}
                  require={"Designation is required"}
                  nameField={"Designation"} // Display text field
                  valueField={"DNID"} // Value field for the select
                  registerKey={"DNID"} // Key used for react-hook-form registration
                  type={"number"}
                />

                <div className="w-14 h-6 border border-gray-300 text-center">
                  +
                </div>
              </div>
            </div>
            <DatePickerOne
              registerKey={"JoiningDate"}
              placeholder={"Joning Date"}
              dateCalender={translate("Date of join") + " :"}
              require={"Entry Date is require"}
              // disable={true}
            />
            <DefaultInput
              registerKey={"ResultDevision"}
              require={"Result devision is require"}
              type={"text"}
              placeholder={"Result devision ..."}
              label={translate("Result Devision") + " :"}
              // disable={true}
            />
            <DefaultInput
              registerKey={"Name"}
              placeholder={teacher.UserName || ""}
              // require={"Name is required"}
              type={"text"}
              label={translate("Name") + " :"}
              // value={teacher.UserName || ""}
              disable={true}
            />
            <DefaultInput
              registerKey={"PasstedDate"}
              placeholder={"Passing year and date"}
              require={"Passing year and date is require"}
              type={"text"}
              label={translate("Passted Date") + " :"}
              // disable={true}
            />

            <DefaultInput
              registerKey={"Qualification"}
              placeholder={"Qualification"}
              require={"Qualification is require"}
              type={"text"}
              label={translate("Qualification") + " :"}
              // disable={true}
            />
            <DefaultInput
              registerKey={"FatherName"}
              placeholder={teacher.FatherName || ""}
              // require={"Father Name is required"}
              type={"text"}
              label={translate("Father Name") + " :"}
              // value={teacher.FatherName || ""}
              disable={true}
            />
            <DefaultInput
              registerKey={"ExamBoardName"}
              placeholder={"Exam board name"}
              require={"Exam Board Name is require"}
              type={"text"}
              label={translate("Exam Board Name") + " :"}
              // disable={true}
            />
            <DefaultInput
              registerKey={"Experience"}
              placeholder={"Experience"}
              require={"Experience is require"}
              type={"text"}
              label={translate("Experience") + " :"}
              // disable={true}
            />
          </div>
        </div>

        {/*Save Button & Filter start*/}
        <div className="flex mt-[10px] pl-[4px] font-bold relative">
          <div className="flex gap-3">
            <DefaultGreen submitButtonGreen={saveButton} />
          </div>
        </div>
        {/*Save Button & Filter end*/}
      </div>
    </form>
  );
};
export default AddTeacherForm;
