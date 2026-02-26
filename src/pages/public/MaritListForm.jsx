import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { setResultError } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { toast } from "react-toastify";
import AnimatedSelect from "../../components/Forms/AnimatedSelect";

const MaritListForm = () => {
  const { academicSession, exam, classList, status, error, resultStatus } =
    useSelector((state) => state.studentResultPublicView);
  const [searchParams, setSearchParams] = useSearchParams()

  const [buttonDisable, setButtonDisable] = useState(true);
  const { schoolid } = useParams();
  const methods = useForm();
  const { handleSubmit, watch, setValue } = methods;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    navigate(`/${schoolid}/maritlist/${data.SessionID}/${data.ExamID}`);
  };

  const [SessionID, ExamID] = watch(["SessionID", "ExamID"]);

  useEffect(() => {
    if (SessionID && ExamID) {
      setButtonDisable(false);
    } else {
      setButtonDisable(true);
    }
  }, [SessionID, ExamID]);

  useEffect(() => {
    const sessionid = searchParams.get("sessionid")
    const examid = searchParams.get("examid")
    if (sessionid) {
      setValue("SessionID", sessionid)
    }
    if (examid) {
      setValue("ExamID", examid)
    }
  }, [classList])

  const toastShown = useRef(false);
  useEffect(() => {
    if (resultStatus === "failed" && !toastShown.current) {
      dispatch(setResultError(null));
      toastShown.current = true;

      toast.dark("দুঃখিত, কোন তথ্য পাওয়া যায়নি!", {
        type: "error",
      });
    }
  }, [resultStatus, dispatch]);

  return (
    <FormProvider {...methods}>
      <div className="pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">
        <form
          className="w-full bg-white shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="bg-theme-color font-semibold rounded-t-md">
            <h1 className="text-white text-2xl py-4 ">মেধা তালিকা</h1>
          </div>

          <div className="px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">
            <AnimatedSelect
              registerKey="SessionID"
              required="This field is required"
              options={academicSession}
              nameField="SessionName"
              valueField="SessionID"
              title="শিক্ষাবর্ষ"
            />
            <AnimatedSelect
              registerKey="ExamID"
              required="This field is required"
              options={exam}
              nameField="ExamName"
              valueField="ExamID"
              title="পরীক্ষা"
            />

            <div>
              <button
                type="submit"
                disabled={buttonDisable}
                className={`${buttonDisable ? "bg-[#E0E0E0]" : "bg-theme-color text-white"
                  } transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}
              >
                দাখিল করুন
              </button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default MaritListForm;
