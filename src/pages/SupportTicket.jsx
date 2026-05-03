import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import { useCreateSupportTicketsMutation, useDeleteSupportTicketMutation, useGetSupportTicketsListQuery, useSupportTicketsDepartmentQuery } from "../features/settings/settingsQuerySlice";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import { useMemo } from "react";
import SvgIcon from "../components/icons/SvgIcon";
import { Link } from "react-router-dom";
import { showModal } from "../utils/ModalControlar";
import DeleteButton from "../components/Button/DeleteButton";
import { useDeleteStudentCharacterReportMutation } from "../features/student/studentQuerySlice";
const PAGE_SIZE = 10;
const SupportTicket = ({ pageTitle }) => {
    const translate = useTranslate();
    const dispatch = useDispatch();
    const methods = useForm();
    const { register, handleSubmit, reset } = methods;
    const [fileName, setFileName] = useState("No file chosen");
    const { data: supportTicketsList, isLoading: createSupportTicketLoading, isError: createSupportTicketError } = useGetSupportTicketsListQuery();
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil((supportTicketsList?.length || 0) / PAGE_SIZE);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return supportTicketsList?.slice(start, start + PAGE_SIZE) || [];
    }, [supportTicketsList, currentPage]);
    const { data: apiData = [], isLoading } = useSupportTicketsDepartmentQuery();
    const [departmentOptions, setDepartmentOptions] = useState([]);

    useEffect(() => {
        const options = apiData.map(item => ({
            value: item.ID,
            label: item.Department
        }));
        setDepartmentOptions(options);
    }, [apiData]);
    const [deleteSupportTickets] = useDeleteSupportTicketMutation();
    const handleDelete = useCallback(
        async (id) => {
            if (!id) return;

            const result = await Swal.fire({
                title: "আপনি কি নিশ্চিত?",
                text: "এই রিপোর্ট মুছে ফেলা হবে।",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
                cancelButtonText: "বাতিল করুন",
            });

            if (result.isConfirmed) {
                try {
                    await deleteSupportTickets(id).unwrap();
                    Swal.fire(
                        "মুছে ফেলা হয়েছে!",
                        "রিপোর্ট সফলভাবে মুছে ফেলা হয়েছে।",
                        "success"
                    );
                } catch (error) {
                    Swal.fire(
                        "ভুল হয়েছে!",
                        "রিপোর্ট মুছে ফেলা যায়নি। আবার চেষ্টা করুন।",
                        "error"
                    );
                }
            }
        },
        [deleteSupportTickets]
    );


    const columns = [
        {
            title: translate("Action"),
            hozAlign: "center",
            render: (row) => (
                <div className="flex justify-center items-center gap-2">
                    <Link to={`/help/view-support-ticket/${row.ID}`}
                        className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md"
                        title="View"

                    >
                        <SvgIcon
                            name={"FaEye"}
                            size={14}
                        />
                    </Link>

                    <DeleteButton onClick={() => { handleDelete(row.ID) }} />
                </div>
            ),
        },
        {
            title: translate("Madrasha Code"),
            field: "UserCode",
            hozAlign: "center",
            filterable: true,
            type: 'text'
        },
        {
            title: translate("Madrasha Name"),
            render: (row) => <>{row?.UserInfo?.InstituteName}</>,
        },
        {
            title: "সার্পোট",
            hozAlign: "center",
            render: (row) => (
                <div className="gap-2">
                    <h3 className="flex items-center">
                        সার্পোট করেছে (<span className="text-green-600">{row?.supportCount1}</span>/<span className="text-rose-600">{row?.supportCount0}</span>)   
                        <Button onClick={() => { handleModal(row.ID) }}
                        className="p-2 text-white bg-transparent hover:bg-transparent text-center rounded-md"
                        title="View"> 
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-file-descriptio text-black">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
                                <path d="M9 17h6" />
                                <path d="M9 13h6" />
                            </svg> 
                        </Button>
                    </h3>
                    {/* <Button onClick={() => { handleModal(row.ID) }}
                        className="p-2 text-white bg-transparent hover:bg-transparent text-center rounded-md"
                        title="View"

                    >
                        <p className="text-[18px] text-rose-600"> আপনার মতামত দিন!! </p>
                    </Button> */}
                </div>
            ),

        },
        {
        filterable: true,
        type: 'select',
        field: 'DepartmentID',  // ✅ must match the actual key in your row data
        options: departmentOptions,
        title: translate("Department"),
        hozAlign: "center",

            render: (row) => <React.Fragment>{row?.department.Department}</React.Fragment>,
        },
        {
            title: translate("Subject"),
            hozAlign: "center",
            render: (row) => <>{row?.Subject}</>,
        },
        {
            title: translate("Details"),
            render: (row) => <div className="truncate max-w-[200px]">{row?.Messages[0]?.Message}</div>,
        },
        {
            title: translate("Status"),
            field: "Status",
            hozAlign: "center",
            filterable: true,
            type: 'select',
            options: [
                { value: 0, label: "Pending" },
                { value: 1, label: "Open" },
                { value: 2, label: "In Progress" },
                { value: 3, label: "Resolved" },
                { value: 4, label: "Closed" },
            ],
            render: (row) => {
                const statusMap = {
                    0: { label: "Pending", color: "#f59e0b", bg: "#fef3c7" },      // yellow
                    1: { label: "Open", color: "#2563eb", bg: "#dbeafe" },         // blue
                    2: { label: "In Progress", color: "#7c3aed", bg: "#ede9fe" },  // purple
                    3: { label: "Resolved", color: "#16a34a", bg: "#dcfce7" },     // green
                    4: { label: "Closed", color: "#6b7280", bg: "#f3f4f6" },       // gray
                };

                const status = statusMap[row?.Status] || statusMap[0];

                return (
                    <span
                        style={{
                            color: status.color,
                            backgroundColor: status.bg,
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontSize: "12px",
                            fontWeight: "500",
                            display: "inline-block",
                            minWidth: "90px",
                            textAlign: "center"
                        }}
                    >
                        {status.label}
                    </span>
                );
            },
        }

    ];

    const handleModal = (id) => {
        console.log(id);

        showModal("Edit Admission Report Content", "SUPPORT_TICKET_SUPPORT", id)
    }
    return (
        <div className="font-SolaimanLipi pt-[20px]">
            <Link to={"/help/create-support-tickets"} className="btn bg-[#5ac146] text-white py-2 px-2 rounded-[4px] mb-5">Open New Ticket</Link>
            <div className="mt-5 overflow-x-auto">
                {createSupportTicketLoading ? (
                    <Loading />
                ) : createSupportTicketError ? (
                    <div className="text-red-500 text-center py-4">
                        {translate("Failed to load exam fee settings. Please try again.")}
                    </div>
                ) : (
                    <SortableTable
                        columns={columns}
                        data={paginatedData}
                        isFilterColumn={true}
                    />
                )}
            </div>
            {totalPages > 1 && (
                <DefaultPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default SupportTicket;