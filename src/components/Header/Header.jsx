import PropTypes from "prop-types";
import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { IoReorderThreeOutline } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { toggleSidebar } from "../../features/sidebar/sideBarSlice";
import { showModal } from "../../utils/ModalControlar";
import TranslateButton from "../../components/Header/TranslateButton";
import { useGetUserInfoQuery } from "../../features/payment/paymentSlice";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "/Screenshot_13.png";
import { useGetInstitutionInfoQuery } from "../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../utils/conveter";
import { Buffer } from "buffer";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";

const Header = () => {
  const dispatch = useDispatch();
  const { data: userPayInfo, refetch } = useGetUserInfoQuery();
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [logo, setLogo] = useState(null);
  useEffect(() => {
    if (institutionInfo?.Logo?.data) {
      const buffer = Buffer.from(institutionInfo.Logo.data);
      const base64String = buffer.toString("base64");
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [institutionInfo]);
  const handleOpenModal = useCallback(() => {
    showModal("Payment", "PAYMENT");
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30 font-SolaimanLipi">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 sm:py-3 md:px-6 2xl:px-11 sm:hidden">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-2xl text-gray-700"
        >
          <IoReorderThreeOutline />
        </button>

        <img
          src={logo}
          alt="Logo"
          className="w-20 h-20 object-cover rounded-full"
        />

        <div className="flex flex-row gap-2">
          <div className="block sm:hidden">
            <TranslateButton />
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xl text-gray-700"
          >
            <BsThreeDotsVertical />
          </button>
        </div>
      </div>

      {/* Expanded Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="px-4 pb-4 flex flex-col gap-3 sm:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileMenuVariants}
          >
            <h2 className="text-center text-base font-semibold text-gray-800">
              {bnBijoy2Unicode(institutionInfo?.InstitutionName) || ""}
            </h2>
            <form className="w-full relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-full bg-[#EDEDED] h-9 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 justify-center">
              {userPayInfo && (
                <p
                  className={`text-white py-1 px-2 rounded-full text-xs font-semibold ${
                    userPayInfo.RenewDays > 60
                      ? "bg-green-500"
                      : userPayInfo.RenewDays > 30
                      ? "bg-yellow-500"
                      : "bg-rose-500"
                  }`}
                >
                  Days: {userPayInfo.RenewDays}
                </p>
              )}
              {userPayInfo && (
                <p
                  className={`text-white py-1 px-2 rounded-full text-xs font-semibold ${
                    userPayInfo.BalanceDr - userPayInfo.BalanceCr > 20
                      ? "bg-green-500"
                      : userPayInfo.BalanceDr - userPayInfo.BalanceCr > 10
                      ? "bg-yellow-500"
                      : "bg-rose-500"
                  }`}
                >
                  Quota: {userPayInfo.BalanceDr - userPayInfo.BalanceCr}
                </p>
              )}
              <button
                onClick={handleOpenModal}
                className="text-white bg-cyan-500 hover:bg-cyan-600 font-medium rounded-full text-xs px-4 py-1.5"
              >
                Pay now
              </button>
              <DropdownNotification />
              <DropdownUser />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between px-6 py-3 gap-3 2xl:px-11 print:hidden">
        <div className="flex justify-center items-center w-full max-w-[200px] sm:max-w-[220px] md:max-w-[200px] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="opacity-70 lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
            <img
              src={logo}
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 flex-1 min-w-0">
          <h2 className="text-sm sm:text-base md:text-3xl font-semibold text-gray-800 text-center sm:text-left truncate">
            {bnBijoy2Unicode(institutionInfo?.InstitutionName) || ""}
          </h2>

          <form className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[250px] relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-[#EDEDED] h-8 sm:h-9 pl-10 pr-4 py-2 text-sm sm:text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-custom-focus transition-colors"
            />
          </form>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {userPayInfo && (
            <p
              className={`text-white py-[8px] px-[10px] md:px-[20px] rounded-full mb-0 text-nowrap text-[14px] font-semibold  ${
                userPayInfo.RenewDays > 60
                  ? "bg-green-500"
                  : userPayInfo.RenewDays > 30
                  ? "bg-yellow-500"
                  : "bg-rose-500"
              }`}
            >
              Days: {userPayInfo.RenewDays}
            </p>
          )}
          {userPayInfo && (
            <p
              className={`text-white py-[8px] px-[10px] md:px-[20px] rounded-full mb-0 text-nowrap text-[14px] font-semibold  ${
                userPayInfo.BalanceDr - userPayInfo.BalanceCr > 20
                  ? "bg-green-500"
                  : userPayInfo.BalanceDr - userPayInfo.BalanceCr > 10
                  ? "bg-yellow-500"
                  : "bg-rose-500"
              }`}
            >
              Quota: {userPayInfo.BalanceDr - userPayInfo.BalanceCr}
            </p>
          )}
          <button
            onClick={handleOpenModal}
            className="text-white bg-cyan-500 hover:bg-cyan-600 font-medium rounded-full text-sm px-4 py-2"
          >
            Pay now
          </button>
          <TranslateButton />
          <DropdownNotification />
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  sidebarOpen: PropTypes.bool,
  setSidebarOpen: PropTypes.func,
};

export default Header;
