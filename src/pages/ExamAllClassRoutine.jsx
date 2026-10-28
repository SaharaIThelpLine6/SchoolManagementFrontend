import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { useSearchParams } from 'react-router-dom';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { examReports, language } from '../Data/examReportData';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetExamRoutineReportQuery } from '../features/reports/reportQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import useTranslate from '../utils/Translate';

import {
  getClassText,
  getRRText,
  getSubClassText,
} from '../Data/Examroutinereportconfig';
import ExamRoutinePDF from '../view/exam/ExamRouting/ExamRoutinePDF';

const API_URL = import.meta.env.VITE_SERVER_URL;

const ROUTINE_REPORT_ID = 12;

const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const bytes = new Uint8Array(img.data);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return `data:image/png;base64,${window.btoa(binary)}`;
  }
  return '';
};

const INSTITUTE_LOGO_KEYS = [
  'InstitutionLogo', 'institutionLogo',
  'Logo', 'logo',
  'InstituteLogo', 'instituteLogo',
  'SchoolLogo', 'schoolLogo',
  'HeaderLogo', 'headerLogo',
];

const LOGO_CONTAINERS = [
  'institutionInfo', 'institution', 'instituteInfo',
  'data', 'settings', 'settingsData', 'info', 'result',
];

const findInstituteLogo = (source, depth = 0) => {
  if (!source || typeof source !== 'object' || depth > 3) return '';

  for (const key of INSTITUTE_LOGO_KEYS) {
    const src = toImageSrc(source[key]);
    if (src) return src;
  }

  for (const box of LOGO_CONTAINERS) {
    const inner = source[box];
    if (inner && typeof inner === 'object') {
      const found = findInstituteLogo(Array.isArray(inner) ? inner[0] : inner, depth + 1);
      if (found) return found;
    }
  }

  return '';
};

