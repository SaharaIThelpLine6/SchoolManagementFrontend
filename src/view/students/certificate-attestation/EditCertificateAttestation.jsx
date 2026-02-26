import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { FormProvider } from "react-hook-form";
import Button from "../../../components/Button/Button";
import DefaultInput from "../../../components/Forms/DefaultInput";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import Textarea from "../../../components/Forms/Textarea";
import LoadingComponent from "../../../components/LoadingComponent";

import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import {
  useGetExamNamesQuery,
  useGetStudentBySearchQuery,
  useGetStudentsTransferCertificateQuery,
  useUpdateStudentsTransferCertificateMutation,
} from "../../../features/student/studentQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import useTranslate from "../../../utils/Translate";

const EditCertificateAttestation = ({
  id,
  onBack,
  activeView,
  setActiveView,
}) => {
  const methods = useForm();
  const { reset, watch } = methods;

  const translate = useTranslate();

  // API Hooks
  const [updateCertificate, { isLoading: isUpdating }] =
    useUpdateStudentsTransferCertificateMutation();
  const { data: existingData } = useGetStudentsTransferCertificateQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNamesData } = useGetExamNamesQuery();
  const [studentCode, setStudentcode] = useState("");
  const [debouncedStudentCode, setDebouncedStudentCode] = useState("");

  // Debounce effect to prevent too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStudentCode(studentCode);
    }, 100);

    return () => clearTimeout(timer);
  }, [studentCode]);

  // Search student query with debounced value
  const { data: searchStudentInfo, error: searchStudentError } =
    useGetStudentBySearchQuery(
      { search: debouncedStudentCode, ClassID: null, SessionID: null },
      { skip: debouncedStudentCode.length === 0, refetchOnFocus: false }
    );

  // Set initial student code when component mounts or id changes
  useEffect(() => {
    if (id && Array.isArray(existingData)) {
      const found = existingData.find((item) => item.CFID === id);
      if (found) {
        setStudentcode(found.User?.UserCode || "");
      }
    }
  }, [id, existingData]);

  // Prefill data for editing when searchStudentInfo is available
  useEffect(() => {
    if (id && Array.isArray(existingData) && searchStudentInfo?.[0]) {
      const found = existingData.find((item) => item.CFID === id);
      if (found) {
        const fullAddress = `গ্রাম: ${bnBijoy2Unicode(
          searchStudentInfo[0].permanentVill || ""
        )}, ডাক: ${bnBijoy2Unicode(
          searchStudentInfo[0].permanentPost || ""
        )}, থানা: ${bnBijoy2Unicode(
          searchStudentInfo[0].PoliceStationName || ""
        )}, জেলা: ${bnBijoy2Unicode(
          searchStudentInfo[0].PermanentDistrictName || ""
        )}`;

        reset({
          CreateAt: found.CreateAt || "",
          name: bnBijoy2Unicode(found.User?.UserName) || "",
          fatherName: bnBijoy2Unicode(found.User?.FatherName) || "",
          motherName: bnBijoy2Unicode(found.User?.MotherName) || "",
          description: fullAddress,
          admissionNumber: found.User?.UserCode || "",
          birthDate: searchStudentInfo[0].DateOfBirth,
          SessionID: found.SessionID || "",
          ClassID: found.ClassIDTo || "",
          ExamID: found.ExamID || "",
          totalMarks: found.TotalMark || "",
          division: found.DivisionName || "",
          StudentCode: found.User?.UserCode || "",
          UserID: found.UserID || "",
        });
      }
    }
  }, [id, existingData, reset, searchStudentInfo]);

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

      await updateCertificate({ id, body: certificateData }).unwrap();
      Swal.fire({
        title: "সফল",
        text: "সার্টিফিকেট সফলভাবে আপডেট হয়েছে",
        icon: "success",
      });
      if (onBack) onBack();
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        title: "ত্রুটি",
        text: error.data?.error || "কোনো একটি সমস্যা হয়েছে",
        icon: "error",
      });
    }
  };

  if (isUpdating) return <LoadingComponent />;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto bg-white p-4 2xl:p-6 text-gray-800 space-y-6 font-SolaimanLipi"
      >
        {/* Header */}
        <div className="flex justify-between sm:flex-row flex-col items-center">
          <h2 className="text-lg md:text-xl font-semibold font-SolaimanLipi">
            {translate("Certification update")}
          </h2>
          <div className="flex gap-2">
            {onBack && (
              <Button
                className="bg-gray-500 text-white px-4 py-2"
                onClick={onBack}
                type="button"
              >
                ← {translate("Back")}
              </Button>
            )}
            {activeView === "edit" && (
              <Button
                className="bg-gray-500 text-white px-4 py-2"
                onClick={() => setActiveView("create")}
                type="button"
              >
                {translate("Create Certificate")}
              </Button>
            )}
          </div>
        </div>

        {/* Photo & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="col-span-1 flex flex-col items-center gap-3">
            <div className="w-24 h-32 md:w-32 md:h-40 border border-gray-400 flex items-center justify-center text-sm">
              Photo
            </div>
            <div className="w-full">
              <div className="mb-6">
                <label className="font-SolaimanLipi block mb-1">
                  {translate("Student Code")}:
                </label>
                <input
                  {...methods.register("StudentCode", { required: true })}
                  className="w-full rounded border border-gray-300 px-2 h-[38px] bg-[#EDEDED]"
                  disabled
                />
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
            disabled={isUpdating}
          >
            {isUpdating ? "লোড হচ্ছে..." : translate("Update")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditCertificateAttestation;
