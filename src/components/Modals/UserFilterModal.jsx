import { useEffect, useState } from "react";
import DefaultSelect from "../Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import DefaultInput from "../Forms/DefaultInput";
import LoadingComponent from "../LoadingComponent";
import SortableTable from "../Tables/SortableTable";
import { setFilteredUser } from "../../features/student/studentSlice";
import { hideModal } from "../../utils/ModalControlar";
import { useLazyGetUserInfoBySearchQuery } from "../../features/userType/userTypeSlice";

const UserFilterModal = () => {
  const methods = useForm();

  const { watch } = methods;

  const dispatch = useDispatch();

  /*
    New Filter Options
  */

  const filterOptions = [
    {
      ID: 1,
      Name: "ইউজার কোড",
    },
    {
      ID: 2,
      Name: "ইউজার নাম",
    },
    {
      ID: 3,
      Name: "মোবাইল নাম্বার",
    },
  ];

  /*
    Watch Fields
  */

  const search = watch("search");
  const FilterTypeId = watch("FilterTypeId");

  /*
    Debounce
  */

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    FilterTypeId: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search,
        FilterTypeId,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, FilterTypeId]);

  /*
    API Call
  */

  const PAGE_LIMIT = 20;

  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [trigger, { data: searchUserInfo, error: searchUserError, isFetching: userInfoLoading }] =
    useLazyGetUserInfoBySearchQuery();

  useEffect(() => {
    if (!debouncedFilters.search || !debouncedFilters.FilterTypeId) {
      setUsers([]);
      setPage(1);
      setHasMore(true);
      setIsFetchingMore(false);
      return;
    }

    setUsers([]);
    setPage(1);
    setHasMore(true);
    setIsFetchingMore(false);
    trigger({ ...debouncedFilters, page: 1, limit: PAGE_LIMIT });
  }, [debouncedFilters, trigger]);

  useEffect(() => {
    if (!searchUserInfo) return;

    const pageData = Array.isArray(searchUserInfo.data) ? searchUserInfo.data : [];
    if (page === 1) {
      setUsers(pageData);
    } else {
      setUsers((prev) => [...prev, ...pageData]);
    }

    setHasMore(pageData.length === PAGE_LIMIT);
    setIsFetchingMore(false);
  }, [searchUserInfo, page]);

  const loadNextPage = () => {
    if (!hasMore || userInfoLoading || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setIsFetchingMore(true);
    trigger({ ...debouncedFilters, page: nextPage, limit: PAGE_LIMIT });
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollHeight - scrollTop <= clientHeight + 120) {
      loadNextPage();
    }
  };


  /*
    Add User
  */

  const handleAddToForm = (userDetails) => {
    dispatch(setFilteredUser(userDetails));
    hideModal();
  };


  const columns = [
    {
      title: "Action",
      render: (row) => {
        return (
          <button
            onClick={() => {
              handleAddToForm(row);
            }}
            className="text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-adjustments-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M6 4v4" />
              <path d="M6 12v8" />
              <path d="M13.958 15.592a2 2 0 1 0 -1.958 2.408" />
              <path d="M12 4v10" />
              <path d="M12 18v2" />
              <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M18 4v1" />
              <path d="M18 9v3" />
              <path d="M16 19h6" />
              <path d="M19 16v6" />
            </svg>
          </button>
        );
      },
    },

    {
      title: "User Code",
      field: "UserCode",
      hozAlign: "center",
    },
    {
      title: "User Type",
      field: "UserCode",
      hozAlign: "center",
      render: (row) => {
        return <>{row?.UserType?.TypeName}</>
      },
    },

    {
      title: "User Name",
      field: "UserName",
      hozAlign: "left",
      unicode: true,
    },
    {
      title: "Mobile",
      field: "Mobile1",
      hozAlign: "center",
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <div
          className="w-full"
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            margin: "0 auto",
          }}
        >
          <div className="flex flex-col md:flex-row gap-2">

            {/* Filter Type */}

            <DefaultSelect
              options={filterOptions}
              nameField={"Name"}
              valueField={"ID"}
              registerKey={"FilterTypeId"}
              unicode={true}
            />

            {/* Search Input */}

            <DefaultInput
              label={""}
              placeholder={"Search"}
              registerKey={"search"}
              type={"text"}
            />
          </div>
        </div>

        {(!debouncedFilters.search || !debouncedFilters.FilterTypeId) ? (
          <li className="text-black mt-4">Please choose a filter type and enter search text.</li>
        ) : userInfoLoading && page === 1 ? (
          <LoadingComponent />
        ) : searchUserError ? (
          <li className="text-black mt-4">No users found.</li>
        ) : users.length > 0 ? (
          <div
            className="relative overflow-auto mt-4 max-h-[50vh]"
            onScroll={handleScroll}
          >
            <SortableTable columns={columns} data={users} />
            {(userInfoLoading || isFetchingMore) && (
              <div className="py-3 text-center text-sm text-gray-600">
                Loading more users...
              </div>
            )}
            {!hasMore && users.length > 0 && (
              <div className="py-3 text-center text-sm text-gray-600">
                End of user list.
              </div>
            )}
          </div>
        ) : (
          <li className="py-2 px-4">No users found</li>
        )}
      </FormProvider>
    </div>
  );
};

export default UserFilterModal;