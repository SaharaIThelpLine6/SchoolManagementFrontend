import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import useTranslate from '../utils/Translate';

// তোমার টেমপ্লেট বিল্ডার কম্পোনেন্ট ইমপোর্ট করো
import ReportBuilder from '../view/students/reports/student-report-list/ReportBuilder';

export default function StudentsReportList() {
  const methods = useForm();
  const translate = useTranslate();
  const { watch } = methods;
  const selectedReportID = watch('studentReport');

  // ✅ কম্পোনেন্টের ভেতরে translate ব্যবহার করে অপশন তৈরি
  const reportOptions = [
    { id: '1', value: translate('1. Custom Template Builder') },
    { id: '2', value: translate('2. Other reports coming soon') },
    // ভবিষ্যতে আরও রিপোর্ট যোগ করবেন এখানে
  ];

  // ডেমো দেখানোর কন্ডিশন
  const showDemo = selectedReportID === '1';

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

      {showDemo && (
        <div className="mt-6 print:mt-0">
          <ReportBuilder />
        </div>
      )}
    </div>
  );
}
