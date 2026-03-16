import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import { useCreateSupportTicketsMutation } from "../features/settings/settingsQuerySlice";
import Swal from "sweetalert2";

const SupportTicket = ({ pageTitle }) => {
    const translate = useTranslate();
    const dispatch = useDispatch();
    const methods = useForm();
    const { register, handleSubmit, reset } = methods;
    const [fileName, setFileName] = useState("No file chosen");


    const [
        createSupportTicket,
        { isLoading: isCreateLoading }
    ] = useCreateSupportTicketsMutation();
    const onSubmit = async (data) => {
        try {

            Swal.fire({
                title: "টিকিট সাবমিট করা হচ্ছে...",
                text: "অনুগ্রহ করে অপেক্ষা করুন",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();

            formData.append("Subject", data.Subject);
            formData.append("Department", data.user_type);
            formData.append("Message", data.message);

            // Attach file
            if (data.attachment && data.attachment[0]) {
                formData.append("TicketImages", data.attachment[0]);
            }

            await createSupportTicket(formData).unwrap();

            Swal.close();

            Swal.fire({
                icon: "success",
                title: "টিকিট সফলভাবে তৈরি হয়েছে!",
                text: "আপনার সাপোর্ট টিকিট সফলভাবে সাবমিট হয়েছে। আমাদের সাপোর্ট টিম খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "ঠিক আছে",
            });

            reset();

        } catch (err) {

            Swal.close();

            Swal.fire({
                icon: "error",
                title: "টিকিট তৈরি করা যায়নি!",
                text: err?.data?.error || "দুঃখিত, টিকিট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
                confirmButtonColor: "#d33",
                confirmButtonText: "ঠিক আছে",
            });

            console.error("Error submitting support ticket:", err);
        }
    };

    return (
        <div className="font-SolaimanLipi">
          
        </div>
    );
};

export default SupportTicket;