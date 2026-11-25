import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomTable from "../view/settings/CustomTable";
import UserFilterModal from "../components/Modals/UserFilterModal"; // ⚠️ নিজের প্রজেক্টের সঠিক পাথ বসিয়ে নিও
import {
  useGetLoginUsersQuery,
  usePostLoginUserMutation,
  useUpdateLoginUserStatusChangeMutation,
} from "../features/userType/userTypeSlice";
import bnBijoy2Unicode from "../utils/conveter";
import { useGetPermissionTypesQuery } from "../features/settings/settingsQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading/Loading";
import { setFilteredUser } from "../features/student/studentSlice";
import Swal from "sweetalert2";
import TeacherFilterModal from "../components/Modals/TeacherFilterModal";

// Constants
const PAGE_SIZE = 100;

const EMPTY_FORM = {
  school_id: "",
  userId: "",
  loginName: "",
  password: "",
  permissionTypeId: "",
  ConfirmPassword: "",
};

/* ---------------- অ্যাডমিট কার্ড পেজের কালার প্যালেট ---------------- */
const C = {
  gradient: "bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4]",
  panel: "bg-[#F5F3FF]",
  panelBorder: "border-[#DDD6FE]",
  primary: "bg-[#4F46E5] hover:bg-[#4338CA] text-white",
};

const controlClass =
  "h-[38px] w-full border border-[#DDD6FE] rounded-md px-3 text-sm bg-white outline-none transition focus:border-[#4F46E5] focus:ring-2 focus:ring-[#E0E7FF]";

// খালি/বিভিন্ন টাইপের মান নিরাপদে স্ট্রিং-এ মিলিয়ে দেখার জন্য
const includesText = (value, query) =>
  String(value ?? "").toLowerCase().includes(query);

// ---------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------
const EyeOpen = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 576 512"
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
  </svg>
);

const EyeOff = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 640 512"
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-white"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="15"
    height="15"
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

const CloseIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const PickUserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5h16l-6.5 7.5v5l-3 1.5v-6.5L4 5z" />
  </svg>
);

// লগইন ধরন অনুযায়ী ব্যাজের রঙ
const BADGE_COLORS = {
  Owner: "bg-purple-50 text-purple-700 ring-purple-200",
  "Project Administrator": "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Project Moderator": "bg-sky-50 text-sky-700 ring-sky-200",
  Reseller: "bg-amber-50 text-amber-700 ring-amber-200",
  "Users Admin": "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Users: "bg-gray-100 text-gray-700 ring-gray-200",
};

