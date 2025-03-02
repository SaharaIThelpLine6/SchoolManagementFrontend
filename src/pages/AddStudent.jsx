import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { fetchStudentData, fetchUserOnlyStudentData } from "../features/student/studentSlice";
import SortableTable from "../components/Tables/SortableTable";
import { read, utils, writeFile } from 'xlsx';
import FilterDropdown from "../components/Dropdowns/FilterDropdown";
import { setItemsPerPage } from "../features/pagination/paginationSlice";
import FilterSelectGroup from "../components/Forms/SelectGroup/FilterSelectGroup";
import { useLocation } from "react-router-dom";
// import { Modal } from "../components/ModalSettings";
import ClickOutside from "../components/ClickOutside";
import AdmissionForm from "../components/Forms/AdmissionForm";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";

const AddStudent = ({ pageTitle }) => {
  const translate = useTranslate();
  const [selectedImage, setSelectedImage] = useState(null);
  const { studentList, userOnlyStudents, status, error } = useSelector((state) => state.student);
  const location = useLocation();
  const dispatch = useDispatch()
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');
  const [selectedDateRange, setSelectedDateRange] = useState([]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleOpenModal = useCallback((id) => {
    showModal("Admission Details", "ADD_STUDENT", id);
  }, []);
  const handleFeeCollectionModal = useCallback((id) => {
    showModal("Fee Collection", "FEE_COLLECTION", id);
  }, []);

  useEffect(() => {
    if (filter == 2) {
      dispatch(fetchUserOnlyStudentData())

    }
    else {
      dispatch(fetchStudentData())
    }
    dispatch(setPageName(pageTitle))
  }, [dispatch, location])


  const exportToCSV = () => {
    if (selectedDateRange.length !== 2) {
      alert("Please select a valid date range before exporting.");
      return;
    }

    const [startDate, endDate] = selectedDateRange;

    // Convert selected dates to comparable formats (YYYY-MM-DD)
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    // Get data from the Redux store based on filter
    const dataToExport = filter == 2 ? userOnlyStudents : studentList;

    // Filter data based on the CreateAt date
    const filteredData = dataToExport.filter(student => {
      const studentDate = new Date(student.CreateAt).setHours(0, 0, 0, 0);
      return studentDate >= start && studentDate <= end;
    });

    if (filteredData.length === 0) {
      alert("No data found for the selected date range.");
      return;
    }

    // Define custom headers
    const customHeaders = [
      ["User ID", "Admission No / Roll No", "Student ID", "Name", "Class", "Section", "Gender", "Date of Join", "Payment Status", "Status"]
    ];

    // Convert filtered data to match custom headers
    const formattedData = filteredData.map(student => [
      student.UserID,
      student.AdmissionID || "N/A",
      student.StudentCode || student.UserCode || "N/A",
      student.StudentName || student.UserName || "N/A",
      student.ClassName || "N/A",
      student.SubClass || "N/A",
      student.GenderID === 1 ? "Male" : student.GenderID === 2 ? "Female" : "Other",
      new Date(student.CreateAt).toLocaleDateString('en-GB'),
      student.AdmissionStatus === 0 ? "Pending" :
        student.AdmissionStatus === 1 ? "Paid" :
          student.AdmissionStatus === 2 ? "Free" : "Unpaid",
      student.SessionAction === 0 ? "Pending" : student.SessionAction === 1 ? "Active" : "N/A"
    ]);

    // Merge headers with data
    const finalCSVData = [...customHeaders, ...formattedData];

    // Convert array to worksheet
    const ws = utils.aoa_to_sheet(finalCSVData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Students");

    // Export as CSV file
    writeFile(wb, "students_list.csv", { bookType: "csv" });
  };

  const columnsAdmitedStudent = [
    { title: "User Id", field: "UserID", hozAlign: 'center' },
    { title: "Admission No / Roll No", field: "AdmissionID", hozAlign: 'center' },
    { title: "Student Id", field: "StudentCode", hozAlign: 'center', type: 'text', filterable: true },
    { title: "Name", field: "StudentName" },
    { title: "Class", field: "ClassName", hozAlign: 'center' },
    { title: "Section", field: "SubClass", hozAlign: "center" },
    {
      title: "Gender", field: "GenderID", hozAlign: "center",
      render: (row) => {
        const genderMap = {
          1: "Male",
          2: "Female",
          3: "Other"
        };
        return genderMap[row.GenderID] || "N/A";
      }
    },
    {
      title: "Date of join", field: "CreateAt", hozAlign: "center", type: "range", filterable: true,
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB')
      }
    },
    {
      title: "Payment status", field: "AdmissionStatus", hozAlign: "center", type: "select", filterable: true, options: [
        { label: "Pending", value: 0 },
        { label: "Paid", value: 1 },
        { label: "Free", value: 2 },
        { label: "Unpaid", value: 3 },
      ], render: (row) => {
        switch (row.AdmissionStatus) {
          case 0:
            return <button type="button" onClick={() => { handleFeeCollectionModal(row.UserID) }}><p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">Pending</p></button>;
          case 1:
            return <button type="button" onClick={() => { handleFeeCollectionModal(row.UserID) }}><p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">Paid</p></button>;
          case 2:
            return <p className="inline-flex rounded-lg bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">Free</p>;
          case 3:
            return <button type="button" onClick={() => { handleFeeCollectionModal(row.UserID) }}><p className="inline-flex rounded-lg bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">Unpaid</p></button>;
          default:
            return row.AdmissionStatus
        }
      }
    },
    {
      title: "Status", field: "SessionAction", hozAlign: "center", render: (row) => {
        switch (row.SessionAction) {
          case 0:
            return <p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">Pending</p>;
          case 1:
            return <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">Active</p>;
          default:
            return row.AdmissionStatus
        }
      }
    },
    // {
    //   title: "Action", field: "SessionSerial", hozAlign: "center",
    //   render: (row) => (
    //     <button
    //       onClick={() => handleActionClick(row)}
    //       className="px-4 py-2 bg-blue-500 text-white rounded"
    //     >
    //       Edit
    //     </button>
    //   )
    // }
  ];
  const columnsNotAdmitedStudent = [
    { title: "User Id", field: "UserID", hozAlign: 'center' },
    { title: "Student Id", field: "UserCode", hozAlign: 'center' },
    { title: "Name", field: "UserName" },
    { title: "Class", field: "ClassName", hozAlign: 'center' },
    { title: "Section", field: "SubClass", hozAlign: "center" },
    {
      title: "Gender", field: "GenderID", hozAlign: "center",
      render: (row) => {
        const genderMap = {
          1: "Male",
          2: "Female",
          3: "Other"
        };
        return genderMap[row.GenderID] || "N/A";
      }
    },
    {
      title: "Date of join", field: "CreateAt", hozAlign: "center",
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB')
      }
    },
    {
      title: "Action", field: "SessionSerial", hozAlign: "center",
      render: (row) => (
        <button
          onClick={() => { handleOpenModal(row.UserID) }}
          className="px-4 py-2 bg-rose-500 text-white rounded"
        >
          {translate("Complete Admission")}
        </button>
      )
    }
  ];

  return (
    <div className="-translate-y-4 font-lato">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b  border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold ">{filter == 2 ? translate("Not Admitted Students List") : translate("Admitted Students List")}</h3>
          <div className="flex items-center space-x-5">
            <div className="filter relative">
              {/* <SelectGroupTwo /> */}
              {/* <button type="button" onClick={exportToCSV}>Export</button>
              <Flatpickr
                className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                options={{
                  mode: "range",
                  dateFormat: "Y-m-d"
                }}
                onChange={(selectedDates) => setSelectedDateRange(selectedDates)}
              /> */}

              <FilterSelectGroup defaultSelect={filter} options={[{ id: 0, value: translate("Admitted students") }, { id: 2, value: translate("Not Admitted students") }]} nameField={"value"} valueField={"id"} />

            </div>

          </div>
        </div>
        <SortableTable
          columns={filter == 2 ? columnsNotAdmitedStudent : columnsAdmitedStudent}
          data={filter == 2 ? userOnlyStudents : studentList}
        />
      </div>
    </div>




  )
}
export default AddStudent;