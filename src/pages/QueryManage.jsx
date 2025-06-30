import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import StudentFeeGroup from "../view/exam/StudentFeeGroup";
import bnBijoy2Unicode from "../utils/conveter";

const PAGE_SIZE = 10;

const mockPaginatedData = [
  {
    AdmissionID: 1,
    StudentCode: "U1001",
    StudentName: "Rahim Uddin",
    ClassName: "Class 5",
    SubClass: "A",
    ResidentialName: "Residential",
  },
  {
    AdmissionID: 2,
    StudentCode: "U1002",
    StudentName: "Karim Mia",
    ClassName: "Class 4",
    SubClass: "B",
    ResidentialName: "Non-Residential",
  },
  {
    AdmissionID: 3,
    StudentCode: "U1003",
    StudentName: "Amina Khatun",
    ClassName: "Class 3",
    SubClass: "A",
    ResidentialName: "Residential",
  },
  {
    AdmissionID: 4,
    StudentCode: "U1004",
    StudentName: "Sajedul Islam",
    ClassName: "Class 2",
    SubClass: "C",
    ResidentialName: "Non-Residential",
  },
  {
    AdmissionID: 5,
    StudentCode: "U1005",
    StudentName: "Nasima Akter",
    ClassName: "Class 1",
    SubClass: "B",
    ResidentialName: "Residential",
  },
];

const QueryManage = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit, reset } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);

  console.log(selectedRows);

  const totalPages = Math.ceil(mockPaginatedData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return mockPaginatedData.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = mockPaginatedData.map((s) => s.AdmissionID);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (e, id) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((item) => item !== id));
    }
  };

  const isAllSelected =
    selectedRows.length === mockPaginatedData.length &&
    mockPaginatedData.length > 0;

  useEffect(() => {
    if (pageTitle) {
      dispatch(setPageName(pageTitle));
    }
  }, [dispatch, pageTitle]);

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={() => setShowStudentFeeGroup(false)} />;
  }

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-[#e9edf4] flex flex-col md:flex-row items-start md:items-center justify-between py-5 gap-4">
        <h3 className="text-base sm:text-[20px] font-bold">
          {translate("Average based Condition")}
        </h3>

        <div className="w-full md:w-1/2">
          <label
            htmlFor="conditionNotes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {translate("Notes")}
          </label>
          <textarea
            id="conditionNotes"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder={translate("Enter your notes here...")}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-5">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={isAllSelected}
                />
              </th>
              <th className="p-2 text-left">{translate("User ID")}</th>
              <th className="p-2 text-left">{translate("Student Name")}</th>
              <th className="p-2 text-left">{translate("Class")}</th>
              <th className="p-2 text-left">{translate("Sub Class")}</th>
              <th className="p-2 text-left">{translate("Residential")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((student) => (
              <tr key={student.AdmissionID} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    onChange={(e) => handleRowSelect(e, student.AdmissionID)}
                    checked={selectedRows.includes(student.AdmissionID)}
                  />
                </td>
                <td className="p-2">{student.StudentCode}</td>
                <td className="p-2">{bnBijoy2Unicode(student.StudentName)}</td>
                <td className="p-2">{bnBijoy2Unicode(student.ClassName)}</td>
                <td className="p-2">{bnBijoy2Unicode(student.SubClass)}</td>
                <td className="p-2">{student.ResidentialName}</td>
              </tr>
            ))}
            {mockPaginatedData.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  {translate("No data found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
            aria-label="Previous page"
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
            aria-label="Next page"
          >
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};


export default QueryManage