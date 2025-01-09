import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useForm } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { getUserType } from "../../utils/read/api";
import { fetchSettingsData, fetchDidata, fetchThanadata } from "../../features/settings/settingsSlice";
import { insertUserInfo } from "../../utils/create/api";
import { useNavigate } from "react-router-dom";

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
  const { gender, divition, district, thana, studentRelation, status, error } = useSelector((state) => state.settings);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    resetField,
    formState: { errors },
  } = useFormContext();

  const [userType, setUserType] = useState([]);

  const [DivisionID, DistrictID, DivisionID2, DistrictID2, TransientPoliceStationID, sameAddress, TransientPost, TransientVill] = watch(["DivisionID", "DistrictID", "DivisionID2", "DistrictID2", "TransientPoliceStationID", "sameAddress", "TransientPost", "TransientVill"])

  const isSameAddressRef = useRef(false);

  useEffect(() => {
    setValue("DistrictID", "");
    setValue("TransientPoliceStationID", "");
    if (DivisionID) {
      dispatch(fetchDidata(DivisionID));
    }
  }, [DivisionID, setValue]);

  useEffect(() => {
    setValue("TransientPoliceStationID", "");
    if (DistrictID) {
      dispatch(fetchThanadata(DistrictID))
    }
  }, [DistrictID, setValue]);

  useEffect(() => {
    if (!isSameAddressRef.current) {
      setValue("DistrictID2", "");
      setValue("permanentPoliceStationID", "");
      if (DivisionID2) {
        dispatch(fetchDidata(DivisionID2));
      }
    }
    else {
      setValue("DistrictID2", DistrictID);
    }


  }, [DivisionID2, setValue]);

  useEffect(() => {
    if (!isSameAddressRef.current) {
      setValue("permanentPoliceStationID", "");
      if (DistrictID2) {
        dispatch(fetchThanadata(DistrictID2))
      }
    }
    else {
      setValue("permanentPoliceStationID", TransientPoliceStationID);
    }

  }, [DistrictID2, setValue]);

  useEffect(() => {
    
    isSameAddressRef.current = sameAddress;

    if (isSameAddressRef.current) {
      setValue("DivisionID2", DivisionID);
      setValue("DistrictID2", DistrictID);
      setValue("permanentPoliceStationID", TransientPoliceStationID);

      setValue("permanentPost", TransientPost)
      setValue("permanentVill", TransientVill)
    }

  }, [sameAddress, setValue, DivisionID, DistrictID, TransientPoliceStationID, TransientVill])

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
    dispatch(fetchSettingsData());
  }, [pageTitle, dispatch]);


  useEffect(() => {
    const dataFeatch = async () => {
      try {
        const data = await getUserType();
        const transformedData = data.map(item => ({
          id: String(item.ID),
          value: item.TypeName
        }));
        setUserType(transformedData)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    dataFeatch();
  }, [])

  if (status === 'failed') {
    console.log(error);

  }
  if (status === 'succeeded') {
    console.log(district);
    console.log(DistrictID);
    console.log(thana);
    console.log(studentRelation);

  }
  const onSubmit = async (data) => {
    try {
      console.log(token);
      
      const submitRes = await insertUserInfo(token, data)
      console.log(submitRes);
      navigate(0);
    } catch(err){
      console.error(err.message)
      // alert(err.message)
    }
    
    
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato">

      <div className="px-[24px] text-[14px]">

        <div className="md:flex  gap-5">
          {/*Column 1 Start*/}
          <div className="w-full flex-wrap lg:flex-nowrap">
            <div className="mb-2">
              <DefaultSelect
              type="number"
                label={
                  <span className="text-red-500">
                    ব্যবহারকারীর ধরণ * :
                  </span>
                }
                options={userType}
                registerKey={"UserTypeID"}
                valueField={"id"}
                nameField={"value"}
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
                type={'number'}
                placeholder={"100149"}
                registerKey={"UserCode"}
              />
            </div>

            <div className="mb-2">
              <DefaultSelect
                label={
                  <span className="text-red-500">
                    লিঙ্গ * :
                  </span>
                }
                options={gender}
                registerKey={"GenderID"}
                require={"Gender Field is require"}
                nameField={"GenderName"}
                valueField={"ID"}
              />
            </div>

            <div className="mb-2">
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

            <div className="mb-2">
              <DefaultInput label={"পিতার নাম :"} type={'text'} placeholder={""} registerKey={"FatherName"} />
            </div>

            <div className="mb-2">
              <DefaultInput label={"মাতার নাম :"} type={'text'} placeholder={""} registerKey={"MotherName"} />
            </div>
          </div>
          {/*Column 1 End*/}

          <div className="flex gap-3">
            {/* <div className="mb-2 w-full">
              <DatePickerOne />
            </div> */}
            {/* <div className="mb-2 w-16">
              <DefaultInput label={"বয়স :"} type={'text'} placeholder={"৭০"} registerKey={"age"} />
            </div> */}
          </div>
          <div className="mb-2">
            <DefaultInput label={"NID/জন্ম নিবন্ধন নং :"} type={'text'} placeholder={""} registerKey={"NIDNO"} />
          </div>
          <div className="flex gap-3">
            <div className="mb-2 w-full">
              <label className="text-red-500">মোবাইল ১* (SMS যাবে)</label>
              <DefaultInput
                type={'text'}
                placeholder={""}
                registerKey={"Mobile1"}
              />
            </div>

            <div className="mb-2 w-36">
              <DefaultSelect label={"সম্পর্ক:"} type="number" options={studentRelation} valueField={"RelationID"} nameField={"RelationName"} registerKey={"Relationship1"} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="mb-2 w-full">
              <DefaultInput label={"মোবাইল ২"} type={'text'} placeholder={""} registerKey={"Mobile2"} />
            </div>
            <div className="mb-2 w-36">
              <DefaultSelect label={"সম্পর্ক:"} type="number" options={studentRelation} valueField={"RelationID"} nameField={"RelationName"} registerKey={"Relationship2"} />
            </div>
          </div>
          <div className="mb-2">
            <DefaultInput label={"ই-মেইল"} type={'email'} placeholder={""} registerKey={"Email"} />
          </div>
          <div className="mb-2">
            <DefaultSelect label={"রক্তের গ্রুপ :"} type="string" options={[{ value: "A+" }, { value: "A-" }, { value: "B+" }, {value: "B-" }, {value: "AB+" }, { value: "AB-" }, {value: "O+" }, { value: "O-" }]} registerKey={"BloodGroup"} nameField={"value"} 
              valueField={"value"}
              
              />
          </div>

        </div>


        {/* Permanent address column Start*/}
        <div className="my-5">
          <div className="mb-3">
            <p>স্থায়ী ঠিকানা</p>
          </div>

          <div className="md:grid md:grid-cols-5 gap-5">
            <div className="mb-2">
              <DefaultSelect label={"বিভাগ"} type="number" options={divition} registerKey={"DivisionID"} valueField={"DivisionID"} nameField={"DivisionName"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"জেলা"} type="number" options={district[DivisionID]} registerKey={"DistrictID"} valueField={"DistrictID"} nameField={"DistrictName"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"থানা"} type="number" options={thana[DistrictID]} registerKey={"TransientPoliceStationID"} valueField={"PoliceStationID"} nameField={"PoliceStationName"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"ডাক"} type={'text'} placeholder={""} registerKey={"TransientPost"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"গ্রাম"} type={'text'} placeholder={""} registerKey={"TransientVill"} />
            </div>
          </div>
        </div>
        {/*Permanent address column End*/}

        <div className="flex gap-5 my-5">

          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                id="sameAddress"
                type="checkbox"
                name="sameAddress"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                {...register("sameAddress")}
              />
            </label>
          </div>
          <label htmlFor="sameAddress" className="block text-sm font-medium">একই </label>
        </div>



        {/*Temporary address column Start*/}
        <div className="my-5">
          <div className="mb-3">
            <p>অস্থায়ী ঠিকানা</p>
          </div>
          <div className="md:grid md:grid-cols-5 gap-5">

            <div className="mb-2">
              <DefaultSelect label={"বিভাগ"} type="number" options={divition} registerKey={"DivisionID2"} valueField={"DivisionID"} nameField={"DivisionName"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"জেলা"} type="number" options={district[DivisionID2]} registerKey={"DistrictID2"} valueField={"DistrictID"} nameField={"DistrictName"} />
            </div>
            <div className="mb-2">
              <DefaultSelect label={"থানা"} type="number" options={thana[DistrictID2]} registerKey={"permanentPoliceStationID"} valueField={"PoliceStationID"} nameField={"PoliceStationName"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"ডাক"} type={'text'} placeholder={""} registerKey={"permanentPost"} />
            </div>
            <div className="mb-2">
              <DefaultInput label={"গ্রাম"} type={'text'} placeholder={""} registerKey={"permanentVill"} />
            </div>
          </div>
          {/*Temporary address column End*/}

        </div>

        {/*Image add start*/}
        <div className="flex gap-2 my-5">
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
        </div>
        {/*Save Button & Filter end*/}

      </div>
    </form >
  )
}
export default AddStudentForm