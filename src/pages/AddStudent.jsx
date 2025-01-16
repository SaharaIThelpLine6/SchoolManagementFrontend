import { useState } from "react";
import DefaultGreen from "../components/Button/DefaultGreen";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";




const AddStudent = () => {
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
  return (
    <div className="-translate-y-4 font-lato">

      <h1 className="mt-[-7px] py-[12px] px-[12px] text-black bg-green-600 text-center mx-auto text-xl w-full font-normal font-lato block border-0">শিক্ষার্থী ভর্তি ফর্ম</h1>
      <form action="" className="px-[12px] pt-2 text-[14px]">

        <div className="pb-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 flex-wrap lg:flex-nowrap">
          <div className="flex relative items-center lg:translate-y-3 2xl:translate-y-3">
            <div className="w-full">
              
              <input
                className="block outline-none p-1.5 w-full z-20 text-sm text-gray-900 border border-green-400 rounded-s-md "
                required
              />
            </div>
            <button
              className="flex-shrink-0 items-center py-1.5 px-2 text-sm border border-green-400 border-l-0 font-medium text-center text-black rounded-e-md"
              type="button">
              <select
                className="outline-none text-sm text-gray-900 bg-transparent  "
                required
              >
                <option value="option1" selected>ID</option>
                <option value="option2">Card</option>
              </select>
            </button>
          </div>
        </div>


        <div className="pt-2 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">

          <div className="">
            <DefaultInput
              label={
                <span className="text-red-500">
                  নাম * :
                </span>
              }
              type={'text'}
              placeholder={""}
              registerKey={"UserName"}
            />
          </div>
          <div className="">
            <DefaultInput label={"পিতার নাম :"} type={'text'} placeholder={""} registerKey={"FatherName"} />
          </div>
          <div className=" w-full">
            <DefaultInput label={"মোবাইল :"} type={'text'} placeholder={""} registerKey={"Mobile2"} />
          </div>

          <div className=" w-full">
            <DatePickerOne dateCalender="এন্ট্রি তারিখ" />
          </div>
          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span>
                  শিক্ষাবর্ষ :
                </span>
              }
              registerKey={"UserTypeID"}
              valueField={"id"}
              nameField={"value"}
            />
          </div>
          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span>
                  ভর্তি ইচ্ছুক ক্লাস:
                </span>
              }
              registerKey={"UserTypeID"}
              valueField={"id"}
              nameField={"value"}
            />
          </div>
          <div className="">
            <DefaultInput label={"সীট নং :"} type={'text'} placeholder={""} registerKey={"FatherName"} />
          </div>

          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span>
                  আর্থিক অবস্থা :
                </span>
              }
              registerKey={"UserTypeID"}
              valueField={"id"}
              nameField={"value"}
            />
          </div>

          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span>
                  ভর্তি ধরণ :
                </span>
              }
              registerKey={"UserTypeID"}
              valueField={"id"}
              nameField={"value"}
            />
          </div>

          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span>
                  আবাসন অবস্থা :
                </span>
              }
              registerKey={"UserTypeID"}
              valueField={"id"}
              nameField={"value"}
            />
          </div>
          {/*Image add start*/}
          {/* <div className="flex gap-2 mt-1">
            <p>ছবি সংযুক্ত করুন</p>
            <input
              type="file"
              className="file-input"
              onChange={handleImageChange}
            />
            {selectedImage && <img src={selectedImage} alt="uploaded" className="uploaded-image h-20 w-20 border-4 border-slate-300" />}
          </div> */}
          {/*Image add end*/}

        </div>
        <div className="grid lg:grid-cols-2 pt-5">
          <div className="flex gap-5">
            <DefaultGreen submitButtonGreen={"Save"} />
            <DefaultGreen submitButtonGreen={"New"} />
          </div>
          <div className="grid grid-cols-1 mt-2 lg:mt-0 lg:grid-cols-2 gap-2 lg:gap-10">
            <h2>এই বছরের মোট শিক্ষার্থী : </h2>
            <h2>মোট শিক্ষার্থী : </h2>
          </div>
        </div>
      </form>








    </div>




  )
}
export default AddStudent;