import { useCallback, useEffect } from 'react'; // Import useEffect and useState
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { permissionsDataList } from '../../Data/permissions';
import { ViewPermission } from '../../Routes/ViewPermission';
import { setItemsPerPage } from '../../features/pagination/paginationSlice';
import { setEditUserID } from '../../features/settings/settingsSlice';
import { setEditMode } from '../../features/userInfo/userInfoSlice';
import { useGetFilteredUsersQuery, useGetNewAccessTokenMutation, useGetUserTypesQuery } from '../../features/userType/userTypeSlice';
import Fourdots from '../../images/brand/four-dots-square.svg';
import DefaultInput from "../Forms/DefaultInput";
import DefaultSelect from '../Forms/DefaultSelect';
import Pagination from '../Pagination/Pagination';
import SvgIcon from '../icons/SvgIcon';
import Button from '../Button/Button';
import { Link } from 'react-router-dom';
import { useGetInstitutionInfoQuery } from '../../features/settings/settingsQuerySlice';
import OwenGuide from '../../Routes/OwenGuide';
import Swal from "sweetalert2"
import { showModal } from '../../utils/ModalControlar';

const TableOne = () => {
  const dispatch = useDispatch();
  const itemPerPage = useSelector((state) => state.pagination.itemsPerPage);
  const currentPage = useSelector((state) => state.pagination.currentPage);
  const { user, token, status } = useSelector((state) => state.auth);

  // ✅ ফর্ম স্টেট ম্যানেজমেন্ট
  const methods = useForm();
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = methods;

  // ✅ ফর্ম ভ্যালু ওয়াচ করছি
  const userTypeID = watch("UserTypeID");
  const filterTypeId = watch("FilterTypeId");
  const filterValue = watch("FilterValue");

  // ✅ API কলের জন্য প্যারামিটার তৈরি
  const queryParams = {
    page: currentPage,
    limit: itemPerPage,
  };

  // শুধুমাত্র যখন ভ্যালু আছে তখনই প্যারামিটার যোগ করব
  if (userTypeID) {
    queryParams.userTypeID = userTypeID;
  }

  if ((filterTypeId && filterValue) || filterTypeId == 4) {
    queryParams.filterTypeId = filterTypeId;
    queryParams.filterValue = filterValue;
  }

  // ✅ RTK Query ব্যবহার করে ডেটা ফেচ করছি
  const {
    data: usersData,
    isLoading,
    isError,
    refetch, // refetch ফাংশন যোগ করেছি
  } = useGetFilteredUsersQuery(queryParams);
  const { data: instutionInfo } = useGetInstitutionInfoQuery();

  console.log(usersData, "usersData");

  const brandData = usersData?.users || [];
  const totalPage = usersData?.totalPages || 1;
  const totalUsers = usersData?.totalUsers || 0;

  const { data: userType = [] } = useGetUserTypesQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const [triggerGetToken, { data, isLoading: accessTokenLogin, error }] = useGetNewAccessTokenMutation();
  // ✅ ফর্ম ভ্যালু পরিবর্তন হলে API রিফেচ করব
  useEffect(() => {
    // যখন userTypeID, filterTypeId, বা filterValue পরিবর্তন হবে
    refetch();
  }, [userTypeID, filterTypeId, filterValue, refetch]);

  // ✅ ফর্ম রিসেট করার ফাংশন
  const handleResetFilters = () => {
    reset({
      UserTypeID: '',
      FilterTypeId: '',
      FilterValue: '',
    });
  };

  const handleEdit = (id) => {
    dispatch(setEditMode(1));
    dispatch(setEditUserID(id));
  };


  const handleStudentAdmissionModel = useCallback((id) => {
    showModal('Selected Per Student Fee', 'ADD_STUDENT', id);
  }, []);

  const handleuserPanelLogin = async (token) => {
    // Swal.fire({
    //   icon: "warning",
    //   title: "সাময়িকভাবে বন্ধ",
    //   text: "ইউজার প্যানেলটি কিছু সময়ের জন্য বন্ধ রাখা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
    //   confirmButtonText: "ঠিক আছে",
    // });
    try {
      const result = await triggerGetToken({ user_code: token }).unwrap();
      console.log(result);

      localStorage.setItem("user_panel_token", result)
      window.open(`/${instutionInfo?.InstitutionCode}/dashboard`, "_blank");
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="rounded-sm bg-white pt-2 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="rounded-sm bg-white pt-2 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
        <div className="flex justify-center items-center py-8">
          <div className="text-red-500">Error loading data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm bg-white pt-2 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
      {/* ফিল্টার সেকশন */}
      <div className="flex justify-between items-center py-3">
        <div className="flex gap-4 items-center">
          <FormProvider {...methods}>
            <div className="flex flex-wrap gap-3 items-center">
              {/* ইউজার টাইপ ফিল্টার */}
              <div className="min-w-[150px]">
                <DefaultSelect
                  type="number"
                  label=""
                  options={userType}
                  registerKey="UserTypeID"
                  valueField="ID"
                  nameField="TypeName"
                  require={false}
                  placeholder="ইউজার টাইপ"
                />
              </div>

              {/* ফিল্টার টাইপ */}
              <div className="min-w-[150px]">
                <DefaultSelect
                  label=""
                  options={[
                    { name: "সব দেখুন", value: "" },
                    { name: "ইউজার কোড", value: 1 },
                    { name: "ইউজার নাম", value: 2 },
                    { name: "মোবাইল নাম্বার", value: 3 },
                    { name: "User Accounts", value: 4 }
                  ]}
                  registerKey="FilterTypeId"
                  valueField="value"
                  nameField="name"
                  require={false}
                  placeholder="ফিল্টার টাইপ"
                />
              </div>

              {/* ফিল্টার ভ্যালু */}
              <div className="min-w-[200px]">
                <DefaultInput
                  label=""
                  registerKey="FilterValue"
                  require={false}
                  placeholder="অনুসন্ধান করুন..."
                />
              </div>

              {/* রিসেট বাটন */}
              <div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  রিসেট
                </button>
              </div>
            </div>
          </FormProvider>
        </div>

        {/* Items Per Page */}
        <select
          className="border border-gray-300 rounded-md bg-white py-1.5 px-3 text-sm text-gray-700 shadow-sm
             focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
             hover:border-gray-400 transition-colors"
          onChange={(e) => dispatch(setItemsPerPage(Number(e.target.value)))}
          value={itemPerPage}
          defaultValue={20}
        >
          {[2, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* টেবিল */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-[#3F4885] text-white">
            <tr className="text-center">
              {[
                <img
                  key="icon1"
                  src={Fourdots}
                  alt="icon"
                  className="w-4 h-4"
                />,
                <img
                  key="icon2"
                  src={Fourdots}
                  alt="icon"
                  className="w-4 h-4"
                />,
                'দাখেলা',
                'ইউজার নাম',
                'পিতার নাম',
                'মোবাইল নাম্বার',
                'ইউজার ধরন',
                'Accounts'
              ].map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-1 font-medium border border-white"
                >
                  {typeof header === 'string' ? (
                    header
                  ) : (
                    <div className="flex justify-center">{header}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {brandData.length > 0 ? (
              brandData.map((brand, key) => (
                <tr
                  key={key}
                  className={`${key % 2 !== 0 ? 'bg-[#f5f3f3]' : ''
                    } border border-white`}
                >
                  <td className="py-1 px-4 border border-white text-center">
                    <ViewPermission
                      permissionId={permissionsDataList.user_entry}
                      permissionType="edit"
                    >
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleEdit(brand.UserID)}
                      >
                        <SvgIcon name="FiEdit" size={24} />
                      </button>
                    </ViewPermission>
                    <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 ml-[26px]"
                        onClick={() => handleStudentAdmissionModel(brand.UserID)}
                      >
                        <SvgIcon name="UserPlus" size={26} />
                      </button>
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    <button className="text-red-500 hover:text-red-700">
                      <SvgIcon name="FaTrash" size={20} />
                    </button>
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand.UserCode}
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand.UserName}
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand.FatherName}
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand.Mobile1}
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand?.UserType?.TypeName}
                  </td>
                  <td className="py-1 px-4 border border-white text-center">
                    {brand?.UserTypeID == 1 && brand?.LoginInfo?.UserID ? (
                      typeof user.permissionType === "number" && user.permissionType < 4 ? (
                        <>
                          <Button onClick={() => { handleuserPanelLogin(brand?.UserCode) }} className='text-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-login-2 mx-auto">
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M9 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
                              <path d="M3 12h13l-3 -3" />
                              <path d="M13 15l3 -3" />
                            </svg>
                          </Button>
                        </>
                      ) : (
                        <p className='text-green-600 text-[13px]'>Active</p>
                      )
                    ) : ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-2 text-gray-500">
                  কোন ডেটা পাওয়া যায়নি
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* পেজিনেশন */}
      <div className="flex items-center my-2">
        <div className="pl-2">
          <span className="text-md text-gray-800">
            পেজ <span className="font-semibold text-black">{currentPage}</span> - {totalPage} এর মধ্যে
            (<span className="font-semibold text-black">{totalUsers}</span> ইউজার)
          </span>
        </div>
        <div className="ml-auto">
          <Pagination totalpages={totalPage} />
        </div>
      </div>
    </div>
  );
};

export default TableOne;
