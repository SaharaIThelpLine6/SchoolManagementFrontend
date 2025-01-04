import Flatpickr from "react-flatpickr";
const DatePickerOne = () => {
  return (
    <div>
      <label className="mb-3 block text-sm font-medium text-black dark:text-white">
        জন্ম তারিখ :
      </label>
      <div className="relative">
        <Flatpickr options={{ minDate: "2017-01-01" }} className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" />
      </div>
    </div>
  );
};

export default DatePickerOne;
