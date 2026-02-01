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
import CopyButton from '../components/Button/CopyButton';
import DeleteButton from '../components/Button/DeleteButton';
import ViewButton from '../components/Button/ViewButton';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useDeleteHomeWorkMutation,
  useGetHomeWorksQuery,
} from '../features/student/studentQuerySlice';
import EditButton from '../components/Button/EditButton';

const PAGE_SIZE = 10;

const HomWork = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm();
  const { setValue, watch } = methods;
  const translate = useTranslate();

  const [SessionID, SubClassID] = watch(['SessionID', 'SubClassID']);

  const {
    data: homeWorkData = [],
    isSVTError,
    isSVTLoading,
  } = useGetHomeWorksQuery({ SessionID, SubClassID });

  // console.log(homeWorkData, 'homeWorkData');

  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);
  const [
    deleteHomeWork,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteHomeWorkMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(homeWorkData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return homeWorkData.slice(start, start + PAGE_SIZE);
  }, [homeWorkData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Create homework'), 'CREATE_HOME_WORK');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Update homework'), 'UPDATE_HOME_WORK', id);
    },
    [translate]
  );
  const handleViewOpenModal = useCallback(
    (id) => {
      showModal(translate('View homework'), 'VIEW_HOME_WORK', id);
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
            await deleteHomeWork(id).unwrap();
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
    [deleteHomeWork]
  );
  // const handleCopyRowToForm = (data) => {
  //   console.log(data, 'handleCopyRowToForm');
  // };

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  const columns = [
    {
      title: translate('Action'),
      field: 'HWID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.HWID)} />
          <DeleteButton onClick={() => handleDelete(row.HWID)} />
          <ViewButton onClick={() => handleViewOpenModal(row.HWID)} />
          <CopyButton
            className="bg-green-500 text-white hover:bg-green-600"
            // onClick={() => handleCopyRowToForm(row)}
            text={`
                *Homework Details 📚*
                Class: ${row.SubClass?.SubClass}
                Session: ${row.Session?.SessionName}
                Subject: ${row.Subject?.SubjectName}
                Teacher: ${row.User?.UserName}
                Mobile: ${row.User?.Mobile1}

                *Homework:*
                ${row?.HomeWork}

                *Class Work:*
                ${row?.ClassWork}
                  `.trim()}
          />
        </div>
      ),
    },
    {
      title: translate('ID'),
      field: 'HWID',
      hozAlign: 'center',
      render: (row) => <p>{row.HWID}</p>,
    },
    {
      title: translate('Day'),
      field: 'Day',
      hozAlign: 'center',
      render: (row) => {
        if (!row.CreateAt) return '-';

        const dayName = new Date(row.CreateAt).toLocaleDateString('bn-BD', {
          weekday: 'long',
        });

        return <p>{dayName}</p>;
      },
    },

    {
      title: translate('SubClass'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClass?.SubClass}</p>,
    },
    {
      title: translate('Session'),
      field: 'SessionID',
      hozAlign: 'center',
      render: (row) => <p>{row.Session?.SessionName}</p>,
    },
    {
      title: translate('Subject'),
      field: 'SubjectID',
      hozAlign: 'center',
      render: (row) => <p>{row.Subject?.SubjectName}</p>,
    },
    {
      title: translate('Teacher'),
      field: 'TeacherID',
      hozAlign: 'center',
      render: (row) => <p>{row?.User?.UserName}</p>,
    },
    {
      title: translate('Home Work'),
      field: 'HomeWork',
      hozAlign: 'left',
      width: 300,
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.HomeWork}</p>
        </div>
      ),
    },
    {
      title: translate('Class Work'),
      field: 'ClassWork',
      hozAlign: 'left',
      width: 300,
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.ClassWork}</p>
        </div>
      ),
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      render: (row) => <p>{new Date(row.CreateAt).toLocaleDateString()}</p>,
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate('Home Work')}
            </h3>
            <Button onClick={() => handleOpenModal()}>
              {translate('Create')}
            </Button>
          </div>
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
              {/* <DefaultSelect
                label="Subject"
                registerKey="SubjectID"
                options={subjectData}
                valueField="SubjectID"
                nameField="SubjectName"
              /> */}
            </div>
          </div>
          {paginatedData.length > 0 ? (
            <>
              <SortableTable
                columns={columns}
                data={paginatedData}
                isFilterColumn={false}
              />

              {/* Pagination Controls */}
              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <p className="text-center text-gray-500 mt-4">Data Not Found</p>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default HomWork;
