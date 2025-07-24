import React, { useMemo, useState } from "react";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import useTranslate from "../../../utils/Translate";
import SortableTable from "../../../components/Tables/SortableTable";
const PAGE_SIZE = 10;

const PaymentHistoryInvoiceTable = ({ data, setInvoice, setInvoiceData }) => {
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);

  const invoiceHandle = (data) => {
    setInvoice(true);
    setInvoiceData(data);
  };
  const columns = [
    {
      title: translate("Status"),
      field: "TransactionStatus",
      hozAlign: "center",
    },
    {
      title: translate("Amount"),
      field: "PayAmount",
      hozAlign: "center",
    },
    {
      title: translate("Date"),
      field: "CreateAt",
      hozAlign: "center",
      render: (row) => {
        const date = new Date(row.CreateAt);
        return date.toLocaleDateString("en-CA");
      },
    },
    {
      title: translate("Description"),
      field: "Intent",
      hozAlign: "left",
      render: (row) => {
        if (row.Intent === "quota") {
          return `Addon ${row.size ?? 0} Quota`;
        } else {
          return `Renew For ${row.size ?? 0} years`;
        }
      },
    },

    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => invoiceHandle(row)}
            className="p-2 text-white bg-[#22c55e] rounded-md"
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(data?.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="my-5">
      <SortableTable
        columns={columns}
        data={paginatedData}
        isFilterColumn={false}
      />
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <span>
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

export default PaymentHistoryInvoiceTable;
