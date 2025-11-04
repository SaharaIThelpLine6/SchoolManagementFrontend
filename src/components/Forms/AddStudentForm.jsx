import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setEditUserID } from '../../features/settings/settingsSlice';
import { useGetSingleUserQuery } from '../../features/userType/userTypeSlice';
import CreateUser from '../../view/user/CreateUser';
import UpdateUser from '../../view/user/UpdateUser';

const AddStudentForm = () => {
  const dispatch = useDispatch();
  const { editUserID } = useSelector((state) => state.settings);

  // ✅ Fetch single user data only when editUserID exists
  const {
    data: singleUserData,
    isLoading: isSingleUserLoading,
    isError: isSingleUserError,
  } = useGetSingleUserQuery(editUserID, {
    skip: !editUserID,
  });

  // ✅ Optional cleanup — reset editUserID when unmounting
  useEffect(() => {
    return () => {
      dispatch(setEditUserID(null));
    };
  }, [dispatch]);

  // ✅ Loading state UI
  if (isSingleUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 border-solid"></div>
        <p className="mt-3 text-gray-600 font-medium">ডেটা লোড হচ্ছে...</p>
      </div>
    );
  }

  // ✅ Error state UI
  if (isSingleUserError) {
    return (
      <div className="text-center text-red-600 font-medium py-6">
        ইউজার ডেটা লোড করতে সমস্যা হয়েছে।
      </div>
    );
  }

  // ✅ Render forms conditionally
  return (
    <div>
      {editUserID ? (
        <UpdateUser singleUserData={singleUserData} />
      ) : (
        <CreateUser />
      )}
    </div>
  );
};

export default AddStudentForm;
