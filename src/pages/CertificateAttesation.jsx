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
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Button from "../components/Button/Button";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { MdLocalPrintshop } from "react-icons/md";



const PAGE_SIZE = 10;

const CertificateAttesation = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const groupChangeData = [
    {
      ID: 1,
      StudentID: "S001",
      StudentName: "আহমেদ রহমান",
      PreviousGroup: "A",
      NewGroup: "B",
      Date: "2023-05-15",
    },
    {
      ID: 2,
      StudentID: "S002",
      StudentName: "ফাতেমা আক্তার",
      PreviousGroup: "B",
      NewGroup: "A",
      Date: "2023-06-20",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const currentData = groupChangeData;
  const totalPages = Math.ceil(currentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };


  const handleOpenModal = useCallback(() => {
    showModal(translate("Create Certificate of Attestation"), "ADD_CERTIFICATE_ATTESTATION",);
  }, []);

 const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("Update Certificate of Attestation"), "UPDATE_CERTIFICATE_ATTESTATION", id);
    },
    [translate]
  );

  const columnsDistribution = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <MdOutlineDeleteOutline className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-cyan-500 hover:bg-cyan-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <MdLocalPrintshop   className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("ID"),
      field: "StudentID",
      hozAlign: "center",
    },
    {
      title: translate("Code"),
      field: "StudentID",
      hozAlign: "center",
    },
    {
      title: translate("Name"),
      field: "CurrentGroup",
      hozAlign: "center",
    },
    {
      title: translate("Father Name"),
      field: "NewGroup",
      hozAlign: "center",
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate("Certificate of Attestation List")}
          </h3>
          <Button onClick={() => handleOpenModal()} className="font-SolaimanLipi">
            {translate("Create Certificate")}
          </Button>
        </div>

        <SortableTable
          columns={columnsDistribution}
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
            {translate("Prev")}
          </button>

          <span className="text-sm font-medium text-gray-700">
            {translate("Page")} {currentPage} {translate("of")} {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            {translate("Next")}
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};



export default CertificateAttesation