const RoleBadge = ({ value }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ring-1 ring-inset ${BADGE_COLORS[value] || "bg-gray-100 text-gray-700 ring-gray-200"
      }`}
  >
    {value || "—"}
  </span>
);

const PasswordToggle = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-9 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition"
    aria-label={shown ? "Hide password" : "Show password"}
  >
    {shown ? <EyeOff /> : <EyeOpen />}
  </button>
);

const AddLoginUsers = () => {
  // Form setup with dynamic default values from Redux state
  const methods = useForm({ defaultValues: EMPTY_FORM });
  const { handleSubmit, reset, setValue } = methods;
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { filteredUser } = useSelector((state) => state.student);

  const permissionType = user?.permissionType;
  const isReadOnlyUser = permissionType === 6;

  const { data: permissionTypeData, isLoading: permissionLoading } =
    useGetPermissionTypesQuery();
  const [updateLoginUserStatus] = useUpdateLoginUserStatusChangeMutation();

  const [postLoginUser, { isLoading: isPosting }] = usePostLoginUserMutation();
  const { data, isLoading, isError } = useGetLoginUsersQuery();
  const loginUsers = data?.users || [];

  const [currentPage, setCurrentPage] = useState(1);

  // মডাল state
  const [showModal, setShowModal] = useState(false); // নতুন লগইন ইউজার ফর্ম
  const [showPicker, setShowPicker] = useState(false); // ইউজার খোঁজার পপআপ

  // সার্চ + ফিল্টার state
  const [search, setSearch] = useState("");
  const [filterLoginType, setFilterLoginType] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Filter permission types based on user permission type
  const filteredPermissionTypes = useMemo(() => {
    if (!permissionTypeData) return [];

    switch (permissionType) {
      case 1: // Owner
        return permissionTypeData; // Access to all permission types
      case 2: // Project Administrator
        return permissionTypeData.filter((pt) =>
          [3, 4, 5, 6].includes(pt.PermissionTypeID)
        );
      case 3: // Project Moderator
        return permissionTypeData.filter((pt) =>
          [4, 5, 6].includes(pt.PermissionTypeID)
        );
      case 4: // Reseller
        return permissionTypeData.filter((pt) =>
          [5, 6].includes(pt.PermissionTypeID)
        );
      case 5: // Users Admin
        return permissionTypeData.filter((pt) =>
          [5, 6].includes(pt.PermissionTypeID)
        );
      case 6: // Users
        return []; // No access to any permission types
      default:
        return [];
    }
  }, [permissionType, permissionTypeData]);

  // ইউজার বাছাই হলে শুধু "User Name" ঘরটা বসবে — বাকি ঘরের লেখা মুছবে না
  useEffect(() => {
    setValue(
      "UserName",
      filteredUser?.UserName ? bnBijoy2Unicode(filteredUser?.UserName) : ""
    );
  }, [filteredUser, setValue]);

  /* ---------------- সব ইউজার — টেবিলের মতো করে সাজানো ---------------- */
  const mappedUsers = useMemo(
    () =>
      loginUsers.map((u) => ({
        ID: u.UserID,
        NewUserID: u.NewUserID,
        Code: u.UserCode,
        IsVerified: u.IsVerified,
        UserAction: u.UserAction,
        LoginName: u.LoginName,
        Name: u.UserName ? bnBijoy2Unicode(u.UserName) : "N/A",
        Type: u.TypeName,
        LoginType: u.PermissionName,
      })),
    [loginUsers]
  );

  // ফিল্টারের ড্রপডাউনের অপশন — ডাটা থেকেই ইউনিক মান
  const loginTypeOptions = useMemo(
    () => [...new Set(mappedUsers.map((u) => u.LoginType).filter(Boolean))],
    [mappedUsers]
  );
  const typeOptions = useMemo(
    () => [...new Set(mappedUsers.map((u) => u.Type).filter(Boolean))],
    [mappedUsers]
  );

  /* ---------------- ফিল্টার + সার্চ প্রয়োগ ---------------- */
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return mappedUsers.filter((row) => {
      if (filterLoginType && row.LoginType !== filterLoginType) return false;
      if (filterType && row.Type !== filterType) return false;
      if (filterStatus && String(row.UserAction) !== filterStatus) return false;

      if (!q) return true;

      return (
        includesText(row.ID, q) ||
        includesText(row.Code, q) ||
        includesText(row.LoginName, q) ||
        includesText(row.Name, q) ||
        includesText(row.Type, q) ||
        includesText(row.LoginType, q)
      );
    });
  }, [mappedUsers, search, filterLoginType, filterType, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;

  // Paginate login users
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE).map((row, index) => ({
      ...row,
      Number: index + 1 + start,
    }));
  }, [filteredData, currentPage]);

  // ফিল্টার বদলালে আবার প্রথম পেজে
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterLoginType, filterType, filterStatus]);

  // ডাটা কমে গেলে পেজ যেন রেঞ্জের বাইরে না থাকে
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const isFiltering = Boolean(
    search || filterLoginType || filterType || filterStatus
  );

  const clearFilters = () => {
    setSearch("");
    setFilterLoginType("");
    setFilterType("");
    setFilterStatus("");
  };

  /* ---------------- মডাল খোলা/বন্ধ ---------------- */
  const openModal = () => {
    reset(EMPTY_FORM);
    dispatch(setFilteredUser(null));
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowModal(true);
  };

  const closeModal = useCallback(() => {
    setShowPicker(false);
    setShowModal(false);
    dispatch(setFilteredUser(null));
  }, [dispatch]);

  const handleResetForm = () => {
    reset(EMPTY_FORM);
    dispatch(setFilteredUser(null));
  };

  // মডাল খোলা থাকলে পেছনের স্ক্রল বন্ধ + Esc (আগে উপরের পপআপ, তারপর ফর্ম)
  useEffect(() => {
    if (!showModal && !showPicker) return undefined;

    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (showPicker) setShowPicker(false);
      else closeModal();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [showModal, showPicker, closeModal]);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        // Validate password and confirm password match first
        if (formData.password !== formData.ConfirmPassword) {
          methods.setError("ConfirmPassword", {
            type: "manual",
            message: translate("Passwords do not match!"),
          });
          return;
        }

        // Validate required fields only if password matches
        if (!user?.schoolId) {
          methods.setError("school_id", {
            type: "manual",
            message: translate("School ID is required!"),
          });
          return;
        }

        if (!filteredUser?.UserID) {
          methods.setError("userId", {
            type: "manual",
            message: translate("User ID is required!"),
          });
          // ইউজার বাছাই না থাকলে ব্যবহারকারীকে স্পষ্ট করে জানাই
          Swal.fire({
            icon: "warning",
            title: translate("User ID is required!"),
            confirmButtonColor: "#4F46E5",
          });
          return;
        }

        // Prepare payload for API
        const payload = {
          school_id: user?.schoolId,
          userId: filteredUser?.UserID,
          loginName: formData.loginName,
          password: formData.password,
          permissionTypeId: Number(formData.permissionTypeId),
        };

        // Post the login user data
        await postLoginUser(payload).unwrap();
        reset(EMPTY_FORM); // Reset form after successful submission
        dispatch(setFilteredUser(null));
        setShowModal(false);

        // SweetAlert Success
        Swal.fire({
          icon: "success",
          title: translate("User added successfully!"),
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        console.error("Failed to add user:", error);

        // SweetAlert Error
        Swal.fire({
          icon: "error",
          title: translate("Failed to add user!"),
          text: translate("Please try again."),
        });
      }
    },
    [postLoginUser, user, filteredUser, translate, reset, methods, dispatch]
  );

  const handleToggleAction = async (row) => {
    try {
      if (permissionType === 6) {
        return;
      }
      if (!row.ID) {
        Swal.fire({
          icon: "error",
          title: translate("Invalid User ID!"),
          text: translate("Please try again."),
        });
        return;
      }

      const newStatus = row.UserAction === 1 ? 0 : 1;

      // ✅ Confirmation alert
      const result = await Swal.fire({
        title:
          newStatus === 1
            ? translate("Are you sure you want to Activate this user?")
            : translate("Are you sure you want to Deactivate this user?"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: translate("Yes, Confirm"),
        cancelButtonText: translate("Cancel"),
        confirmButtonColor: "#4F46E5",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return; // cancel চাপলে কিছু হবে না
      }

      // API call
      await updateLoginUserStatus({
        id: row.ID,
        data: { school_id: user?.schoolId, isVerified: newStatus },
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: translate("Success!"),
        text:
          newStatus === 1
            ? translate("User has been Activated!")
            : translate("User has been Deactivated!"),
      });
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed!"),
        text: translate("Something went wrong. Please try again."),
      });
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      { title: translate("ID"), field: "ID" },
      { title: translate("Code"), field: "Code" },
      { title: translate("Login Name"), field: "LoginName" },
      {
        title: translate("Name"),
        field: "Name",
        render: (row) => (
          <span className="font-medium text-gray-800">{row.Name}</span>
        ),
      },
      { title: translate("Type"), field: "Type" },
      {
        title: translate("Login Type"),
        field: "LoginType",
        render: (row) => <RoleBadge value={row.LoginType} />,
      },
      // ✅ custom render (toggle switch)
      {
        title: translate("Status"),
        field: "Action",
        render: (row) => (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={row.UserAction === 1}
              onChange={() => handleToggleAction(row)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-300 rounded-full transition-colors
                    peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400
                    peer-checked:bg-emerald-500
                    peer-checked:after:translate-x-full
                    peer-checked:after:border-white
                    after:content-[''] after:absolute
                    after:top-0.5 after:left-[2px]
                    after:bg-white after:border-gray-300
                    after:border after:rounded-full
                    after:h-5 after:w-5 after:transition-all"
            ></div>
          </label>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [translate, user, permissionType]
  );

  // Loading and error states
  if (isLoading || permissionLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-[15px] font-semibold text-red-600">
        {translate("Error loading data. Please try again.")}
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="font-SolaimanLipi max-w-full space-y-4 overflow-x-hidden">
        {/* ================================================ গ্রেডিয়েন্ট হেডার */}
        <div
          className={`${C.gradient} relative overflow-hidden rounded-xl px-5 py-4 text-white shadow-lg`}
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/20 backdrop-blur">
                <UsersIcon />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight sm:text-[20px]">
                  {translate("Login Users")}
                </h3>
                <p className="text-xs text-white/80 sm:text-sm">
                  {translate("Create login users and manage their permissions")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 backdrop-blur">
                <span className="text-[13px] font-medium">
                  {translate("Total Users")}
                </span>
                <span className="text-[17px] font-bold leading-none">
                  {loginUsers.length}
                </span>
              </div>

              {/* নতুন লগইন ইউজারের পুরো ফর্ম মডালে খুলবে */}
              <button
                type="button"
                onClick={openModal}
                disabled={isReadOnlyUser}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PlusIcon />
                {translate("Create Login User")}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-transparent md:p-1">
          {/* ---------------- সার্চ + ফিল্টার বার ---------------- */}
          <div className={`${C.panel} border ${C.panelBorder} rounded-xl p-4`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-indigo-800">
                {translate("Search & Filter")}
              </h4>
              <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                {filteredData.length} / {mappedUsers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* সার্চ */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300">
                  <SearchIcon />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={translate("Search")}
                  className={`${controlClass} pl-8`}
                />
              </div>

              {/* লগইন ধরন */}
              <select
                value={filterLoginType}
                onChange={(e) => setFilterLoginType(e.target.value)}
                className={controlClass}
              >
                <option value="">{translate("Login Type")}</option>
                {loginTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              {/* ধরন */}
              {/* <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={controlClass}
              >
                <option value="">{translate("Type")}</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select> */}

              {/* স্ট্যাটাস */}
              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={controlClass}
                >
                  <option value="">{translate("Status")}</option>
                  <option value="1">সক্রিয়</option>
                  <option value="0">নিষ্ক্রিয়</option>
                </select>

                {isFiltering && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    title={translate("Clear")}
                    className="h-[38px] shrink-0 rounded-md border border-indigo-200 bg-white px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- ইউজার তালিকা ---------------- */}
          <div className="mt-5">
            {filteredData.length === 0 ? (
              <div className="py-8 text-center text-sm italic text-gray-400">
                {isFiltering
                  ? translate("No matching data found")
                  : translate("No data available")}
              </div>
            ) : (
              <CustomTable columns={columns} data={paginatedData} />
            )}

            {totalPages > 1 ? (
              <div className="mt-3 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* ================================================ নতুন লগইন ইউজার — মডাল */}
        {showModal && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/50 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !showPicker) closeModal();
            }}
          >
            <div className="my-6 w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
              {/* মডাল হেডার */}
              <div
                className={`${C.gradient} flex items-center justify-between px-5 py-3.5`}
              >
                <div>
                  <h4 className="text-[17px] font-bold text-white">
                    {translate("Create Login User")}
                  </h4>
                  <p className="text-[12px] text-white/80">
                    {translate("Pick a user, then set the login name, password and power")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
                >
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* মডাল বডি */}
                <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
                  <div
                    className={`${C.panel} border ${C.panelBorder} rounded-xl p-4`}
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* User Name + ইউজার খোঁজার বাটন */}
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <DefaultInput
                            type="text"
                            label="User Name"
                            registerKey="UserName"
                            nameField="UserName"
                            disable={true}
                            className="w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => setShowPicker(true)}
                          title="Filter and Select User"
                          className="mt-[30px] shrink-0 rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm"
                          disabled={isReadOnlyUser}
                        >
                          <PickUserIcon />
                        </Button>
                      </div>

                      {/* User Power */}
                      <DefaultSelect
                        label="User Role"
                        options={filteredPermissionTypes}
                        valueField="PermissionTypeID"
                        nameField="PermissionName"
                        registerKey="permissionTypeId"
                        require={translate("Permission type is required!")}
                        disabled={isReadOnlyUser}
                      />

                      {/* Login Name */}
                      <div className="md:col-span-2">
                        <DefaultInput
                          label="Login Name"
                          type="text"
                          placeholder={translate("Enter username")}
                          registerKey="loginName"
                          require={translate("Login name is required!")}
                          disable={isReadOnlyUser}
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <DefaultInput
                          type={showPassword ? "text" : "password"}
                          label="Password"
                          placeholder={translate("Enter password")}
                          registerKey="password"
                          require={translate("Password is required!")}
                          className="w-full pr-12"
                          disable={isReadOnlyUser}
                        />
                        <PasswordToggle
                          shown={showPassword}
                          onToggle={() => setShowPassword(!showPassword)}
                        />
                      </div>

                      {/* Confirm Password */}
                      <div className="relative">
                        <DefaultInput
                          type={showConfirmPassword ? "text" : "password"}
                          label="Confirm Password"
                          placeholder="Confirm Password"
                          registerKey="ConfirmPassword"
                          require={translate("Confirm password is required!")}
                          className="w-full pr-12"
                          disable={isReadOnlyUser}
                        />
                        <PasswordToggle
                          shown={showConfirmPassword}
                          onToggle={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* মডাল ফুটার */}
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3.5">
                  {/* Reset Button */}
                  <Button
                    type="button"
                    onClick={handleResetForm}
                    variant="secondary"
                    className="rounded-lg border border-red-200 bg-red-700 px-5 py-2 text-[13px] font-semibold text-red-600 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700 active:scale-95"
                    disabled={isReadOnlyUser}
                  >
                    {translate("Reset")}
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Cancel Button */}
                    <button
                      type="button"
                      onClick={closeModal}
                      className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-[13px] font-bold text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {translate("Cancel")}
                    </button>

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={isPosting || isReadOnlyUser}
                      className={`rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-[13px] font-bold text-white shadow-md transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 ${isPosting || isReadOnlyUser
                        ? "cursor-not-allowed opacity-60"
                        : ""
                        }`}
                    >
                      {isPosting ? translate("Saving...") : translate("Save")}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================ ইউজার খোঁজার পপআপ */}
        {showPicker && (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowPicker(false);
            }}
          >
            <div className="my-10 w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
              <div
                className={`${C.gradient} flex items-center justify-between px-5 py-3.5`}
              >
                <div>
                  <h4 className="text-[17px] font-bold text-white">
                    {translate("Filter User")}
                  </h4>
                  <p className="text-[12px] text-white/80">
                    {translate("Search by code, name or mobile and select a user")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="px-5 py-5">
                <TeacherFilterModal onSelect={() => setShowPicker(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default AddLoginUsers;

// import DefaultSelect from "../components/Forms/DefaultSelect";
// import DefaultInput from "../components/Forms/DefaultInput";
// import { FormProvider, useForm } from "react-hook-form";
// import Button from "../components/Button/Button";
// import DefaultPagination from "../components/Pagination/DefaultPagination";
// import useTranslate from "../utils/Translate";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { showModal } from "../utils/ModalControlar";
// import CustomTable from "../view/settings/CustomTable";
// import {
//   useGetLoginUsersQuery,
//   usePostLoginUserMutation,
//   useUpdateLoginUserStatusChangeMutation,
// } from "../features/userType/userTypeSlice";
// import bnBijoy2Unicode from "../utils/conveter";
// import { useGetPermissionTypesQuery } from "../features/settings/settingsQuerySlice";
// import { useDispatch, useSelector } from "react-redux";
// import Loading from "../components/Loading/Loading";
// import { setFilteredUser } from "../features/student/studentSlice";
// import Swal from "sweetalert2";

// // Constants
// const PAGE_SIZE = 100;

// const AddLoginUsers = () => {
//   // Form setup with dynamic default values from Redux state
//   const methods = useForm({
//     defaultValues: {
//       school_id: "",
//       userId: "",
//       loginName: "",
//       password: "",
//       permissionTypeId: "",
//       ConfirmPassword: "",
//     },
//   });
//   const {
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = methods;
//   const translate = useTranslate();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);
//   const { filteredUser } = useSelector((state) => state.student);

//   const permissionType = user?.permissionType;
//   const { data: permissionTypeData, isLoading: permissionLoading } =
//     useGetPermissionTypesQuery();
//   const [updateLoginUserStatus] = useUpdateLoginUserStatusChangeMutation();

//   const [postLoginUser, { isLoading: isPosting }] = usePostLoginUserMutation();
//   const { data, isLoading, isError } = useGetLoginUsersQuery();
//   const loginUsers = data?.users || [];

//   const [currentPage, setCurrentPage] = useState(1);
//   const totalPages = Math.ceil(loginUsers.length / PAGE_SIZE);

//   // Filter permission types based on user permission type
//   const filteredPermissionTypes = useMemo(() => {
//     if (!permissionTypeData) return [];

//     switch (permissionType) {
//       case 1: // Owner
//         return permissionTypeData; // Access to all permission types
//       case 2: // Project Administrator
//         return permissionTypeData.filter((pt) =>
//           [3, 4, 5, 6].includes(pt.PermissionTypeID)
//         );
//       case 3: // Project Moderator
//         return permissionTypeData.filter((pt) =>
//           [4, 5, 6].includes(pt.PermissionTypeID)
//         );
//       case 4: // Reseller
//         return permissionTypeData.filter((pt) =>
//           [5, 6].includes(pt.PermissionTypeID)
//         );
//       case 5: // Users Admin
//         return permissionTypeData.filter((pt) =>
//           [5, 6].includes(pt.PermissionTypeID)
//         );
//       case 6: // Users
//         return []; // No access to any permission types
//       default:
//         return [];
//     }
//   }, [permissionType, permissionTypeData]);

//   useEffect(() => {
//     reset({
//       UserName: filteredUser?.UserName
//         ? bnBijoy2Unicode(filteredUser?.UserName)
//         : "",
//     });
//   }, [filteredUser, reset]);

//   // Paginate login users
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return loginUsers.slice(start, start + PAGE_SIZE).map((user, index) => ({
//       ID: user.UserID,
//       NewUserID: user.NewUserID,
//       Code: user.UserCode,
//       IsVerified: user.IsVerified,
//       UserAction: user.UserAction,
//       LoginName: user.LoginName,
//       Name: user.UserName ? bnBijoy2Unicode(user.UserName) : "N/A",
//       Type: user.TypeName,
//       LoginType: user.PermissionName,
//       Number: index + 1 + (currentPage - 1) * PAGE_SIZE,
//     }));
//   }, [loginUsers, currentPage]);

//   // Handle modal for user filtering
//   const handleOpenModal = useCallback(() => {
//     showModal("Filter User", "USER_FILTER");
//   }, []);

//   // State for password visibility
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const onSubmit = useCallback(
//     async (formData) => {
//       try {
//         // Validate password and confirm password match first
//         if (formData.password !== formData.ConfirmPassword) {
//           methods.setError("ConfirmPassword", {
//             type: "manual",
//             message: translate("Passwords do not match!"),
//           });
//           return;
//         }

//         // Validate required fields only if password matches
//         if (!user?.schoolId) {
//           methods.setError("school_id", {
//             type: "manual",
//             message: translate("School ID is required!"),
//           });
//           return;
//         }

//         if (!filteredUser?.UserID) {
//           methods.setError("userId", {
//             type: "manual",
//             message: translate("User ID is required!"),
//           });
//           return;
//         }

//         // Prepare payload for API
//         const payload = {
//           school_id: user?.schoolId,
//           userId: filteredUser?.UserID,
//           loginName: formData.loginName,
//           password: formData.password,
//           permissionTypeId: Number(formData.permissionTypeId),
//         };

//         // Post the login user data
//         await postLoginUser(payload).unwrap();
//         reset({
//           school_id: "",
//           userId: "",
//           loginName: "",
//           password: "",
//           permissionTypeId: "",
//           ConfirmPassword: "",
//         }); // Reset form after successful submission
//         dispatch(setFilteredUser(null));

//         // SweetAlert Success
//         Swal.fire({
//           icon: "success",
//           title: translate("User added successfully!"),
//           showConfirmButton: false,
//           timer: 2000,
//         });
//       } catch (error) {
//         console.error("Failed to add user:", error);

//         // SweetAlert Error
//         Swal.fire({
//           icon: "error",
//           title: translate("Failed to add user!"),
//           text: translate("Please try again."),
//         });
//       }
//     },
//     [postLoginUser, user, filteredUser, translate, reset, methods, dispatch]
//   );

//   const handleToggleAction = async (row) => {
//     try {
//       if (permissionType === 6) {
//         return;
//       }
//       if (!row.ID) {
//         Swal.fire({
//           icon: "error",
//           title: translate("Invalid User ID!"),
//           text: translate("Please try again."),
//         });
//         return;
//       }

//       const newStatus = row.UserAction === 1 ? 0 : 1;

//       // ✅ Confirmation alert
//       const result = await Swal.fire({
//         title:
//           newStatus === 1
//             ? translate("Are you sure you want to Activate this user?")
//             : translate("Are you sure you want to Deactivate this user?"),
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: translate("Yes, Confirm"),
//         cancelButtonText: translate("Cancel"),
//         reverseButtons: true,
//       });

//       if (!result.isConfirmed) {
//         return; // cancel চাপলে কিছু হবে না
//       }

//       // API call
//       await updateLoginUserStatus({
//         id: row.ID,
//         data: { school_id: user?.schoolId, isVerified: newStatus },
//       }).unwrap();

//       Swal.fire({
//         icon: "success",
//         title: translate("Success!"),
//         text:
//           newStatus === 1
//             ? translate("User has been Activated!")
//             : translate("User has been Deactivated!"),
//       });

//       // Refresh / local update
//       // refetch();
//     } catch (error) {
//       console.error("Update Error:", error);
//       Swal.fire({
//         icon: "error",
//         title: translate("Failed!"),
//         text: translate("Something went wrong. Please try again."),
//       });
//     }
//   };

//   // Table columns
//   const columns = useMemo(
//     () => [
//       { title: translate("ID"), field: "ID" },
//       { title: translate("Code"), field: "Code" },
//       { title: translate("Login Name"), field: "LoginName" },
//       { title: translate("Name"), field: "Name" },
//       { title: translate("Type"), field: "Type" },
//       { title: translate("Login Type"), field: "LoginType" },
//       // ✅ এখানে custom render (toggle switch)
//       {
//         title: translate("Status"),
//         field: "Action",
//         render: (row) => (
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={row.UserAction === 1}
//               onChange={() => handleToggleAction(row)}
//               className="sr-only peer"
//             />
//             <div
//               className="w-11 h-6 bg-gray-200 rounded-full
//                     peer-checked:bg-green-600
//                     peer-checked:after:translate-x-full
//                     peer-checked:after:border-white
//                     after:content-[''] after:absolute
//                     after:top-0.5 after:left-[2px]
//                     after:bg-white after:border-gray-300
//                     after:border after:rounded-full
//                     after:h-5 after:w-5 after:transition-all"
//             ></div>
//           </label>
//         ),
//       },
//     ],
//     [translate]
//   );

//   // Loading and error states
//   if (isLoading || permissionLoading) {
//     return <Loading />;
//   }

//   if (isError) {
//     return <div>{translate("Error loading data. Please try again.")}</div>;
//   }

//   return (
//     <FormProvider {...methods}>
//       <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-default">
//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="md:flex w-full px-3 gap-3">
//             {/* Input Form */}
//             <div className="w-full">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {/* User Name + Select Modal Button */}
//                 <div className="flex items-end gap-2">
//                   <DefaultInput
//                     type="text"
//                     label="User Name"
//                     registerKey="UserName"
//                     nameField="UserName"
//                     disable={true}
//                     className="flex-1"
//                   />
//                   <Button
//                     type="button"
//                     onClick={handleOpenModal}
//                     className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
//                     disabled={permissionType === 6 ? true : false}
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-5 h-5 text-gray-600"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M4 6h16M4 12h16M4 18h16"
//                       />
//                     </svg>
//                   </Button>
//                 </div>

//                 {/* User Power */}
//                 <DefaultSelect
//                   label="User Power"
//                   options={filteredPermissionTypes}
//                   valueField="PermissionTypeID"
//                   nameField="PermissionName"
//                   registerKey="permissionTypeId"
//                   require={translate("Permission type is required!")}
//                   disabled={permissionType === 6 ? true : false}
//                 />

//                 {/* Login Name */}
//                 <DefaultInput
//                   label="Login Name"
//                   type="text"
//                   placeholder={translate("Enter login name")}
//                   registerKey="loginName"
//                   require={translate("Login name is required!")}
//                   disable={permissionType === 6 ? true : false}
//                 />

//                 {/* Password */}
//                 <div className="relative">
//                   <DefaultInput
//                     type={showPassword ? "text" : "password"}
//                     label="Password"
//                     placeholder={translate("Enter password")}
//                     registerKey="password"
//                     require={translate("Password is required!")}
//                     className="w-full pr-12"
//                     disable={permissionType === 6 ? true : false}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-9 flex items-center justify-center text-gray-500 hover:text-gray-700"
//                   >
//                     {showPassword ? (
//                       <svg
//                         stroke="currentColor"
//                         fill="currentColor"
//                         strokeWidth="0"
//                         viewBox="0 0 640 512"
//                         className="w-5 h-5"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
//                       </svg>
//                     ) : (
//                       <svg
//                         stroke="currentColor"
//                         fill="currentColor"
//                         strokeWidth="0"
//                         viewBox="0 0 576 512"
//                         className="w-5 h-5"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>

//                 {/* Confirm Password */}
//                 <div className="relative">
//                   <DefaultInput
//                     type={showConfirmPassword ? "text" : "password"}
//                     label="Confirm Password"
//                     placeholder={translate("Confirm password")}
//                     registerKey="ConfirmPassword"
//                     require={translate("Confirm password is required!")}
//                     className="w-full pr-12"
//                     disable={permissionType === 6 ? true : false}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-9 flex items-center justify-center text-gray-500 hover:text-gray-700"
//                   >
//                     {showConfirmPassword ? (
//                       <svg
//                         stroke="currentColor"
//                         fill="currentColor"
//                         strokeWidth="0"
//                         viewBox="0 0 640 512"
//                         className="w-5 h-5"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
//                       </svg>
//                     ) : (
//                       <svg
//                         stroke="currentColor"
//                         fill="currentColor"
//                         strokeWidth="0"
//                         viewBox="0 0 576 512"
//                         className="w-5 h-5"
//                         xmlns="http://www.w3.org/2000/svg"
//                       >
//                         <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 justify-start mt-6">
//                 <Button
//                   type="submit"
//                   disabled={isPosting || permissionType === 6 ? true : false}
//                   className="px-6"
//                 >
//                   {isPosting ? translate("Saving...") : translate("Save")}
//                 </Button>
//                 <Button
//                   type="button"
//                   onClick={() =>
//                     reset({
//                       school_id: "",
//                       userId: "",
//                       loginName: "",
//                       password: "",
//                       permissionTypeId: "",
//                       ConfirmPassword: "",
//                     })
//                   }
//                   variant="secondary"
//                   className="px-6"
//                   disabled={permissionType === 6 ? true : false}
//                 >
//                   {translate("Reset")}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </form>

//         {/* Table */}
//         <div className="w-full font-default">
//           <CustomTable columns={columns} data={paginatedData} />
//         </div>
//       </div>
//     </FormProvider>
//   );
// };

// export default AddLoginUsers;
