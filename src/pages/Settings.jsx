import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../features/settings/settingsQuerySlice';
import { debounce } from '../utils/debounce';
import useTranslate from '../utils/Translate';
import AdmissionDynamicFormWithResult from '../view/students/reports/result-reports/AdmissionDynamicFormWithResult';
import { usePostResultReportSettingsMutation } from '../features/userReports/userReportsSlice';
import Button from '../components/Button/Button';

const Settings = () => {
  const translate = useTranslate();
  const { data: response, isLoading, isError, refetch } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingsMutation();
  const [
      updateResultReport,
      { isLoading: resultReportUpdating, isError: resultReportUpdatingError, isSuccess: resultReportUpdateSuccess, data: resultReportUpdatingResponse },
    ] = usePostResultReportSettingsMutation();
  const formRef = useRef();
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


  const reportData = {
    "SubClassID": 1,
    "SubClass": "নূরানী",
    "ExamID": 5,
    "ExamName": "প্রথম সাময়িক পরীক্ষা",
    "result": [
      {
        "ID": 5519,
        "AdmissionID": 2555,
        "UserID": 896,
        "UserCode": 223128,
        "AdmissionSerial": 6,
        "UserName": "মুছা. মাফিয়া আক্তার",
        "FatherName": "মো: রিপন মিয়া",
        "MotherName": "",
        "SessionID": 4,
        "SessionName": "২০২৫-২৬ইং",
        "ExamID": 5,
        "ExamName": "প্রথম সাময়িক পরীক্ষা",
        "ClassSerial": 1,
        "ClassID": 1,
        "SubClassSerial": 101,
        "SubClassID": 1,
        "SubClass": "নূরানী",
        "ResidentialStatusId": 2,
        "GenderID": 2,
        "Mobile1": "01810705687",
        "DateOfBirth": "2013-12-25",
        "SFTID": 1,
        "FinancialName": "স্বচ্ছল",
        "NIDNO": "",
        "PermanentVill": "ঢোলাদিয়া",
        "PermanentPost": "সদর",
        "PoliceStationName": "ময়মনসিংহ সদর",
        "DistrictName": "ময়মনসিংহ\r\n",
        "DivisionName": "ময়মনসিংহ",
        "TransientVill": "ঢোলাদিয়া",
        "TransientPost": "সদর",
        "TransientPoliceStation": "ময়মনসিংহ সদর",
        "TransientDistrict": "ময়মনসিংহ\r\n",
        "Subject1": "নূরানী",
        "SubVal1": 98,
        "PassNumber1": 35,
        "MaxNumber1": 100,
        "Subject2": "তাজবীদ",
        "SubVal2": 98,
        "PassNumber2": 35,
        "MaxNumber2": 100,
        "Subject3": "মাসায়েল ও দোয়া",
        "SubVal3": 99,
        "PassNumber3": 35,
        "MaxNumber3": 100,
        "Subject4": "বাংলা",
        "SubVal4": 100,
        "PassNumber4": 35,
        "MaxNumber4": 100,
        "Subject5": "ইংরেজী",
        "SubVal5": 100,
        "PassNumber5": 35,
        "MaxNumber5": 100,
        "Subject6": "গণিত",
        "SubVal6": 99,
        "PassNumber6": 35,
        "MaxNumber6": 100,
        "Subject7": null,
        "SubVal7": 0,
        "PassNumber7": null,
        "MaxNumber7": null,
        "Subject8": null,
        "SubVal8": 0,
        "PassNumber8": null,
        "MaxNumber8": null,
        "Subject9": null,
        "SubVal9": 0,
        "PassNumber9": null,
        "MaxNumber9": null,
        "Subject10": null,
        "SubVal10": 0,
        "PassNumber10": null,
        "MaxNumber10": null,
        "Subject11": null,
        "SubVal11": 0,
        "PassNumber11": null,
        "MaxNumber11": null,
        "Subject12": null,
        "SubVal12": 0,
        "PassNumber12": null,
        "MaxNumber12": null,
        "Subject13": null,
        "SubVal13": 0,
        "PassNumber13": null,
        "MaxNumber13": null,
        "Subject14": null,
        "SubVal14": 0,
        "PassNumber14": null,
        "MaxNumber14": null,
        "Meari1": 1,
        "Meari2": 1,
        "Meari3": 0,
        "Meari4": 0,
        "Meari5": 0,
        "Meari6": 0,
        "Meari7": 0,
        "Meari8": 0,
        "Meari9": 0,
        "Meari10": 0,
        "Meari11": 0,
        "Meari12": 0,
        "Meari13": 0,
        "Meari14": 0,
        "SubSonkha": 6,
        "SCount": 6,
        "ForAverageSubsonkha": 6,
        "Average": 99,
        "TotalStudent": 56,
        "Total": 594,
        "Division": "মুমতাজ",
        "DivisionAra": "",
        "Positions": 1,
        "PosSub": null,
        "DivisionTopNumber": 100,
        "DivisionNumber1": 80,
        "DivisionNumber2": 65,
        "DivisionNumber3": 50,
        "DivisionNumber4": 35,
        "DivisionNumber5": 1,
        "DivisionNumber6": 0,
        "DivisionNumber7": null,
        "Division1": "মুমতাজ",
        "Division2": "জায়্যিদ জিদ্দান",
        "Division3": "জায়্যিদ",
        "Division4": "মাকবূল",
        "Division5": "রাসিব",
        "Division6": "অনুপস্থিত",
        "Division7": null,
        "Dcolor": 0,
        "DC1": 22,
        "DC2": 17,
        "DC3": 2,
        "DC4": 9,
        "DC5": 4,
        "DC6": 0,
        "DAbsance": 2,
        "TN1": 0,
        "TN2": 0,
        "TN3": 0,
        "TN4": 0,
        "TN5": 0,
        "TN6": 0,
        "TN7": 0,
        "TN8": 0,
        "TN9": 0,
        "TN10": 0,
        "TN11": 0,
        "TN12": 0,
        "TN13": 0,
        "TN14": 0,
        "TalentAcotin": 1,
        "Image": null,
        "UserAction": 1,
        "AdmissionAction": 1,
        "StudentIDLabel": "আইডি নং",
        "ClassNameLabel": "শ্রেণি/জামাত",
        "Published": 1,
        "sls": 1,
        "InstitutionName": "রাহাতুল জান্নাত মহিলা মাদরাসা",
        "Address": "খাগডহর, সদর, মোমেনশাহী",
        "ContactNumber": "০১৭১৬৩৩০৩৪৪,০১৯৮০৭১৫৩৯১,০১৯৪৩৩৬১৫২৪",
        "PrincipalName": "মুহতামিম",
        "NajemName": "নাযিমে তা'লীমাত"
      }

    ]
  };
  const handelFromEdit = async () => {
    const content = formRef.current?.getEditorContent();
    

    try {
      await updateResultReport({
      "Description1": content.Description1,
      "Description2": content.Description2,
    }).unwrap()
      Swal.fire({
        icon: 'success',
        title: 'Auto-saved successfully',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      // Revert formData on error
     
      Swal.fire({
        icon: 'error',
        title: 'Auto-save failed',
        text: err?.data?.message || err?.message || 'Something went wrong!',
      });
    }
  };
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
    
       <div className="bg-blue-600 text-white text-center py-3 rounded-t-lg text-lg md:text-xl font-semibold">
        {translate('Result Form Description')}
      </div>
      <AdmissionDynamicFormWithResult reportData={reportData} query={{
        report_id: 6,
        session_id: 4,
        subclass_id: 1,
        exam_id: 5
      }} ref={formRef} />
          <div className="p-4 md:p-6 space-y-4 md:space-y-5">
      <Button onClick={handelFromEdit}>
        {translate("Save")}
      </Button>
      </div>
    </div>
  );
};

export default Settings;
