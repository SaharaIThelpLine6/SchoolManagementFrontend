import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import EditButton from '../components/Button/EditButton';
import FilterButton from '../components/Filter/FilterButton';
import DefaultImageUpload from '../components/Forms/DefaultImageUpload';
import DefaultInput from '../components/Forms/DefaultInput';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import {
  useGetAllUserWithImageQuery,
  usePostUserSingleImageUploadMutation,
} from '../features/dashboard/dashboardQuerySlice';
import { setFilteredUser } from '../features/student/studentSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
const PAGE_SIZE = 10;

const UserImage = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [previewImg, setPreviewImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const methods = useForm();
  const { reset } = methods;
  const { filteredUser } = useSelector((state) => state.student);

  const {
    data: userResponse = { data: [], totalUsers: 0, totalPages: 0 },
    isError,
    isLoading,
  } = useGetAllUserWithImageQuery({ page: currentPage, limit: PAGE_SIZE });

  const users = userResponse?.data ?? [];

  const [
    postUserInage,
    { isLoading: uploadLoading, isError: uploadError, isSuccess },
  ] = usePostUserSingleImageUploadMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = userResponse?.totalPages ?? 0;

  useEffect(() => {
    console.log(filteredUser);
    // const filterData = users.find((i) => i.UserID === filteredUser?.UserID);
    if (filteredUser) {
      console.log(filteredUser);

      const imageBuffer = filteredUser?.Image;
      if (imageBuffer) {
        const base64String = Buffer.from(imageBuffer).toString('base64');
        const src = `data:image/png;base64,${base64String}`;
        setPreviewImg(src);
      } else {
        setPreviewImg(null);
      }
    } else {
      setPreviewImg(null);
    }
    console.log('reset satart');

    reset({
      ID: filteredUser?.UserID || '',
      UserCode: filteredUser?.UserCode || '',
      UserName: filteredUser?.UserName || '',
    });
  }, [filteredUser, reset]);

  // useEffect(() => {
  //   console.log(filterData);

  // }, [filterData, reset]);

  const handleEditOpenModal = (row) => {
    setPreviewUrl(null);
    const imageBuffer = row?.UserImage?.[0]?.Image;
    if (imageBuffer) {
      const base64String = Buffer.from(imageBuffer).toString('base64');
      const src = `data:image/png;base64,${base64String}`;
      setPreviewImg(src);
    } else {
      setPreviewImg(null);
    }
    reset({
      ID: row.UserID || '',
      UserCode: row.UserCode || '',
      UserName: row.UserName || '',
    });
  };

  const columns = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row)} />
        </div>
      ),
    },
    {
      title: translate('User Code'),
      field: 'UserCode',
      hozAlign: 'center',
      render: (row) => <p>{row.UserCode}</p>,
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => <p>{bnBijoy2Unicode(row.UserName)}</p>,
    },
    {
      title: translate('Image'),
      field: 'UserImage',
      hozAlign: 'center',
      render: (row) => {
        if (!row.UserImage || row.UserImage.length === 0) return <span>-</span>;

        // ধরছি শুধু প্রথম image দেখাব
        const imageBuffer = row.UserImage[0].Image; // Buffer
        if (!imageBuffer) return <span>-</span>;

        // Convert buffer to base64
        const base64String = Buffer.from(imageBuffer).toString('base64');
        const src = `data:image/png;base64,${base64String}`;

        return (
          <div className="flex justify-center items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20  rounded-lg overflow-hidden shadow-md border border-gray-200">
              <img
                src={src}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        );
      },
    },
  ];

  const handleOpenModal = useCallback(() => {
    showModal('Filter User', 'USER_FILTER');
  }, []);

  const onSubmit = async (data) => {
    console.log(data, 'data');

    // single image field থেকে file
    const file = data.singleImage;
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'No Image Selected',
        text: 'Please select an image before submitting.',
      });
      return;
    }

    const fileName = file.name || '';
    const match = fileName.match(/^\d+/);
    const prefixNumber = match ? parseInt(match[0], 10) : null;

    // ✅ UserCode এর সাথে মিলানো
    // if (!prefixNumber || prefixNumber !== Number(data.UserCode)) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Invalid File",
    //     text: `File name must start with UserCode: ${data.UserCode}`,
    //   });
    //   return;
    // }

    // ✅ সব ঠিক থাকলে submit
    const formData = new FormData();
    formData.append('image', file);
    formData.append('UserID', data.ID);

    try {
      const res = await postUserInage(formData).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Uploaded Successfully',
        text: 'User image has been uploaded.',
      });

      reset({ ID: '', UserCode: '', UserName: '', singleImage: null });
      setPreviewImg(null);
      setPreviewUrl(null);
      dispatch(setFilteredUser(null));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err?.data?.error || 'Something went wrong!',
      });
    }
  };

  const handleReset = () => {
    reset({ ID: '', UserCode: '', UserName: '', singleImage: null });
    setPreviewImg(null);
    setPreviewUrl(null);
    dispatch(setFilteredUser(null));
  };
  // page change বা component remount হলে form reset করা
  useEffect(() => {
    // page change হলে filterData reset করা
    handleReset();
  }, [location.pathname]);

  if (uploadLoading) {
    <Loading />;
  }
  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <FormProvider {...methods}>
          <div className="filter_header flex items-center justify-between sm:px-5 sm:pt-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold">
              {translate('User Image')}
            </h3>
          </div>
          <div className="mb-5">
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="font-lato space-y-6 p-0 sm:p-6 bg-white rounded-xl shadow-md border border-gray-100"
            >
              {/* Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Section */}
                <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {translate('Upload Profile Image')}
                  </h3>
                  <div className="flex justify-center items-center">
                    <DefaultImageUpload
                      registerKey="singleImage"
                      require="This is required"
                      image={previewImg}
                      setPreviewUrl={setPreviewUrl}
                      previewUrl={previewUrl}
                    />
                  </div>
                </div>

                {/* Input fields Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    {translate('User Information')}
                  </h3>
                  <div className="space-y-4">
                    <DefaultInput
                      registerKey="ID"
                      require={translate('ID is required')}
                      type="text"
                      placeholder={translate('Enter type of id') + ' ...'}
                      label="ID"
                      disable
                    />
                    <DefaultInput
                      registerKey="UserCode"
                      require={translate('UserCode is required')}
                      type="text"
                      placeholder={translate('Enter type of userCode') + ' ...'}
                      label="Code"
                      disable
                    />
                    <DefaultInput
                      registerKey="UserName"
                      require={translate('UserName is required')}
                      type="text"
                      placeholder={translate('Enter type of userName') + ' ...'}
                      label="Name"
                      disable={true}
                      unicode={true}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex p-4 flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <ViewPermission
                    permissionId={permissionsDataList.user_photo}
                    permissionType="insert|edit"
                  >
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                      type="submit"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      {translate('Upload')}
                    </Button>
                  </ViewPermission>

                  <Button
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg w-full sm:w-auto flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                    onClick={handleReset}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {translate('Reset')}
                  </Button>
                  {/* Filter Button */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-gray-700 font-medium sm:hidden">
                      {translate('Filter User')} :
                    </label>
                    <FilterButton
                      onClick={handleOpenModal}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 border-0 text-white px-5 py-2.5 rounded-lg flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                      {translate('Filter')}
                    </FilterButton>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {isLoading ? (
            // Loading State
            <div className="flex justify-center items-center py-10">
              <Loading />
            </div>
          ) : isError ? (
            // Error State
            <div className="text-center text-red-500 py-10">
              {translate('Failed to load user image type data')}
            </div>
          ) : users.length === 0 ? (
            // No Data State
            <div className="text-center text-gray-500 py-10">
              {translate('No user data found')}
            </div>
          ) : (
            // Table + Pagination
            <>
              <SortableTable columns={columns} data={users} />

              <div className="flex justify-center mt-4">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default UserImage;
