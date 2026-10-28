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
import bnBijoy2Unicode, { convertOnLanguageChange } from "../../../utils/conveter";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { set } from "lodash";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";
import SvgIcon from "../../../components/icons/SvgIcon";

const createEmptyCondition = (id) => {
  const emptyRow = () => ({
    value: "",
    DivisionID: "",
    color: { isHighlighted: false, highlightColor: "#ffeb3b" },
  });

  return {
    enabled: false,
    row1: emptyRow(),
    ...(id < 3 ? { row2: emptyRow() } : {}),
  };
};


function HighlightToggle({ register, control, arrayName, index, readOnly = false }) {
  const isHighlighted = useWatch({
    control,
    name: `${arrayName}.${index}.isHighlighted`,
  });
  const highlightColor = useWatch({
    control,
    name: `${arrayName}.${index}.highlightColor`,
  });
  const highlightRegistration = register(`${arrayName}.${index}.isHighlighted`);
  const colorRegistration = register(`${arrayName}.${index}.highlightColor`);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          {...highlightRegistration}
          checked={Boolean(isHighlighted)}
          onChange={readOnly ? (event) => event.preventDefault() : highlightRegistration.onChange}
          aria-readonly={readOnly}
        />
        <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4" />
      </label>

      {isHighlighted && (
        <input
          type="color"
          value={highlightColor || "#ffeb3b"}
          title="হাইলাইট রঙ নির্বাচন করুন"
          className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
          {...colorRegistration}
          onChange={readOnly ? (event) => event.preventDefault() : colorRegistration.onChange}
          onClick={readOnly ? (event) => event.preventDefault() : undefined}
          onMouseDown={readOnly ? (event) => event.preventDefault() : undefined}
          onKeyDown={readOnly ? (event) => event.preventDefault() : undefined}
          aria-readonly={readOnly}
        />
      )}
    </div>
  );
}

