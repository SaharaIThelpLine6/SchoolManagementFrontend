import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useGetAdmissionStudentsQuery,
  useGetExamNamesQuery,
  usePostNewClassStudentamissionMutation,
} from '../features/student/studentQuerySlice';
import useTranslate from '../utils/Translate';

const OnlineAdmissionForUserPanel = () => {
  const translate = useTranslate();
  const method = useForm();
  const { setValue, watch } = method;

  const [leftData, setLeftData] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  console.log(rightData, 'rightData');

  // Form watch
  const [SessionID, ExamID, SubClassID] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
  ]);

  // API calls
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: examData = [] } = useGetExamNamesQuery();
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const [postNewClassStudentAdmission] =
    usePostNewClassStudentamissionMutation();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  // Skip logic
  const shouldSkip = !activeSession?.SessionID || !ExamID || !SubClassID;

  const { data: admissionData = [], isLoading } = useGetAdmissionStudentsQuery(
    {
      sessionid: SessionID,
      examid: ExamID,
      classid: SubClassID,
    },
    { skip: shouldSkip }
  );

  // Set default session
  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  // Update leftData when API data changes
  useEffect(() => {
    if (admissionData?.length) {
      setLeftData(admissionData);
      setRightData([]);
      setSelectedLeft([]);
      setSelectedRight([]);
    }
  }, [admissionData]);

  // Toggle checkbox
  const handleSelect = (id, side) => {
    if (side === 'left') {
      setSelectedLeft((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setSelectedRight((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  // Delete row
  const handleDelete = (id, side) => {
    if (side === 'left') {
      setLeftData((prev) => prev.filter((item) => item.ID !== id));
      setSelectedLeft((prev) => prev.filter((item) => item !== id));
    } else {
      setRightData((prev) => prev.filter((item) => item.ID !== id));
      setSelectedRight((prev) => prev.filter((item) => item !== id));
    }
  };

  // Move to right
  const moveToRight = () => {
    const selectedItems = leftData.filter((item) =>
      selectedLeft.includes(item.ID)
    );
    setRightData([...rightData, ...selectedItems]);
    setLeftData(leftData.filter((item) => !selectedLeft.includes(item.ID)));
    setSelectedLeft([]);
  };

  // Move to left
  const moveToLeft = () => {
    const selectedItems = rightData.filter((item) =>
      selectedRight.includes(item.ID)
    );
    setLeftData([...leftData, ...selectedItems]);
    setRightData(rightData.filter((item) => !selectedRight.includes(item.ID)));
    setSelectedRight([]);
  };

 const handleSubmit = async () => {
   const selectedItems = rightData.map((item) => ({
     UserID: item.UserID,
     PassedClassID: item.SubClassID,
     AdmissionID: item.AdmissionID,
     Action: 1
   }));

   try {
     console.log(selectedItems, 'selectedItems');
     // Wrap in { data: [...] } so backend receives it correctly
     const response = await postNewClassStudentAdmission({
       data: selectedItems,
     });
     console.log(response);
   } catch (error) {
     console.error('Error submitting new class student admission:', error);
   }
 };

  // Table component
  const Table = ({ data, selected, side }) => (
    <div className="w-full h-[400px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700 uppercase text-xs">
            <tr className="text-center">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selected.length === data.length}
                  onChange={() =>
                    data.forEach((item) => handleSelect(item.ID, side))
                  }
                />
              </th>
              <th className="p-3">{translate('User Code')}</th>
              <th className="p-3">{translate('Name')}</th>
              <th className="p-3">{translate('Total')}</th>
              <th className="p-3">{translate('Division')}</th>
              <th className="p-3 text-center">{translate('Action')}</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.ID}
                className="border-b hover:bg-blue-50 transition duration-200 text-center"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.ID)}
                    onChange={() => handleSelect(item.ID, side)}
                  />
                </td>

                <td className="p-3 font-medium text-gray-700">
                  {item.UserCode}
                </td>
                <td className="p-3">{item.UserName}</td>
                <td className="p-3">{item.Total}</td>
                <td className="p-3">{item.Division}</td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(item.ID, side)}
                    className="p-2 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition shadow"
                  >
                    <SvgIcon name={'FaTrash'} />
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-400">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <FormProvider {...method}>
      <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h3 className="text-xl font-bold">{translate('Online Admission')}</h3>
          <Button onClick={handleSubmit}>Save</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 mb-6">
          <DefaultSelect
            label="Session"
            registerKey="SessionID"
            options={sessionData}
            valueField="SessionID"
            nameField="SessionName"
          />
          <DefaultSelect
            label="Exam"
            registerKey="ExamID"
            options={examData}
            valueField="ExamID"
            nameField="ExamName"
          />
          <DefaultSelect
            label="SubClass"
            registerKey="SubClassID"
            options={subClassData}
            valueField="SubClassID"
            nameField="SubClass"
          />

          {/* Status Cards */}

          {/* ভর্তি সম্পন্ন */}
          <div className="w-64 bg-green-50 border border-green-300 rounded p-4">
            <h2 className="text-md font-semibold text-green-700">
              ভর্তি সম্পন্ন
            </h2>
            <p className="text-sm text-green-600 mt-1">২৩২৫ জন</p>
          </div>

          {/* ভর্তি বাকি */}
          <div className="w-64 bg-yellow-50 border border-yellow-300 rounded p-4">
            <h2 className="text-md font-semibold text-yellow-700">
              ভর্তি বাকি
            </h2>
            <p className="text-sm text-yellow-600 mt-1">৪৫৬ জন</p>
          </div>01
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          {/* Left Table */}
          <div className="md:col-span-5">
            <Table data={leftData} selected={selectedLeft} side="left" />
          </div>

          {/* Move Buttons */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={moveToRight}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              →
            </button>

            <button
              onClick={moveToLeft}
              className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition"
            >
              ←
            </button>
          </div>

          {/* Right Table */}
          <div className="md:col-span-5">
            <Table data={rightData} selected={selectedRight} side="right" />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionForUserPanel;
