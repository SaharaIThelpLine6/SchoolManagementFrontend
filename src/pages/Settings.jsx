import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../features/settings/settingsQuerySlice';
import { debounce } from '../utils/debounce';
import useTranslate from '../utils/Translate';

const Settings = () => {
  const translate = useTranslate();
  const { data: response, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingsMutation();

  const allSettingInfo = response?.data || [];

  // Updateable data
  const updateableData = [
    {
      id: 20,
      Action: [1, 2],
    },
    {
      id: 16,
      Action: [0, 1],
    },
    {
      id: 17,
      Action: [0, 1],
    },
    {
      id: 26,
      Action: [0, 1],
    },
    {
      id: 19,
      Action: [1, 2],
    },
    {
      id: 27,
      Action: [0, 1],
    },
    {
      id: 31,
      Action: [1, 2],
    },
    {
      id: 32,
      Action: [0, 1],
    },
    {
      id: 29,
      Action: [0, 1],
    },
  ];

  // Map for easy lookup
  const updateableDataMap = updateableData.reduce((acc, item) => {
    acc[item.id] = item.Action;
    return acc;
  }, {});

  // বাংলা description map
  const descriptionMap = {
    20: 'পরীক্ষার কন্ডিশন ধরণ',
    16: 'ভর্তি ফি, মাসিক ফি এবং পরীক্ষার ফি অ্যাকাউন্টিং এ যুক্ত হবে',
    17: 'দান অনুদানের টাকা অ্যাকাউন্টিং এ যুক্ত হবে',
    26: 'শিক্ষক/স্টাপ বেতন মূল অ্যাকাউন্টে থেকে কর্তন হবে',
    19: 'শিক্ষার্থীর পরীক্ষার ফি গ্রহণ',
    27: 'শিক্ষার্থীর একত্রে পরীক্ষার ফি অ্যাকাউন্টে এ যুক্ত হবে',
    31: 'গড় ভিক্তিক ফলাফল এন্ট্রি ধরন',
    32: 'অনলাইনে ক্লাস ভিক্তিক ফলাফল প্রকাশ',
    29: 'একই শিক্ষার্থী ডাবল এন্ট্রি হবে',
  };

  // স্পেশাল অপশন [1,2] গুলোর জন্য
  const specialOptions = {
    20: [
      { value: 1, label: 'গড়' },
      { value: 2, label: 'পয়েন্ট' },
    ],
    19: [
      { value: 1, label: 'একসাথে' },
      { value: 2, label: 'আলাদা' },
    ],
    31: [
      { value: 1, label: 'মূল ক্লাস' },
      { value: 2, label: 'সাব-ক্লাস' },
    ],
  };

  // ডিফল্ট অপশন [0,1] গুলোর জন্য
  const defaultOptions = [
    { value: 0, label: 'না' },
    { value: 1, label: 'হ্যাঁ' },
  ];

  // FormData state - শুধুমাত্র API data থেকে initialize হবে
  const [formData, setFormData] = useState({});

  // useEffect: API data load হলে formData initialize করবে
  useEffect(() => {
    if (allSettingInfo.length > 0) {
      const initialFormData = {};
      allSettingInfo.forEach((row) => {
        if (updateableDataMap[row.ID]) {
          const allowed = updateableDataMap[row.ID];
          // API তে existing value থাকলে সেটা নেবে, নাহলে default value
          initialFormData[row.ID] =
            row.Action !== null && row.Action !== undefined
              ? row.Action
              : allowed[0];
        }
      });
      setFormData(initialFormData);
    }
  }, [allSettingInfo]); // শুধুমাত্র allSettingInfo change হলে

  const debouncedSave = debounce(async (updatedData, prevValue) => {
    if (!updatedData.ID) return;
    console.log('Sending update to server:', updatedData);
    try {
      await updateSetting(updatedData).unwrap();
      refetch(); // Refetch to confirm server sync
      Swal.fire({
        icon: 'success',
        title: 'Auto-saved successfully',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      // Revert formData on error
      setFormData((prev) => ({
        ...prev,
        [updatedData.ID]: prevValue,
      }));
      Swal.fire({
        icon: 'error',
        title: 'Auto-save failed',
        text: err?.data?.message || err?.message || 'Something went wrong!',
      });
    }
  }, 100);

  const handleChange = (rowId, value) => {
    const allowed = updateableDataMap[rowId];
    const prevValue = formData[rowId];

    if (allowed && allowed.includes(value)) {
      console.log(`Changing ID ${rowId} from ${prevValue} to ${value}`);

      // Immediate UI update
      setFormData((prev) => ({
        ...prev,
        [rowId]: value,
      }));

      // Debounced API call
      debouncedSave({ ID: rowId, Action: value }, prevValue);
    } else {
      console.warn(`Value ${value} not allowed for ID ${rowId}:`, allowed);
    }
  };

  // শুধু updateable গুলো filter (original API data থেকে)
  const filteredSettings = allSettingInfo.filter((row) =>
    updateableDataMap.hasOwnProperty(row.ID)
  );


  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading settings</div>;

  return (
    <div className="w-full max-w-full bg-blue-50 shadow-lg rounded-lg border border-blue-200">
      <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg text-lg md:text-xl font-semibold">
        {translate('Settings')}
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-5">
        {filteredSettings.map((row) => {
          const allowedActions = updateableDataMap[row.ID];
          const currentValue = formData[row.ID];
          const desc =
            descriptionMap[row.ID] ||
            translate(row.Description) ||
            row.Description;
          const config = specialOptions[row.ID] || defaultOptions;
          const options = config.filter((opt) =>
            allowedActions.includes(opt.value)
          );

          // Wait until formData is populated
          if (currentValue === undefined) {
            return (
              <div
                key={row.ID}
                className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
              >
                <label className="w-full md:w-1/3 text-left md:text-right font-medium text-gray-700 md:pt-2">
                  {desc} :
                </label>
                <div className="flex flex-wrap gap-3 bg-white p-3 rounded-md shadow-sm w-full md:w-2/3">
                  <div className="text-gray-500">Loading...</div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={row.ID}
              className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
            >
              <label className="w-full md:w-1/3 text-left md:text-right font-medium text-gray-700 md:pt-2">
                {desc} :
              </label>
              <div className="flex flex-wrap gap-3 bg-white p-3 rounded-md shadow-sm w-full md:w-2/3">
                {options.map((opt, i) => {
                  const isChecked = currentValue === opt.value;
                  return (
                    <label
                      key={i}
                      className="flex items-center gap-2 px-2 py-1 text-gray-800 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`status-${row.ID}`}
                        checked={isChecked}
                        onChange={() => handleChange(row.ID, opt.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm md:text-base">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;
