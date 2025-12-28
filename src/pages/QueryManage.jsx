import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";

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
const API_URL = import.meta.env.VITE_SERVER_URL;
const QueryManage = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [query, setQuery] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const methods = useForm();
  const { watch, handleSubmit, reset } = methods;
  const [selectedRows, setSelectedRows] = useState([]);
  const [queryResult, setQueryResult] = useState([]);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log(selectedRows);
  useEffect(() => {
    // Fetch data when component mounts
    fetch(`${API_URL}/api/querymanage/database_list`)
      .then((res) => res.json())
      .then((data) => {
        setDataList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setLoading(false);
      });
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = dataList.map((s) => s.ID);
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
    selectedRows.length === dataList.length &&
    dataList.length > 0;

  useEffect(() => {
    if (pageTitle) {
      dispatch(setPageName(pageTitle));
    }
  }, [dispatch, pageTitle]);

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={() => setShowStudentFeeGroup(false)} />;
  }

  const handleQueryRun = async () => {

    if (query.trim() === "" && selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: translate("Please enter a query"),
        confirmButtonText: translate("OK"),
      });
      return;
    }
    setDisableButton(true)
    const confirmed = window.confirm("Are you sure you want to Run this Query?");
    if (confirmed) {
      console.log("Running query:", query);
      console.log("Selected rows:", selectedRows);

      try {
        const response = await fetch(`${API_URL}/api/querymanage/rundb_query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query,
            databaseids: selectedRows,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setDisableButton(false)
          console.log("Query Result:", result);
          setQueryResult(result.results || []);
        } else {
          setDisableButton(false)
          console.error("Server Error:", result);
          alert("Query failed: " + result.message);

        }
      } catch (error) {
        setDisableButton(false)
        console.error("Fetch Error:", error);
        alert("Network or server error occurred.");
      }

    } else {
      setDisableButton(false)
      console.log("Delete cancelled");
    }


    // Simulate running the query
    // Swal.fire({
    //   icon: "success",
    //   title: translate("Query executed successfully"),
    //   confirmButtonText: translate("OK"),
    // });

    // // Reset selected rows after running the query
    // setSelectedRows([]);
  }
  const exportDataset = async () => {

    setDisableButton(true)
    const confirmed = window.confirm("Are you sure you want to Run this Query?");
    try {
      const response = await fetch(`${API_URL}/api/querymanage/export_databases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          databaseids: selectedRows,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setDisableButton(false)
        console.log("Query Result:", result);
      } else {
        setDisableButton(false)
        console.error("Server Error:", result);
        alert("Query failed: " + result.message);

      }
    } catch (error) {
      setDisableButton(false)
      console.error("Fetch Error:", error);
      alert("Network or server error occurred.");
    }


    setDisableButton(false)



    // Simulate running the query
    // Swal.fire({
    //   icon: "success",
    //   title: translate("Query executed successfully"),
    //   confirmButtonText: translate("OK"),
    // });

    // // Reset selected rows after running the query
    // setSelectedRows([]);
  }

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-[#e9edf4] py-5 gap-4">
        <h3 className="text-base sm:text-[20px] font-bold mb-4">
          {translate("Average based Condition")}
        </h3>

        <div className="flex justify-between w-full items-end gap-4">
          <div className="w-1/2">
            <label
              htmlFor="conditionNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {translate("Notes")}
            </label>
            <textarea
              id="conditionNotes"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder={translate("Enter your notes here...")}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </div>
          {/* `
          SELECT ClassID
      ,Serial
      ,ClassName
      ,ArabicClass
      ,EnglishClass
      ,CreateAt
      ,UpdateAt
      ,CreateUserID
      ,UpdateUserID
  FROM Academic_Class
  ভার্সন নং ১০, রায়পুরা, নরসিংদী
          ` */}
          <div className="flex w-1/2 items-end gap-4">
            <div className="table-responsive h-[200px] overflow-y-auto w-full">
              {
                queryResult.length > 0 ? (
                  <table className="table table-striped table-bordered w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Database</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.id}</td>
                            <td>{item.db}</td>
                            <td>{item.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                ) : null
              }

            </div>

            <button type="button" className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-[150px] max-h-[40px]" onClick={exportDataset} disabled={disableButton}>Export</button>

            <button type="button" className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-[150px] max-h-[40px]" onClick={handleQueryRun} disabled={disableButton}>Run</button>
          </div>

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
              <th className="p-2 text-left">{translate("Name")}</th>
              <th className="p-2 text-left">{translate("Name")}</th>
              <th className="p-2 text-left">{translate("Entry Date")}</th>
              <th className="p-2 text-left">{translate("Expry Date")}</th>
              <th className="p-2 text-left">{translate("Remaining days")}</th>
              <th className="p-2 text-left">{translate("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((student) => (
              <tr key={student.ID} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    onChange={(e) => handleRowSelect(e, student.ID)}
                    checked={selectedRows.includes(student.ID)}
                  />
                </td>
                <td className="p-2">{student.UserCode}</td>
                <td className="p-2">{bnBijoy2Unicode(student.InstituteName)}</td>
                <td className="p-2">{student.DatabaseName}</td>
                <td className="p-2">{student.EntryDate}</td>
                <td className="p-2">{student.ExpryDate}</td>
                <td className="p-2">{student.RenewDays}</td>
                <td className="p-2">{student.Action}</td>
              </tr>
            ))}
            {dataList.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  {translate("No data found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};


export default QueryManage