import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import Loading from '../../../components/Loading/Loading';
import DefaultPagination from '../../../components/Pagination/DefaultPagination';
import SortableTable from '../../../components/Tables/SortableTable';

import { setPageName } from '../../../features/auth/authSlice';
import { useGetAllMaddrasahPaymentsQuery } from '../../../features/Admin/adminPaymentSlice';
import useTranslate from '../../../utils/Translate';

const PAGE_SIZE = 20;

const AdminAllMaddrasahPaymentHistory = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const method = useForm();
  const translate = useTranslate();

  /* ---------------- State ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [statusValue, setStatusValue] = useState('');
  const [intentValue, setIntentValue] = useState('');

  /* ---------------- react-hook-form ---------------- */
  const { watch, register } = method;
  const searchWatch = watch('Search');
  const statusWatch = watch('Status');
  const intentWatch = watch('Intent');

  /* ---------------- Page title ---------------- */
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  /* ---------------- 🔍 WATCH FILTERS ---------------- */
  useEffect(() => {
    if (searchWatch !== undefined) {
      setSearchValue(searchWatch);
      setCurrentPage(1); // reset to page 1 on search
    }
  }, [searchWatch]);

  useEffect(() => {
    if (statusWatch !== undefined) {
      setStatusValue(statusWatch);
      setCurrentPage(1); // reset to page 1 on filter
    }
  }, [statusWatch]);

  useEffect(() => {
    if (intentWatch !== undefined) {
      setIntentValue(intentWatch);
      setCurrentPage(1); // reset to page 1 on filter
    }
  }, [intentWatch]);

  /* ---------------- API ---------------- */
  const {
    data: responseData = {},
    isLoading,
    isFetching,
    isError,
  } = useGetAllMaddrasahPaymentsQuery({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchValue,
    status: statusValue,
    intentId: intentValue,
  }, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const paymentsData = responseData?.data || [];
  const paginationInfo = responseData?.pagination || { totalPages: 1 };

  /* ---------------- FILTER OUT PENDING RECORDS (কোনো কোড বাদ না দিয়ে) ---------------- */
  const filteredPaymentsData = paymentsData.filter(item => item.TransactionStatus !== 'Pending');

  /* ---------------- HELPERS ---------------- */
  const getIntentName = (intentId) => {
    const intents = { 1: 'Renew', 2: 'Quota', 3: 'SMS' };
    return intents[intentId] || intentId || 'Unknown';
  };

  // ✅ Date only format: DD/MM/YYYY (no time)
  const formatDateOnly = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // fallback to raw value
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  // 🔴 Update: added .toUpperCase() to match the ALL CAPS header style from image
  const columns = [
    {
      title: translate('Invoice / Trx ID').toUpperCase(),
      field: 'InvoiceNumber',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 text-base">{row.InvoiceNumber || 'N/A'}</div>
          <div className="text-gray-500 text-sm">Trx: {row.TransactionID || 'N/A'}</div>
          <div className="text-gray-500 text-sm">PayID: {row.PaymentID || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: translate('User ID / Payer').toUpperCase(),
      field: 'UserID',
      render: (row) => (
        <div>
          <div className="font-medium text-base">User: {row.UserID}</div>
          <div className="text-gray-500 text-sm">Acc: {row.PayerAccount || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: translate('Amount').toUpperCase(),
      field: 'PayAmount',
      hozAlign: 'center',
      render: (row) => <div className="font-semibold text-gray-900 text-base">৳ {row.PayAmount}</div>,
    },
    {
      title: translate('Intent / Size').toUpperCase(),
      field: 'IntentID',
      hozAlign: 'center',
      render: (row) => (
        <div>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded font-medium inline-block mb-1">
            {getIntentName(row.IntentID)}
          </span>
          <div className="text-gray-500 text-sm">Size: {row.size || 0}</div>
        </div>
      ),
    },
    {
      title: translate('Status').toUpperCase(),
      field: 'TransactionStatus',
      hozAlign: 'center',
      render: (row) => (
        <span
          className={`px-2 py-1 text-sm font-semibold rounded-full ${
            row.TransactionStatus === 'Completed'
              ? 'bg-green-100 text-green-800'
              : row.TransactionStatus === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {row.TransactionStatus || 'Unknown'}
        </span>
      ),
    },
    {
      title: translate('Time').toUpperCase(),
      field: 'CreateBanglaDateTime',
      render: (row) => (
        <div>
          <div className="text-sm text-gray-700 whitespace-nowrap">
            {formatDateOnly(row.CreateBanglaDateTime || row.CreateAt)}
          </div>
        </div>
      ),
    },
    {
      title: translate('Description').toUpperCase(),
      field: 'Description',
      render: (row) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={row.Description}>
          {row.Description || 'No description'}
        </div>
      ),
    },
  ];

  /* ---------------- RENDER ---------------- */
  if (isError) return <p className="text-red-500 p-6 text-base">{translate('Failed to load payment history data')}</p>;

  return (
    <FormProvider {...method}>
      {/* 🔴 Update: Added font-sans to wrapper to ensure modern sans-serif everywhere */}
      <div className="bg-white p-6 rounded-xl shadow-lg min-h-screen relative font-sans">
        {(isLoading || isFetching) && (
          <div className="absolute inset-0 bg-white/50 z-50 flex justify-center items-center rounded-xl">
             <Loading />
          </div>
        )}

        {/* 📌 STICKY HEADER & FILTERS SECTION (Fixed on Scroll) */}
        <div className="sticky top-0 z-30 bg-white pt-2 pb-4">
          
          {/* Header Title (🔴 Changed font-serif to font-sans) */}
          <div className="mb-4">
            <h3 className="font-bold text-3xl text-slate-800 font-sans">
              {translate('Maddrasah Payment History')}
            </h3>
          </div>

          {/* 🔍 Filter Box Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F8F9FA] p-5 rounded-lg border border-gray-200">
            
            {/* Search Input */}
            <div className="flex flex-col">
              <label className="text-base font-medium text-gray-800 mb-2">
                {translate('Search')} :
              </label>
              <input
                type="text"
                {...register('Search')}
                placeholder={translate('Payment ID, Trx ID, Invoice...')}
                className="w-full border border-gray-300 rounded-md p-2.5 text-base font-sans focus:ring-blue-500 focus:border-blue-500 outline-none bg-white placeholder-gray-400"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-base font-medium text-gray-800 mb-2">
                 {translate('Status')}
              </label>
              <select
                {...register('Status')}
                className="w-full border border-gray-300 rounded-md p-2.5 text-base font-sans focus:ring-blue-500 focus:border-blue-500 outline-none bg-[#EAECEF]"
              >
                <option value="">{translate('All Statuses')}</option>
                <option value="Completed">{translate('Completed')}</option>
                <option value="Pending">{translate('Pending')}</option>
                <option value="Failed">{translate('Failed')}</option>
                <option value="Cancelled">{translate('Cancelled')}</option>
              </select>
            </div>

            {/* Intent Dropdown */}
            <div className="flex flex-col">
              <label className="text-base font-medium text-gray-800 mb-2">
                 {translate('Intent')}
              </label>
              <select
                {...register('Intent')}
                className="w-full border border-gray-300 rounded-md p-2.5 text-base font-sans focus:ring-blue-500 focus:border-blue-500 outline-none bg-[#EAECEF]"
              >
                <option value="">{translate('All Intents')}</option>
                <option value="1">{translate('Renew (1)')}</option>
                <option value="2">{translate('Quota (2)')}</option>
                <option value="3">{translate('SMS (3)')}</option>
              </select>
            </div>

          </div>
        </div>

        {/* 📊 TABLE SECTION */}
        <div className="mt-2">
          <SortableTable
            columns={columns}
            data={filteredPaymentsData}
            isFilterColumn={false}
          />
        </div>

        {/* 📄 PAGINATION */}
        {!isLoading && filteredPaymentsData.length > 0 && (
          <div className="mt-4">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={paginationInfo.totalPages || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>
    </FormProvider>
  );
};

export default AdminAllMaddrasahPaymentHistory;
