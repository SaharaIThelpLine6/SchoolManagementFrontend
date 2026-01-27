import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import Button from '../components/Button/Button';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';

import {
  useDeleteMaddrasahSSLMutation,
  useGetAllMaddrasahSSLInfoQuery,
} from '../features/payment/paymentSlice';
import useTranslate from '../utils/Translate';
import { showModal } from '../utils/ModalControlar';

const PAGE_SIZE = 10;

const AllMaddrasahPaymentInfo = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // Fetch all Maddrasah SSL config
  const {
    data: responseData = {},
    isLoading,
    isError,
  } = useGetAllMaddrasahSSLInfoQuery();
  console.log(responseData, 'responseData');

  // Extract the array data from response
  const maddrasahData = responseData?.data || [];

  // Delete mutation
  const [deleteMaddrasahInfo] = useDeleteMaddrasahSSLMutation();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(maddrasahData.length / PAGE_SIZE);

  // Paginate data with defensive check
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return maddrasahData.slice(start, start + PAGE_SIZE);
  }, [maddrasahData, currentPage]);

  // Delete handler
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
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteMaddrasahInfo(schoolId).unwrap();
            Swal.fire(
              'Deleted!',
              'The SSL config has been removed.',
              'success'
            );
          } catch (error) {
            Swal.fire('Error!', 'Failed to delete the SSL config.', 'error');
          }
        }
      });
    },
    [deleteMaddrasahInfo]
  );

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load SSL config data</p>;

  const handleOpenModal = useCallback(() => {
    showModal(translate('Create Payment Info'), 'CREATE_PAYMENT_INFO');
  }, [translate]);
  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Edit Payment Info'), 'EDIT_PAYMENT_INFO', id);
    },
    [translate]
  );

  // Table columns
  const columns = [
    {
      title: translate('Action'),
      field: 'SchoolID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.SchoolID)} />
          {/* <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.SchoolID)}
          >
            Delete
          </button> */}
        </div>
      ),
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => <p>{row.UserName}</p>,
    },
    {
      title: translate('Maddrasah Name'),
      field: 'InstituteName',
      hozAlign: 'center',
      render: (row) => <p>{row.InstituteName}</p>,
    },
    {
      title: translate('School ID'),
      field: 'SchoolID',
      hozAlign: 'center',
      render: (row) => <p>{row.SchoolID}</p>,
    },
    {
      title: translate('Store ID'),
      field: 'StoreID',
      // hozAlign: 'center',
      width: 100, // কলামের width সেট করুন
      formatter: 'textarea', // অথবা formatter ব্যবহার করুন
      render: (row) => (
        <div className="flex justify-center items-center ">
          <p className="w-24 text-center truncate">{row.StoreID}</p>
        </div>
      ),
    },
    {
      title: translate('Store Password'),
      field: 'StorePass',
      // hozAlign: 'center',
      width: 100, // কলামের width সেট করুন
      render: (row) => (
        <div className="flex justify-center items-center ">
          <p className="w-24 text-center truncate font-mono bg-gray-100 p-1 rounded">
            {row.StorePass}
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('All Maddrasah Payment Info')}
          </h3>
          <Button onClick={handleOpenModal}>{translate('Create')}</Button>
        </div>

        <SortableTable columns={columns} data={paginatedData} />

        {/* Pagination */}
        {maddrasahData.length > 0 && (
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AllMaddrasahPaymentInfo;
