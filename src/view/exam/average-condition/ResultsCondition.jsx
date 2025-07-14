
import React, { useEffect } from "react";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import Button from "../../../components/Button/Button";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../../../features/student/studentQuerySlice";
import {
  useGetExamConditionQuery,
  usePostExamConditionMutation,
} from "../../../features/exam/examQuerySlice";
import { skipToken } from "@reduxjs/toolkit/query";
import Swal from "sweetalert2";

const CheckboxOption = ({ label, registerKey }) => {
  const { register } = useFormContext();
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(registerKey)}
        className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

const ResultsCondition = () => {
  const methods = useForm();
  const { handleSubmit, watch } = methods;

  // Inside your component
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const SessionId = watch("SessionID");
  const ExamId = watch("ExamID");
  const SubClassId = watch("SubClassID");

  // Conditional fetching - only fetch when all required IDs are available
  const {
    data: examConditionData,
    isLoading: isExamConditionLoading,
    error: examConditionError,
    isFetching: isExamConditionFetching,
  } = useGetExamConditionQuery(
    SessionId && ExamId && SubClassId
      ? { SessionID: SessionId, ExamID: ExamId, SubClassID: SubClassId }
      : skipToken
  );

  const [
    postExamCondition,
    {
      isLoading: isPostingExamCondition,
      error: postExamConditionError,
      isSuccess: isExamConditionPosted,
    },
  ] = usePostExamConditionMutation();

  useEffect(() => {
    if (examConditionError) {
      console.error("Failed to fetch exam condition:", examConditionError);
      // You might want to show a toast notification here
    }
  }, [examConditionError]);

  useEffect(() => {
    // When filter values change but no data is available (either loading or no data)
    if (examConditionData === null) {
      methods.reset({
        SessionID: SessionId || null,
        ExamID: ExamId || null,
        SubClassID: SubClassId || null,
        // Reset all other fields to their default values
        MeariUnMeari: null,
        MeariDivision: "",
        MeariAraDivision: "",
        Color7: false,
        GorMeariAction: null,
        GorMeariSCount: null,
        GorDivision: "",
        GorAraDivision: "",
        Color8: false,
        IfNotEqul: "",
        IfNotEqulAra: "",
        Color9: false,
        AbsenceName: "",
        AbsenceAraName: "",
        Color10: false,
        TotalMadha: null,
        MeariSCount: null,
        MeariRasibDivision: "",
        MeariRasibDivisionAra: "",
        ClassType: null,
        MostMeariAction: null,
        MostMeariScount: null,
        MostMeariBanDivision: "",
        MostMeariAraDivision: "",
        Color11: false,
        OptionalAbove: null,
        AboveGPA: null,
        Published: true,
      });
    } else if (examConditionData) {
      // When data is available, populate the form
      methods.reset({
        SessionID: examConditionData.SessionID,
        ExamID: examConditionData.ExamID,
        SubClassID: examConditionData.SubClassID,
        MeariDivision: examConditionData.MeariDivision,
        MeariAraDivision: examConditionData.MeariAraDivision,
        Color7: examConditionData.Color7,
        condition1_active: examConditionData.GorMeariAction ? 1 : 0,
        condition2_active: examConditionData.MeariUnMeari ? 1 : 0,
        condition3_active: examConditionData.MostMeariAction ? 1 : 0,
        GorMeariSCount: examConditionData.GorMeariSCount,
        GorDivision: examConditionData.GorDivision,
        GorAraDivision: examConditionData.GorAraDivision,
        Color8: examConditionData.Color8,
        IfNotEqul: examConditionData.IfNotEqul,
        IfNotEqulAra: examConditionData.IfNotEqulAra,
        Color9: examConditionData.Color9,
        AbsenceName: examConditionData.AbsenceName,
        AbsenceAraName: examConditionData.AbsenceAraName,
        Color10: examConditionData.Color10,
        TotalMadha: examConditionData.TotalMadha,
        MeariSCount: examConditionData.MeariSCount,
        MeariRasibDivision: examConditionData.MeariRasibDivision,
        MeariRasibDivisionAra: examConditionData.MeariRasibDivisionAra,
        ClassType: examConditionData.ClassType,
        MostMeariScount: examConditionData.MostMeariScount,
        MostMeariBanDivision: examConditionData.MostMeariBanDivision,
        MostMeariAraDivision: examConditionData.MostMeariAraDivision,
        Color11: examConditionData.Color11,
        OptionalAbove: examConditionData.OptionalAbove,
        AboveGPA: examConditionData.AboveGPA,
        Published: examConditionData.Published !== undefined ? 1 : 0,
      });
    }
  }, [examConditionData, SessionId, ExamId, SubClassId, methods.reset]);

  useEffect(() => {
    if (isExamConditionFetching || isExamConditionLoading) {
      Swal.fire({
        title: "লোড হচ্ছে...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isExamConditionFetching, isExamConditionLoading]);

  useEffect(() => {
    if (examConditionError) {
      Swal.fire({
        icon: "error",
        title: "ডেটা লোড ব্যর্থ হয়েছে",
        text:
          examConditionError?.data?.message ||
          "সার্ভার থেকে ডেটা আনতে সমস্যা হয়েছে!",
        confirmButtonText: "ঠিক আছে",
      });
    }
  }, [examConditionError]);

  // Show success or error Swal alert
  useEffect(() => {
    if (isExamConditionPosted) {
      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ করা হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });
    } else if (postExamConditionError) {
      Swal.fire({
        icon: "error",
        title: "সংরক্ষণ ব্যর্থ হয়েছে",
        text:
          postExamConditionError?.data?.message || "কোনো একটি সমস্যা হয়েছে!",
        confirmButtonText: "ঠিক আছে",
      });
    }
  }, [isExamConditionPosted, postExamConditionError]);

  const getConditionTitle = (condition) => {
    const titles = {
      1: "গড় মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      2: "মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      3: "অধিকতর মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      4: "(যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়)",
      5: "(যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়)",
    };
    return titles[condition] || "";
  };

  const renderConditionFields = (condition) => {
    switch (condition) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <DefaultInput
                registerKey="GorMeariSCount"
                placeholder="গড় মিয়ানের যে কোন"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                কিভাবে অথবা এর চেয়ে কম ফেল করে তাহল
              </p>
              <DefaultInput registerKey="GorDivision" placeholder="ইংরেজি" />
              <DefaultInput registerKey="GorAraDivision" placeholder="বাংলা" />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption label="Silver Color" registerKey="Color8" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                এর চেয়ে বেশি ফেল করলে
              </p>
              <DefaultInput registerKey="IfNotEqul" placeholder="ইংরেজি" />
              <DefaultInput registerKey="IfNotEqulAra" placeholder="বাংলা" />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption label="Silver Color" registerKey="Color9" />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <DefaultInput
                registerKey="MeariSCount"
                placeholder="মি”ইয়ারী যে কোন"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                কিভাবে অথবা এর চেয়ে কম ফেল করে তাহল
              </p>
              <DefaultInput registerKey="MeariDivision" placeholder="ইংরেজি" />
              <DefaultInput
                registerKey="MeariAraDivision"
                placeholder="বাংলা"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <p></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                এর চেয়ে বেশি ফেল করলে
              </p>
              <DefaultInput
                registerKey="MeariRasibDivision"
                placeholder="ইংরেজি"
              />
              <DefaultInput
                registerKey="MeariRasibDivisionAra"
                placeholder="বাংলা"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption label="Silver Color" registerKey="Color7" />
            </div>
          </>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <p className="text-gray-600 self-center">যে কোন</p>
            <DefaultInput registerKey="MostMeariScount" placeholder="নাম্বার" />
            <p className="text-gray-600 self-center">টি কিভাবে ফেল করলে</p>
            <DefaultInput
              registerKey="MostMeariBanDivision"
              placeholder="ইংরেজি"
            />
            <DefaultInput
              registerKey="MostMeariAraDivision"
              placeholder="বাংলা"
            />
            <p className=" text-gray-600 self-center">হবে ।</p>

            <CheckboxOption label="Silver Color" registerKey="Color11" />
          </div>
        );
      case 4:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                অপশনাল বিষয়ের গ্রেড কত এর বেশি হলে মূল গ্রেডের সাথে যোগ হবে
              </p>

              <DefaultInput registerKey="AboveGPA" />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                যদি কোন এক বিষয়ে এন্ট্রি বা নাম্বার বাকি থাকে তাহলে ডিভিশন হবে
              </p>

              <DefaultInput registerKey="AbsenceName" />
              <DefaultInput registerKey="AbsenceAraName" />
              <p className=" text-gray-600 self-center">হবে ।</p>

              <CheckboxOption label="Silver Color" registerKey="Color10" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      SessionID: data.SessionID,
      ExamID: data.ExamID,
      SubClassID: data.SubClassID,
      MeariUnMeari: data.MeariUnMeari,
      MeariDivision: data.MeariDivision,
      MeariAraDivision: data.MeariAraDivision,
      Color7: data.Color7,
      GorMeariAction: data.GorMeariAction,
      GorMeariSCount: data.GorMeariSCount,
      GorDivision: data.GorDivision,
      GorAraDivision: data.GorAraDivision,
      Color8: data.Color8,
      IfNotEqul: data.IfNotEqul,
      IfNotEqulAra: data.IfNotEqulAra,
      Color9: data.Color9,
      AbsenceName: data.AbsenceName,
      AbsenceAraName: data.AbsenceAraName,
      Color10: data.Color10,
      TotalMadha: data.TotalMadha,
      MeariSCount: data.MeariSCount,
      MeariRasibDivision: data.MeariRasibDivision,
      MeariRasibDivisionAra: data.MeariRasibDivisionAra,
      ClassType: data.ClassType,
      MostMeariAction: data.MostMeariAction,
      MostMeariScount: data.MostMeariScount,
      MostMeariBanDivision: data.MostMeariBanDivision,
      MostMeariAraDivision: data.MostMeariAraDivision,
      Color11: data.Color11,
      OptionalAbove: data.OptionalAbove,
      AboveGPA: data.AboveGPA,
      Published: data.Published,
      GorMeariAction: data.condition1_active ? 1 : 0,
      MeariUnMeari: data.condition2_active ? 1 : 0,
      MostMeariAction: data.condition3_active ? 1 : 0,
      condition4_active: data.condition4_active,
      condition5_active: data.condition5_active,
    };

    try {
      await postExamCondition(payload).unwrap();
      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ করা হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "সংরক্ষণ ব্যর্থ হয়েছে",
        text: error?.data?.message || "কোনো একটি সমস্যা হয়েছে!",
        confirmButtonText: "ঠিক আছে",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6  text-sm text-gray-800 rounded-lg shadow-md border space-y-6">
          {/* Header Filters */}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                শিক্ষাবর্ষ :
              </label>
              <DefaultSelect
                options={sessionData ?? []}
                registerKey="SessionID"
                placeholder="বছর নির্বাচন করুন"
                nameField="SessionName"
                valueField={"SessionID"}
                unicode={true}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                পরীক্ষা :
              </label>
              <DefaultSelect
                options={examNameData ?? []}
                registerKey="ExamID"
                placeholder="পরীক্ষা নির্বাচন করুন"
                nameField="ExamName"
                valueField={"ExamID"}
                unicode={true}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                শ্রেণি :
              </label>
              <DefaultSelect
                options={subClassListData ?? []}
                registerKey="SubClassID"
                placeholder="শ্রেণি নির্বাচন করুন"
                nameField="SubClass"
                valueField={"SubClassID"}
                unicode={true}
              />
            </div>
          </div>

          {/* Condition Sections */}
          {[1, 2, 3, 4, 5].map((condition) => (
            <div
              key={condition}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4"
            >
              <label className="flex items-center gap-3 text-gray-800 font-semibold">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  {...methods.register(`condition${condition}_active`)}
                />
                {`কন্ডিশন-${condition} : ${getConditionTitle(condition)}`}
              </label>
              {renderConditionFields(condition)}
            </div>
          ))}

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-center items-center gap-3">
            <p className="text-gray-600 text-center md:text-left whitespace-nowrap">
              মেধার সংখ্যা কত ভাগে তা উল্লেখ করুন
            </p>
            <div className="w-full md:w-auto">
              <DefaultInput registerKey="TotalMadha" className="w-full" />
            </div>
          </div>

          <div className="flex justify-start items-center">
            <Button type="submit">Save</Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ResultsCondition;
