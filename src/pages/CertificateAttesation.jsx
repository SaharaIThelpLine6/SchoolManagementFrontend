import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import { FiEdit } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { MdOutlineDeleteOutline, MdLocalPrintshop } from "react-icons/md";
import CreateCertificateAttestation from "../view/students/certificate-attestation/CreateCertificateAttestation";
import EditCertificateAttestation from "../view/students/certificate-attestation/EditCertificateAttestation";
import {
  useDeleteStudentsTransferCertificateMutation,
  useGetStudentsTransferCertificateQuery,
} from "../features/student/studentQuerySlice";
import Swal from "sweetalert2";
import bnBijoy2Unicode from "../utils/conveter";
import { showModal } from "../utils/ModalControlar";
import PrintOptions from "../view/students/certificate-attestation/PrintOptions";

const PAGE_SIZE = 10;

const CertificateAttestation = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState("table"); // 'table', 'create', or 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [printId, setPrintId] = useState(null);

  const {
    data: certificateData = [],
    isLoading,
    refetch,
  } = useGetStudentsTransferCertificateQuery();
  const [deleteCertificate] = useDeleteStudentsTransferCertificateMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(certificateData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return certificateData.slice(start, start + PAGE_SIZE);
  }, [certificateData, currentPage]);

  const handleOpenCreateModal = useCallback(() => {
    setSelectedId(null);
    setActiveView("create");
  }, []);

  const handleOpenEdit = useCallback((id) => {
    setSelectedId(id);
    setActiveView("edit");
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "আপনি কি নিশ্চিত?",
        text: "এই সার্টিফিকেটটি মুছে ফেলা হবে!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
        cancelButtonText: "না",
      });

      if (result.isConfirmed) {
        try {
          await deleteCertificate(id).unwrap();
          Swal.fire({
            icon: "success",
            title: "মুছে ফেলা হয়েছে",
            text: "সার্টিফিকেটটি সফলভাবে মুছে ফেলা হয়েছে।",
            timer: 1500,
            showConfirmButton: false,
          });
          refetch();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "ব্যর্থ হয়েছে",
            text: "সার্টিফিকেটটি মুছে ফেলা যায়নি।",
          });
        }
      }
    },
    [deleteCertificate, refetch]
  );

  const handlePrint = useCallback(
    (id) => {
    setActiveView("print");
    setPrintId(id)
    },
    [translate]
  );

  const handleBackToList = useCallback(() => {
    setActiveView("table");
    setSelectedId(null);
    refetch();
  }, [refetch]);

  const columns = [
    {
      title: translate("Action"),
      field: "CFID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleOpenEdit(row.CFID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.CFID)}
          >
            <MdOutlineDeleteOutline className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-cyan-500 hover:bg-cyan-600 rounded-md"
            title="Print"
            onClick={() => handlePrint(row.CFID)}
          >
            <MdLocalPrintshop className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Student Code"),
      field: "User.UserCode",
      hozAlign: "center",
      render: (row) => <span>{row.User?.UserCode}</span>,
    },
    {
      title: translate("Student Name"),
      field: "User.UserName",
      hozAlign: "center",
      render: (row) => <span>{bnBijoy2Unicode(row.User?.UserName)}</span>,
    },
    {
      title: translate("Father Name"),
      field: "User.FatherName",
      hozAlign: "center",
      render: (row) => <span>{bnBijoy2Unicode(row.User?.FatherName)}</span>,
    },
    {
      title: translate("To Class"),
      field: "ClassIDTo",
      hozAlign: "center",
    },
    {
      title: translate("Division"),
      field: "DivisionName",
      hozAlign: "center",
    },
  ];

  return (
    <div className="bg-white p-6 md:p-4 rounded-xl  font-SolaimanLipi">
      {activeView === "table" && (
        <>
          <div className="block w-full overflow-x-auto">
            <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
              <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
                {translate("Certificate of Attestation List")}
              </h3>
              <Button
                onClick={handleOpenCreateModal}
                className="font-SolaimanLipi"
              >
                {translate("Create Certificate")}
              </Button>
            </div>

            <SortableTable
              columns={columns}
              data={paginatedData}
              isFilterColumn={false}
              loading={isLoading}
            />

            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
              >
                {translate("Next")}
                <MdKeyboardArrowRight className="text-lg" />
              </button>
            </div>
          </div>
        </>
      )}

      {activeView === "create" && (
        <CreateCertificateAttestation onBack={handleBackToList} />
      )}
      {activeView === "print" && (
        <PrintOptions onBack={handleBackToList} id={printId}/>
      )}

      {activeView === "edit" && selectedId && (
        <EditCertificateAttestation
          id={selectedId}
          onBack={handleBackToList}
          setActiveView={setActiveView}
          activeView={activeView}
        />
      )}
    </div>
  );
};

export default CertificateAttestation;
