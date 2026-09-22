import { useCallback, useEffect, useState } from 'react';
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

import { Buffer } from 'buffer';
import { useGetSearchStudentWithUserQuery } from '../../features/feeCollection/feeCollectionSlice';
import {
  useGetFinancialStatusQuery,
  useGetLastAdmissionSerialQuery,
  useGetResidentialQuery,
} from '../../features/settings/settingsQuerySlice';
import { usePostStudentAdmissionInsertMutation } from '../../features/student/studentQuerySlice';
import { useGetSingleUserQuery } from '../../features/userInfo/userInfoQuerySlice';
import { showModal } from '../../utils/ModalControlar';
import Button from '../Button/Button';
import SvgIcon from '../icons/SvgIcon';
import Loading from '../Loading/Loading';
import DefaultRadio from '../Radio/DefaultRadio';
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

  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  const [postStudentAdmission] = usePostStudentAdmissionInsertMutation();

  // ✅ Filter Data State
  const [filterData, setFilterData] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [lastSearchedCode, setLastSearchedCode] = useState('');
  const [logo, setLogo] = useState(null);

  // ✅ Search Query
  const {
    data: searchUserInfo = { data: [] },
    error: searchError,
    isLoading: userInfoLoading,
    isError: isSearchError,
    refetch: searchRefetch,
  } = useGetSearchStudentWithUserQuery(filterData, {
    skip: !filterData,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // console.log(searchUserInfo, 'searchUserInfo');

  const { data } = useGetSingleUserQuery(userId, {
    skip: !userId,
  });

  // Academic Session
  const {
    data: academicSession,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useGetSessionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const activeSession = academicSession?.find(
    (item) => item.SessionStatus === 1
  );

  // Student Financial Status
  const {
    data: studentFinancialStatus,
    isLoading: isstudentFinancialStatusLoading,
    isError: isstudentFinancialStatusError,
  } = useGetFinancialStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Residential
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

  const methods = useForm();
  const { handleSubmit, reset, watch, getValues, setValue } = methods;

  // ✅ Filter Sub Class by ClassID
  const [ClassID, SessionID] = watch(['ClassID', 'SessionID']);

  const handleOpenModal = useCallback(() => {
    showModal('Selected Per Student Fee', 'SELECTED_PERSTUDENT_FEE_FILTER');
  }, []);

  // ✅ Last Admission Serial Query
  const { data: SerialData, error: serialError } =
    useGetLastAdmissionSerialQuery({
      ClassID,
      SessionID,
    });

  // ✅ Search Effect
  useEffect(() => {
    if (filterData && searchTrigger > 0) {
      searchRefetch();
    }
  }, [searchTrigger, filterData, searchRefetch]);

  // ✅ Handle Search Results
  useEffect(() => {
    if (searchUserInfo && searchUserInfo.data) {
      if (
        Array.isArray(searchUserInfo.data) &&
        searchUserInfo.data.length > 0
      ) {
        const studentData = searchUserInfo.data[0];
        fillFormWithStudentData(studentData);
      } else if (searchUserInfo.message) {
        Swal.fire({
          icon: 'info',
          title: 'দুঃখিত!',
          text: searchUserInfo.message,
          confirmButtonText: 'ঠিক আছে',
        });
        setLogo(null);
      }
    }
  }, [searchUserInfo, reset, getValues]);

  // ✅ Handle filteredSelectedPerStudentFee Data - যখন মোডাল থেকে ডেটা আসে
  useEffect(() => {
    if (filteredSelectedPerStudentFee) {
      console.log('Filtered Student Data:', filteredSelectedPerStudentFee);
      fillFormWithStudentData(filteredSelectedPerStudentFee);

      // ✅ Student Code ও সেট করে দিন
      setValue('StudentCode', filteredSelectedPerStudentFee.StudentCode || '');
    }
    setValue('SessionID', activeSession?.SessionID || '');
  }, [filteredSelectedPerStudentFee, activeSession, reset, setValue]);

  // ✅ ফর্ম ডেটা ফিল করার ফাংশন
  const fillFormWithStudentData = (studentData) => {
    const formData = {
      StudentCode: studentData.StudentCode || '',
      UserID: studentData.UserID || '',
      UserName: studentData.StudentName || '',
      FatherName: studentData.FatherName || '',
      Mobile1: studentData.Mobile1 || '',
      SessionID: activeSession?.SessionID || '',
      ClassID: studentData.ClassID || '',
      SubClassID: studentData.SubClassID || '',
      ResidentialStatusId: studentData.ResidentialStatusId || '',
      SFTID: studentData.SFTID || '',
      NewOldId: studentData.NewOldId || 1,
      CreateAt: studentData.CreateAt
        ? new Date(studentData.CreateAt)
        : new Date(),
      AdmissionSerial:
        studentData.AdmissionSerial || SerialData?.nextSerial || '',
      IsActive: 1,
    };

    console.log('Filling form with:', formData);
    reset(formData);

    // ✅ Set student photo if available
    if (studentData?.Image?.data) {
      const buffer = Buffer.from(studentData.Image.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    } else {
      setLogo(null);
    }
  };

  // ✅ Centralized Search Function
  const handleSearch = () => {
    const studentCode = String(methods.getValues('StudentCode') || '').trim();
    const sessionId = methods.getValues('SessionID');

    if (!studentCode) {
      Swal.fire({
        icon: 'warning',
        title: 'সতর্কতা',
        text: 'স্টুডেন্ট কোড দিন',
        confirmButtonText: 'ঠিক আছে',
      });
      return;
    }

    // ✅ Cache busting for same code search
    if (studentCode === lastSearchedCode) {
      setTimeout(() => {
        setFilterData({
          search: studentCode,
          // SessionID: sessionId,
          timestamp: Date.now(),
        });
        setSearchTrigger((prev) => prev + 1);
      }, 100);
    } else {
      setFilterData({
        search: studentCode,
        // SessionID: sessionId,
        timestamp: Date.now(),
      });
      setSearchTrigger((prev) => prev + 1);
    }

    setLastSearchedCode(studentCode);
  };

  // ✅ Enter Key Handler
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // ✅ Manual Search Function
  const handleManualSearch = () => {
    handleSearch();
  };

  // ✅ Reset Form Function
  const handleResetForm = () => {
    reset({
      StudentCode: '',
      UserID: '',
      UserName: '',
      FatherName: '',
      Mobile1: '',
      SessionID: '',
      ClassID: '',
      SubClassID: '',
      ResidentialStatusId: '',
      SFTID: '',
      NewOldId: 1,
      CreateAt: new Date(),
      AdmissionSerial: '',
      IsActive: 1,
    });
    setLogo(null);
    setFilterData(null);
    setLastSearchedCode('');
  };

  const filteredSubClassList = (subClassList || [])
    .filter((sub) => {
      if (!ClassID) return true;
      return sub?.ClassID?.toString() === ClassID.toString();
    })
    .map((sub) => ({
      SubClassID: sub.SubClassID,
      SubClassName: sub.SubClass,
      SubClassAra: sub.SubClassAra,
      SubClassEng: sub.SubClassEng,
      Serial: sub.Serial,
    }))
    .sort((a, b) => (a.Serial || 0) - (b.Serial || 0));

  const AdmissionType = [
    { id: 1, name: 'New' },
    { id: 2, name: 'Old' },
  ];

  const onSubmit = async (formData) => {
    try {
      const finalData = {
        ...formData,
      };

      console.log('Submitting data:', finalData);

      const response = await postStudentAdmission(finalData).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Student admission completed successfully',
        confirmButtonText: 'OK',
      });

      // Reset form after successful submission
      handleResetForm();
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error?.data?.error || 'Something went wrong',
        confirmButtonText: 'OK',
      });
    }
  };

  // Combined Loading & Error
  if (isSessionLoading || isClassLoading || isSubClassLoading) {
    return <Loading />;
  }

  if (isSessionError || isClassError || isSubClassError) {
    return <div>Error loading data!</div>;
  }

  const searchOption = [
    { id: 1, name: 'ID' },
    { id: 2, name: 'Card' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {/* PHOTO + STUDENT CODE + RADIO */}
          <div className="col-span-1 rounded-xl border bg-white p-4 shadow-sm">
            <h3 className="font-SolaimanLipi text-[20px] font-bold ">
              {translate('Students Admission')}
            </h3>
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Photo Box */}
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 text-gray-500 md:h-40 md:w-40">
                {logo ? (
                  <img
                    src={logo}
                    alt="Student"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  'Photo'
                )}
              </div>

              {/* Student Code */}
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {translate('Student Code')}:
                </label>

                <div className="flex gap-2">
                  <input
                    {...methods.register('StudentCode', {
                      required: true,
                      onChange: (e) => {
                        if (e.target.value.trim() !== lastSearchedCode) {
                          setLastSearchedCode('');
                        }
                      },
                    })}
                    className="h-[38px] w-full rounded-lg border border-gray-300 bg-gray-100 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    onKeyDown={handleEnter}
                    required
                  />

                  <button
                    type="button"
                    onClick={handleOpenModal}
                    className="rounded-md border border-gray-300 p-2 transition hover:bg-gray-100"
                    title="Filter"
                  >
                    <SvgIcon name="TbFilterPlus" size={20} />
                  </button>
                </div>
              </div>

              {/* Radio */}
              <div className="flex items-center justify-center">
                <DefaultRadio
                  options={searchOption}
                  registerKey="IsActive"
                  defaultValue={1}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-center gap-3">
                <Button type="submit">Save</Button>
                <Button
                  type="button"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleResetForm}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE FORM FIELDS */}
          <div className="col-span-1 rounded-xl border bg-white p-4 shadow-sm sm:col-span-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AdmissionForm;
