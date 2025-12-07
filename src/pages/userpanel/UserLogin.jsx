import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Buffer } from "buffer";
import DefaultInput from "../../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { usePostLoginUserPanelMutation } from "../../features/userPanel/userLoginVerify/userloginVerifyQuerySlice";
import { fetchResultFieldData } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
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
    useEffect(() => {
        dispatch(fetchResultFieldData(schoolid));
    }, [dispatch, navigate]);

    const methods = useForm();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = methods;

    useEffect(()=>{
        const token = localStorage.getItem("user_panel_token")

        if(token){
            // navigate(`/${schoolid}/dashboard`)
             window.location = `/${schoolid}/dashboard`
        }
    }, [])

    const onSubmit = async (data) => {
        try {
            // const res = await loginUserPanel({
            //     username: data.username,
            //     password: data.password,
            //     school_id: schoolid
            // }).unwrap();
            // console.log(data);
            
            const response = await loginUserPanel({
                username: data.username,
                password: data.password,
                school_id: schoolid
            });
            // console.log(response.data.token);

            if (response.data.token) {
                localStorage.setItem("user_panel_token", response.data.token);
                navigate(`/${schoolid}/dashboard`);
            } else {
                toast.error("Invalid login response");
            }

        } catch (err) {
            console.log(err);
            toast.error(err?.data?.error || "Login failed");
        }
    }

    const bufferConveter = (bufferData) => {
        if (!bufferData) {
            return "/logo.png";
        }
        const buffer = Buffer.from(bufferData);
        const base64String = buffer.toString("base64");
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
                    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-6 w-full px-4">
                        <DefaultInput registerKey={"username"} label={"User name"} placeholder={"Enter User name"} type="text" />
                        <DefaultInput registerKey={"password"} type="password" label={"Password"} placeholder={"Enter Password"} />

                        <div className="flex justify-center mt-6 gap-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-brand text-white bg-blue-600 hover:bg-blue-700 inline-block rounded-[4px]"
                            >
                                Submit
                            </button>

                        </div>
                    </form>
                </FormProvider>
            </div>



        </section>
    );
}
