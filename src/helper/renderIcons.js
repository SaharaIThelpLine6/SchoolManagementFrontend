import React from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as TbIcons from "react-icons/tb";
import * as MdIcons from "react-icons/md";
import * as PiIcons from "react-icons/pi";
import * as IoIcons from "react-icons/io";
import * as GiIcons from "react-icons/gi";
import * as RiIcons from "react-icons/ri";
import * as LiaIcons from "react-icons/lia";
import * as ImIcons from "react-icons/im";
import * as HiIcons from "react-icons/hi";

export const renderIcons = (iconData, sizeClass = "text-2xl") => {
  const getIconComponent = (iconName) => {
    const prefix = iconName.slice(0, 2);
    switch (prefix) {
      case "Fa":
        return FaIcons[iconName];
      case "Fa6":
        return Fa6Icons[iconName];
      case "Tb":
        return TbIcons[iconName];
      case "Md":
        return MdIcons[iconName];
      case "Pi":
        return PiIcons[iconName];
      case "Io":
        return IoIcons[iconName];
      case "Gi":
        return GiIcons[iconName];
      case "Ri":
        return RiIcons[iconName];
      case "Li":
        return LiaIcons[iconName];
      case "Im":
        return ImIcons[iconName];
      case "Hi":
        return HiIcons[iconName];
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
