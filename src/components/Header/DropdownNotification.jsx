import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import { useViewNotificationMutation } from '../../features/userPanel/panelNotification/panelNotificationQuerySlice';

const DropdownNotification = ({ notificationList }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
const navigate = useNavigate()
  const [view_notification] = useViewNotificationMutation()
    const handleNotificationClick = async (notification) => {
    try {
      await view_notification({id: notification.ID}).unwrap();
      // navigate(notification.link);
    } catch (error) {
      console.error(error);

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
            className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full hover:text-primary"
          >
            <span
              className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${notifying === false ? 'hidden' : 'inline'
                }`}
            >
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
            </span>



            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#F7E5A3"
              stroke="#F7E5A3"
              strokeWidth="2"
              className="icon icon-tabler icon-tabler-bell"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
              <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
            </svg>


          </Link>

          {dropdownOpen && (
            <div
              className={`absolute -right-[2.75rem] sm:-right-27 z-30 mt-2.5 flex h-90  w-75  flex-col  rounded-[10px]  border  bg-slate-50 border-stroke  sm:right-0  sm:w-80`}
            >
              <div className="px-4.5 py-3 border-b">
                <h5 className="text-sm font-medium text-bodydark2">
                  Notification
                </h5>
              </div>


              <ul className="flex h-auto flex-col overflow-y-auto">
                {
                  notificationList && notificationList.map((notification)=>(
                     <li key={notification.ID} className={`${notification.isView == 0 ? 'bg-sky-200 hover:bg-sky-200' : ''}`}>
                      <button
                      type='button'
                        className="flex flex-col gap-2.5 border-b border-stroke px-4.5 py-3 w-full text-start"
                        onClick={()=>{handleNotificationClick(notification)}}
                      >
                        <p className="text-sm">
                          {notification.message}
                        </p>

                        <p className="text-xs">{new Date(notification.CreateAt).toLocaleString()}</p>
                      </button>
                    </li>
                  ))
                }

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
