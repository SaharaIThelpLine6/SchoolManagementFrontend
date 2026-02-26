import { useEffect, useState } from "react";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../../../components/Button/Button";
import {
  useGetExamConditionQuery,
  usePostExamConditionMutation,
} from "../../../features/exam/examQuerySlice";
import { skipToken } from "@reduxjs/toolkit/query";
import Swal from "sweetalert2";
import FilteringForm from "./FilteringForm";
import useTranslate from "../../../utils/Translate";
import CheckboxOption from "./CheckboxOption";
import RadioOption from "../../../components/Radio/RadioOption";

const ResultsCondition = ({ colorOption }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, watch } = methods;
  const [filter, setFilter] = useState(null);

  // Conditional fetching - only fetch when all required IDs are available
  const {
    data: examConditionData,
    isLoading: isExamConditionLoading,
    error: examConditionError,
    isFetching: isExamConditionFetching,
  } = useGetExamConditionQuery(
    filter?.SessionId && filter?.ExamId && filter?.SubClassId
      ? {
          SessionID: filter?.SessionId,
          ExamID: filter?.ExamId,
          SubClassID: filter?.SubClassId,
        }
      : skipToken
  );

  console.log(examConditionData, "examConditionData")
  const colorOptions = [
    { id: "1", label: "দরসিয়াত" },
    { id: "2", label: "হিফয" },
  ];
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
        MostMeariScount: examConditionData.MostMeariScount,
        MostMeariBanDivision: examConditionData.MostMeariBanDivision,
        MostMeariAraDivision: examConditionData.MostMeariAraDivision,
        Color11: examConditionData.Color11,
        OptionalAbove: examConditionData.OptionalAbove,
        AboveGPA: examConditionData.AboveGPA,
       ClassType: String(examConditionData.ClassType), 
        Published: examConditionData.Published !== undefined ? 1 : 0,
      });
    }
  }, [examConditionData, methods.reset]);

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
      1: "Regarding the failure of the average math book",
      2: "Regarding the failure of the Mi'Yari book",
      3: "More about the failure of the Mi'yari book",
      4: "Optional Subject",
      5: "(If a number is not entered for a subject)",
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
                placeholder={translate("Average Mi'iary any")}
                type="number"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                {translate("If someone fails in this way or less, then")}
              </p>
              <DefaultInput
                registerKey="GorDivision"
                placeholder={translate("English")}
              />
              <DefaultInput
                registerKey="GorAraDivision"
                placeholder={translate("Bangla")}
              />
              <p className=" text-gray-600 self-center">{translate("Will.")}</p>
              <CheckboxOption
                label={translate("Silver Color")}
                registerKey="Color8"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                {translate("Fails in the subject, then")}
              </p>
              <DefaultInput
                registerKey="IfNotEqul"
                placeholder={translate("English")}
              />
              <DefaultInput
                registerKey="IfNotEqulAra"
                placeholder={translate("Bangla")}
              />
              <p className=" text-gray-600 self-center">{translate("Will.")}</p>
              <CheckboxOption
                label={translate("Silver Color")}
                registerKey="Color9"
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <DefaultInput
                registerKey="MeariSCount"
                placeholder={translate("Mi'iary any")}
                type="number"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                {translate("If someone fails more than that")}
              </p>
              <DefaultInput
                registerKey="MeariDivision"
                placeholder={translate("English")}
              />
              <DefaultInput
                registerKey="MeariAraDivision"
                placeholder={translate("Bangla")}
              />
              <p className=" text-gray-600 self-center">{translate("Will.")}</p>
              <p></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                {translate("Fails in the subject, then")}
              </p>
              <DefaultInput
                registerKey="MeariRasibDivision"
                placeholder={translate("English")}
              />
              <DefaultInput
                registerKey="MeariRasibDivisionAra"
                placeholder={translate("Bangla")}
              />
              <p className=" text-gray-600 self-center">{translate("Will.")}</p>
              <CheckboxOption
                label={translate("Silver Color")}
                registerKey="Color7"
              />
            </div>
          </>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <p className="text-gray-600 self-center">
              {translate("If someone fails in")}
            </p>
            <DefaultInput
              registerKey="MostMeariScount"
              placeholder={translate("Number")}
              type="number"
            />
            <p className="text-gray-600 self-center">{translate("subjects")}</p>
            <DefaultInput
              registerKey="MostMeariBanDivision"
              placeholder={translate("English")}
            />
            <DefaultInput
              registerKey="MostMeariAraDivision"
              placeholder={translate("Bangla")}
            />
            <p className=" text-gray-600 self-center">{translate("Will.")}</p>

            <CheckboxOption
              label={translate("Silver Color")}
              registerKey="Color11"
            />
          </div>
        );
      case 4:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                {translate(
                  "If the grade in the optional subject is above how much, will it be added to the main grade"
                )}
              </p>

              <DefaultInput registerKey="AboveGPA" type="number" />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                {translate(
                  "If there are entries or numbers left in any subject, then division will be done."
                )}
              </p>

              <DefaultInput registerKey="AbsenceName" />
              <DefaultInput registerKey="AbsenceAraName" />
              <p className=" text-gray-600 self-center">{translate("Will.")}</p>

              <CheckboxOption
                label={translate("Silver Color")}
                registerKey="Color10"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      SessionID: filter.SessionId,
      ExamID: filter.ExamId,
      SubClassID: filter.SubClassId,
      MeariDivision: data.MeariDivision,
      MeariAraDivision: data.MeariAraDivision,
      Color7: data.Color7,
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
      MostMeariScount: data.MostMeariScount,
      MostMeariBanDivision: data.MostMeariBanDivision,
      MostMeariAraDivision: data.MostMeariAraDivision,
      Color11: data.Color11,
      // OptionalAbove: data.OptionalAbove,
      AboveGPA: data.AboveGPA,
      // Published: data.Published,
      // ClassType: data.ClassType === 'null' ? null : data.ClassType,
      GorMeariAction: data.condition1_active ? 1 : 0,
      MeariUnMeari: data.condition2_active ? 1 : 0,
      MostMeariAction: data.condition3_active ? 1 : 0,
      // condition5_active: data.condition5_active,
    };

    try {
      console.log(payload, "payload")
      await postExamCondition(payload).unwrap();
    console.log(data, "data")
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
        <div className="text-sm text-gray-800 bg-white space-y-6">
          {/* Header Filters */}
          <div className="grid grid-cols-1  sm:grid-cols-4 gap-3">
            <div className="col-span-3">
              <FilteringForm onFilter={setFilter} />
            </div>
            {/* Color Selection Fieldset */}
            {colorOption && (
              <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px]">
                <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
                  ক্লাসের ধরণ
                </legend>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
                  {colorOptions.map((option) => (
                    <RadioOption
                      key={option.id}
                      option={option}
                      register={methods.register}
                      name="ClassType"
                    />
                  ))}
                </div>
              </fieldset>
            )}
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
                {`${translate(
                  `Condition-${condition} : ${getConditionTitle(condition)}`
                )}`}
              </label>
              {renderConditionFields(condition)}
            </div>
          ))}

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-center items-center gap-3">
            <p className="text-gray-600 text-center md:text-left whitespace-nowrap">
              {translate("Please specify the number of merit points.")}
            </p>
            <div className="w-full md:w-auto">
              <DefaultInput
                registerKey="TotalMadha"
                className="w-full"
                type="number"
              />
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
