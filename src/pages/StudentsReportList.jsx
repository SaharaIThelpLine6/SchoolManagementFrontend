import { useEffect, useState } from 'react';

// 🔵 রিপোর্ট শেল — হেডার + ফিল্টার বার + ⚙️ সেটিং + থিম (ফন্ট/জলছাপ)
import FilterableReportView from '../view/students/reports/student-report-list/FilterableReportView';
import { FilterSelect } from '../view/students/reports/student-report-list/ReportFilterFields';

// রিপোর্ট কম্পোনেন্টগুলো
import ReportBuilder from '../view/students/reports/student-report-list/ReportBuilder';
import BanglaAttendence from '../view/students/reports/BanglaAttendence';
import ArabicAttendence from '../view/students/reports/ArabicAttendence';
import BanglaAttendenceSubjectWari from '../view/students/reports/BanglaAttendenceSubjectWari';
import AdmissionFormPdf from '../view/general-information/user-reports/AdmissionFormPdf';

/* ---------------------------------------------------------
   🟢 ছোট ছোট পছন্দগুলোও মনে থাকবে (রিপোর্ট বদলালে বা রিফ্রেশ করলে)
--------------------------------------------------------- */
const readLocal = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const writeLocal = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

/* ---------------------------------------------------------
   প্রতিটি রিপোর্টের নিজস্ব সেটিং
   - requiredFilters : এগুলো না দিলে ব্যাকএন্ডে কল-ই যাবে না
   - allowEmptyRender: ডাটা না থাকলেও রিপোর্ট দেখাবে (খালি ফরম/টেমপ্লেট)
   - defaultRows     : ⚙️ সেটিং এর "প্রতি পেজে রো" এর শুরুর মান
--------------------------------------------------------- */
const REPORT_CONFIGS = {
  '1': {
    component: 'ReportBuilder',
    label: '১. কাস্টম টেমপ্লেট বিল্ডার',
    subtitle: 'নিচের বক্স থেকে সাজিয়ে প্রতি রেজিস্টার তৈরি করুন',
    // 🔴 জামাতও বাধ্যতামূলক — না হলে শুধু শিক্ষাবর্ষ দিলেই পুরো বছরের সব
    //    শিক্ষার্থী একসাথে লোড হয়ে যেত, লোডিং টাইম অনেক বেড়ে যেত।
    requiredFilters: ['SessionID', 'SubClassID'],
    allowEmptyRender: true,
    defaultRows: 21,
  },
  '2': {
    component: 'BanglaAttendence',
    label: '২. হাজিরা খাতা ৩০ দিনের',
    subtitle: 'বাংলা/আরবি হাজিরা খাতা — শিক্ষাবর্ষ ও জামাত অনুযায়ী',
    requiredFilters: ['SessionID', 'SubClassID'],
    defaultRows: 38,
    languageSwitch: true,
  },
  '3': {
    component: 'BanglaAttendenceSubjectWari',
    label: '৩. বাংলা হাজিরা খাতা ৩০ দিনের (বিষয়ওয়ারী)',
    subtitle: 'বিষয়ের সংখ্যা অনুযায়ী প্রতি ছাত্রের একাধিক লাইন',
    requiredFilters: ['SessionID', 'SubClassID'],
    defaultRows: 10,
    showBookLine: true,
  },
  '4': {
    component: 'AdmissionFormPdf',
    label: '৪. ছাত্র ভর্তি ফরম',
    subtitle: 'ডেটা সহ বা খালি ভর্তি ফরম প্রিন্ট করুন',
    requiredFilters: ['SessionID', 'SubClassID'],
    allowEmptyRender: true,
    defaultRows: 1,
    showAdmissionStatus: true,
    printModeSwitch: true,
  },
  '15': {
    component: 'ComingSoon',
    label: '৫. অন্যান্য রিপোর্ট শিগ্রই আসবে',
    subtitle: 'নতুন রিপোর্ট যুক্ত হচ্ছে',
    requiredFilters: [],
    allowEmptyRender: true,
    defaultRows: 20,
  },
};

const REPORT_OPTIONS = Object.entries(REPORT_CONFIGS).map(([id, cfg]) => ({
  id,
  label: cfg.label,
}));

