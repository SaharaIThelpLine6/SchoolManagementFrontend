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

const CreateUser = ({ pageTitle }) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

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
    DateOfBirth
      ? new Date(DateOfBirth.getTime() - DateOfBirth.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0]
      : "";
  // console.log(DateOfBirth, "DateOfBirth")
  // console.log(formattedDate, "formattedDate")

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
  }, [reset, dataGender]);

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

      const payload = {
        ...data,
        DateOfBirth: formattedDate
      }
      const response = await postUser(payload).unwrap();

      // ✅ Success SweetAlert
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'User created successfully',
        timer: 2000,
        showConfirmButton: false,
      });

      // reset(); // ✅ Form reset
      console.log('User created:', response);
    } catch (err) {
      // ✅ Error SweetAlert
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

            <div className="grid md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <DefaultSelect
                type="number"
                label="User Type"
                options={userType}
                registerKey="UserTypeID"
                valueField="ID"
                nameField="TypeName"
                require="User Type Field is required!"
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
                defaultValue={userCodeData ? userCodeData : ''}
                disable={userCodeData ? true : false}
              />

              <DefaultSelect
                label="Gender"
                options={[
                  { GenderID: 1, GenderName: 'ছেলে' },
                  { GenderID: 2, GenderName: 'মেয়ে' },
                ]}
                registerKey="GenderID"
                require="Gender Field is required!"
                nameField="GenderName"
                valueField="GenderID"
                labelColor="text-red-500"
              />

              <DefaultInput
                label="Name"
                type="text"
                registerKey="UserName"
                placeholder="Enter your name ..."
                require="Name is required!"
                labelColor="text-red-500"
              />

              <DefaultInput
                label="পিতার নাম"
                type="text"
                registerKey="FatherName"
                placeholder="Enter your father name ..."
              />
              <DefaultInput
                label="মাতার নাম"
                type="text"
                registerKey="MotherName"
                placeholder="Enter your mother name ..."
              />

              <DatePickerOne
                dateCalender="জন্ম তারিখ"
                registerKey="DateOfBirth"
                require="Required!"
                className="w-full"
                placeholder="DD-MM-YYYY"
              />
              <DefaultInput
                label="বয়স"
                type="text"
                placeholder="Enter your age ..."
                registerKey="age"
                className="w-20"
                defaultValue={ageValue?.years ?? ''}
                disable
              />

              <DefaultInput
                label="NID/জন্ম নিবন্ধন নং"
                type="text"
                registerKey="NIDNO"
                placeholder="Enter your NID No ..."
              />

              <PhoneNumberInput
                label={
                  <span className="text-red-500">মোবাইল ১* (SMS যাবে)</span>
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
                type="number"
                options={studentRelation}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship1"
              />

              <PhoneNumberInput
                label="মোবাইল ২"
                registerKey="Mobile2"
                // require={true}
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
                type="number"
                options={studentRelation}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship2"
                className="w-36"
              />

              <DefaultInput
                label="ই-মেইল"
                type="email"
                registerKey="Email"
                placeholder="Enter your email address ..."
              />

              <DefaultSelect
                label="রক্তের গ্রুপ"
                type="string"
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
                options={divisions}
                registerKey="DivisionID"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label="জেলা"
                type="number"
                options={districts}
                registerKey="DistrictID"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label="থানা"
                type="number"
                options={policeStations}
                registerKey="permanentPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label="ডাক"
                type="text"
                registerKey="permanentPost"
                placeholder="Enter your post office ..."
              />
              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="permanentVill"
                placeholder="Enter your village ..."
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
                  {...register('sameAddress')}
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
                options={divisions}
                registerKey="DivisionID2"
                valueField="DivisionID"
                nameField="DivisionName"
              />
              <DefaultSelect
                label="জেলা"
                type="number"
                options={districts2}
                registerKey="DistrictID2"
                valueField="DistrictID"
                nameField="DistrictName"
              />
              <DefaultSelect
                label="থানা"
                type="number"
                options={policeStations2}
                registerKey="TransientPoliceStationID"
                valueField="PoliceStationID"
                nameField="PoliceStationName"
              />
              <DefaultInput
                label="ডাক"
                type="text"
                registerKey="TransientPost"
                placeholder="Enter your post office ..."
              />
              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="TransientVill"
                placeholder="Enter your village ..."
              />
            </div>
            <div className="flex gap-3">
              <ViewPermission
                permissionId={permissionsDataList.user_entry}
                permissionType="insert"
              >
                <Button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Save
                </Button>
              </ViewPermission>

              <Button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-400 text-white"
                onClick={handleResetForm}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CreateUser;
