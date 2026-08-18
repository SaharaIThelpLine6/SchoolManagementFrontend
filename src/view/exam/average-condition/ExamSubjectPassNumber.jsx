import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import useTranslate from "../../../utils/Translate";
import Button from "../../../components/Button/Button";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetAcademicSubjectsQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";
import SortableTable from "../../../components/Tables/SortableTable";
import FilteringForm from "./FilteringForm";
import {
  useGetAverageSubjectPassNumberQuery,
  useGetExamDivitionByTypeQuery,
  usePostAverageSubjectPassNumberMutation,
  usePostExamDivitionMutation,
  useUpdateAverageSubjectPassNumberMutation,
} from "../../../features/exam/examQuerySlice";
import { examAveragePasNumberStatus } from "../../../Data/userReportsData";
import ExamRoutingCheckbox from "../../../components/Checkboxes/ExamRoutingCheckbox";
import { skipToken } from "@reduxjs/toolkit/query";
import bnBijoy2Unicode from "../../../utils/conveter";
import Loading from "../../../components/Loading/Loading";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";
import EditButton from "../../../components/Button/EditButton";
import DeleteButton from "../../../components/Button/DeleteButton";
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";
import CheckboxOption from "./CheckboxOption";
import DefaultInput from "../../../components/Forms/DefaultInput";
import SvgIcon from "../../../components/icons/SvgIcon";
import { useMultiStepForm } from "../../../hooks/useMultiStepForm";

const MAX_GRADE_BANDS = 7;

const getUniqueDivisionIds = (gradeBands = []) =>
  new Set(
    (gradeBands || [])
      .filter(
        (band) =>
          band &&
          band.DivisionID !== "" &&
          band.DivisionID !== null &&
          band.DivisionID !== undefined
      )
      .map((band) => String(band.DivisionID))
  );


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


