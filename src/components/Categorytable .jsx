import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SvgIcon from "./icons/SvgIcon";
import DeleteButton from "./Button/DeleteButton";
import Swal from "sweetalert2";
import { useDeleteSupportTicketMutation, useSupportTicketsDepartmentQuery } from "../features/settings/settingsQuerySlice";
import Button from "./Button/Button";
import { showModal } from "../utils/ModalControlar";
import OwenGuide from "../Routes/OwenGuide";
import { ViewPermission } from "../Routes/ViewPermission";
import { permissionsDataList } from "../Data/permissions";
import { useSelector } from "react-redux";
import bnBijoy2Unicode from "../utils/conveter";

const icons = {
    fork: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" />
            <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
        </svg>
    ),
    star: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    coffee: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    ),
    bag: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    ),
    sun: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        </svg>
    ),
    shield: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    search: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    list: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
};

const ChevronDown = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const FilterIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
);

const ImportIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const initialData = [
    {
        id: 1, title: "Main dish", desc: "This is a description for this category",
        icon: "fork", date: "17/Mar/2025", products: 20, status: "active",
        children: [
            { id: 11, title: "Rice", children: [] },
            { id: 12, title: "Spaghetti", children: [] },
            //   {
            //     id: 13, title: "Swallow", children: [
            //       {
            //         id: 131, title: "Beans", children: [
            //           { id: 1311, title: "Village beans", children: [] },
            //           { id: 1312, title: "White beans", children: [] },
            //         ],
            //       },
            //       { id: 132, title: "Soya beans", children: [] },
            //     ],
            //   },
        ],
    },
    { id: 2, title: "Appetizer", desc: "This is a description for this category", icon: "star", date: "16/Mar/2025", products: 0, status: "inactive", children: [] },
    { id: 3, title: "Breakfast", desc: "This is a description for this category", icon: "coffee", date: "15/Mar/2025", products: 8, status: "active", children: [] },
    { id: 4, title: "Lunch", desc: "This is a description for this category", icon: "bag", date: "14/Mar/2025", products: 7, status: "active", children: [] },
    { id: 5, title: "Dinner", desc: "This is a description for this category", icon: "sun", date: "13/Mar/2025", products: 9, status: "inactive", children: [] },
    { id: 6, title: "Dessert", desc: "This is a description for this category", icon: "shield", date: "12/Mar/2025", products: 6, status: "active", children: [] },
    { id: 7, title: "Snacks", desc: "This is a description for this category", icon: "search", date: "11/Mar/2025", products: 12, status: "active", children: [] },
    { id: 8, title: "Beverages", desc: "This is a description for this category", icon: "list", date: "10/Mar/2025", products: 20, status: "active", children: [] },
];


function IconBadge({ name }) {
    return (
        <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-500">
            {icons[name] || icons.fork}
        </div>
    );
}


