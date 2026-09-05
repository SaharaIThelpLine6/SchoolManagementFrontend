import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import { fetchResultFieldData } from "../features/studentResultPublicView/studentResultPublicViewSlice";
import bnBijoy2Unicode from "../utils/conveter";
import { Buffer } from "buffer";
import DashboardCredit from "../components/DashboardCredit";

const PublicLayout = () => {
  const { schoolData, websiteSettings } = useSelector(
    (state) => state.studentResultPublicView
  );
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { schoolid } = useParams();
  const dispatch = useDispatch();

  const settingsObject = React.useMemo(() => {
    if (!websiteSettings || websiteSettings.length === 0) return {};
    return websiteSettings.reduce((acc, item) => {
      acc[item.FieldKey] = item.FieldValue;
      return acc;
    }, {});
  }, [websiteSettings]);

  const bufferConveter = (bufferData) => {
    if (!bufferData) return "/logo.png";
    const buffer = Buffer.from(bufferData);
    const base64String = buffer.toString("base64");
    return `data:image/png;base64,${base64String}`;
  };

  useEffect(() => {
    dispatch(fetchResultFieldData(schoolid));
  }, [dispatch, schoolid]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

useEffect(() => {
  const handleLinkClick = (event) => {
    const anchor = event.target.closest("a, button");
    if (!anchor) return;

    if (window.self !== window.top) {
      window.parent.postMessage({
        type: "LINK_CLICK",
        href: anchor.getAttribute("href") || null,
        text: anchor.innerText?.trim().slice(0, 60) || null,
        timestamp: Date.now(),
      }, "*");
    }
  };

  document.addEventListener("click", handleLinkClick);
  return () => document.removeEventListener("click", handleLinkClick);
}, []);

  return (
    <div className="min-h-screen font-SolaimanLipi bg-stone-50 text-gray-800">
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* ========== SIDEBAR / NAVIGATION ========== */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out hidden_in_print lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link to={`/${schoolid}`} onClick={toggleSidebar}>
            <img
              src={bufferConveter(schoolData?.Logo?.data)}
              alt={schoolData?.InstitutionName}
              className="w-14 h-14 object-cover rounded-xl"
            />
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-6 space-y-1 overflow-y-auto h-[calc(100%-80px)] hidden_in_print">
          {[
            { href: `/${schoolid}`, label: "হোম" },
            { href: `/${schoolid}/student_result`, label: "ব্যক্তিগত ফলাফল" },
            schoolData?.isClassResultShowable?.Action != 0 && {
              href: `/${schoolid}/classes`,
              label: "ক্লাশ/মারহালা ভিত্তিক ফলাফল",
            },
            { href: `/${schoolid}/maritlist_request`, label: "মেধা তালিকা" },
            { href: `/${schoolid}/online_admission`, label: "অনলাইনে ভর্তি" },
            { href: "https://wifaqresult.com", label: "বেফাক ফলাফল", external: true },
            { href: "https://hems.alhaiatululya.org/exam-result", label: "আল-হাইআ ফলাফল", external: true },
            { href: `/${schoolid}/support_video`, label: "ভিডিও" },
            { href: `/${schoolid}/donation`, label: "অনুদান" },
          ]
            .filter(Boolean)
            .map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 text-[18px] font-bold transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={toggleSidebar}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-700 text-[18px] font-bold transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          <Link
            to={`/${schoolid}/login`}
            onClick={toggleSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white text-[18px] font-bold mt-4 hover:bg-green-700 transition-colors"
          >
            গার্জিয়ান পোর্টাল
          </Link>
        </nav>
      </aside>

      {/* ========== DESKTOP HEADER ========== */}
      <header className="hidden lg:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm hidden_in_print">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* Logo & Name */}
            <Link to={`/${schoolid}`} className="flex items-center gap-4">
              <img
                src={bufferConveter(schoolData?.Logo?.data)}
                alt={schoolData?.InstitutionName}
                className="w-12 h-12 object-cover rounded-xl"
              />
              <h1 className="text-[24px] md:text-[26px] font-[500] text-theme-color text-gray-800">
                {schoolData?.InstitutionName}
              </h1>
            </Link>
            
            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <Link to={`/${schoolid}`} className="text-gray-600 hover:text-green-700 transition text-[18px] font-bold">
                হোম
              </Link>
              <Link to={`/${schoolid}/online_admission`} className="text-gray-600 hover:text-green-700 transition text-[18px] font-bold">
                অনলাইনে ভর্তি
              </Link>

              {/* --- ড্রপডাউন শুরু --- */}
              <div className="relative group py-4 -my-4">
                <button className="flex items-center gap-1 text-gray-600 group-hover:text-green-700 transition text-[18px] font-bold outline-none">
                  ফলাফল
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute top-full left-0 w-72 bg-white border border-gray-100 shadow-xl rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                  <div className="py-2">
                    <Link to={`/${schoolid}/student_result`} className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                      ব্যক্তিগত ফলাফল
                    </Link>
                    
                    {schoolData?.isClassResultShowable?.Action != 0 && (
                      <Link to={`/${schoolid}/classes`} className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                        ক্লাশ/মারহালা ভিত্তিক ফলাফল
                      </Link>
                    )}
                    
                    <Link to={`/${schoolid}/maritlist_request`} className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                      মেধা তালিকা
                    </Link>
                    
                    <a href="https://wifaqresult.com" target="_blank" rel="noreferrer" className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                      বেফাক ফলাফল
                    </a>
                    
                    <a href="https://hems.alhaiatululya.org/exam-result" target="_blank" rel="noreferrer" className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                      আল-হাইআ ফলাফল
                    </a>
                    
                    <a href="https://tanzimboard.com/" target="_blank" rel="noreferrer" className="block px-5 py-2.5 text-[16px] text-gray-600 hover:bg-green-50 hover:text-green-700 transition font-bold">
                      তানযীমুল মাদারিসিদ্দ দ্বীনিয়া
                    </a>
                  </div>
                </div>
              </div>
              {/* --- ড্রপডাউন শেষ --- */}

              <Link to={`/${schoolid}/support_video`} className="text-gray-600 hover:text-green-700 transition text-[18px] font-bold">
                ভিডিও
              </Link>

              <Link to={`/${schoolid}/donation`} className="text-gray-600 hover:text-green-700 transition text-[18px] font-bold">
                অনুদান
              </Link>

              <Link
                to={`/${schoolid}/login`}
                className="bg-green-600 text-white px-5 py-2.5 rounded-full hover:bg-green-700 transition shadow-md text-[18px] font-bold"
              >
                গার্জিয়ান পোর্টাল
              </Link>
            </nav>
            
          </div>
        </div>
      </header>

      {/* ========== MOBILE TOP BAR ========== */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm hidden_in_print">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-green-700 p-2 rounded-lg"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-black truncate max-w-[200px]">
              {schoolData?.InstitutionName}
            </h1>
            <img
              src={bufferConveter(schoolData?.Logo?.data)}
              alt={schoolData?.InstitutionName}
              className="w-10 h-10 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <main className="print:pt-0 pt-20 lg:pt-0 min-h-screen">
        <div className="w-full animate-scaleIn">
          <Outlet />
        </div>
      </main>

      {/* ========== FOOTER (Unique Redesign) ========== */}
      <footer className="relative bg-gradient-to-br from-[#0a1f13] via-[#0f2d1b] to-[#081a10] text-gray-200 pt-20 pb-10 overflow-hidden hidden_in_print">
        {/* Decorative background blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-1">
              <Link to={`/${schoolid}`} className="inline-flex items-center gap-4 mb-6 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-green-400 rounded-xl blur opacity-50 group-hover:opacity-80 transition duration-500"></div>
                  <img
                    src={bufferConveter(schoolData?.Logo?.data)}
                    alt={schoolData?.InstitutionName}
                    className="relative w-16 h-16 object-cover rounded-xl border-2 border-white/20"
                  />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                  {schoolData?.InstitutionName}
                </h2>
              </Link>
              <p className="text-gray-300 text-[22px] leading-relaxed mt-4 border-l-4 border-amber-500 pl-4 italic">
                {schoolData?.Address}
              </p>
              <p className="text-gray-400 mt-3 text-[22px] tracking-wider uppercase opacity-60">
                📞 {schoolData?.ContactNumber}
              </p>
            </div>

            {/* Useful Links */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
                Useful Links
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to={`/${schoolid}/student_result`}
                    className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                  >
                    ব্যক্তিগত ফলাফল
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                {schoolData?.isClassResultShowable?.Action != 0 && (
                  <li>
                    <Link
                      to={`/${schoolid}/classes`}
                      className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                    >
                      ক্লাশ/মারহালা ভিত্তিক ফলাফল
                      <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to={`/${schoolid}/maritlist_request`}
                    className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                  >
                    মেধা তালিকা
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/${schoolid}/online_admission`}
                    className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                  >
                    অনলাইনে ভর্তি
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wifaqresult.com"
                    target="_blank"
                    className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                  >
                    বেফাক ফলাফল
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://hems.alhaiatululya.org/exam-result"
                    target="_blank"
                    className="text-gray-300 text-[22px] hover:text-amber-300 transition duration-300 relative inline-block group"
                  >
                    আল-হাইআ ফলাফল
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-1 bg-amber-400 rounded-full"></span>
                Contact
              </h3>
              <div>
                <div className="mb-5">
                  <p className="text-white font-semibold text-[22px] mb-1">{schoolData?.PrincipalName}</p>
                  <p className="text-gray-400 text-[22px]">
                    মোবাইল নং. {schoolData?.ContactNumber}
                  </p>
                </div>
                <div className="mb-6 pt-4 border-t border-white/10">
                  <p className="text-white font-semibold text-[22px] mb-1">{schoolData?.NajemName}</p>
                  <p className="text-gray-400 text-[22px]">
                    মোবাইল নং. {schoolData?.SMSMobile}
                  </p>
                </div>
                <div className="flex gap-3 mt-4">
                  {settingsObject.fblink && (
                    <a
                      href={settingsObject.fblink}
                      target="_blank"
                      className="p-2.5 bg-white/10 rounded-full hover:bg-[#1877F2] transition-all duration-300 group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white group-hover:scale-110 transition-transform"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
                      </svg>
                    </a>
                  )}
                  {settingsObject.ylink && (
                    <a
                      href={settingsObject.ylink}
                      target="_blank"
                      className="p-2.5 bg-white/10 rounded-full hover:bg-[#FF0000] transition-all duration-300 group"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={22}
                        height={22}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white group-hover:scale-110 transition-transform"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                        <path d="M10 9l5 3l-5 3z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <DashboardCredit />
    </div>
  );
};

export default PublicLayout;
