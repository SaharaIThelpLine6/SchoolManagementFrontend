import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import useTranslate from "../../../utils/Translate";

const DatePickerOne = ({
  dateCalender,
  placeholder,
  registerKey,
  require,
  disable = false,
  labelPosition = "top", // 'top' or 'left'
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  return (
    <div className={`w-full ${labelPosition === "left" ? "flex items-center gap-4" : ""}`}>
      {/* Label */}
      {dateCalender && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${
            labelPosition === "left"
              ? "w-1/4 min-w-[100px] mb-0 text-end"
              : "mb-1 block"
          }`}
        >
          {translate(dateCalender)} :
        </label>
      )}

      {/* Date Picker */}
      <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
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
              className={`w-full rounded border-[1.5px] border-stroke bg-white py-1 px-4 text-black outline-none transition
                focus:border-custom-focus active:border-custom-focus
                disabled:cursor-not-allowed disabled:bg-slate-200 h-[38px]`}
              {...field}
            />
          )}
        />

        {errors[registerKey] && (
          <span className="text-red-500 text-sm mt-1">
            {errors[registerKey].message}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatePickerOne;
