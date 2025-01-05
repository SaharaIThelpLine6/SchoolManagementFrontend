import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useFormContext } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
const AddStudentForm = ({ pageTitle }) => {
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

        

        <div className="md:flex  gap-5">
          {/*Column 1 Start*/}
          <div className="w-full flex-wrap lg:flex-nowrap">
            <div className="mb-2">
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


            <div className="mb-2">
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

            <div className="mb-2">
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

            <div className="mb-2">
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

            <div className="mb-2">
              <DefaultInput label={"পিতার নাম :"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>

            <div className="mb-2">
              <DefaultInput label={"মাতার নাম :"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
          </div>
          {/*Column 1 End*/}

          {/*Column 2 Start*/}
          <div className="w-full flex-wrap lg:flex-nowrap">

            <div className="flex gap-5">
              <div className="mb-2 w-full">
                <DatePickerOne />
              </div>
              <div className="mb-2">
                <DefaultInput label={"বয়স :"} type={'email'} placeholder={"৭০"} registerKey={"student_email"} />
              </div>
            </div>
            <div className="mb-2">
              <DefaultInput label={"NID/জন্ম নিবন্ধন নং :"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="flex gap-4">
              <div className="mb-2 w-full">
                <label className="text-red-500">মোবাইল ১* (SMS যাবে)</label>
                <DefaultInput
                  type={'email'}
                  placeholder={""}
                  registerKey={"student_email"}
                />
              </div>

              <div className="mb-2 w-44">
                <DefaultSelect label={"সম্পর্ক:"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
              </div>
            </div>
            <div className="flex gap-5">
              <div className="mb-2 w-full">
                <DefaultInput label={"মোবাইল ২"} type={'email'} placeholder={""} registerKey={"student_email"} />
              </div>
              <div className="mb-2 w-44">
                <DefaultSelect label={"সম্পর্ক:"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
              </div>
            </div>
            <div className="mb-2">
              <DefaultInput label={"ই-মেইল"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"রক্তের গ্রুপ :"} options={[{ id: '1', value: "A+" }, { id: '2', value: "A-" }, { id: '2', value: "B+" }, { id: '2', value: "B-" }, { id: '2', value: "AB+" }, { id: '2', value: "AB-" }, { id: '2', value: "O+" }, { id: '2', value: "O-" }, { id: '2', value: "Empty" }]} registerKey={"user_type"} />
            </div>
          </div>
          {/*Column 2 End*/}
        </div>


        {/*Permanent address column Start*/}
        <div className="my-5">
          <div className="mb-3">
            <p>স্থায়ী ঠিকানা</p>
          </div>

          <div className="md:grid md:grid-cols-5 gap-5">
            <div className="mb-2">
              <DefaultSelect label={"বিভাগ"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"জেলা"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"থানা"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"ডাক"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"গ্রাম"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
          </div>
        </div>
        {/*Permanent address column End*/}

        <div className="flex gap-5 my-5">

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
          <label className="block text-sm font-medium">একই </label>
        </div>



        {/*Temporary address column Start*/}
        <div className="my-5">
          <div className="mb-3">
            <p>অস্থায়ী ঠিকানা</p>
          </div>
          <div className="md:grid md:grid-cols-5 gap-5">

            <div className="mb-2">
              <DefaultSelect label={"বিভাগ"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"জেলা"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"থানা"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"ডাক"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"গ্রাম"} type={'email'} placeholder={""} registerKey={"student_email"} />
            </div>
          </div>
          {/*Temporary address column End*/}

        </div>

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
                        me-2 mb-2 mt-4
                        w-24
                        h-8
              "
            type="submit">
            Save
          </button>


          <button className="mega-button positive text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-0 py-0 text-center me-2 mb-2 mt-4 w-24 h-8" type="submit">
            New
          </button>



              
          {/* <div className="flex flex-col p-4 pl-10">

            <div className="flex gap-4 items-center text-[14px] text-[rgb(51,51,51)]">

              <div>
                <h1 className="text-xl text-slate-500">Filter :</h1>
              </div>
             
              <div className="w-48">
                <DefaultSelect
                  label={""}
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
          
              <div className="w-48">
                <DefaultSelect
                  label={""}
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
              
            </div>
          </div> */}
        </div>
        {/*Save Button & Filter end*/}

      </div>
    </form >
  )
}
export default AddStudentForm