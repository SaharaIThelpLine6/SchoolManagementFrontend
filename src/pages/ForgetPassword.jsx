import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoginInput from "../components/Forms/LoginInput";
import SvgIcon from "../components/icons/SvgIcon";
import { usePostForgetPasswordMutation, usePostLoginMutation, usePostResetPasswordMutation, usePostVerifyOTPMutation } from "../features/dashboard/dashboardQuerySlice";
import { initSocket } from "../helper/socket";
import DefaultInput from "../components/Forms/DefaultInput";
// const API_URL = import.meta.env.VITE_SERVER_URL;
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
export function StepOne({ phone, otpTimer, onResend, username }) {
  return (
    <>


      {!phone && (
        <div className="flex flex-col gap-4 md:gap-4">
          <LoginInput
            label="মাদ্রাসার কোড :"
            type="number"
            placeholder="Madrasa Code"
            registerKey="school_id"
            icon="FaPhone"
          />

          <LoginInput
            label="ইউজার নাম :"
            type="text"
            placeholder="Username"
            registerKey="username"
            icon="FaUser"
          />
        </div>
      )}

      {phone && (
        <div className="">
          <p className="text-[#d6d6d6] text-[18px] bg-gray-400 block border border-[#d6d6d6] rounded-[5px] py-1 pl-2">
            {username}
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
      <DefaultInput
        registerKey={'password'}
        type="password"
        label={'New Password'}
        placeholder={'Enter Password'}
      />
    </>
  );
}
const ForgetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm();
  const { handleSubmit, getValues } = methods;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [forgetPassword] = usePostForgetPasswordMutation()
  const [verifyToken] = usePostVerifyOTPMutation();
  const [resetUserPassword] = usePostResetPasswordMutation()
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  const { steps, step, currentStepIndex, isFirstStep, isLastStep, next, back } =
    useMultistepForm([<StepOne />, <StepTwo />]);
  async function requestOtp(username, school_id) {
    const response = await forgetPassword({
      username, school_id
    }).unwrap();
    setPhoneNumber(response.phone);
    setOtpTimer(300);
  }
  const onSubmit = async (data) => {
    if (currentStepIndex === 0) {
      if (!data.otp) {
        try {
          await requestOtp(data.username, data.school_id);
        } catch (error) {
          console.log(error);

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
        try {
          const res = await verifyToken({
            school_id: data.school_id,
            username: data.username,
            otp: data.otp,
          }).unwrap();
          localStorage.setItem('passwordreset_token', res.token);
          return next();
        } catch (error) {
          const message = error?.data?.error || 'Invalid OTP. Please try again.';
          Swal.fire({
            icon: 'error',
            title: 'OTP Verification Failed',
            text: message,
            confirmButtonText: 'OK',
          });
        }
      }
    }
    if (currentStepIndex === 1) {
      console.log("final pass reset");
      
      const res = await resetUserPassword({
        password: data.password,
      });
      console.log(res, 'response');

      if (res.data) {
        // localStorage.setItem('user_panel_token', res.data.token);
        navigate(`/login`);
      } else {
        console.log(res.error.data.error);

        toast.error(res?.error.data.error || 'Registration failed');
      }
      console.log(res);
    }
  };

  return (
    <FormProvider {...methods}>
      <section className="sm:h-[100svh] md:h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-blue-100 sm:px-6 lg:px-8 overflow-hidden">
        <div className="w-full h-full sm:h-auto md:max-w-md bg-[#ddeffe] rounded-lg shadow-lg border-b-8 border-[#ffa500] flex flex-col">
          {/* Header */}
          <div className="bg-[#007af7] p-6 sm:p-8 md:p-6 text-center sm:rounded-t-xl rounded-b-[40px] md:rounded-b-none relative min-h-[200px] md:min-h-[150px] flex flex-col items-center justify-center">
            <img
              src="/saharaITnewlogo.svg"
              alt="Logo"
              className="mx-auto w-[16rem] md:w-[12rem] filter brightness-0 invert"
            />
            <p className="text-white text-xs md:text-sm mt-2 md:mt-3 font-lato">
              কওমি মাদরাসার জন্য একটি পূর্ণ সমাধান
            </p>
            <img
              src="/QMMSoftIcon.svg"
              alt="Icon"
              className="absolute top-2 right-2 w-[13rem] md:w-[6rem] opacity-10 filter brightness-0 invert"
            />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 sm:p-8 md:px-12 md:py-6 font-lato flex flex-col gap-5 md:gap-4 md:flex-1 md:justify-between"
          >
            <div className="flex justify-center">
              <img
                src="/lock.png"
                alt="Lock Icon"
                className="w-[3.5rem] md:w-[4rem] mb-2 md:mb-4"
              />
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
                      requestOtp(getValues('username'), schoolid)
                    }
                    username={getValues('username')}
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
                {isLastStep ? 'পাসওয়ার্ড রিসেট করুন' : 'Next'}
              </button>
            </div>



            <p className="text-center text-sm text-gray-600 mt-2">
              <Link
                to={`/login`}
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                লগিন অথবা সাইন আপ করুন
              </Link>
            </p>
          </form>
        </div>
      </section>
    </FormProvider>
  );
};

export default ForgetPassword;
