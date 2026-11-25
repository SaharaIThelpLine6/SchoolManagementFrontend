import { FormProvider, useForm } from "react-hook-form";
import SortableTable from "../../components/Tables/SortableTable";
import useTranslate from "../../utils/Translate";
import { useMemo, useState } from "react";
import {
  useGetAllUserPermissionListViewsQuery,
  useUpdatePermissionCheckedAllMutation,
  useUpdatePermissionToggleMutation,
} from "../../features/permission/permissionSlice";
import Loading from "../../components/Loading/Loading";
import { toast } from "react-toastify";

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------
const SearchIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-white"
    aria-hidden="true"
  >
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const Spinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

// Active / InActive — এক ক্লিকেই বদলায়
const StatusPill = ({ active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`inline-flex w-[104px] items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold ring-1 ring-inset transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 ${active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
      : "bg-rose-50 text-rose-600 ring-rose-200 hover:bg-rose-100"
      }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${active ? "bg-emerald-500" : "bg-rose-400"
        }`}
    />
    {active ? "Active" : "InActive"}
  </button>
);

const StatChip = ({ label, value, total, tone }) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 ${tones[tone]}`}
    >
      <span className="text-[12px] font-semibold">{label}</span>
      <span className="text-[14px] font-bold leading-none">
        {value}
        <span className="text-[11px] font-medium opacity-60"> / {total}</span>
      </span>
    </div>
  );
};

const AddLoginUsersModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();

  const [selectedRow, setSelectedRow] = useState(null);
  const [search, setSearch] = useState("");
  // নতুন স্টেট: চেকবক্সের জন্য
  const [checkboxes, setCheckboxes] = useState({});

  const {
    data: permissionLists,
    isLoading,
    isError,
    isFetching,
  } = useGetAllUserPermissionListViewsQuery({
    page: 1,
    limit: 1000,
    search,
    id,
  });

  const [updatePermissionToggle] = useUpdatePermissionToggleMutation();
  const [updatePermissionCheckedAll] = useUpdatePermissionCheckedAllMutation();

  const rows = permissionLists?.data || [];

  // উপরের সারাংশ — কয়টা পাওয়ার চালু আছে
  const stats = useMemo(() => {
    const count = (key) => rows.filter((r) => r[key] === 1).length;
    return {
      total: rows.length,
      view: count("PermissionView"),
      insert: count("PermissionInsert"),
      edit: count("PermissionEdit"),
      del: count("PermissionDelete"),
    };
  }, [rows]);

  const handleRowClick = (row) => {
    if (selectedRow?.ID === row.ID) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row);
    }
  };

  // Check Box handler
  const handleCheckboxChange = async (field) => {
    setCheckboxes((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));

    try {
      const body = {
        permissionItem: field,
        userID: id,
      };

      const response = await updatePermissionCheckedAll(body).unwrap();

      toast.success(response.message || `${field} updated successfully`, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      toast.error(err?.data?.error || `Failed to update ${field}`, {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  const handleToggle = async (row, field) => {
    const body = {
      UserID: row.UserID,
      PermissionListID: row.PermissionListID,
      permissions: {
        View:
          field === "View"
            ? row.PermissionView === 0
            : row.PermissionView === 1,
        Insert:
          field === "Insert"
            ? row.PermissionInsert === 0
            : row.PermissionInsert === 1,
        Edit:
          field === "Edit"
            ? row.PermissionEdit === 0
            : row.PermissionEdit === 1,
        Delete:
          field === "Delete"
            ? row.PermissionDelete === 0
            : row.PermissionDelete === 1,
      },
    };

    try {
      const res = await updatePermissionToggle(body).unwrap();
      console.log("✅ Updated:", res);
    } catch (err) {
      console.error("❌ Update Error:", err);
    }
  };

  const columns = [
    {
      title: translate("Serial"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-gray-100 px-2 text-[12px] font-bold text-gray-600">
          {row.ID}
        </span>
      ),
    },
    {
      title: translate("Power Name"),
      field: "PowerName",
      hozAlign: "center",
      render: (row) => (
        <span className="text-[14px] font-semibold text-gray-800">
          {row.PowerName}
        </span>
      ),
    },
    {
      title: translate("View"),
      field: "PermissionView",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <StatusPill
          active={row.PermissionView === 1}
          onClick={() => handleToggle(row, "View")}
        />
      ),
    },
    {
      title: translate("Insert"),
      field: "PermissionInsert",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <StatusPill
          active={row.PermissionInsert === 1}
          onClick={() => handleToggle(row, "Insert")}
        />
      ),
    },
    {
      title: translate("Edit"),
      field: "PermissionEdit",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <StatusPill
          active={row.PermissionEdit === 1}
          onClick={() => handleToggle(row, "Edit")}
        />
      ),
    },
    {
      title: translate("Delete"),
      field: "PermissionDelete",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <StatusPill
          active={row.PermissionDelete === 1}
          onClick={() => handleToggle(row, "Delete")}
        />
      ),
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-[14px] font-semibold text-rose-600">
        Error loading permissions
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-5 bg-white font-SolaimanLipi">
        {/* ====== ফিক্সড অংশ: হেডার + সার্চ + সারাংশ — স্ক্রল করলেও উপরে থাকবে ====== */}
        <div className="sticky top-0 z-30 -mx-1 flex flex-col gap-4 bg-white px-1 pb-3 pt-1 shadow-[0_8px_8px_-8px_rgba(0,0,0,0.12)]">
          {/* ================================================ হেডার */}
          <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/20 shadow-inner backdrop-blur">
                <ShieldIcon />
              </div>
              <div>
                <h4 className="text-[17px] font-bold leading-tight text-white">
                  {translate("Permission Management")}
                </h4>
                <p className="text-[12px] text-indigo-100">
                  {translate("Turn View, Insert, Edit and Delete on or off for each power")}
                </p>
              </div>
            </div>

            {/* সার্চ */}
            <div className="relative z-10 w-full sm:w-[300px]">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search permissions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border-0 bg-white py-2 pl-10 pr-16 text-[13px] text-gray-700 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-white/60"
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-indigo-600">
                {isFetching ? <Spinner /> : null}
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-[14px] leading-none text-gray-500 hover:bg-gray-200"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* ============================================ সারাংশ */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatChip label="View" value={stats.view} total={stats.total} tone="sky" />
            <StatChip label="Insert" value={stats.insert} total={stats.total} tone="emerald" />
            <StatChip label="Edit" value={stats.edit} total={stats.total} tone="amber" />
            <StatChip label="Delete" value={stats.del} total={stats.total} tone="rose" />
          </div>
        </div>

        {/* ============================================ টেবিল */}
        <div
          className={`w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm font-SolaimanLipi transition-opacity ${isFetching ? "opacity-70" : "opacity-100"
            }`}
        >
          <SortableTable
            columns={columns}
            data={rows}
            isFilterColumn={false}
            onRowClick={handleRowClick}
            close={setSelectedRow}
            checkboxes={checkboxes}
            onCheckboxChange={handleCheckboxChange}
          />

          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-[14px] font-medium text-gray-400">
              {search ? "No permission matches your search" : "No data found"}
            </div>
          ) : null}
        </div>

      </div>
    </FormProvider>
  );
};

export default AddLoginUsersModal;
// import { FormProvider, useForm } from "react-hook-form";
// import SortableTable from "../../components/Tables/SortableTable";
// import useTranslate from "../../utils/Translate";
// import { useState } from "react";
// import ToggleBox from "../../components/ToggleBox/ToggleBox";
// import Button from "../../components/Button/Button";
// import {
//   useGetAllUserPermissionListViewsQuery,
//   useUpdatePermissionCheckedAllMutation,
//   useUpdatePermissionToggleMutation,
// } from "../../features/permission/permissionSlice";
// import Loading from "../../components/Loading/Loading";
// import { toast } from "react-toastify";

// const AddLoginUsersModal = ({ id }) => {
//   const methods = useForm();
//   const translate = useTranslate();

//   const [selectedRow, setSelectedRow] = useState(null);
//   const [search, setSearch] = useState("");
//   // নতুন স্টেট: চেকবক্সের জন্য
//   const [checkboxes, setCheckboxes] = useState({});

//   const {
//     data: permissionLists,
//     isLoading,
//     isError,
//   } = useGetAllUserPermissionListViewsQuery({
//     page: 1,
//     limit: 1000,
//     search,
//     id,
//   });

//   const [updatePermissionToggle] = useUpdatePermissionToggleMutation();
//   const [updatePermissionCheckedAll] = useUpdatePermissionCheckedAllMutation();

//   const handleRowClick = (row) => {
//     if (selectedRow?.ID === row.ID) {
//       setSelectedRow(null);
//     } else {
//       setSelectedRow(row);
//     }
//   };

//   // Check Box handler
//   const handleCheckboxChange = async (field) => {
//     setCheckboxes((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }));

//     try {
//       const body = {
//         permissionItem: field,
//         userID: id,
//       };

//       const response = await updatePermissionCheckedAll(body).unwrap();

//       toast.success(response.message || `${field} updated successfully`, {
//         position: "top-right",
//         autoClose: 2000,
//       });
//     } catch (err) {
//       toast.error(err?.data?.error || `Failed to update ${field}`, {
//         position: "top-right",
//         autoClose: 2000,
//       });
//     }
//   };


//   const handleToggle = async (row, field) => {
//     const body = {
//       UserID: row.UserID,
//       PermissionListID: row.PermissionListID,
//       permissions: {
//         View:
//           field === "View"
//             ? row.PermissionView === 0
//             : row.PermissionView === 1,
//         Insert:
//           field === "Insert"
//             ? row.PermissionInsert === 0
//             : row.PermissionInsert === 1,
//         Edit:
//           field === "Edit"
//             ? row.PermissionEdit === 0
//             : row.PermissionEdit === 1,
//         Delete:
//           field === "Delete"
//             ? row.PermissionDelete === 0
//             : row.PermissionDelete === 1,
//       },
//     };

//     try {
//       const res = await updatePermissionToggle(body).unwrap();
//       console.log("✅ Updated:", res);
//     } catch (err) {
//       console.error("❌ Update Error:", err);
//     }
//   };

//   const columns = [
//     {
//       title: translate("Serial"),
//       field: "ID",
//       hozAlign: "center",
//       render: (row) => <p>{row.ID}</p>,
//     },
//     {
//       title: translate("Power Name"),
//       field: "PowerName",
//       hozAlign: "center",
//       render: (row) => <p>{row.PowerName}</p>,
//     },
//     {
//       title: translate("View"),
//       field: "PermissionView",
//       hozAlign: "center",
//       hasCheckbox: true,
//       render: (row) => (
//         <Button
//           onClick={() => handleToggle(row, "View")}
//           className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionView === 1
//             ? "bg-green-500 hover:bg-green-600"
//             : "bg-red-500 hover:bg-red-600"
//             }`}
//         >
//           {row.PermissionView === 1 ? "Active" : "InActive"}
//         </Button>
//       ),
//     },
//     {
//       title: translate("Insert"),
//       field: "PermissionInsert",
//       hozAlign: "center",
//       hasCheckbox: true,
//       render: (row) => (
//         <Button
//           onClick={() => handleToggle(row, "Insert")}
//           className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionInsert === 1
//             ? "bg-green-500 hover:bg-green-600"
//             : "bg-red-500 hover:bg-red-600"
//             }`}
//         >
//           {row.PermissionInsert === 1 ? "Active" : "InActive"}
//         </Button>
//       ),
//     },
//     {
//       title: translate("Edit"),
//       field: "PermissionEdit",
//       hozAlign: "center",
//       hasCheckbox: true,
//       render: (row) => (
//         <Button
//           onClick={() => handleToggle(row, "Edit")}
//           className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionEdit === 1
//             ? "bg-green-500 hover:bg-green-600"
//             : "bg-red-500 hover:bg-red-600"
//             }`}
//         >
//           {row.PermissionEdit === 1 ? "Active" : "InActive"}
//         </Button>
//       ),
//     },
//     {
//       title: translate("Delete"),
//       field: "PermissionDelete",
//       hozAlign: "center",
//       hasCheckbox: true,
//       render: (row) => (
//         <Button
//           onClick={() => handleToggle(row, "Delete")}
//           className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionDelete === 1
//             ? "bg-green-500 hover:bg-green-600"
//             : "bg-red-500 hover:bg-red-600"
//             }`}
//         >
//           {row.PermissionDelete === 1 ? "Active" : "InActive"}
//         </Button>
//       ),
//     },
//   ];

//   if (isLoading) return <Loading />;
//   if (isError) return <p>Error loading permissions</p>;

//   return (
//     <FormProvider {...methods}>
//       <div className="bg-white flex flex-col gap-6 font-SolaimanLipi">
//         {/* 🔍 Search Box */}
//         <div className="flex items-center gap-2">
//           <input
//             type="text"
//             placeholder="Search permissions..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="border px-3 py-2 rounded w-1/3"
//           />
//         </div>

//         <div className="w-full font-SolaimanLipi">
//           <SortableTable
//             columns={columns}
//             data={permissionLists?.data || []}
//             isFilterColumn={false}
//             onRowClick={handleRowClick}
//             close={setSelectedRow}
//             checkboxes={checkboxes}
//             onCheckboxChange={handleCheckboxChange}
//           />

//           {selectedRow && (
//             <div className="mt-4">
//               <ToggleBox />
//             </div>
//           )}
//         </div>
//       </div>
//     </FormProvider>
//   );
// };

// export default AddLoginUsersModal;
