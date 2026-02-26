import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import { setPageName } from '../features/auth/authSlice';
import {
  useGetAcademicSubjectsBySubClassQuery,
  useGetSubClassListQuery,
} from '../features/class/classQuerySlice';
import {
  useDeleteExamRoutineMutation,
  useGetAllExamRoutineQuery,
  useGetExamNamesQuery,
  useGetExamRoutineQuery,
  useGetSingleExamRoutineQuery,
  usePostExamRoutineMutation,
  usePutExamRoutineMutation,
} from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';

import useTranslate from '../utils/Translate';

import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo } from 'react';
import { permissionsDataList } from '../Data/permissions';
import { ViewPermission } from '../Routes/ViewPermission';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import ExamRoutingCheckbox from '../components/Checkboxes/ExamRoutingCheckbox';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Input from '../components/Input/Input'; // Input import করুন
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import AllClassRoutingPDF from '../view/exam/ExamRouting/AllClassRoutingPDF';
import ExamSignatureRoutingPDF from '../view/exam/ExamRouting/ExamSignatureRoutingPDF';
import SingleClassRoutingPDF from '../view/exam/ExamRouting/SingleClassRoutingPDF';
import StudentFeeGroup from '../view/exam/StudentFeeGroup';

const PAGE_SIZE = 10;

// Day mapping function
const getDayName = (value) => {
  const dayMap = {
    1: 'শুক্রবার',
    2: 'শনিবার',
    3: 'রবিবার',
    4: 'সোমবার',
    5: 'মঙ্গলবার',
    6: 'বুধবার',
    7: 'বৃহস্পতিবার',
  };
  return dayMap[value] || value;
};

// Time period mapping function
const getTimePeriod = (value) => {
  const periodMap = {
    1: 'সকাল',
    2: 'দুপুর',
    3: 'বিকাল',
    4: 'রাত',
  };
  return periodMap[value] || value;
};

// Bangla digit to English converter
const banglaDigitMap = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

const convertBanglaToEnglishDigit = (str) =>
  str
    ?.split('')
    ?.map((char) => banglaDigitMap[char] ?? char)
    ?.join('') || '';

