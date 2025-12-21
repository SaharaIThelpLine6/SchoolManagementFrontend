import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { closeModal } from '../../features/modal/modalSlice';

const ProfileMenu = () => {
  const { schoolid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProfileClick = () => {
    dispatch(closeModal());
    setTimeout(() => {
      navigate(`/${schoolid}/dashboard/profile-details`);
    }, 300); // drawer animation time
  };

  const handleLogOut = () => {
    localStorage.removeItem('user_panel_token');
    window.location.href = `/${schoolid}/login`;
  };

  return (
    <div className="profile-menu">
      <nav>
        <ul>
          {/* Profile Details */}
          <li className="text-[18px] border-b border-[#d3d3d3]">
            <button
              onClick={handleProfileClick}
              className="py-2  text-[#007af7] flex gap-2 items-center w-full text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={30}
                height={30}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                <path d="M6 21v-2a4 4 0 0 1 4 -4h.5" />
                <path d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
              </svg>
              শিক্ষাথীর তথ্য
            </button>
          </li>

          {/* Logout */}
          <li className="text-[18px] border-b border-[#d3d3d3]">
            <button
              onClick={handleLogOut}
              className="py-2  text-[#007af7] flex gap-2 items-center w-full text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={30}
                height={30}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
                <path d="M15 12h-12l3 -3" />
                <path d="M6 15l-3 -3" />
              </svg>
              লগআউট
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProfileMenu;
