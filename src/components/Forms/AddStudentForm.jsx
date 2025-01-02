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
      {/* <h1 className="mb-3">{pageTitle}</h1> */}
      <div className="p-6.5 text-[14px]">
        <div className="mb-2 flex flex-col gap-6 xl:flex-row">
          {/* <SelectGroupOne /> */}
          {/* <DefaultInput label={"First Name"} type={'text'} placeholder={"Enter Student First Name"} registerKey={"first_name"} require={"First Name Not Found"}  />
          <DefaultInput label={"Last Name"} type={'text'} placeholder={"Enter Student Last Name"} registerKey={"lastname_name"} /> */}
        </div>

        <div className="flex gap-5">
          {/*Column 1 Start*/}
          <div>
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

            <div className="flex">
              <div className="mb-2">
                <DefaultInput
                  label={
                    <span className="text-red-500">
                      দাখেলা
                    </span>
                  }
                  type={'email'}
                  placeholder={"100149"}
                  registerKey={"student_email"}
                />
              </div>
              <div className="pt-9 pl-2">
                <p className="text-blue-700 underline">
                  <a href="http://">Code Setting</a>
                </p>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium text-red-600 mb-2">লিঙ্গ * :</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">পুরুষ</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">মহিলা</span>
                </label>
              </div>
            </div>
            <div className="mb-2">
              <DefaultInput 
              label={
                <span className="text-red-500">
                  নাম * :
                </span>
              }
              type={'email'} 
              placeholder={"ইমন"} 
              registerKey={"student_email"} 
              />
            </div>

            <div className="mb-2">
              <DefaultInput label={"পিতার নাম :"} type={'email'} placeholder={"পিতার নাম :"} registerKey={"student_email"} />
            </div>

            <div className="mb-2">
              <DefaultInput label={"মাতার নাম :"} type={'email'} placeholder={"মাতার নাম :"} registerKey={"student_email"} />
            </div>
          </div>
          {/*Column 1 End*/}
          {/*Column 2 Start*/}
          <div>
            <div className="mb-2">
              <DefaultSelect label={"রক্তের গ্রুপ :"} options={[{ id: '1', value: "শিক্ষার্থী" }, { id: '2', value: "শিক্ষক/স্টাফ" }, { id: '2', value: "অভিভাবক" }, { id: '2', value: "দাতা সদস্য" }, { id: '2', value: "লাইব্রেরী সদস্য" }, { id: '2', value: "কফিল" }]} registerKey={"user_type"} />
            </div>
            <div className="flex">
              <div className="mb-2">
                <DatePickerOne />
              </div>
              <div className="mb-2">
                <DefaultInput label={"বয়স :"} type={'email'} placeholder={"৭০"} registerKey={"student_email"} />
              </div>
            </div>
            <div className="mb-2">
              <DefaultInput label={"জন্ম নিবন্ধন নং :"} type={'email'} placeholder={"Birth Certificate No"} registerKey={"student_email"} />
            </div>
            <div className="flex">
              <div className="mb-2">
                <DefaultInput label={"Mobile 1:"} type={'email'} placeholder={"Mobile 1"} registerKey={"student_email"} />
              </div>
              <div className="mb-2">
                <DefaultSelect label={"Relation"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
              </div>
            </div>
            <div className="flex">
              <div className="mb-2">
                <DefaultInput label={"Mobile 2:"} type={'email'} placeholder={"Mobile 2"} registerKey={"student_email"} />
              </div>
              <div className="mb-2">
                <DefaultSelect label={"Relation"} options={[{ id: '1', value: "Father" }, { id: '2', value: "Mother" }]} registerKey={"user_type"} />
              </div>
            </div>
            <div className="mb-2">
              <DefaultInput label={"Email"} type={'email'} placeholder={"Email"} registerKey={"student_email"} />
            </div>
          </div>
          {/*Column 2 End*/}
          {/*Permanent address column Start*/}
          <div>
            <div>
              <p>Permanent Address</p>
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Division"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Distric"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Thana"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"Post"} type={'email'} placeholder={"Post Office"} registerKey={"student_email"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"Village"} type={'email'} placeholder={"Village"} registerKey={"student_email"} />
            </div>
          </div>
          {/*Permanent address column End*/}
          {/*Temporary address column Start*/}
          <div>
            <div>
              <p>Temporary Address</p>
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Division"} options={[{ id: '1', value: "Dhaka" }, { id: '2', value: "Chittagong" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Distric"} options={[{ id: '1', value: "Manikganj" }, { id: '2', value: "Narayanganj" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"Thana"} options={[{ id: '1', value: "Daulatpur" }, { id: '2', value: "Ghior" }]} registerKey={"user_type"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"Post"} type={'email'} placeholder={"Post Office"} registerKey={"student_email"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"Village"} type={'email'} placeholder={"Village"} registerKey={"student_email"} />
            </div>
          </div>
          {/*Temporary address column End*/}
          {/*Click Link */}
          <div>
            <p className="text-blue-600 underline">
              <a href="http://">Click here</a>
            </p>
          </div>
        </div>

        <button className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-4" type="submit">
          Submit
        </button>
      </div>
    </form>
  )
}
export default AddStudentForm