import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import SvgIcon from "../components/icons/SvgIcon";
import {
  useGetExamStudentListFiltersQuery,
  useGetExamStudentListQuery,
  useAddExamStudentsMutation,
  useRemoveExamStudentsMutation,
} from "../features/exam/examQuerySlice";

/* ---------------------------------------------------------
   Static definitions
--------------------------------------------------------- */

const SUBJECT_COUNT = 14;

const PERM_INSERT_MSG = "সেইভ করতে এডমিনের সাথে যোগাযোগ করুন";
const PERM_DELETE_MSG = "ফলাফলের-তালিকা হতে বাতিল/ডিলিট করতে এডমিনের সাথে যোগাযোগ করুন";

const FEE_NOT_SET_MSG = "এই শিক্ষাবর্ষ, পরীক্ষা ও সাব ক্লাসের ফি নির্ধারণ করা নেই — আগে ফি নির্ধারণ করুন";
const FEE_ZERO_MSG = "নির্ধারিত ফি ০ — আগে ফি নির্ধারণ করুন";

const bn = (num) => {
  if (num === "" || num === null || num === undefined) return "";
  const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (x) => d[x]);
};

/* ---------------------------------------------------------
   Pure helpers
--------------------------------------------------------- */

// API রেসপন্স → প্যানেলের রো।
// বাম পাশে id = Student_Admission.AdmissionID, ডান পাশে id = Student_Result.ID
// assigned  = নির্ধারিত  (বাম: Exam_FeeSetting-এর ফি | ডান: Exam_FeeAccept.Fee)
// deduction = কর্তন      (বাম: হাতে লেখা, শুরুতে ০ | ডান: Exam_FeeAccept.Less)
// serial    = Student_Admission.AdmissionSerial (দুই পাশেই দেখানো হয়)
// ⭐ inactive = ইউজার ইনঅ্যাক্টিভ (UserAction ≠ 1) — শুধু ডান পাশে আসতে পারে,
//    বাম পাশে বেকএন্ডই ইনঅ্যাক্টিভদের বাদ দিয়ে দেয়
const toRow = (id, user, { assigned = 0, deduction = 0, serial = "", inactive = false } = {}) => ({
  id,
  code: user?.UserCode ?? "",
  name: user?.UserName ? (user.UserName) : "",
  serial: serial === null || serial === undefined ? "" : serial,
  assigned: Number(assigned) || 0,
  deduction: Number(deduction) || 0,
  inactive: Boolean(inactive),
});

function computeRows(rows) {
  let assigned = 0, deduction = 0, net = 0;
  const computed = rows.map((s) => {
    const rowAssigned = Number(s.assigned) || 0;
    const rowDeduction = Math.min(Math.max(Number(s.deduction) || 0, 0), rowAssigned);
    const rowNet = Math.max(rowAssigned - rowDeduction, 0);
    assigned += rowAssigned;
    deduction += rowDeduction;
    net += rowNet;
    return { ...s, assigned: rowAssigned, deduction: rowDeduction, net: rowNet };
  });
  return { computed, totals: { assigned, deduction, net } };
}

function matchesFilter(s, filter) {
  if (!filter.trim()) return true;
  const q = filter.trim().toLowerCase();
  return (
    (s.name || "").toLowerCase().includes(q) ||
    String(s.code ?? "").toLowerCase().includes(q) ||
    String(s.id).includes(q)
  );
}

/* ---------------------------------------------------------
   Small UI bits
--------------------------------------------------------- */

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <span
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-[#6D3BEF] border-[#6D3BEF]" : "bg-white border-slate-300 hover:border-[#6D3BEF]/50"
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3 block"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label && <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{label}</span>}
    </label>
  );
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5">
        <span className="text-[#8B2635]">
          <SvgIcon name={icon} size={16} />
        </span>
        {label}
      </label>
      {children}
    </div>
  );
}

