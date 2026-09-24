import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";              // ← লাইন ১
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

// legacy UI-র মতোই সবসময় ১৪টা বিষয়ের সারি — এখন আর "মোট বিষয়" সংখ্যার সাথে বাঁধা না
const SUBJECT_COUNT = 14;

// old code-এর মতোই bn() — একই কনভেনশন
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
const toRow = (id, user) => ({
  id,
  code: user?.UserCode ?? "",
  name: user?.UserName ? user.UserName : "",
  deduction: 0,
});

function computeRows(rows, fee) {
  let assigned = 0, deduction = 0, net = 0;
  const computed = rows.map((s) => {
    const rowNet = Math.max(fee - (Number(s.deduction) || 0), 0);
    assigned += fee;
    deduction += Number(s.deduction) || 0;
    net += rowNet;
    return { ...s, assigned: fee, net: rowNet };
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
   Small UI bits (old code-এর Checkbox/SectionTitle pattern অনুসরণ করে)
--------------------------------------------------------- */

function Checkbox({ checked, onChange, label, disabled }) {
  return (
    <label className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
      <span
        onMouseDown={(e) => e.stopPropagation()}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-[#1B3A57] border-[#1B3A57]" : "bg-white border-slate-300 hover:border-slate-400"
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

function StatChip({ label, value }) {
  return (
    <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
      <span className="text-sm font-medium text-slate-800">{label}:</span>
      <span className="text-sm font-semibold text-slate-800">৳{bn(value)}</span>
    </div>
  );
}

const selectClass = "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]";
const inputClass = "border border-slate-300 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]";

/* ---------------------------------------------------------
   List panel — বামে "যাদের ফি নিবেন", ডানে "ফি গ্রহণ করা হয়েছে"
   এখন drag & drop টার্গেট + সোর্স — সিলেক্টেড রো টেনে অন্য পাশে ছাড়লেই মুভ হয়
--------------------------------------------------------- */

function ListPanel({
  title, titleColor, rows, totalCount, checkedSet, onToggleAll, onToggleOne,
  filter, onFilterChange, totals, onDeductionChange, filterLabel, filterLabelColor,
  side, onRowDragStart, onRowDragEnd, onPanelDragOver, onPanelDragLeave, onPanelDrop,
  isDragTarget, draggingIds, emptyText, busy,
}) {
  const allChecked = rows.length > 0 && rows.every((r) => checkedSet.has(r.id));

  return (
    <div
      onDragOver={onPanelDragOver}
      onDragLeave={onPanelDragLeave}
      onDrop={onPanelDrop}
      className={`bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden w-full transition-colors ${
        isDragTarget ? "border-[#1B3A57] ring-2 ring-[#1B3A57]/30" : "border-slate-200"
      }`}
    >
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className={`text-[16px] font-bold leading-snug ${titleColor}`}>{title}</h1>
          <span className="h-[38px] flex items-center border border-stroke rounded bg-white px-4 whitespace-nowrap shrink-0 text-sm font-semibold text-slate-800">
            {bn(totalCount)} জন
          </span>
        </div>

        {/* Stat chips + Search bar একসাথে */}
        <div className="flex items-center gap-2 mt-3 flex-wra">
          <StatChip label="নির্ধারিত" value={totals.assigned} />
          <StatChip label="কর্তন" value={totals.deduction} />
          <StatChip label="জমা" value={totals.net} />

          <div className="flex items-center gap-1.5 ml-auto">
            {filterLabel && <span className={`text-sm font-semibold ${filterLabelColor}`}>{filterLabel}</span>}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SvgIcon name="FiSearch" size={14} />
              </span>
              <input
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
                placeholder="নাম / আইডি খুঁজুন"
                className="h-[38px] pl-8 pr-4 text-sm font-medium border border-stroke rounded bg-white w-10 sm:w-40 outline-none transition focus:border-custom-focus"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`overflow-auto max-h-80 transition-opacity ${busy ? "opacity-60" : ""}`}>
        <table className="w-full min-w-[560px] text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs tracking-wide z-10">
            <tr>
              <th className="px-3 py-2.5 text-left w-8">
                <Checkbox checked={allChecked} onChange={onToggleAll} />
              </th>
              <th className="px-3 py-2.5 text-left">আইডি</th>
              <th className="px-3 py-2.5 text-left">শিক্ষার্থীর নাম</th>
              <th className="px-3 py-2.5 text-left">নির্ধারিত</th>
              <th className="px-3 py-2.5 text-left">কর্তন</th>
              <th className="px-3 py-2.5 text-left">জমা</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-400 italic py-8 text-sm">
                  {isDragTarget ? "এখানে ছেড়ে দিন" : emptyText || "কোনো শিক্ষার্থী পাওয়া যায়নি"}
                </td>
              </tr>
            ) : (
              rows.map((s) => {
                const checked = checkedSet.has(s.id);
                const isDragging = draggingIds.includes(s.id);
                return (
                  <tr
                    key={s.id}
                    draggable={!busy}
                    onDragStart={onRowDragStart(side, s.id)}
                    onDragEnd={onRowDragEnd}
                    title="ড্র্যাগ করে অন্য পাশে ছেড়ে দিন"
                    className={`border-b border-slate-50 last:border-0 transition-colors select-none ${
                      busy ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
                    } ${checked ? "bg-[#1B3A57]/5" : "hover:bg-slate-50"} ${isDragging ? "opacity-40" : ""}`}
                  >
                    <td className="px-3 py-3">
                      <Checkbox checked={checked} onChange={(v) => onToggleOne(s.id, v)} />
                    </td>
                    <td className="px-3 py-3 font-mono ">{bn(s.code || s.id)}</td>
                    <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{s.name}</td>
                    <td className="px-3 py-3 text-slate-800">{bn(s.assigned)}</td>
                    <td className="px-3 py-3 text-slate-800">{bn(s.deduction)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{bn(s.net)}</td>
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
  // ফিল্টার এখন ID রাখে — session = SessionID, examId = ExamID, subClass = SubClassID
  const [session, setSession] = useState(null);
  const [examId, setExamId] = useState(null);
  const [subClass, setSubClass] = useState(null);

  const [subjects, setSubjects] = useState(
  Array.from({ length: SUBJECT_COUNT }, () => ({ name: "", fee: "" }))
);

  /* ---------------- Cascading ফিল্টার: শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস ---------------- */
  const { data: filterData } = useGetExamStudentListFiltersQuery();
  const sessionTree = useMemo(() => filterData?.sessions || [], [filterData]);

  // ১) শিক্ষাবর্ষ
  const sessionOptions = useMemo(
    () => sessionTree.map((s) => ({ value: s.SessionID, name: s.SessionName })),
    [sessionTree]
  );

  // ২) নির্বাচিত শিক্ষাবর্ষের নিচের পরীক্ষাগুলো
  const selectedSession = useMemo(
    () => sessionTree.find((s) => String(s.SessionID) === String(session)),
    [sessionTree, session]
  );
  const examOptions = useMemo(
    () =>
      (selectedSession?.exams || []).map((e) => ({
        value: e.ExamID,
        name: e.ExamName ? e.ExamName : "",
      })),
    [selectedSession]
  );

  // ৩) নির্বাচিত পরীক্ষার নিচের সাব ক্লাসগুলো
  const selectedExam = useMemo(
    () => (selectedSession?.exams || []).find((e) => String(e.ExamID) === String(examId)),
    [selectedSession, examId]
  );
  const subClassOptions = useMemo(
    () =>
      (selectedExam?.subClasses || []).map((c) => ({
        value: c.SubClassID,
        name: c.SubClass ? c.SubClass : "",
      })),
    [selectedExam]
  );

  // উপরের লেভেল বদলালে নিচের লেভেলগুলো রিসেট
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

  // filterMethods-এ Fee আর TotalSubjects যোগ
  const filterMethods = useForm({
    defaultValues: {
      Session: "",
      Exam: "",
      SubClass: "",
      Fee: 200, 
      TotalSubjects: 0,
    },
  });

  // form → state sync
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
  // বাম = Student_Admission (Student_Result-এ নেই এমন), ডান = Student_Result
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

  // API কল চলাকালীন ড্র্যাগ বন্ধ — যাতে রিফ্রেশের আগে ভুল ID নিয়ে আবার মুভ না হয়
  const busy = isAdding || isRemoving || isListFetching;

  const [unpaid, setUnpaid] = useState([]);
  const [paid, setPaid] = useState([]);

  const [unpaidChecked, setUnpaidChecked] = useState(new Set());
  const [paidChecked, setPaidChecked] = useState(new Set());
  const [unpaidFilter, setUnpaidFilter] = useState("");
  const [paidFilter, setPaidFilter] = useState("");

  const [toast, setToast] = useState(null);
  const [apiError, setApiError] = useState(null);

  // API ডাটা → লোকাল state (প্রতিবার রিফেচের পর আসল ID দিয়ে রিসেট)
  useEffect(() => {
    setUnpaid((listData?.available || []).map((a) => toRow(a.AdmissionID, a.User)));
    setPaid((listData?.added || []).map((r) => toRow(r.ID, r.User)));
    setUnpaidChecked(new Set());
    setPaidChecked(new Set());
    filterMethods.setValue("TotalSubjects", listData?.subjectCount ?? 0);
  }, [listData, filterMethods]);

  // ফিল্টার বদলালে পুরনো এরর মুছে যাবে
  useEffect(() => {
    setApiError(null);
  }, [session, examId, subClass]);

  /* ---------------- বিষয়ভিত্তিক ফি ---------------- */
  const updateSubject = (idx, field, value) => {
    setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  /* ---------------- কর্তন এডিট ---------------- */
  const updateDeduction = (side, id, value) => {
    let v = parseInt(value, 10);
    if (isNaN(v) || v < 0) v = 0;
    if (v > fixedFee) v = fixedFee;
    const setter = side === "unpaid" ? setUnpaid : setPaid;
    setter((prev) => prev.map((s) => (s.id === id ? { ...s, deduction: v } : s)));
  };

  /* ---------------- ফিল্টার + টোটাল ---------------- */
  const unpaidRows = useMemo(() => unpaid.filter((s) => matchesFilter(s, unpaidFilter)), [unpaid, unpaidFilter]);
  const paidRows = useMemo(() => paid.filter((s) => matchesFilter(s, paidFilter)), [paid, paidFilter]);

  const { computed: unpaidComputed, totals: unpaidTotals } = useMemo(
    () => computeRows(unpaidRows, fixedFee),
    [unpaidRows, fixedFee]
  );
  const { computed: paidComputed, totals: paidTotals } = useMemo(
    () => computeRows(paidRows, fixedFee),
    [paidRows, fixedFee]
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

  /* ---------------- নির্দিষ্ট id-লিস্ট এক পাশ থেকে অন্য পাশে move করার জেনেরিক ফাংশন ---------------- */

  // বাম → ডান: Student_Result-এ INSERT (ids = AdmissionID)
  const moveIdsToPaid = async (ids) => {
    const idSet = new Set(ids);
    const moving = unpaid.filter((s) => idSet.has(s.id));
    if (moving.length === 0 || !filtersReady) return;

    setApiError(null);
    try {
      await addExamStudents({
        SessionID: session,
        ExamID: examId,
        SubClassID: subClass,
        AdmissionIDs: moving.map((s) => s.id),
      }).unwrap();
    } catch (err) {
      setApiError(err?.data?.detail || err?.data?.error || "শিক্ষার্থী যোগ করা যায়নি");
      return;
    }

    // সফল হলে সাথে সাথে UI-তে দেখাও — রিফেচ এলে আসল Student_Result ID দিয়ে রিসেট হবে
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

  // ডান → বাম: Student_Result থেকে DELETE (ids = Student_Result.ID) — Student_Admission অপরিবর্তিত
  const moveIdsToUnpaid = async (ids) => {
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
      setApiError(err?.data?.detail || err?.data?.error || "শিক্ষার্থী সরানো যায়নি");
      return;
    }

    setPaid((prev) => prev.filter((s) => !idSet.has(s.id)));
    setUnpaid((prev) => [...prev, ...moving]);
    setPaidChecked((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setToast(`${bn(moving.length)} জন শিক্ষার্থীকে পুনরায় তালিকায় ফেরত পাঠানো হয়েছে`);
    setTimeout(() => setToast(null), 2600);
  };

  const selectedTotal = unpaidChecked.size + paidChecked.size;

  /* ---------------- Drag & Drop — কোনো বাটন ছাড়াই মাউস দিয়ে ধরে এক পাশ থেকে অন্য পাশে নেওয়া ---------------- */
  const [dragInfo, setDragInfo] = useState(null); // { side: "unpaid" | "paid", ids: number[] } | null
  const [dragOverSide, setDragOverSide] = useState(null);

  const handleRowDragStart = (side, id) => (e) => {
    if (busy) {
      e.preventDefault();
      return;
    }
    // রো-টা আগে থেকে সিলেক্ট করা থাকলে পুরো সিলেকশনটাই টানা হবে, নাহলে শুধু ওই একজন
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

  // খালি টেবিলে কী লেখা দেখাবে — ধাপে ধাপে গাইড
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

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden bg-slate-50 p-4 sm:p-6"
      style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-5 flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">পরীক্ষার্থী তালিকা</h1>
            <p className="text-sm sm:text-base">শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস ধাপে ধাপে নির্বাচন করুন — এরপর সিলেক্ট করে ড্র্যাগ করলেই এক তালিকা থেকে অন্য তালিকায় চলে যাবে</p>
          </div>
        </header>

        {/* Filters — cascading: শিক্ষাবর্ষ → পরীক্ষা → সাব ক্লাস */}
        <FormProvider {...filterMethods}>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4">
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

        {/* Fee — StatChip-এর মতোই দেখতে */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
              <span className="text-sm font-medium text-slate-800">নির্ধারিত ফি:</span>
              <span className="text-sm font-semibold text-slate-800">{bn(fixedFee)}</span>
            </div>

            <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
              <span className="text-sm font-medium text-slate-800">মোট বিষয়:</span>
              <span className="text-sm font-semibold text-slate-800">{bn(totalSubjects)}</span>
            </div>
          </div>
        </section>

        {/* API এরর */}
        {apiError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {apiError}
          </div>
        )}

        {/* Dual panel — বাটন/ড্রপডাউন ছাড়াই, ড্র্যাগ করে এক পাশ থেকে অন্য পাশে নেওয়া যায় */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
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
            filterLabel="Filter"
            filterLabelColor="text-slate-800"
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
          />

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
            filterLabel="Filter"
            filterLabelColor="text-slate-800"
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
          />
        </section>
      </div>

    </div>
  );
}































// import { useState, useMemo, useEffect } from "react";
// import { useForm, FormProvider, useWatch } from "react-hook-form";              // ← লাইন ১
// import DefaultSelect from "../components/Forms/DefaultSelect";
// import DefaultInput from "../components/Forms/DefaultInput";
// import SvgIcon from "../components/icons/SvgIcon";
// import {
//   useGetExamStudentListFiltersQuery,
//   useGetExamStudentListQuery,
//   useAddExamStudentsMutation,
//   useRemoveExamStudentsMutation,
// } from "../features/exam/examQuerySlice";

// /* ---------------------------------------------------------
//    Static definitions
// --------------------------------------------------------- */

// // legacy UI-র মতোই সবসময় ১৪টা বিষয়ের সারি — এখন আর "মোট বিষয়" সংখ্যার সাথে বাঁধা না
// const SUBJECT_COUNT = 14;

// // old code-এর মতোই bn() — একই কনভেনশন
// const bn = (num) => {
//   if (num === "" || num === null || num === undefined) return "";
//   const d = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
//   return num.toString().replace(/\d/g, (x) => d[x]);
// };

// /* ---------------------------------------------------------
//    Pure helpers
// --------------------------------------------------------- */

// // API রেসপন্স → প্যানেলের রো।
// // বাম পাশে id = Student_Admission.AdmissionID, ডান পাশে id = Student_Result.ID
// // ⚠️ User মডেলের কলাম নাম (UserCode / UserName) আলাদা হলে এখানে আর
// //    ব্যাকএন্ডের EXAM_STUDENT_USER_ATTRS-এ একসাথে বদলাও
// const toRow = (id, user) => ({
//   id,
//   code: user?.UserCode ?? "",
//   name: user?.UserName ? (user.UserName) : "",
//   deduction: 0,
// });

// function computeRows(rows, fee) {
//   let assigned = 0, deduction = 0, net = 0;
//   const computed = rows.map((s) => {
//     const rowNet = Math.max(fee - (Number(s.deduction) || 0), 0);
//     assigned += fee;
//     deduction += Number(s.deduction) || 0;
//     net += rowNet;
//     return { ...s, assigned: fee, net: rowNet };
//   });
//   return { computed, totals: { assigned, deduction, net } };
// }

// function matchesFilter(s, filter) {
//   if (!filter.trim()) return true;
//   const q = filter.trim().toLowerCase();
//   return (
//     (s.name || "").toLowerCase().includes(q) ||
//     String(s.code ?? "").toLowerCase().includes(q) ||
//     String(s.id).includes(q)
//   );
// }

// /* ---------------------------------------------------------
//    Small UI bits (old code-এর Checkbox/SectionTitle pattern অনুসরণ করে)
// --------------------------------------------------------- */

// function Checkbox({ checked, onChange, label, disabled }) {
//   return (
//     <label className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
//       <span
//         onMouseDown={(e) => e.stopPropagation()}
//         onClick={() => !disabled && onChange(!checked)}
//         className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
//           checked ? "bg-[#1B3A57] border-[#1B3A57]" : "bg-white border-slate-300 hover:border-slate-400"
//         }`}
//       >
//         {checked && (
//           <svg
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="white"
//             strokeWidth="4"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             className="w-3 h-3 block"
//           >
//             <polyline points="20 6 9 17 4 12" />
//           </svg>
//         )}
//       </span>
//       {label && <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{label}</span>}
//     </label>
//   );
// }

// function Field({ label, icon, children }) {
//   return (
//     <div>
//       <label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5">
//         <span className="text-[#8B2635]">
//           <SvgIcon name={icon} size={16} />
//         </span>
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// function StatChip({ label, value }) {
//   return (
//     <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
//       <span className="text-sm font-medium text-slate-800">{label}:</span>
//       <span className="text-sm font-semibold text-slate-800">৳{bn(value)}</span>
//     </div>
//   );
// }

// const selectClass = "w-full border border-slate-300 rounded-xl px-3 py-2.5 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]";
// const inputClass = "border border-slate-300 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-[#1B3A57]/30 focus:border-[#1B3A57]";

// /* ---------------------------------------------------------
//    List panel — বামে "যাদের ফি নিবেন", ডানে "ফি গ্রহণ করা হয়েছে"
//    এখন drag & drop টার্গেট + সোর্স — সিলেক্টেড রো টেনে অন্য পাশে ছাড়লেই মুভ হয়
// --------------------------------------------------------- */

// function ListPanel({
//   title, titleColor, rows, totalCount, checkedSet, onToggleAll, onToggleOne,
//   filter, onFilterChange, totals, onDeductionChange, filterLabel, filterLabelColor,
//   side, onRowDragStart, onRowDragEnd, onPanelDragOver, onPanelDragLeave, onPanelDrop,
//   isDragTarget, draggingIds, emptyText, busy,
// }) {
//   const allChecked = rows.length > 0 && rows.every((r) => checkedSet.has(r.id));

//   return (
//     <div
//       onDragOver={onPanelDragOver}
//       onDragLeave={onPanelDragLeave}
//       onDrop={onPanelDrop}
//       className={`bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden w-full transition-colors ${
//         isDragTarget ? "border-[#1B3A57] ring-2 ring-[#1B3A57]/30" : "border-slate-200"
//       }`}
//     >
//       <div className="p-4 border-b border-slate-100">
//         <div className="flex items-start justify-between gap-2 mb-3">
//           <h1 className={`text-[16px] font-bold leading-snug ${titleColor}`}>{title}</h1>
//           <span className="h-[38px] flex items-center border border-stroke rounded bg-white px-4 whitespace-nowrap shrink-0 text-sm font-semibold text-slate-800">
//             {bn(totalCount)} জন
//           </span>
//         </div>

//         {/* Stat chips + Search bar একসাথে */}
//         <div className="flex items-center gap-2 mt-3 flex-wra">
//           <StatChip label="নির্ধারিত" value={totals.assigned} />
//           <StatChip label="কর্তন" value={totals.deduction} />
//           <StatChip label="জমা" value={totals.net} />

//           <div className="flex items-center gap-1.5 ml-auto">
//             {filterLabel && <span className={`text-sm font-semibold ${filterLabelColor}`}>{filterLabel}</span>}
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                 <SvgIcon name="FiSearch" size={14} />
//               </span>
//               <input
//                 value={filter}
//                 onChange={(e) => onFilterChange(e.target.value)}
//                 placeholder="নাম / আইডি খুঁজুন"
//                 className="h-[38px] pl-8 pr-4 text-sm font-medium border border-stroke rounded bg-white w-10 sm:w-40 outline-none transition focus:border-custom-focus"
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className={`overflow-auto max-h-80 transition-opacity ${busy ? "opacity-60" : ""}`}>
//         <table className="w-full min-w-[560px] text-sm">
//           <thead className="sticky top-0 bg-slate-50 text-xs tracking-wide z-10">
//             <tr>
//               <th className="px-3 py-2.5 text-left w-8">
//                 <Checkbox checked={allChecked} onChange={onToggleAll} />
//               </th>
//               <th className="px-3 py-2.5 text-left">আইডি</th>
//               <th className="px-3 py-2.5 text-left">শিক্ষার্থীর নাম</th>
//               <th className="px-3 py-2.5 text-left">নির্ধারিত</th>
//               <th className="px-3 py-2.5 text-left">কর্তন</th>
//               <th className="px-3 py-2.5 text-left">জমা</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center text-slate-400 italic py-8 text-sm">
//                   {isDragTarget ? "এখানে ছেড়ে দিন" : emptyText || "কোনো শিক্ষার্থী পাওয়া যায়নি"}
//                 </td>
//               </tr>
//             ) : (
//               rows.map((s) => {
//                 const checked = checkedSet.has(s.id);
//                 const isDragging = draggingIds.includes(s.id);
//                 return (
//                   <tr
//                     key={s.id}
//                     draggable={!busy}
//                     onDragStart={onRowDragStart(side, s.id)}
//                     onDragEnd={onRowDragEnd}
//                     title="ড্র্যাগ করে অন্য পাশে ছেড়ে দিন"
//                     className={`border-b border-slate-50 last:border-0 transition-colors select-none ${
//                       busy ? "cursor-wait" : "cursor-grab active:cursor-grabbing"
//                     } ${checked ? "bg-[#1B3A57]/5" : "hover:bg-slate-50"} ${isDragging ? "opacity-40" : ""}`}
//                   >
//                     <td className="px-3 py-3">
//                       <Checkbox checked={checked} onChange={(v) => onToggleOne(s.id, v)} />
//                     </td>
//                     <td className="px-3 py-3 font-mono ">{bn(s.code || s.id)}</td>
//                     <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{s.name}</td>
//                     <td className="px-3 py-3 text-slate-800">{bn(s.assigned)}</td>
//                     <td className="px-3 py-3 text-slate-800">{bn(s.deduction)}</td>
//                     <td className="px-3 py-3 font-semibold text-slate-800">{bn(s.net)}</td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// /* ---------------------------------------------------------
//    Main component
// --------------------------------------------------------- */

// export default function ExamStudentList() {
//   // ফিল্টার এখন ID রাখে — session = SessionID, examId = ExamID, subClass = SubClassID
//   const [session, setSession] = useState(null);
//   const [examId, setExamId] = useState(null);
//   const [subClass, setSubClass] = useState(null);

//   const [subjects, setSubjects] = useState(
//   Array.from({ length: SUBJECT_COUNT }, () => ({ name: "", fee: "" }))
// );

//   /* ---------------- ডাইনামিক ফিল্টার অপশন — Academic_Session / Exam_Name / Academic_Subject ---------------- */
//   const { data: filterData } = useGetExamStudentListFiltersQuery();

//   const sessionOptions = useMemo(
//     () => (filterData?.sessions || []).map((s) => ({ value: s.SessionID, name: s.SessionName })),
//     [filterData]
//   );
//   const examOptions = useMemo(
//     () =>
//       (filterData?.exams || []).map((e) => ({
//         value: e.ExamID,
//         name: e.ExamName ? (e.ExamName) : "",
//       })),
//     [filterData]
//   );
//   const subClassOptions = useMemo(
//     () =>
//       (filterData?.subClasses || []).map((c) => ({
//         value: c.SubClassID,
//         name: c.SubClass ? (c.SubClass) : "",
//       })),
//     [filterData]
//   );

//   // filterMethods-এ Fee আর TotalSubjects যোগ
//   const filterMethods = useForm({
//     defaultValues: {
//       Session: "",
//       Exam: "",
//       SubClass: "",
//       Fee: 200, 
//       TotalSubjects: 0,
//     },
//   });

//   // form → state sync
//   const watchedFee = useWatch({ control: filterMethods.control, name: "Fee" });
//   const watchedTotalSubjects = useWatch({ control: filterMethods.control, name: "TotalSubjects" });
//   const fixedFee = Number(watchedFee) || 0;
//   const totalSubjects = Number(watchedTotalSubjects) || 0;

//   useEffect(() => {
//     filterMethods.setValue("Session", session ?? "");
//   }, [session, filterMethods]);

//   useEffect(() => {
//     filterMethods.setValue("Exam", examId ?? "");
//   }, [examId, filterMethods]);

//   useEffect(() => {
//     filterMethods.setValue("SubClass", subClass ?? "");
//   }, [subClass, filterMethods]);

//   /* ---------------- পরীক্ষার্থী তালিকা API ---------------- */
//   // বাম = Student_Admission (Student_Result-এ নেই এমন), ডান = Student_Result
//   const filtersReady = Boolean(session && examId && subClass);
//   const {
//     currentData: listData,
//     isFetching: isListFetching,
//     isError: isListError,
//   } = useGetExamStudentListQuery(
//     { SessionID: session, ExamID: examId, SubClassID: subClass },
//     { skip: !filtersReady }
//   );
//   const [addExamStudents, { isLoading: isAdding }] = useAddExamStudentsMutation();
//   const [removeExamStudents, { isLoading: isRemoving }] = useRemoveExamStudentsMutation();

//   // API কল চলাকালীন ড্র্যাগ বন্ধ — যাতে রিফ্রেশের আগে ভুল ID নিয়ে আবার মুভ না হয়
//   const busy = isAdding || isRemoving || isListFetching;

//   const [unpaid, setUnpaid] = useState([]);
//   const [paid, setPaid] = useState([]);

//   const [unpaidChecked, setUnpaidChecked] = useState(new Set());
//   const [paidChecked, setPaidChecked] = useState(new Set());
//   const [unpaidFilter, setUnpaidFilter] = useState("");
//   const [paidFilter, setPaidFilter] = useState("");

//   const [toast, setToast] = useState(null);
//   const [apiError, setApiError] = useState(null);

//   // API ডাটা → লোকাল state (প্রতিবার রিফেচের পর আসল ID দিয়ে রিসেট)
//   useEffect(() => {
//     setUnpaid((listData?.available || []).map((a) => toRow(a.AdmissionID, a.User)));
//     setPaid((listData?.added || []).map((r) => toRow(r.ID, r.User)));
//     setUnpaidChecked(new Set());
//     setPaidChecked(new Set());
//     filterMethods.setValue("TotalSubjects", listData?.subjectCount ?? 0);
//   }, [listData, filterMethods]);

//   // ফিল্টার বদলালে পুরনো এরর মুছে যাবে
//   useEffect(() => {
//     setApiError(null);
//   }, [session, examId, subClass]);

//   /* ---------------- বিষয়ভিত্তিক ফি ---------------- */
//   const updateSubject = (idx, field, value) => {
//     setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
//   };

//   /* ---------------- কর্তন এডিট ---------------- */
//   const updateDeduction = (side, id, value) => {
//     let v = parseInt(value, 10);
//     if (isNaN(v) || v < 0) v = 0;
//     if (v > fixedFee) v = fixedFee;
//     const setter = side === "unpaid" ? setUnpaid : setPaid;
//     setter((prev) => prev.map((s) => (s.id === id ? { ...s, deduction: v } : s)));
//   };

//   /* ---------------- ফিল্টার + টোটাল ---------------- */
//   const unpaidRows = useMemo(() => unpaid.filter((s) => matchesFilter(s, unpaidFilter)), [unpaid, unpaidFilter]);
//   const paidRows = useMemo(() => paid.filter((s) => matchesFilter(s, paidFilter)), [paid, paidFilter]);

//   const { computed: unpaidComputed, totals: unpaidTotals } = useMemo(
//     () => computeRows(unpaidRows, fixedFee),
//     [unpaidRows, fixedFee]
//   );
//   const { computed: paidComputed, totals: paidTotals } = useMemo(
//     () => computeRows(paidRows, fixedFee),
//     [paidRows, fixedFee]
//   );

//   /* ---------------- সিলেকশন ---------------- */
//   const toggleUnpaidAll = (checked) => {
//     setUnpaidChecked((prev) => {
//       const next = new Set(prev);
//       unpaidRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
//       return next;
//     });
//   };
//   const togglePaidAll = (checked) => {
//     setPaidChecked((prev) => {
//       const next = new Set(prev);
//       paidRows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)));
//       return next;
//     });
//   };
//   const toggleUnpaidOne = (id, checked) => {
//     setUnpaidChecked((prev) => {
//       const next = new Set(prev);
//       checked ? next.add(id) : next.delete(id);
//       return next;
//     });
//   };
//   const togglePaidOne = (id, checked) => {
//     setPaidChecked((prev) => {
//       const next = new Set(prev);
//       checked ? next.add(id) : next.delete(id);
//       return next;
//     });
//   };

//   /* ---------------- নির্দিষ্ট id-লিস্ট এক পাশ থেকে অন্য পাশে move করার জেনেরিক ফাংশন ---------------- */

//   // বাম → ডান: Student_Result-এ INSERT (ids = AdmissionID)
//   const moveIdsToPaid = async (ids) => {
//     const idSet = new Set(ids);
//     const moving = unpaid.filter((s) => idSet.has(s.id));
//     if (moving.length === 0 || !filtersReady) return;

//     setApiError(null);
//     try {
//       await addExamStudents({
//         SessionID: session,
//         ExamID: examId,
//         SubClassID: subClass,
//         AdmissionIDs: moving.map((s) => s.id),
//       }).unwrap();
//     } catch (err) {
//       setApiError(err?.data?.error || "শিক্ষার্থী যোগ করা যায়নি");
//       return;
//     }

//     // সফল হলে সাথে সাথে UI-তে দেখাও — রিফেচ এলে আসল Student_Result ID দিয়ে রিসেট হবে
//     setUnpaid((prev) => prev.filter((s) => !idSet.has(s.id)));
//     setPaid((prev) => [...prev, ...moving]);
//     setUnpaidChecked((prev) => {
//       const next = new Set(prev);
//       idSet.forEach((id) => next.delete(id));
//       return next;
//     });
//     setToast(`${bn(moving.length)} জন শিক্ষার্থীর ফি আদায় তালিকায় যোগ হয়েছে`);
//     setTimeout(() => setToast(null), 2600);
//   };

//   // ডান → বাম: Student_Result থেকে DELETE (ids = Student_Result.ID) — Student_Admission অপরিবর্তিত
//   const moveIdsToUnpaid = async (ids) => {
//     const idSet = new Set(ids);
//     const moving = paid.filter((s) => idSet.has(s.id));
//     if (moving.length === 0 || !filtersReady) return;

//     setApiError(null);
//     try {
//       await removeExamStudents({
//         SessionID: session,
//         ExamID: examId,
//         SubClassID: subClass,
//         ResultIDs: moving.map((s) => s.id),
//       }).unwrap();
//     } catch (err) {
//       setApiError(err?.data?.error || "শিক্ষার্থী সরানো যায়নি");
//       return;
//     }

//     setPaid((prev) => prev.filter((s) => !idSet.has(s.id)));
//     setUnpaid((prev) => [...prev, ...moving]);
//     setPaidChecked((prev) => {
//       const next = new Set(prev);
//       idSet.forEach((id) => next.delete(id));
//       return next;
//     });
//     setToast(`${bn(moving.length)} জন শিক্ষার্থীকে পুনরায় তালিকায় ফেরত পাঠানো হয়েছে`);
//     setTimeout(() => setToast(null), 2600);
//   };

//   const selectedTotal = unpaidChecked.size + paidChecked.size;

//   /* ---------------- Drag & Drop — কোনো বাটন ছাড়াই মাউস দিয়ে ধরে এক পাশ থেকে অন্য পাশে নেওয়া ---------------- */
//   const [dragInfo, setDragInfo] = useState(null); // { side: "unpaid" | "paid", ids: number[] } | null
//   const [dragOverSide, setDragOverSide] = useState(null);

//   const handleRowDragStart = (side, id) => (e) => {
//     if (busy) {
//       e.preventDefault();
//       return;
//     }
//     // রো-টা আগে থেকে সিলেক্ট করা থাকলে পুরো সিলেকশনটাই টানা হবে, নাহলে শুধু ওই একজন
//     const checkedSet = side === "unpaid" ? unpaidChecked : paidChecked;
//     const ids = checkedSet.has(id) ? Array.from(checkedSet) : [id];
//     setDragInfo({ side, ids });
//     e.dataTransfer.effectAllowed = "move";
//     try {
//       e.dataTransfer.setData("text/plain", String(id));
//     } catch (err) {
//       // কিছু ব্রাউজারে setData না দিলে drag শুরুই হয় না
//     }
//   };

//   const handleRowDragEnd = () => {
//     setDragInfo(null);
//     setDragOverSide(null);
//   };

//   const handlePanelDragOver = (side) => (e) => {
//     if (!dragInfo || dragInfo.side === side) return;
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//     setDragOverSide(side);
//   };

//   const handlePanelDragLeave = (side) => () => {
//     setDragOverSide((prev) => (prev === side ? null : prev));
//   };

//   const handlePanelDrop = (side) => (e) => {
//     e.preventDefault();
//     if (dragInfo && dragInfo.side !== side) {
//       if (side === "paid") moveIdsToPaid(dragInfo.ids);
//       else moveIdsToUnpaid(dragInfo.ids);
//     }
//     setDragInfo(null);
//     setDragOverSide(null);
//   };

//   // খালি টেবিলে কী লেখা দেখাবে
//   const emptyText = !filtersReady
//     ? "সেশন, পরীক্ষা ও সাব ক্লাস নির্বাচন করুন"
//     : isListError
//     ? "ডাটা লোড করা যায়নি"
//     : isListFetching && !listData
//     ? "লোড হচ্ছে..."
//     : "কোনো শিক্ষার্থী পাওয়া যায়নি";

//   return (
//     <div
//       className="w-full min-h-screen overflow-x-hidden bg-slate-50 p-4 sm:p-6"
//       style={{ fontFamily: "'Noto Sans Bengali','Kalpurush','SolaimanLipi',sans-serif" }}
//     >
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <header className="mb-5 flex items-center gap-3">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-800">পরীক্ষার্থী তালিকা</h1>
//             <p className="text-sm sm:text-base">সেশন, পরীক্ষা ও শ্রেণী অনুযায়ী শিক্ষার্থীদের ফি আদায় ব্যবস্থাপনা — সিলেক্ট করে ড্র্যাগ করলেই এক তালিকা থেকে অন্য তালিকায় চলে যাবে</p>
//           </div>
//         </header>

//         {/* Filters — other pages-এর সাথে consistent DefaultSelect, এখন ডাইনামিক */}
//         <FormProvider {...filterMethods}>
//           <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <DefaultSelect
//                 label="Session"
//                 options={sessionOptions}
//                 valueField="value"
//                 nameField="name"
//                 registerKey="Session"
//                 onChange={(opt) => opt && setSession(opt.value)}
//               />
//               <DefaultSelect
//                 label="Exam"
//                 options={examOptions}
//                 valueField="value"
//                 nameField="name"
//                 registerKey="Exam"
//                 onChange={(opt) => opt && setExamId(opt.value)}
//               />
//               <DefaultSelect
//                 label="Sub Class"
//                 options={subClassOptions}
//                 valueField="value"
//                 nameField="name"
//                 registerKey="SubClass"
//                 onChange={(opt) => opt && setSubClass(opt.value)}
//               />
//             </div>
//           </section>
//         </FormProvider>

//         {/* Fee — StatChip-এর মতোই দেখতে */}
//         <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-4">
//           <div className="flex flex-wrap items-center gap-4">
//             <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
//               <span className="text-sm font-medium text-slate-800">নির্ধারিত ফি:</span>
//               <span className="text-sm font-semibold text-slate-800">{bn(fixedFee)}</span>
//             </div>

//             <div className="h-[38px] flex items-center gap-1 border border-stroke rounded bg-white px-4 whitespace-nowrap">
//               <span className="text-sm font-medium text-slate-800">মোট বিষয়:</span>
//               <span className="text-sm font-semibold text-slate-800">{bn(totalSubjects)}</span>
//             </div>
//           </div>
//         </section>

//         {/* API এরর */}
//         {apiError && (
//           <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
//             {apiError}
//           </div>
//         )}

//         {/* Dual panel — বাটন/ড্রপডাউন ছাড়াই, ড্র্যাগ করে এক পাশ থেকে অন্য পাশে নেওয়া যায় */}
//         <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
//           <ListPanel
//             title="যাদের ফি নিবেন তাদের নির্বাচন করুন"
//             titleColor="text-slate-800"
//             rows={unpaidComputed}
//             totalCount={unpaid.length}
//             checkedSet={unpaidChecked}
//             onToggleAll={toggleUnpaidAll}
//             onToggleOne={toggleUnpaidOne}
//             filter={unpaidFilter}
//             onFilterChange={setUnpaidFilter}
//             totals={unpaidTotals}
//             onDeductionChange={(id, v) => updateDeduction("unpaid", id, v)}
//             filterLabel="Filter"
//             filterLabelColor="text-slate-800"
//             side="unpaid"
//             onRowDragStart={handleRowDragStart}
//             onRowDragEnd={handleRowDragEnd}
//             onPanelDragOver={handlePanelDragOver("unpaid")}
//             onPanelDragLeave={handlePanelDragLeave("unpaid")}
//             onPanelDrop={handlePanelDrop("unpaid")}
//             isDragTarget={dragOverSide === "unpaid"}
//             draggingIds={dragInfo?.side === "unpaid" ? dragInfo.ids : []}
//             emptyText={emptyText}
//             busy={busy}
//           />

//           <ListPanel
//             title="নিম্নোক্ত শিক্ষার্থীদের ফি গ্রহণ করা হয়েছে"
//             titleColor="text-slate-800"
//             rows={paidComputed}
//             totalCount={paid.length}
//             checkedSet={paidChecked}
//             onToggleAll={togglePaidAll}
//             onToggleOne={togglePaidOne}
//             filter={paidFilter}
//             onFilterChange={setPaidFilter}
//             totals={paidTotals}
//             onDeductionChange={(id, v) => updateDeduction("paid", id, v)}
//             filterLabel="Filter"
//             filterLabelColor="text-slate-800"
//             side="paid"
//             onRowDragStart={handleRowDragStart}
//             onRowDragEnd={handleRowDragEnd}
//             onPanelDragOver={handlePanelDragOver("paid")}
//             onPanelDragLeave={handlePanelDragLeave("paid")}
//             onPanelDrop={handlePanelDrop("paid")}
//             isDragTarget={dragOverSide === "paid"}
//             draggingIds={dragInfo?.side === "paid" ? dragInfo.ids : []}
//             emptyText={emptyText}
//             busy={busy}
//           />
//         </section>
//       </div>

//     </div>
//   );
// }
