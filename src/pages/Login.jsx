import { useFormContext } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";
import { useDispatch } from 'react-redux';
import { login } from "../features/auth/authSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Login = () => {
    const {
        handleSubmit
    } = useFormContext();
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        console.log(data);

        try {
            // Make the POST request to the API
            const response = await axios.post(
                'http://10.11.13.183:3000/api/users/login',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json', // Set content type to JSON
                    },
                }
            );
            if (response.status === 200) {
                console.log(response.data.token);

                dispatch(login({ token: response.data.token, user: response.data.user }));
                navigate('/');
                console.log('Login successful:', response.data);
            } else {
                console.log('Login failed:', response.data);
            }
        } catch (error) {
            console.error('Error during login request:', error);
        }
    };

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="w-full bg-white rounded-lg shadow max-w-[400px]">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Login to your account
                        </h1>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-2 md:space-y-2">
                                <DefaultInput label={"School ID"} type={'number'} placeholder={"Enter School ID"} registerKey={"school_id"} />
                                <DefaultInput label={"Username"} type={'text'} placeholder={"Username"} registerKey={"username"} />
                                <DefaultInput label={"Password"} type={'password'} placeholder={"Password"} registerKey={"password"} />
                            </div>

                            <div className="mt-5">
                                <button type="submit" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300  shadow-lg shadow-green-500/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2 block w-full ">Login</button>
                            </div>
                            {/* <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Don’t have an account yet? <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                            </p> */}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login;