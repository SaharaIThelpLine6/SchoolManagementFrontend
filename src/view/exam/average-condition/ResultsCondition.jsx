import React from "react";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import Button from "../../../components/Button/Button";

const CheckboxOption = ({ label, registerKey }) => {
  const { register } = useFormContext();
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(registerKey)}
        className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

const ResultsCondition = () => {
  const methods = useForm();

  const getConditionTitle = (condition) => {
    const titles = {
      1: "গড় মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      2: "মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      3: "অধিকতর মি”ইয়ারী কিতাবের ফেল সংক্রান্ত",
      4: "(যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়)",
    };
    return titles[condition] || "";
  };

  const renderConditionFields = (condition) => {
    switch (condition) {
      case 1:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <DefaultInput
                registerKey="condition1_avg"
                placeholder="গড় মিয়ানের যে কোন"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                কিভাবে অথবা এর চেয়ে কম ফেল করে তাহল
              </p>
              <DefaultInput
                registerKey="condition1_bangla"
                placeholder="বাংলা"
              />
              <DefaultInput
                registerKey="condition1_arabic"
                placeholder="আরবি"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption
                label="Silver Color"
                registerKey="condition1_silver"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                এর চেয়ে বেশি ফেল করলে
              </p>
              <DefaultInput
                registerKey="condition1_bangla_fail"
                placeholder="বাংলা"
              />
              <DefaultInput
                registerKey="condition1_arabic_fail"
                placeholder="আরবি"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption
                label="Silver Color"
                registerKey="condition1_silver"
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <DefaultInput
                registerKey="condition1_avg"
                placeholder="গড় মিয়ানের যে কোন"
              />
              <p className="col-span-full md:col-span-2 text-gray-600 self-center">
                কিভাবে অথবা এর চেয়ে কম ফেল করে তাহল
              </p>
              <DefaultInput
                registerKey="condition1_bangla"
                placeholder="বাংলা"
              />
              <DefaultInput
                registerKey="condition1_arabic"
                placeholder="আরবি"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <p></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mt-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                এর চেয়ে বেশি ফেল করলে
              </p>
              <DefaultInput
                registerKey="condition1_bangla_fail"
                placeholder="বাংলা"
              />
              <DefaultInput
                registerKey="condition1_arabic_fail"
                placeholder="আরবি"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>
              <CheckboxOption
                label="Silver Color"
                registerKey="condition1_silver"
              />
            </div>
          </>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            <p className="text-gray-600 self-center">যে কোন</p>
            <DefaultInput
              registerKey="condition3_number"
              placeholder="নাম্বার"
            />
            <p className="text-gray-600 self-center">টি কিভাবে ফেল করলে</p>
            <DefaultInput registerKey="condition3_bangla" placeholder="বাংলা" />
            <DefaultInput registerKey="condition3_arabic" placeholder="আরবি" />
            <p className=" text-gray-600 self-center">হবে ।</p>

            <CheckboxOption
              label="Silver Color"
              registerKey="condition3_silver"
            />
          </div>
        );
      case 4:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              <p className="col-span-full md:col-span-3 text-gray-600 self-center">
                যদি কোন এক বিষয়ে এন্ট্রি বা নাম্বার বাকি থাকে তাহলে ডিভিশন হবে
              </p>

              <DefaultInput
                registerKey="condition4_bangla"
                placeholder="বাংলা"
              />
              <DefaultInput
                registerKey="condition4_arabic"
                placeholder="আরবি"
              />
              <p className=" text-gray-600 self-center">হবে ।</p>

              <CheckboxOption
                label="Silver Color"
                registerKey="condition4_silver"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="p-6 bg-amber-50 text-sm text-gray-800 rounded-lg shadow-md border border-amber-100 space-y-6">
        {/* Header Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              শিক্ষাবর্ষ :
            </label>
            <DefaultSelect
              options={[{ value: "2025", label: "2025" }]}
              registerKey="academicYear"
              placeholder="বছর নির্বাচন করুন"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              পরীক্ষা :
            </label>
            <DefaultSelect
              options={[{ value: "annual", label: "বার্ষিক" }]}
              registerKey="examType"
              placeholder="পরীক্ষা নির্বাচন করুন"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              শ্রেণি :
            </label>
            <DefaultSelect
              options={[{ value: "9", label: "নবম" }]}
              registerKey="class"
              placeholder="শ্রেণি নির্বাচন করুন"
            />
          </div>
          <div className="md:col-span-2">
            <fieldset className="bg-white p-3 rounded-lg border border-gray-200">
              <legend className="text-gray-700 font-medium px-2">
                ক্লাসের ধরন:
              </legend>
              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  { id: "poriyat", label: "পড়িয়াত" },
                  { id: "hifz", label: "হিফজ" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="classType"
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      {...methods.register("classType")}
                      value={option.id}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Condition Sections */}
        {[1, 2, 3, 4].map((condition) => (
          <div
            key={condition}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4"
          >
            <label className="flex items-center gap-3 text-gray-800 font-semibold">
              <input
                type="checkbox"
                className="h-4 w-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                {...methods.register(`condition${condition}_active`)}
              />
              {`কন্ডিশন-${condition} : ${getConditionTitle(condition)}`}
            </label>
            {renderConditionFields(condition)}
          </div>
        ))}

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row justify-center items-center gap-3">
          <p className="text-gray-600 text-center md:text-left whitespace-nowrap">
            মেধার সংখ্যা কত ভাগে তা উল্লেখ করুন
          </p>
          <div className="w-full md:w-auto">
            <DefaultInput registerKey="merit" className="w-full" />
          </div>
        </div>

        <div className="flex justify-start items-center">
          <Button>Save</Button>
        </div>
      </div>
    </FormProvider>
  );
};

export default ResultsCondition;
