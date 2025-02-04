import { useState } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import UserOne from '../../images/user/checking.jpeg';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4 h-8 w-8 pt-5"
        to="#"
      >
        <div className="relative h-12 w-12 rounded-md overflow-hidden">
          {/* Online Green Dot */}
          <span className="absolute top-0 right-0 h-2 w-2 border border-white rounded-full bg-green-500"></span>
          {/* Profile Picture */}
          <img src={UserOne} alt="User" className="h-8 w-8 object-cover rounded-full" />
        </div>
      </Link>

      {/* Dropdown Start */}
      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-2 flex w-72 flex-col rounded-lg border border-stroke bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] shadow-gray-300 z-30`}
        >
          {/*box*/}
          <div className='absolute bg-white w-3 h-3 right-[14px] -translate-y-1/2 rotate-[45deg] shadow-[4px_-4px_10px_rgba(0,0,0,0.1)]'></div>

          {/* First Part: Profile Info */}
          <div className="flex items-center gap-4 p-4 border-b bg-white border-gray-200">
            <span className="h-12 w-12 rounded-md overflow-hidden border border-gray-300">
              <img src={UserOne} alt="User" className="h-full w-full object-cover" />
            </span>
            <div>
              {user?.username ?  <p className="text-sm font-medium text-gray-800">{user.username}</p> : null}
             
              {/* <p className="text-xs text-gray-500">johndoe@example.com</p> */}
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>

          </div>

          {/* Second Part: Options */}
          {/* <ul className="flex flex-col gap-4 p-4 border-b bg-white border-gray-200">
            <li>
              <Link
                to="#"
                className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-2"
              >
                Set Status
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-2"
              >
                Settings
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className="text-sm font-medium text-gray-500 hover:text-primary flex items-center gap-2"
              >
                Achievement
              </Link>
            </li>
          </ul> */}

          {/* Third Part: Actions */}
          <div className="flex flex-col p-4">
            {/* <button className="text-sm font-medium text-gray-500 hover:text-primary text-left">
              Share Your Opinion
            </button> */}
            <button className="text-sm font-medium text-gray-500 hover:text-primary mt-3 text-left" onClick={()=>{dispatch(logout())}}>
              Log Out
            </button>
          </div>
        </div>
      )}
      {/* Dropdown End */}
    </ClickOutside>
  );
};

export default DropdownUser;
