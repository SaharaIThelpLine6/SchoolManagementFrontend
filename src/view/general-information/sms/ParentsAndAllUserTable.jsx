import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import Loading from "../../../components/Loading/Loading";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";
import Swal from "sweetalert2";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import { FormProvider, useForm } from "react-hook-form";
import { useGetStudentBySearchQuery } from "../../../features/student/studentQuerySlice";
import {
  clearParentsData,
  deleteParentData,
  setParentsData,
} from "../../../features/student/studentSlice";
// import { isEqual } from "lodash";
import SvgIcon from "../../../components/icons/SvgIcon";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";
import { isEqual } from "../../../utils/isEqual";

const PAGE_SIZE = 5;

const ParentsAndAllUserTable = ({ pageTitle, checkedValue }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const prevStudentDataRef = useRef([]);

  const selectedSessionID = watch("SessionID");
  const selectedClassID = watch("ClassID");
  const selectedType = watch("ID");

  const params = {
    report_id: 1,
    gender: 3,
    user_type: selectedType,
    is_active: 1,
  };

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();

  const studentData = useSelector((state) => state.student.parentsData); // ✅ Access correct slice

  const {
    data: studentDatas = [],
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

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    const hasValidData = Array.isArray(studentDatas) && studentDatas.length > 0;

    if (!isError && hasValidData) {
      if (!isEqual(studentDatas, prevStudentDataRef.current)) {
        prevStudentDataRef.current = studentDatas;
        dispatch(setParentsData(studentDatas));
      }
    } else if (isError && prevStudentDataRef.current.length > 0) {
      prevStudentDataRef.current = [];
      dispatch(clearParentsData());
    }
  }, [studentDatas, isError, dispatch]);

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
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteParentData(StudentCode));
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


  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md flex justify-center items-center"
            title={translate("Delete")}
            onClick={() => handleDelete(row.StudentCode)}
          >
            <SvgIcon name={"FaTrash"} size={20} />
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
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </FormProvider>
  );
};

export default ParentsAndAllUserTable;
