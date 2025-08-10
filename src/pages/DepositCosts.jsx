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
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import {
  useGetExamFeeSettingQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../features/exam/examQuerySlice";
import { CiFilter } from "react-icons/ci";
import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";
import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import {
  useGetFundNamesQuery,
  useGetGeneralLedgersQuery,
  useGetPaymentTypeQuery,
  useGetSubLedgerQuery,
} from "../features/feeCollection/feeCollectionSlice";
import { IoMdSettings } from "react-icons/io";
import { GrDrag } from "react-icons/gr";
import { showModal } from "../utils/ModalControlar";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import Textarea from "../components/Forms/Textarea";
import FilterButton from "../components/Filter/FilterButton";
import HijriDateFormatter from "../components/Calendar/HijriDateFormatter";

const PAGE_SIZE = 10;

const DepositCosts = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const fundID = watch("FundID");
  const gLID = watch("GLID");

  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: fundNamesData } = useGetFundNamesQuery();
  const { data: generalLedgersData } = useGetGeneralLedgersQuery(fundID);
  const { data: gSLData } = useGetSubLedgerQuery(gLID);
  const { data: paymentTypesData } = useGetPaymentTypeQuery();

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery();

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Update Handle
  const handleEdit = (row) => {
    showModal(
      "Accounting dues list Statement",
      "ACCOUNTING_DUES_LIST_STATEMENT"
    );

    // methods.reset({
    //   ID: row.ID,
    //   SessionID: row.SessionID,
    //   ExamID: row.ExamID,
    //   SubClassID: row.SubClassID,
    //   Fee: row.Fee,
    //   SLID: row.SLID,
    // });
  };

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      Fee: Number(data.Fee),
      SLID: data.SLID,
    };

    try {
      let response;
      if (data.ID) {
        response = await updateExamFeeSetting({
          id: data.ID,
          body: payload,
        }).unwrap();
      } else {
        response = await postExamFeeSetting(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        refetch();
        methods.reset();
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

  // Table Data Columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors duration-200 flex items-center justify-center"
            title="Delete"
          >
            <MdDelete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOpenModal(row.id)}
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
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("General Ledger"),
      hozAlign: "center",
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("ID"),
      hozAlign: "center",
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate("Sub Ledger"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate("Particulars"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate("Quantity"),
      field: "SLID",
      hozAlign: "center",
    },
  ];

  const handleOpenFundModal = () => {};
  const handleOpenDepositModal = () => {};
  const handleOpenPaymentModal = () => {};

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold">
          {translate("Accounting")}
        </h3>
        <button
          className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Settings"
          //   onClick={handleOpenModal}
        >
          <IoMdSettings className="text-2xl text-gray-700" />
        </button>
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
                />
              </div>
              <FilterButton onClick={handleOpenFundModal} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DefaultSelect
                  label={translate("Deposit") + " :"}
                  options={fundNamesData ?? []}
                  valueField="FundID"
                  nameField="FundName"
                  registerKey="FundID"
                  unicode={true}
                />
              </div>
              <FilterButton onClick={handleOpenDepositModal} />
            </div>
            <DefaultSelect
              label={translate("General Ledger") + " :"}
              options={generalLedgersData ?? []}
              valueField="GLID"
              nameField="GlName"
              registerKey="GLID"
              unicode={true}
            />
            <DefaultSelect
              label={translate("Sectors") + " :"}
              options={gSLData ?? []}
              valueField="SLID"
              nameField="SlName"
              registerKey="SLID"
              unicode={true}
            />
            <DefaultSelect
              label={translate("Sectors 2") + " :"}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
            />
            <DefaultInput
              label={translate("Voucher/Bill") + " :"}
              type="text"
              registerKey={"VoucherNo"}
              require={"Voucher/Bill is required!"}
              className="col-span-1"
            />
            <DefaultInput
              label={translate("Book") + " :"}
              type="text"
              registerKey={"Book"}
              placeholder={translate("Enter Book Name ...")}
              require={"Book is required!"}
              className="col-span-1"
            />
            <DatePickerOne
              dateCalender={`${translate("Christian Date")}: `}
              placeholder="Enter date"
              registerKey="VacationDateFrom"
              require="Date Required"
              className="col-span-1"
            />
            <HijriDateFormatter />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <DefaultSelect
                  label={translate("Payment System") + " :"}
                  options={paymentTypesData ?? []}
                  valueField="SL"
                  nameField="GlName"
                  registerKey="SL"
                  unicode={true}
                  className="col-span-1"
                />
              </div>
              <FilterButton onClick={handleOpenPaymentModal} />
            </div>
            <DefaultSelect
              label={translate("Name") + " :"}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
              className="col-span-1"
            />
            <DefaultInput
              label={translate("Quantity") + " :"}
              type="text"
              registerKey={"Book"}
              placeholder={translate("Enter Book Name ...")}
              require={"Book is required!"}
              className="col-span-1"
            />
            <div className="col-span-2">
              <Textarea
                label={translate("Payment Comments") + " :"}
                placeholder={translate("Enter comments")}
                registerKey="Comments"
                require={false}
                unicode={true}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label={translate("Description") + " :"}
                placeholder={translate("Enter description")}
                registerKey="Description"
                require={false}
                unicode={true}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 px-4 bg-white">
            <Button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {translate("Submit")}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Table Section */}
      <div className="mt-5 overflow-x-auto">
        {isExamFeeSettingLoading ? (
          <Loading />
        ) : isExamFeeSettingError ? (
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
