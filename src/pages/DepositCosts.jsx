import { useCallback, useEffect, useMemo, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { permissionsDataList } from '../Data/permissions';
import { ViewPermission } from '../Routes/ViewPermission';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import DepositCostReport from '../components/Document/DepositCostReport';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import SvgIcon from '../components/icons/SvgIcon';
import { setPageName } from '../features/auth/authSlice';
import {
  useDeleteInComeExpenseMutation,
  useGetAllSubLedgerQuery,
  useGetChartOFAccountQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersByFundAndCaidsQuery,
  useGetGLedgersQuery,
  useGetIncomeExpenseReportByOrderIdQuery,
  useGetPaymentTypeQuery,
  useGetReceiptNumberQuery,
  useGetSubLedgerQuery,
  useGetTransactionOrdersQuery,
  usePostInComeExpenseMutation,
  useUpdateInComeExpenseMutation,
} from '../features/feeCollection/feeCollectionSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const DepositCosts = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: {
      TransactionDateEng: new Date(), // today
    },
  });
  const { watch, handleSubmit, setValue } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [defaultData, setDefaultData] = useState([]);
  const [editIdDefaultData, setEditIdDefaultData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [reportOrderID, setReportOrderID] = useState(null);

  const [
    CAID,
    ledgerGLID,
    paymentGLID,
    Amount,
    FundID,
    VoucherNo,
    BookNo,
    TransactionDateEng,
    TransactionBanglaDate,
    LParticulars,
    LSLID,
  ] = watch([
    'CAID',
    'ledgerGLID',
    'paymentGLID',
    'Amount',
    'FundID',
    'VoucherNo',
    'BookNo',
    'TransactionDateEng',
    'TransactionBanglaDate',
    'LParticulars',
    'LSLID',
  ]);

  const { data: fundNamesData } = useGetFundNamesQuery();
  const { data: gldgersData = [] } = useGetGLedgersQuery();
  const { data: allLedgersData = [] } = useGetAllSubLedgerQuery();

  const { data: generalLedgersData, refetch: refetchGLData } =
    useGetGeneralLedgersByFundAndCaidsQuery(
      { fundId: FundID, caId: CAID },
      {
        skip: !FundID || !CAID,
      }
    );
  const { data: gSLData } = useGetSubLedgerQuery(ledgerGLID, {
    skip: !ledgerGLID,
  });

  const { data: pgSLData } = useGetSubLedgerQuery(paymentGLID, {
    skip: !paymentGLID,
  });

  const { data: receiptNumber, isSuccess } = useGetReceiptNumberQuery(
    {
      fundid: FundID,
      caid: CAID,
    },
    {
      skip: !FundID || !CAID,
    }
  );

  const { data: paymentTypesData } = useGetPaymentTypeQuery();
  const { data: chartOfAccountData } = useGetChartOFAccountQuery();
  const {
    data: transactionOrdersData,
    isLoading,
    isError,
    refetch,
  } = useGetTransactionOrdersQuery({ id: CAID }, { skip: !CAID });
  const {
    data: transactionOrdersReportData,
    loading: isTransactionOrdersReportDataLoading,
    isError: isTransactionOrdersReportDataError,
    refetch: refetchTransactionOrdersReportData,
  } = useGetIncomeExpenseReportByOrderIdQuery(
    { orderid: reportOrderID },
    { skip: !reportOrderID }
  );

  // useEffect(() => {
  //   if (!isTransactionOrdersReportDataLoading && transactionOrdersReportData) {
  //     setTimeout(() => {
  //       window.print();
  //       setReportOrderID(null);
  //     }, 300);
  //   }
  // }, [isTransactionOrdersReportDataLoading, transactionOrdersReportData]);

  const [postInComeExpense] = usePostInComeExpenseMutation();
  const [updateInComeExpense] = useUpdateInComeExpenseMutation();
  const [deleteInComeExpense] = useDeleteInComeExpenseMutation();

  const totalPages = Math.ceil(
    (transactionOrdersData?.length || 0) / PAGE_SIZE
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return transactionOrdersData?.slice(start, start + PAGE_SIZE) || [];
  }, [transactionOrdersData, currentPage]);

  // Set default value when receiptNumber changes
  useEffect(() => {
    if (isSuccess && receiptNumber) {
      setValue('VoucherNo', receiptNumber.receipt_num);
    }
  }, [isSuccess, receiptNumber, setValue]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Update Handle
  const handleEdit = (orderId) => {
    setEditId(orderId);

    // Find the selected order
    const selectedOrder = transactionOrdersData?.find(
      (item) => item.OrderID === orderId
    );

    if (!selectedOrder) return;

    // Set main transaction data
    setValue('FundID', selectedOrder.FundID);
    setValue('VoucherNo', selectedOrder.VoucherNo);
    setValue('BookNo', selectedOrder.BookNo);
    setValue('TransactionDateEng', selectedOrder.TransactionDateEng);
    setValue('TransactionBanglaDate', selectedOrder.TransactionBanglaDate);
    setValue(
      'LParticulars',
      selectedOrder.AccBankTransaction?.Particulars || ''
    );

    // Safely handle GL data
    const targetStr = selectedOrder.AccBankTransaction?.SLID?.toString() || '';
    const match = gldgersData?.find((i) =>
      targetStr.startsWith(i?.GLID?.toString() || '')
    );

    if (match) {
      setValue('paymentGLID', match.GLID);
    }
    setTimeout(() => {
      setValue('LSLID', selectedOrder.AccBankTransaction?.SLID || '');
    }, 500);

    setDefaultData(selectedOrder.AccTransactionDetails || []);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate('All Funds'), 'OPEN_FUND');
  }, [translate]);

  const handleSettingsModal = useCallback(() => {
    showModal(
      translate('Accounting Report Settings'),
      'OPEN_ACC_REPORT_SETTINGS'
    );
  }, [translate]);

  const handleGeneralOpenModal = useCallback(() => {
    showModal(translate('Generals'), 'OPEN_GENERAL');
  }, [translate]);

  const handleBankInformationModal = useCallback(() => {
    showModal(translate('Bank Information'), 'OPEN_BANK_INFO');
  }, [translate]);

  const handleTodaysBalanceModal = useCallback(() => {
    showModal(translate('Todays Balance'), 'OPEN_TODAYS_BALANCE');
  }, [translate]);

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    try {
      const payload = {
        SLID: data.SLID,
        Particulars: data.Particulars,
        Amount: data.Amount,
        SL: editIdDefaultData ? editIdDefaultData : 1 + defaultData.length,
      };

      if (editIdDefaultData) {
        console.log(payload, 'payload edit data');
        setDefaultData((prev) =>
          prev.map((item) => (item.SL === editIdDefaultData ? payload : item))
        );
        setEditIdDefaultData(null);
      } else {
        setDefaultData((prev) => {
          const exists = prev.some((item) => item.SLID === payload.SLID);
          if (exists) {
            Swal.fire({
              icon: 'error',
              title: 'Duplicate Entry',
              text: `SLID ${payload.SLID} already exists!`,
            });
            return prev; // prevent insertion
          }
          return [...prev, payload];
        });
      }

      Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: 'Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।',
      }).then(() => {
        methods.reset({
          ...methods.getValues(),
          Particulars: '',
          Amount: '',
        });
      });
    } catch (error) {
      const errMsg = error?.data?.message || 'অজানা একটি ত্রুটি ঘটেছে।';
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: errMsg,
      });
      console.error('Exam Fee Setting Error:', error);
    }
  };

  // Delete function
  const handleDeleteDefaultData = (id) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই ডেটা মুছে ফেলা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'না, বাতিল করুন',
    }).then((result) => {
      if (result.isConfirmed) {
        setDefaultData((prev) => prev.filter((item) => item.SL !== id));
        Swal.fire(
          'মুছে ফেলা হয়েছে!',
          'ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
          'success'
        );
      }
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'এই ডেটা মুছে ফেলা হবে!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
      cancelButtonText: 'না, বাতিল করুন',
    });

    if (result.isConfirmed) {
      try {
        await deleteInComeExpense(id).unwrap();
        Swal.fire(
          'মুছে ফেলা হয়েছে!',
          'ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
          'success'
        );
        refetch();
        refetchGLData();
      } catch (error) {
        Swal.fire(
          'ত্রুটি!',
          'ডেটা মুছে ফেলা যায়নি। আবার চেষ্টা করুন।',
          'error'
        );
        console.error('Delete Error:', error);
      }
    }
  };

  // Edit function
  const handleEditOpenModalDefaultData = (id) => {
    const existing = defaultData.find((item) => item.SL === id);

    // existing null/undefined না হলে compare করা যাবে
    const match = allLedgersData?.find((i) =>
      existing?.SLID?.toString().startsWith(i?.GLID?.toString() || '')
    );

    if (existing) {
      setEditIdDefaultData(id);

      methods.reset({
        ...methods.getValues(),
        Particulars: existing.Particulars,
        Amount: existing.Amount,
      });

      setValue('ledgerGLID', match.GLID);
      setTimeout(() => {
        setValue('SLID', existing.SLID);
      }, 500);
    }
  };

  const handlePrint = async (id) => {
    setReportOrderID(id);
  };

  useEffect(() => {
    if (
      !isTransactionOrdersReportDataLoading &&
      transactionOrdersReportData &&
      transactionOrdersReportData.length > 0
    ) {
      setTimeout(() => {
        window.print();
        setReportOrderID(9999999);
      }, 300);
    }
  }, [isTransactionOrdersReportDataLoading, transactionOrdersReportData]);

  // Table Data Columns
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.income_expense}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEdit(row.OrderID)} />
          </ViewPermission>
          {/* <DeleteButton onClick={() => handleDelete(row.OrderID)} /> */}
          <button
            className="p-2 flex justify-center items-center text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
            onClick={() => handlePrint(row.OrderID)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-printer"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" />
              <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
              <path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" />
            </svg>
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={'GrDrag'} size={16} />
        </div>
      ),
      hozAlign: 'center',
      render: (row) => <>{row.SL}</>,
    },
    {
      title: translate('Order'),
      hozAlign: 'center',
      render: (row) => <>{row.OrderID}</>,
    },
    {
      title: translate('Voucher/Bill'),
      hozAlign: 'center',
      render: (row) => <>{row.VoucherNo}</>,
    },
    {
      title: translate('Book No'),
      hozAlign: 'center',
      render: (row) => <>{row.BookNo}</>,
    },
    {
      title: translate('Date'),
      hozAlign: 'center',
      render: (row) => <>{row.TransactionDateEng}</>,
    },
  ];

  const defaultColumns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModalDefaultData(row.SL)} />
          {!editId && (
            <DeleteButton onClick={() => handleDeleteDefaultData(row.SL)} />
          )}
          prinrt
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={'GrDrag'} size={16} />
        </div>
      ),
      hozAlign: 'center',
      render: (row) => <>{row?.SL}</>,
    },
    {
      title: translate('SLID'),
      hozAlign: 'center',
      render: (row) => <>{row?.SLID}</>,
    },
    {
      title: translate('Particulars'),
      hozAlign: 'center',
      render: (row) => <>{row?.Particulars}</>,
    },
    {
      title: translate('Amount'),
      hozAlign: 'center',
      render: (row) => <>{row?.Amount}</>,
    },
  ];

  const handleSubmitButton = async () => {
    try {
      const payload = {
        FundID,
        CAID: CAID,
        VoucherNo: VoucherNo || 1,
        BookNo,
        LParticulars,
        LSLID,
        TransactionDateEng: Array.isArray(TransactionDateEng)
          ? TransactionDateEng[0]
          : TransactionDateEng,
        TransactionBanglaDate: Array.isArray(TransactionBanglaDate)
          ? TransactionBanglaDate[0]
          : TransactionBanglaDate,
        gledger: defaultData,
      };
      console.log(payload);

      if (editId) {
        console.log(payload, 'payload edit data');
        await updateInComeExpense({ id: editId, data: payload }).unwrap();
      } else {
        await postInComeExpense(payload).unwrap();
      }

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Data submitted successfully!',
        timer: 2000,
        showConfirmButton: false,
      });

      refetch();
      methods.reset({
        FundID: '',
        VoucherNo: methods.getValues('VoucherNo'),
        BookNo: '',
        TransactionDateEng: '',
        TransactionBanglaDate: '',
        CAID: methods.getValues('CAID'),
        gledger: [],
      });
      setDefaultData([]);
    } catch (error) {
      console.error('Submission Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit data. Please try again.',
      });
    }
  };

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center hidden_in_print">
        <div className="flex items-center gap-2">
          <h3 className="text-lg md:text-xl font-bold">
            {translate('Accounting')}
          </h3>
          <button
            type="button"
            className="flex items-center justify-center transition-colors duration-150 text-blue-600"
            onClick={handleSettingsModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-settings text-dark"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
              <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
            </svg>
          </button>
        </div>
        <button type="button" onClick={handleTodaysBalanceModal}>
          <h3 className="text-[18px] text-info underline">আজকের তহবিল </h3>
        </button>
      </div>

      <FormProvider {...methods}>
        <form
          className="w-full hidden_in_print"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input type="hidden" {...methods.register('ID')} />

          {/* Top Section - 4 responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <DefaultSelect
                  label="Fund"
                  options={fundNamesData ?? []}
                  valueField="FundID"
                  nameField="FundName"
                  registerKey="FundID"
                  unicode={true}
                  require={'Fund is required!'}
                />
              </div>
              <Button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white
               hover:bg-[#0066cc] transition-colors duration-150"
                onClick={handleOpenModal}
              >
                <SvgIcon name="FaPlus" size={16} />
              </Button>{' '}
            </div>
            <DefaultSelect
              label="Deposit/Cost"
              options={chartOfAccountData ?? []}
              valueField="CAID"
              nameField="ChartOfAcName"
              registerKey="CAID"
              unicode={true}
              require={'Deposit/Cost is required!'}
            />
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <DefaultSelect
                  label="General Ledger"
                  options={generalLedgersData ?? []}
                  valueField="GLID"
                  nameField="GlName"
                  registerKey="ledgerGLID"
                  unicode={true}
                  require={'General Ledger is required!'}
                />
              </div>

              <Button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white
               hover:bg-[#0066cc] transition-colors duration-150"
                onClick={handleGeneralOpenModal}
              >
                <SvgIcon name="FaPlus" size={16} />
              </Button>
            </div>
            <DefaultSelect
              label="Sectors"
              options={gSLData ?? []}
              valueField="SLID"
              nameField="SlName"
              registerKey="SLID"
              unicode={true}
              require={'Sectors is required!'}
            />

            <DefaultInput
              label="Voucher/Bill"
              type="text"
              registerKey={'VoucherNo'}
              disable
            />
            <DefaultInput
              label="Ledger No"
              type="number"
              registerKey={'BookNo'}
              placeholder={translate('Enter Book Id ...')}
            />
            <DefaultInput
              label="Description"
              placeholder={translate('Enter description')}
              registerKey="Particulars"
            />
            <DefaultInput
              label="Amount"
              type="text"
              registerKey={'Amount'}
              placeholder={translate('Enter Amount number ...')}
              require={'Book is required!'}
            />
            <div>
              <label
                htmlFor={'TransactionDateEng'}
                className={`text-black font-SolaimanLipi w-1/4 min-w-[100px] mb-0 text-end`}
              >
                {translate('English Date')} :
              </label>
              {/* Date Picker */}
              <div className="w-full">
                <Controller
                  name="TransactionDateEng"
                  control={methods.control}
                  rules={{ required: false }}
                  render={({ field }) => (
                    <Flatpickr
                      options={{
                        dateFormat: 'Y-m-d',
                      }}
                      className="w-full rounded border-[1.5px] border-stroke bg-white py-1 px-4 text-black outline-none transition
                        focus:border-custom-focus active:border-custom-focus
                        disabled:cursor-not-allowed disabled:bg-slate-200 h-[38px]"
                      value={field.value} // important!
                      onChange={(date) => field.onChange(date[0])} // flatpickr gives array
                    />
                  )}
                />
                {methods.formState.errors?.TransactionDateEng && (
                  <span className="text-red-500 text-sm mt-1">
                    {methods.formState.errors.TransactionDateEng.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-end gap-3 flex-1">
              <DefaultInput
                label="Payment Comments"
                placeholder={translate('Enter comments')}
                registerKey="LParticulars"
              />
              <Button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#007af7] text-white hover:bg-[#0066cc] transition-colors duration-150"
                onClick={handleBankInformationModal}
              >
                <SvgIcon name="FaPlus" size={16} />
              </Button>
            </div>
            <div className="hidden sm:block"></div>
            <div className="hidden sm:block"></div>
            <div className="hidden sm:block"></div>
            <DefaultSelect
              label="Payment System"
              nameField={'GlName'}
              registerKey="paymentGLID"
              valueField={'GLID'}
              options={paymentTypesData ?? []}
              type={'number'}
              require={'Payment System is required!'}
              unicode={true}
            />
            <DefaultSelect
              label={'Account'}
              nameField={'SlName'}
              registerKey={'LSLID'}
              valueField={'SLID'}
              options={pgSLData ?? []}
              type={'number'}
              require={'Account is required!'}
              unicode={true}
            />
            <div className="flex items-center justify-start w-full pt-6">
              <Button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {translate('Add')}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="my-5 hidden_in_print">
        {defaultData && defaultData.length > 0 && (
          <SortableTable
            columns={defaultColumns}
            data={defaultData}
            isFilterColumn={false}
          />
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 px-4 bg-white hidden_in_print">
        <ViewPermission
          permissionId={permissionsDataList.income_expense}
          permissionType="insert"
        >
          <Button
            type="button"
            onClick={handleSubmitButton}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {translate('Submit')}
          </Button>
        </ViewPermission>
      </div>

      {/* Table Section */}
      <div className="mt-5 hidden_in_print">
        {/* Loading State */}
        {isLoading && <Loading />}

        {/* Error State */}
        {isError && (
          <div className="text-red-500 text-center py-4">
            {translate('Failed to load exam fee settings. Please try again.')}
          </div>
        )}

        {/* Success State - Only shows when data exists */}
        {!isLoading && !isError && paginatedData?.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <SortableTable
                columns={columns}
                data={paginatedData}
                isFilterColumn={false}
              />
            </div>

            {/* Pagination - Only shows when data exists */}
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Empty State - When no data exists */}
        {!isLoading &&
          !isError &&
          (!paginatedData || paginatedData.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              {translate('No data found.')}
            </div>
          )}
      </div>
      {transactionOrdersReportData && transactionOrdersReportData.length > 0 ? (
        <DepositCostReport orderDetails={transactionOrdersReportData} />
      ) : null}
    </div>
  );
};

export default DepositCosts;
