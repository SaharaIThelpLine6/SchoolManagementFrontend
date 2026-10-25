import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useTranslate from '../../../utils/Translate';
import {
  useGetAllExamRoutineQuery,
  useGetExamNamesQuery,
  useGetExamSubjectQuery,
  usePutExamRoutineMutation,
} from '../../../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetAcademicSubjectsQuery, useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import SvgIcon from '../../../components/icons/SvgIcon';

/* ---------------- helpers ---------------- */

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

const getTimeOnly = (value) => String(value ?? '').trim().slice(0, 5);

const getBanglaWeekday = (dateValue) => {
  if (!dateValue) return '';
  const dayIndex = new Date(`${dateValue}T00:00:00`).getDay();
  return ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][dayIndex];
};

// প্রথম যে মানটা ফাঁকা নয় সেটা নেয়
const pick = (...values) =>
  values.find((v) => v !== undefined && v !== null && String(v).trim() !== '') ?? '';

// API response থেকে সারির তালিকা বানায়
const parseRoutineRows = (editDetails, subClassID, nextId) => {
  const responseData = editDetails?.data ?? editDetails;
  const detail = Array.isArray(responseData)
    ? responseData.find((item) => Number(item.SubClassID) === subClassID) ?? responseData[0]
    : responseData;

  const landView = detail?.landView ?? detail?.land_view ?? detail;
  const routineView = Array.isArray(detail)
    ? detail
    : detail?.routineView ?? detail?.routine_view ?? detail?.routine ?? [];
  const detailRows = Array.isArray(routineView) ? routineView : [];

  // আসল key গুলো দেখার জন্য (ইংরেজী/আরবি তারিখ কোন নামে আসছে)
  console.log('[routine] landView keys:', landView ? Object.keys(landView) : null);
  console.log('[routine] routine row[0] keys:', detailRows[0] ? Object.keys(detailRows[0]) : null);

  const hasLandViewDates = Array.from(
    { length: 14 },
    (_, index) => landView?.[`Date${index + 1}`]
  ).some(Boolean);

  const sourceRows = hasLandViewDates
    ? Array.from({ length: 14 }, (_, index) => ({
      ...detailRows[index],
      Date: landView[`Date${index + 1}`],
      Day: landView[`Day${index + 1}`],
      SubJectID: landView[`Sub${index + 1}`],
    }))
    : detailRows;

  return sourceRows
    .map((item, index) => {
      const n = index + 1;
      const date = getDateOnly(item?.Date ?? item?.date ?? landView?.[`Date${n}`]);
      return {
        id: nextId(),
        sl: String(n),
        date,
        subject: String(
          pick(
            item?.SubJectID,
            item?.SubjectID,
            item?.subject,
            landView?.[`Sub${n}`],
            landView?.[`SubJectID${n}`]
          )
        ),
        startTime: getTimeOnly(item?.StartTime ?? item?.startTime),
        endTime: getTimeOnly(item?.EndTime ?? item?.endTime),
        BnExamDate: String(
          pick(
            item?.BnExamDate,
            item?.bnExamDate,
            item?.BnDate,
            item?.ArabicDate,
            item?.ArabicExamDate,
            landView?.[`BnExamDate${n}`],
            landView?.[`BnDate${n}`],
            landView?.[`ArabicDate${n}`],
            landView?.[`ArabicExamDate${n}`]
          )
        ),
        message: item?.message ?? item?.Message ?? '',
        selected: false,
        hidden: Boolean(item?.hidden),
      };
    })
    .filter((item) => item.date);
};

const ICON_BTN =
  'flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition hover:-translate-y-0.5 focus:outline-none focus:ring-2';
const BLUE_BTN = `${ICON_BTN} border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-200`;
const ROSE_BTN = `${ICON_BTN} border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-200`;
const TIME_INPUT =
  'w-full min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const TEXT_INPUT =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const TH = 'whitespace-nowrap border-b border-blue-100 px-4 py-4 text-xs font-bold text-slate-700 sm:text-sm';

