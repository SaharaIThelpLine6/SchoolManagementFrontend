import 'flatpickr/dist/flatpickr.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../Button/Button';
import DatePickerOne from './DatePicker/DatePickerOne';
import DefaultInput from './DefaultInput';
import DefaultSelect from './DefaultSelect';
import PhoneNumberInput from './PhoneNumberInput';
import { permissionsDataList } from '../../Data/permissions';
import { closeModal } from '../../features/modal/modalSlice';
import {
  useGetAllGendersQuery,
  useGetCodeSettingsQuery,
  useGetDistrictsQuery,
  useGetDivisionsQuery,
  useGetPoliceStationsQuery,
  useGetSettingsQuery,
  useGetStudentRelationsQuery,
} from '../../features/settings/settingsQuerySlice';
import {
  useGetUserCodeCheckQuery,
  useGetUserTypesQuery,
} from '../../features/userType/userTypeSlice';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '../../features/student/studentQuerySlice';
import { usePermission } from '../../hooks/usePermission';
import { ViewPermission } from '../../Routes/ViewPermission';
import { calculateAge } from '../../utils/calculateAge';
import { extractLocationCodes } from '../../utils/locationUtils';
import useTranslate from '../../utils/Translate';

const UpdateStudentFormModal = ({ userId }) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermission();

  const isEditMode = Boolean(userId);
  console.log(isEditMode, 'isEditMode');

  const [currentStep, setCurrentStep] = useState(1);
  const [showLoading, setShowLoading] = useState(isEditMode);

  /* ============================================================
     DEFAULT VALUES
  ============================================================ */
  const defaultValues = {
    GenderID: '',
    UserName: '',
    UserTypeID: 1,
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
  };

  const methods = useForm({
    defaultValues,
    mode: 'onTouched',
    shouldUnregister: false,
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

  /* ============================================================
     HELPERS
  ============================================================ */
  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
  };

  const formattedDate = formatDate(DateOfBirth);
  const ageValue = calculateAge(DateOfBirth);

  /* ============================================================
     MUTATIONS
  ============================================================ */

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isSubmitting = isUpdating;

  /* ============================================================
     GET USER BY ID (edit mode)
  ============================================================ */
  const {
    data: userInfoRes,
    isLoading: isLoadingUserInfo,
    isFetching: isFetchingUserInfo,
  } = useGetUserByIdQuery(userId, {
    skip: !isEditMode,
    refetchOnMountOrArgChange: true,
  });

  const userData = useMemo(
    () => (isEditMode ? userInfoRes?.data : null),
    [isEditMode, userInfoRes]
  );

  console.log('userData:', userData);

  /* ============================================================
     SETTINGS QUERIES
  ============================================================ */
  const { data: codeSettings = [] } = useGetCodeSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: studentRelation = [] } = useGetStudentRelationsQuery(
    undefined,
    { refetchOnMountOrArgChange: true }
  );
  const { data: userType = [] } = useGetUserTypesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: gender = [] } = useGetAllGendersQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: infoSettings = [] } = useGetSettingsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: userCodeCheck = {} } = useGetUserCodeCheckQuery(UserTypeID, {
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
  const { data: policeStations2 = [] } = useGetPoliceStationsQuery(DistrictID2, {
    skip: !DistrictID2,
  });

  const settingsArray = infoSettings?.data || [];
  const dataGender = settingsArray.find((c) => c.ID === 28);

  const isSameAddressRef = useRef(false);

  /* ============================================================
     USER CODE DERIVATION
  ============================================================ */
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

  /* ============================================================
     ⭐ POPULATE FORM IN EDIT MODE
  ============================================================ */
  useEffect(() => {
    if (!isEditMode || !userData) return;

    setShowLoading(true);

    // Parse location codes from police station IDs (e.g. 202002)
    const {
      DivisionID: permDivision,
      DistrictID: permDistrict,
      PoliceStationID: permPolice,
    } = extractLocationCodes(userData?.permanentPoliceStationID);

    const {
      DivisionID: transDivision,
      DistrictID: transDistrict,
      PoliceStationID: transPolice,
    } = extractLocationCodes(userData?.TransientPoliceStationID);

    /* ---------- Reset all scalar fields ---------- */
    reset({
      UserName: userData?.UserName ?? '',
      FatherName: userData?.FatherName ?? '',
      MotherName: userData?.MotherName ?? '',
      GenderID: userData?.GenderID ?? '',
      UserTypeID: userData?.UserTypeID ?? 1,
      UserCode: userData?.UserCode ?? '',
      DateOfBirth: formatDate(userData?.DateOfBirth),
      age: '',
      NIDNO: userData?.NIDNO ?? '',
      Mobile1: userData?.Mobile1 ?? '',
      Mobile2: userData?.Mobile2 ?? '',
      Relationship1: userData?.Relationship1 ?? '',
      Relationship2: userData?.Relationship2 ?? '',
      Email: userData?.Email ?? '',
      BloodGroup: userData?.BloodGroup ?? '',

      // Location placeholders
      DivisionID: '',
      DistrictID: '',
      permanentPoliceStationID: '',
      permanentPost: userData?.permanentPost ?? '',
      permanentVill: userData?.permanentVill ?? '',

      sameAddress: false,
      DivisionID2: '',
      DistrictID2: '',
      TransientPoliceStationID: '',
      TransientPost: userData?.TransientPost ?? '',
      TransientVill: userData?.TransientVill ?? '',
    });

    isSameAddressRef.current = false;

    /* ---------- Permanent address lazy loading ---------- */
    const permanentTimer = setTimeout(() => {
      setValue('DivisionID', permDivision);

      const districtTimer = setTimeout(() => {
        setValue('DistrictID', permDistrict);

        const policeTimer = setTimeout(() => {
          setValue('permanentPoliceStationID', permPolice);
        }, 400);

        return () => clearTimeout(policeTimer);
      }, 200);

      return () => clearTimeout(districtTimer);
    }, 100);

    /* ---------- Transient address lazy loading ---------- */
    const transientTimer = setTimeout(() => {
      setValue('DivisionID2', transDivision);

      const transientDistrictTimer = setTimeout(() => {
        setValue('DistrictID2', transDistrict);

        const transientPoliceTimer = setTimeout(() => {
          setValue('TransientPoliceStationID', transPolice);
        }, 400);

        return () => clearTimeout(transientPoliceTimer);
      }, 200);

      return () => clearTimeout(transientDistrictTimer);
    }, 100);

    /* ---------- Hide loading ---------- */
    const hideTimer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => {
      clearTimeout(permanentTimer);
      clearTimeout(transientTimer);
      clearTimeout(hideTimer);
    };
  }, [userData, isEditMode, reset, setValue]);

  /* ============================================================
     DEFAULT GENDER (insert mode)
  ============================================================ */
  useEffect(() => {
    if (isEditMode) return;
    if (dataGender?.Action && !watch('GenderID')) {
      setValue('GenderID', dataGender.Action, { shouldValidate: true });
    }
  }, [dataGender, setValue, watch, isEditMode]);

  /* ============================================================
     ADDRESS WATCHERS
  ============================================================ */
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isEditMode) {
      const timer = setTimeout(() => {
        isInitializedRef.current = true;
      }, 1000);
      return () => clearTimeout(timer);
    }
    isInitializedRef.current = true;
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode && !isInitializedRef.current) return;
    if (DivisionID) {
      setValue('DistrictID', '');
      setValue('permanentPoliceStationID', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DivisionID]);

  useEffect(() => {
    if (isEditMode && !isInitializedRef.current) return;
    if (DistrictID) {
      setValue('permanentPoliceStationID', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DistrictID]);

  useEffect(() => {
    if (!isSameAddressRef.current && DivisionID2) {
      setValue('DistrictID2', '');
      setValue('TransientPoliceStationID', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DivisionID2]);

  useEffect(() => {
    if (!isSameAddressRef.current && DistrictID2) {
      setValue('TransientPoliceStationID', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DistrictID2]);

  /* ============================================================
     SAME ADDRESS CHECKBOX
  ============================================================ */
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

  /* ============================================================
     RESET ON MOUNT (insert mode)
  ============================================================ */
  useEffect(() => {
    if (isEditMode) return;
    reset({
      ...defaultValues,
      GenderID: dataGender?.Action || '',
    });
    setCurrentStep(1);
    isInitializedRef.current = true;
  }, [reset, dataGender, isEditMode]);

  /* ============================================================
     SCROLL TOP ON STEP CHANGE
  ============================================================ */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  /* ============================================================
     SUBMIT
  ============================================================ */
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

      // ✅ UserCode theke number convert kora (API response e number hoy)
      const payload = {
        ...data,
        UserCode: data.UserCode ? Number(data.UserCode) : null,
        UserTypeID: 1,
        DateOfBirth: formattedDate,
        NewOldId: 1,
        IsActive: 1,
      };

      console.log('payload:', payload);

      let response;

      if (isEditMode) {
        payload.UserID = Number(userId);
        response = await updateUser({
          userId: Number(userId),
          body: payload,
        }).unwrap();

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Student updated successfully',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      reset(defaultValues);
      setCurrentStep(1);
      dispatch(closeModal());


    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text:
          err?.data?.error ||
          err?.data?.message ||
          err?.message ||
          'Something went wrong!',
      });
      console.error('Error saving student:', err);
    }
  };

  /* ============================================================
     RESET FORM
  ============================================================ */
  const handleResetForm = () => {
    if (isEditMode && userData) {
      setShowLoading(true);

      const {
        DivisionID: permDivision,
        DistrictID: permDistrict,
        PoliceStationID: permPolice,
      } = extractLocationCodes(userData?.permanentPoliceStationID);

      const {
        DivisionID: transDivision,
        DistrictID: transDistrict,
        PoliceStationID: transPolice,
      } = extractLocationCodes(userData?.TransientPoliceStationID);

      reset({
        UserName: userData?.UserName ?? '',
        FatherName: userData?.FatherName ?? '',
        MotherName: userData?.MotherName ?? '',
        GenderID: userData?.GenderID ?? '',
        UserTypeID: userData?.UserTypeID ?? 1,
        UserCode: userData?.UserCode ?? '',
        DateOfBirth: formatDate(userData?.DateOfBirth),
        age: '',
        NIDNO: userData?.NIDNO ?? '',
        Mobile1: userData?.Mobile1 ?? '',
        Mobile2: userData?.Mobile2 ?? '',
        Relationship1: userData?.Relationship1 ?? '',
        Relationship2: userData?.Relationship2 ?? '',
        Email: userData?.Email ?? '',
        BloodGroup: userData?.BloodGroup ?? '',
        DivisionID: '',
        DistrictID: '',
        permanentPoliceStationID: '',
        permanentPost: userData?.permanentPost ?? '',
        permanentVill: userData?.permanentVill ?? '',
        sameAddress: false,
        DivisionID2: '',
        DistrictID2: '',
        TransientPoliceStationID: '',
        TransientPost: userData?.TransientPost ?? '',
        TransientVill: userData?.TransientVill ?? '',
      });

      setTimeout(() => {
        setValue('DivisionID', permDivision);
        setTimeout(() => {
          setValue('DistrictID', permDistrict);
          setTimeout(() => {
            setValue('permanentPoliceStationID', permPolice);
          }, 400);
        }, 200);
      }, 100);

      setTimeout(() => {
        setValue('DivisionID2', transDivision);
        setTimeout(() => {
          setValue('DistrictID2', transDistrict);
          setTimeout(() => {
            setValue('TransientPoliceStationID', transPolice);
          }, 400);
        }, 200);
      }, 100);

      setTimeout(() => setShowLoading(false), 1500);
    } else {
      reset(defaultValues);
    }
    setCurrentStep(1);
  };

  /* ============================================================
     WIZARD
  ============================================================ */
  const steps = [
    { id: 1, name: 'ব্যক্তিগত তথ্য' },
    { id: 2, name: 'স্থায়ী ঠিকানা' },
    { id: 3, name: 'অস্থায়ী ঠিকানা' },
  ];

  const handleNext = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ['GenderID', 'UserName', 'Mobile1'];
    } else if (currentStep === 2) {
      fieldsToValidate = [];
    } else if (currentStep === 3) {
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

  /* ============================================================
     LOADING UI
  ============================================================ */
  if (
    isEditMode &&
    (isLoadingUserInfo || isFetchingUserInfo || showLoading || !userData)
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <p className="mt-3 text-gray-600 font-medium">ডেটা লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="font-hind mb-5 w-full">
        {/* ================= Stepper ================= */}
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

          <div className="w-full h-1.5 bg-gray-400">
            <div
              className="h-full bg-yellow-500 transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          {/* ============================= STEP 1 ============================= */}
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 1 ? 'hidden' : ''
              }`}
          >
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
              <input
                type="hidden"
                {...register('UserTypeID', { valueAsNumber: true })}
                value={1}
              />
              {
                !isEditMode &&
                <DefaultInput
                  label={<span className="text-red-500">দাখেলা</span>}
                  type="number"
                  placeholder="100149"
                  registerKey="UserCode"
                  require="Dakhela is required!"
                  codeSetting={true}
                  defaultValue={
                    userData?.UserCode ? String(userData.UserCode) : ''
                  }
                  disable={userCodeData ? true : false}
                />
              }
              {
                isEditMode &&
                <DefaultInput
                  label={<span className="text-red-500">দাখেলা</span>}
                  type="number"
                  placeholder="100149"
                  registerKey="UserCode"
                  require="Dakhela is required!"
                  // codeSetting={true}
                  defaultValue={
                    userData?.UserCode ? String(userData.UserCode) : ''
                  }
                />
              }

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

              <div>
                <DefaultInput
                  label={<span className="text-red-500">নাম</span>}
                  type="text"
                  registerKey="UserName"
                  placeholder="নাম লিখুন ..."
                  require="Name is required!"
                  defaultValue={userData?.UserName || ''}
                />
                <p className='text-rose-600 text-[13px] pt-1'> নাম এডিটের ক্ষেত্রে ১ টি কোটা কর্তন হবে</p>
              </div>
              <DefaultInput
                label="পিতার নাম"
                type="text"
                registerKey="FatherName"
                placeholder="পিতার নাম লিখুন ..."
                defaultValue={userData?.FatherName || ''}
              />

              <DefaultInput
                label="মাতার নাম"
                type="text"
                registerKey="MotherName"
                placeholder="মাতার নাম লিখুন ..."
                defaultValue={userData?.MotherName || ''}
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
                defaultValue={userData?.NIDNO || ''}
              />

              <PhoneNumberInput
                label={
                  <span className="text-red-500">
                    মোবাইল ১ (এসএমএস যাবে)
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
                defaultValue={userData?.Mobile1 || ''}
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
                defaultValue={userData?.Mobile2 || ''}
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
                defaultValue={userData?.Email || ''}
              />
            </div>
          </div>

          {/* ============================= STEP 2 ============================= */}
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 2 ? 'hidden' : ''
              }`}
          >
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
                defaultValue={userData?.permanentPost || ''}
              />
              <DefaultInput
                label={translate('গ্রাম')}
                type="text"
                registerKey="permanentVill"
                placeholder="গ্রামের নাম লিখুন ..."
                defaultValue={userData?.permanentVill || ''}
              />
            </div>
          </div>

          {/* ============================= STEP 3 ============================= */}
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in w-full ${currentStep !== 3 ? 'hidden' : ''
              }`}
          >
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
                defaultValue={userData?.TransientPost || ''}
              />
              <DefaultInput
                label={translate('গ্রাম')}
                type="text"
                registerKey="TransientVill"
                placeholder="গ্রামের নাম লিখুন ..."
                defaultValue={userData?.TransientVill || ''}
              />
            </div>
          </div>

          {/* ============================= NAVIGATION ============================= */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
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

              {currentStep < 3 ? (
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
                  permissionType={isEditMode ? 'edit' : 'insert'}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {isSubmitting
                      ? isEditMode
                        ? 'আপডেট হচ্ছে...'
                        : 'সেভ হচ্ছে...'
                      : isEditMode
                        ? 'আপডেট করুন'
                        : 'সেভ করুন'}
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

export default UpdateStudentFormModal;