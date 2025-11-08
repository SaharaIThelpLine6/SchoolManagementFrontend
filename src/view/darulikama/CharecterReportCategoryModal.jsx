import React, { useState, useEffect } from "react";
import DefaultInput from "../../components/Forms/DefaultInput";
import useTranslate from "../../utils/Translate";
import { FormProvider, useForm } from "react-hook-form";
import { useGetStudentReportCetsQuery, usePostStudentReportCetsMutation, useUpdateStudentReportCetsMutation } from "../../features/student/studentQuerySlice";
import SvgIcon from "../../components/icons/SvgIcon";
import SortableTable from "../../components/Tables/SortableTable";
import { hideModal } from "../../utils/ModalControlar";
import Swal from "sweetalert2";
export default function CharecterReportCategoryModal() {
    const methods = useForm();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors },
    } = methods;

    const translate = useTranslate();
    const { data: studentReportCet, loading: isStudentReportCetLoading, error: studentReportCetError } =
        useGetStudentReportCetsQuery();
    const [
        addCharacterStudentCet,
        {
            isLoading: isCreating,
            isError: isCreateError,
            isSuccess: isCreateSuccess,
        },
    ] = usePostStudentReportCetsMutation();
    const [
        updateCharacterStudentCet,
    ] = useUpdateStudentReportCetsMutation();

    const [editId, setEditId] = useState(null);
    const onSubmit = async (data) => {
        try {
            if (editId) {
                const finalData = {
                    catid: editId,
                    ...data,
                };
                await updateCharacterStudentCet(finalData).unwrap();
                Swal.fire({
                    title: translate("Designation updated successfully!"),
                    icon: "success",
                });

                setEditId(null);
            } else {
                await addCharacterStudentCet(data).unwrap();
                Swal.fire({
                    title: translate("Designation created successfully!"),
                    icon: "success",
                });
            }

            hideModal();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: translate("Failed to save designation"),
                confirmButtonColor: "#3B82F6",
            });
        }

    }

    const columns = [
        {
            title: translate("Action"),
            hozAlign: "center",
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    <button
                        className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md"
                        title="View"
                        onClick={() => { setEditId(row.ReportCetID); setValue("ReportCetName", row.ReportCetName); }}
                    >
                        <SvgIcon name={"FiEdit"} size={20} />
                    </button>
                </div>
            ),
        },
        {
            title: (
                <div className="flex items-center justify-center gap-1">
                    <SvgIcon
                        name={"GrDrag"}
                        size={14}
                    />
                </div>
            ),
            hozAlign: "center",
            render: (row) => <>{row?.ReportCetID}</>,
        },
        {
            title: translate("Name"),
            hozAlign: "center",
            render: (row) => <>{row?.ReportCetName}</>,
        },
    ];

    return (
        <div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="charecter-report-category-form">
                    <DefaultInput label={"Category Name"} registerKey={"ReportCetName"} placeholder={"Category name"} require={true} showError={true} />
                    <div className="text-end pt-6 pb-3">
                        <button type="submit" className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush">
                            {translate("Save")}
                        </button>
                    </div>
                </form>
            </FormProvider>

            <div className="mt-5 overflow-x-auto">
                {isStudentReportCetLoading ? (
                    <Loading />
                ) : studentReportCetError ? (
                    <div className="text-red-500 text-center py-4">
                        {translate("Failed to load student report categories. Please try again.")}
                    </div>
                ) : (
                    <SortableTable
                        columns={columns}
                        data={studentReportCet}
                        isFilterColumn={false}
                    />
                )}
            </div>

        </div>
    );
}