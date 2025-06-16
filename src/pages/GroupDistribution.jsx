import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import Swal from "sweetalert2";
import Loading from "../components/Loading/Loading";
import { FiEdit } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Button from "../components/Button/Button";

const PAGE_SIZE = 10;

const GroupDistribution = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // Sample data for demonstration
  const groupDistributionData = [
    { ID: 1, StudentID: "S001", StudentName: "আহমেদ রহমান", CurrentGroup: "A", NewGroup: "B" },
    { ID: 2, StudentID: "S002", StudentName: "ফাতেমা আক্তার", CurrentGroup: "B", NewGroup: "A" },
    { ID: 3, StudentID: "S003", StudentName: "করিম উদ্দিন", CurrentGroup: "C", NewGroup: "D" },
    { ID: 4, StudentID: "S004", StudentName: "সুমাইয়া ইসলাম", CurrentGroup: "D", NewGroup: "C" },
  ];

  const groupChangeData = [
    { ID: 1, StudentID: "S001", StudentName: "আহমেদ রহমান", PreviousGroup: "A", NewGroup: "B", Date: "2023-05-15" },
    { ID: 2, StudentID: "S002", StudentName: "ফাতেমা আক্তার", PreviousGroup: "B", NewGroup: "A", Date: "2023-06-20" },
  ];

  const [activeTab, setActiveTab] = useState("distribution");
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: "distribution", label: "গ্রুপ বন্টন" },
    { id: "change", label: "গ্রুপ পরিবর্তন" },
  ];

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const currentData = activeTab === "distribution" ? groupDistributionData : groupChangeData;
  const totalPages = Math.ceil(currentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return currentData.slice(start, start + PAGE_SIZE);
  }, [currentData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    const modalType = activeTab === "distribution" ? "ADD_GROUP_DISTRIBUTION" : "ADD_GROUP_CHANGE";
    showModal(translate(activeTab === "distribution" ? "Group Distribution Create" : "Group Change Create"), modalType);
  }, [translate, activeTab]);

  const handleEditOpenModal = useCallback(
    (id) => {
      const modalType = activeTab === "distribution" ? "EDIT_GROUP_DISTRIBUTION" : "EDIT_GROUP_CHANGE";
      showModal(translate(activeTab === "distribution" ? "Group Distribution Update" : "Group Change Update"), modalType, id);
    },
    [translate, activeTab]
  );

  const columnsDistribution = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Student ID"),
      field: "StudentID",
      hozAlign: "center",
    },
    {
      title: translate("Student Name"),
      field: "StudentName",
      hozAlign: "center",
    },
    {
      title: translate("Current Group"),
      field: "CurrentGroup",
      hozAlign: "center",
    },
    {
      title: translate("New Group"),
      field: "NewGroup",
      hozAlign: "center",
    },
  ];

  const columnsChange = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.ID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Student ID"),
      field: "StudentID",
      hozAlign: "center",
    },
    {
      title: translate("Student Name"),
      field: "StudentName",
      hozAlign: "center",
    },
    {
      title: translate("Previous Group"),
      field: "PreviousGroup",
      hozAlign: "center",
    },
    {
      title: translate("New Group"),
      field: "NewGroup",
      hozAlign: "center",
    },
    {
      title: translate("Date"),
      field: "Date",
      hozAlign: "center",
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <nav className="bg-gray-50 border-b border-gray-200 mb-6">
        <ul className="flex">
          {tabs.map((tab) => (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`w-full py-3 px-4 text-center font-medium transition-all duration-200 relative ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate(activeTab === "distribution" ? "Group Distribution List" : "Group Change History")}
          </h3>
          <Button onClick={() => handleOpenModal()}>
            {translate(activeTab === "distribution" ? "Create Distribution" : "Record Change")}
          </Button>
        </div>

        <SortableTable 
          columns={activeTab === "distribution" ? columnsDistribution : columnsChange} 
          data={paginatedData} 
        />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <MdKeyboardArrowLeft className="text-lg" />
            {translate("Prev")}
          </button>

          <span className="text-sm font-medium text-gray-700">
            {translate("Page")} {currentPage} {translate("of")} {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            {translate("Next")}
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupDistribution;

// import { FormProvider, useForm } from "react-hook-form";
// import { useState } from "react";
// import DefaultGray from "../components/Button/DefaultGray";
// import DefaultInput from "../components/Forms/DefaultInput";
// import DefaultSelect from "../components/Forms/DefaultSelect";

// const GroupDistribution = () => {
//   const methods = useForm();
//   const [activeTab, setActiveTab] = useState("distribution");
  
//   const tabs = [
//     { id: "distribution", label: "গ্রুপ বন্টন" },
//     { id: "change", label: "গ্রুপ পরিবর্তন" },
//   ];

//   // Common select options
//   const academicYearOptions = [
//     { id: "1", value: "2025" },
//     { id: "2", value: "2025-2026" },
//     { id: "3", value: "2026" },
//   ];

//   const classOptions = [
//     { id: "1", value: "Play" },
//     { id: "2", value: "Nursery" },
//     { id: "3", value: "Nurani" },
//   ];

//   const genderOptions = [
//     { id: "1", value: "Male" },
//     { id: "2", value: "Female" },
//     { id: "3", value: "Common" },
//   ];

//   const subClassOptions = [
//     { id: "1", value: "A" },
//     { id: "2", value: "B" },
//     { id: "3", value: "C" },
//     { id: "4", value: "D" },
//   ];

//   return (
//     <FormProvider {...methods}>
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         {/* Tab Navigation */}
//         <nav className="bg-gray-50 border-b border-gray-200">
//           <ul className="flex">
//             {tabs.map((tab) => (
//               <li key={tab.id} className="flex-1">
//                 <button
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full py-3 px-4 text-center font-medium transition-all duration-200 relative ${
//                     activeTab === tab.id
//                       ? "text-blue-600 bg-white"
//                       : "text-gray-600 hover:bg-gray-100"
//                   }`}
//                 >
//                   {tab.label}
//                   {activeTab === tab.id && (
//                     <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
//                   )}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>

//         {/* Tab Content */}
//         <div className="p-5">
//           {activeTab === "distribution" && (
            // <form>
            //   <div className="w-full gap-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            //     {/* Academic Year */}
            //     <div className="space-y-1">
            //       <DefaultSelect
            //         label={<p className="text-gray-700 font-medium">শিক্ষাবর্ষ :</p>}
            //         options={academicYearOptions}
            //         valueField="id"
            //         nameField="value"
            //         registerKey="academicYear"
            //       />
            //     </div>

            //     {/* Class/Marhala */}
            //     <div className="space-y-1">
            //       <DefaultSelect
            //         label={<p className="text-gray-700 font-medium">মারহালা/ক্লাশ:</p>}
            //         options={classOptions}
            //         valueField="id"
            //         nameField="value"
            //         registerKey="class"
            //       />
            //     </div>

            //     {/* Gender */}
            //     <div className="space-y-1">
            //       <DefaultSelect
            //         label={<p className="text-gray-700 font-medium">লিঙ্গ:</p>}
            //         options={genderOptions}
            //         valueField="id"
            //         nameField="value"
            //         registerKey="gender"
            //       />
            //     </div>

            //     {/* Sub Class ID */}
            //     <div className="space-y-1">
            //       <DefaultInput
            //         label={<p className="text-gray-700 font-medium">সাব ক্লাস আইডি :</p>}
            //         type="number"
            //         placeholder="সাব ক্লাস আইডি লিখুন"
            //         registerKey="subClassId"
            //       />
            //     </div>

            //     {/* Sub Class */}
            //     <div className="space-y-1">
            //       <DefaultSelect
            //         label={<p className="text-gray-700 font-medium">সাব ক্লাস :</p>}
            //         options={subClassOptions}
            //         valueField="id"
            //         nameField="value"
            //         registerKey="subClass"
            //       />
            //     </div>
            //   </div>
              
            //   <div className="flex mt-6 border-t pt-5">
            //     <DefaultGray submitButton="সংরক্ষণ করুন" />
            //   </div>
            // </form>
//           )}

//           {activeTab === "change" && (
            // <form>
            //   <div className="w-full gap-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            //     {/* Student ID */}
            //     <div className="space-y-1">
            //       <DefaultInput
            //         label={<p className="text-gray-700 font-medium">শিক্ষার্থী আইডি :</p>}
            //         type="number"
            //         placeholder="শিক্ষার্থী আইডি লিখুন"
            //         registerKey="studentId"
            //       />
            //     </div>

            //     {/* Student Name */}
            //     <div className="space-y-1">
            //       <DefaultInput
            //         label={<p className="text-gray-700 font-medium">শিক্ষার্থী নাম :</p>}
            //         type="text"
            //         placeholder="শিক্ষার্থীর নাম লিখুন"
            //         registerKey="studentName"
            //       />
            //     </div>

            //     {/* Current Sub Class */}
            //     <div className="space-y-1">
            //       <DefaultSelect
            //         label={<p className="text-gray-700 font-medium">সাব মারহালা :</p>}
            //         options={subClassOptions}
            //         valueField="id"
            //         nameField="value"
            //         registerKey="currentSubClass"
            //       />
            //     </div>
            //   </div>
              
            //   <div className="flex mt-6 border-t pt-5">
            //     <DefaultGray submitButton="গ্রুপ পরিবর্তন" />
            //   </div>
            // </form>
    //       )}
    //     </div>
    //   </div>
    // </FormProvider>
//   );
// };

// export default GroupDistribution;