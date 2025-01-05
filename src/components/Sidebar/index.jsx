import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import parse from 'html-react-parser';
import Logo from '/vite.svg';

const Sidebar = ({ menuList, title }) => {
  const location = useLocation();
  const { pathname } = location;

  const sidebarRef = useRef(null);

  // States
  const [activeMenu, setActiveMenu] = useState(null); // Active menu
  const [sidebarWidth, setSidebarWidth] = useState(64); // Sidebar width
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle for small screens
  const [isResizing, setIsResizing] = useState(false); // Resizing state

  // Track active menu based on route
  useEffect(() => {
    const activeItem = menuList.find((menu) => pathname.startsWith(menu.route));
    setActiveMenu(activeItem);
  }, [pathname, menuList]);

  // Toggle sidebar open/close for small screens
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle submenu toggle (optional manual click behavior)
  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu?.id === menu.id ? null : menu); // Toggle submenu
  };

  // Handle resizing logic
  const startResizing = () => setIsResizing(true);
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
    setSidebarWidth(Math.max(64, newWidth)); // Minimum width 64px
  };
  const stopResizing = () => setIsResizing(false);

  // Attach mousemove and mouseup events during resizing
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="flex">
      {/* Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-transparent text-[#EDEDED] p-2 rounded-md"
        onClick={toggleSidebar}
      >
        {isOpen ? '✖' : '☰'}
      </button>

      {/* Close Button */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}
      {isOpen && (
        <button
          className="fixed top-4 right-4 z-50 bg-slate-300 text-white p-2 rounded-md"
          onClick={toggleSidebar}
        >
          ✖
        </button>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed md:relative h-full transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        style={{
          width: `${activeMenu?.subMenu ? sidebarWidth : 64}px`,
          flexGrow: 0,
          flexShrink: 0,
          maxWidth: '800px',
          display: 'flex',
          borderRight: '1px solid #e9e9e9',
          flexDirection: 'row',
          background: '#ffffff',
          boxShadow: '-8px 2px 22px -7px rgba(0, 0, 0, 0.25)',
          borderRadius: '10px 0px 0px 10px',
          zIndex: 99,
        }}
      >


        {/* Main Menu Area */}
        <div className="main_menu_area w-[64px] bg-[#333] h-full">
          <div className="flex items-center justify-between gap-2">
            <NavLink to="/" className="w-full flex justify-center py-5">
              <img src={Logo} alt="Logo" className="w-10" />
            </NavLink>
          </div>

          {/* Menu List */}
          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav>
              <ul className="mb-6 flex flex-col gap-1.5">
                {menuList.map((menu) => (
                  <li key={menu.id}>
                    <NavLink
                      to={menu.route}
                      className={`group relative flex items-center gap-2.5 rounded-sm py-5 text-[12px] font-bold flex-col  justify-center duration-300 ease-in-out ${pathname.includes(menu.route)
                          ? 'bg-black text-[#0ea5e9]'
                          : 'text-[#e6e6e6]'
                        }`}
                      onClick={() => handleMenuClick(menu)}
                    >
                      {parse(menu.icon)}
                      <span
                        className={pathname.includes(menu.route) ? 'text-white' : ''}
                      >
                        {menu.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Submenu Area */}
        {activeMenu?.subMenu && (
          <div className="sub_menu_area bg-[#ededed] h-full pt-[20px] ps-[10px] pe-[20px] min-w-[150px]">
            <h1 className="text-[#333] text-[20px] font-lato font-normal">{title}</h1>
            <ul className="flex flex-col mt-[30px]">
              {activeMenu.subMenu.map((subItem) => (
                <li
                  key={subItem.id}
                  className={`pl-5 ${pathname.includes(subItem.route) ? 'shadow-sub_menu bg-white rounded-[4px]' : ''
                    }`}
                >
                  <NavLink
                    to={`${activeMenu.route}${subItem.route}`}
                    className="flex items-center gap-2 p-2 rounded-md text-[14px]"
                  >
                    <span
                      className={pathname.includes(subItem.route) ? 'text-[#0ea5e9]' : ''}
                    >
                      {subItem.icon ? parse(subItem.icon) : null}
                    </span>
                    <span>{subItem.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resizer */}
        {activeMenu?.subMenu && (
          <div
            className="app-sidebar-resizer h-full w-[10px] bg-[#ededed] cursor-ew-resize"
            onMouseDown={startResizing}
          />
        )}
      </aside>
    </div>
  );
};

export default Sidebar;
