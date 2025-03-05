import PropTypes from 'prop-types'; // Import PropTypes
import { FaSearch } from "react-icons/fa"; // Import Search Icon
import DropdownNotification from './DropdownNotification';
import DropdownUser from './DropdownUser';
import ThreeDotDropdown from './Threedots';
import TranslateButton from './TranslateButton';
import { useDispatch } from 'react-redux';
import { openSidebar } from '../../features/sidebar/sideBarSlice';
import { showModal } from '../../utils/ModalControlar';
import { useCallback } from 'react';

const Header = () => {
  const dispatch = useDispatch()
   const handleOpenModal = useCallback((id) => {
        showModal("Payment", "PAYMENT");
    }, []);
  return (
    <header className="w-full bg-white">
     
      <div className="flex w-full gap-2  md:gap-20 items-center px-2 py-4 md:px-6 2xl:px-11">

      <button onClick={()=>{dispatch(openSidebar())}} className='opacity-60 lg:hidden'>
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-menu-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
      </button>

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
          <button type='button' onClick={handleOpenModal} className='text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-max'>Pay now</button>
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
