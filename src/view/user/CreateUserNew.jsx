import 'flatpickr/dist/flatpickr.css';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useGetAllGendersQuery,
  useGetCodeSettingsQuery,
  useGetDistrictsQuery,
  useGetDivisionsQuery,
  useGetPoliceStationsQuery,
  useGetSettingsQuery,
  useGetStudentRelationsQuery,
} from '../../features/settings/settingsQuerySlice';

import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import PhoneNumberInput from '../../components/Forms/PhoneNumberInput';
import { permissionsDataList } from '../../Data/permissions';
import {
  useGetUserCodeCheckQuery,
  useGetUserTypesQuery,
  usePostUserMutation,
} from '../../features/userType/userTypeSlice';
import { usePermission } from '../../hooks/usePermission';
import { ViewPermission } from '../../Routes/ViewPermission';
import { calculateAge } from '../../utils/calculateAge';
import useTranslate from '../../utils/Translate';
import { useSelector } from 'react-redux';

const CreateUser = ({ pageTitle }) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  // Step state for Wizard
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm({
    defaultValues: {
      GenderID: '',
      UserName: '',
      UserTypeID: '',
      UserCode: '',
      FatherName: '',
      MotherName: '',
      DateOfBirth: '',
      age: '',
      NIDNO: '',
      Mobile1: '',
      Mobile2: '',
      Relationship2: '',
      Email: '',
      BloodGroup: '',
      DivisionID: '',
      DistrictID: '',
      permanentPoliceStationID: '',
      permanentPost: '',
      permanentVill: '',
      sameAddress: false,
      DivisionID2: '',
      DistrictID2: '',
      TransientPoliceStationID: '',
      TransientPost: '',
      TransientVill: '',
    },
    mode: 'onTouched',
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = methods;

  const [selectedImage, setSelectedImage] = useState(null);

  // Watch form values
  const [
    DivisionID,
    DistrictID,
    DivisionID2,
    DistrictID2,
    permanentPoliceStationID,
    sameAddress,
    UserTypeID,
    DateOfBirth,
  ] = watch([
    'DivisionID',
    'DistrictID',
    'DivisionID2',
    'DistrictID2',
    'permanentPoliceStationID',
    'sameAddress',
    'UserTypeID',
    'DateOfBirth',
  ]);

  const formattedDate =
    DateOfBirth ? new Date(DateOfBirth.getTime() - DateOfBirth.getTimezoneOffset() * 60000).toISOString().split("T")[0] : "";

  const editMode = useSelector((state) => state.userInfo.editMode);

  useEffect(() => {
    console.log(editMode);
    console.log("=================");
  }, [editMode]);

  const ageValue = calculateAge(DateOfBirth);

  // RTK Query hooks
  const { data: codeSettings = [] } = useGetCodeSettingsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const { data: studentRelation = [] } = useGetStudentRelationsQuery(
    undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    }
  );
  const { data: userType = [] } = useGetUserTypesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const { data: gender = [] } = useGetAllGendersQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { data: infoSettings = [] } = useGetSettingsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { data: userCodeCheck = {} } = useGetUserCodeCheckQuery(UserTypeID, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    skip: !UserTypeID,
  });

  const { data: divisions = [] } = useGetDivisionsQuery();
  const { data: districts = [] } = useGetDistrictsQuery(DivisionID, {
    skip: !DivisionID,
  });
  const { data: policeStations = [] } = useGetPoliceStationsQuery(DistrictID, {
    skip: !DistrictID,
  });

  const { data: districts2 = [] } = useGetDistrictsQuery(DivisionID2, {
    skip: !DivisionID2,
  });
  const { data: policeStations2 = [] } = useGetPoliceStationsQuery(
    DistrictID2,
    {
      skip: !DistrictID2,
    }
  );

  const [postUser] = usePostUserMutation();

  const settingsArray = infoSettings?.data || [];
  const dataGender = settingsArray.find((c) => c.ID === 28);

  const isSameAddressRef = useRef(false);

  // Calculate user code data
  let userCodeData = null;
  if (UserTypeID && codeSettings?.length) {
    let existing = codeSettings.find(
      (c) => Number(c.UserTypeID) === Number(UserTypeID)
    );
    const usercode = existing?.IDType === 2 ? null : existing?.Value;
    const usercodeData = userCodeCheck?.UserCode
      ? userCodeCheck?.UserCode
      : usercode;
    userCodeData = existing?.IDType === 2 ? null : usercodeData;
  }

  // Set default GenderID when dataGender is available
  useEffect(() => {
    if (dataGender?.Action && !watch('GenderID')) {
      setValue('GenderID', dataGender.Action, { shouldValidate: true });
    }
  }, [dataGender, setValue, watch]);

  // Handle permanent address changes
  useEffect(() => {
    if (DivisionID) {
      setValue('DistrictID', '');
      setValue('permanentPoliceStationID', '');
    }
  }, [DivisionID, setValue]);

  useEffect(() => {
    if (DistrictID) {
      setValue('permanentPoliceStationID', '');
    }
  }, [DistrictID, setValue]);

  // Handle temporary address changes
  useEffect(() => {
    if (!isSameAddressRef.current && DivisionID2) {
      setValue('DistrictID2', '');
      setValue('TransientPoliceStationID', '');
    }
  }, [DivisionID2, setValue]);

  useEffect(() => {
    if (!isSameAddressRef.current && DistrictID2) {
      setValue('TransientPoliceStationID', '');
    }
  }, [DistrictID2, setValue]);

  // Handle same address checkbox
  useEffect(() => {
    isSameAddressRef.current = sameAddress;
    if (isSameAddressRef.current) {
      setValue('DivisionID2', DivisionID);
      const districtTimer = setTimeout(() => {
        setValue('DistrictID2', DistrictID);
      }, 100);
      const policeStationTimer = setTimeout(() => {
        setValue('TransientPoliceStationID', permanentPoliceStationID);
      }, 200);

      setValue('TransientPost', watch('permanentPost'));
      setValue('TransientVill', watch('permanentVill'));
      return () => {
        clearTimeout(districtTimer);
        clearTimeout(districtTimer);
        clearTimeout(policeStationTimer);
      };
    }
  }, [
    sameAddress,
    setValue,
    DivisionID,
    DistrictID,
    permanentPoliceStationID,
    watch,
  ]);

  // Reset form on component mount
  useEffect(() => {
    reset({
      UserName: '',
      UserTypeID: '',
      UserCode: '',
      GenderID: dataGender?.Action || '',
      FatherName: '',
      MotherName: '',
      DateOfBirth: '',
      age: '',
      NIDNO: '',
      Mobile1: '',
      Mobile2: '',
      Relationship2: '',
      Email: '',
      BloodGroup: '',
      DivisionID: '',
      DistrictID: '',
      permanentPoliceStationID: '',
      permanentPost: '',
      permanentVill: '',
      sameAddress: false,
      DivisionID2: '',
      DistrictID2: '',
      TransientPoliceStationID: '',
      TransientPost: '',
      TransientVill: '',
    });
    setCurrentStep(1); // Reset to first step on form reset
  }, [reset, dataGender]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

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

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dob = new Date(formattedDate);
      dob.setHours(0, 0, 0, 0);

      if (dob > today) {
        await Swal.fire({
          icon: 'warning',
          title: 'তারিখ সঠিক নয়!',
          text: 'জন্ম তারিখ আজকের তারিখের পর হতে পারবে না।',
          confirmButtonText: 'ঠিক আছে',
        });
        return;
      }
      const payload = {
        ...data,
        DateOfBirth: formattedDate
      }
      const response = await postUser(payload).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully',
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      console.log('User created:', response);
    } catch (err) {
      console.log(err)
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err?.message || 'Something went wrong!',
      });
      console.error('Error creating user:', err);
    }
  };

  const handleResetForm = () => {
    reset();
  };

  // --- Wizard Navigation Logic ---
  const steps = [
    { id: 1, name: 'ব্যক্তিগত তথ্য' },
    { id: 2, name: 'স্থায়ী ঠিকানা' },
    { id: 3, name: 'অস্থায়ী ঠিকানা' },
  ];

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['UserTypeID', 'UserCode', 'GenderID', 'UserName', 'Mobile1'];
    } else if (currentStep === 2) {
      fieldsToValidate = [];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <FormProvider {...methods}>
      {/* Main Container - Full width, no max-width restriction */}
      <div className="font-default bg-gray-100 min-h-screen py-6 px-4 w-full">

        {/* Top Stepper Navigation - Full width */}
        <div className="w-full mb-6 bg-blue-600 rounded-xl overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 px-6 gap-4 md:gap-0 w-full">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center gap-3 w-full md:w-auto relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-green-500 text-[#115e59] scale-110 shadow-lg'
                      : isCompleted
                        ? 'bg-white text-[#115e59]'
                        : 'bg-gray-400 text-gray-800'
                      }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${isActive
                      ? 'text-green-400 border-b-2 border-green-400 pb-1'
                      : isCompleted
                        ? 'text-white'
                        : 'text-gray-300'
                      }`}
                  >
                    {step.name}
                  </span>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute right-[-15%] lg:right-[-25%] top-1/2 transform -translate-y-1/2 w-[30%] lg:w-[40%] h-[2px] bg-gray-500/50"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container - Full width */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">

          {/* STEP 1: User Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {translate('১. ব্যক্তিগত তথ্য')}
                </h2>
              </div>

              {/* Grid updated to xl:grid-cols-4 for large screens */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                {/* Full name spans all columns on larger screens */}
                <div className="col-span-1 md:col-span-2">
                  <DefaultInput
                    label={<span className="text-red-500">{translate("পূর্ণ নাম (বাংলা) ")}</span>}
                    type="text"
                    registerKey="UserName"
                    placeholder="নাম লিখুন ..."
                    require="Name is required!"
                  />
                </div>

                <DefaultSelect
                  label={<span className="text-red-500">{translate("লিঙ্গ")}</span>}
                  options={[
                    { GenderID: 1, GenderName: 'ছেলে' },
                    { GenderID: 2, GenderName: 'মহিলা' },
                  ]}
                  registerKey="GenderID"
                  require="Gender Field is required!"
                  nameField="GenderName"
                  valueField="GenderID"
                />

                <DefaultInput
                  label={translate("পিতার নাম ")}
                  type="text"
                  registerKey="FatherName"
                  placeholder="পিতার নাম লিখুন ..."
                  require="Father's name is required!"
                />

                <DefaultInput
                  label={translate("মাতার নাম ")}
                  type="text"
                  registerKey="MotherName"
                  placeholder="মাতার নাম লিখুন ..."
                  require="Mother's name is required!"
                />

                <DatePickerOne
                  dateCalender={translate("জন্ম তারিখ ")}
                  registerKey="DateOfBirth"
                  className="w-full"
                  placeholder="DD-MM-YYYY"
                />

                <DefaultSelect
                  label={translate("বৈবাহিক অবস্থা")}
                  options={[
                    { value: 'Single', label: 'অবিবাহিত (Single)' },
                    { value: 'Married', label: 'বিবাহিত (Married)' },
                  ]}
                  registerKey="MaritalStatus"
                  nameField="label"
                  valueField="value"
                />

                <DefaultSelect
                  label={translate("রক্তের গ্রুপ")}
                  options={[
                    { value: 'A+' }, { value: 'A-' }, { value: 'B+' }, { value: 'B-' },
                    { value: 'AB+' }, { value: 'AB-' }, { value: 'O+' }, { value: 'O-' },
                  ]}
                  registerKey="BloodGroup"
                  nameField="value"
                  valueField="value"
                />

                <DefaultInput
                  label={translate("এনআইডি/জন্ম নিবন্ধন নং")}
                  type="text"
                  registerKey="NIDNO"
                  placeholder="NID নম্বর লিখুন ..."
                />

                <DefaultInput
                  label={translate("এজ")}
                  type="text"
                  placeholder="বয়স ..."
                  registerKey="age"
                  defaultValue={ageValue?.years ?? ''}
                  disable
                />

                <DefaultSelect
                  label={translate("ইউজার টাইপ *")}
                  options={userType}
                  registerKey="UserTypeID"
                  valueField="ID"
                  nameField="TypeName"
                  require="User Type Field is required!"
                />

                <DefaultInput
                  label={translate("নতুন ইউজার কোড")}
                  type="number"
                  placeholder="100149"
                  registerKey="UserCode"
                  require="Dakhela is required!"
                  codeSetting={true}
                  defaultValue={userCodeData ? userCodeData : ''}
                  disable={userCodeData ? true : false}
                />

                <PhoneNumberInput
                  label={<span className="text-red-500">{translate("মোবাইল ১* (এসএমএস যাবে)")}</span>}
                  registerKey="Mobile1"
                  require={true}
                  minLength={11}
                  maxLength={11}
                  allowedPrefixes={['013', '014', '015', '016', '017', '018', '019']}
                />

                <DefaultSelect
                  label={translate("সম্পর্ক")}
                  options={studentRelation}
                  valueField="RelationID"
                  nameField="RelationName"
                  registerKey="Relationship1"
                />

                <DefaultInput
                  label={translate("মোবাইল ২")}
                  type="number"
                  registerKey="Mobile2"
                  placeholder="ফোন নম্বর লিখুন"
                />

                <DefaultSelect
                  label={translate("সম্পর্ক")}
                  options={studentRelation}
                  valueField="RelationID"
                  nameField="RelationName"
                  registerKey="Relationship2"
                />

                <DefaultInput
                  label={translate("ই-মেইল")}
                  type="email"
                  registerKey="Email"
                  placeholder="ইমেইল এড্রেস লিখুন ..."
                />
              </div>
            </div>
          )}

          {/* STEP 2: Permanent Address */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {translate('২. স্থায়ী ঠিকানা')}
                </h2>
              </div>

              {/* Grid updated to xl:grid-cols-4 for large screens */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <DefaultSelect
                  label={translate("বিভাগ")}
                  options={divisions}
                  registerKey="DivisionID"
                  valueField="DivisionID"
                  nameField="DivisionName"
                />
                <DefaultSelect
                  label={translate("জেলা")}
                  options={districts}
                  registerKey="DistrictID"
                  valueField="DistrictID"
                  nameField="DistrictName"
                />
                <DefaultSelect
                  label={translate("থানা")}
                  options={policeStations}
                  registerKey="permanentPoliceStationID"
                  valueField="PoliceStationID"
                  nameField="PoliceStationName"
                />
                <DefaultInput
                  label={translate("ডাক")}
                  type="text"
                  registerKey="permanentPost"
                  placeholder="পোস্ট অফিস লিখুন ..."
                />
                <DefaultInput
                  label={translate("গ্রাম")}
                  type="text"
                  registerKey="permanentVill"
                  placeholder="গ্রামের নাম লিখুন ..."
                />
              </div>
            </div>
          )}

          {/* STEP 3: Temporary Address */}
          {currentStep === 3 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {translate('৩. অস্থায়ী ঠিকানা')}
                  </h2>
                </div>

                <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                  <input
                    id="sameAddress"
                    type="checkbox"
                    {...register('sameAddress')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 rounded border-gray-300"
                  />
                  <span className="text-sm">{translate("ঠিকানা একই হলে এখানে টিক করুন")}</span>
                </label>
              </div>

              {/* Grid updated to xl:grid-cols-4 for large screens */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <DefaultSelect
                  label={translate("বিভাগ")}
                  options={divisions}
                  registerKey="DivisionID2"
                  valueField="DivisionID"
                  nameField="DivisionName"
                />
                <DefaultSelect
                  label={translate("জেলা")}
                  options={districts2}
                  registerKey="DistrictID2"
                  valueField="DistrictID"
                  nameField="DistrictName"
                />
                <DefaultSelect
                  label={translate("থানা")}
                  options={policeStations2}
                  registerKey="TransientPoliceStationID"
                  valueField="PoliceStationID"
                  nameField="PoliceStationName"
                />
                <DefaultInput
                  label={translate("ডাক")}
                  type="text"
                  registerKey="TransientPost"
                  placeholder="পোস্ট অফিস লিখুন ..."
                />
                <DefaultInput
                  label={translate("গ্রাম")}
                  type="text"
                  registerKey="TransientVill"
                  placeholder="গ্রামের নাম লিখুন ..."
                />
              </div>
            </div>
          )}

          {/* Navigation & Action Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">

            {/* Left Side: Reset Draft */}
            <button
              type="button"
              onClick={handleResetForm}
              className="text-gray-500 hover:text-green-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              ফর্ম রিসেট করুন
            </button>

            {/* Right Side: Prev / Next / Submit */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  পূর্ববর্তী
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                >
                  পরবর্তী
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <ViewPermission
                  permissionId={permissionsDataList.user_entry}
                  permissionType="insert"
                >
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    সেভ করুন
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </ViewPermission>
              )}
            </div>
          </div>

        </form>
      </div>
    </FormProvider>
  );
};

export default CreateUser;
// import 'flatpickr/dist/flatpickr.css';
// import { useEffect, useRef, useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
// import DefaultInput from '../../components/Forms/DefaultInput';
// import DefaultSelect from '../../components/Forms/DefaultSelect';
// import {
//   useGetAllGendersQuery,
//   useGetCodeSettingsQuery,
//   useGetDistrictsQuery,
//   useGetDivisionsQuery,
//   useGetPoliceStationsQuery,
//   useGetSettingsQuery,
//   useGetStudentRelationsQuery,
// } from '../../features/settings/settingsQuerySlice';

// import Swal from 'sweetalert2';
// import Button from '../../components/Button/Button';
// import PhoneNumberInput from '../../components/Forms/PhoneNumberInput';
// import { permissionsDataList } from '../../Data/permissions';
// import {
//   useGetUserCodeCheckQuery,
//   useGetUserTypesQuery,
//   usePostUserMutation,
// } from '../../features/userType/userTypeSlice';
// import { usePermission } from '../../hooks/usePermission';
// import { ViewPermission } from '../../Routes/ViewPermission';
// import { calculateAge } from '../../utils/calculateAge';
// import useTranslate from '../../utils/Translate';
// import { useSelector } from 'react-redux';

// const CreateUser = ({ pageTitle }) => {
//   const translate = useTranslate();
//   const navigate = useNavigate();
//   const { hasPermission } = usePermission();

//   const methods = useForm({
//     defaultValues: {
//       GenderID: '',
//       UserName: '',
//       UserTypeID: '',
//       UserCode: '',
//       FatherName: '',
//       MotherName: '',
//       DateOfBirth: '',
//       age: '',
//       NIDNO: '',
//       Mobile1: '',
//       Mobile2: '',
//       Relationship2: '',
//       Email: '',
//       BloodGroup: '',
//       DivisionID: '',
//       DistrictID: '',
//       permanentPoliceStationID: '',
//       permanentPost: '',
//       permanentVill: '',
//       sameAddress: false,
//       DivisionID2: '',
//       DistrictID2: '',
//       TransientPoliceStationID: '',
//       TransientPost: '',
//       TransientVill: '',
//     },
//     mode: 'onTouched',
//   });

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     formState: { errors },
//   } = methods;

//   const [selectedImage, setSelectedImage] = useState(null);

//   // Watch form values
//   const [
//     DivisionID,
//     DistrictID,
//     DivisionID2,
//     DistrictID2,
//     permanentPoliceStationID,
//     sameAddress,
//     UserTypeID,
//     DateOfBirth,
//   ] = watch([
//     'DivisionID',
//     'DistrictID',
//     'DivisionID2',
//     'DistrictID2',
//     'permanentPoliceStationID',
//     'sameAddress',
//     'UserTypeID',
//     'DateOfBirth',
//   ]);
//   const formattedDate =
//     DateOfBirth ? new Date(DateOfBirth.getTime() - DateOfBirth.getTimezoneOffset() * 60000).toISOString().split("T")[0] : "";
//   // console.log(DateOfBirth, "DateOfBirth")
//   console.log(formattedDate, "formattedDate")
//   const editMode = useSelector((state) => state.userInfo.editMode);


//   useEffect(() => {
//     console.log(editMode);
//     console.log("=================");


//   }, [editMode])
//   const ageValue = calculateAge(DateOfBirth);
//   // RTK Query hooks
//   const { data: codeSettings = [] } = useGetCodeSettingsQuery(undefined, {
//     refetchOnFocus: true,
//     refetchOnMountOrArgChange: true,
//   });
//   const { data: studentRelation = [] } = useGetStudentRelationsQuery(
//     undefined,
//     {
//       refetchOnFocus: true,
//       refetchOnMountOrArgChange: true,
//     }
//   );
//   const { data: userType = [] } = useGetUserTypesQuery(undefined, {
//     refetchOnFocus: true,
//     refetchOnMountOrArgChange: true,
//   });
//   const { data: gender = [] } = useGetAllGendersQuery(undefined, {
//     refetchOnFocus: true,
//     refetchOnMountOrArgChange: true,
//   });

//   const { data: infoSettings = [] } = useGetSettingsQuery(undefined, {
//     refetchOnFocus: true,
//     refetchOnMountOrArgChange: true,
//   });

//   const { data: userCodeCheck = {} } = useGetUserCodeCheckQuery(UserTypeID, {
//     refetchOnFocus: true,
//     refetchOnMountOrArgChange: true,
//     skip: !UserTypeID,
//   });

//   const { data: divisions = [] } = useGetDivisionsQuery();
//   const { data: districts = [] } = useGetDistrictsQuery(DivisionID, {
//     skip: !DivisionID,
//   });
//   const { data: policeStations = [] } = useGetPoliceStationsQuery(DistrictID, {
//     skip: !DistrictID,
//   });

//   const { data: districts2 = [] } = useGetDistrictsQuery(DivisionID2, {
//     skip: !DivisionID2,
//   });
//   const { data: policeStations2 = [] } = useGetPoliceStationsQuery(
//     DistrictID2,
//     {
//       skip: !DistrictID2,
//     }
//   );

//   const [postUser] = usePostUserMutation();

//   const settingsArray = infoSettings?.data || [];
//   const dataGender = settingsArray.find((c) => c.ID === 28);

//   const isSameAddressRef = useRef(false);

//   // Calculate user code data
//   let userCodeData = null;
//   if (UserTypeID && codeSettings?.length) {
//     let existing = codeSettings.find(
//       (c) => Number(c.UserTypeID) === Number(UserTypeID)
//     );
//     const usercode = existing?.IDType === 2 ? null : existing?.Value;
//     const usercodeData = userCodeCheck?.UserCode
//       ? userCodeCheck?.UserCode
//       : usercode;
//     userCodeData = existing?.IDType === 2 ? null : usercodeData;
//   }

//   // Set default GenderID when dataGender is available
//   useEffect(() => {
//     if (dataGender?.Action && !watch('GenderID')) {
//       setValue('GenderID', dataGender.Action, { shouldValidate: true });
//     }
//   }, [dataGender, setValue, watch]);

//   // Handle permanent address changes
//   useEffect(() => {
//     if (DivisionID) {
//       setValue('DistrictID', '');
//       setValue('permanentPoliceStationID', '');
//     }
//   }, [DivisionID, setValue]);

//   useEffect(() => {
//     if (DistrictID) {
//       setValue('permanentPoliceStationID', '');
//     }
//   }, [DistrictID, setValue]);

//   // Handle temporary address changes
//   useEffect(() => {
//     if (!isSameAddressRef.current && DivisionID2) {
//       setValue('DistrictID2', '');
//       setValue('TransientPoliceStationID', '');
//     }
//   }, [DivisionID2, setValue]);

//   useEffect(() => {
//     if (!isSameAddressRef.current && DistrictID2) {
//       setValue('TransientPoliceStationID', '');
//     }
//   }, [DistrictID2, setValue]);

//   // Handle same address checkbox
//   useEffect(() => {
//     isSameAddressRef.current = sameAddress;
//     if (isSameAddressRef.current) {
//       setValue('DivisionID2', DivisionID);
//       const districtTimer = setTimeout(() => {
//         setValue('DistrictID2', DistrictID);
//       }, 100);
//       const policeStationTimer = setTimeout(() => {
//         setValue('TransientPoliceStationID', permanentPoliceStationID);
//       }, 200);

//       setValue('TransientPost', watch('permanentPost'));
//       setValue('TransientVill', watch('permanentVill'));
//       return () => {
//         clearTimeout(districtTimer);
//         clearTimeout(districtTimer);
//         clearTimeout(policeStationTimer);
//       };
//     }
//   }, [
//     sameAddress,
//     setValue,
//     DivisionID,
//     DistrictID,
//     permanentPoliceStationID,
//     watch,
//   ]);

//   // Reset form on component mount
//   useEffect(() => {
//     reset({
//       UserName: '',
//       UserTypeID: '',
//       UserCode: '',
//       GenderID: dataGender?.Action || '',
//       FatherName: '',
//       MotherName: '',
//       DateOfBirth: '',
//       age: '',
//       NIDNO: '',
//       Mobile1: '',
//       Mobile2: '',
//       Relationship2: '',
//       Email: '',
//       BloodGroup: '',
//       DivisionID: '',
//       DistrictID: '',
//       permanentPoliceStationID: '',
//       permanentPost: '',
//       permanentVill: '',
//       sameAddress: false,
//       DivisionID2: '',
//       DistrictID2: '',
//       TransientPoliceStationID: '',
//       TransientPost: '',
//       TransientVill: '',
//     });
//   }, [reset, dataGender]);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setSelectedImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const onSubmit = async (data) => {
//     console.log('Submitting data:', data);
//     try {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       const dob = new Date(formattedDate);
//       dob.setHours(0, 0, 0, 0);

//       if (dob > today) {
//         await Swal.fire({
//           icon: 'warning',
//           title: 'তারিখ সঠিক নয়!',
//           text: 'জন্ম তারিখ আজকের তারিখের পর হতে পারবে না।',
//           confirmButtonText: 'ঠিক আছে',
//         });

//         return; // API call হবে না }
//       }
//       const payload = {
//         ...data,
//         DateOfBirth: formattedDate
//       }
//       const response = await postUser(payload).unwrap();

//       // ✅ Success SweetAlert
//       await Swal.fire({
//         icon: 'success',
//         title: 'Success!',
//         text: 'User created successfully',
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       reset(); // ✅ Form reset
//       console.log('User created:', response);
//     } catch (err) {
//       // ✅ Error SweetAlert
//       console.log(err)
//       Swal.fire({
//         icon: 'error',
//         title: 'Oops...',
//         text: err?.message || 'Something went wrong!',
//       });
//       console.error('Error creating user:', err);
//     }
//   };

//   const handleResetForm = () => {
//     reset();
//   };

//   return (
//     <FormProvider {...methods}>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="font-default bg-gray-50 min-h-screen py-6"
//       >
//         <div className="space-y-8">
//           {/* Section: User Info */}
//           <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
//             <h2 className="text-lg font-bold text-gray-700 border-b pb-2">
//               {translate('User Information')}
//             </h2>

//             <div className="grid md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//               <DefaultSelect
//                 type="number"
//                 label="User Type"
//                 options={userType}
//                 registerKey="UserTypeID"
//                 valueField="ID"
//                 nameField="TypeName"
//                 require="User Type Field is required!"
//                 labelColor="text-red-500"
//               />

//               <DefaultInput
//                 label="New User Code"
//                 type="number"
//                 placeholder="100149"
//                 registerKey="UserCode"
//                 require="Dakhela is required!"
//                 codeSetting={true}
//                 labelColor="text-red-500"
//                 defaultValue={userCodeData ? userCodeData : ''}
//                 disable={userCodeData ? true : false}
//               />

//               <DefaultSelect
//                 label="Gender"
//                 options={[
//                   { GenderID: 1, GenderName: 'ছেলে' },
//                   { GenderID: 2, GenderName: 'মহিলা' },
//                 ]}
//                 registerKey="GenderID"
//                 require="Gender Field is required!"
//                 nameField="GenderName"
//                 valueField="GenderID"
//                 labelColor="text-red-500"
//               />

//               <DefaultInput
//                 label="Name"
//                 type="text"
//                 registerKey="UserName"
//                 placeholder="Enter your name ..."
//                 require="Name is required!"
//                 labelColor="text-red-500"
//               />
//               {
//                 editMode == 1 ? "Changing username will take the qouta" : ""
//               }

//               <DefaultInput
//                 label={translate("Father's Name")}
//                 type="text"
//                 registerKey="FatherName"
//                 placeholder="Enter your father name ..."
//               />
//               <DefaultInput
//                 label={translate("Mother's Name")}
//                 type="text"
//                 registerKey="MotherName"
//                 placeholder="Enter your mother name ..."
//               />

//               <DatePickerOne
//                 dateCalender={translate("Date of Birth")}
//                 registerKey="DateOfBirth"
//                 className="w-full"
//                 placeholder="DD-MM-YYYY"
//               />
//               <DefaultInput
//                 label={translate("Age")}
//                 type="text"
//                 placeholder="Enter your age ..."
//                 registerKey="age"
//                 className="w-20"
//                 defaultValue={ageValue?.years ?? ''}
//                 disable
//               />

//               <DefaultInput
//                 label={translate("NID/Birth Registration No.")}
//                 type="text"
//                 registerKey="NIDNO"
//                 placeholder="Enter your NID No ..."
//               />

//               <PhoneNumberInput
//                 label={
//                   <span className="text-red-500">{translate("Mobile 1* (SMS will be sent)")}</span>
//                 }
//                 registerKey="Mobile1"
//                 require={true}
//                 minLength={11}
//                 maxLength={11}
//                 allowedPrefixes={[
//                   '013',
//                   '014',
//                   '015',
//                   '016',
//                   '017',
//                   '018',
//                   '019',
//                 ]}
//               />
//               <DefaultSelect
//                 label={translate("Relation")}
//                 type="number"
//                 options={studentRelation}
//                 valueField="RelationID"
//                 nameField="RelationName"
//                 registerKey="Relationship1"
//               />


//               <DefaultInput
//                 label={translate("Mobile 2")}
//                 type="number"
//                 registerKey="Mobile2"
//                 placeholder="ফোন নম্বর লিখুন"
//               />

//               <DefaultSelect
//                 label={translate("Relation")}
//                 type="number"
//                 options={studentRelation}
//                 valueField="RelationID"
//                 nameField="RelationName"
//                 registerKey="Relationship2"
//                 className="w-36"
//               />

//               <DefaultInput
//                 label={translate("Email")}
//                 type="email"
//                 registerKey="Email"
//                 placeholder="Enter your email address ..."
//               />

//               <DefaultSelect
//                 label={translate("Bload Group")}
//                 type="string"
//                 options={[
//                   { value: 'A+' },
//                   { value: 'A-' },
//                   { value: 'B+' },
//                   { value: 'B-' },
//                   { value: 'AB+' },
//                   { value: 'AB-' },
//                   { value: 'O+' },
//                   { value: 'O-' },
//                 ]}
//                 registerKey="BloodGroup"
//                 nameField="value"
//                 valueField="value"
//               />
//             </div>
//           </div>

//           {/* Section: Permanent Address */}
//           <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
//             <h2 className="text-lg font-bold text-gray-700 border-b pb-2 text-center">
//               {translate('Permanent Address')}
//             </h2>
//             <div className="grid md:grid-cols-5 gap-5">
//               <DefaultSelect
//                 label={translate("Division")}
//                 type="number"
//                 options={divisions}
//                 registerKey="DivisionID"
//                 valueField="DivisionID"
//                 nameField="DivisionName"
//               />
//               <DefaultSelect
//                 label={translate("District")}
//                 type="number"
//                 options={districts}
//                 registerKey="DistrictID"
//                 valueField="DistrictID"
//                 nameField="DistrictName"
//               />
//               <DefaultSelect
//                 label={translate("Police Station")}
//                 type="number"
//                 options={policeStations}
//                 registerKey="permanentPoliceStationID"
//                 valueField="PoliceStationID"
//                 nameField="PoliceStationName"
//               />
//               <DefaultInput
//                 label={translate("Post Office")}
//                 type="text"
//                 registerKey="permanentPost"
//                 placeholder="Enter your post office ..."
//               />
//               <DefaultInput
//                 label={translate("Village")}
//                 type="text"
//                 registerKey="permanentVill"
//                 placeholder="Enter your village ..."
//               />
//             </div>
//           </div>

//           {/* Section: Temporary Address */}
//           <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
//             <div className="flex items-center justify-center border-b pb-2">
//               <label className="absolute left-4 flex items-center gap-2 font-medium text-gray-700">
//                 <input
//                   id="sameAddress"
//                   type="checkbox"
//                   {...register('sameAddress')}
//                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 rounded"
//                 />
//                 <span>{translate("Click Here If Address Is Same")}</span>
//               </label>
//               <h2 className="text-lg font-bold text-gray-700">
//                 {translate("Present Address")}
//               </h2>
//             </div>

//             <div className="grid md:grid-cols-5 gap-5">
//               <DefaultSelect
//                 label={translate("Division")}
//                 type="number"
//                 options={divisions}
//                 registerKey="DivisionID2"
//                 valueField="DivisionID"
//                 nameField="DivisionName"
//               />
//               <DefaultSelect
//                 label={translate("District")}
//                 type="number"
//                 options={districts2}
//                 registerKey="DistrictID2"
//                 valueField="DistrictID"
//                 nameField="DistrictName"
//               />
//               <DefaultSelect
//                 label={translate("Police Station")}
//                 type="number"
//                 options={policeStations2}
//                 registerKey="TransientPoliceStationID"
//                 valueField="PoliceStationID"
//                 nameField="PoliceStationName"
//               />
//               <DefaultInput
//                 label={translate("Post Office")}
//                 type="text"
//                 registerKey="TransientPost"
//                 placeholder="Enter your post office ..."
//               />
//               <DefaultInput
//                 label={translate("Village")}
//                 type="text"
//                 registerKey="TransientVill"
//                 placeholder="Enter your village ..."
//               />
//             </div>
//             <div className="flex gap-3">
//               <ViewPermission
//                 permissionId={permissionsDataList.user_entry}
//                 permissionType="insert"
//               >
//                 <Button
//                   type="submit"
//                   className="px-6 py-2 rounded-lg bg-blue-600 text-white"
//                 >
//                   Save
//                 </Button>
//               </ViewPermission>

//               <Button
//                 type="button"
//                 className="px-6 py-2 rounded-lg bg-gray-400 text-white"
//                 onClick={handleResetForm}
//               >
//                 Reset
//               </Button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </FormProvider>
//   );
// };

// export default CreateUser;
