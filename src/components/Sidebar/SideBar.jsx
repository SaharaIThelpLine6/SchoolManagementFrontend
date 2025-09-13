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
    isFetching,
  } = useGetAllUserPermissionsQuery(undefined, {
    refetchOnMountOrArgChange: true, 
  });

  const hasPermission = (...permissionIds) => {
    if (!permissionIds.length || !permissions) return false;

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
    if (!permissions || !user) return []; // Wait for both permissions and user to be available

    return menuData
      .map((menu) => {
        if (Array.isArray(menu.subMenu)) {
          const filteredSubMenu = menu.subMenu.filter((subItem) => {
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
              return typeof permissionType === "number" && permissionType <= 4;
            }
            if (subItem.name === "Institution Information") {
              return hasPermission(permissionsDataList.institute_info);
            }
            if (subItem.name === "Month Name") {
              return hasPermission(permissionsDataList.month_name);
            }
            if (subItem.name === "All Students") {
              return hasPermission(permissionsDataList.student_admission);
            }
            if (subItem.name === "Session") {
              return hasPermission(permissionsDataList.academic_year);
            }
            if (subItem.name === "Section") {
              return hasPermission(permissionsDataList.sub_class);
            }
            if (subItem.name === "Class") {
              return hasPermission(permissionsDataList.class);
            }
            if (subItem.name === "English & Arobi Name") {
              return hasPermission(
                permissionsDataList.english_name_entry ||
                  permissionsDataList.arabic_name_entry
              );
            }
            if (subItem.name === "Book") {
              return hasPermission(permissionsDataList.kitab_entry);
            }
            if (subItem.name === "Group Distribution") {
              return hasPermission(permissionsDataList.student_group_setting);
            }
            if (subItem.name === "Character Report") {
              return hasPermission(permissionsDataList.student_report);
            }
            if (subItem.name === "Students Report") {
              return hasPermission(permissionsDataList.student_report);
            }
            if (subItem.name === "Certificate of Attestation") {
              return hasPermission(permissionsDataList.certificate);
            }
            if (subItem.name === "Online Admission") {
              return hasPermission(permissionsDataList.student_admission);
            }
            if (subItem.name === "Teacher Info") {
              return hasPermission(permissionsDataList.teacher_info);
            }
            if (subItem.name === "Pay-role Heading") {
              return hasPermission(permissionsDataList.teacher_payroll);
            }
            if (subItem.name === "Pay-role Name") {
              return hasPermission(permissionsDataList.teacher_payroll_name);
            }
            if (subItem.name === "Students Report") {
              return hasPermission(permissionsDataList.teacher_report);
            }
            if (subItem.name === "Designation") {
              return hasPermission(permissionsDataList.teacher_designation);
            }
            if (subItem.name === "Exam") {
              return hasPermission(permissionsDataList.exam_name);
            }
            if (subItem.name === "Exam Fee Determine") {
              return hasPermission(permissionsDataList.exam_fee_setting);
            }
            if (subItem.name === "Point V: Condition") {
              return hasPermission(permissionsDataList.exam_condition);
            }
            if (subItem.name === "Average V: Condition") {
              return hasPermission(permissionsDataList.exam_condition);
            }
            if (subItem.name === "List of Candidates") {
              return hasPermission(permissionsDataList.exam_list_generation);
            }
            if (subItem.name === "Exam Admit Card") {
              return hasPermission(permissionsDataList.admit_card);
            }
            if (subItem.name === "Exam Routing") {
              return hasPermission(permissionsDataList.routine_with_signature);
            }
            if (subItem.name === "Exam Report") {
              return hasPermission(permissionsDataList.exam_report);
            }
            if (subItem.name === "Character Report") {
              return hasPermission(permissionsDataList.certificate);
            }
            if (subItem.name === "Gate pass and leave") {
              return hasPermission(permissionsDataList.gate_pass_leave);
            }
            if (subItem.name === "Point Result Entry") {
              return hasPermission(permissionsDataList.result_entry);
            }
            if (subItem.name === "Point V: Result Report") {
              return hasPermission(permissionsDataList.result_report);
            }
            if (subItem.name === "Point Based Mark Sheet") {
              return hasPermission(permissionsDataList.marksheet);
            }
            if (subItem.name === "Online Result Public") {
              return hasPermission(permissionsDataList.result_entry);
            }
            if (subItem.name === "Fee Setting") {
              return hasPermission(permissionsDataList.fee_setting);
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
  }, [permissions, user, permissionType]); // Added user and permissionType to dependencies

  useEffect(() => {
    if (!permissions || !user) return; // Wait for both to be available
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
  }, [location.pathname, filteredMenuData, permissions, user]);

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  if (isLoading || isFetching) return <Loading />;

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
                    ${
                      openMenuId === menu.id
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }
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
