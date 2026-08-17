import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import CopyButton from '../../../components/Button/CopyButton';
import DeleteButton from '../../../components/Button/DeleteButton';
import EditButton from '../../../components/Button/EditButton';
import SingleCheckbox from '../../../components/Checkboxes/SingleCheckbox';
// import DefaultInput from '../../../components/Forms/DefaultInput';
import Loading from '../../../components/Loading/Loading';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import SortableTable from '../../../components/Tables/SortableTable';
import { setPageName } from '../../../features/auth/authSlice';
import {
  useDeleteAverageExamConditionSettingMutation,
  useGetAverageExamConditionAllQuery,
  useGetExamDivitionByTypeQuery,
  useGetExamNamesQuery,
  usePostAverageExamConditionSettingMutation,
  usePostExamDivitionMutation,
  useUpdateAverageExamConditionSettingMutation,
} from '../../../features/exam/examQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import useTranslate from '../../../utils/Translate';
import PointConditionFilteringForm from '../point-condition/PointConditionFilteringForm';
import FormColumn from './FormColumn';
import SwitcherOne from '../../../components/Switchers/SwitcherOne';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import { useMultiStepForm } from '../../../hooks/useMultiStepForm';
import SvgIcon from '../../../components/icons/SvgIcon';
import DefaultInput from '../../../components/Forms/DefaultInput';

const PAGE_SIZE = 10;
const MIN_GRADE_BANDS = 6;
const MAX_GRADE_BANDS = 7;

const createDefaultGradeBands = (count = MIN_GRADE_BANDS) =>
  Array.from({ length: count }, (_, index) => ({
    DivisionNumber: "",
    DivisionID: "",
    TopNum: "",
    serial: index + 1,
  }));


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


