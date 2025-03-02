


import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { fetchStudentData, fetchUserOnlyStudentData } from "../features/student/studentSlice";
import SortableTable from "../components/Tables/SortableTable";
import FilterSelectGroup from "../components/Forms/SelectGroup/FilterSelectGroup";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
const AddTeacher = ({ pageTitle }) => {
    const translate = useTranslate();
    const [selectedImage, setSelectedImage] = useState(null);
    const { studentList, userOnlyStudents, status, error } = useSelector((state) => state.student);
    const location = useLocation();
    const dispatch = useDispatch()
    const searchParams = new URLSearchParams(location.search);
    const filter = searchParams.get('filter');
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
  
    const columnsAdmitedStudent = [
      { title: "User Id", field: "UserID", hozAlign: 'center' },
      { title: "Admission No / Roll No", field: "AdmissionID", hozAlign: 'center' },
      { title: "Student Id", field: "StudentCode", hozAlign: 'center',type: 'text', filterable: true },
      { title: "Name", field: "StudentName", render: (row) =>{
        return <input type="text" placeholder={row.StudentName} />
      }},
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
        title: "Date of join", field: "CreateAt", hozAlign: "center",type: "range", filterable: true,
        render: (row) => {
          return new Date(row.CreateAt).toLocaleDateString('en-GB')
        }
      },
      {
        title: "Payment status", field: "AdmissionStatus", hozAlign: "center",type: "select", filterable: true, options: [
          { label: "Pending", value: 0 },
          { label: "Paid", value: 1 },
          { label: "Free", value: 2 },
          { label: "Unpaid", value: 3 },
        ], render: (row) => {
          switch (row.AdmissionStatus) {
            case 0:
              return <button type="button" onClick={()=>{handleFeeCollectionModal(row.UserID)}}><p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">Pending</p></button>;
            case 1:
              return <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">Paid</p>;
            case 2:
              return <p className="inline-flex rounded-lg bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">Free</p>;
            case 3:
              return <p className="inline-flex rounded-lg bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">Unpaid</p>;
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
      { title: "Gender", field: "GenderID", hozAlign: "center",
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
            onClick={()=>{handleOpenModal(row.UserID)}}
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
            <h3 className="font-SolaimanLipi text-[20px] font-bold ">{filter == 2 ? translate("Admitted Teacher List") : translate("Not Admitted Teacher List")}</h3>
            <div className="flex items-center space-x-5">
              <div className="filter relative">
                {/* <SelectGroupTwo /> */}
                <FilterSelectGroup defaultSelect={filter} options={[{id: 0, value: translate("Admitted Teacher List")}, {id: 2, value: translate("Not Admitted Teacher List")}]} nameField={"value"} valueField={"id"} />
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
};

export default AddTeacher;