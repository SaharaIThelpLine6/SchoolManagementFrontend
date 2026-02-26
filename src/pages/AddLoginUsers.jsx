import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useCallback, useEffect, useMemo, useState } from "react";
import { showModal } from "../utils/ModalControlar";
import CustomTable from "../view/settings/CustomTable";
import {
  useGetLoginUsersQuery,
  usePostLoginUserMutation,
  useUpdateLoginUserStatusChangeMutation,
} from "../features/userType/userTypeSlice";
import bnBijoy2Unicode from "../utils/conveter";
import { useGetPermissionTypesQuery } from "../features/settings/settingsQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading/Loading";
import { setFilteredUser } from "../features/student/studentSlice";
import Swal from "sweetalert2";

// Constants
const PAGE_SIZE = 100;

const AddLoginUsers = () => {
  // Form setup with dynamic default values from Redux state
  const methods = useForm({
    defaultValues: {
      school_id: "",
      userId: "",
      loginName: "",
      password: "",
      permissionTypeId: "",
      ConfirmPassword: "",
    },
  });
  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { filteredUser } = useSelector((state) => state.student);

  const permissionType = user?.permissionType;
  const { data: permissionTypeData, isLoading: permissionLoading } =
    useGetPermissionTypesQuery();
  const [updateLoginUserStatus] = useUpdateLoginUserStatusChangeMutation();

  const [postLoginUser, { isLoading: isPosting }] = usePostLoginUserMutation();
  const { data, isLoading, isError } = useGetLoginUsersQuery();
  const loginUsers = data?.users || [];

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(loginUsers.length / PAGE_SIZE);

  // Filter permission types based on user permission type
  const filteredPermissionTypes = useMemo(() => {
    if (!permissionTypeData) return [];

    switch (permissionType) {
      case 1: // Owner
        return permissionTypeData; // Access to all permission types
      case 2: // Project Administrator
        return permissionTypeData.filter((pt) =>
          [3, 4, 5, 6].includes(pt.PermissionTypeID)
        );
      case 3: // Project Moderator
        return permissionTypeData.filter((pt) =>
          [4, 5, 6].includes(pt.PermissionTypeID)
        );
      case 4: // Reseller
        return permissionTypeData.filter((pt) =>
          [5, 6].includes(pt.PermissionTypeID)
        );
      case 5: // Users Admin
        return permissionTypeData.filter((pt) =>
          [5, 6].includes(pt.PermissionTypeID)
        );
      case 6: // Users
        return []; // No access to any permission types
      default:
        return [];
    }
  }, [permissionType, permissionTypeData]);

  useEffect(() => {
    reset({
      UserName: filteredUser?.UserName
        ? bnBijoy2Unicode(filteredUser?.UserName)
        : "",
    });
  }, [filteredUser, reset]);

  // Paginate login users
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return loginUsers.slice(start, start + PAGE_SIZE).map((user, index) => ({
      ID: user.UserID,
      NewUserID: user.NewUserID,
      Code: user.UserCode,
      IsVerified: user.IsVerified,
      LoginName: user.LoginName,
      Name: user.UserName ? bnBijoy2Unicode(user.UserName) : "N/A",
      Type: user.TypeName,
      LoginType: user.PermissionName,
      Number: index + 1 + (currentPage - 1) * PAGE_SIZE,
    }));
  }, [loginUsers, currentPage]);

  // Handle modal for user filtering
  const handleOpenModal = useCallback(() => {
    showModal("Filter User", "USER_FILTER");
  }, []);

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = useCallback(
    async (formData) => {
      try {
        // Validate password and confirm password match first
        if (formData.password !== formData.ConfirmPassword) {
          methods.setError("ConfirmPassword", {
            type: "manual",
            message: translate("Passwords do not match!"),
          });
          return;
        }

        // Validate required fields only if password matches
        if (!user?.schoolId) {
          methods.setError("school_id", {
            type: "manual",
            message: translate("School ID is required!"),
          });
          return;
        }

        if (!filteredUser?.UserID) {
          methods.setError("userId", {
            type: "manual",
            message: translate("User ID is required!"),
          });
          return;
        }

        // Prepare payload for API
        const payload = {
          school_id: user?.schoolId,
          userId: filteredUser?.UserID,
          loginName: formData.loginName,
          password: formData.password,
          permissionTypeId: Number(formData.permissionTypeId),
        };

        // Post the login user data
        await postLoginUser(payload).unwrap();
        reset({
          school_id: "",
          userId: "",
          loginName: "",
          password: "",
          permissionTypeId: "",
          ConfirmPassword: "",
        }); // Reset form after successful submission
        dispatch(setFilteredUser(null));

        // SweetAlert Success
        Swal.fire({
          icon: "success",
          title: translate("User added successfully!"),
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        console.error("Failed to add user:", error);

        // SweetAlert Error
        Swal.fire({
          icon: "error",
          title: translate("Failed to add user!"),
          text: translate("Please try again."),
        });
      }
    },
    [postLoginUser, user, filteredUser, translate, reset, methods, dispatch]
  );

  const handleToggleAction = async (row) => {
    try {
      if (permissionType === 6) {
        return;
      }
      if (!row.ID) {
        Swal.fire({
          icon: "error",
          title: translate("Invalid User ID!"),
          text: translate("Please try again."),
        });
        return;
      }

      const newStatus = row.IsVerified === 1 ? 0 : 1;

      // ✅ Confirmation alert
      const result = await Swal.fire({
        title:
          newStatus === 1
            ? translate("Are you sure you want to Activate this user?")
            : translate("Are you sure you want to Deactivate this user?"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: translate("Yes, Confirm"),
        cancelButtonText: translate("Cancel"),
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return; // cancel চাপলে কিছু হবে না
      }

      // API call
      await updateLoginUserStatus({
        id: row.ID,
        data: { school_id: user?.schoolId, isVerified: newStatus },
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: translate("Success!"),
        text:
          newStatus === 1
            ? translate("User has been Activated!")
            : translate("User has been Deactivated!"),
      });

      // Refresh / local update
      // refetch();
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: "error",
        title: translate("Failed!"),
        text: translate("Something went wrong. Please try again."),
      });
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      { title: translate("ID"), field: "ID" },
      { title: translate("Code"), field: "Code" },
      { title: translate("Login Name"), field: "LoginName" },
      { title: translate("Name"), field: "Name" },
      { title: translate("Type"), field: "Type" },
      { title: translate("Login Type"), field: "LoginType" },
      // ✅ এখানে custom render (toggle switch)
      {
        title: translate("Status"),
        field: "Action",
        render: (row) => (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={row.IsVerified === 1}
              onChange={() => handleToggleAction(row)}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-200 rounded-full
                    peer-checked:bg-green-600
                    peer-checked:after:translate-x-full
                    peer-checked:after:border-white
                    after:content-[''] after:absolute
                    after:top-0.5 after:left-[2px]
                    after:bg-white after:border-gray-300
                    after:border after:rounded-full
                    after:h-5 after:w-5 after:transition-all"
            ></div>
          </label>
        ),
      },
    ],
    [translate]
  );

  // Loading and error states
  if (isLoading || permissionLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>{translate("Error loading data. Please try again.")}</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:flex w-full px-3 gap-3">
            {/* Input Form */}
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Name + Select Modal Button */}
                <div className="flex items-end gap-2">
                  <DefaultInput
                    type="text"
                    label="User Name"
                    registerKey="UserName"
                    nameField="UserName"
                    disable={true}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleOpenModal}
                    className="p-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
                    disabled={permissionType === 6 ? true : false}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </Button>
                </div>

                {/* User Power */}
                <DefaultSelect
                  label="User Power"
                  options={filteredPermissionTypes}
                  valueField="PermissionTypeID"
                  nameField="PermissionName"
                  registerKey="permissionTypeId"
                  require={translate("Permission type is required!")}
                  disabled={permissionType === 6 ? true : false}
                />

                {/* Login Name */}
                <DefaultInput
                  label="Login Name"
                  type="text"
                  placeholder={translate("Enter login name")}
                  registerKey="loginName"
                  require={translate("Login name is required!")}
                  disable={permissionType === 6 ? true : false}
                />

                {/* Password */}
                <div className="relative">
                  <DefaultInput
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder={translate("Enter password")}
                    registerKey="password"
                    require={translate("Password is required!")}
                    className="w-full pr-12"
                    disable={permissionType === 6 ? true : false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 640 512"
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
                      </svg>
                    ) : (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 576 512"
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <DefaultInput
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder={translate("Confirm password")}
                    registerKey="ConfirmPassword"
                    require={translate("Confirm password is required!")}
                    className="w-full pr-12"
                    disable={permissionType === 6 ? true : false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 640 512"
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z" />
                      </svg>
                    ) : (
                      <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 576 512"
                        className="w-5 h-5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-start mt-6">
                <Button
                  type="submit"
                  disabled={isPosting || permissionType === 6 ? true : false}
                  className="px-6"
                >
                  {isPosting ? translate("Saving...") : translate("Save")}
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    reset({
                      school_id: "",
                      userId: "",
                      loginName: "",
                      password: "",
                      permissionTypeId: "",
                      ConfirmPassword: "",
                    })
                  }
                  variant="secondary"
                  className="px-6"
                  disabled={permissionType === 6 ? true : false}
                >
                  {translate("Reset")}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="w-full font-SolaimanLipi">
          <CustomTable columns={columns} data={paginatedData} />
        </div>
      </div>
    </FormProvider>
  );
};

export default AddLoginUsers;