export default function ExamAverageDeterminationEdit({ sharedStepData, setSharedStepData }) {
  const { next } = useMultiStepForm('examConditionEdit');

  const methods = useForm({
    defaultValues: {
      isEditMode: true,
      SessionID: null,
      ExamID: null,
      maxAverageScore: "",
      ExamType: sharedStepData?.ExamType,
      gradeBands: createDefaultGradeBands().map(band => ({
        ...band,
        color: {
          isHighlighted: false,
          highlightColor: '#ffeb3b'
        }
      })),
    }
  });


  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = methods

  const [showDivisionManager, setShowDivisionManager] = useState(false);
  const [divisionOptions, setDivisionOptions] = useState([]);
  const [divisionForm, setDivisionForm] = useState({
    divisionNameBn: "",
    divisionNameAr: "",
  });
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const translate = useTranslate()
  const ExamType = watch("ExamType")

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: examDivitions } = useGetExamDivitionByTypeQuery(ExamType, {
    skip: !ExamType,
  });

  useEffect(() => {
    if (sharedStepData?.SessionID && sessionData?.length) {
      setValue("SessionID", sharedStepData.SessionID);
    }
  }, [sharedStepData?.SessionID, sessionData, setValue]);


  useEffect(() => {
    if (sharedStepData?.ExamID && examNameData?.length) {
      setValue("ExamID", sharedStepData.ExamID);
    }
  }, [sharedStepData?.ExamID, examNameData, setValue]);

  useEffect(() => {
    if (sharedStepData?.SubClassID && subClassListData?.length) {
      setValue("SubClassID", sharedStepData.SubClassID);
    }
  }, [sharedStepData?.SubClassID, subClassListData, setValue]);

  // useEffect(() => {
  //   setValue("maxAverageScore", sharedStepData?.maxAverageScore)
  //   if (sharedStepData?.gradeBands?.length && examDivitions?.length) {
  //     sharedStepData.gradeBands.forEach((band, idx) => {
  //       setValue(`gradeBands.${idx}.DivisionID`, band.DivisionID);
  //       setValue(`gradeBands.${idx}.DivisionNumber`, band.DivisionNumber);
  //       setValue(`gradeBands.${idx}.TopNum`, band.TopNum);
  //       setValue(`gradeBands.${idx}.color.isHighlighted.`, band.color.isHighlighted);
  //       setValue(`gradeBands.${idx}.color.highlightColor.`, band.color.highlightColor);
  //     });
  //   }

  // }, [examDivitions, sharedStepData?.gradeBands, setValue]);

  const [addDivition] = usePostExamDivitionMutation();
  const {
    fields: gradeFields,
    append: appendGrade,
    remove: removeGrade,
    replace: replaceGrade,
  } = useFieldArray({ control, name: "gradeBands", keyName: "id" });





  // Initialize data when component loads
  // useEffect(() => {
  //   if (sharedStepData?.gradeBands?.length && examDivitions?.length && !isDataInitialized) {
  //     const gradeBandsData = sharedStepData.gradeBands;

  //     // Create new array with all fields properly structured
  //     const newGradeBands = gradeBandsData.map((band, idx) => ({
  //       DivisionNumber: band.DivisionNumber || "",
  //       DivisionID: band.DivisionID || "",
  //       TopNum: band.TopNum || "",
  //       serial: band.serial || idx + 1,
  //       color: {
  //         isHighlighted: band.color?.isHighlighted || false,
  //         highlightColor: band.color?.highlightColor || '#ffeb3b'
  //       }
  //     }));

  //     // Replace all fields with the new data
  //     replaceGrade(newGradeBands);
  //     setIsDataInitialized(true);
  //   }
  // }, [examDivitions, sharedStepData?.gradeBands, replaceGrade, isDataInitialized]);

  // Initialize data when component loads
  useEffect(() => {
    if (sharedStepData?.gradeBands?.length && examDivitions?.length && !isDataInitialized) {
      const gradeBandsData = sharedStepData.gradeBands;

      // Create new array with all fields properly structured
      const newGradeBands = gradeBandsData.map((band, idx) => ({
        // Fix: Check for undefined/null instead of using || which treats 0 as falsy
        DivisionNumber: band.DivisionNumber !== undefined && band.DivisionNumber !== null
          ? band.DivisionNumber
          : "",
        DivisionID: band.DivisionID !== undefined && band.DivisionID !== null
          ? band.DivisionID
          : "",
        TopNum: band.TopNum !== undefined && band.TopNum !== null
          ? band.TopNum
          : "",
        serial: band.serial || idx + 1,
        color: {
          isHighlighted: band.color?.isHighlighted || false,
          highlightColor: band.color?.highlightColor || '#ffeb3b'
        }
      }));

      console.log("New Grade Bands:", newGradeBands);

      // Replace all fields with the new data
      replaceGrade(newGradeBands);
      setIsDataInitialized(true);
    }
  }, [examDivitions, sharedStepData?.gradeBands, replaceGrade, isDataInitialized]);


  useEffect(() => {
    if (sharedStepData?.maxAverageScore) {
      setValue("maxAverageScore", sharedStepData.maxAverageScore);
    }
  }, [sharedStepData?.maxAverageScore, setValue]);

  const handleAddGradeBand = () => {
    // Get current fields count
    const currentLength = gradeFields.length;

    if (currentLength >= MAX_GRADE_BANDS) {
      Swal.fire({
        icon: "warning",
        title: translate("Maximum grade bands reached"),
        text: translate(`You can add up to ${MAX_GRADE_BANDS} grade bands only.`),
      });
      return;
    }

    appendGrade({
      DivisionNumber: "",
      DivisionID: "",
      TopNum: "",
      serial: currentLength + 1,
      color: {
        isHighlighted: false,
        highlightColor: '#ffeb3b'
      }
    });
  };
  // const handleAddGradeBand = () => {
  //   if (gradeFields.length >= MAX_GRADE_BANDS) return;

  //   appendGrade({
  //     DivisionNumber: "",
  //     DivisionID: "",
  //     TopNum: "",
  //     serial: gradeFields.length + 1,
  //   });
  // };

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

      setDivisionOptions((prev) => [
        ...prev,
        {
          id: response?.ID || `${Date.now()}`,
          divisionNameBn: divisionName,
          divisionNameAr: divisionArabic,
          divisionNameEn: divisionEnglish,
        },
      ]);

      Swal.fire({
        title: translate("Division added successfully"),
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
  const onSubmit = (data) => {
    const payload = {
      ...sharedStepData,
      ...data,
    };

    console.log("Old:", sharedStepData);
    console.log("New:", data);
    console.log("Payload:", payload);
    console.log(payload);

    setSharedStepData(payload);
    next();
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
              unicode={true}
              label={translate("Session")}
              require={"Session is Required"}
              disabled={true}
            />
          </div>
          <div>
            <DefaultSelect
              options={examNameData ?? []}
              registerKey="ExamID"
              placeholder="পরীক্ষা নির্বাচন করুন"
              nameField="ExamName"
              valueField={"ExamID"}
              label={translate("Exam")}
              unicode={true}
              require={"Exam is Required"}
              disabled={true}


            />
          </div>
          <div>
            <DefaultSelect
              options={subClassListData ?? []}
              registerKey="SubClassID"
              placeholder="শ্রেণি নির্বাচন করুন"
              nameField="SubClass"
              valueField={"SubClassID"}
              label={translate("SubClass")}
              require={"SubClass is Required"}
              unicode={true}
              disabled={true}

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
              label={translate("Exam Type")}
              require={"SubClass is Required"}
              unicode={true}
              disabled={true}

            />
          </div>
        </div>


        {
          ExamType != 4 ? (
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
              <div className="w-full space-y-10 bg-white rounded-xl shadow-md">
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
                      placeholder="যেমন: ১০০"
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
                              className='text-blue-600 flex items-center gap-1'
                              onClick={() => setShowDivisionManager(true)}
                            >
                              <SvgIcon name={"TbPlus"} />
                              {translate("Add Division")}
                            </button>
                          </th>

                          <th className="text-left px-4 py-2 font-medium text-gray-600">
                            {translate("Color")}

                          </th>
                          {
                            ExamType == 2 ? <th className="text-left px-4 py-2 font-medium text-gray-600">{translate("Highest mark in recitation")} </th> : null
                          }

                        </tr>
                      </thead>
                      <tbody>
                        {gradeFields.map((field, index) => {
                          const selectedDivisionValue = watch(`gradeBands.${index}.gradeBn`);

                          return (
                            <tr key={field.id} className="border-t border-gray-100">
                              <td className="px-4 py-2">
                                {/* <DefaultInput
                                  registerKey={`gradeBands.${index}.DivisionNumber`}
                                  placeholder="যেমন: ৮০"
                                  required
                                /> */}

                                <input
                                  {...register(`gradeBands.${index}.DivisionNumber`)}
                                  type="text"
                                  placeholder="যেমন: ৮০"
                                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                  defaultValue={field.DivisionNumber}
                                />
                              </td>

                              <td className="px-4 py-2">
                                <DefaultSelect
                                  label=""
                                  options={examDivitions}
                                  registerKey={`gradeBands.${index}.DivisionID`}
                                  nameField="DivisionName"
                                  valueField="ID"
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
        <div className="text-end">
          {/* <Button type='button' className='bg-yellow-300 hover:bg-yellow-300 text-[#000]'>Save As Draft</Button> */}
          {
            !showDivisionManager ? <Button type='submit'>{translate("Save & Continue")}</Button> : null
          }

        </div>
      </form>
    </FormProvider>
  );
}