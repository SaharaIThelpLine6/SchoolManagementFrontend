import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import DefaultGray from "../../../components/Button/DefaultGray";

const CreateDistribution = () => {
  const methods = useForm();

  const academicYearOptions = []
  const classOptions = []
  const genderOptions = []
  const subClassOptions = []
  return (
    <FormProvider {...methods}>
      {" "}
      <form>
        <div className="w-full gap-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Academic Year */}
          <div className="space-y-1">
            <DefaultSelect
              label={<p className="text-gray-700 font-medium">শিক্ষাবর্ষ :</p>}
              options={academicYearOptions}
              valueField="id"
              nameField="value"
              registerKey="academicYear"
            />
          </div>

          {/* Class/Marhala */}
          <div className="space-y-1">
            <DefaultSelect
              label={
                <p className="text-gray-700 font-medium">মারহালা/ক্লাশ:</p>
              }
              options={classOptions}
              valueField="id"
              nameField="value"
              registerKey="class"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <DefaultSelect
              label={<p className="text-gray-700 font-medium">লিঙ্গ:</p>}
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
          </div>

          {/* Sub Class ID */}
          <div className="space-y-1">
            <DefaultInput
              label={
                <p className="text-gray-700 font-medium">সাব ক্লাস আইডি :</p>
              }
              type="number"
              placeholder="সাব ক্লাস আইডি লিখুন"
              registerKey="subClassId"
            />
          </div>

          {/* Sub Class */}
          <div className="space-y-1">
            <DefaultSelect
              label={<p className="text-gray-700 font-medium">সাব ক্লাস :</p>}
              options={subClassOptions}
              valueField="id"
              nameField="value"
              registerKey="subClass"
            />
          </div>
        </div>

        <div className="flex mt-6 border-t pt-5">
          <DefaultGray submitButton="সংরক্ষণ করুন" />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateDistribution;
