import { skipToken } from '@reduxjs/toolkit/query';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Button from '../../components/Button/Button';
import {
  useGetResidentialsUserPanelQuery,
  useGetStudentAdmissionMessageForUserPanelQuery,
  useGetUserDetailsQuery,
  useGetUserPanelStudentFeeAdmissionsQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import { useDefaultSessionForUserPanel } from '../../hooks/useDefaultSessionForUserPanel';
import useTranslate from '../../utils/Translate';
import Countdown from './Countdown';
import Swal from 'sweetalert2';
import { numberToBanglaWords } from '../../helper/numberToBanglaWords';
import { useInitPaymentMutation, useLazyAdmissionCheckQuery } from '../../features/userPanel/studentPayment/studentPaymentSlice';
import { useEffect, useState } from 'react';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { calculateTimeLeft } from '../../utils/calculateTimeLeft';

const OnlineAdmissionStudent = () => {
  const methods = useForm();
  const defaultSession = useDefaultSessionForUserPanel();
  const [admissionPermission, setAdmissionPermission] = useState(false)

  const translate = useTranslate();
  const { setValue, watch } = methods;
  const [initPayment] = useInitPaymentMutation();
  const [hasPermission, setHasPermission] = useState(null);
  console.log(hasPermission, "hasPermission")


  const ResidentialStatusId = watch("ResidentialStatusId")


  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  const [checkAdmission, { data, isLoading }] = useLazyAdmissionCheckQuery();

  // Residential
  const {
    data: residential,
    isLoading: isresidentialLoading,
    isError: isresidentialError,
  } = useGetResidentialsUserPanelQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  /* ================= USER DETAILS ================= */
  const {
    data: messageData,
    isLoading: isLoadingMessage,
    isError: isError,
  } = useGetStudentAdmissionMessageForUserPanelQuery();
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(messageData?.data.Message3rdPart)
  );
  /* ================= USER DETAILS ================= */
  const {
    data: userDetails,
    isLoading: isUserDetailsLoading,
    isError: isUserDetailsError,
  } = useGetUserDetailsQuery(currentSession);

  console.log(userDetails, "userDetails")

  const sfgnid = 1;

  // 🔥 SAFE ACCESS
  const admissionId = userDetails?.AdmissionID ?? null;

  /* ================= STUDENT FEE ADMISSION ================= */
  const {
    data: studentFeeAdmissionData,
    isLoading: isFeeLoading,
    error: feeError,
  } = useGetUserPanelStudentFeeAdmissionsQuery(
    admissionId && sfgnid ? { admissionId, sfgnid } : skipToken
  );

  const totalFee = studentFeeAdmissionData?.fees?.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  // console.log(totalFee);
  console.log(studentFeeAdmissionData?.fees, 'studentFeeAdmissionData');
  console.log(studentFeeAdmissionData, 'studentFeeAdmissionData');
  // console.log(currentSession, 'currentSession');
  // console.log(userDetails, 'userDetails');
  // console.log(messageData, 'messageData');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(messageData?.data.Message3rdPart));
    }, 1000);

    return () => clearInterval(timer);
  }, [messageData?.data.Message3rdPart]);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const res = await checkAdmission({
          AdmissionID: userDetails?.AdmissionID,
          ClassID: studentFeeAdmissionData?.admissionClassId,
          SessionID: defaultSession?.SessionID,
          UserID: userDetails?.UserID
        }).unwrap();

        setHasPermission(res?.permission === true);

      } catch (error) {
        setHasPermission(false);
        console.error(error);
      }
    };

    if (userDetails && studentFeeAdmissionData && defaultSession) {
      checkPermission();
    }
  }, [userDetails, studentFeeAdmissionData, defaultSession]);

  const handleChangePermission = async () => {

    if (!studentFeeAdmissionData?.fees) {
      Swal.fire({
        title: 'ত্রুটি',
        text: 'Admission not active',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });
      return;
    }

    try {

      const res = await checkAdmission({
        AdmissionID: userDetails.AdmissionID,
        ClassID: studentFeeAdmissionData.admissionClassId,
        SessionID: defaultSession.SessionID,
        UserID: userDetails.UserID
      }).unwrap();

      if (res?.success) {
        setAdmissionPermission(true);
      }

    } catch (error) {

      Swal.fire({
        title: 'ত্রুটি',
        text: error?.data?.message || 'Admission check failed',
        icon: 'error',
        confirmButtonText: 'ঠিক আছে',
      });

    }
  };



  const handlePayment = async () => {
    try {
      const validations = [
        { condition: !totalFee, message: 'Invalid payment amount' },
        { condition: !ResidentialStatusId, message: 'দয়া করে সঠিক আবাসিক স্ট্যাটাস নির্বাচন করুন' },
        { condition: !userDetails.ClassID, message: 'দয়া করে শ্রেণি নির্বাচন করুন' },
        { condition: !userDetails.SubClassID, message: 'দয়া করে উপ-শ্রেণি নির্বাচন করুন' },
        { condition: !userDetails.SessionID, message: 'দয়া করে সেশন নির্বাচন করুন' },
      ];

      for (const v of validations) {
        if (v.condition) {
          Swal.fire({
            title: 'ত্রুটি',
            text: v.message,
            icon: 'error',
            confirmButtonText: 'ঠিক আছে',
          });
          return;
        }
      }

      const payload = {
        UserID: userDetails?.UserID,
        UserName: userDetails?.UserName,
        Email: userDetails?.Email,
        DistrictName: userDetails?.DistrictName,
        PoliceStationName: userDetails?.PoliceStationName,
        Mobile1: userDetails?.Mobile1,
        AdmissionID: userDetails?.AdmissionID,
        CurrentInvoice: totalFee,
        InvoiceDiscount: 0,
        CurrentPaid: totalFee,
        Due: 0,
        AmountInWord: numberToBanglaWords(totalFee),
        studentCode: userDetails?.UserCode,
        // CreateAt: '2026-01-19T12:21:28.318Z',
        // Remark: '',
        // AccountType: '301',
        // Account: '301001',
        // smsPermission: false,
        fees: studentFeeAdmissionData?.fees,
        feesLists: [
          {
            type: 'admission',
            CurrentInvoice: totalFee || 0,
            InvoiceDiscount: 0,
            CurrentPaid: totalFee,
            Due: 0,
            items: [],
            permission: true,
            ClassID: studentFeeAdmissionData.admissionClassId,
            SubClassID: studentFeeAdmissionData.admissionSubClassId,
            ResidentialStatusId: ResidentialStatusId,
            // SessionID: studentFeeAdmissionData.admissionSessionID,
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
  let message;

  if (!timeLeft && hasPermission) {
    // time is over but has permission
    message = messageData?.data?.Message4thPart;
  } else if (hasPermission) {
    // time left and has permission
    message = messageData?.data?.Message2ndPart;
  } else {
    // either no permission, regardless of timeLeft
    message = messageData?.data?.Message1stPart;
  }

  if (isUserDetailsLoading) return <div>Loading...</div>;
  if (isUserDetailsError) return <div>User Load Error</div>;


  // API তে পাঠান
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {translate('Online Admission')}
          </h1>
          {/* <p className="text-gray-600 mt-1">Fill in the student details below</p> */}
        </div>
        {/* Countdown */}
        {
          !admissionPermission &&
          <div className="max-w-4xl mx-auto mb-4">
            {/* Main White Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎓 {translate('Admission Deadline')}
                </h2>
                {/* <p className="text-gray-500 mt-2">
                ভর্তি শেষ হওয়ার আগে দ্রুত সম্পন্ন করুন
              </p> */}
              </div>

              {/* Message Section */}
              {messageData?.data && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-800 font-SolaimanLipi text-lg leading-relaxed text-center">
                    {message}
                  </p>
                </div>
              )}
              {
                hasPermission && (
                  <>

                    {/* Countdown Section */}
                    <div className="bg-gray-50 rounded-xl p-6 my-4 border border-gray-100">
                      <Countdown targetDate={messageData?.data.Message3rdPart} />
                    </div>
                    <div className="w-full col-span-2">
                      <Button className="w-full" onClick={handleChangePermission}>Confirm Pay</Button>
                    </div>
                  </>
                )
              }
            </div>

          </div>
        }

        {/* {messageData?.data.Message1stPart && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition-colors">
              <p className="text-gray-800 font-SolaimanLipi leading-relaxed">
                {messageData?.data.Message1stPart}
              </p>
            </div>
          )} */}
        {
          admissionPermission &&
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
                    <h2>{defaultSession?.SessionName}</h2>
                  </div>
                  <div className="flex justify-between items-center bg-[#daedf8] p-2 rounded-sm">
                    <h2>পড়েছেন</h2>
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
                    <h2>{studentFeeAdmissionData?.className}</h2>
                  </div>
                  <div className="flex justify-between items-center bg-[#fdddbb] p-2 rounded-sm">
                    <h2>ভর্তি হতে পারবে</h2>
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
                    <h2>{studentFeeAdmissionData?.admissionClassName}</h2>
                  </div>
                  <div className="col-span-2">
                    <DefaultSelect
                      options={residential}
                      nameField="ResidentialName"
                      valueField="RDID"
                      registerKey="ResidentialStatusId"
                      label="Living Condition"
                      require="Living Condition is required"
                    />
                  </div>
                </div>

              </div>
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
                  {studentFeeAdmissionData?.fees?.map((item, index) => {
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
                          {item.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 font-semibold">
                  <div className="text-sm text-gray-700">মোট ফি পরিমাণ:</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-orange-600">{totalFee}</span>
                    <span className="text-xs text-gray-500">টাকা</span>
                  </div>
                </div>
              </div>
              <div className="w-full col-span-2">
                <Button className="w-full" onClick={handlePayment}>Pay</Button>
              </div>
            </div>
          </form>
        }
        {/* Bottom Padding for Mobile */}
        <div className="h-20"></div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionStudent;
