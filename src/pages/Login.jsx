import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import LoginInput from "../components/Forms/LoginInput";
import SvgIcon from "../components/icons/SvgIcon";
import { usePostLoginMutation } from "../features/dashboard/dashboardQuerySlice";
import { initSocket } from "../helper/socket";

// const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm();
  const { handleSubmit } = methods;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const [ postLogin ] = usePostLoginMutation()

  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await postLogin(data).unwrap();
      if (response.token) {
        dispatch(
          login({ token: response.token, user: response.user })
        );
        initSocket(response.token);
        navigate("/");
        // window.location.reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid credentials",
          confirmButtonColor: "#3B82F6",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error?.data?.error || "Something went wrong",
        confirmButtonColor: "#3B82F6",
      });
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

              <div className="relative">
                <LoginInput
                  label="পাসওয়ার্ড :"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  registerKey="password"
                  icon="FaLock"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-[2.5rem] text-gray-400 hover:text-gray-600 text-lg focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <SvgIcon name="FiEyeOff" size={18} />
                  ) : (
                    <SvgIcon name="FaEye" size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 md:gap-1 bg-[#007af7] hover:bg-blue-600 text-white py-2.5 rounded-full md:rounded-md text-base font-semibold md:font-medium transition-all duration-200 md:mt-auto"
            >
              <SvgIcon name="FiArrowRight" size={18} />
              লগিন অথবা সাইন আপ
            </button>

            <p className="text-center text-sm text-gray-600 mt-2">
              পাসওয়ার্ড ভুলে গেছেন?{' '}
              <Link
                to={`/forget_password`}
                className="text-blue-600 font-medium hover:underline hover:text-blue-700"
              >
                পাসওয়ার্ড রিসেট করুন
              </Link>
            </p>
          </form>
        </div>
      </section>
    </FormProvider>
  );
};

export default Login;
