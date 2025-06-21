import React, { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

import { menuData } from "./data";
import { renderIcons } from "../../helper/renderIcons";
import useTranslate from "../../utils/Translate";
import { useGetAllUserPermissionsQuery } from "../../features/permission/permissionSlice";

const submenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const SideBar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const location = useLocation();
  const translate = useTranslate();

  const {
    data: permissions,
    isLoading,
    isError,
  } = useGetAllUserPermissionsQuery();

  // console.log(permissions);

  const hasPermission = (...permissionIds) => {
    if (!permissionIds.length) return false;

    return permissionIds.some((permissionId) => {
      const perm = permissions?.find(
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

  const filteredMenuData = useMemo(() => {
    if (!permissions) return [];

    // Add filtering logic here
    return menuData
      .map((menu) => {
        // Filter submenus if they exist
        if (Array.isArray(menu.subMenu)) {
          const filteredSubMenu = menu.subMenu.filter((subItem) => {
            // General Information
            if (subItem.name === "User") {
              return hasPermission(2);
            }
            if (subItem.name === "User Reports") {
              return hasPermission(4);
            }
            if (subItem.name === "SMS") {
              return hasPermission(86);
            }
            if (subItem.name === "Institution Information") {
              return hasPermission(1);
            }
            if (subItem.name === "Month Name") {
              return hasPermission(30);
            }
            // Students
            if (subItem.name === "Session") {
              return hasPermission(14); // Example
            }
            if (subItem.name === "Section") {
              return hasPermission(16); // Example
            }
            if (subItem.name === "Class") {
              return hasPermission(15); // Example
            }
            if (subItem.name === "English & Arobi Name") {
              return hasPermission(20); // Example
            }
            if (subItem.name === "Book") {
              return hasPermission(29); // Example
            }
            if (subItem.name === "Group Distribution") {
              return hasPermission(17); // Example
            }
            if (subItem.name === "Students Report") {
              return hasPermission(13); // Example
            }
            if (subItem.name === "Certificate of Attestation") {
              return hasPermission(23); // Example
            }
            if (subItem.name === "Students Vacation") {
              return hasPermission(25); // Example
            }
            if (subItem.name === "Type of Vacation") {
              return hasPermission(25); // Example
            }
            // Teachers
            if (subItem.name === "Teacher Info") {
              return hasPermission(90); // Example
            }
            if (subItem.name === "Pay-role Heading") {
              return hasPermission(92); // Example
            }
            if (subItem.name === "Pay-role Name") {
              return hasPermission(94); // Example
            }
            if (subItem.name === "Designation") {
              return hasPermission(91); // Example
            }
            // if (subItem.name === "Type of vacation") {
            //   return hasPermission(12);
            // }
            // Add other submenu permission mappings here
            return true; // Default allow
          });

          return { ...menu, subMenu: filteredSubMenu };
        }

        return menu;
      })
      .filter((menu) => {
        // Hide menus with empty submenus if they originally had submenus
        if (Array.isArray(menu.subMenu)) {
          return menu.subMenu.length > 0;
        }
        return true;
      });
  }, [permissions]);

  useEffect(() => {
    filteredMenuData.forEach((menu) => {
      if (Array.isArray(menu.subMenu)) {
        const activeSubMenu = menu.subMenu.find((item) =>
          location.pathname.startsWith(item.route)
        );
        if (activeSubMenu) {
          setOpenMenuId(menu.id);
        }
      }
    });
  }, [location.pathname, filteredMenuData]);

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  if (isLoading) return <div className="p-4">Loading sidebar...</div>;
  if (isError)
    return <div className="p-4 text-red-500">Failed to load menu.</div>;

  return (
    <aside className="h-[calc(100vh-64px)] lg:h-full overflow-y-auto w-[250px] bg-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] text-sm text-black scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded-full print:hidden">
      <nav className="mt-4">
        <ul className="space-y-2 pb-4">
          {filteredMenuData.map((menu) => (
            <li key={menu.id}>
              {Array.isArray(menu.subMenu) ? (
                <>
                  <button
                    onClick={() => handleToggle(menu.id)}
                    className={`w-full flex px-4 font-SolaimanLipi items-center justify-between border-l-6 border-solid gap-2 py-2 ${
                      location.pathname.startsWith(menu.route)
                        ? "bg-[#deeff9] text-[#007af7] border-l-[#007af7]"
                        : "hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {renderIcons(menu.icon)}
                      {translate(menu.name)}
                    </span>
                    <span>
                      {openMenuId === menu.id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </button>

                  <AnimatePresence>
                    {openMenuId === menu.id && (
                      <motion.ul
                        className="relative text-gray-600"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={submenuVariants}
                      >
                        <div className="absolute top-0 bottom-0 left-6 w-px border-l-2 border-dashed border-[#007af7] z-0" />

                        {menu.subMenu.map((item) => (
                          <li key={item.id} className="relative z-10 pl-[26px]">
                            <NavLink
                              to={item.route}
                              end
                              className={({ isActive }) =>
                                `block py-2 font-SolaimanLipi pl-4 ${
                                  isActive
                                    ? "bg-[#ddeffe] text-[#007af7]"
                                    : "hover:text-[#007af7] hover:bg-[#ddeffe]"
                                }`
                              }
                            >
                              {translate(item.name)}
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={menu.route}
                  onClick={() => setOpenMenuId(null)}
                  className={({ isActive }) =>
                    `flex items-center font-SolaimanLipi gap-2 py-2 px-4 border-l-6 border-solid ${
                      isActive
                        ? "bg-[#ddeffe] text-[#007af7] border-l-[#007af7]"
                        : "hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent"
                    }`
                  }
                >
                  {renderIcons(menu.icon)} {translate(menu.name)}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
