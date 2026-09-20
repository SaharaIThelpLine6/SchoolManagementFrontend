import { useCallback, useEffect, useState } from 'react';
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

const StudentInfo = () => {
  const dispatch = useDispatch();
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const currentPage = useSelector((state) => state.pagination.currentPage);
  const { user } = useSelector((state) => state.auth);
  const [preview, setPreview] = useState({});

  // ✅ ফর্ম স্টেট
  const methods = useForm();
  const { watch, reset, formState: { errors } } = methods;

  const userTypeID = watch("UserTypeID");
  const filterTypeId = watch("FilterTypeId");
  const filterValue = watch("FilterValue");
  const userAction = watch("UserAction");   // ✅ NEW

  // ✅ Debounce
  const [debouncedFilterValue, setDebouncedFilterValue] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilterValue(filterValue || "");
    }, 500);
    return () => clearTimeout(handler);
  }, [filterValue]);

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

  // ✅ UserAction dynamic
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden font-sans">
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
                    const statusText = isActive ? "Active" : "Inactive";
                    const statusClass = isActive
                      ? "bg-[#ecfdf5] text-[#059669]"
                      : "bg-[#fef2f2] text-[#dc2626]";

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
                        </td>
                        {/* <td className="py-2 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium tracking-wide ${statusClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-[#059669]' : 'bg-[#dc2626]'}`}></span>
                            {statusText}
                          </span>
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

                            <button className="w-8 h-8 flex items-center justify-center bg-[#ef4444] text-white rounded-md hover:bg-red-600 transition-colors" title="Delete">
                              <SvgIcon name="FaTrash" size={13} />
                            </button>

                            {/* <button className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 border border-gray-200 transition-colors" title="More">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button> */}
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
    </div>
  );
};

export default StudentInfo;