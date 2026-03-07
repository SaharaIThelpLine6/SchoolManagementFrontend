import 'flatpickr/dist/flatpickr.css';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import PhoneNumberInput from '../../components/Forms/PhoneNumberInput';
import {
  useGetAllGendersQuery,
  useGetCodeSettingsQuery,
  useGetDistrictsQuery,
  useGetDivisionsQuery,
  useGetPoliceStationsQuery,
  useGetSettingsQuery,
  useGetStudentRelationsQuery,
} from '../../features/settings/settingsQuerySlice';
import { setEditUserID } from '../../features/settings/settingsSlice';
import {
  useGetUserCodeCheckQuery,
  useGetUserTypesQuery,
  useUpdateUserMutation,
} from '../../features/userType/userTypeSlice';
import useTranslate from '../../utils/Translate';
import { calculateAge } from '../../utils/calculateAge';
import { extractLocationCodes } from '../../utils/locationUtils';

const UpdateUser = ({ singleUserData }) => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const methods = useForm();
  const [showLoading, setShowLoading] = useState(true);

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

  const [updateUser] = useUpdateUserMutation();

  const settingsArray = infoSettings?.data || [];
  const dataGender = settingsArray.find((c) => c.ID === 28);

  const isSameAddressRef = useRef(false);

  useEffect(() => {
    if (!singleUserData) return;

    const { DivisionID, DistrictID, PoliceStationID } = extractLocationCodes(
      singleUserData?.permanentPoliceStationID
    );

    const {
      DivisionID: DivisionID2,
      DistrictID: DistrictID2,
      PoliceStationID: PoliceStationID2,
    } = extractLocationCodes(singleUserData?.TransientPoliceStationID);
    // basic fields first
    setValue('UserTypeID', singleUserData?.UserTypeID);
    setValue('DateOfBirth', singleUserData?.DateOfBirth);
    setValue('GenderID', singleUserData?.GenderID);
    setValue('Relationship1', singleUserData?.Relationship1);
    setValue('Relationship2', singleUserData?.Relationship2);
    setValue('BloodGroup', singleUserData?.BloodGroup);

    const permanentTimer = setTimeout(() => {
      // lazy location loading (permanent)
      setValue('DivisionID', DivisionID);

      // Wait for division to load districts
      const districtTimer = setTimeout(() => {
        setValue('DistrictID', DistrictID);

        // Wait for district to load police stations
        const policeTimer = setTimeout(() => {
          setValue('permanentPoliceStationID', PoliceStationID);
          setValue('permanentPost', singleUserData?.permanentPost);
          setValue('permanentVill', singleUserData?.permanentVill);
        }, 400);

        return () => clearTimeout(policeTimer);
      }, 200);
      return () => clearTimeout(districtTimer);
    }, 100);
    // lazy location loading (transient)
    const transientTimer = setTimeout(() => {
      setValue('DivisionID2', DivisionID2);

      const transientDistrictTimer = setTimeout(() => {
        setValue('DistrictID2', DistrictID2);

        const transientPoliceTimer = setTimeout(() => {
          setValue('TransientPoliceStationID', PoliceStationID2);
          setValue('TransientPost', singleUserData?.TransientPost);
          setValue('TransientVill', singleUserData?.TransientVill);
        }, 400);

        return () => clearTimeout(transientPoliceTimer);
      }, 200);

      return () => clearTimeout(transientDistrictTimer);
    }, 100);

    return () => {
      clearTimeout(permanentTimer);
      clearTimeout(transientTimer);
    };
  }, [singleUserData, setValue]);

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
    console.log("Submitting data:", data);

    // ✅ Date format fix
    const formattedDate = data.DateOfBirth
      ? new Date(data.DateOfBirth).toLocaleDateString("en-CA")
      : "";

    // ✅ Final payload
    const payload = {
      ...data,
      DateOfBirth: formattedDate,
    };

    console.log("payload:", payload);

    try {
      const response = await updateUser({
        id: singleUserData.UserID,
        payload: payload,
      }).unwrap();

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      reset();
      dispatch(setEditUserID(null));

      console.log("User updated:", response);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: err?.data?.message || "Something went wrong!",
      });

      console.error("Error updating user:", err);
    }
  };

  const handleResetForm = () => {
    dispatch(setEditUserID(null));
    reset();
  };

  useEffect(() => {
    // কমপক্ষে 1.5 সেকেন্ড loading দেখাবে
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);
  });
  // ✅ Loading state UI
  if (showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 border-solid"></div>
        <p className="mt-3 text-gray-600 font-medium">ডেটা লোড হচ্ছে...</p>
      </div>
    );
  }
  return (
    // <>
    //   <h1>{singleUserData?.UserName}</h1>
    // </>
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
                require="User Type Field is required!"
                labelColor="text-red-500"
              />
              <DefaultInput
                label="User Code"
                type="number"
                placeholder="100149"
                registerKey="UserCode"
                require="Dakhela is required!"
                // codeSetting={true}
                labelColor="text-red-500"
                // defaultValue={userCodeData ? userCodeData : ''}
                defaultValue={singleUserData?.UserCode || ''}
                disable
              />

              <DefaultSelect
                label="Gender"
                options={gender}
                registerKey="GenderID"
                require="Gender Field is required!"
                nameField="GenderName"
                valueField="ID"
                labelColor="text-red-500"
              />

              <DefaultInput
                label="Name"
                type="text"
                registerKey="UserName"
                placeholder="Enter your name ..."
                require="Name is required!"
                labelColor="text-red-500"
                defaultValue={singleUserData?.UserName || ''}
              />

              <DefaultInput
                label="পিতার নাম"
                type="text"
                registerKey="FatherName"
                placeholder="Enter your father name ..."
                defaultValue={singleUserData?.FatherName || ''}
              />
              <DefaultInput
                label="মাতার নাম"
                type="text"
                registerKey="MotherName"
                placeholder="Enter your mother name ..."
                defaultValue={singleUserData?.MotherName || ''}
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
                defaultValue={singleUserData?.NIDNO || ''}
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
                defaultValue={singleUserData?.Mobile1 || ''}
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
                defaultValue={singleUserData?.Mobile2 || ''}
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
                defaultValue={singleUserData?.Email || ''}
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
                defaultValue={singleUserData?.permanentPost || ''}
              />
              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="permanentVill"
                placeholder="Enter your village ..."
                defaultValue={singleUserData?.permanentVill || ''}
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
                defaultValue={singleUserData?.TransientPost || ''}
              />

              <DefaultInput
                label="গ্রাম"
                type="text"
                registerKey="TransientVill"
                placeholder="Enter your village ..."
                defaultValue={singleUserData?.TransientVill || ''}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </Button>
              <Button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-400 text-white"
                onClick={handleResetForm}
              >
                Cencel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateUser;
