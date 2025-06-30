import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import AverageDetermination from "../view/exam/average-condition/AverageDetermination";
import SubjectPassNumber from "../view/exam/average-condition/SubjectPassNumber";
import ResultsCondition from "../view/exam/average-condition/ResultsCondition";
import Button from "../components/Button/Button";

const AverageVCondition = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("average");

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const tabs = [
    {
      id: "average",
      label: "Average Determination",
      component: <AverageDetermination title="Average Determination"/>
    },
    {
      id: "subject",
      label: "Subject Pass number",
      component: <SubjectPassNumber title="Subject Pass number"/>
    },
    {
      id: "results",
      label: "Results Condition",
      component: <ResultsCondition title="Results Condition"/>
    }
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 !text-black "
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="mt-4">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AverageVCondition;

// import { useEffect, useMemo, useState } from "react";
// import { useDispatch } from "react-redux";
// import { setPageName } from "../features/auth/authSlice";
// import useTranslate from "../utils/Translate";
// import { useForm } from "react-hook-form";

// import StudentFeeGroup from "../view/exam/StudentFeeGroup";
// import bnBijoy2Unicode from "../utils/conveter";

// const mockPaginatedData = [
//   {
//     AdmissionID: 1,
//     StudentCode: "U1001",
//     StudentName: "Rahim Uddin",
//     ClassName: "Class 5",
//     SubClass: "A",
//     ResidentialName: "Residential",
//   },
//   {
//     AdmissionID: 2,
//     StudentCode: "U1002",
//     StudentName: "Karim Mia",
//     ClassName: "Class 4",
//     SubClass: "B",
//     ResidentialName: "Non-Residential",
//   },
//   {
//     AdmissionID: 3,
//     StudentCode: "U1003",
//     StudentName: "Amina Khatun",
//     ClassName: "Class 3",
//     SubClass: "A",
//     ResidentialName: "Residential",
//   },
//   {
//     AdmissionID: 4,
//     StudentCode: "U1004",
//     StudentName: "Sajedul Islam",
//     ClassName: "Class 2",
//     SubClass: "C",
//     ResidentialName: "Non-Residential",
//   },
//   {
//     AdmissionID: 5,
//     StudentCode: "U1005",
//     StudentName: "Nasima Akter",
//     ClassName: "Class 1",
//     SubClass: "B",
//     ResidentialName: "Residential",
//   },
// ];

// const AverageVCondition = ({ pageTitle }) => {
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const methods = useForm();

//   const [selectedRows, setSelectedRows] = useState([]);
//   const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);

//   const handleSelectAll = (e) => {
//     if (e.target.checked) {
//       const allIds = mockPaginatedData.map((s) => s.AdmissionID);
//       setSelectedRows(allIds);
//     } else {
//       setSelectedRows([]);
//     }
//   };

//   const handleRowSelect = (e, id) => {
//     if (e.target.checked) {
//       setSelectedRows((prev) => [...prev, id]);
//     } else {
//       setSelectedRows((prev) => prev.filter((item) => item !== id));
//     }
//   };

//   const isAllSelected =
//     selectedRows.length === mockPaginatedData.length &&
//     mockPaginatedData.length > 0;

//   useEffect(() => {
//     if (pageTitle) {
//       dispatch(setPageName(pageTitle));
//     }
//   }, [dispatch, pageTitle]);

//   if (showStudentFeeGroup) {
//     return <StudentFeeGroup onBack={() => setShowStudentFeeGroup(false)} />;
//   }

//   return (
//     <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
//       {/* Header */}
//       <div className="border-b border-[#e9edf4] flex items-center justify-between py-5">
//         <h3 className="text-base sm:text-[20px] font-bold">
//           {translate("Average based Condition")}
//         </h3>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto mt-5">
//         <table className="w-full border border-gray-300">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-2 text-left">
//                 <input
//                   type="checkbox"
//                   onChange={handleSelectAll}
//                   checked={isAllSelected}
//                 />
//               </th>
//               <th className="p-2 text-left">{translate("User ID")}</th>
//               <th className="p-2 text-left">{translate("Student Name")}</th>
//               <th className="p-2 text-left">{translate("Class")}</th>
//               <th className="p-2 text-left">{translate("Sub Class")}</th>
//               <th className="p-2 text-left">{translate("Residential")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {mockPaginatedData.map((student) => (
//               <tr key={student.AdmissionID} className="border-t">
//                 <td className="p-2">
//                   <input
//                     type="checkbox"
//                     onChange={(e) => handleRowSelect(e, student.AdmissionID)}
//                     checked={selectedRows.includes(student.AdmissionID)}
//                   />
//                 </td>
//                 <td className="p-2">{student.StudentCode}</td>
//                 <td className="p-2">
//                   {bnBijoy2Unicode(student.StudentName)}
//                 </td>
//                 <td className="p-2">
//                   {bnBijoy2Unicode(student.ClassName)}
//                 </td>
//                 <td className="p-2">
//                   {bnBijoy2Unicode(student.SubClass)}
//                 </td>
//                 <td className="p-2">{student.ResidentialName}</td>
//               </tr>
//             ))}
//             {mockPaginatedData.length === 0 && (
//               <tr>
//                 <td colSpan="6" className="text-center p-4">
//                   {translate("No data found")}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//     </div>
//   );
// };

// export default AverageVCondition;
