import { Buffer } from 'buffer';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetUserDetailsQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
export default function UserProfile() {
  const [openSettings, setOpenSettings] = useState(false);
  const settingsRef = useRef();

  const currentSession = useSelector(
    (state) => state.sessionChange.currentSession
  );

  const {
    data: userDetails,
    isLoading: isuserDetailsLoading,
    isError: isuserDetailsError,
  } = useGetUserDetailsQuery(currentSession);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setOpenSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return '/logo.png';
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString('base64');
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };

  return (
    <div className="bg-white shadow-xl pb-8 relative h-screen">
      {/* Settings Button */}

      {/* Banner */}
      <div className="w-full h-[100px]">
        <img
          src="https://vojislavd.com/ta-template-demo/assets/img/profile-background.jpg"
          className="w-full h-full object-cover"
          alt="profile background"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center -mt-20">
        <img
          src={
            userDetails?.User?.UserImage.length > 0
              ? bufferConveter(userDetails?.User?.UserImage[0].Image)
              : 'logo.png'
          }
          className="w-40 h-40 object-cover border-4 border-white rounded-full"
          alt="profile"
        />
        <div className="flex items-center space-x-2 mt-2">
          <p className="text-2xl">{userDetails?.User.UserName}</p>
        </div>
        <p className="text-gray-700">
          {userDetails?.User.permanentPost}, {userDetails?.User.permanentVill}
        </p>
        {/* <p className="text-sm text-gray-500">New York, USA</p> */}
      </div>

      <div className="my-1 flex flex-col  space-y-4 2xl:space-y-0 2xl:space-x-4">
        {/* LEFT PANEL */}
        <div className="w-full flex flex-col mx-auto">
          {/* Personal Info */}
          <div className="flex-1 bg-white rounded-lg p-4 pt-2">
            <h4 className="text-xl text-gray-900 font-bold">শিক্ষাথীর তথ্য</h4>
            <ul className="mt-2 text-gray-700">
              <li className="flex border-b py-2">
                <span className="font-bold w-24">বাবার নাম:</span>
                <span className="text-gray-700">
                  {userDetails?.User.FatherName}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">বর্তমান ক্লাস:</span>
                <span className="text-gray-700">
                  {userDetails?.Class.ClassName}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">মোবাইল:</span>
                <span className="text-gray-700">
                  {userDetails?.User.Mobile1}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">ই-মেইল:</span>
                <span className="text-gray-700">{userDetails?.User.Email}</span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">জন্ম তারিখ:</span>
                <span className="text-gray-700">
                  {userDetails?.User.DateOfBirth}
                </span>
              </li>
              <li className="flex border-b py-2">
                <span className="font-bold w-24">স্টেটাস:</span>

                <span
                  className={`${
                    userDetails?.User?.UserAction === 1
                      ? 'font-bold text-green-600'
                      : 'text-gray-500'
                  }`}
                >
                  {userDetails?.User?.UserAction === 1 ? 'Active' : 'Inactive'}
                </span>
              </li>

              {/* <li className="flex border-b py-2">
                                <span className="font-bold w-24">Languages:</span>
                                <span className="text-gray-700">English, Spanish</span>
                            </li> */}
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col w-full 2xl:w-2/3">
          {/* <div className="flex-1 bg-white rounded-lg shadow-xl p-8">
                        <h4 className="text-xl text-gray-900 font-bold">About</h4>
                        <p className="mt-2 text-gray-700">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit...
                        </p>
                    </div> */}
        </div>
      </div>
    </div>
  );
}
