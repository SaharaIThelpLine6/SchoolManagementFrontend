import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { fetchResultFieldData } from "../features/studentResultPublicView/studentResultPublicViewSlice";
import bnBijoy2Unicode from "../utils/conveter";

import { Buffer } from "buffer";
import DeveloperCredit from "../components/DeveloperCredit";

const PublicLayout = () => {
  const { schoolData } = useSelector((state) => state.studentResultPublicView);

  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const { schoolid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bufferConveter = (bufferData) => {
    if (!bufferData) {
      return "/logo.png";
    }
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString("base64");
    const imageSrc = `data:image/png;base64,${base64String}`;
    return imageSrc;
  };

  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, navigate]);

  // Prevent body scrolling when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div className="min-h-screen font-SolaimanLipi">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden_in_print"
            onClick={toggleSidebar}
          ></div>
        )}
        {isOpen && (
          <button
            className="fixed top-3 right-4 z-9999 text-white p-1 rounded-sm hidden_in_print"
            onClick={toggleSidebar}
          >
            ✖
          </button>
        )}

        {/* For mobile display start */}
        <div className="fixed flex items-center justify-between z-30 lg:hidden px-4 w-full h-[70px] text-left py-[6px] bg-white hidden_in_print shadow-sm">
          <button
            className="lg:hidden left-4 z-50 bg-transparent text-theme-color p-2 rounded-md hidden_in_print"
            onClick={toggleSidebar}
          >
            {isOpen ? "✖" : "☰"}
          </button>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-[20px] text-black font-bold pl-2">{schoolData?.InstitutionName}</h1>
            <img
              src={bufferConveter(schoolData?.Logo?.data)}
              alt={schoolData?.InstitutionName}
              className="w-[60px] h-[60px] object-cover"
            />
          </div>
        </div>
        {/* For mobile display end */}

        <header
          // bg-theme-color
          className={`lg:flex overflow-hidden font-SolaimanLipi shadow-md text-theme-color sticky top-0 left-0 bg-white h-screen md:h-auto max-w-[320px] md:max-w-full w-full hidden_in_print z-[99] ${isOpen ? "flex fixed z-[99]" : "hidden"
            }`}
        >
          <div className="container mx-auto">
            <nav className="w-full">
              <div className="relative md:flex justify-between py-[10px] px-[10px] lg:py-[18px] lg:px-[20px]">
                <div className=" hidden md:flex gap-4 items-center text-center border-b border-[#d5d5d5] md:border-0 pb-[10px] md:pb-0">
                  <div className="place-items-center">
                    <Link to={`/${schoolid}`}>
                      <img
                        src={bufferConveter(schoolData?.Logo?.data)}
                        alt={schoolData?.InstitutionName}
                        className="w-[80px] h-[80px] mx-auto md:mx-[1px]"
                      />
                    </Link>
                  </div>
                  <div>
                    <h1 className="text-theme-color font-[500] text-[24px] md:text-[26px]">
                      {schoolData?.InstitutionName}
                    </h1>
                  </div>
                </div>


                <div className="block md:inline-block">
                  <ul className="pt-[10px] h-full flex flex-col lg:flex-row lg:items-center gap-[30px] text-[16px] font-[400] border-0 text-theme-color overflow-y-auto w-full md:w-auto">
                    <li>
                      <a
                        href={`/${schoolid}`}
                        className="cursor-pointer  border-0 md:flex md:items-center gap-[4px] font-bold text-[18px]"
                      >
                        হোম
                      </a>
                    </li>
                    <li>
                      <a
                        href={`/${schoolid}/student_result`}
                        className="cursor-pointer  border-0 md:flex md:items-center gap-[4px] font-bold text-[18px]"
                      >
                        ব্যক্তিগত ফলাফল
                      </a>
                    </li>
                    {
                      schoolData?.isClassResultShowable && schoolData?.isClassResultShowable.Action != 0 ? (
                        <li>
                          <a href={`/${schoolid}/classes`} className='cursor-pointer  border-0 flex items-center gap-[4px] font-bold text-[18px]'>
                            ক্লাশ/মারহালা ভিত্তিক ফলাফল
                          </a>
                        </li>
                      ) : null
                    }

                    <li>
                      <a href={`/${schoolid}/maritlist_request`}
                        className="cursor-pointer border-0 flex items-center gap-[4px] font-bold text-[18px]"
                      >
                        মেধা তালিকা
                      </a>
                    </li>
                    <li>
                      <a
                        href={`/${schoolid}/online_admission`}
                        className="cursor-pointer border-0 flex items-center gap-[4px] font-bold text-[18px]"
                      >
                        অনলাইনে ভর্তি
                      </a>
                    </li>
                    <li>
                      <a
                        href={`https://wifaqresult.com`}
                        target="_blank"
                        className="cursor-pointer border-0 flex items-center gap-[4px] font-bold text-[18px]"
                      >
                        বেফাক ফলাফল
                      </a>
                    </li>

                    <li>
                      <a
                        href="https://hems.alhaiatululya.org/exam-result"
                        target="_blank"
                        className="cursor-pointer border-0 flex items-center gap-[4px] font-bold text-[18px]"
                      >
                        আল-হাইআ ফলাফল
                      </a>
                    </li>

                  </ul>
                </div>


              </div>

            </nav>
          </div>
        </header>

        <main className="mx-auto w-full overflow-hidden h-full pt-[50px] lg:pt-0">
          <div className="w-full animate-scaleIn">
            <Outlet />
          </div>
        </main>
        <footer className='bg-white hidden_in_print pt-8 pb-[100px] px-2'>
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="logo">
                <Link to={`/${schoolid}`}>
                  <img
                    src={bufferConveter(schoolData?.Logo?.data)}
                    alt={schoolData?.InstitutionName}
                    className="w-[80px] h-[80px] mx-auto md:mx-[1px]"
                  />
                </Link>
                <h2 className="font-bold text-[26px] mt-4">{schoolData?.InstitutionName}</h2>
                <p className="text-[16px] text-[##484444]">{schoolData?.Address}, {schoolData?.ContactNumber}</p>
              </div>
              <div className="useful-links">
                <h3 className="text-[20px] font-bold mb-6">Useful Links</h3>
                <ul>
                  <li>
                    <a
                      href={`/${schoolid}/student_result`}
                      className="cursor-pointer  border-0 md:flex md:items-center gap-[4px] text-[14px] mb-2"
                    >
                      ব্যক্তিগত ফলাফল
                    </a>
                  </li>
                  {
                    schoolData?.isClassResultShowable && schoolData?.isClassResultShowable.Action != 0 ? (
                      <li>
                        <a href={`/${schoolid}/classes`} className='cursor-pointer  border-0 flex items-center gap-[4px] text-[14px] mb-2'>
                          ক্লাশ/মারহালা ভিত্তিক ফলাফল
                        </a>
                      </li>
                    ) : null
                  }

                  <li>
                    <a href={`/${schoolid}/maritlist_request`}
                      className="cursor-pointer border-0 flex items-center gap-[4px] text-[14px] mb-2"
                    >
                      মেধা তালিকা
                    </a>
                  </li>
                  <li>
                    <a
                      href={`/${schoolid}/online_admission`}
                      className="cursor-pointer border-0 flex items-center gap-[4px] text-[14px] mb-2"
                    >
                      অনলাইনে ভর্তি
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://wifaqresult.com`}
                      target="_blank"
                      className="cursor-pointer border-0 flex items-center gap-[4px] text-[14px] mb-2"
                    >
                      বেফাক ফলাফল
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://hems.alhaiatululya.org/exam-result"
                      target="_blank"
                      className="cursor-pointer border-0 flex items-center gap-[4px] text-[14px] mb-2"
                    >
                      আল-হাইআ ফলাফল
                    </a>
                  </li>
                </ul>
              </div>

              <div className="contact">
                <h3 className="text-[20px] font-bold mb-6">Contact</h3>
                <p className="mb-2 border-b border-[#ddd] inline-block pb-2">
                  <span className="font-bold">{schoolData?.PrincipalName}</span>  <br />
                  মোবাইল নং. {schoolData?.ContactNumber}
                </p>
                <p>
                  <span className="font-bold"> {schoolData?.NajemName} </span> <br />
                  মোবাইল নং. {schoolData?.SMSMobile}
                </p>
              </div>

            </div>
          </div>

        </footer>
      </div>
      <DeveloperCredit />
    </>
  );
};

export default PublicLayout;
