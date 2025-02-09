import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from 'react-hook-form';
import useTranslate from "../../../utils/Translate";

const DatePickerOne = ({ dateCalender, placeholder, registerKey, require, disable = false }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate()
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-black dark:text-white">
        {translate(dateCalender)}
      </label>

      <Controller
        name={registerKey}
        control={control}
        defaultValue={null}
        rules={{
          required: require ? require : false,
        }}
        render={({ field }) => (
          <Flatpickr
            disabled={disable}
            placeholder={placeholder}
            readOnly={true}
            options={{
              dateFormat: "Y-m-d",
            }}
            className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200"
            {...field}
          />
        )}
      />

      {errors[registerKey] && (
        <span className="text-red-500 text-sm">{errors[registerKey].message}</span>
      )}
      {/* <div className="relative">
        <Flatpickr   className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" />
      </div> */}
    </div>
  );
};

export default DatePickerOne;
