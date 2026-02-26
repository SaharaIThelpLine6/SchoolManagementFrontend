import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteStudentsTransferCertificateMutation,
  useGetStudentsTransferCertificateQuery,
} from '../features/student/studentQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import CreateCertificateAttestation from '../view/students/certificate-attestation/CreateCertificateAttestation';
import EditCertificateAttestation from '../view/students/certificate-attestation/EditCertificateAttestation';
import PrintOptions from '../view/students/certificate-attestation/PrintOptions';

const PAGE_SIZE = 10;

const CertificateAttesation = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState('table'); // 'table', 'create', or 'edit'
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
    setActiveView('create');
  }, []);

  const handleOpenEdit = useCallback((id) => {
    setSelectedId(id);
    setActiveView('edit');
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: 'আপনি কি নিশ্চিত?',
        text: 'এই সার্টিফিকেটটি মুছে ফেলা হবে!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
        cancelButtonText: 'না',
      });

      if (result.isConfirmed) {
        try {
          await deleteCertificate(id).unwrap();
          Swal.fire({
            icon: 'success',
            title: 'মুছে ফেলা হয়েছে',
            text: 'সার্টিফিকেটটি সফলভাবে মুছে ফেলা হয়েছে।',
            timer: 1500,
            showConfirmButton: false,
          });
          refetch();
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'ব্যর্থ হয়েছে',
            text: 'সার্টিফিকেটটি মুছে ফেলা যায়নি।',
          });
        }
      }
    },
    [deleteCertificate, refetch]
  );

  const handlePrint = useCallback(
    (id) => {
      setActiveView('print');
      setPrintId(id);
    },
    [translate]
  );

  const handleBackToList = useCallback(() => {
    setActiveView('table');
    setSelectedId(null);
    refetch();
  }, [refetch]);

  const columns = [
    {
      title: translate('Action'),
      field: 'CFID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.certificate}
            permissionType="edit"
            empty={true}
          >
            <button
              className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              title="Edit"
              onClick={() => handleOpenEdit(row.CFID)}
            >
              <SvgIcon name={'FiEdit'} size={20} />
            </button>
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.certificate}
            permissionType="delete"
            empty={true}
          >
            <button
              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              title="Delete"
              onClick={() => handleDelete(row.CFID)}
            >
              <SvgIcon name={'FaTrash'} size={20} />
            </button>
          </ViewPermission>
          <button
            className="p-2 text-white bg-cyan-500 hover:bg-cyan-600 rounded-md"
            title="Print"
            onClick={() => handlePrint(row.CFID)}
          >
            <SvgIcon name={'MdLocalPrintshop'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate('Student Code'),
      field: 'User.UserCode',
      hozAlign: 'center',
      render: (row) => <span>{row.User?.UserCode}</span>,
    },
    {
      title: translate('Student Name'),
      field: 'User.UserName',
      hozAlign: 'center',
      render: (row) => <span>{bnBijoy2Unicode(row.User?.UserName)}</span>,
    },
    {
      title: translate('Father Name'),
      field: 'User.FatherName',
      hozAlign: 'center',
      render: (row) => <span>{bnBijoy2Unicode(row.User?.FatherName)}</span>,
    },
    {
      title: translate('Total Mark'),
      field: 'TotalMark',
      hozAlign: 'center',
      render: (row) => <span>{row.TotalMark}</span>,
    },
    {
      title: translate('Division'),
      field: 'DivisionName',
      hozAlign: 'center',
      render: (row) => <span>{row.DivisionName}</span>,
    },
  ];

  return (
    <div className="bg-white p-6 md:p-4 rounded-xl  font-SolaimanLipi">
      {activeView === 'table' && (
        <>
          <div className="block w-full overflow-x-auto">
            <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
              <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
                {translate('Certificate of Attestation List')}
              </h3>
              <ViewPermission
                permissionId={permissionsDataList.certificate}
                permissionType="insert"
              >
                <Button
                  onClick={handleOpenCreateModal}
                  className="font-SolaimanLipi"
                >
                  {translate('Create Certificate')}
                </Button>
              </ViewPermission>
            </div>

            {isLoading ? (
              <Loading />
            ) : (
              <>
                <SortableTable
                  columns={columns}
                  data={paginatedData}
                  isFilterColumn={false}
                />

                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </>
      )}

      {activeView === 'create' && (
        <CreateCertificateAttestation onBack={handleBackToList} />
      )}
      {activeView === 'print' && (
        <PrintOptions onBack={handleBackToList} id={printId} />
      )}

      {activeView === 'edit' && selectedId && (
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

export default CertificateAttesation;
