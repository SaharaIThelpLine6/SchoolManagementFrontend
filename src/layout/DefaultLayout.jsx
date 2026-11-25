// src/layout/DefaultLayout.jsx
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
import { useGetRedirectStatusQuery } from "../features/Admin/redirectSlice";
import DashboardQuickActions from "../components/DashboardQuickActions";

const tawkPropertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
const tawkWidgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

const DefaultLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // ✅ single source of truth
  const isMobileOpen = useSelector((state) => state.sideBar.isOpen);
  const isDesktopOpen = useSelector((state) => state.sideBar.isDesktopOpen);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const token = useSelector((state) => state.auth.token);
  const pageName = useSelector((state) => state.auth.pageName);
  const { currectLanguage } = useSelector((state) => state.language);
  const { isOpen } = useSelector((state) => state.modal);
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;
  const school_id = user?.schoolId ? Number(user.schoolId) : null;

  const { data: institutionInfo, isSuccess } = useGetInstitutionInfoQuery();

  const { data: currentMadrasah } = useGetCurrentMadrasahQuery(school_id, {
    skip: !school_id,
  });

  const { data: redirectStatus } = useGetRedirectStatusQuery(school_id, {
    skip: !school_id,
  });

  useEffect(() => {
    document.title = "Qmmsoft - কওমী মাদরাসা ম্যানেজমেন্ট";
  }, []);

  useEffect(() => {
    if (isSuccess && institutionInfo?.InstitutionCode) {
      document.title = `Qmmsoft - কওমী মাদরাসা ম্যানেজমেন্ট : ${institutionInfo.InstitutionCode}`;
    }
  }, [isSuccess, institutionInfo?.InstitutionCode]);

  useEffect(() => {
    const lang = localStorage.getItem("lang");
    if (lang && lang !== currectLanguage) {
      dispatch(setCurrentLanguage(lang));
    } else if (!lang) {
      dispatch(setCurrentLanguage(currectLanguage));
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

  useEffect(() => {
    if (!currentMadrasah || !school_id) return;
    if (currentMadrasah.action === "Inactive" && permissionType > 4) {
      dispatch(logout());
      navigate("/login");
    }
  }, [currentMadrasah, permissionType, dispatch, navigate, school_id]);

  useEffect(() => {
    if (redirectStatus && redirectStatus.onTestStatus === 1) {
      if (
        window.location.hostname !== "testbda.qmmsoft.com" &&
        window.location.hostname !== "localhost"
      ) {
        window.location.href = `https://testbda.qmmsoft.com/login?token=${token}`;
      }
    }
  }, [redirectStatus, token, school_id]);

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
    <div className="h-screen flex flex-col bg-[#f4efe2] font-SolaimanLipi overflow-hidden print:h-auto print:bg-white print:overflow-visible">
      {/* Header */}
      <div className="z-40 print:hidden">
        <Header />
      </div>

      <div className="flex flex-1 overflow-hidden relative print:overflow-visible">
        {/* ✅ Sidebar — comment class-এর বাইরে */}
        <div
          className={[
            "fixed top-20 sm:top-16 left-0 z-30",
            "w-[250px] h-[calc(100vh-64px)]",
            "bg-white shadow-[2px_0_8px_rgba(0,0,0,0.15)]",
            "transform transition-all duration-300 ease-in-out",
            "print:hidden",
            // মোবাইল এবং ট্যাবলেটের জন্য (lg এর নিচে)
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
            // ডেস্কটপের জন্য (lg এবং তার উপরে)
            "lg:top-0 lg:h-full lg:static lg:translate-x-0 lg:transform-none",
            "lg:shrink-0 lg:overflow-hidden lg:transition-[width,opacity]",
            isDesktopOpen
              ? "lg:w-[250px] lg:opacity-100"
              : "lg:w-0 lg:opacity-0 lg:invisible",
          ].join(" ")}
        >
          <div className="w-[250px] h-full">
            <SideBar />
          </div>
        </div>

        {/* Overlay for mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-20 lg:hidden"
            onClick={() => dispatch(closeSidebar())}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 ml-0 h-full overflow-y-auto print:ml-0 print:h-auto print:overflow-y-visible pb-10">
          <div className="relative p-1 lg:p-4 min-h-full print:p-0 print:h-auto print:bg-white print:min-h-auto">
            <div className="relative">
              <Outlet key={location.pathname} />
            </div>
            <DefaultModal />
          </div>
          <DeveloperCredit />
        </main>
      </div>

      {isAuthenticated && !isOpen && (
        <DashboardQuickActions key={location.pathname} />
      )}
    </div>
  );
};

export default DefaultLayout;
