import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import "flatpickr/dist/flatpickr.min.css";

const TimePicker = ({
  timeCalender,
  placeholder,
  registerKey,
  require,
  disable = false,
  defaultValue = null,
  timeFormat = '12h', // '12h' or '24h'
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  // Parse the time string and create a Date object at a fixed date
  const parseTimeString = (timeValue) => {
    if (!timeValue) return null;
    
    // If it's a UTC ISO string
    if (typeof timeValue === 'string') {
      const date = new Date(timeValue);
      if (!isNaN(date.getTime())) {
        // Extract hours and minutes from the UTC time
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        // Create a new date with the same time but at a fixed date
        return new Date(2000, 0, 1, hours, minutes);
      }
    }
    
    return timeValue instanceof Date ? timeValue : null;
  };

  // Format date for display
  const formatTimeForDisplay = (date) => {
    if (!date) return '';
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (timeFormat === '24h') {
      const h = String(hours).padStart(2, '0');
      return `${h}:${minutes}`;
    } else {
      const h = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${h}:${minutes} ${ampm}`;
    }
  };

  const initialDate = defaultValue ? parseTimeString(defaultValue) : null;

  // Get date format for Flatpickr
  const getDateFormat = () => {
    return timeFormat === '24h' ? "H:i" : "h:i K";
  };

  return (
    <div>
      {timeCalender ? (
        <label
          className="mb-1 block text-black font-SolaimanLipi"
          htmlFor={registerKey}
        >
          {translate(timeCalender)} :
        </label>
      ) : null}

      <Controller
        name={registerKey}
        control={control}
        defaultValue={initialDate}
        rules={{
          required: require ? require : false,
        }}
        render={({ field: { onChange, value } }) => (
          <Flatpickr
            disabled={disable}
            placeholder={placeholder || "Select time"}
            value={value}
            onChange={(dates) => {
              const selectedDate = dates[0];
              if (selectedDate) {
                // ✅ Keep the exact time - just store the hours and minutes
                // Create a date object with the selected time but no timezone conversion
                const hours = selectedDate.getHours();
                const minutes = selectedDate.getMinutes();
                
                // Store as a date object with the exact time (no timezone offset)
                const timeOnly = new Date(2000, 0, 1, hours, minutes);
                onChange(timeOnly);
              } else {
                onChange(null);
              }
            }}
            options={{
              enableTime: true,
              noCalendar: true,
              time_24hr: timeFormat === '24h',
              dateFormat: getDateFormat(),
              minuteIncrement: 1,
              defaultHour: 0,
              defaultMinute: 0,
              // ✅ Keep time in local format without conversion
              formatDate: (date) => {
                if (!date) return '';
                const hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                
                if (timeFormat === '24h') {
                  const h = String(hours).padStart(2, '0');
                  return `${h}:${minutes}`;
                } else {
                  const h = hours % 12 || 12;
                  const ampm = hours >= 12 ? 'PM' : 'AM';
                  return `${h}:${minutes} ${ampm}`;
                }
              }
            }}
            className={`w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition
              focus:border-custom-focus active:border-custom-focus
              disabled:cursor-not-allowed disabled:bg-slate-200 h-[38px]`}
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