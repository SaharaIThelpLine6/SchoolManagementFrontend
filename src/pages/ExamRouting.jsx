import { useEffect, useRef, useState } from 'react';
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
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import TimePicker from '../components/Forms/DatePicker/TimePicker';

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
  const isSubmittingRef = useRef(false);

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
  // const handleDateInput = (index, value) => {
  //   // শুধু input 그대로 state-এ রাখবে, কোন filter/auto-format নেই
  //   setValue(`date_${index}`, value);
  // };

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
      methods.reset();

      const { landView, routineView } = editData;

      // RoomNo, RoomName — routineView array এর প্রথম item থেকে
      if (routineView?.length > 0) {
        methods.setValue('RoomNo', routineView[0].RoomNo || '');
        methods.setValue('RoomName', routineView[0].RoomName || '');
      }

      // Basic fields from landView
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

      setVisibility(Array(14).fill(true));

      // Set all 14 columns
      for (let i = 0; i < 14; i++) {
        const apiIndex = i + 1;

        const date = landView[`Date${apiIndex}`];
        const day = landView[`Day${apiIndex}`];
        const subjectId = landView[`Sub${apiIndex}`];

        // ✅ routineView array থেকে index অনুযায়ী StartTime ও EndTime নাও
        const routineRow = routineView?.[i];
        const startTime = routineRow?.StartTime?.trim() || '';
        const endTime = routineRow?.EndTime?.trim() || '';

        methods.setValue(`date_${i}`, date ? date : '');
        methods.setValue(`day_${i}`, day || '');
        methods.setValue(`startTime_${i}`, startTime);  // ✅ per-row StartTime
        methods.setValue(`endTime_${i}`, endTime);       // ✅ per-row EndTime
        methods.setValue(`subject_${i}`, subjectId || '');
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


  const [openSlots, setOpenSlots] = useState({ 0: true })

  const toggleSlot = (index) => {
    setOpenSlots(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const onSubmit = async (formData) => {
    if (isSubmittingRef.current) {
      console.log("❌ Blocked: Already submitting");
      return;
    }
    isSubmittingRef.current = true;
    try {
      // ============================
      // 1️⃣ Basic validation
      // ============================
      if (
        !Number(formData.SessionID) ||
        !Number(formData.SubClassID) ||
        !Number(formData.ExamID)
      ) {
        await Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "Session, SubClass এবং Exam নির্বাচন করুন।",
        });

        return;
      }

      // Count total dates
      const totalDateCount = Array.from({ length: 14 }).filter(
        (_, index) => formData[`date_${index}`]
      ).length;

      // ============================
      // 2️⃣ Build routine data
      // ============================
      const routineData = Array.from({ length: 14 }).map((_, index) => ({
        SessionID: Number(formData.SessionID),
        ExamID: Number(formData.ExamID),
        SubClassID: Number(formData.SubClassID),

        RoomNo: formData.RoomNo || "",
        RoomName: formData.RoomName || "",

        Date: String(formData[`date_${index}`]),
        Day: formData[`day_${index}`] || "",
        Sub: formData[`subject_${index}`] || "",

        StartTime:  String(formData[`startTime_${index}`]),
        EndTime: String(formData[`endTime_${index}`]),

        TotalColumn: totalDateCount,
        BnExamDate: formData[`bndate_${index}`] || "",
      }));

      console.log("Routine Data:", routineData);

      // ============================
      // 3️⃣ Filter & validate rows
      // ============================
      const filteredRoutineData = [];

      for (const item of routineData) {
        const fields = [
          item.Date,
          item.Day,
          item.Sub,
          item.StartTime,
          item.EndTime,
        ];

        const isAnyFilled = fields.some(
          (v) => v !== undefined && v !== null && String(v).trim() !== "" && String(v).trim() != 'null'
        );

        const isAllFilled = fields.every(
          (v) => v !== undefined && v !== null && String(v).trim() !== "" && String(v).trim() != 'null'
        );

        // Skip completely empty rows
        if (!isAnyFilled) {
          continue;
        }

        // Partial row validation
        if (!isAllFilled) {
          await Swal.fire({
            icon: "warning",
            title: "অসম্পূর্ণ রুটিন ডাটা",
            text:
              "Date, Day, Subject, Start Time এবং End Time সবগুলো পূরণ করুন।",
          });

          return;
        }

        filteredRoutineData.push(item);
      }

      // ============================
      // 4️⃣ Check at least one row
      // ============================
      if (filteredRoutineData.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "কমপক্ষে ১টি Routine Row পূরণ করুন।",
        });

        return;
      }

      console.log("Filtered Routine Data:", filteredRoutineData);

      // ============================
      // 5️⃣ Prepare payload
      // ============================
      const payload = {
        routine: filteredRoutineData,
      };

      const payloadUpdate = {
        routine: filteredRoutineData,
        ID: formData.ERIDL,
      };

      let response;

      // ============================
      // 6️⃣ Create / Update
      // ============================
      if (payloadUpdate.ID) {
        response = await updateExamRoutine(payloadUpdate).unwrap();
      } else {
        response = await postExamRoutine(payload).unwrap();
      }

      // ============================
      // 7️⃣ Success Message
      // ============================
      await Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text:
          response?.message ||
          "Exam Routine সফলভাবে সংরক্ষিত হয়েছে।",
      });
    } catch (error) {
      console.error("❌ CATCH BLOCK EXECUTED");
      console.error("Full Error:", error);
      console.error("Error Data:", error?.data);
      console.error("Error Message:", error?.message);

      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "অজানা একটি ত্রুটি ঘটেছে।";

      await Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: errMsg,
      });
    } finally {
      isSubmittingRef.current = false;
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

    ...Array.from({ length: 14 }, (_, index) => ({
      title: translate(`Subject-${index + 1}`),
      field: `Subj${index + 1}`,
      hozAlign: 'center',
    })),
  ];



  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  const dateOptions = [{ id: 1, name: '' }];

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
  const clearBdDateFields = () => {
    for (let i = 0; i < 14; i++) {
      setValue(`bndate_${i}`, '');
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
            className="w-full hidden lg:block space-y-4 md:space-y-6"
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


            <div className="flex items-center gap-0 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">

              <ExamRoutingCheckbox
                label=""
                options={dateOptions}
                registerKey="copyToAll"
                labelPosition="left"
              />
              <label htmlFor="copyToAll" className="text-sm font-medium text-blue-700 cursor-pointer flex items-center gap-2">
                পরীক্ষার তারিখ সব কলামে কপি করুন
              </label>

            </div>
            {/* 
            <div className="flex items-start w-full mb-4">

            </div> */}

            {/* Grid Sections */}
            <div className="space-y-4">

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-semibold uppercase tracking-widest text-black">সময়সূচি</span>
                <div className="flex-1 h-px bg-gray-100 ml-2"></div>
              </div>

              <div className='rounded-[6px] border border-gray-400 border-b-0 overflow-hidden mb-6'>

                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900">সারি</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">২</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৩</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৪</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৫</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৬</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৭</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৮</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">৯</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১০</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১১</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১২</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১৩</div>
                  <div className="py-2 text-center text-sm font-semibold text-gray-900 border-l border-gray-400">১৪</div>
                  <div className="border-l border-gray-400"></div>
                </div>

                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">{translate('Date')}</div>


                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`date-${index}`} className="border-r border-gray-400 text-center text-xs text-black bg-transparent hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-1 focus:ring-blue-400 transition-colors">
                      <DatePickerOne require={false} registerKey={`date_${index}`} placeholder={"Date"} timestamp={false} />

                    </div>
                  ))}



                  <div className='p-1 text-center'>
                    <Button
                      type="button"
                      className="bg-rose-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold px-2 py-1 transition-colors whitespace-nowrap"
                      onClick={clearDateFields}
                    >
                      Clear
                    </Button>
                  </div>
                </div>



                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">{translate('Bangla / Arabic Date')}</div>


                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`date-${index}`} className="border-r border-gray-400 text-center text-xs text-black bg-transparent hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-1 focus:ring-blue-400 transition-colors">
                      <Input
                        {...register(`bndate_${index}`)}
                        placeholder={translate("Date")}
                        type="text"
                        className="w-full h-full px-1 py-2 focus:outline-0"
                      />
                    </div>
                  ))}



                  <div className='p-1 text-center'>
                    <Button
                      type="button"
                      className="bg-rose-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold px-2 py-1 transition-colors whitespace-nowrap"
                      onClick={clearBdDateFields}
                    >
                      Clear
                    </Button>
                  </div>
                </div>



                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">বার</div>


                  {Array.from({ length: 14 }).map((_, index) => (
                    <div key={`day-${index}`} className="border-r border-gray-400 text-center text-xs text-black bg-transparent hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-1 focus:ring-blue-400 transition-colors">
                      <Input
                        key={`day-${index}`}
                        {...register(`day_${index}`)}
                        placeholder="1-7 লিখুন"
                        type="text"
                        onChange={(e) => handleDayInput(index, e)}
                        onKeyDown={(e) =>
                          handleAutoConvertAndTab('day', index, e)
                        }
                        className="w-full h-full px-1 py-2 focus:outline-0"
                      />
                    </div>
                  ))}
                  <div className='p-1 text-center'>
                    <Button
                      type="button"
                      className="bg-rose-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold px-2 py-1 transition-colors whitespace-nowrap"
                      onClick={clearDayFields}
                    >
                      Clear
                    </Button>
                  </div>
                </div>



                {/* Start Time Section */}
                <div
                  className="grid grid-cols-16 bg-gray-50 border-b border-gray-400"
                  style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
                >
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">
                    {translate('শুরু সময়')}
                  </div>

                  {Array.from({ length: 14 }).map((_, index) => (
                    <div
                      key={`startTime-${index}`}
                      className="border-r border-gray-400 text-center text-xs text-black bg-transparent hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-1 focus:ring-blue-400 transition-colors"
                    >
                      <TimePicker
                        placeholder={`${translate("Select Time")}...`}
                        registerKey={`startTime_${index}`}
                      />

                      {/* <Input
                        {...register(`startTime_${index}`)}
                        placeholder="1-4 লিখুন"
                        type="text"
                        onChange={(e) => handleStartTimeInput(index, e)}
                        onKeyDown={(e) => handleAutoConvertAndTab('time', index, e)}
                        className="w-full h-full px-1 py-2 focus:outline-0 border-0 rounded-none"
                      /> */}
                    </div>
                  ))}
                  <div className='p-1 text-center'>
                    <Button
                      type="button"
                      className="bg-rose-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold px-2 py-1 transition-colors whitespace-nowrap"
                      onClick={clearStartTimeFields}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                {/* End Time Section */}
                <div
                  className="grid grid-cols-16 bg-gray-50 border-b border-gray-400"
                  style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}
                >
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">
                    {translate('শেষ সময়')}
                  </div>

                  {Array.from({ length: 14 }).map((_, index) => (
                    <div
                      key={`endTime-${index}`}
                      className="border-r border-gray-400 text-center text-xs text-black bg-transparent hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-1 focus:ring-blue-400 transition-colors"
                    >



                      <TimePicker
                        placeholder={`${translate("Select Time")}...`}
                        registerKey={`endTime_${index}`}
                      />
                      {/* <Input
                        {...register(`endTime_${index}`)}
                        placeholder="1-4 লিখুন"
                        type="text"
                        onChange={(e) => handleEndTimeInput(index, e)}
                        onKeyDown={(e) => handleAutoConvertAndTab('time', index, e)}
                        className="w-full h-full px-1 py-2 focus:outline-0 border-0 rounded-none"
                      /> */}
                    </div>
                  ))}
                  <div className='p-1 text-center'>
                    <Button
                      type="button"
                      className="bg-rose-600 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold px-2 py-1 transition-colors whitespace-nowrap"
                      onClick={clearEndTimeFields}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

              </div>

              {/* Select with Toggle */}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-semibold  tracking-widest text-black">বিষয় (Subjects)</span>
                <div className="flex-1 h-px bg-gray-100 ml-2"></div>
              </div>




              <div className='rounded-[6px] border border-gray-400 border-b-0 overflow-hidden mb-6'>

                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 ">সারি</div>
                  {Array.from({ length: 14 }).map((_, index) => {
                    const subjectValue = watch(`subject_${index}`);
                    return (
                      <div className="flex items-center justify-center gap-1 border-l border-gray-400">
                        <input
                          type="checkbox"
                          checked={!visibility[index]}
                          onChange={() => toggleVisibility(index)}
                          className="cursor-pointer h-4 w-4"
                        />
                        <label
                          className="text-sm cursor-pointer"
                          onClick={() => toggleVisibility(index)}
                        >
                          {visibility[index] ? 'Hide' : 'Show'}
                        </label>
                      </div>
                    )

                  })}
                  <div className="border-l border-gray-400 border-l border-gray-400"></div>
                </div>



                <div className="grid grid-cols-16 bg-gray-50 border-b border-gray-400" style={{ gridTemplateColumns: 'repeat(16, minmax(0, 1fr))' }}>
                  <div className="px-3 py-2 text-sm font-semibold text-gray-900 border-r border-gray-400">বিষয়</div>


                  {Array.from({ length: 14 }).map((_, index) => {
                    const subjectValue = watch(`subject_${index}`);

                    return (
                      <div key={`select-${index}`} className="border-r border-gray-200 text-xs text-gray-700 bg-transparent hover:bg-blue-50 focus:bg-blue-50 transition-colors w-full">
                        {visibility[index] && (
                          <select
                            {...register(`subject_${index}`)}
                            value={subjectValue || ''}
                            onChange={(e) =>
                              setValue(`subject_${index}`, e.target.value)
                            }
                            className="w-full px-1 py-2 focus:outline-none focus:ring-0 focus:ring-blue-500"
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

        <FormProvider  {...methods} className="">
          <form
            className="w-full block lg:hidden space-y-4 md:space-y-6"
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


            <div className="flex items-center gap-0 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">

              <ExamRoutingCheckbox
                label=""
                options={dateOptions}
                registerKey="copyToAll"
                labelPosition="left"
              />
              <label htmlFor="copyToAll" className="text-sm font-medium text-blue-700 cursor-pointer flex items-center gap-2">
                {translate("Keep All The Exam Date Same")}
              </label>

            </div>
            {/* 
            <div className="flex items-start w-full mb-4">

            </div> */}

            {/* Grid Sections */}

            <div className="block md:hidden space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-semibold uppercase tracking-widest text-black">{ translate("Date & Time") }</span>
                <div className="flex-1 h-px bg-gray-100 ml-2"></div>
              </div>

              {Array.from({ length: 14 }).map((_, index) => {

                const isOpen = !!openSlots[index]


                return (
                  <div key={`mobile-slot-${index}`} className="rounded-lg border border-gray-200 p-2 bg-white">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                      <span className="text-xxl font-semibold text-gray-800">পরীক্ষা {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => toggleSlot(index)}
                        className="flex items-center justify-between px-1 py-1 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-blue-700">
                            {
                              isOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-up">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M6 15l6 -6l6 6" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M6 9l6 6l6 -6" />
                                </svg>
                              )
                            }


                          </span>

                        </div>
                      </button>
                    </div>
                    {isOpen && (
                      <div className="space-y-3">

                           <div>
                          <label className="block text-xxl font-semibold uppercase tracking-wider text-black mb-1">
                            তারিখ
                          </label>
                          <DatePickerOne require={false} registerKey={`date_${index}`} placeholder={"Date"} timestamp={false} />
                        </div>

                        
                        <div>
                          <label className="block text-xxl font-semibold uppercase tracking-wider text-black mb-1">
                            Bangla / Arabic Date
                          </label>
                          <Input
                            {...register(`bndate_${index}`)}
                            placeholder={translate("Date")}
                            type="text"
                            // onChange={(e) => handleDateInput(index, e.target.value)}
                            className="w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-custom-focus active:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xxl font-semibold uppercase tracking-wider text-black mb-1">
                            বার
                          </label>
                          <Input
                            {...register(`day_${index}`)}
                            placeholder="1-7 লিখুন"
                            type="text"
                            onChange={(e) => handleDayInput(index, e)}
                            onKeyDown={(e) => handleAutoConvertAndTab('day', index, e)}
                            className="w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-custom-focus active:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                          />
                        </div>

                        <div>
                          <label className="block text-xxl font-semibold uppercase tracking-wider text-black mb-1">
                            শুরু সময়
                          </label>
                          {/* <Input
                            {...register(`startTime_${index}`)}
                            placeholder="1-4 লিখুন"
                            type="text"
                            onChange={(e) => handleStartTimeInput(index, e)}
                            onKeyDown={(e) => handleAutoConvertAndTab('time', index, e)}
                            className="w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-custom-focus active:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                          /> */}
                          <TimePicker
                            placeholder={`${translate("Select Time")}...`}
                            registerKey={`startTime_${index}`}
                          />
                        </div>

                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-xxl text-black mb-1">
                            শেষ সময়
                          </label>
                          {/* <Input
                            {...register(`endTime_${index}`)}
                            placeholder="1-4 লিখুন"
                            type="text"
                            onChange={(e) => handleEndTimeInput(index, e)}
                            onKeyDown={(e) => handleAutoConvertAndTab('time', index, e)}
                            className="w-full rounded border-[1.5px] border-stroke bg-white px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-custom-focus active:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
                          /> */}

                          <TimePicker
                            placeholder={`${translate("Select Time")}...`}
                            registerKey={`endTime_${index}`}
                          />
                        </div>

                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-xxl text-black mb-1">
                            বিষয়
                          </label>
                          {visibility[index] ? (
                            <select
                              {...register(`subject_${index}`)}
                              value={watch(`subject_${index}`) || ''}
                              onChange={(e) => setValue(`subject_${index}`, e.target.value)}
                              className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="">Select Subject</option>
                              {subjectsData?.data?.map((subject) => (
                                <option key={subject.SubjectID} value={subject.SubjectID}>
                                  {subject.SubjectName}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="h-10 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                              Hidden
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              id={`hide-mobile-${index}`}
                              checked={!visibility[index]}
                              onChange={() => toggleVisibility(index)}
                              className="w-4 h-4 accent-blue-600 cursor-pointer"
                            />
                            <label
                              htmlFor={`hide-mobile-${index}`}
                              className="text-xs text-gray-500 cursor-pointer"
                            >
                              {visibility[index] ? 'Hide' : 'Show'}
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              clearDateFields(index)
                              clearDayFields(index)
                              clearStartTimeFields(index)
                              clearEndTimeFields(index)
                            }}
                            className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )
              })}
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
