// src/Admin/components/AdminSidebar.jsx
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { permissionsDataList } from '../../Data/permissions';
import { useGetAllUserPermissionsQuery } from '../../features/permission/permissionSlice';

import useTranslate from '../../utils/Translate';
import Loading from '../../components/Loading/Loading';
import SvgIcon from '../../components/icons/SvgIcon';
import { AdminmenuData } from '../components/AdminSidebar/Admindata';

const AdminSidebar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const location = useLocation();
  const translate = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;

  const checkPaymentRoute = () => {
    if (permissionType === 1) {
      return true;
    }
    return false;
  };
  const {
    data: permissions,
    isLoading,
    isError,
    isFetching,
  } = useGetAllUserPermissionsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const hasPermission = (...permissionIds) => {
    if (!permissionIds.length || !permissions?.data) return false;

    return permissionIds.some((permissionId) => {
      const perm = permissions.data.find(
        (p) => p.PermissionListID === permissionId
      );
      return (
        perm?.PermissionView === true ||
        perm?.PermissionInsert === true ||
        perm?.PermissionEdit === true ||
        perm?.PermissionDelete === true
      );
    });
  };

  const filteredAdminmenuData = useMemo(() => {
    if (!permissions?.data || !user) return []; // Check permissions.data instead of permissions

    return AdminmenuData
      .map((menu) => {
        if (Array.isArray(menu.subMenu)) {
          const filteredSubMenu = menu.subMenu.filter((subItem) => {
            /**
             * Main Route
             * General Information
             * Complete
             */
            // if (subItem.name === 'New User') {
            //   return hasPermission(permissionsDataList.user_entry);
            // }
            // if (subItem.name === 'User Reports') {
            //   return hasPermission(permissionsDataList.user_report);
            // }
            // if (subItem.name === 'SMS') {
            //   return hasPermission(permissionsDataList.sms);
            // }
            if (subItem.name === 'Admin Dashboard') {
              return true;
            }
            if (subItem.name === 'All Madrasah') {
              return typeof permissionType === 'number' && permissionType <= 4;
            }
            if (subItem.name === 'ssl comerce') {
              return typeof permissionType === 'number' && permissionType <= 4;
            }
            if (subItem.name === 'All Maddrasah Payment History') {
              return typeof permissionType === 'number' && permissionType <= 4;
            }
            return true; // Default allow
          });

          return { ...menu, subMenu: filteredSubMenu };
        }

        return menu;
      })
      .filter((menu) => {
        if (Array.isArray(menu.subMenu)) {
          return menu.subMenu.length > 0;
        }
        return true;
      });
  }, [permissions?.data, user, permissionType]); // Updated to permissions.data

  useEffect(() => {
    if (!permissions?.data || !user) return; // Check permissions.data instead of permissions
    filteredAdminmenuData.forEach((menu) => {
      if (Array.isArray(menu.subMenu)) {
        const activeSubMenu = menu.subMenu.find((item) =>
          location.pathname.startsWith(item.route)
        );
        if (activeSubMenu) {
          setOpenMenuId(menu.id);
        }
      }
    });
  }, [location.pathname, filteredAdminmenuData, permissions?.data, user]);

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  if (isLoading || isFetching) return <Loading />;

  if (isError)
    return <div className="p-4 text-red-500">Failed to load menu.</div>;

  return (
    <aside className="h-[calc(100vh-64px)] lg:h-full overflow-y-auto w-[250px] bg-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] text-sm text-black scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded-full print:hidden">
      <nav className="mt-4">
        <ul className="space-y-2 pb-[100px] sideb">
          {filteredAdminmenuData.map((menu) => (
            <li key={menu.id}>
              {Array.isArray(menu.subMenu) ? (
                <>
                  <button
                    onClick={() => handleToggle(menu.id)}
                    className={`w-full flex px-4 font-default items-center justify-between border-l-6 border-solid gap-2 py-2.5 ${
                      location.pathname.startsWith(menu.route)
                        ? 'bg-[#deeff9] text-[#007af7] border-l-[#007af7]'
                        : 'hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <SvgIcon name={menu.icon} size={24} />
                      {translate(menu.name)}
                    </div>
                    <span>
                      {openMenuId === menu.id ? (
                        <SvgIcon name={'FaChevronUp'} size={14} />
                      ) : (
                        <SvgIcon name={'FaChevronDown'} size={14} />
                      )}
                    </span>
                  </button>

                  <ul
                    className={`relative text-gray-600 overflow-hidden transition-all duration-300 ease-in-out
                    ${
                      openMenuId === menu.id
                        ? 'max-h-[1000px] opacity-100'
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="absolute top-0 bottom-0 left-6 w-px border-l-2 border-dashed border-[#007af7] z-0" />

                    {menu.subMenu.map((item) => (
                      <li key={item.id} className="relative z-10 pl-[26px]">
                        <NavLink
                          to={item.route}
                          end
                          className={({ isActive }) =>
                            `block py-2 font-default pl-4 rounded-md transition
                            ${
                              isActive
                                ? 'bg-[#ddeffe] text-[#007af7]'
                                : 'hover:text-[#007af7] hover:bg-[#ddeffe]'
                            }`
                          }
                        >
                          {translate(item.name)}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <NavLink
                  to={menu.route}
                  onClick={() => setOpenMenuId(null)}
                  className={({ isActive }) =>
                    `flex items-center font-default gap-2 py-2 px-4 border-l-6 border-solid ${
                      isActive
                        ? 'bg-[#ddeffe] text-[#007af7] border-l-[#007af7]'
                        : 'hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent'
                    }`
                  }
                >
                  <SvgIcon
                    name={menu.icon}
                    size={14}
                    className="text-current"
                  />
                  {translate(menu.name)}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
