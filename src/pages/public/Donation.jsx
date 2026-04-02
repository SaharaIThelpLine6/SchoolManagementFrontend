import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import bnBijoy2Unicode from "../../utils/conveter";
import { fetchResultFieldData, setResultError } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { toast } from "react-toastify";
import AnimatedSelect from "../../components/Forms/AnimatedSelect";
import ResultLayout from "./ResultLayout";

const Donation = () => {
    const { academicSession, exam, classList, status, error, resultStatus, schoolData } = useSelector((state) => state.studentResultPublicView);
    const [buttonDisable, setButtonDisable] = useState(true)

    const { schoolid } = useParams();

    const methods = useForm();
    const { handleSubmit, watch, setValue, register } = methods;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = (data) => {
        navigate(`/${schoolid}/classes/${data.SessionID}/${data.ExamID}/${data.SubClassID}`)
    }
    const [SessionID, ExamID, SubClassID] = watch(["SessionID", "ExamID", "SubClassID"])

    useEffect(() => {
        if (schoolData) {
            if (schoolData && schoolData?.isClassResultShowable?.Action != 1) {
                navigate(`/${schoolid}`)
            }
        }

    }, [schoolData])
    useEffect(() => {
        console.log(SessionID, ExamID, SubClassID);

        if (SessionID && ExamID && SubClassID) {
            setButtonDisable(false);
        }
        else {
            setButtonDisable(true);

        }
    }, [SessionID, ExamID, SubClassID]);
    const toastShown = useRef(false);
    useEffect(() => {
        if (resultStatus === 'failed' && !toastShown.current) {
            dispatch(setResultError(null));
            toastShown.current = true;

            toast.dark("দুঃখিত, কোন তথ্য পাওয়া যায়নি!", {
                type: "error",
            });
        }
    }, [resultStatus, setResultError]);

    return (
        <FormProvider {...methods}>
            <div className="pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">
                <form className="w-full bg-white shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md" onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-theme-color font-semibold rounded-t-md">
                        <h1 className="text-white text-2xl py-4 ">ক্লাশ/মারহালা ভিত্তিক ফলাফল</h1>
                    </div>
                    <div className="px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">
                        <input
                            name="name"
                            type="text"
                            placeholder="নাম"
                            {...register("name", { required: true })}
                            className={`w-full rounded border-2 border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter`}
                        />

                        <textarea
                            name="address"
                            type="text"
                            placeholder="ঠিকানা"
                            {...register("address", { required: true })}
                            className={`w-full rounded border-2 border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter`}
                        ></textarea>

                        <input
                            name="phone"
                            type="text"
                            placeholder="ফোন নম্বর"
                            {...register("phone", { required: true })}
                            className={`w-full rounded border-2 border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter`}
                        />

                        <AnimatedSelect registerKey={"SessionID"} required={"This field is require"} options={academicSession} nameField={"SessionName"} valueField={"SessionID"} title={" শিক্ষাবর্ষ"} />

                        <input
                            name="amount"
                            type="text"
                            placeholder="পরিমাণ"
                            {...register("amount", { required: true })}
                            className={`w-full rounded border-2 border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter`}
                        />

                        <div className="">
                            <button type="submit" disabled={buttonDisable} className={`${buttonDisable ? "bg-[#E0E0E0]" : "bg-theme-color text-white"} transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}>দাখিল করুন</button>
                        </div>

                    </div>


                </form>
            </div>
        </FormProvider>

    )
}

export default Donation;