import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import useTranslate from '../utils/Translate';

// টেমপ্লেট বিল্ডার কম্পোনেন্ট
import ReportBuilder from '../view/students/reports/student-report-list/ReportBuilder';
// শেয়ার্ড ফিল্টার wrapper — এখন থেকে যেকোনো রিপোর্ট এটার ভেতরে বসিয়ে
// দিলেই session/subClass/gender/admissionType/residential/userStatus/
// district/thana ফিল্টার + প্রিন্ট বাটন ফ্রি তে পেয়ে যাবে
import FilterableReportView from '../view/students/reports/student-report-list/FilterableReportView';
// বাংলা হাজিরা খাতা কম্পোনেন্ট
import BanglaAttendence from '../view/students/reports/BanglaAttendence';

// প্রতিটি রিপোর্টের জন্য আলাদা সেটিং
const REPORT_CONFIGS = {
  '1': {
    component: 'ReportBuilder',
    rowsPerPage: { portrait: 25, landscape: 24 },  // Custom Template Builder
  },
  '2': {
    component: 'BanglaAttendence',
    rowsPerPage: { portrait: 38, landscape: 20 },  // বাংলা হাজিরা খাতা — বেশি ডেটা
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

  const reportOptions = [
    { id: '1', value: translate('1. Custom Template Builder') },
    { id: '2', value: translate('৮. বাংলা হাজিরা খাতা 30 দিনের') },
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
          <FilterableReportView
            title="ফিল্টার"
            note="ফিল্টার করে নিচে প্রিভিউতে দেখে প্রিন্ট করুন।"
            rowsPerPage={cfg.rowsPerPage}   // 👈 ফিল্টার-ভিউকেও পাঠিয়ে দিন
          >
            {({ filters, filteredData }) => (
              <BanglaAttendence
                reportData={filteredData}
                SubClassID={filters.SubClassID}
                SessionID={filters.SessionID}
                rowsPerPage={cfg.rowsPerPage}   // 👈 কম্পোনেন্টেও পাঠান
              />
            )}
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

      {/* রিপোর্ট ডিসপ্লে */}
      <div className="mt-6 print:mt-0">
        {renderReport()}
      </div>
    </div>
  );
}
