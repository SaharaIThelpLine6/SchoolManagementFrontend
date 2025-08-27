import { useState } from "react";
import Swal from "sweetalert2";
import { debounce } from "../utils/debounce";
import useTranslate from "../utils/Translate";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../features/settings/settingsQuerySlice";
import Loading from "../components/Loading/Loading";

const Settings = () => {
  const translate = useTranslate();
  const { data: response, isLoading, isError } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingsMutation();

  const allSettingInfo = response?.data || [];

  const [formData, setFormData] = useState({});

  const debouncedSave = debounce(async (updatedData) => {
    if (!updatedData.ID) return;
    await updateSetting(updatedData).unwrap();
    try {
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
  }, 500);

  const handleChange = (rowId, value) => {
    const updated = {
      ...formData,
      [rowId]: value,
    };
    setFormData(updated);
    debouncedSave({ ID: rowId, ActiveInAcive: value });
  };

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading settings</div>;

  return (
    <div className="w-full max-w-full bg-blue-50 shadow-lg rounded-lg border border-blue-200">
      <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg text-lg md:text-xl font-semibold">
        {translate("Settings")}
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {allSettingInfo.map((row) => (
          <div
            key={row.ID}
            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
          >
            <label className="w-full md:w-1/3 text-left md:text-right font-medium text-gray-700 md:pt-2">
              {translate(row.Description)} :
            </label>
            <div className="flex flex-wrap gap-3 bg-white p-3 rounded-md shadow-sm w-full md:w-2/3">
              {["Active", "Inactive"].map((status, i) => (
                <label
                  key={i}
                  className="flex items-center gap-2 text-gray-800 px-2 py-1"
                >
                  <input
                    type="radio"
                    name={`status-${row.ID}`}
                    checked={
                      (row.ActiveInAcive === 1 && status === "Active") ||
                      (row.ActiveInAcive === 0 && status === "Inactive")
                    }
                    onChange={() =>
                      handleChange(row.ID, status === "Active" ? 1 : 0)
                    }
                    disabled={isLoading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm md:text-base">{status}</span>
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
