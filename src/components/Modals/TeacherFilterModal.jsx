import { useEffect, useRef, useState } from "react";
import DefaultSelect from "../Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import DefaultInput from "../Forms/DefaultInput";
import LoadingComponent from "../LoadingComponent";
import SortableTable from "../Tables/SortableTable";
import { setFilteredUser } from "../../features/student/studentSlice";
import { hideModal } from "../../utils/ModalControlar";
import { useLazyGetTeacherInfoBySearchQuery } from "../../features/userType/userTypeSlice";
import useTranslate from "../../utils/Translate";

/* ---------------- UI Components ---------------- */

const SearchIllustration = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const LockIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      opacity="0.2"
    />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const EmptyState = ({ title, text, tone = "indigo" }) => (
  <div
    className={`mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center ${tone === "rose"
      ? "border-rose-200 bg-rose-50/50 text-rose-500"
      : "border-indigo-200 bg-indigo-50/40 text-indigo-400"
      }`}
  >
    <SearchIllustration />
    <p className="text-[14px] font-bold text-gray-700">{title}</p>
    {text ? <p className="text-[12px] text-gray-500">{text}</p> : null}
  </div>
);

/* ---------------- Constants ---------------- */

const PAGE_LIMIT = 20;

const filterOptions = [
  { ID: 1, Name: "ইউজার কোড" },
  { ID: 2, Name: "ইউজার নাম" },
  { ID: 3, Name: "মোবাইল নাম্বার" },
];

/* ---------------- Main Component ---------------- */

const TeacherFilterModal = ({ onSelect }) => {
  const t = useTranslate();

  const methods = useForm({
    defaultValues: {
      search: "",
      FilterTypeId: "",
    },
  });

  const { watch } = methods;
  const dispatch = useDispatch();

  /* ---------------- Watch Fields ---------------- */

  const search = watch("search");
  const FilterTypeId = watch("FilterTypeId");

  /* ---------------- Debounce ---------------- */

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    FilterTypeId: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search: search || "",
        FilterTypeId: FilterTypeId || "",
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, FilterTypeId]);

  /* ---------------- State ---------------- */

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // পুরনো request এর response ignore করার জন্য
  const requestIdRef = useRef(0);

  const [trigger] = useLazyGetTeacherInfoBySearchQuery();

  /* ---------------- API Call ---------------- */

  const buildParams = (pageNo) => {
    const params = { page: pageNo, limit: PAGE_LIMIT };

    const searchValue = debouncedFilters.search.trim();

    // Search + Filter Type থাকলে All User, না থাকলে default Teacher
    if (searchValue && debouncedFilters.FilterTypeId) {
      params.search = searchValue;
      params.FilterTypeId = debouncedFilters.FilterTypeId;
    }

    return params;
  };

  const fetchUsers = async (pageNo) => {
    const requestId = ++requestIdRef.current;

    if (pageNo === 1) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }
    setLoadError(false);

    try {
      // 2nd argument false = cache ব্যবহার না করে fresh data আনবে
      const res = await trigger(buildParams(pageNo), false).unwrap();

      if (requestId !== requestIdRef.current) return;

      const pageData = Array.isArray(res?.data) ? res.data : [];

      setUsers((prev) => (pageNo === 1 ? pageData : [...prev, ...pageData]));
      setPage(pageNo);
      setHasMore(
        res?.pagination?.hasNextPage ?? pageData.length === PAGE_LIMIT
      );
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Teacher filter error:", err);
      setLoadError(true);
      if (pageNo === 1) setUsers([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    }
  };

  // প্রথমবার + filter বদলালে page 1 থেকে load
  useEffect(() => {
    setHasMore(true);
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  /* ---------------- Load More ---------------- */

  const loadNextPage = () => {
    if (!hasMore || isLoading || isFetchingMore) return;
    fetchUsers(page + 1);
  };

  /* ---------------- Infinite Scroll ---------------- */

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;

    if (scrollHeight - scrollTop <= clientHeight + 120) {
      loadNextPage();
    }
  };

  /* ---------------- Select User ---------------- */

  const handleAddToForm = (userDetails) => {
    // LoginUser আগে থেকে তৈরি থাকলে select হবে না
    if (userDetails?.isLoginCreated) return;

    dispatch(setFilteredUser(userDetails));

    if (typeof onSelect === "function") {
      onSelect(userDetails);
    } else {
      hideModal();
    }
  };

  /* ---------------- Table Columns ---------------- */

  const columns = [
    {
      title: t("Action"),
      hozAlign: "center",
      render: (row) =>
        row?.isLoginCreated ? (
          <span
            title={row?.LoginInfo?.LoginName || ""}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[12px] font-bold text-gray-500 ring-1 ring-inset ring-gray-200 cursor-not-allowed"
          >
            <LockIcon />
            {t("Already Created")}
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handleAddToForm(row)}
            title="এই ইউজারটি নির্বাচন করুন"
            className="group relative inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <CheckIcon />
            {t("Select User")}
          </button>
        ),
    },
    {
      title: t("User Code"),
      field: "UserCode",
      hozAlign: "center",
    },
    {
      title: t("User Type"),
      field: "UserType",
      hozAlign: "center",
      render: (row) => (
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[12px] font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200">
          {row?.UserType?.TypeName || "N/A"}
        </span>
      ),
    },
    {
      title: t("User Name"),
      field: "UserName",
      hozAlign: "left",
      unicode: true,
    },
    {
      title: t("Mobile"),
      field: "Mobile1",
      hozAlign: "center",
    },
  ];

  const hasQuery = Boolean(
    debouncedFilters.search.trim() && debouncedFilters.FilterTypeId
  );

  /* ---------------- Render ---------------- */

  return (
    <div>
      <FormProvider {...methods}>
        {/* Filter Panel */}
        <div className="w-full rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-indigo-800">
              {hasQuery ? t("Search User") : t("All Teachers")}
            </h4>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-700">
              {isLoading || isFetchingMore ? <Spinner /> : null}
              {users.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            {/* Filter Type */}
            <DefaultSelect
              options={filterOptions}
              nameField="Name"
              valueField="ID"
              registerKey="FilterTypeId"
              unicode={true}
            />

            {/* Search Input */}
            <DefaultInput
              label=""
              placeholder="Search"
              registerKey="search"
              type="text"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading && users.length === 0 ? (
          <LoadingComponent />
        ) : loadError && users.length === 0 ? (
          <EmptyState
            title="Unable to load users."
            text="Please try again."
            tone="rose"
          />
        ) : users.length > 0 ? (
          <div
            className="relative mt-4 max-h-[50vh] overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm"
            onScroll={handleScroll}
          >
            <SortableTable columns={columns} data={users} isFilterColumn={false} />

            {isFetchingMore && (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-indigo-600">
                <Spinner />
                Loading more users...
              </div>
            )}

            {!hasMore && (
              <div className="py-3 text-center text-[12px] font-medium text-gray-400">
                End of user list.
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title="No users found"
            text={
              hasQuery
                ? "No matching users found. Try another search."
                : "No teachers available."
            }
            tone="rose"
          />
        )}
      </FormProvider>
    </div>
  );
};

export default TeacherFilterModal;