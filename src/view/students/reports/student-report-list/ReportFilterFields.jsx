// view/students/reports/student-report-list/ReportFilterFields.jsx
//
// 🔵 ফিল্টারগুলো উপরের বারে (হরাইজন্টাল)। নিচের ফুটার সারি (নোট/রিসেট) বাদ —
//    "মোট পাওয়া গেছে" এখন গ্রিডের ভেতরেই উপরে বসে, আর রিসেট বাটন হেডারে।

import {
  GENDER_OPTIONS,
  ADMISSION_TYPE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "./reportFilterConstants";

// 🟢 কয়টি বিষয়ের খাতা — শুধু BanglaAttendenceSubjectWari (showBookLine)
const BOOK_OF_SUBJECT_OPTIONS = [
  { value: "3", label: "৩ বিষয়ের খাতা" },
  { value: "4", label: "৪ বিষয়ের খাতা" },
  { value: "5", label: "৫ বিষয়ের খাতা" },
  { value: "6", label: "৬ বিষয়ের খাতা" },
  { value: "7", label: "৭ বিষয়ের খাতা" },
  { value: "8", label: "৮ বিষয়ের খাতা" },
  { value: "9", label: "৯ বিষয়ের খাতা" },
  { value: "10", label: "১০ বিষয়ের খাতা" },
];

// 🟢 ভর্তি ফরমের অবস্থা — শুধু AdmissionFormPdf (showAdmissionStatus)
export const ADMISSION_STATUS_OPTIONS = [
  { value: "", label: "খালি ফরম (তথ্য ছাড়া)" },
  { value: "1", label: "ভর্তির আগে (বিগত তথ্য)" },
  { value: "2", label: "ভর্তির পরে (বিগত + বর্তমান)" },
];

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

/* ---------------------------------------------------------
   শেয়ার্ড ফিল্ড — বাইরের কম্পোনেন্টও একই লুক পাবে
--------------------------------------------------------- */
export function FilterSelect({ label, required, value, onChange, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-semibold text-slate-600 mb-1 truncate">
        {label} {required && <span className="text-red-500">*</span>} :
      </label>
      <select
        value={value ?? ""}
        onChange={onChange}
        className="w-full border border-slate-300 rounded-lg px-2.5 py-2 text-[13px] bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors"
      >
        {children}
      </select>
    </div>
  );
}

/* ---------------------------------------------------------
   🟢 ফলাফল — গ্রিডের ভেতরেই, ফিল্টারগুলোর পাশে
--------------------------------------------------------- */
function ResultBox({ isReady, loading, resultCount, requiredFilters }) {
  let text;
  let tone;

  if (!isReady) {
    text = `${requiredFilters.includes("SubClassID") ? "শিক্ষাবর্ষ ও জামাত" : "শিক্ষাবর্ষ"} নির্বাচন করুন`;
    tone = "border-amber-300 bg-amber-50 text-amber-700";
  } else if (loading) {
    text = "লোড হচ্ছে...";
    tone = "border-indigo-300 bg-indigo-50 text-indigo-700";
  } else {
    text = `মোট পাওয়া গেছে: ${bn(resultCount)} জন শিক্ষার্থী`;
    tone = "border-emerald-300 bg-emerald-50 text-emerald-700";
  }

  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate-600 mb-1 truncate">
        ফলাফল :
      </label>
      <div
        className={`w-full border rounded-lg px-2.5 py-2 text-[12.5px] font-bold truncate ${tone}`}
        title={text}
      >
        {text}
      </div>
    </div>
  );
}

export default function ReportFilterFields({
  filters,
  setFilters,
  sessions = [],
  subClasses = [],
  districts = [],
  thanas = [],
  residentialData = [],
  resultCount = 0,
  loading = false,
  isReady = true,
  requiredFilters = [],
  showBookLine = false,
  showAdmissionStatus = false,
  leadingField = null, // রিপোর্ট সিলেক্ট বক্স — গ্রিডের প্রথম ঘরে বসবে
  extraFilters = null, // রিপোর্ট-ভিত্তিক বাড়তি অপশন (ভাষা, প্রিন্ট মোড ইত্যাদি)
}) {
  const req = (key) => requiredFilters.includes(key);
  const set = (key) => (e) => setFilters((p) => ({ ...p, [key]: e.target.value }));

  // 🔹 বাড়তি অপশন না থাকলে দ্বিতীয় সারিটা একদমই রেন্ডার হবে না
  const hasSecondRow = showBookLine || showAdmissionStatus || Boolean(extraFilters);

  return (
    <div className="space-y-3">
      {/* ================= মূল ফিল্টার সারি ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {leadingField}

        <FilterSelect
          label="শিক্ষাবর্ষ"
          required={req("SessionID")}
          value={filters.SessionID}
          onChange={set("SessionID")}
        >
          <option value="">নির্বাচন করুন</option>
          {sessions.map((s) => (
            <option key={s.SessionID} value={s.SessionID}>
              {s.SessionName}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="সাব ক্লাস / জামাত"
          required={req("SubClassID")}
          value={filters.SubClassID}
          onChange={set("SubClassID")}
        >
          <option value="">{req("SubClassID") ? "নির্বাচন করুন" : "সকল জামাত"}</option>
          {subClasses.map((sc) => (
            <option key={sc.SubClassID} value={sc.SubClassID}>
              {sc.SubClass}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="লিঙ্গ" value={filters.gender} onChange={set("gender")}>
          {GENDER_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="নতুন / পুরাতন"
          value={filters.admissionType}
          onChange={set("admissionType")}
        >
          {ADMISSION_TYPE_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="অবস্থান"
          value={filters.ResidentialStatusId}
          onChange={set("ResidentialStatusId")}
        >
          <option value="">সকল</option>
          {residentialData.map((r) => (
            <option key={r.RDID} value={r.RDID}>
              {r.ResidentialName}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="স্ট্যাটাস" value={filters.is_active} onChange={set("is_active")}>
          {USER_STATUS_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect label="জেলা" value={filters.DistrictID} onChange={set("DistrictID")}>
          <option value="">সকল</option>
          {districts.map((d) => (
            <option key={d.DistrictID} value={d.DistrictID}>
              {d.DistrictName}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="থানা"
          value={filters.permanentPoliceStationID}
          onChange={set("permanentPoliceStationID")}
        >
          <option value="">সকল</option>
          {thanas.map((th) => (
            <option key={th.PoliceStationID} value={th.PoliceStationID}>
              {th.PoliceStationName}
            </option>
          ))}
        </FilterSelect>

        {/* 🟢 ফলাফল — থানার ঠিক পরের ঘরে */}
        <ResultBox
          isReady={isReady}
          loading={loading}
          resultCount={resultCount}
          requiredFilters={requiredFilters}
        />
      </div>

      {/* ============ রিপোর্ট-ভিত্তিক দ্বিতীয় সারি (দরকার হলেই) ============ */}
      {hasSecondRow && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 items-end">
            {showBookLine && (
              <FilterSelect
                label="কয়টি বিষয়ের খাতা"
                value={filters.BookLine || "3"}
                onChange={set("BookLine")}
              >
                {BOOK_OF_SUBJECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FilterSelect>
            )}

            {showAdmissionStatus && (
              <FilterSelect
                label="ভর্তির অবস্থা"
                value={filters.IsActive || ""}
                onChange={set("IsActive")}
              >
                {ADMISSION_STATUS_OPTIONS.map((o) => (
                  <option key={o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </FilterSelect>
            )}

            {extraFilters}
          </div>
        </div>
      )}
    </div>
  );
}
