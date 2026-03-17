import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import { useCreateSupportTicketsMutation, useGetSupportTicketDetailsQuery, useReplySupportTicketsMutation } from "../features/settings/settingsQuerySlice";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import { ViewPermission } from "../Routes/ViewPermission";
import { permissionsDataList } from "../Data/permissions";

const SupportTicketView = ({ pageTitle }) => {
    const translate = useTranslate();
    const dispatch = useDispatch();
    const methods = useForm();
    const { register, handleSubmit, reset } = methods;
    const { id } = useParams();
    console.log("Ticket ID:", id);
    const [fileName, setFileName] = useState("No file chosen");

    const { data: supportTicketDetails, isLoading: supportTicketDetailsLoading, isError: supportTicketDetailsError } = useGetSupportTicketDetailsQuery(id, {
        skip: !id
    });
    const [
        replySupportTicket,
        { isLoading: isreplySupportTicketLoading }
    ] = useReplySupportTicketsMutation();
    const onSubmit = async (data) => {
        try {
            console.log(data);

            Swal.fire({
                title: "টিকিট সাবমিট করা হচ্ছে...",
                text: "অনুগ্রহ করে অপেক্ষা করুন",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const formData = new FormData();
            formData.append("id", data.id);
            formData.append("Message", data.message);
            formData.append("Status", data.Status);

            // Attach file
            if (data.attachment && data.attachment.length > 0) {
                for (let i = 0; i < data.attachment.length; i++) {
                    formData.append("TicketImages", data.attachment[i]);
                }
            }

            await replySupportTicket({
                id: data.id,        // ✅ pass separately
                formData: formData  // ✅ actual body
            }).unwrap();


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
            {
                supportTicketDetails && supportTicketDetails.Messages && supportTicketDetails.Messages.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 mb-4 gap-5">
                        <div className="lg:col-span-8 ">
                            <div className="card">
                                <div className="card-body p-5 bg-white text-[#6a7a8c]">
                                    <h3 className="text-[20px] mb-2">Message</h3>
                                    <p className="text-[14px]">{supportTicketDetails.Messages[0].Message}</p>


                                    <p className="text-[12px] mt-4">Attachments ({supportTicketDetails.Messages[0]["Attachments"].length})</p>


                                </div>
                                {supportTicketDetails.Messages.length > 1 ? (
                                    <div className="card-body p-5 pt-2 bg-white text-[#6a7a8c]">
                                        <h3 className="text-[20px] mb-2">Ticket Replies</h3>


                                        {supportTicketDetails.Messages.slice(1).map((msg, index) => (
                                            <div key={index} className={`media staff_reply ${msg.SenderType == 1 ? "bg-[#e8f8ff]" : "bg-[#f5f5f5]"} text-[#6a7a8c] p-3 mb-2`}>
                                                <h3 className="text-[20px] mb-2">{msg.SenderType == 1 ? "Admin" : "Client"}</h3>
                                                <p className="text-[14px]">{msg.Message}</p>
                                                {msg.Attachments?.length > 0 && (


                                                    <p className="text-[12px] mt-4">
                                                        Attachments ({msg.Attachments.length})
                                                    </p>
                                                )}
                                            </div>
                                        ))}

                                    </div>
                                ) : null}


                            </div>
                        </div>
                        <div className="lg:col-span-4">
                            <div className="card">
                                <div className="card-body p-5 bg-white text-[#6a7a8c]">
                                    <h3 className="text-[20px]">Ticket Info</h3>

                                    <h5 className=" text-[18px] mt-8">Subject</h5>
                                    <p className="text-[16px] leading-1 mt-2">#{supportTicketDetails.ID} - {supportTicketDetails.Subject}</p>

                                    <h5 className=" text-[18px] mt-8">Department</h5>
                                    <p className="text-[16px] leading-1 mt-2">{supportTicketDetails.Department}</p>
                                </div>

                                <div className="card-body bg-[f6f8f9] p-5">
                                    <p className="text-[16px] leading-1 mt-2">Status:
                                        <span className={`items-center gap-1.5 px-3 py-1 ml-[2px] inline-block rounded-[5px] text-[13px] font-semibold
                                            ${supportTicketDetails.Status == 0 ? 'bg-blue-500 text-white' :
                                                supportTicketDetails.Status == 1 ? 'bg-blue-100 text-blue-700' :
                                                    supportTicketDetails.Status == 2 ? 'bg-yellow-100 text-yellow-700' :
                                                        supportTicketDetails.Status == 3 ? 'bg-green-100 text-green-700' :
                                                            supportTicketDetails.Status == 4 ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-600'}
        `}>

                                            {supportTicketDetails.Status == 0 ? 'Pending' :
                                                supportTicketDetails.Status == 1 ? 'Open' :
                                                    supportTicketDetails.Status == 2 ? 'In Progress' :
                                                        supportTicketDetails.Status == 3 ? 'Resolved' :
                                                            supportTicketDetails.Status == 4 ? 'Closed' : 'Pending'}
                                        </span>
                                    </p>
                                </div>

                                <div className="card-body p-5 bg-white text-[#6a7a8c]">
                                    <p className="text-[16px] leading-1 mb-2 pb-4 border-b">Opened: </p>
                                    <p className="text-[16px] leading-1 pb-4 border-b">Last Response: </p>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : null
            }

            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mx-auto bg-white p-6 md:p-4 rounded-xl shadow-lg"
                    enctype="multipart/form-data"
                >
                    {/* Textarea */}
                    <h3 className="text-[20px] mb-4 text-[#6a7a8c]">Write a reply</h3>
                    <input className="hidden" {...register("id")} value={id} />
                    <ViewPermission
                        permissionId={permissionsDataList.class}
                        permissionType="edit"
                        empty={true}
                    >
                        <DefaultSelect
                            label={<span className="">Status</span>}
                            options={[
                              
                                { id: "2", value: "In Progress" },
                                { id: "3", value: "Resolved" },
                                { id: "4", value: "Closed" }
                            ]}
                            nameField={"value"}
                            valueField={"id"}
                           
                            registerKey={"Status"}
                        />
                    </ViewPermission>


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
                                multiple
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

export default SupportTicketView;