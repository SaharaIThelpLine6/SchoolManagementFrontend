import { useEffect, useRef, useState, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { skipToken } from '@reduxjs/toolkit/query';

import { setPageName } from '../../features/auth/authSlice';
import {
  useGetAcademicSubjectsBySubClassQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';
import {
  useDeleteExamRoutineMutation,
  useGetAllExamRoutineQuery,
  useGetExamNamesQuery,
  useGetExamRoutineQuery,
  useGetSingleExamRoutineQuery,
  usePostExamRoutineMutation,
  usePutExamRoutineMutation,
} from '../../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import useTranslate from '../../utils/Translate';
import { permissionsDataList } from '../../Data/permissions';
import { ViewPermission } from '../../Routes/ViewPermission';
import Button from '../../components/Button/Button';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { showModal } from '../../utils/ModalControlar';

const ExamRouteCreateModal = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const {
    watch,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);
  const [editId, setEditId] = useState(null);
  const [visibility, setVisibility] = useState(Array(14).fill(true));
  const isSubmittingRef = useRef(false);

  // Subject Options for DefaultSelect
  const subjectOptions = [
    { value: 'বাংলা', label: 'বাংলা' },
    { value: 'ইংরেজি', label: 'ইংরেজি' },
    { value: 'গণিত', label: 'গণিত' },
    { value: 'বিজ্ঞান', label: 'বিজ্ঞান' },
    { value: 'ইসলাম শিক্ষা', label: 'ইসলাম শিক্ষা' },
    { value: 'সমাজ বিজ্ঞান', label: 'সমাজ বিজ্ঞান' },
  ];

  // Code Options for DefaultSelect (if needed)
  const codeOptions = [
    { value: '১০১', label: '১০১' },
    { value: '১০২', label: '১০২' },
    { value: '১০৩', label: '১০৩' },
    { value: '১০৪', label: '১০৪' },
    { value: '১০৫', label: '১০৫' },
  ];

  // Dynamic Data State
  const [examRoutineData, setExamRoutineData] = useState([
    {
      id: 1,
      sl: '১',
      date: '01-11-2025',
      day: 'শনিবার',
      subject: 'বাংলা',
      startTime: '09:00',
      endTime: '10:30',
      code: '১০১',
      fullMarks: '১০০',
      passMarks: '৩৩',
      selected: false,
    },
    {
      id: 2,
      sl: '২',
      date: '04-11-2025',
      day: 'মঙ্গলবার',
      subject: 'ইংরেজি',
      startTime: '09:00',
      endTime: '10:30',
      code: '১০২',
      fullMarks: '১০০',
      passMarks: '৩৩',
      selected: false,
    },
    {
      id: 3,
      sl: '৩',
      date: '06-11-2025',
      day: 'বৃহস্পতিবার',
      subject: 'গণিত',
      startTime: '09:00',
      endTime: '10:30',
      code: '১০৩',
      fullMarks: '১০০',
      passMarks: '৩৩',
      selected: false,
    },
    {
      id: 4,
      sl: '৪',
      date: '08-11-2025',
      day: 'শনিবার',
      subject: 'বিজ্ঞান',
      startTime: '09:00',
      endTime: '10:30',
      code: '১০৪',
      fullMarks: '১০০',
      passMarks: '৩৩',
      selected: false,
    },
  ]);

  // Initialize form values for each row's DefaultSelect
  useEffect(() => {
    examRoutineData.forEach((item) => {
      setValue(`subject_${item.id}`, item.subject);
      setValue(`code_${item.id}`, item.code);
    });
  }, [examRoutineData.length, setValue]);

  const toggleVisibility = (index) => {
    const newVisibility = [...visibility];
    newVisibility[index] = !newVisibility[index];
    setVisibility(newVisibility);
  };

  const [SessionID = '', ExamID = '', SubClassID = '', PrintID = ''] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
    'PrintID',
  ]);

  const [postExamRoutine] = usePostExamRoutineMutation();
  const [updateExamRoutine] = usePutExamRoutineMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const onSubmit = async (formData) => {
    // Collect all row data from form
    const updatedRows = examRoutineData.map((item) => ({
      ...item,
      subject: formData[`subject_${item.id}`] || item.subject,
      code: formData[`code_${item.id}`] || item.code,
    }));
    console.log('Form Data:', formData);
    console.log('Updated Rows:', updatedRows);
  };

  const handleExamRoutineCreate = () => {
    showModal('পরীক্ষার রুটিন তৈরি করুন', 'EXAM_ROUTINE_CREATE', {
      closeOnOutSide: false,
    });
  };

  const handleExamRoutineSetting = () => {
    showModal('সেটিং তৈরি করুন', 'EXAM_ROUTINE_SETTING', {
      closeOnOutSide: false,
    });
  };

  // Handle Select All
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setExamRoutineData((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  // Handle Single Select
  const handleSelectOne = (id) => {
    setExamRoutineData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Handle Copy
  const handleCopy = (item) => {
    const newId = Date.now();
    const newItem = {
      ...item,
      id: newId,
      sl: (examRoutineData.length + 1).toString(),
      selected: false,
    };
    setExamRoutineData((prev) => [...prev, newItem]);

    // Initialize form values for the new row
    setValue(`subject_${newId}`, newItem.subject);
    setValue(`code_${newId}`, newItem.code);

    Swal.fire({
      icon: 'success',
      title: 'কপি করা হয়েছে!',
      text: `${item.subject} রুটিনটি কপি করা হয়েছে।`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleEdit = (item) => {
    console.log('Edit', item);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'আপনি এই রুটিনটি মুছে ফেলতে চান!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন',
    }).then((result) => {
      if (result.isConfirmed) {
        setExamRoutineData((prev) => prev.filter((item) => item.id !== id));
      }
    });
  };

  // Handle Delete All Selected
  const handleDeleteSelected = () => {
    const selectedCount = examRoutineData.filter((item) => item.selected).length;
    if (selectedCount === 0) {
      Swal.fire({
        icon: 'info',
        title: 'কোনো আইটেম নির্বাচন করা হয়নি!',
        text: 'অনুগ্রহ করে ডিলিট করার জন্য অন্তত একটি আইটেম নির্বাচন করুন।',
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: `আপনি ${selectedCount}টি রুটিন মুছে ফেলতে চান!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'হ্যাঁ, সব মুছে ফেলুন!',
      cancelButtonText: 'বাতিল করুন',
    }).then((result) => {
      if (result.isConfirmed) {
        setExamRoutineData((prev) => prev.filter((item) => !item.selected));
        Swal.fire({
          icon: 'success',
          title: 'মুছে ফেলা হয়েছে!',
          text: `${selectedCount}টি রুটিন সফলভাবে মুছে ফেলা হয়েছে।`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleMoveUp = (index) => {
    if (index > 0) {
      const newData = [...examRoutineData];
      [newData[index - 1], newData[index]] = [
        newData[index],
        newData[index - 1],
      ];
      setExamRoutineData(newData);
    }
  };

  const handleMoveDown = (index) => {
    if (index < examRoutineData.length - 1) {
      const newData = [...examRoutineData];
      [newData[index], newData[index + 1]] = [
        newData[index + 1],
        newData[index],
      ];
      setExamRoutineData(newData);
    }
  };

  // Check if all selected
  const isAllSelected =
    examRoutineData.length > 0 &&
    examRoutineData.every((item) => item.selected);

  // Check if any selected
  const hasSelected = examRoutineData.some((item) => item.selected);

  return (
    <div className="">
      <div className="font-default">
        {/* FormProvider wraps the entire table so DefaultSelect can use useFormContext */}
        <FormProvider {...methods}>
          <form
            className="w-full hidden lg:block space-y-4 md:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Top Section - 4 responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 my-3">
              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
              <DefaultSelect
                label={translate('Exam Name')}
                options={examNameData ?? []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
              />
              <DefaultSelect
                label={translate('Class/Jamaat')}
                options={subClassListData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
              />
            </div>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#e9edf4] pb-4 md:pb-5 gap-4">
              {/* Left Side: Icon & Title */}
              <div className="flex items-center gap-2.5">
                <div className="text-[#1e3a8a]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold">
                  {translate('পরীক্ষার সময়সূচি')}
                </h3>
              </div>

              {/* Right Side: Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">



                {/* Delete All Selected Button (Only visible when hasSelected is true) */}
                {hasSelected && (
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    নির্বাচিত সব মুছে ফেলুন
                  </button>
                )}
              </div>
            </div>
            {/* Table Section - Moved inside form to work with react-hook-form */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-gray-200">
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 w-12">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-700 w-12">
                      ক্রম
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      তারিখ
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      বার
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-700">
                      বিষয়
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-700">
                      শুরু সময়
                    </th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-700">
                      শেষ সময়
                    </th>

                    <th className="p-3 text-center text-sm font-semibold text-gray-700 w-36">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examRoutineData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.selected || false}
                            onChange={() => handleSelectOne(item.id)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                      </td>

                      {/* SL */}
                      <td className="p-3 text-sm text-gray-700">{item.sl}</td>

                      {/* Date */}
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {item.date}
                        </div>
                      </td>

                      {/* Day */}
                      <td className="p-3 text-sm text-gray-700">{item.day}</td>

                      {/* Subject - Using DefaultSelect */}
                      <td className="p-3 min-w-[150px]">
                        <DefaultSelect
                          label=""
                          options={subjectOptions}
                          valueField="value"
                          nameField="label"
                          registerKey={`subject_${item.id}`}
                          defaultValue={item.subject}
                          onChange={(selectedOption) => {
                            const newData = [...examRoutineData];
                            newData[index].subject = selectedOption.value;
                            setExamRoutineData(newData);
                          }}
                        />
                      </td>

                      {/* Start Time */}
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {item.startTime}
                        </div>
                      </td>

                      {/* End Time */}
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {item.endTime}
                        </div>
                      </td>


                      {/* Actions */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Copy Button (Blue) */}
                          <button
                            type="button"
                            onClick={() => handleCopy(item)}
                            className="flex items-center justify-center w-8 h-8 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Add"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 5v14" />
                              <path d="M5 12h14" />
                            </svg>
                          </button>

                          {/* Edit Button (Orange) */}
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex items-center justify-center w-8 h-8 rounded border border-orange-200 bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>


                          {/* Delete Button (Red) */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center justify-center w-8 h-8 rounded border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>


          </form>
        </FormProvider>
      </div>
    </div>
  );
};


export default ExamRouteCreateModal;
