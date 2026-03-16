import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SortableTable from '../components/Tables/SortableTable';

import useTranslate from '../utils/Translate';

import { FormProvider, useForm } from 'react-hook-form';
import DefaultSearchInput from '../components/Forms/DefaultSearchInput';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { useGetOnlinePaymentInvoiceQuery } from '../features/payment/paymentSlice';

const OnlinePaymentInvoice = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const method = useForm();
  const { watch } = method;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  // const [search, setSearch] = useState('');
  const searchValue = watch('search');
  const { data, isLoading, isError } = useGetOnlinePaymentInvoiceQuery({
    page,
    limit,
    search: searchValue,
  });
  console.log(data, "data")
  const invoices = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages || 1; // ✅ dynamic total pages

  // console.log(invoices, 'invoices');
  // console.log(pagination, 'pagination');

  const columnsVacationType = [
    {
      title: translate('ID'),
      field: 'id',
      hozAlign: 'center',
      render: (row, index) => <p>{index + 1}</p>,
    },
    {
      title: translate('Transaction ID'),
      field: 'transactionId',
      hozAlign: 'center',
      render: (row) => <p>{row.TransactionID}</p>,
    },
    {
      title: translate('Student'),
      field: 'userName',
      hozAlign: 'center',
      render: (row) => (
        <div>
          <p className="font-semibold text-sm">{row.UserDetails?.UserName}</p>{' '}
          <p className="text-xs text-gray-500">
            {translate('Code')}: {row.UserDetails?.UserCode}
          </p>
          <p className="text-xs text-gray-500">{row.UserDetails?.Mobile1}</p>
          <p className="text-xs text-gray-500">{row.UserDetails?.Email}</p>
        </div>
      ),
    },
    {
      title: translate('Invoice Details'),
      field: 'MonthName',
      hozAlign: 'left',
      render: (row) => (
        <div className="text-sm space-y-1 flex flex-col justify-center items-center">
          {row.InvoiceDetails?.map((d, index) => (
            <p key={index}>
              {d.FeeType} ({d.SessionName} - {d.MonthName}) :{' '}
              <span className="font-semibold ml-1 text-green-600">
                ৳{d.Amount}
              </span>
            </p>
          ))}
        </div>
      ),
    },
    {
      title: translate('Total Amount'),
      field: 'TotalAmount',
      hozAlign: 'center',
      render: (row) => (
        <span className="font-semibold text-green-600">৳{row.TotalAmount}</span>
      ),
    },
    {
      title: translate('Invoice Type'),
      field: 'InvoiceType',
      hozAlign: 'center',
      render: (row) => (
        <span className="font-semibold">
          {row?.InvoiceDetails?.[0]?.["InvoiceType "]?.trim() || "-"}
        </span>
      ),
    },
    {
      title: translate('Status'),
      field: 'PaymentStatus',
      hozAlign: 'center',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${row.PaymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
        >
          {row.PaymentStatus}
        </span>
      ),
    },
    {
      title: translate('Date'),
      field: 'CreatedAt',
      hozAlign: 'center',
      render: (row) => (
        <span>{new Date(row.CreatedAt).toLocaleDateString()}</span>
      ),
    },
  ];
  return (
    <FormProvider {...method}>
      <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate('Online Payment Invoice')}
            </h3>
          </div>
          <div className="grid grid-cols-8 py-3">
            <DefaultSearchInput
              label={translate('Search UserCode')}
              registerKey="search"
              placeholder="Search..."
              unicode
            />
          </div>
          <SortableTable
            columns={columnsVacationType}
            data={invoices}
            isFilterColumn={false}
          />

          {/* Pagination Controls */}
          <DefaultPagination
            currentPage={page}
            totalPages={totalPages} // ✅ now dynamic
            onPageChange={setPage}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default OnlinePaymentInvoice;
