import { useEffect, useRef, useState } from 'react';
import { Link, Links, NavLink, useNavigate } from 'react-router-dom';
import { useViewNotificationMutation } from '../../features/userPanel/panelNotification/panelNotificationQuerySlice';
import ClickOutside from '../ClickOutside';

const DropdownNotification = ({ notificationList }) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const navigate = useNavigate();
  const [view_notification] = useViewNotificationMutation();
  const handleNotificationClick = async (notification) => {
    try {
      await view_notification({ id: notification.ID }).unwrap();

      if (notification.link) {
        navigate(notification.link);
        setDropdownOpen(false); // 🔥 dropdown বন্ধ হবে
      }
    } catch (error) {
      console.error(error);
      setDropdownOpen(false); // 🔥 dropdown বন্ধ হবে

      // Optional: still navigate even if request fails

      // navigate(notification.link);
    }
  };




  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <ul className="list-none m-0 p-0">
        <li className="list-none">
          <Link
            onClick={() => {
              setNotifying(false);
              setDropdownOpen(!dropdownOpen);
            }}
            to="#"
            className="
    relative
    flex
    h-10
    w-10
    items-center
    justify-center
    rounded-full
    bg-white
    shadow-md
    transition-all
    duration-200
    hover:shadow-lg
    hover:scale-105
    active:scale-95
  "
          >
            {/* Notification Dot */}
            {notifying && (
              <span className="absolute top-1 right-1 z-10 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600"></span>
              </span>
            )}

            {/* Bell Icon */}
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1.5em"
              width="1.5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="none" d="M0 0h24v24H0V0z"></path>
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6zM7.58 4.08 6.15 2.65C3.75 4.48 2.17 7.3 2.03 10.5h2a8.445 8.445 0 0 1 3.55-6.42zm12.39 6.42h2c-.15-3.2-1.73-6.02-4.12-7.85l-1.42 1.43a8.495 8.495 0 0 1 3.54 6.42z"></path>
            </svg>
          </Link>

          {dropdownOpen && (
            <div
              className={`absolute -right-[2.75rem] mt-2.5 flex h-90  w-75  flex-col  rounded-[10px]  border  bg-slate-50 border-stroke  sm:right-0  sm:w-80 z-9999`}
            >
              <div className="px-4.5 py-3 border-b">
                <h5 className="text-sm font-medium text-bodydark2">
                  Notification
                </h5>
              </div>

              <ul className="flex h-auto flex-col overflow-y-auto">
                {notificationList &&
                  notificationList.map((notification) => (
                    <li
                      key={notification.ID}
                      className={`${notification.isView == 0
                        ? 'bg-sky-200 hover:bg-sky-200'
                        : ''
                        }`}
                    >
                      <button
                        type="button"
                        className="flex flex-col gap-2.5 border-b border-stroke px-4.5 py-3 w-full text-start"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <p className="text-sm break-words">
                          {notification.message}
                        </p>

                        <p className="text-xs text-gray-500">
                          {new Date(notification.CreateAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}

                {/* <li>
                  <Link
                    className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    to="#"
                  >
                    <p className="text-sm">
                      <span className="text-black dark:text-white">
                        It is a long established fact
                      </span>{' '}
                      that a reader will be distracted by the readable.
                    </p>

                    <p className="text-xs">24 Feb, 2025</p>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    to="#"
                  >
                    <p className="text-sm">
                      <span className="text-black dark:text-white">
                        There are many variations
                      </span>{' '}
                      of passages of Lorem Ipsum available, but the majority have
                      suffered
                    </p>

                    <p className="text-xs">04 Jan, 2025</p>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    to="#"
                  >
                    <p className="text-sm">
                      <span className="text-black dark:text-white">
                        There are many variations
                      </span>{' '}
                      of passages of Lorem Ipsum available, but the majority have
                      suffered
                    </p>

                    <p className="text-xs">01 Dec, 2024</p>
                  </Link>
                </li> */}
              </ul>
            </div>
          )}
        </li>
      </ul>
    </ClickOutside>
  );
};

export default DropdownNotification;