const ExamSubjectPassNumber = ({ sharedStepData, setSharedStepData }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const { next, previous } = useMultiStepForm(sharedStepData?.isEditMode ? 'examConditionEdit' : 'examCondition');
  const { data: examDivitions } = useGetExamDivitionByTypeQuery(sharedStepData?.ExamType, {
    skip: !sharedStepData?.ExamType,
  });
  const [pointConditionFilter, setPointConditionFilter] = useState(null);
  const [showDivisionManager, setShowDivisionManager] = useState(false);
  const [editingSubjectGradeIndex, setEditingSubjectGradeIndex] = useState(null);
  const methods = useForm({
    defaultValues: {
      SessionID: sharedStepData?.SessionID,
      ExamID: sharedStepData?.ExamID,
      SubClassID: sharedStepData?.SubClassID,
      ExamType: sharedStepData?.ExamType,
      gradeBands: sharedStepData?.ExamType != 4 ? sharedStepData?.gradeBands || [] : [
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 1 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 2 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 3 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 4 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 5 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 6 },
        { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 7 },
      ],
      subjectPassNumbers: sharedStepData?.subjectPassNumbers?.length ? sharedStepData.subjectPassNumbers : [{ SubjectID: "", mayeri: "", optional: false, PassNumber: "" }],

    },
  });
  const { data: subjectsListData } = useGetAcademicSubjectsQuery();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = methods


  useEffect(() => {
    if (!sharedStepData) return;


    console.log(getValues("subjectPassNumbers"));

    methods.reset({
      SessionID: sharedStepData?.SessionID,
      ExamID: sharedStepData?.ExamID,
      SubClassID: sharedStepData?.SubClassID,
      ExamType: sharedStepData?.ExamType,
      gradeBands: sharedStepData?.ExamType != 4
        ? sharedStepData?.gradeBands || []
        : emptyGradeBands,
      subjectPassNumbers: sharedStepData?.subjectPassNumbers?.length
        ? sharedStepData.subjectPassNumbers
        : [{ SubjectID: "", mayeri: "", optional: false, PassNumber: "" }],
      subjectGradeList: sharedStepData?.subjectGradeList || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedStepData?.SessionID, sharedStepData?.ExamID, sharedStepData?.SubClassID, sharedStepData?.ExamType]);
  const ExamType = sharedStepData?.ExamType
  console.log(ExamType);
  const [addDivition] = usePostExamDivitionMutation();

  const filteredSubjects = sharedStepData && sharedStepData.SubClassID ?
    (subjectsListData || []).filter(
      (subject) =>
        subject.SubClassID === Number(sharedStepData.SubClassID)
    ) : subjectsListData || [];
  const {
    fields: gradeFields,
    append: appendGrade,
    remove: removeGrade,
  } = useFieldArray({ control, name: "gradeBands" });

  const {
    fields: subjectFields,
    append: appendSubject,
    remove: removeSubject,
  } = useFieldArray({
    control,
    name: "subjectPassNumbers",
  });
  const {
    fields: subjectGradeFields,
    append: appendSubjectGrade,
    remove: removeSubjectGrade,
    replace: replaceSubjectGrade,
  } = useFieldArray({ control, name: "subjectGradeList" });

  const onSubmit = (data) => {
    const payload = {
      ...sharedStepData,
      ...data,
    };

    console.log("Old:", sharedStepData);
    console.log("New:", data);
    console.log("Payload:", payload);
    const subjectIds = new Set();
    for (const subject of payload.subjectPassNumbers) {
      if (subjectIds.has(subject.SubjectID)) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Subject",
          text: "একই বিষয় একাধিকবার নির্বাচন করা হয়েছে।",
        });

        return;
      }

      subjectIds.add(subject.SubjectID);
    }
    setSharedStepData(payload);
    next();
  };
  useEffect(() => {
    console.log(sharedStepData?.ExamType);

    if (
      sharedStepData?.ExamType == 4 &&
      Array.isArray(sharedStepData?.subjectGradeList)
    ) {
      replaceSubjectGrade(sharedStepData.subjectGradeList);
    }
  }, [sharedStepData, replaceSubjectGrade]);

  useEffect(() => {
    if (sharedStepData?.subjectPassNumbers?.length) {
      sharedStepData.subjectPassNumbers.forEach((band, idx) => {
        setValue(`subjectPassNumbers.${idx}.SubjectID`, band.SubjectID);
        setValue(`subjectPassNumbers.${idx}.PassNumber`, band.PassNumber);
      });
    }
  }, [filteredSubjects, sharedStepData?.subjectPassNumbers, setValue]);


  const handleSaveAndContinue = handleSubmit((data) => {
    onSubmit(data);
  });
  const handleSaveAndPrevious = () => {
    previous();
  };

  // Reused to reset the grade band rows after each subject is stored
  const emptyGradeBands = [
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 1 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 2 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 3 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 4 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 5 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 6 },
    { DivisionNumber: "", DivisionID: "", TopNum: "", Serial: 7 },
  ];

  const clearSubjectGradeForm = () => {
    setValue("SubjectID", "");
    setValue("PassNumber", "");
    setValue("MaxNumber", "");
    setValue("mayeri", "");
    setValue("gradeBands", emptyGradeBands);
    setEditingSubjectGradeIndex(null);
  };

  const clearSubjectIDOnly = () => {
    setValue("SubjectID", "");
    setEditingSubjectGradeIndex(null);
  };

  const handleEditSubjectGrade = (index) => {
    const rowData = watch(`subjectGradeList.${index}`) || {};
    setValue("SubjectID", rowData.SubjectID || "");
    setValue("PassNumber", rowData.PassNumber || "");
    setValue("MaxNumber", rowData.MaxNumber || "");
    setValue("mayeri", rowData.mayeri || "");
    setValue("gradeBands", rowData.gradeBands || emptyGradeBands);
    setEditingSubjectGradeIndex(index);
  };

  const handleAddAnotherSubject = () => {
    try {
      const subjectID = watch("SubjectID");
      const passNumber = watch("PassNumber");
      const maxNumber = watch("MaxNumber");
      const mayeri = watch("mayeri");

      const currentGradeBands = watch("gradeBands") || [];
      const existingSubjectList = watch("subjectGradeList") || [];
      const existingSubjectGradeBands = existingSubjectList
        .filter((_, rowIndex) => rowIndex !== editingSubjectGradeIndex)
        .flatMap((item) => item?.gradeBands || []);
      const uniqueDivisionIdsInSavedRows = getUniqueDivisionIds(existingSubjectGradeBands);
      const uniqueDivisionIdsForCurrentRow = getUniqueDivisionIds(currentGradeBands);
      const totalUniqueDivisionIds = new Set([
        ...uniqueDivisionIdsInSavedRows,
        ...uniqueDivisionIdsForCurrentRow,
      ]);

      if (!subjectID || !passNumber || !maxNumber) {
        Swal.fire({
          icon: "warning",
          title: translate("Please fill Subject, Pass Number and Highest score first"),
        });
        return;
      }

      if (totalUniqueDivisionIds.size > MAX_GRADE_BANDS) {
        Swal.fire({
          icon: "error",
          title: translate("Maximum 7 unique grade divisions are allowed"),
        });
        return;
      }

      // Prevent adding the same subject twice, except when editing the current row
      const isDuplicate = existingSubjectList.some(
        (item, idx) =>
          Number(item.SubjectID) === Number(subjectID) &&
          idx !== editingSubjectGradeIndex
      );

      if (isDuplicate) {
        Swal.fire({
          icon: "error",
          title: translate("This subject has already been added"),
        });
        return;
      }

      const newSubjectGrade = {
        SubjectID: subjectID,
        PassNumber: passNumber,
        MaxNumber: maxNumber,
        gradeBands: currentGradeBands,
        mayeri: mayeri,
      };

      if (editingSubjectGradeIndex !== null) {
        setValue(`subjectGradeList.${editingSubjectGradeIndex}`, newSubjectGrade);
        clearSubjectGradeForm();
      } else {
        appendSubjectGrade(newSubjectGrade);
        clearSubjectIDOnly();
      }
    } catch (error) {
      console.error("handleAddAnotherSubject failed:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to add subject"),
        text: error?.message || translate("Please try again."),
      });
    }
  };

  const handleCreateDivision = async (event) => {
    event.preventDefault();

    if (!ExamType) {
      Swal.fire({
        icon: "warning",
        title: translate("Exam Type is required"),
        text: translate("Please select an exam type before adding a division."),
      });
      return;
    }

    const divisionName = watch("DivisionName")?.trim();
    const divisionArabic = watch("DivisionArabic")?.trim() || "";
    const divisionEnglish = watch("DivisionEnglish")?.trim() || "";

    if (!divisionName) {
      Swal.fire({
        icon: "warning",
        title: translate("Division name is required"),
      });
      return;
    }

    try {
      const payload = {
        DivisionName: divisionName,
        DivisionArabic: divisionArabic,
        DivisionEnglish: divisionEnglish,
        ExamType: ExamType,
      };

      const response = await addDivition(payload).unwrap();

      setValue("DivisionName", "");
      setValue("DivisionArabic", "");
      setValue("DivisionEnglish", "");

      // setDivisionOptions((prev) => [
      //   ...prev,
      //   {
      //     id: response?.ID || `${Date.now()}`,
      //     divisionNameBn: divisionName,
      //     divisionNameAr: divisionArabic,
      //     divisionNameEn: divisionEnglish,
      //   },
      // ]);

      Swal.fire({
        title: translate("Division added successfully"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("handleCreateDivision failed:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed to save division"),
        text: error?.data?.message || error?.data?.error || translate("Please try again."),
      });
    }
  };

  return (
    <div>

      {
        ExamType != 4 ? (
          <FormProvider {...methods}>
            <form
              className="w-full space-y-10 bg-white rounded-xl shadow-md"
              onSubmit={handleSubmit(onSubmit)}
            >
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {translate("Subject Pass Number")}
                </h2>

                <table className="w-full text-sm border border-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        {translate("Subject")}
                      </th>
                      {ExamType != 3 && (<th className="text-left px-4 py-2 font-medium text-gray-600">
                        {translate("Meyari")}
                      </th>)}

                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        {translate("Pass Number")}
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">
                        {translate("Optional")}
                      </th>
                      <th className="px-4 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectFields.map((field, index) => (
                      <tr key={field.id} className="border-t border-gray-100">
                        <td className="px-4 py-2 align-top">
                          <DefaultSelect
                            options={filteredSubjects ?? []}
                            valueField="SubjectID"
                            nameField="SubjectName"
                            registerKey={`subjectPassNumbers.${index}.SubjectID`}
                            require="This is required!"
                          />
                        </td>

                        {ExamType != 3 && (<td className="px-4 py-2 align-top">
                          <DefaultSelect
                            options={[
                              { id: 1, name: translate("Gor mayeri") },
                              { id: 2, name: translate("Mayeri") },
                              { id: 3, name: translate("Most Mayeri") },
                            ]}
                            valueField="id"
                            nameField="name"
                            registerKey={`subjectPassNumbers.${index}.mayeri`}
                            require="This is required!"

                          />
                        </td>)

                        }



                        <td className="px-4 py-2 align-top">
                          <DefaultInput
                            registerKey={`subjectPassNumbers.${index}.PassNumber`}
                            require="This is required!"
                          />
                        </td>

                        <td className="px-4 py-2 align-top">
                          <CheckboxOption
                            label={translate("Kerat Condition")}
                            registerKey={`subjectPassNumbers.${index}.optional`}
                          />
                        </td>

                        <td className="px-4 py-2 align-top text-right">
                          {subjectFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSubject(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div>
                    <Button
                      type="button"
                      onClick={handleSaveAndPrevious}
                    >
                      {translate("Previous")}
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        appendSubject({
                          SubjectID: "",
                          mayeri: "",
                          optional: false,
                          PassNumber: "",
                        })
                      }
                      className="px-5 py-2 rounded-md shadow-lg text-black bg-gray-200 flex items-center gap-1"
                    >
                      <SvgIcon name={"TbPlus"} /> {translate("Add Subject")}
                    </button>
                  </div>

                  <div className="text-end">
                    <Button
                      type="submit"
                    // onClick={handleSaveAndContinue}
                    >
                      {translate("Save & Continue")}
                    </Button>
                  </div>
                </div>
              </section>
            </form>
          </FormProvider>
        ) : (
          <FormProvider {...methods}>
            <form
              className="w-full space-y-10 bg-white p-6 rounded-xl shadow-md"
              onSubmit={handleSubmit(onSubmit)}
            >

              {
                showDivisionManager ? (
                  <div className="w-full space-y-6 bg-white">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-gray-800 pl-1">
                        নতুন বিভাগ যোগ করুন
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <DefaultInput type='text' registerKey={"DivisionName"} placeholder={"বিভাগ (বাংলা)"} required />
                      </div>
                      <div>
                        <DefaultInput registerKey={"DivisionArabic"} placeholder={"বিভাগ (আরবি)"} />
                      </div>
                      <div>
                        <DefaultInput registerKey={"DivisionEnglish"} placeholder={"বিভাগ (ইংরেজি)"} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        onClick={handleCreateDivision}
                      >
                        সাবমিট ও নতুন যোগ করুন
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDivisionManager(false)}
                      >
                        এক্সাম কন্ডিশনে ফিরে যান
                      </button>
                    </div>


                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <SortableTable columns={[
                        { title: "SL.", render: (row, rowIndex) => <>{rowIndex + 1}</> },
                        { title: "বিভাগ (বাংলা).", field: "DivisionName" },
                        { title: "বিভাগ ( ইংরেজি ).", field: "DivisionEnglish" },
                        { title: "বিভাগ ( আরবি ).", field: "DivisionArabic" }
                      ]} data={examDivitions} isFilterColumn={false} />
                    </div>
                  </div>
                ) : (
                  <section>
                    <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-2">
                      {translate("Grade based on marks")}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 my-5">
                      <DefaultSelect
                        label={translate('Subject')}
                        options={filteredSubjects ?? []}
                        valueField="SubjectID"
                        nameField="SubjectName"
                        registerKey="SubjectID"
                      />{' '}
                      <DefaultInput
                        registerKey={"PassNumber"}
                        label={'Pass Number'}
                        type="number"
                        required
                      />
                      <DefaultInput
                        registerKey={"MaxNumber"}
                        label={'Highest score'}
                        type="number"
                        required
                      />

                      <DefaultSelect
                        options={[
                          // { id: 1, name: "Gor mayeri" },
                          // { id: 2, name: "Mayeri" },
                          // { id: 3, name: "Most Mayeri" },
                          { id: 4, name: "Optional" },
                        ]}
                        valueField="id"
                        nameField="name"
                        registerKey={`mayeri`}
                        label={"Meyari"}
                      />
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-4 py-2 font-medium text-gray-600">
                              {translate("Minimum Number")} (&ge;)
                            </th>
                            <th className="text-left px-4 py-2 font-medium text-gray-600 flex items-center justify-between">
                              {translate("Grade (Bengali)")}
                              <button
                                type='button'
                                className='text-blue-600 flex items-center gap-1'
                                onClick={() => setShowDivisionManager(true)}
                              >
                                <SvgIcon name={"TbPlus"} />
                                {translate("Add Division")}
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradeFields.map((field, index) => {
                            const selectedDivisionValue = watch(`gradeBands.${index}.DivisionID`);
                            const savedRowsWithoutCurrent = (watch("subjectGradeList") || []).filter(
                              (_, rowIndex) => rowIndex !== editingSubjectGradeIndex
                            );
                            const allUsedDivisionIds = getUniqueDivisionIds(
                              savedRowsWithoutCurrent.flatMap((subject) => subject?.gradeBands || [])
                            );
                            const currentRowDivisionIds = getUniqueDivisionIds(watch("gradeBands") || []);
                            // const isLocked =
                            //   !selectedDivisionValue &&
                            //   allUsedDivisionIds.size + currentRowDivisionIds.size >= MAX_GRADE_BANDS;
                            const isLocked = !selectedDivisionValue && allUsedDivisionIds.size >= MAX_GRADE_BANDS;

                            return (
                              <tr key={field.id} className="border-t border-gray-100">
                                <td className="px-4 py-2">
                                  <DefaultInput
                                    registerKey={`gradeBands.${index}.DivisionNumber`}
                                    placeholder="যেমন: ৮০"
                                    required
                                    defaultValue={getValues(`gradeBands.${index}.DivisionNumber`)}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <DefaultSelect
                                    label=""
                                    options={examDivitions}
                                    registerKey={`gradeBands.${index}.DivisionID`}
                                    nameField="DivisionName"
                                    valueField="ID"
                                    defaultValue={translate("Select Divition")}
                                    disabled={isLocked}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <HighlightToggle
                                    register={register}
                                    control={control}
                                    arrayName={`gradeBands.${index}`}
                                    index={"color"}
                                  />
                                </td>

                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2">
                      <Button type="button" onClick={handleAddAnotherSubject} className="flex gap-1"> <SvgIcon name={"TbPlus"} /> {translate("Add Now")}</Button>
                    </div>

                  </section>
                )
              }

              {subjectGradeFields.length > 0 && (
                <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">SL.</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">{translate("Subject")}</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">{translate("Pass Number")}</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">সর্বোচ্চ নম্বর</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">গ্রেড সংখ্যা</th>
                        <th className="text-left px-4 py-2 font-medium text-gray-600">মিয়ারি</th>
                        <th className="px-4 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectGradeFields.map((field, index) => {
                        const rowData = watch(`subjectGradeList.${index}`);
                        const subjectName =
                          filteredSubjects.find(
                            (s) => Number(s.SubjectID) === Number(rowData?.SubjectID)
                          )?.SubjectName || rowData?.SubjectID;
                        const filledGradeCount = (rowData?.gradeBands || []).filter(
                          (g) => g.DivisionNumber && g.DivisionID
                        ).length;

                        return (
                          <tr key={field.id} className="border-t border-gray-100">
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{subjectName}</td>
                            <td className="px-4 py-2">{rowData?.PassNumber}</td>
                            <td className="px-4 py-2">{rowData?.MaxNumber}</td>
                            <td className="px-4 py-2">{filledGradeCount}</td>
                            <td className="px-4 py-2">{rowData?.mayeri == 1 ? "গড় মিয়ারি" : rowData?.mayeri == 2 ? "মিয়ারি" : rowData?.mayeri == 3 ? " অধিকতর মিয়ারি" : rowData?.mayeri == 4 ? "অপশনাল" : ""}</td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <EditButton
                                  onClick={() => handleEditSubjectGrade(index)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSubjectGrade(index)}
                                  className="bg-red-600 hover:bg-red-800 flex justify-center items-center text-white rounded-md py-2 px-3"
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <Button type="submit" className="mt-6">{translate("Save & Continue")}</Button>
            </form>
          </FormProvider>
        )
      }
    </div>
  );
};
export default ExamSubjectPassNumber;
