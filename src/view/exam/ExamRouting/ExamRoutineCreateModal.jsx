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
  const [sameTimeForAll, setSameTimeForAll] = useState(true);
  const [sharedTime, setSharedTime] = useState({ startTime: '', endTime: '' });
  const [editableTimeRowIds, setEditableTimeRowIds] = useState(() => new Set());
  const rowIdRef = useRef(0);
  const lastAlertedSelectionRef = useRef('');
  const previousSelectionRef = useRef('');
  const lastGeneratedRowsKeyRef = useRef('');
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
  const examRoutine = editDetails;
  const isCheckingExistingRoutine = isLoadingEditDetails;
  const hasExistingRoutine = hasExistingRows(examRoutine);
  const [postExamRoutine, { isLoading: isSavingRoutine }] = usePostExamRoutineMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const subjectOptions = academicSubjectsData
    .filter((subject) => Number(subject.SubClassID) === Number(SubClassID))
    .map((subject) => ({ value: subject.SubjectID, label: subject.SubjectName }));

  useEffect(() => {
    if (previousSelectionRef.current !== selectionKey) {
      previousSelectionRef.current = selectionKey;
      failedSaveRef.current = false;
    }
    lastAlertedSelectionRef.current = '';
  }, [selectionKey]);

  useEffect(() => {
    if (!SessionID || !ExamID || !SubClassID || isCheckingExistingRoutine) return;
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
    setExamRoutineData(rows);
  }, [StartDate, EndDate, SessionID, ExamID, SubClassID, selectionKey, isCheckingExistingRoutine, hasExistingRoutine, examRoutineData, setValue]);

  useEffect(() => {
    const activeRowIds = new Set(examRoutineData.map((item) => String(item.id)));
    const staleFields = Object.keys(getValues()).filter((fieldName) => {
      const match = /^(?:date|bndate|subject|message)_(\d+)$/.exec(fieldName);
      return match && !activeRowIds.has(match[1]);
    });

    if (staleFields.length > 0) unregister(staleFields);
  }, [examRoutineData, getValues, unregister]);

  useEffect(() => {
    if (!sameTimeForAll) return;
    setExamRoutineData((prev) => {
      let changed = false;
      const nextRows = prev.map((row) => {
        // Rows explicitly unlocked with Edit keep their own time.
        if (editableTimeRowIds.has(row.id)) return row;

        if (row.startTime === sharedTime.startTime && row.endTime === sharedTime.endTime) {
          return row;
        }
        changed = true;
        return { ...row, ...sharedTime };
      });
      return changed ? nextRows : prev;
    });
  }, [sameTimeForAll, sharedTime, editableTimeRowIds]);

  const onSubmit = async (formData) => {
    // if ((hasExistingRoutine || isCheckingExistingRoutine) && !failedSaveRef.current) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'রুটিন ইতোমধ্যে তৈরি করা হয়েছে',
    //     text: 'এই সেশন, পরীক্ষা ও শ্রেণির পরীক্ষার রুটিন আগে থেকেই তৈরি আছে।',
    //   });
    //   return;
    // }

    const updatedRows = examRoutineData.map((item) => ({
      ...item,
      subject: formData[`subject_${item.id}`] || item.subject,
      date: getDateOnly(formData[`date_${item.id}`]) || item.date,
      BnExamDate: formData[`bndate_${item.id}`] || '',
      message: formData[`message_${item.id}`] || '',
    }));
    console.log(updatedRows);
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
    // console.log(payload);


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

      // Keep every field, deleted row, hidden row and time setting exactly as
      // the user left it. Rows are rebuilt only after the date range changes.
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

  const handleSameTimeToggle = (checked) => {
    // Toggling the option resets row-level exceptions.
    setEditableTimeRowIds(new Set());

    if (checked) {
      const firstRow = examRoutineData.find((item) => !item.hidden) || examRoutineData[0];
      setSharedTime({
        startTime: firstRow?.startTime || '',
        endTime: firstRow?.endTime || '',
      });
    }
    setSameTimeForAll(checked);
  };

  // Handle Copy
  const handleCopy = (item) => {
    const newId = ++rowIdRef.current;
    const newItem = {
      ...item,
      id: newId,
      sl: String(examRoutineData.length + 1),
      selected: false,
    };
    setExamRoutineData((prev) => {
      const insertAfterIndex = prev.findIndex((row) => row.id === item.id);
      const nextRows = [...prev];
      nextRows.splice(insertAfterIndex + 1, 0, newItem);
      return nextRows.map((row, index) => ({ ...row, sl: String(index + 1) }));
    });

    setValue(`subject_${newId}`, newItem.subject);
    setValue(`bndate_${newId}`, item.BnExamDate || '');
    setValue(`message_${newId}`, getValues(`message_${item.id}`) || '');
  };

  const handleEdit = (item) => {
    if (!sameTimeForAll) return;

    // Only the clicked row becomes editable; the remaining rows stay locked.
    setEditableTimeRowIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
  };
  const handleHide = (item) => {
    setExamRoutineData((prev) => prev.map((row) =>
      row.id === item.id ? { ...row, hidden: !row.hidden } : row
    ));
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

  return (
    <div className="font-default space-y-4 text-slate-800">
      {/* <div className="filter_header flex flex-col gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18M8 14h2M8 17h2" />
            </svg>
          </span>
          <div>
            <h3 className="font-SolaimanLipi text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {translate("পরীক্ষার সময়সূচি")}
            </h3>
            <p className="mt-1 font-SolaimanLipi text-sm text-slate-500">
              পরীক্ষার তারিখ, সময় এবং বিষয় অনুযায়ী সময়সূচি নির্ধারণ করুন
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <span>হোম</span><span className="text-slate-300">›</span><span>পরীক্ষা</span><span className="text-slate-300">›</span><span className="font-medium text-blue-700">পরীক্ষার সময়সূচি</span>
        </div>
      </div> */}
      <div className="font-default mt-3">
        <FormProvider {...methods}>
          <form
            className="space-y-4 md:space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Top Section - 4 responsive columns */}
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 md:p-5">
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
              <DatePickerOne
                dateCalender="Exam Start Date"
                placeholder="Enter date"
                registerKey="StartDate"
                require="Date Required"
              />
              <DatePickerOne
                dateCalender="Exam End Date"
                placeholder="Enter date"
                registerKey="EndDate"
                require="Date Required"
              />
            </div>
            <div>

              <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-white p-4 lg:flex-row lg:items-end lg:justify-between">

                <div className="flex w-full flex-col gap-3 lg:flex-1 lg:flex-row lg:items-start lg:justify-start">
                  <div className="w-full lg:max-w-fit">
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-orange-200 bg-orange-50/80 p-3 text-orange-700 transition-colors">
                      <label className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-orange-700">
                        <input
                          type="checkbox"
                          checked={sameTimeForAll}
                          onChange={(event) => handleSameTimeToggle(event.target.checked)}
                          className="h-4 w-4 rounded border-orange-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        সব সারিতে একই সময়
                      </label>
                      {sameTimeForAll && (
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 text-sm  text-gray-600">
                            শুরু সময়
                            <input
                              type="time"
                              value={sharedTime.startTime}
                              aria-label="সব সারির পরীক্ষার শুরুর সময়"
                              onChange={(event) => setSharedTime((prev) => ({ ...prev, startTime: event.target.value }))}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-gray-600">
                            শেষ সময়
                            <input
                              type="time"
                              value={sharedTime.endTime}
                              aria-label="সব সারির পরীক্ষার শেষের সময়"
                              onChange={(event) => setSharedTime((prev) => ({ ...prev, endTime: event.target.value }))}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full lg:w-auto">
                    {hasSelected && (
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 lg:w-auto"
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
              </div>
            </div>




            {/* Table Section with Scroll */}

            <div className="overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
              <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50/70">
                  <tr className="border-b border-blue-100">
                    <th className="whitespace-nowrap border-b border-blue-100 px-3 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-3 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      ক্রম
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-left text-xs font-bold text-slate-700 sm:text-sm">
                      ক্যালেন্ডার তারিখ
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      ইংরেজী/আরবি
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-left text-xs font-bold text-slate-700 sm:text-sm">
                      বার
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      বিষয়
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      শুরু সময়
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      শেষ সময়
                    </th>
                    <th className="whitespace-nowrap border-b border-blue-100 px-4 py-4 text-center text-xs font-bold text-slate-700 sm:text-sm">
                      কার্যক্রম
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examRoutineData.map((item) => (
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
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                          {...register(`bndate_${item.id}`)}
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
                              options={subjectOptions}
                              valueField="value"
                              nameField="label"
                              registerKey={`subject_${item.id}`}
                              onChange={(selectedOption) => {
                                setExamRoutineData((prev) => prev.map((row) =>
                                  row.id === item.id
                                    ? { ...row, subject: selectedOption.value }
                                    : row
                                ));
                              }}
                            />
                          </td>

                          <td className="px-1 py-3">
                            <input
                              type="time"
                              value={item.startTime}
                              disabled={sameTimeForAll && !editableTimeRowIds.has(item.id)}
                              aria-label="পরীক্ষা শুরুর সময়"
                              onChange={(event) => setExamRoutineData((prev) => prev.map((row) =>
                                row.id === item.id ? { ...row, startTime: event.target.value } : row
                              ))}
                              className="w-full min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </td>

                          <td className="px-1 py-3">
                            <input
                              type="time"
                              value={item.endTime}
                              disabled={sameTimeForAll && !editableTimeRowIds.has(item.id)}
                              aria-label="পরীক্ষা শেষের সময়"
                              onChange={(event) => setExamRoutineData((prev) => prev.map((row) =>
                                row.id === item.id ? { ...row, endTime: event.target.value } : row
                              ))}
                              className="w-full min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
                            onClick={() => handleEdit(item)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-200 bg-orange-50 text-orange-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-200"
                            title={sameTimeForAll && !editableTimeRowIds.has(item.id) ? 'Edit time' : 'Time is editable'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
                  ))}

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
                disabled={isSavingRoutine}
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



export default ExamRoutineCreateModal;
