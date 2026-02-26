import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";

import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import Textarea from "../../../components/Forms/Textarea";
import Button from "../../../components/Button/Button";
import LoadingComponent from "../../../components/LoadingComponent";

import {
  usePostStudentsTransferCertificateMutation,
  useGetStudentBySearchQuery,
  useGetExamNamesQuery,
} from "../../../features/student/studentQuerySlice";
import { setFilteredStudent } from "../../../features/student/studentSlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import { showModal } from "../../../utils/ModalControlar";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import useTranslate from "../../../utils/Translate";
import SvgIcon from "../../../components/icons/SvgIcon";

const CreateCertificateAttestation = ({ onBack }) => {
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

  if (isPosting) return <LoadingComponent />;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto bg-white p-4 2xl:p-6 text-gray-800 space-y-6 font-SolaimanLipi"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold font-SolaimanLipi">
            {translate("Create new certificate")}
          </h2>
          {onBack && (
            <Button
              className="bg-gray-500 text-white px-4 py-2"
              onClick={() => {
                reset(); // Reset the form
                dispatch(setFilteredStudent(null)); // Optional: clear selected student
                if (onBack) onBack(); // Go back
              }}
              type="button"
            >
              ← {translate("Back")}
            </Button>
          )}
        </div>

        {/* Photo & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-1 flex flex-col items-center gap-3">
            <div className="w-24 h-32 md:w-32 md:h-40 border border-gray-400 flex items-center justify-center text-sm">
              Photo
            </div>
            <div className="w-full">
              <div className="mb-6 relative">
                <label className="font-SolaimanLipi block mb-1">
                  {translate("Student Code")}:
                </label>
                <div className="flex gap-2">
                  <input
                    {...methods.register("StudentCode", { required: true })}
                    className="w-full rounded border border-gray-300 px-2 h-[38px] bg-[#EDEDED]"
                    onInput={() => {
                      setUserTyping(true);
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="pr-2"
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
                        {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)}{" "}
                        - {bnBijoy2Unicode(item.ClassName)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <DefaultInput
              label={translate("Date of entry")}
              type="date"
              registerKey="CreateAt"
              disable={true}
            />
            <DefaultInput
              label={translate("Name")}
              type="text"
              registerKey="name"
              disable={true}
            />
            <DefaultInput
              label={translate("Father Name")}
              type="text"
              registerKey="fatherName"
              disable={true}
            />
            <DefaultInput
              label={translate("Mother Name")}
              type="text"
              registerKey="motherName"
              disable={true}
            />
            <div className="md:col-span-2">
              <Textarea
                label={translate("Address")}
                placeholder="ঠিকানা লিখুন"
                registerKey="description"
                require={true}
                disable={true}
              />
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-300" />

        {/* Academic Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <p className="text-sm md:text-base whitespace-nowrap">
              ভর্তি রেজিস্ট্রি অনুযায়ী তাহার কোড নাম্বার
            </p>
            <div className="w-20 md:w-24">
              <DefaultInput
                type="text"
                registerKey="admissionNumber"
                disable={true}
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              এবং জন্ম তারিখ
            </p>
            <div className="w-28 md:w-32">
              <DefaultInput
                type="date"
                registerKey="birthDate"
                disable={true}
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              সে অত্র প্রতিষ্ঠানে
            </p>
            <div className="w-28 md:w-32">
              <DefaultSelect
                options={sessionData ? sessionData : []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <p className="text-sm md:text-base whitespace-nowrap">শিক্ষাবর্ষ</p>
            <div className="w-28 md:w-32">
              <DefaultSelect
                options={classListData ? classListData : []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="ClassID"
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              জামাতে অধ্যয়ন করেছে
            </p>
            <div className="w-32 md:w-36">
              <DefaultSelect
                options={examNamesData ? examNamesData : []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
                unicode={true}
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              তার মোট নাম্বার
            </p>
            <div className="w-24 md:w-28">
              <DefaultInput type="text" registerKey="totalMarks" />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">এবং</p>
            <div className="w-24 md:w-28">
              <DefaultInput type="text" registerKey="division" />
            </div>

            <p className="text-sm md:text-base whitespace-nowrap">
              বিভাগ পেয়ে উত্তীর্ণ হয়েছে।
            </p>
          </div>

          <div className="text-xs md:text-sm text-gray-700 leading-relaxed border p-3 md:p-4 rounded">
            উক্ত প্রতিষ্ঠানের অধ্যক্ষের অবস্থান তারই আচরণ-আচার্য্য ছিল
            সন্তোষজনক। আমার জানা মতে সে কোন রাষ্ট্রবিরোধী কার্যকলাপে জড়িত নয়।
            আমরা তারই উজ্জ্বল ভবিষ্যৎ ও সর্বোচ্চ সফলতা কামনা করি।
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

export default CreateCertificateAttestation;
