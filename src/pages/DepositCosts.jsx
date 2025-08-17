import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";
import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import {
  useDeleteInComeExpenseMutation,
  useGetChartOFAccountQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersQuery,
  useGetGLedgersQuery,
  useGetPaymentTypeQuery,
  useGetReceiptNumberQuery,
  useGetSubLedgerQuery,
  useGetTransactionOrdersQuery,
  usePostInComeExpenseMutation,
  useUpdateInComeExpenseMutation,
} from "../features/feeCollection/feeCollectionSlice";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import BanglaDatePicker from "../components/Forms/DatePicker/BanglaDatePicker";
import EditButton from "../components/Button/EditButton";
import DeleteButton from "../components/Button/DeleteButton";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import SvgIcon from "../components/icons/SvgIcon";

const PAGE_SIZE = 10;

const DepositCosts = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit, setValue } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [defaultData, setDefaultData] = useState([]);
  const [editIdDefaultData, setEditIdDefaultData] = useState(null);
  const [editId, setEditId] = useState(null);

  console.log(defaultData, "defaultData");

  const [
    caID,
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
    "CAID",
    "ledgerGLID",
    "paymentGLID",
    "Amount",
    "FundID",
    "VoucherNo",
    "BookNo",
    "TransactionDateEng",
    "TransactionBanglaDate",
    "LParticulars",
    "LSLID",
  ]);

  const { data: fundNamesData } = useGetFundNamesQuery();
  const { data: gldgersData = [] } = useGetGLedgersQuery(); // Provide default empty array
  const { data: generalLedgersData } = useGetGeneralLedgersQuery(caID, {
    skip: !caID,
  });

  const { data: gSLData } = useGetSubLedgerQuery(ledgerGLID, {
    skip: !ledgerGLID,
  });

  const { data: pgSLData } = useGetSubLedgerQuery(paymentGLID, {
    skip: !paymentGLID,
  });

  const { data: receiptNumber, isSuccess } = useGetReceiptNumberQuery(
    {
      fundid: FundID,
      caid: caID,
    },
    {
      skip: !FundID || !caID,
    }
  );

  const { data: paymentTypesData } = useGetPaymentTypeQuery();
  const { data: chartOfAccountData } = useGetChartOFAccountQuery();
  const {
    data: transactionOrdersData,
    isLoading,
    isError,
    refetch,
  } = useGetTransactionOrdersQuery();

  console.log(transactionOrdersData, "transactionOrdersData");

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
      setValue("VoucherNo", receiptNumber.receipt_num);
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
    setValue("FundID", selectedOrder.FundID);
    setValue("VoucherNo", selectedOrder.VoucherNo);
    setValue("BookNo", selectedOrder.BookNo);
    setValue("TransactionDateEng", selectedOrder.TransactionDateEng);
    setValue("TransactionBanglaDate", selectedOrder.TransactionBanglaDate);
    setValue(
      "LParticulars",
      selectedOrder.AccBankTransaction?.Particulars || ""
    );

    // Safely handle GL data
    const targetStr = selectedOrder.AccBankTransaction?.SLID?.toString() || "";
    const match = gldgersData?.find((i) =>
      targetStr.startsWith(i?.GLID?.toString() || "")
    );

    if (match) {
      setValue("paymentGLID", match.GLID);
    }
    setTimeout(() => {
      setValue("LSLID", selectedOrder.AccBankTransaction?.SLID || "");
    }, 500);

    setDefaultData(selectedOrder.AccTransactionDetails || []);
  };

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
        setDefaultData((prev) =>
          prev.map((item) => (item.SL === editIdDefaultData ? payload : item))
        );
        setEditIdDefaultData(null);
      } else {
        setDefaultData((prev) => [...prev, payload]);
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        methods.reset({
          ...methods.getValues(),
          Particulars: "",
          Amount: "",
        });
      });
    } catch (error) {
      const errMsg = error?.data?.message || "অজানা একটি ত্রুটি ঘটেছে।";
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: errMsg,
      });
      console.error("Exam Fee Setting Error:", error);
    }
  };

  // Delete function
  const handleDeleteDefaultData = (id) => {
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই ডেটা মুছে ফেলা হবে!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
      cancelButtonText: "না, বাতিল করুন",
    }).then((result) => {
      if (result.isConfirmed) {
        setDefaultData((prev) => prev.filter((item) => item.SL !== id));
        Swal.fire(
          "মুছে ফেলা হয়েছে!",
          "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
          "success"
        );
      }
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "এই ডেটা মুছে ফেলা হবে!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন",
      cancelButtonText: "না, বাতিল করুন",
    });

    if (result.isConfirmed) {
      try {
        await deleteInComeExpense(id).unwrap();
        Swal.fire(
          "মুছে ফেলা হয়েছে!",
          "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
          "success"
        );
        refetch();
      } catch (error) {
        Swal.fire(
          "ত্রুটি!",
          "ডেটা মুছে ফেলা যায়নি। আবার চেষ্টা করুন।",
          "error"
        );
        console.error("Delete Error:", error);
      }
    }
  };

  // Edit function
  const handleEditOpenModalDefaultData = (id) => {
    const existing = defaultData.find((item) => item.SL === id);
    if (existing) {
      setEditIdDefaultData(id);
      methods.reset({
        ...methods.getValues(),
        Particulars: existing.Particulars,
        Amount: existing.Amount,
      });
    }
  };

  // Table Data Columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEdit(row.OrderID)} />
          <DeleteButton onClick={() => handleDelete(row.OrderID)} />
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={"GrDrag"} size={16} />
        </div>
      ),
      hozAlign: "center",
      render: (row) => <>{row.SL}</>,
    },
    {
      title: translate("Order"),
      hozAlign: "center",
      render: (row) => <>{row.OrderID}</>,
    },
    {
      title: translate("Voucher/Bill"),
      hozAlign: "center",
      render: (row) => <>{row.VoucherNo}</>,
    },
    {
      title: translate("Book No"),
      hozAlign: "center",
      render: (row) => <>{row.BookNo}</>,
    },
    {
      title: translate("Date"),
      hozAlign: "center",
      render: (row) => <>{row.TransactionDateEng}</>,
    },
  ];

  const defaultColumns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModalDefaultData(row.SL)} />
          <DeleteButton onClick={() => handleDeleteDefaultData(row.SL)} />
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={"GrDrag"} size={16} />
        </div>
      ),
      hozAlign: "center",
      render: (row) => <>{row?.SL}</>,
    },
    {
      title: translate("SLID"),
      hozAlign: "center",
      render: (row) => <>{row?.SLID}</>,
    },
    {
      title: translate("Particulars"),
      hozAlign: "center",
      render: (row) => <>{row?.Particulars}</>,
    },
    {
      title: translate("Amount"),
      hozAlign: "center",
      render: (row) => <>{row?.Amount}</>,
    },
  ];

  const handleSubmitButton = async () => {
    try {
      const payload = {
        FundID,
        CAID: caID,
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

      if (editId) {
        console.log(payload, "payload edit data")
        await updateInComeExpense({ id: editId, data: payload }).unwrap();

      } else {
        await postInComeExpense(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Data submitted successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      refetch();
      methods.reset({
        FundID: "",
        VoucherNo: "",
        BookNo: "",
        TransactionDateEng: "",
        TransactionBanglaDate: "",
        gledger: [],
      });
      setDefaultData([]);
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit data. Please try again.",
      });
    }
  };

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold">
          {translate("Accounting")}
        </h3>
      </div>

      <FormProvider {...methods}>
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...methods.register("ID")} />

          {/* Top Section - 4 responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DefaultSelect
                  label={translate("Fund") + " :"}
                  options={fundNamesData ?? []}
                  valueField="FundID"
                  nameField="FundName"
                  registerKey="FundID"
                  unicode={true}
                  require={"Fund is required!"}
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DefaultSelect
                  label={translate("Deposit/Cost") + " :"}
                  options={chartOfAccountData ?? []}
                  valueField="CAID"
                  nameField="ChartOfAcName"
                  registerKey="CAID"
                  unicode={true}
                  require={"Deposit/Cost is required!"}
                />
              </div>
            </div>
            <DefaultSelect
              label={translate("General Ledger") + " :"}
              options={generalLedgersData ?? []}
              valueField="GLID"
              nameField="GlName"
              registerKey="ledgerGLID"
              unicode={true}
              require={"General Ledger is required!"}
            />
            <DefaultSelect
              label={translate("Sectors") + " :"}
              options={gSLData ?? []}
              valueField="SLID"
              nameField="SlName"
              registerKey="SLID"
              unicode={true}
              require={"Sectors is required!"}
            />
            <DefaultInput
              label={translate("Voucher/Bill") + " :"}
              type="text"
              registerKey={"VoucherNo"}
              disable
            />
            <DefaultInput
              label={translate("Ledger No") + " :"}
              type="number"
              registerKey={"BookNo"}
              placeholder={translate("Enter Book Id ...")}
              require={"BookNo is required!"}
            />
            <DatePickerOne
              dateCalender={`${translate("English Date")}: `}
              placeholder="Enter date"
              registerKey="TransactionDateEng"
              require="English date is required!"
            />
            <BanglaDatePicker
              dateCalender={`${translate("Bangla Date")}: `}
              placeholder="Enter date"
              registerKey="TransactionBanglaDate"
            />
            <DefaultSelect
              label={translate("Payment System") + " :"}
              nameField={"GlName"}
              registerKey="paymentGLID"
              valueField={"GLID"}
              options={paymentTypesData ?? []}
              type={"number"}
              require={"Payment System is required!"}
              unicode={true}
            />
            <DefaultSelect
              label={"Account"}
              nameField={"SlName"}
              registerKey={"LSLID"}
              valueField={"SLID"}
              options={pgSLData ?? []}
              type={"number"}
              require={"Account is required!"}
              unicode={true}
            />
            <div className="col-span-2">
              <DefaultInput
                label={translate("Payment Comments") + " :"}
                placeholder={translate("Enter comments")}
                registerKey="LParticulars"
                require={"Payment comments is required!"}
                unicode={true}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
            <div className="col-span-2">
              <DefaultInput
                label={translate("Description") + " :"}
                placeholder={translate("Enter description")}
                registerKey="Particulars"
                require={"Description is required!"}
                unicode={true}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
            <DefaultInput
              label={translate("Amount") + " :"}
              type="text"
              registerKey={"Amount"}
              placeholder={translate("Enter Amount number ...")}
              require={"Book is required!"}
              className="col-span-1"
            />
            <div className="flex items-center justify-start w-full pt-6">
              <Button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                {translate("Add")}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="my-5">
        {defaultData && defaultData.length > 0 && (
          <SortableTable
            columns={defaultColumns}
            data={defaultData}
            isFilterColumn={false}
          />
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 px-4 bg-white">
        <Button
          type="button"
          onClick={handleSubmitButton}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          {translate("Submit")}
        </Button>
      </div>

      {/* Table Section */}
      <div className="mt-5 overflow-x-auto">
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="text-red-500 text-center py-4">
            {translate("Failed to load exam fee settings. Please try again.")}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      {/* Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DepositCosts;
