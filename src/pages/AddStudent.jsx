import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { fetchStudentData } from "../features/student/studentSlice";
import SortableTable from "../components/Tables/SortableTable";
const AddStudent = ({ pageTitle }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const { studentList, status, error } = useSelector((state) => state.student);
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
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchStudentData())
    dispatch(setPageName(pageTitle))
  }, [dispatch])

  const columns = [
    { title: "User Id", field: "UserID", hozAlign: 'center' },
    { title: "Admission No / Roll No", field: "AdmissionID", hozAlign: 'center' },
    { title: "Student Id", field: "StudentCode", hozAlign: 'center' },
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
    { title: "Date of join", field: "CreateAt", hozAlign: "center",
      render: (row) =>{
        return new Date(row.CreateAt).toLocaleDateString('en-GB')
      }
     },
    { title: "Payment status", field: "AdmissionStatus", hozAlign: "center", render: (row)=>{
      switch (row.AdmissionStatus){
        case 0:
          return <p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">Pending</p>;
        case 1:
          return <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">Paid</p>;
        case 2:
          return <p className="inline-flex rounded-lg bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">Free</p>;
        case 3:
            return <p className="inline-flex rounded-lg bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">Unpaid</p>;
        default:
          return row.AdmissionStatus
      }
    } },
    { title: "Status", field: "SessionAction", hozAlign: "center", render: (row)=>{
      switch (row.SessionAction){
        case 0:
          return <p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">Pending</p>;
        case 1:
          return <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">Active</p>;
        default:
          return row.AdmissionStatus
      }
    } },
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

  if (status === 'succeeded') {
    console.log(studentList);
  }

  return (
    <div className="-translate-y-4 font-lato">

      {/* <h1 className="mt-[-7px] pb-[6px] pt-[10px] 2xl:py-[12px] px-[12px] text-white bg-green-600 text-center mx-auto text-[18px] 2xl:text-xl w-full font-normal font-lato block border-0">শিক্ষার্থী ভর্তি ফর্ম</h1> */}
      {studentList.length ? (
        <div className="block w-full overflow-x-auto">
          {/* <div className="filter_header flex items-center justify-between px-5 py-5">
            <h3>Students List</h3>
            <div className="filter relative">
              <FilterDropdown />
            </div>
          </div> */}
          <SortableTable columns={columns} data={studentList} />
        </div>
      ) : null}









    </div>




  )
}
export default AddStudent;