function StatusBadge({ status }) {
    const statusMap = {
        0: { label: "Pending", color: "blue" },
        1: { label: "Open", color: "blue" },
        2: { label: "In Progress", color: "purple" },
        3: { label: "Resolved", color: "green" },
        4: { label: "Closed", color: "gray" }
    };

    const current = statusMap[status] || { label: "Unknown", color: "gray" };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[16px] font-medium 
            bg-${current.color}-50 text-${current.color}-700 whitespace-nowrap`}>

            <span className={`w-1.5 h-1.5 rounded-full bg-${current.color}-500`} />

            {current.label}
        </span>
    );
}

function ChildRow({ item, depth = 1 }) {
    const [open, setOpen] = useState(true);
    const hasChildren = item.children?.length > 0;
    const paddingLeft = (depth - 1) * 20;

    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="w-9 pl-4" />
                <td colSpan={3} className="py-2.5 pr-4 text-sm">
                    <div className="flex items-center" style={{ paddingLeft }}>
                        <span
                            className="inline-block border-l-2 border-b-2 border-gray-300 w-5 h-4 rounded-bl mr-2 flex-shrink-0"
                        />
                        {hasChildren ? (
                            <button
                                onClick={() => setOpen((o) => !o)}
                                className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                <span className={`transition-transform duration-200 ${open ? "rotate-180" : ""} text-blue-500`}>
                                    <ChevronDown />
                                </span>
                                {item?.Remark}
                            </button>
                        ) : (
                            <span className="text-gray-600 w-[40%]">{ } {item?.Remark}</span>
                        )}
                    </div>
                </td>
                <td colSpan={3} className="font-bold text-[16px] text-[#5ac146]">{item?.UserInfo.Usercode}{item?.UserInfo.InstituteName}</td>
            </tr>
            {hasChildren && open &&
                item.children.map((child) => (
                    <ChildRow key={child.id} item={child} depth={depth + 1} />
                ))}
        </>
    );
}

function CategoryRow({ item }) {
    const [open, setOpen] = useState(item.ID === 1);
    const hasChildren = item.SupportTicketSupport?.length > 0;
    const [expanded, setExpanded] = useState(false);
    const [deleteSupportTickets] = useDeleteSupportTicketMutation();
    const { user } = useSelector((state) => state.auth);
    const permissionType = user?.permissionType;
    const handleModal = (id) => {
        console.log(id);
        showModal("Edit Admission Report Content", "SUPPORT_TICKET_SUPPORT", id)
    }
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
    return (
        <>
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">

                <td className="pl-4">
                    {/* <input type="checkbox" className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" /> */}
                    <div className="flex gap-2 items-center">
                        {permissionType > 0 && permissionType <= 4 ? <>
                            <Link to={`/help/view-support-ticket/${item.ID}`}
                                className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md" title="View"

                            >
                                <SvgIcon
                                    name={"FaEye"}
                                    size={14}
                                />
                            </Link>
                            <DeleteButton onClick={() => { handleDelete(item.ID) }} />
                        </> : null}


                        {/* </OwenGuide> */}
                        <div className="flex items-center gap-2 font-medium text-gray-800 text-sm ">
                            {/* {hasChildren ? ( */}
                            <button
                                onClick={() => setOpen((o) => !o)}
                                className={`px-[10px] h-[38px] rounded-[5px] bg-[#d3d3d3] text-blue-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                            >
                                <ChevronDown />
                            </button>
                            {/* ) : null} */}


                            <Button className="bg-transparent text-[#333333] hover:bg-transparent px-[0px] py-[0px]" onClick={() => { handleModal(item.ID) }}>
                                <span className="font-bold text-[18px] text-[#414141]">({item.SupportTicketSupport.length})</span>
                            </Button>



                        </div>

                    </div>
                </td>


                <td className="py-3 pl-2 pr-3 text-[16px] leading-[28px] font-medium text-gray-700 min-w-[200px] max-w-[300px] align-center">
                    <div className={`${expanded ? "" : "line-clamp-2"} overflow-hidden`}>
                        {item.Messages[0]?.Message}

                        {item.Messages.slice(1).map((reply, index) => (
                            <div key={index} className="text-[#000000] pb-[10px]">
                                <span
                                    className="inline-block border-l-2 border-b-2 border-gray-300 w-5 h-4 rounded-bl mr-2 flex-shrink-0"
                                />
                                <p className="text-[18px] inline">{reply.Message}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-[20px] text-[16px] mt-1">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-[#5ac146] "
                        >
                            {expanded ? (
                                "Less"
                            ) : (
                                <>
                                    আরও দেখুন <span className="text-black">({bnBijoy2Unicode(String(item.Messages.length - 1))} উত্তর)</span>
                                </>
                            )}
                        </button>
                        <button className="flex items-center gap-[4px] text-[16px]" onClick={() => { handleModal(item.ID) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-message">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M8 9h8" />
                                <path d="M8 13h6" />
                                <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" />
                            </svg>
                            মন্তব্য
                        </button>
                    </div>



                </td>

                <td className="py-2 pr-2 text-[16px] text-black font-bold min-w-[180px] max-w-[180px] align-center">{item.Subject}</td>
                <td className="py-2 pr-2 text-[16px] text-black font-bold min-w-[180px] max-w-[180px] align-center">{item.department.Department}</td>

                <td className="py-3 pr-3 text-[16px] text-black leading-[24px] align-center font-bold">{item.UserCode} {item?.UserInfo?.InstituteName}</td>

                <td className="py-3 pr-3">
                    <StatusBadge status={item.Status} />
                </td>
                <td className="py-3 text-center">
                    {new Date(item.CreatedAt).toDateString()}
                </td>

            </tr>
            {hasChildren && open &&
                item.SupportTicketSupport.map((child) => <ChildRow key={child.ID} item={child} depth={1} />)}
        </>
    );
}

export default function CategoryTable({ tableData }) {
    const [filters, setFilters] = useState({
        subject: "",
        department: "",
        institute: "",
        status: "",
    });
    const { data: departmentData = [], isLoading } = useSupportTicketsDepartmentQuery();
    // Deep filter: checks the root item AND all its SupportTicketSupport children
    const matchesFilters = (item, filters) => {
        const subjectMatch = !filters.subject ||
            item.Subject?.toLowerCase().includes(filters.subject.toLowerCase());

        const deptMatch = !filters.department ||
            String(item.DepartmentID) === String(filters.department);

        const instituteMatch = !filters.institute ||
            item.UserCode?.toLowerCase().includes(filters.institute.toLowerCase()) ||
            item.UserInfo?.InstituteName?.toLowerCase().includes(filters.institute.toLowerCase());

        const statusMatch = filters.status === "" ||
            String(item.Status) === String(filters.status);

        return subjectMatch && deptMatch && instituteMatch && statusMatch;
    };

    // Filter root-level data; also check if any child matches (optional deep match)
    const filtered = (tableData ?? []).filter((item) => matchesFilters(item, filters));

    const handleFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden font-sans w-full">
            <div className="overflow-x-auto font-SolaimanLipi">
                <table className="w-full border-collapse text-sm">
                    <colgroup>
                        <col className="w-[40px]" />
                        <col className="w-[40%]" />
                        <col className="w-[18%]" />
                        <col className="w-[2%]" />
                        <col className="w-[20%]" />
                        <col className="w-[4%]" />
                        <col className="w-[9%]" />
                    </colgroup>
                    <thead>
                        {/* ── Header labels ── */}
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-2.5 pl-4 text-[16px] w-9 font-bold">মতামত</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">বিবরণ</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">বিষয়</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">বিভাগ</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">প্রতিষ্ঠানের নাম</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">স্ট্যাটাস</th>
                            <th className="py-2.5 pr-3 text-center text-[16px] font-bold">তৈরির তারিখ</th>
                        </tr>

                        {/* ── Filter row ── */}
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-2.5 pl-4 w-9" />
                            <th className="py-2.5 pr-3 text-left" />

                            {/* Subject filter */}
                            <th className="py-2.5 pr-3 text-left">
                                <input
                                    type="text"
                                    placeholder="বিষয় খুঁজুন..."
                                    value={filters.subject}
                                    onChange={(e) => handleFilter("subject", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </th>

                            {/* Department filter */}
                            <th className="py-2.5 pr-3 text-left">
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleFilter("department", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value="">সব বিভাগ</option>
                                    {departmentData.map((dept) => (
                                        <option key={dept.ID} value={dept.ID}>
                                            {dept.Department}
                                        </option>
                                    ))}
                                </select>
                            </th>

                            {/* Institute filter */}
                            <th className="py-2.5 pr-3 text-left">
                                <input
                                    type="text"
                                    placeholder="প্রতিষ্ঠান খুঁজুন..."
                                    value={filters.institute}
                                    onChange={(e) => handleFilter("institute", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                            </th>

                            {/* Status filter */}
                            <th className="py-2.5 pr-3 text-left">
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilter("status", e.target.value)}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value="">সব স্ট্যাটাস</option>
                                    <option value="0">Pending</option>
                                    <option value="1">Open</option>
                                    <option value="2">In Progress</option>
                                    <option value="3">Resolved</option>
                                    <option value="4">Closed</option>
                                </select>
                            </th>

                            <th className="py-2.5 pr-3 text-center" />
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((item) => (
                                <CategoryRow key={item.ID} item={item} />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400">
                                    কোনো ফলাফল পাওয়া যায়নি
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}