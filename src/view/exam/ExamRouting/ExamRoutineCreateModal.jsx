import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import useTranslate from '../../../utils/Translate';
import {
  useGetAllExamRoutineQuery,
  useGetExamNamesQuery,
  usePostExamRoutineMutation,
  useGetCheckExamConditionQuery,
  useGetExamSubjectQuery
} from '../../../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetAcademicSubjectsQuery, useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import { setPageName } from '../../../features/auth/authSlice';
import SvgIcon from '../../../components/icons/SvgIcon';

const getDateOnly = (value) => {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const isUtcMidnight =
      value.getUTCHours() === 0 &&
      value.getUTCMinutes() === 0 &&
      value.getUTCSeconds() === 0 &&
      value.getUTCMilliseconds() === 0;
    const year = isUtcMidnight ? value.getUTCFullYear() : value.getFullYear();
    const month = (isUtcMidnight ? value.getUTCMonth() : value.getMonth()) + 1;
    const day = isUtcMidnight ? value.getUTCDate() : value.getDate();
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const getBanglaWeekday = (dateValue) => {
  if (!dateValue) return '';
  const dayIndex = new Date(`${dateValue}T00:00:00`).getDay();
  return ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][dayIndex];
};

const hasExistingRows = (response) => {
  if (Array.isArray(response)) return response.length > 0;
  if (Array.isArray(response?.data)) return response.data.length > 0;
  return Boolean(response);
};

const DEFAULT_SETUP_MESSAGE =
  'এই পরীক্ষার জন্য এখনো পরীক্ষার কন্ডিশন নির্ধারণ করা হয়নি। অনুগ্রহ করে পরীক্ষার ফলাফল প্রস্তুত করার আগে পরীক্ষার কন্ডিশন সেটআপ সম্পন্ন করুন।';

const INITIAL_SYNC = { bnDate: false, startTime: false, endTime: false };

const showToast = (icon, title, timer = 5000) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    width: '28rem',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
  });
};

