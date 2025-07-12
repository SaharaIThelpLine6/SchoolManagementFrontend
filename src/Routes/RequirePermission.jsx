import { Navigate } from "react-router-dom";
import { useGetAllUserPermissionsQuery } from "../features/permission/permissionSlice";

export const RequirePermission = ({ permissionId, children }) => {
  const {
    data: permissions,
    isLoading,
    isError,
  } = useGetAllUserPermissionsQuery();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
    
  if (isError || !permissions) return <Navigate to="/" />;

  const hasPermission = permissions.some(
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
