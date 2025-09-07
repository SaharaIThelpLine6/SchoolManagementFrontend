import SvgIcon from '../icons/SvgIcon';

const DeleteButton = ({ onClick, className = '' }) => {
  return (
    <button
      className={`p-2 flex justify-center items-center text-white bg-red-500 hover:bg-red-600 rounded-md ${className}`}
      title="Delete"
      onClick={onClick} 
      type='button'
    >
      <SvgIcon name="FaTrash" size={18} />
    </button>
  );
};

export default DeleteButton;
