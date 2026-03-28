import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SortableTable from '../components/Tables/SortableTable';

import useTranslate from '../utils/Translate';

import { FormProvider, useForm } from 'react-hook-form';
import DefaultSearchInput from '../components/Forms/DefaultSearchInput';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { useGetOnlinePaymentInvoiceQuery } from '../features/payment/paymentSlice';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import OnlineStudentFeeReportPdf from '../view/accounting/student-fee-collection/OnlineStudentFeeReportPdf';
import Button from '../components/Button/Button';
import Swal from 'sweetalert2';

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
  const [ClassID, id, DateFrom, DateTo] = watch([
    'ClassID',
    'id',
    'DateFrom',
    'DateTo'
  ]);

  // Frontend Code
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDateFrom = DateFrom ? formatDateForAPI(DateFrom) : null;
  const formattedDateTo = DateTo ? formatDateForAPI(DateTo) : null;

  // সব সময় API call করুন
  const { data, isLoading, isError } = useGetOnlinePaymentInvoiceQuery({
    page,
    limit,
    search: searchValue,
    classId: ClassID,
    DateFrom: formattedDateFrom,
    DateTo: formattedDateTo,
  });

  console.log(formattedDateFrom, formattedDateTo, "check date");
  console.log(ClassID, "ClassID");
  console.log(data, "data")
  const invoices = data?.data ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages || 1; // ✅ dynamic total pages

  const { data: classListData } = useGetClassListQuery();


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
      title: translate('Class'),
      field: 'className',
      hozAlign: 'center',
      render: (row) => {
        const classData = row.UserFeeOrder?.Admission?.Class;

        return (
          <div>
            <p className="font-semibold text-sm">
              {classData?.ClassName || 'N/A'}
            </p>
          </div>
        );
      },
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
          {row?.InvoiceDetails?.[0]?.["InvoiceType"]?.trim() || "-"}
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


  const selectedData = [
    {
      id: 1,
      name: "ইউজার কোড বা ইউজার নাম"
    },
    {
      id: 2,
      name: "ক্লাস"
    },
    {
      id: 3,
      name: "তারিখ"
    }
  ];

  const habdlePrint = () => {
    if (!data?.data?.length) {
      Swal.fire({
        icon: "warning",
        title: "ডাটা পাওয়া যায়নি",
        text: "প্রিন্ট করার জন্য কোনো ডাটা নেই!",
        confirmButtonText: "ঠিক আছে",
      });
      return;
    }

    window.print();
  };
  return (
    <FormProvider {...method}>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg print:hidden">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate('Online Payment Invoice')}
            </h3>
            <Button onClick={habdlePrint}>প্রিন্ট</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-3">


            <DefaultSelect
              label={translate('Select filter option')}
              nameField="name"
              registerKey="id"
              valueField="id"
              options={selectedData ?? []}
              require={'This Field is required'}
            />
            {
              Number(id) === 1 && (
                <DefaultSearchInput
                  label={translate('UserCode/Name')}
                  registerKey="search"
                  placeholder="Enter user code or name..."
                  unicode
                />
              )
            }

            {
              Number(id) === 2 && (<DefaultSelect
                label={translate('Class')}
                nameField="ClassName"
                registerKey="ClassID"
                valueField="ClassID"
                options={classListData ?? []}
                require={'This Field is required'}
                unicode={true}
              />)}
            {
              Number(id) === 3 && (
                <>
                  <DatePickerOne
                    registerKey="DateFrom"
                    placeholder="তারিখ থেকে"
                    dateCalender="Date Start"
                  />
                  <DatePickerOne
                    registerKey="DateTo"
                    placeholder="তারিখ পর্যন্ত"
                    dateCalender="Date End"
                  />
                </>
              )}
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
      <div className="hidden print:block">
        <OnlineStudentFeeReportPdf reportData={data?.data} />
      </div>

    </FormProvider>
  );
};

export default OnlinePaymentInvoice;
