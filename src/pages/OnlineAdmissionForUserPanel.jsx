import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useDeleteNewClassStudentAdmissionMutation,
  useGetAdmissionStudentsQuery,
  useGetExamNamesQuery,
  usePostNewClassStudentamissionMutation,
} from '../features/student/studentQuerySlice';
import useTranslate from '../utils/Translate';
import { Link } from 'react-router-dom';

const OnlineAdmissionForUserPanel = () => {
  const translate = useTranslate();
  const method = useForm();
  const { setValue, watch } = method;

  const [leftData, setLeftData] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState([]);
  const [selectedRight, setSelectedRight] = useState([]);

  const [SessionID, ExamID, SubClassID] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
  ]);

  // API
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: examData = [] } = useGetExamNamesQuery();
  const { data: subClassData = [] } = useGetSubClassListQuery();
  const [postNewClassStudentAdmission, { isLoading: isPostLoading }] =
    usePostNewClassStudentamissionMutation();
  const [deleteNewClassStudentAdmission, { isLoading: isDeleteLoading }] =
    useDeleteNewClassStudentAdmissionMutation();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const shouldSkip = !SessionID || !ExamID || !SubClassID;

  const { data: admissionData, isLoading: isAdmissionLoading } =
    useGetAdmissionStudentsQuery(
      {
        sessionid: SessionID,
        examid: ExamID,
        classid: SubClassID,
      },
      { skip: shouldSkip }
    );

  // Default Session
  useEffect(() => {
    if (activeSession) {
      setValue('SessionID', activeSession.SessionID);
    }
  }, [activeSession, setValue]);

  // 🔥 IMPORTANT FIX — handle left/right from backend
  useEffect(() => {
    if (admissionData) {
      setLeftData(admissionData.leftData || []);
      setRightData(admissionData?.rightData || []);
      setSelectedLeft([]);
      setSelectedRight([]);
    }
  }, [admissionData]);

  // Checkbox Select
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

  // Delete (UI only)
  const handleDelete = async (id, side, graid) => {
    // 1️⃣ Confirm before delete
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return; // user cancelled

    try {
      // 2️⃣ Set loading
      Swal.showLoading();


      // 4️⃣ Update UI
      if (side === 'left') {
        setLeftData((prev) => prev.filter((item) => item.ID !== id));
        setSelectedLeft((prev) => prev.filter((item) => item !== id));
      } else {
        // 3️⃣ Call delete API
        await deleteNewClassStudentAdmission({ graid }).unwrap();
        setRightData((prev) => prev.filter((item) => item.ID !== id));
        setSelectedRight((prev) => prev.filter((item) => item !== id));
      }

      // 5️⃣ Success alert
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Admission deleted successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Delete error:', error);

      // Permission or other errors alert
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text:
          error?.data?.error ||
          'You do not have permission to delete or some error occurred.',
      });
    }
  };

  // Move →
  const moveToRight = async () => {
    const selectedItems = leftData.filter((item) =>
      selectedLeft.includes(item.ID)
    );

    const payload = selectedItems.map((item) => ({
      UserID: item.UserID,
      PassedClassID: item.SubClassID,
      AdmissionID: item.AdmissionID,
      SessionID: item.SessionID,
      Action: 1,
    }));

    try {
      await postNewClassStudentAdmission({
        data: payload,
      }).unwrap();
    } catch (error) {
      console.error('Submit error:', error);
    }

    setRightData((prev) => [...prev, ...selectedItems]);
    setLeftData((prev) =>
      prev.filter((item) => !selectedLeft.includes(item.ID))
    );
    setSelectedLeft([]);
  };

  // Move ←
  const moveToLeft = () => {
    const selectedItems = rightData.filter((item) =>
      selectedRight.includes(item.ID)
    );

    setLeftData((prev) => [...prev, ...selectedItems]);
    setRightData((prev) =>
      prev.filter((item) => !selectedRight.includes(item.ID))
    );
    setSelectedRight([]);
  };

  // Save
  const handleSubmit = async () => {
    const selectedItems = rightData.map((item) => ({
      UserID: item.UserID,
      PassedClassID: item.SubClassID,
      AdmissionID: item.AdmissionID,
      SessionID: item.SessionID,
      Action: 1,
    }));

    try {
      await postNewClassStudentAdmission({
        data: selectedItems,
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (isAdmissionLoading) {
    return <Loading />;
  }
  if (isPostLoading) {
    return <Loading />;
  }
  if (isDeleteLoading) {
    return <Loading />;
  }
  const action1Count = rightData.filter((item) => item.Action === 1).length;
  const action2Count = rightData.filter((item) => item.Action === 2).length;
  // Table component
  const Table = ({ data, selected, side, rightPermission = false }) => (
    <div className="w-full h-[400px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-gray-700 uppercase text-xs">
            <tr className="text-center">
              {!rightPermission && (
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={() =>
                      data.forEach((item) => handleSelect(item.ID, side))
                    }
                  />
                </th>
              )}
              <th className="p-3">{translate('User Code')}</th>
              <th className="p-3">{translate('Name')}</th>
              <th className="p-3">{translate('Total')}</th>
              <th className="p-3">{translate('Division')}</th>
              {rightPermission && (
                <th className="p-3">{translate('Admission Status')}</th>
              )}
              <th className="p-3 text-center">{translate('Action')}</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr
                key={`${side}-${item.ID}-${index}`}
                className="border-b hover:bg-blue-50 transition duration-200 text-center"
              >
                {!rightPermission && (

                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(item.ID)}
                      onChange={() => handleSelect(item.ID, side)}
                    />
                  </td>
                )}

                <td className="p-3 font-medium text-gray-700">
                  {item.UserCode}
                </td>
                <td className="p-3">{item.UserName}</td>
                <td className="p-3">{item.Total}</td>
                <td className="p-3">{item.Division}</td>

                {rightPermission && (
                  <td className="p-3">
                    {item.Action === 1 && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 shadow-sm">
                        Pending
                      </span>
                    )}

                    {item.Action === 2 && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-300 shadow-sm">
                        Complete
                      </span>
                    )}

                    {!item.Action && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-300">
                        Not Set
                      </span>
                    )}
                  </td>
                )}

                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(item.ID, side, item.GRAID)}
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
  const tabs = [
    {
      name: translate('Online Admission'),
      path: '/parent-panel/online-admission',
    },
    {
      name: translate('Online Admission Message'),
      path: '/parent-panel/online-admission-message',
    },
  ];
  return (
    <FormProvider {...method}>
      <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-xl">
        {/* Header */}
        {/* Header */}
        <div className="border-b border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
          <div className="flex items-center gap-6">
            {tabs.map((tab, index) => {
              const isActive = location.pathname === tab.path;

              return (
                <Link
                  key={index}
                  to={tab.path}
                  className={`relative pb-2 text-[18px] font-SolaimanLipi font-bold transition-all duration-300 ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-500'
                    }`}
                >
                  {tab.name}

                  {/* Active underline animation */}
                  {isActive && (
                    <span className="absolute left-0 -bottom-[6px] w-full h-[3px] bg-blue-600 rounded-full transition-all duration-300"></span>
                  )}
                </Link>
              );
            })}
          </div>
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
          {rightData.length > 0 && (
            <>
              {/* ভর্তি সম্পন্ন */}
              <div className="w-64 bg-green-50 border border-green-300 rounded p-4">
                <h2 className="text-md font-semibold text-green-700">
                  ভর্তি সম্পন্ন
                </h2>
                <p className="text-sm text-green-600 mt-1">{action2Count} জন</p>
              </div>
              {/* ভর্তি বাকি */}
              <div className="w-64 bg-yellow-50 border border-yellow-300 rounded p-4">
                <h2 className="text-md font-semibold text-yellow-700">
                  ভর্তি বাকি
                </h2>
                <p className="text-sm text-yellow-600 mt-1">
                  {action1Count} জন
                </p>
              </div>
            </>
          )}
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

            {/* <button
              onClick={moveToLeft}
              className="px-6 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition"
            >
              ←
            </button> */}
          </div>

          {/* Right Table */}
          <div className="md:col-span-5">
            <Table
              data={rightData}
              selected={selectedRight}
              side="right"
              rightPermission={true}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionForUserPanel;
