import { useEffect, useState } from 'react';
import Loading from '../components/Loading/Loading';
import useTranslate from '../utils/Translate';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { resultReports } from '../Data/userReportsData';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import {
  useGetExamFilterExamsQuery,
  useGetExamFilterSubclassesQuery,
  useGetExamSessionQuery,
} from '../features/exam/examQuerySlice';
import { useGetLabelNameListsQuery, useGetResultReportDataQuery } from '../features/result/resultSilce';
import StudentResultSheet from '../view/result/Reports/StudentResultSheet';
import AttendanceSheet from '../view/result/Reports/AttendanceSheet';
import StudentResultState from '../view/result/Reports/StudentResultState';

// Kon report-e kon filter lagbe (query param key onujayi)
const REQUIRED_FILTERS = {
  1: ['session_id', 'exam_id', 'subclass_id'],
  2: ['session_id', 'exam_id', 'subclass_id'],
  3: ['session_id', 'exam_id', 'subclass_id'],
  4: ['session_id', 'exam_id', 'subclass_id'],
  5: ['session_id', 'exam_id', 'subclass_id'],
  6: ['session_id', 'exam_id'],
};

const ResultReport = () => {
  const translate = useTranslate();
  const [filtersOpen, setFiltersOpen] = useState(true); // mobile/tablet এ collapse করার জন্য

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};

  const { data: sessionData } = useGetExamSessionQuery();
  const { data: classListData } = useGetClassListQuery();
  const methods = useForm();
  const { control, setValue } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });
  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });
  const subClassID = useWatch({ control, name: 'SubClassID' });

  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID: sessionID },
    { skip: !sessionID }
  );
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID: sessionID, ExamID: examID },
    { skip: !sessionID || !examID }
  );

  useEffect(() => {
    setValue('ExamID', '');
    setValue('SubClassID', '');
  }, [sessionID, setValue]);

  useEffect(() => {
    setValue('SubClassID', '');
  }, [examID, setValue]);

  // Query params: shob required field na bhorle null (=> API call hobe na)
  const queryParams = (() => {
    if (!selectedReportID) return null;

    const params = {
      report_data: selectedReportID,
      session_id: sessionID,
      exam_id: examID,
      subclass_id: subClassID,
    };

    const required = REQUIRED_FILTERS[Number(selectedReportID)] || [];
    const isMissing = required.some(
      (key) => params[key] === undefined || params[key] === '' || params[key] === null
    );
    if (isMissing) return null;

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '' || params[key] === null) {
        delete params[key];
      }
    });
    return params;
  })();

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const shouldShowFields = (fieldName) => {
    switch (Number(selectedReportID)) {
      case 1:
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'UserCode'].includes(fieldName);
      case 2:
      case 3:
      case 4:
      case 5:
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID'].includes(fieldName);
      case 6:
        return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
      default:
        return false;
    }
  };

  const hasStudentResults =
    Array.isArray(reportData?.studentResults) && reportData.studentResults.length > 0;
  const hasDivisionStatistics =
    Array.isArray(reportData?.divisionStatistics) && reportData.divisionStatistics.length > 0;
  // Attendance report onno key-te data pathale ekhane key-ta milie nin
  const hasAttendance = Array.isArray(reportData?.students) && reportData.students.length > 0;

  const hasReportContent = hasStudentResults || hasDivisionStatistics || hasAttendance;

  // Error thakle purono (stale) data dekhabo na
  const showReport = hasReportContent && !error && !!queryParams;

  const handlePrintPDF = () => window.print();

  const renderReport = () => {
    if (!showReport) return null;
    const props = { reportData, query: queryParams, labels };
    switch (Number(selectedReportID)) {
      case 1:
        return <StudentResultSheet {...props} />;
      case 2:
        return <AttendanceSheet {...props} />;
      case 3:
        return <StudentResultState {...props} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-[100dvh] bg-slate-50">
        {/* ═══════════════ HEADER ═══════════════ */}
        <header className="bg-white border-b border-slate-200 lg:sticky lg:top-0 z-30 print:hidden">
          <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6 py-3">
            {/* Top bar: brand + actions */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm sm:text-base text-slate-800 leading-tight truncate">
                    ফলাফল রিপোর্ট
                  </h1>
                  <p className="text-[11px] text-slate-400 leading-tight truncate">
                    Result Report Generator
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Filter toggle — শুধু lg এর নিচে */}
                <button
                  type="button"
                  onClick={() => setFiltersOpen((v) => !v)}
                  aria-expanded={filtersOpen}
                  aria-label="Toggle filters"
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">ফিল্টার</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              </div>

            </div>

            {/* Filter form — no submit button, auto-loads via useWatch */}
            <div
              className={`${filtersOpen ? 'grid' : 'hidden'} lg:grid mt-3 gap-3 items-end
                grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5`}
            >
              <div className="min-w-0">
                <DefaultSelect
                  label={translate('Report')}
                  nameField="ReportName"
                  registerKey="ReportID"
                  valueField="ReportID"
                  options={resultReports}
                  type="number"
                  require="This Field is required"
                />
              </div>

              {shouldShowFields('SessionID') && (
                <div className="min-w-0">
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
                </div>
              )}

              {shouldShowFields('ExamID') && (
                <div className="min-w-0">
                  <DefaultSelect
                    label={translate('Exam')}
                    nameField="ExamName"
                    registerKey="ExamID"
                    valueField="ExamID"
                    options={examNameData ?? []}
                    require="This Field is required"
                    unicode={true}
                  />
                </div>
              )}

              {shouldShowFields('ClassID') && (
                <div className="min-w-0">
                  <DefaultSelect
                    label={translate('Class')}
                    nameField="ClassName"
                    registerKey="ClassID"
                    valueField="ClassID"
                    options={classListData ?? []}
                    require="This Field is required"
                    unicode={true}
                  />
                </div>
              )}

              {shouldShowFields('SubClassID') && (
                <div className="min-w-0">
                  <DefaultSelect
                    label={translate('Sub Class')}
                    nameField="SubClass"
                    registerKey="SubClassID"
                    valueField="SubClassID"
                    options={subclassListData ?? []}
                    require="This Field is required"
                    unicode={true}
                  />
                </div>
              )}

              {showReport && (
                <div className="w-full flex items-end justify-end gap-2 lg:col-span-1">
                  <button
                    onClick={handlePrintPDF}
                    aria-label="Print"
                    className={`group flex items-center justify-center border rounded-lg shadow-sm transition-all duration-200 w-10 h-10 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 active:scale-95`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ═══════════════ MAIN ═══════════════ */}
        <main className="mx-auto max-w-[1600px] print:max-w-none">
          {/* First load: form unmount na kore main area-te loading dekhai */}
          {isLoading && <Loading />}

          {isFetching && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex items-center justify-center print:hidden">
              <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && !isFetching && (
            <div className="m-3 sm:m-4 lg:m-6 p-4 sm:p-5 bg-rose-50 border border-rose-100 rounded-xl text-center print:hidden">
              <p className="text-sm font-medium text-rose-700">রিপোর্ট লোড করা যায়নি</p>
              <p className="text-xs text-rose-500 mt-1">Failed to load report. Please try again.</p>
            </div>
          )}

          {!showReport && !isLoading && !isFetching && !error && <EmptyState />}

          {showReport && (
            <div className="p-2 sm:p-4 lg:p-6 print:p-0">
              <div className="overflow-x-auto overscroll-x-contain rounded-lg print:overflow-visible">
                <div className="min-w-fit">{renderReport()}</div>
              </div>
            </div>
          )}
        </main>
      </div >
    </FormProvider >
  );
};

/* ═══════════════ SUB COMPONENTS ═══════════════ */

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 text-center print:hidden">
    <div className="relative mb-5">
      <div className="absolute inset-0 bg-emerald-100 rounded-2xl blur-2xl opacity-60" />
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center">
        <svg className="w-7 h-7 sm:w-9 sm:h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
    <h3 className="text-slate-700 font-semibold text-base mb-1">কোনো রিপোর্ট তৈরি হয়নি</h3>
    <p className="text-slate-400 text-sm max-w-xs">
      ফিল্টার থেকে তথ্য নির্বাচন করুন
    </p>
  </div>
);

export default ResultReport;