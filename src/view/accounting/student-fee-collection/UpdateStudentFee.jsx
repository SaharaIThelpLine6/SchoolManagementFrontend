import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import DeleteButton from '../../../components/Button/DeleteButton';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import Textarea from '../../../components/Forms/Textarea';
import SvgIcon from '../../../components/icons/SvgIcon';
import Loading from '../../../components/Loading/Loading';
import DefaultRadio from '../../../components/Radio/DefaultRadio';
import {
  useGetGeneralLedgersByCAIDQuery,
  useGetSearchStudentsQuery,
  useGetStudentFeeUpdateGetDataByUFOIDQuery,
  useGetSubLedgersByGLIDQuery,
  usePutUpdateStudentFeeMutation,
} from '../../../features/feeCollection/feeCollectionSlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { setStudentFeeUpdateID } from '../../../features/student/studentSlice';
import { numberToBanglaWords } from '../../../helper/numberToBanglaWords';
import { useDefaultSession } from '../../../hooks/useDefaultSession';
import bnBijoy2Unicode from '../../../utils/conveter';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import DefaultKeyDownInput from '../../../view/accounting/student-fee-collection/DefaultKeyDownInput';
import SubmitLoading from '../../../components/Loading/SubmitLoading';

const UpdateStudentFee = () => {
  const defaultSessionId = useDefaultSession();
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const { studentFeeUpdateID } = useSelector((state) => state.student);

  // API calls
  const { data: sessionData } = useGetSessionsQuery();
  const [putStudentFee, { isLoading, isSuccess }] = usePutUpdateStudentFeeMutation();

  // State
  const [defaultFees, setDefaultFees] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [logo, setLogo] = useState(null);
  const [filterData, setFilterData] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [lastSearchedCode, setLastSearchedCode] = useState('');

  // Form setup
  const methods = useForm({
    defaultValues: {
      StudentCode: '',
      Remark: '',
      SessionID: defaultSessionId || '',
      IsActive: 1,
      EntryDate: '',
      fees: [],
      prescribedFee: 0,
      deduction: 0,
      currentDeposit: 0,
      SLID: 0,
      GLID: 0,
    },
    shouldFocusError: false,
  });

  const { handleSubmit, reset, watch, setValue, control, getValues } = methods;
  const fees = watch('fees');
  console.log(fees, 'fees');
  const [GLID, SessionID] = watch(['GLID', 'SessionID']);

  // Student data query
  const { data: studentFeeUpdateData, refetch: refetchData } =
    useGetStudentFeeUpdateGetDataByUFOIDQuery(studentFeeUpdateID, {
      skip: !studentFeeUpdateID,
    });

  console.log(studentFeeUpdateData, 'studentFeeUpdateData');

  // General and sub ledgers
  const { data: glbc = [] } = useGetGeneralLedgersByCAIDQuery();
  const { data: sglbc = [] } = useGetSubLedgersByGLIDQuery(GLID, {
    skip: !GLID,
  });

  // Search query
  const {
    data: searchUserInfo = { data: [] },
    isLoading: userInfoLoading,
    refetch,
  } = useGetSearchStudentsQuery(filterData, {
    skip: !filterData,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // ✅ FIXED: Single useEffect for search trigger
  useEffect(() => {
    if (filterData && searchTrigger > 0) {
      refetch();
    }
  }, [searchTrigger, filterData, refetch]);

  // ✅ FIXED: Single useEffect for search results
  useEffect(() => {
    if (searchUserInfo?.data) {
      if (
        Array.isArray(searchUserInfo.data) &&
        searchUserInfo.data.length > 0
      ) {
        // Handle successful search
        console.log('Search result:', searchUserInfo.data[0]);
      } else if (searchUserInfo.message) {
        Swal.fire({
          icon: 'info',
          title: 'দুঃখিত!',
          text: searchUserInfo.message,
          confirmButtonText: 'ঠিক আছে',
        });
        setDefaultFees([]);
        setTotalDue(0);
        setLogo(null);
      }
    }
  }, [searchUserInfo]);

  // ✅ FIXED: Single useEffect for logo
  useEffect(() => {
    if (studentFeeUpdateData?.Image?.data) {
      const buffer = Buffer.from(studentFeeUpdateData.Image.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    } else {
      setLogo(null);
    }
  }, [studentFeeUpdateData]);

  // ✅ FIXED: Single useEffect for default fees initialization
  useEffect(() => {
    if (
      studentFeeUpdateData?.fees &&
      Array.isArray(studentFeeUpdateData.fees)
    ) {
      const formattedFees = studentFeeUpdateData.fees.map((item) => ({
        SSFID: item.SSFID || item.SFSID,
        SLID: item.SLID,
        SlName: item.SlName,
        sessionId: item.sessionId || item.SessionID,
        sessionName: item.sessionName || item.SessionName,
        classId: item.classId || item.ClassID,
        amount: item.Fee || 0,
        deduction: item.Less || 0,
        deposit: item.PayAmount || 0,
        // preDeposit: item.PreviousDeposite || 0,
        due: item.NetPayable || 0,
        TransactionID: item.TransactionID || 0,
        UFODID: item.UFODID || 0,
        ExamID: item.ExamID || 0,
        OrderID: item.OrderID || 0,
        FundID: item.FundID || 0,
        MonthID: item.MonthID || 0,
      }));

      setDefaultFees(formattedFees);

      // Batch form updates to prevent multiple re-renders
      setTimeout(() => {
        setValue('fees', formattedFees);
        setValue('prescribedFee', studentFeeUpdateData.prescribedFee || 0);
        setValue('deduction', studentFeeUpdateData.deduction || 0);
        setValue('currentDeposit', studentFeeUpdateData.currentDeposit || 0);
      }, 0);
    }
  }, [studentFeeUpdateData, setValue]);

  // ✅ FIXED: Optimized totals calculation with useMemo
  const recalculateTotals = useCallback(() => {
    if (!fees || fees.length === 0) {
      setValue('prescribedFee', 0);
      setValue('deduction', 0);
      setValue('currentDeposit', 0);
      setTotalDue(0);
      return;
    }

    const totalPrescribed = fees.reduce(
      (acc, f) => acc + Number(f.amount || 0),
      0
    );
    const totalDeduction = fees.reduce(
      (acc, f) => acc + Number(f.deduction || 0),
      0
    );
    const totalDeposit = fees.reduce(
      (acc, f) => acc + Number(f.deposit || 0),
      0
    );
    const totalDueAmount = fees.reduce((acc, f) => acc + Number(f.due || 0), 0);

    // Batch updates
    setValue('prescribedFee', totalPrescribed);
    setValue('deduction', totalDeduction);
    setValue('currentDeposit', totalDeposit);
    setTotalDue(totalDueAmount);
  }, [fees, setValue]);

  // ✅ FIXED: Single effect for totals recalculation
  useEffect(() => {
    recalculateTotals();
  }, [recalculateTotals]);

  // Fee operations
  const handleDeductionChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const prescribedFee = Number(fee.amount) || 0;
      const deduction = Number(fee.deduction) || 0;
      const deposit = prescribedFee - deduction;

      setValue(`fees.${index}.deposit`, deposit);
      setValue(`fees.${index}.due`, prescribedFee - deduction - deposit);

      recalculateTotals();
    },
    [getValues, setValue, recalculateTotals]
  );

  const handleDepositChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const prescribedFee = Number(fee.amount) || 0;
      const deduction = Number(fee.deduction) || 0;
      const deposit = Number(fee.deposit) || 0;
      const due = prescribedFee - deduction - deposit;

      setValue(`fees.${index}.due`, due);
      recalculateTotals();
    },
    [getValues, setValue, recalculateTotals]
  );

  const handleDeleteFee = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const updatedFees = currentFees.filter((_, i) => i !== index);
      setValue('fees', updatedFees);
      recalculateTotals();
    },
    [getValues, setValue, recalculateTotals]
  );

  // ✅ FIXED: Single effect for session initialization
  useEffect(() => {
    if (defaultSessionId) {
      setValue('SessionID', defaultSessionId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [defaultSessionId, setValue]);

  // ✅ FIXED: Single effect for form reset on student data change
  useEffect(() => {
    const currentSession = getValues('SessionID');

    if (studentFeeUpdateData) {
      // Step 1️⃣: প্রথমে GLID, বেসিক ফর্ম রিসেট করা
      reset({
        ID: studentFeeUpdateData.UserID ?? '',
        StudentCode: studentFeeUpdateData.StudentCode ?? '',
        GLID: studentFeeUpdateData.AccountType ?? '',
        EntryDate: studentFeeUpdateData.CreateAt,
        SessionID: currentSession || defaultSessionId,
        Remark: studentFeeUpdateData.Remark ?? '',
        fees: defaultFees,
        prescribedFee: 0,
        deduction: 0,
        currentDeposit: 0,
      });

      // Step 2️⃣: কিছুক্ষণ পর (GLID সেট হওয়ার পর) SLID সেট করা
      const timer = setTimeout(() => {
        setValue('SLID', studentFeeUpdateData.Account ?? '');
      }, 300); // 300ms delay রাখো যাতে dependent dropdown রেন্ডার হয়ে যায়

      return () => clearTimeout(timer);
    }
  }, [
    studentFeeUpdateData,
    reset,
    getValues,
    defaultSessionId,
    defaultFees,
    setValue,
  ]);

  // Search and form handlers
  const handleOpenModal = useCallback(() => {
    showModal('Selected Per Student Fee', 'SELECTED_PERSTUDENT_FEE_FILTER');
  }, []);

  // Search and form handlers
  const handleOpenCommentBoxModal = useCallback(() => {
    showModal(
      'Update Student fee comment box',
      'UPDATE_STUDENT_FEE_COMMENT_BOX'
    );
  }, []);

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSearch = () => {
    const studentCode = methods.getValues('StudentCode').trim();
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

    // Reset states
    setDefaultFees([]);
    setTotalDue(0);
    setLogo(null);

    setFilterData({
      search: studentCode,
      SessionID: sessionId,
      timestamp: Date.now(),
    });

    setSearchTrigger((prev) => prev + 1);
    setLastSearchedCode(studentCode);
  };

  const handleResetPage = () => {
    // refetchData();
    const currentSession = getValues('SessionID');

    reset({
      StudentCode: '',
      SessionID: currentSession || defaultSessionId,
      IsActive: 1,
      EntryDate: new Date(),
      GLID: '',
      SLID: '',
      Remark: '',
      speakCurrentDeposit: '',
      fees: [],
      prescribedFee: 0,
      deduction: 0,
      currentDeposit: 0,
    });

    setFilterData(null);
    dispatch(setStudentFeeUpdateID(null));
    setTotalDue(0);
    setDefaultFees([]);
    setLogo(null);
    setSearchTrigger(0);
    setLastSearchedCode('');
  };

  const onSubmitFirst = async (data) => {
    // Step 1: Open comment modal
    handleOpenCommentBoxModal();

    // Step 2: Listen for modal save event
    const handleCommentSaved = () => {
      onSubmit(data); // এখন main form submit হবে
      window.removeEventListener('commentSaved', handleCommentSaved);
    };

    window.addEventListener('commentSaved', handleCommentSaved);
  };

  const onSubmit = async (data) => {
    try {
      if (!fees || fees.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি',
          text: 'ফি এর খাত নির্বাচন করুন।',
        });
        return;
      }
      const commentValue = localStorage.getItem('smsMessage') || '';
      const payload = {
        UserID: studentFeeUpdateData.UserID,
        AdmissionID: studentFeeUpdateData.AdmissionID,
        TransactionID: studentFeeUpdateData?.TransactionID,
        UFOID: studentFeeUpdateData?.UFOID,
        OrderID: studentFeeUpdateData?.OrderID,
        fees: fees.map((fee) => ({
          SLID: fee.SLID,
          SlName: fee.SlName,
          sessionId: fee.sessionId,
          sessionName: fee.sessionName,
          classId: fee.classId,
          amount: fee.amount ?? 0,
          deduction: fee.deduction ?? 0,
          deposit: fee.deposit ?? 0,
          preDeposit: fee.preDeposit ?? 0,
          due: fee.due ?? 0,
          TransactionID: fee.TransactionID ?? 0,
          UFODID: fee.UFODID ?? 0,
          ExamID: fee.ExamID || 0,
          OrderID: fee.OrderID || 0,
          FundID: fee.FundID || 0,
          MonthID: fee.MonthID || 0,
        })),
        CurrentInvoice: getValues('prescribedFee'),
        InvoiceDiscount: getValues('deduction'),
        CurrentPaid: getValues('currentDeposit'),
        Due: totalDue,
        AmountInWord: data.speakCurrentDeposit,
        CreateAt: data.EntryDate,
        Remark: data.Remark,
        AccountType: data.GLID,
        Account: data.SLID,
        Comment: commentValue,
      };

      await putStudentFee(payload).unwrap();
      console.log('Form submitted with data:', payload);

      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ফি সংগ্রহ সফলভাবে সম্পন্ন হয়েছে।',
        confirmButtonText: 'ঠিক আছে',
      });

      handleResetPage();
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি',
        text: 'ডেটা সাবমিট করতে সমস্যা হয়েছে',
      });
    }
  };

  const handleKeyDown = (e, index, fieldType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldType === 'deduction') handleDeductionChange(index);
      else if (fieldType === 'deposit') handleDepositChange(index);
    }
  };

  const feeStatus = [
    { id: 1, name: 'ID' },
    { id: 2, name: 'Card' },
  ];

  if (userInfoLoading) {
    return <Loading />;
  }

   // Update Submit Loading
    if (isLoading) {
      return <SubmitLoading />;
    }

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
          <form onSubmit={handleSubmit(onSubmitFirst)}>
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
                      {...methods.register('StudentCode', {
                        required: true,
                        onChange: (e) => {
                          // ✅ Input change হলে last searched code reset করুন
                          if (e.target.value.trim() !== lastSearchedCode) {
                            setLastSearchedCode('');
                          }
                        },
                      })}
                      className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      onKeyDown={handleEnter}
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
                    {/* ✅ Manual search button */}
                    {/* <button
                      type="button"
                      onClick={handleManualSearch}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                      title="Search"
                      disabled={userInfoLoading}
                    >
                      {userInfoLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      ) : (
                        <SvgIcon name={'IoSearch'} size={20} />
                      )}
                    </button> */}
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

              {/* বাকি JSX code একই থাকবে */}
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
                      {bnBijoy2Unicode(studentFeeUpdateData?.StudentName)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('পিতার নাম')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {bnBijoy2Unicode(studentFeeUpdateData?.FatherName)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('মোবাইল')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {studentFeeUpdateData?.Mobile1}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('শ্রেণি/জামাত')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 flex-1 truncate">
                      {studentFeeUpdateData?.ClassName}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-1 flex-shrink-0">
                      {translate('শিক্ষার্থীর অবস্থা')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    {studentFeeUpdateData?.AdmissionStatus != null && (
                      <span
                        className={`ml-1 font-bold flex-1 truncate ${
                          {
                            0: 'text-red-600',
                            1: 'text-green-600',
                            2: 'text-blue-600',
                            3: 'text-yellow-600',
                          }[studentFeeUpdateData.AdmissionStatus]
                        }`}
                      >
                        {
                          {
                            0: 'পেন্ডিং',
                            1: 'পেইড',
                            2: 'ফ্রী',
                            3: 'বকেয়া',
                          }[studentFeeUpdateData.AdmissionStatus]
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* বাকি JSX code */}
              <div className="w-full flex gap-3">
                <div className="bg-white space-y-4">
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('মোট')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {watch('prescribedFee') ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('কর্তন')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {watch('deduction') ?? '0'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-semibold text-gray-700 min-w-12 pr-1 flex-shrink-0">
                      {translate('জমা')}
                    </span>
                    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
                    <span className="ml-1 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem]">
                      {watch('currentDeposit') ?? '0'}
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
            {/* বাকি ফর্ম অংশ (Textarea, DatePicker, Select) অপরিবর্তিত... */}
            <div className="grid grid-cols-1 md:grid-cols-4 w-full gap-3 my-4">
              <Textarea
                label="মন্তব্য"
                placeholder="Enter your comments ..."
                registerKey="Remark"
                rows={2}
              />
              <Textarea
                label="কথায়"
                placeholder="Enter your comments ..."
                registerKey="speakCurrentDeposit"
                defaultValue={numberToBanglaWords(
                  watch('currentDeposit') ?? ''
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
                  defaultValue={studentFeeUpdateData?.CreateAt}
                  disable={false}
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
              <Button
                type="submit"
                className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition"
              >
                Save
              </Button>

              <Button
                type="button"
                onClick={handleResetPage}
                className="px-8 py-3 bg-red-500 text-white text-lg font-semibold rounded-lg hover:bg-red-600 transition"
              >
                Reset
              </Button>
            </div>

            <div className=" overflow-x-auto rounded-md border w-full my-5">
              <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
                <thead className="bg-[#e9ebee] text-black">
                  <tr>
                    <th className="px-4 py-3 text-center whitespace-nowrap">
                      {translate('Action')}{' '}
                      {/* Added Action column like first component */}
                    </th>
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
                  {fees && fees.length > 0 ? (
                    fees.map((item, index) => (
                      <tr
                        key={item.SSFID || item.SFSID || index}
                        className="border-t"
                      >
                        <td className="px-4 text-center">
                          {' '}
                          {/* Added Delete button */}
                          <DeleteButton
                            onClick={() => handleDeleteFee(index)}
                          />
                        </td>
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
                            type="number"
                            readOnly
                            defaultValue={item.amount}
                          />
                        </td>

                        <td className="text-center whitespace-nowrap">
                          <DefaultKeyDownInput
                            registerKey={`fees.${index}.deduction`}
                            type="number"
                            defaultValue={item.deduction || 0}
                            onChange={() => handleDeductionChange(index)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, index, 'deduction')
                            }
                            readOnly={!studentFeeUpdateID}
                          />
                        </td>

                        <td className="text-center whitespace-nowrap">
                          <DefaultInput
                            registerKey={`fees.${index}.preDeposit`}
                            type="number"
                            readOnly
                            defaultValue={item.preDeposit || 0}
                          />
                        </td>

                        <td className="text-center whitespace-nowrap">
                          <DefaultKeyDownInput
                            registerKey={`fees.${index}.deposit`}
                            type="number"
                            defaultValue={item.deposit || 0}
                            onChange={() => handleDepositChange(index)}
                            onKeyDown={(e) =>
                              handleKeyDown(e, index, 'deposit')
                            }
                            readOnly={!studentFeeUpdateID}
                          />
                        </td>

                        <td className="text-center whitespace-nowrap">
                          <DefaultInput
                            registerKey={`fees.${index}.due`}
                            type="number"
                            readOnly
                            defaultValue={item.due || 0}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-2 text-center">
                        {' '}
                        {/* Updated colspan */}
                        {translate('No data available')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </form>
        </div>
      </FormProvider>
    </div>
  );
};

export default UpdateStudentFee;
