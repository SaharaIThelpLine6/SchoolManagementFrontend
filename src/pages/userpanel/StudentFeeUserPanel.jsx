import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import MultiMonthSelect from '../../components/Forms/MultiMonthSelect';
import { useInitPaymentMutation } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import {
  useGetFeeLandBySessionIdUserPanelQuery,
  useGetMonthPerStudentsFeeUserPanelQuery,
  useGetSessionUserPanelQuery,
  useGetUserSessionDetailsQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import { numberToBanglaWords } from '../../helper/numberToBanglaWords';
import useTranslate from '../../utils/Translate';
import MonthlyFeeSkeleton from './skeleton/MonthlyFeeSkeleton';
import DefaultSelect from '../../components/Forms/DefaultSelect';

const StudentFeeUserPanel = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { schoolid } = useParams();

  const { handleSubmit, reset, watch, getValues, setValue } = methods;

  const months = watch('months');
  const SessionID = watch('SessionID');
  console.log(months, 'months');

  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserSessionDetailsQuery(SessionID);
  const { data: sessionData } = useGetSessionUserPanelQuery();
  const activeSession = sessionData?.find((s) => s.SessionStatus === 1);

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);


  // console.log(activeSession, 'activeSession');

  console.log(userDetails, 'userDetails');
  const data = [];

  const admissionId = userDetails?.AdmissionID;
  // API query hook with proper error handling

  // Fetch student fee admissions data
  const { data: studentFeeAdmissionData } =
    useGetMonthPerStudentsFeeUserPanelQuery(SessionID, {
      skip: !SessionID,
    });
  const totalFee =
    studentFeeAdmissionData?.reduce(
      (sum, item) => sum + Number(item.FainalAmount || 0),
      0
    ) || 0;

  const {
    data: feeLandData = [],
    error,
    isError,
    isSuccess,
    isLoading: feeIsLoading,
  } = useGetFeeLandBySessionIdUserPanelQuery(SessionID, {
    skip: !SessionID,
    refetchOnMountOrArgChange: true,
  });
  const monthFeeList = useMemo(() => {
    if (!feeLandData?.feeDetails || !feeLandData?.monthDetails) {
      return [];
    }

    try {
      const { feeDetails, monthDetails } = feeLandData;

      return Array.from({ length: 12 }, (_, i) => {
        const index = i + 1;
        const fee = Number(feeDetails[`Fee${index}`]) || 0;
        const less = Number(feeDetails[`Less${index}`]) || 0;
        const paid = Number(feeDetails[`M${index}`]) || 0;

        const untouched = paid === 0 && less === 0;
        const closeMonth = Number(fee) === 0 && Number(paid) === 0;

        const isFree =
          !untouched &&
          (paid === 0 || paid === null) &&
          less === fee &&
          fee > 0;
        const isFullPaid = !isFree && fee > 0 && paid + less === fee;
        const due =
          !isFree && !isFullPaid && !untouched ? fee - (paid + less) : 0;

        return {
          monthId: index,
          monthName: monthDetails[`Month${index}`] || 'N/A',
          prescribedFee: fee,
          acceptedFees: paid,
          discount: less,
          due,
          isFree,
          isFullPaid,
          untouched,
          closeMonth,
          // originalData: {
          //   // Keep original data for reference
          //   feeDetails: feeDetails,
          //   monthDetails: monthDetails,
          // },
        };
      });
    } catch (error) {
      return [];
    }
  }, [feeLandData]);

  console.log(monthFeeList, 'monthFeeList');
  console.log(feeLandData, 'feeLandData');
  // console.log(userDetails, 'userDetails');
  // console.log(studentFeeAdmissionData, 'studentFeeAdmissionData');

  const SessionIDMatch =
    userDetails?.SessionID === activeSession?.SessionID;


  // console.log(userDetails?.SessionID, "userDetails");
  // console.log(activeSession?.SessionID, "activeSession");
  // console.log(SessionIDMatch, "SessionIDMatch");


  const [initPayment, { isLoading }] = useInitPaymentMutation();
  const fees = months?.flatMap((monthId) => {
    const month = monthFeeList.find((m) => m.monthId === monthId);

    return studentFeeAdmissionData.map((item) => ({
      SSFID: item.SSFID,
      SLID: item.SLID,
      SlName: item.SlName,
      sessionId: item.SessionID,
      sessionName: item.SessionName,
      classId: item.ClassID,
      amount: item.Amount,
      deduction: 0,
      deposit: item.Amount,
      preDeposit: 0,
      due: 0,
      monthId: month.monthId,
      monthName: month.monthName,
      studentCode: userDetails?.StudentCode,
    }));
  });
  const monthListData = months?.flatMap((monthId) => {
    const month = monthFeeList.find((m) => m.monthId === monthId);

    return {
      CurrentInvoice: totalFee,
      InvoiceDiscount: 0,
      CurrentPaid: totalFee,
      MonthId: month.monthId,
      Due: 0,
    };
  });

  const handlePayment = async () => {
    try {


      // if (!SessionIDMatch) {
      //   Swal.fire({
      //     title: 'Payment Error',
      //     text: 'Session not match',
      //     icon: 'error',
      //     confirmButtonText: 'OK',
      //   });
      //   return;
      // }


      const checkAmount = totalFee * months?.length;
      if (!checkAmount) {
        Swal.fire({
          title: 'Payment Error',
          text: 'Invalid payment amount',
          icon: 'error',
          confirmButtonText: 'OK',
        });
        return;
      }

      const payload = {
        UserID: userDetails?.UserID,
        UserName: userDetails?.UserName,
        Email: userDetails?.Email,
        DistrictName: userDetails?.DistrictName,
        PoliceStationName: userDetails?.PoliceStationName,
        Mobile1: userDetails?.Mobile1,
        AdmissionID: userDetails?.AdmissionID,
        CurrentInvoice: totalFee * months?.length,
        InvoiceDiscount: 0,
        CurrentPaid: totalFee * months?.length,
        Due: 0,
        AmountInWord: numberToBanglaWords(totalFee * months?.length),
        studentCode: userDetails?.UserCode,
        // CreateAt: '2026-01-19T12:21:28.318Z',
        // Remark: '',
        // AccountType: '301',
        // Account: '301001',
        // smsPermission: false,
        fees,
        feesLists: [
          {
            type: 'month',
            monthLists: monthListData,
            items: [],
            permission: true,
          },
        ],
      };

      console.log(payload, 'payload');
      const res = await initPayment({ payload }).unwrap();

      if (res?.gateway_url) {
        Swal.fire({
          title: 'Redirecting...',
          text: 'You are being redirected to the payment gateway',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          window.location.href = res.gateway_url;
        }, 2000);
      } else {
        Swal.fire({
          title: 'Payment Failed',
          text: 'Gateway URL not found',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    } catch (err) {
      const errorMessage =
        err?.data?.error || err?.data?.message || 'Payment init failed';

      Swal.fire({
        title: 'Payment Error',
        text: errorMessage, // 👉 "SSL School Data not found!"
        icon: 'error',
        confirmButtonText: 'OK',
      });

      console.error('Payment Error:', err);
    }
  };

  // 🔥 LOADING STATE (Skeleton)
  if (feeIsLoading || isuserDetailsLoading) {
    return <MonthlyFeeSkeleton />;
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">মাসিক ফি</h1>
          <Button>
            <Link to={`/${schoolid}/dashboard/student-payment-history`}>
              পেমেন্ট তথ্য
            </Link>
          </Button>
          {/* <p className="text-gray-600 mt-1">Fill in the student details below</p> */}
        </div>

        <form>
          {/* Form Sections with Accordion-like styling */}
          <div className="space-y-4">
            {/* Additional Details Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative z-10">
              <div className="p-3  grid grid-cols-2 gap-4 text-sm font-bold text-[#2664a8]">
                <div className="flex justify-between items-center bg-[#fdddbb] p-2 rounded-sm">
                  <h2 className="text-black">শিক্ষাবর্ষ</h2>
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 1024 1024"
                    height="2em"
                    width="2em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M271.653 1023.192c-8.685 0-17.573-3.432-24.238-10.097-13.33-13.33-13.33-35.144 0-48.474L703.67 508.163 254.08 58.573c-13.33-13.331-13.33-35.145 0-48.475 13.33-13.33 35.143-13.33 48.473 0L776.38 483.925c13.33 13.33 13.33 35.143 0 48.473l-480.492 480.694c-6.665 6.665-15.551 10.099-24.236 10.099z"></path>
                  </svg>
                </div>
                <div className="flex justify-start items-center">
                  {/* <h2>{activeSession?.SessionName}</h2> */}
                  <DefaultSelect
                    // label={translate('Session')}
                    nameField="SessionName"
                    registerKey="SessionID"
                    valueField="SessionID"
                    options={sessionData}
                    defaultSelect={false}
                    unicode
                  />
                </div>
              </div>
            </div>
            {/* {
              SessionIDMatch && */}
            <MultiMonthSelect
              label="Select Months"
              registerKey="months"
              options={monthFeeList}
              valueField="monthId"
              nameField="monthName"
              unicode={true}
            />
            {/* } */}

            <div className="max-w-2xl mx-auto bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-200 shadow-md overflow-hidden relative z-10">
              {/* Table Header */}
              <div className="grid grid-cols-12 bg-gradient-to-r from-blue-100 to-blue-50 text-sm font-semibold text-gray-700 border-b border-blue-200">
                <div className="p-3 text-center border-r border-blue-200 col-span-2">
                  ক্রমিক
                </div>
                <div className="p-3 border-r border-blue-200 col-span-7">
                  খাতের বিবরণ
                </div>
                <div className="p-3 text-right col-span-3">পরিমাণ</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-blue-100">
                {studentFeeAdmissionData?.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                        {index + 1}
                      </div>
                      <div className="p-3 border-r border-blue-100 col-span-7">
                        {item.SlName}
                      </div>
                      <div className="p-3 text-right col-span-3 font-medium">
                        {item.FainalAmount}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Calculation */}
              {months?.length > 0 && (
                <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-amber-50 to-orange-100 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Label */}
                    <div className="text-sm font-medium text-gray-700">
                      মোট ফি হিসাব
                    </div>

                    {/* Formula */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-semibold text-orange-600">
                        {totalFee}
                      </span>
                      <span className="text-gray-400">×</span>
                      <span className="font-semibold text-orange-600">
                        {months?.length}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block h-6 w-px bg-orange-300" />

                    {/* Final Amount */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">মোট</span>
                      <span className="text-xl font-bold text-orange-700">
                        {totalFee * (months?.length || 0)}
                      </span>
                      <span className="text-xs text-gray-500">টাকা</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full col-span-2">
              <Button className="w-full" onClick={handlePayment}>
                Pay
              </Button>
            </div>
          </div>
        </form>

        {/* Bottom Padding for Mobile */}

        <div className="h-20"></div>
      </div>
    </FormProvider>
  );
};;

export default StudentFeeUserPanel;