export default function StudentsReportList() {
  // 🟢 শেষবার যে রিপোর্টে ছিল, সেটাই খুলবে
  const [selectedReportID, setSelectedReportID] = useState(() =>
    readLocal('studentReport_selectedReport', '1')
  );
  const [printMode, setPrintMode] = useState(() =>
    readLocal('studentReport_printMode', 'data')
  );
  useEffect(() => {
    writeLocal('studentReport_selectedReport', selectedReportID);
  }, [selectedReportID]);
  useEffect(() => {
    writeLocal('studentReport_printMode', printMode);
  }, [printMode]);
  const cfg = REPORT_CONFIGS[selectedReportID] || REPORT_CONFIGS['1'];

  /* -------- গ্রিডের প্রথম ঘর: রিপোর্ট নির্বাচন -------- */
  const reportSelector = (
    <FilterSelect
      label="রিপোর্টসমূহ"
      required
      value={selectedReportID}
      onChange={(e) => setSelectedReportID(e.target.value)}
    >
      {REPORT_OPTIONS.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </FilterSelect>
  );

  /* -------- রিপোর্ট-ভিত্তিক বাড়তি অপশন (দ্বিতীয় সারিতে) --------
     🔹 কিছুই না থাকলে null — তাহলে খালি ভায়োলেট সারিটা রেন্ডারই হবে না */
  const hasExtraFilters = Boolean(cfg.printModeSwitch);
  const extraFilters = !hasExtraFilters ? null : (
    <>
      {cfg.printModeSwitch && (
        <FilterSelect
          label="প্রিন্ট মোড"
          value={printMode}
          onChange={(e) => setPrintMode(e.target.value)}
        >
          <option value="data">ডেটা সহ ফরম</option>
          <option value="blank">খালি ফরম (হাতে লিখার জন্য)</option>
        </FilterSelect>
      )}
    </>
  );

  /* -------- রিপোর্ট রেন্ডার -------- */
  const renderReport = (ctx) => {
    const { filters, setFilters, filteredData, dataLoading, rowsPerPage, settings, sessions, subClasses } = ctx;

    // ↕️ সাজানো — কন্ট্রোল হাজিরা খাতার প্যানেলে, কাজ হয় গ্লোবাল ফিল্টারে
    const handleSort = (key, dir) =>
      setFilters((p) => ({ ...p, sortBy: key, sortDir: dir }));

    switch (cfg.component) {
      case 'ReportBuilder':
        return (
          <ReportBuilder
            filters={filters}
            filteredData={filteredData}
            dataLoading={dataLoading}
            sessions={sessions}
            subClasses={subClasses}
            settings={settings}
            portraitRowsPerPage={rowsPerPage.portrait}
            landscapeRowsPerPage={rowsPerPage.landscape}
          />
        );

      case 'BanglaAttendence':
        // 🌐 ভাষা এখন হেডারের গ্লোবাল ফিল্টার থেকে আসে
        return filters.language !== 'arabic' ? (
          <BanglaAttendence
            reportData={filteredData}
            SubClassID={filters.SubClassID}
            SessionID={filters.SessionID}
            isLoading={dataLoading}
            rowsPerPage={rowsPerPage}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
            onSortChange={handleSort}
          />
        ) : (
          <ArabicAttendence
            reportData={filteredData}
            SubClassID={filters.SubClassID}
            SessionID={filters.SessionID}
            isLoading={dataLoading}
            rowsPerPage={rowsPerPage}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
            onSortChange={handleSort}
          />
        );

      case 'BanglaAttendenceSubjectWari':
        return (
          <BanglaAttendenceSubjectWari
            reportData={filteredData}
            SubClassID={filters.SubClassID}
            BookLine={filters.BookLine}
            rowsPerPage={rowsPerPage}
          />
        );

      case 'AdmissionFormPdf': {
        // খালি ফরম মোড → একটি ফাঁকা ফরম
        if (printMode === 'blank' || !filteredData || filteredData.length === 0) {
          return (
            <div className="admission-form-wrap">
              <AdmissionFormPdf
                SubClassID={filters.SubClassID}
                SessionID={filters.SessionID}
                admissionStatus={printMode === 'blank' ? '' : filters.IsActive}
              />
            </div>
          );
        }
        // ডেটা মোড → প্রতিটি ছাত্রের জন্য আলাদা ফরম
        return (
          <>
            {filteredData.map((student, i) => (
              <div key={student.StudentCode || i} className="admission-form-wrap">
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

      case 'ComingSoon':
        return (
          <div className="text-center p-10 text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl">
            বাকি রিপোর্ট শিগ্রই আসবে...
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-50 p-3 md:p-4 rounded-xl font-SolaimanLipi print:p-0 print:bg-transparent">
      {/* 🟢 এখানে key দেওয়া হয়নি — রিপোর্ট বদলালেও কম্পোনেন্ট remount হবে না,
          ফলে ফিল্টার যেমন ছিল তেমনই থাকবে। */}
      <FilterableReportView
        title={cfg.label.replace(/^[০-৯0-9]+\.\s*/, '')}
        subtitle={cfg.subtitle}
        settingsKey={`student_report_${selectedReportID}`}
        settingsDefaults={{ RowsPerPage: cfg.defaultRows }}
        requiredFilters={cfg.requiredFilters}
        allowEmptyRender={cfg.allowEmptyRender}
        showBookLine={cfg.showBookLine}
        showAdmissionStatus={cfg.showAdmissionStatus}
        leadingField={reportSelector}
        extraFilters={extraFilters}
      >
        {(ctx) => renderReport(ctx)}
      </FilterableReportView>
    </div>
  );
}
