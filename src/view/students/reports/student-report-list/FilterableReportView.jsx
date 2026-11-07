// view/students/reports/student-report-list/FilterableReportView.jsx
//
// 🔵 রিপোর্ট শেল:
//   ১) উপরে গ্রেডিয়েন্ট হেডার (টাইটেল + রিসেট + প্রিন্ট + ⚙️ সেটিং)
//   ২) তার নিচে সব ফিল্টার এক গ্রিডে — "মোট পাওয়া গেছে" গ্রিডের ভেতরেই
//   ৩) নিচে রিপোর্ট প্রিভিউ — ফিল্টার না দিলে ডাটা লোডই হবে না

import { useMemo, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import useReportFilters from "../../../../hooks/ReportPageHooks/useReportFilters";
import useReportSettings from "../../../../hooks/ReportPageHooks/useReportSettings";
import ReportFilterFields from "./ReportFilterFields";
import ReportSettingsModal from "./ReportSettingsModal";
import { GearIcon, PrinterIcon, DocIcon } from "./ReportIcons";
import ReportThemeRoot from "./ReportThemeRoot";
import { toImageSrc } from "./reportSettingsConstants";

function StateCard({ tone = "slate", title, hint }) {
  const toneMap = {
    slate: "text-slate-700",
    indigo: "text-indigo-700",
    amber: "text-amber-700",
  };
  return (
    <div className="border border-dashed border-slate-300 bg-white rounded-xl py-16 flex flex-col items-center justify-center gap-2 text-center">
      <span className={`text-[17px] font-bold ${toneMap[tone] || toneMap.slate}`}>{title}</span>
      {hint && <span className="text-[13px] text-slate-500">{hint}</span>}
    </div>
  );
}

export default function FilterableReportView({
  title = "ছাত্র রিপোর্ট",
  subtitle = "শিক্ষাবর্ষ ও জামাত অনুযায়ী রিপোর্ট তৈরি করুন",
  settingsKey = "student_report",
  settingsDefaults = {},
  requiredFilters = ["SessionID", "SubClassID"],
  showBookLine = false,
  showAdmissionStatus = false,
  allowEmptyRender = false, // true হলে ডাটা না থাকলেও children রেন্ডার হবে (টেমপ্লেট বিল্ডার)
  leadingField = null,
  extraFilters = null,
  children,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    filters,
    setFilters,
    missingFilters,
    isReady,
    sessions,
    subClasses,
    districts,
    thanas,
    residentialData,
    filteredData,
    dataLoading,
  } = useReportFilters({ requiredFilters });

  const { settings, updateSetting, save, saving, resetSettings } = useReportSettings(
    settingsKey,
    settingsDefaults
  );

  // প্রতিষ্ঠানের তথ্য — জলছাপ ও প্রিভিউর জন্য
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const logoSrc = useMemo(() => toImageSrc(institutionInfo?.Logo), [institutionInfo]);

  const rowsPerPage = useMemo(
    () => ({ portrait: settings.RowsPerPage, landscape: settings.RowsPerPage }),
    [settings.RowsPerPage]
  );

  const hasData = filteredData.length > 0;
  const showBody = allowEmptyRender || (isReady && hasData);

  return (
    <div className="w-full">
      {/* ================= হেডার + ফিল্টার কার্ড ================= */}
      <div className="print:hidden rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white mb-5">
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{ background: "linear-gradient(90deg,#4338CA 0%,#5B21B6 55%,#7C3AED 100%)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <DocIcon size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-[17px] leading-tight truncate">{title}</h3>
              <p className="text-white/80 text-[12px] truncate">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 🌐 গ্লোবাল ভাষা — সব রিপোর্টে একই, localStorage এ সেভ থাকে */}
            <select
              value={filters.language}
              onChange={(e) => setFilters((p) => ({ ...p, language: e.target.value }))}
              title="ভাষা"
              aria-label="ভাষা"
              className="bg-white/95 text-[#4338CA] rounded-lg px-2.5 py-2 text-[13px] font-bold border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
            >
              <option value="bangla">বাংলা</option>
              <option value="arabic">العربية</option>
            </select>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-white text-[#4338CA] px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-1.5 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <PrinterIcon size={16} />
              প্রিন্ট
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="রিপোর্ট সেটিং"
              aria-label="রিপোর্ট সেটিং"
              className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <GearIcon size={20} />
            </button>
          </div>
        </div>

        <div className="p-4">
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
            isReady={isReady}
            requiredFilters={requiredFilters}
            showBookLine={showBookLine}
            showAdmissionStatus={showAdmissionStatus}
            leadingField={leadingField}
            extraFilters={extraFilters}
          />
        </div>
      </div>

      {/* ================= রিপোর্ট বডি ================= */}
      {!isReady && !allowEmptyRender ? (
        <StateCard
          tone="amber"
          title="ফিল্টার নির্বাচন করুন"
          hint={`ডাটা লোড করতে ${missingFilters
            .map((k) => (k === "SessionID" ? "শিক্ষাবর্ষ" : k === "SubClassID" ? "জামাত" : k))
            .join(" ও ")} বেছে নিন`}
        />
      ) : dataLoading ? (
        <StateCard tone="indigo" title="ডাটা লোড হচ্ছে..." hint="একটু সময় লাগতে পারে" />
      ) : showBody ? (
        <ReportThemeRoot settings={settings} watermarkSrc={logoSrc}>
          {children({
            filters,
            filteredData,
            dataLoading,
            rowsPerPage,
            settings,
            sessions,
            subClasses,
          })}
        </ReportThemeRoot>
      ) : (
        <StateCard
          title="এই শর্তে কোনো শিক্ষার্থী পাওয়া যায়নি"
          hint="শিক্ষাবর্ষ, শ্রেণি বা অবস্থান বদলে দেখুন"
        />
      )}

      {/* ================= ⚙️ সেটিং মডাল ================= */}
      <ReportSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        updateSetting={updateSetting}
        onSave={save}
        onReset={resetSettings}
        saving={saving}
        logoSrc={logoSrc}
        reportLabel={title}
        institutionName={institutionInfo?.InstitutionName}
        address={institutionInfo?.Address}
      />
    </div>
  );
}
