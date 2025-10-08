import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useGetGeneralLedgersByCAIDQuery,
  useGetSearchStudentsQuery,
  useGetStudentFeeAdmissionsQuery,
  useGetStudentFeeIncreaseDecreaseQuery,
  useGetSubLedgersByGLIDQuery,
  usePostStudentFeeCollectionMutation,
} from '../../../features/feeCollection/feeCollectionSlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import {
  setFilteredSelectedPerStudentFee,
  setMonthFeeData,
} from '../../../features/student/studentSlice';
import { useDefaultSession } from '../../../hooks/useDefaultSession';
import bnBijoy2Unicode from '../../../utils/conveter';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const AccExamFeeCollector = () => {
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

  const handleStudentExamFeeOpenModal = useCallback(() => {
    showModal('Student Month Fee Accept', 'STUDENT_MONTH_FEE_ACCEPT');
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
        MonthId: monthFeeData?.monthId || '',
        //  PreviousDue: "",
      };

      await postStudentFee(payload).unwrap();
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
    <div className="font-SolaimanLipi">
      <FormProvider {...methods}>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {translate('Student admission completed.')}
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Photo and Student Code Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 md:w-40 md:h-36 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Photo</span>
                  )}
                </div>

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {translate('Student Code')}:
                  </label>
                  <input
                    {...methods.register('StudentCode', { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100
                         focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    onKeyDown={handleEnter}
                    required
                  />
                </div>
              </div>

              {/* Student Information Section */}
              <div className="space-y-4">
                <div>
                  <DefaultSelect
                    label="Exam Name"
                    options={sessionData ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    registerKey="SessionID"
                    labelPosition="left"
                  />
                </div>

                <div className="bg-white space-y-3">
                  <InfoRow
                    label={translate('নাম')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.StudentName
                    )}
                    valueClassName="text-green-600 font-bold"
                  />
                  <InfoRow
                    label={translate('পিতার নাম')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.FatherName
                    )}
                  />
                  <InfoRow
                    label={translate('মোবাইল')}
                    value={filteredSelectedPerStudentFee?.Mobile1}
                  />
                  <InfoRow
                    label={translate('শ্রেণি/জামাত')}
                    value={filteredSelectedPerStudentFee?.ClassName}
                  />
                  <InfoRow
                    label={translate('Session')}
                    value={filteredSelectedPerStudentFee?.ClassName}
                  />
                </div>
              </div>

              {/* Fee Information Section */}
              <div className="bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <FeeInfoItem
                    label={translate('Prescribed Fee')}
                    value={studentFeeDataAll?.prescribedFee ?? '0'}
                  />
                  <FeeInfoItem
                    label={translate('Deduction')}
                    value={studentFeeDataAll?.deduction ?? '0'}
                  />
                  <FeeInfoItem
                    label={translate('Grand Total')}
                    value={studentFeeDataAll?.currentDeposit ?? '0'}
                  />
                  <FeeInfoItem
                    label={translate('Pre-deposit')}
                    value={totalDue ?? '0'}
                  />
                  <FeeInfoItem
                    label={translate('All paid')}
                    value={totalDue ?? '0'}
                  />
                  <FeeInfoItem
                    label={translate('Current deposit')}
                    value={totalDue ?? '0'}
                  />
                  <div className="col-span-2">
                    <FeeInputItem label={translate('Due')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-8">
              <Button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white text-base font-semibold rounded-lg 
                     hover:bg-green-700 transition flex-1 sm:flex-none"
              >
                Save
              </Button>

              <Button
                type="button"
                className="px-6 py-3 bg-red-500 text-white text-base font-semibold rounded-lg 
                     hover:bg-red-600 transition flex-1 sm:flex-none"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </FormProvider>
    </div>
  );
};

// Reusable Info Row Component
const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <span className={`ml-2 flex-1 truncate ${valueClassName}`}>
      {value || 'N/A'}
    </span>
  </div>
);

// Reusable Fee Info Item Component
const FeeInfoItem = ({ label, value }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <span className="ml-2 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem] bg-gray-50">
      {value}
    </span>
  </div>
);

// Reusable Fee Input Item Component
const FeeInputItem = ({ label }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <input
      type="text"
      className="ml-2 w-20 p-1 border border-gray-300 rounded bg-gray-50"
      placeholder="::"
      readOnly
    />
  </div>
);
export default AccExamFeeCollector;
