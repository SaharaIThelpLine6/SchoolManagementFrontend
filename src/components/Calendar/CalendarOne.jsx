import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarStyles.css";
import useTranslate from "../../utils/Translate";

const CalendarComponent = () => {
  const translate = useTranslate();
  const [value, setValue] = useState(new Date("2025-06-01")); // Set to June 2025 as shown

  return (
    <div className="w-full  h-[450px] mx-auto mt-6 p-4 bg-white rounded-lg shadow-md flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 text-center mb-4">
        {translate("Calendar")}
      </h2>
      <div className="flex-1 flex items-center justify-center">
        <Calendar
          onChange={setValue}
          value={value}
          className="w-full h-full p-2 rounded-md border-0"
          tileClassName="custom-tile" // Custom class for tile styling
        />
      </div>
    </div>
  );
};

export default CalendarComponent;
