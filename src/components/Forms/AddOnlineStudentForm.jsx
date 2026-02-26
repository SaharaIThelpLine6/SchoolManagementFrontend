import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import 'flatpickr/dist/flatpickr.css';
import { useNavigate } from 'react-router-dom';
import {
  useAddStudentMutation,
  useGetClassQuery,
  useGetResidentialQuery,
} from '../../features/onlineAdmission/onlineAdmissionSlice';
import {
  fetchDidata,
  fetchSettingsFieldData,
  fetchThanadata,
  setEditMode,
} from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import convertBijoyToBengali from '../../utils/uniconveter';
import Button from '../Button/Button';
import DatePickerOne from './DatePicker/DatePickerOne';
import DefaultInput from './DefaultInput';
import DefaultSelect from './DefaultSelect';

const AddOnlineStudentForm = ({ schoolid }) => {
  const defaultData = useSelector(
    (state) => state.studentResultPublicView.defaultFormValue
  );
  const editMode = useSelector(
    (state) => state.studentResultPublicView.editMode
  );
  const [buttonDisable, setButtonDisable] = useState(false);
  const { data: classData, error: classError } = useGetClassQuery({
    id: schoolid,
  });
  const { data: residentialData, error: residentialError } =
    useGetResidentialQuery({ id: schoolid });
  const dispatch = useDispatch();
  const { gender, divition, district, thana, studentRelation, status, error } =
    useSelector((state) => state.studentResultPublicView);

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
    'DivisionID',
    'DistrictID',
    'DivisionID2',
    'DistrictID2',
    'permanentPoliceStationID',
    'sameAddress',
    'TransientPost',
    'TransientVill',
  ]);
  const [
    addStudent,
    { isLoading, isError, isSuccess, data: newApplicationResponse },
  ] = useAddStudentMutation();
  const isSameAddressRef = useRef(false);
  useEffect(() => {
    if (editMode === 0) {
      setValue('DistrictID', '');
      setValue('permanentPoliceStationID', '');
      if (DivisionID) {
        dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID }));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DivisionID === Number(numberStrP.slice(0, 1))) {
      } else {
        setValue('DistrictID', '');
        setValue('permanentPoliceStationID', '');
        if (DivisionID) {
          dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID }));
        }
      }
    }
  }, [DivisionID, setValue, editMode]);

  useEffect(() => {
    if (editMode === 0) {
      setValue('permanentPoliceStationID', '');
      if (DistrictID) {
        dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID }));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID.toString();
      if (DistrictID === Number(numberStrP.slice(0, 3))) {
      } else {
        setValue('permanentPoliceStationID', '');
        if (DistrictID) {
          dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID }));
        }
      }
    }
  }, [DistrictID, setValue, editMode]);

  // permanent address End

  //tempo adress start
  useEffect(() => {
    if (editMode === 0) {
      if (!isSameAddressRef.current) {
        setValue('DistrictID2', '');
        setValue('TransientPoliceStationID', '');
        if (DivisionID2) {
          dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID2 }));
        }
      } else {
        setValue('DistrictID2', DistrictID);
      }
    } else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DivisionID2 === Number(numberStrT.slice(0, 1))) {
      } else {
        if (!isSameAddressRef.current) {
          setValue('DistrictID2', '');
          setValue('TransientPoliceStationID', '');
          if (DivisionID2) {
            dispatch(fetchDidata({ madrasaId: schoolid, id: DivisionID2 }));
          }
        } else {
          setValue('DistrictID2', DistrictID);
        }
      }
    }
  }, [DivisionID2, setValue, editMode]);

  useEffect(() => {
    if (editMode === 0) {
      if (!isSameAddressRef.current) {
        setValue('TransientPoliceStationID', '');
        if (DistrictID2) {
          dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID2 }));
        }
      } else {
        setValue('TransientPoliceStationID', permanentPoliceStationID);
      }
    } else if (editMode === 2) {
      const numberStrT = defaultData.TransientPoliceStationID.toString();
      if (DistrictID2 === Number(numberStrT.slice(0, 3))) {
      } else {
        if (!isSameAddressRef.current) {
          setValue('TransientPoliceStationID', '');
          if (DistrictID2) {
            dispatch(fetchThanadata({ madrasaId: schoolid, id: DistrictID2 }));
          }
        } else {
          setValue('DistrictID2', DistrictID);
        }
      }
    }
  }, [DistrictID2, setValue, editMode]);
  //tempo adress End
  useEffect(() => {
    isSameAddressRef.current = sameAddress;
    // if (editMode === 0) {
    if (isSameAddressRef.current) {
      setValue('DivisionID2', DivisionID);
      setValue('DistrictID2', DistrictID);
      setValue('TransientPoliceStationID', permanentPoliceStationID);

      // setValue("permanentPost", TransientPost)
      // setValue("permanentVill", TransientVill)
      setValue('TransientPost', watch('permanentPost'));
      setValue('TransientVill', watch('permanentVill'));
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
    dispatch(fetchSettingsFieldData(schoolid));

    if (editMode === 0) {
      reset({
        UserName: '',
        GenderID: '',
        FatherName: '',
        MotherName: '',
        DateOfBirth: '',
        NIDNO: '',
        Mobile1: '',
        Relationship1: '',
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
        ClassID: '',
        ResidentialStatusId: '',
      });
    }
  }, [dispatch]);

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
        dispatch(
          fetchDidata({ madrasaId: schoolid, id: defaultFormData.DivisionID })
        ),
        dispatch(
          fetchDidata({ madrasaId: schoolid, id: defaultFormData.DivisionID2 })
        ),
        dispatch(
          fetchThanadata({
            madrasaId: schoolid,
            id: defaultFormData.DistrictID,
          })
        ),
        dispatch(
          fetchThanadata({
            madrasaId: schoolid,
            id: defaultFormData.DistrictID2,
          })
        ),
      ];

      Promise.all(promises)
        .then(() => {
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

  const onSubmit = async (data) => {
    setButtonDisable(true);
    try {
      // Convert all text fields to Bijoy encoding
      // const convertedData = Object.fromEntries(
      //   Object.entries(data).map(([key, value]) =>
      //     typeof value === 'string'
      //       ? [key, convertBijoyToBengali(value)]
      //       : [key, value]
      //   )
      // );

      await addStudent({ dataBody: data, id: schoolid }).unwrap();
    } catch (err) {
      setButtonDisable(false);
      console.error('Error submitting data:', err);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setButtonDisable(false);
      navigate(
        `/${schoolid}/online_admission/${newApplicationResponse?.data?.student.UserCode}`
      );
    }

    if (isError) {
      setButtonDisable(false);
      console.error('API call failed:', error);
    }
  }, [isSuccess, isError]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="font-lato pt-[100px] lg:pt-0 lg:mt-5 lg:ml-5 mb-20"
    >
      <h5 className="text-[30px] text-center font-bold mb-5 mt-2 font-SolaimanLipi">
        শুধুমাত্র নতুন শিক্ষার্থীদের জন্য আবেদন ফরম
      </h5>

      <div className="px-6 text-sm">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          <DefaultInput
            label="Name"
            require={'শিক্ষার্থীর নাম অবশ্যই লিখতে হবে'}
            type="text"
            registerKey="UserName"
          />

          <DefaultInput
            label="পিতার নাম"
            type="text"
            registerKey="FatherName"
          />

          <DefaultInput
            label="মাতার নাম"
            type="text"
            registerKey="MotherName"
          />

          <DefaultSelect
            label="লিঙ্গ"
            options={[{ID: 1, GenderName: "পুরুষ"}, {ID: 2, GenderName: "মহিলা"}]}
            registerKey="GenderID"
            require={'শিক্ষার্থীর লিঙ্গ নির্বাচন করতে হবে'}
            nameField="GenderName"
            valueField="ID"
          />

          <DatePickerOne
            dateCalender="জন্ম তারিখ"
            registerKey="DateOfBirth"
            require={'শিক্ষার্থীর জন্ম তারিখ নির্বাচন করতে হবে'}
          />

          <DefaultInput
            label="NID/জন্ম নিবন্ধন নং"
            type="text"
            registerKey="NIDNO"
          />

          {/* Mobile 1 with Relation */}
          <DefaultInput
            label={<span className="text-red-500">মোবাইল ১* (SMS যাবে)</span>}
            type="phone"
            registerKey="Mobile1"
            require={'অভিভাবক মোবাইল নাম্বার লিখতে হবে'}
          />

          <DefaultSelect
            label="Relationship 1"
            options={studentRelation}
            valueField="RelationID"
            nameField="RelationName"
            registerKey="Relationship1"
            require={'শিক্ষার্থীর অভিভাবক সম্পর্ক নির্বাচন করতে হবে'}
          />

          <DefaultInput label="মোবাইল ২" type="text" registerKey="Mobile2" />
          <DefaultSelect
            label="Relationship 2"
            options={studentRelation}
            valueField="RelationID"
            nameField="RelationName"
            registerKey="Relationship2"
          />

          <DefaultInput label="ই-মেইল" type="email" registerKey="Email" />

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

          {classData && (
            <DefaultSelect
              label="Class"
              options={classData}
              nameField="ClassName"
              valueField="ClassID"
              registerKey="ClassID"
              require={'শিক্ষার্থীর শ্রেণী নির্বাচন করতে হবে'}
              unicode
            />
          )}

          {residentialData && (
            <DefaultSelect
              label="Residential"
              options={residentialData}
              nameField="ResidentialName"
              valueField="RDID"
              registerKey="ResidentialStatusId"
              require={'শিক্ষার্থীর আবাসন নির্বাচন করতে হবে'}
            />
          )}
        </div>

        {/* Permanent Address */}
        <div className="mt-6">
          <h6 className="text-center font-bold font-noto mb-2 text-base">
            <span className="text-red-500">স্থায়ী ঠিকানা * :</span>
          </h6>
          <div className="grid md:grid-cols-5 gap-3">
            <DefaultSelect
              label="বিভাগ"
              options={divition}
              registerKey="DivisionID"
              valueField="DivisionID"
              nameField="DivisionName"
              require="বিভাগ নির্বাচন করতে হবে"
            />
            <DefaultSelect
              label="জেলা"
              options={district[DivisionID]}
              registerKey="DistrictID"
              valueField="DistrictID"
              nameField="DistrictName"
              require="জেলা নির্বাচন করতে হবে"
            />
            <DefaultSelect
              label="থানা"
              options={thana[DistrictID]}
              registerKey="permanentPoliceStationID"
              valueField="PoliceStationID"
              nameField="PoliceStationName"
              require="থানা নির্বাচন করতে হবে"
            />
            <DefaultInput
              label="ডাক"
              type="text"
              registerKey="permanentPost"
              require="ডাক নির্বাচন করতে হবে"
            />
            <DefaultInput
              label="গ্রাম"
              type="text"
              registerKey="permanentVill"
              require="গ্রাম নির্বাচন করতে হবে"
            />
          </div>
        </div>

        {/* Same Address Checkbox */}
        <div className="lg:flex justify-between items-center my-6 relative">
          <label className="flex items-center gap-2 font-noto">
            <input
              id="sameAddress"
              type="checkbox"
              {...register('sameAddress')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
            />
            ঠিকানা একই হলে এখানে ক্লিক করুন
          </label>
          <p className="text-base font-bold font-noto text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <span className="text-red-500">অস্থায়ী ঠিকানা *</span>
          </p>
        </div>

        {/* Temporary Address */}
        <div className="grid md:grid-cols-5 gap-3">
          <DefaultSelect
            label="বিভাগ"
            options={divition}
            registerKey="DivisionID2"
            valueField="DivisionID"
            nameField="DivisionName"
            require="বিভাগ নির্বাচন করতে হবে"
          />
          <DefaultSelect
            label="জেলা"
            options={district[DivisionID2]}
            registerKey="DistrictID2"
            valueField="DistrictID"
            nameField="DistrictName"
            require="জেলা নির্বাচন করতে হবে"
          />
          <DefaultSelect
            label="থানা"
            options={thana[DistrictID2]}
            registerKey="TransientPoliceStationID"
            valueField="PoliceStationID"
            nameField="PoliceStationName"
            require="থানা নির্বাচন করতে হবে"
          />
          <DefaultInput
            label="ডাক"
            type="text"
            registerKey="TransientPost"
            require="ডাক নির্বাচন করতে হবে"
          />
          <DefaultInput
            label="গ্রাম"
            type="text"
            registerKey="TransientVill"
            require="গ্রাম নির্বাচন করতে হবে"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end mb-10 mt-5">
          <Button
            className="w-full sm:w-auto"
            type="submit"
            disabled={buttonDisable}
          >
            দাখিল করুন
          </Button>
        </div>
      </div>
    </form>
  );
};
export default AddOnlineStudentForm;
