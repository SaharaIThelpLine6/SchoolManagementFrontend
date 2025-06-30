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

const AverageVCondition = ({ pageTitle }) => {
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

export default AverageVCondition;

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useDispatch } from "react-redux";
// import { setPageName } from "../features/auth/authSlice";
// import { useLocation } from "react-router-dom";
// import useTranslate from "../utils/Translate";
// import { showModal } from "../utils/ModalControlar";
// import {
//   MdDelete,
//   MdKeyboardArrowLeft,
//   MdKeyboardArrowRight,
// } from "react-icons/md";
// import Button from "../components/Button/Button";
// import { FormProvider, useForm } from "react-hook-form";
// import DefaultSelect from "../components/Forms/DefaultSelect";
// import DefaultInput from "../components/Forms/DefaultInput";
// import {
//   useGetStudentBySearchQuery,
//   usePostChnageStudentGroupMutation,
// } from "../features/student/studentQuerySlice";
// import { useGetSessionsQuery } from "../features/session/sessionSlice";
// import { useGetClassListQuery } from "../features/class/classQuerySlice";
// import bnBijoy2Unicode from "../utils/conveter";
// import Swal from "sweetalert2";
// import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
// import { FaPlus } from "react-icons/fa";
// import SortableTable from "../components/Tables/SortableTable";
// import { useGetDesignationQuery } from "../features/teachers/teachersSlice";
// import { FiEdit } from "react-icons/fi";
// import StudentFeeGroup from "../view/exam/StudentFeeGroup";

// const PAGE_SIZE = 10;

// const AverageVCondition = ({ pageTitle }) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const methods = useForm();
//   const { watch, handleSubmit } = methods;
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false); // State to toggle components

//   const genderOptions = [
//     { id: "1", value: "পুরুষ" },
//     { id: "2", value: "মহিলা" },
//     { id: "3", value: "উভয়" },
//   ];

//   const SessionID = watch("SessionID");
//   const ClassID = watch("ClassID");
//   const genderId = watch("gender");
//   const {
//     data: designation = [],
//     isLoading: isdLoading,
//     isError: isdError,
//   } = useGetDesignationQuery();
//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: classListData } = useGetClassListQuery();
//   const [postChnageStudentGroup, { isLoading, isSuccess, isError }] =
//     usePostChnageStudentGroupMutation();

//   const selectedClass = classListData?.find((item) => item.ClassID == ClassID);

//   const { data: searchStudentInfo = [], refetch } = useGetStudentBySearchQuery(
//     { search: null, ClassID, SessionID, GenderID: genderId },
//     {
//       skip: !ClassID || !SessionID || !genderId,
//       refetchOnFocus: false,
//     }
//   );

//   useEffect(() => {
//     if (pageTitle) dispatch(setPageName(pageTitle));
//   }, [dispatch, pageTitle]);

//   const totalPages = Math.ceil(designation.length / PAGE_SIZE);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return designation.slice(start, start + PAGE_SIZE);
//   }, [designation, currentPage]);

//   const handleNext = () => {
//     if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
//   };

//   const handlePrev = () => {
//     if (currentPage > 1) setCurrentPage((prev) => prev - 1);
//   };

//   const onSubmit = async (data) => {
//     try {
//       if (!data.SubClassID || selectedRows.length === 0) {
//         Swal.fire({
//           icon: "warning",
//           title: "ফর্ম অসম্পূর্ণ",
//           text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
//         });
//         return;
//       }

//       const response = await postChnageStudentGroup({
//         id: data.SubClassID,
//         body: { admissionIds: selectedRows },
//       }).unwrap();

//       Swal.fire({
//         icon: "success",
//         title: "সফলভাবে সংরক্ষণ হয়েছে",
//         text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
//       }).then(() => {
//         refetch();
//         setSelectedRows([]);
//         methods.reset();
//       });
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "ত্রুটি ঘটেছে!",
//         text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
//       });
//       console.error("Error updating student group:", error);
//     }
//   };

//   const handleShowStudentFeeGroup = () => {
//     setShowStudentFeeGroup(true);
//   };

//   console.log(showStudentFeeGroup);

//   const columns = [
//     {
//       title: translate("Action"),
//       hozAlign: "center",
//       render: (row) => (
//         <div className="flex justify-center items-center gap-2">
//           <button
//             className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
//             title="Edit"
//           >
//             <FiEdit className="w-5 h-5" />
//           </button>
//           <button
//             className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
//             title="Delete"
//             onClick={() => handleDelete(row.DNID)}
//           >
//             <MdDelete className="w-5 h-5" />
//           </button>
//         </div>
//       ),
//     },
//     { title: "SL", field: "SL", hozAlign: "center" },
//     {
//       title: translate("Session"),
//       field: "Designation",
//       hozAlign: "center",
//     },
//     {
//       title: translate("Exam Name"),
//       field: "Designation",
//       hozAlign: "center",
//     },
//     {
//       title: translate("Class/Jamaat"),
//       field: "Designation",
//       hozAlign: "center",
//     },
//     {
//       title: translate("Fee Name"),
//       field: "Designation",
//       hozAlign: "center",
//     },
//     {
//       title: translate("Fee"),
//       field: "Designation",
//       hozAlign: "center",
//     },
//   ];

//   if (showStudentFeeGroup) {
//     return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
//   }

