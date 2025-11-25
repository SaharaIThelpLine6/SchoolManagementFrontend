import { Navigate } from "react-router-dom";
import { useGetAllUserPermissionsQuery } from "../features/permission/permissionSlice";
import Loading from "../components/Loading/Loading";

export const ViewPermission = ({ permissionId, permissionType, children }) => {
  const {
    data: permissions,
    isLoading,
    isError,
  } = useGetAllUserPermissionsQuery();

  if (isLoading) return <Loading />;
  if (isError || !permissions?.data) return null;

  const types = permissionType?.split("|").map((t) => t.trim().toLowerCase());
  const hasPermission = permissions?.data.some((p) => {
    if (p.PermissionListID !== permissionId) return false;

    return types.some((type) => {
      switch (type) {
        case "view":
          return p.PermissionView;
        case "insert":
          return p.PermissionInsert;
        case "edit":
          return p.PermissionEdit;
        case "delete":
          return p.PermissionDelete;
        default:
          return false;
      }
    });
  });
  console.log(hasPermission);
  if (!hasPermission) return null;

  return children;
};

