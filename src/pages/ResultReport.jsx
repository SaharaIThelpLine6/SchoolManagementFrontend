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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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

  useEffect(() => {
    const handler = () => setExportMenuOpen(false);
    if (exportMenuOpen) {
      window.addEventListener('click', handler);
      return () => window.removeEventListener('click', handler);
    }
  }, [exportMenuOpen]);

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
  };

  const hasStudentResults =
    Array.isArray(reportData?.studentResults) && reportData.studentResults.length > 0;
  const hasDivisionStatistics =
    Array.isArray(reportData?.divisionStatistics) && reportData.divisionStatistics.length > 0;
  const hasReportContent = hasStudentResults || hasDivisionStatistics;

  const handlePrintPDF = () => window.print();

  const handleExportExcel = () => {
    if (!reportData) return;
    let rows = [];
    if (hasStudentResults) {
      rows.push(['SL', 'Name', 'Roll', 'Class', 'Section', 'Total', 'GPA', 'Grade', 'Result']);
      reportData.studentResults.forEach((s, i) => {
        rows.push([
          i + 1,
          s.StudentName || s?.User?.UserName || '',
          s.RollNo || '',
          s.ClassName || '',
          s.SectionName || '',
          s.TotalMarks || s.Total || '',
          s.GPA || '',
          s.Grade || s?.Division?.DivisionNames || '',
          s.Result || '',
        ]);
      });
    }
    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const val = String(cell ?? '');
            return val.includes(',') || val.includes('"')
              ? `"${val.replace(/"/g, '""')}"`
              : val;
          })
          .join(',')
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `result_report_${selectedReportID}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `result_report_${selectedReportID}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    if (!hasReportContent) return null;
    const props = {
      reportData,
      query: queryParams,
      labels,
    };
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
      <div className="min-h-screen bg-slate-50">
        {/* ═══════════════ TOP HEADER ═══════════════ */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
          <div className="px-4 lg:px-6 py-3 flex flex-row flex-wrap items-end gap-x-4 gap-y-3">
            <div className="flex items-center gap-3 shrink-0 self-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-base text-slate-800 leading-tight">ফলাফল রিপোর্ট</h1>
                <p className="text-[11px] text-slate-400 leading-tight">Result Report Generator</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 min-w-0 flex-row flex-wrap items-end gap-3">
              <div className="w-[150px] shrink-0">
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
                <div className="w-[150px] shrink-0">
                  <DefaultSelect label={translate('Session')} nameField="SessionName" registerKey="SessionID" valueField="SessionID" options={sessionData ?? []} require="This Field is required" defaultSelect={false} unicode={true} />
                </div>
              )}

              {shouldShowFields('ExamID') && (
                <div className="w-[150px] shrink-0">
                  <DefaultSelect label={translate('Exam')} nameField="ExamName" registerKey="ExamID" valueField="ExamID" options={examNameData ?? []} require="This Field is required" unicode={true} />
                </div>
              )}

              {shouldShowFields('ClassID') && (
                <div className="w-[150px] shrink-0">
                  <DefaultSelect label={translate('Class')} nameField="ClassName" registerKey="ClassID" valueField="ClassID" options={classListData ?? []} require="This Field is required" unicode={true} />
                </div>
              )}

              {shouldShowFields('SubClassID') && (
                <div className="w-[150px] shrink-0">
                  <DefaultSelect label={translate('Sub Class')} nameField="SubClass" registerKey="SubClassID" valueField="SubClassID" options={subclassListData ?? []} require="This Field is required" unicode={true} />
                </div>
              )}

              <div className="flex-none">
                <button type="submit" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  রিপোর্ট দেখুন
                </button>
              </div>
            </form>

            {hasReportContent && (
              <div className="relative shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handlePrintPDF} className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>

                  {/* <button type="button" onClick={() => setExportMenuOpen(!exportMenuOpen)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                    <svg className={`w-3 h-3 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button> */}
                </div>

                {/* {exportMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-40 py-1">
                    <MenuItem icon="pdf" label="PDF / Print" desc="Browser print dialog" onClick={handlePrintPDF} />
                    <MenuItem icon="excel" label="Excel (CSV)" desc="Opens in spreadsheet" onClick={handleExportExcel} />
                    <MenuItem icon="json" label="JSON Data" desc="Raw data export" onClick={handleExportJSON} />
                  </div>
                )} */}
              </div>
            )}
          </div>
        </header>

        {/* ═══════════════ MAIN — report component নিজেই layout handle করবে ═══════════════ */}
        <main className="print:block">
          {isFetching && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="m-6 p-5 bg-rose-50 border border-rose-100 rounded-xl text-center">
              <p className="text-sm font-medium text-rose-700">রিপোর্ট লোড করা যায়নি</p>
              <p className="text-xs text-rose-500 mt-1">Failed to load report. Please try again.</p>
            </div>
          )}

          {!hasReportContent && !isFetching && !error && <EmptyState />}

          {hasReportContent && (
            <>
              <div className="print:hidden">{renderReport()}</div>
              <div className="hidden print:block">{renderReport()}</div>
            </>
          )}
        </main>
      </div>
    </FormProvider>
  );
};

/* ═══════════════ SUB COMPONENTS ═══════════════ */

const MenuItem = ({ icon, label, desc, onClick }) => {
  const icons = {
    pdf: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    excel: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    json: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
  };
  return (
    <button onClick={onClick} className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 text-left transition-colors">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon]}</svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{desc}</p>
      </div>
    </button>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="relative mb-5">
      <div className="absolute inset-0 bg-emerald-100 rounded-2xl blur-2xl opacity-60" />
      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center">
        <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    </div>
    <h3 className="text-slate-700 font-semibold text-base mb-1">কোনো রিপোর্ট তৈরি হয়নি</h3>
    <p className="text-slate-400 text-sm max-w-xs">বাম দিকের ফিল্টার থেকে তথ্য নির্বাচন করে "রিপোর্ট দেখুন" বাটনে ক্লিক করুন</p>
  </div>
);

export default ResultReport;

