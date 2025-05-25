import React from "react";
import * as FaIcons from "react-icons/fa";
import * as TbIcons from "react-icons/tb";
import * as MdIcons from "react-icons/md";

export const renderIcons = (iconData, sizeClass = "text-2xl") => {
  const getIconComponent = (iconName) => {
    const prefix = iconName.slice(0, 2);
    switch (prefix) {
      case "Fa":
        return FaIcons[iconName];
      case "Tb":
        return TbIcons[iconName];
      case "Md":
        return MdIcons[iconName];
      default:
        return null;
    }
  };

  if (Array.isArray(iconData)) {
    return iconData.map((iconName, index) => {
      const IconComponent = getIconComponent(iconName);
      return IconComponent
        ? React.createElement(IconComponent, {
            key: index,
            className: sizeClass,
          })
        : null;
    });
  } else {
    const IconComponent = getIconComponent(iconData);
    return IconComponent
      ? React.createElement(IconComponent, { className: sizeClass })
      : null;
  }
};
