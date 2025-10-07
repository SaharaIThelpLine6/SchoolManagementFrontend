import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Textarea from '../components/Forms/Textarea';
import SvgIcon from '../components/icons/SvgIcon';
import DefaultRadio from '../components/Radio/DefaultRadio';
import {
  useGetGeneralLedgersByCAIDQuery,
  useGetSearchStudentsQuery,
  useGetStudentFeeAdmissionsQuery,
  useGetStudentFeeIncreaseDecreaseQuery,
  useGetSubLedgersByGLIDQuery,
  usePostStudentFeeCollectionMutation,
} from '../features/feeCollection/feeCollectionSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  setFilteredSelectedPerStudentFee,
  setMonthFeeData,
} from '../features/student/studentSlice';
import { numberToBanglaWords } from '../helper/numberToBanglaWords';
import { useDefaultSession } from '../hooks/useDefaultSession';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import MonthlyFeeCollectionTable from '../view/accounting/student-fee-collection/MonthlyFeeCollectionTable';

const StudentsFeeCollection = () => {
  const defaultSessionId = useDefaultSession();
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      StudentCode: '',
      SessionID: defaultSessionId || '',
      IsActive: 1,
      EntryDate: new Date(),
    },
    shouldFocusError: false, //
  });
  const { handleSubmit, reset, watch, setValue, control } = methods;
  const translate = useTranslate();
  const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
    (state) => state.student
  );

  const { studentFeeData = [] } = useSelector((state) => state.settings);

  console.log(filteredSelectedPerStudentFee, 'filteredSelectedPerStudentFee');
  const [studentFeeDataAll, setstudentFeeDataAll] = useState(null);
  const [totalDue, setTotalDue] = useState(null);
  const [logo, setLogo] = useState(null);
  const [filterData, setFilterData] = useState(null);

  const shouldSkip =
    !filteredSelectedPerStudentFee?.AdmissionID ||
    !filteredSelectedPerStudentFee?.StudentCode;

  const {
    data: studentMonthFeeData,
    isLoading: isLoadingMfd,
    error: errorMfd,
    isError: isErrorMfd,
  } = useGetStudentFeeIncreaseDecreaseQuery(
    {
      AdmissionID: filteredSelectedPerStudentFee?.AdmissionID,
      UserID: filteredSelectedPerStudentFee?.UserID,
      search: filteredSelectedPerStudentFee?.StudentCode,
      ClassID: filteredSelectedPerStudentFee?.ClassID,
      SessionID: filteredSelectedPerStudentFee?.SessionID,
    },
    {
      skip: shouldSkip,
    }
  );

  console.log(studentMonthFeeData, 'studentMonthFeeData');

  // Fetch student fee admissions data
  const {
    data: studentFeeAdmissionData,
    error: admissionError,
    isError: admissionisError,
  } = useGetStudentFeeAdmissionsQuery(
    filteredSelectedPerStudentFee?.AdmissionID,
    {
      skip: !filteredSelectedPerStudentFee?.AdmissionID,
    }
  );

  console.log(studentFeeAdmissionData, 'studentFeeAdmissionData');

  // Session function
  const { data: sessionData, isLoading, isFetching } = useGetSessionsQuery();

  const [postStudentFee] = usePostStudentFeeCollectionMutation();

  // default session set
  useEffect(() => {
    if (defaultSessionId) {
      setValue('SessionID', defaultSessionId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [defaultSessionId, setValue]);

  const [GLID, SessionID] = watch(['GLID', 'SessionID']);

  // const GLID = 3
  const { data: glbc = [] } = useGetGeneralLedgersByCAIDQuery();
  const { data: sglbc = [] } = useGetSubLedgersByGLIDQuery(GLID, {
    skip: !GLID,
  });
  // Call search query
  const {
    data: searchUserInfo = { data: [] }, // ✅ ডিফল্ট হিসেবে object এবং data: [] দিন
    error,
    isLoading: userInfoLoading,
    isError,
  } = useGetSearchStudentsQuery(filterData, {
    skip: !filterData,
    refetchOnFocus: false,
  });

  // 👉 useEffect দিয়ে dispatch, প্রথম এলিমেন্ট থাকলে
  useEffect(() => {
    if (searchUserInfo) {
      if (
        Array.isArray(searchUserInfo.data) &&
        searchUserInfo.data.length > 0
      ) {
        // ✅ প্রথম স্টুডেন্ট থাকলে dispatch
        dispatch(setFilteredSelectedPerStudentFee(searchUserInfo.data[0]));
      } else if (searchUserInfo.message) {
        // ✅ data খালি হলে sweetalert2 দেখাবে
        Swal.fire({
          icon: 'info',
          title: 'দুঃখিত!',
          text: searchUserInfo.message,
          confirmButtonText: 'ঠিক আছে',
        });
      }
    }
  }, [searchUserInfo, dispatch]);

  useEffect(() => {
    if (filteredSelectedPerStudentFee?.Image?.data) {
      const buffer = Buffer.from(filteredSelectedPerStudentFee.Image.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [filteredSelectedPerStudentFee]);

  useEffect(() => {
    if (studentFeeData?.fees) {
      const feesDue = studentFeeData.fees.reduce(
        (sum, fee) => sum + (fee.due || 0),
        0
      );
      setTotalDue(feesDue); // 👉 fees এর যোগফল
    }
  }, [studentFeeData]);
  useEffect(() => {
    setstudentFeeDataAll(studentFeeData);
  }, [studentFeeData]);

  useEffect(() => {
    if (filteredSelectedPerStudentFee) {
      const defaultValues = {
        ID: filteredSelectedPerStudentFee.UserID ?? '',
        StudentCode: filteredSelectedPerStudentFee.StudentCode ?? '',
        SessionID: filteredSelectedPerStudentFee.SessionID ?? '',
      };
      reset(defaultValues);
    } else {
      reset({
        StudentCode: '',
        SessionID: '',
      });
    }
  }, [filteredSelectedPerStudentFee, reset]);

  const handleOpenModal = useCallback(() => {
    showModal('Selected Per Student Fee', 'SELECTED_PERSTUDENT_FEE_FILTER');
  }, []);

  const handleStudentFeeOpenModal = useCallback(() => {
    if (studentMonthFeeData) {
      console.log(admissionError, 'admissionError');
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: admissionError?.data?.error || 'কিছু একটা ভুল হয়েছে',
      });
      return; // error থাকলে modal আর খুলবে না
    }

    showModal('Student Admission Fee Accept', 'STUDENT_ADMISSION_FEE_ACCEPT');
  }, [admissionisError, admissionError, showModal]);

  const handleStudentMonthFeeOpenModal = useCallback(() => {
    if (studentMonthFeeData?.data?.length > 0) {
      const student = studentMonthFeeData.data[0];

      // feeSettingsAvailable চেক করা হচ্ছে
      if (!student.feeSettingsAvailable) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি',
          text:
            student.feeSettingsError ||
            'এই শিক্ষার্থীর ক্লাসে এখনও কোনো ফি সেটিং যোগ করা হয়নি। অনুগ্রহ করে আগে ফি সেটিং যোগ করুন।',
        });
        return; // Modal আর খুলবে না
      }

      // যদি সব ঠিক থাকে → modal open হবে
      showModal('Student Month Fee Accept', 'STUDENT_MONTH_FEE_ACCEPT');
    }
  }, [studentMonthFeeData, showModal]);

  const onSubmit = async (data) => {
    try {
      // ✅ Check if fees array exists and has items
      if (!studentFeeData?.fees || studentFeeData.fees.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি',
          text: 'ফি এর খাত নির্বাচন করুন।',
        });
        return;
      }

      const payload = {
        UserID: studentFeeData.userId,
        AdmissionID: studentFeeData.admissionId,
        CurrentInvoice: studentFeeData.prescribedFee,
        InvoiceDiscount: studentFeeData.deduction,
        CurrentPaid: studentFeeData.currentDeposit,
        Due: totalDue,
        AmountInWord: data.speakCurrentDeposit,
        CreateAt: data.EntryDate,
        Remark: data.Remark,
        AccountType: data.GLID,
        Account: data.SLID,
        fees: studentFeeData.fees,
        MonthId: monthFeeData.monthId ?? null,
        //  PreviousDue: "",
      };

      await postStudentFee(payload).unwrap;
      console.log('First form submitted with data:', payload);

      // ✅ আপনার মূল logic এখানে লিখুন
      dispatch(setMonthFeeData(null));
      dispatch(setFilteredSelectedPerStudentFee(null));
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'ডেটা সাবমিট করতে সমস্যা হয়েছে',
      });
    }
  };

  const handleReset = () => {
    reset();
    dispatch(setFilteredSelectedPerStudentFee(null));
  };

  useEffect(() => {
    handleReset(); // page change হলে filterData reset করা
  }, [location.pathname]);

  // Reset Button
  const handleResetButton = () => {
    handleReset();
  };

  const feeStatus = [
    { id: 1, name: 'ID' },
    { id: 2, name: 'Card' },
  ];
  // 👉 handle function
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const studentCode = methods.getValues('StudentCode');
      setFilterData({ search: studentCode, SessionID }); // 👉 query param আকারে পাঠাবো
    }
  };

  return (
    <div className="">
      <FormProvider {...methods}>
        <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {translate('Student Fee Collection')}
            </h3>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Photo and Student Code */}
              <div className="p-1 col-span-1 flex flex-col items-center gap-4">
                <div className="w-28 h-28 md:w-40 md:h-36 border-2 border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-500 rounded-lg overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'Photo'
                  )}
                </div>

                <div className="w-full relative">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {translate('Student Code')}:
                  </label>
                  <div className="flex gap-2">
                    <input
                      {...methods.register('StudentCode', { required: true })}
                      className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100
                 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      onKeyDown={handleEnter} // 👉 এখানে function কল হবে
                      required
                    />
                    <button
                      type="button"
                      onClick={handleOpenModal}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                      title="Filter"
                    >
                      <SvgIcon name={'TbFilterPlus'} size={20} />
                    </button>
                  </div>
                </div>
                {/* Radio */}
                <div className="flex justify-center items-center md:col-span-1">
                  <DefaultRadio
                    options={feeStatus}
                    registerKey="IsActive"
                    defaultValue={1}
                  />
                </div>
              </div>
              <div className="space-y-4">
                {/* 🔹 Search Type */}
                <div>
                  <DefaultSelect
                    label="Session"
                    options={sessionData ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    registerKey="SessionID"
                    labelPosition="left"
                  />
                </div>

                {/* 🔹 Student Info Card */}
                <div className="bg-white space-y-4">
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('নাম')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 text-green-600 font-bold flex-1 truncate">
                      {bnBijoy2Unicode(
                        filteredSelectedPerStudentFee?.StudentName
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('পিতার নাম')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {bnBijoy2Unicode(
                        filteredSelectedPerStudentFee?.FatherName
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('মোবাইল')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {filteredSelectedPerStudentFee?.Mobile1}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('শ্রেণি/জামাত')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {filteredSelectedPerStudentFee?.ClassName}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('শিক্ষার্থীর অবস্থা')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    {filteredSelectedPerStudentFee?.AdmissionStatus != null && (
                      <span
                        className={`ml-1 font-bold flex-1 truncate ${
                          {
                            0: 'text-red-600', // পেন্ডিং
                            1: 'text-green-600', // পেইড
                            2: 'text-blue-600', // ফ্রী
                            3: 'text-yellow-600', // বকেয়া
                          }[filteredSelectedPerStudentFee.AdmissionStatus]
                        }`}
                      >
                        {
                          {
                            0: 'পেন্ডিং',
                            1: 'পেইড',
                            2: 'ফ্রী',
                            3: 'বকেয়া',
                          }[filteredSelectedPerStudentFee.AdmissionStatus]
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-3">
                <div className="bg-white space-y-4">
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('মোট')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {studentFeeDataAll?.prescribedFee ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('কর্তন')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>

                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {studentFeeDataAll?.deduction ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('জমা')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {studentFeeDataAll?.currentDeposit ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('বকেয়া')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>

                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {totalDue ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('রসিদ')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <input
                      type="text"
                      className="ml-1 w-20 p-1 border border-gray-300 rounded"
                      placeholder="::"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-3 my-4">
              <Textarea
                label="মন্তব্য"
                placeholder="Enter your comments ..."
                registerKey="Remark"
                // require={true}
                rows={2}
              />{' '}
              <Textarea
                label="কথায়"
                placeholder="Enter your comments ..."
                registerKey="speakCurrentDeposit"
                defaultValue={numberToBanglaWords(
                  studentFeeDataAll?.currentDeposit ?? ''
                )}
                disable
                rows={2}
              />
              <div className="flex flex-col md:flex-row justify-between gap-3 md:col-span-2">
                <DatePickerOne
                  dateCalender="Entry Date"
                  registerKey="EntryDate"
                  require={true}
                  placeholder="তারিখ নির্বাচন করুন"
                />
                <DefaultSelect
                  label="Account Type"
                  options={glbc.data ?? []}
                  valueField="GLID"
                  nameField="GlName"
                  unicode
                  registerKey="GLID"
                  require={'অ্যাকাউন্টের ধরণ নির্বাচন করতে হবে!'}
                />

                <DefaultSelect
                  label="Account"
                  options={sglbc ?? []}
                  valueField="SLID"
                  nameField="SlName"
                  unicode
                  registerKey="SLID"
                  require={'অ্যাকাউন্ট নির্বাচন করতে হবে!'}
                />
              </div>
            </div>
            <div className="flex gap-4">
              {/* Save button */}
              <Button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Save
              </Button>

              {/* Reset button */}
              <Button
                type="button"
                className="px-8 py-3 bg-red-500 text-white text-lg font-semibold rounded-lg hover:bg-red-600 transition"
              >
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 my-5">
              {/* Admission + Fees */}
              <div className="md:col-span-3 flex flex-wrap justify-center sm:justify-start">
                {/* Title */}
                <div className="flex justify-center sm:justify-start items-center">
                  <h1 className="text-base font-semibold text-gray-700">
                    পূর্বের বকেয়া
                  </h1>
                </div>
                {/* Fee Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2">
                  {/* Admission */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Button
                      onClick={handleStudentFeeOpenModal}
                      className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-blue-600 text-white"
                      disabled={
                        !filteredSelectedPerStudentFee?.UserID ||
                        ![0, 3].includes(
                          filteredSelectedPerStudentFee?.AdmissionStatus
                        )
                      }
                    >
                      ভর্তি
                    </Button>

                    <input
                      type="text"
                      className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Month Fee */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Button
                      onClick={handleStudentMonthFeeOpenModal}
                      className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-green-600 text-white"
                      disabled={!filteredSelectedPerStudentFee?.UserID}
                    >
                      মাসিক
                    </Button>
                    <input
                      type="text"
                      className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Exam */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Button
                      className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-purple-600 text-white"
                      disabled={!filteredSelectedPerStudentFee?.UserID}
                    >
                      পরীক্ষা
                    </Button>
                    <input
                      type="text"
                      className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="0"
                    />
                  </div>

                  {/* Others */}
                  <div className="flex flex-col items-center gap-2 w-full">
                    <Button
                      className="w-full max-w-xs px-4 py-2 rounded-lg shadow bg-yellow-500 text-white"
                      disabled={!filteredSelectedPerStudentFee?.UserID}
                    >
                      অন্যান্য
                    </Button>
                    <input
                      type="text"
                      className="w-full max-w-xs rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Student Code */}
              <div className="md:col-span-2">
                {/* Title */}
                <div className="flex justify-center sm:justify-start items-center">
                  <h1 className="text-base font-semibold text-gray-700">
                    অন্যান্য
                  </h1>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-blue-600 text-white">
                    বকেয়া তালিকা
                  </Button>

                  <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-green-600 text-white">
                    সকল রিপোর্ট
                  </Button>

                  <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-purple-600 text-white">
                    স্টেসমেন্ট
                  </Button>

                  <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-yellow-500 text-white">
                    বাড়ানো কমানো
                  </Button>

                  <Button className="max-w-xs px-4 py-2 rounded-lg shadow bg-pink-500 text-white">
                    খাবার ফির দিন ও ছুটি
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-3">
                <div className=" overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
                  <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
                    <thead className="bg-[#e9ebee] text-black">
                      <tr>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Sequential')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Fee Name')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Details')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Prescribed Fee')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Deduction')}
                        </th>

                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Pre-deposit')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Deposit')}
                        </th>
                        <th className="px-4 py-3 text-center whitespace-nowrap">
                          {translate('Due')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentFeeData?.fees &&
                      studentFeeData.fees.length > 0 ? (
                        studentFeeData.fees.map((item, index) => (
                          <tr key={item.SFSID} className="border-t">
                            <td className="px-4 text-center whitespace-nowrap">
                              {index + 1}
                            </td>

                            <td className="text-center whitespace-nowrap">
                              {bnBijoy2Unicode(item.SlName)}
                            </td>

                            <td className="px-4 text-center whitespace-nowrap">
                              {bnBijoy2Unicode(item.sessionName)}
                            </td>

                            <td className="text-center whitespace-nowrap">
                              <DefaultInput
                                registerKey={`fees.${index}.amount`}
                                type="text"
                                readOnly
                                defaultValue={item.amount}
                              />
                            </td>

                            <td className="text-center whitespace-nowrap">
                              <DefaultInput
                                registerKey={`fees.${index}.deduction`}
                                type="text"
                                readOnly
                                defaultValue={item.deduction}
                              />
                            </td>

                            <td className="text-center whitespace-nowrap">
                              <DefaultInput
                                registerKey={`fees.${index}.preDeposit`}
                                type="text"
                                readOnly
                                defaultValue={item.preDeposit}
                              />
                            </td>

                            <td className="text-center whitespace-nowrap">
                              <DefaultInput
                                registerKey={`fees.${index}.deposit`}
                                type="text"
                                readOnly
                                defaultValue={item.deposit}
                              />
                            </td>

                            <td className="text-center whitespace-nowrap">
                              <DefaultInput
                                registerKey={`fees.${index}.due`}
                                type="text"
                                readOnly
                                defaultValue={item.due}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-2 text-center">
                            {translate('No data available')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="md:col-span-2">
                <MonthlyFeeCollectionTable />
              </div>
            </div>
          </form>
        </div>
      </FormProvider>
    </div>
  );
};

export default StudentsFeeCollection;
