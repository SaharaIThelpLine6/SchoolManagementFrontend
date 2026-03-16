import { Buffer } from "buffer";
import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TranslateButton from "../../components/Header/TranslateButton";
import { useGetUserInfoQuery } from "../../features/payment/paymentSlice";
import { useGetInstitutionInfoQuery } from "../../features/settings/settingsQuerySlice";
import { toggleSidebar } from "../../features/sidebar/sideBarSlice";
import { useGetSoftwareDetailsQuery } from "../../features/userInfo/userInfoQuerySlice";
import bnBijoy2Unicode from "../../utils/conveter";
import { showModal } from "../../utils/ModalControlar";
import useTranslate from "../../utils/Translate";
import Button from "../Button/Button";
import SvgIcon from "../icons/SvgIcon";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import LogoAvater from "/saharait-preview.png";

const Header = () => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const isOpen = useSelector((state) => state.sideBar.isOpen);
  const { data: userPayInfo, refetch } = useGetUserInfoQuery();
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const { data: softwareDetails } = useGetSoftwareDetailsQuery();

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

  useEffect(() =>{
    console.log(softwareDetails);

  }, [softwareDetails])

  const handleOpenModal = useCallback(() => {
    showModal("Payment", "PAYMENT");
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30 font-SolaimanLipi">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 sm:py-3 md:px-6 2xl:px-11 sm:hidden">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="text-2xl text-gray-700"
        >
          {isOpen ? (
            <SvgIcon name={"Close"} size={20} />
          ) : (
            <SvgIcon name={"IoReorderThreeOutline"} size={20} />
          )}
        </button>

        <div className="ml-16 sm:ml-0">
          <img
            src={logo ? logo : LogoAvater}
            alt="Logo"
            className="w-20 h-20 object-cover rounded-full"
          />
        </div>

        <div className="flex flex-row gap-2">

            <button
              onClick={handleOpenModal}
              className="text-white bg-cyan-500 hover:bg-cyan-600 font-medium rounded-full text-xs px-4 py-1.5"
            >
              Pay now
            </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-xl text-gray-700"
          >
            {mobileMenuOpen ? (
              <SvgIcon name={"Close"} size={20} />
            ) : (
              <SvgIcon name={"BsThreeDotsVertical"} size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Mobile Menu */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3 sm:hidden origin-top animate-scaleFadeIn">
          <h2 className="text-center text-base font-semibold text-gray-800">
            {institutionInfo?.InstitutionName || ""}
          </h2>
          <form className="w-full relative max-w-[250px]">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
            </svg>

            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-[#EDEDED] h-9 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00aeef]"
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
          <div className="block sm:hidden">
            <TranslateButton />
          </div>
            <DropdownNotification />
            <DropdownUser />
          </div>
        </div>
      )}

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
              src={logo ? logo : LogoAvater}
              alt="Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 flex-1 min-w-0">
          <h2 className="text-sm sm:text-base md:text-3xl font-semibold text-gray-800 text-center sm:text-left truncate">
            {institutionInfo?.InstitutionName || ""}
          </h2>

          {/* <form className="w-full max-w-[180px] sm:max-w-[220px] md:max-w-[250px] relative">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base"
              height="18"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" />
            </svg>

            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-full bg-[#EDEDED] h-8 sm:h-9 pl-10 pr-4 py-2 text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-custom-focus transition-colors"
            />
          </form> */}
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

          {
            softwareDetails && <a className="btn btn-info bg-blue-500 py-[8px] px-[10px] md:px-[20px] rounded-full mb-0 text-[14px] text-white whitespace-nowrap d-inline flex gap-2" href={softwareDetails.UpSoftwareLink}><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-device-desktop-down"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13.5 16h-9.5a1 1 0 0 1 -1 -1v-10a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v7.5" /><path d="M7 20h5" /><path d="M9 16v4" /><path d="M19 16v6" /><path d="M22 19l-3 3l-3 -3" /></svg> Download</a>
          }


          <Button onClick={handleOpenModal} className="!rounded-full">
            {translate("Pay Now")}
          </Button>
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
