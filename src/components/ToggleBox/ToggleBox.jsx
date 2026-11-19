import { useState } from "react";
import { useSelector } from "react-redux";
import useTranslate from "../../utils/Translate";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const iconProps = {
  width: 17,
  height: 17,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "shrink-0",
};

const BoltIcon = () => (
  <svg {...iconProps}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const UserIcon = () => (
  <svg {...iconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const KeyIcon = () => (
  <svg {...iconProps}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m10.7 12.3 9.3-9.3" />
    <path d="m16 7 3 3" />
    <path d="m14 9 2 2" />
  </svg>
);

const ShieldIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
      }`}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

// ---------------------------------------------------------------------------
// Icon Mapping — Always use original English keys
// ---------------------------------------------------------------------------
const ICONS = {
  "Permission Management": <BoltIcon />,
  "Change User Name": <UserIcon />,
  "Password Change": <KeyIcon />,
  "Permission Type Change": <ShieldIcon />,
};

const SUB_ICONS = {
  "Admin User": <ShieldIcon />,
  User: <UserIcon />,
};

// ---------------------------------------------------------------------------
// ToggleBox
// ---------------------------------------------------------------------------
const ToggleBox = ({ handleSelect, row }) => {
  const { user } = useSelector((state) => state.auth);
  const permissionType = user?.permissionType;
  const t = useTranslate();

  const options = [
    "Permission Management",
    "Change User Name",
    "Password Change",
    "Permission Type Change",
  ];

  const options2 = ["Change User Name", "Password Change"];

  const allowedOptions =
    permissionType === 6
      ? options2
      : [1, 2, 3, 4, 5].includes(permissionType)
        ? options
        : [];

  const [nestedOpen, setNestedOpen] = useState(false);

  const nestedOptions = ["Admin User", "User"];

  const itemBase =
    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-gray-700 transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:bg-indigo-50 focus-visible:text-indigo-700";

  return (
    <div
      className="w-[250px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5"
      role="menu"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-4 py-2.5">
        <p className="truncate text-[13px] font-bold text-white">
          {row?.Name || "User"}
        </p>

        {row?.Code || row?.LoginName ? (
          <p className="truncate text-[11px] text-indigo-100">
            {[row?.Code, row?.LoginName].filter(Boolean).join(" • ")}
          </p>
        ) : null}
      </div>

      {/* Menu Items */}
      <div className="flex flex-col gap-0.5 p-1.5">
        {allowedOptions.length === 0 ? (
          <p className="px-3 py-3 text-center text-[12px] text-gray-400">
            No actions available
          </p>
        ) : null}

        {allowedOptions.map((item) => {
          const isNested = item === "Permission Type Change";

          return (
            <div
              key={item}
              onMouseEnter={() => isNested && setNestedOpen(true)}
              onMouseLeave={() => isNested && setNestedOpen(false)}
            >
              <button
                type="button"
                role="menuitem"
                // ইংরেজি key পাঠানো হচ্ছে (translated নাম নয়)
                onClick={() =>
                  isNested ? setNestedOpen((v) => !v) : handleSelect(item)
                }
                className={`${itemBase} ${isNested && nestedOpen ? "bg-indigo-50 text-indigo-700" : ""
                  }`}
              >
                {/* Icon */}
                <span className="text-gray-400 transition-colors group-hover:text-indigo-600">
                  {ICONS[item]}
                </span>

                {/* Translated Label (শুধু দেখানোর জন্য) */}
                <span className="flex-1 truncate">{t(item)}</span>

                {isNested ? <ChevronIcon open={nestedOpen} /> : null}
              </button>

              {/* Nested Menu */}
              {isNested && nestedOpen ? (
                <div className="mb-1 ml-5 mt-0.5 flex flex-col gap-0.5 border-l-2 border-indigo-200 pl-2">
                  {nestedOptions.map((subItem) => (
                    <button
                      key={subItem}
                      type="button"
                      role="menuitem"
                      // ইংরেজি key পাঠানো হচ্ছে
                      onClick={() => handleSelect(subItem)}
                      className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-[13px] font-medium text-gray-600 transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:bg-indigo-50"
                    >
                      {/* Sub Icon */}
                      <span className="text-gray-400 group-hover:text-indigo-600">
                        {SUB_ICONS[subItem]}
                      </span>

                      {/* Translated Sub Label (শুধু দেখানোর জন্য) */}
                      <span className="truncate">{t(subItem)}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToggleBox;

// import { useSelector } from "react-redux";
// import { useState } from "react";

// const ToggleBox = ({ handleSelect }) => {
//   const { user } = useSelector((state) => state.auth);
//   const permissionType = user?.permissionType;

//   const options = [
//     "Power Distribution",
//     "Change User Name",
//     "Change Password",
//     "Permission Type Change",
//   ];

//   const options2 = ["Change User Name", "Change Password"];

//   const allowedOptions =
//     permissionType === 6
//       ? options2
//       : [1, 2, 3, 4, 5].includes(permissionType)
//       ? options
//       : [];

//   const [nestedOpen, setNestedOpen] = useState(false);

//   const nestedOptions = ["Admin User", "User"]; // nested options

//   return (
//     <div className="w-[250px] border rounded-lg shadow-md p-3 overflow-y-auto bg-white">
//       <div className="flex flex-col gap-1">
//         {allowedOptions.map((item, index) => (
//           <div
//             key={index}
//             onMouseEnter={() =>
//               item === "Permission Type Change" && setNestedOpen(true)
//             }
//             onMouseLeave={() =>
//               item === "Permission Type Change" && setNestedOpen(false)
//             }
//             className="relative"
//           >
//             <span
//               onClick={() =>
//                 item !== "Permission Type Change" && handleSelect(item)
//               }
//               className="flex justify-between items-center text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-100 text-gray-700"
//             >
//               {item}

//               {/* Arrow for nested menu */}
//               {item === "Permission Type Change" && (
//                 <span
//                   className={`inline-block ml-2 transition-transform duration-200 ${
//                     nestedOpen ? "rotate-180" : "rotate-0"
//                   }`}
//                 >
//                   ▼
//                 </span>
//               )}
//             </span>

//             {/* Nested toggle on hover */}
//             {nestedOpen && item === "Permission Type Change" && (
//               <div className="ml-4 mt-1 flex flex-col gap-1">
//                 {nestedOptions.map((subItem, subIndex) => (
//                   <span
//                     key={subIndex}
//                     onClick={() => handleSelect(subItem)}
//                     className="text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-200 text-gray-600"
//                   >
//                     {subItem}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ToggleBox;
