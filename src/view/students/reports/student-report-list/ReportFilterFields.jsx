// view/students/reports/student-report-list/ReportFilterFields.jsx
//
// শুধু ফিল্টার ফর্মটা রেন্ডার করে — ডাটা আনা বা স্টেট রাখার কাজ করে না
// (সেটা useReportFilters হুক করে)। তাই ReportBuilder এবং
// FilterableReportView (BanglaAttendence-এর মতো অন্য রিপোর্টের জন্য)
// দুই জায়গাতেই এক কপি কোড দিয়ে reuse করা যায়।
import SvgIcon from "../../../../components/icons/SvgIcon";
import { GENDER_OPTIONS, ADMISSION_TYPE_OPTIONS, USER_STATUS_OPTIONS } from "./reportFilterConstants";

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={`flex items-center gap-2 text-sm py-1 ${disabled ? "text-slate-400 cursor-not-allowed opacity-60" : "text-slate-700 cursor-pointer"}`}>
      <span
        onClick={() => !disabled && onChange(!checked)}
        className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
          checked ? "bg-[#1B3A57] border-[#1B3A57]" : "bg-white border-slate-300"
        }`}
      >
        {checked && (
          <span className="text-white">
            <SvgIcon name="FiCheck" size={11} />
          </span>
        )}
      </span>
      <span>{label}</span>
    </label>
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
  onPrint,
  onReset,
  note,
}) {
  const handlePrint = onPrint || (() => window.print());

  return (
    <div className="space-y-4">
      {note && <p className="text-xs text-slate-500 leading-relaxed">{note}</p>}

      <div className="flex gap-2 mb-2 border-b border-slate-200 pb-4">
        <button
          onClick={handlePrint}
          className="flex-1 bg-[#1B3A57] text-white py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1B3A57]/90 transition-colors"
        >
          <SvgIcon name="FiPrinter" size={16} /> প্রিন্ট করুন
        </button>
        <button
          onClick={onReset}
          className="px-3 bg-slate-200 text-slate-700 py-2 rounded text-sm font-semibold hover:bg-slate-300 transition-colors flex items-center gap-1.5"
          title="রিসেট ফিল্টার"
        >
          <SvgIcon name="FiRefreshCw" size={16} />
          রিসেট ফিল্টার
        </button>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">শিক্ষাবর্ষ</label>
        <select
          value={filters.SessionID}
          onChange={(e) => setFilters((p) => ({ ...p, SessionID: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          <option value="">উভয়</option>
          {sessions.map((s) => (
            <option key={s.SessionID} value={s.SessionID}>{s.SessionName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">সাব ক্লাস / জামাত</label>
        <select
          value={filters.SubClassID}
          onChange={(e) => setFilters((p) => ({ ...p, SubClassID: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          <option value="">উভয়</option>
          {subClasses.map((sc) => (
            <option key={sc.SubClassID} value={sc.SubClassID}>
              {/* {sc.Class?.ClassName ? `${sc.Class.ClassName} - ${sc.SubClass}` : sc.SubClass} */}
              {sc.SubClass}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">লিঙ্গ</label>
        <select
          value={filters.gender}
          onChange={(e) => setFilters((p) => ({ ...p, gender: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">নতুন/পুরাতন</label>
        <select
          value={filters.admissionType}
          onChange={(e) => setFilters((p) => ({ ...p, admissionType: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          {ADMISSION_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">Residential :</label>
        <select
          value={filters.ResidentialStatusId}
          onChange={(e) => setFilters((p) => ({ ...p, ResidentialStatusId: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          <option value="">Select</option>
          {residentialData.map((r) => (
            <option key={r.RDID} value={r.RDID}>{r.ResidentialName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">User Status</label>
        <div className="flex items-center gap-4">
          {USER_STATUS_OPTIONS.map((o) => (
            <Checkbox
              key={o.value}
              checked={filters.is_active === o.value}
              onChange={() => setFilters((p) => ({ ...p, is_active: o.value }))}
              label={o.label}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">জেলা</label>
        <select
          value={filters.DistrictID}
          onChange={(e) => setFilters((p) => ({ ...p, DistrictID: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          <option value="">সকল</option>
          {districts.map((d) => (
            <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 mb-1 block">থানা</label>
        <select
          value={filters.permanentPoliceStationID}
          onChange={(e) => setFilters((p) => ({ ...p, permanentPoliceStationID: e.target.value }))}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#1B3A57]"
        >
          <option value="">সকল</option>
          {thanas.map((th) => (
            <option key={th.PoliceStationID} value={th.PoliceStationID}>{th.PoliceStationName}</option>
          ))}
        </select>
      </div>

      <div className="text-xs text-slate-500 pt-1 font-semibold">
        {loading ? "লোড হচ্ছে..." : `মোট পাওয়া গেছে: ${bn(resultCount)} জন শিক্ষার্থী`}
      </div>
    </div>
  );
}