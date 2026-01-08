import SvgIcon from '../icons/SvgIcon';

const ViewButton = ({ onClick, className = '' }) => {
  return (
    <button
      className={`
        p-2 flex justify-center items-center
        text-white
        bg-blue-500 hover:bg-blue-600
        rounded-md transition-colors
        ${className}
      `}
      title="View"
      onClick={onClick}
      type="button"
    >
      <SvgIcon name="FaEye" size={18} />
    </button>
  );
};

export default ViewButton;
