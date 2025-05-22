import { useFormContext } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../features/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FiArrowRight } from "react-icons/fi";

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
    <section className="min-h-screen flex sm:items-center items-start justify-center bg-gradient-to-b from-white to-blue-100">
      <div className="w-full md:max-w-md shadow-md pb-5 rounded-b-xl rounded-md bg-[#ddeffe] flex flex-col overflow-hidden border-b-[#ffa500] border-b-8">
        {/* Banner */}
        <div className="bg-[#007af7] p-6 text-center rounded-b-3xl relative">
          <img
            src="/saharaITnewlogo.svg"
            alt="Logo"
            width={200}
            className="mx-auto filter brightness-0 invert"
          />
          <p className="text-white text-sm mt-4">
            কওমি মাদরাসার জন্য একটি পূর্ণ সমাধান
          </p>
          <img
            src="/QMMSoftIcon.svg"
            alt="Icon"
            width={100}
            className="absolute top-4 right-4 opacity-10 filter brightness-0 invert"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-4 font-lato"
        >
          <div className="flex justify-center">
            <img src="/lock.png" alt="Lock" width={80} className="mb-4" />
          </div>

          <DefaultInput
            label="School ID"
            type="number"
            placeholder="Enter School ID"
            registerKey="school_id"
          />

          <DefaultInput
            label="Username"
            type="text"
            placeholder="Enter Username"
            registerKey="username"
          />

          {/* Password with toggle */}
          <div className="relative">
            <DefaultInput
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              registerKey="password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center bg-[#007af7] hover:bg-blue-600 text-white py-2 rounded-full text-lg font-medium"
          >
            <FiArrowRight className="mr-2" />
            লগিন অথবা সাইন আপ
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
