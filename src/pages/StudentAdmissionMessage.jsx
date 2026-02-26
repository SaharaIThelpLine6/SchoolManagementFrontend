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
import { Link } from 'react-router-dom';
import { useGetStudentAdmissionMessageQuery } from '../features/settings/settingsQuerySlice';

const PAGE_SIZE = 10;

const StudentAdmissionMessage = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetMaddasahReportListQuery();  
  
  const {
    data: messageData,
    // isLoading,
    // isError,
  } = useGetStudentAdmissionMessageQuery();

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
  const tabs = [
    {
      name: translate('Online Admission'),
      path: '/parent-panel/online-admission',
    },
    {
      name: translate('Online Admission Message'),
      path: '/parent-panel/online-admission-message',
    },
  ];


  return (
       <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-xl">

      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="flex items-center gap-6">
            {tabs.map((tab, index) => {
              const isActive = location.pathname === tab.path;

              return (
                <Link
                  key={index}
                  to={tab.path}
                  className={`relative pb-2 text-[18px] font-SolaimanLipi font-bold transition-all duration-300 ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-500'
                    }`}
                >
                  {tab.name}

                  {/* Active underline animation */}
                  {isActive && (
                    <span className="absolute left-0 -bottom-[6px] w-full h-[3px] bg-blue-600 rounded-full transition-all duration-300"></span>
                  )}
                </Link>
              );
            })}
          </div>
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

export default StudentAdmissionMessage;
