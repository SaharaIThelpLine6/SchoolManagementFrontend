/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import parse from 'html-react-parser';
import Logo from '/saharaIt.svg';
import Translate from '../../utils/Translate';

const Sidebar = ({ menuList, title }) => {
  const location = useLocation();
  const { pathname } = location;
  // const [hasChild, setHasChild] = useState(true)

  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false); // Resizing state
  const [sidebarWidth, setSidebarWidth] = useState(360); // Sidebar width
  const [activeMenu, setActiveMenu] = useState(null); // Active menu
  
  const [isOpen, setIsOpen] = useState(false); // Sidebar toggle for small screens
  
  const startResizing = useCallback((mouseDownEvent) => {
    setIsResizing(true);
  }, []);

    const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);


  // Handle resizing logic
 
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
    setSidebarWidth(Math.max(64, newWidth)); // Minimum width 64px
  };
 

  const resize = useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        setSidebarWidth(
          mouseMoveEvent.clientX -
            sidebarRef.current.getBoundingClientRect().left
        );
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    // console.log(menuList);

    const activeItem = menuList.find(
      (menu) => pathname.startsWith(menu.route) && menu.subMenu
    );
    // console.log(pathname);
    // console.log(activeItem);

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
    onMouseDown={(e) => e.preventDefault()

    }>

        {/* Main Menu Area */}
        <div className="main_menu_area w-[64px] bg-[#333] h-full">
          <div className="flex items-center justify-between gap-2">
            <NavLink to="/" className="w-full flex justify-center py-5">
            <img src={Logo} alt="Logo" className='w-8 h-8 rounded-sm'/>
            </NavLink>
          </div>


          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav>
              <ul className="mb-6 flex flex-col gap-1.5">
                {menuList.map((menu) => (
                  <li key={menu.id}>
                    <NavLink
                      to={menu.route}
                      className={`group relative flex items-center gap-1 rounded-sm py-2 text-[12px] font-semibold flex-col justify-center duration-300 ease-in-out ${pathname === '/' || menu.route === '/'
                        ? pathname === menu.route
                          ? "bg-black text-[#6ad965]"
                          : "text-[#f6f6f6]"
                        : pathname.includes(menu.route)
                          ? "bg-black text-[#6ad965]"
                          : "text-[#e6e6e6]"
                        }`}
                      onClick={() => handleMenuClick(menu)}
                    >
                      {parse(menu.icon)}
                      <span
                        className={pathname.includes(menu.route) ? 'text-white' : ''}
                      >
                        {Translate(menu.name)}
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
            <h1 className="text-theme-dark text-[20px] font-lato font-bold pl-3">{title}</h1>
            <ul className="flex flex-col mt-[20px]">
              {activeMenu.subMenu.map((subItem) => (
              <li key={subItem.id} className={`pl-1 ${pathname.includes(subItem.route)
                ? "shadow-sub_menu bg-[#f9f9f9] rounded-[4px]"
                : ""
                }`}>
                  <NavLink
                    to={`${activeMenu.route}${subItem.route}`}
                  className={`flex items-center gap-2 p-2 rounded-md text-[14px] `}
                    >
                  <span className={`${pathname.includes(subItem.route) ? 'text-[#6ad965]' : "text-theme-dark"}`}>{subItem.icon ? parse(subItem.icon) : null}</span>
                    <span>{subItem.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>

          </div>
      )}
      {activeMenu && activeMenu.subMenu ? (
        <div className="app-sidebar-resizer h-full w-[10px] after:content[''] after:relative after:w-[5px] after:h-[16px] after:top-1/2 after:-translate-y-1/2 after:border-x after:border-x-[#cccccc] bg-[#ededed] after:block" onMouseDown={startResizing} style={{flexGrow: 0, flexShrink: 0, flexBasis: '6px', justifySelf: 'flex-end', cursor: "ew-resize", resize: "horizontal"}} />
      ): null}
       
      </aside>
    </div>
  );
};

export default Sidebar;
