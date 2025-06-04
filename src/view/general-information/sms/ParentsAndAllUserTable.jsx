import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import Loading from "../../../components/Loading/Loading";
import SortableTable from "../../../components/Tables/SortableTable";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useTranslate from "../../../utils/Translate";
import Swal from "sweetalert2";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetUserTypesQuery } from "../../../features/userType/userTypeSlice";
import { FormProvider, useForm } from "react-hook-form";
import { useGetStudentBySearchQuery } from "../../../features/student/studentQuerySlice";

const PAGE_SIZE = 10;

const ParentsAndAllUserTable = ({
  pageTitle,
  checkedValue,
}) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
const { watch } = methods;

  const selectedSessionID = watch("SessionID");
  const selectedClassID = watch("ClassID");

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const { data: userTypeData } = useGetUserTypesQuery();

  const {
    data: studentSMSData = [],
    isFetching: isStudentFetching,
    isError,
    refetch: refetchStudents,
  } = useGetStudentBySearchQuery(
    {
      ClassID: selectedClassID || null,
      SessionID: selectedSessionID || null,
    },
    {
      skip: !selectedClassID || !selectedSessionID,
    }
  );

  const [studentData, setStudentData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (isError) {
      setStudentData([]);
    } 
     if (studentSMSData) {
      setStudentData(studentSMSData);
    }
  }, [studentSMSData]);

  const handleDelete = async (StudentCode) => {
    Swal.fire({
      title: translate("Are you sure?"),
      text: translate("This will permanently delete the student record"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: translate("Yes, delete it!"),
      cancelButtonText: translate("Cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setStudentData((prev) =>
            prev.filter((student) => student.StudentCode !== StudentCode)
          );

          Swal.fire(
            translate("Deleted!"),
            translate("Student record has been deleted."),
            "success"
          );
        } catch (error) {
          Swal.fire(
            translate("Error!"),
            translate("Failed to delete student record"),
            "error"
          );
        }
      }
    });
  };

  const paginatedStudentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentData.slice(start, start + PAGE_SIZE);
  }, [studentData, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(studentData.length / PAGE_SIZE);
  }, [studentData]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title={translate("Delete")}
            onClick={() => handleDelete(row.StudentCode)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Student ID"),
      field: "StudentCode",
      hozAlign: "center",
    },
    { title: translate("Name"), field: "StudentName", hozAlign: "center" },
    {
      title: translate("Mobile Number"),
      field: "Mobile1",
      hozAlign: "center",
    },
  ];

  if (isStudentFetching) return <Loading />;

  return (
    <FormProvider {...methods}>
      <div>
        {checkedValue === "guardian" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <DefaultSelect
              options={sessionData || []}
              require={"Session is required"}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
              type={"number"}
              label={translate("Session")}
            />
            <DefaultSelect
              options={classData || []}
              require={"Class is required"}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              label={translate("Class")}
            />
          </div>
        )}

        {checkedValue === "all_users" && (
          <div className="grid gap-3 mb-3">
            <DefaultSelect
              options={userTypeData || []}
              require={"User Type is required"}
              nameField={"TypeName"}
              valueField={"ID"}
              registerKey={"ID"}
              type={"number"}
              label={translate("User Types")}
            />
          </div>
        )}

        {checkedValue === "guardian" ? (
          <>
            {selectedSessionID && selectedClassID ? (
              <SortableTable
                columns={columns}
                data={paginatedStudentData}
                isFilterColumn={false}
              />
            ) : (
              <p className="text-center text-gray-500 my-4">
                {translate(
                  "Please select both Session and Class to view student data."
                )}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p>
              {translate(
                "User management functionality will be implemented here"
              )}
            </p>
          </div>
        )}

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
    </FormProvider>
  );
};

export default ParentsAndAllUserTable;