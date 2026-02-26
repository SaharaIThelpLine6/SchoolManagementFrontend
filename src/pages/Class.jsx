import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const Class = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 Fetch Classes
  const {
    data: classes = [],
    isLoading,
    isError,
    refetch,
  } = useGetClassListQuery();

  // 🔹 Delete Mutation
  //   const [deleteClass] = useDeleteClassMutation();

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return classes.slice(start, start + PAGE_SIZE);
  }, [classes, currentPage]);

  // 🔹 Set Page Name
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // 🔹 Open Create Modal
  const handleCreateOpenForm = useCallback(() => {
    showModal(translate('Class Create'), 'CLASS_CREATE_FORM');
  }, [translate]);

  // 🔹 Open Edit Modal
  const handleEditOpenForm = useCallback(
    (id) => {
      showModal(translate('Class Update'), 'CLASS_EDIT_FORM', id);
    },
    [translate]
  );

  // 🔹 Delete Class
  const handleDeleteOpenForm = async (id) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to delete this class?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, delete it!'),
      cancelButtonText: translate('Cancel'),
    });

    if (result.isConfirmed) {
      try {
        // await deleteClass(id).unwrap();

        await Swal.fire({
          icon: 'success',
          title: translate('Deleted successfully'),
          timer: 1500,
          showConfirmButton: false,
        });

        refetch(); // auto refresh list
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: translate('Error'),
          text: err?.data?.message || translate('Failed to delete class'),
        });
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-500">{translate('Failed to load classes')}</p>
    );

  const columns = [
    {
      title: translate('Serial'),
      field: 'Serial',
      hozAlign: 'center',
      render: (row) => <p>{row.Serial}</p>,
    },
    {
      title: translate('Class'),
      field: 'ClassName',
      hozAlign: 'center',
      render: (row) => <p>{row.ClassName}</p>,
    },
    {
      title: translate('Arabic'),
      field: 'ArabicClass',
      hozAlign: 'center',
      render: (row) => <p>{row.ArabicClass}</p>,
    },
    {
      title: translate('Action'),
      field: 'ClassID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center gap-3 items-center">
          <ViewPermission
            permissionId={permissionsDataList.class}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEditOpenForm(row.ClassID)} />
          </ViewPermission>

          {/* <ViewPermission
            permissionId={permissionsDataList.class}
            permissionType="delete"
            empty={true}
          >
            <Button
              onClick={() => handleDeleteOpenForm(row.ClassID)}
              variant="danger"
              size="sm"
            >
              {translate('Delete')}
            </Button>
          </ViewPermission> */}
        </div>
      ),
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Header */}
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
        <h3 className="font-SolaimanLipi text-[20px] font-bold">
          {translate('Classes')}
        </h3>

        <ViewPermission
          permissionId={permissionsDataList.class}
          permissionType="insert"
        >
          <Button onClick={handleCreateOpenForm}>
            {translate('Create Class')}
          </Button>
        </ViewPermission>
      </div>

      {/* Table */}
      <SortableTable
        columns={columns}
        data={paginatedData}
        isFilterColumn={false}
      />

      {/* Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Class;
