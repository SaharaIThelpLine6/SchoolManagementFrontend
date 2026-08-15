import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

import { FormProvider, useForm } from 'react-hook-form';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';

import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

import {
  useDeleteHomeWorkGroupMutation,
  useGetHomeWorkGroupsQuery,
} from '../features/student/studentQuerySlice';

const PAGE_SIZE = 10;

const HomWorkGroup = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm();

  const { setValue, watch } = methods;
  const translate = useTranslate();

  const [SessionID, SubClassID] = watch([
    'SessionID',
    'SubClassID',
  ]);

  // =========================
  // API
  // =========================

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
  } = useGetHomeWorkGroupsQuery({
    SessionID,
    SubClassID,
  });

  const homeWorkGroups = response?.data || [];

  const { data: sessionData = [] } = useGetSessionsQuery();

  const { data: subClassData = [] } =
    useGetSubClassListQuery();

  const activeSession = sessionData?.find(
    (item) => item.SessionStatus === 1
  );

  const [
    deleteHomeWorkGroup,
    { isLoading: isDeleteLoading },
  ] = useDeleteHomeWorkGroupMutation();

  // =========================
  // Page
  // =========================

  useEffect(() => {
    if (pageTitle) {
      dispatch(setPageName(pageTitle));
    }
  }, [dispatch, pageTitle]);

  // =========================
  // Default Active Session
  // =========================

  useEffect(() => {
    if (activeSession?.SessionID) {
      setValue('SessionID', activeSession.SessionID);
    }
  }, [activeSession?.SessionID, setValue]);

  // =========================
  // Pagination
  // =========================

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    homeWorkGroups.length / PAGE_SIZE
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return homeWorkGroups.slice(
      start,
      start + PAGE_SIZE
    );
  }, [homeWorkGroups, currentPage]);

  // =========================
  // Create
  // =========================

  const handleOpenModal = useCallback(() => {
    showModal(
      translate('Create homework group'),
      'CREATE_HOME_WORK_GROUP'
    );
  }, [translate]);

  // =========================
  // Update
  // =========================

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate('Update homework group'),
        'UPDATE_HOME_WORK_GROUP',
        id
      );
    },
    [translate]
  );

  // =========================
  // Delete
  // =========================

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This homework group will be deactivated.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      });

      if (!result.isConfirmed) return;

      try {
        await deleteHomeWorkGroup(id).unwrap();

        Swal.fire(
          'Deleted!',
          'Homework group has been removed.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Error!',
          error?.data?.error ||
          'Failed to delete homework group.',
          'error'
        );
      }
    },
    [deleteHomeWorkGroup]
  );

  // =========================
  // Loading
  // =========================

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <p className="text-red-500">
        Failed to load homework group data
      </p>
    );
  }

  // =========================
  // Columns
  // =========================

  const columns = [
    {
      title: translate('Action'),
      field: 'GroupID',
      hozAlign: 'center',

      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton
            onClick={() =>
              handleEditOpenModal(row.GroupID)
            }
          />

          <DeleteButton
            onClick={() =>
              handleDelete(row.GroupID)
            }
          />
        </div>
      ),
    },

    {
      title: translate('ID'),
      field: 'GroupID',
      hozAlign: 'center',

      render: (row, index) => (
        <p>{index + 1}</p>
      ),
    },

    {
      title: translate('Group Name'),
      field: 'GroupName',
      hozAlign: 'center',

      render: (row) => (
        <p className="font-semibold">
          {row.GroupName}
        </p>
      ),
    },

    {
      title: translate('SubClass'),
      field: 'SubClassID',
      hozAlign: 'center',

      render: (row) => (
        <p>
          {row.SubClass?.SubClass || '-'}
        </p>
      ),
    },

    {
      title: translate('Session'),
      field: 'SessionID',
      hozAlign: 'center',

      render: (row) => (
        <p>
          {row.Session?.SessionName || '-'}
        </p>
      ),
    },

    {
      title: translate('Subject'),
      field: 'SubjectID',
      hozAlign: 'center',

      render: (row) => (
        <p>
          {row.Subject?.SubjectName || '-'}
        </p>
      ),
    },

    {
      title: translate('Teacher'),
      field: 'TeacherID',
      hozAlign: 'center',

      render: (row) => (
        <p>
          {row.Teacher?.UserName || '-'}
        </p>
      ),
    },

    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',

      render: (row) => (
        <p>
          {row.CreateAt
            ? new Date(
              row.CreateAt
            ).toLocaleDateString()
            : '-'}
        </p>
      ),
    },

    {
      title: translate('Status'),
      field: 'IsActive',
      hozAlign: 'center',

      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${row.IsActive
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
            }`}
        >
          {row.IsActive
            ? translate('Active')
            : translate('Inactive')}
        </span>
      ),
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="font-default bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">

          {/* Header */}

          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-default text-[20px] font-bold">
              {translate('Home Work Teacher Group')}
            </h3>

            <Button onClick={handleOpenModal}>
              {translate('Create')}
            </Button>
          </div>

          {/* Filters */}

          <div className="grid grid-cols-1 sm:grid-cols-2 mb-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full">

              <DefaultSelect
                label="Session"
                registerKey="SessionID"
                options={sessionData}
                valueField="SessionID"
                nameField="SessionName"
              />

              <DefaultSelect
                label="SubClass"
                registerKey="SubClassID"
                options={subClassData}
                valueField="SubClassID"
                nameField="SubClass"
              />

            </div>
          </div>

          {/* Table */}

          {paginatedData.length > 0 ? (
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
          ) : (
            <p className="text-center text-gray-500 mt-4">
              Data Not Found
            </p>
          )}

          {isFetching && (
            <p className="text-center text-gray-400 text-sm mt-2">
              Loading...
            </p>
          )}

        </div>
      </div>
    </FormProvider>
  );
};

export default HomWorkGroup;