import { skipToken } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import {
  useGetExamTalentConditionQuery,
  usePostExamTalentConditionMutation,
} from "../features/exam/examQuerySlice";
import { ViewPermission } from "../Routes/ViewPermission";
import useTranslate from "../utils/Translate";
import PointConditionFilteringForm from "../view/exam/point-condition/PointConditionFilteringForm";
import { permissionsDataList } from "../Data/permissions";

// ✅ Input with Label + Checkbox
const InputWithCheckbox = ({ registerKey, checked, onCheckChange }) => (
  <div className="flex flex-row items-center justify-center gap-3">
    <DefaultInput registerKey={registerKey} />

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

const TalentCondition = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit } = methods;
  const [filter, setFilter] = useState(null);
  const inputs = [
    { registerKey: "Division1" },
    { registerKey: "Division2" },
    { registerKey: "Division3" },
    { registerKey: "Division4" },
    { registerKey: "Division5" },
    { registerKey: "Division6" },
  ];

  const [checkedInputs, setCheckedInputs] = useState(
    Array(inputs.length).fill(false)
  );
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
        // console.log("Found");

        // const found = examTalentConditionData.find(
        //   (item) => item.Division === divisionLabel
        // );
        // console.log(found);

        // console.log("==========Found======");


        // if (found) {
        methods.setValue(`Division${i + 1}`, divisionLabel.Division);
        // }
        updatedChecked[i] = divisionLabel.TalentAcotin === 1;
        return divisionLabel?.TalentAcotin === 1;
      });
      console.log(updatedChecked);
      setCheckedInputs(inputsMap);
      // inputs.map((input, index)=>{
      //   methods.setValue(`Division${index + 1}`, examTalentConditionData[input.registerKey]);
      // });
    }
    // console.log(examTalentConditionData);
  }, [examTalentConditionData])
  // useEffect(() => {
  //   if (isLoading || error) {
  //     methods.reset({
  //       SessionID: filter.SessionID || "",
  //       ExamID: filter.ExamID || "",
  //       SubClassID: filter.SubClassID || "",
  //     });
  //     setCheckedInputs(Array(inputs.length).fill(false));
  //     return;
  //   }

  //   if (
  //     !Array.isArray(examTalentConditionData) ||
  //     examTalentConditionData.length === 0
  //   )
  //     return;

  //   const allowedDivisions = ["A+", "A", "A-", "B", "C", "D", "F"];

  //   const inputsMap = allowedDivisions.map((divisionLabel, i) => {
  //     const found = examTalentConditionData.find(
  //       (item) => item.Division === divisionLabel
  //     );

  //     if (found) {
  //       methods.setValue(`division${i + 1}`, found.Division);
  //     }

  //     return found?.TalentAcotin === 1;
  //   });

  //   setCheckedInputs(inputsMap);
  // }, [examTalentConditionData, isLoading, error, methods]);

  const [postExamTalentCondition] = usePostExamTalentConditionMutation();

  const handleCheckChange = (index) => {
    const updated = [...checkedInputs];
    updated[index] = !updated[index];
    setCheckedInputs(updated);
  };

  const handleSelectAll = (e) => {
    setCheckedInputs(Array(inputs.length).fill(e.target.checked));
  };

  const onSubmit = async (data) => {
    // Create conditions array based on inputs
    const conditions = inputs.map((input, index) => ({
      Division: data[input.registerKey] || "",
      TalentAcotin: checkedInputs[index] ? 1 : 0,
      SerialNo: index + 1,
    }));

    const payload = {
      SessionID: filter.SessionID,
      ExamID: filter.ExamID,
      SubClassID: filter.SubClassID,
      conditions: conditions,
    };

    console.log("Final Conditions:", payload);

    try {
      await postExamTalentCondition(payload).unwrap();

      // সফল সাবমিশনের পর Swal success দেখাও
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Exam talent conditions saved successfully!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      // এরর হলে Swal error দেখাও
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Something went wrong. Please try again.",
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
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          <span className="text-blue-600">•</span>{' '}
          {translate('All the divisions whose merit will be mentioned')}
          <span className="text-blue-600"> •</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          {translate('Select it with a check mark.')}
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
        </div>
      </div>

      <FormProvider {...methods}>
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div
            className="flex flex-col
           justify-center items-center gap-5"
          >
            <div className="w-full">
              <PointConditionFilteringForm onFilter={setFilter} />
            </div>
            <div className="w-full">
              {/* ✅ Select All */}
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
                    key={index}
                    {...input}
                    checked={checkedInputs[index]}
                    onCheckChange={() => handleCheckChange(index)}
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
