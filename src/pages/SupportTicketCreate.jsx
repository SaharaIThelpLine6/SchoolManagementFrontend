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

const SupportTicketCreate = ({ pageTitle }) => {
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
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileName(file ? file.name : "No file chosen");
    };

    return (
        <div className="font-SolaimanLipi">
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mx-auto bg-white p-6 md:p-4 rounded-xl shadow-lg"
                >
                    <DefaultSelect
                        label={<span className="">Modeule Type</span>}
                        options={[
                            { id: "1", value: "User" },
                            { id: "2", value: "Payment" },
                            { id: "3", value: "Exam" },
                            { id: "4", value: "Accouting" },
                            { id: "5", value: "Guardian Panel" },
                        ]}
                        nameField={"value"}
                        key={"id"}
                        registerKey={"user_type"}
                    />
                    <DefaultInput
                        label="Subject"
                        type="text"
                        registerKey="Subject"
                    />

                    {/* Textarea */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            {...register("message")}
                            rows={5}
                            placeholder="Write your message here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition"
                        />
                    </div>

                    {/* File Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Attachment
                        </label>
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 00-5.656-5.656L5.757 10.757a6 6 0 108.486 8.486L19 14"
                                    />
                                </svg>
                                Choose File
                            </label>
                            <span className="text-sm text-gray-500 truncate max-w-xs">
                                {fileName}
                            </span>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                {...register("attachment")}
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                            Supported formats: PDF, JPG, PNG (max 5MB)
                        </p>
                        <Button type="submit">Submit</Button>
                    </div>
                </form>

            </FormProvider>
        </div>
    );
};

export default SupportTicketCreate;