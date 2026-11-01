import React, { useMemo, useState } from "react";

const WEEK_DAYS = [
  "শনি",
  "রবি",
  "সোম",
  "মঙ্গল",
  "বুধ",
  "বৃহস্পতিবার",
  "শুক্র",
];

const toISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toBanglaNumber = (number) =>
  number.toLocaleString("bn-BD");

const CustomCalendar = ({
  holidays = [],
  initialSelectedDates = [],
  onChange,
  onDateSelect,
  selectionMode = "multiple",
  initialMonth = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1)
  );

  const [selectedDates, setSelectedDates] = useState(
    initialSelectedDates
  );

  const today = toISODate(new Date());

  // Month title
  const monthTitle = new Intl.DateTimeFormat("bn-BD", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  // Calendar dates
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Saturday = 0, Sunday = 1 ... Friday = 6
    const startOffset = (firstDay.getDay() + 1) % 7;

    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - startOffset + 1;

      if (dayNumber < 1 || dayNumber > totalDays) {
        return null;
      }

      const date = new Date(year, month, dayNumber);

      return {
        date,
        day: dayNumber,
        iso: toISODate(date),
        isFriday: date.getDay() === 5,
      };
    });
  }, [currentMonth]);

  // Previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  };

  // Next month
  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  };

  // Select date
  const handleDateClick = (date) => {
    let updatedDates;

    if (selectionMode === "single") {
      updatedDates = selectedDates.includes(date)
        ? []
        : [date];
    } else {
      updatedDates = selectedDates.includes(date)
        ? selectedDates.filter((item) => item !== date)
        : [...selectedDates, date];
    }

    setSelectedDates(updatedDates);

    onChange?.(updatedDates);
    onDateSelect?.(date, updatedDates);
  };

  const isHoliday = (date) => holidays.includes(date);

  const getDayClass = (item) => {
    const selected = selectedDates.includes(item.iso);
    const holiday = isHoliday(item.iso);
    const isToday = item.iso === today;

    let classes =
      "relative flex h-11 w-full items-center justify-center rounded-xl border text-base font-semibold transition-all duration-150 font-solaimanLipi";

    if (selected) {
      classes +=
        " bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-800";
    } else if (holiday) {
      classes +=
        " bg-[#FFF1C5] border-[#EAB64A] text-[#95600D] hover:bg-[#FFE8A0]";
    } else {
      classes +=
        " bg-white border-[#DCE1E7] text-gray-800 hover:bg-blue-50 hover:border-blue-300";
    }

    if (isToday) {
      classes +=
        " !border-2 !border-blue-600";
    }

    if (item.isFriday && !selected) {
      classes += " !text-red-600";
    }

    return classes;
  };

  return (
    <div className="w-full max-w-[600px] h-[450px] 2xl:h-[580px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 sm:p-4">

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">

        <button
          type="button"
          onClick={handlePreviousMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100"
          aria-label="Previous month"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {monthTitle}
        </h3>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-100"
          aria-label="Next month"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

      </div>

      {/* Week Days */}
      <div className="mb-2 grid grid-cols-7 gap-1">

        {WEEK_DAYS.map((day, index) => (
          <div
            key={day}
            className={`flex h-7 items-center justify-center text-xs font-semibold sm:text-sm ${index === 6 ? "text-red-600" : "text-gray-600"
              }`}
          >
            {day}
          </div>
        ))}

      </div>

      {/* Calendar Dates */}
      <div className="grid grid-cols-7 gap-1">

        {calendarDays.map((item, index) => {

          if (!item) {
            return (
              <div
                key={`empty-${index}`}
                className="h-11"
              />
            );
          }

          return (
            <button
              key={item.iso}
              type="button"
              onClick={() => handleDateClick(item.iso)}
              className={getDayClass(item)}
              aria-label={item.iso}
              aria-pressed={selectedDates.includes(item.iso)}
            >
              {toBanglaNumber(item.day)}
            </button>
          );
        })}

      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3">

        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-700" />
          <span className="text-xs text-gray-600">
            বাছাই করা
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-[#EAB64A] bg-[#FFF1C5]" />
          <span className="text-xs text-gray-600">
            আগে থেকে ছুটি
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-blue-600 bg-white" />
          <span className="text-xs text-gray-600">
            আজ
          </span>
        </div>

      </div>

    </div>
  );
};

export default CustomCalendar;