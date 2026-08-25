import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import Button from "../../../components/Button/Button";
import DefaultInput from "../../../components/Forms/DefaultInput";
import {
  useGetExamNamesQuery,
  useGetExamTalentConditionQuery,
  usePostExamSettingsMutation,
  usePostExamTalentConditionMutation,
  useUpdateExamSettingsMutation,
} from "../../../features/exam/examQuerySlice";
import { ViewPermission } from "../../../Routes/ViewPermission";
import useTranslate from "../../../utils/Translate";
import PointConditionFilteringForm from "../point-condition/PointConditionFilteringForm";
import { permissionsDataList } from "../../../Data/permissions";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import DefaultSelect from "../../../components/Forms/DefaultSelect";

// ✅ Input with Label + Checkbox
const InputWithCheckbox = ({ registerKey, checked, onCheckChange, filteredExamDivitions }) => (
  <div className="flex flex-row items-center justify-center gap-3">
    <DefaultSelect nameField={"DivisionNames"} valueField={"ID"} registerKey={registerKey} options={filteredExamDivitions} disabled={true} />

    <label className="flex items-center justify-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onCheckChange}
        className="cursor-pointer w-5 h-5"
      />
    </label>
  </div>
);

const TalentCondition = ({ sharedStepData, setSharedStepData }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, setValue } = methods;
  const [filter, setFilter] = useState(null);
  const inputs = [
    { registerKey: "TDivision1" },
    { registerKey: "TDivision2" },
    { registerKey: "TDivision3" },
    { registerKey: "TDivision4" },
    { registerKey: "TDivision5" },
    { registerKey: "TDivision6" },
    { registerKey: "TDivision7" },
  ];

  useEffect(() => {
    if (sharedStepData?.examDivitions && sharedStepData?.examDivitions.length > 0) {
      const conditionById = new Map(
        (sharedStepData.telenetCondition || []).map(({ DivisionID, checked }) => [DivisionID, checked])
      );

      const updatedChecked = sharedStepData.examDivitions.map((division) =>
        Boolean(conditionById.get(division.ID))
      );

      sharedStepData.examDivitions.forEach((division, index) => {
        setValue(`TDivision${index + 1}`, division.ID);
      });

      setCheckedInputs(updatedChecked);
    }
  }, [sharedStepData, setValue]);

  const [checkedInputs, setCheckedInputs] = useState(
    Array(inputs.length).fill(false)
  );
  const { data: sessionData } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const {
    data: examTalentConditionData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useGetExamTalentConditionQuery(
    filter?.SessionID && filter?.ExamID && filter?.SubClassID
      ? {
        SessionID: filter?.SessionID,
        ExamID: filter?.ExamID,
        SubClassID: filter?.SubClassID,
      }
      : skipToken
  );
  useEffect(() => {
    if (examTalentConditionData && examTalentConditionData?.length > 0) {
      const updatedChecked = [...checkedInputs];
      const inputsMap = examTalentConditionData.map((divisionLabel, i) => {
        methods.setValue(`Division${i + 1}`, divisionLabel.Division);
        updatedChecked[i] = divisionLabel.TalentAcotin === 1;
        return divisionLabel?.TalentAcotin === 1;
      });
      setCheckedInputs(inputsMap);
    }
  }, [examTalentConditionData])

    const [addExamSettings] = usePostExamSettingsMutation();
    const [updateExamSettings] = useUpdateExamSettingsMutation();

  const handleCheckChange = (index) => {
    const updated = [...checkedInputs];
    updated[index] = !updated[index];
    setCheckedInputs(updated);
  };

  const handleSelectAll = (e) => {
    setCheckedInputs(Array(inputs.length).fill(e.target.checked));
  };

const onSubmit = async (data) => {
  const divisionConditions = sharedStepData.examDivitions.map(
    (division, index) => ({
      DivisionID: division.ID,
      checked: checkedInputs[index] || false,
    })
  );

  const updatedData = {
    ...sharedStepData,
    telenetCondition: divisionConditions,
  };

  setSharedStepData(updatedData)

    try {
      console.log(updatedData);
      const response = sharedStepData?.isEditMode ? await updateExamSettings(updatedData).unwrap() : await addExamSettings(updatedData).unwrap();
      // next();
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting data:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "There was an error submitting the data. Please try again.",
      });
    }
};

  if (error) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.data?.message || "Something went wrong. Please try again.",
    });
  }

  return (
    <div className="font-SolaimanLipi bg-white p-5">
      <FormProvider {...methods}>
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>


          <div
            className="flex flex-col
           justify-center items-center gap-5"
          >
            <div className="w-full">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={checkedInputs.every(Boolean)}
                  onChange={handleSelectAll}
                  className="mr-2 cursor-pointer"
                />
                <label className="font-semibold">
                  {translate('Select all inputs')}
                </label>
              </div>

              {/* ✅ Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 mb-6 w-full">
                {inputs.map((input, index) => (
                  <InputWithCheckbox
                    registerKey={input.registerKey}
                    checked={checkedInputs[index]}
                    onCheckChange={() => handleCheckChange(index)}
                    filteredExamDivitions={sharedStepData?.examDivitions || []}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <ViewPermission
              permissionId={permissionsDataList.merit_condition}
              permissionType="insert|edit"
            >
              <Button type="submit">{translate('Save')}</Button>
            </ViewPermission>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default TalentCondition;
