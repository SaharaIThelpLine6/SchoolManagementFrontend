import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import useTranslate from "../../../utils/Translate";

const TimePicker = ({
  timeCalender,
  placeholder,
  registerKey,
  require,
  disable = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  return (
    <div>
      <label
        className="mb-1 block text-black font-SolaimanLipi"
        htmlFor={registerKey}
      >
        {translate(timeCalender)} :
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
              noCalendar: true,
              enableTime: true,
              time_24hr: false,
              dateFormat: "h:i K",
              defaultDate: new Date("2025-05-25T12:57:00"), // Current time: 12:57 PM +06
            }}
            className={`w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition
              focus:border-custom-focus active:border-custom-focus
              disabled:cursor-not-allowed disabled:bg-slate-200 h-[38px]`}
            {...field}
          />
        )}
      />

      {errors[registerKey] && (
        <span className="text-red-500 text-sm">
          {errors[registerKey].message}
        </span>
      )}
    </div>
  );
};

export default TimePicker;
