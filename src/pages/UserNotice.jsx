import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import {
  useGetUserNoticesQuery,
  useDeleteUserNoticeMutation,
  useCreateUserNoticeMutation,
  useUpdateUserNoticeMutation
} from '../features/settings/settingsQuerySlice';
import { useGetUserTypesQuery } from '../features/userType/userTypeSlice';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultInput from '../components/Forms/DefaultInput';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

const PAGE_SIZE = 10;

const UserNotice = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const method = useForm({
    defaultValues: {
      UserTypeID: '',
      UserCode: '',
      UserName: ''
    }
  });
  const { control, reset } = method;

  // Form watch values
  const UserTypeID = useWatch({ control, name: 'UserTypeID' });
  const UserCode = useWatch({ control, name: 'UserCode' });
  const UserName = useWatch({ control, name: 'UserName' });
  const SessionID = useWatch({ control, name: 'SessionID' });

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    page: currentPage,
    limit: PAGE_SIZE,
    UserTypeID: '',
    UserCode: '',
    UserName: '',
    SessionID: ''
  });
  // 🔥 Build final query object (important)
  const queryParams = {
    page: currentPage,
    limit: PAGE_SIZE,
    ...(filters.UserTypeID && { UserTypeID: filters.UserTypeID }),
    ...(filters.UserCode && { UserCode: filters.UserCode }),
    ...(filters.UserName && { UserName: filters.UserName }),
    ...(filters.SessionID && { SessionID: filters.SessionID }),
  };

  // Fetch user notices with filters
  const { data, isError, isLoading, refetch } = useGetUserNoticesQuery(queryParams, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const { data: sessionData } = useGetSessionsQuery();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);


  // Fetch user types for dropdown
  const { data: userType = [] } = useGetUserTypesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [
    deleteUserNotice,
    { isLoading: isDeleteLoading }
  ] = useDeleteUserNoticeMutation();



  const [
    updateUserNotice,
    { isLoading: isUpdateLoading }
  ] = useUpdateUserNoticeMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);
  useEffect(() => {
    reset({
      SessionID: activeSession?.SessionID || "",
    });
  }, [activeSession, reset]);
  // Update filters when form values change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        page: 1, // Reset to first page on filter change
        limit: PAGE_SIZE,
        UserTypeID: UserTypeID || '',
        UserCode: UserCode || '',
        UserName: UserName || '',
        SessionID: SessionID || ''
      });
      setCurrentPage(1); // Reset current page
    }, 500);

    return () => clearTimeout(timer);
  }, [UserTypeID, UserCode, UserName, SessionID]);

  // Update filters when page changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      page: currentPage,
      limit: PAGE_SIZE
    }));
  }, [currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate("User notice create"), "USER_NOTICE_CREATE");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate("User notice update"), "USER_NOTICE_UPDATE", id);
    },
    [translate]
  );

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete the user notice.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUserNotice(id).unwrap();
            refetch();
            Swal.fire('Deleted!', 'The user notice has been removed.', 'success');
          } catch (error) {
            Swal.fire('Error!', 'Failed to delete the user notice.', 'error');
          }
        }
      });
    },
    [deleteUserNotice, refetch]
  );

  const handleResetFilters = () => {
    reset({
      UserTypeID: '',
      Search: '',
      UserCode: '',
      UserName: ''
    });
    setCurrentPage(1);
  };

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load user notices data</p>;

  const notices = data?.data || [];
  const totalRecords = data?.totalRecords || 0;
  const totalPages = data?.totalPages || 1;

  // Table columns for user notices
  const columns = [
    {
      title: translate('SL No'),
      field: 'sl',
      hozAlign: 'center',
      width: 80,
      render: (row, index) => <p>{(currentPage - 1) * PAGE_SIZE + index + 1}</p>,
    },
    {
      title: translate('User Type'),
      field: 'UserType',
      hozAlign: 'center',
      width: 150,
      render: (row) => <p>{row.UserType?.TypeName || '-'}</p>,
    },
    {
      title: translate('User Code'),
      field: 'UserCode',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{row.User?.UserCode || '-'}</p>,
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'left',
      width: 180,
      render: (row) => <p>{row.User?.UserName || '-'}</p>,
    },
    {
      title: translate('Notice Message'),
      field: 'NoticeMessage',
      hozAlign: 'left',
      width: 300,
      render: (row) => (
        <div className="max-w-xs truncate" title={row.NoticeMessage}>
          {row.NoticeMessage || '-'}
        </div>
      ),
    },
    // {
    //   title: translate('Created At'),
    //   field: 'CreatedAt',
    //   hozAlign: 'center',
    //   width: 150,
    //   render: (row) => <p>{row.CreatedAt ? moment(row.CreatedAt).format('DD/MM/YYYY HH:mm') : '-'}</p>,
    // },
    {
      title: translate('Action'),
      field: 'UNID',
      hozAlign: 'center',
      width: 120,
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.UNID)} />
          <DeleteButton onClick={() => handleDelete(row.UNID)} />
        </div>
      ),
    },
  ];

  return (
    <FormProvider {...method}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          {/* Header */}
          <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-start sm:items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6 gap-4">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate('User Notice')}
            </h3>
            <Button onClick={handleOpenModal}>
              {translate('Create New')}
            </Button>
          </div>

          {/* Filter Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold mb-3">{translate('Filter Options')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <DefaultSelect
                label={translate('User Type')}
                options={userType}
                valueField="ID"
                nameField="TypeName"
                registerKey="UserTypeID"
                placeholder={translate('Select User Type')}
              />
              <DefaultSelect
                label={"Session"}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
              <DefaultInput
                label={translate('User Code')}
                registerKey="UserCode"
                type="number"
                placeholder={translate('Search by user code...')}
              />
              <DefaultInput
                label={translate('User Name')}
                registerKey="UserName"
                placeholder={translate('Search by user name...')}
              />
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={handleResetFilters}
                  className="w-full"
                >
                  {translate('Reset Filters')}
                </Button>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4 text-sm text-gray-600">
            {translate('Total Records')}: {totalRecords}
          </div>

          {/* Table */}
          <SortableTable
            columns={columns}
            data={notices}
            isFilterColumn={false}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default UserNotice;