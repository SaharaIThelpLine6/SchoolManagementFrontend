// view/students/reports/student-report-list/ReportSortControl.jsx
//
// ↕️ সাজানো — ভর্তি নং / আইডি নং, উপর-নিচ।
// আসল সাজানোর কাজটা useReportFilters এ হয় (filters.sortBy / filters.sortDir),
// তাই এই কন্ট্রোল যেকোনো রিপোর্টের ভেতরে বসালেই কাজ করবে।

const SORT_OPTIONS = [
  { key: "AdmissionSerial", label: "ভর্তি নং" },
  { key: "StudentCode", label: "আইডি নং" },
];

export default function ReportSortControl({
  sortBy = "AdmissionSerial",
  sortDir = "asc",
  onChange,
  label = "সাজানো",
}) {
  if (typeof onChange !== "function") return null;

  const dir = sortDir === "desc" ? "desc" : "asc";

  return (
    <div>
      {label && (
        <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {SORT_OPTIONS.map((o) => {
          const active = sortBy === o.key;
          return (
            <div
              key={o.key}
              className={`flex items-center rounded-lg border overflow-hidden transition-colors ${
                active ? "border-violet-400" : "border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => onChange(o.key, dir)}
                className={`px-3 py-1.5 text-[12.5px] font-bold transition-colors ${
                  active
                    ? "bg-violet-100 text-violet-700"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {o.label}
              </button>

              <button
                type="button"
                title="ছোট থেকে বড়"
                aria-label={`${o.label} — ছোট থেকে বড়`}
                onClick={() => onChange(o.key, "asc")}
                className={`px-2 py-1.5 text-[13px] leading-none border-l transition-colors ${
                  active && dir === "asc"
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-slate-400 border-slate-200 hover:text-slate-700"
                }`}
              >
                ↑
              </button>

              <button
                type="button"
                title="বড় থেকে ছোট"
                aria-label={`${o.label} — বড় থেকে ছোট`}
                onClick={() => onChange(o.key, "desc")}
                className={`px-2 py-1.5 text-[13px] leading-none border-l transition-colors ${
                  active && dir === "desc"
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-white text-slate-400 border-slate-200 hover:text-slate-700"
                }`}
              >
                ↓
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
