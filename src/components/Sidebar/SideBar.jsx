import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { menuData } from "./data";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { renderIcons } from "../../helper/renderIcons";
import useTranslate from "../../utils/Translate";

const SideBar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const location = useLocation();
  const translate = useTranslate();

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    menuData.forEach((menu) => {
      if (Array.isArray(menu.subMenu)) {
        const activeSubMenu = menu.subMenu.find((item) =>
          location.pathname.startsWith(item.route)
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
    <aside className="h-[calc(100vh-64px)] lg:h-full overflow-y-auto w-[250px] bg-white shadow-[2px_0_4px_rgba(0,0,0,0.1)] text-sm text-black scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thumb-rounded-full print:hidden">
      <nav className="mt-4">
        <ul className="space-y-2 pb-4">
          {menuData.map((menu) => (
            <li key={menu.id}>
              {menu.subMenu ? (
                <>
                  <button
                    onClick={() => handleToggle(menu.id)}
                    className={`w-full flex px-4 font-SolaimanLipi items-center justify-between border-l-6 border-solid gap-2 py-2 ${
                      location.pathname.startsWith(menu.route)
                        ? "bg-[#deeff9] text-[#007af7] border-l-[#007af7]"
                        : "hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {renderIcons(menu.icon)}
                      {translate(menu.name)}
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
                        className="relative text-gray-600"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={submenuVariants}
                      >
                        {/* Vertical Dashed Line */}
                        <div className="absolute top-0 bottom-0 left-6 w-px border-l-2 border-dashed border-[#007af7] z-0" />

                        {menu.subMenu.map((item) => (
                          <li key={item.id} className="relative z-10 pl-[26px]">
                            <NavLink
                              to={item.route}
                              end
                              className={({ isActive }) =>
                                `block py-2 font-SolaimanLipi pl-4  ${
                                  isActive
                                    ? "bg-[#ddeffe] text-[#007af7]"
                                    : "hover:text-[#007af7] hover:bg-[#ddeffe]"
                                }`
                              }
                            >
                              {translate(item.name)}
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
                  onClick={() => setOpenMenuId(null)}
                  className={({ isActive }) =>
                    `flex items-center font-SolaimanLipi gap-2 py-2 px-4 border-l-6 border-solid ${
                      isActive
                        ? "bg-[#ddeffe] text-[#007af7] border-l-[#007af7]"
                        : "hover:text-[#007af7] hover:bg-[#ddeffe] border-l-transparent"
                    }`
                  }
                >
                  {renderIcons(menu.icon)} {translate(menu.name)}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
