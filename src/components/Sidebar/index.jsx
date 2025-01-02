/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import parse from 'html-react-parser';
import Logo from '/vite.svg';

const Sidebar = ({ menuList, title }) => {
  const location = useLocation();
  const { pathname } = location;
  // const [hasChild, setHasChild] = useState(true)
  const [activeMenu, setActiveMenu] = useState(null);

  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(360);

  const startResizing = useCallback((mouseDownEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

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
    console.log(menuList);

    const activeItem = menuList.find(
      (menu) => pathname.startsWith(menu.route) && menu.subMenu
    );
    console.log(pathname);

    console.log(activeItem);

    setActiveMenu(activeItem);
  }, [pathname, menuList]);

  return (
    <aside    
    ref={sidebarRef}
    style={{ width: `${activeMenu?.subMenu ? sidebarWidth : 64}px`, 
      flexGrow: 0,
      flexShrink: 0,
      maxWidth: '800px',
      display: 'flex',
      borderRight: '1px solid #e9e9e9',
      flexDirection: 'row',
      background: '#ffffff',
      boxShadow: '-8px 2px 22px -7px rgba(0, 0, 0, 0.25)',
      borderRadius: '10px 0px 0px 10px',
      zIndex: 2,
     }}
    onMouseDown={(e) => e.preventDefault()

    }>

      <div className="main_menu_area w-[64px] bg-[#333] h-full">
        <div className="flex items-center justify-between gap-2">
          <NavLink to="/" className="w-full flex justify-center py-5">
            <img src={Logo} alt="Logo" className='w-10' />
          </NavLink>
        </div>


        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav>
            <div>

              <ul className="mb-6 flex flex-col gap-1.5">
                {/* <li>
                  <NavLink
                    to="/"
                    className={`group relative flex items-center gap-2.5 rounded-sm py-5 text-[12px] font-bold flex flex-col items-center justify-center duration-300 ease-in-out ${pathname === '/' ?
                      'bg-black text-[#05afe1]' : 'text-[#e6e6e6]'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-layout-dashboard">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
                      <path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
                      <path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" />
                      <path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" />
                    </svg>
                    <span className={`${pathname === '/' &&
                      'text-white'
                      }`}>Home</span>
                  </NavLink>

                  <NavLink
                    to="/student"
                    className={`group relative flex items-center gap-2.5 rounded-sm py-5 text-[12px] font-bold flex flex-col items-center justify-center duration-300 ease-in-out ${pathname.includes('/student') ?
                      'bg-black text-[#05afe1]' : 'text-[#e6e6e6]'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width={38} height={38} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-users">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                      <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                    </svg>
                    <span className={`${pathname.includes('/student') &&
                      'text-white'
                      }`}>Student</span>
                  </NavLink>
                </li> */}


                {menuList.map((menu) => (
                  <li key={menu.id}>
                    <NavLink
                      to={menu.route}
                      className={`group relative flex items-center gap-2.5 rounded-sm py-5 text-[12px] font-bold flex flex-col items-center justify-center duration-300 ease-in-out ${pathname === '/' || menu.route === '/'
                        ? pathname === menu.route
                          ? "bg-black text-[#0ea5e9]"
                          : "text-[#f6f6f6]"
                        : pathname.includes(menu.route)
                          ? "bg-black text-[#0ea5e9]"
                          : "text-[#e6e6e6]"
                        }`}

                    >
                      {parse(menu.icon)}
                      <span className={`${pathname.includes(menu.route) &&
                        'text-white'
                        }`}>{menu.name}</span>
                    </NavLink>
                  </li>
                ))}


              </ul>
            </div>

          </nav>
        </div>
      </div>
      {activeMenu && activeMenu.subMenu ? (
        <div className='sub_menu_area bg-[#ededed] h-full pt-[20px] ps-[10px] pe-[20px] min-w-[150px]'>
          <h1 className='text-[#333] text-[20px] font-lato font-normal'>{title}</h1>

          <ul className="flex flex-col mt-[30px]">
            {activeMenu.subMenu.map((subItem) => (
              <li key={subItem.id} className={`pl-5 ${pathname.includes(subItem.route)
                ? "shadow-sub_menu bg-white rounded-[4px]"
                : ""
                }`}>
                <NavLink
                  to={`${activeMenu.route}${subItem.route}`}
                  className={`flex items-center gap-2 p-2 rounded-md text-[14px] `}
                >
                  <span className={`${pathname.includes(subItem.route) ? 'text-[#0ea5e9]' : ""}`}>{subItem.icon ? parse(subItem.icon) : null}</span>
                  <span>{subItem.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>

        </div>
      ) : null}
      {activeMenu && activeMenu.subMenu ? (
        <div className="app-sidebar-resizer h-full w-[10px] after:content[''] after:relative after:w-[5px] after:h-[16px] after:top-1/2 after:-translate-y-1/2 after:border-x after:border-x-[#cccccc] bg-[#ededed] after:block" onMouseDown={startResizing} style={{flexGrow: 0, flexShrink: 0, flexBasis: '6px', justifySelf: 'flex-end', cursor: "ew-resize", resize: "horizontal"}} />
      ): null}
       
    </aside>
  );
};

export default Sidebar;
