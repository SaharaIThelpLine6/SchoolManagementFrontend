// /* eslint-disable no-unused-vars */
// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { NavLink, useLocation } from 'react-router-dom';
// import parse from 'html-react-parser';
// import Logo from '/saharaItlogo.png';
// import useTranslate from '../../utils/Translate';
// import { useSelector } from 'react-redux';

// const Sidebar = ({ menuList, title }) => {
//   const translate = useTranslate()
//   const location = useLocation();
//   const {isOpen} = useSelector((state)=>state.sideBar)
//   const { pathname } = location;
//   // const [hasChild, setHasChild] = useState(true)

//   const sidebarRef = useRef(null);
//   const [isResizing, setIsResizing] = useState(false); // Resizing state
//   const [sidebarWidth, setSidebarWidth] = useState(360); // Sidebar width
//   const [activeMenu, setActiveMenu] = useState(null); // Active menu

//   // const [isOpen, setIsOpen] = useState(false); // Sidebar toggle for small screens

//   const startResizing = useCallback((mouseDownEvent) => {
//     setIsResizing(true);
//   }, []);

//   const stopResizing = useCallback(() => {
//     setIsResizing(false);
//   }, []);


//   // Handle resizing logic

//   const handleMouseMove = (e) => {
//     if (!isResizing) return;
//     const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
//     setSidebarWidth(Math.max(64, newWidth)); // Minimum width 64px
//   };


//   const resize = useCallback(
//     (mouseMoveEvent) => {
//       if (isResizing) {
//         setSidebarWidth(
//           mouseMoveEvent.clientX -
//           sidebarRef.current.getBoundingClientRect().left
//         );
//       }
//     },
//     [isResizing]
//   );

//   useEffect(() => {
//     window.addEventListener("mousemove", resize);
//     window.addEventListener("mouseup", stopResizing);
//     return () => {
//       window.removeEventListener("mousemove", resize);
//       window.removeEventListener("mouseup", stopResizing);
//     };
//   }, [resize, stopResizing]);

//   useEffect(() => {
//     // console.log(menuList);

//     const activeItem = menuList.find(
//       (menu) => pathname.startsWith(menu.route) && menu.subMenu
//     );
//     // console.log(pathname);
//     // console.log(activeItem);

//     setActiveMenu(activeItem);
//   }, [pathname, menuList]);

//   // Toggle sidebar open/close for small screens
//   const toggleSidebar = () => {
//     // setIsOpen(!isOpen);
//   };

//   // Handle submenu toggle (optional manual click behavior)
//   const handleMenuClick = (menu) => {
//     setActiveMenu(activeMenu?.id === menu.id ? null : menu); // Toggle submenu
//   };



//   // Attach mousemove and mouseup events during resizing
//   useEffect(() => {
//     if (isResizing) {
//       window.addEventListener('mousemove', handleMouseMove);
//       window.addEventListener('mouseup', stopResizing);
//     }
//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       window.removeEventListener('mouseup', stopResizing);
//     };
//   }, [isResizing]);

//   return (
//     // <div className="flex">
//     //   <button
//     //     className="md:hidden fixed top-4 left-4 z-50 bg-transparent text-[#000000] p-2 rounded-md"
//     //     onClick={toggleSidebar}
//     //   >
//     //     {isOpen ? '✖' : '☰'}
//     //   </button>

//     //   {isOpen && (
//     //     <div
//     //       className="fixed inset-0 bg-black bg-opacity-50 z-40"
//     //       onClick={toggleSidebar}
//     //     ></div>
//     //   )}
//     //   {isOpen && (
//     //     <button
//     //       className="fixed top-4 right-4 z-50 bg-slate-300 text-white p-2 rounded-md"
//     //       onClick={toggleSidebar}
//     //     >
//     //       ✖
//     //     </button>
//     //   )}

