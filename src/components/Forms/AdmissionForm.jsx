import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import 'flatpickr/dist/flatpickr.css';
import { useNavigate } from 'react-router-dom';

import {
  useGetClassListQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';

import Swal from 'sweetalert2';
import useTranslate from '../../utils/Translate';

import {
  useGetFinancialStatusQuery,
  useGetLastAdmissionSerialQuery,
  useGetResidentialQuery,
} from '../../features/settings/settingsQuerySlice';
import { usePostStudentAdmissionInsertMutation } from '../../features/student/studentQuerySlice';
import { useGetSingleUserQuery } from '../../features/userInfo/userInfoQuerySlice';
import Loading from '../Loading/Loading';
import DatePickerOne from './DatePicker/DatePickerOne';
import DefaultInput from './DefaultInput';
import DefaultSelect from './DefaultSelect';

const AdmissionForm = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translate = useTranslate();

  const { defaultFormValue, singleUserstatus } = useSelector(
    (state) => state.userInfo
  );

  const [postStudentAdmission] = usePostStudentAdmissionInsertMutation();

  const { data } = useGetSingleUserQuery(userId, {
    skip: !userId, // ⭐ UserID না থাকলে API call হবে না
  });

  // Academic Session
  const {
    data: academicSession,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useGetSessionsQuery(undefined, { refetchOnMountOrArgChange: true });
  // Student Financial Status
  const {
    data: studentFinancialStatus,
    isLoading: isstudentFinancialStatusLoading,
    isError: isstudentFinancialStatusError,
  } = useGetFinancialStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  //residential
  const {
    data: residential,
    isLoading: isresidentialLoading,
    isError: isresidentialError,
  } = useGetResidentialQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Class List
  const {
    data: classList,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useGetClassListQuery(undefined, { refetchOnMountOrArgChange: true });

  // Sub Class List
  const {
    data: subClassList,
    isLoading: isSubClassLoading,
    isError: isSubClassError,
  } = useGetSubClassListQuery(undefined, { refetchOnMountOrArgChange: true });

  console.log(classList, subClassList, 'data');

  const methods = useForm();
  const { handleSubmit, reset, watch } = methods;

  // Reset form when user data loaded
  useEffect(() => {
    if (
      singleUserstatus === 'succeeded' &&
      defaultFormValue?.UserID == userId
    ) {
      reset(defaultFormValue);
    }
  }, [singleUserstatus, defaultFormValue, userId, reset]);

  // Filter Sub Class by ClassID with additional safety
  const [ClassID, SessionID] = watch(['ClassID', 'SessionID']);

  // ✅ Correct RTK Query Hook usage
  const { data: SerialData, error } = useGetLastAdmissionSerialQuery({
    ClassID,
    SessionID,
  });

  const filteredSubClassList = (subClassList || [])
    .filter((sub) => {
      // যদি selectedClassID না থাকে তাহলে সব সাবক্লাস দেখাবে
      if (!ClassID) return true;

      // টাইপ কনভার্সন সহ মিলチェック
      return sub?.ClassID?.toString() === ClassID.toString();
    })
    .map((sub) => ({
      SubClassID: sub.SubClassID,
      SubClassName: sub.SubClass,
      SubClassAra: sub.SubClassAra,
      SubClassEng: sub.SubClassEng,
      // প্রয়োজন হলে অন্যান্য ফিল্ডও যোগ করতে পারেন
      Serial: sub.Serial,
    }))
    .sort((a, b) => (a.Serial || 0) - (b.Serial || 0)); // সিরিয়াল অনুসারে সাজানো

  const AdmissionType = [
    { id: 1, name: 'New' },
    { id: 2, name: 'Old' },
  ];

  // Combined Loading & Error
  if (isSessionLoading || isClassLoading || isSubClassLoading) {
    return <Loading />;
  }

  if (isSessionError || isClassError || isSubClassError) {
    return <div>Error loading data!</div>;
  }

  const onSubmit = async (formData) => {
    try {
        const finalData = {
          ...formData,
          UserID: userId,
        };

      const response = await postStudentAdmission(finalData).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Student admission completed successfully',
        confirmButtonText: 'OK',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error?.data?.message || 'Something went wrong',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <DefaultInput
            registerKey="UserName"
            label="Student Name"
            placeholder="Student Name"
            require="Student Name is required"
            defaultValue={data?.UserName || ''}
            disable={true}
          />

          <DefaultInput
            registerKey="FatherName"
            label="Father Name"
            placeholder="Father Name"
            require="Father Name is required"
            defaultValue={data?.FatherName || ''}
            disable={true}
          />

          <DefaultInput
            registerKey="Mobile1"
            label="Mobile"
            placeholder="Mobile"
            require="Mobile is required"
            defaultValue={data?.Mobile1 || ''}
            disable={true}
          />

          <DatePickerOne
            registerKey="CreateAt"
            dateCalender="Entry Date"
            placeholder="Entry Date"
            require="Entry Date is required"
            disable={true}
          />

          <DefaultSelect
            options={academicSession}
            nameField="SessionName"
            valueField="SessionID"
            registerKey="SessionID"
            label="Session"
            require="Session is required"
          />

          <DefaultSelect
            options={classList}
            nameField="ClassName"
            valueField="ClassID"
            registerKey="ClassID"
            label="Admission Class"
            require="Class is required"
          />

          <DefaultSelect
            options={filteredSubClassList}
            nameField="SubClassName"
            valueField="SubClassID"
            registerKey="SubClassID"
            label="Admission Section"
            // require="Sub Class is required"
          />

          <DefaultInput
            type="text"
            registerKey="AdmissionSerial"
            label={translate('Admission Serial')}
            placeholder="ভর্তি সিরিয়াল নম্বর"
            require="This field is required!"
            defaultValue={SerialData?.nextSerial ?? ''}
            disable={SerialData?.nextSerial ? true : false}
          />

          <DefaultSelect
            options={studentFinancialStatus}
            nameField="FinancialName"
            valueField="SFTID"
            registerKey="SFTID"
            label="Financial Condition"
            require="Financial Condition is required"
          />

          <DefaultSelect
            options={residential}
            nameField="ResidentialName"
            valueField="RDID"
            registerKey="ResidentialStatusId"
            label="Living Condition"
            require="Living Condition is required"
          />

          <DefaultSelect
            options={AdmissionType}
            nameField="name"
            valueField="id"
            registerKey="NewOldId"
            label="Admission Type"
            require="Admission Type is required"
          />
        </div>

        <div className="text-center pt-6 pb-3">
          <button
            type="submit"
            className="rounded-md inline-flex items-center bg-theme-color text-white py-2 px-4 text-sm font-semibold"
          >
            {translate('Complete Admission')}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AdmissionForm;
