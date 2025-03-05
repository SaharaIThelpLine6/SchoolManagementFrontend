import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useForm } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { useNavigate } from "react-router-dom";
import { useAddStudentMutation, useGetClassQuery, useGetResidentialQuery } from "../../features/onlineAdmission/onlineAdmissionSlice";
import { fetchDidata, fetchSettingsFieldData, fetchThanadata, setEditMode } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import convertBijoyToBengali from "../../utils/uniconveter";

const AddOnlineStudentForm = ({ schoolid }) => {
  const defaultData = useSelector((state) => state.studentResultPublicView.defaultFormValue);
  const editMode = useSelector((state) => state.studentResultPublicView.editMode);
  const [buttonDisable, setButtonDisable] = useState(false)
  const { data: classData, error: classError } = useGetClassQuery({ id: schoolid });
  const { data: residentialData, error: residentialError } = useGetResidentialQuery({ id: schoolid });
  const dispatch = useDispatch();
  const { gender, divition, district, thana, studentRelation, status, error } = useSelector((state) => state.studentResultPublicView);


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
  const [addStudent, { isLoading, isError, isSuccess, data: newApplicationResponse }] = useAddStudentMutation();
  const isSameAddressRef = useRef(false);
  useEffect(() => {
    if (editMode === 0) {
      setValue("DistrictID", "");
      setValue("permanentPoliceStationID", "");
      if (DivisionID) {
        dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID }));
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
          dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID }));
        }
      }
    }

  }, [DivisionID, setValue, editMode]);

  useEffect(() => {
    if (editMode === 0) {
      setValue("permanentPoliceStationID", "");
      if (DistrictID) {
        dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID }))
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
          dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID }))
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
          dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID2 }));
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
            dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID2 }));
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
          dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID2 }))
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
            dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID2 }));
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

  // useEffect(() => {
  //   // dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  //   // console.log(editMode);

  //   if (editMode === 2) {
  //     const formUserid = getValues("UserID")
  //     const actualUserId = defaultData.UserID
  //     if (formUserid != actualUserId) {
  //       dispatch(setEditMode(1))
  //       dispatch(fetchSingleUser(formUserid))
  //     }
  //   }
  // }, []);

  useEffect(() => {
    dispatch(fetchSettingsFieldData(schoolid));
    // console.log(editMode);

    if (editMode === 0) {
      reset({
        UserName: "",
        GenderID: "",
        FatherName: "",
        MotherName: "",
        DateOfBirth: "",
        NIDNO: "",
        Mobile1: "",
        Relationship1: "",
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
        ClassID: "",
        ResidentialStatusId: ""
      })
    }
  }, [dispatch]);



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
        dispatch(fetchDidata({ madrasaId: schoolid, id: defaultFormData.DivisionID })),
        dispatch(fetchDidata({ madrasaId: schoolid, id: defaultFormData.DivisionID2 })),
        dispatch(fetchThanadata({ madrasaId: schoolid, id: defaultFormData.DistrictID })),
        dispatch(fetchThanadata({ madrasaId: schoolid, id: defaultFormData.DistrictID2 })),
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
  // if (status === 'succeeded') {
  //   // console.log(district);
  //   // console.log(DistrictID);
  //   // console.log(thana);
  //   // console.log(userType);

  // }
  const onSubmit = async (data) => {
    try {
      // Convert all text fields to Bijoy encoding
      const convertedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) =>
          typeof value === "string" ? [key, convertBijoyToBengali(value)] : [key, value]
        )
      );

      console.log('Converted Data:', convertedData);

      await addStudent({ dataBody: convertedData, id: schoolid }).unwrap();
    } catch (err) {
      console.error('Error submitting data:', err);
    }
  };


  useEffect(() => {
    if (isSuccess) {
      console.log(newApplicationResponse);
      console.log(newApplicationResponse?.data);
      console.log(newApplicationResponse?.data?.student.UserCode);

      navigate(`/${schoolid}/online_admission/${newApplicationResponse?.data?.student.UserCode}`);  // Trigger navigation when the API call is successful
      // console.log(isSuccess);

    }

    if (isError) {
      console.error('API call failed:', error);
      // Show an error message to the user here
    }
  }, [isSuccess, isError]);
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato pt-[100px] lg:pt-0 lg:mt-5 lg:ml-5">

      <div className="px-[24px] text-[14px]">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
          {/*Form Start*/}



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

          <div className="flex gap-3">
            <div className=" w-full">
              <DatePickerOne dateCalender={"জন্ম তারিখ :"} placeholder={""} registerKey={"DateOfBirth"} require={"Date Of Birth Require"} />
            </div>

          </div>
          <div className="">
            <DefaultInput label={"NID/জন্ম নিবন্ধন নং :"} type={'text'} placeholder={""} registerKey={"NIDNO"} />
          </div>
          <div className="flex gap-3">
            <div className="mb-2 w-full">
              <label className="text-red-500 font-SolaimanLipi">মোবাইল ১* (SMS যাবে)</label>
              <DefaultInput
                type={'phone'}
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
          <div className="">
            {classData ? <DefaultSelect label={"শ্রেণী"} type={"number"} options={classData} nameField={"ClassName"} valueField={"ClassID"} registerKey={"ClassID"} require={"This Field is require"} unicode={true} /> : "no data"}
          </div>
          <div className="">
            {classData ? <DefaultSelect label={"আবাসন"} type={"number"} options={residentialData} nameField={"ResidentialName"} valueField={"RDID"} registerKey={"ResidentialStatusId"} require={"This Field is require"} /> : "no data"}
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

        <div className="lg:flex mb-[14px] mt-[18px] pl-[4px] font-bold relative">
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

          <div className="mx-auto font-bold font-noto mt-[20px] lg:mt-0 lg:mb-[-10px] text-[16px] lg:absolute lg:left-[50%] lg:top-[50%] lg:translate-x-[-50%] lg:translate-y-[-35%]">
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
        <div className="mt-[40px]">
          <button type="submit" disabled={buttonDisable} className={`${buttonDisable ? "bg-[#E0E0E0]" : "bg-theme-color text-white"} transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}>দাখিল করুন</button>
        </div>
      </div>
    </form >
  )
}
export default AddOnlineStudentForm;