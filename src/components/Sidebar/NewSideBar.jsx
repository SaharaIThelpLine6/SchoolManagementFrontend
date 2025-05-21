import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import * as Icons from "react-icons/fa";
import { menuData } from "./data";

const NewSideBar = () => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleToggle = (id) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const renderIcon = (icon) => {
    if (icon.startsWith("Fa") && Icons[icon]) {
      return React.createElement(Icons[icon], { className: "text-2xl" }); // Bigger icon
    }
    return <span className="text-2xl">{icon}</span>;
  };

  return (
    <aside className="min-h-screen w-[300px] bg-[#333333] shadow-md text-sm text-white">
      <div className="p-4 border-b border-gray-600 text-center">
        <img
          src="./logo.png"
          alt="Logo"
          className="w-16 h-16 rounded-full mx-auto"
        />
      </div>

      <nav className="mt-4 px-4">
        <ul className="space-y-2">
          {menuData.map((menu) => (
            <li key={menu.id}>
              {menu.subMenu ? (
                <>
                  <button
                    onClick={() => handleToggle(menu.id)}
                    className="w-full flex items-center justify-between gap-2 py-2 font-semibold hover:text-green-400"
                  >
                    <span className="flex items-center gap-2">
                      {renderIcon(menu.icon)}
                      {menu.name}
                    </span>
                    <span>{openMenuId === menu.id ? "▲" : "▼"}</span>
                  </button>
                  {openMenuId === menu.id && (
                    <ul className="pl-6 space-y-1 text-gray-300">
                      {menu.subMenu.map((item) => (
                        <li key={item.id}>
                          <NavLink
                            to={item.route}
                            className="block hover:text-green-400"
                          >
                            • {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={menu.route}
                  className="flex items-center gap-2 py-2 hover:text-green-400"
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
