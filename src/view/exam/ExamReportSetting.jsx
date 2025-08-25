import { useState, useEffect } from "react";
import {
  useGetReportSettingQuery,
  usePostReportSettingMutation,
} from "../../features/exam/examQuerySlice";
import Swal from "sweetalert2";
import { debounce } from "../../utils/debounce";

const settingConfig = [
  {
    label: "Photos",
    name: "SettingColumn1",
    options: ["Unhide", "Hide"], // 1 = Unhide, 0 = Hide
    values: [1, 0],
  },
  {
    label: "Seat No",
    name: "SettingColumn2",
    options: ["Code", "Ad Serial", "None"], // 1 = Code, 2 = Ad Serial, 0 = None
    values: [1, 2, 0],
  },
  {
    label: "Signature Name",
    name: "SettingColumn3",
    options: ["Unhide", "Hide"], // 1 = Unhide, 0 = Hide
    values: [1, 0],
  },
  {
    label: "Signature",
    name: "SettingColumn4",
    options: ["Unhide", "Hide"], // 1 = Unhide, 0 = Hide
    values: [1, 0],
  },
  {
    label: "Signature Date",
    name: "SettingColumn5",
    options: ["Unhide", "Hide"], // 1 = Unhide, 0 = Hide
    values: [1, 0],
  },
];

const ExamReportSetting = () => {
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
      await postReportSetting({ settings: [updatedData] }).unwrap();
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
    <div className="w-full max-w-auto bg-blue-50 shadow-lg rounded-lg border border-blue-200">
      <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg text-xl font-semibold">
        Admit Card Setting
      </div>

      <div className="p-6 space-y-5">
        {settingConfig.map((row, index) => (
          <div key={index} className="flex items-center gap-4">
            <label className="w-1/3 text-right font-medium text-gray-700">
              {row.label} :
            </label>
            <div className="flex gap-4 bg-white p-3 flex-wrap justify-start rounded-md shadow-sm w-2/3">
              {row.options.map((option, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-gray-800"
                >
                  <input
                    type="radio"
                    name={row.name}
                    checked={formData?.[row.name] === row.values[i]}
                    onChange={() => handleChange(row.name, row.values[i])}
                    disabled={isLoading}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamReportSetting;
