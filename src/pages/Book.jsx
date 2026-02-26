import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteAcademicSubjectMutation,
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from '../features/class/classQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const Book = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const method = useForm();
  const { watch } = method;
  const translate = useTranslate();
  const selectedSubClassID = watch('SubClassID');
  const {
    data: academicSubjectData = [],
    isError,
    isLoading,
  } = useGetAcademicSubjectsQuery(selectedSubClassID);

  const { data: subClassData = [] } = useGetSubClassListQuery();

  const [deleteSubject, { isLoading: isDeleting }] =
    useDeleteAcademicSubjectMutation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Provide default empty array if data is undefined
  const currentData = academicSubjectData || [];
  const totalPages = Math.ceil(currentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate('Add Book'), 'ADD_BOOK');
  }, [translate]);

  const handleEditSubject = useCallback(
    (id) => {
      showModal(translate('Update Book'), 'UPDATE_BOOK', id);
    },
    [translate]
  );

  const handleDeleteSubject = useCallback(
    (id) => {
      Swal.fire({
        title: translate('Are you sure?'),
        text: translate("You won't be able to revert this!"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: translate('Yes, delete it!'),
        cancelButtonText: translate('Cancel'),
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteSubject(id).unwrap();

            Swal.fire({
              title: translate('Deleted!'),
              text: translate('The subject has been deleted.'),
              icon: 'success',
            });
          } catch (error) {
            console.error('Delete failed:', error);
            Swal.fire({
              title: translate('Error'),
              text:
                error.data?.message || translate('Failed to delete subject'),
              icon: 'error',
            });
          }
        }
      });
    },
    [translate, deleteSubject]
  );

  const columnsDistribution = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      width: 120,
      headerSort: false,
      render: (data) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.kitab_entry}
            permissionType="edit"
            empty={true}
          >
            <button
              className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              title="Edit"
              onClick={() => handleEditSubject(data.SubjectID)}
            >
              <SvgIcon name={'FiEdit'} size={20} />
            </button>
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.kitab_entry}
            permissionType="delete"
            empty={true}
          >
            <button
              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              title="Delete"
              onClick={() => handleDeleteSubject(data.SubjectID)}
            >
              <SvgIcon name={'FaTrash'} size={20} />
            </button>
          </ViewPermission>
        </div>
      ),
    },
    {
      title: translate('Subject ID'),
      field: 'SubjectID',
      hozAlign: 'center',
      width: 120,
      sorter: 'number',
    },
    {
      title: translate('Subject Name'),
      field: 'SubjectName',
      hozAlign: 'left',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data.SubjectName)}</p>
        </div>
      ),
      sorter: 'string',
    },
    {
      title: translate('Marhala/Class'),
      field: 'SubClass',
      hozAlign: 'left',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data?.ClassGroup?.SubClass)}</p>
        </div>
      ),
    },
    {
      title: translate('English Name'),
      field: 'EngSubjectName',
      hozAlign: 'left',
      width: 200,
      sorter: 'string',
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data.EngSubjectName) || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Arabic Name'),
      field: 'ArabicSubject',
      hozAlign: 'right',
      width: 200,
      render: (data) => (
        <div className="flex justify-center items-center">
          <p>{bnBijoy2Unicode(data.ArabicSubject) || '-'}</p>
        </div>
      ),
    },
    {
      title: translate('Class Group'),
      field: 'SubClassID',
      hozAlign: 'center',
      width: 150,
      sorter: 'number',
      formatter: (cell) => {
        // You can map SubClassID to actual group names if needed
        return `Group ${cell.getValue()}`;
      },
    },
    {
      title: translate('Serial'),
      field: 'SubSerial',
      hozAlign: 'center',
      width: 100,
      sorter: 'number',
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      width: 180,
      sorter: 'date',
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB');
      },
    },
    {
      title: translate('Updated At'),
      field: 'UpdateAt',
      hozAlign: 'center',
      width: 180,
      sorter: 'date',
      render: (row) => {
        const date = row.UpdateAt ? new Date(row.UpdateAt) : null;
        return date && !isNaN(date) ? date.toLocaleDateString('en-GB') : '-';
      },
    },
  ];

  if (isLoading) return <Loading />;
  if (isError) return <div>{translate('Error loading data')}</div>;
  return (
    <FormProvider {...method}>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
              {translate('Book List')}
            </h3>
            <ViewPermission
              permissionId={permissionsDataList.kitab_entry}
              permissionType="insert"
            >
              <Button onClick={() => handleOpenModal()}>
                {translate('Add Book')}
              </Button>
            </ViewPermission>
          </div>
          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center w-full">
              <DefaultSelect
                options={subClassData || []}
                require={'Sub Class is required'}
                nameField={'SubClass'}
                valueField={'SubClassID'}
                registerKey={'SubClassID'}
                type={'number'}
                label={translate('Sub Class')}
                unicode={true}
              />
            </div>
            {/* এখানে চাইলে ভবিষ্যতে আরও ফিল্টার ফিল্ড যোগ করা যাবে */}
          </div>

          {currentData.length > 0 ? (
            <>
              <SortableTable
                columns={columnsDistribution}
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
            <div className="text-center py-8">
              {translate('No data available')}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default Book;
