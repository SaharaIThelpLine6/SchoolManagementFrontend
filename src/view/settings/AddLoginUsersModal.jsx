import { FormProvider, useForm } from "react-hook-form";
import SortableTable from "../../components/Tables/SortableTable";
import DefaultPagination from "../../components/Pagination/DefaultPagination";
import useTranslate from "../../utils/Translate";
import { useCallback, useMemo, useState } from "react";
import { showModal } from "../../utils/ModalControlar";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import Button from "../../components/Button/Button";

const PAGE_SIZE = 5;

const data = [
  {
    Serial: 1,
    PowerName: "শিক্ষার্থীর নাম এডিট",
    View: 1,
    Insert: 0,
    Edit: 1,
    Delete: 1,
  },
  {
    Serial: 2,
    PowerName: "Login Name এডিট",
    View: 1,
    Insert: 0,
    Edit: 1,
    Delete: 0,
  },
  {
    Serial: 3,
    PowerName: "User Type চেক",
    View: 1,
    Insert: 1,
    Edit: 0,
    Delete: 0,
  },
  {
    Serial: 4,
    PowerName: "Login Type চেক",
    View: 1,
    Insert: 1,
    Edit: 1,
    Delete: 1,
  },
  {
    Serial: 5,
    PowerName: "Code এডিট",
    View: 1,
    Insert: 0,
    Edit: 1,
    Delete: 1,
  },
  {
    Serial: 6,
    PowerName: "Name চেক",
    View: 1,
    Insert: 0,
    Edit: 1,
    Delete: 0,
  },
  {
    Serial: 7,
    PowerName: "Type চেক",
    View: 1,
    Insert: 1,
    Edit: 1,
    Delete: 1,
  },
  {
    Serial: 8,
    PowerName: "LoginType এডিট",
    View: 1,
    Insert: 0,
    Edit: 0,
    Delete: 1,
  },
  {
    Serial: 9,
    PowerName: "Special Permission",
    View: 1,
    Insert: 1,
    Edit: 1,
    Delete: 1,
  },
  {
    Serial: 10,
    PowerName: "General Access",
    View: 1,
    Insert: 0,
    Edit: 1,
    Delete: 1,
  },
];

const AddLoginUsersModal = () => {
  const methods = useForm();
  const translate = useTranslate();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null); // ✅ selected row রাখার জন্য state

  const totalPages = Math.ceil(data.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal("Filter Student", "STUDENT_FILTER");
  }, []);

  const handleRowClick = (row) => {
    // row এ ক্লিক করলে টগল হবে
    if (selectedRow?.ID === row.ID) {
      setSelectedRow(null);
    } else {
      setSelectedRow(row);
    }
  };

const columns = [
  {
    title: translate("Serial"),
    field: "Serial",
    hozAlign: "center",
    render: (row) => <p>{row.Serial}</p>,
  },
  {
    title: translate("Power Name"),
    field: "PowerName",
    hozAlign: "center",
    render: (row) => <p>{row.PowerName}</p>,
  },
  {
    title: translate("View"),
    field: "View",
    hozAlign: "center",
    render: (row) => (
      <Button
        className={`px-2 w-[90px] py-1 rounded text-white ${
          row.View === 1 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {row.View === 1 ? "Active" : "UnActive"}
      </Button>
    ),
  },
  {
    title: translate("Insert"),
    field: "Insert",
    hozAlign: "center",
    render: (row) => (
     <Button
        className={`px-2 w-[90px] py-1 rounded text-white ${
          row.Insert === 1 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {row.Insert === 1 ? "Active" : "UnActive"}
      </Button>
    ),
  },
  {
    title: translate("Edit"),
    field: "Edit",
    hozAlign: "center",
    render: (row) => (
       <Button
        className={`px-2 w-[90px] py-1 rounded text-white ${
          row.Edit === 1 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {row.Edit === 1 ? "Active" : "UnActive"}
      </Button>
    ),
  },
  {
    title: translate("Delete"),
    field: "Delete",
    hozAlign: "center",
    render: (row) => (
      <Button
        className={`px-2 w-[90px] py-1 rounded text-white ${
          row.Delete === 1 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {row.Delete === 1 ? "Active" : "UnActive"}
      </Button>
    ),
  },
];

  return (
    <FormProvider {...methods}>
      <div className="bg-white flex flex-col gap-6 font-SolaimanLipi">
        {/*Table Start*/}
        <div className="w-full font-SolaimanLipi">
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />

          {/* Row select হলে নিচে ToggleBox show হবে */}
          {selectedRow && (
            <div className="mt-4">
              <ToggleBox />
            </div>
          )}

          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
        {/*Table End*/}
      </div>
    </FormProvider>
  );
};

export default AddLoginUsersModal;
