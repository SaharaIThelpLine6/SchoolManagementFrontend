import React, { useEffect, useState } from "react";
import { setPageName } from "../../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import DefaultInput from "../../components/Forms/DefaultInput";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";
import {
  useGetStudentBySearchQuery,
  useGetStudentsVacationListQuery,
  useGetStudentsVacationTypeListQuery,
  useUpdateStudentsVacationMutation,
} from "../../features/student/studentQuerySlice";
import {
  fetchSingleStudentDataByStudentCode,
  fetchSingleStudentDataByStudentCodeAndSession,
} from "../../features/student/studentSlice";
import { toast } from "react-toastify";
import LoadingComponent from "../../components/LoadingComponent";
import bnBijoy2Unicode from "../../utils/conveter";
import useTranslate from "../../utils/Translate";
import Button from "../../components/Button/Button";
import TimePicker from "../../components/Forms/DatePicker/TimePicker";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { hideModal } from "../../utils/ModalControlar";
import SvgIcon from "../icons/SvgIcon";

const EditStudentVacationForm = ({ pageTitle, userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translate = useTranslate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { admittedStudent, academicClassStudentError } = useSelector(
    (state) => state.student
  );
  const { academicSession, studentRelation, status } = useSelector(
    (state) => state.settings
  );

  // Query to fetch vacation types
  const {
    data: getVacationType,
    error: studentsVacationTypeError,
    isLoading: isVacationTypeLoading,
  } = useGetStudentsVacationTypeListQuery();

  // Query to fetch specific vacation record by ID

  const {
    data: getStudentsVacationList,
    error: isVacationError,
    isLoading: isStudentsVacationListLoading,
  } = useGetStudentsVacationListQuery({ page: currentPage, limit: 10 });

  const vacationData = getStudentsVacationList?.data?.find(
    (record) => record.ID === userId
  );
  // Mutation for updating vacation
  const [
    updateStudentsVacation,
    { isLoading: isUpdating, isSuccess, isError, error },
  ] = useUpdateStudentsVacationMutation();

  // Initialize form
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = methods;

  // Watch student code for search
  const studentCodeOrName = watch("StudentCode");

  // Fetch student search data
  const {
    data: searchStudentInfo,
    error: isSearchStudentError,
    isLoading: isSearchStudentLoading,
  } = useGetStudentBySearchQuery(studentCodeOrName, {
    skip: !userTyping,
    refetchOnFocus: false,
  });

  // Set page title and fetch settings
  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
  }, [dispatch, pageTitle, academicSession.length]);

  // Pre-populate form with vacation data
  useEffect(() => {
    if (vacationData) {
      reset({
        StudentCode: vacationData.User?.UserCode || "",
        StudentName: bnBijoy2Unicode(vacationData.User?.UserName || ""),
        FatherName: bnBijoy2Unicode(vacationData.FatherName || ""),
        ClassName: bnBijoy2Unicode(vacationData.AcademicClass?.ClassName || ""),
        SessionID: vacationData.SessionID || "",
        ID: vacationData.VacationID || "",
        RelationID: vacationData.GuardianID || "",
        VacationDateFrom: vacationData.VacationDateFrom
          ? [new Date(vacationData.VacationDateFrom)]
          : null,
        VacationDateTo: vacationData.VacationDateTo
          ? [new Date(vacationData.VacationDateTo)]
          : null,
        VacationTimeFrom: vacationData.VacationTimeFrom
          ? [new Date(vacationData.VacationTimeFrom)]
          : null,
        VacationTimeTo: vacationData.VacationTimeTo
          ? [new Date(vacationData.VacationTimeTo)]
          : null,
        Comment: vacationData.Comment || "",
      });
    }
  }, [vacationData, reset]);

  // Set default session and date
  useEffect(() => {
    if (status === "succeeded" && academicSession.length > 0 && !vacationData) {
      setValue("SessionID", academicSession[0].SessionID);
      setValue("Date", new Date());
    }
  }, [status, academicSession, setValue, vacationData]);

  // Handle student search suggestions
  useEffect(() => {
    if (
      studentCodeOrName &&
      searchStudentInfo?.length > 0 &&
      !isSearchStudentError
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchStudentInfo, isSearchStudentError]);

  // Handle errors
  useEffect(() => {
    if (academicClassStudentError) {
      setValue("StudentName", "");
      setValue("FatherName", "");
      setValue("ClassName", "");
      setValue("SubClassID", "");
      toast.error(academicClassStudentError || "Something went wrong");
    }
  }, [academicClassStudentError, setValue]);

  // Form submission handler for updating
  const onSubmit = async (data) => {
    try {
      const {
        ID,
        VacationDateFrom,
        VacationDateTo,
        VacationTimeFrom,
        VacationTimeTo,
        RelationID,
        ...rest
      } = data;

      const convertedData = {
        ...rest,
        ID: userId, // Use userId as the vacation ID
        VacationID: ID,
        GuardianID: RelationID,
        VacationDateFrom: VacationDateFrom?.[0] || null,
        VacationDateTo: VacationDateTo?.[0] || null,
        VacationTimeFrom: VacationTimeFrom?.[0] || null,
        VacationTimeTo: VacationTimeTo?.[0] || null,
      };

      await updateStudentsVacation(convertedData).unwrap();

      Swal.close();
      Swal.fire({
        icon: "success",
        title: translate("Update Successful!"),
        text: translate("The vacation record has been updated successfully."),
        confirmButtonColor: "#3085d6",
        confirmButtonText: translate("OK"),
      });

      reset();
      hideModal();
      navigate("/students/vacation"); // Navigate back to vacation list
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: translate("Update Failed!"),
        text:
          err?.data?.error ||
          translate("Something went wrong. Please try again."),
        confirmButtonColor: "#d33",
        confirmButtonText: translate("OK"),
      });
      console.error("Error updating data:", err);
    }
  };

  // Handle student code search
  const handleUserCode = () => {
    const studentCode = getValues("StudentCode");
    const studentSession = getValues("SessionID");
    if (studentCode && studentSession) {
      dispatch(
        fetchSingleStudentDataByStudentCodeAndSession({
          id: studentCode,
          sessionId: studentSession,
        })
      );
    } else {
      dispatch(fetchSingleStudentDataByStudentCode(studentCode));
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    setValue("StudentCode", item.StudentCode);
    setValue("StudentName", bnBijoy2Unicode(item.StudentName));
    setValue("FatherName", item.FatherName);
    setValue("ClassName", item.ClassName);
    setValue("SessionID", item.SessionID);
    setValue("UserID", item.UserID);
    setValue("ClassID", item.ClassID);
    setShowSuggestions(false);
  };

  // Handle navigation to vacation type page
  const handleNavigate = () => {
    hideModal();
    navigate("/students/vacation/type-of-vacation");
  };

  // Loading and error states
  if (
    isVacationTypeLoading ||
    isSearchStudentLoading ||
    isStudentsVacationListLoading ||
    status === "loading"
  ) {
    return <LoadingComponent />;
  }

  if (studentsVacationTypeError || isVacationError || isSearchStudentError) {
    Swal.fire({
      icon: "error",
      title: translate("Failed to load data"),
      text: translate("Please try again later."),
      confirmButtonColor: "#d33",
      confirmButtonText: translate("OK"),
    });
    return null;
  }

  return (
    <div>
      <div className="mx-auto">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto bg-white p-6 md:p-4 rounded-xl shadow-lg"
          >
            {/* <div className="mb-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-0 items-center">
                <div className="col-span-1 md:col-span-3 flex justify-center order-1 md:order-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-blue-600 uppercase font-SolaimanLipi">
                    {translate("Edit Vacation")}
                  </h1>
                </div>
              </div>
            </div> */}

            <div className="grid xl:grid-cols-4 gap-4 md:gap-6 mb-6">
              <div className="relative">
                <div className="w-full">
                  <label
                    htmlFor="StudentCode"
                    className="mb-1 block text-black font-SolaimanLipi"
                  >
                    <span>{translate("User Code")} * :</span>
                  </label>
                  <input
                    type="text"
                    {...register("StudentCode", {
                      required: translate("User Code is required"),
                    })}
                    className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200"
                    onInput={() => setUserTyping(true)}
                    autoComplete="off"
                    disabled={true}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUserCode}
                  className="absolute bottom-[8px] right-[4px] text-[#999]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-logout"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                    <path d="M9 12h12l-3 -3" />
                    <path d="M18 15l3 -3" />
                  </svg>
                </button>
                {showSuggestions && searchStudentInfo?.length > 0 && (
                  <div className="search_suggetion h-[200px] overflow-y-auto absolute bottom-[0px] translate-y-full left-0 w-full bg-white shadow-lg z-30">
                    {searchStudentInfo.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-blue-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)}{" "}
                        - {bnBijoy2Unicode(item.SubClass)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DefaultInput
                registerKey="StudentName"
                label="Student Name"
                disable={true}
              />
              <DefaultInput
                registerKey="FatherName"
                label="Father Name"
                disable={true}
              />
              <DefaultInput
                registerKey="ClassName"
                label="ClassName"
                disable={true}
              />
              <DefaultSelect
                label="Date of entry"
                nameField="SessionName"
                registerKey="SessionID"
                valueField="SessionID"
                options={academicSession || []}
                type="number"
                require={translate("This Field is required")}
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
              <div className="flex flex-row items-center justify-center gap-2">
                <DefaultSelect
                  label="Type of vacation"
                  nameField="VacationList"
                  registerKey="ID"
                  valueField="ID"
                  options={getVacationType || []}
                  type="number"
                  require={translate("This Field is required")}
                  disabled={false}
                  defaultSelect={false}
                  unicode={true}
                />
                <Button
                  onClick={handleNavigate}
                  className="bg-[#EDEDED] mt-7 rounded-md py-3"
                >
                  <SvgIcon name={"FaPlus"} size={14} />
                </Button>
              </div>
              <DefaultSelect
                label="Relationship"
                nameField="RelationName"
                registerKey="RelationID"
                valueField="RelationID"
                options={studentRelation || []}
                type="number"
                require={translate("This Field is required")}
                disabled={false}
                defaultSelect={false}
                unicode={true}
              />
              <DatePickerOne
                dateCalender="Start Date of leave"
                placeholder={translate("Enter date")}
                registerKey="VacationDateFrom"
                require={translate("Date Required")}
              />
              <DatePickerOne
                dateCalender="End Date of leave"
                placeholder={translate("Enter date")}
                registerKey="VacationDateTo"
                require={translate("Date Required")}
              />
              <TimePicker
                timeCalender="Start Time of leave"
                placeholder={`${translate("Select Time")}...`}
                registerKey="VacationTimeFrom"
                require={true}
              />
              <TimePicker
                timeCalender="End Time of leave"
                placeholder={`${translate("Select Time")}...`}
                registerKey="VacationTimeTo"
                require={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 mb-6">
              <div>
                <label className="block text-[16px] font-400 font-normal text-gray-700 mb-1 md:mb-2 font-SolaimanLipi">
                  {translate("Remark")}:
                </label>
                <textarea
                  {...register("Comment", {
                    required: translate("Remark is required"),
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-300 active:border-gray-300 bg-white"
                  rows="3"
                />
                {errors.Comment && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.Comment.message}
                  </span>
                )}
              </div>
            </div>

            <Button
              className="bg-[#007af7] text-white hover:bg-blue-600"
              type="submit"
            >
              {translate("Update")}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EditStudentVacationForm;
