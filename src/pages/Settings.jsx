import { useState, useEffect } from "react";
import {
  useGetReportSettingQuery,
  usePostReportSettingMutation,
} from "../features/exam/examQuerySlice";
import Swal from "sweetalert2";
import { debounce } from "../utils/debounce";
import useTranslate from "../utils/Translate";

const settingConfig = [
  {
    label: "Test condition type",
    name: "SettingColumn1",
    options: ["Average based", "Point based"],
    values: [1, 0],
  },
  {
    label:
      "Admission fee, monthly fee and exam fee will be added to the accounting",
    name: "SettingColumn2",
    options: ["Yes", "No"],
    values: [1, 0],
  },
  {
    label: "Donations will be added to the accounting",
    name: "SettingColumn3",
    options: ["Yes", "No"],
    values: [1, 0],
  },
  {
    label: "Teacher/staff salary will be deducted from the main accounting",
    name: "SettingColumn4",
    options: ["Yes", "No"],
    values: [1, 0],
  },
  {
    label: "Collection of student examination fees",
    name: "SettingColumn5",
    options: ["Together", "Separate"],
    values: [1, 0],
  },
  {
    label: "The student's exam fee will be added to the accounting",
    name: "SettingColumn5",
    options: ["Yes", "No"],
    values: [1, 0],
  },
];

const Settings = () => {
  const translate = useTranslate();

  const { data, isLoading } = useGetReportSettingQuery();
  const [postReportSetting] = usePostReportSettingMutation();

  const setting = data?.[0];

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (setting) {
      setFormData({
        ID: setting.ID,
        SettingColumn1: setting.SettingColumn1,
        SettingColumn2: setting.SettingColumn2,
        SettingColumn3: setting.SettingColumn3,
        SettingColumn4: setting.SettingColumn4,
        SettingColumn5: setting.SettingColumn5,
      });
    }
  }, [setting]);

  const debouncedSave = debounce(async (updatedData) => {
    if (!updatedData.ID) return;
    try {
      // await postReportSetting({ settings: [updatedData] }).unwrap();
      Swal.fire({
        icon: "success",
        title: "Auto-saved successfully",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Auto-save failed",
        text: err?.message || "Something went wrong!",
      });
    }
  }, 500); // 500ms debounce

  const handleChange = (columnName, value) => {
    const updated = {
      ...formData,
      [columnName]: value,
    };
    setFormData(updated);
    debouncedSave(updated);
  };

  return (
    <div className="w-full max-w-full bg-blue-50 shadow-lg rounded-lg border border-blue-200">
      <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg text-lg md:text-xl font-semibold">
        {translate("Settings")}
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {settingConfig.map((row, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
          >
            <label className="w-full md:w-1/3 text-left md:text-right font-medium text-gray-700 md:pt-2">
              {translate(row.label)} :
            </label>
            <div className="flex flex-wrap gap-3 bg-white p-3 rounded-md shadow-sm w-full md:w-2/3">
              {row.options.map((option, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-gray-800 px-2 py-1"
                >
                  <input
                    type="radio"
                    name={row.name}
                    checked={formData?.[row.name] === row.values[i]}
                    onChange={() => handleChange(row.name, row.values[i])}
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm md:text-base">
                    {translate(option)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