const ExamResultsCondition = ({ sharedStepData, setSharedStepData }) => {

  const getDefaultValues = () => {
    const defaults = {
      condition1: createEmptyCondition(1),
      condition2: createEmptyCondition(2),
      condition3: createEmptyCondition(3),
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
  const [pointbaseOptional, setPointBasedOptional] = useState(false);
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
      const subjectGradeList = sharedStepData?.subjectGradeList || [];

      const isPointBasedOptional = subjectGradeList.some(
        (subject) => Number(subject?.mayeri) === 4
      );

      setPointBasedOptional(isPointBasedOptional);

      const allowedDivisionIds = new Set(
        subjectGradeList
          .flatMap((subject) => subject?.gradeBands || [])
          .filter(
            (band) =>
              band?.DivisionID !== "" &&
              band?.DivisionID !== null &&
              band?.DivisionID !== undefined
          )
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
    const conditionSubjects = Number(sharedStepData?.ExamType) === 4
      ? sharedStepData?.subjectGradeList || []
      : sharedStepData?.subjectPassNumbers || [];
    const availableConditions = new Set(
      conditionSubjects
        .map((subject) => Number(subject?.mayeri))
        .filter((mayeri) => Number.isInteger(mayeri) && mayeri >= 1 && mayeri <= 3)
    );

    [1, 2, 3].forEach((id) => {
      const conditionName = `condition${id}`;
      const isAvailable = availableConditions.has(id);
      setValue(`${conditionName}.enabled`, isAvailable);

      if (!isAvailable) {
        setValue(conditionName, createEmptyCondition(id));
      }
    });

    if (sharedStepData?.subjectPassNumbers?.length && sharedStepData?.ExamType != 4) {

      let subjectCount = 0

      sharedStepData.subjectPassNumbers.forEach(item => {
        !item?.optional ? subjectCount++ : null;
      });
      setValue(
        "SubSonkha",
        sharedStepData?.SubSonkha !== "" && sharedStepData?.SubSonkha != null
          ? sharedStepData.SubSonkha
          : subjectCount
      );


    }
  }, [sharedStepData, setValue]);

  const handleSaveAndPrevious = () => {
    previous();
  };

  const onSubmit = async (data) => {

    const missingFields = [];

    [1, 2, 3].forEach((id) => {
      const condition = data[`condition${id}`];

      if (!condition?.enabled) return;

      const conditionName =
        id === 1
          ? "কন্ডিশন-১"
          : id === 2
            ? "কন্ডিশন-২"
            : "কন্ডিশন-৩";

      if (!condition?.row1?.value) {
        missingFields.push(`${conditionName}: কিতাব সংখ্যার ঘর পূরণ করুন`);
      }

      if (!condition?.row1?.DivisionID) {
        missingFields.push(`${conditionName}: প্রথম ডিভিশন নির্বাচন করুন`);
      }

      if ((id === 1 || id === 2) && !condition?.row2?.DivisionID) {
        missingFields.push(`${conditionName}: দ্বিতীয় ডিভিশন নির্বাচন করুন`);
      }
    });

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "প্রয়োজনীয় তথ্য পূরণ করুন",
        html: `
        <div style="text-align: left;">
          ${missingFields.map(item => `<div>• ${item}</div>`).join("")}
        </div>
      `,
        confirmButtonText: "ঠিক আছে",
      });

      return;
    }

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
  const condition1Enabled = Boolean(watch("condition1.enabled"));
  const condition2Enabled = Boolean(watch("condition2.enabled"));
  const condition3Enabled = Boolean(watch("condition3.enabled"));

  return (
    <FormProvider {...methods}>
      <form
        className="w-full min-w-0 space-y-6 bg-white sm:rounded-xl sm:p-4 sm:shadow-md lg:space-y-10 lg:p-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <section className="min-w-0">
          <h2 className="mb-4 break-words pb-2 text-base font-semibold text-gray-800 sm:text-lg">
            শর্ত অনুযায়ী গ্রেড নির্ধারণ
          </h2>

          <div className="min-w-0 space-y-4">
            {
              sharedStepData?.ExamType != 3 && sharedStepData?.ExamType != 4 ? (
                <React.Fragment>
                  {/* কন্ডিশন-১ */}
                  <div hidden={!condition1Enabled} className="min-w-0 rounded-md border border-gray-200 p-3 sm:p-4">
                    <label className="mb-3 flex items-start gap-2 text-sm font-medium leading-6 text-gray-800 sm:text-base">
                      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register("condition1.enabled")} checked={Boolean(watch("condition1.enabled"))} onChange={(event) => event.preventDefault()} aria-readonly="true" />
                      কন্ডিশন-১ : গর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="block w-full min-w-0 text-sm md:table md:border md:border-gray-100">
                      <thead className="hidden bg-gray-50 md:table-header-group">
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
                      <tbody className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:table-row-group">
                        <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">সর্বোচ্চ ফেল কিতাব সংখ্যা (এর সমান বা কম)</span>
                            <DefaultInput registerKey="condition1.row1.value" type="text" defaultValue={getValues("condition1.row1.value")} readOnly={!condition1Enabled} />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition1.row1.DivisionID`}
                              initialValue={getValues("condition1.row1.DivisionID")}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}
                              readOnly={!condition1Enabled}
                            />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition1.row1"
                              index={"color"}
                              readOnly={!condition1Enabled}
                            />
                          </td>
                        </tr>
                        <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                          <td className="block min-w-0 break-words md:table-cell md:px-4 md:py-2 md:align-middle">
                            {convertOnLanguageChange(condition_one_val ?? '')} এর চেয়ে বেশী ফেল করলে
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition1.row2.DivisionID`}
                              initialValue={getValues("condition1.row2.DivisionID")}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}
                              readOnly={!condition1Enabled}
                            />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition1.row2"
                              index={"color"}
                              readOnly={!condition1Enabled}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* কন্ডিশন-২ */}
                  <div hidden={!condition2Enabled} className="min-w-0 rounded-md border border-gray-200 p-3 sm:p-4">
                    <label className="mb-3 flex items-start gap-2 text-sm font-medium leading-6 text-gray-800 sm:text-base">
                      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register("condition2.enabled")} checked={Boolean(watch("condition2.enabled"))} onChange={(event) => event.preventDefault()} aria-readonly="true" />
                      কন্ডিশন-২ : মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="block w-full min-w-0 text-sm md:table md:border md:border-gray-100">
                      <thead className="hidden bg-gray-50 md:table-header-group">
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
                      <tbody className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:table-row-group">
                        <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">মি'ইয়ারী কিতাব সংখ্যা (এর সমান বা কম)</span>
                            <DefaultInput registerKey="condition2.row1.value" type="number" defaultValue={getValues("condition2.row1.value")} readOnly={!condition2Enabled} />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition2.row1.DivisionID`}
                              initialValue={getValues("condition2.row1.DivisionID")}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}
                              readOnly={!condition2Enabled}
                            />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition2.row1"
                              index={'color'}
                              readOnly={!condition2Enabled}
                            />

                          </td>
                        </tr>
                        <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                          <td className="block min-w-0 break-words md:table-cell md:px-4 md:py-2 md:align-middle">
                            {convertOnLanguageChange(condition_two_val ?? '')} এর চেয়ে বেশি ফেল করলে
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition2.row2.DivisionID`}
                              initialValue={getValues("condition2.row2.DivisionID")}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}
                              readOnly={!condition2Enabled}
                            />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition2.row2"
                              index={'color'}
                              readOnly={!condition2Enabled}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* কন্ডিশন-৩ */}
                  <div hidden={!condition3Enabled} className="min-w-0 rounded-md border border-gray-200 p-3 sm:p-4">
                    <label className="mb-3 flex items-start gap-2 text-sm font-medium leading-6 text-gray-800 sm:text-base">
                      <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register("condition3.enabled")} checked={Boolean(watch("condition3.enabled"))} onChange={(event) => event.preventDefault()} aria-readonly="true" />
                      কন্ডিশন-৩ : অধিকতর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত
                    </label>

                    <table className="block w-full min-w-0 text-sm md:table md:border md:border-gray-100">
                      <thead className="hidden bg-gray-50 md:table-header-group">
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
                      <tbody className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:table-row-group">
                        <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">

                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">কিতাব সংখ্যা</span>
                            <DefaultInput registerKey="condition3.row1.value" type="number" defaultValue={getValues("condition3.row1.value")} readOnly={!condition3Enabled} />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                            <DefaultSelect
                              label=""
                              options={filteredExamDivitions}
                              registerKey={`condition3.row1.DivisionID`}
                              initialValue={getValues("condition3.row1.DivisionID")}
                              nameField="DivisionNames"
                              valueField="ID"
                              defaultValue={translate("Select Divition")}
                              readOnly={!condition3Enabled}
                            />
                          </td>
                          <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                            <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                            <HighlightToggle
                              register={register}
                              control={control}
                              arrayName="condition3.row1"
                              index={'color'}
                              readOnly={!condition3Enabled}
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
                <div hidden={!condition3Enabled} className="min-w-0 rounded-md border border-gray-200 p-3 sm:p-4">
                  <label className="mb-3 flex items-start gap-2 text-sm font-medium leading-6 text-gray-800 sm:text-base">
                    <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" {...register("condition3.enabled")} checked={Boolean(watch("condition3.enabled"))} onChange={(event) => event.preventDefault()} aria-readonly="true" />
                    কন্ডিশন-১ :  কিতাবে ফেল সংক্রান্ত
                  </label>

                  <table className="block w-full min-w-0 text-sm md:table md:border md:border-gray-100">
                    <thead className="hidden bg-gray-50 md:table-header-group">
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
                    <tbody className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:table-row-group">
                      <tr className="grid min-w-0 grid-cols-1 gap-3 rounded-lg border border-gray-100 p-3 md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:p-0">
                        <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">

                          <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">কিতাব সংখ্যা</span>
                          <DefaultInput registerKey="condition3.row1.value" type="number" defaultValue={getValues("condition3.row1.value")} readOnly={!condition3Enabled} />
                        </td>
                        <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                          <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">ডিভিশন</span>
                          <DefaultSelect
                            label=""
                            options={filteredExamDivitions}
                            registerKey={`condition3.row1.DivisionID`}
                            initialValue={getValues("condition3.row1.DivisionID")}
                            nameField="DivisionNames"
                            valueField="ID"
                            defaultValue={translate("Select Divition")}
                            readOnly={!condition3Enabled}
                          />
                        </td>
                        <td className="block min-w-0 md:table-cell md:px-4 md:py-2 md:align-top">
                          <span className="mb-1 block text-xs font-medium text-gray-600 md:hidden">{translate('Color')}</span>
                          <HighlightToggle
                            register={register}
                            control={control}
                            arrayName="condition3.row1"
                            index={'color'}
                            readOnly={!condition3Enabled}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : null
            }


            {/* কন্ডিশন-৪ */}
            <div className="min-w-0 rounded-md border border-gray-200 p-3 sm:p-4">


              <div className="w-full text-sm">
                  <div hidden={Number(sharedStepData?.ExamType) === 4} className="min-w-0 md:col-span-2">
                    <div className="w-full min-w-0">
                      <label htmlFor="SubSonkha" className="mb-1.5 block text-sm font-bold">
                          <span className="flex items-start gap-1">
                            <span className="min-w-0 break-words text-gray-700">মোট কত নাম্বার দিয়ে ভাগ</span>
                            <span className="text-red-500">*</span>
                            <span>:</span>
                            <button
                              type="button"
                              aria-label={`ধরুন আপনি ১০টি কিতাব নির্বাচন করেছেন সুতরাং অটোমেটিক ১০ দ্বারা ভাগ হবে। যদি আপনি চান যে ৯ দ্বারা বা ১১ দ্বারা ভাগ করবেন, তাহলে আপনি এখানে সংখ্যা উল্লেখ করুন`}
                              data-tooltip-id="subject-column-tooltip"
                              data-tooltip-content={"ধরুন আপনি ১০টি কিতাব নির্বাচন করেছেন সুতরাং অটোমেটিক ১০ দ্বারা ভাগ হবে। যদি আপনি চান যে ৯ দ্বারা বা ১১ দ্বারা ভাগ করবেন, তাহলে আপনি এখানে সংখ্যা উল্লেখ করুন"}
                              data-tooltip-place="top"
                              className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                <circle cx="10" cy="6.5" r="1" fill="currentColor" />
                              </svg>
                            </button>

                          </span>
                      </label>
                      {
                        sharedStepData?.ExamType != 4 ? <DefaultInput label="" registerKey="SubSonkha" type="number" require="This Field is required" defaultValue={getValues("SubSonkha")} />
                          : null
                      }

                    </div>
                  </div>


                  <div className=" w-full gap-4 border-t border-gray-100 pt-4 flex">
                    <div className="w-full">
                      <DefaultSelect
                        label="যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়"
                        options={examDivitions}
                        registerKey={`DAbsance`}
                        initialValue={getValues("DAbsance")}
                        nameField="DivisionNames"
                        valueField="ID"
                        require="This Field is required"
                      />
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-3 md:self-end md:pb-2">
                      <span className="text-xs font-medium text-gray-600">{translate('Color')}</span>
                      <HighlightToggle
                        register={register}
                        control={control}
                        arrayName="DAbsanceColor"
                        index={'color'}
                      />
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="w-full">

                      <DefaultInput label={"মেধার সংখ্যা কত হবে তা উল্লেখ করুন।"} registerKey="meritCount" type="number" require="This Field is required" defaultValue={getValues("meritCount")} />
                    </div>
                    <div hidden={!(Number(sharedStepData?.ExamType) === 4 && pointbaseOptional)} className="min-w-0">
                      {
                        sharedStepData?.ExamType == 4 && pointbaseOptional ? <DefaultInput label={"If the grade in the optional subject is above how much, will it be added to the main grade"} registerKey="optionalSubjectGrade" type="number" require="This Field is required" defaultValue={getValues("optionalSubjectGrade")} /> : null
                      }

                    </div>
                  </div>
              </div>


            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
            <div className="min-w-0">
              <Button
                type="button"
                onClick={handleSaveAndPrevious}
                className="flex w-full items-center justify-center gap-1 sm:w-auto"
              >
                <SvgIcon name="LongArrowLeft" />
                {translate("Previous")}
              </Button>
            </div>


            <div className="min-w-0 text-end">
              <Button
                type="submit"
                className="flex w-full items-center justify-center gap-1 sm:w-auto"
              >
                {translate("Next")}
                <SvgIcon name="LongArrowRight" />
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
