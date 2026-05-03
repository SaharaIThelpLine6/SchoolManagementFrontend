import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SvgIcon from "./icons/SvgIcon";
import DeleteButton from "./Button/DeleteButton";
import Swal from "sweetalert2";
import { useDeleteSupportTicketMutation } from "../features/settings/settingsQuerySlice";

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

function StatusBadge({ status }) {
    const isActive = status === "active";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-amber-500"}`} />
            {isActive ? "Active" : "Pending"}
        </span>
    );
}

function IconBadge({ name }) {
    return (
        <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-500">
            {icons[name] || icons.fork}
        </div>
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
                <td colSpan={7} className="py-2.5 pr-4 text-sm">
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
                            <span className="text-gray-600">{ } {item?.Remark}</span>
                        )}
                    </div>
                </td>
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
                    <div className="flex gap-2">
                        <Link to={`/help/view-support-ticket/${item.ID}`}
                            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md" title="View"

                        >
                            <SvgIcon
                                name={"FaEye"}
                                size={14}
                            />
                        </Link>
                        {/* <DeleteButton onClick={() => { handleDelete(item.ID) }} /> */}

                        <div className="flex items-center gap-2 font-medium text-gray-800 text-sm ">
                            {hasChildren ? (
                                <button
                                    onClick={() => setOpen((o) => !o)}
                                    className={`px-[10px] h-full rounded-[5px] bg-[#d3d3d3] text-blue-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                                >
                                    <ChevronDown />
                                </button>
                            ) : (
                                <span className="w-[18px]" />
                            )}
                            {item.title}
                        </div>
                    </div>
                </td>


                <td className="py-3 pl-2 pr-3 text-[16px] leading-[28px] font-medium text-gray-700 min-w-[200px] max-w-[300px] align-top">
                    <div className={`${expanded ? "" : "line-clamp-2"} overflow-hidden`}>
                        {item.Messages[0]?.Message}
                    </div>

                    {item.Messages[0]?.Message?.length > 100 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-[#5ac146] text-sm mt-1"
                        >
                            {expanded ? "Less" : "More"}
                        </button>
                    )}
                </td>

                <td className="py-2 pr-2 text-[16px] text-black font-bold min-w-[180px] max-w-[180px] align-top">{item.Subject}</td>

                <td className="py-3 pr-3 text-[16px] text-black leading-[24px] align-top">{item.UserCode} {item?.UserInfo?.InstituteName}</td>

                <td className="py-3 pr-3">
                    <StatusBadge status={item.Status} />
                </td>
                <td className="py-3 text-center">
                    {new Date(item.CreatedAt).toDateString()}
                </td>
                {/* <td className="py-3 pr-4">
                    <button className="border border-gray-200 rounded-md px-2 py-0.5 text-gray-400 text-base hover:border-gray-300 hover:bg-gray-50 transition-colors leading-none">
                        ···
                    </button>
                </td> */}
            </tr>
            {hasChildren && open &&
                item.SupportTicketSupport.map((child) => <ChildRow key={child.ID} item={child} depth={1} />)}
        </>
    );
}

export default function CategoryTable({ tableData }) {
    // const [tab, setTab] = useState("categories");
    const [search, setSearch] = useState("");

    const filtered = initialData.filter((d) =>
        d.title.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        console.log(tableData);
    }, [tableData])

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden font-sans w-full">

            {/* Tabs */}
            {/* <div className="flex border-b border-gray-200 px-5">
                {["categories", "product"].map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`py-3 px-3 text-sm border-b-2 -mb-px transition-colors capitalize ${tab === t
                            ? "border-blue-500 text-blue-600 font-medium"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div> */}

            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-gray-400 pointer-events-none">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Search here..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 bg-gray-50 outline-none w-48 focus:border-blue-400 focus:bg-white transition-colors"
                        />
                    </div>
                    {/* <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors">
            <FilterIcon /> Filter
          </button> */}
                </div>
                {/* <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 bg-white hover:bg-gray-50 transition-colors">
            <ImportIcon /> Import file
          </button>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
            <PlusIcon /> Create new category
          </button>
        </div> */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto font-SolaimanLipi">
                <table className="w-full border-collapse text-sm">
                    <colgroup>
                        <col className="w-[40px]" />
                        <col className="w-[40%]" />
                        <col className="w-[22%]" />
                        <col className="w-[10%]" />
                        <col className="w-[12%]" />
                        <col className="w-[9%]" />
                    </colgroup>
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="py-2.5 pl-4 text-[16px] w-9 font-bold">মতামত</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">বিবরণ</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">বিষয়</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold">প্রতিষ্ঠানের নাম</th>
                            <th className="py-2.5 pr-3 text-left text-[16px] font-bold"> স্ট্যাটাস </th>
                            <th className="py-2.5 pr-3 text-center text-[16px] font-bold"> তৈরির তারিখ </th>

                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item) => (
                            <CategoryRow key={item.ID} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}