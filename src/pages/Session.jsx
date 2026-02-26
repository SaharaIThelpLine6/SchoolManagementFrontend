import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import ToggleSwitch from '../components/Switchers/ToggleSwitch';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteSessionMutation,
  useGetSessionsQuery,
  useStatusUpdateSessionMutation,
} from '../features/session/sessionSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const Session = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 Query & Mutations
  const {
    data: sessions = [],
    isLoading: isLoadingSessions,
    isError: isErrorSessions,
    refetch,
  } = useGetSessionsQuery();


  const [statusUpdateSession] = useStatusUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sessions.slice(start, start + PAGE_SIZE);
  }, [sessions, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ✅ Status Toggle
  const handleStatusToggle = async (row, checked) => {
    try {
      await statusUpdateSession({
        id: row.SessionID,
        SessionStatus: checked ? 1 : 0,
      }).unwrap();
      toast.success('Session status updated successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to update session status');
      console.error(err);
    }
  };

  const handleCreateOpenForm = useCallback(
    (id) => {
      showModal(translate('Session Create'), 'SESSION_CREATE_FORM');
    },
    [translate]
  );

  const handleEditOpenForm = useCallback(
    (id) => {
      showModal(translate('Session Update'), 'SESSION_EDIT_FORM', id);
    },
    [translate]
  );
  const handleDeleteOpenForm = async (id) => {
    // 🟡 Step 1: Confirmation alert
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই সেশনটি মুছে ফেলতে চান?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        // 🟢 Step 2: API delete request
        const res = await deleteSession(id).unwrap();

        // 🟢 Step 3: Success alert
        await Swal.fire({
          icon: 'success',
          title: 'সফলভাবে মুছে ফেলা হয়েছে!',
          text: res?.message || 'সেশনটি সফলভাবে মুছে ফেলা হয়েছে।',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        // 🔴 Step 4: Error alert
        await Swal.fire({
          icon: 'error',
          title: 'ত্রুটি!',
          text:
            err?.data?.error ||
            err?.data?.message ||
            'সেশনটি মুছে ফেলার সময় একটি ত্রুটি ঘটেছে।',
        });
      }
    }
  };

  if (isLoadingSessions) return <Loading />;
  if (isErrorSessions)
    return <p className="text-red-500">Failed to load session data</p>;

  const columns = [
    {
      title: translate('ID'),
      field: 'SessionID',
      hozAlign: 'center',
      render: (row) => <p>{row.SessionID}</p>,
    },
    {
      title: translate('Session Name'),
      field: 'SessionName',
      hozAlign: 'center',
      render: (row) => <p>{row.SessionName}</p>,
    },
    {
      title: translate('English'),
      field: 'SessionEngName',
      hozAlign: 'center',
      render: (row) => <p>{row.SessionEngName}</p>,
    },
    {
      title: translate('Arabic'),
      field: 'SessionAraName',
      hozAlign: 'center',
      render: (row) => <p>{row.SessionAraName}</p>,
    },
    {
      title: translate('Status'),
      field: 'SessionStatus',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <ViewPermission
            permissionId={permissionsDataList.academic_year}
            permissionType="edit"
            empty={true}
          >
            <ToggleSwitch
              checked={row.SessionStatus === 1}
              onChange={(e) => handleStatusToggle(row, e.target.checked)}
            />
          </ViewPermission>
        </div>
      ),
    },
    {
      title: translate('Action'),
      field: 'SessionID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center gap-3 items-center">
          <ViewPermission
            permissionId={permissionsDataList.academic_year}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEditOpenForm(row.SessionID)} />
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.academic_year}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDeleteOpenForm(row.SessionID)} />
          </ViewPermission>
        </div>
      ),
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* 🔹 Header */}
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
        <h3 className="font-SolaimanLipi text-[20px] font-bold">
          {translate('Session')}
        </h3>
        <ViewPermission
          permissionId={permissionsDataList.academic_year}
          permissionType="insert"
        >
          <Button onClick={handleCreateOpenForm}>
            {translate('Create Session')}
          </Button>
        </ViewPermission>
      </div>

      {/* 🔹 Table */}
      <SortableTable
        columns={columns}
        data={paginatedData}
        isFilterColumn={false}
      />

      {/* 🔹 Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Session;
