import { FormProvider, useForm } from "react-hook-form";
import SortableTable from "../../components/Tables/SortableTable";
import useTranslate from "../../utils/Translate";
import { useEffect, useState } from "react";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import Button from "../../components/Button/Button";
import {
    useGetAllUserPermissionListViewsQuery,
    useUpdatePermissionCheckedAllMutation,
    useUpdatePermissionToggleMutation,
} from "../../features/permission/permissionSlice";
import Loading from "../../components/Loading/Loading";
import { toast } from "react-toastify";
import { useGetsupportTicketsSupportQuery, useSupportTicketsDepartmentQuery, useSupportTicketsSupportMutation } from "../../features/settings/settingsQuerySlice";
import Swal from "sweetalert2";

const SupportTicketModal = ({ id }) => {
    const methods = useForm();
    const translate = useTranslate();

    const [selectedRow, setSelectedRow] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [
        supportTicketSupport,
        { isLoading: isreplySupportTicketLoading }
    ] = useSupportTicketsSupportMutation();

    const { data } = useGetsupportTicketsSupportQuery(id)



    const handleStatusClick = (statusValue) => {
        setSelectedStatus(statusValue);
        methods.setValue("status", statusValue);
    };
    useEffect(() => {
        console.log(id);

    }, [id])
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
            await supportTicketSupport({
                id: data.id,
                formData: data
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
    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="mx-auto bg-white p-6 md:p-4 rounded-xl shadow-lg"
            >
                <input {...methods.register('id')} className="hidden" value={id} />
                <input {...methods.register('status')} className="hidden" type="number" />
                <Button type="button"
                    onClick={() => handleStatusClick(1)}
                    className={`text-white bg-green-500 hover:bg-green-500 mr-2 ${selectedStatus === 1 ? 'border-4 border-green-700' : ''}`}>
                    সমথর্ন করছি
                </Button>
                <Button type="button"
                    onClick={() => handleStatusClick(0)}
                    className={`text-white bg-rose-500 hover:bg-rose-500 ${selectedStatus === 0 ? 'border-4 border-rose-700' : ''}`}>
                    সমথর্ন করছিনা
                </Button>

                <div className="mt-2">
                    <label className="block text-[16px] font-normal text-gray-700 mb-1 md:mb-2 font-SolaimanLipi">
                        মতামত দিন:
                    </label>
                    <textarea
                        {...methods.register("Remark", {
                            required: "Remark is required",
                        })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        aria-label={translate("Remark")}
                    />

                </div>
                <Button type="submit">{translate("Save")}</Button>
            </form>
            <div className="mt-4">
                { data && data.map((item) => (
                    <div
                        key={item.ID}
                        className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between gap-4"
                    >
                        {/* Support Status Badge */}
                        <div className="flex-shrink-0">
                            {item.Support === 1 ? (
                                <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full font-SolaimanLipi">
                                    ✅ সমথর্ন করছি
                                </span>
                            ) : (
                                <span className="inline-block px-3 py-1 text-sm font-medium bg-rose-100 text-rose-700 rounded-full font-SolaimanLipi">
                                    ❌ সমথর্ন করছিনা
                                </span>
                            )}
                        </div>

             
                        <div className="flex-1">
                            <p className="text-sm text-black font-SolaimanLipi mb-1">মতামত: {item.Remark || <span className="text-gray-400 italic">কোনো মতামত নেই</span>}</p>
                         
                        </div>

           
                        <div className="flex-shrink-0 text-xs text-gray-400">
                            টিকিট #{item.TicketID}
                        </div>
                    </div>
                ))}
            </div>
        </FormProvider>
    );
};

export default SupportTicketModal;
