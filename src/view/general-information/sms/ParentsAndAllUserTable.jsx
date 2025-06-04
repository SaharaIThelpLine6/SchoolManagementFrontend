import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import {
  useDeleteDesignationMutation,
  useGetDesignationQuery,
} from "../../../features/teachers/teachersSlice";
import Loading from "../../../components/Loading/Loading";
import SortableTable from "../../../components/Tables/SortableTable";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import useTranslate from "../../../utils/Translate";
import Swal from "sweetalert2";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetUserTypesQuery } from "../../../features/userType/userTypeSlice";
import { FormProvider, useForm } from "react-hook-form";
import { useGetStudentBySearchQuery } from "../../../features/student/studentQuerySlice";

const PAGE_SIZE = 10;

const ParentsAndAllUserTable = ({ pageTitle, checkedValue }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;

  const selectedSessionID = watch("SessionID");
  const selectedClassID = watch("Serial");

  const {
    data: designation = [],
    isLoading,
    isError,
  } = useGetDesignationQuery();

  const [deleteDesignation] = useDeleteDesignationMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const {
    data: userTypeData,
    isuserTypeLoading,
    isuserTypeError,
  } = useGetUserTypesQuery();

  const {
    data: studentData = [],
    isFetching: isStudentFetching,
  } = useGetStudentBySearchQuery(
    {
      // search: "",
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
    if (isError) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Failed to load designation data",
      });
    }
  }, [isError]);

  const paginatedDesignation = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);

  const paginatedStudentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentData.slice(start, start + PAGE_SIZE);
  }, [studentData, currentPage]);

  const totalPages =
    checkedValue === "guardian"
      ? Math.ceil(studentData.length / PAGE_SIZE)
      : Math.ceil(designation.length / PAGE_SIZE);

  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action will permanently delete the designation.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteDesignation(id).unwrap();
            Swal.fire("Deleted!", "The designation has been removed.", "success");
          } catch (error) {
            Swal.fire("Error!", "Failed to delete designation.", "error");
          }
        }
      });
    },
    [deleteDesignation]
  );

  if (isLoading) return <Loading />;

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
            title="Delete"
            onClick={() => handleDelete(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Student ID"),
      field: "শিক্ষার্থীর আইডি",
      hozAlign: "center",
    },
    { title: translate("Name"), field: "নাম", hozAlign: "center" },
    {
      title: translate("Mobile Number"),
      field: "মোবাইল নং",
      hozAlign: "center",
    },
  ];

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
              valueField={"Serial"}
              registerKey={"Serial"}
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
            {isStudentFetching ? (
              <p className="text-center text-blue-500">Loading student data...</p>
            ) : selectedSessionID && selectedClassID ? (
              <SortableTable
                columns={columns}
                data={paginatedStudentData}
                isFilterColumn={false}
              />
            ) : (
              <p className="text-center text-gray-500 my-4">
                Please select both Session and Class to view student data.
              </p>
            )}
          </>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedDesignation}
            isFilterColumn={false}
          />
        )}

        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <MdKeyboardArrowLeft className="text-lg" />
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            Next
            <MdKeyboardArrowRight className="text-lg" />
          </button>
        </div>
      </div>
    </FormProvider>
  );
};

export default ParentsAndAllUserTable;
