import { useEffect, useState } from "react";
import DefaultSelect from "../Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import DefaultInput from "../Forms/DefaultInput";
import { fetchClassData } from "../../features/class/classSlice";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import LoadingComponent from "../LoadingComponent";
import SortableTable from "../Tables/SortableTable";
import { setFilteredUser } from "../../features/student/studentSlice";
import { hideModal } from "../../utils/ModalControlar";
import {
  useGetUserBySearchQuery,
  useGetUserTypesQuery,
} from "../../features/userType/userTypeSlice";
const UserFilterModal = () => {
  const methods = useForm();
  const {
    watch,
    formState: { errors },
  } = methods;
  const dispatch = useDispatch();
  const { academicSession, status: settingsStatus } = useSelector(
    (state) => state.settings
  );
  const { classList, status: classStatus } = useSelector(
    (state) => state.class
  );

  useEffect(() => {
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    if (!classList.length) {
      dispatch(fetchClassData());
    }
  }, [dispatch]);

  const UserCode = watch("UserCode");
  const UserTypeID = watch("ID");
  const ClassID = watch("ClassID");
  const SessionID = watch("SessionID");
  const {
    data: userTypesData = [],
    isLoading,
    isError,
  } = useGetUserTypesQuery();

  const [debouncedFilters, setDebouncedFilters] = useState({
    search: "",
    ClassID: "",
    SessionID: "",
    UserTypeID: "",
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFilters({
        search: UserCode,
        ClassID,
        SessionID,
        UserTypeID,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [UserCode, ClassID, SessionID, UserTypeID]);

  // Call search query
  const {
    data: searchUserInfo,
    error: searchUserError,
    isLoading: userInfoLoading,
  } = useGetUserBySearchQuery(debouncedFilters, {
    skip:
      !debouncedFilters.search &&
      !debouncedFilters.ClassID &&
      !debouncedFilters.SessionID &&
      !debouncedFilters.UserTypeID,
    refetchOnFocus: false,
  });
  const handleAddToForm = (userDetails) => {
    dispatch(setFilteredUser(userDetails));
    hideModal();
  };
  const columns = [
    {
      title: "Action",
      render: (row) => {
        return (
          <button
            onClick={() => {
              handleAddToForm(row);
            }}
            className=" text-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-adjustments-plus"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M6 4v4" />
              <path d="M6 12v8" />
              <path d="M13.958 15.592a2 2 0 1 0 -1.958 2.408" />
              <path d="M12 4v10" />
              <path d="M12 18v2" />
              <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M18 4v1" />
              <path d="M18 9v3" />
              <path d="M16 19h6" />
              <path d="M19 16v6" />
            </svg>
          </button>
        );
      },
    },
    { title: "User Code", field: "UserCode", hozAlign: "center" },
    {
      title: "User Name",
      field: "UserName",
      hozAlign: "left",
      unicode: true,
    }, {
      title: "Class Name",
      field: "ClassName",
      hozAlign: "left",
      unicode: true,
    },
    {
      title: "TypeName",
      field: "TypeName",
      hozAlign: "left",
      unicode: true,
    },
  ];
  return (
    <div>
      <FormProvider {...methods}>
        <div
          className="w-full"
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            margin: "0 auto",
          }}
        >
          <div className="flex flex-col md:flex-row gap-2">
            <DefaultInput
              label={""}
              placeholder={"User Code"}
              registerKey={"UserCode"}
              type={"number"}
              key={"UserCode"}
            />
            <DefaultSelect
              options={userTypesData}
              nameField={"TypeName"}
              valueField={"ID"}
              registerKey={"ID"}
              type={"number"}
              unicode={true}
            />{" "}
            <DefaultSelect
              options={classList}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              unicode={true}
            />
            <DefaultSelect
              options={academicSession}
              nameField={"SessionName"}
              valueField={"SessionID"}
              registerKey={"SessionID"}
            />
          </div>
        </div>
        {userInfoLoading ? (
          <LoadingComponent />
        ) : searchUserError ? (
          <li className="text-black mt-4">No users Found.</li>
        ) : searchUserInfo && searchUserInfo.length > 0 ? (
          <div className="relative overflow-x-auto">
            <SortableTable columns={columns} data={searchUserInfo || []} />
          </div>
        ) : (
          <li className="py-2 px-4">No users found</li>
        )}
      </FormProvider>
    </div>
  );
};

export default UserFilterModal;
