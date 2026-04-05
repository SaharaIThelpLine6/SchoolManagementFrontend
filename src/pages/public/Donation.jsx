import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { setResultError } from "../../features/studentResultPublicView/studentResultPublicViewSlice";
import { toast } from "react-toastify";
import AnimatedSelect from "../../components/Forms/AnimatedSelect";
import Checkbox from "../../components/Checkboxes/Checkbox";
import { useDonationInitPaymentMutation } from "../../features/userPanel/onlineDonation/onlineDonationSlice";
import Swal from "sweetalert2";
import Button from "../../components/Button/Button";

const Donation = () => {
    const [initPayment, { isLoading }] = useDonationInitPaymentMutation();
    const [buttonDisable, setButtonDisable] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

    const { schoolid } = useParams();

    const methods = useForm();
    const { handleSubmit, watch, setValue, register, trigger, formState: { errors } } = methods;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        // console.log(data);
        try {
            const convertedData = { ...data, schoolId: schoolid }
            const res = await initPayment(convertedData).unwrap();
            if (res?.gateway_url) {
                Swal.fire({
                    title: 'Redirecting...',
                    text: 'You are being redirected to the payment gateway',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });

                setTimeout(() => {
                    window.location.href = res.gateway_url;
                }, 2000);
            } else {
                Swal.fire({
                    title: 'Payment Failed',
                    text: 'Gateway URL not found',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }


        } catch (err) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "সাবমিশন ব্যর্থ!",
                text: err?.data?.error || "কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।",
                confirmButtonColor: "#d33",
                confirmButtonText: "বুঝেছি",
            });
            console.error("Error submitting data:", err);
        }
    }

    const [SessionID, ExamID, SubClassID, donation_category, amount] = watch(["SessionID", "ExamID", "SubClassID", "donation_category", "amount"]);
    const anonymousWatch = watch("anonymous");

    useEffect(() => {
        console.log(anonymousWatch);

        setIsAnonymous(anonymousWatch == 1);
    }, [anonymousWatch]);

    // Button disable logic
    useEffect(() => {
        console.log(isAnonymous);
        if (!donation_category || !amount) {
            setButtonDisable(true);
            return;
        }
        if (!isAnonymous) {
            const [name, phone, address] = [watch("name"), watch("phone"), watch("address")];
            if (!name || !phone || !address) {
                setButtonDisable(true);
                return;
            }
        }
        console.log("=====================================");



        setButtonDisable(false);
    }, [SessionID, ExamID, SubClassID, donation_category, amount, isAnonymous, watch("name"), watch("phone"), watch("address")]);

    const categories = [
        { value: "", label: "অনুদানের খাত নির্বাচন করুন" },
        { value: "9", label: "নযর (মান্নত)" },
        { value: "8", label: "ফিতরা" },
        { value: "7", label: "যাকাত" },
        { value: "11", label: "চাঁদা" },
        { value: "12", label: "ছদকায়ে জারিয়া" },
        { value: "13", label: "কুরবানীর চামাড়ার টাকা" },
        { value: "16", label: "কাফ্ফারা (ফিদিয়া)" },
        { value: "17", label: "বার্ষিক সভার চাঁদা - ২০২৫" },
    ];

    return (
        <FormProvider {...methods}>
            <div className="pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">
                <form className="w-full bg-white shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md" onSubmit={handleSubmit(onSubmit)}>
                    <div className="bg-theme-color font-semibold rounded-t-md">
                        <h1 className="text-white text-2xl py-4">ক্লাশ/মারহালা ভিত্তিক ফলাফল</h1>
                    </div>
                    <div className="px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                        {/* Name - hidden when anonymous */}
                        {!isAnonymous && (
                            <div>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="নাম"
                                    {...register("name", { required: !isAnonymous ? "নাম আবশ্যক" : false })}
                                    className={`w-full rounded border-2 ${errors.name ? "border-red-500" : "border-stroke"} bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary`}
                                />
                                {errors.name && <p className="text-red-500 text-left text-xs pt-1 pl-1">{errors.name.message}</p>}
                            </div>
                        )}

                        {/* Address - hidden when anonymous */}
                        {!isAnonymous && (
                            <div>
                                <textarea
                                    name="address"
                                    placeholder="ঠিকানা"
                                    {...register("address", { required: !isAnonymous ? "ঠিকানা আবশ্যক" : false })}
                                    className={`w-full rounded border-2 ${errors.address ? "border-red-500" : "border-stroke"} bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary`}
                                />
                                {errors.address && <p className="text-red-500 text-left text-xs pt-1 pl-1">{errors.address.message}</p>}
                            </div>
                        )}

                        {/* Phone - hidden when anonymous */}
                        {!isAnonymous && (
                            <div>
                                <input
                                    name="phone"
                                    type="text"
                                    placeholder="ফোন নম্বর"
                                    {...register("phone", { required: !isAnonymous ? "ফোন নম্বর আবশ্যক" : false })}
                                    className={`w-full rounded border-2 ${errors.phone ? "border-red-500" : "border-stroke"} bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary`}
                                />
                                {errors.phone && <p className="text-red-500 text-left text-xs pt-1 pl-1">{errors.phone.message}</p>}
                                <p className="text-[13px] text-left pl-2 pt-1">ইমো/হোয়াটসঅ্যাপ নম্বর (রশিদ গ্রহনের জন্য)</p>
                            </div>
                        )}

                        {/* Category - always visible */}
                        <AnimatedSelect
                            registerKey={"donation_category"}
                            required={"এই ঘরটি আবশ্যক"}
                            options={categories}
                            nameField={"label"}
                            valueField={"value"}
                            title={"অনুদানের খাত"}
                        />

                        {/* Amount - always visible */}
                        <div>
                            <input
                                name="amount"
                                type="text"
                                placeholder="পরিমাণ"
                                {...register("amount", { required: "পরিমাণ আবশ্যক" })}
                                className={`w-full rounded border-2 ${errors.amount ? "border-red-500" : "border-stroke"} bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary`}
                            />
                            {errors.amount && <p className="text-red-500 text-left text-xs pt-1 pl-1">{errors.amount.message}</p>}
                        </div>
                        <div className="flex gap-2">
                            {[100, 200, 500, 1000].map((val) => (
                                <Button
                                    key={val}
                                    type="button"
                                    onClick={() => {
                                        setValue("amount", val);
                                    }}
                                >
                                    {val}
                                </Button>
                            ))}
                        </div>

                        {/* Anonymous checkbox - always visible */}

                        <div className="mb-4">
                            <div className="">
                                    <label
                                        className="flex items-center space-x-2 text-gray-800 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-SolaimanLipi">
                                            পরিচয় প্রকাশে আগ্রহী নই
                                        </span>
                                    </label>
                               
                            </div>

                            {/* Hidden input to register the single value */}
                            <input type="hidden" {...register("anonymous")} />
                        </div>
                        {/* <Checkbox
                            label={""}
                            options={[{ id: 1, name: "" }]}
                            registerKey="anonymous"
                        /> */}

                        <div>
                            <button
                                type="submit"
                                disabled={buttonDisable}
                                className={`${buttonDisable ? "bg-[#E0E0E0]" : "bg-theme-color text-white"} transition ease-in-out delay-300 text-slate-400 py-[10px] px-16 rounded-md`}
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

export default Donation;