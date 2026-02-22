import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteClassRoutineMutation,
  useDeleteTimeSlotMutation,
  useGetTimeSlotsQuery,
} from '../features/class/classQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const StudentClassRoutineTimeSlots = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();

  // ✅ Fetch Data
  const { data: timeSlotsData, isLoading, isError } = useGetTimeSlotsQuery();

  const [deleteClassRoutine] = useDeleteClassRoutineMutation();
  const [deleteTimeSlot] = useDeleteTimeSlotMutation();
  const [currentPage, setCurrentPage] = useState(1);

  // Set Page Title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Pagination
  const safeData = timeSlotsData ?? []; // handle undefined
  const totalPages = Math.ceil(safeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return safeData.slice(start, start + PAGE_SIZE);
  }, [safeData, currentPage]);
  // Modal Handlers
  const handleOpenModal = () => {
    showModal(translate('Create Time Slots'), 'ADD_CLASS_ROUTINE_TIME_SLOTS');
  };

  // Delete Handler
  const handleDelete = useCallback(
    async (id) => {
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
          await deleteTimeSlot(id).unwrap();
          Swal.fire(
            'Deleted!',
            'The class routine has been removed.',
            'success'
          );
        } catch (error) {
          Swal.fire('Error!', error?.data?.message, 'error');
        }
      }
    },
    [deleteClassRoutine]
  );

  // Table Columns
  const columnsClassRoutine = [
    {
      title: translate('Action'),
      field: 'id',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <DeleteButton onClick={() => handleDelete(row.TimeSlotID)} />
        </div>
      ),
    },
    { title: translate('ID'), field: 'TimeSlotID', hozAlign: 'center' },
    { title: translate('Start Time'), field: 'StartTime', hozAlign: 'center' },
    { title: translate('End Time'), field: 'EndTime', hozAlign: 'center' },
  ];

  const tabs = [
    {
      name: translate('Class Routine'),
      path: '/parent-panel',
    },
    {
      name: translate('Time Slots'),
      path: '/parent-panel/time-slots',
    },
  ];
  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        {/* Header */}
        <div className="border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="flex items-center gap-6">
            {tabs.map((tab, index) => {
              const isActive = location.pathname === tab.path;

              return (
                <Link
                  key={index}
                  to={tab.path}
                  className={`relative pb-2 text-[18px] font-SolaimanLipi font-bold transition-all duration-300 ${
                    isActive
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
          <Button onClick={handleOpenModal}>{translate('Create')}</Button>
        </div>

        {/* Table Area */}
        <div className="min-h-[200px] relative">
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          )}

          {!isLoading && isError && (
            <p className="text-center text-red-500 py-10">
              ক্লাস রুটিনের ডেটা লোড করা যায়নি
            </p>
          )}

          {!isLoading && !isError && (
            <>
              {paginatedData.length === 0 ? (
                <p className="text-center text-gray-500 py-5">
                  কোন ডেটা পাওয়া যায়নি
                </p>
              ) : (
                <>
                  <SortableTable
                    columns={columnsClassRoutine}
                    data={paginatedData}
                    isFilterColumn={false}
                  />

                  {totalPages > 1 && (
                    <DefaultPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassRoutineTimeSlots;
