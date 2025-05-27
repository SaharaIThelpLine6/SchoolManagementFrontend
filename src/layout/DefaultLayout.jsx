import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import DefaultModal from "../components/DefaultModal";
import { verifyUser } from "../features/auth/authSlice";
import { setCurrentLanguage } from "../features/language/languageSlice";
import { closeSidebar } from "../features/sidebar/sideBarSlice";
import SideBar from "../components/Sidebar/SideBar";
import Header from "../components/Header/Header";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.sideBar?.isOpen ?? false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const pageName = useSelector((state) => state.auth.pageName);
  const { currectLanguage } = useSelector((state) => state.language);
  const { isOpen } = useSelector((state) => state.modal);

  useEffect(() => {
    // console.log('Authentication state:', isAuthenticated);

    if (isAuthenticated) {
      dispatch(verifyUser(token)); // Dispatch the thunk
    } else {
      navigate("/login"); // Redirect if not authenticated
    }
    const lang = localStorage.getItem("lang");
    // console.log(lang);

    if (lang !== currectLanguage && lang) {
      dispatch(setCurrentLanguage(lang));
    }
  }, [isAuthenticated, dispatch, navigate, token]);
  return (
    <div className="h-screen flex flex-col bg-gray-100 font-SolaimanLipi overflow-hidden print:h-auto print:bg-white print:overflow-visible">
      {/* Header */}
      <div className="z-40 print:hidden">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
        {/* Sidebar */}
        <div
          className={`fixed top-20 sm:top-16 left-0 z-30 w-[250px] h-[calc(100vh-64px)] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ease-in-out print:hidden
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:top-0 lg:h-full lg:static lg:translate-x-0 lg:transform-none`}
        >
          <SideBar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-20 lg:hidden"
            onClick={() => dispatch(closeSidebar())}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 ml-0 h-full overflow-y-auto print:ml-0 print:h-auto print:overflow-y-visible">
          <div className="p-4 bg-[#F2F3F3] min-h-full print:p-0 print:h-auto print:bg-white print:min-h-auto">
            <div>
              <Outlet />
            </div>
            <DefaultModal></DefaultModal>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
