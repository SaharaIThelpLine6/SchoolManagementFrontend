import { useDispatch } from "react-redux";
import EditButton from "../components/Button/EditButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SortableTable from "../components/Tables/SortableTable";
import useTranslate from "../utils/Translate";
import { useLocation } from "react-router-dom";
import { useGetStudentsVacationTypeListQuery } from "../features/student/studentQuerySlice";
import { useMemo, useState } from "react";
import Loading from "../components/Loading/Loading";
import DeleteButton from "../components/Button/DeleteButton";
import AccountingFeeCollectionForm from "../view/accounting/AccountingFeeCollectionForm";

const PAGE_SIZE = 10;

const StudentAdmission = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleEditOpenModal = () => {};

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columnsVacationType = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          {/* <button
              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              title="Delete"
              onClick={() => handleDelete(row.ID)}
              disabled={isDeleteLoading}
            >
              <MdDelete className="w-5 h-5" />
            </button> */}

          <EditButton onClick={() => handleEditOpenModal(row.ID)} />
          <DeleteButton onClick={() => handleEditOpenModal(row.ID)} />
        </div>
      ),
    },
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Name"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Father"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Class"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Deposit"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Date"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Sta"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  return (
    <div>
      <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg md:text-xl font-bold">
            {translate("Student Fee Collection")}
          </h3>
        </div>

        <div className="">
          <AccountingFeeCollectionForm />
        </div>

        <SortableTable columns={columnsVacationType} data={paginatedData} />

        {/* Pagination Controls */}

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default StudentAdmission;
