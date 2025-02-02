import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResultFieldData, setResultError } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import bnBijoy2Unicode from "../../utils/conveter";
import 'animate.css/animate.min.css';
import { toast, cssTransition } from "react-toastify";
const bounce = cssTransition({
    enter: 'animate__animated animate__bounceIn',
    exit: 'animate__animated animate__bounceOut',
});

const ResultRequest = () => {
    const [notification, setNotification] = useState(true)
    const [buttonDisable, setButtonDisable] = useState(true)
    const { academicSession, exam, classList, status, error, resultStatus, resultError } = useSelector((state) => state.studentResultPublicView);
    const { schoolid } = useParams();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useFormContext();
    const [SessionID, ExamID, SubClassID, userid] = watch(["SessionID", "ExamID", "SubClassID", "userid"])
    const navigate = useNavigate();
    const dispatch = useDispatch()
    useEffect(() => {
        console.log(SessionID, ExamID, SubClassID, userid);
      
        if (SessionID && ExamID && SubClassID && userid) {
          setButtonDisable(false);
        }
        else {
          setButtonDisable(true);

        }
      }, [SessionID, ExamID, SubClassID, userid]);

    const onSubmit = (data) => {
        navigate(`/${schoolid}/students/${data.SessionID}/${data.ExamID}/${data.SubClassID}/${data.userid}`)
    }
   

    /*if (resultStatus === 'failed') {
        console.log("==============");
        // console.log(resultError);
        setResultError(null)
        toast.dark("দুঃখিত, কোন তথ্য পাওয়া যায়নি!", {
            className: "toast-error-container toast-error-container-after min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
            style: {
                boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
            },
            autoClose: false,
            transition: bounce,
            position: "bottom-center",
            type: "error",
            enter: 'zoomIn',
            exit: 'zoomOut',
            appendPosition: false,
            collapse: true,
            collapseDuration: 300,
            closeButton: false
        })
        // navigate(`/${schoolid}/page_not_found`);
    }*/
    const toastShown = useRef(false); // Use a ref to track if the toast has been shown

    useEffect(() => {
        if (resultStatus === 'failed' && !toastShown.current) {
            dispatch(setResultError(null));
            toastShown.current = true; // Set the flag to true

            toast.dark("দুঃখিত, কোন তথ্য পাওয়া যায়নি!", {
                className: "toast-error-container toast-error-container-after min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
                style: {
                    boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
                },
                // autoClose: false,
                transition: bounce,
                position: "bottom-center",
                type: "error",
                closeButton: false,
            });
        }
    }, [resultStatus, setResultError]);
    return (
        <div className=" pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">

            <form className="w-full  shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md" onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-theme-color font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 "> ব্যক্তিগত ফলাফল</h1>
                </div>

                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">
                            <select
                                className={`relative z-20 w-full appearance-none rounded border-2 bg-transparent py-3 px-4 outline-none transition transition ease-linear duration-300	 
                                        ${errors.SessionID ? 'border-red-500 focus:border-[#f44336]' : 'border-stroke focus:border-primary'}`}

                                {...register("SessionID", { required: true })}
                            >
                                <option value="" className="text-body">শিক্ষাবর্ষ</option>
                                {academicSession.map((session) => (
                                    <option key={session.SessionID} value={session.SessionID} className="text-body">
                                        {bnBijoy2Unicode(session.SessionName)}
                                    </option>
                                ))}
                            </select>

                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg
                                    className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill=""
                                        ></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">

                            <select
                                className={`relative z-20 w-full appearance-none rounded border-2 border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary  ${errors.ExamID ? 'border-red-500 focus:border-[#f44336]' : 'border-stroke focus:border-primary'}`}

                                {...register("ExamID", { required: true })}
                            >
                                <option value="" className="text-body">পরীক্ষা</option>

                                {exam.map((session) => (
                                    <option key={session.ExamID} value={session.ExamID} className="text-body">
                                        {bnBijoy2Unicode(session.ExamName)}
                                    </option>
                                ))}
                            </select>

                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg
                                    className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill=""
                                        ></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">
                            <select
                                className={`relative z-20 w-full appearance-none rounded border-2 border-stroke bg-transparent py-4 px-4 outline-none transition focus:border-primary active:border-primary ${errors.SubClassID ? 'border-red-500 focus:border-[#f44336]' : 'border-stroke focus:border-primary'}`}
                                {...register("SubClassID", { required: true })}

                            >
                                <option value="" className="text-body">মারহালা</option>

                                {classList.map((session) => (
                                    <option key={session.SubClassID} value={session.SubClassID} className="text-body">
                                        {bnBijoy2Unicode(session.SubClass)}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                <svg className="fill-current"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <g opacity="0.8">
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                            fill=""
                                        ></path>
                                    </g>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div className="w-full">
                        <input
                            name="userid"
                            type="text"
                            placeholder="আইডি"
                            {...register("userid", { required: true })}
                            className={`w-full rounded border-2 border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter  ${errors.userid ? 'border-red-500 focus:border-[#f44336]' : 'border-stroke focus:border-primary'}`} />
                    </div>

                    <div className="">
                        <button type="submit" disabled={buttonDisable} className={`${buttonDisable? "bg-[#E0E0E0]" : "bg-theme-color text-white"} transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}>দাখিল করুন</button>
                    </div>

                </div>


            </form>
        </div>
    )
}

export default ResultRequest;