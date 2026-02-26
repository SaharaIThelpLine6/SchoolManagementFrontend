import { useState, useRef, useEffect } from "react";
import ToggleBox from "../../components/ToggleBox/ToggleBox";
import { showModal } from "../../utils/ModalControlar";
import { useUpdateLoginUserTypeChangeMutation } from "../../features/userType/userTypeSlice";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

const CustomTable = ({ columns, data, close }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [toggleStyle, setToggleStyle] = useState({});
  const containerRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const [updateLoginUserType] = useUpdateLoginUserTypeChangeMutation();

  const handleSelect = async (item) => {
    const id = selectedRow.ID;

    try {
      if (item === "Power Distribution") {
        showModal("Power Distribution", "POWER_DISTRIBUTION", id);
      } else if (item === "Change User Name") {
        showModal("Change User Name", "USER_NAME_CHANGE", id);
      } else if (item === "Change Password") {
        showModal("Change Password", "PASSWORD_CHANGE", id);
      } else if (item === "Admin User") {
        await updateLoginUserType({
          id,
          permissionTypeId: 5,
          school_id: Number(user?.schoolId),
        }).unwrap(); // RTK query unwrap for promise

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User role updated to Admin User",
        });

        // close nested toggle

        if (typeof close === "function") {
          close(null); // selectedRow clear
        }
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

        // close nested toggle

        if (typeof close === "function") {
          close(null); // selectedRow clear
        }
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

const handleRowClick = (row, e) => {
  e.stopPropagation();

  const containerRect = containerRef.current.getBoundingClientRect();
  const toggleBoxWidth = 200; // ToggleBox-এর আনুমানিক width
  const toggleBoxHeight = 150; // ToggleBox-এর আনুমানিক height
  const padding = 10; // extra gap

  let top = e.clientY - containerRect.top + 5;
  let left = e.clientX - containerRect.left;

  // ডানদিকে গেলে adjust করো
  if (left + toggleBoxWidth > containerRect.width) {
    left = containerRect.width - toggleBoxWidth - padding;
  }

  // নিচে গেলে adjust করো
  if (top + toggleBoxHeight > containerRect.height) {
    top = containerRect.height - toggleBoxHeight - padding;
  }

  setToggleStyle({ top, left });
  setSelectedRow(selectedRow?.ID === row.ID ? null : row);
};


  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSelectedRow(null); // Close toggle
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Scrollable wrapper */}
      <div className="overflow-x-auto w-full rounded-lg shadow-md bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr className="whitespace-nowrap">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="cursor-pointer hover:bg-gray-50 relative"
                onClick={(e) => handleRowClick(row, e)}
              >
                {columns.map((col, cidx) => (
                  <td
                    key={cidx}
                    className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {col.render ? col.render(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRow && (
        <div
          className="absolute  z-50"
          style={{
            top: toggleStyle.top,
            left: toggleStyle.left,
          }}
        >
          <ToggleBox handleSelect={handleSelect} />
        </div>
      )}
    </div>
  );
};

export default CustomTable;
