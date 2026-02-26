import Flatpickr from "react-flatpickr";
import { Controller, useFormContext } from "react-hook-form";
import useTranslate from "../../../utils/Translate";
import "flatpickr/dist/themes/material_blue.css";

// বাংলা মাসের নাম (বাংলা ক্যালেন্ডার অনুযায়ী)
const banglaMonths = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র"
];

// বাংলা সপ্তাহের দিন
const banglaWeekdays = {
  shorthand: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহস্পতি", "শুক্র", "শনি"],
  longhand: [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার"
  ]
};

const BanglaDatePicker = ({
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
    <div
      className={`w-full ${
        labelPosition === "left" ? "flex items-center gap-4" : ""
      }`}
    >
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
          {translate(dateCalender)}
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
                locale: {
                  months: { shorthand: banglaMonths, longhand: banglaMonths },
                  weekdays: banglaWeekdays
                }
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



export default BanglaDatePicker