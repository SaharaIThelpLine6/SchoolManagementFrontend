import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import { FiEdit } from "react-icons/fi";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Button from "../components/Button/Button";
import {
  useGetStudentsVacationTypeListQuery,
  useDeleteStudentsVacationTypeMutation,
} from "../features/student/studentQuerySlice";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";

const PAGE_SIZE = 10;

const OnlineAdmissionTable = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const [
    deleteVacationType,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteStudentsVacationTypeMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate("Type of holiday create"), "ADD_TYPEOFVACATION");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Type of holiday update"), "EDIT_TYPEOFVACATION", id);
    },
    [translate]
  );

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

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columnsVacationType = [
    {
      title: translate("Sequential"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Application No"),
      field: "Name",
      hozAlign: "center",
      render: (row) => <p>{row.Name}</p>,
    },

    {
      title: translate("Father Name"),
      field: "FatherName",
      hozAlign: "center",
      render: (row) => <p>{row.FatherName}</p>,
    },
    {
      title: translate("Gender"),
      field: "MotherName",
      hozAlign: "center",
      render: (row) => <p>{row.MotherName}</p>,
    },

    {
      title: translate("Living Condition"),
      field: "Address",
      hozAlign: "center",
      render: (row) => <p>{row.Address}</p>,
    },

    {
      title: translate("Class"),
      field: "Class",
      hozAlign: "center",
      render: (row) => <p>{row.Class}</p>,
    },
    {
      title: translate("Mobile Number"),
      field: "MobileNumber",
      hozAlign: "center",
      render: (row) => <p>{row.MobileNumber}</p>,
    },
    {
      title: translate("Village"),
      field: "MobileNumber",
      hozAlign: "center",
      render: (row) => <p>{row.MobileNumber}</p>,
    },
    {
      title: translate("Post Office"),
      field: "MobileNumber",
      hozAlign: "center",
      render: (row) => <p>{row.MobileNumber}</p>,
    },
    {
      title: translate("Police Station"),
      field: "MobileNumber",
      hozAlign: "center",
      render: (row) => <p>{row.MobileNumber}</p>,
    },
    {
      title: translate("District"),
      field: "MobileNumber",
      hozAlign: "center",
      render: (row) => <p>{row.MobileNumber}</p>,
    },
    {
      title: translate("ভর্তির ধরণ"),
      field: "AdmissionType",
      hozAlign: "center",
      render: (row) => <p>{row.AdmissionType}</p>,
    },
  ];

  const subClassData = [];
  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate("Online Admission List")}
            </h3>
            <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto py-3">
              {" "}
              <DefaultSelect
                options={subClassData || []}
                require={"Sub Class is required"}
                nameField={"SubClass"}
                valueField={"SubClassID"}
                registerKey={"SubClassID"}
                type={"number"}
                label={translate("")}
                unicode={true}
              />
              <DefaultInput
                label=""
                type="text"
                registerKey="motherName"
                defaultValue="জবিনা"
              />
            </div>
          </div>

          <SortableTable
            columns={columnsVacationType}
            data={paginatedData}
            isFilterColumn={false}
          />

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              <MdKeyboardArrowLeft className="text-lg" />
              Prev
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
            >
              Next
              <MdKeyboardArrowRight className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionTable;
