import React, { useMemo, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import useTranslate from "../../../utils/Translate";

const PAGE_SIZE = 10;

const PaymentHistoryInvoiceTable = ({ data, setInvoice, setInvoiceData }) => {
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);

  const invoiceHandle = (row) => {
    setInvoice(true);
    setInvoiceData(row);
  };

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
      <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-[#cfe2ff] text-black">
            <tr>
              <th className="px-4 py-3 text-center">{translate("Status")}</th>
              <th className="px-4 py-3 text-center">{translate("Amount")}</th>
              <th className="px-4 py-3 text-center">{translate("Date")}</th>
              <th className="px-4 py-3 text-center">
                {translate("Description")}
              </th>
              <th className="px-4 py-3 text-center">{translate("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-4 py-2 text-center">
                  {row.TransactionStatus}
                </td>
                <td className="px-4 py-2 text-center">{row.PayAmount}</td>
                <td className="px-4 py-2 text-center">
                  {new Date(row.CreateAt).toLocaleDateString("en-CA")}
                </td>
                <td className="px-4 py-2 text-center">
                  {row.Intent === "quota"
                    ? `Addon ${row.size ?? 0} Quota`
                    : `Renew For ${row.size ?? 0} years`}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center">
                    <button
                      onClick={() => invoiceHandle(row)}
                      className="p-2 text-white bg-[#1aa5b8] hover:bg-[#17899a] rounded-md flex justify-center items-center gap-2"
                    >
                      <FaEye size={18} /> <span>{translate("Preview")}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  {translate("No data available")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
