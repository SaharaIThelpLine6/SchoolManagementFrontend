import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import Loading from "../components/Loading/Loading";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import {
  useGetStudentBySearchQuery,
  useGetStudentsVacationTypeListQuery,
} from "../features/student/studentQuerySlice";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { fetchSettingsData } from "../features/settings/settingsSlice";
import { toast } from "react-toastify";
import Button from "../components/Button/Button";

const PAGE_SIZE = 10;

const DataExport = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { residential, status, error } = useSelector((state) => state.settings);

  const {
    data: studentVacationTypeData = [],
    isSVTError,
    isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const { data: searchStudentInfo, error: searchStudentError } =
    useGetStudentBySearchQuery(
      { search: "100001", ClassID: null, SessionID: null },
      { skip: false, refetchOnFocus: false }
    );

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get("filter") || "0");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
    dispatch(fetchSettingsData());
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [errors, setErrors] = useState({
    filters: false,
  });

  // Define all possible columns with their mapping to student data
  const allColumns = [
    { id: "ID", label: "ID", field: "StudentID" },
    { id: "Name", label: "Name", field: "StudentName" },
    { id: "Fathar", label: "Father", field: "FatherName" },
    { id: "Mother", label: "Mother", field: "MotherName" },
    { id: "Mobile 1", label: "Mobile 1", field: "Mobile1" },
    { id: "Mobile 2", label: "Mobile 2", field: "Mobile2" },
    { id: "E-mail", label: "E-mail", field: "Email" },
    { id: "Session", label: "Session", field: "SessionName" },
    { id: "Class", label: "Class", field: "ClassName" },
    { id: "Sub Class", label: "Sub Class", field: "SubClassName" },
    {
      id: "Admission Serial",
      label: "Admission Serial",
      field: "AdmissionSerial",
    },
    { id: "Gender", label: "Gender", field: "Gender" },
    { id: "Residence", label: "Residence", field: "ResidentialStatus" },
    { id: "New/Old", label: "New/Old", field: "StudentType" },
    { id: "Date Of Birth", label: "Date Of Birth", field: "DateOfBirth" },
    {
      id: "NID/Birth Registration",
      label: "NID/Birth Registration",
      field: "NID",
    },
    { id: "Blood Group", label: "Blood Group", field: "BloodGroup" },
    { id: "Village", label: "Village", field: "Village" },
    { id: "Post Office", label: "Post Office", field: "PostOffice" },
    { id: "Police Station", label: "Police Station", field: "PoliceStation" },
    { id: "District", label: "District", field: "District" },
    {
      id: "Financial Status",
      label: "Financial Status",
      field: "FinancialStatus",
    },
  ];

  const handleColumnToggle = (columnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const validateFilters = () => {
    const { SessionID, SubClassID, ClassID, ResidentialStatusId } =
      methods.getValues();
    const isValid = SessionID && SubClassID && ClassID && ResidentialStatusId;
    setErrors((prev) => ({ ...prev, filters: !isValid }));
    return isValid;
  };

  // Filter student data based on selected columns
  const filteredStudentData = useMemo(() => {
    if (!searchStudentInfo) return [];

    return searchStudentInfo.map((student) => {
      const filteredStudent = {};
      allColumns.forEach((col) => {
        if (selectedColumns.includes(col.id)) {
          filteredStudent[col.id] = student[col.field] || "";
        }
      });
      return filteredStudent;
    });
  }, [searchStudentInfo, selectedColumns]);

  // Generate table columns dynamically based on selection
  const dynamicColumns = useMemo(() => {
    return allColumns
      .filter((col) => selectedColumns.includes(col.id))
      .map((col) => ({
        title: translate(col.label),
        field: col.id,
        hozAlign: "center",
        render: (row) => <p>{row[col.id]}</p>,
      }));
  }, [selectedColumns, translate]);

  const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudentData.slice(start, start + PAGE_SIZE);
  }, [filteredStudentData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load vacation type data</p>;

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 font-lato flex flex-col gap-6">
        {/* Top Section - Title and Filters */}
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          {/* Title - Left Aligned */}
          <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
            {translate("Export students data")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4">
            <DefaultSelect
              options={sessionData || []}
              require={"Session is required"}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
              type={"number"}
              label={translate("Session")}
              error={errors.filters}
            />
            
            <DefaultSelect
              options={subClassData || []}
              require={"Sub Class is required"}
              nameField={"SubClass"}
              valueField={"SubClassID"}
              registerKey={"SubClassID"}
              type={"number"}
              label={translate("Sub Class")}
              error={errors.filters}
              unicode={true}
            />
            <DefaultSelect
              options={[
                { ClassID: 1, ClassName: "নতুন" },
                { ClassID: 2, ClassName: "পুরাতন" },
                { ClassID: 3, ClassName: "উভয়" },
              ]}
              require={"New/Old is required"}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              label={translate("New/Old")}
              error={errors.filters}
            />
            <DefaultSelect
              options={residential || []}
              require={"Living Condition is required"}
              nameField={"ResidentialName"}
              valueField={"RDID"}
              registerKey={"ResidentialStatusId"}
              type={"number"}
              label={translate("Living Condition")}
              error={errors.filters}
            />
            <div className="flex justify-center items-center">
              <Button className="sm:mt-6 w-full">Export</Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Column Selection */}
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">
                {translate("Select Columns")}
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {allColumns.map((column) => (
                  <label
                    key={column.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.id)}
                      onChange={() => handleColumnToggle(column.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {column.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Table */}
          <div className="w-full lg:w-3/4">
            {selectedColumns.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <SortableTable
                    columns={dynamicColumns}
                    data={paginatedData}
                    isFilterColumn={false}
                  />
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdKeyboardArrowLeft className="text-xl" />
                    Previous
                  </button>

                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <MdKeyboardArrowRight className="text-xl" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Select columns to display data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default DataExport;
