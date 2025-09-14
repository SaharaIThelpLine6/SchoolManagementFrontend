import { useSelector } from "react-redux";
import { useState } from "react";

const ToggleBox = ({ handleSelect }) => {
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;

  const options = [
    "Power Distribution",
    "Change User Name",
    "Change Password",
    "Permission Type Change",
  ];

  const options2 = ["Change User Name", "Change Password"];

  const allowedOptions =
    permissionType === 6
      ? options2
      : [1, 2, 3, 4, 5].includes(permissionType)
      ? options
      : [];

  const [nestedOpen, setNestedOpen] = useState(false);

  const nestedOptions = ["Admin User", "User"]; // nested options

  return (
    <div className="w-[250px] border rounded-lg shadow-md p-3 overflow-y-auto bg-white">
      <div className="flex flex-col gap-1">
        {allowedOptions.map((item, index) => (
          <div
            key={index}
            onMouseEnter={() =>
              item === "Permission Type Change" && setNestedOpen(true)
            }
            onMouseLeave={() =>
              item === "Permission Type Change" && setNestedOpen(false)
            }
            className="relative"
          >
            <span
              onClick={() =>
                item !== "Permission Type Change" && handleSelect(item)
              }
              className="flex justify-between items-center text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-100 text-gray-700"
            >
              {item}

              {/* Arrow for nested menu */}
              {item === "Permission Type Change" && (
                <span
                  className={`inline-block ml-2 transition-transform duration-200 ${
                    nestedOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ▼
                </span>
              )}
            </span>

            {/* Nested toggle on hover */}
            {nestedOpen && item === "Permission Type Change" && (
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {nestedOptions.map((subItem, subIndex) => (
                  <span
                    key={subIndex}
                    onClick={() => handleSelect(subItem)}
                    className="text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-200 text-gray-600"
                  >
                    {subItem}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToggleBox;
