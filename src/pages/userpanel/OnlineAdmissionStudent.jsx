import { skipToken } from '@reduxjs/toolkit/query';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Button from '../../components/Button/Button';
import {
  useGetUserDetailsQuery,
  useGetUserPanelStudentFeeAdmissionsQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';
import { useDefaultSessionForUserPanel } from '../../hooks/useDefaultSessionForUserPanel';
import { useEffect } from 'react';

const OnlineAdmissionStudent = () => {
  const methods = useForm();
  const defaultSession = useDefaultSessionForUserPanel();


  const translate = useTranslate();
  const { setValue } = methods;

  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  /* ================= USER DETAILS ================= */
  const {
    data: userDetails,
    isLoading: isUserDetailsLoading,
    isError: isUserDetailsError,
  } = useGetUserDetailsQuery(currentSession);

  const sfgnid = 1;

  // 🔥 SAFE ACCESS
  const admissionId = userDetails?.AdmissionID ?? null;

  /* ================= STUDENT FEE ADMISSION ================= */
  const {
    data: studentFeeAdmissionData,
    isLoading: isFeeLoading,
    error: feeError,
  } = useGetUserPanelStudentFeeAdmissionsQuery(
    admissionId && sfgnid
      ? { admissionId, sfgnid }
      : skipToken
  );



  console.log(studentFeeAdmissionData, 'studentFeeAdmissionData');
  console.log(currentSession, 'currentSession');
  console.log(userDetails, 'userDetails');

  if (isUserDetailsLoading) return <div>Loading...</div>;
  if (isUserDetailsError) return <div>User Load Error</div>;

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
                {/* Row 1 */}
                <div className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150">
                  <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                    ১
                  </div>
                  <div className="p-3 border-r border-blue-100 col-span-7">
                    ভর্তি ফি
                  </div>
                  <div className="p-3 text-right col-span-3 font-medium">
                    ২,০০০
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150">
                  <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                    ২
                  </div>
                  <div className="p-3 border-r border-blue-100 col-span-7">
                    বার্ষিক ফি (রেজি ভর্তুকি)
                  </div>
                  <div className="p-3 text-right col-span-3 font-medium">
                    ৩,০০০
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150">
                  <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                    ৩
                  </div>
                  <div className="p-3 border-r border-blue-100 col-span-7">
                    মাসিক বেতন
                  </div>
                  <div className="p-3 text-right col-span-3 font-medium">
                    ২,৫০০
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150">
                  <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                    ৪
                  </div>
                  <div className="p-3 border-r border-blue-100 col-span-7">
                    অন্যান্য খরচ
                  </div>
                  <div className="p-3 text-right col-span-3 font-medium">
                    ৩০০
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-12 text-sm hover:bg-blue-50/50 transition-colors duration-150">
                  <div className="p-3 text-center border-r border-blue-100 col-span-2 font-medium">
                    ৫
                  </div>
                  <div className="p-3 border-r border-blue-100 col-span-7">
                    বিদ্যুৎ বিল
                  </div>
                  <div className="p-3 text-right col-span-3 font-medium">
                    ৫০০
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 font-semibold">
                <div className="text-sm text-gray-700">মোট ফি পরিমাণ:</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg text-orange-600">৯,৩০০</span>
                  <span className="text-xs text-gray-500">টাকা</span>
                </div>
              </div>
            </div>
            <div className="w-full col-span-2">
              <Button className="w-full">Pay</Button>
            </div>
          </div>
        </form>

        {/* Bottom Padding for Mobile */}
        <div className="h-20"></div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionStudent;
