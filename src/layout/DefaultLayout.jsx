import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import DefaultModal from "../components/DefaultModal";
import { verifyUser, logout } from "../features/auth/authSlice";
import { setCurrentLanguage } from "../features/language/languageSlice";
import { closeSidebar } from "../features/sidebar/sideBarSlice";
import SideBar from "../components/Sidebar/SideBar";
import Header from "../components/Header/Header";
import { useGetInstitutionInfoQuery } from "../features/settings/settingsQuerySlice";
import TawkMessenger from "@tawk.to/tawk-messenger-react";
import DeveloperCredit from "../components/DeveloperCredit";
import { useGetCurrentMadrasahQuery } from "../features/userType/userTypeSlice";

const tawkPropertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
const tawkWidgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

const DefaultLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const sidebarOpen = useSelector((state) => state.sideBar?.isOpen ?? false);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const pageName = useSelector((state) => state.auth.pageName);
  const { currectLanguage } = useSelector((state) => state.language);
  const { isOpen } = useSelector((state) => state.modal);
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;
  const school_id = user?.schoolId ? Number(user.schoolId) : null;

  const { data: institutionInfo, isSuccess } = useGetInstitutionInfoQuery();
  // Madrasah list fetch

  const { data: currentMadrasah, isLoading: isLoadingMadrasah } =
    useGetCurrentMadrasahQuery(school_id, {
      skip: !school_id, // <-- skip query until school_id is ready
    });
  // ✅ Set default title
  useEffect(() => {
    document.title = "Qmmsoft - কওমী মাদরাসা ম্যানেজমেন্ট";
  }, []);

  // ✅ Update title when institution info loads
  useEffect(() => {
    if (isSuccess && institutionInfo?.InstitutionCode) {
      document.title = `Qmmsoft - কওমী মাদরাসা ম্যানেজমেন্ট : ${institutionInfo.InstitutionCode}`;
    }
  }, [isSuccess, institutionInfo?.InstitutionCode]);

  // ✅ Token verification on route change
  useEffect(() => {
    const lang = localStorage.getItem("lang");
    if (lang && lang !== currectLanguage) {
      dispatch(setCurrentLanguage(lang));
    }

    if (token) {
      dispatch(verifyUser(token))
        .unwrap()
        .catch(() => {
          dispatch(logout());
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, token, location.pathname]);

  // ✅ Check Madrasah Action
  useEffect(() => {
    if (!currentMadrasah || !school_id) return;

    if (currentMadrasah.action === "Inactive" && permissionType > 4) {
      dispatch(logout());
      navigate("/login");
    }
  }, [currentMadrasah, permissionType, dispatch, navigate, school_id]);

  // ✅ Handle multi-tab logout
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        const localToken = e.newValue;
        if (localToken !== token) {
          dispatch(logout());
          navigate("/login");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, navigate, token]);

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
        <main className="flex-1 ml-0 h-full overflow-y-auto print:ml-0 print:h-auto print:overflow-y-visible pb-16">
          <div className="relative p-4 min-h-full print:p-0 print:h-auto print:bg-white print:min-h-auto">
            <div className="relative">
              <Outlet />
            </div>

            <DefaultModal />
          </div>
          <DeveloperCredit />
        </main>
      </div>

      {/* ✅ Show Tawk chat only when logged in */}
      {/* {isAuthenticated && (
        <TawkMessenger propertyId={tawkPropertyId} widgetId={tawkWidgetId} />
      )} */}
    </div>
  );
};

export default DefaultLayout;
