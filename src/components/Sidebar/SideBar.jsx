import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { permissionsDataList } from '../../Data/permissions';
import { useGetAllUserPermissionsQuery } from '../../features/permission/permissionSlice';
import useTranslate from '../../utils/Translate';
import Loading from '../Loading/Loading';
import SvgIcon from '../icons/SvgIcon';
import { menuData } from './data';

const SideBar = () => {
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

  const { currectLanguage } = useSelector((state) => state.language);
  const fontClass =
    currectLanguage === 'bn' ? 'font-SolaimanLipi' : 'font-lato';
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

  const filteredMenuData = useMemo(() => {
    if (!permissions?.data || !user) return []; // Check permissions.data instead of permissions

    return menuData
      .map((menu) => {
        if (Array.isArray(menu.subMenu)) {
          const filteredSubMenu = menu.subMenu.filter((subItem) => {
            /**
             * Main Route
             * General Information
             * Complete
             */
            if (subItem.name === 'New User') {
              return hasPermission(permissionsDataList.user_entry);
            }
            if (subItem.name === 'User Reports') {
              return hasPermission(permissionsDataList.user_report);
            }
            if (subItem.name === 'SMS') {
              return hasPermission(permissionsDataList.sms);
            }
            if (subItem.name === 'All Madrasah') {
              return typeof permissionType === 'number' && permissionType <= 4;
            }
            if (subItem.name === 'RFID Card') {
              return typeof permissionType === 'number' && permissionType <= 4;
            }
            if (subItem.name === 'Institution Information') {
              return hasPermission(permissionsDataList.institute_info);
            }
            if (subItem.name === 'Month Name') {
              return hasPermission(permissionsDataList.month_name);
            }
            if (subItem.name === 'User Image') {
              return hasPermission(permissionsDataList.user_photo);
            }
            /**
             * Main Route
             * Student
             */
            if (subItem.name === 'Session') {
              return hasPermission(permissionsDataList.academic_year);
            }
            if (subItem.name === 'Class') {
              return hasPermission(permissionsDataList.class);
            }
            if (subItem.name === 'Sub Class') {
              return hasPermission(permissionsDataList.sub_class);
            }
            if (subItem.name === 'Students Admission') {
              return hasPermission(permissionsDataList.student_admission);
            }
            if (subItem.name === 'English & Arobi Name') {
              return hasPermission(
                permissionsDataList.english_name_entry ||
                  permissionsDataList.arabic_name_entry
              );
            }
            if (subItem.name === 'Book') {
              return hasPermission(permissionsDataList.kitab_entry);
            }
            if (subItem.name === 'Group Distribution') {
              return hasPermission(permissionsDataList.student_group_setting);
            }
            if (subItem.name === 'Data Export') {
              return hasPermission(permissionsDataList.user_report);
            }
            if (subItem.name === 'Certificate of Attestation') {
              return hasPermission(permissionsDataList.certificate);
            }
            if (subItem.name === 'Students Report') {
              return hasPermission(permissionsDataList.student_report);
            }
            if (subItem.name === 'Online Admission') {
              return hasPermission(permissionsDataList.student_admission);
            }
            if (subItem.name === 'Class Routine') {
              return hasPermission(permissionsDataList.class);
            }
            /**
             * Main Route
             * Exam
             */
            if (subItem.name === 'Exam') {
              return hasPermission(permissionsDataList.exam_name);
            }
            if (subItem.name === 'Exam Fee Determine') {
              return hasPermission(permissionsDataList.exam_fee_setting);
            }
            if (subItem.name === 'Exam Condition') {
              return hasPermission(permissionsDataList.exam_condition);
            }

            // if (subItem.name === 'List of Candidates') {
            //   return hasPermission(permissionsDataList.exam_list_generation);
            // }
            if (subItem.name === 'Exam Group Select') {
              return hasPermission(permissionsDataList.exam_list_generation);
            }
            if (subItem.name === 'Talent Condition') {
              return hasPermission(permissionsDataList.merit_condition);
            }

            if (subItem.name === 'Exam Admit Card') {
              return hasPermission(permissionsDataList.admit_card);
            }
            if (subItem.name === 'Exam Routing Create') {
              return hasPermission(permissionsDataList.routine_with_signature);
            }

            /**
             * Main Route
             * Result
             */
            if (subItem.name === 'Online F: Publish') {
              return hasPermission(permissionsDataList.result_entry);
            }
            if (subItem.name === 'Average V: Report') {
              return hasPermission(permissionsDataList.result_report);
            }

            /**
             * Main Route
             * Darul Ikama
             */
            if (subItem.name === 'Character Report') {
              return hasPermission(permissionsDataList.certificate);
            }
            if (subItem.name === 'Gate pass and leave') {
              return hasPermission(permissionsDataList.gate_pass_leave);
            }
            /**
             * Main Route
             * Accounting
             */
            if (subItem.name === 'Deposit Costs') {
              return hasPermission(permissionsDataList.income_expense);
            }
            if (subItem.name === 'Deposit Costs Report') {
              return hasPermission(permissionsDataList.income_expense_report);
            }
            if (subItem.name === 'Fee Setting') {
              return hasPermission(permissionsDataList.fee_setting);
            }
            if (subItem.name === 'Student Fee Collection') {
              return hasPermission(permissionsDataList.collect_student_fee);
            }
            if (subItem.name === 'Dues List') {
              return hasPermission(permissionsDataList.due_list);
            }
            if (subItem.name === 'Monthly Dues') {
              return hasPermission(permissionsDataList.monthly_due_list);
            }
            if (subItem.name === 'Fee Collection Report') {
              return hasPermission(permissionsDataList.transaction_report);
            }
            if (subItem.name === 'Balance Transfer') {
              return hasPermission(permissionsDataList.balance_transfer);
            }
            if (subItem.name === 'Delete Edit Record') {
              return hasPermission(permissionsDataList.user_transaction);
            }
            /**
             * Main Route
             * Accounting
             */
            if (subItem.name === 'Teacher Info') {
              return hasPermission(permissionsDataList.teacher_info);
            }
            if (subItem.name === 'Pay-role Heading') {
              return hasPermission(permissionsDataList.teacher_payroll);
            }
            if (subItem.name === 'Pay-role Name') {
              return hasPermission(permissionsDataList.teacher_payroll_name);
            }
            if (subItem.name === 'Students Report') {
              return hasPermission(permissionsDataList.teacher_report);
            }
            if (subItem.name === 'Designation') {
              return hasPermission(permissionsDataList.teacher_designation);
            }

            if (subItem.name === 'Exam Report') {
              return hasPermission(permissionsDataList.exam_report);
            }

            if (subItem.name === 'Point Result Entry') {
              return hasPermission(permissionsDataList.result_entry);
            }

            if (subItem.name === 'Point Based Mark Sheet') {
              return hasPermission(permissionsDataList.marksheet);
            }

            // Payment

            if (subItem.name === 'Maddrasah Payment Info') {
              return checkPaymentRoute();
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
  }, [location.pathname, filteredMenuData, permissions?.data, user]);

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
                            `block py-2 ${fontClass} pl-4 rounded-md transition
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
                    `flex items-center font-SolaimanLipi gap-2 py-2 px-4 border-l-6 border-solid ${
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

export default SideBar;