const ExamRoutineCreateModal = ({ pageTitle }) => {
  const translate = useTranslate();
  const methods = useForm();
  const dispatch = useDispatch();
  const {
    watch,
    handleSubmit,
    setValue,
    register,
    getValues,
    unregister,
  } = methods;
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [examRoutineData, setExamRoutineData] = useState([]);
  // Header checkbox: checked thakle prothom row-er value baki sob row-e copy hoy
  const [syncFields, setSyncFields] = useState(INITIAL_SYNC);
  const rowIdRef = useRef(0);
  const lastAlertedSelectionRef = useRef('');
  const previousSelectionRef = useRef('');
  const lastGeneratedRowsKeyRef = useRef('');
  const lastToastKeyRef = useRef('');
  const failedSaveRef = useRef(false);

  const { data: academicSubjectsData = [] } = useGetAcademicSubjectsQuery();
  const [SessionID = '', ExamID = '', SubClassID = '', StartDate, EndDate] = watch([
    'SessionID',
    'ExamID',
    'SubClassID',
    'StartDate',
    'EndDate',
  ]);
  const selectionKey = `${SessionID}-${ExamID}-${SubClassID}`;
  const routineSessionID = SessionID;
  const routineExamID = ExamID;
  const routineSubClassID = SubClassID;
  const {
    data: editDetails,
    isFetching: isLoadingEditDetails,
  } = useGetAllExamRoutineQuery(
    {
      sessionID: routineSessionID,
      examID: routineExamID,
      subClassId: routineSubClassID,
    },
    {
      skip: !routineSessionID || !routineExamID || !routineSubClassID,
      refetchOnMountOrArgChange: true,
    }
  );

  // currentData: selection bodlale purono selection-er data dekhabe na
  const {
    currentData: examCondition,
    isFetching: isLoadingExamCondition,
  } = useGetCheckExamConditionQuery(
    {
      sessionID: routineSessionID,
      examID: routineExamID,
      subClassId: routineSubClassID,
    },
    {
      skip: !routineSessionID || !routineExamID || !routineSubClassID,
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    currentData: examSubject,
  } = useGetExamSubjectQuery(
    {
      sessionID: routineSessionID,
      examID: routineExamID,
      subClassId: routineSubClassID,
    },
    {
      skip: !routineSessionID || !routineExamID || !routineSubClassID,
      refetchOnMountOrArgChange: true,
    }
  );

  // Condition check ses hoyeche kina
  const conditionKnown = examCondition !== undefined && examCondition !== null;
  // isSetup === true hole-i shudhu baki kaj kora jabe
  const isSetupDone = examCondition?.isSetup === true;
  const lockClass = !isSetupDone ? 'pointer-events-none select-none opacity-60' : '';

  const examRoutine = editDetails;
  const isCheckingExistingRoutine = isLoadingEditDetails;
  const hasExistingRoutine = hasExistingRows(examRoutine);
  const [postExamRoutine, { isLoading: isSavingRoutine }] = usePostExamRoutineMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const subjectOptions = academicSubjectsData
    .filter(
      (subject) =>
        Number(subject.SubClassID) === Number(SubClassID) &&
        examSubject?.subjects?.some(
          (exam) => Number(exam.SubjectID) === Number(subject.SubjectID)
        )
    )
    .map((subject) => ({
      value: subject.SubjectID,
      label: subject.SubjectName,
    }));

  // Onno (visible) row-e jei subject select kora ache segulo bad diye options dey
  const getSubjectOptionsForRow = (rowId) => {
    const takenByOthers = new Set(
      examRoutineData
        .filter((row) => row.id !== rowId && !row.hidden && row.subject)
        .map((row) => String(row.subject))
    );
    return subjectOptions.filter((option) => !takenByOthers.has(String(option.value)));
  };

  // Prothom row (bn date-er jonno) ebong prothom visible row (time-er jonno)
  const firstRow = examRoutineData[0];
  const firstTimeRow = examRoutineData.find((row) => !row.hidden) || examRoutineData[0];

  // isSetup false hole toast
  useEffect(() => {
    if (!conditionKnown) return;
    if (examCondition.isSetup === false) {
      if (lastToastKeyRef.current !== selectionKey) {
        lastToastKeyRef.current = selectionKey;
        showToast('warning', examCondition.message || DEFAULT_SETUP_MESSAGE, 6000);
      }
    } else if (examCondition.isSetup === true) {
      lastToastKeyRef.current = '';
    }
  }, [conditionKnown, examCondition, selectionKey]);

  useEffect(() => {
    if (previousSelectionRef.current !== selectionKey) {
      previousSelectionRef.current = selectionKey;
      failedSaveRef.current = false;
    }
    lastAlertedSelectionRef.current = '';
  }, [selectionKey]);

  useEffect(() => {
    if (!SessionID || !ExamID || !SubClassID || isCheckingExistingRoutine) return;
    if (!isSetupDone) return;
    if (hasExistingRoutine && lastAlertedSelectionRef.current !== selectionKey) {
      lastAlertedSelectionRef.current = selectionKey;
      Swal.fire({
        icon: 'error',
        title: 'রুটিন ইতোমধ্যে তৈরি করা হয়েছে',
        text: 'এই সেশন, পরীক্ষা ও শ্রেণির পরীক্ষার রুটিন আগে থেকেই তৈরি আছে।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  }, [
    SessionID,
    ExamID,
    SubClassID,
    selectionKey,
    examRoutine,
    hasExistingRoutine,
    isCheckingExistingRoutine,
    isSetupDone,
  ]);

  useEffect(() => {
    const startDate = getDateOnly(StartDate);
    const endDate = getDateOnly(EndDate);
    if (
      !startDate ||
      !endDate ||
      startDate > endDate ||
      !SessionID ||
      !ExamID ||
      !SubClassID
    ) {
      if (examRoutineData.length > 0) setExamRoutineData([]);
      lastGeneratedRowsKeyRef.current = '';
      return;
    }

    // Condition check cholche — ekhon kichu kora jabe na
    if (!conditionKnown) return;

    // Setup hoy nai — kono row thakbe na
    if (!isSetupDone) {
      if (examRoutineData.length > 0) setExamRoutineData([]);
      lastGeneratedRowsKeyRef.current = '';
      return;
    }

    if (isCheckingExistingRoutine) return;
    if (hasExistingRoutine && examRoutineData.length === 0) return;

    // Session/exam/class changes must not rebuild the rows. Only a changed
    // date range creates a fresh set of routine rows.
    const rowsKey = `${startDate}-${endDate}`;
    if (lastGeneratedRowsKeyRef.current === rowsKey) return;

    const rows = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const cursor = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const lastDate = Date.UTC(endYear, endMonth - 1, endDay);
    while (cursor.getTime() <= lastDate) {
      const date = getDateOnly(cursor);
      rows.push({
        id: ++rowIdRef.current,
        sl: String(rows.length + 1),
        date,
        subject: '',
        startTime: '',
        endTime: '',
        selected: false,
        hidden: false,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    lastGeneratedRowsKeyRef.current = rowsKey;
    // Notun row toiri hole header checkbox-gulo reset hobe
    setSyncFields(INITIAL_SYNC);
    setExamRoutineData(rows);
  }, [
    StartDate,
    EndDate,
    SessionID,
    ExamID,
    SubClassID,
    selectionKey,
    isCheckingExistingRoutine,
    hasExistingRoutine,
    examRoutineData,
    setValue,
    conditionKnown,
    isSetupDone,
  ]);

  useEffect(() => {
    const activeRowIds = new Set(examRoutineData.map((item) => String(item.id)));
    const staleFields = Object.keys(getValues()).filter((fieldName) => {
      const match = /^(?:date|bndate|subject|message)_(\d+)$/.exec(fieldName);
      return match && !activeRowIds.has(match[1]);
    });

    if (staleFields.length > 0) unregister(staleFields);
  }, [examRoutineData, getValues, unregister]);

  const ensureSetupDone = () => {
    if (isSetupDone) return true;
    showToast('error', examCondition?.message || 'আগে পরীক্ষার কন্ডিশন সেটআপ সম্পন্ন করুন।');
    return false;
  };

  const onSubmit = async (formData) => {
    if (!ensureSetupDone()) return;

    const updatedRows = examRoutineData.map((item) => ({
      ...item,
      subject: formData[`subject_${item.id}`] || item.subject,
      date: getDateOnly(formData[`date_${item.id}`]) || item.date,
      BnExamDate: formData[`bndate_${item.id}`] || '',
      message: formData[`message_${item.id}`] || '',
    }));
    const minDate = getDateOnly(StartDate);
    const maxDate = getDateOnly(EndDate);
    if (updatedRows.length === 0 || updatedRows.some((item) =>
      !item.date || item.date < minDate || item.date > maxDate ||
      (!item.hidden && (!item.subject || !item.startTime || !item.endTime))
    )) {
      Swal.fire({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'প্রতিটি সারিতে তারিখ, বিষয়, শুরু সময় এবং শেষ সময় নির্বাচন করুন।',
      });
      return;
    }

    // Ekta table-e same বিষয় ekbar-i hote parbe
    const usedSubjects = updatedRows
      .filter((item) => !item.hidden)
      .map((item) => String(item.subject));
    if (new Set(usedSubjects).size !== usedSubjects.length) {
      Swal.fire({
        icon: 'warning',
        title: 'একই বিষয় একাধিকবার দেওয়া যাবে না',
        text: 'প্রতিটি বিষয় রুটিনে শুধু একবারই নির্বাচন করা যাবে।',
      });
      return;
    }

    // Keep the submitted row values in local state while the mutation causes
    // query/loading re-renders. This prevents the controlled time inputs from
    // being reset after submit.
    setExamRoutineData(updatedRows);

    const payload = {
      SessionID: Number(SessionID),
      ExamID: Number(ExamID),
      SubClassID: Number(SubClassID),
      TotalColumn: updatedRows.length,
      routine: updatedRows.map((item) => ({
        Date: item.date,
        Day: getBanglaWeekday(item.date),
        hidden: item.hidden,
        SubJectID: item.hidden ? '' : item.subject,
        StartTime: item.hidden ? '' : item.startTime,
        EndTime: item.hidden ? '' : item.endTime,
        BnExamDate: item.BnExamDate,
        message: item.message,
      })),
    };

    try {
      failedSaveRef.current = false;
      const response = await postExamRoutine(payload).unwrap();

      // Prevent the newly created routine from triggering the duplicate alert
      // while the success dialog is open.
      lastAlertedSelectionRef.current = selectionKey;

      await Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: response?.message || 'পরীক্ষার রুটিন সফলভাবে সংরক্ষিত হয়েছে।',
      });

      setExamRoutineData(updatedRows);
    } catch (error) {
      failedSaveRef.current = true;
      setExamRoutineData(updatedRows);
      Swal.fire({
        icon: 'error',
        title: 'সংরক্ষণ করা যায়নি',
        text: error?.data?.message || error?.data?.error || 'রুটিন সংরক্ষণে একটি সমস্যা হয়েছে।',
      });
    }
  };

  // Handle Select All (All Data)
  const handleSelectAll = (e) => {
    if (!ensureSetupDone()) return;
    const checked = e.target.checked;
    setExamRoutineData((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  // Handle Single Select
  const handleSelectOne = (id) => {
    if (!ensureSetupDone()) return;
    setExamRoutineData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // ---------- Header checkbox: শুরু সময় / শেষ সময় ----------
  const handleTimeSyncToggle = (field, checked) => {
    if (!ensureSetupDone()) return;
    setSyncFields((prev) => ({ ...prev, [field]: checked }));

    if (checked && firstTimeRow) {
      const value = firstTimeRow[field] || '';
      setExamRoutineData((prev) => prev.map((row) => ({ ...row, [field]: value })));
    }
  };

  // Row-er time bodlale: jodi prothom row hoy ar checkbox checked thake, sob row-e copy hobe
  const handleRowTimeChange = (id, field, value) => {
    if (!ensureSetupDone()) return;
    const isFirstTimeRow = firstTimeRow && firstTimeRow.id === id;
    if (syncFields[field] && isFirstTimeRow) {
      setExamRoutineData((prev) => prev.map((row) => ({ ...row, [field]: value })));
      return;
    }
    setExamRoutineData((prev) => prev.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  // ---------- Header checkbox: ইংরেজী/আরবি ----------
  const handleBnDateSyncToggle = (checked) => {
    if (!ensureSetupDone()) return;
    setSyncFields((prev) => ({ ...prev, bnDate: checked }));

    if (checked && firstRow) {
      const value = getValues(`bndate_${firstRow.id}`) || '';
      examRoutineData.forEach((row) => {
        if (row.id !== firstRow.id) setValue(`bndate_${row.id}`, value);
      });
    }
  };

  const handleBnDateChange = (id, value) => {
    if (!syncFields.bnDate || !firstRow || firstRow.id !== id) return;
    examRoutineData.forEach((row) => {
      if (row.id !== id) setValue(`bndate_${row.id}`, value);
    });
  };

  // Handle Copy
  const handleCopy = (item) => {
    if (!ensureSetupDone()) return;
    const newId = ++rowIdRef.current;
    // Same বিষয় duplicate hobe na, tai copy-te subject khali thakbe
    const newItem = {
      ...item,
      id: newId,
      sl: String(examRoutineData.length + 1),
      subject: '',
      selected: false,
    };
    setExamRoutineData((prev) => {
      const insertAfterIndex = prev.findIndex((row) => row.id === item.id);
      const nextRows = [...prev];
      nextRows.splice(insertAfterIndex + 1, 0, newItem);
      return nextRows.map((row, index) => ({ ...row, sl: String(index + 1) }));
    });

    setValue(`subject_${newId}`, '');
    setValue(`bndate_${newId}`, getValues(`bndate_${item.id}`) || item.BnExamDate || '');
    setValue(`message_${newId}`, getValues(`message_${item.id}`) || '');
  };

  const handleHide = (item) => {
    if (!ensureSetupDone()) return;

    // Unhide korar somoy subject onno row-e already neya thakle clear kore dao
    if (item.hidden && item.subject) {
      const takenByOther = examRoutineData.some(
        (row) =>
          row.id !== item.id &&
          !row.hidden &&
          String(row.subject) === String(item.subject)
      );
      if (takenByOther) {
        setValue(`subject_${item.id}`, '');
        setExamRoutineData((prev) => prev.map((row) =>
          row.id === item.id ? { ...row, hidden: false, subject: '' } : row
        ));
        showToast('info', 'এই বিষয়টি অন্য সারিতে নির্বাচন করা আছে, আবার বিষয় নির্বাচন করুন।');
        return;
      }
    }

    setExamRoutineData((prev) => prev.map((row) =>
      row.id === item.id ? { ...row, hidden: !row.hidden } : row
    ));
  };

  const handleDelete = (id) => {
    if (!ensureSetupDone()) return;
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
        setExamRoutineData((prev) =>
          prev
            .filter((item) => item.id !== id)
            .map((item, index) => ({ ...item, sl: String(index + 1) }))
        );
      }
    });
  };

  // Handle Delete All Selected
  const handleDeleteSelected = () => {
    if (!ensureSetupDone()) return;
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
        setExamRoutineData((prev) =>
          prev
            .filter((item) => !item.selected)
            .map((item, index) => ({ ...item, sl: String(index + 1) }))
        );
        Swal.fire({
          icon: 'success',
          title: 'মুছে ফেলা হয়েছে!',
          text: `${selectedCount} টি রুটিন সফলভাবে মুছে ফেলা হয়েছে।`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Check if all selected (All Data)
  const isAllSelected =
    examRoutineData.length > 0 && examRoutineData.every((item) => item.selected);

  // Check if any selected
  const hasSelected = examRoutineData.some((item) => item.selected);

  const headerCheckboxClass =
    'h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500';

  return (
    <div className="font-SolaimanLipi space-y-4 text-slate-800">
      <div className="font-default mt-3">
        <FormProvider {...methods}>
          <form
            className="space-y-4 md:space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Top Section - 5 responsive columns */}
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-white p-4 sm:grid-cols-3 lg:grid-cols-5 md:p-5">
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
              <div className={lockClass} aria-disabled={!isSetupDone}>
                <DatePickerOne
                  dateCalender="Exam Start Date"
                  placeholder="Enter date"
                  registerKey="StartDate"
                  require="Date Required"
                />
              </div>
              <div className={lockClass} aria-disabled={!isSetupDone}>
                <DatePickerOne
                  dateCalender="Exam End Date"
                  placeholder="Enter date"
                  registerKey="EndDate"
                  require="Date Required"
                />
              </div>
            </div>

            {/* Condition status */}
            {isLoadingExamCondition && !conditionKnown && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                পরীক্ষার কন্ডিশন যাচাই করা হচ্ছে...
              </div>
            )}
            {conditionKnown && !isSetupDone && (
              <div className="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>{examCondition?.message || DEFAULT_SETUP_MESSAGE}</span>
              </div>
            )}

            {/* Delete selected - shudhu kichu select thakle dekhabe */}
            {hasSelected && (
              <div className={lockClass} aria-disabled={!isSetupDone}>
                <div className="flex items-center rounded-xl border border-blue-100 bg-white p-4">
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 sm:w-auto"
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
                </div>
              </div>
            )}

            {/* Table Section with Scroll */}
            <div
              className={`overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm ${lockClass}`}
              aria-disabled={!isSetupDone}
            >
              <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50/70">
                  <tr className="border-b border-blue-100">
                    <th className="whitespace-nowrap border-b border-blue-100 px-3 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className={headerCheckboxClass}
                        />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-3 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      ক্রম
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-left text-xs font-bold text-slate-700 sm:text-sm">
                      ক্যালেন্ডার তারিখ
                    </th>

                    {/* ইংরেজী/আরবি + checkbox */}
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span>ইংরেজী/আরবি</span>
                        <input
                          type="checkbox"
                          checked={syncFields.bnDate}
                          onChange={(event) => handleBnDateSyncToggle(event.target.checked)}
                          title="প্রথম সারির তারিখ সব সারিতে প্রয়োগ করুন"
                          aria-label="প্রথম সারির ইংরেজী/আরবি তারিখ সব সারিতে প্রয়োগ করুন"
                          className={headerCheckboxClass}
                        />
                      </div>
                    </th>

                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-left text-xs font-bold text-slate-700 sm:text-sm">
                      বার
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      বিষয়
                    </th>

                    {/* শুরু সময় + checkbox */}
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span>শুরু সময়</span>
                        <input
                          type="checkbox"
                          checked={syncFields.startTime}
                          onChange={(event) => handleTimeSyncToggle('startTime', event.target.checked)}
                          title="প্রথম সারির শুরু সময় সব সারিতে প্রয়োগ করুন"
                          aria-label="প্রথম সারির শুরু সময় সব সারিতে প্রয়োগ করুন"
                          className={headerCheckboxClass}
                        />
                      </div>
                    </th>

                    {/* শেষ সময় + checkbox */}
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span>শেষ সময়</span>
                        <input
                          type="checkbox"
                          checked={syncFields.endTime}
                          onChange={(event) => handleTimeSyncToggle('endTime', event.target.checked)}
                          title="প্রথম সারির শেষ সময় সব সারিতে প্রয়োগ করুন"
                          aria-label="প্রথম সারির শেষ সময় সব সারিতে প্রয়োগ করুন"
                          className={headerCheckboxClass}
                        />
                      </div>
                    </th>

                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examRoutineData.map((item) => {
                    const bnDateRegister = register(`bndate_${item.id}`);
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/70"
                      >
                        <td className="px-1 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.selected || false}
                              onChange={() => handleSelectOne(item.id)}
                              className={headerCheckboxClass}
                            />
                          </div>
                        </td>

                        <td className="px-1 py-3 text-center text-sm font-medium text-slate-600">{item.sl}</td>

                        <td className="px-1 py-3">
                          <DatePickerOne
                            registerKey={`date_${item.id}`}
                            defaultValue={item.date}
                            minDate={getDateOnly(StartDate)}
                            maxDate={getDateOnly(EndDate)}
                            placeholder="তারিখ নির্বাচন করুন"
                          />
                        </td>
                        <td className="px-1 py-3">
                          <input
                            type="text"
                            {...bnDateRegister}
                            onChange={(event) => {
                              bnDateRegister.onChange(event);
                              handleBnDateChange(item.id, event.target.value);
                            }}
                            defaultValue={item.BnExamDate || ''}
                            aria-label="বাংলা বা আরবি তারিখ"
                            placeholder="বাংলা/আরবি তারিখ"
                            className="w-full min-w-[150px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </td>
                        <td className="px-2 py-1 text-center text-sm font-medium text-slate-600">
                          {getBanglaWeekday(getDateOnly(watch(`date_${item.id}`)) || item.date)}
                        </td>

                        {item.hidden ? (
                          <td colSpan={3} className="min-w-[390px] px-1 py-3">
                            <DefaultInput
                              label="Message"
                              registerKey={`message_${item.id}`}
                              defaultValue={getValues(`message_${item.id}`) || item.message || ''}
                              placeholder="Message"
                            />
                          </td>
                        ) : (
                          <>
                            <td className="min-w-[160px] px-1 py-3">
                              <DefaultSelect
                                label=""
                                options={getSubjectOptionsForRow(item.id)}
                                valueField="value"
                                nameField="label"
                                registerKey={`subject_${item.id}`}
                                onChange={(selectedOption) => {
                                  const newSubject = selectedOption?.value ?? '';
                                  setExamRoutineData((prev) => prev.map((row) =>
                                    row.id === item.id
                                      ? { ...row, subject: newSubject }
                                      : row
                                  ));
                                }}
                              />
                            </td>

                            {/* শুরু সময় */}
                            <td className="px-1 py-3">
                              <input
                                type="time"
                                value={item.startTime}
                                aria-label="পরীক্ষা শুরুর সময়"
                                onChange={(event) => handleRowTimeChange(item.id, 'startTime', event.target.value)}
                                className="w-full min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </td>

                            {/* শেষ সময় */}
                            <td className="px-1 py-3">
                              <input
                                type="time"
                                value={item.endTime}
                                aria-label="পরীক্ষা শেষের সময়"
                                onChange={(event) => handleRowTimeChange(item.id, 'endTime', event.target.value)}
                                className="w-full min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              />
                            </td>
                          </>
                        )}

                        <td className="px-1 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleHide(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              title={item.hidden ? 'Show row' : 'Hide row'}
                              aria-label={item.hidden ? 'Show row' : 'Hide row'}
                            >
                              <SvgIcon name={item.hidden ? 'FaEyeSlash' : 'FaEye'} size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              title="Add"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14" />
                                <path d="M5 12h14" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {examRoutineData.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-4 py-14 text-center font-SolaimanLipi text-sm text-slate-400">
                        কোনো ডাটা পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Save Button Section */}
            <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 rounded-xl border border-blue-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 self-start rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                </span>
                মোট {examRoutineData.length} টি সময়সূচি দেখানো হয়েছে
              </div>
              <button
                type="submit"
                disabled={isSavingRoutine || !isSetupDone}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isSavingRoutine ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

ExamRoutineCreateModal.propTypes = {
  pageTitle: PropTypes.string,
};

export default ExamRoutineCreateModal;
