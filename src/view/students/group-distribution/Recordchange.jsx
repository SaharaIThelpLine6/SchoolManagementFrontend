import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../../../components/Forms/DefaultInput";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultGray from "../../../components/Button/DefaultGray";

const Recordchange = () => {
    const methods = useForm()

    const subClassOptions = []
  return (
    <FormProvider {...methods}>
      {" "}
      <form>
        <div className="w-full gap-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Student ID */}
          <div className="space-y-1">
            <DefaultInput
              label={
                <p className="text-gray-700 font-medium">শিক্ষার্থী আইডি :</p>
              }
              type="number"
              placeholder="শিক্ষার্থী আইডি লিখুন"
              registerKey="studentId"
            />
          </div>

          {/* Student Name */}
          <div className="space-y-1">
            <DefaultInput
              label={
                <p className="text-gray-700 font-medium">শিক্ষার্থী নাম :</p>
              }
              type="text"
              placeholder="শিক্ষার্থীর নাম লিখুন"
              registerKey="studentName"
            />
          </div>

          {/* Current Sub Class */}
          <div className="space-y-1">
            <DefaultSelect
              label={<p className="text-gray-700 font-medium">সাব মারহালা :</p>}
              options={subClassOptions}
              valueField="id"
              nameField="value"
              registerKey="currentSubClass"
            />
          </div>
        </div>

        <div className="flex mt-6 border-t pt-5">
          <DefaultGray submitButton="গ্রুপ পরিবর্তন" />
        </div>
      </form>
    </FormProvider>
  );
};

export default Recordchange;
