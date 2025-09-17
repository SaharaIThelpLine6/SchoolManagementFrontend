import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useForm, FormProvider } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { getUserType } from "../../utils/read/api";
import {
  fetchSettingsData,
  fetchDidata,
  fetchThanadata,
} from "../../features/settings/settingsSlice";
import { insertUserInfo } from "../../utils/create/api";
import { useNavigate } from "react-router-dom";
import {
  fetchSingleUser,
  setEditMode,
} from "../../features/userInfo/userInfoSlice";
import { updateUserInfo } from "../../utils/update/api";
import DefaultGreen from "../Button/DefaultGreen";
import useTranslate from "../../utils/Translate";

const AddStudentForm = ({ pageTitle }) => {
  const translate = useTranslate();
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
  const {
    gender,
    divition,
    district,
    thana,
    studentRelation,
    userType,
    status,
    error,
  } = useSelector((state) => state.settings);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = methods;

  // const [userType, setUserType] = useState([]);
  const [userMainDetails, setUserMainDetails] = useState([]);
  const [
    DivisionID,
    DistrictID,
    DivisionID2,
    DistrictID2,
    permanentPoliceStationID,
    sameAddress,
    TransientPost,
    TransientVill,
  ] = watch([
    "DivisionID",
    "DistrictID",
    "DivisionID2",
    "DistrictID2",
    "permanentPoliceStationID",
    "sameAddress",
    "TransientPost",
    "TransientVill",
  ]);
  const isSameAddressRef = useRef(false);

  useEffect(() => {
    if (editMode === 0) {
      setValue("DistrictID", "");
      setValue("permanentPoliceStationID", "");
      if (DivisionID) {
        dispatch(fetchDidata(DivisionID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DivisionID === Number(numberStrP.slice(0, 1))) {
        console.log("Both Are Same");
      } else {
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
        dispatch(fetchThanadata(DistrictID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DistrictID === Number(numberStrP.slice(0, 3))) {
        console.log("Both Are Same");
      } else {
        setValue("permanentPoliceStationID", "");
        if (DistrictID) {
          dispatch(fetchThanadata(DistrictID));
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
      } else {
        setValue("DistrictID2", DistrictID);
      }
    } else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DivisionID2 === Number(numberStrT.slice(0, 1))) {
        console.log("Both Are Same");
      } else {
        if (!isSameAddressRef.current) {
          setValue("DistrictID2", "");
          setValue("TransientPoliceStationID", "");
          if (DivisionID2) {
            dispatch(fetchDidata(DivisionID2));
          }
        } else {
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
          dispatch(fetchThanadata(DistrictID2));
        }
      } else {
        setValue("TransientPoliceStationID", permanentPoliceStationID);
      }
    } else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DistrictID2 === Number(numberStrT.slice(0, 3))) {
        console.log("Both Are Same");
      } else {
        console.log("Both Are Not Same");
        console.log(DistrictID2);

        if (!isSameAddressRef.current) {
          setValue("TransientPoliceStationID", "");
          if (DistrictID2) {
            dispatch(fetchThanadata(DistrictID2));
          }
        } else {
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
  }, [
    sameAddress,
    setValue,
    DivisionID,
    DistrictID,
    permanentPoliceStationID,
    TransientVill,
    editMode,
  ]);

  useEffect(() => {
    // dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
    // console.log(editMode);

    if (editMode === 2) {
      const formUserid = getValues("UserID");
      const actualUserId = defaultData.UserID;
      if (formUserid != actualUserId) {
        dispatch(setEditMode(1));
        dispatch(fetchSingleUser(formUserid));
      }
    }
    // else if(editMode === 0) {
    // reset()
    // }
  }, []);

  useEffect(() => {
    dispatch(fetchSettingsData());
    console.log(editMode);

    if (editMode === 0) {
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
      });
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
      reset(defaultData);
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      const numberStrT = defaultData.TransientPoliceStationID.toString();

      const defaultFormData = {
        ...defaultData,
        DivisionID: Number(numberStrP.slice(0, 1)),
        DistrictID: Number(numberStrP.slice(0, 3)),
        DivisionID2: Number(numberStrT.slice(0, 1)),
        DistrictID2: Number(numberStrT.slice(0, 3)),
        sameAddress: numberStrP == numberStrT ? true : false,
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
          console.error("Error in dispatching actions:", err);
        });
    }
  }, [defaultData, reset]);

  if (status === "failed") {
    console.log(error);
  }
  if (status === "succeeded") {
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
        const submitRes = await insertUserInfo(token, data);
        console.log(submitRes);

        navigate(0);
      } else if (editMode === 2) {
        const submitRes = await updateUserInfo(defaultData.UserID, data);
        console.log(submitRes);
        navigate(0);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const saveButton = "Save";
  const newButton = "New";
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="font-lato bg-gray-50 min-h-screen py-6"
      >
        <div className="space-y-8">
          {/* Section: User Info */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2">
              ব্যবহারকারীর তথ্য
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <DefaultSelect
                type="number"
                label="User Type"
                options={userType}
                registerKey="UserTypeID"
                valueField="ID"
                nameField="TypeName"
                require={"User Type Field is required!"}
                labelColor="text-red-500"
              />

              <DefaultInput
                label="New User Code"
                type="number"
                placeholder="100149"
                registerKey="UserCode"
                require="Dakhela is required!"
                codeSetting={true}
                labelColor="text-red-500"
              />

              <DefaultSelect
                label="Gender"
                options={gender}
                registerKey="GenderID"
                require="Gender Field is require"
                nameField="GenderName"
                valueField="ID"
                labelColor="text-red-500"
              />

              <DefaultInput
                label="Name"
                type="text"
                registerKey="UserName"
                placeholder={"Enter your name ..."}
                require="Name is required!"
                labelColor="text-red-500"
              />

              <DefaultInput
                label="পিতার নাম"
                type="text"
                registerKey="FatherName"
                placeholder={"Enter your father name ..."}
              />
              <DefaultInput
                label="মাতার নাম"
                type="text"
                registerKey="MotherName"
                placeholder={"Enter your mother name ..."}
              />

              <div className="flex gap-3 col-span-2 sm:col-auto">
                <DatePickerOne
                  dateCalender="জন্ম তারিখ"
                  registerKey="DateOfBirth"
                  require="Required!"
                  className="w-full"
                  placeholder={"DD-MM-YYYY"}
                />
                <DefaultInput
                  label="বয়স"
                  type="text"
                  placeholder="Enter your age ..."
                  registerKey="age"
                  className="w-20"
                />
              </div>

              <div className="col-span-2 sm:col-auto">
                <DefaultInput
                  label="NID/জন্ম নিবন্ধন নং"
                  type="text"
                  registerKey="NIDNO"
                  placeholder={"Enter your NID No ..."}
                />
              </div>

              <div className="flex gap-3 col-span-2">
                <DefaultInput
                  label={
                    <span className="text-red-500">মোবাইল ১* (SMS যাবে)</span>
                  }
                  type="text"
                  registerKey="Mobile1"
                  className="w-full"
                  placeholder={"Enter your mobile number ..."}
                />
                <DefaultSelect
                  label="সম্পর্ক"
                  type="number"
                  options={studentRelation}
                  valueField="RelationID"
                  nameField="RelationName"
                  registerKey="Relationship1"
                  className="w-36"
                />
              </div>

              <div className="flex gap-3 col-span-2 sm:col-auto">
                <DefaultInput
                  label="মোবাইল ২"
                  type="text"
                  registerKey="Mobile2"
                  placeholder={"Enter your mobile number ..."}
                />
                <DefaultSelect
                  label="সম্পর্ক"
                  type="number"
                  options={studentRelation}
                  valueField="RelationID"
                  nameField="RelationName"
                  registerKey="Relationship2"
                  className="w-36"
                />
              </div>

              <DefaultInput
                label="ই-মেইল"
                type="email"
                registerKey="Email"
                placeholder={"Enter your email address ..."}
              />

              <DefaultSelect
                label="রক্তের গ্রুপ"
                type="string"
                options={[
                  { value: "A+" },
                  { value: "A-" },
                  { value: "B+" },
                  { value: "B-" },
                  { value: "AB+" },
                  { value: "AB-" },
                  { value: "O+" },
                  { value: "O-" },
                ]}
                registerKey="BloodGroup"
                nameField="value"
                valueField="value"
              />
            </div>
          </div>

          {/* Section: Permanent Address */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2 text-center">
              স্থায়ী ঠিকানা
            </h2>
            <div className="grid md:grid-cols-5 gap-5">
              <DefaultSelect
                label="বিভাগ"
                type="number"
                options={divition}
                registerKey="DivisionID"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label="জেলা"
                type="number"
                options={district[DivisionID]}
                registerKey="DistrictID"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label="থানা"
                type="number"
                options={thana[DistrictID]}
                registerKey="permanentPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label="ডাক"
                type="text"
                registerKey="permanentPost"
                placeholder={"Enter your post office ..."}
              />
              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="permanentVill"
                placeholder={"Enter your village ..."}
              />
            </div>
          </div>

          {/* Section: Temporary Address */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="flex items-center justify-center border-b pb-2">
              <label className="absolute left-4 flex items-center gap-2 font-medium text-gray-700">
                <input
                  id="sameAddress"
                  type="checkbox"
                  {...register("sameAddress")}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
                />
                <span>ঠিকানা একই হলে এখানে ক্লিক করুন</span>
              </label>
              <h2 className="text-lg font-bold text-gray-700">
                অস্থায়ী ঠিকানা
              </h2>
            </div>

            <div className="grid md:grid-cols-5 gap-5">
              <DefaultSelect
                label="বিভাগ"
                type="number"
                options={divition}
                registerKey="DivisionID2"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label="জেলা"
                type="number"
                options={district[DivisionID2]}
                registerKey="DistrictID2"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label="থানা"
                type="number"
                options={thana[DistrictID2]}
                registerKey="TransientPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label="ডাক"
                type="text"
                registerKey="TransientPost"
                placeholder={"Enter your post office ..."}
              />
              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="TransientVill"
                placeholder={"Enter your village ..."}
              />
            </div>
            <div className="flex gap-3">
              <DefaultGreen submitButtonGreen={saveButton} />
              <DefaultGreen submitButtonGreen={newButton} />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
export default AddStudentForm;
