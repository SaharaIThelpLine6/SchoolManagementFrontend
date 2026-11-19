import { useState, useRef, useEffect, useCallback } from "react";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import { showModal } from "../../utils/ModalControlar";
import { useUpdateLoginUserTypeChangeMutation } from "../../features/userType/userTypeSlice";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const MENU_W = 250;
const MENU_H = 290; // নিচে জায়গা কম থাকলে মেনু উপরের দিকে খুলবে
const GAP = 6;
const EDGE = 8;

const ThreeDotsIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </svg>
);

const CustomTable = ({ columns, data, close, showActions = true }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const menuRef = useRef(null);
  const selectedRowRef = useRef(null); // handleSelect এর জন্য সবসময় সর্বশেষ row
  const { user } = useSelector((state) => state.auth);

  const [updateLoginUserType] = useUpdateLoginUserTypeChangeMutation();

  const closeMenu = useCallback(() => {
    setSelectedRow(null);
    setMenuPos(null);
  }, []);

  // item এখন ToggleBox থেকে ইংরেজি key হিসেবে আসে
  const handleSelect = async (item) => {
    const id = selectedRowRef.current?.ID;
    if (!id) return;

    try {
      if (item === "Permission Management") {
        showModal("Power Distribution", "POWER_DISTRIBUTION", id);
        closeMenu();
      } else if (item === "Change User Name") {
        showModal("Change User Name", "USER_NAME_CHANGE", id);
        closeMenu();
      } else if (item === "Password Change") {
        showModal("Change Password", "PASSWORD_CHANGE", id);
        closeMenu();
      } else if (item === "Admin User") {
        await updateLoginUserType({
          id,
          permissionTypeId: 5,
          school_id: Number(user?.schoolId),
        }).unwrap();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User role updated to Admin User",
        });

        closeMenu();
        if (typeof close === "function") close(null);
      } else if (item === "User") {
        await updateLoginUserType({
          id,
          permissionTypeId: 6,
          school_id: Number(user?.schoolId),
        }).unwrap();

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User role updated to User",
        });

        closeMenu();
        if (typeof close === "function") close(null);
      }
    } catch (error) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.data?.error || "User role update failed",
      });
    }
  };

  // তিন-ডটে ক্লিক — বাটনের ঠিক নিচে (বা জায়গা না থাকলে উপরে) মেনু বসবে
  const handleDotClick = (row, e) => {
    e.stopPropagation();

    // একই ইউজারের ডটে আবার ক্লিক করলে বন্ধ
    if (selectedRow?.ID === row.ID) {
      closeMenu();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    let left = rect.right - MENU_W;
    if (left < EDGE) left = EDGE;
    if (left + MENU_W > window.innerWidth - EDGE) {
      left = window.innerWidth - MENU_W - EDGE;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < MENU_H && rect.top > spaceBelow;

    setMenuPos(
      openUp
        ? { left, bottom: window.innerHeight - rect.top + GAP }
        : { left, top: rect.bottom + GAP }
    );
    selectedRowRef.current = row;
    setSelectedRow(row);
  };

  // মেনুর বাইরে ক্লিক / Esc / স্ক্রল / রিসাইজ — মেনু বন্ধ
  useEffect(() => {
    if (!selectedRow) return undefined;

    const isInside = (event, el) => {
      if (!el) return false;
      const path = event.composedPath ? event.composedPath() : [];
      return path.includes(el) || el.contains(event.target);
    };

    const onOutside = (event) => {
      // মেনুর ভেতরে ক্লিক হলে বন্ধ হবে না
      if (isInside(event, menuRef.current)) return;

      // তিন-ডট বাটনের ক্লিক handleDotClick নিজেই toggle করবে
      const path = event.composedPath ? event.composedPath() : [];
      const onTrigger = path.some(
        (el) => el?.dataset && el.dataset.actionsTrigger
      );
      if (onTrigger) return;

      closeMenu();
    };

    const onKey = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const onScroll = (event) => {
      if (isInside(event, menuRef.current)) return;
      closeMenu();
    };

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [selectedRow, closeMenu]);

  return (
    <div className="relative w-full">
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="whitespace-nowrap border-b border-gray-200">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 text-left text-[13px] font-semibold text-gray-600"
                >
                  {col.title}
                </th>
              ))}
              {showActions ? (
                <th className="w-[60px] px-4 py-3 text-center text-[13px] font-semibold text-gray-600" />
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-[14px] font-medium text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : null}

            {data.map((row, idx) => {
              const active = selectedRow?.ID === row.ID;
              return (
                <tr
                  key={row.ID ?? idx}
                  className={`transition-colors ${active ? "bg-indigo-50/70" : "hover:bg-indigo-50/40"
                    }`}
                >
                  {columns.map((col, cidx) => (
                    <td
                      key={cidx}
                      className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                    >
                      {col.render ? col.render(row) : row[col.field]}
                    </td>
                  ))}

                  {showActions ? (
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        data-actions-trigger="true"
                        onClick={(e) => handleDotClick(row, e)}
                        aria-label="Actions"
                        aria-haspopup="menu"
                        aria-expanded={active}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${active
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-gray-500 hover:bg-indigo-100 hover:text-indigo-700"
                          }`}
                      >
                        <ThreeDotsIcon />
                      </button>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRow && menuPos ? (
        <div className="fixed z-[70]" style={menuPos} ref={menuRef}>
          <ToggleBox handleSelect={handleSelect} row={selectedRow} />
        </div>
      ) : null}
    </div>
  );
};

export default CustomTable;

// import { useState, useRef, useEffect } from "react";
// import ToggleBox from "../../components/ToggleBox/ToggleBox";
// import { showModal } from "../../utils/ModalControlar";
// import { useUpdateLoginUserTypeChangeMutation } from "../../features/userType/userTypeSlice";
// import { useSelector } from "react-redux";
// import Swal from "sweetalert2";

// const CustomTable = ({ columns, data, close }) => {
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [toggleStyle, setToggleStyle] = useState({});
//   const containerRef = useRef(null);
//   const { user } = useSelector((state) => state.auth);

//   const [updateLoginUserType] = useUpdateLoginUserTypeChangeMutation();

//   const handleSelect = async (item) => {
//     const id = selectedRow.ID;

//     try {
//       if (item === "Power Distribution") {
//         showModal("Power Distribution", "POWER_DISTRIBUTION", id);
//       } else if (item === "Change User Name") {
//         showModal("Change User Name", "USER_NAME_CHANGE", id);
//       } else if (item === "Change Password") {
//         showModal("Change Password", "PASSWORD_CHANGE", id);
//       } else if (item === "Admin User") {
//         await updateLoginUserType({
//           id,
//           permissionTypeId: 5,
//           school_id: Number(user?.schoolId),
//         }).unwrap(); // RTK query unwrap for promise

//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: "User role updated to Admin User",
//         });

//         // close nested toggle

//         if (typeof close === "function") {
//           close(null); // selectedRow clear
//         }
//       } else if (item === "User") {
//         await updateLoginUserType({
//           id,
//           permissionTypeId: 6,
//           school_id: Number(user?.schoolId),
//         }).unwrap();

//         Swal.fire({
//           icon: "success",
//           title: "Success",
//           text: "User role updated to User",
//         });

//         // close nested toggle

//         if (typeof close === "function") {
//           close(null); // selectedRow clear
//         }
//       }
//     } catch (error) {
//       console.error("Update Error:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error?.data?.error || "User role update failed",
//       });
//     }
//   };

// const handleRowClick = (row, e) => {
//   e.stopPropagation();

//   const containerRect = containerRef.current.getBoundingClientRect();
//   const toggleBoxWidth = 200; // ToggleBox-এর আনুমানিক width
//   const toggleBoxHeight = 150; // ToggleBox-এর আনুমানিক height
//   const padding = 10; // extra gap

//   let top = e.clientY - containerRect.top + 5;
//   let left = e.clientX - containerRect.left;

//   // ডানদিকে গেলে adjust করো
//   if (left + toggleBoxWidth > containerRect.width) {
//     left = containerRect.width - toggleBoxWidth - padding;
//   }

//   // নিচে গেলে adjust করো
//   if (top + toggleBoxHeight > containerRect.height) {
//     top = containerRect.height - toggleBoxHeight - padding;
//   }

//   setToggleStyle({ top, left });
//   setSelectedRow(selectedRow?.ID === row.ID ? null : row);
// };


//   // Click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target)
//       ) {
//         setSelectedRow(null); // Close toggle
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="relative w-full" ref={containerRef}>
//       {/* Scrollable wrapper */}
//       <div className="overflow-x-auto w-full rounded-lg shadow-md bg-white">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-100">
//             <tr className="whitespace-nowrap">
//               {columns.map((col, idx) => (
//                 <th
//                   key={idx}
//                   className="px-4 py-2 text-left text-sm font-medium text-gray-700"
//                 >
//                   {col.title}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {data.map((row, idx) => (
//               <tr
//                 key={idx}
//                 className="cursor-pointer hover:bg-gray-50 relative"
//                 onClick={(e) => handleRowClick(row, e)}
//               >
//                 {columns.map((col, cidx) => (
//                   <td
//                     key={cidx}
//                     className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap"
//                   >
//                     {col.render ? col.render(row) : row[col.field]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {selectedRow && (
//         <div
//           className="absolute  z-50"
//           style={{
//             top: toggleStyle.top,
//             left: toggleStyle.left,
//           }}
//         >
//           <ToggleBox handleSelect={handleSelect} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default CustomTable;
