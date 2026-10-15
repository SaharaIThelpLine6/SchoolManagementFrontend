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

const ResultReport = () => {
  const translate = useTranslate();
  const [queryParams, setQueryParams] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(true); // mobile/tablet এ collapse করার জন্য

  const { data } = useGetLabelNameListsQuery();
  const labels = data?.[0] || {};

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const { data: sessionData } = useGetExamSessionQuery();
  const { data: classListData } = useGetClassListQuery();
  const methods = useForm();
  const { control, handleSubmit, setValue } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });
  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });

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

  const onSubmit = (formData) => {
    const params = {
      report_data: selectedReportID,
      session_id: formData.SessionID,
      exam_id: formData.ExamID,
      subclass_id: formData.SubClassID,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') delete params[key];
    });

    setQueryParams(params);
    setFiltersOpen(false); // mobile এ submit করলে filter বন্ধ হয়ে report দেখা যাবে
  };

  const hasStudentResults =
    Array.isArray(reportData?.studentResults) && reportData.studentResults.length > 0;
  const hasDivisionStatistics =
    Array.isArray(reportData?.divisionStatistics) && reportData.divisionStatistics.length > 0;
  const hasReportContent = hasStudentResults || hasDivisionStatistics;

  const handlePrintPDF = () => window.print();

  const renderReport = () => {
    if (!hasReportContent) return null;
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

  if (isLoading) return <Loading />;

  return (
    <FormProvider {...methods}>
      <div className="min-h-[100dvh] bg-slate-50">
        {/* ═══════════════ HEADER ═══════════════ */}
        {/* Sticky শুধু desktop এ; mobile এ sticky হলে screen এর বেশিরভাগ জায়গা নিয়ে নিত */}
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

                {hasReportContent && (
                  <button
                    type="button"
                    onClick={handlePrintPDF}
                    aria-label="Print"
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span className="hidden sm:inline">Print</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter form — mobile/tablet এ collapsible, desktop এ সবসময় দেখা যাবে */}
            <form
              onSubmit={handleSubmit(onSubmit)}
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

              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 lg:hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  রিপোর্ট দেখুন
                </button>
              </div>
            </form>
          </div>
        </header>

        {/* ═══════════════ MAIN ═══════════════ */}
        <main className="mx-auto max-w-[1600px] print:max-w-none">
          {isFetching && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 flex items-center justify-center print:hidden">
              <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="m-3 sm:m-4 lg:m-6 p-4 sm:p-5 bg-rose-50 border border-rose-100 rounded-xl text-center print:hidden">
              <p className="text-sm font-medium text-rose-700">রিপোর্ট লোড করা যায়নি</p>
              <p className="text-xs text-rose-500 mt-1">Failed to load report. Please try again.</p>
            </div>
          )}

          {!hasReportContent && !isFetching && !error && <EmptyState />}

          {hasReportContent && (
            <div className="p-2 sm:p-4 lg:p-6 print:p-0">
              {/* বড় table/sheet mobile এ আড়াআড়ি scroll করবে, print এ নয় */}
              <div className="overflow-x-auto overscroll-x-contain rounded-lg print:overflow-visible">
                <div className="min-w-fit">{renderReport()}</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </FormProvider>
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
      ফিল্টার থেকে তথ্য নির্বাচন করে "রিপোর্ট দেখুন" বাটনে ক্লিক করুন
    </p>
  </div>
);

export default ResultReport;