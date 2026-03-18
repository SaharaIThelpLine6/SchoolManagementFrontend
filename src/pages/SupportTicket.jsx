import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import DefaultInput from "../components/Forms/DefaultInput";
import { useCreateSupportTicketsMutation, useGetSupportTicketsListQuery } from "../features/settings/settingsQuerySlice";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import { useMemo } from "react";
import SvgIcon from "../components/icons/SvgIcon";
import { Link } from "react-router-dom";
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

    useEffect(() => {
        console.log(supportTicketsList);

    }, [supportTicketsList])
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
                </div>
            ),
        },
        {
            title: translate("Madrasha Code"),
            hozAlign: "center",
            render: (row) => <>{row?.UserCode}</>,
        },
        {
            title: translate("Department"),
            hozAlign: "center",
            render: (row) => <>{row?.Department}</>,
        },
        {
            title: translate("Subject"),
            hozAlign: "center",
            render: (row) => <>{row?.Subject}</>,
        },
        {
            title: translate("Status"),
            hozAlign: "center",
            render: (row) => <>{row?.Status == 1 ? "Open" : row?.Status == 2 ? "In Progress" : row?.Status == 3 ? "Resolved" : row?.Status == 4 ? "Closed" : "Pending"}</>,
        },

    ];
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
                        isFilterColumn={false}
                    />
                )}
            </div>

            {/* Pagination */}
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