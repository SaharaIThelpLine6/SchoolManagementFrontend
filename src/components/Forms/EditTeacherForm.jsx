import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { NavLink, useNavigate } from "react-router-dom";
import DefaultGreen from "../Button/DefaultGreen";
import {
  useGetDesignationQuery,
  useGetTeacherInfoQuery,
  useUpdateTeacherInfoMutation,
} from "../../features/teachers/teachersSlice";
import { hideModal } from "../../utils/ModalControlar";
import getYearOnly from "../../helper/getYearOnly";

const EditTeacherForm = ({ userId }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const translate = useTranslate();
  const navigate = useNavigate();

  const {
    data: teacherList,
    isLoading: teacherInfoLoading,
    isError: teacherInfoError,
  } = useGetTeacherInfoQuery();

  const teacher = teacherList?.find((t) => t.UserID === userId);

  const {
    data: teacherDesignation,
    isLoading: teacherDesignationfoLoading,
    isError: teacherDesignationError,
  } = useGetDesignationQuery();

  const methods = useForm({
    defaultValues: {
      DNID: "",
      JoiningDate: "",
      PasstedDate: "",
      ResultDevision: "",
      Qualification: "",
      ExamBoardName: "",
      Experience: "",
    },
  });

  const [updateTeacherInfo, { isLoading, error, data }] =
    useUpdateTeacherInfoMutation();

  const { handleSubmit, reset } = methods;

  // 🔁 Reset form once both teacher and designations are loaded
  useEffect(() => {
    if (teacher && teacherDesignation?.length) {
      reset({
        DNID: teacher?.DNID || "",
        JoiningDate: getYearOnly(teacher?.JoiningDate),
        PasstedDate: getYearOnly(teacher?.PasstedDate),
        ResultDevision: teacher?.ResultDevision || "",
        Qualification: teacher?.Qualification || "",
        ExamBoardName: teacher?.ExamBoardName || "",
        Experience: teacher?.Experience || "",
      });
    }
  }, [teacher, teacherDesignation, reset]);

  const matchedDesignation = teacherDesignation?.find(
    (d) => d.DNID === teacher?.DNID
  );
  const serial = matchedDesignation?.SL;

  const onSubmit = async (data) => {
    try {
      const maxSerial = teacherList.reduce((max, teacher) => {
        return teacher.Serial > max ? teacher.Serial : max;
      }, 0);

      const { Name, FatherName, ...filteredData } = data;

      const finalData = {
        ...filteredData,
        UserID: userId,
        Serial: maxSerial + 1,
      };

      const result = await updateTeacherInfo(finalData).unwrap();
      reset();
      hideModal();
      Swal.fire({
        title: "Teacher update successfull!",
        icon: "success",
        draggable: true,
      });
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Teacher register failed",
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  if (teacherInfoLoading || teacherDesignationfoLoading) {
    return <p className="p-5 text-center">Loading...</p>;
  }

  const saveButton = "Save";

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-lato">
        <div className="px-[24px] text-[14px]">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap" />

          <div className="flex justify-between flex-col sm:flex-row items-start w-full gap-5">
            <div className="w-full sm:w-auto flex justify-center flex-col items-center gap-3">
              <h2 className="text-base font-semibold mb-2">
                {translate("Enter image")}
              </h2>
              <div className="w-[150px] h-[150px] overflow-hidden rounded-lg shadow-lg">
                <img
                  src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2>
                {translate("User ID")} : {teacher?.UserID}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
              <div>
                <h2>{translate("Serial Title")} :</h2>
                <div className="flex gap-5 justify-center items-center">
                  <p className="w-14 h-6 border border-gray-300 text-center">
                    {serial}
                  </p>

                  <DefaultSelect
                    options={teacherDesignation}
                    require={"Designation is required"}
                    nameField={"Designation"}
                    valueField={"DNID"}
                    registerKey={"DNID"}
                    type={"number"}
                  />

                  <NavLink
                    to="/teacherinfo/designation"
                    onClick={() => setTimeout(() => hideModal(), 100)}
                    className="w-14 h-6 border border-gray-300 text-center flex items-center justify-center text-xs rounded"
                  >
                    +
                  </NavLink>
                </div>
              </div>

              <DatePickerOne
                registerKey={"JoiningDate"}
                placeholder={translate("Inter your date of join") + " ..."}
                dateCalender="Date of join"
                require={"Entry Date is require"}
              />

              <DefaultInput
                registerKey={"ResultDevision"}
                require={"Result devision is require"}
                type={"text"}
                placeholder={translate("Inter your result devision") + " ..."}
                label="Result Devision"
              />

              <DefaultInput
                registerKey={"Name"}
                placeholder={teacher?.User?.UserName || ""}
                type={"text"}
                label="Name"
                disable={true}
              />

              <DefaultInput
                registerKey={"PasstedDate"}
                placeholder={translate("Inter your passted date") + " ..."}
                require={"Passing year and date is require"}
                type={"text"}
                label="Year"
              />

              <DefaultInput
                registerKey={"Qualification"}
                placeholder={translate("Inter your qualification") + " ..."}
                require={"Qualification is require"}
                type={"text"}
                label="Qualification"
              />

              <DefaultInput
                registerKey={"FatherName"}
                placeholder={teacher?.User?.FatherName || ""}
                type={"text"}
                label="Father Name"
                disable={true}
              />

              <DefaultInput
                registerKey={"ExamBoardName"}
                require={"Exam Board Name is require"}
                type={"text"}
                label="Exam Board Name"
                placeholder={translate("Inter your Exam Board Name") + " ..."}
              />

              <DefaultInput
                registerKey={"Experience"}
                require={"Experience is require"}
                type={"text"}
                label="Experience"
                placeholder={translate("Inter your experience") + " ..."}
              />
            </div>
          </div>

          <div className="flex mt-[10px] pl-[4px] font-bold relative">
            <div className="flex gap-3">
              <DefaultGreen submitButtonGreen={saveButton} />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditTeacherForm;
