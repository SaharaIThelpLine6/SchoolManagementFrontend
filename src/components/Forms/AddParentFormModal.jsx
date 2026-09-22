import 'flatpickr/dist/flatpickr.css';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import DatePickerOne from './DatePicker/DatePickerOne';
import DefaultInput from './DefaultInput';
import DefaultSelect from './DefaultSelect';
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
import Button from '../Button/Button';
import PhoneNumberInput from './PhoneNumberInput';
import { permissionsDataList } from '../../Data/permissions';
import {
  useGetGuardianOccupationTypeQuery,
  useGetUserCodeCheckQuery,
  useGetUserTypesQuery,
  usePostUserMutation,
} from '../../features/userType/userTypeSlice';
import { usePermission } from '../../hooks/usePermission';
import { ViewPermission } from '../../Routes/ViewPermission';
import { calculateAge } from '../../utils/calculateAge';
import useTranslate from '../../utils/Translate';
import { useDispatch } from 'react-redux';   // ✅ added useDispatch
import { usePostGuardianInfoMutation } from '../../features/student/studentQuerySlice';
import { closeModal } from '../../features/modal/modalSlice';
import { toast } from 'react-toastify';

const AddParentFormModal = ({ userId }) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const dispatch = useDispatch();                        // ✅ dispatch hook
  const { hasPermission } = usePermission();

  // Step state for Wizard
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm({
    defaultValues: {
      GenderID: '',
      UserName: '',
      UserTypeID: 4,
      UserCode: '',
      FatherName: '',
      MotherName: '',
      DateOfBirth: '',
      age: '',
      NIDNO: '',
      Mobile1: '',
      Mobile2: '',
      Relationship1: '',
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
      Occupation: '',
      Relation: '',
    },
    mode: 'onTouched',
    shouldUnregister: false, // ⭐ unmounted fields এর value persist করবে
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
    ClassID,
  ] = watch([
    'DivisionID',
    'DistrictID',
    'DivisionID2',
    'DistrictID2',
    'permanentPoliceStationID',
    'sameAddress',
    'UserTypeID',
    'DateOfBirth',
    'ClassID',
  ]);

  const formattedDate = DateOfBirth
    ? new Date(
      DateOfBirth.getTime() - DateOfBirth.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split('T')[0]
    : '';



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
  const { data: guardianOccupationTypeData = [] } = useGetGuardianOccupationTypeQuery(undefined, {
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




  const [postGuardianInfo] = usePostGuardianInfoMutation();

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
      UserTypeID: 4,
      UserCode: '',
      GenderID: dataGender?.Action || '',
      FatherName: '',
      MotherName: '',
      DateOfBirth: '',
      age: '',
      NIDNO: '',
      Mobile1: '',
      Mobile2: '',
      Relationship1: '',
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
      Occupation: '',
      Relation: '',

    });
    setCurrentStep(1);
  }, [reset, dataGender]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);





  const onSubmit = async (data) => {

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
        DateOfBirth: formattedDate,
        StudentUserID: userId
      };
      console.log('payload:', payload);
      const response = await postGuardianInfo(payload).unwrap();

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully',
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      setCurrentStep(1);
      dispatch(closeModal());                     // ✅ FIXED: dispatched properly
      console.log('User created:', response);
    } catch (err) {
      console.log(err);
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
    setCurrentStep(1);
  };

  // --- Wizard Navigation Logic ---
  const steps = [
    { id: 1, name: 'ব্যক্তিগত তথ্য' },
    { id: 2, name: 'স্থায়ী ঠিকানা' },
    { id: 3, name: 'অস্থায়ী ঠিকানা' },
    { id: 4, name: 'অভিভাবক তথ্য' },
  ];

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ['UserCode', 'GenderID', "DateOfBirth", 'UserName', 'Mobile1'];
    } else if (currentStep === 2) {
      fieldsToValidate = [];
    } else if (currentStep === 3) {
      fieldsToValidate = [];
    } else if (currentStep === 4) {
      fieldsToValidate = [
        'SessionID',
        'ClassID',
        'SubClassID',
        'AdmissionSerial',
        'SFTID',
        'ResidentialStatusId',
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <FormProvider {...methods}>
      {/* Main Container - Full width */}
      <div className="font-SolaimanLipi mb-5 w-full">
        {/* Top Stepper Navigation */}
        <div className="w-full mb-6 bg-blue-600 rounded-xl overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 px-6 gap-4 md:gap-0 w-full">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className="flex items-center gap-3 w-full md:w-auto relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive
                      ? 'bg-yellow-500 text-[#115e59] scale-110 shadow-lg'
                      : isCompleted
                        ? 'bg-yellow-500 text-[#115e59]'
                        : 'border-gray-400 border text-white'
                      }`}
                  >
                    {step.id}
                  </div>
                  <span
                    className={`text-base font-bold transition-all duration-300 ${isActive
                      ? 'text-yellow-400'
                      : isCompleted
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                      }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-gray-400">
            <div
              className="h-full bg-yellow-500 transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        {/* <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6"> */}
        <form
          onSubmit={handleSubmit(
            onSubmit,
            (errors) => console.log('VALIDATION ERRORS:', errors)
          )}
        >
          {/* ============================= STEP 1: User Info ============================= */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 1 ? 'hidden' : ''}`}>
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                ১. ব্যক্তিগত তথ্য
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* ⭐ UserTypeID hidden input — field registered রাখার জন্য */}
              <input
                type="hidden"
                {...register('UserTypeID', { valueAsNumber: true })}
                value={1}
              />

              <DefaultInput
                label={<span className="text-red-500">দাখেলা</span>}
                type="number"
                placeholder=""
                registerKey="UserCode"
                require="Dakhela is required!"
                codeSetting={true}
                defaultValue={userCodeData ? userCodeData : ''}
                disable={userCodeData ? true : false}
              />

              <DefaultSelect
                label={<span className="text-red-500">লিঙ্গ</span>}
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
                label={<span className="text-red-500">পূর্ণ নাম (বাংলা)</span>}
                type="text"
                registerKey="UserName"
                placeholder="নাম লিখুন ..."
                require="Name is required!"
              />

              <DefaultInput
                label="পিতার নাম"
                type="text"
                registerKey="FatherName"
                placeholder="পিতার নাম লিখুন ..."
              />

              <DefaultInput
                label="মাতার নাম"
                type="text"
                registerKey="MotherName"
                placeholder="মাতার নাম লিখুন ..."
              />

              <DatePickerOne
                dateCalender="জন্ম তারিখ"
                registerKey="DateOfBirth"
                className="w-full"
                placeholder="DD-MM-YYYY"
                require
              />

              <DefaultInput
                label="Age"
                type="text"
                placeholder="Enter your age ..."
                registerKey="age"
                className="w-20"
                defaultValue={ageValue?.years ?? ''}
                disable
              />

              <DefaultInput
                label="এনআইডি/জন্ম নিবন্ধন নং"
                type="text"
                registerKey="NIDNO"
                placeholder="NID নম্বর লিখুন ..."
              />

              <PhoneNumberInput
                label={
                  <span className="text-red-500">
                    মোবাইল ১* (এসএমএস যাবে)
                  </span>
                }
                registerKey="Mobile1"
                require={true}
                minLength={11}
                maxLength={11}
                allowedPrefixes={[
                  '013',
                  '014',
                  '015',
                  '016',
                  '017',
                  '018',
                  '019',
                ]}
              />

              <DefaultSelect
                label="সম্পর্ক"
                options={studentRelation}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship1"
              />

              <DefaultInput
                label="মোবাইল ২"
                type="number"
                registerKey="Mobile2"
                placeholder="ফোন নম্বর লিখুন"
              />

              <DefaultSelect
                label="সম্পর্ক"
                options={studentRelation}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship2"
              />

              <DefaultSelect
                label="রক্তের গ্রুপ"
                options={[
                  { value: 'A+' },
                  { value: 'A-' },
                  { value: 'B+' },
                  { value: 'B-' },
                  { value: 'AB+' },
                  { value: 'AB-' },
                  { value: 'O+' },
                  { value: 'O-' },
                ]}
                registerKey="BloodGroup"
                nameField="value"
                valueField="value"
              />

              <DefaultInput
                label="ই-মেইল"
                type="email"
                registerKey="Email"
                placeholder="ইমেইল এড্রেস লিখুন ..."
              />
            </div>
          </div>

          {/* ============================= STEP 2: Permanent Address ============================= */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 2 ? 'hidden' : ''}`}>
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {translate('২. স্থায়ী ঠিকানা')}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <DefaultSelect
                label={translate('বিভাগ')}
                options={divisions}
                registerKey="DivisionID"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label={translate('জেলা')}
                options={districts}
                registerKey="DistrictID"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label={translate('থানা')}
                options={policeStations}
                registerKey="permanentPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label={translate('ডাক')}
                type="text"
                registerKey="permanentPost"
                placeholder="পোস্ট অফিস লিখুন ..."
              />
              <DefaultInput
                label={translate('গ্রাম')}
                type="text"
                registerKey="permanentVill"
                placeholder="গ্রামের নাম লিখুন ..."
              />
            </div>
          </div>

          {/* ============================= STEP 3: Temporary Address ============================= */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 3 ? 'hidden' : ''}`}>
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                />
                <span className="text-sm">
                  {translate('ঠিকানা একই হলে এখানে টিক করুন')}
                </span>
              </label>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <DefaultSelect
                label={translate('বিভাগ')}
                options={divisions}
                registerKey="DivisionID2"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label={translate('জেলা')}
                options={districts2}
                registerKey="DistrictID2"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label={translate('থানা')}
                options={policeStations2}
                registerKey="TransientPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label={translate('ডাক')}
                type="text"
                registerKey="TransientPost"
                placeholder="পোস্ট অফিস লিখুন ..."
              />
              <DefaultInput
                label={translate('গ্রাম')}
                type="text"
                registerKey="TransientVill"
                placeholder="গ্রামের নাম লিখুন ..."
              />
            </div>
          </div>

          {/* ============================= STEP 4: Admission Info ============================= */}
          <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 4 ? 'hidden' : ''}`}>
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM4.25 11.75a1 1 0 00-1 1v3a1 1 0 001 1h11a1 1 0 001-1v-3a1 1 0 00-1-1H4.25z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">
                {translate('৪. অভিভাবক তথ্য')}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <DefaultSelect
                label="সম্পর্ক"
                options={studentRelation}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relation"
                require="সম্পর্ক নির্বাচন করা আবশ্যক"
              />

              <DefaultSelect
                options={guardianOccupationTypeData ?? []}
                nameField="OccupationName"
                valueField="OccupationID"
                registerKey="Occupation"
                label="পেশা"
                require="পেশা নির্বাচন করা আবশ্যক"
              />

            </div>
          </div>

          {/* ============================= Navigation & Action Buttons ============================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            {/* Left Side: Reset */}
            <button
              type="button"
              onClick={handleResetForm}
              className="text-gray-500 hover:text-green-700 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  পূর্ববর্তী
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                >
                  পরবর্তী
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              ) : (
                <ViewPermission
                  permissionId={permissionsDataList.user_entry}
                  permissionType="insert"
                >
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    সেভ করুন
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
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

export default AddParentFormModal;