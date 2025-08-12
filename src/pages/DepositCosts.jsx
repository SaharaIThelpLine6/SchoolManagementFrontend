import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
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
} from "../features/feeCollection/feeCollectionSlice";
import { GrDrag } from "react-icons/gr";
import { showModal } from "../utils/ModalControlar";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import BanglaDatePicker from "../components/Forms/DatePicker/BanglaDatePicker";

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
  const { data: gldgersData } = useGetGLedgersQuery();
  const { data: generalLedgersData } = useGetGeneralLedgersQuery(caID, {
    skip: !caID,
  });

  const { data: gSLData } = useGetSubLedgerQuery(ledgerGLID, {
    skip: !ledgerGLID, //
  });

  const { data: pgSLData } = useGetSubLedgerQuery(paymentGLID, {
    skip: !paymentGLID, //
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
  // Example call

  console.log(transactionOrdersData, "transactionOrdersData");

  const [postInComeExpense] = usePostInComeExpenseMutation();
  const [deleteInComeExpense] = useDeleteInComeExpenseMutation();

  const totalPages = Math.ceil(
    (transactionOrdersData?.length || 0) / PAGE_SIZE
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return transactionOrdersData?.slice(start, start + PAGE_SIZE) || [];
  }, [transactionOrdersData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

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

    // transactionOrdersData থেকে মিলে যাওয়া ডাটা বের করা
    const selectedOrder = transactionOrdersData?.find(
      (item) => item.OrderID === orderId
    );

    const data = [10, 20, 546, 75, 102];

    console.log(selectedOrder, "selectedOrder");

    if (selectedOrder) {
      // মেইন ট্রান্সাকশন ডাটা সেট করা
      setValue("FundID", selectedOrder.FundID);
      setValue("VoucherNo", selectedOrder.VoucherNo);
      setValue("BookNo", selectedOrder.BookNo);
      setValue("TransactionDateEng", selectedOrder.TransactionDateEng);
      setValue("TransactionBanglaDate", selectedOrder.TransactionBanglaDate);
      setValue("LParticulars", selectedOrder.AccBankTransaction.Particulars);
      const targetStr = selectedOrder.AccBankTransaction.SLID.toString();

      const match = gldgersData.find((i) =>
        targetStr.startsWith(i.GLID.toString())
      );
      console.log(match.GLID, "LSLID");
      setValue("paymentGLID", match.GLID);
      setValue("LSLID", selectedOrder.AccBankTransaction.LSLID);
      setDefaultData(selectedOrder.AccTransactionDetails || []);

      // সাব-ডিটেইলস থাকলে সেট করা
      // if (selectedOrder.AccTransactionDetails?.length > 0) {
      //   const detail = selectedOrder.AccTransactionDetails[0]; // প্রথম ডিটেইল নিচ্ছি, লুপও করতে পারেন
      //   setValue("SLID", detail.SLID);
      //   setValue("Description", detail.Particulars);
      //   setValue("Amount", detail.Amount);
      // }

      // // ব্যাংক ট্রান্সাকশন থাকলে সেট করা
      // if (selectedOrder.AccBankTransaction) {
      //   setValue("PaymentSLID", selectedOrder.AccBankTransaction.SLID);
      //   setValue(
      //     "PaymentDescription",
      //     selectedOrder.AccBankTransaction.Particulars
      //   );
      //   setValue("PaymentAmount", selectedOrder.AccBankTransaction.Amount);
      // }
    }
  };

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    try {
      let response;
      const payload = {
        SLID: data.SLID,
        Particulars: data.Particulars,
        Amount: data.Amount,
        SL: editIdDefaultData
          ? editIdDefaultData // keep old ID if editing
          : 1 + defaultData.length, // new row ID
      };

      if (editIdDefaultData) {
        // Update existing record
        setDefaultData((prev) =>
          prev.map((item) => (item.SL === editIdDefaultData ? payload : item))
        );
        setEditIdDefaultData(null);
      } else {
        // Add new record
        setDefaultData((prev) => [...prev, payload]);
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        // refetch();
        methods.reset({
          ...methods.getValues(),
          Particulars: "",
          Amount: "",
        });
      });
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        "অজানা একটি ত্রুটি ঘটেছে।";
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
        setDefaultData((prev) => prev.filter((item) => item.ID !== id));
        Swal.fire(
          "মুছে ফেলা হয়েছে!",
          "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
          "success"
        );
      }
    });
  }; // Delete function
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
        // SLID: existing.SLID,
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
          <button
            onClick={() => handleDelete(row.OrderID)}
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200 flex items-center justify-center"
            title={translate("Delete")}
          >
            <MdDelete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row.OrderID)}
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200 flex items-center justify-center"
            title={translate("Edit")}
          >
            <FaRegEdit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <GrDrag />
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
          <button
            onClick={() => handleDeleteDefaultData(row.SL)}
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200 flex items-center justify-center"
            title="Delete"
          >
            <MdDelete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOpenModalDefaultData(row.SL)}
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            <FaRegEdit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <GrDrag />
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
        VoucherNo: VoucherNo ? VoucherNo : 1,
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

      console.log(payload, "payload");
      // const response = await postInComeExpense(payload).unwrap();

      // Show success alert
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
        {/* <button
          className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Settings"
          //   onClick={handleOpenModal}
        >
          <IoMdSettings className="text-2xl text-gray-700" />
        </button> */}
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
              // require={"Voucher/Bill is required!"}
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
              require="Bangla date is required!"
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
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <span className="text-sm md:text-base">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositCosts;
