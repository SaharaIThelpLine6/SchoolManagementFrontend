import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DefaultInput from '../../components/Forms/DefaultInput';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import {
  useGetSoftwareLinkUserPanelQuery,
  usePostUserPhoneMutation,
  usePostUserRegisterMutation,
  usePostVerifyTokenMutation,
} from '../../features/userPanel/userRegistration/userRegistrationQuerySlice';
import Swal from 'sweetalert2';
// Multi-step hook
export function useMultistepForm(steps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  function next() {
    setCurrentStepIndex((i) => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  }

  function back() {
    setCurrentStepIndex((i) => {
      if (i <= 0) return i;
      return i - 1;
    });
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    setCurrentStepIndex(index);
  }

  return {
    currentStepIndex,
    step: steps[currentStepIndex],
    steps,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    next,
    back,
    goToStep,
  };
}

// Step 1 — Placeholder Payment
export function StepOne({ phone, otpTimer, onResend, studentCode }) {
  return (
    <>
      {/* Step indicator ... */}
      <ol className="flex items-center w-full space-x-4 mb-4 max-w-[200px] mx-auto">
        <li className="flex w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-info after:border-4 after:inline-block after:ms-4 after:rounded-full">
          {' '}
          <span className="flex items-center justify-center w-10 h-10 bg-neutral-tertiary rounded-full lg:h-12 lg:w-12 shrink-0 text-white bg-info border border-info">
            {' '}
            <svg
              className="w-[26px] h-[26px]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
              />
            </svg>{' '}
          </span>{' '}
        </li>{' '}
        <li className="flex items-center">
          {' '}
          <span className="flex items-center justify-center w-10 h-10 bg-neutral-tertiary rounded-full lg:h-12 lg:w-12 shrink-0 text-info border border-info">
            {' '}
            <svg
              className="w-5 h-5 text-body"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 7 2 2 4-4m-5-9v4h4V3h-4Z"
              />
            </svg>{' '}
          </span>{' '}
        </li>{' '}
      </ol>

      {!phone && (
        <DefaultInput
          registerKey={'StudentCode'}
          label={'Student ID'}
          placeholder={'Enter Student ID'}
          type="text"
        />
      )}

      {phone && (
        <div className="">
          <p className="text-[#d6d6d6] text-[18px] bg-gray-400 block border border-[#d6d6d6] rounded-[5px] py-1 pl-2">
            {studentCode}
          </p>
          <p className="text-[#d6d6d6] text-[18px] bg-gray-400 block border border-[#d6d6d6] rounded-[5px] py-1 mt-2 pl-2">
            {phone}
          </p>

          <p className="text-blue-700 text-sm mt-1">
            উপরের নাম্বারে OTP পাঠানো হয়েছে। Time left:{' '}
            <strong>{otpTimer}s</strong>
          </p>

          <DefaultInput
            registerKey={'otp'}
            placeholder={'Enter OTP'}
            type="number"
            require={true}
          />
          {otpTimer === 0 && (
            <button
              onClick={onResend}
              type="button"
              className="mt-1 text-[14px] text-blue-600 underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      )}
    </>
  );
}

// Step 2 — Placeholder Review
export function StepTwo() {
  return (
    <>
      <ol className="flex items-center w-full space-x-4 mb-4">
        <li className="flex w-full items-center text-fg-brand after:content-[''] after:w-full after:h-1 after:border-b after:border-info after:border-4 after:inline-block after:ms-4 after:rounded-full">
          <span className="flex items-center justify-center w-10 h-10 border border-info rounded-full lg:h-12 lg:w-12 shrink-0 text-info">
            <svg
              className="w-[36px] h-[36px]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 11.917 9.724 16.5 19 7.5"
              />
            </svg>
          </span>
        </li>
        <li className="flex w-full items-center after:content-[''] after:w-full after:h-1  after:rounded-full after:border-b after:border-info after:border-4 after:inline-block after:ms-4">
          <span className="flex items-center justify-center w-10 h-10  bg-neutral-tertiary rounded-full lg:h-12 lg:w-12 shrink-0 text-info border border-info">
            <svg
              className="w-[26px] h-[26px]"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 9h3m-3 3h3m-3 3h3m-6 1c-.306-.613-.933-1-1.618-1H7.618c-.685 0-1.312.387-1.618 1M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm7 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
              />
            </svg>
          </span>
        </li>
        <li className="flex items-center">
          <span className="flex items-center justify-center w-10 h-10  bg-neutral-tertiary rounded-full lg:h-12 lg:w-12 shrink-0 text-white bg-info border border-info">
            <svg
              className="w-5 h-5 text-body"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-6 7 2 2 4-4m-5-9v4h4V3h-4Z"
              />
            </svg>
          </span>
        </li>
      </ol>

      {/* <DefaultInput
        registerKey={'username'}
        label={'User name'}
        placeholder={'Enter User name'}
        type="text"
      /> */}
      <DefaultInput
        registerKey={'password'}
        type="password"
        label={'Password'}
        placeholder={'Enter Password'}
      />
    </>
  );
}

// Full Multi-Step Form
export default function UserRegistration() {
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    agree: false,
  });
  const [getUserPhone] = usePostUserPhoneMutation();
  const [verifyUserPanelToken] = usePostVerifyTokenMutation();
  const [registerUserPanel] = usePostUserRegisterMutation();
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, navigate]);

  function updateFields(fields) {
    setFormData((prev) => ({ ...prev, ...fields }));
  }
  const methods = useForm({ shouldUnregister: false });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = methods;

  const studentCode = methods.watch('StudentCode');
  const { data } = useGetSoftwareLinkUserPanelQuery();
  const mobileAppInstallLink = data?.MobileAppInstall;

  const { steps, step, currentStepIndex, isFirstStep, isLastStep, next, back } =
    useMultistepForm([<StepOne />, <StepTwo />]);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Start countdown timer
  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  async function requestOtp(studentCode, madrasaCode) {
    const res = await getUserPhone({
      school_id: madrasaCode,
      usercode: studentCode,
    }).unwrap();

    setPhoneNumber(res.phone); // save phone number
    setOtpTimer(120); // 30 sec timer
  }

  async function onSubmit(data) {
    // console.log(data);
    // console.log(currentStepIndex);
    // if (currentStepIndex === 0) {
    //     return next();
    // }
    if (currentStepIndex === 0) {
      if (!data.otp) {
        try {
          await requestOtp(data.StudentCode, schoolid);
        } catch (error) {
          // console.log(error);

          const message =
            error?.data?.error || 'Something went wrong. Please try again.';

          Swal.fire({
            icon: 'warning',
            title: 'Oops!',
            text: message,
            confirmButtonText: 'OK',
          });
        }
      } else {
        const res = await verifyUserPanelToken({
          school_id: schoolid,
          usercode: data.StudentCode,
          otp: data.otp,
        }).unwrap();
        localStorage.setItem('user_panel_token', res.token);
        return next();
      }
    }
    if (currentStepIndex === 1) {
      const res = await registerUserPanel({
        // username: data.username,
        password: data.password,
      });
      console.log(res, 'response');

      if (res.data && res.data.token) {
        localStorage.setItem('user_panel_token', res.data.token);
        navigate(`/${schoolid}/dashboard`);
      } else {
        console.log(res.error.data.error);

        toast.error(res?.error.data.error || 'Registration failed');
      }
      console.log(res);
    }
  }

  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return '/logo.png';
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString('base64');
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };

  return (
    <section className="h-[100svh] md:h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-blue-100 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full h-full sm:h-auto md:max-w-md bg-[#ddeffe] flex flex-col">
        <div className="bg-[#007af7] p-6 sm:p-8 md:p-6 text-center sm:rounded-t-xl rounded-b-[40px] md:rounded-b-none relative min-h-[200px] md:min-h-[150px] flex flex-col items-center justify-center">
          <img
            src={bufferConveter(schoolData?.Logo?.data)}
            alt="Logo"
            className="mx-auto w-[80px] md:w-[80px] mb-2"
          />
          <p className="text-white text-[18px] md:text-[30px] mt-2 md:mt-3 font-SolaimanLipi leading-[40px]">
            {schoolData?.InstitutionName}
          </p>
        </div>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-sm mx-auto mt-6 w-full px-4"
          >
            <div className="mb-4 text-body">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            {steps.map((s, index) => (
              <div
                key={index}
                style={{
                  display: index === currentStepIndex ? 'block' : 'none',
                }}
              >
                {index === 0 ? (
                  <StepOne
                    phone={phoneNumber}
                    otpTimer={otpTimer}
                    onResend={() =>
                      requestOtp(getValues('StudentCode'), schoolid)
                    }
                    studentCode={studentCode}
                  />
                ) : (
                  s
                )}
              </div>
            ))}

            <div className="flex justify-center mt-6 gap-4">
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={back}
                  className="px-6 py-2 bg-brand inline-block rounded-[4px] border border-blue-600 text-blue-600"
                >
                  Back
                </button>
              )}

              <button
                type={isLastStep ? 'submit' : 'button'}
                onClick={!isLastStep ? handleSubmit(onSubmit) : undefined}
                className="px-6 py-2 bg-brand text-white bg-blue-600 hover:bg-blue-700 inline-block rounded-[4px]"
              >
                {isLastStep ? 'Submit' : 'Next'}
              </button>
            </div>
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600">
              ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
              <Link
                to={`/${schoolid}/login`}
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                লগইন করুন
              </Link>
            </p>
            {mobileAppInstallLink && (
              <p className="text-center text-sm text-gray-600 mt-2">
                <Link
                  target="_blank"
                  to={mobileAppInstallLink}
                  className="text-blue-600 font-medium hover:underline hover:text-blue-700"
                >
                  রেজিস্ট্রেশন না করতে পারলে ভিডিও দেখুন।
                </Link>
              </p>
            )}
          </form>
        </FormProvider>
      </div>
    </section>
  );
}
