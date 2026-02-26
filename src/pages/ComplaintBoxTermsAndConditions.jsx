import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import useTranslate from '../utils/Translate';

import { useCallback } from 'react';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';

import {
  useDeleteMaddrasahReportMutation,
  useGetMaddasahReportListQuery,
} from '../features/talimat/talimatQuerySlice';
import { showModal } from '../utils/ModalControlar';

const PAGE_SIZE = 10;

const ComplaintBoxTermsAndConditions = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetMaddasahReportListQuery();

  // ✅ Safely extract the array from API response
  const studentData = responseData?.data || [];

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteReport, { isLoading: isDeleting }] =
    useDeleteMaddrasahReportMutation();
  // ✅ Pagination
  const totalPages = Math.ceil(studentData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentData.slice(start, start + PAGE_SIZE);
  }, [studentData, currentPage]);

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteReport(id).unwrap();
            Swal.fire(
              'Deleted!',
              'The vacation type has been removed.',
              'success'
            );
          } catch (error) {
            Swal.fire('Error!', 'Failed to delete.', 'error');
          }
        }
      });
    },
    [deleteReport]
  );

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate('Complaint Box Terms and Conditions'),
        'COMPLAINT_BOX_TERMS_AND_CONDITIONS_UPDATE',
        id
      );
    },
    [translate]
  );
  const handleCreateOpenForm = useCallback(
    (id) => {
      showModal(
        translate('Complaint Box Terms and Conditions'),
        'COMPLAINT_BOX_TERMS_AND_CONDITIONS_CREATE'
      );
    },
    [translate]
  );

  // ✅ Table columns
  const columns = [
    {
      title: translate('ID'),
      field: 'SCNID',
      hozAlign: 'center',
      render: (row) => <p>{row.SCNID}</p>,
    },
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <DeleteButton onClick={() => handleDelete(row.SCNID)} />
          <EditButton onClick={() => handleEditOpenModal(row.SCNID)} />
        </div>
      ),
    },
    {
      title: translate('Details'),
      field: 'Details',
      render: (row) => <p>{row.Details}</p>,
      hozAlign: 'center',
    },
  ];

  // ✅ Loading / Error / Empty states
  if (isLoading) return <Loading />;
  // if (isError)
  //   return (
  //     <p className="text-red-500 text-center">
  //       {translate('Failed to load data')}
  //     </p>
  //   );

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9edf4] py-5 sm:px-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Complaint Box Terms and Conditions')}
          </h3>

          <Button onClick={handleCreateOpenForm}>{translate('Create')}</Button>
        </div>
        {studentData.length > 0 ? (
          <>
            {/* Table */}
            <SortableTable
              columns={columns}
              data={paginatedData}
              isFilterColumn={false}
            />

            {/* Pagination */}
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p className="text-gray-500 text-center">
            {translate('No data found')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ComplaintBoxTermsAndConditions;
