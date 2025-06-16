import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import DefaultGray from "../../../components/Button/DefaultGray";
import Textarea from "../../../components/Forms/Textarea";

const CreateCertificateAttestation = () => {
  const methods = useForm();

  const cardTypeOptions = [
    { id: "id", value: "ID" },
    { id: "card", value: "Card" },
  ];

  const institutionYearOptions = [{ id: "2017-18", value: "২০১৭-১৮" }];

  const academicYearOptions = [{ id: "kitab-khana", value: "কিতাব খানা" }];

  const examOptions = [{ id: "first-summer", value: "১ম সামারিক পরীক্ষা" }];

  return (
    <FormProvider {...methods}>
      <form className="max-w-5xl mx-auto bg-white p-4 md:p-6 rounded-md shadow-md text-gray-800">
        {/* Top Section - Photo and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Left section - photo and ID */}
          <div className="col-span-1 flex flex-col items-center gap-3">
            <div className="w-24 h-32 md:w-32 md:h-40 border border-gray-400 flex items-center justify-center text-sm">
              Photo
            </div>
            <div className="w-full">
              <DefaultInput
                label="User ID :"
                type="text"
                placeholder="10013"
                registerKey="documentNumber"
                defaultValue="10013"
                className="text-center"
              />
            </div>
          </div>

          {/* Right section - student info */}
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <DefaultInput
              label="এন্ট্রি তারিখ :"
              type="date"
              registerKey="entryDate"
              defaultValue="2025-06-16"
            />
            <DefaultInput
              label="নাম :"
              type="text"
              registerKey="name"
              defaultValue="ইমন"
            />
            <DefaultInput
              label="পিতা :"
              type="text"
              registerKey="fatherName"
              defaultValue="হাসান"
            />
            <DefaultInput
              label="মাতা :"
              type="text"
              registerKey="motherName"
              defaultValue="জবিনা"
            />
            <div className="md:col-span-2">
              <Textarea
                label="ঠিকানা :"
                placeholder="Enter your address"
                registerKey="description"
                require={true}
              />
            </div>
          </div>
        </div>

        <hr className="my-4 md:my-6 border-t border-gray-300" />

        {/* Admission Section */}
        <div className="space-y-4 mb-6">
          {/* First Row - Admission Info */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <p className="text-sm md:text-base whitespace-nowrap">
              ভর্তি রেজিস্ট্রি অনুযায়ী তাহার কোড নাম্বার
            </p>
            <div className="w-20 md:w-24">
              <DefaultInput
                label=""
                type="text"
                registerKey="admissionNumber"
                defaultValue="10013"
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              এবং জন্ম তারিখ
            </p>
            <div className="w-28 md:w-32">
              <DefaultInput
                label=""
                type="date"
                registerKey="birthDate"
                defaultValue="2018-01-31"
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              সে অত্র প্রতিষ্ঠানে
            </p>
            <div className="w-28 md:w-32">
              <DefaultSelect
                label=""
                options={institutionYearOptions}
                valueField="id"
                nameField="value"
                registerKey="institutionYear"
                defaultValue="2017-18"
              />
            </div>
          </div>

          {/* Second Row - Academic Info */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <p className="text-sm md:text-base whitespace-nowrap">শিক্ষাবর্ষ</p>
            <div className="w-28 md:w-32">
              <DefaultSelect
                label=""
                options={academicYearOptions}
                valueField="id"
                nameField="value"
                registerKey="academicYear"
                defaultValue="kitab-khana"
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              জামাতে অধ্যয়ন করেছে
            </p>
            <div className="w-32 md:w-36">
              <DefaultSelect
                label=""
                options={examOptions}
                valueField="id"
                nameField="value"
                registerKey="examType"
                defaultValue="first-summer"
              />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              তার মোট নাম্বার
            </p>
            <div className="w-24 md:w-28">
              <DefaultInput label="" type="text" registerKey="totalMarks" />
            </div>
            <p className="text-sm md:text-base whitespace-nowrap">
              এবং বিভাগ পেয়ে উত্তীর্ণ হয়েছে।
            </p>
          </div>

          {/* Remarks */}
          <div className="text-xs md:text-sm text-gray-700 leading-relaxed border p-3 md:p-4 rounded">
            উক্ত প্রতিষ্ঠানের অধ্যক্ষের অবস্থান তারই আচরণ-আচার্য্য ছিল
            সন্তোষজনক। আমার জানা মতে সে কোন রাষ্ট্রবিরোধী কার্যকলাপে জড়িত নয়।
            আমরা তারই উজ্জ্বল ভবিষ্যৎ ও সর্বোচ্চ সফলতা কামনা করি।
          </div>
        </div>

        <div className="flex justify-end mt-4 md:mt-6">
          <DefaultGray submitButton="সংরক্ষণ করুন" />
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateCertificateAttestation;
