import { useState } from 'react'
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFormContext } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";



const AddStudentForm = ({ pageTitle }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
  const onSubmit = (data) => console.log(data)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato">

      <div className="px-[24px] text-[14px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
          {/*Form Start*/}
          <div className="">
            <DefaultSelect
              label={
                <span className="text-red-500">
                  ব্যবহারকারীর ধরণ * :
                </span>
              }
              options={[
                { id: '1', value: "শিক্ষার্থী" },
                { id: '2', value: "শিক্ষক/স্টাফ" },
                { id: '3', value: "অভিভাবক" },
                { id: '4', value: "দাতা সদস্য" },
                { id: '5', value: "লাইব্রেরী সদস্য" },
                { id: '6', value: "কফিল" }
              ]}
              registerKey={"user_type"}
            />
          </div>

          <div className="">
            <DefaultInput
              label={
                <div className="flex justify-between">
                  <span className="text-red-500">দাখেলা</span>
                  <p className="text-blue-700 underline">
                    <a href="http://">Code Setting</a>
                  </p>
                </div>
              }
              type={'email'}
              placeholder={"100149"}
              registerKey={"student_email"}
            />
          </div>

          <div className="">
            <DefaultSelect
              label={
                <span className="text-red-500">
                  লিঙ্গ * :
                </span>
              }
              options={[
                { id: '1', value: "পুরুষ" },
                { id: '2', value: "মহিলা" },
              ]}
              registerKey={"user_type"}
            />
          </div>

          <div className="">
            <DefaultInput
              label={
                <span className="text-red-500">
                  নাম * :
                </span>
              }
              type={'email'}
              placeholder={""}
              registerKey={"student_email"}
            />
          </div>

          <div className="">
            <DefaultInput label={"পিতার নাম :"} type={'email'} placeholder={""} registerKey={"student_email"} />
          </div>

          <div className="">
            <DefaultInput label={"মাতার নাম :"} type={'email'} placeholder={""} registerKey={"student_email"} />
          </div>

          <div className="flex gap-3">
            <div className=" w-full">
              <DatePickerOne />
            </div>
            <div className=" w-16">
              <DefaultInput label={"বয়স :"} type={'email'} placeholder={"৭০"} registerKey={"student_email"} />
            </div>
          </div>
          <div className="">
            <DefaultInput label={"NID/জন্ম নিবন্ধন নং :"} type={'email'} placeholder={""} registerKey={"student_email"} />
          </div>
          <div className="flex gap-3">
            <div className="mb-2 w-full">
              <label className="text-red-500">মোবাইল ১* (SMS যাবে)</label>
              <DefaultInput
                type={'email'}
                placeholder={""}
                registerKey={"student_email"}
              />
            </div>

            <div className=" w-36">
              <DefaultSelect label={"সম্পর্ক:"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className=" w-full">
              <DefaultInput label={"মোবাইল ২"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className=" w-36">
              <DefaultSelect label={"সম্পর্ক:"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
            </div>
          </div>
          <div className="">
            <DefaultInput label={"ই-মেইল"} type={'email'} placeholder={""} registerKey={"student_email"} />
          </div>
          <div className="">
            <DefaultSelect label={"রক্তের গ্রুপ :"} options={[{ id: '1', value: "A+" }, { id: '2', value: "A-" }, { id: '2', value: "B+" }, { id: '2', value: "B-" }, { id: '2', value: "AB+" }, { id: '2', value: "AB-" }, { id: '2', value: "O+" }, { id: '2', value: "O-" }, { id: '2', value: "Empty" }]} registerKey={"user_type"} />
          </div>

        </div>


        {/* Permanent address column Start*/}
        <div className="">
          <div className="text-center font-bold mt-3 font-noto mb-[-10px] text-[16px]">
            <p>স্থায়ী ঠিকানা</p>
          </div>

          <div className="md:grid md:grid-cols-5 gap-3">
            <div className="">
              <DefaultSelect label={"বিভাগ"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultSelect label={"জেলা"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultSelect label={"থানা"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultInput label={"ডাক"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="">
              <DefaultInput label={"গ্রাম"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
          </div>
        </div>
        {/*Permanent address column End*/}

        <div className="flex mb-[14px] mt-[18px] pl-[4px] font-bold relative">

          <div className="flex gap-[5px] items-start">
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name=""
                  value="male"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
            <label className="items-center text-[16px] font-bold font-noto left-[50%] top-[50%]"> ঠিকানা একই হলে এখানে ক্লিক করুন </label>
          </div>

          <div className="mx-auto font-bold font-noto mb-[-10px] text-[16px] absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-35%]">
            <p>অস্থায়ী ঠিকানা</p>
          </div>
        </div>



        {/* Temporary address column Start*/}
          <div className="md:grid md:grid-cols-5 gap-3">

            <div className="">
              <DefaultSelect label={"বিভাগ"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultSelect label={"জেলা"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultSelect label={"থানা"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="">
              <DefaultInput label={"ডাক"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="">
              <DefaultInput label={"গ্রাম"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
          </div>
          {/*Temporary address column End*/}

        

        {/*Image add start*/}
        <div className="flex gap-2 mt-1">
          <p>ছবি সংযুক্ত করুন</p>
          <input
            type="file"
            className="file-input"
            onChange={handleImageChange}
          />
          {selectedImage && <img src={selectedImage} alt="uploaded" className="uploaded-image h-20 w-20 border-4 border-slate-300" />}
        </div>
        {/*Image add end*/}

        {/*Save Button & Filter start*/}
        <div className="flex gap-3">
          <button
            className="
          mega-button positive
           text-white 
           bg-gradient-to-r
          from-green-400
             via-green-500
              to-green-600
               hover:bg-gradient-to-br
                focus:ring-4
                 focus:outline-none
                  focus:ring-green-300
                   font-medium
                    rounded-lg
                     text-sm
                      px-0 py-0
                       text-center
                        me-2 mb-2 mt-2
                        w-24
                        h-8
              "
            type="submit">
            Save
          </button>


          <button className="mega-button positive text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-0 py-0 text-center me-2 mb-2 mt-2 w-24 h-8" type="submit">
            New
          </button>

        </div>
        {/*Save Button & Filter end*/}

      </div>
    </form >
  )
}
export default AddStudentForm