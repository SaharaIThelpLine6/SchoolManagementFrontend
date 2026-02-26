import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import Loading from "../../../components/Loading/Loading";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";
import Swal from "sweetalert2";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetUserTypesQuery } from "../../../features/userType/userTypeSlice";
import { FormProvider, useForm } from "react-hook-form";
import {
  clearAllUsersData,
  deleteAllUsersData,
  setAllUsersData,
} from "../../../features/student/studentSlice";
import { useGetUserReportQuery } from "../../../features/userReports/userReportsSlice";
import SvgIcon from "../../../components/icons/SvgIcon";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";
// import { isEqual } from "lodash";
import { isEqual } from "../../../utils/isEqual";

const PAGE_SIZE = 5;

const AllUsersData = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const prevUserDataRef = useRef([]);

  const selectedType = watch("ID");

  const params = {
    report_id: 1,
    gender: 3,
    user_type: selectedType,
    is_active: 1,
  };

  const {
    data: allUsersData,
    isFetching,
    isError: isAllUsersDataError,
    error,
  } = useGetUserReportQuery(params, {
    skip: !params,
  });

  const { data: userTypeData } = useGetUserTypesQuery();

  const userData = useSelector((state) => state.student.allUsers);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    const hasValidData = Array.isArray(allUsersData) && allUsersData.length > 0;

    if (!isAllUsersDataError && hasValidData) {
      if (!isEqual(allUsersData, prevUserDataRef.current)) {
        prevUserDataRef.current = allUsersData;
        dispatch(setAllUsersData(allUsersData));
      }
    } else if (isAllUsersDataError && prevUserDataRef.current.length > 0) {
      prevUserDataRef.current = [];
      dispatch(clearAllUsersData());
    }
  }, [allUsersData, isAllUsersDataError, dispatch]);

  const handleDelete = async (userCode) => {
    Swal.fire({
      title: translate("Are you sure?"),
      text: translate("This will permanently delete the user record"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: translate("Yes, delete it!"),
      cancelButtonText: translate("Cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          dispatch(deleteAllUsersData(userCode));
          Swal.fire(
            translate("Deleted!"),
            translate("User record has been deleted."),
            "success"
          );
        } catch (error) {
          Swal.fire(
            translate("Error!"),
            translate("Failed to delete user record"),
            "error"
          );
        }
      }
    });
  };

  const paginatedUserData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return userData.slice(start, start + PAGE_SIZE);
  }, [userData, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(userData.length / PAGE_SIZE);
  }, [userData]);



  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title={translate("Delete")}
            onClick={() => handleDelete(row.UserCode)}
          >
            <SvgIcon name={"FaTrash"} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate("User ID"),
      field: "UserCode",
      hozAlign: "center",
    },
    { title: translate("Name"), field: "UserName", hozAlign: "center" },
    {
      title: translate("Mobile Number"),
      field: "Mobile1",
      hozAlign: "center",
    },
  ];

  if (isFetching) return <Loading />;

  return (
    <FormProvider {...methods}>
      <div>
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

        <SortableTable
          columns={columns}
          data={paginatedUserData}
          isFilterColumn={false}
        />

         <DefaultPagination
                 currentPage={currentPage}
                 totalPages={totalPages}
                 onPageChange={setCurrentPage}
               />
      </div>
    </FormProvider>
  );
};

export default AllUsersData;
