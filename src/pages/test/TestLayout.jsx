import { Outlet } from "react-router-dom";
import NewSideBar from "../../components/Sidebar/NewSideBar";
import TestHeader from "./TestHeader";
import { useSelector, useDispatch } from "react-redux";
import { closeSidebar } from "../../features/sidebar/sideBarSlice";

const TestLayout = () => {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.sideBar?.isOpen ?? false);

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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestLayout;
