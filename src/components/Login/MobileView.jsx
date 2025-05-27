import { useForm, FormProvider } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import LoginInput from "../../components/Forms/LoginInput";

const API_URL = import.meta.env.VITE_SERVER_URL;

const MobileView = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm();
  const { handleSubmit } = methods;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, data, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 200) {
        dispatch(
          login({ token: response.data.token, user: response.data.user })
        );
        navigate("/");
        window.location.reload();
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
        text: error?.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="">
        <section className="md:hidden h-svh w-full flex items-center justify-center from-white to-blue-100 overflow-hidden">
          <div className="w-full h-full bg-[#ddeffe] rounded-lg shadow-lg border-b-8 border-[#ffa500] flex flex-col">
            <div className="bg-[#007af7] text-center rounded-t-xl rounded-b-[40px] relative h-[250px] flex flex-col items-center justify-center">
              <img
                src="/saharaITnewlogo.svg"
                alt="Logo"
                className="mx-auto w-64 filter brightness-0 invert"
              />
              <p className="text-white text-xs mt-2 font-lato">
                কওমি মাদরাসার জন্য একটি পূর্ণ সমাধান
              </p>
              <img
                src="/QMMSoftIcon.svg"
                alt="Icon"
                className="absolute top-2 right-2 w-52 opacity-10 filter brightness-0 invert"
              />
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-6 sm:p-8 md:p-10 px-10 rounded-2xl font-lato flex flex-col gap-6"
            >
              <div className="flex justify-center">
                <img src="/lock.png" alt="Lock Icon" className="w-14 mb-2" />
              </div>

              <div className="flex flex-col gap-4">
                <LoginInput
                  label="School ID"
                  type="number"
                  placeholder="Enter School ID"
                  registerKey="school_id"
                  icon="FaPhone"
                />

                <LoginInput
                  label="Username"
                  type="text"
                  placeholder="Enter Username"
                  registerKey="username"
                  icon="FaUser"
                />

                <div className="relative">
                  <LoginInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    registerKey="password"
                    icon="FaLock"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[40px] text-gray-400 hover:text-gray-600 text-lg focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 bg-[#007af7] hover:bg-blue-600 text-white py-2.5 rounded-full text-base font-semibold transition-all duration-200"
              >
                <FiArrowRight className="text-lg" />
                লগিন অথবা সাইন আপ
              </button>
            </form>
          </div>
        </section>
      </div>
    </FormProvider>
  );
};

export default MobileView;