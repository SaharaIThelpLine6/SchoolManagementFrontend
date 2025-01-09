import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from 'react-hook-form';

const DatePickerOne = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-black dark:text-white">
        জন্ম তারিখ :
      </label>

      <Controller
        name="DateOfBirth"
        control={control}
        defaultValue={null}
        render={({ field }) => (
          <Flatpickr
          options={{
            dateFormat: "Y-m-d",
          }}
            className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
            {...field}
          />
        )}
      />


      {/* <div className="relative">
        <Flatpickr   className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" />
      </div> */}
    </div>
  );
};

export default DatePickerOne;
