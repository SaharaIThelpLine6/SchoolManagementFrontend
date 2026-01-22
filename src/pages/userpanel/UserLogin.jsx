import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Buffer } from 'buffer';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DefaultInput from '../../components/Forms/DefaultInput';
import { fetchResultFieldData } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import { usePostLoginUserPanelMutation } from '../../features/userPanel/userLoginVerify/userloginVerifyQuerySlice';
import { useGetSoftwareLinkUserPanelQuery } from '../../features/userPanel/userRegistration/userRegistrationQuerySlice';
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

// Full Multi-Step Form
export default function UserLogin() {
  const { schoolData } = useSelector((state) => state.studentResultPublicView);
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginUserPanel] = usePostLoginUserPanelMutation();
    const { data } = useGetSoftwareLinkUserPanelQuery();
    const mobileAppInstallLink = data?.MobileAppInstall;
  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, navigate]);

  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const token = localStorage.getItem('user_panel_token');

    if (token) {
      // navigate(`/${schoolid}/dashboard`)
      window.location = `/${schoolid}/dashboard`;
    }
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await loginUserPanel({
        usercode: data.usercode,
        // username: data.username,
        password: data.password,
        school_id: schoolid,
      });

      if (response?.data?.token) {
        localStorage.setItem('user_panel_token', response.data.token);
        navigate(`/${schoolid}/dashboard`);
      } else {
        toast.error(response.error.data.error || 'Invalid login response');
      }
    } catch (err) {
      console.log(err);
      // server থেকে আসা বাংলা error দেখাবে
      toast.error(err?.data?.error || err?.error || 'লগইন ব্যর্থ হয়েছে');
    }
  };

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
            <DefaultInput
              registerKey={'usercode'}
              label={'User Code'}
              placeholder={'Enter User code'}
              type="text"
            />
            {/* <DefaultInput
              registerKey={'username'}
              label={'User Name'}
              placeholder={'Enter User name'}
              type="text"
            /> */}
            <DefaultInput
              registerKey={'password'}
              type="password"
              label={'Password'}
              placeholder={'Enter Password'}
            />

            {/* Login Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-medium rounded-md
                   hover:bg-blue-700 transition duration-200"
              >
                Login
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-grow h-px bg-gray-300" />
            </div>

            {/* Create Account */}
            <p className="text-center text-sm text-gray-600">
              কোনো অ্যাকাউন্ট নেই?{' '}
              <Link
                to={`/${schoolid}/rg`}
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                অ্যাকাউন্ট তৈরি করুন
              </Link>
            </p>
            <p className="text-center text-sm text-gray-600 mt-2">
              পাসওয়ার্ড ভুলে গেছেন?{' '}
              <Link
                to={`/${schoolid}/forget_pass`}
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                পাসওয়ার্ড রিসেট করুন
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
