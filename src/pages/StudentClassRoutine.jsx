import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteClassRoutineMutation,
  useGetClassRoutinesQuery,
  useGetSubClassListQuery,
} from '../features/class/classQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { FormProvider, useForm } from 'react-hook-form';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

const PAGE_SIZE = 10;

const StudentClassRoutine = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { reset, watch, setValue } = methods;
  const translate = useTranslate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [SessionID, SubClassID] = watch(['SessionID', 'SubClassID']);

  // Fetch sessions
  const { data: sessionData = [] } = useGetSessionsQuery();
  const activeSession = sessionData.find((item) => item.SessionStatus === 1);

  // Fetch classes
  const { data: classListResponse = [] } = useGetSubClassListQuery();

  // Fetch routines with filters & pagination
  const { data, isLoading, isError, refetch } = useGetClassRoutinesQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    SessionID,
    SubClassID,
  });

  const [deleteClassRoutine] = useDeleteClassRoutineMutation();

  // Set page title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Set default session
  useEffect(() => {
    reset({
      SessionID: activeSession?.SessionID || '',
      SubClassID: '',
    });
    setCurrentPage(1);
  }, [activeSession, reset]);

  // // Handle filter change
  // const handleFilterChange = (key, value) => {
  //   setValue(key, value);
  //   setCurrentPage(1);
  //   refetch();
  // };

  // Flatten data for table
  const routines = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      RoutineID: item.RoutineID,
      DayName: item.Day?.DayName || '',
      SessionName: item.Session?.SessionName || '',
      TimeSlot: `${item?.TimeSlot?.StartTime || ''} - ${item?.TimeSlot?.EndTime || ''}`,
      SubjectName: item.Subject?.SubjectName || '',
      TeacherName: item.Teacher?.UserName || '',
      ClassName: item.Classes?.SubClass || '',
      ISPrayerBreak: item.IsBreak || false,
      Comment: item.Comment || '-',
    }));
  }, [data]);

  const totalPages = useMemo(() => {
    return data?.total ? Math.ceil(data.total / PAGE_SIZE) : 1;
  }, [data]);

  // Modal handlers
  const handleOpenModal = () => {
    showModal(translate('Create Class Routine'), 'ADD_CLASS_ROUTINE');
  };

  const handleEditOpenModal = (id) => {
    showModal(translate('Update Class Routine'), 'EDIT_CLASS_ROUTINE', id);
  };

  // Delete handler
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the class routine.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await deleteClassRoutine(id).unwrap();
        Swal.fire('Deleted!', 'The class routine has been removed.', 'success');
        refetch();
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete the class routine.', 'error');
      }
    }
  };

  // Table columns
  const columnsClassRoutine = [
    {
      title: translate('Action'),
      field: 'RoutineID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.RoutineID)} />
          <DeleteButton onClick={() => handleDelete(row.RoutineID)} />
        </div>
      ),
    },
    { title: translate('ID'), field: 'RoutineID', hozAlign: 'center' },
    { title: translate('Day'), field: 'DayName', hozAlign: 'center' },
    { title: translate('Time'), field: 'TimeSlot', hozAlign: 'center' },
    { title: translate('Subject'), field: 'SubjectName', hozAlign: 'center' },
    { title: translate('Teacher'), field: 'TeacherName', hozAlign: 'center' },
    { title: translate('Class'), field: 'ClassName', hozAlign: 'center' },
    { title: translate('Session'), field: 'SessionName', hozAlign: 'center' },
    {
      title: translate('Comment'),
      field: 'Comment',
      hozAlign: 'center',
      render: (row) => (
        <p
          className="max-w-[150px] truncate text-center"
          title={row.Comment}
        >
          {row.Comment}
        </p>
      ),
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        {/* Header Tabs */}
        <div className="border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="flex items-center gap-6">
            <Link
              to="/parent-panel"
              className={`relative pb-2 text-[18px] font-SolaimanLipi font-bold text-blue-600`}
            >
              {translate('Class Routine')}
            </Link>
            <Link
              to="/parent-panel/time-slots"
              className={`relative pb-2 text-[18px] font-SolaimanLipi font-bold text-gray-500 hover:text-blue-500`}
            >
              {translate('Time Slots')}
            </Link>
          </div>
          <Button onClick={handleOpenModal}>{translate('Create')}</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 my-5">
          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            require={translate('Required')}
          // onChange={(value) => handleFilterChange('SessionID', value)}
          />
          <DefaultSelect
            label={translate('Class')}
            nameField="SubClass"
            registerKey="SubClassID"
            valueField="SubClassID"
            options={classListResponse}
            require={translate('Required')}
          // onChange={(value) => handleFilterChange('SubClassID', value)}
          />
        </div>

        {/* Table */}
        <div className="min-h-[200px] relative">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          )}

          {!isLoading && isError && (
            <p className="text-center text-red-500 py-10">
              Failed to load class routine data
            </p>
          )}

          {!isLoading && !isError && (
            <>
              {routines.length === 0 ? (
                <p className="text-center text-gray-500 py-5">
                  কোন ডেটা পাওয়া যায়নি
                </p>
              ) : (
                <>
                  <SortableTable
                    columns={columnsClassRoutine}
                    data={routines}
                    isFilterColumn={false}
                  />
                  {totalPages > 1 && (
                    <div className="mt-3 flex justify-center">
                      <DefaultPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default StudentClassRoutine;