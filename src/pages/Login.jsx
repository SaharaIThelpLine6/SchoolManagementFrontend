import { useFormContext } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput"; // Updated to use DefaultInput
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import LoginInput from "../components/Forms/LoginInput";

const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleSubmit } = useFormContext();
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
    <section className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-blue-100 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="w-full max-w-[360px] sm:max-w-md bg-[#ddeffe] rounded-lg shadow-lg border-b-8 border-[#ffa500] flex flex-col">
        {/* Banner */}
        <div className="bg-[#007af7] p-4 sm:p-6 text-center rounded-t-xl relative">
          <img
            src="/saharaITnewlogo.svg"
            alt="Logo"
            className="mx-auto w-36 sm:w-48 filter brightness-0 invert"
          />
          <p className="text-white text-xs sm:text-sm mt-2 sm:mt-3 font-lato">
            কওমি মাদরাসার জন্য একটি পূর্ণ সমাধান
          </p>
          <img
            src="/QMMSoftIcon.svg"
            alt="Icon"
            className="absolute top-2 right-2 w-12 sm:w-24 opacity-10 filter brightness-0 invert"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 sm:p-6 px-12 sm:px-12 space-y-3 sm:space-y-4 font-lato flex-1 flex flex-col justify-between"
        >
          <div className="flex justify-center">
            <img
              src="/lock.png"
              alt="Lock"
              className="w-12 sm:w-16 mb-3 sm:mb-4"
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <LoginInput
              label="School ID"
              type="number"
              placeholder="Enter School ID"
              registerKey="school_id"
              icon="FaPhone" // Pass icon name as a string
            />

            <LoginInput
              label="Username"
              type="text"
              placeholder="Enter Username"
              registerKey="username"
              icon="FaUser" // Pass icon name as a string
            />

            {/* Password with toggle */}
            <div className="relative">
              <LoginInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                registerKey="password"
                icon="FaLock" // Pass icon name as a string
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[40px] sm:top-[36px] text-gray-400 hover:text-gray-600 text-base sm:text-lg focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center bg-[#007af7] hover:bg-blue-600 text-white py-2 sm:py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors duration-200 mt-auto"
          >
            <FiArrowRight className="mr-1.5 text-base sm:text-lg" />
            লগিন অথবা সাইন আপ
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
