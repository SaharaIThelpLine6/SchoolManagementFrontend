import SvgIcon from "../icons/SvgIcon";

const EditButton = ({ onClick, className = '' }) => {
  return (
    <button
      className={`p-2 flex justify-center items-center text-white bg-blue-500 hover:bg-blue-600 rounded-md ${className}`}
      title="Edit"
      onClick={onClick} 
    >
      <SvgIcon name="FiEdit" size={18} />
    </button>
  );
};

export default EditButton;
