import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDeleteStudentCharacterReportMutation,
  useGetStudentReportsQuery,
} from "../features/student/studentQuerySlice";
import bnBijoy2Unicode from "../utils/conveter";
import useTranslate from "../utils/Translate";
import CharacterReport from "./Document/characterReport";
import LoadingComponent from "../components/LoadingComponent";
import EmptyState from "../components/EmptyState";
import Swal from "sweetalert2";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import DeleteButton from "./Button/DeleteButton";
import EditButton from "./Button/EditButton";
import SvgIcon from "./icons/SvgIcon";

const StudentReportList = ({
  reportParams,
  setReportUpdateId,
  isLoading,
  error,
}) => {
  const translate = useTranslate();
  const printRef = useRef();
  const [filterDate, setFilterDate] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);

  const { data: reportsResponse } = useGetStudentReportsQuery({
    userCode: reportParams.userCode,
    classID: reportParams.classID || undefined,
    SessionID: reportParams.SessionID || undefined,
  });

  // Reset filter when reportParams change
  useEffect(() => {
    setFilterDate(null);
  }, [reportParams]);

  // Apply filtering when reportsResponse or filterDate changes
  useEffect(() => {
    if (reportsResponse) {
      if (filterDate) {
        const filtered = reportsResponse.filter((report) => {
          const reportDate = new Date(report.CreateDate);
          return (
            reportDate.getFullYear() === filterDate.getFullYear() &&
            reportDate.getMonth() === filterDate.getMonth() &&
            reportDate.getDate() === filterDate.getDate()
          );
        });
        setFilteredReports(filtered);
      } else {
        setFilteredReports(reportsResponse);
      }
    }
  }, [reportsResponse, filterDate]);

  // Rest of your component remains the same...
  const handleEditOpenModal = useCallback(
    (id) => {
      setReportUpdateId(id);
    },
    [setReportUpdateId]
  );

  const [deleteStudentCharacterReport] =
    useDeleteStudentCharacterReportMutation();

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;

      const result = await Swal.fire({
        title: "আপনি কি নিশ্চিত?",
        text: "এই রিপোর্ট মুছে ফেলা হবে।",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
        cancelButtonText: "বাতিল করুন",
      });

      if (result.isConfirmed) {
        try {
          await deleteStudentCharacterReport(id).unwrap();
          Swal.fire(
            "মুছে ফেলা হয়েছে!",
            "রিপোর্ট সফলভাবে মুছে ফেলা হয়েছে।",
            "success"
          );
        } catch (error) {
          Swal.fire(
            "ভুল হয়েছে!",
            "রিপোর্ট মুছে ফেলা যায়নি। আবার চেষ্টা করুন।",
            "error"
          );
        }
      }
    },
    [deleteStudentCharacterReport]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDateFilterChange = (dates) => {
    setFilterDate(dates[0] || null);
  };

  const clearDateFilter = () => {
    setFilterDate(null);
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        {error?.data?.error || "Failed to load reports"}
      </div>
    );
  }

  if (!reportsResponse || reportsResponse.length === 0) {
    return (
      <EmptyState
        message={translate("No reports found for this student")}
        className="py-8"
      />
    );
  }

  return (
    <div className="mt-6">
      <div className="py-4 hidden_in_print flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 font-SolaimanLipi">
          {translate("Student Reports")}
        </h3>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md font-SolaimanLipi"
          onClick={handlePrint}
        >
         <SvgIcon
              name={"MdLocalPrintshop"}
              size={20}
            />
        
          <span>{translate("Print")}</span>
        </button>
      </div>

      <div className="relative overflow-x-auto hidden_in_print">
        <table className="w-full text-sm text-center text-gray-500 shadow-md sm:rounded-lg">
          <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("Action")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("No.")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("User Code")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("Student Name")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("Varient")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("Type")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                {translate("Date")}
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px] w-[300px]">
                {translate("Remark")}
              </th>
            </tr>
            <tr>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]"></th>
              <th className="px-3 py-3 text-nowrap text-[16px]">
                <div className="mt-1 flex justify-center">
                  <div className="w-full max-w-[200px]">
                    <Flatpickr
                      value={filterDate}
                      onChange={handleDateFilterChange}
                      options={{
                        dateFormat: "d-m-Y",
                        maxDate: "today",
                        allowInput: true,
                        placeholder: "Filter by date",
                      }}
                      className="w-full p-1 border rounded text-sm"
                    />
                    {/* {filterDate && (
                      <button
                        onClick={clearDateFilter}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                      >
                        Clear filter
                      </button>
                    )} */}
                  </div>
                </div>
              </th>
              <th className="px-3 py-3 text-nowrap text-[16px] w-[300px]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((item, index) => (
              <tr
                key={item.SRID}
                className="bg-white border-b hover:bg-gray-50 text-black"
              >
                <td className="px-3 py-4 text-nowrap">
                  <div className="flex justify-center items-center gap-2">
                 
                    <EditButton onClick={() => handleEditOpenModal(item.SRID)}/>
                    <DeleteButton onClick={() => handleDelete(item.SRID)}/>
                  </div>
                </td>
                <td className="px-3 py-4 text-nowrap">{index + 1}</td>
                <td className="px-3 py-4 text-nowrap">{item.StudentCode}</td>
                <td className="px-3 py-4 text-nowrap">
                  {bnBijoy2Unicode(item.StudentName)}
                </td>
                <td className="px-3 py-4 text-nowrap">
                  {bnBijoy2Unicode(item.ReportCet)}
                </td>
                <td className="px-3 py-4 text-nowrap">
                  {bnBijoy2Unicode(item.ReportType)}
                </td>
                <td className="px-3 py-4 text-nowrap">
                  {new Date(item.CreateDate).toLocaleDateString()}
                </td>
                <td className="px-3 py-4 w-[300px] break-words">
                  {bnBijoy2Unicode(item.Remark)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={printRef} className="print-only">
        {reportsResponse && <CharacterReport report={reportsResponse} />}
      </div>
    </div>
  );
};

export default StudentReportList;
