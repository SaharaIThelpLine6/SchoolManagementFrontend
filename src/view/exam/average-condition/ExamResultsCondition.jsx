import React, { useEffect, useMemo, useState } from "react";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Button from "../../../components/Button/Button";
import {
  useGetExamConditionQuery,
  useGetExamDivitionByTypeQuery,
  usePostExamConditionMutation,
  useUpdateExamSettingsMutation,
  usePutExamRoutineMutation,
  usePostExamSettingsMutation,
} from "../../../features/exam/examQuerySlice";
import { skipToken } from "@reduxjs/toolkit/query";
import Swal from "sweetalert2";
import FilteringForm from "./FilteringForm";
import useTranslate from "../../../utils/Translate";
import CheckboxOption from "./CheckboxOption";
import RadioOption from "../../../components/Radio/RadioOption";
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";
import bnBijoy2Unicode, { convertOnLanguageChange } from "../../../utils/conveter";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { set } from "lodash";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";


function HighlightToggle({ register, control, arrayName, index }) {
  const isHighlighted = useWatch({
    control,
    name: `${arrayName}.${index}.isHighlighted`,
  });

  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          {...register(`${arrayName}.${index}.isHighlighted`)}
        />
        <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4" />
      </label>

      {isHighlighted && (
        <input
          type="color"
          defaultValue="#ffeb3b"
          title="হাইলাইট রঙ নির্বাচন করুন"
          className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
          {...register(`${arrayName}.${index}.highlightColor`)}
        />
      )}
    </div>
  );
}

