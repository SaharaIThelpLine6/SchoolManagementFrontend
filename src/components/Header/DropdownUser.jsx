
import { useState } from "react";
import { Link } from "react-router-dom";
import UserOne from "/avatar.png";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import ClickOutside from "../ClickOutside";
import { disconnectSocket } from "../../helper/socket";
import { FiLogOut, FiLock } from "react-icons/fi";
import { showModal } from "../../utils/ModalControlar";
import useTranslate from "../../utils/Translate";

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const t = useTranslate();

  const handleLogout = (dispatch) => {
    console.log("🚀 Logging out...");

    // 1. Redux logout
    dispatch({ type: "auth/logout" });

    // 2. Disconnect socket
    disconnectSocket();

    // 3. Remove Tawk.to storage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("twk_")) {
        localStorage.removeItem(key);
      }
    });

    // 4. Delay reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Change Password (Future Implementation)
  const handleChangePassword = () => {
    showModal('Password Change', 'PasswordChange');
  };



  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4 h-8 w-8 pt-5"
        to="#"
      >
        <div className="relative h-12 w-12 rounded-md overflow-hidden">
          <span className="absolute top-0 right-0 h-2 w-2 border border-white rounded-full bg-green-500"></span>
          <img
            src={UserOne}
            alt="User"
            className="h-8 w-8 object-cover rounded-full"
          />
        </div>
      </Link>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-2 flex w-72 flex-col rounded-lg border border-stroke bg-white shadow-[0_0_10px_rgba(0,0,0,0.1)] shadow-gray-300 z-30`}
        >
          <div className="absolute bg-white w-3 h-3 right-[14px] -translate-y-1/2 rotate-[45deg] shadow-[4px_-4px_10px_rgba(0,0,0,0.1)]"></div>

          {/* Profile Info */}
          <div className="flex items-center gap-4 p-4 border-b bg-white border-gray-200">
            <span className="h-12 w-12 rounded-md overflow-hidden border border-gray-300">
              <img
                src={UserOne}
                alt="User"
                className="h-full w-full object-cover"
              />
            </span>
            <div>
              {user?.username ? (
                <p className="text-sm font-medium text-gray-800">
                  {user.username}
                </p>
              ) : null}

              <div className="flex items-center gap-1 mt-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs text-gray-500">Online</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 p-4">

            {/* Change Password */}
            <button
              type="button"
              onClick={handleChangePassword}
              className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors text-left"
            >
              <FiLock className="text-lg" />
              {t("Password Change")}
            </button>

            {/* Logout */}
            <button
              type="button"
              className="flex items-center gap-3 w-full rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"
              onClick={() => handleLogout(dispatch)}
            >
              <FiLogOut className="text-lg" />
              {t("Log Out")}
            </button>

          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
