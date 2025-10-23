import { Navigate } from "react-router-dom";
import { useGetAllUserPermissionsQuery } from "../features/permission/permissionSlice";
import Loading from "../components/Loading/Loading";

export const RequirePermission = ({ permissionId, children }) => {
  const {
    data: permissions,
    isLoading,
    isError,
  } = useGetAllUserPermissionsQuery();

  if (isLoading)
    return (
     <Loading/>
    );

  if (isError || !permissions?.data) return <Navigate to="/" />;
  console.log(permissions);
  

  const hasPermission = permissions?.data.some(
    (p) =>
      p.PermissionListID === permissionId &&
      (p.PermissionView ||
        p.PermissionInsert ||
        p.PermissionEdit ||
        p.PermissionDelete)
  );

  if (!hasPermission) return <Navigate to="/" />;
  return children;
};
