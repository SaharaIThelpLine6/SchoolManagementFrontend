import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const Navbar = ({ schoolData, bufferConveter }) => {
  const { schoolid } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-md sticky top-0 z-[99]">
        <Link to={`/${schoolid}`}>
          <img
            src={bufferConveter(schoolData?.Logo?.data)}
            alt={schoolData?.InstitutionName}
            className="w-[50px] h-[50px]"
          />
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-theme-color">
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Nav */}
      <header className={`font-SolaimanLipi shadow-md text-theme-color bg-white hidden_in_print z-[99]
        lg:flex
        ${isOpen ? "flex fixed top-0 left-0 w-[320px] h-screen flex-col z-[999] overflow-y-auto" : "hidden"}
        md:static md:h-auto md:w-full md:flex md:flex-row`}
      >
        {/* Close overlay on mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-[-1] md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="container mx-auto">
          <nav className="w-full">
            <div className="relative md:flex justify-between py-[10px] px-[10px] lg:py-[18px] lg:px-[20px]">

              {/* Logo */}
              <div className="hidden md:flex gap-4 items-center border-b border-[#d5d5d5] md:border-0 pb-[10px] md:pb-0">
                <Link to={`/${schoolid}`}>
                  <img
                    src={bufferConveter(schoolData?.Logo?.data)}
                    alt={schoolData?.InstitutionName}
                    className="w-[80px] h-[80px] mx-auto md:mx-[1px]"
                  />
                </Link>
                <h1 className="text-theme-color font-[500] text-[24px] md:text-[26px] w-[290px]">
                  {schoolData?.InstitutionName}
                </h1>
              </div>

              {/* Menu */}
              <div className="block md:inline-block">
                <ul className="pt-[10px] h-full flex flex-col lg:flex-row lg:items-center gap-[30px] text-[16px] font-[400] text-theme-color w-full md:w-auto">

                  <li>
                    <a href={`/${schoolid}`} className="cursor-pointer font-bold text-[18px]">
                      হোম
                    </a>
                  </li>

                  <li>
                    <a href={`/${schoolid}/online_admission`} className="cursor-pointer font-bold text-[18px] flex items-center gap-1">
                      অনলাইনে ভর্তি
                    </a>
                  </li>

                  {/* Dropdown: ফলাফল */}
                  <li className="relative">
                    <button
                      onClick={() => setResultOpen(!resultOpen)}
                      className="cursor-pointer font-bold text-[18px] flex items-center gap-1 text-theme-color"
                    >
                      ফলাফল
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16} height={16}
                        fill="none" stroke="currentColor" strokeWidth={2}
                        viewBox="0 0 24 24"
                        className={`transition-transform duration-200 ${resultOpen ? "rotate-180" : ""}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {resultOpen && (
                      <ul className="
                        mt-2 bg-white border border-[#d5d5d5] rounded-md shadow-md z-[100]
                        lg:absolute lg:top-full lg:left-0 lg:w-[220px]
                        relative w-full pl-4 lg:pl-0
                      ">
                        <li>
                          <a href={`/${schoolid}/student_result`}
                            className="block px-4 py-2 font-bold text-[16px] hover:bg-gray-100">
                            ব্যক্তিগত ফলাফল
                          </a>
                        </li>
                        {schoolData?.isClassResultShowable?.Action != 0 && (
                          <li>
                            <a href={`/${schoolid}/classes`}
                              className="block px-4 py-2 font-bold text-[16px] hover:bg-gray-100">
                              ক্লাশ/মারহালা ভিত্তিক ফলাফল
                            </a>
                          </li>
                        )}
                        <li>
                          <a href={`/${schoolid}/maritlist_request`}
                            className="block px-4 py-2 font-bold text-[16px] hover:bg-gray-100">
                            মেধা তালিকা
                          </a>
                        </li>
                        <li>
                          <a href="https://hems.alhaiatululya.org/exam-result" target="_blank"
                            className="block px-4 py-2 font-bold text-[16px] hover:bg-gray-100">
                            আল-হাইআ ফলাফল
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li>
                    <a href={`/${schoolid}/login`} className="cursor-pointer font-bold text-[18px] bg-theme-color text-white py-[10px] px-[20px] rounded-[4px] flex items-center gap-1">
                      গার্ডিয়ান পোর্টাল
                    </a>
                  </li>

                </ul>
              </div>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Navbar;