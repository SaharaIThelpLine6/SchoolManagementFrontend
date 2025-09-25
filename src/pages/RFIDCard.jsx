import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import { useDeleteStudentsVacationTypeMutation } from "../features/student/studentQuerySlice";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";

const PAGE_SIZE = 10;

const RFIDCard = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm();
  const translate = useTranslate();

  // Sample data based on the provided image
  const studentVacationTypeData = [
    {
      ID: 10001,
      VacationList: 1,
      CardName: "Sakib Al Hasan",
      Name: "Sakib",
      Father: "Al Hasan",
      ClassJamaat: "Class 10",
    },
    {
      ID: 10002,
      VacationList: 2,
      CardName: "Mushfiqur Rahim",
      Name: "Mushfiq",
      Father: "Rahim",
      ClassJamaat: "Class 9",
    },
    {
      ID: 10003,
      VacationList: 3,
      CardName: "Tamim Iqbal",
      Name: "Tamim",
      Father: "Iqbal",
      ClassJamaat: "Class 11",
    },
    {
      ID: 10004,
      VacationList: 4,
      CardName: "Shakib Al Hasan",
      Name: "Shakib",
      Father: "Al Hasan",
      ClassJamaat: "Class 12",
    },
    {
      ID: 10005,
      VacationList: 5,
      CardName: "Nasir Hossain",
      Name: "Nasir",
      Father: "Hossain",
      ClassJamaat: "Class 8",
    },
    {
      ID: 10006,
      VacationList: 6,
      CardName: "Mahmudullah Riyad",
      Name: "Mahmudullah",
      Father: "Riyad",
      ClassJamaat: "Class 10",
    },
    {
      ID: 10007,
      VacationList: 7,
      CardName: "Mustafizur Rahman",
      Name: "Mustafiz",
      Father: "Rahman",
      ClassJamaat: "Class 9",
    },
    {
      ID: 10008,
      VacationList: 8,
      CardName: "Litton Das",
      Name: "Litton",
      Father: "Das",
      ClassJamaat: "Class 11",
    },
    {
      ID: 10009,
      VacationList: 9,
      CardName: "Taskin Ahmed",
      Name: "Taskin",
      Father: "Ahmed",
      ClassJamaat: "Class 12",
    },
    {
      ID: 10010,
      VacationList: 10,
      CardName: "Afif Hossain",
      Name: "Afif",
      Father: "Hossain",
      ClassJamaat: "Class 8",
    },
  ];

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Added for consistency
  const [isSVTError, setIsSVTError] = useState(false); // Added for consistency

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate("Type of holiday create"), "ADD_TYPEOFVACATION");
  }, [translate]);

  const [deleteVacationType] = useDeleteStudentsVacationTypeMutation(); // Added mutation hook

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the vacation type.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteVacationType(id).unwrap();
            Swal.fire(
              "Deleted!",
              "The vacation type has been removed.",
              "success"
            );
          } catch (error) {
            Swal.fire("Error!", "Failed to delete the vacation type.", "error");
          }
        }
      });
    },
    [deleteVacationType]
  );

  if (isLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columnsVacationType = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleDelete(row.ID)}
            className="bg-red-100 text-red-600 w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-200 transition-colors"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ),
    },
    {
      title: translate("Code"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Serial"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate("Card Name"),
      field: "CardName",
      hozAlign: "center",
      render: (row) => <p>{row.CardName}</p>,
    },
    {
      title: translate("Name"),
      field: "Name",
      hozAlign: "center",
      render: (row) => <p>{row.Name}</p>,
    },
    {
      title: translate("Father"),
      field: "Father",
      hozAlign: "center",
      render: (row) => <p>{row.Father}</p>,
    },
    {
      title: translate("Class/Jamaat"),
      field: "ClassJamaat",
      hozAlign: "center",
      render: (row) => <p>{row.ClassJamaat}</p>,
    },
  ];

  const sessionData = [];

  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate("RFID Card")}
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-3 my-5">
            <DefaultSelect
              label="Session"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />{" "}
            <DefaultSelect
              label="Class/Jamaat"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />{" "}
            <DefaultSelect
              label="Search Id"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
          </div>
          <SortableTable
            columns={columnsVacationType}
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
    </FormProvider>
  );
};

export default RFIDCard;
