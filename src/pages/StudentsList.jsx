import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import useTranslate from "../utils/Translate";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Button from "../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import SortableTable from "../components/Tables/SortableTable";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import Swal from "sweetalert2";
import { useGetClassListQuery } from "../features/class/classQuerySlice";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { showModal } from "../utils/ModalControlar";
import { enToBnNumber } from "../helper/languageFormat";

const PAGE_SIZE = 10;

const StudentsList = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  const { data: sessionData } = useGetSessionsQuery();
  const language = useSelector((state) => state.language.currectLanguage);
  // State for both tables
  const [leftTableData, setLeftTableData] = useState([]);
  const [rightTableData, setRightTableData] = useState([]);
  const [leftSelectedRows, setLeftSelectedRows] = useState([]);
  const [rightSelectedRows, setRightSelectedRows] = useState([]);
  const [leftSelectAll, setLeftSelectAll] = useState(false);
  const [rightSelectAll, setRightSelectAll] = useState(false);

  // Sample data - replace with your actual data source
  const studentseExamData = [
    {
      id: 1,
      sl: 1,
      session: "2023-2024",
      examName: "Annual Exam",
      class: "Class 5",
      feeName: "Exam Fee",
      fee: "500",
    },
    {
      id: 2,
      sl: 2,
      session: "2023-2024",
      examName: "Mid Term",
      class: "Class 6",
      feeName: "Registration",
      fee: "300",
    },
    {
      id: 3,
      sl: 3,
      session: "2023-2024",
      examName: "Final Exam",
      class: "Class 7",
      feeName: "Lab Fee",
      fee: "200",
    },
    {
      id: 4,
      sl: 4,
      session: "2022-2023",
      examName: "Pre-Test",
      class: "Class 8",
      feeName: "Sports Fee",
      fee: "150",
    },
    {
      id: 5,
      sl: 5,
      session: "2022-2023",
      examName: "Unit Test",
      class: "Class 9",
      feeName: "Library Fee",
      fee: "100",
    },
  ];

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
    // Initialize table data
    setLeftTableData(studentseExamData);
    setRightTableData([]);
  }, [dispatch, pageTitle]);

  const leftTotalPages = Math.ceil(leftTableData.length / PAGE_SIZE);
  const rightTotalPages = Math.ceil(rightTableData.length / PAGE_SIZE);

  const paginatedLeftData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return leftTableData.slice(start, start + PAGE_SIZE);
  }, [leftTableData, currentPage]);

  const paginatedRightData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rightTableData.slice(start, start + PAGE_SIZE);
  }, [rightTableData, currentPage]);

  const handleNext = (table) => {
    const totalPages = table === "left" ? leftTotalPages : rightTotalPages;
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const { data: classListData } = useGetClassListQuery();

  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];

  // Transfer items between tables
  const transferItems = (direction) => {
    if (direction === "right" && leftSelectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No items selected",
        text: "Please select items from the left table first",
      });
      return;
    }

    if (direction === "left" && rightSelectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No items selected",
        text: "Please select items from the right table first",
      });
      return;
    }

    if (direction === "right") {
      const itemsToTransfer = leftTableData.filter((item) =>
        leftSelectedRows.includes(item.id)
      );
      setRightTableData([...rightTableData, ...itemsToTransfer]);
      setLeftTableData(
        leftTableData.filter((item) => !leftSelectedRows.includes(item.id))
      );
      setLeftSelectedRows([]);
      setLeftSelectAll(false);
    } else {
      const itemsToTransfer = rightTableData.filter((item) =>
        rightSelectedRows.includes(item.id)
      );
      setLeftTableData([...leftTableData, ...itemsToTransfer]);
      setRightTableData(
        rightTableData.filter((item) => !rightSelectedRows.includes(item.id))
      );
      setRightSelectedRows([]);
      setRightSelectAll(false);
    }
  };

  // Handle select all for left table
  const handleLeftSelectAll = (e) => {
    const isChecked = e.target.checked;
    setLeftSelectAll(isChecked);
    setLeftSelectedRows(
      isChecked ? paginatedLeftData.map((item) => item.id) : []
    );
  };

  // Handle select all for right table
  const handleRightSelectAll = (e) => {
    const isChecked = e.target.checked;
    setRightSelectAll(isChecked);
    setRightSelectedRows(
      isChecked ? paginatedRightData.map((item) => item.id) : []
    );
  };

  // Handle individual row selection
  const handleRowSelect = (row, table) => {
    if (table === "left") {
      setLeftSelectedRows((prev) =>
        prev.includes(row.id)
          ? prev.filter((id) => id !== row.id)
          : [...prev, row.id]
      );
    } else {
      setRightSelectedRows((prev) =>
        prev.includes(row.id)
          ? prev.filter((id) => id !== row.id)
          : [...prev, row.id]
      );
    }
  };

  const columns = (table) => [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={
              table === "left"
                ? leftSelectedRows.includes(row.id)
                : rightSelectedRows.includes(row.id)
            }
            onChange={() => handleRowSelect(row, table)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      ),
    },
    { title: "SL", field: "sl", hozAlign: "center" },
    { title: translate("Session"), field: "session", hozAlign: "center" },
    { title: translate("Exam Name"), field: "examName", hozAlign: "center" },
    { title: translate("Class/Jamaat"), field: "class", hozAlign: "center" },
    { title: translate("Fee Name"), field: "feeName", hozAlign: "center" },
    { title: translate("Fee"), field: "fee", hozAlign: "center" },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  const handleOpenModal = useCallback(() => {
    showModal("Talent Condition", "TALENT_CONDITION");
  }, []);

  const onSubmit = async (data) => {
    try {
      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      // Get all subject values using getValues()
      const allValues = getValues();
      const subjectValues = {};

      for (let i = 1; i <= 14; i++) {
        subjectValues[`subject_${i}_name`] = allValues[`subject_${i}_name`];
        subjectValues[`subject_${i}_value`] = allValues[`subject_${i}_value`];
      }

      console.log("Collected Data:", {
        formData: data,
        selectedStudents: selectedRows,
        subjects: subjectValues,
      });

      // Structure the data for API submission
      const submissionData = {
        classId: data.SessionID,
        students: selectedRows,
        subjects: Object.keys(subjectValues).reduce((acc, key) => {
          if (key.includes("_name")) {
            const index = key.split("_")[1];
            acc.push({
              name: subjectValues[`subject_${index}_name`],
              value: subjectValues[`subject_${index}_value`],
            });
          }
          return acc;
        }, []),
      };

      console.log("Structured Data for API:", submissionData);

      // For testing purposes
      const response = { message: "ডেটা সফলভাবে সংরক্ষণ হয়েছে" };

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
      }).then(() => {
        // refetch();
        setSelectedRows([]);
        methods.reset();
      });
    } catch (error) {
      console.error("Submission Error:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
    }
  };
  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between mb-6">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Exam List Made")}
        </h3>
        <Button onClick={handleOpenModal}>
          {translate("Talent Condition")}
        </Button>
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <DefaultSelect
              label={translate("Session") + " :"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ExamID"
            />
            <DefaultSelect
              label={translate("Class/Jamaat") + ":"}
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
            <DefaultInput
              registerKey="assignedFee"
              label={translate("Prescribed Fee") + ":"}
              type="number"
            />
            <DefaultInput
              registerKey="totalSubjects"
              label={translate("Total Subject") + ":"}
              type="number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[...Array(2)].map((_, colIndex) => (
              <div key={colIndex} className="space-y-2">
                {[...Array(7)].map((_, rowIndex) => {
                  const subjectNumber = colIndex * 7 + rowIndex + 1;
                  const displayNumber =
                    language === "bn"
                      ? enToBnNumber(subjectNumber)
                      : subjectNumber;
                  return (
                    <div className="flex gap-2 items-center" key={rowIndex}>
                      <div className="flex-1 min-w-0">
                        <DefaultInput
                          registerKey={`subject_${subjectNumber}_name`}
                          label={`${
                            translate(`Subject`) + " " + displayNumber}`}
                          type="text"
                          labelPosition="left"
                        />
                      </div>
                      <div className="w-24 shrink-0">
                        <DefaultInput
                          registerKey={`subject_${subjectNumber}_value`}
                          type="number"
                          placeholder="Fee"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              {translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>
      {/* Tables */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left Table */}
        <div className="flex-1 min-w-0">
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {translate("Select those to whom you will charge fees.")}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
              {/* Select All Checkbox */}
              <div className="flex items-center bg-white px-3 py-2 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={leftSelectAll}
                  onChange={handleLeftSelectAll}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  {translate("Select All")}
                </label>
              </div>

              {/* নির্ধারিত */}
              <div className="bg-white px-4 py-2 rounded-md shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700">
                  <span className="text-gray-500">নির্ধারিত:</span>
                  <span className="ml-2 text-blue-600">9000</span>
                </h4>
              </div>

              {/* কর্তন */}
              <div className="bg-white px-4 py-2 rounded-md shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700">
                  <span className="text-gray-500">কর্তন:</span>
                  <span className="ml-2 text-red-600">
                    {rightTableData.reduce(
                      (sum, item) => sum + parseInt(item.fee),
                      0
                    )}
                  </span>
                </h4>
              </div>

              {/* জমা */}
              <div className="bg-white px-4 py-2 rounded-md shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700">
                  <span className="text-gray-500">জমা:</span>
                  <span className="ml-2 text-green-600">
                    {9000 -
                      rightTableData.reduce(
                        (sum, item) => sum + parseInt(item.fee),
                        0
                      )}
                  </span>
                </h4>
              </div>
            </div>
            <div className="overflow-x-auto">
              <SortableTable
                columns={columns("left")}
                data={paginatedLeftData}
                isFilterColumn={false}
              />
            </div>
          </div>

          {leftTotalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  <MdKeyboardArrowLeft size={24} />
                </button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {leftTotalPages}
                </span>
                <button
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                  onClick={() => handleNext("left")}
                  disabled={currentPage === leftTotalPages}
                >
                  <MdKeyboardArrowRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transfer Buttons */}
        <div className="flex flex-col gap-4 justify-center items-center">
          <Button onClick={() => transferItems("right")} className="px-4 py-2">
            {">>>"}
          </Button>
          <Button onClick={() => transferItems("left")} className="px-4 py-2">
            {"<<<"}
          </Button>
        </div>

        {/* Right Table */}
        <div className="flex-1 min-w-0">
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {translate("Accept the following student fees.")}
            </h2>

            {/* Select All Checkbox */}
            <div className="flex items-center bg-white px-3 py-2 rounded-md shadow-sm">
              <input
                type="checkbox"
                checked={rightSelectAll}
                onChange={handleRightSelectAll}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                {translate("Select All")}
              </label>
            </div>
            <div className="overflow-x-auto">
              <SortableTable
                columns={columns("right")}
                data={paginatedRightData}
                isFilterColumn={false}
              />
            </div>
          </div>

          {rightTotalPages > 1 && (
            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                >
                  <MdKeyboardArrowLeft size={24} />
                </button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {rightTotalPages}
                </span>
                <button
                  className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-100"
                  onClick={() => handleNext("right")}
                  disabled={currentPage === rightTotalPages}
                >
                  <MdKeyboardArrowRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsList;
