import { useMemo, useState } from "react";
import useTranslate from "../../../utils/Translate";
import SvgIcon from "../../../components/icons/SvgIcon";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const PaymentHistoryInvoiceTable = ({ data, setInvoice, setInvoiceData }) => {
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState("all");

  const invoiceHandle = (row) => {
    setInvoice(true);
    setInvoiceData(row);
  };

  // Filter data by status
  const filteredData = useMemo(() => {
    if (statusFilter === "all") return data;
    return data.filter((item) => item.TransactionStatus === statusFilter);
  }, [data, statusFilter]);

  const totalPages = Math.ceil(filteredData?.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="my-5">
      <div className="flex justify-start items-center mb-4">
        {/* Pagination Size Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">{translate("Show")}:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when size changes
            }}
            className="border rounded px-3 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm">{translate("per page")}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-[#cfe2ff] text-black">
            <tr>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate("Status")}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate("Amount")}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate("Date")}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate("Description")}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate("Action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {row.TransactionStatus}
                </td>
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {row.PayAmount}
                </td>
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {new Date(row.CreateAt).toLocaleDateString("en-CA")}
                </td>
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  {row.Intent === "quota"
                    ? `Addon ${row.size ?? 0} Quota`
                    : `Renew For ${row.size ?? 0} years`}
                </td>
                <td className="px-4 py-2">
                  <div className="flex justify-center whitespace-nowrap">
                    <button
                      onClick={() => invoiceHandle(row)}
                      className="p-2 text-white bg-[#1aa5b8] hover:bg-[#17899a] rounded-md flex justify-center items-center gap-2"
                    >
                      <SvgIcon name={"FaEye"} size={20} />
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

      <div className="grid grid-cols-3 items-center mt-4">
        {/* Left - entries info */}
        <div className="flex justify-start">
          <div className="text-sm text-gray-600">
            {translate("Showing")} {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, filteredData.length)}{" "}
            {translate("of")} {filteredData.length} {translate("entries")}
          </div>
        </div>

        {/* Center - pagination */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

        {/* Right - empty */}
        <div></div>
      </div>
    </div>
  );
};

export default PaymentHistoryInvoiceTable;
