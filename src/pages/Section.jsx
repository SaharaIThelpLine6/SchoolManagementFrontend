import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import ToggleSwitch from '../components/Switchers/ToggleSwitch';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubclassesQuery } from '../features/session/sessionSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const Section = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // 🔹 Query & Mutations
  const {
    data: responseData = {},
    isLoading,
    isError,
    refetch,
  } = useGetSubclassesQuery();

  // const [deleteSubClass] = useDeleteSubclassMutation();

  // 🔹 Extract subClasses from response data
  const subClasses = useMemo(() => {
    return responseData?.subClasses || [];
  }, [responseData]);

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(subClasses.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return subClasses.slice(start, start + PAGE_SIZE);
  }, [subClasses, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ✅ Status Toggle
  const handleStatusToggle = async (row, checked) => {
    // try {
    //   await statusUpdateSession({
    //     id: row.SessionID,
    //     SessionAction: checked ? 1 : 0,
    //   }).unwrap();
    //   toast.success(translate('Session status updated successfully'));
    //   refetch();
    // } catch (err) {
    //   toast.error(translate('Failed to update session status'));
    //   console.error(err);
    // }
  };

  const handleCreateOpenForm = useCallback(() => {
    showModal(translate('Section Create'), 'SECTION_CREATE_FORM');
  }, [translate]);

  const handleEditOpenForm = useCallback(
    (id) => {
      showModal(translate('Section Update'), 'SECTION_EDIT_FORM', id);
    },
    [translate]
  );

  const handleDeleteOpenForm = async (id) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('Do you want to delete this session?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, delete it!'),
      cancelButtonText: translate('Cancel'),
    });

    if (result.isConfirmed) {
      try {
        // const res = await deleteSubClass(id).unwrap();

        await Swal.fire({
          icon: 'success',
          title: translate('Successfully deleted!'),
          text: res?.message || translate('Session deleted successfully'),
          timer: 2000,
          showConfirmButton: false,
        });

        refetch(); // Refresh the data after deletion
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: translate('Error!'),
          text:
            err?.data?.error ||
            err?.data?.message ||
            translate('Error deleting session'),
        });
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-red-500">{translate('Failed to load session data')}</p>
    );

  const columns = [
    {
      title: translate('ID'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClassID}</p>,
    },
    {
      title: translate('Class ID'),
      field: 'ClassID',
      hozAlign: 'center',
      render: (row) => <p>{row.ClassID}</p>,
    },
    {
      title: translate('Sub Class'),
      field: 'SubClass',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClass}</p>,
    },
    {
      title: translate('English'),
      field: 'SubClassEng',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClassEng || '-'}</p>,
    },
    {
      title: translate('Arabic'),
      field: 'SubClassAra',
      hozAlign: 'center',
      render: (row) => <p>{row.SubClassAra || '-'}</p>,
    },
    {
      title: translate('Serial'),
      field: 'Serial',
      hozAlign: 'center',
      render: (row) => <p>{row.Serial}</p>,
    },
    {
      title: translate('Status'),
      field: 'Action',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <ToggleSwitch
            checked={row.Action === 1} // Assuming 1 = active, 2 = inactive
            onChange={(e) => handleStatusToggle(row, e.target.checked)}
          />
        </div>
      ),
    },
    {
      title: translate('Action'),
      field: 'SubClassID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center gap-3 items-center">
          <ViewPermission
            permissionId={permissionsDataList.sub_class}
            permissionType="edit"
          >
            <EditButton onClick={() => handleEditOpenForm(row.SubClassID)} />
          </ViewPermission>
          {/* <DeleteButton onClick={() => handleDeleteOpenForm(row.SubClassID)} /> */}
        </div>
      ),
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* 🔹 Header */}
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
        <h3 className="font-SolaimanLipi text-[20px] font-bold">
          {translate('Session')}
        </h3>
        <ViewPermission
          permissionId={permissionsDataList.sub_class}
          permissionType="insert"
        >
          <Button onClick={handleCreateOpenForm}>
            {translate('Create Session')}
          </Button>
        </ViewPermission>
      </div>

      {/* 🔹 Table */}
      {subClasses.length > 0 ? (
        <>
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />

          {/* 🔹 Pagination */}
          {totalPages > 1 && (
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <p className="text-center py-8 text-gray-500">
          {translate('No session data found')}
        </p>
      )}
    </div>
  );
};

export default Section;
