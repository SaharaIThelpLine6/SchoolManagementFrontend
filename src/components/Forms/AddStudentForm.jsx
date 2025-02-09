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
import { fetchSingleUser, setEditMode } from "../../features/userInfo/userInfoSlice";
import { updateUserInfo } from "../../utils/update/api";
import DefaultGreen from "../Button/DefaultGreen";
import { setItemsPerPage } from "../../features/pagination/paginationSlice";

const AddStudentForm = ({ pageTitle }) => {

  const [selectedImage, setSelectedImage] = useState(null);
  const defaultData = useSelector((state) => state.userInfo.defaultFormValue);
  const editMode = useSelector((state) => state.userInfo.editMode);
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
  const { gender, divition, district, thana, studentRelation,userType, status, error } = useSelector((state) => state.settings);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useFormContext();

  // const [userType, setUserType] = useState([]);
  const [userMainDetails, setUserMainDetails] = useState([]);
  const [DivisionID, DistrictID, DivisionID2, DistrictID2, permanentPoliceStationID, sameAddress, TransientPost, TransientVill] = watch(["DivisionID", "DistrictID", "DivisionID2", "DistrictID2", "permanentPoliceStationID", "sameAddress", "TransientPost", "TransientVill"])
  const isSameAddressRef = useRef(false);

  useEffect(() => {
    if (editMode === 0) {
      setValue("DistrictID", "");
      setValue("permanentPoliceStationID", "");
      if (DivisionID) {
        dispatch(fetchDidata(DivisionID));
      }
    }
    else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DivisionID === Number(numberStrP.slice(0, 1))) {
        console.log("Both Are Same");
      }
      else {
        console.log("Both Are Not Same");
        setValue("DistrictID", "");
        setValue("permanentPoliceStationID", "");
        if (DivisionID) {
          dispatch(fetchDidata(DivisionID));
        }
      }
    }

  }, [DivisionID, setValue, editMode]);

  useEffect(() => {
    if (editMode === 0) {
      setValue("permanentPoliceStationID", "");
      if (DistrictID) {
        dispatch(fetchThanadata(DistrictID))
      }
    }
    else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DistrictID === Number(numberStrP.slice(0, 3))) {
        console.log("Both Are Same");
      }
      else {
        setValue("permanentPoliceStationID", "");
        if (DistrictID) {
          dispatch(fetchThanadata(DistrictID))
        }
      }
    }

  }, [DistrictID, setValue, editMode]);

  // permanent address End

  //tempo adress start
  useEffect(() => {
    if (editMode === 0) {
      if (!isSameAddressRef.current) {
        setValue("DistrictID2", "");
        setValue("TransientPoliceStationID", "");
        if (DivisionID2) {
          dispatch(fetchDidata(DivisionID2));
        }
      }
      else {
        setValue("DistrictID2", DistrictID);
      }
    }
    else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DivisionID2 === Number(numberStrT.slice(0, 1))) {
        console.log("Both Are Same");
      }
      else {
        if (!isSameAddressRef.current) {
          setValue("DistrictID2", "");
          setValue("TransientPoliceStationID", "");
          if (DivisionID2) {
            dispatch(fetchDidata(DivisionID2));
          }
        }
        else {
          setValue("DistrictID2", DistrictID);
        }
      }
    }



  }, [DivisionID2, setValue, editMode]);

  useEffect(() => {
    if (editMode === 0) {
      if (!isSameAddressRef.current) {
        setValue("TransientPoliceStationID", "");
        if (DistrictID2) {
          dispatch(fetchThanadata(DistrictID2))
        }
      }
      else {
        setValue("TransientPoliceStationID", permanentPoliceStationID);
      }
    }
    else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DistrictID2 === Number(numberStrT.slice(0, 3))) {
        console.log("Both Are Same");
      }
      else {
        console.log("Both Are Not Same");
        console.log(DistrictID2);


        if (!isSameAddressRef.current) {
          setValue("TransientPoliceStationID", "");
          if (DistrictID2) {
            dispatch(fetchThanadata(DistrictID2));
          }
        }
        else {
          setValue("DistrictID2", DistrictID);
        }
      }
    }


  }, [DistrictID2, setValue, editMode]);
  //tempo adress End
  useEffect(() => {
    isSameAddressRef.current = sameAddress;
    // if (editMode === 0) {
    if (isSameAddressRef.current) {
      setValue("DivisionID2", DivisionID);
      setValue("DistrictID2", DistrictID);
      setValue("TransientPoliceStationID", permanentPoliceStationID);

      // setValue("permanentPost", TransientPost)
      // setValue("permanentVill", TransientVill)
      setValue("TransientPost", watch("permanentPost"));
      setValue("TransientVill", watch("permanentVill"));
    }
    // }
  }, [sameAddress, setValue, DivisionID, DistrictID, permanentPoliceStationID, TransientVill, editMode])

  useEffect(() => {
    // dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
    // console.log(editMode);
    
    if(editMode === 2){
      const formUserid = getValues("UserID")
      const actualUserId = defaultData.UserID
      if(formUserid != actualUserId){
        dispatch(setEditMode(1))
        dispatch(fetchSingleUser(formUserid))
      }
    }
    // else if(editMode === 0) {
      // reset()
    // }
  }, []);

  useEffect(() => {
    dispatch(fetchSettingsData());
    console.log(editMode);
    
    if(editMode === 0){
      reset({
        UserName: "",
        UserTypeID: "",
        UserCode: "",
        GenderID: "",
        FatherName: "",
        MotherName: "",
        DateOfBirth: "",
        age: "",
        NIDNO: "",
        Mobile1: "",
        Mobile2: "",
        Relationship2: "",
        Email: "",
        BloodGroup: "",
        DivisionID: "",
        DistrictID: "",
        permanentPoliceStationID: "",
        permanentPost: "",
        permanentVill: "",
        sameAddress: false,
        DivisionID2: "",
        DistrictID2: "",
        TransientPoliceStationID: "",
        TransientPost: "",
        TransientVill: "",
      })
    }
  }, [dispatch]);


  // useEffect(() => {
  //   const dataFeatch = async () => {
  //     try {
  //       const data = await getUserType();
  //       const transformedData = data.map(item => ({
  //         id: String(item.ID),
  //         value: item.TypeName
  //       }));
  //       setUserType(transformedData)
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   }

  //   dataFeatch();
  // }, [])

  useEffect(() => {
    if (defaultData && editMode === 1) {
      reset(defaultData)
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      const numberStrT = defaultData.TransientPoliceStationID.toString();

      const defaultFormData = {
        ...defaultData,
        DivisionID: Number(numberStrP.slice(0, 1)),
        DistrictID: Number(numberStrP.slice(0, 3)),
        DivisionID2: Number(numberStrT.slice(0, 1)),
        DistrictID2: Number(numberStrT.slice(0, 3)),
        sameAddress: numberStrP == numberStrT ? true : false
      };

      const promises = [
        dispatch(fetchDidata(defaultFormData.DivisionID)),
        dispatch(fetchDidata(defaultFormData.DivisionID2)),
        dispatch(fetchThanadata(defaultFormData.DistrictID)),
        dispatch(fetchThanadata(defaultFormData.DistrictID2)),
      ];

      Promise.all(promises)
        .then(() => {
          // console.log(defaultFormData);
          reset(defaultFormData);
          dispatch(setEditMode(2));
        })
        .catch((err) => {
          console.error('Error in dispatching actions:', err);
        });

    }
  }, [defaultData, reset]);

  if (status === 'failed') {
    console.log(error);

  }
  if (status === 'succeeded') {
    // console.log(district);
    // console.log(DistrictID);
    // console.log(thana);
    // console.log(userType);

  }
  const onSubmit = async (data) => {
    console.log(data);

    try {
      console.log(editMode);
      if (editMode === 0) {
        const submitRes = await insertUserInfo(token, data)
        console.log(submitRes);

        navigate(0);
      }
      else if (editMode === 2) {
        const submitRes = await updateUserInfo(defaultData.UserID, data)
        console.log(submitRes);
        navigate(0);
      }

    } catch (err) {
      console.error(err.message)
    }
  }
  const saveButton = "Save";
  const newButton = "New";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato">

      <div className="px-[24px] text-[14px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
          {/*Form Start*/}
          <div className="">
            <DefaultSelect
              type="number"
              label={
                <span className="text-red-500">
                  ব্যবহারকারীর ধরণ * :
                </span>
              }
              options={userType}
              registerKey={"UserTypeID"}
              valueField={"ID"}
              nameField={"TypeName"}
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
              type={'number'}
              placeholder={"100149"}
              registerKey={"UserCode"}
            />
          </div>

          <div className="">
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

          <div className="">
            <DefaultInput label={"মাতার নাম :"} type={'text'} placeholder={""} registerKey={"MotherName"} />
          </div>

          <div className="flex gap-3">
            <div className=" w-full">
              <DatePickerOne dateCalender={"জন্ম তারিখ :"} placeholder={""} registerKey={"DateOfBirth"} require={"Date Of Birth Require"}/>
            </div>
            <div className=" w-16">
              <DefaultInput label={"বয়স :"} type={'text'} placeholder={"৭০"} registerKey={"age"} />
            </div>
          </div>
          <div className="">
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

            <div className=" w-36">
              <DefaultSelect label={"সম্পর্ক:"} type="number" options={studentRelation} valueField={"RelationID"} nameField={"RelationName"} registerKey={"Relationship1"} />
            </div>
          </div>
          <div className="flex gap-3">
            <div className=" w-full">
              <DefaultInput label={"মোবাইল ২"} type={'text'} placeholder={""} registerKey={"Mobile2"} />
            </div>
            <div className=" w-36">
              <DefaultSelect label={"সম্পর্ক:"} type="number" options={studentRelation} valueField={"RelationID"} nameField={"RelationName"} registerKey={"Relationship2"} />
            </div>
          </div>
          <div className="">
            <DefaultInput label={"ই-মেইল"} type={'email'} placeholder={""} registerKey={"Email"} />
          </div>
          <div className="">
            <DefaultSelect label={"রক্তের গ্রুপ :"} type="string" options={[{ value: "A+" }, { value: "A-" }, { value: "B+" }, { value: "B-" }, { value: "AB+" }, { value: "AB-" }, { value: "O+" }, { value: "O-" }]} registerKey={"BloodGroup"} nameField={"value"}
              valueField={"value"}

            />
          </div>
        </div>

        {/* Permanent address column Start*/}
        <div className="">
          <div className="text-center font-bold mt-3 font-noto mb-[-10px] text-[16px]">
            <p>স্থায়ী ঠিকানা</p>
          </div>

          <div className="md:grid md:grid-cols-5 gap-3">
            <div className="">
              <DefaultSelect label={"বিভাগ"} type="number" options={divition} registerKey={"DivisionID"} valueField={"DivisionID"} nameField={"DivisionName"} />
            </div>
            <div className="">
              <DefaultSelect label={"জেলা"} type="number" options={district[DivisionID]} registerKey={"DistrictID"} valueField={"DistrictID"} nameField={"DistrictName"} />
            </div>
            <div className="">
              <DefaultSelect label={"থানা"} type="number" options={thana[DistrictID]} registerKey={"permanentPoliceStationID"} valueField={"PoliceStationID"} nameField={"PoliceStationName"} />
            </div>
            <div className="">
              <DefaultInput label={"ডাক"} type={'text'} placeholder={""} registerKey={"permanentPost"} />
            </div>
            <div className="">
              <DefaultInput label={"গ্রাম"} type={'text'} placeholder={""} registerKey={"permanentVill"} />
            </div>
          </div>
        </div>
        {/*Permanent address column End*/}

        <div className="flex mb-[14px] mt-[18px] pl-[4px] font-bold relative">
          <div className="flex gap-[5px] items-start">
            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  id="sameAddress"
                  type="checkbox"
                  value="male"
                  name="sameAddress"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  {...register("sameAddress")}
                />
              </label>
            </div>
            <label htmlFor="sameAddress" className="items-center text-[16px] font-bold font-noto left-[50%] top-[50%]"> ঠিকানা একই হলে এখানে ক্লিক করুন </label>
          </div>

          <div className="mx-auto font-bold font-noto mb-[-10px] text-[16px] absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-35%]">
            <p>অস্থায়ী ঠিকানা</p>
          </div>
        </div>



        {/*Temporary address column Start*/}
        <div className="md:grid md:grid-cols-5 gap-3">

          <div className="">
            <DefaultSelect label={"বিভাগ"} type="number" options={divition} registerKey={"DivisionID2"} valueField={"DivisionID"} nameField={"DivisionName"} />
          </div>
          <div className="">
            <DefaultSelect label={"জেলা"} type="number" options={district[DivisionID2]} registerKey={"DistrictID2"} valueField={"DistrictID"} nameField={"DistrictName"} />
          </div>
          <div className="">
            <DefaultSelect label={"থানা"} type="number" options={thana[DistrictID2]} registerKey={"TransientPoliceStationID"} valueField={"PoliceStationID"} nameField={"PoliceStationName"} />
          </div>
          <div className="">
            <DefaultInput label={"ডাক"} type={'text'} placeholder={""} registerKey={"TransientPost"} />
          </div>
          <div className="">
            <DefaultInput label={"গ্রাম"} type={'text'} placeholder={""} registerKey={"TransientVill"} />
          </div>
        </div>
        {/*Temporary address column End*/}



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

        {/*Save Button & Filter start*/}
        <div className="flex mt-[10px] pl-[4px] font-bold relative">
          <div className="flex gap-3">
            <DefaultGreen submitButtonGreen={saveButton} />
            <DefaultGreen submitButtonGreen={newButton} />
          </div>
          <div className="font-bold text-slate-800  font-noto text-[16px] absolute left-[90%]">
            <select className="border-2 border-slate-300 rounded-lg py-0.5 px-4 bg-transparent" onChange={(e) => dispatch(setItemsPerPage(e.target.value))} defaultValue={"2"}>
              <option value="2">2</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
        {/*Save Button & Filter end*/}

      </div>
    </form >
  )
}
export default AddStudentForm