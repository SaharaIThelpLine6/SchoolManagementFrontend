import PropTypes from 'prop-types'; // Import PropTypes
import { FaSearch } from "react-icons/fa"; // Import Search Icon
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import ThreeDotDropdown from './Threedots';

const Header = () => {
  return (
    <header className="top-0 w-full bg-white">
      <div className="flex w-full gap-20 items-center px-4 py-4 md:px-6 2xl:px-11">
       

        {/* Center Section: Search Bar */}
        <div className="flex-grow px-4">
          <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full bg-[#EDEDED] h-8 pl-10 pr-4 py-2 placeholder:text-sm leading-10 text-black focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Right Section: Notifications and User Dropdown */}
        <div className="flex items-center gap-5 2xsm:gap-7">
          <ul className="">
            <DropdownNotification />
          </ul>
          <DropdownUser />
          <ThreeDotDropdown />
        </div>
      </div>
    </header>
  );
};

// PropTypes Validation
Header.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
};

export default Header;
