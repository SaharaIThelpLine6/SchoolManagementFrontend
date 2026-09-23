import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import useTranslate from '../utils/Translate';

// টেমপ্লেট বিল্ডার কম্পোনেন্ট
import ReportBuilder from '../view/students/reports/student-report-list/ReportBuilder';
import FilterableReportView from '../view/students/reports/student-report-list/FilterableReportView';
import BanglaAttendence from '../view/students/reports/BanglaAttendence';
import ArabicAttendence from '../view/students/reports/ArabicAttendence';
import BanglaAttendenceSubjectWari from '../view/students/reports/BanglaAttendenceSubjectWari';
import AdmissionFormPdf from '../view/general-information/user-reports/AdmissionFormPdf';

// প্রতিটি রিপোর্টের জন্য আলাদা সেটিং
const REPORT_CONFIGS = {
  '1': {
    component: 'ReportBuilder',
    rowsPerPage: { portrait: 21, landscape: 24 },
  },
  '2': {
    component: 'BanglaAttendence',
    rowsPerPage: { portrait: 38, landscape: 20 },
  },
    '3': {
    component: 'BanglaAttendenceSubjectWari',
    rowsPerPage: { portrait: 10, landscape: 12 },
  },
    '4': {
    component: 'AdmissionFormPdf',
    rowsPerPage: { portrait: 1, landscape: 1 },
  },
  '15': {
    component: 'ComingSoon',
    rowsPerPage: { portrait: 20, landscape: 20 },
  },
};

