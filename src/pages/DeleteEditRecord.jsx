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
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";

const PAGE_SIZE = 10;

const DeleteEditRecord = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

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

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columns = [
    {
      title: translate("শি:আইডি"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("রসিদ"),
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
      title: translate("Fee Name"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Prescribed Fee"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Deduction"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Pre-deposit"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Collection"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Due"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Recipient"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Delete Edit Data and Time"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Type"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Comment"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  const sessionData = [];
  const examNameData = [];

  return (
    <div>
      <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg md:text-xl font-bold">
            {translate("Delete Edit Record")}
          </h3>
        </div>

        <div className="mb-5">
          <FormProvider {...methods}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DefaultSelect
                options={sessionData ?? []}
                registerKey="SessionID"
                placeholder="বছর নির্বাচন করুন"
                nameField="SessionName"
                valueField={"SessionID"}
                label="Account Type"
                unicode={true}
              />
              <DefaultSelect
                options={examNameData ?? []}
                registerKey="ExamID"
                placeholder="পরীক্ষা নির্বাচন করুন"
                nameField="ExamName"
                valueField={"ExamID"}
                unicode={true}
                label="Data Type"
              />
              <DatePickerOne
                dateCalender={"From"}
                placeholder={"date"}
                registerKey={"DateOfBirth"}
                require={"Date Of Birth Require"}
              />
              <DatePickerOne
                dateCalender={"To"}
                placeholder={"date"}
                registerKey={"DateOfBirth"}
                require={"Date Of Birth Require"}
              />
            </div>
          </FormProvider>
        </div>

        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />

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

export default DeleteEditRecord;
