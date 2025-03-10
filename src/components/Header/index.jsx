import PropTypes from 'prop-types'; // Import PropTypes
import { FaSearch } from "react-icons/fa"; // Import Search Icon
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import ThreeDotDropdown from './Threedots';
import TranslateButton from './TranslateButton';

const Header = () => {
  return (
    <header className="top-0 w-full bg-white">
      <div className="flex w-full gap-2  md:gap-20 items-center px-2 py-4 md:px-6 2xl:px-11">


        {/* Center Section: Search Bar */}
        <div className="flex-grow pl-11 w-full md:px-0">
          {/* <form action="https://formbold.com/s/unique_form_id" method="POST">
            <div className="relative w-full">
              <FaSearch className="absolute right-3 md:left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full invisible md:visible rounded-full bg-[#EDEDED] h-8 pl-10 pr-4 py-2 placeholder:text-sm leading-10 text-black focus:outline-none"
              />
            </div>
          </form> */}
        </div>

        {/* Right Section: Notifications and User Dropdown */}
        <div className="flex items-center gap-3 md:gap-7">
          {/* <button className='transtion text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 text-nowrap	'>1000 Balance</button> */}
          <TranslateButton />
          <ul className="">
            <DropdownNotification />
          </ul>
          <DropdownUser />
          {/* <ThreeDotDropdown /> */}
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
