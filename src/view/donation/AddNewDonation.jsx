import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import LoadingComponent from "../../components/LoadingComponent";
import {
  usePostStudentsTransferCertificateMutation,
  useGetStudentBySearchQuery,
  useGetExamNamesQuery,
} from "../../features/student/studentQuerySlice";
import { setFilteredStudent } from "../../features/student/studentSlice";
import bnBijoy2Unicode from "../../utils/conveter";
import { showModal } from "../../utils/ModalControlar";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../features/class/classQuerySlice";
import useTranslate from "../../utils/Translate";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";
import SvgIcon from "../../components/icons/SvgIcon";

const AddNewDonation = ({ onBack }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const translate = useTranslate();
  const { reset, watch } = methods;
  const { filteredStudent } = useSelector((state) => state.student);

  // State for student search
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const studentCodeOrName = watch("StudentCode");

  // API Hooks
  const [postCertificate, { isLoading: isPosting }] =
    usePostStudentsTransferCertificateMutation();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNamesData } = useGetExamNamesQuery();
  const { data: searchStudentInfo, error: searchStudentError } =
    useGetStudentBySearchQuery(
      { search: studentCodeOrName, ClassID: null, SessionID: null },
      { skip: !userTyping, refetchOnFocus: false }
    );

  // Handle student search suggestions
  useEffect(() => {
    if (
      studentCodeOrName &&
      searchStudentInfo?.length > 0 &&
      !searchStudentError
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchStudentInfo, searchStudentError]);

  // Handle when student is selected from search
  useEffect(() => {
    if (filteredStudent) {
      setUserTyping(false);

      const fullAddress = `গ্রাম: ${bnBijoy2Unicode(
        filteredStudent.permanentVill || ""
      )}, ডাক: ${bnBijoy2Unicode(
        filteredStudent.permanentPost || ""
      )}, থানা: ${bnBijoy2Unicode(
        filteredStudent.PoliceStationName || ""
      )}, জেলা: ${bnBijoy2Unicode(
        filteredStudent.PermanentDistrictName || ""
      )}`;

      reset({
        UserID: filteredStudent.UserID,
        CreateAt: filteredStudent.CreateAt?.split("T")[0] || "",
        StudentCode: filteredStudent.StudentCode,
        name: bnBijoy2Unicode(filteredStudent.StudentName),
        fatherName: bnBijoy2Unicode(filteredStudent.FatherName),
        motherName: bnBijoy2Unicode(filteredStudent.MotherName),
        admissionNumber: filteredStudent.StudentCode,
        birthDate: filteredStudent.DateOfBirth?.split("T")[0] || "",
        description: fullAddress,
      });
    }
  }, [filteredStudent, reset]);

  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    dispatch(setFilteredStudent(item));
    setShowSuggestions(false);
  };

  const handleOpenModal = useCallback(() => {
    dispatch(setFilteredStudent(null));
    setShowSuggestions(false);
    showModal("Filter Student", "STUDENT_FILTER");
  }, [dispatch]);

  // Submit handler
  const onSubmit = async (data) => {
    try {
      const certificateData = {
        UserID: data.UserID,
        SessionID: watch("SessionID"),
        ExamID: watch("ExamID"),
        ClassIDTo: watch("ClassID"),
        TotalMark: data.totalMarks,
        DivisionName: data.division,
      };

      await postCertificate(certificateData).unwrap();
      Swal.fire("সফল", "সার্টিফিকেট সফলভাবে তৈরি হয়েছে", "success");
      if (onBack) onBack();
      dispatch(setFilteredStudent(null));
      reset();
    } catch (error) {
      Swal.fire("ত্রুটি", "কোনো একটি সমস্যা হয়েছে", "error");
    }
  };

  const handleUserSearchOpenModal = useCallback(() => {
    showModal("User Search", "USER_SEARCH");
  }, []);

  if (isPosting) return <LoadingComponent />;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto max-w-screen-xl bg-white pt-5 text-gray-800 space-y-6 font-SolaimanLipi"
      >
        {/* Photo & Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo and Student Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-32 md:w-48 md:h-52 border border-gray-400 flex items-center justify-center text-sm text-gray-600">
              Photo
            </div>
            <div className="w-full relative">
              <label className="block mb-1 text-sm">
                {translate("Student Code")}:
              </label>
              <div className="flex gap-2">
                <input
                  {...methods.register("StudentCode", { required: true })}
                  className="w-full rounded border border-gray-300 px-3 h-[38px] bg-[#EDEDED]"
                  onInput={() => setUserTyping(true)}
                />
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="text-gray-700 hover:text-blue-600"
                  title="Filter"
                >
                  <SvgIcon name={"TbFilterPlus"} size={30} />
                </button>
              </div>
              {showSuggestions && (
                <div className="absolute z-30 bg-white shadow border w-full max-h-[200px] overflow-y-auto mt-1">
                  {searchStudentInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)} -{" "}
                      {bnBijoy2Unicode(item.ClassName)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Info Fields */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DefaultInput
              type="text"
              registerKey={`admissionNumber`}
              labelPosition="left"
              label={translate("Donor") + " :"}
            />
            <DefaultInput
              type="text"
              registerKey={`admissionNumbe`}
              labelPosition="left"
              label={translate("Sub Ledger") + " :"}
            />
            <DefaultInput
              type="text"
              registerKey={`admissionNumber`}
              labelPosition="left"
              label={translate("Father") + " :"}
            />
            <DefaultInput
              type="text"
              registerKey={`admissionNumbe`}
              labelPosition="left"
              label={translate("Type") + " :"}
            />
            <DefaultInput
              type="text"
              registerKey={`admissionNumber`}
              labelPosition="left"
              label={translate("Mobile") + " :"}
            />
            <DatePickerOne
              dateCalender={translate("Next Date") + " :"}
              placeholder="YYYY-MM-DD"
              registerKey="startDate"
              require="তারিখ দিন"
              labelPosition="left"
            />
            <DatePickerOne
              dateCalender={translate("Entry Date") + " :"}
              placeholder="YYYY-MM-DD"
              registerKey="entryDate"
              require="তারিখ দিন"
              labelPosition="left"
            />
            <DefaultInput
              type="text"
              registerKey={`admissionNumbe`}
              labelPosition="left"
              label={translate("Amount") + " :"}
            />
            <DatePickerOne
              dateCalender={translate("Date") + " :"}
              placeholder="YYYY-MM-DD"
              registerKey="donationDate"
              require="তারিখ দিন"
              labelPosition="left"
            />
            <div className="flex justify-center items-center gap-2">
              <DefaultInput
                type="text"
                registerKey={`admissionNumbe`}
                labelPosition="left"
                label={translate("Cofil 1") + " :"}
              />
              <Button onClick={handleUserSearchOpenModal}>
                {" "}
                  <SvgIcon
              name={"GrDrag"}
              size={16}
            />
              </Button>
            </div>
            <DefaultInput
              type="text"
              registerKey={`admissionNumbe`}
              labelPosition="left"
              label={translate("Sectors") + " :"}
            />
            <div className="flex justify-center items-center gap-2">
              <DefaultInput
                type="text"
                registerKey={`admissionNumbe`}
                labelPosition="left"
                label={translate("Cofil 1") + " :"}
              />
              <Button onClick={handleUserSearchOpenModal}>
                {" "}
             <SvgIcon
              name={"GrDrag"}
              size={16}
            />
              </Button>
            </div>
            <div className="flex justify-center items-center gap-2">
              <DefaultInput
                type="text"
                registerKey={`admissionNumbe`}
                labelPosition="left"
                label={translate("Cofil 1") + " :"}
              />
              <Button onClick={handleUserSearchOpenModal}>
                {" "}
               <SvgIcon
              name={"GrDrag"}
              size={16}
            />
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="font-SolaimanLipi"
            disabled={isPosting}
          >
            {isPosting ? "লোড হচ্ছে..." : translate("Save")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddNewDonation;