const ExamAllClassRoutine = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();

  // ✅ URL থেকে প্যারামস রিড করা
  const [searchParams] = useSearchParams();
  const urlSessionID = searchParams.get('sessionid');
  const urlExamID = searchParams.get('examid');
  const urlSubClassID = searchParams.get('subclassid');

  const methods = useForm({
    defaultValues: {
      ReportID: ROUTINE_REPORT_ID,
      // ✅ URL-এ ডাটা থাকলে ফর্মের ডিফল্ট ভ্যালু হিসেবে সেট হবে
      SessionID: urlSessionID || '',
      ExamID: urlExamID || '',
      SubClassID: urlSubClassID || '',
    },
  });

  const settingsState = useSelector((state) => state.settings);
  const { status } = settingsState;

  const [documentLogo, setDocumentLogo] = useState('');
  const [logoIsActive, setLogoIsActive] = useState(false);
  const [docSettings, setDocSettings] = useState(null);

  // ✅ আপনার রিকোয়ারমেন্ট অনুযায়ী ডিফল্ট ভ্যালু সেট করা হলো
  const [routineHideEmptyRows, setRoutineHideEmptyRows] = useState(true); // always checked
  const [routineHideEmptyShift, setRoutineHideEmptyShift] = useState(true); // always checked
  const [routineShowClassCol, setRoutineShowClassCol] = useState(false);
  const [routineShowRoom, setRoutineShowRoom] = useState(false);
  const [routineShowTime, setRoutineShowTime] = useState(false); // unchecked

  // ✅ পরীক্ষা সময়সূচী নোট (bottom-left এ show হবে)
  const [routineScheduleNote, setRoutineScheduleNote] = useState('');

  const { control, handleSubmit, watch, register, setValue } = methods;
  const formValues = useWatch({ control });
  const selectedReportID = formValues?.ReportID;
  const languageID = formValues?.id;

  const isRoutineReport = Number(selectedReportID) === ROUTINE_REPORT_ID;
  const langId = Number(languageID) || 1;

  const routineLang = langId === 2 ? 'ar' : langId === 3 ? 'en' : 'bn';
  const rui = (key) => getRRText(key, routineLang);

  // watch করা হচ্ছে যেন কুয়েরি রি-রান হয়
  const [SessionID, ExamID, SubClassID, ClassID] = watch([
    'SessionID', 'ExamID', 'SubClassID', 'ClassID',
  ]);

  // ✅ URL থেকে আসা ডাটা ফর্মে সেট করা (যাতে সিলেক্ট বক্সে দেখায়)
  useEffect(() => {
    if (urlSessionID) setValue('SessionID', urlSessionID);
    if (urlExamID) setValue('ExamID', urlExamID);
    if (urlSubClassID) setValue('SubClassID', urlSubClassID);
  }, [urlSessionID, urlExamID, urlSubClassID, setValue]);

  const shouldShowFields = (fieldName) => {
    if (Number(selectedReportID) !== ROUTINE_REPORT_ID) return false;
    return ['ReportID', 'SessionID', 'ExamID', 'Langauge'].includes(fieldName);
  };

  // ✅ আপডেট করা কুয়েরি (URL এর ডাটা সবার আগে প্রায়োরিটি পাবে)
  const { data: routineData, isFetching: routineFetching } = useGetExamRoutineReportQuery(
    isRoutineReport && (SessionID || urlSessionID) && (ExamID || urlExamID)
      ? {
        SessionID: SessionID || urlSessionID,
        ExamID: ExamID || urlExamID,
        ...(ClassID ? { ClassID } : {}),
        ...((SubClassID || urlSubClassID) ? { SubClassID: SubClassID || urlSubClassID } : {}),
      }
      : skipToken
  );

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const routineClassOptions = useMemo(() => routineData?.classes ?? [], [routineData]);

  const routineSubClassOptions = useMemo(() => {
    const base =
      (Array.isArray(SubClassListData) && SubClassListData.length
        ? SubClassListData
        : routineData?.subClasses) ?? [];

    if (!ClassID) return base;
    return base.filter((g) => String(g.ClassID ?? '') === String(ClassID));
  }, [SubClassListData, routineData, ClassID]);

  useEffect(() => {
    if (!isRoutineReport || !SubClassID) return;
    const ok = routineSubClassOptions.some(
      (g) => String(g.SubClassID) === String(SubClassID)
    );
    if (!ok) setValue('SubClassID', '');
  }, [isRoutineReport, routineSubClassOptions, SubClassID, setValue]);

  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (status === 'idle') {
      dispatch(fetchSettingsData());
    }
  }, [status, dispatch, pageTitle]);

  useEffect(() => {
    const fetchDocumentSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/settings/document_settings`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const result = await response.json();
          setDocSettings(result);
          if (result.documentLogo) setDocumentLogo(`${API_URL}/public${result.documentLogo}`);
          setLogoIsActive(result.isActive === true || result.isActive === 'true');
        }
      } catch (err) {
        console.error('Failed to fetch document settings:', err);
      }
    };
    fetchDocumentSettings();
  }, []);

  const onSubmit = () => {
    window.print();
  };

  const instituteLogo = useMemo(
    () => findInstituteLogo(settingsState) || findInstituteLogo(docSettings),
    [settingsState, docSettings]
  );

  const routineLogo = useMemo(
    () =>
      toImageSrc(routineData?.header?.InstitutionLogo) ||
      instituteLogo ||
      documentLogo,
    [routineData, instituteLogo, documentLogo]
  );

  return (
    <>
      <style>
        {`
          @media print {
            .exam-report-bar { position: static !important; }
          }
        `}
      </style>

      <div>
        <div className="flex flex-col font-default gap-3 print:hidden">
          <div className="exam-report-bar relative w-full rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">
            <div className="p-5 space-y-4">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
                    {shouldShowFields('SessionID') && (
                      <DefaultSelect
                        label={translate('Session')}
                        nameField="SessionName"
                        registerKey="SessionID"
                        valueField="SessionID"
                        options={sessionData ?? []}
                        require="This Field is required"
                        defaultSelect={false}
                        unicode={true}
                      />
                    )}

                    {shouldShowFields('ExamID') && (
                      <DefaultSelect
                        label={translate('Exam')}
                        nameField="ExamName"
                        registerKey="ExamID"
                        valueField="ExamID"
                        options={examNameData ?? []}
                        require="This Field is required"
                        unicode={true}
                      />
                    )}

                    {isRoutineReport && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {rui('mainClass')}
                          </label>
                          <div className="relative">
                            <select
                              {...register('ClassID')}
                              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">{rui('allClass')}</option>
                              {routineClassOptions.map((c) => (
                                <option key={c.ClassID} value={c.ClassID}>
                                  {getClassText(c, routineLang) || c.ClassID}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {rui('subClass')}
                          </label>
                          <div className="relative">
                            <select
                              {...register('SubClassID')}
                              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">{rui('allSubClass')}</option>
                              {routineSubClassOptions.map((g) => (
                                <option key={g.SubClassID} value={g.SubClassID}>
                                  {getSubClassText(g, routineLang) || g.SubClassID}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}

                    {shouldShowFields('Langauge') && (
                      <DefaultSelect
                        label={translate('Langauge')}
                        nameField="name"
                        registerKey="id"
                        valueField="id"
                        options={language ?? []}
                        require="This Field is required"
                        unicode={true}
                      />
                    )}
                  </div>

                  {isRoutineReport && (
                    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 flex flex-wrap items-center gap-3">
                      {/* ১. কাগজের সাজ লেবেল */}
                      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-1">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        কাগজের সাজ:
                      </span>

                      {/* ২. চেকবক্সগুলো */}
                      {[
                        { key: 'rows', text: rui('hideEmptyRow'), on: routineHideEmptyRows, set: setRoutineHideEmptyRows },
                        { key: 'shift', text: rui('hideEmptyShift'), on: routineHideEmptyShift, set: setRoutineHideEmptyShift },
                        { key: 'class', text: rui('showClassCol'), on: routineShowClassCol, set: setRoutineShowClassCol },
                        { key: 'time', text: rui('showTime'), on: routineShowTime, set: setRoutineShowTime },
                        { key: 'room', text: rui('showRoom'), on: routineShowRoom, set: setRoutineShowRoom },
                      ].map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition">
                          <input type="checkbox" className="h-[15px] w-[15px] accent-teal-600" checked={opt.on} onChange={(e) => opt.set(e.target.checked)} />
                          <span className="text-[13px] font-medium text-slate-700">{opt.text}</span>
                        </label>
                      ))}

                      {/* ৩. পরীক্ষা সময়সূচী ইনপুট (কাগজের সাজের ঠিক পাশে) */}
                      <div className="flex-1 min-w-[200px] flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1.5 ml-2">
                        <label htmlFor="routineScheduleNote" className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 shrink-0 cursor-pointer">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          সময়সূচী:
                        </label>
                        <input
                          id="routineScheduleNote"
                          type="text"
                          value={routineScheduleNote}
                          onChange={(e) => setRoutineScheduleNote(e.target.value)}
                          placeholder="যেমন: সকাল ১০টা থেকে দুপুর ১টা..."
                          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                        />
                      </div>

                      {/* ৪. প্রিন্ট বাটন (একদম ডানদিকে) */}
                      <button
                        type="button"
                        onClick={onSubmit}
                        className="h-9 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition shrink-0 ml-auto"
                        title="প্রিন্ট করুন"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        প্রিন্ট
                      </button>
                    </div>
                  )}
                </form>
              </FormProvider>
            </div>
          </div>
        </div>

        {routineFetching && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white py-14 text-center print:hidden">
            <div className="inline-block h-8 w-8 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm mt-3">তালিকা আনা হচ্ছে…</p>
          </div>
        )}

        <div className="print:block">
          {isRoutineReport && !routineFetching && (
            <ExamRoutinePDF
              reportData={routineData}
              lang={routineLang}
              instituteLogo={routineLogo}
              showWatermark={logoIsActive}
              hideEmptyRows={routineHideEmptyRows}
              hideEmptyShift={routineHideEmptyShift}
              showClassCol={routineShowClassCol}
              showRoom={routineShowRoom}
              showTime={routineShowTime}
              scheduleNote={routineScheduleNote}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ExamAllClassRoutine;
