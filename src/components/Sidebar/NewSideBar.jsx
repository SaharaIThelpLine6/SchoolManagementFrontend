import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import * as Icons from "react-icons/fa";
import { menuData } from "./data";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const NewSideBar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const location = useLocation();

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const renderIcon = (icon) => {
    if (icon.startsWith("Fa") && Icons[icon]) {
      return React.createElement(Icons[icon], { className: "text-2xl" });
    }
    return <span className="text-2xl">{icon}</span>;
  };

  const isActiveRoute = (route) => location.pathname === route;

  useEffect(() => {
    menuData.forEach((menu) => {
      if (menu.subMenu) {
        const activeSubMenu = menu.subMenu.find((item) =>
          isActiveRoute(item.route)
        );
        if (activeSubMenu) {
          setOpenMenuId(menu.id);
        }
      }
    });
  }, [location.pathname]);

  const submenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <aside className="h-[calc(100vh-64px)] lg:h-full overflow-y-auto w-[250px] bg-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] text-sm text-black scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded-full">
      <nav className="mt-4">
        <ul className="space-y-2 pb-4">
          {menuData.map((menu) => (
            <li key={menu.id}>
              {menu.subMenu ? (
                <>
                  <button
                    onClick={() => handleToggle(menu.id)}
                    className={`w-full flex px-4 font-SolaimanLipi items-center justify-between border-l-6 gap-2 py-2 font-semibold ${
                      menu.subMenu.some((item) => isActiveRoute(item.route)) ||
                      isActiveRoute(menu.route)
                        ? "bg-[#deeff9] text-[#00aeef] border-[#00aeef]"
                        : "hover:text-[#00aeef] hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {renderIcon(menu.icon)}
                      {menu.name}
                    </span>
                    <span>
                      {openMenuId === menu.id ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </button>
                  <AnimatePresence>
                    {openMenuId === menu.id && (
                      <motion.ul
                        className="text-gray-600"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={submenuVariants}
                      >
                        {menu.subMenu.map((item) => (
                          <li
                            key={item.id}
                            className="text-sm border-l-2 border-dashed border-[#00aeef] ml-5"
                          >
                            <NavLink
                              to={item.route}
                              className={({ isActive }) =>
                                `block py-2 pl-6 font-SolaimanLipi ${
                                  isActive
                                    ? "bg-[#deeff9] text-[#00aeef]"
                                    : "hover:text-[#00aeef] hover:bg-gray-50"
                                }`
                              }
                            >
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <NavLink
                  to={menu.route}
                  className={({ isActive }) =>
                    `flex items-center font-SolaimanLipi gap-2 py-2 px-4 ${
                      isActive
                        ? "bg-[#deeff9] text-[#00aeef] border-l-6 border-[#00aeef]"
                        : "hover:text-[#00aeef] hover:bg-gray-50"
                    }`
                  }
                >
                  {renderIcon(menu.icon)} {menu.name}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default NewSideBar;
