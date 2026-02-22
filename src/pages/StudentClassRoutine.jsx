import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '../features/class/classQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const StudentClassRoutine = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();
  // ✅ Fetch Data

  const { data, isLoading, isError } = useGetClassRoutinesQuery();

  console.log(data, 'data');
  const [deleteClassRoutine] = useDeleteClassRoutineMutation();
  const [currentPage, setCurrentPage] = useState(1);

  // Set Page Title
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ✅ Flatten API Data
  const routines = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((item) => ({
      RoutineID: item.RoutineID,
      DayName: item.Day?.DayName || '',
      TimeSlot: `${item?.TimeSlot.StartTime} - ${item?.TimeSlot.EndTime}`,
      SubjectName: item.Subject?.SubjectName || '',
      TeacherName: item.Teacher?.UserName || '',
      ClassName: item.Classes?.SubClass || '',
      ISPrayerBreak: item.IsBreak || false,
    }));
  }, [data]);

  // Pagination
  const totalPages = Math.ceil(routines.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return routines.slice(start, start + PAGE_SIZE);
  }, [routines, currentPage]);

  // Modal Handlers
  const handleOpenModal = () => {
    showModal(translate('Create Class Routine'), 'ADD_CLASS_ROUTINE');
  };

  const handleEditOpenModal = (id) => {
    showModal(translate('Update Class Routine'), 'EDIT_CLASS_ROUTINE', id);
  };

  // Delete Handler
  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete the class routine.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteClassRoutine(id).unwrap();
            Swal.fire(
              'Deleted!',
              'The class routine has been removed.',
              'success'
            );
          } catch (error) {
            Swal.fire('Error!', 'Failed to delete the class routine.', 'error');
          }
        }
      });
    },
    [deleteClassRoutine]
  );

  // Table Columns
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
    // {
    //   title: translate('Prayer Break'),
    //   field: 'ISPrayerBreak',
    //   hozAlign: 'center',
    //   render: (row) => (
    //     <span
    //       className={`px-2 py-1 rounded text-sm ${
    //         row.ISPrayerBreak
    //           ? 'bg-green-100 text-green-700'
    //           : 'bg-gray-100 text-gray-600'
    //       }`}
    //     >
    //       {row.ISPrayerBreak ? translate('Yes') : translate('No')}
    //     </span>
    //   ),
    // },
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
              Failed to load class routine data
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

export default StudentClassRoutine;
