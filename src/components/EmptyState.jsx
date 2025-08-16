import useTranslate from "../utils/Translate";
import SvgIcon from "./icons/SvgIcon";

const EmptyState = ({
  message,
  className = "",
  iconSize = 48,
  iconColor = "text-gray-400",
  buttonText,
  onButtonClick,
}) => {
  const translate = useTranslate();

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <SvgIcon name={"FiFileText"} size={iconSize} className={iconColor} />
      <h3 className="text-lg font-medium text-gray-700 mb-2 font-SolaimanLipi">
        {message || translate("No data available")}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md font-SolaimanLipi">
        {translate("There are currently no items to display.")}
      </p>
      {buttonText && (
        <button
          type="button"
          onClick={onButtonClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