export default function StudentsReportList() {
  const methods = useForm();
  const translate = useTranslate();
  const { watch } = methods;
  const selectedReportID = watch('studentReport');
  const [printMode, setPrintMode] = useState('data');
  const [attendanceLanguage, setAttendanceLanguage] = useState('bangla');

  const reportOptions = [
    { id: '1', value: translate('1. Custom Template Builder') },
    { id: '2', value: translate('2. হাজিরা খাতা 30 দিনের') },
    { id: '3', value: translate('3. বাংলা হাজিরা খাতা 30 দিনের (বিষয়ওয়ারী)') },
    { id: '4', value: translate('4. ছাত্র ভর্তি ফরম') },
    { id: '15', value: translate('2. Other reports coming soon') },
  ];

  // রিপোর্ট রেন্ডারিং ফাংশন
  const renderReport = () => {
    const cfg = REPORT_CONFIGS[selectedReportID];
    if (!cfg) return null;

    switch (cfg.component) {
      case 'ReportBuilder':
        return (
          <ReportBuilder
            portraitRowsPerPage={cfg.rowsPerPage.portrait}
            landscapeRowsPerPage={cfg.rowsPerPage.landscape}
          />
        );

      case 'BanglaAttendence':
        return (
          <>
            {/* ✅ ভাষা পরিবর্তনের সুইচ — রিপোর্টের উপরে */}
            <div className="print:hidden mb-4 flex justify-center">
              <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setAttendanceLanguage('bangla')}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                    attendanceLanguage === 'bangla'
                      ? 'bg-[#1B3A57] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  🇧🇩 বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceLanguage('arabic')}
                  className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                    attendanceLanguage === 'arabic'
                      ? 'bg-[#1B3A57] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  🇸🇦 العربية
                </button>
              </div>
            </div>

            <FilterableReportView
              title="ফিল্টার"
              note="ফিল্টার করে নিচে প্রিভিউতে দেখে প্রিন্ট করুন।"
              rowsPerPage={cfg.rowsPerPage}
            >
              {({ filters, filteredData }) =>
                attendanceLanguage === 'bangla' ? (
                  <BanglaAttendence
                    reportData={filteredData}
                    SubClassID={filters.SubClassID}
                    SessionID={filters.SessionID}
                    rowsPerPage={cfg.rowsPerPage}
                  />
                ) : (
                  <ArabicAttendence
                    reportData={filteredData}
                    SubClassID={filters.SubClassID}
                    SessionID={filters.SessionID}
                    rowsPerPage={cfg.rowsPerPage}
                  />
                )
              }
            </FilterableReportView>
          </>
        );

      // 👈 নতুন কম্পোনেন্টের জন্য কেস (প্যাচ যুক্ত করা হয়েছে)
      case 'BanglaAttendenceSubjectWari':
        return (
          <FilterableReportView
            title="ফিল্টার"
            note="ফিল্টার করে ও বিষয়ের খাতার সংখ্যা বেছে নিয়ে নিচে প্রিভিউতে দেখে প্রিন্ট করুন।"
            rowsPerPage={cfg.rowsPerPage}
            showBookLine
          >
            {({ filters, filteredData }) => (
              <BanglaAttendenceSubjectWari
                reportData={filteredData}
                SubClassID={filters.SubClassID}
                BookLine={filters.BookLine} // ফিল্টার থেকে BookLine আসলে পাস হবে, না আসলে ডিফল্ট ৩ হবে
                rowsPerPage={cfg.rowsPerPage}
              />
            )}
          </FilterableReportView>
        );
      
      case 'AdmissionFormPdf':
        return (
          <FilterableReportView
            title="ফিল্টার"
            note="শ্রেণি ও শিক্ষাবর্ষ নির্বাচন করে নিচে প্রিভিউতে দেখে প্রিন্ট করুন।"
            showAdmissionStatus
          >
            {({ filters, filteredData }) => {
              // 🟢🟢🟢 "খালি ফরম" মোড বাছাই করা হলে → একটি blank form
              if (printMode === 'blank') {
                return (
                  <div className="admission-form-page">
                    <AdmissionFormPdf
                      SubClassID={filters.SubClassID}
                      SessionID={filters.SessionID}
                      admissionStatus={filters.IsActive}
                    />
                  </div>
                );
              }

              // 🟢 "ডেটা" মোড → filtered ডেটা যত আছে সব form
              if (filteredData && filteredData.length > 0) {
                return (
                  <>
                    {filteredData.map((student, i) => (
                      <div key={student.StudentCode || i} className="admission-form-page">
                        <AdmissionFormPdf
                          SubClassID={filters.SubClassID}
                          SessionID={filters.SessionID}
                          student={student}
                          admissionStatus={filters.IsActive}
                        />
                      </div>
                    ))}
                  </>
                );
              }

              // 🟢 কোনো ডেটা না পেলে → খালি form
              return (
                <div className="admission-form-page">
                  <AdmissionFormPdf
                    SubClassID={filters.SubClassID}
                    SessionID={filters.SessionID}
                    admissionStatus={filters.IsActive}
                  />
                </div>
              );
            }}
          </FilterableReportView>
        );

      case 'ComingSoon':
        return <div className="text-center p-10 text-slate-500">বাকি রিপোর্ট শিগ্রই আসবে...</div>;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 md:p-4 rounded-xl shadow-lg font-SolaimanLipi print:p-0 print:shadow-none print:bg-transparent">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5 print:hidden">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate('Students Report List')}
        </h3>
      </div>

      <FormProvider {...methods}>
        <form className="w-full space-y-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
            <DefaultSelect
              label={translate('Select Report')}
              options={reportOptions}
              valueField="id"
              nameField="value"
              registerKey="studentReport"
              require="Report is required"
            />
          </div>
        </form>
      </FormProvider>

      {/* 🟢🟢🟢 Print Mode Toggle — শুধু ছাত্র ভর্তি ফরম (id=4) নির্বাচিত হলে দেখাবে */}
      {selectedReportID === '4' && (
        <div className="flex flex-wrap gap-2 mt-4 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg print:hidden">
          <span className="text-sm font-semibold text-slate-600 self-center mr-2">
            {translate('Print Mode')}:
          </span>
          <button
            type="button"
            onClick={() => setPrintMode('data')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              printMode === 'data'
                ? 'bg-[#1E4D2B] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            📄 {translate('ডেটা সহ ফরম')}
          </button>
          <button
            type="button"
            onClick={() => setPrintMode('blank')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              printMode === 'blank'
                ? 'bg-[#1E4D2B] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            📝 {translate('খালি ফরম (হাতে লিখার জন্য)')}
          </button>
        </div>
      )}

      {/* রিপোর্ট ডিসপ্লে */}
      <div className="mt-6 print:mt-0">
        {renderReport()}
      </div>
    </div>
  );
}