const ExamRouting = ({ pageTitle }) => {
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
  // Create an array to track visibility for each select (12 columns)
  const [editId, setEditId] = useState(null);
  const [visibility, setVisibility] = useState(Array(14).fill(true));

  const toggleVisibility = (index) => {
    const newVisibility = [...visibility];
    newVisibility[index] = !newVisibility[index];
    setVisibility(newVisibility);
  };
  const [printView, setPrintView] = useState(false);
  const [SessionID = '', ExamID = '', SubClassID = '', PrintID = ''] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
    'PrintID',
  ]);

  const copyToAll = watch('copyToAll');
  const firstDate = watch('date_0');
  const skip = !SessionID || !ExamID || !SubClassID || !PrintID;

  const { data, isLoading, error, isError, isFetching } =
    useGetExamRoutineQuery(
      {
        sessionID: SessionID,
        examID: ExamID,
        subclassID: SubClassID,
        printID: PrintID,
      },
      { skip }
    );

  const [postExamRoutine] = usePostExamRoutineMutation();
  const [updateExamRoutine] = usePutExamRoutineMutation();
  const [deleteExamRoutine] = useDeleteExamRoutineMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const subClassID = watch('SubClassID');

  const { data: subjectsData = [] } = useGetAcademicSubjectsBySubClassQuery(
    subClassID ? subClassID : skipToken
  );
  const { data: editData = [] } = useGetSingleExamRoutineQuery(
    editId ? editId : skipToken
  );
  console.log(editData, 'editData');

  const examID = watch('ExamID');
  const sessionID = watch('SessionID');

  // Prevent API call if missing
  const payload = examID && sessionID ? { examID, sessionID } : skipToken;

  const {
    data: viewData = [],
    isLoading: isLoadingExamRoutine,
    isError: isErrorExamRoutine,
    refetch,
  } = useGetAllExamRoutineQuery(payload);

  const totalPages = Math.ceil((viewData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return viewData?.slice(start, start + PAGE_SIZE) || [];
  }, [viewData, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);
  /** -----------------------
   * Copy first date to all if checkbox is checked
   * ----------------------- */
  useEffect(() => {
    if (copyToAll) {
      for (let i = 1; i < 14; i++) {
        setValue(`date_${i}`, firstDate || '');
      }
    }
  }, [copyToAll, firstDate, setValue]);

  // // Handle date input with auto-format
  // const handleDateInput = (index, value) => {
  //   const cleanedValue = value.replace(/[^\d/]/g, '');
  //   if (cleanedValue.length === 2 && !cleanedValue.includes('/')) {
  //     setValue(`date_${index}`, cleanedValue + '/');
  //   } else if (
  //     cleanedValue.length === 5 &&
  //     cleanedValue.split('/')[1]?.length === 2
  //   ) {
  //     setValue(`date_${index}`, cleanedValue + '/');
  //   } else {
  //     setValue(`date_${index}`, cleanedValue);
  //   }
  // };
  // Handle date input as plain text (all languages)
  const handleDateInput = (index, value) => {
    // শুধু input 그대로 state-এ রাখবে, কোন filter/auto-format নেই
    setValue(`date_${index}`, value);
  };

  // Handle day input with auto-completion (like MonthNamesForm)
  const handleDayInput = (index, e) => {
    const value = e.target.value;
    const englishValue = convertBanglaToEnglishDigit(value);

    if (['1', '2', '3', '4', '5', '6', '7'].includes(englishValue)) {
      const convertedValue = getDayName(englishValue);
      setValue(`day_${index}`, convertedValue);
      e.target.value = convertedValue;
    } else {
      setValue(`day_${index}`, value);
    }
  };

  // Handle start time input with auto-completion (like MonthNamesForm)
  const handleStartTimeInput = (index, e) => {
    const value = e.target.value;
    const englishValue = convertBanglaToEnglishDigit(value);

    if (['1', '2', '3', '4'].includes(englishValue)) {
      const convertedValue = getTimePeriod(englishValue);
      setValue(`startTime_${index}`, convertedValue);
      e.target.value = convertedValue;
    } else {
      setValue(`startTime_${index}`, value);
    }
  };

  // Handle end time input with auto-completion (like MonthNamesForm)
  const handleEndTimeInput = (index, e) => {
    const value = e.target.value;
    const englishValue = convertBanglaToEnglishDigit(value);

    if (['1', '2', '3', '4'].includes(englishValue)) {
      const convertedValue = getTimePeriod(englishValue);
      setValue(`endTime_${index}`, convertedValue);
      e.target.value = convertedValue;
    } else {
      setValue(`endTime_${index}`, value);
    }
  };

  // Auto-tab and convert function (like MonthNamesForm)
  const handleAutoConvertAndTab = (fieldType, index, e) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      const inputVal = e.target.value.trim();
      const englishVal = convertBanglaToEnglishDigit(inputVal);

      let convertedVal = null;

      if (fieldType === 'day') {
        convertedVal = getDayName(englishVal);
      } else if (fieldType === 'time') {
        convertedVal = getTimePeriod(englishVal);
      }

      if (convertedVal && convertedVal !== inputVal) {
        e.preventDefault();
        setValue(`${fieldType}_${index}`, convertedVal);
        e.target.value = convertedVal;

        setTimeout(() => {
          const formElements = e.target.form?.elements || [];
          const currentIndex = [...formElements].indexOf(e.target);
          const nextIndex = currentIndex + 1;

          if (nextIndex < formElements.length) {
            const nextElement = formElements[nextIndex];
            if (nextElement && nextElement.focus) {
              nextElement.focus();
            }
          }
        }, 0);
      }
    }
  };

  // Update Handle
  // Updated handleEdit function
  const handleEdit = (id) => {
    setEditId(id);
  };

  useEffect(() => {
    if (editData?.landView || editData?.routineView) {
      // console.log('Editing row:', editData);

      // Reset form
      methods.reset();

      const { landView, routineView } = editData;

      // Set fields from routineView
      if (routineView) {
        methods.setValue('RoomNo', routineView.RoomNo || '');
        methods.setValue('RoomName', routineView.RoomName || '');
      }

      // Set basic fields from landView
      const basicFields = {
        SessionID: landView.SessionID,
        ExamID: landView.ExamID,
        SubClassID: landView.SubClassID,
        ERIDL: landView.ERIDL,
        SubClass: landView.SubClass || '',
        StartTime: landView.StartTime ? landView.StartTime.trim() : '',
        EndTime: landView.EndTime ? landView.EndTime.trim() : '',
      };

      Object.entries(basicFields).forEach(([key, value]) => {
        if (value !== undefined) methods.setValue(key, value);
      });

      // Reset visibility array when editing
      setVisibility(Array(14).fill(true));

      // Set all 14 columns
      for (let i = 0; i < 14; i++) {
        const apiIndex = i + 1;
        const formIndex = i;

        const date = landView[`Date${apiIndex}`];
        const day = landView[`Day${apiIndex}`];
        const time = landView[`Time${apiIndex}`];
        const subjectId = landView[`Sub${apiIndex}`];

        methods.setValue(
          `date_${formIndex}`,
          date ? date.replace(/-/g, '/') : ''
        );
        methods.setValue(`day_${formIndex}`, day || '');
        methods.setValue(`startTime_${formIndex}`, time || '');
        methods.setValue(`endTime_${formIndex}`, time || '');
        methods.setValue(`subject_${formIndex}`, subjectId || '');
      }

      console.log('Form populated successfully');
    }
  }, [editData, methods]);

  // Delete Exam Feee Setting data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'আপনি কি নিশ্চিত?',
      text: 'একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
      cancelButtonText: 'বাতিল',
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteExamRoutine(id).unwrap();

        Swal.fire({
          icon: 'success',
          title: 'সফলভাবে মুছে ফেলা হয়েছে',
          text: response?.message || 'ডেটা সফলভাবে মুছে ফেলা হয়েছে।',
        });

        refetch(); // Reload table
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'ত্রুটি ঘটেছে!',
          text:
            error?.data?.message ||
            error?.data?.error ||
            'ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।',
        });
        console.error('Delete error:', error);
      }
    }
  };

  /** ------------------------
   *  SMART PRINT HANDLER (PERFECT)
   * ------------------------ */
  const handlePrintView = () => {
    // ---- Validation ----
    if (!SessionID || !ExamID || !SubClassID) {
      Swal.fire(
        'Warning!',
        'Session, Exam, SubClass নির্বাচন করুন।',
        'warning'
      );
      return;
    }

    if (!PrintID) {
      Swal.fire('Warning!', 'Report টাইপ নির্বাচন করুন।', 'warning');
      return;
    }

    // ---- Loading popup ----
    Swal.fire({
      title: 'লোড হচ্ছে...',
      text: 'ডাটা লোড হওয়া পর্যন্ত অপেক্ষা করুন',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ---- Wait until API finished ----
    const waitForData = setInterval(() => {
      if (!isLoading) {
        clearInterval(waitForData);
        console.log(isError, data?.data, '!data?.data');

        if (!data?.data || data?.data?.length === 0) {
          Swal.fire(
            'Error!',
            'রুটিন পাওয়া যায়নি অথবা সার্ভারে সমস্যা হয়েছে',
            'error'
          );
          return;
        }

        Swal.close(); // remove loading

        // ---- Ready to Print ----
        setPrintView(true);

        setTimeout(() => {
          window.print();
        }, 500); // ensure component rendered fully
      }
    }, 100); // check every 100ms
  };

  // Data Create Exam Fee Setting
  // const onSubmit = async (formData) => {
  //   console.log(formData, 'formData');

  //   // ============================
  //   // 🔥 1. Basic validation
  //   // ============================
  //   if (
  //     !Number(formData.SessionID) ||
  //     !Number(formData.SubClassID) ||
  //     !Number(formData.ExamID)
  //   ) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'ফর্ম অসম্পূর্ণ',
  //       text: 'Session, SubClass এবং Exam নির্বাচন করুন।',
  //     });
  //     return;
  //   }
  //   const totalDateCount = Array.from({ length: 14 }).filter((_, index) => {
  //     return formData[`date_${index}`];
  //   }).length;
  //   // ============================
  //   // 🔥 2. Build routine data
  //   // ============================
  //   const routineData = Array.from({ length: 14 }).map((_, index) => {
  //     const startTimeRaw = formData[`startTime_${index}`] || '';
  //     const endTimeRaw = formData[`endTime_${index}`] || '';

  //     return {
  //       SessionID: Number(formData.SessionID),
  //       ExamID: Number(formData.ExamID),
  //       SubClassID: Number(formData.SubClassID),

  //       RoomNo: formData.RoomNo || '',
  //       RoomName: formData.RoomName || '',

  //       StartTime: startTimeRaw.replace(' AM', '').replace(' PM', ''),
  //       EndTime: endTimeRaw.replace(' AM', '').replace(' PM', ''),

  //       Date1: formData[`date_${index}`]
  //         ? formData[`date_${index}`].replace(/\//g, '-')
  //         : '',

  //       Day1: formData[`day_${index}`] || '',

  //       Time1: startTimeRaw.replace(' AM', '').replace(' PM', ''),

  //       Sub1: formData[`subject_${index}`] || '',

  //       TotalColumn: totalDateCount,
  //     };
  //   });

  //   // ============================
  //   // 🔥 3. Remove ALL empty rows
  //   // ============================
  //   // const filteredRoutineData = routineData.filter((item) => item.Date1 !== '');
  //   // ============================
  //   // 🔥 3. Remove ALL empty rows
  //   // ============================
  //   const filteredRoutineData = routineData.filter((item) => {
  //     const fields = [item.Date1, item.Day1, item.Time1, item.Sub1];

  //     const isAnyFilled = fields.some((v) => v && v !== '');
  //     const isAllFilled = fields.every((v) => v && v !== '');

  //     // যদি সব খালি → স্কিপ (false)
  //     if (!isAnyFilled) return false;

  //     // যদি কিছু ভরা, কিছু খালি → error
  //     if (isAnyFilled && !isAllFilled) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'অসম্পূর্ণ রুটিন ডাটা',
  //         text: 'Date, Day, Time এবং Subject সবগুলো পূরণ করুন।',
  //       });
  //       throw 'validation error';
  //     }

  //     // সব ঠিক থাকলে row accept হবে
  //     return true;
  //   });

  //   // ❌ Bug fix — your old condition was wrong
  //   if (filteredRoutineData.length === 0) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'ফর্ম অসম্পূর্ণ',
  //       text: 'কমপক্ষে ১টি Routine Row পূরণ করুন।',
  //     });
  //     return;
  //   }

  //   // ============================
  //   // 🔥 4. Final payload
  //   // ============================
  //   const payload = {
  //     routine: filteredRoutineData,
  //   };
  //   const payloadUpdate = {
  //     routine: filteredRoutineData,
  //     ID: formData.ERIDL,
  //   };

  //   try {
  //     let response;

  //     // ============================
  //     // 🔥 5. Create / Update logic
  //     // ============================
  //     if (payloadUpdate.ID) {
  //       // update logic চাইলে করে দেবেন
  //       response = await updateExamRoutine(payloadUpdate).unwrap();
  //       console.log(payloadUpdate, 'payloadUpdate');
  //     } else {
  //       response = await postExamRoutine(payload).unwrap();
  //       console.log(payload, 'payload');
  //     }

  //     Swal.fire({
  //       icon: 'success',
  //       title: 'সফলভাবে সংরক্ষণ হয়েছে',
  //       text: response?.message || 'Exam Routine সফলভাবে সংরক্ষিত হয়েছে।',
  //     }).then(() => {
  //       // methods.reset();  // যদি reset করতে চান enable করুন
  //       // refetch();
  //     });
  //   } catch (error) {
  //     const errMsg =
  //       error?.data?.message ||
  //       error?.data?.error ||
  //       'অজানা একটি ত্রুটি ঘটেছে।';

  //     Swal.fire({
  //       icon: 'error',
  //       title: 'ত্রুটি ঘটেছে!',
  //       text: errMsg,
  //     });

  //     console.error('Exam Routine Error:', error);
  //   }
  // };

  const onSubmit = async (formData) => {
    console.log(formData, 'formData');

    // ============================
    // 1️⃣ Basic validation
    // ============================
    if (
      !Number(formData.SessionID) ||
      !Number(formData.SubClassID) ||
      !Number(formData.ExamID)
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'Session, SubClass এবং Exam নির্বাচন করুন।',
      });
      return;
    }

    const totalDateCount = Array.from({ length: 14 }).filter((_, index) => {
      return formData[`date_${index}`];
    }).length;

    // ============================
    // 2️⃣ Build routine data
    // ============================
    const routineData = Array.from({ length: 14 }).map((_, index) => {
      const startTimeRaw = formData[`startTime_${index}`] || '';
      const endTimeRaw = formData[`endTime_${index}`] || '';

      return {
        SessionID: Number(formData.SessionID),
        ExamID: Number(formData.ExamID),
        SubClassID: Number(formData.SubClassID),

        RoomNo: formData.RoomNo || '',
        RoomName: formData.RoomName || '',

        StartTime: startTimeRaw.replace(' AM', '').replace(' PM', ''),
        EndTime: endTimeRaw.replace(' AM', '').replace(' PM', ''),

        Date1: formData[`date_${index}`]
          ? formData[`date_${index}`].replace(/\//g, '-')
          : '',

        Day1: formData[`day_${index}`] || '',

        Time1: startTimeRaw.replace(' AM', '').replace(' PM', ''),

        Sub1: formData[`subject_${index}`] || '',

        TotalColumn: totalDateCount,
      };
    });

    // ============================
    // 3️⃣ Filter & validate rows
    // ============================
    const filteredRoutineData = [];
    for (let item of routineData) {
      const fields = [item.Date1, item.Day1, item.Time1, item.Sub1];
      const isAnyFilled = fields.some((v) => v && v !== '');
      const isAllFilled = fields.every((v) => v && v !== '');

      // skip completely empty rows
      if (!isAnyFilled) continue;

      // If partially filled → warning and stop submission
      if (isAnyFilled && !isAllFilled) {
        await Swal.fire({
          icon: 'warning',
          title: 'অসম্পূর্ণ রুটিন ডাটা',
          text: 'Date, Day, Time এবং Subject সবগুলো পূরণ করুন।',
        });
        return; // ✅ stop submission
      }

      // Valid row → add to filtered list
      filteredRoutineData.push(item);
    }

    if (filteredRoutineData.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'কমপক্ষে ১টি Routine Row পূরণ করুন।',
      });
      return;
    }

    // ============================
    // 4️⃣ Prepare payload
    // ============================
    const payload = {
      routine: filteredRoutineData,
    };
    const payloadUpdate = {
      routine: filteredRoutineData,
      ID: formData.ERIDL,
    };

    try {
      let response;

      // ============================
      // 5️⃣ Create / Update
      // ============================
      if (payloadUpdate.ID) {
        response = await updateExamRoutine(payloadUpdate).unwrap();
        console.log(payloadUpdate, 'payloadUpdate');
      } else {
        response = await postExamRoutine(payload).unwrap();
        console.log(payload, 'payload');
      }

      await Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: response?.message || 'Exam Routine সফলভাবে সংরক্ষিত হয়েছে।',
      });

      // Optional: reset or refetch
      // methods.reset();
      // refetch();
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        'অজানা একটি ত্রুটি ঘটেছে।';

      await Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: errMsg,
      });

      console.error('Exam Routine Error:', error);
    }
  };


  // Table Data Columns
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.exam_routine}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEdit(row.ERIDL)} />
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.exam_routine}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDelete(row.ERIDL)} />
          </ViewPermission>
        </div>
      ),
    },
    {
      title: translate('ERIDL'),
      hozAlign: 'center',
      render: (row) => <>{row?.ERIDL}</>,
    },
    {
      title: translate('Class/Jamaat'),
      hozAlign: 'center',
      render: (row) => <>{row?.SubClass}</>,
    },

    {
      title: translate('Subject-1'),
      field: 'Subj1',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj2',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj3',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj4',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj5',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj6',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj7',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj8',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj9',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj10',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj11',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj12',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj13',
      hozAlign: 'center',
    },
    {
      title: translate('Subject-1'),
      field: 'Subj14',
      hozAlign: 'center',
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  const dateOptions = [{ id: 1, name: 'Copy To All Box' }];

  const printData = [
    {
      PrintID: 1,
      PrintName: 'প্রতি ক্লাস প্রতি পৃষ্ঠায় আলাদা বাংলা A5।',
    },
    {
      PrintID: 2,
      PrintName: 'প্রতি ক্লাস প্রতি পৃষ্ঠায় আলাদা বাংলা A4।',
    },
    {
      PrintID: 3,
      PrintName: 'সকল ক্লাস একত্রে বাংলা A5।',
    },
    {
      PrintID: 4,
      PrintName: 'সকল ক্লাস একত্রে বাংলা A4।',
    },
    {
      PrintID: 5,
      PrintName: 'স্বাক্ষর/দস্তখত পত্র',
    },
  ];
  // Clear button handlers
  const clearDateFields = () => {
    for (let i = 0; i < 14; i++) {
      setValue(`date_${i}`, '');
    }
  };

  const clearDayFields = () => {
    for (let i = 0; i < 14; i++) {
      setValue(`day_${i}`, '');
    }
  };

  const clearStartTimeFields = () => {
    for (let i = 0; i < 14; i++) {
      setValue(`startTime_${i}`, '');
    }
  };

  const clearEndTimeFields = () => {
    for (let i = 0; i < 14; i++) {
      setValue(`endTime_${i}`, '');
    }
  };
  useEffect(() => {
    if (isLoading || isFetching) {
      Swal.fire({
        title: 'লোড হচ্ছে...',
        html: 'অনুগ্রহ করে অপেক্ষা করুন',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    } else {
      Swal.close();
    }
  }, [isLoading, isFetching]);

  useEffect(() => {
    if (isError) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: error?.message || 'কিছু ভুল হয়েছে',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  }, [isError, error]);

  return (
    <div className="">
      <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg print:hidden">
        {/* Header */}
        <div className="filter_header border-b border-[#e9edf4] pb-4 md:pb-5">
          <h3 className="text-lg md:text-xl font-bold">
            {translate('Exam Routing')}
          </h3>
        </div>

        <FormProvider {...methods}>
          <form
            className="w-full space-y-4 md:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input type="hidden" {...register('ID')} />

            {/* Top Section - 4 responsive columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 my-3">
              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Exam Name')}
                options={examNameData ?? []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Class/Jamaat')}
                options={subClassListData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode={true}
              />

              <div className="grid grid-cols-2 gap-3">
                <DefaultInput
                  registerKey="RoomNo"
                  label={`${translate('Hall No')}`}
                  className="w-full"
                />
                <DefaultInput
                  registerKey="RoomName"
                  label={`${translate('Hall Name')}`}
                  className="w-full"
                />
              </div>
            </div>

            {/* Date Checkbox */}
            <div className="flex items-start w-full mb-4">
              <ExamRoutingCheckbox
                label="পরীক্ষার তারিখ"
                options={dateOptions}
                registerKey="copyToAll"
                labelPosition="left"
              />
            </div>

            {/* Grid Sections */}
            <div className="space-y-4">
              {/* Date Section */}
              <div>
                {/* <h3 className="text-base font-medium mb-2">
                  {translate('তারিখ')}
                </h3> */}
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`date-${index}`} className="w-full sm:w-24">
                      <Input
                        {...register(`date_${index}`)}
                        placeholder="date"
                        type="text"
                        onChange={(e) => handleDateInput(index, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={clearDateFields}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Day Section */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('বার :')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`day-${index}`} className="w-full sm:w-24">
                      <Input
                        key={`day-${index}`}
                        {...register(`day_${index}`)}
                        placeholder="1-7 লিখুন"
                        type="text"
                        onChange={(e) => handleDayInput(index, e)}
                        onKeyDown={(e) =>
                          handleAutoConvertAndTab('day', index, e)
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={clearDayFields}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Start Time Section */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('শুরু সময় :')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`startTime-${index}`} className="w-full sm:w-24">
                      <Input
                        key={`startTime-${index}`}
                        {...register(`startTime_${index}`)}
                        placeholder="1-4 লিখুন"
                        type="text"
                        onChange={(e) => handleStartTimeInput(index, e)}
                        onKeyDown={(e) =>
                          handleAutoConvertAndTab('time', index, e)
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={clearStartTimeFields}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* End Time Section */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('শেষ সময় :')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`endTime-${index}`} className="w-full sm:w-24">
                      <Input
                        key={`endTime-${index}`}
                        {...register(`endTime_${index}`)}
                        placeholder="1-4 লিখুন"
                        type="text"
                        onChange={(e) => handleEndTimeInput(index, e)}
                        onKeyDown={(e) =>
                          handleAutoConvertAndTab('time', index, e)
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={clearEndTimeFields}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Select with Toggle */}
              <div>
                <h3 className="text-base font-medium mb-2">
                  {translate('বিষয় :')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 14 }).map((_, index) => {
                    const subjectValue = watch(`subject_${index}`);

                    return (
                      <div key={`select-${index}`} className="w-full sm:w-24">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="checkbox"
                              checked={!visibility[index]}
                              onChange={() => toggleVisibility(index)}
                              className="cursor-pointer h-4 w-4"
                            />
                            <label
                              className="text-xs cursor-pointer"
                              onClick={() => toggleVisibility(index)}
                            >
                              {visibility[index] ? 'Hide' : 'Show'}
                            </label>
                          </div>
                          {visibility[index] && (
                            <select
                              {...register(`subject_${index}`)}
                              value={subjectValue || ''}
                              onChange={(e) =>
                                setValue(`subject_${index}`, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Subject</option>
                              {subjectsData?.data?.map((subject) => (
                                <option
                                  key={subject.SubjectID}
                                  value={subject.SubjectID}
                                >
                                  {subject.SubjectName}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <ViewPermission
                permissionId={permissionsDataList.routine_with_signature}
                permissionType="insert"
                empty={true}
              >
                <Button type="submit" className="w-full sm:w-auto">
                  {translate('Save')}
                </Button>
              </ViewPermission>
              <Button
                type="button"
                onClick={() => methods.reset()}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
              >
                {translate('Reset')}
              </Button>
              <div className="w-64">
                <DefaultSelect
                  label={translate('Report/Type')}
                  labelPosition="left"
                  options={printData ?? []}
                  valueField="PrintID"
                  nameField="PrintName"
                  registerKey="PrintID"
                />
              </div>
              <Button
                type="button"
                onClick={handlePrintView}
                className="w-full sm:w-auto"
              >
                {translate('Print')}
              </Button>
            </div>
          </form>
        </FormProvider>

        {/* Table Section */}

        {viewData?.length > 0 && (
          <>
            <div className="mt-5 overflow-x-auto">
              {isLoadingExamRoutine ? (
                <Loading />
              ) : isErrorExamRoutine ? (
                <div className="text-red-500 text-center py-4">
                  {translate('Failed to load exam routine. Please try again.')}
                </div>
              ) : (
                <SortableTable
                  columns={columns}
                  data={paginatedData}
                  isFilterColumn={false}
                />
              )}
            </div>

            {/* Pagination */}
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
      <div className="hidden print:block">
        {printView && (
          <>
            {Number(PrintID) === 1 && (
              <SingleClassRoutingPDF data={data?.data} pageSize="A5" />
            )}
            {Number(PrintID) === 2 && (
              <SingleClassRoutingPDF data={data?.data} pageSize="A4" />
            )}
            {Number(PrintID) === 3 && (
              <AllClassRoutingPDF data={data?.data} pageSize="A5" />
            )}
            {Number(PrintID) === 4 && (
              <AllClassRoutingPDF data={data?.data} pageSize="A4" />
            )}
            {Number(PrintID) === 5 && (
              <ExamSignatureRoutingPDF data={data?.data} />
            )}
          </>
        )}
      </div>
    </div>
  );
};;

export default ExamRouting;
