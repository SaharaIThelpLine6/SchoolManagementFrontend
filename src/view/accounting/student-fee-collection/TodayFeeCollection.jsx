import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading/Loading';
import SortableTable from '../../../components/Tables/SortableTable';
import { setPageName } from '../../../features/auth/authSlice';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

import EditButton from '../../../components/Button/EditButton';
import SvgIcon from '../../../components/icons/SvgIcon';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import {
  useDeleteStudentsVacationTypeMutation,
  useGetStudentsVacationTypeListQuery,
} from '../../../features/student/studentQuerySlice';

const PAGE_SIZE = 10;

const TodayFeeCollection = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const [
    deleteVacationType,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteStudentsVacationTypeMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(studentVacationTypeData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentVacationTypeData.slice(start, start + PAGE_SIZE);
  }, [studentVacationTypeData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Type of holiday create'), 'ADD_TYPEOFVACATION');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Type of holiday update'), 'EDIT_TYPEOFVACATION', id);
    },
    [translate]
  );

  const handleDelete = useCallback(
    async (id) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete the vacation type.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteVacationType(id).unwrap();
            Swal.fire(
              'Deleted!',
              'The vacation type has been removed.',
              'success'
            );
          } catch (error) {
            Swal.fire('Error!', 'Failed to delete the vacation type.', 'error');
          }
        }
      });
    },
    [deleteVacationType]
  );

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columnsVacationType = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ID)} />

          <button
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-md shadow-md hover:shadow-lg transition duration-200"
            title="Print"
            onClick={() => handleDelete(row.ID)}
            disabled={isDeleteLoading}
          >
            <SvgIcon name="MdLocalPrintshop" />
          </button>
        </div>
      ),
    },
    {
      title: translate('Receipt'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('ID'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('Name'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('Father Name'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('Class'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('Deposit'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate('Date'),
      field: 'VacationList',
      hozAlign: 'center',
      render: (row) => <p>{row.VacationList}</p>,
    },
    {
      title: translate('Status'),
      field: 'VacationList',
      hozAlign: 'center',
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg my-5">
      <div className="block w-full overflow-x-auto">
        <SortableTable columns={columnsVacationType} data={paginatedData} />

        {/* Pagination Controls */}

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default TodayFeeCollection;
