import React from "react";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { useGetSessionsQuery } from "../features/session/sessionSlice";

const RadioOption = ({ option, register, name, labelClassName }) => (
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      type="radio"
      name={name}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
      {...register(name)}
      value={option.id}
    />
    <span className={`text-sm text-gray-700 ${labelClassName}`}>
      {option.label}
    </span>
  </label>
);

const ExamAdmitCard = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { data: sessionData } = useGetSessionsQuery();

  const { handleSubmit } = methods;
  const classListData = null;
  const genderOptions = null;

  const onSubmit = (data) => {
    console.log(data);
  };

  // Constants for clean code
  const colorOptions = [
    { id: "poriyat", label: "সাদা-কালা" },
    { id: "hifz", label: "রঙিন" },
    { id: "printed", label: "প্রেসে ছাপানো কাগজে" },
  ];
  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between mb-6">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Exam List Made")}
        </h3>
        {/* <Button onClick={handleOpenModal}>
          {translate("Talent Condition")}
        </Button> */}
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 my-5">
        {colorOptions.map((option) => (
          <RadioOption
            key={option.id}
            option={option}
            register={methods.register}
            name="classType"
            labelClassName={"text-xl"}
          />
        ))}
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
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
            <DefaultSelect
              label={translate("Class/Jamaat") + ":"}
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
            <DefaultSelect
              label={translate("Class/Jamaat") + ":"}
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Color Selection Fieldset */}
            <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px]">
              <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
                কালার নির্বাচন করুন:
              </legend>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-1">
                {colorOptions.map((option) => (
                  <RadioOption
                    key={option.id}
                    option={option}
                    register={methods.register}
                    name="classType"
                  />
                ))}
              </div>
            </fieldset>

            {/* Printer Icon */}
            <div className="p-2">
              <img
                src="/printer.png"
                alt="Printer Icon"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExamAdmitCard;
