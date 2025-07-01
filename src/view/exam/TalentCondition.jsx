import { FormProvider, useForm } from "react-hook-form";
import { useState } from "react";
import Button from "../../components/Button/Button";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import useTranslate from "../../utils/Translate";
import DefaultInput from "../../components/Forms/DefaultInput";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";

const InputWithCheckbox = ({
  label,
  registerKey,
  type,
  checked,
  onCheckChange,
}) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      checked={checked}
      onChange={onCheckChange}
      className=""
    />
    <DefaultInput
      registerKey={registerKey}
      //   label={label}
      type={type}
    />
  </div>
);

const TalentCondition = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit } = methods;
  const { data: sessionData } = useGetSessionsQuery();
  const classListData = null;
  const genderOptions = null;

  const inputs = [
    {
      registerKey: "assignedFee1",
      label: translate("নির্ধারিত ফি") + ":",
      type: "number",
    },
    {
      registerKey: "totalSubjects1",
      label: translate("মোট বিষয়") + ":",
      type: "number",
    },
    {
      registerKey: "assignedFee2",
      label: translate("নির্ধারিত ফি") + ":",
      type: "number",
    },
    {
      registerKey: "totalSubjects2",
      label: translate("মোট বিষয়") + ":",
      type: "number",
    },
    {
      registerKey: "assignedFee3",
      label: translate("নির্ধারিত ফি") + ":",
      type: "number",
    },
    {
      registerKey: "totalSubjects3",
      label: translate("মোট বিষয়") + ":",
      type: "number",
    },
    {
      registerKey: "totalSubjects4",
      label: translate("মোট বিষয়") + ":",
      type: "number",
    },
  ];

  const [checkedInputs, setCheckedInputs] = useState(
    Array(inputs.length).fill(false)
  );

  const handleCheckChange = (index) => {
    const updated = [...checkedInputs];
    updated[index] = !updated[index];
    setCheckedInputs(updated);
  };

  const handleSelectAll = (e) => {
    setCheckedInputs(Array(inputs.length).fill(e.target.checked));
  };

  const onSubmit = (data) => {
    const selectedKeys = inputs
      .map((input, index) => (checkedInputs[index] ? input.registerKey : null))
      .filter(Boolean);

    const filteredData = selectedKeys.reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    console.log("Selected Inputs:", filteredData);
  };

  return (
    <div className="font-SolaimanLipi bg-white">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          <span className="text-blue-600">•</span> {translate("All the divisions whose merit will be mentioned")}
          <span className="text-blue-600"> •</span>
        </h2>
        <p className="text-gray-600 text-sm md:text-base">
          {translate("Select it with a check mark.")}
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
        </div>
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <DefaultSelect
              label={translate("Session") + " :"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ExamID"
            />
            <DefaultSelect
              label={translate("Class/Jamaat") + ":"}
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
          </div>

          {/* Top-level Select All */}
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={checkedInputs.every(Boolean)}
              onChange={handleSelectAll}
              className="mr-2"
            />
            <label className="font-bold">
              {translate("Select all inputs")}
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-6">
            {inputs.map((input, index) => (
              <InputWithCheckbox
                key={index}
                {...input}
                checked={checkedInputs[index]}
                onCheckChange={() => handleCheckChange(index)}
              />
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="submit">{translate("Save")}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default TalentCondition;