//     <aside ref={sidebarRef}
//       className={`h-full w-full transition-all duration-300 ease-in-out flex z-30 absolute left-0 top-0 lg:relative  ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
//     // style={{
//     //   width: `${activeMenu?.subMenu ? sidebarWidth : 64}px`,
//     //   flexGrow: 0,
//     //   flexShrink: 0,
//     //   maxWidth: '800px',
//     //   display: 'flex',
//     //   borderRight: '1px solid #e9e9e9',
//     //   flexDirection: 'row',
//     //   background: '#ffffff',
//     //   boxShadow: '-8px 2px 22px -7px rgba(0, 0, 0, 0.25)',
//     //   borderRadius: '10px 0px 0px 10px',
//     //   zIndex: 9,
//     // }}
//     // onMouseDown={(e) => e.preventDefault()}
//     >
//       {/* 
//           ${isOpen ? 'translate-x-0' : '-translate-x-full'
//           } md:translate-x-0
//           */}

//       {/* Main Menu Area */}
//       <div className='flex relative z-30'>
//         <div className="main_menu_area w-[64px] bg-[#333] h-full flex flex-col">
//           <div className="flex items-center justify-center py-5 bg-[#333] z-10">
//             <NavLink to="/" className="w-full flex justify-center">
//               <img src={Logo} alt="Logo" className='w-12 h-[60px] rounded-sm' />
//             </NavLink>
//           </div>


//           <div className=" flex flex-col duration-300 ease-linear flex-1">
//             <nav>
//               <ul className="mb-6 flex flex-col gap-1.5">
//                 {menuList.map((menu) => (
//                   <li key={menu.id}>
//                     <NavLink
//                       to={menu.route}
//                       className={`group relative flex items-center gap-1 rounded-sm py-2 text-[16px] font-normal font-SolaimanLipi flex-col justify-center duration-300 ease-in-out ${pathname === '/' || menu.route === '/'
//                         ? pathname === menu.route
//                           ? "bg-black text-[#6ad965]"
//                           : "text-[#f6f6f6]"
//                         : pathname.includes(menu.route)
//                           ? "bg-black text-[#6ad965]"
//                           : "text-[#e6e6e6]"
//                         }`}
//                       onClick={() => handleMenuClick(menu)}
//                     >
//                       {parse(menu.icon)}
//                       <span
//                         className={pathname.includes(menu.route) ? 'text-white' : ''}
//                       >
//                         {translate(menu.name)}
//                       </span>
//                     </NavLink>
//                   </li>
//                 ))}


//               </ul>
//             </nav>
//           </div>
//         </div>

//         {/* Submenu Area */}
//         {activeMenu?.subMenu && (
//           <div className="sub_menu_area bg-[#ededed] h-full pt-[20px] ps-[10px] pe-[20px] min-w-[200px] md:min-w-[150px] ">
//             <h1 className="text-theme-dark text-[20px] font-lato font-bold pl-3">{title}</h1>
//             <ul className="flex flex-col mt-[20px]">
//               {activeMenu.subMenu.map((subItem) => (
//                 <li key={subItem.id} className={`pl-1 ${pathname.includes(subItem.route)
//                   ? "shadow-sub_menu bg-[#f9f9f9] rounded-[4px]"
//                   : ""
//                   }`}>
//                   <NavLink
//                     to={`${activeMenu.route}${subItem.route}`}
//                     className={`flex items-center gap-2 p-2 rounded-md text-[14px] `}
//                   >
//                     <span className={`${pathname.includes(subItem.route) ? 'text-[#6ad965]' : "text-theme-dark"}`}>{subItem.icon ? parse(subItem.icon) : null}</span>
//                     <span>{subItem.name}</span>
//                   </NavLink>
//                 </li>
//               ))}
//             </ul>

