import NewSideBar from "../../components/Sidebar/NewSideBar";
import TestHeader from "./TestHeader";
import { closeSidebar } from "../../features/sidebar/sideBarSlice";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentLanguage } from "../../features/language/languageSlice";
import { verifyUser } from "../../features/auth/authSlice";
import { useEffect } from "react";
import DefaultModal from "../../components/DefaultModal";

const TestLayout = () => {
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
    <div className="h-screen flex flex-col bg-gray-100 font-SolaimanLipi overflow-hidden">
      {/* Header */}
      <div className="z-40">
        <TestHeader />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`fixed top-20 sm:top-16 left-0 z-30 w-[250px] h-[calc(100vh-64px)] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.15)] transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:top-0 lg:h-full lg:static lg:translate-x-0 lg:transform-none`}
        >
          <NewSideBar />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-20 lg:hidden"
            onClick={() => dispatch(closeSidebar())}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 ml-0 h-full overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-full">
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

export default TestLayout;
