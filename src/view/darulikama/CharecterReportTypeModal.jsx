import React, { useState, useEffect } from "react";
import DefaultInput from "../../components/Forms/DefaultInput";
import useTranslate from "../../utils/Translate";
import { FormProvider, useForm } from "react-hook-form";
import { useGetStudentReportCetsQuery, useGetStudentReportTypeQuery, usePostStudentReportCetsMutation, usePostStudentReportTypeMutation, useUpdateStudentReportCetsMutation, useUpdateStudentReportTypeMutation } from "../../features/student/studentQuerySlice";
import SvgIcon from "../../components/icons/SvgIcon";
import SortableTable from "../../components/Tables/SortableTable";
import { hideModal } from "../../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../../components/Loading/Loading";
export default function CharecterReportTypeModal() {
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

      const { data: studentReportType, loading: isLoading, error: studentReportTypeError } =
        useGetStudentReportTypeQuery();
    const [
        addCharacterStudentType,
        {
            isLoading: isCreating,
            isError: isCreateError,
            isSuccess: isCreateSuccess,
        },
    ] = usePostStudentReportTypeMutation();
    const [
        updateCharacterStudentType,
    ] = useUpdateStudentReportTypeMutation();

    const [editId, setEditId] = useState(null);
    const onSubmit = async (data) => {
        try {
            if (editId) {
                const finalData = {
                    catid: editId,
                    ...data,
                };
                await updateCharacterStudentType(finalData).unwrap();
                Swal.fire({
                    title: translate("Designation updated successfully!"),
                    icon: "success",
                });
            } else {
                await addCharacterStudentType(data).unwrap();
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
                        onClick={() => { setEditId(row.ReportTypID); setValue("ReportTypeName", row.ReportTypeName); }}
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
            render: (row) => <>{row?.ReportTypID}</>,
        },
        {
            title: translate("Name"),
            hozAlign: "center",
            render: (row) => <>{row?.ReportTypeName}</>,
        },
    ];

    return (
        <div>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="charecter-report-category-form">
                    <DefaultInput label={"Report Type"} registerKey={"ReportTypeName"} placeholder={"Report Type"} require={true} showError={true} />
                    <div className="text-end pt-6 pb-3">
                        <button type="submit" className="rounded-md inline-flex items-center bg-[#2563eb] text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush">
                            {translate("Save")}
                        </button>
                    </div>
                </form>
            </FormProvider>

            <div className="mt-5 overflow-x-auto">
                {isLoading ? (
                    <Loading />
                ) : studentReportTypeError ? (
                    <div className="text-red-500 text-center py-4">
                        {translate("Failed to load student report types. Please try again.")}
                    </div>
                ) : (
                    <SortableTable
                        columns={columns}
                        data={studentReportType}
                        isFilterColumn={false}
                    />
                )}
            </div>

        </div>
    );
}