const ExamResultsCondition = ({ sharedStepData, setSharedStepData }) => {

  const getDefaultValues = () => {
    const defaults = {
      condition1: { enabled: false, row1: { value: '', DivisionID: '' }, row2: { value: '', DivisionID: '' } },
      condition2: { enabled: false, row1: { value: '', DivisionID: '' }, row2: { value: '', DivisionID: '' } },
      condition3: { enabled: false, row1: { value: '', DivisionID: '' } },
      SubSonkha: '',
      DAbsance: '',
      DAbsanceColor: { color: '' },
      meritCount: '',
      optionalSubjectGrade: ''
    };

    // Populate from sharedStepData if available
    if (sharedStepData) {
      // For condition1, condition2, condition3
      [1, 2, 3].forEach(id => {
        if (sharedStepData[`condition${id}`]) {
          defaults[`condition${id}`] = {
            ...defaults[`condition${id}`],
            ...sharedStepData[`condition${id}`]
          };
        }
      });

      // Other fields
      if (sharedStepData.SubSonkha) defaults.SubSonkha = sharedStepData.SubSonkha;
      if (sharedStepData.DAbsance) defaults.DAbsance = sharedStepData.DAbsance;
      if (sharedStepData.DAbsanceColor) defaults.DAbsanceColor = sharedStepData.DAbsanceColor;
      if (sharedStepData.meritCount) defaults.meritCount = sharedStepData.meritCount;
      if (sharedStepData.optionalSubjectGrade) defaults.optionalSubjectGrade = sharedStepData.optionalSubjectGrade;
    }

    return defaults;
  };
  const methods = useForm({
    defaultValues: getDefaultValues()
  });
  const translate = useTranslate();
  const { handleSubmit, watch, register, control } = methods;
  const [filter, setFilter] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [addExamSettings] = usePostExamSettingsMutation();
  const [updateExamSettings] = useUpdateExamSettingsMutation();

  const { next, previous } = useMultiStepForm(sharedStepData?.isEditMode ? 'examConditionEdit' : 'examCondition');

  const { data: examDivitions } = useGetExamDivitionByTypeQuery(sharedStepData?.ExamType, {
    skip: !sharedStepData?.ExamType,
  });

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

  const filteredExamDivitions = useMemo(() => {
    if (!examDivitions) return [];

    if (Number(sharedStepData?.ExamType) === 4) {
      const allowedDivisionIds = new Set(
        (sharedStepData?.subjectGradeList || [])
          .flatMap((subject) => subject?.gradeBands || [])
          .filter((band) => band?.DivisionID !== "" && band?.DivisionID !== null && band?.DivisionID !== undefined)
          .map((band) => String(band.DivisionID))
      );

      return examDivitions.filter((division) =>
        allowedDivisionIds.has(String(division.ID))
      );
    }

    const gradeBandDivisionIds = new Set(
      (sharedStepData?.gradeBands || []).map((band) => String(band.DivisionID))
    );

    return examDivitions.filter((division) =>
      gradeBandDivisionIds.has(String(division.ID))
    );

  }, [examDivitions, sharedStepData?.gradeBands, sharedStepData?.subjectGradeList, sharedStepData?.ExamType]);


  // useEffect(() => {
  //   console.log(filteredExamDivitions);
  // }, [filteredExamDivitions])

  const { setValue, getValues } = methods;

  useEffect(() => {
    [1, 2, 3].forEach(id => {
      setValue(`condition${id}.enabled`, false);
    });
    if (sharedStepData?.subjectPassNumbers?.length && sharedStepData?.ExamType != 4) {

      let subjectCount = 0

      sharedStepData.subjectPassNumbers.forEach(item => {
        if (item.mayeri) {
          setValue(`condition${item.mayeri}.enabled`, true);
        }

        !item?.optional ? subjectCount++ : null;
      });
      if (sharedStepData?.isEditMode) {
        if (sharedStepData?.SubSonkha) {
          setValue("SubSonkha", sharedStepData?.SubSonkha);
        }
        else {
          setValue("SubSonkha", subjectCount);
        }
      } else {
        setValue("SubSonkha", subjectCount);
      }


    } else if (sharedStepData?.ExamType == 4) {
      sharedStepData?.subjectGradeList.forEach(item => {
        if (item.mayeri) {
          setValue(`condition${item.mayeri}.enabled`, true);
        }
      });
    }
  }, [sharedStepData, setValue]);

  const handleSaveAndPrevious = () => {
    previous();
  };

  const onSubmit = async (data) => {
    const updatedData = {
      ...sharedStepData,
      ...data,
      examDivitions: filteredExamDivitions,
    };
    // console.log(updatedData);
    setSharedStepData(updatedData);

    try {
      // const response = sharedStepData?.isEditMode ? await updateExamSettings(updatedData).unwrap() : await addExamSettings(updatedData).unwrap();
      next();
      // Swal.fire({
      //   icon: "success",
      //   title: "Success",
      //   text: "Data submitted successfully.",
      // });
    } catch (error) {
      console.error("Error submitting data:", error);
      // Swal.fire({
      //   icon: "error",
      //   title: "Submission Failed",
      //   text: "There was an error submitting the data. Please try again.",
      // });
    }
  };

  const condition_one_val = watch("condition1.row1.value");
  const condition_two_val = watch("condition2.row1.value");

  return (
    <FormProvider {...methods}>
      <form
        className="w-full space-y-10 bg-white p-6 rounded-xl shadow-md"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2">
            শর্ত অনুযায়ী গ্রেড নির্ধারণ
          </h2>

          <div className="space-y-4">
            {
              sharedStepData?.ExamType != 3 && sharedStepData?.ExamType != 4 ? (
                <React.Fragment>
                  {/* কন্ডিশন-১ */}
                  <div className="border border-gray-200 rounded-md p-4">
                    <label className="flex items-center gap-2 mb-3 font-medium text-gray-800">
                      <input type="checkbox" className="h-4 w-4" {...register("condition1.enabled")} />
                      কন্ডিশন-১ : গর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="w-full text-sm border border-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            সর্বোচ্চ ফেল কিতাব সংখ্যা (এর সমান বা কম)
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            ডিভিশন
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            কালার
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-2 align-top">
                            <DefaultInput registerKey="condition1.row1.value" type="text" defaultValue={getValues("condition1.row1.value")} />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition1.row1.DivisionID`}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}

                            />
                          </td>
                          <td className="px-4 py-2">
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition1.row1"
                              index={"color"}
                            />
                          </td>
                        </tr>
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-2 align-middle">
                            {convertOnLanguageChange(condition_one_val ?? '')} এর চেয়ে বেশী ফেল করলে
                          </td>
                          <td className="px-4 py-2 align-top">
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition1.row2.DivisionID`}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}

                            />
                          </td>
                          <td className="px-4 py-2">
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition1.row2"
                              index={"color"}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* কন্ডিশন-২ */}
                  <div className="border border-gray-200 rounded-md p-4">
                    <label className="flex items-center gap-2 mb-3 font-medium text-gray-800">
                      <input type="checkbox" className="h-4 w-4" {...register("condition2.enabled")} />
                      কন্ডিশন-২ : মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="w-full text-sm border border-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            মি'ইয়ারী কিতাব সংখ্যা (এর সমান বা কম)
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            ডিভিশন
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            কালার
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-2 align-top">
                            <DefaultInput registerKey="condition2.row1.value" type="number" defaultValue={getValues("condition2.row1.value")} />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition2.row1.DivisionID`}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}

                            />
                          </td>
                          <td className="px-4 py-2 align-top text-gray-400">
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition2.row1"
                              index={'color'}
                            />

                          </td>
                        </tr>
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-2 align-middle">
                            {convertOnLanguageChange(condition_two_val ?? '')} এর চেয়ে বেশি ফেল করলে
                          </td>
                          <td className="px-4 py-2 align-top">
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition2.row2.DivisionID`}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}

                            />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition2.row2"
                              index={'color'}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* কন্ডিশন-৩ */}
                  <div className="border border-gray-200 rounded-md p-4">
                    <label className="flex items-center gap-2 mb-3 font-medium text-gray-800">
                      <input type="checkbox" className="h-4 w-4" {...register("condition3.enabled")} />
                      কন্ডিশন-৩ : অধিকতর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="w-full text-sm border border-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            কিতাব সংখ্যা
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            ডিভিশন
                          </th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            কালার
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-100">
                          <td className="px-4 py-2 align-top">

                            <DefaultInput registerKey="condition3.row1.value" type="number" defaultValue={getValues("condition3.row1.value")} />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition3.row1.DivisionID`}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}

                            />
                          </td>
                          <td className="px-4 py-2 align-top">
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition3.row1"
                              index={'color'}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </React.Fragment>
              ) : null
            }

            {
              sharedStepData?.ExamType == 4 ? (
                <div className="border border-gray-200 rounded-md p-4">
                  <label className="flex items-center gap-2 mb-3 font-medium text-gray-800">
                    <input type="checkbox" className="h-4 w-4" {...register("condition3.enabled")}   checked={true} />
                    কন্ডিশন-১ :  কিতাবে ফেল সংক্রান্ত
                  </label>

                  <table className="w-full text-sm border border-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          কিতাব সংখ্যা
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          ডিভিশন
                        </th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">
                          কালার
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="px-4 py-2 align-top">

                          <DefaultInput registerKey="condition3.row1.value" type="number" defaultValue={getValues("condition3.row1.value")} />
                        </td>
                        <td className="px-4 py-2 align-top">
                          <DefaultSelect
                            label=""
                            options={filteredExamDivitions}
                            registerKey={`condition3.row1.DivisionID`}
                            nameField="DivisionNames"
                            valueField="ID"
                            defaultValue={translate("Select Divition")}

                          />
                        </td>
                        <td className="px-4 py-2 align-top">
                          <HighlightToggle
                            register={register}
                            control={control}
                            arrayName="condition3.row1"
                            index={'color'}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null
            }


            {/* কন্ডিশন-৪ */}
            <div className="border border-gray-200 rounded-md p-4">


              <table className="w-full text-sm border border-gray-100 mb-3">

                <tbody>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-2 align-middle">
                      {
                        sharedStepData?.ExamType != 4 ? <DefaultInput label={" উল্লেখিত সংখ্যা ব্যতীত অন্য সংখ্যা দ্বারা যদি মোট নাম্বার ভাগ দেয়ার প্রয়োজন হয় তাহলে নিচের বক্সে উল্লেখ করুন"} registerKey="SubSonkha" type="number" require="This Field is required" defaultValue={getValues("SubSonkha")} />
                          : null
                      }

                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-2 align-top">
                      <DefaultSelect
                        label="যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়"
                        options={examDivitions}
                        registerKey={`DAbsance`}
                        nameField="DivisionNames"
                        valueField="ID"
                        require="This Field is required"
                      />
                    </td>
                    <td className="px-4 pt-6 align-middle">
                      <HighlightToggle
                        register={register}
                        control={control}
                        arrayName="DAbsanceColor"
                        index={'color'}
                      />
                    </td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-4 py-2 align-top">

                      <DefaultInput label={"মেধার সংখ্যা কত হবে তা উল্লেখ করুন।"} registerKey="meritCount" type="number" require="This Field is required" defaultValue={getValues("meritCount")} />
                    </td>
                    <td className="px-4 pt-6 align-middle">
                      {
                        sharedStepData?.ExamType == 4 ? <DefaultInput label={"অপশনাল বিষয়ের গ্রেড কত এর বেশি হলে মূল গ্রেডের সাথে যোগ হবে"} registerKey="optionalSubjectGrade" type="number" require="This Field is required" defaultValue={getValues("optionalSubjectGrade")} /> : null
                      }

                    </td>
                  </tr>
                </tbody>
              </table>


            </div>
          </div>

          <div className="mt-6 flex justify-between gap-4">
            <div>
              <Button
                type="button"
                onClick={handleSaveAndPrevious}
              >
                {translate("Previous")}
              </Button>
            </div>


            <div className="text-end">
              <Button
                type="submit"
              >
                {translate("Save & Continue")}
              </Button>
            </div>
          </div>
        </section>

        {submittedData && (
          <section>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Submitted Data</h3>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-4 overflow-auto max-h-96">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </section>
        )}
      </form>
    </FormProvider>
  );
};

export default ExamResultsCondition;