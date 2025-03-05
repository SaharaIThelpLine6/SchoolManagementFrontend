import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import bnBijoy2Unicode from "../../utils/conveter";
import { setResultError } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { toast } from "react-toastify";
import AnimatedSelect from "../../components/Forms/AnimatedSelect";

const ClassResultForm = () => {
    const { academicSession, exam, classList, status, error, resultStatus } = useSelector((state) => state.studentResultPublicView);
    const [buttonDisable, setButtonDisable] = useState(true)

    const { schoolid } = useParams();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useFormContext();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = (data) => {
        navigate(`/${schoolid}/classes/${data.SessionID}/${data.ExamID}/${data.SubClassID}`)
    }
    const [SessionID, ExamID, SubClassID] = watch(["SessionID", "ExamID", "SubClassID"])
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
        <div className="pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">
            <form className="w-full bg-white shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md" onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-theme-color font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 ">ক্লাশ/মারহালা ভিত্তিক ফলাফল</h1>
                </div>
                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                    <AnimatedSelect registerKey={"SessionID"} required={"This field is require"} options={academicSession} nameField={"SessionName"} valueField={"SessionID"} title={" শিক্ষাবর্ষ"}  />
                    <AnimatedSelect registerKey={"ExamID"} required={"This field is require"} options={exam} nameField={"ExamName"} valueField={"ExamID"} title={" পরীক্ষা"}  />
                    <AnimatedSelect registerKey={"SubClassID"} required={"This field is require"} options={classList} nameField={"SubClass"} valueField={"SubClassID"} title={"মারহালা"}  />
                    
                    <div className="">
                        <button type="submit" disabled={buttonDisable} className={`${buttonDisable ? "bg-[#E0E0E0]" : "bg-theme-color text-white"} transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}>দাখিল করুন</button>
                    </div>

                </div>


            </form>
        </div>

    )
}

export default ClassResultForm;