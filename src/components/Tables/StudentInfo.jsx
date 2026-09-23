import { useCallback, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Buffer } from 'buffer';

// আপনার এক্সিস্টিং ইমপোর্টগুলো
import { permissionsDataList } from '../../Data/permissions';
import { ViewPermission } from '../../Routes/ViewPermission';
import { setItemsPerPage, setCurrentPage } from '../../features/pagination/paginationSlice';
import { setEditUserID } from '../../features/settings/settingsSlice';
import { setEditMode } from '../../features/userInfo/userInfoSlice';
import { useGetUserTypesQuery, useUpdateUserStatusMutation } from '../../features/userType/userTypeSlice';
import { useGetInstitutionInfoQuery } from '../../features/settings/settingsQuerySlice';
import SvgIcon from '../icons/SvgIcon';
import { showModal } from '../../utils/ModalControlar';
import RoundedCropImageUpload from '../Forms/RoundedCropImageUpload';
import avaterImage from '/avatar.png';
import { useGetFilteredStudentsQuery } from '../../features/student/studentQuerySlice';
import DefaultSelect from '../Forms/DefaultSelect';
import ToggleSwitch from '../Switchers/ToggleSwitch';
import Button from '../Button/Button';

const StudentInfo = () => {
  const dispatch = useDispatch();
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const currentPage = useSelector((state) => state.pagination.currentPage);
  const { user } = useSelector((state) => state.auth);
  const [preview, setPreview] = useState({});

  // ✅ More menu states
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRefs = useRef({});
  const menuRef = useRef(null);

  // ✅ ফর্ম স্টেট
  const methods = useForm();
  const { watch, reset, formState: { errors } } = methods;

  const userTypeID = watch("UserTypeID");
  const filterTypeId = watch("FilterTypeId");
  const filterValue = watch("FilterValue");
  const userAction = watch("UserAction");

  // ✅ Debounce
  const [debouncedFilterValue, setDebouncedFilterValue] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterValue(filterValue || "");
    }, 500);
    return () => clearTimeout(handler);
  }, [filterValue]);

  // ✅ Close menu on outside click + scroll + resize
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedButton = Object.values(buttonRefs.current).some(
        (btn) => btn && btn.contains(event.target)
      );
      if (clickedButton) return;

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    const handleScrollOrResize = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, []);

  // ✅ Query params
  const queryParams = {
    page: currentPage,
    limit: itemPerPage,
    userTypeID: 1,
  };

  if ((filterTypeId && debouncedFilterValue) || filterTypeId == 4) {
    queryParams.filterTypeId = filterTypeId;
    queryParams.filterValue = debouncedFilterValue;
  }

  if (userAction !== undefined && userAction !== "" && userAction !== null) {
    queryParams.UserAction = userAction;
  }

  // ✅ RTK Query
  const { data: usersData, isLoading, isError, refetch } = useGetFilteredStudentsQuery(queryParams);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const { data: userType = [] } = useGetUserTypesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  const brandData = usersData?.users || [];
  const totalPage = usersData?.totalPages || 1;
  const totalUsers = usersData?.totalUsers || 0;

  useEffect(() => {
    refetch();
  }, [userTypeID, filterTypeId, debouncedFilterValue, userAction, currentPage, itemPerPage, refetch]);

  const handleResetFilters = () => {
    reset({ UserTypeID: '', FilterTypeId: '', FilterValue: '', UserAction: '' });
    setDebouncedFilterValue('');
    dispatch(setCurrentPage(1));
  };

  const handleEdit = useCallback((id) => {
    showModal('Student Update', 'UPDATE_STUDENT', id);
  }, []);

  const handleStatusToggle = async (UserID, checked) => {
    try {
      await updateUserStatus({ id: UserID, UserAction: checked ? 1 : 0 }).unwrap();
      toast.success(checked ? 'User activated successfully' : 'User deactivated successfully');
      refetch();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleStudentAdmissionModel = useCallback((id) => {
    showModal('Admission Student', 'ADD_STUDENT', id);
  }, []);

  const handleUserCreateModel = useCallback(() => {
    showModal('শিক্ষার্থী ভর্তি', 'ADD_USER');
  }, []);

  // ✅ More menu actions
  const handleAddParentAccount = useCallback((id) => {
    showModal('Add Guardian Account', 'ADD_PARENT_ACCOUNT', id);
  }, []);

  const handleViewProfile = useCallback((id) => {
    // showModal('Student Profile', 'VIEW_STUDENT_PROFILE', id);
    toast.info('এই ফিচারটি বর্তমানে সক্রিয় নয়।');
  }, []);

  const handleSendSMS = useCallback((id) => {
    // showModal('Send SMS', 'SEND_SMS', id);
    toast.info('এই ফিচারটি বর্তমানে সক্রিয় নয়।');
  }, []);

  const handleGenerateIDCard = useCallback((id) => {
    // showModal('Generate ID Card', 'GENERATE_ID_CARD', id);
    toast.info('এই ফিচারটি বর্তমানে সক্রিয় নয়।');
  }, []);

  const handleDelete = useCallback((id) => {
    toast.info('এই ফিচারটি বর্তমানে বন্ধ রয়েছে।');
    // showModal('Delete Student', 'DELETE_STUDENT', id);
  }, []);

  // ✅ Menu open with smart positioning
  const handleMenuToggle = (brand, event) => {
    if (openMenuId === brand.UserID) {
      setOpenMenuId(null);
      return;
    }

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const menuWidth = 256; // w-64
    const menuHeight = 400; // approximate
    const gap = 8;

    // Horizontal alignment
    let left = rect.right - menuWidth;
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    // Vertical - smart placement
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top;
    if (spaceBelow < menuHeight + gap && spaceAbove > spaceBelow) {
      top = rect.top - menuHeight - gap;
    } else {
      top = rect.bottom + gap;
    }

    if (top < 8) top = 8;
    if (top + menuHeight > window.innerHeight - 8) {
      top = window.innerHeight - menuHeight - 8;
    }

    setMenuPosition({ top, left });
    setOpenMenuId(brand.UserID);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">Loading users...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">Error loading data</div>;
  }

  const startRecord = totalUsers > 0 ? (currentPage - 1) * itemPerPage + 1 : 0;
  const endRecord = Math.min(currentPage * itemPerPage, totalUsers);

  const filterTypeOptions = [
    { FilterTypeId: "1", FilterTypeName: "উইজার কোড" },
    { FilterTypeId: "2", FilterTypeName: "নাম" },
    { FilterTypeId: "3", FilterTypeName: "মোবাইল" },
  ];
  const handleTeacherAssign = async () => {
    showModal("Teacher Subject Assignment", "HANDLE_RESULT_ENTRY_ASSIGN", { closeOnOutSide: false })
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden font-SolaimanLipi">
      {/* ✅ Custom CSS for smooth dropdown animation */}
      <style>{`
        @keyframes studentMenuIn {
          from { opacity: 0; transform: scale(0.95) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .student-menu-anim {
          animation: studentMenuIn 0.15s ease-out;
          transform-origin: top right;
        }
      `}</style>

      <FormProvider {...methods}>

        {/* Header */}
        <div className="px-6 py-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50/80 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">শিক্ষার্থী তালিকা</h2>
              <p className="text-[13px] text-gray-500 mt-1.5 font-medium">সিস্টেমের সকল শিক্ষার্থীর তথ্য পরিচালনা ও দেখুন</p>
            </div>
          </div>
          <button onClick={handleUserCreateModel} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
            ভর্তি করুন
          </button>
          <Button className='' onClick={() => { handleTeacherAssign() }} tooltip_message='Teacher Result Entry Permission'>
            <SvgIcon name={"TbUserShare"} size={20} />
          </Button>
        </div>

        {/* Filters */}
        <div className="px-6 py-5 flex flex-col md:flex-row justify-between items-center bg-white gap-4 border-t border-gray-50">

          <div className="flex items-center gap-2 w-full md:w-[440px]">
            <div className="w-[150px] shrink-0">
              <DefaultSelect
                options={filterTypeOptions}
                nameField="FilterTypeName"
                valueField="FilterTypeId"
                registerKey="FilterTypeId"
                defaultValue="নির্বাচন করুন"
              />
            </div>

            {filterTypeId && (
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  {...methods.register("FilterValue")}
                  type="text"
                  placeholder="নাম, উইজার কোড দিয়ে খুঁজুন..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white placeholder-gray-400"
                />
              </div>
            )}

            {(filterValue || userAction !== "") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                title="Reset Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>

          {/* ✅ UserAction Dynamic */}
          <div className="w-full md:w-[150px]">
            <select
              {...methods.register("UserAction")}
              className="border border-gray-200 rounded-lg py-2 px-3 text-[13px] font-medium text-gray-600 bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">সকল স্ট্যাটাস</option>
              <option value="1">সক্রিয়</option>
              <option value="0">নিষ্ক্রিয়</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="w-full px-6">
          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-y border-gray-100 text-gray-600">
                  <th className="py-3.5 px-4 font-bold text-[13px] text-center">ছবি</th>
                  <th className="py-3.5 px-4 font-bold text-[13px] whitespace-nowrap">উইজার বিবরণ</th>
                  <th className="py-3.5 px-4 font-bold text-[13px] text-center whitespace-nowrap">উইজার কোড</th>
                  <th className="py-3.5 px-4 font-bold text-[13px] text-center whitespace-nowrap">পিতার নাম</th>
                  <th className="py-3.5 px-4 font-bold text-[13px] text-center">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 font-bold text-[13px] text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {brandData.length > 0 ? (
                  brandData.map((brand, key) => {
                    const imageBuffer = brand?.UserImage?.Image;
                    let imageSrc = null;
                    if (imageBuffer?.type === "Buffer" && Array.isArray(imageBuffer?.data) && imageBuffer.data.length > 0) {
                      imageSrc = `data:image/png;base64,${Buffer.from(imageBuffer.data).toString("base64")}`;
                    }

                    const isActive = brand.UserAction === 1;
                    const statusClass = isActive
                      ? "bg-[#ecfdf5] text-[#059669]"
                      : "bg-[#fef2f2] text-[#dc2626]";
                    const statusText = isActive ? "Active" : "Inactive";

                    return (
                      <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-2 px-2">
                          <div className="text-center">
                            <ViewPermission permissionId={permissionsDataList.user_entry} permissionType="edit">
                              <RoundedCropImageUpload
                                label=""
                                registerKey={`avatar-${brand.UserID}`}
                                require
                                image={imageSrc}
                                fallbackImage={avaterImage}
                                previewUrl={preview[brand.UserID] || null}
                                setPreviewUrl={(value) => {
                                  setPreview((prev) => ({ ...prev, [brand.UserID]: value }));
                                }}
                                size="w-16 h-16"
                                userId={brand.UserID}
                                onUploadSuccess={() => refetch()}
                              />
                            </ViewPermission>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="font-semibold text-gray-800 text-[15px] leading-tight whitespace-nowrap">{brand.UserName}</div>
                          <div className="text-gray-500 font-medium text-[13px] mt-1">{brand.Mobile1 || '-'}</div>
                        </td>
                        <td className="py-2 px-4 text-[14px] text-gray-700 text-center font-medium">
                          {brand?.UserCode || '-'}
                        </td>
                        <td className="py-2 px-4 text-[14px] text-gray-700 text-center font-normal whitespace-nowrap">
                          {brand?.FatherName || '-'}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium tracking-wide ${statusClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-[#059669]' : 'bg-[#dc2626]'}`}></span>
                            {statusText}
                          </span>
                        </td>
                        {/* <td className="py-2 px-4 text-center">
                          <ViewPermission
                            permissionId={permissionsDataList.user_entry}
                            permissionType="edit"
                          >
                            <ToggleSwitch
                              checked={brand.UserAction === 1}
                              onChange={(e) =>
                                handleStatusToggle(
                                  brand?.UserID,
                                  e.target.checked
                                )
                              }
                            />
                          </ViewPermission>
                        </td> */}
                        <td className="py-2 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {brand?.UserType?.ID === 1 && (
                              <button
                                type="button"
                                onClick={() => handleStudentAdmissionModel(brand.UserID)}
                                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                title="Student Admission"
                              >
                                <SvgIcon name="UserPlus" size={15} />
                              </button>
                            )}

                            {brand?.UserType?.ID === 1 && (
                              <ViewPermission permissionId={permissionsDataList.user_entry} permissionType="edit">
                                <button
                                  onClick={() => handleEdit(brand.UserID)}
                                  className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                  title="Edit"
                                >
                                  <SvgIcon name="FiEdit" size={15} />
                                </button>
                              </ViewPermission>
                            )}

                            <button
                              onClick={() => handleDelete(brand.UserID)}
                              className="w-8 h-8 flex items-center justify-center bg-[#ef4444] text-white rounded-md hover:bg-red-600 transition-colors"
                              title="Delete"
                            >
                              <SvgIcon name="FaTrash" size={13} />
                            </button>

                            {/* ✅ More button */}
                            <button
                              ref={(el) => (buttonRefs.current[brand.UserID] = el)}
                              onClick={(e) => handleMenuToggle(brand, e)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-all ${openMenuId === brand.UserID
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-gray-200'
                                }`}
                              title="More"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500 bg-gray-50/50 text-[14px]">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-2 flex flex-col sm:flex-row justify-between items-center bg-white gap-4">
          <div className="text-[13px] text-gray-500 font-normal">
            Showing <span className="font-semibold text-gray-700">{startRecord}</span> to <span className="font-semibold text-gray-700">{endRecord}</span> of <span className="font-semibold text-gray-700">{totalUsers}</span> users
          </div>

          <div className="flex items-center gap-4">
            <select
              className="border border-gray-200 rounded-md bg-white py-1.5 px-3 text-[13px] text-gray-600 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              onChange={(e) => {
                dispatch(setItemsPerPage(Number(e.target.value)));
                dispatch(setCurrentPage(1));
              }}
              value={itemPerPage}
            >
              {[10, 20, 50].map((num) => (
                <option key={num} value={num}>{num} / page</option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                disabled={currentPage === 1}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>

              <button className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-blue-600 text-white text-[13px] font-medium">
                {currentPage}
              </button>

              <button
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                disabled={currentPage === totalPage || totalPage === 0}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>

      </FormProvider>

      {/* ✅ Portal Dropdown - Table এর বাইরে render হবে, কোনো clipping হবে না */}
      {openMenuId &&
        (() => {
          const brand = brandData.find((b) => b.UserID === openMenuId);
          if (!brand) return null;

          const isActive = brand.UserAction === 1;

          return createPortal(
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                width: '290px',
              }}
              className="student-menu-anim bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-gray-200/80 z-[9999] overflow-hidden"
            >
              {/* ================= HEADER ================= */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-4 pt-4 pb-5">
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 top-10 w-12 h-12 rounded-full bg-blue-400/10" />

                <div className="relative flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-lg ring-2 ring-white/20">
                      {brand.UserName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* Online status */}
                    <span
                      className={`absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${isActive ? 'bg-emerald-400' : 'bg-gray-400'
                        }`}
                    />
                  </div>

                  {/* User Info */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white truncate">
                        {brand.UserName || 'Unknown Student'}
                      </p>

                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${isActive
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-gray-400/15 text-gray-300'
                          }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-[11px] text-blue-200/80 mt-1 truncate">
                      ID: {brand.UserCode || 'No Code'}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      <span className="text-[10px] text-blue-200/70">
                        Student Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= QUICK STATUS ================= */}
              <div className="px-3 pt-3">
                <button
                  onClick={() => {
                    handleStatusToggle(brand.UserID, !isActive);
                    setOpenMenuId(null);
                  }}
                  className={`group w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${isActive
                    ? 'bg-emerald-50/70 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? 'bg-emerald-100' : 'bg-gray-200'
                        }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                      />
                    </div>

                    <div className="text-left">
                      <p
                        className={`text-[12px] font-semibold ${isActive ? 'text-emerald-700' : 'text-gray-700'
                          }`}
                      >
                        Account {isActive ? 'Active' : 'Inactive'}
                      </p>

                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {isActive
                          ? 'Student can access the account'
                          : 'Account access is currently disabled'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle */}
                  <div
                    className={`relative w-9 h-5 rounded-full transition-colors ${isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isActive ? 'left-[18px]' : 'left-0.5'
                        }`}
                    />
                  </div>
                </button>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="px-3 pt-4 pb-2">
                <div className="flex items-center justify-between px-2 mb-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">
                    Quick Actions
                  </p>

                  <span className="text-[9px] text-gray-300">
                    {4} available
                  </span>
                </div>

                {/* Add Parent */}
                <button
                  onClick={() => {
                    handleAddParentAccount(brand.UserID);
                    setOpenMenuId(null);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-purple-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-700 group-hover:text-purple-700">
                      Add Parent Account
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Create parent access
                    </p>
                  </div>

                  <svg
                    className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* View Profile */}
                <button
                  onClick={() => {
                    handleViewProfile(brand.UserID);
                    setOpenMenuId(null);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-700 group-hover:text-blue-700">
                      View Profile
                    </p>
                    <p className="text-[10px] text-gray-400">
                      View complete student details
                    </p>
                  </div>

                  <svg
                    className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Send SMS */}
                <button
                  onClick={() => {
                    handleSendSMS(brand.UserID);
                    setOpenMenuId(null);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-700 group-hover:text-emerald-700">
                      Send SMS
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Send a message to student
                    </p>
                  </div>

                  <svg
                    className="w-3.5 h-3.5 text-gray-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* ID Card */}
                <button
                  onClick={() => {
                    handleGenerateIDCard(brand.UserID);
                    setOpenMenuId(null);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-amber-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.418.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                      />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-700 group-hover:text-amber-700">
                      Generate ID Card
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Create printable student ID
                    </p>
                  </div>

                  <svg
                    className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* ================= DANGER ZONE ================= */}
              <div className="mx-3 mb-3 border-t border-gray-100 pt-2">
                <button
                  onClick={() => {
                    handleDelete(brand.UserID);
                    setOpenMenuId(null);
                  }}
                  className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-red-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                    <svg
                      className="w-4 h-4 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-red-600">
                      Delete Student
                    </p>
                    <p className="text-[10px] text-red-400/80">
                      Permanently remove this account
                    </p>
                  </div>
                </button>
              </div>

              {/* Bottom subtle line */}
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            </div>,
            document.body
          );
        })()}
    </div>
  );
};

export default StudentInfo;
