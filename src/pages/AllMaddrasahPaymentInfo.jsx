import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';

import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import DefaultInput from '../components/Forms/DefaultInput';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import SvgIcon from '../components/icons/SvgIcon';

import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteMaddrasahSSLMutation,
  useGetAllMaddrasahSSLInfoQuery,
} from '../features/payment/paymentSlice';

import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const AllMaddrasahPaymentInfo = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const method = useForm();
  const translate = useTranslate();

  /* ---------------- react-hook-form ---------------- */
  const { watch } = method;

  /* ---------------- API ---------------- */
  const {
    data: responseData = {},
    isLoading,
    isError,
  } = useGetAllMaddrasahSSLInfoQuery({
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const maddrasahData = responseData?.data || [];

  const [deleteMaddrasahInfo] = useDeleteMaddrasahSSLMutation();

  /* ---------------- State ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');

  /* ---------------- Page title ---------------- */
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  /* ---------------- 🔍 WATCH SEARCH ---------------- */
  const searchWatch = watch('Search');

  useEffect(() => {
    if (searchWatch !== undefined) {
      setSearchValue(searchWatch);
      setCurrentPage(1); // search করলে page reset
    }
  }, [searchWatch]);

  /* ---------------- FILTER DATA ---------------- */
  const filteredData = useMemo(() => {
    if (!searchValue) return maddrasahData;

    const search = searchValue.toLowerCase();

    return maddrasahData.filter((item) => {
      return (
        item.UserName?.toLowerCase().includes(search) ||
        item.InstituteName?.toLowerCase().includes(search) ||
        item.UserCode?.toString().includes(search) ||
        item.SchoolID?.toString().includes(search)
      );
    });
  }, [maddrasahData, searchValue]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = useCallback(
    async (schoolId) => {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action will permanently delete the SSL config.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteMaddrasahInfo(schoolId).unwrap();
            Swal.fire('Deleted!', 'SSL config deleted.', 'success');
          } catch {
            Swal.fire('Error!', 'Delete failed.', 'error');
          }
        }
      });
    },
    [deleteMaddrasahInfo]
  );

  /* ---------------- MODALS ---------------- */
  const handleOpenModal = useCallback(() => {
    showModal(translate('Create Payment Info'), 'CREATE_PAYMENT_INFO');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Edit Payment Info'), 'EDIT_PAYMENT_INFO', id);
    },
    [translate]
  );

  const handleViewOpenModal = useCallback(
    (id) => {
      showModal(translate('View Payment Info'), 'VIEW_PAYMENT_INFO', id);
    },
    [translate]
  );

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load SSL config data</p>;

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      title: translate('Action'),
      field: 'SchoolID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center gap-2">
          <DeleteButton onClick={() => handleDelete(row.SchoolID)} />
          <EditButton onClick={() => handleEditOpenModal(row.SchoolID)} />
          <button
            className="p-2 text-white bg-yellow-500 rounded-md"
            onClick={() => handleViewOpenModal(row.SchoolID)}
          >
            <SvgIcon name="FaEye" />
          </button>
        </div>
      ),
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
    },
    {
      title: translate('Maddrasah Name'),
      field: 'InstituteName',
      hozAlign: 'center',
    },
    {
      title: translate('Maddrasah ID'),
      field: 'SchoolID',
      hozAlign: 'center',
    },
    {
      title: translate('Store ID'),
      field: 'StoreID',
      width: 120,
      render: (row) => (
        <p className="w-28 mx-auto truncate text-center">{row.StoreID}</p>
      ),
    },
    {
      title: translate('Store Password'),
      field: 'StorePass',
      width: 120,
      render: (row) => (
        <p className="w-28 mx-auto truncate text-center font-mono bg-gray-100 p-1 rounded">
          {row.StorePass}
        </p>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  return (
    <FormProvider {...method}>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            {translate('Maddrasah Payment Info')}
          </h3>
          <Button onClick={handleOpenModal}>{translate('Create')}</Button>
        </div>

        {/* 🔍 SEARCH INPUT */}
        <div className="grid grid-cols-1 sm:grid-cols-6 mb-4">
          <DefaultInput
            label={'Search'}
            type={'text'}
            placeholder={'Search by User Code or User Name'}
            registerKey={'Search'}
          />
        </div>

        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />

        {filteredData.length > 0 && (
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </FormProvider>
  );
};

export default AllMaddrasahPaymentInfo;