/* ⭐ রিডিজাইন — প্যানেল হেডারের টোটাল চিপ (হালকা বেগুনি পিল) */
function StatChip({ label, value, tone = "violet" }) {
  const tones = {
    violet: "bg-violet-50 border-violet-100 text-violet-700",
    rose: "bg-rose-50 border-rose-100 text-rose-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };
  return (
    <div className={`h-[34px] flex items-center gap-1.5 rounded-lg border px-3 whitespace-nowrap ${tones[tone]}`}>
      <span className="text-xs font-medium opacity-80">{label}</span>
      <span className="text-sm font-bold">৳{bn(value)}</span>
    </div>
  );
}

/* ⭐ রিডিজাইন — হেডারের ভেতরের স্বচ্ছ সাদা চিপ */
function HeaderChip({ label, value }) {
  return (
    <div className="h-[38px] flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 backdrop-blur px-4 whitespace-nowrap">
      <span className="text-xs font-medium text-white/80">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
}

const selectClass = "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#6D3BEF]/30 focus:border-[#6D3BEF]";
const inputClass = "border border-slate-300 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#6D3BEF]/30 focus:border-[#6D3BEF]";

/* ---------------------------------------------------------
   List panel — বামে "যাদের ফি নিবেন", ডানে "ফি গ্রহণ করা হয়েছে"
   ⚠️ permission নিয়ে এই কম্পোনেন্ট কিছুই জানে না — ড্র্যাগ সবসময় চালু।
   ⭐ রো-তে inactive = true হলে পুরো রো লাল হয়ে থাকবে (ইনঅ্যাক্টিভ শিক্ষার্থী)
--------------------------------------------------------- */

function ListPanel({
  title, titleColor, rows, totalCount, checkedSet, onToggleAll, onToggleOne,
  filter, onFilterChange, totals, onDeductionChange, filterLabel, filterLabelColor,
  side, onRowDragStart, onRowDragEnd, onPanelDragOver, onPanelDragLeave, onPanelDrop,
  isDragTarget, draggingIds, emptyText, busy, editable, showStatChips, accent = "violet",
}) {
  const allChecked = rows.length > 0 && rows.every((r) => checkedSet.has(r.id));

  // ⭐ কতজন ইনঅ্যাক্টিভ — হেডারে জানানোর জন্য
  const inactiveCount = rows.filter((r) => r.inactive).length;

  // ⭐ রিডিজাইন — বাম প্যানেল বেগুনি, ডান প্যানেল সায়ান অ্যাকসেন্ট
  const accents = {
    violet: { bar: "bg-[#6D3BEF]", badge: "bg-violet-50 text-violet-700 border-violet-100" },
    cyan: { bar: "bg-[#22B8F0]", badge: "bg-sky-50 text-sky-700 border-sky-100" },
  };
  const ac = accents[accent] || accents.violet;

  return (
    <div
      onDragOver={onPanelDragOver}
      onDragLeave={onPanelDragLeave}
      onDrop={onPanelDrop}
      className={`bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden w-full transition-all ${
        isDragTarget ? "border-[#6D3BEF] ring-4 ring-[#6D3BEF]/15" : "border-slate-200"
      }`}
    >
      {/* ⭐ রিডিজাইন — প্যানেল হেডার */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className={`mt-0.5 w-1 h-6 rounded-full shrink-0 ${ac.bar}`} />
            <h1 className={`text-[15px] font-bold leading-snug ${titleColor}`}>{title}</h1>
          </div>
          <span className={`h-[32px] flex items-center rounded-full border px-3.5 whitespace-nowrap shrink-0 text-xs font-bold ${ac.badge}`}>
            {bn(totalCount)} জন
          </span>
        </div>

        {/* ⭐ ইনঅ্যাক্টিভ শিক্ষার্থী থাকলে জানিয়ে দেওয়া */}
        {inactiveCount > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>লাল রো-গুলো ইনঅ্যাক্টিভ শিক্ষার্থী — {bn(inactiveCount)} জন</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {showStatChips && (
            <>
              <StatChip label="নির্ধারিত" value={totals.assigned} tone="violet" />
              <StatChip label="কর্তন" value={totals.deduction} tone="rose" />
              <StatChip label="জমা" value={totals.net} tone="emerald" />
            </>
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            {filterLabel && <span className={`text-xs font-semibold ${filterLabelColor}`}>{filterLabel}</span>}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SvgIcon name="FiSearch" size={14} />
              </span>
              <input
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="নাম / আইডি খুঁজুন"
                className="h-[34px] pl-8 pr-3 text-sm font-medium border border-slate-200 rounded-lg bg-white w-28 sm:w-44 outline-none transition focus:border-[#6D3BEF] focus:ring-2 focus:ring-[#6D3BEF]/15"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-auto max-h-80 transition-opacity ${busy ? "opacity-60" : ""}`}>
        {/* ⭐ নতুন কলাম যোগ হওয়ায় min-w 620 → 680 */}
        <table className="w-full min-w-[680px] text-sm">
          <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold text-slate-500 tracking-wide z-10 shadow-[0_1px_0_0_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-3 py-2.5 text-left w-8">
                <Checkbox checked={allChecked} onChange={onToggleAll} />
              </th>
              {/* ⭐ ক্রম (ইনডেক্স) */}
              <th className="px-3 py-2.5 text-left w-10">ক্র:</th>
              {/* ⭐ ভর্তি সিরিয়াল — এখন আইডি-এর আগে */}
              <th className="px-3 py-2.5 text-left">ভর্তি সিরিয়াল</th>
              <th className="px-3 py-2.5 text-left">আইডি</th>
              <th className="px-3 py-2.5 text-left">শিক্ষার্থীর নাম</th>
              {showStatChips && (
                <>
                  <th className="px-3 py-2.5 text-left">নির্ধারিত</th>
                  <th className="px-3 py-2.5 text-left">কর্তন</th>
                  <th className="px-3 py-2.5 text-left">জমা</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                {/* ⭐ কলাম সংখ্যা ১ বেড়েছে: showStatChips ? 7→8 : 4→5 */}
                <td colSpan={showStatChips ? 8 : 5} className="text-center text-slate-400 italic py-10 text-sm">
                  {isDragTarget ? "এখানে ছেড়ে দিন" : emptyText || "কোনো শিক্ষার্থী পাওয়া যায়নি"}
                </td>
              </tr>
            ) : (
              rows.map((s, index) => {
                const checked = checkedSet.has(s.id);
                const isDragging = draggingIds.includes(s.id);

                // ⭐ ইনঅ্যাক্টিভ হলে পুরো রো লাল — সিলেক্ট করা থাকলে একটু গাঢ়
                const rowTone = s.inactive
                  ? checked
                    ? "bg-rose-100 hover:bg-rose-100"
                    : "bg-rose-50 hover:bg-rose-100"
                  : checked
                  ? "bg-[#6D3BEF]/[0.06]"
                  : "hover:bg-slate-50";

                return (
                  <tr
                    key={s.id}
                    draggable={!busy}
                    onDragStart={onRowDragStart(side, s.id)}
                    onDragEnd={onRowDragEnd}
                    title={
                      s.inactive
                        ? "এই শিক্ষার্থী ইনঅ্যাক্টিভ"
                        : "ড্র্যাগ করে অন্য পাশে ছেড়ে দিন"
                    }
                    className={`border-b border-slate-50 last:border-0 transition-colors select-none ${
                      busy ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
                    } ${rowTone} ${isDragging ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <Checkbox checked={checked} onChange={(v) => onToggleOne(s.id, v)} />
                    </td>
                    {/* ⭐ ক্রম — সাজানো তালিকার ইনডেক্স */}
                    <td className={`px-3 py-3 ${s.inactive ? "text-rose-500" : "text-slate-400"}`}>
                      {bn(index + 1)}
                    </td>
                    {/* ⭐ ভর্তি সিরিয়াল — এখন আইডি-এর আগে */}
                    <td className={`px-3 py-3 ${s.inactive ? "text-rose-700" : "text-slate-800"}`}>
                      {bn(s.serial) || "—"}
                    </td>
                    <td className={`px-3 py-3 font-mono ${s.inactive ? "text-rose-700" : "text-slate-600"}`}>
                      {bn(s.code || s.id)}
                    </td>
                    <td
                      className={`px-3 py-3 font-medium whitespace-nowrap ${
                        s.inactive ? "text-rose-700" : "text-slate-800"
                      }`}
                    >
                      {s.name}
                      {/* ⭐ ইনঅ্যাক্টিভ ব্যাজ */}
                      {s.inactive && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-600 border border-rose-200">
                          ইনঅ্যাক্টিভ
                        </span>
                      )}
                    </td>
                    {showStatChips && (
                      <>
                        <td className={`px-3 py-3 ${s.inactive ? "text-rose-700" : "text-slate-800"}`}>
                          {bn(s.assigned)}
                        </td>
                        <td className={`px-3 py-3 ${s.inactive ? "text-rose-700" : "text-slate-800"}`}>
                          {editable ? (
                            <input
                              type="number"
                              min={0}
                              max={s.assigned}
                              value={s.deduction}
                              disabled={busy}
                              onChange={(e) => onDeductionChange(s.id, e.target.value)}
                              draggable={false}
                              onDragStart={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="w-20 h-8 px-2 text-sm border border-slate-200 rounded-lg bg-white outline-none transition focus:border-[#6D3BEF] focus:ring-2 focus:ring-[#6D3BEF]/15 disabled:bg-slate-100"
                            />
                          ) : (
                            bn(s.deduction)
                          )}
                        </td>
                        <td
                          className={`px-3 py-3 font-bold ${
                            s.inactive ? "text-rose-700" : "text-emerald-600"
                          }`}
                        >
                          {bn(s.net)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */

export default function ExamStudentList() {
  const [session, setSession] = useState(null);
  const [examId, setExamId] = useState(null);
  const [subClass, setSubClass] = useState(null);

  const [subjects, setSubjects] = useState(
    Array.from({ length: SUBJECT_COUNT }, () => ({ name: "", fee: "" }))
  );

  /* ---------------- Cascading ফিল্টার: শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস ---------------- */
  const { data: filterData } = useGetExamStudentListFiltersQuery();
  const sessionTree = useMemo(() => filterData?.sessions || [], [filterData]);

  const showStatChips = filterData?.showStatChips !== false;

  const permissions = filterData?.permissions;
  const canInsert = permissions ? Boolean(permissions.insert) : true;
  const canDelete = permissions ? Boolean(permissions.delete) : true;

  const sessionOptions = useMemo(
    () => sessionTree.map((s) => ({ value: s.SessionID, name: s.SessionName })),
    [sessionTree]
  );

  const selectedSession = useMemo(
    () => sessionTree.find((s) => String(s.SessionID) === String(session)),
    [sessionTree, session]
  );
  const examOptions = useMemo(
    () =>
      (selectedSession?.exams || []).map((e) => ({
        value: e.ExamID,
        name: e.ExamName ? (e.ExamName) : "",
      })),
    [selectedSession]
  );

  const selectedExam = useMemo(
    () => (selectedSession?.exams || []).find((e) => String(e.ExamID) === String(examId)),
    [selectedSession, examId]
  );
  const subClassOptions = useMemo(
    () =>
      (selectedExam?.subClasses || []).map((c) => ({
        value: c.SubClassID,
        name: c.SubClass ? (c.SubClass) : "",
      })),
    [selectedExam]
  );

  const handleSessionChange = (opt) => {
    if (!opt) return;
    setSession(opt.value);
    setExamId(null);
    setSubClass(null);
  };
  const handleExamChange = (opt) => {
    if (!opt) return;
    setExamId(opt.value);
    setSubClass(null);
  };
  const handleSubClassChange = (opt) => {
    if (!opt) return;
    setSubClass(opt.value);
  };

  const filterMethods = useForm({
    defaultValues: {
      Session: "",
      Exam: "",
      SubClass: "",
      Fee: 0,
      TotalSubjects: 0,
    },
  });

  const watchedFee = useWatch({ control: filterMethods.control, name: "Fee" });
  const watchedTotalSubjects = useWatch({ control: filterMethods.control, name: "TotalSubjects" });
  const fixedFee = Number(watchedFee) || 0;
  const totalSubjects = Number(watchedTotalSubjects) || 0;

  useEffect(() => {
    filterMethods.setValue("Session", session ?? "");
  }, [session, filterMethods]);

  useEffect(() => {
    filterMethods.setValue("Exam", examId ?? "");
  }, [examId, filterMethods]);

  useEffect(() => {
    filterMethods.setValue("SubClass", subClass ?? "");
  }, [subClass, filterMethods]);

  /* ---------------- পরীক্ষার্থী তালিকা API ---------------- */
  const filtersReady = Boolean(session && examId && subClass);
  const {
    currentData: listData,
    isFetching: isListFetching,
    isError: isListError,
  } = useGetExamStudentListQuery(
    { SessionID: session, ExamID: examId, SubClassID: subClass },
    { skip: !filtersReady }
  );
  const [addExamStudents, { isLoading: isAdding }] = useAddExamStudentsMutation();
  const [removeExamStudents, { isLoading: isRemoving }] = useRemoveExamStudentsMutation();

  const busy = isAdding || isRemoving || isListFetching;

  const feeSettingCount = listData?.feeSettings?.length ?? 0;
  const feeAmount = Number(listData?.fee) || 0;

  const feeRequired =
    listData?.feeRequired !== undefined ? Boolean(listData.feeRequired) : showStatChips;

  const feeNotSet = Boolean(feeRequired && filtersReady && listData && feeSettingCount === 0);
  const feeZero = Boolean(feeRequired && filtersReady && listData && feeSettingCount > 0 && feeAmount <= 0);
  const feeBlocked = feeNotSet || feeZero;
  const feeBlockedMsg = feeNotSet ? FEE_NOT_SET_MSG : feeZero ? FEE_ZERO_MSG : null;

  const [unpaid, setUnpaid] = useState([]);
  const [paid, setPaid] = useState([]);

  const [unpaidChecked, setUnpaidChecked] = useState(new Set());
  const [paidChecked, setPaidChecked] = useState(new Set());
  const [unpaidFilter, setUnpaidFilter] = useState("");
  const [paidFilter, setPaidFilter] = useState("");

  const [toast, setToast] = useState(null);
  const [apiError, setApiError] = useState(null);

  // API ডাটা → লোকাল state (প্রতিবার রিফেচের পর আসল ID + আসল টাকা + সিরিয়াল দিয়ে রিসেট)
  useEffect(() => {
    const fee = Number(listData?.fee) || 0;

    // বাম পাশ — নির্ধারিত = Exam_FeeSetting-এর ফি, কর্তন শুরুতে ০
    // ⭐ বেকএন্ডেই UserAction = 1 ফিল্টার করা, তাই এখানে সবাই একটিভ
    setUnpaid(
      (listData?.available || []).map((a) =>
        toRow(a.AdmissionID, a.User, {
          assigned: fee,
          deduction: 0,
          serial: a.AdmissionSerial,
          inactive: false,
        })
      )
    );

    // ডান পাশ — Exam_FeeAccept-এ সেভ করা টাকা
    // ⭐ ইনঅ্যাক্টিভ শিক্ষার্থীও দেখাবে — IsInactive ফ্ল্যাগ দিয়ে রো লাল হবে
    setPaid(
      (listData?.added || []).map((r) =>
        toRow(r.ID, r.User, {
          assigned: r.Fee,
          deduction: r.Less,
          serial: r.AdmissionSerial,
          inactive: r.IsInactive,
        })
      )
    );

    setUnpaidChecked(new Set());
    setPaidChecked(new Set());
    filterMethods.setValue("Fee", fee);
    filterMethods.setValue("TotalSubjects", listData?.subjectCount ?? 0);
  }, [listData, filterMethods]);

  useEffect(() => {
    setApiError(null);
  }, [session, examId, subClass]);

  /* ---------------- বিষয়ভিত্তিক ফি ---------------- */
  const updateSubject = (idx, field, value) => {
    setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  /* ---------------- কর্তন এডিট ---------------- */
  const updateDeduction = (side, id, value) => {
    const setter = side === "unpaid" ? setUnpaid : setPaid;
    setter((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        let v = parseInt(value, 10);
        if (isNaN(v) || v < 0) v = 0;
        const max = Number(s.assigned) || 0;
        if (v > max) v = max;
        return { ...s, deduction: v };
      })
    );
  };

  /* ---------------- ফিল্টার + টোটাল ---------------- */
  const unpaidRows = useMemo(() => unpaid.filter((s) => matchesFilter(s, unpaidFilter)), [unpaid, unpaidFilter]);
  const paidRows = useMemo(() => paid.filter((s) => matchesFilter(s, paidFilter)), [paid, paidFilter]);

  const { computed: unpaidComputed, totals: unpaidTotals } = useMemo(
    () => computeRows(unpaidRows),
    [unpaidRows]
  );
  const { computed: paidComputed, totals: paidTotals } = useMemo(
    () => computeRows(paidRows),
    [paidRows]
  );

  /* ---------------- সিলেকশন ---------------- */
  const toggleUnpaidAll = (checked) => {
    setUnpaidChecked((prev) => {
      const next = new Set(prev);
      unpaidRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };
  const togglePaidAll = (checked) => {
    setPaidChecked((prev) => {
      const next = new Set(prev);
      paidRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
      return next;
    });
  };
  const toggleUnpaidOne = (id, checked) => {
    setUnpaidChecked((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };
  const togglePaidOne = (id, checked) => {
    setPaidChecked((prev) => {
      const next = new Set(prev);
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  /* ---------------- এক পাশ থেকে অন্য পাশে move ---------------- */

  const moveIdsToPaid = async (ids) => {
    if (!canInsert) {
      setApiError(PERM_INSERT_MSG);
      return;
    }

    const idSet = new Set(ids);
    const moving = unpaid.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady) return;

    if (feeBlocked) {
      setApiError(feeBlockedMsg);
      return;
    }

    if (feeRequired && moving.some((s) => (Number(s.assigned) || 0) <= 0)) {
      setApiError(FEE_ZERO_MSG);
      return;
    }

    const Deductions = {};
    moving.forEach((s) => {
      Deductions[s.id] = Number(s.deduction) || 0;
    });

    setApiError(null);
    try {
      await addExamStudents({
        SessionID: session,
        ExamID: examId,
        SubClassID: subClass,
        AdmissionIDs: moving.map((s) => s.id),
        Deductions,
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.error || err?.data?.detail || "শিক্ষার্থী যোগ করা যায়নি");
      return;
    }

    setUnpaid((prev) => prev.filter((s) => !idSet.has(s.id)));
    setPaid((prev) => [...prev, ...moving]);
    setUnpaidChecked((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`${bn(moving.length)} জন শিক্ষার্থীর ফি আদায় তালিকায় যোগ হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  const moveIdsToUnpaid = async (ids) => {
    if (!canDelete) {
      setApiError(PERM_DELETE_MSG);
      return;
    }

    const idSet = new Set(ids);
    const moving = paid.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady) return;

    setApiError(null);
    try {
      await removeExamStudents({
        SessionID: session,
        ExamID: examId,
        SubClassID: subClass,
        ResultIDs: moving.map((s) => s.id),
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.error || err?.data?.detail || "শিক্ষার্থী সরানো যায়নি");
      return;
    }

    setPaid((prev) => prev.filter((s) => !idSet.has(s.id)));
    // ⭐ ইনঅ্যাক্টিভ শিক্ষার্থী বাম পাশে দেখানোর কথা নয় — রিফেচ এলে এমনিতেই বাদ যাবে,
    //    তাই optimistic update-এও শুধু একটিভদের ফেরত আনা হচ্ছে
    setUnpaid((prev) => [
      ...prev,
      ...moving
        .filter((s) => !s.inactive)
        .map((s) => ({ ...s, assigned: fixedFee, deduction: 0 })),
    ]);
    setPaidChecked((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`${bn(moving.length)} জন শিক্ষার্থীকে পুনরায় তালিকায় ফেরত পাঠানো হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  const selectedTotal = unpaidChecked.size + paidChecked.size;

  /* ---------------- Drag & Drop ---------------- */
  const [dragInfo, setDragInfo] = useState(null);
  const [dragOverSide, setDragOverSide] = useState(null);

  const handleRowDragStart = (side, id) => (e) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    const checkedSet = side === "unpaid" ? unpaidChecked : paidChecked;
    const ids = checkedSet.has(id) ? Array.from(checkedSet) : [id];
    setDragInfo({ side, ids });
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(id));
    } catch (err) {
      // কিছু ব্রাউজারে setData না দিলে drag শুরুই হয় না
    }
  };

  const handleRowDragEnd = () => {
    setDragInfo(null);
    setDragOverSide(null);
  };

  const handlePanelDragOver = (side) => (e) => {
    if (!dragInfo || dragInfo.side === side) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSide(side);
  };

  const handlePanelDragLeave = (side) => () => {
    setDragOverSide((prev) => (prev === side ? null : prev));
  };

  const handlePanelDrop = (side) => (e) => {
    e.preventDefault();
    if (dragInfo && dragInfo.side !== side) {
      if (side === "paid") moveIdsToPaid(dragInfo.ids);
      else moveIdsToUnpaid(dragInfo.ids);
    }
    setDragInfo(null);
    setDragOverSide(null);
  };

  const emptyText = !session
    ? "প্রথমে শিক্ষাবর্ষ নির্বাচন করুন"
    : !examId
    ? "এবার পরীক্ষা নির্বাচন করুন"
    : !subClass
    ? "এবার সাব ক্লাস নির্বাচন করুন"
    : isListError
    ? "ডাটা লোড করা যায়নি"
    : isListFetching && !listData
    ? "লোড হচ্ছে..."
    : "কোনো শিক্ষার্থী পাওয়া যায়নি";

  /* ⭐ রিডিজাইন — ধাপ নির্দেশক (শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস) */
  const steps = [
    { label: "শিক্ষাবর্ষ", done: Boolean(session) },
    { label: "পরীক্ষা", done: Boolean(examId) },
    { label: "সাব ক্লাস", done: Boolean(subClass) },
  ];

  return (
    <div
      className="w-full overflow-x-hidden p-4 sm:p-6"
      style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
    >
      <div className="w-full mx-auto">
        {/* ============================================================
            ⭐ রিডিজাইন — গ্রেডিয়েন্ট হেডার ব্যানার
        ============================================================ */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B2EE5] via-[#6D3BEF] to-[#22B8F0] px-5 py-4 mb-4 shadow-sm">
          {/* ডেকোরেটিভ গ্লো */}
          <span className="pointer-events-none absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10" />
          <span className="pointer-events-none absolute right-28 -bottom-20 w-40 h-40 rounded-full bg-white/10" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-11 h-11 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-white"
                >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 15h6M9 11h6" />
                </svg>
              </span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">পরীক্ষার্থী তালিকা</h1>
                <p className="text-[12px] sm:text-[13px] text-white/80 leading-snug">
                  শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস নির্বাচন করুন, এরপর ড্র্যাগ করে তালিকা বদল করুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeaderChip label="নির্বাচিত" value={`${bn(selectedTotal)} জন`} />
              {showStatChips && <HeaderChip label="নির্ধারিত ফি" value={`৳${bn(fixedFee)}`} />}
              {showStatChips && <HeaderChip label="মোট বিষয়" value={bn(totalSubjects)} />}
            </div>
          </div>
        </header>

        {/* ============================================================
            ⭐ রিডিজাইন — ফিল্টার কার্ড + ধাপ নির্দেশক
        ============================================================ */}
        <FormProvider {...filterMethods}>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DefaultSelect
                label="Session"
                options={sessionOptions}
                valueField="value"
                nameField="name"
                registerKey="Session"
                onChange={handleSessionChange}
              />
              <DefaultSelect
                label="Exam"
                options={examOptions}
                valueField="value"
                nameField="name"
                registerKey="Exam"
                disabled={!session}
                onChange={handleExamChange}
              />
              <DefaultSelect
                label="Sub Class"
                options={subClassOptions}
                valueField="value"
                nameField="name"
                registerKey="SubClass"
                disabled={!examId}
                onChange={handleSubClassChange}
              />
            </div>
          </section>
        </FormProvider>

        {feeBlocked && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            {feeBlockedMsg}
          </div>
        )}

        {apiError && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            {apiError}
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start w-full">
          <ListPanel
            title="যাদের ফি নিবেন তাদের নির্বাচন করুন"
            titleColor="text-slate-800"
            rows={unpaidComputed}
            totalCount={unpaid.length}
            checkedSet={unpaidChecked}
            onToggleAll={toggleUnpaidAll}
            onToggleOne={toggleUnpaidOne}
            filter={unpaidFilter}
            onFilterChange={setUnpaidFilter}
            totals={unpaidTotals}
            onDeductionChange={(id, v) => updateDeduction("unpaid", id, v)}
            filterLabel="ফিল্টার"
            filterLabelColor="text-slate-500"
            side="unpaid"
            onRowDragStart={handleRowDragStart}
            onRowDragEnd={handleRowDragEnd}
            onPanelDragOver={handlePanelDragOver("unpaid")}
            onPanelDragLeave={handlePanelDragLeave("unpaid")}
            onPanelDrop={handlePanelDrop("unpaid")}
            isDragTarget={dragOverSide === "unpaid"}
            draggingIds={dragInfo?.side === "unpaid" ? dragInfo.ids : []}
            emptyText={emptyText}
            busy={busy}
            editable
            showStatChips={showStatChips}
            accent="violet"
          />

          {/* ⭐ বাম ↔ ডান মুভ করার অ্যারো বাটন */}
          <div className="flex flex-col lg:flex-col items-center justify-center gap-3 lg:self-center lg:py-6">
            <button
              type="button"
              title="নির্বাচিত শিক্ষার্থীদের ডান পাশে নিন"
              onClick={() => moveIdsToPaid(Array.from(unpaidChecked))}
              disabled={busy || unpaidChecked.size === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#6D3BEF] to-[#22B8F0] text-white shadow-md shadow-[#6D3BEF]/20 transition hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:brightness-100"
            >
              {/* এখানে rotate-90 যোগ করা হয়েছে */}
              <svg className="w-5 h-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </button>

            <button
              type="button"
              title="নির্বাচিত শিক্ষার্থীদের বাম পাশে ফেরত পাঠান"
              onClick={() => moveIdsToUnpaid(Array.from(paidChecked))}
              disabled={busy || paidChecked.size === 0}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-[#6D3BEF]/25 bg-white text-[#6D3BEF] shadow-sm transition hover:bg-[#6D3BEF] hover:text-white active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#6D3BEF]"
            >
              {/* এখানে -rotate-90 যোগ করা হয়েছে */}
              <svg className="w-5 h-5 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 6 5 12 11 18" />
              </svg>
            </button>
          </div>

          <ListPanel
            title="নিম্নোক্ত শিক্ষার্থীদের ফি গ্রহণ করা হয়েছে"
            titleColor="text-slate-800"
            rows={paidComputed}
            totalCount={paid.length}
            checkedSet={paidChecked}
            onToggleAll={togglePaidAll}
            onToggleOne={togglePaidOne}
            filter={paidFilter}
            onFilterChange={setPaidFilter}
            totals={paidTotals}
            onDeductionChange={(id, v) => updateDeduction("paid", id, v)}
            filterLabel="ফিল্টার"
            filterLabelColor="text-slate-500"
            side="paid"
            onRowDragStart={handleRowDragStart}
            onRowDragEnd={handleRowDragEnd}
            onPanelDragOver={handlePanelDragOver("paid")}
            onPanelDragLeave={handlePanelDragLeave("paid")}
            onPanelDrop={handlePanelDrop("paid")}
            isDragTarget={dragOverSide === "paid"}
            draggingIds={dragInfo?.side === "paid" ? dragInfo.ids : []}
            emptyText={emptyText}
            busy={busy}
            showStatChips={showStatChips}
            accent="cyan"
          />
        </section>

        {/* ⭐ রিডিজাইন — টোস্ট (আগে state ছিল কিন্তু দেখানো হতো না) */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D3BEF] to-[#22B8F0] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6D3BEF]/25">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
