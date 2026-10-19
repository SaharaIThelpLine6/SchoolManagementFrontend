import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import PropTypes from 'prop-types';
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
  minDate,
  maxDate,
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

    if (typeof dateValue === 'string' && dateValue.includes('Z')) {
      const date = new Date(dateValue);
      const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
      return localDate;
    }

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

  const initialDate = defaultValue ? parseDateFromUTC(defaultValue) : null;
  const hasError = errors[registerKey];

  return (
    <div
      className={`w-full ${labelPosition === 'left' ? 'flex items-center gap-4' : ''}`}
    >
      {dateCalender && (
        <label
          htmlFor={registerKey}
          className={`text-black font-bold text-sm ${labelPosition === 'left'
            ? 'w-1/4 min-w-[100px] mb-0 text-end'
            : 'mb-1 block'
            }`}
        >
          {translate(dateCalender)}
          {require && <span className="text-red-500 ml-1">*</span>} :
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

            <div className="relative">
              <Flatpickr
                disabled={disable}
                value={value}
                onChange={(dates) => {
                  const selectedDate = dates[0];

                  if (selectedDate) {
                    if (timestamp) {
                      const utcDate = new Date(
                        Date.UTC(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate(),
                          selectedDate.getHours(),
                          selectedDate.getMinutes()
                        )
                      );
                      onChange(utcDate);
                    } else {
                      const utcDate = new Date(
                        Date.UTC(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate()
                        )
                      );
                      onChange(utcDate);
                    }
                  } else {
                    onChange(null);
                  }
                }}
                placeholder={placeholder ?? today.toISOString().split("T")[0]}
                options={{
                  enableTime: timestamp,
                  noCalendar: false,
                  minDate,
                  maxDate,
                  time_24hr: timeFormat === "H:i",
                  dateFormat: timestamp ? "Y-m-d H:i" : "Y-m-d",
                  timezone: useLocalTime ? "local" : "UTC",
                  formatDate: (date) => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const day = String(date.getDate()).padStart(2, "0");

                    if (timestamp) {
                      const hours = String(date.getHours()).padStart(2, "0");
                      const minutes = String(date.getMinutes()).padStart(2, "0");
                      return `${year}-${month}-${day} ${hours}:${minutes}`;
                    }

                    return `${year}-${month}-${day}`;
                  },
                }}
                className={`w-full font-default rounded-lg border text-sm h-11 pl-3 pr-10 outline-none transition-all duration-200 ease-in-out bg-white text-gray-900
      ${hasError
                    ? "border-red-500 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-gray-400"
                  }
      disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-gray-500
    `}
              />

              <button
                type="button"
                disabled={disable}
                onClick={(e) => {
                  const input = e.currentTarget.parentElement.querySelector("input");
                  if (input && !disable) {
                    input.focus();
                    input._flatpickr?.open();
                  }
                }}
                aria-label="Open calendar"
                className="absolute right-3 top-1/2 -translate-y-1/2
      text-gray-500 hover:text-blue-600
      disabled:cursor-not-allowed disabled:opacity-50
      transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={22}
                  height={22}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                >
                  <path
                    stroke="none"
                    d="M0 0h24v24H0z"
                    fill="none"
                  />
                  <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12" />
                  <path d="M16 3v4" />
                  <path d="M8 3v4" />
                  <path d="M4 11h16" />
                  <path d="M11 15h1" />
                  <path d="M12 15v3" />
                </svg>
              </button>
            </div>

          )}
        />

        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1.5 font-default animate-fade-in">
            {errors[registerKey].message}
          </p>
        )}
      </div>
    </div>
  );
};

DatePickerOne.propTypes = {
  dateCalender: PropTypes.string,
  placeholder: PropTypes.string,
  registerKey: PropTypes.string.isRequired,
  require: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  disable: PropTypes.bool,
  labelPosition: PropTypes.oneOf(['top', 'left']),
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  minDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  maxDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Date),
  ]),
  timestamp: PropTypes.bool,
  timeFormat: PropTypes.string,
  useLocalTime: PropTypes.bool,
};

export default DatePickerOne;