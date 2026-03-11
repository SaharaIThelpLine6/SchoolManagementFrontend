import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import Loading from "../components/Loading/Loading";
import SortableTable from "../components/Tables/SortableTable";
import Button from "../components/Button/Button";
import DeleteButton from "../components/Button/DeleteButton";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import { setPageName } from "../features/auth/authSlice";

import {
  useGetUserNoticesQuery,
  useDeleteUserNoticeMutation,
  useDeleteUserNoticesMutation,
} from "../features/settings/settingsQuerySlice";
import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import SvgIcon from "../components/icons/SvgIcon";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";

const PAGE_SIZE = 10;

const UserNotice = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const method = useForm({
    defaultValues: {
      UserTypeID: "",
      UserCode: "",
      UserName: "",
      SessionID: "",
      SubClassID: "",
    },
  });

  const { control, reset } = method;

  const UserTypeID = useWatch({ control, name: "UserTypeID" });
  const UserCode = useWatch({ control, name: "UserCode" });
  const UserName = useWatch({ control, name: "UserName" });
  const SessionID = useWatch({ control, name: "SessionID" });
  const SubClassID = useWatch({ control, name: "SubClassID" });
  const id = useWatch({ control, name: "id" });


  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [filters, setFilters] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    UserTypeID: "",
    UserCode: "",
    UserName: "",
    SessionID: "",
    SubClassID: "",
  });

  const queryParams = {
    page: currentPage,
    limit: PAGE_SIZE,
    ...(filters.UserTypeID && { UserTypeID: filters.UserTypeID }),
    ...(filters.UserCode && { UserCode: filters.UserCode }),
    ...(filters.UserName && { UserName: filters.UserName }),
    ...(filters.SessionID && { SessionID: filters.SessionID }),
    ...(filters.SubClassID && { SubClassID: filters.SubClassID }),
  };
  const { data, isError, isLoading, refetch } = useGetUserNoticesQuery(queryParams, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: userType = [] } = useGetUserTypesQuery();
  const [deleteUserNotice] = useDeleteUserNoticeMutation();
  const [deleteUserNotices] = useDeleteUserNoticesMutation();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    reset({
      SessionID: activeSession?.SessionID || "",
    });
  }, [activeSession, reset]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        page: 1,
        limit: PAGE_SIZE,
        UserTypeID: UserTypeID || "",
        UserCode: UserCode || "",
        UserName: UserName || "",
        SessionID: SessionID || "",
        SubClassID: SubClassID || "",
      });
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [UserTypeID, UserCode, UserName, SessionID, SubClassID]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: currentPage,
      limit: PAGE_SIZE,
    }));
  }, [currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate("User notice create"), "USER_NOTICE_CREATE");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("User notice update"), "USER_NOTICE_UPDATE", id);
    },
    [translate]
  );

  const handleDeletes = useCallback(
    async () => {
      if (selectedRows.length === 0) {
        Swal.fire("Info", "No notices selected for deletion.", "info");
        return;
      }

      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the selected notices.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // Extract UNIDs from selectedRows
            const ids = selectedRows.map(row => row.UNID);
            console.log(ids, "ids"); // ✅ Should print [49, 48, 47, ...]

            await deleteUserNotices(ids).unwrap(); // Call RTK mutation
            refetch(); // Refresh table
            setSelectedRows([]); // Clear selection

            Swal.fire("Deleted!", "Selected notices have been removed.", "success");
          } catch (error) {
            console.error(error);
            Swal.fire("Error!", "Failed to delete selected notices.", "error");
          }
        }
      });
    },
    [deleteUserNotices, refetch, selectedRows] // ✅ include selectedRows
  );


  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the user notice.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUserNotice(id).unwrap();
            refetch();
            Swal.fire("Deleted!", "The user notice has been removed.", "success");
          } catch (error) {
            Swal.fire("Error!", "Failed to delete the user notice.", "error");
          }
        }
      });
    },
    [deleteUserNotice, refetch]
  );

  const handleResetFilters = () => {
    reset({
      UserTypeID: "",
      UserCode: "",
      UserName: "",
      SessionID: "",
    });
    setCurrentPage(1);
  };

  const handleSelectRow = (row, checked) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, row]);
    } else {
      setSelectedRows((prev) => prev.filter((r) => r.UNID !== row.UNID));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) setSelectedRows(data?.data || []);
    else setSelectedRows([]);
  };

  if (isLoading) return <Loading />;
  if (isError) return <p className="text-red-500">Failed to load user notices data</p>;

  const notices = data?.data || [];
  const totalRecords = data?.totalRecords || 0;
  const totalPages = data?.totalPages || 1;

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={selectedRows.length === notices.length && notices.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      field: "checkbox",
      hozAlign: "center",
      width: 50,
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedRows.some((r) => r.UNID === row.UNID)}
          onChange={(e) => handleSelectRow(row, e.target.checked)}
        />
      ),
    },
    {
      title: translate("নাম্বার"),
      field: "sl",
      hozAlign: "center",
      width: 80,
      render: (row, index) => <p>{(currentPage - 1) * PAGE_SIZE + index + 1}</p>,
    },
    {
      title: translate("User Type"),
      field: "UserType",
      hozAlign: "center",
      width: 150,
      render: (row) => <p>{row.UserType?.TypeName || "-"}</p>,
    },
    {
      title: translate("User Code"),
      field: "UserCode",
      hozAlign: "center",
      width: 120,
      render: (row) => <p>{row.User?.UserCode || "-"}</p>,
    },
    {
      title: translate("User Name"),
      field: "UserName",
      hozAlign: "left",
      width: 180,
      render: (row) => <div className="flex justify-center items-center">
        <p>{row.User?.UserName || "-"}</p>,
      </div>
    },
    {
      title: translate("Notice"),
      field: "NoticeMessage",
      hozAlign: "center",
      width: 300,
      render: (row) => (
        <div className="flex justify-center items-center max-w-xs truncate" title={row.NoticeMessage}>
          {row.NoticeMessage || "-"}
        </div>
      ),
    },
    {
      title: translate("Action"),
      field: "UNID",
      hozAlign: "center",
      width: 120,
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.UNID)} />
          <DeleteButton onClick={() => handleDelete(row.UNID)} />
        </div>
      ),
    },
  ];

  const selectData = [
    { id: 1, name: translate("User Name") },
    { id: 2, name: translate("User Code") }
  ]


  return (
    <FormProvider {...method}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        {/* Header & Filters */}
        <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6 gap-4">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">{translate("User Notice")}</h3>
          <Button onClick={handleOpenModal}>{translate("Create New")}</Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">{translate("Filter Options")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <DefaultSelect
              label={translate("User Type")}
              options={userType}
              valueField="ID"
              nameField="TypeName"
              registerKey="UserTypeID"
              placeholder={translate("Select User Type")}
            />
            <DefaultSelect
              label={"Session"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            {
              Number(UserTypeID) === 1 &&
              <DefaultSelect
                label={"Sub Class"}
                options={subClassData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
              />
            }
            <DefaultSelect
              label={"Select Type"}
              options={selectData ?? []}
              valueField="id"
              nameField="name"
              registerKey="id"
            />
            {
              Number(id) === 1 &&
              <DefaultInput
                label={translate("User Name")}
                registerKey="UserName"
                placeholder={translate("Search by user name...")}
              />
            }
            {
              Number(id) === 2 &&
              <DefaultInput
                label={translate("User Code")}
                registerKey="UserCode"
                type="number"
                placeholder={translate("Search by user code...")}
              />
            }

            <div className="flex items-end">
              <Button variant="secondary" onClick={handleResetFilters} className="w-full">
                {translate("Reset Filters")}
              </Button>
            </div>
          </div>
        </div>

        {/* Table & Pagination */}
        <div className="block w-full overflow-x-auto">

          <div className="flex gap-3 items-center justify-start mb-3">
            <div className="text-sm text-gray-600">
              {translate("Total Records")}: {totalRecords}
            </div>
            {
              selectedRows.length > 0 &&
              <DeleteButton onClick={handleDeletes} />
            }
          </div>

          <SortableTable columns={columns} data={notices} isFilterColumn={false} />

          {totalPages > 1 && (
            <div className="mt-6">
              <DefaultPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {/* Debug Selected Rows */}
          {/* <div className="mt-4">
            <strong>Selected Rows:</strong>
            <pre>{JSON.stringify(selectedRows, null, 2)}</pre>
          </div> */}
        </div>
      </div>
    </FormProvider>
  );
};

export default UserNotice;
