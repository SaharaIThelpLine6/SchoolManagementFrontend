import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Buffer } from 'buffer';
import Swal from "sweetalert2";

// আপনার এক্সিস্টিং ইমপোর্টগুলো
import { permissionsDataList } from '../../Data/permissions';
import { ViewPermission } from '../../Routes/ViewPermission';
// ✅ ১. এখানে setCurrentPage ইমপোর্ট করা হয়েছে
import { setItemsPerPage, setCurrentPage } from '../../features/pagination/paginationSlice';
import { setEditUserID } from '../../features/settings/settingsSlice';
import { setEditMode } from '../../features/userInfo/userInfoSlice';
import { useGetFilteredUsersQuery, useGetNewAccessTokenMutation, useGetUserTypesQuery, useUpdateUserStatusMutation } from '../../features/userType/userTypeSlice';
import { useGetInstitutionInfoQuery } from '../../features/settings/settingsQuerySlice';
import DefaultInput from "../Forms/DefaultInput";
import DefaultSelect from '../Forms/DefaultSelect';
import Pagination from '../Pagination/Pagination';
import SvgIcon from '../icons/SvgIcon';
import Button from '../Button/Button';
import { showModal } from '../../utils/ModalControlar';
import RoundedCropImageUpload from '../Forms/RoundedCropImageUpload';
import avaterImage from '/avatar.png';

const TableOne = () => {
  const dispatch = useDispatch();
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const currentPage = useSelector((state) => state.pagination.currentPage);
  const { user } = useSelector((state) => state.auth);
  const [preview, setPreview] = useState({});

  // ✅ ফর্ম স্টেট ম্যানেজমেন্ট
  const methods = useForm();
  const {
    watch,
    reset,
    formState: { errors },
  } = methods;

  const userTypeID = watch("UserTypeID");
  const filterTypeId = watch("FilterTypeId");
  const filterValue = watch("FilterValue");

  // ✅ API কলের জন্য প্যারামিটার তৈরি
  const queryParams = {
    page: currentPage,
    limit: itemPerPage,
  };

  if (userTypeID) queryParams.userTypeID = userTypeID;
  if ((filterTypeId && filterValue) || filterTypeId == 4) {
    queryParams.filterTypeId = filterTypeId;
    queryParams.filterValue = filterValue;
  }

  // ✅ RTK Query
  const { data: usersData, isLoading, isError, refetch } = useGetFilteredUsersQuery(queryParams);
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
  }, [userTypeID, filterTypeId, filterValue, refetch]);

  const handleResetFilters = () => {
    reset({ UserTypeID: '', FilterTypeId: '', FilterValue: '' });
  };

  const handleEdit = (id) => {
    dispatch(setEditMode(1));
    dispatch(setEditUserID(id));
  };

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
    showModal('Selected Per Student Fee', 'ADD_STUDENT', id);
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">Loading users...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500 bg-white rounded-xl shadow-sm border border-gray-100 font-sans">Error loading data</div>;
  }

  // Pagination Calculation
  const startRecord = totalUsers > 0 ? (currentPage - 1) * itemPerPage + 1 : 0;
  const endRecord = Math.min(currentPage * itemPerPage, totalUsers);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden font-sans">
      <FormProvider {...methods}>

        {/* Header Section */}
        <div className="px-6 py-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50/80 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-gray-900 tracking-tight leading-none">Users</h2>
              <p className="text-[13px] text-gray-500 mt-1.5 font-medium">Manage and view all users in the system</p>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
            </svg>
            Add User
          </button>
        </div>

        {/* Filters Section */}
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center bg-white gap-4 border-t border-gray-50">
          <div className="relative w-full md:w-[320px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-[130px]">
              <DefaultSelect
                label=""
                options={[{ name: "All Roles", value: "" }, ...(userType || [])]}
                registerKey="UserTypeID"
                valueField="ID"
                nameField="TypeName"
                require={false}
                placeholder="All Roles"
              />
            </div>
            <div className="w-full md:w-[130px]">
              <select className="border border-gray-200 rounded-lg py-2 px-3 text-[13px] font-medium text-gray-600 bg-white w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto w-full border-t border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-y border-gray-100 text-gray-500">
                <th className="py-3.5 px-4 font-bold text-[13px] text-center">Image</th>
                <th className="py-3.5 px-4 font-bold text-[13px] whitespace-nowrap">User Details</th>
                <th className="py-3.5 px-4 font-bold text-[13px] text-center whitespace-nowrap">User Code</th>
                <th className="py-3.5 px-4 font-bold text-[13px] text-center whitespace-nowrap">Father Name</th>
                <th className="py-3.5 px-4 font-bold text-[13px] text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-[13px] text-center">Role</th>
                <th className="py-3.5 px-4 font-bold text-[13px] text-center">Actions</th>
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
                      <td className="py-4 px-4">
                        <div className="w-[42px] h-[42px] rounded-full overflow-hidden bg-gray-100 mx-auto flex-shrink-0">
                          <img
                            src={imageSrc || avaterImage}
                            alt={brand.UserName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-800 text-[15px] leading-tight whitespace-nowrap">{brand.UserName}</div>
                        <div className="text-gray-500 font-medium text-[13px] mt-1">{brand.Mobile1 || 'john.doe@example.com'}</div>
                      </td>

                      <td className="py-4 px-4 text-[14px] text-gray-700 text-center font-medium">
                        {brand?.UserCode || 'Admin'}
                      </td>
                      <td className="py-4 px-4 text-[14px] text-gray-700 text-center font-normal whitespace-nowrap">
                        {brand?.FatherName || ''}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium tracking-wide ${statusClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-[#059669]' : 'bg-[#dc2626]'}`}></span>
                          {statusText}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[14px] text-gray-700 text-center font-normal">
                        {brand?.UserType?.TypeName || 'Admin'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <ViewPermission permissionId={permissionsDataList.user_entry} permissionType="edit">
                            <button
                              onClick={() => handleEdit(brand.UserID)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              title="Edit"
                            >
                              <SvgIcon name="FiEdit" size={15} />
                            </button>
                          </ViewPermission>

                          <button className="w-8 h-8 flex items-center justify-center bg-[#ef4444] text-white rounded-md hover:bg-red-600 transition-colors" title="Delete">
                            <SvgIcon name="FaTrash" size={13} />
                          </button>

                          <button className="w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-500 rounded-md hover:bg-gray-100 border border-gray-200 transition-colors" title="More">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
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

        {/* Footer / Pagination Section */}
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center bg-white gap-4 border-t border-gray-100">
          <div className="text-[13px] text-gray-500 font-normal">
            Showing <span className="font-semibold text-gray-700">{startRecord}</span> to <span className="font-semibold text-gray-700">{endRecord}</span> of <span className="font-semibold text-gray-700">{totalUsers}</span> users
          </div>

          <div className="flex items-center gap-4">
            {/* Items Per Page Dropdown */}
            <select
              className="border border-gray-200 rounded-md bg-white py-1.5 px-3 text-[13px] text-gray-600 focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              onChange={(e) => dispatch(setItemsPerPage(Number(e.target.value)))}
              value={itemPerPage}
            >
              {[10, 20, 50].map((num) => (
                <option key={num} value={num}>{num} / page</option>
              ))}
            </select>

            {/* Custom Pagination UI */}
            <div className="flex items-center gap-1.5">

              {/* ✅ ২. Previous বাটনে onClick ইভেন্ট যুক্ত করা হয়েছে */}
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

              {/* ✅ ৩. Next বাটনে onClick ইভেন্ট যুক্ত করা হয়েছে */}
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

export default TableOne;