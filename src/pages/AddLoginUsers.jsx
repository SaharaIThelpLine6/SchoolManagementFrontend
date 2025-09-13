import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import Button from "../components/Button/Button";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import useTranslate from "../utils/Translate";
import { useCallback, useEffect, useMemo, useState } from "react";
import SvgIcon from "../components/icons/SvgIcon";
import { showModal } from "../utils/ModalControlar";
import CustomTable from "../view/settings/CustomTable";
import {
  useGetLoginUsersQuery,
  usePostLoginUserMutation,
} from "../features/userType/userTypeSlice";
import bnBijoy2Unicode from "../utils/conveter";
import { useGetPermissionTypesQuery } from "../features/settings/settingsQuerySlice";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../components/Loading/Loading";
import { setFilteredUser } from "../features/student/studentSlice";

// Constants
const PAGE_SIZE = 10;

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
  const [postLoginUser, { isLoading: isPosting }] = usePostLoginUserMutation();
  const { data, isLoading, isError } = useGetLoginUsersQuery();
  const loginUsers = data?.users || [];

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(loginUsers.length / PAGE_SIZE);

  // Filter permission types dynamically
  const filteredPermissionTypes = useMemo(() => {
    if (!permissionTypeData) return [];

    if (typeof permissionType === "number" && permissionType <= 4) {
      return permissionTypeData;
    } else if (typeof permissionType === "number" && permissionType > 4) {
      return permissionTypeData.filter((pt) => pt.PermissionTypeID > 4);
    }
    return [];
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
      Code: user.UserCode,
      LoginName: user.LoginName,
      Name: user.UserName ? bnBijoy2Unicode(user.UserName) : "N/A",
      Type: user.TypeName,
      LoginType: user.PermissionName,
      Residential: user.IsVerified ? "একটিভ" : "ইনএকটিভ",
      Number: index + 1 + (currentPage - 1) * PAGE_SIZE,
    }));
  }, [loginUsers, currentPage]);

  // Handle modal for user filtering
  const handleOpenModal = useCallback(() => {
    showModal("Filter User", "USER_FILTER");
  }, []);


 const onSubmit = useCallback(
   async (formData) => {
     try {
       // Validate password and confirm password match
       if (formData.password !== formData.ConfirmPassword) {
         methods.setError("ConfirmPassword", {
           type: "manual",
           message: translate("Passwords do not match!"),
         });

         Swal.fire({
           icon: "warning",
           title: translate("Passwords do not match!"),
           confirmButtonText: translate("OK"),
         });

         return;
       }

       // Validate required fields
       if (!user?.schoolId) {
         methods.setError("school_id", {
           type: "manual",
           message: translate("School ID is required!"),
         });

         Swal.fire({
           icon: "warning",
           title: translate("School ID is required!"),
           confirmButtonText: translate("OK"),
         });

         return;
       }

       if (!filteredUser?.UserID) {
         methods.setError("userId", {
           type: "manual",
           message: translate("User ID is required!"),
         });

         Swal.fire({
           icon: "warning",
           title: translate("User ID is required!"),
           confirmButtonText: translate("OK"),
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


  // Table columns
  const columns = useMemo(
    () => [
      { title: translate("ID"), field: "ID" },
      { title: translate("Code"), field: "Code" },
      { title: translate("Login Name"), field: "LoginName" },
      { title: translate("Name"), field: "Name" },
      { title: translate("Type"), field: "Type" },
      { title: translate("Login Type"), field: "LoginType" },
      { title: translate("Status"), field: "Residential" },
      { title: translate("Serial"), field: "Number" },
    ],
    [translate]
  );

  // Loading and error states
  if (isLoading || permissionLoading) {
    return <Loading/>;
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
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="flex items-end gap-2">
                  <DefaultInput
                    type="text"
                    label={<span>{translate("User Name")} :</span>}
                    registerKey="UserName"
                    nameField="UserName"
                    disable={true}
                  />
                  <Button
                    type="button"
                    onClick={handleOpenModal}
                    className="p-2 border"
                  >
                    <SvgIcon name="GrDrag" size={16} />
                  </Button>
                </div>
                <DefaultSelect
                  label={translate("User Power") + " :"}
                  options={filteredPermissionTypes}
                  valueField="PermissionTypeID"
                  nameField="PermissionName"
                  registerKey="permissionTypeId"
                  require={translate("Permission type is required!")}
                />
                <DefaultInput
                  label={translate("Login Name") + " :"}
                  type="text"
                  placeholder={translate("Enter login name")}
                  registerKey="loginName"
                  require={translate("Login name is required!")}
                />
                <DefaultInput
                  label={translate("Password") + " :"}
                  type="password"
                  placeholder={translate("Enter password")}
                  registerKey="password"
                  require={translate("Password is required!")}
                />
                <DefaultInput
                  label={translate("Confirm Password") + " :"}
                  type="password"
                  placeholder={translate("Confirm password")}
                  registerKey="ConfirmPassword"
                  require={translate("Confirm password is required!")}
                />
              </div>
              {(errors.ConfirmPassword ||
                errors.school_id ||
                errors.userId) && (
                <div className="text-red-500">
                  {errors.ConfirmPassword?.message ||
                    errors.school_id?.message ||
                    errors.userId?.message}
                </div>
              )}
              <div className="text-center flex py-3 gap-3 justify-start">
                <Button type="submit" disabled={isPosting}>
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
          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default AddLoginUsers;
