import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import "flatpickr/dist/flatpickr.min.css";

const DatePickerOne = ({
  dateCalender,
  placeholder,
  registerKey,
  require,
  disable = false,
  labelPosition = 'top',
  defaultValue = null,
  timestamp = false,
  timeFormat = 'H:i',
  useLocalTime = true
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const today = new Date();
  
  // ✅ Convert UTC string to local Date object
  const parseDateFromUTC = (dateValue) => {
    if (!dateValue) return null;
    
    // If it's a string with Z (UTC)
    if (typeof dateValue === 'string' && dateValue.includes('Z')) {
      const date = new Date(dateValue);
      // Convert UTC to local by adding timezone offset
      const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
      return localDate;
    }
    
    // If it's a string without Z
    if (typeof dateValue === 'string') {
      const parts = dateValue.split(/[- :]/);
      if (timestamp && parts.length >= 5) {
        return new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          parseInt(parts[3]),
          parseInt(parts[4])
        );
      } else if (parts.length >= 3) {
        return new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2])
        );
      }
    }
    
    return dateValue instanceof Date ? dateValue : new Date(dateValue);
  };

  // ✅ Convert local Date to UTC string for backend
  const formatToUTC = (date) => {
    if (!date) return null;
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    // Create UTC date string without timezone offset
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    if (timestamp) {
      // For datetime: send as UTC
      return new Date(Date.UTC(year, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())).toISOString();
    } else {
      // For date only: send as UTC date at midnight
      return new Date(Date.UTC(year, date.getMonth(), date.getDate())).toISOString();
    }
  };

  const initialDate = defaultValue ? parseDateFromUTC(defaultValue) : null;

  return (
    <div
      className={`w-full ${labelPosition === 'left' ? 'flex items-center gap-4' : ''}`}
    >
      {dateCalender && (
        <label
          htmlFor={registerKey}
          className={`text-black font-SolaimanLipi ${labelPosition === 'left'
              ? 'w-1/4 min-w-[100px] mb-0 text-end'
              : 'mb-1 block'
            }`}
        >
          {translate(dateCalender)} :
        </label>
      )}

      <div className={labelPosition === 'left' ? 'flex-1' : 'w-full'}>
        <Controller
          name={registerKey}
          control={control}
          defaultValue={initialDate}
          rules={{
            required: require ? 'এই ফিল্ডটি প্রয়োজনীয়' : false,
          }}
          render={({ field: { onChange, value } }) => (
            <Flatpickr
              disabled={disable}
              value={value}
              onChange={(dates) => {
                const selectedDate = dates[0];
                if (selectedDate) {
                  if (timestamp) {
                    // For timestamp: store as UTC
                    const utcDate = new Date(Date.UTC(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      selectedDate.getHours(),
                      selectedDate.getMinutes()
                    ));
                    onChange(utcDate);
                  } else {
                    // For date only: store as UTC date at midnight
                    const utcDate = new Date(Date.UTC(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    ));
                    onChange(utcDate);
                  }
                } else {
                  onChange(null);
                }
              }}
              placeholder={placeholder ?? today.toISOString().split('T')[0]}
              options={{
                enableTime: timestamp,
                noCalendar: false,
                time_24hr: timeFormat === 'H:i',
                dateFormat: timestamp ? "Y-m-d H:i" : "Y-m-d",
                // ✅ Use local timezone for display
                timezone: useLocalTime ? 'local' : 'UTC',
                // ✅ Format date in local time for display
                formatDate: (date) => {
                  if (timestamp) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    return `${year}-${month}-${day} ${hours}:${minutes}`;
                  }
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                },
                // ✅ Parse date string in local time
                parseDate: (dateStr) => {
                  if (!dateStr) return null;
                  const parts = dateStr.split(/[- :]/);
                  if (timestamp && parts.length >= 5) {
                    return new Date(
                      parseInt(parts[0]),
                      parseInt(parts[1]) - 1,
                      parseInt(parts[2]),
                      parseInt(parts[3]),
                      parseInt(parts[4])
                    );
                  } else if (parts.length >= 3) {
                    return new Date(
                      parseInt(parts[0]),
                      parseInt(parts[1]) - 1,
                      parseInt(parts[2])
                    );
                  }
                  return null;
                }
              }}
              className={`w-full rounded border-[1.5px] border-stroke bg-white py-1 px-4 text-black outline-none transition
    focus:border-custom-focus active:border-custom-focus
    disabled:cursor-not-allowed disabled:bg-slate-200 h-[38px]`}
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