//           </div>
//         )}
//         {activeMenu && activeMenu.subMenu ? (
//           <div className="app-sidebar-resizer h-full w-[10px] after:content[''] after:relative after:w-[5px] after:h-[16px] after:top-1/2 after:-translate-y-1/2 after:border-x after:border-x-[#cccccc] bg-[#ededed] after:block" onMouseDown={startResizing} style={{ flexGrow: 0, flexShrink: 0, flexBasis: '6px', justifySelf: 'flex-end', cursor: "ew-resize", resize: "horizontal" }} />
//         ) : null}
//       </div>
//       <div className="fixed inset-0 bg-black bg-opacity-80 z-10 w-full lg:hidden" onClick={toggleSidebar}>
//         <div className="relative">
//           <button className='times absolute right-4 top-5 text-white '>
//             <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
//           </button>
//         </div>
//       </div>

//     </aside>
//     // </div>
//   );
// };

// export default Sidebar;
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import parse from 'html-react-parser';
import Logo from '/saharaItlogo.png';
import useTranslate from '../../utils/Translate';
import { useDispatch, useSelector } from 'react-redux';
import { closeSidebar } from '../../features/sidebar/sideBarSlice';

const Sidebar = ({ menuList, title }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isOpen } = useSelector((state) => state.sideBar);
  const { pathname } = location;
  const sidebarRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const activeItem = menuList.find(
      (menu) => pathname.startsWith(menu.route) && menu.subMenu
    );
    setActiveMenu(activeItem);
  }, [pathname, menuList]);

  const handleMenuClick = (menu) => {
    if (!menu.subMenu) {
      dispatch(closeSidebar());
    }
    setActiveMenu(activeMenu?.id === menu.id ? null : menu);
  };

  const handleSubMenuClick = () => {
    dispatch(closeSidebar());
  };

  return (
    <aside
      ref={sidebarRef}
      className={`h-full transition-all duration-300 ease-in-out min-h-screen flex z-30 absolute left-0 top-0 lg:relative ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
    >
      <div className='flex relative z-30'>
        <div className="main_menu_area w-[64px] bg-[#333] h-full flex flex-col">
          <div className="flex items-center justify-center py-5 bg-[#333] z-10">
            <NavLink to="/" className="w-full flex justify-center">
              <img src={Logo} alt="Logo" className='w-12 h-[60px] rounded-sm' />
            </NavLink>
          </div>

          <div className="flex flex-col duration-300 ease-linear flex-1">
            <nav>
              <ul className="mb-6 flex flex-col gap-1.5">
                {menuList.map((menu) => (
                  <li key={menu.id}>
                    <NavLink
                      to={menu.route}
                      className={`group relative flex items-center gap-1 rounded-sm py-2 text-[16px] font-normal font-SolaimanLipi flex-col justify-center duration-300 ease-in-out ${pathname === '/' || menu.route === '/'
                        ? pathname === menu.route
                          ? "bg-black text-theme-color"
                          : "text-[#f6f6f6]"
                        : pathname.includes(menu.route)
                          ? "bg-black text-theme-color"
                          : "text-[#e6e6e6]"
                        }`}
                      onClick={() => handleMenuClick(menu)}
                    >
                      {parse(menu.icon)}
                      <span
                        className={pathname.includes(menu.route) ? 'text-white' : ''}
                      >
                        {translate(menu.name)}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {activeMenu?.subMenu && (
          <div className="sub_menu_area bg-[#ededed] h-full pt-[20px] ps-[10px] pe-[20px] min-w-[200px] md:min-w-[250px]">
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
                    onClick={handleSubMenuClick}
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
          <div className="app-sidebar-resizer h-full w-[10px] after:content[''] after:relative after:w-[5px] after:h-[16px] after:top-1/2 after:-translate-y-1/2 after:border-x after:border-x-[#cccccc] bg-[#ededed] after:block" style={{ flexGrow: 0, flexShrink: 0, flexBasis: '6px', justifySelf: 'flex-end', cursor: "ew-resize", resize: "horizontal" }} />
        ) : null}
      </div>
      <div className={`fixed bg-black bg-opacity-80 z-10 w-screen h-screen ${isOpen ? 'block' : 'hidden'} lg:hidden`} onClick={() => { dispatch(closeSidebar()) }}>
        <div className="relative">
          <button className='times absolute right-4 top-5 text-white' onClick={() => { dispatch(closeSidebar()) }}>
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;