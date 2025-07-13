import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useDeleteStudentCharacterReportMutation,
  useGetStudentReportsQuery,
} from "../features/student/studentQuerySlice";
import bnBijoy2Unicode from "../utils/conveter";
import useTranslate from "../utils/Translate";
import CharacterReport from "./Document/characterReport";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { showModal } from "../utils/ModalControlar";
import LoadingComponent from "../components/LoadingComponent";
import EmptyState from "../components/EmptyState";
import Swal from "sweetalert2";

const StudentReportList = ({
  reportParams,
  setReportUpdateId,
  isLoading,
  error,
}) => {
  const translate = useTranslate();
  const printRef = useRef();
  const { data: reportsResponse } = useGetStudentReportsQuery({
    userCode: reportParams.userCode,
    classID: reportParams.classID || undefined,
    SessionID: reportParams.SessionID || undefined,
  });

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
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
          <span>{translate("Print")}</span>
        </button>
      </div>

      <div className="relative overflow-x-auto hidden_in_print">
        <table className="w-full text-sm text-left text-gray-500 shadow-md sm:rounded-lg">
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
          </thead>
          <tbody>
            {reportsResponse.map((item, index) => (
              <tr
                key={item.SRID}
                className="bg-white border-b hover:bg-gray-50 text-black"
              >
                <td className="px-3 py-4 text-nowrap">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                      title={translate("Delete")}
                      onClick={() => handleDelete(item.SRID)}
                    >
                      <MdDelete className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                      title={translate("Edit")}
                      onClick={() => handleEditOpenModal(item.SRID)}
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
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
