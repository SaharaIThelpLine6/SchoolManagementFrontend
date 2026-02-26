import React from "react";
import { useFormContext } from "react-hook-form";
import DefaultSelect from "../Forms/DefaultSelect";
import useTranslate from "../../utils/Translate";

const hijriDays = Array.from({ length: 31 }, (_, i) => ({
  id: i + 1,
  name: (i + 1).toString(),
}));

const hijriMonths = [
  { id: 1, name_bn: "মুহররম", name_en: "Muharram", name_ar: "مُحَرَّم" },
  { id: 2, name_bn: "সফর", name_en: "Safar", name_ar: "صَفَر" },
  { id: 3, name_bn: "রবিউল আউয়াল", name_en: "Rabi' al-awwal", name_ar: "رَبِيع ٱلْأَوَّل" },
  { id: 4, name_bn: "রবিউস সানি", name_en: "Rabi' al-thani", name_ar: "رَبِيع ٱلثَّانِي" },
  { id: 5, name_bn: "জুমাদাল আউয়াল", name_en: "Jumada al-awwal", name_ar: "جُمَادَىٰ ٱلْأَوَّل" },
  { id: 6, name_bn: "জুমাদাল থানি", name_en: "Jumada al-thani", name_ar: "جُمَادَىٰ ٱلثَّانِي" },
  { id: 7, name_bn: "রাজব", name_en: "Rajab", name_ar: "رَجَب" },
  { id: 8, name_bn: "শাবান", name_en: "Sha'ban", name_ar: "شَعْبَان" },
  { id: 9, name_bn: "রমজান", name_en: "Ramadan", name_ar: "رَمَضَان" },
  { id: 10, name_bn: "শাওয়াল", name_en: "Shawwal", name_ar: "شَوَّال" },
  { id: 11, name_bn: "যিলক্বদ", name_en: "Dhu al-Qi'dah", name_ar: "ذُو ٱلْقَعْدَة" },
  { id: 12, name_bn: "যিলহজ", name_en: "Dhu al-Hijjah", name_ar: "ذُو ٱلْحِجَّة" },
];


// Years 1400 to 1500 for example
const hijriYears = Array.from({ length: 101 }, (_, i) => ({
  id: 1400 + i,
  name: (1400 + i).toString(),
}));

const HijriDateFormatter = () => {
  const { watch } = useFormContext();
  const translate = useTranslate();

  const day = watch("hijriDay");
  const month = watch("hijriMonth");
  const year = watch("hijriYear");

  return (
    <div className="w-full max-w-md mx-auto">
      <label
          className={`font-SolaimanLipi mb-1 block text-black`}
        >
       {translate("Arabic Date") + " :"}
        </label>
      <div className="flex gap-3">
        <div className="flex-1">
          <DefaultSelect
            // label="Day"
            registerKey="hijriDay"
            options={hijriDays}
            valueField="id"
            nameField="name"
            require={{ value: true, message: "Day is required" }}
            type="number"
            defaultValue="Day"
          />
        </div>
        <div className="flex-1">
          <DefaultSelect
            // label="Month"
            registerKey="hijriMonth"
            options={hijriMonths}
            valueField="id"
            nameField="name_bn"
            require={{ value: true, message: "Month is required" }}
            type="number"
            defaultValue="Month"
          />
        </div>
        <div className="flex-1">
          <DefaultSelect
            // label="Year"
            registerKey="hijriYear"
            options={hijriYears}
            valueField="id"
            nameField="name"
            require={{ value: true, message: "Year is required" }}
            type="number"
            defaultValue="Years"
          />
        </div>
      </div>
    </div>
  );
};

export default HijriDateFormatter;
