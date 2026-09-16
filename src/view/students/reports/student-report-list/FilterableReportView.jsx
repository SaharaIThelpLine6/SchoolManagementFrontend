import { useState, useEffect } from "react";
import useReportFilters from "../../../../hooks/ReportPageHooks/useReportFilters";
import ReportFilterFields from "./ReportFilterFields";

// বাংলা সংখ্যায় রূপান্তর
const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

const STORAGE_KEY = "studentReport_rowsPerPage";

export default function FilterableReportView({
  title,
  note,
  defaultRowsPerPage = 20,
  showBookLine = false,
  showAdmissionStatus = false, // 👈 নতুন ফিল্টার অপশন প্রপস হিসেবে রিসিভ করা হলো
  children,
}) {
  const {
    filters,
    setFilters,
    resetFilters,
    sessions,
    subClasses,
    districts,
    thanas,
    residentialData,
    filteredData,
    dataLoading,
  } = useReportFilters();

  // 👇 localStorage থেকে আগের পছন্দ লোড করা, না থাকলে default ব্যবহার
  const [userRowsPerPage, setUserRowsPerPage] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Number(saved);
    }
    return defaultRowsPerPage;
  });

  // 👇 ইউজার পরিবর্তন করলে localStorage-এ সেভ
  const handleRowsPerPageChange = (value) => {
    const num = Number(value);
    setUserRowsPerPage(num);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(num));
    }
  };

  // rowsPerPage এখন দুই orientation-এর জন্যই একই হবে, কারণ ইউজার নিজে ঠিক করেছে
  const rowsPerPage = {
    portrait: userRowsPerPage,
    landscape: userRowsPerPage,
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-[320px] bg-white border border-slate-200 rounded-xl p-4 shrink-0 print:hidden">
        {title && (
          <h3 className="text-base font-bold text-slate-800 mb-3">{title}</h3>
        )}

        <ReportFilterFields
          filters={filters}
          setFilters={setFilters}
          sessions={sessions}
          subClasses={subClasses}
          districts={districts}
          thanas={thanas}
          residentialData={residentialData}
          resultCount={filteredData.length}
          loading={dataLoading}
          onReset={resetFilters}
          note={note}
          showBookLine={showBookLine}
          showAdmissionStatus={showAdmissionStatus} // 👈 ReportFilterFields এ পাস করা হলো
        />

      </div>

      <div className="flex-1 print:w-full">
        {children({ filters, filteredData, dataLoading, rowsPerPage })}
      </div>
    </div>
  );
}