//   return (
//     <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
//       <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
//         <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
//           {translate("Average based Condition")}
//         </h3>
//       </div>

//       {/* <FormProvider {...methods}>
//         <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
//           <div className="flex flex-col sm:flex-row my-5 gap-5">
//             <DefaultSelect
//               label={translate("Exam Name") + " :"}
//               options={classListData ?? []}
//               valueField="ClassID"
//               nameField="ClassName"
//               registerKey="ClassID"
//             />
//             <DefaultSelect
//               label={translate("Exam Name") + " :"}
//               options={classListData ?? []}
//               valueField="ClassID"
//               nameField="ClassName"
//               registerKey="ClassID"
//             />

//             <DefaultSelect
//               label={
//                 <p className="text-gray-700 font-medium">
//                   {translate("Class/Jamaat")}:
//                 </p>
//               }
//               options={genderOptions}
//               valueField="id"
//               nameField="value"
//               registerKey="gender"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">

//             <div className="flex flex-col space-y-2">
//               <div className="flex justify-center items-center my-4">
//                 <h2 className="text-base font-semibold text-gray-800">
//                   {translate("Average Condition")}
//                 </h2>
//               </div>

//               <DefaultSelect
//                 label={translate("Session") + " :"}
//                 options={sessionData ?? []}
//                 valueField="SessionID"
//                 nameField="SessionName"
//                 registerKey="SessionID"
//               />
//               <DefaultSelect
//                 label={translate("Exam Name") + " :"}
//                 options={classListData ?? []}
//                 valueField="ClassID"
//                 nameField="ClassName"
//                 registerKey="ClassID"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />
//             </div>
//             <div className="flex flex-col space-y-2">
//                 <div className="flex justify-center items-center my-4">
//                 <h2 className="text-base font-semibold text-gray-800">
//                   {translate("Bangla")}
//                 </h2>
//               </div>
//               <DefaultSelect
//                 label={translate("Session") + " :"}
//                 options={sessionData ?? []}
//                 valueField="SessionID"
//                 nameField="SessionName"
//                 registerKey="SessionID"
//               />
//               <DefaultSelect
//                 label={translate("Exam Name") + " :"}
//                 options={classListData ?? []}
//                 valueField="ClassID"
//                 nameField="ClassName"
//                 registerKey="ClassID"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />
//             </div>
//             <div className="flex flex-col space-y-2">
//                 <div className="flex justify-center items-center my-4">
//                 <h2 className="text-base font-semibold text-gray-800">
//                   {translate("Arabic")}
//                 </h2>
//               </div>
//               <DefaultSelect
//                 label={translate("Session") + " :"}
//                 options={sessionData ?? []}
//                 valueField="SessionID"
//                 nameField="SessionName"
//                 registerKey="SessionID"
//               />
//               <DefaultSelect
//                 label={translate("Exam Name") + " :"}
//                 options={classListData ?? []}
//                 valueField="ClassID"
//                 nameField="ClassName"
//                 registerKey="ClassID"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />

//               <DefaultSelect
//                 label={
//                   <p className="text-gray-700 font-medium">
//                     {translate("Class/Jamaat")}:
//                   </p>
//                 }
//                 options={genderOptions}
//                 valueField="id"
//                 nameField="value"
//                 registerKey="gender"
//               />
//             </div>

//             <div className="flex flex-col space-y-4">
//                 <div className="flex justify-center items-center my-4">
//                 <h2 className="text-base font-semibold text-gray-800">
//                   {translate("Highest recitation score")}
//                 </h2>
//               </div>
//               <DatePickerOne
//                 dateCalender={`${translate("Date")}: `}
//                 placeholder={""}
//                 registerKey={"Date"}
//                 require={"Date Require"}
//               />

//               <div className="flex flex-row items-center justify-center gap-2">
//                 <DefaultSelect
//                   label={`${translate("Fee Name")}:`}
//                   nameField="VacationList"
//                   registerKey="ID"
//                   valueField="ID"
//                   options={null}
//                   type="number"
//                   require="This Field is required"
//                   disabled={false}
//                   defaultSelect={false}
//                   unicode={true}
//                 />
//                 <Button
//                   onClick={handleShowStudentFeeGroup}
//                   className="bg-[#EDEDED] mt-7 rounded-md py-3"
//                 >
//                   <FaPlus />
//                 </Button>
//               </div>

//               <DefaultInput
//                 registerKey={"StudentName"}
//                 label={`${translate("Fee")}: `}
//               />
//             </div>
//           </div>
//           <div className="w-full">
//             <Button type="submit" className="w-full md:w-auto">
//               {translate("Save")}
//             </Button>
//           </div>
//         </form>
//       </FormProvider> */}

//       {/* <div className="mt-5">
//         <SortableTable columns={columns} data={paginatedData} />
//       </div> */}
// {/*
//       <div className="flex justify-center items-center mt-4">
//         <div className="flex items-center space-x-2">
//           <button
//             className="p-1 border rounded disabled:opacity-50"
//             onClick={handlePrev}
//             disabled={currentPage === 1}
//           >
//             <MdKeyboardArrowLeft size={24} />
//           </button>
//           <span>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             className="p-1 border rounded disabled:opacity-50"
//             onClick={handleNext}
//             disabled={currentPage === totalPages}
//           >
//             <MdKeyboardArrowRight size={24} />
//           </button>
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default AverageVCondition;