const ReadOnlyField = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-bold text-slate-800">{label} :</label>
    <input
      type="text"
      value={value || ''}
      readOnly
      disabled
      className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-700 outline-none"
    />
  </div>
);

ReadOnlyField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/* ---------------- component ---------------- */

const ExamRoutineUpdateModal = ({ meta }) => {
  const translate = useTranslate();
  const methods = useForm();
  const navigate = useNavigate();
  const { watch, handleSubmit, setValue, getValues, unregister } = methods;

  const ids = meta?.meta ?? meta ?? {};
  const sessionID = Number(ids.sessionID) || 0;
  const examID = Number(ids.examID) || 0;
  const subClassID = Number(ids.subClassID) || 0;
  const selectionKey = `${sessionID}-${examID}-${subClassID}`;

  const [examRoutineData, setExamRoutineData] = useState([]);
  const [sameTimeForAll] = useState(false);
  const [editableTimeRowIds] = useState(() => new Set());
  const rowIdRef = useRef(0);
  const lastGeneratedRowsKeyRef = useRef('');
  const loadedEditSelectionRef = useRef('');

  const { data: academicSubjectsData = [] } = useGetAcademicSubjectsQuery();
  const [StartDate, EndDate] = watch(['StartDate', 'EndDate']);

  const {
    data: editDetails,
    isFetching: isLoadingEditDetails,
    isError: isRoutineError,
    error: routineError,
  } = useGetAllExamRoutineQuery(
    {
      sessionID: String(sessionID),
      examID: String(examID),
      subClassId: String(subClassID),
    },
    {
      skip: !sessionID || !examID || !subClassID,
      refetchOnMountOrArgChange: true,
    }
  );

  const { currentData: examSubject } = useGetExamSubjectQuery(
    { sessionID, examID, subClassId: subClassID },
    {
      skip: !sessionID || !examID || !subClassID,
      refetchOnMountOrArgChange: true,
    }
  );
  const [putExamRoutine, { isLoading: isSavingRoutine }] = usePutExamRoutineMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const sessionName =
    (sessionData ?? []).find((s) => Number(s.SessionID) === sessionID)?.SessionName ?? (sessionID || '');
  const examName =
    (examNameData ?? []).find((e) => Number(e.ExamID) === examID)?.ExamName ?? (examID || '');
  const subClassName =
    (subClassListData ?? []).find((c) => Number(c.SubClassID) === subClassID)?.SubClass ?? (subClassID || '');

  // এই পরীক্ষার জন্য অনুমোদিত বিষয়
  const subjectOptions = academicSubjectsData
    .filter(
      (subject) =>
        Number(subject.SubClassID) === subClassID &&
        examSubject?.subjects?.some((exam) => Number(exam.SubjectID) === Number(subject.SubjectID))
    )
    .map((subject) => ({ value: String(subject.SubjectID), label: subject.SubjectName }));

  // সেভ করা বিষয় তালিকায় না থাকলেও যেন দেখায়
  const getOptionsFor = (currentSubject) => {
    const current = String(currentSubject ?? '');
    if (!current || subjectOptions.some((o) => o.value === current)) return subjectOptions;
    const found = academicSubjectsData.find((s) => String(s.SubjectID) === current);
    return [...subjectOptions, { value: current, label: found?.SubjectName ?? current }];
  };

  useEffect(() => {
    console.log('[routine] meta prop:', meta, '→ ids:', { sessionID, examID, subClassID });
  }, [meta, sessionID, examID, subClassID]);

  // API থেকে রুটিন লোড
  useEffect(() => {
    if (isLoadingEditDetails || !editDetails) return;
    if (loadedEditSelectionRef.current === selectionKey) return;

    console.log('[routine] API response:', editDetails);

    const rows = parseRoutineRows(editDetails, subClassID, () => ++rowIdRef.current);
    console.log('[routine] parsed rows:', rows);

    if (rows.length === 0) return;

    const dates = rows.map((item) => item.date).sort();

    setValue('StartDate', new Date(`${dates[0]}T00:00:00`));
    setValue('EndDate', new Date(`${dates[dates.length - 1]}T00:00:00`));
    rows.forEach((item) => {
      setValue(`date_${item.id}`, item.date);
      setValue(`message_${item.id}`, item.message);
    });

    loadedEditSelectionRef.current = selectionKey;
    lastGeneratedRowsKeyRef.current = `${selectionKey}-${dates[0]}-${dates[dates.length - 1]}`;
    setExamRoutineData(rows);
  }, [isLoadingEditDetails, editDetails, selectionKey, subClassID, setValue]);

  // তারিখ রেঞ্জ বদলালে সারি তৈরি
  useEffect(() => {
    const startDate = getDateOnly(StartDate);
    const endDate = getDateOnly(EndDate);
    if (!startDate || !endDate || startDate > endDate || examRoutineData.length === 0) return;

    const rowsKey = `${selectionKey}-${startDate}-${endDate}`;
    if (lastGeneratedRowsKeyRef.current === rowsKey) return;

    const dates = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const cursor = new Date(Date.UTC(startYear, startMonth - 1, startDay));
    const lastDate = Date.UTC(endYear, endMonth - 1, endDay);
    while (cursor.getTime() <= lastDate) {
      dates.push(getDateOnly(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const rows = dates.map((date, index) => {
      const existingRow = examRoutineData[index];
      const row = existingRow
        ? { ...existingRow, sl: String(index + 1), date }
        : {
          id: ++rowIdRef.current,
          sl: String(index + 1),
          date,
          subject: '',
          startTime: '',
          endTime: '',
          BnExamDate: '',
          message: '',
          selected: false,
          hidden: false,
        };
      setValue(`date_${row.id}`, date);
      return row;
    });

    lastGeneratedRowsKeyRef.current = rowsKey;
    setExamRoutineData(rows);
  }, [StartDate, EndDate, selectionKey, examRoutineData, setValue]);

  // ✅ পুরনো field পরিষ্কার — খালি তালিকায় চালানো হবে না (এটাই মান মুছে ফেলছিল)
  useEffect(() => {
    if (examRoutineData.length === 0) return;
    const activeRowIds = new Set(examRoutineData.map((item) => String(item.id)));
    const staleFields = Object.keys(getValues()).filter((fieldName) => {
      const match = /^(?:date|message)_(\d+)$/.exec(fieldName);
      return match && !activeRowIds.has(match[1]);
    });
    if (staleFields.length > 0) unregister(staleFields);
  }, [examRoutineData, getValues, unregister]);

  const updateRow = (id, patch) => {
    setExamRoutineData((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const onSubmit = async (formData) => {
    // subject / BnExamDate state থেকে, date / message form থেকে
    const updatedRows = examRoutineData.map((item) => ({
      ...item,
      date: getDateOnly(formData[`date_${item.id}`]) || item.date,
      message: formData[`message_${item.id}`] ?? item.message ?? '',
    }));

    const minDate = getDateOnly(StartDate);
    const maxDate = getDateOnly(EndDate);
    if (
      updatedRows.length === 0 ||
      updatedRows.some(
        (item) =>
          !item.date ||
          item.date < minDate ||
          item.date > maxDate ||
          (!item.hidden && (!item.subject || !item.startTime || !item.endTime))
      )
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'ফর্ম অসম্পূর্ণ',
        text: 'প্রতিটি সারিতে তারিখ, বিষয়, শুরু সময় এবং শেষ সময় নির্বাচন করুন।',
      });
      return;
    }

    setExamRoutineData(updatedRows);

    const payload = {
      SessionID: sessionID,
      ExamID: examID,
      SubClassID: subClassID,
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
      const response = await putExamRoutine(payload).unwrap();
      await Swal.fire({
        icon: 'success',
        title: 'সফলভাবে সংরক্ষণ হয়েছে',
        text: response?.message || 'পরীক্ষার রুটিন সফলভাবে সংরক্ষিত হয়েছে।',
      });
      navigate('/dashboard/exam/routing');
    } catch (error) {
      setExamRoutineData(updatedRows);
      Swal.fire({
        icon: 'error',
        title: 'সংরক্ষণ করা যায়নি',
        text: error?.data?.message || error?.data?.error || 'রুটিন সংরক্ষণে একটি সমস্যা হয়েছে।',
      });
    }
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setExamRoutineData((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleSelectOne = (id) => {
    setExamRoutineData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCopy = (item) => {
    const newId = ++rowIdRef.current;
    const newItem = { ...item, id: newId, sl: String(examRoutineData.length + 1), selected: false };
    setExamRoutineData((prev) => {
      const insertAfterIndex = prev.findIndex((row) => row.id === item.id);
      const nextRows = [...prev];
      nextRows.splice(insertAfterIndex + 1, 0, newItem);
      return nextRows.map((row, index) => ({ ...row, sl: String(index + 1) }));
    });

    setValue(`date_${newId}`, item.date);
    setValue(`message_${newId}`, getValues(`message_${item.id}`) || item.message || '');
  };

  const handleHide = (item) => {
    updateRow(item.id, { hidden: !item.hidden });
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
          prev.filter((item) => item.id !== id).map((item, index) => ({ ...item, sl: String(index + 1) }))
        );
      }
    });
  };

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
          prev.filter((item) => !item.selected).map((item, index) => ({ ...item, sl: String(index + 1) }))
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

  const isAllSelected = examRoutineData.length > 0 && examRoutineData.every((item) => item.selected);
  const hasSelected = examRoutineData.some((item) => item.selected);

  const emptyMessage = (() => {
    if (!sessionID || !examID || !subClassID) return 'Session / Exam / Class এর ID পাওয়া যায়নি (meta ঠিক নেই)';
    if (isLoadingEditDetails) return 'লোড হচ্ছে...';
    if (isRoutineError) {
      return `রুটিন লোড করা যায়নি: ${routineError?.status ?? ''} ${routineError?.data?.message || routineError?.data?.error || routineError?.error || ''
        }`;
    }
    return 'কোনো ডাটা পাওয়া যায়নি';
  })();

  return (
    <div className="font-default space-y-4 ">
      <div className="font-default">
        <FormProvider {...methods}>
          <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-white p-4 sm:grid-cols-3 lg:grid-cols-5 md:p-5">
              <ReadOnlyField label={translate('Session')} value={sessionName} />
              <ReadOnlyField label={translate('Exam Name')} value={examName} />
              <ReadOnlyField label={translate('Class/Jamaat')} value={subClassName} />
              <DatePickerOne dateCalender="Exam Start Date" placeholder="Enter date" registerKey="StartDate" require="Date Required" />
              <DatePickerOne dateCalender="Exam End Date" placeholder="Enter date" registerKey="EndDate" require="Date Required" />
            </div>

            <div className="w-full lg:w-auto">
              {hasSelected && (
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 lg:w-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  নির্বাচিত সব মুছে ফেলুন
                </button>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white shadow-sm">
              <table className="w-full min-w-[1120px] border-separate border-spacing-0">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50/70">
                  <tr className="border-b border-blue-100">
                    <th className={`${TH} px-3 text-center`}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </th>
                    <th className={`${TH} px-3 text-center`}>ক্রম</th>
                    <th className={`${TH} text-left`}>ক্যালেন্ডার তারিখ</th>
                    <th className={`${TH} text-center`}>ইংরেজী/আরবি</th>
                    <th className={`${TH} text-left`}>বার</th>
                    <th className={`${TH} text-center`}>বিষয়</th>
                    <th className={`${TH} text-center`}>শুরু সময়</th>
                    <th className={`${TH} text-center`}>শেষ সময়</th>
                    <th className={`${TH} text-center`}>কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {examRoutineData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition-colors odd:bg-white even:bg-slate-50/70 hover:bg-blue-50/70"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.selected || false}
                            onChange={() => handleSelectOne(item.id)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      </td>

                      <td className="px-3 py-3 text-center text-sm font-medium text-slate-600">{item.sl}</td>

                      <td className="px-3 py-3">
                        <DatePickerOne
                          registerKey={`date_${item.id}`}
                          defaultValue={item.date}
                          minDate={getDateOnly(StartDate)}
                          maxDate={getDateOnly(EndDate)}
                          placeholder="তারিখ নির্বাচন করুন"
                        />
                      </td>

                      {/* ✅ ইংরেজী/আরবি — state থেকে controlled */}
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={item.BnExamDate || ''}
                          onChange={(event) => updateRow(item.id, { BnExamDate: event.target.value })}
                          aria-label="বাংলা বা আরবি তারিখ"
                          placeholder="বাংলা/আরবি তারিখ"
                          className={`${TEXT_INPUT} min-w-[150px]`}
                        />
                      </td>

                      <td className="px-3 py-3 text-center text-sm font-medium text-slate-600">
                        {getBanglaWeekday(getDateOnly(watch(`date_${item.id}`)) || item.date)}
                      </td>

                      {item.hidden ? (
                        <td colSpan={3} className="min-w-[390px] px-3 py-3">
                          <DefaultInput
                            label="Message"
                            registerKey={`message_${item.id}`}
                            defaultValue={getValues(`message_${item.id}`) || item.message || ''}
                            placeholder="Message"
                          />
                        </td>
                      ) : (
                        <>
                          {/* ✅ বিষয় — state থেকে controlled */}
                          <td className="min-w-[160px] px-3 py-3">
                            <select
                              value={String(item.subject ?? '')}
                              onChange={(event) => updateRow(item.id, { subject: event.target.value })}
                              aria-label="বিষয়"
                              className={TEXT_INPUT}
                            >
                              <option value="">বিষয় নির্বাচন করুন</option>
                              {getOptionsFor(item.subject).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="time"
                              value={item.startTime}
                              disabled={sameTimeForAll && !editableTimeRowIds.has(item.id)}
                              aria-label="পরীক্ষা শুরুর সময়"
                              onChange={(event) => updateRow(item.id, { startTime: event.target.value })}
                              className={TIME_INPUT}
                            />
                          </td>

                          <td className="px-3 py-3">
                            <input
                              type="time"
                              value={item.endTime}
                              disabled={sameTimeForAll && !editableTimeRowIds.has(item.id)}
                              aria-label="পরীক্ষা শেষের সময়"
                              onChange={(event) => updateRow(item.id, { endTime: event.target.value })}
                              className={TIME_INPUT}
                            />
                          </td>
                        </>
                      )}

                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleHide(item)}
                            className={BLUE_BTN}
                            title={item.hidden ? 'Show row' : 'Hide row'}
                            aria-label={item.hidden ? 'Show row' : 'Hide row'}
                          >
                            <SvgIcon name={item.hidden ? 'FaEyeSlash' : 'FaEye'} size={18} />
                          </button>
                          <button type="button" onClick={() => handleCopy(item)} className={BLUE_BTN} title="Add">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 5v14" />
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                          <button type="button" onClick={() => handleDelete(item.id)} className={ROSE_BTN} title="Delete">
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
                      <td
                        colSpan="9"
                        className={`px-4 py-14 text-center font-SolaimanLipi text-sm ${isRoutineError ? 'text-rose-600' : 'text-slate-400'
                          }`}
                      >
                        {emptyMessage}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Save */}
            <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 rounded-xl border border-blue-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 self-start rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
                মোট {examRoutineData.length} টি সময়সূচি দেখানো হয়েছে
              </div>
              <button
                type="submit"
                disabled={isSavingRoutine}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {isSavingRoutine ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

ExamRoutineUpdateModal.propTypes = {
  meta: PropTypes.oneOfType([
    PropTypes.shape({
      sessionID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      examID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      subClassID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    PropTypes.object,
  ]),
};

export default ExamRoutineUpdateModal;