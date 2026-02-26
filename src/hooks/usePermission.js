import { useSelector } from 'react-redux'; // To get current user
import { useGetAllUserPermissionsQuery } from '../features/permission/permissionSlice';
import { hasAnyPermission } from '../utils/permissionUtils';

export const usePermission = () => {
  const { user } = useSelector((state) => state.auth); // current logged-in user
  const { data, isLoading, isError } = useGetAllUserPermissionsQuery();
  console.log(user, 'user');

  // Filter only current user's permissions
  const userPermissions =
    data?.data?.filter((p) => p.UserID === user?.id) || [];

  /**
   * hasPermission(permissionIds, type)
   * type: "view" | "insert" | "edit" | "delete" (default: "view")
   */
  const hasPermission = (permissionIds, type = 'view') => {
    return hasAnyPermission(userPermissions, permissionIds, type);
  };

  return {
    isLoading,
    isError,
    hasPermission,
    permissions: userPermissions,
  };
};
