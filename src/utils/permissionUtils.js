/**
 * Check if user has specific permission type for any of the given permission IDs.
 * @param {Array} permissions - Array of user permissions [{PermissionListID, PermissionView, PermissionInsert, PermissionEdit, PermissionDelete}]
 * @param {Array|number} permissionIds - One or more permission IDs to check
 * @param {string} type - Optional: "view" | "insert" | "edit" | "delete" (default: "view")
 * @returns {boolean} - true if user has that type permission
 */
export const hasAnyPermission = (permissions, permissionIds, type = 'view') => {
  if (!permissions || !Array.isArray(permissions)) return false;

  const permTypeKeyMap = {
    view: 'PermissionView',
    insert: 'PermissionInsert',
    edit: 'PermissionEdit',
    delete: 'PermissionDelete',
  };

  const key = permTypeKeyMap[type.toLowerCase()] || 'PermissionView';

  const ids = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

  return permissions.some(
    (p) => ids.includes(p.PermissionListID) && p[key] === true
  );
};
