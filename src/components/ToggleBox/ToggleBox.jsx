import { useSelector } from "react-redux";

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

  // 🔹 Logic: যদি 6 হয় → options2, নাহলে options
  const allowedOptions =
    permissionType === 6
      ? options2
      : [1, 2, 3, 4, 5].includes(permissionType)
      ? options
      : [];

  return (
    <div className="w-[220px] h-[150px] border rounded-lg shadow-md p-3 overflow-y-auto bg-white">
      <div className="flex flex-col gap-1">
        {allowedOptions.map((item, index) => (
          <span
            key={index}
            onClick={() => handleSelect(item)}
            className="text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-100 text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ToggleBox;
