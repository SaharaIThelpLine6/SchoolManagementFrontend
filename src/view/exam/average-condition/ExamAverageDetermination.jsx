import { useEffect, useState } from 'react';
import { FormProvider, useForm, useFieldArray, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import SortableTable from '../../../components/Tables/SortableTable';
import {
  useGetExamConditionQuery,
  useGetExamConditionsQuery,
  useGetExamDivitionByTypeQuery,
  useGetExamNamesQuery,
  useLazyGetExamConditonEntryQuery,
  usePostExamDivitionMutation,
  useUpdateExamDivitionMutation,
} from '../../../features/exam/examQuerySlice';
import useTranslate from '../../../utils/Translate';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import { useMultiStepForm } from '../../../hooks/useMultiStepForm';
import SvgIcon from '../../../components/icons/SvgIcon';
import DefaultInput from '../../../components/Forms/DefaultInput';

const PAGE_SIZE = 10;
const MIN_GRADE_BANDS = 6;
const MAX_GRADE_BANDS = 7;

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

const createDefaultGradeBands = (count = MIN_GRADE_BANDS) =>
  Array.from({ length: count }, (_, index) => ({
    DivisionNumber: "",
    DivisionID: "",
    TopNum: "",
    serial: index + 1,
  }));

export default function ExamAverageDetermination({ sharedStepData, setSharedStepData, isDuplicate = false }) {
  const { next } = useMultiStepForm('examCondition');


  const methods = useForm({
    defaultValues: {
      maxAverageScore: "",
      gradeBands: createDefaultGradeBands(),
      tilawatCriteria: [{ criteriaName: "", maxScore: "" }],
    }
  });


  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = methods

  const sessionID = watch("SessionID");
  const examID = watch("ExamID");
  const subClassID = watch("SubClassID");
  const ExamType = watch("ExamType");
  const hasCompleteSelection = Boolean(sessionID && examID && subClassID);

  const [showDivisionManager, setShowDivisionManager] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [editingDivision, setEditingDivision] = useState(null);

  const {
    currentData: examConditionData,
    isLoading: isExamConditionLoading,
    isFetching: isExamConditionFetching,
  } = useGetExamConditionQuery(
    {
      SessionID: sessionID,
      ExamID: examID,
      SubClassID: subClassID,
    },
    {
      skip: !hasCompleteSelection,
    }
  );

  const existingCondition = examConditionData?.data ?? examConditionData;
  const hasExistingExamCondition = Array.isArray(existingCondition)
    ? existingCondition.length > 0
    : Boolean(
      existingCondition &&
      typeof existingCondition === "object" &&
      Object.keys(existingCondition).length > 0
    );

  const {
    currentData: classConditions,
    isFetching: isClassConditionsFetching,
  } = useGetExamConditionsQuery(
    { SessionID: sessionID, SubClassID: subClassID },
    { skip: !sessionID || !subClassID }
  );
  const [getExamConditionEntry, { isFetching: isCopyingCondition }] =
    useLazyGetExamConditonEntryQuery();

  const hasConditionInClass = Array.isArray(classConditions) && classConditions.some(
    (condition) => String(condition.ExamID) === String(examID)
  );
  const showExistingConditionMessage = hasCompleteSelection &&
    !isExamConditionLoading && !isExamConditionFetching && !isClassConditionsFetching &&
    (hasExistingExamCondition || hasConditionInClass);

  const previousCondition = Array.isArray(classConditions) && examID && ExamType
    ? classConditions
      .filter((condition) =>
        String(condition.ExamID) !== String(examID) &&
        Number(condition.ExamType) === Number(ExamType)
      )
      .reduce((latest, condition) =>
        !latest || Number(condition.ID) > Number(latest.ID)
          ? condition
          : latest,
        null)
    : null;

  useEffect(() => {
    if (sharedStepData) {
      const normalizedGradeBands =
        sharedStepData.gradeBands?.length
          ? [...sharedStepData.gradeBands].slice(0, MAX_GRADE_BANDS)
          : createDefaultGradeBands();

      reset({
        maxAverageScore: sharedStepData.maxAverageScore || "",
        gradeBands:
          normalizedGradeBands.length < MIN_GRADE_BANDS
            ? createDefaultGradeBands()
            : normalizedGradeBands,
        SessionID: sharedStepData.SessionID || "",
        ExamID: sharedStepData.ExamID || "",
        SubClassID: sharedStepData.SubClassID || "",
        ExamType: sharedStepData.ExamType || "",
      });
      setDivisionOptions(sharedStepData.divisionOptions || []);
    }
  }, [sharedStepData, reset]);

  const translate = useTranslate()

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const suggestedExamName = previousCondition?.Exam?.ExamName ||
    examNameData?.find((exam) => String(exam.ExamID) === String(previousCondition?.ExamID))?.ExamName ||
    `Exam ${previousCondition?.ExamID}`;
  const { data: examDivitions } = useGetExamDivitionByTypeQuery(ExamType, {
    skip: !ExamType,
  });

  const [addDivition] = usePostExamDivitionMutation();
  const [updateDivition] = useUpdateExamDivitionMutation();
  const {
    fields: gradeFields,
    append: appendGrade,
    remove: removeGrade,
  } = useFieldArray({ control, name: "gradeBands" });

  const handleAddGradeBand = () => {
    if (gradeFields.length >= MAX_GRADE_BANDS) return;

    appendGrade({
      DivisionNumber: "",
      DivisionID: "",
      TopNum: "",
      serial: gradeFields.length + 1,
    });
  };

  const handleGradeDivisionChange = (index, division) => {
    if (division?.ID == null || division.ID === '') return;
    const alreadySelected = (getValues('gradeBands') ?? []).some((band, rowIndex) =>
      rowIndex !== index && String(band.DivisionID) === String(division.ID)
    );
    if (!alreadySelected) return;

    setValue(`gradeBands.${index}.DivisionID`, '', { shouldDirty: true, shouldValidate: true });
    Swal.fire({
      icon: 'error',
      title: translate('This division has already been selected'),
    });
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
      const isEditingDivision = Boolean(editingDivision);
      const payload = {
        DivisionName: divisionName,
        DivisionArabic: divisionArabic,
        DivisionEnglish: divisionEnglish,
        ExamType: ExamType,
      };

      const response = editingDivision
        ? await updateDivition({
          id: editingDivision.ID || editingDivision.id,
          body: payload,
        }).unwrap()
        : await addDivition(payload).unwrap();

      setValue("DivisionName", "");
      setValue("DivisionArabic", "");
      setValue("DivisionEnglish", "");
      setEditingDivision(null);

      if (!isEditingDivision) {
        setDivisionOptions((prev) => [
          ...prev,
          {
            id: response?.ID || `${Date.now()}`,
            divisionNameBn: divisionName,
            divisionNameAr: divisionArabic,
            divisionNameEn: divisionEnglish,
          },
        ]);
      }

      Swal.fire({
        title: translate(
          isEditingDivision
            ? "Division updated successfully"
            : "Division added successfully"
        ),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Failed to save division"),
        text: error?.data?.message || error?.data?.error || translate("Please try again."),
      });
    }
  };

  const handleEditDivision = (division) => {
    setEditingDivision(division);
    setValue("DivisionName", division?.DivisionNames || "");
    setValue("DivisionArabic", division?.DivisionArabics || "");
    setValue("DivisionEnglish", division?.DivisionEnglishs || "");
    setShowDivisionManager(true);
  };

  const handleCloseDivisionManager = () => {
    setEditingDivision(null);
    setValue("DivisionName", "");
    setValue("DivisionArabic", "");
    setValue("DivisionEnglish", "");
    setShowDivisionManager(false);
  };

  const onSubmit = (data) => {
    if (isExamConditionLoading || isExamConditionFetching || isClassConditionsFetching) {
      Swal.fire({
        icon: "info",
        title: translate("Checking exam condition..."),
      });
      return;
    }

    if (hasExistingExamCondition || hasConditionInClass) {
      Swal.fire({
        icon: "error",
        title: translate("Exam condition already exist."),
      });
      return;
    }

    const sameDraft = sharedStepData &&
      ["SessionID", "SubClassID", "ExamType"].every(
        (key) => String(sharedStepData[key]) === String(data[key])
      ) &&
      (!sharedStepData.ExamID || String(sharedStepData.ExamID) === String(data.ExamID));
    const payload = {
      ...(sameDraft ? sharedStepData : {}),
      ...data,
      divisionOptions,
    };

    console.log(payload);

    setSharedStepData(payload);
    next();
  };

  const handleCopyPreviousCondition = async () => {
    if (!previousCondition || hasExistingExamCondition || hasConditionInClass) return;

    const target = {
      SessionID: sessionID,
      ExamID: examID,
      SubClassID: subClassID,
      ExamType,
    };
    const confirmation = await Swal.fire({
      icon: "question",
      title: translate("Copy previous exam condition?"),
      text: `${suggestedExamName}. ${translate("This replaces the current draft. You can review and change every step before saving.")}`,
      showCancelButton: true,
      confirmButtonText: translate("Copy condition"),
    });
    if (!confirmation.isConfirmed) return;

    try {
      const source = await getExamConditionEntry({
        SessionID: target.SessionID,
        ExamID: previousCondition.ExamID,
        SubClassID: target.SubClassID,
      }).unwrap();
      if (!source || Number(source.ExamType) !== Number(target.ExamType)) {
        throw new Error(translate("The previous condition is unavailable for this exam type."));
      }
      if (["SessionID", "ExamID", "SubClassID", "ExamType"].some(
        (key) => String(getValues(key)) !== String(target[key])
      )) return;

      setSharedStepData({
        ...source,
        ...target,
        isEditMode: false,
        divisionOptions,
      });
      Swal.fire({
        icon: "success",
        title: translate("Condition copied"),
        text: translate("Review each step before saving."),
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Could not copy the previous condition"),
        text: error?.data?.error || error?.data?.message || error.message,
      });
    }
  };


  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        <div className='grid grid-cols-3 lg:grid-cols-4 gap-3 w-full pt-5'>
          <div>
            <DefaultSelect
              options={sessionData ?? []}
              registerKey="SessionID"
              placeholder="বছর নির্বাচন করুন"
              nameField="SessionName"
              valueField={"SessionID"}
              initialValue={sharedStepData?.SessionID}
              readOnly={isDuplicate}
              unicode={true}
              label={translate("Session")}
              require={"Session is Required"}
            />
          </div>
          <div>
            <DefaultSelect
              options={examNameData ?? []}
              registerKey="ExamID"
              placeholder="পরীক্ষা নির্বাচন করুন"
              nameField="ExamName"
              valueField={"ExamID"}
              initialValue={sharedStepData?.ExamID}
              label={translate("Exam")}
              unicode={true}
              require={"Exam is Required"}

            />
          </div>
          <div>
            <DefaultSelect
              options={subClassListData ?? []}
              registerKey="SubClassID"
              placeholder="শ্রেণি নির্বাচন করুন"
              nameField="SubClass"
              valueField={"SubClassID"}
              initialValue={sharedStepData?.SubClassID}
              readOnly={isDuplicate}
              label={translate("SubClass")}
              require={"SubClass is Required"}
              unicode={true}
            />
          </div>
          <div>
            <DefaultSelect
              options={[
                {
                  name: "দরসিয়াত",
                  value: 1,
                },
                {
                  name: "হিফজ কন্ডিশন ভিত্তিক",
                  value: 2,
                },
                {
                  name: "গড়ে যা আসবে তাই",
                  value: 3,
                },
                {
                  name: "পয়েন্ট ভিত্তিক",
                  value: 4,
                },
              ]}
              registerKey="ExamType"
              placeholder=" পরিক্ষার ধরন নির্বাচন "
              nameField="name"
              valueField={"value"}
              initialValue={sharedStepData?.ExamType}
              readOnly={isDuplicate}
              label={translate("Exam Type")}
              require={"SubClass is Required"}
              unicode={true}
            />
          </div>
          {showExistingConditionMessage && (
            <p role="alert" className="text-sm font-medium text-red-600 mt-0 col-span-full">
              {translate("This exam condition has already been created for this session and class.")}
            </p>
          )}
        </div>

        {!isDuplicate && previousCondition && !hasExistingExamCondition && !hasConditionInClass && !isClassConditionsFetching && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div>
              <p className="font-semibold text-blue-900">
                {`এই ক্লাসের ${suggestedExamName} কনডিশন পাওয়া গেছে।`}
              </p>
              <p className="text-sm text-blue-800">
                {translate("Copy its settings, then review each step before saving.")}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleCopyPreviousCondition}
              disabled={isCopyingCondition}
            >
              {isCopyingCondition ? translate("Copying...") : translate("Copy condition")}
            </Button>
          </div>
        )}


        {
          ExamType != 4 ? (
            showDivisionManager ? (
              <div className="w-full space-y-6 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-800 pl-1">
                    {editingDivision ? "বিভাগ সম্পাদনা করুন" : "নতুন বিভাগ যোগ করুন"}
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <DefaultInput type='text' registerKey={"DivisionName"} placeholder={"বিভাগ (বাংলা)"} required />
                  </div>

                  <div>
                    <DefaultInput registerKey={"DivisionEnglish"} placeholder={"বিভাগ (ইংরেজি)"} />
                  </div>

                  <div className='relative'>
                    <DefaultInput registerKey={"DivisionArabic"} placeholder={"বিভাগ (আরবি)"} />
                  </div>
                  <div className='relative'>
                    <DefaultInput registerKey={"Note"} placeholder={"মন্তব্য"} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        aria-label={`মন্তব্য: শিক্ষার্থীর লিখিত কনডিশনটি পেলে এই মন্তব্য আসবে।`}
                        data-tooltip-id="subject-column-tooltip"
                        data-tooltip-content={"মন্তব্য: শিক্ষার্থীর লিখিত কনডিশনটি পেলে এই মন্তব্য আসবে।"}
                        data-tooltip-place="top"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <circle cx="10" cy="6.5" r="1" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    onClick={handleCreateDivision}
                  >
                    {editingDivision ? "আপডেট করুন" : "সাবমিট ও নতুন যোগ করুন"}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 flex gap-1"
                    onClick={handleCloseDivisionManager}
                  >
                    <SvgIcon name="LongArrowLeft" />
                    এক্সাম কন্ডিশনে ফিরে যান
                  </button>
                </div>


                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <SortableTable columns={[
                    { title: "SL.", render: (row, rowIndex) => <>{rowIndex + 1}</> },
                    { title: "বিভাগ (বাংলা).", field: "DivisionNames" },
                    { title: "বিভাগ ( ইংরেজি ).", field: "DivisionEnglishs", render: (row, rowIndex) => <>{row?.DivisionEnglishs ? row?.DivisionEnglishs : '-'}</>, position: "center" },
                    { title: "বিভাগ ( আরবি ).", field: "DivisionArabics", render: (row, rowIndex) => <>{row?.DivisionArabics ? row?.DivisionArabics : '-'}</>, position: "center" },
                    { title: "মন্তব্য", field: "Note", render: (row, rowIndex) => <>{row?.Note ? row?.Note : '-'}</>, position: "center" },
                    {
                      title: "Action",
                      render: (row) => (
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleEditDivision(row)}
                          title="Edit division"
                        >
                          <SvgIcon name="FiEdit" size={16} />
                        </button>
                      ),
                    },
                  ]} data={examDivitions} isFilterColumn={false} />
                </div>
              </div>
            ) : (
              <div className="w-full space-y-10">
                <section>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 pl-2">
                    {translate("Grade based on marks")}
                  </h2>

                  <div className="mb-4 max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate("Max Number")} <span className="text-red-500">*</span>
                    </label>
                    <DefaultInput
                      registerKey="maxAverageScore"
                      type='number'
                      placeholder="যেমন: ১০০"
                      defaultValue={sharedStepData?.maxAverageScore ?? 100}
                      required
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
                              className='bg-blue-100 text-blue-600 flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium hover:bg-blue-100'
                              onClick={() => setShowDivisionManager(true)}
                            >
                              <SvgIcon name={"TbPlus"} />
                              {translate("Add Division")}
                            </button>
                          </th>

                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            কালার
                          </th>
                          {
                            ExamType == 2 ? <th className="text-left px-4 py-2 font-medium text-gray-600">তেলাওয়াতে সর্বোচ্চ নাম্বার </th> : null
                          }

                        </tr>
                      </thead>
                      <tbody>
                        {gradeFields.map((field, index) => {
                          const selectedDivisionValue = watch(`gradeBands.${index}.gradeBn`);
                          return (
                            <tr key={field.id} className="border-t border-gray-100">
                              <td className="px-4 py-2">
                                <DefaultInput
                                  type='number'
                                  registerKey={`gradeBands.${index}.DivisionNumber`}
                                  placeholder="যেমন: ৮০"
                                  required
                                />
                              </td>
                              <td className="px-4 py-2">
                                <DefaultSelect
                                  label=""
                                  options={examDivitions}
                                  registerKey={`gradeBands.${index}.DivisionID`}
                                  nameField="DivisionNames"
                                  valueField="ID"
                                  initialValue={sharedStepData?.gradeBands?.[index]?.DivisionID}
                                  onChange={(division) => handleGradeDivisionChange(index, division)}
                                  require="Division is Required"
                                  defaultValue={translate("Select Divition")}
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
                              {
                                ExamType == 2 ? (
                                  <td className="px-4 py-2">
                                    <DefaultInput
                                      registerKey={`gradeBands.${index}.TopNum`}
                                      placeholder="যেমন: ৮০"
                                    />
                                  </td>
                                ) : null
                              }
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end p-2">
                    <button
                      type="button"
                      onClick={handleAddGradeBand}
                      disabled={gradeFields.length >= MAX_GRADE_BANDS}
                      className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[14px] font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <SvgIcon name={"TbPlus"} />
                      {translate("Add")}
                    </button>
                  </div>
                </section>
              </div>
            )
          ) : null
        }
        <div className="text-end flex items-center justify-end gap-2">
          {/* <Button type='button' className='bg-yellow-300 hover:bg-yellow-300 text-[#000]'>Save As Draft</Button> */}
          {
            !showDivisionManager ? <Button type='submit' className="whitespace-nowrap flex gap-1 ">{translate("Next")} <SvgIcon name={"LongArrowRight"} /> </Button> : null
          }

        </div>
      </form>
    </FormProvider>
  );
}
