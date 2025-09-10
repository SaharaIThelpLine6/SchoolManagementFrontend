import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { menuData } from "./data";
import useTranslate from "../../utils/Translate";
import { useGetAllUserPermissionsQuery } from "../../features/permission/permissionSlice";
import { permissionsDataList } from "../../Data/permissions";
import Loading from "../Loading/Loading";
import SvgIcon from "../icons/SvgIcon";
import { useSelector } from "react-redux";

const SideBar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const location = useLocation();
  const translate = useTranslate();
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;

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
              return hasPermission(permissionsDataList.user_entry);
            }
            if (subItem.name === "User Reports") {
              return hasPermission(permissionsDataList.user_report);
            }
            if (subItem.name === "SMS") {
              return hasPermission(permissionsDataList.sms);
            }
            if (subItem.name === "All Madrasah") {
              // 1,2,3,4 allowed, 5,6 not allowed
              return typeof permissionType === "number" && permissionType <= 4;
            }

            if (subItem.name === "Institution Information") {
              return hasPermission(permissionsDataList.institute_info);
            }
            if (subItem.name === "Month Name") {
              return hasPermission(permissionsDataList.month_name);
            }
            // StudsubItements
            if (subItem.name === "All Students") {
              return hasPermission(permissionsDataList.student_admission); // Example
            }
            if (subItem.name === "Session") {
              return hasPermission(permissionsDataList.academic_year); // Example
            }
            if (subItem.name === "Section") {
              return hasPermission(permissionsDataList.sub_class); // Example
            }
            if (subItem.name === "Class") {
              return hasPermission(permissionsDataList.class); // Example
            }
            if (subItem.name === "English & Arobi Name") {
              return hasPermission(
                permissionsDataList.english_name_entry ||
                  permissionsDataList.arabic_name_entry
              ); // Example
            }
            if (subItem.name === "Book") {
              return hasPermission(permissionsDataList.kitab_entry); // Example
            }
            if (subItem.name === "Group Distribution") {
              return hasPermission(permissionsDataList.student_group_setting); // Example
            }
            if (subItem.name === "Character Report") {
              return hasPermission(permissionsDataList.student_report); // Example
            }
            if (subItem.name === "Students Report") {
              return hasPermission(permissionsDataList.student_report); // Example
            }
            if (subItem.name === "Certificate of Attestation") {
              return hasPermission(permissionsDataList.certificate); // Example
            }
            if (subItem.name === "Online Admission") {
              return hasPermission(permissionsDataList.student_admission); // Example
            }
            // if (subItem.name === "Students Vacation") {
            //   return hasPermission(permissionsDataList.gate_pass_leave); // Example
            // }
            // if (subItem.name === "Type of Vacation") {
            //   return hasPermission(permissionsDataList.gate_pass_leave); // Example
            // }
            // Teachers
            if (subItem.name === "Teacher Info") {
              return hasPermission(permissionsDataList.teacher_info); // Example
            }
            if (subItem.name === "Pay-role Heading") {
              return hasPermission(permissionsDataList.teacher_payroll); // Example
            }
            if (subItem.name === "Pay-role Name") {
              return hasPermission(permissionsDataList.teacher_payroll_name); // Example
            }
            if (subItem.name === "Students Report") {
              return hasPermission(permissionsDataList.teacher_report); // Example
            }
            if (subItem.name === "Designation") {
              return hasPermission(permissionsDataList.teacher_designation); // Example
            }
            // Exam
            if (subItem.name === "Exam") {
              return hasPermission(permissionsDataList.exam_name); // Example
            }
            if (subItem.name === "Exam Fee Determine") {
              return hasPermission(permissionsDataList.exam_fee_setting); // Example
            }
            if (subItem.name === "Point V: Condition") {
              return hasPermission(permissionsDataList.exam_condition); // Example
            }
            if (subItem.name === "Average V: Condition") {
              return hasPermission(permissionsDataList.exam_condition); // Example
            }
            if (subItem.name === "List of Candidates") {
              return hasPermission(permissionsDataList.exam_list_generation); // Example
            }
            if (subItem.name === "Exam Admit Card") {
              return hasPermission(permissionsDataList.admit_card); // Example
            }
            if (subItem.name === "Exam Routing") {
              return hasPermission(permissionsDataList.routine_with_signature); // Example
            }
            if (subItem.name === "Exam Report") {
              return hasPermission(permissionsDataList.exam_report); // Example
            }
            // Darul-ikama
            if (subItem.name === "Character Report") {
              return hasPermission(permissionsDataList.certificate); // Example
            }
            if (subItem.name === "Gate pass and leave") {
              return hasPermission(permissionsDataList.gate_pass_leave); // Example
            }

            // Result
            if (subItem.name === "Point Result Entry") {
              return hasPermission(permissionsDataList.result_entry); // Example
            }
            if (subItem.name === "Point V: Result Report") {
              return hasPermission(permissionsDataList.result_report); // Example
            }
            if (subItem.name === "Point Based Mark Sheet") {
              return hasPermission(permissionsDataList.marksheet); // Example
            }
            if (subItem.name === "Online Result Public") {
              return hasPermission(permissionsDataList.result_entry); // Example
            }

            // Accounting
            if (subItem.name === "Fee Setting") {
              return hasPermission(permissionsDataList.fee_setting); // Example
            }

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

  if (isLoading) return <Loading />;

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
                    className={`w-full flex px-4 font-SolaimanLipi items-center justify-between border-l-6 border-solid gap-2 py-2.5 ${
                      location.pathname.startsWith(menu.route)
                        ? "bg-[#deeff9] text-[#007af7] border-l-[#007af7]"
                        : "hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <SvgIcon name={menu.icon} size={24} />
                      {translate(menu.name)}
                    </div>
                    <span>
                      {openMenuId === menu.id ? (
                        <SvgIcon name={"FaChevronUp"} size={14} />
                      ) : (
                        <SvgIcon name={"FaChevronDown"} size={14} />
                      )}
                    </span>
                  </button>

                  <ul
                    className={`relative text-gray-600 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out
    ${openMenuId === menu.id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
  `}
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
                  </ul>
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

export default SideBar;
