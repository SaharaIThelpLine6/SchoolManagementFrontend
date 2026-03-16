import { FormProvider, useForm } from "react-hook-form";
import SortableTable from "../../components/Tables/SortableTable";
import useTranslate from "../../utils/Translate";
import { useState } from "react";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import Button from "../../components/Button/Button";
import {
  useGetAllUserPermissionListViewsQuery,
  useUpdatePermissionCheckedAllMutation,
  useUpdatePermissionToggleMutation,
} from "../../features/permission/permissionSlice";
import Loading from "../../components/Loading/Loading";
import { toast } from "react-toastify";

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
  } = useGetAllUserPermissionListViewsQuery({
    page: 1,
    limit: 1000,
    search,
    id,
  });

  const [updatePermissionToggle] = useUpdatePermissionToggleMutation();
  const [updatePermissionCheckedAll] = useUpdatePermissionCheckedAllMutation();

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
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Power Name"),
      field: "PowerName",
      hozAlign: "center",
      render: (row) => <p>{row.PowerName}</p>,
    },
    {
      title: translate("View"),
      field: "PermissionView",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <Button
          onClick={() => handleToggle(row, "View")}
          className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionView === 1
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {row.PermissionView === 1 ? "Active" : "InActive"}
        </Button>
      ),
    },
    {
      title: translate("Insert"),
      field: "PermissionInsert",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <Button
          onClick={() => handleToggle(row, "Insert")}
          className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionInsert === 1
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {row.PermissionInsert === 1 ? "Active" : "InActive"}
        </Button>
      ),
    },
    {
      title: translate("Edit"),
      field: "PermissionEdit",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <Button
          onClick={() => handleToggle(row, "Edit")}
          className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionEdit === 1
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {row.PermissionEdit === 1 ? "Active" : "InActive"}
        </Button>
      ),
    },
    {
      title: translate("Delete"),
      field: "PermissionDelete",
      hozAlign: "center",
      hasCheckbox: true,
      render: (row) => (
        <Button
          onClick={() => handleToggle(row, "Delete")}
          className={`px-2 w-[90px] py-1 rounded text-white ${row.PermissionDelete === 1
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
            }`}
        >
          {row.PermissionDelete === 1 ? "Active" : "InActive"}
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <p>Error loading permissions</p>;

  return (
    <FormProvider {...methods}>
      <div className="bg-white flex flex-col gap-6 font-SolaimanLipi">
        {/* 🔍 Search Box */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-1/3"
          />
        </div>

        <div className="w-full font-SolaimanLipi">
          <SortableTable
            columns={columns}
            data={permissionLists?.data || []}
            isFilterColumn={false}
            onRowClick={handleRowClick}
            close={setSelectedRow}
            checkboxes={checkboxes}
            onCheckboxChange={handleCheckboxChange}
          />

          {selectedRow && (
            <div className="mt-4">
              <ToggleBox />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default AddLoginUsersModal;
