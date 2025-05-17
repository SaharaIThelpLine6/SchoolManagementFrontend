import { useFormContext } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";
import { useDispatch, useSelector } from 'react-redux';
import { login } from "../features/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_SERVER_URL;

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const {
        handleSubmit
    } = useFormContext();
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const auth = useSelector((state) => state.auth); 

    useEffect(() => {
        if (auth.token) {
            navigate("/"); // Redirect to home if already logged in
        }
    }, [auth.token, navigate]);

    const onSubmit = async (data) => {
        console.log(data);

        try {
            // Make the POST request to the API
            const response = await axios.post(
                `${API_URL}/api/users/login`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    width: '300px',
                    title: 'Login Successful!',
                    text: 'You have been logged in successfully',
                    showConfirmButton: false,
                    timer: 2000
                  });
                  
                console.log(response.data.token);
                

                dispatch(login({ token: response.data.token, user: response.data.user }));
                navigate('/');
                console.log('Login successful:', response.data);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text:  'Invalid credentials',
                    confirmButtonColor: '#3B82F6'
                  });
                
                console.log('Login failed:', response.data);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: error|| 'Invalid credentials',
                confirmButtonColor: '#3B82F6'
              });
        }
    };

    return (
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 max-w-md hover:shadow-2xl transition-shadow duration-300">
                <div className="p-8 space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-sky-700 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-gray-500">Sign in to continue to your account</p>
                    </div>
    
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <DefaultInput 
                                label={"School ID"} 
                                type={'number'} 
                                placeholder={"Enter School ID"} 
                                registerKey={"school_id"}
                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-200"
                            />
                            <DefaultInput 
                                label={"Username"} 
                                type={'text'} 
                                placeholder={"Username"} 
                                registerKey={"username"}
                                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-200"
                            />
                            
                            {/* Password Input with Toggle */}
                            <div className="relative">
                                <DefaultInput 
                                    label={"Password"} 
                                    type={showPassword ? 'text' : 'password'} 
                                    placeholder={"••••••••"} 
                                    registerKey={"password"}
                                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-200 pr-10 mb-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-500"
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
    
                        <div className="mt-6">
                            <button 
                                type="submit" 
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-md transition-all duration-300"
                            >
                                Continue to Dashboard
                                <span className="ml-2">→</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
    )
}

export default Login;