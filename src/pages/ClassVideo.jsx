import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

import { useForm, useWatch } from 'react-hook-form';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { useDeleteClassVideoMutation, useGetVideoTutorialLinksQuery } from '../features/class/classQuerySlice';
import {
  useGetStudentsVacationTypeListQuery
} from '../features/student/studentQuerySlice';

const PAGE_SIZE = 10;

const ClassVideo = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const method = useForm();
  const { control } = method;

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();
  const selectedSessionID = useWatch({ control, name: 'SessionID' });
  const selectedSubClassID = useWatch({ control, name: 'SubClassID' });
  const {
    data: videoList = [],
    isLoading,
    isError,
  } = useGetVideoTutorialLinksQuery({
    SessionID: selectedSessionID,
    SubClassID: selectedSubClassID,
  });

  console.log(videoList, 'videoList');

  const [
    deleteClassVideo,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteClassVideoMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);

  const videos = videoList?.videos || []; // fallback to empty array

  const totalPages = Math.ceil(videos.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return videos.slice(start, start + PAGE_SIZE);
  }, [videos, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Class video create'), 'CREATE_CLASS_VIDEO');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Class video update'), 'EDIT_CLASS_VIDEO', id);
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
            await deleteClassVideo(id).unwrap();
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
    [deleteClassVideo]
  );

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  // Table columns for videos
  const columnsVideos = [
    {
      title: translate('Serial'),
      field: 'Serial',
      hozAlign: 'center',
      render: (row) => <p>{row.Serial}</p>,
    },
    {
      title: translate('Tutorial Name'),
      field: 'TutorialName',
      hozAlign: 'left',
      render: (row) => (
        <a
          href={row.TutorialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {row.TutorialName}
        </a>
      ),
    },
    {
      title: translate('Session'),
      field: 'Session',
      hozAlign: 'center',
      render: (row) => <p>{row.Session?.SessionName || '-'}</p>,
    },
    {
      title: translate('Class / SubClass'),
      field: 'SubClass',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClass?.SubClass || '-'}</p>,
    },
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ID)} />
          <DeleteButton onClick={() => handleDelete(row.ID)} />
        </div>
      ),
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Class Video')}
          </h3>
          <Button onClick={() => handleOpenModal()}>
            {translate('Create')}
          </Button>
        </div>

        <SortableTable
          columns={columnsVideos}
          data={paginatedData}
          isFilterColumn={false}
        />

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

export default ClassVideo;
