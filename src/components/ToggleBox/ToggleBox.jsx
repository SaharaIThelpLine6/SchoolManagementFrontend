const ToggleBox = ({ handleSelect }) => {
  const options = [
    "Power Distribution",
    "Change User Name",
    "Change Password",
    "Active User",
    "Inactive User",
    "Permission Type Change",
  ];

  return (
    <div className="w-[220px] h-[150px] border rounded-lg shadow-md p-3 overflow-y-auto bg-white">
      <div className="flex flex-col gap-1">
        {options.map((item, index) => (
          <span
            key={index}
            onClick={() => handleSelect(item)}
            className={`text-sm px-2 py-1 rounded cursor-pointer transition-colors duration-200 hover:bg-gray-100 text-gray-700`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ToggleBox;
